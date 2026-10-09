// Geometria da linha do tempo. Funções puras: transformam datas e períodos em
// posições de 0 a 1 sobre o eixo, e distribuem marcas próximas em fileiras.
//
// A posição é regra de desenho, e não data: uma marca de precisão anual ocupa
// o ano inteiro no eixo, em vez de fingir um dia.

import {
  calcInterval,
  calcPeriodBounds,
  yearRangeInterval,
  type DataHistorica,
  type DiaOrdinal,
  type IntervaloDeCalculo,
  type Periodo,
} from "@/lib/domain/dates";

/** Anos do eixo, com as duas pontas inclusas. */
export interface TimeDomain {
  de: number;
  ate: number;
}

/** Trecho do eixo: começo e largura, de 0 a 1. */
export interface Span {
  inicio: number;
  largura: number;
}

const clamp = (valor: number) => Math.min(1, Math.max(0, valor));

function project(domain: TimeDomain, intervalo: IntervaloDeCalculo): Span {
  const eixo = yearRangeInterval(domain.de, domain.ate);
  // O último dia do eixo também ocupa espaço: o eixo vai até o fim dele.
  const total = eixo.fim - eixo.inicio + 1;
  const inicio = clamp((intervalo.inicio - eixo.inicio) / total);
  const fim = clamp((intervalo.fim + 1 - eixo.inicio) / total);
  return { inicio, largura: Math.max(0, fim - inicio) };
}

/** Trecho que uma data ocupa: um dia, um mês ou um ano, conforme a precisão. */
export function spanOfDate(domain: TimeDomain, data: DataHistorica): Span {
  return project(domain, calcInterval(data));
}

/** Trecho de um recorte de anos. */
export function spanOfYears(domain: TimeDomain, de: number, ate: number): Span {
  return project(domain, yearRangeInterval(de, ate));
}

/** Onde começa um ano no eixo, de 0 a 1. */
export function positionOfYear(domain: TimeDomain, ano: number): number {
  return spanOfYears(domain, ano, ano).inicio;
}

/**
 * Anos que recebem rótulo. O passo é escolhido entre 1, 2, 5, 10 e 20 para
 * caber em `maximo` rótulos; os rótulos caem em anos redondos do passo.
 */
export function yearLabels(domain: TimeDomain, maximo: number): number[] {
  const total = domain.ate - domain.de + 1;
  const passo = [1, 2, 5, 10, 20, 50].find((item) => total / item <= maximo) ?? 100;
  const anos: number[] = [];
  for (let ano = Math.ceil(domain.de / passo) * passo; ano <= domain.ate; ano += passo) {
    anos.push(ano);
  }
  return anos;
}

export interface PeriodBar extends Span {
  /** Lado sem data documentada: a barra não tem limite conhecido ali. */
  aberto: "inicio" | "fim" | null;
}

/**
 * Barra de um mandato ou de uma filiação. Com um limite desconhecido, a barra
 * mostra só um trecho curto junto ao limite conhecido e avisa qual lado está
 * em aberto. Sem nenhum limite conhecido não há barra: `null`.
 */
export function barOfPeriod(
  domain: TimeDomain,
  periodo: Periodo,
  dataDeCorte: string,
): PeriodBar | null {
  const { inicio, fim } = calcPeriodBounds(periodo, dataDeCorte);
  if (inicio !== null && fim !== null) {
    return { ...project(domain, { inicio: inicio.inicio, fim: fim.fim }), aberto: null };
  }

  // Trecho de um ano e meio, só para a barra existir e apontar a direção.
  const TRECHO = 548;
  if (inicio !== null) {
    const ate = (inicio.inicio + TRECHO) as DiaOrdinal;
    return { ...project(domain, { inicio: inicio.inicio, fim: ate }), aberto: "fim" };
  }
  if (fim !== null) {
    const de = (fim.fim - TRECHO) as DiaOrdinal;
    return { ...project(domain, { inicio: de, fim: fim.fim }), aberto: "inicio" };
  }
  return null;
}

/**
 * Distribui trechos em fileiras para que não se sobreponham. Cada trecho vai
 * para a primeira fileira livre; `folga` é o espaço mínimo entre dois vizinhos
 * da mesma fileira, na mesma unidade dos trechos. Devolve a fileira de cada
 * trecho, na ordem recebida.
 */
export function packRows(trechos: readonly Span[], folga: number = 0): number[] {
  const fimDaFileira: number[] = [];
  const ordem = trechos
    .map((trecho, indice) => ({ trecho, indice }))
    .sort((a, b) => a.trecho.inicio - b.trecho.inicio || a.indice - b.indice);

  const fileiras = new Array<number>(trechos.length).fill(0);
  for (const { trecho, indice } of ordem) {
    let fileira = fimDaFileira.findIndex((fim) => trecho.inicio >= fim + folga);
    if (fileira === -1) fileira = fimDaFileira.length;
    fimDaFileira[fileira] = trecho.inicio + trecho.largura;
    fileiras[indice] = fileira;
  }
  return fileiras;
}

export interface PlacedMark<T> {
  item: T;
  /** Trecho que a data ocupa no eixo. */
  span: Span;
  /** Centro da marca, de 0 a 1. */
  centro: number;
  fileira: number;
}

/**
 * Posiciona as marcas de acontecimentos. `largura` é o espaço que cada marca
 * precisa no eixo, de 0 a 1: marcas mais próximas do que isso sobem de fileira.
 */
export function placeMarks<T extends { data: DataHistorica }>(
  domain: TimeDomain,
  itens: readonly T[],
  largura: number,
): { marcas: PlacedMark<T>[]; fileiras: number } {
  const spans = itens.map((item) => spanOfDate(domain, item.data));
  const centros = spans.map((span) => span.inicio + span.largura / 2);
  const caixas = centros.map((centro) => ({ inicio: centro - largura / 2, largura }));
  const fileiras = packRows(caixas);

  return {
    marcas: itens.map((item, indice) => ({
      item,
      span: spans[indice]!,
      centro: centros[indice]!,
      fileira: fileiras[indice]!,
    })),
    fileiras: fileiras.length === 0 ? 0 : Math.max(...fileiras) + 1,
  };
}
