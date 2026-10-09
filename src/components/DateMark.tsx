// A data como elemento de destaque: o ano em números grandes e, ao lado ou
// abaixo, só o que a precisão sustenta. Uma data de que só se sabe o ano
// mostra só o ano; nada é completado.

import {
  describePrecision,
  formatDate,
  formatDateParts,
  type DataHistorica,
} from "@/lib/domain/dates";

interface DateMarkProps {
  data: DataHistorica;
  /** `coluna`: ano sobre o complemento, para a lista. `linha`: lado a lado. */
  layout?: "coluna" | "linha";
  /**
   * Diz por escrito o que falta em uma data parcial ("só o ano", "sem o dia").
   * Para listas em ordem cronológica, em que a posição do item sugere um dia.
   */
  showPrecision?: boolean;
  className?: string;
}

const PRECISION_HINTS = { ano: "só o ano", mes: "sem o dia", dia: null } as const;

export function DateMark({ data, layout = "coluna", showPrecision = false, className = "" }: DateMarkProps) {
  const { ano, complemento } = formatDateParts(data);
  const aviso = showPrecision ? PRECISION_HINTS[data.precisao] : null;
  const frase = showPrecision ? describePrecision(data) : null;

  return (
    <time dateTime={data.valor} className={`numerals ${className}`}>
      {/* Quem ouve a página recebe a data por extenso. */}
      <span className="sr-only">
        {formatDate(data)}
        {frase !== null && `. ${frase}`}
      </span>
      <span
        aria-hidden="true"
        className={layout === "coluna" ? "flex flex-col leading-none" : "inline-flex items-baseline gap-1.5"}
      >
        <span className="text-[1.0625rem] font-semibold tracking-tight">{ano}</span>
        {complemento !== null && (
          <span className={`text-xs font-medium text-ink-soft ${layout === "coluna" ? "mt-1" : ""}`}>
            {complemento}
          </span>
        )}
        {aviso !== null && (
          <span className={`text-[0.6875rem] italic text-ink-soft ${layout === "coluna" ? "mt-1" : ""}`}>
            {aviso}
          </span>
        )}
      </span>
    </time>
  );
}
