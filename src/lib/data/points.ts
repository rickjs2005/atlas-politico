// Pontos do mapa em GeoJSON. Um acontecimento com dois lugares gera dois
// pontos, ligados ao mesmo `eventId`; um acontecimento de abrangência nacional
// ou sem lugar documentado não gera nenhum e continua nas consultas e na linha
// do tempo.
//
// Só entra o que está documentado: um ponto por lugar citado no registro. A
// ordem cronológica dos pontos não é um trajeto, e nenhuma linha entre eles é
// gerada aqui.

import { yearOf } from "@/lib/domain/dates";
import { toPosition } from "@/lib/domain/geo";
import type { Acontecimento, Lugar } from "@/lib/domain/types";

import type { EventPointCollection } from "./types";

/** Identificador estável do ponto: o acontecimento e o lugar que ele liga. */
export function pointId(eventId: string, placeId: string): string {
  return `${eventId}@${placeId}`;
}

export function buildEventPoints(
  acontecimentos: readonly Acontecimento[],
  lugares: readonly Lugar[],
): EventPointCollection {
  const lugarPorId = new Map(lugares.map((lugar) => [lugar.id, lugar]));

  return {
    type: "FeatureCollection",
    features: acontecimentos.flatMap((acontecimento) => {
      if (acontecimento.localizacao.tipo !== "lugares") return [];

      // O mesmo lugar citado duas vezes continua sendo um ponto só.
      return [...new Set(acontecimento.localizacao.lugarIds)].flatMap((lugarId) => {
        const lugar = lugarPorId.get(lugarId);
        if (!lugar) return [];

        return {
          type: "Feature" as const,
          id: pointId(acontecimento.id, lugar.id),
          geometry: { type: "Point" as const, coordinates: toPosition(lugar) },
          properties: {
            eventId: acontecimento.id,
            placeId: lugar.id,
            acontecimentoSlug: acontecimento.slug,
            titulo: acontecimento.titulo,
            categoria: acontecimento.categoria,
            pessoaIds: [...acontecimento.pessoaIds],
            ano: yearOf(acontecimento.data),
            dataValor: acontecimento.data.valor,
            dataPrecisao: acontecimento.data.precisao,
            lugarNome: lugar.nome,
            precisaoGeografica: lugar.precisaoGeografica,
          },
        };
      });
    }),
  };
}

/**
 * Pontos de um recorte: os da coleção cujos acontecimentos estão na lista. A
 * ordem da coleção é mantida, e o acontecimento com vários lugares mantém
 * todos os seus pontos.
 */
export function filterPoints(
  colecao: EventPointCollection,
  acontecimentos: readonly { id: string }[],
): EventPointCollection {
  const ids = new Set(acontecimentos.map((acontecimento) => acontecimento.id));
  return {
    type: "FeatureCollection",
    features: colecao.features.filter((ponto) => ids.has(ponto.properties.eventId)),
  };
}

/** Um acontecimento sem ponto no mapa, com o motivo. */
export interface UnplacedEvent {
  eventId: string;
  slug: string;
  titulo: string;
  categoria: Acontecimento["categoria"];
  data: Acontecimento["data"];
  /** `nacional`: abrangência nacional. `desconhecida`: lugar não documentado. */
  motivo: "nacional" | "desconhecida";
}

/**
 * Os acontecimentos de um recorte que não geram ponto, na ordem recebida. O
 * mapa não inventa um lugar para eles: mostra quantos são e dá acesso a cada
 * um, com o motivo.
 */
export function listUnplaced(acontecimentos: readonly Acontecimento[]): UnplacedEvent[] {
  return acontecimentos.flatMap((acontecimento) => {
    if (acontecimento.localizacao.tipo === "lugares") return [];
    return [
      {
        eventId: acontecimento.id,
        slug: acontecimento.slug,
        titulo: acontecimento.titulo,
        categoria: acontecimento.categoria,
        data: acontecimento.data,
        motivo: acontecimento.localizacao.tipo,
      },
    ];
  });
}
