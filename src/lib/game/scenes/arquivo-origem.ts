// Salas de arquivo das fases de origem, uma por personagem, com a arte do
// gabinete: estantes e arquivos de aço ao fundo, uma mesa de leitura, caixotes
// de papel e uma passadeira diante do Escrivão. O jogo não desenha a infância
// nem a casa de ninguém: a origem é contada pelo que os documentos dizem, e o
// cenário é o arquivo em que eles ficam. Os dois layouts são o mesmo; mudam
// as cores dos materiais. Representação narrativa: não afirma que a pessoa
// esteve neste lugar.

import type { SceneSpec } from "../types";

const MAPA: readonly string[] = [
  "############",
  "#oo.o.oo.oo#",
  "#..........#",
  "#.S..1...o.#",
  "#G.........E",
  "#..o...2...#",
  "#.....o..o.#",
  "#o..3.....o#",
  "############",
];

const PROPS: SceneSpec["props"] = [
  { tipo: "estante", x: 1, y: 1, variante: 1 },
  { tipo: "arquivo", x: 2, y: 1, variante: 0 },
  { tipo: "armario", x: 4, y: 1 },
  { tipo: "estante", x: 6, y: 1 },
  { tipo: "estante", x: 7, y: 1, variante: 2 },
  { tipo: "arquivo", x: 9, y: 1, variante: 1 },
  { tipo: "arquivo", x: 10, y: 1, variante: 0 },
  { tipo: "mesa", x: 9, y: 3, variante: 1 },
  { tipo: "caixote", x: 3, y: 5, variante: 1 },
  { tipo: "mesa-central", x: 6, y: 6, variante: 1 },
  { tipo: "caixote", x: 9, y: 6 },
  { tipo: "planta", x: 1, y: 7 },
  { tipo: "armario", x: 10, y: 7 },
  // Detalhes de chão: a luz da janela e papéis caídos.
  { tipo: "decoracao", x: 5, y: 2, variante: 2 },
  { tipo: "decoracao", x: 8, y: 5, variante: 1 },
];

const base = {
  arte: "gabinete" as const,
  nome: "Sala de arquivo",
  mapa: MAPA,
  largura: 12,
  altura: 9,
  props: PROPS,
  tapetes: [
    { x: 2, y: 4 },
    { x: 3, y: 4 },
    { x: 4, y: 4 },
  ],
  spawn: { x: 2, y: 3 },
  guia: { x: 1, y: 4 },
  saida: { x: 11, y: 4, lado: "leste" as const },
  // A primeira pasta, a do marco, fica perto do começo: o caminho até ela é curto.
  registros: [
    { x: 5, y: 3 },
    { x: 7, y: 5 },
    { x: 4, y: 7 },
  ],
};

/** A sala de origem do primeiro personagem: piso de taco claro, parede creme, passadeira terrosa; o acento é o cobre. */
export const arquivoOrigemA: SceneSpec = {
  ...base,
  id: "arquivo-origem-a",
  paleta: { chao: "#b9a47e", chaoAlt: "#b19c76", tapete: "#8a6a4a", parede: "#ece3cf", paredeTopo: "#f3ecdc", fundo: "#f2ecdf", acento: "#9a6b4f" },
};

/** A sala de origem do segundo personagem: piso de taco acinzentado, parede pérola, passadeira grafite; o acento é o latão. */
export const arquivoOrigemB: SceneSpec = {
  ...base,
  id: "arquivo-origem-b",
  paleta: { chao: "#a9a394", chaoAlt: "#a19b8c", tapete: "#6a665e", parede: "#e9e6de", paredeTopo: "#f0ede6", fundo: "#f0eee8", acento: "#a8894e" },
};
