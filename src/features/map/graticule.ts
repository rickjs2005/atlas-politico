// Grade de meridianos e paralelos, gerada no próprio código. É a única
// referência espacial do mapa até a base cartográfica local (Natural Earth)
// entrar na fase 6. Não depende de arquivo nem de rede.

import type { FeatureCollection, LineString } from "geojson";

import type { Position } from "@/lib/domain/geo";

export interface GraticuleProperties {
  eixo: "meridiano" | "paralelo";
  grau: number;
}

const MAX_LATITUDE = 80; // acima disso a projeção de Mercator estica demais

export function buildGraticule(
  passo: number,
): FeatureCollection<LineString, GraticuleProperties> {
  const linha = (eixo: GraticuleProperties["eixo"], grau: number, pontos: Position[]) => ({
    type: "Feature" as const,
    geometry: { type: "LineString" as const, coordinates: pontos },
    properties: { eixo, grau },
  });

  const features = [];
  for (let longitude = -180; longitude <= 180; longitude += passo) {
    features.push(
      linha("meridiano", longitude, [
        [longitude, -MAX_LATITUDE],
        [longitude, MAX_LATITUDE],
      ]),
    );
  }
  for (let latitude = -MAX_LATITUDE; latitude <= MAX_LATITUDE; latitude += passo) {
    features.push(
      linha("paralelo", latitude, [
        [-180, latitude],
        [180, latitude],
      ]),
    );
  }

  return { type: "FeatureCollection", features };
}
