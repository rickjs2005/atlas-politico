// Cargos e partidos que tocam um período, por extenso. Cada item traz as datas
// na precisão que as fontes sustentam. Quando o registro tem um limite que não
// está documentado e as datas conhecidas não provam que ele toca o período, o
// item diz isso: um limite desconhecido não vira data.
//
// Apresentação pura, usada na exploração e na comparação.

import type { PeriodMatch } from "@/lib/data/queries";
import { formatPeriod } from "@/lib/domain/dates";
import type { Filiacao, Mandato } from "@/lib/domain/types";

interface ListProps<T> {
  itens: readonly PeriodMatch<T>[];
  /** O que dizer quando nenhum registro toca o período. */
  emptyText: string;
  /** `compacto`: cargo e instituição na mesma linha, para colunas estreitas. */
  variant?: "completo" | "compacto";
  /** Desligado quando a lista já está sob um título que diz que a presença é incerta. */
  showSituation?: boolean;
}

const list = "divide-y divide-line border-y border-line text-sm";

export function MandateList({
  itens,
  emptyText,
  variant = "completo",
  showSituation = true,
}: ListProps<Mandato>) {
  if (itens.length === 0) return <p className="text-sm text-ink-soft">{emptyText}</p>;

  return (
    <ul className={list}>
      {itens.map(({ registro, situacao }) => (
        <li key={registro.id} className="py-2">
          {variant === "completo" ? (
            <>
              <span className="block font-medium">{registro.cargo}</span>
              <span className="block text-ink-soft">{registro.instituicao}</span>
            </>
          ) : (
            <span className="block">
              <span className="font-medium">{registro.cargo}</span>
              <span className="text-ink-soft">, {registro.instituicao}</span>
            </span>
          )}
          <span className="numerals block text-xs text-ink-soft">
            {formatPeriod(registro.periodo)}
            {showSituation && situacao === "incerta" && (
              <span className="italic"> · presença no período não documentada</span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function AffiliationList({ itens, emptyText, showSituation = true }: ListProps<Filiacao>) {
  if (itens.length === 0) return <p className="text-sm text-ink-soft">{emptyText}</p>;

  return (
    <ul className={list}>
      {itens.map(({ registro, situacao }) => (
        <li key={registro.id} className="flex flex-wrap items-baseline justify-between gap-x-4 py-2">
          <span className="font-medium">{registro.partido.sigla}</span>
          <span className="numerals text-xs text-ink-soft">
            {formatPeriod(registro.periodo)}
            {showSituation && situacao === "incerta" && (
              <span className="italic"> · incerta no período</span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
