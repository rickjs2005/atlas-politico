// A comparação vista pelas regras: o mesmo recorte para as duas pessoas, pela
// mesma consulta da exploração, com o endereço como fonte do estado. Usa as
// fixtures sintéticas: a pessoa A é coberta desde 1990 e a B desde 2010.

import { describe, expect, it } from "vitest";

import { compareTrajectories, getSources, listSourcesOf } from "@/lib/data/queries";
import { getSharedSpan } from "@/lib/data/coverage";
import type { AtlasAction } from "@/lib/state/atlas-state";
import { selectComparison, selectVisibleEvents } from "@/lib/state/selectors";
import { searchFromState, stateAfter, stateFromSearch, type UrlContext } from "@/lib/state/url-state";

import { loadAtlasData, slugs } from "./helpers";

const data = loadAtlasData();
const PESSOA_A = "sintetico-pessoa-a";
const PESSOA_B = "sintetico-pessoa-b";
const evento = (numero: string) => `sintetico-evento-${numero}`;

const contexto: UrlContext = { pessoa: null, comparar: true, data, cobertura: getSharedSpan(data) };
const compare = (search: string) => stateFromSearch(search, contexto);
const trajetoria = (search: string, pessoaId: string) =>
  selectComparison(data, compare(search)).trajetorias.find((item) => item.pessoa.id === pessoaId)!;

describe("o estado da comparação vem do endereço", () => {
  it("a escala comum vai do começo da cobertura mais antiga ao ano da data de corte", () => {
    expect(contexto.cobertura).toEqual({ de: 1990, ate: 2026 });
  });

  it("sem parâmetros: todo o período, todas as categorias, as duas pessoas", () => {
    expect(compare("")).toEqual({
      pessoa: null,
      periodo: { de: null, ate: null },
      categorias: [],
      acontecimento: null,
      comparar: true,
    });
  });

  it("lê período e categorias pelo mesmo contrato da exploração", () => {
    const estado = compare("?de=2010&ate=2020&categorias=eleicoes,atuacao-institucional");
    expect(estado.periodo).toEqual({ de: 2010, ate: 2020 });
    expect(estado.categorias).toEqual(["eleicoes", "atuacao-institucional"]);
  });

  it("parâmetro inválido cai sozinho, e os outros valem", () => {
    const estado = compare("?de=abcd&ate=2012&categorias=inventada,eleicoes");
    expect(estado.periodo).toEqual({ de: null, ate: 2012 });
    expect(estado.categorias).toEqual(["eleicoes"]);
  });

  it("o período fica dentro da escala comum", () => {
    expect(compare("?de=1950&ate=2012").periodo).toEqual({ de: null, ate: 2012 });
    expect(compare("?de=1990&ate=2026").periodo).toEqual({ de: null, ate: null });
    expect(compare("?de=1950&ate=1960").periodo).toEqual({ de: null, ate: null });
    expect(compare("?de=2020&ate=2012").periodo).toEqual({ de: 2012, ate: 2020 });
  });

  it("um período que só uma das pessoas cobre continua valendo", () => {
    // De 1992 a 2005 a pessoa B está fora da cobertura: o recorte não é descartado por isso.
    expect(compare("?de=1992&ate=2005").periodo).toEqual({ de: 1992, ate: 2005 });
  });

  it("não há acontecimento aberto: o parâmetro sai do endereço", () => {
    const search = `?de=2010&acontecimento=${evento("03")}`;
    const estado = compare(search);
    expect(estado.acontecimento).toBeNull();
    expect(searchFromState(search, estado)).toBe("de=2010");
  });

  it("a forma canônica é a mesma da exploração, e aplicá-la de novo não muda nada", () => {
    const canonical = (search: string) => searchFromState(search, compare(search));
    expect(canonical("?categorias=eleicoes&ate=2012&de=2000")).toBe("de=2000&ate=2012&categorias=eleicoes");
    expect(canonical("?utm_source=rede&de=2000")).toBe("de=2000&utm_source=rede");
    for (const search of ["?de=1950&ate=2012&x=1", `?acontecimento=${evento("01")}`, "?categorias=inventada"]) {
      const uma = canonical(search);
      expect(canonical(`?${uma}`)).toBe(uma);
    }
  });
});

