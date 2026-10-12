// O conteúdo educativo do jogo no pipeline (docs/GAME-TRAIL.md, D-134): fatos
// biográficos, conceitos e fases. O texto de uma fase é explicação nova, e por
// isso passa pelas mesmas regras dos outros registros: contrato, referências,
// estado editorial, elegibilidade e barreira de publicação. Tudo sobre as
// fixtures sintéticas.

import { afterEach, describe, expect, it } from "vitest";

import { sliceForPerson } from "@/lib/data/slice";
import { LIMITES_DA_FASE, countWords } from "@/lib/domain/game";
import { checkIntegrity, phaseResolver } from "@/lib/domain/integrity";
import { conceitoSchema, faseDoJogoSchema, fatoBiograficoSchema, type FaseDoJogo } from "@/lib/domain/schemas";
import { renderHumanReview } from "@/lib/editorial/human-review";
import { releaseIssues } from "@/lib/editorial/release";
import { formatDiagnostic } from "@/lib/publication/diagnostics";
import { COLECOES_COM_CITACAO, COLECOES_FACTUAIS } from "@/lib/publication/sources";

import { baseContent, createProject, loadAtlasData, loadFixtures, removeProjects, type TestProject } from "./helpers";

afterEach(removeProjects);

const fase = (id: string): FaseDoJogo => structuredClone(loadFixtures().fasesDoJogo.find((item) => item.id === id)!);
const mensagens = (valor: unknown) => faseDoJogoSchema.safeParse(valor).error?.issues.map((issue) => issue.message) ?? [];
const errorLines = (projeto: TestProject) =>
  projeto
    .result()
    .diagnostics.filter((item) => item.severidade === "erro")
    .map(formatDiagnostic);

