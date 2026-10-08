import path from "node:path";

import { loadContentSet } from "@/lib/content/load";
import type { Conjunto } from "@/lib/domain/schemas";
import type { ExplorerData } from "@/lib/state/selectors";

export const FIXTURES_DIR = path.resolve("tests/fixtures/sintetico");
export const PUBLISHED_DIR = path.resolve("content/published");

/** Cópia nova do conjunto sintético a cada chamada, para o teste poder alterar. */
export function loadFixtures(): Conjunto {
  const conjunto = loadContentSet(FIXTURES_DIR);
  if (conjunto === null) throw new Error("Fixtures sintéticas não encontradas.");
  return conjunto;
}

/** O que a interface recebe: só acontecimentos revisados. */
export function loadExplorerData(): ExplorerData {
  const { pessoas, acontecimentos, lugares, fontes } = loadFixtures();
  return {
    pessoas,
    lugares,
    fontes,
    acontecimentos: acontecimentos.filter((item) => item.editorial.estado === "revisado"),
  };
}

export function slugs(itens: { slug: string }[]): string[] {
  return itens.map((item) => item.slug.replace("sintetico-evento-", ""));
}
