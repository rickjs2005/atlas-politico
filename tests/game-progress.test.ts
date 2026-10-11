// Progresso do jogador: os três estados de capítulo, as transições, a leitura
// tolerante do formato salvo, a migração das versões 1 e 2 e a assinatura da
// tarefa respondida, que impede uma resposta antiga de concluir uma tarefa
// que mudou. Um capítulo só é concluído com a saída aberta: a tarefa cumprida
// e todos os registros do capítulo recolhidos.

import { describe, expect, it } from "vitest";

import { chaptersOf } from "@/lib/game/chapters";
import { legacyTaskSignature, requiredRecords, taskSignature, type TaskContent } from "@/lib/game/mission";
import {
  LEGACY_SIGNATURES,
  READABLE_VERSIONS,
  chapterStatus,
  completeChapter,
  countCompleted,
  currentChapter,
  initialProgress,
  isTrajectoryComplete,
  parseProgress,
  taskStateOf,
  withTaskState,
  type LegacySignatures,
} from "@/lib/game/progress";
import { PROGRESS_VERSION, type ChapterSpec, type GameRecord, type GameSource, type PlayerProgress, type TaskSpec, type TaskState } from "@/lib/game/types";

const capitulo = (numero: number, tarefa: TaskSpec, outros: string[] = []): ChapterSpec => ({
  id: `teste-${numero}`,
  personagem: "lula",
  sala: "historico",
  numero,
  titulo: `Capítulo ${numero}`,
  periodo: { de: 1970 + numero, ate: 1970 + numero },
  motivo: "Fixture dos testes.",
  objetivo: "Fixture dos testes.",
  eventIds: [...requiredRecords(tarefa), ...outros],
  tarefa,
  cena: "sindicato",
  epoca: "inicio",
});

// Quatro capítulos: registro, ordem, documento, registro. Os três primeiros
// têm um registro a mais, que a tarefa não pede e a saída exige.
const CAPITULOS: readonly ChapterSpec[] = [
  capitulo(1, { tipo: "registro", eventId: "a" }, ["x"]),
  capitulo(2, { tipo: "ordem", eventIds: ["b", "c"] }, ["y"]),
  capitulo(3, { tipo: "fonte", eventId: "e" }, ["z"]),
  capitulo(4, { tipo: "registro", eventId: "d" }),
];
const [UM, DOIS, TRES, QUATRO] = CAPITULOS as [ChapterSpec, ChapterSpec, ChapterSpec, ChapterSpec];

const VAZIA: TaskState = { recolhidos: [], confirmada: false, tentativas: 0 };

/** Os capítulos de teste não têm registros no conteúdo: a assinatura resume dados ausentes, e é o mesmo em todo o arquivo. */
const CONTEUDO: TaskContent = { registros: {}, decisoes: {} };

/** A resposta confirmada de uma tarefa, com a assinatura que a confirmação grava. */
function confirmadaDe(spec: ChapterSpec): Pick<TaskState, "confirmada" | "tentativas" | "assinatura"> {
  return spec.tarefa.tipo === "registro" ? { confirmada: false, tentativas: 0 } : { confirmada: true, tentativas: 1, assinatura: taskSignature(spec.tarefa, CONTEUDO) };
}

/** A tarefa cumprida só com os registros que ela pede: se o capítulo tem outros, a saída continua fechada. */
function soATarefa(spec: ChapterSpec): TaskState {
  return { recolhidos: [...requiredRecords(spec.tarefa)], ...confirmadaDe(spec) };
}

/** Um estado que abre a saída do capítulo: a tarefa cumprida e todos os registros recolhidos. */
function feita(spec: ChapterSpec): TaskState {
  return { recolhidos: [...spec.eventIds], ...confirmadaDe(spec) };
}

/** Recolhe tudo, cumpre a tarefa e atravessa a saída do capítulo. */
function concluir(progresso: PlayerProgress, spec: ChapterSpec): PlayerProgress {
  return completeChapter(withTaskState(progresso, spec.id, feita(spec)), CAPITULOS, spec.id);
}

const statuses = (progresso: PlayerProgress) => CAPITULOS.map((spec) => chapterStatus(progresso, spec.id));

/** Ida e volta pelo JSON, como o armazenamento faz. */
const relido = (progresso: PlayerProgress) => parseProgress(JSON.parse(JSON.stringify(progresso)), "lula", CAPITULOS, CONTEUDO);

describe("início da trajetória", () => {
  it("o primeiro capítulo está disponível e os demais bloqueados", () => {
    const inicial = initialProgress("lula", CAPITULOS);
    expect(inicial.versao).toBe(PROGRESS_VERSION);
    expect(inicial.personagem).toBe("lula");
    expect(statuses(inicial)).toEqual(["disponivel", "bloqueado", "bloqueado", "bloqueado"]);
    for (const spec of CAPITULOS) expect(taskStateOf(inicial, spec.id)).toEqual(VAZIA);
  });

  it("sem capítulos, não há capítulo atual nem trajetória completa", () => {
    const vazio = initialProgress("lula", []);
    expect(vazio.capitulos).toEqual({});
    expect(currentChapter(vazio, [])).toBeNull();
    expect(isTrajectoryComplete(vazio, [])).toBe(false);
    expect(countCompleted(vazio, [])).toBe(0);
  });

  it("capítulo desconhecido conta como bloqueado e com tarefa vazia", () => {
    const inicial = initialProgress("lula", CAPITULOS);
    expect(chapterStatus(inicial, "nao-existe")).toBe("bloqueado");
    expect(taskStateOf(inicial, "nao-existe")).toEqual(VAZIA);
  });
});

describe("estado da tarefa", () => {
  const inicial = initialProgress("lula", CAPITULOS);
  const umRecolhido: TaskState = { recolhidos: ["a"], confirmada: false, tentativas: 0 };

  it("troca a tarefa de um capítulo disponível sem alterar o progresso recebido", () => {
    const depois = withTaskState(inicial, UM.id, umRecolhido);
    expect(taskStateOf(depois, UM.id)).toEqual(umRecolhido);
    expect(chapterStatus(depois, UM.id)).toBe("disponivel");
    expect(taskStateOf(inicial, UM.id)).toEqual(VAZIA);
  });

  it("capítulo bloqueado não muda", () => {
    expect(withTaskState(inicial, DOIS.id, { recolhidos: ["b"], confirmada: false, tentativas: 0 })).toBe(inicial);
  });

  it("capítulo desconhecido não muda", () => {
    expect(withTaskState(inicial, "nao-existe", umRecolhido)).toBe(inicial);
  });

  it("a mesma tarefa de novo devolve o mesmo objeto", () => {
    const depois = withTaskState(inicial, UM.id, umRecolhido);
    expect(withTaskState(depois, UM.id, umRecolhido)).toBe(depois);
  });

  it("capítulo concluído ainda aceita o estado da tarefa", () => {
    const concluido = concluir(inicial, UM);
    // Um estado diferente do que a conclusão deixou: com o mesmo conteúdo, o teste passaria com a função ignorando o pedido.
    const outro: TaskState = { ...feita(UM), tentativas: 3 };
    const depois = withTaskState(concluido, UM.id, outro);
    expect(depois).not.toBe(concluido);
    expect(taskStateOf(depois, UM.id)).toBe(outro);
    expect(chapterStatus(depois, UM.id)).toBe("concluido");
  });
});

