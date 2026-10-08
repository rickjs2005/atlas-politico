import type { Metadata } from "next";
import Link from "next/link";

import { PROFILES } from "@/lib/domain/profiles";

export const metadata: Metadata = { title: "Página não encontrada" };

export default function NotFound() {
  return (
    <div className="max-w-3xl space-y-6">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-ink-soft">Erro 404</p>
        <h1 className="font-serif text-4xl leading-tight">Este endereço não está no atlas</h1>
        <p className="text-lg">
          A página pode ter mudado de lugar, ou o endereço foi digitado com alguma diferença.
        </p>
      </header>

      <nav aria-label="Caminhos do atlas">
        <ul className="space-y-2">
          <li>
            <Link href="/" className="underline">
              Voltar ao início
            </Link>
          </li>
          {PROFILES.map((perfil) => (
            <li key={perfil.slug}>
              <Link href={`/politicos/${perfil.slug}`} className="underline">
                Trajetória de {perfil.nome}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/metodologia" className="underline">
              Metodologia
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
