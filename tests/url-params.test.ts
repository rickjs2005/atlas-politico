import { describe, expect, it } from "vitest";

import { parseAtlasParams, serializeAtlasParams, type UrlState } from "@/lib/state/url-params";

const parse = (query: string) => parseAtlasParams(new URLSearchParams(query));

const VAZIO: UrlState = { periodo: { de: null, ate: null }, categorias: [], acontecimento: null };

describe("leitura dos parâmetros de URL", () => {
  it("lê período, categorias e acontecimento", () => {
    expect(
      parse("de=2003&ate=2010&categorias=eleicoes,mandatos-e-funcoes&acontecimento=posse-2003"),
    ).toEqual({
      periodo: { de: 2003, ate: 2010 },
      // sempre na ordem da lista de categorias, não na ordem do endereço
      categorias: ["mandatos-e-funcoes", "eleicoes"],
      acontecimento: "posse-2003",
    });
  });

  it("sem parâmetros, devolve o estado padrão", () => {
    expect(parse("")).toEqual(VAZIO);
  });

  it("descarta cada parâmetro inválido sem perder os válidos", () => {
    expect(parse("de=abc&ate=2010")).toMatchObject({ periodo: { de: null, ate: 2010 } });
    expect(parse("de=20033")).toMatchObject({ periodo: { de: null, ate: null } });
    expect(parse("ate=0999")).toMatchObject({ periodo: { de: null, ate: null } });
    expect(parse("categorias=inexistente,eleicoes,eleicoes")).toMatchObject({
      categorias: ["eleicoes"],
    });
    expect(parse("acontecimento=N%C3%A3o+Vale")).toMatchObject({ acontecimento: null });
    expect(parse("acontecimento=../segredo")).toMatchObject({ acontecimento: null });
  });

  it("lê um período informado ao contrário", () => {
    expect(parse("de=2010&ate=2003").periodo).toEqual({ de: 2003, ate: 2010 });
  });

  it("ignora parâmetros que não conhece", () => {
    expect(parse("utm_source=rede&de=2003")).toEqual({ ...VAZIO, periodo: { de: 2003, ate: null } });
  });
});

describe("escrita dos parâmetros de URL", () => {
  it("omite o que está no padrão", () => {
    expect(serializeAtlasParams(VAZIO)).toBe("");
  });

  it("escreve em ordem fixa", () => {
    expect(
      serializeAtlasParams({
        periodo: { de: 2003, ate: 2010 },
        categorias: ["eleicoes", "mandatos-e-funcoes"],
        acontecimento: "posse-2003",
      }),
    ).toBe("de=2003&ate=2010&categorias=mandatos-e-funcoes,eleicoes&acontecimento=posse-2003");
  });

  it("o que escreve, lê de volta igual", () => {
    const estados: UrlState[] = [
      VAZIO,
      { periodo: { de: 2003, ate: 2003 }, categorias: [], acontecimento: null },
      { periodo: { de: null, ate: 2018 }, categorias: ["marcos-historicos"], acontecimento: "um-slug" },
    ];
    for (const estado of estados) {
      expect(parse(serializeAtlasParams(estado))).toEqual(estado);
    }
  });
});
