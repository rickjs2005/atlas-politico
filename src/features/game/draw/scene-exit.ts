// Saída: um portal com porta no vão do parapeito e, no chão, a soleira com o
// degrau de fora. Enquanto a tarefa está pendente, a porta fica fechada, com
// a tranca atravessada. Ao abrir, a tranca some, a folha gira para fora, a
// placa da verga acende e o degrau ganha as setas que apontam para fora.
//
// O desenho é feito no plano da parede: `u` corre ao longo dela, em células;
// `w` sai da sala, em células; `v` sobe, em pixels. A saída do lado sul é o
// espelho da saída do lado leste.

import type { ExitSide, SceneId, ScenePalette } from "@/lib/game/types";

import { ACCENT, ACCENT_SOFT, DETAIL, INK, LIGHT, OUTLINE, PAPER, tone } from "./kit";
import { HH, HW, PARAPET_T, PLINTH, fillAlpha, fillSolid, shade, strokeInk } from "./scene-shared";
import type { CellInfo, DrawContext } from "./types";

/** Altura do portal: passa da cabeça do personagem. */
const FRAME_H = 76;
const LINTEL = 7;
const LEAF_H = FRAME_H - LINTEL;
/** Largura de cada montante, em células ao longo da parede. */
const POST = 0.1;
/**
 * A dobradiça fica no montante do começo da parede, o mais longe da câmera:
 * aberta, a folha fica ao lado do vão, sem tapar quem chega por dentro.
 */
const HINGE = POST;
const LEAF = 1 - POST * 2;
/** Quanto a folha gira para fora, aberta: pouco mais que um ângulo reto. */
const SWING = 1.75;
/** Quanto o degrau de fora avança da parede, em células. */
const STEP = 0.46;

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

function plane(sx: number, sy: number, lado: ExitSide): void {
  sgn = lado === "leste" || lado === "oeste" ? -1 : 1;
  ox = sx - sgn * PARAPET_T * HW;
  oy = sy + (PARAPET_T - 1) * HH;
  // A face de fora da parede leste olha para +x; a da parede sul, para +y.
  luzW = sgn === -1 ? LIGHT.direita : LIGHT.esquerda;
  luzU = sgn === -1 ? LIGHT.esquerda : LIGHT.direita;
}

const X = (u: number, w: number): number => ox + sgn * (u - w) * HW;
const Y = (u: number, w: number, v: number): number => oy + (u + w) * HH - v;

/** Face voltada para fora da sala, no plano `w`. */
function faceW(ctx: CanvasRenderingContext2D, u0: number, u1: number, w: number, v0: number, v1: number): void {
  ctx.beginPath();
  ctx.moveTo(X(u0, w), Y(u0, w, v0));
  ctx.lineTo(X(u1, w), Y(u1, w, v0));
  ctx.lineTo(X(u1, w), Y(u1, w, v1));
  ctx.lineTo(X(u0, w), Y(u0, w, v1));
  ctx.closePath();
}

/** Face voltada para o fim da parede, no plano `u`. */
function faceU(ctx: CanvasRenderingContext2D, u: number, w0: number, w1: number, v0: number, v1: number): void {
  ctx.beginPath();
  ctx.moveTo(X(u, w0), Y(u, w0, v0));
  ctx.lineTo(X(u, w1), Y(u, w1, v0));
  ctx.lineTo(X(u, w1), Y(u, w1, v1));
  ctx.lineTo(X(u, w0), Y(u, w0, v1));
  ctx.closePath();
}

/** Face de cima, na altura `v`. */
function faceTop(ctx: CanvasRenderingContext2D, u0: number, u1: number, w0: number, w1: number, v: number): void {
  ctx.beginPath();
  ctx.moveTo(X(u0, w0), Y(u0, w0, v));
  ctx.lineTo(X(u1, w0), Y(u1, w0, v));
  ctx.lineTo(X(u1, w1), Y(u1, w1, v));
  ctx.lineTo(X(u0, w1), Y(u0, w1, v));
  ctx.closePath();
}

