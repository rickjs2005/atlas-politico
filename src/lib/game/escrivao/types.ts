// O Escrivão: o guia fictício do jogo (D-127). Fala em duas camadas, que a
// interface separa e o catálogo marca, e cada momento tem no máximo uma fala
// de cada uma (D-133):
//   instrucao    o que fazer agora, em uma frase curta. Obrigatória: aparece sempre;
//   humor        uma fala ficcional sobre papelada, carimbos, gavetas e o
//                próprio Escrivão. Opcional: a pessoa pode desligar. Nunca
//                sobre as pessoas retratadas, e as mesmas para os dois
//                personagens.
// O Escrivão não repete fato: data, título, cargo e fontes ficam na fase e no
// registro, que são do conteúdo publicado.
// Sem IA durante a partida e sem sorteio: o catálogo é escrito à mão e validado por teste.

import type { RoomId } from "../types";

/**
 * Quando o Escrivão fala: ao abrir uma fase (`entrada`), em "Como funciona"
 * (`ajuda`), ao abrir um registro opcional do período (`explorar`), depois
 * de uma resposta errada (`erro`), quando a fase acaba de ser concluída e o
 * carimbo dela entra no passaporte (`carimbo`, D-150) e ao rever uma fase que
 * já estava concluída (`conclusao`). O carimbo e a conclusão são o mesmo
 * lugar da tela em horas diferentes: nunca aparecem juntos.
 */
export type EscrivaoEvent = "entrada" | "ajuda" | "explorar" | "erro" | "conclusao" | "carimbo";

export const ESCRIVAO_EVENTS: readonly EscrivaoEvent[] = ["entrada", "ajuda", "explorar", "erro", "conclusao", "carimbo"];

export type Camada = "instrucao" | "humor";

export const CAMADAS: readonly Camada[] = ["instrucao", "humor"];

export const CAMADA_LABELS: Record<Camada, string> = {
  instrucao: "Instrução",
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
  /** O texto, pronto: sem campos a preencher. */
  texto: string;
}

/** O que o seletor recebe. */
export interface Momento {
  sala: RoomId;
  evento: EscrivaoEvent;
  /** A pessoa quer humor (preferência). */
  humor: boolean;
  /**
   * A vez deste momento: um número a partir de zero que decide qual fala de
   * cada camada é dita (a posição da fase, o número da tentativa). As falas
   * rodam por ele, e o mesmo momento dá sempre a mesma fala.
   */
  vez: number;
  /**
   * O momento é sobre uma fase ou um registro de contexto sensível (processo judicial,
   * prisão, acusação, violência: src/lib/game/sensitivity.ts, D-129). O humor
   * fica de fora mesmo com a preferência ligada; a instrução não muda.
   */
  sensivel?: boolean;
}

/** Uma fala escolhida. */
export interface FalaDita {
  id: string;
  camada: Camada;
  texto: string;
}
