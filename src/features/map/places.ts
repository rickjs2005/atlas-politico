// Dos pontos aos marcadores. Funções puras: recebem a coleção GeoJSON do
// recorte e devolvem o que o mapa desenha.
//
// Um ponto é o encontro de um acontecimento com um de seus lugares. As
// coordenadas são as do lugar (o centro do município ou do estado), e por isso
// todos os acontecimentos de um lugar caem exatamente no mesmo ponto. O mapa
// não empilha esses pontos: ele desenha um marcador por lugar, com os
// acontecimentos dentro. Lugares que, na escala em vigor, ficariam um sobre o
// outro dividem um marcador.
//
// Três quantidades diferentes, que nunca se misturam:
//   pontos           pares de acontecimento e lugar (o que o GeoJSON tem);
//   lugares          lugares documentados;
//   acontecimentos   registros distintos. Um acontecimento com dois lugares
//                    gera dois pontos e conta uma vez.

import type { EventPointCollection } from "@/lib/data/types";
import type { Categoria } from "@/lib/domain/categories";
import type { DataHistorica } from "@/lib/domain/dates";
import type { Position, PrecisaoGeografica } from "@/lib/domain/geo";

/** Um acontecimento como o mapa o apresenta: o bastante para distinguir um do outro. */
export interface PlacedEvent {
  eventId: string;
  slug: string;
  titulo: string;
  categoria: Categoria;
  /** A data como está no conteúdo, com a precisão que a fonte sustenta. */
  data: DataHistorica;
  /** Posição na ordem cronológica do recorte. */
  ordem: number;
}

/** Um lugar documentado, com os acontecimentos do recorte que o citam. */
export interface MapPlace {
  placeId: string;
  nome: string;
  precisao: PrecisaoGeografica;
  position: Position;
  /** Em ordem cronológica. */
  events: PlacedEvent[];
}

/** Um marcador: um lugar, ou vários lugares que nesta escala se cobririam. */
export interface MarkerGroup {
  /** Os `placeId` do grupo, em ordem, unidos por `+`. Estável enquanto o grupo for o mesmo. */
  id: string;
  /** O lugar com mais acontecimentos primeiro. */
  places: MapPlace[];
  /** Onde o marcador fica: a posição do primeiro lugar. */
  position: Position;
  /** Acontecimentos distintos do grupo, em ordem cronológica. */
  events: PlacedEvent[];
}

const byText = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

/** Os lugares do recorte, em ordem de nome, cada um com os seus acontecimentos. */
export function buildPlaces(colecao: EventPointCollection): MapPlace[] {
  const lugares = new Map<string, MapPlace>();
  const ordemDoEvento = new Map<string, number>();

  for (const { geometry, properties } of colecao.features) {
    // A coleção vem em ordem cronológica: a primeira vez que um acontecimento
    // aparece fixa a posição dele.
    if (!ordemDoEvento.has(properties.eventId)) {
      ordemDoEvento.set(properties.eventId, ordemDoEvento.size);
    }
    const [longitude = 0, latitude = 0] = geometry.coordinates;

    let lugar = lugares.get(properties.placeId);
    if (!lugar) {
      lugar = {
        placeId: properties.placeId,
        nome: properties.lugarNome,
        precisao: properties.precisaoGeografica,
        position: [longitude, latitude],
        events: [],
      };
      lugares.set(properties.placeId, lugar);
    }
    if (lugar.events.some((item) => item.eventId === properties.eventId)) continue;

    lugar.events.push({
      eventId: properties.eventId,
      slug: properties.acontecimentoSlug,
      titulo: properties.titulo,
      categoria: properties.categoria,
      data: { valor: properties.dataValor, precisao: properties.dataPrecisao },
      ordem: ordemDoEvento.get(properties.eventId)!,
    });
  }

  return [...lugares.values()].sort(
    (a, b) => byText(a.nome, b.nome) || byText(a.placeId, b.placeId),
  );
}

/**
 * Separa os lugares que caem na área que a base do mapa cobre dos que ficam
 * fora dela. Um lugar fora da área não é desenhado: a câmera não chega lá, e
 * não há terra para situá-lo. Ele continua acessível pela lista do mapa, com o
 * nome dito.
 */
export function splitByArea(
  places: readonly MapPlace[],
  [oeste, sul, leste, norte]: readonly [number, number, number, number],
): { dentro: MapPlace[]; fora: MapPlace[] } {
  const dentro: MapPlace[] = [];
  const fora: MapPlace[] = [];
  for (const place of places) {
    const [longitude, latitude] = place.position;
    const naArea = longitude >= oeste && longitude <= leste && latitude >= sul && latitude <= norte;
    (naArea ? dentro : fora).push(place);
  }
  return { dentro, fora };
}

/**
 * Dos lugares fora da área, só os acontecimentos que não têm nenhum marcador.
 * O acontecimento que também tem um lugar dentro da área já está no mapa: ele
 * não entra na conta do que ficou sem ponto.
 */