describe("concluir capítulo", () => {
  const inicial = initialProgress("lula", CAPITULOS);

  it("só conclui um capítulo disponível com a saída aberta", () => {
    expect(completeChapter(inicial, CAPITULOS, UM.id)).toBe(inicial);
    const quaseLa = withTaskState(inicial, UM.id, { recolhidos: ["x"], confirmada: false, tentativas: 0 });
    expect(completeChapter(quaseLa, CAPITULOS, UM.id)).toBe(quaseLa);
  });

  it("a tarefa cumprida não conclui o capítulo enquanto falta recolher algum registro", () => {
    const soTarefa = withTaskState(inicial, UM.id, soATarefa(UM));
    expect(completeChapter(soTarefa, CAPITULOS, UM.id)).toBe(soTarefa);
    expect(statuses(soTarefa)).toEqual(["disponivel", "bloqueado", "bloqueado", "bloqueado"]);
    // Com o registro que faltava, conclui.
    const tudo = withTaskState(soTarefa, UM.id, feita(UM));
    expect(statuses(completeChapter(tudo, CAPITULOS, UM.id))).toEqual(["concluido", "disponivel", "bloqueado", "bloqueado"]);
  });

  it("ao concluir, o capítulo vira concluído e o seguinte fica disponível", () => {
    const depois = concluir(inicial, UM);
    expect(statuses(depois)).toEqual(["concluido", "disponivel", "bloqueado", "bloqueado"]);
    // O estado da tarefa concluída é mantido.
    expect(taskStateOf(depois, UM.id)).toEqual(feita(UM));
  });

  it("não altera o progresso recebido", () => {
    const comTarefa = withTaskState(inicial, UM.id, feita(UM));
    completeChapter(comTarefa, CAPITULOS, UM.id);
    expect(statuses(comTarefa)).toEqual(["disponivel", "bloqueado", "bloqueado", "bloqueado"]);
  });

  it("capítulo bloqueado não conclui, mesmo com a tarefa feita no estado salvo", () => {
    const forcado: PlayerProgress = {
      ...inicial,
      capitulos: { ...inicial.capitulos, [DOIS.id]: { status: "bloqueado", tarefa: feita(DOIS) } },
    };
    expect(completeChapter(forcado, CAPITULOS, DOIS.id)).toBe(forcado);
  });

  it("repetir em capítulo concluído não muda nada", () => {
    const depois = concluir(inicial, UM);
    expect(completeChapter(depois, CAPITULOS, UM.id)).toBe(depois);
  });

  it("as tarefas com resposta exigem a resposta confirmada, e não só os registros recolhidos", () => {
    const segundo = concluir(inicial, UM);
    const soRecolhidos = withTaskState(segundo, DOIS.id, { recolhidos: ["b", "c", "y"], confirmada: false, tentativas: 2 });
    expect(completeChapter(soRecolhidos, CAPITULOS, DOIS.id)).toBe(soRecolhidos);
    const terceiro = concluir(segundo, DOIS);
    expect(statuses(terceiro)).toEqual(["concluido", "concluido", "disponivel", "bloqueado"]);
    const semDocumento = withTaskState(terceiro, TRES.id, { recolhidos: ["e", "z"], confirmada: false, tentativas: 1 });
    expect(completeChapter(semDocumento, CAPITULOS, TRES.id)).toBe(semDocumento);
    expect(statuses(concluir(terceiro, TRES))).toEqual(["concluido", "concluido", "concluido", "disponivel"]);
  });

  it("no capítulo com resposta, a resposta confirmada não conclui sem o registro que a tarefa não pede", () => {
    const segundo = concluir(inicial, UM);
    const semOTerceiro = withTaskState(segundo, DOIS.id, soATarefa(DOIS));
    expect(completeChapter(semOTerceiro, CAPITULOS, DOIS.id)).toBe(semOTerceiro);
    expect(statuses(semOTerceiro)).toEqual(["concluido", "disponivel", "bloqueado", "bloqueado"]);
  });

  it("concluir o último capítulo não quebra e completa a trajetória", () => {
    const fim = concluir(concluir(concluir(concluir(inicial, UM), DOIS), TRES), QUATRO);
    expect(statuses(fim)).toEqual(["concluido", "concluido", "concluido", "concluido"]);
    expect(isTrajectoryComplete(fim, CAPITULOS)).toBe(true);
    expect(completeChapter(fim, CAPITULOS, QUATRO.id)).toBe(fim);
  });

  it("capítulo que não está na lista não muda nada", () => {
    expect(completeChapter(inicial, CAPITULOS, "nao-existe")).toBe(inicial);
  });

  it("não pula capítulo: o terceiro não conclui enquanto o segundo está bloqueado", () => {
    const depoisDoPrimeiro = concluir(inicial, UM);
    expect(withTaskState(depoisDoPrimeiro, TRES.id, feita(TRES))).toBe(depoisDoPrimeiro);
    expect(completeChapter(depoisDoPrimeiro, CAPITULOS, TRES.id)).toBe(depoisDoPrimeiro);
  });
});

describe("capítulo atual e contagem", () => {
  const inicial = initialProgress("lula", CAPITULOS);
  const umFeito = concluir(inicial, UM);
  const todos = concluir(concluir(concluir(umFeito, DOIS), TRES), QUATRO);

  it("o capítulo atual é o primeiro disponível", () => {
    expect(currentChapter(inicial, CAPITULOS)).toBe(UM);
    expect(currentChapter(umFeito, CAPITULOS)).toBe(DOIS);
  });

  it("com tudo concluído, o atual é o último", () => {
    expect(currentChapter(todos, CAPITULOS)).toBe(QUATRO);
  });

  it("conta os concluídos e sabe quando a trajetória acabou", () => {
    expect(countCompleted(inicial, CAPITULOS)).toBe(0);
    expect(countCompleted(umFeito, CAPITULOS)).toBe(1);
    expect(countCompleted(todos, CAPITULOS)).toBe(4);
    expect(isTrajectoryComplete(inicial, CAPITULOS)).toBe(false);
    expect(isTrajectoryComplete(umFeito, CAPITULOS)).toBe(false);
    expect(isTrajectoryComplete(todos, CAPITULOS)).toBe(true);
  });
});

