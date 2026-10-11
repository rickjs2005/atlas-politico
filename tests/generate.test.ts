// O gerador com disco: o que grava, o que preserva e o que recusa.

import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { GeneratedDataError, readGenerated } from "@/lib/content/output";
import { runBuild, runReport } from "@/lib/content/pipeline";
import { fingerprintSources, readSources } from "@/lib/content/sources";
import { renderCoverageMarkdown } from "@/lib/publication/coverage";

import { baseContent, createProject, removeProjects, type TestProject } from "./helpers";

afterEach(removeProjects);

/** Todos os arquivos de uma pasta, com o resumo do conteúdo de cada um. */
function snapshot(dir: string, base: string = dir): Record<string, string> {
  if (!existsSync(dir)) return {};
  return Object.fromEntries(
    readdirSync(dir).flatMap((nome): [string, string][] => {
      const caminho = path.join(dir, nome);
      if (statSync(caminho).isDirectory()) return Object.entries(snapshot(caminho, base));
      const relativo = path.relative(base, caminho).split(path.sep).join("/");
      return [[relativo, createHash("sha256").update(readFileSync(caminho)).digest("hex")]];
    }),
  );
}

const dataFiles = (projeto: TestProject) => {
  const arquivos = snapshot(projeto.paths.outDir);
  return Object.fromEntries(Object.entries(arquivos).filter(([nome]) => !nome.startsWith("relatorio/")));
};
const content = (projeto: TestProject) => snapshot(path.join(projeto.paths.root, "content"));
const fingerprint = (projeto: TestProject) => fingerprintSources(readSources(projeto.paths));

describe("geração", () => {
  it("grava o conjunto, os índices, os pontos e os relatórios na pasta do gerador", () => {
    const projeto = createProject({ published: baseContent() });
    const { resultado, gravacao } = runBuild(projeto.paths);

    expect(resultado.ok).toBe(true);
    expect(Object.keys(snapshot(projeto.paths.outDir)).sort()).toEqual([
      "dados/conjunto.json",
      "dados/geo/acontecimentos.geojson",
      "dados/geo/pessoas/teste-pessoa-a.geojson",
      "dados/geo/pessoas/teste-pessoa-b.geojson",
      "dados/indices.json",
      "manifest.json",
      "relatorio/cobertura.md",
      "relatorio/execucao.json",
    ]);
    expect(gravacao?.manifest.contagens).toEqual({
      pessoas: 2,
      mandatos: 4,
      filiacoes: 1,
      acontecimentos: 7,
      proposicoes: 3,
      votacoes: 6,
      votos: 3,
      atosExecutivos: 1,
      coberturaPolitica: 2,
      identidadesInstitucionais: 1,
      lugares: 6,
      fontes: 3,
      imagens: 0,
      pontos: 6,
    });
    expect(gravacao?.manifest.edicao).toEqual({ versao: "0.0.1", dataDeCorte: "2026-10-08" });
  });

  it("o que se lê de volta é o que o pipeline montou", () => {
    const projeto = createProject({ published: baseContent() });
    const { resultado, entrada } = runBuild(projeto.paths);
    const { data, manifest } = readGenerated(projeto.paths.outDir, entrada);

    expect(data).toEqual(resultado.data);
    expect(manifest.entrada).toBe(fingerprint(projeto));
  });

  it("cada pessoa tem a coleção dos seus pontos, com o acontecimento compartilhado nas duas", () => {
    const projeto = createProject({ published: baseContent() });
    runBuild(projeto.paths);
    const points = (slug: string) => {
      const arquivo = path.join(projeto.paths.outDir, "dados", "geo", "pessoas", `${slug}.geojson`);
      const colecao = JSON.parse(readFileSync(arquivo, "utf8")) as {
        type: string;
        features: { id: string }[];
      };
      expect(colecao.type).toBe("FeatureCollection");
      return colecao.features.map((ponto) => ponto.id);
    };

    expect(points("teste-pessoa-a")).toEqual([
      "teste-evento-01@teste-lugar-norte",
      "teste-evento-02@teste-lugar-centro",
      "teste-evento-03@teste-lugar-sudeste",
      "teste-evento-03@teste-lugar-sul",
      "teste-evento-07@teste-lugar-exterior",
    ]);
    expect(points("teste-pessoa-b")).toEqual([
      "teste-evento-03@teste-lugar-sudeste",
      "teste-evento-03@teste-lugar-sul",
      "teste-evento-05@teste-lugar-nordeste",
    ]);
  });

  it("sem pontos elegíveis, a coleção vazia é gravada e lida normalmente", () => {
    const base = baseContent();
    for (const acontecimento of base.acontecimentos) acontecimento.localizacao = { tipo: "nacional" };
    const projeto = createProject({ published: base });

    const { resultado, entrada } = runBuild(projeto.paths);
    expect(resultado.ok).toBe(true);
    const { data } = readGenerated(projeto.paths.outDir, entrada);
    expect(data.pontos).toEqual({ type: "FeatureCollection", features: [] });
    expect(data.conjunto.lugares).toEqual([]);
    expect(data.conjunto.acontecimentos).toHaveLength(7);
  });

  it("sem edição, gera o conjunto vazio: publicar nada é um estado válido", () => {
    const projeto = createProject();
    const { resultado, gravacao, entrada } = runBuild(projeto.paths);
    expect(resultado.ok).toBe(true);
    expect(gravacao?.manifest.edicao).toBeNull();
    expect(readGenerated(projeto.paths.outDir, entrada).data.conjunto.acontecimentos).toEqual([]);
  });
});

