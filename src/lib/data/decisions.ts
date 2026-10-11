// A visão de leitura de uma decisão política (um voto parlamentar ou um ato do
// Executivo), com o que o cartão do atlas e o jogo mostram já resolvido: o
// cargo e a instituição do mandato pelo qual a pessoa decidiu, a proposição,
// o objeto votado e a manifestação registrada (ou o tipo do ato e os campos
// que o distinguem), as fontes com o que cada uma sustenta e a situação da
// revisão (docs/DATA_MODEL.md, seção Decisões). Funções puras sobre
// `AtlasData`: nada aqui escreve fato; os textos são os do conjunto, e os
// conectores são fixos.

import { compareDates } from "@/lib/domain/dates";
import {
  INSTITUICAO_LABELS,
  OBJETO_LABELS,
  TEMAS,
  type Instituicao,
  type ModalidadeDeVotacao,
  type ObjetoVotado,
  type ResultadoDeVotacao,
  type Tema,
  type TipoDeAto,
} from "@/lib/domain/decisions";
import type { AtoExecutivo, Citacao, DataHistorica, Editorial, Fonte, Mandato, Proposicao, RegistroIndividual, Votacao, Voto } from "@/lib/domain/types";

import { lookup, lookupList } from "./lookup";
import type { AtlasData } from "./types";

/** Uma fonte citada, com onde está o trecho e o que ele sustenta: o mesmo que a lista de fontes do atlas mostra. */
export interface DecisionSource {
  id: string;
  titulo: string;
  autoria: string;
  url: string;
  dataDocumento: Fonte["dataDocumento"];
  acessadoEm: string;
  localizacao: string;
  evidencia: string;
}

export interface DecisionProposicao {
  id: string;
  /** "PL 2253/2022", como a casa identifica; só a sigla quando o acervo não traz número e ano. */
  identificacao: string;
  ementa: string;
  instituicao: Instituicao;
  temas: readonly Tema[];
}

export interface DecisionVotacao {
  id: string;
  etapa: string;
  /** "Plenário" ou o nome da comissão. */
  orgao: string;
  objeto: { tipo: ObjetoVotado; identificacao: string | null; descricao: string };
  modalidade: ModalidadeDeVotacao;
  resultado: { estado: ResultadoDeVotacao; valorOriginal: string };
  /** O documento que diz o que foi votado, quando é outro que o do resultado. */
  textoReferencia: { titulo: string; url: string; localizacao: string } | null;
}

export interface DecisionAto {
  tipo: TipoDeAto;
  /** Como o ato é identificado: "Lei nº 14.843, de 11 de abril de 2024". */
  identificador: string;
  /** O documento oficial do ato, quando a fonte está no conjunto. */
  oficial: { titulo: string; url: string } | null;
  /** Os campos que distinguem o tipo (mensagem de veto, dispositivos, medida, decreto, evidência do procedimento), como o registro os traz. */
  detalhes: readonly { rotulo: string; valor: string }[];
}

interface DecisionBase {
  id: string;
  pessoaId: string;
  /** Identificação curta, montada de campos do registro com conectores fixos: "Votação: PL 2253/2022, texto principal" ou o identificador do ato. */
  titulo: string;
  data: DataHistorica;
  temas: readonly Tema[];
  /** A casa ou o órgão da decisão. */
  instituicao: Instituicao;
  /** O mandato pelo qual a pessoa decidiu, como o conjunto o registra; `null` se o mandato não está publicado. */
  cargo: { mandatoId: string; cargo: string; instituicao: string } | null;
  proposicoes: readonly DecisionProposicao[];
  fontes: readonly DecisionSource[];
  editorial: Editorial;
}

export type DecisionView =
  | (DecisionBase & { natureza: "voto"; votacao: DecisionVotacao; registro: RegistroIndividual })
  | (DecisionBase & { natureza: "ato"; ato: DecisionAto });

/** A situação da revisão sem as observações internas, que o cartão não mostra. */
export function reviewOf(editorial: Editorial): Editorial {
  if (editorial.estado !== "revisado") return { estado: editorial.estado };
  const { tipo, revisadoPor, revisadoEm } = editorial.revisao;
  return { estado: "revisado", revisao: { tipo, revisadoPor, revisadoEm } };
}

/** "PL 2253/2022"; só a sigla quando falta número ou ano. */
export function proposicaoLabel(proposicao: Pick<Proposicao, "tipo" | "numero" | "ano">): string {
  return proposicao.numero !== null && proposicao.ano !== null ? `${proposicao.tipo} ${proposicao.numero}/${proposicao.ano}` : proposicao.tipo;
}

