// O seletor de falas do Escrivão: função pura sobre o catálogo e o momento.
// Devolve, nesta ordem, a instrução (sempre), a informação documental (quando
// os dados do momento preenchem um modelo) e o humor (quando ligado). A
// repetição é controlada pelo histórico: entre as candidatas, vale a que não
// foi dita, ou a dita há mais tempo. Sem sorteio: o mesmo histórico dá a
// mesma fala, e os testes conferem isso.

import type { RoomId } from "../types";

import { CATALOGO } from "./catalogo";
import type { Camada, DadosDoMomento, Fala, FalaDita, Momento } from "./types";

/** Os nomes dos campos pedidos por um modelo, na ordem. */
export function camposDe(texto: string): string[] {
  return [...texto.matchAll(/\{([a-zA-Z]+)\}/g)].map((m) => m[1]!);
}

/** Preenche o modelo; `null` se faltar algum campo. */
export function preencher(texto: string, dados: DadosDoMomento): string | null {
  for (const campo of camposDe(texto)) if (dados[campo as keyof DadosDoMomento] === undefined) return null;
  return texto.replace(/\{([a-zA-Z]+)\}/g, (_, campo: string) => dados[campo as keyof DadosDoMomento] ?? "");
}

/** As falas de uma camada e um evento que valem para a sala: as da sala primeiro; as de todas só quando a sala não tem a sua. */
export function candidatas(catalogo: readonly Fala[], sala: RoomId, evento: Fala["evento"], camada: Camada): Fala[] {
  const daCamada = catalogo.filter((fala) => fala.evento === evento && fala.camada === camada);
  const daSala = daCamada.filter((fala) => fala.sala === sala);
  return daSala.length > 0 ? daSala : daCamada.filter((fala) => fala.sala === "todas");
}

/** A candidata que não foi dita, ou a dita há mais tempo; empate pela ordem do catálogo. */
export function menosRecente(opcoes: readonly Fala[], vistas: readonly string[]): Fala | null {
  let escolhida: Fala | null = null;
  let posicao = Number.POSITIVE_INFINITY;
  for (const fala of opcoes) {
    const ultima = vistas.lastIndexOf(fala.id);
    if (ultima < posicao) {
      posicao = ultima;
      escolhida = fala;
    }
  }
  return escolhida;
}

/**
 * As falas do momento. A instrução vem sempre que o catálogo tem uma para o
 * evento (a validação garante um reserva por evento); a documental, só com os
 * dados que ela pede; o humor, só com a preferência ligada. Nunca duas da
 * mesma camada.
 */
export function selectLines(momento: Momento, catalogo: readonly Fala[] = CATALOGO): FalaDita[] {
  const ditas: FalaDita[] = [];
  const dados = momento.dados ?? {};

  const instrucao = menosRecente(candidatas(catalogo, momento.sala, momento.evento, "instrucao"), momento.vistas);
  if (instrucao !== null) ditas.push({ id: instrucao.id, camada: "instrucao", texto: preencher(instrucao.texto, dados) ?? instrucao.texto });

  const documentais = candidatas(catalogo, momento.sala, momento.evento, "documental").filter((fala) => preencher(fala.texto, dados) !== null);
  const documental = menosRecente(documentais, momento.vistas);
  if (documental !== null) ditas.push({ id: documental.id, camada: "documental", texto: preencher(documental.texto, dados)! });

  // Sem humor em contexto sensível (D-129), ainda que a preferência esteja ligada.
  if (momento.humor && momento.sensivel !== true) {
    const humor = menosRecente(candidatas(catalogo, momento.sala, momento.evento, "humor"), momento.vistas);
    if (humor !== null) ditas.push({ id: humor.id, camada: "humor", texto: humor.texto });
  }
  return ditas;
}

/**
 * Quantas falas o histórico guarda, no máximo: o dobro do catálogo basta para
 * a rotação, e o histórico não cresce sem limite em uma visita longa. Uma fala
 * que sai do histórico volta a contar como nunca dita.
 */
export const HISTORICO_MAXIMO = 240;

/** O histórico depois de dizer as falas: os identificadores entram no fim, na ordem; o começo cai quando passa do limite. */
export function registrarDitas(vistas: readonly string[], ditas: readonly FalaDita[]): string[] {
  const todas = [...vistas, ...ditas.map((fala) => fala.id)];
  return todas.length > HISTORICO_MAXIMO ? todas.slice(todas.length - HISTORICO_MAXIMO) : todas;
}

/** Falas guardadas junto com o que as motivou: o `id` de um registro ou de um capítulo. */
export interface FalasGuardadas {
  de: string;
  falas: readonly FalaDita[];
}

/**
 * As falas guardadas, só quando são do que está aberto agora. As da descoberta
 * de um registro não aparecem em outro registro, e as da conclusão de um
 * capítulo não aparecem na transição de outro: uma fala dita em um contexto
 * (com ou sem humor, com os dados daquele registro) não vaza para o seguinte.
 */
export function falasDe(guardadas: FalasGuardadas | null, de: string | null): readonly FalaDita[] {
  return guardadas !== null && de !== null && guardadas.de === de ? guardadas.falas : [];
}

/**
 * As falas que a tela mostra com a preferência atual: sem humor, a camada de
 * humor sai na hora, inclusive de falas já escolhidas. A instrução e a
 * documental ficam. É o único filtro de exibição; toda tela passa por ele.
 */
export function falasVisiveis(falas: readonly FalaDita[], humor: boolean): FalaDita[] {
  return humor ? [...falas] : falas.filter((fala) => fala.camada !== "humor");
}
