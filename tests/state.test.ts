import { describe, expect, it } from "vitest";

import { INITIAL_STATE, atlasReducer, type AtlasState } from "@/lib/state/atlas-state";
import {
  reconcileSelection,
  selectSelectedEvent,
  selectVisibleEvents,
  transition,
} from "@/lib/state/selectors";

import { loadExplorerData, slugs } from "./helpers";

const data = loadExplorerData();
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