describe("leitura do progresso salvo", () => {
  const inicial = initialProgress("lula", CAPITULOS);
  // O que vem do armazenamento pode ter qualquer forma: as mudanças não seguem o tipo.
  const salvo = (mudancas: Record<string, unknown> = {}): Record<string, unknown> =>
    JSON.parse(JSON.stringify({ ...inicial, ...mudancas }));
  const entrada = (status: string, tarefa: unknown = VAZIA) => ({ status, tarefa });

  it("recusa o que não é um objeto", () => {
    expect(parseProgress(null, "lula", CAPITULOS, CONTEUDO)).toBeNull();
    expect(parseProgress(undefined, "lula", CAPITULOS, CONTEUDO)).toBeNull();
    expect(parseProgress("texto", "lula", CAPITULOS, CONTEUDO)).toBeNull();
    expect(parseProgress(42, "lula", CAPITULOS, CONTEUDO)).toBeNull();
    expect(parseProgress([], "lula", CAPITULOS, CONTEUDO)).toBeNull();
    expect(parseProgress([inicial], "lula", CAPITULOS, CONTEUDO)).toBeNull();
  });

  it("recusa versão desconhecida ou ausente; aceita a atual e as anteriores", () => {
    expect(READABLE_VERSIONS).toEqual([1, 2, 3, 4, PROGRESS_VERSION]);
    expect(parseProgress(salvo({ versao: PROGRESS_VERSION + 1 }), "lula", CAPITULOS, CONTEUDO)).toBeNull();
    expect(parseProgress(salvo({ versao: String(PROGRESS_VERSION) }), "lula", CAPITULOS, CONTEUDO)).toBeNull();
    expect(parseProgress(salvo({ versao: 0 }), "lula", CAPITULOS, CONTEUDO)).toBeNull();
    const semVersao = salvo();
    delete semVersao.versao;
    expect(parseProgress(semVersao, "lula", CAPITULOS, CONTEUDO)).toBeNull();
  });

  it("recusa o progresso de outro personagem", () => {
    expect(parseProgress(salvo(), "flavio-bolsonaro", CAPITULOS, CONTEUDO)).toBeNull();
    expect(parseProgress(salvo({ personagem: "flavio-bolsonaro" }), "lula", CAPITULOS, CONTEUDO)).toBeNull();
  });

  it("recusa capítulos que não são um objeto", () => {
    expect(parseProgress(salvo({ capitulos: [] }), "lula", CAPITULOS, CONTEUDO)).toBeNull();
    expect(parseProgress(salvo({ capitulos: null }), "lula", CAPITULOS, CONTEUDO)).toBeNull();
    const semCapitulos = salvo();
    delete semCapitulos.capitulos;
    expect(parseProgress(semCapitulos, "lula", CAPITULOS, CONTEUDO)).toBeNull();
  });

  it("capítulo ausente entra bloqueado, ou disponível se é o próximo da fila", () => {
    const soOPrimeiro = salvo({ capitulos: { [UM.id]: entrada("concluido", feita(UM)) } });
    expect(statuses(parseProgress(soOPrimeiro, "lula", CAPITULOS, CONTEUDO)!)).toEqual(["concluido", "disponivel", "bloqueado", "bloqueado"]);

    const semOTerceiro = salvo({ capitulos: { [UM.id]: entrada("disponivel"), [DOIS.id]: entrada("bloqueado") } });
    const lido = parseProgress(semOTerceiro, "lula", CAPITULOS, CONTEUDO)!;
    expect(statuses(lido)).toEqual(["disponivel", "bloqueado", "bloqueado", "bloqueado"]);
    expect(taskStateOf(lido, TRES.id)).toEqual(VAZIA);
  });

  it("quem terminou os capítulos de uma edição anterior recebe o primeiro capítulo novo como disponível", () => {
    // A edição anterior tinha só os dois primeiros capítulos, os dois concluídos.
    const daEdicaoAnterior = salvo({ capitulos: { [UM.id]: entrada("concluido", feita(UM)), [DOIS.id]: entrada("concluido", feita(DOIS)) } });
    const lido = parseProgress(daEdicaoAnterior, "lula", CAPITULOS, CONTEUDO)!;
    expect(statuses(lido)).toEqual(["concluido", "concluido", "disponivel", "bloqueado"]);
    expect(taskStateOf(lido, UM.id)).toEqual(feita(UM));
    expect(taskStateOf(lido, TRES.id)).toEqual(VAZIA);
    expect(currentChapter(lido, CAPITULOS)).toBe(TRES);
  });

  it("capítulo que a edição não tem mais é descartado", () => {
    const comExtra = salvo({ capitulos: { ...inicial.capitulos, "capitulo-antigo": entrada("concluido") } });
    const lido = parseProgress(comExtra, "lula", CAPITULOS, CONTEUDO)!;
    expect(Object.keys(lido.capitulos).sort()).toEqual(CAPITULOS.map((spec) => spec.id).sort());
  });

  it("recusa status inválido e entrada que não é objeto", () => {
    expect(parseProgress(salvo({ capitulos: { ...inicial.capitulos, [UM.id]: entrada("feito") } }), "lula", CAPITULOS, CONTEUDO)).toBeNull();
    expect(parseProgress(salvo({ capitulos: { ...inicial.capitulos, [UM.id]: entrada("") } }), "lula", CAPITULOS, CONTEUDO)).toBeNull();
    expect(parseProgress(salvo({ capitulos: { ...inicial.capitulos, [UM.id]: null } }), "lula", CAPITULOS, CONTEUDO)).toBeNull();
    expect(parseProgress(salvo({ capitulos: { ...inicial.capitulos, [UM.id]: "disponivel" } }), "lula", CAPITULOS, CONTEUDO)).toBeNull();
  });

  it("recusa tarefa inválida", () => {
    const comTarefa = (tarefa: unknown) => salvo({ capitulos: { ...inicial.capitulos, [UM.id]: entrada("disponivel", tarefa) } });
    expect(parseProgress(salvo({ capitulos: { ...inicial.capitulos, [UM.id]: { status: "disponivel" } } }), "lula", CAPITULOS, CONTEUDO)).toBeNull();
    expect(parseProgress(comTarefa(null), "lula", CAPITULOS, CONTEUDO)).toBeNull();
    expect(parseProgress(comTarefa([]), "lula", CAPITULOS, CONTEUDO)).toBeNull();
    expect(parseProgress(comTarefa({ ...VAZIA, recolhidos: "a" }), "lula", CAPITULOS, CONTEUDO)).toBeNull();
    expect(parseProgress(comTarefa({ ...VAZIA, recolhidos: ["a", 2] }), "lula", CAPITULOS, CONTEUDO)).toBeNull();
    expect(parseProgress(comTarefa({ ...VAZIA, tentativas: -1 }), "lula", CAPITULOS, CONTEUDO)).toBeNull();
    expect(parseProgress(comTarefa({ ...VAZIA, tentativas: 1.5 }), "lula", CAPITULOS, CONTEUDO)).toBeNull();
    expect(parseProgress(comTarefa({ ...VAZIA, tentativas: "2" }), "lula", CAPITULOS, CONTEUDO)).toBeNull();
    expect(parseProgress(comTarefa({ ...VAZIA, confirmada: "sim" }), "lula", CAPITULOS, CONTEUDO)).toBeNull();
    expect(parseProgress(comTarefa({ recolhidos: [], confirmada: false }), "lula", CAPITULOS, CONTEUDO)).toBeNull();
    // O nome da versão 1 não vale na versão atual.
    expect(parseProgress(comTarefa({ recolhidos: [], ordemConfirmada: false, tentativas: 0 }), "lula", CAPITULOS, CONTEUDO)).toBeNull();
  });

  it("deduplica registros recolhidos, mantendo a primeira ocorrência", () => {
    const repetidos = { recolhidos: ["a", "x", "a", "x"], confirmada: false, tentativas: 0 };
    const lido = parseProgress(salvo({ capitulos: { ...inicial.capitulos, [UM.id]: entrada("disponivel", repetidos) } }), "lula", CAPITULOS, CONTEUDO)!;
    expect(taskStateOf(lido, UM.id).recolhidos).toEqual(["a", "x"]);
  });

  it("com dois capítulos disponíveis, reaplica a progressão: só o primeiro fica aberto", () => {
    const doisAbertos = salvo({
      capitulos: {
        [UM.id]: entrada("disponivel"),
        [DOIS.id]: entrada("disponivel", { recolhidos: ["b"], confirmada: false, tentativas: 0 }),
        [TRES.id]: entrada("bloqueado"),
      },
    });
    const lido = parseProgress(doisAbertos, "lula", CAPITULOS, CONTEUDO)!;
    expect(statuses(lido)).toEqual(["disponivel", "bloqueado", "bloqueado", "bloqueado"]);
    // O capítulo que voltou a bloqueado guarda o que tinha recolhido: a situação vem da ordem, o estado da tarefa é do capítulo.
    expect(taskStateOf(lido, DOIS.id)).toEqual({ recolhidos: ["b"], confirmada: false, tentativas: 0 });
  });

  it("um disponível depois de um bloqueado volta para o começo da fila", () => {
    const invertido = salvo({
      capitulos: { [UM.id]: entrada("bloqueado"), [DOIS.id]: entrada("disponivel"), [TRES.id]: entrada("bloqueado") },
    });
    expect(statuses(parseProgress(invertido, "lula", CAPITULOS, CONTEUDO)!)).toEqual(["disponivel", "bloqueado", "bloqueado", "bloqueado"]);
  });

  it("concluído sem a tarefa feita volta a disponível, mantendo o que foi recolhido", () => {
    const parcial = { recolhidos: ["x"], confirmada: false, tentativas: 0 };
    const inconsistente = salvo({
      capitulos: { [UM.id]: entrada("concluido", parcial), [DOIS.id]: entrada("disponivel"), [TRES.id]: entrada("bloqueado") },
    });
    const lido = parseProgress(inconsistente, "lula", CAPITULOS, CONTEUDO)!;
    expect(statuses(lido)).toEqual(["disponivel", "bloqueado", "bloqueado", "bloqueado"]);
    expect(taskStateOf(lido, UM.id)).toEqual(parcial);
  });

  it("concluído com a tarefa cumprida e registro por recolher volta a disponível, e os seguintes voltam a bloqueado", () => {
    // Guardado quando a saída abria só com a tarefa: o capítulo 1 concluído sem o registro que a tarefa não pede.
    const daRegraAntiga = salvo({
      capitulos: {
        [UM.id]: entrada("concluido", soATarefa(UM)),
        [DOIS.id]: entrada("disponivel", { recolhidos: ["b"], confirmada: false, tentativas: 0 }),
        [TRES.id]: entrada("bloqueado"),
      },
    });
    const lido = parseProgress(daRegraAntiga, "lula", CAPITULOS, CONTEUDO)!;
    expect(statuses(lido)).toEqual(["disponivel", "bloqueado", "bloqueado", "bloqueado"]);
    // O que já foi recolhido no capítulo que reabriu continua recolhido.
    expect(taskStateOf(lido, UM.id)).toEqual(soATarefa(UM));
    // O capítulo que voltou a bloqueado fica fechado até o anterior ser concluído, e guarda o que tinha recolhido.
    expect(taskStateOf(lido, DOIS.id)).toEqual({ recolhidos: ["b"], confirmada: false, tentativas: 0 });
    // Recolhido o que faltava, o capítulo conclui de novo.
    expect(statuses(completeChapter(withTaskState(lido, UM.id, feita(UM)), CAPITULOS, UM.id))).toEqual(["concluido", "disponivel", "bloqueado", "bloqueado"]);
  });

  it("tarefa com resposta concluída exige a resposta confirmada no salvo", () => {
    const semConfirmar = salvo({
      capitulos: {
        [UM.id]: entrada("concluido", feita(UM)),
        [DOIS.id]: entrada("concluido", { recolhidos: ["b", "c", "y"], confirmada: false, tentativas: 1 }),
        [TRES.id]: entrada("disponivel"),
      },
    });
    expect(statuses(parseProgress(semConfirmar, "lula", CAPITULOS, CONTEUDO)!)).toEqual(["concluido", "disponivel", "bloqueado", "bloqueado"]);
  });

  it("tarefa com resposta concluída exige todos os registros no salvo, e não só os da tarefa", () => {
    const semOTerceiro = salvo({
      capitulos: {
        [UM.id]: entrada("concluido", feita(UM)),
        [DOIS.id]: entrada("concluido", soATarefa(DOIS)),
        [TRES.id]: entrada("disponivel", { recolhidos: ["e"], confirmada: false, tentativas: 0 }),
      },
    });
    const lido = parseProgress(semOTerceiro, "lula", CAPITULOS, CONTEUDO)!;
    expect(statuses(lido)).toEqual(["concluido", "disponivel", "bloqueado", "bloqueado"]);
    // A resposta já confirmada continua valendo: falta só o registro.
    expect(taskStateOf(lido, DOIS.id)).toEqual(soATarefa(DOIS));
    // O capítulo seguinte volta a bloqueado com o que já tinha.
    expect(taskStateOf(lido, TRES.id)).toEqual({ recolhidos: ["e"], confirmada: false, tentativas: 0 });
  });

  it("registros que o capítulo não cita mais saem dos recolhidos", () => {
    // O capítulo mudou entre uma edição e outra: o que foi recolhido antes e não existe mais é esquecido.
    const antigo = { recolhidos: ["antigo", "a", "outro"], confirmada: false, tentativas: 0 };
    const lido = parseProgress(salvo({ capitulos: { ...inicial.capitulos, [UM.id]: entrada("disponivel", antigo) } }), "lula", CAPITULOS, CONTEUDO)!;
    expect(taskStateOf(lido, UM.id).recolhidos).toEqual(["a"]);
  });

  it("resposta confirmada sem os registros da tarefa não vale, e o capítulo volta a disponível", () => {
    // A tarefa de ordem passou a pedir outro par: a confirmação antiga não conclui a nova.
    const deOutroPar = salvo({
      capitulos: {
        [UM.id]: entrada("concluido", feita(UM)),
        [DOIS.id]: entrada("concluido", { recolhidos: ["b", "antigo"], confirmada: true, tentativas: 2, assinatura: "ordem:b+antigo" }),
        [TRES.id]: entrada("disponivel"),
      },
    });
    const lido = parseProgress(deOutroPar, "lula", CAPITULOS, CONTEUDO)!;
    expect(statuses(lido)).toEqual(["concluido", "disponivel", "bloqueado", "bloqueado"]);
    expect(taskStateOf(lido, DOIS.id)).toEqual({ recolhidos: ["b"], confirmada: false, tentativas: 2 });
  });

  it("resposta confirmada em capítulo de registro é ignorada", () => {
    const estranho = { recolhidos: ["x"], confirmada: true, tentativas: 1 };
    const lido = parseProgress(salvo({ capitulos: { ...inicial.capitulos, [UM.id]: entrada("disponivel", estranho) } }), "lula", CAPITULOS, CONTEUDO)!;
    expect(taskStateOf(lido, UM.id)).toEqual({ recolhidos: ["x"], confirmada: false, tentativas: 1 });
  });

  it("um progresso coerente volta igual depois da ida e volta por JSON", () => {
    const umFeito = concluir(inicial, UM);
    const emAndamento = withTaskState(umFeito, DOIS.id, { recolhidos: ["c"], confirmada: false, tentativas: 0 });
    const todos = concluir(concluir(concluir(umFeito, DOIS), TRES), QUATRO);
    for (const progresso of [inicial, umFeito, emAndamento, todos]) expect(relido(progresso)).toEqual(progresso);
  });

  it("o resultado é um progresso novo, sem referência ao objeto lido", () => {
    const bruto = salvo();
    const lido = parseProgress(bruto, "lula", CAPITULOS, CONTEUDO)!;
    expect(lido.capitulos).not.toBe(bruto.capitulos);
    expect(lido).toEqual(inicial);
  });
});

