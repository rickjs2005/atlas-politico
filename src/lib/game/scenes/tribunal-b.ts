// Sala de audiências (segunda), em outra disposição e em tons frios e
// acinzentados: a bancada do juízo ao fundo, sob o emblema, entre duas
// bandeiras sem símbolo; a mesa da defesa diante do juízo, a tribuna de pé à
// direita, uma fileira só de público virada para o fundo, o arquivo e a
// estante nos cantos; um tapete no meio e a porta dupla a leste. Representação
// narrativa: não afirma que a pessoa esteve neste lugar nem que os fatos
// aconteceram nele.

import type { SceneSpec } from "../types";

export const tribunalB: SceneSpec = {
  id: "tribunal-b",
  arte: "tribunal",
  nome: "Sala de audiências",
  mapa: [
    "############",
    "#..ooooo..o#",
    "#o1......2.#",
    "#...o...o..#",
    "#....S.....E",
    "#G.oo..oo..#",
    "#3........4#",
    "#.5..o..6..#",
    "############",
  ],
  largura: 12,
  altura: 9,
  // Madeira acinzentada no chão, lambri de madeira escura sem o vermelho, parede cinza-clara, tapete cinza-esverdeado.
  paleta: { chao: "#998368", chaoAlt: "#8f7a5f", tapete: "#56615d", parede: "#dad8d0", paredeTopo: "#e4e2db", fundo: "#e9e7e0", acento: "#4a3c35" },
  props: [
    { tipo: "bandeira", x: 3, y: 1, espelhado: true, variante: 1 },
    { tipo: "bancada", x: 4, y: 1 },
    { tipo: "mesa-central", x: 5, y: 1, variante: 0 },
    { tipo: "bancada", x: 6, y: 1 },
    { tipo: "bandeira", x: 7, y: 1, variante: 2 },
    { tipo: "estante", x: 10, y: 1, variante: 1 },
    { tipo: "arquivo", x: 1, y: 2, variante: 2 },
    // A defesa diante do juízo e a tribuna, de pé, à direita.
    { tipo: "mesa", x: 4, y: 3, variante: 1 },
    { tipo: "tribuna", x: 8, y: 3, variante: 1 },
    // O público, numa fileira só, virado para o juízo.
    { tipo: "fileira", x: 3, y: 5, variante: 1 },
    { tipo: "fileira", x: 4, y: 5, variante: 1 },
    { tipo: "fileira", x: 7, y: 5, variante: 1 },
    { tipo: "fileira", x: 8, y: 5, variante: 1 },
    { tipo: "planta", x: 5, y: 7 },
    // Detalhes de chão: a luz da janela da parede oeste e o capacho diante da saída.
    { tipo: "decoracao", x: 2, y: 4, variante: 2 },
    { tipo: "decoracao", x: 10, y: 4, variante: 3, espelhado: true },
  ],
  tapetes: [
    { x: 5, y: 3 },
    { x: 6, y: 3 },
    { x: 5, y: 4 },
    { x: 6, y: 4 },
  ],
  spawn: { x: 5, y: 4 },
  guia: { x: 1, y: 5 },
  saida: { x: 11, y: 4, lado: "leste" },
  // Nenhum fica ao norte, a oeste ou na diagonal de um objeto alto, que o esconderia, nem ao lado da porta.
  registros: [
    { x: 2, y: 2 },
    { x: 9, y: 2 },
    { x: 1, y: 6 },
    { x: 10, y: 6 },
    { x: 2, y: 7 },
    { x: 8, y: 7 },
  ],
};
