// A lista de revisão humana: cobre todos os acontecimentos, filiações e
// mandatos publicados, com as fontes de cada um, e o documento gerado
// (docs/HUMAN-REVIEW.md) está em dia. Nada aqui marca revisão como humana.

import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { readSources, resolvePaths } from "@/lib/content/sources";
import { renderHumanReview } from "@/lib/editorial/human-review";
import { JUDICIAL } from "@/lib/game/judicial";
import { buildAtlasData } from "@/lib/publication/build";

const data = buildAtlasData(readSources(resolvePaths())).data!;
const texto = renderHumanReview(data);

describe("lista de revisão humana", () => {
  it("cita todo acontecimento, filiação, mandato, decisão, cobertura e identidade publicados, com todas as fontes", () => {
    for (const item of data.conjunto.acontecimentos) expect(texto, item.id).toContain(`\`${item.id}\``);
    for (const item of data.conjunto.filiacoes) expect(texto, item.id).toContain(`\`${item.id}\``);
    for (const item of data.conjunto.mandatos) expect(texto, item.id).toContain(`\`${item.id}\``);
    for (const item of data.conjunto.votos) expect(texto, item.id).toContain(`\`${item.id}\``);
    for (const item of data.conjunto.votacoes) expect(texto, item.id).toContain(`\`${item.id}\``);
    for (const item of data.conjunto.proposicoes) expect(texto, item.id).toContain(`\`${item.id}\``);
    for (const item of data.conjunto.atosExecutivos) expect(texto, item.id).toContain(`\`${item.id}\``);
    for (const item of data.conjunto.coberturaPolitica) expect(texto, item.id).toContain(`\`${item.id}\``);
    for (const item of data.conjunto.identidadesInstitucionais) expect(texto, item.id).toContain(`\`${item.id}\``);
    for (const fonte of data.conjunto.fontes) expect(texto, fonte.id).toContain(fonte.url);
    // A seção das decisões vem depois das demais e diz que a amostra não é o histórico completo.
    expect(texto).toContain("## 6. Decisões políticas: votos e atos do Executivo");
    expect(texto).toContain("não o histórico completo");
  });

  it("começa pelos episódios judiciais, e cada um deles está na seção judicial", () => {
    const judicial = texto.indexOf("## 1. Episódios judiciais");
    const eleitoral = texto.indexOf("## 2. Dados eleitorais");
    expect(judicial).toBeGreaterThan(0);
    expect(eleitoral).toBeGreaterThan(judicial);
    for (const id of Object.keys(JUDICIAL)) {
      const posicao = texto.indexOf(`\`${id}\``);
      expect(posicao, id).toBeGreaterThan(judicial);
      expect(posicao, id).toBeLessThan(eleitoral);
    }
  });

  it("diz que a conferência é assistida por IA e que ninguém registra revisão humana sem ler", () => {
    expect(texto).toContain("assistida por IA");
    expect(texto).toContain("O código e os scripts nunca fazem isso sozinhos");
    expect(texto).not.toMatch(/conferência humana, por/);
  });

  it("avisa que o primeiro turno de 2026 é apuração parcial", () => {
    expect(texto).toContain("99,99% das urnas");
    expect(texto).toContain("não a totalização final");
  });

  it("docs/HUMAN-REVIEW.md está em dia: é o que `npm run review:human` gera", () => {
    expect(readFileSync("docs/HUMAN-REVIEW.md", "utf8")).toBe(texto);
  });
});
