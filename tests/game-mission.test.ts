// Regras de tarefa do jogo: recolher registros, saber quando a tarefa está
// feita, saber quando a saída abre (a tarefa cumprida e todos os registros
// do capítulo recolhidos), decidir a ordem pelas datas e responder a tarefa
// de ordem com explicação e nova tentativa, sem punição.

import { describe, expect, it } from "vitest";

import type { DataHistorica } from "@/lib/domain/types";
import {
  collect,
  correctOrder,
  datesDecideOrder,
  hasRequired,
  initialTaskState,
  isExitOpen,
  isOrderPending,
  isTaskDone,
  missingRecords,
  requiredRecords,
  submitOrder,
} from "@/lib/game/mission";
import type { ChapterSpec, GameRecord, TaskSpec, TaskState } from "@/lib/game/types";

const data = (valor: string, precisao: DataHistorica["precisao"]): DataHistorica => ({ valor, precisao });

const registro = (id: string, titulo: string, quando: DataHistorica): GameRecord => ({
  id,
  slug: id,
  titulo,
  data: quando,
  categoria: "eleicoes",
  resumo: `Resumo de ${titulo}.`,
  fontes: [{ titulo: "Documento", autoria: "Instituição", url: "https://exemplo.gov.br/documento" }],
  editorial: { estado: "revisado", revisao: { tipo: "assistida-por-ia", revisadoPor: "Fixture", revisadoEm: "2026-10-09" } },
  ordemEmAberto: false,
});

// Três registros de uma mesma trajetória, com precisões diferentes. Os títulos
// são orações, como os do atlas.
const REGISTROS: Record<string, GameRecord> = {
  fundacao: registro("fundacao", "Pessoa participa da fundação do partido", data("1980-02-10", "dia")),
  constituinte: registro("constituinte", "Pessoa é eleita para a Constituinte", data("1986", "ano")),
  candidatura: registro("candidatura", "Pessoa disputa a Presidência e não é eleita", data("1989", "ano")),
};

const TAREFA_REGISTRO: TaskSpec = { tipo: "registro", eventId: "fundacao" };
// A tarefa cita os dois fora da ordem cronológica de propósito: a ordem certa
// vem das datas, e não da posição na tarefa.
const TAREFA_ORDEM: Extract<TaskSpec, { tipo: "ordem" }> = { tipo: "ordem", eventIds: ["constituinte", "fundacao"] };

const recolhidos = (...ids: string[]): TaskState => ids.reduce(collect, initialTaskState());

const capitulo = (tarefa: TaskSpec, eventIds: string[]): ChapterSpec => ({
  id: "capitulo-de-teste",
  personagem: "lula",
  numero: 1,
  titulo: "Capítulo de teste",
  periodo: { de: 1980, ate: 1989 },
  motivo: "Fixture dos testes.",
  objetivo: "Fixture dos testes.",
  eventIds,
  tarefa,
  cena: "sindicato",
});

// Dois capítulos sobre os mesmos três registros: em um a tarefa pede um
// registro; no outro, a ordem de dois. Nos dois sobra registro que a tarefa
// não pede, e é ele que separa "tarefa cumprida" de "saída aberta".
const CAPITULO_REGISTRO = capitulo(TAREFA_REGISTRO, ["fundacao", "constituinte", "candidatura"]);
const CAPITULO_ORDEM = capitulo(TAREFA_ORDEM, ["constituinte", "fundacao", "candidatura"]);

