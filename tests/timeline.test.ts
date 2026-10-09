// Geometria da linha do tempo: posição das datas e dos períodos sobre o eixo,
// e distribuição em fileiras. O desenho mostra o que a data sustenta.

import { describe, expect, it } from "vitest";

import {
  barOfPeriod,
  packRows,
  placeMarks,
  positionOfYear,
  spanOfDate,
  spanOfYears,
  yearLabels,
  type TimeDomain,
} from "@/components/time/scale";
import type { DataHistorica, Periodo } from "@/lib/domain/dates";

const eixo: TimeDomain = { de: 2000, ate: 2009 };
const CORTE = "2026-10-08";

const data = (valor: string, precisao: DataHistorica["precisao"]): DataHistorica => ({ valor, precisao });
const limite = (valor: string, precisao: DataHistorica["precisao"]) =>
  ({ tipo: "data", valor, precisao }) as const;

describe("datas sobre o eixo", () => {
  it("o eixo inteiro vai de 0 a 1, com o último ano incluso", () => {
    expect(spanOfYears(eixo, 2000, 2009)).toEqual({ inicio: 0, largura: 1 });
    expect(positionOfYear(eixo, 2000)).toBe(0);
    expect(positionOfYear(eixo, 2005)).toBeCloseTo(0.5, 2);
  });

  it("a data ocupa o trecho que a precisão sustenta: o ano, o mês ou o dia", () => {
    const ano = spanOfDate(eixo, data("2004", "ano"));
    const mes = spanOfDate(eixo, data("2004-06", "mes"));
    const dia = spanOfDate(eixo, data("2004-06-15", "dia"));

    expect(ano.largura).toBeCloseTo(0.1, 2);
    expect(mes.largura).toBeCloseTo(0.1 / 12, 2);
    expect(dia.largura).toBeLessThan(mes.largura);
    // O dia está dentro do mês, e o mês dentro do ano.
    expect(mes.inicio).toBeGreaterThanOrEqual(ano.inicio);
    expect(dia.inicio).toBeGreaterThanOrEqual(mes.inicio);
    expect(dia.inicio + dia.largura).toBeLessThanOrEqual(mes.inicio + mes.largura);
  });

  it("o que cai fora do eixo fica preso às pontas, sem largura negativa", () => {
    expect(spanOfDate(eixo, data("1990", "ano"))).toEqual({ inicio: 0, largura: 0 });
    expect(spanOfDate(eixo, data("2030", "ano"))).toEqual({ inicio: 1, largura: 0 });
    expect(spanOfYears(eixo, 1995, 2004)).toEqual({ inicio: 0, largura: expect.closeTo(0.5, 2) });
  });
});

describe("rótulos de ano", () => {
  it("escolhe o passo que cabe no espaço e põe os rótulos em anos redondos", () => {
    expect(yearLabels({ de: 1975, ate: 2026 }, 12)).toEqual([
      1975, 1980, 1985, 1990, 1995, 2000, 2005, 2010, 2015, 2020, 2025,
    ]);
    expect(yearLabels({ de: 1975, ate: 2026 }, 6)).toEqual([1980, 1990, 2000, 2010, 2020]);
    expect(yearLabels({ de: 2019, ate: 2022 }, 12)).toEqual([2019, 2020, 2021, 2022]);
  });
});

