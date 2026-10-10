// O corpo dos personagens, sobre o esqueleto comum (character-pose.ts):
// pernas, sapatos, tronco, braços e mãos, com as três roupas do jogo (o terno
// dos dois personagens jogáveis, a camisa de mangas dobradas das primeiras
// épocas e o colete do Arquivista). A cabeça fica em character-head.ts.
//
// Tudo é desenhado com o personagem olhando para a direita; o espelho é
// aplicado por quem chama. `lado` diz para que lado do desenho fica a direita
// da tela, para a sombra não trocar de lado no espelho.

import { DETAIL, INK, OUTLINE, SHADOW, groundShadow, tone } from "./kit";
import { FINE, curve, dot, lit, litLimb, traceLimb } from "./character-ink";
import { AX, AY_CHAO, type Build, type Chain, type Leg, type Pose } from "./character-pose";

export type Outfit = "terno" | "colete" | "camisa";

/** As tintas do corpo, já com os tons de luz e de sombra calculados. */
export interface BodyPaints {
  pele: string;
  peleSombra: string;
  /** O paletó, ou o colete. */
  cima: string;
  cimaSombra: string;
  cimaLuz: string;
  /** O braço e a perna de longe ficam um tom abaixo, para recuar. */
  cimaLonge: string;
  calca: string;
  calcaSombra: string;
  calcaLonge: string;
  camisa: string;
  camisaSombra: string;
  gravata: string;
  gravataLuz: string;
  sapato: string;
  sapatoLonge: string;
  sapatoLuz: string;
  /** A pasta de documentos do Arquivista. */
  pasta: string;
  pastaSombra: string;
}

export function bodyPaints(cores: {
  pele: string;
  peleSombra: string;
  cima: string;
  calca: string;
  camisa: string;
  gravata: string;
  sapato: string;
  pasta?: string;
}): BodyPaints {
  const pasta = cores.pasta ?? "#c8b48e";
  return {
    pele: cores.pele,
    peleSombra: cores.peleSombra,
    cima: cores.cima,
    cimaSombra: tone(cores.cima, -0.24),
    cimaLuz: tone(cores.cima, 0.1),
    cimaLonge: tone(cores.cima, -0.1),
    calca: cores.calca,
    calcaSombra: tone(cores.calca, -0.24),
    calcaLonge: tone(cores.calca, -0.08),
    camisa: cores.camisa,
    camisaSombra: tone(cores.camisa, -0.13),
    gravata: cores.gravata,
    gravataLuz: tone(cores.gravata, 0.3),
    sapato: cores.sapato,
    sapatoLonge: tone(cores.sapato, -0.12),
    sapatoLuz: tone(cores.sapato, 0.4),
    pasta,
    pastaSombra: tone(pasta, -0.16),
  };
}

export interface BodySpec {
  build: Build;
  tintas: BodyPaints;
  roupa: Outfit;
}

/** Sombra projetada de uma parte sobre a outra: grafite bem diluído. */
const CAST = "rgba(27, 28, 26, 0.17)";

// O personagem em desenho: as funções que traçam caminhos leem daqui, para
// não criar funções nem objetos a cada quadro.
let P: Pose;
let B: Build;
let T: BodyPaints;

/** O contorno do tronco, igual nas duas vistas: muda só o lado em que fica o ombro de perto. */
function traceTorso(g: CanvasRenderingContext2D): void {
  const s = P.frente ? -1 : 1;
  const c = P.troncoX;
  const base = P.baseX;
  const yP = P.pescocoY;
  const yO = P.ombroY;
  const yC = P.cinturaY;
  const yB = P.barraY;
  const dn = P.desnivel;
  const xN = c + s * B.peito;
  const xL = c - s * B.peito * 0.93;
  const cN = base + s * B.cinturaLargura;
  const cL = base - s * B.cinturaLargura * 0.95;
  const bN = base + s * B.barraLargura;
  const bL = base - s * B.barraLargura * 0.95;
  g.beginPath();
  g.moveTo(c + s * 2.8, yP + dn * 0.2);
  g.bezierCurveTo(c + s * 6, yP + 0.3 + dn * 0.5, xN - s * 2.2, yO - 0.6 + dn, xN, yO + 3 + dn);
  g.bezierCurveTo(xN + s * 0.5, yO + 9 + dn, cN + s * 0.3, yC - 4, cN, yC + dn * 0.5);
  g.quadraticCurveTo(bN + s * 0.4, yB - 3, bN - s * 0.8, yB + dn * 0.6);
  g.quadraticCurveTo(base - s * 1.5, yB + 2.8, bL + s * 0.6, yB - dn * 0.5);
  g.quadraticCurveTo(cL - s * 0.5, yB - 4, cL, yC - dn * 0.5);
  g.bezierCurveTo(cL - s * 0.3, yC - 5, xL - s * 0.5, yO + 9 - dn, xL, yO + 3 - dn);
  g.bezierCurveTo(xL + s * 2.2, yO - 0.6 - dn, c - s * 6.4, yP - dn * 0.5, c - s * 3.4, yP - 0.4 - dn * 0.2);
  g.closePath();
}

