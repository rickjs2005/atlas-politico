"use client";

// Painel de capítulos e tarefas: o caminho sem o canvas. Lista os capítulos
// da sala com a situação de cada um e, para o capítulo aberto, o objetivo, os
// registros (acontecimentos e decisões) e as ações da tarefa, todas por
// botão: recolher, ler de novo o que já foi recolhido, responder (ordem,
// documento, lugar ou decisão), atravessar a saída. É o mesmo progresso da
// cena, com a mesma regra: a saída abre com todos os registros recolhidos e a
// tarefa cumprida. Traz também as preferências (o humor do Escrivão) e os
// caminhos para as outras salas.

import Link from "next/link";

import { formatDate, yearOf } from "@/lib/domain/dates";
import { ESCRIVAO_NOME } from "@/lib/game/escrivao";
import { isAnswerPending, isTaskDone, missingRecords, recordIds, requiredRecords } from "@/lib/game/mission";
import type { RoomSpec } from "@/lib/game/rooms";
import { getScene } from "@/lib/game/scenes";
import { EPOCA_LABEL, type ChapterSpec, type ChapterStatus, type GameContent, type PlayerProgress } from "@/lib/game/types";
import { chapterStatus, taskStateOf } from "@/lib/game/progress";
import { explorationHref, gameHref } from "@/lib/state/links";

import { Dialog, primaryButton, quietButton, secondaryButton } from "./Dialog";
import { EXIT_RULE, collectedSentence, exitOpen, missingLabel, type ExitState } from "./saida";
import { TASK_TYPE_LABEL, answerLabel, pendingSentence } from "./tarefa";

const STATUS_LABEL: Record<ChapterStatus, string> = {
  bloqueado: "bloqueado",
  disponivel: "disponível",
  concluido: "concluído",
};

interface ChapterPanelProps {
  content: GameContent;
  /** A sala aberta e os capítulos dela. */
  sala: RoomSpec;
  capitulos: readonly ChapterSpec[];
  /** As outras salas do personagem, com capítulos. */
  outrasSalas: readonly RoomSpec[];
  progresso: PlayerProgress;
  aberto: ChapterSpec;
  duravel: boolean;
  /** O humor do Escrivão está ligado. */
  humor: boolean;
  onToggleHumor(): void;
  onCollect(id: string): void;
  /** Abre de novo um registro já recolhido, sem mexer no progresso. */
  onRead(id: string): void;
  /** O registro que acabou de ser relido: na volta, o foco fica no botão dele, e não no rodapé. */
  focoEm: string | null;
  /** Abre a resposta da tarefa (ordem, documento, lugar ou decisão). */
  onAnswer(): void;
  onCrossExit(): void;
  onOpenChapter(id: string): void;
  onReset(): void;
  onClose(): void;
}

