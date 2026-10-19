// A interface sobre a cena do Vale a Faixa, desenhada no canvas para andar
// com os quadros: as placas com nome e barra de equilíbrio, o medidor da
// faixa quando alguém está no topo, a dica curta perto do personagem quando
// há o que fazer, a legenda discreta dos comandos, a contagem de abertura e
// o comentário do narrador. Pausa, fim e tutorial ficam em React
// (ValeAFaixa.tsx).

import { REGRAS, naEscada } from "@/lib/faixa/regras";
import type { Dica, Partida } from "@/lib/faixa/tipos";

import { FONTE_SANS, FONTE_SERIF } from "./arena";
import type { Tela } from "./camera";
import { AMARELO, VERDE } from "./escada";

const PAPEL = "#f4f0e7";
const TINTA = "#1c241e";
const PALCO = "rgba(17, 22, 19, 0.86)";
const LINHA = "#3f4a43";

export interface Fala {
  texto: string;
  t: number;
}

export interface EstadoDoHud {
  nomes: readonly [string, string];
  dica: Dica;
  /** A pessoa usa teclado: a dica mostra a tecla, e a legenda aparece. */
  teclado: boolean;
  tempo: number;
  fala: Fala | null;
  movimento: boolean;
  /** Em tela estreita, as placas encolhem. */
  compacto: boolean;
  /** A cabeça do jogador na tela, para a dica ficar perto dele. */
  cabecaDoJogador: { x: number; y: number } | null;
}

/** O texto da dica perto do personagem, no teclado e no toque. */
export const ROTULO_DA_DICA: Record<NonNullable<Dica>, { teclado: string; toque: string }> = {
  pegarEscada: { teclado: "C — Pegar", toque: "Pegar" },
  posicionarEscada: { teclado: "C — Posicionar", toque: "Posicionar" },
  soltarEscada: { teclado: "C — Largar", toque: "Largar" },
  subir: { teclado: "↑ — Subir", toque: "▲ Subir" },
  puxarFaixa: { teclado: "Segure C — Pegar faixa", toque: "Segure — Pegar faixa" },
};

export const LEGENDA = "Setas: mover • Z: atacar • X: defender • C: interagir";

function caixa(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, raio: number): void {
  g.beginPath();
  g.moveTo(x + raio, y);
  g.lineTo(x + w - raio, y);
  g.quadraticCurveTo(x + w, y, x + w, y + raio);
  g.lineTo(x + w, y + h - raio);
  g.quadraticCurveTo(x + w, y + h, x + w - raio, y + h);
  g.lineTo(x + raio, y + h);
  g.quadraticCurveTo(x, y + h, x, y + h - raio);
  g.lineTo(x, y + raio);
  g.quadraticCurveTo(x, y, x + raio, y);
  g.closePath();
}

function placa(g: CanvasRenderingContext2D, p: Partida, i: 0 | 1, estado: EstadoDoHud, tela: Tela): void {
  const l = p.lutadores[i];
  const direita = i === 1;
  const largura = estado.compacto ? Math.min(170, tela.largura / 2 - 20) : 230;
  const alturaDaPlaca = estado.compacto ? 54 : 62;
  const x = direita ? tela.largura - 12 - largura : 12;
  const y = 12;
  g.fillStyle = PALCO;
  caixa(g, x, y, largura, alturaDaPlaca, 6);
  g.fill();
  g.lineWidth = 1;
  g.strokeStyle = LINHA;
  g.stroke();

  const nome = estado.nomes[i].toUpperCase();
  const noChao = l.estado === "caido" || l.estado === "levantando";
  const situacao = noChao ? " · NO CHÃO" : naEscada(l) ? " · NA ESCADA" : l.estado === "defesa" ? " · DEFENDENDO" : "";
  const papel = `${i === 0 ? "VOCÊ" : "COMPUTADOR"}${situacao}`;
  g.textBaseline = "alphabetic";
  g.textAlign = direita ? "right" : "left";
  g.fillStyle = noChao || l.estado === "defesa" ? AMARELO : "#b9aedb";
  g.font = `600 ${estado.compacto ? 9 : 10}px ${FONTE_SANS}`;
  g.fillText(papel, direita ? x + largura - 10 : x + 10, y + 16);
  g.fillStyle = "#faf8f2";
  g.font = `700 ${estado.compacto ? 13 : 16}px ${FONTE_SANS}`;
  g.fillText(nome, direita ? x + largura - 10 : x + 10, y + (estado.compacto ? 31 : 36));

  // A barra de equilíbrio.
  const barraX = x + 10;
  const barraY = y + alturaDaPlaca - 16;
  const barraW = largura - 20;
  const barraH = 9;
  g.fillStyle = "#2a332d";
  caixa(g, barraX, barraY, barraW, barraH, 3);
  g.fill();
  const fracao = Math.max(0, Math.min(1, l.equilibrio / REGRAS.equilibrio));
  const baixo = fracao < 0.3;
  const pisca = baixo && estado.movimento && Math.sin(estado.tempo * 14) > 0;
  const cheio = barraW * fracao;
  if (cheio > 0) {
    g.fillStyle = pisca ? "#fff0c2" : fracao > 0.55 ? AMARELO : fracao > 0.3 ? "#e59a3c" : "#d9573b";
    caixa(g, direita ? barraX + barraW - cheio : barraX, barraY, cheio, barraH, 3);
    g.fill();
  }
  g.lineWidth = 1;
  g.strokeStyle = "#1b1c1a";
  caixa(g, barraX, barraY, barraW, barraH, 3);
  g.stroke();
}

