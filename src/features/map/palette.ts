// Cores do mapa. O WebGL não lê variáveis CSS, então os valores são repetidos
// aqui. Cada um corresponde a um token de `src/app/globals.css`, e
// `tests/design.test.ts` falha se os dois lados deixarem de bater.

import type { Categoria } from "@/lib/domain/categories";

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
  /** --atlas-paper-raised */
  contornoDoPonto: "#fbf9f4",
  /** --atlas-accent */
  selecionado: "#b24a00",
  /** --atlas-ink */
  tinta: "#1b1c1a",
} as const;

/** Cor do ponto por categoria. No mapa a forma ainda é sempre o círculo (fase 6). */
export const CATEGORY_COLORS: Record<Categoria, string> = {
  /** --atlas-cat-mandatos */
  "mandatos-e-funcoes": "#36567a",
  /** --atlas-cat-eleicoes */
  eleicoes: "#8f5d00",
  /** --atlas-cat-partidos */
  "partidos-e-aliancas": "#7b3d6c",
  /** --atlas-cat-atuacao */
  "atuacao-institucional": "#24695b",
  /** --atlas-cat-marcos */
  "marcos-historicos": "#3b3e40",
};

/** Token CSS de cada cor, para a conferência entre os dois lados. */
export const PALETTE_TOKENS: Record<string, string> = {
  "--atlas-map-sea": MAP_PALETTE.mar,
  "--atlas-map-land": MAP_PALETTE.terra,
  "--atlas-map-land-focus": MAP_PALETTE.terraEmFoco,
  "--atlas-map-border": MAP_PALETTE.fronteira,
  "--atlas-map-state": MAP_PALETTE.estado,
  "--atlas-map-grid": MAP_PALETTE.grade,
  "--atlas-paper-raised": MAP_PALETTE.contornoDoPonto,
  "--atlas-accent": MAP_PALETTE.selecionado,
  "--atlas-ink": MAP_PALETTE.tinta,
  "--atlas-cat-mandatos": CATEGORY_COLORS["mandatos-e-funcoes"],
  "--atlas-cat-eleicoes": CATEGORY_COLORS.eleicoes,
  "--atlas-cat-partidos": CATEGORY_COLORS["partidos-e-aliancas"],
  "--atlas-cat-atuacao": CATEGORY_COLORS["atuacao-institucional"],
  "--atlas-cat-marcos": CATEGORY_COLORS["marcos-historicos"],
};
