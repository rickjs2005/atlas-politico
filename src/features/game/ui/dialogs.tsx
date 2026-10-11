"use client";

// Os diálogos do jogo: o registro recolhido (acontecimento ou decisão), a
// tarefa de ordem, a tarefa de escolha (documento ou lugar), a tarefa de
// decisão em duas etapas, o Escrivão, a saída fechada, a confirmação de
// reinício, a transição de capítulo e o fim da sala. Todos pausam o movimento
// enquanto estão abertos. O Escrivão fala pelo catálogo (src/lib/game/escrivao):
// a instrução, o que vem do registro e, quando ligado, o humor marcado como ficção.

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { DecisionCard } from "@/features/decisions/DecisionCard";
import { ESCRIVAO_NOME, ESCRIVAO_ROTULO, type FalaDita } from "@/lib/game/escrivao";
import type { RelatedRecord } from "@/lib/game/judicial";
import { isEvidenceDone, type Attempt, type ChoiceOption } from "@/lib/game/mission";
import type { RoomSpec } from "@/lib/game/rooms";
import { getScene } from "@/lib/game/scenes";
import { EPOCA_LABEL, type ChapterSpec, type GameDecision, type GameRecord, type TaskSpec, type TaskState, type TaskType } from "@/lib/game/types";
import { comparisonHref, decisionHref, explorationHref, gameHref } from "@/lib/state/links";

import { Dialog, primaryButton, quietButton, secondaryButton } from "./Dialog";
import { EscrivaoSays } from "./EscrivaoSays";
import { RecordCard } from "./RecordCard";
import { EXIT_RULE, collectedSentence, exitOpen, exitSentence, missingLabel, type ExitState } from "./saida";
import { answerLabel, pendingSentence } from "./tarefa";

/** Uma avaliação com as falas do Escrivão para o que aconteceu (erro, ou nada). */
export type AttemptWithLines = Attempt & { falas: readonly FalaDita[] };

// ---------------------------------------------------------------------------

/** O aviso do que um registro recolhido mudou: a tarefa, se era ele o pedido, e a saída, com o que ainda a segura. */
function RecordNotice({ concluiu, respostaPendente, tipoDaTarefa, saida }: { concluiu: boolean; respostaPendente: boolean; tipoDaTarefa: TaskType; saida: ExitState }) {
  const aberta = exitOpen(saida);
  return (
    <div role="status" className={`mb-4 space-y-1 border px-3 py-2 text-sm ${concluiu || aberta ? "border-ink bg-notice" : "border-line bg-paper"}`} data-aviso-do-registro>
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
  );
}

export function RecordDialog({
  registro,
  personagem,
  tipoDaTarefa,
  respostaPendente,
  concluiu,
  saida,
  releitura,
  relacionados,
  falas,
  onOpenRecordPage,
  onClose,
}: {
  registro: GameRecord;
  personagem: string;
  tipoDaTarefa: TaskType;
  /** Os registros da tarefa já estão recolhidos e falta a resposta (ordem, documento, lugar ou decisão). */
  respostaPendente: boolean;
  /** Este era o registro que a tarefa pedia. */
  concluiu: boolean;
  /** Como ficou a saída depois deste registro: aberta, ou o que falta. */
  saida: ExitState;
  /** Aberto pelo painel, para ler de novo um registro já recolhido: nada mudou agora. */
  releitura: boolean;
  relacionados: readonly RelatedRecord[];
  /** O que o Escrivão diz sobre a descoberta; vazio na releitura. */
  falas: readonly FalaDita[];
  /** A pessoa seguiu para a ficha completa, fora do jogo. */
  onOpenRecordPage: () => void;
  onClose: () => void;
}) {
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
      {!releitura && <RecordNotice concluiu={concluiu} respostaPendente={respostaPendente} tipoDaTarefa={tipoDaTarefa} saida={saida} />}
      {!releitura && <EscrivaoSays falas={falas} evento="descoberta" className="mb-4" />}
      <RecordCard registro={registro} personagem={personagem} detalhe="completo" relacionados={relacionados} onOpenRecordPage={onOpenRecordPage} />
    </Dialog>
  );
}

// ---------------------------------------------------------------------------

