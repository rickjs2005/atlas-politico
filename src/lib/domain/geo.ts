// Regras geográficas do atlas. Módulo puro, sem Zod.
//
// No conteúdo, as coordenadas são campos nomeados (`longitude`, `latitude`)
// para que quem edita não dependa de lembrar a ordem. A ordem do GeoJSON
// (longitude primeiro) é aplicada em um único lugar: `toPosition`.

export const PRECISOES_GEOGRAFICAS = ["local", "municipio", "uf", "pais"] as const;
export type PrecisaoGeografica = (typeof PRECISOES_GEOGRAFICAS)[number];

export const GEO_PRECISION_LABELS: Record<PrecisaoGeografica, string> = {
  local: "Local específico",
  municipio: "Aproximação: centro do município",
  uf: "Aproximação: unidade da federação",
  pais: "Aproximação: país",
};

export interface Coordenadas {
  longitude: number;
  latitude: number;
}

/** Posição GeoJSON (RFC 7946): `[longitude, latitude]`. */
export type Position = [longitude: number, latitude: number];

export function toPosition(coordenadas: Coordenadas): Position {
  return [coordenadas.longitude, coordenadas.latitude];
}

/** Texto de leitura, usado quando o mapa não está disponível: `10,0000° S, 50,0000° O`. */
export function formatCoordinates({ longitude, latitude }: Coordenadas): string {
  const grau = (valor: number) => Math.abs(valor).toFixed(4).replace(".", ",");
  return `${grau(latitude)}° ${latitude < 0 ? "S" : "N"}, ${grau(longitude)}° ${longitude < 0 ? "O" : "L"}`;
}

// Extremos do território brasileiro com folga, incluindo as ilhas oceânicas
// (Trindade e Martim Vaz a leste). Uma coordenada do continente com longitude
// e latitude trocadas sempre cai fora desta caixa, então ela pega a inversão.
const BRAZIL_BOX = { oeste: -74.1, leste: -28.8, sul: -33.8, norte: 5.3 };

export function isInsideBrazilBox({ longitude, latitude }: Coordenadas): boolean {
  return (
    longitude >= BRAZIL_BOX.oeste &&
    longitude <= BRAZIL_BOX.leste &&
    latitude >= BRAZIL_BOX.sul &&
    latitude <= BRAZIL_BOX.norte
  );
}
