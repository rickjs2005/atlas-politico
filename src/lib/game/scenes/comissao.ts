// Sala de comissão parlamentar, anos 2020: a mesa da presidência e as
// bancadas ao fundo, com uma tela apagada e uma bandeira sem símbolo; os
// lugares dos convidados com microfone, as fileiras do público, armário e
// arquivo; placas de carpete no chão e uma passadeira até a porta.
// Representação narrativa: não afirma que a pessoa esteve neste lugar nem
// que os fatos aconteceram nele.

import type { SceneSpec } from "../types";

export const comissao: SceneSpec = {
  id: "comissao",
  arte: "comissao",
  nome: "Sala de comissão",
  mapa: [
    "############",
    "#ooo.o.oooo#",
    "#.......4..#",
    "#.S.o.o.o..#",
    "#G.1.......#",
    "#..o.o.o.2.#",
    "#.........o#",
    "#o.3......o#",
    "#####E######",
  ],
  largura: 12,
  altura: 9,
  // Carpete cinza, parede cinza-clara, passadeira azul-acinzentada; o acento é o carvalho.
  paleta: { chao: "#b9bcb8", chaoAlt: "#b1b4b0", tapete: "#5b6a7a", parede: "#e2e3dd", paredeTopo: "#ebece7", fundo: "#eeefeb", acento: "#8c6b4a" },
  props: [
    { tipo: "bancada", x: 1, y: 1 },
    { tipo: "bancada", x: 2, y: 1 },
    { tipo: "mesa-central", x: 3, y: 1, variante: 0 },
    { tipo: "tela", x: 5, y: 1, variante: 1 },
    { tipo: "bancada", x: 7, y: 1, espelhado: true },
    { tipo: "bancada", x: 8, y: 1, espelhado: true },
    { tipo: "bandeira", x: 9, y: 1 },
    { tipo: "estante", x: 10, y: 1, variante: 1 },
    { tipo: "cadeira", x: 4, y: 3, variante: 1 },
    { tipo: "microfone", x: 6, y: 3 },
    { tipo: "cadeira", x: 8, y: 3, variante: 1, espelhado: true },
    { tipo: "fileira", x: 3, y: 5 },
    { tipo: "fileira", x: 5, y: 5 },
    { tipo: "fileira", x: 7, y: 5 },
    { tipo: "planta", x: 10, y: 6 },
    { tipo: "armario", x: 1, y: 7 },
    { tipo: "arquivo", x: 10, y: 7, variante: 1 },
    // Detalhes de chão: a luz da janela e papéis caídos.
    { tipo: "decoracao", x: 9, y: 3, variante: 2 },
    { tipo: "decoracao", x: 7, y: 6, variante: 1 },
  ],
  tapetes: [
    { x: 5, y: 6 },
    { x: 5, y: 7 },
  ],
  spawn: { x: 2, y: 3 },
  guia: { x: 1, y: 4 },
  saida: { x: 5, y: 8, lado: "sul" },
  // Nenhum fica ao lado da saída, onde a porta o esconderia. O quarto é a
  // decisão do capítulo (o voto), diante da bancada.
  registros: [
    { x: 3, y: 4 },
    { x: 9, y: 5 },
    { x: 3, y: 7 },
    { x: 8, y: 2 },
  ],
};
