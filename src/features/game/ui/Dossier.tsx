"use client";

// A missão de investigação "O documento diz o quê?" (D-151), do começo ao
// fim: a conversa com o Escrivão, a chave de leitura, a gaveta de documentos,
// o dossiê, as fichas e, no fim, a explicação com as fontes e o carimbo. É o
// mesmo componente na janela sobre o cenário e em "Ler sem o cenário": os
// objetos da sala só levam a uma destas seções.
//
// Todo texto factual vem do conteúdo publicado: as fichas e a explicação são
// da fase; os campos de cada documento são os do cartão de decisão do atlas.
// Aqui só há rótulos de interface e as falas do Escrivão, que são ficção.
//
// Mecânicas, e de onde vieram (docs/MISSAO-INVESTIGACAO.md): relacionar a
// ficha ao documento e apontar o campo que sustenta o trecho destacado, com o
// erro explicado pelo campo que não bate (Papers, Please); a conversa com
// escolhas e uma marca que muda a ajuda do fim (The Intercept); a sala
// compacta em que cada objeto tem uma função e nada tem tempo (A Short Hike).

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { ReviewNote } from "@/components/ReviewNote";
import { CAMPOS_DO_DOCUMENTO, CAMPO_LABELS, type CampoDoDocumento } from "@/lib/domain/game";
import { formatDate } from "@/lib/domain/dates";
import {
  dossierLine,
  dossierOf,
  dossierSolution,
  dossierSummary,
  documentFields,
  documentOf,
  drawerDocuments,
  fichaStatus,
  isCollected,
  mismatchSentence,
  splitHighlight,
  type DocumentField,
  type Mismatch,
} from "@/lib/game/dossier";
import { ESCRIVAO_NOME, ESCRIVAO_ROTULO, chooseIn, currentNode, isDialogOver, nodeText, type DialogState, type FalaDita } from "@/lib/game/escrivao";
import { stampAnnouncement, type DeepDive, type TrailOutcome } from "@/lib/game/passport";
import { periodLabel, roomLabel, type RoomSpec } from "@/lib/game/rooms";
import { activityRefs, isResolved, phaseStatus, refKey, refTitle } from "@/lib/game/trail";
import type { DossierSection, GameContent, PhaseProgress, PhaseRef, PhaseSpec } from "@/lib/game/types";
import { comparisonHref, gameHref } from "@/lib/state/links";

import { primaryButton, quietButton, revealInDialog, secondaryButton } from "./Dialog";
import { EscrivaoSays } from "./EscrivaoSays";
import { StampNote, TrailEnd, type StampNotice } from "./Passport";
import { ConceptNote } from "./RecordCard";
import { SourceList } from "./SourceList";

/** O que relacionar uma ficha devolve à tela. */
export interface MatchFeedback {
  certo: boolean;
  divergencias: readonly Mismatch[];
  falas: readonly FalaDita[];
}

/** O que apontar um campo devolve à tela. */
export interface InspectFeedback {
  certo: boolean;
  campo: DocumentField | null;
  concluiu: boolean;
  falas: readonly FalaDita[];
}

/** As ações do dossiê, que a casca aplica ao progresso. */
export interface DossierHandlers {
  onCollect(chave: string): void;
  onRemove(chave: string): void;
  onMatch(fichaId: string, chave: string): MatchFeedback;
  onInspect(fichaId: string, campo: CampoDoDocumento): InspectFeedback;
  /** "Ver a explicação e continuar": conclui a fase pela leitura. */
  onSkip(): void;
  onOpenRecord(referencia: PhaseRef): void;
  onContinue(): void;
  onOpenPassport(): void;
}

/** A conversa com o Escrivão, que a casca guarda enquanto a fase está aberta. */
export interface DialogBinding {
  estado: DialogState;
  onChoose(escolhaId: string): void;
  onRestart(): void;
}

/** O que a casca liga à missão, além das ações comuns a toda fase: o dossiê e a conversa. */
export type DossierBindings = Pick<DossierHandlers, "onCollect" | "onRemove" | "onMatch" | "onInspect"> & { dialogo: DialogBinding };

