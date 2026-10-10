// Peças do salão: coluna, bandeira, planta, máquina e microfone de pedestal.
//
// A bandeira e a planta são as únicas que se mexem, e só de leve: com
// movimento reduzido o quadro chega com o tempo em zero e elas ficam paradas.

import { DETAIL, groundShadow, INK, OUTLINE, poly, tone, type Pt } from "./kit";
import { bola, caixa, disco, elipse, faceU, faceV, haste, noDisco, plano, pt, sombra, SUAVE, tomU, tomV, tracos, tronco, type Quadro } from "./props-base";

// ---------------------------------------------------------------------------
// Coluna
// ---------------------------------------------------------------------------

// No sindicato não há coluna de pedra: é um pilar de reboco com o barrado pintado.
function pilar(q: Quadro): void {
  const { mat } = q;
  sombra(q, 0.46, 0.46);
  caixa(q, 0, 0, 0.46, 0.46, 5, tone(mat.pedra, -0.12));
  caixa(q, 0, 0, 0.36, 0.36, 61, mat.pedra, 5);
  faceV(q, 0.18, -0.18, 0.18, 5, 30, tomV(q, mat.aco), DETAIL, 0.7);
  faceU(q, 0.18, -0.18, 0.18, 5, 30, tomU(q, mat.aco), DETAIL, 0.7);
  caixa(q, 0, 0, 0.46, 0.46, 5, mat.pedra, 66);
}

/** Coluna alta e clara, com base e capitel: lisa na Constituinte, canelada na Assembleia, com anel de metal no Senado. */
export function coluna(q: Quadro): void {
  const { mat, ctx } = q;
  const { cena } = q.info;
  if (cena === "sindicato") {
    pilar(q);
    return;
  }
  sombra(q, 0.52, 0.52);
  caixa(q, 0, 0, 0.52, 0.52, 4, mat.pedra);
  tronco(q, 0, 0, 10.5, 10, 3, mat.pedra, 4);
  tronco(q, 0, 0, 8.6, 7.4, 55, mat.pedra, 7);
  const [x, y] = pt(q, 0, 0);
  if (cena === "alerj") {
    // Caneluras: riscos em pé, mais juntos para a borda.
    tracos(
      ctx,
      [
        [x - 5.6, y - 10],
        [x - 5, y - 61],
        [x - 2.2, y - 11.6],
        [x - 1.9, y - 62],
        [x + 1.6, y - 11.8],
        [x + 1.4, y - 62],
        [x + 5.2, y - 10.4],
        [x + 4.6, y - 61.4],
      ],
      0.7,
      0.28,
    );
  }
  tronco(q, 0, 0, 8, 8, 2, cena === "senado" ? mat.latao : mat.pedra, 62);
  tronco(q, 0, 0, 7.6, 11, 4.5, mat.pedra, 64);
  caixa(q, 0, 0, 0.54, 0.54, 4.5, mat.pedra, 68.5);
}

// ---------------------------------------------------------------------------
// Bandeira
// ---------------------------------------------------------------------------

// O pano, do alto do mastro até a barra. `s` é o lado para onde cai e `b` o balanço da barra.
function pano(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, b: number): void {
  ctx.beginPath();
  ctx.moveTo(x + s * 1.1, y - 72);
  ctx.quadraticCurveTo(x + s * 8.5, y - 71.5, x + s * 15, y - 63.5);
  ctx.quadraticCurveTo(x + s * 18.6 + b * 0.4, y - 55, x + s * 16 + b * 0.7, y - 45);
  ctx.quadraticCurveTo(x + s * 15.4 + b, y - 35.5, x + s * 12 + b, y - 29.5);
  ctx.quadraticCurveTo(x + s * 9.4 + b, y - 29, x + s * 7 + b * 0.8, y - 34);
  ctx.quadraticCurveTo(x + s * 4 + b * 0.5, y - 39.5, x + s * 1.1, y - 37.5);
  ctx.closePath();
}

