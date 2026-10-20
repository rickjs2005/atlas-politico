"use client";

// Os controles de toque do Vale a Faixa: o direcional à esquerda e as ações
// à direita (Interagir, Esquiva, Defender, Forte, Pular, Atacar), com ícones,
// áreas de toque confortáveis e resposta visual ao apertar e ao soltar,
// inclusive quando o dedo sai da área. Cada botão segura o ponteiro que o
// apertou (vários dedos ao mesmo tempo valem: andar e bater juntos). Nada
// depende de hover. O botão Interagir muda de ícone com o contexto (pegar,
// posicionar, largar, puxar a faixa) sem sair do lugar; a seta para cima
// acende quando dá para subir; Forte acende como Agarrar colado em quem
// defende, e Esquiva acende como Escapar enquanto se está agarrado.

import { useState } from "react";

import type { Dica, Entrada } from "@/lib/faixa/tipos";

interface ControlesProps {
  onEntrada(parte: Partial<Entrada>): void;
  dica: Dica;
  naEscada: boolean;
  /** No ar: pular apaga, e atacar vira a voadora. */
  noAr: boolean;
}

type Icone = "esquerda" | "direita" | "cima" | "baixo" | "atacar" | "voadora" | "forte" | "defender" | "esquiva" | "pular" | "pegar" | "posicionar" | "largar" | "faixa" | "nada";

