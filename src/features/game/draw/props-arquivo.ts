// Guarda e papel: arquivo de aço, estante, armário de ferro, caixote, urna
// eletrônica e placa de avisos. Nada aqui tem texto: etiquetas e folhas são
// manchas de papel com riscos que não se leem.

import { cellNoise, DETAIL, INK, tone, type Pt } from "./kit";
import { bola, caixa, faceU, faceV, forma, plano, prismaU, pt, sombra, SUAVE, tomU, tomV, tracos, type Quadro } from "./props-base";

// ---------------------------------------------------------------------------
// Arquivo
// ---------------------------------------------------------------------------

function frenteDaGaveta(q: Quadro, v: number, z: number): void {
  const { mat } = q;
  faceV(q, v, -0.21, 0.21, z, z + 10, tomV(q, mat.aco, 0.07), DETAIL, 0.7);
  faceV(q, v, -0.05, 0.05, z + 5.8, z + 8.2, mat.papel, 0.6, 0.6);
  faceV(q, v, -0.075, 0.075, z + 2.4, z + 4.2, mat.cromo, DETAIL, 0.9);
}

/** Gaveteiro de metal com puxadores e porta-etiquetas. Variante 1: uma gaveta aberta; 2: uma caixa em cima. */
export function arquivo(q: Quadro): void {
  const { mat } = q;
  const variante = q.variante % 3;
  const aberta = variante === 1 ? 2 : -1;
  sombra(q, 0.5, 0.58);
  caixa(q, 0, 0, 0.46, 0.54, 2, mat.ferro);
  caixa(q, 0, 0, 0.5, 0.58, 50, mat.aco, 2);
  for (let i = 0; i < 4; i += 1) if (i !== aberta) frenteDaGaveta(q, 0.29, 4.5 + i * 12);
  if (aberta >= 0) {
    const z = 4.5 + aberta * 12;
    // O vão escuro e a gaveta puxada, com as pastas à mostra.
    faceV(q, 0.29, -0.21, 0.21, z, z + 10, tone(INK, 0.1), DETAIL, 0.8);
    caixa(q, 0, 0.38, 0.42, 0.18, 9.4, mat.aco, z + 0.3);
    plano(q, -0.18, 0.31, 0.18, 0.45, z + 9.7, tone(INK, 0.14), DETAIL, 0.7);
    tracos(q.ctx, [pt(q, -0.16, 0.33, z + 10.6), pt(q, 0.16, 0.33, z + 10.6), pt(q, -0.16, 0.39, z + 10.6), pt(q, 0.16, 0.39, z + 10.6)], 1.3, 1, mat.papel);
    tracos(q.ctx, [pt(q, -0.16, 0.36, z + 10.6), pt(q, 0.16, 0.36, z + 10.6), pt(q, -0.16, 0.42, z + 10.6), pt(q, 0.16, 0.42, z + 10.6)], 1.3, 1, mat.pardo);
    frenteDaGaveta(q, 0.47, z);
  }
  if (variante === 2) caixaDeArquivo(q, -0.02, 0.02, 0.36, 0.34, 52);
  lascas(q, 0.25, 0.29, 2);
}

// Caixa de papelão de arquivo, com a tampa e a etiqueta em branco.
function caixaDeArquivo(q: Quadro, u: number, v: number, wu: number, wv: number, z: number): void {
  const { mat } = q;
  caixa(q, u, v, wu, wv, 8, mat.pardo, z);
  caixa(q, u, v, wu + 0.03, wv + 0.03, 2.5, tone(mat.pardo, -0.08), z + 8);
  faceV(q, v + wv / 2, u - 0.07, u + 0.07, z + 2.2, z + 5.6, mat.papel, 0.6, 0.6);
}

