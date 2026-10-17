// Câmera: enquadra a cena inteira na área do palco que a interface deixa
// livre. Ninguém dirige o boneco (D-137): o que a pessoa precisa ver é a sala
// toda, com a pasta do marco. Só quando a cena não cabe nem no zoom mínimo a
// câmera escolhe um ponto, que é a pasta do marco. Regras puras, em pixels de
// tela na escala 1.

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
 * O que a interface cobre do palco, em pixels: em cima, o cabeçalho da fase
 * quando ele vai de um lado ao outro (tela estreita); embaixo, o botão
 * principal; à esquerda, o cartão da fase quando a janela é baixa (celular
 * deitado) e a cena não tem altura para passar por baixo dele.
 */
export interface StageInsets {
  topo: number;
  base: number;
  esquerda?: number;
}

export const NO_INSETS: StageInsets = { topo: 0, base: 0 };

/** O menor zoom da cena em jogo: abaixo dele o desenho perde a leitura. */
export const ZOOM_MINIMO = 0.36;
/** O maior: a cena não cresce além disso em tela grande. */
export const ZOOM_MAXIMO = 1.9;
/** O menor lado que a conta da área livre aceita: evita área nula quando a interface cobre quase tudo. */
export const LADO_LIVRE_MINIMO = 80;

/**
 * A área do palco que sobra para a cena, e quanto o meio dela fica à direita e
 * abaixo do meio do palco. A área vale mesmo pequena: a cena pode não caber
 * inteira nela, mas a pasta do marco fica à vista, e não atrás do cartão.
 */
export function freeArea(viewport: Viewport, margens: StageInsets): Viewport & { desvioX: number; desvioY: number } {
  const esquerda = margens.esquerda ?? 0;
  return {
    largura: Math.max(LADO_LIVRE_MINIMO, viewport.largura - esquerda),
    altura: Math.max(LADO_LIVRE_MINIMO, viewport.altura - margens.topo - margens.base),
    desvioX: esquerda / 2,
    desvioY: (margens.topo - margens.base) / 2,
  };
}

/**
 * O zoom da cena em jogo: a cena inteira na área dada, com uma folga pequena,
 * entre o mínimo e o máximo. Na largura a conta dispensa meio ladrilho de cada
 * lado da caixa da cena: as pontas da sala só têm a parede, e em celular essa
 * margem custava o tamanho do desenho.
 */
export function zoomFor(scene: SceneSpec, viewport: Viewport): number {
  const caixa = sceneBounds(scene);
  const cabe = Math.min(viewport.largura / (caixa.maxX - caixa.minX - TILE_W), viewport.altura / (caixa.maxY - caixa.minY));
  return Math.min(ZOOM_MAXIMO, Math.max(ZOOM_MINIMO, cabe * 0.97));
}

/**
 * O enquadramento da cena em jogo: a cena inteira no meio da área livre do
 * palco. Se ela não cabe nem no zoom mínimo, o ponto dado (a pasta do marco)
 * fica à vista, e a câmera não sai da cena.
 */
export function frameScene(scene: SceneSpec, viewport: Viewport, margens: StageInsets, alvo: { sx: number; sy: number } | null): Camera {
  const livre = freeArea(viewport, margens);
  const zoom = zoomFor(scene, livre);
  const caixa = sceneBounds(scene);
  const meio = { cx: (caixa.minX + caixa.maxX) / 2, cy: (caixa.minY + caixa.maxY) / 2 };
  // A cena cabe quando o zoom não foi segurado pelo mínimo: fica no meio, e o alvo não muda nada.
  const centro = zoom > ZOOM_MINIMO || alvo === null ? meio : clampCenter(alvo.sx, alvo.sy, scene, livre, zoom);
  // O meio da área livre não é o meio do palco: a câmera compensa.
  return { cx: centro.cx - livre.desvioX / zoom, cy: centro.cy - livre.desvioY / zoom, zoom };
}

/** Zoom que faz a cena inteira caber na tela (prévia e transições). */
export function zoomToFit(scene: SceneSpec, viewport: Viewport): number {
  const caixa = sceneBounds(scene);
  const largura = caixa.maxX - caixa.minX;
  const altura = caixa.maxY - caixa.minY;
  return Math.min(viewport.largura / largura, viewport.altura / altura, 1.4);
}

/** O centro ideal: o ponto dado, limitado para a tela não sair do mundo; a cena que cabe na tela fica no meio dela. */
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

/** A menor distância, em pixels de tela, entre duas pastas com botão sobre a cena: abaixo disso as áreas de toque se confundem. */
export const DISTANCIA_ENTRE_PASTAS = 46;

/**
 * As pastas que ganham botão sobre a cena, no enquadramento dado. Em zoom
 * pequeno, pastas vizinhas ficam uma sobre a outra na tela: a do marco entra
 * sempre; cada pasta opcional entra, na ordem dada, se não ficar perto demais
 * de uma que já entrou. A que fica de fora continua na lista da fase.
 * `elevacao` é a altura do centro da pasta acima do chão, em pixels de mundo.
 */
export function spacedMarkers(
  marcadores: readonly { chave: string; natureza: "marco" | "explorar" | "objeto"; x: number; y: number }[],
  camera: Camera,
  viewport: Viewport,
  elevacao: number,
  distancia: number = DISTANCIA_ENTRE_PASTAS,
): Set<string> {
  const postas: { px: number; py: number }[] = [];
  const visiveis = new Set<string>();
  // O marco e os objetos da missão de investigação entram sempre: sem eles a fase não anda. Só as pastas opcionais cedem lugar.
  const sempre = (natureza: "marco" | "explorar" | "objeto") => natureza !== "explorar";
  const emOrdem = [...marcadores.filter((item) => sempre(item.natureza)), ...marcadores.filter((item) => !sempre(item.natureza))];
  for (const marcador of emOrdem) {
    const { sx, sy } = toScreen(marcador.x + 0.5, marcador.y + 0.5);
    const ponto = project(camera, viewport, sx, sy - elevacao);
    if (!sempre(marcador.natureza) && postas.some((outra) => Math.hypot(outra.px - ponto.px, outra.py - ponto.py) < distancia)) continue;
    postas.push(ponto);
    visiveis.add(marcador.chave);
  }
  return visiveis;
}

/** De um ponto do mundo (pixels, escala 1) para o pixel na tela. */
export function project(camera: Camera, viewport: Viewport, sx: number, sy: number): { px: number; py: number } {
  return {
    px: (sx - camera.cx) * camera.zoom + viewport.largura / 2,
    py: (sy - camera.cy) * camera.zoom + viewport.altura / 2,
  };
}
