// Verificações que dependem do conjunto inteiro. Os schemas garantem que cada
// registro é bem formado; aqui se confere que eles se encaixam.
//
// Ids e slugs únicos, referências resolvidas, data de corte, a competência do
// mandato nas decisões políticas (docs/DATA_MODEL.md, seção Decisões) e as
// duas regras de publicação, aplicadas a um conjunto completo. O pipeline de
// dados (src/lib/publication) faz a validação das fontes editoriais com
// diagnósticos por registro e usa estas funções para conferir a saída antes de
// gravá-la.

import { calcInterval, calcPeriodBounds, classifyOverlap, formatDate, type DataHistorica, type PeriodOverlap } from "./dates";
import type { Citacao, Conjunto, Mandato } from "./schemas";

export interface IntegrityIssue {
  /** Onde está o problema, em formato legível: `acontecimentos["id"].fontes[0]`. */
  caminho: string;
  mensagem: string;
}

/** Todo identificador de fixture começa assim; nenhum registro publicado pode. */
export const SYNTHETIC_PREFIX = "sintetico-";

/**
 * As coleções com estado editorial, na visão do domínio. A lista do pipeline
 * (`COLECOES_FACTUAIS`, em src/lib/publication/sources.ts) tem de ser a mesma;
 * um teste confere.
 */
export const COLECOES_FACTUAIS_DO_CONJUNTO = [
  "pessoas",
  "mandatos",
  "filiacoes",
  "acontecimentos",
  "proposicoes",
  "votacoes",
  "votos",
  "atosExecutivos",
  "coberturaPolitica",
  "identidadesInstitucionais",
] as const;

/**
 * A pessoa podia participar de uma decisão pelo mandato: as datas documentadas
 * do mandato tocam a data da decisão (`dentro`), provam que não tocam (`fora`)
 * ou não bastam para dizer (`nao-confirmada`). Um limite desconhecido nunca
 * vira data; ele só impede a certeza.
 */
export type Competencia = "dentro" | "fora" | "nao-confirmada";

const COMPETENCIA: Record<PeriodOverlap, Competencia> = {
  documentada: "dentro",
  nenhuma: "fora",
  incerta: "nao-confirmada",
};

export function competenceOf(mandato: Pick<Mandato, "periodo">, data: DataHistorica, dataDeCorte: string): Competencia {
  return COMPETENCIA[classifyOverlap(calcPeriodBounds(mandato.periodo, dataDeCorte), calcInterval(data))];
}

function findDuplicates(valores: readonly string[]): string[] {
  const vistos = new Set<string>();
  const repetidos = new Set<string>();
  for (const valor of valores) {
    if (vistos.has(valor)) repetidos.add(valor);
    vistos.add(valor);
  }
  return [...repetidos];
}

