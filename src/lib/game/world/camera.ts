// Câmera: segue o personagem, com um atraso curto, e não sai do mundo quando
// o mundo cabe na tela. Regras puras, em pixels de tela na escala 1.

import type { SceneSpec } from "../types";

import { TILE_H, TILE_W, toScreen } from "./iso";

export interface Camera {
  /** Ponto do mundo (em pixels de tela, escala 1) que fica no centro da tela. */
  cx: number;
  cy: number;
  /** Fator de ampliação do mundo. */
  zoom: number;
}

export interface Viewport {
  largura: number;
  altura: number;
}

/** Caixa que a cena ocupa em pixels de tela, escala 1 (com margem para paredes e personagens). */
export function sceneBounds(scene: SceneSpec): { minX: number; maxX: number; minY: number; maxY: number } {
  const cantos = [
    toScreen(0, 0),
    toScreen(scene.largura, 0),
    toScreen(0, scene.altura),
    toScreen(scene.largura, scene.altura),
  ];
  const margemX = TILE_W * 0.75;
  const margemTopo = TILE_H * 3.5;
  const margemBase = TILE_H * 1.5;
  return {
    minX: Math.min(...cantos.map((c) => c.sx)) - margemX,
    maxX: Math.max(...cantos.map((c) => c.sx)) + margemX,
    minY: Math.min(...cantos.map((c) => c.sy)) - margemTopo,
    maxY: Math.max(...cantos.map((c) => c.sy)) + margemBase,
  };
}

/**
 * O zoom da cena em jogo: a cena quase inteira na tela quando cabe, para
 * dominar a página; em tela estreita, um piso que mantém o personagem
 * legível, e a câmera o segue.
 */
export function zoomFor(scene: SceneSpec, viewport: Viewport): number {
  const piso = viewport.largura < 480 ? 0.85 : viewport.largura < 768 ? 0.95 : 1;
  const caixa = sceneBounds(scene);
  const cabe = Math.min(viewport.largura / (caixa.maxX - caixa.minX), viewport.altura / (caixa.maxY - caixa.minY));
  return Math.min(1.9, Math.max(piso, cabe * 0.9));
}

/** Zoom que faz a cena inteira caber na tela (prévia e transições). */
export function zoomToFit(scene: SceneSpec, viewport: Viewport): number {
  const caixa = sceneBounds(scene);
  const largura = caixa.maxX - caixa.minX;
  const altura = caixa.maxY - caixa.minY;
  return Math.min(viewport.largura / largura, viewport.altura / altura, 1.4);
}

/** O centro ideal: o personagem, limitado para a tela não sair do mundo. */
export function clampCenter(cx: number, cy: number, scene: SceneSpec, viewport: Viewport, zoom: number): { cx: number; cy: number } {
  const caixa = sceneBounds(scene);
  const meiaLargura = viewport.largura / zoom / 2;
  const meiaAltura = viewport.altura / zoom / 2;
  const clamp = (valor: number, min: number, max: number) => (min > max ? (min + max) / 2 : Math.min(max, Math.max(min, valor)));
  return {
    cx: clamp(cx, caixa.minX + meiaLargura, caixa.maxX - meiaLargura),
    cy: clamp(cy, caixa.minY + meiaAltura, caixa.maxY - meiaAltura),
  };
}

/**
 * Aproxima a câmera do alvo. `dt` em segundos; com movimento reduzido a
 * câmera vai direto, sem o atraso.
 */
export function followCamera(camera: Camera, alvo: { cx: number; cy: number }, dt: number, movimento: boolean): Camera {
  if (!movimento) return { ...camera, cx: alvo.cx, cy: alvo.cy };
  const taxa = 1 - Math.exp(-dt * 7);
  const cx = camera.cx + (alvo.cx - camera.cx) * taxa;
  const cy = camera.cy + (alvo.cy - camera.cy) * taxa;
  // Perto o bastante: encosta, para o desenho parar de tremer.
  return {
    ...camera,
    cx: Math.abs(alvo.cx - cx) < 0.05 ? alvo.cx : cx,
    cy: Math.abs(alvo.cy - cy) < 0.05 ? alvo.cy : cy,
  };
}

/** De um ponto do mundo (pixels, escala 1) para o pixel na tela. */
export function project(camera: Camera, viewport: Viewport, sx: number, sy: number): { px: number; py: number } {
  return {
    px: (sx - camera.cx) * camera.zoom + viewport.largura / 2,
    py: (sy - camera.cy) * camera.zoom + viewport.altura / 2,
  };
}
