// Auditório de convenção, 2026: cortinas de palco em pregas verticais do chão
// ao trilho, treliça de alumínio com refletores apagados e caixas de som
// penduradas, um telão apagado no fundo e uma faixa de pano sem texto; piso
// de evento em placas grandes e lisas, com a poça de luz de cada refletor e
// marcas de fita; porta corta-fogo de aço com barra antipânico. Nos móveis,
// alumínio de treliça, tecido escuro neutro e plástico cinza: estrutura
// montada para o dia.
//
// Nenhuma cor identifica partido: as cortinas, as bandeiras e a faixa são
// neutras, o telão está apagado. As duas cenas usam esta arte com a própria
// paleta: cinza frio e escuro na primeira, pardo mais quente na segunda.

import { leafRect, leafSeg, type LeafDesign } from "../exit-kit";
import { diamond } from "../floor-kit";
import { DETAIL, PAPER, cellNoise, tone } from "../kit";
import { HH, HW, PARAPET_H, fillAlpha, fillSolid, floorSeg, shade, strokeInk } from "../scene-shared";
import type { CellInfo } from "../types";
import { band, estiloBase, hline, isFeature, rect, seg, type Estilo } from "../wall-kit";
import type { ArtSpec } from "./types";

// ---------------------------------------------------------------------------
// Parede: cortina, treliça e o que pende dela
// ---------------------------------------------------------------------------

/** Pregas por célula: largas o bastante para a luz e a sombra de cada uma aparecerem no zoom da cena. */
const PREGAS = 5;
/** Onde a cortina termina e a treliça começa, em pixels. */
const TRILHO = 54;
const TRELICA = [55, 62] as const;

/** Pregas de cortina entre `u0` e `u1`: a face de luz, o pano liso e a dobra na sombra, com o fio da dobra. */
function pregas(ctx: CanvasRenderingContext2D, pano: string, u0: number, u1: number, v0: number, v1: number): void {
  const passo = 1 / PREGAS;
  const luz = tone(pano, 0.1);
  const sombra = tone(pano, -0.14);
  for (let i = 0; i < PREGAS; i += 1) {
    const c = i * passo;
    const a = Math.max(u0, c);
    const b = Math.min(u1, c + passo * 0.36);
    if (b > a) band(ctx, a, b, v0, v1, luz);
    const a2 = Math.max(u0, c + passo * 0.68);
    const b2 = Math.min(u1, c + passo);
    if (b2 > a2) band(ctx, a2, b2, v0, v1, sombra);
  }
  ctx.beginPath();
  for (let i = 0; i < PREGAS; i += 1) {
    const c = i * passo + passo * 0.68;
    if (c > u0 && c < u1) seg(ctx, c, v0, c, v1);
  }
  strokeInk(ctx, 0.6, 0.24);
}

/** Treliça de alumínio: as duas cordas e as diagonais, sobre o vão escuro que a faixa já pintou. */
function trelica(ctx: CanvasRenderingContext2D, e: Estilo): void {
  const [v0, v1] = TRELICA;
  ctx.beginPath();
  for (let i = 0; i < 4; i += 1) {
    const c = i / 4;
    seg(ctx, c, v0 + 1, c + 0.25, v1 - 1);
    seg(ctx, c + 0.25, v0 + 1, c, v1 - 1);
  }
  strokeInk(ctx, 0.8, 0.9, e.caixilho);
  ctx.beginPath();
  seg(ctx, 0, v0 + 1, 1, v0 + 1);
  seg(ctx, 0, v1 - 1, 1, v1 - 1);
  strokeInk(ctx, 1.5, 1, e.caixilho);
}

/** Refletor apagado, pendurado na treliça pelo garfo: a lata escura e a lente cinza. */
function refletor(ctx: CanvasRenderingContext2D, e: Estilo): void {
  ctx.beginPath();
  seg(ctx, 0.4, TRELICA[0] + 1, 0.4, 49);
  seg(ctx, 0.6, TRELICA[0] + 1, 0.6, 49);
  seg(ctx, 0.4, 49.5, 0.6, 49.5);
  strokeInk(ctx, 1.1, 1, e.caixilho);
  band(ctx, 0.35, 0.65, 40, 52, e.rodape);
  band(ctx, 0.37, 0.63, 40.5, 44, e.extra);
  ctx.beginPath();
  rect(ctx, 0.35, 40, 0.65, 52);
  strokeInk(ctx, DETAIL);
  hline(ctx, 0.37, 0.63, 44, 0.5, 0.6);
}

