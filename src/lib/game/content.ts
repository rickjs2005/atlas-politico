// O recorte dos dados que a página do jogo entrega ao navegador: o
// personagem, as fases da sala aberta e só os registros que elas apontam
// (acontecimentos, decisões, fatos biográficos, conceitos, cargos, filiações
// e propostas eleitorais), já com as fontes resolvidas, como a ficha do atlas as mostra, e
// a situação da revisão. De todas as salas do personagem vai só o que o
// progresso salvo precisa para ser lido: os identificadores das fases e a
// assinatura da atividade de cada uma. Função pura sobre `AtlasData`.

import { findDecisionView, reviewOf } from "@/lib/data/decisions";
import { lookup } from "@/lib/data/lookup";
import { findEventById, findPersonBySlug } from "@/lib/data/queries";
import type { AtlasData } from "@/lib/data/types";
import { formatPeriod } from "@/lib/domain/dates";
import { SALAS_DO_JOGO } from "@/lib/domain/game";
import { findUndeterminedOrder } from "@/lib/domain/order";
import type { Citacao, FaseDoJogo } from "@/lib/domain/types";

import { presentationOf } from "./presentation";
import type { PhaseKey } from "./progress";
import { isSensitivePhase } from "./sensitivity";
import { phaseRefs, signaturesOf } from "./trail";
import type { GameConcept, GameContent, GameDecision, GameFact, GameLocation, GamePosition, GameProposal, GameRecord, GameSource, PersonagemSlug, PhaseSpec, RoomId, RoomSummary } from "./types";

/** As fontes de um registro, com o que o catálogo diz de cada documento; fonte que a edição não tem fica de fora. */
function sourcesOf(data: AtlasData, citacoes: readonly Citacao[]): GameSource[] {
  return citacoes.flatMap((citacao) => {
    const posicao = lookup(data.indices.fontes.porId, citacao.fonteId);
    const fonte = posicao === undefined ? undefined : data.conjunto.fontes[posicao];
    return fonte === undefined
      ? []
      : [
          {
            id: fonte.id,
            titulo: fonte.titulo,
            autoria: fonte.autoria,
            url: fonte.url,
            dataDocumento: fonte.dataDocumento,
            acessadoEm: fonte.acessadoEm,
            localizacao: citacao.localizacao,
            evidencia: citacao.evidencia,
          },
        ];
  });
}

/** Os nomes dos lugares documentados, na ordem do registro; lugar que a edição não tem fica de fora. */
function locationOf(data: AtlasData, localizacao: { tipo: "lugares"; lugarIds: readonly string[] } | { tipo: "nacional" } | { tipo: "desconhecida" }): GameLocation {
  if (localizacao.tipo !== "lugares") return { tipo: localizacao.tipo };
  const lugares = localizacao.lugarIds.flatMap((id) => {
    const posicao = lookup(data.indices.lugares.porId, id);
    const lugar = posicao === undefined ? undefined : data.conjunto.lugares[posicao];
    return lugar === undefined ? [] : [lugar.nome];
  });
  return lugares.length === 0 ? { tipo: "desconhecida" } : { tipo: "lugares", lugares };
}

/** As fases publicadas de um personagem em uma sala, na ordem de percurso. */
export function publishedPhases(data: AtlasData, pessoaId: string, sala: RoomId): FaseDoJogo[] {
  const ids = lookup(data.indices.fasesDoJogo.porPessoaESala, `${pessoaId}:${sala}`) ?? [];
  return ids.flatMap((id) => {
    const posicao = lookup(data.indices.fasesDoJogo.porId, id);
    const fase = posicao === undefined ? undefined : data.conjunto.fasesDoJogo[posicao];
    return fase === undefined ? [] : [fase];
  });
}

