// Contexto sensível (D-129): registros sobre processo judicial, prisão,
// acusação ou violência. Nesses momentos o Escrivão não faz humor, mesmo com
// a preferência ligada; a instrução e a informação documental não mudam.
//
// A regra é uma sinalização editorial por registro, a mesma para os dois
// personagens: os episódios da ficha judicial (judicial.ts) e uma lista curta
// de outros registros, acontecimentos ou decisões. Nenhum texto é avaliado: a
// regra olha identificadores, para ser conferível por teste. Um tema inteiro
// não é sensível: uma lei sobre segurança pública é uma decisão como as
// outras, e a sala dela mantém o humor sobre papelada.
//
// O código só aplica a regra. A aprovação do tom e da lista é de uma pessoa
// (docs/GAMEPLAY.md, seção Regras editoriais do jogo).

import { judicialOf } from "./judicial";
import { recordIds, requiredRecords } from "./mission";
import type { ChapterSpec } from "./types";

/**
 * Registros fora da ficha judicial que são de contexto sensível, pelo `id` do
 * conjunto publicado: a prisão de 1980 e os dois registros da intervenção
 * federal de 8 de janeiro de 2023 (o acontecimento e o decreto), que tratam
 * de um episódio de violência. Um teste confere que todo identificador
 * existe em um capítulo.
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
 * O capítulo pede contexto sensível nas falas que são dele, e não de um
 * registro (a entrada, a ajuda e a conclusão): quando a tarefa pede um
 * registro sensível, ou quando mais da metade dos registros do capítulo é
 * sensível. Os registros que não são sensíveis continuam com a própria
 * descoberta, com humor.
 */
export function isSensitiveChapter(capitulo: Pick<ChapterSpec, "eventIds" | "decisaoIds" | "tarefa">): boolean {
  if (requiredRecords(capitulo.tarefa).some(isSensitive)) return true;
  const ids = recordIds(capitulo);
  return ids.filter(isSensitive).length * 2 > ids.length;
}