interface DossierPhaseProps extends DossierHandlers {
  fase: PhaseSpec;
  total: number;
  sala: RoomSpec;
  content: GameContent;
  estado: PhaseProgress;
  proxima: PhaseSpec | null;
  /** Mostra o cabeçalho da fase: em "Ler sem o cenário". */
  cabecalho: boolean;
  falasDaConclusao: readonly FalaDita[];
  carimbo: StampNotice | null;
  desfecho: TrailOutcome | null;
  aprofundamentos: readonly DeepDive[];
  dialogo: DialogBinding;
  /** A parte da sala que o objeto tocado abre: a tela rola até ela. */
  secao: DossierSection | null;
}

/** O que cada campo de um documento quer dizer: rótulos de interface, iguais para todos os documentos. */
const CHAVE_DE_LEITURA: Record<CampoDoDocumento, string> = {
  data: "o dia em que o documento registra a decisão, na precisão do registro.",
  instituicao: "a casa ou o órgão: o Senado, a Presidência da República, a Assembleia Legislativa.",
  cargo: "o cargo pelo qual a pessoa agiu naquela data: senador, presidente da República, deputado estadual.",
  objeto: "o que foi decidido: o texto votado, com a etapa, ou o ato, ou a matéria proposta.",
  acao: "o que a pessoa fez com o objeto: a manifestação registrada no voto, o tipo do ato, a autoria ou a relatoria.",
};

const SECOES: Record<DossierSection, string> = { escrivao: "O Escrivão", quadro: "Chave de leitura", gaveta: "Gaveta", fichas: "Fichas" };

/** O texto de uma ficha, com o trecho destacado marcado. */
function FichaText({ ficha }: { ficha: Parameters<typeof splitHighlight>[0] }) {
  const partes = splitHighlight(ficha);
  return (
    <span className="reading text-base leading-relaxed">
      {partes.antes}
      <mark className="bg-accent-soft px-0.5 font-medium text-ink" data-trecho>
        {partes.trecho}
      </mark>
      {partes.depois}
    </span>
  );
}

/** Os cinco campos de um documento, como uma tabela curta. */
function FieldTable({ campos }: { campos: readonly DocumentField[] }) {
  return (
    <dl className="grid grid-cols-[max-content_minmax(0,1fr)] gap-x-3 gap-y-1 text-sm" data-campos>
      {campos.map((campo) => (
        <div key={campo.campo} className="contents">
          <dt className="text-ink-soft">{campo.rotulo}</dt>
          <dd data-campo={campo.campo}>{campo.valor}</dd>
        </div>
      ))}
    </dl>
  );
}

