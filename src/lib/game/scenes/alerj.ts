// Salão de uma assembleia estadual, anos 2000: colunas nos cantos, piso de
// pedra clara, urnas eletrônicas sobre mesas, tapete central.

import type { SceneSpec } from "../types";

export const alerj: SceneSpec = {
  id: "alerj",
  arte: "alerj",
  nome: "Salão da Assembleia",
  mapa: [
    "############",
    "#o...2....o#",
    "#..S.......#",
    "#.o..o..o..#",
    "#..........E",
    "#.o..o..o.1#",
    "#G...3.....#",
    "#o.4...5..o#",
    "############",
  ],
  largura: 12,
  altura: 9,
  // Anos 2000: pedra clara, parede creme, tapete marrom.
  paleta: { chao: "#d9d3c5", chaoAlt: "#cfc8b8", tapete: "#6b5648", parede: "#e2dac9", paredeTopo: "#ece6d8", fundo: "#efeadf", acento: "#b9975b" },
  props: [
    { tipo: "coluna", x: 1, y: 1 },
    { tipo: "coluna", x: 10, y: 1 },
    // Urnas sobre mesas, duas delas com a cabine; as mesas do meio, com papéis e uma pasta aberta.
    { tipo: "urna", x: 2, y: 3, variante: 1 },
    { tipo: "mesa", x: 5, y: 3 },
    { tipo: "urna", x: 8, y: 3 },
    { tipo: "urna", x: 2, y: 5 },
    { tipo: "mesa", x: 5, y: 5, variante: 2 },
    { tipo: "urna", x: 8, y: 5, variante: 1 },
    { tipo: "coluna", x: 1, y: 7 },
    { tipo: "coluna", x: 10, y: 7 },
    // Detalhes de chão: folhas caídas.
    { tipo: "decoracao", x: 7, y: 2, variante: 1 },
    { tipo: "decoracao", x: 9, y: 6, variante: 1 },
  ],
  tapetes: [
    { x: 3, y: 4 },
    { x: 4, y: 4 },
    { x: 5, y: 4 },
    { x: 6, y: 4 },
    { x: 7, y: 4 },
    { x: 8, y: 4 },
    { x: 9, y: 4 },
    { x: 10, y: 4 },
  ],
  spawn: { x: 3, y: 2 },
  guia: { x: 1, y: 6 },
  saida: { x: 11, y: 4, lado: "leste" },
  // Nenhum fica na diagonal atrás da porta nem atrás de uma coluna, que os esconderiam.
  registros: [
    { x: 10, y: 5 },
    { x: 5, y: 1 },
    { x: 5, y: 6 },
    { x: 3, y: 7 },
    { x: 7, y: 7 },
  ],
};
