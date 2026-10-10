// O que ainda segura a saída de um capítulo, dito do mesmo jeito na cena, nas
// janelas e no painel. A regra é de `isExitOpen` (src/lib/game/mission.ts): a
// tarefa cumprida e todos os registros do capítulo recolhidos.

/** "Falta 1 registro" ou "Faltam 3 registros": os que o capítulo ainda tem por recolher. */
export function missingLabel(faltam: number): string {
  return faltam === 1 ? "Falta 1 registro" : `Faltam ${faltam} registros`;
}

/** A regra, por extenso, para o guia, a saída fechada e o painel. */
export const EXIT_RULE = "A saída abre com todos os registros do capítulo recolhidos e a tarefa cumprida.";

export interface ExitState {
  /** A tarefa do capítulo está cumprida. */
  tarefaConcluida: boolean;
  /** Registros do capítulo que ainda não foram recolhidos. */
  faltam: number;
  /** Registros do capítulo, ao todo. */
  total: number;
}

/** A saída está aberta: nada falta. */
export function exitOpen(estado: ExitState): boolean {
  return estado.tarefaConcluida && estado.faltam === 0;
}

/**
 * Uma frase sobre a saída, para depois de recolher um registro ou de cumprir
 * a tarefa: aberta, ou tudo o que falta para abrir.
 */
export function exitSentence(estado: ExitState): string {
  if (exitOpen(estado)) return "A saída do capítulo está aberta.";
  if (estado.faltam === 0) return "Falta a tarefa para a saída abrir.";
  const registros = missingLabel(estado.faltam);
  return estado.tarefaConcluida ? `${registros} para a saída abrir.` : `${registros} e a tarefa para a saída abrir.`;
}

/** "Registros recolhidos: 2 de 4." */
export function collectedSentence(estado: ExitState): string {
  return `Registros recolhidos: ${estado.total - estado.faltam} de ${estado.total}.`;
}