// Tinta lascada junto do chão, onde o aço da cena é gasto: duas manchas baixas e um risco.
// `du` e `dv` são as meias larguras do corpo e `z` a altura em que ele começa.
function lascas(q: Quadro, du: number, dv: number, z: number): void {
  if (q.mat.desgaste < 0.5) return;
  const { ctx } = q;
  const r = cellNoise(q.info.x, q.info.y, 9);
  const u = -du + 0.03 + r * (du * 2 - 0.16);
  const v = dv - 0.05 - r * (dv * 2 - 0.2);
  const antes = ctx.globalAlpha;
  ctx.globalAlpha = antes * 0.5;
  forma(ctx, [pt(q, u, dv, z), pt(q, u + 0.1, dv, z), pt(q, u + 0.075, dv, z + 1.5), pt(q, u + 0.02, dv, z + 2.3)], tomV(q, q.mat.ferro), 0);
  forma(ctx, [pt(q, du, v, z), pt(q, du, v - 0.11, z), pt(q, du, v - 0.08, z + 2), pt(q, du, v - 0.03, z + 1.4)], tomU(q, q.mat.ferro), 0);
  ctx.globalAlpha = antes;
  tracos(ctx, [pt(q, du, v - 0.02, z + 22), pt(q, du, v - 0.07, z + 27)], 0.6, 0.22);
}

// ---------------------------------------------------------------------------
// Estante
// ---------------------------------------------------------------------------

// O que ocupa um vão: lombada em pé (0), caixa de arquivo (1) ou pastas deitadas (2).
interface Item {
  u: number;
  w: number;
  h: number;
  cor: number;
  tipo: 0 | 1 | 2;
}

const VAOS = 4;
const VAO = 14.5;

// Três arrumações fixas, sorteadas uma vez: a estante não muda de um quadro para o outro.
function arrumar(semente: number): Item[][] {
  const vaos: Item[][] = [];
  for (let p = 0; p < VAOS; p += 1) {
    const itens: Item[] = [];
    let u = -0.36;
    for (let i = 0; u < 0.31; i += 1) {
      const r = cellNoise(p * 7 + i, semente, 5);
      if (r < 0.13) {
        u += 0.05 + r * 0.35;
      } else if (r < 0.36 && u < 0.14) {
        itens.push({ u, w: 0.2, h: 9, cor: 0, tipo: 1 });
        u += 0.215;
      } else if (r < 0.46 && u < 0.1) {
        itens.push({ u, w: 0.24, h: 2 + Math.round(r * 40) % 3 * 2, cor: 1 + (i % 3), tipo: 2 });
        u += 0.255;
      } else {
        const w = 0.045 + cellNoise(i, p, semente) * 0.03;
        itens.push({ u, w, h: 8 + cellNoise(p, i, semente + 1) * 3.6, cor: Math.floor(r * 97) % 5, tipo: 0 });
        u += w + 0.004;
      }
    }
    vaos.push(itens);
  }
  return vaos;
}

const ARRUMACOES = [arrumar(1), arrumar(2), arrumar(3)] as const;

/** Estante de quatro vãos com pastas e caixas de arquivo: de aço no sindicato, de madeira nas outras cenas. */
export function estante(q: Quadro): void {
  const { mat, ctx } = q;
  const corpo = q.info.cena === "sindicato" ? mat.aco : mat.madeira;
  const v = 0.15;
  sombra(q, 0.84, 0.3);
  caixa(q, 0, 0, 0.84, 0.3, 64, corpo);
  // O fundo dos vãos, na sombra.
  faceV(q, v, -0.38, 0.38, 3, 61, tomV(q, corpo, -0.45), DETAIL);
  const vaos = ARRUMACOES[q.variante % ARRUMACOES.length]!;
  for (let p = 0; p < VAOS; p += 1) {
    const z = 3 + p * VAO;
    for (const item of vaos[p]!) {
      const cor = mat.lombadas[item.cor % mat.lombadas.length]!;
      if (item.tipo === 1) {
        faceV(q, v, item.u, item.u + item.w, z, z + item.h, tomV(q, mat.pardo), DETAIL, 0.7);
        faceV(q, v, item.u + 0.05, item.u + 0.15, z + 3, z + 6.4, mat.papel, 0);
      } else if (item.tipo === 2) {
        faceV(q, v, item.u, item.u + item.w, z, z + item.h, tomV(q, cor), DETAIL, 0.7);
        tracos(ctx, [pt(q, item.u, v, z + item.h / 2), pt(q, item.u + item.w, v, z + item.h / 2)], 0.6, 0.4);
      } else {
        faceV(q, v, item.u, item.u + item.w, z, z + item.h, tomV(q, cor), 0.6, 0.45);
      }
    }
    // A tábua de cima de cada vão.
    if (p > 0) faceV(q, v, -0.38, 0.38, z - 2, z, tomV(q, corpo, 0.1), DETAIL, 0.7);
  }
  if (q.variante % 2 === 1) caixaDeArquivo(q, -0.2, 0, 0.3, 0.24, 64);
}

