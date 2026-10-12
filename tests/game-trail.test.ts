// As regras da trilha (src/lib/game/trail.ts, D-133): abrir, responder, ler a
// explicação no lugar de responder e continuar. Tudo sobre um conteúdo de
// teste pequeno, escrito aqui: as regras são funções puras.

import { describe, expect, it } from "vitest";

import {
  activitySignature,
  answerOrder,
  answerQuestion,
  concludeByExplanation,
  correctOrder,
  decisiveData,
  digestOf,
  displayOrder,
  initialPhaseProgress,
  isPhaseDone,
  isResolved,
  markSeen,
  orderDates,
  orderingDisplay,
  phaseRefs,
  phaseStatus,
  refDate,
  refKey,
  refShortLabel,
  refTitle,
  signaturesOf,
  type TrailContent,
} from "@/lib/game/trail";
import type { GameRecord, PhaseProgress, PhaseSpec } from "@/lib/game/types";

const REVISAO = { estado: "revisado", revisao: { tipo: "assistida-por-ia", revisadoPor: "Modelo de teste", revisadoEm: "2026-10-08" } } as const;

const registro = (id: string, titulo: string, valor: string, precisao: "dia" | "mes" | "ano"): GameRecord => ({
  id,
  slug: id,
  titulo,
  data: { valor, precisao },
  categoria: "eleicoes",
  resumo: "Resumo de teste.",
  contexto: "Contexto de teste.",
  localizacao: { tipo: "nacional" },
  fontes: [],
  editorial: REVISAO,
  ordemEmAberto: false,
});

const CONTEUDO: TrailContent = {
  registros: { e1: registro("e1", "Primeiro acontecimento de teste", "1980-02-10", "dia"), e2: registro("e2", "Segundo acontecimento de teste", "1986", "ano") },
  decisoes: {},
  fatos: {
    f1: { id: "f1", tipo: "atuacao-sindical", titulo: "Fato de teste com data", data: { valor: "1969", precisao: "ano" }, texto: "Texto de teste.", divergencia: null, fontes: [], editorial: REVISAO },
    f0: { id: "f0", tipo: "formacao", titulo: "Fato de teste sem data", data: null, texto: "Texto de teste.", divergencia: null, fontes: [], editorial: REVISAO },
  },
  conceitos: { c1: { id: "c1", termo: "Termo de teste", definicao: "Definição de teste.", simplificacao: null, fontes: [], editorial: REVISAO } },
  posicoes: { m1: { id: "m1", natureza: "mandato", titulo: "Cargo de teste", detalhe: "Instituição de teste", periodo: "1987 a 1991", fontes: [], editorial: REVISAO } },
  propostas: { p1: { id: "p1", tema: "economia", eleicao: 2026, texto: "O documento propõe uma medida de teste.", ressalva: null, fontes: [], editorial: REVISAO } },
};

type Fase = Pick<PhaseSpec, "id" | "marco" | "explicacao" | "atividade" | "explorar">;

const PERGUNTA: Fase = {
  id: "fase-pergunta",
  marco: { tipo: "fato", id: "f1" },
  explicacao: [
    { texto: "Bloco um.", referencias: [{ tipo: "fato", id: "f1" }, { tipo: "conceito", id: "c1" }] },
    { texto: "Bloco dois.", referencias: [{ tipo: "acontecimento", id: "e1" }, { tipo: "fato", id: "f1" }] },
  ],
  atividade: {
    tipo: "pergunta",
    enunciado: "Qual das três?",
    opcoes: [
      { id: "a", texto: "Primeira opção." },
      { id: "b", texto: "Segunda opção." },
      { id: "c", texto: "Terceira opção." },
    ],
    correta: "b",
    explicacao: "A segunda, pelo que a fase disse.",
    referencias: [{ tipo: "acontecimento", id: "e1" }],
  },
  explorar: [{ tipo: "mandato", id: "m1" }, { tipo: "proposta", id: "p1" }],
};

