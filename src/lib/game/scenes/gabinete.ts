// Gabinete de trabalho, anos 2020: a mesa de despacho ao fundo, com a
// poltrona de costas e uma bandeira sem símbolo, estantes, dois sofás de
// frente um para o outro, uma mesa de reunião, arquivo e armário; carpete de
// lã no chão e uma passadeira diante do guia. Representação narrativa: não
// afirma que a pessoa esteve neste lugar nem que os fatos aconteceram nele.

import type { SceneSpec } from "../types";

export const gabinete: SceneSpec = {
  id: "gabinete",
  arte: "gabinete",
  nome: "Gabinete",
  mapa: [
    "############",
    "#oo.o....oo#",
    "#.......o..#",
    "#..S..1....#",
    "#G.....o...E",
    "#.o.o....o.#",
    "#...2....o.#",
    "#o......3.o#",
    "############",
  ],
  largura: 12,
  altura: 9,
  // Carpete pardo, parede marfim, passadeira marrom; o acento é a nogueira.
  paleta: { chao: "#8e7d6a", chaoAlt: "#887766", tapete: "#6b5a4a", parede: "#e9e3d6", paredeTopo: "#f0ebe0", fundo: "#f1ece2", acento: "#8a6a4c" },
  props: [
    { tipo: "estante", x: 1, y: 1 },
    { tipo: "estante", x: 2, y: 1, variante: 2 },
    { tipo: "bandeira", x: 4, y: 1 },
    { tipo: "mesa", x: 9, y: 1, variante: 1, espelhado: true },
    { tipo: "poltrona", x: 10, y: 1, variante: 1 },
    { tipo: "cadeira", x: 8, y: 2 },
    { tipo: "mesa-central", x: 7, y: 4, variante: 1 },
    { tipo: "sofa", x: 2, y: 5 },
    { tipo: "sofa", x: 4, y: 5, variante: 1 },
    { tipo: "planta", x: 9, y: 5 },
    { tipo: "arquivo", x: 9, y: 6, variante: 0 },
    { tipo: "planta", x: 1, y: 7 },
    { tipo: "armario", x: 10, y: 7 },
    // Detalhes de chão: a luz da janela e o capacho diante da saída.
    { tipo: "decoracao", x: 6, y: 2, variante: 2 },
    { tipo: "decoracao", x: 10, y: 4, variante: 3, espelhado: true },
  ],
  tapetes: [
    { x: 2, y: 4 },
    { x: 3, y: 4 },
    { x: 4, y: 4 },
    { x: 5, y: 4 },
  ],
  spawn: { x: 3, y: 3 },
  guia: { x: 1, y: 4 },
  saida: { x: 11, y: 4, lado: "leste" },
  // Nenhum fica na diagonal atrás da porta, que os esconderia.
  registros: [
    { x: 6, y: 3 },
    { x: 4, y: 6 },
    { x: 8, y: 7 },
  ],
};
