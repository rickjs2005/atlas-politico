import type { Metadata } from "next";

import { PracaWorld } from "@/features/praca/PracaWorld";
import { getAtlasData } from "@/lib/content/published";
import { buildPracaContent } from "@/lib/praca/conteudo";

export const metadata: Metadata = {
  title: "Praça do Mural",
  description:
    "Uma aventura de investigação em uma praça brasileira: os moradores pregam perguntas no mural, e quem responde precisa achar o documento certo no arquivo. Sem nota, sem pontos, sem recomendação de voto.",
};

export default function PracaPage() {
  return <PracaWorld conteudo={buildPracaContent(getAtlasData())} />;
}