/** O colete: o mesmo tronco, com as cavas abertas nos ombros e o decote em V. */
function traceVest(g: CanvasRenderingContext2D): void {
  const s = P.frente ? -1 : 1;
  const c = P.troncoX;
  const base = P.baseX;
  const yP = P.pescocoY;
  const yO = P.ombroY;
  const yC = P.cinturaY;
  const yB = P.barraY;
  const dn = P.desnivel;
  const xN = c + s * B.peito;
  const xL = c - s * B.peito * 0.93;
  const cN = base + s * B.cinturaLargura;
  const cL = base - s * B.cinturaLargura * 0.95;
  const bN = base + s * B.barraLargura;
  const bL = base - s * B.barraLargura * 0.95;
  // O meio do peito fica do lado em que o personagem olha.
  const meio = c + (P.frente ? 2.2 : -2);
  g.beginPath();
  g.moveTo(c + s * 3, yP + 0.2 + dn * 0.2);
  g.lineTo(c + s * 6.2, yO + 1.2 + dn * 0.7);
  g.bezierCurveTo(c + s * 5.6, yO + 5 + dn, xN - s * 2, yO + 7 + dn, xN + s * 0.1, yO + 10 + dn);
  g.bezierCurveTo(xN + s * 0.3, yO + 12 + dn, cN + s * 0.3, yC - 3, cN, yC + dn * 0.5);
  g.quadraticCurveTo(bN + s * 0.4, yB - 2, bN - s * 0.6, yB + dn * 0.6);
  if (P.frente) {
    // As duas pontas do colete, na frente.
    g.lineTo(meio - 1.8, yB + 1.3);
    g.lineTo(meio - 0.2, yB + 3.3);
    g.lineTo(meio + 0.5, yB + 1.7);
    g.lineTo(meio + 1.9, yB + 2.8);
  } else {
    g.quadraticCurveTo(base - s * 1.5, yB + 2.2, bL + s * 0.6, yB - dn * 0.5);
  }
  g.lineTo(bL + s * 0.6, yB - dn * 0.5);
  g.quadraticCurveTo(cL - s * 0.5, yB - 2, cL, yC - dn * 0.5);
  g.bezierCurveTo(cL - s * 0.3, yC - 3, xL - s * 0.3, yO + 12 - dn, xL - s * 0.1, yO + 10 - dn);
  g.bezierCurveTo(xL + s * 2, yO + 7 - dn, c - s * 5.4, yO + 5 - dn, c - s * 6, yO + 1 - dn * 0.7);
  g.lineTo(c - s * 3.4, yP - 0.2 - dn * 0.2);
  if (P.frente) g.lineTo(meio + 0.4, yO + 9.6);
  else g.quadraticCurveTo(c - s * 0.2, yP + 1.6, c + s * 3, yP + 0.2 + dn * 0.2);
  g.closePath();
}

// O pé em desenho: de um ponto do sapato (`f` ao longo da sola, `a` acima
// dela) para a tela, com o giro do pé em volta do tornozelo.
let peX = 0;
let peY = 0;
let peCos = 1;
let peSin = 0;
let peFrente = 1;

function footX(f: number, a: number): number {
  return peX + AX * (f * peCos + (a - B.tornozelo) * peSin);
}

function footY(f: number, a: number): number {
  const avanca = f * peCos + (a - B.tornozelo) * peSin;
  return peY + f * peSin - (a - B.tornozelo) * peCos + peFrente * AY_CHAO * avanca;
}

/**
 * Sapato visto de cima e de lado, como o chão: a sola é uma pegada comprida
 * na direção em que o personagem olha, e o couro fica um pouco acima dela.
 */
