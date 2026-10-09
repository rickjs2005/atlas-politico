import { describe, expect, it } from "vitest";

import {
  INITIAL_STATE,
  atlasReducer,
  fitPeriod,
  hasFilters,
  type AtlasState,
} from "@/lib/state/atlas-state";
import {
  reconcileSelection,
  selectSelectedEvent,
  selectVisibleEvents,
  settle,
  transition,
} from "@/lib/state/selectors";

import { loadAtlasData, slugs } from "./helpers";

const data = loadAtlasData();
const PESSOA_A = "sintetico-pessoa-a";
const PESSOA_B = "sintetico-pessoa-b";

const state = (mudancas: Partial<AtlasState> = {}): AtlasState => ({ ...INITIAL_STATE, ...mudancas });
const visible = (mudancas: Partial<AtlasState> = {}) =>
  slugs(selectVisibleEvents(data, state(mudancas)));

describe("recorte visível", () => {
  it("sem filtros, traz todos os revisados em ordem cronológica", () => {
    expect(visible()).toEqual(["01", "02", "03", "04", "05", "06", "07"]);
  });

  it("nunca traz rascunho, porque ele não chega aos dados da interface", () => {
    expect(visible()).not.toContain("08");
  });

  it("filtra pela pessoa em foco, incluindo acontecimentos compartilhados", () => {
    expect(visible({ pessoa: PESSOA_A })).toEqual(["01", "02", "03", "07"]);
    expect(visible({ pessoa: PESSOA_B })).toEqual(["03", "04", "05", "06"]);
  });

  it("na comparação entram as duas trajetórias", () => {
    expect(visible({ pessoa: PESSOA_A, comparar: true })).toHaveLength(7);
  });

  it("pessoa que não existe nos dados não mostra nada", () => {
    expect(visible({ pessoa: "pessoa-que-nao-existe" })).toEqual([]);
  });

  it("filtra por intervalo de anos, com as pontas inclusas", () => {
    expect(visible({ periodo: { de: 2011, ate: 2018 } })).toEqual(["03", "04", "05"]);
    expect(visible({ periodo: { de: 2012, ate: null } })).toEqual(["04", "05", "06", "07"]);
    expect(visible({ periodo: { de: null, ate: 2003 } })).toEqual(["01", "02"]);
  });

  it("um único ano inclui datas parciais daquele ano", () => {
    expect(visible({ periodo: { de: 2003, ate: 2003 } })).toEqual(["02"]);
    expect(visible({ periodo: { de: 2012, ate: 2012 } })).toEqual(["04"]);
  });

  it("filtra por categorias; lista vazia significa todas", () => {
    expect(visible({ categorias: ["eleicoes"] })).toEqual(["01", "05"]);
    expect(visible({ categorias: ["eleicoes", "marcos-historicos"] })).toEqual(["01", "05", "06"]);
  });

  it("combina pessoa, período e categoria", () => {
    expect(
      visible({ pessoa: PESSOA_B, periodo: { de: 2015, ate: 2025 }, categorias: ["eleicoes"] }),
    ).toEqual(["05"]);
  });
});

describe("reducer", () => {
  it("lê um período informado ao contrário", () => {
    const next = atlasReducer(state(), { type: "setPeriod", de: 2010, ate: 2003 });
    expect(next.periodo).toEqual({ de: 2003, ate: 2010 });
  });

  it("liga e desliga categorias", () => {
    const ligada = atlasReducer(state(), { type: "toggleCategory", categoria: "eleicoes" });
    expect(ligada.categorias).toEqual(["eleicoes"]);
    const desligada = atlasReducer(ligada, { type: "toggleCategory", categoria: "eleicoes" });
    expect(desligada.categorias).toEqual([]);
  });

  it("não altera o estado recebido", () => {
    const inicial = state();
    atlasReducer(inicial, { type: "toggleCategory", categoria: "eleicoes" });
    expect(inicial).toEqual(INITIAL_STATE);
  });

  it("limpar filtros desfaz período e categorias de uma vez, e só eles", () => {
    const filtrado = state({
      pessoa: PESSOA_A,
      periodo: { de: 2000, ate: 2010 },
      categorias: ["eleicoes", "marcos-historicos"],
      acontecimento: "sintetico-evento-02",
    });
    expect(atlasReducer(filtrado, { type: "clearFilters" })).toEqual(
      state({ pessoa: PESSOA_A, acontecimento: "sintetico-evento-02" }),
    );
  });

  it("sabe dizer se há filtro em vigor", () => {
    expect(hasFilters(state())).toBe(false);
    expect(hasFilters(state({ acontecimento: "sintetico-evento-02" }))).toBe(false);
    expect(hasFilters(state({ periodo: { de: null, ate: 2010 } }))).toBe(true);
    expect(hasFilters(state({ categorias: ["eleicoes"] }))).toBe(true);
  });
});

