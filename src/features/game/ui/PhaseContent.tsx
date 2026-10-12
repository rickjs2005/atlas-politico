"use client";

// Uma fase da trilha, do começo ao fim (D-133): o marco, a explicação curta,
// os termos explicados na primeira vez que aparecem, as fontes, a atividade,
// os outros registros do período e as lacunas. É o mesmo componente na janela
// sobre o cenário e em "Ler sem o cenário": os dois caminhos mostram o mesmo
// conteúdo.
//
// Todo texto vem do conteúdo publicado: a explicação e a atividade são da
// fase; as datas, os títulos e as fontes são dos registros que ela aponta.
// Aqui só há rótulos de interface.

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { ReviewNote } from "@/components/ReviewNote";
import { describePrecision, formatDate } from "@/lib/domain/dates";
import { TEMA_LABELS } from "@/lib/domain/decisions";
import type { FalaDita } from "@/lib/game/escrivao";
import { JUDICIAL_KIND_LABEL, JUDICIAL_NOTICE, judicialOf } from "@/lib/game/judicial";
import { periodLabel, roomLabel, type RoomSpec } from "@/lib/game/rooms";
import { displayOrder, isResolved, orderDates, orderingDisplay, phaseStatus, refDate, refKey, refTitle } from "@/lib/game/trail";
import type { GameContent, GameSource, PhaseProgress, PhaseRef, PhaseSpec } from "@/lib/game/types";
import { comparisonHref } from "@/lib/state/links";

import { primaryButton, quietButton, revealInDialog, secondaryButton } from "./Dialog";
import { EscrivaoSays } from "./EscrivaoSays";
import { ConceptNote } from "./RecordCard";
import { SourceList } from "./SourceList";

/** O que uma resposta devolve à tela: se acertou e o que o Escrivão diz. */
export interface AnswerFeedback {
  certo: boolean;
  falas: readonly FalaDita[];
}

interface PhaseContentProps {
  fase: PhaseSpec;
  /** Quantas fases a sala tem. */
  total: number;
  sala: RoomSpec;
  content: GameContent;
  estado: PhaseProgress;
  /** A fase seguinte da sala, ou `null` na última. */
  proxima: PhaseSpec | null;
  /** Mostra o cabeçalho da fase (posição, período, título): em "Ler sem o cenário". Na janela, o cabeçalho é o dela. */
  cabecalho: boolean;
  /** O que o Escrivão diz da conclusão desta fase, quando ela acabou de ser concluída. */
  falasDaConclusao: readonly FalaDita[];
  onAnswerQuestion(opcaoId: string): AnswerFeedback;
  onAnswerOrder(chaves: readonly string[]): AnswerFeedback;
  /** "Ver a explicação e continuar": conclui a fase sem resposta. */
  onSkip(): void;
  /** Abre um registro do período, opcional. */
  onOpenRecord(referencia: PhaseRef): void;
  /** Vai à fase seguinte, ou ao resumo na última. */
  onContinue(): void;
}

/** As fontes do registro apontado, como ele as cita. */
function sourcesOfRef(referencia: PhaseRef, content: GameContent): readonly GameSource[] {
  const { tipo, id } = referencia;
  if (tipo === "acontecimento") return content.registros[id]?.fontes ?? [];
  if (tipo === "decisao") return content.decisoes[id]?.fontes ?? [];
  if (tipo === "fato") return content.fatos[id]?.fontes ?? [];
  if (tipo === "conceito") return content.conceitos[id]?.fontes ?? [];
  if (tipo === "proposta") return content.propostas[id]?.fontes ?? [];
  return content.posicoes[id]?.fontes ?? [];
}

/** Quando foi, por extenso: a data do registro, ou o período do cargo. */
function whenOfRef(referencia: PhaseRef, content: GameContent): string | null {
  const data = refDate(referencia, content);
  if (data !== null) return formatDate(data);
  if (referencia.tipo === "fato" && content.fatos[referencia.id] !== undefined) return "sem data documentada";
  if (referencia.tipo === "proposta") {
    const proposta = content.propostas[referencia.id];
    return proposta === undefined ? null : `eleição de ${proposta.eleicao}`;
  }
  return content.posicoes[referencia.id]?.periodo ?? null;
}

const NATUREZA: Record<PhaseRef["tipo"], string> = {
  acontecimento: "acontecimento da trajetória",
  decisao: "decisão documentada",
  fato: "registro biográfico",
  mandato: "cargo ou função",
  filiacao: "filiação partidária",
  proposta: "proposta registrada no TSE",
  conceito: "termo explicado",
};

