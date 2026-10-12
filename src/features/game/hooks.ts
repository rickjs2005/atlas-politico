"use client";

// Estado do jogo que vem do navegador: o progresso salvo, as preferências, a
// fase pedida pelo endereço, a preferência por menos movimento e se a janela
// está ativa. Tudo por `useSyncExternalStore`, para o HTML do build sair com o
// estado padrão e o navegador assumir depois da hidratação, sem `setState` em
// efeito.

import { useCallback, useMemo, useSyncExternalStore } from "react";

import type { ProgressKeys } from "@/lib/game/content";
import { DEFAULT_PREFERENCES, PREFERENCES_KEY, parsePreferences, serializePreferences, type GamePreferences } from "@/lib/game/preferences";
import { initialProgress } from "@/lib/game/progress";
import { PHASE_PARAM, READING_PARAM, isGamePath, parseGameQuery, type GameQuery } from "@/lib/game/query";
import { createProgressStore, type ProgressStore } from "@/lib/game/storage";
import type { PersonagemSlug, PlayerProgress } from "@/lib/game/types";

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

function createProgressState(personagem: PersonagemSlug, chaves: ProgressKeys): ProgressState {
  const listeners = new Set<() => void>();
  const inicial: ProgressSnapshot = { carregado: false, progresso: initialProgress(personagem), duravel: false };
  let store: ProgressStore | null = null;
  let snapshot: ProgressSnapshot = inicial;

  const ensure = () => {
    if (store !== null) return;
    store = createProgressStore(personagem, chaves.fases, chaves.assinaturas);
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
      snapshot = { carregado: true, progresso: initialProgress(personagem), duravel: store!.duravel };
      notify();
    },
  };
}

/**
 * O progresso do personagem. `chaves` traz todas as fases dele, de todas as
 * salas, e a assinatura atual da atividade de cada uma: é o que a leitura do
 * que foi salvo precisa, e por isso vale para a sala aberta e para a entrada.
 */
export function useGameProgress(personagem: PersonagemSlug, chaves: ProgressKeys) {
  const state = useMemo(() => createProgressState(personagem, chaves), [personagem, chaves]);
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
// Preferências do jogo (as mesmas para os dois personagens)
// ---------------------------------------------------------------------------

const preferenceListeners = new Set<() => void>();
let preferencias: GamePreferences | null = null;

function readPreferences(): GamePreferences {
  if (preferencias !== null) return preferencias;
  try {
    const bruto = window.localStorage.getItem(PREFERENCES_KEY);
    preferencias = bruto === null ? DEFAULT_PREFERENCES : parsePreferences(JSON.parse(bruto));
  } catch {
    preferencias = DEFAULT_PREFERENCES;
  }
  return preferencias;
}

function writePreferences(proximas: GamePreferences) {
  preferencias = proximas;
  try {
    window.localStorage.setItem(PREFERENCES_KEY, serializePreferences(proximas));
  } catch {
    // Sem armazenamento, a preferência vale enquanto a página estiver aberta.
  }
  for (const listener of preferenceListeners) listener();
}

function subscribePreferences(listener: () => void) {
  preferenceListeners.add(listener);
  return () => {
    preferenceListeners.delete(listener);
  };
}

/** As preferências e como mudá-las. O HTML do build sai com o padrão. */
export function useGamePreferences() {
  const atual = useSyncExternalStore(subscribePreferences, readPreferences, () => DEFAULT_PREFERENCES);
  const setHumor = useCallback((humor: boolean) => writePreferences({ ...readPreferences(), humor }), []);
  const setCenario = useCallback((cenario: boolean) => writePreferences({ ...readPreferences(), cenario }), []);
  return { preferencias: atual, setHumor, setCenario };
}

// ---------------------------------------------------------------------------
// O que o endereço pede: a fase e o modo de leitura
// ---------------------------------------------------------------------------

/**
 * O que se sabe do endereço da página. O HTML do build e a hidratação saem sem
 * ele (`html`). Em uma navegação interna, o Next desenha a página antes de
 * escrever o endereço novo: nessa primeira passada o endereço do navegador
 * ainda é o da página anterior (`aguardando`), e nada dele vale para esta.
 */
export type GameAddress =
  | { situacao: "html" }
  | { situacao: "aguardando" }
  /** `consulta` é o pedido de agora; `chegada`, o pedido com que a pessoa chegou à página, antes de o jogo escrever nele a fase aberta. */
  | { situacao: "lido"; consulta: GameQuery; chegada: GameQuery };

const DO_HTML: GameAddress = { situacao: "html" };
const AGUARDANDO: GameAddress = { situacao: "aguardando" };

function createAddressReader(caminho: string) {
  let lida: string | null = null;
  let chegada: GameQuery | null = null;
  let atual: GameAddress = AGUARDANDO;
  return (): GameAddress => {
    const { pathname, search } = window.location;
    // Fora do endereço desta página (antes de ele entrar, ou depois de a pessoa sair por Voltar), fica o que já se sabia.
    if (isGamePath(pathname, caminho) && search !== lida) {
      lida = search;
      const consulta = parseGameQuery(search);
      chegada ??= consulta;
      atual = { situacao: "lido", consulta, chegada };
    }
    return atual;
  };
}

function subscribeAddress(listener: () => void) {
  window.addEventListener("popstate", listener);
  return () => window.removeEventListener("popstate", listener);
}

/**
 * O que o endereço pede ao jogo da página de `caminho`. O pedido só vale
 * quando o endereço do navegador é o dela: sem isso, "Ver desde o início",
 * aberto pela entrada, cairia na fase da retomada, porque a primeira passada
 * ainda lê o endereço da entrada. Quem traz o endereço novo é a conferência
 * que `useSyncExternalStore` faz logo depois de desenhar.
 *
 * Um link para a mesma página com outro pedido não passaria por aqui: dentro
 * do jogo, mudar de fase é ação do jogo, e não link.
 */
export function useGameAddress(caminho: string): GameAddress {
  const ler = useMemo(() => createAddressReader(caminho), [caminho]);
  return useSyncExternalStore(subscribeAddress, ler, () => DO_HTML);
}

/**
 * Escreve a fase aberta no endereço, sem criar entrada no histórico:
 * recarregar volta à mesma fase, e Voltar sai do jogo. O pedido de leitura sem
 * o cenário é só de entrada: fica no endereço enquanto ainda não virou a
 * preferência guardada (`manterLeitura`), e sai depois. Só escreve no endereço
 * da própria página (`caminho`).
 */
export function writePhaseToUrl(caminho: string, numero: number, manterLeitura: boolean) {
  if (!isGamePath(window.location.pathname, caminho)) return;
  const url = new URL(window.location.href);
  url.searchParams.set(PHASE_PARAM, String(numero));
  if (!manterLeitura) url.searchParams.delete(READING_PARAM);
  if (url.search === window.location.search) return;
  window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
}

// ---------------------------------------------------------------------------
// Preferências do navegador e janela
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

/** A aba está visível: a animação da cena para quando não. */
export function useWindowActive(): boolean {
  return useSyncExternalStore(
    subscribeWindow,
    () => document.visibilityState === "visible",
    () => true,
  );
}
