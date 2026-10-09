"use client";

// Fronteira entre o resto da interface e o mapa. Cuida do que o MapCanvas não
// deve saber: carregar o MapLibre só no navegador, mostrar o carregamento e
// trocar o mapa por uma lista de lugares quando ele falha (sem WebGL, pacote
// que não baixou, contornos que não carregaram, mapa que não responde,
// contexto gráfico perdido). Em qualquer desses casos, quem usa o mapa
// continua recebendo a mesma seleção.

import dynamic from "next/dynamic";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";

import type { UnplacedEvent } from "@/lib/data/points";
import type { EventPointCollection } from "@/lib/data/types";

import { MapFallback, type MapFailure } from "./MapFallback";

const MapCanvas = dynamic(() => import("./MapCanvas"), { ssr: false });

export interface MapViewProps {
  /** Os pontos do recorte. O mapa não filtra: desenha o que recebe. */
  features: EventPointCollection;
  selectedSlug: string | null;
  /** Sem esta função o mapa só mostra os lugares: não há o que selecionar. */
  onSelect?: (slug: string) => void;
  /** Acontecimentos do recorte sem ponto, para o acesso a eles pelo mapa. */
  unplaced?: readonly UnplacedEvent[];
  /**
   * Conteúdo posto sobre a parte de baixo do mapa, como o cartão do
   * acontecimento em tela estreita. O mapa mede a altura dele e enquadra a
   * seleção acima; enquanto o seletor de lugares está aberto, ele cede o espaço.
   */
  overlay?: ReactNode;
  /**
   * `cooperativos`: o mapa está em uma página que rola. Mover pede dois dedos,
   * ou Ctrl e a rolagem, para o gesto de rolar a página não ficar preso nele.
   */
  gestures?: "livres" | "cooperativos";
}

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

export function MapView({
  features,
  selectedSlug,
  onSelect,
  unplaced,
  overlay,
  gestures = "livres",
}: MapViewProps) {
  const [ready, setReady] = useState(false);
  const [failure, setFailure] = useState<MapFailure | null>(null);
  // Cada tentativa monta o mapa de novo, do zero.
  const [attempt, setAttempt] = useState(0);
  const [chooserOpen, setChooserOpen] = useState(false);
  const [overlayHeight, setOverlayHeight] = useState(0);
  const frame = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
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
  }, [shown, failure]);

  // A faixa que o conteúdo sobreposto cobre: some quando ele some ou é escondido.
  useEffect(() => {
    const alvo = overlayRef.current;
    if (!alvo) return;
    const observer = new ResizeObserver(([entrada]) => {
      const altura = entrada?.contentRect.height ?? 0;
      // Soma a folga entre o conteúdo e a borda de baixo do mapa.
      setOverlayHeight(altura > 0 ? Math.round(altura) + 16 : 0);
    });
    observer.observe(alvo);
    return () => observer.disconnect();
  }, [failure]);

  const fail = (reason: MapFailure, erro: Error) => {
    console.warn("Mapa indisponível:", erro.message);
    setReady(false);
    setChooserOpen(false);
    setFailure(reason);
  };

  const retry = () => {
    setFailure(null);
    setAttempt((atual) => atual + 1);
  };

  if (failure !== null) {
    return (
      <div className="flex h-full min-h-64 flex-col md:min-h-40">
        <div className="min-h-0 flex-1">
          <MapFallback
            features={features}
            selectedSlug={selectedSlug}
            onSelect={onSelect}
            reason={failure}
            onRetry={retry}
          />
        </div>
        {overlay && (
          <div className="border-x border-b border-ink-faint bg-raised p-2 md:hidden">{overlay}</div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={frame}
      className="relative h-full min-h-64 overflow-hidden border border-ink-faint bg-map-sea md:min-h-40"
    >
      {shown && (
        <MapBoundary key={attempt} onError={(erro) => fail("pacote", erro)}>
          <MapCanvas
            features={features}
            selectedSlug={selectedSlug}
            onSelect={onSelect}
            unplaced={unplaced}
            bottomInset={chooserOpen ? 0 : overlayHeight}
            cooperative={gestures === "cooperativos"}
            onReady={() => setReady(true)}
            onFailure={fail}
            onChooserChange={setChooserOpen}
          />
        </MapBoundary>
      )}
      {!ready && (
        <p role="status" className="absolute inset-0 grid place-items-center text-sm text-ink-soft">
          Carregando o mapa…
        </p>
      )}
      {/* O conteúdo sobreposto fica montado mesmo escondido, para a medida acompanhar. */}
      <div
        ref={overlayRef}
        hidden={chooserOpen || !overlay}
        className="absolute inset-x-2 bottom-2 z-20 md:hidden"
      >
        {overlay}
      </div>
    </div>
  );
}

