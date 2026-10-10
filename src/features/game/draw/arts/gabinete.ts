// Gabinete de trabalho, anos 2020, sóbrio: lambri de madeira clara até meia
// altura, com almofadas, parede lisa acima com um trilho de quadros de onde
// pendem, por cordão, quadros pequenos e um mapa emoldurado sem nomes;
// arandelas de leque entre eles; carpete de lã no chão; porta de madeira
// clara, almofadada, com maçaneta de alavanca. Nos móveis, nogueira média,
// couro castanho e metal escovado. Nenhum brasão, nenhuma foto, nenhum
// símbolo de cargo ou partido.

import { DETAIL, INK, PAPER, cellNoise, tone } from "../kit";
import { LEAF_H, LX, LY, leafRect, leafSeg, type LeafDesign } from "../exit-kit";
import { diamond } from "../floor-kit";
import { PARAPET_H, fillAlpha, fillSolid, floorRect, floorSeg, px, py, shade, strokeInk } from "../scene-shared";
import type { CellInfo } from "../types";
import { X, Y, band, estiloBase, hline, isFeature, rect, seg, type Estilo } from "../wall-kit";
import type { ArtSpec } from "./types";

// ---------------------------------------------------------------------------
// Parede
// ---------------------------------------------------------------------------

/** Altura do lambri e do trilho de quadros, em pixels da parede. */
const LAMBRI = 31;
const TRILHO = 57;

/** Trapézio na face: a base entre `a0` e `a1` na altura `v0`, o topo entre `b0` e `b1` na altura `v1`. */
function trapezio(ctx: CanvasRenderingContext2D, a0: number, a1: number, v0: number, b0: number, b1: number, v1: number): void {
  ctx.moveTo(X(a0), Y(a0, v0));
  ctx.lineTo(X(a1), Y(a1, v0));
  ctx.lineTo(X(b1), Y(b1, v1));
  ctx.lineTo(X(b0), Y(b0, v1));
  ctx.closePath();
}

/**
 * Almofada de madeira: o campo rebaixado, com a aresta de cima e da esquerda
 * clara e a de baixo e da direita escura, como a luz do alto à esquerda pede.
 */
function almofada(ctx: CanvasRenderingContext2D, e: Estilo, u0: number, v0: number, u1: number, v1: number, cor: string, bisel = 0.025): void {
  const bv = bisel * 64;
  band(ctx, u0, u1, v0, v1, cor);
  // Bisel: faixas finas em volta do campo.
  ctx.beginPath();
  trapezio(ctx, u0, u1, v1, u0 + bisel, u1 - bisel, v1 - bv);
  trapezio(ctx, u0, u0, v0, u0 + bisel, u0 + bisel, v1 - bv);
  ctx.moveTo(X(u0), Y(u0, v0));
  ctx.lineTo(X(u0), Y(u0, v1));
  ctx.lineTo(X(u0 + bisel), Y(u0 + bisel, v1 - bv));
  ctx.lineTo(X(u0 + bisel), Y(u0 + bisel, v0 + bv));
  ctx.closePath();
  fillSolid(ctx, tone(cor, 0.22));
  ctx.beginPath();
  trapezio(ctx, u0, u1, v0, u0 + bisel, u1 - bisel, v0 + bv);
  ctx.moveTo(X(u1), Y(u1, v0));
  ctx.lineTo(X(u1), Y(u1, v1));
  ctx.lineTo(X(u1 - bisel), Y(u1 - bisel, v1 - bv));
  ctx.lineTo(X(u1 - bisel), Y(u1 - bisel, v0 + bv));
  ctx.closePath();
  fillSolid(ctx, tone(cor, -0.16));
  ctx.beginPath();
  rect(ctx, u0, v0, u1, v1);
  strokeInk(ctx, 0.7, 0.5);
  ctx.beginPath();
  rect(ctx, u0 + bisel, v0 + bv, u1 - bisel, v1 - bv);
  strokeInk(ctx, 0.6, 0.25);
}

/** O cordão que pendura um quadro no trilho: dois fios que se encontram no gancho. */
function cordao(ctx: CanvasRenderingContext2D, u0: number, u1: number, v: number): void {
  const meio = (u0 + u1) / 2;
  ctx.beginPath();
  seg(ctx, u0, v, meio, TRILHO - 0.5);
  seg(ctx, u1, v, meio, TRILHO - 0.5);
  strokeInk(ctx, 0.6, 0.42);
  ctx.beginPath();
  ctx.arc(X(meio), Y(meio, TRILHO - 0.5), 0.9, 0, Math.PI * 2);
  fillSolid(ctx, INK);
}