function shoe(g: CanvasRenderingContext2D, perna: Leg, longe: boolean): void {
  peX = perna.x2;
  peY = perna.y2;
  peCos = Math.cos(perna.pe);
  peSin = Math.sin(perna.pe);
  peFrente = P.frente ? 1 : -1;
  // Sola.
  traceLimb(g, footX(-2.2, 0.3), footY(-2.2, 0.3), 2, footX(1.5, 0.3), footY(1.5, 0.3), 2.1, footX(4.9, 0.3), footY(4.9, 0.3), 1.85, false);
  g.fillStyle = INK;
  g.fill();
  g.lineWidth = FINE;
  g.strokeStyle = INK;
  g.stroke();
  // Couro: mais alto no peito do pé, mais baixo na biqueira.
  traceLimb(g, footX(-2, 2.3), footY(-2, 2.3), 1.9, footX(1.3, 2.5), footY(1.3, 2.5), 2, footX(4.7, 1.5), footY(4.7, 1.5), 1.65, false);
  g.fillStyle = longe ? T.sapatoLonge : T.sapato;
  g.fill();
  g.stroke();
  // Brilho do couro na biqueira.
  curve(g, footX(3, 3), footY(3, 3) - 0.7, footX(4.4, 2.8), footY(4.4, 2.8) - 0.9, footX(5.4, 1.9), footY(5.4, 1.9) - 0.5, 0.7, T.sapatoLuz, 0.85);
}

function leg(g: CanvasRenderingContext2D, perna: Leg, longe: boolean, lado: number): void {
  shoe(g, perna, longe);
  // A coxa começa acima do quadril, escondida pela roupa de cima; a boca da
  // calça passa um pouco do tornozelo e cobre o cano do sapato.
  const x0 = perna.x0;
  const y0 = perna.y0 - 2.6;
  const dx = perna.x2 - perna.x1;
  const dy = perna.y2 - perna.y1;
  const d = Math.hypot(dx, dy) || 1;
  const x2 = perna.x2 + (dx / d) * 0.9;
  const y2 = perna.y2 + (dy / d) * 0.9;
  litLimb(g, x0, y0, B.coxa, perna.x1, perna.y1, B.joelhoLargura, x2, y2, B.bocaCalca, true, longe ? T.calcaLonge : T.calca, T.calcaSombra, lado);
  // Sombra da barra do paletó sobre a calça.
  g.save();
  traceLimb(g, x0, y0, B.coxa, perna.x1, perna.y1, B.joelhoLargura, x2, y2, B.bocaCalca, true);
  g.clip();
  g.fillStyle = CAST;
  g.fillRect(x0 - 9, P.barraY - 4, 18, 7);
  g.restore();
  // Vinco da calça.
  const vinco = P.frente ? 0.5 : -0.3;
  curve(g, (x0 + perna.x1) / 2 + vinco, (y0 + perna.y1) / 2 + 2, perna.x1 + vinco * 1.6, perna.y1, x2 + vinco, y2 - 0.8, 0.6, INK, 0.28);
}

function hand(g: CanvasRenderingContext2D, braco: Chain, longe: boolean): void {
  const dx = braco.x2 - braco.x1;
  const dy = braco.y2 - braco.y1;
  const r = B.punho;
  g.save();
  g.translate(braco.x2, braco.y2);
  g.rotate(Math.atan2(dy, dx) - Math.PI / 2);
  // Mão solta, com o polegar do lado da frente do corpo.
  g.beginPath();
  g.moveTo(-r + 0.3, -0.8);
  g.lineTo(r - 0.3, -0.8);
  g.bezierCurveTo(r + 0.5, 0.8, r + 0.5, 2.2, r - 0.5, 2.6);
  g.bezierCurveTo(r - 0.3, 3.9, 1, 5, -0.2, 4.9);
  g.bezierCurveTo(-r + 0.6, 4.8, -r - 0.1, 2.4, -r + 0.3, -0.8);
  g.closePath();
  g.fillStyle = longe ? T.peleSombra : T.pele;
  g.fill();
  g.lineWidth = FINE;
  g.strokeStyle = INK;
  g.stroke();
  // O vão do polegar.
  curve(g, r - 0.6, 2.5, 0.6, 2.6, 0.3, 1.4, 0.6, INK, 0.55);
  g.restore();
}

