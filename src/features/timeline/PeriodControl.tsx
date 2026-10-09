"use client";

// Controle de período: dois campos de ano, "de" e "até". É a forma do recorte
// que funciona com teclado, leitor de tela e toque sem depender de arrastar.
// O arraste sobre a linha do tempo, previsto para a fase 5, altera o mesmo
// estado e convive com estes campos (docs/INTERACTIONS.md).

import { useId } from "react";

import type { TimeDomain } from "@/components/time/scale";

interface PeriodControlProps {
  /** Anos que podem ser escolhidos: a cobertura da trajetória. */
  domain: TimeDomain;
  periodo: { de: number | null; ate: number | null };
  onChange: (de: number | null, ate: number | null) => void;
  className?: string;
}

const field =
  "numerals h-11 border border-ink-faint bg-raised px-2 text-sm font-medium hover:border-ink xl:h-9";
const reset = "font-medium text-ink-soft underline decoration-line-strong hover:text-ink";

export function PeriodControl({ domain, periodo, onChange, className = "" }: PeriodControlProps) {
  const id = useId();
  const anos = Array.from({ length: domain.ate - domain.de + 1 }, (_, indice) => domain.de + indice);
  const de = periodo.de ?? domain.de;
  const ate = periodo.ate ?? domain.ate;
  const inteiro = de <= domain.de && ate >= domain.ate;

  // Escolher o próprio limite da cobertura equivale a deixar aquele lado aberto.
  const emit = (novoDe: number, novoAte: number) =>
    onChange(novoDe <= domain.de ? null : novoDe, novoAte >= domain.ate ? null : novoAte);
  const clear = () => onChange(null, null);

  return (
    <div role="group" aria-labelledby={`${id}-rotulo`} className={`xl:w-fit ${className}`}>
      <div className="mb-1.5 flex h-4 items-center justify-between gap-3">
        <span id={`${id}-rotulo`} className="eyebrow text-ink-soft">
          Período
        </span>
        {/* O botão de desfazer só existe quando há recorte. Em tela larga fica
            na linha do rótulo, para a barra de filtros não mudar de altura;
            nas demais, ao lado dos campos, com área de toque inteira. */}
        {!inteiro && (
          <button type="button" onClick={clear} className={`-my-1 hidden py-1 text-xs xl:block ${reset}`}>
            Todo o período
          </button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
        <label htmlFor={`${id}-de`} className="sr-only">
          De
        </label>
        <select
          id={`${id}-de`}
          value={de}
          onChange={(evento) => emit(Number(evento.target.value), Math.max(Number(evento.target.value), ate))}
          className={field}
        >
          {anos.map((ano) => (
            <option key={ano} value={ano}>
              {ano}
            </option>
          ))}
        </select>
        <span aria-hidden="true" className="text-sm text-ink-soft">
          a
        </span>
        <label htmlFor={`${id}-ate`} className="sr-only">
          Até
        </label>
        <select
          id={`${id}-ate`}
          value={ate}
          onChange={(evento) => emit(Math.min(de, Number(evento.target.value)), Number(evento.target.value))}
          className={field}
        >
          {anos.map((ano) => (
            <option key={ano} value={ano}>
              {ano}
            </option>
          ))}
        </select>
        {!inteiro && (
          <button type="button" onClick={clear} className={`h-11 px-2 text-sm xl:hidden ${reset}`}>
            Todo o período
          </button>
        )}
      </div>
    </div>
  );
}
