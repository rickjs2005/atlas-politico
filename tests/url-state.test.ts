// O estado da exploração visto a partir do endereço: restauração, forma
// canônica, troca de pessoa e regra do histórico. Tudo em funções puras; quem
// fala com o navegador é o provider, coberto pelos testes de tela.

import { describe, expect, it } from "vitest";

import type { AtlasAction } from "@/lib/state/atlas-state";
import { transition } from "@/lib/state/selectors";
import {
  COALESCE_WINDOW_MS,
  carryToPerson,
  chooseHistoryMode,
  historyGroupOf,
  sameSearch,
  searchFromState,
  stateFromSearch,
  type UrlContext,
} from "@/lib/state/url-state";

import { loadAtlasData } from "./helpers";

const data = loadAtlasData();
const PESSOA_A = "sintetico-pessoa-a";
const PESSOA_B = "sintetico-pessoa-b";

// A cobertura da pessoa A vai de 1990 até o ano da data de corte, 2026.
const contexto: UrlContext = { pessoa: PESSOA_A, data, cobertura: { de: 1990, ate: 2026 } };
const restore = (search: string) => stateFromSearch(search, contexto);
const evento = (numero: string) => `sintetico-evento-${numero}`;

describe("restauração a partir do endereço", () => {
  it("sem parâmetros, o estado é o inicial da pessoa da rota", () => {
    expect(restore("")).toEqual({
      pessoa: PESSOA_A,
      periodo: { de: null, ate: null },
      categorias: [],
      acontecimento: null,
      comparar: false,
    });
  });

  it("restaura período, categorias e acontecimento", () => {
    const estado = restore(`?de=2000&ate=2012&categorias=atuacao-institucional&acontecimento=${evento("03")}`);
    expect(estado.periodo).toEqual({ de: 2000, ate: 2012 });
    expect(estado.categorias).toEqual(["atuacao-institucional"]);
    expect(estado.acontecimento).toBe(evento("03"));
  });

  it("um ano só é um período com as duas pontas iguais", () => {
    expect(restore("?de=2011&ate=2011").periodo).toEqual({ de: 2011, ate: 2011 });
  });

  it("descarta o parâmetro inválido e mantém os outros", () => {
    const estado = restore("?de=abcd&ate=2012&categorias=inventada,eleicoes");
    expect(estado.periodo).toEqual({ de: null, ate: 2012 });
    expect(estado.categorias).toEqual(["eleicoes"]);
  });

  it("não abre acontecimento que não existe", () => {
    expect(restore("?acontecimento=nao-existe").acontecimento).toBeNull();
  });

  it("não abre acontecimento de outro perfil", () => {
    // O 05 é só da pessoa B.
    expect(restore(`?acontecimento=${evento("05")}`).acontecimento).toBeNull();
  });

  it("não abre acontecimento fora do recorte pedido, e mantém os filtros", () => {
    const estado = restore(`?de=2020&ate=2026&acontecimento=${evento("01")}`);
    expect(estado.periodo).toEqual({ de: 2020, ate: null });
    expect(estado.acontecimento).toBeNull();

    const porCategoria = restore(`?categorias=eleicoes&acontecimento=${evento("02")}`);
    expect(porCategoria.categorias).toEqual(["eleicoes"]);
    expect(porCategoria.acontecimento).toBeNull();
  });

  it("abre o acontecimento compartilhado nos dois perfis", () => {
    expect(restore(`?acontecimento=${evento("03")}`).acontecimento).toBe(evento("03"));
    const naOutra = stateFromSearch(`?acontecimento=${evento("03")}`, {
      pessoa: PESSOA_B,
      data,
      cobertura: { de: 2010, ate: 2026 },
    });
    expect(naOutra.acontecimento).toBe(evento("03"));
  });

  it("nunca abre rascunho, que não chega aos dados da interface", () => {
    expect(restore(`?acontecimento=${evento("08")}`).acontecimento).toBeNull();
  });
});

