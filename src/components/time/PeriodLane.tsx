// Faixa de períodos sobre o eixo: cargos ou partidos como barras. Mostra o
// que as datas documentam: um limite desconhecido aparece tracejado e sem
// ponta, e um período sem nenhuma data não vira barra, vira texto.
//
// A faixa é uma imagem com descrição. A lista por extenso dos mesmos períodos
// está no painel do perfil.

import { formatPeriod, type Periodo } from "@/lib/domain/dates";

import { barOfPeriod, packRows, type PeriodBar, type TimeDomain } from "./scale";

export interface LaneItem {
  id: string;
  /** Texto curto, dentro da barra. */
  rotulo: string;
  /** Texto completo, para a descrição. */
  descricao: string;
  periodo: Periodo;
}

interface PeriodLaneProps {
  rotulo: string;
  itens: readonly LaneItem[];
  domain: TimeDomain;
  dataDeCorte: string;
  className?: string;
}

const ROW_HEIGHT = 22;

export function PeriodLane({ rotulo, itens, domain, dataDeCorte, className = "" }: PeriodLaneProps) {
  const posicionados: { item: LaneItem; barra: PeriodBar }[] = [];
  const semDatas: LaneItem[] = [];
  for (const item of itens) {
    const barra = barOfPeriod(domain, item.periodo, dataDeCorte);
    if (barra === null || barra.largura === 0) semDatas.push(item);
    else posicionados.push({ item, barra });
  }

  const fileiras = packRows(
    posicionados.map(({ barra }) => barra),
    0.004,
  );
  const total = fileiras.length === 0 ? 1 : Math.max(...fileiras) + 1;
  const descricao = itens
    .map((item) => `${item.descricao}, ${formatPeriod(item.periodo)}`)
    .join("; ");

  return (
    <div className={className}>
      <div
        role="img"
        aria-label={`${rotulo} ao longo do tempo: ${descricao === "" ? "nenhum registro" : descricao}.`}
        className="relative"
        style={{ height: total * ROW_HEIGHT }}
      >
        {posicionados.map(({ item, barra }, indice) => (
          <span
            key={item.id}
            title={`${item.descricao} · ${formatPeriod(item.periodo)}`}
            className={`@container absolute flex h-[18px] items-center overflow-hidden border border-ink-faint bg-sunken px-1.5 ${
              barra.aberto === null ? "" : "border-dashed"
            } ${barra.aberto === "fim" ? "border-r-0" : ""} ${
              barra.aberto === "inicio" ? "border-l-0" : ""
            }`}
            style={{
              left: `${barra.inicio * 100}%`,
              width: `max(${barra.largura * 100}%, 6px)`,
              top: fileiras[indice]! * ROW_HEIGHT,
              // O lado sem data some no papel, em vez de terminar em uma borda.
              maskImage:
                barra.aberto === "fim"
                  ? "linear-gradient(to right, #000 40%, transparent)"
                  : barra.aberto === "inicio"
                    ? "linear-gradient(to left, #000 40%, transparent)"
                    : undefined,
            }}
          >
            {/* Barra estreita fica sem texto: um rótulo cortado em uma letra não informa nada. */}
            <span className="hidden truncate text-[0.6875rem] font-medium leading-none text-ink @[3rem]:block">
              {item.rotulo}
            </span>
          </span>
        ))}
      </div>
      {semDatas.length > 0 && (
        <p className="relative mt-1 w-fit bg-paper/85 text-[0.6875rem] leading-snug text-ink-soft">
          Sem datas documentadas: {semDatas.map((item) => item.rotulo).join(", ")}.
        </p>
      )}
    </div>
  );
}
