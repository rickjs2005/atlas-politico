"use client";

// Os controles de toque do Vale a Faixa: movimento à esquerda, ações à
// direita, botões grandes sem sobreposição, respeitando as áreas seguras da
// tela. Cada botão segura o ponteiro que o apertou (vários dedos ao mesmo
// tempo valem) e solta ao cancelar. Nada depende de hover. O botão de
// interação muda de rótulo com o contexto: pegar, posicionar, subir, puxar.

import type { Dica, Entrada } from "@/lib/faixa/tipos";

import { ROTULO_DA_DICA } from "./desenho/hud";

interface ControlesProps {
  onEntrada(parte: Partial<Entrada>): void;
  dica: Dica;
  naEscada: boolean;
}

function Botao({ comando, rotulo, onEntrada, className, destaque = false, desativado = false }: { comando: keyof Entrada; rotulo: string; onEntrada: ControlesProps["onEntrada"]; className: string; destaque?: boolean; desativado?: boolean }) {
  const soltar = (evento: React.PointerEvent<HTMLButtonElement>) => {
    if (evento.currentTarget.hasPointerCapture(evento.pointerId)) evento.currentTarget.releasePointerCapture(evento.pointerId);
    onEntrada({ [comando]: false });
  };
  return (
    <button
      type="button"
      aria-label={rotulo}
      data-controle={comando}
      className={`pointer-events-auto flex touch-none select-none items-center justify-center rounded-full border-2 text-center font-sans font-bold uppercase leading-none tracking-wide shadow-[0_4px_0_rgb(0_0_0/0.45)] transition-[transform,background-color] duration-75 active:translate-y-0.5 active:shadow-none ${
        destaque ? "border-action bg-action text-action-ink" : desativado ? "border-stage-line bg-stage/70 text-stage-ink-soft" : "border-stage-ink-soft/70 bg-stage/85 text-stage-ink"
      } ${className}`}
      onPointerDown={(evento) => {
        evento.preventDefault();
        evento.currentTarget.setPointerCapture(evento.pointerId);
        onEntrada({ [comando]: true });
      }}
      onPointerUp={soltar}
      onPointerCancel={soltar}
      onLostPointerCapture={() => onEntrada({ [comando]: false })}
      onContextMenu={(evento) => evento.preventDefault()}
    >
      {rotulo}
    </button>
  );
}

export function Controles({ onEntrada, dica, naEscada }: ControlesProps) {
  const rotuloDaInteracao = dica === null ? "Interagir" : dica === "puxarFaixa" ? "Puxar a faixa" : dica === "foraDoAlcance" ? "Espere" : ROTULO_DA_DICA[dica];
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 px-[max(0.75rem,env(safe-area-inset-left))] pb-[max(0.75rem,env(safe-area-inset-bottom))] pr-[max(0.75rem,env(safe-area-inset-right))]"
      data-controles-de-toque
    >
      {/* Movimento: esquerda e direita; subir e descer só valem na escada. */}
      <div className="grid grid-cols-3 grid-rows-3 gap-1" aria-label="Movimento">
        <div />
        <Botao comando="cima" rotulo="▲" onEntrada={onEntrada} className="size-14 text-lg janela-baixa:size-11" desativado={!naEscada} />
        <div />
        <Botao comando="esquerda" rotulo="◀" onEntrada={onEntrada} className="size-16 text-xl janela-baixa:size-12" />
        <div />
        <Botao comando="direita" rotulo="▶" onEntrada={onEntrada} className="size-16 text-xl janela-baixa:size-12" />
        <div />
        <Botao comando="baixo" rotulo="▼" onEntrada={onEntrada} className="size-14 text-lg janela-baixa:size-11" desativado={!naEscada} />
        <div />
      </div>

      {/* Ações: a interação em cima, grande quando há o que fazer; golpe, defesa e empurrão embaixo. */}
      <div className="flex flex-col items-end gap-2" aria-label="Ações">
        <Botao comando="interagir" rotulo={rotuloDaInteracao} onEntrada={onEntrada} className="h-14 min-w-[9.5rem] max-w-[11rem] px-3 text-[0.72rem] normal-case janela-baixa:h-11 janela-baixa:min-w-[8rem]" destaque={dica !== null && dica !== "foraDoAlcance"} desativado={dica === null} />
        <div className="flex items-end gap-2">
          <Botao comando="empurrao" rotulo="Empurrar" onEntrada={onEntrada} className="size-16 text-[0.6rem] janela-baixa:size-12 janela-baixa:text-[0.5rem]" />
          <Botao comando="defesa" rotulo="Defender" onEntrada={onEntrada} className="size-16 text-[0.6rem] janela-baixa:size-12 janela-baixa:text-[0.5rem]" />
          <Botao comando="golpe" rotulo="Golpe" onEntrada={onEntrada} className="size-[4.75rem] text-[0.7rem] janela-baixa:size-14 janela-baixa:text-[0.55rem]" destaque />
        </div>
      </div>
    </div>
  );
}