describe("período dentro da cobertura da edição", () => {
  it("um lado no limite da cobertura, ou além dele, fica aberto", () => {
    expect(restore("?de=1990&ate=2012").periodo).toEqual({ de: null, ate: 2012 });
    expect(restore("?de=1950&ate=2012").periodo).toEqual({ de: null, ate: 2012 });
    expect(restore("?de=2011&ate=2026").periodo).toEqual({ de: 2011, ate: null });
    expect(restore("?de=2011&ate=2090").periodo).toEqual({ de: 2011, ate: null });
  });

  it("a cobertura inteira é o mesmo que nenhum período", () => {
    expect(restore("?de=1990&ate=2026").periodo).toEqual({ de: null, ate: null });
  });

  it("um período inteiro fora da cobertura é descartado", () => {
    expect(restore("?de=1950&ate=1960").periodo).toEqual({ de: null, ate: null });
    expect(restore("?de=2050&ate=2060").periodo).toEqual({ de: null, ate: null });
  });

  it("lê o período informado ao contrário", () => {
    expect(restore("?de=2012&ate=2000").periodo).toEqual({ de: 2000, ate: 2012 });
  });

  it("sem cobertura conhecida, o período fica como veio", () => {
    const estado = stateFromSearch("?de=1950&ate=1960", { ...contexto, cobertura: null });
    expect(estado.periodo).toEqual({ de: 1950, ate: 1960 });
  });
});

describe("forma canônica do endereço", () => {
  const canonical = (search: string) => searchFromState(search, restore(search));

  it("o que o estado escreve, a leitura devolve igual", () => {
    const consultas = [
      "",
      "de=2000&ate=2012",
      "de=2011&ate=2011",
      "categorias=mandatos-e-funcoes,eleicoes",
      `de=2000&ate=2012&categorias=atuacao-institucional&acontecimento=${evento("03")}`,
    ];
    for (const consulta of consultas) expect(canonical(`?${consulta}`)).toBe(consulta);
  });

  it("reescreve o endereço fora de ordem, com parâmetro inválido ou fora da cobertura", () => {
    expect(canonical("?categorias=eleicoes&ate=2012&de=2000")).toBe("de=2000&ate=2012&categorias=eleicoes");
    expect(canonical("?acontecimento=nao-existe&de=abcd")).toBe("");
    expect(canonical("?de=1950&ate=2012")).toBe("ate=2012");
    expect(canonical("?de=2012&ate=2000")).toBe("de=2000&ate=2012");
  });

  it("aplicar duas vezes não muda nada", () => {
    for (const search of ["?de=1950&ate=2012&x=1", "?utm_source=a+b&categorias=eleicoes,inventada", "?acontecimento=nao-existe"]) {
      const uma = canonical(search);
      expect(canonical(`?${uma}`)).toBe(uma);
    }
  });

  it("mantém os parâmetros que o atlas não conhece, depois dos seus", () => {
    expect(canonical("?utm_source=rede&de=2000&utm_medium=post")).toBe(
      "de=2000&utm_source=rede&utm_medium=post",
    );
    expect(canonical("?utm_source=rede")).toBe("utm_source=rede");
  });

  it("compara endereços com e sem a interrogação", () => {
    expect(sameSearch("?de=2000", "de=2000")).toBe(true);
    expect(sameSearch("", "?")).toBe(true);
    expect(sameSearch("?de=2000", "?de=2001")).toBe(false);
  });
});

describe("ações sobre o estado restaurado", () => {
  const apply = (search: string, action: AtlasAction) =>
    searchFromState(search, transition(restore(search), action, data, contexto.cobertura));

  it("selecionar um acontecimento entra no endereço", () => {
    expect(apply("", { type: "selectEvent", slug: evento("02") })).toBe(`acontecimento=${evento("02")}`);
  });

  it("um filtro que esconde o acontecimento aberto desfaz a seleção", () => {
    const aberto = `?acontecimento=${evento("02")}`;
    expect(apply(aberto, { type: "toggleCategory", categoria: "eleicoes" })).toBe("categorias=eleicoes");
    expect(apply(aberto, { type: "setPeriod", de: 2010, ate: 2020 })).toBe("de=2010&ate=2020");
  });

  it("um filtro que mantém o acontecimento no recorte mantém a seleção", () => {
    const aberto = `?acontecimento=${evento("02")}`;
    expect(apply(aberto, { type: "setPeriod", de: 2003, ate: 2003 })).toBe(
      `de=2003&ate=2003&acontecimento=${evento("02")}`,
    );
  });

  it("o período escolhido é ajustado à cobertura", () => {
    expect(apply("", { type: "setPeriod", de: 1990, ate: 2026 })).toBe("");
    expect(apply("", { type: "setPeriod", de: 2026, ate: 2026 })).toBe("de=2026");
  });

  it("limpar filtros volta ao recorte inicial e mantém o acontecimento aberto", () => {
    const filtrado = `?de=2000&ate=2012&categorias=mandatos-e-funcoes&acontecimento=${evento("02")}`;
    expect(apply(filtrado, { type: "clearFilters" })).toBe(`acontecimento=${evento("02")}`);
  });

  it("uma ação sem efeito não muda o endereço", () => {
    expect(apply("?categorias=eleicoes", { type: "selectEvent", slug: null })).toBe("categorias=eleicoes");
    expect(apply("", { type: "clearFilters" })).toBe("");
  });
});

