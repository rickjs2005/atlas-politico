"use client";

// Exploração de uma trajetória: contexto da pessoa, recorte, lista, mapa,
// linha do tempo e painel de leitura, todos lendo o mesmo estado.
//
// O estado (período, categorias e acontecimento aberto) fica no endereço:
// abrir um link, recarregar, voltar e avançar restauram a mesma consulta
// (docs/TIMELINE.md). O que é só apresentação fica aqui: a vista ativa, se a
// leitura está aberta e se os filtros estão à vista.
//
// A composição muda com a largura (docs/UX.md):
//   estreita  uma vista por vez: lista, mapa ou leitura;
//   média     lista ou leitura à esquerda; mapa e linha do tempo à direita;
//   larga     lista, mapa com linha do tempo e painel, lado a lado.
// O HTML é um só. Quem decide o que aparece em cada largura é o CSS, a partir
// de dois atributos calculados aqui: `data-pane` e `data-side`.

import Link from "next/link";
import { useMemo, useRef, useState } from "react";

import { CopyLink } from "@/components/CopyLink";
import { DateMark } from "@/components/DateMark";
import { PersonSwitch } from "@/components/PersonSwitch";
import { Portrait } from "@/components/Portrait";
import { ProfilePanel } from "@/components/ProfilePanel";
import { EventList, eventItemId, noPointNote } from "@/features/events/EventList";
import { EventPanel } from "@/features/events/EventPanel";
import { clipGaps } from "@/features/events/chronology";
import { MapView } from "@/features/map/MapView";
import { CategoryFilter } from "@/features/timeline/CategoryFilter";
import { PeriodContext } from "@/features/timeline/PeriodContext";
import { PeriodControl } from "@/features/timeline/PeriodControl";
import { Timeline } from "@/features/timeline/Timeline";
import { getCoverage, getCoveredSpan, getCutYear, listGaps, type YearSpan } from "@/lib/data/coverage";
import { filterPoints, listUnplaced } from "@/lib/data/points";
import {
  filterEvents,
  getEventView,
  getImage,
  getSources,
  listAffiliations,
  listMandates,
  listMandatesAt,
} from "@/lib/data/queries";
import type { AtlasData } from "@/lib/data/types";
import { CATEGORIAS, CATEGORY_LABELS, type Categoria } from "@/lib/domain/categories";
import { formatDate, formatYearRange } from "@/lib/domain/dates";
import type { Pessoa } from "@/lib/domain/types";
import { useAtlas } from "@/lib/state/AtlasStateProvider";
import { AtlasUrlStateProvider } from "@/lib/state/AtlasUrlStateProvider";
import { hasFilters, type AtlasAction } from "@/lib/state/atlas-state";
import { carryToComparison, comparisonHref, eventHref, explorationHref } from "@/lib/state/links";
import { transition } from "@/lib/state/selectors";
import { serializeAtlasParams } from "@/lib/state/url-params";
import { carryToPerson } from "@/lib/state/url-state";

type Tab = "lista" | "mapa" | "perfil";

/** Um perfil do atlas, como a troca de pessoa precisa dele. */
export interface ProfileLink {
  slug: string;
  nome: string;
  /** `id` da pessoa no conjunto; `null` enquanto o perfil não tem registros. */
  id: string | null;
  /** Anos que a edição cobre para a pessoa. */
  cobertura: YearSpan | null;
}

interface ExplorerProps {
  /** Dados já recortados para esta pessoa. */
  data: AtlasData;
  pessoaId: string;
  /** Todos os perfis do atlas, na ordem da interface. */
  profiles: readonly ProfileLink[];
}

const pathOf = (slug: string) => `/politicos/${slug}`;

