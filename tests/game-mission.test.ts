// Regras de tarefa do jogo: recolher registros, saber quando a tarefa está
// feita, saber quando a saída abre (a tarefa cumprida e todos os registros
// do capítulo recolhidos), decidir a ordem pelas datas e responder as
// tarefas com resposta (ordem, documento, lugar) com explicação e nova
// tentativa, sem punição. As opções das tarefas de documento e de lugar saem
// dos próprios registros.

import { describe, expect, it } from "vitest";

import type { DataHistorica } from "@/lib/domain/types";
import {
  DISTRACTORS,
  collect,
  correctOrder,
  datesDecideOrder,
  hasAnswer,
  hasRequired,
  initialTaskState,
  isAnswerPending,
  isExitOpen,
  isTaskDone,
  missingRecords,
  placeLabel,
  placeOptions,
  requiredRecords,
  sourceOptions,
  submitOrder,
  submitPlace,
  submitSource,
  taskSignature,
} from "@/lib/game/mission";
import type { ChapterSpec, GameLocation, GameRecord, GameSource, TaskSpec, TaskState } from "@/lib/game/types";

const data = (valor: string, precisao: DataHistorica["precisao"]): DataHistorica => ({ valor, precisao });

const fonte = (id: string, titulo: string, evidencia = `O que ${titulo} sustenta.`): GameSource => ({
  id,
  titulo,
  autoria: `Instituição ${id}`,
  url: `https://exemplo.gov.br/${id}`,
  dataDocumento: { tipo: "data", valor: "2020-01-15", precisao: "dia" },
  acessadoEm: "2026-10-09",
  localizacao: `Seção sobre ${titulo}`,
  evidencia,
});

const registro = (id: string, titulo: string, quando: DataHistorica, fontes: GameSource[], localizacao: GameLocation = { tipo: "nacional" }): GameRecord => ({
  id,
  slug: id,
  titulo,
  data: quando,
  categoria: "eleicoes",
  resumo: `Resumo de ${titulo}.`,
  contexto: `Contexto de ${titulo}.`,
  localizacao,
  fontes,
  editorial: { estado: "revisado", revisao: { tipo: "assistida-por-ia", revisadoPor: "Fixture", revisadoEm: "2026-10-09" } },
  ordemEmAberto: false,
});

// Documentos: um próprio de cada registro e um compartilhado entre dois.
const DOC_FUNDACAO = fonte("doc-fundacao", "Ata da fundação", "A data e o lugar da fundação.");
const DOC_COMPARTILHADO = fonte("doc-compartilhado", "Biografia oficial");
const DOC_CONSTITUINTE = fonte("doc-constituinte", "Resultado da eleição de 1986");
const DOC_CANDIDATURA = fonte("doc-candidatura", "Resultado da eleição de 1989");
const DOC_OUTRO = fonte("doc-outro", "Documento de outro capítulo");

// Três registros de uma mesma trajetória, com precisões diferentes. Os títulos
// são orações, como os do atlas.
const REGISTROS: Record<string, GameRecord> = {
  fundacao: registro("fundacao", "Pessoa participa da fundação do partido", data("1980-02-10", "dia"), [DOC_FUNDACAO, DOC_COMPARTILHADO], {
    tipo: "lugares",
    lugares: ["São Bernardo do Campo"],
  }),
  constituinte: registro("constituinte", "Pessoa é eleita para a Constituinte", data("1986", "ano"), [DOC_CONSTITUINTE, DOC_COMPARTILHADO], {
    tipo: "lugares",
    lugares: ["Brasília"],
  }),
  candidatura: registro("candidatura", "Pessoa disputa a Presidência e não é eleita", data("1989", "ano"), [DOC_CANDIDATURA]),
  outro: registro("outro", "Pessoa é presa", data("1980", "ano"), [DOC_OUTRO], { tipo: "lugares", lugares: ["Curitiba"] }),
};

const TAREFA_REGISTRO: TaskSpec = { tipo: "registro", eventId: "fundacao" };
// A tarefa cita os dois fora da ordem cronológica de propósito: a ordem certa
// vem das datas, e não da posição na tarefa.
const TAREFA_ORDEM: Extract<TaskSpec, { tipo: "ordem" }> = { tipo: "ordem", eventIds: ["constituinte", "fundacao"] };
const TAREFA_FONTE: Extract<TaskSpec, { tipo: "fonte" }> = { tipo: "fonte", eventId: "fundacao" };
const TAREFA_LUGAR: Extract<TaskSpec, { tipo: "lugar" }> = { tipo: "lugar", eventId: "fundacao" };

