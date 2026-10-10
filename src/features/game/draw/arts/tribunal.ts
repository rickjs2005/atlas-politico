// Sala de audiências de tribunal brasileiro: lambri alto de madeira escura com
// almofadas em relevo e cimalha, parede clara acima com janelas altas e
// estreitas de persiana de madeira, arandelas de latão entre elas e, atrás da
// bancada, um emblema redondo de latão sem símbolo nenhum. Tábua corrida
// envernizada no chão e porta dupla de madeira almofadada com puxadores de
// latão. Nos móveis, madeira de lei escura, couro verde-escuro e latão.
//
// Serve a mais de uma cena (tribunal-a, tribunal-b): o acento da paleta tinge
// a madeira do lambri, da porta e dos móveis, e é ele que esquenta ou esfria
// a sala; a parede e o chão vêm da paleta.

import { LEAF_H, LX, LY, leafRect, leafSeg, type LeafDesign } from "../exit-kit";
import { diamond } from "../floor-kit";
import { DETAIL, INK, PAPER, cellNoise, tone } from "../kit";
import { PE } from "../props-base";
import { PARAPET_H, fillAlpha, fillSolid, floorRect, floorSeg, shade, strokeInk } from "../scene-shared";
import { X, Y, band, estiloBase, hline, isFeature, rect, seg } from "../wall-kit";
import type { ArtSpec } from "./types";

const TAU = Math.PI * 2;
const LATAO = "#c4a45c";

// ---------------------------------------------------------------------------
// Piso: tábua corrida
// ---------------------------------------------------------------------------

const TABUAS = 3;

/**
 * Tábua corrida: três réguas por célula, no sentido do eixo x do mundo, cada
 * uma com o próprio tom, veio comprido, fio de luz na borda de trás e fresta
 * escura na da frente. As emendas de topo caem em lugares diferentes de uma
 * régua para a outra, para o piso não virar grade.
 */
function drawTabuas(ctx: CanvasRenderingContext2D, base: string, sx: number, sy: number, variante: 0 | 1, info: { x: number; y: number }): void {
  const { x, y } = info;
  const semente = variante * 7;
  diamond(ctx, sx, sy);
  fillSolid(ctx, base);
  for (let i = 0; i < TABUAS; i += 1) {
    const v0 = -0.5 + i / TABUAS;
    const v1 = v0 + 1 / TABUAS;
    ctx.beginPath();
    floorRect(ctx, sx, sy, -0.5, v0, 0.5, v1);
    fillSolid(ctx, tone(base, (cellNoise(x, y, 31 + i + semente) - 0.5) * 0.2));
    // Veio: uma linha comprida, levemente torta, que não chega às pontas.
    const vm = (v0 + v1) / 2 + (cellNoise(x, y, 41 + i) - 0.5) * 0.1;
    ctx.beginPath();
    ctx.moveTo(sx + (-0.42 - vm) * 32, sy + (-0.42 + vm) * 16);
    ctx.quadraticCurveTo(sx + (0.02 - vm - 0.04) * 32, sy + (0.02 + vm - 0.04) * 16, sx + (0.42 - vm) * 32, sy + (0.42 + vm) * 16);
    strokeInk(ctx, 0.6, 0.16);
    // Emenda de topo em uma régua ou outra, nunca no mesmo lugar da vizinha.
    if (cellNoise(x, y, 44 + i + semente) > 0.58) {
      const u = -0.38 + cellNoise(x, y, 47 + i) * 0.76;
      ctx.beginPath();
      floorSeg(ctx, sx, sy, u, v0, u, v1);
      strokeInk(ctx, 0.7, 0.42);
    }
  }
  // Fio de luz na borda de trás de cada régua: o verniz pega a luz na quina.
  ctx.beginPath();
  for (let i = 0; i < TABUAS; i += 1) {
    const v = -0.5 + i / TABUAS + 0.025;
    floorSeg(ctx, sx, sy, -0.5, v, 0.5, v);
  }
  strokeInk(ctx, 0.6, 0.22, PAPER);
  // Frestas entre as réguas.
  ctx.beginPath();
  for (let i = 1; i < TABUAS; i += 1) floorSeg(ctx, sx, sy, -0.5, -0.5 + i / TABUAS, 0.5, -0.5 + i / TABUAS);
  strokeInk(ctx, 0.7, 0.4);
  // Reflexo do verniz: uma mancha comprida e rala, em parte das células.
  if (cellNoise(x, y, 51) > 0.55) {
    const k = (cellNoise(x, y, 52) - 0.5) * 0.3;
    ctx.beginPath();
    floorRect(ctx, sx, sy, -0.3 + k, -0.3 + k, 0.1 + k, -0.18 + k);
    fillAlpha(ctx, PAPER, 0.09);
  }
  diamond(ctx, sx, sy);
  strokeInk(ctx, 0.7, 0.16);
}

