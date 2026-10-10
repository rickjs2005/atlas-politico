"use client";

// Estado do jogo que vem do navegador: o progresso salvo, a preferência por
// menos movimento, o tipo de ponteiro e se a janela está ativa. Tudo por
// `useSyncExternalStore`, para o HTML do build sair com o estado padrão e o
// navegador assumir depois da hidratação, sem `setState` em efeito.

import { useCallback, useMemo, useSyncExternalStore } from "react";

import { initialProgress } from "@/lib/game/progress";
import { createProgressStore, type ProgressStore } from "@/lib/game/storage";
import type { ChapterSpec, PersonagemSlug, PlayerProgress } from "@/lib/game/types";

// ---------------------------------------------------------------------------
// Progresso
// ---------------------------------------------------------------------------

interface ProgressSnapshot {
  /** O navegador já leu o armazenamento. Falso no HTML do build. */
  carregado: boolean;
  progresso: PlayerProgress;
  /** O progresso será guardado entre visitas. */
  duravel: boolean;
}

interface ProgressState {
  subscribe(listener: () => void): () => void;
  get(): ProgressSnapshot;
  getServer(): ProgressSnapshot;
  set(proximo: PlayerProgress): void;
  reset(): void;
}

function createProgressState(personagem: PersonagemSlug, capitulos: readonly ChapterSpec[]): ProgressState {
  const listeners = new Set<() => void>();
  const inicial: ProgressSnapshot = { carregado: false, progresso: initialProgress(personagem, capitulos), duravel: false };
  let store: ProgressStore | null = null;
  let snapshot: ProgressSnapshot = inicial;

  const ensure = () => {
    if (store !== null) return;
    store = createProgressStore(personagem, capitulos);
    const salvo = store.load();
    snapshot = { carregado: true, progresso: salvo ?? inicial.progresso, duravel: store.duravel };
  };
  const notify = () => {
    for (const listener of listeners) listener();
  };

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    get() {
      ensure();
      return snapshot;
    },
    getServer: () => inicial,
    set(proximo) {
      ensure();
      if (proximo === snapshot.progresso) return;
      const guardou = store!.save(proximo);
      snapshot = { carregado: true, progresso: proximo, duravel: guardou };
      notify();
    },
    reset() {
      ensure();
      store!.clear();
      snapshot = { carregado: true, progresso: initialProgress(personagem, capitulos), duravel: store!.duravel };
      notify();
    },
  };
}

export function useGameProgress(personagem: PersonagemSlug, capitulos: readonly ChapterSpec[]) {
  const state = useMemo(() => createProgressState(personagem, capitulos), [personagem, capitulos]);
  const snapshot = useSyncExternalStore(state.subscribe, state.get, state.getServer);
  const update = useCallback(
    (fn: (atual: PlayerProgress) => PlayerProgress) => {
      state.set(fn(state.get().progresso));
    },
    [state],
  );
  const reset = useCallback(() => state.reset(), [state]);
  return { ...snapshot, update, reset };
}

// ---------------------------------------------------------------------------
// Preferências e janela
// ---------------------------------------------------------------------------

function useMediaQuery(consulta: string, padrao: boolean): boolean {
  const subscribe = useCallback(
    (listener: () => void) => {
      const lista = window.matchMedia(consulta);
      lista.addEventListener("change", listener);
      return () => lista.removeEventListener("change", listener);
    },
    [consulta],
  );
  const get = useCallback(() => window.matchMedia(consulta).matches, [consulta]);
  return useSyncExternalStore(subscribe, get, () => padrao);
}

/** Movimento ligado: a pessoa não pediu menos movimento. */
export function useMotion(): boolean {
  return !useMediaQuery("(prefers-reduced-motion: reduce)", false);
}

/** Ponteiro grosso (toque): os controles de toque aparecem. */
export function useCoarsePointer(): boolean {
  return useMediaQuery("(pointer: coarse)", false);
}

function subscribeWindow(listener: () => void) {
  window.addEventListener("focus", listener);
  window.addEventListener("blur", listener);
  document.addEventListener("visibilitychange", listener);
  return () => {
    window.removeEventListener("focus", listener);
    window.removeEventListener("blur", listener);
    document.removeEventListener("visibilitychange", listener);
  };
}

/** A aba está visível e a janela tem o foco: o jogo pausa quando não. */
export function useWindowActive(): boolean {
  return useSyncExternalStore(
    subscribeWindow,
    () => document.visibilityState === "visible" && document.hasFocus(),
    () => true,
  );
}
