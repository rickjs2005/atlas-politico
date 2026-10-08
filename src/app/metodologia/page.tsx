import type { Metadata } from "next";

import { EditionStatus } from "@/components/EditionStatus";
import { getPublishedSet } from "@/lib/content/published";

export const metadata: Metadata = { title: "Metodologia" };

// Versão preliminar: registra as regras que o modelo de dados já garante. Os
// critérios de seleção dos acontecimentos, os créditos e o canal de correção
// entram com o conteúdo (fases 2 e 7).
const REGRAS = [
  {
    titulo: "Fontes",
    texto:
      "Cada registro publicado aponta para ao menos uma fonte e indica em que trecho dela está a evidência e o que esse trecho sustenta. Toda fonte traz autoria, endereço, data do documento quando conhecida e data de acesso.",
  },
  {
    titulo: "Datas",
    texto:
      "Uma data aparece com a precisão que a fonte sustenta: dia, mês ou ano. O atlas não completa datas parciais. Quando o início ou o fim de um mandato não está documentado, isso é dito de forma explícita.",
  },
  {
    titulo: "Lugares",
    texto:
      "Os pontos do mapa informam a precisão da coordenada. O centro de um município é uma aproximação e é identificado assim. Acontecimentos de abrangência nacional, ou sem lugar documentado, continuam na linha do tempo e na lista, sem um ponto inventado.",
  },
  {
    titulo: "Revisão",
    texto:
      "A pesquisa começa como rascunho. Só entra nas páginas o que foi revisado, com o nome de quem revisou e a data. Cada edição do conteúdo informa a data de corte e o que mudou.",
  },
];

export default function MethodologyPage() {
  const { edicao } = getPublishedSet();

  return (
    <div className="max-w-3xl space-y-6">
      <header className="space-y-4">
        <h1 className="font-serif text-4xl leading-tight">Metodologia</h1>
        <p className="text-lg">Como o atlas trata fontes, datas, lugares e revisão.</p>
        <EditionStatus edicao={edicao} />
      </header>

      <dl className="space-y-5">
        {REGRAS.map((regra) => (
          <div key={regra.titulo}>
            <dt className="font-serif text-xl">{regra.titulo}</dt>
            <dd className="mt-1">{regra.texto}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
