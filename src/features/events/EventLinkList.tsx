// Lista de acontecimentos em que cada item leva à página de leitura. Sem
// estado: serve a páginas geradas no build, como a comparação.

import Link from "next/link";

import { CategoryLabel } from "@/components/Category";
import { DateMark } from "@/components/DateMark";
import type { Acontecimento } from "@/lib/domain/types";

interface EventLinkListProps {
  items: readonly Acontecimento[];
  /** `id` dos acontecimentos ligados a mais de uma pessoa da tela. */
  shared?: readonly string[];
  emptyMessage?: React.ReactNode;
}

export function EventLinkList({ items, shared = [], emptyMessage }: EventLinkListProps) {
  if (items.length === 0) {
    return (
      <div className="border-y border-line py-4 text-sm text-ink-soft">
        {emptyMessage ?? <p>Nenhum registro do atlas neste recorte.</p>}
      </div>
    );
  }

  return (
    <ol className="divide-y divide-line border-y border-line">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={`/acontecimentos/${item.slug}`}
            className="group grid grid-cols-[4.25rem_minmax(0,1fr)] gap-x-3 px-1 py-3 no-underline hover:bg-raised"
          >
            <DateMark data={item.data} className="pt-0.5" />
            <span className="min-w-0">
              <span className="block font-serif text-[1.0625rem] font-medium leading-snug underline decoration-transparent underline-offset-[0.2em] group-hover:decoration-ink">
                {item.titulo}
              </span>
              <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-ink-soft">
                <CategoryLabel categoria={item.categoria} />
                {shared.includes(item.id) && <span>· nas duas trajetórias</span>}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
