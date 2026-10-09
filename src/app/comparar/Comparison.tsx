"use client";

// Comparação das trajetórias no mesmo período e na mesma escala. Exemplo
// navegável da fase 4: o período é escolhido aqui e vale para as duas pessoas;
// a ligação com o endereço e o resto do acabamento são da fase 7.
//
// A tela mostra o que o atlas registra para cada pessoa. Não soma, não ordena
// e não conclui nada a partir da quantidade de registros.

import Link from "next/link";
import { useMemo, useState } from "react";

import { Portrait } from "@/components/Portrait";
import { TrajectoryLanes } from "@/features/comparison/TrajectoryLanes";
import { EventLinkList } from "@/features/events/EventLinkList";
import { PeriodControl } from "@/features/timeline/PeriodControl";
import { getCoveredSpan, getSharedSpan, listGaps, type YearSpan } from "@/lib/data/coverage";
import { compareTrajectories, filterEvents, getImage, type Trajectory } from "@/lib/data/queries";
import type { AtlasData } from "@/lib/data/types";
import { formatPeriod } from "@/lib/domain/dates";

interface ComparisonProps {
  data: AtlasData;
  /** Slugs na ordem em que os perfis aparecem na interface. */
  order: readonly string[];
}

const sectionTitle = "eyebrow text-ink-soft";

