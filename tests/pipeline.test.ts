// Regra de elegibilidade e diagnósticos do pipeline, sobre projetos
// descartáveis. O conteúdo de base são as fixtures sem o prefixo reservado:
// sete acontecimentos revisados (01 a 07) e um rascunho (08).

import { afterEach, describe, expect, it } from "vitest";

import { assembleAtlasData, verifyAtlasData } from "@/lib/publication/build";
import { formatDiagnostic, type Diagnostic, type DiagnosticCode } from "@/lib/publication/diagnostics";

import {
  baseContent,
  createProject,
  fakeJpeg,
  loadFixtures,
  omitField,
  removeProjects,
  slugs,
  type ContentFiles,
  type TestProject,
} from "./helpers";

afterEach(removeProjects);

const REVISAO = { tipo: "humana", revisadoPor: "Teste", revisadoEm: "2026-10-08" } as const;

function withCode(projeto: TestProject, codigo: DiagnosticCode): Diagnostic[] {
  return projeto.result().diagnostics.filter((item) => item.codigo === codigo);
}

function errorLines(projeto: TestProject): string[] {
  return projeto
    .result()
    .diagnostics.filter((item) => item.severidade === "erro")
    .map(formatDiagnostic);
}

/** Projeto com o conteúdo de base, depois de alterado pela função. */
function project(
  alterar: (base: ReturnType<typeof baseContent>) => void = () => {},
  drafts: ContentFiles = {},
): TestProject {
  const base = baseContent();
  alterar(base);
  return createProject({ published: base, drafts });
}

