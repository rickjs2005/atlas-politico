"use client";

// O mapa em si. Este módulo importa o MapLibre, que precisa de `window` e de
// WebGL, então só é carregado no navegador: quem o usa é `MapView`, por
// import dinâmico com `ssr: false`. Não importe este arquivo diretamente.
//
// A instância do MapLibre é criada uma vez e vive enquanto o componente
// estiver montado. Ela desenha só a base. Filtros e seleção não a recriam:
// mudam os marcadores, que são HTML por cima do canvas, e, quando preciso, a
// câmera (docs/MAP.md).

import "maplibre-gl/dist/maplibre-gl.css";

import { Map as MapLibreMap, setWorkerUrl, type LngLatBoundsLike } from "maplibre-gl";
import {
  useEffect,
  useEffectEvent,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import type { UnplacedEvent } from "@/lib/data/points";
import type { EventPointCollection } from "@/lib/data/types";
import { GEO_PRECISION_LABELS, type Position } from "@/lib/domain/geo";

import {
  DEFAULT_BOUNDS,
  MAP_LIMITS,
  frameOf,
  isInView,
  minZoomInside,
  nudgeIntoView,
  paddingFor,
  type Box,
  type Framing,
  type Insets,
} from "./camera";
import { MapControls } from "./MapControls";
import type { MapFailure } from "./MapFallback";
import { MapLegend } from "./MapLegend";
import { PlaceChooser, type ChooserSection } from "./PlaceChooser";
import { PlaceMarker, isBroadPrecision, markerDomId } from "./PlaceMarker";
import {
  buildPlaces,
  distinctEvents,
  groupPlaces,
  groupTitle,
  groupsOfEvent,
  placesOfEvent,
  splitByArea,
  withoutMarker,
  type MarkerGroup,
  type ScreenPoint,
} from "./places";
import { MAP_SOURCES, buildBaseStyle } from "./style";

// O MapLibre 6 não embute mais o worker: ele é um arquivo à parte. Com
// `new URL(..., import.meta.url)` o bundler publica esse arquivo junto com o
// build, e o mapa continua sem depender de CDN.
setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).href);

// Os contornos da base saem pelo mesmo caminho: arquivos do projeto,
// publicados pelo build e pedidos ao próprio site.
const BASE_MAP_URLS = {
  terra: new URL("./base/terra.geojson", import.meta.url).href,
  estados: new URL("./base/estados-br.geojson", import.meta.url).href,
};

const LOAD_TIMEOUT_MS = 15_000;
/** Quanto esperar o navegador devolver o contexto gráfico antes de desistir. */
const CONTEXT_TIMEOUT_MS = 5_000;
/** Duração do movimento de câmera (docs/INTERACTIONS.md). */
const CAMERA_MS = 500;
/** Distância, em pixels, abaixo da qual dois lugares dividem um marcador: a área de toque de um. */
const GROUP_RADIUS = 44;
const UNPLACED = "sem-ponto";

const MAP_LOCALE = {
  "Map.Title": "Mapa dos acontecimentos",
  "CooperativeGesturesHandler.WindowsHelpText": "Use Ctrl e a rolagem para aproximar o mapa",
  "CooperativeGesturesHandler.MacHelpText": "Use ⌘ e a rolagem para aproximar o mapa",
  "CooperativeGesturesHandler.MobileHelpText": "Use dois dedos para mover o mapa",
};

const UNPLACED_SECTIONS: Record<UnplacedEvent["motivo"], { titulo: string; nota: string }> = {
  nacional: { titulo: "Abrangência nacional", nota: "sem um ponto municipal" },
  desconhecida: { titulo: "Lugar não documentado", nota: "as fontes não dizem onde" },
};

export interface MapCanvasProps {
  /** Os pontos do recorte, já filtrados por quem monta o mapa. */
  features: EventPointCollection;
  selectedSlug: string | null;
  /** Sem esta função o mapa só mostra: não há o que selecionar. */
  onSelect?: (slug: string) => void;
  /** Acontecimentos do recorte sem ponto, para o acesso pelo mapa. */
  unplaced?: readonly UnplacedEvent[];
  /** Faixa inferior do mapa coberta por outro elemento, em pixels. */
  bottomInset?: number;
  /** O mapa está em uma página que rola: mover pede dois dedos, ou Ctrl e rolagem. */
  cooperative?: boolean;
  onReady: () => void;
  onFailure: (reason: MapFailure, detalhe: Error) => void;
  /** O seletor de acontecimentos abriu ou fechou. */
  onChooserChange?: (open: boolean) => void;
}