export function Explorer({ data, pessoaId, profiles }: ExplorerProps) {
  const pessoa = data.conjunto.pessoas.find((item) => item.id === pessoaId);
  // Anos que podem ser consultados: a cobertura da edição para a pessoa.
  const dominio = useMemo(() => {
    const coberto = getCoveredSpan(data, pessoaId);
    const corte = getCutYear(data) ?? new Date().getFullYear();
    return coberto ?? { de: corte - 10, ate: corte };
  }, [data, pessoaId]);

  if (!pessoa) return null;

  return (
    <AtlasUrlStateProvider
      // Outra pessoa é outra exploração: nada de apresentação é herdado.
      key={pessoa.id}
      data={data}
      pessoa={pessoa.slug}
      path={pathOf(pessoa.slug)}
      cobertura={dominio}
    >
      <Workspace pessoa={pessoa} dominio={dominio} profiles={profiles} />
    </AtlasUrlStateProvider>
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

/** Leva o foco a um elemento depois que a tela termina de mudar. */
function focusAfterRender(target: () => HTMLElement | null) {
  requestAnimationFrame(() => target()?.focus());
}

const reset = "font-medium text-ink-soft underline decoration-line-strong hover:text-ink";

interface WorkspaceProps {
  pessoa: Pessoa;
  dominio: YearSpan;
  profiles: ExplorerProps["profiles"];
}

function Workspace({ pessoa, dominio, profiles }: WorkspaceProps) {
  const { state, dispatch, data, visible, selected } = useAtlas();
  const [tab, setTab] = useState<Tab>("lista");
  // Acontecimento que está marcado mas com a leitura fechada: o cartão sobre o
  // mapa, em tela estreita, ou a seleção mantida ao trocar de vista. Fora
  // disso, quem está selecionado está sendo lido, inclusive ao chegar por um
  // endereço ou ao voltar no histórico.
  const [folded, setFolded] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  // O bloco de cargos e partidos do período começa recolhido, com o resumo à
  // vista: a lista de acontecimentos vem primeiro.
  const [contextOpen, setContextOpen] = useState(false);
  // A consulta em que uma mudança de recorte fechou o acontecimento que estava
  // aberto. O aviso vale enquanto a consulta for essa: some ao voltar no
  // histórico ou ao mudar o recorte de novo.
  const [droppedAt, setDroppedAt] = useState<string | null>(null);
  const dropped = droppedAt !== null && droppedAt === serializeAtlasParams(state);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const focusTitle = () => focusAfterRender(() => titleRef.current);

  const lendo = selected !== null && folded !== selected.slug;
  const pane = lendo || tab === "perfil" ? "leitura" : tab;
  const side = pane === "leitura" ? "leitura" : "lista";
  // Selecionado sem estar em leitura: o cartão sobre o mapa, em tela estreita.
  const cartao = selected !== null && !lendo;

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
  // Abrangência nacional ou lugar não documentado: o mapa dá acesso a eles sem inventar um ponto.
  const semPonto = useMemo(() => listUnplaced(visible), [visible]);

  const mandatos = data.conjunto.mandatos.filter((item) => item.pessoaId === pessoa.id);
  const filiacoes = data.conjunto.filiacoes.filter((item) => item.pessoaId === pessoa.id);
  const retrato = getImage(data, pessoa.retratoId);
  const dataDeCorte = data.conjunto.edicao?.dataDeCorte ?? null;

  // O período consultado, com os dois lados preenchidos.
  const recorte = useMemo(
    () => ({ de: state.periodo.de ?? dominio.de, ate: state.periodo.ate ?? dominio.ate }),
    [state.periodo, dominio],
  );
  const periodoAtivo = state.periodo.de !== null || state.periodo.ate !== null;
  const filtrado = hasFilters(state);
  const periodoTexto = formatYearRange(recorte.de, recorte.ate);
  const coberturaTexto = formatYearRange(dominio.de, dominio.ate);
  const categoriasTexto =
    state.categorias.length === 0
      ? "todas as categorias"
      : state.categorias.map((categoria) => CATEGORY_LABELS[categoria].toLowerCase()).join(", ");
  const registrosTexto = `${visible.length} ${visible.length === 1 ? "registro do atlas" : "registros do atlas"}`;

  // Cargos e partidos que tocam o período, e as lacunas do conjunto dentro dele.
  const noPeriodo = useMemo(
    () => ({
      mandatos: listMandates(data, { pessoaId: pessoa.id, periodo: state.periodo }),
      filiacoes: listAffiliations(data, { pessoaId: pessoa.id, periodo: state.periodo }),
      lacunas: clipGaps(listGaps(data, pessoa.id), recorte),
    }),
    [data, pessoa.id, state.periodo, recorte],
  );
  // O endereço desta consulta, com o recorte e a seleção: é o que "Copiar
  // link" entrega.
  const consulta = explorationHref(pessoa.slug, state);
  // A comparação no mesmo recorte. A escala dela é a soma das coberturas.
  const escala = useMemo(() => {
    const cobertos = profiles.flatMap((perfil) => (perfil.cobertura === null ? [] : [perfil.cobertura]));
    if (cobertos.length === 0) return null;
    return {
      de: Math.min(...cobertos.map((item) => item.de)),
      ate: Math.max(...cobertos.map((item) => item.ate)),
    };
  }, [profiles]);
  const comparacao = comparisonHref(carryToComparison(state, dominio, escala));

  // A troca de pessoa leva o recorte junto; o acontecimento aberto só segue
  // quando também é do outro perfil.
  const switchOptions = profiles.map((perfil) => {
    if (perfil.slug === pessoa.slug) return { slug: perfil.slug, nome: perfil.nome, href: null };
    const query =
      perfil.id === null
        ? ""
        : serializeAtlasParams(carryToPerson(state, selected, { id: perfil.id, cobertura: perfil.cobertura }));
    return {
      slug: perfil.slug,
      nome: perfil.nome,
      href: `${pathOf(perfil.slug)}/${query === "" ? "" : `?${query}`}`,
    };
  });

  /** Muda o recorte. Se o acontecimento aberto sair dele, a tela diz. */
  const applyFilter = (action: AtlasAction) => {
    const proximo = transition(state, action, data, dominio);
    const fechou = state.acontecimento !== null && proximo.acontecimento === null;
    setDroppedAt(fechou ? serializeAtlasParams(proximo) : null);
    dispatch(action);
  };

  const choosePeriod = (de: number, ate: number) => {
    // Clicar de novo no ano que já está escolhido desfaz o período.
    const mesmoAno = de === ate && recorte.de === de && recorte.ate === ate;
    applyFilter(mesmoAno ? { type: "setPeriod", de: null, ate: null } : { type: "setPeriod", de, ate });
  };

  const clearFilters = () => applyFilter({ type: "clearFilters" });

  // Abrir pela lista ou pela linha do tempo leva à leitura. Em tela larga o
  // painel já está ao lado, e o foco fica onde a pessoa está.
  //
  // Na vista do mapa em tela estreita, a seleção mostra um cartão sobre o
  // mapa, venha ela de um ponto ou de uma marca da linha do tempo: sair do
  // mapa a cada toque faria a pessoa perder o lugar.
  const openEvent = (slug: string | null, origem: "lista" | "tempo" | "mapa" = "lista") => {
    const noMapaEstreito = isNarrow() && (origem === "mapa" || (origem === "tempo" && tab === "mapa"));

    // O item está marcado, mas a leitura foi fechada ao trocar de vista:
    // acioná-lo de novo abre a leitura, em vez de desfazer a seleção.
    if (slug === null && selected !== null && folded === selected.slug && !noMapaEstreito && !isWide()) {
      setFolded(null);
      focusTitle();
      return;
    }

    setDroppedAt(null);
    dispatch({ type: "selectEvent", slug });
    if (slug === null) return;
    if (noMapaEstreito) {
      setFolded(slug);
      return;
    }
    setFolded(null);
    if (!isWide()) focusTitle();
  };

  const closeEvent = () => {
    const slug = state.acontecimento;
    dispatch({ type: "selectEvent", slug: null });
    // O foco volta para onde a leitura começou: o item da lista ou a vista do mapa.
    if (slug !== null) {
      const id = tab === "mapa" && isNarrow() ? tabId("mapa") : eventItemId(slug);
      focusAfterRender(() => document.getElementById(id));
    }
  };

  const chooseTab = (next: Tab) => {
    setTab(next);
    if (selected === null) return;
    // "Perfil" mostra o resumo da pessoa: o acontecimento aberto é fechado.
    // "Lista" e "Mapa" fecham a leitura e mantêm o acontecimento marcado.
    if (next === "perfil") dispatch({ type: "selectEvent", slug: null });
    else setFolded(selected.slug);
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
            <PersonSwitch options={switchOptions} size="compacto" className="mt-1 hidden xl:block" />
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

        {/* Quem (onde não cabe ao lado do nome), quando e o quê. */}
        <div
          id="filtros"
          className={`flex-wrap items-end gap-x-8 gap-y-3 max-xl:col-span-2 max-xl:pt-3 xl:flex xl:px-4 xl:py-3 ${
            filtersOpen ? "flex" : "hidden"
          }`}
        >
          <div className="max-xl:w-full xl:hidden">
            <p className="eyebrow mb-1.5 text-ink-soft">Trajetória</p>
            <PersonSwitch options={switchOptions} />
          </div>
          <PeriodControl
            domain={dominio}
            periodo={state.periodo}
            onChange={(de, ate) => applyFilter({ type: "setPeriod", de, ate })}
          />
          <CategoryFilter
            selected={state.categorias}
            counts={contagem}
            onToggle={(categoria) => applyFilter({ type: "toggleCategory", categoria })}
            onClear={() => applyFilter({ type: "clearCategories" })}
          />
          {filtrado && (
            <button type="button" onClick={clearFilters} className={`h-11 px-2 text-sm xl:hidden ${reset}`}>
              Limpar filtros
            </button>
          )}
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

      {/* O que mudou, para quem ouve a página: o acontecimento aberto ou o recorte. */}
      <p className="sr-only" aria-live="polite">
        {selected
          ? `Aberto: ${selected.titulo}`
          : `${dropped ? "O acontecimento aberto ficou fora do recorte e foi fechado. " : ""}${registrosTexto} em ${periodoTexto}, ${categoriasTexto}.`}
      </p>

      <div className="explorer-grid min-h-0 flex-1">
        {/* Linha do tempo */}
        <section
          aria-labelledby="titulo-tempo"
          // Em janela baixa, a linha do tempo rola por dentro, sem cobrir o mapa.
          className="explorer-tempo relative order-1 border-b border-line bg-raised pb-2 max-md:group-data-[pane=leitura]/x:hidden md:min-h-0 md:overflow-y-auto md:border-b-0 md:border-t md:border-ink"
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
            onPeriodChange={choosePeriod}
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
          <p className="px-3 pt-1.5 text-[0.6875rem] leading-tight text-ink-soft">
            <span className="md:hidden">Toque em um ano do eixo para ver só aquele ano.</span>
            <span className="max-md:hidden">
              Clique em um ano do eixo para ver só aquele ano, ou arraste para escolher um intervalo.
            </span>
          </p>
        </section>

        {/* Lista */}
        <section
          aria-labelledby="titulo-lista"
          // `relative`: o texto só para leitor de tela é posicionado de forma
          // absoluta; sem isso ele escapa da área com rolagem e estica a página.
          className="explorer-lista relative order-2 hidden min-h-0 overflow-y-auto border-line max-md:group-data-[pane=lista]/x:block md:border-r md:max-xl:group-data-[side=lista]/x:block xl:block"
        >
          {/* O que está sendo consultado: período, quantidade e cobertura. */}
          <div className="sticky top-0 z-10 bg-paper px-3 pb-2.5 pt-3 max-md:static">
            <div className="flex min-h-4 items-center justify-between gap-3">
              <h2 id="titulo-lista" className="eyebrow text-ink-soft">
                Acontecimentos
              </h2>
              {filtrado && (
                <button type="button" onClick={clearFilters} className={`-my-3.5 py-3.5 text-xs ${reset}`}>
                  Limpar filtros
                </button>
              )}
            </div>
            <p className="numerals mt-1.5 text-sm">
              <span className="font-semibold">{periodoTexto}</span> · {registrosTexto}
            </p>
            <p className="text-xs text-ink-soft">
              {periodoAtivo
                ? `Recorte de ${coberturaTexto}, o período que a edição cobre.`
                : "Todo o período que a edição cobre."}
              {state.categorias.length > 0 && ` Só ${categoriasTexto}.`}
            </p>
            {dropped && (
              <p className="mt-1.5 border-l-2 border-ink-faint pl-2 text-xs text-ink-soft">
                O acontecimento que estava aberto ficou fora deste recorte e foi fechado.
              </p>
            )}
            {/* O link reproduz o recorte e, quando há, o acontecimento aberto. */}
            <CopyLink path={consulta} label="Copiar link desta consulta" variant="texto" className="[&>button]:text-xs" />
          </div>

          <PeriodContext
            periodLabel={periodoTexto}
            mandatos={noPeriodo.mandatos}
            filiacoes={noPeriodo.filiacoes}
            open={contextOpen}
            onToggle={setContextOpen}
          />

          <EventList
            items={visible}
            selectedSlug={state.acontecimento}
            onSelect={openEvent}
            gaps={noPeriodo.lacunas}
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

          {dataDeCorte !== null && (
            <p className="px-3 py-3 text-xs text-ink-soft">
              A edição cobre de {dominio.de} a {formatDate({ valor: dataDeCorte, precisao: "dia" })}.
              Trecho sem registro é lacuna da pesquisa, e não ausência de atividade.
            </p>
          )}
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
              unplaced={semPonto}
              // Cartão do acontecimento selecionado, só no mapa em tela
              // estreita. O mapa enquadra a seleção acima dele.
              overlay={
                selected && cartao ? (
                  <div className="animate-enter border border-ink bg-raised p-3 shadow-[0_8px_24px_-12px_rgb(0_0_0/0.4)]">
                    <div className="grid grid-cols-[4.25rem_minmax(0,1fr)] gap-x-3">
                      <DateMark data={selected.data} showPrecision />
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
                          setFolded(null);
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
                ) : null
              }
            />
          </div>
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
              // A página recebe o recorte, para o retorno poder devolvê-lo.
              href={eventHref(selected.slug, { recorte: state })}
              actions={<CopyLink path={consulta} label="Copiar link desta consulta" />}
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
              edicao={data.conjunto.edicao}
              sourcesOf={(registro) => getSources(data, registro)}
              actions={
                <nav aria-label="A partir deste perfil" className="flex flex-wrap items-start gap-x-4 gap-y-2">
                  <Link
                    href={comparacao}
                    prefetch={false}
                    className="inline-flex min-h-11 items-center border border-ink px-4 text-sm font-medium no-underline hover:bg-ink hover:text-paper xl:min-h-9"
                  >
                    Comparar no mesmo recorte
                  </Link>
                  <CopyLink path={consulta} label="Copiar link desta consulta" />
                  <Link
                    href="/metodologia"
                    className="inline-flex min-h-11 items-center text-sm font-medium underline decoration-line-strong hover:decoration-ink xl:min-h-9"
                  >
                    Metodologia e fontes
                  </Link>
                </nav>
              }
              headingLevel={3}
            />
          )}
        </section>
      </div>
    </div>
  );
}