describe("contrato das fases", () => {
  it("as fixtures passam no contrato", () => {
    const conjunto = loadFixtures();
    for (const item of conjunto.fasesDoJogo) expect(faseDoJogoSchema.safeParse(item).success).toBe(true);
    for (const item of conjunto.fatosBiograficos) expect(fatoBiograficoSchema.safeParse(item).success).toBe(true);
    for (const item of conjunto.conceitos) expect(conceitoSchema.safeParse(item).success).toBe(true);
  });

  it("a opção certa tem de estar entre as opções, e as opções não se repetem", () => {
    const semCerta = fase("sintetico-fase-a1");
    if (semCerta.atividade.tipo !== "pergunta") throw new Error("a fixture mudou");
    semCerta.atividade.correta = "z";
    expect(mensagens(semCerta)).toContain('A opção certa ("z") não está entre as opções.');

    const repetida = fase("sintetico-fase-a1");
    if (repetida.atividade.tipo !== "pergunta") throw new Error("a fixture mudou");
    repetida.atividade.opcoes[2]!.id = "a";
    expect(mensagens(repetida)).toContain("Duas opções têm o mesmo identificador.");
  });

  it("uma pergunta tem duas ou três opções", () => {
    const quatro = fase("sintetico-fase-a1");
    if (quatro.atividade.tipo !== "pergunta") throw new Error("a fixture mudou");
    quatro.atividade.opcoes.push({ id: "d", texto: "[SINTÉTICO] Quarta opção." });
    expect(faseDoJogoSchema.safeParse(quatro).success).toBe(false);
    quatro.atividade.opcoes.splice(1);
    expect(faseDoJogoSchema.safeParse(quatro).success).toBe(false);
  });

  it("o marco é um registro da pessoa, e conceito não entra em Explorar", () => {
    const marco = fase("sintetico-fase-a1");
    marco.marco = { tipo: "conceito", id: "sintetico-conceito-01" };
    expect(mensagens(marco)).toContain("O marco de uma fase é um registro da pessoa, e não um conceito.");

    const explorar = fase("sintetico-fase-a1");
    explorar.explorar.push({ tipo: "conceito", id: "sintetico-conceito-01" });
    expect(mensagens(explorar)).toContain("Conceito não é registro para explorar: use o campo conceitos.");
  });

  it("todo bloco de explicação aponta ao menos um registro", () => {
    const solto = fase("sintetico-fase-a1");
    solto.explicacao[0]!.referencias = [];
    expect(faseDoJogoSchema.safeParse(solto).success).toBe(false);
  });

  it("a explicação, o enunciado, as opções e a definição têm limite de tamanho", () => {
    const longa = fase("sintetico-fase-a1");
    longa.explicacao[0]!.texto = Array.from({ length: LIMITES_DA_FASE.palavrasDaExplicacao + 1 }, () => "palavra").join(" ");
    expect(mensagens(longa).some((texto) => texto.startsWith("A explicação tem"))).toBe(true);

    const enunciado = fase("sintetico-fase-a1");
    enunciado.atividade.enunciado = Array.from({ length: LIMITES_DA_FASE.palavrasDoEnunciado + 1 }, () => "palavra").join(" ");
    expect(mensagens(enunciado)).toContain(`O enunciado tem mais de ${LIMITES_DA_FASE.palavrasDoEnunciado} palavras.`);

    const opcao = fase("sintetico-fase-a1");
    if (opcao.atividade.tipo !== "pergunta") throw new Error("a fixture mudou");
    opcao.atividade.opcoes[0]!.texto = Array.from({ length: LIMITES_DA_FASE.palavrasDaOpcao + 1 }, () => "palavra").join(" ");
    expect(mensagens(opcao)).toContain(`A opção tem mais de ${LIMITES_DA_FASE.palavrasDaOpcao} palavras.`);

    const conceito = structuredClone(loadFixtures().conceitos[0]!);
    conceito.definicao = Array.from({ length: LIMITES_DA_FASE.palavrasDoConceito + 1 }, () => "palavra").join(" ");
    expect(conceitoSchema.safeParse(conceito).success).toBe(false);
    expect(countWords("  uma  frase de   cinco palavras ")).toBe(5);
  });

  it("só registros com data entram em uma ordenação, sem repetição", () => {
    const comConceito = fase("sintetico-fase-a2");
    if (comConceito.atividade.tipo !== "ordem") throw new Error("a fixture mudou");
    comConceito.atividade.itens[0] = { tipo: "mandato", id: "sintetico-mandato-a1" };
    expect(mensagens(comConceito)).toContain("Só acontecimentos, decisões e fatos com data entram em uma ordenação.");

    const repetido = fase("sintetico-fase-a2");
    if (repetido.atividade.tipo !== "ordem") throw new Error("a fixture mudou");
    repetido.atividade.itens[1] = repetido.atividade.itens[0]!;
    expect(mensagens(repetido)).toContain("O mesmo registro aparece mais de uma vez na ordenação.");
  });

  it("fato biográfico e conceito revisados precisam de citação; a fase não cita por conta própria", () => {
    const fato = structuredClone(loadFixtures().fatosBiograficos[0]!);
    fato.fontes = [];
    expect(fatoBiograficoSchema.safeParse(fato).success).toBe(false);
    const conceito = structuredClone(loadFixtures().conceitos[0]!);
    conceito.fontes = [];
    expect(conceitoSchema.safeParse(conceito).success).toBe(false);
    expect(COLECOES_FACTUAIS).toContain("fasesDoJogo");
    expect(COLECOES_COM_CITACAO as readonly string[]).not.toContain("fasesDoJogo");
    expect(COLECOES_COM_CITACAO as readonly string[]).toEqual(expect.arrayContaining(["fatosBiograficos", "conceitos"]));
    expect("fontes" in fase("sintetico-fase-a1")).toBe(false);
  });
});

