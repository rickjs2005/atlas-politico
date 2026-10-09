// Cargos e partidos, por extenso. Cada item traz as datas na precisão que as
// fontes sustentam. Quando o registro tem um limite que não está documentado e
// as datas conhecidas não provam que ele toca o período, o item diz isso: um
// limite desconhecido não vira data.
//
// O que está em curso na data de corte da edição leva a marca "em curso", para
// se distinguir do que tem fim documentado. Com `sourcesOf`, cada registro dá
// acesso às fontes que o sustentam.
//
// Apresentação pura, usada no perfil, na exploração e na comparação.

import { RecordSources } from "@/components/RecordSources";
import type { SourceEntry } from "@/components/SourceList";
import type { PeriodMatch } from "@/lib/data/queries";
import { formatPeriod, type Periodo } from "@/lib/domain/dates";
import type { Filiacao, Mandato } from "@/lib/domain/types";

interface ListProps<T> {
  itens: readonly PeriodMatch<T>[];
  /** O que dizer quando nenhum registro toca o período. */
  emptyText: string;
  /** `compacto`: cargo e instituição na mesma linha, para colunas estreitas. */
  variant?: "completo" | "compacto";
  /** Desligado quando a lista já está sob um título que diz que a presença é incerta. */
  showSituation?: boolean;
  /** As fontes de cada registro. Sem a função, a lista não mostra fontes. */
  sourcesOf?: (registro: T) => readonly SourceEntry[];
}

const list = "divide-y divide-line border-y border-line text-sm";

/** O registro vale na data de corte da edição. */
function Ongoing({ periodo }: { periodo: Periodo }) {
  if (periodo.fim.tipo !== "em-curso") return null;
  return (
    <span className="ml-1.5 whitespace-nowrap border border-ink-faint px-1 py-px text-[0.625rem] font-semibold uppercase leading-none tracking-[0.06em] text-ink-soft">
      em curso
    </span>
  );
}

export function MandateList({
  itens,
  emptyText,
  variant = "completo",
  showSituation = true,
  sourcesOf,
}: ListProps<Mandato>) {
  if (itens.length === 0) return <p className="text-sm text-ink-soft">{emptyText}</p>;

  return (
    <ul className={list}>
      {itens.map(({ registro, situacao }) => (
        <li key={registro.id} className="py-2" data-registro={registro.id}>
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
            <Ongoing periodo={registro.periodo} />
            {showSituation && situacao === "incerta" && (
              <span className="italic"> · presença no período não documentada</span>
            )}
          </span>
          {sourcesOf && <RecordSources entries={sourcesOf(registro)} about={registro.cargo} />}
        </li>
      ))}
    </ul>
  );
}

export function AffiliationList({
  itens,
  emptyText,
  variant = "completo",
  showSituation = true,
  sourcesOf,
}: ListProps<Filiacao>) {
  if (itens.length === 0) return <p className="text-sm text-ink-soft">{emptyText}</p>;

  return (
    <ul className={list}>
      {itens.map(({ registro, situacao }) => (
        <li key={registro.id} className="py-2" data-registro={registro.id}>
          <span className="flex flex-wrap items-baseline justify-between gap-x-4">
            <span>
              <span className="font-medium">{registro.partido.sigla}</span>
              {variant === "completo" && registro.partido.nome !== registro.partido.sigla && (
                <span className="text-ink-soft"> · {registro.partido.nome}</span>
              )}
            </span>
            <span className="numerals text-xs text-ink-soft">
              {formatPeriod(registro.periodo)}
              <Ongoing periodo={registro.periodo} />
              {showSituation && situacao === "incerta" && (
                <span className="italic"> · incerta no período</span>
              )}
            </span>
          </span>
          {sourcesOf && <RecordSources entries={sourcesOf(registro)} about={registro.partido.sigla} />}
        </li>
      ))}
    </ul>
  );
}
