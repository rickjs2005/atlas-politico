import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EditionStatus } from "@/components/EditionStatus";
import { getPublishedSet } from "@/lib/content/published";
import { compareDates, formatDate } from "@/lib/domain/dates";
import { PROFILES, findProfile } from "@/lib/domain/profiles";

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

  const conjunto = getPublishedSet();
  const pessoa = conjunto.pessoas.find((item) => item.slug === slug);
  const acontecimentos = pessoa
    ? conjunto.acontecimentos
        .filter((item) => item.pessoaIds.includes(pessoa.id))
        .sort((a, b) => compareDates(a.data, b.data))
    : [];

  return (
    <div className="space-y-8">
      <header className="max-w-3xl space-y-4">
        <h1 className="font-serif text-4xl leading-tight">{perfil.nome}</h1>
        {pessoa && <p className="text-lg">{pessoa.resumo}</p>}
        <EditionStatus edicao={conjunto.edicao} />
      </header>

      <section aria-labelledby="acontecimentos" className="space-y-3">
        <h2 id="acontecimentos" className="font-serif text-2xl">
          Acontecimentos
        </h2>
        {acontecimentos.length === 0 ? (
          <p className="max-w-3xl text-ink-soft">
            Ainda não há acontecimentos revisados deste perfil no conjunto publicado. A ausência de
            registros aqui indica o estágio da pesquisa, e não ausência de atividade pública.
          </p>
        ) : (
          <ol className="space-y-2">
            {acontecimentos.map((item) => (
              <li key={item.id}>
                <span className="text-sm text-ink-soft">{formatDate(item.data)} · </span>
                <Link href={`/acontecimentos/${item.slug}`} className="underline">
                  {item.titulo}
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
