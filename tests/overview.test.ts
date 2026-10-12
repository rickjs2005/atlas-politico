// A comparação curta (src/lib/data/overview.ts): os cargos públicos de cada
// pessoa e o tipo de registro que o atlas tem por cargo e por área. O resumo
// diz o tipo, nunca a quantidade, e trata as duas pessoas com os mesmos
// campos; uma área sem decisão é lacuna da pesquisa.

import { describe, expect, it } from "vitest";

import { readSources, resolvePaths } from "@/lib/content/sources";
import { listDecisionViews } from "@/lib/data/decisions";
import { GAP_NOTICE, NATUREZAS, NATUREZA_PLURAL, NO_DECISION, OFFICE_NOTICE, buildOverview, describeKinds, principalMandates } from "@/lib/data/overview";
import { TEMAS } from "@/lib/domain/decisions";
import { buildAtlasData } from "@/lib/publication/build";

import { loadAtlasData } from "./helpers";

const real = buildAtlasData(readSources(resolvePaths())).data!;
const sintetico = loadAtlasData();

describe("tipos de registro por extenso", () => {
  it("escreve um, dois ou três tipos, sempre na mesma ordem, e nada quando não há", () => {
    expect(describeKinds([])).toBeNull();
    expect(describeKinds(["ato"])).toBe("atos do Executivo");
    expect(describeKinds(["voto", "atuacao"])).toBe("votos nominais e autoria ou relatoria de matérias");
    expect(describeKinds(NATUREZAS)).toBe("votos nominais, atos do Executivo e autoria ou relatoria de matérias");
    expect(Object.keys(NATUREZA_PLURAL).sort()).toEqual([...NATUREZAS].sort());
  });

  it("os avisos dizem que cargo diferente dá registro diferente e que área vazia é lacuna, sem palavra de medida", () => {
    expect(OFFICE_NOTICE).toContain("e não uma quantidade");
    expect(GAP_NOTICE).toContain("lacuna da pesquisa desta edição, e não uma conclusão sobre a pessoa");
    expect(NO_DECISION).toBe("Nenhuma decisão publicada nesta edição");
    for (const texto of [OFFICE_NOTICE, GAP_NOTICE, NO_DECISION]) expect(texto).not.toMatch(/\b(mais|menos|melhor|pior|nota|ranking|produtiv\w+|desempenho)\b/i);
  });
});

describe("resumo sobre as fixtures", () => {
  it("só os mandatos com casa declarada entram, em ordem cronológica, e o resumo tem uma linha por área", () => {
    const deA = buildOverview(sintetico, "sintetico-pessoa-a");
    expect(deA.cargos.map((cargo) => cargo.mandatoId)).toEqual(principalMandates(sintetico, "sintetico-pessoa-a").map((mandato) => mandato.id));
    for (const mandato of principalMandates(sintetico, "sintetico-pessoa-a")) expect(mandato.casa, mandato.id).toBeDefined();
    expect(deA.areas.map((area) => area.tema)).toEqual([...TEMAS]);
    // A pessoa A tem proposta em Economia e em Saúde; nas outras áreas, a tela diz que não foi pesquisado.
    expect(deA.areas.filter((area) => area.propostas).map((area) => area.tema)).toEqual(["economia", "saude"]);
    // A autoria fictícia é de Saúde.
    expect(deA.areas.find((area) => area.tema === "saude")!.naturezas).toContain("atuacao");
    expect(deA.semArea).toEqual([]);
    // A relatoria fictícia da pessoa B não tem área: fica no grupo à parte, e não some.
    expect(buildOverview(sintetico, "sintetico-pessoa-b").semArea).toEqual(["atuacao"]);
  });

  it("pessoa que a edição não tem dá um resumo vazio, sem erro", () => {
    const vazio = buildOverview(sintetico, "pessoa-que-nao-existe");
    expect(vazio.cargos).toEqual([]);
    expect(vazio.semArea).toEqual([]);
    expect(vazio.areas.every((area) => area.naturezas.length === 0 && !area.propostas)).toBe(true);
  });
});

