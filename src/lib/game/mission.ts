// Regras de tarefa e de saída: o que cumpre a tarefa de um capítulo e o que
// abre a passagem para o seguinte. Funções puras sobre o estado da tarefa e
// os registros do capítulo.
//
// Objetivo, ação e conclusão são explícitos:
//   registro   recolher o registro pedido cumpre a tarefa;
//   ordem      recolher os dois registros e confirmar a ordem certa cumpre;
//   fonte      recolher o registro e indicar o documento que o sustenta cumpre;
//   lugar      recolher o registro e indicar o lugar documentado cumpre.
//              Errar explica e permite tentar de novo, sem punição.
//   saída      abre com a tarefa cumprida e TODOS os registros do capítulo
//              recolhidos, e não só os que a tarefa pede.
//
// As opções das tarefas de fonte e de lugar vêm dos próprios registros: o
// documento certo é o que o registro cita, e os outros são documentos citados
// por outros registros do capítulo; o lugar certo é o que o atlas documenta, e
// os outros são lugares de outros registros da trajetória. Nada é inventado.

import { compareDates, formatDate, intervalsOverlap, calcInterval } from "@/lib/domain/dates";
import type { DataHistorica } from "@/lib/domain/types";

import type { ChapterSpec, GameRecord, GameSource, TaskSpec, TaskState } from "./types";

export function initialTaskState(): TaskState {
  return { recolhidos: [], confirmada: false, tentativas: 0 };
}

/** Os registros que a tarefa exige, na ordem em que a tarefa os cita. */
export function requiredRecords(tarefa: TaskSpec): readonly string[] {
  return tarefa.tipo === "ordem" ? tarefa.eventIds : [tarefa.eventId];
}

/** A tarefa pede uma resposta depois de recolher (ordem, fonte, lugar), e não só o recolhimento. */
export function hasAnswer(tarefa: TaskSpec): boolean {
  return tarefa.tipo !== "registro";
}

/**
 * A assinatura de uma tarefa: o tipo e os identificadores que ela pede. Vai
 * para o progresso salvo junto com a confirmação, para a leitura saber a qual
 * tarefa a resposta pertence (src/lib/game/progress.ts): trocar o tipo da
 * tarefa, ou o que ela pede, sob os mesmos identificadores de capítulo, não
 * deixa uma resposta antiga concluir a nova.
 */
export function taskSignature(tarefa: TaskSpec): string {
  return `${tarefa.tipo}:${requiredRecords(tarefa).join("+")}`;
}

/** Recolher um registro. Recolher o mesmo duas vezes não muda nada. */
export function collect(estado: TaskState, eventId: string): TaskState {
  if (estado.recolhidos.includes(eventId)) return estado;
  return { ...estado, recolhidos: [...estado.recolhidos, eventId] };
}

/** Os registros exigidos já foram recolhidos? */
export function hasRequired(tarefa: TaskSpec, estado: TaskState): boolean {
  return requiredRecords(tarefa).every((id) => estado.recolhidos.includes(id));
}

export function isTaskDone(tarefa: TaskSpec, estado: TaskState): boolean {
  if (tarefa.tipo === "registro") return estado.recolhidos.includes(tarefa.eventId);
  return estado.confirmada;
}

/** A resposta da tarefa está pronta para ser dada (os registros recolhidos, resposta ainda não confirmada)? */
export function isAnswerPending(tarefa: TaskSpec, estado: TaskState): boolean {
  return hasAnswer(tarefa) && hasRequired(tarefa, estado) && !estado.confirmada;
}

/** Os registros do capítulo que ainda não foram recolhidos, na ordem do capítulo. */
export function missingRecords(capitulo: ChapterSpec, estado: TaskState): string[] {
  return capitulo.eventIds.filter((id) => !estado.recolhidos.includes(id));
}

/**
 * A saída do capítulo está aberta: a tarefa foi cumprida e não falta
 * recolher nenhum registro do capítulo. Cumprir só a tarefa não abre a
 * passagem, e recolher tudo sem responder também não.
 */
export function isExitOpen(capitulo: ChapterSpec, estado: TaskState): boolean {
  return isTaskDone(capitulo.tarefa, estado) && missingRecords(capitulo, estado).length === 0;
}

/**
 * As datas decidem a ordem sem ambiguidade: os intervalos de cálculo das
 * duas não se cruzam. `1980-02-10` e `1986` decidem; `1980` e `1980-02-10`
 * não, porque o ano inteiro contém o dia.
 */
export function datesDecideOrder(a: DataHistorica, b: DataHistorica): boolean {
  return !intervalsOverlap(calcInterval(a), calcInterval(b));
}

/** A avaliação de uma resposta, já aplicada ao estado da tarefa. */
export interface Attempt {
  estado: TaskState;
  certo: boolean;
  /** Explicação curta, com os registros, as datas ou os documentos envolvidos. */
  explicacao: string;
}