// ---------------------------------------------------------------------------
// Armário
// ---------------------------------------------------------------------------

/** Armário de ferro de duas portas, com venezianas em cima e embaixo. Variante ímpar: uma caixa guardada em cima. */
export function armario(q: Quadro): void {
  const { mat, ctx } = q;
  const v = 0.21;
  sombra(q, 0.76, 0.42);
  caixa(q, 0, 0, 0.7, 0.36, 3, mat.ferro);
  caixa(q, 0, 0, 0.76, 0.42, 58, mat.aco, 3);
  const porta = tomV(q, mat.aco, 0.06);
  faceV(q, v, -0.355, -0.008, 5.5, 58.5, porta, DETAIL, 0.75);
  faceV(q, v, 0.008, 0.355, 5.5, 58.5, porta, DETAIL, 0.75);
  // Venezianas: três rasgos em cima e três embaixo de cada porta.
  const rasgos: Pt[] = [];
  for (let i = 0; i < 6; i += 1) {
    const z = (i < 3 ? 9 : 41.2) + i * 2.6;
    rasgos.push(pt(q, -0.3, v, z), pt(q, -0.09, v, z), pt(q, 0.09, v, z), pt(q, 0.3, v, z));
  }
  tracos(ctx, rasgos, 0.9, 0.7);
  // Puxadores junto do meio e a fechadura.
  faceV(q, v, -0.065, -0.035, 29, 36, mat.cromo, DETAIL, 0.9);
  faceV(q, v, 0.035, 0.065, 29, 36, mat.cromo, DETAIL, 0.9);
  bola(ctx, pt(q, 0.05, v, 26), 0.8, INK);
  lascas(q, 0.38, v, 3);
  if (q.variante % 2 === 1) caixaDeArquivo(q, -0.14, 0, 0.34, 0.28, 61);
}

// ---------------------------------------------------------------------------
// Caixote
// ---------------------------------------------------------------------------

function engradado(q: Quadro, u: number, v: number, w: number, h: number, z: number): void {
  const { mat, ctx } = q;
  const a = w / 2;
  caixa(q, u, v, w, w, h, mat.tampo, z);
  // Frestas entre as ripas, nas duas faces.
  const frestas: Pt[] = [];
  for (let i = 1; i < 4; i += 1) {
    const zi = z + (h * i) / 4;
    frestas.push(pt(q, u - a, v + a, zi), pt(q, u + a, v + a, zi), pt(q, u + a, v + a, zi), pt(q, u + a, v - a, zi));
  }
  tracos(ctx, frestas, 0.9, 0.6);
  // Sarrafos em pé nos cantos e os pregos.
  const escuroV = tomV(q, mat.madeira, -0.04);
  const escuroU = tomU(q, mat.madeira, -0.04);
  faceV(q, v + a, u - a, u - a + 0.09, z, z + h, escuroV, DETAIL, 0.7);
  faceV(q, v + a, u + a - 0.09, u + a, z, z + h, escuroV, DETAIL, 0.7);
  faceU(q, u + a, v + a - 0.09, v + a, z, z + h, escuroU, DETAIL, 0.7);
  faceU(q, u + a, v - a, v - a + 0.09, z, z + h, escuroU, DETAIL, 0.7);
  // Tábuas da tampa.
  tracos(ctx, [pt(q, u - a, v - a / 3, z + h), pt(q, u + a, v - a / 3, z + h), pt(q, u - a, v + a / 3, z + h), pt(q, u + a, v + a / 3, z + h)], DETAIL, SUAVE);
  const prego = tone(mat.madeiraEscura, -0.35);
  bola(ctx, pt(q, u - a + 0.045, v + a, z + h - 3), 0.6, prego);
  bola(ctx, pt(q, u + a - 0.045, v + a, z + h - 3), 0.6, prego);
  bola(ctx, pt(q, u - a + 0.045, v + a, z + 3), 0.6, prego);
  bola(ctx, pt(q, u + a - 0.045, v + a, z + 3), 0.6, prego);
}

