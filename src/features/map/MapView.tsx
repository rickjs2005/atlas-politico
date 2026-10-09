"use client";

// Fronteira entre o resto da interface e o mapa. Cuida de três coisas que o
// MapCanvas não deve saber: carregar o MapLibre só no navegador, mostrar o
// estado de carregamento e trocar o mapa por uma lista de lugares quando ele
// falha (sem WebGL, pacote que não baixou, mapa que não responde).

import dynamic from "next/dynamic";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";

import { CategoryMark } from "@/components/Category";
import type { EventPointCollection } from "@/lib/data/types";
import { GEO_PRECISION_LABELS, formatCoordinates } from "@/lib/domain/geo";

const MapCanvas = dynamic(() => import("./MapCanvas"), { ssr: false });

interface MapViewProps {
  features: EventPointCollection;
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
  /** Faixa inferior do mapa coberta por outro elemento, em pixels: a seleção é enquadrada acima dela. */
  bottomInset?: number;
}

type MapStatus = "loading" | "ready" | "failed";

/** Pega o que estoura na renderização, como a falha ao baixar o pacote do mapa. */
class MapBoundary extends Component<
  { onError: (erro: Error) => void; children: ReactNode },
  { failed: boolean }
> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override componentDidCatch(erro: Error) {
    this.props.onError(erro);
  }

  override render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function MapView({ features, selectedSlug, onSelect, bottomInset = 0 }: MapViewProps) {
  const [status, setStatus] = useState<MapStatus>("loading");
  const frame = useRef<HTMLDivElement>(null);
  // O mapa só é montado quando a moldura aparece na tela. Em telas estreitas
  // ele fica em uma vista própria: enquanto a pessoa está na lista, o pacote
  // do mapa nem é baixado, e a espera pelo carregamento não começa a contar.
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const moldura = frame.current;
    if (!moldura || shown) return;
    const observer = new ResizeObserver(([entrada]) => {
      if (entrada && entrada.contentRect.width > 0 && entrada.contentRect.height > 0) setShown(true);
    });
    observer.observe(moldura);
    return () => observer.disconnect();
  }, [shown]);

  const fail = (erro: Error) => {
    console.warn("Mapa indisponível:", erro.message);
    setStatus("failed");
  };

  if (status === "failed") {
    return <MapFallback features={features} selectedSlug={selectedSlug} onSelect={onSelect} />;
  }

  return (
    <div ref={frame} className="relative h-full min-h-64 overflow-hidden border border-ink-faint bg-map-sea md:min-h-40">
      {shown && (
        <MapBoundary onError={fail}>
          <MapCanvas
            features={features}
            selectedSlug={selectedSlug}
            onSelect={onSelect}
            bottomInset={bottomInset}
            onReady={() => setStatus("ready")}
            onFailure={fail}
          />
        </MapBoundary>
      )}
      {status === "loading" && (
        <p role="status" className="absolute inset-0 grid place-items-center text-sm text-ink-soft">
          Carregando o mapa…
        </p>
      )}
      {status === "ready" && (
        <p className="pointer-events-none absolute bottom-0 left-0 max-w-[calc(100%_-_3rem)] bg-raised/85 px-2 py-1 text-[0.6875rem] leading-tight text-ink-soft">
          Pontos aproximados: centro do município ou do estado
        </p>
      )}
    </div>
  );
}

/** Leitura alternativa: os mesmos lugares, em texto, com a mesma seleção. */
export function MapFallback({ features, selectedSlug, onSelect }: MapViewProps) {
  return (
    <div className="relative h-full min-h-64 overflow-y-auto border border-ink-faint bg-raised p-4 md:min-h-40">
      <p role="status" className="text-sm">
        <strong>O mapa não pôde ser exibido neste navegador.</strong> Os lugares do recorte
        atual seguem em lista, e a seleção continua funcionando.
      </p>
      {features.features.length === 0 ? (
        <p className="mt-3 text-sm text-ink-soft">Nenhum lugar documentado neste recorte.</p>
      ) : (
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {features.features.map(({ properties, geometry }) => {
            const [longitude = 0, latitude = 0] = geometry.coordinates;
            const selecionado = properties.acontecimentoSlug === selectedSlug;
            return (
              <li key={`${properties.eventId}@${properties.placeId}`}>
                <button
                  type="button"
                  aria-pressed={selecionado}
                  onClick={() => onSelect(properties.acontecimentoSlug)}
                  className="grid w-full grid-cols-[1rem_minmax(0,1fr)] gap-x-2 border-l-[3px] border-transparent px-2 py-2.5 text-left text-sm hover:bg-paper aria-pressed:border-accent aria-pressed:bg-accent-soft"
                >
                  <CategoryMark categoria={properties.categoria} size={10} className="mt-1" />
                  <span className="min-w-0">
                    <span className="block font-medium">{properties.lugarNome}</span>
                    <span className="block text-ink-soft">{properties.titulo}</span>
                    <span className="numerals block text-xs text-ink-soft">
                      {formatCoordinates({ longitude, latitude })} ·{" "}
                      {GEO_PRECISION_LABELS[properties.precisaoGeografica]}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