describe("reprodução", () => {
  it("repetir a geração com a mesma entrada preserva a saída, byte a byte", () => {
    const projeto = createProject({ published: baseContent() });
    runBuild(projeto.paths, new Date("2026-10-08T12:00:00Z"));
    const primeira = dataFiles(projeto);

    const segunda = runBuild(projeto.paths, new Date("2027-01-01T00:00:00Z"));
    expect(dataFiles(projeto)).toEqual(primeira);
    // Só o relatório técnico, que guarda o horário, é regravado.
    expect(segunda.gravacao?.gravados).toEqual(["relatorio/execucao.json"]);
    expect(segunda.gravacao?.removidos).toEqual([]);
  });

  it("os dados não guardam horário de execução", () => {
    const projeto = createProject({ published: baseContent() });
    runBuild(projeto.paths, new Date("2031-03-04T05:06:07Z"));
    for (const nome of Object.keys(dataFiles(projeto))) {
      const texto = readFileSync(path.join(projeto.paths.outDir, nome), "utf8");
      expect(texto, nome).not.toContain("2031-03-04");
    }
    expect(readFileSync(path.join(projeto.paths.outDir, "relatorio/execucao.json"), "utf8")).toContain(
      "2031-03-04T05:06:07.000Z",
    );
  });

  it("formatação, BOM, fim de linha e ordem dos campos não mudam a entrada nem a saída", () => {
    const base = baseContent();
    const projeto = createProject({ published: base });
    runBuild(projeto.paths);
    const antes = { dados: dataFiles(projeto), entrada: fingerprint(projeto) };

    const reversed = (valor: unknown): unknown =>
      Array.isArray(valor)
        ? valor.map(reversed)
        : typeof valor === "object" && valor !== null
          ? Object.fromEntries(Object.entries(valor).reverse().map(([k, v]) => [k, reversed(v)]))
          : valor;
    for (const [nome, dados] of Object.entries(base)) {
      const texto = JSON.stringify(reversed(dados), null, "\t").replaceAll("\n", "\r\n");
      projeto.writeFile(`content/published/${nome}.json`, `﻿${texto}`);
    }

    expect(fingerprint(projeto)).toBe(antes.entrada);
    const { gravacao } = runBuild(projeto.paths);
    expect(dataFiles(projeto)).toEqual(antes.dados);
    expect(gravacao?.gravados).toEqual(["relatorio/execucao.json"]);
  });

  it("a ordem dos registros nos arquivos não muda os dados gerados", () => {
    const base = baseContent();
    const projeto = createProject({ published: base });
    runBuild(projeto.paths);
    const antes = dataFiles(projeto);

    projeto.write("published", {
      acontecimentos: [...base.acontecimentos].reverse(),
      fontes: [...base.fontes].reverse(),
      lugares: [...base.lugares].reverse(),
    });
    runBuild(projeto.paths);
    const depois = dataFiles(projeto);

    // A entrada mudou (o manifesto registra outra impressão digital); os dados, não.
    expect(depois["manifest.json"]).not.toBe(antes["manifest.json"]);
    delete antes["manifest.json"];
    delete depois["manifest.json"];
    expect(depois).toEqual(antes);
  });

  it("o relatório de cobertura também é reproduzível", () => {
    const projeto = createProject({ published: baseContent() });
    const primeiro = renderCoverageMarkdown(runReport(projeto.paths).relatorio);
    expect(renderCoverageMarkdown(runReport(projeto.paths).relatorio)).toBe(primeiro);
    expect(primeiro).toContain("| Acontecimentos elegíveis | 7 |");
    expect(primeiro).toContain("| Pontos geográficos | 6 |");
    expect(primeiro).toContain("| Acontecimentos fora da publicação (rascunhos) | 1 |");
  });
});

