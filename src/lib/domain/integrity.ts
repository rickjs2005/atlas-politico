// Verificações que dependem do conjunto inteiro. Os schemas garantem que cada
// registro é bem formado; aqui se confere que eles se encaixam.
//
// Ids e slugs únicos, referências resolvidas, data de corte, a competência do
// mandato nas decisões políticas (docs/DATA_MODEL.md, seção Decisões) e as
// duas regras de publicação, aplicadas a um conjunto completo. O pipeline de
// dados (src/lib/publication) faz a validação das fontes editoriais com
// diagnósticos por registro e usa estas funções para conferir a saída antes de
// gravá-la.

import { calcInterval, calcPeriodBounds, classifyOverlap, formatDate, intervalsOverlap, yearOf, type DataHistorica, type PeriodOverlap } from "./dates";
import type { Citacao, Conjunto, Mandato, ReferenciaDeFase } from "./schemas";

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
  "atuacoesLegislativas",
  "coberturaPolitica",
  "identidadesInstitucionais",
  "propostasEleitorais",
  "fatosBiograficos",
  "conceitos",
  "fasesDoJogo",
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

/** O que uma referência de fase resolve: de quem é o registro e, quando há, a data dele. */
export interface PhaseTarget {
  /** As pessoas do registro; `null` para um conceito, que não é de ninguém. */
  pessoaIds: readonly string[] | null;
  data: DataHistorica | null;
}

/**
 * Resolve as referências de uma fase contra o conjunto: `decisao` é um voto
 * (a data é a da votação), um ato do Executivo ou uma atuação legislativa.
 * Devolve `null` quando o registro não existe.
 */
