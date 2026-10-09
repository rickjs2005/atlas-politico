// Lista cronológica: o que a ordem não sustenta e onde ficam as lacunas.

import { describe, expect, it } from "vitest";

import { buildChronology, clipGaps, findUndeterminedOrder } from "@/features/events/chronology";
import type { DataHistorica } from "@/lib/domain/dates";
import { compareByDate } from "@/lib/domain/order";

const item = (id: string, valor: string, precisao: DataHistorica["precisao"]) => ({
  id,
  data: { valor, precisao },
});
const ordered = (...itens: ReturnType<typeof item>[]) => [...itens].sort(compareByDate);

describe("ordem que as datas não decidem", () => {
  it("datas em dias diferentes têm ordem conhecida", () => {
    const itens = ordered(item("a", "2018-01-24", "dia"), item("b", "2018-04-07", "dia"));
    expect(findUndeterminedOrder(itens).size).toBe(0);
  });

  it("um registro só com o ano fica em aberto diante de outro do mesmo ano", () => {
    const itens = ordered(item("ano", "1980", "ano"), item("dia", "1980-02-10", "dia"));
    // Na lista, o que só tem o ano vem primeiro por regra de ordenação.
    expect(itens.map(({ id }) => id)).toEqual(["ano", "dia"]);
    // Só o menos preciso é marcado: é a data dele que deixa a ordem em aberto.
    expect([...findUndeterminedOrder(itens)]).toEqual(["ano"]);
  });

  it("um registro só com o mês fica em aberto diante de um dia daquele mês", () => {
    const itens = ordered(item("mes", "1979-03", "mes"), item("dia", "1979-03-13", "dia"));
    expect([...findUndeterminedOrder(itens)]).toEqual(["mes"]);
  });

  it("dois registros do mesmo dia, ou só com o mesmo ano, ficam os dois em aberto", () => {
    const mesmoDia = [item("a", "2021-11-30", "dia"), item("b", "2021-11-30", "dia")];
    expect(findUndeterminedOrder(mesmoDia)).toEqual(new Set(["a", "b"]));
    const mesmoAno = [item("a", "2006", "ano"), item("b", "2006", "ano")];
    expect(findUndeterminedOrder(mesmoAno)).toEqual(new Set(["a", "b"]));
  });

  it("um ano sozinho na lista não tem com quem disputar a ordem", () => {
    const itens = ordered(item("a", "2006", "ano"), item("b", "2010", "ano"), item("c", "2014-10-05", "dia"));
    expect(findUndeterminedOrder(itens).size).toBe(0);
  });

  it("anos vizinhos não se cruzam", () => {
    const itens = [item("a", "1979", "ano"), item("b", "1980-01-01", "dia")];
    expect(findUndeterminedOrder(itens).size).toBe(0);
  });
});

describe("lacunas dentro do recorte", () => {
  const lacunas = [
    { de: 1981, ate: 1985 },
    { de: 2007, ate: 2015 },
  ];

  it("recorta cada lacuna ao período consultado", () => {
    expect(clipGaps(lacunas, { de: 1975, ate: 2026 })).toEqual(lacunas);
    expect(clipGaps(lacunas, { de: 2003, ate: 2010 })).toEqual([{ de: 2007, ate: 2010 }]);
    expect(clipGaps(lacunas, { de: 1983, ate: 2008 })).toEqual([
      { de: 1983, ate: 1985 },
      { de: 2007, ate: 2008 },
    ]);
  });

  it("lacuna fora do período não aparece", () => {
    expect(clipGaps(lacunas, { de: 2016, ate: 2020 })).toEqual([]);
  });
});

describe("linhas da lista", () => {
  const itens = ordered(
    item("a", "1980", "ano"),
    item("b", "1980-02-10", "dia"),
    item("c", "1986", "ano"),
    item("d", "2006-10-29", "dia"),
    item("e", "2016-03-18", "dia"),
  );
  const tipos = (linhas: ReturnType<typeof buildChronology>) =>
    linhas.map((linha) =>
      linha.tipo === "lacuna" ? `${linha.de}-${linha.ate}` : (linha.item as { id: string }).id,
    );

  it("sem lacunas, mantém a ordem recebida", () => {
    expect(tipos(buildChronology(itens))).toEqual(["a", "b", "c", "d", "e"]);
  });

  it("põe cada lacuna entre os registros que a cercam", () => {
    const linhas = buildChronology(itens, [
      { de: 2007, ate: 2015 },
      { de: 1981, ate: 1985 },
    ]);
    expect(tipos(linhas)).toEqual(["a", "b", "1981-1985", "c", "d", "2007-2015", "e"]);
  });

  it("lacuna antes do primeiro registro e depois do último também entra", () => {
    const linhas = buildChronology(itens.slice(2, 4), [
      { de: 1981, ate: 1985 },
      { de: 2007, ate: 2010 },
    ]);
    expect(tipos(linhas)).toEqual(["1981-1985", "c", "d", "2007-2010"]);
  });

  it("marca só os registros de ordem em aberto", () => {
    const marcados = buildChronology(itens).flatMap((linha) =>
      linha.tipo === "acontecimento" && linha.ordemEmAberto ? [linha.item.id] : [],
    );
    expect(marcados).toEqual(["a"]);
  });

  it("lista vazia não inventa linha", () => {
    expect(buildChronology([])).toEqual([]);
  });
});