function phaseOf(fase: FaseDoJogo, personagem: PersonagemSlug): PhaseSpec {
  const { cena, epoca } = presentationOf(fase.id, personagem, fase.sala);
  const base = {
    id: fase.id,
    personagem,
    sala: fase.sala,
    numero: fase.ordem,
    titulo: fase.titulo,
    objetivo: fase.objetivo,
    periodo: fase.periodo,
    marco: fase.marco,
    explicacao: fase.explicacao,
    conceitos: fase.conceitos,
    atividade: fase.atividade,
    explorar: fase.explorar,
    lacunas: fase.lacunas,
    editorial: reviewOf(fase.editorial),
    cena,
    epoca,
  };
  return { ...base, sensivel: isSensitivePhase(base) };
}

/** As salas do personagem com fase publicada, na ordem das salas. */
export function roomSummaries(data: AtlasData, pessoaId: string): RoomSummary[] {
  return SALAS_DO_JOGO.flatMap((sala) => {
    const fases = publishedPhases(data, pessoaId, sala);
    if (fases.length === 0) return [];
    return [{ id: sala, fases: fases.length, periodo: { de: Math.min(...fases.map((fase) => fase.periodo.de)), ate: Math.max(...fases.map((fase) => fase.periodo.ate)) } }];
  });
}

