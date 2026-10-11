// Do conteúdo editorial aos dados públicos: valida, seleciona o que é
// elegível, ordena, monta índices e pontos e confere o resultado antes de
// entregá-lo. Função pura; quem lê e grava arquivos é `src/lib/content`.
//
// REGRA DE ELEGIBILIDADE (docs/DATA-PIPELINE.md, seção Elegibilidade)
//
// Um registro factual (pessoa, mandato, filiação, acontecimento, proposição,
// votação, voto, ato do Executivo, cobertura da pesquisa, identidade
// institucional) entra na publicação quando:
//   1. está em content/published/;
//   2. tem estado editorial `revisado`, com revisão identificada (tipo, quem e
//      quando) e ao menos uma citação que diga a fonte, o trecho e o que ele
//      sustenta;
//   3. respeita o contrato e as regras de datas;
//   4. tudo o que ele cita também entra: as pessoas são elegíveis, e lugares,
//      fontes e imagens existem em content/published/, com o arquivo de mídia
//      no lugar.
// Um lugar, uma fonte ou uma imagem entra quando está em content/published/ e
// é usado por ao menos um registro elegível.
//
// Quem falha em 1 ou 2 fica fora, com pendência no relatório. Quem cumpre 1 e
// 2 e falha em 3 ou 4 é erro: um registro dado como revisado que não pode ser
// publicado precisa de correção, e não de sumir do site em silêncio.

import { buildIndexes } from "@/lib/data/indexes";
import { buildEventPoints } from "@/lib/data/points";
import type { AtlasData, PublishedSet } from "@/lib/data/types";
import { checkIntegrity, checkPublication } from "@/lib/domain/integrity";
import { compareByDate, compareByPeriod, compareText } from "@/lib/domain/order";
import { conjuntoSchema, type Citacao } from "@/lib/domain/schemas";

import {
  formatFieldPath,
  hasErrors,
  sortDiagnostics,
  type Diagnostic,
  type Entidade,
} from "./diagnostics";
import {
  COLECOES_FACTUAIS,
  ENTIDADE_DA_COLECAO,
  type Sources,
} from "./sources";
import { canonicalJson } from "./stable-json";
import {
  validateSources,
  type Tracked,
  type Validation,
  type ValidationOptions,
} from "./validate";

export const MOTIVOS_DE_EXCLUSAO = {
  rascunho: "em pesquisa",
  "nao-revisado": "ainda não revisado",
  "revisado-em-rascunhos": "revisado, mas ainda na pasta de rascunhos",
  "em-rascunhos": "na pasta de rascunhos",
  "sem-uso": "nenhum registro publicado usa",
} as const;
export type MotivoDeExclusao = keyof typeof MOTIVOS_DE_EXCLUSAO;

/** Um registro válido que ficou fora dos dados públicos, e por quê. */
export interface Excluded {
  entidade: Entidade;
  id: string;
  /** Só pessoas e acontecimentos têm endereço próprio. */
  slug: string | null;
  arquivo: string;
  motivo: MotivoDeExclusao;
  pendencias: string[];
}

export interface BuildResult {
  /** `false` quando há erro: nada deve ser gravado. */
  ok: boolean;
  diagnostics: Diagnostic[];
  /** Os dados públicos; `null` quando há erro. */
  data: AtlasData | null;
  excluidos: Excluded[];
  validacao: Validation;
}

function sortById<T extends { id: string }>(registros: readonly T[]): T[] {
  return [...registros].sort((a, b) => compareText(a.id, b.id));
}

/**
 * Seleciona os registros elegíveis e os põe em ordem estável. Pressupõe uma
 * validação sem erros: aí todo candidato é elegível.
 */
