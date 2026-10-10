// Base dos elementos de cenário (draw/props.ts): o quadro local de um objeto,
// os materiais de cada arte de ambiente e as formas que o kit não tem (prisma,
// tronco, disco em pé, sombra alongada).
//
// Um objeto é desenhado em eixos próprios: `u` é a largura e `v` a
// profundidade, em células, com a frente em +v; `z` é a altura, em pixels.
// Sem espelhar, `u` corre no eixo x do mundo e `v` no eixo y; espelhado,
// trocam. As faces são sombreadas pelo eixo do mundo para onde ficam
// voltadas: o objeto vira e a luz fica onde estava.

import type { SceneArtId, ScenePalette } from "@/lib/game/types";
import { TILE_H, TILE_W } from "@/lib/game/world/iso";

import { ARTS } from "./arts";
import { DETAIL, INK, LIGHT, OUTLINE, SHADOW, isoBox, poly, tone, type Pt } from "./kit";
import type { CellInfo } from "./types";

const HW = TILE_W / 2;
const HH = TILE_H / 2;
export const TAU = Math.PI * 2;
/** Pixels de altura que valem uma célula de chão: com isso um círculo em pé sai redondo. */
export const PE = 40;
/** Opacidade do traço de detalhe que não deve competir com o contorno. */
export const SUAVE = 0.55;

// ---------------------------------------------------------------------------
// Materiais
// ---------------------------------------------------------------------------

export interface Materiais {
  /** Madeira do corpo dos móveis. */
  madeira: string;
  /** Madeira dos tampos e das ripas, um pouco mais clara. */
  tampo: string;
  /** Rodapés, pés e molduras. */
  madeiraEscura: string;
  /** Aço pintado dos arquivos e dos armários. */
  aco: string;
  /** Pintura das máquinas. */
  maquina: string;
  /** Ferro escuro: bases, pés, eixos. */
  ferro: string;
  /** Metal claro: puxadores, tubos, peças usinadas. */
  cromo: string;
  /** Latão ou outro detalhe metálico quente. */
  latao: string;
  estofado: string;
  /** Pedra ou reboco das colunas. */
  pedra: string;
  /** Pano da bandeira: sempre neutro. */
  pano: string;
  papel: string;
  /** Papel pardo das pastas e das caixas de arquivo. */
  pardo: string;
  folha: string;
  vaso: string;
  /** Forro do quadro de avisos e do tampo da mesa diretora. */
  feltro: string;
  /** Plástico claro da urna. */
  plastico: string;
  /** Lombadas das pastas na estante. */
  lombadas: readonly string[];
  /** Verniz: de 0 (madeira crua) a 1 (polida). */
  brilho: number;
  /** Desgaste: de 0 (novo) a 1 (lascado, com veios à mostra). */
  desgaste: number;
  /** Mobília rústica, de oficina: cadeiras e pés de aço, armários de chapa, madeira crua. */
  rustico: boolean;
  /** Ambiente de materiais frios: estofado e metal em vez de madeira quente, onde o objeto escolhe. */
  frio: boolean;
}

/** A receita de uma arte: os materiais e quanto do acento da paleta entra na madeira. */
export type Receita = Materiais & { tinta: number };