/** O conteúdo de uma sala do personagem. `null` quando a pessoa não está na edição; sala sem fase publicada vem com a lista vazia. */
export function buildGameContent(data: AtlasData, personagem: PersonagemSlug, sala: RoomId): GameContent | null {
  const pessoa = findPersonBySlug(data, personagem);
  if (pessoa === null) return null;

  const fases = publishedPhases(data, pessoa.id, sala).map((fase) => phaseOf(fase, personagem));
  const registros: Record<string, GameRecord> = {};
  const decisoes: Record<string, GameDecision> = {};
  const fatos: Record<string, GameFact> = {};
  const conceitos: Record<string, GameConcept> = {};
  const posicoes: Record<string, GamePosition> = {};
  const propostas: Record<string, GameProposal> = {};

  const { conjunto, indices } = data;
  const resolver = ({ tipo, id }: { tipo: string; id: string }) => {
    if (tipo === "acontecimento") {
      if (registros[id] !== undefined) return;
      const acontecimento = findEventById(data, id);
      if (acontecimento === null) return;
      registros[id] = {
        id: acontecimento.id,
        slug: acontecimento.slug,
        titulo: acontecimento.titulo,
        data: acontecimento.data,
        categoria: acontecimento.categoria,
        resumo: acontecimento.resumo,
        contexto: acontecimento.contexto,
        localizacao: locationOf(data, acontecimento.localizacao),
        fontes: sourcesOf(data, acontecimento.fontes),
        editorial: reviewOf(acontecimento.editorial),
        ordemEmAberto: false,
      };
    } else if (tipo === "decisao") {
      if (decisoes[id] !== undefined) return;
      const decisao = findDecisionView(data, id);
      // Só as decisões da pessoa, como o cartão do atlas as mostra.
      if (decisao !== null && decisao.pessoaId === pessoa.id) decisoes[id] = decisao;
    } else if (tipo === "fato") {
      if (fatos[id] !== undefined) return;
      const posicao = lookup(indices.fatosBiograficos.porId, id);
      const fato = posicao === undefined ? undefined : conjunto.fatosBiograficos[posicao];
      if (fato === undefined || fato.pessoaId !== pessoa.id) return;
      fatos[id] = {
        id: fato.id,
        tipo: fato.tipo,
        titulo: fato.titulo,
        data: fato.data.tipo === "data" ? { valor: fato.data.valor, precisao: fato.data.precisao } : null,
        texto: fato.texto,
        divergencia: fato.divergenciaDocumentada,
        fontes: sourcesOf(data, fato.fontes),
        editorial: reviewOf(fato.editorial),
      };
    } else if (tipo === "conceito") {
      if (conceitos[id] !== undefined) return;
      const posicao = lookup(indices.conceitos.porId, id);
      const conceito = posicao === undefined ? undefined : conjunto.conceitos[posicao];
      if (conceito === undefined) return;
      conceitos[id] = { id: conceito.id, termo: conceito.termo, definicao: conceito.definicao, simplificacao: conceito.simplificacao, fontes: sourcesOf(data, conceito.fontes), editorial: reviewOf(conceito.editorial) };
    } else if (tipo === "mandato") {
      if (posicoes[id] !== undefined) return;
      const posicao = lookup(indices.mandatos.porId, id);
      const mandato = posicao === undefined ? undefined : conjunto.mandatos[posicao];
      if (mandato === undefined || mandato.pessoaId !== pessoa.id) return;
      posicoes[id] = { id: mandato.id, natureza: "mandato", titulo: mandato.cargo, detalhe: mandato.instituicao, periodo: formatPeriod(mandato.periodo), fontes: sourcesOf(data, mandato.fontes), editorial: reviewOf(mandato.editorial) };
    } else if (tipo === "filiacao") {
      if (posicoes[id] !== undefined) return;
      const posicao = lookup(indices.filiacoes.porId, id);
      const filiacao = posicao === undefined ? undefined : conjunto.filiacoes[posicao];
      if (filiacao === undefined || filiacao.pessoaId !== pessoa.id) return;
      posicoes[id] = { id: filiacao.id, natureza: "filiacao", titulo: filiacao.partido.sigla, detalhe: filiacao.partido.nome, periodo: formatPeriod(filiacao.periodo), fontes: sourcesOf(data, filiacao.fontes), editorial: reviewOf(filiacao.editorial) };
    } else if (tipo === "proposta") {
      if (propostas[id] !== undefined) return;
      const posicao = lookup(indices.propostasEleitorais.porId, id);
      const proposta = posicao === undefined ? undefined : conjunto.propostasEleitorais[posicao];
      if (proposta === undefined || proposta.pessoaId !== pessoa.id) return;
      propostas[id] = { id: proposta.id, tema: proposta.tema, eleicao: proposta.eleicao, texto: proposta.texto, ressalva: proposta.ressalva, fontes: sourcesOf(data, proposta.fontes), editorial: reviewOf(proposta.editorial) };
    }
  };

  for (const fase of fases) {
    phaseRefs(fase).forEach(resolver);
    // Um conceito definido na fase entra mesmo que nenhum bloco o aponte.
    for (const id of fase.conceitos) resolver({ tipo: "conceito", id });
  }

  // O mesmo aviso da lista do atlas: quando a data de um registro não decide
  // a posição dele em relação a outro, o registro leva a marca.
  for (const id of findUndeterminedOrder(Object.values(registros))) {
    const registro = registros[id];
    if (registro !== undefined) registros[id] = { ...registro, ordemEmAberto: true };
  }

  return { personagem: { slug: personagem, nome: pessoa.nome }, sala, fases, registros, decisoes, fatos, conceitos, posicoes, propostas, salas: roomSummaries(data, pessoa.id) };
}

/**
 * O que a leitura do progresso salvo precisa saber do personagem inteiro, e
 * não só da sala aberta: todas as fases dele, com a sala de cada uma, e a
 * assinatura atual da atividade de cada fase. Sem isso, salvar em uma sala
 * descartaria o que foi feito nas outras.
 */
export interface ProgressKeys {
  fases: PhaseKey[];
  assinaturas: Record<string, string>;
}

export function buildProgressKeys(data: AtlasData, personagem: PersonagemSlug): ProgressKeys {
  const fases: PhaseKey[] = [];
  const assinaturas: Record<string, string> = {};
  for (const sala of SALAS_DO_JOGO) {
    const content = buildGameContent(data, personagem, sala);
    if (content === null) continue;
    for (const fase of content.fases) fases.push({ id: fase.id, sala: fase.sala });
    Object.assign(assinaturas, signaturesOf(content.fases, content));
  }
  return { fases, assinaturas };
}

/** Quantas fases a trajetória de um personagem tem na edição: é o que a entrada do atlas diz. */
export function countTrailPhases(data: AtlasData, personagem: PersonagemSlug): number {
  const pessoa = findPersonBySlug(data, personagem);
  return pessoa === null ? 0 : publishedPhases(data, pessoa.id, "historico").length;
}
