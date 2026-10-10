// Base comum da arte do jogo: tinta, luz e as primitivas isométricas que os
// personagens, os cenários e os objetos usam. É o que mantém o traço igual em
// tudo (docs/GAMEPLAY.md, seção Direção visual).
//
// Convenções:
//   - escala 1: uma célula tem 64 por 32 pixels (world/iso.ts);
//   - a luz vem do alto, à esquerda da tela: o topo é o mais claro, a face
//     voltada para baixo e para a esquerda (normal +y do mundo) é média, e a
//     voltada para baixo e para a direita (normal +x) é a mais escura;
//   - contorno fino em grafite, com cantos arredondados;
//   - sombra elíptica no chão, sem desfoque.

import { TILE_H, TILE_W } from "@/lib/game/world/iso";

/** Grafite do atlas: o contorno de tudo. */
export const INK = "#1b1c1a";
/** Espessura do contorno, na escala 1. */
export const OUTLINE = 1.2;
/** Contorno interno, de detalhe. */
export const DETAIL = 0.8;
export const SHADOW = "rgba(27, 28, 26, 0.16)";
/** O acento do atlas: só para o que está ao alcance ou selecionado. */
export const ACCENT = "#b24a00";
export const ACCENT_SOFT = "#f8e4cf";
export const PAPER = "#fbf9f4";

const HW = TILE_W / 2;
const HH = TILE_H / 2;

/** Quanto cada face clareia ou escurece em relação à cor de base. */
export const LIGHT = { topo: 0.1, esquerda: -0.04, direita: -0.16 } as const;

const tones = new Map<string, string>();

/**
 * A cor `#rrggbb` mais clara (`t` positivo, em direção ao branco) ou mais
 * escura (`t` negativo, em direção ao grafite). `t` de -1 a 1. Com cache: pode
 * ser chamada a cada quadro.
 */
export function tone(hex: string, t: number): string {
  if (t === 0) return hex;
  const chave = `${hex}|${t}`;
  const pronta = tones.get(chave);
  if (pronta !== undefined) return pronta;
  const n = Number.parseInt(hex.slice(1), 16);
  const alvo = t > 0 ? [255, 252, 244] : [27, 28, 26];
  const k = Math.min(1, Math.abs(t));
  const canais = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c, i) => Math.round(c + (alvo[i]! - c) * k));
  const cor = `#${canais.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
  tones.set(chave, cor);
  return cor;
}

/**
 * Deslocamento na tela de um ponto local: `dx` e `dy` em células, nos eixos do
 * mundo (x desce para a direita, y desce para a esquerda), e `dz` em pixels
 * para cima.
 */
export function iso(dx: number, dy: number, dz = 0): { x: number; y: number } {
  return { x: (dx - dy) * HW, y: (dx + dy) * HH - dz };
}

export type Pt = readonly [number, number];

/** Traça um polígono fechado. Quem chama preenche e contorna. */
export function trace(ctx: CanvasRenderingContext2D, pontos: readonly Pt[]): void {
  ctx.beginPath();
  pontos.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  ctx.closePath();
}

/** Polígono preenchido, com contorno em grafite quando `contorno` não é zero. */
export function poly(ctx: CanvasRenderingContext2D, pontos: readonly Pt[], cor: string, contorno: number = OUTLINE): void {
  trace(ctx, pontos);
  ctx.fillStyle = cor;
  ctx.fill();
  if (contorno > 0) {
    ctx.lineWidth = contorno;
    ctx.strokeStyle = INK;
    ctx.lineJoin = "round";
    ctx.stroke();
  }
}

/** Sombra elíptica no chão, com o centro em (`sx`, `sy`). */
export function groundShadow(ctx: CanvasRenderingContext2D, sx: number, sy: number, rx: number, ry: number = rx / 2, cor: string = SHADOW): void {
  ctx.fillStyle = cor;
  ctx.beginPath();
  ctx.ellipse(sx, sy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

export interface BoxOptions {
  /** Elevação da base, em pixels acima do chão. */
  z?: number;
  /** Espessura do contorno; 0 para não contornar. */
  contorno?: number;
  /** Cores das faces, quando não são as derivadas da cor de base. */
  topo?: string;
  esquerda?: string;
  direita?: string;
  /** Deslocamento do centro da caixa, em células, dentro da célula. */
  ox?: number;
  oy?: number;
}

/**
 * Caixa isométrica com a base centrada em (`sx`, `sy`) no chão. `w` é a
 * largura no eixo x do mundo e `d` a profundidade no eixo y, em células; `h`
 * é a altura em pixels. Desenha as três faces visíveis, com a luz do atlas.
 * Devolve os quatro cantos do topo, para quem quiser desenhar por cima.
 */
export function isoBox(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  w: number,
  d: number,
  h: number,
  cor: string,
  opcoes: BoxOptions = {},
): { tras: Pt; direita: Pt; frente: Pt; esquerda: Pt } {
  const { z = 0, contorno = OUTLINE, ox = 0, oy = 0 } = opcoes;
  const canto = (dx: number, dy: number, dz: number): Pt => {
    const p = iso(ox + dx, oy + dy, z + dz);
    return [sx + p.x, sy + p.y];
  };
  const a = w / 2;
  const b = d / 2;
  // Cantos da base e do topo: trás (-x,-y), direita (+x,-y), frente (+x,+y), esquerda (-x,+y).
  const direitaBase = canto(a, -b, 0);
  const frenteBase = canto(a, b, 0);
  const esquerdaBase = canto(-a, b, 0);
  const tras = canto(-a, -b, h);
  const direita = canto(a, -b, h);
  const frente = canto(a, b, h);
  const esquerda = canto(-a, b, h);

  poly(ctx, [esquerda, frente, frenteBase, esquerdaBase], opcoes.esquerda ?? tone(cor, LIGHT.esquerda), contorno);
  poly(ctx, [frente, direita, direitaBase, frenteBase], opcoes.direita ?? tone(cor, LIGHT.direita), contorno);
  poly(ctx, [tras, direita, frente, esquerda], opcoes.topo ?? tone(cor, LIGHT.topo), contorno);
  return { tras, direita, frente, esquerda };
}

/** O losango de uma célula de chão, com o centro em (`sx`, `sy`). */
export function tileDiamond(sx: number, sy: number, dz = 0): Pt[] {
  return [
    [sx, sy - HH - dz],
    [sx + HW, sy - dz],
    [sx, sy + HH - dz],
    [sx - HW, sy - dz],
  ];
}

/** Linha de detalhe em grafite, com a opacidade dada. */
export function line(ctx: CanvasRenderingContext2D, pontos: readonly Pt[], largura: number = DETAIL, cor: string = INK, alfa = 1): void {
  ctx.save();
  ctx.globalAlpha *= alfa;
  ctx.beginPath();
  pontos.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  ctx.lineWidth = largura;
  ctx.strokeStyle = cor;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();
  ctx.restore();
}

/** Número pseudoaleatório estável de 0 a 1 para uma célula: textura que não pisca. */
export function cellNoise(x: number, y: number, semente = 0): number {
  const n = Math.sin(x * 127.1 + y * 311.7 + semente * 74.7) * 43758.5453;
  return n - Math.floor(n);
}
