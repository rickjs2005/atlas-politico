// A lista de revisão humana: cobre todos os registros publicados
// (acontecimentos, filiações, mandatos, decisões, propostas eleitorais e o
// conteúdo educativo do jogo), com as fontes de cada um, e o documento gerado
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
  it("cita todo registro publicado (acontecimento, filiação, mandato, decisão, proposta, fase, fato e conceito), com todas as fontes", () => {
    for (const item of data.conjunto.acontecimentos) expect(texto, item.id).toContain(`\`${item.id}\``);
    for (const item of data.conjunto.filiacoes) expect(texto, item.id).toContain(`\`${item.id}\``);
    for (const item of data.conjunto.mandatos) expect(texto, item.id).toContain(`\`${item.id}\``);
    for (const item of data.conjunto.votos) expect(texto, item.id).toContain(`\`${item.id}\``);
    for (const item of data.conjunto.votacoes) expect(texto, item.id).toContain(`\`${item.id}\``);
    for (const item of data.conjunto.proposicoes) expect(texto, item.id).toContain(`\`${item.id}\``);
    for (const item of data.conjunto.atosExecutivos) expect(texto, item.id).toContain(`\`${item.id}\``);
    for (const item of data.conjunto.atuacoesLegislativas) expect(texto, item.id).toContain(`\`${item.id}\``);
    for (const item of data.conjunto.propostasEleitorais) expect(texto, item.id).toContain(`\`${item.id}\``);
    for (const item of data.conjunto.fasesDoJogo) expect(texto, item.id).toContain(`\`${item.id}\``);
    for (const item of data.conjunto.fatosBiograficos) expect(texto, item.id).toContain(`\`${item.id}\``);
    for (const item of data.conjunto.conceitos) expect(texto, item.id).toContain(`\`${item.id}\``);
    for (const item of data.conjunto.coberturaPolitica) expect(texto, item.id).toContain(`\`${item.id}\``);
    for (const item of data.conjunto.identidadesInstitucionais) expect(texto, item.id).toContain(`\`${item.id}\``);
    for (const fonte of data.conjunto.fontes) expect(texto, fonte.id).toContain(fonte.url);
    // A seção das decisões vem depois das demais e diz que a amostra não é o histórico completo.
    expect(texto).toContain("## 6. Decisões políticas: votos, atos do Executivo e atuação legislativa");
    expect(texto).toContain("não o histórico completo");
    // As propostas vêm em seção própria, depois das decisões: proposta não é ato, voto nem resultado.
    const decisoes = texto.indexOf("## 6. Decisões políticas");
    const propostas = texto.indexOf("## 7. Propostas eleitorais registradas no TSE");
    const jogo = texto.indexOf("## 8. Conteúdo educativo do jogo");
    expect(propostas).toBeGreaterThan(decisoes);
    expect(jogo).toBeGreaterThan(propostas);
    expect(texto).toContain("Proposta é o que o documento diz que pretende fazer: não é ato, não é voto e não é resultado.");
    expect(texto).toContain("propor ou relatar uma matéria não diz como a pessoa votou nela");
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