// ---------------------------------------------------------------------------
// Parede: peças desenhadas no plano da parede
// ---------------------------------------------------------------------------

/**
 * Círculo em pé na face da parede, com o centro em (`cu`, `cv`) e o raio em
 * pixels. O caminho é traçado com a matriz da parede e preenchido sem ela:
 * sai a elipse certa da projeção, e o traço não deforma.
 */
function discoNaParede(ctx: CanvasRenderingContext2D, cu: number, cv: number, r: number, cor: string, contorno: number, alfa = 1, alfaDaCor = 1): void {
  const x0 = X(0);
  const y0 = Y(0, 0);
  ctx.save();
  ctx.transform(X(1) - x0, Y(1, 0) - y0, 0, -1, x0, y0);
  ctx.beginPath();
  ctx.ellipse(cu, cv, r / PE, r, 0, 0, TAU);
  ctx.restore();
  fillAlpha(ctx, cor, alfaDaCor);
  if (contorno > 0) strokeInk(ctx, contorno, alfa);
}

/** Almofada em relevo: o painel um pouco mais claro, fio de luz em cima e à esquerda, sombra embaixo e à direita. */
function almofada(ctx: CanvasRenderingContext2D, u0: number, v0: number, u1: number, v1: number, cor: string, luz: string): void {
  band(ctx, u0, u1, v0, v1, cor);
  ctx.beginPath();
  rect(ctx, u0, v0, u1, v1);
  strokeInk(ctx, 0.7, 0.5);
  ctx.beginPath();
  seg(ctx, u0, v1, u1, v1);
  seg(ctx, u0, v0, u0, v1);
  strokeInk(ctx, 0.7, 0.6, luz);
  ctx.beginPath();
  seg(ctx, u0 + 0.01, v0 + 0.6, u1, v0 + 0.6);
  seg(ctx, u1 - 0.01, v0, u1 - 0.01, v1);
  strokeInk(ctx, 0.7, 0.32);
}

/** Janela alta e estreita, com guarnição de madeira, peitoril e persiana de madeira baixada até o meio. */
function janela(ctx: CanvasRenderingContext2D, e: { caixilho: string; friso: string; vidro: string; vidroLuz: string; madeira: string }): void {
  // Peitoril sobre a cimalha do lambri.
  band(ctx, 0.24, 0.76, 36, 38.2, e.friso);
  ctx.beginPath();
  rect(ctx, 0.24, 36, 0.76, 38.2);
  strokeInk(ctx, 0.7, 0.6);
  // Guarnição e o vidro, com o reflexo em diagonal.
  band(ctx, 0.28, 0.72, 38.2, 58.5, e.caixilho);
  band(ctx, 0.32, 0.68, 39.6, 57, e.vidro);
  ctx.beginPath();
  ctx.moveTo(X(0.35), Y(0.35, 39.6));
  ctx.lineTo(X(0.46), Y(0.46, 39.6));
  ctx.lineTo(X(0.62), Y(0.62, 49));
  ctx.lineTo(X(0.51), Y(0.51, 49));
  ctx.closePath();
  fillSolid(ctx, e.vidroLuz);
  // Montante do meio e a travessa.
  ctx.beginPath();
  seg(ctx, 0.5, 39.6, 0.5, 57);
  seg(ctx, 0.32, 48.3, 0.68, 48.3);
  strokeInk(ctx, 0.9, 1, e.caixilho);
  // Persiana de madeira baixada até pouco abaixo do meio: as lâminas e a régua de baixo.
  band(ctx, 0.32, 0.68, 49.6, 57, tone(e.madeira, -0.04));
  ctx.beginPath();
  for (let v = 50.9; v < 57; v += 1.5) seg(ctx, 0.32, v, 0.68, v);
  strokeInk(ctx, 0.6, 0.5);
  band(ctx, 0.32, 0.68, 49, 50.1, e.caixilho);
  // Sombra do vão no alto e os contornos.
  ctx.beginPath();
  rect(ctx, 0.32, 55.4, 0.68, 57);
  fillAlpha(ctx, INK, 0.16);
  ctx.beginPath();
  rect(ctx, 0.32, 39.6, 0.68, 57);
  strokeInk(ctx, DETAIL);
  ctx.beginPath();
  rect(ctx, 0.28, 38.2, 0.72, 58.5);
  strokeInk(ctx, DETAIL);
}

