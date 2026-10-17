"use client";

// Entrada do jogo: as duas trajetórias, com o mesmo cartão e o mesmo destaque
// para as duas. Quem nunca jogou começa pela origem; quem já jogou vê onde
// parou, com a fase e o período, e o caminho para rever desde o início, que é
// navegação e não apaga nada. Os aprofundamentos (decisões documentadas de um
// tema) ficam abaixo, identificados pelo assunto e pelos anos: não são o
// começo de nada.
//
// Em cada cartão, o nome e os caminhos vêm antes da prévia do cenário: são o
// que a pessoa veio fazer, e ficam na primeira tela em qualquer largura. As
// três partes do cartão (os caminhos, a prévia, o resto) ocupam as mesmas
// linhas nos dois cartões, para um não ficar desalinhado do outro quando só um
// tem progresso.

import dynamic from "next/dynamic";
import Link from "next/link";

import { Portrait, PortraitCredit } from "@/components/Portrait";
import { PATH_LINK } from "@/components/touch";
import type { Imagem } from "@/lib/domain/types";
import type { ProgressKeys } from "@/lib/game/content";
import { ESCRIVAO_NOME } from "@/lib/game/escrivao";
import { countDone, hasNewStart, hasStarted, isTrailComplete, resumePhase } from "@/lib/game/progress";
import { gameQuery } from "@/lib/game/query";
import { periodLabel, roomOf } from "@/lib/game/rooms";
import type { Epoca, PersonagemSlug, PlayerProgress, RoomId, RoomSummary, SceneId } from "@/lib/game/types";
import { gameHref } from "@/lib/state/links";

import { useGameProgress } from "./hooks";
import { StageBoundary } from "./ui/StageBoundary";

const WorldPreview = dynamic(() => import("./WorldPreview").then((modulo) => ({ default: modulo.WorldPreview })), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-sunken" />,
});

/** O que a entrada precisa saber de uma fase da trajetória. */
export interface TrailPhaseSummary {
  id: string;
  sala: RoomId;
  numero: number;
  titulo: string;
  periodo: { de: number; ate: number };
}

export interface CharacterOption {
  slug: PersonagemSlug;
  nome: string;
  retrato: Imagem | null;
  /** As fases da trajetória, na ordem de percurso. */
  fases: readonly TrailPhaseSummary[];
  /** O cenário e a figura da primeira fase, para a prévia. */
  previa: { cena: SceneId; epoca: Epoca };
  /** Os aprofundamentos com fase publicada. */
  aprofundamentos: readonly RoomSummary[];
  /** Todas as fases do personagem e as assinaturas das atividades, para ler o progresso salvo sem carregar o conteúdo. */
  chaves: ProgressKeys;
}

interface TrailStatus {
  estado: "carregando" | "inicio" | "em-andamento" | "completa";
  /** A fase em que a pessoa continua, quando já começou. */
  continua: TrailPhaseSummary | null;
  situacao: string;
}

/** A situação da trajetória neste navegador: o que a frase diz e de onde se continua. */
function trailStatus(carregado: boolean, progresso: PlayerProgress, fases: readonly TrailPhaseSummary[]): TrailStatus {
  if (!carregado) return { estado: "carregando", continua: null, situacao: "Ainda não aberta neste navegador." };
  if (isTrailComplete(progresso, fases)) return { estado: "completa", continua: null, situacao: `Você concluiu as ${fases.length} fases neste navegador.` };
  if (!hasStarted(progresso, fases)) return { estado: "inicio", continua: null, situacao: "Ainda não aberta neste navegador." };
  const continua = resumePhase(progresso, fases);
  const feitas = countDone(progresso, fases);
  const novasNoComeco = hasNewStart(progresso, fases);
  return {
    estado: "em-andamento",
    continua,
    situacao: `${feitas === 0 ? "Nenhuma fase concluída ainda" : feitas === 1 ? "1 fase concluída" : `${feitas} fases concluídas`} de ${fases.length}.${novasNoComeco ? " O jogo mudou desde a sua última visita: a trajetória agora começa pela origem." : ""}`,
  };
}

const cta = "inline-flex min-h-12 items-center justify-center gap-2 border px-4 text-center text-sm font-medium no-underline";

