"use client";

// Filtro de categorias: um botão de alternância por categoria, com a forma, o
// nome e a quantidade de registros do atlas naquela categoria. Nenhuma
// categoria marcada significa todas.

import { useId } from "react";

import { CategoryMark } from "@/components/Category";
import { CATEGORIAS, CATEGORY_LABELS, type Categoria } from "@/lib/domain/categories";

interface CategoryFilterProps {
  /** Categorias marcadas. Vazio significa todas. */
  selected: readonly Categoria[];
  /** Quantos acontecimentos da trajetória há em cada categoria, no período atual. */
  counts: Record<Categoria, number>;
  onToggle: (categoria: Categoria) => void;
  onClear: () => void;
  className?: string;
}

const reset = "font-medium text-ink-soft underline decoration-line-strong hover:text-ink";

export function CategoryFilter({ selected, counts, onToggle, onClear, className = "" }: CategoryFilterProps) {
  const id = useId();
  const marcadas = selected.length > 0;

  return (
    <div role="group" aria-labelledby={`${id}-rotulo`} className={className}>
      <div className="mb-1.5 flex h-4 items-center gap-3">
        <span id={`${id}-rotulo`} className="eyebrow text-ink-soft">
          Categorias
        </span>
        {/* Em tela larga o botão fica na linha do rótulo, para a barra de
            filtros não mudar de altura; nas demais, depois das categorias,
            com área de toque inteira. */}
        {marcadas && (
          <button type="button" onClick={onClear} className={`-my-1 hidden py-1 text-xs xl:block ${reset}`}>
            Mostrar todas
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIAS.map((categoria) => (
          <button
            key={categoria}
            type="button"
            aria-pressed={selected.includes(categoria)}
            onClick={() => onToggle(categoria)}
            className="flex min-h-11 items-center gap-1.5 border border-line-strong bg-raised px-2.5 text-sm transition-colors duration-[var(--atlas-fast)] hover:border-ink aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-paper xl:min-h-9 xl:px-2 xl:text-[0.8125rem]"
          >
            <span className="grid size-4 place-items-center rounded-full bg-raised">
              <CategoryMark categoria={categoria} size={10} />
            </span>
            {CATEGORY_LABELS[categoria]}
            <span className="numerals text-xs opacity-70">{counts[categoria]}</span>
          </button>
        ))}
        {marcadas && (
          <button type="button" onClick={onClear} className={`min-h-11 px-2 text-sm xl:hidden ${reset}`}>
            Mostrar todas
          </button>
        )}
      </div>
    </div>
  );
}
