// Adaptador do Senado Federal (Dados Abertos Legislativos): transforma a
// resposta de `GET /dadosabertos/votacao?codigoParlamentar=<código>` em um
// pacote de importação (proposições, votações, votos, cobertura da pesquisa
// e a fonte), tudo como rascunho. Função pura: recebe a captura e os
// parâmetros; nada de rede aqui.
//
// O contrato observado em 10 de outubro de 2026 (docs/DATA-PIPELINE.md,
// seção Importação de decisões): um array de `sessaoVotacao`, cada um com
// `codigoSessaoVotacao`, `dataSessao`, `identificacao` (ex. "PLP 185/2024"),
// `sigla`, `numero`, `ano`, `ementa`, `descricaoVotacao` (o objeto votado,
// nas palavras do acervo), `votacaoSecreta` ("S"/"N"), `resultadoVotacao`
// ("A"/"R"/...), totais e `votos[]` com `codigoParlamentar`,
// `siglaVotoParlamentar` e `descricaoVotoParlamentar`. O voto individual
// vem como "Sim", "Não" ou "Abstenção"; em votação secreta, "Votou"; a
// ausência e o não voto vêm como siglas de comparecimento (P-NRV, NCom,
// LS...), descritas em `/plenario/lista/tiposComparecimento`. A falta de uma
// linha não vira ausência: sem linha, não há voto importado.

import type { ObjetoVotado, PosicaoDeVoto } from "@/lib/domain/decisions";

import { kebab } from "./capturas";

export interface SenadoVoto {
  codigoParlamentar: number | string;
  nomeParlamentar?: string | null;
  siglaVotoParlamentar: string | null;
  descricaoVotoParlamentar?: string | null;
}

/** Os campos usados de `sessaoVotacao`; o resto é ignorado sem erro. */
export interface SenadoSessaoVotacao {
  codigoSessaoVotacao: number | string;
  codigoSessao?: number | string | null;
  dataSessao: string;
  siglaTipoSessao?: string | null;
  numeroSessao?: number | string | null;
  codigoMateria?: number | string | null;
  idProcesso?: number | string | null;
  identificacao?: string | null;
  sigla?: string | null;
  numero?: number | string | null;
  ano?: number | string | null;
  ementa?: string | null;
  descricaoVotacao?: string | null;
  votacaoSecreta?: string | null;
  resultadoVotacao?: string | null;
  totalVotosSim?: number | null;
  totalVotosNao?: number | null;
  totalVotosAbstencao?: number | null;
  votos?: SenadoVoto[] | null;
}

export interface SenadoImportOptions {
  codigoParlamentar: string;
  pessoaId: string;
  mandatoId: string;
  /** A URL consultada, para a fonte e a cobertura. */
  urlConsulta: string;
  /** Dia da captura (AAAA-MM-DD). */
  capturadoEm: string;
  capturaId: string;
  /** O recorte pedido, para a cobertura. */
  periodo: { de: string; ate: string };
  /** A lista oficial de tipos de comparecimento: sigla para descrição. */
  tiposComparecimento: Record<string, string>;
  /** A resposta veio inteira (sem corte por limite ou erro). */
  completa: boolean;
}

/** Siglas de comparecimento que documentam ausência (lista oficial do Senado). */
const AUSENCIAS = new Set(["NCom", "AUS", "AP", "MIS", "LP", "LPA", "LS", "LSP", "L2", "L3", "AFO", "DJ", "LL", "PER", "REN", "TER", "CAS"]);
/** Siglas que documentam presença sem voto. */
const NAO_VOTOU = new Set(["P-NRV", "NR", "PR", "PS", "EP", "EPR", "NH"]);
/** Posições de voto, pelo valor literal do acervo. */
const POSICOES: Record<string, PosicaoDeVoto> = { Sim: "FAVOR", Não: "CONTRA", Nao: "CONTRA", Abstenção: "ABSTENCAO", Abstencao: "ABSTENCAO", OB: "OBSTRUCAO", "P-OD": "OBSTRUCAO" };

