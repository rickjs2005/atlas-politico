"use client";

// Os diálogos do jogo: o registro recolhido, a tarefa de ordem, o guia, a
// saída fechada, a confirmação de reinício, a transição de capítulo e o fim
// desta etapa. Todos pausam o movimento enquanto estão abertos.

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import type { OrderAttempt } from "@/lib/game/mission";
import { getScene } from "@/lib/game/scenes";
import type { ChapterSpec, GameRecord, TaskSpec } from "@/lib/game/types";
import { comparisonHref, explorationHref, gameHref } from "@/lib/state/links";

import { Dialog, primaryButton, quietButton, secondaryButton } from "./Dialog";
import { RecordCard } from "./RecordCard";
import { EXIT_RULE, collectedSentence, exitOpen, exitSentence, missingLabel, type ExitState } from "./saida";

// ---------------------------------------------------------------------------

export function RecordDialog({
  registro,
  personagem,
  ordemPendente,
  concluiu,
  saida,
  releitura,
  onOpenRecordPage,
  onClose,
}: {
  registro: GameRecord;
  personagem: string;
  /** Os dois registros da tarefa de ordem já estão recolhidos. */
  ordemPendente: boolean;
  /** Este era o registro que a tarefa pedia. */
  concluiu: boolean;
  /** Como ficou a saída depois deste registro: aberta, ou o que falta. */
  saida: ExitState;
  /** Aberto pelo painel, para ler de novo um registro já recolhido: nada mudou agora. */
  releitura: boolean;
  /** A pessoa seguiu para a ficha completa, fora do jogo. */
  onOpenRecordPage: () => void;
  onClose: () => void;
}) {
  const aberta = exitOpen(saida);
  return (
    <Dialog
      nome="registro"
      eyebrow={releitura ? "Registro já recolhido" : "Registro recolhido"}
      titulo="O que o atlas registra"
      onClose={onClose}
      acoes={
        <button type="button" className={primaryButton} onClick={onClose} data-foco-inicial>
          {releitura ? "Voltar ao painel" : ordemPendente ? "Guardar e ordenar os registros" : "Guardar e continuar"}
        </button>
      }
    >
      {/* O que este registro mudou, em um aviso só: a tarefa, se era ele o pedido, e a saída, com o que ainda a segura. */}
      {!releitura && (
        <div
          role="status"
          className={`mb-4 space-y-1 border px-3 py-2 text-sm ${concluiu || aberta ? "border-ink bg-notice" : "border-line bg-paper"}`}
          data-aviso-do-registro
        >
          {concluiu && (
            <p className="font-medium" data-tarefa-concluida>
              Tarefa concluída: este era o registro pedido.
            </p>
          )}
          {ordemPendente && <p data-ordem-pronta>Os dois registros da tarefa estão com você. Falta colocá-los em ordem.</p>}
          <p
            className={aberta ? "font-medium" : concluiu ? "" : "text-ink-soft"}
            data-saida-situacao={aberta ? "aberta" : "fechada"}
            data-registros={`${saida.total - saida.faltam}/${saida.total}`}
          >
            {collectedSentence(saida)} {exitSentence(saida)}
          </p>
        </div>
      )}
      <RecordCard registro={registro} personagem={personagem} detalhe="completo" onOpenRecordPage={onOpenRecordPage} />
    </Dialog>
  );
}

// ---------------------------------------------------------------------------

