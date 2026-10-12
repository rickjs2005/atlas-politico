// O seletor de falas do Escrivão: função pura sobre o catálogo e o momento.
// Devolve, nesta ordem, a instrução (sempre) e uma fala de humor (quando
// ligado e fora de contexto sensível): nunca mais do que as duas. A repetição
// é controlada pela vez: cada momento diz qual é a vez dele (a posição da
// fase, o número da tentativa), e as falas de cada camada rodam por ela. Sem
// sorteio e sem estado: o mesmo momento dá a mesma fala, e os testes conferem
// isso.

import type { RoomId } from "../types";

import { CATALOGO } from "./catalogo";
import type { Camada, Fala, FalaDita, Momento } from "./types";

/** As falas de uma camada e um evento que valem para a sala: as da sala primeiro; as de todas só quando a sala não tem a sua. */
export function candidatas(catalogo: readonly Fala[], sala: RoomId, evento: Fala["evento"], camada: Camada): Fala[] {
  const daCamada = catalogo.filter((fala) => fala.evento === evento && fala.camada === camada);
  const daSala = daCamada.filter((fala) => fala.sala === sala);
  return daSala.length > 0 ? daSala : daCamada.filter((fala) => fala.sala === "todas");
}

/** A candidata da vez: as falas rodam na ordem do catálogo, e voltam ao começo depois da última. */
export function daVez(opcoes: readonly Fala[], vez: number): Fala | null {
  if (opcoes.length === 0) return null;
  const indice = ((Math.trunc(vez) % opcoes.length) + opcoes.length) % opcoes.length;
  return opcoes[indice]!;
}

/**
 * As falas do momento. A instrução vem sempre que o catálogo tem uma para o
 * evento (a validação garante um reserva por evento); o humor, só com a
 * preferência ligada e fora de contexto sensível. Nunca duas da mesma camada:
 * o máximo é uma instrução e uma fala de humor.
 */
export function selectLines(momento: Momento, catalogo: readonly Fala[] = CATALOGO): FalaDita[] {
  const ditas: FalaDita[] = [];

  const instrucao = daVez(candidatas(catalogo, momento.sala, momento.evento, "instrucao"), momento.vez);
  if (instrucao !== null) ditas.push({ id: instrucao.id, camada: "instrucao", texto: instrucao.texto });

  // Sem humor em contexto sensível (D-129), ainda que a preferência esteja ligada.
  if (momento.humor && momento.sensivel !== true) {
    const humor = daVez(candidatas(catalogo, momento.sala, momento.evento, "humor"), momento.vez);
    if (humor !== null) ditas.push({ id: humor.id, camada: "humor", texto: humor.texto });
  }
  return ditas;
}

/**
 * As falas que a tela mostra com a preferência atual: sem humor, a camada de
 * humor sai na hora, inclusive de falas já escolhidas. A instrução fica. É o
 * único filtro de exibição; toda tela passa por ele.
 */
export function falasVisiveis(falas: readonly FalaDita[], humor: boolean): FalaDita[] {
  return humor ? [...falas] : falas.filter((fala) => fala.camada !== "humor");
}
