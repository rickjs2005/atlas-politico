// As preferências do Vale a Faixa, no navegador: os volumes dos efeitos, da
// torcida e da narração, o silêncio geral, se a narração está ligada, se o
// tutorial já foi visto, o último personagem escolhido e o placar da pessoa
// contra o computador. Nada vai ao endereço nem a servidor algum.

import type { LutadorSlug } from "@/lib/faixa/tipos";

export const CHAVE_DAS_PREFERENCIAS = "atlas-politico:faixa:preferencias";

export interface Preferencias {
  volumeEfeitos: number;
  volumeTorcida: number;
  volumeNarracao: number;
  mudo: boolean;
  narracao: boolean;
  tutorialVisto: boolean;
  personagem: LutadorSlug | null;
  partidas: number;
  vitorias: number;
}

export const PREFERENCIAS_PADRAO: Preferencias = {
  volumeEfeitos: 0.7,
  volumeTorcida: 0.5,
  volumeNarracao: 0.9,
  mudo: false,
  narracao: true,
  tutorialVisto: false,
  personagem: null,
  partidas: 0,
  vitorias: 0,
};

const fracao = (valor: unknown, padrao: number): number => (typeof valor === "number" && valor >= 0 && valor <= 1 ? valor : padrao);
const contagem = (valor: unknown): number => (typeof valor === "number" && valor >= 0 ? Math.floor(valor) : 0);

/** As preferências a partir do texto guardado; qualquer coisa inválida vira o padrão. O `volume` antigo vale para efeitos e torcida. */
export function preferenciasDe(bruto: string | null): Preferencias {
  if (bruto === null) return PREFERENCIAS_PADRAO;
  try {
    const lido = JSON.parse(bruto) as Partial<Preferencias> & { volume?: unknown };
    const antigo = fracao(lido.volume, PREFERENCIAS_PADRAO.volumeEfeitos);
    return {
      volumeEfeitos: fracao(lido.volumeEfeitos, antigo),
      volumeTorcida: fracao(lido.volumeTorcida, Math.min(antigo, PREFERENCIAS_PADRAO.volumeTorcida)),
      volumeNarracao: fracao(lido.volumeNarracao, PREFERENCIAS_PADRAO.volumeNarracao),
      mudo: lido.mudo === true,
      narracao: lido.narracao !== false,
      tutorialVisto: lido.tutorialVisto === true,
      personagem: lido.personagem === "lula" || lido.personagem === "flavio-bolsonaro" ? lido.personagem : null,
      partidas: contagem(lido.partidas),
      vitorias: contagem(lido.vitorias),
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
