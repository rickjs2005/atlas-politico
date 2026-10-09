// Regras de datas do atlas. Módulo puro: sem I/O, sem React e sem Zod, para
// poder rodar no build, nos testes e no navegador.
//
// Duas ideias sustentam tudo aqui:
//   1. Uma data histórica guarda a precisão que a fonte sustenta (ano, mês ou
//      dia). Nada aqui "completa" uma data parcial.
//   2. Ordenar e filtrar exige números. O intervalo de cálculo existe só para
//      isso e é um tipo próprio (DiaOrdinal), que o formatador de apresentação
//      não aceita. Assim um "1º de janeiro" de cálculo não chega à tela.

export const PRECISOES = ["ano", "mes", "dia"] as const;
export type Precisao = (typeof PRECISOES)[number];

export interface DataHistorica {
  /** `AAAA`, `AAAA-MM` ou `AAAA-MM-DD`, conforme a precisão. */
  valor: string;
  precisao: Precisao;
}

/** Dias desde 1970-01-01 (UTC). Só para cálculo; nunca é exibido. */
export type DiaOrdinal = number & { readonly __brand: "DiaOrdinal" };

export interface IntervaloDeCalculo {
  inicio: DiaOrdinal;
  fim: DiaOrdinal;
}

export type LimiteDeData = DataHistorica & { tipo: "data" };
export type LimiteDesconhecido = { tipo: "desconhecida" };
export type LimiteEmCurso = { tipo: "em-curso" };

export interface Periodo {
  inicio: LimiteDeData | LimiteDesconhecido;
  /** `em-curso`: vigente na data de corte da edição. */
  fim: LimiteDeData | LimiteDesconhecido | LimiteEmCurso;
}

export type DateAnalysis =
  | { ok: true; ano: number; mes: number | null; dia: number | null }
  | { ok: false; motivo: string };

/** Faixa de anos aceita. Pega erros de digitação como `0203` ou `20033`. */
export const YEAR_BOUNDS = { min: 1800, max: 2100 } as const;

const MS_POR_DIA = 86_400_000;

const FORMATOS: Record<Precisao, { regex: RegExp; exemplo: string }> = {
  ano: { regex: /^(\d{4})$/, exemplo: "AAAA" },
  mes: { regex: /^(\d{4})-(\d{2})$/, exemplo: "AAAA-MM" },
  dia: { regex: /^(\d{4})-(\d{2})-(\d{2})$/, exemplo: "AAAA-MM-DD" },
};

const MESES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
] as const;

function isLeapYear(ano: number): boolean {
  return (ano % 4 === 0 && ano % 100 !== 0) || ano % 400 === 0;
}

export function daysInMonth(ano: number, mes: number): number {
  if (mes === 2) return isLeapYear(ano) ? 29 : 28;
  return [4, 6, 9, 11].includes(mes) ? 30 : 31;
}

/**
 * Confere se `valor` tem o formato da precisão declarada e se é uma data que
 * existe no calendário. Formato e precisão precisam concordar: `1989-11-15`
 * declarado como `mes` é erro, porque o dia estaria afirmando algo que a
 * precisão diz não ser conhecido.
 */
export function analyzeDate(data: DataHistorica): DateAnalysis {
  const formato = FORMATOS[data.precisao];
  const partes = formato.regex.exec(data.valor);
  if (!partes) {
    return {
      ok: false,
      motivo: `Data "${data.valor}" não segue o formato ${formato.exemplo} exigido pela precisão "${data.precisao}".`,
    };
  }

  const ano = Number(partes[1]);
  const mes = partes[2] === undefined ? null : Number(partes[2]);
  const dia = partes[3] === undefined ? null : Number(partes[3]);

  if (ano < YEAR_BOUNDS.min || ano > YEAR_BOUNDS.max) {
    return {
      ok: false,
      motivo: `Ano ${ano} fora do intervalo aceito (${YEAR_BOUNDS.min}–${YEAR_BOUNDS.max}).`,
    };
  }
  if (mes !== null && (mes < 1 || mes > 12)) {
    return { ok: false, motivo: `Mês ${partes[2]} não existe.` };
  }
  if (mes !== null && dia !== null) {
    const limite = daysInMonth(ano, mes);
    if (dia < 1 || dia > limite) {
      return {
        ok: false,
        motivo: `Dia ${partes[3]} não existe em ${MESES[mes - 1]} de ${ano} (o mês tem ${limite} dias).`,
      };
    }
  }

  return { ok: true, ano, mes, dia };
}

