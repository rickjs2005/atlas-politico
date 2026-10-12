// Importação de pacotes JSON: tudo entra como rascunho, nada existente é
// alterado, e importar não publica.

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { runBuild, runImport } from "@/lib/content/pipeline";
import type { Acontecimento } from "@/lib/domain/schemas";
import { renderImportReport, type Importacao } from "@/lib/publication/import";

import { baseContent, createProject, omitField, removeProjects, type TestProject } from "./helpers";

afterEach(removeProjects);

const HOJE = "2026-10-09";

function newEvent(id: string, mudancas: Partial<Acontecimento> = {}): Acontecimento {
  return { ...baseContent().acontecimentos[0]!, id, slug: id, ...mudancas };
}

/** Grava o pacote no projeto e roda a importação. */
function importPackage(
  projeto: TestProject,
  pacote: unknown,
  opcoes: { simular?: boolean; descricao?: string } = {},
) {
  projeto.writeFile("entrada/pacote.json", JSON.stringify(pacote));
  return runImport(projeto.paths, path.join(projeto.paths.root, "entrada", "pacote.json"), {
    hoje: HOJE,
    ...opcoes,
  });
}

const readJson = <T>(projeto: TestProject, relativo: string): T =>
  JSON.parse(readFileSync(path.join(projeto.paths.root, relativo), "utf8")) as T;
const bytes = (projeto: TestProject, relativo: string) =>
  readFileSync(path.join(projeto.paths.root, relativo), "utf8");

