// robots.txt gerado no build. Enquanto não há domínio decidido e indexação
// liberada (src/lib/site.ts), bloqueia tudo: a edição não passou pela revisão
// humana. Com os dois, libera o site, menos as telas de desenvolvimento, e
// aponta o sitemap.

import type { MetadataRoute } from "next";

import { SITE, isIndexable } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  if (!isIndexable() || SITE.publicUrl === null) return { rules: { userAgent: "*", disallow: "/" } };
  return { rules: { userAgent: "*", allow: "/", disallow: ["/dev/"] }, sitemap: `${SITE.publicUrl}/sitemap.xml` };
}