function canais(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** A cor entre `a` e `b`, com `t` de 0 a 1. Sem cache: só para montar materiais. */
export function mistura(a: string, b: string, t: number): string {
  const ca = canais(a);
  const cb = canais(b);
  return `#${ca.map((c, i) => Math.round(c + (cb[i]! - c) * t).toString(16).padStart(2, "0")).join("")}`;
}

const prontos = new Map<ScenePalette, Materiais>();

/** Os materiais da arte para a paleta da cena. O acento tinge de leve a madeira; montados uma vez por paleta. */
export function materiais(arte: SceneArtId, paleta: ScenePalette): Materiais {
  const pronto = prontos.get(paleta);
  if (pronto !== undefined) return pronto;
  const { tinta, ...receita } = ARTS[arte].receita;
  const mat: Materiais = { ...receita, madeira: mistura(receita.madeira, paleta.acento, tinta) };
  prontos.set(paleta, mat);
  return mat;
}

// ---------------------------------------------------------------------------
// Quadro local
// ---------------------------------------------------------------------------

export interface Quadro {
  ctx: CanvasRenderingContext2D;
  sx: number;
  sy: number;
  /** Espelhado: `u` corre no eixo y do mundo e `v` no eixo x. */
  m: boolean;
  /** Luz da face voltada para +v (a frente) e da voltada para +u (o lado). */
  lv: number;
  lu: number;
  mat: Materiais;
  paleta: ScenePalette;
  info: CellInfo;
  variante: number;
  /** Segundos; fica em 0 com movimento reduzido. */
  tempo: number;
  movimento: boolean;
}

/** Ponto local na tela. */
export function pt(q: Quadro, u: number, v: number, z = 0): Pt {
  const dx = q.m ? v : u;
  const dy = q.m ? u : v;
  return [q.sx + (dx - dy) * HW, q.sy + (dx + dy) * HH - z];
}

export const tomV = (q: Quadro, cor: string, extra = 0): string => tone(cor, q.lv + extra);
export const tomU = (q: Quadro, cor: string, extra = 0): string => tone(cor, q.lu + extra);
export const tomT = (cor: string, extra = 0): string => tone(cor, LIGHT.topo + extra);

/** Caixa do kit nos eixos locais: centro (`u`, `v`), base em `z`. */
export function caixa(
  q: Quadro,
  u: number,
  v: number,
  wu: number,
  wv: number,
  h: number,
  cor: string,
  z = 0,
  contorno: number = OUTLINE,
  topo?: string,
): void {
  isoBox(q.ctx, q.sx, q.sy, q.m ? wv : wu, q.m ? wu : wv, h, cor, { z, contorno, ox: q.m ? v : u, oy: q.m ? u : v, topo });
}

/** Polígono com o contorno em grafite na opacidade dada: para detalhes sobre uma face. */
export function forma(ctx: CanvasRenderingContext2D, pontos: readonly Pt[], cor: string, contorno: number = DETAIL, alfa = 1): void {
  if (alfa >= 1 || contorno <= 0) {
    poly(ctx, pontos, cor, contorno);
    return;
  }
  poly(ctx, pontos, cor, 0);
  const antes = ctx.globalAlpha;
  ctx.globalAlpha = antes * alfa;
  ctx.lineWidth = contorno;
  ctx.strokeStyle = INK;
  ctx.lineJoin = "round";
  ctx.stroke();
  ctx.globalAlpha = antes;
}

/** Retângulo em pé sobre o plano `v`: um detalhe na face da frente. */
export function faceV(q: Quadro, v: number, u0: number, u1: number, z0: number, z1: number, cor: string, contorno: number = DETAIL, alfa = 1): void {
  forma(q.ctx, [pt(q, u0, v, z0), pt(q, u1, v, z0), pt(q, u1, v, z1), pt(q, u0, v, z1)], cor, contorno, alfa);
}

/** Retângulo em pé sobre o plano `u`: um detalhe na face do lado. */
export function faceU(q: Quadro, u: number, v0: number, v1: number, z0: number, z1: number, cor: string, contorno: number = DETAIL, alfa = 1): void {
  forma(q.ctx, [pt(q, u, v0, z0), pt(q, u, v1, z0), pt(q, u, v1, z1), pt(q, u, v0, z1)], cor, contorno, alfa);
}

/** Retângulo deitado na altura `z`: um detalhe sobre um tampo ou no chão. */
export function plano(q: Quadro, u0: number, v0: number, u1: number, v1: number, z: number, cor: string, contorno: number = DETAIL, alfa = 1): void {
  forma(q.ctx, [pt(q, u0, v0, z), pt(q, u1, v0, z), pt(q, u1, v1, z), pt(q, u0, v1, z)], cor, contorno, alfa);
}

/** Folha deitada, girada de `giro` radianos em torno do centro (`u`, `v`). */
export function folha(q: Quadro, u: number, v: number, a: number, b: number, giro: number, z: number, cor: string, contorno: number = DETAIL, alfa: number = SUAVE): void {
  const c = Math.cos(giro);
  const s = Math.sin(giro);
  const ax = (a / 2) * c;
  const ay = (a / 2) * s;
  const bx = (-b / 2) * s;
  const by = (b / 2) * c;
  forma(
    q.ctx,
    [pt(q, u - ax - bx, v - ay - by, z), pt(q, u + ax - bx, v + ay - by, z), pt(q, u + ax + bx, v + ay + by, z), pt(q, u - ax + bx, v - ay + by, z)],
    cor,
    contorno,
    alfa,
  );
}

/** Segmentos soltos (pares de pontos) em um traço só. */
export function tracos(ctx: CanvasRenderingContext2D, pontos: readonly Pt[], largura: number = DETAIL, alfa = 1, cor: string = INK): void {
  const antes = ctx.globalAlpha;
  ctx.globalAlpha = antes * alfa;
  ctx.beginPath();
  for (let i = 0; i + 1 < pontos.length; i += 2) {
    const a = pontos[i]!;
    const b = pontos[i + 1]!;
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
  }
  ctx.lineWidth = largura;
  ctx.strokeStyle = cor;
  ctx.lineCap = "round";
  ctx.stroke();
  ctx.globalAlpha = antes;
}

/** Linha contínua pelos pontos dados. */
export function fio(ctx: CanvasRenderingContext2D, pontos: readonly Pt[], largura: number = DETAIL, alfa = 1, cor: string = INK): void {
  const antes = ctx.globalAlpha;
  ctx.globalAlpha = antes * alfa;
  ctx.beginPath();
  pontos.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  ctx.lineWidth = largura;
  ctx.strokeStyle = cor;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();
  ctx.globalAlpha = antes;
}

/** Haste: uma linha grossa na cor dada, com o contorno em grafite por baixo. */
export function haste(ctx: CanvasRenderingContext2D, pontos: readonly Pt[], largura: number, cor: string): void {
  fio(ctx, pontos, largura + OUTLINE * 1.6, 1, INK);
  fio(ctx, pontos, largura, 1, cor);
}

/** Bolinha: parafuso, botão, pino. Sem contorno quando `contorno` é zero. */
export function bola(ctx: CanvasRenderingContext2D, p: Pt, r: number, cor: string, contorno = 0): void {
  ctx.beginPath();
  ctx.arc(p[0], p[1], r, 0, TAU);
  ctx.fillStyle = cor;
  ctx.fill();
  if (contorno > 0) {
    ctx.lineWidth = contorno;
    ctx.strokeStyle = INK;
    ctx.stroke();
  }
}

// ---------------------------------------------------------------------------
// Formas
// ---------------------------------------------------------------------------

// A luz de uma face inclinada: entre a do lado (em pé) e a do topo (deitada).
// Em degraus, para a tabela de cores do kit não crescer sem fim.
function luzInclinada(lado: number, da: number, dz: number): number {
  const sobe = -da;
  if (sobe <= 0) return lado;
  const w = Math.round((sobe / Math.hypot(dz / PE, sobe)) * 8) / 8;
  return lado + (LIGHT.topo - lado) * w;
}

/**
 * Prisma: um perfil no plano (v, z), dado em sentido anti-horário (v para a
 * direita, z para cima), estendido ao longo de `u`. Desenha de trás para a
 * frente as faces que a câmera vê, com a luz pela inclinação, e fecha com a
 * tampa em +u.
 */
export function prismaU(q: Quadro, perfil: readonly Pt[], u0: number, u1: number, cor: string, contorno: number = OUTLINE): void {
  const n = perfil.length;
  for (let i = n - 1; i >= 0; i -= 1) {
    const a = perfil[i]!;
    const b = perfil[(i + 1) % n]!;
    const da = b[0] - a[0];
    const dz = b[1] - a[1];
    // A câmera vê a face quando ela sobe mais do que recua: um passo de célula vale TILE_H na tela.
    if (dz <= TILE_H * da) continue;
    poly(q.ctx, [pt(q, u0, a[0], a[1]), pt(q, u1, a[0], a[1]), pt(q, u1, b[0], b[1]), pt(q, u0, b[0], b[1])], tone(cor, luzInclinada(q.lv, da, dz)), contorno);
  }
  poly(
    q.ctx,
    perfil.map(([v, z]) => pt(q, u1, v, z)),
    tone(cor, q.lu),
    contorno,
  );
}

/** O mesmo, com o perfil no plano (u, z) estendido ao longo de `v`: a tampa fica em +v. */
export function prismaV(q: Quadro, perfil: readonly Pt[], v0: number, v1: number, cor: string, contorno: number = OUTLINE): void {
  const n = perfil.length;
  for (let i = n - 1; i >= 0; i -= 1) {
    const a = perfil[i]!;
    const b = perfil[(i + 1) % n]!;
    const da = b[0] - a[0];
    const dz = b[1] - a[1];
    if (dz <= TILE_H * da) continue;
    poly(q.ctx, [pt(q, a[0], v0, a[1]), pt(q, a[0], v1, a[1]), pt(q, b[0], v1, b[1]), pt(q, b[0], v0, b[1])], tone(cor, luzInclinada(q.lu, da, dz)), contorno);
  }
  poly(
    q.ctx,
    perfil.map(([u, z]) => pt(q, u, v1, z)),
    tone(cor, q.lv),
    contorno,
  );
}

// Onde a parte escura de um corpo redondo começa, como fração do raio.
const CORTE = 0.18;
const ANGULO_DO_CORTE = Math.acos(CORTE);

function corpoRedondo(ctx: CanvasRenderingContext2D, cx: number, cy: number, rb: number, yt: number, rt: number): void {
  ctx.beginPath();
  ctx.moveTo(cx - rt, yt);
  ctx.lineTo(cx - rb, cy);
  ctx.ellipse(cx, cy, rb, rb / 2, 0, Math.PI, 0, true);
  ctx.lineTo(cx + rt, yt);
  ctx.ellipse(cx, yt, rt, rt / 2, 0, 0, Math.PI, false);
  ctx.closePath();
}

/**
 * Tronco de cone em pé (cilindro quando os raios são iguais), com o centro da
 * base em (`u`, `v`, `z`). Os raios são em pixels de tela. A luz é a do
 * atlas: a metade da esquerda média, a da direita escura, o topo claro.
 */
export function tronco(q: Quadro, u: number, v: number, rb: number, rt: number, h: number, cor: string, z = 0, contorno: number = OUTLINE, topo?: string): void {
  const { ctx } = q;
  const [cx, cy] = pt(q, u, v, z);
  const yt = cy - h;
  corpoRedondo(ctx, cx, cy, rb, yt, rt);
  ctx.fillStyle = tone(cor, LIGHT.esquerda);
  ctx.fill();

  const s = Math.sin(ANGULO_DO_CORTE) / 2;
  ctx.beginPath();
  ctx.moveTo(cx + rt * CORTE, yt + rt * s);
  ctx.lineTo(cx + rb * CORTE, cy + rb * s);
  ctx.ellipse(cx, cy, rb, rb / 2, 0, ANGULO_DO_CORTE, 0, true);
  ctx.lineTo(cx + rt, yt);
  ctx.ellipse(cx, yt, rt, rt / 2, 0, 0, ANGULO_DO_CORTE, false);
  ctx.closePath();
  ctx.fillStyle = tone(cor, LIGHT.direita);
  ctx.fill();

  if (contorno > 0) {
    corpoRedondo(ctx, cx, cy, rb, yt, rt);
    ctx.lineWidth = contorno;
    ctx.strokeStyle = INK;
    ctx.lineJoin = "round";
    ctx.stroke();
  }
  elipse(ctx, cx, yt, rt, rt / 2, topo ?? tone(cor, LIGHT.topo), contorno);
}

/** Elipse deitada, com o centro em pixels de tela. */
export function elipse(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, cor: string, contorno: number = OUTLINE, alfa = 1): void {
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU);
  ctx.fillStyle = cor;
  ctx.fill();
  if (contorno > 0) {
    const antes = ctx.globalAlpha;
    ctx.globalAlpha = antes * alfa;
    ctx.lineWidth = contorno;
    ctx.strokeStyle = INK;
    ctx.stroke();
    ctx.globalAlpha = antes;
  }
}

