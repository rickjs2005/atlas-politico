// Controles do mapa: aproximar, afastar e enquadrar o recorte. São botões da
// própria página, e não os do MapLibre, para terem a área de toque e os nomes
// do resto do atlas. Quem move a câmera é `MapCanvas`.

interface MapControlsProps {
  canZoomIn: boolean;
  canZoomOut: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  /** Leva a câmera aos lugares do recorte. */
  onFit: () => void;
}

const button =
  "grid size-11 place-items-center bg-raised text-ink transition-colors duration-[var(--atlas-fast)] hover:bg-paper disabled:text-line-strong disabled:hover:bg-raised xl:size-9";

export function MapControls({ canZoomIn, canZoomOut, onZoomIn, onZoomOut, onFit }: MapControlsProps) {
  return (
    <div
      role="group"
      aria-label="Controles do mapa"
      className="absolute right-2 top-2 z-20 flex flex-col divide-y divide-line border border-ink-faint"
    >
      <button type="button" aria-label="Aproximar" disabled={!canZoomIn} onClick={onZoomIn} className={button}>
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" className="fill-none stroke-current stroke-2">
          <path d="M8 2.5v11M2.5 8h11" />
        </svg>
      </button>
      <button type="button" aria-label="Afastar" disabled={!canZoomOut} onClick={onZoomOut} className={button}>
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" className="fill-none stroke-current stroke-2">
          <path d="M2.5 8h11" />
        </svg>
      </button>
      <button type="button" aria-label="Enquadrar os lugares do recorte" onClick={onFit} className={button}>
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" className="fill-none stroke-current stroke-[1.5]">
          <path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" />
          <circle cx="8" cy="8" r="1.75" className="fill-current stroke-none" />
        </svg>
      </button>
    </div>
  );
}
