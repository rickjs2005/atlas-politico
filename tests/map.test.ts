import { describe, expect, it } from "vitest";

import { buildGraticule } from "@/features/map/graticule";
import { buildBaseStyle, selectionFilter } from "@/features/map/style";
import { buildEventPoints, filterPoints } from "@/lib/data/points";
import { formatCoordinates, isInsideBrazilBox, toPosition } from "@/lib/domain/geo";

import { loadAtlasData } from "./helpers";

const data = loadAtlasData();
const { acontecimentos, lugares } = data.conjunto;

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
  // A coleção que a interface recebe é a que o gerador montou.
  const colecao = data.pontos;

  it("gera um ponto por lugar documentado", () => {
    expect(colecao.type).toBe("FeatureCollection");
    expect(colecao.features).toHaveLength(6);
    expect(buildEventPoints(acontecimentos, lugares)).toEqual(colecao);
  });

  it("cada ponto é identificado pelo acontecimento e pelo lugar", () => {
    for (const ponto of colecao.features) {
      const { eventId, placeId } = ponto.properties;
      expect(ponto.id).toBe(`${eventId}@${placeId}`);
      expect(acontecimentos.some((item) => item.id === eventId)).toBe(true);
      expect(lugares.some((item) => item.id === placeId)).toBe(true);
    }
    const ids = colecao.features.map((ponto) => ponto.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("acontecimento com dois lugares gera dois pontos ligados ao mesmo acontecimento", () => {
    const pontos = colecao.features.filter(
      (ponto) => ponto.properties.eventId === "sintetico-evento-03",
    );
    expect(pontos.map((ponto) => ponto.properties.placeId)).toEqual([
      "sintetico-lugar-sudeste",
      "sintetico-lugar-sul",
    ]);
    expect(new Set(pontos.map((ponto) => ponto.properties.acontecimentoSlug)).size).toBe(1);
  });

  it("o mesmo lugar citado duas vezes continua sendo um ponto", () => {
    const repetido = structuredClone(acontecimentos[0]!);
    repetido.localizacao = {
      tipo: "lugares",
      lugarIds: ["sintetico-lugar-norte", "sintetico-lugar-norte"],
    };
    expect(buildEventPoints([repetido], lugares).features).toHaveLength(1);
  });

  it("abrangência nacional e lugar desconhecido não geram ponto", () => {
    const comPonto = new Set(colecao.features.map((ponto) => ponto.properties.eventId));
    expect(comPonto.has("sintetico-evento-04")).toBe(false);
    expect(comPonto.has("sintetico-evento-06")).toBe(false);
  });

  it("cada ponto leva a longitude primeiro e diz a precisão da coordenada", () => {
    for (const ponto of colecao.features) {
      const lugar = lugares.find((item) => item.id === ponto.properties.placeId);
      expect(ponto.geometry.coordinates).toEqual([lugar?.longitude, lugar?.latitude]);
      expect(ponto.properties.precisaoGeografica).toBe(lugar?.precisaoGeografica);
    }
  });

  it("leva o que os filtros precisam, com a data na precisão original", () => {
    const ponto = colecao.features.find((item) => item.properties.eventId === "sintetico-evento-02");
    expect(ponto?.properties).toMatchObject({
      categoria: "mandatos-e-funcoes",
      pessoaIds: ["sintetico-pessoa-a"],
      ano: 2003,
      dataValor: "2003-03",
      dataPrecisao: "mes",
    });
  });

  it("não liga os pontos entre si: só há pontos, nenhuma linha", () => {
    expect(new Set(colecao.features.map((ponto) => ponto.geometry.type))).toEqual(new Set(["Point"]));
  });

  it("referência a lugar ausente é ignorada em vez de quebrar o mapa", () => {
    expect(buildEventPoints(acontecimentos, []).features).toEqual([]);
  });

  it("coleção vazia é válida", () => {
    expect(buildEventPoints([], lugares)).toEqual({ type: "FeatureCollection", features: [] });
  });

  it("recorta os pontos de um conjunto de acontecimentos, mantendo todos os de cada um", () => {
    const recorte = filterPoints(colecao, [{ id: "sintetico-evento-03" }, { id: "sintetico-evento-04" }]);
    expect(recorte.features.map((ponto) => ponto.id)).toEqual([
      "sintetico-evento-03@sintetico-lugar-sudeste",
      "sintetico-evento-03@sintetico-lugar-sul",
    ]);
    expect(filterPoints(colecao, []).features).toEqual([]);
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
