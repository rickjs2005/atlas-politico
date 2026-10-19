// A escada e a faixa do Vale a Faixa. A escada é de alumínio, com degraus
// legíveis, e tem quatro desenhos: em pé (com oscilação quando chacoalhada e
// o tombo quando derrubada), caída no tapete e carregada no ombro. A faixa
// presidencial fica pendurada por um cabo sobre o centro do ringue: verde e
// amarela, com roseta, balançando de leve; quando alguém puxa, desce e treme.

import { INK } from "@/features/game/draw/kit";
import { REGRAS } from "@/lib/faixa/regras";
import type { Partida } from "@/lib/faixa/tipos";

import type { Projecao } from "./camera";

const TAU = Math.PI * 2;
const ALUMINIO = "#cfd3d8";
const ALUMINIO_SOMBRA = "#9ba2aa";
const ALUMINIO_LUZ = "#eef1f4";
export const VERDE = "#1f8f4a";
export const VERDE_ESCURO = "#156a36";
export const AMARELO = "#f0c66b";
const DEGRAUS = 7;

/** O ângulo de oscilação, pela escada e pelo tempo. */
export function oscilacao(balanco: number, tempo: number, movimento: boolean): number {
  if (!movimento || balanco <= 0) return 0;
  return Math.sin(tempo * 26) * balanco * 0.075;
}

/** O giro do tombo: acelera, como uma escada que cai. */
export function anguloDoTombo(queda: number, direcao: 1 | -1): number {
  return direcao * queda * queda * (Math.PI / 2);
}

/** Desenha a escada em pé com a base em `baseX`, girada por `angulo` em torno da base (positivo tomba para a direita). */
export function desenharEscadaEmPe(g: CanvasRenderingContext2D, pr: Projecao, baseX: number, angulo: number): void {
  const s = pr.s;
  g.save();
  g.translate(pr.X(baseX), pr.Y(0));
  g.scale(s, s);
  g.rotate(angulo);
  g.lineCap = "round";
  g.lineJoin = "round";
  const h = REGRAS.escada.altura;

  // A perna de trás, mais fina e mais escura, com a dobradiça no topo.
  g.lineWidth = 11;
  g.strokeStyle = INK;
  g.beginPath();
  g.moveTo(30, 0);
  g.lineTo(17, -h + 4);
  g.stroke();
  g.lineWidth = 7;
  g.strokeStyle = ALUMINIO_SOMBRA;
  g.stroke();
  // Travessas da perna de trás.
  for (let i = 1; i <= 3; i += 1) {
    const y = (-h * i) / 4;
    const u = -y / h;
    const xTras = 30 - 13 * u;
    const xFrente = 22 - 6 * u;
    g.beginPath();
    g.moveTo(xTras, y);
    g.lineTo(xFrente, y - 6);
    g.lineWidth = 4;
    g.strokeStyle = ALUMINIO_SOMBRA;
    g.stroke();
  }

  // Os dois montantes da frente.
  for (const lado of [-1, 1] as const) {
    g.beginPath();
    g.moveTo(lado * 23, 0);
    g.lineTo(lado * 17, -h);
    g.lineWidth = 14;
    g.strokeStyle = INK;
    g.stroke();
    g.lineWidth = 9.5;
    g.strokeStyle = ALUMINIO;
    g.stroke();
    g.beginPath();
    g.moveTo(lado * 23 - 2.5, 0);
    g.lineTo(lado * 17 - 2.5, -h);
    g.lineWidth = 2;
    g.strokeStyle = ALUMINIO_LUZ;
    g.stroke();
    // Pé de borracha.
    g.beginPath();
    g.rect(lado * 23 - 7, -3, 14, 7);
    g.fillStyle = INK;
    g.fill();
  }

  // Os degraus.
  for (let i = 1; i <= DEGRAUS; i += 1) {
    const y = (-h * i) / (DEGRAUS + 1);
    const u = -y / h;
    const meia = 23 - 6 * u;
    g.beginPath();
    g.moveTo(-meia, y);
    g.lineTo(meia, y);
    g.lineWidth = 10;
    g.strokeStyle = INK;
    g.stroke();
    g.lineWidth = 6.5;
    g.strokeStyle = ALUMINIO;
    g.stroke();
    g.beginPath();
    g.moveTo(-meia + 3, y - 1.5);
    g.lineTo(meia - 3, y - 1.5);
    g.lineWidth = 1.5;
    g.strokeStyle = ALUMINIO_LUZ;
    g.stroke();
  }

  // O topo: a plataforma, com a faixa de aviso amarela.
  g.beginPath();
  g.rect(-22, -h - 7, 44, 9);
  g.fillStyle = ALUMINIO;
  g.fill();
  g.lineWidth = 2.2;
  g.strokeStyle = INK;
  g.stroke();
  g.beginPath();
  g.rect(-19, -h - 5, 38, 3);
  g.fillStyle = AMARELO;
  g.fill();
  g.restore();
}

