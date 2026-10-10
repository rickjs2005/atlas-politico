// A matriz de cobertura do jogo: todo acontecimento publicado de cada
// personagem está em um capítulo dele ou em uma exclusão justificada, e o
// documento gerado (docs/GAME-COVERAGE.md) está em dia com os dados e os
// capítulos.

import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { readSources, resolvePaths } from "@/lib/content/sources";
import { PROFILES } from "@/lib/domain/profiles";
import { CHAPTERS } from "@/lib/game/chapters";
import { EXCLUSIONS, coverageOf, renderCoverage, uncovered } from "@/lib/game/coverage";
import { buildAtlasData } from "@/lib/publication/build";

const data = buildAtlasData(readSources(resolvePaths())).data!;

describe("matriz de cobertura", () => {
  it("nenhum acontecimento de um personagem fica sem capítulo e sem justificativa", () => {
    for (const perfil of PROFILES) expect(uncovered(data, perfil.slug), perfil.slug).toEqual([]);
  });

  it("uma exclusão só pode citar um acontecimento que existe e que não está em capítulo", () => {
    const emCapitulos = new Set(CHAPTERS.flatMap((capitulo) => capitulo.eventIds));
    for (const [id, motivo] of Object.entries(EXCLUSIONS)) {
      expect(data.conjunto.acontecimentos.some((item) => item.id === id), id).toBe(true);
      expect(emCapitulos.has(id), `${id} está em capítulo e em EXCLUSIONS`).toBe(false);
      expect(motivo.trim().length, id).toBeGreaterThan(0);
    }
  });

  it("a cobertura de cada personagem lista todos os acontecimentos dele, em ordem cronológica", () => {
    for (const perfil of PROFILES) {
      const pessoa = data.conjunto.pessoas.find((item) => item.slug === perfil.slug)!;
      const linhas = coverageOf(data, perfil.slug);
      expect(linhas.length, perfil.slug).toBe(data.conjunto.acontecimentos.filter((item) => item.pessoaIds.includes(pessoa.id)).length);
      for (const linha of linhas) expect(linha.capitulo?.personagem, linha.eventId).toBe(perfil.slug);
    }
  });

  it("docs/GAME-COVERAGE.md está em dia: é o que `npm run game:coverage` gera", () => {
    const texto = renderCoverage(data);
    expect(texto).toContain("# Jogo: matriz de cobertura");
    expect(texto).not.toContain("SEM CAPÍTULO");
    expect(readFileSync("docs/GAME-COVERAGE.md", "utf8")).toBe(texto);
  });
});
