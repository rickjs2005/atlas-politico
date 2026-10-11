// Tipos do domínio para quem não pode carregar o Zod (componentes do
// navegador). São reexportações só de tipo: nada de `schemas.ts` entra no
// bundle por aqui.

export type {
  Acontecimento,
  AtoExecutivo,
  Citacao,
  CoberturaPolitica,
  Conjunto,
  Edicao,
  Editorial,
  Filiacao,
  Fonte,
  IdentidadeInstitucional,
  Imagem,
  Localizacao,
  Lugar,
  Mandato,
  ObjetoVotadoRegistro,
  Pessoa,
  Proposicao,
  RegistroIndividual,
  Votacao,
  Voto,
} from "./schemas";

export type { Categoria } from "./categories";
export type {
  EstadoDeCobertura,
  Instituicao,
  Jurisdicao,
  ModalidadeDeVotacao,
  ObjetoVotado,
  PosicaoDeVoto,
  Provedor,
  ResultadoDeVotacao,
  Tema,
  TemaDeCobertura,
  TipoDeAto,
  TipoDeParticipacao,
  TipoDeRegistroIndividual,
} from "./decisions";
export type { DataHistorica, Periodo, Precisao } from "./dates";
export type { Coordenadas, Position, PrecisaoGeografica } from "./geo";