/** Caixa de som pendurada na treliça por duas cintas, com a grade dos alto-falantes. */
function caixaDeSom(ctx: CanvasRenderingContext2D, e: Estilo): void {
  ctx.beginPath();
  seg(ctx, 0.36, TRELICA[0] + 1, 0.36, 50);
  seg(ctx, 0.64, TRELICA[0] + 1, 0.64, 50);
  strokeInk(ctx, 1, 0.85, e.caixilho);
  band(ctx, 0.3, 0.7, 33, 50, e.rodape);
  ctx.beginPath();
  for (let v = 35.5; v < 48; v += 2.4) seg(ctx, 0.34, v, 0.66, v);
  strokeInk(ctx, 0.6, 0.35, e.extra);
  ctx.beginPath();
  rect(ctx, 0.3, 33, 0.7, 50);
  strokeInk(ctx, DETAIL);
}

/**
 * O que atravessa duas células começa mais de um pixel antes do começo da
 * segunda: o pano da célula seguinte é pintado com um traço fino da própria
 * cor, e a borda suavizada do primeiro desenho fica por baixo; sem a folga,
 * ficava uma emenda clara no meio do telão.
 */
const EMENDA = -0.05;

/** Telão apagado em duas células, pendurado na treliça: moldura clara, vidro escuro e um reflexo frio. */
function telao(ctx: CanvasRenderingContext2D, e: Estilo, esquerda: boolean): void {
  const u0 = esquerda ? 0.1 : EMENDA;
  const u1 = esquerda ? 1 : 0.9;
  ctx.beginPath();
  seg(ctx, 0.5, TRELICA[0] + 1, 0.5, 51.5);
  strokeInk(ctx, 1, 0.85, e.caixilho);
  // A moldura clara não passa da emenda na altura do vidro: a borda suavizada do vidro
  // por cima dela deixaria um fio claro. Só as réguas de cima e de baixo atravessam.
  band(ctx, esquerda ? u0 : 0, u1, 18.5, 51.5, e.friso);
  if (!esquerda) {
    band(ctx, EMENDA, 0.1, 18.5, 20, e.friso);
    band(ctx, EMENDA, 0.1, 50, 51.5, e.friso);
  }
  const i0 = esquerda ? u0 + 0.05 : EMENDA;
  const i1 = esquerda ? 1 : u1 - 0.05;
  band(ctx, i0, i1, 20, 50, e.vidro);
  if (esquerda) band(ctx, 0.3, 0.46, 20, 50, e.vidroLuz);
  ctx.beginPath();
  seg(ctx, u0, 18.5, u1, 18.5);
  seg(ctx, u0, 51.5, u1, 51.5);
  seg(ctx, i0, 20, i1, 20);
  seg(ctx, i0, 50, i1, 50);
  if (esquerda) {
    seg(ctx, u0, 18.5, u0, 51.5);
    seg(ctx, i0, 20, i0, 50);
  } else {
    seg(ctx, u1, 18.5, u1, 51.5);
    seg(ctx, i1, 20, i1, 50);
  }
  strokeInk(ctx, DETAIL);
}

/** Faixa de pano em duas células, presa à cortina, com linhas que não se leem. Pano cru, não branco: não compete com os registros. */
function faixaDePano(ctx: CanvasRenderingContext2D, e: Estilo, esquerda: boolean): void {
  const u0 = esquerda ? 0.12 : EMENDA;
  const u1 = esquerda ? 1 : 0.88;
  band(ctx, u0, u1, 27, 41, e.friso);
  ctx.beginPath();
  seg(ctx, u0, 27, u1, 27);
  seg(ctx, u0, 41, u1, 41);
  if (esquerda) seg(ctx, u0, 27, u0, 41);
  else seg(ctx, u1, 27, u1, 41);
  strokeInk(ctx, DETAIL, 0.8);
  // As linhas: duas, começando na célula da esquerda e terminando antes da ponta.
  ctx.beginPath();
  if (esquerda) {
    seg(ctx, 0.24, 36, 1, 36);
    seg(ctx, 0.3, 31.5, 1, 31.5);
  } else {
    seg(ctx, 0, 36, 0.62, 36);
    seg(ctx, 0, 31.5, 0.74, 31.5);
  }
  strokeInk(ctx, 1.6, 0.38);
  // Os cordões que a prendem.
  ctx.beginPath();
  if (esquerda) seg(ctx, u0, 41, u0 - 0.05, 46);
  else seg(ctx, u1, 41, u1 + 0.05, 46);
  strokeInk(ctx, 0.7, 0.6);
}

// ---------------------------------------------------------------------------
// Piso de evento
// ---------------------------------------------------------------------------

const TAU = Math.PI * 2;
/** Direção, na tela, do eixo y do mundo (para a câmera, à esquerda) e do eixo x (para a direita). */
const GIRO_Y = Math.atan2(HH, -HW);
const GIRO_X = Math.atan2(HH, HW);

