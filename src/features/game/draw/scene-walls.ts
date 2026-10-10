// Paredes: as duas de trás ficam em pé, com o caráter de cada cena, e as duas
// da frente são um parapeito baixo. Todas são mais finas que a célula e
// encostam no lado de dentro dela, para o piso chegar até a parede.
//
// Cada célula desenha só o próprio trecho, sem linha de emenda: a parede lê
// como uma peça só, e o que marca o ritmo são as janelas, as pilastras e os
// painéis, em posições fixas.

import type { SceneId, ScenePalette } from "@/lib/game/types";

import { DETAIL, LIGHT, OUTLINE, PAPER, tone } from "./kit";
import { HH, HW, PARAPET_H, PARAPET_T, PLINTH, WALL_H, WALL_T, fillAlpha, fillSolid, strokeInk } from "./scene-shared";
import type { CellInfo, DrawContext, WallSide } from "./types";

// ---------------------------------------------------------------------------
// O plano em que se desenha: a face de uma parede
// ---------------------------------------------------------------------------

// Origem na tela e passo de uma célula ao longo da parede. Fica no módulo
// para não criar um objeto por célula a cada quadro.
let ox = 0;
let oy = 0;
let ux = 0;
let uy = 0;

function plane(x: number, y: number, dx: number, dy: number): void {
  ox = x;
  oy = y;
  ux = dx;
  uy = dy;
}

const X = (u: number): number => ox + u * ux;
const Y = (u: number, v: number): number => oy + u * uy - v;

/** Retângulo na face: `u` em células ao longo da parede, `v` em pixels para cima. */
function rect(ctx: CanvasRenderingContext2D, u0: number, v0: number, u1: number, v1: number): void {
  ctx.moveTo(X(u0), Y(u0, v0));
  ctx.lineTo(X(u1), Y(u1, v0));
  ctx.lineTo(X(u1), Y(u1, v1));
  ctx.lineTo(X(u0), Y(u0, v1));
  ctx.closePath();
}

function seg(ctx: CanvasRenderingContext2D, u0: number, v0: number, u1: number, v1: number): void {
  ctx.moveTo(X(u0), Y(u0, v0));
  ctx.lineTo(X(u1), Y(u1, v1));
}

function band(ctx: CanvasRenderingContext2D, u0: number, u1: number, v0: number, v1: number, cor: string): void {
  ctx.beginPath();
  rect(ctx, u0, v0, u1, v1);
  fillSolid(ctx, cor);
}

function hline(ctx: CanvasRenderingContext2D, u0: number, u1: number, v: number, alfa: number, largura: number = DETAIL): void {
  ctx.beginPath();
  seg(ctx, u0, v, u1, v);
  strokeInk(ctx, largura, alfa);
}

// ---------------------------------------------------------------------------
// As cores de cada cena, já com a luz da face
// ---------------------------------------------------------------------------

interface Estilo {
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
  /** Material à parte da cena: cortiça, luz embutida. */
  extra: string;
}

type Luz = "esquerda" | "direita";

const VIDRO = "#c3cdc8";
const VIDRO_LUZ = "#e6ece4";

function buildStyle(cena: SceneId, p: ScenePalette, k: number): Estilo {
  if (cena === "sindicato") {
    return {
      face: tone(p.parede, k),
      barra: tone("#8a9591", k),
      rodape: tone("#6b6d68", k),
      remate: tone(p.parede, k - 0.12),
      friso: tone(p.parede, k + 0.3),
      relevo: tone(p.parede, k + 0.2),
      vidro: tone(VIDRO, k * 0.6),
      vidroLuz: tone(VIDRO_LUZ, k * 0.4),
      caixilho: tone("#565b58", k),
      madeira: tone(p.acento, k),
      extra: tone("#c7a87c", k),
    };
  }
  if (cena === "constituinte") {
    return {
      face: tone(p.parede, k),
      barra: tone(p.acento, k + 0.08),
      rodape: tone(p.acento, k - 0.32),
      remate: tone(p.parede, k + 0.3),
      friso: tone(p.acento, k + 0.3),
      relevo: tone(p.parede, k + 0.3),
      vidro: tone("#ccd6cf", k * 0.6),
      vidroLuz: tone("#eef2e8", k * 0.4),
      caixilho: tone(p.acento, k - 0.14),
      madeira: tone(p.acento, k),
      extra: tone(p.tapete, k + 0.1),
    };
  }
  if (cena === "alerj") {
    return {
      face: tone(p.parede, k),
      barra: tone(p.parede, k - 0.1),
      rodape: tone(p.parede, k - 0.36),
      remate: tone(p.parede, k + 0.38),
      friso: tone(p.parede, k + 0.3),
      relevo: tone(p.parede, k + 0.36),
      vidro: tone(VIDRO, k * 0.6),
      vidroLuz: tone(VIDRO_LUZ, k * 0.4),
      caixilho: tone(p.acento, k - 0.1),
      madeira: tone(p.acento, k),
      extra: tone(p.parede, k + 0.16),
    };
  }
  return {
    face: tone(p.parede, k),
    barra: tone(p.parede, k - 0.06),
    rodape: tone("#5c6160", k),
    remate: tone(p.parede, k + 0.25),
    friso: tone(p.parede, k + 0.3),
    relevo: tone(p.parede, k + 0.3),
    vidro: tone(VIDRO, k * 0.6),
    vidroLuz: tone(VIDRO_LUZ, k * 0.4),
    caixilho: tone("#6a6f6d", k),
    madeira: tone(p.acento, k),
    extra: tone("#f7edd2", k * 0.3),
  };
}