export function selectPublishable(validacao: Validation): {
  conjunto: PublishedSet;
  excluidos: Excluded[];
} {
  const { registros, candidatos, edicao } = validacao;
  const excluidos: Excluded[] = [];

  const exclude = (
    entidade: Entidade,
    registro: Tracked<{ id: string }>,
    motivo: MotivoDeExclusao,
    pendencias: string[] = [],
  ) => {
    const { slug } = registro.dados as { slug?: unknown };
    excluidos.push({
      entidade,
      id: registro.dados.id,
      slug: typeof slug === "string" ? slug : null,
      arquivo: registro.arquivo,
      motivo,
      pendencias,
    });
  };

  for (const colecao of COLECOES_FACTUAIS) {
    for (const registro of registros[colecao]) {
      if (candidatos[colecao].has(registro.dados.id)) continue;
      const { editorial } = registro.dados;
      const motivo: MotivoDeExclusao =
        editorial.estado === "revisado"
          ? "revisado-em-rascunhos"
          : registro.pasta === "published"
            ? "nao-revisado"
            : "rascunho";
      exclude(
        ENTIDADE_DA_COLECAO[colecao],
        registro,
        motivo,
        editorial.estado === "revisado" ? [] : (editorial.pendencias ?? []),
      );
    }
  }

  const pick = <T extends { id: string }>(lista: readonly Tracked<T>[], ids: Set<string>): T[] =>
    lista.filter(({ dados }) => ids.has(dados.id)).map(({ dados }) => dados);

  const pessoas = pick(registros.pessoas, candidatos.pessoas);
  const mandatos = pick(registros.mandatos, candidatos.mandatos);
  const filiacoes = pick(registros.filiacoes, candidatos.filiacoes);
  const acontecimentos = pick(registros.acontecimentos, candidatos.acontecimentos);
  const proposicoes = pick(registros.proposicoes, candidatos.proposicoes);
  const votacoes = pick(registros.votacoes, candidatos.votacoes);
  const votos = pick(registros.votos, candidatos.votos);
  const atosExecutivos = pick(registros.atosExecutivos, candidatos.atosExecutivos);
  const coberturaPolitica = pick(registros.coberturaPolitica, candidatos.coberturaPolitica);
  const identidadesInstitucionais = pick(registros.identidadesInstitucionais, candidatos.identidadesInstitucionais);

  // Lugares, fontes e imagens entram pelo uso: só o que um registro elegível
  // cita, nas citações e nas referências documentais do objeto votado e do ato oficial.
  const citados = (itens: readonly { fontes: readonly Citacao[] }[]) =>
    itens.flatMap((item) => item.fontes.map((citacao) => citacao.fonteId));
  const fontesUsadas = new Set([
    ...citados(pessoas),
    ...citados(mandatos),
    ...citados(filiacoes),
    ...citados(acontecimentos),
    ...citados(proposicoes),
    ...citados(votacoes),
    ...citados(votos),
    ...citados(atosExecutivos),
    ...citados(coberturaPolitica),
    ...citados(identidadesInstitucionais),
    ...votacoes.flatMap((item) => (item.objeto.textoReferencia === null ? [] : [item.objeto.textoReferencia.fonteId])),
    ...atosExecutivos.map((item) => item.atoOficial.fonteId),
  ]);
  const lugaresUsados = new Set(
    acontecimentos.flatMap((item) =>
      item.localizacao.tipo === "lugares" ? item.localizacao.lugarIds : [],
    ),
  );
  const imagensUsadas = new Set(
    [
      ...pessoas.map((pessoa) => pessoa.retratoId),
      ...acontecimentos.map((item) => item.imagemId),
    ].filter((id): id is string => id !== null),
  );

  const pickReferences = <T extends { id: string }>(
    entidade: Entidade,
    lista: readonly Tracked<T>[],
    usados: Set<string>,
  ): T[] =>
    lista.flatMap((registro) => {
      if (registro.pasta === "drafts") {
        exclude(entidade, registro, "em-rascunhos");
        return [];
      }
      if (!usados.has(registro.dados.id)) {
        exclude(entidade, registro, "sem-uso");
        return [];
      }
      return [registro.dados];
    });

  const lugares = pickReferences("lugar", registros.lugares, lugaresUsados);
  const fontes = pickReferences("fonte", registros.fontes, fontesUsadas);
  const imagens = pickReferences("imagem", registros.imagens, imagensUsadas);

  excluidos.sort(
    (a, b) => compareText(a.entidade, b.entidade) || compareText(a.id, b.id),
  );

  return {
    conjunto: {
      edicao,
      pessoas: sortById(pessoas),
      mandatos: [...mandatos].sort(compareByPeriod),
      filiacoes: [...filiacoes].sort(compareByPeriod),
      acontecimentos: [...acontecimentos].sort(compareByDate),
      proposicoes: sortById(proposicoes),
      votacoes: [...votacoes].sort(compareByDate),
      votos: sortById(votos),
      atosExecutivos: [...atosExecutivos].sort(compareByDate),
      coberturaPolitica: sortById(coberturaPolitica),
      identidadesInstitucionais: sortById(identidadesInstitucionais),
      lugares: sortById(lugares),
      fontes: sortById(fontes),
      imagens: sortById(imagens),
    },
    excluidos,
  };
}

/** Junta conjunto, índices e pontos. Tudo o que depende do conjunto é derivado aqui. */
export function assembleAtlasData(conjunto: PublishedSet): AtlasData {
  return {
    conjunto,
    indices: buildIndexes(conjunto),
    pontos: buildEventPoints(conjunto.acontecimentos, conjunto.lugares),
  };
}

