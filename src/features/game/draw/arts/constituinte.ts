// Plenário de assembleia constituinte, anos 1980: parede clara com lambri de
// madeira almofadado e janela alta, taco de madeira no chão, porta de madeira
// almofadada com puxador de latão; madeira quente envernizada nos móveis.

import { leafAlmofadas } from "../door-leaves";
import { drawParquet } from "../floors";
import { DETAIL, tone } from "../kit";
import { PARAPET_H, strokeInk } from "../scene-shared";
import { band, drawGlass, hline, isFeature, rect, seg } from "../wall-kit";
import type { ArtSpec } from "./types";

export const constituinte: ArtSpec = {
  id: "constituinte",
  nome: "Plenário de constituinte",
  parede: {
    estilo: (p, k) => ({
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
    }),
    faixas: [
      [0, 5, "rodape"],
      [5, 26, "barra"],
      [26, 29.5, "friso"],
      [59, 66, "remate"],
    ],
    linhas: [
      [5, 0.5],
      [26, 0.6],
      [29.5, 0.55],
      [59, 0.5],
      [62.5, 0.22],
    ],
    decorar(ctx, e, i) {
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
    },
    parapeito(ctx, _e, u0, u1) {
      ctx.beginPath();
      for (let c = 0.125; c < 1; c += 0.25) if (c > u0 && c < u1) seg(ctx, c, 1, c, PARAPET_H - 1);
      strokeInk(ctx, 0.6, 0.3);
    },
    corpoDoParapeito: "barra",
  },
  piso: (ctx, _paleta, base, sx, sy, variante, info) => drawParquet(ctx, base, sx, sy, variante, info),
  porta: (p) => ({ moldura: tone(p.acento, -0.34), folha: tone(p.acento, -0.1), ferragem: "#d3ad55", degrau: tone(p.parede, -0.12), desenho: leafAlmofadas }),
  // Madeira quente envernizada.
  receita: {
    madeira: "#7f4f2c",
    tinta: 0.15,
    tampo: "#95643a",
    madeiraEscura: "#5a3620",
    aco: "#9c9a86",
    maquina: "#6f7f76",
    ferro: "#3f3b36",
    cromo: "#cfcabb",
    latao: "#b3975a",
    estofado: "#4f6462",
    pedra: "#e3dccb",
    pano: "#b3b2a8",
    papel: "#f4efe3",
    pardo: "#cfb07a",
    folha: "#5d7d52",
    vaso: "#8a6b4a",
    feltro: "#4f6462",
    plastico: "#e2dccb",
    lombadas: ["#6b4a3a", "#4f6462", "#b59a6a", "#3f3a36", "#e6dfce"],
    brilho: 0.55,
    desgaste: 0.2,
    rustico: false,
    frio: false,
  },
};