/** Moldura de madeira com passe-partout claro e o miolo na cor dada. */
function quadro(ctx: CanvasRenderingContext2D, e: Estilo, u0: number, v0: number, u1: number, v1: number, miolo: string): void {
  band(ctx, u0, u1, v0, v1, e.madeira);
  band(ctx, u0 + 0.03, u1 - 0.03, v0 + 1.9, v1 - 1.9, e.extra);
  band(ctx, u0 + 0.075, u1 - 0.075, v0 + 4.8, v1 - 4.8, miolo);
  ctx.beginPath();
  rect(ctx, u0, v0, u1, v1);
  strokeInk(ctx, DETAIL);
  ctx.beginPath();
  rect(ctx, u0 + 0.03, v0 + 1.9, u1 - 0.03, v1 - 1.9);
  rect(ctx, u0 + 0.075, v0 + 4.8, u1 - 0.075, v1 - 4.8);
  strokeInk(ctx, 0.6, 0.45);
  // A sombra que o quadro faz na parede, do lado oposto à luz.
  ctx.beginPath();
  rect(ctx, u1, v0 - 1.2, u1 + 0.018, v1 - 1.2);
  rect(ctx, u0 + 0.018, v0 - 1.2, u1 + 0.018, v0);
  fillAlpha(ctx, INK, 0.14);
}

/** Mapa emoldurado sem nomes: uma linha de costa, uma ilha, o mar tracejado e marcas de lugar que não se leem. */
function mapa(ctx: CanvasRenderingContext2D, e: Estilo): void {
  const u0 = 0.09;
  const u1 = 0.91;
  const v0 = 35;
  const v1 = 55.5;
  cordao(ctx, 0.32, 0.68, v1);
  band(ctx, u0, u1, v0, v1, e.madeira);
  band(ctx, u0 + 0.035, u1 - 0.035, v0 + 2.2, v1 - 2.2, e.extra);
  ctx.beginPath();
  rect(ctx, u0, v0, u1, v1);
  strokeInk(ctx, DETAIL);
  ctx.beginPath();
  rect(ctx, u0 + 0.035, v0 + 2.2, u1 - 0.035, v1 - 2.2);
  strokeInk(ctx, 0.6, 0.45);
  // A terra: um tom mais quente do papel, do lado da costa.
  ctx.beginPath();
  ctx.moveTo(X(0.125), Y(0.125, 53.3));
  ctx.lineTo(X(0.3), Y(0.3, 53.3));
  ctx.lineTo(X(0.36), Y(0.36, 48.5));
  ctx.lineTo(X(0.5), Y(0.5, 46.5));
  ctx.lineTo(X(0.47), Y(0.47, 42));
  ctx.lineTo(X(0.6), Y(0.6, 39.5));
  ctx.lineTo(X(0.55), Y(0.55, 37.2));
  ctx.lineTo(X(0.125), Y(0.125, 37.2));
  ctx.closePath();
  fillSolid(ctx, tone(e.extra, -0.07));
  strokeInk(ctx, 0.7, 0.55);
  // Uma ilha e o mar, em traços curtos.
  ctx.beginPath();
  ctx.moveTo(X(0.7), Y(0.7, 49));
  ctx.lineTo(X(0.78), Y(0.78, 50.5));
  ctx.lineTo(X(0.8), Y(0.8, 47.5));
  ctx.lineTo(X(0.73), Y(0.73, 46.5));
  ctx.closePath();
  fillSolid(ctx, tone(e.extra, -0.07));
  strokeInk(ctx, 0.6, 0.5);
  ctx.beginPath();
  for (const [u, v] of [
    [0.62, 52],
    [0.74, 53],
    [0.66, 44],
    [0.8, 42],
    [0.72, 39.5],
    [0.84, 51],
  ] as const)
    seg(ctx, u, v, u + 0.05, v);
  strokeInk(ctx, 0.6, 0.3);
  // Rios e marcas de lugar.
  ctx.beginPath();
  seg(ctx, 0.2, 50, 0.3, 46);
  seg(ctx, 0.3, 46, 0.42, 44.5);
  seg(ctx, 0.25, 40, 0.36, 43);
  strokeInk(ctx, 0.6, 0.35);
  ctx.beginPath();
  for (const [u, v] of [
    [0.22, 44],
    [0.4, 41],
    [0.33, 50.5],
  ] as const)
    ctx.rect(X(u) - 0.9, Y(u, v) - 0.9, 1.8, 1.8);
  fillSolid(ctx, tone(INK, 0.2));
}

