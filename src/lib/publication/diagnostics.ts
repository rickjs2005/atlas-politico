// Diagnósticos do pipeline de dados. Cada um diz o arquivo, a entidade, o
// `id`, o campo e o motivo, e tem uma severidade com consequência definida:
//
//   erro       impede a geração. A saída anterior fica como estava e o build
//              da aplicação não acontece;
//   pendencia  pesquisa ou revisão em aberto. O registro fica fora da
//              publicação e aparece no relatório. Não impede nada;
//   aviso      algo a conferir que não tira nada da publicação.

import { compareText } from "@/lib/domain/order";
import type { ENTIDADES } from "@/lib/domain/schemas";

export const SEVERIDADES = ["erro", "pendencia", "aviso"] as const;
export type Severidade = (typeof SEVERIDADES)[number];

export type Entidade = (typeof ENTIDADES)[number];
export type DiagnosticEntity = Entidade | "edicao" | "importacao";

export type DiagnosticCode =
  // leitura dos arquivos
  | "json-ilegivel"
  | "arquivo-fora-do-contrato"
  | "edicao-ausente"
  | "formato-de-arquivo"
  // registro isolado
  | "estrutura"
  | "dado-sintetico"
  | "referencia-repetida"
  // entre registros
  | "id-duplicado"
  | "slug-duplicado"
  | "referencia-inexistente"
  | "referencia-fora-da-publicacao"
  | "data-apos-corte"
  | "fonte-incoerente"
  // decisões políticas
  | "mandato-de-outra-pessoa"
  | "fora-do-mandato"
  | "competencia-nao-confirmada"
  | "casa-diferente"
  | "voto-repetido"
  | "retificacao-incoerente"
  // conteúdo educativo do jogo
  | "referencia-de-outra-pessoa"
  | "ordem-indeterminada"
  | "posicao-repetida"
  | "marco-fora-do-periodo"
  // mídia
  | "midia-ausente"
  | "midia-invalida"
  | "midia-dimensoes"
  // estado editorial
  | "rascunho"
  | "nao-revisado"
  | "revisado-em-rascunhos"
  // manutenção
  | "rascunho-sem-pendencia"
  | "sem-uso"
  | "filiacoes-sobrepostas"
  | "sem-cobertura"
  | "fora-da-cobertura"
  | "alteracao-sem-registro"
  // conferência da saída
  | "saida-invalida";

export interface Diagnostic {
  severidade: Severidade;
  codigo: DiagnosticCode;
  /** Caminho a partir da raiz do projeto, como `content/published/fontes.json`. */
  arquivo: string;
  entidade: DiagnosticEntity | null;
  id: string | null;
  /** Campo dentro do registro, como `data.valor` ou `fontes[0].fonteId`. */
  campo: string | null;
  mensagem: string;
}

export const SEVERITY_LABELS: Record<Severidade, string> = {
  erro: "Erro",
  pendencia: "Pendência",
  aviso: "Aviso",
};

/** `["fontes", 0, "fonteId"]` vira `fontes[0].fonteId`. */
export function formatFieldPath(caminho: readonly PropertyKey[]): string | null {
  if (caminho.length === 0) return null;
  return caminho
    .map((parte, indice) =>
      typeof parte === "number" ? `[${parte}]` : `${indice === 0 ? "" : "."}${String(parte)}`,
    )
    .join("");
}

/** Uma linha por diagnóstico: `arquivo · entidade "id" · campo: motivo`. */
export function formatDiagnostic(diagnostico: Diagnostic): string {
  const { arquivo, entidade, id, campo, mensagem } = diagnostico;
  const partes = [arquivo];
  if (entidade !== null) partes.push(id === null ? entidade : `${entidade} "${id}"`);
  if (campo !== null) partes.push(campo);
  return `${partes.join(" · ")}: ${mensagem}`;
}

const ORDEM: Record<Severidade, number> = { erro: 0, pendencia: 1, aviso: 2 };

/** Ordem estável: severidade, arquivo, `id`, campo e código. */
export function sortDiagnostics(diagnosticos: readonly Diagnostic[]): Diagnostic[] {
  return [...diagnosticos].sort(
    (a, b) =>
      ORDEM[a.severidade] - ORDEM[b.severidade] ||
      compareText(a.arquivo, b.arquivo) ||
      compareText(a.id ?? "", b.id ?? "") ||
      compareText(a.campo ?? "", b.campo ?? "") ||
      compareText(a.codigo, b.codigo) ||
      compareText(a.mensagem, b.mensagem),
  );
}

export function countBySeverity(diagnosticos: readonly Diagnostic[]): Record<Severidade, number> {
  const total: Record<Severidade, number> = { erro: 0, pendencia: 0, aviso: 0 };
  for (const { severidade } of diagnosticos) total[severidade] += 1;
  return total;
}

export function hasErrors(diagnosticos: readonly Diagnostic[]): boolean {
  return diagnosticos.some((diagnostico) => diagnostico.severidade === "erro");
}
