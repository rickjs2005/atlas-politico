// Móveis: mesa, mesa central, cadeira, bancada, banco, poltrona e tribuna.
//
// Nos que têm frente e costas (cadeira, bancada, poltrona, tribuna), a
// variante ímpar mostra o móvel de costas para a câmera. Com `espelhado`, são
// as quatro direções: a composição da sala decide para onde cada um olha.

import { cellNoise, DETAIL, INK, tone, type Pt } from "./kit";
import { bola, brilho, caixa, faceU, faceV, fio, folha, forma, plano, prismaU, prismaV, pt, sombra, SUAVE, tomT, tomU, tomV, tracos, veios, type Quadro } from "./props-base";

const deCostas = (q: Quadro): boolean => (q.variante & 1) === 1;

// ---------------------------------------------------------------------------
// Mesa de trabalho
// ---------------------------------------------------------------------------

// Duas linhas curtas sobre uma folha: escrita que não se lê.
function escrita(q: Quadro, u: number, v: number, z: number, giro: number): void {
  const c = Math.cos(giro) * 0.06;
  const s = Math.sin(giro) * 0.06;
  const nu = -Math.sin(giro) * 0.045;
  const nv = Math.cos(giro) * 0.045;
  tracos(q.ctx, [pt(q, u - c - nu, v - s - nv, z), pt(q, u + c - nu, v + s - nv, z), pt(q, u - c + nu, v - s + nv, z), pt(q, u + c * 0.4 + nu, v + s * 0.4 + nv, z)], 0.6, 0.38);
}

function sobreAMesa(q: Quadro, z: number): void {
  const { mat } = q;
  switch (q.variante % 3) {
    case 0:
      // Papéis: uma pilha, uma folha solta e a caneta.
      folha(q, -0.21, -0.02, 0.21, 0.28, 0.16, z, tone(mat.papel, -0.1));
      folha(q, -0.2, -0.03, 0.21, 0.28, -0.05, z, mat.papel);
      escrita(q, -0.2, -0.03, z, -0.05 + Math.PI / 2);
      folha(q, 0.16, 0.07, 0.19, 0.25, 0.55, z, mat.papel);
      tracos(q.ctx, [pt(q, 0.0, 0.15, z), pt(q, 0.07, 0.21, z)], 1.3, 0.9);
      break;
    case 1:
      // Uma pasta fechada, com uma folha saindo, e uma folha ao lado.
      folha(q, -0.12, 0.02, 0.2, 0.27, 0.34, z, mat.papel);
      folha(q, -0.16, -0.01, 0.27, 0.33, 0.1, z, mat.pardo, DETAIL, 0.8);
      tracos(q.ctx, [pt(q, -0.27, 0.05, z), pt(q, -0.06, 0.07, z)], 0.7, 0.35);
      folha(q, 0.2, 0.06, 0.17, 0.23, -0.22, z, mat.papel);
      escrita(q, 0.2, 0.06, z, -0.22 + Math.PI / 2);
      break;
    default:
      // A pasta aberta: as duas capas e uma folha em cada lado.
      folha(q, -0.07, 0, 0.5, 0.34, 0.04, z, mat.pardo, DETAIL, 0.8);
      folha(q, -0.19, 0, 0.2, 0.28, 0.04, z, mat.papel);
      folha(q, 0.05, 0.01, 0.2, 0.28, 0.1, z, mat.papel);
      tracos(q.ctx, [pt(q, -0.07, -0.17, z), pt(q, -0.06, 0.17, z)], 0.8, 0.5);
      escrita(q, -0.19, 0, z, 0.04 + Math.PI / 2);
      tracos(q.ctx, [pt(q, 0.25, 0.12, z), pt(q, 0.33, 0.17, z)], 1.3, 0.9);
  }
}

