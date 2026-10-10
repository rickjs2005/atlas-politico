// Sofá de dois lugares, de couro, sobre um casco baixo de madeira: braços
// roliços, encosto em dois gomos, dois assentos com a costura entre eles e o
// brilho do couro. Par: de frente para a câmera; ímpar: de costas, mostrando
// o casco de madeira nas costas. Com `espelhado`, a frente aponta para +x.

import { DETAIL, type Pt } from "./kit";
import { caixa, faceV, plano, prismaU, prismaV, pt, sombra, SUAVE, tomV, tracos, type Quadro } from "./props-base";

// O encosto de frente: largo, com os cantos de cima chanfrados.
const ENCOSTO: readonly Pt[] = [
  [-0.46, 3],
  [0.46, 3],
  [0.46, 27],
  [0.42, 31],
  [-0.42, 31],
  [-0.46, 27],
];
// Os braços, de frente: roliços em cima.
const BRACO_ESQUERDO: readonly Pt[] = [
  [-0.46, 3],
  [-0.34, 3],
  [-0.34, 17],
  [-0.36, 20],
  [-0.44, 20],
  [-0.46, 17],
];
const BRACO_DIREITO: readonly Pt[] = [
  [0.34, 3],
  [0.46, 3],
  [0.46, 17],
  [0.44, 20],
  [0.36, 20],
  [0.34, 17],
];
// O assento de perfil, com a borda da frente arredondada: voltado para +v e para -v.
const ASSENTO_PARA_A_FRENTE: readonly Pt[] = [
  [-0.16, 3],
  [0.28, 3],
  [0.28, 11],
  [0.24, 14.5],
  [-0.16, 14.5],
];
const ASSENTO_PARA_TRAS: readonly Pt[] = [
  [-0.28, 3],
  [0.16, 3],
  [0.16, 14.5],
  [-0.24, 14.5],
  [-0.28, 11],
];

// Os dois gomos do encosto, na face voltada para quem senta.
function gomos(q: Quadro, v: number): void {
  const cor = tomV(q, q.mat.estofado, 0.05);
  faceV(q, v, -0.41, -0.02, 13, 29, cor, DETAIL, SUAVE);
  faceV(q, v, 0.02, 0.41, 13, 29, cor, DETAIL, SUAVE);
}

// A costura entre os assentos, o brilho do couro em cada um e a dobra da frente.
function assentos(q: Quadro, v0: number, v1: number): void {
  const { mat, ctx } = q;
  const frente = v1 > v0 ? v1 : v0;
  const tras = v1 > v0 ? v0 : v1;
  tracos(ctx, [pt(q, 0, tras + 0.01, 14.5), pt(q, 0, frente - 0.05, 14.5)], 0.7, 0.5);
  const brilho = (u: number) => plano(q, u - 0.1, tras + 0.06, u + 0.06, tras + 0.18, 14.6, tomV(q, mat.estofado, 0.2), 0, 0.55);
  brilho(-0.19);
  brilho(0.15);
  // A borda da frente dos assentos, onde o couro dobra.
  const dobra = frente - 0.04;
  tracos(ctx, [pt(q, -0.33, dobra, 14.5), pt(q, 0.33, dobra, 14.5)], 0.6, 0.3);
}

/** Sofá de dois lugares, de couro. Variante par: de frente; ímpar: de costas para a câmera. */
export function sofa(q: Quadro): void {
  const { mat } = q;
  const costas = q.variante % 2 === 1;
  sombra(q, 0.98, 0.6);
  caixa(q, 0, 0, 0.9, 0.54, 3, mat.madeiraEscura);
  if (costas) {
    prismaV(q, BRACO_ESQUERDO, -0.27, 0.16, mat.estofado);
    prismaU(q, ASSENTO_PARA_TRAS, -0.34, 0.34, mat.estofado);
    assentos(q, 0.16, -0.28);
    prismaV(q, BRACO_DIREITO, -0.27, 0.16, mat.estofado);
    prismaV(q, ENCOSTO, 0.16, 0.23, mat.estofado);
    // O casco de madeira nas costas, com um painel rebaixado.
    prismaV(q, ENCOSTO, 0.23, 0.27, mat.madeira);
    faceV(q, 0.27, -0.38, 0.38, 7, 24, tomV(q, mat.madeira, -0.1), DETAIL, SUAVE);
    tracos(q.ctx, [pt(q, 0, 0.27, 7.5), pt(q, 0, 0.27, 23.5)], 0.6, 0.3);
    return;
  }
  prismaV(q, ENCOSTO, -0.27, -0.23, mat.madeira);
  prismaV(q, ENCOSTO, -0.23, -0.16, mat.estofado);
  gomos(q, -0.16);
  prismaV(q, BRACO_ESQUERDO, -0.16, 0.27, mat.estofado);
  prismaU(q, ASSENTO_PARA_A_FRENTE, -0.34, 0.34, mat.estofado);
  assentos(q, -0.16, 0.28);
  prismaV(q, BRACO_DIREITO, -0.16, 0.27, mat.estofado);
}