/** Braço de manga comprida: mão, punho da camisa e manga do paletó. */
function sleeveArm(g: CanvasRenderingContext2D, braco: Chain, longe: boolean, lado: number): void {
  hand(g, braco, longe);
  const dx = braco.x2 - braco.x1;
  const dy = braco.y2 - braco.y1;
  const d = Math.hypot(dx, dy) || 1;
  const ux = dx / d;
  const uy = dy / d;
  // O punho da camisa aparece um pouco abaixo da manga.
  g.beginPath();
  g.moveTo(braco.x2 - uy * (B.punho - 0.2), braco.y2 + ux * (B.punho - 0.2));
  g.lineTo(braco.x2 + uy * (B.punho - 0.2), braco.y2 - ux * (B.punho - 0.2));
  g.lineCap = "butt";
  g.lineWidth = 2.5;
  g.strokeStyle = INK;
  g.stroke();
  g.lineWidth = 1.4;
  g.strokeStyle = longe ? T.camisaSombra : T.camisa;
  g.stroke();
  g.lineCap = "round";
  const x2 = braco.x2 - ux * 0.9;
  const y2 = braco.y2 - uy * 0.9;
  litLimb(g, braco.x0, braco.y0, B.manga, braco.x1, braco.y1, B.cotovelo, x2, y2, B.punho, true, longe ? T.cimaLonge : T.cima, T.cimaSombra, lado);
}

/** Braço de manga dobrada: antebraço à mostra e a manga da camisa até o cotovelo. */
function rolledArm(g: CanvasRenderingContext2D, braco: Chain, longe: boolean, lado: number): void {
  hand(g, braco, longe);
  const dx = braco.x1 - braco.x0;
  const dy = braco.y1 - braco.y0;
  const d = Math.hypot(dx, dy) || 1;
  const ux = dx / d;
  const uy = dy / d;
  // Antebraço: sai de dentro da manga.
  litLimb(
    g,
    braco.x1 - ux * 2,
    braco.y1 - uy * 2,
    B.cotovelo - 0.4,
    braco.x1,
    braco.y1,
    B.cotovelo - 0.4,
    braco.x2,
    braco.y2,
    B.punho - 0.1,
    true,
    longe ? T.peleSombra : T.pele,
    T.peleSombra,
    lado,
    FINE,
  );
  // Manga, até pouco acima do cotovelo.
  const mx = braco.x1 - ux * 1.2;
  const my = braco.y1 - uy * 1.2;
  litLimb(g, braco.x0, braco.y0, B.manga, (braco.x0 + mx) / 2, (braco.y0 + my) / 2, (B.manga + B.cotovelo) / 2 + 0.3, mx, my, B.cotovelo + 0.4, true, longe ? T.camisaSombra : T.camisa, T.camisaSombra, lado);
  // A dobra: uma faixa na boca da manga.
  const fx = mx - ux * 1.7;
  const fy = my - uy * 1.7;
  const meia = B.cotovelo + 0.5;
  curve(g, fx - uy * meia, fy + ux * meia, fx + ux * 0.5, fy + uy * 0.5, fx + uy * meia, fy - ux * meia, DETAIL, INK, 0.8);
}

function arm(g: CanvasRenderingContext2D, spec: BodySpec, braco: Chain, longe: boolean, lado: number): void {
  if (spec.roupa === "terno") sleeveArm(g, braco, longe, lado);
  else rolledArm(g, braco, longe, lado);
}

/** O pescoço, entre a cabeça e o colarinho. */
function neck(g: CanvasRenderingContext2D): void {
  const meia = B.peito * 0.3;
  const x = (P.cabecaX + P.troncoX) / 2 + (P.frente ? 0.6 : -0.2);
  const topo = P.cabecaY + 5;
  const pe = P.pescocoY + 1.4;
  g.beginPath();
  g.moveTo(x - meia, topo);
  g.lineTo(x - meia - 0.3, pe);
  g.lineTo(x + meia + 0.3, pe);
  g.lineTo(x + meia, topo);
  g.closePath();
  g.fillStyle = T.peleSombra;
  g.fill();
  g.lineWidth = FINE;
  g.strokeStyle = INK;
  g.stroke();
}

/** Sombra da cabeça sobre os ombros, recortada pelo tronco. */
function headShadow(g: CanvasRenderingContext2D, lado: number): void {
  g.save();
  traceTorso(g);
  g.clip();
  g.fillStyle = CAST;
  g.beginPath();
  g.ellipse(P.cabecaX + lado * 1.2, P.pescocoY + 2.6, 7.4, 3.4, 0, 0, Math.PI * 2);
  g.fill();
  g.restore();
}

