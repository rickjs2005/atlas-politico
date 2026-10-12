// O progresso salvo nos formatos anteriores à trilha (versões 1 a 5), em que o
// jogo tinha capítulos com registros a recolher, tarefa e saída. A leitura é
// tolerante e só responde uma pergunta: quais capítulos a pessoa tinha
// concluído. O resto do que estava salvo não é interpretado; fica guardado,
// inteiro, dentro do formato novo (docs/GAME-TRAIL.md, D-135).
//
// A tabela de correspondência é congelada: diz, para cada capítulo que
// existiu, quais fases da trilha cobrem os mesmos registros. Não acompanha
// mudanças futuras das fases de propósito; uma fase que deixar de existir é
// ignorada na leitura.

import type { PersonagemSlug } from "./types";

/** As versões do formato antigo que a leitura entende. */
export const LEGACY_VERSIONS: readonly number[] = [1, 2, 3, 4, 5];

/**
 * Para cada capítulo dos formatos anteriores, as fases da trilha que cobrem
 * os registros dele. Um capítulo que reunia dois períodos aponta duas fases.
 * As fases que não tinham capítulo (a origem, o segundo governo de Lula e a
 * leitura dos votos no Senado, que antes só existia nos aprofundamentos) não
 * aparecem em nenhuma linha.
 */
export const LEGACY_CHAPTER_PHASES: Readonly<Record<string, readonly string[]>> = {
  "lula-1-sindicato": ["lula-sindicato"],
  "lula-2-constituinte": ["lula-partido-e-constituinte", "lula-disputas-pela-presidencia"],
  "lula-3-presidencia": ["lula-disputas-pela-presidencia", "lula-primeiro-governo"],
  "lula-4-processos": ["lula-processos"],
  "lula-5-anulacao": ["lula-processos", "lula-retorno"],
  "lula-6-eleicao-2026": ["lula-eleicao-2026"],
  "lula-economia": ["lula-economia"],
  "lula-seguranca-publica": ["lula-seguranca-publica"],
  "flavio-bolsonaro-1-alerj": ["flavio-bolsonaro-primeira-eleicao", "flavio-bolsonaro-alerj-primeiros-mandatos", "flavio-bolsonaro-alerj-ultimos-mandatos"],
  "flavio-bolsonaro-2-senado": ["flavio-bolsonaro-senado"],
  "flavio-bolsonaro-3-denuncia": ["flavio-bolsonaro-processos"],
  "flavio-bolsonaro-4-minoria": ["flavio-bolsonaro-funcoes-no-senado"],
  "flavio-bolsonaro-5-eleicao-2026": ["flavio-bolsonaro-eleicao-2026"],
  "flavio-bolsonaro-economia": ["flavio-bolsonaro-economia"],
  "flavio-bolsonaro-seguranca-publica": ["flavio-bolsonaro-seguranca-publica"],
};

export interface LegacyProgress {
  versao: number;
  /** O que estava salvo, como estava. */
  capitulos: Record<string, unknown>;
  /** Os capítulos que o salvo dava como concluídos. */
  concluidos: string[];
}

function isRecord(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

/**
 * Lê um progresso em formato antigo. Devolve `null` quando a versão, o
 * personagem ou a forma não conferem: dado inválido vira começo, e não erro.
 */
export function readLegacy(valor: unknown, personagem: PersonagemSlug): LegacyProgress | null {
  if (!isRecord(valor)) return null;
  if (typeof valor.versao !== "number" || !LEGACY_VERSIONS.includes(valor.versao)) return null;
  if (valor.personagem !== personagem) return null;
  if (!isRecord(valor.capitulos)) return null;
  const concluidos = Object.entries(valor.capitulos)
    .filter(([, entrada]) => isRecord(entrada) && entrada.status === "concluido")
    .map(([id]) => id);
  return { versao: valor.versao, capitulos: valor.capitulos, concluidos };
}

/** As fases da trilha que os capítulos concluídos cobriam, sem repetição. */
export function phasesOfLegacy(concluidos: readonly string[]): string[] {
  return [...new Set(concluidos.flatMap((id) => LEGACY_CHAPTER_PHASES[id] ?? []))];
}
