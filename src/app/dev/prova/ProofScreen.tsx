"use client";

// Parte interativa da prova: lista, mapa e painel lendo o mesmo estado.
// Verifica a arquitetura, não o desenho final da exploração.

import { useEffect, useMemo, useState } from "react";

import { EventList } from "@/features/events/EventList";
import { EventPanel } from "@/features/events/EventPanel";
import { buildEventFeatures } from "@/features/map/features";
import { MapView } from "@/features/map/MapView";
import { resolveEvent } from "@/lib/domain/resolve";
import { AtlasStateProvider, useAtlas } from "@/lib/state/AtlasStateProvider";
import { INITIAL_STATE } from "@/lib/state/atlas-state";
import type { ExplorerData } from "@/lib/state/selectors";

interface ProofScreenProps {
  data: ExplorerData;
  draftCount: number;
}

export function ProofScreen({ data, draftCount }: ProofScreenProps) {
  return (
    <AtlasStateProvider data={data} initialState={{ ...INITIAL_STATE, comparar: true }}>
      <ProofLayout draftCount={draftCount} />
    </AtlasStateProvider>
  );
}

// Simulação de navegador sem WebGL: enquanto ativa, o canvas se recusa a criar
// contexto WebGL, e o MapLibre falha pelo mesmo caminho de uma máquina real
// sem suporte. Fica nesta tela de desenvolvimento, fora do código do mapa.
type GetContext = HTMLCanvasElement["getContext"];
let originalGetContext: GetContext | null = null;

function blockWebgl() {
  if (originalGetContext) return;
  const original = HTMLCanvasElement.prototype.getContext;
  originalGetContext = original;
  HTMLCanvasElement.prototype.getContext = function (
    this: HTMLCanvasElement,
    contextId: string,
    ...rest: unknown[]
  ) {
    if (contextId.includes("webgl")) return null;
    return (original as (...args: unknown[]) => unknown).call(this, contextId, ...rest);
  } as GetContext;
}

function restoreWebgl() {
  if (!originalGetContext) return;
  HTMLCanvasElement.prototype.getContext = originalGetContext;
  originalGetContext = null;
}

function ProofLayout({ draftCount }: { draftCount: number }) {
  const { state, dispatch, data, visible, selected } = useAtlas();
  const [webglBlocked, setWebglBlocked] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  const features = useMemo(
    () => buildEventFeatures(visible, data.lugares),
    [visible, data.lugares],
  );
  const resolved = useMemo(
    () => (selected ? resolveEvent(selected, data) : null),
    [selected, data],
  );

  useEffect(() => restoreWebgl, []);

  const selectEvent = (slug: string | null) => dispatch({ type: "selectEvent", slug });

  const showEveryone = () => dispatch({ type: "setComparison", ativo: true });
  const showPerson = (slug: string) => {
    dispatch({ type: "setComparison", ativo: false });
    dispatch({ type: "selectPerson", slug });
  };

  const toggleWebgl = () => {
    // O bloqueio precisa estar em vigor antes de o mapa montar de novo.
    if (webglBlocked) restoreWebgl();
    else blockWebgl();
    setWebglBlocked(!webglBlocked);
    setMapKey((chave) => chave + 1);
  };

  const filterButton =
    "rounded-md border border-line bg-surface px-3 py-1.5 text-sm hover:border-accent aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-surface";

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <h1 className="font-serif text-3xl leading-tight">Prova técnica da fase 1</h1>
        <p className="rounded-md border border-line bg-notice px-4 py-3 text-sm text-notice-ink">
          <strong>Dados sintéticos.</strong> Todos os registros desta tela foram criados para
          teste e não descrevem pessoas, lugares ou fatos reais. A tela existe só no servidor de
          desenvolvimento e não entra no build de produção.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div role="group" aria-label="Pessoa" className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={state.comparar}
            onClick={showEveryone}
            className={filterButton}
          >
            Todas
          </button>
          {data.pessoas.map((pessoa) => (
            <button
              key={pessoa.id}
              type="button"
              aria-pressed={!state.comparar && state.pessoa === pessoa.slug}
              onClick={() => showPerson(pessoa.slug)}
              className={filterButton}
            >
              {pessoa.nome}
            </button>
          ))}
        </div>

        <button
          type="button"
          aria-pressed={webglBlocked}
          onClick={toggleWebgl}
          className={filterButton}
        >
          Simular navegador sem WebGL
        </button>
      </div>

      <p className="text-sm text-ink-soft">
        {visible.length} acontecimentos no recorte · {features.features.length} pontos no mapa ·{" "}
        {draftCount} em rascunho, fora da exibição
      </p>

      <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)_22rem]">
        <section aria-labelledby="prova-lista" className="lg:-m-1.5 lg:max-h-[36rem] lg:overflow-y-auto lg:p-1.5">
          <h2 id="prova-lista" className="mb-2 font-serif text-xl">
            Acontecimentos
          </h2>
          <EventList items={visible} selectedSlug={state.acontecimento} onSelect={selectEvent} />
        </section>

        <section aria-labelledby="prova-mapa">
          <h2 id="prova-mapa" className="mb-2 font-serif text-xl">
            Mapa
          </h2>
          {/* Altura fixa: o mapa não muda de tamanho quando o painel cresce. */}
          <div className="h-80 lg:h-[33rem]">
            <MapView
              key={mapKey}
              features={features}
              selectedSlug={state.acontecimento}
              onSelect={selectEvent}
            />
          </div>
        </section>

        <section aria-labelledby="prova-painel" aria-live="polite">
          <h2 id="prova-painel" className="mb-2 font-serif text-xl">
            Detalhes
          </h2>
          <EventPanel event={resolved} />
        </section>
      </div>
    </div>
  );
}
