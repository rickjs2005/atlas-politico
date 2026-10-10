// O registro recolhível, o anel de alcance e o efeito de recolher.
//
// O registro é uma pasta de documentos que paira sobre uma marca no chão. É o
// único objeto da cena com a cor de papel pardo e a marca em acento, para não
// se confundir com os papéis que só enfeitam as mesas e o piso.

import type { ScenePalette } from "@/lib/game/types";

import { ACCENT, ACCENT_SOFT, INK, OUTLINE, PAPER, groundShadow } from "./kit";
import type { DrawContext, RecordArt } from "./types";

const TAU = Math.PI * 2;
const PARDO = "#e7c887";
const PARDO_ESCURO = "#cfa95f";
/** Altura em que a pasta paira, do chão ao centro dela. */
const HOVER = 23;

/** A pasta, de frente, com o centro em (`cx`, `cy`). */
function drawFolder(ctx: CanvasRenderingContext2D, cx: number, cy: number, escala: number, destaque: boolean): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.09);
  ctx.scale(escala, escala);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  if (destaque) {
    // Halo claro, para a pasta ao alcance saltar do cenário.
    ctx.beginPath();
    ctx.ellipse(0, 0, 19, 16, 0, 0, TAU);
    ctx.fillStyle = ACCENT_SOFT;
    ctx.globalAlpha *= 0.85;
    ctx.fill();
    ctx.globalAlpha /= 0.85;
  }

  // A capa de trás, com a aba.
  ctx.beginPath();
  ctx.moveTo(-12, -6.5);
  ctx.lineTo(-10, -10);
  ctx.lineTo(-1.5, -10);
  ctx.lineTo(0.5, -6.5);
  ctx.lineTo(12, -6.5);
  ctx.lineTo(12, 9);
  ctx.lineTo(-12, 9);
  ctx.closePath();
  ctx.fillStyle = PARDO_ESCURO;
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = OUTLINE;
  ctx.stroke();

  // As folhas, saindo por cima.
  ctx.beginPath();
  ctx.rect(-9.5, -9, 19, 13);
  ctx.fillStyle = PAPER;
  ctx.fill();
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.beginPath();
  for (const [x0, x1, y] of [
    [-7, 5.5, -6.2],
    [-7, 7, -3.8],
  ] as const) {
    ctx.moveTo(x0, y);
    ctx.lineTo(x1, y);
  }
  ctx.globalAlpha *= 0.4;
  ctx.lineWidth = 0.9;
  ctx.stroke();
  ctx.globalAlpha /= 0.4;

  // A capa da frente, com a etiqueta.
  ctx.beginPath();
  ctx.moveTo(-12, -1.5);
  ctx.lineTo(12, -1.5);
  ctx.lineTo(12, 9);
  ctx.lineTo(-12, 9);
  ctx.closePath();
  ctx.fillStyle = PARDO;
  ctx.fill();
  ctx.lineWidth = OUTLINE;
  ctx.stroke();
  ctx.beginPath();
  ctx.rect(-6, 1.4, 12, 4.6);
  ctx.fillStyle = PAPER;
  ctx.fill();
  ctx.strokeStyle = ACCENT;
  ctx.lineWidth = 1.1;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-3.6, 3.7);
  ctx.lineTo(3.6, 3.7);
  ctx.stroke();

  if (destaque) {
    // Contorno em acento por fora do grafite.
    ctx.beginPath();
    ctx.moveTo(-13.6, -7);
    ctx.lineTo(-10.8, -11.6);
    ctx.lineTo(-0.8, -11.6);
    ctx.lineTo(1.4, -8.1);
    ctx.lineTo(13.6, -8.1);
    ctx.lineTo(13.6, 10.6);
    ctx.lineTo(-13.6, 10.6);
    ctx.closePath();
    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }
  ctx.restore();
}

/** A marca no chão: um losango pequeno, em acento. */
function drawMark(ctx: CanvasRenderingContext2D, sx: number, sy: number, destaque: boolean): void {
  ctx.beginPath();
  ctx.moveTo(sx, sy - 7);
  ctx.lineTo(sx + 14, sy);
  ctx.lineTo(sx, sy + 7);
  ctx.lineTo(sx - 14, sy);
  ctx.closePath();
  const antes = ctx.globalAlpha;
  ctx.globalAlpha = antes * (destaque ? 0.9 : 0.55);
  ctx.fillStyle = ACCENT_SOFT;
  ctx.fill();
  ctx.globalAlpha = antes * (destaque ? 1 : 0.7);
  ctx.strokeStyle = ACCENT;
  ctx.lineWidth = 1.2;
  ctx.lineJoin = "round";
  ctx.stroke();
  ctx.globalAlpha = antes;
}

export const RECORD_ART: RecordArt = {
  draw(d, sx, sy, destaque) {
    const { ctx } = d;
    // Cada pasta balança no próprio tempo, pela posição.
    const sobe = d.movimento ? Math.sin(d.tempo * 2.2 + sx * 0.05) * 1.8 : 0;
    drawMark(ctx, sx, sy, destaque);
    groundShadow(ctx, sx, sy, 9 - sobe * 0.5);
    drawFolder(ctx, sx, sy - HOVER - sobe, 1, destaque);
  },
};

/** Anel sob o que está ao alcance: tracejado em acento sobre um fio claro, para ler em qualquer piso. */
export function drawReachRing(d: DrawContext, _paleta: ScenePalette, sx: number, sy: number): void {
  const { ctx } = d;
  ctx.beginPath();
  ctx.ellipse(sx, sy, 25, 12.5, 0, 0, TAU);
  const antes = ctx.globalAlpha;
  ctx.globalAlpha = antes * 0.6;
  ctx.strokeStyle = PAPER;
  ctx.lineWidth = 4.2;
  ctx.stroke();
  ctx.globalAlpha = antes;
  ctx.strokeStyle = ACCENT;
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.lineDashOffset = d.movimento ? -d.tempo * 9 : 0;
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.lineDashOffset = 0;
}

/** Recolher: a pasta sobe e some, e um anel se abre na marca. `t` de 0 a 1. */
export function drawCollectEffect(d: DrawContext, _paleta: ScenePalette, sx: number, sy: number, t: number): void {
  const { ctx } = d;
  const k = Math.min(1, Math.max(0, t));
  const saida = 1 - (1 - k) * (1 - k);
  const antes = ctx.globalAlpha;

  ctx.globalAlpha = antes * (1 - k);
  ctx.beginPath();
  ctx.ellipse(sx, sy, 14 + saida * 20, 7 + saida * 10, 0, 0, TAU);
  ctx.strokeStyle = ACCENT;
  ctx.lineWidth = 2;
  ctx.stroke();

  const cy = sy - HOVER - saida * 34;
  // Riscos curtos em volta da pasta.
  ctx.beginPath();
  for (let i = 0; i < 6; i += 1) {
    const a = (i / 6) * TAU + 0.3;
    const r0 = 17 + saida * 6;
    const r1 = r0 + 5;
    ctx.moveTo(sx + Math.cos(a) * r0, cy + Math.sin(a) * r0 * 0.8);
    ctx.lineTo(sx + Math.cos(a) * r1, cy + Math.sin(a) * r1 * 0.8);
  }
  ctx.lineWidth = 1.6;
  ctx.lineCap = "round";
  ctx.stroke();

  ctx.globalAlpha = antes * (1 - k * k);
  drawFolder(ctx, sx, cy, 1 + saida * 0.12, false);
  ctx.globalAlpha = antes;
}
