// Endereços que levam a consulta de uma tela para outra: da exploração e da
// comparação para a página de um acontecimento, e o caminho de volta. Funções
// puras, sem navegador.

import { describe, expect, it } from "vitest";

import {
  ORIGIN_COMPARISON,
  carryFromComparison,
  carryToComparison,
  comparisonHref,
  comparisonReturn,
  describeRecorte,
  eventHref,
  explorationHref,
  hasRecorte,
  profileReturn,
  readReturnContext,
  type Recorte,
} from "@/lib/state/links";

const SEM_RECORTE: Recorte = { periodo: { de: null, ate: null }, categorias: [] };
const RECORTE: Recorte = { periodo: { de: 2016, ate: 2019 }, categorias: ["marcos-historicos"] };

// Coberturas das duas pessoas de teste e a escala comum.
const COBERTURA_A = { de: 1990, ate: 2026 };
const COBERTURA_B = { de: 2010, ate: 2026 };
const ESCALA = { de: 1990, ate: 2026 };

const EVENTO = {
  slug: "sintetico-evento-05",
  data: { valor: "2018-08-22", precisao: "dia" as const },
  categoria: "eleicoes" as const,
};
const PERFIL_B = { slug: "sintetico-pessoa-b", cobertura: COBERTURA_B };

describe("endereços das telas", () => {
  it("a exploração leva período, categorias e acontecimento, na ordem do contrato", () => {
    expect(explorationHref("lula", { ...SEM_RECORTE, acontecimento: null })).toBe("/politicos/lula/");
    expect(explorationHref("lula", { ...RECORTE, acontecimento: "um-slug" })).toBe(
      "/politicos/lula/?de=2016&ate=2019&categorias=marcos-historicos&acontecimento=um-slug",
    );
  });

  it("a comparação leva o recorte, e nunca um acontecimento", () => {
    expect(comparisonHref()).toBe("/comparar/");
    expect(comparisonHref(RECORTE)).toBe("/comparar/?de=2016&ate=2019&categorias=marcos-historicos");
    expect(comparisonHref({ ...RECORTE, acontecimento: "um-slug" } as Recorte)).toBe(
      "/comparar/?de=2016&ate=2019&categorias=marcos-historicos",
    );
  });

  it("a página do acontecimento abre sozinha, sem contexto", () => {
    expect(eventHref("um-slug")).toBe("/acontecimentos/um-slug/");
    expect(eventHref("um-slug", { recorte: SEM_RECORTE })).toBe("/acontecimentos/um-slug/");
  });

  it("com contexto, o endereço da página leva o recorte de onde a pessoa vem", () => {
    expect(eventHref("um-slug", { recorte: RECORTE })).toBe(
      "/acontecimentos/um-slug/?de=2016&ate=2019&categorias=marcos-historicos",
    );
    expect(eventHref("um-slug", { recorte: RECORTE, origem: ORIGIN_COMPARISON })).toBe(
      "/acontecimentos/um-slug/?de=2016&ate=2019&categorias=marcos-historicos&origem=comparar",
    );
    expect(eventHref("um-slug", { recorte: SEM_RECORTE, origem: ORIGIN_COMPARISON })).toBe(
      "/acontecimentos/um-slug/?origem=comparar",
    );
  });

  it("o recorte que a exploração escreve não leva o acontecimento aberto para a página", () => {
    const estado = { ...RECORTE, acontecimento: "outro-slug" };
    expect(eventHref("um-slug", { recorte: estado })).not.toContain("acontecimento=");
  });
});

describe("contexto lido na página do acontecimento", () => {
  it("lê período, categorias e a origem", () => {
    expect(readReturnContext("?de=2016&ate=2019&categorias=marcos-historicos&origem=comparar")).toEqual({
      recorte: RECORTE,
      comparar: true,
    });
    expect(readReturnContext("")).toEqual({ recorte: SEM_RECORTE, comparar: false });
  });

  it("descarta o que é inválido, parâmetro por parâmetro", () => {
    const { recorte, comparar } = readReturnContext("?de=abcd&ate=2019&categorias=inventada,eleicoes&origem=outra");
    expect(recorte).toEqual({ periodo: { de: null, ate: 2019 }, categorias: ["eleicoes"] });
    expect(comparar).toBe(false);
  });

  it("lê o período informado ao contrário", () => {
    expect(readReturnContext("?de=2019&ate=2016").recorte.periodo).toEqual({ de: 2016, ate: 2019 });
  });
});