function suitFront(g: CanvasRenderingContext2D, lado: number): void {
  lit(g, traceTorso, T.cima, T.cimaSombra, lado, OUTLINE, 2.4, 1);
  // O meio do peito fica do lado em que o personagem olha.
  const m = P.troncoX + 2.4;
  const yP = P.pescocoY;
  const yV = P.ombroY + 12;
  // Camisa, no vão das lapelas.
  g.beginPath();
  g.moveTo(m - 3.6, yP - 0.8);
  g.lineTo(m + 0.5, yV);
  g.lineTo(m + 2.9, yP - 1.3);
  g.closePath();
  g.fillStyle = T.camisa;
  g.fill();
  // Gravata: o nó e a lâmina.
  g.beginPath();
  g.moveTo(m - 1.4, yP + 1);
  g.lineTo(m + 1.1, yP + 0.8);
  g.lineTo(m + 0.8, yP + 2.7);
  g.lineTo(m + 1.6, yV - 2.6);
  g.lineTo(m + 0.5, yV);
  g.lineTo(m - 0.9, yV - 2.8);
  g.lineTo(m - 1, yP + 2.8);
  g.closePath();
  g.fillStyle = T.gravata;
  g.fill();
  g.lineWidth = 0.6;
  g.strokeStyle = INK;
  g.stroke();
  curve(g, m - 1, yP + 2.8, m, yP + 3.1, m + 0.8, yP + 2.7, 0.5, T.gravataLuz, 0.9);
  // Colarinho: as duas pontas, por cima da gravata.
  g.beginPath();
  g.moveTo(m - 3.6, yP - 0.8);
  g.lineTo(m - 1.1, yP + 0.9);
  g.lineTo(m - 2.5, yP + 2.9);
  g.closePath();
  g.moveTo(m + 2.9, yP - 1.3);
  g.lineTo(m + 0.9, yP + 0.7);
  g.lineTo(m + 2.1, yP + 2.3);
  g.closePath();
  g.fillStyle = T.camisa;
  g.fill();
  g.lineWidth = 0.7;
  g.strokeStyle = INK;
  g.stroke();
  // Lapelas, com o entalhe.
  g.beginPath();
  g.moveTo(m - 3.6, yP - 0.8);
  g.lineTo(m - 6.5, yP + 3.4);
  g.lineTo(m - 5.1, yP + 4.5);
  g.lineTo(m - 5.9, yP + 5.6);
  g.lineTo(m + 0.5, yV);
  g.closePath();
  g.fillStyle = T.cimaLuz;
  g.fill();
  g.lineWidth = DETAIL;
  g.strokeStyle = INK;
  g.stroke();
  g.beginPath();
  g.moveTo(m + 2.9, yP - 1.3);
  g.lineTo(m + 5, yP + 2.5);
  g.lineTo(m + 4, yP + 3.6);
  g.lineTo(m + 4.5, yP + 4.5);
  g.lineTo(m + 0.5, yV);
  g.closePath();
  g.fillStyle = T.cima;
  g.fill();
  g.stroke();
  // Abertura do paletó, do botão até a barra, e os botões.
  const yB = P.barraY;
  curve(g, m + 0.5, yV, m + 1.9, (yV + yB) / 2, P.baseX + 2.4, yB + 1.7, DETAIL, INK, 0.9);
  dot(g, m + 0.2, yV + 1.9, 0.6, 0.6, INK);
  dot(g, m + 0.7, yV + 5, 0.6, 0.6, INK);
  // Bolsos: o de baixo, do lado de perto, e o do peito.
  curve(g, P.baseX - B.cinturaLargura + 1.4, P.cinturaY + 2.2, P.baseX - B.cinturaLargura + 3, P.cinturaY + 2.8, P.baseX - 2.6, P.cinturaY + 2.9, 0.6, INK, 0.5);
  curve(g, m + 3.4, P.ombroY + 8.4, m + 4.6, P.ombroY + 8.3, m + 5.6, P.ombroY + 7.9, 0.6, INK, 0.5);
  headShadow(g, lado);
}

