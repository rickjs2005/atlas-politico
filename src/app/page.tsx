import Link from "next/link";

import { EditionStatus } from "@/components/EditionStatus";
import { getAtlasData } from "@/lib/content/published";
import { PROFILES } from "@/lib/domain/profiles";

export default function HomePage() {
  const { edicao } = getAtlasData().conjunto;

  return (
    <div className="space-y-10">
      <header className="max-w-3xl space-y-4">
        <h1 className="font-serif text-4xl leading-tight">Atlas Político</h1>
        <p className="text-lg">
          Um atlas para percorrer a trajetória pública de Lula e de Flávio Bolsonaro por uma linha
          do tempo, um mapa e acontecimentos acompanhados das fontes que os sustentam.
        </p>
        <EditionStatus edicao={edicao} />
      </header>

      <section aria-labelledby="perfis" className="space-y-3">
        <h2 id="perfis" className="font-serif text-2xl">
          Perfis
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {PROFILES.map((perfil) => (
            <li key={perfil.slug}>
              <Link
                href={`/politicos/${perfil.slug}`}
                className="block rounded-md border border-line bg-surface px-5 py-4 hover:border-accent"
              >
                <span className="block font-serif text-xl">{perfil.nome}</span>
                <span className="block text-sm text-ink-soft">Abrir a trajetória</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="mais" className="space-y-3">
        <h2 id="mais" className="font-serif text-2xl">
          Também no atlas
        </h2>
        <ul className="space-y-2">
          <li>
            <Link href="/comparar" className="underline">
              Comparar as duas trajetórias no mesmo período
            </Link>
          </li>
          <li>
            <Link href="/metodologia" className="underline">
              Metodologia: como fontes, datas e lugares são tratados
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
