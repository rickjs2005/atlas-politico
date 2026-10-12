// Decisões políticas (docs/DATA_MODEL.md, seção Decisões): os contratos de
// proposição, votação, voto, ato do Executivo, cobertura da pesquisa e
// identidade institucional; as regras entre registros (competência do
// mandato, voto vigente único, retificação, casa da decisão); a passagem pelo
// pipeline, pelos índices e pela barreira de release; e a consulta
// comparativa, que responde cinco coisas diferentes e nunca inventa ausência.

import { afterEach, describe, expect, it } from "vitest";

import { readSources } from "@/lib/content/sources";
import { buildIndexes } from "@/lib/data/indexes";
import { resolveParticipation } from "@/lib/data/participation";
import { sliceForPerson } from "@/lib/data/slice";
import { PARTICIPACOES, TEMAS } from "@/lib/domain/decisions";
import { COLECOES_FACTUAIS_DO_CONJUNTO, checkIntegrity, competenceOf } from "@/lib/domain/integrity";
import { atoExecutivoSchema, coberturaPoliticaSchema, mandatoSchema, votacaoSchema, votoSchema } from "@/lib/domain/schemas";
import type { Conjunto, Voto } from "@/lib/domain/types";
import { releaseIssues } from "@/lib/editorial/release";
import { formatDiagnostic } from "@/lib/publication/diagnostics";
import { planImport } from "@/lib/publication/import";
import { COLECOES_FACTUAIS } from "@/lib/publication/sources";
import { validateSources } from "@/lib/publication/validate";

import { baseContent, createProject, fixturePaths, loadAtlasData, loadFixtures, removeProjects, type ContentFiles, type TestProject } from "./helpers";

afterEach(removeProjects);

const data = loadAtlasData();
const A = "sintetico-pessoa-a";
const B = "sintetico-pessoa-b";

/** Projeto descartável com o conteúdo de base (as fixtures sem o prefixo reservado), depois de alterado pela função. */
function project(alterar: (base: ReturnType<typeof baseContent>) => void = () => {}, drafts: ContentFiles = {}): TestProject {
  const base = baseContent();
  alterar(base);
  return createProject({ published: base, drafts });
}

const errorLines = (projeto: TestProject) =>
  projeto
    .result()
    .diagnostics.filter((item) => item.severidade === "erro")
    .map(formatDiagnostic)
    .sort();
const withCode = (projeto: TestProject, codigo: string) => projeto.result().diagnostics.filter((item) => item.codigo === codigo);

