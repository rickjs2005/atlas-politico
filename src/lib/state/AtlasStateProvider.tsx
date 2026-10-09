"use client";

// Estado central da exploração. Quem estiver abaixo de um provider lê o mesmo
// estado e o mesmo recorte visível; ninguém guarda seleção por conta própria.
//
// Há dois providers, com o mesmo contrato para quem consome (`useAtlas`):
//   - este, que guarda o estado em memória (telas de prova e testes);
//   - `AtlasUrlStateProvider`, que deriva o estado do endereço (exploração).

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";

import type { AtlasData } from "@/lib/data/types";
import type { Acontecimento } from "@/lib/domain/types";

import { INITIAL_STATE, type AtlasAction, type AtlasState } from "./atlas-state";
import {
  reconcileSelection,
  selectSelectedEvent,
  selectVisibleEvents,
  transition,
} from "./selectors";

export interface AtlasContextValue {
  /** Pessoa, período, categorias e acontecimento aberto. */
  state: AtlasState;
  dispatch: (action: AtlasAction) => void;
  data: AtlasData;
  /** Acontecimentos do recorte atual, em ordem cronológica. */
  visible: Acontecimento[];
  /** `id` dos acontecimentos do recorte, na mesma ordem: o que o mapa filtra. */
  visibleIds: readonly string[];
  selected: Acontecimento | null;
}

export const AtlasContext = createContext<AtlasContextValue | null>(null);

/** O que sai do estado e dos dados: recorte e seleção vêm sempre do mesmo lugar. */
export function deriveAtlasView(
  data: AtlasData,
  state: AtlasState,
): Omit<AtlasContextValue, "dispatch"> {
  const visible = selectVisibleEvents(data, state);
  return {
    state,
    data,
    visible,
    visibleIds: visible.map((item) => item.id),
    selected: selectSelectedEvent(visible, state),
  };
}

interface AtlasStateProviderProps {
  data: AtlasData;
  initialState?: AtlasState;
  children: ReactNode;
}

export function AtlasStateProvider({
  data,
  initialState = INITIAL_STATE,
  children,
}: AtlasStateProviderProps) {
  const reducer = useCallback(
    (state: AtlasState, action: AtlasAction) => transition(state, action, data),
    [data],
  );
  const [state, dispatch] = useReducer(reducer, initialState, (inicial) =>
    reconcileSelection(inicial, selectVisibleEvents(data, inicial)),
  );

  const value = useMemo(() => ({ ...deriveAtlasView(data, state), dispatch }), [data, state]);

  return <AtlasContext value={value}>{children}</AtlasContext>;
}

export function useAtlas(): AtlasContextValue {
  const value = useContext(AtlasContext);
  if (value === null) {
    throw new Error("useAtlas precisa estar dentro de um provider do estado do atlas.");
  }
  return value;
}
