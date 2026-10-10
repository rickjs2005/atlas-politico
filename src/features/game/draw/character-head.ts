// A cabeça dos personagens: uma sequência comum de desenho (orelha, rosto,
// barba, boca, nariz, olhos, sobrancelhas, cabelo), com as formas de cada um
// guardadas como dado em character-faces.ts. Os dois personagens jogáveis
// passam pelas mesmas etapas, com o mesmo traço.
//
// A origem é o centro da cabeça. De frente o rosto fica deslocado para a
// direita, que é para onde o personagem olha; de costas vê-se a nuca, a
// orelha de perto e um fio do maxilar.

import { INK, OUTLINE, PAPER } from "./kit";
import { curve, dot, flat, litShape, shape, stroke, trace, type Shape } from "./character-ink";

export interface HeadPaints {
  pele: string;
  peleSombra: string;
  /** Lábio e o corado do rosto. */
  rubor: string;
  cabelo: string;
  cabeloSombra: string;
  /** Os fios desenhados sobre o cabelo e a linha em que ele encontra a pele. */
  fio: string;
  barba: string;
  barbaSombra: string;
  sobrancelha: string;
}

/**
 * Uma mancha da cabeça (cabelo, barba): o caminho cheio e, à parte, o trecho
 * do contorno que fica por dentro da silhueta, onde encontra a pele. O de fora
 * recebe o contorno de grafite da silhueta; o de dentro, um traço mais fino.
 */
export interface Patch {
  cheio: Shape;
  dentro: Shape;
}

/** `fora` vai do começo ao fim pelo lado de fora; `dentro` continua do fim e volta ao começo. */
export function patch(fora: string, dentro: string): Patch {
  const n = shape(fora).numeros;
  return {
    cheio: shape(`${fora} ${dentro} Z`),
    dentro: shape(`M ${n[n.length - 2]} ${n[n.length - 1]} ${dentro}`),
  };
}

export interface FrontHead {
  /** Cabelo que aparece por trás do rosto, do lado de longe. */
  mecha: Shape | null;
  orelha: Shape;
  /** A dobra de dentro da orelha. */
  orelhaDobra: Shape;
  /** O contorno do rosto, com a ponta do nariz. */
  rosto: Shape;
  /** Rugas e marcas de expressão, em traço leve. */
  marcas: readonly Shape[];
  /** Corado da bochecha de perto: centro e raios. */
  corado: readonly [number, number, number, number] | null;
  barba: Patch | null;
  /** A pele em volta da boca, quando a barba é rente e deixa os lábios à mostra. */
  labios: Shape | null;
  bigode: Shape | null;
  boca: Shape;
  labioDeBaixo: Shape;
  /** A asa do nariz, por dentro do rosto. */
  narina: Shape;
  /** Centro do olho de perto e do olho de longe. */
  olhos: readonly [number, number, number, number];
  sobrancelhas: readonly [Shape, Shape];
  cabelo: Patch;
  fios: readonly Shape[];
  oculos: boolean;
}

export interface BackHead {
  nuca: Shape;
  orelha: Shape;
  /** O fio de barba que aparece no maxilar. */
  barba: Shape | null;
  cabelo: Patch;
  fios: readonly Shape[];
  /** Onde o cabelo é mais ralo, no alto da cabeça. */
  coroa: Shape | null;
}

export interface HeadSpec {
  tintas: HeadPaints;
  frente: FrontHead;
  costas: BackHead;
  /** Espessura do traço das sobrancelhas. */
  sobrancelha: number;
  /** A barba cheia ganha volume e contorno próprios; a rente fica dentro do contorno do rosto. */
  barbaCheia: boolean;
  /** Quanto a barba cobre a pele: a rente deixa a pele aparecer um pouco. */
  barbaAlfa: number;
}

/** Contorno da silhueta: um traço largo por baixo, do qual sobra só a metade de fora. */
function halo(g: CanvasRenderingContext2D, s: Shape): void {
  trace(g, s);
  g.lineWidth = OUTLINE * 2;
  g.strokeStyle = INK;
  g.stroke();
}

function eye(g: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, piscar: number): void {
  if (piscar > 0.6) {
    curve(g, x - rx - 0.3, y + 0.2, x, y + 0.7, x + rx + 0.3, y + 0.2, 0.7, INK);
    return;
  }
  dot(g, x, y + piscar * 0.5, rx, ry * (1 - piscar), INK);
  if (piscar === 0) dot(g, x - rx * 0.35, y - ry * 0.4, 0.3, 0.3, PAPER);
}

