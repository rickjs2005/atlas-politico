// Piso: o material da arte do ambiente (draw/arts/) e o tapete, igual em
// todas. Cada célula é desenhada inteira dentro do próprio losango, para a
// ordem das células não mudar o resultado.

import type { ScenePalette } from "@/lib/game/types";

import { ARTS } from "./arts";
import { diamond } from "./floor-kit";
import { PAPER, tone } from "./kit";
import { SIDE, carpetEdges, fillSolid, floorSeg, strokeInk } from "./scene-shared";
import type { CellInfo, DrawContext } from "./types";

// ---------------------------------------------------------------------------
// Tapete: trama discreta e borda clara só onde o tapete acaba
// ---------------------------------------------------------------------------

/** Recuo da faixa da borda, em células. */
const M = 0.11;

function drawCarpet(ctx: CanvasRenderingContext2D, paleta: ScenePalette, sx: number, sy: number, variante: 0 | 1, info: CellInfo): void {
  const base = variante === 0 ? paleta.tapete : tone(paleta.tapete, -0.035);
  diamond(ctx, sx, sy);
  fillSolid(ctx, base);

  // Trama: fios escuros em um sentido e claros no outro.
  ctx.beginPath();
  for (let i = -3; i <= 3; i += 1) floorSeg(ctx, sx, sy, -0.5, i * 0.125, 0.5, i * 0.125);
  strokeInk(ctx, 0.6, 0.13);
  ctx.beginPath();
  for (let i = -3; i <= 3; i += 1) floorSeg(ctx, sx, sy, i * 0.125, -0.5, i * 0.125, 0.5);
  strokeInk(ctx, 0.6, 0.12, PAPER);

  const bits = carpetEdges(info.cena, info.x, info.y);
  if (bits === 0) return;
  const o = (bits & SIDE.oeste) !== 0;
  const n = (bits & SIDE.norte) !== 0;
  const l = (bits & SIDE.leste) !== 0;
  const s = (bits & SIDE.sul) !== 0;
  const a = 0.5 - M;

  // Faixa clara da borda, recuada, dobrando nos cantos.
  ctx.beginPath();
  if (o) floorSeg(ctx, sx, sy, -a, n ? -a : -0.5, -a, s ? a : 0.5);
  if (l) floorSeg(ctx, sx, sy, a, n ? -a : -0.5, a, s ? a : 0.5);
  if (n) floorSeg(ctx, sx, sy, o ? -a : -0.5, -a, l ? a : 0.5, -a);
  if (s) floorSeg(ctx, sx, sy, o ? -a : -0.5, a, l ? a : 0.5, a);
  if ((bits & 16) !== 0) {
    floorSeg(ctx, sx, sy, -0.5, -a, -a, -a);
    floorSeg(ctx, sx, sy, -a, -a, -a, -0.5);
  }
  if ((bits & 32) !== 0) {
    floorSeg(ctx, sx, sy, 0.5, -a, a, -a);
    floorSeg(ctx, sx, sy, a, -a, a, -0.5);
  }
  if ((bits & 64) !== 0) {
    floorSeg(ctx, sx, sy, 0.5, a, a, a);
    floorSeg(ctx, sx, sy, a, a, a, 0.5);
  }
  if ((bits & 128) !== 0) {
    floorSeg(ctx, sx, sy, -0.5, a, -a, a);
    floorSeg(ctx, sx, sy, -a, a, -a, 0.5);
  }
  ctx.lineCap = "butt";
  strokeInk(ctx, 2.2, 1, tone(paleta.tapete, 0.5));
  ctx.lineCap = "round";

  // A beirada do tapete: um fio de tinta, mais forte nos lados voltados para a câmera.
  if (o || n) {
    ctx.beginPath();
    if (o) floorSeg(ctx, sx, sy, -0.5, -0.5, -0.5, 0.5);
    if (n) floorSeg(ctx, sx, sy, -0.5, -0.5, 0.5, -0.5);
    strokeInk(ctx, 0.8, 0.45);
  }
  if (l || s) {
    ctx.beginPath();
    if (l) floorSeg(ctx, sx, sy, 0.5, -0.5, 0.5, 0.5);
    if (s) floorSeg(ctx, sx, sy, -0.5, 0.5, 0.5, 0.5);
    strokeInk(ctx, 1.1, 0.7);
  }
}

/** O piso de uma célula, pelo material da arte do ambiente. */
export function drawFloor(d: DrawContext, paleta: ScenePalette, sx: number, sy: number, variante: 0 | 1, tapete: boolean, info: CellInfo): void {
  const { ctx } = d;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  if (tapete) {
    drawCarpet(ctx, paleta, sx, sy, variante, info);
    return;
  }
  const base = variante === 0 ? paleta.chao : paleta.chaoAlt;
  ARTS[info.arte].piso(ctx, paleta, base, sx, sy, variante, info);
}
