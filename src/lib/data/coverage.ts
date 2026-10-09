// Cobertura de uma trajetória no atlas: o intervalo de anos que a edição
// declara cobrir e os períodos, dentro dele, em que não há acontecimento.
// Funções puras, usadas pelo relatório de dados e pela interface.
//
// Um período sem acontecimentos é falta de registro no atlas. Nenhuma função
// daqui diz, nem permite dizer, que não houve atividade.

import { yearOf } from "@/lib/domain/dates";
import type { Edicao } from "@/lib/domain/types";

import type { AtlasData } from "./types";

/** Anos seguidos sem acontecimento para o período ser tratado como lacuna. */
export const MIN_GAP_YEARS = 4;

/** Intervalo de anos, com as duas pontas inclusas. */
export interface YearSpan {
  de: number;
  ate: number;
}

/**
 * Períodos de `minimo` anos ou mais sem nenhum dos `anos`, entre `de` e `ate`.
 * Os dois limites contam: um intervalo vazio no começo ou no fim também entra.
 */
export function findGaps(
  anos: readonly number[],
  { de, ate }: YearSpan,
  minimo: number = MIN_GAP_YEARS,
): YearSpan[] {
  const marcos = [...new Set(anos)].filter((ano) => ano >= de && ano <= ate).sort((a, b) => a - b);
  const lacunas: YearSpan[] = [];
  let anterior = de - 1;
  for (const marco of [...marcos, ate + 1]) {
    if (marco - anterior - 1 >= minimo) lacunas.push({ de: anterior + 1, ate: marco - 1 });
    anterior = marco;
  }
  return lacunas;
}

export type Coverage = Edicao["cobertura"][number];

export function getCoverage(data: AtlasData, pessoaId: string): Coverage | null {
  return data.conjunto.edicao?.cobertura.find((item) => item.pessoaId === pessoaId) ?? null;
}

/** Ano da data de corte da edição; `null` sem edição publicada. */
export function getCutYear(data: AtlasData): number | null {
  const corte = data.conjunto.edicao?.dataDeCorte;
  return corte === undefined ? null : Number(corte.slice(0, 4));
}

/**
 * Anos que a edição cobre para a pessoa: do início declarado na cobertura
 * (ou, sem ele, do primeiro acontecimento) até o ano da data de corte.
 * `null` quando não há nem cobertura nem acontecimento.
 */
export function getCoveredSpan(data: AtlasData, pessoaId: string): YearSpan | null {
  const cobertura = getCoverage(data, pessoaId);
  const anos = data.conjunto.acontecimentos
    .filter((item) => item.pessoaIds.includes(pessoaId))
    .map((item) => yearOf(item.data));

  const inicio =
    cobertura?.periodo.inicio.tipo === "data"
      ? yearOf(cobertura.periodo.inicio)
      : anos.length > 0
        ? Math.min(...anos)
        : null;
  const fim = getCutYear(data) ?? (anos.length > 0 ? Math.max(...anos) : null);

  if (inicio === null || fim === null) return null;
  return { de: Math.min(inicio, fim), ate: Math.max(inicio, fim) };
}

/** Lacunas da pessoa dentro do que a edição cobre. */
export function listGaps(data: AtlasData, pessoaId: string): YearSpan[] {
  const coberto = getCoveredSpan(data, pessoaId);
  if (coberto === null) return [];
  const anos = data.conjunto.acontecimentos
    .filter((item) => item.pessoaIds.includes(pessoaId))
    .map((item) => yearOf(item.data));
  return findGaps(anos, coberto);
}

/** O menor intervalo que contém a cobertura de todas as pessoas: a escala comum da comparação. */
export function getSharedSpan(data: AtlasData): YearSpan | null {
  const intervalos = data.conjunto.pessoas
    .map((pessoa) => getCoveredSpan(data, pessoa.id))
    .filter((item): item is YearSpan => item !== null);
  if (intervalos.length === 0) return null;
  return {
    de: Math.min(...intervalos.map((item) => item.de)),
    ate: Math.max(...intervalos.map((item) => item.ate)),
  };
}