/** Arandela: um braço de metal no meio da parede, a cúpula em leque e a luz que ela joga para cima. */
function arandela(ctx: CanvasRenderingContext2D, e: Estilo): void {
  // A luz na parede: um leque largo e suave e um mais fechado e claro, do alto da cúpula até o trilho.
  ctx.beginPath();
  trapezio(ctx, 0.38, 0.62, 50, 0.22, 0.78, TRILHO);
  fillAlpha(ctx, PAPER, 0.32);
  ctx.beginPath();
  trapezio(ctx, 0.42, 0.58, 50, 0.3, 0.7, TRILHO);
  fillAlpha(ctx, PAPER, 0.4);
  // E a sombra pequena que a cúpula faz por baixo.
  ctx.beginPath();
  trapezio(ctx, 0.46, 0.54, 44, 0.43, 0.57, 45.5);
  fillAlpha(ctx, INK, 0.12);
  // O braço e a cúpula.
  band(ctx, 0.485, 0.515, 40, 46, e.caixilho);
  band(ctx, 0.46, 0.54, 40, 42, e.caixilho);
  ctx.beginPath();
  rect(ctx, 0.46, 40, 0.54, 42);
  strokeInk(ctx, DETAIL);
  ctx.beginPath();
  trapezio(ctx, 0.44, 0.56, 45.5, 0.37, 0.63, 50);
  fillSolid(ctx, e.extra);
  strokeInk(ctx, DETAIL);
  ctx.beginPath();
  trapezio(ctx, 0.44, 0.5, 45.5, 0.37, 0.44, 50);
  fillAlpha(ctx, PAPER, 0.5);
  ctx.beginPath();
  seg(ctx, 0.5, 45.5, 0.5, 50);
  strokeInk(ctx, 0.6, 0.3);
}

/** Um quadro pequeno pendurado no trilho: paisagem em dois tons (par) ou desenho em sépia (ímpar), sem nada que se leia. */
function quadroPendurado(ctx: CanvasRenderingContext2D, e: Estilo, i: number): void {
  const paisagem = i % 2 === 0;
  const u0 = paisagem ? 0.28 : 0.33;
  const u1 = paisagem ? 0.72 : 0.67;
  const v0 = paisagem ? 40 : 39;
  const v1 = paisagem ? 52 : 52.5;
  cordao(ctx, u0 + 0.06, u1 - 0.06, v1);
  quadro(ctx, e, u0, v0, u1, v1, paisagem ? "#b9bcae" : "#d9c9a8");
  const a = u0 + 0.075;
  const b = u1 - 0.075;
  if (paisagem) {
    // Céu claro em cima, um horizonte e um morro.
    band(ctx, a, b, v1 - 4.8 - 3, v1 - 4.8, tone("#b9bcae", 0.3));
    ctx.beginPath();
    ctx.moveTo(X(a), Y(a, v0 + 6.5));
    ctx.lineTo(X(a + 0.08), Y(a + 0.08, v0 + 8.2));
    ctx.lineTo(X(a + 0.18), Y(a + 0.18, v0 + 6));
    ctx.lineTo(X(b), Y(b, v0 + 7));
    ctx.lineTo(X(b), Y(b, v0 + 4.8));
    ctx.lineTo(X(a), Y(a, v0 + 4.8));
    ctx.closePath();
    fillSolid(ctx, tone("#b9bcae", -0.2));
    return;
  }
  // Desenho em sépia: um retângulo e três riscos, nada que forme letra.
  ctx.beginPath();
  rect(ctx, a + 0.04, v0 + 6.5, b - 0.04, v1 - 7);
  strokeInk(ctx, 0.6, 0.4);
  ctx.beginPath();
  seg(ctx, a + 0.07, v0 + 8.5, b - 0.08, v0 + 10);
  seg(ctx, a + 0.07, v1 - 9.5, a + 0.14, v0 + 8.5);
  strokeInk(ctx, 0.6, 0.3);
}

// ---------------------------------------------------------------------------
// Piso: carpete de lã
// ---------------------------------------------------------------------------

