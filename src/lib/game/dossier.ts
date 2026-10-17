// As regras da missão de investigação "O documento diz o quê?" (D-151),
// puras, sobre a fase, o estado dela e o conteúdo que ela aponta.
//
// O ciclo: o Escrivão entrega fichas (afirmações em uma frase, escritas só
// com o que um documento registra); a pessoa abre os documentos da gaveta,
// guarda no dossiê os que achar úteis, relaciona cada ficha ao documento que
// a sustenta e aponta, no documento, o campo que sustenta o trecho destacado
// da ficha. Errar explica em que campos o documento escolhido difere do que a
// ficha pede, sem dizer qual é o certo, e deixa tentar de novo. Com todas as
// fichas conferidas, a fase é concluída pela resposta; "Ver a explicação e
// continuar" conclui pela leitura, como em toda fase.
//
// Os cinco campos de um documento são os do cartão de decisão do atlas
// (data, instituição, cargo, objeto e ação): nada aqui escreve fato; os
// textos são os do conjunto, e os conectores são fixos.

import { DESFECHO_DE_ATUACAO_LABELS, INSTITUICAO_LABELS, OBJETO_LABELS, POSICAO_LABELS, REGISTRO_INDIVIDUAL_LABELS, TIPO_DE_ATO_LABELS, TIPO_DE_ATUACAO_LABELS } from "@/lib/domain/decisions";
import { formatDate, yearOf } from "@/lib/domain/dates";
import { CAMPOS_DO_DOCUMENTO, CAMPO_LABELS, type CampoDoDocumento } from "@/lib/domain/game";

import { conclude, displayOrder, refKey, type TrailContent } from "./trail";
import type { DossierProgress, GameDecision, PhaseActivity, PhaseProgress, PhaseRef, PhaseSpec } from "./types";

export type DossierActivity = Extract<PhaseActivity, { tipo: "dossie" }>;
export type Ficha = DossierActivity["fichas"][number];

/** A fase de que as regras do dossiê precisam. */
export type DossierPhase = Pick<PhaseSpec, "id" | "atividade">;

export const EMPTY_DOSSIER: DossierProgress = { recolhidos: [], relacionadas: {}, conferidas: [] };

export function dossierOf(estado: PhaseProgress): DossierProgress {
  return estado.dossie ?? EMPTY_DOSSIER;
}

function withDossier(estado: PhaseProgress, dossie: DossierProgress): PhaseProgress {
  return { ...estado, vista: true, dossie };
}

/** A atividade da fase, quando é um dossiê; senão, um erro: as regras daqui só valem para a missão. */
export function dossierActivity(fase: DossierPhase): DossierActivity {
  if (fase.atividade.tipo !== "dossie") throw new Error("A atividade desta fase não é um dossiê.");
  return fase.atividade;
}

// ---------------------------------------------------------------------------
// A gaveta e os campos de um documento
// ---------------------------------------------------------------------------

/**
 * Os documentos da gaveta: os que sustentam fichas e os distratores, sem
 * repetição, em uma ordem estável que não depende de como o conteúdo foi
 * escrito e não deixa os documentos das fichas sempre na frente.
 */
export function drawerDocuments(fase: DossierPhase): PhaseRef[] {
  const atividade = dossierActivity(fase);
  const vistos = new Set<string>();
  const todos: PhaseRef[] = [];
  for (const referencia of [...atividade.fichas.map((ficha) => ficha.evidencia), ...atividade.distratores]) {
    if (vistos.has(refKey(referencia))) continue;
    vistos.add(refKey(referencia));
    todos.push(referencia);
  }
  return displayOrder(fase.id, todos, refKey);
}

/** Um campo de um documento, como a tela o escreve: o rótulo, o valor por extenso e um resumo curto, para os avisos. */
export interface DocumentField {
  campo: CampoDoDocumento;
  rotulo: string;
  valor: string;
  resumo: string;
}

