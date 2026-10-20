// A interface sobre a cena do Vale a Faixa, desenhada no canvas para andar
// com os quadros: as placas com nome e papel (você e o computador, ou os
// jogadores 1 e 2), a barra de equilíbrio e a barra da faixa de cada um
// (identificadas), o medidor grande da faixa quando alguém está na escada,
// com o aviso de que falta pouco, a dica curta perto de cada pessoa quando
// há o que fazer (com a tecla do esquema dela), o aviso de comando
// bloqueado, a legenda discreta dos comandos (uma linha por pessoa), a
// contagem de abertura (3, 2, 1, LUTEM!) e o comentário do narrador.
// Pausa, fim e preparação ficam em React (ValeAFaixa.tsx).

import { REGRAS, naEscada } from "@/lib/faixa/regras";
import type { Dica, Indice, MotivoDoBloqueio, Partida } from "@/lib/faixa/tipos";

import { rotuloDaDica, type Esquema } from "../esquemas";
import { FONTE_SANS, FONTE_SERIF } from "./arena";
import type { Tela } from "./camera";
import { AMARELO, VERDE } from "./escada";

const PAPEL = "#f4f0e7";
const TINTA = "#1c241e";
const PALCO = "rgba(17, 22, 19, 0.86)";
const LINHA = "#3f4a43";
const LILAS = "#b9aedb";

export interface Fala {
  texto: string;
  t: number;
}

export interface EstadoDoHud {
  nomes: readonly [string, string];
  /** O papel de cada um na placa: "VOCÊ" e "COMPUTADOR", ou "JOGADOR 1" e "JOGADOR 2". */
  papeis: readonly [string, string];
  /** Quem é pessoa: só pessoas recebem dica, aviso e o "segure para puxar". */
  humanos: readonly [boolean, boolean];
  /** A dica de cada um; `null` quando não há o que fazer ou para o computador. */
  dicas: readonly [Dica, Dica];
  /** O esquema de teclas de cada um, para a dica e a legenda; `null` no toque e para o computador. */
  esquemas: readonly [Esquema | null, Esquema | null];
  tempo: number;
  fala: Fala | null;
  /** O aviso de um comando que não saiu, para cada um, e há quanto tempo. */
  avisos: readonly [Fala | null, Fala | null];
  movimento: boolean;
  /** Em tela estreita, as placas encolhem. */
  compacto: boolean;
  /** A cabeça de cada um na tela, para a dica ficar perto dele. */
  cabecas: readonly [{ x: number; y: number } | null, { x: number; y: number } | null];
}

/** Por que o comando não saiu, em poucas palavras. */
export const ROTULO_DO_BLOQUEIO: Record<MotivoDoBloqueio, string> = {
  carregando: "Largue a escada para atacar ou pular",
  naEscada: "Na escada: só subir, descer e puxar",
  recarga: "Ainda recarregando",
  noAr: "Uma voadora por salto",
  noChao: "Solte a defesa para agir",
  agarrado: "Agarrado: só a esquiva escapa",
};

export const ROTULO_DA_PRORROGACAO = "PRORROGAÇÃO · A FAIXA AFROUXOU";
export const GRITO_DE_ABERTURA = "LUTEM!";

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

function barra(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fracao: number, cor: string | CanvasGradient, daDireita: boolean): void {
  g.fillStyle = "#2a332d";
  caixa(g, x, y, w, h, 3);
  g.fill();
  const cheio = w * Math.max(0, Math.min(1, fracao));
  if (cheio > 0) {
    g.fillStyle = cor;
    caixa(g, daDireita ? x + w - cheio : x, y, cheio, h, 3);
    g.fill();
  }
  g.lineWidth = 1;
  g.strokeStyle = "#1b1c1a";
  caixa(g, x, y, w, h, 3);
  g.stroke();
}