describe("contratos", () => {
  it("as fixtures sintéticas passam pelo contrato e pelo pipeline, sem erro", () => {
    expect(data.conjunto.proposicoes).toHaveLength(3);
    expect(data.conjunto.votacoes).toHaveLength(6);
    expect(data.conjunto.votos).toHaveLength(3);
    expect(data.conjunto.atosExecutivos).toHaveLength(1);
    expect(data.conjunto.coberturaPolitica).toHaveLength(2);
    expect(data.conjunto.identidadesInstitucionais).toHaveLength(1);
  });

  it("o domínio e o pipeline listam as mesmas coleções factuais", () => {
    expect([...COLECOES_FACTUAIS_DO_CONJUNTO]).toEqual([...COLECOES_FACTUAIS]);
  });

  it("veto parcial exige os dispositivos; sanção tácita, a evidência do procedimento; medida provisória, a identificação", () => {
    const base = loadFixtures().atosExecutivos[0]!;
    const semDispositivos = { ...base, dispositivosAlvo: [] };
    expect(atoExecutivoSchema.safeParse(semDispositivos).success).toBe(false);

    // Os campos comuns a todo ato, sem os que são só do veto parcial.
    const comum = Object.fromEntries(Object.entries(base).filter(([chave]) => !["tipo", "mensagem", "dispositivosAlvo"].includes(chave)));
    expect(atoExecutivoSchema.safeParse({ ...comum, tipo: "sancao-tacita" }).success).toBe(false);
    expect(atoExecutivoSchema.safeParse({ ...comum, tipo: "sancao-tacita", evidenciaDoProcedimento: "Decurso do prazo publicado." }).success).toBe(true);
    expect(atoExecutivoSchema.safeParse({ ...comum, tipo: "medida-provisoria" }).success).toBe(false);
    expect(atoExecutivoSchema.safeParse({ ...comum, tipo: "medida-provisoria", medida: { numero: 1, ano: 1997 }, versao: "original" }).success).toBe(true);
    // Sanção e veto se referem a uma proposição: a lista não pode ficar vazia.
    expect(atoExecutivoSchema.safeParse({ ...comum, tipo: "sancao-expressa", proposicaoIds: [] }).success).toBe(false);
    // Não existe "voto presidencial".
    expect(atoExecutivoSchema.safeParse({ ...comum, tipo: "voto" }).success).toBe(false);
  });

  it("o registro individual só existe com documento: três tipos, e o valor original sempre", () => {
    const base = loadFixtures().votos[0]!;
    const comRegistro = (registro: unknown) => votoSchema.safeParse({ ...base, registro }).success;
    expect(comRegistro({ tipo: "voto-individual", posicao: "FAVOR", valorOriginal: "Sim" })).toBe(true);
    expect(comRegistro({ tipo: "voto-individual", posicao: "AUSENTE", valorOriginal: "Ausente" })).toBe(false);
    expect(comRegistro({ tipo: "voto-individual", posicao: "FAVOR" })).toBe(false);
    expect(comRegistro({ tipo: "ausencia-documentada", valorOriginal: "Ausente" })).toBe(true);
    expect(comRegistro({ tipo: "nao-votou-documentado", valorOriginal: "Presidente da sessão" })).toBe(false);
    expect(comRegistro({ tipo: "nao-votou-documentado", valorOriginal: "Presidente da sessão", motivoDocumentado: "Presidia a sessão." })).toBe(true);
    // "Sem registro" e "não se aplica" não são registros: pertencem à consulta.
    expect(comRegistro({ tipo: "sem-registro-individual" })).toBe(false);
  });

  it("a votação identifica o objeto, a modalidade e o resultado como o acervo os escreve", () => {
    const base = loadFixtures().votacoes[0]!;
    expect(votacaoSchema.safeParse({ ...base, objeto: { ...base.objeto, tipo: "projeto-inteiro" } }).success).toBe(false);
    expect(votacaoSchema.safeParse({ ...base, modalidade: "virtual" }).success).toBe(false);
    expect(votacaoSchema.safeParse({ ...base, resultadoOficial: { estado: "aprovado" } }).success).toBe(false);
    expect(votacaoSchema.safeParse({ ...base, orgao: { tipo: "comissao" } }).success).toBe(false);
  });

  it("temas repetidos são recusados; a cobertura da pesquisa aceita o tema geral e exige ao menos um acervo", () => {
    const proposicao = loadFixtures().proposicoes[0]!;
    expect(votacaoSchema.safeParse(loadFixtures().votacoes[0]).success).toBe(true);
    expect(atoExecutivoSchema.safeParse({ ...loadFixtures().atosExecutivos[0]!, temas: ["economia", "economia"] }).success).toBe(false);
    expect(TEMAS).toContain(proposicao.temas[0]);
    const cobertura = loadFixtures().coberturaPolitica[1]!;
    expect(cobertura.tema).toBe("geral");
    expect(coberturaPoliticaSchema.safeParse({ ...cobertura, acervos: [] }).success).toBe(false);
  });

  it("o mandato pode declarar a casa, só da taxonomia", () => {
    const mandato = loadFixtures().mandatos[0]!;
    expect(mandatoSchema.safeParse({ ...mandato, casa: "senado-federal" }).success).toBe(true);
    expect(mandatoSchema.safeParse({ ...mandato, casa: "Senado" }).success).toBe(false);
  });
});

