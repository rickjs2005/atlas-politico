// Sala de audiências (primeira), em tons quentes: a bancada do juízo ao fundo,
// sob o emblema, com a bandeira sem símbolo e a estante nos cantos; a tribuna
// das testemunhas de frente para a bancada, as mesas das partes com as
// cadeiras dos advogados e, atrás, dois blocos de fileiras de público com a
// passadeira no meio, até a porta dupla do sul. Representação narrativa: não
// afirma que a pessoa esteve neste lugar nem que os fatos aconteceram nele.

import type { SceneSpec } from "../types";

export const tribunalA: SceneSpec = {
  id: "tribunal-a",
  arte: "tribunal",
  nome: "Sala de audiências",
  mapa: [
    "############",
    "#o..ooo...o#",
    "#1.......2.#",
    "#..o.o..o..#",
    "#G.o....o..#",
    "#..oo.oo.S4#",
    "#3.oo.oo...#",
    "#.5.....6..#",
    "#####E######",
  ],
  largura: 12,
  altura: 9,
  // Madeira avermelhada no chão e no lambri, parede creme, passadeira verde-escura.
  paleta: { chao: "#a27a54", chaoAlt: "#987150", tapete: "#4d5c49", parede: "#e6dfcc", paredeTopo: "#ece6d8", fundo: "#efe9dc", acento: "#6b3c2b" },
  props: [
    { tipo: "bandeira", x: 1, y: 1 },
    { tipo: "bancada", x: 4, y: 1 },
    { tipo: "mesa-central", x: 5, y: 1, variante: 0 },
    { tipo: "bancada", x: 6, y: 1 },
    { tipo: "estante", x: 10, y: 1, variante: 0 },
    // As partes, de frente para a bancada, e a tribuna entre elas.
    { tipo: "mesa", x: 3, y: 3, variante: 2 },
    { tipo: "tribuna", x: 5, y: 3, variante: 1 },
    { tipo: "mesa", x: 8, y: 3, variante: 1, espelhado: true },
    { tipo: "cadeira", x: 3, y: 4, variante: 1 },
    { tipo: "cadeira", x: 8, y: 4, variante: 1 },
    // O público, em duas fileiras de cada lado da passadeira, virado para o juízo.
    { tipo: "fileira", x: 3, y: 5, variante: 1 },
    { tipo: "fileira", x: 4, y: 5, variante: 1 },
    { tipo: "fileira", x: 6, y: 5, variante: 1 },
    { tipo: "fileira", x: 7, y: 5, variante: 1 },
    { tipo: "fileira", x: 3, y: 6, variante: 1 },
    { tipo: "fileira", x: 4, y: 6, variante: 1 },
    { tipo: "fileira", x: 6, y: 6, variante: 1 },
    { tipo: "fileira", x: 7, y: 6, variante: 1 },
    // Detalhes de chão: a luz das janelas da parede oeste e papéis caídos.
    { tipo: "decoracao", x: 1, y: 3, variante: 2 },
    { tipo: "decoracao", x: 2, y: 6, variante: 2 },
    { tipo: "decoracao", x: 9, y: 6, variante: 1 },
  ],
  tapetes: [
    { x: 5, y: 4 },
    { x: 5, y: 5 },
    { x: 5, y: 6 },
    { x: 5, y: 7 },
  ],
  spawn: { x: 9, y: 5 },
  guia: { x: 1, y: 4 },
  saida: { x: 5, y: 8, lado: "sul" },
  // Nenhum fica ao norte, a oeste ou na diagonal de um objeto alto, que o esconderia.
  registros: [
    { x: 1, y: 2 },
    { x: 9, y: 2 },
    { x: 1, y: 6 },
    { x: 10, y: 5 },
    { x: 2, y: 7 },
    { x: 8, y: 7 },
  ],
};
