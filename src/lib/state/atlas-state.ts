// Estado compartilhado da exploração: o que mapa, linha do tempo, lista e
// painel precisam concordar. Módulo puro; o provider React fica em
// `AtlasStateProvider.tsx`.

import type { Categoria } from "@/lib/domain/categories";

export interface AtlasState {
  /** Slug da pessoa em foco; `null` quando nenhuma foi escolhida. */
  pessoa: string | null;
  /** Recorte em anos, pontas inclusas. `null` deixa aquele lado aberto. */
  periodo: { de: number | null; ate: number | null };
  /** Lista vazia significa todas as categorias. */
  categorias: Categoria[];
  /** Slug do acontecimento aberto no painel. */
  acontecimento: string | null;
  /** Modo de comparação: as trajetórias lado a lado no mesmo recorte. */
  comparar: boolean;
}

export const INITIAL_STATE: AtlasState = {
  pessoa: null,
  periodo: { de: null, ate: null },
  categorias: [],
  acontecimento: null,
  comparar: false,
};

export type AtlasAction =
  | { type: "selectPerson"; slug: string | null }
  | { type: "setPeriod"; de: number | null; ate: number | null }
  | { type: "toggleCategory"; categoria: Categoria }
  | { type: "clearCategories" }
  | { type: "selectEvent"; slug: string | null }
  | { type: "setComparison"; ativo: boolean }
  | { type: "restore"; state: AtlasState };

/** Um recorte informado ao contrário (de 2010 até 2003) é lido na ordem certa. */
export function normalizePeriod(de: number | null, ate: number | null): AtlasState["periodo"] {
  if (de !== null && ate !== null && de > ate) return { de: ate, ate: de };
  return { de, ate };
}

export function atlasReducer(state: AtlasState, action: AtlasAction): AtlasState {
  switch (action.type) {
    case "selectPerson":
      return { ...state, pessoa: action.slug };
    case "setPeriod":
      return { ...state, periodo: normalizePeriod(action.de, action.ate) };
    case "toggleCategory": {
      const ativa = state.categorias.includes(action.categoria);
      return {
        ...state,
        categorias: ativa
          ? state.categorias.filter((categoria) => categoria !== action.categoria)
          : [...state.categorias, action.categoria],
      };
    }
    case "clearCategories":
      return { ...state, categorias: [] };
    case "selectEvent":
      return { ...state, acontecimento: action.slug };
    case "setComparison":
      return { ...state, comparar: action.ativo };
    case "restore":
      return {
        ...action.state,
        periodo: normalizePeriod(action.state.periodo.de, action.state.periodo.ate),
      };
  }
}