describe("migração da versão 1", () => {
  const inicial = initialProgress("lula", CAPITULOS);
  // A versão 1 chamava a confirmação de `ordemConfirmada` e só a tarefa de ordem a usava.
  const v1 = (capitulos: Record<string, unknown>) => ({ versao: 1, personagem: "lula", capitulos });
  const tarefaV1 = (recolhidos: string[], ordemConfirmada = false, tentativas = 0) => ({ recolhidos, ordemConfirmada, tentativas });
  // O que os capítulos de teste pediam na versão 1: a tabela congelada, injetada porque os capítulos são fixtures.
  const LEGADO: LegacySignatures = { 1: { [DOIS.id]: legacyTaskSignature(DOIS.tarefa) }, 2: {} };

  it("lê um progresso da versão 1 e devolve a versão atual, com a confirmação renomeada e assinada", () => {
    const salvo = v1({
      [UM.id]: { status: "concluido", tarefa: tarefaV1(["a", "x"]) },
      [DOIS.id]: { status: "disponivel", tarefa: tarefaV1(["b", "c"], true, 2) },
    });
    const lido = parseProgress(salvo, "lula", CAPITULOS, CONTEUDO, LEGADO)!;
    expect(lido.versao).toBe(PROGRESS_VERSION);
    expect(statuses(lido)).toEqual(["concluido", "disponivel", "bloqueado", "bloqueado"]);
    expect(taskStateOf(lido, UM.id)).toEqual({ recolhidos: ["a", "x"], confirmada: false, tentativas: 0 });
    // A ordem confirmada da versão 1 vale: os dois registros estão recolhidos, a tarefa é de ordem e é a mesma de então.
    expect(taskStateOf(lido, DOIS.id)).toEqual({ recolhidos: ["b", "c"], confirmada: true, tentativas: 2, assinatura: taskSignature(DOIS.tarefa, CONTEUDO) });
    expect("ordemConfirmada" in taskStateOf(lido, DOIS.id)).toBe(false);
  });

  it("a confirmação da versão 1 só migra se o capítulo pedia a mesma tarefa então", () => {
    const salvo = v1({
      [UM.id]: { status: "concluido", tarefa: tarefaV1(["a", "x"]) },
      [DOIS.id]: { status: "concluido", tarefa: tarefaV1(["b", "c", "y"], true, 2) },
    });
    // Sem o capítulo na tabela da versão 1 (ou com outra tarefa lá), a resposta não vale: o capítulo reabre com o que tinha.
    const semTabela = parseProgress(salvo, "lula", CAPITULOS, CONTEUDO, { 1: {}, 2: {} })!;
    expect(statuses(semTabela)).toEqual(["concluido", "disponivel", "bloqueado", "bloqueado"]);
    expect(taskStateOf(semTabela, DOIS.id)).toEqual({ recolhidos: ["b", "c", "y"], confirmada: false, tentativas: 2 });
    const outraTarefa = parseProgress(salvo, "lula", CAPITULOS, CONTEUDO, { 1: { [DOIS.id]: "fonte:b" }, 2: {} })!;
    expect(statuses(outraTarefa)).toEqual(["concluido", "disponivel", "bloqueado", "bloqueado"]);
    // Com a tabela certa, conclui.
    expect(statuses(parseProgress(salvo, "lula", CAPITULOS, CONTEUDO, LEGADO)!)).toEqual(["concluido", "concluido", "disponivel", "bloqueado"]);
  });

  it("um progresso da versão 1 que terminou os capítulos de então segue para o primeiro capítulo novo", () => {
    const salvo = v1({
      [UM.id]: { status: "concluido", tarefa: tarefaV1(["a", "x"]) },
      [DOIS.id]: { status: "concluido", tarefa: tarefaV1(["b", "c", "y"], true, 1) },
    });
    const lido = parseProgress(salvo, "lula", CAPITULOS, CONTEUDO, LEGADO)!;
    expect(statuses(lido)).toEqual(["concluido", "concluido", "disponivel", "bloqueado"]);
    expect(currentChapter(lido, CAPITULOS)).toBe(TRES);
  });

  it("a versão 1 exige o nome antigo do campo: o novo não vale nela", () => {
    const comNomeNovo = v1({ [UM.id]: { status: "disponivel", tarefa: { recolhidos: [], confirmada: false, tentativas: 0 } } });
    expect(parseProgress(comNomeNovo, "lula", CAPITULOS, CONTEUDO, LEGADO)).toBeNull();
    const comTipoErrado = v1({ [UM.id]: { status: "disponivel", tarefa: { recolhidos: [], ordemConfirmada: "sim", tentativas: 0 } } });
    expect(parseProgress(comTipoErrado, "lula", CAPITULOS, CONTEUDO, LEGADO)).toBeNull();
  });

  it("a regra da saída vale também para o que a versão 1 guardou", () => {
    // Concluído quando a saída abria só com a tarefa: reabre com o que já tinha.
    const salvo = v1({
      [UM.id]: { status: "concluido", tarefa: tarefaV1(["a"]) },
      [DOIS.id]: { status: "disponivel", tarefa: tarefaV1(["b"]) },
    });
    const lido = parseProgress(salvo, "lula", CAPITULOS, CONTEUDO, LEGADO)!;
    expect(statuses(lido)).toEqual(["disponivel", "bloqueado", "bloqueado", "bloqueado"]);
    expect(taskStateOf(lido, UM.id)).toEqual({ recolhidos: ["a"], confirmada: false, tentativas: 0 });
  });

  it("depois da migração, salvar e ler de novo não muda nada", () => {
    const salvo = v1({ [UM.id]: { status: "concluido", tarefa: tarefaV1(["a", "x"]) }, [DOIS.id]: { status: "disponivel", tarefa: tarefaV1(["b"]) } });
    const migrado = parseProgress(salvo, "lula", CAPITULOS, CONTEUDO, LEGADO)!;
    expect(relido(migrado)).toEqual(migrado);
    expect(migrado).not.toEqual(inicial);
  });
});