/** A escada caída, com o centro em `centroX`, deitada para o lado `direcao`. */
export function desenharEscadaCaida(g: CanvasRenderingContext2D, pr: Projecao, centroX: number, direcao: 1 | -1): void {
  const s = pr.s;
  const h = REGRAS.escada.altura;
  g.save();
  g.translate(pr.X(centroX), pr.Y(0));
  g.scale(s * direcao, s);
  g.lineCap = "round";
  g.lineJoin = "round";
  // Sombra no tapete.
  g.beginPath();
  g.ellipse(0, 6, h / 2 + 6, 10, 0, 0, TAU);
  g.fillStyle = "rgba(20, 24, 20, 0.22)";
  g.fill();
  // Dois montantes vistos de cima, com a largura encurtada pela perspectiva.
  for (const y of [-14, 4]) {
    g.beginPath();
    g.moveTo(-h / 2, y);
    g.lineTo(h / 2, y);
    g.lineWidth = 11;
    g.strokeStyle = INK;
    g.stroke();
    g.lineWidth = 7;
    g.strokeStyle = y < 0 ? ALUMINIO : ALUMINIO_SOMBRA;
    g.stroke();
  }
  for (let i = 0; i <= DEGRAUS + 1; i += 1) {
    const x = -h / 2 + (h * i) / (DEGRAUS + 1);
    g.beginPath();
    g.moveTo(x, -14);
    g.lineTo(x, 4);
    g.lineWidth = 8;
    g.strokeStyle = INK;
    g.stroke();
    g.lineWidth = 4.5;
    g.strokeStyle = ALUMINIO;
    g.stroke();
  }
  // A plataforma do topo, na ponta para onde a escada tombou.
  g.beginPath();
  g.rect(h / 2 - 4, -19, 8, 28);
  g.fillStyle = ALUMINIO;
  g.fill();
  g.lineWidth = 2;
  g.strokeStyle = INK;
  g.stroke();
  g.beginPath();
  g.rect(h / 2 - 2, -17, 4, 24);
  g.fillStyle = AMARELO;
  g.fill();
  g.restore();
}

/** A escada no ombro de quem a carrega: horizontal, à altura do ombro, balançando com o passo. */
export function desenharEscadaCarregada(g: CanvasRenderingContext2D, pr: Projecao, x: number, direcao: 1 | -1, bob: number): void {
  const s = pr.s;
  const h = REGRAS.escada.altura;
  g.save();
  g.translate(pr.X(x), pr.Y(128 + bob));
  g.scale(s * direcao, s);
  g.rotate(-0.09);
  g.lineCap = "round";
  g.lineJoin = "round";
  for (const y of [-12, 10]) {
    g.beginPath();
    g.moveTo(-h / 2 + 10, y);
    g.lineTo(h / 2 + 10, y);
    g.lineWidth = 12;
    g.strokeStyle = INK;
    g.stroke();
    g.lineWidth = 8;
    g.strokeStyle = y < 0 ? ALUMINIO : ALUMINIO_SOMBRA;
    g.stroke();
  }
  for (let i = 0; i <= DEGRAUS + 1; i += 1) {
    const px = -h / 2 + 10 + (h * i) / (DEGRAUS + 1);
    g.beginPath();
    g.moveTo(px, -12);
    g.lineTo(px, 10);
    g.lineWidth = 8;
    g.strokeStyle = INK;
    g.stroke();
    g.lineWidth = 4.5;
    g.strokeStyle = ALUMINIO;
    g.stroke();
  }
  g.restore();
}