describe("elegibilidade", () => {
  it("registro revisado e válido entra; o que não foi revisado fica fora, com pendência", () => {
    const { ok, data, excluidos, diagnostics } = project().result();

    expect(ok).toBe(true);
    expect(slugs(data!.conjunto.acontecimentos)).toEqual(["01", "02", "03", "04", "05", "06", "07"]);
    expect(excluidos).toEqual([
      {
        entidade: "acontecimento",
        id: "teste-evento-08",
        slug: "teste-evento-08",
        arquivo: "content/published/acontecimentos.json",
        motivo: "nao-revisado",
        pendencias: ["[SINTÉTICO] Falta localizar a fonte primária."],
      },
    ]);
    expect(diagnostics.map((item) => [item.severidade, item.codigo, item.id])).toEqual([
      ["pendencia", "nao-revisado", "teste-evento-08"],
    ]);
  });

  it("rascunho na pasta de rascunhos fica fora", () => {
    const rascunho = baseContent().acontecimentos[7]!;
    const projeto = project((base) => base.acontecimentos.pop(), { acontecimentos: [rascunho] });

    const { ok, data, excluidos } = projeto.result();
    expect(ok).toBe(true);
    expect(data!.indices.acontecimentos.porId).not.toHaveProperty("teste-evento-08");
    expect(excluidos).toMatchObject([
      { id: "teste-evento-08", motivo: "rascunho", arquivo: "content/drafts/acontecimentos.json" },
    ]);
  });

  it("revisado que ainda está na pasta de rascunhos fica fora", () => {
    const revisado = {
      ...baseContent().acontecimentos[0]!,
      id: "teste-evento-09",
      slug: "teste-evento-09",
    };
    const projeto = project(undefined, { acontecimentos: [revisado] });

    const { ok, data, excluidos } = projeto.result();
    expect(ok).toBe(true);
    expect(data!.conjunto.acontecimentos.map((item) => item.id)).not.toContain("teste-evento-09");
    expect(excluidos.find((item) => item.id === "teste-evento-09")?.motivo).toBe(
      "revisado-em-rascunhos",
    );
    expect(withCode(projeto, "revisado-em-rascunhos").map(formatDiagnostic)).toEqual([
      'content/drafts/acontecimentos.json · acontecimento "teste-evento-09" · editorial.estado: Marcado como revisado, mas está em content/drafts. Para entrar na publicação, mova o registro para content/published.',
    ]);
  });

  it("fixture sintética fica fora: o prefixo reservado bloqueia a geração", () => {
    const fixtures = loadFixtures();
    const projeto = createProject({ published: fixtures });
    const { ok, data } = projeto.result();

    expect(ok).toBe(false);
    expect(data).toBeNull();
    const total =
      fixtures.pessoas.length +
      fixtures.mandatos.length +
      fixtures.filiacoes.length +
      fixtures.acontecimentos.length +
      fixtures.proposicoes.length +
      fixtures.votacoes.length +
      fixtures.votos.length +
      fixtures.atosExecutivos.length +
      fixtures.atuacoesLegislativas.length +
      fixtures.coberturaPolitica.length +
      fixtures.identidadesInstitucionais.length +
      fixtures.propostasEleitorais.length +
      fixtures.fatosBiograficos.length +
      fixtures.conceitos.length +
      fixtures.fasesDoJogo.length +
      fixtures.lugares.length +
      fixtures.fontes.length;
    const sinteticos = withCode(projeto, "dado-sintetico");
    expect(sinteticos).toHaveLength(total);
    expect(sinteticos.map(formatDiagnostic)).toContain(
      'content/published/pessoas.json · pessoa "sintetico-pessoa-a" · id: Dado sintético de teste não pode ficar nas pastas de conteúdo.',
    );
  });

  it("revisado exige revisão identificada e ao menos uma citação", () => {
    const semFonte = project((base) => (base.acontecimentos[0]!.fontes = []));
    expect(errorLines(semFonte)).toEqual([
      'content/published/acontecimentos.json · acontecimento "teste-evento-01" · fontes: Registro revisado precisa de ao menos uma fonte com evidência identificada.',
    ]);

    const semRevisao = project((base) => omitField(base.acontecimentos[0]!.editorial, "revisao"));
    expect(errorLines(semRevisao)).toEqual([
      'content/published/acontecimentos.json · acontecimento "teste-evento-01" · editorial.revisao: Campo obrigatório ausente.',
    ]);

    const semTrecho = project((base) => omitField(base.acontecimentos[0]!.fontes[0]!, "evidencia"));
    expect(errorLines(semTrecho)).toEqual([
      'content/published/acontecimentos.json · acontecimento "teste-evento-01" · fontes[0].evidencia: Campo obrigatório ausente.',
    ]);
  });

  it("revisado que depende de pessoa não revisada é erro, e não some em silêncio", () => {
    const projeto = project((base) => {
      base.pessoas[1]!.editorial = { estado: "em-revisao", pendencias: ["Conferir o resumo."] };
    });
    const { ok } = projeto.result();
    const dependentes = withCode(projeto, "referencia-fora-da-publicacao");

    expect(ok).toBe(false);
    // Dois mandatos, quatro acontecimentos, um voto, uma atuação legislativa, uma cobertura de pesquisa, uma proposta eleitoral, um fato biográfico, uma fase do jogo e a cobertura da edição dependem da pessoa B.
    // As fases da pessoa A, que apontam o acontecimento compartilhado, não entram na lista: o registro de que elas dependem já foi acusado.
    expect([...new Set(dependentes.map((item) => item.id))].sort()).toEqual([
      "0.0.1",
      "teste-atuacao-b1",
      "teste-cobertura-01",
      "teste-evento-03",
      "teste-evento-04",
      "teste-evento-05",
      "teste-evento-06",
      "teste-fase-b1",
      "teste-fato-b1",
      "teste-mandato-b1",
      "teste-mandato-b2",
      "teste-proposta-b-economia-1",
      "teste-voto-03",
    ]);
    expect(formatDiagnostic(dependentes.find((item) => item.id === "teste-evento-04")!)).toBe(
      'content/published/acontecimentos.json · acontecimento "teste-evento-04" · pessoaIds: Depende de pessoa "teste-pessoa-b", que não entra na publicação (estado "em-revisao").',
    );
  });

  it("revisado não pode citar lugar ou fonte que só existe nos rascunhos", () => {
    const base = baseContent();
    const [norte] = base.lugares.splice(0, 1);
    const [fonte] = base.fontes.splice(2, 1);
    const projeto = createProject({ published: base, drafts: { lugares: [norte], fontes: [fonte] } });

    expect(errorLines(projeto)).toContain(
      'content/published/acontecimentos.json · acontecimento "teste-evento-01" · localizacao.lugarIds: Depende de lugar "teste-lugar-norte", que não entra na publicação (está em content/drafts).',
    );
    expect(errorLines(projeto)).toContain(
      'content/published/acontecimentos.json · acontecimento "teste-evento-03" · fontes[0].fonteId: Depende de fonte "teste-fonte-03", que não entra na publicação (está em content/drafts).',
    );
  });

  it("lugar e fonte entram pelo uso: o que só um rascunho cita fica fora dos dados públicos", () => {
    const projeto = project((base) => {
      base.fontes.push({ ...base.fontes[0]!, id: "teste-fonte-do-rascunho" });
      base.fontes.push({ ...base.fontes[0]!, id: "teste-fonte-sem-uso" });
      base.lugares.push({ ...base.lugares[5]!, id: "teste-lugar-sem-uso" });
      base.acontecimentos[7]!.fontes = [
        { fonteId: "teste-fonte-do-rascunho", localizacao: "Seção 1", evidencia: "Trecho." },
      ];
    });
    const { ok, data, excluidos } = projeto.result();

    expect(ok).toBe(true);
    expect(data!.conjunto.fontes.map((fonte) => fonte.id)).toEqual([
      "teste-fonte-01",
      "teste-fonte-02",
      "teste-fonte-03",
    ]);
    expect(data!.conjunto.lugares.map((lugar) => lugar.id)).not.toContain("teste-lugar-sem-uso");
    expect(excluidos.filter((item) => item.motivo === "sem-uso").map((item) => item.id)).toEqual([
      "teste-fonte-do-rascunho",
      "teste-fonte-sem-uso",
      "teste-lugar-sem-uso",
    ]);
    // Aviso só para o que ninguém usa; a fonte do rascunho está em uso.
    expect(withCode(projeto, "sem-uso").map((item) => item.id)).toEqual([
      "teste-fonte-sem-uso",
      "teste-lugar-sem-uso",
    ]);
  });

  it("rascunho sem pendência escrita gera aviso", () => {
    const projeto = project((base) => (base.acontecimentos[7]!.editorial = { estado: "rascunho" }));
    expect(projeto.result().ok).toBe(true);
    expect(withCode(projeto, "rascunho-sem-pendencia").map((item) => item.id)).toEqual([
      "teste-evento-08",
    ]);
  });
});

