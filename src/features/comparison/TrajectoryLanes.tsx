// As trajetórias sobre o mesmo eixo de anos: uma faixa por pessoa, com as
// marcas dos acontecimentos, os cargos e, se pedido, os partidos.
//
// O que a faixa não pode sugerir:
//   - que um trecho vazio é falta de atividade. O trecho anterior à cobertura
//     da edição aparece hachurado e escrito como "fora da cobertura", e as
//     lacunas dentro da cobertura, como "sem registros";
//   - que as duas pessoas são medidas uma contra a outra. As faixas têm a
//     mesma altura mínima, a mesma escala e as mesmas marcas; não há total,
//     barra de quantidade nem cor por pessoa.

import { EventMarkLinks } from "@/components/time/EventMarkLinks";
import { PeriodLane } from "@/components/time/PeriodLane";
import { PeriodShade } from "@/components/time/PeriodShade";
import { TimeAxis } from "@/components/time/TimeAxis";
import { spanOfYears, type TimeDomain } from "@/components/time/scale";
import type { YearSpan } from "@/lib/data/coverage";
import type { Acontecimento, Filiacao, Mandato, Pessoa } from "@/lib/domain/types";

export interface TrajectoryLane {
  pessoa: Pessoa;
  /** Todos os acontecimentos da pessoa. */
  acontecimentos: readonly Acontecimento[];
  /** `id` dos acontecimentos fora do recorte atual: aparecem apagados. */
  foraDoRecorte?: ReadonlySet<string>;
  mandatos: readonly Mandato[];
  filiacoes: readonly Filiacao[];
  /** Anos que a edição cobre para a pessoa. */
  coberto: YearSpan | null;
  /** Períodos sem acontecimentos, dentro da cobertura. */
  lacunas: readonly YearSpan[];
}

interface TrajectoryLanesProps {
  domain: TimeDomain;
  lanes: readonly TrajectoryLane[];
  dataDeCorte: string;
  periodo?: { de: number | null; ate: number | null };
  /** `resumo` deixa os partidos de fora, para a chamada na entrada. */
  detail?: "completo" | "resumo";
}

const hatch =
  "[background-image:repeating-linear-gradient(135deg,transparent_0_6px,var(--atlas-line)_6px_7px)]";

export function TrajectoryLanes({
  domain,
  lanes,
  dataDeCorte,
  periodo = { de: null, ate: null },
  detail = "completo",
}: TrajectoryLanesProps) {
  return (
    <div className="space-y-2">
      {/* Em tela estreita a faixa rola na horizontal e começa pelo fim, nos anos
          recentes, em que as duas trajetórias têm registros. A inversão de
          direção serve só para isso; o conteúdo continua da esquerda para a direita. */}
      <div className="relative overflow-x-auto overscroll-x-contain border-y border-ink [direction:rtl]">
        <div className="min-w-[44rem] divide-y divide-line [direction:ltr]">
          {lanes.map((lane) => {
            const antes =
              lane.coberto !== null && lane.coberto.de > domain.de
                ? spanOfYears(domain, domain.de, lane.coberto.de - 1)
                : null;

            return (
              <section
                key={lane.pessoa.id}
                aria-label={`Trajetória de ${lane.pessoa.nome}`}
                className="grid grid-cols-[7.5rem_minmax(0,1fr)] md:grid-cols-[10rem_minmax(0,1fr)]"
              >
                <h3 className="sticky left-0 z-10 flex items-start bg-paper py-3 pr-3 font-serif text-lg font-medium leading-tight">
                  {lane.pessoa.nome}
                </h3>

                <div className="relative min-h-28 space-y-2 py-3">
                  {antes !== null && (
                    <div
                      aria-hidden="true"
                      className={`absolute inset-y-0 left-0 flex items-center justify-center border-r border-dashed border-ink-faint ${hatch}`}
                      style={{ width: `${(antes.inicio + antes.largura) * 100}%` }}
                    >
                      <span className="bg-paper px-2 py-1 text-center text-xs leading-tight text-ink-soft">
                        fora da cobertura desta edição
                      </span>
                    </div>
                  )}

                  <div className="relative">
                    <EventMarkLinks
                      domain={domain}
                      events={lane.acontecimentos}
                      dimmed={lane.foraDoRecorte}
                      label={`Acontecimentos de ${lane.pessoa.nome}`}
                    />
                    {/* Lacunas: um colchete tracejado sob o trecho sem acontecimentos.
                        O texto só entra quando cabe inteiro; os anos de cada lacuna
                        estão escritos na coluna da pessoa. */}
                    <div aria-hidden="true" className="relative h-5">
                      {lane.lacunas.map((lacuna) => {
                        const trecho = spanOfYears(domain, lacuna.de, lacuna.ate);
                        return (
                          <span
                            key={lacuna.de}
                            className="@container absolute top-0 h-full"
                            style={{ left: `${trecho.inicio * 100}%`, width: `${trecho.largura * 100}%` }}
                          >
                            <span className="block h-1.5 border-x border-b border-dashed border-ink-faint" />
                            <span className="hidden whitespace-nowrap text-center text-[0.625rem] leading-[0.875rem] text-ink-soft @[4.5rem]:block">
                              sem registros
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <PeriodLane
                    rotulo={`Cargos e funções de ${lane.pessoa.nome}`}
                    itens={lane.mandatos.map((item) => ({
                      id: item.id,
                      rotulo: item.cargo,
                      descricao: `${item.cargo}, ${item.instituicao}`,
                      periodo: item.periodo,
                    }))}
                    domain={domain}
                    dataDeCorte={dataDeCorte}
                  />

                  {detail === "completo" && (
                    <PeriodLane
                      rotulo={`Partidos de ${lane.pessoa.nome}`}
                      itens={lane.filiacoes.map((item) => ({
                        id: item.id,
                        rotulo: item.partido.sigla,
                        descricao: `${item.partido.sigla} (${item.partido.nome})`,
                        periodo: item.periodo,
                      }))}
                      domain={domain}
                      dataDeCorte={dataDeCorte}
                    />
                  )}

                  <PeriodShade domain={domain} periodo={periodo} />
                </div>
              </section>
            );
          })}

          <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] md:grid-cols-[10rem_minmax(0,1fr)]">
            <span className="sticky left-0 z-10 bg-paper" />
            <TimeAxis domain={domain} className="border-t-0" />
          </div>
        </div>
      </div>
      <p className="text-xs text-ink-soft md:hidden">
        A faixa mostra primeiro os anos recentes. Arraste para o lado para ver os anteriores.
      </p>
    </div>
  );
}