function assertValid(data: DataHistorica) {
  const analise = analyzeDate(data);
  if (!analise.ok) throw new RangeError(analise.motivo);
  return analise;
}

function toOrdinal(ano: number, mes: number, dia: number): DiaOrdinal {
  return (Date.UTC(ano, mes - 1, dia) / MS_POR_DIA) as DiaOrdinal;
}

/**
 * Primeiro e último dia que a data pode representar. Serve para ordenar e
 * filtrar datas parciais. O resultado é numérico de propósito: não é uma data
 * histórica e não deve ser convertido de volta para exibição.
 */
export function calcInterval(data: DataHistorica): IntervaloDeCalculo {
  const { ano, mes, dia } = assertValid(data);
  const mesInicial = mes ?? 1;
  const mesFinal = mes ?? 12;
  return {
    inicio: toOrdinal(ano, mesInicial, dia ?? 1),
    fim: toOrdinal(ano, mesFinal, dia ?? daysInMonth(ano, mesFinal)),
  };
}

/** Intervalo de cálculo de um recorte de anos, com as duas pontas inclusas. */
export function yearRangeInterval(de: number, ate: number): IntervaloDeCalculo {
  return { inicio: toOrdinal(de, 1, 1), fim: toOrdinal(ate, 12, 31) };
}

export function intervalsOverlap(
  a: IntervaloDeCalculo,
  b: IntervaloDeCalculo,
): boolean {
  return a.inicio <= b.fim && b.inicio <= a.fim;
}

/**
 * Ordem cronológica para datas de precisões diferentes: primeiro quem pode ter
 * começado antes; no empate, a data mais precisa vem primeiro.
 */
export function compareDates(a: DataHistorica, b: DataHistorica): number {
  const ia = calcInterval(a);
  const ib = calcInterval(b);
  return ia.inicio - ib.inicio || ia.fim - ib.fim;
}

export function yearOf(data: DataHistorica): number {
  return assertValid(data).ano;
}

/**
 * Texto de apresentação. Mostra só o que a precisão sustenta: `1989`,
 * `novembro de 1989` ou `15 de novembro de 1989`.
 */
export function formatDate(data: DataHistorica): string {
  const { ano, mes, dia } = assertValid(data);
  if (mes === null) return String(ano);
  const nomeDoMes = MESES[mes - 1];
  if (dia === null) return `${nomeDoMes} de ${ano}`;
  return `${dia === 1 ? "1º" : dia} de ${nomeDoMes} de ${ano}`;
}

const MESES_ABREVIADOS = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
] as const;

/**
 * A data em duas partes, para a composição em que o ano vem em destaque: o ano
 * e, ao lado, só o que a precisão sustenta (`10 fev`, `mar` ou nada).
 */
export function formatDateParts(data: DataHistorica): { ano: string; complemento: string | null } {
  const { ano, mes, dia } = assertValid(data);
  if (mes === null) return { ano: String(ano), complemento: null };
  const nomeDoMes = MESES_ABREVIADOS[mes - 1];
  return {
    ano: String(ano),
    complemento: dia === null ? `${nomeDoMes}` : `${dia === 1 ? "1º" : dia} ${nomeDoMes}`,
  };
}

/** Frase que avisa quando a data é parcial; `null` quando o dia é conhecido. */
export function describePrecision(data: DataHistorica): string | null {
  if (data.precisao === "ano") return "Só o ano está documentado.";
  if (data.precisao === "mes") return "O dia não está documentado.";
  return null;
}

/**
 * Período por extenso, com cada limite na precisão conhecida. Limite
 * desconhecido é dito como desconhecido, e `em-curso` como vigente na data de
 * corte.
 */
export function formatPeriod(periodo: Periodo): string {
  const { inicio, fim } = periodo;
  const de = inicio.tipo === "data" ? formatDate(inicio) : null;
  const ate = fim.tipo === "data" ? formatDate(fim) : null;

  if (de !== null && ate !== null) return de === ate ? de : `${de} a ${ate}`;
  if (de !== null) return fim.tipo === "em-curso" ? `desde ${de}` : `a partir de ${de}; fim não documentado`;
  if (ate !== null) return `até ${ate}; início não documentado`;
  return fim.tipo === "em-curso" ? "em curso; início não documentado" : "período não documentado";
}