/**
 * O objeto votado, pelas palavras do acervo. É uma primeira leitura; a revisão
 * confere contra a ata. O que abre a descrição manda: "Votação nominal do
 * Projeto..., ressalvados os destaques" é o texto principal, e não um
 * destaque; "da Proposta de Emenda à Constituição" é o texto da proposta, e
 * não uma emenda; um substitutivo é substitutivo mesmo quando chamado de
 * emenda (a edição 0.2.0 corrigiu à mão quatro leituras da versão anterior).
 */
export function inferObjeto(descricao: string): ObjetoVotado {
  const texto = descricao.toLowerCase();
  if (/substitutivo/.test(texto)) return "substitutivo";
  if (/^(votação( nominal)? )?(d[oa] (projeto|proposta|plv|pec|pl[pcsv]?|mpv|medida provis[óo]ria|parecer|texto)\b|pec\b|pl[pcsv]?\b|mpv\b)/.test(texto)) return "texto-principal";
  if (/\bemenda/.test(texto)) return "emenda";
  if (/destaque/.test(texto)) return "destaque";
  if (/requerimento|urg[êe]ncia|calend[áa]rio especial/.test(texto)) return "requerimento";
  if (/projeto|proposta|medida provis[óo]ria|\bpec\b|\bpl[pcsv]?\b|\bmpv\b|texto|parecer/.test(texto)) return "texto-principal";
  return "outro";
}

/** O turno, quando a descrição o diz: "(2º turno)", "em primeiro turno". */
export function inferEtapa(descricao: string): string {
  const turno = descricao.match(/\b(1º|2º|primeiro|segundo)\s+turno\b/i);
  if (turno !== null) return turno[0].toLowerCase().replace("primeiro", "1º").replace("segundo", "2º");
  if (/turno [úu]nico/i.test(descricao)) return "turno único";
  return "etapa não informada pelo acervo";
}

const RESULTADOS: Record<string, "aprovado" | "rejeitado"> = { A: "aprovado", R: "rejeitado" };

const texto = (valor: unknown, padrao: string): string => {
  const limpo = typeof valor === "string" ? valor.trim() : typeof valor === "number" ? String(valor) : "";
  return limpo.length > 0 ? limpo : padrao;
};

export function proposicaoIdSenado(item: Pick<SenadoSessaoVotacao, "sigla" | "numero" | "ano" | "codigoMateria" | "idProcesso">): string {
  const sigla = kebab(texto(item.sigla, "materia"));
  const numero = kebab(texto(item.numero, ""));
  const ano = kebab(texto(item.ano, ""));
  if (numero.length > 0 && ano.length > 0) return `senado-${sigla}-${numero}-${ano}`;
  return `senado-materia-${kebab(texto(item.codigoMateria ?? item.idProcesso, "sem-codigo"))}`;
}

/** O registro individual a partir da sigla do acervo, com o valor original sempre guardado. */
export function registroDoVoto(voto: SenadoVoto, secreta: boolean, tipos: Record<string, string>): { registro: Record<string, unknown>; pendencias: string[] } {
  const sigla = texto(voto.siglaVotoParlamentar, "");
  const descricao = texto(voto.descricaoVotoParlamentar, tipos[sigla] ?? sigla);
  if (sigla.length === 0) {
    return { registro: { tipo: "voto-individual", posicao: "OUTRO", valorOriginal: "(sem sigla)" }, pendencias: ["O acervo não trouxe a sigla do voto: conferir na lista nominal."] };
  }
  if (AUSENCIAS.has(sigla)) {
    return { registro: { tipo: "ausencia-documentada", valorOriginal: sigla, motivoDocumentado: descricao }, pendencias: [] };
  }
  if (NAO_VOTOU.has(sigla) || /^Presidente\b/i.test(sigla)) {
    return { registro: { tipo: "nao-votou-documentado", valorOriginal: sigla, motivoDocumentado: descricao }, pendencias: [] };
  }
  if (sigla === "Votou") {
    return {
      registro: { tipo: "voto-individual", posicao: "OUTRO", valorOriginal: sigla },
      pendencias: [secreta ? "Votação secreta: o acervo registra a participação, não a posição." : "O acervo registra 'Votou' sem a posição: conferir na lista nominal."],
    };
  }
  const posicao = POSICOES[sigla];
  if (posicao !== undefined) return { registro: { tipo: "voto-individual", posicao, valorOriginal: sigla }, pendencias: [] };
  return {
    registro: { tipo: "voto-individual", posicao: "OUTRO", valorOriginal: sigla },
    pendencias: [`Sigla de voto sem correspondência no importador: "${sigla}" (${descricao}). Classificar na revisão.`],
  };
}

