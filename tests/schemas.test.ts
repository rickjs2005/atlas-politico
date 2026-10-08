import { describe, expect, it } from "vitest";

import {
  acontecimentoSchema,
  fonteSchema,
  lugarSchema,
  periodoSchema,
} from "@/lib/domain/schemas";

const revisado = {
  estado: "revisado",
  revisao: { tipo: "humana", revisadoPor: "Revisor de teste", revisadoEm: "2026-10-08" },
};
const citacao = {
  fonteId: "fonte-de-teste",
  localizacao: "Página 1",
  evidencia: "Trecho que sustenta o registro.",
};

function acontecimento(mudancas: Record<string, unknown> = {}) {
  return {
    id: "evento-de-teste",
    slug: "evento-de-teste",
    pessoaIds: ["pessoa-de-teste"],
    titulo: "Acontecimento de teste",
    data: { valor: "2003-03", precisao: "mes" },
    categoria: "eleicoes",
    resumo: "Resumo de teste.",
    contexto: "Contexto de teste.",
    localizacao: { tipo: "lugares", lugarIds: ["lugar-de-teste"] },
    imagemId: null,
    fontes: [citacao],
    editorial: revisado,
    ...mudancas,
  };
}

function lugar(mudancas: Record<string, unknown> = {}) {
  return {
    id: "lugar-de-teste",
    nome: "Lugar de teste",
    pais: "BR",
    municipio: null,
    longitude: -50,
    latitude: -14,
    precisaoGeografica: "municipio",
    origemCoordenadas: "Coordenada de teste.",
    ...mudancas,
  };
}

function fonte(mudancas: Record<string, unknown> = {}) {
  return {
    id: "fonte-de-teste",
    titulo: "Documento de teste",
    autoria: "Instituição de teste",
    url: "https://exemplo.invalid/documento",
    dataDocumento: { tipo: "desconhecida" },
    acessadoEm: "2026-10-08",
    ...mudancas,
  };
}

/** Caminhos dos problemas encontrados, como `data.valor`. */
function problemPaths(resultado: { success: boolean; error?: { issues: { path: PropertyKey[] }[] } }) {
  return (resultado.error?.issues ?? []).map((issue) => issue.path.join("."));
}

describe("acontecimento", () => {
  it("aceita um registro revisado completo", () => {
    expect(acontecimentoSchema.safeParse(acontecimento()).success).toBe(true);
  });

  it("aceita várias pessoas e vários lugares", () => {
    const resultado = acontecimentoSchema.safeParse(
      acontecimento({
        pessoaIds: ["pessoa-a", "pessoa-b"],
        localizacao: { tipo: "lugares", lugarIds: ["lugar-a", "lugar-b"] },
      }),
    );
    expect(resultado.success).toBe(true);
  });

  it("exige ao menos uma pessoa", () => {
    expect(acontecimentoSchema.safeParse(acontecimento({ pessoaIds: [] })).success).toBe(false);
  });

  it("aceita abrangência nacional e lugar desconhecido, sem coordenadas", () => {
    expect(
      acontecimentoSchema.safeParse(acontecimento({ localizacao: { tipo: "nacional" } })).success,
    ).toBe(true);
    expect(
      acontecimentoSchema.safeParse(acontecimento({ localizacao: { tipo: "desconhecida" } })).success,
    ).toBe(true);
  });

  it("não aceita lista de lugares vazia: a falta de lugar tem de ser explícita", () => {
    const resultado = acontecimentoSchema.safeParse(
      acontecimento({ localizacao: { tipo: "lugares", lugarIds: [] } }),
    );
    expect(resultado.success).toBe(false);
  });

  it("recusa data que não combina com a precisão declarada", () => {
    const resultado = acontecimentoSchema.safeParse(
      acontecimento({ data: { valor: "2003-03-01", precisao: "mes" } }),
    );
    expect(problemPaths(resultado)).toEqual(["data.valor"]);
  });

  it("recusa data impossível", () => {
    const resultado = acontecimentoSchema.safeParse(
      acontecimento({ data: { valor: "2023-02-29", precisao: "dia" } }),
    );
    expect(problemPaths(resultado)).toEqual(["data.valor"]);
  });

  it("recusa campo desconhecido, que costuma ser erro de digitação", () => {
    const resultado = acontecimentoSchema.safeParse(acontecimento({ titlo: "Com erro" }));
    expect(resultado.success).toBe(false);
  });

  it("recusa categoria fora da lista", () => {
    expect(acontecimentoSchema.safeParse(acontecimento({ categoria: "outra" })).success).toBe(false);
  });
});

