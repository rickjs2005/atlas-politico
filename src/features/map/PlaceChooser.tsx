// Seletor de acontecimentos de um marcador. É como o mapa resolve pontos
// sobrepostos: em vez de abrir o de cima, mostra todos os que estão naquele
// lugar, ou nos lugares que o marcador reúne, com o que os distingue: data na
// precisão do registro, título, categoria e lugar.
//
// A mesma lista serve aos acontecimentos sem ponto, agrupados pelo motivo.
//
// Não é uma janela modal: o resto da página continua em uso. Esc e o botão de
// fechar a fecham, e quem a abriu recebe o foco de volta.

import { CategoryLabel } from "@/components/Category";
import { describePrecision, formatDate } from "@/lib/domain/dates";

import { countEvents, type PlacedEvent } from "./places";

export interface ChooserSection {
  id: string;
  titulo: string;
  /** O que se sabe do lugar: a precisão da coordenada, ou o motivo de não haver ponto. */
  nota: string;
  events: readonly Pick<PlacedEvent, "eventId" | "slug" | "titulo" | "categoria" | "data">[];
}

interface PlaceChooserProps {
  id: string;
  titulo: string;
  /** Quantos acontecimentos distintos a lista tem. */
  total: number;
  sections: readonly ChooserSection[];
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
  onClose: () => void;
  ref?: React.Ref<HTMLElement>;
}

export function PlaceChooser({
  id,
  titulo,
  total,
  sections,
  selectedSlug,
  onSelect,
  onClose,
  ref,
}: PlaceChooserProps) {
  return (
    <section
      ref={ref}
      id={id}
      aria-labelledby={`${id}-titulo`}
      tabIndex={-1}
      data-chooser
      onKeyDown={(evento) => {
        if (evento.key !== "Escape") return;
        evento.stopPropagation();
        onClose();
      }}
      // Em tela estreita, uma folha na parte de baixo do mapa; nas demais, um
      // quadro no canto, que cobre o botão que o abriu e para antes da
      // legenda. Nos dois casos a lista rola por dentro.
      className="absolute inset-x-2 bottom-2 z-30 flex max-h-[62%] animate-enter flex-col border border-ink bg-raised shadow-[0_8px_24px_-12px_rgb(0_0_0/0.4)] outline-none md:inset-x-auto md:bottom-auto md:left-2 md:top-2 md:max-h-[calc(100%_-_3rem)] md:w-80"
    >
      <header className="flex items-start justify-between gap-3 border-b border-line px-3 py-2.5">
        <div className="min-w-0">
          <p className="eyebrow text-ink-soft">No mapa</p>
          <h3 id={`${id}-titulo`} className="font-serif text-lg font-medium leading-tight">
            {titulo}
          </h3>
          <p className="numerals mt-0.5 text-xs text-ink-soft">{countEvents(total)}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="-mr-2 -mt-1.5 flex h-11 shrink-0 items-center gap-1.5 px-2 text-sm font-medium text-ink-soft hover:text-ink"
        >
          <span aria-hidden="true">×</span>
          Fechar<span className="sr-only"> a lista do mapa</span>
        </button>
      </header>

      <div className="relative min-h-0 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.id} role="group" aria-labelledby={`${id}-${section.id}`}>
            <p
              id={`${id}-${section.id}`}
              className="sticky top-0 z-10 border-b border-line bg-paper px-3 py-1.5 text-xs"
            >
              <span className="font-semibold">{section.titulo}</span>
              <span className="text-ink-soft"> · {section.nota}</span>
            </p>
            <ul className="divide-y divide-line border-b border-line">
              {section.events.map((evento) => {
                const selecionado = evento.slug === selectedSlug;
                const parcial = describePrecision(evento.data);
                return (
                  <li key={evento.eventId}>
                    <button
                      type="button"
                      aria-pressed={selecionado}
                      data-slug={evento.slug}
                      onClick={() => onSelect(evento.slug)}
                      className="block min-h-11 w-full border-l-[3px] border-transparent px-3 py-2 text-left transition-colors duration-[var(--atlas-fast)] hover:bg-paper aria-pressed:border-accent aria-pressed:bg-accent-soft"
                    >
                      <span className="numerals block text-xs font-semibold">
                        <time dateTime={evento.data.valor}>{formatDate(evento.data)}</time>
                        {parcial !== null && (
                          <span className="font-normal italic text-ink-soft"> · {parcial}</span>
                        )}
                      </span>
                      <span className="block font-serif text-[0.9375rem] font-medium leading-snug">
                        {evento.titulo}
                      </span>
                      <span className="mt-0.5 block text-xs text-ink-soft">
                        <CategoryLabel categoria={evento.categoria} />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
