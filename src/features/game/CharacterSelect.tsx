"use client";

// Entrada do jogo: a escolha entre os dois personagens, com o mesmo cartão
// para os dois, a prévia do mundo do primeiro capítulo, a trajetória em
// capítulos (a sala Histórico) e as salas temáticas de cada um, com a
// situação de cada sala neste navegador.

import dynamic from "next/dynamic";
import Link from "next/link";

import { Portrait, PortraitCredit } from "@/components/Portrait";
import type { Imagem } from "@/lib/domain/types";
import { ESCRIVAO_NOME } from "@/lib/game/escrivao";
import { countCompleted, currentChapter, hasStarted, isTrajectoryComplete } from "@/lib/game/progress";
import { chaptersInRoom, roomsWithChapters, type RoomSpec } from "@/lib/game/rooms";
import type { ChapterSpec, PersonagemSlug, PlayerProgress } from "@/lib/game/types";
import { gameHref } from "@/lib/state/links";

import { useGameProgress } from "./hooks";
import { StageBoundary } from "./ui/StageBoundary";

const WorldPreview = dynamic(() => import("./WorldPreview").then((modulo) => ({ default: modulo.WorldPreview })), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-sunken" />,
});

export interface CharacterOption {
  slug: PersonagemSlug;
  nome: string;
  retrato: Imagem | null;
  /** Todos os capítulos jogáveis do personagem, de todas as salas. */
  capitulos: readonly ChapterSpec[];
}

/** A situação de uma sala neste navegador: o que a chamada e a frase dizem. */
function roomStatus(carregado: boolean, progresso: PlayerProgress, capitulos: readonly ChapterSpec[]): { chamada: string; situacao: string; estado: "carregando" | "inicio" | "em-andamento" | "completa" } {
  if (!carregado) return { chamada: "Começar", situacao: "Ainda não jogado neste navegador.", estado: "carregando" };
  if (isTrajectoryComplete(progresso, capitulos)) {
    return { chamada: "Rever", situacao: `${capitulos.length === 1 ? "O capítulo foi concluído" : `Os ${capitulos.length} capítulos foram concluídos`} neste navegador.`, estado: "completa" };
  }
  const atual = currentChapter(progresso, capitulos);
  if (hasStarted(progresso, capitulos) && atual !== null) return { chamada: "Continuar", situacao: `Parou no capítulo ${atual.numero}: ${atual.titulo}.`, estado: "em-andamento" };
  return { chamada: "Começar", situacao: "Ainda não jogado neste navegador.", estado: "inicio" };
}

