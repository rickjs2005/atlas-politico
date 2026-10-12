// Importação de um pacote JSON para os rascunhos. Função pura: decide o que
// entra, o que é recusado e o que fica pendente; quem grava é `src/lib/content`.
//
// Regras (docs/DATA-PIPELINE.md, seção Importação):
//   - tudo o que entra, entra como rascunho, em content/drafts/. Uma revisão
//     declarada no pacote não é aceita: revisão se registra aqui, depois de
//     conferida;
//   - nenhum registro existente é alterado. `id` ou `slug` já usado é conflito,
//     e o registro importado é recusado;
//   - importar não publica. O que foi importado só chega às páginas depois de
//     revisado, movido para content/published/ e gerado por `data:build`.

import { z } from "zod";

import { calcInterval, formatDate } from "@/lib/domain/dates";
import { SYNTHETIC_PREFIX } from "@/lib/domain/integrity";
import {
  ENTIDADES,
  acontecimentoSchema,
  atoExecutivoSchema,
  atuacaoLegislativaSchema,
  coberturaPoliticaSchema,
  conceitoSchema,
  faseDoJogoSchema,
  fatoBiograficoSchema,
  filiacaoSchema,
  fonteSchema,
  identidadeInstitucionalSchema,
  imagemSchema,
  lugarSchema,
  mandatoSchema,
  pessoaSchema,
  proposicaoSchema,
  propostaEleitoralSchema,
  votacaoSchema,
  votoSchema,
  type Citacao,
} from "@/lib/domain/schemas";

import { formatFieldPath, type Entidade } from "./diagnostics";
import {
  COLECOES,
  COLECOES_COM_CITACAO,
  ENTIDADE_DA_COLECAO,
  emptyByCollection,
  isColecao,
  isFactual,
  type Colecao,
} from "./sources";
import { canonicalJson } from "./stable-json";
import type { Validation } from "./validate";

const SCHEMAS: Record<Colecao, z.ZodType<{ id: string }>> = {
  pessoas: pessoaSchema,
  mandatos: mandatoSchema,
  filiacoes: filiacaoSchema,
  acontecimentos: acontecimentoSchema,
  proposicoes: proposicaoSchema,
  votacoes: votacaoSchema,
  votos: votoSchema,
  atosExecutivos: atoExecutivoSchema,
  atuacoesLegislativas: atuacaoLegislativaSchema,
  coberturaPolitica: coberturaPoliticaSchema,
  identidadesInstitucionais: identidadeInstitucionalSchema,
  propostasEleitorais: propostaEleitoralSchema,
  fatosBiograficos: fatoBiograficoSchema,
  conceitos: conceitoSchema,
  fasesDoJogo: faseDoJogoSchema,
  lugares: lugarSchema,
  fontes: fonteSchema,
  imagens: imagemSchema,
};

const referencia = z.strictObject({ entidade: z.enum(ENTIDADES), id: z.string() });

/** Uma linha do registro de importações (`content/drafts/importacoes.json`). */
export const importacaoSchema = z.strictObject({
  /** Dia em que a importação foi feita. */
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  origem: z.strictObject({
    /** Nome do arquivo importado, sem a pasta. */
    arquivo: z.string().min(1),
    sha256: z.string().regex(/^[0-9a-f]{64}$/),
    /** De onde veio o pacote, nas palavras de quem importou. */
    descricao: z.string().min(1).optional(),
  }),
  /** Gravados como rascunho, prontos para seguir à revisão. */
  aceitos: z.array(referencia),
  /** Gravados como rascunho, com algo a resolver antes da revisão. */
  pendentes: z.array(referencia.extend({ pendencias: z.array(z.string()) })),
  /** Não gravados. */
  rejeitados: z.array(
    z.strictObject({
      /** Onde o item estava no pacote, como `acontecimentos[2]`. */
      posicao: z.string(),
      entidade: z.enum(ENTIDADES).nullable(),
      id: z.string().nullable(),
      motivos: z.array(z.string()),
    }),
  ),
  /** Lugares, fontes e imagens idênticos a registros que já existem: nada a gravar. */
  existentes: z.array(referencia),
});

export const registroDeImportacoesSchema = z.array(importacaoSchema);
export type Importacao = z.infer<typeof importacaoSchema>;

