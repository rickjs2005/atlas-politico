// Progresso do jogador: um por personagem, com os capítulos em três estados
// (`bloqueado`, `disponivel`, `concluido`) e transições previsíveis, dentro
// de cada sala (D-125):
//
//   início                em cada sala, todo capítulo bloqueado, menos o primeiro
//   concluir capítulo n   n vira `concluido`; o seguinte da mesma sala vira `disponivel`
//   reiniciar             volta ao início
//
// Um capítulo só é concluído com a saída aberta: a tarefa cumprida e todos
// os registros do capítulo recolhidos (`isExitOpen`).
//
// O formato salvo tem versão. `parseProgress` aceita a versão atual e migra
// as anteriores; devolve `null` para qualquer outra coisa: dado inválido vira
// começo, e não erro na tela.

import { hasAnswer, hasRequired, isExitOpen, recordIds, taskSignature } from "./mission";
import { groupByRoom } from "./rooms";
import { PROGRESS_VERSION, type ChapterProgress, type ChapterSpec, type ChapterStatus, type PersonagemSlug, type PlayerProgress, type TaskState } from "./types";

const STATUSES: readonly ChapterStatus[] = ["bloqueado", "disponivel", "concluido"];

export function initialProgress(personagem: PersonagemSlug, capitulos: readonly ChapterSpec[]): PlayerProgress {
  const entradas: Record<string, ChapterProgress> = {};
  for (const [, daSala] of groupByRoom(capitulos)) {
    daSala.forEach((capitulo, indice) => {
      entradas[capitulo.id] = {
        status: indice === 0 ? "disponivel" : "bloqueado",
        tarefa: { recolhidos: [], confirmada: false, tentativas: 0 },
      };
    });
  }
  return { versao: PROGRESS_VERSION, personagem, capitulos: entradas };
}

export function chapterStatus(progresso: PlayerProgress, capituloId: string): ChapterStatus {
  return progresso.capitulos[capituloId]?.status ?? "bloqueado";
}

export function taskStateOf(progresso: PlayerProgress, capituloId: string): TaskState {
  return progresso.capitulos[capituloId]?.tarefa ?? { recolhidos: [], confirmada: false, tentativas: 0 };
}

/** Troca o estado da tarefa de um capítulo. Capítulo bloqueado não muda. */
export function withTaskState(progresso: PlayerProgress, capituloId: string, tarefa: TaskState): PlayerProgress {
  const atual = progresso.capitulos[capituloId];
  if (atual === undefined || atual.status === "bloqueado") return progresso;
  if (atual.tarefa === tarefa) return progresso;
  return { ...progresso, capitulos: { ...progresso.capitulos, [capituloId]: { ...atual, tarefa } } };
}

/**
 * Concluir um capítulo: só um capítulo disponível com a saída aberta, isto
 * é, com a tarefa cumprida e todos os registros recolhidos. O seguinte da
 * mesma sala, se houver, fica disponível. Repetir em capítulo concluído não
 * muda nada.
 */
export function completeChapter(progresso: PlayerProgress, capitulos: readonly ChapterSpec[], capituloId: string): PlayerProgress {
  const capitulo = capitulos.find((item) => item.id === capituloId);
  const atual = progresso.capitulos[capituloId];
  if (capitulo === undefined || atual === undefined) return progresso;
  if (atual.status !== "disponivel" || !isExitOpen(capitulo, atual.tarefa)) return progresso;

  const proximos: Record<string, ChapterProgress> = { ...progresso.capitulos, [capituloId]: { ...atual, status: "concluido" } };
  const daSala = capitulos.filter((item) => item.sala === capitulo.sala);
  const seguinte = daSala[daSala.findIndex((item) => item.id === capituloId) + 1];
  if (seguinte !== undefined) {
    const entrada = proximos[seguinte.id];
    if (entrada !== undefined && entrada.status === "bloqueado") proximos[seguinte.id] = { ...entrada, status: "disponivel" };
  }
  return { ...progresso, capitulos: proximos };
}

/** O capítulo em que se continua, entre os dados: o primeiro disponível, ou o último se todos estão concluídos. */
export function currentChapter(progresso: PlayerProgress, capitulos: readonly ChapterSpec[]): ChapterSpec | null {
  const disponivel = capitulos.find((item) => chapterStatus(progresso, item.id) === "disponivel");
  if (disponivel !== undefined) return disponivel;
  const concluidos = capitulos.filter((item) => chapterStatus(progresso, item.id) === "concluido");
  return concluidos.at(-1) ?? capitulos[0] ?? null;
}

/** Todos os capítulos dados foram concluídos? */
export function isTrajectoryComplete(progresso: PlayerProgress, capitulos: readonly ChapterSpec[]): boolean {
  return capitulos.length > 0 && capitulos.every((item) => chapterStatus(progresso, item.id) === "concluido");
}

export function countCompleted(progresso: PlayerProgress, capitulos: readonly ChapterSpec[]): number {
  return capitulos.filter((item) => chapterStatus(progresso, item.id) === "concluido").length;
}