describe("referências e identificadores", () => {
  it("referência inexistente em registro revisado é erro, com arquivo, id e campo", () => {
    const projeto = project((base) => {
      base.acontecimentos[2]!.fontes[1]!.fonteId = "fonte-que-nao-existe";
      base.mandatos[0]!.pessoaId = "pessoa-que-nao-existe";
      base.pessoas[0]!.retratoId = "imagem-que-nao-existe";
    });
    expect(errorLines(projeto)).toEqual([
      'content/published/acontecimentos.json · acontecimento "teste-evento-03" · fontes[1].fonteId: Referência a fonte inexistente: "fonte-que-nao-existe".',
      'content/published/mandatos.json · mandato "teste-mandato-a1" · pessoaId: Referência a pessoa inexistente: "pessoa-que-nao-existe".',
      'content/published/pessoas.json · pessoa "teste-pessoa-a" · retratoId: Referência a imagem inexistente: "imagem-que-nao-existe".',
    ]);
  });

  it("referência inexistente em rascunho é pendência: fica relatada e não impede a geração", () => {
    const projeto = project((base) => {
      base.acontecimentos[7]!.localizacao = { tipo: "lugares", lugarIds: ["lugar-que-nao-existe"] };
    });
    const { ok, diagnostics } = projeto.result();

    expect(ok).toBe(true);
    expect(diagnostics.filter((item) => item.codigo === "referencia-inexistente")).toMatchObject([
      {
        severidade: "pendencia",
        id: "teste-evento-08",
        campo: "localizacao.lugarIds",
        mensagem: 'Referência a lugar inexistente: "lugar-que-nao-existe".',
      },
    ]);
  });

  it("id repetido no mesmo arquivo é erro", () => {
    const projeto = project((base) => base.lugares.push(structuredClone(base.lugares[0]!)));
    expect(errorLines(projeto)).toEqual([
      'content/published/lugares.json · lugar "teste-lugar-norte" · id: Identificador repetido: "teste-lugar-norte" (já usado em content/published/lugares.json).',
    ]);
  });

  it("id repetido entre a edição e os rascunhos é erro", () => {
    const projeto = project(undefined, { fontes: [baseContent().fontes[0]] });
    expect(errorLines(projeto)).toEqual([
      'content/drafts/fontes.json · fonte "teste-fonte-01" · id: Identificador repetido: "teste-fonte-01" (já usado em content/published/fontes.json).',
    ]);
  });

  it("slug repetido é erro, mesmo com ids diferentes", () => {
    const projeto = project((base) => (base.acontecimentos[1]!.slug = base.acontecimentos[0]!.slug));
    expect(errorLines(projeto)).toEqual([
      'content/published/acontecimentos.json · acontecimento "teste-evento-02" · slug: Slug repetido: "teste-evento-01" (já usado em content/published/acontecimentos.json).',
    ]);
  });

  it("o mesmo id pode existir em coleções diferentes", () => {
    const projeto = project((base) => {
      base.lugares[0]!.id = "teste-fonte-01";
      base.acontecimentos[0]!.localizacao = { tipo: "lugares", lugarIds: ["teste-fonte-01"] };
    });
    expect(errorLines(projeto)).toEqual([]);
  });

  it("pessoa ou lugar repetido no mesmo acontecimento é erro", () => {
    const projeto = project((base) => {
      base.acontecimentos[0]!.pessoaIds = ["teste-pessoa-a", "teste-pessoa-a"];
      base.acontecimentos[2]!.localizacao = {
        tipo: "lugares",
        lugarIds: ["teste-lugar-sul", "teste-lugar-sul"],
      };
    });
    expect(withCode(projeto, "referencia-repetida").map((item) => [item.id, item.campo])).toEqual([
      ["teste-evento-01", "pessoaIds"],
      ["teste-evento-03", "localizacao.lugarIds"],
    ]);
  });

  it("a cobertura da edição precisa apontar para pessoa que existe, uma vez só", () => {
    const projeto = project((base) => {
      base.edicao.cobertura[1]!.pessoaId = "pessoa-que-nao-existe";
      base.edicao.cobertura.push(structuredClone(base.edicao.cobertura[0]!));
    });
    expect(errorLines(projeto)).toEqual([
      'content/published/edicao.json · edicao "0.0.1" · cobertura[1].pessoaId: Referência a pessoa inexistente: "pessoa-que-nao-existe".',
      'content/published/edicao.json · edicao "0.0.1" · cobertura[2].pessoaId: A cobertura da pessoa "teste-pessoa-a" aparece mais de uma vez.',
    ]);
  });

  it("campo desconhecido e campo ausente são apontados pelo nome", () => {
    const projeto = project((base) => {
      Object.assign(base.fontes[0]!, { titlo: "Nome de campo digitado errado" });
      omitField(base.fontes[1]!, "acessadoEm");
    });
    expect(errorLines(projeto)).toEqual([
      'content/published/fontes.json · fonte "teste-fonte-01": Campo desconhecido: "titlo". Confira o nome do campo.',
      'content/published/fontes.json · fonte "teste-fonte-02" · acessadoEm: Campo obrigatório ausente.',
    ]);
  });
});

