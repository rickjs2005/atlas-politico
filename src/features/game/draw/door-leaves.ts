// Os desenhos de folha de porta dos quatro primeiros ambientes, reaproveitáveis
// pelas artes novas com outras cores: aço pintado com visor, madeira
// almofadada, madeira com vidro no alto e folha lisa com rasgo de luz.
// Cada função recebe a folha já cheia na cor do estilo.

import { DETAIL, INK } from "./kit";
import { LEAF_H, LX, LY, leafRect, leafSeg, type LeafDesign } from "./exit-kit";
import { fillAlpha, fillSolid, shade, strokeInk } from "./scene-shared";

const VIDRO = "#c3cdc8";

/** Chapa de rodapé, travessa, visor aramado e barra. */
export const leafAco: LeafDesign = (ctx, e, luz) => {
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
};

/** Duas almofadas e o puxador. */
export const leafAlmofadas: LeafDesign = (ctx, e, luz) => {
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
};

/** Almofada embaixo, vidro em cruz no alto e puxador vertical. */
export const leafVidro: LeafDesign = (ctx, e, luz) => {
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
};

/** Veio vertical, rasgo de luz e puxador comprido. */
export const leafRasgo: LeafDesign = (ctx, e, luz) => {
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
};
