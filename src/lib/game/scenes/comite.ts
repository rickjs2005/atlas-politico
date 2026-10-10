// Comitê de campanha, anos 2000: sala alugada com a recepção junto da porta
// (balcão com panfletos, cadeira atrás, banner de chão), duas mesas de
// trabalho com papéis e um televisor na parede do fundo, estante e caixas de
// material, uma mesa de reunião no meio, um sofá de espera diante de um tapete
// pequeno e um cavalete com cartaz sem texto. Ladrilho vinílico no chão.
// Representação narrativa de um período: não afirma que a pessoa esteve neste
// lugar.

import type { SceneSpec } from "../types";

export const comite: SceneSpec = {
  id: "comite",
  arte: "comite",
  nome: "Comitê de campanha",
  mapa: [
    "############",
    "#o.o.oo.oo.#",
    "#.S...o..oo#",
    "#......1...#",
    "#G..oo.....E",
    "#....o.....#",
    "#o..2..o...#",
    "#..o..o...o#",
    "############",
  ],
  largura: 12,
  altura: 9,
  // Vinil bege-claro, parede pintada de marfim, tapete cinza-esverdeado; o acento é o pinho dos móveis.
  paleta: { chao: "#d7d2c5", chaoAlt: "#cec9bb", tapete: "#7f8375", parede: "#e8e3d5", paredeTopo: "#efeadd", fundo: "#f0ebe0", acento: "#b89668" },
  props: [
    // Parede do fundo: caixas de material no canto, o televisor, as duas mesas de trabalho e a estante.
    { tipo: "caixote", x: 1, y: 1, variante: 1 },
    { tipo: "tela", x: 3, y: 1, variante: 1 },
    { tipo: "mesa", x: 5, y: 1, variante: 0 },
    { tipo: "mesa", x: 6, y: 1, variante: 2 },
    { tipo: "cadeira", x: 6, y: 2, variante: 1 },
    { tipo: "estante", x: 8, y: 1, variante: 2 },
    // A recepção, junto da porta: a cadeira atrás do balcão e o banner de chão ao lado.
    { tipo: "cadeira", x: 9, y: 1, variante: 0 },
    { tipo: "balcao", x: 9, y: 2, variante: 1 },
    { tipo: "cartaz", x: 10, y: 2, variante: 1 },
    // A mesa de reunião no meio e o canto de espera, com o sofá virado para a sala.
    { tipo: "cadeira", x: 4, y: 4, variante: 0, espelhado: true },
    { tipo: "mesa-central", x: 5, y: 4, variante: 1 },
    { tipo: "cadeira", x: 5, y: 5, variante: 1 },
    { tipo: "sofa", x: 1, y: 6, espelhado: true },
    { tipo: "cartaz", x: 7, y: 6, variante: 0 },
    // Na frente: uma caixa, a planta e o armário de aço.
    { tipo: "caixote", x: 3, y: 7, variante: 0 },
    { tipo: "planta", x: 6, y: 7 },
    { tipo: "armario", x: 10, y: 7, variante: 1 },
    // Detalhes de chão: a luz da janela, panfletos caídos e o capacho diante da saída.
    { tipo: "decoracao", x: 1, y: 3, variante: 2 },
    { tipo: "decoracao", x: 7, y: 2, variante: 1 },
    { tipo: "decoracao", x: 8, y: 4, variante: 1 },
    { tipo: "decoracao", x: 10, y: 4, variante: 3, espelhado: true },
  ],
  tapetes: [
    { x: 2, y: 5 },
    { x: 3, y: 5 },
    { x: 2, y: 6 },
    { x: 3, y: 6 },
  ],
  spawn: { x: 2, y: 2 },
  guia: { x: 1, y: 4 },
  saida: { x: 11, y: 4, lado: "leste" },
  // Nenhum fica na diagonal atrás da porta, que os esconderia, nem atrás de objeto alto.
  registros: [
    { x: 7, y: 3 },
    { x: 4, y: 6 },
  ],
};
