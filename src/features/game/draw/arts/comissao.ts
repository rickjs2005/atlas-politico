// Sala de comissão parlamentar, anos 2020: painéis acústicos claros em grade,
// um trilho contínuo de madeira na altura dos olhos, telas embutidas sem
// imagem e luminárias lineares no alto; piso de placas de carpete; porta
// lisa cinza com rasgo de luz. Nos móveis, carvalho claro, estofado
// cinza-azulado e metal escovado.

import { leafRasgo } from "../door-leaves";
import { diamond } from "../floor-kit";
import { DETAIL, cellNoise, tone } from "../kit";
import { PARAPET_H, fillAlpha, fillSolid, floorRect, floorSeg, strokeInk } from "../scene-shared";
import { band, estiloBase, hline, isFeature, rect, seg } from "../wall-kit";
import type { ArtSpec } from "./types";

/** Placas de carpete: quatro por célula, com o sentido da trama alternado. */
function drawCarpetTiles(ctx: CanvasRenderingContext2D, base: string, sx: number, sy: number, info: { x: number; y: number }): void {
  const { x, y } = info;
  diamond(ctx, sx, sy);
  fillSolid(ctx, base);
  for (let i = 0; i < 2; i += 1) {
    for (let j = 0; j < 2; j += 1) {
      const u0 = -0.5 + i * 0.5;
      const v0 = -0.5 + j * 0.5;
      const girada = (i + j + x + y) % 2 === 0;
      ctx.beginPath();
      floorRect(ctx, sx, sy, u0, v0, u0 + 0.5, v0 + 0.5);
      fillSolid(ctx, tone(base, girada ? 0.03 : -0.03));
      ctx.beginPath();
      for (let k = 1; k < 4; k += 1) {
        const a = k * 0.125;
        if (girada) floorSeg(ctx, sx, sy, u0, v0 + a, u0 + 0.5, v0 + a);
        else floorSeg(ctx, sx, sy, u0 + a, v0, u0 + a, v0 + 0.5);
      }
      strokeInk(ctx, 0.6, 0.07);
    }
  }
  ctx.beginPath();
  floorSeg(ctx, sx, sy, -0.5, 0, 0.5, 0);
  floorSeg(ctx, sx, sy, 0, -0.5, 0, 0.5);
  strokeInk(ctx, 0.6, 0.16);
  if (cellNoise(x, y, 61) > 0.85) {
    ctx.beginPath();
    ctx.ellipse(sx, sy, 6, 2.5, 0, 0, Math.PI * 2);
    fillAlpha(ctx, "#1b1c1a", 0.05);
  }
  diamond(ctx, sx, sy);
  strokeInk(ctx, 0.7, 0.18);
}

export const comissao: ArtSpec = {
  id: "comissao",
  nome: "Sala de comissão",
  parede: {
    estilo: (p, k) => ({
      ...estiloBase(p, k),
      barra: tone(p.parede, k - 0.05),
      rodape: tone("#5e6265", k),
      remate: tone(p.parede, k + 0.2),
      friso: tone(p.parede, k + 0.3),
      relevo: tone(p.parede, k + 0.26),
      caixilho: tone("#6d7275", k),
      madeira: tone(p.acento, k),
      extra: tone("#f7f1dc", k * 0.3),
    }),
    faixas: [
      [0, 4, "rodape"],
      [30, 34, "madeira"],
      [58, 60.5, "extra"],
      [60.5, 66, "remate"],
    ],
    linhas: [
      [4, 0.5],
      [30, 0.5],
      [34, 0.55],
      [58, 0.35],
      [60.5, 0.4],
    ],
    decorar(ctx, e, i, norte) {
      // Painéis acústicos: grade de quatro por três, com a fresta escura.
      ctx.beginPath();
      for (let c = 0.25; c < 1; c += 0.25) {
        seg(ctx, c, 4, c, 30);
        seg(ctx, c, 34, c, 58);
      }
      for (const v of [12.7, 21.3, 42, 50]) seg(ctx, 0, v, 1, v);
      strokeInk(ctx, 0.8, 0.14);
      // O trilho de madeira ganha o fio de luz em cima.
      hline(ctx, 0, 1, 34, 0.5, 0.7);
      if (norte && i === 6) {
        // Tela embutida, sem imagem: moldura escura e vidro cinza com um reflexo.
        band(ctx, 0.1, 0.9, 37, 56, e.caixilho);
        band(ctx, 0.14, 0.86, 38.5, 54.5, tone("#8e9497", -0.1));
        band(ctx, 0.2, 0.34, 38.5, 54.5, tone("#8e9497", 0.08));
        ctx.beginPath();
        rect(ctx, 0.1, 37, 0.9, 56);
        rect(ctx, 0.14, 38.5, 0.86, 54.5);
        strokeInk(ctx, DETAIL);
        return;
      }
      if (isFeature(i)) {
        // Painel de madeira ripada entre os acústicos.
        band(ctx, 0.08, 0.92, 36, 57, e.madeira);
        ctx.beginPath();
        for (let c = 0.14; c < 0.9; c += 0.08) seg(ctx, c, 36, c, 57);
        strokeInk(ctx, 0.6, 0.18);
        ctx.beginPath();
        rect(ctx, 0.08, 36, 0.92, 57);
        strokeInk(ctx, DETAIL, 0.8);
      }
    },
    parapeito(ctx, _e, u0, u1) {
      ctx.beginPath();
      for (let c = 0.25; c < 1; c += 0.25) if (c > u0 && c < u1) seg(ctx, c, 1, c, PARAPET_H - 1);
      strokeInk(ctx, 0.7, 0.16);
    },
    corpoDoParapeito: "face",
  },
  piso: (ctx, _paleta, base, sx, sy, _variante, info) => drawCarpetTiles(ctx, base, sx, sy, info),
  porta: (p) => ({ moldura: "#6d7275", folha: tone(p.parede, -0.16), ferragem: "#dcdedb", degrau: tone(p.parede, -0.1), desenho: leafRasgo }),
  // Carvalho claro, estofado cinza-azulado e metal escovado.
  receita: {
    madeira: "#8c6b4a",
    tinta: 0.1,
    tampo: "#a07d58",
    madeiraEscura: "#5e4733",
    aco: "#9aa1a6",
    maquina: "#7a858c",
    ferro: "#44484b",
    cromo: "#d3d7d7",
    latao: "#aa9c6e",
    estofado: "#5b6a7a",
    pedra: "#e4e5df",
    pano: "#b4b7b4",
    papel: "#f5f3ec",
    pardo: "#c8b78f",
    folha: "#58796a",
    vaso: "#7d8389",
    feltro: "#5b6a7a",
    plastico: "#e3e4de",
    lombadas: ["#5b6a7a", "#c8b78f", "#9aa1a6", "#efede6", "#44484b"],
    brilho: 0.5,
    desgaste: 0,
    rustico: false,
    frio: true,
  },
};
