// Apoio da saída: o plano da parede em que o portal fica e o plano da folha,
// que gira na dobradiça. As artes de cada ambiente (draw/arts/*.ts) desenham
// os detalhes da folha com isto (ver door-leaves.ts); quem monta o portal, a
// tranca, a placa e a soleira é scene-exit.ts.
//
// `u` corre ao longo da parede, em células; `w` sai da sala, em células; `v`
// sobe, em pixels. A saída do lado sul é o espelho da saída do lado leste.

import type { ExitSide } from "@/lib/game/types";

import { LIGHT, OUTLINE, tone } from "./kit";
import { HH, HW, PARAPET_T, fillSolid, strokeInk } from "./scene-shared";

/** Altura do portal: passa da cabeça do personagem. */
export const FRAME_H = 76;
export const LINTEL = 7;
export const LEAF_H = FRAME_H - LINTEL;
/** Largura de cada montante, em células ao longo da parede. */
export const POST = 0.1;
/**
 * A dobradiça fica no montante do começo da parede, o mais longe da câmera:
 * aberta, a folha fica ao lado do vão, sem tapar quem chega por dentro.
 */
export const HINGE = POST;
export const LEAF = 1 - POST * 2;

/** Como a arte desenha os detalhes da folha, já cheia na cor do estilo, com a luz `luz`. */
export type LeafDesign = (ctx: CanvasRenderingContext2D, e: DoorStyle, luz: number) => void;

export interface DoorStyle {
  moldura: string;
  folha: string;
  /** Puxador, barra, filetes. */
  ferragem: string;
  degrau: string;
  desenho: LeafDesign;
}

// ---------------------------------------------------------------------------
// O plano da parede em que a saída fica
// ---------------------------------------------------------------------------

// No módulo, para não criar um objeto por quadro.
let ox = 0;
let oy = 0;
/** -1 na saída do lado leste (ou oeste), 1 na do lado sul (ou norte). */
let sgn = 1;
let luzW = 0;
let luzU = 0;

export function plane(sx: number, sy: number, lado: ExitSide): void {
  sgn = lado === "leste" || lado === "oeste" ? -1 : 1;
  ox = sx - sgn * PARAPET_T * HW;
  oy = sy + (PARAPET_T - 1) * HH;
  // A face de fora da parede leste olha para +x; a da parede sul, para +y.
  luzW = sgn === -1 ? LIGHT.direita : LIGHT.esquerda;
  luzU = sgn === -1 ? LIGHT.esquerda : LIGHT.direita;
}

/** A luz da face de fora da parede e a da face voltada para o fim dela. */
export const lightW = (): number => luzW;
export const lightU = (): number => luzU;

export const X = (u: number, w: number): number => ox + sgn * (u - w) * HW;
export const Y = (u: number, w: number, v: number): number => oy + (u + w) * HH - v;

/** Face voltada para fora da sala, no plano `w`. */
export function faceW(ctx: CanvasRenderingContext2D, u0: number, u1: number, w: number, v0: number, v1: number): void {
  ctx.beginPath();
  ctx.moveTo(X(u0, w), Y(u0, w, v0));
  ctx.lineTo(X(u1, w), Y(u1, w, v0));
  ctx.lineTo(X(u1, w), Y(u1, w, v1));
  ctx.lineTo(X(u0, w), Y(u0, w, v1));
  ctx.closePath();
}

/** Face voltada para o fim da parede, no plano `u`. */
export function faceU(ctx: CanvasRenderingContext2D, u: number, w0: number, w1: number, v0: number, v1: number): void {
  ctx.beginPath();
  ctx.moveTo(X(u, w0), Y(u, w0, v0));
  ctx.lineTo(X(u, w1), Y(u, w1, v0));
  ctx.lineTo(X(u, w1), Y(u, w1, v1));
  ctx.lineTo(X(u, w0), Y(u, w0, v1));
  ctx.closePath();
}

/** Face de cima, na altura `v`. */
export function faceTop(ctx: CanvasRenderingContext2D, u0: number, u1: number, w0: number, w1: number, v: number): void {
  ctx.beginPath();
  ctx.moveTo(X(u0, w0), Y(u0, w0, v));
  ctx.lineTo(X(u1, w0), Y(u1, w0, v));
  ctx.lineTo(X(u1, w1), Y(u1, w1, v));
  ctx.lineTo(X(u0, w1), Y(u0, w1, v));
  ctx.closePath();
}

/** Caixa com as três faces que a câmera vê. */
export function box(ctx: CanvasRenderingContext2D, u0: number, u1: number, w0: number, w1: number, v0: number, v1: number, cor: string, contorno: number = OUTLINE): void {
  faceU(ctx, u1, w0, w1, v0, v1);
  fillSolid(ctx, tone(cor, luzU));
  strokeInk(ctx, contorno);
  faceW(ctx, u0, u1, w1, v0, v1);
  fillSolid(ctx, tone(cor, luzW));
  strokeInk(ctx, contorno);
  faceTop(ctx, u0, u1, w0, w1, v1);
  fillSolid(ctx, tone(cor, LIGHT.topo));
  strokeInk(ctx, contorno);
}

/** Suaviza de 0 a 1 entre `a` e `b`. */
export function smooth(a: number, b: number, t: number): number {
  const k = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return k * k * (3 - 2 * k);
}

// ---------------------------------------------------------------------------
// A folha: desenhada no próprio plano, que gira na dobradiça
// ---------------------------------------------------------------------------

// Quanto `u` e `w` mudam da dobradiça até a ponta livre da folha.
let lu = 0;
let lw = 0;

export function swing(angulo: number): void {
  lu = Math.cos(angulo) * LEAF;
  lw = Math.sin(angulo) * LEAF;
}

/** Ponto da folha: `a` de 0 (dobradiça) a 1 (ponta livre), `v` em pixels para cima. */
export const LX = (a: number): number => X(HINGE + a * lu, a * lw);
export const LY = (a: number, v: number): number => Y(HINGE + a * lu, a * lw, v);

export function leafRect(ctx: CanvasRenderingContext2D, a0: number, v0: number, a1: number, v1: number): void {
  ctx.moveTo(LX(a0), LY(a0, v0));
  ctx.lineTo(LX(a1), LY(a1, v0));
  ctx.lineTo(LX(a1), LY(a1, v1));
  ctx.lineTo(LX(a0), LY(a0, v1));
  ctx.closePath();
}

export function leafSeg(ctx: CanvasRenderingContext2D, a0: number, v0: number, a1: number, v1: number): void {
  ctx.moveTo(LX(a0), LY(a0, v0));
  ctx.lineTo(LX(a1), LY(a1, v1));
}
