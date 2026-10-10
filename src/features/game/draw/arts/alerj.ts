// Salão de assembleia legislativa, anos 2000: parede creme com pilastras e
// painéis emoldurados, pedra clara em placas no chão, porta de madeira escura
// com vidro no alto em portal de pedra; madeira escura e pedra nos móveis.

import { leafVidro } from "../door-leaves";
import { drawSlab } from "../floors";
import { DETAIL, tone } from "../kit";
import { PARAPET_H, strokeInk } from "../scene-shared";
import { VIDRO, VIDRO_LUZ, band, hline, isFeature, rect, seg } from "../wall-kit";
import type { ArtSpec } from "./types";

export const alerj: ArtSpec = {
  id: "alerj",
  nome: "Salão de assembleia",
  parede: {
    estilo: (p, k) => ({
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
    }),
    faixas: [
      [0, 6, "rodape"],
      [6, 14, "barra"],
      [58, 66, "remate"],
    ],
    linhas: [
      [6, 0.45],
      [14, 0.4],
      [58, 0.5],
      [61.5, 0.22],
    ],
    decorar(ctx, e, i) {
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
    },
    parapeito(ctx, _e, u0, u1) {
      ctx.beginPath();
      seg(ctx, u0, 3, u1, 3);
      seg(ctx, u0, PARAPET_H - 2.5, u1, PARAPET_H - 2.5);
      strokeInk(ctx, 0.6, 0.28);
    },
    corpoDoParapeito: "face",
  },
  piso: (ctx, paleta, base, sx, sy, _variante, info) => drawSlab(ctx, paleta, base, sx, sy, info),
  porta: (p) => ({ moldura: tone(p.parede, -0.12), folha: "#6b4a34", ferragem: p.acento, degrau: tone(p.parede, -0.08), desenho: leafVidro }),
  // Madeira escura e pedra clara.
  receita: {
    madeira: "#5c4334",
    tinta: 0.1,
    tampo: "#745744",
    madeiraEscura: "#43312a",
    aco: "#b4b5ad",
    maquina: "#7c8a86",
    ferro: "#4a4a47",
    cromo: "#d2d3cc",
    latao: "#b9975b",
    estofado: "#57483f",
    pedra: "#ece6d8",
    pano: "#b9b8ae",
    papel: "#f6f2e8",
    pardo: "#d1b888",
    folha: "#5f8259",
    vaso: "#d8d1c1",
    feltro: "#6b5648",
    plastico: "#e6e3d9",
    lombadas: ["#d1b888", "#5a6a72", "#8b8d86", "#f1ece0", "#6b5648"],
    brilho: 0.35,
    desgaste: 0,
    rustico: false,
    frio: false,
  },
};
