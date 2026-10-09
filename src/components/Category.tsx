// Identificação visual das categorias. Cada categoria tem uma forma e uma cor,
// e o nome por extenso aparece sempre que há espaço: ninguém depende só da cor
// para saber de que categoria é um acontecimento (docs/DESIGN-SYSTEM.md).

import { CATEGORY_LABELS, type Categoria } from "@/lib/domain/categories";

type Shape = "circulo" | "quadrado" | "losango" | "triangulo" | "cruz";

export const CATEGORY_VISUAL: Record<Categoria, { forma: Shape; cor: string }> = {
  "mandatos-e-funcoes": { forma: "quadrado", cor: "text-cat-mandatos" },
  eleicoes: { forma: "circulo", cor: "text-cat-eleicoes" },
  "partidos-e-aliancas": { forma: "losango", cor: "text-cat-partidos" },
  "atuacao-institucional": { forma: "triangulo", cor: "text-cat-atuacao" },
  "marcos-historicos": { forma: "cruz", cor: "text-cat-marcos" },
};

const SHAPES: Record<Shape, React.ReactNode> = {
  circulo: <circle cx="6" cy="6" r="5" />,
  quadrado: <rect x="1.25" y="1.25" width="9.5" height="9.5" />,
  losango: <path d="M6 .4 11.6 6 6 11.6.4 6Z" />,
  triangulo: <path d="M6 .9 11.6 11H.4Z" />,
  cruz: <path d="M4.2.6h3.6v3.6h3.6v3.6H7.8v3.6H4.2V7.8H.6V4.2h3.6Z" />,
};

interface CategoryMarkProps {
  categoria: Categoria;
  /** Lado do desenho, em pixels. */
  size?: number;
  className?: string;
}

/** Só a forma. Decorativa: quem a usa informa a categoria em texto. */
export function CategoryMark({ categoria, size = 12, className = "" }: CategoryMarkProps) {
  const { forma, cor } = CATEGORY_VISUAL[categoria];
  return (
    <svg
      viewBox="0 0 12 12"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={`shrink-0 fill-current ${cor} ${className}`}
    >
      {SHAPES[forma]}
    </svg>
  );
}

/** Forma e nome da categoria, lado a lado. */
export function CategoryLabel({ categoria, className = "" }: { categoria: Categoria; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <CategoryMark categoria={categoria} size={10} />
      {CATEGORY_LABELS[categoria]}
    </span>
  );
}
