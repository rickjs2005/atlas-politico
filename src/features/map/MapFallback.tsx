// Leitura alternativa do mapa: os mesmos lugares, em texto, com a mesma
// seleção. É o que aparece quando o mapa não pode ser desenhado. Não depende
// do MapLibre, e por isso continua de pé em qualquer falha dele.

import { CategoryMark } from "@/components/Category";
import type { EventPointCollection } from "@/lib/data/types";
import { formatDate } from "@/lib/domain/dates";
import { GEO_PRECISION_LABELS, formatCoordinates } from "@/lib/domain/geo";

import { buildPlaces } from "./places";

/** Por que o mapa não está sendo desenhado. */
export type MapFailure =
  /** O navegador não oferece WebGL. */
  | "sem-webgl"
  /** O código do mapa não chegou. */
  | "pacote"
  /** O mapa não terminou de carregar a tempo. */
  | "tempo"
  /** Os arquivos de contorno não carregaram. */
  | "base"
  /** O navegador tirou o contexto gráfico e não o devolveu. */
  | "contexto";

const FAILURES: Record<MapFailure, { titulo: string; detalhe: string; saida: "tentar" | "recarregar" | null }> = {
  "sem-webgl": {
    titulo: "O mapa não pôde ser exibido neste navegador.",
    detalhe: "O navegador ou o aparelho não oferece WebGL, que o mapa usa para desenhar.",
    saida: null,
  },
  pacote: {
    titulo: "O mapa não pôde ser exibido agora.",
    detalhe: "O código do mapa não chegou. Pode ser a conexão.",
    saida: "recarregar",
  },
  tempo: {
    titulo: "O mapa não pôde ser exibido agora.",
    detalhe: "Ele não terminou de carregar.",
    saida: "tentar",
  },
  base: {
    titulo: "O mapa não pôde ser exibido agora.",
    detalhe: "Os contornos do mapa não carregaram.",
    saida: "tentar",
  },
  contexto: {
    titulo: "O mapa não pôde ser exibido agora.",
    detalhe: "O navegador interrompeu o desenho e não o retomou.",
    saida: "tentar",
  },
};

interface MapFallbackProps {
  features: EventPointCollection;
  selectedSlug: string | null;
  onSelect?: (slug: string) => void;
  reason?: MapFailure;
  /** Monta o mapa de novo. */
  onRetry?: () => void;
}

export function MapFallback({
  features,
  selectedSlug,
  onSelect,
  reason = "sem-webgl",
  onRetry,
}: MapFallbackProps) {
  const lugares = buildPlaces(features);
  const { titulo, detalhe, saida } = FAILURES[reason];
  const acao = "min-h-11 border border-ink px-4 text-sm font-medium hover:bg-ink hover:text-paper";

  return (
    <div
      data-map-fallback={reason}
      className="relative h-full min-h-64 overflow-y-auto border border-ink-faint bg-raised p-4 md:min-h-40"
    >
      <div role="status" className="space-y-1 text-sm">
        <p>
          <strong>{titulo}</strong> {detalhe}
        </p>
        <p className="text-ink-soft">
          Os lugares do recorte atual seguem em lista, e a seleção continua funcionando.
        </p>
      </div>

      {saida === "tentar" && onRetry && (
        <button type="button" onClick={onRetry} className={`mt-3 ${acao}`}>
          Tentar de novo
        </button>
      )}
      {saida === "recarregar" && (
        <button type="button" onClick={() => window.location.reload()} className={`mt-3 ${acao}`}>
          Recarregar a página
        </button>
      )}

      {lugares.length === 0 ? (
        <p className="mt-3 text-sm text-ink-soft">Nenhum lugar documentado neste recorte.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {lugares.map((lugar) => {
            const [longitude, latitude] = lugar.position;
            return (
              <li key={lugar.placeId} data-lugar={lugar.placeId}>
                <p className="text-sm font-semibold">{lugar.nome}</p>
                <p className="numerals text-xs text-ink-soft">
                  {formatCoordinates({ longitude, latitude })} · {GEO_PRECISION_LABELS[lugar.precisao]}
                </p>
                <ul className="mt-1 divide-y divide-line border-y border-line">
                  {lugar.events.map((evento) => {
                    const selecionado = evento.slug === selectedSlug;
                    const linha = (
                      <>
                        <CategoryMark categoria={evento.categoria} size={10} className="mt-1" />
                        <span className="min-w-0">
                          {/* Fora da tela, o lugar entra no nome: a lista é lida item a item. */}
                          <span className="sr-only">{lugar.nome}: </span>
                          <span className="numerals block text-xs font-semibold">
                            {formatDate(evento.data)}
                          </span>
                          <span className="block">{evento.titulo}</span>
                        </span>
                      </>
                    );
                    const classe =
                      "grid w-full grid-cols-[1rem_minmax(0,1fr)] gap-x-2 border-l-[3px] border-transparent px-2 py-2 text-left text-sm";
                    return (
                      <li key={evento.eventId}>
                        {onSelect ? (
                          <button
                            type="button"
                            data-ponto={`${evento.eventId}@${lugar.placeId}`}
                            aria-pressed={selecionado}
                            onClick={() => onSelect(evento.slug)}
                            className={`${classe} min-h-11 hover:bg-paper aria-pressed:border-accent aria-pressed:bg-accent-soft`}
                          >
                            {linha}
                          </button>
                        ) : (
                          <p className={classe}>{linha}</p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
