// Contexto sensível (D-129): registros sobre processo judicial, prisão,
// acusação ou violência. Nesses momentos o Escrivão não faz humor, mesmo com
// a preferência ligada; a instrução não muda.
//
// A regra é uma sinalização editorial por registro, a mesma para os dois
// personagens: os episódios da ficha judicial (judicial.ts) e uma lista curta
// de outros registros, acontecimentos ou decisões. Nenhum texto é avaliado: a
// regra olha identificadores, para ser conferível por teste. Um tema inteiro
// não é sensível: uma lei sobre segurança pública é uma decisão como as
// outras. Um aprofundamento só perde o humor quando a explicação dele aponta
// um registro da lista: é o caso do de Segurança pública de Lula, pelo decreto
// da intervenção de 8 de janeiro de 2023, e não o de Flávio Bolsonaro.
//
// O código só aplica a regra. A aprovação do tom e da lista é de uma pessoa
// (docs/GAMEPLAY.md, seção Regras editoriais do jogo).

import { judicialOf } from "./judicial";
import { phaseRefs } from "./trail";
import type { PhaseSpec } from "./types";

/**
 * Registros fora da ficha judicial que são de contexto sensível, pelo `id` do
 * conjunto publicado: a prisão de 1980 e os dois registros da intervenção
 * federal de 8 de janeiro de 2023 (o acontecimento e o decreto), que tratam
 * de um episódio de violência. Um teste confere que todo identificador
 * existe em uma fase.
 */
export const REGISTROS_SENSIVEIS: readonly string[] = [
  "lula-1980-prisao-pela-lei-de-seguranca-nacional",
  "lula-2023-intervencao-federal-no-distrito-federal",
  "planalto-decreto-11377-2023-intervencao-df",
];

/** O registro (acontecimento ou decisão) com este `id` pede contexto sensível? Identificador desconhecido não é sensível. */
export function isSensitive(id: string): boolean {
  return judicialOf(id) !== null || REGISTROS_SENSIVEIS.includes(id);
}

/**
 * A fase pede contexto sensível nas falas que são dela (a entrada, o erro e a
 * conclusão) quando o marco, a explicação ou a atividade apontam um registro
 * sensível: é o que a pessoa acabou de ler e de responder. Um registro
 * sensível que só está em "Explorar este período" não muda a fase: ele leva
 * a própria marca quando é aberto, e os outros registros opcionais continuam
 * com a fala deles.
 */
export function isSensitivePhase(fase: Pick<PhaseSpec, "marco" | "explicacao" | "atividade" | "explorar">): boolean {
  const doTexto = phaseRefs({ ...fase, explorar: [] });
  return doTexto.some((referencia) => (referencia.tipo === "acontecimento" || referencia.tipo === "decisao") && isSensitive(referencia.id));
}