/** Arandela de latão: braço curto, cúpula em meia-taça e a luz que sobe pela parede. */
function arandela(ctx: CanvasRenderingContext2D, latao: string): void {
  ctx.beginPath();
  ctx.moveTo(X(0.43), Y(0.43, 49));
  ctx.lineTo(X(0.57), Y(0.57, 49));
  ctx.lineTo(X(0.65), Y(0.65, 58.5));
  ctx.lineTo(X(0.35), Y(0.35, 58.5));
  ctx.closePath();
  fillAlpha(ctx, PAPER, 0.32);
  band(ctx, 0.488, 0.512, 42.5, 46.5, latao);
  ctx.beginPath();
  rect(ctx, 0.488, 42.5, 0.512, 46.5);
  strokeInk(ctx, 0.6, 0.7);
  ctx.beginPath();
  ctx.moveTo(X(0.41), Y(0.41, 49));
  ctx.lineTo(X(0.59), Y(0.59, 49));
  ctx.lineTo(X(0.555), Y(0.555, 45.8));
  ctx.lineTo(X(0.445), Y(0.445, 45.8));
  ctx.closePath();
  fillSolid(ctx, latao);
  strokeInk(ctx, DETAIL);
  hline(ctx, 0.41, 0.59, 49, 0.5, 0.6);
  band(ctx, 0.435, 0.565, 48.2, 49, tone(latao, 0.4));
}

/** Emblema redondo de latão, sem símbolo: dois anéis, um campo liso e um brilho na quina da luz. */
function emblema(ctx: CanvasRenderingContext2D, latao: string): void {
  const cu = 0.5;
  const cv = 48;
  // A sombra da chapa na parede, caída para baixo e para a direita.
  discoNaParede(ctx, cu + 0.015, cv - 1, 9.6, INK, 0, 1, 0.16);
  discoNaParede(ctx, cu, cv, 9.6, tone(latao, -0.12), DETAIL + 0.2);
  discoNaParede(ctx, cu, cv, 7.6, latao, 0.7, 0.7);
  discoNaParede(ctx, cu, cv, 5.4, tone(latao, -0.2), 0.7, 0.6);
  discoNaParede(ctx, cu, cv, 2.4, tone(latao, 0.1), 0.6, 0.5);
  // Brilho no alto, à esquerda, e a chapa fixada por quatro pinos.
  ctx.beginPath();
  ctx.ellipse(X(cu - 0.06), Y(cu - 0.06, cv + 5.2), 2.6, 1.3, -0.5, 0, TAU);
  fillAlpha(ctx, PAPER, 0.55);
  ctx.fillStyle = tone(latao, -0.4);
  for (const [du, dv] of [
    [-0.17, 6.6],
    [0.17, 6.6],
    [-0.17, -6.6],
    [0.17, -6.6],
  ] as const) {
    ctx.beginPath();
    ctx.arc(X(cu + du), Y(cu + du, cv + dv), 0.8, 0, TAU);
    ctx.fill();
  }
}

// ---------------------------------------------------------------------------
// Porta dupla
// ---------------------------------------------------------------------------

/** Duas folhas almofadadas, cada uma com duas almofadas altas, chapa de latão embaixo e um puxador de cada lado da junta. */
const leafDupla: LeafDesign = (ctx, e, luz) => {
  for (const [a0, a1] of [
    [0.09, 0.43],
    [0.57, 0.91],
  ] as const) {
    for (const [v0, v1] of [
      [11, 33],
      [39, 62],
    ] as const) {
      ctx.beginPath();
      leafRect(ctx, a0, v0, a1, v1);
      fillAlpha(ctx, INK, 0.1);
      strokeInk(ctx, 0.7, 0.55);
      ctx.beginPath();
      leafSeg(ctx, a0, v1, a1, v1);
      leafSeg(ctx, a0, v0, a0, v1);
      strokeInk(ctx, 0.7, 0.5, shade(e.folha, luz + 0.4));
    }
  }
  // Chapa de latão no pé das folhas.
  ctx.beginPath();
  leafRect(ctx, 0.04, 2, 0.96, 7);
  fillSolid(ctx, shade(e.ferragem, luz - 0.1));
  strokeInk(ctx, 0.7, 0.7);
  // A junta das duas folhas, até o alto.
  ctx.beginPath();
  leafSeg(ctx, 0.5, 1, 0.5, LEAF_H - 1);
  strokeInk(ctx, 1);
  // Puxadores verticais, um de cada lado da junta.
  for (const a of [0.44, 0.56]) {
    ctx.beginPath();
    leafSeg(ctx, a, 29, a, 41);
    strokeInk(ctx, 2.6);
    ctx.beginPath();
    leafSeg(ctx, a, 29.6, a, 40.4);
    strokeInk(ctx, 1.3, 1, e.ferragem);
    ctx.beginPath();
    ctx.arc(LX(a), LY(a, 29), 1.1, 0, TAU);
    ctx.arc(LX(a), LY(a, 41), 1.1, 0, TAU);
    ctx.fillStyle = e.ferragem;
    ctx.fill();
  }
};

