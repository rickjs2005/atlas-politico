// Um registro do atlas, como o jogo o apresenta: a data na precisão
// documentada, o título, a categoria e, quando pedido, o resumo, o contexto,
// o lugar documentado, as fontes (de quando é o documento, quando foi lido,
// onde está o trecho e o que ele sustenta, como a lista de fontes do atlas),
// a ficha judicial (natureza e decisões relacionadas, com a própria data) e a
// situação da revisão. O texto é o do conteúdo publicado; nada é escrito
// aqui. Os avisos são os mesmos que o atlas dá para o mesmo registro.

import Link from "next/link";

import { CategoryLabel } from "@/components/Category";
import { ReviewNote } from "@/components/ReviewNote";
import { PATH_LINK } from "@/components/touch";
import { describePrecision, formatDate, yearOf } from "@/lib/domain/dates";
import { PROPOSAL_NOTICE } from "@/lib/data/proposals";
import { TEMA_LABELS } from "@/lib/domain/decisions";
import { TIPO_DE_FATO_LABELS } from "@/lib/domain/game";
import { JUDICIAL_KIND_LABEL, JUDICIAL_NOTICE, judicialOf, type RelatedRecord } from "@/lib/game/judicial";
import type { GameConcept, GameFact, GameLocation, GamePosition, GameProposal, GameRecord } from "@/lib/game/types";
import { eventHrefFromGame } from "@/lib/state/links";

import { SourceList, sourceCount } from "./SourceList";

/** O rótulo de um lugar documentado, ou da abrangência, como a ficha diz. */
export function placeLabel(localizacao: GameLocation): string {
  if (localizacao.tipo === "lugares") return localizacao.lugares.join(" e ");
  return localizacao.tipo === "nacional" ? "Abrangência nacional" : "Lugar não documentado";
}

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
          <span data-lugar-documentado={registro.localizacao.tipo}> · {placeLabel(registro.localizacao)}</span>
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
            <h4 className="eyebrow text-ink-soft">{sourceCount(registro.fontes)}</h4>
            <SourceList fontes={registro.fontes} />
          </section>
          <div data-revisao>
            <ReviewNote editorial={registro.editorial} />
          </div>
          <p className="text-sm">
            <Link
              href={eventHrefFromGame(registro.slug, personagem)}
              prefetch={false}
              className={PATH_LINK}
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

/** Um fato biográfico: o que o documento diz da origem, da família, da formação ou do trabalho, com a divergência entre documentos, quando há. */
export function FactCard({ fato }: { fato: GameFact }) {
  // Com divergência entre documentos, a nota de precisão diria o contrário do que eles dizem: vale a divergência, logo abaixo.
  const precisao = fato.data === null || fato.divergencia !== null ? null : describePrecision(fato.data);
  return (
    <article className="space-y-3" data-fato-cartao={fato.id}>
      <div className="space-y-1">
        <p className="numerals text-lg font-semibold leading-none tracking-tight">
          {fato.data === null ? <span data-sem-data>Sem data documentada</span> : <time dateTime={fato.data.valor}>{formatDate(fato.data)}</time>}
        </p>
        {precisao !== null && <p className="text-xs italic text-ink-soft">{precisao}</p>}
        <h3 className="font-serif text-xl font-medium leading-snug">{fato.titulo}</h3>
        <p className="text-xs text-ink-soft">{TIPO_DE_FATO_LABELS[fato.tipo]} · registro biográfico</p>
      </div>
      <p className="reading text-base leading-relaxed">{fato.texto}</p>
      {fato.divergencia !== null && (
        <p className="border-l-2 border-ink-faint pl-3 text-sm" data-divergencia>
          <span className="font-medium">Os documentos divergem. </span>
          {fato.divergencia}
        </p>
      )}
      <section aria-label={`Fontes do registro: ${fato.fontes.length}`} className="space-y-1.5 border-t border-line pt-3">
        <h4 className="eyebrow text-ink-soft">{sourceCount(fato.fontes)}</h4>
        <SourceList fontes={fato.fontes} />
      </section>
      <div data-revisao>
        <ReviewNote editorial={fato.editorial} />
      </div>
    </article>
  );
}

/** Um cargo, uma função ou uma filiação partidária, como o atlas os registra. */
export function PositionCard({ posicao }: { posicao: GamePosition }) {
  return (
    <article className="space-y-3" data-posicao-cartao={posicao.id}>
      <div className="space-y-1">
        <p className="numerals text-lg font-semibold leading-none tracking-tight">{posicao.periodo}</p>
        <h3 className="font-serif text-xl font-medium leading-snug">{posicao.titulo}</h3>
        <p className="text-xs text-ink-soft">
          {posicao.detalhe} · {posicao.natureza === "mandato" ? "cargo ou função" : "filiação partidária"}
        </p>
      </div>
      <section aria-label={`Fontes do registro: ${posicao.fontes.length}`} className="space-y-1.5 border-t border-line pt-3">
        <h4 className="eyebrow text-ink-soft">{sourceCount(posicao.fontes)}</h4>
        <SourceList fontes={posicao.fontes} />
      </section>
      <div data-revisao>
        <ReviewNote editorial={posicao.editorial} />
      </div>
    </article>
  );
}

/** Uma proposta do documento registrado no TSE: a frase, a área, a ressalva e a página do documento. */
export function ProposalCard({ proposta }: { proposta: GameProposal }) {
  return (
    <article className="space-y-3" data-proposta-cartao={proposta.id}>
      <div className="space-y-1">
        <p className="numerals text-lg font-semibold leading-none tracking-tight">Eleição de {proposta.eleicao}</p>
        <h3 className="font-serif text-xl font-medium leading-snug">Proposta registrada no TSE · {TEMA_LABELS[proposta.tema]}</h3>
      </div>
      <p className="reading text-base leading-relaxed" data-proposta-texto>
        {proposta.texto}
      </p>
      {proposta.ressalva !== null && (
        <p className="border-l-2 border-ink-faint pl-3 text-sm" data-ressalva>
          {proposta.ressalva}
        </p>
      )}
      <p className="text-xs text-ink-soft" data-aviso-de-proposta>
        {PROPOSAL_NOTICE}
      </p>
      <section aria-label={`Fontes do registro: ${proposta.fontes.length}`} className="space-y-1.5 border-t border-line pt-3">
        <h4 className="eyebrow text-ink-soft">{sourceCount(proposta.fontes)}</h4>
        <SourceList fontes={proposta.fontes} />
      </section>
      <div data-revisao>
        <ReviewNote editorial={proposta.editorial} />
      </div>
    </article>
  );
}

/** A definição de um termo, para abrir no lugar em que ele aparece: o que é, o que a definição simplifica e o texto oficial que a sustenta. */
export function ConceptNote({ conceito }: { conceito: GameConcept }) {
  return (
    <details className="border border-line bg-paper text-sm" data-conceito={conceito.id}>
      <summary className="flex min-h-11 cursor-pointer items-center px-3 py-2 font-medium">O que é: {conceito.termo}</summary>
      <div className="space-y-2 border-t border-line px-3 py-3">
        <p className="reading text-base leading-relaxed" data-definicao>
          {conceito.definicao}
        </p>
        {conceito.simplificacao !== null && (
          <p className="text-xs text-ink-soft" data-simplificacao>
            O que esta definição simplifica: {conceito.simplificacao}
          </p>
        )}
        <p className="eyebrow text-ink-soft">De onde vem a definição</p>
        <SourceList fontes={conceito.fontes} />
      </div>
    </details>
  );
}