describe("falha de validação", () => {
  it("impede a geração, mantém a saída anterior e preserva os arquivos editoriais", () => {
    const base = baseContent();
    const projeto = createProject({ published: base });
    const boa = runBuild(projeto.paths);
    const saidaAntes = snapshot(projeto.paths.outDir);

    base.acontecimentos[0]!.fontes[0]!.fonteId = "fonte-que-nao-existe";
    projeto.write("published", { acontecimentos: base.acontecimentos });
    const conteudoAntes = content(projeto);

    const ruim = runBuild(projeto.paths);
    expect(ruim.resultado.ok).toBe(false);
    expect(ruim.resultado.data).toBeNull();
    expect(ruim.gravacao).toBeNull();
    expect(snapshot(projeto.paths.outDir)).toEqual(saidaAntes);
    expect(content(projeto)).toEqual(conteudoAntes);

    // A saída antiga é de outra entrada: o build da aplicação a recusa.
    expect(ruim.entrada).not.toBe(boa.entrada);
    expect(() => readGenerated(projeto.paths.outDir, ruim.entrada)).toThrow(GeneratedDataError);
    expect(() => readGenerated(projeto.paths.outDir, ruim.entrada)).toThrow(
      /gerados a partir de outra versão do conteúdo/,
    );
  });

  it("sem geração anterior, a falha não cria a pasta", () => {
    const projeto = createProject({ published: { ...baseContent(), fontes: "isto não é uma lista" } });
    expect(runBuild(projeto.paths).gravacao).toBeNull();
    expect(existsSync(projeto.paths.outDir)).toBe(false);
    expect(() => readGenerated(projeto.paths.outDir)).toThrow(/Dados gerados não encontrados/);
  });

  it("conteúdo corrigido volta a gerar", () => {
    const base = baseContent();
    const projeto = createProject({ published: { ...base, lugares: [] } });
    expect(runBuild(projeto.paths).gravacao).toBeNull();

    projeto.write("published", { lugares: base.lugares });
    const { resultado, entrada } = runBuild(projeto.paths);
    expect(resultado.ok).toBe(true);
    expect(readGenerated(projeto.paths.outDir, entrada).data.conjunto.lugares).toHaveLength(6);
  });
});