/**
 * Conta a tentativa e confirma a tarefa se a resposta estiver certa, gravando
 * a assinatura da tarefa respondida. Errar não desfaz nada.
 */
function attempt(tarefa: TaskSpec, estado: TaskState, certo: boolean, explicacao: string): Attempt {
  const proximo: TaskState = { ...estado, tentativas: estado.tentativas + 1, confirmada: certo || estado.confirmada };
  if (certo) proximo.assinatura = taskSignature(tarefa);
  return { estado: proximo, certo, explicacao };
}

// ---------------------------------------------------------------------------
// Ordem
// ---------------------------------------------------------------------------

/** A ordem cronológica correta dos dois registros de uma tarefa de ordem. */
export function correctOrder(tarefa: Extract<TaskSpec, { tipo: "ordem" }>, registros: Record<string, GameRecord>): [string, string] {
  const [a, b] = tarefa.eventIds;
  const ra = registros[a];
  const rb = registros[b];
  if (ra === undefined || rb === undefined) return [a, b];
  return compareDates(ra.data, rb.data) <= 0 ? [a, b] : [b, a];
}

/**
 * Responder a tarefa de ordem com `primeiro` antes de `segundo`. Com a ordem
 * errada, a explicação diz as datas e qual veio antes, e o estado continua
 * aberto para outra tentativa.
 */
export function submitOrder(
  tarefa: Extract<TaskSpec, { tipo: "ordem" }>,
  estado: TaskState,
  resposta: readonly [string, string],
  registros: Record<string, GameRecord>,
): Attempt {
  const [antes, depois] = correctOrder(tarefa, registros);
  const certo = resposta[0] === antes && resposta[1] === depois;
  const ra = registros[antes];
  const rb = registros[depois];
  // Os títulos do atlas são orações: a data vai entre parênteses, e não em uma frase montada com eles.
  const datas = ra && rb ? `Datas dos registros: ${ra.titulo} (${formatDate(ra.data)}); ${rb.titulo} (${formatDate(rb.data)}).` : "";
  return attempt(tarefa, estado, certo, certo ? `Ordem certa. ${datas}` : `Ainda não. ${datas} A data mais antiga vem primeiro. Tente de novo: não há penalidade.`);
}

// ---------------------------------------------------------------------------
// Fonte e lugar: escolher entre opções que vêm dos registros
// ---------------------------------------------------------------------------

/** Uma alternativa de uma tarefa de escolha, com o que a pessoa vê. */
export interface ChoiceOption {
  id: string;
  rotulo: string;
  /** Complemento: a autoria do documento, ou o que distingue a opção. */
  detalhe: string;
}

/** Quantas opções erradas acompanham a certa. */
export const DISTRACTORS = 2;

/** Ordem estável e sem a certa sempre na mesma posição: pelo código dos caracteres dos identificadores. */
function sortOptions(opcoes: ChoiceOption[]): ChoiceOption[] {
  return [...opcoes].sort((a, b) => {
    const ka = hashOf(a.id);
    const kb = hashOf(b.id);
    return ka === kb ? (a.id < b.id ? -1 : 1) : ka - kb;
  });
}

function hashOf(texto: string): number {
  let h = 7;
  for (let i = 0; i < texto.length; i += 1) h = (h * 31 + texto.charCodeAt(i)) % 1000003;
  return h;
}

/**
 * Os documentos entre os quais a pessoa escolhe: o primeiro citado pelo
 * registro pedido e, como alternativas erradas, documentos citados por
 * outros registros do capítulo e por nenhuma citação do registro pedido.
 * Os registros entram na ordem do capítulo, para o resultado ser o mesmo
 * em toda visita. Vazio se o registro não existe ou não tem fonte.
 */
export function sourceOptions(capitulo: ChapterSpec, registros: Record<string, GameRecord>, eventId: string): ChoiceOption[] {
  const alvo = registros[eventId];
  const certa = alvo?.fontes[0];
  if (alvo === undefined || certa === undefined) return [];
  const citadas = new Set(alvo.fontes.map((fonte) => fonte.id));
  const erradas = new Map<string, GameSource>();
  for (const id of capitulo.eventIds) {
    if (id === eventId) continue;
    for (const fonte of registros[id]?.fontes ?? []) {
      if (citadas.has(fonte.id) || erradas.has(fonte.id)) continue;
      erradas.set(fonte.id, fonte);
      if (erradas.size === DISTRACTORS) break;
    }
    if (erradas.size === DISTRACTORS) break;
  }
  const opcoes = [certa, ...erradas.values()].map((fonte) => ({ id: fonte.id, rotulo: fonte.titulo, detalhe: fonte.autoria }));
  return sortOptions(opcoes);
}

