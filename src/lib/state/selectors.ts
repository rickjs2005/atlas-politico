// Seletores puros: derivam o recorte visível a partir do estado e dos dados.
// Lista, mapa e painel leem todos o mesmo resultado, por isso não divergem.
// A filtragem em si é das consultas (`@/lib/data/queries`); aqui só se traduz
// o estado da exploração para um filtro.

import type { YearSpan } from "@/lib/data/coverage";
import { compareTrajectories, filterEvents, findPersonBySlug, type Comparison } from "@/lib/data/queries";
import type { AtlasData } from "@/lib/data/types";
import type { Acontecimento } from "@/lib/domain/types";

import { atlasReducer, fitPeriod, type AtlasAction, type AtlasState } from "./atlas-state";

export function selectVisibleEvents(data: AtlasData, state: AtlasState): Acontecimento[] {
  // Na comparação entram as duas trajetórias; fora dela, só a pessoa em foco.
  const filtraPessoa = !state.comparar && state.pessoa !== null;
  const pessoa = filtraPessoa && state.pessoa !== null ? findPersonBySlug(data, state.pessoa) : null;
  if (filtraPessoa && pessoa === null) return [];

  return filterEvents(data, {
    pessoaIds: pessoa === null ? [] : [pessoa.id],
    periodo: state.periodo,
    categorias: state.categorias,
  });
}

/**
 * As trajetórias da comparação no recorte do estado: o mesmo período e as
 * mesmas categorias, aplicados a cada pessoa pela mesma consulta. A união dos
 * acontecimentos das trajetórias é o que `selectVisibleEvents` devolve com
 * `comparar` ligado.
 */
export function selectComparison(data: AtlasData, state: AtlasState): Comparison {
  return compareTrajectories(data, { periodo: state.periodo, categorias: state.categorias });
}

export function selectSelectedEvent(
  visible: Acontecimento[],
  state: AtlasState,
): Acontecimento | null {
  if (state.acontecimento === null) return null;
  return visible.find((item) => item.slug === state.acontecimento) ?? null;
}

/**
 * Regra de consistência: o acontecimento selecionado sempre pertence ao
 * recorte visível. Se um filtro o esconde, ou se um endereço restaurado aponta
 * para um slug que não existe, a seleção é desfeita.
 */
export function reconcileSelection(state: AtlasState, visible: Acontecimento[]): AtlasState {
  if (state.acontecimento === null) return state;
  if (visible.some((item) => item.slug === state.acontecimento)) return state;
  return { ...state, acontecimento: null };
}

/**
 * Deixa o estado coerente com os dados: o período dentro do que a edição
 * cobre, quando a cobertura é informada, e a seleção dentro do recorte.
 */
export function settle(state: AtlasState, data: AtlasData, cobertura?: YearSpan | null): AtlasState {
  let ajustado = state;
  if (cobertura) {
    const periodo = fitPeriod(state.periodo, cobertura);
    if (periodo.de !== state.periodo.de || periodo.ate !== state.periodo.ate) {
      ajustado = { ...state, periodo };
    }
  }
  return reconcileSelection(ajustado, selectVisibleEvents(data, ajustado));
}

/** Transição completa: aplica a ação e garante as regras de consistência. */
export function transition(
  state: AtlasState,
  action: AtlasAction,
  data: AtlasData,
  cobertura?: YearSpan | null,
): AtlasState {
  return settle(atlasReducer(state, action), data, cobertura);
}
