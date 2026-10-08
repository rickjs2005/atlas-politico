"use client";

// Estado central da exploração. Quem estiver abaixo deste provider lê o mesmo
// estado e o mesmo recorte visível; ninguém guarda seleção por conta própria.

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";

import type { Acontecimento } from "@/lib/domain/types";

import { INITIAL_STATE, type AtlasAction, type AtlasState } from "./atlas-state";
import {
  reconcileSelection,
  selectSelectedEvent,
  selectVisibleEvents,
  transition,
  type ExplorerData,
} from "./selectors";

interface AtlasContextValue {
  state: AtlasState;
  dispatch: Dispatch<AtlasAction>;
  data: ExplorerData;
  /** Acontecimentos do recorte atual, em ordem cronológica. */
  visible: Acontecimento[];
  selected: Acontecimento | null;
}

const AtlasContext = createContext<AtlasContextValue | null>(null);

interface AtlasStateProviderProps {
  data: ExplorerData;
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

  const value = useMemo<AtlasContextValue>(() => {
    const visible = selectVisibleEvents(data, state);
    return { state, dispatch, data, visible, selected: selectSelectedEvent(visible, state) };
  }, [data, state]);

  return <AtlasContext value={value}>{children}</AtlasContext>;
}

export function useAtlas(): AtlasContextValue {
  const value = useContext(AtlasContext);
  if (value === null) {
    throw new Error("useAtlas precisa estar dentro de <AtlasStateProvider>.");
  }
  return value;
}
