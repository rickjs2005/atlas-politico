// Balcão e cartaz: o que um comitê de campanha tem à mão. O balcão é a bancada
// de atendimento, em laminado branco com o tampo de pinho, papéis e um
// telefone (par) ou um porta-folhetos com o maço de panfletos (ímpar). O
// cartaz é um cavalete de tripé com o cartaz preso numa placa (par) ou um
// banner de chão enrolável, de base de alumínio (ímpar). Nenhum traz cor ou
// símbolo de partido: papel, uma faixa neutra e um retângulo cinza no lugar
// da foto.

import { DETAIL, INK, OUTLINE, tone, type Pt } from "./kit";
import { SUAVE, bola, brilho, caixa, faceU, faceV, folha, forma, haste, plano, pt, sombra, tomU, tomV, tracos, type Quadro } from "./props-base";

/** O cinza da foto dos cartazes: nem claro, nem escuro, sem rosto. */
const FOTO = "#9c9d98";

// ---------------------------------------------------------------------------
// Balcão
// ---------------------------------------------------------------------------

// Retângulo inclinado na face da frente: de (v0, z0) embaixo a (v1, z1) em cima, entre u0 e u1.
function inclinado(q: Quadro, u0: number, u1: number, v0: number, z0: number, v1: number, z1: number, cor: string, contorno: number, alfa: number): void {
  forma(q.ctx, [pt(q, u0, v0, z0), pt(q, u1, v0, z0), pt(q, u1, v1, z1), pt(q, u0, v1, z1)], cor, contorno, alfa);
}

// Telefone de mesa: a base com o teclado e o fone deitado por cima.
function telefone(q: Quadro, u: number, v: number, z: number): void {
  const { mat, ctx } = q;
  const corpo = tone(mat.plastico, -0.2);
  caixa(q, u, v, 0.17, 0.2, 3, corpo, z, DETAIL);
  plano(q, u - 0.055, v - 0.02, u + 0.065, v + 0.07, z + 3, tone(corpo, -0.12), 0, 0.8);
  tracos(ctx, [pt(q, u - 0.04, v + 0.0, z + 3.2), pt(q, u + 0.05, v + 0.0, z + 3.2), pt(q, u - 0.04, v + 0.035, z + 3.2), pt(q, u + 0.05, v + 0.035, z + 3.2)], 0.5, 0.4);
  haste(ctx, [pt(q, u - 0.09, v - 0.07, z + 5), pt(q, u + 0.09, v - 0.07, z + 5)], 2.6, tone(corpo, -0.06));
  bola(ctx, pt(q, u - 0.09, v - 0.07, z + 5), 2, tone(corpo, -0.1), DETAIL);
  bola(ctx, pt(q, u + 0.09, v - 0.07, z + 5), 2, tone(corpo, -0.1), DETAIL);
}

// O maço de panfletos e o porta-folhetos de acrílico, com um panfleto em pé.
function panfletos(q: Quadro, z: number): void {
  const { mat, ctx } = q;
  const faixa = tone(mat.pardo, 0.15);
  // O maço: uma pilha com a foto cinza e a faixa no de cima.
  caixa(q, 0.3, 0.11, 0.17, 0.23, 3, mat.papel, z, DETAIL);
  plano(q, 0.235, 0.02, 0.365, 0.12, z + 3, FOTO, 0, 0.9);
  plano(q, 0.235, 0.15, 0.365, 0.19, z + 3, faixa, 0, 0.9);
  tracos(ctx, [pt(q, 0.24, -0.06, z + 3), pt(q, 0.33, -0.06, z + 3)], 0.5, 0.4);
  // O porta-folhetos: um panfleto inclinado para trás e a aba de acrílico na frente.
  inclinado(q, -0.02, 0.15, -0.17, z + 0.6, -0.23, z + 12.5, mat.papel, DETAIL, SUAVE);
  inclinado(q, -0.005, 0.135, -0.192, z + 5, -0.218, z + 10, FOTO, 0, 1);
  inclinado(q, -0.005, 0.135, -0.176, z + 2, -0.183, z + 3.4, faixa, 0, 1);
  tracos(ctx, [pt(q, 0.0, -0.213, z + 11.2), pt(q, 0.1, -0.213, z + 11.2)], 0.5, 0.4);
  const antes = ctx.globalAlpha;
  ctx.globalAlpha = antes * 0.3;
  inclinado(q, -0.04, 0.17, -0.15, z, -0.165, z + 4.6, "#ffffff", 0, 1);
  ctx.globalAlpha = antes;
  tracos(ctx, [pt(q, -0.04, -0.165, z + 4.6), pt(q, 0.17, -0.165, z + 4.6), pt(q, -0.04, -0.15, z), pt(q, -0.04, -0.165, z + 4.6), pt(q, 0.17, -0.15, z), pt(q, 0.17, -0.165, z + 4.6)], 0.6, 0.5);
}