/** Um ponto na borda de um círculo em pé de raio `r` (em células), voltado para o eixo dado. */
export function noDisco(q: Quadro, eixo: "u" | "v", u: number, v: number, z: number, r: number, angulo: number): Pt {
  const c = Math.cos(angulo) * r;
  const s = Math.sin(angulo) * r * PE;
  return eixo === "u" ? pt(q, u, v + c, z + s) : pt(q, u + c, v, z + s);
}

/** Círculo em pé (volante, mandril, mostrador), voltado para +u ou +v. O raio é em células. */
export function disco(q: Quadro, eixo: "u" | "v", u: number, v: number, z: number, r: number, cor: string, contorno: number = OUTLINE): void {
  const { ctx } = q;
  const centro = pt(q, u, v, z);
  const borda = eixo === "u" ? pt(q, u, v + r, z) : pt(q, u + r, v, z);
  // O caminho é traçado com a matriz inclinada e contornado sem ela: o traço não deforma.
  ctx.save();
  ctx.transform(borda[0] - centro[0], borda[1] - centro[1], 0, -r * PE, centro[0], centro[1]);
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, TAU);
  ctx.restore();
  ctx.fillStyle = cor;
  ctx.fill();
  if (contorno > 0) {
    ctx.lineWidth = contorno;
    ctx.strokeStyle = INK;
    ctx.stroke();
  }
}

