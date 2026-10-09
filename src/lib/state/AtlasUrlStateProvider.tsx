"use client";

// Estado da exploração guardado no endereço. O endereço é a fonte única: o
// estado é derivado da query string a cada renderização, e uma ação do usuário
// vira um endereço novo. Voltar, avançar, recarregar e abrir um link direto
// passam pelo mesmo caminho, e não há como estado e endereço divergirem.
//
// Exportação estática: a página é gerada no build sem query string. O HTML sai
// com o estado padrão, a hidratação acontece com esse mesmo estado, e o
// endereço real é lido logo depois (`useSyncExternalStore`).
//
// A escrita usa `window.history.pushState` e `replaceState`, que o Next
// integra ao seu roteador (docs do Next: Linking and Navigating, Native
// History API).

import { useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import type { YearSpan } from "@/lib/data/coverage";
import type { AtlasData } from "@/lib/data/types";

import { AtlasContext, deriveAtlasView } from "./AtlasStateProvider";
import type { AtlasAction } from "./atlas-state";
import { transition } from "./selectors";
import {
  chooseHistoryMode,
  historyGroupOf,
  sameSearch,
  searchFromState,
  stateFromSearch,
  type HistoryWrite,
  type UrlContext,
} from "./url-state";

// Quem precisa saber que o endereço mudou. O navegador avisa de voltar e
// avançar (`popstate`); as escritas daqui e as navegações do Next avisam por
// `notifyUrlChange`.
const listeners = new Set<() => void>();

function notifyUrlChange() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("popstate", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("popstate", listener);
  };
}

const withoutSlash = (caminho: string) => caminho.replace(/\/+$/, "");

/**
 * O Next troca o endereço depois de renderizar a página nova. Entre uma coisa
 * e outra, `window.location` ainda é o da página anterior, e a query string
 * dela não é a desta exploração.
 */
function isOwnPath(path: string): boolean {
  return withoutSlash(window.location.pathname).endsWith(withoutSlash(path));
}

/** Avisa das navegações feitas pelo roteador do Next, que não disparam `popstate`. */
function RouterWatcher() {
  const search = useSearchParams().toString();
  useEffect(() => {
    notifyUrlChange();
  }, [search]);
  return null;
}

interface AtlasUrlStateProviderProps {
  data: AtlasData;
  /** Slug da pessoa, que vem da rota. */
  pessoa: string;
  /** Caminho da exploração, como `/politicos/lula`. */
  path: string;
  /** Anos que a edição cobre para a pessoa. */
  cobertura: YearSpan | null;
  children: ReactNode;
}

export function AtlasUrlStateProvider({
  data,
  pessoa,
  path,
  cobertura,
  children,
}: AtlasUrlStateProviderProps) {
  const contexto = useMemo<UrlContext>(() => ({ pessoa, data, cobertura }), [pessoa, data, cobertura]);

  const readSearch = useCallback(() => (isOwnPath(path) ? window.location.search : ""), [path]);
  const search = useSyncExternalStore(subscribe, readSearch, () => "");
  const state = useMemo(() => stateFromSearch(search, contexto), [search, contexto]);

  const ultimaEscrita = useRef<HistoryWrite | null>(null);

  // Voltar e avançar encerram uma sequência de ajustes: o próximo ajuste cria
  // uma entrada, em vez de substituir aquela a que se voltou.
  useEffect(() => {
    const encerra = () => {
      ultimaEscrita.current = null;
    };
    window.addEventListener("popstate", encerra);
    return () => window.removeEventListener("popstate", encerra);
  }, []);

  const dispatch = useCallback(
    (action: AtlasAction) => {
      if (!isOwnPath(path)) return;
      // O ponto de partida é o endereço do momento, e não o da última
      // renderização: duas ações no mesmo gesto somam, em vez de se atropelar.
      const atual = stateFromSearch(window.location.search, contexto);
      const proximo = transition(atual, action, contexto.data, contexto.cobertura);
      const destino = searchFromState(window.location.search, proximo);
      if (sameSearch(destino, window.location.search)) return;

      const agora = Date.now();
      const modo = chooseHistoryMode(action, ultimaEscrita.current, agora);
      ultimaEscrita.current = { grupo: historyGroupOf(action), em: agora };

      const url = destino === "" ? window.location.pathname : `?${destino}`;
      if (modo === "push") window.history.pushState(null, "", url);
      else window.history.replaceState(null, "", url);
      notifyUrlChange();
    },
    [path, contexto],
  );

  // Forma canônica: um endereço com parâmetro inválido, fora da cobertura ou
  // fora de ordem é reescrito no lugar, sem criar entrada no histórico.
  useEffect(() => {
    if (!isOwnPath(path)) return;
    const atual = window.location.search;
    const canonico = searchFromState(atual, stateFromSearch(atual, contexto));
    if (sameSearch(canonico, atual)) return;
    window.history.replaceState(
      null,
      "",
      canonico === "" ? window.location.pathname : `?${canonico}`,
    );
    notifyUrlChange();
  }, [search, path, contexto]);

  const view = useMemo(() => deriveAtlasView(data, state), [data, state]);
  const value = useMemo(() => ({ ...view, dispatch }), [view, dispatch]);

  return (
    <AtlasContext value={value}>
      {/* `useSearchParams` tira da pré-renderização o que estiver até o
          `Suspense` mais próximo. Aqui ele fica isolado em um componente sem
          saída visual, e a exploração inteira continua no HTML gerado. */}
      <Suspense fallback={null}>
        <RouterWatcher />
      </Suspense>
      {children}
    </AtlasContext>
  );
}