export function phaseResolver(
  conjunto: Pick<Conjunto, "acontecimentos" | "votos" | "votacoes" | "atosExecutivos" | "atuacoesLegislativas" | "fatosBiograficos" | "mandatos" | "filiacoes" | "propostasEleitorais" | "conceitos">,
): (referencia: ReferenciaDeFase) => PhaseTarget | null {
  const acontecimentos = new Map(conjunto.acontecimentos.map((item) => [item.id, item] as const));
  const votos = new Map(conjunto.votos.map((item) => [item.id, item] as const));
  const votacoes = new Map(conjunto.votacoes.map((item) => [item.id, item] as const));
  const atos = new Map(conjunto.atosExecutivos.map((item) => [item.id, item] as const));
  const atuacoes = new Map(conjunto.atuacoesLegislativas.map((item) => [item.id, item] as const));
  const fatos = new Map(conjunto.fatosBiograficos.map((item) => [item.id, item] as const));
  const mandatos = new Map(conjunto.mandatos.map((item) => [item.id, item] as const));
  const filiacoes = new Map(conjunto.filiacoes.map((item) => [item.id, item] as const));
  const propostas = new Map(conjunto.propostasEleitorais.map((item) => [item.id, item] as const));
  const conceitos = new Set(conjunto.conceitos.map((item) => item.id));
  return ({ tipo, id }) => {
    if (tipo === "acontecimento") {
      const alvo = acontecimentos.get(id);
      return alvo === undefined ? null : { pessoaIds: alvo.pessoaIds, data: alvo.data };
    }
    if (tipo === "decisao") {
      const voto = votos.get(id);
      if (voto !== undefined) return { pessoaIds: [voto.pessoaId], data: votacoes.get(voto.votacaoId)?.data ?? null };
      const ato = atos.get(id);
      if (ato !== undefined) return { pessoaIds: [ato.atribuicao.pessoaId], data: ato.data };
      const atuacao = atuacoes.get(id);
      return atuacao === undefined ? null : { pessoaIds: [atuacao.pessoaId], data: atuacao.data };
    }
    if (tipo === "fato") {
      const alvo = fatos.get(id);
      return alvo === undefined ? null : { pessoaIds: [alvo.pessoaId], data: alvo.data.tipo === "data" ? { valor: alvo.data.valor, precisao: alvo.data.precisao } : null };
    }
    if (tipo === "mandato") {
      const alvo = mandatos.get(id);
      return alvo === undefined ? null : { pessoaIds: [alvo.pessoaId], data: null };
    }
    if (tipo === "filiacao") {
      const alvo = filiacoes.get(id);
      return alvo === undefined ? null : { pessoaIds: [alvo.pessoaId], data: null };
    }
    if (tipo === "proposta") {
      const alvo = propostas.get(id);
      return alvo === undefined ? null : { pessoaIds: [alvo.pessoaId], data: null };
    }
    return conceitos.has(id) ? { pessoaIds: null, data: null } : null;
  };
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
  const { proposicoes, votacoes, votos, atosExecutivos, atuacoesLegislativas, coberturaPolitica, identidadesInstitucionais } = conjunto;
  const { propostasEleitorais, fatosBiograficos, conceitos, fasesDoJogo } = conjunto;
  const colecoes = {
    pessoas,
    mandatos,
    filiacoes,
    acontecimentos,
    proposicoes,
    votacoes,
    votos,
    atosExecutivos,
    atuacoesLegislativas,
    coberturaPolitica,
    identidadesInstitucionais,
    propostasEleitorais,
    fatosBiograficos,
    conceitos,
    fasesDoJogo,
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

  for (const atuacao of atuacoesLegislativas) {
    const caminho = `atuacoesLegislativas["${atuacao.id}"]`;
    requireReference(pessoaIds, atuacao.pessoaId, `${caminho}.pessoaId`, "pessoa");
    requireReference(mandatoIds, atuacao.mandatoId, `${caminho}.mandatoId`, "mandato");
    // Em uma comissão mista do Congresso, a pessoa atua pelo mandato da casa dela: a casa só é conferida fora do Congresso Nacional.
    checkMandate(`${caminho}.mandatoId`, atuacao.pessoaId, atuacao.mandatoId, atuacao.data, atuacao.instituicao === "congresso-nacional" ? undefined : atuacao.instituicao);
    checkCitations(caminho, atuacao.fontes);
    checkCut(`${caminho}.data`, atuacao.data);
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

  for (const proposta of propostasEleitorais) {
    const caminho = `propostasEleitorais["${proposta.id}"]`;
    requireReference(pessoaIds, proposta.pessoaId, `${caminho}.pessoaId`, "pessoa");
    checkCitations(caminho, proposta.fontes);
    // A proposta é de uma eleição até a data de corte: o documento de uma eleição futura não entra.
    if (proposta.eleicao > Number(edicao.dataDeCorte.slice(0, 4))) report(`${caminho}.eleicao`, `Eleição posterior à data de corte da edição (${edicao.dataDeCorte}).`);
  }

  // -------------------------------------------------------------------------
  // Conteúdo educativo do jogo: fatos biográficos, conceitos e fases
  // -------------------------------------------------------------------------

  for (const fato of fatosBiograficos) {
    const caminho = `fatosBiograficos["${fato.id}"]`;
    requireReference(pessoaIds, fato.pessoaId, `${caminho}.pessoaId`, "pessoa");
    checkCitations(caminho, fato.fontes);
    if (fato.data.tipo === "data") checkCut(`${caminho}.data`, fato.data);
  }

  for (const conceito of conceitos) {
    checkCitations(`conceitos["${conceito.id}"]`, conceito.fontes);
  }

  const resolver = phaseResolver(conjunto);
  const conceitoIds = new Set(conceitos.map((conceito) => conceito.id));
  const posicoes = new Map<string, Map<number, string>>();
  for (const fase of fasesDoJogo) {
    const caminho = `fasesDoJogo["${fase.id}"]`;
    requireReference(pessoaIds, fase.pessoaId, `${caminho}.pessoaId`, "pessoa");

    const checkRef = (referencia: ReferenciaDeFase, campo: string) => {
      const alvo = resolver(referencia);
      if (alvo === null) {
        report(`${caminho}.${campo}`, `Referência a ${referencia.tipo} inexistente: "${referencia.id}".`);
        return;
      }
      if (alvo.pessoaIds !== null && !alvo.pessoaIds.includes(fase.pessoaId)) {
        report(`${caminho}.${campo}`, `O registro "${referencia.id}" é de outra pessoa: uma fase só aponta registros da pessoa dela.`);
      }
    };
    checkRef(fase.marco, "marco");
    fase.explicacao.forEach((bloco, indice) => bloco.referencias.forEach((referencia, posicao) => checkRef(referencia, `explicacao[${indice}].referencias[${posicao}]`)));
    fase.explorar.forEach((referencia, indice) => checkRef(referencia, `explorar[${indice}]`));
    for (const id of fase.conceitos) requireReference(conceitoIds, id, `${caminho}.conceitos`, "conceito");

    // O marco fica dentro do período declarado da fase.
    const marco = resolver(fase.marco);
    if (marco !== null && marco.data !== null) {
      const ano = yearOf(marco.data);
      if (ano < fase.periodo.de || ano > fase.periodo.ate) {
        report(`${caminho}.periodo`, `O marco é de ${ano}, fora do período da fase (${fase.periodo.de} a ${fase.periodo.ate}).`);
      }
    }

    const { atividade } = fase;
    if (atividade.tipo === "dossie") {
      atividade.fichas.forEach((ficha, indice) => checkRef(ficha.evidencia, `atividade.fichas[${indice}].evidencia`));
      atividade.distratores.forEach((referencia, indice) => checkRef(referencia, `atividade.distratores[${indice}]`));
    } else if (atividade.tipo === "pergunta") {
      atividade.referencias.forEach((referencia, indice) => checkRef(referencia, `atividade.referencias[${indice}]`));
    } else {
      atividade.itens.forEach((referencia, indice) => checkRef(referencia, `atividade.itens[${indice}]`));
      // A ordenação só vale quando as datas decidem a ordem, sem ambiguidade.
      const datas = atividade.itens.map((referencia) => resolver(referencia)?.data ?? null);
      datas.forEach((data, indice) => {
        if (data === null) {
          report(`${caminho}.atividade.itens[${indice}]`, "Registro sem data documentada não entra em uma ordenação.");
          return;
        }
        for (let outro = indice + 1; outro < datas.length; outro += 1) {
          const outra = datas[outro];
          if (outra === null || outra === undefined) continue;
          if (intervalsOverlap(calcInterval(data), calcInterval(outra))) {
            report(`${caminho}.atividade.itens`, `As datas de "${atividade.itens[indice]!.id}" (${formatDate(data)}) e de "${atividade.itens[outro]!.id}" (${formatDate(outra)}) não decidem a ordem.`);
          }
        }
      });
    }

    // Uma fase por posição em cada sala de cada pessoa.
    const chave = `${fase.pessoaId}:${fase.sala}`;
    const daSala = posicoes.get(chave) ?? new Map<number, string>();
    const outra = daSala.get(fase.ordem);
    if (outra !== undefined) report(`${caminho}.ordem`, `A posição ${fase.ordem} da sala "${fase.sala}" já é da fase "${outra}".`);
    else daSala.set(fase.ordem, fase.id);
    posicoes.set(chave, daSala);
  }
  // As posições de cada sala vão de 1 em diante, sem salto.
  for (const [chave, daSala] of posicoes) {
    const ordens = [...daSala.keys()].sort((a, b) => a - b);
    ordens.forEach((ordem, indice) => {
      if (ordem !== indice + 1) report(`fasesDoJogo["${daSala.get(ordem)}"].ordem`, `As fases de ${chave} não estão numeradas em sequência a partir de 1 (esperava ${indice + 1}, veio ${ordem}).`);
    });
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