// ---------------------------------------------------------------------------
// A arte
// ---------------------------------------------------------------------------

export const tribunal: ArtSpec = {
  id: "tribunal",
  nome: "Sala de audiências",
  parede: {
    estilo: (p, k) => ({
      ...estiloBase(p, k),
      barra: tone(p.acento, k),
      rodape: tone(p.acento, k - 0.4),
      remate: tone(p.parede, k + 0.22),
      friso: tone(p.acento, k + 0.2),
      relevo: tone(p.acento, k + 0.08),
      caixilho: tone(p.acento, k - 0.16),
      madeira: tone(p.acento, k + 0.3),
      extra: tone(LATAO, k),
    }),
    // Rodapé, lambri, cimalha do lambri, parede clara e sanca.
    faixas: [
      [0, 4, "rodape"],
      [4, 33, "barra"],
      [33, 36, "friso"],
      [59, 66, "remate"],
    ],
    linhas: [
      [4, 0.5],
      [33, 0.65],
      [36, 0.45],
      [59, 0.5],
      [62.5, 0.22],
    ],
    decorar(ctx, e, i, norte) {
      // Lambri: duas almofadas altas por célula, com o friso de baixo.
      hline(ctx, 0, 1, 6.8, 0.22, 0.6);
      almofada(ctx, 0.08, 9, 0.46, 29.8, e.relevo, e.friso);
      almofada(ctx, 0.54, 9, 0.92, 29.8, e.relevo, e.friso);
      // A sombra da cimalha sobre o lambri e o fio de luz da cimalha.
      ctx.beginPath();
      rect(ctx, 0, 31.6, 1, 33);
      fillAlpha(ctx, INK, 0.12);
      hline(ctx, 0, 1, 35.4, 0.5, 0.6);

      if (norte && i === 5) {
        emblema(ctx, e.extra);
        return;
      }
      if (isFeature(i)) {
        janela(ctx, e);
        return;
      }
      if (i % 3 === 0) arandela(ctx, e.extra);
    },
    parapeito(ctx, e, u0, u1) {
      // O lambri continua no parapeito: uma almofada baixa por meia célula.
      for (const [a, b] of [
        [0.08, 0.46],
        [0.54, 0.92],
      ] as const) {
        if (a < u0 || b > u1) continue;
        band(ctx, a, b, 2.5, PARAPET_H - 2.5, e.relevo);
        ctx.beginPath();
        rect(ctx, a, 2.5, b, PARAPET_H - 2.5);
        strokeInk(ctx, 0.7, 0.45);
        ctx.beginPath();
        seg(ctx, a, PARAPET_H - 2.5, b, PARAPET_H - 2.5);
        strokeInk(ctx, 0.7, 0.5, e.friso);
      }
      ctx.beginPath();
      seg(ctx, u0, PARAPET_H - 1, u1, PARAPET_H - 1);
      strokeInk(ctx, 0.6, 0.35);
    },
    corpoDoParapeito: "barra",
  },
  piso: (ctx, _paleta, base, sx, sy, variante, info) => drawTabuas(ctx, base, sx, sy, variante, info),
  porta: (p) => ({ moldura: tone(p.acento, -0.3), folha: tone(p.acento, -0.06), ferragem: LATAO, degrau: tone(p.parede, -0.14), desenho: leafDupla }),
  // Madeira de lei escura, que o acento da cena esquenta ou esfria; couro verde-escuro e latão.
  receita: {
    madeira: "#5a3a2c",
    tinta: 0.3,
    tampo: "#6f4838",
    madeiraEscura: "#3c2820",
    aco: "#9d9c93",
    maquina: "#747c78",
    ferro: "#3d3a36",
    cromo: "#cfcbc0",
    latao: LATAO,
    estofado: "#4b5a4f",
    pedra: "#e4ddcc",
    pano: "#b1b0a6",
    papel: "#f5f1e6",
    pardo: "#cdb183",
    folha: "#5b7a52",
    vaso: "#6b5244",
    feltro: "#4b5a4f",
    plastico: "#e2ddd0",
    lombadas: ["#5a3a2c", "#4b5a4f", "#c4a45c", "#efe9dc", "#3c2820"],
    brilho: 0.7,
    desgaste: 0,
    rustico: false,
    frio: false,
  },
};
