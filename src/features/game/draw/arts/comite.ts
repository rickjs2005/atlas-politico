// Comitê de campanha, anos 2000: sala alugada de parede pintada, com um
// rodameio de cortiça entre frisos de alumínio, cheio de papéis presos; por
// cima dele, janelas de escritório com persiana, cartazes sem texto, um quadro
// branco, um relógio e um ventilador de parede. Ladrilho vinílico no chão, em
// placas de quatro por célula; porta de vidro com moldura de alumínio. Nos
// móveis, pinho claro, laminado branco e aço escovado: mobília de aluguel,
// limpa e sem luxo.
//
// Nenhuma cor identifica partido: os cartazes são papel com uma faixa neutra
// e um retângulo cinza no lugar da foto, e os papéis da cortiça são riscos
// que não se leem.

import { diamond } from "../floor-kit";
import { DETAIL, INK, PAPER, cellNoise, tone } from "../kit";
import { LEAF_H, LX, LY, leafRect, leafSeg, type LeafDesign } from "../exit-kit";
import { PARAPET_H, fillAlpha, fillSolid, floorRect, floorSeg, px, py, shade, strokeInk } from "../scene-shared";
import { VIDRO, VIDRO_LUZ, X, Y, band, drawGlass, estiloBase, hline, isFeature, rect, seg, type Estilo } from "../wall-kit";
import type { ArtSpec } from "./types";

/** O cinza da foto dos cartazes: nem claro, nem escuro, sem rosto. */
const FOTO = "#9c9d98";

// ---------------------------------------------------------------------------
// Piso: ladrilho vinílico
// ---------------------------------------------------------------------------

/** Quatro placas por célula, cada uma com o seu tom, salpico do vinil, junta fina e o brilho da cera. */
function drawVinyl(ctx: CanvasRenderingContext2D, base: string, sx: number, sy: number, info: { x: number; y: number }): void {
  const { x, y } = info;
  for (let i = 0; i < 4; i += 1) {
    const a = (i & 1) === 0 ? -0.5 : 0;
    const b = (i & 2) === 0 ? -0.5 : 0;
    ctx.beginPath();
    floorRect(ctx, sx, sy, a, b, a + 0.5, b + 0.5);
    fillSolid(ctx, tone(base, (cellNoise(x, y, 30 + i) - 0.5) * 0.08));
  }
  // Salpico: pontinhos escuros e claros, em lugar fixo da célula.
  ctx.fillStyle = tone(base, -0.26);
  for (let i = 0; i < 6; i += 1) {
    const u = (cellNoise(x, y, 10 + i) - 0.5) * 0.82;
    const v = (cellNoise(x, y, 20 + i) - 0.5) * 0.82;
    ctx.fillRect(px(sx, u, v) - 0.4, py(sy, u, v) - 0.3, 0.9, 0.6);
  }
  ctx.fillStyle = tone(base, 0.45);
  for (let i = 0; i < 4; i += 1) {
    const u = (cellNoise(x, y, 40 + i) - 0.5) * 0.82;
    const v = (cellNoise(x, y, 50 + i) - 0.5) * 0.82;
    ctx.fillRect(px(sx, u, v) - 0.4, py(sy, u, v) - 0.3, 0.9, 0.6);
  }
  // Brilho da cera: uma mancha clara deslocada, que muda de placa para placa.
  ctx.beginPath();
  ctx.ellipse(sx - 8 + cellNoise(x, y, 7) * 16, sy - 3 + cellNoise(x, y, 8) * 6, 8, 3, 0, 0, Math.PI * 2);
  fillAlpha(ctx, PAPER, 0.16);
  // Risco de uso: um ou outro arranhão curto.
  if (cellNoise(x, y, 5) > 0.76) {
    const k = cellNoise(x, y, 6) - 0.5;
    ctx.beginPath();
    floorSeg(ctx, sx, sy, -0.22 + k * 0.3, -0.12, 0.2 + k * 0.2, 0.1);
    strokeInk(ctx, 0.6, 0.14);
  }
  // Juntas entre as placas e o contorno da célula.
  ctx.beginPath();
  floorSeg(ctx, sx, sy, 0, -0.5, 0, 0.5);
  floorSeg(ctx, sx, sy, -0.5, 0, 0.5, 0);
  strokeInk(ctx, 0.6, 0.24);
  diamond(ctx, sx, sy);
  strokeInk(ctx, 0.7, 0.3);
}

// ---------------------------------------------------------------------------
// Parede: a cortiça e o que fica por cima dela
// ---------------------------------------------------------------------------

