import type { Metadata } from "next";
import { IntentLink } from "@/components/IntentLink";

import { PROFILES } from "@/lib/domain/profiles";

export const metadata: Metadata = { title: "Página não encontrada" };

export default function NotFound() {
  return (
    <div className="page py-12 md:py-20">
      <header className="max-w-3xl space-y-4 border-b border-ink pb-8">
        <p className="numerals text-[5rem] font-semibold leading-none tracking-tight text-ink-faint md:text-[7.5rem]">
          404
        </p>
        <h1 className="font-serif text-4xl font-medium leading-tight tracking-tight md:text-5xl">
          Este endereço não está no atlas
        </h1>
        <p className="reading text-xl leading-snug">
          A página pode ter mudado de lugar, ou o endereço foi digitado com alguma diferença.
        </p>
      </header>

      <nav aria-label="Caminhos do atlas" className="mt-8 max-w-3xl">
        <ul className="divide-y divide-line border-y border-line">
          <li>
            <IntentLink href="/" className="flex min-h-12 items-center justify-between gap-4 font-medium no-underline hover:bg-raised">
              Voltar ao início <span aria-hidden="true">→</span>
            </IntentLink>
          </li>
          {PROFILES.map((perfil) => (
            <li key={perfil.slug}>
              <IntentLink
                href={`/politicos/${perfil.slug}`}
                className="flex min-h-12 items-center justify-between gap-4 font-medium no-underline hover:bg-raised"
              >
                Trajetória de {perfil.nome} <span aria-hidden="true">→</span>
              </IntentLink>
            </li>
          ))}
          <li>
            <IntentLink href="/comparar" className="flex min-h-12 items-center justify-between gap-4 font-medium no-underline hover:bg-raised">
              Comparar as trajetórias <span aria-hidden="true">→</span>
            </IntentLink>
          </li>
          <li>
            <IntentLink href="/jogo" className="flex min-h-12 items-center justify-between gap-4 font-medium no-underline hover:bg-raised">
              Jogar: investigar na Praça do Mural <span aria-hidden="true">→</span>
            </IntentLink>
          </li>
          <li>
            <IntentLink href="/metodologia" className="flex min-h-12 items-center justify-between gap-4 font-medium no-underline hover:bg-raised">
              Metodologia <span aria-hidden="true">→</span>
            </IntentLink>
          </li>
        </ul>
      </nav>
    </div>
  );
}