function fonteDe(data: AtlasData, fonteId: string): Fonte | undefined {
  const posicao = lookup(data.indices.fontes.porId, fonteId);
  return posicao === undefined ? undefined : data.conjunto.fontes[posicao];
}

/** As fontes de um registro, na ordem das citações, com onde está o trecho e o que ele sustenta. */
export function sourcesOf(data: AtlasData, citacoes: readonly Citacao[]): DecisionSource[] {
  return citacoes.flatMap((citacao) => {
    const fonte = fonteDe(data, citacao.fonteId);
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

function mandatoDe(data: AtlasData, mandatoId: string): Mandato | undefined {
  const posicao = lookup(data.indices.mandatos.porId, mandatoId);
  return posicao === undefined ? undefined : data.conjunto.mandatos[posicao];
}

function proposicaoDe(data: AtlasData, proposicaoId: string): DecisionProposicao | undefined {
  const posicao = lookup(data.indices.proposicoes.porId, proposicaoId);
  const proposicao = posicao === undefined ? undefined : data.conjunto.proposicoes[posicao];
  if (proposicao === undefined) return undefined;
  return { id: proposicao.id, identificacao: proposicaoLabel(proposicao), ementa: proposicao.ementa, instituicao: proposicao.instituicao, temas: proposicao.temas };
}

function cargoDe(mandato: Mandato | undefined): DecisionBase["cargo"] {
  return mandato === undefined ? null : { mandatoId: mandato.id, cargo: mandato.cargo, instituicao: mandato.instituicao };
}

function votacaoDe(data: AtlasData, votacaoId: string): Votacao | undefined {
  const posicao = lookup(data.indices.votacoes.porId, votacaoId);
  return posicao === undefined ? undefined : data.conjunto.votacoes[posicao];
}

/** A visão de um voto. `null` se a votação ou a proposição que ele cita não estão no conjunto. */
export function viewOfVote(data: AtlasData, voto: Voto): DecisionView | null {
  const votacao = votacaoDe(data, voto.votacaoId);
  if (votacao === undefined) return null;
  const proposicao = proposicaoDe(data, votacao.proposicaoId);
  if (proposicao === undefined) return null;
  const referencia = votacao.objeto.textoReferencia;
  const fonteDaReferencia = referencia === null ? undefined : fonteDe(data, referencia.fonteId);
  return {
    natureza: "voto",
    id: voto.id,
    pessoaId: voto.pessoaId,
    titulo: `Votação: ${proposicao.identificacao}, ${OBJETO_LABELS[votacao.objeto.tipo].toLowerCase()}`,
    data: votacao.data,
    temas: proposicao.temas,
    instituicao: votacao.instituicao,
    cargo: cargoDe(mandatoDe(data, voto.mandatoId)),
    proposicoes: [proposicao],
    votacao: {
      id: votacao.id,
      etapa: votacao.etapa,
      orgao: votacao.orgao.tipo === "plenario" ? "Plenário" : votacao.orgao.nome,
      objeto: { tipo: votacao.objeto.tipo, identificacao: votacao.objeto.identificacao, descricao: votacao.objeto.descricao },
      modalidade: votacao.modalidade,
      resultado: { estado: votacao.resultadoOficial.estado, valorOriginal: votacao.resultadoOficial.valorOriginal },
      textoReferencia:
        referencia === null || fonteDaReferencia === undefined ? null : { titulo: fonteDaReferencia.titulo, url: fonteDaReferencia.url, localizacao: referencia.localizacao },
    },
    registro: voto.registro,
    // As fontes do voto e, depois, as da votação: o que sustenta a manifestação e o que sustenta o objeto e o resultado.
    fontes: [...sourcesOf(data, voto.fontes), ...sourcesOf(data, votacao.fontes).filter((fonte) => !voto.fontes.some((citacao) => citacao.fonteId === fonte.id))],
    editorial: reviewOf(voto.editorial),
  };
}

function detalhesDoAto(ato: AtoExecutivo): DecisionAto["detalhes"] {
  switch (ato.tipo) {
    case "veto-parcial":
      return [
        { rotulo: "Mensagem de veto", valor: ato.mensagem },
        { rotulo: "Dispositivos vetados", valor: ato.dispositivosAlvo.join("; ") },
      ];
    case "veto-total":
      return [{ rotulo: "Mensagem de veto", valor: ato.mensagem }];
    case "medida-provisoria":
      return [
        { rotulo: "Medida provisória", valor: `${ato.medida.numero}/${ato.medida.ano}` },
        { rotulo: "Versão", valor: ato.versao },
      ];
    case "decreto":
      return [{ rotulo: "Decreto", valor: `${ato.decreto.numero}/${ato.decreto.ano}` }];
    case "sancao-tacita":
      return [{ rotulo: "Evidência do procedimento", valor: ato.evidenciaDoProcedimento }];
    default:
      return [];
  }
}

/** A visão de um ato do Executivo. */
export function viewOfAct(data: AtlasData, ato: AtoExecutivo): DecisionView {
  const mandato = mandatoDe(data, ato.atribuicao.mandatoId);
  const oficial = fonteDe(data, ato.atoOficial.fonteId);
  return {
    natureza: "ato",
    id: ato.id,
    pessoaId: ato.atribuicao.pessoaId,
    titulo: ato.atoOficial.identificador,
    data: ato.data,
    temas: ato.temas,
    instituicao: mandato?.casa ?? "presidencia-da-republica",
    cargo: cargoDe(mandato),
    proposicoes: ato.proposicaoIds.flatMap((id) => {
      const proposicao = proposicaoDe(data, id);
      return proposicao === undefined ? [] : [proposicao];
    }),
    ato: {
      tipo: ato.tipo,
      identificador: ato.atoOficial.identificador,
      oficial: oficial === undefined ? null : { titulo: oficial.titulo, url: oficial.url },
      detalhes: detalhesDoAto(ato),
    },
    fontes: sourcesOf(data, ato.fontes),
    editorial: reviewOf(ato.editorial),
  };
}

/** A visão de uma decisão pelo `id` de um voto ou de um ato. `null` quando não está no conjunto. */
export function findDecisionView(data: AtlasData, id: string): DecisionView | null {
  const posicaoDoVoto = lookup(data.indices.votos.porId, id);
  const voto = posicaoDoVoto === undefined ? undefined : data.conjunto.votos[posicaoDoVoto];
  if (voto !== undefined) return viewOfVote(data, voto);
  const posicaoDoAto = lookup(data.indices.atosExecutivos.porId, id);
  const ato = posicaoDoAto === undefined ? undefined : data.conjunto.atosExecutivos[posicaoDoAto];
  return ato === undefined ? null : viewOfAct(data, ato);
}

/** Ordem cronológica, com o `id` como desempate. */
export function compareDecisions(a: DecisionView, b: DecisionView): number {
  return compareDates(a.data, b.data) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
}

/**
 * As decisões publicadas de uma pessoa: os votos vigentes (um por votação) e
 * os atos atribuídos a ela, em ordem cronológica. Um voto retificado não
 * aparece: o cartão mostra o que vale; a retificação fica no conjunto.
 */
export function listDecisionViews(data: AtlasData, pessoaId: string): DecisionView[] {
  const votos = lookupList(data.indices.votos.porPessoa, pessoaId).flatMap((id) => {
    const posicao = lookup(data.indices.votos.porId, id);
    const voto = posicao === undefined ? undefined : data.conjunto.votos[posicao];
    if (voto === undefined || voto.situacao.tipo !== "vigente") return [];
    const view = viewOfVote(data, voto);
    return view === null ? [] : [view];
  });
  const atos = lookupList(data.indices.atosExecutivos.porPessoa, pessoaId).flatMap((id) => {
    const posicao = lookup(data.indices.atosExecutivos.porId, id);
    const ato = posicao === undefined ? undefined : data.conjunto.atosExecutivos[posicao];
    return ato === undefined ? [] : [viewOfAct(data, ato)];
  });
  return [...votos, ...atos].sort(compareDecisions);
}

/** As decisões por tema, na ordem das taxonomias; uma decisão com dois temas aparece nos dois. Todos os temas aparecem, mesmo vazios. */
export function groupDecisionsByTheme(decisoes: readonly DecisionView[]): Record<Tema, DecisionView[]> {
  const grupos = Object.fromEntries(TEMAS.map((tema) => [tema, [] as DecisionView[]])) as Record<Tema, DecisionView[]>;
  for (const decisao of decisoes) for (const tema of decisao.temas) grupos[tema].push(decisao);
  return grupos;
}

/** Os temas em que uma pessoa tem decisão publicada, na ordem das taxonomias. */
export function themesWithDecisions(decisoes: readonly DecisionView[]): Tema[] {
  const grupos = groupDecisionsByTheme(decisoes);
  return TEMAS.filter((tema) => grupos[tema].length > 0);
}

/** O rótulo da instituição de uma decisão, para o cartão. */
export function institutionLabel(decisao: DecisionView): string {
  return INSTITUICAO_LABELS[decisao.instituicao];
}
