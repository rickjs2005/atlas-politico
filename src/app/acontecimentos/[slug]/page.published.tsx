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
import { Portrait } from "@/components/Portrait";
import { ReviewNote } from "@/components/ReviewNote";
import { SourceList } from "@/components/SourceList";
import { getAtlasData } from "@/lib/content/published";
import { filterPoints } from "@/lib/data/points";
import { findEventBySlug, getEventView, getImage, listMandatesAt } from "@/lib/data/queries";
import { describePrecision, formatDate } from "@/lib/domain/dates";
import { GEO_PRECISION_LABELS } from "@/lib/domain/geo";

import { EventLocator } from "./EventLocator";

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
  return { title: acontecimento?.titulo, description: acontecimento?.resumo };
}

const SEM_LUGAR = {
  nacional: "Abrangência nacional: este acontecimento não tem um ponto municipal no mapa.",
  desconhecida: "O lugar deste acontecimento não está documentado nas fontes consultadas.",
};

const sectionTitle = "eyebrow text-ink-soft";

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

  return (
    <article className="page py-8 md:py-12 [&>*]:max-w-[68rem]">
      {/* Retorno: volta à exploração com este acontecimento aberto. */}
      <nav aria-label="Voltar à exploração" className="mb-8 md:mb-10">
        <ul className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
          {pessoas.map((pessoa) => (
            <li key={pessoa.id}>
              <Link
                href={`/politicos/${pessoa.slug}?acontecimento=${acontecimento.slug}`}
                className="inline-flex min-h-11 items-center font-medium underline decoration-line-strong hover:decoration-ink md:min-h-0"
              >
                <span aria-hidden="true">←&nbsp;</span>
                Trajetória de {pessoa.nome}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

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
            <p className="font-serif text-[1.375rem] leading-[1.45]">{acontecimento.resumo}</p>
            <p className="reading max-w-[38rem]">{acontecimento.contexto}</p>
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
              Revisão
            </h2>
            <ReviewNote editorial={acontecimento.editorial} />
          </section>
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

          {retratos.length > 0 && (
            <section className="space-y-1.5">
              <h2 className={sectionTitle}>Créditos das imagens</h2>
              <ul className="space-y-1 text-xs text-ink-soft">
                {retratos.map((retrato) => (
                  <li key={retrato.id}>
                    {retrato.credito}. Exibida em tons de cinza e recortada.{" "}
                    <a href={retrato.origem} target="_blank" rel="noreferrer" className="underline decoration-line-strong hover:decoration-ink">
                      Origem<span className="sr-only"> (abre em nova aba)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </article>
  );
}