/** Mesa de trabalho: tampo, gaveteiro de um lado e apoio do outro. A variante troca o que está em cima. */
export function mesa(q: Quadro): void {
  const { mat } = q;
  const deAco = q.info.cena === "sindicato";
  const corpo = deAco ? mat.aco : mat.madeira;
  sombra(q, 0.86, 0.56);

  // Painel do fundo, na sombra do tampo.
  caixa(q, -0.13, -0.21, 0.44, 0.03, 14, tone(corpo, -0.14), 8, DETAIL);
  // O lado sem gavetas: pés de aço no sindicato, painel de madeira nas outras cenas.
  if (deAco) {
    caixa(q, -0.37, -0.2, 0.045, 0.045, 23, mat.ferro, 0, DETAIL);
    caixa(q, -0.37, 0.2, 0.045, 0.045, 23, mat.ferro, 0, DETAIL);
  } else {
    caixa(q, -0.37, 0, 0.05, 0.46, 23, mat.madeiraEscura);
  }
  // Gaveteiro, com as gavetas voltadas para quem senta.
  caixa(q, 0.23, 0, 0.3, 0.46, 23, corpo);
  for (let i = 0; i < 3; i += 1) {
    const z = 2.5 + i * 6.8;
    faceV(q, 0.23, 0.11, 0.35, z, z + 5.2, tomV(q, corpo, 0.07), DETAIL, SUAVE);
  }
  tracos(q.ctx, [pt(q, 0.19, 0.23, 5.3), pt(q, 0.27, 0.23, 5.3), pt(q, 0.19, 0.23, 12.1), pt(q, 0.27, 0.23, 12.1), pt(q, 0.19, 0.23, 18.9), pt(q, 0.27, 0.23, 18.9)], 1.2, 0.9);

  caixa(q, 0, 0, 0.86, 0.56, 3, mat.tampo, 23);
  brilho(q, -0.43, -0.28, 0.43, 0.28, 26);
  veios(q, -0.43, -0.28, 0.43, 0.28, 26);
  sobreAMesa(q, 26);
}

// ---------------------------------------------------------------------------
// Mesa central
// ---------------------------------------------------------------------------

const ALMOFADAS_DA_MESA = [-0.38, -0.12, 0.14] as const;

// Campainha de mesa: a que abre e encerra a sessão.
function campainha(q: Quadro, u: number, v: number, z: number): void {
  const { ctx } = q;
  const [x, y] = pt(q, u, v, z);
  ctx.beginPath();
  ctx.ellipse(x, y, 3.6, 1.8, 0, 0, Math.PI * 2);
  ctx.fillStyle = tone(q.mat.latao, -0.25);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - 3, y - 0.4);
  ctx.bezierCurveTo(x - 3, y - 5.6, x + 3, y - 5.6, x + 3, y - 0.4);
  ctx.closePath();
  ctx.fillStyle = q.mat.latao;
  ctx.fill();
  ctx.lineWidth = DETAIL;
  ctx.strokeStyle = INK;
  ctx.stroke();
  bola(ctx, [x, y - 5], 1, tone(q.mat.latao, -0.3));
}

function mesaDiretora(q: Quadro): void {
  const { mat } = q;
  sombra(q, 0.94, 0.6);
  caixa(q, 0, -0.02, 0.86, 0.5, 3, mat.madeiraEscura);
  caixa(q, 0, -0.02, 0.82, 0.46, 20, mat.madeira, 3);
  // Almofadas na frente e no lado: a mesa é fechada até o chão.
  for (const u0 of ALMOFADAS_DA_MESA) faceV(q, 0.21, u0, u0 + 0.24, 7, 20, tomV(q, mat.madeira, -0.1), DETAIL, SUAVE);
  faceU(q, 0.41, -0.2, 0.16, 7, 20, tomU(q, mat.madeira, -0.1), DETAIL, SUAVE);
  caixa(q, 0, 0, 0.94, 0.6, 3, mat.tampo, 23);
  brilho(q, -0.47, -0.3, 0.47, 0.3, 26);
  // Forro no centro, com a folha da ordem do dia; pastas de um lado, campainha do outro.
  plano(q, -0.17, -0.16, 0.17, 0.14, 26, tomT(mat.feltro), DETAIL, SUAVE);
  folha(q, 0, -0.01, 0.19, 0.22, 0.12, 26, mat.papel);
  caixa(q, -0.32, -0.04, 0.16, 0.26, 4, mat.pardo, 26, DETAIL);
  campainha(q, 0.32, 0, 26);
}