describe("troca de pessoa", () => {
  const alvo = { id: PESSOA_B, cobertura: { de: 2010, ate: 2026 } };
  const visiveis = (search: string) => {
    const estado = restore(search);
    const selecionado =
      data.conjunto.acontecimentos.find((item) => item.slug === estado.acontecimento) ?? null;
    return { estado, selecionado };
  };

  it("leva período e categorias", () => {
    const { estado, selecionado } = visiveis("?de=2011&ate=2018&categorias=eleicoes");
    expect(carryToPerson(estado, selecionado, alvo)).toEqual({
      periodo: { de: 2011, ate: 2018 },
      categorias: ["eleicoes"],
      acontecimento: null,
    });
  });

  it("ajusta o período à cobertura do outro perfil", () => {
    const { estado, selecionado } = visiveis("?de=2000&ate=2018");
    expect(carryToPerson(estado, selecionado, alvo).periodo).toEqual({ de: null, ate: 2018 });
  });

  it("descarta o período que o outro perfil não cobre", () => {
    const { estado, selecionado } = visiveis("?de=1992&ate=2005");
    expect(carryToPerson(estado, selecionado, alvo).periodo).toEqual({ de: null, ate: null });
  });

  it("não leva o acontecimento que é só de uma pessoa", () => {
    const { estado, selecionado } = visiveis(`?acontecimento=${evento("02")}`);
    expect(selecionado?.slug).toBe(evento("02"));
    expect(carryToPerson(estado, selecionado, alvo).acontecimento).toBeNull();
  });

  it("leva o acontecimento que é das duas", () => {
    const { estado, selecionado } = visiveis(`?acontecimento=${evento("03")}`);
    expect(carryToPerson(estado, selecionado, alvo).acontecimento).toBe(evento("03"));
  });
});

describe("histórico", () => {
  const periodo: AtlasAction = { type: "setPeriod", de: 2000, ate: 2010 };
  const categoria: AtlasAction = { type: "toggleCategory", categoria: "eleicoes" };
  const selecao: AtlasAction = { type: "selectEvent", slug: evento("01") };

  it("escolhas discretas criam entrada", () => {
    expect(chooseHistoryMode(selecao, null, 0)).toBe("push");
    expect(chooseHistoryMode(categoria, null, 0)).toBe("push");
    expect(chooseHistoryMode({ type: "clearFilters" }, null, 0)).toBe("push");
    // Mesmo logo depois de outra escolha.
    expect(chooseHistoryMode(selecao, { grupo: historyGroupOf(selecao), em: 0 }, 10)).toBe("push");
    expect(chooseHistoryMode(categoria, { grupo: historyGroupOf(categoria), em: 0 }, 10)).toBe("push");
  });

  it("o primeiro ajuste do período cria entrada", () => {
    expect(chooseHistoryMode(periodo, null, 0)).toBe("push");
    expect(chooseHistoryMode(periodo, { grupo: null, em: 0 }, 10)).toBe("push");
  });

  it("ajustes seguidos do período substituem a entrada", () => {
    expect(chooseHistoryMode(periodo, { grupo: "periodo", em: 0 }, 50)).toBe("replace");
    expect(chooseHistoryMode(periodo, { grupo: "periodo", em: 0 }, COALESCE_WINDOW_MS - 1)).toBe("replace");
  });

  it("depois da janela, o ajuste do período volta a criar entrada", () => {
    expect(chooseHistoryMode(periodo, { grupo: "periodo", em: 0 }, COALESCE_WINDOW_MS)).toBe("push");
  });

  it("percorrer dezenas de anos em sequência resulta em uma entrada", () => {
    let anterior: { grupo: string | null; em: number } | null = null;
    let entradas = 0;
    for (let passo = 0; passo < 40; passo += 1) {
      const agora = passo * 40; // repetição de tecla
      const acao: AtlasAction = { type: "setPeriod", de: 1990 + passo, ate: null };
      if (chooseHistoryMode(acao, anterior, agora) === "push") entradas += 1;
      anterior = { grupo: historyGroupOf(acao), em: agora };
    }
    expect(entradas).toBe(1);
  });

  it("restaurar a partir do endereço nunca cria entrada", () => {
    const acao: AtlasAction = { type: "restore", state: restore("") };
    expect(chooseHistoryMode(acao, null, 0)).toBe("replace");
  });
});
