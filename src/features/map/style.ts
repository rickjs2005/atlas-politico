// Estilo do mapa, montado localmente: mar, grade, terra e divisas. Sem tiles,
// sem sprites e sem glyphs: nenhum recurso do estilo é um endereço de fora do
// projeto.
//
// O WebGL desenha só a base. Os lugares são marcadores em HTML, por cima do
// canvas (`MapCanvas.tsx`): assim eles recebem foco, têm nome para leitores de
// tela, levam a forma da categoria e o número de acontecimentos, e usam os
// tokens de cor direto do CSS. Texto no WebGL pediria arquivos de glyphs.
//
// A terra e os estados vêm de dois arquivos do próprio projeto
// (`base/README.md`), entregues pelo build. Quem monta o mapa passa os
// endereços; aqui eles são só texto, para o estilo continuar testável.

import type { StyleSpecification } from "maplibre-gl";

import { buildGraticule } from "./graticule";
import { MAP_PALETTE } from "./palette";

export const MAP_SOURCES = {
  grade: "grade",
  terra: "terra",
  estados: "estados",
} as const;

export const MAP_LAYERS = {
  mar: "mar",
  grade: "grade",
  terra: "terra",
  terraEmFoco: "terra-em-foco",
  estados: "estados",
  fronteiras: "fronteiras",
} as const;

/** Endereços dos arquivos da base, resolvidos por quem monta o mapa. */
export interface BaseMapUrls {
  terra: string;
  estados: string;
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
    ],
  };
}
