// As preferências do Vale a Faixa, no navegador: volume, silêncio, se o
// tutorial já foi visto, o último personagem escolhido e o placar da pessoa
// contra o computador. Nada vai ao endereço nem a servidor algum.

import type { LutadorSlug } from "@/lib/faixa/tipos";

export const CHAVE_DAS_PREFERENCIAS = "atlas-politico:faixa:preferencias";

export interface Preferencias {
  volume: number;
  mudo: boolean;
  tutorialVisto: boolean;
  personagem: LutadorSlug | null;
  partidas: number;
  vitorias: number;
}

export const PREFERENCIAS_PADRAO: Preferencias = { volume: 0.7, mudo: false, tutorialVisto: false, personagem: null, partidas: 0, vitorias: 0 };

/** As preferências a partir do texto guardado; qualquer coisa inválida vira o padrão. */
export function preferenciasDe(bruto: string | null): Preferencias {
  if (bruto === null) return PREFERENCIAS_PADRAO;
  try {
    const lido = JSON.parse(bruto) as Partial<Preferencias>;
    return {
      volume: typeof lido.volume === "number" && lido.volume >= 0 && lido.volume <= 1 ? lido.volume : PREFERENCIAS_PADRAO.volume,
      mudo: lido.mudo === true,
      tutorialVisto: lido.tutorialVisto === true,
      personagem: lido.personagem === "lula" || lido.personagem === "flavio-bolsonaro" ? lido.personagem : null,
      partidas: typeof lido.partidas === "number" && lido.partidas >= 0 ? Math.floor(lido.partidas) : 0,
      vitorias: typeof lido.vitorias === "number" && lido.vitorias >= 0 ? Math.floor(lido.vitorias) : 0,
    };
  } catch {
    return PREFERENCIAS_PADRAO;
  }
}

export function lerPreferencias(): Preferencias {
  return preferenciasDe(lerBruto());
}

// As preferências são uma fonte externa para o React (useSyncExternalStore):
// o texto guardado é o instantâneo, e gravar avisa quem assinou.
const ouvintes = new Set<() => void>();
let memoria: string | null = null;

/** O texto guardado, ou `null`; sem armazenamento, o que foi gravado nesta visita. */
export function lerBruto(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(CHAVE_DAS_PREFERENCIAS) ?? memoria;
  } catch {
    return memoria;
  }
}

export function assinarPreferencias(ouvinte: () => void): () => void {
  ouvintes.add(ouvinte);
  return () => ouvintes.delete(ouvinte);
}

export function gravarPreferencias(preferencias: Preferencias): void {
  if (typeof window === "undefined") return;
  memoria = JSON.stringify(preferencias);
  try {
    window.localStorage.setItem(CHAVE_DAS_PREFERENCIAS, memoria);
  } catch {
    // Sem armazenamento (modo privado, cota): vale só nesta visita.
  }
  for (const ouvinte of ouvintes) ouvinte();
}

// A tela de toque, como fonte externa: muda se a pessoa ligar um mouse.
const CONSULTA_DE_TOQUE = "(pointer: coarse)";

export function assinarToque(ouvinte: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const consulta = window.matchMedia(CONSULTA_DE_TOQUE);
  consulta.addEventListener("change", ouvinte);
  return () => consulta.removeEventListener("change", ouvinte);
}

export function lerToque(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(CONSULTA_DE_TOQUE).matches;
}
