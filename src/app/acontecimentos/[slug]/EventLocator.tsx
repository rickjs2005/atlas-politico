"use client";

// Mapa de localização da página de um acontecimento: os pontos daquele
// registro, já em foco. É o mesmo `MapView` da exploração, com a mesma lista
// de lugares no lugar do mapa quando ele falha.

import { MapView } from "@/features/map/MapView";
import type { EventPointCollection } from "@/lib/data/types";

export function EventLocator({ points, slug }: { points: EventPointCollection; slug: string }) {
  return (
    <div className="h-64">
      {/* Na página de um só acontecimento não há o que selecionar: os lugares
          são só mostrados. A página rola, então mover o mapa pede dois dedos,
          ou Ctrl e a rolagem. */}
      <MapView features={points} selectedSlug={slug} gestures="cooperativos" />
    </div>
  );
}