export function checkIntegrity(conjunto: Conjunto): IntegrityIssue[] {
  const issues: IntegrityIssue[] = [];
  const report = (caminho: string, mensagem: string) => issues.push({ caminho, mensagem });

  const { edicao, pessoas, mandatos, filiacoes, acontecimentos, lugares, fontes, imagens } = conjunto;
  const { proposicoes, votacoes, votos, atosExecutivos, coberturaPolitica, identidadesInstitucionais } = conjunto;
  const colecoes = {
    pessoas,
    mandatos,
    filiacoes,
    acontecimentos,
    proposicoes,
    votacoes,
    votos,
    atosExecutivos,
    coberturaPolitica,
    identidadesInstitucionais,
    lugares,
    fontes,
    imagens,
  };

  for (const [nome, registros] of Object.entries(colecoes)) {
    for (const id of findDuplicates(registros.map((registro) => registro.id))) {
      report(nome, `Identificador repetido: "${id}".`);
    }
  }
  // Slugs viram endereço público; dois registros não podem disputar a mesma rota.
  for (const slug of findDuplicates(pessoas.map((pessoa) => pessoa.slug))) {
    report("pessoas", `Slug repetido: "${slug}".`);
  }
  for (const slug of findDuplicates(acontecimentos.map((item) => item.slug))) {
    report("acontecimentos", `Slug repetido: "${slug}".`);
  }

  const pessoaIds = new Set(pessoas.map((pessoa) => pessoa.id));
  const lugarIds = new Set(lugares.map((lugar) => lugar.id));
  const fonteIds = new Set(fontes.map((fonte) => fonte.id));
  const imagemIds = new Set(imagens.map((imagem) => imagem.id));
  const mandatoIds = new Set(mandatos.map((mandato) => mandato.id));
  const proposicaoIds = new Set(proposicoes.map((proposicao) => proposicao.id));
  const votacaoIds = new Set(votacoes.map((votacao) => votacao.id));
  const mandatoPorId = new Map(mandatos.map((mandato) => [mandato.id, mandato] as const));
  const votacaoPorId = new Map(votacoes.map((votacao) => [votacao.id, votacao] as const));
  const votoPorId = new Map(votos.map((voto) => [voto.id, voto] as const));

  const requireReference = (ids: Set<string>, id: string, caminho: string, alvo: string) => {
    if (!ids.has(id)) report(caminho, `Referência a ${alvo} inexistente: "${id}".`);
  };
  const checkCitations = (caminho: string, citacoes: Citacao[]) => {
    citacoes.forEach((citacao, indice) => {
      requireReference(fonteIds, citacao.fonteId, `${caminho}.fontes[${indice}]`, "fonte");
    });
  };
  const corte = calcInterval({ valor: edicao.dataDeCorte, precisao: "dia" }).fim;
  const checkCut = (caminho: string, data: DataHistorica) => {
    if (calcInterval(data).inicio > corte) {
      report(caminho, `Data posterior à data de corte da edição (${edicao.dataDeCorte}).`);
    }
  };

  for (const pessoa of pessoas) {
    const caminho = `pessoas["${pessoa.id}"]`;
    if (pessoa.retratoId !== null) {
      requireReference(imagemIds, pessoa.retratoId, `${caminho}.retratoId`, "imagem");
    }
    checkCitations(caminho, pessoa.fontes);
  }

  for (const mandato of mandatos) {
    const caminho = `mandatos["${mandato.id}"]`;
    requireReference(pessoaIds, mandato.pessoaId, `${caminho}.pessoaId`, "pessoa");
    checkCitations(caminho, mandato.fontes);
  }

  for (const filiacao of filiacoes) {
    const caminho = `filiacoes["${filiacao.id}"]`;
    requireReference(pessoaIds, filiacao.pessoaId, `${caminho}.pessoaId`, "pessoa");
    checkCitations(caminho, filiacao.fontes);
  }

  for (const acontecimento of acontecimentos) {
    const caminho = `acontecimentos["${acontecimento.id}"]`;
    for (const pessoaId of acontecimento.pessoaIds) {
      requireReference(pessoaIds, pessoaId, `${caminho}.pessoaIds`, "pessoa");
    }
    if (acontecimento.localizacao.tipo === "lugares") {
      for (const lugarId of acontecimento.localizacao.lugarIds) {
        requireReference(lugarIds, lugarId, `${caminho}.localizacao.lugarIds`, "lugar");
      }
    }
    if (acontecimento.imagemId !== null) {
      requireReference(imagemIds, acontecimento.imagemId, `${caminho}.imagemId`, "imagem");
    }
    checkCitations(caminho, acontecimento.fontes);
    checkCut(`${caminho}.data`, acontecimento.data);
  }

  // -------------------------------------------------------------------------
  // Decisões políticas
  // -------------------------------------------------------------------------

  /** O mandato pelo qual a pessoa agiu precisa ser dela e tocar a data da decisão. */
  const checkMandate = (caminho: string, pessoaId: string, mandatoId: string, data: DataHistorica, casa?: string) => {
    const mandato = mandatoPorId.get(mandatoId);
    if (mandato === undefined) return;
    if (mandato.pessoaId !== pessoaId) {
      // Com a pessoa do mandato inexistente, o problema já está apontado no mandato: sem cascata.
      if (pessoaIds.has(mandato.pessoaId)) report(caminho, `O mandato "${mandatoId}" é de outra pessoa ("${mandato.pessoaId}").`);
      return;
    }
    if (casa !== undefined && mandato.casa !== undefined && mandato.casa !== casa) {
      report(caminho, `O mandato é da casa "${mandato.casa}", e a decisão é de "${casa}".`);
    }
    if (competenceOf(mandato, data, edicao.dataDeCorte) === "fora") {
      report(caminho, `A data da decisão (${formatDate(data)}) fica fora do período documentado do mandato "${mandatoId}".`);
    }
  };

  for (const proposicao of proposicoes) {
    checkCitations(`proposicoes["${proposicao.id}"]`, proposicao.fontes);
  }

  for (const votacao of votacoes) {
    const caminho = `votacoes["${votacao.id}"]`;
    requireReference(proposicaoIds, votacao.proposicaoId, `${caminho}.proposicaoId`, "proposição");
    if (votacao.objeto.textoReferencia !== null) {
      requireReference(fonteIds, votacao.objeto.textoReferencia.fonteId, `${caminho}.objeto.textoReferencia.fonteId`, "fonte");
    }
    checkCitations(caminho, votacao.fontes);
    checkCut(`${caminho}.data`, votacao.data);
  }

  // Uma linha vigente por pessoa e votação; a retificada aponta a que a substituiu.
  const vigentes = new Map<string, string>();
  for (const voto of votos) {
    const caminho = `votos["${voto.id}"]`;
    requireReference(pessoaIds, voto.pessoaId, `${caminho}.pessoaId`, "pessoa");
    requireReference(mandatoIds, voto.mandatoId, `${caminho}.mandatoId`, "mandato");
    requireReference(votacaoIds, voto.votacaoId, `${caminho}.votacaoId`, "votação");
    checkCitations(caminho, voto.fontes);
    const votacao = votacaoPorId.get(voto.votacaoId);
    if (votacao !== undefined) checkMandate(`${caminho}.mandatoId`, voto.pessoaId, voto.mandatoId, votacao.data, votacao.instituicao);

    if (voto.situacao.tipo === "vigente") {
      const chave = `${voto.votacaoId}:${voto.pessoaId}`;
      const outro = vigentes.get(chave);
      if (outro !== undefined) {
        report(`${caminho}.situacao`, `Já há um voto vigente desta pessoa nesta votação: "${outro}". Retifique um dos dois.`);
      } else {
        vigentes.set(chave, voto.id);
      }
      continue;
    }
    const substituto = votoPorId.get(voto.situacao.substituidoPor);
    if (substituto === undefined) {
      report(`${caminho}.situacao.substituidoPor`, `Referência a voto inexistente: "${voto.situacao.substituidoPor}".`);
    } else if (substituto.votacaoId !== voto.votacaoId || substituto.pessoaId !== voto.pessoaId) {
      report(`${caminho}.situacao.substituidoPor`, `O voto "${substituto.id}" é de outra votação ou de outra pessoa: não pode substituir este.`);
    }
  }

  for (const ato of atosExecutivos) {
    const caminho = `atosExecutivos["${ato.id}"]`;
    requireReference(pessoaIds, ato.atribuicao.pessoaId, `${caminho}.atribuicao.pessoaId`, "pessoa");
    requireReference(mandatoIds, ato.atribuicao.mandatoId, `${caminho}.atribuicao.mandatoId`, "mandato");
    checkMandate(`${caminho}.atribuicao.mandatoId`, ato.atribuicao.pessoaId, ato.atribuicao.mandatoId, ato.data);
    for (const id of findDuplicates(ato.proposicaoIds)) {
      report(`${caminho}.proposicaoIds`, `A mesma proposição aparece mais de uma vez: "${id}".`);
    }
    for (const id of new Set(ato.proposicaoIds)) {
      requireReference(proposicaoIds, id, `${caminho}.proposicaoIds`, "proposição");
    }
    requireReference(fonteIds, ato.atoOficial.fonteId, `${caminho}.atoOficial.fonteId`, "fonte");
    checkCitations(caminho, ato.fontes);
    checkCut(`${caminho}.data`, ato.data);
  }

  for (const cobertura of coberturaPolitica) {
    const caminho = `coberturaPolitica["${cobertura.id}"]`;
    requireReference(pessoaIds, cobertura.pessoaId, `${caminho}.pessoaId`, "pessoa");
    checkCitations(caminho, cobertura.fontes);
  }

  for (const identidade of identidadesInstitucionais) {
    const caminho = `identidadesInstitucionais["${identidade.id}"]`;
    requireReference(pessoaIds, identidade.pessoaId, `${caminho}.pessoaId`, "pessoa");
    checkCitations(caminho, identidade.fontes);
  }

  edicao.cobertura.forEach((cobertura, indice) => {
    requireReference(pessoaIds, cobertura.pessoaId, `edicao.cobertura[${indice}].pessoaId`, "pessoa");
  });

  return issues;
}

