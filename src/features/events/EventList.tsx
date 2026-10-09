"use client";

// Lista cronológica de acontecimentos. É o caminho principal de leitura e de
// teclado: tudo o que o mapa e a linha do tempo permitem selecionar também se
// seleciona aqui, e ela continua funcionando quando o mapa falha.

import { CategoryLabel } from "@/components/Category";
import { DateMark } from "@/components/DateMark";
import type { Acontecimento, Pessoa } from "@/lib/domain/types";

interface EventListProps {
  items: Acontecimento[];
  selectedSlug: string | null;
  /** Recebe `null` quando o item selecionado é acionado de novo. */
  onSelect: (slug: string | null) => void;
  /** Com mais de uma trajetória na lista, cada item diz de quem é. */
  people?: readonly Pessoa[];
  /** O que dizer quando o recorte não tem registros. */
  emptyMessage?: React.ReactNode;
}

const SEM_PONTO: Record<Exclude<Acontecimento["localizacao"]["tipo"], "lugares">, string> = {
  nacional: "abrangência nacional",
  desconhecida: "lugar não documentado",
};

/** Aviso de acontecimento sem ponto no mapa, com o motivo. `null` quando há lugares. */
export function noPointNote({ localizacao }: Acontecimento): string | null {
  return localizacao.tipo === "lugares" ? null : `sem ponto no mapa (${SEM_PONTO[localizacao.tipo]})`;
}

/** Identificador do item na página: o painel devolve o foco a ele ao fechar. */
export function eventItemId(slug: string): string {
  return `item-${slug}`;
}

export function EventList({ items, selectedSlug, onSelect, people, emptyMessage }: EventListProps) {
  if (items.length === 0) {
    return (
      <div className="border-y border-line py-6 text-sm text-ink-soft">
        {emptyMessage ?? <p>Nenhum acontecimento neste recorte.</p>}
      </div>
    );
  }

  const nameOf = (id: string) => people?.find((pessoa) => pessoa.id === id)?.nome;

  return (
    <ol className="divide-y divide-line border-y border-line">
      {items.map((item) => {
        const selecionado = item.slug === selectedSlug;
        const semPonto = noPointNote(item);
        const nomes = people ? item.pessoaIds.map(nameOf).filter(Boolean).join(", ") : "";

        return (
          <li key={item.id}>
            <button
              type="button"
              id={eventItemId(item.slug)}
              aria-pressed={selecionado}
              onClick={() => onSelect(selecionado ? null : item.slug)}
              className="group grid w-full grid-cols-[4.25rem_minmax(0,1fr)] gap-x-3 border-l-[3px] border-transparent px-3 py-3 text-left transition-colors duration-[var(--atlas-fast)] hover:bg-raised aria-pressed:border-accent aria-pressed:bg-accent-soft"
            >
              <DateMark data={item.data} className="pt-0.5" />
              <span className="min-w-0">
                <span className="block font-serif text-[1.0625rem] font-medium leading-snug">
                  {item.titulo}
                </span>
                <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-ink-soft">
                  <CategoryLabel categoria={item.categoria} />
                  {nomes !== "" && <span>· {nomes}</span>}
                </span>
                {semPonto !== null && (
                  <span className="mt-0.5 block text-xs italic text-ink-soft">{semPonto}</span>
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
