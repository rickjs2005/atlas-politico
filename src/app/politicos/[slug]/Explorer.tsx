"use client";

// Exploração de uma trajetória: contexto da pessoa, recorte, lista, mapa,
// linha do tempo e painel de leitura, todos lendo o mesmo estado.
//
// A composição muda com a largura (docs/UX.md):
//   estreita  uma vista por vez: lista, mapa ou leitura;
//   média     lista ou leitura à esquerda; mapa e linha do tempo à direita;
//   larga     lista, mapa com linha do tempo e painel, lado a lado.
// O HTML é um só. Quem decide o que aparece em cada largura é o CSS, a partir
// de dois atributos calculados aqui: `data-pane` e `data-side`.

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { DateMark } from "@/components/DateMark";
import { Portrait } from "@/components/Portrait";
import { ProfilePanel } from "@/components/ProfilePanel";
import { EventList, eventItemId, noPointNote } from "@/features/events/EventList";
import { EventPanel } from "@/features/events/EventPanel";
import { MapView } from "@/features/map/MapView";
import { CategoryFilter } from "@/features/timeline/CategoryFilter";
import { PeriodControl } from "@/features/timeline/PeriodControl";
import { Timeline } from "@/features/timeline/Timeline";
import { getCoverage, getCoveredSpan, getCutYear } from "@/lib/data/coverage";
import { filterPoints } from "@/lib/data/points";
import {
  filterEvents,
  getEventView,
  getImage,
  getSources,
  listMandatesAt,
} from "@/lib/data/queries";
import type { AtlasData } from "@/lib/data/types";
import { CATEGORIAS, CATEGORY_LABELS, type Categoria } from "@/lib/domain/categories";
import type { Pessoa } from "@/lib/domain/types";
import { AtlasStateProvider, useAtlas } from "@/lib/state/AtlasStateProvider";
import { INITIAL_STATE } from "@/lib/state/atlas-state";
import { parseAtlasParams } from "@/lib/state/url-params";

type Tab = "lista" | "mapa" | "perfil";

interface ExplorerProps {
  /** Dados já recortados para esta pessoa. */
  data: AtlasData;
  pessoaId: string;
  /** Os outros perfis do atlas, para a troca de pessoa. */
  others: readonly { slug: string; nome: string }[];
}

export function Explorer({ data, pessoaId, others }: ExplorerProps) {
  const pessoa = data.conjunto.pessoas.find((item) => item.id === pessoaId);
  if (!pessoa) return null;

  return (
    <AtlasStateProvider data={data} initialState={{ ...INITIAL_STATE, pessoa: pessoa.slug }}>
      <Workspace pessoa={pessoa} others={others} />
    </AtlasStateProvider>
  );
}

const TABS: { id: Tab; label: string; className: string }[] = [
  { id: "lista", label: "Lista", className: "" },
  { id: "mapa", label: "Mapa", className: "md:hidden" },
  { id: "perfil", label: "Perfil", className: "" },
];

const tabId = (tab: Tab) => `vista-${tab}`;
const isWide = () => window.matchMedia("(min-width: 80rem)").matches;
const isNarrow = () => !window.matchMedia("(min-width: 48rem)").matches;

// A query string é lida uma vez, na chegada: nesta fase nada a altera depois.
const subscribeToNothing = () => () => {};
const readSearch = () => window.location.search;

/** Leva o foco a um elemento depois que a tela termina de mudar. */
function focusAfterRender(target: () => HTMLElement | null) {
  requestAnimationFrame(() => target()?.focus());
}