describe("pasta controlada pelo gerador", () => {
  it("remove arquivos obsoletos, e só dentro da pasta gerada", () => {
    const base = baseContent();
    const projeto = createProject({ published: base });
    runBuild(projeto.paths);
    projeto.writeFile("generated/dados/antigo.json", "{}");
    projeto.writeFile("vizinho.json", "{}");

    // A pessoa B sai da edição, com tudo o que depende dela.
    const deA = (item: { pessoaId: string }) => item.pessoaId === "teste-pessoa-a";
    projeto.write("published", {
      pessoas: base.pessoas.slice(0, 1),
      mandatos: base.mandatos.filter(deA),
      acontecimentos: base.acontecimentos.filter((item) => !item.pessoaIds.includes("teste-pessoa-b")),
      votos: base.votos.filter(deA),
      coberturaPolitica: base.coberturaPolitica.filter(deA),
      identidadesInstitucionais: base.identidadesInstitucionais.filter(deA),
      edicao: { ...base.edicao, cobertura: base.edicao.cobertura.slice(0, 1) },
    });
    const { resultado, gravacao } = runBuild(projeto.paths);

    expect(resultado.ok).toBe(true);
    expect(gravacao?.removidos.sort()).toEqual([
      "dados/antigo.json",
      "dados/geo/pessoas/teste-pessoa-b.geojson",
    ]);
    expect(existsSync(path.join(projeto.paths.outDir, "dados/geo/pessoas/teste-pessoa-b.geojson"))).toBe(false);
    expect(existsSync(path.join(projeto.paths.root, "vizinho.json"))).toBe(true);
    expect(content(projeto)).toHaveProperty(["published/pessoas.json"]);
  });

  it("recusa gravar em pasta que não é do gerador, sem apagar nada", () => {
    const projeto = createProject({ published: baseContent() });
    const antes = content(projeto);
    const errado = { ...projeto.paths, outDir: path.join(projeto.paths.root, "content") };

    expect(() => runBuild(errado)).toThrow(/não são do gerador de dados/);
    expect(content(projeto)).toEqual(antes);
  });

  it("recupera a pasta depois de uma geração interrompida", () => {
    const projeto = createProject({ published: baseContent() });
    const { entrada } = runBuild(projeto.paths);
    rmSync(path.join(projeto.paths.outDir, "manifest.json"));
    expect(() => readGenerated(projeto.paths.outDir, entrada)).toThrow(/Dados gerados não encontrados/);

    runBuild(projeto.paths);
    expect(readGenerated(projeto.paths.outDir, entrada).data.conjunto.acontecimentos).toHaveLength(7);
  });

  it("a leitura recusa arquivo alterado à mão ou ausente", () => {
    const projeto = createProject({ published: baseContent() });
    const { entrada } = runBuild(projeto.paths);
    const conjunto = path.join(projeto.paths.outDir, "dados/conjunto.json");

    projeto.writeFile("generated/dados/conjunto.json", readFileSync(conjunto, "utf8").replace("Acontecimento", "Fato"));
    expect(() => readGenerated(projeto.paths.outDir, entrada)).toThrow(/foi alterado depois de gerado/);

    rmSync(conjunto);
    expect(() => readGenerated(projeto.paths.outDir, entrada)).toThrow(/Falta dados\/conjunto\.json/);

    runBuild(projeto.paths);
    expect(() => readGenerated(projeto.paths.outDir, entrada)).not.toThrow();
  });

  it("trocar o arquivo de uma imagem muda a entrada", () => {
    const base = baseContent();
    base.imagens.push({
      id: "teste-retrato-a",
      arquivo: "/media/retratos/teste-a.jpg",
      autoria: "Autoria de teste",
      credito: "Crédito de teste",
      origem: "https://exemplo.invalid/retrato",
      condicoesDeUso: "Uso livre com crédito",
      textoAlternativo: "Retrato de teste",
    });
    base.pessoas[0]!.retratoId = "teste-retrato-a";
    const projeto = createProject({ published: base });
    projeto.writeFile("public/media/retratos/teste-a.jpg", Buffer.from([0xff, 0xd8, 0xff, 0xd9]));
    const antes = fingerprint(projeto);

    projeto.writeFile("public/media/retratos/teste-a.jpg", Buffer.from([0xff, 0xd8, 0xff, 0xd9, 0x00]));
    expect(fingerprint(projeto)).not.toBe(antes);
  });
});
