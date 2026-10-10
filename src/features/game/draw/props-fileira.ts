// Fileira: três assentos estofados ligados por um trilho, como os bancos de
// público de uma sala de audiências, de uma comissão ou de um auditório. Par:
// de frente para a câmera; ímpar: de costas. O estofado é o do ambiente; o
// trilho, os pés, os braços e a régua do alto do encosto são de ferro nos
// ambientes frios e de madeira escura nos outros.

import { DETAIL, OUTLINE, tone } from "./kit";
import { caixa, haste, pt, sombra, tracos, type Quadro } from "./props-base";

const LUGARES = [-0.31, 0, 0.31] as const;
/** Os braços: nas duas pontas e entre os assentos. */
const BRACOS = [-0.465, -0.155, 0.155, 0.465] as const;

export function fileira(q: Quadro): void {
  const { mat, ctx } = q;
  const costas = q.variante % 2 === 1;
  const armacao = mat.frio ? mat.ferro : mat.madeiraEscura;
  const couro = mat.estofado;
  sombra(q, 0.96, 0.5);

  // Pés em L nas duas pontas, com a sapata no chão, e o trilho que liga tudo.
  for (const u of [-0.42, 0.42]) {
    haste(ctx, [pt(q, u, -0.16, 0), pt(q, u, 0.2, 0)], 1.6, armacao);
    haste(ctx, [pt(q, u, -0.13, 0), pt(q, u, -0.13, 9)], 1.8, armacao);
    haste(ctx, [pt(q, u, 0.17, 0), pt(q, u, 0.17, 9)], 1.8, armacao);
  }
  haste(ctx, [pt(q, -0.46, 0.02, 8), pt(q, 0.46, 0.02, 8)], 2.4, armacao);

  // O encosto fica atrás dos assentos: de frente, em -v, desenhado antes; de costas, em +v, depois.
  const vEncosto = costas ? 0.2 : -0.15;
  const encosto = () => {
    for (const u of LUGARES) caixa(q, u, vEncosto, 0.27, 0.07, 19, tone(couro, -0.05), 11, OUTLINE, tone(couro, 0.02));
    // A régua que une os três encostos e a costura de cada um.
    caixa(q, 0, vEncosto, 0.9, 0.08, 2, armacao, 30, DETAIL);
    const vFace = vEncosto + 0.035;
    tracos(
      ctx,
      LUGARES.flatMap((u) => [pt(q, u - 0.1, vFace, 21), pt(q, u + 0.1, vFace, 21)]),
      DETAIL,
      0.32,
    );
  };
  if (!costas) encosto();

  // Assentos: a almofada, com a borda da frente mais clara, e os braços.
  for (const u of LUGARES) {
    caixa(q, u, 0.03, 0.27, 0.3, 9, couro, 10, OUTLINE, tone(couro, 0.08));
    tracos(ctx, [pt(q, u - 0.12, 0.17, 18.2), pt(q, u + 0.12, 0.17, 18.2)], DETAIL, 0.3);
  }
  for (const u of BRACOS) caixa(q, u, 0.0, 0.035, 0.24, 2.4, armacao, 19.5, DETAIL);

  if (costas) encosto();
}
