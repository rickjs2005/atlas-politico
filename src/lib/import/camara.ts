// Adaptador da Câmara dos Deputados (Dados Abertos, API v2): transforma o
// detalhe de uma votação (`/votacoes/{id}`) e a lista de votos dela
// (`/votacoes/{id}/votos`) em um pacote de importação para um deputado.
// Função pura: recebe as capturas e os parâmetros; nada de rede aqui.
//
// O contrato observado em 10 de outubro de 2026 (docs/DATA-PIPELINE.md,
// seção Importação de decisões): não há endpoint de votações por deputado
// (`/deputados/{id}/votacoes` responde 405); a lista `/votacoes` aceita
// janelas de no máximo três meses e páginas de até 100 itens; a lista de
// votos não traz os ausentes (a documentação diz isso), e a orientação de
// bancada é outro recurso, que não é voto. Votos individuais existem a
// partir de 2001; antes disso há votações sem votos, e a falta de linha não
// vira ausência. O detalhe traz `objetosPossiveis` e `proposicoesAfetadas`,
// únicos lugares com a proposição; `descricao` e
// `ultimaApresentacaoProposicao.descricao` descrevem o objeto.

import type { PosicaoDeVoto } from "@/lib/domain/decisions";

import { kebab } from "./capturas";
import { inferEtapa, inferObjeto, type PacoteDeImportacao } from "./senado";

export interface CamaraProposicaoRef {
  id: number | string;
  siglaTipo?: string | null;
  numero?: number | string | null;
  ano?: number | string | null;
  ementa?: string | null;
}

export interface CamaraVotacaoDetalhe {
  id: string;
  data: string;
  siglaOrgao?: string | null;
  idOrgao?: number | null;
  descricao?: string | null;
  aprovacao?: number | null;
  descUltimaAberturaVotacao?: string | null;
  ultimaApresentacaoProposicao?: { descricao?: string | null } | null;
  objetosPossiveis?: CamaraProposicaoRef[] | null;
  proposicoesAfetadas?: CamaraProposicaoRef[] | null;
}

export interface CamaraVoto {
  tipoVoto: string | null;
  dataRegistroVoto?: string | null;
  deputado_?: { id: number | string; nome?: string | null } | null;
}

export interface CamaraImportOptions {
  idDeputado: string;
  pessoaId: string;
  mandatoId: string;
  capturadoEm: string;
  /** Uma captura por votação (detalhe e votos juntos ou não): o id da que guarda a lista de votos. */
  capturaId: string;
  urlDetalhe: string;
  urlVotos: string;
}

const POSICOES: Record<string, PosicaoDeVoto> = { Sim: "FAVOR", Não: "CONTRA", Nao: "CONTRA", Abstenção: "ABSTENCAO", Abstencao: "ABSTENCAO", Obstrução: "OBSTRUCAO", Obstrucao: "OBSTRUCAO" };

const texto = (valor: unknown, padrao: string): string => {
  const limpo = typeof valor === "string" ? valor.trim() : typeof valor === "number" ? String(valor) : "";
  return limpo.length > 0 ? limpo : padrao;
};

export function proposicaoIdCamara(ref: CamaraProposicaoRef): string {
  const sigla = kebab(texto(ref.siglaTipo, "proposicao"));
  const numero = kebab(texto(ref.numero, ""));
  const ano = kebab(texto(ref.ano, ""));
  if (numero.length > 0 && ano.length > 0 && ano !== "0") return `camara-${sigla}-${numero}-${ano}`;
  return `camara-proposicao-${kebab(texto(ref.id, "sem-id"))}`;
}

/** O registro individual a partir de `tipoVoto`, com o valor original sempre guardado. */
export function registroDoVotoCamara(voto: CamaraVoto): { registro: Record<string, unknown>; pendencias: string[] } {
  const valor = texto(voto.tipoVoto, "");
  if (valor.length === 0) {
    return { registro: { tipo: "voto-individual", posicao: "OUTRO", valorOriginal: "(sem tipoVoto)" }, pendencias: ["O acervo não trouxe o tipo do voto: conferir no painel."] };
  }
  const posicao = POSICOES[valor];
  if (posicao !== undefined) return { registro: { tipo: "voto-individual", posicao, valorOriginal: valor }, pendencias: [] };
  if (/^artigo 17$/i.test(valor)) {
    return {
      registro: { tipo: "nao-votou-documentado", valorOriginal: valor, motivoDocumentado: "Registro 'Artigo 17' do painel da Câmara: quem preside a sessão não vota." },
      pendencias: ["Conferir na ata que o deputado presidia a sessão (artigo 17 do Regimento Interno)."],
    };
  }
  return {
    registro: { tipo: "voto-individual", posicao: "OUTRO", valorOriginal: valor },
    pendencias: [`Tipo de voto sem correspondência no importador: "${valor}". Classificar na revisão.`],
  };
}

