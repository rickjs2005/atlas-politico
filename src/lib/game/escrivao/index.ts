// O Escrivão, guia fictício do jogo: catálogo, seleção e validação. Puro.

export const ESCRIVAO_NOME = "Escrivão";
export const ESCRIVAO_ROTULO = "Escrivão · personagem fictício";

export { CATALOGO } from "./catalogo";
export { candidatas, daVez, falasVisiveis, selectLines } from "./selecao";
export type { AlcanceDaFala, Camada, EscrivaoEvent, Fala, FalaDita, Momento } from "./types";
export { CAMADAS, CAMADA_LABELS, ESCRIVAO_EVENTS } from "./types";
export { INSTRUCAO_MAXIMA, MINIMO_DE_HUMOR, validateCatalog } from "./validacao";
