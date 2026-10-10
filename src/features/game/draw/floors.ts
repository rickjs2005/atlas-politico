// Os pisos dos quatro primeiros ambientes, reaproveitáveis pelas artes novas
// com outra paleta: concreto gasto, taco de madeira, pedra em placas e pedra
// polida. Cada célula é desenhada inteira dentro do próprio losango, para a
// ordem das células não mudar o resultado.

import type { ScenePalette } from "@/lib/game/types";

import { blot, diamond } from "./floor-kit";
import { PAPER, cellNoise, tone } from "./kit";
import { HH, HW, fillAlpha, fillSolid, floorRect, floorSeg, isPlainFloor, px, py, strokeInk } from "./scene-shared";
import type { CellInfo } from "./types";

/** Concreto gasto, em placas grandes com junta de dilatação. */
export function drawConcrete(ctx: CanvasRenderingContext2D, base: string, sx: number, sy: number, info: CellInfo): void {
  const { x, y } = info;
  diamond(ctx, sx, sy);
  fillSolid(ctx, base);

  // Manchas de uso: uma escura e uma clara, em lugar fixo da célula.
  const a = cellNoise(x, y, 1);
  const b = cellNoise(x, y, 2);
  const c = cellNoise(x, y, 3);
  blot(ctx, sx, sy, (a - 0.5) * 0.3, (b - 0.5) * 0.3, 7 + c * 6, tone(base, -0.16), 0.3);
  blot(ctx, sx, sy, (b - 0.5) * 0.34, (c - 0.5) * 0.34, 5 + a * 5, tone(base, 0.3), 0.4);

  // Poros.
  ctx.fillStyle = tone(base, -0.3);
  for (let i = 0; i < 4; i += 1) {
    const u = (cellNoise(x, y, 10 + i) - 0.5) * 0.62;
    const v = (cellNoise(x, y, 20 + i) - 0.5) * 0.62;
    ctx.fillRect(px(sx, u, v) - 0.5, py(sy, u, v) - 0.4, 1.1, 0.8);
  }

  // Uma ou outra trinca.
  if (cellNoise(x, y, 7) > 0.8) {
    const k = cellNoise(x, y, 8) - 0.5;
    ctx.beginPath();
    ctx.moveTo(px(sx, -0.34, -0.12 + k * 0.3), py(sy, -0.34, -0.12 + k * 0.3));
    ctx.lineTo(px(sx, -0.12, -0.02 + k * 0.2), py(sy, -0.12, -0.02 + k * 0.2));
    ctx.lineTo(px(sx, 0.02, 0.14 - k * 0.2), py(sy, 0.02, 0.14 - k * 0.2));
    ctx.lineTo(px(sx, 0.3, 0.2 + k * 0.2), py(sy, 0.3, 0.2 + k * 0.2));
    ctx.moveTo(px(sx, 0.02, 0.14 - k * 0.2), py(sy, 0.02, 0.14 - k * 0.2));
    ctx.lineTo(px(sx, 0.1, 0.36), py(sy, 0.1, 0.36));
    strokeInk(ctx, 0.7, 0.34);
  }

  // Juntas de dilatação: uma placa a cada três células.
  if ((x % 3 === 1 && x > 1) || (y % 3 === 1 && y > 1)) {
    ctx.beginPath();
    if (x % 3 === 1 && x > 1) floorSeg(ctx, sx, sy, -0.5, -0.5, -0.5, 0.5);
    if (y % 3 === 1 && y > 1) floorSeg(ctx, sx, sy, -0.5, -0.5, 0.5, -0.5);
    strokeInk(ctx, 1, 0.3);
  }
}

const TACO = [-0.1, -0.04, 0.02, 0.07, -0.07] as const;

/** Taco de madeira, com o sentido das réguas alternado pela variante. */
export function drawParquet(ctx: CanvasRenderingContext2D, base: string, sx: number, sy: number, variante: 0 | 1, info: CellInfo): void {
  const { x, y } = info;
  for (let i = 0; i < 4; i += 1) {
    const a = -0.5 + i * 0.25;
    ctx.beginPath();
    if (variante === 0) floorRect(ctx, sx, sy, -0.5, a, 0.5, a + 0.25);
    else floorRect(ctx, sx, sy, a, -0.5, a + 0.25, 0.5);
    fillSolid(ctx, tone(base, TACO[Math.floor(cellNoise(x, y, 30 + i) * TACO.length)] ?? 0));
  }
  // Veio da madeira: um risco curto por régua.
  ctx.beginPath();
  for (let i = 0; i < 4; i += 1) {
    const a = -0.375 + i * 0.25;
    const p = (cellNoise(x, y, 40 + i) - 0.5) * 0.5;
    if (variante === 0) floorSeg(ctx, sx, sy, p - 0.18, a, p + 0.18, a);
    else floorSeg(ctx, sx, sy, a, p - 0.18, a, p + 0.18);
  }
  strokeInk(ctx, 0.6, 0.13);
  // Frestas entre as réguas e o contorno do bloco.
  ctx.beginPath();
  for (let i = 1; i < 4; i += 1) {
    const a = -0.5 + i * 0.25;
    if (variante === 0) floorSeg(ctx, sx, sy, -0.5, a, 0.5, a);
    else floorSeg(ctx, sx, sy, a, -0.5, a, 0.5);
  }
  strokeInk(ctx, 0.6, 0.26);
  diamond(ctx, sx, sy);
  strokeInk(ctx, 0.7, 0.32);
}

