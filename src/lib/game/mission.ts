// Regras de tarefa e de saída: o que cumpre a tarefa de um capítulo e o que
// abre a passagem para o seguinte. Funções puras sobre o estado da tarefa e
// as datas dos registros.
//
// Objetivo, ação e conclusão são explícitos:
//   registro   recolher o registro pedido cumpre a tarefa;
//   ordem      recolher os dois registros e confirmar a ordem certa cumpre.
//              Errar explica e permite tentar de novo, sem punição.
//   saída      abre com a tarefa cumprida e TODOS os registros do capítulo
//              recolhidos, e não só os que a tarefa pede.

import { compareDates, formatDate, intervalsOverlap, calcInterval } from "@/lib/domain/dates";
import type { DataHistorica } from "@/lib/domain/types";

import type { ChapterSpec, GameRecord, TaskSpec, TaskState } from "./types";

export function initialTaskState(): TaskState {
  return { recolhidos: [], ordemConfirmada: false, tentativas: 0 };
}

/** Os registros que a tarefa exige, na ordem em que a tarefa os cita. */
export function requiredRecords(tarefa: TaskSpec): readonly string[] {
  return tarefa.tipo === "registro" ? [tarefa.eventId] : tarefa.eventIds;
}

/** Recolher um registro. Recolher o mesmo duas vezes não muda nada. */
export function collect(estado: TaskState, eventId: string): TaskState {
  if (estado.recolhidos.includes(eventId)) return estado;
  return { ...estado, recolhidos: [...estado.recolhidos, eventId] };
}

/** Os registros exigidos já foram recolhidos? */
export function hasRequired(tarefa: TaskSpec, estado: TaskState): boolean {
  return requiredRecords(tarefa).every((id) => estado.recolhidos.includes(id));
}

export function isTaskDone(tarefa: TaskSpec, estado: TaskState): boolean {
  if (tarefa.tipo === "registro") return estado.recolhidos.includes(tarefa.eventId);
  return estado.ordemConfirmada;
}

/** A tarefa de ordem está pronta para ser respondida (os dois recolhidos, ordem ainda não confirmada)? */
export function isOrderPending(tarefa: TaskSpec, estado: TaskState): boolean {
  return tarefa.tipo === "ordem" && hasRequired(tarefa, estado) && !estado.ordemConfirmada;
}

/** Os registros do capítulo que ainda não foram recolhidos, na ordem do capítulo. */
export function missingRecords(capitulo: ChapterSpec, estado: TaskState): string[] {
  return capitulo.eventIds.filter((id) => !estado.recolhidos.includes(id));
}

/**
 * A saída do capítulo está aberta: a tarefa foi cumprida e não falta
 * recolher nenhum registro do capítulo. Cumprir só a tarefa não abre a
 * passagem, e recolher tudo sem confirmar a ordem também não.
 */
export function isExitOpen(capitulo: ChapterSpec, estado: TaskState): boolean {
  return isTaskDone(capitulo.tarefa, estado) && missingRecords(capitulo, estado).length === 0;
}

/**
 * As datas decidem a ordem sem ambiguidade: os intervalos de cálculo das
 * duas não se cruzam. `1980-02-10` e `1986` decidem; `1980` e `1980-02-10`
 * não, porque o ano inteiro contém o dia.
 */
export function datesDecideOrder(a: DataHistorica, b: DataHistorica): boolean {
  return !intervalsOverlap(calcInterval(a), calcInterval(b));
}

/** A ordem cronológica correta dos dois registros de uma tarefa de ordem. */
export function correctOrder(tarefa: Extract<TaskSpec, { tipo: "ordem" }>, registros: Record<string, GameRecord>): [string, string] {
  const [a, b] = tarefa.eventIds;
  const ra = registros[a];
  const rb = registros[b];
  if (ra === undefined || rb === undefined) return [a, b];
  return compareDates(ra.data, rb.data) <= 0 ? [a, b] : [b, a];
}

export interface OrderAttempt {
  estado: TaskState;
  certo: boolean;
  /** Explicação curta, com os dois registros e as datas, o mais antigo primeiro. */
  explicacao: string;
}

/**
 * Responder a tarefa de ordem com `primeiro` antes de `segundo`. Com a ordem
 * errada, a explicação diz as datas e qual veio antes, e o estado continua
 * aberto para outra tentativa.
 */
export function submitOrder(
  tarefa: Extract<TaskSpec, { tipo: "ordem" }>,
  estado: TaskState,
  resposta: readonly [string, string],
  registros: Record<string, GameRecord>,
): OrderAttempt {
  const [antes, depois] = correctOrder(tarefa, registros);
  const certo = resposta[0] === antes && resposta[1] === depois;
  const ra = registros[antes];
  const rb = registros[depois];
  // Os títulos do atlas são orações: a data vai entre parênteses, e não em uma frase montada com eles.
  const datas = ra && rb ? `Datas dos registros: ${ra.titulo} (${formatDate(ra.data)}); ${rb.titulo} (${formatDate(rb.data)}).` : "";
  return {
    estado: { ...estado, tentativas: estado.tentativas + 1, ordemConfirmada: certo || estado.ordemConfirmada },
    certo,
    explicacao: certo
      ? `Ordem certa. ${datas}`
      : `Ainda não. ${datas} A data mais antiga vem primeiro. Tente de novo: não há penalidade.`,
  };
}