export function ChapterPanel({
  content,
  sala,
  capitulos,
  outrasSalas,
  progresso,
  aberto,
  duravel,
  humor,
  onToggleHumor,
  onCollect,
  onRead,
  focoEm,
  onAnswer,
  onCrossExit,
  onOpenChapter,
  onReset,
  onClose,
}: ChapterPanelProps) {
  const tarefa = taskStateOf(progresso, aberto.id);
  const concluida = isTaskDone(aberto.tarefa, tarefa);
  const exigidos = requiredRecords(aberto.tarefa);
  const respostaPendente = isAnswerPending(aberto.tarefa, tarefa);
  const ids = recordIds(aberto);
  const saida: ExitState = { tarefaConcluida: concluida, faltam: missingRecords(aberto, tarefa).length, total: ids.length };
  const saidaAberta = exitOpen(saida);
  // Na volta de uma releitura, o foco vai para o botão do registro lido, que continua na lista.
  const focoNoRegistro = focoEm !== null && ids.includes(focoEm) && tarefa.recolhidos.includes(focoEm);
  const cena = getScene(aberto.cena);
  const statusAberto = chapterStatus(progresso, aberto.id);
  const periodo = (capitulo: ChapterSpec) => (capitulo.periodo.de === capitulo.periodo.ate ? `${capitulo.periodo.de}` : `${capitulo.periodo.de}–${capitulo.periodo.ate}`);

  return (
    <Dialog
      nome="painel"
      eyebrow={`${content.personagem.nome} · Sala ${sala.nome}`}
      titulo="Capítulos e tarefas"
      tamanho="largo"
      onClose={onClose}
      acoes={
        <>
          <button type="button" className={quietButton} onClick={onReset} data-reiniciar>
            Reiniciar o progresso
          </button>
          <button type="button" className={primaryButton} onClick={onClose} {...(focoNoRegistro ? {} : { "data-foco-inicial": true })}>
            Voltar ao jogo
          </button>
        </>
      }
    >
      <div className="space-y-6">
        <section aria-labelledby="painel-capitulos" className="space-y-2">
          <h3 id="painel-capitulos" className="eyebrow text-ink-soft">
            Capítulos da sala {sala.nome}
          </h3>
          <ol className="divide-y divide-line border-y border-line">
            {capitulos.map((capitulo) => {
              const status = chapterStatus(progresso, capitulo.id);
              const atual = capitulo.id === aberto.id;
              return (
                <li key={capitulo.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2 text-sm" data-capitulo-item={capitulo.id} data-status={status}>
                  <span className="numerals w-6 font-semibold">{capitulo.numero}</span>
                  <span className="flex-1">
                    <span className={atual ? "font-semibold" : "font-medium"}>{capitulo.titulo}</span>
                    <span className="numerals text-ink-soft"> · {periodo(capitulo)}</span>
                    <span className="text-ink-soft"> · {TASK_TYPE_LABEL[capitulo.tarefa.tipo]}</span>
                  </span>
                  <span className="eyebrow text-ink-soft">{STATUS_LABEL[status]}</span>
                  {!atual && status !== "bloqueado" && (
                    <button type="button" className={quietButton} onClick={() => onOpenChapter(capitulo.id)} data-abrir-capitulo={capitulo.id}>
                      {status === "concluido" ? "Rever" : "Continuar"}
                    </button>
                  )}
                </li>
              );
            })}
          </ol>
        </section>

        <section aria-labelledby="painel-tarefa" className="space-y-3">
          <div className="space-y-1">
            <h3 id="painel-tarefa" className="eyebrow text-ink-soft">
              Capítulo {aberto.numero} · {periodo(aberto)} · cenário: {cena.nome} · {EPOCA_LABEL[aberto.epoca]}
            </h3>
            <p className="font-serif text-xl font-medium leading-snug">{aberto.titulo}</p>
            <p className="reading text-base">{aberto.objetivo}</p>
            <p className="text-sm text-ink-soft">{aberto.motivo}</p>
          </div>
          <p className="text-sm" data-tarefa-situacao={concluida ? "concluida" : "pendente"} data-saida-situacao={saidaAberta ? "aberta" : "fechada"}>
            {saidaAberta
              ? "Tarefa concluída e registros recolhidos. A saída está aberta."
              : concluida
                ? `Tarefa concluída. ${missingLabel(saida.faltam)} para a saída abrir.`
                : respostaPendente
                  ? pendingSentence(aberto.tarefa.tipo)
                  : "Tarefa pendente."}
          </p>
          <p className="text-sm text-ink-soft" data-regra-da-saida data-registros={`${saida.total - saida.faltam}/${saida.total}`}>
            {collectedSentence(saida)}
            {!saidaAberta && ` ${EXIT_RULE}`}
          </p>
          <ul className="divide-y divide-line border-y border-line">
            {ids.map((id, indice) => {
              const registro = content.registros[id];
              const decisao = content.decisoes[id];
              const documento = registro ?? decisao;
              const posicao = cena.registros[indice];
              if (documento === undefined) return null;
              const recolhido = tarefa.recolhidos.includes(id);
              const exigido = exigidos.includes(id);
              return (
                <li
                  key={id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2 text-sm"
                  data-registro={id}
                  data-natureza={registro !== undefined ? "acontecimento" : "decisao"}
                  data-recolhido={recolhido ? "sim" : "nao"}
                  data-x={posicao?.x}
                  data-y={posicao?.y}
                >
                  {/* Em tela estreita, o texto fica com a linha inteira e a ação desce para a de baixo. */}
                  <span className="min-w-[13rem] flex-1">
                    <span className="numerals font-semibold">{formatDate(documento.data)}</span> · {documento.titulo}
                    {decisao !== undefined && <span className="text-ink-soft"> · {decisao.natureza === "voto" ? "voto parlamentar" : "ato do Executivo"}</span>}
                    {exigido && <span className="text-ink-soft"> · pedido pela tarefa</span>}
                    {registro?.ordemEmAberto && (
                      <span className="block text-xs italic text-ink-soft" data-ordem-em-aberto>
                        ordem dentro de {yearOf(registro.data)} não documentada
                      </span>
                    )}
                  </span>
                  {recolhido ? (
                    <span className="flex items-center gap-2">
                      <span className="eyebrow text-ink-soft">recolhido</span>
                      {/* Com tudo recolhido, é por aqui que se relê um registro e se chega à ficha dele. */}
                      <button
                        type="button"
                        className={quietButton}
                        onClick={() => onRead(id)}
                        data-ler={id}
                        // Há um botão destes por registro: o nome diz qual, começando pelo texto que se vê.
                        aria-label={`Ler de novo: ${documento.titulo}`}
                        {...(focoNoRegistro && focoEm === id ? { "data-foco-inicial": true } : {})}
                      >
                        Ler de novo
                      </button>
                    </span>
                  ) : statusAberto === "bloqueado" ? (
                    <span className="eyebrow text-ink-soft">no cenário</span>
                  ) : (
                    <button type="button" className={secondaryButton} onClick={() => onCollect(id)} data-recolher={id} aria-label={`Recolher pelo painel: ${documento.titulo}`}>
                      Recolher pelo painel
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="flex flex-wrap gap-2">
            {respostaPendente && (
              <button type="button" className={secondaryButton} onClick={onAnswer} data-responder-tarefa={aberto.tarefa.tipo}>
                {answerLabel(aberto.tarefa.tipo)}
              </button>
            )}
            {saidaAberta && (
              <button type="button" className={secondaryButton} onClick={onCrossExit} data-atravessar-saida>
                Atravessar a saída
              </button>
            )}
          </div>
          <p className="text-xs text-ink-soft" data-guia-x={cena.guia.x} data-guia-y={cena.guia.y} data-saida-x={cena.saida.x} data-saida-y={cena.saida.y} data-spawn-x={cena.spawn.x} data-spawn-y={cena.spawn.y}>
            No cenário: as setas ou WASD movem o personagem; E, Enter ou espaço interagem com o que está ao alcance. Esc fecha
            esta janela.
          </p>
        </section>

        <section aria-labelledby="painel-preferencias" className="space-y-2 text-sm">
          <h3 id="painel-preferencias" className="eyebrow text-ink-soft">
            Preferências
          </h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="flex-1 min-w-[14rem]" id="painel-humor-descricao">
              O {ESCRIVAO_NOME}, guia fictício, faz falas de humor sobre papelada e sobre ele mesmo, iguais para os dois personagens. Elas são ficção, marcadas
              como tal, e podem ser desligadas; a instrução e o que vem dos registros continuam.
            </p>
            <button type="button" className={secondaryButton} onClick={onToggleHumor} aria-pressed={humor} aria-describedby="painel-humor-descricao" data-humor={humor ? "ligado" : "desligado"}>
              {humor ? "Desligar o humor" : "Ligar o humor"}
            </button>
          </div>
        </section>

        <section aria-labelledby="painel-progresso" className="space-y-1 text-sm">
          <h3 id="painel-progresso" className="eyebrow text-ink-soft">
            Progresso e outras salas
          </h3>
          <p data-progresso-duravel={duravel ? "sim" : "nao"}>
            {duravel
              ? "O progresso fica guardado neste navegador, separado por personagem e por sala. Abrir um link direto não altera o progresso."
              : "O armazenamento do navegador está indisponível: o progresso vale enquanto esta página estiver aberta, e se perde ao recarregar ou fechar."}
          </p>
          {outrasSalas.length > 0 && (
            <ul className="space-y-1" aria-label="Outras salas deste personagem">
              {outrasSalas.map((outra) => (
                <li key={outra.id}>
                  <Link href={gameHref(content.personagem.slug, outra.id)} prefetch={false} className="font-medium underline decoration-line-strong hover:decoration-ink" data-ir-para-sala={outra.id}>
                    Sala {outra.nome}
                  </Link>
                  <span className="text-ink-soft"> · {outra.descricao}</span>
                </li>
              ))}
            </ul>
          )}
          <p>
            <Link
              href={explorationHref(content.personagem.slug, { periodo: { de: null, ate: null }, categorias: [], acontecimento: null })}
              prefetch={false}
              className="font-medium underline decoration-line-strong hover:decoration-ink"
            >
              Ver a trajetória de {content.personagem.nome} no atlas, com todos os registros
            </Link>
          </p>
          <p>
            <Link href={gameHref()} prefetch={false} className="font-medium underline decoration-line-strong hover:decoration-ink">
              Escolher outro personagem
            </Link>
          </p>
        </section>
      </div>
    </Dialog>
  );
}
