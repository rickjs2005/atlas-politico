// Plenário de senado, fim dos anos 2010: bancadas em arco, poltronas, duas
// bandeiras sem símbolo, piso de pedra e passadeira central em tom de ardósia.

import type { SceneSpec } from "../types";

export const senado: SceneSpec = {
  id: "senado",
  arte: "senado",
  nome: "Plenário do Senado",
  mapa: [
    "############",
    "#....S.....#",
    "#.o......o.#",
    "#2.o....o..#",
    "#...o..o..1#",
    "#G...3.....#",
    "#..o....o..#",
    "#.o......o.#",
    "######E#####",
  ],
  largura: 12,
  altura: 9,
  // Fim dos anos 2010: pedra fria, parede clara, tapete de ardósia.
  paleta: { chao: "#d2d5d0", chaoAlt: "#c7cbc6", tapete: "#5d6b78", parede: "#d8dad3", paredeTopo: "#e4e5df", fundo: "#eceee9", acento: "#8a7a4a" },
  props: [
    { tipo: "bandeira", x: 2, y: 2 },
    { tipo: "bandeira", x: 9, y: 2, espelhado: true },
    { tipo: "bancada", x: 3, y: 3 },
    { tipo: "bancada", x: 8, y: 3, espelhado: true },
    { tipo: "bancada", x: 4, y: 4 },
    { tipo: "bancada", x: 7, y: 4, espelhado: true },
    { tipo: "poltrona", x: 3, y: 6 },
    { tipo: "poltrona", x: 8, y: 6, espelhado: true },
    { tipo: "mesa-central", x: 2, y: 7 },
    { tipo: "planta", x: 9, y: 7 },
    // Detalhes de chão: folhas caídas.
    { tipo: "decoracao", x: 9, y: 5, variante: 1 },
    { tipo: "decoracao", x: 3, y: 1, variante: 1 },
  ],
  tapetes: [
    { x: 5, y: 2 },
    { x: 6, y: 2 },
    { x: 5, y: 3 },
    { x: 6, y: 3 },
    { x: 5, y: 4 },
    { x: 6, y: 4 },
    { x: 5, y: 5 },
    { x: 6, y: 5 },
    { x: 5, y: 6 },
    { x: 6, y: 6 },
    { x: 5, y: 7 },
    { x: 6, y: 7 },
  ],
  spawn: { x: 5, y: 1 },
  guia: { x: 1, y: 5 },
  saida: { x: 6, y: 8, lado: "sul" },
  // Nenhum fica na diagonal atrás da porta, que os esconderia.
  registros: [
    { x: 10, y: 4 },
    { x: 1, y: 3 },
    { x: 5, y: 5 },
  ],
};