/** Risco de luz alongado no eixo dado: o reflexo de um refletor no piso liso, comprido e estreito. */
function poca(ctx: CanvasRenderingContext2D, sx: number, sy: number, giro: number, forca: number): void {
  ctx.beginPath();
  ctx.ellipse(sx, sy, 21, 4, giro, 0, TAU);
  fillAlpha(ctx, PAPER, 0.05 + forca * 0.08);
  ctx.beginPath();
  ctx.ellipse(sx, sy, 12, 1.8, giro, 0, TAU);
  fillAlpha(ctx, PAPER, 0.08 + forca * 0.12);
}

/**
 * Placas grandes e lisas, de duas células, cada uma no seu tom; a poça de luz
 * dos refletores da treliça (um a cada três células, nas duas paredes de
 * trás), que esmaece ao se afastar da parede; marcas de fita e um ou outro
 * risco de uso.
 */
function drawEventFloor(ctx: CanvasRenderingContext2D, base: string, sx: number, sy: number, info: CellInfo): void {
  const { x, y } = info;
  diamond(ctx, sx, sy);
  fillSolid(ctx, tone(base, (cellNoise(Math.floor(x / 2), Math.floor(y / 2), 71) - 0.5) * 0.07));

  const doNorte = x % 3 === 1 ? Math.max(0, 1 - (y - 1) / 3.5) : 0;
  const doOeste = y % 3 === 1 ? Math.max(0, 1 - (x - 1) / 3.5) : 0;
  if (doNorte > 0) poca(ctx, sx, sy, GIRO_Y, doNorte);
  if (doOeste > 0) poca(ctx, sx, sy, GIRO_X, doOeste);

  const sorte = cellNoise(x, y, 73);
  if (sorte > 0.9) {
    // Marca de fita: um canto em L, cinza-claro, onde algo foi posicionado.
    const a = (cellNoise(x, y, 74) - 0.5) * 0.4;
    const b = (cellNoise(x, y, 75) - 0.5) * 0.4;
    ctx.beginPath();
    floorSeg(ctx, sx, sy, a - 0.14, b, a + 0.08, b);
    floorSeg(ctx, sx, sy, a - 0.14, b, a - 0.14, b - 0.16);
    strokeInk(ctx, 2.2, 0.4, "#d9d9d3");
  } else if (sorte < 0.12) {
    // Risco de uso, curto.
    const k = cellNoise(x, y, 76) - 0.5;
    ctx.beginPath();
    floorSeg(ctx, sx, sy, -0.22 + k * 0.3, 0.1 - k * 0.2, 0.18 + k * 0.2, 0.2 + k * 0.2);
    strokeInk(ctx, 0.6, 0.14);
  }

  // Junta das placas, nas duas bordas de trás de cada placa: a fresta e o chanfro claro ao lado.
  const juntaX = x % 2 === 1;
  const juntaY = y % 2 === 1;
  if (juntaX || juntaY) {
    ctx.beginPath();
    if (juntaX) floorSeg(ctx, sx, sy, -0.5, -0.5, -0.5, 0.5);
    if (juntaY) floorSeg(ctx, sx, sy, -0.5, -0.5, 0.5, -0.5);
    strokeInk(ctx, 1, 0.32);
    ctx.beginPath();
    if (juntaX) floorSeg(ctx, sx, sy, -0.47, -0.47, -0.47, 0.5);
    if (juntaY) floorSeg(ctx, sx, sy, -0.47, -0.47, 0.5, -0.47);
    strokeInk(ctx, 0.7, 0.18, PAPER);
  }
  diamond(ctx, sx, sy);
  strokeInk(ctx, 0.7, 0.08);
}

// ---------------------------------------------------------------------------
// Porta corta-fogo
// ---------------------------------------------------------------------------

/** Chapa lisa de aço: chapa de proteção embaixo, barra antipânico nos dois suportes, visor estreito aramado, placa sem texto e dobradiças. */
const leafCortaFogo: LeafDesign = (ctx, e, luz) => {
  ctx.beginPath();
  leafRect(ctx, 0.05, 2, 0.95, 12);
  fillSolid(ctx, shade(e.ferragem, luz - 0.3));
  strokeInk(ctx, 0.7, 0.6);
  // Visor estreito, com a tela aramada.
  ctx.beginPath();
  leafRect(ctx, 0.39, 45, 0.61, 62);
  fillSolid(ctx, shade("#4c5357", luz * 0.6));
  strokeInk(ctx, DETAIL);
  ctx.beginPath();
  for (let v = 48; v < 62; v += 3.4) leafSeg(ctx, 0.39, v, 0.61, v);
  for (const a of [0.465, 0.535]) leafSeg(ctx, a, 45, a, 62);
  strokeInk(ctx, 0.5, 0.45, shade(e.ferragem, luz));
  // Placa sem texto, na altura dos olhos.
  ctx.beginPath();
  leafRect(ctx, 0.3, 38, 0.7, 42);
  fillSolid(ctx, shade(e.ferragem, luz - 0.08));
  strokeInk(ctx, 0.6, 0.6);
  ctx.beginPath();
  leafSeg(ctx, 0.35, 40, 0.6, 40);
  strokeInk(ctx, 0.5, 0.4);
  // Barra antipânico.
  ctx.beginPath();
  leafRect(ctx, 0.09, 29, 0.19, 36);
  leafRect(ctx, 0.81, 29, 0.91, 36);
  fillSolid(ctx, shade("#3a3d3f", luz));
  strokeInk(ctx, 0.7);
  ctx.beginPath();
  leafRect(ctx, 0.05, 31, 0.95, 34.5);
  fillSolid(ctx, shade(e.ferragem, luz));
  strokeInk(ctx, 0.8);
  ctx.beginPath();
  leafSeg(ctx, 0.08, 32, 0.92, 32);
  strokeInk(ctx, 0.6, 0.5, PAPER);
  // Dobradiças, do lado do montante.
  ctx.beginPath();
  leafRect(ctx, 0.01, 13, 0.06, 21);
  leafRect(ctx, 0.01, 50, 0.06, 58);
  fillSolid(ctx, shade(e.ferragem, luz - 0.15));
  strokeInk(ctx, 0.5, 0.6);
};