/** Mastro com base e uma bandeira lisa, em cinza neutro, sem símbolo. A variante só muda o tom do cinza. */
export function bandeira(q: Quadro): void {
  const { mat, ctx } = q;
  const s = q.m ? -1 : 1;
  const [x, y] = pt(q, 0, 0);
  const variante = q.variante % 3;
  const cor = variante === 1 ? tone(mat.pano, -0.2) : variante === 2 ? tone(mat.pano, 0.22) : mat.pano;
  const rustica = q.mat.rustico;
  const base = rustica ? mat.ferro : mat.pedra;
  // O pano balança devagar na barra de baixo; cada bandeira no seu tempo.
  const b = q.movimento ? Math.sin(q.tempo * 1.1 + q.info.x * 1.7 + q.info.y) * 1.5 : 0;

  groundShadow(ctx, x + 1.5, y + 1.5, 12);
  tronco(q, 0, 0, 9, 8.4, 2.5, base);
  tronco(q, 0, 0, 4.6, 2.4, 5, base, 2.5);
  const topo = y - 75;
  poly(
    ctx,
    [
      [x - 1.1, y - 7],
      [x + 1.1, y - 7],
      [x + 1.1, topo],
      [x - 1.1, topo],
    ],
    rustica ? mat.madeira : mat.latao,
    DETAIL,
  );

  pano(ctx, x, y, s, b);
  ctx.fillStyle = tone(cor, q.lv);
  ctx.fill();
  // A dobra do meio, na sombra.
  ctx.beginPath();
  ctx.moveTo(x + s * 5, y - 70.6);
  ctx.quadraticCurveTo(x + s * 9, y - 52, x + s * 7.4 + b * 0.8, y - 34);
  ctx.quadraticCurveTo(x + s * 9.6 + b, y - 29.2, x + s * 12 + b, y - 29.5);
  ctx.quadraticCurveTo(x + s * 14.4, y - 50, x + s * 10.4, y - 67.6);
  ctx.closePath();
  ctx.fillStyle = tone(cor, q.lv - 0.11);
  ctx.fill();
  pano(ctx, x, y, s, b);
  ctx.lineWidth = OUTLINE;
  ctx.strokeStyle = INK;
  ctx.lineJoin = "round";
  ctx.stroke();
  // As pregas, do alto até a barra.
  const antes = ctx.globalAlpha;
  ctx.globalAlpha = antes * SUAVE;
  ctx.beginPath();
  ctx.moveTo(x + s * 5, y - 70.6);
  ctx.quadraticCurveTo(x + s * 9, y - 52, x + s * 7.4 + b * 0.8, y - 34.6);
  ctx.moveTo(x + s * 10.4, y - 67.6);
  ctx.quadraticCurveTo(x + s * 14.4, y - 50, x + s * 12 + b, y - 30.4);
  ctx.lineWidth = DETAIL;
  ctx.stroke();
  ctx.globalAlpha = antes;

  bola(ctx, [x, topo - 1.6], 2.3, rustica ? mat.ferro : mat.latao, DETAIL);
}

// ---------------------------------------------------------------------------
// Planta
// ---------------------------------------------------------------------------

// Folhas largas, de trás para a frente: [ângulo em graus (90 = para cima), comprimento, largura, camada].
const FOLHAS: readonly (readonly [number, number, number, number])[] = [
  [96, 31, 11, 0],
  [128, 27, 10, 0],
  [60, 27, 10, 0],
  [158, 23, 9.5, 1],
  [24, 23, 9.5, 1],
  [110, 23, 9, 1],
  [74, 22, 9, 1],
  [192, 17, 8, 2],
  [-10, 17, 8, 2],
  [142, 15, 7.5, 2],
  [40, 15, 7.5, 2],
];
const TONS_DA_FOLHA = [-0.2, -0.04, 0.12] as const;
// Cada folha já com a direção calculada: [cos, -sen, peso que a faz pender].
const DIRECOES = FOLHAS.map(([graus, comprimento]) => {
  const a = (graus * Math.PI) / 180;
  return [Math.cos(a), -Math.sin(a), (1 - Math.abs(Math.sin(a))) * comprimento * 0.22] as const;
});

