"use client";

// Painel de capítulos e tarefas: o caminho sem o canvas. Lista os capítulos
// com a situação de cada um e, para o capítulo aberto, o objetivo, os
// registros e as ações da tarefa, todas por botão: recolher, ler de novo o
// que já foi recolhido, ordenar, atravessar a saída. É o mesmo progresso da
// cena, com a mesma regra: a saída abre com todos os registros recolhidos e
// a tarefa cumprida.

import Link from "next/link";

import { formatDate, yearOf } from "@/lib/domain/dates";
import { isTaskDone, missingRecords, requiredRecords } from "@/lib/game/mission";
import { getScene } from "@/lib/game/scenes";
import type { ChapterSpec, ChapterStatus, GameContent, PlayerProgress } from "@/lib/game/types";
import { chapterStatus, taskStateOf } from "@/lib/game/progress";
import { explorationHref, gameHref } from "@/lib/state/links";

import { Dialog, primaryButton, quietButton, secondaryButton } from "./Dialog";
import { EXIT_RULE, collectedSentence, exitOpen, missingLabel, type ExitState } from "./saida";

const STATUS_LABEL: Record<ChapterStatus, string> = {
  bloqueado: "bloqueado",
  disponivel: "disponível",
  concluido: "concluído",
};

interface ChapterPanelProps {
  content: GameContent;
  capitulos: readonly ChapterSpec[];
  progresso: PlayerProgress;
  aberto: ChapterSpec;
  duravel: boolean;
  onCollect(eventId: string): void;
  /** Abre de novo um registro já recolhido, sem mexer no progresso. */
  onRead(eventId: string): void;
  /** O registro que acabou de ser relido: na volta, o foco fica no botão dele, e não no rodapé. */
  focoEm: string | null;
  onAnswerOrder(): void;
  onCrossExit(): void;
  onOpenChapter(id: string): void;
  onReset(): void;
  onClose(): void;
}

export function ChapterPanel({
  content,
  capitulos,
  progresso,
  aberto,
  duravel,
  onCollect,
  onRead,
  focoEm,
  onAnswerOrder,
  onCrossExit,
  onOpenChapter,
  onReset,
  onClose,
}: ChapterPanelProps) {
  const tarefa = taskStateOf(progresso, aberto.id);
  const concluida = isTaskDone(aberto.tarefa, tarefa);
  const exigidos = requiredRecords(aberto.tarefa);
  const ordemPendente = aberto.tarefa.tipo === "ordem" && exigidos.every((id) => tarefa.recolhidos.includes(id)) && !tarefa.ordemConfirmada;
  const saida: ExitState = { tarefaConcluida: concluida, faltam: missingRecords(aberto, tarefa).length, total: aberto.eventIds.length };
  const saidaAberta = exitOpen(saida);
  // Na volta de uma releitura, o foco vai para o botão do registro lido, que continua na lista.
  const focoNoRegistro = focoEm !== null && aberto.eventIds.includes(focoEm) && tarefa.recolhidos.includes(focoEm);
  const cena = getScene(aberto.cena);
  const statusAberto = chapterStatus(progresso, aberto.id);

  return (
    <Dialog
      nome="painel"
      eyebrow={content.personagem.nome}
      titulo="Capítulos e tarefas"
      tamanho="largo"
      onClose={onClose}
      acoes={
        <>
          <button type="button" className={quietButton} onClick={onReset} data-reiniciar>
            Reiniciar a trajetória
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
            Capítulos
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
                    <span className="numerals text-ink-soft">
                      {" "}
                      · {capitulo.periodo.de}–{capitulo.periodo.ate}
                    </span>
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
              Capítulo {aberto.numero} · cenário: {cena.nome}
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
                : ordemPendente
                  ? "Os dois registros da tarefa estão recolhidos. Falta colocá-los em ordem."
                  : "Tarefa pendente."}
          </p>
          <p className="text-sm text-ink-soft" data-regra-da-saida data-registros={`${saida.total - saida.faltam}/${saida.total}`}>
            {collectedSentence(saida)}
            {!saidaAberta && ` ${EXIT_RULE}`}
          </p>
          <ul className="divide-y divide-line border-y border-line">
            {aberto.eventIds.map((eventId, indice) => {
              const registro = content.registros[eventId];
              const posicao = cena.registros[indice];
              if (registro === undefined) return null;
              const recolhido = tarefa.recolhidos.includes(eventId);
              const exigido = exigidos.includes(eventId);
              return (
                <li
                  key={eventId}
                  className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2 text-sm"
                  data-registro={eventId}
                  data-recolhido={recolhido ? "sim" : "nao"}
                  data-x={posicao?.x}
                  data-y={posicao?.y}
                >
                  {/* Em tela estreita, o texto fica com a linha inteira e a ação desce para a de baixo. */}
                  <span className="min-w-[13rem] flex-1">
                    <span className="numerals font-semibold">{formatDate(registro.data)}</span> · {registro.titulo}
                    {exigido && <span className="text-ink-soft"> · pedido pela tarefa</span>}
                    {registro.ordemEmAberto && (
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
                        onClick={() => onRead(eventId)}
                        data-ler={eventId}
                        // Há um botão destes por registro: o nome diz qual, começando pelo texto que se vê.
                        aria-label={`Ler de novo: ${registro.titulo}`}
                        {...(focoNoRegistro && focoEm === eventId ? { "data-foco-inicial": true } : {})}
                      >
                        Ler de novo
                      </button>
                    </span>
                  ) : statusAberto === "bloqueado" ? (
                    <span className="eyebrow text-ink-soft">no cenário</span>
                  ) : (
                    <button
                      type="button"
                      className={secondaryButton}
                      onClick={() => onCollect(eventId)}
                      data-recolher={eventId}
                      aria-label={`Recolher pelo painel: ${registro.titulo}`}
                    >
                      Recolher pelo painel
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="flex flex-wrap gap-2">
            {ordemPendente && (
              <button type="button" className={secondaryButton} onClick={onAnswerOrder} data-responder-ordem>
                Ordenar os registros
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

        <section aria-labelledby="painel-progresso" className="space-y-1 text-sm">
          <h3 id="painel-progresso" className="eyebrow text-ink-soft">
            Progresso
          </h3>
          <p data-progresso-duravel={duravel ? "sim" : "nao"}>
            {duravel
              ? "O progresso fica guardado neste navegador, separado por personagem. Abrir um link direto não altera o progresso."
              : "O armazenamento do navegador está indisponível: o progresso vale enquanto esta página estiver aberta, e se perde ao recarregar ou fechar."}
          </p>
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
