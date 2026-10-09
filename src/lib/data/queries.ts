// Consultas aos dados públicos. Funções puras e sem I/O: servem às páginas no
// build e à exploração no navegador. Recebem sempre o `AtlasData` que o gerador
// produziu; nenhuma delas lê arquivo nem conhece o Zod.
//
// Regras que valem para todas (docs/DATA-PIPELINE.md, seção Consultas):
//   - filtros de dimensões diferentes se somam (E); valores de uma mesma
//     dimensão se alternam (OU); dimensão vazia ou ausente não restringe;
//   - período em anos, com as duas pontas inclusas; lado `null` fica aberto;
//   - consulta sem resultado devolve lista vazia, e busca por `id` ou `slug`
//     que não existe devolve `null`. Nenhuma consulta lança erro por isso;
//   - cada acontecimento aparece uma vez, em ordem cronológica.

import type { Categoria } from "@/lib/domain/categories";
import {
  YEAR_BOUNDS,
  calcInterval,
  calcPeriodBounds,
  classifyOverlap,
  yearRangeInterval,
  type DataHistorica,
  type Periodo,
  type PeriodOverlap,
} from "@/lib/domain/dates";
import { resolveEvent, type AcontecimentoResolvido } from "@/lib/domain/resolve";
import type {
  Acontecimento,
  Citacao,
  Edicao,
  Filiacao,
  Fonte,
  Imagem,
  Lugar,
  Mandato,
  Pessoa,
} from "@/lib/domain/types";

import { lookup, lookupList } from "./lookup";
import type { AtlasData } from "./types";

/** Recorte em anos. Informado ao contrário (de 2010 até 2003), é lido na ordem certa. */
export interface YearRange {
  de?: number | null;
  ate?: number | null;
}

export interface EventFilter {
  /** `id` das pessoas. Com mais de uma, entram os acontecimentos de qualquer uma delas. */
  pessoaIds?: readonly string[];
  periodo?: YearRange;
  categorias?: readonly Categoria[];
  /** `id` dos lugares. Um acontecimento em dois deles aparece uma vez. */
  lugarIds?: readonly string[];
}

function normalizeRange(periodo: YearRange | undefined): { de: number; ate: number } | null {
  const de = periodo?.de ?? null;
  const ate = periodo?.ate ?? null;
  if (de === null && ate === null) return null;

  const inicio = de ?? YEAR_BOUNDS.min;
  const fim = ate ?? YEAR_BOUNDS.max;
  return inicio <= fim ? { de: inicio, ate: fim } : { de: fim, ate: inicio };
}

// ---------------------------------------------------------------------------
// Perfis e acontecimentos por identificador
// ---------------------------------------------------------------------------

/** Perfis do conjunto, na ordem estável do gerador. */
export function listProfiles(data: AtlasData): Pessoa[] {
  return [...data.conjunto.pessoas];
}

export function findPersonById(data: AtlasData, id: string): Pessoa | null {
  const posicao = lookup(data.indices.pessoas.porId, id);
  return posicao === undefined ? null : (data.conjunto.pessoas[posicao] ?? null);
}

export function findPersonBySlug(data: AtlasData, slug: string): Pessoa | null {
  const id = lookup(data.indices.pessoas.porSlug, slug);
  return id === undefined ? null : findPersonById(data, id);
}

export function findEventById(data: AtlasData, id: string): Acontecimento | null {
  const posicao = lookup(data.indices.acontecimentos.porId, id);
  return posicao === undefined ? null : (data.conjunto.acontecimentos[posicao] ?? null);
}

export function findEventBySlug(data: AtlasData, slug: string): Acontecimento | null {
  const id = lookup(data.indices.acontecimentos.porSlug, slug);
  return id === undefined ? null : findEventById(data, id);
}

// ---------------------------------------------------------------------------
// Acontecimentos por filtro
// ---------------------------------------------------------------------------

/**
 * Acontecimentos do recorte, em ordem cronológica e sem repetição. Cada
 * dimensão informada reduz o conjunto de candidatos pelos índices; o resultado
 * sai na ordem de `conjunto.acontecimentos`, que já é a cronológica com o `id`
 * como desempate.
 */
