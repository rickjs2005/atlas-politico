// As cores de cada cena. Ficam à parte do layout para a arte poder ajustá-las
// sem tocar no mapa (docs/GAMEPLAY.md, seção Direção visual).
//
// Nenhuma cor identifica pessoa ou partido: são materiais (concreto, madeira,
// pedra) e o tom de cada época. O acento de cada cena é a cor dos seus
// objetos de destaque, e não a cor de seleção do atlas.

import type { SceneId, ScenePalette } from "../types";

export const PALETTES: Record<SceneId, ScenePalette> = {
  // Salão do sindicato, anos 1970: concreto gasto, parede cinza, tapete de lona.
  sindicato: {
    chao: "#cfc8b6",
    chaoAlt: "#c5bdaa",
    tapete: "#b39a74",
    parede: "#9c968b",
    paredeTopo: "#b8b2a6",
    fundo: "#e6e0d2",
    acento: "#b24a00",
  },
  // Plenário da Constituinte, anos 1980: madeira, parede clara, tapete verde-acinzentado.
  constituinte: {
    chao: "#b9956c",
    chaoAlt: "#ad8a62",
    tapete: "#4f6b6a",
    parede: "#d9d2c1",
    paredeTopo: "#e6e0d2",
    fundo: "#ece7db",
    acento: "#8a6d3b",
  },
  // Salão da Assembleia, anos 2000: pedra clara, parede creme, tapete marrom.
  alerj: {
    chao: "#d9d3c5",
    chaoAlt: "#cfc8b8",
    tapete: "#6b5648",
    parede: "#e2dac9",
    paredeTopo: "#ece6d8",
    fundo: "#efeadf",
    acento: "#b9975b",
  },
  // Plenário do Senado, fim dos anos 2010: pedra fria, parede clara, tapete de ardósia.
  senado: {
    chao: "#d2d5d0",
    chaoAlt: "#c7cbc6",
    tapete: "#5d6b78",
    parede: "#d8dad3",
    paredeTopo: "#e4e5df",
    fundo: "#eceee9",
    acento: "#8a7a4a",
  },
};