describe("assinatura da tarefa respondida (versão 3)", () => {
  const inicial = initialProgress("lula", CAPITULOS);
  const salvo = (capitulos: Record<string, unknown>) => JSON.parse(JSON.stringify({ ...inicial, capitulos }));
  // O mesmo capítulo 2, com os mesmos identificadores, mas a tarefa trocada de ordem por documento.
  const DOIS_MUDADO = capitulo(2, { tipo: "fonte", eventId: "b" }, ["c", "y"]);
  const CAPITULOS_MUDADOS: readonly ChapterSpec[] = [UM, DOIS_MUDADO, TRES, QUATRO];

  it("a confirmação grava a assinatura da tarefa, e ela sobrevive à ida e volta por JSON", () => {
    const concluido = completeChapter(withTaskState(inicial, DOIS.id, feita(DOIS)), CAPITULOS, DOIS.id);
    const umFeito = completeChapter(withTaskState(inicial, UM.id, feita(UM)), CAPITULOS, UM.id);
    const doisFeitos = completeChapter(withTaskState(umFeito, DOIS.id, feita(DOIS)), CAPITULOS, DOIS.id);
    expect(taskStateOf(doisFeitos, DOIS.id).assinatura).toBe(taskSignature(DOIS.tarefa, CONTEUDO));
    expect(taskStateOf(doisFeitos, DOIS.id).assinatura).toMatch(/^ordem:b\+c@[0-9a-f]{8}$/);
    expect(relido(doisFeitos)).toEqual(doisFeitos);
    expect(concluido).toBe(inicial); // bloqueado: nada muda
  });

  it("uma resposta confirmada não conclui uma tarefa que mudou sob os mesmos identificadores", () => {
    // O que o auditor reproduziu: o capítulo e os registros mantiveram os identificadores, mas a tarefa de ordem virou tarefa de documento.
    const guardado = salvo({ [UM.id]: { status: "concluido", tarefa: feita(UM) }, [DOIS.id]: { status: "concluido", tarefa: feita(DOIS) }, [TRES.id]: { status: "disponivel", tarefa: VAZIA } });
    const lido = parseProgress(guardado, "lula", CAPITULOS_MUDADOS, CONTEUDO)!;
    expect(statuses(lido)).toEqual(["concluido", "disponivel", "bloqueado", "bloqueado"]);
    // O que foi recolhido e as tentativas ficam; só a resposta é pedida de novo.
    expect(taskStateOf(lido, DOIS_MUDADO.id)).toEqual({ recolhidos: ["b", "c", "y"], confirmada: false, tentativas: 1 });
    // Com os capítulos de antes, o mesmo salvo conclui.
    expect(statuses(parseProgress(guardado, "lula", CAPITULOS, CONTEUDO)!)).toEqual(["concluido", "concluido", "disponivel", "bloqueado"]);
  });

  it("na versão atual, confirmação sem assinatura não vale", () => {
    const semAssinatura = salvo({ [UM.id]: { status: "concluido", tarefa: feita(UM) }, [DOIS.id]: { status: "concluido", tarefa: { recolhidos: ["b", "c", "y"], confirmada: true, tentativas: 1 } } });
    const lido = parseProgress(semAssinatura, "lula", CAPITULOS, CONTEUDO)!;
    expect(statuses(lido)).toEqual(["concluido", "disponivel", "bloqueado", "bloqueado"]);
    expect(taskStateOf(lido, DOIS.id)).toEqual({ recolhidos: ["b", "c", "y"], confirmada: false, tentativas: 1 });
  });

  it("assinatura com tipo errado recusa o salvo", () => {
    const estranha = salvo({ [UM.id]: { status: "disponivel", tarefa: { ...VAZIA, assinatura: 7 } } });
    expect(parseProgress(estranha, "lula", CAPITULOS, CONTEUDO)).toBeNull();
  });

  it("a assinatura sem confirmação é descartada na leitura", () => {
    const sobra = salvo({
      [UM.id]: { status: "concluido", tarefa: feita(UM) },
      [DOIS.id]: { status: "disponivel", tarefa: { recolhidos: ["b"], confirmada: false, tentativas: 1, assinatura: "ordem:b+c" } },
    });
    expect(taskStateOf(parseProgress(sobra, "lula", CAPITULOS, CONTEUDO)!, DOIS.id)).toEqual({ recolhidos: ["b"], confirmada: false, tentativas: 1 });
  });
});