// Quanto a sombra passa da elipse inscrita na base: o bastante para aparecer em volta dos cantos.
const FOLGA = 1.36;

/**
 * Sombra no chão de uma base de `wu` por `wv` células: a elipse que cabe no
 * losango da base, um pouco maior e caída para o lado oposto ao da luz. Para
 * uma base quadrada é a elipse do kit; para uma comprida (banco, estante),
 * deita no eixo mais longo.
 */
export function sombra(q: Quadro, wu: number, wv: number, u = 0, v = 0): void {
  const { ctx } = q;
  const [cx, cy] = pt(q, u, v);
  const xx = (q.m ? wv : wu) ** 2;
  const yy = (q.m ? wu : wv) ** 2;
  // Eixos da elipse inscrita: a projeção leva o círculo da base a uma elipse inclinada.
  const media = (HW * HW + HH * HH) * (xx + yy) * 0.125;
  const desvio = Math.hypot((HW * HW - HH * HH) * (xx + yy) * 0.125, HW * HH * (xx - yy) * 0.25);
  const giro = 0.5 * Math.atan2(HW * HH * (xx - yy) * 0.25, (HW * HW - HH * HH) * (xx + yy) * 0.125);
  ctx.fillStyle = SHADOW;
  ctx.beginPath();
  ctx.ellipse(cx + 1.5, cy + 1.5, Math.sqrt(media + desvio) * FOLGA + 1, Math.sqrt(Math.max(0, media - desvio)) * FOLGA + 1, giro, 0, TAU);
  ctx.fill();
}

