// O cartão de uma decisão (src/lib/data/decisions.ts): a visão de leitura de
// votos, atos e atuações legislativas sobre as fixtures sintéticas e sobre a
// edição real, com o cargo, a proposição, o objeto, a manifestação, o tipo do
// ato ou a matéria com o destino dela, as fontes e a revisão sem as
// observações. Os agrupamentos por tema não somam nem ordenam por quantidade,
// e a decisão sem tema não some.

import { describe, expect, it } from "vitest";

import { readSources, resolvePaths } from "@/lib/content/sources";
import { compareDecisions, decisionsWithoutTheme, findDecisionView, groupDecisionsByTheme, listDecisionViews, proposicaoLabel, themesWithDecisions } from "@/lib/data/decisions";
import { TEMAS } from "@/lib/domain/decisions";
import { buildAtlasData } from "@/lib/publication/build";

import { loadAtlasData } from "./helpers";

const sintetico = loadAtlasData();
const real = buildAtlasData(readSources(resolvePaths())).data!;

describe("cartão de decisão sobre as fixtures", () => {
  it("lista só os votos vigentes, os atos e as atuações da pessoa, em ordem cronológica, com o cargo do mandato", () => {
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
      } else if (view.natureza === "ato") {
        expect(view.ato.identificador.length).toBeGreaterThan(0);
        expect(view.instituicao).toBe("presidencia-da-republica");
      } else {
        expect(view.atuacao.materia.identificador.length).toBeGreaterThan(0);
        expect(view.proposicoes).toEqual([]);
      }
    }
    expect(new Set(deA.map((view) => view.natureza))).toEqual(new Set(["voto", "ato", "atuacao"]));
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

  it("a atuação legislativa traz a matéria, de quem ela é e o destino documentado, sem dizer como a pessoa votou", () => {
    const autoria = findDecisionView(sintetico, "sintetico-atuacao-a1")!;
    expect(autoria.natureza).toBe("atuacao");
    if (autoria.natureza !== "atuacao") throw new Error("a fixture mudou");
    expect(autoria.titulo).toBe("[SINTÉTICO] Autoria fictícia de uma lei de teste");
    expect(autoria.instituicao).toBe("senado-federal");
    expect(autoria.cargo?.mandatoId).toBe("sintetico-mandato-a1");
    expect(autoria.atuacao).toEqual({
      tipo: "autoria",
      materia: { identificador: "[SINTÉTICO] Projeto fictício nº 7/2003", ementa: "[SINTÉTICO] Ementa fictícia sobre saúde.", autoria: "[SINTÉTICO] Autor de teste" },
      desfecho: { tipo: "lei-sancionada", norma: "[SINTÉTICO] Lei fictícia nº 9/2004", descricao: "[SINTÉTICO] O documento fictício traz a fórmula de sanção." },
      divergencia: null,
    });
    expect(autoria.fontes.map((fonte) => fonte.id)).toEqual(["sintetico-fonte-01"]);
    expect("registro" in autoria).toBe(false);

    const relatoria = findDecisionView(sintetico, "sintetico-atuacao-b1")!;
    if (relatoria.natureza !== "atuacao") throw new Error("a fixture mudou");
    expect(relatoria.atuacao.tipo).toBe("relatoria");
    expect(relatoria.atuacao.desfecho).toMatchObject({ tipo: "nao-documentado", norma: null });
    expect(relatoria.atuacao.divergencia).toContain("datas diferentes");
    expect(relatoria.instituicao).toBe("congresso-nacional");
  });

  it("a decisão sem tema fica em grupo próprio, e não some dos agrupamentos", () => {
    const deB = listDecisionViews(sintetico, "sintetico-pessoa-b");
    const semTema = decisionsWithoutTheme(deB);
    expect(semTema.map((view) => view.id)).toEqual(["sintetico-atuacao-b1"]);
    const comTema = new Set(Object.values(groupDecisionsByTheme(deB)).flat().map((view) => view.id));
    // Cada decisão está em um tema ou no grupo sem tema: nenhuma fica fora dos dois.
    for (const view of deB) expect(comTema.has(view.id) || semTema.includes(view), view.id).toBe(true);
    expect(decisionsWithoutTheme(listDecisionViews(sintetico, "sintetico-pessoa-a"))).toEqual([]);
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
  it("as duas pessoas têm decisões nos temas Economia e Segurança pública, cada uma com cargo, fontes e proposição, decreto ou matéria", () => {
    for (const pessoa of real.conjunto.pessoas) {
      const decisoes = listDecisionViews(real, pessoa.id);
      expect(decisoes.length, pessoa.id).toBeGreaterThan(0);
      expect(themesWithDecisions(decisoes), pessoa.id).toEqual(expect.arrayContaining(["economia", "seguranca-publica"]));
      for (const view of decisoes) {
        const onde = `${pessoa.id} ${view.id}`;
        expect(view.cargo, onde).not.toBeNull();
        expect(view.fontes.length, onde).toBeGreaterThan(0);
        if (view.natureza === "ato" && view.ato.tipo !== "decreto") expect(view.proposicoes.length, onde).toBeGreaterThan(0);
        if (view.natureza === "voto") {
          expect(view.registro.tipo, onde).toBe("voto-individual");
          expect(view.votacao.modalidade, onde).toBe("nominal");
          expect(view.cargo!.instituicao, onde).toBe("Senado Federal");
        } else if (view.natureza === "ato") {
          expect(view.cargo!.instituicao, onde).toBe("Presidência da República");
        } else {
          // A atuação legislativa: a matéria com o destino documentado, e nunca um voto.
          expect(view.atuacao.materia.ementa.length, onde).toBeGreaterThan(0);
          expect(view.atuacao.desfecho.norma, onde).not.toBeNull();
          expect(["Assembleia Legislativa do Estado do Rio de Janeiro (Alerj)", "Senado Federal"], onde).toContain(view.cargo!.instituicao);
        }
      }
    }
  });

  it("cada natureza de decisão fica com quem a tem: atos de Lula; votos e atuações legislativas de Flávio Bolsonaro", () => {
    const naturezas = (pessoaId: string) => [...new Set(listDecisionViews(real, pessoaId).map((view) => view.natureza))].sort();
    expect(naturezas("lula")).toEqual(["ato"]);
    expect(naturezas("flavio-bolsonaro")).toEqual(["atuacao", "voto"]);
    // As leis estaduais e a relatoria não são acontecimentos: não entram na linha do tempo nem no limite de vinte por pessoa.
    const atuacoes = listDecisionViews(real, "flavio-bolsonaro").filter((view) => view.natureza === "atuacao");
    expect(atuacoes).toHaveLength(9);
    const eventos = new Set(real.conjunto.acontecimentos.map((item) => item.id));
    for (const view of atuacoes) expect(eventos.has(view.id), view.id).toBe(false);
    // Nenhuma decisão publicada fica fora dos temas e do grupo sem tema.
    for (const pessoa of real.conjunto.pessoas) {
      const decisoes = listDecisionViews(real, pessoa.id);
      const comTema = new Set(Object.values(groupDecisionsByTheme(decisoes)).flat().map((view) => view.id));
      const semTema = new Set(decisionsWithoutTheme(decisoes).map((view) => view.id));
      for (const view of decisoes) expect(comTema.has(view.id) !== semTema.has(view.id), view.id).toBe(true);
    }
  });

  it("as duas pessoas têm decisão documentada sobre as mesmas proposições em quatro casos", () => {
    const porPessoa = real.conjunto.pessoas.map((pessoa) => new Set(listDecisionViews(real, pessoa.id).flatMap((view) => view.proposicoes.map((proposicao) => proposicao.id))));
    const comuns = [...porPessoa[0]!].filter((id) => porPessoa[1]!.has(id)).sort();
    expect(comuns).toEqual(["senado-pl-2253-2022", "senado-pl-5582-2025", "senado-plp-68-2024", "senado-plp-93-2023"]);
  });

  it("o cartão traz a divergência documentada da votação 6714, a falta do texto de referência e a lista de dispositivos da LC 214/2025 por extenso", () => {
    const voto = findDecisionView(real, "senado-voto-6714-5894")!;
    expect(voto.natureza).toBe("voto");
    if (voto.natureza === "voto") {
      expect(voto.votacao.objeto.divergencia).toContain("PLP 93/2023");
      expect(voto.votacao.objeto.divergencia).toContain("nº 39, de 2023");
      expect(voto.votacao.textoReferencia).toBeNull();
    }
    // Nas outras cinco votações os documentos concordam, e nenhuma tem o texto de referência ligado nesta edição.
    for (const votacao of real.conjunto.votacoes) {
      if (votacao.id !== "senado-votacao-6714") expect(votacao.objeto.divergenciaDocumentada, votacao.id).toBeNull();
      expect(votacao.objeto.textoReferencia, votacao.id).toBeNull();
    }
    const ato = findDecisionView(real, "planalto-lei-complementar-214-2025-ibs-cbs")!;
    expect(ato.natureza).toBe("ato");
    if (ato.natureza === "ato") {
      const dispositivos = ato.ato.detalhes.find((detalhe) => detalhe.rotulo === "Dispositivos vetados")!;
      expect(dispositivos.itens).toHaveLength(22);
      expect(dispositivos.valor).toBe(dispositivos.itens!.join("; "));
    }
  });
});