const recolhidos = (...ids: string[]): TaskState => ids.reduce(collect, initialTaskState());

const capitulo = (tarefa: TaskSpec, eventIds: string[], id = "capitulo-de-teste"): ChapterSpec => ({
  id,
  personagem: "lula",
  numero: 1,
  titulo: "Capítulo de teste",
  periodo: { de: 1980, ate: 1989 },
  motivo: "Fixture dos testes.",
  objetivo: "Fixture dos testes.",
  eventIds,
  tarefa,
  cena: "sindicato",
  epoca: "inicio",
});

// Capítulos sobre os mesmos três registros: em um a tarefa pede um registro;
// no outro, a ordem de dois; nos demais, o documento e o lugar de um. Em
// todos sobra registro que a tarefa não pede, e é ele que separa "tarefa
// cumprida" de "saída aberta".
const CAPITULO_REGISTRO = capitulo(TAREFA_REGISTRO, ["fundacao", "constituinte", "candidatura"]);
const CAPITULO_ORDEM = capitulo(TAREFA_ORDEM, ["constituinte", "fundacao", "candidatura"]);
const CAPITULO_FONTE = capitulo(TAREFA_FONTE, ["fundacao", "constituinte", "candidatura"]);
const CAPITULO_LUGAR = capitulo(TAREFA_LUGAR, ["fundacao", "constituinte", "candidatura"]);
const CAPITULO_OUTRO = capitulo({ tipo: "registro", eventId: "outro" }, ["outro"], "outro-capitulo");

describe("recolher registros", () => {
  it("começa sem nada recolhido, sem resposta confirmada e sem tentativas", () => {
    expect(initialTaskState()).toEqual({ recolhidos: [], confirmada: false, tentativas: 0 });
  });

  it("guarda os registros na ordem em que foram recolhidos", () => {
    expect(recolhidos("constituinte", "fundacao").recolhidos).toEqual(["constituinte", "fundacao"]);
  });

  it("recolher o mesmo registro duas vezes não muda nada", () => {
    const umaVez = recolhidos("fundacao");
    expect(collect(umaVez, "fundacao")).toBe(umaVez);
    expect(collect(umaVez, "fundacao").recolhidos).toEqual(["fundacao"]);
  });

  it("não altera o estado recebido", () => {
    const inicial = initialTaskState();
    collect(inicial, "fundacao");
    expect(inicial.recolhidos).toEqual([]);
  });
});

describe("registros exigidos pela tarefa", () => {
  it("a tarefa de registro, a de documento e a de lugar exigem um; a de ordem exige os dois, na ordem em que os cita", () => {
    expect(requiredRecords(TAREFA_REGISTRO)).toEqual(["fundacao"]);
    expect(requiredRecords(TAREFA_FONTE)).toEqual(["fundacao"]);
    expect(requiredRecords(TAREFA_LUGAR)).toEqual(["fundacao"]);
    expect(requiredRecords(TAREFA_ORDEM)).toEqual(["constituinte", "fundacao"]);
  });

  it("só as tarefas de ordem, documento e lugar pedem resposta depois de recolher", () => {
    expect(hasAnswer(TAREFA_REGISTRO)).toBe(false);
    expect(hasAnswer(TAREFA_ORDEM)).toBe(true);
    expect(hasAnswer(TAREFA_FONTE)).toBe(true);
    expect(hasAnswer(TAREFA_LUGAR)).toBe(true);
  });

  it("hasRequired só é verdadeiro com todos os exigidos recolhidos", () => {
    expect(hasRequired(TAREFA_REGISTRO, initialTaskState())).toBe(false);
    expect(hasRequired(TAREFA_REGISTRO, recolhidos("candidatura"))).toBe(false);
    expect(hasRequired(TAREFA_REGISTRO, recolhidos("fundacao"))).toBe(true);

    expect(hasRequired(TAREFA_ORDEM, recolhidos("fundacao"))).toBe(false);
    expect(hasRequired(TAREFA_ORDEM, recolhidos("fundacao", "constituinte"))).toBe(true);
    expect(hasRequired(TAREFA_FONTE, recolhidos("constituinte"))).toBe(false);
    expect(hasRequired(TAREFA_FONTE, recolhidos("fundacao"))).toBe(true);
  });

  it("registros a mais não atrapalham", () => {
    expect(hasRequired(TAREFA_ORDEM, recolhidos("candidatura", "fundacao", "constituinte"))).toBe(true);
  });
});

