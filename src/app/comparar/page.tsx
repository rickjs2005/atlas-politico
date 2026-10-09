import type { Metadata } from "next";

import { getAtlasData } from "@/lib/content/published";
import { PROFILES } from "@/lib/domain/profiles";

import { Comparison } from "./Comparison";

export const metadata: Metadata = {
  title: "Comparar",
  description:
    "As duas trajetórias no mesmo intervalo de anos e com as mesmas categorias: acontecimentos, cargos, partidos e fontes de cada pessoa, sem ranking nem nota.",
};

export default function ComparePage() {
  return <Comparison data={getAtlasData()} order={PROFILES.map((perfil) => perfil.slug)} />;
}
