"use client";

// Linha do tempo da exploração: marcas dos acontecimentos, eixo de anos e, em
// telas com espaço, as faixas de cargos e de partidos sobre o mesmo eixo.
//
// Em telas estreitas a faixa tem largura mínima e rola na horizontal, para as
// marcas não ficarem coladas. Ao selecionar um acontecimento em outro lugar, a
// marca dele é trazida para a parte visível.
//
// O eixo não muda com os filtros: o que fica fora do período é hachurado. O
// período pode ser escolhido no próprio eixo, com clique ou arraste; enquanto
// o ponteiro se move, só a hachura acompanha.

import { useEffect, useRef, useState } from "react";

import type { Acontecimento } from "@/lib/domain/types";

import { EventMarks, MARK_SLOT_PX } from "./EventMarks";
import { PeriodBrush } from "./PeriodBrush";
import { PeriodLane, type LaneItem } from "@/components/time/PeriodLane";
import { PeriodShade } from "@/components/time/PeriodShade";
import { TimeAxis } from "@/components/time/TimeAxis";
import { spanOfYears, type TimeDomain } from "@/components/time/scale";

interface TimelineProps {
  domain: TimeDomain;
  allEvents: readonly Acontecimento[];
  visible: readonly Acontecimento[];
  selectedSlug: string | null;
  onSelect: (slug: string | null) => void;
  periodo: { de: number | null; ate: number | null };
  /** Com esta função, o eixo aceita clique e arraste para escolher o período. */
  onPeriodChange?: (de: number, ate: number) => void;
  /** Faixas de períodos sob o eixo. Só aparecem em telas médias e largas. */
  lanes?: readonly { rotulo: string; itens: readonly LaneItem[] }[];
  dataDeCorte: string | null;
  label: string;
}

export function Timeline({
  domain,
  allEvents,
  visible,
  selectedSlug,
  onSelect,
  periodo,
  onPeriodChange,
  lanes = [],
  dataDeCorte,
  label,
}: TimelineProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const eixo = useRef<HTMLDivElement>(null);
  // Largura do eixo, em pixels. Até ser medida, vale a da faixa mínima.
  const [largura, setLargura] = useState<number | null>(null);
  const [previa, setPrevia] = useState<TimeDomain | null>(null);

  useEffect(() => {
    const alvo = eixo.current;
    if (!alvo) return;
    const observer = new ResizeObserver(([entrada]) => {
      if (entrada && entrada.contentRect.width > 0) setLargura(Math.round(entrada.contentRect.width));
    });
    observer.observe(alvo);
    return () => observer.disconnect();
  }, []);

  // Com um período escolhido, a faixa que rola mostra o trecho em claro. Sem
  // isso, quem chega por um endereço com período veria só a hachura.
  useEffect(() => {
    const faixa = scroller.current;
    if (!faixa || faixa.scrollWidth <= faixa.clientWidth) return;
    if (periodo.de === null && periodo.ate === null) return;
    const trecho = spanOfYears(domain, periodo.de ?? domain.de, periodo.ate ?? domain.ate);
    const suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    faixa.scrollTo({
      left: (trecho.inicio + trecho.largura / 2) * faixa.scrollWidth - faixa.clientWidth / 2,
      behavior: suave ? "smooth" : "auto",
    });
  }, [periodo.de, periodo.ate, domain]);

  // A marca selecionada tem prioridade: este efeito roda depois do anterior.
  useEffect(() => {
    if (selectedSlug === null) return;
    const marca = scroller.current?.querySelector<HTMLElement>(`[data-slug="${selectedSlug}"]`);
    if (!marca || !scroller.current) return;
    // Só a faixa rola: a página fica onde está.
    const faixa = scroller.current;
    if (faixa.scrollWidth <= faixa.clientWidth) return;
    const alvo =
      marca.getBoundingClientRect().left -
      faixa.getBoundingClientRect().left +
      faixa.scrollLeft -
      faixa.clientWidth / 2;
    const suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    faixa.scrollTo({ left: alvo, behavior: suave ? "smooth" : "auto" });
  }, [selectedSlug]);

  // Cada marca reserva no eixo o espaço do próprio botão: marcas mais
  // próximas do que isso sobem de fileira, e nenhuma cobre a outra.
  const markWidth = MARK_SLOT_PX / (largura ?? 616);

  return (
    <div ref={scroller} className="relative overflow-x-auto overscroll-x-contain">
      <div className="relative min-w-[40rem] px-3 pt-2 md:min-w-0">
        <div ref={eixo} className="relative">
          <EventMarks
            domain={domain}
            allEvents={allEvents}
            visible={visible}
            selectedSlug={selectedSlug}
            onSelect={onSelect}
            label={label}
            markWidth={markWidth}
          />
          <TimeAxis domain={domain} />
          <PeriodShade domain={domain} periodo={previa ?? periodo} />
          {onPeriodChange && (
            <PeriodBrush
              domain={domain}
              onPreview={setPrevia}
              onCommit={({ de, ate }) => onPeriodChange(de, ate)}
            />
          )}
        </div>

        {dataDeCorte !== null && lanes.length > 0 && (
          <dl className="mt-1 hidden space-y-1.5 border-t border-line pt-2 md:block">
            {lanes.map((lane) => (
              <div key={lane.rotulo} className="grid grid-cols-[1fr] gap-y-1">
                <dt className="eyebrow text-ink-faint">{lane.rotulo}</dt>
                <dd>
                  <PeriodLane
                    rotulo={lane.rotulo}
                    itens={lane.itens}
                    domain={domain}
                    dataDeCorte={dataDeCorte}
                  />
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}
