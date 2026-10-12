// O cartão de uma decisão política, o mesmo no atlas e no jogo: a data na
// precisão documentada, a identificação, a natureza (voto parlamentar, ato
// do Executivo ou atuação legislativa), o cargo e a instituição pelos quais a
// pessoa agiu, o objeto votado e a manifestação registrada com o valor
// original do acervo (ou o tipo do ato e os campos que o distinguem, ou a
// matéria, a autoria dela e o destino documentado), a proposição, as fontes
// com o que cada uma sustenta e a situação da revisão. Nada é escrito aqui:
// os textos são os do conjunto, e os rótulos são os das taxonomias.

import Link from "next/link";
import { Fragment } from "react";

import { ReviewNote } from "@/components/ReviewNote";
import { PATH_LINK, SOURCE_LINK } from "@/components/touch";
import type { DecisionView } from "@/lib/data/decisions";
import { describePrecision, formatDate } from "@/lib/domain/dates";
import {
  DESFECHO_DE_ATUACAO_LABELS,
  INSTITUICAO_LABELS,
  MODALIDADE_LABELS,
  OBJETO_LABELS,
  POSICAO_LABELS,
  REGISTRO_INDIVIDUAL_LABELS,
  RESULTADO_LABELS,
  TEMA_LABELS,
  TIPO_DE_ATO_LABELS,
  TIPO_DE_ATUACAO_LABELS,
} from "@/lib/domain/decisions";

export const NATUREZA_LABEL: Record<DecisionView["natureza"], string> = { voto: "Voto parlamentar", ato: "Ato do Executivo", atuacao: "Atuação legislativa" };

/** O aviso que acompanha toda manifestação: a posição vale para o objeto votado. */
export const OBJETO_NOTICE = "A posição registrada vale para o objeto votado, e não para o projeto inteiro nem para um tema.";

/** O aviso que acompanha toda atuação legislativa: propor ou relatar não é votar, e o destino da matéria não mede o trabalho. */
export const ATUACAO_NOTICE =
  "O registro documenta que a pessoa propôs ou relatou a matéria e o que aconteceu com ela depois. Ele não diz como a pessoa votou, nem o que a norma produziu na prática.";

interface DecisionCardProps {
  decisao: DecisionView;
  /** `completo`: tudo, com fontes e revisão. `curto`: data, identificação, natureza e cargo. */
  detalhe: "completo" | "curto";
  /** O nível do título dentro do cartão: um abaixo do último título acima dele. Os subtítulos ficam um nível abaixo. */
  headingLevel?: 3 | 4 | 5;
  /** Um caminho para fora do cartão (a página da pessoa no atlas, a partir do jogo), com o rótulo. */
  link?: { href: string; rotulo: string; onFollow?: () => void };
  /** O `id` do elemento, para âncoras (`#decisao-<id>` na página da pessoa). */
  anchorId?: string;
}

/** A manifestação individual, por extenso, como o registro a traz. */
export function manifestationText(registro: Extract<DecisionView, { natureza: "voto" }>["registro"]): string {
  if (registro.tipo === "voto-individual") return `${POSICAO_LABELS[registro.posicao]} · valor original: ${registro.valorOriginal}`;
  const motivo = registro.motivoDocumentado === undefined ? "" : ` · motivo documentado: ${registro.motivoDocumentado}`;
  return `${REGISTRO_INDIVIDUAL_LABELS[registro.tipo]} · valor original: ${registro.valorOriginal}${motivo}`;
}

/** Quantos itens uma lista do cartão mostra aberta; acima disso, a lista vem dobrada, com a contagem à vista e tudo alcançável. */
export const ITENS_ABERTOS = 6;

/** Uma lista de um campo do ato (os dispositivos vetados): aberta quando curta, dobrada quando longa. */
function ItemList({ itens, rotulo }: { itens: readonly string[]; rotulo: string }) {
  const lista = (
    <ul className="list-disc space-y-0.5 pl-4" data-itens={itens.length}>
      {itens.map((item, indice) => (
        <li key={`${indice}-${item}`}>{item}</li>
      ))}
    </ul>
  );
  if (itens.length <= ITENS_ABERTOS) return lista;
  return (
    <details data-lista-dobrada={itens.length}>
      <summary className="cursor-pointer py-3 font-medium underline decoration-line-strong hover:decoration-ink md:pointer-fine:py-1">
        Ver os {itens.length} itens<span className="sr-only"> de {rotulo}</span>
      </summary>
      {lista}
    </details>
  );
}

