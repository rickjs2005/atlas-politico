"use client";

// Os diálogos do jogo: o registro recolhido, a tarefa de ordem, a tarefa de
// escolha (documento ou lugar), o guia, a saída fechada, a confirmação de
// reinício, a transição de capítulo e o fim da trajetória. Todos pausam o
// movimento enquanto estão abertos.

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import type { RelatedRecord } from "@/lib/game/judicial";
import type { Attempt, ChoiceOption } from "@/lib/game/mission";
import { getScene } from "@/lib/game/scenes";
import { EPOCA_LABEL, type ChapterSpec, type GameRecord, type TaskSpec, type TaskType } from "@/lib/game/types";
import { comparisonHref, explorationHref, gameHref } from "@/lib/state/links";

import { Dialog, primaryButton, quietButton, secondaryButton } from "./Dialog";
import { RecordCard } from "./RecordCard";
import { EXIT_RULE, collectedSentence, exitOpen, exitSentence, missingLabel, type ExitState } from "./saida";
import { answerLabel, pendingSentence } from "./tarefa";

// ---------------------------------------------------------------------------

export function RecordDialog({
  registro,
  personagem,
  tipoDaTarefa,
  respostaPendente,
  concluiu,
  saida,
  releitura,
  relacionados,
  onOpenRecordPage,
  onClose,
}: {
  registro: GameRecord;
  personagem: string;
  tipoDaTarefa: TaskType;
  /** Os registros da tarefa já estão recolhidos e falta a resposta (ordem, documento ou lugar). */
  respostaPendente: boolean;
  /** Este era o registro que a tarefa pedia. */
  concluiu: boolean;
  /** Como ficou a saída depois deste registro: aberta, ou o que falta. */
  saida: ExitState;
  /** Aberto pelo painel, para ler de novo um registro já recolhido: nada mudou agora. */
  releitura: boolean;
  relacionados: readonly RelatedRecord[];
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
          {releitura ? "Voltar ao painel" : respostaPendente ? "Guardar e responder" : "Guardar e continuar"}
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
          {respostaPendente && <p data-resposta-pronta={tipoDaTarefa}>{pendingSentence(tipoDaTarefa)}</p>}
          <p
            className={aberta ? "font-medium" : concluiu ? "" : "text-ink-soft"}
            data-saida-situacao={aberta ? "aberta" : "fechada"}
            data-registros={`${saida.total - saida.faltam}/${saida.total}`}
          >
            {collectedSentence(saida)} {exitSentence(saida)}
          </p>
        </div>
      )}
      <RecordCard registro={registro} personagem={personagem} detalhe="completo" relacionados={relacionados} onOpenRecordPage={onOpenRecordPage} />
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
  onSubmit(resposta: readonly [string, string]): Attempt;
  onClose: () => void;
}) {
  const [primeiro, setPrimeiro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Attempt | null>(null);
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

/**
 * A tarefa de escolha: associar o registro recolhido ao documento que o
 * sustenta (`fonte`) ou ao lugar em que o atlas o documenta (`lugar`). As
 * opções vêm dos próprios registros; errar explica e deixa tentar de novo.
 */
export function ChoiceDialog({
  tipo,
  registro,
  opcoes,
  personagem,
  tentativas,
  saida,
  onSubmit,
  onClose,
}: {
  tipo: "fonte" | "lugar";
  /** O registro pedido pela tarefa, já recolhido. */
  registro: GameRecord;
  opcoes: readonly ChoiceOption[];
  personagem: string;
  tentativas: number;
  saida: ExitState;
  /** Responde com o `id` da opção. Devolve a avaliação, já aplicada ao progresso. */
  onSubmit(id: string): Attempt;
  onClose: () => void;
}) {
  const [escolha, setEscolha] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Attempt | null>(null);
  const confirmar = () => {
    if (escolha === null) return;
    setResultado(onSubmit(escolha));
  };
  const tentarDeNovo = () => {
    setEscolha(null);
    setResultado(null);
  };
  const deFonte = tipo === "fonte";
  return (
    <Dialog
      nome="escolha"
      eyebrow="Tarefa do capítulo"
      titulo={deFonte ? "Qual documento sustenta este registro?" : "Em que lugar o atlas documenta este acontecimento?"}
      tamanho="largo"
      onClose={onClose}
      focoChave={resultado === null ? "pergunta" : resultado.certo ? "certo" : "errado"}
      acoes={
        resultado === null ? (
          <>
            <button key="depois" type="button" className={quietButton} onClick={onClose}>
              Decidir depois
            </button>
            <button key="confirmar" type="button" className={primaryButton} onClick={confirmar} disabled={escolha === null} data-confirmar-escolha>
              {deFonte ? "Confirmar o documento" : "Confirmar o lugar"}
            </button>
          </>
        ) : resultado.certo ? (
          <button key="continuar" type="button" className={primaryButton} onClick={onClose} data-foco-inicial data-escolha-concluida>
            Continuar
          </button>
        ) : (
          <button key="tentar" type="button" className={primaryButton} onClick={tentarDeNovo} data-foco-inicial data-tentar-de-novo>
            Tentar de novo
          </button>
        )
      }
    >
      <p className="text-sm text-ink-soft" data-dica-da-escolha>
        {deFonte
          ? "O registro recolhido lista os documentos que o sustentam; o documento certo está nessa lista. Os outros são citados por outros registros do capítulo. Errar não tem penalidade: dá para tentar de novo."
          : "O registro recolhido diz o lugar em que o atlas o documenta. Os outros lugares são de outros registros da trajetória. Errar não tem penalidade: dá para tentar de novo."}
        {tentativas > 0 && ` Tentativas até agora: ${tentativas}.`}
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="border border-line bg-paper p-3" data-escolha-registro={registro.id}>
          <RecordCard registro={registro} personagem={personagem} detalhe="curto" />
          <p className="mt-2 text-sm text-ink-soft">{registro.resumo}</p>
        </div>
        <ul className="space-y-2" aria-label={deFonte ? "Documentos" : "Lugares"}>
          {opcoes.map((opcao) => {
            const escolhida = escolha === opcao.id;
            return (
              <li key={opcao.id} data-escolha-opcao={opcao.id}>
                <button
                  type="button"
                  className={`w-full border px-3 py-2 text-left text-sm ${escolhida ? "border-accent bg-accent-soft font-medium" : "border-line bg-paper hover:border-line-strong"}`}
                  aria-pressed={escolhida}
                  disabled={resultado !== null}
                  onClick={() => setEscolha(opcao.id)}
                  data-escolher={opcao.id}
                >
                  {opcao.rotulo}
                  {opcao.detalhe.length > 0 && <span className="block text-xs text-ink-soft">{opcao.detalhe}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      {resultado !== null && (
        <p
          role="status"
          className={`mt-4 border px-3 py-2 text-sm ${resultado.certo ? "border-ink bg-raised" : "border-line-strong bg-notice"}`}
          data-escolha-resultado={resultado.certo ? "certo" : "errado"}
        >
          {resultado.explicacao}
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
  respostaPendente,
  ultimo,
  onAnswer,
  onClose,
}: {
  capitulo: ChapterSpec;
  /** Como está a saída: aberta, ou o que falta. */
  saida: ExitState;
  respostaPendente: boolean;
  /** Este é o último capítulo da trajetória: a saída encerra, e não leva a outro. */
  ultimo: boolean;
  onAnswer: () => void;
  onClose: () => void;
}) {
  const aberta = exitOpen(saida);
  const tipo = capitulo.tarefa.tipo;
  return (
    <Dialog
      nome="guia"
      eyebrow="Arquivista · personagem fictício"
      titulo={aberta ? "A saída está aberta" : "O objetivo deste capítulo"}
      onClose={onClose}
      acoes={
        <>
          {respostaPendente && (
            <button type="button" className={secondaryButton} onClick={onAnswer} data-responder-tarefa={tipo}>
              {answerLabel(tipo)}
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
              ? "A tarefa está cumprida e os registros estão todos com você. A saída está aberta: atravesse a passagem para encerrar a trajetória."
              : "A tarefa está cumprida e os registros estão todos com você. A saída está aberta: atravesse a passagem para seguir ao próximo capítulo."}
          </p>
        ) : respostaPendente ? (
          <p>
            {pendingSentence(tipo)}
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
          O cenário é uma representação: não afirma que a pessoa esteve neste lugar nem que os fatos aconteceram nele. A
          figura do personagem muda de cabelo, barba e roupa conforme a época do capítulo, de forma estilizada; não afirma
          a aparência real em cada data. O Arquivista é uma figura inventada para guiar o jogo. Os registros são os do
          atlas, com data e fontes; o jogo não atribui falas às pessoas retratadas.
        </p>
      </div>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------

export function ClosedExitDialog({
  capitulo,
  saida,
  respostaPendente,
  onAnswer,
  onClose,
}: {
  capitulo: ChapterSpec;
  saida: ExitState;
  /** Os registros da tarefa já estão recolhidos: falta responder, e a janela leva à pergunta. */
  respostaPendente: boolean;
  onAnswer: () => void;
  onClose: () => void;
}) {
  const tipo = capitulo.tarefa.tipo;
  return (
    <Dialog
      nome="saida-fechada"
      eyebrow="Saída"
      titulo="A saída está fechada"
      onClose={onClose}
      acoes={
        <>
          {respostaPendente && (
            <button type="button" className={secondaryButton} onClick={onAnswer} data-responder-tarefa={tipo}>
              {answerLabel(tipo)}
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
          {respostaPendente ? (
            `Tarefa pendente: ${pendingSentence(tipo)}`
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
              {proximo.periodo.de === proximo.periodo.ate ? proximo.periodo.de : `${proximo.periodo.de}–${proximo.periodo.ate}`} · cenário: {cena.nome} ·{" "}
              {EPOCA_LABEL[proximo.epoca]}
            </p>
            {/* O contexto do capítulo, antes de entrar: o que os registros dele dizem. */}
            <p className="text-sm text-ink-soft" data-contexto-do-capitulo>
              {proximo.motivo}
            </p>
          </div>
        ) : (
          <p className="border-t border-line pt-5 text-ink-soft">Este era o último capítulo da trajetória.</p>
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
  const registros = capitulos.reduce((soma, capitulo) => soma + capitulo.eventIds.length, 0);
  return (
    // O conteúdo fica no meio quando cabe; quando é mais alto que o palco, começa do alto e rola inteiro.
    <div ref={ref} className="absolute inset-0 z-30 flex justify-center overflow-y-auto bg-paper/95 p-4 md:p-6" data-fim="sim">
      <div className="my-auto max-w-xl space-y-5">
        <div className="space-y-2">
          <p className="eyebrow text-ink-soft">Fim da trajetória</p>
          <h2 className="font-serif text-3xl font-medium leading-tight tracking-tight">
            Você percorreu os {capitulos.length} capítulos de {nome}
          </h2>
          <p className="reading">
            Os capítulos cobrem de {capitulos[0]?.periodo.de} a {capitulos.at(-1)?.periodo.ate}, com os {registros} acontecimentos que o atlas
            publica sobre {nome} até a data de corte da edição. Nada do que o jogo mostrou fica só nele: está todo no atlas, com data, lugar e
            fontes, sem precisar jogar.
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