describe("migração da versão 2", () => {
  // A versão 2 não guardava a assinatura: a confirmação migra pela tabela do que cada capítulo pedia então.
  const LULA = chaptersOf("lula");
  const [c1, c2, c3] = LULA as [ChapterSpec, ChapterSpec, ChapterSpec];
  const v2 = (capitulos: Record<string, unknown>) => ({ versao: 2, personagem: "lula", capitulos });

  it("a tabela congelada cobre os capítulos de cada versão, pelos identificadores de então", () => {
    expect(Object.keys(LEGACY_SIGNATURES[1]).sort()).toEqual(["flavio-bolsonaro-1-alerj", "flavio-bolsonaro-2-senado", "lula-1-sindicato", "lula-2-constituinte"]);
    expect(Object.keys(LEGACY_SIGNATURES[2]).sort()).toEqual(
      [
        ...["flavio-bolsonaro-1-alerj", "flavio-bolsonaro-2-senado", "flavio-bolsonaro-3-denuncia", "flavio-bolsonaro-4-minoria", "flavio-bolsonaro-5-eleicao-2026"],
        ...["lula-1-sindicato", "lula-2-constituinte", "lula-3-presidencia", "lula-4-processos", "lula-5-anulacao", "lula-6-eleicao-2026"],
      ].sort(),
    );
    for (const assinatura of [...Object.values(LEGACY_SIGNATURES[1]), ...Object.values(LEGACY_SIGNATURES[2])]) expect(assinatura).toMatch(/^(registro|ordem|fonte|lugar):\S+$/);
  });

  it("uma confirmação da versão 2 migra com a assinatura quando a tarefa do capítulo é a mesma de então", () => {
    const guardado = v2({
      [c1.id]: { status: "concluido", tarefa: { recolhidos: [...c1.eventIds], confirmada: false, tentativas: 0 } },
      [c2.id]: { status: "concluido", tarefa: { recolhidos: [...c2.eventIds], confirmada: true, tentativas: 1 } },
      [c3.id]: { status: "disponivel", tarefa: { recolhidos: [], confirmada: false, tentativas: 0 } },
    });
    const lido = parseProgress(guardado, "lula", LULA, CONTEUDO)!;
    expect(lido.versao).toBe(PROGRESS_VERSION);
    expect(LULA.map((spec) => chapterStatus(lido, spec.id)).slice(0, 3)).toEqual(["concluido", "concluido", "disponivel"]);
    expect(taskStateOf(lido, c2.id)).toEqual({ recolhidos: [...c2.eventIds], confirmada: true, tentativas: 1, assinatura: taskSignature(c2.tarefa, CONTEUDO) });
    // No dia em que a tabela foi congelada, ela dizia o que os capítulos pedem hoje.
    expect(LEGACY_SIGNATURES[2][c2.id]).toBe(legacyTaskSignature(c2.tarefa));
  });

  it("uma confirmação da versão 2 de um capítulo que a tabela não conhece não vale", () => {
    const guardado = v2({ [UM.id]: { status: "concluido", tarefa: feita(UM) }, [DOIS.id]: { status: "concluido", tarefa: { recolhidos: ["b", "c", "y"], confirmada: true, tentativas: 1 } } });
    const lido = parseProgress(guardado, "lula", CAPITULOS, CONTEUDO)!;
    expect(statuses(lido)).toEqual(["concluido", "disponivel", "bloqueado", "bloqueado"]);
    expect(taskStateOf(lido, DOIS.id)).toEqual({ recolhidos: ["b", "c", "y"], confirmada: false, tentativas: 1 });
  });

  it("a versão 2 ignora a assinatura, que ela não tinha", () => {
    const comAssinatura = v2({
      [UM.id]: { status: "concluido", tarefa: { recolhidos: [...UM.eventIds], confirmada: false, tentativas: 0 } },
      [DOIS.id]: { status: "disponivel", tarefa: { recolhidos: ["b", "c"], confirmada: true, tentativas: 1, assinatura: taskSignature(DOIS.tarefa, CONTEUDO) } },
    });
    // Sem o capítulo na tabela da versão 2, a assinatura escrita no salvo não resgata a confirmação.
    expect(taskStateOf(parseProgress(comAssinatura, "lula", CAPITULOS, CONTEUDO)!, DOIS.id)).toEqual({ recolhidos: ["b", "c"], confirmada: false, tentativas: 1 });
  });
});