/** Qual registro do capítulo cita este documento, para a explicação. */
function citedBy(capitulo: ChapterSpec, registros: Record<string, GameRecord>, fonteId: string): GameRecord | undefined {
  for (const id of capitulo.eventIds) {
    const registro = registros[id];
    if (registro?.fontes.some((fonte) => fonte.id === fonteId)) return registro;
  }
  return undefined;
}

/**
 * Responder a tarefa de fonte com o `id` de um documento. Qualquer documento
 * citado pelo registro conta como certo. Errar diz qual registro do capítulo
 * o documento escolhido sustenta e deixa tentar de novo.
 */
export function submitSource(
  tarefa: Extract<TaskSpec, { tipo: "fonte" }>,
  estado: TaskState,
  capitulo: ChapterSpec,
  registros: Record<string, GameRecord>,
  fonteId: string,
): Attempt {
  const alvo = registros[tarefa.eventId];
  const citada = alvo?.fontes.find((fonte) => fonte.id === fonteId);
  if (alvo === undefined) return attempt(tarefa, estado, false, "O registro desta tarefa não está no conteúdo.");
  if (citada !== undefined) {
    return attempt(tarefa, estado, true, `Certo. O registro cita ${citada.titulo} (${citada.autoria}). O que o trecho sustenta: ${citada.evidencia}`);
  }
  const outro = citedBy(capitulo, registros, fonteId);
  const sustenta = outro === undefined ? "Esse documento não é citado por este registro." : `Esse documento é citado por outro registro do capítulo: ${outro.titulo} (${formatDate(outro.data)}).`;
  const dica = `O registro pedido cita ${alvo.fontes.length === 1 ? "um documento" : `${alvo.fontes.length} documentos`}; a lista está no próprio registro, ao recolhê-lo. Tente de novo: não há penalidade.`;
  return attempt(tarefa, estado, false, `Ainda não. ${sustenta} ${dica}`);
}

/** O rótulo de um lugar documentado, ou da abrangência, como a ficha diz. */
export function placeLabel(registro: GameRecord): string {
  if (registro.localizacao.tipo === "lugares") return registro.localizacao.lugares.join(" e ");
  return registro.localizacao.tipo === "nacional" ? "Abrangência nacional" : "Lugar não documentado";
}

/**
 * Os lugares entre os quais a pessoa escolhe: o documentado para o registro
 * pedido e, como alternativas erradas, lugares documentados para outros
 * registros da trajetória, diferentes do certo. Os registros entram na
 * ordem dos capítulos. Vazio se o registro pedido não tem lugar documentado.
 */
export function placeOptions(capitulos: readonly ChapterSpec[], registros: Record<string, GameRecord>, eventId: string): ChoiceOption[] {
  const alvo = registros[eventId];
  if (alvo === undefined || alvo.localizacao.tipo !== "lugares") return [];
  const certo = placeLabel(alvo);
  const erradas: string[] = [];
  for (const capitulo of capitulos) {
    for (const id of capitulo.eventIds) {
      if (id === eventId) continue;
      const registro = registros[id];
      if (registro === undefined || registro.localizacao.tipo !== "lugares") continue;
      const rotulo = placeLabel(registro);
      if (rotulo === certo || erradas.includes(rotulo)) continue;
      erradas.push(rotulo);
      if (erradas.length === DISTRACTORS) break;
    }
    if (erradas.length === DISTRACTORS) break;
  }
  return sortOptions([certo, ...erradas].map((rotulo) => ({ id: rotulo, rotulo, detalhe: "" })));
}

/**
 * Responder a tarefa de lugar com o rótulo de um lugar. Errar diz qual
 * registro do capítulo o atlas documenta no lugar escolhido, quando há um,
 * e deixa tentar de novo.
 */
export function submitPlace(
  tarefa: Extract<TaskSpec, { tipo: "lugar" }>,
  estado: TaskState,
  capitulos: readonly ChapterSpec[],
  registros: Record<string, GameRecord>,
  lugar: string,
): Attempt {
  const alvo = registros[tarefa.eventId];
  if (alvo === undefined) return attempt(tarefa, estado, false, "O registro desta tarefa não está no conteúdo.");
  const certo = placeLabel(alvo);
  if (lugar === certo) return attempt(tarefa, estado, true, `Certo. O atlas documenta este acontecimento em ${certo}, como diz a ficha dele.`);
  let outro: GameRecord | undefined;
  for (const capitulo of capitulos) {
    for (const id of capitulo.eventIds) {
      const registro = registros[id];
      if (registro !== undefined && registro.localizacao.tipo === "lugares" && placeLabel(registro) === lugar) {
        outro = registro;
        break;
      }
    }
    if (outro !== undefined) break;
  }
  const onde = outro === undefined ? "Esse lugar não é o deste registro." : `${lugar} é o lugar de outro registro: ${outro.titulo} (${formatDate(outro.data)}).`;
  return attempt(tarefa, estado, false, `Ainda não. ${onde} O lugar documentado aparece no registro, ao recolhê-lo. Tente de novo: não há penalidade.`);
}
