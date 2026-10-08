import { describe, expect, it } from "vitest";

import { buildEventFeatures } from "@/features/map/features";
import { buildGraticule } from "@/features/map/graticule";
import { buildBaseStyle, selectionFilter } from "@/features/map/style";
import { formatCoordinates, isInsideBrazilBox, toPosition } from "@/lib/domain/geo";

import { loadExplorerData } from "./helpers";

const data = loadExplorerData();

describe("ordem das coordenadas", () => {
  it("posição GeoJSON é [longitude, latitude]", () => {
    expect(toPosition({ longitude: -50, latitude: -14 })).toEqual([-50, -14]);
  });

  it("a caixa do Brasil pega coordenada trocada", () => {
    expect(isInsideBrazilBox({ longitude: -47.9, latitude: -15.8 })).toBe(true);
    expect(isInsideBrazilBox({ longitude: -15.8, latitude: -47.9 })).toBe(false);
    // Extremo sul: trocado, a longitude vira uma latitude que não existe no país.
    expect(isInsideBrazilBox({ longitude: -53.4, latitude: -33.7 })).toBe(true);
    expect(isInsideBrazilBox({ longitude: -33.7, latitude: -53.4 })).toBe(false);
  });

  it("escreve a coordenada para leitura, com hemisférios", () => {
    expect(formatCoordinates({ longitude: -50, latitude: -14 })).toBe("14,0000° S, 50,0000° O");
    expect(formatCoordinates({ longitude: 2.35, latitude: 48.85 })).toBe("48,8500° N, 2,3500° L");
  });
});

describe("pontos do mapa", () => {
  const colecao = buildEventFeatures(data.acontecimentos, data.lugares);

  it("gera um ponto por lugar documentado", () => {
    expect(colecao.type).toBe("FeatureCollection");
    expect(colecao.features).toHaveLength(6);
  });

  it("acontecimento com dois lugares gera dois pontos", () => {
    const pontos = colecao.features.filter(
      (feature) => feature.properties.acontecimentoSlug === "sintetico-evento-03",
    );
    expect(pontos.map((feature) => feature.properties.lugarId)).toEqual([
      "sintetico-lugar-sudeste",
      "sintetico-lugar-sul",
    ]);
  });

  it("abrangência nacional e lugar desconhecido não geram ponto", () => {
    const comPonto = new Set(colecao.features.map((feature) => feature.properties.acontecimentoSlug));
    expect(comPonto.has("sintetico-evento-04")).toBe(false);
    expect(comPonto.has("sintetico-evento-06")).toBe(false);
  });

  it("cada ponto leva a longitude primeiro", () => {
    for (const feature of colecao.features) {
      const lugar = data.lugares.find((item) => item.id === feature.properties.lugarId);
      expect(feature.geometry.coordinates).toEqual([lugar?.longitude, lugar?.latitude]);
    }
  });

  it("referência a lugar ausente é ignorada em vez de quebrar o mapa", () => {
    expect(buildEventFeatures(data.acontecimentos, []).features).toEqual([]);
  });
});

describe("grade e estilo locais", () => {
  it("gera meridianos e paralelos a cada 10 graus", () => {
    const grade = buildGraticule(10);
    const eixos = grade.features.map((feature) => feature.properties.eixo);
    expect(eixos.filter((eixo) => eixo === "meridiano")).toHaveLength(37);
    expect(eixos.filter((eixo) => eixo === "paralelo")).toHaveLength(17);

    const meridiano = grade.features.find((feature) => feature.properties.grau === -50);
    expect(meridiano?.geometry.coordinates[0]).toEqual([-50, -80]);
  });

  it("o estilo não aponta para nenhum recurso externo", () => {
    const estilo = buildBaseStyle();
    expect(JSON.stringify(estilo)).not.toMatch(/https?:|\/\//);
    expect(estilo.glyphs).toBeUndefined();
    expect(estilo.sprite).toBeUndefined();
  });

  it("o filtro de seleção não casa com nada quando não há seleção", () => {
    expect(selectionFilter(null)).toEqual(["==", ["get", "acontecimentoSlug"], ""]);
    expect(selectionFilter("um-slug")).toEqual(["==", ["get", "acontecimentoSlug"], "um-slug"]);
  });
});