/** Carpete de lã: pelo curto em laçadas, sem borda, com o tom variando de leve e a marca do aspirador em algumas células. */
function drawWool(ctx: CanvasRenderingContext2D, base: string, sx: number, sy: number, info: CellInfo): void {
  const { x, y } = info;
  diamond(ctx, sx, sy);
  fillSolid(ctx, tone(base, (cellNoise(x, y, 51) - 0.5) * 0.07));

  // As laçadas: traços curtos em fileiras desencontradas, claros e escuros.
  const claros: number[] = [];
  const escuros: number[] = [];
  for (let f = 0; f < 8; f += 1) {
    const v = -0.4375 + f * 0.125;
    const desvio = f % 2 === 0 ? 0 : 0.0625;
    for (let c = 0; c < 8; c += 1) {
      const u = -0.46 + desvio + c * 0.125;
      if (Math.abs(u) + Math.abs(v) > 0.43) continue;
      (cellNoise(x + c * 3, y + f * 5, 53) > 0.5 ? claros : escuros).push(u, v);
    }
  }
  ctx.beginPath();
  for (let i = 0; i < claros.length; i += 2) floorSeg(ctx, sx, sy, claros[i]! - 0.028, claros[i + 1]!, claros[i]! + 0.028, claros[i + 1]!);
  strokeInk(ctx, 1.1, 0.16, PAPER);
  ctx.beginPath();
  for (let i = 0; i < escuros.length; i += 2) floorSeg(ctx, sx, sy, escuros[i]! - 0.028, escuros[i + 1]!, escuros[i]! + 0.028, escuros[i + 1]!);
  strokeInk(ctx, 1.1, 0.1);

  // A marca do aspirador: uma faixa um pouco mais clara, só em algumas células.
  const r = cellNoise(x, y, 52);
  if (r > 0.62) {
    const k = (r - 0.62) * 0.8 - 0.15;
    ctx.beginPath();
    floorRect(ctx, sx, sy, -0.5, k - 0.14, 0.5, k + 0.14);
    fillAlpha(ctx, PAPER, 0.07);
  }

  // Junto das paredes de trás, o carpete fica na sombra delas.
  if (x === 1 || y === 1) {
    ctx.beginPath();
    if (x === 1) floorRect(ctx, sx, sy, -0.5, -0.5, -0.3, 0.5);
    if (y === 1) floorRect(ctx, sx, sy, -0.5, -0.5, 0.5, -0.3);
    fillAlpha(ctx, INK, 0.06);
    ctx.beginPath();
    if (x === 1) floorRect(ctx, sx, sy, -0.5, -0.5, -0.42, 0.5);
    if (y === 1) floorRect(ctx, sx, sy, -0.5, -0.5, 0.5, -0.42);
    fillAlpha(ctx, INK, 0.06);
  }
  // E, no canto de trás da célula, um fio claro que lembra o pelo deitado.
  const cx = px(sx, 0.12, -0.3);
  const cy = py(sy, 0.12, -0.3);
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy - 1);
  ctx.lineTo(cx + 7, cy + 2.5);
  strokeInk(ctx, 0.7, 0.05, PAPER);
}

// ---------------------------------------------------------------------------
// Porta
// ---------------------------------------------------------------------------

/** Folha clara com duas almofadas biseladas, maçaneta de alavanca em metal escovado e chapa de proteção embaixo. */
const leafGabinete: LeafDesign = (ctx, e, luz) => {
  const claro = shade(e.folha, luz + 0.3);
  const escuro = shade(e.folha, luz - 0.22);
  for (const [v0, v1] of [
    [9, 29],
    [35, 64],
  ] as const) {
    // O campo rebaixado, um pouco mais escuro, com o bisel claro em cima e à esquerda e escuro embaixo e à direita.
    ctx.beginPath();
    leafRect(ctx, 0.17, v0, 0.83, v1);
    fillAlpha(ctx, INK, 0.07);
    ctx.beginPath();
    leafSeg(ctx, 0.17, v1, 0.83, v1);
    leafSeg(ctx, 0.17, v0, 0.17, v1);
    strokeInk(ctx, 1.1, 0.8, claro);
    ctx.beginPath();
    leafSeg(ctx, 0.17, v0, 0.83, v0);
    leafSeg(ctx, 0.83, v0, 0.83, v1);
    strokeInk(ctx, 1.1, 0.8, escuro);
    ctx.beginPath();
    leafRect(ctx, 0.17, v0, 0.83, v1);
    strokeInk(ctx, 0.6, 0.5);
    ctx.beginPath();
    leafRect(ctx, 0.22, v0 + 2.6, 0.78, v1 - 2.6);
    strokeInk(ctx, 0.6, 0.28);
  }
  // Veio da madeira nos montantes.
  ctx.beginPath();
  for (const a of [0.08, 0.92]) leafSeg(ctx, a, 3, a, LEAF_H - 3);
  strokeInk(ctx, 0.6, 0.14);
  // Chapa de proteção junto do chão.
  ctx.beginPath();
  leafRect(ctx, 0.08, 1.5, 0.92, 6);
  fillSolid(ctx, shade(e.ferragem, luz));
  strokeInk(ctx, 0.7, 0.7);
  // Maçaneta de alavanca: a roseta e a haste, voltada para dentro da folha.
  ctx.beginPath();
  ctx.arc(LX(0.88), LY(0.88, 32), 1.9, 0, Math.PI * 2);
  fillSolid(ctx, shade(e.ferragem, luz));
  strokeInk(ctx, 0.7);
  ctx.beginPath();
  leafSeg(ctx, 0.88, 32, 0.7, 32);
  strokeInk(ctx, 2.6);
  ctx.beginPath();
  leafSeg(ctx, 0.87, 32, 0.71, 32);
  strokeInk(ctx, 1.3, 1, shade(e.ferragem, luz + 0.1));
};