const ORDEM: Fase = {
  id: "fase-ordem",
  marco: { tipo: "acontecimento", id: "e2" },
  explicacao: [{ texto: "Bloco único.", referencias: [{ tipo: "acontecimento", id: "e2" }] }],
  atividade: {
    tipo: "ordem",
    enunciado: "Ponha em ordem.",
    itens: [{ tipo: "acontecimento", id: "e2" }, { tipo: "fato", id: "f1" }, { tipo: "acontecimento", id: "e1" }],
    explicacao: "Primeiro o fato, depois os dois acontecimentos.",
  },
  explorar: [],
};

const ORDEM_CERTA = ["fato:f1", "acontecimento:e1", "acontecimento:e2"];
const novo = (): PhaseProgress => initialPhaseProgress();

describe("referências de uma fase", () => {
  it("a chave junta o tipo e o identificador, e o título vem do registro apontado", () => {
    expect(refKey({ tipo: "acontecimento", id: "e1" })).toBe("acontecimento:e1");
    expect(refTitle({ tipo: "acontecimento", id: "e1" }, CONTEUDO)).toBe("Primeiro acontecimento de teste");
    expect(refTitle({ tipo: "fato", id: "f1" }, CONTEUDO)).toBe("Fato de teste com data");
    expect(refTitle({ tipo: "conceito", id: "c1" }, CONTEUDO)).toBe("Termo de teste");
    expect(refTitle({ tipo: "mandato", id: "m1" }, CONTEUDO)).toBe("Cargo de teste");
    // A proposta não tem título: a frase é o que se mostra, e a etiqueta curta diz a área.
    expect(refTitle({ tipo: "proposta", id: "p1" }, CONTEUDO)).toBe("O documento propõe uma medida de teste.");
    expect(refShortLabel({ tipo: "proposta", id: "p1" }, CONTEUDO)).toBe("Proposta registrada no TSE: Economia");
    expect(refShortLabel({ tipo: "fato", id: "f1" }, CONTEUDO)).toBe("Fato de teste com data");
  });

  it("registro que não veio no conteúdo não resolve, e não vira texto inventado", () => {
    expect(refTitle({ tipo: "acontecimento", id: "nao-existe" }, CONTEUDO)).toBeNull();
    expect(refShortLabel({ tipo: "proposta", id: "nao-existe" }, CONTEUDO)).toBeNull();
    expect(isResolved({ tipo: "decisao", id: "nao-existe" }, CONTEUDO)).toBe(false);
    expect(isResolved({ tipo: "fato", id: "f0" }, CONTEUDO)).toBe(true);
  });

  it("só acontecimento, decisão e fato têm data; fato sem data documentada fica sem data", () => {
    expect(refDate({ tipo: "acontecimento", id: "e1" }, CONTEUDO)).toEqual({ valor: "1980-02-10", precisao: "dia" });
    expect(refDate({ tipo: "fato", id: "f1" }, CONTEUDO)).toEqual({ valor: "1969", precisao: "ano" });
    expect(refDate({ tipo: "fato", id: "f0" }, CONTEUDO)).toBeNull();
    expect(refDate({ tipo: "mandato", id: "m1" }, CONTEUDO)).toBeNull();
    expect(refDate({ tipo: "proposta", id: "p1" }, CONTEUDO)).toBeNull();
    expect(refDate({ tipo: "conceito", id: "c1" }, CONTEUDO)).toBeNull();
  });

  it("os registros de uma fase saem sem repetição, na ordem: marco, explicação, atividade, explorar", () => {
    expect(phaseRefs(PERGUNTA).map(refKey)).toEqual(["fato:f1", "conceito:c1", "acontecimento:e1", "mandato:m1", "proposta:p1"]);
    expect(phaseRefs(ORDEM).map(refKey)).toEqual(["acontecimento:e2", "fato:f1", "acontecimento:e1"]);
  });
});