function folhagem(q: Quadro, x: number, y: number): void {
  const { ctx, mat } = q;
  ctx.lineWidth = DETAIL;
  ctx.strokeStyle = INK;
  ctx.lineJoin = "round";
  for (let i = 0; i < FOLHAS.length; i += 1) {
    const [, comprimento, largura, camada] = FOLHAS[i]!;
    const [dx, dy, peso] = DIRECOES[i]!;
    // As folhas de lado pendem com o peso; todas balançam um pouco na ponta.
    const vento = q.movimento ? Math.sin(q.tempo * 0.9 + i * 1.3 + q.info.x) * 1.1 : 0;
    const bx = x + dx * comprimento * 0.2;
    const by = y + dy * comprimento * 0.2;
    const px = x + dx * comprimento + vento;
    const py = y + dy * comprimento + peso;
    const mx = x + dx * comprimento * 0.55 + vento * 0.4;
    const my = y + dy * comprimento * 0.55 + peso * 0.3;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.quadraticCurveTo(mx - dy * largura, my + dx * largura, px, py);
    ctx.quadraticCurveTo(mx + dy * largura, my - dx * largura, bx, by);
    ctx.fillStyle = tone(mat.folha, TONS_DA_FOLHA[camada]!);
    ctx.fill();
    ctx.stroke();
    // O talo e a nervura.
    const antes = ctx.globalAlpha;
    ctx.globalAlpha = antes * 0.4;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(bx, by);
    ctx.quadraticCurveTo(mx, my, px, py);
    ctx.stroke();
    ctx.globalAlpha = antes;
  }
}

/** Vaso com planta de folhas largas. O vaso muda com a cena: lata, cerâmica, pedra ou cachepô escuro. */
export function planta(q: Quadro): void {
  const { mat, ctx } = q;
  const { cena } = q.info;
  const [x, y] = pt(q, 0, 0);
  groundShadow(ctx, x + 1.5, y + 1.5, 15);
  const terra = tone(INK, 0.16);
  let boca = y - 14;
  if (cena === "alerj" || cena === "senado") {
    // Cachepô quadrado: de pedra na Assembleia, escuro no Senado.
    caixa(q, 0, 0, 0.44, 0.44, 3, tone(mat.vaso, -0.15));
    caixa(q, 0, 0, 0.4, 0.4, 13, mat.vaso, 3);
    plano(q, -0.16, -0.16, 0.16, 0.16, 16, terra, DETAIL, 0.7);
    boca = y - 16;
  } else if (cena === "sindicato") {
    // Uma lata reaproveitada, com os frisos.
    tronco(q, 0, 0, 9, 9, 14, mat.aco, 0, OUTLINE, terra);
    tracos(
      ctx,
      [
        [x - 8.6, y - 4.4],
        [x - 3, y - 0.6],
        [x - 8.6, y - 9.4],
        [x - 3, y - 5.6],
      ],
      0.7,
      0.3,
    );
  } else {
    tronco(q, 0, 0, 7.5, 6.5, 2, tone(mat.vaso, -0.12));
    tronco(q, 0, 0, 6.5, 10, 12, mat.vaso, 2, OUTLINE, terra);
  }
  folhagem(q, x, boca);
}

// ---------------------------------------------------------------------------
// Máquina
// ---------------------------------------------------------------------------

