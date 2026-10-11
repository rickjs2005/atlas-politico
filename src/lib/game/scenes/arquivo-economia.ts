// Salas de arquivo das decisões de Economia, uma por personagem, com a arte do
// gabinete: estantes e arquivos de aço ao fundo, mesa de conferência, caixotes
// de papel e uma passadeira diante do Escrivão. Os dois layouts são o mesmo;
// mudam as cores dos materiais, para a cena não ser idêntica entre as duas
// salas. Representação narrativa: não afirma que a pessoa esteve neste lugar.

import type { SceneSpec } from "../types";

const MAPA: readonly string[] = [
  "############",
  "#oo.oo.o.oo#",
  "#..........#",
  "#.S.1...o..#",
  "#G.......o.E",
  "#.o....2...#",
  "#..o.....o.#",
  "#o...3....o#",
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
  { tipo: "mesa", x: 8, y: 3, variante: 1, espelhado: true },
  { tipo: "planta", x: 9, y: 4 },
  { tipo: "caixote", x: 2, y: 5 },
  { tipo: "caixote", x: 3, y: 6, variante: 1 },
  { tipo: "mesa-central", x: 9, y: 6, variante: 1 },
  { tipo: "planta", x: 1, y: 7 },
  { tipo: "armario", x: 10, y: 7 },
  // Detalhes de chão: a luz da janela e papéis caídos.
  { tipo: "decoracao", x: 6, y: 2, variante: 2 },
  { tipo: "decoracao", x: 7, y: 6, variante: 1 },
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
  // Nenhum fica ao lado da saída, onde a porta o esconderia.
  registros: [
    { x: 4, y: 3 },
    { x: 7, y: 5 },
    { x: 5, y: 7 },
  ],
};

/** A sala de Economia do primeiro personagem: carpete verde-oliva, parede areia, passadeira musgo; o acento é o latão. */
export const arquivoEconomiaA: SceneSpec = {
  ...base,
  id: "arquivo-economia-a",
  paleta: { chao: "#7f8a6a", chaoAlt: "#788364", tapete: "#5a6a4a", parede: "#ece4d2", paredeTopo: "#f2ecde", fundo: "#f3eee3", acento: "#a8894e" },
};

/** A sala de Economia do segundo personagem: carpete cinza-azulado, parede pérola, passadeira ardósia; o acento é o cobre. */
export const arquivoEconomiaB: SceneSpec = {
  ...base,
  id: "arquivo-economia-b",
  paleta: { chao: "#8a929b", chaoAlt: "#838b94", tapete: "#5c6673", parede: "#e8e6e1", paredeTopo: "#efede8", fundo: "#f0eeea", acento: "#9a6b4f" },
};
