"use client";

// Escolha de período direto no eixo. Clicar em um ano escolhe aquele ano;
// arrastar escolhe o intervalo. Enquanto o ponteiro se move, só o desenho
// acompanha (`onPreview`): o recorte de verdade muda uma vez, ao soltar
// (`onCommit`). É assim que o arraste não refaz a lista a cada pixel nem enche
// o histórico de entradas.
//
// É um atalho para ponteiro. O caminho de teclado e de leitor de tela para o
// mesmo recorte são os dois campos de ano (`PeriodControl`), e por isso esta
// camada fica fora da árvore de acessibilidade.

import { useEffect, useRef, useState } from "react";

import { spanOfYears, yearsBetween, type TimeDomain } from "@/components/time/scale";
import { formatYearRange } from "@/lib/domain/dates";

interface PeriodBrushProps {
  domain: TimeDomain;
  /** Recorte em andamento, ou `null` quando o arraste termina ou é desfeito. */
  onPreview: (recorte: TimeDomain | null) => void;
  /** Recorte escolhido, ao soltar. */
  onCommit: (recorte: TimeDomain) => void;
}

/** Deslocamento, em pixels, a partir do qual um toque deixa de ser um toque. */
const TAP_SLOP = 8;

interface Gesture {
  posicao: number;
  x: number;
  id: number;
  /** O gesto arrasta. No toque, onde a faixa rola para o lado, só o toque parado escolhe. */
  arrasta: boolean;
}

export function PeriodBrush({ domain, onPreview, onCommit }: PeriodBrushProps) {
  const gesture = useRef<Gesture | null>(null);
  const [marca, setMarca] = useState<{ recorte: TimeDomain; ativo: boolean } | null>(null);
  const arrastando = marca?.ativo === true;

  const cancel = () => {
    gesture.current = null;
    setMarca(null);
    onPreview(null);
  };

  // Esc desfaz um arraste em andamento, sem mexer no recorte.
  useEffect(() => {
    if (!arrastando) return;
    const onKey = (evento: KeyboardEvent) => {
      if (evento.key !== "Escape") return;
      gesture.current = null;
      setMarca(null);
      onPreview(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [arrastando, onPreview]);

  const positionOf = (evento: React.PointerEvent<HTMLDivElement>) => {
    const caixa = evento.currentTarget.getBoundingClientRect();
    return caixa.width === 0 ? 0 : (evento.clientX - caixa.left) / caixa.width;
  };

  const show = (recorte: TimeDomain, ativo: boolean) => {
    // Só redesenha quando o ano sob o ponteiro muda.
    setMarca((anterior) =>
      anterior !== null &&
      anterior.ativo === ativo &&
      anterior.recorte.de === recorte.de &&
      anterior.recorte.ate === recorte.ate
        ? anterior
        : { recorte, ativo },
    );
    if (ativo) onPreview(recorte);
  };

  const onPointerDown = (evento: React.PointerEvent<HTMLDivElement>) => {
    if (evento.button !== 0) return;
    const posicao = positionOf(evento);
    // Quem diz se o toque pode arrastar é o CSS: `touch-action: none` onde a
    // faixa cabe inteira, `pan-x` onde ela rola.
    const arrasta =
      evento.pointerType !== "touch" || getComputedStyle(evento.currentTarget).touchAction === "none";
    gesture.current = { posicao, x: evento.clientX, id: evento.pointerId, arrasta };
    if (arrasta) {
      evento.currentTarget.setPointerCapture(evento.pointerId);
      show(yearsBetween(domain, posicao, posicao), true);
    }
  };

  const onPointerMove = (evento: React.PointerEvent<HTMLDivElement>) => {
    const posicao = positionOf(evento);
    const inicio = gesture.current;
    if (inicio === null) {
      // Sem botão apertado: mostra o ano sob o ponteiro.
      if (evento.pointerType === "mouse") show(yearsBetween(domain, posicao, posicao), false);
      return;
    }
    if (inicio.id !== evento.pointerId || !inicio.arrasta) return;
    show(yearsBetween(domain, inicio.posicao, posicao), true);
  };

  const onPointerUp = (evento: React.PointerEvent<HTMLDivElement>) => {
    const inicio = gesture.current;
    if (inicio === null || inicio.id !== evento.pointerId) return;
    const posicao = positionOf(evento);
    const parado = Math.abs(evento.clientX - inicio.x) <= TAP_SLOP;
    cancel();
    if (inicio.arrasta) onCommit(yearsBetween(domain, inicio.posicao, posicao));
    else if (parado) onCommit(yearsBetween(domain, posicao, posicao));
  };

  const faixa = marca === null ? null : spanOfYears(domain, marca.recorte.de, marca.recorte.ate);
  // O rótulo acompanha o trecho e não sai pelas pontas do eixo.
  const centro = faixa === null ? 0 : faixa.inicio + faixa.largura / 2;
  const alinhamento = centro < 0.08 ? "" : centro > 0.92 ? "-translate-x-full" : "-translate-x-1/2";

  return (
    <div
      aria-hidden="true"
      data-brush
      title="Clique em um ano ou arraste para escolher o período"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={cancel}
      onPointerLeave={() => {
        if (gesture.current === null) setMarca(null);
      }}
      className="absolute inset-x-0 bottom-0 z-10 h-7 cursor-col-resize touch-pan-x select-none md:touch-none"
    >
      {faixa !== null && marca !== null && (
        <>
          <span
            className={`pointer-events-none absolute inset-y-0 ${marca.ativo ? "bg-accent/25" : "bg-ink/10"}`}
            style={{ left: `${faixa.inicio * 100}%`, width: `${faixa.largura * 100}%` }}
          />
          {/* Ano sob o ponteiro, ou intervalo em andamento. */}
          <span
            data-brush-label
            className={`numerals pointer-events-none absolute top-2 whitespace-nowrap px-1 py-0.5 text-[0.6875rem] font-semibold leading-none text-paper ${
              marca.ativo ? "bg-accent" : "bg-ink"
            } ${alinhamento}`}
            style={{ left: `${centro * 100}%` }}
          >
            {formatYearRange(marca.recorte.de, marca.recorte.ate)}
          </span>
        </>
      )}
    </div>
  );
}
