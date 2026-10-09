// Regras de câmera: limites que respeitam a base e a precisão dos lugares,
// enquadramento do recorte e da seleção, e a conta que decide se a câmera
// precisa mesmo se mover.

import { describe, expect, it } from "vitest";

import {
  DEFAULT_BOUNDS,
  LABEL_ROOM,
  MAP_LIMITS,
  PRECISION_ZOOM_CAP,
  TOP_ROOM,
  TOP_ROOM_MIN_HEIGHT,
  VIEW_MARGIN,
  boundsOf,
  focusZoom,
  frameOf,
  isInView,
  minZoomInside,
  nudgeIntoView,
  paddingFor,
  zoomCapFor,
  type Insets,
} from "@/features/map/camera";
import { PRECISOES_GEOGRAFICAS, type Position } from "@/lib/domain/geo";

const LIVRE: Insets = { top: 0, right: 0, bottom: 0, left: 0 };
const TELA = { width: 600, height: 400 };

const BRASILIA: Position = [-47.8, -15.8];
const CURITIBA: Position = [-49.3, -25.5];

describe("limites do mapa", () => {
  it("a área navegável é a que a base cobre, e o enquadramento padrão cabe nela", () => {
    const [oeste, sul, leste, norte] = MAP_LIMITS.bounds;
    const [o, s, l, n] = DEFAULT_BOUNDS;
    expect(o).toBeGreaterThanOrEqual(oeste);
    expect(s).toBeGreaterThanOrEqual(sul);
    expect(l).toBeLessThanOrEqual(leste);
    expect(n).toBeLessThanOrEqual(norte);
  });

  it("o zoom máximo é o que a base de 1:50 milhões sustenta", () => {
    expect(MAP_LIMITS.maxZoom).toBe(6);
    expect(MAP_LIMITS.minZoom).toBeLessThan(MAP_LIMITS.maxZoom);
  });

  it("toda precisão tem teto de zoom, e nenhum passa do máximo do mapa", () => {
    for (const precisao of PRECISOES_GEOGRAFICAS) {
      expect(PRECISION_ZOOM_CAP[precisao]).toBeLessThanOrEqual(MAP_LIMITS.maxZoom);
    }
  });

  it("quanto menos precisa a coordenada, menos a câmera se aproxima", () => {
    const { local, municipio, uf, pais } = PRECISION_ZOOM_CAP;
    expect(local).toBeGreaterThanOrEqual(municipio);
    expect(municipio).toBeGreaterThan(uf);
    expect(uf).toBeGreaterThan(pais);
  });

  it("o teto de um conjunto é o do lugar menos preciso", () => {
    expect(zoomCapFor(["municipio"])).toBe(PRECISION_ZOOM_CAP.municipio);
    expect(zoomCapFor(["municipio", "uf"])).toBe(PRECISION_ZOOM_CAP.uf);
    expect(zoomCapFor([])).toBe(MAP_LIMITS.maxZoom);
  });

  it("presa à área da base, a câmera se afasta menos em tela larga do que em tela alta", () => {
    const larga = minZoomInside({ width: 656, height: 430 }, MAP_LIMITS.bounds);
    const alta = minZoomInside({ width: 390, height: 440 }, MAP_LIMITS.bounds);
    expect(larga).toBeGreaterThan(alta);
    // Em nenhuma das duas o piso impede de ver o território inteiro.
    const brasil = minZoomInside({ width: 656, height: 430 }, [-74.1, -33.8, -28.8, 5.3]);
    expect(larga).toBeLessThan(brasil);
  });
});

describe("zoom ao ir a um lugar", () => {
  it("mantém o zoom da pessoa quando ele já serve", () => {
    expect(focusZoom(5, PRECISION_ZOOM_CAP.municipio)).toBe(5);
  });

  it("aproxima até o lugar ficar identificável", () => {
    expect(focusZoom(3, PRECISION_ZOOM_CAP.municipio)).toBe(4);
  });

  it("nunca passa do teto da precisão, mesmo que a pessoa esteja mais perto", () => {
    expect(focusZoom(6, PRECISION_ZOOM_CAP.uf)).toBe(PRECISION_ZOOM_CAP.uf);
    expect(focusZoom(3, PRECISION_ZOOM_CAP.pais)).toBe(PRECISION_ZOOM_CAP.pais);
  });
});