/** Onde a cortiça começa e acaba, em pixels da parede. */
const CORTICA = [22.5, 40] as const;

/** Um papel preso: [u0, u1, v0, v1, tom, tipo], com tipo 0 folha com linhas, 1 bilhete, 2 foto impressa. */
type Papel = readonly [number, number, number, number, number, 0 | 1 | 2];

// Quatro arrumações de papéis, uma por célula: a parede nunca repete a vizinha.
const PAPEIS: readonly (readonly Papel[])[] = [
  [
    [0.08, 0.22, 25, 38, 0, 0],
    [0.28, 0.46, 27, 38.5, -0.04, 0],
    [0.53, 0.63, 30, 37, 0.02, 1],
    [0.7, 0.9, 24.5, 37.5, 0, 2],
  ],
  [
    [0.06, 0.24, 24, 38, 0, 2],
    [0.3, 0.41, 31, 38, 0.01, 1],
    [0.47, 0.65, 26, 38.5, -0.05, 0],
    [0.74, 0.92, 28, 37, 0, 0],
  ],
  [
    [0.1, 0.26, 27, 38, 0, 0],
    [0.36, 0.56, 24, 37, -0.03, 0],
    [0.64, 0.76, 29.5, 38.5, 0.02, 1],
    [0.82, 0.94, 25, 33, 0, 1],
  ],
  [
    [0.08, 0.2, 30, 38.5, 0, 1],
    [0.26, 0.44, 25, 38, 0, 0],
    [0.5, 0.7, 26.5, 38.5, -0.04, 2],
    [0.78, 0.92, 24.5, 36, 0.01, 0],
  ],
];

/** Retângulo na face, girado de `giro` radianos em torno do centro: um papel preso torto. */
function papelTorto(ctx: CanvasRenderingContext2D, u0: number, v0: number, u1: number, v1: number, giro: number): void {
  const cu = ((u0 + u1) / 2) * 64;
  const cv = (v0 + v1) / 2;
  const a = ((u1 - u0) / 2) * 64;
  const b = (v1 - v0) / 2;
  const c = Math.cos(giro);
  const s = Math.sin(giro);
  const cantos: [number, number][] = [
    [cu - a * c + b * s, cv - a * s - b * c],
    [cu + a * c + b * s, cv + a * s - b * c],
    [cu + a * c - b * s, cv + a * s + b * c],
    [cu - a * c - b * s, cv - a * s + b * c],
  ];
  cantos.forEach(([pu, pv], i) => (i === 0 ? ctx.moveTo(X(pu / 64), Y(pu / 64, pv)) : ctx.lineTo(X(pu / 64), Y(pu / 64, pv))));
  ctx.closePath();
}

/** O grão da cortiça e os papéis presos nela, com os percevejos. */
function cortica(ctx: CanvasRenderingContext2D, e: Estilo, i: number, norte: boolean): void {
  const semente = norte ? i : i + 40;
  // Grão: pontinhos escuros e claros espalhados pela faixa.
  ctx.fillStyle = tone(e.barra, -0.3);
  for (let k = 0; k < 9; k += 1) {
    const u = 0.03 + cellNoise(semente, k, 61) * 0.94;
    const v = CORTICA[0] + 1 + cellNoise(semente, k, 62) * (CORTICA[1] - CORTICA[0] - 2);
    ctx.fillRect(X(u) - 0.5, Y(u, v) - 0.4, 1, 0.8);
  }
  ctx.fillStyle = tone(e.barra, 0.35);
  for (let k = 0; k < 6; k += 1) {
    const u = 0.03 + cellNoise(semente, k, 63) * 0.94;
    const v = CORTICA[0] + 1 + cellNoise(semente, k, 64) * (CORTICA[1] - CORTICA[0] - 2);
    ctx.fillRect(X(u) - 0.5, Y(u, v) - 0.4, 1, 0.8);
  }
  // Papéis presos, cada um um pouco torto, com o percevejo no alto.
  const papeis = PAPEIS[(i * 3 + (norte ? 0 : 2)) % PAPEIS.length]!;
  papeis.forEach(([u0, u1, v0, v1, tom, tipo], k) => {
    const giro = (cellNoise(semente, k, 65) - 0.5) * 0.14;
    ctx.beginPath();
    papelTorto(ctx, u0, v0, u1, v1, giro);
    fillSolid(ctx, tone(PAPER, tom));
    strokeInk(ctx, 0.6, 0.55);
    if (tipo === 2) {
      // Foto impressa: um retângulo cinza no meio da folha.
      ctx.beginPath();
      papelTorto(ctx, u0 + 0.025, v0 + 2.6, u1 - 0.025, v1 - 2.6, giro);
      fillSolid(ctx, tone(FOTO, 0.12));
    } else {
      // Linhas de texto que não se leem; o bilhete tem só duas.
      ctx.beginPath();
      const passo = tipo === 1 ? 2.4 : 2.6;
      for (let v = v1 - 3; v > v0 + 1.4; v -= passo) seg(ctx, u0 + 0.02, v, u1 - (v < v0 + 4 ? 0.05 : 0.025), v);
      strokeInk(ctx, 0.5, 0.32);
    }
    ctx.beginPath();
    ctx.arc(X((u0 + u1) / 2), Y((u0 + u1) / 2, v1 - 1.1), 0.75, 0, Math.PI * 2);
    ctx.fillStyle = tone(INK, 0.2);
    ctx.fill();
  });
}

