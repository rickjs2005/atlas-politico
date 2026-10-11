// Salas de arquivo das decisões de Segurança pública, uma por personagem, com
// a arte da sala de comissão: armários e arquivos de aço ao fundo, uma tela
// apagada, um balcão de protocolo, caixotes de processos e uma passadeira até
// a porta. Os dois layouts são o mesmo; mudam as cores dos materiais.
// Representação narrativa: não afirma que a pessoa esteve neste lugar.

import type { SceneSpec } from "../types";

const MAPA: readonly string[] = [
  "############",
  "#oooo.o.ooo#",
  "#..........#",
  "#.S..o.1...#",
  "#G.........#",
  "#..o...o...#",
  "#.2......o.#",
  "#o....3...o#",
  "#####E######",
];

const PROPS: SceneSpec["props"] = [
  { tipo: "armario", x: 1, y: 1 },
  { tipo: "arquivo", x: 2, y: 1, variante: 0 },
  { tipo: "arquivo", x: 3, y: 1, variante: 1 },
  { tipo: "estante", x: 4, y: 1 },
  { tipo: "tela", x: 6, y: 1, variante: 1 },
  { tipo: "bancada", x: 8, y: 1, espelhado: true },
  { tipo: "bancada", x: 9, y: 1, espelhado: true },
  { tipo: "estante", x: 10, y: 1, variante: 1 },
  { tipo: "balcao", x: 5, y: 3 },
  { tipo: "caixote", x: 3, y: 5 },
  { tipo: "caixote", x: 7, y: 5, variante: 1 },
  { tipo: "planta", x: 9, y: 6 },
  { tipo: "armario", x: 1, y: 7 },
  { tipo: "arquivo", x: 10, y: 7, variante: 1 },
  // Detalhes de chão: a luz da janela e papéis caídos.
  { tipo: "decoracao", x: 8, y: 2, variante: 2 },
  { tipo: "decoracao", x: 4, y: 6, variante: 1 },
];

const base = {
  arte: "comissao" as const,
  nome: "Sala de arquivo",
  mapa: MAPA,
  largura: 12,
  altura: 9,
  props: PROPS,
  tapetes: [
    { x: 5, y: 6 },
    { x: 5, y: 7 },
  ],
  spawn: { x: 2, y: 3 },
  guia: { x: 1, y: 4 },
  saida: { x: 5, y: 8, lado: "sul" as const },
  // Nenhum fica ao lado da saída, onde a porta o esconderia.
  registros: [
    { x: 7, y: 3 },
    { x: 2, y: 6 },
    { x: 6, y: 7 },
  ],
};

/** A sala de Segurança pública do primeiro personagem: piso cinza-grafite, parede gelo, passadeira azul-petróleo; o acento é o aço escuro. */
export const arquivoSegurancaA: SceneSpec = {
  ...base,
  id: "arquivo-seguranca-a",
  paleta: { chao: "#9a9c98", chaoAlt: "#929490", tapete: "#44596a", parede: "#e6e8e4", paredeTopo: "#edeeeb", fundo: "#f0f1ee", acento: "#55606b" },
};

/** A sala de Segurança pública do segundo personagem: piso bege-acinzentado, parede marfim, passadeira vinho; o acento é o ferro. */
export const arquivoSegurancaB: SceneSpec = {
  ...base,
  id: "arquivo-seguranca-b",
  paleta: { chao: "#a9a397", chaoAlt: "#a19b8f", tapete: "#6b4a4e", parede: "#ebe7dc", paredeTopo: "#f1eee6", fundo: "#f3f1eb", acento: "#5e5852" },
};