describe("barras de período", () => {
  const periodo = (inicio: Periodo["inicio"], fim: Periodo["fim"]): Periodo => ({ inicio, fim });

  it("período com os dois limites vai do começo do início ao fim do fim", () => {
    const barra = barOfPeriod(eixo, periodo(limite("2002", "ano"), limite("2005", "ano")), CORTE);
    expect(barra?.aberto).toBeNull();
    expect(barra?.inicio).toBeCloseTo(0.2, 2);
    expect(barra?.largura).toBeCloseTo(0.4, 2);
  });

  it("em curso vale até a data de corte, e o eixo corta o que passa dele", () => {
    const barra = barOfPeriod(eixo, periodo(limite("2008", "ano"), { tipo: "em-curso" }), CORTE);
    expect(barra?.aberto).toBeNull();
    expect(barra!.inicio + barra!.largura).toBeCloseTo(1, 6);
  });

  it("limite desconhecido vira um trecho curto, com o lado em aberto indicado", () => {
    const semFim = barOfPeriod(eixo, periodo(limite("2003", "ano"), { tipo: "desconhecida" }), CORTE);
    expect(semFim?.aberto).toBe("fim");
    expect(semFim?.inicio).toBeCloseTo(0.3, 2);
    expect(semFim!.largura).toBeLessThan(0.2);

    const semInicio = barOfPeriod(eixo, periodo({ tipo: "desconhecida" }, limite("2006-03", "mes")), CORTE);
    expect(semInicio?.aberto).toBe("inicio");
    expect(semInicio!.inicio + semInicio!.largura).toBeCloseTo(0.625, 2);
  });

  it("sem nenhuma data não há barra para desenhar", () => {
    expect(barOfPeriod(eixo, periodo({ tipo: "desconhecida" }, { tipo: "desconhecida" }), CORTE)).toBeNull();
  });
});

describe("fileiras", () => {
  it("trechos que não se tocam ficam na mesma fileira", () => {
    expect(
      packRows([
        { inicio: 0, largura: 0.2 },
        { inicio: 0.3, largura: 0.2 },
        { inicio: 0.6, largura: 0.2 },
      ]),
    ).toEqual([0, 0, 0]);
  });

  it("trechos sobrepostos sobem de fileira, e a fileira de baixo volta a ser usada", () => {
    expect(
      packRows([
        { inicio: 0, largura: 0.5 },
        { inicio: 0.2, largura: 0.5 },
        { inicio: 0.4, largura: 0.1 },
        { inicio: 0.6, largura: 0.1 },
      ]),
    ).toEqual([0, 1, 2, 0]);
  });

  it("a folga separa vizinhos que encostam, e a ordem de entrada é preservada", () => {
    const encostados = [
      { inicio: 0.5, largura: 0.1 },
      { inicio: 0, largura: 0.5 },
    ];
    expect(packRows(encostados)).toEqual([0, 0]);
    expect(packRows(encostados, 0.01)).toEqual([1, 0]);
  });

  it("lista vazia não gera fileira", () => {
    expect(packRows([])).toEqual([]);
    expect(placeMarks(eixo, [], 0.03)).toEqual({ marcas: [], fileiras: 0 });
  });
});

describe("marcas de acontecimentos", () => {
  const itens = [
    { id: "a", data: data("2001", "ano") },
    { id: "b", data: data("2001-09-10", "dia") },
    { id: "c", data: data("2008-03", "mes") },
  ];

  it("a marca fica no centro do trecho que a data ocupa", () => {
    const { marcas } = placeMarks(eixo, itens, 0.03);
    const ano = marcas[0]!;
    expect(ano.centro).toBeCloseTo(ano.span.inicio + ano.span.largura / 2, 6);
    expect(ano.centro).toBeCloseTo(0.15, 2);
  });

  it("marcas próximas sobem de fileira; as distantes ficam na base", () => {
    const { marcas, fileiras } = placeMarks(eixo, itens, 0.03);
    expect(marcas.map((marca) => marca.fileira)).toEqual([0, 1, 0]);
    expect(fileiras).toBe(2);
  });

  it("as fileiras dependem só das datas, e não de quem está visível", () => {
    const todos = placeMarks(eixo, itens, 0.03).marcas.map((marca) => [marca.item.id, marca.fileira]);
    const deNovo = placeMarks(eixo, [...itens], 0.03).marcas.map((marca) => [marca.item.id, marca.fileira]);
    expect(deNovo).toEqual(todos);
  });
});
