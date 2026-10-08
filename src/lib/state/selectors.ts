// Seletores puros: derivam o recorte visível a partir do estado e dos dados.
// Lista, mapa e painel leem todos o mesmo resultado, por isso não divergem.

import {
  YEAR_BOUNDS,
  calcInterval,
  compareDates,
  intervalsOverlap,
  yearRangeInterval,
} from "@/lib/domain/dates";
import type { Acontecimento, Conjunto } from "@/lib/domain/types";

import { atlasReducer, type AtlasAction, type AtlasState } from "./atlas-state";

/** Dados que a exploração recebe do build: só registros revisados. */
export type ExplorerData = Pick<Conjunto, "pessoas" | "acontecimentos" | "lugares" | "fontes">;

export function selectVisibleEvents(
  data: Pick<ExplorerData, "pessoas" | "acontecimentos">,
  state: AtlasState,
): Acontecimento[] {
  // Na comparação entram as duas trajetórias; fora dela, só a pessoa em foco.
  const filtraPessoa = !state.comparar && state.pessoa !== null;
  const pessoaId = filtraPessoa
    ? data.pessoas.find((pessoa) => pessoa.slug === state.pessoa)?.id
    : undefined;
  if (filtraPessoa && pessoaId === undefined) return [];

  const recorte = yearRangeInterval(
    state.periodo.de ?? YEAR_BOUNDS.min,
    state.periodo.ate ?? YEAR_BOUNDS.max,
  );

  return data.acontecimentos
    .filter((acontecimento) => {
      if (pessoaId !== undefined && !acontecimento.pessoaIds.includes(pessoaId)) return false;
      if (state.categorias.length > 0 && !state.categorias.includes(acontecimento.categoria)) {
        return false;
      }
      return intervalsOverlap(calcInterval(acontecimento.data), recorte);
    })
    .sort((a, b) => compareDates(a.data, b.data) || a.id.localeCompare(b.id));
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

/** Transição completa: aplica a ação e garante a regra de consistência. */
export function transition(
  state: AtlasState,
  action: AtlasAction,
  data: Pick<ExplorerData, "pessoas" | "acontecimentos">,
): AtlasState {
  const next = atlasReducer(state, action);
  return reconcileSelection(next, selectVisibleEvents(data, next));
}
