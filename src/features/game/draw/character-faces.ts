// As três cabeças do jogo, como dado: os caminhos de cada parte, no formato do
// atributo `d` do SVG, com o centro da cabeça na origem e o personagem olhando
// para a direita. Quem desenha é character-head.ts, com a mesma sequência para
// todos.
//
// Lula e Flávio Bolsonaro são retratos de cartum editorial: reconhecíveis
// pelo cabelo, pela barba e pelo formato do rosto, sem exagero de traço. O
// Arquivista é inventado e não retrata ninguém.

import { shape } from "./character-ink";
import { patch, type HeadSpec } from "./character-head";

/** Lula: cabelo grisalho penteado para trás, ralo em cima; barba branca cheia e aparada; rosto largo. */
export const LULA_HEAD: HeadSpec = {
  tintas: {
    pele: "#c9976f",
    peleSombra: "#b27f59",
    rubor: "#b8745a",
    cabelo: "#dbd8d0",
    cabeloSombra: "#b9b5ab",
    fio: "#8f8b82",
    barba: "#f0eee8",
    barbaSombra: "#d2cfc6",
    sobrancelha: "#75726b",
  },
  sobrancelha: 1.35,
  barbaCheia: true,
  barbaAlfa: 1,
  frente: {
    mecha: null,
    orelha: shape("M -4.2 -1.6 C -5.6 -3 -7.6 -1.8 -7.2 0.6 C -6.9 2.4 -5.4 3.2 -4.3 2.4 Z"),
    orelhaDobra: shape("M -6.4 -0.6 C -5.9 -1.6 -5 -1.2 -5 -0.2 C -5 0.6 -5.4 1.2 -5.9 1.4"),
    rosto: shape(
      "M -0.5 -9.6 C 4.2 -9.9 7.6 -7.4 8.2 -3.6 C 8.4 -2.6 8.2 -1.8 8.2 -1.1 C 8.7 -0.3 9.9 1 9.6 2 C 9.5 2.8 8.8 3.1 8.2 3 C 8.6 4.4 8.3 5.8 7.5 6.9 C 6.5 8.3 4.8 8.9 2.8 8.9 C -0.8 9.1 -4.2 7.4 -5.6 4.6 C -7.8 3.6 -9 0.4 -8.9 -2.6 C -8.8 -7.2 -5.4 -9.4 -0.5 -9.6 Z",
    ),
    marcas: [shape("M 2.6 -5.6 Q 4.8 -6.1 7 -5.4"), shape("M 0.6 -1.7 L -0.5 -2.2"), shape("M 0.6 -0.9 L -0.5 -0.7"), shape("M 1.3 0.5 Q 2.4 1 3.4 0.5")],
    corado: null,
    barba: patch(
      "M 8.3 3.1 C 9.5 4.2 9.3 7 7.5 8.8 C 5.6 10.5 1.4 10.7 -1.7 9.4 C -4.2 8.3 -6 6.2 -6.3 4 C -6.2 3.2 -5.2 2.9 -4.4 2.5 L -4.1 -1.9",
      "C -2.9 -0.4 -2.4 3.4 0.9 3.7 C 2 3.7 2.6 3.1 3.6 2.9 L 8.3 3.1",
    ),
    labios: null,
    bigode: shape("M 1.9 4.6 C 2.4 3 4.2 2.7 5.6 2.9 C 6.8 2.6 8.4 2.9 8.9 4.2 C 7.6 5 6.6 4.7 5.6 4.3 C 4.4 5 2.8 5.1 1.9 4.6 Z"),
    boca: shape("M 3.7 5.6 Q 5.1 6.6 6.7 5.4"),
    labioDeBaixo: shape("M 4.3 6.6 Q 5.2 7.1 6.1 6.5"),
    narina: shape("M 8.3 3 C 7.7 3.2 7.2 2.9 7.2 2.3"),
    olhos: [2.3, -1.3, 6.2, -1.2],
    sobrancelhas: [shape("M 0.5 -3.4 Q 2.3 -4.6 4.1 -3.5"), shape("M 5.2 -3.6 Q 6.6 -4.4 7.8 -3.5")],
    cabelo: patch(
      "M 6.2 -7.6 C 3.4 -10.8 -3.4 -11.5 -7 -8.6 C -9.6 -6.4 -10.4 -2.6 -9.8 0.6 C -9.5 2.2 -8.8 3.4 -7.9 4",
      "C -7.6 2.8 -7.4 1.4 -7.5 0.2 C -7.7 -1.8 -6.6 -3.2 -5 -2.9 C -4.6 -2.9 -4.2 -2.6 -3.9 -2.2 C -3.4 -3.2 -2.6 -4.6 -1.4 -5.4 C 0.8 -6.8 3.6 -7 6.2 -7.6",
    ),
    fios: [shape("M 4.8 -8.2 C 1.8 -10 -3 -10.4 -6.8 -8"), shape("M 1.8 -7 C -1.6 -8.4 -5.6 -7.6 -8.8 -4.6"), shape("M -2.4 -5.4 C -4.8 -5.6 -7.6 -4 -9.2 -1")],
    oculos: false,
  },
  costas: {
    nuca: shape("M 0.4 -9.6 C 5.2 -9.6 8.6 -6.4 8.6 -2.2 C 8.6 0.8 8 3.4 6.6 5.6 C 5.4 7.4 3.4 8.2 1.6 8 L -3.6 7.6 C -6.6 6.6 -8.9 3 -8.9 -1.8 C -8.9 -6.6 -4.8 -9.6 0.4 -9.6 Z"),
    orelha: shape("M 4.4 -1.6 C 6 -3 7.9 -1.6 7.5 0.6 C 7.2 2.4 5.7 3.2 4.6 2.4 Z"),
    barba: shape("M 5 2.6 C 6.2 3.4 7.6 3.2 8.3 2.2 C 8.6 4.8 7.2 7.6 4.6 8.8 C 3.4 9.2 2.4 8.8 2 8.1 C 4 7.6 5.4 5.6 5 2.6 Z"),
    cabelo: patch(
      "M 6.4 -8.2 C 3.4 -11.2 -4 -11.4 -7.6 -7.8 C -10.2 -5 -10.4 0.4 -8.6 3.8 C -7.4 5.9 -5.2 7 -2.6 7",
      "C -0.4 6.9 1.4 6.2 2.6 5 C 3.4 3.6 3.4 2 4.4 1.2 C 4 -0.6 4.8 -2.2 6.2 -2.4 C 7.4 -3.4 7.8 -5.6 6.4 -8.2",
    ),
    fios: [
      shape("M 4.4 -8.6 C 1 -10.2 -4.2 -9.6 -7.4 -6.2"),
      shape("M -1.8 -5.2 C -5 -3.8 -6.8 -0.8 -7.4 2.6"),
      shape("M 1.2 -4.6 C -1.2 -1.4 -2.4 2.2 -2.6 5.4"),
      shape("M 3.6 -5.6 C 3.2 -2.6 2.4 0.6 2 3.2"),
    ],
    coroa: shape("M -3.6 -7.8 C -2.8 -9 0.6 -9.2 1.6 -8.2 C 2.2 -7.2 0.2 -6.4 -1.4 -6.4 C -2.8 -6.4 -4 -6.9 -3.6 -7.8 Z"),
  },
};