/**
 * O que ajuda a reconhecer uma decisão antes de abri-la: as áreas em que o
 * atlas a classifica e, quando há, a ementa da proposição a que ela se refere,
 * com a identificação dela. Tudo vem do registro publicado. A atuação
 * legislativa já diz o assunto no título, e não repete a ementa.
 */
function decisionHint(referencia: PhaseRef, content: GameContent): { temas: string | null; assunto: string | null } | null {
  if (referencia.tipo !== "decisao") return null;
  const decisao = content.decisoes[referencia.id];
  if (decisao === undefined) return null;
  const temas = decisao.temas.length === 0 ? null : decisao.temas.map((tema) => TEMA_LABELS[tema]).join(", ");
  const proposicao = decisao.natureza === "atuacao" ? undefined : decisao.proposicoes[0];
  return { temas, assunto: proposicao === undefined ? null : `${proposicao.identificacao}: ${proposicao.ementa}` };
}

/** As áreas de uma decisão, na linha do título dela. */
function DecisionAreas({ referencia, content }: { referencia: PhaseRef; content: GameContent }) {
  const dica = decisionHint(referencia, content);
  return dica === null || dica.temas === null ? null : <span data-areas> · {dica.temas}</span>;
}

/** A ementa da proposição de uma decisão, em uma linha própria, curta: o texto inteiro está no registro. */
function DecisionSubject({ referencia, content }: { referencia: PhaseRef; content: GameContent }) {
  const dica = decisionHint(referencia, content);
  return dica === null || dica.assunto === null ? null : (
    <span className="mt-0.5 line-clamp-3 block text-xs text-ink-soft" data-assunto>
      {dica.assunto}
    </span>
  );
}

/** Os registros que sustentam a explicação e a atividade, sem repetição e sem os conceitos (que têm a própria caixa). */
function supportingRefs(fase: PhaseSpec): PhaseRef[] {
  const vistos = new Set<string>();
  const lista: PhaseRef[] = [];
  const todos = [fase.marco, ...fase.explicacao.flatMap((bloco) => bloco.referencias), ...(fase.atividade.tipo === "pergunta" ? fase.atividade.referencias : fase.atividade.itens)];
  for (const referencia of todos) {
    if (referencia.tipo === "conceito" || vistos.has(refKey(referencia))) continue;
    vistos.add(refKey(referencia));
    lista.push(referencia);
  }
  return lista;
}