function placa(g: CanvasRenderingContext2D, p: Partida, i: Indice, estado: EstadoDoHud, tela: Tela): void {
  const l = p.lutadores[i];
  const direita = i === 1;
  const largura = estado.compacto ? Math.min(176, tela.largura / 2 - 18) : 240;
  const alturaDaPlaca = estado.compacto ? 70 : 80;
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
  const situacao = noChao
    ? " · NO CHÃO"
    : naEscada(l)
      ? " · NA ESCADA"
      : l.estado === "defesa"
        ? " · DEFENDENDO"
        : l.estado === "carregando"
          ? " · COM A ESCADA"
          : l.estado === "agarrado"
            ? " · AGARRADO"
            : l.estado === "arremessado"
              ? " · VOANDO"
              : "";
  const papel = `${estado.papeis[i]}${situacao}`;
  const bordaInterna = direita ? x + largura - 10 : x + 10;
  g.textBaseline = "alphabetic";
  g.textAlign = direita ? "right" : "left";
  g.fillStyle = noChao || l.estado === "defesa" ? AMARELO : LILAS;
  g.font = `600 ${estado.compacto ? 9 : 10}px ${FONTE_SANS}`;
  g.fillText(papel, bordaInterna, y + 15);
  g.fillStyle = "#faf8f2";
  g.font = `700 ${estado.compacto ? 13 : 16}px ${FONTE_SANS}`;
  g.fillText(nome, bordaInterna, y + (estado.compacto ? 29 : 33));

  // A barra de equilíbrio, com o rótulo; piscando quando está perto de cair.
  const barraX = x + 10;
  const barraW = largura - 20;
  const yEquilibrio = y + (estado.compacto ? 42 : 48);
  const fracao = l.equilibrio / REGRAS.equilibrio;
  const pisca = fracao < 0.3 && estado.movimento && Math.sin(estado.tempo * 14) > 0;
  barra(g, barraX, yEquilibrio, barraW, 8, fracao, pisca ? "#fff0c2" : fracao > 0.55 ? AMARELO : fracao > 0.3 ? "#e59a3c" : "#d9573b", direita);
  g.fillStyle = "#c5cbc2";
  g.font = `600 8px ${FONTE_SANS}`;
  g.textAlign = direita ? "right" : "left";
  g.fillText("EQUILÍBRIO", bordaInterna, yEquilibrio - 2);

  // A barra da faixa de cada um: o progresso é individual.
  const yFaixa = yEquilibrio + (estado.compacto ? 16 : 18);
  const grad = g.createLinearGradient(barraX, 0, barraX + barraW, 0);
  grad.addColorStop(0, VERDE);
  grad.addColorStop(1, AMARELO);
  barra(g, barraX, yFaixa, barraW, 6, l.puxada, grad, direita);
  g.fillStyle = "#c5cbc2";
  g.font = `600 8px ${FONTE_SANS}`;
  g.fillText(`FAIXA ${Math.round(l.puxada * 100)}%`, bordaInterna, yFaixa - 2);
}