describe("datas", () => {
  it("datas parciais são aceitas e saem com a precisão original", () => {
    const { data } = project().result();
    const porSlug = Object.fromEntries(
      data!.conjunto.acontecimentos.map((item) => [item.slug, item.data]),
    );
    expect(porSlug["teste-evento-01"]).toEqual({ valor: "1994", precisao: "ano" });
    expect(porSlug["teste-evento-02"]).toEqual({ valor: "2003-03", precisao: "mes" });
    expect(porSlug["teste-evento-03"]).toEqual({ valor: "2011-06-15", precisao: "dia" });
    // Nenhum dia ou mês é inventado nos índices nem nos pontos.
    expect(data!.indices.acontecimentos.porAno["1994"]).toEqual(["teste-evento-01"]);
    expect(JSON.stringify(data)).not.toContain("1994-01-01");
    expect(JSON.stringify(data)).not.toContain("2003-03-01");
  });

  it("data impossível é erro, com o motivo", () => {
    const projeto = project((base) => {
      base.acontecimentos[0]!.data = { valor: "2023-02-29", precisao: "dia" };
      base.acontecimentos[1]!.data = { valor: "2003-13", precisao: "mes" };
      base.acontecimentos[2]!.data = { valor: "2011-06-15", precisao: "mes" };
      base.acontecimentos[3]!.data = { valor: "0203", precisao: "ano" };
    });
    expect(errorLines(projeto)).toEqual([
      'content/published/acontecimentos.json · acontecimento "teste-evento-01" · data.valor: Dia 29 não existe em fevereiro de 2023 (o mês tem 28 dias).',
      'content/published/acontecimentos.json · acontecimento "teste-evento-02" · data.valor: Mês 13 não existe.',
      'content/published/acontecimentos.json · acontecimento "teste-evento-03" · data.valor: Data "2011-06-15" não segue o formato AAAA-MM exigido pela precisão "mes".',
      'content/published/acontecimentos.json · acontecimento "teste-evento-04" · data.valor: Ano 203 fora do intervalo aceito (1800–2100).',
    ]);
  });

  it("período com início depois do fim é erro; entre datas parciais, só quando nenhuma leitura é coerente", () => {
    // O mandato B1 não tem voto nem ato apontando para ele: mudar o período dele não mexe na competência de nenhuma decisão.
    const incoerente = project((base) => {
      base.mandatos[1]!.periodo = {
        inicio: { tipo: "data", valor: "2010-07", precisao: "mes" },
        fim: { tipo: "data", valor: "2010-06", precisao: "mes" },
      };
    });
    expect(errorLines(incoerente)).toEqual([
      'content/published/mandatos.json · mandato "teste-mandato-b1" · periodo.fim: Período incoerente: o início (julho de 2010) é posterior ao fim (junho de 2010).',
    ]);

    const coerente = project((base) => {
      base.mandatos[1]!.periodo = {
        inicio: { tipo: "data", valor: "2010", precisao: "ano" },
        fim: { tipo: "data", valor: "2010-06", precisao: "mes" },
      };
    });
    expect(errorLines(coerente)).toEqual([]);
  });

  it("limite de período ausente é erro: desconhecido precisa ser declarado", () => {
    const projeto = project((base) => omitField(base.mandatos[0]!.periodo, "fim"));
    expect(errorLines(projeto)).toEqual([
      'content/published/mandatos.json · mandato "teste-mandato-a1" · periodo.fim: Campo obrigatório ausente.',
    ]);
  });

  it("acontecimento revisado depois da data de corte é erro; no próprio dia, não", () => {
    const depois = project((base) => {
      base.acontecimentos[6]!.data = { valor: "2026-10-09", precisao: "dia" };
    });
    expect(errorLines(depois)).toEqual([
      'content/published/acontecimentos.json · acontecimento "teste-evento-07" · data: Data (9 de outubro de 2026) posterior à data de corte da edição (2026-10-08).',
    ]);

    const noDia = project((base) => {
      base.acontecimentos[6]!.data = { valor: "2026-10-08", precisao: "dia" };
      base.acontecimentos[5]!.data = { valor: "2026", precisao: "ano" };
    });
    expect(errorLines(noDia)).toEqual([]);
  });

  it("rascunho com data depois do corte é pendência", () => {
    const projeto = project((base) => {
      base.acontecimentos[7]!.data = { valor: "2027", precisao: "ano" };
    });
    expect(projeto.result().ok).toBe(true);
    expect(withCode(projeto, "data-apos-corte")).toMatchObject([
      { severidade: "pendencia", id: "teste-evento-08", campo: "data" },
    ]);
  });

  it("período que termina depois da data de corte deve usar em-curso", () => {
    const projeto = project((base) => {
      base.mandatos[2]!.periodo.fim = { tipo: "data", valor: "2027-01-31", precisao: "dia" };
    });
    expect(errorLines(projeto)).toEqual([
      'content/published/mandatos.json · mandato "teste-mandato-b2" · periodo.fim: Fim (31 de janeiro de 2027) posterior à data de corte da edição (2026-10-08). Um período vigente na data de corte usa "em-curso".',
    ]);
  });

  it("fonte com documento datado depois do acesso é erro", () => {
    const projeto = project((base) => {
      base.fontes[0]!.dataDocumento = { tipo: "data", valor: "2026-11", precisao: "mes" };
    });
    expect(errorLines(projeto)).toEqual([
      'content/published/fontes.json · fonte "teste-fonte-01" · dataDocumento: Data do documento (novembro de 2026) posterior à data de acesso (8 de outubro de 2026).',
    ]);
  });
});

