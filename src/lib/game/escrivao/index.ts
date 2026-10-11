// O Escrivão, guia fictício do jogo: catálogo, seleção e validação. Puro.

export const ESCRIVAO_NOME = "Escrivão";
export const ESCRIVAO_ROTULO = "Escrivão · personagem fictício";

export { CATALOGO } from "./catalogo";
export { candidatas, menosRecente, preencher, registrarDitas, selectLines } from "./selecao";
export type { AlcanceDaFala, Camada, CampoDocumental, DadosDoMomento, EscrivaoEvent, Fala, FalaDita, Momento } from "./types";
export { CAMADAS, CAMADA_LABELS, CAMPOS_DOCUMENTAIS, ESCRIVAO_EVENTS } from "./types";
export { MINIMO_DE_HUMOR, validateCatalog } from "./validacao";
