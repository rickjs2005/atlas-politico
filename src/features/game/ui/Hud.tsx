"use client";

// O que fica sobre a cena: onde a pessoa está (sala, fase X de Y, período e
// título), a instrução de agora em uma frase, os caminhos (ler sem o cenário,
// a lista de fases, como funciona) e, na base, o botão principal: abrir o
// marco, ou continuar quando a fase já foi concluída. Tudo em DOM, e o
// cabeçalho da fase já vem no HTML do build.
//
// Nada do guia cobre o caminho do boneco nem o botão principal: a instrução é
// uma linha dentro do cartão da fase (D-133).
//
// O progresso fica à vista no mesmo cartão, em uma faixa só (D-150): o que foi
// concluído, o que falta, um marcador por fase e o botão do passaporte. A
// posição ("Fase 4 de 9") e a contagem ("Concluídas: 2 de 9") são linhas
// diferentes: estar em uma fase não é tê-la concluído.
//
// Quem chega sem pedir fase cai onde tinha parado: o cartão diz isso e
// oferece o começo, com o ano (ResumeNotice).
//
// Em tela estreita, os três caminhos viram uma linha acima do cartão, e o
// cartão vai de um lado ao outro: a cena fica inteira no espaço entre ele e o
// botão principal (a casca mede os dois blocos, `data-hud-topo` e
// `data-hud-base`, e o palco enquadra a cena no que sobra). Em tela baixa, a
// fala de humor sai do cartão: é enfeite, e o espaço é da cena.

import Link from "next/link";

import { PATH_LINK } from "@/components/touch";
import { falasVisiveis, type FalaDita } from "@/lib/game/escrivao";
import type { StampCount, TrailMarker } from "@/lib/game/passport";
import { periodLabel, roomLabel, type RoomSpec } from "@/lib/game/rooms";
import type { PhaseSpec } from "@/lib/game/types";
import { gameHref } from "@/lib/state/links";

import { useGamePreferences } from "../hooks";

import { primaryButton, secondaryButton } from "./Dialog";
import { PassportStrip } from "./Passport";

/** O que a tela diz a quem caiu onde tinha parado, sem ter escolhido a fase. */
export interface ResumeInfo {
  /** O ano em que a trajetória começa. */
  ano: number;
  /** O salvo é de um formato anterior, e a trajetória ganhou fases no começo. */
  mudou: boolean;
}

/** O aviso de retomada, com o caminho para a primeira fase. Rever o começo é navegação: não apaga nada. */
export function ResumeNotice({ retomada, className, onGoToStart }: { retomada: ResumeInfo; className: string; onGoToStart(): void }) {
  return (
    <p className={className} data-aviso-retomada={retomada.mudou ? "mudou" : "retomada"}>
      {retomada.mudou ? "O jogo mudou desde a sua última visita: a trajetória agora começa pela origem." : "Você continua de onde parou."}{" "}
      <button type="button" className="inline-flex min-h-11 items-center font-medium underline decoration-line-strong hover:decoration-ink" onClick={onGoToStart} data-ver-desde-o-inicio>
        <span>
          Ver desde o início: <span className="numerals">{retomada.ano}</span>
        </span>
      </button>
    </p>
  );
}

interface HudProps {
  fase: PhaseSpec;
  /** Quantas fases a sala tem. */
  total: number;
  sala: RoomSpec;
  /** O título do marco, como o registro o escreve. */
  marco: string;
  /** A fase já foi concluída: o botão principal passa a ser o de continuar. */
  concluida: boolean;
  /** A fase seguinte, ou `null` na última. */
  proxima: PhaseSpec | null;
  /** O que o Escrivão diz ao abrir a fase: a instrução e, quando ligado, o humor. */
  falas: readonly FalaDita[];
  /** A pessoa caiu nesta fase pela retomada, sem tê-la escolhido: o cartão diz isso e oferece o começo. */
  retomada: ResumeInfo | null;
  /** O progresso da sala aberta, para a faixa do passaporte: os marcadores, a contagem e se o salvo já foi lido. */
  passaporte: { marcadores: readonly TrailMarker[]; contagem: StampCount; carregado: boolean };
  onGoToStart(): void;
  /** A cena está pronta para o toque: antes disso, o botão principal abre a explicação direto. */
  onOpenMarker(): void;
  onContinue(): void;
  onOpenPhases(): void;
  onOpenHelp(): void;
  onReadWithoutScene(): void;
  onOpenPassport(): void;
}

