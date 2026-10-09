// Cargos e partidos do período consultado, por extenso. É o que responde, sem
// depender do desenho das faixas, a "que cargo e que partido a pessoa tinha
// neste intervalo": cada registro com as próprias datas, e a mudança de um
// para outro visível na sequência.
//
// O que as datas provam fica separado do que elas não decidem. Um registro com
// início ou fim desconhecido, que pode ou não tocar o período, aparece à
// parte, como presença incerta: é lacuna do conjunto, dita como lacuna.
//
// O bloco abre e fecha. Quem decide o estado é quem o usa.

import { AffiliationList, MandateList } from "@/components/PeriodRecords";
import type { PeriodMatch } from "@/lib/data/queries";
import type { Filiacao, Mandato } from "@/lib/domain/types";

interface PeriodContextProps {
  /** O período por extenso, como `2003–2010` ou `2018`. */
  periodLabel: string;
  mandatos: readonly PeriodMatch<Mandato>[];
  filiacoes: readonly PeriodMatch<Filiacao>[];
  open: boolean;
  onToggle: (open: boolean) => void;
  /** Nível dos títulos internos, dentro da região que hospeda o bloco. */
  headingLevel?: 3 | 4;
}

const count = (quantos: number, um: string, varios: string) =>
  `${quantos} ${quantos === 1 ? um : varios}`;

function split<T>(itens: readonly PeriodMatch<T>[]) {
  return {
    documentados: itens.filter((item) => item.situacao === "documentada"),
    incertos: itens.filter((item) => item.situacao === "incerta"),
  };
}

export function PeriodContext({
  periodLabel,
  mandatos,
  filiacoes,
  open,
  onToggle,
  headingLevel = 3,
}: PeriodContextProps) {
  const Heading = headingLevel === 3 ? "h3" : "h4";
  const cargos = split(mandatos);
  const partidos = split(filiacoes);
  const incertos = cargos.incertos.length + partidos.incertos.length;

  return (
    <details
      open={open}
      onToggle={(evento) => onToggle(evento.currentTarget.open)}
      className="group/ctx border-t border-line"
    >
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 hover:bg-raised [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <span className="block text-sm font-medium">Cargos e partidos em {periodLabel}</span>
          <span className="numerals block text-xs text-ink-soft">
            {count(cargos.documentados.length, "cargo ou função", "cargos e funções")} ·{" "}
            {count(partidos.documentados.length, "partido", "partidos")}
            {incertos > 0 && ` · ${count(incertos, "com presença incerta", "com presença incerta")}`}
          </span>
        </span>
        <span
          aria-hidden="true"
          className="shrink-0 text-ink-soft transition-transform duration-[var(--atlas-fast)] group-open/ctx:rotate-180"
        >
          ▾
        </span>
      </summary>

      <div className="space-y-4 px-3 pb-4 pt-1">
        <section className="space-y-1.5">
          <Heading className="eyebrow text-ink-soft">Cargos e funções</Heading>
          <MandateList
            itens={cargos.documentados}
            variant="compacto"
            emptyText="Nenhum cargo ou função com datas neste período."
          />
        </section>

        <section className="space-y-1.5">
          <Heading className="eyebrow text-ink-soft">Partidos</Heading>
          <AffiliationList
            itens={partidos.documentados}
            variant="compacto"
            emptyText="Nenhuma filiação com datas neste período."
          />
        </section>

        {incertos > 0 && (
          <section className="space-y-1.5 border-l-2 border-dashed border-ink-faint pl-2.5">
            <Heading className="eyebrow text-ink-soft">Presença incerta no período</Heading>
            <p className="text-xs text-ink-soft">
              Falta o início ou o fim destes registros, e as datas conhecidas não dizem se eles
              tocam o período.
            </p>
            {cargos.incertos.length > 0 && (
              <MandateList itens={cargos.incertos} variant="compacto" showSituation={false} emptyText="" />
            )}
            {partidos.incertos.length > 0 && (
              <AffiliationList itens={partidos.incertos} variant="compacto" showSituation={false} emptyText="" />
            )}
          </section>
        )}

        <p className="text-xs text-ink-soft">
          O que não aparece aqui é o que a edição não registra, e não ausência de atividade.
        </p>
      </div>
    </details>
  );
}