/** Bancada de atendimento: laminado branco com friso de pinho, tampo de pinho e papéis; ímpar, com os panfletos. */
export function balcao(q: Quadro): void {
  const { mat, ctx } = q;
  const laminado = mat.plastico;
  const tampo = 23;
  sombra(q, 0.92, 0.56);
  // Rodapé recuado e escuro: a bancada parece assentar leve no chão.
  caixa(q, 0, 0, 0.78, 0.4, 3, mat.madeiraEscura, 0, DETAIL);
  caixa(q, 0, 0, 0.86, 0.48, tampo - 3, laminado, 3);
  // Painel da frente em duas placas, com o friso de pinho entre elas; o lado liso.
  const placa = tomV(q, laminado, -0.05);
  faceV(q, 0.241, -0.4, -0.02, 5, tampo - 2, placa, DETAIL, SUAVE);
  faceV(q, 0.241, 0.02, 0.4, 5, tampo - 2, placa, DETAIL, SUAVE);
  faceV(q, 0.242, -0.43, 0.43, 11.5, 13.5, tomV(q, mat.madeira), DETAIL, SUAVE);
  faceU(q, 0.431, -0.21, 0.21, 5, tampo - 2, tomU(q, laminado, -0.05), DETAIL, SUAVE);
  faceU(q, 0.432, -0.24, 0.24, 11.5, 13.5, tomU(q, mat.madeira), DETAIL, SUAVE);
  // Tampo de pinho, com a borda saliente, e o laminado claro por cima.
  caixa(q, 0, 0, 0.94, 0.56, 3.5, mat.madeira, tampo, OUTLINE, mat.tampo);
  brilho(q, -0.47, -0.28, 0.47, 0.28, tampo + 3.5);
  const z = tampo + 3.5;
  // Papéis e a caneta.
  folha(q, -0.27, 0.02, 0.2, 0.26, 0.14, z, tone(mat.papel, -0.08));
  folha(q, -0.26, 0.0, 0.2, 0.26, -0.06, z + 0.7, mat.papel);
  tracos(ctx, [pt(q, -0.33, -0.07, z + 0.7), pt(q, -0.2, -0.08, z + 0.7), pt(q, -0.33, -0.02, z + 0.7), pt(q, -0.21, -0.03, z + 0.7), pt(q, -0.33, 0.03, z + 0.7), pt(q, -0.26, 0.02, z + 0.7)], 0.6, 0.38);
  tracos(ctx, [pt(q, -0.06, 0.16, z), pt(q, 0.04, 0.21, z)], 1.3, 0.9);
  if (q.variante % 2 === 1) panfletos(q, z);
  else telefone(q, 0.26, -0.05, z);
}

// ---------------------------------------------------------------------------
// Cartaz
// ---------------------------------------------------------------------------

