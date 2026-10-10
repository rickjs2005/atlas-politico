import { afterEach, describe, expect, it } from "vitest";

import {
  analyzeDate,
  calcInterval,
  compareDates,
  describePrecision,
  findPeriodProblem,
  formatDate,
  formatDateParts,
  formatPeriod,
  formatPeriodYears,
  formatYearRange,
  intervalsOverlap,
  yearRangeInterval,
  type DataHistorica,
  type Periodo,
} from "@/lib/domain/dates";

const data = (valor: string, precisao: DataHistorica["precisao"]): DataHistorica => ({
  valor,
  precisao,
});
const limite = (valor: string, precisao: DataHistorica["precisao"]) =>
  ({ tipo: "data", valor, precisao }) as const;

describe("precisão das datas", () => {
  it("aceita ano, mês e dia quando o formato combina com a precisão", () => {
    expect(analyzeDate(data("1989", "ano"))).toEqual({ ok: true, ano: 1989, mes: null, dia: null });
    expect(analyzeDate(data("1989-11", "mes"))).toEqual({ ok: true, ano: 1989, mes: 11, dia: null });
    expect(analyzeDate(data("1989-11-15", "dia"))).toEqual({ ok: true, ano: 1989, mes: 11, dia: 15 });
  });

  it.each([
    ["1989-11-15", "mes"],
    ["1989-11-15", "ano"],
    ["1989-11", "dia"],
    ["1989", "mes"],
  ] as const)("recusa %s declarada com precisão %s", (valor, precisao) => {
    expect(analyzeDate(data(valor, precisao)).ok).toBe(false);
  });

  it.each(["15/11/1989", "1989-1-5", "89", "1989-11-15T00:00:00Z", ""])(
    "recusa o formato %j",
    (valor) => {
      expect(analyzeDate(data(valor, "dia")).ok).toBe(false);
    },
  );
});

describe("datas impossíveis", () => {
  it.each([
    ["2023-02-29", "dia"],
    ["1900-02-29", "dia"],
    ["2021-04-31", "dia"],
    ["2021-06-00", "dia"],
    ["2021-13", "mes"],
    ["2021-00", "mes"],
    ["0203", "ano"],
    ["3024", "ano"],
  ] as const)("recusa %s", (valor, precisao) => {
    expect(analyzeDate(data(valor, precisao)).ok).toBe(false);
  });

  it("aceita 29 de fevereiro só em ano bissexto", () => {
    expect(analyzeDate(data("2024-02-29", "dia")).ok).toBe(true);
    expect(analyzeDate(data("2000-02-29", "dia")).ok).toBe(true);
  });

  it("explica o motivo da recusa", () => {
    const analise = analyzeDate(data("2023-02-29", "dia"));
    expect(analise).toMatchObject({ ok: false });
    expect(!analise.ok && analise.motivo).toContain("fevereiro de 2023");
  });
});

describe("intervalo de cálculo", () => {
  it("cobre o ano inteiro, o mês inteiro ou o dia exato", () => {
    const ano = calcInterval(data("2023", "ano"));
    const mes = calcInterval(data("2023-02", "mes"));
    const dia = calcInterval(data("2023-02-10", "dia"));

    expect(ano.fim - ano.inicio).toBe(364);
    expect(mes.fim - mes.inicio).toBe(27);
    expect(dia.fim).toBe(dia.inicio);
    expect(mes.inicio - ano.inicio).toBe(31);
  });

  it("respeita ano bissexto", () => {
    const ano = calcInterval(data("2024", "ano"));
    expect(ano.fim - ano.inicio).toBe(365);
  });

  it("devolve números, e não datas que possam ir para a tela", () => {
    const intervalo = calcInterval(data("1994", "ano"));
    expect(typeof intervalo.inicio).toBe("number");
    expect(typeof intervalo.fim).toBe("number");
  });

  it("recusa calcular sobre data inválida", () => {
    expect(() => calcInterval(data("2023-02-29", "dia"))).toThrow(RangeError);
  });

  it("decide se uma data parcial cai em um recorte de anos", () => {
    const marco2003 = calcInterval(data("2003-03", "mes"));
    expect(intervalsOverlap(marco2003, yearRangeInterval(2003, 2003))).toBe(true);
    expect(intervalsOverlap(marco2003, yearRangeInterval(2004, 2010))).toBe(false);
    expect(intervalsOverlap(calcInterval(data("2012", "ano")), yearRangeInterval(2012, 2012))).toBe(true);
  });
});