describe("conclusão da tarefa", () => {
  it("a tarefa de registro conclui ao recolher o registro pedido, e só ele", () => {
    expect(isTaskDone(TAREFA_REGISTRO, initialTaskState())).toBe(false);
    expect(isTaskDone(TAREFA_REGISTRO, recolhidos("candidatura", "constituinte"))).toBe(false);
    expect(isTaskDone(TAREFA_REGISTRO, recolhidos("fundacao"))).toBe(true);
  });

  it("as tarefas com resposta não concluem só por recolher: precisam da resposta confirmada", () => {
    const ambos = recolhidos("constituinte", "fundacao");
    for (const tarefa of [TAREFA_ORDEM, TAREFA_FONTE, TAREFA_LUGAR]) {
      expect(isTaskDone(tarefa, ambos), tarefa.tipo).toBe(false);
      expect(isTaskDone(tarefa, { ...ambos, confirmada: true }), tarefa.tipo).toBe(true);
    }
  });

  it("a resposta fica pendente quando os registros pedidos foram recolhidos e ela ainda não foi confirmada", () => {
    expect(isAnswerPending(TAREFA_ORDEM, initialTaskState())).toBe(false);
    expect(isAnswerPending(TAREFA_ORDEM, recolhidos("fundacao"))).toBe(false);
    expect(isAnswerPending(TAREFA_ORDEM, recolhidos("fundacao", "constituinte"))).toBe(true);
    expect(isAnswerPending(TAREFA_ORDEM, { ...recolhidos("fundacao", "constituinte"), confirmada: true })).toBe(false);
    expect(isAnswerPending(TAREFA_FONTE, recolhidos("constituinte"))).toBe(false);
    expect(isAnswerPending(TAREFA_FONTE, recolhidos("fundacao"))).toBe(true);
    expect(isAnswerPending(TAREFA_LUGAR, recolhidos("fundacao"))).toBe(true);
    expect(isAnswerPending(TAREFA_LUGAR, { ...recolhidos("fundacao"), confirmada: true })).toBe(false);
  });

  it("a tarefa de registro nunca tem resposta pendente", () => {
    expect(isAnswerPending(TAREFA_REGISTRO, recolhidos("fundacao", "constituinte"))).toBe(false);
  });
});