function CharacterChoice({ opcao }: { opcao: CharacterOption }) {
  const { carregado, progresso } = useGameProgress(opcao.slug, opcao.chaves);
  const { fases } = opcao;
  const primeira = fases[0];
  const ultima = fases.at(-1);
  const { estado, continua, situacao } = trailStatus(carregado, progresso, fases);
  // Os aprofundamentos por assunto e a missão de investigação são salas diferentes, e a entrada os apresenta separados (D-151).
  const temas = opcao.aprofundamentos.filter((sala) => roomOf(sala.id).natureza === "aprofundamento");
  const missoes = opcao.aprofundamentos.filter((sala) => roomOf(sala.id).natureza === "investigacao");
  const inicio = `${gameHref(opcao.slug)}${gameQuery(1)}`;
  const destino = continua === null ? inicio : `${gameHref(opcao.slug)}${gameQuery(continua.numero)}`;

  return (
    <article className="row-span-3 grid grid-rows-subgrid gap-y-0 border border-ink bg-raised" data-escolha={opcao.slug} data-situacao={estado}>
      <div className="flex flex-col gap-3 p-3 md:p-4" data-caminhos>
        <div className="flex items-center gap-3">
          <Portrait nome={opcao.nome} imagem={opcao.retrato} shape="quadrado" sizes="56px" loading="imediata" decorative className="w-14 shrink-0" />
          <div>
            <h3 className="font-serif text-2xl font-medium leading-none tracking-tight">{opcao.nome}</h3>
            <p className="numerals mt-1 text-sm text-ink-soft" data-trilha-resumo>
              {fases.length} {fases.length === 1 ? "fase" : "fases"}
              {primeira !== undefined && ultima !== undefined && ` · ${periodLabel({ de: primeira.periodo.de, ate: ultima.periodo.ate })}`}
            </p>
          </div>
        </div>
        <p className="text-sm text-ink-soft" data-situacao-texto>
          {situacao}
        </p>
        <div className="mt-auto flex flex-col gap-2">
          {estado === "em-andamento" && continua !== null ? (
            <>
              <Link href={destino} prefetch={false} className={`${cta} border-ink bg-ink text-paper hover:bg-ink-soft`} data-continuar={opcao.slug} data-destino={continua.id}>
                <span>
                  Continuar de onde parei: fase {continua.numero}, <span className="numerals">{periodLabel(continua.periodo)}</span>
                </span>
                <span aria-hidden="true">→</span>
              </Link>
              <Link href={inicio} prefetch={false} className={`${cta} border-ink bg-raised hover:bg-paper`} data-ver-desde-o-inicio={opcao.slug}>
                <span>
                  Ver desde o início{primeira !== undefined && <span className="numerals">: {primeira.periodo.de}</span>}
                </span>
              </Link>
            </>
          ) : (
            <Link href={inicio} prefetch={false} className={`${cta} border-ink bg-ink text-paper hover:bg-ink-soft`} data-comecar={opcao.slug}>
              <span>
                {estado === "completa" ? "Rever desde o início" : "Começar do início"}
                {primeira !== undefined && <span className="numerals">: {primeira.periodo.de}</span>}
              </span>
              <span aria-hidden="true">→</span>
            </Link>
          )}
          <Link href={`${gameHref(opcao.slug)}${gameQuery(continua?.numero ?? 1, true)}`} prefetch={false} className="inline-flex min-h-11 items-center justify-center text-sm font-medium underline decoration-line-strong hover:decoration-ink" data-ler-sem-cenario={opcao.slug}>
            Ler sem o cenário
          </Link>
        </div>
      </div>
      <div className="relative aspect-[16/10] overflow-hidden border-y border-ink bg-sunken">
        {/* A prévia é um enfeite: se o pacote dela não chega, fica o fundo, e a escolha continua valendo. */}
        <StageBoundary fallback={<div className="h-full w-full bg-sunken" />}>
          <WorldPreview cena={opcao.previa.cena} epoca={opcao.previa.epoca} personagem={opcao.slug} />
        </StageBoundary>
        <p className="sr-only">Prévia do cenário da primeira fase. É uma representação.</p>
      </div>
      <div className="flex flex-col gap-3 p-3 md:p-4">
        <details className="text-sm" data-fases-da-trilha>
          <summary className="flex min-h-11 cursor-pointer items-center font-medium">Ver as {fases.length} fases</summary>
          <ol className="space-y-1 pb-1">
            {fases.map((fase) => (
              <li key={fase.id} className="flex gap-2">
                <span className="numerals w-5 shrink-0 font-semibold">{fase.numero}</span>
                <span>
                  {fase.titulo}
                  <span className="numerals text-ink-soft"> · {periodLabel(fase.periodo)}</span>
                </span>
              </li>
            ))}
          </ol>
        </details>
        {temas.length > 0 && (
          <section aria-label={`Aprofundamentos de ${opcao.nome}`} className="space-y-1 border-t border-line pt-3 text-sm" data-aprofundamentos={opcao.slug}>
            <h4 className="eyebrow text-ink-soft">Aprofundamento por assunto</h4>
            <p className="text-xs text-ink-soft">Para depois da trajetória. Não é o começo da vida de ninguém.</p>
            <ul>
              {temas.map((sala) => (
                <li key={sala.id}>
                  <Link href={gameHref(opcao.slug, sala.id)} prefetch={false} className="inline-flex min-h-11 items-center font-medium underline decoration-line-strong hover:decoration-ink" data-abrir-sala={`${opcao.slug}:${sala.id}`}>
                    {roomOf(sala.id).nome}
                  </Link>
                  <span className="numerals text-ink-soft"> · {periodLabel(sala.periodo)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
        {missoes.length > 0 && (
          <section aria-label={`Missões de investigação de ${opcao.nome}`} className="space-y-1 border-t border-line pt-3 text-sm" data-missoes={opcao.slug}>
            <h4 className="eyebrow text-ink-soft">Missão de investigação</h4>
            <p className="text-xs text-ink-soft">Documentos do atlas na mão: monte um dossiê e relacione cada ficha ao documento que a sustenta. De 5 a 10 minutos, estimativa não medida.</p>
            <ul>
              {missoes.map((sala) => (
                <li key={sala.id}>
                  <Link href={gameHref(opcao.slug, sala.id)} prefetch={false} className="inline-flex min-h-11 items-center font-medium underline decoration-line-strong hover:decoration-ink" data-abrir-sala={`${opcao.slug}:${sala.id}`}>
                    {roomOf(sala.id).nome}
                  </Link>
                  <span className="numerals text-ink-soft"> · documentos de {periodLabel(sala.periodo)}</span>
                </li>
              ))}
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
  return (
    <div className="page space-y-8 py-7 md:space-y-10 md:py-12">
      <header className="max-w-3xl space-y-4">
        <p className="eyebrow text-ink-soft">Jogo</p>
        <h1 className="font-serif text-[2.75rem] font-medium leading-[0.95] tracking-[-0.02em] md:text-6xl">Conheça as duas trajetórias</h1>
        <p className="reading max-w-[34rem] text-xl leading-snug" data-proposta>
          Escolha uma pessoa e siga a vida dela em fases curtas: um marco, uma explicação e uma pergunta por fase. Tudo vem do atlas, com as fontes.
        </p>
        <p className="max-w-[34rem] text-sm" data-revisao>
          {notaDeRevisao}{" "}
          <Link href="/metodologia" prefetch={false} className={PATH_LINK}>
            Metodologia e fontes
          </Link>
        </p>
      </header>

      <section aria-labelledby="escolha-trajetoria" className="space-y-3">
        <h2 id="escolha-trajetoria" className="eyebrow text-ink-soft">
          Escolha uma trajetória
        </h2>
        {/* Cada cartão ocupa três linhas da grade, as mesmas para os dois: os caminhos, a prévia e o resto. */}
        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          {opcoes.map((opcao) => (
            <CharacterChoice key={opcao.slug} opcao={opcao} />
          ))}
        </div>
        {/* O crédito de cada retrato, como em qualquer tela do atlas que o mostra. */}
        <div className="grid gap-x-4 gap-y-1 md:grid-cols-2 md:gap-x-6">
          {opcoes.map((opcao) => (opcao.retrato === null ? <span key={opcao.slug} /> : <PortraitCredit key={opcao.slug} imagem={opcao.retrato} detail />))}
        </div>
      </section>

      <section aria-labelledby="como-funciona" className="max-w-3xl space-y-2 text-sm">
        <h2 id="como-funciona" className="eyebrow text-ink-soft">
          Como funciona
        </h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Toque na pasta em destaque no cenário, ou no botão Abrir o marco.</li>
          <li>Leia a explicação curta. As fontes e os termos explicados abrem no próprio texto.</li>
          <li>Responda a pergunta, ou peça a explicação, e siga para a fase seguinte. Errar não tira nada.</li>
          <li data-passo-do-passaporte>Cada fase concluída deixa um carimbo no Passaporte do {ESCRIVAO_NOME}. Ele registra o caminho percorrido: não é nota.</li>
        </ol>
        <p className="text-ink-soft" data-avisos-do-jogo>
          São marcos documentados de cada trajetória, e não a vida inteira. O jogo não dá nota, não aponta vencedor e não recomenda voto. Os cenários e os
          bonecos são desenhos feitos para o projeto: não afirmam que a pessoa esteve nesses lugares nem a aparência dela em cada data. O {ESCRIVAO_NOME}, que
          guia o jogo, é um personagem fictício, e o humor dele pode ser desligado. O que você lê e responde fica guardado só neste navegador.
        </p>
      </section>
    </div>
  );
}