/** Janela de escritório, baixa e larga, com a persiana meio descida e a cordinha. */
function janela(ctx: CanvasRenderingContext2D, e: Estilo): void {
  // Peitoril de alumínio e a guarnição.
  band(ctx, 0.04, 0.96, 42.5, 44, e.friso);
  hline(ctx, 0.04, 0.96, 42.5, 0.5);
  band(ctx, 0.06, 0.94, 44, 60.5, e.caixilho);
  drawGlass(ctx, e, 0.09, 45, 0.91, 59, 2, 1, 1.2);
  // Lâminas da persiana, do alto até pouco abaixo do meio.
  ctx.beginPath();
  for (let v = 51.2; v < 59; v += 1.7) rect(ctx, 0.09, v, 0.91, v + 1);
  fillAlpha(ctx, e.relevo, 0.92);
  ctx.beginPath();
  for (let v = 51.2; v < 59; v += 1.7) seg(ctx, 0.09, v, 0.91, v);
  strokeInk(ctx, 0.5, 0.3);
  // A régua de baixo da persiana e a cordinha.
  band(ctx, 0.09, 0.91, 50.2, 51.4, e.caixilho);
  ctx.beginPath();
  seg(ctx, 0.86, 50.2, 0.86, 46);
  strokeInk(ctx, 0.6, 0.5, e.caixilho);
  ctx.beginPath();
  rect(ctx, 0.06, 44, 0.94, 60.5);
  strokeInk(ctx, DETAIL);
}

/**
 * Cartaz de campanha colado com fita, em pé e mais estreito que a janela, para
 * não se confundir com ela: a foto cinza no alto, a faixa neutra embaixo, onde
 * iria o nome, e uma linha que não se lê.
 */
function cartazNaParede(ctx: CanvasRenderingContext2D, e: Estilo, u0: number): void {
  const u1 = u0 + 0.5;
  band(ctx, u0, u1, 43, 60.5, PAPER);
  band(ctx, u0 + 0.04, u1 - 0.04, 50.5, 58.5, tone(FOTO, 0.08));
  band(ctx, u0 + 0.04, u1 - 0.04, 45.5, 49.2, e.extra);
  ctx.beginPath();
  seg(ctx, u0 + 0.06, 44.2, u1 - 0.14, 44.2);
  strokeInk(ctx, 0.6, 0.38);
  ctx.beginPath();
  rect(ctx, u0, 43, u1, 60.5);
  strokeInk(ctx, DETAIL, 0.8);
  // Fita adesiva nos cantos de cima.
  ctx.beginPath();
  rect(ctx, u0 - 0.03, 59, u0 + 0.06, 61);
  rect(ctx, u1 - 0.06, 59, u1 + 0.03, 61);
  fillAlpha(ctx, PAPER, 0.7);
  strokeInk(ctx, 0.5, 0.3);
}

/** Quadro branco com moldura de alumínio, riscos que não se leem e a calha com o pincel. */
function quadroBranco(ctx: CanvasRenderingContext2D, e: Estilo): void {
  band(ctx, 0.1, 0.9, 44.5, 60.5, e.caixilho);
  band(ctx, 0.125, 0.875, 45.5, 59.5, tone(PAPER, 0.4));
  ctx.beginPath();
  rect(ctx, 0.1, 44.5, 0.9, 60.5);
  strokeInk(ctx, DETAIL);
  // Riscos de reunião: três linhas, um círculo e uma seta.
  ctx.beginPath();
  seg(ctx, 0.18, 56.5, 0.5, 56.5);
  seg(ctx, 0.18, 54, 0.42, 54);
  seg(ctx, 0.18, 51.5, 0.56, 51.5);
  seg(ctx, 0.2, 48.5, 0.36, 48.5);
  seg(ctx, 0.6, 50, 0.82, 50);
  seg(ctx, 0.76, 51.8, 0.82, 50);
  seg(ctx, 0.76, 48.2, 0.82, 50);
  strokeInk(ctx, 0.7, 0.45);
  ctx.beginPath();
  ctx.ellipse(X(0.7), Y(0.7, 55.5), 4.2, 2.6, 0, 0, Math.PI * 2);
  strokeInk(ctx, 0.7, 0.4);
  // A calha e o pincel.
  band(ctx, 0.12, 0.88, 43, 44.5, e.friso);
  hline(ctx, 0.12, 0.88, 43, 0.5);
  band(ctx, 0.3, 0.44, 44.3, 45.4, tone(INK, 0.25));
}

