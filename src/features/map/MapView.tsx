"use client";

// Fronteira entre o resto da interface e o mapa. Cuida de três coisas que o
// MapCanvas não deve saber: carregar o MapLibre só no navegador, mostrar o
// estado de carregamento e trocar o mapa por uma lista de lugares quando ele
// falha (sem WebGL, pacote que não baixou, mapa que não responde).

import dynamic from "next/dynamic";
import { Component, useState, type ReactNode } from "react";

import type { EventPointCollection } from "@/lib/data/types";
import { GEO_PRECISION_LABELS, formatCoordinates } from "@/lib/domain/geo";

const MapCanvas = dynamic(() => import("./MapCanvas"), { ssr: false });

interface MapViewProps {
  features: EventPointCollection;
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
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

export function MapView({ features, selectedSlug, onSelect }: MapViewProps) {
  const [status, setStatus] = useState<MapStatus>("loading");

  const fail = (erro: Error) => {
    console.warn("Mapa indisponível:", erro.message);
    setStatus("failed");
  };

  if (status === "failed") {
    return <MapFallback features={features} selectedSlug={selectedSlug} onSelect={onSelect} />;
  }

  return (
    <div className="relative h-full min-h-80 overflow-hidden rounded-md border border-line bg-map">
      <MapBoundary onError={fail}>
        <MapCanvas
          features={features}
          selectedSlug={selectedSlug}
          onSelect={onSelect}
          onReady={() => setStatus("ready")}
          onFailure={fail}
        />
      </MapBoundary>
      {status === "loading" && (
        <p role="status" className="absolute inset-0 grid place-items-center text-sm text-ink-soft">
          Carregando o mapa…
        </p>
      )}
    </div>
  );
}

/** Leitura alternativa: os mesmos lugares, em texto, com a mesma seleção. */
function MapFallback({ features, selectedSlug, onSelect }: MapViewProps) {
  return (
    <div className="h-full min-h-80 rounded-md border border-line bg-surface p-4">
      <p role="status" className="text-sm">
        <strong>O mapa não pôde ser exibido neste navegador.</strong> Os lugares do recorte
        atual seguem em lista, e a seleção continua funcionando.
      </p>
      {features.features.length === 0 ? (
        <p className="mt-3 text-sm text-ink-soft">Nenhum lugar documentado neste recorte.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {features.features.map(({ properties, geometry }) => {
            const [longitude = 0, latitude = 0] = geometry.coordinates;
            const selecionado = properties.acontecimentoSlug === selectedSlug;
            return (
              <li key={`${properties.eventId}@${properties.placeId}`}>
                <button
                  type="button"
                  aria-pressed={selecionado}
                  onClick={() => onSelect(properties.acontecimentoSlug)}
                  className="w-full rounded border border-line px-3 py-2 text-left text-sm hover:border-accent aria-pressed:border-mark aria-pressed:bg-mark-soft"
                >
                  <span className="block font-medium">{properties.lugarNome}</span>
                  <span className="block text-ink-soft">{properties.titulo}</span>
                  <span className="block text-ink-soft">
                    {formatCoordinates({ longitude, latitude })} ·{" "}
                    {GEO_PRECISION_LABELS[properties.precisaoGeografica]}
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