/** O registro de uma decisão recolhido: o mesmo cartão do atlas, com o aviso do que mudou e a fala do Escrivão. */
export function DecisionRecordDialog({
  decisao,
  personagem,
  tipoDaTarefa,
  respostaPendente,
  saida,
  releitura,
  falas,
  onOpenRecordPage,
  onClose,
}: {
  decisao: GameDecision;
  personagem: string;
  tipoDaTarefa: TaskType;
  respostaPendente: boolean;
  saida: ExitState;
  releitura: boolean;
  falas: readonly FalaDita[];
  onOpenRecordPage: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog
      nome="registro"
      eyebrow={releitura ? "Decisão já recolhida" : "Decisão recolhida"}
      titulo="O que o atlas registra desta decisão"
      tamanho="largo"
      onClose={onClose}
      acoes={
        <button type="button" className={primaryButton} onClick={onClose} data-foco-inicial>
          {releitura ? "Voltar ao painel" : respostaPendente ? "Guardar e responder" : "Guardar e continuar"}
        </button>
      }
    >
      {!releitura && <RecordNotice concluiu={false} respostaPendente={respostaPendente} tipoDaTarefa={tipoDaTarefa} saida={saida} />}
      {!releitura && <EscrivaoSays falas={falas} evento="descoberta" className="mb-4" />}
      <DecisionCard decisao={decisao} detalhe="completo" link={{ href: decisionHref(personagem, decisao.id), rotulo: "Ver esta decisão na trajetória, no atlas", onFollow: onOpenRecordPage }} />
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
  /** Responde a ordem. Devolve a avaliação, já aplicada ao progresso, com as falas do Escrivão. */
  onSubmit(resposta: readonly [string, string]): AttemptWithLines;
  onClose: () => void;
}) {
  const [primeiro, setPrimeiro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<AttemptWithLines | null>(null);
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
        <div role="status" className={`mt-4 space-y-2 border px-3 py-2 text-sm ${resultado.certo ? "border-ink bg-raised" : "border-line-strong bg-notice"}`} data-ordem-resultado={resultado.certo ? "certo" : "errado"}>
          <p>
            {resultado.explicacao}
            {/* No mesmo aviso do resultado: quem ouve que acertou ouve também se a saída abriu ou o que falta. */}
            {resultado.certo && (
              <span className="mt-1 block font-medium" data-saida-situacao={exitOpen(saida) ? "aberta" : "fechada"}>
                Tarefa concluída. {exitSentence(saida)}
              </span>
            )}
          </p>
          <EscrivaoSays falas={resultado.falas} evento={resultado.certo ? "conclusao" : "erro"} />
        </div>
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
  /** Responde com o `id` da opção. Devolve a avaliação, já aplicada ao progresso, com as falas do Escrivão. */
  onSubmit(id: string): AttemptWithLines;
  onClose: () => void;
}) {
  const [escolha, setEscolha] = useState<string | null>(null);
  const [resultado, setResultado] = useState<AttemptWithLines | null>(null);
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
        <OptionList opcoes={opcoes} escolha={escolha} travada={resultado !== null} rotulo={deFonte ? "Documentos" : "Lugares"} onChoose={setEscolha} />
      </div>
      {resultado !== null && (
        <div role="status" className={`mt-4 space-y-2 border px-3 py-2 text-sm ${resultado.certo ? "border-ink bg-raised" : "border-line-strong bg-notice"}`} data-escolha-resultado={resultado.certo ? "certo" : "errado"}>
          <p>
            {resultado.explicacao}
            {resultado.certo && (
              <span className="mt-1 block font-medium" data-saida-situacao={exitOpen(saida) ? "aberta" : "fechada"}>
                Tarefa concluída. {exitSentence(saida)}
              </span>
            )}
          </p>
          <EscrivaoSays falas={resultado.falas} evento={resultado.certo ? "conclusao" : "erro"} />
        </div>
      )}
    </Dialog>
  );
}

