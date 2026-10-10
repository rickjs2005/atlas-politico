// Tela: o telão de um auditório, em dois pés (par), ou um televisor sobre um
// gabinete baixo (ímpar). As telas estão apagadas: vidro escuro com um
// reflexo frio, sem imagem. O telão é de alumínio, com os pés em T e a tela
// pendurada na travessa; o televisor é um painel fino sobre o pé, e o
// gabinete leva a madeira e os puxadores do ambiente.

import { DETAIL, OUTLINE } from "./kit";
import { SUAVE, caixa, faceV, haste, pt, sombra, tomV, tracos, type Quadro } from "./props-base";

const VIDRO = "#33373b";
const REFLEXO = "#4d5257";

function televisor(q: Quadro): void {
  const { mat, ctx } = q;
  sombra(q, 0.7, 0.44);
  // Gabinete baixo, com o rodapé recuado e as duas portas.
  caixa(q, 0, 0.04, 0.6, 0.34, 3, mat.madeiraEscura, 0, DETAIL);
  caixa(q, 0, 0.04, 0.66, 0.4, 13, mat.madeira, 3, OUTLINE, mat.tampo);
  faceV(q, 0.241, -0.3, -0.02, 5, 14.5, tomV(q, mat.madeira, -0.08), DETAIL, SUAVE);
  faceV(q, 0.241, 0.02, 0.3, 5, 14.5, tomV(q, mat.madeira, -0.08), DETAIL, SUAVE);
  tracos(ctx, [pt(q, -0.06, 0.242, 8.5), pt(q, -0.06, 0.242, 11.5), pt(q, 0.06, 0.242, 8.5), pt(q, 0.06, 0.242, 11.5)], 1.1, 0.9, mat.cromo);
  // O pé do televisor, o pescoço e o painel fino.
  caixa(q, 0, 0.02, 0.24, 0.14, 1.5, mat.ferro, 16, DETAIL);
  haste(ctx, [pt(q, 0, 0.02, 17.5), pt(q, 0, 0.02, 22)], 3, mat.ferro);
  // O painel: moldura fina de alumínio, para não virar um bloco escuro contra uma parede escura.
  caixa(q, 0, 0.02, 0.58, 0.05, 32, mat.ferro, 22, OUTLINE);
  faceV(q, 0.046, -0.28, 0.28, 23, 53, mat.aco, DETAIL);
  faceV(q, 0.047, -0.26, 0.26, 24.5, 51.5, VIDRO, DETAIL);
  faceV(q, 0.048, -0.23, -0.13, 26.5, 49.5, REFLEXO, 0, 1);
}

function telao(q: Quadro): void {
  const { mat, ctx } = q;
  sombra(q, 0.96, 0.34);
  // Os pés em T, com a travessa de baixo e a de cima.
  for (const u of [-0.42, 0.42]) {
    caixa(q, u, 0.02, 0.08, 0.3, 2, mat.ferro, 0, DETAIL);
    haste(ctx, [pt(q, u, 0.02, 2), pt(q, u, 0.02, 64)], 2.4, mat.aco);
  }
  haste(ctx, [pt(q, -0.42, 0.02, 12), pt(q, 0.42, 0.02, 12)], 1.6, mat.aco);
  haste(ctx, [pt(q, -0.45, 0.02, 64), pt(q, 0.45, 0.02, 64)], 2.4, mat.aco);
  // A tela pendurada na travessa: moldura de alumínio, vidro escuro e um reflexo.
  tracos(ctx, [pt(q, -0.28, 0.03, 61), pt(q, -0.28, 0.03, 64), pt(q, 0.28, 0.03, 61), pt(q, 0.28, 0.03, 64)], 1.2, 0.9, mat.ferro);
  faceV(q, 0.03, -0.37, 0.37, 19, 61, mat.aco, OUTLINE);
  faceV(q, 0.031, -0.34, 0.34, 21, 59, VIDRO, DETAIL);
  faceV(q, 0.032, -0.3, -0.18, 24, 56, REFLEXO, 0, 1);
}

/** Telão em dois pés (par) ou televisor sobre gabinete (ímpar), apagados. */
export function tela(q: Quadro): void {
  if (q.variante % 2 === 1) televisor(q);
  else telao(q);
}