describe("apresentação", () => {
  it("mostra só a precisão conhecida", () => {
    expect(formatDate(data("1994", "ano"))).toBe("1994");
    expect(formatDate(data("2003-03", "mes"))).toBe("março de 2003");
    expect(formatDate(data("2011-06-15", "dia"))).toBe("15 de junho de 2011");
  });

  it("não cria dia nem mês para data parcial", () => {
    expect(formatDate(data("2003-03", "mes"))).not.toMatch(/\d{1,2} de março/);
    expect(formatDate(data("1994", "ano"))).not.toContain("janeiro");
  });

  it("escreve o primeiro dia do mês como 1º", () => {
    expect(formatDate(data("2024-03-01", "dia"))).toBe("1º de março de 2024");
  });

  it("separa o ano do complemento, sem completar o que a data não informa", () => {
    expect(formatDateParts(data("1994", "ano"))).toEqual({ ano: "1994", complemento: null });
    expect(formatDateParts(data("2003-03", "mes"))).toEqual({ ano: "2003", complemento: "mar" });
    expect(formatDateParts(data("2011-06-15", "dia"))).toEqual({ ano: "2011", complemento: "15 jun" });
    expect(formatDateParts(data("2024-03-01", "dia"))).toEqual({ ano: "2024", complemento: "1º mar" });
  });

  it("avisa quando a data é parcial, e não diz nada quando o dia é conhecido", () => {
    expect(describePrecision(data("1994", "ano"))).toBe("Só o ano está documentado.");
    expect(describePrecision(data("2003-03", "mes"))).toBe("O dia não está documentado.");
    expect(describePrecision(data("2011-06-15", "dia"))).toBeNull();
  });
});

describe("datas civis e fuso horário", () => {
  // Uma data do conteúdo é um dia do calendário, e não um instante: o fuso da
  // máquina que gera o site, ou do navegador de quem lê, não pode mudá-la.
  const FUSOS = [
    { nome: "Pacific/Kiritimati", minutos: -840 }, // UTC+14
    { nome: "America/Sao_Paulo", minutos: 180 },
    { nome: "Pacific/Pago_Pago", minutos: 660 }, // UTC-11
  ];
  const datas = [data("2018-04-07", "dia"), data("2023-01-01", "dia"), data("2026-10-04", "dia"), data("1979-03", "mes"), data("1975", "ano")];
  const original = process.env.TZ;

  afterEach(() => {
    if (original === undefined) delete process.env.TZ;
    else process.env.TZ = original;
  });

  it("o texto e o intervalo de cálculo são os mesmos em qualquer fuso", () => {
    const vistos = FUSOS.map(({ nome, minutos }) => {
      process.env.TZ = nome;
      // Confirma que a troca de fuso valeu, para o teste não passar por engano.
      expect(new Date(2020, 0, 1).getTimezoneOffset(), nome).toBe(minutos);
      return datas.map((item) => ({ texto: formatDate(item), intervalo: calcInterval(item) }));
    });

    expect(vistos[0]!.map((item) => item.texto)).toEqual([
      "7 de abril de 2018",
      "1º de janeiro de 2023",
      "4 de outubro de 2026",
      "março de 1979",
      "1975",
    ]);
    for (const outro of vistos.slice(1)) expect(outro).toEqual(vistos[0]);
  });

  it("o dia do recorte de anos não escorrega para o ano vizinho", () => {
    for (const { nome } of FUSOS) {
      process.env.TZ = nome;
      const reveillon = calcInterval(data("2022-12-31", "dia"));
      const anoNovo = calcInterval(data("2023-01-01", "dia"));
      expect(intervalsOverlap(reveillon, yearRangeInterval(2022, 2022)), nome).toBe(true);
      expect(intervalsOverlap(reveillon, yearRangeInterval(2023, 2023)), nome).toBe(false);
      expect(intervalsOverlap(anoNovo, yearRangeInterval(2023, 2023)), nome).toBe(true);
      expect(intervalsOverlap(anoNovo, yearRangeInterval(2022, 2022)), nome).toBe(false);
    }
  });
});