describe("ações na comparação", () => {
  const apply = (search: string, action: AtlasAction) =>
    searchFromState(search, stateAfter(search, action, contexto));

  it("período e categorias escrevem o endereço", () => {
    expect(apply("", { type: "setPeriod", de: 2010, ate: 2020 })).toBe("de=2010&ate=2020");
    expect(apply("?de=2010&ate=2020", { type: "toggleCategory", categoria: "eleicoes" })).toBe(
      "de=2010&ate=2020&categorias=eleicoes",
    );
    expect(apply("?categorias=eleicoes", { type: "toggleCategory", categoria: "eleicoes" })).toBe("");
  });

  it("escolher a escala inteira é o mesmo que nenhum período", () => {
    expect(apply("?de=2010", { type: "setPeriod", de: 1990, ate: 2026 })).toBe("");
  });

  it("limpar filtros volta ao recorte inicial", () => {
    expect(apply("?de=2010&ate=2020&categorias=eleicoes", { type: "clearFilters" })).toBe("");
  });

  it("nenhuma ação abre um acontecimento na comparação", () => {
    const estado = stateAfter("?de=2010", { type: "selectEvent", slug: evento("03") }, contexto);
    expect(estado.acontecimento).toBeNull();
    expect(estado.comparar).toBe(true);
    expect(estado.pessoa).toBeNull();
  });

  it("na exploração, a mesma função mantém a seleção", () => {
    const exploracao: UrlContext = { pessoa: PESSOA_A, data, cobertura: { de: 1990, ate: 2026 } };
    const estado = stateAfter("", { type: "selectEvent", slug: evento("02") }, exploracao);
    expect(estado.acontecimento).toBe(evento("02"));
    expect(estado.comparar).toBe(false);
  });
});