export function Hud({ fase, total, sala, marco, concluida, proxima, falas, retomada, passaporte, onGoToStart, onOpenMarker, onContinue, onOpenPhases, onOpenHelp, onReadWithoutScene, onOpenPassport }: HudProps) {
  const { preferencias } = useGamePreferences();
  const visiveis = falasVisiveis(falas, preferencias.humor);
  const instrucao = visiveis.find((fala) => fala.camada === "instrucao");
  const humor = visiveis.find((fala) => fala.camada === "humor");
  // A linha do próximo passo: a do Escrivão ao abrir a fase; depois de concluída, o que vem em seguida.
  const proximoPasso = concluida
    ? proxima === null
      ? "Fase concluída. Esta é a última: use o botão para ver o resumo."
      : `Fase concluída. Use o botão para seguir à fase ${proxima.numero}.`
    : (instrucao?.texto ?? "Toque na pasta em destaque, ou no botão Abrir o marco, para ler a explicação desta fase.");
  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col-reverse gap-2 p-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between md:p-4" data-hud-topo>
        <div className={`pointer-events-auto space-y-1 border bg-paper/95 px-3 py-2 sm:max-w-[min(100%,26rem)] janela-baixa:space-y-0 janela-baixa:py-1.5 ${concluida ? "border-ink border-l-4 border-l-accent" : "border-ink/20"}`} data-fase-cartao={concluida ? "concluida" : "aberta"}>
          <p className="eyebrow text-ink-soft" data-fase-posicao>
            {roomLabel(sala)} · Fase {fase.numero} de {total} · <span className="numerals">{periodLabel(fase.periodo)}</span>
          </p>
          <p className="font-serif text-lg font-medium leading-tight janela-baixa:text-base" data-fase-titulo>
            {fase.titulo}
          </p>
          <p className="text-sm janela-baixa:text-xs" role="status" data-proximo-passo>
            {proximoPasso}
          </p>
          {/* O aviso de retomada ocupa o lugar do humor: o cartão não cresce a ponto de cobrir a cena. */}
          {retomada !== null && <ResumeNotice retomada={retomada} className="text-xs janela-baixa:hidden" onGoToStart={onGoToStart} />}
          {!concluida && retomada === null && humor !== undefined && (
            <p className="text-xs italic text-ink-soft janela-curta:hidden" data-fala={humor.id} data-camada="humor">
              <span className="sr-only">Humor do Escrivão, ficção: </span>
              {humor.texto}
            </p>
          )}
          {sala.natureza === "aprofundamento" && (
            <p className="text-xs janela-baixa:hidden" data-aviso-aprofundamento>
              {/* Em tela estreita a instrução acima já diz que é um aprofundamento: aqui fica só o caminho, com a área de toque inteira. */}
              <span className="max-sm:sr-only">Aprofundamento sobre um assunto, e não o começo da trajetória. </span>
              <Link href={`${gameHref(fase.personagem)}?fase=1`} prefetch={false} className={PATH_LINK} data-ir-para-o-inicio>
                Ir para o início da vida
              </Link>
            </p>
          )}
          <PassportStrip {...passaporte} onOpen={onOpenPassport} className="mt-1.5" />
        </div>
        <div className="pointer-events-auto flex flex-wrap justify-end gap-2 max-sm:justify-stretch" data-caminhos-do-jogo>
          <button type="button" className={`${secondaryButton} max-sm:flex-auto max-sm:px-2.5 max-sm:text-[0.8125rem]`} onClick={onReadWithoutScene} data-ler-sem-cenario>
            Ler sem o cenário
          </button>
          <button type="button" className={`${secondaryButton} max-sm:flex-auto max-sm:px-2.5 max-sm:text-[0.8125rem]`} onClick={onOpenPhases} data-abrir-fases>
            Fases
          </button>
          <button type="button" className={`${secondaryButton} max-sm:flex-auto max-sm:px-2.5 max-sm:text-[0.8125rem] janela-baixa:hidden`} onClick={onOpenHelp} data-abrir-ajuda>
            Como funciona
          </button>
        </div>
      </div>

      {/* O anel claro separa o botão escuro do fundo nos cenários escuros. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-wrap items-end justify-center gap-2 p-3 md:p-4 [&>button]:ring-1 [&>button]:ring-paper/70" data-hud-base>
        {concluida ? (
          <>
            <button type="button" className={`${secondaryButton} pointer-events-auto`} onClick={onOpenMarker} data-abrir-marco>
              Reabrir o marco
            </button>
            <button type="button" className={`${primaryButton} pointer-events-auto min-h-12 gap-1.5 px-5 text-base`} onClick={onContinue} data-continuar={proxima?.id ?? "resumo"}>
              {proxima === null ? "Ver o resumo" : `Continuar: fase ${proxima.numero}`}
              {proxima !== null && <span className="sr-only">, {proxima.titulo}</span>}
              <span aria-hidden="true">→</span>
            </button>
          </>
        ) : (
          <button type="button" className={`${primaryButton} pointer-events-auto min-h-12 px-5 text-base`} onClick={onOpenMarker} data-abrir-marco aria-label={`Abrir o marco: ${marco}`}>
            Abrir o marco
          </button>
        )}
      </div>
    </>
  );
}
