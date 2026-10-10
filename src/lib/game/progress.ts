// Progresso do jogador: um por personagem, com os capítulos em três estados
// (`bloqueado`, `disponivel`, `concluido`) e transições previsíveis.
//
//   início                todo capítulo bloqueado, menos o primeiro
//   concluir capítulo n   n vira `concluido`; n+1 vira `disponivel`
//   reiniciar             volta ao início
//
// Um capítulo só é concluído com a saída aberta: a tarefa cumprida e todos
// os registros do capítulo recolhidos (`isExitOpen`).
//
// O formato salvo tem versão. `parseProgress` aceita só o que está certo e
// devolve `null` para qualquer outra coisa: dado inválido vira começo, e não
// erro na tela.

import { hasRequired, isExitOpen } from "./mission";
import { PROGRESS_VERSION, type ChapterProgress, type ChapterSpec, type ChapterStatus, type PersonagemSlug, type PlayerProgress, type TaskState } from "./types";

const STATUSES: readonly ChapterStatus[] = ["bloqueado", "disponivel", "concluido"];

export function initialProgress(personagem: PersonagemSlug, capitulos: readonly ChapterSpec[]): PlayerProgress {
  const entradas: Record<string, ChapterProgress> = {};
  capitulos.forEach((capitulo, indice) => {
    entradas[capitulo.id] = {
      status: indice === 0 ? "disponivel" : "bloqueado",
      tarefa: { recolhidos: [], ordemConfirmada: false, tentativas: 0 },
    };
  });
  return { versao: PROGRESS_VERSION, personagem, capitulos: entradas };
}

export function chapterStatus(progresso: PlayerProgress, capituloId: string): ChapterStatus {
  return progresso.capitulos[capituloId]?.status ?? "bloqueado";
}

export function taskStateOf(progresso: PlayerProgress, capituloId: string): TaskState {
  return progresso.capitulos[capituloId]?.tarefa ?? { recolhidos: [], ordemConfirmada: false, tentativas: 0 };
}

/** Troca o estado da tarefa de um capítulo. Capítulo bloqueado não muda. */
export function withTaskState(progresso: PlayerProgress, capituloId: string, tarefa: TaskState): PlayerProgress {
  const atual = progresso.capitulos[capituloId];
  if (atual === undefined || atual.status === "bloqueado") return progresso;
  if (atual.tarefa === tarefa) return progresso;
  return { ...progresso, capitulos: { ...progresso.capitulos, [capituloId]: { ...atual, tarefa } } };
}

/**
 * Concluir um capítulo: só um capítulo disponível com a saída aberta, isto
 * é, com a tarefa cumprida e todos os registros recolhidos. O seguinte, se
 * houver, fica disponível. Repetir em capítulo concluído não muda nada.
 */
export function completeChapter(progresso: PlayerProgress, capitulos: readonly ChapterSpec[], capituloId: string): PlayerProgress {
  const indice = capitulos.findIndex((item) => item.id === capituloId);
  const capitulo = capitulos[indice];
  const atual = progresso.capitulos[capituloId];
  if (capitulo === undefined || atual === undefined) return progresso;
  if (atual.status !== "disponivel" || !isExitOpen(capitulo, atual.tarefa)) return progresso;

  const proximos: Record<string, ChapterProgress> = { ...progresso.capitulos, [capituloId]: { ...atual, status: "concluido" } };
  const seguinte = capitulos[indice + 1];
  if (seguinte !== undefined) {
    const entrada = proximos[seguinte.id];
    if (entrada !== undefined && entrada.status === "bloqueado") proximos[seguinte.id] = { ...entrada, status: "disponivel" };
  }
  return { ...progresso, capitulos: proximos };
}

/** O capítulo em que se continua: o primeiro disponível, ou o último se todos estão concluídos. */
export function currentChapter(progresso: PlayerProgress, capitulos: readonly ChapterSpec[]): ChapterSpec | null {
  const disponivel = capitulos.find((item) => chapterStatus(progresso, item.id) === "disponivel");
  if (disponivel !== undefined) return disponivel;
  const concluidos = capitulos.filter((item) => chapterStatus(progresso, item.id) === "concluido");
  return concluidos.at(-1) ?? capitulos[0] ?? null;
}