/** O cartaz colado numa face da frente, entre `z0` e `z1`: papel, faixa neutra, foto cinza e linhas sem texto. */
function cartazNaFace(q: Quadro, v: number, u0: number, u1: number, z0: number, z1: number): void {
  const { mat, ctx } = q;
  const h = z1 - z0;
  const m = (u1 - u0) * 0.1;
  faceV(q, v, u0, u1, z0, z1, mat.papel, OUTLINE);
  // A faixa no alto, a foto no meio (pequena, para não parecer uma tela) e as linhas embaixo.
  faceV(q, v + 0.001, u0 + m, u1 - m, z1 - h * 0.18, z1 - h * 0.08, tone(mat.pardo, 0.15), 0, 1);
  faceV(q, v + 0.001, u0 + m * 1.6, u1 - m * 1.6, z0 + h * 0.4, z1 - h * 0.26, tone(FOTO, 0.1), 0, 1);
  const linhas: Pt[] = [];
  for (const f of [0.32, 0.25, 0.18, 0.1]) linhas.push(pt(q, u0 + m, v + 0.002, z0 + h * f), pt(q, u1 - m - (f < 0.12 ? (u1 - u0) * 0.3 : 0), v + 0.002, z0 + h * f));
  tracos(ctx, linhas, 0.6, 0.38);
}

// Banner de chão: a base chata de alumínio, o mastro atrás e a lona em pé, enrolada no cassete.
function banner(q: Quadro): void {
  const { mat, ctx } = q;
  sombra(q, 0.6, 0.34);
  caixa(q, -0.19, 0.03, 0.08, 0.26, 1.5, mat.ferro, 0, DETAIL);
  caixa(q, 0.19, 0.03, 0.08, 0.26, 1.5, mat.ferro, 0, DETAIL);
  caixa(q, 0, 0.0, 0.52, 0.1, 4, mat.aco, 1, OUTLINE, tone(mat.aco, 0.12));
  haste(ctx, [pt(q, 0, -0.03, 5), pt(q, 0, -0.03, 62)], 1.6, mat.aco);
  faceV(q, 0.0, -0.22, 0.22, 5, 60, mat.papel, OUTLINE);
  cartazNaFace(q, 0.001, -0.22, 0.22, 5, 60);
  // A régua do alto e a boca do cassete.
  haste(ctx, [pt(q, -0.24, 0.0, 60), pt(q, 0.24, 0.0, 60)], 1.8, mat.aco);
  faceV(q, 0.012, -0.26, 0.26, 3, 6, tomV(q, mat.aco), DETAIL, 0.9);
}

// Cavalete de tripé: um pé atrás, dois na frente, a prateleira e a placa com o cartaz.
function cavalete(q: Quadro): void {
  const { mat, ctx } = q;
  const pe = mat.madeiraEscura;
  sombra(q, 0.6, 0.44);
  haste(ctx, [pt(q, 0, -0.26, 0), pt(q, 0, 0.02, 50)], 1.7, pe);
  // A placa de eucatex, com o cartaz preso nela.
  caixa(q, 0, 0.09, 0.6, 0.03, 34, tone(mat.pardo, -0.3), 14, OUTLINE);
  cartazNaFace(q, 0.106, -0.27, 0.27, 15.5, 46.5);
  // A prateleira em que a placa apoia e os pés da frente, que abraçam a placa pelos lados.
  haste(ctx, [pt(q, -0.3, 0.15, 12), pt(q, 0.3, 0.15, 12)], 2.4, pe);
  haste(ctx, [pt(q, -0.34, 0.24, 0), pt(q, -0.3, 0.12, 50)], 1.7, pe);
  haste(ctx, [pt(q, 0.34, 0.24, 0), pt(q, 0.3, 0.12, 50)], 1.7, pe);
  // A travessa do alto, que fecha o tripé.
  haste(ctx, [pt(q, -0.31, 0.12, 50), pt(q, 0.31, 0.12, 50)], 1.9, pe);
  bola(ctx, pt(q, 0, 0.12, 50), 1.3, tone(INK, 0.2));
}

/** Cartaz sem texto: no cavalete de tripé (variante par) ou no banner de chão enrolável (ímpar). */
export function cartaz(q: Quadro): void {
  if (q.variante % 2 === 1) banner(q);
  else cavalete(q);
}
