// As propostas eleitorais como as telas as mostram (docs/DATA_MODEL.md, seção
// Propostas eleitorais): a frase do documento registrado na Justiça
// Eleitoral, a área, a ressalva e as fontes já resolvidas. Função pura sobre
// `AtlasData`.
//
// Uma proposta não é decisão: não entra em `decisions.ts`, não tem cargo nem
// data de ato, e nenhuma tela a soma nem a põe em ordem de valor.

import { TEMAS, type Tema } from "@/lib/domain/decisions";
import type { Citacao, Editorial, Fonte, PropostaEleitoral } from "@/lib/domain/types";

import { lookup } from "./lookup";
import { getSources } from "./queries";
import type { AtlasData } from "./types";

/** O aviso fixo de toda tela de propostas: o que uma proposta é e o que ela não é. */
export const PROPOSAL_NOTICE =
  "É uma frase do documento que a candidatura registrou na Justiça Eleitoral. Diz o que o documento propõe para um governo futuro: não é ato, não é voto e não é resultado. O atlas resume a frase sem acrescentar número, prazo ou valor que ela não traga.";

/** O aviso da seleção: três frases por área, e não o documento inteiro. */
export const PROPOSAL_SAMPLE_NOTICE =
  "O atlas registra três frases por área de cada documento, com a página. Não é o documento inteiro: cada um tem outras propostas nas mesmas áreas e capítulos fora delas. A falta de uma proposta aqui não quer dizer que a candidatura não a faz.";

/** O que a tela diz quando a edição não tem proposta de uma pessoa em uma área. */
export const PROPOSAL_PENDING = "Ainda não pesquisado nesta edição.";

export interface ProposalView {
  id: string;
  pessoaId: string;
  eleicao: number;
  tema: Tema;
  texto: string;
  ressalva: string | null;
  fontes: { citacao: Citacao; fonte: Fonte }[];
  editorial: Editorial;
}

function viewOf(data: AtlasData, proposta: PropostaEleitoral): ProposalView {
  return {
    id: proposta.id,
    pessoaId: proposta.pessoaId,
    eleicao: proposta.eleicao,
    tema: proposta.tema,
    texto: proposta.texto,
    ressalva: proposta.ressalva,
    fontes: getSources(data, proposta),
    editorial: proposta.editorial,
  };
}

/** As propostas de uma pessoa, na ordem do conjunto: pelos temas da taxonomia e, dentro de cada um, pelo identificador. */
export function listProposals(data: AtlasData, pessoaId: string): ProposalView[] {
  const ids = lookup(data.indices.propostasEleitorais.porPessoa, pessoaId) ?? [];
  return ids.flatMap((id) => {
    const posicao = lookup(data.indices.propostasEleitorais.porId, id);
    const proposta = posicao === undefined ? undefined : data.conjunto.propostasEleitorais[posicao];
    return proposta === undefined ? [] : [viewOf(data, proposta)];
  });
}

/** As propostas por tema. Todos os temas aparecem, mesmo vazios: é o que deixa a tela dizer "ainda não pesquisado". */
export function groupProposalsByTheme(propostas: readonly ProposalView[]): Record<Tema, ProposalView[]> {
  const grupos = Object.fromEntries(TEMAS.map((tema) => [tema, [] as ProposalView[]])) as Record<Tema, ProposalView[]>;
  for (const proposta of propostas) grupos[proposta.tema].push(proposta);
  return grupos;
}