describe("integridade do conteúdo educativo", () => {
  const caminhos = (conjunto: ReturnType<typeof loadFixtures>) => checkIntegrity(conjunto).map((issue) => `${issue.caminho}: ${issue.mensagem}`);

  it("as fixtures se encaixam", () => {
    expect(checkIntegrity(loadFixtures())).toEqual([]);
  });

  it("uma referência resolve de quem é o registro e a data dele", () => {
    const resolver = phaseResolver(loadFixtures());
    expect(resolver({ tipo: "fato", id: "sintetico-fato-a1" })).toEqual({ pessoaIds: ["sintetico-pessoa-a"], data: { valor: "1960", precisao: "ano" } });
    expect(resolver({ tipo: "fato", id: "sintetico-fato-b1" })).toEqual({ pessoaIds: ["sintetico-pessoa-b"], data: null });
    // A decisão é um voto: a data é a da votação.
    expect(resolver({ tipo: "decisao", id: "sintetico-voto-01" })?.pessoaIds).toEqual(["sintetico-pessoa-a"]);
    expect(resolver({ tipo: "decisao", id: "sintetico-voto-01" })?.data).not.toBeNull();
    expect(resolver({ tipo: "decisao", id: "sintetico-ato-01" })?.data).toEqual({ valor: "1997-06-10", precisao: "dia" });
    expect(resolver({ tipo: "conceito", id: "sintetico-conceito-01" })).toEqual({ pessoaIds: null, data: null });
    expect(resolver({ tipo: "acontecimento", id: "nao-existe" })).toBeNull();
  });

  it("acusa referência inexistente e registro de outra pessoa", () => {
    const conjunto = loadFixtures();
    conjunto.fasesDoJogo[0]!.explorar = [
      { tipo: "acontecimento", id: "sintetico-evento-99" },
      { tipo: "acontecimento", id: "sintetico-evento-04" },
    ];
    expect(caminhos(conjunto)).toEqual([
      'fasesDoJogo["sintetico-fase-a1"].explorar[0]: Referência a acontecimento inexistente: "sintetico-evento-99".',
      'fasesDoJogo["sintetico-fase-a1"].explorar[1]: O registro "sintetico-evento-04" é de outra pessoa: uma fase só aponta registros da pessoa dela.',
    ]);
  });

  it("um acontecimento compartilhado serve às duas pessoas", () => {
    const conjunto = loadFixtures();
    const daB = conjunto.fasesDoJogo.find((item) => item.id === "sintetico-fase-b1")!;
    daB.explorar.push({ tipo: "acontecimento", id: "sintetico-evento-03" });
    expect(checkIntegrity(conjunto)).toEqual([]);
  });

  it("acusa conceito inexistente", () => {
    const conjunto = loadFixtures();
    conjunto.fasesDoJogo[0]!.conceitos = ["sintetico-conceito-99"];
    expect(caminhos(conjunto)).toEqual(['fasesDoJogo["sintetico-fase-a1"].conceitos: Referência a conceito inexistente: "sintetico-conceito-99".']);
  });

  it("o marco fica dentro do período da fase", () => {
    const conjunto = loadFixtures();
    conjunto.fasesDoJogo[0]!.periodo = { de: 1970, ate: 2011 };
    expect(caminhos(conjunto)).toEqual(['fasesDoJogo["sintetico-fase-a1"].periodo: O marco é de 1960, fora do período da fase (1970 a 2011).']);
  });

  it("a ordenação só vale quando as datas decidem a ordem", () => {
    const conjunto = loadFixtures();
    // O ano inteiro de 2011 contém o dia 15 de junho de 2011: as duas datas não decidem a ordem.
    conjunto.acontecimentos.find((item) => item.id === "sintetico-evento-07")!.data = { valor: "2011", precisao: "ano" };
    expect(caminhos(conjunto).some((linha) => linha.includes("não decidem a ordem"))).toBe(true);

    const semData = loadFixtures();
    const daA = semData.fasesDoJogo.find((item) => item.id === "sintetico-fase-a2")!;
    if (daA.atividade.tipo !== "ordem") throw new Error("a fixture mudou");
    daA.atividade.itens[0] = { tipo: "fato", id: "sintetico-fato-a1" };
    semData.fatosBiograficos[0]!.data = { tipo: "desconhecida" };
    expect(caminhos(semData)).toContain('fasesDoJogo["sintetico-fase-a2"].atividade.itens[0]: Registro sem data documentada não entra em uma ordenação.');
  });

  it("uma fase por posição, em sequência a partir de 1, em cada sala de cada pessoa", () => {
    const repetida = loadFixtures();
    repetida.fasesDoJogo.find((item) => item.id === "sintetico-fase-a2")!.ordem = 1;
    expect(caminhos(repetida)).toEqual(['fasesDoJogo["sintetico-fase-a2"].ordem: A posição 1 da sala "historico" já é da fase "sintetico-fase-a1".']);

    const salto = loadFixtures();
    salto.fasesDoJogo.find((item) => item.id === "sintetico-fase-a2")!.ordem = 3;
    expect(caminhos(salto)).toEqual(['fasesDoJogo["sintetico-fase-a2"].ordem: As fases de sintetico-pessoa-a:historico não estão numeradas em sequência a partir de 1 (esperava 2, veio 3).']);

    // A mesma posição em outra sala, ou na trilha de outra pessoa, não conflita.
    const outraSala = loadFixtures();
    const daA = outraSala.fasesDoJogo.find((item) => item.id === "sintetico-fase-a2")!;
    daA.sala = "economia";
    daA.ordem = 1;
    expect(checkIntegrity(outraSala)).toEqual([]);
  });

  it("fato biográfico depois da data de corte é acusado", () => {
    const conjunto = loadFixtures();
    conjunto.fatosBiograficos[0]!.data = { tipo: "data", valor: "2027", precisao: "ano" };
    expect(caminhos(conjunto).some((linha) => linha.startsWith('fatosBiograficos["sintetico-fato-a1"].data: Data posterior à data de corte'))).toBe(true);
  });
});