function mesaDeReuniao(q: Quadro): void {
  const { mat } = q;
  sombra(q, 0.94, 0.6);
  caixa(q, -0.38, -0.22, 0.07, 0.07, 20, mat.madeiraEscura, 0, DETAIL);
  caixa(q, 0.38, -0.22, 0.07, 0.07, 20, mat.madeiraEscura, 0, DETAIL);
  caixa(q, -0.38, 0.22, 0.07, 0.07, 20, mat.madeiraEscura, 0, DETAIL);
  caixa(q, 0.38, 0.22, 0.07, 0.07, 20, mat.madeiraEscura, 0, DETAIL);
  caixa(q, 0, 0, 0.84, 0.5, 4, mat.madeira, 19);
  caixa(q, 0, 0, 0.94, 0.6, 3, mat.tampo, 23);
  brilho(q, -0.47, -0.3, 0.47, 0.3, 26);
  veios(q, -0.47, -0.3, 0.47, 0.3, 26);
  // Um lugar de cada lado e as pastas no meio.
  folha(q, -0.3, 0.12, 0.17, 0.22, 0.2, 26, mat.papel);
  folha(q, 0.28, -0.12, 0.17, 0.22, -0.15, 26, mat.papel);
  folha(q, 0.26, 0.14, 0.17, 0.22, 0.5, 26, mat.papel);
  folha(q, -0.05, -0.02, 0.25, 0.32, 0.3, 26, mat.pardo, DETAIL, 0.8);
  caixa(q, -0.06, -0.03, 0.2, 0.27, 2.5, mat.pardo, 26.5, DETAIL);
  tracos(q.ctx, [pt(q, -0.34, -0.14, 26), pt(q, -0.26, -0.08, 26)], 1.3, 0.9);
}

/** Mesa maior: a da Mesa diretora, fechada e com campainha (variante par), ou a de reunião, de pés à mostra (ímpar). */
export function mesaCentral(q: Quadro): void {
  if (q.variante % 2 === 1) mesaDeReuniao(q);
  else mesaDiretora(q);
}

// ---------------------------------------------------------------------------
// Cadeira
// ---------------------------------------------------------------------------

function encostoDaCadeira(q: Quadro, v: number, pe: string, costas: boolean): void {
  const { mat } = q;
  caixa(q, -0.17, v, 0.045, 0.045, 23, pe, 0, DETAIL);
  caixa(q, 0.17, v, 0.045, 0.045, 23, pe, 0, DETAIL);
  caixa(q, 0, v, 0.42, 0.05, 14, mat.madeira, 23);
  if (q.mat.desgaste >= 0.5) tracos(q.ctx, [pt(q, -0.2, v + 0.025, 30), pt(q, 0.2, v + 0.025, 30)], DETAIL, SUAVE);
  else if (!costas) faceV(q, v + 0.025, -0.16, 0.16, 25.5, 35, tomV(q, mat.estofado), DETAIL, SUAVE);
}

function pernasDaCadeira(q: Quadro, v: number, pe: string): void {
  caixa(q, -0.17, v, 0.045, 0.045, 16, pe, 0, DETAIL);
  caixa(q, 0.17, v, 0.045, 0.045, 16, pe, 0, DETAIL);
}

function assentoDaCadeira(q: Quadro, v: number): void {
  const { mat } = q;
  caixa(q, 0, v, 0.42, 0.42, 3, mat.madeira, 15);
  if (mat.desgaste >= 0.5) tracos(q.ctx, [pt(q, -0.21, v, 18), pt(q, 0.21, v, 18)], DETAIL, SUAVE);
  else caixa(q, 0, v, 0.35, 0.35, 2, mat.estofado, 18, DETAIL);
}