/** Todos os capítulos implementados foram concluídos? */
export function isTrajectoryComplete(progresso: PlayerProgress, capitulos: readonly ChapterSpec[]): boolean {
  return capitulos.length > 0 && capitulos.every((item) => chapterStatus(progresso, item.id) === "concluido");
}

export function countCompleted(progresso: PlayerProgress, capitulos: readonly ChapterSpec[]): number {
  return capitulos.filter((item) => chapterStatus(progresso, item.id) === "concluido").length;
}

// ---------------------------------------------------------------------------
// Formato salvo
// ---------------------------------------------------------------------------

function isRecord(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function parseTask(valor: unknown): TaskState | null {
  if (!isRecord(valor)) return null;
  const { recolhidos, ordemConfirmada, tentativas } = valor;
  if (!Array.isArray(recolhidos) || !recolhidos.every((item) => typeof item === "string")) return null;
  if (typeof ordemConfirmada !== "boolean") return null;
  if (typeof tentativas !== "number" || !Number.isInteger(tentativas) || tentativas < 0) return null;
  return { recolhidos: [...new Set(recolhidos as string[])], ordemConfirmada, tentativas };
}

/**
 * Lê um progresso salvo. Devolve `null` quando a versão, o personagem ou a
 * forma não conferem. Capítulos que a edição não tem mais são descartados;
 * capítulos novos entram bloqueados (ou disponíveis, se forem o primeiro
 * aberto), e a regra de progressão é reaplicada para não haver dois
 * capítulos disponíveis nem um disponível depois de um bloqueado.
 *
 * Um capítulo pode mudar entre uma edição e outra. Os registros que ele não
 * cita mais saem dos recolhidos, e uma ordem confirmada só vale se a tarefa
 * ainda for de ordem e os dois registros dela estiverem recolhidos.
 *
 * A regra de saída também vale para o que foi salvo: um capítulo marcado
 * como concluído sem todos os registros recolhidos (guardado quando a saída
 * abria só com a tarefa, ou antes de o capítulo ganhar um registro) volta a
 * disponível, com o que já foi recolhido, e os seguintes voltam a bloqueado.
 */
export function parseProgress(valor: unknown, personagem: PersonagemSlug, capitulos: readonly ChapterSpec[]): PlayerProgress | null {
  if (!isRecord(valor)) return null;
  if (valor.versao !== PROGRESS_VERSION || valor.personagem !== personagem) return null;
  if (!isRecord(valor.capitulos)) return null;

  const base = initialProgress(personagem, capitulos);
  const lidos: Record<string, ChapterProgress> = {};
  for (const capitulo of capitulos) {
    const entrada = valor.capitulos[capitulo.id];
    if (entrada === undefined) continue;
    if (!isRecord(entrada)) return null;
    const lida = parseTask(entrada.tarefa);
    if (lida === null || !STATUSES.includes(entrada.status as ChapterStatus)) return null;
    const recolhidos = lida.recolhidos.filter((id) => capitulo.eventIds.includes(id));
    const tarefa: TaskState = { ...lida, recolhidos };
    tarefa.ordemConfirmada = lida.ordemConfirmada && capitulo.tarefa.tipo === "ordem" && hasRequired(capitulo.tarefa, tarefa);
    lidos[capitulo.id] = { status: entrada.status as ChapterStatus, tarefa };
  }

  // Reaplica a progressão: concluídos em sequência a partir do primeiro; o
  // seguinte disponível; o resto bloqueado. O estado da tarefa é mantido.
  let aberto = false;
  const capitulosLidos: Record<string, ChapterProgress> = {};
  for (const capitulo of capitulos) {
    const lido = lidos[capitulo.id] ?? base.capitulos[capitulo.id]!;
    let status: ChapterStatus;
    if (!aberto && lido.status === "concluido" && isExitOpen(capitulo, lido.tarefa)) status = "concluido";
    else if (!aberto) {
      status = "disponivel";
      aberto = true;
    } else status = "bloqueado";
    capitulosLidos[capitulo.id] = { status, tarefa: status === "bloqueado" ? base.capitulos[capitulo.id]!.tarefa : lido.tarefa };
  }
  return { versao: PROGRESS_VERSION, personagem, capitulos: capitulosLidos };
}
