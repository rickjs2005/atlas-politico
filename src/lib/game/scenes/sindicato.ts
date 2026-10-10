// Salão de um sindicato de metalúrgicos, anos 1970: chão de concreto gasto,
// máquinas encostadas, um palco com tribuna e microfone, armários de ferro.

import type { SceneSpec } from "../types";

import { PALETTES } from "./palettes";

export const sindicato: SceneSpec = {
  id: "sindicato",
  nome: "Salão do sindicato",
  mapa: [
    "############",
    "#..o.oo.o..#",
    "#.S....2...#",
    "#...o......#",
    "#G.........E",
    "#...o...o..#",
    "#.3...4...1#",
    "#o.......o.#",
    "############",
  ],
  largura: 12,
  altura: 9,
  paleta: PALETTES.sindicato,
  props: [
    // O torno, encostado na parede do fundo; a prensa fica na parede oeste.
    { tipo: "maquina", x: 3, y: 1, variante: 1 },
    { tipo: "tribuna", x: 5, y: 1 },
    { tipo: "microfone", x: 6, y: 1 },
    { tipo: "armario", x: 8, y: 1, variante: 1 },
    { tipo: "caixote", x: 4, y: 3, variante: 1 },
    { tipo: "banco", x: 4, y: 5 },
    { tipo: "mesa", x: 8, y: 5, variante: 1 },
    { tipo: "maquina", x: 1, y: 7, espelhado: true },
    { tipo: "estante", x: 9, y: 7 },
    // Detalhes de chão: a faixa de segurança diante do torno, panfletos caídos,
    // a luz da janela e o capacho diante da saída.
    { tipo: "decoracao", x: 3, y: 2, variante: 0 },
    { tipo: "decoracao", x: 4, y: 2, variante: 0 },
    { tipo: "decoracao", x: 8, y: 3, variante: 1 },
    { tipo: "decoracao", x: 4, y: 7, variante: 1 },
    { tipo: "decoracao", x: 1, y: 5, variante: 2 },
    { tipo: "decoracao", x: 10, y: 4, variante: 3, espelhado: true },
  ],
  tapetes: [
    { x: 5, y: 2 },
    { x: 6, y: 2 },
    { x: 5, y: 3 },
    { x: 6, y: 3 },
  ],
  spawn: { x: 2, y: 2 },
  guia: { x: 1, y: 4 },
  saida: { x: 11, y: 4, lado: "leste" },
  // Nenhum fica na diagonal atrás da porta, que os esconderia.
  registros: [
    { x: 10, y: 6 },
    { x: 7, y: 2 },
    { x: 2, y: 6 },
    { x: 6, y: 6 },
  ],
};
