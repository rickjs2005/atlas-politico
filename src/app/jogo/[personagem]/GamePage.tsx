// A página do jogo de um personagem em uma sala: a casca com o cenário e,
// abaixo, os avisos editoriais. Serve à rota da trajetória
// (/jogo/<personagem>/) e às rotas dos aprofundamentos
// (/jogo/<personagem>/<sala>/). Componente de servidor: o conteúdo vem dos
// dados gerados no build.
//
// Sem JavaScript o cenário não chega. As fases, com a explicação, a pergunta
// e a resposta explicada, vão no próprio HTML, em texto: o cenário nunca é o
// único jeito de ler um fato. Nesse caso a casca do cenário sai da página (ela
// só diria "Carregando o jogo…", com botões que não respondem), e o texto das
// fases começa na primeira tela.

import Link from "next/link";

import { PATH_LINK } from "@/components/touch";
import { GameShell } from "@/features/game/GameShell";
import { getAtlasData } from "@/lib/content/published";
import { findPersonBySlug } from "@/lib/data/queries";
import { formatDate } from "@/lib/domain/dates";
import { PROFILES, type ProfileSlug } from "@/lib/domain/profiles";
import { buildGameContent, buildPassportPages, buildProgressKeys, type ProgressKeys } from "@/lib/game/content";
import { periodLabel, roomLabel, roomOf } from "@/lib/game/rooms";
import { orderDates } from "@/lib/game/trail";
import type { GameContent, RoomId } from "@/lib/game/types";
import { gameHref } from "@/lib/state/links";

/** As fases em texto, para quem está sem JavaScript: o mesmo conteúdo, sem o cenário e sem a interação. */
function PhasesAsText({ content }: { content: GameContent }) {
  const sala = roomOf(content.sala);
  return (
    <div className="page max-w-3xl space-y-8 py-6" data-fases-em-texto>
      <p className="border border-line-strong bg-notice px-3 py-2 text-sm" data-sem-javascript>
        O cenário do jogo precisa de JavaScript. As fases estão abaixo, em texto, com a explicação e a resposta de cada atividade. Os registros e as fontes
        estão na{" "}
        <a href={`/politicos/${content.personagem.slug}/`} className="font-medium underline">
          trajetória de {content.personagem.nome} no atlas
        </a>
        .
      </p>
      {content.fases.map((fase) => {
        const { atividade } = fase;
        const certa = atividade.tipo === "pergunta" ? atividade.opcoes.find((opcao) => opcao.id === atividade.correta) : undefined;
        return (
          <section key={fase.id} className="space-y-3" aria-labelledby={`texto-${fase.id}`}>
            <p className="eyebrow text-ink-soft">
              {roomLabel(sala)} · Fase {fase.numero} de {content.fases.length} · {periodLabel(fase.periodo)}
            </p>
            <h2 id={`texto-${fase.id}`} className="font-serif text-2xl font-medium leading-tight">
              {fase.titulo}
            </h2>
            {fase.explicacao.map((bloco, indice) => (
              <p key={indice} className="reading text-base leading-relaxed">
                {bloco.texto}
              </p>
            ))}
            {fase.conceitos.flatMap((id) => {
              const conceito = content.conceitos[id];
              return conceito === undefined
                ? []
                : [
                    <p key={id} className="text-sm">
                      <span className="font-medium">{conceito.termo}: </span>
                      {conceito.definicao}
                    </p>,
                  ];
            })}
            <p className="text-sm">
              <span className="font-medium">Atividade: </span>
              {atividade.enunciado}
            </p>
            <p className="text-sm">
              <span className="font-medium">Resposta: </span>
              {certa !== undefined && `${certa.texto} `}
              {atividade.tipo === "ordem" &&
                `${orderDates(atividade, content)
                  .map((item) => `${item.titulo} (${item.data})`)
                  .join("; ")}. `}
              {atividade.explicacao}
            </p>
            {fase.lacunas.length > 0 && <p className="text-sm text-ink-soft">Ainda não pesquisado nesta edição: {fase.lacunas.join(" ")}</p>}
          </section>
        );
      })}
    </div>
  );
}