/** Relógio de parede, redondo, sem número: o aro de alumínio, o mostrador e os ponteiros. */
function relogio(ctx: CanvasRenderingContext2D, e: Estilo): void {
  const cx = X(0.5);
  const cy = Y(0.5, 52.5);
  ctx.beginPath();
  ctx.arc(cx, cy, 7, 0, Math.PI * 2);
  fillSolid(ctx, e.caixilho);
  strokeInk(ctx, DETAIL);
  ctx.beginPath();
  ctx.arc(cx, cy, 5.8, 0, Math.PI * 2);
  fillSolid(ctx, tone(PAPER, 0.3));
  // Marcas das horas: doze tracinhos.
  ctx.beginPath();
  for (let k = 0; k < 12; k += 1) {
    const a = (k * Math.PI) / 6;
    ctx.moveTo(cx + Math.cos(a) * 4.6, cy + Math.sin(a) * 4.6);
    ctx.lineTo(cx + Math.cos(a) * 5.4, cy + Math.sin(a) * 5.4);
  }
  strokeInk(ctx, 0.5, 0.5);
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + 2.2, cy - 2.6);
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx - 1.4, cy + 3.8);
  strokeInk(ctx, 0.8);
}

/** Ventilador de parede: a grade redonda sobre um braço curto, virada para a sala. */
function ventilador(ctx: CanvasRenderingContext2D, e: Estilo): void {
  const cx = X(0.5);
  const cy = Y(0.5, 53);
  // O braço e a base presa na parede.
  band(ctx, 0.45, 0.55, 44.5, 46.5, e.caixilho);
  ctx.beginPath();
  ctx.moveTo(X(0.5), Y(0.5, 46.5));
  ctx.lineTo(cx, cy + 4);
  strokeInk(ctx, 1.6, 1, e.caixilho);
  ctx.beginPath();
  ctx.arc(cx, cy, 7.5, 0, Math.PI * 2);
  fillSolid(ctx, tone(e.face, 0.1));
  strokeInk(ctx, DETAIL);
  // A grade: aros e raios, e o cubo do motor.
  ctx.beginPath();
  ctx.moveTo(cx + 5, cy);
  ctx.arc(cx, cy, 5, 0, Math.PI * 2);
  ctx.moveTo(cx + 2.6, cy);
  ctx.arc(cx, cy, 2.6, 0, Math.PI * 2);
  for (let k = 0; k < 8; k += 1) {
    const a = (k * Math.PI) / 4;
    ctx.moveTo(cx + Math.cos(a) * 2.6, cy + Math.sin(a) * 2.6);
    ctx.lineTo(cx + Math.cos(a) * 7.3, cy + Math.sin(a) * 7.3);
  }
  strokeInk(ctx, 0.55, 0.5);
  ctx.beginPath();
  ctx.arc(cx, cy, 1.6, 0, Math.PI * 2);
  fillSolid(ctx, e.caixilho);
}

// ---------------------------------------------------------------------------
// Porta: vidro com moldura de alumínio
// ---------------------------------------------------------------------------