export function DecisionCard({ decisao, detalhe, headingLevel = 3, link, anchorId }: DecisionCardProps) {
  const Title = `h${headingLevel}` as "h3" | "h4" | "h5";
  const Sub = `h${headingLevel + 1}` as "h4" | "h5" | "h6";
  const precisao = describePrecision(decisao.data);
  return (
    <article id={anchorId} className="space-y-3 scroll-mt-24" data-decisao-cartao={decisao.id} data-natureza={decisao.natureza}>
      <div className="space-y-1">
        <p className="numerals text-lg font-semibold leading-none tracking-tight">
          <time dateTime={decisao.data.valor}>{formatDate(decisao.data)}</time>
        </p>
        {precisao !== null && <p className="text-xs italic text-ink-soft">{precisao}</p>}
        <Title className="font-serif text-xl font-medium leading-snug">{decisao.titulo}</Title>
        <p className="text-xs text-ink-soft" data-natureza-rotulo>
          {NATUREZA_LABEL[decisao.natureza]} · {INSTITUICAO_LABELS[decisao.instituicao]}
          {decisao.temas.length > 0 && <span data-temas> · {decisao.temas.map((tema) => TEMA_LABELS[tema]).join(", ")}</span>}
        </p>
        <p className="text-sm" data-cargo={decisao.cargo?.mandatoId ?? "nao-publicado"}>
          {decisao.cargo === null ? (
            <span className="italic text-ink-soft">Mandato não publicado nesta edição.</span>
          ) : (
            <>
              <span className="font-medium">{decisao.cargo.cargo}</span>
              <span className="text-ink-soft">, {decisao.cargo.instituicao}</span>
            </>
          )}
        </p>
      </div>

      {detalhe === "completo" && (
        <>
          {decisao.natureza === "voto" && (
            <section aria-label="O que foi votado e o que o registro documenta" className="space-y-2 border-t border-line pt-3 text-sm" data-votacao={decisao.votacao.id}>
              <dl className="grid grid-cols-[max-content_minmax(0,1fr)] gap-x-3 gap-y-1">
                <dt className="text-ink-soft">Objeto votado</dt>
                <dd data-objeto={decisao.votacao.objeto.tipo}>
                  <span className="font-medium">{OBJETO_LABELS[decisao.votacao.objeto.tipo]}</span>
                  {decisao.votacao.objeto.identificacao !== null && ` (${decisao.votacao.objeto.identificacao})`}
                  <span className="block text-ink-soft">{decisao.votacao.objeto.descricao}</span>
                </dd>
                <dt className="text-ink-soft">Etapa</dt>
                <dd>{decisao.votacao.etapa}</dd>
                <dt className="text-ink-soft">Órgão e modalidade</dt>
                <dd>
                  {decisao.votacao.orgao} · {MODALIDADE_LABELS[decisao.votacao.modalidade]}
                </dd>
                <dt className="text-ink-soft">Resultado oficial</dt>
                <dd data-resultado={decisao.votacao.resultado.estado}>
                  {RESULTADO_LABELS[decisao.votacao.resultado.estado]} · valor original: {decisao.votacao.resultado.valorOriginal}
                </dd>
                <dt className="text-ink-soft">Manifestação registrada</dt>
                <dd className="font-medium" data-manifestacao={decisao.registro.tipo === "voto-individual" ? decisao.registro.posicao : decisao.registro.tipo}>
                  {manifestationText(decisao.registro)}
                </dd>
              </dl>
              <p className="text-xs text-ink-soft" data-aviso-objeto>
                {OBJETO_NOTICE}
              </p>
              {decisao.votacao.objeto.divergencia !== null && (
                <p className="border-l-2 border-accent pl-2 text-xs text-ink-soft" data-divergencia>
                  <span className="font-medium text-ink">Divergência entre documentos: </span>
                  {decisao.votacao.objeto.divergencia}
                </p>
              )}
              {decisao.votacao.textoReferencia !== null ? (
                <p className="text-xs text-ink-soft" data-texto-referencia="ligado">
                  Texto de referência:{" "}
                  <a href={decisao.votacao.textoReferencia.url} target="_blank" rel="noreferrer" className={SOURCE_LINK}>
                    {decisao.votacao.textoReferencia.titulo}
                    <span className="sr-only"> (abre em nova aba)</span>
                  </a>{" "}
                  ({decisao.votacao.textoReferencia.localizacao})
                </p>
              ) : (
                <p className="text-xs text-ink-soft" data-texto-referencia="nao-ligado">
                  Texto de referência: o texto submetido à votação não está ligado a este registro nesta edição.
                </p>
              )}
            </section>
          )}
          {decisao.natureza === "ato" && (
            <section aria-label="O ato e o que o registro documenta" className="space-y-2 border-t border-line pt-3 text-sm" data-ato={decisao.ato.tipo}>
              <dl className="grid grid-cols-[max-content_minmax(0,1fr)] gap-x-3 gap-y-1">
                <dt className="text-ink-soft">Tipo do ato</dt>
                <dd className="font-medium" data-tipo-do-ato={decisao.ato.tipo}>
                  {TIPO_DE_ATO_LABELS[decisao.ato.tipo]}
                </dd>
                {decisao.ato.detalhes.map((detalhe) => (
                  <Fragment key={detalhe.rotulo}>
                    <dt className="text-ink-soft">{detalhe.rotulo}</dt>
                    <dd>{detalhe.itens === undefined ? detalhe.valor : <ItemList itens={detalhe.itens} rotulo={detalhe.rotulo} />}</dd>
                  </Fragment>
                ))}
              </dl>
              {decisao.ato.oficial !== null && (
                <p className="text-xs text-ink-soft">
                  Documento oficial:{" "}
                  <a href={decisao.ato.oficial.url} target="_blank" rel="noreferrer" className={SOURCE_LINK}>
                    {decisao.ato.oficial.titulo}
                    <span className="sr-only"> (abre em nova aba)</span>
                  </a>
                </p>
              )}
            </section>
          )}
          {decisao.natureza === "atuacao" && (
            <section aria-label="A matéria e o que o registro documenta" className="space-y-2 border-t border-line pt-3 text-sm" data-atuacao={decisao.atuacao.tipo}>
              <dl className="grid grid-cols-[max-content_minmax(0,1fr)] gap-x-3 gap-y-1">
                <dt className="text-ink-soft">Tipo de atuação</dt>
                <dd className="font-medium" data-tipo-de-atuacao={decisao.atuacao.tipo}>
                  {TIPO_DE_ATUACAO_LABELS[decisao.atuacao.tipo]}
                </dd>
                <dt className="text-ink-soft">Matéria</dt>
                <dd data-materia>
                  <span className="font-medium">{decisao.atuacao.materia.identificador}</span>
                  <span className="block text-ink-soft">{decisao.atuacao.materia.ementa}</span>
                </dd>
                <dt className="text-ink-soft">Autoria da matéria</dt>
                <dd data-autoria-da-materia>{decisao.atuacao.materia.autoria}</dd>
                <dt className="text-ink-soft">Destino da matéria</dt>
                <dd data-desfecho={decisao.atuacao.desfecho.tipo}>
                  <span className="font-medium">{DESFECHO_DE_ATUACAO_LABELS[decisao.atuacao.desfecho.tipo]}</span>
                  {decisao.atuacao.desfecho.norma !== null && ` (${decisao.atuacao.desfecho.norma})`}
                  <span className="block text-ink-soft">{decisao.atuacao.desfecho.descricao}</span>
                </dd>
              </dl>
              <p className="text-xs text-ink-soft" data-aviso-atuacao>
                {ATUACAO_NOTICE}
              </p>
              {decisao.atuacao.divergencia !== null && (
                <p className="border-l-2 border-accent pl-2 text-xs text-ink-soft" data-divergencia>
                  <span className="font-medium text-ink">Divergência entre documentos: </span>
                  {decisao.atuacao.divergencia}
                </p>
              )}
            </section>
          )}

          {decisao.proposicoes.length > 0 && (
            <section aria-label="Proposição" className="space-y-1 border-t border-line pt-3 text-sm" data-proposicoes={decisao.proposicoes.length}>
              <Sub className="eyebrow text-ink-soft">{decisao.proposicoes.length === 1 ? "Proposição" : "Proposições"}</Sub>
              <ul className="space-y-1">
                {decisao.proposicoes.map((proposicao) => (
                  <li key={proposicao.id} data-proposicao={proposicao.id}>
                    <span className="font-medium">{proposicao.identificacao}</span>
                    <span className="text-ink-soft"> ({INSTITUICAO_LABELS[proposicao.instituicao]})</span>
                    <span className="block text-ink-soft">{proposicao.ementa}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-label={`Fontes da decisão: ${decisao.fontes.length}`} className="space-y-1.5 border-t border-line pt-3">
            <Sub className="eyebrow text-ink-soft">{decisao.fontes.length === 1 ? "1 fonte" : `${decisao.fontes.length} fontes`}</Sub>
            <ol className="space-y-1.5 text-sm">
              {decisao.fontes.map((fonte) => (
                <li key={`${fonte.id}:${fonte.localizacao}`} data-fonte={fonte.id}>
                  <a href={fonte.url} target="_blank" rel="noreferrer" className={SOURCE_LINK}>
                    {fonte.titulo}
                    <span className="sr-only"> (abre em nova aba)</span>
                  </a>
                  <span className="block text-xs text-ink-soft" data-documento>
                    {fonte.autoria} · {fonte.dataDocumento.tipo === "data" ? `documento de ${formatDate(fonte.dataDocumento)}` : "data do documento desconhecida"} · acesso em{" "}
                    {formatDate({ valor: fonte.acessadoEm, precisao: "dia" })}
                  </span>
                  <span className="block text-xs text-ink-soft" data-onde>
                    Onde: {fonte.localizacao}
                  </span>
                  <span className="block text-xs text-ink-soft" data-evidencia>
                    Sustenta: {fonte.evidencia}
                  </span>
                </li>
              ))}
            </ol>
          </section>
          <div data-revisao>
            <ReviewNote editorial={decisao.editorial} />
          </div>
          {link !== undefined && (
            <p className="text-sm">
              <Link href={link.href} prefetch={false} className={PATH_LINK} data-ficha-decisao={decisao.id} onClick={link.onFollow}>
                {link.rotulo}
                <span aria-hidden="true"> →</span>
              </Link>
            </p>
          )}
        </>
      )}
    </article>
  );
}
