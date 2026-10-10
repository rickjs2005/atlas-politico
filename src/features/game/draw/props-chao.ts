// Detalhes de chão, que não bloqueiam: o personagem passa por cima, e por
// isso são desenhados rentes ao piso, sem volume e sem sombra.
//
// Pela variante: 0 faixa pintada, 1 folhas de papel caídas, 2 mancha de luz
// de janela, 3 capacho ou tapete pequeno.

import { cellNoise, DETAIL, iso, SHADOW, tone, type Pt } from "./kit";
import { folha, plano, pt, SUAVE, tracos, type Quadro } from "./props-base";

// Faixa ao longo de `u`, de borda a borda da célula: emenda com a da célula vizinha.
function faixa(q: Quadro): void {
  const { ctx } = q;
  const meia = 0.065;
  const antes = ctx.globalAlpha;
  if (q.info.cena === "sindicato") {
    // Tinta velha no concreto: três trechos, com falhas onde ela saiu.
    const r = cellNoise(q.info.x, q.info.y, 11);
    const g1 = -0.24 + r * 0.16;
    const g2 = 0.14 + cellNoise(q.info.y, q.info.x, 12) * 0.18;
    ctx.globalAlpha = antes * 0.7;
    ctx.beginPath();
    for (const [a0, a1, b1, b0] of [
      [-0.5, g1, g1 - 0.03, -0.5],
      [g1 + 0.045, g2, g2 + 0.03, g1 + 0.012],
      [g2 + 0.05, 0.5, 0.5, g2 + 0.085],
    ] as const) {
      const p = [pt(q, a0, -meia), pt(q, a1, -meia), pt(q, b1, meia), pt(q, b0, meia)] as const;
      ctx.moveTo(p[0][0], p[0][1]);
      for (let i = 1; i < 4; i += 1) ctx.lineTo(p[i]![0], p[i]![1]);
      ctx.closePath();
    }
    ctx.fillStyle = "#ece6d6";
    ctx.fill();
  } else {
    // Friso embutido no piso, mais escuro, com os dois filetes.
    ctx.globalAlpha = antes * 0.8;
    plano(q, -0.5, -meia, 0.5, meia, 0, tone(q.paleta.chao, -0.26), 0);
    ctx.globalAlpha = antes;
    tracos(ctx, [pt(q, -0.5, -meia), pt(q, 0.5, -meia), pt(q, -0.5, meia), pt(q, 0.5, meia)], 0.7, 0.3);
  }
  ctx.globalAlpha = antes;
}

// Folhas caídas: [u, v, giro]. Duas arrumações, sorteadas pela célula.
const QUEDAS: readonly (readonly (readonly [number, number, number])[])[] = [
  [
    [-0.17, -0.08, 0.5],
    [0.13, 0.11, -0.35],
    [0.15, -0.2, 1.25],
  ],
  [
    [0.16, -0.06, -0.6],
    [-0.14, 0.1, 0.3],
    [-0.02, -0.22, 1.9],
  ],
];

function papeis(q: Quadro): void {
  const { mat } = q;
  const queda = QUEDAS[cellNoise(q.info.x, q.info.y, 13) > 0.5 ? 1 : 0]!;
  queda.forEach(([u, v, giro], i) => {
    folha(q, u + 0.018, v + 0.018, 0.2, 0.27, giro, 0, SHADOW, 0);
    folha(q, u, v, 0.2, 0.27, giro, 0, i === 2 ? tone(mat.papel, -0.07) : mat.papel, DETAIL, SUAVE);
    if (i === 2) return;
    // Linhas de escrita, ao comprido da folha, que não se leem.
    const c = -Math.sin(giro);
    const s = Math.cos(giro);
    const n = 0.05;
    tracos(
      q.ctx,
      [
        pt(q, u - c * 0.07 - s * n, v - s * 0.07 + c * n),
        pt(q, u + c * 0.07 - s * n, v + s * 0.07 + c * n),
        pt(q, u - c * 0.07, v - s * 0.07),
        pt(q, u + c * 0.07, v + s * 0.07),
        pt(q, u - c * 0.07 + s * n, v - s * 0.07 - c * n),
        pt(q, u + c * 0.02 + s * n, v + s * 0.02 - c * n),
      ],
      0.6,
      0.32,
    );
  });
}

// A luz do atlas vem da esquerda da tela: a janela está na parede oeste e a
// mancha se estende em x, escorregando para -y; espelhada, a janela está na
// parede sul (a que a câmera corta) e a mancha se estende em -y, escorregando
// para +x. Nos dois casos a luz anda na mesma direção.
function luz(q: Quadro): void {
  const { ctx } = q;
  const frio = q.info.cena === "senado";
  const antes = ctx.globalAlpha;
  ctx.globalAlpha = antes * (frio ? 0.4 : 0.34);
  ctx.beginPath();
  for (let i = 0; i < 2; i += 1) {
    for (let j = 0; j < 2; j += 1) {
      // `a` corre ao longo da luz e `b` ao longo da parede.
      const a0 = -0.44 + i * 0.46;
      const a1 = a0 + 0.42;
      const b0 = -0.36 + j * 0.38;
      const b1 = b0 + 0.34;
      const canto = (a: number, b: number): Pt => {
        const d = (a + 0.44) * 0.34;
        const p = q.m ? iso(b + d - 0.14, -a) : iso(a, b - d + 0.14);
        return [q.sx + p.x, q.sy + p.y];
      };
      const p0 = canto(a0, b0);
      const p1 = canto(a1, b0);
      const p2 = canto(a1, b1);
      const p3 = canto(a0, b1);
      ctx.moveTo(p0[0], p0[1]);
      ctx.lineTo(p1[0], p1[1]);
      ctx.lineTo(p2[0], p2[1]);
      ctx.lineTo(p3[0], p3[1]);
      ctx.closePath();
    }
  }
  ctx.fillStyle = frio ? "#f6f8f2" : "#fff3d0";
  ctx.fill();
  ctx.globalAlpha = antes;
}

function capacho(q: Quadro): void {
  const { ctx } = q;
  const cor = tone(q.paleta.tapete, -0.12);
  // Franja nas duas pontas.
  const franja: Pt[] = [];
  for (let i = 0; i < 7; i += 1) {
    const v = -0.2 + i * (0.4 / 6);
    franja.push(pt(q, -0.36, v), pt(q, -0.41, v), pt(q, 0.36, v), pt(q, 0.41, v));
  }
  tracos(ctx, franja, 0.9, 0.55, tone(q.paleta.tapete, 0.35));
  plano(q, -0.36, -0.23, 0.36, 0.23, 0, cor, DETAIL, 0.6);
  plano(q, -0.3, -0.17, 0.3, 0.17, 0, tone(q.paleta.tapete, 0.08), 0.6, 0.35);
  plano(q, -0.2, -0.08, 0.2, 0.08, 0, cor, 0.6, 0.3);
}

/** Detalhe de chão, pela variante: faixa pintada, folhas caídas, luz de janela ou capacho. */
export function decoracao(q: Quadro): void {
  switch (q.variante % 4) {
    case 0:
      faixa(q);
      break;
    case 1:
      papeis(q);
      break;
    case 2:
      luz(q);
      break;
    default:
      capacho(q);
  }
}