// Volante: aro na cor dada, miolo escuro, raios e cubo.
function volante(q: Quadro, eixo: "u" | "v", u: number, v: number, z: number, r: number, cor: string): void {
  const { ctx, mat } = q;
  disco(q, eixo, u, v, z, r, cor);
  disco(q, eixo, u, v, z, r * 0.7, eixo === "u" ? tomU(q, mat.maquina, -0.25) : tomV(q, mat.maquina, -0.25), DETAIL);
  tracos(
    ctx,
    [
      noDisco(q, eixo, u, v, z, r * 0.7, 0.5),
      noDisco(q, eixo, u, v, z, r * 0.7, 0.5 + Math.PI),
      noDisco(q, eixo, u, v, z, r * 0.7, 0.5 + Math.PI / 2),
      noDisco(q, eixo, u, v, z, r * 0.7, 0.5 - Math.PI / 2),
    ],
    1.1,
    1,
    cor,
  );
  disco(q, eixo, u, v, z, r * 0.24, mat.cromo, DETAIL);
}

// Torno mecânico: barramento comprido sobre dois pés, cabeçote alto com a placa e a
// peça presa, carro baixo com o volante e contraponto pequeno na outra ponta.
function torno(q: Quadro): void {
  const { mat, ctx } = q;
  sombra(q, 0.92, 0.32);
  caixa(q, -0.29, 0, 0.3, 0.3, 11, mat.maquina);
  caixa(q, 0.35, 0, 0.16, 0.3, 11, mat.maquina);
  // O barramento, com as guias de aço polido.
  caixa(q, 0.01, 0, 0.92, 0.24, 6, mat.maquina, 11, OUTLINE, tone(mat.cromo, -0.08));
  tracos(ctx, [pt(q, -0.1, -0.035, 17), pt(q, 0.47, -0.035, 17), pt(q, -0.1, 0.045, 17), pt(q, 0.47, 0.045, 17)], 0.7, 0.4);

  // Cabeçote, com a placa de castanhas voltada para o barramento.
  caixa(q, -0.28, 0, 0.34, 0.32, 20, mat.maquina, 17);
  disco(q, "u", -0.1, 0, 26.5, 0.16, mat.ferro);
  disco(q, "u", -0.065, 0, 26.5, 0.16, mat.cromo);
  tracos(
    ctx,
    [
      noDisco(q, "u", -0.065, 0, 26.5, 0.06, 1.57),
      noDisco(q, "u", -0.065, 0, 26.5, 0.15, 1.57),
      noDisco(q, "u", -0.065, 0, 26.5, 0.06, 3.66),
      noDisco(q, "u", -0.065, 0, 26.5, 0.15, 3.66),
      noDisco(q, "u", -0.065, 0, 26.5, 0.06, 5.76),
      noDisco(q, "u", -0.065, 0, 26.5, 0.15, 5.76),
    ],
    0.8,
    0.5,
  );
  // O mostrador, a plaqueta sem nada escrito e a alavanca do câmbio.
  bola(ctx, pt(q, -0.36, 0.16, 31), 1.8, mat.cromo, DETAIL);
  faceV(q, 0.16, -0.3, -0.16, 28.5, 33, mat.latao, 0.6, 0.6);
  haste(ctx, [pt(q, -0.32, 0.06, 37), pt(q, -0.4, 0.16, 46)], 1.4, mat.ferro);
  bola(ctx, pt(q, -0.4, 0.16, 46), 2.2, tone(INK, 0.1), DETAIL);

  // O carro, baixo, com o porta-ferramenta; o volante fica na frente do barramento.
  caixa(q, 0.14, 0.01, 0.13, 0.28, 3, mat.maquina, 17);
  caixa(q, 0.14, -0.04, 0.06, 0.06, 4, mat.ferro, 20, DETAIL);
  volante(q, "v", 0.14, 0.13, 12, 0.105, mat.cromo);
  // A peça, da placa ao contraponto.
  haste(ctx, [pt(q, -0.05, 0, 26.5), pt(q, 0.34, 0, 26.5)], 2.4, mat.cromo);
  caixa(q, 0.38, 0, 0.12, 0.16, 11.5, mat.maquina, 17);
}

