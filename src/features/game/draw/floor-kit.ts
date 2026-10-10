// Apoio do piso: o losango de uma célula e a mancha chata. Os pisos de cada
// ambiente (draw/floors.ts e draw/arts/*.ts) são desenhados com isto; o
// tapete, igual em todos os ambientes, fica em scene-floor.ts.

import { HH, HW, fillAlpha, px, py } from "./scene-shared";

const TAU = Math.PI * 2;

export function diamond(ctx: CanvasRenderingContext2D, sx: number, sy: number): void {
  ctx.beginPath();
  ctx.moveTo(sx, sy - HH);
  ctx.lineTo(sx + HW, sy);
  ctx.lineTo(sx, sy + HH);
  ctx.lineTo(sx - HW, sy);
  ctx.closePath();
}

/** Mancha chata no chão, com o centro em células locais e o raio em pixels. */
export function blot(ctx: CanvasRenderingContext2D, sx: number, sy: number, dx: number, dy: number, raio: number, cor: string, alfa: number): void {
  ctx.beginPath();
  ctx.ellipse(px(sx, dx, dy), py(sy, dx, dy), raio, raio / 2, 0, 0, TAU);
  fillAlpha(ctx, cor, alfa);
}
