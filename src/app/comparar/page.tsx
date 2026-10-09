import type { Metadata } from "next";

import { getAtlasData } from "@/lib/content/published";
import { PROFILES } from "@/lib/domain/profiles";

import { Comparison } from "./Comparison";

export const metadata: Metadata = { title: "Comparar" };

export default function ComparePage() {
  return <Comparison data={getAtlasData()} order={PROFILES.map((perfil) => perfil.slug)} />;
}
