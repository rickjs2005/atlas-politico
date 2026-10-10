// Progresso do jogador: os três estados de capítulo, as transições e a
// leitura tolerante do formato salvo. Um capítulo só é concluído com a saída
// aberta: a tarefa cumprida e todos os registros do capítulo recolhidos.

import { describe, expect, it } from "vitest";

import {
  chapterStatus,
  completeChapter,
  countCompleted,
  currentChapter,
  initialProgress,
  isTrajectoryComplete,
  parseProgress,
  taskStateOf,
  withTaskState,
} from "@/lib/game/progress";
import { PROGRESS_VERSION, type ChapterSpec, type PlayerProgress, type TaskSpec, type TaskState } from "@/lib/game/types";

const capitulo = (numero: number, tarefa: TaskSpec, outros: string[] = []): ChapterSpec => ({
  id: `teste-${numero}`,
  personagem: "lula",
  numero,
  titulo: `Capítulo ${numero}`,
  periodo: { de: 1970 + numero, ate: 1970 + numero },
  motivo: "Fixture dos testes.",
  objetivo: "Fixture dos testes.",
  eventIds: [...(tarefa.tipo === "registro" ? [tarefa.eventId] : tarefa.eventIds), ...outros],
  tarefa,
  cena: "sindicato",
});

// Três capítulos: registro, ordem, registro. Os dois primeiros têm um
// registro a mais, que a tarefa não pede e a saída exige.
const CAPITULOS: readonly ChapterSpec[] = [
  capitulo(1, { tipo: "registro", eventId: "a" }, ["x"]),
  capitulo(2, { tipo: "ordem", eventIds: ["b", "c"] }, ["y"]),
  capitulo(3, { tipo: "registro", eventId: "d" }),
];
const [UM, DOIS, TRES] = CAPITULOS as [ChapterSpec, ChapterSpec, ChapterSpec];

const VAZIA: TaskState = { recolhidos: [], ordemConfirmada: false, tentativas: 0 };

/** A tarefa cumprida só com os registros que ela pede: se o capítulo tem outros, a saída continua fechada. */
function soATarefa(spec: ChapterSpec): TaskState {
  if (spec.tarefa.tipo === "registro") return { recolhidos: [spec.tarefa.eventId], ordemConfirmada: false, tentativas: 0 };
  return { recolhidos: [...spec.tarefa.eventIds], ordemConfirmada: true, tentativas: 1 };
}

/** Um estado que abre a saída do capítulo: a tarefa cumprida e todos os registros recolhidos. */
function feita(spec: ChapterSpec): TaskState {
  const deOrdem = spec.tarefa.tipo === "ordem";
  return { recolhidos: [...spec.eventIds], ordemConfirmada: deOrdem, tentativas: deOrdem ? 1 : 0 };
}

/** Recolhe tudo, cumpre a tarefa e atravessa a saída do capítulo. */
function concluir(progresso: PlayerProgress, spec: ChapterSpec): PlayerProgress {
  return completeChapter(withTaskState(progresso, spec.id, feita(spec)), CAPITULOS, spec.id);
}

const statuses = (progresso: PlayerProgress) => CAPITULOS.map((spec) => chapterStatus(progresso, spec.id));

/** Ida e volta pelo JSON, como o armazenamento faz. */
const relido = (progresso: PlayerProgress) => parseProgress(JSON.parse(JSON.stringify(progresso)), "lula", CAPITULOS);

