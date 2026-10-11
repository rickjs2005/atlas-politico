import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PROFILES, findProfile } from "@/lib/domain/profiles";
import { CHAPTERS } from "@/lib/game/chapters";
import { ROOMS, isRoomId, roomOf } from "@/lib/game/rooms";

import { GamePage } from "../GamePage";

// As rotas das salas temáticas: uma por personagem e sala com capítulo
// declarado. A sala Histórico fica em /jogo/<personagem>/.
export const dynamicParams = false;

export function generateStaticParams() {
  return PROFILES.flatMap(({ slug }) =>
    ROOMS.filter((sala) => sala.id !== "historico" && CHAPTERS.some((capitulo) => capitulo.personagem === slug && capitulo.sala === sala.id)).map((sala) => ({
      personagem: slug,
      sala: sala.id,
    })),
  );
}

export async function generateMetadata({ params }: PageProps<"/jogo/[personagem]/[sala]">): Promise<Metadata> {
  const { personagem, sala } = await params;
  const perfil = findProfile(personagem);
  if (!perfil || !isRoomId(sala)) return {};
  return {
    title: `Jogo · ${perfil.nome} · ${roomOf(sala).nome}`,
    description: `As decisões documentadas de ${perfil.nome} no tema ${roomOf(sala).nome}, como registros a recolher e interpretar no jogo do atlas.`,
  };
}

export default async function RoomPage({ params }: PageProps<"/jogo/[personagem]/[sala]">) {
  const { personagem, sala } = await params;
  const perfil = findProfile(personagem);
  if (!perfil || !isRoomId(sala) || sala === "historico") notFound();
  return <GamePage perfil={perfil} sala={sala} />;
}