/** Cadeira simples: de ferro e madeira no sindicato, de madeira com assento forrado nas outras cenas. */
export function cadeira(q: Quadro): void {
  const costas = deCostas(q);
  const s = costas ? -1 : 1;
  const pe = q.info.cena === "sindicato" ? q.mat.ferro : q.mat.madeiraEscura;
  sombra(q, 0.44, 0.44);
  if (costas) {
    pernasDaCadeira(q, 0.17 * s, pe);
    assentoDaCadeira(q, -0.01 * s);
    encostoDaCadeira(q, -0.19 * s, pe, true);
  } else {
    encostoDaCadeira(q, -0.19 * s, pe, false);
    pernasDaCadeira(q, 0.17 * s, pe);
    assentoDaCadeira(q, -0.01 * s);
  }
}

// ---------------------------------------------------------------------------
// Bancada de plenário
// ---------------------------------------------------------------------------

const ALMOFADAS_DA_BANCADA = [-0.37, 0.03] as const;

function encostoDaBancada(q: Quadro, v: number, costas: boolean): void {
  const { mat } = q;
  caixa(q, 0, v, 0.8, 0.06, 31, mat.madeira);
  caixa(q, 0, v, 0.84, 0.09, 2.5, mat.tampo, 31);
  if (costas) {
    // As costas do banco: duas almofadas de madeira.
    for (const u0 of ALMOFADAS_DA_BANCADA) faceV(q, v + 0.03, u0, u0 + 0.34, 5, 27, tomV(q, mat.madeira, -0.1), DETAIL, SUAVE);
  } else if (mat.desgaste < 0.5) {
    faceV(q, v + 0.03, -0.36, 0.36, 17, 29, tomV(q, mat.estofado), DETAIL, SUAVE);
  }
}

function assentoDaBancada(q: Quadro, v: number): void {
  const { mat } = q;
  caixa(q, 0, v, 0.78, 0.32, 13, mat.madeiraEscura);
  if (mat.desgaste < 0.5) caixa(q, 0, v, 0.74, 0.28, 2.5, mat.estofado, 13, DETAIL);
}

function tampoDaBancada(q: Quadro, s: number, costas: boolean): void {
  const { mat } = q;
  const v = 0.25 * s;
  caixa(q, 0, 0.3 * s, 0.82, 0.05, 25, mat.madeira);
  if (!costas) for (const u0 of ALMOFADAS_DA_BANCADA) faceV(q, 0.325, u0, u0 + 0.34, 5, 21, tomV(q, mat.madeira, -0.1), DETAIL, SUAVE);
  caixa(q, 0, v, 0.88, 0.2, 2.5, mat.tampo, 25);
  brilho(q, -0.44, v - 0.1, 0.44, v + 0.1, 27.5);
  // O que cada lugar deixou no tampo muda de célula para célula, sempre igual para a mesma.
  const sorte = cellNoise(q.info.x, q.info.y, 3);
  if (sorte > 0.35) folha(q, sorte > 0.7 ? -0.2 : 0.16, v, 0.15, 0.14, sorte * 2, 27.5, mat.papel);
  if (q.info.cena === "senado") {
    // Microfone de mesa: uma haste fina e a cápsula.
    const u = sorte > 0.5 ? 0.24 : -0.24;
    fio(q.ctx, [pt(q, u, v, 27.5), pt(q, u, v, 33), pt(q, u, v - 0.05 * s, 36)], 1, 0.9);
    bola(q.ctx, pt(q, u, v - 0.05 * s, 36), 1.3, INK);
  }
}

/** Banco de plenário de madeira, com encosto e um tampo estreito diante de quem senta. */
export function bancada(q: Quadro): void {
  const costas = deCostas(q);
  const s = costas ? -1 : 1;
  sombra(q, 0.88, 0.7);
  if (costas) {
    tampoDaBancada(q, s, true);
    assentoDaBancada(q, -0.07 * s);
    encostoDaBancada(q, -0.3 * s, true);
  } else {
    encostoDaBancada(q, -0.3 * s, false);
    assentoDaBancada(q, -0.07 * s);
    tampoDaBancada(q, s, false);
  }
}

// ---------------------------------------------------------------------------
// Banco
// ---------------------------------------------------------------------------