/** O objeto de uma decisão: o que foi votado, o ato, ou a matéria. */
function objectOf(decisao: GameDecision): { valor: string; resumo: string } {
  if (decisao.natureza === "voto") {
    const { objeto, etapa } = decisao.votacao;
    const proposicao = decisao.proposicoes[0];
    const identificacao = objeto.identificacao === null ? OBJETO_LABELS[objeto.tipo] : `${OBJETO_LABELS[objeto.tipo]} (${objeto.identificacao})`;
    const materia = proposicao === undefined ? "" : ` da ${proposicao.identificacao}`;
    return {
      valor: `${identificacao}${materia}, ${etapa.toLowerCase()}. ${proposicao === undefined ? objeto.descricao : proposicao.ementa}`,
      resumo: `${OBJETO_LABELS[objeto.tipo].toLowerCase()}${materia}`,
    };
  }
  if (decisao.natureza === "ato") {
    const proposicao = decisao.proposicoes[0];
    return { valor: proposicao === undefined ? decisao.ato.identificador : `${decisao.ato.identificador}. ${proposicao.ementa}`, resumo: decisao.ato.identificador };
  }
  return { valor: `${decisao.atuacao.materia.identificador}. ${decisao.atuacao.materia.ementa}`, resumo: decisao.atuacao.materia.identificador };
}

/** A ação de uma decisão: a manifestação registrada, o tipo do ato, ou a autoria ou a relatoria com o destino da matéria. */
function actionOf(decisao: GameDecision): { valor: string; resumo: string } {
  if (decisao.natureza === "voto") {
    const { registro } = decisao.registro.tipo === "voto-individual" ? { registro: decisao.registro } : { registro: null };
    if (registro !== null) {
      return { valor: `Voto registrado: ${POSICAO_LABELS[registro.posicao]} (valor original: ${registro.valorOriginal})`, resumo: `voto ${POSICAO_LABELS[registro.posicao].toLowerCase()}` };
    }
    const rotulo = REGISTRO_INDIVIDUAL_LABELS[decisao.registro.tipo];
    return { valor: `${rotulo} (valor original: ${decisao.registro.valorOriginal})`, resumo: rotulo.toLowerCase() };
  }
  if (decisao.natureza === "ato") {
    const rotulo = TIPO_DE_ATO_LABELS[decisao.ato.tipo];
    return { valor: rotulo, resumo: rotulo.toLowerCase() };
  }
  const rotulo = TIPO_DE_ATUACAO_LABELS[decisao.atuacao.tipo];
  return { valor: `${rotulo}. ${DESFECHO_DE_ATUACAO_LABELS[decisao.atuacao.desfecho.tipo]}`, resumo: rotulo.toLowerCase() };
}

/** Os cinco campos de um documento, na ordem em que a chave de leitura os ensina. */
export function documentFields(decisao: GameDecision): DocumentField[] {
  const objeto = objectOf(decisao);
  const acao = actionOf(decisao);
  const valores: Record<CampoDoDocumento, { valor: string; resumo: string }> = {
    data: { valor: formatDate(decisao.data), resumo: String(yearOf(decisao.data)) },
    instituicao: { valor: INSTITUICAO_LABELS[decisao.instituicao], resumo: INSTITUICAO_LABELS[decisao.instituicao] },
    cargo: decisao.cargo === null ? { valor: "Mandato não publicado nesta edição", resumo: "mandato não publicado" } : { valor: `${decisao.cargo.cargo}, ${decisao.cargo.instituicao}`, resumo: decisao.cargo.cargo },
    objeto,
    acao,
  };
  return CAMPOS_DO_DOCUMENTO.map((campo) => ({ campo, rotulo: CAMPO_LABELS[campo], ...valores[campo] }));
}

export function fieldOf(decisao: GameDecision, campo: CampoDoDocumento): DocumentField {
  return documentFields(decisao).find((item) => item.campo === campo)!;
}

/** O documento apontado por uma chave (`decisao:<id>`), quando está no conteúdo. */
export function documentOf(chave: string, conteudo: TrailContent): GameDecision | null {
  const [tipo, ...resto] = chave.split(":");
  if (tipo !== "decisao") return null;
  return conteudo.decisoes[resto.join(":")] ?? null;
}

// ---------------------------------------------------------------------------
// Recolher documentos
// ---------------------------------------------------------------------------

export function isCollected(estado: PhaseProgress, chave: string): boolean {
  return dossierOf(estado).recolhidos.includes(chave);
}

/** Guardar um documento da gaveta no dossiê. Guardar de novo não muda nada, e um documento que a gaveta não tem é ignorado. */
export function collectDocument(fase: DossierPhase, estado: PhaseProgress, chave: string): PhaseProgress {
  if (!drawerDocuments(fase).some((referencia) => refKey(referencia) === chave)) return estado;
  const dossie = dossierOf(estado);
  if (dossie.recolhidos.includes(chave)) return estado;
  return withDossier(estado, { ...dossie, recolhidos: [...dossie.recolhidos, chave] });
}

