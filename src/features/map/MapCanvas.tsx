"use client";

// O mapa em si. Este módulo importa o MapLibre, que precisa de `window` e de
// WebGL, então só é carregado no navegador: quem o usa é `MapView`, por
// import dinâmico com `ssr: false`. Não importe este arquivo diretamente.

import "maplibre-gl/dist/maplibre-gl.css";

import {
  Map as MapLibreMap,
  NavigationControl,
  setWorkerUrl,
  type GeoJSONSource,
  type LngLatBoundsLike,
} from "maplibre-gl";
import { useEffect, useEffectEvent, useRef, useState } from "react";

import type { EventPointCollection } from "@/lib/data/types";

import {
  INITIAL_BOUNDS,
  MAP_LAYERS,
  MAP_SOURCES,
  buildBaseStyle,
  selectionFilter,
} from "./style";

// O MapLibre 6 não embute mais o worker: ele é um arquivo à parte. Com
// `new URL(..., import.meta.url)` o bundler publica esse arquivo junto com o
// build, e o mapa continua sem depender de CDN.
setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).href);

const LOAD_TIMEOUT_MS = 15_000;

const MAP_LOCALE = {
  "Map.Title": "Mapa dos acontecimentos",
  "NavigationControl.ZoomIn": "Aproximar",
  "NavigationControl.ZoomOut": "Afastar",
};

export interface MapCanvasProps {
  features: EventPointCollection;
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
  onReady: () => void;
  onFailure: (reason: Error) => void;
}

function toError(valor: unknown): Error {
  return valor instanceof Error ? valor : new Error(String(valor));
}

export default function MapCanvas({
  features,
  selectedSlug,
  onSelect,
  onReady,
  onFailure,
}: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Só recebe o mapa depois do evento `load`; antes disso as fontes de dados
  // do estilo ainda não existem.
  const [map, setMap] = useState<MapLibreMap | null>(null);

  const handleSelect = useEffectEvent(onSelect);
  const handleReady = useEffectEvent(onReady);
  const handleFailure = useEffectEvent(onFailure);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let instance: MapLibreMap;
    try {
      instance = new MapLibreMap({
        container,
        style: buildBaseStyle(),
        bounds: INITIAL_BOUNDS,
        fitBoundsOptions: { padding: 24 },
        minZoom: 1,
        maxZoom: 9,
        // Mapa plano, sempre com o norte para cima.
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        attributionControl: false,
        locale: MAP_LOCALE,
      });
    } catch (erro) {
      // Sem WebGL o construtor lança. Quem decide o que mostrar é o MapView.
      handleFailure(toError(erro));
      return;
    }

    instance.touchZoomRotate.disableRotation();
    instance.addControl(new NavigationControl({ showCompass: false }), "top-right");

    // Limite de espera pelo primeiro desenho. Só conta com a aba visível: em
    // segundo plano o navegador não desenha quadros, e um mapa saudável
    // pareceria travado.
    let timeout: number | undefined;
    const watchLoad = () => {
      window.clearTimeout(timeout);
      if (document.visibilityState !== "visible") return;
      timeout = window.setTimeout(() => {
        handleFailure(new Error("O mapa não terminou de carregar a tempo."));
      }, LOAD_TIMEOUT_MS);
    };
    const stopWatchingLoad = () => {
      window.clearTimeout(timeout);
      document.removeEventListener("visibilitychange", watchLoad);
    };
    document.addEventListener("visibilitychange", watchLoad);
    watchLoad();

    instance.once("load", () => {
      stopWatchingLoad();
      setMap(instance);
      handleReady();
    });

    instance.on("click", MAP_LAYERS.pontos, (evento) => {
      const slug: unknown = evento.features?.[0]?.properties?.acontecimentoSlug;
      if (typeof slug === "string") handleSelect(slug);
    });
    instance.on("mouseenter", MAP_LAYERS.pontos, () => {
      instance.getCanvas().style.cursor = "pointer";
    });
    instance.on("mouseleave", MAP_LAYERS.pontos, () => {
      instance.getCanvas().style.cursor = "";
    });

    return () => {
      stopWatchingLoad();
      setMap(null);
      instance.remove();
    };
  }, []);

  useEffect(() => {
    map?.getSource<GeoJSONSource>(MAP_SOURCES.acontecimentos)?.setData(features);
  }, [map, features]);

  useEffect(() => {
    if (!map) return;
    map.setFilter(MAP_LAYERS.selecionado, selectionFilter(selectedSlug));
    if (selectedSlug === null) return;

    const pontos = features.features
      .filter((feature) => feature.properties.acontecimentoSlug === selectedSlug)
      .map((feature) => feature.geometry.coordinates as [number, number]);

    // Acontecimento sem ponto (abrangência nacional, lugar não documentado):
    // a câmera fica onde está. O MapLibre já pula a animação quando o sistema
    // pede movimento reduzido.
    const [primeiro, ...demais] = pontos;
    if (!primeiro) return;

    if (demais.length === 0) {
      map.easeTo({ center: primeiro, zoom: Math.max(map.getZoom(), 4) });
      return;
    }

    const longitudes = pontos.map(([longitude]) => longitude);
    const latitudes = pontos.map(([, latitude]) => latitude);
    const enquadramento: LngLatBoundsLike = [
      [Math.min(...longitudes), Math.min(...latitudes)],
      [Math.max(...longitudes), Math.max(...latitudes)],
    ];
    map.fitBounds(enquadramento, { padding: 72, maxZoom: 6 });
  }, [map, selectedSlug, features]);

  return <div ref={containerRef} className="h-full w-full" />;
}