// ---------------------------------------------------------------------------
// A arte
// ---------------------------------------------------------------------------

export const convencao: ArtSpec = {
  id: "convencao",
  nome: "Auditório de convenção",
  parede: {
    // O acento da paleta é o alumínio da treliça; o resto são cinzas fixos, que a luz da face escurece.
    estilo: (p, k) => ({
      ...estiloBase(p, k),
      barra: tone(p.parede, k - 0.06),
      rodape: tone("#2e3133", k),
      remate: tone(p.parede, k + 0.14),
      friso: tone("#b5babc", k),
      relevo: tone(p.parede, k - 0.22),
      vidro: tone("#2d3135", k * 0.5),
      vidroLuz: tone("#454a4f", k * 0.5),
      caixilho: tone(p.acento, k),
      madeira: tone(p.acento, k),
      extra: tone("#878d91", k),
    }),
    faixas: [
      [0, 2, "rodape"],
      [TRILHO, TRELICA[0], "caixilho"],
      [TRELICA[0], TRELICA[1], "relevo"],
      [TRELICA[1], 66, "remate"],
    ],
    linhas: [
      [2, 0.5],
      [TRILHO, 0.5],
      [TRELICA[0], 0.35],
      [TRELICA[1], 0.5],
    ],
    decorar(ctx, e, i, norte) {
      pregas(ctx, e.face, 0, 1, 2, TRILHO);
      trelica(ctx, e);
      if (norte && (i === 5 || i === 6)) {
        telao(ctx, e, i === 5);
        return;
      }
      if (norte && (i === 2 || i === 8)) {
        caixaDeSom(ctx, e);
        return;
      }
      // A faixa fica no começo da parede oeste, longe de onde o guia e o personagem ficam parados.
      if (!norte && (i === 2 || i === 3)) faixaDePano(ctx, e, i === 2);
      if (isFeature(i)) refletor(ctx, e);
    },
    parapeito(ctx, e, u0, u1) {
      // Saia de palco: as mesmas pregas, curtas.
      pregas(ctx, e.barra, u0, u1, 1, PARAPET_H - 1);
    },
    corpoDoParapeito: "barra",
  },
  piso: (ctx, _paleta, base, sx, sy, _variante, info) => drawEventFloor(ctx, base, sx, sy, info),
  // Aço pintado de cinza, mais claro que a cortina, para a porta não sumir nela.
  porta: (p) => ({ moldura: tone(p.acento, -0.45), folha: tone(p.acento, -0.22), ferragem: "#dadcd9", degrau: tone(p.parede, -0.12), desenho: leafCortaFogo }),
  // Alumínio de treliça, tecido escuro neutro, laminado claro de tribuna e plástico cinza nas cadeiras.
  receita: {
    madeira: "#7e6c58",
    tinta: 0.08,
    tampo: "#95836c",
    madeiraEscura: "#4e4336",
    aco: "#a4a9ad",
    maquina: "#6f777c",
    ferro: "#3f4245",
    cromo: "#d5d7d4",
    latao: "#a9a07e",
    estofado: "#8a9095",
    pedra: "#d9d9d4",
    pano: "#a7aaa8",
    papel: "#f4f1ea",
    pardo: "#c3b08c",
    folha: "#5c7a62",
    vaso: "#6c6f72",
    feltro: "#4a4d50",
    plastico: "#c9ccc9",
    lombadas: ["#5f6267", "#c3b08c", "#a4a9ad", "#efede6", "#3f4245"],
    brilho: 0.3,
    desgaste: 0.1,
    rustico: false,
    frio: true,
  },
};