describe("coordenadas", () => {
  it("fora dos limites, trocada ou não finita é erro", () => {
    const base = baseContent();
    base.lugares[5]!.longitude = 200;
    // Brasília com os dois valores trocados cai fora do território.
    Object.assign(base.lugares[2]!, { longitude: -15.78, latitude: -47.8 });
    const projeto = createProject({ published: base });
    // `1e999` é JSON válido e vira infinito ao ser lido.
    projeto.writeFile(
      "content/published/lugares.json",
      JSON.stringify(base.lugares).replace('"latitude":-28', '"latitude":1e999'),
    );

    expect(errorLines(projeto)).toEqual([
      'content/published/lugares.json · lugar "teste-lugar-centro" · longitude: Coordenada fora do território brasileiro. Confira se longitude e latitude não estão trocadas.',
      'content/published/lugares.json · lugar "teste-lugar-exterior" · longitude: Valor acima do máximo (180).',
      'content/published/lugares.json · lugar "teste-lugar-sul" · latitude: Número inválido: precisa ser um valor finito.',
    ]);
  });

  it("os pontos saem na ordem GeoJSON, com a longitude primeiro", () => {
    const { data } = project().result();
    const ponto = data!.pontos.features.find((item) => item.properties.placeId === "teste-lugar-norte");
    expect(ponto?.geometry).toEqual({ type: "Point", coordinates: [-60, -3] });
  });
});

