// O que toda janela da praça recebe: o conteúdo, o progresso e como mudá-lo.

import type { ConteudoDaPraca, ProgressoDaPraca } from "@/lib/praca/tipos";

export type AtualizarProgresso = (atualizar: (atual: ProgressoDaPraca) => ProgressoDaPraca) => void;

export interface JanelaDaPraca {
  conteudo: ConteudoDaPraca;
  progresso: ProgressoDaPraca;
  onProgresso: AtualizarProgresso;
  onFechar: () => void;
}

export const BOTAO_PRINCIPAL = "inline-flex min-h-11 items-center justify-center rounded-md bg-ink px-5 py-2.5 font-semibold text-paper disabled:bg-ink-faint";
export const BOTAO_SECUNDARIO = "inline-flex min-h-11 items-center justify-center rounded-md border border-line-strong px-4 py-2 text-sm font-medium";
export const ROTULO = "text-xs font-semibold tracking-wide text-ink-soft uppercase";
export const ABA = (ativa: boolean) => `rounded-md border px-3 py-1.5 text-sm font-medium ${ativa ? "border-ink bg-ink text-paper" : "border-line-strong"}`;