function suitBack(g: CanvasRenderingContext2D, lado: number): void {
  lit(g, traceTorso, T.cima, T.cimaSombra, lado, OUTLINE, 2.4, 1);
  const c = P.troncoX - 0.4;
  const yP = P.pescocoY;
  const dn = P.desnivel;
  // Colarinho da camisa, uma tira acima da gola.
  g.beginPath();
  g.moveTo(c - 4.2, yP + 0.2 - dn * 0.2);
  g.quadraticCurveTo(c - 0.2, yP - 2.6, c + 3.8, yP - 0.7 + dn * 0.2);
  g.lineTo(c + 4.2, yP + 1 + dn * 0.2);
  g.quadraticCurveTo(c - 0.2, yP - 0.8, c - 4.6, yP + 1.8 - dn * 0.2);
  g.closePath();
  g.fillStyle = T.camisa;
  g.fill();
  g.lineWidth = 0.7;
  g.strokeStyle = INK;
  g.stroke();
  // Gola do paletó.
  g.beginPath();
  g.moveTo(c - 4.8, yP + 1.2 - dn * 0.2);
  g.quadraticCurveTo(c - 0.2, yP - 1.5, c + 4.3, yP + 0.3 + dn * 0.2);
  g.lineTo(c + 5, yP + 2.3 + dn * 0.2);
  g.quadraticCurveTo(c - 0.2, yP + 0.6, c - 5.5, yP + 3.3 - dn * 0.2);
  g.closePath();
  g.fillStyle = T.cimaLuz;
  g.fill();
  g.lineWidth = DETAIL;
  g.stroke();
  // Costura do meio das costas e a fenda embaixo.
  const yB = P.barraY;
  const meio = P.troncoX - 2.2;
  curve(g, meio + 1, yP + 2.4, meio - 0.6, (yP + yB) / 2, P.baseX - 2, yB - 4, 0.6, INK, 0.4);
  curve(g, P.baseX - 2, yB - 4.6, P.baseX - 2.1, yB - 1.5, P.baseX - 1.9, yB + 1.7, DETAIL, INK, 0.9);
  headShadow(g, lado);
}

function vestFront(g: CanvasRenderingContext2D, lado: number): void {
  lit(g, traceTorso, T.camisa, T.camisaSombra, lado, OUTLINE, 2.2, 1);
  lit(g, traceVest, T.cima, T.cimaSombra, lado, DETAIL, 2, 1);
  const m = P.troncoX + 2.2;
  const yP = P.pescocoY;
  const yV = P.ombroY + 9.6;
  // Colarinho aberto, sem gravata.
  g.beginPath();
  g.moveTo(m - 3.8, yP - 0.9);
  g.lineTo(m - 0.9, yP + 1.6);
  g.lineTo(m - 3, yP + 3.4);
  g.closePath();
  g.moveTo(m + 3, yP - 1.4);
  g.lineTo(m + 0.9, yP + 1.4);
  g.lineTo(m + 2.4, yP + 2.8);
  g.closePath();
  g.fillStyle = T.camisa;
  g.fill();
  g.lineWidth = 0.7;
  g.strokeStyle = INK;
  g.stroke();
  // A carcela da camisa, no decote.
  curve(g, m, yP + 2.2, m + 0.3, (yP + yV) / 2, m + 0.4, yV - 0.6, 0.5, INK, 0.45);
  // Botões do colete.
  const yB = P.barraY;
  for (let i = 0; i < 3; i += 1) {
    const t = (i + 0.6) / 3.4;
    dot(g, m + 0.4 - t * 0.3, yV + (yB + 1.4 - yV) * t, 0.55, 0.55, INK);
  }
  // Bolsinho do colete.
  curve(g, P.baseX - B.cinturaLargura + 1.6, P.cinturaY - 1.2, P.baseX - 4, P.cinturaY - 0.6, P.baseX - 2.6, P.cinturaY - 0.7, 0.6, INK, 0.5);
  headShadow(g, lado);
}

