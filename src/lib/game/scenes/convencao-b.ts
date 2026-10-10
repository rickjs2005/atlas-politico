// Auditório de convenção (segundo), 2025 a 2026, em tons pardos mais quentes
// e noutra disposição: o palco ao fundo com a tribuna, o microfone, bandeiras
// sem símbolo e um telão de apoio numa ponta, a faixa pintada na borda do palco;
// o público em fileiras duplas, com o corredor de passadeira atravessando a
// sala até a saída a leste; caixas de equipamento, uma planta e um televisor
// no fundo. Representação narrativa: não afirma que a pessoa esteve neste
// lugar nem que os fatos aconteceram nele.

import type { SceneSpec } from "../types";

export const convencaoB: SceneSpec = {
  id: "convencao-b",
  arte: "convencao",
  nome: "Auditório de convenção",
  mapa: [
    "############",
    "#.o.o..o.oo#",
    "#o........o#",
    "#..ooo.ooo1#",
    "#..ooo.ooo.#",
    "#.S........E",
    "#G.ooo.ooo.#",
    "#..2.o..3.o#",
    "############",
  ],
  largura: 12,
  altura: 9,
  // Piso cinza-quente, cortinas pardas, passadeira clara; o acento é o alumínio quente.
  paleta: { chao: "#7b7571", chaoAlt: "#766f6b", tapete: "#9d978f", parede: "#625b57", paredeTopo: "#6f6863", fundo: "#48433f", acento: "#ada79e" },
  props: [
    // O palco: bandeiras, tribuna, microfone de pedestal e as caixas do equipamento num canto.
    { tipo: "bandeira", x: 2, y: 1 },
    { tipo: "tribuna", x: 4, y: 1 },
    { tipo: "microfone", x: 7, y: 1 },
    { tipo: "bandeira", x: 9, y: 1, espelhado: true },
    { tipo: "caixote", x: 10, y: 1, variante: 1 },
    // Uma planta de um lado do palco; do outro, o telão de apoio, virado para o público.
    { tipo: "planta", x: 1, y: 2 },
    { tipo: "tela", x: 10, y: 2, variante: 0 },
    // O público em fileiras duplas, de costas para a câmera.
    { tipo: "fileira", x: 3, y: 3, variante: 1 },
    { tipo: "fileira", x: 4, y: 3, variante: 1 },
    { tipo: "fileira", x: 5, y: 3, variante: 1 },
    { tipo: "fileira", x: 7, y: 3, variante: 1 },
    { tipo: "fileira", x: 8, y: 3, variante: 1 },
    { tipo: "fileira", x: 9, y: 3, variante: 1 },
    { tipo: "fileira", x: 3, y: 4, variante: 1 },
    { tipo: "fileira", x: 4, y: 4, variante: 1 },
    { tipo: "fileira", x: 5, y: 4, variante: 1 },
    { tipo: "fileira", x: 7, y: 4, variante: 1 },
    { tipo: "fileira", x: 8, y: 4, variante: 1 },
    { tipo: "fileira", x: 9, y: 4, variante: 1 },
    { tipo: "fileira", x: 3, y: 6, variante: 1 },
    { tipo: "fileira", x: 4, y: 6, variante: 1 },
    { tipo: "fileira", x: 5, y: 6, variante: 1 },
    { tipo: "fileira", x: 7, y: 6, variante: 1 },
    { tipo: "fileira", x: 8, y: 6, variante: 1 },
    { tipo: "fileira", x: 9, y: 6, variante: 1 },
    // O fundo da sala: o televisor de apoio e uma caixa.
    { tipo: "tela", x: 5, y: 7, variante: 1, espelhado: true },
    { tipo: "caixote", x: 10, y: 7 },
    // A faixa pintada na borda do palco e o capacho diante da saída.
    { tipo: "decoracao", x: 2, y: 2, variante: 0 },
    { tipo: "decoracao", x: 3, y: 2, variante: 0 },
    { tipo: "decoracao", x: 4, y: 2, variante: 0 },
    { tipo: "decoracao", x: 5, y: 2, variante: 0 },
    { tipo: "decoracao", x: 6, y: 2, variante: 0 },
    { tipo: "decoracao", x: 7, y: 2, variante: 0 },
    { tipo: "decoracao", x: 8, y: 2, variante: 0 },
    { tipo: "decoracao", x: 9, y: 2, variante: 0 },
  ],
  // A passadeira do corredor, entre os dois blocos de fileiras, até a porta.
  tapetes: [
    { x: 3, y: 5 },
    { x: 4, y: 5 },
    { x: 5, y: 5 },
    { x: 6, y: 5 },
    { x: 7, y: 5 },
    { x: 8, y: 5 },
    { x: 9, y: 5 },
    { x: 10, y: 5 },
  ],
  spawn: { x: 2, y: 5 },
  guia: { x: 1, y: 6 },
  saida: { x: 11, y: 5, lado: "leste" },
  // Espalhados pela sala: na lateral do palco, no canto do fundo e no meio do fundo; nenhum ao lado da porta nem com objeto alto ao sul.
  registros: [
    { x: 10, y: 3 },
    { x: 3, y: 7 },
    { x: 8, y: 7 },
  ],
};