describe("início da trajetória", () => {
  it("o primeiro capítulo está disponível e os demais bloqueados", () => {
    const inicial = initialProgress("lula", CAPITULOS);
    expect(inicial.versao).toBe(PROGRESS_VERSION);
    expect(inicial.personagem).toBe("lula");
    expect(statuses(inicial)).toEqual(["disponivel", "bloqueado", "bloqueado"]);
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
  const umRecolhido: TaskState = { recolhidos: ["a"], ordemConfirmada: false, tentativas: 0 };

  it("troca a tarefa de um capítulo disponível sem alterar o progresso recebido", () => {
    const depois = withTaskState(inicial, UM.id, umRecolhido);
    expect(taskStateOf(depois, UM.id)).toEqual(umRecolhido);
    expect(chapterStatus(depois, UM.id)).toBe("disponivel");
    expect(taskStateOf(inicial, UM.id)).toEqual(VAZIA);
  });

  it("capítulo bloqueado não muda", () => {
    expect(withTaskState(inicial, DOIS.id, { recolhidos: ["b"], ordemConfirmada: false, tentativas: 0 })).toBe(inicial);
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
    const quaseLa = withTaskState(inicial, UM.id, { recolhidos: ["x"], ordemConfirmada: false, tentativas: 0 });
    expect(completeChapter(quaseLa, CAPITULOS, UM.id)).toBe(quaseLa);
  });

  it("a tarefa cumprida não conclui o capítulo enquanto falta recolher algum registro", () => {
    const soTarefa = withTaskState(inicial, UM.id, soATarefa(UM));
    expect(completeChapter(soTarefa, CAPITULOS, UM.id)).toBe(soTarefa);
    expect(statuses(soTarefa)).toEqual(["disponivel", "bloqueado", "bloqueado"]);
    // Com o registro que faltava, conclui.
    const tudo = withTaskState(soTarefa, UM.id, feita(UM));
    expect(statuses(completeChapter(tudo, CAPITULOS, UM.id))).toEqual(["concluido", "disponivel", "bloqueado"]);
  });

  it("ao concluir, o capítulo vira concluído e o seguinte fica disponível", () => {
    const depois = concluir(inicial, UM);
    expect(statuses(depois)).toEqual(["concluido", "disponivel", "bloqueado"]);
    // O estado da tarefa concluída é mantido.
    expect(taskStateOf(depois, UM.id)).toEqual(feita(UM));
  });

  it("não altera o progresso recebido", () => {
    const comTarefa = withTaskState(inicial, UM.id, feita(UM));
    completeChapter(comTarefa, CAPITULOS, UM.id);
    expect(statuses(comTarefa)).toEqual(["disponivel", "bloqueado", "bloqueado"]);
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

  it("a tarefa de ordem exige a ordem confirmada, e não só os registros recolhidos", () => {
    const segundo = concluir(inicial, UM);
    const soRecolhidos = withTaskState(segundo, DOIS.id, { recolhidos: ["b", "c", "y"], ordemConfirmada: false, tentativas: 2 });
    expect(completeChapter(soRecolhidos, CAPITULOS, DOIS.id)).toBe(soRecolhidos);
    expect(statuses(concluir(segundo, DOIS))).toEqual(["concluido", "concluido", "disponivel"]);
  });

  it("no capítulo de ordem, a ordem confirmada não conclui sem o registro que a tarefa não pede", () => {
    const segundo = concluir(inicial, UM);
    const semOTerceiro = withTaskState(segundo, DOIS.id, soATarefa(DOIS));
    expect(completeChapter(semOTerceiro, CAPITULOS, DOIS.id)).toBe(semOTerceiro);
    expect(statuses(semOTerceiro)).toEqual(["concluido", "disponivel", "bloqueado"]);
  });

  it("concluir o último capítulo não quebra e completa a trajetória", () => {
    const fim = concluir(concluir(concluir(inicial, UM), DOIS), TRES);
    expect(statuses(fim)).toEqual(["concluido", "concluido", "concluido"]);
    expect(isTrajectoryComplete(fim, CAPITULOS)).toBe(true);
    expect(completeChapter(fim, CAPITULOS, TRES.id)).toBe(fim);
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
  const todos = concluir(concluir(umFeito, DOIS), TRES);

  it("o capítulo atual é o primeiro disponível", () => {
    expect(currentChapter(inicial, CAPITULOS)).toBe(UM);
    expect(currentChapter(umFeito, CAPITULOS)).toBe(DOIS);
  });

  it("com tudo concluído, o atual é o último", () => {
    expect(currentChapter(todos, CAPITULOS)).toBe(TRES);
  });

  it("conta os concluídos e sabe quando a trajetória acabou", () => {
    expect(countCompleted(inicial, CAPITULOS)).toBe(0);
    expect(countCompleted(umFeito, CAPITULOS)).toBe(1);
    expect(countCompleted(todos, CAPITULOS)).toBe(3);
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
    expect(parseProgress(null, "lula", CAPITULOS)).toBeNull();
    expect(parseProgress(undefined, "lula", CAPITULOS)).toBeNull();
    expect(parseProgress("texto", "lula", CAPITULOS)).toBeNull();
    expect(parseProgress(42, "lula", CAPITULOS)).toBeNull();
    expect(parseProgress([], "lula", CAPITULOS)).toBeNull();
    expect(parseProgress([inicial], "lula", CAPITULOS)).toBeNull();
  });

  it("recusa versão errada ou ausente", () => {
    expect(parseProgress(salvo({ versao: PROGRESS_VERSION + 1 }), "lula", CAPITULOS)).toBeNull();
    expect(parseProgress(salvo({ versao: String(PROGRESS_VERSION) }), "lula", CAPITULOS)).toBeNull();
    const semVersao = salvo();
    delete semVersao.versao;
    expect(parseProgress(semVersao, "lula", CAPITULOS)).toBeNull();
  });

  it("recusa o progresso de outro personagem", () => {
    expect(parseProgress(salvo(), "flavio-bolsonaro", CAPITULOS)).toBeNull();
    expect(parseProgress(salvo({ personagem: "flavio-bolsonaro" }), "lula", CAPITULOS)).toBeNull();
  });

  it("recusa capítulos que não são um objeto", () => {
    expect(parseProgress(salvo({ capitulos: [] }), "lula", CAPITULOS)).toBeNull();
    expect(parseProgress(salvo({ capitulos: null }), "lula", CAPITULOS)).toBeNull();
    const semCapitulos = salvo();
    delete semCapitulos.capitulos;
    expect(parseProgress(semCapitulos, "lula", CAPITULOS)).toBeNull();
  });

  it("capítulo ausente entra bloqueado, ou disponível se é o próximo da fila", () => {
    const soOPrimeiro = salvo({ capitulos: { [UM.id]: entrada("concluido", feita(UM)) } });
    expect(statuses(parseProgress(soOPrimeiro, "lula", CAPITULOS)!)).toEqual(["concluido", "disponivel", "bloqueado"]);

    const semOTerceiro = salvo({ capitulos: { [UM.id]: entrada("disponivel"), [DOIS.id]: entrada("bloqueado") } });
    const lido = parseProgress(semOTerceiro, "lula", CAPITULOS)!;
    expect(statuses(lido)).toEqual(["disponivel", "bloqueado", "bloqueado"]);
    expect(taskStateOf(lido, TRES.id)).toEqual(VAZIA);
  });

  it("capítulo que a edição não tem mais é descartado", () => {
    const comExtra = salvo({ capitulos: { ...inicial.capitulos, "capitulo-antigo": entrada("concluido") } });
    const lido = parseProgress(comExtra, "lula", CAPITULOS)!;
    expect(Object.keys(lido.capitulos).sort()).toEqual(CAPITULOS.map((spec) => spec.id).sort());
  });

  it("recusa status inválido e entrada que não é objeto", () => {
    expect(parseProgress(salvo({ capitulos: { ...inicial.capitulos, [UM.id]: entrada("feito") } }), "lula", CAPITULOS)).toBeNull();
    expect(parseProgress(salvo({ capitulos: { ...inicial.capitulos, [UM.id]: entrada("") } }), "lula", CAPITULOS)).toBeNull();
    expect(parseProgress(salvo({ capitulos: { ...inicial.capitulos, [UM.id]: null } }), "lula", CAPITULOS)).toBeNull();
    expect(parseProgress(salvo({ capitulos: { ...inicial.capitulos, [UM.id]: "disponivel" } }), "lula", CAPITULOS)).toBeNull();
  });

  it("recusa tarefa inválida", () => {
    const comTarefa = (tarefa: unknown) => salvo({ capitulos: { ...inicial.capitulos, [UM.id]: entrada("disponivel", tarefa) } });
    expect(parseProgress(salvo({ capitulos: { ...inicial.capitulos, [UM.id]: { status: "disponivel" } } }), "lula", CAPITULOS)).toBeNull();
    expect(parseProgress(comTarefa(null), "lula", CAPITULOS)).toBeNull();
    expect(parseProgress(comTarefa([]), "lula", CAPITULOS)).toBeNull();
    expect(parseProgress(comTarefa({ ...VAZIA, recolhidos: "a" }), "lula", CAPITULOS)).toBeNull();
    expect(parseProgress(comTarefa({ ...VAZIA, recolhidos: ["a", 2] }), "lula", CAPITULOS)).toBeNull();
    expect(parseProgress(comTarefa({ ...VAZIA, tentativas: -1 }), "lula", CAPITULOS)).toBeNull();
    expect(parseProgress(comTarefa({ ...VAZIA, tentativas: 1.5 }), "lula", CAPITULOS)).toBeNull();
    expect(parseProgress(comTarefa({ ...VAZIA, tentativas: "2" }), "lula", CAPITULOS)).toBeNull();
    expect(parseProgress(comTarefa({ ...VAZIA, ordemConfirmada: "sim" }), "lula", CAPITULOS)).toBeNull();
    expect(parseProgress(comTarefa({ recolhidos: [], ordemConfirmada: false }), "lula", CAPITULOS)).toBeNull();
  });

  it("deduplica registros recolhidos, mantendo a primeira ocorrência", () => {
    const repetidos = { recolhidos: ["a", "x", "a", "x"], ordemConfirmada: false, tentativas: 0 };
    const lido = parseProgress(salvo({ capitulos: { ...inicial.capitulos, [UM.id]: entrada("disponivel", repetidos) } }), "lula", CAPITULOS)!;
    expect(taskStateOf(lido, UM.id).recolhidos).toEqual(["a", "x"]);
  });

  it("com dois capítulos disponíveis, reaplica a progressão: só o primeiro fica aberto", () => {
    const doisAbertos = salvo({
      capitulos: {
        [UM.id]: entrada("disponivel"),
        [DOIS.id]: entrada("disponivel", { recolhidos: ["b"], ordemConfirmada: false, tentativas: 0 }),
        [TRES.id]: entrada("bloqueado"),
      },
    });
    const lido = parseProgress(doisAbertos, "lula", CAPITULOS)!;
    expect(statuses(lido)).toEqual(["disponivel", "bloqueado", "bloqueado"]);
    // O capítulo que voltou a bloqueado perde o que tinha recolhido.
    expect(taskStateOf(lido, DOIS.id)).toEqual(VAZIA);
  });

  it("um disponível depois de um bloqueado volta para o começo da fila", () => {
    const invertido = salvo({
      capitulos: { [UM.id]: entrada("bloqueado"), [DOIS.id]: entrada("disponivel"), [TRES.id]: entrada("bloqueado") },
    });
    expect(statuses(parseProgress(invertido, "lula", CAPITULOS)!)).toEqual(["disponivel", "bloqueado", "bloqueado"]);
  });

  it("concluído sem a tarefa feita volta a disponível, mantendo o que foi recolhido", () => {
    const parcial = { recolhidos: ["x"], ordemConfirmada: false, tentativas: 0 };
    const inconsistente = salvo({
      capitulos: { [UM.id]: entrada("concluido", parcial), [DOIS.id]: entrada("disponivel"), [TRES.id]: entrada("bloqueado") },
    });
    const lido = parseProgress(inconsistente, "lula", CAPITULOS)!;
    expect(statuses(lido)).toEqual(["disponivel", "bloqueado", "bloqueado"]);
    expect(taskStateOf(lido, UM.id)).toEqual(parcial);
  });

  it("concluído com a tarefa cumprida e registro por recolher volta a disponível, e os seguintes voltam a bloqueado", () => {
    // Guardado quando a saída abria só com a tarefa: o capítulo 1 concluído sem o registro que a tarefa não pede.
    const daRegraAntiga = salvo({
      capitulos: {
        [UM.id]: entrada("concluido", soATarefa(UM)),
        [DOIS.id]: entrada("disponivel", { recolhidos: ["b"], ordemConfirmada: false, tentativas: 0 }),
        [TRES.id]: entrada("bloqueado"),
      },
    });
    const lido = parseProgress(daRegraAntiga, "lula", CAPITULOS)!;
    expect(statuses(lido)).toEqual(["disponivel", "bloqueado", "bloqueado"]);
    // O que já foi recolhido no capítulo que reabriu continua recolhido.
    expect(taskStateOf(lido, UM.id)).toEqual(soATarefa(UM));
    // O capítulo que voltou a bloqueado recomeça.
    expect(taskStateOf(lido, DOIS.id)).toEqual(VAZIA);
    // Recolhido o que faltava, o capítulo conclui de novo.
    expect(statuses(completeChapter(withTaskState(lido, UM.id, feita(UM)), CAPITULOS, UM.id))).toEqual(["concluido", "disponivel", "bloqueado"]);
  });

  it("tarefa de ordem concluída exige a ordem confirmada no salvo", () => {
    const semConfirmar = salvo({
      capitulos: {
        [UM.id]: entrada("concluido", feita(UM)),
        [DOIS.id]: entrada("concluido", { recolhidos: ["b", "c", "y"], ordemConfirmada: false, tentativas: 1 }),
        [TRES.id]: entrada("disponivel"),
      },
    });
    expect(statuses(parseProgress(semConfirmar, "lula", CAPITULOS)!)).toEqual(["concluido", "disponivel", "bloqueado"]);
  });

  it("tarefa de ordem concluída exige todos os registros no salvo, e não só os dois da tarefa", () => {
    const semOTerceiro = salvo({
      capitulos: {
        [UM.id]: entrada("concluido", feita(UM)),
        [DOIS.id]: entrada("concluido", soATarefa(DOIS)),
        [TRES.id]: entrada("disponivel", { recolhidos: ["d"], ordemConfirmada: false, tentativas: 0 }),
      },
    });
    const lido = parseProgress(semOTerceiro, "lula", CAPITULOS)!;
    expect(statuses(lido)).toEqual(["concluido", "disponivel", "bloqueado"]);
    // A ordem já confirmada continua valendo: falta só o registro.
    expect(taskStateOf(lido, DOIS.id)).toEqual(soATarefa(DOIS));
    expect(taskStateOf(lido, TRES.id)).toEqual(VAZIA);
  });

  it("registros que o capítulo não cita mais saem dos recolhidos", () => {
    // O capítulo mudou entre uma edição e outra: o que foi recolhido antes e não existe mais é esquecido.
    const antigo = { recolhidos: ["antigo", "a", "outro"], ordemConfirmada: false, tentativas: 0 };
    const lido = parseProgress(salvo({ capitulos: { ...inicial.capitulos, [UM.id]: entrada("disponivel", antigo) } }), "lula", CAPITULOS)!;
    expect(taskStateOf(lido, UM.id).recolhidos).toEqual(["a"]);
  });

  it("ordem confirmada sem os dois registros do capítulo não vale, e o capítulo volta a disponível", () => {
    // A tarefa de ordem passou a pedir outro par: a confirmação antiga não conclui a nova.
    const deOutroPar = salvo({
      capitulos: {
        [UM.id]: entrada("concluido", feita(UM)),
        [DOIS.id]: entrada("concluido", { recolhidos: ["b", "antigo"], ordemConfirmada: true, tentativas: 2 }),
        [TRES.id]: entrada("disponivel"),
      },
    });
    const lido = parseProgress(deOutroPar, "lula", CAPITULOS)!;
    expect(statuses(lido)).toEqual(["concluido", "disponivel", "bloqueado"]);
    expect(taskStateOf(lido, DOIS.id)).toEqual({ recolhidos: ["b"], ordemConfirmada: false, tentativas: 2 });
  });

  it("ordem confirmada em capítulo que não é de ordem é ignorada", () => {
    const estranho = { recolhidos: ["x"], ordemConfirmada: true, tentativas: 1 };
    const lido = parseProgress(salvo({ capitulos: { ...inicial.capitulos, [UM.id]: entrada("disponivel", estranho) } }), "lula", CAPITULOS)!;
    expect(taskStateOf(lido, UM.id)).toEqual({ recolhidos: ["x"], ordemConfirmada: false, tentativas: 1 });
  });

  it("um progresso coerente volta igual depois da ida e volta por JSON", () => {
    const umFeito = concluir(inicial, UM);
    const emAndamento = withTaskState(umFeito, DOIS.id, { recolhidos: ["c"], ordemConfirmada: false, tentativas: 0 });
    const todos = concluir(concluir(umFeito, DOIS), TRES);
    for (const progresso of [inicial, umFeito, emAndamento, todos]) expect(relido(progresso)).toEqual(progresso);
  });

  it("o resultado é um progresso novo, sem referência ao objeto lido", () => {
    const bruto = salvo();
    const lido = parseProgress(bruto, "lula", CAPITULOS)!;
    expect(lido.capitulos).not.toBe(bruto.capitulos);
    expect(lido).toEqual(inicial);
  });
});
