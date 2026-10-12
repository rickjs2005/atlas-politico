// A comparação curta (docs/COMPARISON.md, seção Resumo para começar): os
// cargos públicos de cada pessoa e o tipo de registro que o atlas tem de cada
// cargo e de cada área. Diz o tipo, e não a quantidade: nenhuma tela conta
// registros lado a lado, e uma área sem decisão é lacuna da pesquisa, e não
// uma conclusão sobre a pessoa. Funções puras sobre `AtlasData`.

import { calcPeriodBounds, formatPeriodYears } from "@/lib/domain/dates";
import { TEMAS, type Tema } from "@/lib/domain/decisions";
import type { Mandato } from "@/lib/domain/types";

import { listDecisionViews, type DecisionView } from "./decisions";
import { listProposals } from "./proposals";
import type { AtlasData } from "./types";

export type Natureza = DecisionView["natureza"];

/** A ordem em que os tipos de registro aparecem, sempre a mesma. */
export const NATUREZAS: readonly Natureza[] = ["voto", "ato", "atuacao"];

/** Como a comparação curta chama cada tipo de registro. */
export const NATUREZA_PLURAL: Record<Natureza, string> = {
  voto: "votos nominais",
  ato: "atos do Executivo",
  atuacao: "autoria ou relatoria de matérias",
};

/** O que a tela diz quando a edição não tem decisão de um cargo ou de uma área. Sem o ponto: quem escreve a frase o põe. */
export const NO_DECISION = "Nenhuma decisão publicada nesta edição";

/** O que cada cargo permite, em uma frase: é o que explica por que os tipos de registro são diferentes. */
export const OFFICE_NOTICE =
  "O cargo diz o que a pessoa podia fazer. Quem preside o país sanciona, veta e decreta; quem é deputado ou senador propõe, relata e vota. Por isso o resumo diz o tipo de registro de cada um, e não uma quantidade.";

/** O que uma célula vazia quer dizer. */
export const GAP_NOTICE = "Área ou cargo sem decisão é lacuna da pesquisa desta edição, e não uma conclusão sobre a pessoa.";

export interface OfficeOverview {
  mandatoId: string;
  cargo: string;
  instituicao: string;
  /** O período, só com os anos. */
  periodo: string;
  /** Os tipos de decisão que o atlas registra deste cargo, na ordem fixa; vazio quando não há nenhuma. */
  naturezas: Natureza[];
}

export interface AreaOverview {
  tema: Tema;
  /** Os tipos de decisão que o atlas registra da pessoa nesta área. */
  naturezas: Natureza[];
  /** A edição tem proposta eleitoral da pessoa nesta área. */
  propostas: boolean;
}

export interface PersonOverview {
  pessoaId: string;
  cargos: OfficeOverview[];
  /** Uma linha por área, na ordem das taxonomias, mesmo sem registro. */
  areas: AreaOverview[];
  /** Os tipos de decisão sem área: o assunto não cabe com clareza em nenhuma. */
  semArea: Natureza[];
}

const kindsOf = (decisoes: readonly DecisionView[]): Natureza[] => NATUREZAS.filter((natureza) => decisoes.some((decisao) => decisao.natureza === natureza));

/**
 * Os cargos públicos principais de uma pessoa: os mandatos com casa declarada
 * (um cargo em instituição pública) que não foram exercidos dentro de outro
 * mandato dela. A liderança de um partido no Senado ou a presidência de uma
 * comissão são funções de quem já é senador: ficam na lista completa de
 * cargos e funções, e não aqui. Em ordem cronológica.
 */
export function principalMandates(data: AtlasData, pessoaId: string): Mandato[] {
  const corte = data.conjunto.edicao?.dataDeCorte;
  if (corte === undefined) return [];
  const publicos = data.conjunto.mandatos.filter((mandato) => mandato.pessoaId === pessoaId && mandato.casa !== undefined);
  const limites = new Map(publicos.map((mandato) => [mandato.id, calcPeriodBounds(mandato.periodo, corte)] as const));
  const dentroDe = (interno: Mandato, externo: Mandato): boolean => {
    const a = limites.get(interno.id)!;
    const b = limites.get(externo.id)!;
    // Um limite desconhecido nunca vira data: sem as quatro pontas, não se afirma que um cabe no outro.
    if (a.inicio === null || a.fim === null || b.inicio === null || b.fim === null) return false;
    const igual = b.inicio.inicio === a.inicio.inicio && b.fim.fim === a.fim.fim;
    return !igual && b.inicio.inicio <= a.inicio.inicio && a.fim.fim <= b.fim.fim;
  };
  const inicioDe = (mandato: Mandato) => limites.get(mandato.id)!.inicio?.inicio ?? Number.NEGATIVE_INFINITY;
  return publicos
    .filter((mandato) => !publicos.some((outro) => outro.id !== mandato.id && dentroDe(mandato, outro)))
    .sort((a, b) => inicioDe(a) - inicioDe(b) || (a.id < b.id ? -1 : 1));
}

/** O resumo de uma pessoa: os cargos principais e as áreas, com o tipo de registro de cada um. */
export function buildOverview(data: AtlasData, pessoaId: string): PersonOverview {
  const decisoes = listDecisionViews(data, pessoaId);
  const propostas = listProposals(data, pessoaId);
  return {
    pessoaId,
    cargos: principalMandates(data, pessoaId).map((mandato) => ({
      mandatoId: mandato.id,
      cargo: mandato.cargo,
      instituicao: mandato.instituicao,
      periodo: formatPeriodYears(mandato.periodo),
      naturezas: kindsOf(decisoes.filter((decisao) => decisao.cargo?.mandatoId === mandato.id)),
    })),
    areas: TEMAS.map((tema) => ({
      tema,
      naturezas: kindsOf(decisoes.filter((decisao) => decisao.temas.includes(tema))),
      propostas: propostas.some((proposta) => proposta.tema === tema),
    })),
    semArea: kindsOf(decisoes.filter((decisao) => decisao.temas.length === 0)),
  };
}

/** Os tipos de registro por extenso: "votos nominais e autoria ou relatoria de matérias". `null` quando não há nenhum. */
export function describeKinds(naturezas: readonly Natureza[]): string | null {
  const nomes = naturezas.map((natureza) => NATUREZA_PLURAL[natureza]);
  if (nomes.length === 0) return null;
  if (nomes.length === 1) return nomes[0]!;
  return `${nomes.slice(0, -1).join(", ")} e ${nomes.at(-1)}`;
}