function CharacterChoice({ opcao }: { opcao: CharacterOption }) {
  const { carregado, progresso } = useGameProgress(opcao.slug, opcao.capitulos);
  const salas = roomsWithChapters(opcao.capitulos);
  const historico = chaptersInRoom(opcao.capitulos, "historico");
  const tematicas: RoomSpec[] = salas.filter((sala) => sala.id !== "historico");
  const feitos = countCompleted(progresso, historico);
  const primeiro = historico[0] ?? opcao.capitulos[0];
  const ultimo = historico.at(-1);
  const { chamada, situacao, estado } = roomStatus(carregado, progresso, historico);

  return (
    <article className="flex flex-col border border-ink bg-raised" data-escolha={opcao.slug} data-situacao={estado}>
      <div className="relative aspect-[16/10] overflow-hidden border-b border-ink bg-sunken">
        {/* A prévia é um enfeite: se o pacote dela não chega, fica o fundo, e a escolha continua valendo. */}
        {primeiro !== undefined && (
          <StageBoundary fallback={<div className="h-full w-full bg-sunken" />}>
            <WorldPreview capitulo={primeiro} personagem={opcao.slug} />
          </StageBoundary>
        )}
        <p className="sr-only">Prévia do cenário do primeiro capítulo: {primeiro?.titulo}.</p>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-3 md:p-4">
        <div className="flex items-center gap-3">
          <Portrait nome={opcao.nome} imagem={opcao.retrato} shape="quadrado" sizes="56px" loading="imediata" decorative className="w-14 shrink-0" />
          <div>
            <h3 className="font-serif text-2xl font-medium leading-none tracking-tight">{opcao.nome}</h3>
            <p className="numerals mt-1 text-sm text-ink-soft">
              {historico.length} {historico.length === 1 ? "capítulo" : "capítulos"}
              {primeiro !== undefined && ultimo !== undefined && ` · ${primeiro.periodo.de}–${ultimo.periodo.ate}`}
              {tematicas.length > 0 && ` · ${tematicas.length} ${tematicas.length === 1 ? "sala temática" : "salas temáticas"}`}
            </p>
          </div>
        </div>
        <ol className="space-y-1 text-sm" aria-label={`Capítulos da trajetória de ${opcao.nome}`}>
          {historico.map((capitulo) => (
            <li key={capitulo.id} className="flex gap-2">
              <span className="numerals w-5 shrink-0 font-semibold">{capitulo.numero}</span>
              <span>
                {capitulo.titulo}
                <span className="numerals text-ink-soft">
                  {" "}
                  · {capitulo.periodo.de}–{capitulo.periodo.ate}
                </span>
              </span>
            </li>
          ))}
        </ol>
        <p className="text-sm text-ink-soft" data-situacao-texto>
          {situacao}
          {estado === "em-andamento" && feitos > 0 && ` ${feitos} ${feitos === 1 ? "capítulo concluído" : "capítulos concluídos"}.`}
        </p>
        <Link
          href={gameHref(opcao.slug)}
          prefetch={false}
          className="mt-auto inline-flex min-h-12 items-center justify-center border border-ink bg-ink px-4 text-sm font-medium text-paper no-underline hover:bg-ink-soft"
          data-jogar={opcao.slug}
        >
          {chamada} com {opcao.nome}
          <span aria-hidden="true"> →</span>
        </Link>
        {tematicas.length > 0 && (
          <section aria-label={`Salas temáticas de ${opcao.nome}`} className="space-y-2 border-t border-line pt-3">
            <h4 className="eyebrow text-ink-soft">Salas temáticas</h4>
            <ul className="space-y-2 text-sm">
              {tematicas.map((sala) => {
                const daSala = chaptersInRoom(opcao.capitulos, sala.id);
                const decisoes = daSala.reduce((soma, capitulo) => soma + (capitulo.decisaoIds?.length ?? 0), 0);
                const status = roomStatus(carregado, progresso, daSala);
                return (
                  <li key={sala.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1" data-sala-item={sala.id} data-situacao={status.estado}>
                    <span className="min-w-0 flex-1">
                      <span className="font-medium">{sala.nome}</span>
                      <span className="numerals text-ink-soft"> · {decisoes} {decisoes === 1 ? "decisão documentada" : "decisões documentadas"}</span>
                      <span className="block text-xs text-ink-soft" data-situacao-da-sala>
                        {status.situacao}
                      </span>
                    </span>
                    <Link
                      href={gameHref(opcao.slug, sala.id)}
                      prefetch={false}
                      className="inline-flex min-h-11 items-center justify-center border border-ink bg-raised px-3 text-sm font-medium no-underline hover:bg-paper"
                      data-jogar-sala={`${opcao.slug}:${sala.id}`}
                    >
                      {status.chamada}
                      <span aria-hidden="true"> →</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </article>
  );
}

interface CharacterSelectProps {
  opcoes: readonly CharacterOption[];
  /** A situação da revisão da edição, na mesma frase da entrada do atlas. */
  notaDeRevisao: string;
}

export function CharacterSelect({ opcoes, notaDeRevisao }: CharacterSelectProps) {
  const temSalaTematica = opcoes.some((opcao) => roomsWithChapters(opcao.capitulos).some((sala) => sala.id !== "historico"));
  return (
    <div className="page space-y-8 py-7 md:space-y-10 md:py-12">
      <header className="max-w-3xl space-y-4">
        <p className="eyebrow text-ink-soft">Jogo</p>
        <h1 className="font-serif text-[2.75rem] font-medium leading-[0.95] tracking-[-0.02em] md:text-6xl">
          Percorra a trajetória em capítulos
        </h1>
        <p className="reading max-w-[34rem] text-xl leading-snug">
          Escolha uma pessoa, controle o personagem pelo cenário de cada período e, em cada capítulo, recolha todos os
          registros e cumpra a tarefa para abrir a passagem ao seguinte.
          {temSalaTematica && " Nas salas temáticas, os registros são decisões documentadas: votos e atos, com cargo, instituição, data e fontes."}
        </p>
        <p className="max-w-[34rem] text-sm text-ink-soft">
          Cada registro é um acontecimento ou uma decisão publicada no atlas, com a data na precisão documentada e as fontes. Os
          cenários são representações de cada período: não afirmam que a pessoa esteve nesses lugares nem que os fatos
          aconteceram neles. O guia do jogo, o {ESCRIVAO_NOME}, é um personagem fictício; as falas de humor dele são ficção sobre
          papelada e sobre ele mesmo, iguais para os dois personagens, e podem ser desligadas. Nada aqui avalia as pessoas
          retratadas, e tudo o que o jogo mostra está no atlas sem precisar jogar.
        </p>
        <p className="max-w-[34rem] text-sm" data-revisao>
          {notaDeRevisao}{" "}
          <Link href="/metodologia" prefetch={false} className="font-medium underline decoration-line-strong hover:decoration-ink">
            Metodologia e fontes
          </Link>
        </p>
      </header>

      <section aria-labelledby="escolha-personagem" className="space-y-3">
        <h2 id="escolha-personagem" className="eyebrow text-ink-soft">
          Escolha um personagem
        </h2>
        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          {opcoes.map((opcao) => (
            <CharacterChoice key={opcao.slug} opcao={opcao} />
          ))}
        </div>
        {/* O crédito de cada retrato, como em qualquer tela do atlas que o mostra. */}
        <div className="grid gap-x-4 gap-y-1 md:grid-cols-2 md:gap-x-6">
          {opcoes.map((opcao) => (opcao.retrato === null ? <span key={opcao.slug} /> : <PortraitCredit key={opcao.slug} imagem={opcao.retrato} detail />))}
        </div>
        <p className="text-xs text-ink-faint">
          Os personagens e os cenários do jogo são desenhos feitos para o projeto; não são fotografias nem registros de lugares.
          Cada personagem tem três figuras, uma por época dos capítulos: cabelo, barba e roupa mudam de forma estilizada, com a
          mesma escala para os dois, sem afirmar a aparência real da pessoa em cada data.
        </p>
      </section>

      <section aria-labelledby="como-jogar" className="max-w-3xl space-y-2 text-sm">
        <h2 id="como-jogar" className="eyebrow text-ink-soft">
          Como jogar
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>No computador: setas ou W, A, S e D para andar; E, Enter ou espaço para interagir com o que está ao alcance.</li>
          <li>No celular: o direcional na tela e o botão de ação.</li>
          <li>
            As tarefas: encontrar um registro, pôr dois em ordem pelas datas, indicar o documento que sustenta um registro ou o
            lugar em que o atlas o documenta e, nas decisões, conferir a evidência e interpretar o que o registro documenta.
            Errar explica e deixa tentar de novo, sem penalidade.
          </li>
          <li>A saída de cada capítulo abre com todos os registros recolhidos e a tarefa cumprida.</li>
          <li>O painel Capítulos e tarefas faz tudo por botões, sem o cenário, mostra o que está pendente e liga ou desliga o humor do {ESCRIVAO_NOME}.</li>
          <li>O progresso fica guardado neste navegador, separado por personagem e por sala. Dá para continuar de onde parou ou reiniciar.</li>
        </ul>
      </section>
    </div>
  );
}
