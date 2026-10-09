// Índices do conjunto publicado. Função pura: recebe o conjunto já ordenado
// pelo gerador e devolve as listas de consulta. Os índices nunca guardam
// registros, só `id`, para o conjunto continuar sendo a única cópia do dado.

import { CATEGORIAS, type Categoria } from "@/lib/domain/categories";
import { yearOf } from "@/lib/domain/dates";

import type { Indexes, PublishedSet } from "./types";

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
    lugares: { porId: positions(lugares) },
    fontes: { porId: positions(fontes) },
    imagens: { porId: positions(imagens) },
  };
}
