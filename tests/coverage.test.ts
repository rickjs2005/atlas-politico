// Cobertura e recorte por pessoa: o que a edição declara cobrir, onde faltam
// registros e o que a página de um perfil recebe.

import { describe, expect, it } from "vitest";

import {
  findGaps,
  getCoverage,
  getCoveredSpan,
  getCutYear,
  getSharedSpan,
  listGaps,
} from "@/lib/data/coverage";
import { filterEvents, getEventView, getSources, listMandatesAt } from "@/lib/data/queries";
import { sliceForPerson } from "@/lib/data/slice";

import { loadAtlasData, slugs } from "./helpers";

const data = loadAtlasData();
const A = "sintetico-pessoa-a";
const B = "sintetico-pessoa-b";

describe("lacunas", () => {
  it("acha os períodos sem registro, inclusive no começo e no fim", () => {
    expect(findGaps([2004, 2010], { de: 2000, ate: 2015 }, 4)).toEqual([
      { de: 2000, ate: 2003 },
      { de: 2005, ate: 2009 },
      { de: 2011, ate: 2015 },
    ]);
  });

  it("intervalo menor que o mínimo não é lacuna", () => {
    expect(findGaps([2000, 2004, 2007], { de: 2000, ate: 2007 }, 4)).toEqual([]);
    expect(findGaps([2000, 2005], { de: 2000, ate: 2005 }, 4)).toEqual([{ de: 2001, ate: 2004 }]);
  });

  it("sem nenhum registro, o intervalo inteiro é lacuna", () => {
    expect(findGaps([], { de: 2000, ate: 2009 })).toEqual([{ de: 2000, ate: 2009 }]);
  });

  it("anos repetidos ou fora do intervalo não mudam o resultado", () => {
    expect(findGaps([1990, 2004, 2004, 2030], { de: 2000, ate: 2009 }, 4)).toEqual([
      { de: 2000, ate: 2003 },
      { de: 2005, ate: 2009 },
    ]);
  });
});

describe("cobertura da edição", () => {
  it("vai do início declarado ao ano da data de corte", () => {
    expect(getCutYear(data)).toBe(2026);
    expect(getCoveredSpan(data, A)).toEqual({ de: 1990, ate: 2026 });
    expect(getCoveredSpan(data, B)).toEqual({ de: 2010, ate: 2026 });
    expect(getCoverage(data, B)?.observacao).toContain("Cobertura mais curta");
  });

  it("a escala comum contém a cobertura de todas as pessoas", () => {
    expect(getSharedSpan(data)).toEqual({ de: 1990, ate: 2026 });
  });

  it("lista as lacunas de cada pessoa dentro do que a edição cobre", () => {
    // Acontecimentos revisados da pessoa A: 1994, 2003, 2011 e 2024.
    expect(listGaps(data, A)).toEqual([
      { de: 1990, ate: 1993 },
      { de: 1995, ate: 2002 },
      { de: 2004, ate: 2010 },
      { de: 2012, ate: 2023 },
    ]);
    // Pessoa B: 2011, 2012, 2018 e 2021. Antes de 2010 não é lacuna: está fora da cobertura.
    expect(listGaps(data, B)).toEqual([
      { de: 2013, ate: 2017 },
      { de: 2022, ate: 2026 },
    ]);
  });

  it("pessoa sem cobertura nem acontecimento não tem intervalo", () => {
    expect(getCoveredSpan(data, "ninguem")).toBeNull();
    expect(listGaps(data, "ninguem")).toEqual([]);
  });
});

describe("cargos na data de um acontecimento", () => {
  it("devolve o cargo que as datas provam", () => {
    const [cargo] = listMandatesAt(data, A, { valor: "2003-03", precisao: "mes" });
    expect(cargo?.registro.id).toBe("sintetico-mandato-a1");
    expect(cargo?.situacao).toBe("documentada");
    expect(listMandatesAt(data, A, { valor: "2002", precisao: "ano" })).toEqual([]);
  });

  it("marca como incerto o cargo sem limite documentado naquele lado", () => {
    const antigos = listMandatesAt(data, B, { valor: "2012", precisao: "ano" });
    expect(antigos.map((item) => [item.registro.id, item.situacao])).toEqual([
      ["sintetico-mandato-b1", "incerta"],
    ]);
    const atuais = listMandatesAt(data, B, { valor: "2021-02", precisao: "mes" });
    expect(atuais.map((item) => [item.registro.id, item.situacao])).toEqual([
      ["sintetico-mandato-b2", "documentada"],
    ]);
  });
});

describe("recorte por pessoa", () => {
  const recorte = sliceForPerson(data, B);

  it("leva só os registros da pessoa", () => {
    expect(slugs(recorte.conjunto.acontecimentos)).toEqual(["03", "04", "05", "06"]);
    expect(recorte.conjunto.mandatos.map((item) => item.id)).toEqual([
      "sintetico-mandato-b1",
      "sintetico-mandato-b2",
    ]);
    expect(recorte.conjunto.filiacoes).toEqual([]);
    expect(recorte.conjunto.edicao?.cobertura.map((item) => item.pessoaId)).toEqual([B]);
  });

  it("mantém o nome de quem divide um acontecimento, sem os registros dessa pessoa", () => {
    expect(recorte.conjunto.pessoas.map((pessoa) => pessoa.id).sort()).toEqual([A, B]);
    expect(recorte.conjunto.mandatos.some((item) => item.pessoaId === A)).toBe(false);
    const compartilhado = recorte.conjunto.acontecimentos.find((item) => item.pessoaIds.length > 1)!;
    expect(getEventView(recorte, compartilhado).pessoas.map((pessoa) => pessoa.id).sort()).toEqual([A, B]);
  });

  it("os índices e os pontos são refeitos sobre o recorte", () => {
    expect(filterEvents(recorte, { pessoaIds: [B] })).toEqual(filterEvents(data, { pessoaIds: [B] }));
    expect(filterEvents(recorte, { categorias: ["eleicoes"] }).map((item) => item.id)).toEqual([
      "sintetico-evento-05",
    ]);
    const eventos = new Set(recorte.pontos.features.map((ponto) => ponto.properties.eventId));
    expect([...eventos].sort()).toEqual(["sintetico-evento-03", "sintetico-evento-05"]);
  });

  it("toda fonte e todo lugar citados no recorte continuam resolvendo", () => {
    for (const registro of [...recorte.conjunto.acontecimentos, ...recorte.conjunto.mandatos]) {
      expect(getSources(recorte, registro)).toHaveLength(registro.fontes.length);
    }
    const lugares = new Set(recorte.conjunto.lugares.map((lugar) => lugar.id));
    for (const ponto of recorte.pontos.features) expect(lugares.has(ponto.properties.placeId)).toBe(true);
  });

  it("o recorte de uma pessoa não carrega o que é só da outra", () => {
    const daOutra = filterEvents(data, { pessoaIds: [A] }).filter((item) => !item.pessoaIds.includes(B));
    const ids = new Set(recorte.conjunto.acontecimentos.map((item) => item.id));
    expect(daOutra.length).toBeGreaterThan(0);
    expect(daOutra.some((item) => ids.has(item.id))).toBe(false);
  });
});