describe("enquadramento", () => {
  it("sem lugares, vale o território", () => {
    expect(frameOf([])).toEqual({ tipo: "padrao", bounds: DEFAULT_BOUNDS });
  });

  it("um lugar só vira centro e zoom, com o teto da precisão", () => {
    expect(frameOf([{ position: BRASILIA, precisao: "municipio" }])).toEqual({
      tipo: "centro",
      center: BRASILIA,
      zoom: 5,
    });
    expect(frameOf([{ position: BRASILIA, precisao: "uf" }])).toMatchObject({
      zoom: PRECISION_ZOOM_CAP.uf,
    });
  });

  it("com a câmera em uso, um lugar só parte do zoom em que a pessoa está", () => {
    expect(frameOf([{ position: BRASILIA, precisao: "municipio" }], 4.6)).toMatchObject({ zoom: 4.6 });
    expect(frameOf([{ position: BRASILIA, precisao: "uf" }], 6)).toMatchObject({
      zoom: PRECISION_ZOOM_CAP.uf,
    });
  });

  it("vários registros no mesmo ponto são um lugar só para a câmera", () => {
    const frame = frameOf([
      { position: BRASILIA, precisao: "municipio" },
      { position: BRASILIA, precisao: "municipio" },
    ]);
    expect(frame.tipo).toBe("centro");
  });

  it("vários lugares viram a caixa que os contém, com o teto do menos preciso", () => {
    expect(
      frameOf([
        { position: BRASILIA, precisao: "municipio" },
        { position: CURITIBA, precisao: "uf" },
      ]),
    ).toEqual({
      tipo: "caixa",
      bounds: [-49.3, -25.5, -47.8, -15.8],
      maxZoom: PRECISION_ZOOM_CAP.uf,
    });
  });

  it("a caixa de nenhuma posição não existe", () => {
    expect(boundsOf([])).toBeNull();
    expect(boundsOf([BRASILIA])).toEqual([-47.8, -15.8, -47.8, -15.8]);
  });
});

describe("a câmera só se move quando precisa", () => {
  it("um ponto no meio da tela está à vista", () => {
    expect(isInView({ x: 300, y: 200 }, TELA, LIVRE)).toBe(true);
  });

  it("colado à borda não conta como à vista", () => {
    expect(isInView({ x: VIEW_MARGIN - 1, y: 200 }, TELA, LIVRE)).toBe(false);
    expect(isInView({ x: VIEW_MARGIN, y: 200 }, TELA, LIVRE)).toBe(true);
    expect(isInView({ x: 300, y: 400 - VIEW_MARGIN + 1 }, TELA, LIVRE)).toBe(false);
  });

  it("fora da tela não está à vista", () => {
    expect(isInView({ x: -40, y: 200 }, TELA, LIVRE)).toBe(false);
    expect(isInView({ x: 300, y: 900 }, TELA, LIVRE)).toBe(false);
  });

  it("sob o que cobre o mapa não está à vista", () => {
    const comCartao: Insets = { ...LIVRE, bottom: 150 };
    expect(isInView({ x: 300, y: 300 }, TELA, LIVRE)).toBe(true);
    expect(isInView({ x: 300, y: 300 }, TELA, comCartao)).toBe(false);
    const comQuadro: Insets = { ...LIVRE, left: 332 };
    expect(isInView({ x: 300, y: 200 }, TELA, comQuadro)).toBe(false);
    expect(isInView({ x: 400, y: 200 }, TELA, comQuadro)).toBe(true);
  });

  it("o espaço do enquadramento soma a folga ao que está coberto", () => {
    expect(paddingFor({ top: 0, right: 0, bottom: 150, left: 0 }, 480)).toEqual({
      // Em cima ficam o botão dos acontecimentos sem ponto e os avisos.
      top: 48 + TOP_ROOM,
      // À direita, os nomes dos lugares e os controles.
      right: 48 + LABEL_ROOM,
      bottom: 198,
      left: 48,
    });
    expect(LABEL_ROOM).toBeGreaterThanOrEqual(44);
  });

  it("em um quadro baixo a faixa de cima não é reservada", () => {
    const livre = { top: 0, right: 0, bottom: 0, left: 0 };
    expect(paddingFor(livre, TOP_ROOM_MIN_HEIGHT - 1).top).toBe(48);
    expect(paddingFor(livre, TOP_ROOM_MIN_HEIGHT).top).toBe(48 + TOP_ROOM);
  });
});

describe("deslocamento mínimo", () => {
  it("quem já está à vista não desloca nada", () => {
    expect(nudgeIntoView({ x: 300, y: 200 }, TELA, LIVRE)).toEqual([0, 0]);
  });

  it("desloca só o que falta, e só no eixo que falta", () => {
    const comQuadro: Insets = { ...LIVRE, left: 332 };
    // O ponto está 64 pixels à esquerda do começo da área livre.
    expect(nudgeIntoView({ x: 300, y: 200 }, TELA, comQuadro)).toEqual([300 - (332 + VIEW_MARGIN), 0]);
    const comFolha: Insets = { ...LIVRE, bottom: 250 };
    expect(nudgeIntoView({ x: 300, y: 300 }, TELA, comFolha)).toEqual([0, 300 - (400 - 250 - VIEW_MARGIN)]);
  });

  it("depois do deslocamento, o ponto está à vista", () => {
    const cobertura: Insets = { top: 0, right: 0, bottom: 200, left: 100 };
    const ponto = { x: 20, y: 390 };
    const [dx, dy] = nudgeIntoView(ponto, TELA, cobertura);
    // Deslocar a câmera em (dx, dy) leva o ponto a (x - dx, y - dy) na tela.
    expect(isInView({ x: ponto.x - dx, y: ponto.y - dy }, TELA, cobertura)).toBe(true);
  });

  it("quando a área livre é menor que a margem, leva o ponto ao meio dela", () => {
    const quaseTudo: Insets = { ...LIVRE, bottom: 380 };
    const [, dy] = nudgeIntoView({ x: 300, y: 300 }, TELA, quaseTudo);
    expect(300 - dy).toBe(10);
  });
});