describe("período e cobertura da edição", () => {
  const cobertura = { de: 1990, ate: 2026 };

  it("mantém o período que está dentro da cobertura", () => {
    expect(fitPeriod({ de: 2000, ate: 2010 }, cobertura)).toEqual({ de: 2000, ate: 2010 });
    expect(fitPeriod({ de: 2011, ate: 2011 }, cobertura)).toEqual({ de: 2011, ate: 2011 });
  });

  it("um lado no limite, ou além dele, fica aberto", () => {
    expect(fitPeriod({ de: 1990, ate: 2010 }, cobertura)).toEqual({ de: null, ate: 2010 });
    expect(fitPeriod({ de: 1800, ate: 2010 }, cobertura)).toEqual({ de: null, ate: 2010 });
    expect(fitPeriod({ de: 2000, ate: 2026 }, cobertura)).toEqual({ de: 2000, ate: null });
    expect(fitPeriod({ de: 2000, ate: 2100 }, cobertura)).toEqual({ de: 2000, ate: null });
  });

  it("um ano só na ponta da cobertura continua sendo aquele ano", () => {
    // 2026 a 2026: o lado de cima fica aberto, e "desde 2026" é o mesmo recorte.
    expect(fitPeriod({ de: 2026, ate: 2026 }, cobertura)).toEqual({ de: 2026, ate: null });
    expect(fitPeriod({ de: 1990, ate: 1990 }, cobertura)).toEqual({ de: null, ate: 1990 });
  });

  it("período inteiro fora da cobertura é descartado", () => {
    expect(fitPeriod({ de: 1950, ate: 1989 }, cobertura)).toEqual({ de: null, ate: null });
    expect(fitPeriod({ de: 2027, ate: null }, cobertura)).toEqual({ de: null, ate: null });
    expect(fitPeriod({ de: null, ate: 1989 }, cobertura)).toEqual({ de: null, ate: null });
  });

  it("lê o período ao contrário antes de ajustar", () => {
    expect(fitPeriod({ de: 2010, ate: 2000 }, cobertura)).toEqual({ de: 2000, ate: 2010 });
  });

  it("settle ajusta o período e, depois, a seleção", () => {
    // O 01 é de 1994. Um período que começa antes da cobertura abre aquele lado
    // e mantém o acontecimento; um período que não o contém o fecha.
    const aberto = state({
      pessoa: PESSOA_A,
      periodo: { de: 1950, ate: 2000 },
      acontecimento: "sintetico-evento-01",
    });
    expect(settle(aberto, data, cobertura)).toEqual({ ...aberto, periodo: { de: null, ate: 2000 } });

    const fora = state({
      pessoa: PESSOA_A,
      periodo: { de: 2000, ate: 2100 },
      acontecimento: "sintetico-evento-01",
    });
    expect(settle(fora, data, cobertura)).toEqual({
      ...fora,
      periodo: { de: 2000, ate: null },
      acontecimento: null,
    });
  });

  it("settle devolve o mesmo objeto quando não há o que ajustar", () => {
    const coerente = state({ pessoa: PESSOA_A, periodo: { de: 2000, ate: 2010 } });
    expect(settle(coerente, data, cobertura)).toBe(coerente);
    expect(settle(coerente, data)).toBe(coerente);
  });

  it("a transição aplica a cobertura quando ela é informada", () => {
    const acao = { type: "setPeriod", de: 1990, ate: 2026 } as const;
    expect(transition(state(), acao, data, cobertura).periodo).toEqual({ de: null, ate: null });
    expect(transition(state(), acao, data).periodo).toEqual({ de: 1990, ate: 2026 });
  });
});

describe("seleção coerente com o recorte", () => {
  const select = (slug: string) => ({ type: "selectEvent", slug }) as const;

  it("devolve o acontecimento selecionado", () => {
    const next = transition(state(), select("sintetico-evento-04"), data);
    const selecionado = selectSelectedEvent(selectVisibleEvents(data, next), next);
    expect(selecionado?.id).toBe("sintetico-evento-04");
  });

  it("desfaz a seleção quando um filtro esconde o acontecimento", () => {
    const selecionado = transition(state(), select("sintetico-evento-05"), data);
    const filtrado = transition(selecionado, { type: "selectPerson", slug: PESSOA_A }, data);
    expect(filtrado.acontecimento).toBeNull();
  });

  it("mantém a seleção quando o acontecimento continua no recorte", () => {
    const selecionado = transition(state(), select("sintetico-evento-03"), data);
    const filtrado = transition(selecionado, { type: "selectPerson", slug: PESSOA_A }, data);
    expect(filtrado.acontecimento).toBe("sintetico-evento-03");
  });

  it("ignora seleção de slug que não existe", () => {
    expect(transition(state(), select("slug-que-nao-existe"), data).acontecimento).toBeNull();
  });

  it("ao restaurar um estado, descarta a seleção fora do recorte", () => {
    const restaurado = transition(
      state(),
      {
        type: "restore",
        state: state({ periodo: { de: 2020, ate: 2026 }, acontecimento: "sintetico-evento-01" }),
      },
      data,
    );
    expect(restaurado.periodo).toEqual({ de: 2020, ate: 2026 });
    expect(restaurado.acontecimento).toBeNull();
  });

  it("reconcileSelection não mexe em estado já coerente", () => {
    const coerente = state({ acontecimento: "sintetico-evento-01" });
    expect(reconcileSelection(coerente, selectVisibleEvents(data, coerente))).toBe(coerente);
  });
});
