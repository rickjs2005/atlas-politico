import type { Metadata } from "next";

import { IntentLink } from "@/components/IntentLink";
import { PracaPreview } from "@/components/PracaPreview";
import { getAtlasData } from "@/lib/content/published";
import { PROFILES } from "@/lib/domain/profiles";
import { countTrailPhases } from "@/lib/game/content";
import { TRAIL_ENTRY } from "@/lib/state/links";

export const metadata: Metadata = {
  title: "Jogar",
  description:
    "Quatro jeitos de jogar: investigar na Praça do Mural, conhecer as trajetórias em fases curtas, explorar as propostas às cegas e a sátira Vale a Faixa, uma luta de escadas pela faixa presidencial. Sem nota, sem ranking, sem recomendação de voto.",
};

// O hub do jogo (D-155): a investigação na praça é a entrada principal; a
// trilha das trajetórias e a Cidade do Voto continuam no ar, cada uma com a
// própria entrada. As rotas antigas (/praca/, /mundo/, /jogo/<pessoa>/) seguem
// valendo por acesso direto. O Vale a Faixa (D-156) é a quarta entrada: uma
// sátira interativa, de luta, separada dos documentos e identificada como tal.
/** A faixa verde e amarela, de enfeite, no canto do cartão da sátira. */
function FaixaDecorativa() {
  return (
    <svg aria-hidden="true" viewBox="0 0 120 120" className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 opacity-80">
      <path d="M-10 70 L80 -20 L104 4 L14 94 Z" fill="#1f8f4a" stroke="#111613" strokeWidth="3" />
      <path d="M-2 78 L88 -12 L96 -4 L6 86 Z" fill="#f0c66b" />
      <circle cx="30" cy="66" r="11" fill="#f0c66b" stroke="#111613" strokeWidth="3" />
      <circle cx="30" cy="66" r="6" fill="#1f8f4a" />
    </svg>
  );
}

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
          <h1 className="font-serif text-[2.75rem] font-medium leading-[0.95] tracking-[-0.02em] md:text-6xl">Três jeitos de entrar nos documentos, e uma sátira</h1>
          <p className="max-w-[36rem] font-serif text-xl leading-snug text-stage-ink md:text-2xl">
            Investigue perguntas de uma praça, siga as duas trajetórias em fases curtas ou leia as propostas sem saber de quem são. Tudo vem do atlas, com as
            fontes. E, à parte, uma luta de escadas pela faixa.
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

          <li className="flex flex-col gap-4 border border-stage-line bg-stage-raised p-5 md:p-6" data-caminho="trajetorias">
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

          <li className="relative flex flex-col gap-4 overflow-hidden border border-stage-line bg-stage-raised p-5 md:p-6" data-caminho="vale-a-faixa">
            <FaixaDecorativa />
            <p className="eyebrow text-highlight">Sátira interativa</p>
            <h2 className="font-serif text-2xl font-medium leading-tight tracking-tight md:text-3xl">Vale a Faixa</h2>
            <p className="text-stage-ink-soft">
              Dois candidatos, uma escada, uma faixa. Lula e Flávio Bolsonaro em caricatura disputam, em um ringue montado no palco de um debate, quem sobe e
              tira a faixa presidencial. Partidas de um a três minutos, contra o computador, no computador ou no celular.
            </p>
            <div className="mt-auto pt-2">
              <IntentLink href="/jogo/vale-a-faixa" className="btn-palco" data-abrir-vale-a-faixa>
                Jogar Vale a Faixa
              </IntentLink>
            </div>
          </li>
        </ul>

        <section aria-labelledby="o-que-o-jogo-nao-e" className="max-w-3xl space-y-2 border-t border-stage-line pt-6 text-sm text-stage-ink-soft">
          <h2 id="o-que-o-jogo-nao-e" className="eyebrow text-highlight">
            O que o jogo não é
          </h2>
          <p data-avisos-do-jogo>
            Nenhum modo dá nota, soma pontos ou recomenda voto; o único vencedor é o da partida do Vale a Faixa, que é sátira e não diz nada sobre as pessoas. A
            praça, os moradores e os cenários são ficção feita para o projeto; os documentos são os registros publicados neste atlas, sem reescrita. {notaDeRevisao}{" "}
            <IntentLink href="/metodologia" className="text-stage-ink underline decoration-stage-line hover:decoration-stage-ink">
              Metodologia e fontes
            </IntentLink>
          </p>
        </section>
      </div>
    </div>
  );
}