function medidorDaFaixa(g: CanvasRenderingContext2D, p: Partida, estado: EstadoDoHud, tela: Tela): void {
  const quem = p.lutadores.findIndex((l) => naEscada(l) || (l.estado === "caindoDaEscada" && l.puxada > 0));
  if (quem < 0 && p.fase !== "fim") return;
  const i = (quem < 0 ? (p.vencedor ?? 0) : quem) as Indice;
  const l = p.lutadores[i];
  const largura = Math.min(280, tela.largura - 24);
  const x = (tela.largura - largura) / 2;
  const y = estado.compacto ? 132 : 104;
  const altura = 50;
  const faltaPouco = l.puxada >= REGRAS.faixa.aviso && p.fase !== "fim";
  const balancando = p.escada.balanco > REGRAS.escada.balancoMaximo && l.estado === "noTopo";
  g.fillStyle = PALCO;
  caixa(g, x, y, largura, altura, 6);
  g.fill();
  g.lineWidth = faltaPouco ? 2 : 1;
  g.strokeStyle = faltaPouco ? AMARELO : LINHA;
  g.stroke();

  const nome = estado.nomes[i].toUpperCase();
  const humano = estado.humanos[i];
  const esquema = estado.esquemas[i];
  // Sozinho, o aviso da pessoa dispensa o nome; a dois, o nome diz de quem é a vez.
  const prefixo = estado.humanos[0] && estado.humanos[1] ? `${nome}: ` : "";
  let rotulo = l.estado === "subindo" ? `${nome} SUBINDO` : `${nome} NA FAIXA`;
  if (balancando) rotulo = "ESCADA BALANÇANDO";
  else if (l.estado === "noTopo" && !l.puxando && humano) {
    const tecla = esquema?.teclas.interagir?.rotulo;
    rotulo = tecla === undefined ? "SEGURE O BOTÃO PARA PUXAR" : `${prefixo}SEGURE ${tecla} PARA PUXAR`;
  } else if (faltaPouco) rotulo = humano ? `${prefixo}FALTA POUCO!` : `${nome}: FALTA POUCO!`;
  if (p.fase === "fim") rotulo = "FAIXA CONQUISTADA";
  const piscando = (faltaPouco || balancando) && estado.movimento && Math.sin(estado.tempo * 16) > 0;
  g.textAlign = "center";
  g.textBaseline = "alphabetic";
  g.fillStyle = piscando ? AMARELO : "#faf8f2";
  g.font = `700 ${faltaPouco ? 13 : 11}px ${FONTE_SANS}`;
  g.fillText(rotulo, tela.largura / 2, y + 18);

  const grad = g.createLinearGradient(x + 12, 0, x + largura - 12, 0);
  grad.addColorStop(0, VERDE);
  grad.addColorStop(1, AMARELO);
  barra(g, x + 12, y + 28, largura - 24, 12, l.puxada, grad, false);
  g.fillStyle = "#c5cbc2";
  g.font = `600 8px ${FONTE_SANS}`;
  g.textAlign = "right";
  g.fillText(`${Math.round(l.puxada * 100)}%`, x + largura - 12, y + 26);
}

/** Um balão apontando para a cabeça de alguém. */
function balao(g: CanvasRenderingContext2D, tela: Tela, cabeca: { x: number; y: number }, texto: string, cor: string, desloca: number): void {
  g.font = `700 12px ${FONTE_SANS}`;
  const largura = g.measureText(texto).width + 20;
  const altura = 26;
  const x = Math.max(8, Math.min(tela.largura - largura - 8, cabeca.x - largura / 2));
  const y = Math.max(8, cabeca.y - 34 - altura - desloca);
  g.fillStyle = cor;
  caixa(g, x, y, largura, altura, 6);
  g.fill();
  g.lineWidth = 1.5;
  g.strokeStyle = TINTA;
  g.stroke();
  if (desloca === 0) {
    const px = Math.max(x + 10, Math.min(x + largura - 10, cabeca.x));
    g.beginPath();
    g.moveTo(px - 6, y + altura);
    g.lineTo(px, y + altura + 7);
    g.lineTo(px + 6, y + altura);
    g.closePath();
    g.fillStyle = cor;
    g.fill();
    g.stroke();
    g.fillStyle = cor;
    g.fillRect(px - 5.5, y + altura - 2, 11, 3);
  }
  g.fillStyle = TINTA;
  g.textAlign = "left";
  g.textBaseline = "middle";
  g.fillText(texto, x + 10, y + altura / 2 + 0.5);
}

/** A dica curta sobre a cabeça de cada pessoa, só quando a ação está disponível; e o aviso de comando bloqueado. */
function pertoDoPersonagem(g: CanvasRenderingContext2D, estado: EstadoDoHud, tela: Tela, p: Partida): void {
  if (p.fase !== "luta") return;
  for (const i of [0, 1] as const) {
    const cabeca = estado.cabecas[i];
    if (!estado.humanos[i] || cabeca === null) continue;
    const dica = estado.dicas[i];
    let mostrouDica = false;
    if (dica !== null && !(dica === "puxarFaixa" && p.lutadores[i].puxando)) {
      const texto = rotuloDaDica(dica, estado.esquemas[i]);
      const destaque = dica === "puxarFaixa" || dica === "posicionarEscada" || dica === "derrubarEscada" || dica === "agarrar" || dica === "escapar";
      balao(g, tela, cabeca, texto, destaque ? AMARELO : PAPEL, 0);
      mostrouDica = true;
    }
    const aviso = estado.avisos[i];
    if (aviso !== null && aviso.t < 0.9) {
      g.save();
      g.globalAlpha = aviso.t > 0.6 ? (0.9 - aviso.t) / 0.3 : 1;
      balao(g, tela, cabeca, aviso.texto, "#f8e4cf", mostrouDica ? 32 : 0);
      g.restore();
    }
  }
}