describe("assinatura com os dados da resposta (versão 5, D-130)", () => {
  const fonte = (id: string): GameSource => ({
    id,
    titulo: `Documento ${id}`,
    autoria: "Órgão",
    url: `https://exemplo.gov.br/${id}`,
    dataDocumento: { tipo: "desconhecida" },
    acessadoEm: "2026-10-10",
    localizacao: "Trecho",
    evidencia: "O que sustenta.",
  });
  const registro = (id: string, fontes: GameSource[], titulo = `Registro ${id}`): GameRecord => ({
    id,
    slug: id,
    titulo,
    data: { valor: "1990-01-01", precisao: "dia" },
    categoria: "eleicoes",
    resumo: "Resumo.",
    contexto: "Contexto.",
    localizacao: { tipo: "nacional" },
    fontes,
    editorial: { estado: "revisado", revisao: { tipo: "assistida-por-ia", revisadoPor: "Fixture", revisadoEm: "2026-10-10" } },
    ordemEmAberto: false,
  });
  // O capítulo 3 pede o documento do registro "e": três versões do conteúdo, com o documento certo, com outro e só com outro título.
  const COM_F1: TaskContent = { registros: { e: registro("e", [fonte("f1")]) }, decisoes: {} };
  const COM_F2: TaskContent = { registros: { e: registro("e", [fonte("f2")]) }, decisoes: {} };
  const OUTRO_TITULO: TaskContent = { registros: { e: registro("e", [fonte("f1")], "Outro título") }, decisoes: {} };
  const inicial = initialProgress("lula", CAPITULOS);
  /** Os três primeiros capítulos concluídos, o terceiro assinado com o conteúdo dado; ida e volta pelo JSON. */
  const salvoCom = (conteudo: TaskContent) => {
    const umEDois = concluir(concluir(inicial, UM), DOIS);
    const tresFeito = withTaskState(umEDois, TRES.id, { recolhidos: [...TRES.eventIds], confirmada: true, tentativas: 1, assinatura: taskSignature(TRES.tarefa, conteudo) });
    return JSON.parse(JSON.stringify(completeChapter(tresFeito, CAPITULOS, TRES.id)));
  };

  it("a assinatura traz o resumo dos dados da resposta, e muda quando o documento certo muda, não quando o título muda", () => {
    expect(taskSignature(TRES.tarefa, COM_F1)).toMatch(/^fonte:e@[0-9a-f]{8}$/);
    expect(taskSignature(TRES.tarefa, COM_F1)).not.toBe(taskSignature(TRES.tarefa, COM_F2));
    expect(taskSignature(TRES.tarefa, COM_F1)).toBe(taskSignature(TRES.tarefa, OUTRO_TITULO));
    expect(taskSignature(TRES.tarefa, COM_F1).startsWith(`${legacyTaskSignature(TRES.tarefa)}@`)).toBe(true);
  });

  it("corrigir o documento que sustenta o registro, sob os mesmos identificadores, reabre só essa resposta e mantém o recolhido", () => {
    const salvo = salvoCom(COM_F1);
    // Com o mesmo conteúdo, tudo concluído.
    expect(statuses(parseProgress(salvo, "lula", CAPITULOS, COM_F1)!)).toEqual(["concluido", "concluido", "concluido", "disponivel"]);
    // Com o documento corrigido, o capítulo 3 reabre com o que foi recolhido e as tentativas; os anteriores continuam concluídos.
    const lido = parseProgress(salvo, "lula", CAPITULOS, COM_F2)!;
    expect(statuses(lido)).toEqual(["concluido", "concluido", "disponivel", "bloqueado"]);
    expect(taskStateOf(lido, TRES.id)).toEqual({ recolhidos: ["e", "z"], confirmada: false, tentativas: 1 });
    // Só o texto mudou: nada reabre.
    expect(statuses(parseProgress(salvo, "lula", CAPITULOS, OUTRO_TITULO)!)).toEqual(["concluido", "concluido", "concluido", "disponivel"]);
  });

  it("um salvo da versão 4 traz a assinatura só com tipo e identificadores: ela vale e é regravada na forma atual", () => {
    // Como a versão 4 gravava: toda assinatura só com o tipo e os identificadores.
    const salvo = salvoCom(COM_F1) as { capitulos: Record<string, { status: string; tarefa: TaskState }> };
    const capitulosDaV4 = Object.fromEntries(
      Object.entries(salvo.capitulos).map(([id, entrada]) => {
        const spec = CAPITULOS.find((item) => item.id === id)!;
        const tarefa = entrada.tarefa.assinatura === undefined ? entrada.tarefa : { ...entrada.tarefa, assinatura: legacyTaskSignature(spec.tarefa) };
        return [id, { ...entrada, tarefa }];
      }),
    );
    const v4 = { ...salvo, versao: 4, capitulos: capitulosDaV4 };
    // A versão 4 não conhecia os dados da resposta: a confirmação vale mesmo com o documento corrigido depois, e a leitura a regrava na forma atual.
    const lido = parseProgress(v4, "lula", CAPITULOS, COM_F2)!;
    expect(lido.versao).toBe(PROGRESS_VERSION);
    expect(statuses(lido)).toEqual(["concluido", "concluido", "concluido", "disponivel"]);
    expect(taskStateOf(lido, DOIS.id).assinatura).toBe(taskSignature(DOIS.tarefa, COM_F2));
    expect(taskStateOf(lido, TRES.id).assinatura).toBe(taskSignature(TRES.tarefa, COM_F2));
    // Depois da migração, salvar e ler de novo não muda nada.
    expect(parseProgress(JSON.parse(JSON.stringify(lido)), "lula", CAPITULOS, COM_F2)).toEqual(lido);
    // A forma antiga não vale na versão atual: as respostas reabrem, a começar pela primeira tarefa com resposta.
    const comoV5 = parseProgress({ ...v4, versao: PROGRESS_VERSION }, "lula", CAPITULOS, COM_F2)!;
    expect(statuses(comoV5)).toEqual(["concluido", "disponivel", "bloqueado", "bloqueado"]);
    expect(taskStateOf(comoV5, DOIS.id)).toEqual({ recolhidos: ["b", "c", "y"], confirmada: false, tentativas: 1 });
    expect(READABLE_VERSIONS).toEqual([1, 2, 3, 4, 5]);
  });

  it("a etapa de evidência da decisão só vale, na versão atual, com a assinatura da tarefa; na versão 4 ela migra e ganha a assinatura", () => {
    const DECISAO = capitulo(5, { tipo: "decisao", decisaoId: "d" }, ["w"]);
    const capitulos = [DECISAO];
    const conteudo: TaskContent = { registros: {}, decisoes: {} };
    const base = initialProgress("lula", capitulos);
    const tarefaComEvidencia = { recolhidos: ["d"], confirmada: false, tentativas: 1, evidencia: true, assinatura: taskSignature(DECISAO.tarefa, conteudo) };
    const comEvidencia = { ...base, capitulos: { [DECISAO.id]: { status: "disponivel", tarefa: tarefaComEvidencia } } };
    expect(taskStateOf(parseProgress(JSON.parse(JSON.stringify(comEvidencia)), "lula", capitulos, conteudo)!, DECISAO.id).evidencia).toBe(true);
    // Com outra assinatura (os dados da resposta mudaram), a etapa reabre; o recolhido e as tentativas ficam.
    const outraAssinatura = { ...comEvidencia, capitulos: { [DECISAO.id]: { status: "disponivel", tarefa: { ...tarefaComEvidencia, assinatura: "decisao:d@00000000" } } } };
    expect(taskStateOf(parseProgress(outraAssinatura, "lula", capitulos, conteudo)!, DECISAO.id)).toEqual({ recolhidos: ["d"], confirmada: false, tentativas: 1 });
    // A versão 4 não assinava a etapa: ela migra e passa a ter a assinatura atual.
    const v4 = { ...comEvidencia, versao: 4, capitulos: { [DECISAO.id]: { status: "disponivel", tarefa: { recolhidos: ["d"], confirmada: false, tentativas: 1, evidencia: true } } } };
    const migrado = taskStateOf(parseProgress(v4, "lula", capitulos, conteudo)!, DECISAO.id);
    expect(migrado.evidencia).toBe(true);
    expect(migrado.assinatura).toBe(taskSignature(DECISAO.tarefa, conteudo));
  });
});

