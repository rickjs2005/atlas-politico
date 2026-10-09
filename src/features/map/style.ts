// Estilo do mapa, montado localmente: mar, grade, terra, divisas e pontos. Sem
// tiles, sem sprites e sem glyphs. Rótulos de texto exigem arquivos de glyphs
// e ficam para a fase 6, com a base cartográfica definitiva.
//
// A terra e os estados vêm de dois arquivos do próprio projeto
// (`base/README.md`), entregues pelo build. Quem monta o mapa passa os
// endereços; aqui eles são só texto, para o estilo continuar testável.

import type { ExpressionSpecification, FilterSpecification, StyleSpecification } from "maplibre-gl";

import { CATEGORIAS } from "@/lib/domain/categories";

import { buildGraticule } from "./graticule";
import { CATEGORY_COLORS, MAP_PALETTE } from "./palette";

export const MAP_SOURCES = {
  grade: "grade",
  terra: "terra",
  estados: "estados",
  acontecimentos: "acontecimentos",
} as const;

export const MAP_LAYERS = {
  mar: "mar",
  grade: "grade",
  terra: "terra",
  terraEmFoco: "terra-em-foco",
  estados: "estados",
  fronteiras: "fronteiras",
  pontos: "pontos",
  halo: "ponto-selecionado-halo",
  selecionado: "ponto-selecionado",
} as const;

/** Enquadramento inicial `[oeste, sul, leste, norte]`: território brasileiro com margem. */
export const INITIAL_BOUNDS: [number, number, number, number] = [-76, -36, -26, 8];

/** Endereços dos arquivos da base, resolvidos por quem monta o mapa. */
export interface BaseMapUrls {
  terra: string;
  estados: string;
}

export function selectionFilter(slug: string | null): FilterSpecification {
  return ["==", ["get", "acontecimentoSlug"], slug ?? ""];
}

/** Cor do ponto conforme a categoria do acontecimento. */
function categoryColor(): ExpressionSpecification {
  return [
    "match",
    ["get", "categoria"],
    ...CATEGORIAS.flatMap((categoria) => [categoria, CATEGORY_COLORS[categoria]]),
    MAP_PALETTE.tinta,
    // O tipo do MapLibre pede os pares escritos um a um; aqui eles vêm da lista de categorias.
  ] as unknown as ExpressionSpecification;
}

export function buildBaseStyle(base?: BaseMapUrls): StyleSpecification {
  const vazio = { type: "FeatureCollection" as const, features: [] };

  return {
    version: 8,
    name: "Atlas Político: base local",
    sources: {
      [MAP_SOURCES.grade]: { type: "geojson", data: buildGraticule(10) },
      [MAP_SOURCES.terra]: { type: "geojson", data: base?.terra ?? vazio },
      [MAP_SOURCES.estados]: { type: "geojson", data: base?.estados ?? vazio },
      [MAP_SOURCES.acontecimentos]: { type: "geojson", data: vazio },
    },
    layers: [
      { id: MAP_LAYERS.mar, type: "background", paint: { "background-color": MAP_PALETTE.mar } },
      {
        id: MAP_LAYERS.grade,
        type: "line",
        source: MAP_SOURCES.grade,
        paint: { "line-color": MAP_PALETTE.grade, "line-width": 1 },
      },
      {
        id: MAP_LAYERS.terra,
        type: "fill",
        source: MAP_SOURCES.terra,
        paint: { "fill-color": MAP_PALETTE.terra },
      },
      {
        // O Brasil em um tom mais claro: é onde está quase todo o conteúdo.
        id: MAP_LAYERS.terraEmFoco,
        type: "fill",
        source: MAP_SOURCES.terra,
        filter: ["==", ["get", "iso"], "BR"],
        paint: { "fill-color": MAP_PALETTE.terraEmFoco },
      },
      {
        id: MAP_LAYERS.estados,
        type: "line",
        source: MAP_SOURCES.estados,
        paint: { "line-color": MAP_PALETTE.estado, "line-width": 0.75 },
      },
      {
        id: MAP_LAYERS.fronteiras,
        type: "line",
        source: MAP_SOURCES.terra,
        paint: { "line-color": MAP_PALETTE.fronteira, "line-width": 0.75 },
      },
      {
        id: MAP_LAYERS.pontos,
        type: "circle",
        source: MAP_SOURCES.acontecimentos,
        paint: {
          "circle-radius": 6.5,
          "circle-color": categoryColor(),
          "circle-stroke-width": 1.75,
          "circle-stroke-color": MAP_PALETTE.contornoDoPonto,
        },
      },
      {
        // Anel largo em volta do ponto selecionado: a seleção não depende só da cor.
        id: MAP_LAYERS.halo,
        type: "circle",
        source: MAP_SOURCES.acontecimentos,
        filter: selectionFilter(null),
        paint: {
          "circle-radius": 17,
          "circle-color": MAP_PALETTE.selecionado,
          "circle-opacity": 0.16,
          "circle-stroke-width": 1.5,
          "circle-stroke-color": MAP_PALETTE.selecionado,
        },
      },
      {
        id: MAP_LAYERS.selecionado,
        type: "circle",
        source: MAP_SOURCES.acontecimentos,
        filter: selectionFilter(null),
        paint: {
          "circle-radius": 9,
          "circle-color": MAP_PALETTE.selecionado,
          "circle-stroke-width": 2.5,
          "circle-stroke-color": MAP_PALETTE.contornoDoPonto,
        },
      },
    ],
  };
}