/** Tirar um documento do dossiê. Uma ficha relacionada a ele continua relacionada: o que foi conferido não se perde. */
export function removeDocument(estado: PhaseProgress, chave: string): PhaseProgress {
  const dossie = dossierOf(estado);
  if (!dossie.recolhidos.includes(chave)) return estado;
  return withDossier(estado, { ...dossie, recolhidos: dossie.recolhidos.filter((item) => item !== chave) });
}

// ---------------------------------------------------------------------------
// Relacionar e conferir fichas
// ---------------------------------------------------------------------------

export type FichaStatus = "pendente" | "relacionada" | "conferida";

/** A situação de uma ficha: sem documento, com o documento certo relacionado, ou conferida (o campo também foi apontado). */
export function fichaStatus(estado: PhaseProgress, fichaId: string): FichaStatus {
  const dossie = dossierOf(estado);
  if (dossie.conferidas.includes(fichaId)) return "conferida";
  return dossie.relacionadas[fichaId] === undefined ? "pendente" : "relacionada";
}

/** Um campo em que o documento escolhido difere do que sustenta a ficha: o rótulo e o valor do documento escolhido, para a explicação. */
export interface Mismatch {
  campo: CampoDoDocumento;
  rotulo: string;
  /** O resumo do campo no documento escolhido. O do documento certo não é dito: a leitura decide. */
  valor: string;
}

/** Em que campos o documento escolhido difere do documento certo. Com documentos iguais, nenhum. */
export function mismatches(escolhido: GameDecision, certo: GameDecision): Mismatch[] {
  const camposDoCerto = documentFields(certo);
  return documentFields(escolhido).flatMap((campo) => {
    const doCerto = camposDoCerto.find((item) => item.campo === campo.campo)!;
    const diferente = campo.campo === "data" ? escolhido.data.valor !== certo.data.valor : campo.valor !== doCerto.valor;
    if (!diferente) return [];
    // Na data, o ano basta quando os anos diferem; no mesmo ano, a data inteira.
    const valor = campo.campo === "data" && yearOf(escolhido.data) !== yearOf(certo.data) ? String(yearOf(escolhido.data)) : campo.campo === "data" ? campo.valor : campo.resumo;
    return [{ campo: campo.campo, rotulo: campo.rotulo, valor }];
  });
}

/** A frase que explica um erro de relação, só com o que o documento escolhido registra. */
export function mismatchSentence(divergencias: readonly Mismatch[]): string {
  if (divergencias.length === 0) return "Este documento não sustenta esta ficha.";
  const partes = divergencias.map((item) => `${item.rotulo.toLowerCase()}: ${item.valor}`);
  return `Este documento não bate com a ficha em: ${partes.join("; ")}. Releia a ficha e confira outro documento do dossiê.`;
}

export interface MatchResult {
  estado: PhaseProgress;
  certo: boolean;
  /** No erro, os campos em que o documento escolhido difere do que sustenta a ficha. */
  divergencias: Mismatch[];
}

/**
 * Relacionar uma ficha a um documento do dossiê. A tentativa é contada, só
 * como informação. Certo guarda a relação; errado não desfaz nada e diz em
 * que campos o documento escolhido difere do que a ficha pede. Um documento
 * que não está no dossiê não pode ser relacionado.
 */
export function matchFicha(fase: DossierPhase, estado: PhaseProgress, fichaId: string, chave: string, conteudo: TrailContent): MatchResult {
  const atividade = dossierActivity(fase);
  const ficha = atividade.fichas.find((item) => item.id === fichaId);
  const dossie = dossierOf(estado);
  if (ficha === undefined || !dossie.recolhidos.includes(chave)) return { estado, certo: false, divergencias: [] };
  if (dossie.conferidas.includes(fichaId)) return { estado, certo: true, divergencias: [] };
  const contado: PhaseProgress = { ...estado, vista: true, tentativas: estado.tentativas + 1 };
  const certa = refKey(ficha.evidencia);
  if (chave === certa) {
    return { estado: withDossier(contado, { ...dossie, relacionadas: { ...dossie.relacionadas, [fichaId]: chave } }), certo: true, divergencias: [] };
  }
  const escolhido = documentOf(chave, conteudo);
  const correto = documentOf(certa, conteudo);
  return { estado: contado, certo: false, divergencias: escolhido === null || correto === null ? [] : mismatches(escolhido, correto) };
}

export interface InspectResult {
  estado: PhaseProgress;
  certo: boolean;
  /** O campo apontado, como o documento o escreve; `null` quando a ficha não estava relacionada. */
  campo: DocumentField | null;
  /** Todas as fichas ficaram conferidas: a fase foi concluída pela resposta. */
  concluiu: boolean;
}