describe("elegibilidade", () => {
  it("o conjunto de teste publica as três coleções, na ordem de percurso", () => {
    const { conjunto, indices } = loadAtlasData();
    expect(conjunto.fasesDoJogo.map((item) => item.id)).toEqual(["sintetico-fase-a1", "sintetico-fase-a2", "sintetico-fase-b1"]);
    expect(indices.fasesDoJogo.porPessoaESala).toEqual({
      "sintetico-pessoa-a:historico": ["sintetico-fase-a1", "sintetico-fase-a2"],
      "sintetico-pessoa-b:historico": ["sintetico-fase-b1"],
    });
    expect(indices.fatosBiograficos.porPessoa).toEqual({ "sintetico-pessoa-a": ["sintetico-fato-a1"], "sintetico-pessoa-b": ["sintetico-fato-b1"] });
    expect(Object.keys(indices.conceitos.porId)).toEqual(["sintetico-conceito-01"]);
  });

  it("a ordem de percurso vem da posição, e não do identificador", () => {
    const base = baseContent();
    base.fasesDoJogo.find((item) => item.id === "teste-fase-a1")!.ordem = 2;
    base.fasesDoJogo.find((item) => item.id === "teste-fase-a2")!.ordem = 1;
    const { data } = createProject({ published: base }).result();
    expect(data?.indices.fasesDoJogo.porPessoaESala["teste-pessoa-a:historico"]).toEqual(["teste-fase-a2", "teste-fase-a1"]);
  });

  it("fase revisada que aponta um fato em rascunho é erro, e não some em silêncio", () => {
    const base = baseContent();
    base.fatosBiograficos[0]!.editorial = { estado: "rascunho", pendencias: ["Conferir o ano."] };
    const projeto = createProject({ published: base });
    expect(projeto.result().ok).toBe(false);
    // Um erro por lugar em que a fase aponta o fato: o marco, o bloco e a atividade. O relatório os ordena pelo campo.
    expect(errorLines(projeto)).toEqual([
      'content/published/fasesDoJogo.json · fase-do-jogo "teste-fase-a1" · atividade.referencias[0]: Depende de fato-biografico "teste-fato-a1", que não entra na publicação (estado "rascunho").',
      'content/published/fasesDoJogo.json · fase-do-jogo "teste-fase-a1" · explicacao[0].referencias[0]: Depende de fato-biografico "teste-fato-a1", que não entra na publicação (estado "rascunho").',
      'content/published/fasesDoJogo.json · fase-do-jogo "teste-fase-a1" · marco: Depende de fato-biografico "teste-fato-a1", que não entra na publicação (estado "rascunho").',
    ]);
  });

  it("fase em rascunho fica fora, com pendência, e o resto entra", () => {
    const base = baseContent();
    base.fasesDoJogo.find((item) => item.id === "teste-fase-b1")!.editorial = { estado: "rascunho", pendencias: ["Escrever a explicação."] };
    const { ok, data, excluidos } = createProject({ published: base }).result();
    expect(ok).toBe(true);
    expect(data?.conjunto.fasesDoJogo.map((item) => item.id)).toEqual(["teste-fase-a1", "teste-fase-a2"]);
    expect(excluidos.filter((item) => item.entidade === "fase-do-jogo")).toMatchObject([{ id: "teste-fase-b1", motivo: "nao-revisado", pendencias: ["Escrever a explicação."] }]);
  });

  it("registro de outra pessoa em uma fase revisada é erro", () => {
    const base = baseContent();
    base.fasesDoJogo.find((item) => item.id === "teste-fase-a1")!.explorar = [{ tipo: "acontecimento", id: "teste-evento-04" }];
    const projeto = createProject({ published: base });
    expect(errorLines(projeto)).toEqual([
      'content/published/fasesDoJogo.json · fase-do-jogo "teste-fase-a1" · explorar[0]: O registro "teste-evento-04" é de outra pessoa: uma fase só aponta registros da pessoa dela.',
    ]);
  });

  it("uma decisão apontada é um voto ou um ato; se não existe, a referência é acusada", () => {
    const base = baseContent();
    base.fasesDoJogo.find((item) => item.id === "teste-fase-a2")!.explorar = [{ tipo: "decisao", id: "teste-voto-99" }];
    const projeto = createProject({ published: base });
    expect(errorLines(projeto)).toEqual(['content/published/fasesDoJogo.json · fase-do-jogo "teste-fase-a2" · explorar[0]: Referência a voto inexistente: "teste-voto-99".']);
  });

  it("posição repetida entre duas fases revisadas é erro", () => {
    const base = baseContent();
    base.fasesDoJogo.find((item) => item.id === "teste-fase-a2")!.ordem = 1;
    const projeto = createProject({ published: base });
    expect(errorLines(projeto)).toContain(
      'content/published/fasesDoJogo.json · fase-do-jogo "teste-fase-a2" · ordem: A posição 1 da sala "historico" já é da fase "teste-fase-a1".',
    );
  });

  it("as fontes de um fato e de um conceito entram na publicação pelo uso", () => {
    const base = baseContent();
    // Uma fonte que só o conceito cita.
    base.fontes.push({ ...base.fontes[0]!, id: "teste-fonte-do-conceito", url: "https://exemplo.invalid/texto-oficial-de-teste" });
    base.conceitos[0]!.fontes[0]!.fonteId = "teste-fonte-do-conceito";
    const { data } = createProject({ published: base }).result();
    expect(data?.conjunto.fontes.map((item) => item.id)).toContain("teste-fonte-do-conceito");
  });
});

