// Estado compartilhado da exploração: o que mapa, linha do tempo, lista e
// painel precisam concordar. Módulo puro; os providers React ficam em
// `AtlasStateProvider.tsx` (memória) e `AtlasUrlStateProvider.tsx` (endereço).

import type { YearSpan } from "@/lib/data/coverage";
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
  /** Volta ao recorte inicial: todo o período e todas as categorias. */
  | { type: "clearFilters" }
  | { type: "selectEvent"; slug: string | null }
  | { type: "setComparison"; ativo: boolean }
  | { type: "restore"; state: AtlasState };

/** Um recorte informado ao contrário (de 2010 até 2003) é lido na ordem certa. */
export function normalizePeriod(de: number | null, ate: number | null): AtlasState["periodo"] {
  if (de !== null && ate !== null && de > ate) return { de: ate, ate: de };
  return { de, ate };
}

/**
 * Ajusta o período aos anos que a edição cobre. Um lado igual ao limite da
 * cobertura, ou além dele, fica aberto: há uma forma só de dizer "desde o
 * começo" e "até o fim". Um período inteiro fora da cobertura não tem o que
 * mostrar nem como ser escolhido nos controles, e é descartado.
 */
export function fitPeriod(periodo: AtlasState["periodo"], cobertura: YearSpan): AtlasState["periodo"] {
  const { de, ate } = normalizePeriod(periodo.de, periodo.ate);
  if ((de !== null && de > cobertura.ate) || (ate !== null && ate < cobertura.de)) {
    return { de: null, ate: null };
  }
  return {
    de: de === null || de <= cobertura.de ? null : de,
    ate: ate === null || ate >= cobertura.ate ? null : ate,
  };
}

export function hasFilters(state: Pick<AtlasState, "periodo" | "categorias">): boolean {
  return state.categorias.length > 0 || state.periodo.de !== null || state.periodo.ate !== null;
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
    case "clearFilters":
      return { ...state, periodo: { de: null, ate: null }, categorias: [] };
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
