import type { Metadata } from "next";

import { EditionStatus } from "@/components/EditionStatus";
import { getAtlasData } from "@/lib/content/published";
import { PROFILES } from "@/lib/domain/profiles";

export const metadata: Metadata = { title: "Comparar" };

export default function ComparePage() {
  const { edicao } = getAtlasData().conjunto;
  const nomes = PROFILES.map((perfil) => perfil.nome).join(" e ");

  return (
    <div className="max-w-3xl space-y-6">
      <header className="space-y-4">
        <h1 className="font-serif text-4xl leading-tight">Comparar trajetórias</h1>
        <p className="text-lg">
          As trajetórias de {nomes} lado a lado, no mesmo ano ou período e na mesma escala de tempo.
        </p>
        <EditionStatus edicao={edicao} />
      </header>

      <section aria-labelledby="regras" className="space-y-3">
        <h2 id="regras" className="font-serif text-2xl">
          O que a comparação mostra
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Cargos, filiações e acontecimentos documentados de cada pessoa no período escolhido.</li>
          <li>
            A cobertura do conjunto para cada pessoa. Um período sem registros é apresentado como
            falta de dados no atlas, e não como falta de atividade.
          </li>
          <li>
            Nenhuma nota ou placar. A quantidade de registros não mede desempenho, e os cargos de
            cada pessoa em cada época são diferentes.
          </li>
        </ul>
      </section>
    </div>
  );
}
