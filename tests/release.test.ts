// A barreira de release: o que recusa a publicação (registros sem revisão
// humana, domínio e canal de correção pendentes) e o que só avisa (indexação
// desligada, sem licença). É a régua da publicação, e não a do build: o
// conjunto com revisão assistida por IA passa pelo pipeline e é recusado aqui.

import { describe, expect, it } from "vitest";

import { isReleasable, releaseIssues, type ReleaseCollections } from "@/lib/editorial/release";

import { loadAtlasData } from "./helpers";

const CONJUNTO: ReleaseCollections = loadAtlasData().conjunto;

const SITE_PRONTO = { publicUrl: "https://atlas.exemplo.com.br", indexar: true, correctionChannel: { rotulo: "e-mail", href: "mailto:x@exemplo.com.br" } };
const SITE_PENDENTE = { publicUrl: null, indexar: false, correctionChannel: null };

/** O mesmo conjunto, com toda revisão marcada como humana: só para o teste, porque o código nunca faz isso. */
function comRevisaoHumana(conjunto: ReleaseCollections): ReleaseCollections {
  const copia: ReleaseCollections = JSON.parse(JSON.stringify(conjunto));
  for (const nome of ["pessoas", "mandatos", "filiacoes", "acontecimentos"] as const) {
    for (const registro of copia[nome]) {
      if (registro.editorial.estado === "revisado") registro.editorial.revisao.tipo = "humana";
    }
  }
  return copia;
}

describe("barreira de release", () => {
  it("registro com revisão assistida por IA recusa a release, uma condição por coleção, com a contagem", () => {
    const issues = releaseIssues(CONJUNTO, SITE_PRONTO, { licenca: true });
    const bloqueios = issues.filter((issue) => issue.nivel === "bloqueia");
    expect(isReleasable(issues)).toBe(false);
    // Uma condição para cada coleção das fixtures que tem registro sem revisão humana, e nenhuma para as outras.
    const colecoes = ["pessoas", "mandatos", "filiacoes", "acontecimentos"] as const;
    const comAssistida = colecoes.filter((nome) => CONJUNTO[nome].some((registro) => registro.editorial.estado !== "revisado" || registro.editorial.revisao.tipo !== "humana"));
    expect(comAssistida).toContain("acontecimentos");
    expect(bloqueios.map((issue) => issue.caminho)).toEqual(comAssistida.map((nome) => `${nome}.editorial.revisao`));
    for (const issue of bloqueios) {
      expect(issue.mensagem).toMatch(/^\d+ de \d+ registros? sem revisão humana/);
      expect(issue.mensagem).toContain("nunca registra revisão como humana");
    }
    const acontecimentos = bloqueios.find((issue) => issue.caminho === "acontecimentos.editorial.revisao")!;
    const assistidos = CONJUNTO.acontecimentos.filter((registro) => registro.editorial.estado !== "revisado" || registro.editorial.revisao.tipo !== "humana").length;
    expect(acontecimentos.mensagem.startsWith(`${assistidos} de ${CONJUNTO.acontecimentos.length} `)).toBe(true);
  });

  it("com revisão humana, domínio e canal, nada bloqueia", () => {
    const issues = releaseIssues(comRevisaoHumana(CONJUNTO), SITE_PRONTO, { licenca: true });
    expect(issues).toEqual([]);
    expect(isReleasable(issues)).toBe(true);
  });

  it("a revisão humana de uma coleção não libera as outras", () => {
    const parcial = comRevisaoHumana(CONJUNTO);
    // Um único acontecimento volta a assistida por IA: só a coleção dele bloqueia, e a contagem é de um.
    const primeiro = parcial.acontecimentos[0]!;
    if (primeiro.editorial.estado === "revisado") primeiro.editorial.revisao.tipo = "assistida-por-ia";
    const issues = releaseIssues(parcial, SITE_PRONTO, { licenca: true });
    expect(issues.map((issue) => issue.caminho)).toEqual(["acontecimentos.editorial.revisao"]);
    expect(issues[0]!.mensagem.startsWith(`1 de ${parcial.acontecimentos.length} registros sem revisão humana`)).toBe(true);
  });

  it("domínio e canal de correção pendentes bloqueiam; indexação desligada e falta de licença só avisam", () => {
    const issues = releaseIssues(comRevisaoHumana(CONJUNTO), SITE_PENDENTE, { licenca: false });
    expect(issues.map((issue) => [issue.nivel, issue.caminho])).toEqual([
      ["bloqueia", "src/lib/site.ts publicUrl"],
      ["bloqueia", "src/lib/site.ts correctionChannel"],
      ["aviso", "src/lib/site.ts indexar"],
      ["aviso", "LICENSE"],
    ]);
    expect(isReleasable(issues)).toBe(false);
  });

  it("só avisos não bloqueiam a release", () => {
    const issues = releaseIssues(comRevisaoHumana(CONJUNTO), { ...SITE_PRONTO, indexar: false }, { licenca: false });
    expect(issues.every((issue) => issue.nivel === "aviso")).toBe(true);
    expect(issues).toHaveLength(2);
    expect(isReleasable(issues)).toBe(true);
  });

  it("não altera o conjunto recebido", () => {
    const antes = JSON.stringify(CONJUNTO);
    releaseIssues(CONJUNTO, SITE_PENDENTE, { licenca: false });
    expect(JSON.stringify(CONJUNTO)).toBe(antes);
  });
});