export function withoutMarker(
  fora: readonly MapPlace[],
  dentro: readonly MapPlace[],
): MapPlace[] {
  const noMapa = new Set(dentro.flatMap((place) => place.events.map((evento) => evento.eventId)));
  return fora
    .map((place) => ({
      ...place,
      events: place.events.filter((evento) => !noMapa.has(evento.eventId)),
    }))
    .filter((place) => place.events.length > 0);
}

/** Acontecimentos distintos de um conjunto de lugares, em ordem cronológica. */
export function distinctEvents(places: readonly MapPlace[]): PlacedEvent[] {
  const vistos = new Map<string, PlacedEvent>();
  for (const place of places) {
    for (const evento of place.events) {
      if (!vistos.has(evento.eventId)) vistos.set(evento.eventId, evento);
    }
  }
  return [...vistos.values()].sort((a, b) => a.ordem - b.ordem);
}

export interface ScreenPoint {
  x: number;
  y: number;
}

/**
 * Junta em um marcador os lugares que, na tela, ficariam a menos de `raio`
 * pixels um do outro. Lugares com as mesmas coordenadas ficam sempre juntos,
 * em qualquer escala.
 *
 * O lugar com mais acontecimentos puxa os vizinhos, e o marcador fica na
 * posição dele. Como ninguém entra em um grupo estando a `raio` ou mais do
 * lugar que o puxou, dois marcadores nunca ficam mais próximos do que `raio`.
 */
export function groupPlaces(
  places: readonly MapPlace[],
  project: (position: Position) => ScreenPoint,
  raio: number,
): MarkerGroup[] {
  const candidatos = places
    .map((place) => ({ place, tela: project(place.position) }))
    .sort(
      (a, b) =>
        b.place.events.length - a.place.events.length || byText(a.place.placeId, b.place.placeId),
    );

  const usados = new Set<string>();
  const grupos: MarkerGroup[] = [];

  for (const semente of candidatos) {
    if (usados.has(semente.place.placeId)) continue;

    const membros = candidatos.filter(
      (outro) =>
        !usados.has(outro.place.placeId) &&
        Math.hypot(outro.tela.x - semente.tela.x, outro.tela.y - semente.tela.y) < raio,
    );
    for (const { place } of membros) usados.add(place.placeId);

    const lugares = membros.map(({ place }) => place);
    grupos.push({
      id: lugares
        .map((place) => place.placeId)
        .sort(byText)
        .join("+"),
      places: lugares,
      position: semente.place.position,
      events: distinctEvents(lugares),
    });
  }

  // De norte a sul e, na mesma latitude, de oeste a leste: é a ordem em que o
  // teclado percorre os marcadores.
  return grupos.sort(
    (a, b) =>
      b.position[1] - a.position[1] || a.position[0] - b.position[0] || byText(a.id, b.id),
  );
}

/** Os marcadores em que um acontecimento aparece: onde a seleção se mostra no mapa. */
export function groupsOfEvent(groups: readonly MarkerGroup[], slug: string | null): MarkerGroup[] {
  if (slug === null) return [];
  return groups.filter((group) => group.events.some((evento) => evento.slug === slug));
}

/** Os lugares de um acontecimento, para a câmera. */
export function placesOfEvent(places: readonly MapPlace[], slug: string | null): MapPlace[] {
  if (slug === null) return [];
  return places.filter((place) => place.events.some((evento) => evento.slug === slug));
}

/** Quantos pontos, lugares e acontecimentos distintos há em uma coleção. */
export function countPlaced(colecao: EventPointCollection): {
  pontos: number;
  lugares: number;
  acontecimentos: number;
} {
  const lugares = buildPlaces(colecao);
  return {
    pontos: colecao.features.length,
    lugares: lugares.length,
    acontecimentos: distinctEvents(lugares).length,
  };
}

// ---------------------------------------------------------------------------
// Textos
// ---------------------------------------------------------------------------

const plural = (quantos: number, um: string, varios: string) =>
  `${quantos} ${quantos === 1 ? um : varios}`;

/** `3 acontecimentos`, `1 acontecimento`. */
export function countEvents(quantos: number): string {
  return plural(quantos, "acontecimento", "acontecimentos");
}

/** O texto curto ao lado do marcador: o nome do lugar, ou quantos lugares ele reúne. */
export function groupLabel(group: MarkerGroup): string {
  const [unico] = group.places;
  return group.places.length === 1 && unico ? unico.nome : `${group.places.length} lugares`;
}

/** O título do grupo por extenso, para o seletor e para leitores de tela. */
export function groupTitle(group: MarkerGroup): string {
  const [unico] = group.places;
  if (group.places.length === 1 && unico) return unico.nome;
  const nomes = group.places.map((place) => place.nome).sort(byText);
  return `${group.places.length} lugares próximos: ${nomes.join(", ")}`;
}