export function OrderDialog({
  tarefa,
  registros,
  personagem,
  tentativas,
  saida,
  onSubmit,
  onClose,
}: {
  tarefa: Extract<TaskSpec, { tipo: "ordem" }>;
  registros: Record<string, GameRecord>;
  personagem: string;
  tentativas: number;
  /** Como está a saída: com a ordem certa, abre se não faltar registro. */
  saida: ExitState;
  /** Responde a ordem. Devolve a avaliação, já aplicada ao progresso. */
  onSubmit(resposta: readonly [string, string]): OrderAttempt;
  onClose: () => void;
}) {
  const [primeiro, setPrimeiro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<OrderAttempt | null>(null);
  const [a, b] = tarefa.eventIds;
  const ra = registros[a];
  const rb = registros[b];
  if (ra === undefined || rb === undefined) return null;
  const segundo = primeiro === null ? null : primeiro === a ? b : a;

  const confirmar = () => {
    if (primeiro === null || segundo === null) return;
    setResultado(onSubmit([primeiro, segundo]));
  };
  const tentarDeNovo = () => {
    setPrimeiro(null);
    setResultado(null);
  };

  return (
    <Dialog
      nome="ordem"
      eyebrow="Tarefa do capítulo"
      titulo="Qual destes acontecimentos veio primeiro?"
      tamanho="largo"
      onClose={onClose}
      // O rodapé troca de botões a cada resposta: o foco acompanha.
      focoChave={resultado === null ? "pergunta" : resultado.certo ? "certo" : "errado"}
      acoes={
        resultado === null ? (
          <>
            <button key="depois" type="button" className={quietButton} onClick={onClose}>
              Decidir depois
            </button>
            <button key="confirmar" type="button" className={primaryButton} onClick={confirmar} disabled={primeiro === null} data-confirmar-ordem>
              Confirmar a ordem
            </button>
          </>
        ) : resultado.certo ? (
          <button key="continuar" type="button" className={primaryButton} onClick={onClose} data-foco-inicial data-ordem-concluida>
            Continuar
          </button>
        ) : (
          <button key="tentar" type="button" className={primaryButton} onClick={tentarDeNovo} data-foco-inicial data-tentar-de-novo>
            Tentar de novo
          </button>
        )
      }
    >
      <p className="text-sm text-ink-soft">
        Leia a data de cada registro e escolha o que aconteceu antes. Errar não tem penalidade: dá para tentar de novo.
        {tentativas > 0 && ` Tentativas até agora: ${tentativas}.`}
      </p>
      <ul className="mt-4 grid gap-3 md:grid-cols-2">
        {[ra, rb].map((registro) => {
          const escolhido = primeiro === registro.id;
          const posicao = primeiro === null ? null : escolhido ? 1 : 2;
          return (
            <li
              key={registro.id}
              className={`flex flex-col gap-3 border p-3 ${escolhido ? "border-accent bg-accent-soft" : "border-line bg-paper"}`}
              data-ordem-item={registro.id}
            >
              {posicao !== null && (
                <p className="eyebrow text-ink-soft" data-ordem-posicao={posicao}>
                  {posicao === 1 ? "Primeiro" : "Depois"}
                </p>
              )}
              <RecordCard registro={registro} personagem={personagem} detalhe="curto" />
              {resultado === null && (
                <button
                  type="button"
                  className={escolhido ? primaryButton : secondaryButton}
                  aria-pressed={escolhido}
                  onClick={() => setPrimeiro(registro.id)}
                  data-escolher-primeiro={registro.id}
                >
                  {escolhido ? "Escolhido como o primeiro" : "Este veio primeiro"}
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {resultado !== null && (
        <p
          role="status"
          className={`mt-4 border px-3 py-2 text-sm ${resultado.certo ? "border-ink bg-raised" : "border-line-strong bg-notice"}`}
          data-ordem-resultado={resultado.certo ? "certo" : "errado"}
        >
          {resultado.explicacao}
          {/* No mesmo aviso do resultado: quem ouve que acertou ouve também se a saída abriu ou o que falta. */}
          {resultado.certo && (
            <span className="mt-1 block font-medium" data-saida-situacao={exitOpen(saida) ? "aberta" : "fechada"}>
              Tarefa concluída. {exitSentence(saida)}
            </span>
          )}
        </p>
      )}
    </Dialog>
  );
}

// ---------------------------------------------------------------------------

export function GuideDialog({
  capitulo,
  saida,
  ordemPendente,
  ultimo,
  onAnswerOrder,
  onClose,
}: {
  capitulo: ChapterSpec;
  /** Como está a saída: aberta, ou o que falta. */
  saida: ExitState;
  ordemPendente: boolean;
  /** Este é o último capítulo desta etapa: a saída encerra, e não leva a outro. */
  ultimo: boolean;
  onAnswerOrder: () => void;
  onClose: () => void;
}) {
  const aberta = exitOpen(saida);
  return (
    <Dialog
      nome="guia"
      eyebrow="Arquivista · personagem fictício"
      titulo={aberta ? "A saída está aberta" : "O objetivo deste capítulo"}
      onClose={onClose}
      acoes={
        <>
          {ordemPendente && (
            <button type="button" className={secondaryButton} onClick={onAnswerOrder}>
              Ordenar os registros
            </button>
          )}
          <button type="button" className={primaryButton} onClick={onClose} data-foco-inicial>
            Entendi
          </button>
        </>
      }
    >
      <div className="space-y-3 text-base">
        <p className="reading">{capitulo.objetivo}</p>
        {aberta ? (
          <p>
            {ultimo
              ? "A tarefa está cumprida e os registros estão todos com você. A saída está aberta: atravesse a passagem para encerrar esta etapa."
              : "A tarefa está cumprida e os registros estão todos com você. A saída está aberta: atravesse a passagem para seguir ao próximo capítulo."}
          </p>
        ) : ordemPendente ? (
          <p>
            Os dois registros da tarefa já estão com você. Falta colocá-los em ordem cronológica.
            {saida.faltam > 0 && ` ${missingLabel(saida.faltam)} para a saída abrir.`}
          </p>
        ) : saida.tarefaConcluida ? (
          <p>
            A tarefa está cumprida. {missingLabel(saida.faltam)} para a saída abrir: {saida.faltam === 1 ? "ele continua" : "eles continuam"} no
            cenário.
          </p>
        ) : (
          <p>Os registros estão espalhados pelo cenário. Chegue perto de um deles e use a tecla E, ou o botão de interação, para recolher.</p>
        )}
        {!aberta && (
          <p data-regra-da-saida>
            {EXIT_RULE} {collectedSentence(saida)}
          </p>
        )}
        <p className="text-sm text-ink-soft" data-aviso-cenario>
          O cenário é uma representação: não afirma que a pessoa esteve neste lugar nem que os fatos aconteceram nele. O
          Arquivista é uma figura inventada para guiar o jogo. Os registros são os do atlas, com data e fontes; o jogo não
          atribui falas às pessoas retratadas.
        </p>
      </div>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------

export function ClosedExitDialog({
  capitulo,
  saida,
  ordemPendente,
  onAnswerOrder,
  onClose,
}: {
  capitulo: ChapterSpec;
  saida: ExitState;
  /** Os dois registros da tarefa de ordem já estão recolhidos: falta responder, e a janela leva à pergunta. */
  ordemPendente: boolean;
  onAnswerOrder: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog
      nome="saida-fechada"
      eyebrow="Saída"
      titulo="A saída está fechada"
      onClose={onClose}
      acoes={
        <>
          {ordemPendente && (
            <button type="button" className={secondaryButton} onClick={onAnswerOrder} data-responder-ordem>
              Ordenar os registros
            </button>
          )}
          <button type="button" className={primaryButton} onClick={onClose} data-foco-inicial>
            Entendi
          </button>
        </>
      }
    >
      <p className="reading" data-regra-da-saida>
        {EXIT_RULE}
      </p>
      {/* O que falta, item por item: os registros e a tarefa. */}
      <ul className="mt-3 space-y-1 text-sm">
        <li data-falta-registros={saida.faltam}>
          {collectedSentence(saida)} {saida.faltam === 0 ? "Não falta nenhum." : `${missingLabel(saida.faltam)}.`}
        </li>
        <li data-falta-tarefa={saida.tarefaConcluida ? "nao" : "sim"}>
          {ordemPendente ? (
            "Tarefa pendente: os dois registros pedidos já estão com você. Falta colocá-los em ordem."
          ) : (
            <>
              Tarefa {saida.tarefaConcluida ? "cumprida" : "pendente"}: <span className="text-ink-soft">{capitulo.objetivo}</span>
            </>
          )}
        </li>
      </ul>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------

export function ConfirmResetDialog({ nome, onConfirm, onClose }: { nome: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <Dialog
      nome="reiniciar"
      eyebrow="Progresso"
      titulo={`Reiniciar a trajetória de ${nome}?`}
      onClose={onClose}
      acoes={
        <>
          <button type="button" className={secondaryButton} onClick={onClose} data-foco-inicial>
            Cancelar
          </button>
          <button type="button" className={primaryButton} onClick={onConfirm} data-confirmar-reinicio>
            Reiniciar
          </button>
        </>
      }
    >
      <p className="reading">
        O progresso guardado neste navegador para este personagem será apagado, e o jogo volta ao primeiro capítulo. O
        progresso do outro personagem não muda.
      </p>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------

const TRANSITION_MS = 2600;

/**
 * Leva o foco ao botão principal de uma tela que cobre a cena, no mesmo passo
 * em que a cena sai da tabulação: o foco não fica um instante solto na página.
 */
function useFocusOnMount() {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    ref.current?.querySelector<HTMLElement>("[data-foco-inicial]")?.focus({ preventScroll: true });
  }, []);
  return ref;
}

export function ChapterTransition({
  concluido,
  proximo,
  onContinue,
}: {
  concluido: ChapterSpec;
  proximo: ChapterSpec | null;
  onContinue: () => void;
}) {
  // Segue sozinho depois de um instante; o botão adianta.
  useEffect(() => {
    const timer = window.setTimeout(onContinue, TRANSITION_MS);
    return () => window.clearTimeout(timer);
  }, [onContinue]);

  const cena = proximo === null ? null : getScene(proximo.cena);
  const ref = useFocusOnMount();
  return (
    <div ref={ref} className="animate-enter absolute inset-0 z-30 flex items-center justify-center bg-paper/95 p-6" data-transicao={proximo?.id ?? "fim"}>
      <div role="status" aria-live="polite" className="max-w-lg space-y-5 text-center">
        <p className="eyebrow text-ink-soft">Capítulo {concluido.numero} concluído</p>
        <p className="font-serif text-2xl font-medium leading-tight tracking-tight">{concluido.titulo}</p>
        {proximo !== null && cena !== null ? (
          <div className="space-y-2 border-t border-line pt-5">
            <p className="eyebrow text-ink-soft">A seguir · Capítulo {proximo.numero}</p>
            <p className="font-serif text-3xl font-medium leading-tight tracking-tight">{proximo.titulo}</p>
            <p className="numerals text-sm text-ink-soft">
              {proximo.periodo.de}–{proximo.periodo.ate} · cenário: {cena.nome}
            </p>
          </div>
        ) : (
          <p className="border-t border-line pt-5 text-ink-soft">Este era o último capítulo desta etapa.</p>
        )}
        <button type="button" className={primaryButton} onClick={onContinue} data-foco-inicial>
          Continuar
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

export function EndScreen({
  nome,
  personagem,
  capitulos,
  onReview,
  onReset,
}: {
  nome: string;
  personagem: string;
  capitulos: readonly ChapterSpec[];
  onReview: () => void;
  onReset: () => void;
}) {
  const ref = useFocusOnMount();
  return (
    // O conteúdo fica no meio quando cabe; quando é mais alto que o palco, começa do alto e rola inteiro.
    <div ref={ref} className="absolute inset-0 z-30 flex justify-center overflow-y-auto bg-paper/95 p-4 md:p-6" data-fim="sim">
      <div className="my-auto max-w-xl space-y-5">
        <div className="space-y-2">
          <p className="eyebrow text-ink-soft">Fim desta etapa</p>
          <h2 className="font-serif text-3xl font-medium leading-tight tracking-tight">
            Você percorreu os {capitulos.length} capítulos de {nome} disponíveis nesta versão
          </h2>
          <p className="reading">
            Os capítulos cobrem de {capitulos[0]?.periodo.de} a {capitulos.at(-1)?.periodo.ate}. Os demais acontecimentos
            do atlas ainda não têm capítulo. O que o jogo mostrou está todo no atlas, com data, lugar e fontes, sem precisar
            jogar.
          </p>
        </div>
        <ul className="space-y-2 text-sm">
          <li>
            <Link href={explorationHref(personagem, { periodo: { de: null, ate: null }, categorias: [], acontecimento: null })} prefetch={false} className="font-medium underline decoration-line-strong hover:decoration-ink">
              Trajetória completa de {nome} no atlas
            </Link>
          </li>
          <li>
            <Link href={comparisonHref()} prefetch={false} className="font-medium underline decoration-line-strong hover:decoration-ink">
              Comparar as duas trajetórias
            </Link>
          </li>
          <li>
            <Link href={gameHref()} prefetch={false} className="font-medium underline decoration-line-strong hover:decoration-ink">
              Escolher outro personagem
            </Link>
          </li>
        </ul>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={primaryButton} onClick={onReview} data-foco-inicial>
            Rever os capítulos
          </button>
          <button type="button" className={secondaryButton} onClick={onReset}>
            Reiniciar a trajetória
          </button>
        </div>
      </div>
    </div>
  );
}
