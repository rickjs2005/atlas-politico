"use client";

// Entrada do jogo: a escolha entre os dois personagens, com o mesmo cartão
// para os dois, a prévia do mundo do primeiro capítulo e, para quem já jogou,
// o capítulo em que parou.

import dynamic from "next/dynamic";
import Link from "next/link";

import { Portrait, PortraitCredit } from "@/components/Portrait";
import type { Imagem } from "@/lib/domain/types";
import { countCompleted, currentChapter, isTrajectoryComplete, taskStateOf } from "@/lib/game/progress";
import type { ChapterSpec, PersonagemSlug } from "@/lib/game/types";
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
  capitulos: readonly ChapterSpec[];
}

function CharacterChoice({ opcao }: { opcao: CharacterOption }) {
  const { carregado, progresso } = useGameProgress(opcao.slug, opcao.capitulos);
  const feitos = countCompleted(progresso, opcao.capitulos);
  const completa = isTrajectoryComplete(progresso, opcao.capitulos);
  const atual = currentChapter(progresso, opcao.capitulos);
  const primeiro = opcao.capitulos[0];
  const ultimo = opcao.capitulos.at(-1);
  // Começou quem concluiu um capítulo ou já recolheu ou respondeu algo no primeiro.
  const comecou =
    feitos > 0 ||
    opcao.capitulos.some((capitulo) => {
      const tarefa = taskStateOf(progresso, capitulo.id);
      return tarefa.recolhidos.length > 0 || tarefa.tentativas > 0;
    });

  let chamada = "Começar";
  let situacao = "Ainda não jogado neste navegador.";
  if (carregado && completa) {
    chamada = "Rever";
    situacao = `Os ${opcao.capitulos.length} capítulos foram concluídos neste navegador.`;
  } else if (carregado && comecou && atual !== null) {
    chamada = "Continuar";
    situacao = `Parou no capítulo ${atual.numero}: ${atual.titulo}.`;
  }

  return (
    <article className="flex flex-col border border-ink bg-raised" data-escolha={opcao.slug} data-situacao={carregado ? (completa ? "completa" : comecou ? "em-andamento" : "inicio") : "carregando"}>
      <div className="relative aspect-[16/10] overflow-hidden border-b border-ink bg-sunken">
        {/* A prévia é um enfeite: se o pacote dela não chega, fica o fundo, e a escolha continua valendo. */}
        {primeiro !== undefined && (
          <StageBoundary fallback={<div className="h-full w-full bg-sunken" />}>
            <WorldPreview capitulo={primeiro} personagem={opcao.slug} />
          </StageBoundary>
        )}
        <p className="sr-only">
          Prévia do cenário do primeiro capítulo: {primeiro?.titulo}.
        </p>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-3 md:p-4">
        <div className="flex items-center gap-3">
          <Portrait nome={opcao.nome} imagem={opcao.retrato} shape="quadrado" sizes="56px" loading="imediata" decorative className="w-14 shrink-0" />
          <div>
            <h3 className="font-serif text-2xl font-medium leading-none tracking-tight">{opcao.nome}</h3>
            <p className="numerals mt-1 text-sm text-ink-soft">
              {opcao.capitulos.length} {opcao.capitulos.length === 1 ? "capítulo" : "capítulos"}
              {primeiro !== undefined && ultimo !== undefined && ` · ${primeiro.periodo.de}–${ultimo.periodo.ate}`}
            </p>
          </div>
        </div>
        <ol className="space-y-1 text-sm">
          {opcao.capitulos.map((capitulo) => (
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
        </p>
        <p className="max-w-[34rem] text-sm text-ink-soft">
          Cada registro é um acontecimento publicado no atlas, com a data na precisão documentada e as fontes. Os
          cenários são representações de cada período: não afirmam que a pessoa esteve nesses lugares nem que os fatos
          aconteceram neles. O guia do jogo, o Arquivista, é um personagem fictício. Nada aqui avalia as pessoas
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
            lugar em que o atlas o documenta. Errar explica e deixa tentar de novo, sem penalidade.
          </li>
          <li>A saída de cada capítulo abre com todos os registros recolhidos e a tarefa cumprida.</li>
          <li>O painel Capítulos e tarefas faz tudo por botões, sem o cenário, e mostra o que está pendente.</li>
          <li>O progresso fica guardado neste navegador, separado por personagem. Dá para continuar de onde parou ou reiniciar.</li>
        </ul>
      </section>
    </div>
  );
}