function Workspace({ pessoa, others }: { pessoa: Pessoa; others: ExplorerProps["others"] }) {
  const { state, dispatch, data, visible, selected } = useAtlas();
  const [tab, setTab] = useState<Tab>("lista");
  // `null`: a pessoa ainda não abriu nem fechou nada nesta visita.
  const [readingChoice, setReading] = useState<boolean | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const focusTitle = () => focusAfterRender(() => titleRef.current);

  // Chegada por um endereço com recorte, como o link de volta da página de um
  // acontecimento. Na página gerada no build não há query string: o navegador
  // a entrega depois, e o recorte é restaurado a partir dela. A escrita do
  // estado no endereço e o histórico são da fase 5.
  const search = useSyncExternalStore(subscribeToNothing, readSearch, () => "");
  const arrival = useMemo(() => parseAtlasParams(new URLSearchParams(search)), [search]);
  useEffect(() => {
    const informado =
      arrival.acontecimento !== null ||
      arrival.categorias.length > 0 ||
      arrival.periodo.de !== null ||
      arrival.periodo.ate !== null;
    if (informado) {
      dispatch({ type: "restore", state: { ...INITIAL_STATE, pessoa: pessoa.slug, ...arrival } });
    }
  }, [arrival, dispatch, pessoa.slug]);

  // Quem chega com um acontecimento no endereço chega lendo.
  const reading = readingChoice ?? arrival.acontecimento !== null;
  const lendo = reading && selected !== null;
  const pane = lendo || tab === "perfil" ? "leitura" : tab;
  const side = pane === "leitura" ? "leitura" : "lista";
  // Selecionado sem estar em leitura: só acontece na vista do mapa em tela estreita.
  const cartao = selected !== null && !lendo;

  const dominio = useMemo(() => {
    const coberto = getCoveredSpan(data, pessoa.id);
    const corte = getCutYear(data) ?? new Date().getFullYear();
    return coberto ?? { de: corte - 10, ate: corte };
  }, [data, pessoa.id]);

  const todos = useMemo(() => filterEvents(data, { pessoaIds: [pessoa.id] }), [data, pessoa.id]);
  const contagem = useMemo(() => {
    const noPeriodo = filterEvents(data, { pessoaIds: [pessoa.id], periodo: state.periodo });
    return Object.fromEntries(
      CATEGORIAS.map((categoria) => [
        categoria,
        noPeriodo.filter((item) => item.categoria === categoria).length,
      ]),
    ) as Record<Categoria, number>;
  }, [data, pessoa.id, state.periodo]);

  const pontos = useMemo(() => filterPoints(data.pontos, visible), [data.pontos, visible]);
  const comPonto = useMemo(
    () => new Set(pontos.features.map((ponto) => ponto.properties.eventId)).size,
    [pontos],
  );

  const mandatos = data.conjunto.mandatos.filter((item) => item.pessoaId === pessoa.id);
  const filiacoes = data.conjunto.filiacoes.filter((item) => item.pessoaId === pessoa.id);
  const retrato = getImage(data, pessoa.retratoId);
  const dataDeCorte = data.conjunto.edicao?.dataDeCorte ?? null;

  const filtrado =
    state.categorias.length > 0 || state.periodo.de !== null || state.periodo.ate !== null;
  const periodoTexto = `${state.periodo.de ?? dominio.de}–${state.periodo.ate ?? dominio.ate}`;
  const categoriasTexto =
    state.categorias.length === 0
      ? "todas as categorias"
      : state.categorias.map((categoria) => CATEGORY_LABELS[categoria].toLowerCase()).join(", ");

  // Abrir pela lista ou pela linha do tempo leva à leitura. Em tela larga o
  // painel já está ao lado, e o foco fica onde a pessoa está.
  //
  // Na vista do mapa em tela estreita, a seleção mostra um cartão sobre o
  // mapa, venha ela de um ponto ou de uma marca da linha do tempo: sair do
  // mapa a cada toque faria a pessoa perder o lugar.
  const openEvent = (slug: string | null, origem: "lista" | "tempo" | "mapa" = "lista") => {
    dispatch({ type: "selectEvent", slug });
    const noMapaEstreito = isNarrow() && (origem === "mapa" || (origem === "tempo" && tab === "mapa"));
    if (slug === null || noMapaEstreito) {
      setReading(false);
      return;
    }
    setReading(true);
    if (!isWide()) focusTitle();
  };

  const closeEvent = () => {
    const slug = state.acontecimento;
    dispatch({ type: "selectEvent", slug: null });
    setReading(false);
    // O foco volta para onde a leitura começou: o item da lista ou a vista do mapa.
    if (slug !== null) {
      const id = tab === "mapa" && isNarrow() ? tabId("mapa") : eventItemId(slug);
      focusAfterRender(() => document.getElementById(id));
    }
  };

  const chooseTab = (next: Tab) => {
    setTab(next);
    setReading(false);
    // "Perfil" mostra o resumo da pessoa: o acontecimento aberto é fechado.
    if (next === "perfil") dispatch({ type: "selectEvent", slug: null });
  };

  const clearFilters = () => {
    dispatch({ type: "setPeriod", de: null, ate: null });
    dispatch({ type: "clearCategories" });
  };

  return (
    <div
      data-pane={pane}
      data-side={side}
      // Na vista do mapa em tela estreita, a área ocupa a tela abaixo do
      // cabeçalho: o mapa cabe inteiro e o toque nele não disputa com a rolagem.
      className="group/x flex flex-1 flex-col max-md:data-[pane=mapa]:min-h-[calc(100dvh_-_var(--atlas-header-h))] md:h-[calc(100dvh_-_var(--atlas-header-h))] md:min-h-[40rem] md:flex-none"
    >
      <h1 className="sr-only">Trajetória de {pessoa.nome}</h1>

      {/* Contexto: quem, quando e o quê. Em tela estreita, fica preso ao topo. */}
      <section
        aria-label="Recorte"
        className="sticky top-0 z-20 grid border-b border-ink bg-paper max-xl:grid-cols-[minmax(0,1fr)_auto] max-xl:items-center max-xl:gap-x-3 max-xl:px-[var(--atlas-gutter)] max-xl:py-2.5 md:static xl:grid-cols-[22rem_minmax(0,1fr)]"
      >
        {/* Quem. Em tela larga ocupa a coluna da lista, e o nome fica sobre os acontecimentos. */}
        <div className="flex min-w-0 items-center gap-3 xl:border-r xl:border-line xl:px-3 xl:py-3">
          <Portrait
            nome={pessoa.nome}
            imagem={retrato}
            shape="quadrado"
            sizes="56px"
            decorative
            className="w-10 shrink-0 md:w-14"
          />
          <div className="min-w-0">
            <p className="eyebrow text-ink-soft">Trajetória</p>
            <p className="truncate font-serif text-2xl font-medium leading-tight tracking-tight md:text-[1.75rem]">
              {pessoa.nome}
            </p>
            {/* Com os filtros recolhidos, o recorte em vigor fica escrito aqui. */}
            <p className="numerals truncate text-xs text-ink-soft xl:hidden">
              {periodoTexto} · {categoriasTexto}
            </p>
            <ul className="hidden gap-x-3 text-xs xl:flex">
              {others.map((outro) => (
                <li key={outro.slug}>
                  <Link
                    href={`/politicos/${outro.slug}`}
                    className="text-ink-soft underline decoration-line-strong hover:text-ink hover:decoration-ink"
                  >
                    Ver {outro.nome}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <button
          type="button"
          aria-expanded={filtersOpen}
          aria-controls="filtros"
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="flex h-11 items-center gap-2 border border-ink-faint px-3 text-sm font-medium aria-expanded:bg-ink aria-expanded:text-paper xl:hidden"
        >
          Filtros
          {filtrado && (
            <>
              <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
              <span className="sr-only">(ativos)</span>
            </>
          )}
        </button>

        {/* Quando e o quê. */}
        <div
          id="filtros"
          className={`flex-wrap items-end gap-x-8 gap-y-3 max-xl:col-span-2 max-xl:pt-3 xl:flex xl:px-4 xl:py-3 ${
            filtersOpen ? "flex" : "hidden"
          }`}
        >
          <PeriodControl
            domain={dominio}
            periodo={state.periodo}
            onChange={(de, ate) => dispatch({ type: "setPeriod", de, ate })}
          />
          <CategoryFilter
            selected={state.categorias}
            counts={contagem}
            onToggle={(categoria) => dispatch({ type: "toggleCategory", categoria })}
            onClear={() => dispatch({ type: "clearCategories" })}
          />
        </div>
      </section>

      {/* Alternância de vistas: só onde as três não cabem lado a lado. */}
      <div
        role="group"
        aria-label="Vista"
        className="grid grid-cols-3 border-b border-line md:grid-cols-2 md:max-w-[22rem] xl:hidden"
      >
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            id={tabId(item.id)}
            aria-pressed={!lendo && tab === item.id}
            onClick={() => chooseTab(item.id)}
            className={`h-11 border-b-2 border-transparent text-sm font-medium text-ink-soft aria-pressed:border-ink aria-pressed:text-ink ${item.className}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <p className="sr-only" aria-live="polite">
        {selected ? `Aberto: ${selected.titulo}` : ""}
      </p>

      <div className="explorer-grid min-h-0 flex-1">
        {/* Linha do tempo */}
        <section
          aria-labelledby="titulo-tempo"
          className="explorer-tempo order-1 border-b border-line bg-raised pb-2 max-md:group-data-[pane=leitura]/x:hidden md:border-b-0 md:border-t md:border-ink"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 px-3 pt-2">
            <h2 id="titulo-tempo" className="eyebrow whitespace-nowrap text-ink-soft">
              Linha do tempo
            </h2>
            <p className="numerals whitespace-nowrap text-xs text-ink-soft">
              {visible.length} {visible.length === 1 ? "acontecimento" : "acontecimentos"} ·{" "}
              {comPonto} com ponto no mapa
            </p>
          </div>
          <Timeline
            domain={dominio}
            allEvents={todos}
            visible={visible}
            selectedSlug={state.acontecimento}
            onSelect={(slug) => openEvent(slug, "tempo")}
            periodo={state.periodo}
            lanes={[
              {
                rotulo: "Cargos e funções",
                itens: mandatos.map((item) => ({
                  id: item.id,
                  rotulo: item.cargo,
                  descricao: `${item.cargo}, ${item.instituicao}`,
                  periodo: item.periodo,
                })),
              },
              {
                rotulo: "Partidos",
                itens: filiacoes.map((item) => ({
                  id: item.id,
                  rotulo: item.partido.sigla,
                  descricao: `${item.partido.sigla} (${item.partido.nome})`,
                  periodo: item.periodo,
                })),
              },
            ]}
            dataDeCorte={dataDeCorte}
            label={`Linha do tempo de ${pessoa.nome}`}
          />
        </section>

        {/* Lista */}
        <section
          aria-labelledby="titulo-lista"
          // `relative`: o texto só para leitor de tela é posicionado de forma
          // absoluta; sem isso ele escapa da área com rolagem e estica a página.
          className="explorer-lista relative order-2 hidden min-h-0 overflow-y-auto border-line max-md:group-data-[pane=lista]/x:block md:border-r md:max-xl:group-data-[side=lista]/x:block xl:block"
        >
          <h2 id="titulo-lista" className="eyebrow sticky top-0 z-10 bg-paper px-3 pb-2 pt-3 text-ink-soft max-md:static">
            Acontecimentos
          </h2>
          <EventList
            items={visible}
            selectedSlug={state.acontecimento}
            onSelect={openEvent}
            emptyMessage={
              <div className="space-y-2 px-3">
                <p className="font-medium text-ink">Nenhum registro do atlas neste recorte.</p>
                <p>
                  Isso indica falta de registro nesta edição, e não falta de atividade pública no
                  período.
                </p>
                {filtrado && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="min-h-11 font-medium text-ink underline decoration-line-strong hover:decoration-ink"
                  >
                    Limpar período e categorias
                  </button>
                )}
              </div>
            }
          />
        </section>

        {/* Mapa */}
        <section
          aria-labelledby="titulo-mapa"
          className="explorer-mapa relative order-2 hidden min-h-0 max-md:min-h-80 max-md:flex-1 max-md:group-data-[pane=mapa]/x:block md:block"
        >
          <h2 id="titulo-mapa" className="sr-only">
            Mapa
          </h2>
          {/* Em tela estreita o mapa ocupa o que sobra da altura da tela. */}
          <div className="h-full max-md:absolute max-md:inset-0">
            <MapView
              features={pontos}
              selectedSlug={state.acontecimento}
              onSelect={(slug) => openEvent(slug, "mapa")}
              // O cartão do acontecimento cobre a parte de baixo do mapa.
              bottomInset={cartao ? 150 : 0}
            />
          </div>

          {/* Cartão do acontecimento selecionado, só no mapa em tela estreita. */}
          {selected && cartao && (
            <div className="absolute inset-x-2 bottom-2 z-10 animate-enter border border-ink bg-raised p-3 shadow-[0_8px_24px_-12px_rgb(0_0_0/0.4)] md:hidden">
              <div className="grid grid-cols-[4.25rem_minmax(0,1fr)] gap-x-3">
                <DateMark data={selected.data} />
                <div className="min-w-0">
                  <p className="font-serif text-[1.0625rem] font-medium leading-snug">{selected.titulo}</p>
                  {noPointNote(selected) !== null && (
                    <p className="mt-1 text-xs italic text-ink-soft">{noPointNote(selected)}</p>
                  )}
                </div>
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setReading(true);
                    focusTitle();
                  }}
                  className="h-11 flex-1 bg-ink px-4 text-sm font-medium text-paper"
                >
                  Ler
                </button>
                <button
                  type="button"
                  onClick={closeEvent}
                  className="h-11 border border-ink-faint px-4 text-sm font-medium"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Painel de leitura */}
        <section
          aria-labelledby="titulo-painel"
          className="explorer-painel relative order-2 hidden min-h-0 overflow-y-auto border-line bg-raised px-[var(--atlas-gutter)] py-5 max-md:group-data-[pane=leitura]/x:block md:border-r md:px-5 md:max-xl:group-data-[side=leitura]/x:block xl:block xl:border-l xl:border-r-0"
          // Esc fecha a leitura quando o foco está nela.
          onKeyDown={(evento) => {
            if (evento.key === "Escape" && selected !== null) closeEvent();
          }}
        >
          <h2 id="titulo-painel" className="sr-only">
            Leitura
          </h2>
          {selected ? (
            <EventPanel
              event={getEventView(data, selected)}
              headingLevel={3}
              // No painel só entram os cargos que as datas provam; os de período
              // incerto ficam no perfil, com o aviso.
              roles={listMandatesAt(data, pessoa.id, selected.data).filter(
                (item) => item.situacao === "documentada",
              )}
              image={getImage(data, selected.imagemId)}
              href={`/acontecimentos/${selected.slug}`}
              onClose={closeEvent}
              titleRef={titleRef}
            />
          ) : (
            <ProfilePanel
              pessoa={pessoa}
              retrato={retrato}
              mandatos={mandatos}
              filiacoes={filiacoes}
              cobertura={getCoverage(data, pessoa.id)}
              fontes={getSources(data, pessoa)}
              headingLevel={3}
            />
          )}
        </section>
      </div>
    </div>
  );
}