describe("importação para os rascunhos", () => {
  it("registro válido entra como rascunho, com a origem anotada", () => {
    const projeto = createProject({ published: baseContent() });
    const semEstado = newEvent("teste-evento-novo");
    omitField(semEstado, "editorial");
    const { plano, gravados } = importPackage(
      projeto,
      { acontecimentos: [semEstado] },
      { descricao: "Planilha de pesquisa" },
    );

    expect(plano.registro.aceitos).toEqual([{ entidade: "acontecimento", id: "teste-evento-novo" }]);
    expect(plano.registro.pendentes).toEqual([]);
    expect(gravados).toEqual(["content/drafts/acontecimentos.json", "content/drafts/importacoes.json"]);

    const [rascunho] = readJson<Acontecimento[]>(projeto, "content/drafts/acontecimentos.json");
    expect(rascunho?.id).toBe("teste-evento-novo");
    expect(rascunho?.editorial).toEqual({
      estado: "rascunho",
      pendencias: [
        'Importado de "Planilha de pesquisa" em 9 de outubro de 2026: conferir cada afirmação contra as fontes antes de revisar.',
      ],
    });
  });

  it("revisão declarada no pacote nunca é aceita, nem como humana", () => {
    const projeto = createProject({ published: baseContent() });
    // O registro de origem vem como revisado, com revisão humana.
    const { plano } = importPackage(projeto, { acontecimentos: [newEvent("teste-evento-novo")] });

    expect(plano.registro.aceitos).toEqual([]);
    expect(plano.registro.pendentes).toEqual([
      {
        entidade: "acontecimento",
        id: "teste-evento-novo",
        pendencias: [
          'O pacote declarava o estado "revisado". A revisão feita na origem não foi aceita e precisa ser refeita aqui.',
        ],
      },
    ]);
    const gravado = bytes(projeto, "content/drafts/acontecimentos.json");
    expect(gravado).toContain('"estado": "rascunho"');
    expect(gravado).not.toContain("revisadoPor");
    expect(gravado).not.toContain('"humana"');
  });

  it("separa aceitos, pendentes, rejeitados e já existentes", () => {
    const base = baseContent();
    const projeto = createProject({ published: base });
    const semEstado = newEvent("teste-evento-pronto");
    omitField(semEstado, "editorial");
    const invalido = newEvent("teste-evento-invalido", { data: { valor: "2023-02-30", precisao: "dia" } });
    omitField(invalido, "contexto");

    const { plano } = importPackage(projeto, {
      acontecimentos: [
        semEstado,
        newEvent("teste-evento-sem-fonte", { fontes: [], editorial: { estado: "rascunho" } }),
        newEvent("teste-evento-fonte-nova", {
          fontes: [{ fonteId: "teste-fonte-nova", localizacao: "Página 2", evidencia: "Trecho." }],
          editorial: { estado: "rascunho", pendencias: ["Conferir a data."] },
        }),
        newEvent("teste-evento-solto", {
          pessoaIds: ["pessoa-que-nao-existe"],
          editorial: { estado: "rascunho" },
        }),
        invalido,
        newEvent("teste-evento-01"),
        newEvent("teste-evento-outro", { slug: "teste-evento-02", editorial: { estado: "rascunho" } }),
        newEvent("sintetico-evento-99"),
        "não é um registro",
      ],
      fontes: [{ ...base.fontes[0]!, id: "teste-fonte-nova" }, base.fontes[1], { ...base.fontes[2]!, titulo: "Outro título" }],
      edicao: base.edicao,
      noticias: [],
    });
    const { aceitos, pendentes, rejeitados, existentes } = plano.registro;

    expect(aceitos).toEqual([
      { entidade: "acontecimento", id: "teste-evento-pronto" },
      { entidade: "acontecimento", id: "teste-evento-fonte-nova" },
      { entidade: "fonte", id: "teste-fonte-nova" },
    ]);
    expect(pendentes).toEqual([
      {
        entidade: "acontecimento",
        id: "teste-evento-sem-fonte",
        pendencias: ["Sem fonte: registrar ao menos uma citação, com o trecho e o que ele sustenta."],
      },
      {
        entidade: "acontecimento",
        id: "teste-evento-solto",
        pendencias: ['Referência a pessoa inexistente: "pessoa-que-nao-existe".'],
      },
    ]);
    expect(existentes).toEqual([{ entidade: "fonte", id: "teste-fonte-02" }]);
    expect(rejeitados).toEqual([
      {
        posicao: "acontecimentos[4]",
        entidade: "acontecimento",
        id: "teste-evento-invalido",
        motivos: [
          "data.valor: Dia 30 não existe em fevereiro de 2023 (o mês tem 28 dias).",
          "contexto: Campo obrigatório ausente.",
        ],
      },
      {
        posicao: "acontecimentos[5]",
        entidade: "acontecimento",
        id: "teste-evento-01",
        motivos: [
          'Conflito de id: "teste-evento-01" já existe em content/published/acontecimentos.json. O registro existente foi preservado.',
        ],
      },
      {
        posicao: "acontecimentos[6]",
        entidade: "acontecimento",
        id: "teste-evento-outro",
        motivos: [
          'Conflito de slug: "teste-evento-02" já pertence a "teste-evento-02". O registro existente foi preservado.',
        ],
      },
      {
        posicao: "acontecimentos[7]",
        entidade: "acontecimento",
        id: "sintetico-evento-99",
        motivos: ["Dado sintético de teste não entra no conteúdo."],
      },
      {
        posicao: "acontecimentos[8]",
        entidade: "acontecimento",
        id: null,
        motivos: ["O registro deve ser um objeto."],
      },
      {
        posicao: "fontes[2]",
        entidade: "fonte",
        id: "teste-fonte-03",
        motivos: [
          'Conflito de id: "teste-fonte-03" já existe em content/published/fontes.json. O registro existente foi preservado.',
        ],
      },
      {
        posicao: "edicao",
        entidade: null,
        id: null,
        motivos: ["A edição não é importável: ela é mantida à mão em content/published/edicao.json."],
      },
      {
        posicao: "noticias",
        entidade: null,
        id: null,
        motivos: [
          "Coleção desconhecida. As aceitas são: pessoas, mandatos, filiacoes, acontecimentos, proposicoes, votacoes, votos, atosExecutivos, atuacoesLegislativas, coberturaPolitica, identidadesInstitucionais, propostasEleitorais, fatosBiograficos, conceitos, fasesDoJogo, lugares, fontes, imagens.",
        ],
      },
    ]);

    // Só o que foi aceito ou ficou pendente vai para o disco.
    expect(
      readJson<Acontecimento[]>(projeto, "content/drafts/acontecimentos.json").map((item) => item.id),
    ).toEqual([
      "teste-evento-pronto",
      "teste-evento-sem-fonte",
      "teste-evento-fonte-nova",
      "teste-evento-solto",
    ]);
    expect(readJson<{ id: string }[]>(projeto, "content/drafts/fontes.json").map((item) => item.id)).toEqual([
      "teste-fonte-nova",
    ]);
  });

  it("preserva os registros editoriais existentes", () => {
    const base = baseContent();
    const rascunhoAntigo = newEvent("teste-rascunho-antigo", {
      editorial: { estado: "rascunho", pendencias: ["Pendência antiga."] },
    });
    const projeto = createProject({ published: base, drafts: { acontecimentos: [rascunhoAntigo] } });
    const publicadoAntes = bytes(projeto, "content/published/acontecimentos.json");

    importPackage(projeto, {
      acontecimentos: [
        newEvent("teste-evento-01", { titulo: "Tentativa de sobrescrever o publicado" }),
        newEvent("teste-rascunho-antigo", { titulo: "Tentativa de sobrescrever o rascunho" }),
        newEvent("teste-evento-novo"),
      ],
    });

    expect(bytes(projeto, "content/published/acontecimentos.json")).toBe(publicadoAntes);
    const rascunhos = readJson<Acontecimento[]>(projeto, "content/drafts/acontecimentos.json");
    expect(rascunhos.map((item) => item.id)).toEqual(["teste-rascunho-antigo", "teste-evento-novo"]);
    expect(rascunhos[0]).toEqual(rascunhoAntigo);
  });

  it("id repetido dentro do pacote: só a primeira ocorrência entra", () => {
    const projeto = createProject({ published: baseContent() });
    const { plano } = importPackage(projeto, {
      acontecimentos: [
        newEvent("teste-evento-novo", { editorial: { estado: "rascunho" } }),
        newEvent("teste-evento-novo", { titulo: "Segunda versão" }),
      ],
    });
    expect(plano.registro.aceitos).toHaveLength(1);
    expect(plano.registro.rejeitados[0]?.motivos).toEqual([
      'Id repetido dentro do pacote: "teste-evento-novo". Só a primeira ocorrência entrou.',
    ]);
  });

  it("pacote que não é um objeto é recusado inteiro", () => {
    const projeto = createProject({ published: baseContent() });
    const { plano } = importPackage(projeto, [newEvent("teste-evento-novo")]);
    expect(plano.registro.rejeitados).toHaveLength(1);
    expect(plano.registro.rejeitados[0]?.motivos[0]).toMatch(/O pacote deve ser um objeto/);
    expect(existsSync(path.join(projeto.paths.draftsDir, "acontecimentos.json"))).toBe(false);
  });

  it("simulação não grava nada", () => {
    const projeto = createProject({ published: baseContent() });
    const { plano, gravados } = importPackage(
      projeto,
      { acontecimentos: [newEvent("teste-evento-novo")] },
      { simular: true },
    );
    expect(plano.registro.pendentes).toHaveLength(1);
    expect(gravados).toEqual([]);
    expect(existsSync(projeto.paths.draftsDir)).toBe(false);
    expect(renderImportReport(plano.registro, true)).toContain("Nada foi gravado.");
  });
});