describe("competência do mandato", () => {
  const corte = "2026-10-08";
  const mandato = (inicio: { tipo: "data"; valor: string; precisao: "ano" | "mes" | "dia" } | { tipo: "desconhecida" }, fim: { tipo: "data"; valor: string; precisao: "ano" | "mes" | "dia" } | { tipo: "em-curso" } | { tipo: "desconhecida" }) => ({ periodo: { inicio, fim } });

  it("dentro, fora e não confirmada, sem transformar limite desconhecido em data", () => {
    const a1 = mandato({ tipo: "data", valor: "2003-02-01", precisao: "dia" }, { tipo: "data", valor: "2006", precisao: "ano" });
    expect(competenceOf(a1, { valor: "2004-05-12", precisao: "dia" }, corte)).toBe("dentro");
    expect(competenceOf(a1, { valor: "2007-01-01", precisao: "dia" }, corte)).toBe("fora");
    expect(competenceOf(a1, { valor: "2002", precisao: "ano" }, corte)).toBe("fora");
    // 2006 é o fim com precisão de ano: um dia de 2006 pode estar dentro ou fora.
    expect(competenceOf(a1, { valor: "2006-11-20", precisao: "dia" }, corte)).toBe("nao-confirmada");
    const b1 = mandato({ tipo: "desconhecida" }, { tipo: "data", valor: "2015-03", precisao: "mes" });
    expect(competenceOf(b1, { valor: "2010-05-05", precisao: "dia" }, corte)).toBe("nao-confirmada");
    expect(competenceOf(b1, { valor: "2016-01-01", precisao: "dia" }, corte)).toBe("fora");
    const emCurso = mandato({ tipo: "data", valor: "2019", precisao: "ano" }, { tipo: "em-curso" });
    expect(competenceOf(emCurso, { valor: "2021-05-05", precisao: "dia" }, corte)).toBe("dentro");
    expect(competenceOf(emCurso, { valor: "2018-12-31", precisao: "dia" }, corte)).toBe("fora");
  });
});

describe("regras entre registros", () => {
  it("voto fora do período documentado do mandato é erro na publicação", () => {
    const projeto = project((base) => {
      base.votos[0]!.mandatoId = "teste-mandato-a2";
    });
    expect(errorLines(projeto)).toEqual([
      'content/published/votos.json · voto "teste-voto-01" · mandatoId: A data da decisão (12 de maio de 2004) fica fora do período documentado do mandato "teste-mandato-a2".',
      'content/published/votos.json · voto "teste-voto-01" · mandatoId: O mandato é da casa "presidencia-da-republica", e a decisão é de "senado-federal".',
    ]);
  });

  it("mandato de outra pessoa é erro; com a pessoa do mandato inexistente, não há cascata", () => {
    const deOutra = project((base) => {
      base.votos[0]!.pessoaId = "teste-pessoa-b";
    });
    expect(errorLines(deOutra)).toContain('content/published/votos.json · voto "teste-voto-01" · mandatoId: O mandato "teste-mandato-a1" é de outra pessoa ("teste-pessoa-a").');
    const semPessoa = project((base) => {
      base.mandatos[0]!.pessoaId = "pessoa-que-nao-existe";
    });
    expect(errorLines(semPessoa).filter((linha) => linha.includes("votos.json"))).toEqual([]);
  });

  it("dois votos vigentes da mesma pessoa na mesma votação são erro; a retificação precisa apontar um voto da mesma votação e pessoa", () => {
    const repetido = project((base) => {
      base.votos[1]!.situacao = { tipo: "vigente" };
    });
    expect(withCode(repetido, "voto-repetido").map(formatDiagnostic)).toEqual([
      'content/published/votos.json · voto "teste-voto-02" · situacao: Já há um voto vigente desta pessoa nesta votação: "teste-voto-01". Retifique um dos dois (situacao.tipo "retificado", apontando o que vale).',
    ]);
    const incoerente = project((base) => {
      base.votos[1]!.situacao = { tipo: "retificado", substituidoPor: "teste-voto-03", motivo: "Teste." };
    });
    expect(withCode(incoerente, "retificacao-incoerente")).toHaveLength(1);
    const inexistente = project((base) => {
      base.votos[1]!.situacao = { tipo: "retificado", substituidoPor: "voto-que-nao-existe", motivo: "Teste." };
    });
    expect(withCode(inexistente, "referencia-inexistente").map((item) => item.campo)).toEqual(["situacao.substituidoPor"]);
  });

  it("mandato sem a casa declarada gera aviso de competência não confirmada, e não erro", () => {
    const semCasa = project((base) => {
      delete (base.mandatos[0] as { casa?: string }).casa;
    });
    const { ok } = semCasa.result();
    expect(ok).toBe(true);
    // Os dois votos e a atuação legislativa que dependem do mandato sem casa; a relatoria em comissão mista do Congresso não confere a casa.
    expect(withCode(semCasa, "competencia-nao-confirmada").map((item) => item.id).sort()).toEqual(["teste-atuacao-a1", "teste-voto-01", "teste-voto-02"]);
  });

  it("checkIntegrity confere o conjunto montado com as mesmas regras", () => {
    const conjunto: Conjunto = JSON.parse(JSON.stringify(loadFixtures()));
    conjunto.votos[0]!.mandatoId = "mandato-que-nao-existe";
    conjunto.atosExecutivos[0]!.proposicaoIds = ["proposicao-que-nao-existe", "proposicao-que-nao-existe"];
    const mensagens = checkIntegrity(conjunto).map((item) => `${item.caminho}: ${item.mensagem}`);
    expect(mensagens).toEqual([
      'votos["sintetico-voto-01"].mandatoId: Referência a mandato inexistente: "mandato-que-nao-existe".',
      'atosExecutivos["sintetico-ato-01"].proposicaoIds: A mesma proposição aparece mais de uma vez: "proposicao-que-nao-existe".',
      'atosExecutivos["sintetico-ato-01"].proposicaoIds: Referência a proposição inexistente: "proposicao-que-nao-existe".',
    ]);
  });

  it("votação, voto e ato depois da data de corte são erro na publicação", () => {
    const projeto = project((base) => {
      base.votacoes[0]!.data = { valor: "2026-10-09", precisao: "dia" };
      base.atosExecutivos[0]!.data = { valor: "2027", precisao: "ano" };
    });
    expect(withCode(projeto, "data-apos-corte").map((item) => item.id)).toEqual(["teste-ato-01", "teste-votacao-01"]);
  });
});

