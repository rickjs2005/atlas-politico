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

import { EventPanel } from "@/features/events/EventPanel";
import { getAtlasData } from "@/lib/content/published";
import { findEventBySlug, getEventView } from "@/lib/data/queries";

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getAtlasData().conjunto.acontecimentos.map(({ slug }) => ({ slug }));
}

function findEvent(slug: string) {
  const data = getAtlasData();
  const acontecimento = findEventBySlug(data, slug);
  return acontecimento ? getEventView(data, acontecimento) : null;
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  return { title: findEvent(slug)?.acontecimento.titulo };
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = findEvent(slug);
  if (!event) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <EventPanel event={event} headingLevel={1} />
      <p>
        <Link href="/" className="underline">
          Voltar ao atlas
        </Link>
      </p>
    </div>
  );
}
