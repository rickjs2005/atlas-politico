"use client";

// Marcas dos acontecimentos sobre o eixo. Cada marca tem a forma da categoria.
// Quando a data é parcial, um traço sob a marca cobre o mês ou o ano inteiro:
// o desenho mostra o que se sabe, sem escolher um dia.
//
// Teclado: a faixa é uma barra de ferramentas com uma única parada de Tab.
// As setas, Home e End levam de uma marca a outra; Enter ou espaço seleciona.

import { useRef } from "react";

import { CATEGORY_VISUAL, CategoryMark } from "@/components/Category";
import { CATEGORY_LABELS } from "@/lib/domain/categories";
import { formatDate } from "@/lib/domain/dates";
import type { Acontecimento } from "@/lib/domain/types";

import { placeMarks, type TimeDomain } from "@/components/time/scale";

interface EventMarksProps {
  domain: TimeDomain;
  /** Todos os acontecimentos da trajetória: definem as fileiras, que não mudam com os filtros. */
  allEvents: readonly Acontecimento[];
  /** Os que estão no recorte atual: só estes aparecem. */
  visible: readonly Acontecimento[];
  selectedSlug: string | null;
  onSelect: (slug: string | null) => void;
  label: string;
  /** Espaço que cada marca precisa no eixo, de 0 a 1. */
  markWidth?: number;
  /** As marcas que voltam ao recorte entram com uma transição curta. */
  animate?: boolean;
}

export const MARK_ROW_HEIGHT = 24;
/** Espaço que uma marca ocupa no eixo, em pixels: o botão de 24 px e a folga. */
export const MARK_SLOT_PX = 26;
/** Fração do eixo usada quando ninguém mediu a largura: a da faixa mínima, de 40rem. */
const DEFAULT_MARK_WIDTH = MARK_SLOT_PX / 616;

export function markRows(
  domain: TimeDomain,
  allEvents: readonly Acontecimento[],
  markWidth = DEFAULT_MARK_WIDTH,
) {
  return placeMarks(domain, allEvents, markWidth);
}

export function EventMarks({
  domain,
  allEvents,
  visible,
  selectedSlug,
  onSelect,
  label,
  markWidth = DEFAULT_MARK_WIDTH,
  animate = false,
}: EventMarksProps) {
  const container = useRef<HTMLDivElement>(null);
  const { marcas, fileiras } = markRows(domain, allEvents, markWidth);
  const visiveis = new Set(visible.map((item) => item.id));
  const exibidas = marcas.filter(({ item }) => visiveis.has(item.id));
  // Com seleção, o Tab entra por ela; sem seleção, pela primeira marca.
  const entrada = exibidas.find(({ item }) => item.slug === selectedSlug) ?? exibidas[0];

  const moveFocus = (evento: React.KeyboardEvent, atual: number) => {
    const destino =
      evento.key === "ArrowRight"
        ? atual + 1
        : evento.key === "ArrowLeft"
          ? atual - 1
          : evento.key === "Home"
            ? 0
            : evento.key === "End"
              ? exibidas.length - 1
              : null;
    if (destino === null) return;
    evento.preventDefault();
    const botoes = container.current?.querySelectorAll<HTMLButtonElement>("button[data-mark]");
    botoes?.[Math.min(exibidas.length - 1, Math.max(0, destino))]?.focus();
  };

  const altura = Math.max(1, fileiras) * MARK_ROW_HEIGHT;

  return (
    <div
      ref={container}
      role="toolbar"
      aria-label={label}
      aria-orientation="horizontal"
      // Acima da hachura do período, que cobre só o eixo e o fundo.
      className="relative z-[2]"
      style={{ height: altura }}
    >
      {exibidas.map(({ item, span, centro, fileira }, indice) => {
        const selecionado = item.slug === selectedSlug;
        const base = altura - (fileira + 1) * MARK_ROW_HEIGHT;

        return (
          <div key={item.id}>
            {item.data.precisao !== "dia" && (
              // Traço da data parcial: do primeiro ao último dia que ela pode representar.
              <span
                aria-hidden="true"
                className={`absolute h-[3px] bg-current opacity-45 ${CATEGORY_VISUAL[item.categoria].cor}`}
                style={{
                  left: `${span.inicio * 100}%`,
                  width: `${span.largura * 100}%`,
                  top: base + MARK_ROW_HEIGHT - 3,
                }}
              />
            )}
            {selecionado && (
              <span
                aria-hidden="true"
                className="absolute w-px bg-accent"
                style={{ left: `${centro * 100}%`, top: base + MARK_ROW_HEIGHT - 2, bottom: 0 }}
              />
            )}
            <button
              type="button"
              data-mark
              data-slug={item.slug}
              aria-pressed={selecionado}
              aria-label={`${formatDate(item.data)}: ${item.titulo} (${CATEGORY_LABELS[item.categoria]})`}
              title={`${formatDate(item.data)} · ${item.titulo}`}
              tabIndex={entrada?.item.id === item.id ? 0 : -1}
              onClick={() => onSelect(selecionado ? null : item.slug)}
              onKeyDown={(evento) => moveFocus(evento, indice)}
              className={`group absolute grid size-6 -translate-x-1/2 place-items-center rounded-full outline-offset-1 transition-[transform,box-shadow,background-color] duration-[var(--atlas-fast)] hover:scale-125 aria-pressed:z-10 aria-pressed:scale-125 aria-pressed:bg-raised aria-pressed:shadow-[0_0_0_2px_var(--atlas-accent)] ${animate ? "animate-fade" : ""}`}
              style={{ left: `${centro * 100}%`, top: base }}
            >
              <CategoryMark categoria={item.categoria} size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