describe("apresentação de períodos", () => {
  const desconhecida = { tipo: "desconhecida" } as const;
  const emCurso = { tipo: "em-curso" } as const;

  it("escreve cada limite na precisão conhecida", () => {
    expect(formatPeriod({ inicio: limite("2003-02-01", "dia"), fim: limite("2006", "ano") })).toBe(
      "1º de fevereiro de 2003 a 2006",
    );
    expect(formatPeriod({ inicio: limite("2019", "ano"), fim: emCurso })).toBe("desde 2019");
    expect(formatPeriod({ inicio: limite("2010", "ano"), fim: limite("2010", "ano") })).toBe("2010");
  });

  it("diz qual limite não está documentado, em vez de inventar um", () => {
    expect(formatPeriod({ inicio: desconhecida, fim: limite("2015-03", "mes") })).toBe(
      "até março de 2015; início não documentado",
    );
    expect(formatPeriod({ inicio: limite("1975", "ano"), fim: desconhecida })).toBe(
      "a partir de 1975; fim não documentado",
    );
    expect(formatPeriod({ inicio: desconhecida, fim: desconhecida })).toBe("período não documentado");
    expect(formatPeriod({ inicio: desconhecida, fim: emCurso })).toBe("em curso; início não documentado");
  });

  it("resume o período em anos para espaços estreitos", () => {
    expect(formatPeriodYears({ inicio: limite("2003-02-01", "dia"), fim: limite("2006", "ano") })).toBe(
      "2003–2006",
    );
    expect(formatPeriodYears({ inicio: limite("2019", "ano"), fim: emCurso })).toBe("desde 2019");
    expect(formatPeriodYears({ inicio: desconhecida, fim: limite("2015-03", "mes") })).toBe("?–2015");
    expect(formatPeriodYears({ inicio: limite("1975", "ano"), fim: desconhecida })).toBe("1975–?");
    expect(formatPeriodYears({ inicio: desconhecida, fim: desconhecida })).toBe("sem datas");
  });
});

describe("ordem cronológica", () => {
  it("ordena datas de precisões diferentes", () => {
    const datas = [data("2011-06-15", "dia"), data("1994", "ano"), data("2003-03", "mes")];
    expect(datas.sort(compareDates).map((item) => item.valor)).toEqual([
      "1994",
      "2003-03",
      "2011-06-15",
    ]);
  });

  it("no empate de início, a data mais precisa vem primeiro", () => {
    const datas = [data("2003", "ano"), data("2003-01", "mes"), data("2003-01-01", "dia")];
    expect(datas.sort(compareDates).map((item) => item.precisao)).toEqual(["dia", "mes", "ano"]);
  });
});

describe("períodos", () => {
  it("recusa início posterior ao fim", () => {
    const periodo: Periodo = { inicio: limite("2010", "ano"), fim: limite("2003", "ano") };
    expect(findPeriodProblem(periodo)).toContain("Período incoerente");
  });

  it("recusa quando nenhuma leitura das datas parciais é coerente", () => {
    const periodo: Periodo = { inicio: limite("2003-07", "mes"), fim: limite("2003-06", "mes") };
    expect(findPeriodProblem(periodo)).not.toBeNull();
  });

  it("aceita datas parciais que admitem uma leitura coerente", () => {
    expect(
      findPeriodProblem({ inicio: limite("2003", "ano"), fim: limite("2003-06", "mes") }),
    ).toBeNull();
    expect(
      findPeriodProblem({ inicio: limite("2003-06-15", "dia"), fim: limite("2003-06", "mes") }),
    ).toBeNull();
    expect(
      findPeriodProblem({ inicio: limite("2003-01-01", "dia"), fim: limite("2003-01-01", "dia") }),
    ).toBeNull();
  });

  it("não compara limites desconhecidos nem em curso", () => {
    expect(
      findPeriodProblem({ inicio: { tipo: "desconhecida" }, fim: limite("2015-03", "mes") }),
    ).toBeNull();
    expect(
      findPeriodProblem({ inicio: limite("2019", "ano"), fim: { tipo: "em-curso" } }),
    ).toBeNull();
  });
});

describe("recorte de anos por extenso", () => {
  it("um ano só é escrito uma vez", () => {
    expect(formatYearRange(2018, 2018)).toBe("2018");
  });

  it("um intervalo vai do menor ao maior", () => {
    expect(formatYearRange(2003, 2010)).toBe("2003–2010");
    expect(formatYearRange(2010, 2003)).toBe("2003–2010");
  });
});
