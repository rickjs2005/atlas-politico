// Projeção isométrica 2:1. O mundo é uma grade de células; o eixo x do mundo
// desce para a direita na tela, e o eixo y desce para a esquerda.
//
//   tela: sx = (x - y) · TILE_W/2
//         sy = (x + y) · TILE_H/2
//
// Os controles são relativos à tela (seta para cima leva para cima na tela),
// e por isso a intenção é convertida para os eixos do mundo aqui.

import type { Facing, InputState } from "../types";

export const TILE_W = 64;
export const TILE_H = 32;

/** Altura do personagem em pixels, na escala 1. */
export const CHARACTER_HEIGHT = 68;

export interface ScreenPoint {
  sx: number;
  sy: number;
}

/** Centro da célula ou ponto contínuo do mundo, em pixels de tela (escala 1, sem câmera). */
export function toScreen(x: number, y: number): ScreenPoint {
  return { sx: ((x - y) * TILE_W) / 2, sy: ((x + y) * TILE_H) / 2 };
}

/** O ponto do mundo sob um ponto de tela (escala 1, sem câmera). */
export function toWorld(sx: number, sy: number): { x: number; y: number } {
  const a = sx / (TILE_W / 2);
  const b = sy / (TILE_H / 2);
  return { x: (a + b) / 2, y: (b - a) / 2 };
}

const INV_SQRT2 = Math.SQRT1_2;

/**
 * Intenção em eixos de tela (dx para a direita, dy para baixo) convertida em
 * um vetor unitário nos eixos do mundo. Tela para cima é (-1, -1) no mundo;
 * tela para a direita é (+1, -1).
 */
export function inputToWorld(input: InputState): { x: number; y: number } {
  const { dx, dy } = input;
  if (dx === 0 && dy === 0) return { x: 0, y: 0 };
  // Base: direita = (1, -1)/√2, baixo = (1, 1)/√2.
  const x = (dx + dy) * INV_SQRT2;
  const y = (dy - dx) * INV_SQRT2;
  const comprimento = Math.hypot(x, y);
  return { x: x / comprimento, y: y / comprimento };
}

/** Para onde o personagem olha, dado o vetor de movimento no mundo. */
export function facingOf(vx: number, vy: number, atual: Facing): Facing {
  if (vx === 0 && vy === 0) return atual;
  if (Math.abs(vx) >= Math.abs(vy)) return vx > 0 ? "frente-direita" : "costas-esquerda";
  return vy > 0 ? "frente-esquerda" : "costas-direita";
}

/** O personagem está de frente para a câmera? */
export function isFront(facing: Facing): boolean {
  return facing === "frente-direita" || facing === "frente-esquerda";
}

/** O desenho é espelhado (olhando para a esquerda da tela)? */
export function isMirrored(facing: Facing): boolean {
  return facing === "frente-esquerda" || facing === "costas-esquerda";
}
