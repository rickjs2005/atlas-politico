import Link from "next/link";

import { PROFILES } from "@/lib/domain/profiles";

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-6xl flex-wrap items-baseline justify-between gap-x-8 gap-y-2 px-4 py-4">
        <Link href="/" className="font-serif text-xl font-semibold no-underline">
          Atlas Político
        </Link>
        <nav aria-label="Principal">
          <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
            {PROFILES.map((perfil) => (
              <li key={perfil.slug}>
                <Link href={`/politicos/${perfil.slug}`} className="hover:underline">
                  {perfil.nome}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/comparar" className="hover:underline">
                Comparar
              </Link>
            </li>
            <li>
              <Link href="/metodologia" className="hover:underline">
                Metodologia
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