export interface PacoteDeImportacao {
  fontes: unknown[];
  proposicoes: unknown[];
  votacoes: unknown[];
  votos: unknown[];
  coberturaPolitica: unknown[];
}

/**
 * O pacote de importação para um parlamentar. Cada votação vira uma votação e
 * o voto dele nela; cada matéria vira uma proposição (uma vez). A fonte é a
 * própria consulta, com a data de acesso; cada citação diz em qual item da
 * resposta está o dado. Tudo entra como rascunho, com as pendências do que a
 * revisão precisa conferir.
 */
export function normalizeSenado(itens: readonly SenadoSessaoVotacao[], options: SenadoImportOptions): PacoteDeImportacao {
  const fonteId = `senado-dadosabertos-votacao-${kebab(options.codigoParlamentar)}-${options.capturadoEm}`;
  const nota = (localizacao: string, evidencia: string) => ({ fonteId, localizacao, evidencia });
  const rascunho = (pendencias: string[]) => ({ estado: "rascunho", pendencias });

  const fonte = {
    id: fonteId,
    titulo: `Dados Abertos do Senado Federal: votações nominais do parlamentar ${options.codigoParlamentar}`,
    autoria: "Senado Federal",
    url: options.urlConsulta,
    dataDocumento: { tipo: "desconhecida" },
    acessadoEm: options.capturadoEm,
  };

  const proposicoes = new Map<string, unknown>();
  const votacoes: unknown[] = [];
  const votos: unknown[] = [];
  let semLinha = 0;

  for (const item of itens) {
    const codigoVotacao = texto(item.codigoSessaoVotacao, "");
    if (codigoVotacao.length === 0) continue;
    const onde = `item com codigoSessaoVotacao=${codigoVotacao}`;
    const proposicaoId = proposicaoIdSenado(item);
    if (!proposicoes.has(proposicaoId)) {
      proposicoes.set(proposicaoId, {
        id: proposicaoId,
        instituicao: "senado-federal",
        jurisdicao: "federal",
        identidadeExterna: { provedor: "senado", id: texto(item.codigoMateria ?? item.idProcesso, codigoVotacao) },
        tipo: texto(item.sigla, "matéria"),
        numero: Number.isInteger(Number(item.numero)) && Number(item.numero) > 0 ? Number(item.numero) : null,
        ano: Number.isInteger(Number(item.ano)) && Number(item.ano) > 0 ? Number(item.ano) : null,
        ementa: texto(item.ementa, "Ementa não informada pelo acervo."),
        temas: [],
        fontes: [nota(onde, `identificacao: ${texto(item.identificacao, "(vazia)")}; ementa: ${texto(item.ementa, "(vazia)")}`)],
        editorial: rascunho(["Classificar os temas da proposição (decisão editorial).", "Conferir a ementa e o número na ficha da matéria."]),
      });
    }

    const descricao = texto(item.descricaoVotacao, "Objeto não descrito pelo acervo.");
    const secreta = texto(item.votacaoSecreta, "N").toUpperCase() === "S";
    const resultado = texto(item.resultadoVotacao, "");
    const votacaoId = `senado-votacao-${kebab(codigoVotacao)}`;
    votacoes.push({
      id: votacaoId,
      proposicaoId,
      instituicao: "senado-federal",
      orgao: { tipo: "plenario" },
      identidadeExterna: { provedor: "senado", id: codigoVotacao },
      data: { valor: texto(item.dataSessao, "").slice(0, 10), precisao: "dia" },
      etapa: inferEtapa(descricao),
      objeto: { tipo: inferObjeto(descricao), identificacao: null, descricao, textoReferencia: null },
      modalidade: secreta ? "secreta" : "nominal",
      resultadoOficial: { estado: RESULTADOS[resultado] ?? "outro", valorOriginal: resultado.length > 0 ? resultado : "(não informado)" },
      fontes: [
        nota(
          onde,
          `descricaoVotacao: ${descricao}; resultadoVotacao: ${resultado || "(vazio)"}; totais Sim/Não/Abstenção: ${item.totalVotosSim ?? "?"}/${item.totalVotosNao ?? "?"}/${item.totalVotosAbstencao ?? "?"}`,
        ),
      ],
      editorial: rascunho(["Conferir o objeto votado e o turno contra a ata ou o painel da sessão.", "Conferir o resultado oficial."]),
    });

    const voto = (item.votos ?? []).find((candidato) => texto(candidato.codigoParlamentar, "") === options.codigoParlamentar);
    if (voto === undefined) {
      semLinha += 1;
      continue;
    }
    const { registro, pendencias } = registroDoVoto(voto, secreta, options.tiposComparecimento);
    votos.push({
      id: `senado-voto-${kebab(codigoVotacao)}-${kebab(options.codigoParlamentar)}`,
      votacaoId,
      pessoaId: options.pessoaId,
      mandatoId: options.mandatoId,
      registro,
      proveniencia: { provedor: "senado", registroExternoId: `${codigoVotacao}:${options.codigoParlamentar}`, capturaId: options.capturaId },
      situacao: { tipo: "vigente" },
      fontes: [nota(`votos[] com codigoParlamentar=${options.codigoParlamentar}, no ${onde}`, `siglaVotoParlamentar: ${texto(voto.siglaVotoParlamentar, "(vazia)")}`)],
      editorial: rascunho(["Conferir o voto contra a lista nominal da sessão (ata ou painel).", ...pendencias]),
    });
  }

  const cobertura = {
    id: `senado-cobertura-${kebab(options.codigoParlamentar)}-${options.capturadoEm}`,
    pessoaId: options.pessoaId,
    tema: "geral",
    periodo: { inicio: { tipo: "data", valor: options.periodo.de, precisao: "dia" }, fim: { tipo: "data", valor: options.periodo.ate, precisao: "dia" } },
    acervos: [
      {
        nome: "Dados Abertos do Senado Federal, votações nominais do Plenário",
        url: options.urlConsulta,
        consultadoEm: options.capturadoEm,
        recorte: `codigoParlamentar=${options.codigoParlamentar}, de ${options.periodo.de} a ${options.periodo.ate}: ${itens.length} votações na resposta`,
        completa: options.completa,
      },
    ],
    criterios: "Todas as votações do Plenário em que o acervo registra o parlamentar, no período; as de comissão não entram (serviço próprio, votacaoComissao).",
    estado: "parcial",
    lacunas: [
      "Votações em comissões não foram importadas.",
      "Em votação secreta o acervo registra só a participação, sem a posição.",
      ...(semLinha > 0 ? [`${semLinha} votações da resposta não trazem linha do parlamentar: ficaram sem voto importado.`] : []),
    ],
    fontes: [],
    editorial: rascunho(["Conferir o recorte e decidir se a cobertura é completa para o período, depois de revisar os votos."]),
  };

  return { fontes: [fonte], proposicoes: [...proposicoes.values()], votacoes, votos, coberturaPolitica: [cobertura] };
}

/** A lista oficial de tipos de comparecimento, como um mapa sigla → descrição. */
export function tiposComparecimentoDe(resposta: unknown): Record<string, string> {
  const lista = (resposta as { ListaTiposComparecimento?: { TiposComparecimento?: { TipoComparecimento?: { Sigla?: string; Descricao?: string }[] } } })
    ?.ListaTiposComparecimento?.TiposComparecimento?.TipoComparecimento;
  const mapa: Record<string, string> = {};
  for (const tipo of lista ?? []) {
    if (typeof tipo.Sigla === "string" && typeof tipo.Descricao === "string") mapa[tipo.Sigla] = tipo.Descricao;
  }
  return mapa;
}
