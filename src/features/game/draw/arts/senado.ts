// Plenário de senado, fim dos anos 2010: painel moderno claro com ripas
// verticais e painéis de madeira com rasgo de luz, pedra fria polida no chão,
// porta lisa de madeira clara com rasgo de luz; madeira polida e estofado
// sóbrio nos móveis.

import { leafRasgo } from "../door-leaves";
import { drawPolished } from "../floors";
import { DETAIL, tone } from "../kit";
import { PARAPET_H, strokeInk } from "../scene-shared";
import { VIDRO, VIDRO_LUZ, band, hline, isFeature, rect, seg } from "../wall-kit";
import type { ArtSpec } from "./types";

export const senado: ArtSpec = {
  id: "senado",
  nome: "Plenário de senado",
  parede: {
    estilo: (p, k) => ({
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
    }),
    faixas: [
      [0, 4, "rodape"],
      [57.5, 61, "extra"],
      [61, 66, "remate"],
    ],
    linhas: [
      [4, 0.55],
      [57.5, 0.4],
      [61, 0.45],
    ],
    decorar(ctx, e, i) {
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
    },
    parapeito(ctx, _e, u0, u1) {
      ctx.beginPath();
      for (let c = 0.0625; c < 1; c += 0.125) if (c > u0 && c < u1) seg(ctx, c, 1.5, c, PARAPET_H - 1.5);
      strokeInk(ctx, 0.8, 0.22);
    },
    corpoDoParapeito: "face",
  },
  piso: (ctx, _paleta, base, sx, sy, _variante, info) => drawPolished(ctx, base, sx, sy, info),
  porta: (p) => ({ moldura: "#6a6f6d", folha: p.acento, ferragem: "#e1e3dc", degrau: tone(p.parede, -0.1), desenho: leafRasgo }),
  // Madeira escura polida e estofado cinza-azulado sóbrio.
  receita: {
    madeira: "#4d3a31",
    tinta: 0.08,
    tampo: "#604b3d",
    madeiraEscura: "#382b26",
    aco: "#8f969b",
    maquina: "#75828a",
    ferro: "#3d4144",
    cromo: "#d0d4d3",
    latao: "#a39262",
    estofado: "#66737f",
    pedra: "#e7e8e2",
    pano: "#b4b7b4",
    papel: "#f5f3ec",
    pardo: "#c8b78f",
    folha: "#58796a",
    vaso: "#5a6068",
    feltro: "#5d6b78",
    plastico: "#e3e4de",
    lombadas: ["#4a5560", "#c8b78f", "#8a8f93", "#efede6", "#3d4144"],
    brilho: 0.8,
    desgaste: 0,
    rustico: false,
    frio: true,
  },
};