/** Flávio Bolsonaro: cabelo castanho-escuro curto, de lado, com entradas discretas; barba curta e rente; rosto mais comprido. */
export const FLAVIO_HEAD: HeadSpec = {
  tintas: {
    pele: "#e8c5a7",
    peleSombra: "#d3a886",
    rubor: "#c98a74",
    cabelo: "#3b2d24",
    cabeloSombra: "#2a201a",
    fio: "#6a5547",
    barba: "#4f3d31",
    barbaSombra: "#3d2f26",
    sobrancelha: "#2f241d",
  },
  sobrancelha: 1.2,
  barbaCheia: false,
  barbaAlfa: 0.84,
  frente: {
    mecha: null,
    orelha: shape("M -4 -1.7 C -5.4 -3.1 -7.3 -1.9 -6.9 0.5 C -6.6 2.3 -5.1 3.1 -4.1 2.3 Z"),
    orelhaDobra: shape("M -6.1 -0.7 C -5.6 -1.7 -4.8 -1.3 -4.8 -0.3 C -4.8 0.5 -5.2 1.1 -5.6 1.3"),
    rosto: shape(
      "M -0.6 -9.8 C 4 -10 7.2 -7.6 7.8 -3.8 C 8 -2.8 7.9 -2 7.9 -1.3 C 8.3 -0.5 9.3 1.1 9.1 2 C 9 2.7 8.4 3 7.9 2.9 C 8.2 4.4 7.9 6.2 7 7.6 C 6 9.1 4.6 9.7 2.9 9.7 C 0.2 9.9 -3.4 8.2 -5 5 C -7.2 3.8 -8.4 0.6 -8.3 -2.6 C -8.2 -7.4 -5.2 -9.6 -0.6 -9.8 Z",
    ),
    marcas: [shape("M 3 -5.2 Q 4.8 -5.5 6.6 -5.1"), shape("M 0.5 -1.8 L -0.4 -2.2"), shape("M 1.3 0.2 Q 2.3 0.6 3.2 0.2")],
    corado: null,
    barba: patch(
      "M 7.9 3.2 C 8.2 4.4 7.9 6.2 7 7.6 C 6 9.1 4.6 9.7 2.9 9.7 C 0.2 9.9 -3.4 8.2 -5 5 C -5 3.9 -4.5 3 -4.1 2.4 L -3.9 -1.8",
      "C -3.1 -0.4 -3 1.6 -2.6 3.4 C -2.2 5 -0.8 6.6 0.8 7 C 1.6 7.2 2.3 6.6 2.5 5.8 C 2.7 4.8 3.1 4 3.9 3.7 L 7.9 3.3",
    ),
    labios: shape("M 3.4 5.6 C 3.8 4.9 6.3 4.8 7 5.4 C 6.8 6.6 3.9 6.8 3.4 5.6 Z"),
    bigode: null,
    boca: shape("M 3.7 5.4 Q 5.2 6.4 6.8 5.2"),
    labioDeBaixo: shape("M 4.5 6.3 Q 5.2 6.6 5.9 6.2"),
    narina: shape("M 7.9 2.9 C 7.3 3.1 6.9 2.8 6.9 2.3"),
    olhos: [2.2, -1.5, 6, -1.4],
    sobrancelhas: [shape("M 0.5 -3.4 Q 2.2 -4.6 3.9 -3.7"), shape("M 5.1 -3.8 Q 6.3 -4.5 7.4 -3.6")],
    cabelo: patch(
      "M 6.9 -5.9 C 7.4 -8.4 5.6 -10.8 2.6 -11.6 C -2 -12.7 -7.2 -10.9 -9 -6.9 C -10 -4.5 -9.8 -1 -8.9 1.4 C -8.5 2.4 -8 3.2 -7.4 3.7",
      "C -7.2 2.6 -7.1 1.2 -7.2 0.1 C -7.4 -1.9 -6.3 -3.3 -4.8 -3 C -4.4 -3 -4 -2.7 -3.7 -2.3 C -3.4 -3.6 -2.6 -5 -1.2 -5.9 C -0.4 -6.6 0.4 -7.3 1.4 -7.5 C 2.2 -7 2.8 -6.6 3.4 -6.5 C 4.6 -7 5.9 -6.7 6.9 -5.9",
    ),
    fios: [
      shape("M 0.4 -7.4 C -0.8 -9.2 -2.6 -10.6 -4.8 -11.2"),
      shape("M 1.4 -7.6 C 3.2 -9.6 5.4 -9.4 6.6 -7.4"),
      shape("M -0.6 -9.2 C 1.6 -11.2 4.6 -11 6.2 -9"),
      shape("M -4.6 -6.4 C -6.8 -5.2 -8.2 -3 -8.6 -0.6"),
    ],
    oculos: false,
  },
  costas: {
    nuca: shape("M 0.4 -9.8 C 5 -9.8 8.2 -6.6 8.2 -2.4 C 8.2 0.8 7.6 3.6 6.2 5.9 C 5 7.8 3.2 8.6 1.6 8.4 L -3.4 8 C -6.2 7 -8.4 3.2 -8.4 -1.8 C -8.4 -6.8 -4.6 -9.8 0.4 -9.8 Z"),
    orelha: shape("M 4.2 -1.6 C 5.8 -3 7.6 -1.6 7.2 0.6 C 6.9 2.4 5.5 3.2 4.4 2.4 Z"),
    barba: shape("M 4.9 2.8 C 5.9 3.4 6.9 3.3 7.6 2.6 C 7.8 4.9 6.6 7.4 4.6 8.4 C 4 8.5 3.6 8.3 3.4 7.9 C 4.8 7 5.4 5.2 4.9 2.8 Z"),
    cabelo: patch(
      "M 6.2 -8.6 C 3.2 -12.2 -4.4 -12.2 -7.8 -8.2 C -10 -5.4 -10 -0.2 -8.4 3.2 C -7.4 5.2 -5.4 6.1 -3 6.1",
      "C -1 6.1 0.8 5.6 2.2 4.5 C 3.2 3.4 3.2 2 4.2 1.2 C 3.8 -0.6 4.6 -2.2 6 -2.4 C 7.2 -3.6 7.6 -6 6.2 -8.6",
    ),
    fios: [
      shape("M 4.2 -9.4 C 0.6 -11.4 -4.6 -10.4 -7.6 -6.8"),
      shape("M -1 -7.8 C -4.4 -6.4 -6.6 -3 -7.2 0.8"),
      shape("M 1.6 -7 C -0.4 -3.6 -1.6 0.4 -1.8 4.4"),
      shape("M 4 -7.4 C 3.6 -4 2.8 -0.6 2.2 2.6"),
    ],
    coroa: null,
  },
};

