"use client";

// Comparação das trajetórias no mesmo período, com as mesmas categorias e na
// mesma escala de anos (docs/COMPARISON.md).
//
// O recorte fica no endereço, como na exploração: é o mesmo estado, o mesmo
// contrato de parâmetros e as mesmas regras de histórico, com a rota dizendo
// que as duas pessoas entram. A consulta é uma só (`selectComparison`), feita
// uma vez por pessoa.
//
// A tela mostra o que o atlas registra para cada pessoa. Não soma, não ordena
// e não conclui nada a partir da quantidade de registros.

import Link from "next/link";
import { memo, useEffect, useMemo, useRef, useState } from "react";

import { CopyLink } from "@/components/CopyLink";
import { AffiliationList, MandateList } from "@/components/PeriodRecords";
import { Portrait } from "@/components/Portrait";
import { SourceCatalog } from "@/components/SourceList";
import { TrajectoryLanes } from "@/features/comparison/TrajectoryLanes";
import { DecisionsByTheme, SAMPLE_NOTICE } from "@/features/decisions/DecisionsByTheme";
import { EventLinkList } from "@/features/events/EventLinkList";
import { clipGaps } from "@/features/events/chronology";
import { CategoryFilter } from "@/features/timeline/CategoryFilter";
import { PeriodControl } from "@/features/timeline/PeriodControl";
import { getCoveredSpan, getSharedSpan, listGaps, type YearSpan } from "@/lib/data/coverage";
import { listDecisionViews } from "@/lib/data/decisions";
import { filterEvents, getImage, getSources, listSourcesOf, type Trajectory } from "@/lib/data/queries";
import type { AtlasData } from "@/lib/data/types";
import { CATEGORIAS, CATEGORY_LABELS, type Categoria } from "@/lib/domain/categories";
import { formatPeriod, formatYearRange } from "@/lib/domain/dates";
import type { Acontecimento } from "@/lib/domain/types";
import { useAtlas } from "@/lib/state/AtlasStateProvider";
import { AtlasUrlStateProvider } from "@/lib/state/AtlasUrlStateProvider";
import { hasFilters } from "@/lib/state/atlas-state";
import {
  ORIGIN_COMPARISON,
  carryFromComparison,
  comparisonHref,
  decisionHref,
  eventHref,
  explorationHref,
  type Recorte,
} from "@/lib/state/links";
import { selectComparison } from "@/lib/state/selectors";

interface ComparisonProps {
  data: AtlasData;
  /** Slugs na ordem em que os perfis aparecem na interface. */
  order: readonly string[];
}

const PATH = "/comparar";
const sectionTitle = "eyebrow text-ink-soft";
const reset = "font-medium text-ink-soft underline decoration-line-strong hover:text-ink";
const note = "border-l-2 border-ink-faint pl-2 text-ink-soft";

/** Largura da coluna de nomes das faixas em tela estreita (7.5rem). */
const LANE_LABEL_PX = 120;

const columnId = (slug: string) => `trajetoria-${slug}`;
const count = (quantos: number, um: string, varios: string) => `${quantos} ${quantos === 1 ? um : varios}`;

export function Comparison({ data, order }: ComparisonProps) {
  const escala = useMemo(() => getSharedSpan(data), [data]);
  const dataDeCorte = data.conjunto.edicao?.dataDeCorte ?? null;

  if (escala === null || dataDeCorte === null || data.conjunto.pessoas.length === 0) {
    return (
      <div className="page space-y-4 py-12">
        <h1 className="font-serif text-5xl font-medium tracking-tight">Comparar trajetórias</h1>
        <p className="max-w-2xl text-ink-soft">
          A comparação aparece aqui quando houver registros revisados dos dois perfis.
        </p>
      </div>
    );
  }

  return (
    // A rota diz que as duas trajetórias entram; a query string diz o recorte.
    <AtlasUrlStateProvider data={data} pessoa={null} comparar path={PATH} cobertura={escala}>
      <ComparisonView order={order} escala={escala} dataDeCorte={dataDeCorte} />
    </AtlasUrlStateProvider>
  );
}

