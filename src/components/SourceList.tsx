// Apresentação das fontes de um registro. Cada item diz qual é o documento,
// quem o publicou, de quando é, quando foi lido, onde está o trecho e o que
// ele sustenta. É a parte do atlas que permite conferir o que está escrito,
// por isso tem o mesmo destaque em qualquer perfil e em qualquer tela.

import { formatDate } from "@/lib/domain/dates";
import type { Citacao, Fonte } from "@/lib/domain/types";

export interface SourceEntry {
  citacao: Citacao;
  fonte: Fonte;
  /**
   * O endereço não respondeu na última conferência de links. O conteúdo ainda
   * não registra isso (a conferência é da fase 9); o estado existe no desenho
   * para não ser improvisado depois.
   */
  indisponivel?: boolean;
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\d*\./, "");
  } catch {
    return url;
  }
}

interface SourceListProps {
  entries: readonly SourceEntry[];
  /** `compacta` omite a evidência: para listas longas, como as do perfil. */
  density?: "completa" | "compacta";
  className?: string;
}

export function SourceList({ entries, density = "completa", className = "" }: SourceListProps) {
  if (entries.length === 0) {
    return <p className="text-sm text-ink-soft">Nenhuma fonte registrada.</p>;
  }

  return (
    <ol className={`divide-y divide-line border-y border-line ${className}`}>
      {entries.map(({ citacao, fonte, indisponivel = false }, indice) => (
        <li key={`${fonte.id}:${citacao.localizacao}`} className="flex gap-3 py-3">
          <span aria-hidden="true" className="numerals w-5 shrink-0 pt-0.5 text-xs font-semibold text-ink-faint">
            {String(indice + 1).padStart(2, "0")}
          </span>
          <div className="min-w-0 space-y-1 text-sm">
            <p className="font-medium leading-snug">
              {indisponivel ? (
                <span>{fonte.titulo}</span>
              ) : (
                <a
                  href={fonte.url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-line-strong hover:decoration-ink"
                >
                  {fonte.titulo}
                  <span className="sr-only"> (abre em nova aba)</span>
                </a>
              )}
            </p>
            <p className="text-xs text-ink-soft">
              {fonte.autoria} · <span className="break-all">{hostOf(fonte.url)}</span> ·{" "}
              {fonte.dataDocumento.tipo === "data"
                ? `documento de ${formatDate(fonte.dataDocumento)}`
                : "data do documento desconhecida"}{" "}
              · acesso em {formatDate({ valor: fonte.acessadoEm, precisao: "dia" })}
            </p>
            {indisponivel && (
              <p className="border-l-2 border-ink-faint pl-2 text-xs text-ink-soft">
                <strong className="font-semibold text-ink">Fonte indisponível.</strong> O endereço não
                respondeu na última conferência. Título, autoria e data de acesso permitem localizar
                o documento por outro caminho.{" "}
                <span className="break-all">{fonte.url}</span>
              </p>
            )}
            <p>
              <span className="text-ink-soft">Onde:</span> {citacao.localizacao}
            </p>
            {density === "completa" && (
              <p>
                <span className="text-ink-soft">O que sustenta:</span> {citacao.evidencia}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
