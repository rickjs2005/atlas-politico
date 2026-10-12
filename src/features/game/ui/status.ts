// A situação de uma fase em palavras, igual na lista de fases e no resumo. O
// passaporte usa as mesmas palavras, fora um caso (`stampStatusText`).

import { phaseStatus, type PhaseStatus } from "@/lib/game/trail";
import type { PhaseProgress } from "@/lib/game/types";

const STATUS_LABEL: Record<PhaseStatus, string> = { nova: "ainda não aberta", vista: "explicação lida", concluida: "concluída" };

/** A situação de uma fase em palavras: a marca de um formato anterior entra enquanto a fase nova não foi concluída. */
export function statusText(estado: PhaseProgress | undefined): string {
  const status = phaseStatus(estado);
  if (status !== "concluida" && estado?.anterior === true) return "período visto na versão anterior";
  if (status !== "concluida" && estado?.reaberta === true) return "resposta reaberta por correção";
  return STATUS_LABEL[status];
}

/**
 * A situação de uma fase sem carimbo, na caderneta. É a mesma da lista de
 * fases, fora um caso: a fase aberta e não concluída não aparece como
 * "explicação lida", porque ali "Ver a explicação e continuar" é o nome de um
 * dos caminhos para o carimbo, e a pessoa leria que já o cumpriu.
 */
export function stampStatusText(estado: PhaseProgress | undefined): string {
  const texto = statusText(estado);
  return texto === STATUS_LABEL.vista ? "aberta, ainda não concluída" : texto;
}