describe("estado de uma fase", () => {
  it("começa nova, fica vista ao abrir e concluída ao terminar", () => {
    expect(phaseStatus(undefined)).toBe("nova");
    expect(phaseStatus(novo())).toBe("nova");
    const vista = markSeen(novo());
    expect(vista).toEqual({ vista: true, tentativas: 0 });
    expect(phaseStatus(vista)).toBe("vista");
    // Abrir de novo não muda nada: é o mesmo estado.
    expect(markSeen(vista)).toBe(vista);
    expect(isPhaseDone(vista)).toBe(false);
    expect(isPhaseDone(undefined)).toBe(false);
  });

  it("a resposta errada conta a tentativa e não tira nada: a fase segue aberta, sem conclusão", () => {
    const antes = markSeen(novo());
    const { estado, certo } = answerQuestion(PERGUNTA, antes, "a", CONTEUDO);
    expect(certo).toBe(false);
    expect(estado).toEqual({ vista: true, tentativas: 1 });
    expect(isPhaseDone(estado)).toBe(false);
    // O estado recebido não muda.
    expect(antes).toEqual({ vista: true, tentativas: 0 });
    // Uma opção que a fase não tem é resposta errada, e não erro na tela.
    expect(answerQuestion(PERGUNTA, estado, "z", CONTEUDO)).toEqual({ certo: false, estado: { vista: true, tentativas: 2 } });
  });

  it("a resposta certa conclui a fase, com a assinatura da atividade; errar antes não pesa", () => {
    const depoisDeDoisErros = answerQuestion(PERGUNTA, answerQuestion(PERGUNTA, novo(), "a", CONTEUDO).estado, "c", CONTEUDO).estado;
    const { estado, certo } = answerQuestion(PERGUNTA, depoisDeDoisErros, "b", CONTEUDO);
    expect(certo).toBe(true);
    expect(estado).toEqual({ vista: true, tentativas: 3, concluida: "resposta", assinatura: activitySignature(PERGUNTA, CONTEUDO) });
    expect(phaseStatus(estado)).toBe("concluida");
  });

  it("ler a explicação e continuar conclui a fase sem resposta e sem contar tentativa", () => {
    const lida = concludeByExplanation(PERGUNTA, novo(), CONTEUDO);
    expect(lida).toEqual({ vista: true, tentativas: 0, concluida: "explicacao", assinatura: activitySignature(PERGUNTA, CONTEUDO) });
    // Depois de um erro, ler a explicação também conclui; as tentativas ficam.
    const depoisDoErro = concludeByExplanation(PERGUNTA, answerQuestion(PERGUNTA, novo(), "a", CONTEUDO).estado, CONTEUDO);
    expect(depoisDoErro.concluida).toBe("explicacao");
    expect(depoisDoErro.tentativas).toBe(1);
    // Quem já respondeu certo continua com a resposta registrada.
    const respondida = answerQuestion(PERGUNTA, novo(), "b", CONTEUDO).estado;
    expect(concludeByExplanation(PERGUNTA, respondida, CONTEUDO)).toBe(respondida);
    // Quem leu a explicação e depois respondeu certo passa a ter a resposta.
    expect(answerQuestion(PERGUNTA, lida, "b", CONTEUDO).estado.concluida).toBe("resposta");
  });

  it("concluir de novo tira a marca de fase reaberta", () => {
    const reaberta: PhaseProgress = { vista: true, tentativas: 2, reaberta: true };
    expect(answerQuestion(PERGUNTA, reaberta, "b", CONTEUDO).estado.reaberta).toBeUndefined();
    expect(concludeByExplanation(PERGUNTA, reaberta, CONTEUDO).reaberta).toBeUndefined();
    // O erro não tira a marca: a fase continua reaberta.
    expect(answerQuestion(PERGUNTA, reaberta, "a", CONTEUDO).estado.reaberta).toBe(true);
  });

  it("cada tipo de atividade só aceita a resposta do próprio tipo", () => {
    expect(() => answerQuestion(ORDEM, novo(), "a", CONTEUDO)).toThrow("não é uma pergunta");
    expect(() => answerOrder(PERGUNTA, novo(), [], CONTEUDO)).toThrow("não é uma ordenação");
  });
});