describe("saída do capítulo", () => {
  it("faltam os registros ainda não recolhidos, na ordem do capítulo", () => {
    expect(missingRecords(CAPITULO_REGISTRO, initialTaskState())).toEqual(["fundacao", "constituinte", "candidatura"]);
    expect(missingRecords(CAPITULO_REGISTRO, recolhidos("constituinte"))).toEqual(["fundacao", "candidatura"]);
    expect(missingRecords(CAPITULO_REGISTRO, recolhidos("candidatura", "fundacao"))).toEqual(["constituinte"]);
    expect(missingRecords(CAPITULO_REGISTRO, recolhidos("candidatura", "fundacao", "constituinte"))).toEqual([]);
    // A ordem é a do capítulo, e não a da tarefa nem a em que foram recolhidos.
    expect(missingRecords(CAPITULO_ORDEM, recolhidos("fundacao"))).toEqual(["constituinte", "candidatura"]);
  });

  it("registro que o capítulo não cita não conta como recolhido dele", () => {
    expect(missingRecords(CAPITULO_REGISTRO, recolhidos("de-outro-capitulo"))).toEqual(["fundacao", "constituinte", "candidatura"]);
    expect(isExitOpen(CAPITULO_REGISTRO, recolhidos("fundacao", "constituinte", "de-outro-capitulo"))).toBe(false);
  });

  it("começa fechada", () => {
    for (const cap of [CAPITULO_REGISTRO, CAPITULO_ORDEM, CAPITULO_FONTE, CAPITULO_LUGAR]) expect(isExitOpen(cap, initialTaskState()), cap.tarefa.tipo).toBe(false);
  });

  it("cumprir a tarefa de registro não abre a saída enquanto falta recolher algum registro", () => {
    const soOPedido = recolhidos("fundacao");
    expect(isTaskDone(TAREFA_REGISTRO, soOPedido)).toBe(true);
    expect(isExitOpen(CAPITULO_REGISTRO, soOPedido)).toBe(false);
    expect(isExitOpen(CAPITULO_REGISTRO, recolhidos("fundacao", "constituinte"))).toBe(false);
  });

  it("recolher todos os registros abre a saída do capítulo de registro, em qualquer ordem", () => {
    expect(isExitOpen(CAPITULO_REGISTRO, recolhidos("fundacao", "constituinte", "candidatura"))).toBe(true);
    expect(isExitOpen(CAPITULO_REGISTRO, recolhidos("candidatura", "constituinte", "fundacao"))).toBe(true);
  });

  it("recolher os outros sem o registro pedido deixa a tarefa e a saída como estavam", () => {
    const semOPedido = recolhidos("constituinte", "candidatura");
    expect(isTaskDone(TAREFA_REGISTRO, semOPedido)).toBe(false);
    expect(isExitOpen(CAPITULO_REGISTRO, semOPedido)).toBe(false);
  });

  it("nos capítulos com resposta, recolher todos não abre a saída sem a resposta confirmada", () => {
    const todos = recolhidos("constituinte", "fundacao", "candidatura");
    expect(missingRecords(CAPITULO_ORDEM, todos)).toEqual([]);
    for (const cap of [CAPITULO_ORDEM, CAPITULO_FONTE, CAPITULO_LUGAR]) {
      expect(isAnswerPending(cap.tarefa, todos), cap.tarefa.tipo).toBe(true);
      expect(isExitOpen(cap, todos), cap.tarefa.tipo).toBe(false);
    }
  });

  it("a resposta confirmada não abre a saída enquanto falta o registro que a tarefa não pede", () => {
    const confirmada = submitOrder(TAREFA_ORDEM, recolhidos("constituinte", "fundacao"), ["fundacao", "constituinte"], REGISTROS).estado;
    expect(isTaskDone(TAREFA_ORDEM, confirmada)).toBe(true);
    expect(isExitOpen(CAPITULO_ORDEM, confirmada)).toBe(false);
    // O último registro abre a saída, tenha a resposta sido confirmada antes ou depois dele.
    expect(isExitOpen(CAPITULO_ORDEM, collect(confirmada, "candidatura"))).toBe(true);
    const depois = submitOrder(TAREFA_ORDEM, recolhidos("candidatura", "constituinte", "fundacao"), ["fundacao", "constituinte"], REGISTROS).estado;
    expect(isExitOpen(CAPITULO_ORDEM, depois)).toBe(true);

    const documento = submitSource(TAREFA_FONTE, recolhidos("fundacao"), CAPITULO_FONTE, REGISTROS, "doc-fundacao").estado;
    expect(isTaskDone(TAREFA_FONTE, documento)).toBe(true);
    expect(isExitOpen(CAPITULO_FONTE, documento)).toBe(false);
    expect(isExitOpen(CAPITULO_FONTE, collect(collect(documento, "constituinte"), "candidatura"))).toBe(true);
  });

  it("errar a resposta não abre a saída, mesmo com tudo recolhido", () => {
    const todos = recolhidos("constituinte", "fundacao", "candidatura");
    expect(isExitOpen(CAPITULO_ORDEM, submitOrder(TAREFA_ORDEM, todos, ["constituinte", "fundacao"], REGISTROS).estado)).toBe(false);
    expect(isExitOpen(CAPITULO_FONTE, submitSource(TAREFA_FONTE, todos, CAPITULO_FONTE, REGISTROS, "doc-constituinte").estado)).toBe(false);
    expect(isExitOpen(CAPITULO_LUGAR, submitPlace(TAREFA_LUGAR, todos, [CAPITULO_LUGAR], REGISTROS, "Brasília").estado)).toBe(false);
  });

  it("em capítulo cujos registros são só os da tarefa, cumprir a tarefa abre a saída", () => {
    expect(isExitOpen(capitulo(TAREFA_REGISTRO, ["fundacao"]), recolhidos("fundacao"))).toBe(true);
    const soOsDois = capitulo(TAREFA_ORDEM, ["constituinte", "fundacao"]);
    expect(isExitOpen(soOsDois, recolhidos("constituinte", "fundacao"))).toBe(false);
    expect(isExitOpen(soOsDois, { ...recolhidos("constituinte", "fundacao"), confirmada: true })).toBe(true);
  });

  it("não altera o estado recebido", () => {
    const estado = recolhidos("fundacao");
    missingRecords(CAPITULO_REGISTRO, estado);
    isExitOpen(CAPITULO_REGISTRO, estado);
    expect(estado).toEqual({ recolhidos: ["fundacao"], confirmada: false, tentativas: 0 });
  });
});