describe("retorno à exploração", () => {
  it("sem contexto, volta só com o acontecimento aberto", () => {
    expect(profileReturn("", EVENTO, PERFIL_B)).toEqual({
      href: "/politicos/sintetico-pessoa-b/?acontecimento=sintetico-evento-05",
      recorte: null,
    });
  });

  it("com contexto, devolve período, categorias e seleção", () => {
    const volta = profileReturn("?de=2016&ate=2019&categorias=eleicoes", EVENTO, PERFIL_B);
    expect(volta.href).toBe(
      "/politicos/sintetico-pessoa-b/?de=2016&ate=2019&categorias=eleicoes&acontecimento=sintetico-evento-05",
    );
    expect(volta.recorte).toEqual({ periodo: { de: 2016, ate: 2019 }, categorias: ["eleicoes"] });
  });

  it("ajusta o período à cobertura da pessoa para quem se volta", () => {
    // De 2000 a 2019, para quem é coberto desde 2010: o começo fica aberto.
    const volta = profileReturn("?de=2000&ate=2019", EVENTO, PERFIL_B);
    expect(volta.href).toBe("/politicos/sintetico-pessoa-b/?ate=2019&acontecimento=sintetico-evento-05");
    expect(volta.recorte?.periodo).toEqual({ de: null, ate: 2019 });
  });

  it("um recorte que não contém o acontecimento é descartado, e o acontecimento abre", () => {
    const esperado = "/politicos/sintetico-pessoa-b/?acontecimento=sintetico-evento-05";
    // Fora do período.
    expect(profileReturn("?de=2020&ate=2024", EVENTO, PERFIL_B)).toEqual({ href: esperado, recorte: null });
    // Fora da categoria.
    expect(profileReturn("?categorias=marcos-historicos", EVENTO, PERFIL_B)).toEqual({
      href: esperado,
      recorte: null,
    });
    // Período inteiro fora da cobertura da pessoa.
    expect(profileReturn("?de=1992&ate=2005", EVENTO, PERFIL_B)).toEqual({ href: esperado, recorte: null });
  });

  it("uma data parcial cabe no ano dela", () => {
    const soOAno = { slug: "sintetico-evento-04", data: { valor: "2012", precisao: "ano" as const }, categoria: "partidos-e-aliancas" as const };
    expect(profileReturn("?de=2012&ate=2012", soOAno, PERFIL_B).recorte?.periodo).toEqual({ de: 2012, ate: 2012 });
    expect(profileReturn("?de=2013&ate=2014", soOAno, PERFIL_B).recorte).toBeNull();
  });

  it("parâmetros que o atlas não conhece não entram no retorno", () => {
    const volta = profileReturn("?utm_source=rede&de=2016&ate=2019", EVENTO, PERFIL_B);
    expect(volta.href).toBe("/politicos/sintetico-pessoa-b/?de=2016&ate=2019&acontecimento=sintetico-evento-05");
  });
});

describe("retorno à comparação", () => {
  it("só existe para quem veio da comparação", () => {
    expect(comparisonReturn("", ESCALA)).toBeNull();
    expect(comparisonReturn("?de=2016&ate=2019", ESCALA)).toBeNull();
  });

  it("devolve o recorte de antes, ajustado à escala comum", () => {
    expect(comparisonReturn("?de=2016&ate=2019&categorias=eleicoes&origem=comparar", ESCALA)).toEqual({
      href: "/comparar/?de=2016&ate=2019&categorias=eleicoes",
      recorte: { periodo: { de: 2016, ate: 2019 }, categorias: ["eleicoes"] },
    });
    expect(comparisonReturn("?de=1950&ate=2019&origem=comparar", ESCALA)?.href).toBe("/comparar/?ate=2019");
  });

  it("sem recorte, volta à comparação inteira", () => {
    expect(comparisonReturn("?origem=comparar", ESCALA)).toEqual({ href: "/comparar/", recorte: null });
  });
});

describe("da exploração para a comparação, e de volta", () => {
  it("sem período, o recorte segue como está", () => {
    const soCategorias: Recorte = { periodo: { de: null, ate: null }, categorias: ["eleicoes"] };
    expect(carryToComparison(soCategorias, COBERTURA_B, ESCALA)).toEqual(soCategorias);
  });

  it("o lado aberto na exploração vira o limite da cobertura da pessoa", () => {
    // "Até 2015" de quem é coberto desde 2010 é 2010 a 2015, e não 1990 a 2015.
    expect(carryToComparison({ periodo: { de: null, ate: 2015 }, categorias: [] }, COBERTURA_B, ESCALA).periodo).toEqual({
      de: 2010,
      ate: 2015,
    });
    // Para quem é coberto desde o começo da escala, o lado continua aberto.
    expect(carryToComparison({ periodo: { de: null, ate: 2015 }, categorias: [] }, COBERTURA_A, ESCALA).periodo).toEqual({
      de: null,
      ate: 2015,
    });
    expect(carryToComparison({ periodo: { de: 2012, ate: null }, categorias: [] }, COBERTURA_B, ESCALA).periodo).toEqual({
      de: 2012,
      ate: null,
    });
  });

  it("da comparação para uma pessoa, o período se ajusta à cobertura dela", () => {
    const recorte: Recorte = { periodo: { de: 2000, ate: 2018 }, categorias: ["eleicoes"] };
    expect(carryFromComparison(recorte, COBERTURA_B)).toEqual({
      periodo: { de: null, ate: 2018 },
      categorias: ["eleicoes"],
    });
    expect(carryFromComparison({ periodo: { de: 1992, ate: 2005 }, categorias: [] }, COBERTURA_B).periodo).toEqual({
      de: null,
      ate: null,
    });
    expect(carryFromComparison(recorte, null)).toEqual(recorte);
  });
});

describe("o recorte por extenso", () => {
  it("diz o período e as categorias", () => {
    expect(describeRecorte(RECORTE, COBERTURA_A)).toBe("2016–2019 · marcos históricos");
    expect(describeRecorte({ periodo: { de: 2018, ate: 2018 }, categorias: [] }, COBERTURA_A)).toBe("2018");
    expect(describeRecorte({ periodo: { de: null, ate: null }, categorias: ["eleicoes", "marcos-historicos"] }, null)).toBe(
      "eleições, marcos históricos",
    );
  });

  it("o lado aberto recebe o limite da tela de destino", () => {
    expect(describeRecorte({ periodo: { de: null, ate: 2015 }, categorias: [] }, COBERTURA_B)).toBe("2010–2015");
    expect(describeRecorte({ periodo: { de: null, ate: 2015 }, categorias: [] }, null)).toBe("até 2015");
    expect(describeRecorte({ periodo: { de: 2016, ate: null }, categorias: [] }, null)).toBe("desde 2016");
  });

  it("sem recorte, não diz nada", () => {
    expect(describeRecorte(SEM_RECORTE, COBERTURA_A)).toBe("");
    expect(hasRecorte(SEM_RECORTE)).toBe(false);
    expect(hasRecorte(RECORTE)).toBe(true);
  });
});
