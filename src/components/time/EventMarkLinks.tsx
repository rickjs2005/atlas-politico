// As mesmas marcas de `EventMarks`, como links para a página de cada
// acontecimento. Sem estado: serve a páginas geradas no build, como a entrada
// e a comparação, em que a marca leva à leitura em vez de selecionar.

import Link from "next/link";

import { CATEGORY_VISUAL, CategoryMark } from "@/components/Category";
import { CATEGORY_LABELS } from "@/lib/domain/categories";
import { formatDate } from "@/lib/domain/dates";
import type { Acontecimento } from "@/lib/domain/types";

import { placeMarks, type TimeDomain } from "./scale";

interface EventMarkLinksProps {
  domain: TimeDomain;
  events: readonly Acontecimento[];
  /** Acontecimentos fora do recorte: aparecem apagados e não recebem link. */
  dimmed?: ReadonlySet<string>;
  label: string;
  markWidth?: number;
  /** Endereço de cada marca. O padrão é a página do acontecimento, sem contexto. */
  hrefOf?: (item: Acontecimento) => string;
}

const ROW_HEIGHT = 24;

const pageOf = (item: Acontecimento) => `/acontecimentos/${item.slug}`;

export function EventMarkLinks({
  domain,
  events,
  dimmed,
  label,
  markWidth = 0.022,
  hrefOf = pageOf,
}: EventMarkLinksProps) {
  const { marcas, fileiras } = placeMarks(domain, events, markWidth);
  const altura = Math.max(1, fileiras) * ROW_HEIGHT;

  return (
    <ul aria-label={label} className="relative" style={{ height: altura }}>
      {marcas.map(({ item, span, centro, fileira }) => {
        const base = altura - (fileira + 1) * ROW_HEIGHT;
        const apagado = dimmed?.has(item.id) ?? false;

        return (
          <li key={item.id} className={apagado ? "opacity-25" : ""}>
            {item.data.precisao !== "dia" && (
              <span
                aria-hidden="true"
                className={`absolute h-[3px] bg-current opacity-45 ${CATEGORY_VISUAL[item.categoria].cor}`}
                style={{
                  left: `${span.inicio * 100}%`,
                  width: `${span.largura * 100}%`,
                  top: base + ROW_HEIGHT - 3,
                }}
              />
            )}
            {apagado ? (
              <span
                aria-hidden="true"
                className="absolute grid size-6 -translate-x-1/2 place-items-center"
                style={{ left: `${centro * 100}%`, top: base }}
              >
                <CategoryMark categoria={item.categoria} size={12} />
              </span>
            ) : (
              <Link
                href={hrefOf(item)}
                // O endereço muda com o recorte: sem isso, cada mudança buscaria as páginas de novo.
                prefetch={false}
                aria-label={`${formatDate(item.data)}: ${item.titulo} (${CATEGORY_LABELS[item.categoria]})`}
                title={`${formatDate(item.data)} · ${item.titulo}`}
                className="absolute grid size-6 -translate-x-1/2 place-items-center rounded-full outline-offset-1 transition-transform duration-[var(--atlas-fast)] hover:scale-125"
                style={{ left: `${centro * 100}%`, top: base }}
              >
                <CategoryMark categoria={item.categoria} size={12} />
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
