// Regras de câmera do mapa. Funções puras: dizem para onde a câmera deve ir e
// até onde pode chegar; quem a move é `MapCanvas`.
//
// Os limites existem por dois motivos, e os dois são sobre não sugerir uma
// precisão que o atlas não tem:
//   - a base é de contornos simplificados (Natural Earth, 1:50 milhões) e só
//     cobre a América do Sul e parte da Central (`base/README.md`);
//   - as coordenadas dos lugares são centros de município ou de estado.

import type { Position, PrecisaoGeografica } from "@/lib/domain/geo";

/** `[oeste, sul, leste, norte]`. */
export type Box = [oeste: number, sul: number, leste: number, norte: number];

export const MAP_LIMITS = {
  /** Abaixo disto a área navegável já cabe inteira em qualquer tela. */
  minZoom: 2,
  /** Acima disto o litoral e as divisas da base de 1:50 milhões viram segmentos de reta. */
  maxZoom: 6,
  /** A caixa que a base cobre. Fora dela não há terra desenhada, e a câmera não sai dela. */
  bounds: [-93, -57, -30, 16] as Box,
} as const;

/**
 * Enquadramento sem pontos para mostrar: o território brasileiro continental,
 * com margem. Tem de caber na área que a base cobre; um teste confere.
 */
export const DEFAULT_BOUNDS: Box = [-75, -35, -33, 7];

/**
 * Até onde a câmera se aproxima sozinha de um lugar, conforme a precisão da
 * coordenada. O centro de um estado não é um endereço: aproximar demais faria
 * o ponto parecer um.
 */
export const PRECISION_ZOOM_CAP: Record<PrecisaoGeografica, number> = {
  local: 6,
  municipio: 5.5,
  uf: 4.5,
  pais: 3.5,
};

/** Zoom a partir do qual um lugar isolado fica identificável na base. */
const FOCUS_ZOOM = 4;
/** Zoom do enquadramento inicial quando o recorte tem um lugar só. */
const SINGLE_PLACE_ZOOM = 5;

/** O teto de zoom de um conjunto de lugares: o do menos preciso. */
export function zoomCapFor(precisoes: readonly PrecisaoGeografica[]): number {
  if (precisoes.length === 0) return MAP_LIMITS.maxZoom;
  return Math.min(...precisoes.map((precisao) => PRECISION_ZOOM_CAP[precisao]));
}

/**
 * Zoom ao levar a câmera a um lugar só: mantém o zoom em que a pessoa está,
 * desde que o lugar fique identificável e o teto da precisão seja respeitado.
 */
export function focusZoom(atual: number, teto: number): number {
  return Math.min(Math.max(atual, FOCUS_ZOOM), teto);
}

/** A menor caixa que contém as posições; `null` sem nenhuma. */
export function boundsOf(positions: readonly Position[]): Box | null {
  if (positions.length === 0) return null;
  const longitudes = positions.map(([longitude]) => longitude);
  const latitudes = positions.map(([, latitude]) => latitude);
  return [
    Math.min(...longitudes),
    Math.min(...latitudes),
    Math.max(...longitudes),
    Math.max(...latitudes),
  ];
}

interface Located {
  position: Position;
  precisao: PrecisaoGeografica;
}

export type Framing =
  /** Nada para enquadrar: vale o enquadramento padrão. */
  | { tipo: "padrao"; bounds: Box }
  /** Um lugar só: centro e zoom. */
  | { tipo: "centro"; center: Position; zoom: number }
  /** Vários lugares: a caixa que os contém, com teto de zoom. */
  | { tipo: "caixa"; bounds: Box; maxZoom: number };

const samePosition = (a: Position, b: Position) => a[0] === b[0] && a[1] === b[1];

/**
 * Enquadramento de um conjunto de lugares. `zoomAtual` entra quando a câmera
 * já está em uso e vai a um lugar só; sem ele, vale o zoom do enquadramento
 * inicial.
 */
export function frameOf(lugares: readonly Located[], zoomAtual?: number): Framing {
  const [primeiro] = lugares;
  if (!primeiro) return { tipo: "padrao", bounds: DEFAULT_BOUNDS };

  const teto = zoomCapFor(lugares.map((lugar) => lugar.precisao));
  if (lugares.every((lugar) => samePosition(lugar.position, primeiro.position))) {
    return {
      tipo: "centro",
      center: primeiro.position,
      zoom:
        zoomAtual === undefined ? Math.min(SINGLE_PLACE_ZOOM, teto) : focusZoom(zoomAtual, teto),
    };
  }

  return { tipo: "caixa", bounds: boundsOf(lugares.map((lugar) => lugar.position))!, maxZoom: teto };
}

