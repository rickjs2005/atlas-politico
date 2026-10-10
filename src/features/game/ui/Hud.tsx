"use client";

// O que fica sobre a cena: o capítulo, o objetivo e a contagem dos registros,
// os botões do painel e do guia, a dica do que está ao alcance e o aviso de
// pausa. Tudo em DOM, fora do elemento que captura as teclas.
//
// Em janela baixa (celular deitado), o cabeçalho encolhe para a cena e os
// controles de toque caberem juntos.

import type { ChapterSpec, Interactable } from "@/lib/game/types";

import { secondaryButton } from "./Dialog";
import { missingLabel } from "./saida";

export function reachLabel(alvo: Interactable | null, saidaAberta: boolean): string | null {
  if (alvo === null) return null;
  if (alvo.tipo === "registro") return "Recolher o registro";
  if (alvo.tipo === "guia") return "Falar com o Arquivista";
  return saidaAberta ? "Atravessar a saída" : "Saída fechada";
}

interface HudProps {
  capitulo: ChapterSpec;
  cenaNome: string;
  alcance: Interactable | null;
  /** A tarefa cumprida e todos os registros recolhidos: a passagem está aberta. */
  saidaAberta: boolean;
  tarefaConcluida: boolean;
  /** Tarefa de ordem: os dois registros pedidos já estão recolhidos, e a ordem ainda não foi confirmada. */
  ordemPendente: boolean;
  /** Registros do capítulo que ainda não foram recolhidos. */
  faltam: number;
  /** Este é o último capítulo desta etapa: a saída encerra, e não leva a outro. */
  ultimo: boolean;
  /** Tela de toque: a dica do alcance fica no botão de ação. */
  toque: boolean;
  pausadoPelaJanela: boolean;
  instrucoesId: string;
  onOpenPanel(): void;
  onOpenGuide(): void;
}

export function Hud({
  capitulo,
  cenaNome,
  alcance,
  saidaAberta,
  tarefaConcluida,
  ordemPendente,
  faltam,
  ultimo,
  toque,
  pausadoPelaJanela,
  instrucoesId,
  onOpenPanel,
  onOpenGuide,
}: HudProps) {
  const dica = reachLabel(alcance, saidaAberta);
  const total = capitulo.eventIds.length;
  const recolhidos = total - faltam;
  // A linha do objetivo diz o próximo passo: a tarefa, a ordem a responder, os registros que faltam, a passagem.
  const objetivo = saidaAberta
    ? ultimo
      ? "Tarefa concluída e registros recolhidos. A saída abriu: atravesse a passagem para encerrar esta etapa."
      : "Tarefa concluída e registros recolhidos. A saída abriu: atravesse a passagem para seguir."
    : tarefaConcluida
      ? `Tarefa concluída. ${missingLabel(faltam)} para a saída abrir.`
      : ordemPendente
        ? "Os dois registros da tarefa estão com você. Para colocá-los em ordem, abra Como jogar ou Capítulos e tarefas."
        : capitulo.objetivo;
  // Recolher todos cumpre a tarefa de registro, mas não a de ordem: enquanto a ordem não é confirmada, a contagem diz as duas coisas.
  const contagem = saidaAberta
    ? "saída aberta"
    : faltam === 0
      ? "falta a tarefa"
      : tarefaConcluida || capitulo.tarefa.tipo === "registro"
        ? "a saída abre com todos"
        : "a saída abre com todos e a ordem certa";
  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-wrap items-start justify-between gap-2 p-3 md:p-4">
        <div
          className={`pointer-events-auto max-w-[min(100%,28rem)] space-y-1 border bg-paper/90 px-3 py-2 backdrop-blur-[2px] janela-baixa:space-y-0 janela-baixa:py-1.5 ${
            saidaAberta ? "border-ink border-l-4 border-l-accent" : "border-ink/15"
          }`}
          data-objetivo-caixa={saidaAberta ? "saida-aberta" : tarefaConcluida ? "tarefa-concluida" : "pendente"}
        >
          {/* O nome do lugar é o do cenário, e não o do fato: o rótulo diz isso. */}
          <p className="eyebrow text-ink-soft janela-baixa:hidden" data-cenario>
            Capítulo {capitulo.numero} · {capitulo.periodo.de}–{capitulo.periodo.ate} · cenário: {cenaNome}
          </p>
          <p className="font-serif text-lg font-medium leading-tight janela-baixa:text-base">{capitulo.titulo}</p>
          <p className={`text-sm janela-baixa:text-xs ${saidaAberta ? "font-medium" : ""}`} data-objetivo role="status">
            {objetivo}
          </p>
          {/* A regra da saída fica sempre à vista: quantos registros já vieram e o que ainda segura a porta. */}
          <p className="numerals text-xs text-ink-soft" data-registros={`${recolhidos}/${total}`}>
            Registros: {recolhidos} de {total} · {contagem}
          </p>
        </div>
        <div className="pointer-events-auto flex gap-2">
          <button type="button" className={secondaryButton} onClick={onOpenGuide} data-abrir-guia>
            Como jogar
          </button>
          <button type="button" className={secondaryButton} onClick={onOpenPanel} data-abrir-painel>
            Capítulos e tarefas
          </button>
        </div>
      </div>

      <p id={instrucoesId} className="sr-only">
        Cena do jogo. Use as setas ou W, A, S e D para andar, e E, Enter ou espaço para interagir com o que está ao alcance.
        A saída abre com todos os registros do capítulo recolhidos e a tarefa cumprida. O botão Capítulos e tarefas faz o
        mesmo sem o cenário.
      </p>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end p-3 md:p-4">
        <p
          role="status"
          aria-live="polite"
          className={`pointer-events-auto border border-ink bg-raised px-3 py-1.5 text-sm font-medium ${dica === null ? "invisible" : ""} ${toque ? "sr-only" : ""}`}
          data-alcance={alcance?.tipo ?? ""}
          data-alcance-id={alcance?.id ?? ""}
        >
          {dica !== null && (
            <>
              <kbd className="numerals mr-1.5 border border-line-strong bg-paper px-1.5 py-0.5 text-xs">E</kbd>
              {dica}
            </>
          )}
        </p>
      </div>

      {pausadoPelaJanela && (
        <p
          role="status"
          className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 border border-ink bg-notice px-3 py-1.5 text-center text-sm font-medium"
          data-pausado-janela
        >
          Pausado: a janela perdeu o foco
        </p>
      )}
    </>
  );
}
