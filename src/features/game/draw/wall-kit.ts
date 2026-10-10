// Apoio das paredes: o plano da face de uma parede e as formas desenhadas
// nele. As artes de cada ambiente (draw/arts/*.ts) desenham o caráter da
// parede com estas funções; quem monta a parede inteira é scene-walls.ts.
//
// O plano é fixado por `plane()` antes de cada célula: `u` corre ao longo da
// parede, em células; `v` sobe, em pixels. Fica no módulo para não criar um
// objeto por célula a cada quadro.

import type { ScenePalette } from "@/lib/game/types";

import { DETAIL, tone } from "./kit";
import { fillAlpha, fillSolid, strokeInk } from "./scene-shared";

// ---------------------------------------------------------------------------
// As cores de uma parede, já com a luz da face
// ---------------------------------------------------------------------------

export interface Estilo {
  /** O pano da parede. */
  face: string;
  /** A zona de baixo: barra pintada, lambri. */
  barra: string;
  rodape: string;
  /** A faixa do alto: viga, cornija, sanca. */
  remate: string;
  /** Frisos e peitoris. */
  friso: string;
  /** O que avança: pilastra, moldura. */
  relevo: string;
  vidro: string;
  vidroLuz: string;
  caixilho: string;
  madeira: string;
  /** Material à parte do ambiente: cortiça, luz embutida, tecido. */
  extra: string;
}

export type Luz = "esquerda" | "direita";

/** Faixa horizontal que dá a volta na parede: de `v0` a `v1`, na cor do estilo. */
export type Faixa = readonly [v0: number, v1: number, cor: keyof Estilo];
/** Linha de tinta na altura `v`, com a opacidade dada. */
export type Linha = readonly [v: number, alfa: number];

export const VIDRO = "#c3cdc8";
export const VIDRO_LUZ = "#e6ece4";

/** Um estilo em que todas as cores saem da paleta, com a luz `k`: ponto de partida das artes. */
export function estiloBase(p: ScenePalette, k: number): Estilo {
  return {
    face: tone(p.parede, k),
    barra: tone(p.parede, k - 0.06),
    rodape: tone(p.parede, k - 0.3),
    remate: tone(p.parede, k + 0.25),
    friso: tone(p.parede, k + 0.3),
    relevo: tone(p.parede, k + 0.3),
    vidro: tone(VIDRO, k * 0.6),
    vidroLuz: tone(VIDRO_LUZ, k * 0.4),
    caixilho: tone(p.acento, k - 0.1),
    madeira: tone(p.acento, k),
    extra: tone(p.parede, k + 0.16),
  };
}

// ---------------------------------------------------------------------------
// O plano em que se desenha
// ---------------------------------------------------------------------------

let ox = 0;
let oy = 0;
let ux = 0;
let uy = 0;

export function plane(x: number, y: number, dx: number, dy: number): void {
  ox = x;
  oy = y;
  ux = dx;
  uy = dy;
}

export const X = (u: number): number => ox + u * ux;
export const Y = (u: number, v: number): number => oy + u * uy - v;

/** Retângulo na face: `u` em células ao longo da parede, `v` em pixels para cima. */
export function rect(ctx: CanvasRenderingContext2D, u0: number, v0: number, u1: number, v1: number): void {
  ctx.moveTo(X(u0), Y(u0, v0));
  ctx.lineTo(X(u1), Y(u1, v0));
  ctx.lineTo(X(u1), Y(u1, v1));
  ctx.lineTo(X(u0), Y(u0, v1));
  ctx.closePath();
}

export function seg(ctx: CanvasRenderingContext2D, u0: number, v0: number, u1: number, v1: number): void {
  ctx.moveTo(X(u0), Y(u0, v0));
  ctx.lineTo(X(u1), Y(u1, v1));
}

/** Faixa cheia na face. */
export function band(ctx: CanvasRenderingContext2D, u0: number, u1: number, v0: number, v1: number, cor: string): void {
  ctx.beginPath();
  rect(ctx, u0, v0, u1, v1);
  fillSolid(ctx, cor);
}

/** Linha de tinta horizontal na altura `v`. */
export function hline(ctx: CanvasRenderingContext2D, u0: number, u1: number, v: number, alfa: number, largura: number = DETAIL): void {
  ctx.beginPath();
  seg(ctx, u0, v, u1, v);
  strokeInk(ctx, largura, alfa);
}

/** Janelas, pilastras e painéis de destaque: uma célula a cada três. */
export function isFeature(i: number): boolean {
  return i % 3 === 1;
}

/** Vidro com caixilho em grade: `colunas` por `linhas` vidraças. */
export function drawGlass(ctx: CanvasRenderingContext2D, e: Estilo, u0: number, v0: number, u1: number, v1: number, colunas: number, linhas: number, grade: number): void {
  ctx.beginPath();
  rect(ctx, u0, v0, u1, v1);
  ctx.fillStyle = e.vidro;
  ctx.fill();
  // Reflexo: uma faixa clara em diagonal.
  const du = u1 - u0;
  ctx.beginPath();
  ctx.moveTo(X(u0 + du * 0.12), Y(u0 + du * 0.12, v0));
  ctx.lineTo(X(u0 + du * 0.34), Y(u0 + du * 0.34, v0));
  ctx.lineTo(X(u0 + du * 0.66), Y(u0 + du * 0.66, v1));
  ctx.lineTo(X(u0 + du * 0.44), Y(u0 + du * 0.44, v1));
  ctx.closePath();
  ctx.fillStyle = e.vidroLuz;
  ctx.fill();
  // Sombra do vão, no alto.
  ctx.beginPath();
  rect(ctx, u0, v1 - 2.2, u1, v1);
  fillAlpha(ctx, "#1b1c1a", 0.18);
  // Caixilho.
  ctx.beginPath();
  for (let c = 1; c < colunas; c += 1) seg(ctx, u0 + (du * c) / colunas, v0, u0 + (du * c) / colunas, v1);
  for (let l = 1; l < linhas; l += 1) seg(ctx, u0, v0 + ((v1 - v0) * l) / linhas, u1, v0 + ((v1 - v0) * l) / linhas);
  strokeInk(ctx, grade, 1, e.caixilho);
  ctx.beginPath();
  rect(ctx, u0, v0, u1, v1);
  strokeInk(ctx, DETAIL + 0.2);
}

/** Quadro emoldurado na face, com o miolo na cor dada: retrato sem rosto, mapa sem nome, painel. */
export function drawFrame(ctx: CanvasRenderingContext2D, e: Estilo, u0: number, v0: number, u1: number, v1: number, miolo: string, moldura: number = 0.05): void {
  band(ctx, u0, u1, v0, v1, e.madeira);
  const mv = moldura * 64;
  band(ctx, u0 + moldura, u1 - moldura, v0 + mv, v1 - mv, miolo);
  ctx.beginPath();
  rect(ctx, u0, v0, u1, v1);
  rect(ctx, u0 + moldura, v0 + mv, u1 - moldura, v1 - mv);
  strokeInk(ctx, DETAIL);
}
