// Consulta a um índice por chave. Os índices são objetos comuns depois de
// lidos do JSON, e um `id` como "constructor" é válido no conteúdo: ler com
// `indice[chave]` devolveria o que o objeto herda, e não o que foi indexado.

export function lookup<T>(indice: Record<string, T>, chave: string): T | undefined {
  return Object.hasOwn(indice, chave) ? indice[chave] : undefined;
}

export function lookupList<T>(indice: Record<string, T[]>, chave: string): T[] {
  return lookup(indice, chave) ?? [];
}
