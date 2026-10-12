// Índices do conjunto publicado. Função pura: recebe o conjunto já ordenado
// pelo gerador e devolve as listas de consulta. Os índices nunca guardam
// registros, só `id`, para o conjunto continuar sendo a única cópia do dado.

import { CATEGORIAS, type Categoria } from "@/lib/domain/categories";
import { yearOf } from "@/lib/domain/dates";
import { TEMAS, type Tema } from "@/lib/domain/decisions";

import type { Indexes, PublishedSet } from "./types";

/** Uma lista por tema, todas presentes, preenchidas pelos registros que citam cada tema. */
function byTheme(registros: readonly { id: string; temas: readonly Tema[] }[]): Record<Tema, string[]> {
  const porTema = Object.fromEntries(TEMAS.map((tema) => [tema, [] as string[]])) as Record<Tema, string[]>;
  for (const registro of registros) {
    for (const tema of new Set(registro.temas)) porTema[tema].push(registro.id);
  }
  return porTema;
}

function positions(registros: readonly { id: string }[]): Record<string, number> {
  return Object.fromEntries(registros.map((registro, posicao) => [registro.id, posicao]));
}

function group<T extends { id: string }>(
  registros: readonly T[],
  chaves: (registro: T) => readonly string[],
): Record<string, string[]> {
  const grupos = new Map<string, string[]>();
  for (const registro of registros) {
    // Um registro entra uma vez por chave, mesmo que a chave venha repetida.
    for (const chave of new Set(chaves(registro))) {
      const ids = grupos.get(chave);
      if (ids) ids.push(registro.id);
      else grupos.set(chave, [registro.id]);
    }
  }
  return Object.fromEntries(grupos);
}

export function buildIndexes(conjunto: PublishedSet): Indexes {
  const { pessoas, mandatos, filiacoes, acontecimentos, lugares, fontes, imagens } = conjunto;
  const { proposicoes, votacoes, votos, atosExecutivos, atuacoesLegislativas, coberturaPolitica, identidadesInstitucionais } = conjunto;
  const { propostasEleitorais, fatosBiograficos, conceitos, fasesDoJogo } = conjunto;

  const temasDaProposicao = new Map(proposicoes.map((item) => [item.id, item.temas]));
  const vigentePorVotacaoEPessoa: Record<string, string> = {};
  for (const voto of votos) {
    if (voto.situacao.tipo === "vigente") vigentePorVotacaoEPessoa[`${voto.votacaoId}:${voto.pessoaId}`] = voto.id;
  }

  const porCategoria = Object.fromEntries(
    CATEGORIAS.map((categoria) => [categoria, [] as string[]]),
  ) as Record<Categoria, string[]>;
  for (const acontecimento of acontecimentos) {
    porCategoria[acontecimento.categoria].push(acontecimento.id);
  }

  const anos = acontecimentos.map((acontecimento) => yearOf(acontecimento.data));

  return {
    acontecimentos: {
      porId: positions(acontecimentos),
      porSlug: Object.fromEntries(acontecimentos.map((item) => [item.slug, item.id])),
      porPessoa: group(acontecimentos, (item) => item.pessoaIds),
      porAno: group(acontecimentos, (item) => [String(yearOf(item.data))]),
      porCategoria,
      porLugar: group(acontecimentos, (item) =>
        item.localizacao.tipo === "lugares" ? item.localizacao.lugarIds : [],
      ),
      semPonto: {
        nacional: acontecimentos
          .filter((item) => item.localizacao.tipo === "nacional")
          .map((item) => item.id),
        desconhecida: acontecimentos
          .filter((item) => item.localizacao.tipo === "desconhecida")
          .map((item) => item.id),
      },
      anos: anos.length === 0 ? null : { primeiro: Math.min(...anos), ultimo: Math.max(...anos) },
    },
    pessoas: {
      porId: positions(pessoas),
      porSlug: Object.fromEntries(pessoas.map((pessoa) => [pessoa.slug, pessoa.id])),
    },
    mandatos: { porId: positions(mandatos), porPessoa: group(mandatos, (item) => [item.pessoaId]) },
    filiacoes: {
      porId: positions(filiacoes),
      porPessoa: group(filiacoes, (item) => [item.pessoaId]),
    },
    proposicoes: {
      porId: positions(proposicoes),
      porTema: byTheme(proposicoes),
      porInstituicao: group(proposicoes, (item) => [item.instituicao]),
    },
    votacoes: {
      porId: positions(votacoes),
      porProposicao: group(votacoes, (item) => [item.proposicaoId]),
      porInstituicao: group(votacoes, (item) => [item.instituicao]),
      porAno: group(votacoes, (item) => [String(yearOf(item.data))]),
      porTema: byTheme(votacoes.map((item) => ({ id: item.id, temas: temasDaProposicao.get(item.proposicaoId) ?? [] }))),
    },
    votos: {
      porId: positions(votos),
      porVotacao: group(votos, (item) => [item.votacaoId]),
      porPessoa: group(votos, (item) => [item.pessoaId]),
      vigentePorVotacaoEPessoa,
    },
    atosExecutivos: {
      porId: positions(atosExecutivos),
      porPessoa: group(atosExecutivos, (item) => [item.atribuicao.pessoaId]),
      porTema: byTheme(atosExecutivos),
      porAno: group(atosExecutivos, (item) => [String(yearOf(item.data))]),
      porProposicao: group(atosExecutivos, (item) => item.proposicaoIds),
    },
    atuacoesLegislativas: {
      porId: positions(atuacoesLegislativas),
      porPessoa: group(atuacoesLegislativas, (item) => [item.pessoaId]),
      porTema: byTheme(atuacoesLegislativas),
      porAno: group(atuacoesLegislativas, (item) => [String(yearOf(item.data))]),
    },
    coberturaPolitica: {
      porId: positions(coberturaPolitica),
      porPessoa: group(coberturaPolitica, (item) => [item.pessoaId]),
    },
    identidadesInstitucionais: {
      porId: positions(identidadesInstitucionais),
      porPessoa: group(identidadesInstitucionais, (item) => [item.pessoaId]),
    },
    propostasEleitorais: { porId: positions(propostasEleitorais), porPessoa: group(propostasEleitorais, (item) => [item.pessoaId]) },
    fatosBiograficos: { porId: positions(fatosBiograficos), porPessoa: group(fatosBiograficos, (item) => [item.pessoaId]) },
    conceitos: { porId: positions(conceitos) },
    fasesDoJogo: {
      porId: positions(fasesDoJogo),
      // O conjunto já vem na ordem de percurso: o grupo a conserva.
      porPessoaESala: group(fasesDoJogo, (item) => [`${item.pessoaId}:${item.sala}`]),
    },
    lugares: { porId: positions(lugares) },
    fontes: { porId: positions(fontes) },
    imagens: { porId: positions(imagens) },
  };
}
