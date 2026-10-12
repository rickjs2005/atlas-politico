// A matriz de cobertura do jogo (src/lib/game/coverage.ts): todo
// acontecimento e toda decisão publicados de cada personagem aparecem em
// alguma fase, ou em uma exclusão justificada; toda área com proposta
// eleitoral tem ao menos uma em fase; e o documento gerado
// (docs/GAME-COVERAGE.md) está em dia com os dados.

import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { readSources, resolvePaths } from "@/lib/content/sources";
import { listDecisionViews } from "@/lib/data/decisions";
import { TEMAS } from "@/lib/domain/decisions";
import { PROFILES } from "@/lib/domain/profiles";
import {
  DECISION_EXCLUSIONS,
  EXCLUSIONS,
  PROPOSALS_OUTSIDE_GAME,
  appearancesOf,
  coverageOf,
  decisionCoverageOf,
  phasesOfPerson,
  proposalCoverageOf,
  renderCoverage,
  uncovered,
  uncoveredDecisions,
  uncoveredProposalAreas,
} from "@/lib/game/coverage";
import { buildAtlasData } from "@/lib/publication/build";

const data = buildAtlasData(readSources(resolvePaths())).data!;
const pessoaDe = (slug: string) => data.conjunto.pessoas.find((item) => item.slug === slug)!;

describe("matriz de cobertura", () => {
  it("nenhum acontecimento de um personagem fica sem fase e sem justificativa", () => {
    for (const perfil of PROFILES) expect(uncovered(data, perfil.slug), perfil.slug).toEqual([]);
  });

  it("nenhuma decisão de um personagem (voto, ato ou atuação legislativa) fica sem fase e sem justificativa", () => {
    for (const perfil of PROFILES) {
      expect(uncoveredDecisions(data, perfil.slug), perfil.slug).toEqual([]);
      const linhas = decisionCoverageOf(data, perfil.slug);
      expect(linhas.map((linha) => linha.decisaoId), perfil.slug).toEqual(listDecisionViews(data, pessoaDe(perfil.slug).id).map((view) => view.id));
      expect(linhas.length, perfil.slug).toBeGreaterThan(0);
    }
    const deFlavio = decisionCoverageOf(data, "flavio-bolsonaro");
    expect(deFlavio.filter((linha) => linha.natureza === "atuacao")).toHaveLength(9);
    expect(deFlavio.filter((linha) => linha.natureza === "voto")).toHaveLength(6);
  });

  it("uma exclusão só pode citar um registro que existe e que não está em fase", () => {
    for (const perfil of PROFILES) {
      const fases = phasesOfPerson(data, pessoaDe(perfil.slug).id);
      for (const [id, motivo] of Object.entries(EXCLUSIONS)) {
        expect(data.conjunto.acontecimentos.some((item) => item.id === id), id).toBe(true);
        expect(appearancesOf(fases, `acontecimento:${id}`), `${id} está em fase e em EXCLUSIONS`).toEqual([]);
        expect(motivo.trim().length, id).toBeGreaterThan(0);
      }
      for (const [id, motivo] of Object.entries(DECISION_EXCLUSIONS)) {
        expect(appearancesOf(fases, `decisao:${id}`), `${id} está em fase e em DECISION_EXCLUSIONS`).toEqual([]);
        expect(motivo.trim().length, id).toBeGreaterThan(0);
      }
    }
  });

  it("a cobertura de cada personagem lista todos os acontecimentos dele, em ordem cronológica, e o primeiro turno de 2026 aparece nas duas trilhas", () => {
    for (const perfil of PROFILES) {
      const pessoa = pessoaDe(perfil.slug);
      const linhas = coverageOf(data, perfil.slug);
      expect(linhas.length, perfil.slug).toBe(data.conjunto.acontecimentos.filter((item) => item.pessoaIds.includes(pessoa.id)).length);
      const doTurno = linhas.find((linha) => linha.eventId === "eleicao-2026-primeiro-turno");
      expect(doTurno?.fases.map((item) => item.fase.pessoaId), perfil.slug).toEqual([pessoa.id]);
      // Toda fase de cada linha é da própria pessoa.
      for (const linha of linhas) for (const { fase } of linha.fases) expect(fase.pessoaId, linha.eventId).toBe(pessoa.id);
    }
  });

  it("as propostas eleitorais: toda área de toda pessoa tem ao menos uma em fase, e as demais ficam a um toque, na comparação por área", () => {
    for (const perfil of PROFILES) {
      expect(uncoveredProposalAreas(data, perfil.slug), perfil.slug).toEqual([]);
      const linhas = proposalCoverageOf(data, perfil.slug);
      expect(linhas, perfil.slug).toHaveLength(TEMAS.length * 3);
      for (const tema of TEMAS) expect(linhas.filter((linha) => linha.area === tema && linha.fases.length > 0).length, `${perfil.slug} ${tema}`).toBeGreaterThanOrEqual(1);
      // As mesmas áreas em fase para as duas pessoas: uma por área na fase da eleição e as três de Economia e de Segurança pública nos aprofundamentos.
      expect(linhas.filter((linha) => linha.fases.length > 0).length, perfil.slug).toBe(11);
    }
    const emFase = (slug: "lula" | "flavio-bolsonaro") => proposalCoverageOf(data, slug).filter((linha) => linha.fases.length > 0).map((linha) => linha.propostaId.replace(`proposta-${slug}-`, ""));
    expect(emFase("lula")).toEqual(emFase("flavio-bolsonaro"));
    expect(PROPOSALS_OUTSIDE_GAME).toContain("/comparar/#propostas");
  });

  it("docs/GAME-COVERAGE.md está em dia: é o que `npm run game:coverage` gera", () => {
    const texto = renderCoverage(data);
    expect(texto).toContain("# Jogo: matriz de cobertura");
    expect(texto).not.toContain("SEM FASE");
    expect(texto).toContain("Nenhuma: todos os acontecimentos e todas as decisões publicados das duas pessoas aparecem em alguma fase.");
    expect(readFileSync("docs/GAME-COVERAGE.md", "utf8")).toBe(texto);
  });
});
