// O Escrivão: o guia fictício do jogo (D-127). Fala em três camadas, que a
// interface separa e o catálogo marca:
//   instrucao    o que fazer agora. Obrigatória: aparece sempre;
//   documental   informação que vem dos registros publicados (data, título,
//                quantas fontes, cargo, manifestação), preenchida em modelos
//                com campos. O Escrivão não escreve fato: repete o conjunto;
//   humor        falas ficcionais sobre papelada, carimbos, gavetas e o
//                próprio Escrivão. Opcionais: a pessoa pode desligar. Nunca
//                sobre as pessoas retratadas, e as mesmas para os dois
//                personagens.
// Sem IA durante a partida: o catálogo é escrito à mão e validado por teste.

import type { RoomId } from "../types";

/** Quando o Escrivão fala. */
export type EscrivaoEvent = "entrada" | "ajuda" | "descoberta" | "fonte" | "erro" | "conclusao";

export const ESCRIVAO_EVENTS: readonly EscrivaoEvent[] = ["entrada", "ajuda", "descoberta", "fonte", "erro", "conclusao"];

export type Camada = "instrucao" | "documental" | "humor";

export const CAMADAS: readonly Camada[] = ["instrucao", "documental", "humor"];

export const CAMADA_LABELS: Record<Camada, string> = {
  instrucao: "Instrução",
  documental: "Do registro",
  humor: "Humor do Escrivão, ficção",
};

/** Uma fala vale para uma sala ou para todas (o reserva, quando a sala não tem a sua). */
export type AlcanceDaFala = RoomId | "todas";

export interface Fala {
  /** Identificador estável: entra no histórico do que já foi dito. */
  id: string;
  sala: AlcanceDaFala;
  evento: EscrivaoEvent;
  camada: Camada;
  /** O texto. Nas falas documentais, com campos entre chaves, preenchidos pelos dados do registro: {titulo}, {data}. */
  texto: string;
}

/** Os campos que uma fala documental pode pedir. Só o que o registro publicado traz. */
export const CAMPOS_DOCUMENTAIS = [
  "titulo",
  "data",
  "fontes",
  "registros",
  "periodo",
  "cargo",
  "instituicao",
  "manifestacao",
  "tipoDoAto",
  "objeto",
  "recolhidos",
  "capitulo",
] as const;
export type CampoDocumental = (typeof CAMPOS_DOCUMENTAIS)[number];

/** Os dados do momento, para preencher as falas documentais. Campo ausente deixa a fala de fora. */
export type DadosDoMomento = Partial<Record<CampoDocumental, string>>;

/** O que o seletor recebe. */
export interface Momento {
  sala: RoomId;
  evento: EscrivaoEvent;
  /** A pessoa quer humor (preferência). */
  humor: boolean;
  /** Os identificadores das falas já ditas nesta visita, na ordem em que foram ditas. */
  vistas: readonly string[];
  dados?: DadosDoMomento;
}

/** Uma fala escolhida, com o texto já preenchido. */
export interface FalaDita {
  id: string;
  camada: Camada;
  texto: string;
}
