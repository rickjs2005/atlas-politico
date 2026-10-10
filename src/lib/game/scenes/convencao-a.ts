// Auditório de convenção (primeiro), 2026, em cinza frio e escuro: o palco ao
// fundo com a tribuna, o microfone, duas cadeiras de convidado e bandeiras
// sem símbolo, a faixa pintada na borda do palco; seis fileiras de público
// em dois blocos, com o corredor central de passadeira até a saída ao sul;
// caixas de equipamento e um televisor de apoio no fundo da sala.
// Representação narrativa: não afirma que a pessoa esteve neste lugar nem
// que os fatos aconteceram nele.

import type { SceneSpec } from "../types";

export const convencaoA: SceneSpec = {
  id: "convencao-a",
  arte: "convencao",
  nome: "Auditório de convenção",
  mapa: [
    "############",
    "#oo.o..o.oo#",
    "#.........o#",
    "#.S.......1#",
    "#.ooo..ooo.#",
    "#G.........#",
    "#.ooo..ooo.#",
    "#o.2......o#",
    "######E#####",
  ],
  largura: 12,
  altura: 9,
  // Piso cinza-escuro de evento, cortinas cinza-chumbo, passadeira cinza-clara; o acento é o alumínio.
  paleta: { chao: "#6f7277", chaoAlt: "#6a6d72", tapete: "#8f9397", parede: "#565a5f", paredeTopo: "#62666b", fundo: "#3e4144", acento: "#a4a9ad" },
  props: [
    // O palco: bandeiras nas pontas, cadeiras de convidado, tribuna e microfone de pedestal.
    { tipo: "bandeira", x: 1, y: 1 },
    { tipo: "cadeira", x: 2, y: 1 },
    { tipo: "tribuna", x: 4, y: 1 },
    { tipo: "microfone", x: 7, y: 1 },
    { tipo: "cadeira", x: 9, y: 1, espelhado: true },
    { tipo: "bandeira", x: 10, y: 1, espelhado: true },
    // O público, de costas para a câmera, em dois blocos.
    { tipo: "fileira", x: 2, y: 4, variante: 1 },
    { tipo: "fileira", x: 3, y: 4, variante: 1 },
    { tipo: "fileira", x: 4, y: 4, variante: 1 },
    { tipo: "fileira", x: 7, y: 4, variante: 1 },
    { tipo: "fileira", x: 8, y: 4, variante: 1 },
    { tipo: "fileira", x: 9, y: 4, variante: 1 },
    { tipo: "fileira", x: 2, y: 6, variante: 1 },
    { tipo: "fileira", x: 3, y: 6, variante: 1 },
    { tipo: "fileira", x: 4, y: 6, variante: 1 },
    { tipo: "fileira", x: 7, y: 6, variante: 1 },
    { tipo: "fileira", x: 8, y: 6, variante: 1 },
    { tipo: "fileira", x: 9, y: 6, variante: 1 },
    // Caixas de equipamento num canto do palco e no fundo, e o televisor de apoio no fundo, virado para a sala.
    { tipo: "caixote", x: 10, y: 2 },
    { tipo: "tela", x: 1, y: 7, variante: 1, espelhado: true },
    { tipo: "caixote", x: 10, y: 7, variante: 1 },
    // A faixa pintada na borda do palco, de ponta a ponta.
    { tipo: "decoracao", x: 2, y: 2, variante: 0 },
    { tipo: "decoracao", x: 3, y: 2, variante: 0 },
    { tipo: "decoracao", x: 4, y: 2, variante: 0 },
    { tipo: "decoracao", x: 5, y: 2, variante: 0 },
    { tipo: "decoracao", x: 6, y: 2, variante: 0 },
    { tipo: "decoracao", x: 7, y: 2, variante: 0 },
    { tipo: "decoracao", x: 8, y: 2, variante: 0 },
    { tipo: "decoracao", x: 9, y: 2, variante: 0 },
  ],
  // A passadeira do corredor central, do palco à saída.
  tapetes: [
    { x: 5, y: 4 },
    { x: 6, y: 4 },
    { x: 5, y: 5 },
    { x: 6, y: 5 },
    { x: 5, y: 6 },
    { x: 6, y: 6 },
    { x: 5, y: 7 },
    { x: 6, y: 7 },
  ],
  spawn: { x: 2, y: 3 },
  guia: { x: 1, y: 5 },
  saida: { x: 6, y: 8, lado: "sul" },
  // Um na lateral do palco, outro no fundo da sala; nenhum com fileira ao sul nem na diagonal atrás da porta, que os esconderiam.
  registros: [
    { x: 10, y: 3 },
    { x: 3, y: 7 },
  ],
};