/** O Arquivista: cabelo chanel curto, castanho-acinzentado, e óculos redondos. Personagem fictício. */
export const ARCHIVIST_HEAD: HeadSpec = {
  tintas: {
    pele: "#dbb08c",
    peleSombra: "#c49670",
    rubor: "#c97f6a",
    cabelo: "#7d6f62",
    cabeloSombra: "#63574c",
    fio: "#4f453c",
    barba: "#7d6f62",
    barbaSombra: "#63574c",
    sobrancelha: "#54493f",
  },
  sobrancelha: 0.85,
  barbaCheia: false,
  barbaAlfa: 1,
  frente: {
    mecha: shape("M 7.5 -4.8 C 9 -2.8 9.4 2.4 8.8 5.8 Q 8 6.4 7.3 5.6 C 7.9 2.6 7.9 -1.8 7.5 -4.8 Z"),
    orelha: shape("M -4.6 -1.5 C -6.3 -2.7 -7.7 -1.2 -7.2 0.8 C -6.9 2.3 -5.6 3 -4.7 2.3 Z"),
    orelhaDobra: shape("M -6.5 -0.5 C -6 -1.3 -5.3 -1 -5.2 -0.2"),
    rosto: shape(
      "M -0.4 -9.4 C 4 -9.6 7.2 -7.2 7.8 -3.4 C 8 -2.4 7.9 -1.4 7.9 -0.6 C 8.2 0 8.9 1.2 8.7 1.9 C 8.6 2.5 8.2 2.7 7.8 2.6 C 8.1 4.2 7.6 6.2 6.6 7.5 C 5.6 8.7 4.2 9.1 2.6 9.1 C -0.4 9.2 -3.6 7.6 -5 4.8 C -7.2 3.6 -8.4 0.6 -8.3 -2.4 C -8.2 -7 -5 -9.2 -0.4 -9.4 Z",
    ),
    marcas: [],
    corado: [2.2, 3.1, 1.7, 1],
    barba: null,
    labios: null,
    bigode: null,
    boca: shape("M 3 4.9 Q 4.6 6.7 6.5 4.8"),
    labioDeBaixo: shape("M 3.9 6.6 Q 4.8 7.1 5.8 6.5"),
    narina: shape("M 7.8 2.6 C 7.3 2.8 7 2.5 7 2.1"),
    olhos: [1.9, -0.9, 6.3, -0.8],
    sobrancelhas: [shape("M 0.2 -4 Q 1.9 -4.9 3.6 -4.1"), shape("M 5.2 -4.1 Q 6.4 -4.7 7.5 -4")],
    cabelo: patch(
      "M 8.1 -3.8 C 8.4 -8.4 4.8 -11.9 0.2 -12 C -5.8 -12.1 -10.4 -8.2 -10.5 -2.6 C -10.6 1.2 -10.4 4.4 -9.6 6.8 C -8 7.9 -5.4 7.8 -3.6 6.9",
      "C -3 4.6 -3 2 -2.8 -0.2 C -2.5 -3 -0.6 -5.2 2 -6.1 C 4.4 -6.8 6.8 -6 8.1 -3.8",
    ),
    fios: [
      shape("M 2.2 -6.3 C 1.4 -8.6 0.2 -10.4 -1.6 -11.7"),
      shape("M -5.6 -9.6 C -7.4 -5.4 -7.6 0.6 -6.8 6.6"),
      shape("M -8.4 -6.4 C -9.2 -2 -9 3 -8.4 6.4"),
      shape("M 0.6 -8 C 3 -9 5.6 -7.8 7.2 -5.2"),
    ],
    oculos: true,
  },
  costas: {
    nuca: shape("M 0.4 -9.4 C 5 -9.4 8.2 -6.4 8.2 -2.4 C 8.2 0.8 7.6 3.4 6.2 5.6 C 5 7.4 3.2 8.2 1.6 8 L -3.4 7.6 C -6.2 6.6 -8.4 3 -8.4 -1.8 C -8.4 -6.6 -4.6 -9.4 0.4 -9.4 Z"),
    orelha: shape("M 6.4 -1 C 7 -1.6 7.8 -1 7.6 0 C 7.4 0.8 6.8 1.2 6.4 0.8 Z"),
    barba: null,
    cabelo: patch(
      "M 8.2 6.4 C 8.9 3.6 9.1 0.2 9 -3.4 C 9 -8.4 5.4 -11.9 0.2 -11.9 C -5.6 -11.9 -10.2 -8.4 -10.4 -3 C -10.5 0.4 -10 3.8 -8.8 6.9",
      "Q -4.6 8.6 0.6 8.2 Q 4.6 8.4 8.2 6.4",
    ),
    fios: [
      shape("M 0.4 -11 C -0.6 -6 -1 0 -0.8 7.4"),
      shape("M -4.6 -10 C -6.4 -4.6 -6.8 1.6 -6.2 7"),
      shape("M 4.6 -9.8 C 5.6 -4.6 5.6 1.4 4.8 6.8"),
      shape("M -8.6 -5.6 C -9.4 -1.6 -9.2 3 -8.6 6.2"),
    ],
    coroa: null,
  },
};
