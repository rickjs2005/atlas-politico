// Salão de sindicato, anos 1970: bloco de concreto pintado com barra, janela
// alta de fábrica, quadro de avisos, concreto gasto no chão, porta de aço
// pintado com visor aramado; madeira crua e aço pintado nos móveis.

import { PAPER, tone } from "../kit";
import { drawConcrete } from "../floors";
import { leafAco } from "../door-leaves";
import { PARAPET_H } from "../scene-shared";
import { strokeInk } from "../scene-shared";
import { VIDRO, VIDRO_LUZ, band, drawGlass, hline, isFeature, rect, seg } from "../wall-kit";
import type { ArtSpec } from "./types";

export const sindicato: ArtSpec = {
  id: "sindicato",
  nome: "Salão de sindicato",
  parede: {
    estilo: (p, k) => ({
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
    }),
    faixas: [
      [0, 5, "rodape"],
      [5, 25, "barra"],
      [60, 66, "remate"],
    ],
    linhas: [
      [5, 0.45],
      [25, 0.6],
      [60, 0.55],
    ],
    decorar(ctx, e, i, norte) {
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
        strokeInk(ctx, 0.9);
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
    },
    parapeito(ctx, _e, u0, u1) {
      ctx.beginPath();
      seg(ctx, u0, 6, u1, 6);
      for (const c of [0.25, 0.75]) if (c > u0 && c < u1) seg(ctx, c, 0, c, 6);
      for (const c of [0.5]) if (c > u0 && c < u1) seg(ctx, c, 6, c, PARAPET_H);
      strokeInk(ctx, 0.6, 0.2);
    },
    corpoDoParapeito: "face",
  },
  piso: (ctx, _paleta, base, sx, sy, _variante, info) => drawConcrete(ctx, base, sx, sy, info),
  porta: (p) => ({ moldura: tone(p.parede, -0.2), folha: "#7f8d88", ferragem: "#d5d2c6", degrau: tone(p.parede, 0.16), desenho: leafAco }),
  // Madeira crua e aço pintado, gasto.
  receita: {
    madeira: "#a9814f",
    tinta: 0.1,
    tampo: "#bb9764",
    madeiraEscura: "#7a5a3c",
    aco: "#8b9790",
    maquina: "#5f7873",
    ferro: "#454a48",
    cromo: "#c6c9c2",
    latao: "#a58a55",
    estofado: "#6d5443",
    pedra: "#c9c3b5",
    pano: "#a9aaa3",
    papel: "#f2ede1",
    pardo: "#c9ad7c",
    folha: "#5f7f57",
    vaso: "#9a7861",
    feltro: "#b3956a",
    plastico: "#dedbcf",
    lombadas: ["#c9ad7c", "#8e8f86", "#5e6e66", "#e3dccb", "#7a5a3c"],
    brilho: 0,
    desgaste: 1,
    rustico: true,
    frio: false,
  },
};
