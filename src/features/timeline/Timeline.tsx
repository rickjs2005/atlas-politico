"use client";

// Linha do tempo da exploração: marcas dos acontecimentos, eixo de anos e, em
// telas com espaço, as faixas de cargos e de partidos sobre o mesmo eixo.
//
// Em telas estreitas a faixa tem largura mínima e rola na horizontal, para as
// marcas não ficarem coladas. Ao selecionar um acontecimento em outro lugar, a
// marca dele é trazida para a parte visível.

import { useEffect, useRef } from "react";

import type { Acontecimento } from "@/lib/domain/types";

import { EventMarks } from "./EventMarks";
import { PeriodLane, type LaneItem } from "@/components/time/PeriodLane";
import { PeriodShade } from "@/components/time/PeriodShade";
import { TimeAxis } from "@/components/time/TimeAxis";
import type { TimeDomain } from "@/components/time/scale";

interface TimelineProps {
  domain: TimeDomain;
  allEvents: readonly Acontecimento[];
  visible: readonly Acontecimento[];
  selectedSlug: string | null;
  onSelect: (slug: string | null) => void;
  periodo: { de: number | null; ate: number | null };
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
  lanes = [],
  dataDeCorte,
  label,
}: TimelineProps) {
  const scroller = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={scroller} className="relative overflow-x-auto overscroll-x-contain">
      <div className="relative min-w-[40rem] px-3 pt-2 md:min-w-0">
        <div className="relative">
          <EventMarks
            domain={domain}
            allEvents={allEvents}
            visible={visible}
            selectedSlug={selectedSlug}
            onSelect={onSelect}
            label={label}
          />
          <TimeAxis domain={domain} />
          <PeriodShade domain={domain} periodo={periodo} />
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
