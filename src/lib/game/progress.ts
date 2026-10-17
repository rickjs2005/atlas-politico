// Progresso do jogador na trilha: um por personagem, com o que aconteceu em
// cada fase e a fase em que a pessoa parou em cada sala (D-135).
//
// Não há fase bloqueada: o progresso não decide o que pode ser aberto, só o
// que já foi lido e respondido, e por isso serve para duas coisas: sugerir
// onde continuar e contar o que falta.
//
// O formato salvo tem versão. `parseProgress` aceita a versão atual e migra
// as anteriores (src/lib/game/legacy.ts); devolve `null` para qualquer outra
// coisa: dado inválido vira começo, e não erro na tela.

import { phasesOfLegacy, readLegacy } from "./legacy";
import { initialPhaseProgress, isPhaseDone, markSeen } from "./trail";
import { PROGRESS_VERSION, type ActivityOutcome, type DossierProgress, type PersonagemSlug, type PhaseProgress, type PhaseSpec, type PlayerProgress, type RoomId } from "./types";

/** O que a leitura do progresso precisa saber de uma fase. */
export type PhaseKey = Pick<PhaseSpec, "id" | "sala">;

export function initialProgress(personagem: PersonagemSlug): PlayerProgress {
  return { versao: PROGRESS_VERSION, personagem, fases: {}, posicao: {} };
}

export function phaseProgressOf(progresso: PlayerProgress, faseId: string): PhaseProgress {
  return progresso.fases[faseId] ?? initialPhaseProgress();
}

/** Troca o estado de uma fase. */
export function withPhase(progresso: PlayerProgress, faseId: string, estado: PhaseProgress): PlayerProgress {
  if (progresso.fases[faseId] === estado) return progresso;
  return { ...progresso, fases: { ...progresso.fases, [faseId]: estado } };
}

/** A pessoa está nesta fase: é onde ela continua na próxima visita. Não muda o que foi lido ou respondido. */
export function withPosition(progresso: PlayerProgress, fase: PhaseKey): PlayerProgress {
  if (progresso.posicao[fase.sala] === fase.id) return progresso;
  return { ...progresso, posicao: { ...progresso.posicao, [fase.sala]: fase.id } };
}

/** Abrir a explicação de uma fase: ela fica vista, e a posição da sala vai para ela. */
export function openPhase(progresso: PlayerProgress, fase: PhaseKey): PlayerProgress {
  return withPosition(withPhase(progresso, fase.id, markSeen(phaseProgressOf(progresso, fase.id))), fase);
}

/** A fase seguinte da mesma lista, ou `null` na última. */
export function nextPhase<T extends PhaseKey>(fases: readonly T[], faseId: string): T | null {
  const indice = fases.findIndex((fase) => fase.id === faseId);
  return indice < 0 ? null : (fases[indice + 1] ?? null);
}

/** Quantas fases dadas foram concluídas. */
export function countDone(progresso: PlayerProgress, fases: readonly PhaseKey[]): number {
  return fases.filter((fase) => isPhaseDone(progresso.fases[fase.id])).length;
}

/** Todas as fases dadas foram concluídas? */
export function isTrailComplete(progresso: PlayerProgress, fases: readonly PhaseKey[]): boolean {
  return fases.length > 0 && countDone(progresso, fases) === fases.length;
}

/** Já há algo feito nas fases dadas: uma aberta, uma concluída, uma tentativa ou a marca de um formato anterior. */
export function hasStarted(progresso: PlayerProgress, fases: readonly PhaseKey[]): boolean {
  return fases.some((fase) => {
    const estado = progresso.fases[fase.id];
    return estado !== undefined && (estado.vista || estado.concluida !== undefined || estado.tentativas > 0 || estado.anterior === true);
  });
}

/**
 * A fase em que se continua, entre as dadas (as de uma sala, na ordem):
 *   1. a fase em que a pessoa parou, se ela ainda não foi concluída;
 *   2. a primeira não concluída depois dela;
 *   3. sem posição guardada, mas com capítulos concluídos em um formato
 *      anterior: a primeira não concluída depois da última fase que eles
 *      cobriam. As fases de origem, que não existiam, ficam para trás, e a
 *      entrada as oferece em "Ver desde o início";
 *   4. sem nada disso, a primeira fase.
 * Com tudo concluído, a última: é de onde se chega ao resumo.
 */
export function resumePhase<T extends PhaseKey>(progresso: PlayerProgress, fases: readonly T[]): T | null {
  if (fases.length === 0) return null;
  const depoisDe = (indice: number): T => fases.slice(indice).find((fase) => !isPhaseDone(progresso.fases[fase.id])) ?? fases.at(-1)!;
  const sala = fases[0]!.sala;
  const guardada = fases.findIndex((fase) => fase.id === progresso.posicao[sala]);
  if (guardada >= 0) return depoisDe(guardada);
  const ultimaAnterior = fases.reduce((ultima, fase, indice) => (progresso.fases[fase.id]?.anterior === true ? indice : ultima), -1);
  if (ultimaAnterior >= 0) return depoisDe(Math.min(ultimaAnterior + 1, fases.length - 1));
  return fases[0]!;
}

/**
 * O salvo veio de um formato anterior do jogo, e a trajetória de hoje tem
 * fases que ele não conhecia (as de origem, antes de tudo): é o que a tela
 * diz a quem volta, para a pessoa não achar que o jogo começa onde ela parou.
 */
export function hasNewStart(progresso: PlayerProgress, fases: readonly PhaseKey[]): boolean {
  return progresso.legado !== undefined && fases.some((fase) => progresso.fases[fase.id] === undefined);
}