/**
 * O pacote de importação de uma votação da Câmara para um deputado. Sem a
 * linha do deputado em `votos`, não há voto importado: a lista não traz
 * ausentes, e a ausência só entra com documento.
 */
export function normalizeCamaraVotacao(detalhe: CamaraVotacaoDetalhe, votos: readonly CamaraVoto[], options: CamaraImportOptions): PacoteDeImportacao {
  const fonteId = `camara-dadosabertos-votacao-${kebab(detalhe.id)}-${options.capturadoEm}`;
  const nota = (localizacao: string, evidencia: string) => ({ fonteId, localizacao, evidencia });
  const rascunho = (pendencias: string[]) => ({ estado: "rascunho", pendencias });

  const fonte = {
    id: fonteId,
    titulo: `Dados Abertos da Câmara dos Deputados: votação ${detalhe.id}`,
    autoria: "Câmara dos Deputados",
    url: options.urlDetalhe,
    dataDocumento: { tipo: "desconhecida" },
    acessadoEm: options.capturadoEm,
  };

  const referencia = (detalhe.proposicoesAfetadas ?? [])[0] ?? (detalhe.objetosPossiveis ?? [])[0] ?? null;
  const proposicaoId = referencia === null ? `camara-proposicao-sem-referencia-${kebab(detalhe.id)}` : proposicaoIdCamara(referencia);
  const proposicao = {
    id: proposicaoId,
    instituicao: "camara-dos-deputados",
    jurisdicao: "federal",
    identidadeExterna: { provedor: "camara", id: referencia === null ? detalhe.id : texto(referencia.id, detalhe.id) },
    tipo: texto(referencia?.siglaTipo, "proposição"),
    numero: referencia !== null && Number.isInteger(Number(referencia.numero)) && Number(referencia.numero) > 0 ? Number(referencia.numero) : null,
    ano: referencia !== null && Number.isInteger(Number(referencia.ano)) && Number(referencia.ano) > 0 ? Number(referencia.ano) : null,
    ementa: texto(referencia?.ementa, "Ementa não informada pelo acervo."),
    temas: [],
    fontes: [nota(`${referencia === null ? "sem proposição afetada" : "proposicoesAfetadas[0] ou objetosPossiveis[0]"} no detalhe da votação ${detalhe.id}`, `ementa: ${texto(referencia?.ementa, "(vazia)")}`)],
    editorial: rascunho([
      "Classificar os temas da proposição (decisão editorial).",
      referencia === null ? "O detalhe não traz proposição afetada: identificar a matéria na ata." : "Conferir que a proposição afetada é a matéria votada, e não só uma candidata.",
    ]),
  };

  const descricao = texto(detalhe.ultimaApresentacaoProposicao?.descricao, texto(detalhe.descricao, "Objeto não descrito pelo acervo."));
  const nominal = votos.length > 0;
  const orgao = texto(detalhe.siglaOrgao, "PLEN");
  const votacaoId = `camara-votacao-${kebab(detalhe.id)}`;
  const votacao = {
    id: votacaoId,
    proposicaoId,
    instituicao: "camara-dos-deputados",
    orgao: orgao === "PLEN" ? { tipo: "plenario" } : { tipo: "comissao", nome: orgao },
    identidadeExterna: { provedor: "camara", id: detalhe.id },
    data: { valor: texto(detalhe.data, "").slice(0, 10), precisao: "dia" },
    etapa: inferEtapa(texto(detalhe.descUltimaAberturaVotacao, descricao)),
    objeto: { tipo: inferObjeto(descricao), identificacao: null, descricao, textoReferencia: null, divergenciaDocumentada: null },
    modalidade: nominal ? "nominal" : "simbolica",
    resultadoOficial: {
      estado: detalhe.aprovacao === 1 ? "aprovado" : detalhe.aprovacao === 0 ? "rejeitado" : "outro",
      valorOriginal: `aprovacao: ${detalhe.aprovacao ?? "(vazio)"}; ${texto(detalhe.descricao, "(sem descrição)")}`,
    },
    fontes: [nota(`detalhe da votação ${detalhe.id}`, `descricao: ${texto(detalhe.descricao, "(vazia)")}; aprovacao: ${detalhe.aprovacao ?? "(vazio)"}`)],
    editorial: rascunho([
      "Conferir o objeto votado (texto, emenda, destaque, requerimento) na ata ou no painel.",
      nominal ? "Conferir o resultado oficial." : "A lista de votos veio vazia: votação simbólica, ou período sem registro individual no acervo. Conferir na ata.",
    ]),
  };

  const linha = votos.find((voto) => texto(voto.deputado_?.id, "") === options.idDeputado);
  const votosImportados: unknown[] = [];
  if (linha !== undefined) {
    const { registro, pendencias } = registroDoVotoCamara(linha);
    votosImportados.push({
      id: `camara-voto-${kebab(detalhe.id)}-${kebab(options.idDeputado)}`,
      votacaoId,
      pessoaId: options.pessoaId,
      mandatoId: options.mandatoId,
      registro,
      proveniencia: { provedor: "camara", registroExternoId: `${detalhe.id}:${options.idDeputado}`, capturaId: options.capturaId },
      situacao: { tipo: "vigente" },
      fontes: [{ fonteId, localizacao: `votos[] com deputado_.id=${options.idDeputado} na votação ${detalhe.id} (${options.urlVotos})`, evidencia: `tipoVoto: ${texto(linha.tipoVoto, "(vazio)")}` }],
      editorial: rascunho(["Conferir o voto contra o painel ou a ata da sessão.", ...pendencias]),
    });
  }

  return { fontes: [fonte], proposicoes: [proposicao], votacoes: [votacao], votos: votosImportados, coberturaPolitica: [] };
}

