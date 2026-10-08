// Tipos do domínio para quem não pode carregar o Zod (componentes do
// navegador). São reexportações só de tipo: nada de `schemas.ts` entra no
// bundle por aqui.

export type {
  Acontecimento,
  Citacao,
  Conjunto,
  Edicao,
  Editorial,
  Filiacao,
  Fonte,
  Imagem,
  Localizacao,
  Lugar,
  Mandato,
  Pessoa,
} from "./schemas";

export type { Categoria } from "./categories";
export type { DataHistorica, Periodo, Precisao } from "./dates";
export type { Coordenadas, Position, PrecisaoGeografica } from "./geo";
