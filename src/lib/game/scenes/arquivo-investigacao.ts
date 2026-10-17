// A sala de investigação da missão "O documento diz o quê?" (D-151), uma por
// personagem, com a arte do gabinete: arquivos de aço e estantes ao fundo, o
// balcão do Escrivão à esquerda, a mesa das fichas à direita e um quadro de
// avisos na frente. Os quatro marcadores não são pastas: são os objetos que
// abrem cada parte do dossiê, na ordem em que a missão os usa. O boneco anda
// até cada um, como anda até uma pasta nas outras cenas.
//
//   1  o Escrivão, ao lado do guia: a conversa que abre a missão
//   2  a gaveta, diante dos arquivos de aço: os documentos
//   3  a mesa das fichas: relacionar e conferir
//   4  o quadro: a chave de leitura (os cinco campos de um documento)
//
// Os dois layouts são o mesmo; mudam as cores dos materiais. Representação
// narrativa: não afirma que a pessoa esteve neste lugar.

import type { SceneSpec } from "../types";

const MAPA: readonly string[] = [
  "############",
  "#oo.oo.o.oo#",
  "#...2......#",
  "#G1.....o..#",
  "#.......3..E",
  "#.S.o......#",
  "#.......o4.#",
  "#o........o#",
  "############",
];

const PROPS: SceneSpec["props"] = [
  { tipo: "estante", x: 1, y: 1 },
  { tipo: "estante", x: 2, y: 1, variante: 2 },
  { tipo: "arquivo", x: 4, y: 1, variante: 0 },
  { tipo: "arquivo", x: 5, y: 1, variante: 1 },
  { tipo: "armario", x: 7, y: 1 },
  { tipo: "estante", x: 9, y: 1, variante: 1 },
  { tipo: "arquivo", x: 10, y: 1, variante: 0 },
  // A mesa das fichas, com a cadeira do lado de dentro.
  { tipo: "mesa", x: 8, y: 3, variante: 1, espelhado: true },
  { tipo: "caixote", x: 4, y: 5 },
  // O quadro de avisos, baixo, na frente da sala: a chave de leitura fica pendurada nele.
  { tipo: "cartaz", x: 8, y: 6 },
  { tipo: "planta", x: 1, y: 7 },
  { tipo: "armario", x: 10, y: 7 },
  // Detalhes de chão: a luz da janela e papéis caídos.
  { tipo: "decoracao", x: 6, y: 2, variante: 2 },
  { tipo: "decoracao", x: 6, y: 6, variante: 1 },
];

const base = {
  arte: "gabinete" as const,
  nome: "Sala de investigação",
  mapa: MAPA,
  largura: 12,
  altura: 9,
  props: PROPS,
  // A passadeira diante do balcão do Escrivão.
  tapetes: [
    { x: 2, y: 4 },
    { x: 3, y: 4 },
    { x: 3, y: 3 },
  ],
  spawn: { x: 2, y: 5 },
  guia: { x: 1, y: 3 },
  saida: { x: 11, y: 4, lado: "leste" as const },
  // Na ordem das partes da missão: o Escrivão, a gaveta, a mesa das fichas e o quadro. Nenhum fica ao lado da porta.
  registros: [
    { x: 2, y: 3 },
    { x: 4, y: 2 },
    { x: 8, y: 4 },
    { x: 9, y: 6 },
  ],
};

/** A sala de investigação do primeiro personagem: carpete terracota, parede palha, passadeira vinho; o acento é o bronze. */
export const arquivoInvestigacaoA: SceneSpec = {
  ...base,
  id: "arquivo-investigacao-a",
  paleta: { chao: "#9a7a66", chaoAlt: "#927460", tapete: "#6b4a44", parede: "#efe6d0", paredeTopo: "#f4eddc", fundo: "#f5f0e4", acento: "#8f6b3c" },
};

/** A sala de investigação do segundo personagem: carpete azul-petróleo, parede gelo, passadeira índigo; o acento é o estanho. */
export const arquivoInvestigacaoB: SceneSpec = {
  ...base,
  id: "arquivo-investigacao-b",
  paleta: { chao: "#6f8390", chaoAlt: "#687c89", tapete: "#4a5668", parede: "#e9ebe8", paredeTopo: "#f0f1ee", fundo: "#f1f2ef", acento: "#7c8590" },
};