describe("uma correção reabre só a resposta afetada (D-130)", () => {
  const fonte = (id: string): GameSource => ({
    id,
    titulo: `Documento ${id}`,
    autoria: "Órgão",
    url: `https://exemplo.gov.br/${id}`,
    dataDocumento: { tipo: "desconhecida" },
    acessadoEm: "2026-10-10",
    localizacao: "Trecho",
    evidencia: "O que sustenta.",
  });
  const registro = (id: string, fontes: GameSource[], dia = "1990-01-01"): GameRecord => ({
    id,
    slug: id,
    titulo: `Registro ${id}`,
    data: { valor: dia, precisao: "dia" },
    categoria: "eleicoes",
    resumo: "Resumo.",
    contexto: "Contexto.",
    localizacao: { tipo: "nacional" },
    fontes,
    editorial: { estado: "revisado", revisao: { tipo: "assistida-por-ia", revisadoPor: "Fixture", revisadoEm: "2026-10-10" } },
    ordemEmAberto: false,
  });
  // O conteúdo de quando a pessoa jogou, e duas correções: o documento do capítulo 3, e a data de um registro do capítulo 2.
  const ANTES: TaskContent = { registros: { e: registro("e", [fonte("f1")]) }, decisoes: {} };
  const DOCUMENTO_CORRIGIDO: TaskContent = { registros: { e: registro("e", [fonte("f2")]) }, decisoes: {} };
  const DATA_CORRIGIDA: TaskContent = { registros: { e: registro("e", [fonte("f1")]), b: registro("b", [], "1985-03-04") }, decisoes: {} };
  const inicial = initialProgress("lula", CAPITULOS);
  const assinada = (spec: ChapterSpec, conteudo: TaskContent): TaskState =>
    spec.tarefa.tipo === "registro"
      ? { recolhidos: [...spec.eventIds], confirmada: false, tentativas: 0 }
      : { recolhidos: [...spec.eventIds], confirmada: true, tentativas: 1, assinatura: taskSignature(spec.tarefa, conteudo) };
  /** Os capítulos dados concluídos, em ordem, com as respostas assinadas pelo conteúdo de então; ida e volta pelo JSON. */
  const jogado = (concluidos: readonly ChapterSpec[]) => {
    let progresso = inicial;
    for (const spec of concluidos) progresso = completeChapter(withTaskState(progresso, spec.id, assinada(spec, ANTES)), CAPITULOS, spec.id);
    return JSON.parse(JSON.stringify(progresso)) as unknown;
  };
  const responder = (progresso: PlayerProgress, spec: ChapterSpec, conteudo: TaskContent) =>
    completeChapter(
      withTaskState(progresso, spec.id, { ...taskStateOf(progresso, spec.id), confirmada: true, tentativas: 2, assinatura: taskSignature(spec.tarefa, conteudo) }),
      CAPITULOS,
      spec.id,
    );

  it("com a trajetória inteira concluída, corrigir o documento do capítulo 3 reabre só ele, e o capítulo 4 guarda o que tinha", () => {
    const salvo = jogado(CAPITULOS);
    expect(statuses(parseProgress(salvo, "lula", CAPITULOS, ANTES)!)).toEqual(["concluido", "concluido", "concluido", "concluido"]);
    const lido = parseProgress(salvo, "lula", CAPITULOS, DOCUMENTO_CORRIGIDO)!;
    expect(statuses(lido)).toEqual(["concluido", "concluido", "disponivel", "bloqueado"]);
    // Só a resposta do capítulo 3 caiu: o recolhido e as tentativas ficam.
    expect(taskStateOf(lido, TRES.id)).toEqual({ recolhidos: ["e", "z"], confirmada: false, tentativas: 1 });
    // O capítulo 4 fica fechado até o 3 ser refeito, e não perde nada.
    expect(taskStateOf(lido, QUATRO.id)).toEqual(assinada(QUATRO, ANTES));
    expect(taskStateOf(lido, DOIS.id)).toEqual(assinada(DOIS, DOCUMENTO_CORRIGIDO));
  });

  it("refeita a resposta e atravessada a saída, os capítulos seguintes que estavam completos voltam a concluídos", () => {
    const lido = parseProgress(jogado(CAPITULOS), "lula", CAPITULOS, DOCUMENTO_CORRIGIDO)!;
    const refeito = responder(lido, TRES, DOCUMENTO_CORRIGIDO);
    expect(statuses(refeito)).toEqual(["concluido", "concluido", "concluido", "concluido"]);
    expect(isTrajectoryComplete(refeito, CAPITULOS)).toBe(true);
    // E fica assim depois de salvar e ler de novo.
    expect(parseProgress(JSON.parse(JSON.stringify(refeito)), "lula", CAPITULOS, DOCUMENTO_CORRIGIDO)).toEqual(refeito);
  });

  it("a volta a concluído para no primeiro capítulo seguinte que não está completo, que fica disponível", () => {
    // Capítulos 1 a 3 concluídos e o 4 por fazer; a correção é no capítulo 2 (a data de um dos registros da ordem).
    const lido = parseProgress(jogado([UM, DOIS, TRES]), "lula", CAPITULOS, DATA_CORRIGIDA)!;
    expect(statuses(lido)).toEqual(["concluido", "disponivel", "bloqueado", "bloqueado"]);
    expect(taskStateOf(lido, DOIS.id)).toEqual({ recolhidos: ["b", "c", "y"], confirmada: false, tentativas: 1 });
    expect(taskStateOf(lido, TRES.id)).toEqual(assinada(TRES, DATA_CORRIGIDA));
    const refeito = responder(lido, DOIS, DATA_CORRIGIDA);
    expect(statuses(refeito)).toEqual(["concluido", "concluido", "concluido", "disponivel"]);
    expect(currentChapter(refeito, CAPITULOS)).toBe(QUATRO);
  });

  it("em uma partida comum, concluir um capítulo só libera o seguinte: a sequência não pula capítulo por fazer", () => {
    const umFeito = completeChapter(withTaskState(inicial, UM.id, assinada(UM, ANTES)), CAPITULOS, UM.id);
    expect(statuses(umFeito)).toEqual(["concluido", "disponivel", "bloqueado", "bloqueado"]);
    // Um capítulo bloqueado com parte recolhida (salvo antigo ou inválido) abre como disponível, e não como concluído.
    const comParte: PlayerProgress = {
      ...umFeito,
      capitulos: { ...umFeito.capitulos, [TRES.id]: { status: "bloqueado", tarefa: { recolhidos: ["e"], confirmada: false, tentativas: 0 } } },
    };
    const doisFeitos = completeChapter(withTaskState(comParte, DOIS.id, assinada(DOIS, ANTES)), CAPITULOS, DOIS.id);
    expect(statuses(doisFeitos)).toEqual(["concluido", "concluido", "disponivel", "bloqueado"]);
    expect(taskStateOf(doisFeitos, TRES.id).recolhidos).toEqual(["e"]);
  });
});