/** Banco simples de madeira, sem encosto: duas tábuas sobre dois pés e uma travessa. */
export function banco(q: Quadro): void {
  const { mat } = q;
  sombra(q, 0.86, 0.32);
  caixa(q, -0.31, 0, 0.05, 0.26, 14, mat.madeira);
  caixa(q, 0, 0, 0.6, 0.04, 3, mat.madeiraEscura, 6, DETAIL);
  caixa(q, 0.31, 0, 0.05, 0.26, 14, mat.madeira);
  caixa(q, 0, 0, 0.86, 0.32, 3, mat.tampo, 14);
  tracos(q.ctx, [pt(q, -0.43, 0, 17), pt(q, 0.43, 0, 17)], DETAIL, SUAVE);
  veios(q, -0.43, -0.16, 0.43, 0.16, 17);
  const prego = tone(mat.madeiraEscura, -0.3);
  bola(q.ctx, pt(q, -0.31, -0.08, 17), 0.7, prego);
  bola(q.ctx, pt(q, -0.31, 0.08, 17), 0.7, prego);
  bola(q.ctx, pt(q, 0.31, -0.08, 17), 0.7, prego);
  bola(q.ctx, pt(q, 0.31, 0.08, 17), 0.7, prego);
}

// ---------------------------------------------------------------------------
// Poltrona
// ---------------------------------------------------------------------------

// O encosto visto de frente: alto, com os cantos de cima chanfrados.
const ENCOSTO_DA_POLTRONA: readonly Pt[] = [
  [-0.3, 3],
  [0.3, 3],
  [0.3, 33],
  [0.24, 39],
  [-0.24, 39],
  [-0.3, 33],
];
// Os braços, de frente: roliços em cima.
const BRACO_ESQUERDO: readonly Pt[] = [
  [-0.33, 3],
  [-0.2, 3],
  [-0.2, 18],
  [-0.225, 21],
  [-0.305, 21],
  [-0.33, 18],
];
const BRACO_DIREITO: readonly Pt[] = [
  [0.2, 3],
  [0.33, 3],
  [0.33, 18],
  [0.305, 21],
  [0.225, 21],
  [0.2, 18],
];
// O assento de perfil, com a borda da frente arredondada: voltado para +v e para -v.
const ASSENTO_PARA_A_FRENTE: readonly Pt[] = [
  [-0.19, 3],
  [0.27, 3],
  [0.27, 11],
  [0.23, 14.5],
  [-0.19, 14.5],
];
const ASSENTO_PARA_TRAS: readonly Pt[] = [
  [-0.27, 3],
  [0.19, 3],
  [0.19, 14.5],
  [-0.23, 14.5],
  [-0.27, 11],
];

/** Poltrona estofada de plenário: casco de madeira, braços roliços e encosto alto. */
export function poltrona(q: Quadro): void {
  const { mat } = q;
  sombra(q, 0.66, 0.62);
  caixa(q, 0, 0, 0.6, 0.56, 3, mat.madeiraEscura);
  if (deCostas(q)) {
    prismaV(q, BRACO_ESQUERDO, -0.27, 0.19, mat.estofado);
    prismaU(q, ASSENTO_PARA_TRAS, -0.2, 0.2, mat.estofado);
    prismaV(q, BRACO_DIREITO, -0.27, 0.19, mat.estofado);
    prismaV(q, ENCOSTO_DA_POLTRONA, 0.19, 0.26, mat.estofado);
    // O casco de madeira, com a almofada rebaixada nas costas.
    prismaV(q, ENCOSTO_DA_POLTRONA, 0.26, 0.31, mat.madeira);
    faceV(q, 0.31, -0.21, 0.21, 8, 31, tomV(q, mat.madeira, -0.1), DETAIL, SUAVE);
  } else {
    prismaV(q, ENCOSTO_DA_POLTRONA, -0.31, -0.26, mat.madeira);
    prismaV(q, ENCOSTO_DA_POLTRONA, -0.26, -0.19, mat.estofado);
    // A costura do encosto, em gomos.
    tracos(q.ctx, [pt(q, -0.1, -0.19, 16), pt(q, -0.1, -0.19, 37), pt(q, 0.1, -0.19, 16), pt(q, 0.1, -0.19, 37)], DETAIL, 0.4);
    prismaV(q, BRACO_ESQUERDO, -0.19, 0.27, mat.estofado);
    prismaU(q, ASSENTO_PARA_A_FRENTE, -0.2, 0.2, mat.estofado);
    prismaV(q, BRACO_DIREITO, -0.19, 0.27, mat.estofado);
  }
}

