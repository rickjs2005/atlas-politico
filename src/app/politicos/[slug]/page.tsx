import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EditionStatus } from "@/components/EditionStatus";
import { getAtlasData } from "@/lib/content/published";
import { getCoveredSpan } from "@/lib/data/coverage";
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
  return { title: findProfile(slug)?.nome };
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

  return (
    <Explorer
      // A página carrega só os registros desta trajetória.
      data={sliceForPerson(data, pessoa.id)}
      pessoaId={pessoa.id}
      profiles={profiles}
    />
  );
}
