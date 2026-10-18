import type { Metadata } from "next";

import { IntentLink } from "@/components/IntentLink";
import { PracaPreview } from "@/components/PracaPreview";
import { getAtlasData } from "@/lib/content/published";
import { PROFILES } from "@/lib/domain/profiles";
import { countTrailPhases } from "@/lib/game/content";
import { TRAIL_ENTRY } from "@/lib/state/links";

export const metadata: Metadata = {
  title: "Jogar",
  description: "Três jeitos de jogar com os documentos do atlas: investigar na Praça do Mural, conhecer as trajetórias em fases curtas e explorar as propostas às cegas. Sem nota, sem ranking, sem recomendação de voto.",
};

// O hub do jogo (D-155): a investigação na praça é a entrada principal; a
// trilha das trajetórias e a Cidade do Voto continuam no ar, cada uma com a
// própria entrada. As rotas antigas (/praca/, /mundo/, /jogo/<pessoa>/) seguem
// valendo por acesso direto.
export default function GameHubPage() {
  const data = getAtlasData();
  const fases = PROFILES.map((perfil) => countTrailPhases(data, perfil.slug));
  const temTrilha = fases.some((quantas) => quantas > 0);
  const temPropostas = data.conjunto.propostasEleitorais.length > 0;
  const { edicao } = data.conjunto;
  const notaDeRevisao = edicao !== null && edicao.revisao.tipo === "humana" ? "Conteúdo revisado por pessoa." : "Conferência com as fontes assistida por IA. Revisão humana pendente.";

  return (
    <div className="palco flex flex-1 flex-col">
      <div className="page space-y-10 py-8 md:space-y-14 md:py-14">
        <header className="max-w-3xl space-y-4">
          <p className="eyebrow text-highlight">Jogar</p>
          <h1 className="font-serif text-[2.75rem] font-medium leading-[0.95] tracking-[-0.02em] md:text-6xl">Três jeitos de entrar nos documentos</h1>
          <p className="max-w-[36rem] font-serif text-xl leading-snug text-stage-ink md:text-2xl">
            Investigue perguntas de uma praça, siga as duas trajetórias em fases curtas ou leia as propostas sem saber de quem são. Tudo vem do atlas, com as
            fontes.
          </p>
        </header>

        <ul className="grid gap-5 lg:grid-cols-3" data-hub-do-jogo>
          <li className="flex flex-col overflow-hidden border border-action bg-stage-raised lg:col-span-3 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]" data-caminho="praca">
            <div className="flex flex-col gap-4 p-5 md:p-7">
              <p className="eyebrow text-action">Investigar · entrada principal</p>
              <h2 className="font-serif text-3xl font-medium leading-tight tracking-tight md:text-4xl">Investigar na Praça do Mural</h2>
              <p className="max-w-[34rem] text-stage-ink-soft">
                Os moradores pregam perguntas no mural sobre o que os políticos decidiram. Quem responde precisa achar o documento certo no arquivo e pregar
                a cópia junto: a nota só fica se os campos baterem. Cerca de cinco minutos por sessão, estimativa de projeto.
              </p>
              <ul className="grid gap-1 text-sm text-stage-ink-soft sm:grid-cols-2">
                <li>Uma pergunta por vez, com o objetivo sempre à vista.</li>
                <li>Erro explicado pelo documento escolhido, e nova tentativa.</li>
                <li>Nota no mural, carimbo e reação de quem perguntou.</li>
                <li>Teclado, joystick, toque; lista sem WebGL; modo leve.</li>
              </ul>
              <div className="mt-auto flex flex-wrap gap-3 pt-2">
                <IntentLink href="/praca" className="btn-acao" data-comecar-investigacao>
                  Começar investigação
                </IntentLink>
              </div>
            </div>
            <div className="border-t border-stage-line lg:border-t-0 lg:border-l">
              <PracaPreview decorative className="block h-full w-full object-cover" />
            </div>
          </li>

          <li className="flex flex-col gap-4 border border-stage-line bg-stage-raised p-5 md:p-6 lg:col-span-2" data-caminho="trajetorias">
            <p className="eyebrow text-highlight">Trajetórias</p>
            <h2 className="font-serif text-2xl font-medium leading-tight tracking-tight md:text-3xl">Conhecer trajetórias</h2>
            <p className="text-stage-ink-soft">
              {temTrilha
                ? `Cada pessoa em fases curtas, da origem à data de corte: um marco, uma explicação e uma pergunta por fase. ${PROFILES.map((perfil, i) => `${perfil.nome}: ${fases[i]} ${fases[i] === 1 ? "fase" : "fases"}`).join(" · ")}.`
                : "A trilha depende de fases publicadas no conteúdo do atlas. Ainda não há nenhuma."}
            </p>
            <div className="mt-auto pt-2">
              <IntentLink href={TRAIL_ENTRY} className="btn-palco" data-abrir-trajetorias>
                Escolher uma trajetória
              </IntentLink>
            </div>
          </li>

          <li className="flex flex-col gap-4 border border-stage-line bg-stage-raised p-5 md:p-6" data-caminho="propostas">
            <p className="eyebrow text-highlight">Propostas</p>
            <h2 className="font-serif text-2xl font-medium leading-tight tracking-tight md:text-3xl">Explorar propostas</h2>
            <p className="text-stage-ink-soft">
              {temPropostas
                ? "As frases dos programas registrados no TSE, tema a tema, sem o nome de quem as escreveu até o fim. Também lado a lado, com o nome, na comparação."
                : "As propostas registradas no TSE ainda não estão nesta edição."}
            </p>
            <div className="mt-auto flex flex-col gap-2 pt-2">
              <IntentLink href="/mundo" className="btn-palco" data-abrir-propostas>
                Às cegas, na Cidade do Voto
              </IntentLink>
              <IntentLink href="/comparar#propostas" className="inline-flex min-h-11 items-center text-sm font-medium text-stage-ink underline decoration-stage-line hover:decoration-stage-ink">
                Lado a lado, na comparação
              </IntentLink>
            </div>
          </li>
        </ul>

        <section aria-labelledby="o-que-o-jogo-nao-e" className="max-w-3xl space-y-2 border-t border-stage-line pt-6 text-sm text-stage-ink-soft">
          <h2 id="o-que-o-jogo-nao-e" className="eyebrow text-highlight">
            O que o jogo não é
          </h2>
          <p data-avisos-do-jogo>
            Nenhum modo dá nota, soma pontos, aponta vencedor ou recomenda voto. A praça, os moradores e os cenários são ficção feita para o projeto; os
            documentos são os registros publicados neste atlas, sem reescrita. {notaDeRevisao}{" "}
            <IntentLink href="/metodologia" className="text-stage-ink underline decoration-stage-line hover:decoration-stage-ink">
              Metodologia e fontes
            </IntentLink>
          </p>
        </section>
      </div>
    </div>
  );
}
