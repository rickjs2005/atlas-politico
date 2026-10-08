// Converte acontecimentos e lugares na coleção GeoJSON que o mapa desenha.
// Um acontecimento com dois lugares gera dois pontos; um acontecimento de
// abrangência nacional ou sem lugar documentado não gera nenhum e continua
// acessível pela lista.

import type { FeatureCollection, Point } from "geojson";

import { toPosition, type PrecisaoGeografica } from "@/lib/domain/geo";
import type { Acontecimento, Lugar } from "@/lib/domain/types";

export interface EventFeatureProperties {
  acontecimentoSlug: string;
  titulo: string;
  lugarId: string;
  lugarNome: string;
  precisaoGeografica: PrecisaoGeografica;
}

export type EventFeatureCollection = FeatureCollection<Point, EventFeatureProperties>;

export function buildEventFeatures(
  acontecimentos: Acontecimento[],
  lugares: Lugar[],
): EventFeatureCollection {
  const lugarPorId = new Map(lugares.map((lugar) => [lugar.id, lugar]));

  return {
    type: "FeatureCollection",
    features: acontecimentos.flatMap((acontecimento) => {
      if (acontecimento.localizacao.tipo !== "lugares") return [];

      return acontecimento.localizacao.lugarIds.flatMap((lugarId) => {
        const lugar = lugarPorId.get(lugarId);
        if (!lugar) return [];

        return {
          type: "Feature" as const,
          geometry: { type: "Point" as const, coordinates: toPosition(lugar) },
          properties: {
            acontecimentoSlug: acontecimento.slug,
            titulo: acontecimento.titulo,
            lugarId: lugar.id,
            lugarNome: lugar.nome,
            precisaoGeografica: lugar.precisaoGeografica,
          },
        };
      });
    }),
  };
}
