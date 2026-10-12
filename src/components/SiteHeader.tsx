import { PROFILES } from "@/lib/domain/profiles";

import { IntentLink } from "./IntentLink";
import { SiteNav } from "./SiteNav";

const NAV_ITEMS = [
  ...PROFILES.map((perfil) => ({ href: `/politicos/${perfil.slug}`, label: perfil.nome })),
  { href: "/comparar", label: "Comparar" },
  { href: "/jogo", label: "Jogo" },
  { href: "/metodologia", label: "Metodologia" },
];

export function SiteHeader() {
  return (
    <header className="relative z-30 border-b border-ink bg-paper">
      <div className="page flex h-[var(--atlas-header-h)] items-center justify-between gap-6">
        {/* A área de toque tem a altura mínima de 44 pixels; o desenho do nome não muda. */}
        <IntentLink href="/" className="inline-flex min-h-11 items-center font-serif text-[1.375rem] font-medium leading-none tracking-tight no-underline">
          Atlas Político
        </IntentLink>
        <SiteNav items={NAV_ITEMS} />
      </div>
    </header>
  );
}