describe("recorte por pessoa", () => {
  it("leva só os fatos e as fases da pessoa, e os conceitos que as fases dela usam", () => {
    const data = loadAtlasData();
    const daA = sliceForPerson(data, "sintetico-pessoa-a");
    expect(daA.conjunto.fasesDoJogo.map((item) => item.id)).toEqual(["sintetico-fase-a1", "sintetico-fase-a2"]);
    expect(daA.conjunto.fatosBiograficos.map((item) => item.id)).toEqual(["sintetico-fato-a1"]);
    expect(daA.conjunto.conceitos.map((item) => item.id)).toEqual(["sintetico-conceito-01"]);
    const daB = sliceForPerson(data, "sintetico-pessoa-b");
    expect(daB.conjunto.fasesDoJogo.map((item) => item.id)).toEqual(["sintetico-fase-b1"]);
    expect(daB.conjunto.conceitos).toEqual([]);
    // As fontes do fato e do conceito vêm junto com eles.
    expect(daA.conjunto.fontes.map((item) => item.id)).toEqual(expect.arrayContaining(["sintetico-fonte-01", "sintetico-fonte-02"]));
  });
});

describe("revisão e publicação", () => {
  it("a lista de revisão humana traz cada fase com a explicação, a resposta certa e o que cada bloco aponta", () => {
    const texto = renderHumanReview(loadAtlasData());
    expect(texto).toContain("Conteúdo educativo do jogo: fases, fatos biográficos e conceitos (3 fases, 2 fatos biográficos e 1 conceitos)");
    expect(texto).toContain("· Trajetória · Fase 1: [SINTÉTICO] Fase de origem (1960 a 2011)");
    expect(texto).toContain("  1. [SINTÉTICO] Primeiro bloco fictício, sobre o fato de 1960. Aponta: `fato:sintetico-fato-a1`.");
    expect(texto).toContain("  - (certa) [SINTÉTICO] Opção fictícia certa.");
    expect(texto).toContain("- **Ordenação a conferir:** [SINTÉTICO] Qual destes registros de teste veio primeiro?");
    expect(texto).toContain("- **Divergência a conferir:** [SINTÉTICO] Dois documentos fictícios divergem no dia; o conjunto de teste adota só o ano.");
    expect(texto).toContain("### Conceito: [SINTÉTICO] Termo de teste");
    expect(texto).toContain("- Lacuna declarada: [SINTÉTICO] O conjunto de teste não pesquisou o período entre 1961 e 2010.");
  });

  it("a barreira de publicação conta as três coleções: texto de fase sem revisão humana bloqueia", () => {
    const { conjunto } = loadAtlasData();
    const site = { publicUrl: "https://atlas.exemplo.invalid", indexar: true, correctionChannel: { rotulo: "x", href: "mailto:x@exemplo.invalid" } };
    // As fixtures trazem um acontecimento com conferência assistida por IA, de propósito: é a única pendência de partida.
    const caminhosDe = (alvo: typeof conjunto) => releaseIssues(alvo, site, { licenca: true }).map((issue) => issue.caminho);
    expect(caminhosDe(conjunto)).toEqual(["acontecimentos.editorial.revisao"]);

    const semHumana = structuredClone(conjunto);
    semHumana.fasesDoJogo[0]!.editorial = { estado: "revisado", revisao: { tipo: "assistida-por-ia", revisadoPor: "Modelo de teste", revisadoEm: "2026-10-08" } };
    semHumana.conceitos[0]!.editorial = { estado: "revisado", revisao: { tipo: "assistida-por-ia", revisadoPor: "Modelo de teste", revisadoEm: "2026-10-08" } };
    expect(caminhosDe(semHumana)).toEqual(["acontecimentos.editorial.revisao", "conceitos.editorial.revisao", "fasesDoJogo.editorial.revisao"]);
  });
});
