import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { GameShell } from "@/features/game/GameShell";
import { getAtlasData } from "@/lib/content/published";
import { formatDate } from "@/lib/domain/dates";
import { PROFILES, findProfile } from "@/lib/domain/profiles";
import { buildGameContent, playableChapters } from "@/lib/game/content";
import { gameHref } from "@/lib/state/links";

// As rotas do jogo vêm do escopo da edição (PROFILES), como as de perfil.
export const dynamicParams = false;

export function generateStaticParams() {
  return PROFILES.map(({ slug }) => ({ personagem: slug }));
}

export async function generateMetadata({ params }: PageProps<"/jogo/[personagem]">): Promise<Metadata> {
  const { personagem } = await params;
  const perfil = findProfile(personagem);
  if (!perfil) return {};
  return {
    title: `Jogo · ${perfil.nome}`,
    description: `Percorra os capítulos da trajetória pública de ${perfil.nome}, recolhendo os registros do atlas em cada período.`,
  };
}

export default async function PlayPage({ params }: PageProps<"/jogo/[personagem]">) {
  const { personagem } = await params;
  const perfil = findProfile(personagem);
  if (!perfil) notFound();

  const data = getAtlasData();
  const content = buildGameContent(data, perfil.slug);
  if (content === null || playableChapters(content).length === 0) {
    return (
      <div className="page space-y-4 py-12">
        <h1 className="font-serif text-5xl font-medium tracking-tight">Jogo · {perfil.nome}</h1>
        <p className="max-w-2xl text-ink-soft">
          Os capítulos deste personagem dependem de acontecimentos publicados que ainda não estão na edição.
        </p>
        <Link href={gameHref()} prefetch={false} className="font-medium underline decoration-line-strong hover:decoration-ink">
          Voltar à escolha de personagem
        </Link>
      </div>
    );
  }

  // A mesma frase da entrada do atlas: o jogo usa o mesmo conteúdo.
  const { edicao } = data.conjunto;
  const notaDeRevisao =
    edicao !== null && edicao.revisao.tipo === "humana"
      ? `Revisado em ${formatDate({ valor: edicao.revisao.revisadoEm, precisao: "dia" })}.`
      : "Conferência com as fontes assistida por IA. Revisão humana pendente.";

  return (
    <>
      {/* O título fica fora da tela: a cena domina a página, e o cabeçalho do jogo está no HUD. */}
      <h1 className="sr-only">Jogo · {content.personagem.nome}</h1>
      <GameShell content={content} />
      <div className="page space-y-1 py-3 text-sm text-ink-soft" data-rodape-do-jogo>
        <p data-aviso-cenario>
          O cenário é uma representação: não afirma que a pessoa esteve neste lugar nem que os fatos aconteceram nele. Os
          registros, as fichas e as fontes continuam disponíveis no atlas, fora do jogo.
        </p>
        <p data-revisao>{notaDeRevisao}</p>
        <p>
          <Link href={gameHref()} prefetch={false} className="font-medium underline decoration-line-strong hover:decoration-ink">
            Escolher outro personagem
          </Link>
          <span aria-hidden="true"> · </span>
          O progresso fica guardado neste navegador, quando o armazenamento está disponível.
        </p>
      </div>
    </>
  );
}
