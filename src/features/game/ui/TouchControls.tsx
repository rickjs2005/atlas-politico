"use client";

// Controles de toque: um direcional de oito direções à esquerda e o botão de
// ação à direita. O direcional é uma área só: o dedo escolhe a direção pela
// posição em relação ao centro, pode deslizar de uma direção para outra sem
// levantar, e soltar para o personagem. As diagonais existem porque os
// corredores do cenário correm na diagonal da tela.

import { useEffect, useRef, useState, type PointerEvent } from "react";

import { directionFor } from "@/lib/game/world/touch";

interface TouchControlsProps {
  onDirection(dx: number, dy: number): void;
  onInteract(): void;
  /** Rótulo da ação disponível; sem alvo ao alcance, o botão explica. */
  acao: string | null;
}

const CELLS = [
  { dx: -1, dy: -1, seta: "↖" },
  { dx: 0, dy: -1, seta: "↑" },
  { dx: 1, dy: -1, seta: "↗" },
  { dx: -1, dy: 0, seta: "←" },
  { dx: 0, dy: 0, seta: "" },
  { dx: 1, dy: 0, seta: "→" },
  { dx: -1, dy: 1, seta: "↙" },
  { dx: 0, dy: 1, seta: "↓" },
  { dx: 1, dy: 1, seta: "↘" },
] as const;

/** Depois de um toque que agiu, por quanto tempo um clique no botão é tido como o do mesmo toque. */
const SAME_TOUCH_MS = 400;

export function TouchControls({ onDirection, onInteract, acao }: TouchControlsProps) {
  const [ativa, setAtiva] = useState<[number, number]>([0, 0]);
  const ponteiro = useRef<number | null>(null);
  const botao = useRef<HTMLButtonElement>(null);
  const agiuPorToque = useRef(false);
  const agir = useRef(onInteract);
  useEffect(() => {
    agir.current = onInteract;
  });

  // O toque no botão de ação age ao encostar, para dar para andar com um dedo
  // e agir com outro. Agir muda a tela na hora (abre o registro), e o clique
  // que o navegador gera quando o dedo levanta cairia no botão que apareceu
  // embaixo do dedo, fechando o que acabou de abrir. Por isso a ação acontece
  // dentro do próprio `touchstart`, que é cancelado no mesmo passo: cancelado,
  // ele não gera clique. Tem de ser no `touchstart`, e não no `pointerdown`,
  // que vem antes: agir no `pointerdown` tira este botão do documento, e o
  // `touchstart` chegaria a um botão já sem ouvinte. O React registra
  // `touchstart` como passivo, e por isso o ouvinte é posto direto no elemento.
  useEffect(() => {
    const no = botao.current;
    if (no === null) return;
    const aoTocar = (evento: TouchEvent) => {
      evento.preventDefault();
      agiuPorToque.current = true;
      window.setTimeout(() => {
        agiuPorToque.current = false;
      }, SAME_TOUCH_MS);
      agir.current();
    };
    no.addEventListener("touchstart", aoTocar, { passive: false });
    return () => no.removeEventListener("touchstart", aoTocar);
  }, []);

  const apontar = (evento: PointerEvent<HTMLDivElement>) => {
    const caixa = evento.currentTarget.getBoundingClientRect();
    const meioLado = caixa.width / 2;
    const direcao = directionFor(evento.clientX - (caixa.left + meioLado), evento.clientY - (caixa.top + caixa.height / 2), meioLado);
    setAtiva(direcao);
    onDirection(direcao[0], direcao[1]);
  };
  const soltar = () => {
    ponteiro.current = null;
    setAtiva([0, 0]);
    onDirection(0, 0);
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between p-3" data-toque>
      <div
        role="group"
        aria-label="Direcional: toque e segure na direção em que o personagem deve andar"
        data-direcional
        className="pointer-events-auto grid h-36 w-36 touch-none select-none grid-cols-3 grid-rows-3 overflow-hidden rounded-full border border-ink bg-raised/90 janela-baixa:h-32 janela-baixa:w-32"
        onPointerDown={(evento) => {
          evento.preventDefault();
          ponteiro.current = evento.pointerId;
          try {
            evento.currentTarget.setPointerCapture(evento.pointerId);
          } catch {
            // Um evento sem ponteiro real (como o de um teste) não tem o que capturar.
          }
          apontar(evento);
        }}
        onPointerMove={(evento) => {
          if (ponteiro.current === evento.pointerId) apontar(evento);
        }}
        onPointerUp={soltar}
        onPointerCancel={soltar}
        onLostPointerCapture={soltar}
        onContextMenu={(evento) => evento.preventDefault()}
      >
        {CELLS.map((celula) => {
          const acesa = (celula.dx !== 0 || celula.dy !== 0) && ativa[0] === celula.dx && ativa[1] === celula.dy;
          return (
            <span
              key={`${celula.dx},${celula.dy}`}
              aria-hidden="true"
              data-direcao={`${celula.dx},${celula.dy}`}
              className={`pointer-events-none flex items-center justify-center text-lg font-semibold ${acesa ? "bg-accent-soft" : ""}`}
            >
              {celula.seta}
            </span>
          );
        })}
      </div>
      <button
        ref={botao}
        type="button"
        className="pointer-events-auto flex h-16 w-16 touch-none select-none items-center justify-center rounded-full border-2 border-ink bg-raised/95 text-center text-xs font-semibold leading-tight active:bg-accent-soft"
        // O mouse, a caneta, o teclado e os leitores de tela acionam o botão pelo
        // clique. O clique de um toque que já agiu, se ainda chegar aqui, não age de novo.
        onClick={() => {
          if (agiuPorToque.current) {
            agiuPorToque.current = false;
            return;
          }
          onInteract();
        }}
        onContextMenu={(evento) => evento.preventDefault()}
        data-acao-toque
        aria-label={acao ?? "Interagir: nada ao alcance"}
      >
        <span aria-hidden="true">{acao === null ? "Ação" : acao.split(" ")[0]}</span>
      </button>
    </div>
  );
}
