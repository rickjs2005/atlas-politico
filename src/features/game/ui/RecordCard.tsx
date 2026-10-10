// Um registro do atlas, como o jogo o apresenta: a data na precisão
// documentada, o título, a categoria e, quando pedido, o resumo, o contexto,
// o lugar documentado, as fontes com o que cada uma sustenta, a ficha judicial
// (natureza e decisões relacionadas, com a própria data) e a situação da
// revisão. O texto é o do conteúdo publicado; nada é escrito aqui. Os avisos
// são os mesmos que o atlas dá para o mesmo registro.

import Link from "next/link";

import { CategoryLabel } from "@/components/Category";
import { ReviewNote } from "@/components/ReviewNote";
import { describePrecision, formatDate, yearOf } from "@/lib/domain/dates";
import { JUDICIAL_KIND_LABEL, JUDICIAL_NOTICE, judicialOf, type RelatedRecord } from "@/lib/game/judicial";
import { placeLabel } from "@/lib/game/mission";
import type { GameRecord } from "@/lib/game/types";
import { eventHrefFromGame } from "@/lib/state/links";

interface RecordCardProps {
  registro: GameRecord;
  personagem: string;
  /** `completo`: resumo, contexto, lugar, fontes, ficha judicial e o caminho para a ficha. `curto`: data e título. */
  detalhe: "completo" | "curto";
  /** As decisões relacionadas, já resolvidas pelo identificador (src/lib/game/judicial.ts). */
  relacionados?: readonly RelatedRecord[];
  /** A pessoa seguiu o link da ficha completa. */
  onOpenRecordPage?: () => void;
}

export function RecordCard({ registro, personagem, detalhe, relacionados = [], onOpenRecordPage }: RecordCardProps) {
  const precisao = describePrecision(registro.data);
  const judicial = judicialOf(registro.id);
  return (
    <article className="space-y-3" data-registro-cartao={registro.id}>
      <div className="space-y-1">
        <p className="numerals text-lg font-semibold leading-none tracking-tight">
          <time dateTime={registro.data.valor}>{formatDate(registro.data)}</time>
        </p>
        {precisao !== null && <p className="text-xs italic text-ink-soft">{precisao}</p>}
        {registro.ordemEmAberto && (
          <p className="text-xs italic text-ink-soft" data-ordem-em-aberto>
            ordem dentro de {yearOf(registro.data)} não documentada
          </p>
        )}
        <h3 className="font-serif text-xl font-medium leading-snug">{registro.titulo}</h3>
        <p className="text-xs text-ink-soft">
          <CategoryLabel categoria={registro.categoria} />
          <span data-lugar-documentado={registro.localizacao.tipo}> · {placeLabel(registro)}</span>
        </p>
      </div>
      {detalhe === "completo" && (
        <>
          <p className="reading text-base leading-relaxed">{registro.resumo}</p>
          {registro.contexto.length > 0 && (
            <section aria-label="Contexto" className="space-y-1 border-t border-line pt-3" data-contexto>
              <h4 className="eyebrow text-ink-soft">Contexto, como a ficha do atlas o traz</h4>
              <p className="text-sm leading-relaxed">{registro.contexto}</p>
            </section>
          )}
          {judicial !== null && (
            <section aria-label="Ficha judicial" className="space-y-2 border-t border-line pt-3" data-ficha-judicial={judicial.natureza}>
              <h4 className="eyebrow text-ink-soft">Ficha judicial</h4>
              <p className="text-sm font-medium" data-natureza>
                {JUDICIAL_KIND_LABEL[judicial.natureza]}
              </p>
              {relacionados.length > 0 && (
                <>
                  <p className="text-sm text-ink-soft">Decisões relacionadas, cada uma com a própria data:</p>
                  <ol className="space-y-1 text-sm">
                    {relacionados.map(({ registro: outro, relacao }) => (
                      <li key={outro.id} data-relacionado={outro.id}>
                        <span className="numerals font-semibold">{formatDate(outro.data)}</span> · {outro.titulo}
                        <span className="block text-ink-soft">{relacao}</span>
                      </li>
                    ))}
                  </ol>
                </>
              )}
              <p className="text-xs text-ink-soft" data-aviso-judicial>
                {JUDICIAL_NOTICE}
              </p>
            </section>
          )}
          <section aria-label={`Fontes do registro: ${registro.fontes.length}`} className="space-y-1.5 border-t border-line pt-3">
            <h4 className="eyebrow text-ink-soft">
              {registro.fontes.length === 1 ? "1 fonte" : `${registro.fontes.length} fontes`}
            </h4>
            <ol className="space-y-1.5 text-sm">
              {registro.fontes.map((fonte) => (
                <li key={fonte.id} data-fonte={fonte.id}>
                  <a href={fonte.url} target="_blank" rel="noreferrer" className="underline decoration-line-strong hover:decoration-ink">
                    {fonte.titulo}
                    <span className="sr-only"> (abre em nova aba)</span>
                  </a>
                  <span className="text-ink-soft"> · {fonte.autoria}</span>
                  <span className="block text-xs text-ink-soft" data-evidencia>
                    Sustenta: {fonte.evidencia}
                  </span>
                </li>
              ))}
            </ol>
          </section>
          <div data-revisao>
            <ReviewNote editorial={registro.editorial} />
          </div>
          <p className="text-sm">
            <Link
              href={eventHrefFromGame(registro.slug, personagem)}
              prefetch={false}
              className="font-medium underline decoration-line-strong hover:decoration-ink"
              data-ficha={registro.slug}
              onClick={onOpenRecordPage}
            >
              Abrir a ficha completa no atlas
              <span aria-hidden="true"> →</span>
            </Link>
          </p>
        </>
      )}
    </article>
  );
}