function medidorDaFaixa(g: CanvasRenderingContext2D, p: Partida, estado: EstadoDoHud, tela: Tela): void {
  const quem = p.lutadores.findIndex((l) => naEscada(l) || (l.estado === "caindoDaEscada" && l.puxada > 0));
  if (quem < 0 && p.fase !== "fim") return;
  const i = (quem < 0 ? p.vencedor ?? 0 : quem) as 0 | 1;
  const l = p.lutadores[i];
  const largura = Math.min(260, tela.largura - 24);
  const x = (tela.largura - largura) / 2;
  const y = estado.compacto ? 114 : 86;
  const altura = 46;
  g.fillStyle = PALCO;
  caixa(g, x, y, largura, altura, 6);
  g.fill();
  g.lineWidth = 1;
  g.strokeStyle = LINHA;
  g.stroke();

  const noTopo = l.estado === "noTopo";
  let rotulo = l.estado === "subindo" ? `${estado.nomes[i].toUpperCase()} SUBINDO` : `${estado.nomes[i].toUpperCase()} NA FAIXA`;
  if (noTopo && !l.puxando && i === 0) rotulo = estado.teclado ? "SEGURE C PARA PUXAR" : "SEGURE O BOTÃO PARA PUXAR";
  if (p.fase === "fim") rotulo = "FAIXA CONQUISTADA";
  g.textAlign = "center";
  g.textBaseline = "alphabetic";
  g.fillStyle = "#faf8f2";
  g.font = `700 11px ${FONTE_SANS}`;
  g.fillText(rotulo, tela.largura / 2, y + 17);

  const barraX = x + 12;
  const barraY = y + 26;
  const barraW = largura - 24;
  const barraH = 11;
  g.fillStyle = "#2a332d";
  caixa(g, barraX, barraY, barraW, barraH, 4);
  g.fill();
  const cheio = barraW * Math.max(0, Math.min(1, l.puxada));
  if (cheio > 0) {
    const grad = g.createLinearGradient(barraX, 0, barraX + barraW, 0);
    grad.addColorStop(0, VERDE);
    grad.addColorStop(1, AMARELO);
    g.fillStyle = grad;
    caixa(g, barraX, barraY, cheio, barraH, 4);
    g.fill();
  }
  g.lineWidth = 1;
  g.strokeStyle = "#1b1c1a";
  caixa(g, barraX, barraY, barraW, barraH, 4);
  g.stroke();
}

/** A dica curta sobre a cabeça do jogador, só quando a ação está disponível. */
function dicaPertoDoPersonagem(g: CanvasRenderingContext2D, estado: EstadoDoHud, tela: Tela, p: Partida): void {
  if (estado.dica === null || p.fase !== "luta" || estado.cabecaDoJogador === null) return;
  if (estado.dica === "puxarFaixa" && p.lutadores[0].puxando) return;
  const texto = estado.teclado ? ROTULO_DA_DICA[estado.dica].teclado : ROTULO_DA_DICA[estado.dica].toque;
  g.font = `700 12px ${FONTE_SANS}`;
  const largura = g.measureText(texto).width + 20;
  const altura = 26;
  const x = Math.max(8, Math.min(tela.largura - largura - 8, estado.cabecaDoJogador.x - largura / 2));
  const y = Math.max(8, estado.cabecaDoJogador.y - 34 - altura);
  const destaque = estado.dica === "puxarFaixa" || estado.dica === "posicionarEscada";
  g.fillStyle = destaque ? AMARELO : PAPEL;
  caixa(g, x, y, largura, altura, 6);
  g.fill();
  g.lineWidth = 1.5;
  g.strokeStyle = TINTA;
  g.stroke();
  // A ponta, apontando para a cabeça.
  const px = Math.max(x + 10, Math.min(x + largura - 10, estado.cabecaDoJogador.x));
  g.beginPath();
  g.moveTo(px - 6, y + altura);
  g.lineTo(px, y + altura + 7);
  g.lineTo(px + 6, y + altura);
  g.closePath();
  g.fillStyle = destaque ? AMARELO : PAPEL;
  g.fill();
  g.lineWidth = 1.5;
  g.strokeStyle = TINTA;
  g.stroke();
  g.fillStyle = destaque ? AMARELO : PAPEL;
  g.fillRect(px - 5.5, y + altura - 2, 11, 3);
  g.fillStyle = TINTA;
  g.textAlign = "left";
  g.textBaseline = "middle";
  g.fillText(texto, x + 10, y + altura / 2 + 0.5);
}

