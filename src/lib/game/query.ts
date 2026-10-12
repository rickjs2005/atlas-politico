// O que o endereço pede ao jogo: a fase a abrir e o modo de leitura. Só
// navegação: o endereço nunca leva progresso, e abrir uma fase por ele não
// apaga nem conclui nada (docs/GAME-TRAIL.md). Funções puras.

/** O nome do parâmetro da fase no endereço: a posição na sala, a partir de 1. */
export const PHASE_PARAM = "fase";
/** O nome do parâmetro que abre a trilha em "Ler sem o cenário". */
export const READING_PARAM = "leitura";

export interface GameQuery {
  /** A posição da fase pedida, ou `null` sem pedido (ou com pedido que não é um número inteiro a partir de 1). */
  fase: number | null;
  /** O endereço pede "Ler sem o cenário". */
  leitura: boolean;
}

export const NO_QUERY: GameQuery = { fase: null, leitura: false };

/** Lê os parâmetros do jogo de uma consulta (`?fase=3&leitura=1`). */
export function parseGameQuery(consulta: string): GameQuery {
  const parametros = new URLSearchParams(consulta);
  const bruto = parametros.get(PHASE_PARAM);
  const fase = bruto !== null && /^[1-9]\d?$/.test(bruto) ? Number(bruto) : null;
  return { fase, leitura: parametros.get(READING_PARAM) === "1" };
}

/**
 * O endereço do navegador é o desta página do jogo (`caminho`, como
 * `/jogo/lula/`)? Aceita a falta da barra final, um `index.html` e um prefixo
 * de hospedagem. É o que separa o pedido desta página do da página anterior:
 * em uma navegação interna, a página nova é desenhada antes de o endereço dela
 * entrar.
 */
export function isGamePath(pathname: string, caminho: string): boolean {
  const limpar = (texto: string) => texto.replace(/index\.html$/, "").replace(/\/+$/, "");
  const esperado = limpar(caminho);
  return esperado !== "" && limpar(pathname).endsWith(esperado);
}

/** A consulta que abre uma fase: `?fase=3`, com `&leitura=1` em "Ler sem o cenário". */
export function gameQuery(numero: number, leitura = false): string {
  const parametros = new URLSearchParams({ [PHASE_PARAM]: String(numero) });
  if (leitura) parametros.set(READING_PARAM, "1");
  return `?${parametros.toString()}`;
}
