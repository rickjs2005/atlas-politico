import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EditionStatus } from "@/components/EditionStatus";
import { DecisionsByTheme, SAMPLE_NOTICE } from "@/features/decisions/DecisionsByTheme";
import { getAtlasData } from "@/lib/content/published";
import { getCoveredSpan } from "@/lib/data/coverage";
import { listDecisionViews } from "@/lib/data/decisions";
import { findPersonBySlug } from "@/lib/data/queries";
import { sliceForPerson } from "@/lib/data/slice";
import { PROFILES, findProfile } from "@/lib/domain/profiles";

import { Explorer } from "./Explorer";

// As rotas de perfil vêm do escopo da edição (PROFILES), não do conteúdo: a
// página existe mesmo antes de haver registros revisados, e diz isso.
export const dynamicParams = false;

export function generateStaticParams() {
  return PROFILES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/politicos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const perfil = findProfile(slug);
  if (!perfil) return {};
  // A descrição é o texto de apresentação do perfil, do conjunto revisado.
  const resumo = findPersonBySlug(getAtlasData(), slug)?.resumo;
  return {
    title: perfil.nome,
    description: resumo,
    openGraph: { title: perfil.nome, description: resumo, type: "profile" },
  };
}

export default async function ProfilePage({ params }: PageProps<"/politicos/[slug]">) {
  const { slug } = await params;
  const perfil = findProfile(slug);
  if (!perfil) notFound();

  const data = getAtlasData();
  const pessoa = findPersonBySlug(data, slug);

  if (pessoa === null) {
    return (
      <div className="page space-y-4 py-12">
        <h1 className="font-serif text-5xl font-medium tracking-tight">{perfil.nome}</h1>
        <EditionStatus edicao={data.conjunto.edicao} />
        <p className="max-w-2xl text-ink-soft">
          Ainda não há registros revisados deste perfil no conjunto publicado. A ausência de
          registros aqui indica o estágio da pesquisa, e não ausência de atividade pública.
        </p>
      </div>
    );
  }

  // O que a troca de pessoa precisa saber de cada perfil: o `id`, para saber se
  // o acontecimento aberto também é dele, e a cobertura, para ajustar o período.
  const profiles = PROFILES.map((item) => {
    const registro = findPersonBySlug(data, item.slug);
    return {
      slug: item.slug,
      nome: item.nome,
      id: registro?.id ?? null,
      cobertura: registro === null ? null : getCoveredSpan(data, registro.id),
    };
  });

  // A página carrega só os registros desta trajetória.
  const recorte = sliceForPerson(data, pessoa.id);
  const decisoes = listDecisionViews(recorte, pessoa.id);

  return (
    <>
      <Explorer data={recorte} pessoaId={pessoa.id} profiles={profiles} />
      {/* As decisões documentadas (votos, atos e atuações legislativas), por tema, abaixo da exploração: o cartão de cada uma tem âncora própria. */}
      <section id="decisoes" aria-labelledby="titulo-decisoes" className="page space-y-5 border-t border-ink py-8 md:py-10" data-secao="decisoes" data-quantas={decisoes.length}>
        <div className="max-w-3xl space-y-2">
          <p className="eyebrow text-ink-soft">Decisões documentadas</p>
          <h2 id="titulo-decisoes" className="font-serif text-[2rem] font-medium leading-none tracking-tight md:text-4xl">
            Votos, atos e atuação legislativa de {pessoa.nome}, por tema
          </h2>
          <p className="text-sm text-ink-soft" data-aviso-amostra>
            {SAMPLE_NOTICE}
          </p>
        </div>
        <DecisionsByTheme colunas={[{ pessoa: { id: pessoa.id, slug: pessoa.slug, nome: pessoa.nome }, decisoes }]} headingLevel={3} anchorOf={(id) => `decisao-${id}`} />
      </section>
    </>
  );
}
