import type { Metadata } from "next";

import { IntentLink } from "@/components/IntentLink";
import { TrajectoryPicker, listProfiles } from "@/components/TrajectoryPicker";
import { TrajectoryLanes } from "@/features/comparison/TrajectoryLanes";
import { getAtlasData } from "@/lib/content/published";
import { getSharedSpan, listGaps } from "@/lib/data/coverage";
import { PROFILES } from "@/lib/domain/profiles";

export const metadata: Metadata = {
  title: "Explorar",
  description: "Escolha uma das duas trajetórias e explore a linha do tempo, o mapa dos acontecimentos e as decisões documentadas, com as fontes de cada registro.",
};

// Explorar (D-155): a escolha de pessoa que o menu oferece. As pessoas não
// ficam no menu, para o menu ter quatro destinos; aqui elas aparecem com o
// mesmo cartão, na ordem alfabética de sempre.
export default function ExplorePage() {
  const data = getAtlasData();
  const { edicao } = data.conjunto;
  const perfis = listProfiles(data);
  const escala = getSharedSpan(data);
  const nomes = PROFILES.map((perfil) => perfil.nome).join(" e de ");
  return (
    <div className="page space-y-10 py-7 md:space-y-14 md:py-12">
      <header className="max-w-3xl space-y-4">
        <p className="eyebrow text-ink-soft">Explorar</p>
        <h1 className="font-serif text-[2.75rem] font-medium leading-[0.95] tracking-[-0.02em] md:text-6xl">As trajetórias</h1>
        <p className="reading max-w-[34rem] text-xl leading-snug">
          A vida pública de {nomes}, acontecimento por acontecimento: a linha do tempo, o mapa, os cargos, os partidos e as decisões documentadas, com a
          fonte de cada registro.
        </p>
      </header>
      <TrajectoryPicker data={data} headingId="explorar-perfis" />
      {edicao !== null && escala !== null && perfis.length > 0 && (
        <section aria-labelledby="explorar-escala" className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
            <div className="space-y-1">
              <h2 id="explorar-escala" className="font-serif text-3xl font-medium tracking-tight">
                As duas na mesma escala
              </h2>
              <p className="max-w-2xl text-sm text-ink-soft">Cada marca é um acontecimento registrado; as barras são cargos e funções. Trecho sem marca é falta de registro nesta edição.</p>
            </div>
            <IntentLink href="/comparar" className="inline-flex min-h-11 items-center border border-ink px-4 text-sm font-medium no-underline hover:bg-ink hover:text-paper">
              Comparar as trajetórias
            </IntentLink>
          </div>
          <TrajectoryLanes
            domain={escala}
            dataDeCorte={edicao.dataDeCorte}
            detail="resumo"
            lanes={perfis.map(({ pessoa, coberto, acontecimentos }) => ({
              pessoa,
              acontecimentos,
              mandatos: data.conjunto.mandatos.filter((item) => item.pessoaId === pessoa.id),
              filiacoes: [],
              coberto,
              lacunas: listGaps(data, pessoa.id),
            }))}
          />
        </section>
      )}
    </div>
  );
}
