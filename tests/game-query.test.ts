// O que o endereço pede ao jogo (src/lib/game/query.ts): a fase a abrir e o
// modo de leitura. Só navegação: o endereço não leva progresso.

import { describe, expect, it } from "vitest";

import { NO_QUERY, PHASE_PARAM, READING_PARAM, gameQuery, isGamePath, parseGameQuery } from "@/lib/game/query";
import { gameHref } from "@/lib/state/links";

describe("consulta do jogo", () => {
  it("sem parâmetros, não pede fase nem leitura", () => {
    expect(parseGameQuery("")).toEqual(NO_QUERY);
    expect(parseGameQuery("?outro=1")).toEqual({ fase: null, leitura: false });
  });

  it("lê a posição da fase, a partir de 1, e o pedido de leitura sem o cenário", () => {
    expect(parseGameQuery("?fase=1")).toEqual({ fase: 1, leitura: false });
    expect(parseGameQuery("?fase=9&leitura=1")).toEqual({ fase: 9, leitura: true });
    expect(parseGameQuery("leitura=1")).toEqual({ fase: null, leitura: true });
    expect(parseGameQuery("?fase=12")).toEqual({ fase: 12, leitura: false });
  });

  it("pedido que não é um número inteiro a partir de 1 é ignorado, sem erro", () => {
    for (const ruim of ["?fase=0", "?fase=-1", "?fase=abc", "?fase=1.5", "?fase=", "?fase=100", "?fase=01"]) expect(parseGameQuery(ruim).fase, ruim).toBeNull();
    expect(parseGameQuery("?leitura=sim").leitura).toBe(false);
    expect(parseGameQuery("?leitura=0").leitura).toBe(false);
  });

  it("monta a consulta que abre uma fase, e ela volta igual", () => {
    expect(gameQuery(3)).toBe("?fase=3");
    expect(gameQuery(3, true)).toBe("?fase=3&leitura=1");
    expect(parseGameQuery(gameQuery(7, true))).toEqual({ fase: 7, leitura: true });
    expect([PHASE_PARAM, READING_PARAM]).toEqual(["fase", "leitura"]);
  });
});

// Em uma navegação interna, a página do jogo é desenhada antes de o endereço
// dela entrar: o pedido que está no navegador ainda é o da página anterior.
// O jogo só lê e só escreve o endereço quando ele é o da própria página.
describe("o endereço é o desta página do jogo", () => {
  const trajetoria = gameHref("lula");
  const sala = gameHref("lula", "economia");

  it("reconhece a própria página, com ou sem a barra final, com index.html e sob um prefixo de hospedagem", () => {
    for (const endereco of ["/jogo/lula/", "/jogo/lula", "/jogo/lula/index.html", "/atlas/jogo/lula/"]) expect(isGamePath(endereco, trajetoria), endereco).toBe(true);
    for (const endereco of ["/jogo/lula/economia/", "/jogo/lula/economia", "/atlas/jogo/lula/economia/index.html"]) expect(isGamePath(endereco, sala), endereco).toBe(true);
  });

  it("não confunde a trajetória com o aprofundamento, com a entrada, com a outra pessoa nem com outra tela", () => {
    for (const endereco of ["/jogo/", "/", "/jogo/lula/economia/", "/jogo/flavio-bolsonaro/", "/acontecimentos/lula-2002-eleito-presidente/", "/politicos/lula/", "/outrojogo/lula/"]) {
      expect(isGamePath(endereco, trajetoria), endereco).toBe(false);
    }
    for (const endereco of ["/jogo/lula/", "/jogo/lula/seguranca-publica/", "/jogo/flavio-bolsonaro/economia/", "/jogo/"]) expect(isGamePath(endereco, sala), endereco).toBe(false);
  });

  it("um caminho vazio não casa com endereço nenhum", () => {
    expect(isGamePath("/jogo/lula/", "")).toBe(false);
    expect(isGamePath("/", "/")).toBe(false);
  });
});
