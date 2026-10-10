"use client";

// Estado da exploração e da comparação guardado no endereço. O endereço é a
// fonte única: o estado é derivado da query string a cada renderização, e uma
// ação do usuário vira um endereço novo. Voltar, avançar, recarregar e abrir
// um link direto passam pelo mesmo caminho, e não há como estado e endereço
// divergirem.
//
// A leitura do endereço fica em `location.tsx`, que também serve ao retorno da
// página de um acontecimento.
//
// A escrita usa `window.history.pushState` e `replaceState`, que o Next
// integra ao seu roteador (docs do Next: Linking and Navigating, Native
// History API).

import { useCallback, useEffect, useMemo, useRef, type ReactNode } from "react";

import type { YearSpan } from "@/lib/data/coverage";
import type { AtlasData } from "@/lib/data/types";
import type { Categoria } from "@/lib/domain/categories";

import { AtlasContext } from "./AtlasStateProvider";
import type { AtlasAction, AtlasState } from "./atlas-state";
import { selectSelectedEvent, selectVisibleEvents } from "./selectors";
import { UrlWatcher, isOwnPath, notifyUrlChange, useOwnSearch } from "./location";
import {
  chooseHistoryMode,
  historyGroupOf,
  sameSearch,
  searchFromState,
  stateAfter,
  stateFromSearch,
  type HistoryWrite,
  type UrlContext,
} from "./url-state";

interface AtlasUrlStateProviderProps {
  data: AtlasData;
  /** Slug da pessoa, que vem da rota. `null` na comparação. */
  pessoa: string | null;
  /** A rota é a comparação: o recorte vale para as duas trajetórias. */
  comparar?: boolean;
  /** Caminho da tela, como `/politicos/lula` ou `/comparar`. */
  path: string;
  /** Anos que podem ser consultados: a cobertura da pessoa ou a escala comum. */
  cobertura: YearSpan | null;
  children: ReactNode;
}

export function AtlasUrlStateProvider({
  data,
  pessoa,
  comparar = false,
  path,
  cobertura,
  children,
}: AtlasUrlStateProviderProps) {
  const contexto = useMemo<UrlContext>(
    () => ({ pessoa, comparar, data, cobertura }),
    [pessoa, comparar, data, cobertura],
  );

  const search = useOwnSearch(path);
  const lido = useMemo(() => stateFromSearch(search, contexto), [search, contexto]);

  // O período e as categorias mantêm a mesma identidade enquanto não mudam.
  // Abrir ou fechar um acontecimento muda o endereço, mas não o recorte: a
  // lista, os pontos do mapa e as contagens não são refeitos por isso.
  const { de, ate } = lido.periodo;
  const periodo = useMemo(() => ({ de, ate }), [de, ate]);
  const categoriasLidas = lido.categorias.join(",");
  const categorias = useMemo(
    () => (categoriasLidas === "" ? [] : (categoriasLidas.split(",") as Categoria[])),
    [categoriasLidas],
  );
  const state = useMemo<AtlasState>(() => ({ ...lido, periodo, categorias }), [lido, periodo, categorias]);

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
      const proximo = stateAfter(window.location.search, action, contexto);
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
    if (!sameSearch(canonico, atual)) {
      window.history.replaceState(
        null,
        "",
        canonico === "" ? window.location.pathname : `?${canonico}`,
      );
      notifyUrlChange();
    }
    // O endereço já foi lido: o que estava encoberto à espera da consulta
    // aparece, já no recorte certo (globals.css, `data-consulta`). A conferência
    // vem depois da correção de propósito. Quando o endereço corrigido fica sem
    // consulta, ele passa a ser igual ao que a tela já mostra, nenhuma nova
    // renderização acontece e esta é a única passagem por aqui.
    if (search === window.location.search) {
      document.documentElement.removeAttribute("data-consulta");
    }
  }, [search, path, contexto]);

  // O recorte visível depende de quem, quando e o quê, e não do acontecimento aberto.
  const visible = useMemo(
    () =>
      selectVisibleEvents(data, {
        pessoa: lido.pessoa,
        comparar: lido.comparar,
        periodo,
        categorias,
        acontecimento: null,
      }),
    [data, lido.pessoa, lido.comparar, periodo, categorias],
  );
  const visibleIds = useMemo(() => visible.map((item) => item.id), [visible]);
  const value = useMemo(
    () => ({ state, data, visible, visibleIds, selected: selectSelectedEvent(visible, state), dispatch }),
    [state, data, visible, visibleIds, dispatch],
  );

  return (
    <AtlasContext value={value}>
      <UrlWatcher />
      {children}
    </AtlasContext>
  );
}
