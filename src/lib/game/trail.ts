// As regras da trilha (docs/GAME-TRAIL.md, D-133): o que é uma fase aberta,
// respondida e concluída. Funções puras sobre a fase, o estado dela e o
// conteúdo que ela aponta.
//
// O ciclo é um só: abrir o marco, ler a explicação, responder a atividade ou
// ler a explicação dela, continuar.
//   abrir         marca a fase como vista;
//   responder     conta a tentativa; a resposta certa conclui a fase, e a
//                 errada não tira nada: a pessoa lê por que e tenta de novo;
//   ler e seguir  conclui a fase sem resposta, e a explicação aparece do
//                 mesmo jeito;
//   continuar     nenhuma fase segura a seguinte. Os registros em "Explorar
//                 este período" são opcionais.
//
// A atividade usa só o que o conteúdo publicado traz: as opções e a certa são
// da fase; a ordem certa de uma ordenação vem das datas dos registros.

import { compareDates, formatDate } from "@/lib/domain/dates";
import { TEMA_LABELS } from "@/lib/domain/decisions";
import type { DataHistorica } from "@/lib/domain/types";

import type { ActivityOutcome, GameContent, PhaseActivity, PhaseProgress, PhaseRef, PhaseSpec } from "./types";

/** O conteúdo de que as regras precisam: o que as fases podem apontar. */
export type TrailContent = Pick<GameContent, "registros" | "decisoes" | "fatos" | "conceitos" | "posicoes" | "propostas">;

/** A chave de uma referência: serve de identificador nos mapas, nos atributos e nas respostas de ordenação. */
export function refKey(referencia: PhaseRef): string {
  return `${referencia.tipo}:${referencia.id}`;
}

/** O título do registro apontado, como o conteúdo o escreve; `null` se o registro não veio. */
export function refTitle(referencia: PhaseRef, conteudo: TrailContent): string | null {
  const { tipo, id } = referencia;
  if (tipo === "acontecimento") return conteudo.registros[id]?.titulo ?? null;
  if (tipo === "decisao") return conteudo.decisoes[id]?.titulo ?? null;
  if (tipo === "fato") return conteudo.fatos[id]?.titulo ?? null;
  if (tipo === "conceito") return conteudo.conceitos[id]?.termo ?? null;
  // A proposta não tem título: é uma frase, e a frase é o que se mostra.
  if (tipo === "proposta") return conteudo.propostas[id]?.texto ?? null;
  return conteudo.posicoes[id]?.titulo ?? null;
}

/** O rótulo curto do registro, para a etiqueta de uma pasta no cenário: o título, ou, para uma proposta, a área dela. */
export function refShortLabel(referencia: PhaseRef, conteudo: TrailContent): string | null {
  if (referencia.tipo !== "proposta") return refTitle(referencia, conteudo);
  const proposta = conteudo.propostas[referencia.id];
  return proposta === undefined ? null : `Proposta registrada no TSE: ${TEMA_LABELS[proposta.tema]}`;
}

/** A data do registro apontado, quando ele tem uma. */
export function refDate(referencia: PhaseRef, conteudo: TrailContent): DataHistorica | null {
  const { tipo, id } = referencia;
  if (tipo === "acontecimento") return conteudo.registros[id]?.data ?? null;
  if (tipo === "decisao") return conteudo.decisoes[id]?.data ?? null;
  if (tipo === "fato") return conteudo.fatos[id]?.data ?? null;
  return null;
}

/** O registro apontado está no conteúdo? */
export function isResolved(referencia: PhaseRef, conteudo: TrailContent): boolean {
  return refTitle(referencia, conteudo) !== null;
}

/**
 * Os registros que a atividade aponta: na pergunta, os que sustentam a
 * resposta; na ordenação, os itens; no dossiê, os documentos das fichas e os
 * distratores, nesta ordem.
 */
export function activityRefs(atividade: PhaseActivity): PhaseRef[] {
  if (atividade.tipo === "pergunta") return [...atividade.referencias];
  if (atividade.tipo === "ordem") return [...atividade.itens];
  return [...atividade.fichas.map((ficha) => ficha.evidencia), ...atividade.distratores];
}

/** Todos os registros que a fase aponta, sem repetição, na ordem em que aparecem: marco, explicação, atividade, explorar. */
export function phaseRefs(fase: Pick<PhaseSpec, "marco" | "explicacao" | "atividade" | "explorar">): PhaseRef[] {
  const vistos = new Set<string>();
  const lista: PhaseRef[] = [];
  const entrar = (referencia: PhaseRef) => {
    const chave = refKey(referencia);
    if (vistos.has(chave)) return;
    vistos.add(chave);
    lista.push(referencia);
  };
  entrar(fase.marco);
  for (const bloco of fase.explicacao) bloco.referencias.forEach(entrar);
  activityRefs(fase.atividade).forEach(entrar);
  fase.explorar.forEach(entrar);
  return lista;
}