describe("estado editorial e evidência", () => {
  it("registro revisado precisa de fonte", () => {
    const resultado = acontecimentoSchema.safeParse(acontecimento({ fontes: [] }));
    expect(problemPaths(resultado)).toEqual(["fontes"]);
  });

  it("rascunho pode existir sem fonte", () => {
    const resultado = acontecimentoSchema.safeParse(
      acontecimento({ fontes: [], editorial: { estado: "rascunho" } }),
    );
    expect(resultado.success).toBe(true);
  });

  it("revisado precisa dizer quem revisou e quando", () => {
    expect(
      acontecimentoSchema.safeParse(acontecimento({ editorial: { estado: "revisado" } })).success,
    ).toBe(false);
    expect(
      acontecimentoSchema.safeParse(
        acontecimento({
          editorial: { estado: "revisado", revisao: { revisadoPor: "Revisor", revisadoEm: "2026-10" } },
        }),
      ).success,
    ).toBe(false);
  });

  it("revisão precisa declarar se foi assistida por IA ou humana", () => {
    const revisao = { revisadoPor: "Revisor", revisadoEm: "2026-10-08" };
    const withType = (tipo?: string) =>
      acontecimentoSchema.safeParse(
        acontecimento({ editorial: { estado: "revisado", revisao: { ...revisao, tipo } } }),
      ).success;

    expect(withType("assistida-por-ia")).toBe(true);
    expect(withType("humana")).toBe(true);
    expect(withType(undefined)).toBe(false);
    expect(withType("automatica")).toBe(false);
  });

  it("citação precisa dizer onde está a evidência e o que ela sustenta", () => {
    const semEvidencia = { fonteId: "fonte-de-teste", localizacao: "Página 1", evidencia: " " };
    expect(acontecimentoSchema.safeParse(acontecimento({ fontes: [semEvidencia] })).success).toBe(false);
  });
});

describe("período", () => {
  const dataDe = (valor: string, precisao: string) => ({ tipo: "data", valor, precisao });

  it("aceita fim em curso e limites desconhecidos", () => {
    expect(
      periodoSchema.safeParse({ inicio: dataDe("2019", "ano"), fim: { tipo: "em-curso" } }).success,
    ).toBe(true);
    expect(
      periodoSchema.safeParse({ inicio: { tipo: "desconhecida" }, fim: { tipo: "desconhecida" } }).success,
    ).toBe(true);
  });

  it("não aceita início em curso", () => {
    expect(
      periodoSchema.safeParse({ inicio: { tipo: "em-curso" }, fim: dataDe("2020", "ano") }).success,
    ).toBe(false);
  });

  it("não aceita limite omitido: desconhecido tem de ser declarado", () => {
    expect(periodoSchema.safeParse({ inicio: dataDe("2019", "ano") }).success).toBe(false);
    expect(periodoSchema.safeParse({ inicio: dataDe("2019", "ano"), fim: null }).success).toBe(false);
  });

  it("recusa intervalo incoerente", () => {
    const resultado = periodoSchema.safeParse({
      inicio: dataDe("2010", "ano"),
      fim: dataDe("2003-06", "mes"),
    });
    expect(resultado.success).toBe(false);
    expect(resultado.error?.issues[0]?.message).toContain("Período incoerente");
  });

  it("recusa data impossível em um dos limites", () => {
    const resultado = periodoSchema.safeParse({
      inicio: dataDe("2003-02-30", "dia"),
      fim: { tipo: "em-curso" },
    });
    expect(problemPaths(resultado)).toEqual(["inicio.valor"]);
  });
});

describe("lugar", () => {
  it("aceita coordenada brasileira na ordem certa", () => {
    expect(lugarSchema.safeParse(lugar()).success).toBe(true);
  });

  it("acusa longitude e latitude trocadas em lugar do Brasil", () => {
    const resultado = lugarSchema.safeParse(lugar({ longitude: -14, latitude: -50 }));
    expect(resultado.success).toBe(false);
    expect(resultado.error?.issues[0]?.message).toContain("trocadas");
  });

  it("recusa coordenada fora dos limites do globo", () => {
    expect(lugarSchema.safeParse(lugar({ pais: "ZZ", longitude: 200 })).success).toBe(false);
    expect(lugarSchema.safeParse(lugar({ pais: "ZZ", latitude: -91 })).success).toBe(false);
  });

  it("não aplica a caixa do Brasil a outros países", () => {
    expect(lugarSchema.safeParse(lugar({ pais: "PT", longitude: -9.14, latitude: 38.72 })).success).toBe(
      true,
    );
  });

  it("exige precisão geográfica e origem da coordenada", () => {
    expect(lugarSchema.safeParse(lugar({ precisaoGeografica: undefined })).success).toBe(false);
    expect(lugarSchema.safeParse(lugar({ origemCoordenadas: "" })).success).toBe(false);
  });
});

describe("fonte", () => {
  it("aceita data do documento desconhecida, desde que declarada", () => {
    expect(fonteSchema.safeParse(fonte()).success).toBe(true);
    expect(fonteSchema.safeParse(fonte({ dataDocumento: undefined })).success).toBe(false);
  });

  it("exige data de acesso completa", () => {
    expect(fonteSchema.safeParse(fonte({ acessadoEm: "2026-10" })).success).toBe(false);
  });

  it("só aceita endereço http ou https", () => {
    expect(fonteSchema.safeParse(fonte({ url: "ftp://exemplo.invalid/arquivo" })).success).toBe(false);
    expect(fonteSchema.safeParse(fonte({ url: "sem endereço" })).success).toBe(false);
  });
});
