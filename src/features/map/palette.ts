// Cores da base do mapa. O WebGL não lê variáveis CSS, então os valores são
// repetidos aqui. Cada um corresponde a um token de `src/app/globals.css`, e
// `tests/design.test.ts` falha se os dois lados deixarem de bater.
//
// Só a base passa por aqui. Os marcadores dos lugares são HTML e usam os
// tokens direto do CSS: cor de categoria, acento de seleção e tinta.

export const MAP_PALETTE = {
  /** --atlas-map-sea */
  mar: "#dbe3e1",
  /** --atlas-map-land */
  terra: "#ebe6da",
  /** --atlas-map-land-focus */
  terraEmFoco: "#f8f5ee",
  /** --atlas-map-border */
  fronteira: "#8f958d",
  /** --atlas-map-state */
  estado: "#cfc9b9",
  /** --atlas-map-grid */
  grade: "#c9d2cf",
} as const;

/** Token CSS de cada cor, para a conferência entre os dois lados. */
export const PALETTE_TOKENS: Record<string, string> = {
  "--atlas-map-sea": MAP_PALETTE.mar,
  "--atlas-map-land": MAP_PALETTE.terra,
  "--atlas-map-land-focus": MAP_PALETTE.terraEmFoco,
  "--atlas-map-border": MAP_PALETTE.fronteira,
  "--atlas-map-state": MAP_PALETTE.estado,
  "--atlas-map-grid": MAP_PALETTE.grade,
};