export function DossierPhase({
  fase,
  total,
  sala,
  content,
  estado,
  proxima,
  cabecalho,
  falasDaConclusao,
  carimbo,
  desfecho,
  aprofundamentos,
  dialogo,
  secao,
  onCollect,
  onRemove,
  onMatch,
  onInspect,
  onSkip,
  onOpenRecord,
  onContinue,
  onOpenPassport,
}: DossierPhaseProps) {
  const atividade = fase.atividade;
  if (atividade.tipo !== "dossie") throw new Error("A atividade desta fase não é um dossiê.");

  const raiz = useRef<HTMLDivElement>(null);
  // O que a última ação em cada ficha mostrou: o erro ou o acerto, com a explicação e a fala do Escrivão.
  const [avisos, setAvisos] = useState<Record<string, { tipo: "certo" | "errado"; texto: string; falas: readonly FalaDita[] }>>({});
  // A pessoa pediu a explicação no lugar de terminar: a solução aparece, e a fase fica concluída pela leitura.
  const [lida, setLida] = useState(false);
  // O documento que a pessoa está arrastando, para a ficha aceitar a soltura.
  const [arrastando, setArrastando] = useState<string | null>(null);
  // O documento aberto na gaveta, para a leitura dos campos.
  const [aberto, setAberto] = useState<string | null>(null);
  // O documento que acabou de entrar no dossiê: a entrada dele bate uma vez.
  const [recemGuardado, setRecemGuardado] = useState<string | null>(null);
  // Depois de uma ação, o foco vai para o próximo passo da ficha, e o resultado fica à vista. Depois de "Ver a explicação e
  // continuar", o botão que tinha o foco deixa de existir: o foco vai para o de continuar, com a explicação à vista.
  const focoPendente = useRef<string | null>(null);
  useEffect(() => {
    const pendente = focoPendente.current;
    const caixa = raiz.current;
    if (pendente === null || caixa === null) return;
    focoPendente.current = null;
    if (pendente === "continuar") {
      caixa.querySelector<HTMLElement>("[data-continuar]")?.focus({ preventScroll: true });
      revealInDialog(caixa.querySelector<HTMLElement>("[data-resultado]"));
      return;
    }
    const ficha = caixa.querySelector<HTMLElement>(`[data-ficha="${pendente}"]`);
    if (ficha === null) return;
    const alvo = ficha.querySelector<HTMLElement>("[data-campo-botao]:not(:disabled), [data-relacionar]:not(:disabled), [data-ficha-conferida]");
    alvo?.focus({ preventScroll: true });
    revealInDialog(ficha.querySelector<HTMLElement>("[data-ficha-aviso]") ?? ficha);
  }, [avisos, estado, lida]);

  // O objeto tocado na sala abre a parte dele: a tela rola até a seção, e o foco vai para o título dela.
  useEffect(() => {
    if (secao === null || raiz.current === null) return;
    const alvo = raiz.current.querySelector<HTMLElement>(`[data-secao="${secao}"]`);
    if (alvo === null) return;
    alvo.querySelector<HTMLElement>("[data-secao-titulo]")?.focus({ preventScroll: true });
    revealInDialog(alvo);
  }, [secao, fase.id]);

  const concluida = estado.concluida !== undefined;
  const dossie = dossierOf(estado);
  const gaveta = drawerDocuments(fase).filter((referencia) => isResolved(referencia, content));
  const noDossie = dossie.recolhidos.filter((chave) => documentOf(chave, content) !== null);
  const resumo = dossierSummary(fase, estado);
  const solucao = dossierSolution(fase, content);
  const conceitos = fase.conceitos.flatMap((id) => (content.conceitos[id] === undefined ? [] : [content.conceitos[id]]));
  const apoio = [...new Map([fase.marco, ...fase.explicacao.flatMap((bloco) => bloco.referencias), ...activityRefs(atividade)].filter((referencia) => referencia.tipo !== "conceito").map((referencia) => [refKey(referencia), referencia] as const)).values()].filter(
    (referencia) => isResolved(referencia, content),
  );
  const noAtual = currentNode(dialogo.estado);
  const conversaAcabou = isDialogOver(dialogo.estado);
  const pediuLeitura = dialogo.estado.marcas.includes("leitura");
  // A explicação aparece com a fase concluída, pela resposta ou pela leitura.
  const mostraExplicacao = concluida;
  const carimboNovo = concluida && (lida || Object.values(avisos).some((aviso) => aviso.tipo === "certo")) ? carimbo : null;
  const rotuloDeContinuar = proxima === null ? "Ver o resumo" : `Continuar: fase ${proxima.numero}`;

  const guardar = (chave: string) => {
    onCollect(chave);
    setRecemGuardado(chave);
  };

  const relacionar = (fichaId: string, chave: string) => {
    const { certo, divergencias, falas } = onMatch(fichaId, chave);
    focoPendente.current = fichaId;
    const ficha = atividade.fichas.find((item) => item.id === fichaId)!;
    setAvisos((atuais) => ({
      ...atuais,
      [fichaId]: certo
        ? { tipo: "certo", texto: `Documento relacionado. Agora aponte, no documento, o campo que sustenta o trecho destacado: "${ficha.destaque.trecho}".`, falas: [] }
        : { tipo: "errado", texto: mismatchSentence(divergencias), falas },
    }));
  };

  const conferir = (fichaId: string, campo: CampoDoDocumento) => {
    const { certo, campo: apontado, falas } = onInspect(fichaId, campo);
    focoPendente.current = fichaId;
    const ficha = atividade.fichas.find((item) => item.id === fichaId)!;
    setAvisos((atuais) => ({
      ...atuais,
      [fichaId]: certo
        ? { tipo: "certo", texto: `Conferida: o campo ${apontado?.rotulo ?? CAMPO_LABELS[campo]} sustenta "${ficha.destaque.trecho}".`, falas: [] }
        : { tipo: "errado", texto: `O campo ${apontado?.rotulo ?? CAMPO_LABELS[campo]} diz: ${apontado?.valor ?? ""}. O trecho destacado fala de outra coisa: tente outro campo.`, falas },
    }));
  };

  const verExplicacao = () => {
    onSkip();
    focoPendente.current = "continuar";
    setLida(true);
  };

  return (
    <div ref={raiz} className="space-y-6" data-fase={fase.id} data-fase-situacao={phaseStatus(estado)} data-missao="dossie">
      {cabecalho && (
        <header className="space-y-1">
          <p className="eyebrow text-ink-soft" data-fase-posicao>
            {roomLabel(sala)} · Fase {fase.numero} de {total} · {periodLabel(fase.periodo)}
          </p>
          <h2 tabIndex={-1} className="font-serif text-3xl font-medium leading-tight tracking-tight" data-fase-titulo>
            {fase.titulo}
          </h2>
        </header>
      )}

      {estado.reaberta === true && (
        <p role="status" className="border border-line-strong bg-notice px-3 py-2 text-sm" data-fase-reaberta>
          O conteúdo desta fase foi corrigido depois da sua resposta, e ela deixou de valer. O resto do que você fez continua guardado.
        </p>
      )}

      <section aria-label="Objetivo" className="space-y-1">
        <p className="text-sm text-ink-soft" data-fase-objetivo>
          Nesta missão: {fase.objetivo}
        </p>
        <p className="numerals text-sm font-medium" data-dossie-andamento>
          {dossierLine(resumo)}
        </p>
      </section>

      {/* 1. O Escrivão: a conversa que abre a missão, com escolhas. Ficção, marcada como tal. */}
      <section aria-labelledby={`escrivao-${fase.id}`} className="space-y-3 border-t border-line pt-5" data-secao="escrivao" data-conversa={conversaAcabou ? "encerrada" : noAtual.id}>
        <h3 id={`escrivao-${fase.id}`} tabIndex={-1} className="eyebrow text-ink-soft" data-secao-titulo>
          1. {SECOES.escrivao} · {ESCRIVAO_ROTULO}
        </h3>
        <ol className="space-y-2 border-l-2 border-ink-faint pl-3" aria-label={`Conversa com o ${ESCRIVAO_NOME}`}>
          {dialogo.estado.visitados.map((id, indice) => {
            const no = id === noAtual.id ? noAtual : null;
            const texto = no === null ? null : nodeText(no, dialogo.estado.marcas);
            // Os nós anteriores ficam como transcrição: o texto deles e a escolha que levou adiante.
            const anterior = no === null ? dialogo.estado.visitados[indice + 1] : undefined;
            return (
              <li key={`${id}-${indice}`} className="space-y-1 text-sm" data-no={id}>
                <p className={indice === dialogo.estado.visitados.length - 1 ? "font-medium" : "text-ink-soft"}>{texto ?? nodeText(currentNode({ ...dialogo.estado, no: id }), dialogo.estado.marcas)}</p>
                {anterior !== undefined && <p className="text-xs italic text-ink-soft">Você: {currentNode({ ...dialogo.estado, no: id }).escolhas.find((escolha) => escolha.proximo === anterior)?.texto}</p>}
              </li>
            );
          })}
        </ol>
        {conversaAcabou ? (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-ink-soft" data-conversa-fim>
              Conversa encerrada. {pediuLeitura ? "Você já tem a chave de leitura." : "A chave de leitura está no quadro, abaixo."}
            </span>
            <button type="button" className={quietButton} onClick={dialogo.onRestart} data-conversa-reiniciar>
              Falar de novo
            </button>
          </div>
        ) : (
          <ul className="flex flex-wrap gap-2" aria-label="O que dizer">
            {noAtual.escolhas.map((escolha) => (
              <li key={escolha.id}>
                <button type="button" className={secondaryButton} onClick={() => dialogo.onChoose(escolha.id)} data-escolha={escolha.id}>
                  {escolha.texto}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 2. A chave de leitura: o quadro na parede. Abre sozinho para quem perguntou ao Escrivão como se lê um documento. */}
      <section aria-labelledby={`quadro-${fase.id}`} className="space-y-2 border-t border-line pt-5" data-secao="quadro">
        <h3 id={`quadro-${fase.id}`} tabIndex={-1} className="eyebrow text-ink-soft" data-secao-titulo>
          2. {SECOES.quadro}
        </h3>
        <details className="border border-line bg-paper text-sm" open={pediuLeitura || secao === "quadro" ? true : undefined} data-chave-de-leitura>
          <summary className="flex min-h-11 cursor-pointer items-center px-3 py-2 font-medium">Os cinco campos de um documento</summary>
          <dl className="space-y-1.5 border-t border-line px-3 py-3">
            {CAMPOS_DO_DOCUMENTO.map((campo) => (
              <div key={campo}>
                <dt className="inline font-medium">{CAMPO_LABELS[campo]}: </dt>
                <dd className="inline text-ink-soft">{CHAVE_DE_LEITURA[campo]}</dd>
              </div>
            ))}
          </dl>
        </details>
        {conceitos.length > 0 && (
          <div className="space-y-2" data-conceitos>
            {conceitos.map((conceito) => (
              <ConceptNote key={conceito.id} conceito={conceito} />
            ))}
          </div>
        )}
      </section>

      {/* 3. A gaveta: os documentos, cada um com os cinco campos, e o botão de guardar no dossiê. */}
      <section aria-labelledby={`gaveta-${fase.id}`} className="space-y-2 border-t border-line pt-5" data-secao="gaveta">
        <h3 id={`gaveta-${fase.id}`} tabIndex={-1} className="eyebrow text-ink-soft" data-secao-titulo>
          3. {SECOES.gaveta} · {gaveta.length} documentos
        </h3>
        <p className="text-sm text-ink-soft">Abra cada documento, leia os campos e guarde no dossiê os que achar úteis. Sobrar documento não é erro.</p>
        <ul className="divide-y divide-line border-y border-line" aria-label="Documentos da gaveta">
          {gaveta.map((referencia) => {
            const chave = refKey(referencia);
            const decisao = content.decisoes[referencia.id]!;
            const guardado = isCollected(estado, chave);
            const estaAberto = aberto === chave;
            return (
              <li key={chave} className="space-y-2 py-2" data-documento={chave} data-guardado={guardado ? "sim" : "nao"} data-aberto={estaAberto ? "sim" : "nao"}>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <span className="min-w-[12rem] flex-1">
                    <span className="numerals font-semibold">{formatDate(decisao.data)} · </span>
                    {decisao.titulo}
                  </span>
                  <button type="button" className={secondaryButton} onClick={() => setAberto(estaAberto ? null : chave)} aria-expanded={estaAberto} data-abrir-documento={chave} aria-label={`${estaAberto ? "Fechar" : "Abrir"}: ${decisao.titulo}`}>
                    {estaAberto ? "Fechar" : "Abrir"}
                  </button>
                </div>
                {estaAberto && (
                  <div className="space-y-3 border border-line bg-paper px-3 py-3" data-documento-aberto={chave}>
                    <FieldTable campos={documentFields(decisao)} />
                    <div className="flex flex-wrap items-center gap-2">
                      {guardado ? (
                        <button type="button" className={quietButton} onClick={() => onRemove(chave)} data-tirar-do-dossie={chave}>
                          Tirar do dossiê
                        </button>
                      ) : (
                        <button type="button" className={primaryButton} onClick={() => guardar(chave)} data-guardar-no-dossie={chave}>
                          Guardar no dossiê
                        </button>
                      )}
                      <button type="button" className={quietButton} onClick={() => onOpenRecord(referencia)} data-abrir-registro={chave}>
                        Ver o registro completo, com as fontes
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* 4. O dossiê e as fichas: relacionar cada ficha ao documento (toque, teclado ou arraste) e apontar o campo. */}
      <section aria-labelledby={`fichas-${fase.id}`} className="space-y-3 border-t border-line pt-5" data-secao="fichas" data-atividade="dossie" data-atividade-situacao={concluida ? "concluida" : "pendente"}>
        <h3 id={`fichas-${fase.id}`} tabIndex={-1} className="eyebrow text-ink-soft" data-secao-titulo>
          4. {SECOES.fichas} e dossiê
        </h3>
        <p className="font-serif text-xl font-medium leading-snug" data-enunciado>
          {atividade.enunciado}
        </p>

        <div className="space-y-1" data-dossie={noDossie.length}>
          <p className="text-sm font-medium">Dossiê · {noDossie.length === 0 ? "vazio" : noDossie.length === 1 ? "1 documento" : `${noDossie.length} documentos`}</p>
          {noDossie.length === 0 ? (
            <p className="text-sm text-ink-soft" data-dossie-vazio>
              Guarde documentos da gaveta para relacioná-los às fichas.
            </p>
          ) : (
            <ul className="flex flex-wrap gap-2" aria-label="Documentos no dossiê">
              {noDossie.map((chave) => {
                const decisao = documentOf(chave, content)!;
                return (
                  <li
                    key={chave}
                    className={`jogo-dossie-item max-w-full border border-line-strong bg-raised px-2 py-1 text-xs ${recemGuardado === chave ? "jogo-dossie-item-novo" : ""} ${arrastando === chave ? "opacity-50" : ""}`}
                    draggable={!concluida}
                    onDragStart={(evento) => {
                      evento.dataTransfer.setData("text/plain", chave);
                      evento.dataTransfer.effectAllowed = "link";
                      setArrastando(chave);
                    }}
                    onDragEnd={() => setArrastando(null)}
                    data-dossie-item={chave}
                  >
                    <span className="numerals font-semibold">{formatDate(decisao.data)}</span> · {decisao.titulo}
                  </li>
                );
              })}
            </ul>
          )}
          {noDossie.length > 0 && !concluida && <p className="text-xs text-ink-soft">Para relacionar: toque na ficha e escolha o documento, ou arraste o documento até a ficha.</p>}
        </div>

        <ol className="space-y-3" aria-label="Fichas">
          {atividade.fichas.map((ficha, indice) => {
            const situacao = fichaStatus(estado, ficha.id);
            const relacionada = dossie.relacionadas[ficha.id];
            const documento = relacionada === undefined ? null : documentOf(relacionada, content);
            const aviso = avisos[ficha.id];
            const resolvida = solucao.find((item) => item.ficha.id === ficha.id)!;
            const mostraSolucao = concluida && situacao !== "conferida";
            return (
              <li
                key={ficha.id}
                className={`space-y-2 border px-3 py-3 ${situacao === "conferida" || mostraSolucao ? "border-ink bg-raised" : arrastando !== null ? "border-accent bg-accent-soft/40" : "border-line bg-paper"}`}
                data-ficha={ficha.id}
                data-ficha-situacao={mostraSolucao ? "lida" : situacao}
                onDragOver={(evento) => {
                  if (concluida || situacao !== "pendente" || arrastando === null) return;
                  evento.preventDefault();
                  evento.dataTransfer.dropEffect = "link";
                }}
                onDrop={(evento) => {
                  if (concluida || situacao !== "pendente") return;
                  const chave = evento.dataTransfer.getData("text/plain") || arrastando;
                  setArrastando(null);
                  if (chave) relacionar(ficha.id, chave);
                }}
              >
                <p className="eyebrow text-ink-soft">
                  Ficha {indice + 1} de {atividade.fichas.length} · {situacao === "conferida" ? "conferida" : situacao === "relacionada" ? "documento relacionado, falta o campo" : mostraSolucao ? "lida pela explicação" : "sem documento"}
                </p>
                <p data-ficha-texto>
                  <FichaText ficha={ficha} />
                </p>

                {/* Relacionar: os documentos do dossiê, como botões. */}
                {situacao === "pendente" && !concluida && (
                  <div className="space-y-1" data-relacionar-com>
                    <p className="text-sm font-medium">Qual documento do dossiê sustenta esta ficha?</p>
                    {noDossie.length === 0 ? (
                      <p className="text-sm text-ink-soft">O dossiê está vazio: guarde documentos da gaveta.</p>
                    ) : (
                      <ul className="space-y-1" aria-label={`Documentos para a ficha ${indice + 1}`}>
                        {noDossie.map((chave) => {
                          const decisao = documentOf(chave, content)!;
                          return (
                            <li key={chave}>
                              <button type="button" className="flex min-h-11 w-full items-center gap-2 border border-line bg-raised px-3 py-1.5 text-left text-sm hover:border-line-strong" onClick={() => relacionar(ficha.id, chave)} data-relacionar={`${ficha.id}:${chave}`}>
                                <span className="numerals shrink-0 font-semibold">{formatDate(decisao.data)}</span>
                                <span className="flex-1">{decisao.titulo}</span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}

                {/* Conferir: os cinco campos do documento relacionado, como botões. */}
                {situacao === "relacionada" && documento !== null && !concluida && (
                  <div className="space-y-1" data-conferir-campo>
                    <p className="text-sm">
                      Documento: <span className="font-medium">{documento.titulo}</span>
                    </p>
                    <p className="text-sm font-medium">
                      Toque no campo que sustenta o trecho destacado: &quot;{ficha.destaque.trecho}&quot;.
                    </p>
                    <ul className="space-y-1" aria-label={`Campos do documento da ficha ${indice + 1}`}>
                      {documentFields(documento).map((campo) => (
                        <li key={campo.campo}>
                          <button type="button" className="flex min-h-11 w-full items-start gap-2 border border-line bg-raised px-3 py-1.5 text-left text-sm hover:border-line-strong" onClick={() => conferir(ficha.id, campo.campo)} data-campo-botao={`${ficha.id}:${campo.campo}`}>
                            <span className="w-20 shrink-0 text-ink-soft">{campo.rotulo}</span>
                            <span className="flex-1">{campo.valor}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Conferida: o carimbo da ficha, com o documento e o campo. */}
                {(situacao === "conferida" || mostraSolucao) && (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm" data-ficha-conferida={mostraSolucao ? "lida" : "conferida"} tabIndex={-1}>
                    <span className={`jogo-ficha-carimbo ${aviso?.tipo === "certo" && situacao === "conferida" ? "jogo-ficha-carimbo-novo" : ""}`} aria-hidden="true">
                      {mostraSolucao ? "LIDA" : "CONFERIDA"}
                    </span>
                    <span>
                      <span className="font-medium">{resolvida.documento?.titulo}</span>
                      {resolvida.campo !== null && (
                        <span className="text-ink-soft">
                          {" "}
                          · campo {resolvida.campo.rotulo}: {resolvida.campo.valor}
                        </span>
                      )}
                    </span>
                  </div>
                )}

                {aviso !== undefined && !mostraSolucao && (
                  <div className={`space-y-1 border px-3 py-2 text-sm ${aviso.tipo === "errado" ? "border-line-strong bg-notice" : "border-ink bg-raised"}`} role="status" data-ficha-aviso={aviso.tipo}>
                    <p>{aviso.texto}</p>
                    {aviso.tipo === "errado" && <EscrivaoSays falas={aviso.falas} evento="erro" anunciar={false} />}
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        {/* O que vem no fim: a explicação, as fontes, o carimbo e o passo seguinte. */}
        {mostraExplicacao && (
          <div className="space-y-3 border border-ink bg-raised px-3 py-3 text-base" data-resultado={lida ? "explicacao" : "concluida"}>
            <div role="status" className="space-y-2" data-resultado-anunciado>
              <p className="font-medium" data-veredito>
                {lida ? "A explicação:" : resumo.conferidas === resumo.totalFichas && Object.keys(avisos).length > 0 ? "Dossiê conferido." : "Você já concluiu esta missão. A explicação:"}
              </p>
              <p data-explicacao-da-resposta>{atividade.explicacao}</p>
            </div>
            <section aria-label="Explicação" className="space-y-2" data-explicacao>
              {fase.explicacao.map((bloco, indice) => (
                <p key={indice} className="reading text-base leading-relaxed" data-bloco={indice}>
                  {bloco.texto}
                </p>
              ))}
              <details className="border border-line bg-paper text-sm" data-fontes-da-fase>
                <summary className="flex min-h-11 cursor-pointer items-center px-3 py-2 font-medium">
                  Ver fontes ({apoio.length === 1 ? "1 registro" : `${apoio.length} registros`})
                </summary>
                <div className="space-y-4 border-t border-line px-3 py-3">
                  <p className="text-xs text-ink-soft">As fichas e a explicação desta missão se apoiam nos registros abaixo, que são os do atlas, com os documentos que os sustentam.</p>
                  {apoio.map((referencia) => (
                    <div key={refKey(referencia)} className="space-y-1.5" data-apoio={refKey(referencia)}>
                      <p className="font-medium">{refTitle(referencia, content)}</p>
                      <SourceList fontes={content.decisoes[referencia.id]?.fontes ?? []} />
                      <button type="button" className={quietButton} onClick={() => onOpenRecord(referencia)} data-abrir-registro={refKey(referencia)}>
                        Abrir este registro
                      </button>
                    </div>
                  ))}
                  <div data-revisao>
                    <ReviewNote editorial={fase.editorial} />
                  </div>
                </div>
              </details>
            </section>
            <StampNote fase={fase} aviso={carimboNovo} onOpenPassport={onOpenPassport} />
            {carimboNovo !== null && <EscrivaoSays falas={carimboNovo.falas} evento="carimbo" anunciar={false} />}
            {carimboNovo === null && falasDaConclusao.length > 0 && <EscrivaoSays falas={falasDaConclusao} evento="conclusao" />}
          </div>
        )}

        <p className="sr-only" role="status" data-anuncio-do-carimbo>
          {carimboNovo === null ? "" : stampAnnouncement(fase.titulo, carimboNovo.confirmacao, carimboNovo.selos)}
        </p>

        {concluida && proxima === null && desfecho !== null && <TrailEnd nome={content.personagem.nome} desfecho={desfecho} aprofundamentos={aprofundamentos} />}
        {concluida && proxima === null && desfecho === null && (
          <section aria-label="A seguir" className="space-y-1 border border-line bg-paper px-3 py-3 text-sm" data-proxima-missao>
            <p className="eyebrow text-ink-soft">A seguir</p>
            <p>A mesma missão existe com os documentos da outra trajetória, pelas mesmas regras. O resumo traz o caminho até ela, até a trajetória e até a comparação.</p>
            <p>
              <Link href={comparisonHref()} prefetch={false} className="inline-flex min-h-11 items-center font-medium underline decoration-line-strong hover:decoration-ink" data-ir-para-comparar>
                Comparar as duas trajetórias
              </Link>
              <span className="text-ink-soft"> · </span>
              <Link href={gameHref(content.personagem.slug)} prefetch={false} className="inline-flex min-h-11 items-center font-medium underline decoration-line-strong hover:decoration-ink" data-ir-para-sala="historico">
                A trajetória de {content.personagem.nome}
              </Link>
            </p>
          </section>
        )}

        <div className="flex flex-wrap items-center justify-end gap-2" data-acoes-da-atividade>
          {!concluida && (
            <button type="button" className={quietButton} onClick={verExplicacao} data-ver-explicacao>
              Ver a explicação e continuar
            </button>
          )}
          {concluida && (
            <button type="button" className={`${primaryButton} gap-1.5`} onClick={onContinue} data-continuar={proxima?.id ?? "resumo"}>
              {rotuloDeContinuar}
              {proxima !== null && <span className="sr-only">, {proxima.titulo}</span>}
              <span aria-hidden="true">→</span>
            </button>
          )}
        </div>
      </section>

      {fase.lacunas.length > 0 && (
        <section aria-labelledby={`lacunas-${fase.id}`} className="space-y-1 border-t border-line pt-5 text-sm" data-lacunas>
          <h3 id={`lacunas-${fase.id}`} className="eyebrow text-ink-soft">
            Ainda não pesquisado nesta edição
          </h3>
          <ul className="list-disc space-y-1 pl-5 text-ink-soft">
            {fase.lacunas.map((lacuna, indice) => (
              <li key={indice}>{lacuna}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

/** Troca a conversa por um passo: serve à casca, que guarda o estado da conversa por fase. */
export function advanceDialog(estado: DialogState, escolhaId: string): DialogState {
  return chooseIn(estado, escolhaId);
}