function toError(valor: unknown): Error {
  return valor instanceof Error ? valor : new Error(String(valor));
}

const toBounds = ([oeste, sul, leste, norte]: Box): LngLatBoundsLike => [
  [oeste, sul],
  [leste, norte],
];

/** Leva a câmera a um enquadramento, deixando livre o que estiver coberto. */
function moveCamera(alvo: MapLibreMap, frame: Framing, cobertura: Insets, animate: boolean) {
  // Com movimento reduzido pedido no sistema, o MapLibre troca o movimento por um salto.
  const duration = animate ? CAMERA_MS : 0;
  if (frame.tipo === "centro") {
    alvo.easeTo({
      center: frame.center,
      zoom: frame.zoom,
      // O lugar fica no meio da área livre, e não sob o que cobre o mapa.
      offset: [(cobertura.left - cobertura.right) / 2, (cobertura.top - cobertura.bottom) / 2],
      duration,
    });
    return;
  }
  alvo.fitBounds(toBounds(frame.bounds), {
    padding: paddingFor(cobertura, alvo.getContainer().clientHeight),
    maxZoom: frame.tipo === "caixa" ? frame.maxZoom : MAP_LIMITS.maxZoom,
    // Deslocamento direto, em vez do voo com afastamento que é o padrão do MapLibre.
    linear: true,
    duration,
  });
}

/** As posições estão todas na parte livre do mapa? */
function allInView(alvo: MapLibreMap, positions: readonly Position[], cobertura: Insets): boolean {
  const { clientWidth: width, clientHeight: height } = alvo.getContainer();
  return positions.every((position) => isInView(alvo.project(position), { width, height }, cobertura));
}

const coveredBelow = (bottom: number): Insets => ({ top: 0, right: 0, bottom, left: 0 });

/** Aviso no canto do mapa. */
const notice = "pointer-events-auto bg-raised/95 px-2 py-1.5 text-ink-soft";

/** Começo do aviso sobre um lugar que a base não cobre. */
function outsideNotice(interactive: boolean, hasMarker: boolean): string {
  if (interactive) {
    return hasMarker ? "O acontecimento aberto também tem lugar" : "O acontecimento aberto fica";
  }
  return hasMarker ? "Este acontecimento também tem lugar" : "Fica";
}

