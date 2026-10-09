// Os comandos de dados como são chamados pelo npm: Node com o carregador de
// TypeScript do projeto. Confere os códigos de saída e que os módulos rodam
// fora do Vitest e do Next, só com a remoção de tipos do Node.

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { baseContent, createProject, removeProjects, type TestProject } from "./helpers";

afterEach(removeProjects);

function run(projeto: TestProject | null, ...args: string[]) {
  const root = projeto === null ? [] : ["--root", projeto.paths.root];
  const processo = spawnSync(
    process.execPath,
    ["--import", "./scripts/register.mjs", "scripts/data.mts", ...args, ...root],
    { cwd: process.cwd(), encoding: "utf8" },
  );
  return { codigo: processo.status, saida: processo.stdout, erro: processo.stderr };
}

function broken(): TestProject {
  const base = baseContent();
  base.acontecimentos[0]!.fontes[0]!.fonteId = "fonte-que-nao-existe";
  return createProject({ published: base });
}

describe("comandos de dados", () => {
  it("validate: código 0 e resumo quando o conteúdo é válido", () => {
    const { codigo, saida, erro } = run(createProject({ published: baseContent() }), "validate");
    expect(erro).toBe("");
    expect(codigo).toBe(0);
    expect(saida).toContain("Edição 0.0.1, data de corte 2026-10-08.");
    expect(saida).toContain("PENDÊNCIAS: ficam fora da publicação (1)");
    expect(saida).toContain("Conteúdo válido: 0 erro(s), 1 pendência(s), 0 aviso(s).");
  });

  it("validate: código 1 e o diagnóstico quando há erro", () => {
    const { codigo, saida } = run(broken(), "validate");
    expect(codigo).toBe(1);
    expect(saida).toContain("ERROS: impedem a geração (1)");
    expect(saida).toContain(
      'content/published/acontecimentos.json · acontecimento "teste-evento-01" · fontes[0].fonteId: Referência a fonte inexistente: "fonte-que-nao-existe".',
    );
  });

  it("build: gera a pasta e, com erro, sai com código 1 sem gerar", () => {
    const bom = createProject({ published: baseContent() });
    const gerado = run(bom, "build");
    expect(gerado.codigo).toBe(0);
    expect(gerado.saida).toContain("7 acontecimentos, 2 pessoas");
    expect(gerado.saida).toContain("6 pontos no mapa");
    expect(existsSync(path.join(bom.paths.outDir, "manifest.json"))).toBe(true);

    const ruim = broken();
    const falha = run(ruim, "build");
    expect(falha.codigo).toBe(1);
    expect(falha.erro).toContain("Geração interrompida: 1 erro(s)");
    expect(existsSync(ruim.paths.outDir)).toBe(false);
  });

  it("report: imprime o relatório mesmo com erro, e grava em arquivo quando pedido", () => {
    const impresso = run(broken(), "report");
    expect(impresso.codigo).toBe(0);
    expect(impresso.saida).toContain("# Relatório de dados");
    expect(impresso.saida).toContain("**Publicação bloqueada: 1 erro(s).**");

    const projeto = createProject({ published: baseContent() });
    const destino = path.join(projeto.paths.root, "saida", "relatorio.md");
    expect(run(projeto, "report", "--out", destino).codigo).toBe(0);
    expect(readFileSync(destino, "utf8")).toContain("| Acontecimentos elegíveis | 7 |");
  });

  it("query: consulta os dados gerados e recusa dados de outra versão do conteúdo", () => {
    const base = baseContent();
    const projeto = createProject({ published: base });
    expect(run(projeto, "query").codigo).toBe(2); // ainda não gerado

    run(projeto, "build");
    const recorte = run(projeto, "query", "--pessoa", "teste-pessoa-a", "--de", "2003", "--ate", "2011");
    expect(recorte.codigo).toBe(0);
    expect(recorte.saida).toContain("março de 2003");
    expect(recorte.saida).toContain("teste-evento-03");
    expect(recorte.saida).toContain("2 acontecimento(s), em ordem cronológica.");

    const detalhe = run(projeto, "query", "--acontecimento", "teste-evento-04");
    expect(detalhe.saida).toContain("sem ponto no mapa (nacional)");

    expect(run(projeto, "query", "--de", "1800", "--ate", "1810").saida).toContain(
      "Nenhum acontecimento neste recorte.",
    );
    expect(run(projeto, "query", "--categorias", "inexistente").codigo).toBe(2);

    base.acontecimentos[0]!.titulo = "Título corrigido";
    projeto.write("published", { acontecimentos: base.acontecimentos });
    const desatualizado = run(projeto, "query");
    expect(desatualizado.codigo).toBe(2);
    expect(desatualizado.erro).toContain("gerados a partir de outra versão do conteúdo");
  });

  it("import: grava nos rascunhos, e --dry-run só mostra o resultado", () => {
    const projeto = createProject({ published: baseContent() });
    const evento = { ...baseContent().acontecimentos[0]!, id: "teste-evento-novo", slug: "teste-evento-novo" };
    projeto.writeFile("pacote.json", JSON.stringify({ acontecimentos: [evento] }));
    const pacote = path.join(projeto.paths.root, "pacote.json");

    const simulacao = run(projeto, "import", pacote, "--dry-run");
    expect(simulacao.codigo).toBe(0);
    expect(simulacao.saida).toContain("Simulação de importação de pacote.json");
    expect(existsSync(projeto.paths.draftsDir)).toBe(false);

    const real = run(projeto, "import", pacote, "--source", "Teste de linha de comando");
    expect(real.codigo).toBe(0);
    expect(real.saida).toContain("Aceitos: 0 · Pendentes: 1 · Rejeitados: 0 · Já existentes: 0");
    expect(real.saida).toContain("Arquivos alterados: content/drafts/acontecimentos.json, content/drafts/importacoes.json.");
    expect(readFileSync(path.join(projeto.paths.draftsDir, "importacoes.json"), "utf8")).toContain(
      "Teste de linha de comando",
    );
  });

  it("uso errado sai com código 2 e mostra a ajuda", () => {
    const desconhecido = run(null, "publicar");
    expect(desconhecido.codigo).toBe(2);
    expect(desconhecido.erro).toContain("Comando desconhecido: publicar.");
    expect(desconhecido.erro).toContain("Uso: node --import");

    expect(run(null, "import").codigo).toBe(2);
    expect(run(null).codigo).toBe(2);
    expect(run(null, "--help").codigo).toBe(0);
  });

  it("valida o conteúdo do repositório", () => {
    const { codigo, saida } = run(null, "validate");
    expect(codigo).toBe(0);
    expect(saida).toMatch(/Conteúdo válido: 0 erro\(s\)/);
  });
});