describe("as datas decidem a ordem", () => {
  it("ano e dia do mesmo ano não decidem: o ano inteiro contém o dia", () => {
    expect(datesDecideOrder(data("1980", "ano"), data("1980-02-10", "dia"))).toBe(false);
    expect(datesDecideOrder(data("1980-02-10", "dia"), data("1980", "ano"))).toBe(false);
  });

  it("anos diferentes decidem, em qualquer precisão", () => {
    expect(datesDecideOrder(data("1980-02-10", "dia"), data("1986", "ano"))).toBe(true);
    expect(datesDecideOrder(data("1986", "ano"), data("1980", "ano"))).toBe(true);
    expect(datesDecideOrder(data("2016", "ano"), data("2018", "ano"))).toBe(true);
    expect(datesDecideOrder(data("1979-03", "mes"), data("1980-02-10", "dia"))).toBe(true);
  });

  it("mês e dia dentro do mesmo mês não decidem", () => {
    expect(datesDecideOrder(data("1979-03", "mes"), data("1979-03-13", "dia"))).toBe(false);
    expect(datesDecideOrder(data("1979-03", "mes"), data("1979", "ano"))).toBe(false);
  });

  it("meses diferentes do mesmo ano decidem, e o mesmo dia não decide", () => {
    expect(datesDecideOrder(data("2019-02-06", "dia"), data("2019-11-19", "dia"))).toBe(true);
    expect(datesDecideOrder(data("1979-03", "mes"), data("1979-04-01", "dia"))).toBe(true);
    expect(datesDecideOrder(data("2019-02-06", "dia"), data("2019-02-06", "dia"))).toBe(false);
    // Dias diferentes do mesmo ano decidem: a fronteira entre capítulos pode ficar dentro de um ano.
    expect(datesDecideOrder(data("2025-02-19", "dia"), data("2025-12-05", "dia"))).toBe(true);
  });

  it("a resposta não depende da ordem dos argumentos", () => {
    const pares: [DataHistorica, DataHistorica][] = [
      [data("1980", "ano"), data("1980-02-10", "dia")],
      [data("1980-02-10", "dia"), data("1986", "ano")],
      [data("1979-03", "mes"), data("1979-03-13", "dia")],
    ];
    for (const [a, b] of pares) expect(datesDecideOrder(a, b)).toBe(datesDecideOrder(b, a));
  });
});

describe("ordem correta", () => {
  it("vem das datas, e não da posição na tarefa", () => {
    expect(correctOrder(TAREFA_ORDEM, REGISTROS)).toEqual(["fundacao", "constituinte"]);
    expect(correctOrder({ tipo: "ordem", eventIds: ["fundacao", "constituinte"] }, REGISTROS)).toEqual(["fundacao", "constituinte"]);
  });

  it("sem um dos registros, mantém a ordem da tarefa em vez de inventar", () => {
    const { constituinte, ...semConstituinte } = REGISTROS;
    expect(constituinte).toBeDefined();
    expect(correctOrder(TAREFA_ORDEM, semConstituinte)).toEqual(["constituinte", "fundacao"]);
  });
});

