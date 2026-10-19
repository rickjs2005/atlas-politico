// sitemap.xml gerado no build: as páginas do atlas e do jogo, com a data de
// corte da edição como data de modificação. Vazio enquanto não há domínio
// decidido e indexação liberada (src/lib/site.ts): um sitemap só faz sentido
// com endereços absolutos do domínio público.

import type { MetadataRoute } from "next";

import { getAtlasData } from "@/lib/content/published";
import { PROFILES } from "@/lib/domain/profiles";
import { SITE, isIndexable } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!isIndexable() || SITE.publicUrl === null) return [];
  const base = SITE.publicUrl;
  const data = getAtlasData();
  const lastModified = data.conjunto.edicao?.dataDeCorte;
  const caminhos = [
    "/",
    "/explorar/",
    "/jogo/",
    "/jogo/trajetorias/",
    "/jogo/vale-a-faixa/",
    "/praca/",
    "/mundo/",
    "/comparar/",
    "/metodologia/",
    ...PROFILES.flatMap((perfil) => [`/politicos/${perfil.slug}/`, `/jogo/${perfil.slug}/`]),
    ...data.conjunto.acontecimentos.map((acontecimento) => `/acontecimentos/${acontecimento.slug}/`),
  ];
  return caminhos.map((caminho) => ({ url: `${base}${caminho}`, lastModified }));
}