export interface ImportOrigin {
  arquivo: string;
  sha256: string;
  descricao?: string;
}

export interface ImportPlan {
  /** Registros a acrescentar em cada arquivo de content/drafts/. */
  gravar: Record<Colecao, unknown[]>;
  registro: Importacao;
}

function isObject(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

/** Pendências já escritas no pacote, quando vêm no formato do contrato. */
function declaredPending(editorial: unknown): string[] {
  if (!isObject(editorial) || !Array.isArray(editorial.pendencias)) return [];
  return editorial.pendencias.filter(
    (item): item is string => typeof item === "string" && /\S/.test(item),
  );
}

export function planImport(
  pacote: unknown,
  existente: Validation,
  origem: ImportOrigin,
  hoje: string,
): ImportPlan {
  const gravar: ImportPlan["gravar"] = emptyByCollection<unknown>();
  const registro: Importacao = {
    data: hoje,
    origem,
    aceitos: [],
    pendentes: [],
    rejeitados: [],
    existentes: [],
  };
  const reject = (
    posicao: string,
    entidade: Entidade | null,
    id: string | null,
    motivos: string[],
  ) => registro.rejeitados.push({ posicao, entidade, id, motivos });

  if (!isObject(pacote)) {
    reject("(arquivo)", null, null, [
      `O pacote deve ser um objeto com listas por coleção: ${COLECOES.join(", ")}.`,
    ]);
    return { gravar, registro };
  }

  const procedencia = origem.descricao ?? origem.arquivo;
  const notaDeOrigem = `Importado de "${procedencia}" em ${formatDate({ valor: hoje, precisao: "dia" })}: conferir cada afirmação contra as fontes antes de revisar.`;

  // O que já existe, nas duas pastas: é o que a importação não pode tocar.
  const idsExistentes = Object.fromEntries(
    COLECOES.map((colecao) => [
      colecao,
      new Map(existente.registros[colecao].map(({ dados, arquivo }) => [dados.id, { dados, arquivo }])),
    ]),
  ) as Record<Colecao, Map<string, { dados: unknown; arquivo: string }>>;
  const slugsExistentes = {
    pessoas: new Map(existente.registros.pessoas.map(({ dados }) => [dados.slug, dados.id])),
    acontecimentos: new Map(
      existente.registros.acontecimentos.map(({ dados }) => [dados.slug, dados.id]),
    ),
  };

  interface Accepted {
    colecao: Colecao;
    dados: { id: string } & Record<string, unknown>;
    pendencias: string[];
  }
  const aceitos: Accepted[] = [];

  for (const [chave, lista] of Object.entries(pacote)) {
    if (!isColecao(chave)) {
      reject(chave, null, null, [
        chave === "edicao"
          ? "A edição não é importável: ela é mantida à mão em content/published/edicao.json."
          : `Coleção desconhecida. As aceitas são: ${COLECOES.join(", ")}.`,
      ]);
      continue;
    }
    const colecao = chave;
    const entidade = ENTIDADE_DA_COLECAO[colecao];
    if (!Array.isArray(lista)) {
      reject(colecao, entidade, null, ["A coleção deve ser uma lista de registros."]);
      continue;
    }

    lista.forEach((bruto: unknown, indice: number) => {
      const posicao = `${colecao}[${indice}]`;
      if (!isObject(bruto)) {
        reject(posicao, entidade, null, ["O registro deve ser um objeto."]);
        return;
      }
      const id = typeof bruto.id === "string" ? bruto.id : null;
      const slug = typeof bruto.slug === "string" ? bruto.slug : null;

      if (id?.startsWith(SYNTHETIC_PREFIX) || slug?.startsWith(SYNTHETIC_PREFIX)) {
        reject(posicao, entidade, id, ["Dado sintético de teste não entra no conteúdo."]);
        return;
      }

      // Tudo o que afirma um fato entra como rascunho, seja qual for o estado declarado.
      const pendencias: string[] = [];
      let candidato: Record<string, unknown> = bruto;
      if (isFactual(colecao)) {
        const declarado = isObject(bruto.editorial) ? bruto.editorial.estado : undefined;
        if (declarado === "revisado" || declarado === "em-revisao") {
          pendencias.push(
            `O pacote declarava o estado "${declarado}". A revisão feita na origem não foi aceita e precisa ser refeita aqui.`,
          );
        }
        candidato = {
          ...bruto,
          editorial: { estado: "rascunho", pendencias: declaredPending(bruto.editorial) },
        };
      }

      const resultado = SCHEMAS[colecao].safeParse(candidato);
      if (!resultado.success) {
        reject(
          posicao,
          entidade,
          id,
          resultado.error.issues.map((issue) => {
            const campo = formatFieldPath(issue.path);
            return campo === null ? issue.message : `${campo}: ${issue.message}`;
          }),
        );
        return;
      }
      const dados = resultado.data as Accepted["dados"];

      const anterior = idsExistentes[colecao].get(dados.id);
      if (anterior !== undefined) {
        // Cadastro de referência repetido e igual não é conflito: já está lá.
        if (!isFactual(colecao) && canonicalJson(anterior.dados) === canonicalJson(dados)) {
          registro.existentes.push({ entidade, id: dados.id });
        } else {
          reject(posicao, entidade, dados.id, [
            `Conflito de id: "${dados.id}" já existe em ${anterior.arquivo}. O registro existente foi preservado.`,
          ]);
        }
        return;
      }
      if (aceitos.some((item) => item.colecao === colecao && item.dados.id === dados.id)) {
        reject(posicao, entidade, dados.id, [
          `Id repetido dentro do pacote: "${dados.id}". Só a primeira ocorrência entrou.`,
        ]);
        return;
      }

      if (slug !== null && (colecao === "pessoas" || colecao === "acontecimentos")) {
        const dono = slugsExistentes[colecao].get(slug);
        const noPacote = aceitos.some(
          (item) => item.colecao === colecao && item.dados.slug === slug,
        );
        if (dono !== undefined || noPacote) {
          reject(posicao, entidade, dados.id, [
            dono !== undefined
              ? `Conflito de slug: "${slug}" já pertence a "${dono}". O registro existente foi preservado.`
              : `Slug repetido dentro do pacote: "${slug}".`,
          ]);
          return;
        }
      }

      aceitos.push({ colecao, dados, pendencias });
    });
  }

  // Referências: valem os registros que já existem e os que entram agora.
  const known = (colecao: Colecao, id: string) =>
    idsExistentes[colecao].has(id) ||
    aceitos.some((item) => item.colecao === colecao && item.dados.id === id);
  const corte =
    existente.edicao === null
      ? null
      : calcInterval({ valor: existente.edicao.dataDeCorte, precisao: "dia" }).fim;

  for (const { colecao, dados, pendencias } of aceitos) {
    const entidade = ENTIDADE_DA_COLECAO[colecao];
    const missing = (alvo: Colecao, id: string) => {
      if (!known(alvo, id)) {
        pendencias.push(`Referência a ${ENTIDADE_DA_COLECAO[alvo]} inexistente: "${id}".`);
      }
    };

    if (isFactual(colecao) && colecao !== "fasesDoJogo") {
      const fontes = dados.fontes as Citacao[];
      if (fontes.length === 0 && (COLECOES_COM_CITACAO as readonly string[]).includes(colecao)) {
        pendencias.push("Sem fonte: registrar ao menos uma citação, com o trecho e o que ele sustenta.");
      }
      for (const citacao of fontes) missing("fontes", citacao.fonteId);
    }
    if (colecao === "pessoas" && typeof dados.retratoId === "string") {
      missing("imagens", dados.retratoId);
    }
    if (colecao === "mandatos" || colecao === "filiacoes" || colecao === "coberturaPolitica" || colecao === "identidadesInstitucionais" || colecao === "propostasEleitorais" || colecao === "fatosBiograficos" || colecao === "fasesDoJogo") {
      missing("pessoas", dados.pessoaId as string);
    }
    if (colecao === "votacoes") {
      const votacao = votacaoSchema.parse(dados);
      missing("proposicoes", votacao.proposicaoId);
      if (votacao.objeto.textoReferencia !== null) missing("fontes", votacao.objeto.textoReferencia.fonteId);
    }
    if (colecao === "votos") {
      const voto = votoSchema.parse(dados);
      missing("pessoas", voto.pessoaId);
      missing("mandatos", voto.mandatoId);
      missing("votacoes", voto.votacaoId);
      if (voto.situacao.tipo === "retificado") missing("votos", voto.situacao.substituidoPor);
    }
    if (colecao === "atosExecutivos") {
      const ato = atoExecutivoSchema.parse(dados);
      missing("pessoas", ato.atribuicao.pessoaId);
      missing("mandatos", ato.atribuicao.mandatoId);
      for (const id of new Set(ato.proposicaoIds)) missing("proposicoes", id);
      missing("fontes", ato.atoOficial.fonteId);
    }
    if (colecao === "atuacoesLegislativas") {
      const atuacao = atuacaoLegislativaSchema.parse(dados);
      missing("pessoas", atuacao.pessoaId);
      missing("mandatos", atuacao.mandatoId);
    }
    if (colecao === "acontecimentos") {
      const acontecimento = acontecimentoSchema.parse(dados);
      for (const pessoaId of new Set(acontecimento.pessoaIds)) missing("pessoas", pessoaId);
      if (acontecimento.localizacao.tipo === "lugares") {
        for (const lugarId of new Set(acontecimento.localizacao.lugarIds)) missing("lugares", lugarId);
      }
      if (acontecimento.imagemId !== null) missing("imagens", acontecimento.imagemId);
      if (corte !== null && calcInterval(acontecimento.data).inicio > corte) {
        pendencias.push(
          `Data (${formatDate(acontecimento.data)}) posterior à data de corte da edição.`,
        );
      }
    }

    if (isFactual(colecao)) {
      const editorial = dados.editorial as { estado: "rascunho"; pendencias: string[] };
      gravar[colecao].push({
        ...dados,
        editorial: {
          estado: "rascunho",
          pendencias: [notaDeOrigem, ...editorial.pendencias, ...pendencias],
        },
      });
    } else {
      gravar[colecao].push(dados);
    }

    if (pendencias.length > 0) registro.pendentes.push({ entidade, id: dados.id, pendencias });
    else registro.aceitos.push({ entidade, id: dados.id });
  }

  return { gravar, registro };
}

/** Resumo do resultado de uma importação, em texto simples. */
export function renderImportReport(registro: Importacao, simulacao: boolean): string {
  const out: string[] = [];
  const { aceitos, pendentes, rejeitados, existentes, origem } = registro;
  out.push(
    `${simulacao ? "Simulação de importação" : "Importação"} de ${origem.arquivo}${origem.descricao === undefined ? "" : ` (${origem.descricao})`}`,
    `Aceitos: ${aceitos.length} · Pendentes: ${pendentes.length} · Rejeitados: ${rejeitados.length} · Já existentes: ${existentes.length}`,
    "",
  );

  const destino = simulacao ? "entrariam como rascunho" : "gravados como rascunho";
  if (aceitos.length > 0) {
    out.push(`Aceitos (${destino}):`);
    for (const item of aceitos) out.push(`  - ${item.entidade} "${item.id}"`);
    out.push("");
  }
  if (pendentes.length > 0) {
    out.push(`Pendentes (${destino}, com algo a resolver):`);
    for (const item of pendentes) {
      out.push(`  - ${item.entidade} "${item.id}"`);
      for (const pendencia of item.pendencias) out.push(`      ${pendencia}`);
    }
    out.push("");
  }
  if (rejeitados.length > 0) {
    out.push("Rejeitados (ficam fora):");
    for (const item of rejeitados) {
      out.push(`  - ${item.posicao}${item.id === null ? "" : ` "${item.id}"`}`);
      for (const motivo of item.motivos) out.push(`      ${motivo}`);
    }
    out.push("");
  }
  if (existentes.length > 0) {
    out.push("Já existentes e iguais (nada a gravar):");
    for (const item of existentes) out.push(`  - ${item.entidade} "${item.id}"`);
    out.push("");
  }

  out.push(
    simulacao
      ? "Nada foi gravado. Rode sem --dry-run para importar."
      : "Importar não publica: revise os rascunhos em content/drafts/ e siga docs/DATA-PIPELINE.md para promover.",
  );
  return out.join("\n");
}