/** Chapa de chute embaixo, um pano de vidro com travessa no meio, barra de empurrar e puxador. */
const leafAluminio: LeafDesign = (ctx, e, luz) => {
  ctx.beginPath();
  leafRect(ctx, 0.08, 3, 0.92, 15);
  fillSolid(ctx, shade(e.folha, luz - 0.12));
  strokeInk(ctx, 0.7, 0.6);
  // O vidro, com o reflexo em diagonal.
  ctx.beginPath();
  leafRect(ctx, 0.08, 18, 0.92, LEAF_H - 4);
  ctx.fillStyle = shade(VIDRO, luz * 0.6);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(LX(0.18), LY(0.18, 18));
  ctx.lineTo(LX(0.38), LY(0.38, 18));
  ctx.lineTo(LX(0.72), LY(0.72, LEAF_H - 4));
  ctx.lineTo(LX(0.52), LY(0.52, LEAF_H - 4));
  ctx.closePath();
  ctx.fillStyle = shade(VIDRO_LUZ, luz * 0.4);
  ctx.fill();
  ctx.beginPath();
  leafRect(ctx, 0.08, 18, 0.92, LEAF_H - 4);
  strokeInk(ctx, DETAIL);
  // Travessa de alumínio no meio do vidro.
  ctx.beginPath();
  leafRect(ctx, 0.08, 34, 0.92, 37);
  fillSolid(ctx, shade(e.folha, luz));
  strokeInk(ctx, 0.7, 0.7);
  // Barra de empurrar e o puxador em pé.
  ctx.beginPath();
  leafSeg(ctx, 0.16, 29.5, 0.84, 29.5);
  strokeInk(ctx, 2.6);
  ctx.beginPath();
  leafSeg(ctx, 0.16, 29.5, 0.84, 29.5);
  strokeInk(ctx, 1.3, 1, e.ferragem);
  ctx.beginPath();
  leafSeg(ctx, 0.86, 24, 0.86, 44);
  strokeInk(ctx, 2.4);
  ctx.beginPath();
  leafSeg(ctx, 0.86, 24.6, 0.86, 43.4);
  strokeInk(ctx, 1.2, 1, e.ferragem);
};

// ---------------------------------------------------------------------------
// A arte
// ---------------------------------------------------------------------------

export const comite: ArtSpec = {
  id: "comite",
  nome: "Comitê de campanha",
  parede: {
    estilo: (p, k) => ({
      ...estiloBase(p, k),
      barra: tone("#c6a46e", k),
      rodape: tone("#6f6b64", k),
      remate: tone(p.parede, k + 0.22),
      friso: tone("#b8bcbe", k),
      relevo: tone(p.parede, k + 0.34),
      caixilho: tone("#8e9397", k),
      madeira: tone(p.acento, k),
      extra: tone("#d4c3a0", k),
    }),
    faixas: [
      [0, 5, "rodape"],
      [21, 22.5, "friso"],
      [22.5, 40, "barra"],
      [40, 41.5, "friso"],
      [61, 66, "remate"],
    ],
    linhas: [
      [5, 0.5],
      [21, 0.4],
      [41.5, 0.45],
      [61, 0.4],
    ],
    decorar(ctx, e, i, norte) {
      cortica(ctx, e, i, norte);
      if (isFeature(i)) {
        janela(ctx, e);
        return;
      }
      if (i % 3 === 0) {
        cartazNaParede(ctx, e, norte ? 0.25 : 0.2);
        return;
      }
      // Entre o cartaz e a janela, uma vez cada: o quadro branco, o relógio e o ventilador.
      if (norte && i === 5) quadroBranco(ctx, e);
      else if (norte && i === 8) relogio(ctx, e);
      else if (!norte && i === 2) ventilador(ctx, e);
    },
    parapeito(ctx, e, u0, u1) {
      // O rodapé de vinil continua pelo parapeito.
      band(ctx, u0, u1, 0, 4, e.rodape);
      hline(ctx, u0, u1, 4, 0.5);
      ctx.beginPath();
      seg(ctx, u0, PARAPET_H - 2.5, u1, PARAPET_H - 2.5);
      strokeInk(ctx, 0.6, 0.22);
    },
    corpoDoParapeito: "face",
  },
  piso: (ctx, _paleta, base, sx, sy, _variante, info) => drawVinyl(ctx, base, sx, sy, info),
  porta: (p) => ({ moldura: "#9ca1a5", folha: "#aab0b3", ferragem: "#e3e5e4", degrau: tone(p.parede, -0.1), desenho: leafAluminio }),
  // Pinho claro, laminado branco e aço escovado.
  receita: {
    madeira: "#b89668",
    tinta: 0.08,
    tampo: "#ebe6da",
    madeiraEscura: "#8a6e4c",
    aco: "#9aa0a3",
    maquina: "#7f8a90",
    ferro: "#4d5255",
    cromo: "#d4d7d6",
    latao: "#b0a27a",
    estofado: "#5f6b78",
    pedra: "#dcd6c8",
    pano: "#b5b6b0",
    papel: "#f6f2e8",
    pardo: "#cdb58a",
    folha: "#5f8259",
    vaso: "#c9c2b4",
    feltro: "#c6a46e",
    plastico: "#ecebe4",
    lombadas: ["#cdb58a", "#5f6b78", "#9aa0a3", "#f1ece0", "#8a6e4c"],
    brilho: 0.2,
    desgaste: 0.1,
    rustico: false,
    frio: false,
  },
};
