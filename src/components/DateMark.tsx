// A data como elemento de destaque: o ano em números grandes e, ao lado ou
// abaixo, só o que a precisão sustenta. Uma data de que só se sabe o ano
// mostra só o ano; nada é completado.

import { formatDate, formatDateParts, type DataHistorica } from "@/lib/domain/dates";

interface DateMarkProps {
  data: DataHistorica;
  /** `coluna`: ano sobre o complemento, para a lista. `linha`: lado a lado. */
  layout?: "coluna" | "linha";
  className?: string;
}

export function DateMark({ data, layout = "coluna", className = "" }: DateMarkProps) {
  const { ano, complemento } = formatDateParts(data);

  return (
    <time dateTime={data.valor} className={`numerals ${className}`}>
      {/* Quem ouve a página recebe a data por extenso. */}
      <span className="sr-only">{formatDate(data)}</span>
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
      </span>
    </time>
  );
}
