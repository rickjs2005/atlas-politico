// O leitor que as páginas usam (`getAtlasData`): no build de produção só lê o
// que foi gerado e validado; no servidor de desenvolvimento regenera quando o
// conteúdo muda.

import { existsSync, rmSync } from "node:fs";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { runBuild } from "@/lib/content/pipeline";

import { baseContent, createProject, removeProjects, type TestProject } from "./helpers";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  removeProjects();
});

/** Carrega o leitor do zero, como se o processo tivesse começado na raiz do projeto. */
async function loadReader(projeto: TestProject, ambiente: "development" | "production") {
  vi.resetModules();
  vi.stubEnv("NODE_ENV", ambiente);
  vi.spyOn(process, "cwd").mockReturnValue(projeto.paths.root);
  return (await import("@/lib/content/published")).getAtlasData;
}

const manifest = (projeto: TestProject) => path.join(projeto.paths.outDir, "manifest.json");

describe("leitor no build de produção", () => {
  it("lê os dados gerados", async () => {
    const projeto = createProject({ published: baseContent() });
    runBuild(projeto.paths);
    const getAtlasData = await loadReader(projeto, "production");

    const data = getAtlasData();
    expect(data.conjunto.acontecimentos).toHaveLength(7);
    expect(data.pontos.features).toHaveLength(6);
    // Todas as páginas do build recebem o mesmo objeto.
    expect(getAtlasData()).toBe(data);
  });

  it("sem dados gerados, interrompe o build e não gera por conta própria", async () => {
    const projeto = createProject({ published: baseContent() });
    const getAtlasData = await loadReader(projeto, "production");

    expect(() => getAtlasData()).toThrow(/Dados gerados não encontrados.*npm run data:build/);
    expect(existsSync(projeto.paths.outDir)).toBe(false);
  });

  it("com dados de outra versão do conteúdo, interrompe o build", async () => {
    const base = baseContent();
    const projeto = createProject({ published: base });
    runBuild(projeto.paths);

    base.acontecimentos[0]!.titulo = "Título corrigido depois da geração";
    projeto.write("published", { acontecimentos: base.acontecimentos });
    const getAtlasData = await loadReader(projeto, "production");

    expect(() => getAtlasData()).toThrow(/gerados a partir de outra versão do conteúdo/);
  });

  it("mudança só nos rascunhos também exige nova geração", async () => {
    const base = baseContent();
    const projeto = createProject({ published: base });
    runBuild(projeto.paths);
    projeto.write("drafts", { acontecimentos: [{ ...base.acontecimentos[7]!, id: "teste-evento-09", slug: "teste-evento-09" }] });

    const getAtlasData = await loadReader(projeto, "production");
    expect(() => getAtlasData()).toThrow(/outra versão do conteúdo/);
  });
});

describe("leitor no servidor de desenvolvimento", () => {
  it("gera os dados quando eles ainda não existem", async () => {
    const projeto = createProject({ published: baseContent() });
    const getAtlasData = await loadReader(projeto, "development");

    expect(getAtlasData().conjunto.acontecimentos).toHaveLength(7);
    expect(existsSync(manifest(projeto))).toBe(true);
  });

  it("regenera quando o conteúdo muda, sem reiniciar", async () => {
    const base = baseContent();
    const projeto = createProject({ published: base });
    const getAtlasData = await loadReader(projeto, "development");
    expect(getAtlasData().conjunto.acontecimentos[0]?.titulo).toContain("Acontecimento de teste 01");

    base.acontecimentos[0]!.titulo = "Título corrigido";
    projeto.write("published", { acontecimentos: base.acontecimentos });
    expect(getAtlasData().conjunto.acontecimentos[0]?.titulo).toBe("Título corrigido");
  });

  it("regenera quando a pasta gerada some ou é alterada à mão", async () => {
    const projeto = createProject({ published: baseContent() });
    const getAtlasData = await loadReader(projeto, "development");
    getAtlasData();

    rmSync(manifest(projeto));
    expect(getAtlasData().conjunto.acontecimentos).toHaveLength(7);

    projeto.writeFile("generated/dados/indices.json", "{}");
    expect(getAtlasData().indices.acontecimentos.porSlug).toHaveProperty("teste-evento-01");
  });

  it("com erro no conteúdo, a página recebe os diagnósticos em vez de dados antigos", async () => {
    const base = baseContent();
    const projeto = createProject({ published: base });
    const getAtlasData = await loadReader(projeto, "development");
    getAtlasData();

    base.acontecimentos[0]!.fontes[0]!.fonteId = "fonte-que-nao-existe";
    projeto.write("published", { acontecimentos: base.acontecimentos });

    expect(() => getAtlasData()).toThrow(
      /Conteúdo inválido \(1 erro\):\n {2}- content\/published\/acontecimentos\.json · acontecimento "teste-evento-01" · fontes\[0\]\.fonteId: Referência a fonte inexistente/,
    );
  });
});