/** A legenda discreta dos comandos, embaixo, só para quem usa teclado. */
function legenda(g: CanvasRenderingContext2D, estado: EstadoDoHud, tela: Tela, p: Partida): void {
  if (!estado.teclado || p.fase === "fim") return;
  g.save();
  g.globalAlpha = 0.72;
  g.font = `600 11px ${FONTE_SANS}`;
  g.textAlign = "center";
  g.textBaseline = "alphabetic";
  const largura = g.measureText(LEGENDA).width + 20;
  const x = (tela.largura - largura) / 2;
  const y = tela.altura - 26;
  g.fillStyle = PALCO;
  caixa(g, x, y, largura, 20, 10);
  g.fill();
  g.fillStyle = "#c5cbc2";
  g.fillText(LEGENDA, tela.largura / 2, y + 14);
  g.restore();
}

function contagem(g: CanvasRenderingContext2D, p: Partida, estado: EstadoDoHud, tela: Tela): void {
  let texto: string | null = null;
  let u = 0;
  if (p.fase === "contagem") {
    const decorrido = REGRAS.contagem - p.contagem;
    const passo = 0.8;
    const indice = Math.min(2, Math.floor(decorrido / passo));
    texto = String(3 - indice);
    u = (decorrido - indice * passo) / passo;
  } else if (p.fase === "luta" && p.tempo < REGRAS.contagem + 1) {
    texto = "VALE A FAIXA!";
    u = (p.tempo - REGRAS.contagem) / 1;
  }
  if (texto === null) return;
  const escala = estado.movimento ? 1.35 - 0.35 * Math.min(1, u * 4) : 1;
  const alfa = u > 0.75 ? 1 - (u - 0.75) / 0.25 : 1;
  g.save();
  g.translate(tela.largura / 2, tela.altura * 0.4);
  g.scale(escala, escala);
  g.globalAlpha = alfa;
  const tamanho = texto.length > 2 ? Math.min(64, tela.largura / 9) : 110;
  g.font = `800 ${tamanho}px ${FONTE_SANS}`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.lineWidth = 8;
  g.lineJoin = "round";
  g.strokeStyle = TINTA;
  g.strokeText(texto, 0, 0);
  g.fillStyle = texto.length > 2 ? AMARELO : PAPEL;
  g.fillText(texto, 0, 0);
  g.restore();
}

function narrador(g: CanvasRenderingContext2D, estado: EstadoDoHud, tela: Tela): void {
  if (estado.fala === null) return;
  const { texto, t } = estado.fala;
  const duracao = 2.4;
  if (t > duracao) return;
  const entrada = Math.min(1, t / 0.18);
  const saida = t > duracao - 0.3 ? (duracao - t) / 0.3 : 1;
  const alfa = estado.movimento ? Math.min(entrada, saida) : t > duracao - 0.05 ? 0 : 1;
  const desloca = estado.movimento ? (1 - entrada) * -10 : 0;
  g.save();
  g.globalAlpha = alfa;
  const tamanho = estado.compacto ? 15 : 19;
  g.font = `500 ${tamanho}px ${FONTE_SERIF}`;
  const maxLargura = tela.largura - 40;
  let fonteFinal = tamanho;
  while (g.measureText(texto).width > maxLargura - 32 && fonteFinal > 11) {
    fonteFinal -= 1;
    g.font = `500 ${fonteFinal}px ${FONTE_SERIF}`;
  }
  const largura = Math.min(maxLargura, g.measureText(texto).width + 32);
  const x = (tela.largura - largura) / 2;
  const y = (estado.compacto ? 170 : 146) + desloca;
  g.fillStyle = PAPEL;
  caixa(g, x, y, largura, 36, 4);
  g.fill();
  g.lineWidth = 1.5;
  g.strokeStyle = TINTA;
  g.stroke();
  g.fillStyle = "#b24a00";
  g.fillRect(x, y, 4, 36);
  g.fillStyle = TINTA;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(texto, tela.largura / 2 + 2, y + 18.5);
  g.restore();
}

export function desenharHud(g: CanvasRenderingContext2D, tela: Tela, p: Partida, estado: EstadoDoHud): void {
  g.save();
  g.setTransform(g.getTransform());
  placa(g, p, 0, estado, tela);
  placa(g, p, 1, estado, tela);
  medidorDaFaixa(g, p, estado, tela);
  dicaPertoDoPersonagem(g, estado, tela, p);
  legenda(g, estado, tela, p);
  narrador(g, estado, tela);
  contagem(g, p, estado, tela);
  g.restore();
}
