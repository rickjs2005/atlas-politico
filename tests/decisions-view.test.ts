// O cartão de uma decisão (src/lib/data/decisions.ts): a visão de leitura de
// votos e atos sobre as fixtures sintéticas e sobre a edição real, com o
// cargo, a proposição, o objeto, a manifestação ou o tipo do ato, as fontes e
// a revisão sem as observações. Os agrupamentos por tema não somam nem
// ordenam por quantidade.

import { describe, expect, it } from "vitest";

import { readSources, resolvePaths } from "@/lib/content/sources";
import { compareDecisions, findDecisionView, groupDecisionsByTheme, listDecisionViews, proposicaoLabel, themesWithDecisions } from "@/lib/data/decisions";
import { TEMAS } from "@/lib/domain/decisions";
import { buildAtlasData } from "@/lib/publication/build";

import { loadAtlasData } from "./helpers";

const sintetico = loadAtlasData();
const real = buildAtlasData(readSources(resolvePaths())).data!;

describe("cartão de decisão sobre as fixtures", () => {
  it("lista só os votos vigentes e os atos da pessoa, em ordem cronológica, com o cargo do mandato", () => {
    const deA = listDecisionViews(sintetico, "sintetico-pessoa-a");
    expect(deA.length).toBeGreaterThan(0);
    for (let i = 1; i < deA.length; i += 1) expect(compareDecisions(deA[i - 1]!, deA[i]!)).toBeLessThanOrEqual(0);
    for (const view of deA) {
      expect(view.pessoaId).toBe("sintetico-pessoa-a");
      expect(view.titulo.length).toBeGreaterThan(0);
      if (view.natureza === "voto") {
        expect(view.proposicoes).toHaveLength(1);
        expect(view.votacao.objeto.descricao.length).toBeGreaterThan(0);
        expect(["Plenário"].concat(sintetico.conjunto.votacoes.flatMap((v) => (v.orgao.tipo === "comissao" ? [v.orgao.nome] : [])))).toContain(view.votacao.orgao);
      } else {
        expect(view.ato.identificador.length).toBeGreaterThan(0);
        expect(view.instituicao).toBe("presidencia-da-republica");
      }
    }
    // Um voto retificado não aparece; o vigente que o substituiu aparece.
    const retificados = sintetico.conjunto.votos.filter((voto) => voto.situacao.tipo === "retificado");
    expect(retificados.length).toBeGreaterThan(0);
    const todos = sintetico.conjunto.pessoas.flatMap((pessoa) => listDecisionViews(sintetico, pessoa.id)).map((view) => view.id);
    for (const voto of retificados) expect(todos).not.toContain(voto.id);
  });

  it("findDecisionView acha voto e ato pelo id, e devolve null para o que não existe", () => {
    const voto = sintetico.conjunto.votos.find((item) => item.situacao.tipo === "vigente")!;
    const view = findDecisionView(sintetico, voto.id)!;
    expect(view.natureza).toBe("voto");
    expect(view.id).toBe(voto.id);
    const ato = sintetico.conjunto.atosExecutivos[0]!;
    expect(findDecisionView(sintetico, ato.id)?.natureza).toBe("ato");
    expect(findDecisionView(sintetico, "nao-existe")).toBeNull();
  });

  it("a revisão vai sem as observações internas", () => {
    for (const pessoa of sintetico.conjunto.pessoas) {
      for (const view of listDecisionViews(sintetico, pessoa.id)) {
        if (view.editorial.estado === "revisado") expect("observacoes" in view.editorial.revisao).toBe(false);
      }
    }
  });

  it("agrupa por tema com todos os temas presentes, e lista só os temas com decisão", () => {
    const deA = listDecisionViews(sintetico, "sintetico-pessoa-a");
    const grupos = groupDecisionsByTheme(deA);
    expect(Object.keys(grupos).sort()).toEqual([...TEMAS].sort());
    for (const tema of themesWithDecisions(deA)) expect(grupos[tema].length).toBeGreaterThan(0);
    for (const tema of TEMAS) for (const view of grupos[tema]) expect(view.temas).toContain(tema);
  });

  it("proposicaoLabel escreve sigla, número e ano, ou só a sigla", () => {
    expect(proposicaoLabel({ tipo: "PL", numero: 2253, ano: 2022 })).toBe("PL 2253/2022");
    expect(proposicaoLabel({ tipo: "MSF", numero: null, ano: 2023 })).toBe("MSF");
  });
});

describe("cartão de decisão sobre a edição real", () => {
  it("as duas pessoas têm decisões nos temas Economia e Segurança pública, cada uma com cargo, fontes e proposição ou decreto", () => {
    for (const pessoa of real.conjunto.pessoas) {
      const decisoes = listDecisionViews(real, pessoa.id);
      expect(decisoes.length, pessoa.id).toBeGreaterThan(0);
      expect(themesWithDecisions(decisoes), pessoa.id).toEqual(["economia", "seguranca-publica"]);
      for (const view of decisoes) {
        const onde = `${pessoa.id} ${view.id}`;
        expect(view.cargo, onde).not.toBeNull();
        expect(view.fontes.length, onde).toBeGreaterThan(0);
        if (view.natureza === "ato" && view.ato.tipo !== "decreto") expect(view.proposicoes.length, onde).toBeGreaterThan(0);
        if (view.natureza === "voto") {
          expect(view.registro.tipo, onde).toBe("voto-individual");
          expect(view.votacao.modalidade, onde).toBe("nominal");
          expect(view.cargo!.instituicao, onde).toBe("Senado Federal");
        } else expect(view.cargo!.instituicao, onde).toBe("Presidência da República");
      }
    }
  });

  it("as duas pessoas têm decisão documentada sobre as mesmas proposições em quatro casos", () => {
    const porPessoa = real.conjunto.pessoas.map((pessoa) => new Set(listDecisionViews(real, pessoa.id).flatMap((view) => view.proposicoes.map((proposicao) => proposicao.id))));
    const comuns = [...porPessoa[0]!].filter((id) => porPessoa[1]!.has(id)).sort();
    expect(comuns).toEqual(["senado-pl-2253-2022", "senado-pl-5582-2025", "senado-plp-68-2024", "senado-plp-93-2023"]);
  });
});