/** Caixote de madeira com ripas. Variante ímpar: dois, um sobre o outro. */
export function caixote(q: Quadro): void {
  sombra(q, 0.6, 0.6);
  engradado(q, 0, 0, 0.6, 24, 0);
  if (q.variante % 2 === 1) engradado(q, -0.05, -0.04, 0.42, 16, 24);
}

// ---------------------------------------------------------------------------
// Urna eletrônica
// ---------------------------------------------------------------------------

// A urna de perfil: caixa baixa na frente e alta atrás, com o painel inclinado para o eleitor.
const URNA: readonly Pt[] = [
  [-0.19, 22.5],
  [0.19, 22.5],
  [0.19, 27],
  [-0.08, 37],
  [-0.19, 37],
];
// Altura do painel inclinado em cada profundidade.
const noPainel = (v: number): number => 27 + (0.19 - v) * (10 / 0.27);

function painel(q: Quadro, u0: number, u1: number, v0: number, v1: number, cor: string, alfa: number): void {
  forma(q.ctx, [pt(q, u0, v0, noPainel(v0)), pt(q, u1, v0, noPainel(v0)), pt(q, u1, v1, noPainel(v1)), pt(q, u0, v1, noPainel(v1))], cor, DETAIL, alfa);
}

/** Urna eletrônica sobre uma mesinha: caixa clara com tela e teclado, sem texto. Variante ímpar: com a cabine de papelão. */
export function urna(q: Quadro): void {
  const { mat, ctx } = q;
  const cabine = q.variante % 2 === 1;
  const papelao = tone(mat.papel, -0.06);
  sombra(q, 0.62, 0.56);
  caixa(q, -0.24, -0.21, 0.045, 0.045, 20, mat.madeiraEscura, 0, DETAIL);
  caixa(q, 0.24, -0.21, 0.045, 0.045, 20, mat.madeiraEscura, 0, DETAIL);
  caixa(q, -0.24, 0.21, 0.045, 0.045, 20, mat.madeiraEscura, 0, DETAIL);
  caixa(q, 0.24, 0.21, 0.045, 0.045, 20, mat.madeiraEscura, 0, DETAIL);
  caixa(q, 0, 0, 0.54, 0.48, 3, mat.madeira, 17);
  caixa(q, 0, 0, 0.62, 0.56, 2.5, mat.tampo, 20);
  if (cabine) {
    // O fundo e a aba de trás da cabine.
    faceV(q, -0.23, -0.27, 0.27, 22.5, 46, tomV(q, papelao), DETAIL);
    forma(ctx, [pt(q, -0.27, -0.23, 22.5), pt(q, -0.27, 0.12, 22.5), pt(q, -0.27, 0.12, 36), pt(q, -0.27, -0.23, 46)], tomU(q, papelao), DETAIL);
  }
  prismaU(q, URNA, -0.23, 0.23, mat.plastico);
  // Tela, à esquerda de quem vota.
  painel(q, -0.2, 0.04, -0.055, 0.165, "#3b403e", 0.9);
  painel(q, -0.18, 0.02, -0.035, 0.145, "#b9c5bc", 0);
  // Teclado: o bloco das teclas e, embaixo, as três de comando, em cinzas.
  painel(q, 0.075, 0.2, -0.055, 0.165, tone(mat.plastico, -0.3), 0.7);
  const linhas: Pt[] = [];
  for (let i = 1; i < 4; i += 1) {
    const v = -0.055 + i * 0.042;
    linhas.push(pt(q, 0.085, v, noPainel(v)), pt(q, 0.19, v, noPainel(v)));
  }
  linhas.push(pt(q, 0.12, -0.05, noPainel(-0.05)), pt(q, 0.12, 0.115, noPainel(0.115)), pt(q, 0.155, -0.05, noPainel(-0.05)), pt(q, 0.155, 0.115, noPainel(0.115)));
  tracos(ctx, linhas, 0.6, 0.55, mat.plastico);
  painel(q, 0.085, 0.19, 0.125, 0.155, tone(mat.plastico, -0.08), 0);
  if (cabine) {
    // A aba da frente, mais curta, para a tela continuar à vista.
    forma(ctx, [pt(q, 0.27, -0.23, 22.5), pt(q, 0.27, 0.04, 22.5), pt(q, 0.27, 0.04, 36), pt(q, 0.27, -0.23, 46)], tomU(q, papelao), DETAIL);
  }
}

