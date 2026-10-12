// Tipos do domínio para quem não pode carregar o Zod (componentes do
// navegador). São reexportações só de tipo: nada de `schemas.ts` entra no
// bundle por aqui.

export type {
  Acontecimento,
  AtividadeDeFase,
  AtoExecutivo,
  AtuacaoLegislativa,
  Citacao,
  CoberturaPolitica,
  Conceito,
  Conjunto,
  Edicao,
  Editorial,
  FaseDoJogo,
  FatoBiografico,
  Filiacao,
  Fonte,
  IdentidadeInstitucional,
  Imagem,
  Localizacao,
  Lugar,
  Mandato,
  ObjetoVotadoRegistro,
  Pessoa,
  PropostaEleitoral,
  Proposicao,
  ReferenciaDeFase,
  RegistroIndividual,
  Votacao,
  Voto,
} from "./schemas";

export type { Categoria } from "./categories";
export type {
  DesfechoDeAtuacao,
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
  TipoDeAtuacao,
  TipoDeParticipacao,
  TipoDeRegistroIndividual,
} from "./decisions";
export type { DataHistorica, Periodo, Precisao } from "./dates";
export type { SalaDoJogo, TipoDeFatoBiografico, TipoDeReferenciaDeFase } from "./game";
export type { Coordenadas, Position, PrecisaoGeografica } from "./geo";