describe("recolher registros", () => {
  it("começa sem nada recolhido, sem ordem confirmada e sem tentativas", () => {
    expect(initialTaskState()).toEqual({ recolhidos: [], ordemConfirmada: false, tentativas: 0 });
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
  it("a tarefa de registro exige um; a de ordem exige os dois, na ordem em que os cita", () => {
    expect(requiredRecords(TAREFA_REGISTRO)).toEqual(["fundacao"]);
    expect(requiredRecords(TAREFA_ORDEM)).toEqual(["constituinte", "fundacao"]);
  });

  it("hasRequired só é verdadeiro com todos os exigidos recolhidos", () => {
    expect(hasRequired(TAREFA_REGISTRO, initialTaskState())).toBe(false);
    expect(hasRequired(TAREFA_REGISTRO, recolhidos("candidatura"))).toBe(false);
    expect(hasRequired(TAREFA_REGISTRO, recolhidos("fundacao"))).toBe(true);

    expect(hasRequired(TAREFA_ORDEM, recolhidos("fundacao"))).toBe(false);
    expect(hasRequired(TAREFA_ORDEM, recolhidos("fundacao", "constituinte"))).toBe(true);
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

  it("a tarefa de ordem não conclui só por recolher os dois: precisa da ordem confirmada", () => {
    const ambos = recolhidos("constituinte", "fundacao");
    expect(isTaskDone(TAREFA_ORDEM, ambos)).toBe(false);
    expect(isTaskDone(TAREFA_ORDEM, { ...ambos, ordemConfirmada: true })).toBe(true);
  });

  it("a ordem fica pendente quando os dois foram recolhidos e ainda não foi confirmada", () => {
    expect(isOrderPending(TAREFA_ORDEM, initialTaskState())).toBe(false);
    expect(isOrderPending(TAREFA_ORDEM, recolhidos("fundacao"))).toBe(false);
    expect(isOrderPending(TAREFA_ORDEM, recolhidos("fundacao", "constituinte"))).toBe(true);
    expect(isOrderPending(TAREFA_ORDEM, { ...recolhidos("fundacao", "constituinte"), ordemConfirmada: true })).toBe(false);
  });

  it("a tarefa de registro nunca tem ordem pendente", () => {
    expect(isOrderPending(TAREFA_REGISTRO, recolhidos("fundacao", "constituinte"))).toBe(false);
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
    expect(isExitOpen(CAPITULO_REGISTRO, initialTaskState())).toBe(false);
    expect(isExitOpen(CAPITULO_ORDEM, initialTaskState())).toBe(false);
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

  it("no capítulo de ordem, recolher todos não abre a saída sem a ordem confirmada", () => {
    const todos = recolhidos("constituinte", "fundacao", "candidatura");
    expect(missingRecords(CAPITULO_ORDEM, todos)).toEqual([]);
    expect(isOrderPending(TAREFA_ORDEM, todos)).toBe(true);
    expect(isExitOpen(CAPITULO_ORDEM, todos)).toBe(false);
  });

  it("no capítulo de ordem, a ordem confirmada não abre a saída enquanto falta o registro que a tarefa não pede", () => {
    const confirmada = submitOrder(TAREFA_ORDEM, recolhidos("constituinte", "fundacao"), ["fundacao", "constituinte"], REGISTROS).estado;
    expect(isTaskDone(TAREFA_ORDEM, confirmada)).toBe(true);
    expect(isExitOpen(CAPITULO_ORDEM, confirmada)).toBe(false);
    // O último registro abre a saída, tenha a ordem sido confirmada antes ou depois dele.
    expect(isExitOpen(CAPITULO_ORDEM, collect(confirmada, "candidatura"))).toBe(true);
    const depois = submitOrder(TAREFA_ORDEM, recolhidos("candidatura", "constituinte", "fundacao"), ["fundacao", "constituinte"], REGISTROS).estado;
    expect(isExitOpen(CAPITULO_ORDEM, depois)).toBe(true);
  });

  it("errar a ordem não abre a saída, mesmo com tudo recolhido", () => {
    const errada = submitOrder(TAREFA_ORDEM, recolhidos("constituinte", "fundacao", "candidatura"), ["constituinte", "fundacao"], REGISTROS).estado;
    expect(isExitOpen(CAPITULO_ORDEM, errada)).toBe(false);
  });

  it("em capítulo cujos registros são só os da tarefa, cumprir a tarefa abre a saída", () => {
    expect(isExitOpen(capitulo(TAREFA_REGISTRO, ["fundacao"]), recolhidos("fundacao"))).toBe(true);
    const soOsDois = capitulo(TAREFA_ORDEM, ["constituinte", "fundacao"]);
    expect(isExitOpen(soOsDois, recolhidos("constituinte", "fundacao"))).toBe(false);
    expect(isExitOpen(soOsDois, { ...recolhidos("constituinte", "fundacao"), ordemConfirmada: true })).toBe(true);
  });

  it("não altera o estado recebido", () => {
    const estado = recolhidos("fundacao");
    missingRecords(CAPITULO_REGISTRO, estado);
    isExitOpen(CAPITULO_REGISTRO, estado);
    expect(estado).toEqual({ recolhidos: ["fundacao"], ordemConfirmada: false, tentativas: 0 });
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
    expect(resposta.estado.ordemConfirmada).toBe(true);
    expect(resposta.estado.tentativas).toBe(1);
    expect(resposta.explicacao).toMatch(/^Ordem certa\./);
    expect(resposta.explicacao).toContain("10 de fevereiro de 1980");
    expect(resposta.explicacao).toContain("1986");
    expect(isTaskDone(TAREFA_ORDEM, resposta.estado)).toBe(true);
  });

  it("a ordem errada explica com as duas datas, diz qual veio antes e deixa tentar de novo", () => {
    const resposta = submitOrder(TAREFA_ORDEM, pronta, ["constituinte", "fundacao"], REGISTROS);
    expect(resposta.certo).toBe(false);
    expect(resposta.estado.ordemConfirmada).toBe(false);
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
    expect(isOrderPending(TAREFA_ORDEM, resposta.estado)).toBe(true);
  });

  it("conta as tentativas, certas e erradas", () => {
    const primeira = submitOrder(TAREFA_ORDEM, pronta, ["constituinte", "fundacao"], REGISTROS);
    const segunda = submitOrder(TAREFA_ORDEM, primeira.estado, ["constituinte", "fundacao"], REGISTROS);
    const terceira = submitOrder(TAREFA_ORDEM, segunda.estado, ["fundacao", "constituinte"], REGISTROS);
    expect([primeira.certo, segunda.certo, terceira.certo]).toEqual([false, false, true]);
    expect(terceira.estado.tentativas).toBe(3);
    expect(terceira.estado.ordemConfirmada).toBe(true);
  });

  it("não pune: errar não tira registros recolhidos nem desfaz uma ordem já confirmada", () => {
    const errada = submitOrder(TAREFA_ORDEM, pronta, ["constituinte", "fundacao"], REGISTROS);
    expect(errada.estado.recolhidos).toEqual(pronta.recolhidos);
    expect(errada.explicacao).toContain("não há penalidade");

    const confirmada = submitOrder(TAREFA_ORDEM, pronta, ["fundacao", "constituinte"], REGISTROS).estado;
    const depoisDeErrar = submitOrder(TAREFA_ORDEM, confirmada, ["constituinte", "fundacao"], REGISTROS);
    expect(depoisDeErrar.certo).toBe(false);
    expect(depoisDeErrar.estado.ordemConfirmada).toBe(true);
  });

  it("uma resposta que repete o mesmo registro não é aceita", () => {
    expect(submitOrder(TAREFA_ORDEM, pronta, ["fundacao", "fundacao"], REGISTROS).certo).toBe(false);
  });

  it("não altera o estado recebido", () => {
    submitOrder(TAREFA_ORDEM, pronta, ["fundacao", "constituinte"], REGISTROS);
    expect(pronta).toEqual({ recolhidos: ["constituinte", "fundacao"], ordemConfirmada: false, tentativas: 0 });
  });
});