describe("registro de importações", () => {
  it("guarda origem e resultado de cada importação, em ordem", () => {
    const projeto = createProject({ published: baseContent() });
    importPackage(projeto, { acontecimentos: [newEvent("teste-evento-a")] }, { descricao: "Primeira" });
    importPackage(projeto, { acontecimentos: [newEvent("teste-evento-a"), newEvent("teste-evento-b")] });

    const registro = readJson<Importacao[]>(projeto, "content/drafts/importacoes.json");
    expect(registro).toHaveLength(2);
    expect(registro[0]).toMatchObject({
      data: HOJE,
      origem: { arquivo: "pacote.json", descricao: "Primeira" },
      pendentes: [{ entidade: "acontecimento", id: "teste-evento-a" }],
    });
    expect(registro[0]?.origem.sha256).toMatch(/^[0-9a-f]{64}$/);
    expect(registro[1]?.origem).not.toHaveProperty("descricao");
    expect(registro[1]?.rejeitados.map((item) => item.id)).toEqual(["teste-evento-a"]);
    expect(registro[1]?.pendentes.map((item) => item.id)).toEqual(["teste-evento-b"]);
    expect(registro[1]?.origem.sha256).not.toBe(registro[0]?.origem.sha256);
  });

  it("registro de importações fora do formato é erro de validação e impede nova importação", () => {
    const projeto = createProject({ published: baseContent(), drafts: { importacoes: [{ data: "ontem" }] } });
    expect(projeto.result().diagnostics.some((item) => item.entidade === "importacao")).toBe(true);
    expect(() => importPackage(projeto, { acontecimentos: [] })).toThrow(/registro de importações/);
  });
});

describe("importação e publicação são operações separadas", () => {
  it("importar não toca nos dados gerados, e o importado não chega aos dados públicos", () => {
    const projeto = createProject({ published: baseContent() });
    runBuild(projeto.paths);
    const manifesto = bytes(projeto, "generated/manifest.json");
    const conjunto = bytes(projeto, "generated/dados/conjunto.json");

    importPackage(projeto, {
      acontecimentos: [newEvent("teste-evento-novo")],
      lugares: [{ ...baseContent().lugares[5]!, id: "teste-lugar-novo" }],
    });
    expect(bytes(projeto, "generated/manifest.json")).toBe(manifesto);

    // Nova geração: o conteúdo mudou, mas os dados públicos são os mesmos.
    const { resultado } = runBuild(projeto.paths);
    expect(resultado.ok).toBe(true);
    expect(bytes(projeto, "generated/dados/conjunto.json")).toBe(conjunto);
    expect(bytes(projeto, "generated/manifest.json")).not.toBe(manifesto);
    expect(resultado.excluidos.map((item) => [item.id, item.motivo])).toEqual(
      expect.arrayContaining([
        ["teste-evento-novo", "rascunho"],
        ["teste-lugar-novo", "em-rascunhos"],
      ]),
    );
  });

  it("o conteúdo continua válido depois de importar registro com referência pendente", () => {
    const projeto = createProject({ published: baseContent() });
    importPackage(projeto, {
      acontecimentos: [
        newEvent("teste-evento-solto", {
          localizacao: { tipo: "lugares", lugarIds: ["lugar-que-nao-existe"] },
        }),
      ],
    });
    const { ok, diagnostics } = projeto.result();
    expect(ok).toBe(true);
    expect(diagnostics.filter((item) => item.severidade === "erro")).toEqual([]);
    expect(diagnostics.some((item) => item.codigo === "referencia-inexistente")).toBe(true);
  });
});