describe("imagens e arquivos de mídia", () => {
  const imagem = {
    id: "teste-retrato-a",
    arquivo: "/media/retratos/teste-a.jpg",
    autoria: "Autoria de teste",
    credito: "Crédito de teste",
    origem: "https://exemplo.invalid/retrato",
    condicoesDeUso: "Uso livre com crédito",
    textoAlternativo: "Retrato de teste",
    dimensoes: { largura: 960, altura: 1280 },
  };
  const withPortrait = () =>
    project((base) => {
      base.imagens.push(structuredClone(imagem));
      base.pessoas[0]!.retratoId = imagem.id;
    });

  it("imagem cadastrada sem o arquivo é erro", () => {
    expect(errorLines(withPortrait())).toEqual([
      'content/published/imagens.json · imagem "teste-retrato-a" · arquivo: Arquivo não encontrado: public/media/retratos/teste-a.jpg.',
    ]);
  });

  it("com o arquivo no lugar, a imagem usada entra nos dados públicos", () => {
    const projeto = withPortrait();
    projeto.writeFile("public/media/retratos/teste-a.jpg", fakeJpeg(960, 1280));
    const { ok, data } = projeto.result();
    expect(ok).toBe(true);
    expect(data!.conjunto.imagens.map((item) => item.id)).toEqual(["teste-retrato-a"]);
  });

  it("dimensões declaradas diferentes das do arquivo são erro", () => {
    const projeto = withPortrait();
    projeto.writeFile("public/media/retratos/teste-a.jpg", fakeJpeg(800, 600));
    expect(errorLines(projeto)).toEqual([
      'content/published/imagens.json · imagem "teste-retrato-a" · dimensoes: Dimensões declaradas (960×1280) diferentes das do arquivo (800×600).',
    ]);
  });

  it("arquivo que não é do formato da extensão é erro", () => {
    const projeto = withPortrait();
    projeto.writeFile("public/media/retratos/teste-a.jpg", "isto não é uma imagem");
    expect(errorLines(projeto)).toEqual([
      'content/published/imagens.json · imagem "teste-retrato-a" · arquivo: O conteúdo de public/media/retratos/teste-a.jpg não corresponde à extensão .jpg.',
    ]);
  });

  it("caminho de imagem fora de /media/ é recusado pelo contrato", () => {
    const projeto = project((base) => {
      base.imagens.push({ ...structuredClone(imagem), arquivo: "/media/../segredo.jpg" });
    });
    expect(withCode(projeto, "estrutura")).toMatchObject([{ id: "teste-retrato-a", campo: "arquivo" }]);
  });
});

