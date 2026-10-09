import type { Metadata } from "next";

import { EditionStatus } from "@/components/EditionStatus";
import { getAtlasData } from "@/lib/content/published";

export const metadata: Metadata = { title: "Metodologia" };

// Versão preliminar: registra as regras que o modelo de dados e a interface já
// garantem. Os critérios de seleção dos acontecimentos, a lista completa de
// fontes e o canal de correção entram na fase 7.
const REGRAS = [
  {
    titulo: "Fontes",
    texto:
      "Cada registro publicado aponta para ao menos uma fonte e indica em que trecho dela está a evidência e o que esse trecho sustenta. Toda fonte traz autoria, endereço, data do documento quando conhecida e data de acesso.",
  },
  {
    titulo: "Datas",
    texto:
      "Uma data aparece com a precisão que a fonte sustenta: dia, mês ou ano. O atlas não completa datas parciais. Na linha do tempo, um acontecimento de que só se sabe o ano ocupa o ano inteiro. Quando o início ou o fim de um mandato não está documentado, isso é dito de forma explícita.",
  },
  {
    titulo: "Lugares",
    texto:
      "Os pontos do mapa informam a precisão da coordenada. O centro de um município ou de um estado é uma aproximação e é identificado assim. Acontecimentos de abrangência nacional, ou sem lugar documentado, continuam na linha do tempo e na lista, sem um ponto inventado. A ordem dos pontos no tempo não é um trajeto.",
  },
  {
    titulo: "Revisão",
    texto:
      "A pesquisa começa como rascunho. Só entra nas páginas o que foi conferido com as fontes, com a indicação de quem conferiu e a data. Cada registro diz se a conferência foi assistida por IA ou feita por uma pessoa, e a revisão humana só é registrada quando de fato aconteceu. Cada edição do conteúdo informa a data de corte e o que mudou.",
  },
  {
    titulo: "Dois perfis, a mesma régua",
    texto:
      "Os dois perfis usam as mesmas telas, a mesma área de retrato, as mesmas seções e os mesmos critérios de seleção e de redação. Os nomes aparecem em ordem alfabética. Nenhuma cor identifica uma pessoa: as cores distinguem categorias de acontecimento e a seleção em curso.",
  },
  {
    titulo: "Comparação e cobertura",
    texto:
      "A comparação põe as duas trajetórias na mesma escala de anos. Carreiras de duração diferente não são niveladas. Um período sem acontecimentos indica falta de registro nesta edição, e não falta de atividade. Quantidades são sempre de registros do atlas e não medem desempenho.",
  },
];

export default function MethodologyPage() {
  const data = getAtlasData();
  const { edicao, imagens } = data.conjunto;

  return (
    <div className="page py-8 md:py-12">
      <header className="max-w-3xl space-y-4 border-b border-ink pb-8">
        <p className="eyebrow text-ink-soft">Como o atlas é feito</p>
        <h1 className="font-serif text-5xl font-medium leading-none tracking-tight md:text-6xl">
          Metodologia
        </h1>
        <p className="reading text-xl leading-snug">
          Como o atlas trata fontes, datas, lugares e revisão, e o que a comparação pode e não pode
          dizer.
        </p>
        <EditionStatus edicao={edicao} />
      </header>

      <dl className="mt-8 grid max-w-5xl gap-x-12 gap-y-8 md:grid-cols-2">
        {REGRAS.map((regra) => (
          <div key={regra.titulo} className="space-y-2">
            <dt className="font-serif text-2xl font-medium tracking-tight">{regra.titulo}</dt>
            <dd className="reading text-base leading-relaxed text-ink-soft">{regra.texto}</dd>
          </div>
        ))}
      </dl>

      <section id="creditos" aria-labelledby="titulo-creditos" className="mt-12 max-w-3xl space-y-4 border-t border-line pt-8">
        <h2 id="titulo-creditos" className="font-serif text-3xl font-medium tracking-tight">
          Créditos
        </h2>

        <div className="space-y-2">
          <h3 className="eyebrow text-ink-soft">Imagens</h3>
          {imagens.length === 0 ? (
            <p className="text-sm text-ink-soft">Nenhuma imagem nesta edição.</p>
          ) : (
            <ul className="divide-y divide-line border-y border-line text-sm">
              {imagens.map((imagem) => (
                <li key={imagem.id} className="space-y-1 py-3">
                  <p className="font-medium">{imagem.credito}</p>
                  <p className="text-ink-soft">{imagem.condicoesDeUso}</p>
                  <p className="text-ink-soft">
                    No atlas, a imagem é exibida em tons de cinza e recortada.{" "}
                    <a
                      href={imagem.origem}
                      target="_blank"
                      rel="noreferrer"
                      className="underline decoration-line-strong hover:decoration-ink"
                    >
                      Página de origem<span className="sr-only"> (abre em nova aba)</span>
                    </a>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="eyebrow text-ink-soft">Mapa e tipografia</h3>
          <ul className="space-y-1 text-sm text-ink-soft">
            <li>Contornos do mapa: Natural Earth, domínio público.</li>
            <li>Coordenadas dos lugares: centro do município ou do estado, pela API de malhas do IBGE.</li>
            <li>
              Tipos: Newsreader e Libre Franklin, sob a SIL Open Font License 1.1, servidos pelo
              próprio site.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
