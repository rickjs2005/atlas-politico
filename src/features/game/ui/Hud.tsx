"use client";

// O que fica sobre a cena: a sala e o capítulo, o objetivo e a contagem dos
// registros, os botões do painel e do Escrivão, a fala do Escrivão na entrada
// e na conclusão, a dica do que está ao alcance e o aviso de pausa. Tudo em
// DOM, fora do elemento que captura as teclas.
//
// Em janela baixa (celular deitado), o cabeçalho encolhe para a cena e os
// controles de toque caberem juntos.

import type { FalaDita } from "@/lib/game/escrivao";
import type { RoomSpec } from "@/lib/game/rooms";
import { EPOCA_LABEL, type ChapterSpec, type Interactable } from "@/lib/game/types";

import { quietButton, secondaryButton } from "./Dialog";
import { EscrivaoSays } from "./EscrivaoSays";
import { missingLabel } from "./saida";
import { countingSentence, hudPendingSentence } from "./tarefa";

export function reachLabel(alvo: Interactable | null, saidaAberta: boolean): string | null {
  if (alvo === null) return null;
  if (alvo.tipo === "registro") return "Recolher o registro";
  if (alvo.tipo === "guia") return "Falar com o Escrivão";
  return saidaAberta ? "Atravessar a saída" : "Saída fechada";
}

interface HudProps {
  capitulo: ChapterSpec;
  sala: RoomSpec;
  cenaNome: string;
  alcance: Interactable | null;
  /** A tarefa cumprida e todos os registros recolhidos: a passagem está aberta. */
  saidaAberta: boolean;
  tarefaConcluida: boolean;
  /** Os registros pedidos já estão recolhidos, e a resposta (ordem, documento, lugar ou decisão) ainda não foi dada. */
  respostaPendente: boolean;
  /** Registros do capítulo que ainda não foram recolhidos. */
  faltam: number;
  /** Registros do capítulo, ao todo: acontecimentos e decisões. */
  total: number;
  /** Este é o último capítulo da sala: a saída encerra, e não leva a outro. */
  ultimo: boolean;
  /** Tela de toque: a dica do alcance fica no botão de ação. */
  toque: boolean;
  pausadoPelaJanela: boolean;
  instrucoesId: string;
  /** A fala do Escrivão à vista sobre a cena (a entrada do capítulo, a conclusão), ou nada. */
  falas: { evento: string; falas: readonly FalaDita[] } | null;
  onDismissFalas(): void;
  onOpenPanel(): void;
  onOpenGuide(): void;
}

export function Hud({
  capitulo,
  sala,
  cenaNome,
  alcance,
  saidaAberta,
  tarefaConcluida,
  respostaPendente,
  faltam,
  total,
  ultimo,
  toque,
  pausadoPelaJanela,
  instrucoesId,
  falas,
  onDismissFalas,
  onOpenPanel,
  onOpenGuide,
}: HudProps) {
  const dica = reachLabel(alcance, saidaAberta);
  const recolhidos = total - faltam;
  // A linha do objetivo diz o próximo passo: a tarefa, a resposta a dar, os registros que faltam, a passagem.
  const objetivo = saidaAberta
    ? ultimo
      ? `Tarefa concluída e registros recolhidos. A saída abriu: atravesse a passagem para encerrar a sala ${sala.nome}.`
      : "Tarefa concluída e registros recolhidos. A saída abriu: atravesse a passagem para seguir."
    : tarefaConcluida
      ? `Tarefa concluída. ${missingLabel(faltam)} para a saída abrir.`
      : respostaPendente
        ? hudPendingSentence(capitulo.tarefa.tipo)
        : capitulo.objetivo;
  // Recolher todos cumpre a tarefa de registro, mas não as que pedem resposta: enquanto a resposta não é dada, a contagem diz as duas coisas.
  const contagem = saidaAberta ? "saída aberta" : faltam === 0 ? "falta a tarefa" : tarefaConcluida ? "a saída abre com todos" : countingSentence(capitulo.tarefa.tipo);
  const periodo = capitulo.periodo.de === capitulo.periodo.ate ? `${capitulo.periodo.de}` : `${capitulo.periodo.de}–${capitulo.periodo.ate}`;
  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-wrap items-start justify-between gap-2 p-3 md:p-4">
        <div className="flex max-w-[min(100%,28rem)] flex-col gap-2">
          <div
            className={`pointer-events-auto space-y-1 border bg-paper/90 px-3 py-2 backdrop-blur-[2px] janela-baixa:space-y-0 janela-baixa:py-1.5 ${
              saidaAberta ? "border-ink border-l-4 border-l-accent" : "border-ink/15"
            }`}
            data-objetivo-caixa={saidaAberta ? "saida-aberta" : tarefaConcluida ? "tarefa-concluida" : "pendente"}
          >
            {/* O nome do lugar é o do cenário, e não o do fato: o rótulo diz isso. A figura é a da época, estilizada. */}
            <p className="eyebrow text-ink-soft janela-baixa:hidden" data-cenario data-epoca={capitulo.epoca} data-sala={sala.id}>
              {sala.id === "historico" ? "" : `Sala ${sala.nome} · `}Capítulo {capitulo.numero} · {periodo} · cenário: {cenaNome} · {EPOCA_LABEL[capitulo.epoca]}
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
          {/* O Escrivão sobre a cena: ao entrar no capítulo e quando a saída abre. Fecha pelo botão; some sozinho com uma janela aberta. */}
          {falas !== null && falas.falas.length > 0 && (
            <div className="pointer-events-auto flex items-start gap-2 border border-ink/15 bg-paper/90 px-3 py-2 backdrop-blur-[2px] janela-baixa:hidden" data-escrivao-caixa={falas.evento}>
              <EscrivaoSays falas={falas.falas} evento={falas.evento} className="flex-1" />
              <button type="button" className={`${quietButton} shrink-0`} onClick={onDismissFalas} aria-label="Fechar a fala do Escrivão" data-fechar-escrivao>
                Fechar
              </button>
            </div>
          )}
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