/** Pedra clara em placas, com junta fina e um tozeto nos cantos. */
export function drawSlab(ctx: CanvasRenderingContext2D, paleta: ScenePalette, base: string, sx: number, sy: number, info: CellInfo): void {
  const { x, y } = info;
  diamond(ctx, sx, sy);
  fillSolid(ctx, base);

  // Nuvem da pedra.
  const a = cellNoise(x, y, 1);
  const b = cellNoise(x, y, 2);
  blot(ctx, sx, sy, (a - 0.5) * 0.3, (b - 0.5) * 0.3, 9 + b * 5, tone(base, 0.4), 0.45);
  if (a > 0.45) {
    ctx.beginPath();
    floorSeg(ctx, sx, sy, -0.3 + b * 0.2, -0.3, 0.05 + a * 0.2, 0.32);
    strokeInk(ctx, 0.6, 0.1);
  }

  // Junta: fina, com um fio de luz por dentro nas duas bordas de trás.
  ctx.beginPath();
  ctx.moveTo(sx - HW + 3, sy);
  ctx.lineTo(sx, sy - HH + 1.5);
  ctx.lineTo(sx + HW - 3, sy);
  strokeInk(ctx, 0.9, 0.5, PAPER);
  diamond(ctx, sx, sy);
  strokeInk(ctx, 0.8, 0.26);

  // Tozeto escuro no canto de trás, quando as quatro placas em volta são de pedra.
  const cena = info.cena;
  if (isPlainFloor(cena, x, y) && isPlainFloor(cena, x - 1, y) && isPlainFloor(cena, x, y - 1) && isPlainFloor(cena, x - 1, y - 1)) {
    const cy = sy - HH;
    ctx.beginPath();
    ctx.moveTo(sx, cy - 3);
    ctx.lineTo(sx + 6, cy);
    ctx.lineTo(sx, cy + 3);
    ctx.lineTo(sx - 6, cy);
    ctx.closePath();
    ctx.fillStyle = tone(paleta.tapete, 0.12);
    ctx.fill();
    strokeInk(ctx, 0.7, 0.55);
  }
}

/** Pedra fria polida, com veio discreto e reflexo. */
export function drawPolished(ctx: CanvasRenderingContext2D, base: string, sx: number, sy: number, info: CellInfo): void {
  const { x, y } = info;
  diamond(ctx, sx, sy);
  fillSolid(ctx, base);

  const a = cellNoise(x, y, 1);
  const b = cellNoise(x, y, 2);
  const c = cellNoise(x, y, 3);

  // Reflexo do polimento: faixas verticais claras, curtas.
  const h = (a - 0.5) * 26;
  const meia = 5 + b * 3;
  ctx.beginPath();
  ctx.rect(sx + h - 2.2, sy - meia, 4.4, meia * 2);
  ctx.rect(sx + h + 5, sy - meia * 0.6, 1.6, meia * 1.2);
  fillAlpha(ctx, PAPER, 0.34);

  // Veio: uma linha fina e quebrada, mais escura, em parte das placas.
  if (c > 0.35) {
    const k = (b - 0.5) * 0.3;
    ctx.beginPath();
    ctx.moveTo(px(sx, -0.42, -0.2 + k), py(sy, -0.42, -0.2 + k));
    ctx.lineTo(px(sx, -0.15, -0.08 - k), py(sy, -0.15, -0.08 - k));
    ctx.lineTo(px(sx, 0.08, 0.1 + k), py(sy, 0.08, 0.1 + k));
    ctx.lineTo(px(sx, 0.4, 0.16 - k), py(sy, 0.4, 0.16 - k));
    strokeInk(ctx, 0.7, 0.14);
    ctx.beginPath();
    ctx.moveTo(px(sx, -0.15, -0.08 - k), py(sy, -0.15, -0.08 - k));
    ctx.lineTo(px(sx, -0.02, -0.34), py(sy, -0.02, -0.34));
    strokeInk(ctx, 0.6, 0.09);
  }

  diamond(ctx, sx, sy);
  strokeInk(ctx, 0.7, 0.17);
}
