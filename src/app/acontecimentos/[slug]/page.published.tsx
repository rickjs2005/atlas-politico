// Uma página por acontecimento dos dados gerados. Rascunhos não passam pelo
// gerador, então não ganham endereço.
//
// O nome `page.published.tsx` é proposital: o `next.config.ts` só trata este
// arquivo como rota quando existe ao menos um acontecimento publicado, porque
// a exportação estática recusa rota dinâmica sem nenhum parâmetro gerado
// (ver docs/DECISIONS.md, D-06). Pelo mesmo motivo os tipos de `params` são
// escritos à mão: o helper `PageProps` só conhece rotas ativas.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CategoryLabel } from "@/components/Category";
import { CopyLink } from "@/components/CopyLink";
import { EditionTag } from "@/components/EditionStatus";
import { Portrait } from "@/components/Portrait";
import { ReviewNote } from "@/components/ReviewNote";
import { SourceList } from "@/components/SourceList";
import { getAtlasData } from "@/lib/content/published";
import { getCoveredSpan, getSharedSpan } from "@/lib/data/coverage";
import { filterPoints } from "@/lib/data/points";
import { findEventBySlug, getEventView, getImage, listMandatesAt } from "@/lib/data/queries";
import { describePrecision, formatDate } from "@/lib/domain/dates";
import { GEO_PRECISION_LABELS } from "@/lib/domain/geo";
import { comparisonHref, eventHref, explorationHref } from "@/lib/state/links";

import { EventLocator } from "./EventLocator";
import { EventReturn } from "./EventReturn";

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getAtlasData().conjunto.acontecimentos.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const acontecimento = findEventBySlug(getAtlasData(), slug);
  if (!acontecimento) return {};
  // Título e descrição são o texto do registro revisado, sem acréscimo. O
  // endereço canônico depende do domínio público e entra na fase 10.
  const { titulo: title, resumo: description } = acontecimento;
  return { title, description, openGraph: { title, description, type: "article" } };
}

const SEM_LUGAR = {
  nacional: "Abrangência nacional: este acontecimento não tem um ponto municipal no mapa.",
  desconhecida: "O lugar deste acontecimento não está documentado nas fontes consultadas.",
};