describe("ordenação", () => {
  const atividade = ORDEM.atividade as Extract<PhaseSpec["atividade"], { tipo: "ordem" }>;

  it("a ordem certa vem das datas dos registros, e não da ordem em que a fase os escreveu", () => {
    expect(correctOrder(atividade, CONTEUDO)).toEqual(ORDEM_CERTA);
    expect(orderDates(atividade, CONTEUDO)).toEqual([
      { chave: "fato:f1", titulo: "Fato de teste com data", data: "1969" },
      { chave: "acontecimento:e1", titulo: "Primeiro acontecimento de teste", data: "10 de fevereiro de 1980" },
      { chave: "acontecimento:e2", titulo: "Segundo acontecimento de teste", data: "1986" },
    ]);
  });

  it("só a ordem inteira e certa conclui; ordem trocada, incompleta ou com sobra é resposta errada", () => {
    expect(answerOrder(ORDEM, novo(), ORDEM_CERTA, CONTEUDO)).toMatchObject({ certo: true, estado: { concluida: "resposta", tentativas: 1 } });
    expect(answerOrder(ORDEM, novo(), [...ORDEM_CERTA].reverse(), CONTEUDO)).toEqual({ certo: false, estado: { vista: true, tentativas: 1 } });
    expect(answerOrder(ORDEM, novo(), ORDEM_CERTA.slice(0, 2), CONTEUDO).certo).toBe(false);
    expect(answerOrder(ORDEM, novo(), [...ORDEM_CERTA, "fato:f0"], CONTEUDO).certo).toBe(false);
  });

  it("registro sem data, que o conjunto não deixa publicar em ordenação, fica no fim sem quebrar a tela", () => {
    const comSemData = { ...atividade, itens: [{ tipo: "fato", id: "f0" } as const, ...atividade.itens] };
    expect(correctOrder(comSemData, CONTEUDO)).toEqual([...ORDEM_CERTA, "fato:f0"]);
    expect(orderDates(comSemData, CONTEUDO).at(-1)).toEqual({ chave: "fato:f0", titulo: "Fato de teste sem data", data: "sem data documentada" });
  });
});

describe("assinatura da atividade", () => {
  it("é determinística e curta: identificador da fase, tipo e oito dígitos", () => {
    expect(activitySignature(PERGUNTA, CONTEUDO)).toMatch(/^fase-pergunta:pergunta@[0-9a-f]{8}$/);
    expect(activitySignature(ORDEM, CONTEUDO)).toMatch(/^fase-ordem:ordem@[0-9a-f]{8}$/);
    expect(activitySignature(PERGUNTA, CONTEUDO)).toBe(activitySignature(structuredClone(PERGUNTA), CONTEUDO));
    expect(digestOf({ a: 1 })).toBe(digestOf({ a: 1 }));
    expect(digestOf({ a: 1 })).not.toBe(digestOf({ a: 2 }));
    expect(digestOf(undefined)).toMatch(/^[0-9a-f]{8}$/);
    expect(signaturesOf([PERGUNTA, ORDEM], CONTEUDO)).toEqual({ "fase-pergunta": activitySignature(PERGUNTA, CONTEUDO), "fase-ordem": activitySignature(ORDEM, CONTEUDO) });
  });

  it("mudar a redação não muda a assinatura: corrigir um texto não reabre a resposta de ninguém", () => {
    const reescrita = structuredClone(PERGUNTA);
    if (reescrita.atividade.tipo !== "pergunta") throw new Error("a fase de teste mudou");
    reescrita.atividade.enunciado = "Outra redação?";
    reescrita.atividade.explicacao = "Outra explicação.";
    reescrita.atividade.opcoes[0]!.texto = "Outro texto.";
    reescrita.atividade.opcoes.reverse();
    expect(activitySignature(reescrita, CONTEUDO)).toBe(activitySignature(PERGUNTA, CONTEUDO));
  });

  it("mudar o que decide a resposta muda a assinatura: a opção certa, as opções, os registros ou as datas deles", () => {
    const original = activitySignature(PERGUNTA, CONTEUDO);
    const outraCerta = structuredClone(PERGUNTA);
    if (outraCerta.atividade.tipo !== "pergunta") throw new Error("a fase de teste mudou");
    outraCerta.atividade.correta = "a";
    expect(activitySignature(outraCerta, CONTEUDO)).not.toBe(original);
    const outraOpcao = structuredClone(PERGUNTA);
    if (outraOpcao.atividade.tipo !== "pergunta") throw new Error("a fase de teste mudou");
    outraOpcao.atividade.opcoes[2]!.id = "d";
    expect(activitySignature(outraOpcao, CONTEUDO)).not.toBe(original);

    const outraData: TrailContent = { ...CONTEUDO, registros: { ...CONTEUDO.registros, e2: registro("e2", "Segundo acontecimento de teste", "1987", "ano") } };
    expect(activitySignature(ORDEM, outraData)).not.toBe(activitySignature(ORDEM, CONTEUDO));
    // Os pares vêm pela chave, e não na ordem em que a fase escreve os itens.
    expect(decisiveData(ORDEM.atividade, CONTEUDO)).toEqual([
      ["acontecimento:e1", { valor: "1980-02-10", precisao: "dia" }],
      ["acontecimento:e2", { valor: "1986", precisao: "ano" }],
      ["fato:f1", { valor: "1969", precisao: "ano" }],
    ]);
  });

  it("trocar a ordem em que a fase escreve os itens de uma ordenação não muda a assinatura: a resposta vem das datas", () => {
    const reescrita = structuredClone(ORDEM);
    if (reescrita.atividade.tipo !== "ordem") throw new Error("a fase de teste mudou");
    reescrita.atividade.itens.reverse();
    expect(correctOrder(reescrita.atividade, CONTEUDO)).toEqual(ORDEM_CERTA);
    expect(activitySignature(reescrita, CONTEUDO)).toBe(activitySignature(ORDEM, CONTEUDO));
  });
});

