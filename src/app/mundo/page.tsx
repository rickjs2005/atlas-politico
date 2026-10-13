import type { Metadata } from "next";

import { CityWorld } from "@/features/world/CityWorld";
import { getAtlasData } from "@/lib/content/published";
import { buildWorldContent } from "@/lib/world/content";

export const metadata: Metadata = {
  title: "Cidade do Voto",
  description:
    "Um mundo aberto para comparar, às cegas, o que os dois programas de governo registrados no TSE dizem em cada tema. Sem nome até o fim, sem recomendação de voto.",
};

export default function WorldPage() {
  return <CityWorld content={buildWorldContent(getAtlasData())} />;
}
