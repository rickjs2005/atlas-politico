// Cartão de escolha de um perfil, na entrada. Os dois cartões são o mesmo
// componente: mesma moldura de retrato, mesma ordem de informações e o mesmo
// destino. O que muda é só o que vem dos dados.

import Link from "next/link";

import { Portrait } from "@/components/Portrait";
import type { YearSpan } from "@/lib/data/coverage";
import type { Imagem, Pessoa } from "@/lib/domain/types";

interface PersonCardProps {
  pessoa: Pessoa;
  retrato: Imagem | null;
  /** Anos que a edição cobre para a pessoa. */
  coberto: YearSpan | null;
  /** Quantos acontecimentos o atlas registra para a pessoa. */
  registros: number;
  priority?: boolean;
}

export function PersonCard({ pessoa, retrato, coberto, registros, priority = false }: PersonCardProps) {
  return (
    <Link
      href={`/politicos/${pessoa.slug}`}
      className="group flex w-full flex-col border border-ink bg-raised no-underline transition-colors duration-[var(--atlas-fast)] hover:bg-paper"
    >
      <Portrait
        nome={pessoa.nome}
        imagem={retrato}
        sizes="(min-width: 64rem) 22rem, 50vw"
        priority={priority}
        decorative
      />
      <span className="flex flex-1 flex-col gap-2 border-t border-ink p-3 md:p-4">
        <span className="font-serif text-[1.375rem] font-medium leading-none tracking-tight md:text-3xl">
          {pessoa.nome}
        </span>
        <span className="numerals text-xs text-ink-soft md:text-sm">
          {coberto === null ? "período não declarado" : `${coberto.de}–${coberto.ate}`} ·{" "}
          {registros} {registros === 1 ? "registro" : "registros"}
        </span>
        <span className="mt-auto pt-2 text-sm font-medium underline decoration-line-strong underline-offset-[0.3em] group-hover:decoration-ink">
          {/* A seta acompanha a última palavra quando o texto quebra. */}
          Explorar a{" "}
          <span className="whitespace-nowrap">
            trajetória<span aria-hidden="true"> →</span>
          </span>
        </span>
      </span>
    </Link>
  );
}
