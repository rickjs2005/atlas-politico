// Episódios judiciais: a natureza de cada registro e as decisões relacionadas,
// por identificador do conjunto publicado. Nada aqui é texto novo sobre as
// pessoas: a natureza é a que o próprio registro descreve, e cada relação
// repete o que o contexto do registro já diz, com a data do outro registro
// vindo dos dados. Um teste confere que todo identificador existe na edição e
// em uma fase do mesmo personagem.
//
// Denúncia, condenação, anulação, rejeição e absolvição são coisas
// diferentes, e o jogo não as equipara nem pede que o jogador decida culpa:
// mostra o que cada registro documenta e quando.

import type { GameRecord } from "./types";

export type JudicialKind = "denuncia" | "liminar" | "condenacao" | "confirmacao" | "prisao" | "decisao-eleitoral" | "soltura" | "anulacao" | "rejeicao";

/** Como a natureza aparece na ficha, sem equiparar o que é diferente. */
export const JUDICIAL_KIND_LABEL: Record<JudicialKind, string> = {
  denuncia: "Denúncia: uma acusação apresentada ao tribunal. Não é condenação.",
  liminar: "Decisão liminar: suspende um ato enquanto o caso não é julgado.",
  condenacao: "Condenação em primeira instância.",
  confirmacao: "Confirmação da condenação em segunda instância.",
  prisao: "Prisão.",
  "decisao-eleitoral": "Decisão do TSE sobre o registro de candidatura.",
  soltura: "Soltura.",
  anulacao: "Anulação de decisões anteriores. Não é absolvição nem condenação.",
  rejeicao: "Rejeição da denúncia. Não é absolvição nem condenação.",
};

/** O aviso que acompanha toda ficha judicial. */
export const JUDICIAL_NOTICE = "Denúncia, condenação, anulação, rejeição e absolvição são coisas diferentes. O jogo não pede que você decida culpa: mostra o que cada registro documenta e quando.";

export interface JudicialRelation {
  /** O `id` do outro registro, no conjunto publicado. */
  id: string;
  /** O que o contexto deste registro diz sobre o outro. */
  relacao: string;
}

export interface JudicialEntry {
  natureza: JudicialKind;
  /** Decisões anteriores e posteriores que o contexto do registro cita. */
  relacionados: readonly JudicialRelation[];
}

export const JUDICIAL: Record<string, JudicialEntry> = {
  "lula-2016-nomeacao-para-a-casa-civil-suspensa": { natureza: "liminar", relacionados: [] },
  "lula-2017-condenacao-em-primeira-instancia": {
    natureza: "condenacao",
    relacionados: [
      { id: "lula-2018-tribunal-confirma-condenacao", relacao: "A condenação foi confirmada em segunda instância, com aumento da pena." },
      { id: "lula-2021-stf-anula-condenacoes", relacao: "O STF anulou as decisões da 13ª Vara Federal de Curitiba, inclusive esta condenação." },
    ],
  },
  "lula-2018-tribunal-confirma-condenacao": {
    natureza: "confirmacao",
    relacionados: [
      { id: "lula-2017-condenacao-em-primeira-instancia", relacao: "A condenação confirmada." },
      { id: "lula-2018-prisao-em-curitiba", relacao: "A confirmação precedeu a prisão." },
      { id: "lula-2018-registro-de-candidatura-indeferido", relacao: "A condenação em segunda instância foi o fundamento citado no TSE." },
      { id: "lula-2021-stf-anula-condenacoes", relacao: "As condenações foram anuladas pelo STF." },
    ],
  },
  "lula-2018-prisao-em-curitiba": {
    natureza: "prisao",
    relacionados: [
      { id: "lula-2018-tribunal-confirma-condenacao", relacao: "A prisão decorreu da condenação confirmada pelo TRF4." },
      { id: "lula-2019-saida-da-prisao", relacao: "A saída da prisão." },
    ],
  },
  "lula-2018-registro-de-candidatura-indeferido": {
    natureza: "decisao-eleitoral",
    relacionados: [
      { id: "lula-2018-tribunal-confirma-condenacao", relacao: "A condenação em segunda instância foi o fundamento da inelegibilidade." },
      { id: "lula-2021-stf-anula-condenacoes", relacao: "Com a anulação das condenações, segundo a Agência Senado, Lula recuperou os direitos políticos." },
    ],
  },
  "lula-2019-saida-da-prisao": {
    natureza: "soltura",
    relacionados: [{ id: "lula-2018-prisao-em-curitiba", relacao: "A prisão que terminou." }],
  },
  "lula-2021-stf-anula-condenacoes": {
    natureza: "anulacao",
    relacionados: [
      { id: "lula-2017-condenacao-em-primeira-instancia", relacao: "Condenação anulada." },
      { id: "lula-2018-tribunal-confirma-condenacao", relacao: "Confirmação anulada." },
    ],
  },
  "flavio-bolsonaro-2020-denuncia-do-ministerio-publico": {
    natureza: "denuncia",
    relacionados: [
      { id: "flavio-bolsonaro-2021-stj-anula-decisoes-da-investigacao", relacao: "O STJ anulou decisões da primeira instância na investigação." },
      { id: "flavio-bolsonaro-2022-tribunal-rejeita-denuncia", relacao: "A denúncia foi rejeitada pelo Tribunal de Justiça, a pedido do próprio Ministério Público." },
    ],
  },
  "flavio-bolsonaro-2021-stj-anula-decisoes-da-investigacao": {
    natureza: "anulacao",
    relacionados: [
      { id: "flavio-bolsonaro-2020-denuncia-do-ministerio-publico", relacao: "A denúncia oferecida sobre a mesma investigação." },
      { id: "flavio-bolsonaro-2022-tribunal-rejeita-denuncia", relacao: "A denúncia foi rejeitada depois de anuladas as provas usadas na acusação." },
    ],
  },
  "flavio-bolsonaro-2022-tribunal-rejeita-denuncia": {
    natureza: "rejeicao",
    relacionados: [
      { id: "flavio-bolsonaro-2020-denuncia-do-ministerio-publico", relacao: "A denúncia rejeitada." },
      { id: "flavio-bolsonaro-2021-stj-anula-decisoes-da-investigacao", relacao: "Entre as provas anuladas, as decisões da primeira instância anuladas pelo STJ." },
    ],
  },
};

export function judicialOf(eventId: string): JudicialEntry | null {
  return JUDICIAL[eventId] ?? null;
}

export interface RelatedRecord {
  registro: GameRecord;
  relacao: string;
}

/** As decisões relacionadas a um registro, com a ficha de cada uma, na ordem cronológica das datas. */
export function relatedRecords(eventId: string, registros: Record<string, GameRecord>): RelatedRecord[] {
  const entrada = judicialOf(eventId);
  if (entrada === null) return [];
  const lista = entrada.relacionados.flatMap(({ id, relacao }) => {
    const registro = registros[id];
    return registro === undefined ? [] : [{ registro, relacao }];
  });
  return lista.sort((a, b) => (a.registro.data.valor < b.registro.data.valor ? -1 : a.registro.data.valor > b.registro.data.valor ? 1 : 0));
}