describe("ordem de exibição das alternativas", () => {
  const opcoes = ["a", "b", "c"];

  it("é estável: a mesma fase mostra sempre a mesma ordem, com as mesmas opções", () => {
    const primeira = displayOrder("fase-x", opcoes, (item) => item);
    expect(displayOrder("fase-x", opcoes, (item) => item)).toEqual(primeira);
    expect(displayOrder("fase-x", [...opcoes].reverse(), (item) => item)).toEqual(primeira);
    expect([...primeira].sort()).toEqual(opcoes);
  });

  it("não depende de como o conteúdo foi escrito: fases diferentes embaralham de jeitos diferentes", () => {
    const ordens = new Set(Array.from({ length: 12 }, (_, indice) => displayOrder(`fase-${indice}`, opcoes, (item) => item).join("")));
    expect(ordens.size).toBeGreaterThan(1);
  });

  it("a ordenação nunca aparece já resolvida: quando o embaralhamento cai na ordem certa, a lista gira uma posição", () => {
    const comId = (id: string): Fase => ({ ...ORDEM, id });
    // Entre muitas fases de teste, alguma cai na ordem certa pelo embaralhamento puro: é o caso que a regra existe para tratar.
    const fases = Array.from({ length: 60 }, (_, indice) => comId(`fase-de-ordem-${indice}`));
    const caidasNaCerta = fases.filter((fase) => displayOrder(fase.id, fase.atividade.tipo === "ordem" ? fase.atividade.itens : [], refKey).map(refKey).join() === ORDEM_CERTA.join());
    expect(caidasNaCerta.length).toBeGreaterThan(0);
    for (const fase of fases) {
      const exibidos = orderingDisplay(fase, CONTEUDO).map(refKey);
      expect(exibidos.join(), fase.id).not.toBe(ORDEM_CERTA.join());
      expect([...exibidos].sort(), fase.id).toEqual([...ORDEM_CERTA].sort());
      // Estável: a mesma fase mostra sempre a mesma ordem.
      expect(orderingDisplay(fase, CONTEUDO).map(refKey), fase.id).toEqual(exibidos);
    }
    expect(() => orderingDisplay(PERGUNTA, CONTEUDO)).toThrow("não é uma ordenação");
  });
});