/**
 * Regras extras para o conjunto que alimenta as páginas: só registros
 * revisados e nenhum dado sintético. `allowSynthetic` desliga a segunda regra
 * e existe só para a tela de prova e para os testes, que usam as fixtures.
 */
export function checkPublication(
  conjunto: Conjunto,
  options: { allowSynthetic?: boolean } = {},
): IntegrityIssue[] {
  const issues: IntegrityIssue[] = [];

  for (const nome of COLECOES_FACTUAIS_DO_CONJUNTO) {
    for (const registro of conjunto[nome]) {
      if (registro.editorial.estado !== "revisado") {
        issues.push({
          caminho: `${nome}["${registro.id}"].editorial`,
          mensagem: `Registro em estado "${registro.editorial.estado}" não pode ser publicado.`,
        });
      }
    }
  }

  if (options.allowSynthetic) return issues;

  const nomes = [...COLECOES_FACTUAIS_DO_CONJUNTO, "lugares", "fontes", "imagens"] as const;
  for (const nome of nomes) {
    const registros: readonly { id: string; slug?: string }[] = conjunto[nome];
    for (const registro of registros) {
      const slug = registro.slug ?? "";
      if (registro.id.startsWith(SYNTHETIC_PREFIX) || slug.startsWith(SYNTHETIC_PREFIX)) {
        issues.push({
          caminho: `${nome}["${registro.id}"]`,
          mensagem: "Dado sintético de teste não pode entrar no conjunto publicado.",
        });
      }
    }
  }

  return issues;
}