// ---------------------------------------------------------------------------
// Estado de uma fase
// ---------------------------------------------------------------------------

export function initialPhaseProgress(): PhaseProgress {
  return { vista: false, tentativas: 0 };
}

export function isPhaseDone(estado: PhaseProgress | undefined): boolean {
  return estado?.concluida !== undefined;
}

/** A situação de uma fase, para a lista e para o resumo. */
export type PhaseStatus = "nova" | "vista" | "concluida";

export function phaseStatus(estado: PhaseProgress | undefined): PhaseStatus {
  if (estado === undefined) return "nova";
  if (estado.concluida !== undefined) return "concluida";
  return estado.vista ? "vista" : "nova";
}

/** Abrir a explicação marca a fase como vista. Abrir de novo não muda nada. */
export function markSeen(estado: PhaseProgress): PhaseProgress {
  return estado.vista ? estado : { ...estado, vista: true };
}

// ---------------------------------------------------------------------------
// Assinatura da atividade
// ---------------------------------------------------------------------------

/**
 * Um resumo curto e determinístico de um valor (FNV-1a de 32 bits sobre o
 * JSON dele), em oito dígitos hexadecimais. Não é segurança: é detecção de
 * mudança, igual no navegador e no Node.
 */
export function digestOf(valor: unknown): string {
  const texto = JSON.stringify(valor) ?? "null";
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i += 1) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

/**
 * O que decide a resposta certa de uma atividade: na pergunta, as opções e a
 * certa, pelos identificadores; na ordenação, os registros e as datas deles.
 * O texto (enunciado, opções, explicação) não entra: mudar a redação não
 * reabre a resposta (D-130).
 */
export function decisiveData(atividade: PhaseActivity, conteudo: TrailContent): unknown {
  if (atividade.tipo === "pergunta") {
    return { opcoes: atividade.opcoes.map((opcao) => opcao.id).sort(), correta: atividade.correta };
  }
  if (atividade.tipo === "dossie") {
    // O que decide o dossiê: cada ficha, o documento que a sustenta e o campo do trecho destacado. A gaveta (os distratores) e os textos não entram.
    return atividade.fichas.map((ficha) => [ficha.id, refKey(ficha.evidencia), ficha.destaque.campo] as const).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  }
  // Pela chave, e não na ordem em que a fase escreve os itens: essa ordem não decide a resposta, e trocá-la no conteúdo não pode reabrir a resposta de ninguém.
  return atividade.itens
    .map((item) => [refKey(item), refDate(item, conteudo)] as const)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
}

/**
 * A assinatura da atividade de uma fase: o identificador da fase, o tipo e o
 * resumo do que decide a resposta. Vai para o progresso salvo junto com a
 * conclusão; se uma correção editorial mudar o que decide a resposta, a
 * conclusão antiga deixa de valer, só nessa fase (src/lib/game/progress.ts).
 */
export function activitySignature(fase: Pick<PhaseSpec, "id" | "atividade">, conteudo: TrailContent): string {
  return `${fase.id}:${fase.atividade.tipo}@${digestOf(decisiveData(fase.atividade, conteudo))}`;
}

/** As assinaturas atuais das fases dadas, por `id`: é o que a entrada do jogo leva para ler o progresso sem carregar o conteúdo. */
export function signaturesOf(fases: readonly Pick<PhaseSpec, "id" | "atividade">[], conteudo: TrailContent): Record<string, string> {
  return Object.fromEntries(fases.map((fase) => [fase.id, activitySignature(fase, conteudo)]));
}

// ---------------------------------------------------------------------------
// Respostas
// ---------------------------------------------------------------------------

/** A avaliação de uma resposta, já aplicada ao estado da fase. A explicação é a da atividade, a mesma para acerto e erro. */
export interface Attempt {
  estado: PhaseProgress;
  certo: boolean;
}

/** Conclui a fase, pela resposta ou pela explicação, com a assinatura de hoje. Serve também ao dossiê (src/lib/game/dossier.ts). */
export function conclude(fase: Pick<PhaseSpec, "id" | "atividade">, estado: PhaseProgress, como: ActivityOutcome, conteudo: TrailContent): PhaseProgress {
  const proximo: PhaseProgress = { ...estado, vista: true, concluida: como, assinatura: activitySignature(fase, conteudo) };
  delete proximo.reaberta;
  return proximo;
}

/** Conta a tentativa; a resposta certa conclui a fase, e a errada não desfaz nada. */
function attempt(fase: Pick<PhaseSpec, "id" | "atividade">, estado: PhaseProgress, certo: boolean, conteudo: TrailContent): Attempt {
  const contado: PhaseProgress = { ...estado, vista: true, tentativas: estado.tentativas + 1 };
  return { estado: certo ? conclude(fase, contado, "resposta", conteudo) : contado, certo };
}