/** A legenda discreta dos comandos, embaixo, uma linha por pessoa que usa teclado. */
function legenda(g: CanvasRenderingContext2D, estado: EstadoDoHud, tela: Tela, p: Partida): void {
  if (p.fase === "fim") return;
  const linhas = estado.esquemas.filter((esquema): esquema is Esquema => esquema !== null).map((esquema) => esquema.legenda);
  if (linhas.length === 0) return;
  g.save();
  g.globalAlpha = 0.72;
  g.font = `600 11px ${FONTE_SANS}`;
  g.textAlign = "center";
  g.textBaseline = "alphabetic";
  linhas.forEach((texto, n) => {
    const largura = g.measureText(texto).width + 20;
    const x = (tela.largura - largura) / 2;
    const y = tela.altura - 26 - (linhas.length - 1 - n) * 22;
    g.fillStyle = PALCO;
    caixa(g, x, y, largura, 20, 10);
    g.fill();
    g.fillStyle = "#c5cbc2";
    g.fillText(texto, tela.largura / 2, y + 14);
  });
  g.restore();
}

/** A contagem de abertura: 3, 2, 1, e o grito que abre a luta. */
function contagem(g: CanvasRenderingContext2D, p: Partida, estado: EstadoDoHud, tela: Tela): void {
  let texto: string | null = null;
  let u = 0;
  if (p.fase === "contagem") {
    const decorrido = REGRAS.contagem - p.contagem;
    const passo = REGRAS.contagem / 3;
    const indice = Math.min(2, Math.floor(decorrido / passo));
    texto = String(3 - indice);
    u = (decorrido - indice * passo) / passo;
  } else if (p.fase === "luta" && p.tempo < REGRAS.contagem + 1) {
    texto = GRITO_DE_ABERTURA;
    u = (p.tempo - REGRAS.contagem) / 1;
  }
  if (texto === null) return;
  const escala = estado.movimento ? 1.35 - 0.35 * Math.min(1, u * 4) : 1;
  const alfa = u > 0.75 ? 1 - (u - 0.75) / 0.25 : 1;
  g.save();
  g.translate(tela.largura / 2, tela.altura * 0.4);
  g.scale(escala, escala);
  g.globalAlpha = alfa;
  const tamanho = texto.length > 2 ? Math.min(96, tela.largura / 7) : 110;
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

/** A prorrogação, discreta sob as placas: a partida passou do tempo esperado e a faixa afrouxou. */
function prorrogacao(g: CanvasRenderingContext2D, p: Partida, estado: EstadoDoHud, tela: Tela): void {
  if (!p.prorrogacao || p.fase !== "luta") return;
  g.save();
  g.font = `700 10px ${FONTE_SANS}`;
  g.textAlign = "center";
  g.textBaseline = "alphabetic";
  const largura = g.measureText(ROTULO_DA_PRORROGACAO).width + 18;
  const x = (tela.largura - largura) / 2;
  const y = estado.compacto ? 112 : 96;
  g.fillStyle = PALCO;
  caixa(g, x, y, largura, 18, 9);
  g.fill();
  g.fillStyle = AMARELO;
  g.fillText(ROTULO_DA_PRORROGACAO, tela.largura / 2, y + 13);
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
  const y = (estado.compacto ? 190 : 164) + desloca;
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
  prorrogacao(g, p, estado, tela);
  medidorDaFaixa(g, p, estado, tela);
  pertoDoPersonagem(g, estado, tela, p);
  legenda(g, estado, tela, p);
  narrador(g, estado, tela);
  contagem(g, p, estado, tela);
  g.restore();
}