/** Já há algo feito nos capítulos dados: um concluído, um registro recolhido ou uma tentativa de resposta. */
export function hasStarted(progresso: PlayerProgress, capitulos: readonly ChapterSpec[]): boolean {
  return capitulos.some((capitulo) => {
    const tarefa = taskStateOf(progresso, capitulo.id);
    return chapterStatus(progresso, capitulo.id) === "concluido" || tarefa.recolhidos.length > 0 || tarefa.tentativas > 0;
  });
}

// ---------------------------------------------------------------------------
// Formato salvo
// ---------------------------------------------------------------------------

function isRecord(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

/** As versões do formato que a leitura entende: a atual e as que ela migra. */
export type ReadableVersion = 1 | 2 | 3 | 4;
export const READABLE_VERSIONS: readonly ReadableVersion[] = [1, 2, 3, PROGRESS_VERSION];

/** A partir de que versão o salvo guarda a assinatura da tarefa respondida. */
const COM_ASSINATURA = 3;

/**
 * Lê o estado de uma tarefa. A versão 1 chamava a confirmação de
 * `ordemConfirmada`; as seguintes chamam de `confirmada`. Só um dos dois
 * nomes é aceito, o da versão lida. A assinatura da tarefa respondida só
 * existe a partir da versão 3; a etapa de evidência, a partir da 4. Nas
 * versões anteriores, os dois campos são ignorados.
 */
function parseTask(valor: unknown, versao: ReadableVersion): TaskState | null {
  if (!isRecord(valor)) return null;
  const { recolhidos, tentativas, assinatura, evidencia } = valor;
  const confirmada = versao === 1 ? valor.ordemConfirmada : valor.confirmada;
  if (!Array.isArray(recolhidos) || !recolhidos.every((item) => typeof item === "string")) return null;
  if (typeof confirmada !== "boolean") return null;
  if (typeof tentativas !== "number" || !Number.isInteger(tentativas) || tentativas < 0) return null;
  if (assinatura !== undefined && typeof assinatura !== "string") return null;
  if (evidencia !== undefined && typeof evidencia !== "boolean") return null;
  const lida: TaskState = { recolhidos: [...new Set(recolhidos as string[])], confirmada, tentativas };
  if (versao >= COM_ASSINATURA && typeof assinatura === "string") lida.assinatura = assinatura;
  if (versao === PROGRESS_VERSION && evidencia === true) lida.evidencia = true;
  return lida;
}

/** As assinaturas das tarefas de cada capítulo quando uma versão antiga do formato era a atual. */
export type LegacySignatures = Readonly<Record<1 | 2, Readonly<Record<string, string>>>>;

/** As tarefas da etapa 1 (versão 1 do formato): dois capítulos de cada personagem. */
const TAREFAS_NA_VERSAO_1: Readonly<Record<string, string>> = {
  "lula-1-sindicato": "registro:lula-1975-eleito-presidente-do-sindicato",
  "lula-2-constituinte": "ordem:lula-1986-eleito-deputado-federal-constituinte+lula-1989-primeira-candidatura-a-presidencia",
  "flavio-bolsonaro-1-alerj": "registro:flavio-bolsonaro-2002-eleito-deputado-estadual",
  "flavio-bolsonaro-2-senado": "ordem:flavio-bolsonaro-2018-eleito-senador+flavio-bolsonaro-2019-terceiro-secretario-do-senado",
};

/** As tarefas da versão de lançamento (versão 2 do formato): os onze capítulos. */
const TAREFAS_NA_VERSAO_2: Readonly<Record<string, string>> = {
  ...TAREFAS_NA_VERSAO_1,
  "lula-3-presidencia": "fonte:lula-2002-eleito-presidente",
  "lula-4-processos": "ordem:lula-2017-condenacao-em-primeira-instancia+lula-2018-tribunal-confirma-condenacao",
  "lula-5-anulacao": "lugar:lula-2021-stf-anula-condenacoes",
  "lula-6-eleicao-2026": "fonte:eleicao-2026-primeiro-turno",
  "flavio-bolsonaro-3-denuncia": "fonte:flavio-bolsonaro-2021-stj-anula-decisoes-da-investigacao",
  "flavio-bolsonaro-4-minoria": "lugar:flavio-bolsonaro-2024-relatoria-das-saidas-temporarias",
  "flavio-bolsonaro-5-eleicao-2026": "ordem:flavio-bolsonaro-2026-convencao-do-pl+eleicao-2026-primeiro-turno",
};

/**
 * O que cada capítulo pedia quando as versões 1 e 2 do formato eram as
 * atuais, pela assinatura de `taskSignature`. Essas versões não guardavam a
 * assinatura da tarefa respondida; uma confirmação delas só migra se a tarefa
 * do capítulo continua a mesma de então. A tabela é congelada de propósito:
 * não acompanha mudanças futuras dos capítulos, e é isso que a torna útil. A
 * partir da versão 3 o salvo traz a própria assinatura, e a tabela não cresce.
 */
export const LEGACY_SIGNATURES: LegacySignatures = { 1: TAREFAS_NA_VERSAO_1, 2: TAREFAS_NA_VERSAO_2 };

/**
 * Lê um progresso salvo. Devolve `null` quando a versão, o personagem ou a
 * forma não conferem. As versões 1, 2 e 3 são migradas ao ler: a 1 muda o
 * nome do campo da confirmação; a 1 e a 2 ganham a assinatura da tarefa
 * respondida, conferida pela tabela do que o capítulo pedia na época
 * (`legado`); a 3 já traz a assinatura e só não tem a etapa de evidência.
 * Capítulos que a edição não tem mais são descartados; capítulos novos
 * entram bloqueados (ou disponíveis, se forem o primeiro aberto da sala), e a
 * regra de progressão é reaplicada em cada sala para não haver dois
 * capítulos disponíveis nem um disponível depois de um bloqueado. Quem
 * terminou os capítulos de uma edição anterior recebe o primeiro capítulo
 * novo da sala como disponível.
 *
 * Um capítulo pode mudar entre uma edição e outra. Os registros que ele não
 * cita mais saem dos recolhidos, e uma confirmação só vale se a tarefa ainda
 * pede resposta, os registros dela estão recolhidos e ela é a mesma tarefa
 * que foi respondida: pela assinatura guardada, ou pela tabela nas versões 1
 * e 2. Trocar o tipo da tarefa, ou o que ela pede, sob os mesmos
 * identificadores reabre a pergunta, sem apagar o que foi recolhido nem as
 * tentativas. A etapa de evidência da tarefa de decisão só vale se a tarefa
 * continua de decisão sobre o mesmo registro, e ele está recolhido.
 *
 * A regra de saída também vale para o que foi salvo: um capítulo marcado
 * como concluído sem todos os registros recolhidos (guardado quando a saída
 * abria só com a tarefa, ou antes de o capítulo ganhar um registro) volta a
 * disponível, com o que já foi recolhido, e os seguintes voltam a bloqueado.
 */
export function parseProgress(
  valor: unknown,
  personagem: PersonagemSlug,
  capitulos: readonly ChapterSpec[],
  legado: LegacySignatures = LEGACY_SIGNATURES,
): PlayerProgress | null {
  if (!isRecord(valor)) return null;
  if (!READABLE_VERSIONS.includes(valor.versao as ReadableVersion)) return null;
  const versao = valor.versao as ReadableVersion;
  if (valor.personagem !== personagem) return null;
  if (!isRecord(valor.capitulos)) return null;

  const base = initialProgress(personagem, capitulos);
  const lidos: Record<string, ChapterProgress> = {};
  for (const capitulo of capitulos) {
    const entrada = valor.capitulos[capitulo.id];
    if (entrada === undefined) continue;
    if (!isRecord(entrada)) return null;
    const lida = parseTask(entrada.tarefa, versao);
    if (lida === null || !STATUSES.includes(entrada.status as ChapterStatus)) return null;
    const doCapitulo = recordIds(capitulo);
    const recolhidos = lida.recolhidos.filter((id) => doCapitulo.includes(id));
    // A confirmação pertence à tarefa atual? Pela assinatura guardada, ou pelo
    // que o capítulo pedia na versão lida, quando ela não guardava assinatura.
    const atual = taskSignature(capitulo.tarefa);
    const respondida = versao >= COM_ASSINATURA ? lida.assinatura === atual : legado[versao as 1 | 2][capitulo.id] === atual;
    const tarefa: TaskState = { recolhidos, confirmada: false, tentativas: lida.tentativas };
    if (lida.confirmada && hasAnswer(capitulo.tarefa) && hasRequired(capitulo.tarefa, tarefa) && respondida) {
      tarefa.confirmada = true;
      tarefa.assinatura = atual;
    }
    // A evidência confirmada só vale para a tarefa de decisão sobre o registro recolhido.
    if (lida.evidencia === true && capitulo.tarefa.tipo === "decisao" && hasRequired(capitulo.tarefa, tarefa)) tarefa.evidencia = true;
    lidos[capitulo.id] = { status: entrada.status as ChapterStatus, tarefa };
  }

  // Reaplica a progressão em cada sala: concluídos em sequência a partir do
  // primeiro; o seguinte disponível; o resto bloqueado. O estado da tarefa é mantido.
  const capitulosLidos: Record<string, ChapterProgress> = {};
  for (const [, daSala] of groupByRoom(capitulos)) {
    let aberto = false;
    for (const capitulo of daSala) {
      const lido = lidos[capitulo.id] ?? base.capitulos[capitulo.id]!;
      let status: ChapterStatus;
      if (!aberto && lido.status === "concluido" && isExitOpen(capitulo, lido.tarefa)) status = "concluido";
      else if (!aberto) {
        status = "disponivel";
        aberto = true;
      } else status = "bloqueado";
      capitulosLidos[capitulo.id] = { status, tarefa: status === "bloqueado" ? base.capitulos[capitulo.id]!.tarefa : lido.tarefa };
    }
  }
  return { versao: PROGRESS_VERSION, personagem, capitulos: capitulosLidos };
}