/** Reflexo do verniz em um tampo: só onde a madeira da cena é envernizada. */
export function brilho(q: Quadro, u0: number, v0: number, u1: number, v1: number, z: number): void {
  if (q.mat.brilho <= 0) return;
  const { ctx } = q;
  const w = u1 - u0;
  const a = u0 + w * 0.14;
  const b = u0 + w * 0.26;
  const antes = ctx.globalAlpha;
  ctx.globalAlpha = antes * 0.26 * q.mat.brilho;
  poly(ctx, [pt(q, a + w * 0.12, v0, z), pt(q, b + w * 0.12, v0, z), pt(q, b, v1, z), pt(q, a, v1, z)], "#fffaf0", 0);
  ctx.globalAlpha = antes;
}

/** Veios da madeira crua em um tampo: só onde a cena é gasta. */
export function veios(q: Quadro, u0: number, v0: number, u1: number, v1: number, z: number): void {
  if (q.mat.desgaste < 0.5) return;
  const w = u1 - u0;
  const d = v1 - v0;
  tracos(
    q.ctx,
    [
      pt(q, u0 + w * 0.12, v0 + d * 0.3, z),
      pt(q, u0 + w * 0.55, v0 + d * 0.3, z),
      pt(q, u0 + w * 0.4, v0 + d * 0.68, z),
      pt(q, u0 + w * 0.9, v0 + d * 0.68, z),
    ],
    0.7,
    0.3,
  );
}