// ---------------------------------------------------------------------------
// Placa
// ---------------------------------------------------------------------------

// Folhas presas no quadro: [u0, u1, z0, z1, tom].
const AVISOS: readonly (readonly [number, number, number, number, number])[] = [
  [-0.25, -0.1, 40, 52, 0],
  [-0.06, 0.1, 43, 53, -0.08],
  [0.14, 0.26, 39, 51, -0.03],
  [-0.21, -0.03, 29, 38, -0.05],
  [0.03, 0.2, 29, 40, 0],
];

function quadroDeAvisos(q: Quadro): void {
  const { mat, ctx } = q;
  const v = 0.025;
  sombra(q, 0.68, 0.34);
  caixa(q, -0.3, 0, 0.05, 0.34, 2.5, mat.madeiraEscura, 0, DETAIL);
  caixa(q, 0.3, 0, 0.05, 0.34, 2.5, mat.madeiraEscura, 0, DETAIL);
  caixa(q, -0.3, 0, 0.04, 0.04, 54, mat.madeira, 2.5, DETAIL);
  caixa(q, 0.3, 0, 0.04, 0.04, 54, mat.madeira, 2.5, DETAIL);
  caixa(q, 0, 0, 0.68, 0.05, 32, mat.madeira, 24);
  faceV(q, v, -0.3, 0.3, 26.5, 53.5, tomV(q, mat.feltro), DETAIL, 0.8);
  const riscos: Pt[] = [];
  for (const [u0, u1, z0, z1, tom] of AVISOS) {
    faceV(q, v, u0, u1, z0, z1, tone(mat.papel, tom), 0.6, 0.5);
    bola(ctx, pt(q, (u0 + u1) / 2, v, z1 - 1.2), 0.7, INK);
    for (let z = z1 - 3.4; z > z0 + 1.5; z -= 2.4) riscos.push(pt(q, u0 + 0.025, v, z), pt(q, u1 - 0.03, v, z));
  }
  tracos(ctx, riscos, 0.5, 0.35);
}

// O cavalete de perfil: duas pranchas encostadas no alto.
const PRANCHA_DE_TRAS: readonly Pt[] = [
  [-0.21, 0],
  [-0.17, 0],
  [0.015, 46],
  [-0.025, 46],
];
const PRANCHA_DA_FRENTE: readonly Pt[] = [
  [0.17, 0],
  [0.21, 0],
  [0.025, 46],
  [-0.015, 46],
];
const naPrancha = (z: number): number => 0.21 - z * (0.185 / 46);

function cavalete(q: Quadro): void {
  const { mat, ctx } = q;
  sombra(q, 0.54, 0.42);
  prismaU(q, PRANCHA_DE_TRAS, -0.27, 0.27, mat.madeiraEscura);
  prismaU(q, PRANCHA_DA_FRENTE, -0.27, 0.27, mat.madeira);
  // A folha colada na prancha da frente: um bloco de título e linhas, sem palavra nenhuma.
  forma(ctx, [pt(q, -0.21, naPrancha(12), 12), pt(q, 0.21, naPrancha(12), 12), pt(q, 0.21, naPrancha(41), 41), pt(q, -0.21, naPrancha(41), 41)], mat.papel, DETAIL, 0.7);
  forma(ctx, [pt(q, -0.16, naPrancha(33), 33), pt(q, 0.1, naPrancha(33), 33), pt(q, 0.1, naPrancha(37), 37), pt(q, -0.16, naPrancha(37), 37)], tone(INK, 0.35), 0);
  const riscos: Pt[] = [];
  for (let z = 29; z > 15; z -= 3.4) riscos.push(pt(q, -0.16, naPrancha(z), z), pt(q, z < 19 ? 0.02 : 0.16, naPrancha(z), z));
  tracos(ctx, riscos, 0.6, 0.4);
  // A corrente que segura a abertura, no lado.
  tracos(ctx, [pt(q, 0.27, -0.12, 14), pt(q, 0.27, 0.13, 14)], 0.8, 0.7);
}

/** Placa de pé, sem texto legível: quadro de avisos com folhas presas (variante par) ou cavalete de calçada (ímpar). */
export function placa(q: Quadro): void {
  if (q.variante % 2 === 1) cavalete(q);
  else quadroDeAvisos(q);
}