const estilos = new WeakMap<ScenePalette, Partial<Record<Luz, Estilo>>>();

function styleOf(cena: SceneId, paleta: ScenePalette, luz: Luz): Estilo {
  let daPaleta = estilos.get(paleta);
  if (daPaleta === undefined) {
    daPaleta = {};
    estilos.set(paleta, daPaleta);
  }
  let pronto = daPaleta[luz];
  if (pronto === undefined) {
    pronto = buildStyle(cena, paleta, LIGHT[luz]);
    daPaleta[luz] = pronto;
  }
  return pronto;
}

// ---------------------------------------------------------------------------
// Faixas horizontais: dão a volta na parede, inclusive no topo do pilar
// ---------------------------------------------------------------------------

type Faixa = readonly [v0: number, v1: number, cor: keyof Estilo];
/** Linha de tinta na altura `v`, com a opacidade dada. */
type Linha = readonly [v: number, alfa: number];

const FAIXAS: Record<SceneId, readonly Faixa[]> = {
  sindicato: [
    [0, 5, "rodape"],
    [5, 25, "barra"],
    [60, WALL_H, "remate"],
  ],
  constituinte: [
    [0, 5, "rodape"],
    [5, 26, "barra"],
    [26, 29.5, "friso"],
    [59, WALL_H, "remate"],
  ],
  alerj: [
    [0, 6, "rodape"],
    [6, 14, "barra"],
    [58, WALL_H, "remate"],
  ],
  senado: [
    [0, 4, "rodape"],
    [57.5, 61, "extra"],
    [61, WALL_H, "remate"],
  ],
};

const LINHAS: Record<SceneId, readonly Linha[]> = {
  sindicato: [
    [5, 0.45],
    [25, 0.6],
    [60, 0.55],
  ],
  constituinte: [
    [5, 0.5],
    [26, 0.6],
    [29.5, 0.55],
    [59, 0.5],
    [62.5, 0.22],
  ],
  alerj: [
    [6, 0.45],
    [14, 0.4],
    [58, 0.5],
    [61.5, 0.22],
  ],
  senado: [
    [4, 0.55],
    [57.5, 0.4],
    [61, 0.45],
  ],
};

function drawBands(ctx: CanvasRenderingContext2D, cena: SceneId, e: Estilo, u0: number, u1: number): void {
  for (const [v0, v1, cor] of FAIXAS[cena]) band(ctx, u0, u1, v0, v1, e[cor]);
  for (const [v, alfa] of LINHAS[cena]) hline(ctx, u0, u1, v, alfa);
}

// ---------------------------------------------------------------------------
// O caráter de cada cena, na face de uma célula inteira
// ---------------------------------------------------------------------------

/** Janelas, pilastras e painéis de destaque: uma célula a cada três. */
function isFeature(i: number): boolean {
  return i % 3 === 1;
}

