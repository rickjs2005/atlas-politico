// Saída: um portal com porta no vão do parapeito e, no chão, a soleira com o
// degrau de fora. Enquanto a saída está fechada, a porta fica fechada, com a
// tranca atravessada. Ao abrir, a tranca some, a folha gira para fora, a
// placa da verga acende e o degrau ganha as setas que apontam para fora.
//
// O plano da parede e o da folha ficam em exit-kit.ts; a porta de cada
// ambiente (cores e desenho da folha) vem da arte (draw/arts/).

import type { ExitSide, SceneArtId, ScenePalette } from "@/lib/game/types";

import { ARTS } from "./arts";
import { FRAME_H, LEAF_H, LINTEL, POST, X, Y, box, faceTop, faceW, leafRect, lightU, lightW, plane, smooth, swing, type DoorStyle } from "./exit-kit";
import { ACCENT, ACCENT_SOFT, DETAIL, OUTLINE, PAPER, tone } from "./kit";
import { PARAPET_T, PLINTH, fillAlpha, fillSolid, shade, strokeInk } from "./scene-shared";
import type { CellInfo, DrawContext } from "./types";

/** Quanto a folha gira para fora, aberta: pouco mais que um ângulo reto. */
const SWING = 1.75;
/** Quanto o degrau de fora avança da parede, em células. */
const STEP = 0.46;

const estilos = new WeakMap<ScenePalette, DoorStyle>();

function styleOf(arte: SceneArtId, paleta: ScenePalette): DoorStyle {
  let pronto = estilos.get(paleta);
  if (pronto === undefined) {
    pronto = ARTS[arte].porta(paleta);
    estilos.set(paleta, pronto);
  }
  return pronto;
}

// ---------------------------------------------------------------------------
// A folha
// ---------------------------------------------------------------------------

function drawLeaf(ctx: CanvasRenderingContext2D, e: DoorStyle, angulo: number): void {
  swing(angulo);
  // Até meio caminho vê-se a face de fora, com a luz da parede; depois, a de
  // dentro, com a luz da face do lado.
  const luz = lightW() + (lightU() - lightW()) * smooth(0.6, 1, angulo);
  ctx.beginPath();
  leafRect(ctx, 0, 0, 1, LEAF_H);
  fillSolid(ctx, shade(e.folha, luz));
  e.desenho(ctx, e, luz);
  ctx.beginPath();
  leafRect(ctx, 0, 0, 1, LEAF_H);
  strokeInk(ctx, OUTLINE);
}

// ---------------------------------------------------------------------------
// A tranca e a placa
// ---------------------------------------------------------------------------

/** A tranca atravessada na porta fechada, com o cadeado. */
function drawBar(ctx: CanvasRenderingContext2D, alfa: number): void {
  if (alfa <= 0.01) return;
  const antes = ctx.globalAlpha;
  ctx.globalAlpha = antes * alfa;
  // A barra, de montante a montante.
  faceW(ctx, 0.03, 0.97, 0, 31, 37);
  fillSolid(ctx, "#3a3b37");
  strokeInk(ctx, DETAIL);
  // O cadeado: corpo claro e arco.
  ctx.beginPath();
  ctx.moveTo(X(0.44, 0), Y(0.44, 0, 37));
  ctx.lineTo(X(0.44, 0), Y(0.44, 0, 42.5));
  ctx.lineTo(X(0.56, 0), Y(0.56, 0, 42.5));
  ctx.lineTo(X(0.56, 0), Y(0.56, 0, 37));
  strokeInk(ctx, 1.7);
  faceW(ctx, 0.4, 0.6, 0, 27, 37.5);
  fillSolid(ctx, PAPER);
  strokeInk(ctx, DETAIL + 0.2);
  ctx.beginPath();
  ctx.moveTo(X(0.5, 0), Y(0.5, 0, 34));
  ctx.lineTo(X(0.5, 0), Y(0.5, 0, 30.5));
  strokeInk(ctx, 1.4);
  ctx.globalAlpha = antes;
}

