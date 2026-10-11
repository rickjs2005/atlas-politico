import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PROFILES, findProfile } from "@/lib/domain/profiles";

import { GamePage } from "./GamePage";

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
  return <GamePage perfil={perfil} sala="historico" />;
}
