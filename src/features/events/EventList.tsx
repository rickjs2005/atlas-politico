"use client";

// Lista cronológica de acontecimentos. É o caminho principal de leitura e de
// teclado: tudo o que o mapa e a linha do tempo permitem selecionar também se
// seleciona aqui, e ela continua funcionando quando o mapa falha.
//
// A lista diz o que a ordem sozinha não diz: a data parcial vem com o aviso do
// que falta, o registro cuja posição as datas não decidem diz isso, e os
// períodos sem registro aparecem no lugar deles, como lacunas do conjunto.

import { CategoryLabel } from "@/components/Category";
import { DateMark } from "@/components/DateMark";
import type { YearSpan } from "@/lib/data/coverage";
import { formatYearRange, yearOf } from "@/lib/domain/dates";
import type { Acontecimento, Pessoa } from "@/lib/domain/types";

import { buildChronology } from "./chronology";

interface EventListProps {
  items: Acontecimento[];
  selectedSlug: string | null;
  /** Recebe `null` quando o item selecionado é acionado de novo. */
  onSelect: (slug: string | null) => void;
  /** Com mais de uma trajetória na lista, cada item diz de quem é. */
  people?: readonly Pessoa[];
  /** Períodos sem registro no conjunto, já recortados para o que a lista mostra. */
  gaps?: readonly YearSpan[];
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

export function EventList({
  items,
  selectedSlug,
  onSelect,
  people,
  gaps = [],
  emptyMessage,
}: EventListProps) {
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
      {buildChronology(items, gaps).map((linha) => {
        if (linha.tipo === "lacuna") {
          const anos = formatYearRange(linha.de, linha.ate);
          return (
            // Lacuna do conjunto: hachura e texto, como no resto do atlas.
            <li
              key={`lacuna-${linha.de}`}
              data-lacuna
              className="grid grid-cols-[4.25rem_minmax(0,1fr)] items-baseline gap-x-3 border-l-[3px] border-transparent bg-sunken/60 px-3 py-2 text-xs text-ink-soft [background-image:repeating-linear-gradient(135deg,transparent_0_5px,var(--atlas-line)_5px_6px)]"
            >
              <span className="numerals font-medium" aria-hidden="true">
                {anos}
              </span>
              <span>
                <span className="sr-only">{`De ${linha.de} a ${linha.ate}: `}</span>
                <span className="bg-paper/80 box-decoration-clone px-1 italic">
                  sem registros do atlas nesta edição
                </span>
              </span>
            </li>
          );
        }

        const { item, ordemEmAberto } = linha;
        const selecionado = item.slug === selectedSlug;
        const semPonto = noPointNote(item);
        const nomes = people ? item.pessoaIds.map(nameOf).filter(Boolean).join(", ") : "";

        return (
          <li key={item.id} data-acontecimento>
            <button
              type="button"
              id={eventItemId(item.slug)}
              aria-pressed={selecionado}
              onClick={() => onSelect(selecionado ? null : item.slug)}
              className="group grid w-full grid-cols-[4.25rem_minmax(0,1fr)] gap-x-3 border-l-[3px] border-transparent px-3 py-3 text-left transition-colors duration-[var(--atlas-fast)] hover:bg-raised aria-pressed:border-accent aria-pressed:bg-accent-soft"
            >
              <DateMark data={item.data} showPrecision className="pt-0.5" />
              <span className="min-w-0">
                <span className="block font-serif text-[1.0625rem] font-medium leading-snug">
                  {item.titulo}
                </span>
                <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-ink-soft">
                  <CategoryLabel categoria={item.categoria} />
                  {nomes !== "" && <span>· {nomes}</span>}
                </span>
                {ordemEmAberto && (
                  <span className="mt-0.5 block text-xs italic text-ink-soft">
                    ordem dentro de {yearOf(item.data)} não documentada
                  </span>
                )}
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