/** A placa da verga: apagada com a porta fechada, acesa com ela aberta. */
function drawSign(ctx: CanvasRenderingContext2D, abertura: number): void {
  faceW(ctx, 0.3, 0.7, 0, LEAF_H + 1.6, FRAME_H - 1.6);
  fillSolid(ctx, "#3a3b37");
  if (abertura > 0.01) {
    fillAlpha(ctx, ACCENT_SOFT, abertura);
    ctx.beginPath();
    ctx.moveTo(X(0.36, 0), Y(0.36, 0, LEAF_H + 4));
    ctx.lineTo(X(0.64, 0), Y(0.64, 0, LEAF_H + 4));
    strokeInk(ctx, 1.6, abertura, ACCENT);
    faceW(ctx, 0.3, 0.7, 0, LEAF_H + 1.6, FRAME_H - 1.6);
  }
  strokeInk(ctx, DETAIL);
}

// ---------------------------------------------------------------------------
// O que o cenário usa
// ---------------------------------------------------------------------------

/**
 * A soleira e o degrau de fora: ficam no chão e são desenhados com o piso,
 * antes de tudo o que está em pé. As setas aparecem quando a saída abre.
 */
export function drawThreshold(d: DrawContext, paleta: ScenePalette, sx: number, sy: number, lado: ExitSide, abertura: number, info: CellInfo): void {
  const { ctx } = d;
  const e = styleOf(info.arte, paleta);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  plane(sx, sy, lado);

  // A soleira, na espessura da parede.
  faceTop(ctx, 0, 1, -PARAPET_T, 0, 0);
  fillSolid(ctx, tone(e.degrau, 0.2));
  strokeInk(ctx, DETAIL, 0.6);

  // O degrau de fora, da altura da laje.
  box(ctx, 0, 1, 0, STEP, -PLINTH, 0, e.degrau);

  if (abertura <= 0.01) return;
  // Duas setas para fora. Com movimento, a segunda acende depois da primeira.
  const pulso = d.movimento && abertura >= 1 ? (Math.sin(d.tempo * 3.2) + 1) / 2 : 1;
  for (let i = 0; i < 2; i += 1) {
    const w = 0.1 + i * 0.15;
    ctx.beginPath();
    ctx.moveTo(X(0.3, w), Y(0.3, w, 0));
    ctx.lineTo(X(0.5, w + 0.11), Y(0.5, w + 0.11, 0));
    ctx.lineTo(X(0.7, w), Y(0.7, w, 0));
    strokeInk(ctx, 2.2, abertura * (i === 0 ? 0.55 + 0.45 * (1 - pulso) : 0.55 + 0.45 * pulso), ACCENT);
  }
}

/** O portal e a porta. `abertura` vai de 0 (fechada, com a tranca) a 1 (aberta). */
export function drawExit(d: DrawContext, paleta: ScenePalette, sx: number, sy: number, lado: ExitSide, abertura: number, info: CellInfo): void {
  const { ctx } = d;
  const e = styleOf(info.arte, paleta);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  plane(sx, sy, lado);

  // Os dois montantes, o de trás primeiro, e a verga por cima.
  box(ctx, 0, POST, -PARAPET_T, 0, 0, LEAF_H, e.moldura);
  box(ctx, 1 - POST, 1, -PARAPET_T, 0, 0, LEAF_H, e.moldura);
  box(ctx, 0, 1, -PARAPET_T, 0, LEAF_H, FRAME_H, e.moldura);
  void LINTEL;
  drawSign(ctx, abertura);

  // A folha gira depois que a tranca sai.
  drawLeaf(ctx, e, SWING * smooth(0.2, 1, abertura));
  drawBar(ctx, 1 - smooth(0, 0.3, abertura));
}