/**
 * Conferência da saída, independente da validação de entrada: o que vai ser
 * gravado precisa passar de novo pelo contrato, pelas regras de publicação e
 * bater com os próprios índices e pontos. Um problema aqui é defeito do
 * gerador, e impede a gravação do mesmo jeito.
 */
export function verifyAtlasData(
  data: AtlasData,
  arquivo: string,
  options: ValidationOptions = {},
): Diagnostic[] {
  const { conjunto, indices, pontos } = data;
  const problemas: Diagnostic[] = [];
  const report = (campo: string | null, mensagem: string) =>
    problemas.push({
      severidade: "erro",
      codigo: "saida-invalida",
      arquivo,
      entidade: null,
      id: null,
      campo,
      mensagem,
    });

  if (conjunto.edicao === null) {
    const total = Object.values(conjunto).filter(Array.isArray).flat().length;
    if (total > 0) report(null, "Há registros no conjunto, mas nenhuma edição.");
  } else {
    const resultado = conjuntoSchema.safeParse(conjunto);
    if (!resultado.success) {
      for (const issue of resultado.error.issues) report(formatFieldPath(issue.path), issue.message);
    } else {
      const integridade = [
        ...checkIntegrity(resultado.data),
        ...checkPublication(resultado.data, options),
      ];
      for (const issue of integridade) report(issue.caminho, issue.mensagem);
    }
  }

  const cronologicas = { acontecimentos: "Os acontecimentos", votacoes: "As votações", atosExecutivos: "Os atos do Executivo" } as const;
  for (const nome of ["acontecimentos", "votacoes", "atosExecutivos"] as const) {
    const lista = conjunto[nome];
    const ordenado = [...lista].sort(compareByDate);
    if (ordenado.some((item, posicao) => item !== lista[posicao])) {
      report(nome, `${cronologicas[nome]} não estão em ordem cronológica estável.`);
    }
  }

  if (canonicalJson(indices) !== canonicalJson(buildIndexes(conjunto))) {
    report("indices", "Os índices não correspondem ao conjunto.");
  }

  const eventos = new Set(conjunto.acontecimentos.map((item) => item.id));
  const lugares = new Map(conjunto.lugares.map((lugar) => [lugar.id, lugar]));
  const vistos = new Set<unknown>();
  for (const ponto of pontos.features) {
    const { eventId, placeId } = ponto.properties;
    const campo = `pontos["${String(ponto.id)}"]`;
    if (vistos.has(ponto.id)) report(campo, "Ponto repetido.");
    vistos.add(ponto.id);

    const lugar = lugares.get(placeId);
    if (!eventos.has(eventId)) report(campo, `Ponto de acontecimento fora do conjunto: "${eventId}".`);
    if (lugar === undefined) {
      report(campo, `Ponto de lugar fora do conjunto: "${placeId}".`);
      continue;
    }

    // Ordem GeoJSON: longitude primeiro. Conferida contra os campos nomeados do lugar.
    const [longitude, latitude] = ponto.geometry.coordinates;
    const valida =
      ponto.geometry.coordinates.length === 2 &&
      Number.isFinite(longitude) &&
      Number.isFinite(latitude) &&
      longitude === lugar.longitude &&
      latitude === lugar.latitude &&
      Math.abs(lugar.longitude) <= 180 &&
      Math.abs(lugar.latitude) <= 90;
    if (!valida) report(campo, "Coordenada inválida ou fora da ordem [longitude, latitude].");
  }

  return problemas;
}

/**
 * O pipeline inteiro, em memória. Com qualquer erro, `data` volta `null` e
 * nada deve ser gravado.
 */
export function buildAtlasData(sources: Sources, options: ValidationOptions = {}): BuildResult {
  const validacao = validateSources(sources, options);
  const falha = (diagnostics: Diagnostic[], excluidos: Excluded[] = []): BuildResult => ({
    ok: false,
    diagnostics: sortDiagnostics(diagnostics),
    data: null,
    excluidos,
    validacao,
  });

  if (hasErrors(validacao.diagnostics)) return falha(validacao.diagnostics);

  const { conjunto, excluidos } = selectPublishable(validacao);
  const data = assembleAtlasData(conjunto);

  const problemas = verifyAtlasData(data, validacao.pastas.published, options);
  if (problemas.length > 0) return falha([...validacao.diagnostics, ...problemas], excluidos);

  return {
    ok: true,
    diagnostics: sortDiagnostics(validacao.diagnostics),
    data,
    excluidos,
    validacao,
  };
}
