// Legenda do mapa: só os símbolos que o recorte em vigor usa, com o que cada
// um quer dizer, e o aviso de que os pontos e a base são aproximados. Fica
// recolhida, com esse aviso à vista.

import type { Categoria } from "@/lib/domain/categories";

import { MarkerSymbol } from "./PlaceMarker";

interface MapLegendProps {
  /** Categoria de exemplo para o símbolo de um acontecimento; `null` se o recorte não tem nenhum. */
  single: Categoria | null;
  /** Há marcador com mais de um acontecimento. */
  multiple: boolean;
  /** Há lugar conhecido só pelo estado ou pelo país. */
  broad: boolean;
  /** Há seleção, e ela tem ponto. */
  selected: boolean;
  className?: string;
}

export function MapLegend({ single, multiple, broad, selected, className = "" }: MapLegendProps) {
  const item = "grid grid-cols-[2.25rem_minmax(0,1fr)] items-center gap-x-2";
  const simbolo = "grid place-items-center";

  return (
    // O fundo nunca é opaco de todo. Em um navegador que desenha o mapa sem
    // placa de vídeo, um quadro opaco que aparece sobre o canvas parado fazia
    // sumir a base ao lado dele; um teste confere.
    <details
      className={`group/leg max-w-[min(20rem,calc(100%_-_4rem))] bg-raised/95 text-[0.6875rem] leading-snug text-ink-soft open:bg-raised/[0.98] ${className}`}
    >
      <summary className="flex min-h-7 cursor-pointer list-none items-center gap-1.5 px-2 py-1 [&::-webkit-details-marker]:hidden">
        <span className="font-semibold text-ink">Legenda</span>
        <span>· pontos aproximados</span>
        <span
          aria-hidden="true"
          className="transition-transform duration-[var(--atlas-fast)] group-open/leg:rotate-180"
        >
          ▴
        </span>
      </summary>

      <div className="space-y-2 border-t border-line px-2 pb-2 pt-2">
        <ul className="space-y-1.5">
          {single !== null && (
            <li className={item}>
              <span className={simbolo}>
                <MarkerSymbol categoria={single} count={1} />
              </span>
              <span>Um acontecimento. A forma e a cor são as da categoria, como nos filtros.</span>
            </li>
          )}
          {multiple && (
            <li className={item}>
              <span className={simbolo}>
                <MarkerSymbol count={3} />
              </span>
              <span>
                Vários acontecimentos no mesmo lugar, ou em lugares próximos nesta escala. O número
                conta acontecimentos; o marcador abre a lista.
              </span>
            </li>
          )}
          {broad && (
            <li className={item}>
              <span className={simbolo}>
                <MarkerSymbol count={3} broad />
              </span>
              <span>Contorno tracejado: só o estado é conhecido. O ponto fica no centro do estado.</span>
            </li>
          )}
          {selected && (
            <li className={item}>
              <span className={simbolo}>
                <MarkerSymbol count={3} selected />
              </span>
              <span>Anel laranja: onde fica o acontecimento aberto.</span>
            </li>
          )}
        </ul>
        <p>
          Todo ponto é o centro de um município ou de um estado, e não um endereço. A base é de
          contornos simplificados (Natural Earth, 1:50 milhões), sem cidades nem estradas, e por isso
          o mapa não se aproxima além da escala regional. Pontos não formam um trajeto.
        </p>
      </div>
    </details>
  );
}
