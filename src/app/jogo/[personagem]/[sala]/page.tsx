import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAtlasData } from "@/lib/content/published";
import { findPersonBySlug } from "@/lib/data/queries";
import { PROFILES, findProfile } from "@/lib/domain/profiles";
import { roomSummaries } from "@/lib/game/content";
import { isRoomId, roomOf } from "@/lib/game/rooms";

import { GamePage } from "../GamePage";

// As rotas dos aprofundamentos: uma por personagem e sala com fase publicada.
// A trajetória fica em /jogo/<personagem>/.
export const dynamicParams = false;

export function generateStaticParams() {
  const data = getAtlasData();
  return PROFILES.flatMap(({ slug }) => {
    const pessoa = findPersonBySlug(data, slug);
    if (pessoa === null) return [];
    return roomSummaries(data, pessoa.id)
      .filter((sala) => sala.id !== "historico")
      .map((sala) => ({ personagem: slug, sala: sala.id }));
  });
}

export async function generateMetadata({ params }: PageProps<"/jogo/[personagem]/[sala]">): Promise<Metadata> {
  const { personagem, sala } = await params;
  const perfil = findProfile(personagem);
  if (!perfil || !isRoomId(sala)) return {};
  return {
    title: `Jogo · ${perfil.nome} · ${roomOf(sala).nome}`,
    description: `Aprofundamento sobre decisões documentadas de ${perfil.nome} no tema ${roomOf(sala).nome}: o que foi decidido, quando, e o que cada documento sustenta.`,
  };
}

export default async function RoomPage({ params }: PageProps<"/jogo/[personagem]/[sala]">) {
  const { personagem, sala } = await params;
  const perfil = findProfile(personagem);
  if (!perfil || !isRoomId(sala) || sala === "historico") notFound();
  return <GamePage perfil={perfil} sala={sala} />;
}