// ---------------------------------------------------------------------------
// A arte
// ---------------------------------------------------------------------------

export const gabinete: ArtSpec = {
  id: "gabinete",
  nome: "Gabinete",
  parede: {
    estilo: (p, k) => ({
      ...estiloBase(p, k),
      barra: tone(p.acento, k + 0.05),
      rodape: tone(p.acento, k - 0.38),
      remate: tone(p.parede, k + 0.22),
      friso: tone(p.acento, k + 0.22),
      relevo: tone(p.parede, k + 0.3),
      caixilho: tone("#6f6a62", k),
      madeira: tone(p.acento, k - 0.2),
      extra: tone("#f1e9d6", k),
    }),
    faixas: [
      [0, 4, "rodape"],
      [4, LAMBRI, "barra"],
      [LAMBRI, LAMBRI + 2.5, "friso"],
      [TRILHO, TRILHO + 1.6, "madeira"],
      [61, 66, "remate"],
    ],
    linhas: [
      [4, 0.5],
      [LAMBRI, 0.55],
      [LAMBRI + 2.5, 0.35],
      [TRILHO, 0.45],
      [TRILHO + 1.6, 0.3],
      [61, 0.45],
    ],
    decorar(ctx, e, i, norte) {
      // Lambri: uma almofada por célula, entre montantes com o veio em pé.
      almofada(ctx, e, 0.09, 7.5, 0.91, LAMBRI - 3.5, tone(e.barra, -0.05));
      ctx.beginPath();
      seg(ctx, 0.035, 5, 0.035, LAMBRI - 1);
      seg(ctx, 0.965, 5, 0.965, LAMBRI - 1);
      strokeInk(ctx, 0.6, 0.12);

      if (norte && i === 6) {
        mapa(ctx, e);
        return;
      }
      if (isFeature(i)) {
        arandela(ctx, e);
        return;
      }
      // Entre as arandelas, um quadro pendurado; a célula logo antes do mapa fica livre, para ele respirar.
      if (norte && i === 5) return;
      quadroPendurado(ctx, e, i);
    },
    parapeito(ctx, e, u0, u1) {
      // O lambri continua no parapeito: a almofada baixa, que a face do parapeito corta onde a célula acaba.
      const a = Math.max(u0, 0.09);
      const b = Math.min(u1, 0.91);
      if (b - a > 0.08) almofada(ctx, e, a, 2.5, b, PARAPET_H - 2.5, tone(e.barra, -0.05), 0.02);
      hline(ctx, u0, u1, PARAPET_H - 1.2, 0.3, 0.6);
    },
    corpoDoParapeito: "barra",
  },
  piso: (ctx, _paleta, base, sx, sy, _variante, info) => drawWool(ctx, base, sx, sy, info),
  porta: (p) => ({ moldura: tone(p.acento, -0.3), folha: tone(p.acento, 0.14), ferragem: "#c9c6bc", degrau: tone(p.parede, -0.08), desenho: leafGabinete }),
  // Nogueira média, couro castanho e metal escovado.
  receita: {
    madeira: "#75513b",
    tinta: 0.12,
    tampo: "#8a6448",
    madeiraEscura: "#4e3628",
    aco: "#a3a6a2",
    maquina: "#7d858a",
    ferro: "#44423f",
    cromo: "#d6d6d0",
    latao: "#b7a068",
    estofado: "#5b4538",
    pedra: "#e6dfd0",
    pano: "#b7b5ab",
    papel: "#f6f2e8",
    pardo: "#cdb183",
    folha: "#5c7f55",
    vaso: "#b9a98f",
    feltro: "#6b5a4a",
    plastico: "#e4e0d6",
    lombadas: ["#5b4538", "#8a6448", "#b7a068", "#efe9dc", "#44423f"],
    brilho: 0.6,
    desgaste: 0,
    rustico: false,
    frio: false,
  },
};