describe("resumo da edição", () => {
  const lula = buildOverview(real, "lula");
  const flavio = buildOverview(real, "flavio-bolsonaro");

  it("os cargos principais são os cargos públicos, sem as funções exercidas dentro de outro mandato nem os cargos de sindicato e de partido", () => {
    expect(lula.cargos.map((cargo) => cargo.mandatoId)).toEqual(["lula-deputado-federal-1987-1991", "lula-presidente-da-republica-2003-2007", "lula-presidente-da-republica-2007-2011", "lula-presidente-da-republica-2023"]);
    expect(flavio.cargos.map((cargo) => cargo.mandatoId)).toEqual(["flavio-bolsonaro-deputado-estadual-2003-2019", "flavio-bolsonaro-senador-2019"]);
    expect(flavio.cargos.map((cargo) => cargo.periodo)).toEqual(["2003–2019", "desde 2019"]);
  });

  it("cada cargo diz o tipo de registro que o atlas tem dele, e o cargo sem decisão aparece como lacuna", () => {
    const porCargo = (resumo: typeof lula) => Object.fromEntries(resumo.cargos.map((cargo) => [cargo.mandatoId, cargo.naturezas]));
    expect(porCargo(lula)).toEqual({
      "lula-deputado-federal-1987-1991": [],
      "lula-presidente-da-republica-2003-2007": ["ato"],
      "lula-presidente-da-republica-2007-2011": ["ato"],
      "lula-presidente-da-republica-2023": ["ato"],
    });
    expect(porCargo(flavio)).toEqual({ "flavio-bolsonaro-deputado-estadual-2003-2019": ["atuacao"], "flavio-bolsonaro-senador-2019": ["voto", "atuacao"] });
    // Toda decisão publicada pertence a um dos cargos principais: nenhuma fica fora do resumo.
    for (const resumo of [lula, flavio]) {
      const cargos = new Set(resumo.cargos.map((cargo) => cargo.mandatoId));
      for (const decisao of listDecisionViews(real, resumo.pessoaId)) expect(cargos.has(decisao.cargo!.mandatoId), decisao.id).toBe(true);
    }
  });

  it("as duas pessoas têm as mesmas sete áreas, com proposta registrada em todas; a área sem decisão fica vazia, e não some", () => {
    for (const resumo of [lula, flavio]) {
      expect(resumo.areas.map((area) => area.tema)).toEqual([...TEMAS]);
      expect(resumo.areas.every((area) => area.propostas), resumo.pessoaId).toBe(true);
    }
    const vazias = (resumo: typeof lula) => resumo.areas.filter((area) => area.naturezas.length === 0).map((area) => area.tema);
    // A amostra de atos de 2003 a 2010 tem ao menos um ato em cada uma das sete áreas.
    expect(vazias(lula)).toEqual([]);
    expect(vazias(flavio)).toEqual(["educacao", "direitos-das-mulheres"]);
    // Os tipos seguem o cargo: atos de quem presidiu; votos e atuação legislativa de quem foi parlamentar.
    for (const area of lula.areas) expect(area.naturezas.every((natureza) => natureza === "ato"), area.tema).toBe(true);
    for (const area of flavio.areas) expect(area.naturezas.includes("ato"), area.tema).toBe(false);
    expect(lula.semArea).toEqual(["ato"]);
    expect(flavio.semArea).toEqual(["atuacao"]);
  });

  it("o resumo não traz número de registros em campo nenhum", () => {
    for (const resumo of [lula, flavio]) {
      const numeros = JSON.stringify(resumo, (chave, valor: unknown) => (chave === "periodo" || chave === "mandatoId" || chave === "cargo" || chave === "instituicao" ? undefined : valor)).match(/\d+/g);
      expect(numeros, resumo.pessoaId).toBeNull();
    }
  });
});