// Prensa excêntrica: corpo em C, mesa, martelo e o volante grande de lado.
function prensa(q: Quadro): void {
  const { mat, ctx } = q;
  sombra(q, 0.66, 0.56);
  caixa(q, 0, 0, 0.66, 0.56, 3, mat.ferro);
  caixa(q, 0, 0, 0.6, 0.5, 13, mat.maquina, 3);
  caixa(q, 0, 0.05, 0.46, 0.34, 3, mat.cromo, 16);
  // A coluna de trás e, na sombra da cabeça, o martelo com o punção.
  caixa(q, 0, -0.17, 0.42, 0.16, 24, mat.maquina, 16);
  caixa(q, 0, 0.06, 0.07, 0.07, 6, mat.ferro, 24, DETAIL);
  caixa(q, 0, 0.06, 0.18, 0.16, 9, mat.cromo, 30);
  caixa(q, 0, -0.04, 0.46, 0.42, 13, mat.maquina, 38);
  // Plaqueta sem nada escrito e a alavanca de acionamento.
  faceV(q, 0.17, -0.12, 0.02, 43, 47.5, mat.latao, 0.6, 0.6);
  haste(ctx, [pt(q, -0.16, 0.17, 44), pt(q, -0.3, 0.3, 58)], 1.6, mat.ferro);
  bola(ctx, pt(q, -0.3, 0.3, 58), 2.4, tone(INK, 0.1), DETAIL);
  // O volante, no eixo que atravessa a cabeça.
  disco(q, "u", 0.25, -0.08, 45, 0.27, tone(mat.ferro, -0.2));
  volante(q, "u", 0.3, -0.08, 45, 0.27, mat.ferro);
}

/** Máquina da oficina, com volante e alavanca: a prensa (variante par) ou o torno mecânico (ímpar). */
export function maquina(q: Quadro): void {
  if (q.variante % 2 === 1) torno(q);
  else prensa(q);
}

// ---------------------------------------------------------------------------
// Microfone
// ---------------------------------------------------------------------------

/** Pedestal com microfone, de frente para a plateia; na variante ímpar, visto pelo lado de quem fala. */
export function microfone(q: Quadro): void {
  const { mat, ctx } = q;
  const s = (q.variante & 1) === 1 ? -1 : 1;
  const [x, y] = pt(q, 0, 0);
  groundShadow(ctx, x + 1.5, y + 1.5, 10);
  // O cabo, solto no chão.
  const [cx, cy] = pt(q, -0.3, 0.28 * s);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(x - 6, y + 5 * s, cx + 10, cy - 6 * s, cx, cy);
  ctx.lineWidth = 1.3;
  ctx.strokeStyle = tone(INK, 0.1);
  ctx.lineCap = "round";
  ctx.stroke();

  tronco(q, 0, 0, 7.5, 7, 2, mat.ferro);
  tronco(q, 0, 0, 2.6, 1.6, 3, mat.ferro, 2);
  const pe: Pt = [x, y - 4];
  const alto: Pt = [x, y - 52];
  haste(ctx, [pe, alto], 1.5, mat.cromo);
  // A trava da altura.
  poly(
    ctx,
    [
      [x - 1.8, y - 30],
      [x + 1.8, y - 30],
      [x + 1.8, y - 26],
      [x - 1.8, y - 26],
    ],
    mat.ferro,
    DETAIL,
  );
  // O microfone aponta para a boca de quem fala, atrás do pedestal.
  const ponta = pt(q, 0, -0.14 * s, 60);
  haste(ctx, [alto, ponta], 3, mat.ferro);
  elipse(ctx, ponta[0], ponta[1], 3.4, 3.4, mat.cromo, DETAIL);
  tracos(
    ctx,
    [
      [ponta[0] - 2.6, ponta[1] - 0.6],
      [ponta[0] + 2.6, ponta[1] - 0.6],
      [ponta[0] - 2.2, ponta[1] + 1.4],
      [ponta[0] + 2.2, ponta[1] + 1.4],
    ],
    0.6,
    0.45,
  );
}