function vestBack(g: CanvasRenderingContext2D, lado: number): void {
  lit(g, traceTorso, T.camisa, T.camisaSombra, lado, OUTLINE, 2.2, 1);
  lit(g, traceVest, T.cimaLonge, T.cimaSombra, lado, DETAIL, 2, 1);
  const c = P.troncoX - 0.4;
  const yP = P.pescocoY;
  const dn = P.desnivel;
  // Colarinho da camisa.
  g.beginPath();
  g.moveTo(c - 4.2, yP + 0.2 - dn * 0.2);
  g.quadraticCurveTo(c - 0.2, yP - 2.6, c + 3.8, yP - 0.7 + dn * 0.2);
  g.lineTo(c + 4.2, yP + 1.2 + dn * 0.2);
  g.quadraticCurveTo(c - 0.2, yP - 0.4, c - 4.6, yP + 2 - dn * 0.2);
  g.closePath();
  g.fillStyle = T.camisa;
  g.fill();
  g.lineWidth = 0.7;
  g.strokeStyle = INK;
  g.stroke();
  // Costura do meio e a tira de ajuste, com a fivela.
  const yC = P.cinturaY;
  const meio = P.troncoX - 2;
  curve(g, meio + 0.8, yP + 2.6, meio - 0.4, (yP + yC) / 2, P.baseX - 1.8, P.barraY + 1.4, 0.6, INK, 0.4);
  g.beginPath();
  g.moveTo(P.baseX - 6, yC - 2.6);
  g.lineTo(P.baseX + 3.4, yC - 1.2);
  g.lineWidth = 1.5;
  g.strokeStyle = INK;
  g.stroke();
  g.lineWidth = 0.8;
  g.strokeStyle = T.cimaLuz;
  g.stroke();
  g.fillStyle = "#b9b4a6";
  g.fillRect(P.baseX - 2.6, yC - 3, 1.7, 1.9);
  g.lineWidth = 0.5;
  g.strokeStyle = INK;
  g.strokeRect(P.baseX - 2.6, yC - 3, 1.7, 1.9);
  headShadow(g, lado);
}

/** Camisa sem paletó, de mangas dobradas: colarinho aberto, carcela com botões e um bolso no peito. */
function shirtFront(g: CanvasRenderingContext2D, lado: number): void {
  lit(g, traceTorso, T.camisa, T.camisaSombra, lado, OUTLINE, 2.2, 1);
  const m = P.troncoX + 2.2;
  const yP = P.pescocoY;
  const yB = P.barraY;
  // Colarinho aberto, sem gravata.
  g.beginPath();
  g.moveTo(m - 3.8, yP - 0.9);
  g.lineTo(m - 0.9, yP + 1.6);
  g.lineTo(m - 3, yP + 3.4);
  g.closePath();
  g.moveTo(m + 3, yP - 1.4);
  g.lineTo(m + 0.9, yP + 1.4);
  g.lineTo(m + 2.4, yP + 2.8);
  g.closePath();
  g.fillStyle = T.camisa;
  g.fill();
  g.lineWidth = 0.7;
  g.strokeStyle = INK;
  g.stroke();
  // A carcela, do decote à barra, e os botões.
  const fim = P.baseX + 2.6;
  curve(g, m, yP + 2.2, m + 0.5, (yP + yB) / 2, fim, yB + 1.2, 0.5, INK, 0.45);
  for (let i = 0; i < 4; i += 1) {
    const t = (i + 0.7) / 4.2;
    dot(g, m + (fim - m) * t, yP + 2.6 + (yB - yP - 1.6) * t, 0.5, 0.5, INK);
  }
  // Bolso do peito, do lado de perto.
  curve(g, m - 6.4, P.ombroY + 7.6, m - 5, P.ombroY + 7.9, m - 3.6, P.ombroY + 7.4, 0.6, INK, 0.5);
  curve(g, m - 6.3, P.ombroY + 7.8, m - 6.2, P.ombroY + 11.4, m - 3.8, P.ombroY + 11.2, 0.6, INK, 0.4);
  headShadow(g, lado);
}

function shirtBack(g: CanvasRenderingContext2D, lado: number): void {
  lit(g, traceTorso, T.camisa, T.camisaSombra, lado, OUTLINE, 2.2, 1);
  const c = P.troncoX - 0.4;
  const yP = P.pescocoY;
  const dn = P.desnivel;
  // Colarinho.
  g.beginPath();
  g.moveTo(c - 4.2, yP + 0.2 - dn * 0.2);
  g.quadraticCurveTo(c - 0.2, yP - 2.6, c + 3.8, yP - 0.7 + dn * 0.2);
  g.lineTo(c + 4.2, yP + 1.2 + dn * 0.2);
  g.quadraticCurveTo(c - 0.2, yP - 0.4, c - 4.6, yP + 2 - dn * 0.2);
  g.closePath();
  g.fillStyle = T.camisa;
  g.fill();
  g.lineWidth = 0.7;
  g.strokeStyle = INK;
  g.stroke();
  // A pala das costas e a costura do meio.
  curve(g, c - 7.4, yP + 6.2 - dn * 0.3, c - 0.2, yP + 7, c + 7, yP + 6.2 + dn * 0.3, 0.6, INK, 0.4);
  curve(g, c - 0.2, yP + 7, c - 1.2, (yP + P.barraY) / 2, P.baseX - 1.8, P.barraY + 1.2, 0.6, INK, 0.35);
  headShadow(g, lado);
}

