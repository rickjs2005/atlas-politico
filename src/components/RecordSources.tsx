// Fontes de um registro que não tem página própria: um cargo, uma filiação.
// Ficam junto do registro que sustentam, recolhidas, e abrem com a mesma lista
// de fontes do resto do atlas: documento, quem publicou, datas, onde está o
// trecho e o que ele sustenta.
//
// Elemento nativo de abrir e fechar: funciona sem JavaScript e com teclado.

import { SourceList, type SourceEntry } from "@/components/SourceList";

interface RecordSourcesProps {
  entries: readonly SourceEntry[];
  /** De que registro são as fontes, para leitores de tela: "Senador (RJ)". */
  about: string;
  className?: string;
}

export function RecordSources({ entries, about, className = "" }: RecordSourcesProps) {
  if (entries.length === 0) return null;

  return (
    <details className={`group/src ${className}`}>
      <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1 text-xs font-medium text-ink-soft underline decoration-line-strong hover:text-ink md:min-h-6 [&::-webkit-details-marker]:hidden">
        {entries.length === 1 ? "1 fonte" : `${entries.length} fontes`}
        <span className="sr-only"> de {about}</span>
        <span
          aria-hidden="true"
          className="no-underline transition-transform duration-[var(--atlas-fast)] group-open/src:rotate-180"
        >
          ▾
        </span>
      </summary>
      <SourceList entries={entries} className="mb-1 mt-1" />
    </details>
  );
}