/**
 * Apontar, no documento relacionado, o campo que sustenta o trecho destacado
 * da ficha. Certo confere a ficha e, com todas conferidas, conclui a fase
 * pela resposta. Errado conta a tentativa e devolve o campo apontado, para a
 * tela dizer o que ele registra.
 */
export function inspectField(fase: DossierPhase, estado: PhaseProgress, fichaId: string, campo: CampoDoDocumento, conteudo: TrailContent): InspectResult {
  const atividade = dossierActivity(fase);
  const ficha = atividade.fichas.find((item) => item.id === fichaId);
  const dossie = dossierOf(estado);
  const chave = dossie.relacionadas[fichaId];
  if (ficha === undefined || chave === undefined) return { estado, certo: false, campo: null, concluiu: false };
  const documento = documentOf(chave, conteudo);
  const apontado = documento === null ? null : fieldOf(documento, campo);
  if (dossie.conferidas.includes(fichaId)) return { estado, certo: true, campo: apontado, concluiu: false };
  const contado: PhaseProgress = { ...estado, vista: true, tentativas: estado.tentativas + 1 };
  if (campo !== ficha.destaque.campo) return { estado: contado, certo: false, campo: apontado, concluiu: false };
  const conferidas = [...dossie.conferidas, fichaId];
  const proximo = withDossier(contado, { ...dossie, conferidas });
  const completo = atividade.fichas.every((item) => conferidas.includes(item.id));
  return { estado: completo ? conclude(fase, proximo, "resposta", conteudo) : proximo, certo: true, campo: apontado, concluiu: completo };
}

/** Todas as fichas da fase estão conferidas? */
export function isDossierComplete(fase: DossierPhase, estado: PhaseProgress): boolean {
  const dossie = dossierOf(estado);
  return dossierActivity(fase).fichas.every((ficha) => dossie.conferidas.includes(ficha.id));
}

// ---------------------------------------------------------------------------
// O andamento e a solução
// ---------------------------------------------------------------------------

export interface DossierSummary {
  documentos: number;
  totalDocumentos: number;
  relacionadas: number;
  conferidas: number;
  totalFichas: number;
}

export function dossierSummary(fase: DossierPhase, estado: PhaseProgress): DossierSummary {
  const atividade = dossierActivity(fase);
  const dossie = dossierOf(estado);
  return {
    documentos: dossie.recolhidos.length,
    totalDocumentos: drawerDocuments(fase).length,
    relacionadas: atividade.fichas.filter((ficha) => dossie.relacionadas[ficha.id] !== undefined).length,
    conferidas: atividade.fichas.filter((ficha) => dossie.conferidas.includes(ficha.id)).length,
    totalFichas: atividade.fichas.length,
  };
}

/** O andamento em uma linha, para o cartão da fase: "Dossiê: 2 de 6 documentos · fichas conferidas: 1 de 3". */
export function dossierLine(resumo: DossierSummary): string {
  return `Dossiê: ${resumo.documentos} de ${resumo.totalDocumentos} documentos · fichas conferidas: ${resumo.conferidas} de ${resumo.totalFichas}`;
}

/** Cada ficha com o documento que a sustenta e o campo do trecho destacado: é o que a leitura mostra no lugar da resposta, e a fase concluída. */
export interface FichaSolution {
  ficha: Ficha;
  chave: string;
  documento: GameDecision | null;
  campo: DocumentField | null;
}

export function dossierSolution(fase: DossierPhase, conteudo: TrailContent): FichaSolution[] {
  return dossierActivity(fase).fichas.map((ficha) => {
    const chave = refKey(ficha.evidencia);
    const documento = documentOf(chave, conteudo);
    return { ficha, chave, documento, campo: documento === null ? null : fieldOf(documento, ficha.destaque.campo) };
  });
}

/** O texto de uma ficha em três partes: antes do trecho destacado, o trecho e o que vem depois. */
export function splitHighlight(ficha: Pick<Ficha, "texto" | "destaque">): { antes: string; trecho: string; depois: string } {
  const inicio = ficha.texto.indexOf(ficha.destaque.trecho);
  if (inicio < 0) return { antes: ficha.texto, trecho: "", depois: "" };
  return { antes: ficha.texto.slice(0, inicio), trecho: ficha.destaque.trecho, depois: ficha.texto.slice(inicio + ficha.destaque.trecho.length) };
}