interface ComparisonViewProps {
  order: readonly string[];
  /** A escala de anos comum às duas trajetórias. */
  escala: YearSpan;
  dataDeCorte: string;
}

function ComparisonView({ order, escala, dataDeCorte }: ComparisonViewProps) {
  const { state, dispatch, data } = useAtlas();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const lanes = useRef<HTMLDivElement>(null);

  const recorte = useMemo<Recorte>(
    () => ({ periodo: state.periodo, categorias: state.categorias }),
    [state.periodo, state.categorias],
  );

  const { trajetorias, compartilhados } = useMemo(() => {
    const resultado = selectComparison(data, state);
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
  }, [data, order, state]);

  // Quantos acontecimentos de cada categoria há no período, nas duas trajetórias.
  const contagem = useMemo(() => {
    const noPeriodo = filterEvents(data, { periodo: state.periodo });
    return Object.fromEntries(
      CATEGORIAS.map((categoria) => [
        categoria,
        noPeriodo.filter((item) => item.categoria === categoria).length,
      ]),
    ) as Record<Categoria, number>;
  }, [data, state.periodo]);

  // O período consultado, com os dois lados preenchidos.
  const anos = useMemo(
    () => ({ de: state.periodo.de ?? escala.de, ate: state.periodo.ate ?? escala.ate }),
    [state.periodo, escala],
  );
  const periodoTexto = formatYearRange(anos.de, anos.ate);
  const categoriasTexto =
    state.categorias.length === 0
      ? "todas as categorias"
      : state.categorias.map((categoria) => CATEGORY_LABELS[categoria].toLowerCase()).join(", ");
  const filtrado = hasFilters(state);

  // Quem sai daqui para um acontecimento leva o recorte, para poder voltar a ele.
  const hrefOf = (item: Acontecimento) => eventHref(item.slug, { recorte, origem: ORIGIN_COMPARISON });

  // Em tela estreita as faixas rolam para o lado. Com um período escolhido,
  // elas rolam até ele: a pessoa vê o trecho em claro, e não só a hachura.
  useEffect(() => {
    const area = lanes.current?.querySelector<HTMLElement>("[data-lanes-scroll]");
    const foco = area?.querySelector<HTMLElement>("[data-period-focus]");
    if (!area || !foco || area.scrollWidth <= area.clientWidth) return;
    const quadro = area.getBoundingClientRect();
    const meio = quadro.left + LANE_LABEL_PX + (quadro.width - LANE_LABEL_PX) / 2;
    const suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    area.scrollBy({ left: foco.getBoundingClientRect().left - meio, behavior: suave ? "smooth" : "auto" });
  }, [state.periodo.de, state.periodo.ate]);

  const cobertos = trajetorias.map((trajetoria) => ({
    trajetoria,
    coberto: getCoveredSpan(data, trajetoria.pessoa.id),
    lacunas: clipGaps(listGaps(data, trajetoria.pessoa.id), anos),
  }));
  // As decisões documentadas de cada pessoa, para a comparação por tema. Não seguem o recorte de anos: são a amostra inteira da edição.
  const colunasDeDecisoes = useMemo(
    () => trajetorias.map(({ pessoa }) => ({ pessoa: { id: pessoa.id, slug: pessoa.slug, nome: pessoa.nome }, decisoes: listDecisionViews(data, pessoa.id) })),
    [data, trajetorias],
  );
  const totalDeDecisoes = colunasDeDecisoes.reduce((soma, coluna) => soma + coluna.decisoes.length, 0);
  // Quem tem a cobertura começando depois do início do período consultado.
  const semCobertura = cobertos.filter(({ coberto }) => coberto !== null && coberto.de > anos.de);

  return (
    <>
      <header className="page space-y-3 py-6 md:py-10">
        <p className="eyebrow text-ink-soft">Mesmo período, mesmas categorias, mesma escala</p>
        <h1 className="font-serif text-[2.5rem] font-medium leading-none tracking-tight md:text-6xl">
          Comparar trajetórias
        </h1>
        <p className="reading max-w-2xl max-md:text-base max-md:leading-relaxed">
          As duas trajetórias lado a lado, no mesmo intervalo de anos. A tela mostra o que o atlas
          registra para cada pessoa: acontecimentos, cargos, partidos e as fontes de cada registro.
        </p>
      </header>

      {/* Recorte: preso ao topo, para os filtros ficarem à mão durante a leitura. */}
      <section aria-label="Recorte" className="sticky top-0 z-20 border-y border-ink bg-paper">
        <div className="page flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-2.5 xl:items-end xl:py-3">
          {/* Com os filtros recolhidos, o recorte em vigor fica escrito aqui. */}
          <p className="numerals min-w-0 flex-1 basis-0 text-sm xl:hidden" data-aguarda-consulta>
            <span className="eyebrow mr-2 text-ink-soft">Recorte</span>
            <span className="font-semibold">{periodoTexto}</span> · {categoriasTexto}
          </p>
          <button
            type="button"
            aria-expanded={filtersOpen}
            aria-controls="filtros-da-comparacao"
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex h-11 shrink-0 items-center gap-2 border border-ink-faint px-3 text-sm font-medium aria-expanded:bg-ink aria-expanded:text-paper xl:hidden"
          >
            Filtros
            {filtrado && (
              <>
                <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
                <span className="sr-only">(ativos)</span>
              </>
            )}
          </button>

          <div
            id="filtros-da-comparacao"
            data-aguarda-consulta
            className={`w-full flex-wrap items-end gap-x-8 gap-y-3 xl:flex xl:w-auto ${filtersOpen ? "flex" : "hidden"}`}
          >
            <PeriodControl
              domain={escala}
              periodo={state.periodo}
              onChange={(de, ate) => dispatch({ type: "setPeriod", de, ate })}
            />
            <CategoryFilter
              selected={state.categorias}
              counts={contagem}
              onToggle={(categoria) => dispatch({ type: "toggleCategory", categoria })}
              onClear={() => dispatch({ type: "clearCategories" })}
            />
            {/* Em tela larga, "Limpar filtros" fica na linha dos rótulos: a barra
                não muda de altura quando ele aparece. */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 xl:flex-col xl:items-start xl:gap-y-1.5">
              <span className="hidden h-4 items-center xl:flex">
                {filtrado && (
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "clearFilters" })}
                    className={`-my-1 py-1 text-xs ${reset}`}
                  >
                    Limpar filtros
                  </button>
                )}
              </span>
              <CopyLink path={comparisonHref(recorte)} />
              {filtrado && (
                <button
                  type="button"
                  onClick={() => dispatch({ type: "clearFilters" })}
                  className={`min-h-11 text-sm xl:hidden ${reset}`}
                >
                  Limpar filtros
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* O que mudou, para quem ouve a página. Só o recorte: nenhuma quantidade lado a lado. */}
      <p className="sr-only" aria-live="polite">
        Recorte da comparação: {periodoTexto}, {categoriasTexto}.
      </p>

      <div className="relative">
        {/* Link com consulta: o aviso fica sobre o lugar das trajetórias até o endereço ser lido. */}
        <p
          data-consulta-aviso
          role="status"
          className="pointer-events-none absolute inset-x-0 top-10 px-[var(--atlas-gutter)] text-center text-sm text-ink-soft"
        >
          Abrindo a consulta do endereço…
        </p>

      <div className="page space-y-8 py-6 md:space-y-10 md:py-8" data-aguarda-consulta>
        <section ref={lanes} aria-labelledby="titulo-faixas" className="space-y-3">
          <h2 id="titulo-faixas" className="sr-only">
            Linha do tempo das trajetórias
          </h2>
          <TrajectoryLanes
            domain={escala}
            dataDeCorte={dataDeCorte}
            periodo={state.periodo}
            hrefOf={hrefOf}
            lanes={cobertos.map(({ trajetoria, coberto }) => {
              const todos = filterEvents(data, { pessoaIds: [trajetoria.pessoa.id] });
              const noRecorte = new Set(trajetoria.acontecimentos.map((item) => item.id));
              return {
                pessoa: trajetoria.pessoa,
                acontecimentos: todos,
                foraDoRecorte: new Set(todos.filter((item) => !noRecorte.has(item.id)).map((item) => item.id)),
                mandatos: data.conjunto.mandatos.filter((item) => item.pessoaId === trajetoria.pessoa.id),
                filiacoes: data.conjunto.filiacoes.filter((item) => item.pessoaId === trajetoria.pessoa.id),
                coberto,
                lacunas: listGaps(data, trajetoria.pessoa.id),
              };
            })}
          />
        </section>

        {/* As faixas vêm antes: são a comparação. O que elas não dizem sozinhas fica
            logo abaixo, antes das colunas de cada pessoa. */}
        <section aria-labelledby="titulo-leitura" className="max-w-4xl space-y-2 text-sm">
          <h2 id="titulo-leitura" className={sectionTitle}>
            Como ler esta comparação
          </h2>
          <ul className="grid gap-x-8 gap-y-2 md:grid-cols-2">
            <li>
              <strong className="font-semibold">Mesmo recorte.</strong> O período ({periodoTexto}) e as
              categorias valem para as duas trajetórias, na mesma escala de anos.
            </li>
            <li>
              <strong className="font-semibold">Cargos diferentes.</strong> Cada pessoa aparece com os
              cargos e as funções que tinha em cada época, com as datas de cada um. A tela não
              equipara um cargo a outro.
            </li>
            <li data-leitura="cobertura">
              <strong className="font-semibold">Cobertura diferente.</strong> A edição cobre{" "}
              {cobertos
                .map(({ trajetoria }) =>
                  trajetoria.cobertura === null
                    ? `${trajetoria.pessoa.nome} sem período declarado`
                    : `${trajetoria.pessoa.nome} ${formatPeriod(trajetoria.cobertura.periodo)}`,
                )
                .join(" e ")}
              .
              {semCobertura.map(({ trajetoria, coberto }) => (
                <span key={trajetoria.pessoa.id}>
                  {" "}
                  De {anos.de} a {Math.min(anos.ate, coberto!.de - 1)}, a trajetória de{" "}
                  {trajetoria.pessoa.nome} está fora da cobertura: não foi pesquisada.
                </span>
              ))}
            </li>
            <li>
              <strong className="font-semibold">Acervo, e não desempenho.</strong> A quantidade de
              acontecimentos é a do acervo desta edição, que seleciona de 15 a 20 por pessoa. Ela não
              mede atividade nem importância, e a tela não soma, não ordena e não dá nota.
            </li>
          </ul>
        </section>

        {/* Em tela estreita as colunas ficam uma abaixo da outra: o atalho leva a cada uma. */}
        <nav aria-label="Trajetórias nesta página" className="lg:hidden">
          <ul className="flex flex-wrap gap-1.5">
            {trajetorias.map(({ pessoa }) => (
              <li key={pessoa.id}>
                <a
                  href={`#${columnId(pessoa.slug)}`}
                  className="flex min-h-11 items-center border border-line-strong bg-raised px-3 text-sm no-underline hover:border-ink"
                >
                  {pessoa.nome}
                  <span aria-hidden="true">&nbsp;↓</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Uma coluna por pessoa, com as mesmas seções na mesma ordem. Em tela
            larga as seções das duas ficam na mesma altura, para a leitura paralela. */}
        <div className="grid gap-x-10 gap-y-12 lg:grid-cols-2 lg:gap-y-7">
          {cobertos.map(({ trajetoria, coberto, lacunas }) => (
            <PersonColumn
              key={trajetoria.pessoa.id}
              data={data}
              trajetoria={trajetoria}
              compartilhados={compartilhados}
              recorte={recorte}
              anos={anos}
              periodoTexto={periodoTexto}
              coberto={coberto}
              lacunas={lacunas}
              hrefOf={hrefOf}
            />
          ))}
        </div>

        {/* As decisões por tema: o mesmo tema, lado a lado, com a instituição e o cargo de cada decisão à vista. Não entra no recorte de anos. */}
        <section id="decisoes" aria-labelledby="titulo-decisoes" className="space-y-5 border-t border-ink pt-8" data-secao="decisoes" data-quantas={totalDeDecisoes}>
          <div className="max-w-3xl space-y-2">
            <p className="eyebrow text-ink-soft">Decisões documentadas, por tema</p>
            <h2 id="titulo-decisoes" className="font-serif text-[2rem] font-medium leading-none tracking-tight md:text-4xl">
              Votos e atos no mesmo tema
            </h2>
            <p className="text-sm text-ink-soft" data-aviso-amostra>
              {SAMPLE_NOTICE} Esta seção não segue o recorte de anos acima: mostra a amostra inteira da edição.
            </p>
          </div>
          <DecisionsByTheme colunas={colunasDeDecisoes} headingLevel={3} hrefOf={decisionHref} />
        </section>
      </div>
      </div>
    </>
  );
}

interface PeriodRecordsProps {
  data: AtlasData;
  mandatos: Trajectory["mandatos"];
  filiacoes: Trajectory["filiacoes"];
  periodoTexto: string;
}

/** As duas listas trazem os mesmos registros, com a mesma situação? */
const sameRecords = (
  a: readonly { registro: unknown; situacao: string }[],
  b: readonly { registro: unknown; situacao: string }[],
) => a.length === b.length && a.every((item, i) => item.registro === b[i]?.registro && item.situacao === b[i]?.situacao);

/**
 * Cargos e partidos de uma pessoa no período, com as fontes de cada registro.
 * Só dependem do período: marcar ou desmarcar uma categoria não os refaz.
 */
const PeriodRecords = memo(
  function PeriodRecords({ data, mandatos, filiacoes, periodoTexto }: PeriodRecordsProps) {
    const sourcesOf = (registro: Parameters<typeof getSources>[1]) => getSources(data, registro);
    return (
      <>
        <section className="space-y-2" data-secao="cargos">
          <h3 className={sectionTitle}>Cargos e funções em {periodoTexto}</h3>
          <MandateList
            itens={mandatos}
            emptyText="Nenhum cargo ou função cadastrado neste período."
            sourcesOf={sourcesOf}
          />
        </section>

        <section className="space-y-2" data-secao="partidos">
          <h3 className={sectionTitle}>Partidos em {periodoTexto}</h3>
          <AffiliationList
            itens={filiacoes}
            emptyText="Nenhuma filiação cadastrada neste período."
            sourcesOf={sourcesOf}
          />
        </section>
      </>
    );
  },
  (antes, depois) =>
    antes.data === depois.data &&
    antes.periodoTexto === depois.periodoTexto &&
    sameRecords(antes.mandatos, depois.mandatos) &&
    sameRecords(antes.filiacoes, depois.filiacoes),
);

interface PersonColumnProps {
  data: AtlasData;
  trajetoria: Trajectory;
  compartilhados: readonly string[];
  recorte: Recorte;
  /** O período consultado, com os dois lados preenchidos. */
  anos: YearSpan;
  periodoTexto: string;
  coberto: YearSpan | null;
  /** Lacunas da pessoa dentro do período consultado. */
  lacunas: readonly YearSpan[];
  hrefOf: (item: Acontecimento) => string;
}

function PersonColumn({
  data,
  trajetoria,
  compartilhados,
  recorte,
  anos,
  periodoTexto,
  coberto,
  lacunas,
  hrefOf,
}: PersonColumnProps) {
  const { pessoa, acontecimentos, mandatos, filiacoes, cobertura } = trajetoria;
  const antesDaCobertura = coberto !== null && anos.de < coberto.de;
  // Os documentos que sustentam o que a coluna mostra, sem repetição.
  const documentos = listSourcesOf(data, [
    ...acontecimentos,
    ...mandatos.map((item) => item.registro),
    ...filiacoes.map((item) => item.registro),
  ]);

  return (
    <section
      id={columnId(pessoa.slug)}
      aria-labelledby={`${columnId(pessoa.slug)}-nome`}
      data-trajetoria={pessoa.slug}
      className="grid scroll-mt-20 gap-y-7 lg:row-span-6 lg:grid-rows-subgrid"
    >
      <header className="grid grid-cols-[4rem_minmax(0,1fr)] items-end gap-4 border-b border-ink pb-3">
        <Portrait
          nome={pessoa.nome}
          imagem={getImage(data, pessoa.retratoId)}
          shape="quadrado"
          sizes="64px"
          decorative
        />
        <div className="space-y-1">
          <h2
            id={`${columnId(pessoa.slug)}-nome`}
            className="font-serif text-3xl font-medium leading-none tracking-tight"
          >
            {pessoa.nome}
          </h2>
          <p className="text-sm">
            <Link
              href={explorationHref(pessoa.slug, {
                ...carryFromComparison(recorte, coberto),
                acontecimento: null,
              })}
              prefetch={false}
              className="inline-flex min-h-11 items-center underline decoration-line-strong hover:decoration-ink lg:min-h-0"
            >
              Explorar esta trajetória no mesmo recorte
            </Link>
          </p>
        </div>
      </header>

      <section className="space-y-2" data-secao="cobertura">
        <h3 className={sectionTitle}>Cobertura desta edição</h3>
        <div className="space-y-1.5 text-sm">
          <p className="numerals">
            {cobertura === null ? "A edição não declara o período coberto." : formatPeriod(cobertura.periodo)}
          </p>
          {cobertura?.observacao !== undefined && <p className="text-ink-soft">{cobertura.observacao}</p>}
          {antesDaCobertura && coberto !== null && (
            <p className={note}>
              De {anos.de} a {Math.min(anos.ate, coberto.de - 1)}, o atlas não cobre esta trajetória.
              Não há registro porque o período não foi pesquisado.
            </p>
          )}
          {lacunas.length > 0 && (
            <p className={note}>
              Sem acontecimentos cadastrados em{" "}
              <span className="numerals">
                {lacunas.map((item) => formatYearRange(item.de, item.ate)).join("; ")}
              </span>
              . São lacunas da pesquisa, e não ausência de atividade.
            </p>
          )}
        </div>
      </section>

      <PeriodRecords data={data} mandatos={mandatos} filiacoes={filiacoes} periodoTexto={periodoTexto} />

      <section className="space-y-2" data-secao="acontecimentos">
        <h3 className={sectionTitle}>
          Acontecimentos em {periodoTexto}{" "}
          <span className="numerals font-medium normal-case tracking-normal">
            · {count(acontecimentos.length, "cadastrado", "cadastrados")}
          </span>
        </h3>
        <EventLinkList
          items={acontecimentos}
          shared={compartilhados}
          hrefOf={hrefOf}
          emptyMessage={
            <div className="space-y-1">
              <p className="font-medium text-ink">Nenhum acontecimento cadastrado neste recorte.</p>
              <p>Isso indica falta de registro nesta edição, e não falta de atividade pública.</p>
            </div>
          }
        />
      </section>

      <section className="space-y-2" data-secao="fontes">
        <h3 className={sectionTitle}>Fontes deste recorte</h3>
        {documentos.length === 0 ? (
          <p className="text-sm text-ink-soft">Nenhum registro neste recorte, e portanto nenhuma fonte.</p>
        ) : (
          <details className="group/doc text-sm">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 border-y border-line py-2 hover:bg-raised [&::-webkit-details-marker]:hidden">
              <span>
                {count(documentos.length, "documento sustenta", "documentos sustentam")} os registros
                desta coluna
              </span>
              <span
                aria-hidden="true"
                className="shrink-0 text-ink-soft transition-transform duration-[var(--atlas-fast)] group-open/doc:rotate-180"
              >
                ▾
              </span>
            </summary>
            <SourceCatalog entries={documentos} className="border-t-0" />
          </details>
        )}
        <p className="text-xs text-ink-soft">
          A fonte de cada acontecimento, com o trecho que o sustenta, está na página dele. As de
          cargos e partidos abrem junto de cada registro.
        </p>
      </section>
    </section>
  );
}
