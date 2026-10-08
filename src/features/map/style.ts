// Estilo do mapa, montado localmente: fundo, grade e pontos. Sem tiles, sem
// sprites e sem glyphs, portanto sem nenhuma requisição externa. Rótulos de
// texto exigem arquivos de glyphs e ficam para a fase 6.
//
// As cores repetem os tokens de `globals.css` porque o WebGL não lê variáveis
// CSS. A fase 4 define a paleta final e como manter as duas em sincronia.

import type { FilterSpecification, StyleSpecification } from "maplibre-gl";

import { buildGraticule } from "./graticule";

export const MAP_SOURCES = { grade: "grade", acontecimentos: "acontecimentos" } as const;

export const MAP_LAYERS = {
  fundo: "fundo",
  grade: "grade",
  pontos: "pontos",
  selecionado: "ponto-selecionado",
} as const;

/** Enquadramento inicial `[oeste, sul, leste, norte]`: território brasileiro com margem. */
export const INITIAL_BOUNDS: [number, number, number, number] = [-76, -36, -26, 8];

const COLORS = {
  fundo: "#dfe8ea",
  grade: "#bccbd0",
  ponto: "#17495a",
  contorno: "#ffffff",
  selecionado: "#b3470d",
};

export function selectionFilter(slug: string | null): FilterSpecification {
  return ["==", ["get", "acontecimentoSlug"], slug ?? ""];
}

export function buildBaseStyle(): StyleSpecification {
  return {
    version: 8,
    name: "Atlas Político: base local",
    sources: {
      [MAP_SOURCES.grade]: { type: "geojson", data: buildGraticule(10) },
      [MAP_SOURCES.acontecimentos]: {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      },
    },
    layers: [
      {
        id: MAP_LAYERS.fundo,
        type: "background",
        paint: { "background-color": COLORS.fundo },
      },
      {
        id: MAP_LAYERS.grade,
        type: "line",
        source: MAP_SOURCES.grade,
        paint: { "line-color": COLORS.grade, "line-width": 1 },
      },
      {
        id: MAP_LAYERS.pontos,
        type: "circle",
        source: MAP_SOURCES.acontecimentos,
        paint: {
          "circle-radius": 7,
          "circle-color": COLORS.ponto,
          "circle-stroke-width": 2,
          "circle-stroke-color": COLORS.contorno,
        },
      },
      {
        id: MAP_LAYERS.selecionado,
        type: "circle",
        source: MAP_SOURCES.acontecimentos,
        filter: selectionFilter(null),
        paint: {
          "circle-radius": 11,
          "circle-color": COLORS.selecionado,
          "circle-stroke-width": 3,
          "circle-stroke-color": COLORS.contorno,
        },
      },
    ],
  };
}
