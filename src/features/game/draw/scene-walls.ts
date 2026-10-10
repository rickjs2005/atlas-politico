// Paredes: as duas de trás ficam em pé, com o caráter da arte do ambiente, e
// as duas da frente são um parapeito baixo. Todas são mais finas que a célula
// e encostam no lado de dentro dela, para o piso chegar até a parede.
//
// Cada célula desenha só o próprio trecho, sem linha de emenda: a parede lê
// como uma peça só, e o que marca o ritmo são as janelas, as pilastras e os
// painéis, em posições fixas. O que cada arte desenha está em draw/arts/.

import type { SceneArtId, ScenePalette } from "@/lib/game/types";

import { ARTS } from "./arts";
import { LIGHT, OUTLINE } from "./kit";
import { HH, HW, PARAPET_H, PARAPET_T, PLINTH, WALL_H, WALL_T, fillAlpha, fillSolid, strokeInk } from "./scene-shared";
import type { CellInfo, DrawContext, WallSide } from "./types";
import { X, Y, band, hline, plane, rect, seg, type Estilo, type Luz } from "./wall-kit";

// ---------------------------------------------------------------------------
// As cores de cada cena, já com a luz da face
// ---------------------------------------------------------------------------

const estilos = new WeakMap<ScenePalette, Partial<Record<Luz, Estilo>>>();

function styleOf(arte: SceneArtId, paleta: ScenePalette, luz: Luz): Estilo {
  let daPaleta = estilos.get(paleta);
  if (daPaleta === undefined) {
    daPaleta = {};
    estilos.set(paleta, daPaleta);
  }
  let pronto = daPaleta[luz];
  if (pronto === undefined) {
    pronto = ARTS[arte].parede.estilo(paleta, LIGHT[luz]);
    daPaleta[luz] = pronto;
  }
  return pronto;
}

/** Faixas e linhas que dão a volta na parede, inclusive no topo do pilar. */
function drawBands(ctx: CanvasRenderingContext2D, arte: SceneArtId, e: Estilo, u0: number, u1: number): void {
  const { faixas, linhas } = ARTS[arte].parede;
  for (const [v0, v1, cor] of faixas) band(ctx, u0, u1, v0, v1, e[cor]);
  for (const [v, alfa] of linhas) hline(ctx, u0, u1, v, alfa);
}

// ---------------------------------------------------------------------------
// Parede de trás
// ---------------------------------------------------------------------------

function drawBackWall(ctx: CanvasRenderingContext2D, paleta: ScenePalette, sx: number, sy: number, norte: boolean, info: CellInfo): void {
  const { arte } = info;
  const i = norte ? info.x : info.y;
  const n = norte ? info.largura : info.altura;
  // O canto de trás é da parede norte: ali só aparece o topo, que fecha o L.
  const canto = norte && i === 0;
  const fim = i === n - 1;
  const u0 = canto ? 1 - WALL_T : 0;
  const u1 = fim ? WALL_T : 1;
  // A espessura vai para fora da sala: para cima na tela.
  const tx = (norte ? HW : -HW) * WALL_T;
  const ty = -HH * WALL_T;
  const e = styleOf(arte, paleta, norte ? "esquerda" : "direita");

  if (norte) plane(sx - HW, sy, HW, HH);
  else plane(sx + HW, sy, -HW, HH);

  if (!canto) {
    ctx.beginPath();
    rect(ctx, u0, 0, u1, WALL_H);
    fillSolid(ctx, e.face);
    drawBands(ctx, arte, e, u0, u1);
    if (!fim) ARTS[arte].parede.decorar(ctx, e, i, norte);
    // Sombra do remate sobre o pano da parede.
    ctx.beginPath();
    rect(ctx, u0, WALL_H - 2, u1, WALL_H);
    fillAlpha(ctx, "#1b1c1a", 0.1);
    // Onde a parede encontra o piso.
    hline(ctx, u0, u1, 0.3, 1, OUTLINE);
    // A quina de dentro, onde as duas paredes se encontram.
    if (!norte && i === 1) {
      ctx.beginPath();
      seg(ctx, 0, 0, 0, WALL_H);
      strokeInk(ctx, 0.9, 0.85);
    }
  }

  // Topo.
  const ax = X(u0);
  const ay = Y(u0, WALL_H);
  const bx = X(u1);
  const by = Y(u1, WALL_H);
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(bx, by);
  ctx.lineTo(bx + tx, by + ty);
  ctx.lineTo(ax + tx, ay + ty);
  ctx.closePath();
  fillSolid(ctx, paleta.paredeTopo);
  ctx.beginPath();
  ctx.moveTo(ax + tx, ay + ty);
  ctx.lineTo(bx + tx, by + ty);
  if (canto) {
    // As duas bordas de fora do canto e a meia-esquadria.
    ctx.moveTo(ax + tx, ay + ty);
    ctx.lineTo(ax, ay);
  } else {
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
  }
  strokeInk(ctx, OUTLINE);
  if (canto) {
    ctx.beginPath();
    ctx.moveTo(ax + tx, ay + ty);
    ctx.lineTo(bx, by);
    strokeInk(ctx, 0.9, 0.5);
  }

  if (!fim) return;
  // O pilar que arremata a parede: a face da ponta, com a outra luz.
  const px0 = X(u1);
  const py0 = Y(u1, 0);
  const ponta = styleOf(arte, paleta, norte ? "direita" : "esquerda");
  plane(px0, py0, tx / WALL_T, ty / WALL_T);
  ctx.beginPath();
  rect(ctx, 0, -PLINTH, WALL_T, WALL_H);
  fillSolid(ctx, ponta.face);
  drawBands(ctx, arte, ponta, 0, WALL_T);
  band(ctx, 0, WALL_T, -PLINTH, 0, ponta.rodape);
  ctx.beginPath();
  rect(ctx, 0, -PLINTH, WALL_T, WALL_H);
  strokeInk(ctx, OUTLINE);
  // A aresta entre as duas faces do pilar, até a laje.
  ctx.beginPath();
  seg(ctx, 0, 0, 0, -PLINTH);
  strokeInk(ctx, OUTLINE);
}

