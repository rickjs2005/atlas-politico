// JSON com chaves em ordem alfabética, em todos os níveis. É o que faz a mesma
// entrada gerar os mesmos bytes: o resultado não depende da ordem em que os
// campos foram digitados no conteúdo nem da ordem em que o código os montou.
// A ordem das listas é mantida, porque nelas a ordem é informação.

function sortKeys(valor: unknown): unknown {
  if (Array.isArray(valor)) return valor.map(sortKeys);
  if (typeof valor !== "object" || valor === null) return valor;

  const entradas = Object.entries(valor as Record<string, unknown>)
    .filter(([, item]) => item !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([chave, item]) => [chave, sortKeys(item)] as const);
  return Object.fromEntries(entradas);
}

/** Texto de arquivo: recuado com dois espaços e com quebra de linha no fim. */
export function stableStringify(valor: unknown): string {
  return `${JSON.stringify(sortKeys(valor), null, 2)}\n`;
}

/** Forma compacta, para comparar dois valores e para calcular impressões digitais. */
export function canonicalJson(valor: unknown): string {
  return JSON.stringify(sortKeys(valor));
}
