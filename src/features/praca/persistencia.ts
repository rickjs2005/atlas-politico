// O que a praça guarda no navegador (D-153, D-155): o progresso, em uma chave
// só, e as preferências de desenho (modo leve, lista em vez da cena). Sem
// armazenamento, a praça funciona só nesta visita. Módulo sem React.

import { lerProgresso } from "@/lib/praca/regras";
import type { ConteudoDaPraca, ProgressoDaPraca } from "@/lib/praca/tipos";

export const CHAVE_DO_PROGRESSO = "atlas-politico:praca";
export const CHAVE_DAS_PREFERENCIAS = "atlas-politico:praca:preferencias";

export interface PreferenciasDaPraca {
  /** Menos custo de desenho: sem sombras, sem antialias, pixel ratio 1, sem as luzes dos postes. */
  modoLeve: boolean;
  /** Os lugares em lista, sem a cena 3D, mesmo quando o WebGL existe. */
  lista: boolean;
}

export const PREFERENCIAS_PADRAO: PreferenciasDaPraca = { modoLeve: false, lista: false };

export function lerBruto(): string | null {
  try {
    return window.localStorage.getItem(CHAVE_DO_PROGRESSO);
  } catch {
    return null;
  }
}

export function lerDoNavegador(conteudo: ConteudoDaPraca): ProgressoDaPraca | null {
  const bruto = lerBruto();
  if (bruto === null) return null;
  try {
    return lerProgresso(JSON.parse(bruto), conteudo);
  } catch {
    return null;
  }
}

export function gravarProgresso(progresso: ProgressoDaPraca, posicao: { x: number; z: number } | undefined): void {
  try {
    window.localStorage.setItem(CHAVE_DO_PROGRESSO, JSON.stringify(posicao === undefined ? progresso : { ...progresso, posicao }));
  } catch {
    // Sem armazenamento, a praça funciona só nesta visita.
  }
}

export function apagarProgresso(): void {
  try {
    window.localStorage.removeItem(CHAVE_DO_PROGRESSO);
  } catch {
    // Sem armazenamento não há o que apagar.
  }
}

// As preferências são uma fonte externa: a tela as lê com useSyncExternalStore
// (o texto gravado é o instantâneo, estável enquanto nada muda) e quem grava
// avisa os ouvintes. Sem armazenamento, o valor fica só na memória desta visita.
const ouvintes = new Set<() => void>();
let naMemoria: string | null = null;

export function assinarPreferencias(ouvinte: () => void): () => void {
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
}

export function lerPreferenciasBruto(): string | null {
  try {
    return window.localStorage.getItem(CHAVE_DAS_PREFERENCIAS) ?? naMemoria;
  } catch {
    return naMemoria;
  }
}

export function preferenciasDe(bruto: string | null): PreferenciasDaPraca {
  if (bruto === null) return PREFERENCIAS_PADRAO;
  try {
    const valor = JSON.parse(bruto) as Partial<PreferenciasDaPraca>;
    return { modoLeve: valor.modoLeve === true, lista: valor.lista === true };
  } catch {
    return PREFERENCIAS_PADRAO;
  }
}

export function lerPreferencias(): PreferenciasDaPraca {
  return preferenciasDe(lerPreferenciasBruto());
}

export function gravarPreferencias(preferencias: PreferenciasDaPraca): void {
  naMemoria = JSON.stringify(preferencias);
  try {
    window.localStorage.setItem(CHAVE_DAS_PREFERENCIAS, naMemoria);
  } catch {
    // Sem armazenamento, a preferência vale só nesta visita.
  }
  for (const ouvinte of ouvintes) ouvinte();
}

/** O progresso tem alguma história: serve para a entrada dizer "Continuar". */
export function temHistoria(progresso: ProgressoDaPraca): boolean {
  return Object.keys(progresso.pautas).length > 0 || Object.keys(progresso.atas).length > 0 || progresso.itens.length > 0 || progresso.copias.length > 0 || progresso.marcas.length > 0;
}