export function filterEvents(data: AtlasData, filtro: EventFilter = {}): Acontecimento[] {
  const indice = data.indices.acontecimentos;
  // Uma restrição por dimensão informada: os `id` que aquela dimensão aceita.
  const restricoes: Set<string>[] = [];
  const restrict = (listas: readonly string[][]) => {
    restricoes.push(new Set(listas.flat()));
  };

  if (filtro.pessoaIds && filtro.pessoaIds.length > 0) {
    restrict(filtro.pessoaIds.map((id) => lookupList(indice.porPessoa, id)));
  }
  if (filtro.categorias && filtro.categorias.length > 0) {
    restrict(filtro.categorias.map((categoria) => lookupList(indice.porCategoria, categoria)));
  }
  if (filtro.lugarIds && filtro.lugarIds.length > 0) {
    restrict(filtro.lugarIds.map((id) => lookupList(indice.porLugar, id)));
  }

  const recorte = normalizeRange(filtro.periodo);
  if (recorte !== null) {
    // Toda data, de qualquer precisão, cai dentro de um único ano. Por isso o
    // índice por ano responde ao recorte sem inventar dia nem mês.
    restrict(
      Object.keys(indice.porAno)
        .filter((ano) => Number(ano) >= recorte.de && Number(ano) <= recorte.ate)
        .map((ano) => lookupList(indice.porAno, ano)),
    );
  }

  return data.conjunto.acontecimentos.filter((acontecimento) =>
    restricoes.every((ids) => ids.has(acontecimento.id)),
  );
}

// ---------------------------------------------------------------------------
// Mandatos e filiações no período
// ---------------------------------------------------------------------------

export interface PeriodFilter {
  pessoaId: string;
  periodo?: YearRange;
}

/**
 * Um mandato ou uma filiação que toca o recorte. `situacao` diz se as datas
 * conhecidas provam isso (`documentada`) ou se a resposta depende de um limite
 * que não está documentado (`incerta`). A interface deve mostrar a diferença:
 * limite desconhecido não vira data.
 */
export interface PeriodMatch<T> {
  registro: T;
  situacao: Exclude<PeriodOverlap, "nenhuma">;
}

function matchPeriods<T extends { periodo: Periodo }>(
  data: AtlasData,
  registros: readonly T[],
  periodo: YearRange | undefined,
): PeriodMatch<T>[] {
  const recorte = normalizeRange(periodo);
  const corte = data.conjunto.edicao?.dataDeCorte;
  // Sem recorte não há o que provar: entram todos os registros da pessoa.
  if (recorte === null || corte === undefined) {
    return registros.map((registro) => ({ registro, situacao: "documentada" }));
  }

  const intervalo = yearRangeInterval(recorte.de, recorte.ate);
  return registros.flatMap((registro) => {
    const situacao = classifyOverlap(calcPeriodBounds(registro.periodo, corte), intervalo);
    return situacao === "nenhuma" ? [] : [{ registro, situacao }];
  });
}

function recordsOf<T>(
  registros: readonly T[],
  indice: { porId: Record<string, number>; porPessoa: Record<string, string[]> },
  pessoaId: string,
): T[] {
  return lookupList(indice.porPessoa, pessoaId).flatMap((id) => {
    const posicao = lookup(indice.porId, id);
    const registro = posicao === undefined ? undefined : registros[posicao];
    return registro === undefined ? [] : [registro];
  });
}

export function listMandates(data: AtlasData, filtro: PeriodFilter): PeriodMatch<Mandato>[] {
  const registros = recordsOf(data.conjunto.mandatos, data.indices.mandatos, filtro.pessoaId);
  return matchPeriods(data, registros, filtro.periodo);
}

/**
 * Cargos e funções da pessoa na data de um acontecimento. A data entra com a
 * precisão que tem: para um acontecimento de que só se sabe o ano, valem os
 * cargos de qualquer momento daquele ano.
 */
export function listMandatesAt(
  data: AtlasData,
  pessoaId: string,
  quando: DataHistorica,
): PeriodMatch<Mandato>[] {
  const corte = data.conjunto.edicao?.dataDeCorte;
  if (corte === undefined) return [];

  const intervalo = calcInterval(quando);
  return recordsOf(data.conjunto.mandatos, data.indices.mandatos, pessoaId).flatMap((registro) => {
    const situacao = classifyOverlap(calcPeriodBounds(registro.periodo, corte), intervalo);
    return situacao === "nenhuma" ? [] : [{ registro, situacao }];
  });
}