/** A pasta de documentos debaixo do braço de perto. */
function folder(g: CanvasRenderingContext2D): void {
  const frente = P.frente ? 1 : -1;
  const braco = P.bracoPerto;
  // Eixos da pasta: o comprimento vai para a frente do corpo, a altura sobe.
  const ux = AX;
  const uy = frente * 0.24;
  const ox = braco.x2 - ux * 9.2;
  const oy = braco.y2 - uy * 9.2 + 1.6;
  const comprimento = 14.5;
  const altura = 10.4;
  // Folhas que sobram por cima.
  g.beginPath();
  g.moveTo(ox + ux * 1, oy + uy * 1 - altura - 1.1);
  g.lineTo(ox + ux * (comprimento - 1.4), oy + uy * (comprimento - 1.4) - altura - 1.1);
  g.lineTo(ox + ux * (comprimento - 1.4), oy + uy * (comprimento - 1.4) - altura + 1);
  g.lineTo(ox + ux * 1, oy + uy * 1 - altura + 1);
  g.closePath();
  g.fillStyle = "#f4f0e6";
  g.fill();
  g.lineWidth = 0.7;
  g.strokeStyle = INK;
  g.stroke();
  // A capa, com a aba.
  g.beginPath();
  g.moveTo(ox, oy);
  g.lineTo(ox + ux * comprimento, oy + uy * comprimento);
  g.lineTo(ox + ux * comprimento, oy + uy * comprimento - altura);
  g.lineTo(ox + ux * 6.4, oy + uy * 6.4 - altura);
  g.lineTo(ox + ux * 5.6, oy + uy * 5.6 - altura - 1.5);
  g.lineTo(ox + ux * 1.6, oy + uy * 1.6 - altura - 1.5);
  g.lineTo(ox + ux * 0.9, oy + uy * 0.9 - altura);
  g.lineTo(ox, oy - altura);
  g.closePath();
  g.fillStyle = T.pasta;
  g.fill();
  g.lineWidth = FINE;
  g.strokeStyle = INK;
  g.stroke();
  // A dobra da lombada.
  curve(g, ox + ux * 1.1, oy + uy * 1.1 - 0.6, ox + ux * 1.2, oy + uy * 1.2 - altura / 2, ox + ux * 1.3, oy + uy * 1.3 - altura + 0.6, 0.6, INK, 0.35);
}

/** O corpo inteiro, menos a cabeça, na ordem de profundidade da vista. */
export function drawBody(g: CanvasRenderingContext2D, spec: BodySpec, pose: Pose, lado: number, comPasta: boolean): void {
  P = pose;
  B = spec.build;
  T = spec.tintas;

  // A sombra encolhe um pouco quando o corpo sobe no passo.
  const raio = B.peito + 3.2 - (1 - pose.afunda) * 0.6;
  groundShadow(g, pose.baseX * 0.5, 0.6, raio, raio * 0.44, SHADOW);

  arm(g, spec, pose.bracoLonge, true, lado);
  // A perna que está mais perto da câmera fica por cima.
  if (pose.pernaPerto.perto >= pose.pernaLonge.perto) {
    leg(g, pose.pernaLonge, true, lado);
    leg(g, pose.pernaPerto, false, lado);
  } else {
    leg(g, pose.pernaPerto, false, lado);
    leg(g, pose.pernaLonge, true, lado);
  }
  neck(g);
  if (spec.roupa === "terno") {
    if (pose.frente) suitFront(g, lado);
    else suitBack(g, lado);
  } else if (spec.roupa === "colete") {
    if (pose.frente) vestFront(g, lado);
    else vestBack(g, lado);
  } else if (pose.frente) shirtFront(g, lado);
  else shirtBack(g, lado);
  if (comPasta) folder(g);
  arm(g, spec, pose.bracoPerto, false, lado);
}