export default function MapCanvas({
  features,
  selectedSlug,
  onSelect,
  unplaced = [],
  bottomInset = 0,
  cooperative = false,
  onReady,
  onFailure,
  onChooserChange,
}: MapCanvasProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chooserRef = useRef<HTMLElement>(null);
  const chooserId = useId();
  const unplacedButtonId = useId();

  // Só recebe o mapa depois do evento `load`.
  const [map, setMap] = useState<MapLibreMap | null>(null);
  // A escala em vigor: muda ao fim de cada zoom, e é o que reagrupa os lugares.
  const [scale, setScale] = useState<{
    zoom: number;
    project: (position: Position) => ScreenPoint;
  } | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [openId, setOpenId] = useState<string | null>(null);
  // O navegador tirou o contexto gráfico; o MapLibre tenta retomar sozinho.
  const [interrupted, setInterrupted] = useState(false);

  // A pessoa mexeu na câmera: daí em diante o mapa não a recentra por conta
  // própria ao mudar o recorte.
  const userMoved = useRef(false);
  // Quem abriu o seletor, e se o foco deve voltar para lá quando ele fechar.
  // O foco só volta quando a pessoa fecha o seletor por dentro dele: se quem o
  // fechou foi um filtro ou um clique no mapa, o foco fica onde está.
  const opener = useRef<string | null>(null);
  const restoreFocus = useRef(false);

  const handleReady = useEffectEvent(onReady);
  const handleFailure = useEffectEvent(onFailure);

  // Mudou o recorte ou a seleção: a lista aberta já não descreve o que há no mapa.
  const [seen, setSeen] = useState({ features, selectedSlug });
  if (seen.features !== features || seen.selectedSlug !== selectedSlug) {
    setSeen({ features, selectedSlug });
    setOpenId(null);
  }

  // Só entra no mapa o lugar que cai na área que a base cobre. O que fica fora
  // dela segue acessível pela mesma lista dos acontecimentos sem ponto.
  const { dentro: places, fora: outside } = useMemo(
    () => splitByArea(buildPlaces(features), MAP_LIMITS.bounds),
    [features],
  );
  const groups = useMemo(
    () => (scale ? groupPlaces(places, scale.project, GROUP_RADIUS) : []),
    [places, scale],
  );
  const selectedGroups = useMemo(
    () => new Set(groupsOfEvent(groups, selectedSlug).map((group) => group.id)),
    [groups, selectedSlug],
  );
  const selectedUnplaced = unplaced.find((evento) => evento.slug === selectedSlug) ?? null;
  // Lugares do acontecimento aberto que ficam fora da área do mapa, e se ele
  // tem algum outro lugar desenhado.
  const selectedOutside = placesOfEvent(outside, selectedSlug);
  const selectedHasMarker = placesOfEvent(places, selectedSlug).length > 0;
  // O que o mapa não desenha: sem ponto, ou só com lugares fora da área. Quem
  // tem ao menos um marcador não entra nesta conta.
  const offArea = useMemo(() => withoutMarker(outside, places), [outside, places]);
  const offMap = unplaced.length + distinctEvents(offArea).length;

  const openGroup = groups.find((group) => group.id === openId) ?? null;
  const openUnplaced = openId === UNPLACED && offMap > 0;
  const chooserOpen = openGroup !== null || openUnplaced;

  // -------------------------------------------------------------------------
  // Câmera
  // -------------------------------------------------------------------------

  /** Enquadramento do recorte: os lugares que têm ponto, ou o território, sem nenhum. */
  const frameRecorte = useEffectEvent((alvo: MapLibreMap, animate: boolean) => {
    moveCamera(alvo, frameOf(places), coveredBelow(bottomInset), animate);
  });

  // Ao mudar o recorte, a câmera só anda se algum lugar ficou fora da vista, e
  // só enquanto a pessoa não tiver assumido o controle. Com um acontecimento
  // aberto, quem decide é a regra da seleção, logo abaixo.
  const followRecorte = useEffectEvent((alvo: MapLibreMap) => {
    if (userMoved.current || selectedSlug !== null || places.length === 0) return;
    const cobertura = coveredBelow(bottomInset);
    if (allInView(alvo, places.map((place) => place.position), cobertura)) return;
    moveCamera(alvo, frameOf(places), cobertura, true);
  });

  // Ao selecionar, a câmera vai aos lugares do acontecimento só quando eles
  // não estão à vista. Acontecimento sem ponto não move nada.
  const showSelection = useEffectEvent((alvo: MapLibreMap) => {
    const lugares = placesOfEvent(places, selectedSlug);
    if (lugares.length === 0) return;
    const cobertura = coveredBelow(bottomInset);
    if (allInView(alvo, lugares.map((lugar) => lugar.position), cobertura)) return;
    moveCamera(alvo, frameOf(lugares, alvo.getZoom()), cobertura, true);
  });

  // O seletor cobre parte do mapa. Se cobrir o marcador que o abriu, a câmera
  // desloca o suficiente para o marcador continuar à vista, sem mudar o zoom.
  const keepMarkerVisible = useEffectEvent((alvo: MapLibreMap, position: Position) => {
    const folha = chooserRef.current?.getBoundingClientRect();
    const quadro = rootRef.current?.getBoundingClientRect();
    if (!folha || !quadro) return;
    // Em tela estreita o seletor é uma folha de lado a lado, embaixo; nas
    // demais, um quadro no canto esquerdo.
    const deLadoALado = folha.width >= quadro.width * 0.8;
    const cobertura: Insets = deLadoALado
      ? { top: 0, right: 0, bottom: quadro.bottom - folha.top, left: 0 }
      : { top: 0, right: 0, bottom: 0, left: folha.right - quadro.left };
    const { clientWidth: width, clientHeight: height } = alvo.getContainer();
    const [dx, dy] = nudgeIntoView(alvo.project(position), { width, height }, cobertura);
    if (dx !== 0 || dy !== 0) alvo.panBy([dx, dy], { duration: CAMERA_MS });
  });

  // -------------------------------------------------------------------------
  // Ciclo de vida da instância
  // -------------------------------------------------------------------------

  const readOptions = useEffectEvent(() => ({ cooperative }));
  const handleMapClick = useEffectEvent((alvo: EventTarget | null) => {
    // O clique em um marcador é dele: quem trata é o próprio botão.
    if (alvo instanceof Element && alvo.closest("[data-marker]")) return;
    restoreFocus.current = false;
    setOpenId(null);
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let instance: MapLibreMap;
    try {
      instance = new MapLibreMap({
        container,
        style: buildBaseStyle(BASE_MAP_URLS),
        bounds: toBounds(DEFAULT_BOUNDS),
        // A câmera não sai da área que a base cobre, nem se aproxima além do
        // que a resolução dela sustenta.
        maxBounds: toBounds(MAP_LIMITS.bounds),
        minZoom: MAP_LIMITS.minZoom,
        maxZoom: MAP_LIMITS.maxZoom,
        renderWorldCopies: false,
        // Mapa plano, sempre com o norte para cima.
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        cooperativeGestures: readOptions().cooperative,
        attributionControl: false,
        locale: MAP_LOCALE,
      });
    } catch (erro) {
      // Sem WebGL o construtor lança. Quem decide o que mostrar é o MapView.
      handleFailure("sem-webgl", toError(erro));
      return;
    }

    instance.touchZoomRotate.disableRotation();
    instance.keyboard.disableRotation();
    // O enquadramento inicial é o do recorte com que a página chegou.
    frameRecorte(instance, false);

    // Limite de espera pelo primeiro desenho. Só conta com a aba visível: em
    // segundo plano o navegador não desenha quadros, e um mapa saudável
    // pareceria travado.
    let loadTimeout: number | undefined;
    const watchLoad = () => {
      window.clearTimeout(loadTimeout);
      if (document.visibilityState !== "visible") return;
      loadTimeout = window.setTimeout(() => {
        handleFailure("tempo", new Error("O mapa não terminou de carregar a tempo."));
      }, LOAD_TIMEOUT_MS);
    };
    const stopWatchingLoad = () => {
      window.clearTimeout(loadTimeout);
      document.removeEventListener("visibilitychange", watchLoad);
    };
    document.addEventListener("visibilitychange", watchLoad);
    watchLoad();

    const readScale = () => {
      setScale({ zoom: instance.getZoom(), project: (position) => instance.project(position) });
    };
    const readSize = () => {
      const { clientWidth: width, clientHeight: height } = instance.getContainer();
      setSize({ width, height });
    };

    instance.once("load", () => {
      stopWatchingLoad();
      readScale();
      readSize();
      setMap(instance);
      handleReady();
    });
    instance.on("zoomend", readScale);
    instance.on("resize", readSize);
    instance.on("movestart", (evento) => {
      // Só os movimentos feitos pela pessoa trazem o evento de origem.
      if (evento.originalEvent) userMoved.current = true;
    });
    instance.on("click", (evento) => handleMapClick(evento.originalEvent.target));

    // Sem os contornos, os marcadores ficariam soltos sobre o mar.
    instance.on("error", (evento) => {
      const origem = (evento as { sourceId?: string }).sourceId;
      if (origem === MAP_SOURCES.terra || origem === MAP_SOURCES.estados) {
        stopWatchingLoad();
        handleFailure("base", toError(evento.error));
        return;
      }
      console.warn("Mapa:", evento.error?.message ?? evento);
    });

    // O navegador pode tirar o contexto gráfico (memória de vídeo, troca de
    // placa, aba há muito em segundo plano). O MapLibre o recria sozinho
    // quando o navegador o devolve; se não devolver, a lista de lugares assume.
    let contextTimeout: number | undefined;
    instance.on("webglcontextlost", () => {
      setInterrupted(true);
      window.clearTimeout(contextTimeout);
      contextTimeout = window.setTimeout(() => {
        handleFailure("contexto", new Error("O contexto gráfico do mapa não foi retomado."));
      }, CONTEXT_TIMEOUT_MS);
    });
    instance.on("webglcontextrestored", () => {
      window.clearTimeout(contextTimeout);
      setInterrupted(false);
    });

    return () => {
      stopWatchingLoad();
      window.clearTimeout(contextTimeout);
      setMap(null);
      setScale(null);
      instance.remove();
    };
  }, []);

  // Com o mapa escondido (outra vista, em tela estreita) o quadro não tem
  // tamanho, e a câmera não tem como enquadrar nada. As regras esperam o mapa
  // voltar à tela e rodam de novo.
  const onScreen = size.width > 0 && size.height > 0;

  useEffect(() => {
    if (map && onScreen) followRecorte(map);
  }, [map, onScreen, places]);

  useEffect(() => {
    if (map && onScreen && selectedSlug !== null) showSelection(map);
    // A faixa coberta muda quando o cartão do acontecimento aparece: a conferência se repete.
  }, [map, onScreen, selectedSlug, bottomInset]);

  // Os marcadores são elementos do React postos dentro do contêiner do canvas:
  // os gestos que começam neles chegam ao MapLibre, e a ordem deles no
  // documento, que é a do teclado, é a ordem de leitura do mapa. Quem os mantém
  // sobre a coordenada certa é este efeito, a cada movimento da câmera, sem
  // passar pelo estado do React.
  const markerNodes = useRef(new Map<string, HTMLElement>());
  useLayoutEffect(() => {
    if (!map) return;
    const place = () => {
      for (const group of groups) {
        const no = markerNodes.current.get(group.id);
        if (!no) continue;
        const { x, y } = map.project(group.position);
        no.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px) translate(-50%, -50%)`;
      }
    };
    place();
    map.on("move", place);
    map.on("resize", place);
    return () => {
      map.off("move", place);
      map.off("resize", place);
    };
  }, [map, groups]);

  const openPosition = openGroup?.position;
  useEffect(() => {
    if (map && onScreen && openPosition) keepMarkerVisible(map, openPosition);
  }, [map, onScreen, openPosition]);

  // -------------------------------------------------------------------------
  // Seletor
  // -------------------------------------------------------------------------

  const reportChooser = useEffectEvent((open: boolean) => onChooserChange?.(open));
  useEffect(() => {
    reportChooser(chooserOpen);
  }, [chooserOpen]);

  // Ao abrir, o foco vai para a lista; ao fechar, volta para quem a abriu.
  useEffect(() => {
    if (chooserOpen) {
      chooserRef.current?.focus();
      return;
    }
    if (restoreFocus.current && opener.current !== null) {
      document.getElementById(opener.current)?.focus();
    }
    restoreFocus.current = false;
  }, [chooserOpen]);

  const toggleChooser = (id: string, origem: string) => {
    opener.current = origem;
    restoreFocus.current = false;
    setOpenId(openId === id ? null : id);
  };

  /** Fecha por dentro do seletor: o foco volta para quem o abriu. */
  const closeChooser = () => {
    restoreFocus.current = true;
    setOpenId(null);
  };

  const chooseFromList = (slug: string) => {
    closeChooser();
    onSelect?.(slug);
  };

  const activate = (group: MarkerGroup) => {
    const [unico] = group.events;
    if (group.events.length === 1 && unico) {
      onSelect?.(unico.slug);
      return;
    }
    toggleChooser(group.id, markerDomId(group.id));
  };

  const sections: ChooserSection[] = openGroup
    ? openGroup.places.map((place) => ({
        id: place.placeId,
        titulo: place.nome,
        nota: GEO_PRECISION_LABELS[place.precisao].toLowerCase(),
        events: place.events,
      }))
    : [
        ...(["nacional", "desconhecida"] as const).flatMap((motivo) => {
          const events = unplaced.filter((evento) => evento.motivo === motivo);
          return events.length === 0 ? [] : [{ id: motivo, ...UNPLACED_SECTIONS[motivo], events }];
        }),
        ...offArea.map((place) => ({
          id: place.placeId,
          titulo: place.nome,
          nota: "fora da área que este mapa cobre",
          events: place.events,
        })),
      ];

  // -------------------------------------------------------------------------
  // Controles
  // -------------------------------------------------------------------------

  const zoom = scale?.zoom ?? 0;
  // Com a câmera presa à área da base, o piso de zoom depende do tamanho do quadro.
  const floor = Math.max(MAP_LIMITS.minZoom, minZoomInside(size, MAP_LIMITS.bounds));

  const zoomBy = (delta: number) => {
    if (!map) return;
    userMoved.current = true;
    map.easeTo({ zoom: map.getZoom() + delta, duration: CAMERA_MS / 2 });
  };

  const fit = () => {
    if (!map) return;
    // Enquadrar devolve a câmera ao mapa: ele volta a acompanhar o recorte.
    userMoved.current = false;
    moveCamera(map, frameOf(places), coveredBelow(bottomInset), true);
  };

  const interactive = onSelect !== undefined;
  const legendSingle = groups.find((group) => group.events.length === 1)?.events[0]?.categoria ?? null;

  return (
    <div ref={rootRef} className="relative h-full w-full" data-map-zoom={scale ? zoom.toFixed(2) : undefined}>
      {/* O MapLibre põe `position: relative` no próprio contêiner: a altura vem daqui. */}
      <div ref={containerRef} className="h-full w-full" />

      {map &&
        createPortal(
          <div data-map-markers className="pointer-events-none absolute inset-0 z-[2]">
            {groups.map((group) => {
              const selected = selectedGroups.has(group.id);
              const open = openGroup?.id === group.id;
              return (
                <div
                  key={group.id}
                  ref={(no) => {
                    if (no) markerNodes.current.set(group.id, no);
                    else markerNodes.current.delete(group.id);
                  }}
                  // Quem está aberto ou selecionado fica por cima dos vizinhos.
                  className="pointer-events-auto absolute left-0 top-0 will-change-transform"
                  style={{ zIndex: open ? 3 : selected ? 2 : 1 }}
                >
                  <PlaceMarker
                    group={group}
                    selected={selected}
                    open={open}
                    controls={open ? chooserId : undefined}
                    onActivate={interactive ? () => activate(group) : undefined}
                  />
                </div>
              );
            })}
          </div>,
          map.getCanvasContainer(),
        )}

      {map && (
        <>
          <MapControls
            canZoomIn={zoom < MAP_LIMITS.maxZoom - 0.01}
            canZoomOut={zoom > floor + 0.01}
            onZoomIn={() => zoomBy(1)}
            onZoomOut={() => zoomBy(-1)}
            onFit={fit}
          />

          {/* Acesso ao que não tem ponto e, ao lado, os avisos. Tudo cabe na
              faixa de cima do mapa, que os enquadramentos deixam livre. */}
          <div className="pointer-events-none absolute left-2 top-2 z-20 flex max-w-[calc(100%_-_4.5rem)] items-start gap-1.5 text-xs">
            {interactive && offMap > 0 && (
              <button
                type="button"
                id={unplacedButtonId}
                aria-expanded={openUnplaced}
                aria-controls={openUnplaced ? chooserId : undefined}
                onClick={() => toggleChooser(UNPLACED, unplacedButtonId)}
                className="pointer-events-auto flex min-h-11 shrink-0 items-center gap-1.5 border border-ink-faint bg-raised px-2.5 font-medium hover:border-ink aria-expanded:border-ink xl:min-h-9"
              >
                <span className="numerals font-semibold">{offMap}</span>
                sem ponto no mapa
                <span className="sr-only">: abre a lista</span>
              </button>
            )}
            <div className="flex min-w-0 flex-col items-start gap-1.5">
              {places.length === 0 && (
                <p role="status" className={notice}>
                  {interactive
                    ? "Nenhum acontecimento deste recorte tem ponto no mapa."
                    : "Nenhum lugar para mostrar neste mapa."}
                </p>
              )}
              {selectedOutside.length > 0 && (
                <p role="status" className={notice}>
                  {outsideNotice(interactive, selectedHasMarker)} fora da área que este mapa cobre:{" "}
                  {selectedOutside.map((place) => place.nome).join(", ")}.
                </p>
              )}
              {selectedUnplaced !== null && (
                <p role="status" className={notice}>
                  O acontecimento aberto não tem ponto no mapa:{" "}
                  {UNPLACED_SECTIONS[selectedUnplaced.motivo].titulo.toLowerCase()}.
                </p>
              )}
              {interrupted && (
                <p role="status" className="pointer-events-auto border border-ink-faint bg-notice px-2 py-1.5">
                  O navegador interrompeu o desenho do mapa. Tentando retomar…
                </p>
              )}
            </div>
          </div>

          <MapLegend
            single={legendSingle}
            multiple={groups.some((group) => group.events.length > 1)}
            // O tracejado só entra na legenda quando algum marcador o usa.
            broad={groups.some((group) => group.places.every((place) => isBroadPrecision(place.precisao)))}
            selected={selectedGroups.size > 0}
            className="absolute bottom-0 left-0 z-20"
          />
        </>
      )}

      {chooserOpen && (
        <PlaceChooser
          ref={chooserRef}
          id={chooserId}
          titulo={openGroup ? groupTitle(openGroup) : "Sem ponto no mapa"}
          total={openGroup ? openGroup.events.length : offMap}
          sections={sections}
          selectedSlug={selectedSlug}
          onSelect={chooseFromList}
          onClose={closeChooser}
        />
      )}
    </div>
  );
}