/** Caixa com as três faces que a câmera vê. */
function box(ctx: CanvasRenderingContext2D, u0: number, u1: number, w0: number, w1: number, v0: number, v1: number, cor: string, contorno: number = OUTLINE): void {
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
function smooth(a: number, b: number, t: number): number {
  const k = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return k * k * (3 - 2 * k);
}

// ---------------------------------------------------------------------------
// A porta de cada cena
// ---------------------------------------------------------------------------

interface DoorStyle {
  moldura: string;
  folha: string;
  /** Puxador, barra, filetes. */
  ferragem: string;
  degrau: string;
  desenho: "aco" | "almofadas" | "vidro" | "rasgo";
}

const VIDRO = "#c3cdc8";

function buildStyle(cena: SceneId, p: ScenePalette): DoorStyle {
  // Sindicato: porta de aço pintado, com visor aramado e barra.
  if (cena === "sindicato") return { moldura: tone(p.parede, -0.2), folha: "#7f8d88", ferragem: "#d5d2c6", degrau: tone(p.parede, 0.16), desenho: "aco" };
  // Constituinte: madeira almofadada, puxador de latão.
  if (cena === "constituinte") return { moldura: tone(p.acento, -0.34), folha: tone(p.acento, -0.1), ferragem: "#d3ad55", degrau: tone(p.parede, -0.12), desenho: "almofadas" };
  // Assembleia: madeira escura com vidro no alto, em portal de pedra.
  if (cena === "alerj") return { moldura: tone(p.parede, -0.12), folha: "#6b4a34", ferragem: p.acento, degrau: tone(p.parede, -0.08), desenho: "vidro" };
  // Senado: folha lisa de madeira clara, com um rasgo de luz.
  return { moldura: "#6a6f6d", folha: p.acento, ferragem: "#e1e3dc", degrau: tone(p.parede, -0.1), desenho: "rasgo" };
}

const estilos = new WeakMap<ScenePalette, DoorStyle>();

function styleOf(cena: SceneId, paleta: ScenePalette): DoorStyle {
  let pronto = estilos.get(paleta);
  if (pronto === undefined) {
    pronto = buildStyle(cena, paleta);
    estilos.set(paleta, pronto);
  }
  return pronto;
}

// ---------------------------------------------------------------------------
// A folha: desenhada no próprio plano, que gira na dobradiça
// ---------------------------------------------------------------------------

// Quanto `u` e `w` mudam da dobradiça até a ponta livre da folha.
let lu = 0;
let lw = 0;

function swing(angulo: number): void {
  lu = Math.cos(angulo) * LEAF;
  lw = Math.sin(angulo) * LEAF;
}

/** Ponto da folha: `a` de 0 (dobradiça) a 1 (ponta livre), `v` em pixels para cima. */
const LX = (a: number): number => X(HINGE + a * lu, a * lw);
const LY = (a: number, v: number): number => Y(HINGE + a * lu, a * lw, v);

function leafRect(ctx: CanvasRenderingContext2D, a0: number, v0: number, a1: number, v1: number): void {
  ctx.moveTo(LX(a0), LY(a0, v0));
  ctx.lineTo(LX(a1), LY(a1, v0));
  ctx.lineTo(LX(a1), LY(a1, v1));
  ctx.lineTo(LX(a0), LY(a0, v1));
  ctx.closePath();
}

function leafSeg(ctx: CanvasRenderingContext2D, a0: number, v0: number, a1: number, v1: number): void {
  ctx.moveTo(LX(a0), LY(a0, v0));
  ctx.lineTo(LX(a1), LY(a1, v1));
}

function drawLeaf(ctx: CanvasRenderingContext2D, e: DoorStyle, angulo: number): void {
  swing(angulo);
  // Até meio caminho vê-se a face de fora, com a luz da parede; depois, a de
  // dentro, com a luz da face do lado.
  const luz = luzW + (luzU - luzW) * smooth(0.6, 1, angulo);
  const cor = shade(e.folha, luz);

  ctx.beginPath();
  leafRect(ctx, 0, 0, 1, LEAF_H);
  fillSolid(ctx, cor);

  if (e.desenho === "aco") {
    // Chapa de rodapé, travessa, visor aramado e barra.
    ctx.beginPath();
    leafRect(ctx, 0, 0, 1, 9);
    fillSolid(ctx, shade(e.folha, luz - 0.16));
    ctx.beginPath();
    leafSeg(ctx, 0, 9, 1, 9);
    leafSeg(ctx, 0, 40, 1, 40);
    strokeInk(ctx, 0.7, 0.45);
    ctx.beginPath();
    leafRect(ctx, 0.28, 47, 0.72, 63);
    ctx.fillStyle = shade(VIDRO, luz * 0.6);
    ctx.fill();
    strokeInk(ctx, DETAIL);
    ctx.beginPath();
    leafSeg(ctx, 0.5, 47, 0.5, 63);
    leafSeg(ctx, 0.28, 55, 0.72, 55);
    strokeInk(ctx, 0.6, 0.45);
    ctx.beginPath();
    leafRect(ctx, 0.12, 27, 0.9, 30.5);
    fillSolid(ctx, shade(e.ferragem, luz));
    strokeInk(ctx, 0.7, 0.85);
  } else if (e.desenho === "almofadas") {
    // Duas almofadas e o puxador.
    ctx.beginPath();
    leafRect(ctx, 0.16, 6, 0.84, 27);
    leafRect(ctx, 0.16, 33, 0.84, 64);
    fillAlpha(ctx, INK, 0.1);
    strokeInk(ctx, 0.7, 0.6);
    ctx.beginPath();
    leafSeg(ctx, 0.16, 6, 0.84, 6);
    leafSeg(ctx, 0.16, 33, 0.84, 33);
    strokeInk(ctx, 0.7, 0.5, shade(e.folha, luz + 0.4));
    ctx.beginPath();
    ctx.arc(LX(0.9), LY(0.9, 31), 1.7, 0, Math.PI * 2);
    ctx.fillStyle = e.ferragem;
    ctx.fill();
    strokeInk(ctx, 0.7);
  } else if (e.desenho === "vidro") {
    // Almofada embaixo, vidro em cruz no alto e puxador vertical.
    ctx.beginPath();
    leafRect(ctx, 0.16, 6, 0.84, 28);
    fillAlpha(ctx, INK, 0.12);
    strokeInk(ctx, 0.7, 0.6);
    ctx.beginPath();
    leafRect(ctx, 0.18, 34, 0.82, 64);
    ctx.fillStyle = shade(VIDRO, luz * 0.6);
    ctx.fill();
    strokeInk(ctx, DETAIL);
    ctx.beginPath();
    leafSeg(ctx, 0.5, 34, 0.5, 64);
    leafSeg(ctx, 0.18, 49, 0.82, 49);
    strokeInk(ctx, 0.8, 0.9, shade(e.folha, luz - 0.1));
    ctx.beginPath();
    leafSeg(ctx, 0.91, 26, 0.91, 38);
    strokeInk(ctx, 2.4);
    ctx.beginPath();
    leafSeg(ctx, 0.91, 26.6, 0.91, 37.4);
    strokeInk(ctx, 1.2, 1, e.ferragem);
  } else {
    // Veio vertical, rasgo de luz e puxador comprido.
    ctx.beginPath();
    for (const a of [0.14, 0.3, 0.7, 0.78]) leafSeg(ctx, a, 2, a, LEAF_H - 2);
    strokeInk(ctx, 0.6, 0.14);
    ctx.beginPath();
    leafRect(ctx, 0.42, 9, 0.56, 61);
    fillSolid(ctx, shade("#f7edd2", luz * 0.3));
    strokeInk(ctx, 0.7, 0.6);
    ctx.beginPath();
    leafSeg(ctx, 0.88, 22, 0.88, 46);
    strokeInk(ctx, 2.6);
    ctx.beginPath();
    leafSeg(ctx, 0.88, 22.7, 0.88, 45.3);
    strokeInk(ctx, 1.3, 1, e.ferragem);
  }

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
  const e = styleOf(info.cena, paleta);
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
  const e = styleOf(info.cena, paleta);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  plane(sx, sy, lado);

  // Os dois montantes, o de trás primeiro, e a verga por cima.
  box(ctx, 0, POST, -PARAPET_T, 0, 0, LEAF_H, e.moldura);
  box(ctx, 1 - POST, 1, -PARAPET_T, 0, 0, LEAF_H, e.moldura);
  box(ctx, 0, 1, -PARAPET_T, 0, LEAF_H, FRAME_H, e.moldura);
  drawSign(ctx, abertura);

  // A folha gira depois que a tranca sai.
  drawLeaf(ctx, e, SWING * smooth(0.2, 1, abertura));
  drawBar(ctx, 1 - smooth(0, 0.3, abertura));
}