describe("responder a tarefa de ordem", () => {
  const pronta = recolhidos("constituinte", "fundacao");

  it("a ordem certa confirma a tarefa e explica com as duas datas", () => {
    const resposta = submitOrder(TAREFA_ORDEM, pronta, ["fundacao", "constituinte"], REGISTROS);
    expect(resposta.certo).toBe(true);
    expect(resposta.estado.confirmada).toBe(true);
    expect(resposta.estado.tentativas).toBe(1);
    expect(resposta.explicacao).toMatch(/^Ordem certa\./);
    expect(resposta.explicacao).toContain("10 de fevereiro de 1980");
    expect(resposta.explicacao).toContain("1986");
    expect(isTaskDone(TAREFA_ORDEM, resposta.estado)).toBe(true);
  });

  it("a ordem errada explica com as duas datas, diz qual veio antes e deixa tentar de novo", () => {
    const resposta = submitOrder(TAREFA_ORDEM, pronta, ["constituinte", "fundacao"], REGISTROS);
    expect(resposta.certo).toBe(false);
    expect(resposta.estado.confirmada).toBe(false);
    expect(resposta.explicacao).toMatch(/^Ainda não\./);
    expect(resposta.explicacao).toContain("Pessoa participa da fundação do partido (10 de fevereiro de 1980)");
    expect(resposta.explicacao).toContain("Pessoa é eleita para a Constituinte (1986)");
    // O título é uma oração: a data não entra em uma frase montada com ele.
    expect(resposta.explicacao).not.toContain(" é de ");
    expect(resposta.explicacao).toContain("Tente de novo");
    expect(resposta.explicacao).toContain("A data mais antiga vem primeiro");
    expect(resposta.explicacao).toContain("não há penalidade");
    // O registro mais antigo é citado primeiro.
    expect(resposta.explicacao.indexOf("10 de fevereiro de 1980")).toBeLessThan(resposta.explicacao.indexOf("1986"));
    // A tarefa continua aberta para outra tentativa.
    expect(isTaskDone(TAREFA_ORDEM, resposta.estado)).toBe(false);
    expect(isAnswerPending(TAREFA_ORDEM, resposta.estado)).toBe(true);
  });

  it("conta as tentativas, certas e erradas", () => {
    const primeira = submitOrder(TAREFA_ORDEM, pronta, ["constituinte", "fundacao"], REGISTROS);
    const segunda = submitOrder(TAREFA_ORDEM, primeira.estado, ["constituinte", "fundacao"], REGISTROS);
    const terceira = submitOrder(TAREFA_ORDEM, segunda.estado, ["fundacao", "constituinte"], REGISTROS);
    expect([primeira.certo, segunda.certo, terceira.certo]).toEqual([false, false, true]);
    expect(terceira.estado.tentativas).toBe(3);
    expect(terceira.estado.confirmada).toBe(true);
  });

  it("não pune: errar não tira registros recolhidos nem desfaz uma resposta já confirmada", () => {
    const errada = submitOrder(TAREFA_ORDEM, pronta, ["constituinte", "fundacao"], REGISTROS);
    expect(errada.estado.recolhidos).toEqual(pronta.recolhidos);
    expect(errada.explicacao).toContain("não há penalidade");

    const confirmada = submitOrder(TAREFA_ORDEM, pronta, ["fundacao", "constituinte"], REGISTROS).estado;
    const depoisDeErrar = submitOrder(TAREFA_ORDEM, confirmada, ["constituinte", "fundacao"], REGISTROS);
    expect(depoisDeErrar.certo).toBe(false);
    expect(depoisDeErrar.estado.confirmada).toBe(true);
  });

  it("uma resposta que repete o mesmo registro não é aceita", () => {
    expect(submitOrder(TAREFA_ORDEM, pronta, ["fundacao", "fundacao"], REGISTROS).certo).toBe(false);
  });

  it("não altera o estado recebido", () => {
    submitOrder(TAREFA_ORDEM, pronta, ["fundacao", "constituinte"], REGISTROS);
    expect(pronta).toEqual({ recolhidos: ["constituinte", "fundacao"], confirmada: false, tentativas: 0 });
  });
});

describe("opções da tarefa de documento", () => {
  it("a certa é o primeiro documento do registro; as erradas vêm de outros registros do capítulo e não são citadas pelo pedido", () => {
    const opcoes = sourceOptions(CAPITULO_FONTE, REGISTROS, "fundacao");
    expect(opcoes).toHaveLength(1 + DISTRACTORS);
    expect(opcoes.map((opcao) => opcao.id).sort()).toEqual(["doc-candidatura", "doc-constituinte", "doc-fundacao"]);
    // O documento compartilhado é citado pelo registro pedido: não serve de alternativa errada.
    expect(opcoes.some((opcao) => opcao.id === "doc-compartilhado")).toBe(false);
    const certa = opcoes.find((opcao) => opcao.id === "doc-fundacao")!;
    expect(certa.rotulo).toBe("Ata da fundação");
    expect(certa.detalhe).toBe("Instituição doc-fundacao");
  });

  it("é a mesma lista em toda chamada, e a certa não fica sempre em primeiro", () => {
    expect(sourceOptions(CAPITULO_FONTE, REGISTROS, "fundacao")).toEqual(sourceOptions(CAPITULO_FONTE, REGISTROS, "fundacao"));
    const primeiras = ["fundacao", "constituinte", "candidatura"].map((id) => sourceOptions(CAPITULO_FONTE, REGISTROS, id)[0]!.id);
    const certas = ["doc-fundacao", "doc-constituinte", "doc-candidatura"];
    expect(primeiras.some((id, indice) => id !== certas[indice])).toBe(true);
  });

  it("com menos documentos à mão, oferece os que há; sem registro ou sem fonte, não oferece nada", () => {
    const soDois = capitulo(TAREFA_FONTE, ["fundacao", "constituinte"]);
    expect(sourceOptions(soDois, REGISTROS, "fundacao").map((opcao) => opcao.id).sort()).toEqual(["doc-constituinte", "doc-fundacao"]);
    expect(sourceOptions(CAPITULO_FONTE, REGISTROS, "nao-existe")).toEqual([]);
    const semFonte = { ...REGISTROS, fundacao: { ...REGISTROS.fundacao!, fontes: [] } };
    expect(sourceOptions(CAPITULO_FONTE, semFonte, "fundacao")).toEqual([]);
  });
});

