// A consulta comparativa: o que se pode dizer de uma pessoa em uma votação
// (docs/DATA_MODEL.md, seção Decisões). O resultado é discriminado de
// propósito. Cinco respostas, e nenhuma delas é juízo sobre a pessoa:
//
//   registro                     há um voto vigente, com o mandato pelo qual
//                                a pessoa participou;
//   nao-se-aplica                as datas documentadas dos mandatos provam
//                                que a pessoa não ocupava cargo com
//                                competência naquela casa e naquela data;
//   competencia-nao-confirmada   há mandato na casa, mas as datas (ou a
//                                falta do campo `casa`) não bastam para
//                                decidir;
//   sem-registro-individual      a pessoa podia votar, e o material não
//                                individualiza: votação simbólica ou secreta,
//                                ou acervo consultado por inteiro sem linha
//                                da pessoa;
//   pesquisa-pendente            a pessoa podia votar e a pesquisa do recorte
//                                não foi concluída ou não foi declarada.
//
// A diferença entre as duas últimas vem da cobertura da pesquisa
// (`coberturaPolitica`): "a fonte não individualiza" é uma afirmação; "a
// pesquisa ainda não encontrou" é uma limitação do conjunto. Função pura
// sobre `AtlasData`.

import { calcInterval, calcPeriodBounds, classifyOverlap } from "@/lib/domain/dates";
import type { Tema } from "@/lib/domain/decisions";
import { competenceOf, type Competencia } from "@/lib/domain/integrity";
import type { CoberturaPolitica, Mandato, Votacao, Voto } from "@/lib/domain/types";

import { lookup } from "./lookup";
import type { AtlasData } from "./types";

export type Participacao =
  | { tipo: "registro"; votacao: Votacao; voto: Voto; mandato: Mandato | null }
  | { tipo: "nao-se-aplica"; votacao: Votacao; motivo: string }
  | { tipo: "competencia-nao-confirmada"; votacao: Votacao; motivo: string; mandatos: Mandato[] }
  | { tipo: "sem-registro-individual"; votacao: Votacao; motivo: string; cobertura: CoberturaPolitica | null }
  | { tipo: "pesquisa-pendente"; votacao: Votacao; motivo: string; cobertura: CoberturaPolitica | null };

function findVotacao(data: AtlasData, votacaoId: string): Votacao | null {
  const posicao = lookup(data.indices.votacoes.porId, votacaoId);
  return posicao === undefined ? null : (data.conjunto.votacoes[posicao] ?? null);
}

function findVoto(data: AtlasData, votoId: string): Voto | null {
  const posicao = lookup(data.indices.votos.porId, votoId);
  return posicao === undefined ? null : (data.conjunto.votos[posicao] ?? null);
}

function findMandato(data: AtlasData, mandatoId: string): Mandato | null {
  const posicao = lookup(data.indices.mandatos.porId, mandatoId);
  return posicao === undefined ? null : (data.conjunto.mandatos[posicao] ?? null);
}

/** A cobertura da pesquisa que vale para a pessoa, o tema e a data: a mais completa entre as que tocam o recorte. */
function coverageFor(data: AtlasData, pessoaId: string, temas: readonly Tema[], votacao: Votacao, dataDeCorte: string): CoberturaPolitica | null {
  const ordem = { completa: 0, parcial: 1, pendente: 2 } as const;
  const candidatas = data.conjunto.coberturaPolitica
    .filter((item) => item.pessoaId === pessoaId)
    .filter((item) => item.tema === "geral" || temas.includes(item.tema))
    .filter((item) => classifyOverlap(calcPeriodBounds(item.periodo, dataDeCorte), calcInterval(votacao.data)) === "documentada")
    .sort((a, b) => ordem[a.estado] - ordem[b.estado]);
  return candidatas[0] ?? null;
}

/**
 * O que o conjunto permite afirmar sobre a participação de uma pessoa em uma
 * votação. `null` quando a votação não existe no conjunto.
 */
export function resolveParticipation(data: AtlasData, pessoaId: string, votacaoId: string): Participacao | null {
  const votacao = findVotacao(data, votacaoId);
  if (votacao === null) return null;

  const votoId = lookup(data.indices.votos.vigentePorVotacaoEPessoa, `${votacaoId}:${pessoaId}`);
  const voto = votoId === undefined ? null : findVoto(data, votoId);
  if (voto !== null) return { tipo: "registro", votacao, voto, mandato: findMandato(data, voto.mandatoId) };

  const { edicao } = data.conjunto;
  if (edicao === null) return { tipo: "pesquisa-pendente", votacao, motivo: "Nenhuma edição publicada.", cobertura: null };

  // Competência: pelos mandatos da pessoa na casa da votação.
  const mandatos = data.conjunto.mandatos.filter((item) => item.pessoaId === pessoaId);
  const semCasa = mandatos.filter((item) => item.casa === undefined);
  const daCasa = mandatos.filter((item) => item.casa === votacao.instituicao);
  const competencias = new Map<Mandato, Competencia>(daCasa.map((item) => [item, competenceOf(item, votacao.data, edicao.dataDeCorte)]));
  const competentes = daCasa.filter((item) => competencias.get(item) === "dentro");
  const incertos = daCasa.filter((item) => competencias.get(item) === "nao-confirmada");

  if (competentes.length === 0) {
    if (incertos.length > 0) {
      return {
        tipo: "competencia-nao-confirmada",
        votacao,
        motivo: "As datas documentadas do mandato não bastam para dizer se ele vigorava na data da votação.",
        mandatos: incertos,
      };
    }
    if (semCasa.length > 0) {
      return {
        tipo: "competencia-nao-confirmada",
        votacao,
        motivo: "Há mandatos sem a casa declarada no conjunto: a competência não pode ser derivada.",
        mandatos: semCasa,
      };
    }
    return {
      tipo: "nao-se-aplica",
      votacao,
      motivo:
        daCasa.length === 0
          ? "A pessoa não tem mandato documentado na casa desta votação."
          : "Os mandatos da pessoa nesta casa não vigoravam na data da votação, pelas datas documentadas.",
    };
  }

  if (votacao.modalidade !== "nominal") {
    return {
      tipo: "sem-registro-individual",
      votacao,
      motivo: votacao.modalidade === "secreta" ? "Votação secreta: o acervo não registra o voto de cada pessoa." : "Votação simbólica: não há registro individual.",
      cobertura: null,
    };
  }

  const proposicao = data.conjunto.proposicoes[lookup(data.indices.proposicoes.porId, votacao.proposicaoId) ?? -1];
  const cobertura = coverageFor(data, pessoaId, proposicao?.temas ?? [], votacao, edicao.dataDeCorte);
  if (cobertura !== null && cobertura.estado === "completa") {
    return {
      tipo: "sem-registro-individual",
      votacao,
      motivo: "O acervo consultado por inteiro para este recorte não traz registro individual da pessoa nesta votação.",
      cobertura,
    };
  }
  return {
    tipo: "pesquisa-pendente",
    votacao,
    motivo:
      cobertura === null
        ? "Nenhuma pesquisa foi declarada para a pessoa neste tema e período."
        : `A pesquisa declarada para este recorte está ${cobertura.estado === "parcial" ? "parcial" : "pendente"}.`,
    cobertura,
  };
}