/** Responder a pergunta com o `id` de uma opção. Opção que a fase não tem é resposta errada. */
export function answerQuestion(fase: Pick<PhaseSpec, "id" | "atividade">, estado: PhaseProgress, opcaoId: string, conteudo: TrailContent): Attempt {
  if (fase.atividade.tipo !== "pergunta") throw new Error("A atividade desta fase não é uma pergunta.");
  return attempt(fase, estado, opcaoId === fase.atividade.correta, conteudo);
}

/**
 * A ordem cronológica dos registros de uma ordenação, pelas chaves. O
 * conjunto só publica uma ordenação quando as datas decidem a ordem; registro
 * sem data, que não deveria chegar aqui, fica no fim, na ordem da fase.
 */
export function correctOrder(atividade: Extract<PhaseActivity, { tipo: "ordem" }>, conteudo: TrailContent): string[] {
  return atividade.itens
    .map((item, indice) => ({ chave: refKey(item), data: refDate(item, conteudo), indice }))
    .sort((a, b) => {
      if (a.data === null || b.data === null) return a.data === b.data ? a.indice - b.indice : a.data === null ? 1 : -1;
      return compareDates(a.data, b.data) || a.indice - b.indice;
    })
    .map((item) => item.chave);
}

/** Responder a ordenação com as chaves dos registros, da mais antiga para a mais recente. */
export function answerOrder(fase: Pick<PhaseSpec, "id" | "atividade">, estado: PhaseProgress, resposta: readonly string[], conteudo: TrailContent): Attempt {
  if (fase.atividade.tipo !== "ordem") throw new Error("A atividade desta fase não é uma ordenação.");
  const certa = correctOrder(fase.atividade, conteudo);
  const certo = resposta.length === certa.length && resposta.every((chave, indice) => chave === certa[indice]);
  return attempt(fase, estado, certo, conteudo);
}

/**
 * "Ver a explicação e continuar": conclui a fase sem resposta. Quem já tinha
 * respondido certo continua com a resposta registrada.
 */
export function concludeByExplanation(fase: Pick<PhaseSpec, "id" | "atividade">, estado: PhaseProgress, conteudo: TrailContent): PhaseProgress {
  if (estado.concluida === "resposta") return estado;
  return conclude(fase, estado, "explicacao", conteudo);
}

/** As datas dos registros de uma ordenação, por extenso, na ordem certa: é o que a explicação mostra junto do texto da fase. */
export function orderDates(atividade: Extract<PhaseActivity, { tipo: "ordem" }>, conteudo: TrailContent): { chave: string; titulo: string; data: string }[] {
  const porChave = new Map(atividade.itens.map((item) => [refKey(item), item] as const));
  return correctOrder(atividade, conteudo).flatMap((chave) => {
    const item = porChave.get(chave);
    if (item === undefined) return [];
    const data = refDate(item, conteudo);
    return [{ chave, titulo: refTitle(item, conteudo) ?? item.id, data: data === null ? "sem data documentada" : formatDate(data) }];
  });
}

// ---------------------------------------------------------------------------
// Ordem de exibição das alternativas
// ---------------------------------------------------------------------------

/** O resumo de um texto, como número: o mesmo FNV-1a da assinatura, que espalha bem chaves que só diferem no fim ("a", "b", "c"). */
function hashOf(texto: string): number {
  return Number.parseInt(digestOf(texto), 16);
}

/**
 * Ordem estável para mostrar alternativas, sem a certa sempre na mesma
 * posição e sem depender de como o conteúdo foi escrito: pelo resumo da
 * chave de cada item, junto com a da fase. A mesma fase mostra sempre a
 * mesma ordem.
 */
export function displayOrder<T>(faseId: string, itens: readonly T[], chaveDe: (item: T) => string): T[] {
  return [...itens].sort((a, b) => {
    const ka = hashOf(`${faseId}:${chaveDe(a)}`);
    const kb = hashOf(`${faseId}:${chaveDe(b)}`);
    return ka === kb ? (chaveDe(a) < chaveDe(b) ? -1 : 1) : ka - kb;
  });
}

/**
 * A ordem em que os registros de uma ordenação aparecem na tela: a de
 * `displayOrder`, e nunca a ordem certa. Quando o resumo das chaves cai
 * justamente na resposta, a lista gira uma posição: a atividade não pode vir
 * resolvida, e não pode vir resolvida para uma pessoa e embaralhada para a
 * outra.
 */
export function orderingDisplay(fase: Pick<PhaseSpec, "id" | "atividade">, conteudo: TrailContent): PhaseRef[] {
  if (fase.atividade.tipo !== "ordem") throw new Error("A atividade desta fase não é uma ordenação.");
  const exibidos = displayOrder(fase.id, fase.atividade.itens, refKey);
  const certa = correctOrder(fase.atividade, conteudo);
  const resolvida = exibidos.length > 1 && exibidos.every((item, indice) => refKey(item) === certa[indice]);
  return resolvida ? [...exibidos.slice(1), exibidos[0]!] : exibidos;
}