const sectionTitle = "eyebrow text-ink-soft";
const textLink = "underline decoration-line-strong hover:decoration-ink";

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const data = getAtlasData();
  const acontecimento = findEventBySlug(data, slug);
  if (!acontecimento) notFound();

  const { pessoas, lugares, citacoes } = getEventView(data, acontecimento);
  const imagem = getImage(data, acontecimento.imagemId);
  const pontos = filterPoints(data.pontos, [acontecimento]);
  const precisao = describePrecision(acontecimento.data);
  const retratos = pessoas.flatMap((pessoa) => {
    const retrato = getImage(data, pessoa.retratoId);
    return retrato === null ? [] : [retrato];
  });
  const temMapa = acontecimento.localizacao.tipo === "lugares";
  const { edicao } = data.conjunto;

  return (
    <article className="page py-8 md:py-12 [&>*]:max-w-[68rem]" data-acontecimento={acontecimento.slug}>
      {/* Retorno: volta à exploração com este acontecimento aberto e, quando a
          pessoa veio de uma consulta, com o recorte dela. */}
      <EventReturn
        event={{ slug: acontecimento.slug, data: acontecimento.data, categoria: acontecimento.categoria }}
        people={pessoas.map((pessoa) => ({
          slug: pessoa.slug,
          nome: pessoa.nome,
          cobertura: getCoveredSpan(data, pessoa.id),
        }))}
        escala={getSharedSpan(data)}
      />

      <header className="space-y-4 border-b border-ink pb-8 [&>h1]:max-w-4xl">
        <p className="eyebrow text-ink-soft">
          <CategoryLabel categoria={acontecimento.categoria} />
        </p>
        <p className="numerals text-3xl font-semibold leading-none tracking-tight md:text-[2.5rem]">
          <time dateTime={acontecimento.data.valor}>{formatDate(acontecimento.data)}</time>
        </p>
        {precisao !== null && <p className="text-sm italic text-ink-soft">{precisao}</p>}
        <h1 className="font-serif text-[2.125rem] font-medium leading-[1.08] tracking-[-0.015em] md:text-[3.25rem]">
          {acontecimento.titulo}
        </h1>
        {/* O link copiado é o desta página, sem o contexto de quem chegou. */}
        <CopyLink path={eventHref(acontecimento.slug)} />
      </header>

      <div className="mt-8 grid gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,42rem)_minmax(0,22rem)]">
        <div className="space-y-10">
          {imagem !== null && (
            <figure className="space-y-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element -- dimensões vêm do conteúdo */}
              <img
                src={imagem.arquivo}
                alt={imagem.textoAlternativo}
                width={imagem.dimensoes?.largura}
                height={imagem.dimensoes?.altura}
                className="h-auto w-full bg-sunken"
              />
              <figcaption className="text-xs text-ink-faint">{imagem.credito}</figcaption>
            </figure>
          )}

          <div className="space-y-5">
            <section aria-labelledby="resumo" className="space-y-2">
              <h2 id="resumo" className={sectionTitle}>
                Resumo
              </h2>
              <p className="font-serif text-[1.375rem] leading-[1.45]">{acontecimento.resumo}</p>
            </section>
            <section aria-labelledby="contexto" className="space-y-2">
              <h2 id="contexto" className={sectionTitle}>
                Contexto
              </h2>
              <p className="reading max-w-[38rem]">{acontecimento.contexto}</p>
            </section>
          </div>

          <section aria-labelledby="fontes" className="space-y-3">
            <h2 id="fontes" className="font-serif text-2xl font-medium tracking-tight">
              Fontes <span className="numerals text-base font-medium text-ink-soft">({citacoes.length})</span>
            </h2>
            <p className="text-sm text-ink-soft">
              Cada fonte indica onde está o trecho e o que ele sustenta neste registro.
            </p>
            <SourceList entries={citacoes} />
          </section>

          <section aria-labelledby="revisao" className="space-y-2 border-t border-line pt-5">
            <h2 id="revisao" className={sectionTitle}>
              Revisão e edição
            </h2>
            <ReviewNote editorial={acontecimento.editorial} />
            {edicao !== null && <EditionTag edicao={edicao} />}
            <p className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
              <Link href="/metodologia" className={`inline-flex min-h-11 items-center md:min-h-0 ${textLink}`}>
                Como o atlas é feito
              </Link>
              <Link
                href={`/metodologia/?acontecimento=${acontecimento.slug}#correcao`}
                className={`inline-flex min-h-11 items-center md:min-h-0 ${textLink}`}
              >
                Sugerir uma correção
              </Link>
            </p>
          </section>

          <nav aria-labelledby="continuar" className="space-y-2 border-t border-line pt-5">
            <h2 id="continuar" className={sectionTitle}>
              Continuar no atlas
            </h2>
            <ul className="grid gap-x-6 text-sm sm:grid-cols-2">
              {pessoas.map((pessoa) => (
                <li key={pessoa.id}>
                  <Link
                    href={explorationHref(pessoa.slug, {
                      periodo: { de: null, ate: null },
                      categorias: [],
                      acontecimento: acontecimento.slug,
                    })}
                    className={`inline-flex min-h-11 items-center md:min-h-8 ${textLink}`}
                  >
                    Ver na trajetória de {pessoa.nome}
                  </Link>
                </li>
              ))}
              <li>
                <Link href={comparisonHref()} className={`inline-flex min-h-11 items-center md:min-h-8 ${textLink}`}>
                  Comparar as duas trajetórias
                </Link>
              </li>
              <li>
                <Link href="/metodologia" className={`inline-flex min-h-11 items-center md:min-h-8 ${textLink}`}>
                  Metodologia e fontes
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <aside aria-label="Ficha do acontecimento" className="space-y-7 lg:border-l lg:border-line lg:pl-8">
          <section className="space-y-2.5">
            <h2 className={sectionTitle}>{pessoas.length === 1 ? "Pessoa" : "Pessoas"}</h2>
            <ul className="space-y-3">
              {pessoas.map((pessoa) => {
                // Só os cargos que as datas provam para a data do acontecimento.
                const cargos = listMandatesAt(data, pessoa.id, acontecimento.data).filter(
                  (item) => item.situacao === "documentada",
                );
                return (
                  <li key={pessoa.id} className="grid grid-cols-[3rem_minmax(0,1fr)] gap-x-3">
                    <Portrait
                      nome={pessoa.nome}
                      imagem={getImage(data, pessoa.retratoId)}
                      shape="quadrado"
                      sizes="48px"
                      decorative
                    />
                    <div className="space-y-1 text-sm">
                      <Link
                        href={`/politicos/${pessoa.slug}?acontecimento=${acontecimento.slug}`}
                        className="font-serif text-lg font-medium leading-none underline decoration-line-strong hover:decoration-ink"
                      >
                        {pessoa.nome}
                      </Link>
                      {cargos.length === 0 ? (
                        <p className="text-ink-soft">Nenhum cargo registrado no atlas para esta data.</p>
                      ) : (
                        <ul className="text-ink-soft">
                          {cargos.map(({ registro }) => (
                            <li key={registro.id}>{registro.cargo}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="text-xs text-ink-faint">Cargos e funções registrados no atlas na data do acontecimento.</p>
          </section>

          <section className="space-y-2.5">
            <h2 className={sectionTitle}>{lugares.length === 1 ? "Lugar" : "Lugares"}</h2>
            {acontecimento.localizacao.tipo === "lugares" ? (
              <>
                <ul className="space-y-1 text-sm">
                  {lugares.map((lugar) => (
                    <li key={lugar.id}>
                      <span className="font-medium">{lugar.nome}</span>{" "}
                      <span className="text-ink-soft">
                        ({GEO_PRECISION_LABELS[lugar.precisaoGeografica].toLowerCase()})
                      </span>
                    </li>
                  ))}
                </ul>
                <EventLocator points={pontos} slug={acontecimento.slug} />
              </>
            ) : (
              <p className="text-sm">{SEM_LUGAR[acontecimento.localizacao.tipo]}</p>
            )}
          </section>

          <section className="space-y-1.5" data-secao="creditos">
            <h2 className={sectionTitle}>Créditos</h2>
            <ul className="space-y-1 text-xs text-ink-soft">
              {imagem !== null && (
                <li>
                  Imagem do acontecimento: {imagem.credito}.{" "}
                  <a href={imagem.origem} target="_blank" rel="noreferrer" className={textLink}>
                    Origem<span className="sr-only"> da imagem (abre em nova aba)</span>
                  </a>
                </li>
              )}
              {retratos.map((retrato) => (
                <li key={retrato.id}>
                  {retrato.credito}. Exibida em tons de cinza e recortada.{" "}
                  <a href={retrato.origem} target="_blank" rel="noreferrer" className={textLink}>
                    Origem<span className="sr-only"> da imagem (abre em nova aba)</span>
                  </a>
                </li>
              ))}
              {temMapa && (
                <li>
                  Mapa: contornos do Natural Earth, em domínio público. Coordenadas pelo centro do
                  município ou do estado, da API de malhas do IBGE.
                </li>
              )}
              <li>
                <Link href="/metodologia#creditos" className={textLink}>
                  Autoria e condições de uso de cada material
                </Link>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </article>
  );
}