/**
 * A faixa pendurada. `puxada` é o progresso de quem está puxando (0 a 1) e
 * `presa` diz se ela ainda está no gancho: depois da vitória, vai para o peito
 * do vencedor e sobra o cabo vazio.
 */
export function desenharFaixa(g: CanvasRenderingContext2D, pr: Projecao, p: Partida, tempo: number, movimento: boolean, puxada: number, presa: boolean): void {
  const s = pr.s;
  const topoDaTela = -20;
  const gancho = REGRAS.faixa.altura + 8;
  const balanco = movimento ? Math.sin(tempo * 1.3) * 0.035 + Math.sin(tempo * 17) * p.faixaBalanco * 0.09 : 0;
  // O cabo, do alto da tela até o gancho.
  g.beginPath();
  g.moveTo(pr.X(0), topoDaTela);
  g.lineTo(pr.X(0), pr.Y(gancho));
  g.lineWidth = Math.max(1.5, 2.5 * s);
  g.strokeStyle = "#6c7370";
  g.stroke();
  // O gancho.
  g.save();
  g.translate(pr.X(0), pr.Y(gancho));
  g.scale(s, s);
  g.beginPath();
  g.arc(0, 6, 7, Math.PI * 1.1, Math.PI * 0.1, true);
  g.lineWidth = 3.5;
  g.strokeStyle = "#8d9491";
  g.stroke();
  g.restore();
  if (!presa) return;

  g.save();
  g.translate(pr.X(0), pr.Y(gancho) + puxada * 22 * s);
  g.scale(s, s);
  g.rotate(balanco);
  g.lineJoin = "round";
  g.lineCap = "round";
  const estica = 1 + puxada * 0.12;
  // As duas pontas da faixa, penduradas pelo meio.
  for (const lado of [-1, 1] as const) {
    g.save();
    g.rotate(lado * (0.16 + puxada * 0.1));
    g.beginPath();
    g.moveTo(-9, 2);
    g.lineTo(9, 2);
    g.lineTo(11, 74 * estica);
    g.lineTo(0, 66 * estica);
    g.lineTo(-11, 74 * estica);
    g.closePath();
    g.fillStyle = VERDE;
    g.fill();
    g.lineWidth = 2.2;
    g.strokeStyle = INK;
    g.stroke();
    g.beginPath();
    g.moveTo(-2.5, 3);
    g.lineTo(2.5, 3);
    g.lineTo(2.5, 64 * estica);
    g.lineTo(-2.5, 64 * estica);
    g.closePath();
    g.fillStyle = AMARELO;
    g.fill();
    // A sombra de um lado, para dar volume.
    g.beginPath();
    g.moveTo(-9, 2);
    g.lineTo(-5, 2);
    g.lineTo(-7, 72 * estica);
    g.lineTo(-11, 74 * estica);
    g.closePath();
    g.fillStyle = "rgba(0, 0, 0, 0.22)";
    g.fill();
    g.restore();
  }
  // A roseta, no nó.
  g.beginPath();
  g.arc(0, 8, 14, 0, TAU);
  g.fillStyle = AMARELO;
  g.fill();
  g.lineWidth = 2.2;
  g.strokeStyle = INK;
  g.stroke();
  g.beginPath();
  g.arc(0, 8, 8.5, 0, TAU);
  g.fillStyle = VERDE;
  g.fill();
  g.lineWidth = 1.5;
  g.stroke();
  g.beginPath();
  g.arc(0, 8, 3.5, 0, TAU);
  g.fillStyle = "#3a5fa8";
  g.fill();
  // Brilho.
  g.beginPath();
  g.arc(-4, 3, 2.2, 0, TAU);
  g.fillStyle = "rgba(255, 252, 240, 0.85)";
  g.fill();
  g.restore();
}