describe("responder a tarefa de documento", () => {
  const pronta = recolhidos("fundacao");

  it("qualquer documento citado pelo registro confirma a tarefa, e a explicação diz o que ele sustenta", () => {
    const primeiro = submitSource(TAREFA_FONTE, pronta, CAPITULO_FONTE, REGISTROS, "doc-fundacao");
    expect(primeiro.certo).toBe(true);
    expect(primeiro.estado.confirmada).toBe(true);
    expect(primeiro.estado.tentativas).toBe(1);
    expect(primeiro.explicacao).toMatch(/^Certo\./);
    expect(primeiro.explicacao).toContain("Ata da fundação");
    expect(primeiro.explicacao).toContain("A data e o lugar da fundação.");
    const segundo = submitSource(TAREFA_FONTE, pronta, CAPITULO_FONTE, REGISTROS, "doc-compartilhado");
    expect(segundo.certo).toBe(true);
  });

  it("o documento de outro registro explica de qual registro ele é, com a data, e deixa tentar de novo", () => {
    const resposta = submitSource(TAREFA_FONTE, pronta, CAPITULO_FONTE, REGISTROS, "doc-constituinte");
    expect(resposta.certo).toBe(false);
    expect(resposta.estado.confirmada).toBe(false);
    expect(resposta.explicacao).toMatch(/^Ainda não\./);
    expect(resposta.explicacao).toContain("Pessoa é eleita para a Constituinte (1986)");
    expect(resposta.explicacao).toContain("Tente de novo");
    expect(resposta.explicacao).toContain("não há penalidade");
    // A pista: quantos documentos o registro pedido cita, e onde ver a lista.
    expect(resposta.explicacao).toContain("2 documentos");
    expect(isAnswerPending(TAREFA_FONTE, resposta.estado)).toBe(true);
  });

  it("um documento que nenhum registro do capítulo cita também é explicado", () => {
    const resposta = submitSource(TAREFA_FONTE, pronta, CAPITULO_FONTE, REGISTROS, "doc-outro");
    expect(resposta.certo).toBe(false);
    expect(resposta.explicacao).toContain("não é citado por este registro");
  });

  it("não pune: errar não tira registros nem desfaz a confirmação, e as tentativas são contadas", () => {
    const certa = submitSource(TAREFA_FONTE, pronta, CAPITULO_FONTE, REGISTROS, "doc-fundacao").estado;
    const depois = submitSource(TAREFA_FONTE, certa, CAPITULO_FONTE, REGISTROS, "doc-candidatura");
    expect(depois.certo).toBe(false);
    expect(depois.estado.confirmada).toBe(true);
    expect(depois.estado.tentativas).toBe(2);
    expect(depois.estado.recolhidos).toEqual(["fundacao"]);
    expect(pronta).toEqual({ recolhidos: ["fundacao"], confirmada: false, tentativas: 0 });
  });
});

describe("opções da tarefa de lugar", () => {
  it("o rótulo do lugar é o documentado, ou a abrangência", () => {
    expect(placeLabel(REGISTROS.fundacao!)).toBe("São Bernardo do Campo");
    expect(placeLabel(REGISTROS.candidatura!)).toBe("Abrangência nacional");
    expect(placeLabel({ ...REGISTROS.candidatura!, localizacao: { tipo: "desconhecida" } })).toBe("Lugar não documentado");
    expect(placeLabel({ ...REGISTROS.candidatura!, localizacao: { tipo: "lugares", lugares: ["Araraquara", "Brasília"] } })).toBe("Araraquara e Brasília");
  });

  it("o certo é o lugar documentado; os errados vêm de outros registros da trajetória, sem repetir", () => {
    const opcoes = placeOptions([CAPITULO_LUGAR, CAPITULO_OUTRO], REGISTROS, "fundacao");
    expect(opcoes).toHaveLength(1 + DISTRACTORS);
    expect(opcoes.map((opcao) => opcao.id).sort()).toEqual(["Brasília", "Curitiba", "São Bernardo do Campo"]);
    for (const opcao of opcoes) expect(opcao.rotulo).toBe(opcao.id);
  });

  it("sem lugar documentado para o registro pedido, não há opções", () => {
    expect(placeOptions([CAPITULO_LUGAR], REGISTROS, "candidatura")).toEqual([]);
    expect(placeOptions([CAPITULO_LUGAR], REGISTROS, "nao-existe")).toEqual([]);
  });
});