/** O mesmo período em anos, para espaços estreitos: `2003–2007`, `desde 2019`, `até 2015`. */
export function formatPeriodYears(periodo: Periodo): string {
  const { inicio, fim } = periodo;
  const de = inicio.tipo === "data" ? yearOf(inicio) : null;
  const ate = fim.tipo === "data" ? yearOf(fim) : null;

  if (de !== null && ate !== null) return de === ate ? String(de) : `${de}–${ate}`;
  if (de !== null) return fim.tipo === "em-curso" ? `desde ${de}` : `${de}–?`;
  if (ate !== null) return `?–${ate}`;
  return fim.tipo === "em-curso" ? "em curso" : "sem datas";
}

/** Um recorte de anos por extenso: `2018` para um ano só, `2003–2010` para um intervalo. */
export function formatYearRange(de: number, ate: number): string {
  return de === ate ? String(de) : `${Math.min(de, ate)}–${Math.max(de, ate)}`;
}

/**
 * Limites de um período em números de cálculo. `null` marca o limite que não
 * está documentado. `em-curso` vale até a data de corte da edição, que é o
 * último dia sobre o qual o conjunto afirma alguma coisa.
 */
export interface LimitesDeCalculo {
  inicio: IntervaloDeCalculo | null;
  fim: IntervaloDeCalculo | null;
}

export function calcPeriodBounds(periodo: Periodo, dataDeCorte: string): LimitesDeCalculo {
  const { inicio, fim } = periodo;
  return {
    inicio: inicio.tipo === "data" ? calcInterval(inicio) : null,
    fim:
      fim.tipo === "data"
        ? calcInterval(fim)
        : fim.tipo === "em-curso"
          ? calcInterval({ valor: dataDeCorte, precisao: "dia" })
          : null,
  };
}

/**
 * Relação entre um período e um recorte:
 *   `documentada`  as datas conhecidas provam que o período toca o recorte;
 *   `incerta`      depende de um limite que não está documentado;
 *   `nenhuma`      as datas conhecidas provam que não toca.
 * Um limite desconhecido nunca vira data: ele só impede a certeza.
 */
export type PeriodOverlap = "documentada" | "incerta" | "nenhuma";

export function classifyOverlap(
  limites: LimitesDeCalculo,
  recorte: IntervaloDeCalculo,
): PeriodOverlap {
  const inicioMaisCedo = limites.inicio?.inicio ?? Number.NEGATIVE_INFINITY;
  const fimMaisTarde = limites.fim?.fim ?? Number.POSITIVE_INFINITY;
  if (inicioMaisCedo > recorte.fim || fimMaisTarde < recorte.inicio) return "nenhuma";

  // O início nunca é posterior ao fim, e o fim nunca é anterior ao início:
  // um limite conhecido restringe o desconhecido.
  const inicioMaisTarde = Math.min(limites.inicio?.fim ?? Number.POSITIVE_INFINITY, fimMaisTarde);
  const fimMaisCedo = Math.max(limites.fim?.inicio ?? Number.NEGATIVE_INFINITY, inicioMaisCedo);
  return inicioMaisTarde <= recorte.fim && fimMaisCedo >= recorte.inicio
    ? "documentada"
    : "incerta";
}

/**
 * Devolve o motivo quando o período é incoerente, ou `null` quando é aceito.
 * Limites desconhecidos ou em curso não são comparados. Entre duas datas
 * parciais, o período só é recusado se não houver nenhuma leitura possível em
 * que o início venha antes do fim (início `2003` e fim `2003-06` é aceito).
 */
export function findPeriodProblem(periodo: Periodo): string | null {
  const { inicio, fim } = periodo;
  if (inicio.tipo !== "data" || fim.tipo !== "data") return null;

  const analiseInicio = analyzeDate(inicio);
  const analiseFim = analyzeDate(fim);
  if (!analiseInicio.ok || !analiseFim.ok) return null; // o erro de data já é reportado no campo

  if (calcInterval(inicio).inicio > calcInterval(fim).fim) {
    return `Período incoerente: o início (${formatDate(inicio)}) é posterior ao fim (${formatDate(fim)}).`;
  }
  return null;
}