const TRACO = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const CAMINHOS: Record<Icone, React.ReactNode> = {
  esquerda: <path d="M15 5 7 12l8 7z" fill="currentColor" />,
  direita: <path d="M9 5l8 7-8 7z" fill="currentColor" />,
  cima: <path d="M5 15l7-8 7 8z" fill="currentColor" />,
  baixo: <path d="M5 9l7 8 7-8z" fill="currentColor" />,
  // O punho.
  atacar: (
    <>
      <path d="M7 12V8.5a1.8 1.8 0 0 1 3.6 0V11M10.6 11V6.5a1.8 1.8 0 0 1 3.6 0V11M14.2 11V7.5a1.8 1.8 0 0 1 3.6 0v6a5.5 5.5 0 0 1-5.5 5.5h-1.2A5.3 5.3 0 0 1 5.8 15v-1.5a1.7 1.7 0 0 1 3.4 0" {...TRACO} />
      <path d="M2.5 6.5l2 1M2 10h2.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  // A perna esticada, no ar.
  voadora: (
    <>
      <path d="M4 17l6-5 5 1 6-4" {...TRACO} />
      <circle cx="5" cy="9" r="2" fill="currentColor" />
      <path d="M7 10l3 2M2 20h4" {...TRACO} />
    </>
  ),
  // O punho grande, com o impacto.
  forte: (
    <>
      <path d="M8 13V9a2 2 0 1 1 4 0v3M12 12V7a2 2 0 1 1 4 0v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-4.5-3l-1-2a1.6 1.6 0 0 1 3-1" {...TRACO} />
      <path d="M19 4l2-2M20 8h3M18 2V0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  // O escudo.
  defender: <path d="M12 3l7.5 3v5.2c0 5-3.6 8.6-7.5 9.8-3.9-1.2-7.5-4.8-7.5-9.8V6z" {...TRACO} />,
  // O rastro do passo lateral.
  esquiva: (
    <>
      <path d="M14 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM10 21l3-6-3-3 2-4 4 2 3 3M3 10h3M2 14h4M3 18h3" {...TRACO} />
    </>
  ),
  // A seta subindo com o rastro.
  pular: (
    <>
      <path d="M12 20V6M6 12l6-6 6 6" {...TRACO} />
      <path d="M5 21h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
    </>
  ),
  // A mão aberta.
  pegar: <path d="M8.5 12.5V5.5a1.5 1.5 0 0 1 3 0V11M11.5 11V4.5a1.5 1.5 0 0 1 3 0V11M14.5 11V6a1.5 1.5 0 0 1 3 0v7a6 6 0 0 1-6 6h-.6a6 6 0 0 1-5-2.7l-2.6-4a1.5 1.5 0 0 1 2.5-1.6l2.7 3.3" {...TRACO} />,
  // A escada em pé.
  posicionar: <path d="M8 3v18M16 3v18M8 7.5h8M8 12h8M8 16.5h8" {...TRACO} />,
  // A escada deitada, com a seta para baixo.
  largar: (
    <>
      <path d="M3 9h12M3 14h12M6 9v5M10 9v5" {...TRACO} />
      <path d="M19 6v10m-3-3 3 3 3-3" {...TRACO} />
    </>
  ),
  // A roseta da faixa.
  faixa: (
    <>
      <circle cx="12" cy="9" r="4.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M9 12.5 7 21l5-2.6L17 21l-2-8.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </>
  ),
  // A mão, apagada: nada ao alcance.
  nada: <path d="M8.5 12.5V5.5a1.5 1.5 0 0 1 3 0V11M11.5 11V4.5a1.5 1.5 0 0 1 3 0V11M14.5 11V6a1.5 1.5 0 0 1 3 0v7a6 6 0 0 1-6 6h-.6a6 6 0 0 1-5-2.7l-2.6-4a1.5 1.5 0 0 1 2.5-1.6l2.7 3.3" {...TRACO} opacity="0.55" />,
};

interface BotaoProps {
  comando: keyof Entrada;
  rotulo: string;
  icone: Icone;
  onEntrada: ControlesProps["onEntrada"];
  className: string;
  /** A ação está disponível agora: o botão acende. */
  destaque?: boolean;
  /** Nada a fazer com ele agora: o botão apaga, mas continua apertável. */
  apagado?: boolean;
  /** O rótulo curto sob o ícone. */
  texto?: string;
}

function Botao({ comando, rotulo, icone, onEntrada, className, destaque = false, apagado = false, texto }: BotaoProps) {
  const [pressionado, setPressionado] = useState(false);
  const soltar = (evento: React.PointerEvent<HTMLButtonElement>) => {
    if (evento.currentTarget.hasPointerCapture(evento.pointerId)) evento.currentTarget.releasePointerCapture(evento.pointerId);
    setPressionado(false);
    onEntrada({ [comando]: false });
  };
  const cor = destaque ? "border-action bg-action text-action-ink" : apagado ? "border-stage-line bg-stage/70 text-stage-ink-soft" : "border-stage-ink-soft/70 bg-stage/85 text-stage-ink";
  return (
    <button
      type="button"
      aria-label={rotulo}
      data-controle={comando}
      data-pressionado={pressionado ? "sim" : "nao"}
      className={`pointer-events-auto flex touch-none select-none flex-col items-center justify-center gap-0.5 rounded-full border-2 text-center font-sans font-bold uppercase leading-none tracking-wide shadow-[0_4px_0_rgb(0_0_0/0.45)] transition-[transform,background-color,box-shadow] duration-75 ${cor} ${
        pressionado ? "translate-y-1 scale-95 shadow-none brightness-125" : ""
      } ${className}`}
      onPointerDown={(evento) => {
        evento.preventDefault();
        evento.currentTarget.setPointerCapture(evento.pointerId);
        setPressionado(true);
        onEntrada({ [comando]: true });
      }}
      onPointerUp={soltar}
      onPointerCancel={soltar}
      onLostPointerCapture={() => {
        setPressionado(false);
        onEntrada({ [comando]: false });
      }}
      onContextMenu={(evento) => evento.preventDefault()}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[52%]">
        {CAMINHOS[icone]}
      </svg>
      {texto !== undefined && <span className="text-[0.48rem] janela-baixa:hidden">{texto}</span>}
    </button>
  );
}

/** O ícone e o rótulo do botão Interagir, pelo contexto. */
function interacao(dica: Dica): { icone: Icone; texto: string; rotulo: string; destaque: boolean } {
  switch (dica) {
    case "pegarEscada":
      return { icone: "pegar", texto: "Pegar", rotulo: "Pegar a escada", destaque: true };
    case "posicionarEscada":
      return { icone: "posicionar", texto: "Posicionar", rotulo: "Posicionar a escada", destaque: true };
    case "soltarEscada":
      return { icone: "largar", texto: "Largar", rotulo: "Largar a escada", destaque: false };
    case "puxarFaixa":
      return { icone: "faixa", texto: "Faixa", rotulo: "Segurar para puxar a faixa", destaque: true };
    case "subir":
    case "derrubarEscada":
    case "agarrar":
    case "escapar":
    case null:
      return { icone: "nada", texto: "Interagir", rotulo: "Interagir", destaque: false };
  }
}

export function Controles({ onEntrada, dica, naEscada, noAr }: ControlesProps) {
  const interagir = interacao(dica);
  const podeSubir = dica === "subir";
  const derrubar = dica === "derrubarEscada";
  const agarrar = dica === "agarrar";
  const escapar = dica === "escapar";
  const tamanho = "size-[3.6rem] janela-baixa:size-11";
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 px-[max(0.75rem,env(safe-area-inset-left))] pb-[max(0.75rem,env(safe-area-inset-bottom))] pr-[max(0.75rem,env(safe-area-inset-right))]"
      data-controles-de-toque
    >
      {/* O direcional: esquerda e direita andam; cima e baixo sobem e descem a escada. */}
      <div className="grid grid-cols-3 grid-rows-3 gap-1" aria-label="Direcional">
        <div />
        <Botao comando="cima" rotulo={podeSubir ? "Subir na escada" : "Subir"} icone="cima" onEntrada={onEntrada} className="size-14 janela-baixa:size-11" destaque={podeSubir} apagado={!naEscada && !podeSubir} />
        <div />
        <Botao comando="esquerda" rotulo="Andar para a esquerda" icone="esquerda" onEntrada={onEntrada} className="size-16 janela-baixa:size-12" />
        <div />
        <Botao comando="direita" rotulo="Andar para a direita" icone="direita" onEntrada={onEntrada} className="size-16 janela-baixa:size-12" />
        <div />
        <Botao comando="baixo" rotulo="Descer" icone="baixo" onEntrada={onEntrada} className="size-14 janela-baixa:size-11" apagado={!naEscada} />
        <div />
      </div>

      {/* As ações, em duas colunas: interagir e esquiva; defender e forte; pular e atacar, sob o polegar. */}
      <div className="grid grid-cols-2 gap-2" aria-label="Ações">
        <Botao comando="interagir" rotulo={interagir.rotulo} icone={interagir.icone} texto={interagir.texto} onEntrada={onEntrada} className={tamanho} destaque={interagir.destaque} apagado={!interagir.destaque && dica !== "soltarEscada"} />
        <Botao comando="esquiva" rotulo={escapar ? "Esquiva: escapar do agarrão" : "Esquiva"} icone="esquiva" texto={escapar ? "Escapar" : "Esquiva"} onEntrada={onEntrada} className={tamanho} destaque={escapar} />
        <Botao comando="defesa" rotulo="Defender (segurar)" icone="defender" texto="Defender" onEntrada={onEntrada} className={tamanho} />
        <Botao comando="forte" rotulo={agarrar ? "Golpe forte: agarrar" : "Golpe forte"} icone="forte" texto={agarrar ? "Agarrar" : "Forte"} onEntrada={onEntrada} className={tamanho} destaque={agarrar} />
        <Botao comando="pulo" rotulo="Pular" icone="pular" texto="Pular" onEntrada={onEntrada} className={tamanho} apagado={noAr} />
        <Botao
          comando="golpe"
          rotulo={noAr ? "Voadora" : derrubar ? "Atacar: derrubar a escada" : "Atacar"}
          icone={noAr ? "voadora" : "atacar"}
          texto={noAr ? "Voadora" : derrubar ? "Derrubar" : "Atacar"}
          onEntrada={onEntrada}
          className="size-[4.25rem] janela-baixa:size-12"
          destaque
        />
      </div>
    </div>
  );
}