function glasses(g: CanvasRenderingContext2D, olhos: readonly [number, number, number, number]): void {
  const [xp, yp, xl, yl] = olhos;
  g.lineWidth = 0.75;
  g.strokeStyle = INK;
  g.fillStyle = "rgba(251, 249, 244, 0.34)";
  g.beginPath();
  g.ellipse(xp, yp + 0.1, 2.6, 2.6, 0, 0, Math.PI * 2);
  g.fill();
  g.stroke();
  g.beginPath();
  g.ellipse(xl, yl + 0.1, 1.95, 2.5, 0, 0, Math.PI * 2);
  g.fill();
  g.stroke();
  // Ponte e haste.
  curve(g, xp + 2.55, yp - 0.4, (xp + xl) / 2 + 0.3, yp - 1, xl - 1.85, yl - 0.4, 0.75, INK);
  curve(g, xp - 2.55, yp - 0.5, xp - 3.6, yp - 0.9, xp - 4.6, yp - 0.8, 0.75, INK);
}

function drawFront(g: CanvasRenderingContext2D, h: HeadSpec, lado: number, piscar: number): void {
  const f = h.frente;
  const t = h.tintas;

  // Primeiro a silhueta inteira, em grafite, por baixo de tudo.
  if (f.mecha !== null) halo(g, f.mecha);
  halo(g, f.orelha);
  halo(g, f.rosto);
  if (f.barba !== null && h.barbaCheia) halo(g, f.barba.cheio);
  halo(g, f.cabelo.cheio);

  if (f.mecha !== null) flat(g, f.mecha, t.cabeloSombra);
  litShape(g, f.rosto, t.pele, t.peleSombra, lado, 0, 1.3, 0.8);
  flat(g, f.orelha, t.pele, 0.7);
  stroke(g, f.orelhaDobra, 0.6, INK, 0.55);
  if (f.corado !== null) {
    const antes = g.globalAlpha;
    g.globalAlpha = antes * 0.3;
    dot(g, f.corado[0], f.corado[1], f.corado[2], f.corado[3], t.rubor);
    g.globalAlpha = antes;
  }
  for (let i = 0; i < f.marcas.length; i += 1) stroke(g, f.marcas[i]!, 0.5, INK, 0.3);

  if (f.barba !== null) {
    const antes = g.globalAlpha;
    g.globalAlpha = antes * h.barbaAlfa;
    litShape(g, f.barba.cheio, t.barba, t.barbaSombra, lado, 0, 1.2, 0.8);
    g.globalAlpha = antes;
    if (h.barbaCheia) stroke(g, f.barba.dentro, 0.6, t.fio, 0.9);
  }
  if (f.labios !== null) flat(g, f.labios, t.pele);
  stroke(g, f.labioDeBaixo, 0.9, t.rubor, 0.9);
  stroke(g, f.boca, 0.75, INK);
  if (f.bigode !== null) flat(g, f.bigode, t.barba, 0.5, t.fio);
  stroke(g, f.narina, 0.7, INK, 0.85);

  eye(g, f.olhos[0], f.olhos[1], 0.8, 1, piscar);
  eye(g, f.olhos[2], f.olhos[3], 0.68, 0.96, piscar);
  if (f.oculos) glasses(g, f.olhos);
  stroke(g, f.sobrancelhas[0], h.sobrancelha, t.sobrancelha);
  stroke(g, f.sobrancelhas[1], h.sobrancelha * 0.92, t.sobrancelha);

  litShape(g, f.cabelo.cheio, t.cabelo, t.cabeloSombra, lado, 0, 1.5, 1);
  stroke(g, f.cabelo.dentro, 0.7, t.fio);
  for (let i = 0; i < f.fios.length; i += 1) stroke(g, f.fios[i]!, 0.55, t.fio, 0.75);
}

function drawBack(g: CanvasRenderingContext2D, h: HeadSpec, lado: number): void {
  const c = h.costas;
  const t = h.tintas;

  halo(g, c.nuca);
  halo(g, c.orelha);
  if (c.barba !== null && h.barbaCheia) halo(g, c.barba);
  halo(g, c.cabelo.cheio);

  litShape(g, c.nuca, t.pele, t.peleSombra, lado, 0, 1.3, 0.8);
  if (c.barba !== null) {
    const antes = g.globalAlpha;
    g.globalAlpha = antes * h.barbaAlfa;
    flat(g, c.barba, t.barba);
    g.globalAlpha = antes;
  }
  flat(g, c.orelha, t.pele, 0.7);
  litShape(g, c.cabelo.cheio, t.cabelo, t.cabeloSombra, lado, 0, 1.6, 1);
  stroke(g, c.cabelo.dentro, 0.7, t.fio);
  if (c.coroa !== null) {
    const antes = g.globalAlpha;
    g.globalAlpha = antes * 0.22;
    flat(g, c.coroa, t.pele);
    g.globalAlpha = antes;
  }
  for (let i = 0; i < c.fios.length; i += 1) stroke(g, c.fios[i]!, 0.55, t.fio, 0.75);
}

/** Desenha a cabeça com o centro na origem. `piscar` vai de 0 (olho aberto) a 1 (fechado). */
export function drawHead(g: CanvasRenderingContext2D, h: HeadSpec, frente: boolean, lado: number, piscar: number): void {
  if (frente) drawFront(g, h, lado, piscar);
  else drawBack(g, h, lado);
}
