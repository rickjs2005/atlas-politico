// Apoio do cenário: medidas das paredes, geometria local da célula e o que
// cada cena tem em volta de uma célula (tapete vizinho, saída), calculado uma
// vez por cena.

import { SCENES } from "@/lib/game/scenes";
import type { ExitSide, SceneId } from "@/lib/game/types";
import { TILE_H, TILE_W } from "@/lib/game/world/iso";

import { INK, tone } from "./kit";

export const HW = TILE_W / 2;
export const HH = TILE_H / 2;

/** Paredes de trás: altura em pixels e espessura em células. */
export const WALL_H = 66;
export const WALL_T = 0.28;
/** Parapeito da frente. */
export const PARAPET_H = 12;
export const PARAPET_T = 0.22;
/** O prédio assenta em uma laje: quanto dela aparece abaixo do piso, do lado de fora. */
export const PLINTH = 5;

/** Ponto da tela de um ponto local da célula: `dx` e `dy` em células, `dz` em pixels para cima. */
export function px(sx: number, dx: number, dy: number): number {
  return sx + (dx - dy) * HW;
}
export function py(sy: number, dx: number, dy: number, dz = 0): number {
  return sy + (dx + dy) * HH - dz;
}

/** Acrescenta ao caminho um retângulo do chão, em células locais. */
export function floorRect(ctx: CanvasRenderingContext2D, sx: number, sy: number, x0: number, y0: number, x1: number, y1: number, dz = 0): void {
  ctx.moveTo(px(sx, x0, y0), py(sy, x0, y0, dz));
  ctx.lineTo(px(sx, x1, y0), py(sy, x1, y0, dz));
  ctx.lineTo(px(sx, x1, y1), py(sy, x1, y1, dz));
  ctx.lineTo(px(sx, x0, y1), py(sy, x0, y1, dz));
  ctx.closePath();
}

/** Acrescenta ao caminho um segmento do chão, em células locais. */
export function floorSeg(ctx: CanvasRenderingContext2D, sx: number, sy: number, x0: number, y0: number, x1: number, y1: number): void {
  ctx.moveTo(px(sx, x0, y0), py(sy, x0, y0));
  ctx.lineTo(px(sx, x1, y1), py(sy, x1, y1));
}

/** Preenche o caminho atual e passa um fio da mesma cor, para não sobrar fresta entre peças vizinhas. */
export function fillSolid(ctx: CanvasRenderingContext2D, cor: string): void {
  ctx.fillStyle = cor;
  ctx.fill();
  ctx.strokeStyle = cor;
  ctx.lineWidth = 0.7;
  ctx.stroke();
}

/** Contorna o caminho atual com tinta. */
export function strokeInk(ctx: CanvasRenderingContext2D, largura: number, alfa = 1, cor: string = INK): void {
  ctx.strokeStyle = cor;
  ctx.lineWidth = largura;
  if (alfa === 1) {
    ctx.stroke();
    return;
  }
  const antes = ctx.globalAlpha;
  ctx.globalAlpha = antes * alfa;
  ctx.stroke();
  ctx.globalAlpha = antes;
}

/** Preenche o caminho atual com a opacidade dada. */
export function fillAlpha(ctx: CanvasRenderingContext2D, cor: string, alfa: number): void {
  const antes = ctx.globalAlpha;
  ctx.globalAlpha = antes * alfa;
  ctx.fillStyle = cor;
  ctx.fill();
  ctx.globalAlpha = antes;
}

/** `tone` com o passo arredondado: quem anima a luz não enche o cache de cores. */
export function shade(hex: string, t: number): string {
  return tone(hex, Math.round(t * 40) / 40);
}

// ---------------------------------------------------------------------------
// O que há em volta de uma célula
// ---------------------------------------------------------------------------

/** Lados de uma célula, como bits: o vizinho em -x, -y, +x e +y. */
export const SIDE = { oeste: 1, norte: 2, leste: 4, sul: 8 } as const;

interface SceneFacts {
  largura: number;
  altura: number;
  /** 1 onde há tapete; a célula da saída conta, para o tapete emendar na soleira. */
  tapete: Uint8Array;
  saida: { x: number; y: number; lado: ExitSide };
}

const facts = new Map<SceneId, SceneFacts>();

function factsOf(cena: SceneId): SceneFacts {
  const prontos = facts.get(cena);
  if (prontos !== undefined) return prontos;
  const scene = SCENES[cena];
  const tapete = new Uint8Array(scene.largura * scene.altura);
  for (const c of scene.tapetes) tapete[c.y * scene.largura + c.x] = 1;
  tapete[scene.saida.y * scene.largura + scene.saida.x] = 1;
  const novos: SceneFacts = { largura: scene.largura, altura: scene.altura, tapete, saida: scene.saida };
  facts.set(cena, novos);
  return novos;
}

function isCarpet(f: SceneFacts, x: number, y: number): boolean {
  if (x < 0 || y < 0 || x >= f.largura || y >= f.altura) return false;
  return f.tapete[y * f.largura + x] === 1;
}

const bordas = new Map<number, number>();

/**
 * Para uma célula de tapete: nos quatro bits baixos, os lados em que o vizinho
 * não é tapete (ali vai a borda); nos quatro seguintes, os cantos em que os
 * dois vizinhos são tapete e o da diagonal não é (ali a borda dobra por dentro),
 * na ordem (-x,-y), (+x,-y), (+x,+y), (-x,+y).
 */
export function carpetEdges(cena: SceneId, x: number, y: number): number {
  const f = factsOf(cena);
  const chave = (SCENE_INDEX[cena] << 16) | ((y & 255) << 8) | (x & 255);
  const pronto = bordas.get(chave);
  if (pronto !== undefined) return pronto;
  const o = isCarpet(f, x - 1, y);
  const n = isCarpet(f, x, y - 1);
  const l = isCarpet(f, x + 1, y);
  const s = isCarpet(f, x, y + 1);
  let bits = (o ? 0 : SIDE.oeste) | (n ? 0 : SIDE.norte) | (l ? 0 : SIDE.leste) | (s ? 0 : SIDE.sul);
  if (o && n && !isCarpet(f, x - 1, y - 1)) bits |= 16;
  if (l && n && !isCarpet(f, x + 1, y - 1)) bits |= 32;
  if (l && s && !isCarpet(f, x + 1, y + 1)) bits |= 64;
  if (o && s && !isCarpet(f, x - 1, y + 1)) bits |= 128;
  bordas.set(chave, bits);
  return bits;
}

/** A célula de chão comum (nem tapete, nem parede, nem saída) existe ali? */
export function isPlainFloor(cena: SceneId, x: number, y: number): boolean {
  const f = factsOf(cena);
  if (x < 1 || y < 1 || x >= f.largura - 1 || y >= f.altura - 1) return false;
  return f.tapete[y * f.largura + x] !== 1;
}

/** A saída da cena. */
export function exitOf(cena: SceneId): { x: number; y: number; lado: ExitSide } {
  return factsOf(cena).saida;
}

/** A posição de cada cena no registro: entra na chave do cache das bordas de tapete. */
export const SCENE_INDEX: Record<SceneId, number> = Object.fromEntries((Object.keys(SCENES) as SceneId[]).map((id, indice) => [id, indice])) as Record<SceneId, number>;