// ---------------------------------------------------------------------------
// Tribuna
// ---------------------------------------------------------------------------

// O tampo inclinado, de perfil: alto do lado da plateia, baixo do lado de quem fala.
const TAMPO_PARA_A_PLATEIA: readonly Pt[] = [
  [-0.25, 39],
  [0.25, 39],
  [0.25, 49.5],
  [-0.25, 41.5],
];
const TAMPO_PARA_O_ORADOR: readonly Pt[] = [
  [-0.25, 39],
  [0.25, 39],
  [0.25, 41.5],
  [-0.25, 49.5],
];

/** Tribuna: púlpito de madeira com o tampo inclinado. De frente mostra a almofada; de costas, o nicho e a folha do orador. */
export function tribuna(q: Quadro): void {
  const { mat } = q;
  const costas = deCostas(q);
  sombra(q, 0.58, 0.48);
  caixa(q, 0, 0, 0.58, 0.48, 3, mat.madeiraEscura);
  caixa(q, 0, 0, 0.46, 0.36, 36, mat.madeira, 3);
  if (costas) {
    // O nicho de quem fala: uma prateleira com papéis.
    faceV(q, 0.18, -0.17, 0.17, 12, 35, tomV(q, mat.madeiraEscura, -0.3), DETAIL, 0.8);
    faceV(q, 0.18, -0.17, 0.17, 22, 24, tomV(q, mat.tampo), DETAIL, SUAVE);
    faceV(q, 0.18, -0.11, 0.03, 24, 26.4, mat.papel, DETAIL, SUAVE);
  } else if (mat.desgaste >= 0.5) {
    // Madeira crua: tábuas em pé.
    tracos(q.ctx, [pt(q, -0.08, 0.18, 4), pt(q, -0.08, 0.18, 38), pt(q, 0.08, 0.18, 4), pt(q, 0.08, 0.18, 38)], DETAIL, SUAVE);
  } else {
    faceV(q, 0.18, -0.17, 0.17, 8, 34, tomV(q, mat.madeira, -0.1), DETAIL, SUAVE);
  }
  if (mat.desgaste < 0.5) faceU(q, 0.23, -0.12, 0.12, 8, 34, tomU(q, mat.madeira, -0.1), DETAIL, SUAVE);
  prismaU(q, costas ? TAMPO_PARA_O_ORADOR : TAMPO_PARA_A_PLATEIA, -0.3, 0.3, mat.tampo);
  if (costas) {
    // A folha do discurso, deitada no tampo, e a régua que a segura.
    forma(q.ctx, [pt(q, -0.16, -0.15, 48.2), pt(q, 0.08, -0.15, 48.2), pt(q, 0.08, 0.15, 43.4), pt(q, -0.16, 0.15, 43.4)], mat.papel, DETAIL, SUAVE);
    tracos(q.ctx, [pt(q, -0.11, -0.07, 46.9), pt(q, 0.03, -0.07, 46.9), pt(q, -0.11, 0.01, 45.6), pt(q, 0.03, 0.01, 45.6), pt(q, -0.11, 0.09, 44.4), pt(q, -0.02, 0.09, 44.4)], 0.6, 0.38);
    tracos(q.ctx, [pt(q, -0.3, 0.22, 42.2), pt(q, 0.3, 0.22, 42.2)], 1, 0.6);
  }
  if (q.info.cena !== "sindicato") {
    // Fora do sindicato, o microfone é o da própria tribuna.
    const v = costas ? -0.16 : 0.1;
    const ponta = costas ? -0.06 : 0.02;
    const z = costas ? 48.2 : 47;
    fio(q.ctx, [pt(q, 0.17, v, z), pt(q, 0.17, v, z + 7), pt(q, 0.17, ponta, z + 11)], 1.1, 0.9);
    bola(q.ctx, pt(q, 0.17, ponta, z + 11), 1.6, INK);
  }
}