/** A lista de opções de uma escolha, um botão por opção. */
function OptionList({ opcoes, escolha, travada, rotulo, onChoose }: { opcoes: readonly ChoiceOption[]; escolha: string | null; travada: boolean; rotulo: string; onChoose(id: string): void }) {
  return (
    <ul className="space-y-2" aria-label={rotulo}>
      {opcoes.map((opcao) => {
        const escolhida = escolha === opcao.id;
        return (
          <li key={opcao.id} data-escolha-opcao={opcao.id}>
            <button
              type="button"
              className={`w-full border px-3 py-2 text-left text-sm ${escolhida ? "border-accent bg-accent-soft font-medium" : "border-line bg-paper hover:border-line-strong"}`}
              aria-pressed={escolhida}
              disabled={travada}
              onClick={() => onChoose(opcao.id)}
              data-escolher={opcao.id}
            >
              {opcao.rotulo}
              {opcao.detalhe.length > 0 && <span className="block text-xs text-ink-soft">{opcao.detalhe}</span>}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

// ---------------------------------------------------------------------------

/**
 * A tarefa de decisão, em duas etapas sobre o mesmo registro recolhido:
 * primeiro o documento que o sustenta (a evidência), depois a interpretação
 * do que ele documenta (a manifestação e o objeto votado, ou o tipo do ato).
 * As opções vêm do próprio registro; errar explica e deixa tentar de novo. A
 * etapa é a do estado da tarefa: quem fecha a janela no meio volta à etapa
 * em que parou.
 */
export function DecisionTaskDialog({
  decisao,
  estado,
  opcoesDeEvidencia,
  opcoesDeInterpretacao,
  saida,
  falasDaFonte,
  onSubmitEvidence,
  onSubmitInterpretation,
  onClose,
}: {
  decisao: GameDecision;
  estado: TaskState;
  opcoesDeEvidencia: readonly ChoiceOption[];
  opcoesDeInterpretacao: readonly ChoiceOption[];
  saida: ExitState;
  /** O que o Escrivão diz ao abrir a etapa da evidência. */
  falasDaFonte: readonly FalaDita[];
  onSubmitEvidence(fonteId: string): AttemptWithLines;
  onSubmitInterpretation(opcaoId: string): AttemptWithLines;
  onClose: () => void;
}) {
  const [escolha, setEscolha] = useState<string | null>(null);
  const [resultado, setResultado] = useState<AttemptWithLines | null>(null);
  const etapa: "evidencia" | "interpretacao" = isEvidenceDone(estado) ? "interpretacao" : "evidencia";
  // A etapa que o resultado à vista respondeu: ao acertar a evidência, o estado já é o da interpretação, e a janela mostra o resultado antes de seguir.
  const [etapaRespondida, setEtapaRespondida] = useState<"evidencia" | "interpretacao" | null>(null);
  const confirmar = () => {
    if (escolha === null) return;
    setEtapaRespondida(etapa);
    setResultado(etapa === "evidencia" ? onSubmitEvidence(escolha) : onSubmitInterpretation(escolha));
  };
  const seguir = () => {
    setEscolha(null);
    setResultado(null);
    setEtapaRespondida(null);
  };
  const daEvidencia = etapa === "evidencia" && resultado === null ? true : etapaRespondida === "evidencia";
  return (
    <Dialog
      nome="decisao"
      eyebrow={`Tarefa do capítulo · etapa ${daEvidencia ? "1 de 2: a evidência" : "2 de 2: a interpretação"}`}
      titulo={daEvidencia ? "Qual documento sustenta este registro?" : "O que este registro documenta?"}
      tamanho="largo"
      onClose={onClose}
      focoChave={`${etapa}:${resultado === null ? "pergunta" : resultado.certo ? "certo" : "errado"}`}
      acoes={
        resultado === null ? (
          <>
            <button key="depois" type="button" className={quietButton} onClick={onClose}>
              Decidir depois
            </button>
            <button key="confirmar" type="button" className={primaryButton} onClick={confirmar} disabled={escolha === null} data-confirmar-decisao={etapa}>
              {etapa === "evidencia" ? "Confirmar o documento" : "Confirmar a interpretação"}
            </button>
          </>
        ) : resultado.certo && etapaRespondida === "evidencia" ? (
          <button key="seguir" type="button" className={primaryButton} onClick={seguir} data-foco-inicial data-evidencia-concluida>
            Seguir para a interpretação
          </button>
        ) : resultado.certo ? (
          <button key="continuar" type="button" className={primaryButton} onClick={onClose} data-foco-inicial data-decisao-concluida>
            Continuar
          </button>
        ) : (
          <button key="tentar" type="button" className={primaryButton} onClick={seguir} data-foco-inicial data-tentar-de-novo>
            Tentar de novo
          </button>
        )
      }
    >
      <p className="text-sm text-ink-soft" data-dica-da-decisao={etapa}>
        {daEvidencia
          ? "O registro recolhido lista os documentos que o sustentam; o documento certo está nessa lista. Os outros são citados por outros registros do capítulo. Errar não tem penalidade: dá para tentar de novo."
          : "Leia no registro a manifestação registrada e o objeto votado, ou o tipo do ato. A opção certa é o que está escrito nele; as outras trocam uma coisa só. Errar não tem penalidade: dá para tentar de novo."}
        {estado.tentativas > 0 && ` Tentativas até agora: ${estado.tentativas}.`}
      </p>
      {daEvidencia && resultado === null && <EscrivaoSays falas={falasDaFonte} evento="fonte" className="mt-3" />}
      <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="border border-line bg-paper p-3" data-escolha-registro={decisao.id}>
          <DecisionCard decisao={decisao} detalhe={daEvidencia ? "curto" : "completo"} headingLevel={4} />
        </div>
        <OptionList
          opcoes={daEvidencia ? opcoesDeEvidencia : opcoesDeInterpretacao}
          escolha={escolha}
          travada={resultado !== null}
          rotulo={daEvidencia ? "Documentos" : "Interpretações"}
          onChoose={setEscolha}
        />
      </div>
      {resultado !== null && (
        <div role="status" className={`mt-4 space-y-2 border px-3 py-2 text-sm ${resultado.certo ? "border-ink bg-raised" : "border-line-strong bg-notice"}`} data-decisao-resultado={resultado.certo ? "certo" : "errado"} data-etapa={etapaRespondida ?? etapa}>
          <p>
            {resultado.explicacao}
            {resultado.certo && etapaRespondida === "interpretacao" && (
              <span className="mt-1 block font-medium" data-saida-situacao={exitOpen(saida) ? "aberta" : "fechada"}>
                Tarefa concluída. {exitSentence(saida)}
              </span>
            )}
          </p>
          <EscrivaoSays falas={resultado.falas} evento={resultado.certo ? "conclusao" : "erro"} />
        </div>
      )}
    </Dialog>
  );
}

// ---------------------------------------------------------------------------

export function EscrivaoDialog({
  capitulo,
  sala,
  saida,
  respostaPendente,
  ultimo,
  falas,
  humor,
  onToggleHumor,
  onAnswer,
  onClose,
}: {
  capitulo: ChapterSpec;
  sala: RoomSpec;
  /** Como está a saída: aberta, ou o que falta. */
  saida: ExitState;
  respostaPendente: boolean;
  /** Este é o último capítulo da sala: a saída encerra, e não leva a outro. */
  ultimo: boolean;
  /** O que o Escrivão diz nesta ajuda. */
  falas: readonly FalaDita[];
  /** O humor do Escrivão está ligado. */
  humor: boolean;
  onToggleHumor(): void;
  onAnswer: () => void;
  onClose: () => void;
}) {
  const aberta = exitOpen(saida);
  const tipo = capitulo.tarefa.tipo;
  return (
    <Dialog
      nome="guia"
      eyebrow={ESCRIVAO_ROTULO}
      titulo={aberta ? "A saída está aberta" : "O objetivo deste capítulo"}
      onClose={onClose}
      acoes={
        <>
          <button type="button" className={quietButton} onClick={onToggleHumor} aria-pressed={humor} data-humor={humor ? "ligado" : "desligado"}>
            {humor ? "Desligar o humor" : "Ligar o humor"}
          </button>
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
              ? `A tarefa está cumprida e os registros estão todos com você. A saída está aberta: atravesse a passagem para encerrar a sala ${sala.nome}.`
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
        <EscrivaoSays falas={falas} evento="ajuda" />
        <p className="text-sm text-ink-soft" data-aviso-cenario>
          O cenário é uma representação: não afirma que a pessoa esteve neste lugar nem que os fatos aconteceram nele. A
          figura do personagem muda de cabelo, barba e roupa conforme a época do capítulo, de forma estilizada; não afirma
          a aparência real em cada data. O {ESCRIVAO_NOME} é uma figura inventada para guiar o jogo: as falas de humor dele são
          ficção sobre papelada e sobre ele mesmo, iguais para os dois personagens, e podem ser desligadas. Os registros são
          os do atlas, com data e fontes; o jogo não atribui falas às pessoas retratadas.
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
      titulo={`Reiniciar o progresso de ${nome}?`}
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
        O progresso guardado neste navegador para este personagem, em todas as salas, será apagado, e cada sala volta ao
        primeiro capítulo. O progresso do outro personagem não muda.
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
  falas,
  onContinue,
}: {
  concluido: ChapterSpec;
  proximo: ChapterSpec | null;
  /** O que o Escrivão diz na conclusão. */
  falas: readonly FalaDita[];
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
        <EscrivaoSays falas={falas} evento="conclusao" className="text-left" />
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
          <p className="border-t border-line pt-5 text-ink-soft">Este era o último capítulo desta sala.</p>
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
  sala,
  capitulos,
  outrasSalas,
  onReview,
  onReset,
}: {
  nome: string;
  personagem: string;
  sala: RoomSpec;
  /** Os capítulos da sala percorrida. */
  capitulos: readonly ChapterSpec[];
  /** As outras salas do personagem, para seguir. */
  outrasSalas: readonly RoomSpec[];
  onReview: () => void;
  onReset: () => void;
}) {
  const ref = useFocusOnMount();
  const acontecimentos = capitulos.reduce((soma, capitulo) => soma + capitulo.eventIds.length, 0);
  const decisoes = capitulos.reduce((soma, capitulo) => soma + (capitulo.decisaoIds?.length ?? 0), 0);
  const historico = sala.id === "historico";
  return (
    // O conteúdo fica no meio quando cabe; quando é mais alto que o palco, começa do alto e rola inteiro.
    <div ref={ref} className="absolute inset-0 z-30 flex justify-center overflow-y-auto bg-paper/95 p-4 md:p-6" data-fim="sim" data-fim-sala={sala.id}>
      <div className="my-auto max-w-xl space-y-5">
        <div className="space-y-2">
          <p className="eyebrow text-ink-soft">{historico ? "Fim da trajetória" : `Fim da sala ${sala.nome}`}</p>
          <h2 className="font-serif text-3xl font-medium leading-tight tracking-tight">
            {historico ? `Você percorreu os ${capitulos.length} capítulos de ${nome}` : `Você percorreu a sala ${sala.nome} de ${nome}`}
          </h2>
          <p className="reading">
            {historico
              ? `Os capítulos cobrem de ${capitulos[0]?.periodo.de} a ${capitulos.at(-1)?.periodo.ate}, com os ${acontecimentos} acontecimentos que o atlas publica sobre ${nome} até a data de corte da edição${decisoes > 0 ? ` e ${decisoes === 1 ? "uma decisão documentada" : `${decisoes} decisões documentadas`}` : ""}.`
              : `${decisoes === 1 ? "Uma decisão documentada" : `${decisoes} decisões documentadas`} no tema ${sala.nome}, com cargo, instituição, data, objeto e fontes: uma amostra da edição, e não o histórico completo.`}{" "}
            Nada do que o jogo mostrou fica só nele: está todo no atlas, com data, lugar e fontes, sem precisar jogar.
          </p>
        </div>
        <ul className="space-y-2 text-sm">
          <li>
            <Link href={explorationHref(personagem, { periodo: { de: null, ate: null }, categorias: [], acontecimento: null })} prefetch={false} className="font-medium underline decoration-line-strong hover:decoration-ink">
              Trajetória completa de {nome} no atlas
            </Link>
          </li>
          {!historico && (
            <li>
              <Link href={decisionHref(personagem, "")} prefetch={false} className="font-medium underline decoration-line-strong hover:decoration-ink">
                Decisões documentadas de {nome} no atlas
              </Link>
            </li>
          )}
          <li>
            <Link href={comparisonHref()} prefetch={false} className="font-medium underline decoration-line-strong hover:decoration-ink">
              Comparar as duas trajetórias
            </Link>
          </li>
          {outrasSalas.map((outra) => (
            <li key={outra.id}>
              <Link href={gameHref(personagem, outra.id)} prefetch={false} className="font-medium underline decoration-line-strong hover:decoration-ink" data-ir-para-sala={outra.id}>
                Sala {outra.nome} de {nome}
              </Link>
            </li>
          ))}
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
            Reiniciar o progresso
          </button>
        </div>
      </div>
    </div>
  );
}