describe("avisos de manutenção", () => {
  const filiacao = (id: string, inicio: string, fim: string) => ({
    id,
    pessoaId: "teste-pessoa-b",
    partido: { sigla: id.toUpperCase(), nome: "Partido de teste" },
    periodo: {
      inicio: { tipo: "data" as const, valor: inicio, precisao: "dia" as const },
      fim: { tipo: "data" as const, valor: fim, precisao: "dia" as const },
    },
    fontes: [{ fonteId: "teste-fonte-02", localizacao: "Seção 1", evidencia: "Trecho." }],
    editorial: { estado: "revisado" as const, revisao: REVISAO },
  });

  it("filiações da mesma pessoa que se sobrepõem geram aviso; troca no mesmo dia, não", () => {
    const sobrepostas = project((base) => {
      base.filiacoes.push(filiacao("teste-pa", "2010-01-01", "2012-06-30"));
      base.filiacoes.push(filiacao("teste-pb", "2012-01-01", "2014-01-01"));
    });
    expect(sobrepostas.result().ok).toBe(true);
    expect(withCode(sobrepostas, "filiacoes-sobrepostas")).toMatchObject([
      { severidade: "aviso", id: "teste-pb", campo: "periodo" },
    ]);

    const seguidas = project((base) => {
      base.filiacoes.push(filiacao("teste-pa", "2010-01-01", "2012-06-30"));
      base.filiacoes.push(filiacao("teste-pb", "2012-06-30", "2014-01-01"));
    });
    expect(withCode(seguidas, "filiacoes-sobrepostas")).toEqual([]);
  });

  it("acontecimento fora da cobertura declarada e pessoa sem cobertura geram aviso", () => {
    const projeto = project((base) => {
      base.acontecimentos[0]!.data = { valor: "1985", precisao: "ano" }; // cobertura de A começa em 1990
      base.edicao.cobertura.pop(); // B fica sem cobertura
    });
    expect(projeto.result().ok).toBe(true);
    expect(withCode(projeto, "fora-da-cobertura").map((item) => item.id)).toEqual(["teste-evento-01"]);
    expect(withCode(projeto, "sem-cobertura").map((item) => item.id)).toEqual(["teste-pessoa-b"]);
  });

  it("o registro de alterações que cita registro inexistente gera aviso", () => {
    const projeto = project((base) => {
      base.edicao.alteracoes[0]!.itens = [
        { entidade: "acontecimento", id: "teste-evento-01" },
        { entidade: "fonte", id: "fonte-removida" },
      ];
    });
    expect(projeto.result().ok).toBe(true);
    expect(withCode(projeto, "alteracao-sem-registro").map(formatDiagnostic)).toEqual([
      'content/published/edicao.json · edicao "0.0.1" · alteracoes[0].itens[1]: O registro de alterações cita fonte "fonte-removida", que não existe no conteúdo.',
    ]);
  });
});

describe("conferência da saída antes de gravar", () => {
  const data = () => project().result().data!;

  it("os dados que o pipeline monta passam na conferência", () => {
    expect(verifyAtlasData(data(), "content/published")).toEqual([]);
  });

  it("acusa índice que não corresponde ao conjunto", () => {
    const alterado = data();
    alterado.indices.acontecimentos.porPessoa["teste-pessoa-a"]!.pop();
    expect(verifyAtlasData(alterado, "x").map((item) => item.mensagem)).toEqual([
      "Os índices não correspondem ao conjunto.",
    ]);
  });

  it("acusa acontecimentos fora de ordem, rascunho no conjunto e ponto sem acontecimento", () => {
    const { conjunto } = data();
    const foraDeOrdem = assembleAtlasData({
      ...conjunto,
      acontecimentos: [...conjunto.acontecimentos].reverse(),
    });
    expect(verifyAtlasData(foraDeOrdem, "x").map((item) => item.mensagem)).toContain(
      "Os acontecimentos não estão em ordem cronológica estável.",
    );

    const comRascunho = structuredClone(conjunto);
    comRascunho.acontecimentos[0]!.editorial = { estado: "rascunho" };
    expect(
      verifyAtlasData(assembleAtlasData(comRascunho), "x").map((item) => item.mensagem),
    ).toContain('Registro em estado "rascunho" não pode ser publicado.');

    const comPontoSolto = data();
    comPontoSolto.pontos.features[0]!.properties.eventId = "acontecimento-que-nao-existe";
    comPontoSolto.pontos.features[1]!.geometry.coordinates.reverse();
    expect(verifyAtlasData(comPontoSolto, "x").map((item) => item.mensagem)).toEqual([
      'Ponto de acontecimento fora do conjunto: "acontecimento-que-nao-existe".',
      "Coordenada inválida ou fora da ordem [longitude, latitude].",
    ]);
  });
});
