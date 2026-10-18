// A escolha de trajetória, na entrada e em Explorar (D-155): os dois perfis
// com o mesmo cartão, o mesmo acesso ao jogo logo abaixo e o crédito de cada
// retrato. Componente de servidor: lê o conjunto publicado.

import Link from "next/link";

import { IntentLink } from "@/components/IntentLink";
import { PersonCard } from "@/components/PersonCard";
import { PortraitCredit } from "@/components/Portrait";
import { getCoveredSpan } from "@/lib/data/coverage";
import { filterEvents, findPersonBySlug, getImage } from "@/lib/data/queries";
import type { AtlasData } from "@/lib/data/types";
import { PROFILES } from "@/lib/domain/profiles";
import { countTrailPhases } from "@/lib/game/content";
import { gameHref } from "@/lib/state/links";

/** Os perfis na ordem da interface, com o que a escolha mostra. Um perfil sem registros ainda não aparece. */
export function listProfiles(data: AtlasData) {
  return PROFILES.flatMap((perfil) => {
    const pessoa = findPersonBySlug(data, perfil.slug);
    if (pessoa === null) return [];
    return [
      {
        pessoa,
        retrato: getImage(data, pessoa.retratoId),
        coberto: getCoveredSpan(data, pessoa.id),
        acontecimentos: filterEvents(data, { pessoaIds: [pessoa.id] }),
        // As fases da trajetória no jogo, pelo conteúdo publicado.
        fases: countTrailPhases(data, perfil.slug),
      },
    ];
  });
}

export function TrajectoryPicker({ data, headingId = "perfis" }: { data: AtlasData; headingId?: string }) {
  const perfis = listProfiles(data);
  const temJogo = perfis.some((perfil) => perfil.fases > 0);
  return (
    <section aria-labelledby={headingId} className="space-y-3">
      <h2 id={headingId} className="eyebrow text-ink-soft">
        Escolha uma trajetória
      </h2>
      {perfis.length === 0 ? (
        <p className="text-ink-soft">Os perfis aparecem aqui quando houver registros revisados.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 md:gap-5">
          {perfis.map(({ pessoa, retrato, coberto, acontecimentos }) => (
            <li key={pessoa.id} className="flex">
              <PersonCard pessoa={pessoa} retrato={retrato} coberto={coberto} registros={acontecimentos.length} />
            </li>
          ))}
        </ul>
      )}
      {/* A trilha do jogo: o mesmo acesso para os dois, logo abaixo de cada cartão. */}
      {temJogo && (
        <div className="grid grid-cols-2 gap-3 md:gap-5" data-secao="jogo">
          {perfis.map(({ pessoa, fases }) =>
            fases === 0 ? (
              <span key={pessoa.id} />
            ) : (
              <IntentLink
                key={pessoa.id}
                href={gameHref(pessoa.slug)}
                data-jogar-entrada={pessoa.slug}
                className="flex min-h-11 flex-col items-center justify-center border border-ink bg-ink px-3 py-2 text-center text-sm font-medium leading-tight text-paper no-underline hover:bg-ink-soft"
              >
                <span>Jogar com {pessoa.nome}</span>
                <span className="numerals text-xs font-normal text-paper/80">
                  {fases} {fases === 1 ? "fase curta" : "fases curtas"}
                </span>
              </IntentLink>
            ),
          )}
        </div>
      )}
      {temJogo && (
        <p className="text-sm text-ink-soft">
          Na trilha, você segue cada trajetória em fases curtas, da origem à data de corte: um marco, uma explicação e uma pergunta por fase.{" "}
          <Link href={gameHref()} prefetch={false} className="inline-flex min-h-11 items-center font-medium underline decoration-line-strong hover:decoration-ink md:min-h-0">
            Como é a trilha
          </Link>
        </p>
      )}
      <div className="grid grid-cols-2 gap-3 md:gap-5">
        {perfis.map(({ pessoa, retrato }) => (retrato === null ? <span key={pessoa.id} /> : <PortraitCredit key={pessoa.id} imagem={retrato} />))}
      </div>
    </section>
  );
}