/** A primeira fase que a pessoa ainda não abriu nem concluiu, ou `null` se já passou por todas. */
export function firstUnseen<T extends PhaseKey>(progresso: PlayerProgress, fases: readonly T[]): T | null {
  return fases.find((fase) => {
    const estado = progresso.fases[fase.id];
    return estado === undefined || (!estado.vista && estado.concluida === undefined);
  }) ?? null;
}

// ---------------------------------------------------------------------------
// Formato salvo
// ---------------------------------------------------------------------------

function isRecord(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

const OUTCOMES: readonly ActivityOutcome[] = ["resposta", "explicacao"];

const isStringList = (valor: unknown): valor is string[] => Array.isArray(valor) && valor.every((item) => typeof item === "string");

/**
 * Lê o andamento de um dossiê (D-151). `undefined` quando o salvo não tem o
 * campo (as fases sem dossiê, e os salvos de antes da missão); `null` quando
 * o campo existe e não tem a forma esperada.
 */
function parseDossier(valor: unknown): DossierProgress | null | undefined {
  if (valor === undefined) return undefined;
  if (!isRecord(valor)) return null;
  const { recolhidos, relacionadas, conferidas } = valor;
  if (!isStringList(recolhidos) || !isStringList(conferidas) || !isRecord(relacionadas)) return null;
  if (!Object.values(relacionadas).every((chave) => typeof chave === "string")) return null;
  return { recolhidos: [...recolhidos], relacionadas: { ...(relacionadas as Record<string, string>) }, conferidas: [...conferidas] };
}

/**
 * Lê o estado de uma fase. A conclusão só vale com a assinatura da atividade
 * de hoje: se uma correção no conteúdo mudou o que decide a resposta, a fase
 * volta a pendente, marcada como reaberta, e o que a pessoa leu e tentou
 * fica (D-130).
 */
function parsePhase(valor: unknown, assinaturaAtual: string | undefined): PhaseProgress | null {
  if (!isRecord(valor)) return null;
  const { vista, concluida, assinatura, tentativas, anterior, reaberta } = valor;
  if (typeof vista !== "boolean") return null;
  if (typeof tentativas !== "number" || !Number.isInteger(tentativas) || tentativas < 0) return null;
  if (concluida !== undefined && !OUTCOMES.includes(concluida as ActivityOutcome)) return null;
  if (assinatura !== undefined && typeof assinatura !== "string") return null;
  if (anterior !== undefined && typeof anterior !== "boolean") return null;
  if (reaberta !== undefined && typeof reaberta !== "boolean") return null;
  const dossie = parseDossier(valor.dossie);
  if (dossie === null) return null;
  const lida: PhaseProgress = { vista, tentativas };
  if (anterior === true) lida.anterior = true;
  if (dossie !== undefined) lida.dossie = dossie;
  if (concluida !== undefined) {
    if (assinaturaAtual !== undefined && assinatura === assinaturaAtual) {
      lida.concluida = concluida as ActivityOutcome;
      lida.assinatura = assinaturaAtual;
    } else {
      lida.reaberta = true;
    }
  } else if (reaberta === true) {
    lida.reaberta = true;
  }
  return lida;
}

/**
 * Lê um progresso salvo. Devolve `null` quando o personagem ou a forma não
 * conferem. `assinaturas` traz a assinatura atual da atividade de cada fase
 * (`signaturesOf`, em trail.ts).
 *
 * Na versão atual: fases que a edição não tem mais são descartadas; a posição
 * de uma sala só fica se a fase ainda é dela; o salvo anterior guardado na
 * migração continua guardado.
 *
 * Nas versões 1 a 5 (capítulos, registros recolhidos, saída): as fases que
 * cobrem os registros de um capítulo concluído ganham a marca `anterior`. A
 * atividade nova não é dada como respondida nem a explicação como lida: a
 * marca só diz que a pessoa já passou por aquele período. O salvo antigo
 * entra inteiro em `legado`.
 */
export function parseProgress(valor: unknown, personagem: PersonagemSlug, fases: readonly PhaseKey[], assinaturas: Readonly<Record<string, string>>): PlayerProgress | null {
  if (!isRecord(valor)) return null;
  const conhecidas = new Map(fases.map((fase) => [fase.id, fase] as const));

  if (valor.versao !== PROGRESS_VERSION) {
    const antigo = readLegacy(valor, personagem);
    if (antigo === null) return null;
    const migrado = initialProgress(personagem);
    for (const id of phasesOfLegacy(antigo.concluidos)) {
      if (conhecidas.has(id)) migrado.fases[id] = { ...initialPhaseProgress(), anterior: true };
    }
    migrado.legado = { versao: antigo.versao, capitulos: antigo.capitulos };
    return migrado;
  }

  if (valor.personagem !== personagem) return null;
  if (!isRecord(valor.fases) || !isRecord(valor.posicao)) return null;

  const lido = initialProgress(personagem);
  for (const [id, entrada] of Object.entries(valor.fases)) {
    if (!conhecidas.has(id)) continue;
    const estado = parsePhase(entrada, assinaturas[id]);
    if (estado === null) return null;
    lido.fases[id] = estado;
  }
  for (const [sala, faseId] of Object.entries(valor.posicao)) {
    if (typeof faseId !== "string") return null;
    const fase = conhecidas.get(faseId);
    if (fase !== undefined && fase.sala === sala) lido.posicao[sala as RoomId] = faseId;
  }
  if (valor.legado !== undefined) {
    if (!isRecord(valor.legado) || typeof valor.legado.versao !== "number" || !isRecord(valor.legado.capitulos)) return null;
    lido.legado = { versao: valor.legado.versao, capitulos: valor.legado.capitulos };
  }
  return lido;
}