/** Faixas do mapa cobertas por outros elementos, em pixels. */
export interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** Folga entre um ponto e a borda da área livre para ele contar como à vista. */
export const VIEW_MARGIN = 32;

/**
 * O ponto está na parte livre do mapa? É o que decide se a câmera precisa se
 * mover: quem já está vendo o lugar não deve ver o mapa andar.
 */
export function isInView(
  ponto: { x: number; y: number },
  tamanho: { width: number; height: number },
  cobertura: Insets,
  margem: number = VIEW_MARGIN,
): boolean {
  return (
    ponto.x >= cobertura.left + margem &&
    ponto.x <= tamanho.width - cobertura.right - margem &&
    ponto.y >= cobertura.top + margem &&
    ponto.y <= tamanho.height - cobertura.bottom - margem
  );
}

/**
 * Folga a mais à direita de um enquadramento: o nome de cada lugar fica à
 * direita do marcador, e os controles do mapa, no canto direito.
 */
export const LABEL_ROOM = 56;

/**
 * Faixa de cima do mapa, onde ficam o botão dos acontecimentos sem ponto e os
 * avisos. Um enquadramento não põe marcador ali, desde que o quadro tenha
 * altura para isso: em um quadro baixo sobraria pouco mapa.
 */
export const TOP_ROOM = 40;
export const TOP_ROOM_MIN_HEIGHT = 320;

/**
 * Espaço deixado em volta de um enquadramento, somado ao que está coberto.
 * `altura` é a do quadro do mapa, em pixels.
 */
export function paddingFor(
  cobertura: Insets,
  altura: number = Number.POSITIVE_INFINITY,
  base: number = 48,
): Insets {
  const faixa = altura >= TOP_ROOM_MIN_HEIGHT ? TOP_ROOM : 0;
  return {
    top: cobertura.top + base + faixa,
    right: cobertura.right + base + LABEL_ROOM,
    bottom: cobertura.bottom + base,
    left: cobertura.left + base,
  };
}

/** Posição vertical de uma latitude na projeção de Mercator, de 0 (norte) a 1 (sul). */
function mercatorY(latitude: number): number {
  const radianos = (latitude * Math.PI) / 180;
  return (1 - Math.log(Math.tan(Math.PI / 4 + radianos / 2)) / Math.PI) / 2;
}

/** Lado do mundo, em pixels, no zoom 0 do MapLibre. */
const WORLD_SIZE = 512;

/**
 * O menor zoom em que a tela ainda cabe dentro de uma caixa. É até onde a
 * câmera consegue se afastar quando não pode sair da área que a base cobre: em
 * uma tela larga, esse piso fica acima do zoom mínimo declarado.
 */
export function minZoomInside(
  tamanho: { width: number; height: number },
  [oeste, sul, leste, norte]: Box,
): number {
  const larguraDaCaixa = (leste - oeste) / 360;
  const alturaDaCaixa = mercatorY(sul) - mercatorY(norte);
  const porLargura = Math.log2(tamanho.width / (WORLD_SIZE * larguraDaCaixa));
  const porAltura = Math.log2(tamanho.height / (WORLD_SIZE * alturaDaCaixa));
  return Math.max(porLargura, porAltura);
}

/**
 * O menor deslocamento da câmera, em pixels, que põe o ponto na parte livre do
 * mapa. `[0, 0]` quando ele já está lá. Serve para tirar um marcador de baixo
 * de um quadro sem refazer o enquadramento.
 */
export function nudgeIntoView(
  ponto: { x: number; y: number },
  tamanho: { width: number; height: number },
  cobertura: Insets,
  margem: number = VIEW_MARGIN,
): [number, number] {
  const esquerda = cobertura.left + margem;
  const direita = tamanho.width - cobertura.right - margem;
  const topo = cobertura.top + margem;
  const base = tamanho.height - cobertura.bottom - margem;
  const fora = (valor: number, minimo: number, maximo: number) =>
    // Área livre menor que a margem: o meio dela é o melhor que há.
    minimo > maximo ? valor - (minimo + maximo) / 2 : valor < minimo ? valor - minimo : valor > maximo ? valor - maximo : 0;
  return [fora(ponto.x, esquerda, direita), fora(ponto.y, topo, base)];
}