// ---------------------------------------------------------------------------
// Parapeito da frente
// ---------------------------------------------------------------------------

/**
 * O parapeito de uma célula. `leste` corre no eixo y; o outro, no eixo x. A
 * face que se vê é a de fora.
 */
function drawParapet(ctx: CanvasRenderingContext2D, paleta: ScenePalette, sx: number, sy: number, leste: boolean, info: CellInfo): void {
  const { arte } = info;
  const parede = ARTS[arte].parede;
  const i = leste ? info.y : info.x;
  const n = leste ? info.altura : info.largura;
  // O canto da frente é do parapeito leste: um bloco que fecha os dois.
  const canto = leste && i === n - 1;
  const u0 = 0;
  const u1 = canto ? PARAPET_T : 1;
  const tx = (leste ? -HW : HW) * PARAPET_T;
  const ty = -HH * PARAPET_T;
  const e = styleOf(arte, paleta, leste ? "direita" : "esquerda");
  const corpo = e[parede.corpoDoParapeito];

  if (leste) plane(sx + (-0.5 + PARAPET_T + 0.5) * HW, sy + (-0.5 + PARAPET_T - 0.5) * HH, -HW, HH);
  else plane(sx + (-0.5 - (-0.5 + PARAPET_T)) * HW, sy + (-0.5 + -0.5 + PARAPET_T) * HH, HW, HH);

  // Face de fora, com a laje embaixo.
  ctx.beginPath();
  rect(ctx, u0, 0, u1, PARAPET_H);
  fillSolid(ctx, corpo);
  band(ctx, u0, u1, -PLINTH, 0, e.rodape);
  parede.parapeito(ctx, e, u0, u1);
  hline(ctx, u0, u1, 0, 0.55);
  hline(ctx, u0, u1, -PLINTH, 1, OUTLINE);

  // Topo.
  const ax = X(u0);
  const ay = Y(u0, PARAPET_H);
  const bx = X(u1);
  const by = Y(u1, PARAPET_H);
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(bx, by);
  ctx.lineTo(bx + tx, by + ty);
  ctx.lineTo(ax + tx, ay + ty);
  ctx.closePath();
  fillSolid(ctx, paleta.paredeTopo);
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(bx, by);
  ctx.moveTo(ax + tx, ay + ty);
  ctx.lineTo(bx + tx, by + ty);
  strokeInk(ctx, OUTLINE);

  if (!canto) return;
  // A ponta do bloco do canto, voltada para o outro lado.
  const px0 = X(u1);
  const py0 = Y(u1, 0);
  const ponta = styleOf(arte, paleta, "esquerda");
  plane(px0, py0, tx / PARAPET_T, ty / PARAPET_T);
  ctx.beginPath();
  rect(ctx, 0, 0, PARAPET_T, PARAPET_H);
  fillSolid(ctx, ponta[parede.corpoDoParapeito]);
  band(ctx, 0, PARAPET_T, -PLINTH, 0, ponta.rodape);
  ctx.beginPath();
  rect(ctx, 0, -PLINTH, PARAPET_T, PARAPET_H);
  strokeInk(ctx, OUTLINE);
  hline(ctx, 0, PARAPET_T, 0, 0.55);
}

/** A parede de uma célula de borda. */
export function drawWall(d: DrawContext, paleta: ScenePalette, sx: number, sy: number, lado: WallSide, info: CellInfo): void {
  const { ctx } = d;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  if (lado === "norte" || lado === "oeste") {
    drawBackWall(ctx, paleta, sx, sy, lado === "norte", info);
    return;
  }
  drawParapet(ctx, paleta, sx, sy, lado === "leste", info);
}
