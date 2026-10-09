"use client";

// Leitura do endereço no navegador, para as telas que guardam a consulta na
// query string: a exploração, a comparação e o retorno da página de um
// acontecimento.
//
// Exportação estática: as páginas são geradas no build sem query string. O
// HTML sai com o estado padrão, a hidratação acontece com esse mesmo estado, e
// o endereço real é lido logo depois (`useSyncExternalStore`).

import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useSyncExternalStore } from "react";

// Quem precisa saber que o endereço mudou. O navegador avisa de voltar e
// avançar (`popstate`); as escritas do atlas e as navegações do Next avisam
// por `notifyUrlChange`.
const listeners = new Set<() => void>();

export function notifyUrlChange() {
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
 * dela não é a desta tela.
 */
export function isOwnPath(path: string): boolean {
  return withoutSlash(window.location.pathname).endsWith(withoutSlash(path));
}

/**
 * A query string da página, com o `?`. Vazia no HTML do build, durante a
 * hidratação e enquanto o endereço ainda é o da página anterior.
 */
export function useOwnSearch(path: string): string {
  const read = useCallback(() => (isOwnPath(path) ? window.location.search : ""), [path]);
  return useSyncExternalStore(subscribe, read, () => "");
}

/** Avisa das navegações feitas pelo roteador do Next, que não disparam `popstate`. */
function RouterWatcher() {
  const search = useSearchParams().toString();
  useEffect(() => {
    notifyUrlChange();
  }, [search]);
  return null;
}

/**
 * `useSearchParams` tira da pré-renderização o que estiver até o `Suspense`
 * mais próximo. Aqui ele fica isolado em um componente sem saída visual, e a
 * tela que o usa continua inteira no HTML gerado.
 */
export function UrlWatcher() {
  return (
    <Suspense fallback={null}>
      <RouterWatcher />
    </Suspense>
  );
}

const noop = () => () => {};

/** A origem em que a página está aberta (`https://exemplo.org`). Vazia no HTML do build. */
export function useOrigin(): string {
  return useSyncExternalStore(
    noop,
    () => window.location.origin,
    () => "",
  );
}
