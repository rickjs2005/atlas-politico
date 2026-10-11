// A página do jogo de um personagem em uma sala: a casca com a cena e, abaixo,
// os avisos editoriais. Serve à rota da sala Histórico (/jogo/<personagem>/) e
// às rotas das salas temáticas (/jogo/<personagem>/<sala>/). Componente de
// servidor: o conteúdo vem dos dados gerados no build.

import Link from "next/link";

import { GameShell } from "@/features/game/GameShell";
import { getAtlasData } from "@/lib/content/published";
import { formatDate } from "@/lib/domain/dates";
import type { ProfileSlug } from "@/lib/domain/profiles";
import { buildGameContent, playableChapters } from "@/lib/game/content";
import { chaptersInRoom, roomOf } from "@/lib/game/rooms";
import type { RoomId } from "@/lib/game/types";
import { gameHref } from "@/lib/state/links";

export function GamePage({ perfil, sala }: { perfil: { slug: ProfileSlug; nome: string }; sala: RoomId }) {
  const data = getAtlasData();
  const content = buildGameContent(data, perfil.slug);
  const salaSpec = roomOf(sala);
  const daSala = content === null ? [] : chaptersInRoom(playableChapters(content), sala);
  if (content === null || daSala.length === 0) {
    return (
      <div className="page space-y-4 py-12">
        <h1 className="font-serif text-5xl font-medium tracking-tight">
          Jogo · {perfil.nome}
          {sala !== "historico" && ` · Sala ${salaSpec.nome}`}
        </h1>
        <p className="max-w-2xl text-ink-soft">
          {sala === "historico"
            ? "Os capítulos deste personagem dependem de acontecimentos publicados que ainda não estão na edição."
            : "Esta sala depende de decisões publicadas que ainda não estão na edição."}
        </p>
        <Link href={gameHref()} prefetch={false} className="font-medium underline decoration-line-strong hover:decoration-ink">
          Voltar à escolha de personagem
        </Link>
      </div>
    );
  }

  // A mesma frase da entrada do atlas: o jogo usa o mesmo conteúdo.
  const { edicao } = data.conjunto;
  const notaDeRevisao =
    edicao !== null && edicao.revisao.tipo === "humana"
      ? `Revisado em ${formatDate({ valor: edicao.revisao.revisadoEm, precisao: "dia" })}.`
      : "Conferência com as fontes assistida por IA. Revisão humana pendente.";

  return (
    <>
      {/* O título fica fora da tela: a cena domina a página, e o cabeçalho do jogo está no HUD. */}
      <h1 className="sr-only">
        Jogo · {content.personagem.nome}
        {sala !== "historico" && ` · Sala ${salaSpec.nome}`}
      </h1>
      <GameShell content={content} sala={sala} />
      <div className="page space-y-1 py-3 text-sm text-ink-soft" data-rodape-do-jogo>
        <p data-aviso-cenario>
          O cenário é uma representação: não afirma que a pessoa esteve neste lugar nem que os fatos aconteceram nele. Os
          registros, as fichas e as fontes continuam disponíveis no atlas, fora do jogo.
        </p>
        {sala !== "historico" && (
          <p data-aviso-amostra>
            As decisões desta sala são uma amostra documentada da edição, escolhida por abrangência, efeito institucional e qualidade
            da evidência, e não o histórico completo. Um voto e um ato do Executivo são coisas diferentes: cada cartão diz o cargo, a
            instituição e o objeto.
          </p>
        )}
        <p data-revisao>{notaDeRevisao}</p>
        <p>
          <Link href={gameHref()} prefetch={false} className="font-medium underline decoration-line-strong hover:decoration-ink">
            Escolher outro personagem
          </Link>
          <span aria-hidden="true"> · </span>
          O progresso fica guardado neste navegador, quando o armazenamento está disponível.
        </p>
      </div>
    </>
  );
}