describe("pipeline, índices e recorte por pessoa", () => {
  it("voto e votação só entram com a proposição publicada; a fonte do ato oficial entra pelo uso", () => {
    const projeto = project((base) => {
      base.proposicoes[0]!.editorial = { estado: "em-revisao", pendencias: ["Conferir a ementa."] };
    });
    const dependentes = withCode(projeto, "referencia-fora-da-publicacao").map((item) => item.id).sort();
    expect(dependentes).toEqual(["teste-votacao-01", "teste-votacao-02", "teste-votacao-04"]);

    const { conjunto } = data;
    const fontesDosAtos = conjunto.atosExecutivos.map((item) => item.atoOficial.fonteId);
    for (const id of fontesDosAtos) expect(conjunto.fontes.some((fonte) => fonte.id === id)).toBe(true);
  });

  it("os índices ligam votações a proposições, temas, instituições e anos, e dizem qual voto vale", () => {
    const { indices } = data;
    expect(indices.votacoes.porProposicao["sintetico-proposicao-01"]).toEqual(["sintetico-votacao-01", "sintetico-votacao-02", "sintetico-votacao-04"]);
    expect(indices.votacoes.porTema.economia).toEqual(["sintetico-votacao-01", "sintetico-votacao-02", "sintetico-votacao-04"]);
    expect(indices.votacoes.porTema.saude).toEqual(["sintetico-votacao-03", "sintetico-votacao-05"]);
    expect(indices.votacoes.porTema["meio-ambiente"]).toEqual([]);
    expect(indices.votacoes.porAno["2020"]).toEqual(["sintetico-votacao-03"]);
    // Em ordem cronológica: 2016, 2020, 2021.
    expect(indices.votacoes.porInstituicao["camara-dos-deputados"]).toEqual(["sintetico-votacao-06", "sintetico-votacao-03", "sintetico-votacao-05"]);
    expect(indices.votos.vigentePorVotacaoEPessoa).toEqual({
      [`sintetico-votacao-01:${A}`]: "sintetico-voto-01",
      [`sintetico-votacao-03:${B}`]: "sintetico-voto-03",
    });
    expect(indices.atosExecutivos.porTema["reforma-do-estado"]).toEqual(["sintetico-ato-01"]);
    expect(indices.atosExecutivos.porProposicao["sintetico-proposicao-03"]).toEqual(["sintetico-ato-01"]);
    expect(buildIndexes(data.conjunto)).toEqual(indices);
  });

  it("as votações e os atos saem em ordem cronológica", () => {
    const datas = data.conjunto.votacoes.map((item) => item.data.valor);
    expect(datas).toEqual([...datas].sort());
  });

  it("o recorte de uma pessoa leva os votos e atos dela, com as votações e proposições que eles citam", () => {
    const deA = sliceForPerson(data, A).conjunto;
    expect(deA.votos.map((item) => item.id)).toEqual(["sintetico-voto-01", "sintetico-voto-02"]);
    expect(deA.votacoes.map((item) => item.id)).toEqual(["sintetico-votacao-01"]);
    expect(deA.atosExecutivos.map((item) => item.id)).toEqual(["sintetico-ato-01"]);
    expect(deA.proposicoes.map((item) => item.id).sort()).toEqual(["sintetico-proposicao-01", "sintetico-proposicao-03"]);
    expect(deA.coberturaPolitica.map((item) => item.id)).toEqual(["sintetico-cobertura-02"]);
    expect(deA.identidadesInstitucionais).toHaveLength(1);
    const deB = sliceForPerson(data, B).conjunto;
    expect(deB.votos.map((item) => item.id)).toEqual(["sintetico-voto-03"]);
    expect(deB.atosExecutivos).toEqual([]);
  });

  it("a importação leva as coleções novas para os rascunhos, com as referências conferidas", () => {
    const validacao = validateSources(readSources(fixturePaths()), { allowSynthetic: true });
    const plano = planImport(
      {
        votos: [
          {
            id: "voto-importado",
            votacaoId: "sintetico-votacao-04",
            pessoaId: A,
            mandatoId: "sintetico-mandato-a1",
            registro: { tipo: "voto-individual", posicao: "OUTRO", valorOriginal: "P-NRV" },
            proveniencia: { provedor: "senado", registroExternoId: "x", capturaId: null },
            situacao: { tipo: "vigente" },
            fontes: [],
            editorial: { estado: "revisado", revisao: { tipo: "humana", revisadoPor: "Origem", revisadoEm: "2026-10-08" } },
          },
        ],
        coberturaPolitica: [{ ...loadFixtures().coberturaPolitica[0]!, id: "cobertura-importada", pessoaId: "pessoa-que-nao-existe" }],
      },
      validacao,
      { arquivo: "pacote.json", sha256: "a".repeat(64) },
      "2026-10-09",
    );
    expect(plano.registro.rejeitados).toEqual([]);
    // Tudo entra como rascunho: a revisão declarada na origem é descartada e vira pendência.
    const voto = plano.gravar.votos[0] as Voto;
    expect(voto.editorial.estado).toBe("rascunho");
    expect(plano.registro.pendentes.map((item) => item.id)).toEqual(["voto-importado", "cobertura-importada"]);
    expect(plano.registro.pendentes[0]!.pendencias).toEqual([
      'O pacote declarava o estado "revisado". A revisão feita na origem não foi aceita e precisa ser refeita aqui.',
      "Sem fonte: registrar ao menos uma citação, com o trecho e o que ele sustenta.",
    ]);
    // A cobertura não exige citação: fora a revisão declarada na origem, a pendência dela é só a referência quebrada.
    expect(plano.registro.pendentes[1]!.pendencias).toEqual([
      'O pacote declarava o estado "revisado". A revisão feita na origem não foi aceita e precisa ser refeita aqui.',
      'Referência a pessoa inexistente: "pessoa-que-nao-existe".',
    ]);
  });

  it("a barreira de release exige revisão humana também nas coleções novas", () => {
    const parcial = JSON.parse(JSON.stringify(data.conjunto)) as typeof data.conjunto;
    // As fixtures têm um acontecimento com revisão assistida por IA: aqui só o voto interessa.
    for (const registro of parcial.acontecimentos) if (registro.editorial.estado === "revisado") registro.editorial.revisao.tipo = "humana";
    const voto = parcial.votos[0]!;
    if (voto.editorial.estado === "revisado") voto.editorial.revisao.tipo = "assistida-por-ia";
    const issues = releaseIssues(parcial, { publicUrl: "https://x.exemplo", indexar: true, correctionChannel: {} }, { licenca: true });
    expect(issues.map((item) => item.caminho)).toEqual(["votos.editorial.revisao"]);
    expect(issues[0]!.mensagem.startsWith("1 de 3 registros sem revisão humana")).toBe(true);
  });
});