/** Junta pacotes de várias votações em um só, sem repetir fonte nem proposição. */
export function mergePacotes(pacotes: readonly PacoteDeImportacao[]): PacoteDeImportacao {
  const porId = <T>(itens: readonly T[]) => [...new Map(itens.map((item) => [(item as { id: string }).id, item])).values()];
  return {
    fontes: porId(pacotes.flatMap((pacote) => pacote.fontes)),
    proposicoes: porId(pacotes.flatMap((pacote) => pacote.proposicoes)),
    votacoes: porId(pacotes.flatMap((pacote) => pacote.votacoes)),
    votos: porId(pacotes.flatMap((pacote) => pacote.votos)),
    coberturaPolitica: porId(pacotes.flatMap((pacote) => pacote.coberturaPolitica)),
  };
}

/** A cobertura da pesquisa de uma varredura da Câmara por período. */
export function coberturaCamara(options: {
  idDeputado: string;
  pessoaId: string;
  capturadoEm: string;
  periodo: { de: string; ate: string };
  urlBase: string;
  votacoesVistas: number;
  votacoesComVotos: number;
  completa: boolean;
  lacunas: string[];
}): unknown {
  return {
    id: `camara-cobertura-${kebab(options.idDeputado)}-${options.capturadoEm}`,
    pessoaId: options.pessoaId,
    tema: "geral",
    periodo: { inicio: { tipo: "data", valor: options.periodo.de, precisao: "dia" }, fim: { tipo: "data", valor: options.periodo.ate, precisao: "dia" } },
    acervos: [
      {
        nome: "Dados Abertos da Câmara dos Deputados, votações e votos",
        url: options.urlBase,
        consultadoEm: options.capturadoEm,
        recorte: `de ${options.periodo.de} a ${options.periodo.ate}, em janelas de até três meses: ${options.votacoesVistas} votações vistas, ${options.votacoesComVotos} com lista de votos`,
        completa: options.completa,
      },
    ],
    criterios: "Todas as votações listadas pelo acervo no período, de qualquer órgão; o voto entra só quando a lista nominal traz o deputado.",
    estado: "parcial",
    lacunas: ["A lista de votos do acervo não traz ausentes; votos individuais existem no acervo a partir de 2001.", ...options.lacunas],
    fontes: [],
    editorial: { estado: "rascunho", pendencias: ["Conferir o recorte e decidir se a cobertura é completa para o período, depois de revisar os votos."] },
  };
}