describe("responder a tarefa de lugar", () => {
  const pronta = recolhidos("fundacao");
  const capitulos = [CAPITULO_LUGAR, CAPITULO_OUTRO];

  it("o lugar documentado confirma a tarefa", () => {
    const resposta = submitPlace(TAREFA_LUGAR, pronta, capitulos, REGISTROS, "São Bernardo do Campo");
    expect(resposta.certo).toBe(true);
    expect(resposta.estado.confirmada).toBe(true);
    expect(resposta.explicacao).toMatch(/^Certo\./);
    expect(resposta.explicacao).toContain("São Bernardo do Campo");
  });

  it("o lugar de outro registro explica de qual registro ele é, com a data, e deixa tentar de novo", () => {
    const resposta = submitPlace(TAREFA_LUGAR, pronta, capitulos, REGISTROS, "Curitiba");
    expect(resposta.certo).toBe(false);
    expect(resposta.estado.confirmada).toBe(false);
    expect(resposta.explicacao).toMatch(/^Ainda não\./);
    expect(resposta.explicacao).toContain("Pessoa é presa (1980)");
    expect(resposta.explicacao).toContain("não há penalidade");
    expect(isAnswerPending(TAREFA_LUGAR, resposta.estado)).toBe(true);
    const estranho = submitPlace(TAREFA_LUGAR, pronta, capitulos, REGISTROS, "Lugar nenhum");
    expect(estranho.certo).toBe(false);
    expect(estranho.explicacao).toContain("Esse lugar não é o deste registro.");
  });

  it("não altera o estado recebido e conta as tentativas", () => {
    const errada = submitPlace(TAREFA_LUGAR, pronta, capitulos, REGISTROS, "Brasília");
    const certa = submitPlace(TAREFA_LUGAR, errada.estado, capitulos, REGISTROS, "São Bernardo do Campo");
    expect(certa.estado.tentativas).toBe(2);
    expect(pronta).toEqual({ recolhidos: ["fundacao"], confirmada: false, tentativas: 0 });
  });
});

describe("assinatura da tarefa", () => {
  it("é o tipo e os identificadores que a tarefa pede", () => {
    expect(taskSignature({ tipo: "registro", eventId: "a" })).toBe("registro:a");
    expect(taskSignature({ tipo: "ordem", eventIds: ["a", "b"] })).toBe("ordem:a+b");
    expect(taskSignature({ tipo: "fonte", eventId: "a" })).toBe("fonte:a");
    expect(taskSignature({ tipo: "lugar", eventId: "a" })).toBe("lugar:a");
    // Trocar o tipo, ou o que a tarefa pede, muda a assinatura; a ordem dos identificadores também.
    expect(taskSignature({ tipo: "fonte", eventId: "a" })).not.toBe(taskSignature({ tipo: "lugar", eventId: "a" }));
    expect(taskSignature({ tipo: "ordem", eventIds: ["b", "a"] })).not.toBe(taskSignature({ tipo: "ordem", eventIds: ["a", "b"] }));
  });

  it("a resposta certa grava a assinatura da tarefa respondida; a errada não grava nada", () => {
    const pronta = recolhidos("fundacao", "constituinte");
    const errada = submitOrder(TAREFA_ORDEM, pronta, ["constituinte", "fundacao"], REGISTROS);
    expect(errada.estado.confirmada).toBe(false);
    expect("assinatura" in errada.estado).toBe(false);
    const certa = submitOrder(TAREFA_ORDEM, errada.estado, ["fundacao", "constituinte"], REGISTROS);
    expect(certa.estado.confirmada).toBe(true);
    expect(certa.estado.assinatura).toBe(taskSignature(TAREFA_ORDEM));
    // A assinatura segue a ordem em que a tarefa cita os registros, e não a cronológica.
    expect(certa.estado.assinatura).toBe("ordem:constituinte+fundacao");
  });
});