describe("consulta comparativa de participação", () => {
  it("responde uma das cinco coisas, e a votação inexistente dá null", () => {
    expect(PARTICIPACOES).toHaveLength(5);
    expect(resolveParticipation(data, A, "votacao-que-nao-existe")).toBeNull();
  });

  it("com voto vigente, é registro, com o mandato pelo qual a pessoa participou", () => {
    const resultado = resolveParticipation(data, A, "sintetico-votacao-01");
    expect(resultado?.tipo).toBe("registro");
    if (resultado?.tipo !== "registro") return;
    expect(resultado.voto.id).toBe("sintetico-voto-01");
    expect(resultado.voto.registro).toEqual({ tipo: "voto-individual", posicao: "FAVOR", valorOriginal: "Sim" });
    expect(resultado.mandato?.id).toBe("sintetico-mandato-a1");
    // O voto retificado não vale.
    expect(resolveParticipation(data, A, "sintetico-votacao-01")).not.toMatchObject({ voto: { id: "sintetico-voto-02" } });
  });

  it("ausência documentada é registro, com o motivo", () => {
    const resultado = resolveParticipation(data, B, "sintetico-votacao-03");
    expect(resultado?.tipo).toBe("registro");
    if (resultado?.tipo !== "registro") return;
    expect(resultado.voto.registro.tipo).toBe("ausencia-documentada");
  });

  it("sem mandato na casa da votação, não se aplica; com algum mandato sem a casa declarada, não dá para afirmar", () => {
    // A pessoa A só tem mandatos com a casa declarada (Senado e Presidência): na Câmara, não se aplica.
    const resultado = resolveParticipation(data, A, "sintetico-votacao-03");
    expect(resultado?.tipo).toBe("nao-se-aplica");
    if (resultado?.tipo === "nao-se-aplica") expect(resultado.motivo).toContain("não tem mandato documentado na casa");
    // A pessoa B tem o mandato B1 sem a casa: ele pode ser do Senado, e a resposta é "não confirmada", nunca "não se aplica".
    const deB = resolveParticipation(data, B, "sintetico-votacao-01");
    expect(deB?.tipo).toBe("competencia-nao-confirmada");
    if (deB?.tipo === "competencia-nao-confirmada") expect(deB.mandatos.map((item) => item.id)).toEqual(["sintetico-mandato-b1"]);
  });

  it("mandato na casa cujas datas não decidem, ou sem a casa declarada, é competência não confirmada", () => {
    // Votação de 2016 na Câmara: o mandato B2 começa em 2019 (fora) e o B1 não declara a casa.
    const resultado = resolveParticipation(data, B, "sintetico-votacao-06");
    expect(resultado?.tipo).toBe("competencia-nao-confirmada");
    if (resultado?.tipo !== "competencia-nao-confirmada") return;
    expect(resultado.mandatos.map((item) => item.id)).toEqual(["sintetico-mandato-b1"]);
  });

  it("votação simbólica ou secreta não tem registro individual, mesmo com competência", () => {
    const resultado = resolveParticipation(data, A, "sintetico-votacao-02");
    expect(resultado?.tipo).toBe("sem-registro-individual");
    if (resultado?.tipo !== "sem-registro-individual") return;
    expect(resultado.motivo).toContain("simbólica");
    expect(resultado.cobertura).toBeNull();
  });

  it("com a pesquisa completa no recorte, a falta de linha é 'sem registro individual'; parcial ou ausente, é 'pesquisa pendente'", () => {
    const completa = resolveParticipation(data, B, "sintetico-votacao-05");
    expect(completa?.tipo).toBe("sem-registro-individual");
    if (completa?.tipo === "sem-registro-individual") expect(completa.cobertura?.id).toBe("sintetico-cobertura-01");

    const parcial = resolveParticipation(data, A, "sintetico-votacao-04");
    expect(parcial?.tipo).toBe("pesquisa-pendente");
    if (parcial?.tipo === "pesquisa-pendente") {
      expect(parcial.cobertura?.id).toBe("sintetico-cobertura-02");
      expect(parcial.motivo).toContain("parcial");
    }
  });
});