export function GamePage({ perfil, sala }: { perfil: { slug: ProfileSlug; nome: string }; sala: RoomId }) {
  const data = getAtlasData();
  const content = buildGameContent(data, perfil.slug, sala);
  const salaSpec = roomOf(sala);
  if (content === null || content.fases.length === 0) {
    return (
      <div className="page space-y-4 py-12">
        <h1 className="font-serif text-5xl font-medium tracking-tight">
          Jogo · {perfil.nome}
          {sala !== "historico" && ` · ${roomLabel(salaSpec)}`}
        </h1>
        <p className="max-w-2xl text-ink-soft">
          {sala === "historico" ? "A trajetória deste personagem depende de fases que ainda não estão na edição." : "Este aprofundamento depende de fases que ainda não estão na edição."}
        </p>
        <Link href={gameHref()} prefetch={false} className={PATH_LINK}>
          Voltar à escolha de trajetória
        </Link>
      </div>
    );
  }

  // A outra trajetória do atlas, para o caminho até ela no resumo.
  const outro = PROFILES.find((item) => item.slug !== perfil.slug && (buildGameContent(data, item.slug, "historico")?.fases.length ?? 0) > 0);
  const outraPessoa = outro === undefined ? null : { slug: outro.slug, nome: findPersonBySlug(data, outro.slug)?.nome ?? outro.nome };

  // O passaporte tem uma página por pessoa: a casca recebe as fases de todas e o que precisa para ler, só para leitura,
  // o progresso guardado das outras. Os totais de carimbos saem daqui, das fases publicadas.
  const passaporte = buildPassportPages(data);
  const outrasChaves: Partial<Record<ProfileSlug, ProgressKeys>> = {};
  for (const pagina of passaporte) {
    if (pagina.personagem !== perfil.slug) outrasChaves[pagina.personagem] = buildProgressKeys(data, pagina.personagem);
  }

  // A mesma frase da entrada do atlas: o jogo usa o mesmo conteúdo.
  const { edicao } = data.conjunto;
  const notaDeRevisao =
    edicao !== null && edicao.revisao.tipo === "humana"
      ? `Revisado em ${formatDate({ valor: edicao.revisao.revisadoEm, precisao: "dia" })}.`
      : "Conferência com as fontes assistida por IA. Revisão humana pendente.";

  return (
    <>
      {/* O título fica fora da tela: a cena domina a página, e o cabeçalho da fase está sobre ela. */}
      <h1 className="sr-only">
        Jogo · {content.personagem.nome} · {roomLabel(salaSpec)}
      </h1>
      <GameShell content={content} chaves={buildProgressKeys(data, perfil.slug)} outraPessoa={outraPessoa} passaporte={passaporte} outrasChaves={outrasChaves} />
      <noscript>
        <style>{".jogo-palco{display:none}"}</style>
        <PhasesAsText content={content} />
      </noscript>
      <div className="page space-y-1 py-3 text-sm text-ink-soft" data-rodape-do-jogo>
        <p data-aviso-cenario>
          O cenário é uma representação: não afirma que a pessoa esteve neste lugar nem que os fatos aconteceram nele. Os registros, as fichas e as fontes
          continuam disponíveis no atlas, fora do jogo.
        </p>
        <p data-aviso-marcos>
          São marcos documentados da trajetória, e não a vida inteira nem tudo o que a pessoa fez. O jogo não dá nota, não aponta vencedor e não recomenda voto.
        </p>
        {sala !== "historico" && (
          <p data-aviso-amostra>
            As decisões deste aprofundamento são uma amostra documentada da edição, e não o histórico completo: a regra de escolha de cada parte da amostra está
            na metodologia. Um voto e um ato do Executivo são coisas diferentes: cada registro diz o cargo, a instituição e o objeto.
          </p>
        )}
        <p data-revisao>{notaDeRevisao}</p>
        <p>O que você lê e responde fica guardado neste navegador, quando o armazenamento está disponível. Os carimbos do passaporte reconhecem as fases concluídas: não são nota.</p>
        <p>
          <Link href={gameHref()} prefetch={false} className={PATH_LINK}>
            Escolher a outra trajetória
          </Link>
        </p>
      </div>
    </>
  );
}