describe("as duas trajetórias no mesmo recorte", () => {
  it("o seletor da comparação usa a consulta da camada de dados, sem refazer o filtro", () => {
    const estado = compare("?de=2010&ate=2020&categorias=eleicoes,atuacao-institucional");
    expect(selectComparison(data, estado)).toEqual(
      compareTrajectories(data, { periodo: estado.periodo, categorias: estado.categorias }),
    );
  });

  it("o recorte não exclui nenhuma das pessoas", () => {
    expect(slugs(trajetoria("", PESSOA_A).acontecimentos)).toEqual(["01", "02", "03", "07"]);
    expect(slugs(trajetoria("", PESSOA_B).acontecimentos)).toEqual(["03", "04", "05", "06"]);
  });

  it("o mesmo período vale para as duas", () => {
    expect(slugs(trajetoria("?de=2010&ate=2020", PESSOA_A).acontecimentos)).toEqual(["03"]);
    expect(slugs(trajetoria("?de=2010&ate=2020", PESSOA_B).acontecimentos)).toEqual(["03", "04", "05"]);
  });

  it("as mesmas categorias valem para as duas", () => {
    expect(slugs(trajetoria("?categorias=eleicoes", PESSOA_A).acontecimentos)).toEqual(["01"]);
    expect(slugs(trajetoria("?categorias=eleicoes", PESSOA_B).acontecimentos)).toEqual(["05"]);
  });

  it("a união das trajetórias é o recorte visível do estado, sem repetição", () => {
    for (const search of ["", "?de=2010&ate=2020", "?categorias=atuacao-institucional", "?de=1995&ate=2000"]) {
      const estado = compare(search);
      const { trajetorias } = selectComparison(data, estado);
      const uniao = new Set(trajetorias.flatMap((item) => item.acontecimentos.map((evento) => evento.id)));
      expect([...uniao].sort()).toEqual(selectVisibleEvents(data, estado).map((item) => item.id).sort());
    }
  });

  it("o acontecimento das duas pessoas aparece nas duas trajetórias e é um registro só", () => {
    const { trajetorias, compartilhados } = selectComparison(data, compare(""));
    const [a, b] = [PESSOA_A, PESSOA_B].map(
      (id) => trajetorias.find((item) => item.pessoa.id === id)!.acontecimentos.find((item) => item.slug === evento("03"))!,
    );
    expect(a).toBe(b);
    expect(compartilhados).toEqual([evento("03")]);
    // No recorte visível ele conta uma vez.
    expect(selectVisibleEvents(data, compare("")).filter((item) => item.slug === evento("03"))).toHaveLength(1);
  });

  it("fora do recorte, o acontecimento compartilhado sai das duas ao mesmo tempo", () => {
    const { compartilhados } = selectComparison(data, compare("?de=2012&ate=2020"));
    expect(compartilhados).toEqual([]);
  });

  it("um recorte sem registros devolve listas vazias, e não erro", () => {
    const estado = compare("?de=1995&ate=2000");
    for (const item of selectComparison(data, estado).trajetorias) {
      expect(item.acontecimentos).toEqual([]);
    }
    expect(trajetoria("?de=1995&ate=2000", PESSOA_A).filiacoes.map((item) => item.registro.id)).toEqual([
      "sintetico-filiacao-a1",
    ]);
  });

  it("cargos e filiações seguem a regra de interseção do projeto, com o limite desconhecido dito", () => {
    // Mandato A1: de fevereiro de 2003 a 2006. Mandato B1: início desconhecido, até março de 2015.
    expect(trajetoria("?de=2010&ate=2020", PESSOA_A).mandatos).toEqual([]);
    const deB = trajetoria("?de=2010&ate=2020", PESSOA_B).mandatos.map((item) => [item.registro.id, item.situacao]);
    expect(deB).toEqual([
      ["sintetico-mandato-b1", "documentada"],
      ["sintetico-mandato-b2", "documentada"],
    ]);
    // Antes do fim conhecido, o início desconhecido impede a certeza.
    const antes = trajetoria("?de=1995&ate=2000", PESSOA_B).mandatos.map((item) => [item.registro.id, item.situacao]);
    expect(antes).toEqual([["sintetico-mandato-b1", "incerta"]]);
  });

  it("cada trajetória traz a cobertura declarada para a pessoa", () => {
    expect(trajetoria("", PESSOA_A).cobertura?.periodo.inicio).toEqual({ tipo: "data", valor: "1990", precisao: "ano" });
    expect(trajetoria("", PESSOA_B).cobertura?.periodo.inicio).toEqual({ tipo: "data", valor: "2010", precisao: "ano" });
  });
});

describe("fontes de um conjunto de registros", () => {
  const deA = trajetoria("", PESSOA_A);
  const registros = [
    ...deA.acontecimentos,
    ...deA.mandatos.map((item) => item.registro),
    ...deA.filiacoes.map((item) => item.registro),
  ];

  it("cada documento aparece uma vez, com a quantidade de registros que o citam", () => {
    const usos = listSourcesOf(data, registros).map((item) => [item.fonte.id, item.registros]);
    // Acontecimentos 01, 02 e 07, o mandato e a filiação citam o documento 01; o 03 cita o 02 e o 03.
    expect(usos).toEqual([
      ["sintetico-fonte-02", 1],
      ["sintetico-fonte-01", 5],
      ["sintetico-fonte-03", 1],
    ]);
  });

  it("a ordem é a da autoria, depois a do título", () => {
    const autorias = listSourcesOf(data, registros).map((item) => item.fonte.autoria);
    expect(autorias).toEqual([...autorias].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)));
  });

  it("um registro que cita o mesmo documento em dois trechos conta uma vez", () => {
    const [citacao] = deA.acontecimentos[0]!.fontes;
    const duasVezes = { fontes: [citacao!, { ...citacao!, localizacao: "Outro trecho" }] };
    expect(listSourcesOf(data, [duasVezes])).toEqual([
      { fonte: getSources(data, duasVezes)[0]!.fonte, registros: 1 },
    ]);
  });

  it("sem registros, não há fontes", () => {
    expect(listSourcesOf(data, [])).toEqual([]);
  });
});