export function listAffiliations(data: AtlasData, filtro: PeriodFilter): PeriodMatch<Filiacao>[] {
  const registros = recordsOf(data.conjunto.filiacoes, data.indices.filiacoes, filtro.pessoaId);
  return matchPeriods(data, registros, filtro.periodo);
}

// ---------------------------------------------------------------------------
// Fontes e lugares relacionados
// ---------------------------------------------------------------------------

/** Visão de leitura do acontecimento: pessoas, lugares e citações com as fontes. */
export function getEventView(data: AtlasData, acontecimento: Acontecimento): AcontecimentoResolvido {
  return resolveEvent(acontecimento, data.conjunto);
}

/** Lugares documentados do acontecimento, na ordem do registro. Vazio quando não há ponto. */
export function getEventPlaces(data: AtlasData, acontecimento: Acontecimento): Lugar[] {
  return getEventView(data, acontecimento).lugares;
}

/** Fontes de qualquer registro com citações (pessoa, mandato, filiação, acontecimento). */
export function getSources(
  data: AtlasData,
  registro: { fontes: readonly Citacao[] },
): { citacao: Citacao; fonte: Fonte }[] {
  return registro.fontes.flatMap((citacao) => {
    const posicao = lookup(data.indices.fontes.porId, citacao.fonteId);
    const fonte = posicao === undefined ? undefined : data.conjunto.fontes[posicao];
    return fonte === undefined ? [] : [{ citacao, fonte }];
  });
}

/** Imagem pelo `id`; `null` quando o registro não tem imagem ou ela não foi publicada. */
export function getImage(data: AtlasData, imagemId: string | null): Imagem | null {
  if (imagemId === null) return null;
  const posicao = lookup(data.indices.imagens.porId, imagemId);
  return posicao === undefined ? null : (data.conjunto.imagens[posicao] ?? null);
}

/** Acontecimentos documentados em um lugar, em ordem cronológica. */
export function listEventsAtPlace(data: AtlasData, lugarId: string): Acontecimento[] {
  return filterEvents(data, { lugarIds: [lugarId] });
}

// ---------------------------------------------------------------------------
// Comparação
// ---------------------------------------------------------------------------

export interface Trajectory {
  pessoa: Pessoa;
  /** Período que a edição cobre para a pessoa; `null` se a edição não declara. */
  cobertura: Edicao["cobertura"][number] | null;
  acontecimentos: Acontecimento[];
  mandatos: PeriodMatch<Mandato>[];
  filiacoes: PeriodMatch<Filiacao>[];
}

export interface Comparison {
  trajetorias: Trajectory[];
  /** `id` dos acontecimentos que aparecem em mais de uma trajetória. */
  compartilhados: string[];
}

/**
 * As trajetórias no mesmo recorte, uma por pessoa. Um acontecimento ligado a
 * duas pessoas aparece nas duas trajetórias, uma vez em cada, e é listado em
 * `compartilhados`. Nenhuma contagem aqui é nota: a quantidade de registros
 * não mede desempenho.
 */
export function compareTrajectories(
  data: AtlasData,
  filtro: Pick<EventFilter, "periodo" | "categorias"> = {},
): Comparison {
  const trajetorias = listProfiles(data).map((pessoa) => ({
    pessoa,
    cobertura:
      data.conjunto.edicao?.cobertura.find((item) => item.pessoaId === pessoa.id) ?? null,
    acontecimentos: filterEvents(data, { ...filtro, pessoaIds: [pessoa.id] }),
    mandatos: listMandates(data, { pessoaId: pessoa.id, periodo: filtro.periodo }),
    filiacoes: listAffiliations(data, { pessoaId: pessoa.id, periodo: filtro.periodo }),
  }));

  const vistos = new Set<string>();
  const repetidos = new Set<string>();
  for (const { acontecimentos } of trajetorias) {
    for (const { id } of acontecimentos) (vistos.has(id) ? repetidos : vistos).add(id);
  }

  return {
    trajetorias,
    compartilhados: filterEvents(data, filtro)
      .filter((acontecimento) => repetidos.has(acontecimento.id))
      .map((acontecimento) => acontecimento.id),
  };
}