export function PhaseContent({ fase, total, sala, content, estado, proxima, cabecalho, falasDaConclusao, onAnswerQuestion, onAnswerOrder, onSkip, onOpenRecord, onContinue }: PhaseContentProps) {
  const [escolha, setEscolha] = useState<string | null>(null);
  const [ordem, setOrdem] = useState<readonly string[]>([]);
  // O que a última ação desta visita mostrou: nada, um erro, um acerto ou a explicação lida no lugar da resposta.
  const [resultado, setResultado] = useState<{ tipo: "certo" | "errado" | "explicacao"; falas: readonly FalaDita[] } | null>(null);

  // Responder, pedir a explicação ou tentar de novo troca os botões da atividade: o que tinha o foco deixa de existir.
  // O foco vai para o próximo passo (continuar, tentar de novo ou, na nova tentativa, a primeira opção), e o resultado
  // fica à vista. Sem isso o foco cairia fora da janela, e o teclado perderia o lugar.
  const secaoDaAtividade = useRef<HTMLElement>(null);
  const focoPendente = useRef(false);
  useEffect(() => {
    if (!focoPendente.current) return;
    focoPendente.current = false;
    const secao = secaoDaAtividade.current;
    if (secao === null) return;
    const alvo =
      secao.querySelector<HTMLElement>("[data-continuar], [data-tentar-de-novo]") ?? secao.querySelector<HTMLElement>("[data-opcao]:not(:disabled), [data-ordem-item]:not(:disabled)");
    alvo?.focus({ preventScroll: true });
    revealInDialog(alvo ?? null);
    revealInDialog(secao.querySelector<HTMLElement>("[data-resultado]"));
  }, [resultado]);

  const { atividade } = fase;
  const concluida = estado.concluida !== undefined;
  const apoio = supportingRefs(fase).filter((referencia) => isResolved(referencia, content));
  const explorar = fase.explorar.filter((referencia) => isResolved(referencia, content));
  const conceitos = fase.conceitos.flatMap((id) => (content.conceitos[id] === undefined ? [] : [content.conceitos[id]]));
  const marcoTitulo = refTitle(fase.marco, content);
  const marcoData = refDate(fase.marco, content);
  const marcoQuando = whenOfRef(fase.marco, content);
  const judicial = fase.marco.tipo === "acontecimento" ? judicialOf(fase.marco.id) : null;
  const divergencia = fase.marco.tipo === "fato" ? (content.fatos[fase.marco.id]?.divergencia ?? null) : null;
  const rotuloDeContinuar = proxima === null ? "Ver o resumo" : `Continuar: fase ${proxima.numero}`;
  // A explicação da resposta aparece depois de responder, de pedir a explicação, ou em uma fase já concluída.
  const mostraExplicacao = resultado !== null || concluida;

  const responder = () => {
    if (atividade.tipo === "pergunta") {
      if (escolha === null) return;
      const { certo, falas } = onAnswerQuestion(escolha);
      focoPendente.current = true;
      setResultado({ tipo: certo ? "certo" : "errado", falas });
    } else {
      if (ordem.length !== atividade.itens.length) return;
      const { certo, falas } = onAnswerOrder(ordem);
      focoPendente.current = true;
      setResultado({ tipo: certo ? "certo" : "errado", falas });
    }
  };
  const tentarDeNovo = () => {
    focoPendente.current = true;
    setEscolha(null);
    setOrdem([]);
    setResultado(null);
  };
  const verExplicacao = () => {
    onSkip();
    focoPendente.current = true;
    setResultado({ tipo: "explicacao", falas: [] });
  };
  // Depois de um erro, a explicação já está à vista: seguir conclui a fase pela leitura. Na leitura sem o cenário, a última
  // fase continua na página quando o resumo abre: o veredito passa a ser o da explicação lida, e não o do erro.
  const seguirDepoisDoErro = () => {
    onSkip();
    setResultado({ tipo: "explicacao", falas: [] });
    onContinue();
  };
  const alternarOrdem = (chave: string) => setOrdem((atual) => (atual.includes(chave) ? atual.filter((item) => item !== chave) : [...atual, chave]));

  const respondendo = !concluida && resultado === null;

  return (
    <div className="space-y-6" data-fase={fase.id} data-fase-situacao={phaseStatus(estado)}>
      {cabecalho && (
        <header className="space-y-1">
          <p className="eyebrow text-ink-soft" data-fase-posicao>
            {roomLabel(sala)} · Fase {fase.numero} de {total} · {periodLabel(fase.periodo)}
          </p>
          {/* O título recebe o foco quando a pessoa muda de fase na leitura sem o cenário: é de onde a leitura recomeça. */}
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
      {estado.anterior === true && !concluida && (
        <p role="status" className="border border-line bg-paper px-3 py-2 text-sm" data-fase-anterior>
          Você já passou por este período em uma versão anterior do jogo. A explicação e a atividade desta fase são novas.
        </p>
      )}

      <section aria-label="Explicação" className="space-y-3" data-explicacao>
        <p className="text-sm text-ink-soft" data-fase-objetivo>
          Nesta fase: {fase.objetivo}
        </p>
        {marcoTitulo !== null && (
          <div className="border-l-4 border-accent bg-paper px-3 py-2" data-marco={refKey(fase.marco)}>
            <p className="eyebrow text-ink-soft">Marco da fase · {NATUREZA[fase.marco.tipo]}</p>
            <p className="font-serif text-lg font-medium leading-snug">{marcoTitulo}</p>
            {marcoQuando !== null && (
              <p className="numerals text-sm text-ink-soft">
                {marcoQuando}
                {marcoData !== null && divergencia === null && describePrecision(marcoData) !== null && <span className="italic"> · {describePrecision(marcoData)}</span>}
              </p>
            )}
          </div>
        )}
        {fase.explicacao.map((bloco, indice) => (
          <p key={indice} className="reading text-base leading-relaxed md:text-lg" data-bloco={indice}>
            {bloco.texto}
          </p>
        ))}
        {divergencia !== null && (
          <details className="border border-line bg-paper text-sm" data-divergencia>
            <summary className="flex min-h-11 cursor-pointer items-center px-3 py-2 font-medium">Os documentos divergem neste ponto. Ver o que cada um diz</summary>
            <p className="border-t border-line px-3 py-3" data-divergencia-texto>
              {divergencia}
            </p>
          </details>
        )}
        {judicial !== null && (
          <div className="space-y-1 border-l-2 border-ink-faint pl-3 text-sm" data-ficha-judicial={judicial.natureza}>
            <p className="font-medium" data-natureza>
              {JUDICIAL_KIND_LABEL[judicial.natureza]}
            </p>
            <p className="text-xs text-ink-soft" data-aviso-judicial>
              {JUDICIAL_NOTICE}
            </p>
          </div>
        )}
        {conceitos.length > 0 && (
          <div className="space-y-2" data-conceitos>
            {conceitos.map((conceito) => (
              <ConceptNote key={conceito.id} conceito={conceito} />
            ))}
          </div>
        )}
        <details className="border border-line bg-paper text-sm" data-fontes-da-fase>
          <summary className="flex min-h-11 cursor-pointer items-center px-3 py-2 font-medium">
            Ver fontes ({apoio.length === 1 ? "1 registro" : `${apoio.length} registros`})
          </summary>
          <div className="space-y-4 border-t border-line px-3 py-3">
            <p className="text-xs text-ink-soft">
              O texto desta fase é uma explicação escrita para o jogo. Cada parte dele se apoia nos registros abaixo, que são os do atlas, com os
              documentos que os sustentam.
            </p>
            {apoio.map((referencia) => (
              <div key={refKey(referencia)} className="space-y-1.5" data-apoio={refKey(referencia)}>
                <p className="font-medium">
                  {refTitle(referencia, content)}
                  <span className="font-normal text-ink-soft">
                    {" "}
                    · {NATUREZA[referencia.tipo]}
                    {whenOfRef(referencia, content) !== null && ` · ${whenOfRef(referencia, content)}`}
                  </span>
                </p>
                <SourceList fontes={sourcesOfRef(referencia, content)} />
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

      <section ref={secaoDaAtividade} aria-label="Atividade" className="space-y-3 border-t border-line pt-5" data-atividade={atividade.tipo} data-atividade-situacao={concluida ? "concluida" : "pendente"}>
        <h3 className="eyebrow text-ink-soft">Atividade</h3>
        <p className="font-serif text-xl font-medium leading-snug" data-enunciado>
          {atividade.enunciado}
        </p>

        {atividade.tipo === "pergunta" ? (
          <ul className="space-y-2" aria-label="Opções">
            {displayOrder(fase.id, atividade.opcoes, (opcao) => opcao.id).map((opcao) => {
              const escolhida = escolha === opcao.id;
              // A opção certa fica marcada quando a pessoa acertou, pediu a explicação ou já concluiu a fase. Depois de um
              // erro, não: a explicação curta aparece, e a nova tentativa continua sendo uma tentativa.
              const certa = mostraExplicacao && resultado?.tipo !== "errado" && opcao.id === atividade.correta;
              return (
                <li key={opcao.id}>
                  <button
                    type="button"
                    className={`flex min-h-12 w-full items-center border px-3 py-2 text-left text-base ${
                      certa ? "border-ink bg-raised font-medium" : escolhida ? "border-accent bg-accent-soft font-medium" : "border-line bg-paper hover:border-line-strong"
                    }`}
                    aria-pressed={escolhida}
                    disabled={!respondendo}
                    onClick={() => setEscolha(opcao.id)}
                    data-opcao={opcao.id}
                    data-certa={certa ? "sim" : undefined}
                  >
                    <span className="flex-1">{opcao.texto}</span>
                    {certa && <span className="eyebrow ml-3 shrink-0 text-ink-soft">resposta certa</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <>
            <p className="text-sm text-ink-soft">Toque nos registros na ordem em que aconteceram, do mais antigo para o mais recente.</p>
            <ul className="space-y-2" aria-label="Registros a ordenar">
              {orderingDisplay(fase, content).map((item) => {
                const chave = refKey(item);
                const posicao = ordem.indexOf(chave);
                return (
                  <li key={chave}>
                    <button
                      type="button"
                      className={`flex min-h-12 w-full items-center gap-3 border px-3 py-2 text-left text-base ${posicao >= 0 ? "border-accent bg-accent-soft font-medium" : "border-line bg-paper hover:border-line-strong"}`}
                      aria-pressed={posicao >= 0}
                      disabled={!respondendo}
                      onClick={() => alternarOrdem(chave)}
                      data-ordem-item={chave}
                      data-ordem-posicao={posicao >= 0 ? posicao + 1 : undefined}
                    >
                      <span className="numerals w-8 shrink-0 text-sm font-semibold" aria-hidden="true">
                        {posicao >= 0 ? `${posicao + 1}º` : ""}
                      </span>
                      <span className="flex-1">{refTitle(item, content)}</span>
                      {posicao >= 0 && <span className="sr-only">, posição {posicao + 1}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {mostraExplicacao && (
          <div
            role="status"
            className={`space-y-2 border px-3 py-3 text-base ${resultado?.tipo === "errado" ? "border-line-strong bg-notice" : "border-ink bg-raised"}`}
            data-resultado={resultado?.tipo ?? "concluida"}
          >
            <p className="font-medium" data-veredito>
              {resultado?.tipo === "certo" ? "Certo." : resultado?.tipo === "errado" ? "Ainda não." : resultado?.tipo === "explicacao" ? "A explicação:" : "Você já concluiu esta fase. A explicação:"}
            </p>
            <p data-explicacao-da-resposta>{atividade.explicacao}</p>
            {atividade.tipo === "ordem" && (
              <ol className="space-y-0.5 text-sm" data-ordem-certa>
                {orderDates(atividade, content).map((item) => (
                  <li key={item.chave}>
                    <span className="numerals font-semibold">{item.data}</span> · {item.titulo}
                  </li>
                ))}
              </ol>
            )}
            {resultado?.tipo === "errado" && <EscrivaoSays falas={resultado.falas} evento="erro" />}
            {resultado?.tipo !== "errado" && falasDaConclusao.length > 0 && <EscrivaoSays falas={falasDaConclusao} evento="conclusao" />}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-2" data-acoes-da-atividade>
          {respondendo && (
            <>
              <button type="button" className={quietButton} onClick={verExplicacao} data-ver-explicacao>
                Ver a explicação e continuar
              </button>
              <button
                type="button"
                className={`${primaryButton} disabled:cursor-not-allowed disabled:opacity-40`}
                onClick={responder}
                disabled={atividade.tipo === "pergunta" ? escolha === null : ordem.length !== atividade.itens.length}
                data-responder
              >
                {atividade.tipo === "pergunta" ? "Responder" : "Confirmar a ordem"}
              </button>
            </>
          )}
          {resultado?.tipo === "errado" && !concluida && (
            <>
              <button type="button" className={secondaryButton} onClick={seguirDepoisDoErro} data-seguir-sem-responder>
                {rotuloDeContinuar}
              </button>
              <button type="button" className={primaryButton} onClick={tentarDeNovo} data-tentar-de-novo>
                Tentar de novo
              </button>
            </>
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

      {explorar.length > 0 && (
        <section aria-labelledby={`explorar-${fase.id}`} className="space-y-2 border-t border-line pt-5" data-explorar>
          <h3 id={`explorar-${fase.id}`} className="eyebrow text-ink-soft">
            Explorar este período · opcional
          </h3>
          <p className="text-sm text-ink-soft">Outros registros do atlas neste período. Nenhum é necessário para continuar.</p>
          {explorar.some((referencia) => referencia.tipo === "proposta") && (
            <p className="text-sm text-ink-soft" data-aviso-de-proposta>
              As propostas vêm do documento que a candidatura registrou no TSE: dizem o que o documento propõe, e não o que foi feito.
            </p>
          )}
          <ul className="divide-y divide-line border-y border-line">
            {explorar.map((referencia) => (
              <li key={refKey(referencia)} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm">
                <span className="min-w-[12rem] flex-1">
                  {whenOfRef(referencia, content) !== null && <span className="numerals font-semibold">{whenOfRef(referencia, content)} · </span>}
                  {refTitle(referencia, content)}
                  <span className="text-ink-soft">
                    {" "}
                    · {NATUREZA[referencia.tipo]}
                    <DecisionAreas referencia={referencia} content={content} />
                  </span>
                  <DecisionSubject referencia={referencia} content={content} />
                </span>
                <button type="button" className={secondaryButton} onClick={() => onOpenRecord(referencia)} data-abrir-registro={refKey(referencia)} aria-label={`Abrir: ${refTitle(referencia, content)}`}>
                  Abrir
                </button>
              </li>
            ))}
          </ul>
          {explorar.some((referencia) => referencia.tipo === "proposta") && (
            <p className="text-sm">
              <Link href={`${comparisonHref()}#propostas`} prefetch={false} className="inline-flex min-h-11 items-center font-medium underline decoration-line-strong hover:decoration-ink" data-todas-as-propostas>
                Ver as propostas que o atlas registra, por área, das duas candidaturas
                <span aria-hidden="true">&nbsp;→</span>
              </Link>
            </p>
          )}
        </section>
      )}

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
