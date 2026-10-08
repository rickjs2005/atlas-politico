"use client";

// Lista cronológica de acontecimentos. É o caminho principal de leitura e de
// teclado: tudo o que o mapa permite selecionar também se seleciona aqui.

import { CATEGORY_LABELS } from "@/lib/domain/categories";
import { formatDate } from "@/lib/domain/dates";
import type { Acontecimento } from "@/lib/domain/types";

interface EventListProps {
  items: Acontecimento[];
  selectedSlug: string | null;
  /** Recebe `null` quando o item selecionado é acionado de novo. */
  onSelect: (slug: string | null) => void;
}

const SEM_PONTO: Record<Exclude<Acontecimento["localizacao"]["tipo"], "lugares">, string> = {
  nacional: "abrangência nacional",
  desconhecida: "lugar não documentado",
};

export function EventList({ items, selectedSlug, onSelect }: EventListProps) {
  if (items.length === 0) {
    return <p className="text-sm text-ink-soft">Nenhum acontecimento neste recorte.</p>;
  }

  return (
    <ol className="space-y-2">
      {items.map((item) => {
        const selecionado = item.slug === selectedSlug;
        const { localizacao } = item;

        return (
          <li key={item.id}>
            <button
              type="button"
              aria-pressed={selecionado}
              onClick={() => onSelect(selecionado ? null : item.slug)}
              className="w-full rounded-md border border-line bg-surface px-3 py-2 text-left hover:border-accent aria-pressed:border-mark aria-pressed:bg-mark-soft"
            >
              <span className="block text-sm text-ink-soft">{formatDate(item.data)}</span>
              <span className="block font-medium">{item.titulo}</span>
              <span className="block text-sm text-ink-soft">
                {CATEGORY_LABELS[item.categoria]}
                {localizacao.tipo !== "lugares" && ` · sem ponto no mapa (${SEM_PONTO[localizacao.tipo]})`}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