export function Comparison({ data, order }: ComparisonProps) {
  const [periodo, setPeriodo] = useState<{ de: number | null; ate: number | null }>({
    de: null,
    ate: null,
  });
  const escala = getSharedSpan(data);
  const dataDeCorte = data.conjunto.edicao?.dataDeCorte ?? null;

  const { trajetorias, compartilhados } = useMemo(() => {
    const resultado = compareTrajectories(data, { periodo });
    const posicao = (slug: string) => {
      const indice = order.indexOf(slug);
      return indice === -1 ? order.length : indice;
    };
    return {
      ...resultado,
      trajetorias: [...resultado.trajetorias].sort(
        (a, b) => posicao(a.pessoa.slug) - posicao(b.pessoa.slug),
      ),
    };
  }, [data, order, periodo]);

  if (escala === null || dataDeCorte === null || trajetorias.length === 0) {
    return (
      <div className="page space-y-4 py-12">
        <h1 className="font-serif text-5xl font-medium tracking-tight">Comparar trajetórias</h1>
        <p className="max-w-2xl text-ink-soft">
          A comparação aparece aqui quando houver registros revisados dos dois perfis.
        </p>
      </div>
    );
  }

  const de = periodo.de ?? escala.de;
  const ate = periodo.ate ?? escala.ate;

  return (
    <div className="page space-y-8 py-8 md:space-y-10 md:py-12">
      <header className="grid gap-x-12 gap-y-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:items-end">
        <div className="space-y-3">
          <p className="eyebrow text-ink-soft">Mesma escala, mesmo período</p>
          <h1 className="font-serif text-5xl font-medium leading-none tracking-tight md:text-6xl">
            Comparar trajetórias
          </h1>
          <p className="reading max-w-2xl">
            As trajetórias lado a lado, no mesmo intervalo de anos. A tela mostra os cargos, os
            partidos e os acontecimentos que o atlas registra para cada pessoa. Quantidade de
            registros não mede desempenho, e os cargos de cada um em cada época são diferentes.
          </p>
        </div>
        <PeriodControl domain={escala} periodo={periodo} onChange={(novoDe, novoAte) => setPeriodo({ de: novoDe, ate: novoAte })} />
      </header>

      <section aria-labelledby="titulo-faixas" className="space-y-3">
        <h2 id="titulo-faixas" className="sr-only">
          Linha do tempo das trajetórias
        </h2>
        <TrajectoryLanes
          domain={escala}
          dataDeCorte={dataDeCorte}
          periodo={periodo}
          lanes={trajetorias.map((trajetoria) => {
            const todos = filterEvents(data, { pessoaIds: [trajetoria.pessoa.id] });
            const noRecorte = new Set(trajetoria.acontecimentos.map((item) => item.id));
            return {
              pessoa: trajetoria.pessoa,
              acontecimentos: todos,
              foraDoRecorte: new Set(todos.filter((item) => !noRecorte.has(item.id)).map((item) => item.id)),
              mandatos: data.conjunto.mandatos.filter((item) => item.pessoaId === trajetoria.pessoa.id),
              filiacoes: data.conjunto.filiacoes.filter((item) => item.pessoaId === trajetoria.pessoa.id),
              coberto: getCoveredSpan(data, trajetoria.pessoa.id),
              lacunas: listGaps(data, trajetoria.pessoa.id),
            };
          })}
        />
      </section>

      <div className="grid gap-x-10 gap-y-12 lg:grid-cols-2">
        {trajetorias.map((trajetoria) => (
          <PersonColumn
            key={trajetoria.pessoa.id}
            data={data}
            trajetoria={trajetoria}
            compartilhados={compartilhados}
            recorte={{ de, ate }}
            coberto={getCoveredSpan(data, trajetoria.pessoa.id)}
            lacunas={listGaps(data, trajetoria.pessoa.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface PersonColumnProps {
  data: AtlasData;
  trajetoria: Trajectory;
  compartilhados: readonly string[];
  recorte: YearSpan;
  coberto: YearSpan | null;
  lacunas: readonly YearSpan[];
}

function PersonColumn({ data, trajetoria, compartilhados, recorte, coberto, lacunas }: PersonColumnProps) {
  const { pessoa, acontecimentos, mandatos, filiacoes, cobertura } = trajetoria;
  // Lacunas e trecho fora da cobertura que tocam o período escolhido.
  const lacunasNoRecorte = lacunas.filter((item) => item.ate >= recorte.de && item.de <= recorte.ate);
  const antesDaCobertura = coberto !== null && recorte.de < coberto.de;
  const total = acontecimentos.length;

  return (
    <section aria-labelledby={`coluna-${pessoa.slug}`} className="space-y-6">
      <header className="grid grid-cols-[4rem_minmax(0,1fr)] items-end gap-4 border-b border-ink pb-3">
        <Portrait
          nome={pessoa.nome}
          imagem={getImage(data, pessoa.retratoId)}
          shape="quadrado"
          sizes="64px"
          decorative
        />
        <div className="space-y-1">
          <h2 id={`coluna-${pessoa.slug}`} className="font-serif text-3xl font-medium leading-none tracking-tight">
            {pessoa.nome}
          </h2>
          <p className="text-sm">
            <Link href={`/politicos/${pessoa.slug}`} className="underline decoration-line-strong hover:decoration-ink">
              Explorar a trajetória
            </Link>
          </p>
        </div>
      </header>

      <section className="space-y-2">
        <h3 className={sectionTitle}>Cobertura desta edição</h3>
        <div className="space-y-1.5 text-sm">
          <p className="numerals">
            {cobertura === null ? "A edição não declara o período coberto." : formatPeriod(cobertura.periodo)}
          </p>
          {antesDaCobertura && coberto !== null && (
            <p className="border-l-2 border-ink-faint pl-2 text-ink-soft">
              De {recorte.de} a {Math.min(recorte.ate, coberto.de - 1)}, o atlas não cobre esta
              trajetória. Não há registro porque o período não foi pesquisado.
            </p>
          )}
          {lacunasNoRecorte.length > 0 && (
            <p className="border-l-2 border-ink-faint pl-2 text-ink-soft">
              Sem registros no atlas:{" "}
              <span className="numerals">
                {lacunasNoRecorte.map((item) => `${item.de}–${item.ate}`).join("; ")}
              </span>
              . São lacunas da pesquisa, e não ausência de atividade.
            </p>
          )}
        </div>
      </section>

      <section className="space-y-2">
        <h3 className={sectionTitle}>Cargos e funções no período</h3>
        {mandatos.length === 0 ? (
          <p className="text-sm text-ink-soft">Nenhum cargo registrado no período.</p>
        ) : (
          <ul className="divide-y divide-line border-y border-line text-sm">
            {mandatos.map(({ registro, situacao }) => (
              <li key={registro.id} className="py-2">
                <span className="block font-medium">{registro.cargo}</span>
                <span className="block text-ink-soft">{registro.instituicao}</span>
                <span className="numerals block text-xs text-ink-soft">
                  {formatPeriod(registro.periodo)}
                  {situacao === "incerta" && (
                    <span className="italic"> · presença no período não documentada</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-2">
        <h3 className={sectionTitle}>Partidos no período</h3>
        {filiacoes.length === 0 ? (
          <p className="text-sm text-ink-soft">Nenhuma filiação registrada no período.</p>
        ) : (
          <ul className="divide-y divide-line border-y border-line text-sm">
            {filiacoes.map(({ registro, situacao }) => (
              <li key={registro.id} className="flex flex-wrap items-baseline justify-between gap-x-4 py-2">
                <span className="font-medium">{registro.partido.sigla}</span>
                <span className="numerals text-xs text-ink-soft">
                  {formatPeriod(registro.periodo)}
                  {situacao === "incerta" && <span className="italic"> · incerta no período</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-2">
        <h3 className={sectionTitle}>
          Acontecimentos no período{" "}
          <span className="numerals font-medium normal-case tracking-normal">
            · {total} {total === 1 ? "registro do atlas" : "registros do atlas"}
          </span>
        </h3>
        <EventLinkList
          items={acontecimentos}
          shared={compartilhados}
          emptyMessage={
            <p>
              Nenhum registro do atlas entre {recorte.de} e {recorte.ate}. Isso indica falta de
              registro nesta edição, e não falta de atividade pública.
            </p>
          }
        />
      </section>
    </section>
  );
}
