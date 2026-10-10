// Plenário de assembleia, anos 1980: fileiras de bancadas de madeira, tribuna
// ao fundo, bandeira sem símbolo, passadeira diante da saída.

import type { SceneSpec } from "../types";

export const constituinte: SceneSpec = {
  id: "constituinte",
  arte: "constituinte",
  nome: "Plenário da Constituinte",
  mapa: [
    "############",
    "#oS.......o#",
    "#..o.o.o.o.#",
    "#.........1#",
    "#.2o.o.o.o.#",
    "#..........#",
    "#G.o.o.o...#",
    "#.......3..#",
    "#####E######",
  ],
  largura: 12,
  altura: 9,
  // Anos 1980: madeira, parede clara, tapete verde-acinzentado.
  paleta: { chao: "#b9956c", chaoAlt: "#ad8a62", tapete: "#4f6b6a", parede: "#d9d2c1", paredeTopo: "#e6e0d2", fundo: "#ece7db", acento: "#8a6d3b" },
  props: [
    { tipo: "bandeira", x: 1, y: 1 },
    // A tribuna fica no canto leste, voltada para o plenário: a câmera vê o lado de quem fala.
    { tipo: "tribuna", x: 10, y: 1, variante: 1, espelhado: true },
    // As bancadas olham para a tribuna, a leste.
    { tipo: "bancada", x: 3, y: 2, espelhado: true },
    { tipo: "bancada", x: 5, y: 2, espelhado: true },
    { tipo: "bancada", x: 7, y: 2, espelhado: true },
    { tipo: "bancada", x: 9, y: 2, espelhado: true },
    { tipo: "bancada", x: 3, y: 4, espelhado: true },
    { tipo: "bancada", x: 5, y: 4, espelhado: true },
    { tipo: "bancada", x: 7, y: 4, espelhado: true },
    { tipo: "bancada", x: 9, y: 4, espelhado: true },
    { tipo: "bancada", x: 3, y: 6, espelhado: true },
    { tipo: "bancada", x: 5, y: 6, espelhado: true },
    { tipo: "bancada", x: 7, y: 6, espelhado: true },
    // Detalhes de chão: a luz das janelas, o tapete diante da tribuna e folhas caídas.
    { tipo: "decoracao", x: 1, y: 3, variante: 2 },
    { tipo: "decoracao", x: 1, y: 5, variante: 2 },
    { tipo: "decoracao", x: 9, y: 1, variante: 3, espelhado: true },
    { tipo: "decoracao", x: 10, y: 5, variante: 1 },
    { tipo: "decoracao", x: 2, y: 7, variante: 1 },
  ],
  tapetes: [
    { x: 3, y: 7 },
    { x: 4, y: 7 },
    { x: 5, y: 7 },
    { x: 6, y: 7 },
    { x: 7, y: 7 },
  ],
  spawn: { x: 2, y: 1 },
  guia: { x: 1, y: 6 },
  saida: { x: 5, y: 8, lado: "sul" },
  // Nenhum fica na diagonal atrás da porta, que os esconderia.
  registros: [
    { x: 10, y: 3 },
    { x: 2, y: 4 },
    { x: 8, y: 7 },
  ],
};