/** Vidro com caixilho em grade: `colunas` por `linhas` vidraças. */
function drawGlass(ctx: CanvasRenderingContext2D, e: Estilo, u0: number, v0: number, u1: number, v1: number, colunas: number, linhas: number, grade: number): void {
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

// Sindicato: bloco de concreto pintado, com barra, janela alta de fábrica e
// um quadro de avisos.
function decorateSindicato(ctx: CanvasRenderingContext2D, e: Estilo, i: number, norte: boolean): void {
  // Fiadas de bloco, com as juntas desencontradas.
  ctx.beginPath();
  for (const v of [34, 43, 52]) seg(ctx, 0, v, 1, v);
  for (let fiada = 0; fiada < 4; fiada += 1) {
    const v0 = 25 + fiada * 9;
    const v1 = Math.min(60, v0 + 9);
    for (let c = fiada % 2 === 0 ? 0.25 : 0; c < 1; c += 0.5) if (c > 0) seg(ctx, c, v0, c, v1);
  }
  strokeInk(ctx, 0.6, 0.15);

  if (isFeature(i)) {
    // Janela alta de fábrica, com peitoril.
    band(ctx, 0.05, 0.95, 31.5, 34, e.friso);
    drawGlass(ctx, e, 0.09, 34, 0.91, 56.5, 4, 2, 1);
    hline(ctx, 0.05, 0.95, 31.5, 0.55);
    return;
  }
  if (norte && i === 9) {
    // Quadro de avisos: moldura de madeira, cortiça e papéis sem texto.
    band(ctx, 0.1, 0.9, 28, 51, e.madeira);
    band(ctx, 0.15, 0.85, 30.5, 48.5, e.extra);
    ctx.beginPath();
    rect(ctx, 0.1, 28, 0.9, 51);
    rect(ctx, 0.15, 30.5, 0.85, 48.5);
    strokeInk(ctx, DETAIL);
    ctx.beginPath();
    rect(ctx, 0.2, 35, 0.37, 46);
    rect(ctx, 0.42, 33, 0.6, 44.5);
    rect(ctx, 0.65, 37, 0.8, 46.5);
    ctx.fillStyle = PAPER;
    ctx.fill();
    strokeInk(ctx, 0.6, 0.6);
    // Linhas de texto que não se leem.
    ctx.beginPath();
    for (const [a, b, v] of [
      [0.23, 0.34, 43],
      [0.23, 0.32, 40.5],
      [0.23, 0.34, 38],
      [0.45, 0.57, 41.5],
      [0.45, 0.55, 39],
      [0.45, 0.57, 36.5],
      [0.68, 0.77, 43.5],
      [0.68, 0.76, 41],
    ] as const)
      seg(ctx, a, v, b, v);
    strokeInk(ctx, 0.6, 0.32);
  }
}

// Constituinte: parede clara com lambri de madeira almofadado e janela alta.
function decorateConstituinte(ctx: CanvasRenderingContext2D, e: Estilo, i: number): void {
  // Almofadas do lambri: duas por célula.
  ctx.beginPath();
  rect(ctx, 0.07, 8.5, 0.45, 22.5);
  rect(ctx, 0.55, 8.5, 0.93, 22.5);
  strokeInk(ctx, 0.7, 0.42);
  ctx.beginPath();
  seg(ctx, 0.07, 22.5, 0.45, 22.5);
  seg(ctx, 0.55, 22.5, 0.93, 22.5);
  strokeInk(ctx, 0.7, 0.4, e.friso);

  if (!isFeature(i)) return;
  // Janela alta: guarnição de madeira, bandeira no alto e peitoril.
  band(ctx, 0.2, 0.8, 31.5, 57.5, e.caixilho);
  drawGlass(ctx, e, 0.26, 34, 0.74, 55.5, 2, 1, 1.1);
  hline(ctx, 0.26, 0.74, 49, 1, 1.1);
  ctx.beginPath();
  rect(ctx, 0.2, 31.5, 0.8, 57.5);
  strokeInk(ctx, DETAIL);
  band(ctx, 0.16, 0.84, 29.5, 31.5, e.friso);
  ctx.beginPath();
  rect(ctx, 0.16, 29.5, 0.84, 31.5);
  strokeInk(ctx, 0.7, 0.7);
}

// Alerj: parede creme com pilastras e painéis emoldurados entre elas.
function decorateAlerj(ctx: CanvasRenderingContext2D, e: Estilo, i: number): void {
  // Dentículos da cornija.
  ctx.beginPath();
  for (let c = 0.0625; c < 1; c += 0.125) seg(ctx, c, 58.8, c, 60.6);
  strokeInk(ctx, 0.8, 0.3);

  if (isFeature(i)) {
    // Pilastra: base, fuste com caneluras e capitel.
    band(ctx, 0.33, 0.67, 6, 58, e.relevo);
    ctx.beginPath();
    for (const c of [0.42, 0.5, 0.58]) seg(ctx, c, 15, c, 50);
    strokeInk(ctx, 0.7, 0.16);
    ctx.beginPath();
    seg(ctx, 0.33, 12, 0.33, 52);
    strokeInk(ctx, 0.7, 0.3);
    ctx.beginPath();
    seg(ctx, 0.67, 12, 0.67, 52);
    strokeInk(ctx, DETAIL, 0.7);
    band(ctx, 0.28, 0.72, 6, 12, e.relevo);
    band(ctx, 0.28, 0.72, 52, 58, e.relevo);
    ctx.beginPath();
    rect(ctx, 0.28, 6, 0.72, 12);
    rect(ctx, 0.28, 52, 0.72, 58);
    strokeInk(ctx, 0.7, 0.6);
    hline(ctx, 0.28, 0.72, 54.5, 0.3, 0.6);
    return;
  }
  // Painel emoldurado: ocupa as duas células entre as pilastras.
  const esquerda = i % 3 === 2;
  const a = esquerda ? 0.14 : 0;
  const b = esquerda ? 1 : 0.86;
  band(ctx, a, b, 20, 52, e.extra);
  ctx.beginPath();
  seg(ctx, a, 20, b, 20);
  seg(ctx, a, 52, b, 52);
  if (esquerda) seg(ctx, a, 20, a, 52);
  else seg(ctx, b, 20, b, 52);
  strokeInk(ctx, 0.8, 0.5);
  // Filete interno da moldura.
  const ai = esquerda ? a + 0.07 : 0;
  const bi = esquerda ? 1 : b - 0.07;
  ctx.beginPath();
  seg(ctx, ai, 23, bi, 23);
  seg(ctx, ai, 49, bi, 49);
  if (esquerda) seg(ctx, ai, 23, ai, 49);
  else seg(ctx, bi, 23, bi, 49);
  strokeInk(ctx, 0.6, 0.26);
}

// Senado: painel moderno claro com ripas verticais e, a cada três células,
// um painel de madeira com um rasgo de luz.
function decorateSenado(ctx: CanvasRenderingContext2D, e: Estilo, i: number): void {
  if (isFeature(i)) {
    band(ctx, 0.08, 0.92, 8, 54, e.madeira);
    ctx.beginPath();
    for (let c = 0.2; c < 0.9; c += 0.12) seg(ctx, c, 8, c, 54);
    strokeInk(ctx, 0.6, 0.14);
    band(ctx, 0.455, 0.545, 13, 49, e.extra);
    ctx.beginPath();
    rect(ctx, 0.455, 13, 0.545, 49);
    strokeInk(ctx, 0.7, 0.55);
    ctx.beginPath();
    rect(ctx, 0.08, 8, 0.92, 54);
    strokeInk(ctx, DETAIL, 0.85);
    return;
  }
  // Ripas: frestas escuras com um fio de luz ao lado.
  ctx.beginPath();
  for (let c = 0.0625; c < 1; c += 0.125) seg(ctx, c, 8, c, 54);
  strokeInk(ctx, 0.9, 0.22);
  ctx.beginPath();
  for (let c = 0.0625; c < 1; c += 0.125) seg(ctx, c + 0.03, 8, c + 0.03, 54);
  strokeInk(ctx, 0.7, 0.5, e.relevo);
  hline(ctx, 0, 1, 8, 0.3, 0.7);
  hline(ctx, 0, 1, 54, 0.3, 0.7);
}

function decorate(ctx: CanvasRenderingContext2D, cena: SceneId, e: Estilo, i: number, norte: boolean): void {
  if (cena === "sindicato") decorateSindicato(ctx, e, i, norte);
  else if (cena === "constituinte") decorateConstituinte(ctx, e, i);
  else if (cena === "alerj") decorateAlerj(ctx, e, i);
  else decorateSenado(ctx, e, i);
}

// ---------------------------------------------------------------------------
// Parede de trás
// ---------------------------------------------------------------------------

function drawBackWall(ctx: CanvasRenderingContext2D, paleta: ScenePalette, sx: number, sy: number, norte: boolean, info: CellInfo): void {
  const cena = info.cena;
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
  const e = styleOf(cena, paleta, norte ? "esquerda" : "direita");

  if (norte) plane(sx - HW, sy, HW, HH);
  else plane(sx + HW, sy, -HW, HH);

  if (!canto) {
    ctx.beginPath();
    rect(ctx, u0, 0, u1, WALL_H);
    fillSolid(ctx, e.face);
    drawBands(ctx, cena, e, u0, u1);
    if (!fim) decorate(ctx, cena, e, i, norte);
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
      strokeInk(ctx, DETAIL, 0.85);
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
    strokeInk(ctx, DETAIL, 0.5);
  }

  if (!fim) return;
  // O pilar que arremata a parede: a face da ponta, com a outra luz.
  const px0 = X(u1);
  const py0 = Y(u1, 0);
  const ponta = styleOf(cena, paleta, norte ? "direita" : "esquerda");
  plane(px0, py0, tx / WALL_T, ty / WALL_T);
  ctx.beginPath();
  rect(ctx, 0, -PLINTH, WALL_T, WALL_H);
  fillSolid(ctx, ponta.face);
  drawBands(ctx, cena, ponta, 0, WALL_T);
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

function decorateParapet(ctx: CanvasRenderingContext2D, cena: SceneId, e: Estilo, u0: number, u1: number): void {
  ctx.beginPath();
  if (cena === "sindicato") {
    seg(ctx, u0, 6, u1, 6);
    for (const c of [0.25, 0.75]) if (c > u0 && c < u1) seg(ctx, c, 0, c, 6);
    for (const c of [0.5]) if (c > u0 && c < u1) seg(ctx, c, 6, c, PARAPET_H);
    strokeInk(ctx, 0.6, 0.2);
  } else if (cena === "constituinte") {
    for (let c = 0.125; c < 1; c += 0.25) if (c > u0 && c < u1) seg(ctx, c, 1, c, PARAPET_H - 1);
    strokeInk(ctx, 0.6, 0.3);
  } else if (cena === "alerj") {
    seg(ctx, u0, 3, u1, 3);
    seg(ctx, u0, PARAPET_H - 2.5, u1, PARAPET_H - 2.5);
    strokeInk(ctx, 0.6, 0.28);
  } else {
    for (let c = 0.0625; c < 1; c += 0.125) if (c > u0 && c < u1) seg(ctx, c, 1.5, c, PARAPET_H - 1.5);
    strokeInk(ctx, 0.8, 0.22);
  }
  void e;
}

/**
 * O parapeito de uma célula. `leste` corre no eixo y; o outro, no eixo x. A
 * face que se vê é a de fora.
 */
function drawParapet(ctx: CanvasRenderingContext2D, paleta: ScenePalette, sx: number, sy: number, leste: boolean, info: CellInfo): void {
  const cena = info.cena;
  const i = leste ? info.y : info.x;
  const n = leste ? info.altura : info.largura;
  // O canto da frente é do parapeito leste: um bloco que fecha os dois.
  const canto = leste && i === n - 1;
  const u0 = 0;
  const u1 = canto ? PARAPET_T : 1;
  const tx = (leste ? -HW : HW) * PARAPET_T;
  const ty = -HH * PARAPET_T;
  const e = styleOf(cena, paleta, leste ? "direita" : "esquerda");
  const corpo = cena === "constituinte" ? e.barra : e.face;

  if (leste) plane(sx + (-0.5 + PARAPET_T + 0.5) * HW, sy + (-0.5 + PARAPET_T - 0.5) * HH, -HW, HH);
  else plane(sx + (-0.5 - (-0.5 + PARAPET_T)) * HW, sy + (-0.5 + -0.5 + PARAPET_T) * HH, HW, HH);

  // Face de fora, com a laje embaixo.
  ctx.beginPath();
  rect(ctx, u0, 0, u1, PARAPET_H);
  fillSolid(ctx, corpo);
  band(ctx, u0, u1, -PLINTH, 0, e.rodape);
  decorateParapet(ctx, cena, e, u0, u1);
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
  const ponta = styleOf(cena, paleta, "esquerda");
  plane(px0, py0, tx / PARAPET_T, ty / PARAPET_T);
  ctx.beginPath();
  rect(ctx, 0, 0, PARAPET_T, PARAPET_H);
  fillSolid(ctx, cena === "constituinte" ? ponta.barra : ponta.face);
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
