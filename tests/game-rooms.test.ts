// As salas do jogo (D-125): a progressão corre dentro de cada sala, o
// progresso salvo guarda todas, a leitura reaplica a regra por sala e migra as
// versões 3 e 4 para a atual. As preferências do jogo são
// lidas com tolerância.

import { describe, expect, it } from "vitest";

import { taskSignature, type TaskContent } from "@/lib/game/mission";
import { DEFAULT_PREFERENCES, PREFERENCES_KEY, parsePreferences, serializePreferences } from "@/lib/game/preferences";
import { chapterStatus, completeChapter, currentChapter, hasStarted, initialProgress, isTrajectoryComplete, parseProgress, taskStateOf, withTaskState } from "@/lib/game/progress";
import { DEFAULT_ROOM, ROOMS, ROOM_IDS, chaptersInRoom, groupByRoom, isRoomId, roomOf, roomsWithChapters } from "@/lib/game/rooms";
import { PROGRESS_VERSION, type ChapterSpec, type RoomId, type TaskSpec, type TaskState } from "@/lib/game/types";

const capitulo = (id: string, sala: RoomId, numero: number, tarefa: TaskSpec, eventIds: string[] = [], decisaoIds: string[] = []): ChapterSpec => ({
  id,
  personagem: "lula",
  sala,
  numero,
  titulo: id,
  periodo: { de: 2000, ate: 2000 },
  motivo: "Fixture dos testes.",
  objetivo: "Fixture dos testes.",
  eventIds,
  decisaoIds,
  tarefa,
  cena: "sindicato",
  epoca: "atual",
});

// Duas salas: a trajetória com dois capítulos e a sala temática com um capítulo de decisão.
const H1 = capitulo("h1", "historico", 1, { tipo: "registro", eventId: "a" }, ["a", "b"]);
const H2 = capitulo("h2", "historico", 2, { tipo: "fonte", eventId: "c" }, ["c"]);
const E1 = capitulo("e1", "economia", 1, { tipo: "decisao", decisaoId: "d1" }, [], ["d1", "d2"]);
const CAPITULOS = [H1, H2, E1];
/** Os capítulos de teste não têm registros no conteúdo: a assinatura resume dados ausentes. */
const SEM_CONTEUDO: TaskContent = { registros: {}, decisoes: {} };

const feita = (spec: ChapterSpec, extra: Partial<TaskState> = {}): TaskState => ({
  recolhidos: [...spec.eventIds, ...(spec.decisaoIds ?? [])],
  confirmada: spec.tarefa.tipo !== "registro",
  tentativas: spec.tarefa.tipo === "registro" ? 0 : 1,
  ...(spec.tarefa.tipo === "registro" ? {} : { assinatura: taskSignature(spec.tarefa, SEM_CONTEUDO) }),
  ...extra,
});

describe("salas", () => {
  it("há três salas, a Histórico é a padrão, e cada uma tem nome, natureza e tema", () => {
    expect(ROOM_IDS).toEqual(["historico", "economia", "seguranca-publica"]);
    expect(DEFAULT_ROOM).toBe("historico");
    expect(roomOf("historico").natureza).toBe("investigacao");
    expect(roomOf("historico").tema).toBeNull();
    expect(roomOf("economia").tema).toBe("economia");
    expect(roomOf("seguranca-publica").tema).toBe("seguranca-publica");
    for (const sala of ROOMS) {
      expect(sala.nome.length).toBeGreaterThan(0);
      expect(sala.descricao).not.toMatch(/\b(Lula|Bolsonaro)\b/);
    }
    expect(isRoomId("economia")).toBe(true);
    expect(isRoomId("cenario")).toBe(false);
  });

  it("agrupa os capítulos por sala, na ordem das salas, só as com capítulo", () => {
    expect(roomsWithChapters(CAPITULOS).map((sala) => sala.id)).toEqual(["historico", "economia"]);
    expect(chaptersInRoom(CAPITULOS, "historico")).toEqual([H1, H2]);
    expect(chaptersInRoom(CAPITULOS, "seguranca-publica")).toEqual([]);
    expect(groupByRoom(CAPITULOS)).toEqual([
      ["historico", [H1, H2]],
      ["economia", [E1]],
    ]);
  });
});

describe("progressão por sala", () => {
  it("no início, o primeiro capítulo de cada sala está disponível", () => {
    const inicial = initialProgress("lula", CAPITULOS);
    expect(inicial.versao).toBe(PROGRESS_VERSION);
    expect([H1, H2, E1].map((spec) => chapterStatus(inicial, spec.id))).toEqual(["disponivel", "bloqueado", "disponivel"]);
  });

  it("concluir um capítulo libera o seguinte da mesma sala, e não mexe na outra", () => {
    const inicial = initialProgress("lula", CAPITULOS);
    const depois = completeChapter(withTaskState(inicial, H1.id, feita(H1)), CAPITULOS, H1.id);
    expect([H1, H2, E1].map((spec) => chapterStatus(depois, spec.id))).toEqual(["concluido", "disponivel", "disponivel"]);
    // A sala temática conclui sozinha; o fim dela não abre nada na trajetória.
    const comEvidencia: TaskState = { ...feita(E1), evidencia: true };
    const salaFeita = completeChapter(withTaskState(depois, E1.id, comEvidencia), CAPITULOS, E1.id);
    expect(chapterStatus(salaFeita, E1.id)).toBe("concluido");
    expect(chapterStatus(salaFeita, H2.id)).toBe("disponivel");
    expect(isTrajectoryComplete(salaFeita, chaptersInRoom(CAPITULOS, "economia"))).toBe(true);
    expect(isTrajectoryComplete(salaFeita, chaptersInRoom(CAPITULOS, "historico"))).toBe(false);
    expect(currentChapter(salaFeita, chaptersInRoom(CAPITULOS, "historico"))).toBe(H2);
    expect(currentChapter(salaFeita, chaptersInRoom(CAPITULOS, "economia"))).toBe(E1);
  });

  it("hasStarted vê o que foi feito nos capítulos dados", () => {
    const inicial = initialProgress("lula", CAPITULOS);
    expect(hasStarted(inicial, CAPITULOS)).toBe(false);
    const umRecolhido = withTaskState(inicial, E1.id, { recolhidos: ["d2"], confirmada: false, tentativas: 0 });
    expect(hasStarted(umRecolhido, chaptersInRoom(CAPITULOS, "economia"))).toBe(true);
    expect(hasStarted(umRecolhido, chaptersInRoom(CAPITULOS, "historico"))).toBe(false);
  });

  it("a leitura reaplica a progressão em cada sala, sem um capítulo de uma sala bloquear a outra", () => {
    const inicial = initialProgress("lula", CAPITULOS);
    const salvo = JSON.parse(
      JSON.stringify({
        ...inicial,
        capitulos: {
          [H1.id]: { status: "disponivel", tarefa: { recolhidos: ["a"], confirmada: false, tentativas: 0 } },
          [H2.id]: { status: "disponivel", tarefa: { recolhidos: [], confirmada: false, tentativas: 0 } },
          [E1.id]: { status: "concluido", tarefa: { ...feita(E1), evidencia: true } },
        },
      }),
    );
    const lido = parseProgress(salvo, "lula", CAPITULOS, SEM_CONTEUDO)!;
    expect([H1, H2, E1].map((spec) => chapterStatus(lido, spec.id))).toEqual(["disponivel", "bloqueado", "concluido"]);
    expect(taskStateOf(lido, E1.id)).toEqual({ ...feita(E1), evidencia: true });
  });

  it("a etapa de evidência da tarefa de decisão vai e volta pelo JSON, e só vale com a decisão recolhida e a tarefa de decisão", () => {
    const inicial = initialProgress("lula", CAPITULOS);
    // A etapa confirmada leva a assinatura da tarefa (D-130): sem ela, a versão atual não aceita a evidência.
    const comEvidencia: TaskState = { recolhidos: ["d1"], confirmada: false, tentativas: 1, evidencia: true, assinatura: taskSignature(E1.tarefa, SEM_CONTEUDO) };
    const progresso = withTaskState(inicial, E1.id, comEvidencia);
    const relido = parseProgress(JSON.parse(JSON.stringify(progresso)), "lula", CAPITULOS, SEM_CONTEUDO)!;
    expect(taskStateOf(relido, E1.id)).toEqual(comEvidencia);
    // Sem a decisão recolhida, a evidência cai, mesmo com a assinatura certa: é a guarda dos registros que decide.
    const semRecolher = JSON.parse(JSON.stringify({ ...progresso, capitulos: { ...progresso.capitulos, [E1.id]: { status: "disponivel", tarefa: { ...comEvidencia, recolhidos: ["d2"] } } } }));
    expect(taskStateOf(parseProgress(semRecolher, "lula", CAPITULOS, SEM_CONTEUDO)!, E1.id)).toEqual({ recolhidos: ["d2"], confirmada: false, tentativas: 1 });
    // Se a tarefa deixou de ser de decisão, a evidência cai também.
    const E1_FONTE = capitulo("e1", "economia", 1, { tipo: "fonte", eventId: "d1" }, ["d1"], []);
    expect(taskStateOf(parseProgress(JSON.parse(JSON.stringify(progresso)), "lula", [H1, H2, E1_FONTE], SEM_CONTEUDO)!, E1.id)).toEqual({ recolhidos: ["d1"], confirmada: false, tentativas: 1 });
    // Nos salvos da versão 4, que não assinavam a etapa, são as duas guardas (a decisão recolhida e a tarefa ainda de decisão) que decidem.
    const v4 = (recolhidos: string[]) => ({ versao: 4, personagem: "lula", capitulos: { [E1.id]: { status: "disponivel", tarefa: { recolhidos, confirmada: false, tentativas: 1, evidencia: true } } } });
    expect(taskStateOf(parseProgress(v4(["d1"]), "lula", CAPITULOS, SEM_CONTEUDO)!, E1.id)).toEqual(comEvidencia);
    expect(taskStateOf(parseProgress(v4(["d2"]), "lula", CAPITULOS, SEM_CONTEUDO)!, E1.id)).toEqual({ recolhidos: ["d2"], confirmada: false, tentativas: 1 });
    expect(taskStateOf(parseProgress(v4(["d1"]), "lula", [H1, H2, E1_FONTE], SEM_CONTEUDO)!, E1.id)).toEqual({ recolhidos: ["d1"], confirmada: false, tentativas: 1 });
    // Tipo errado recusa o salvo.
    const estranho = JSON.parse(JSON.stringify({ ...progresso, capitulos: { ...progresso.capitulos, [E1.id]: { status: "disponivel", tarefa: { ...comEvidencia, evidencia: "sim" } } } }));
    expect(parseProgress(estranho, "lula", CAPITULOS, SEM_CONTEUDO)).toBeNull();
  });

  it("um progresso da versão 3 é lido: a assinatura vale, e a evidência, que a 3 não tinha, é ignorada", () => {
    const v3 = {
      versao: 3,
      personagem: "lula",
      capitulos: {
        [H1.id]: { status: "concluido", tarefa: feita(H1) },
        [H2.id]: { status: "disponivel", tarefa: { recolhidos: ["c"], confirmada: true, tentativas: 1, assinatura: "fonte:c" } },
        [E1.id]: { status: "disponivel", tarefa: { recolhidos: ["d1"], confirmada: false, tentativas: 0, evidencia: true } },
      },
    };
    const lido = parseProgress(v3, "lula", CAPITULOS, SEM_CONTEUDO)!;
    expect(lido.versao).toBe(PROGRESS_VERSION);
    expect([H1, H2, E1].map((spec) => chapterStatus(lido, spec.id))).toEqual(["concluido", "disponivel", "disponivel"]);
    expect(taskStateOf(lido, H2.id)).toEqual({ recolhidos: ["c"], confirmada: true, tentativas: 1, assinatura: taskSignature(H2.tarefa, SEM_CONTEUDO) });
    expect(taskStateOf(lido, E1.id)).toEqual({ recolhidos: ["d1"], confirmada: false, tentativas: 0 });
  });

  it("uma resposta da versão 3 não conclui uma tarefa que virou de decisão sob o mesmo capítulo", () => {
    // O capítulo 2 pedia o documento de `c`; agora pede a decisão `d9`. A confirmação antiga cai, o recolhido fica.
    const H2_DECISAO = capitulo("h2", "historico", 2, { tipo: "decisao", decisaoId: "d9" }, ["c"], ["d9"]);
    const v3 = { versao: 3, personagem: "lula", capitulos: { [H1.id]: { status: "concluido", tarefa: feita(H1) }, [H2.id]: { status: "concluido", tarefa: { recolhidos: ["c"], confirmada: true, tentativas: 1, assinatura: "fonte:c" } } } };
    const lido = parseProgress(v3, "lula", [H1, H2_DECISAO, E1], SEM_CONTEUDO)!;
    expect(chapterStatus(lido, H2.id)).toBe("disponivel");
    expect(taskStateOf(lido, H2.id)).toEqual({ recolhidos: ["c"], confirmada: false, tentativas: 1 });
  });
});

describe("preferências do jogo", () => {
  it("lê com tolerância e grava só o que conhece", () => {
    expect(PREFERENCES_KEY).toBe("atlas-politico:jogo:preferencias");
    expect(DEFAULT_PREFERENCES).toEqual({ humor: true });
    expect(parsePreferences(null)).toEqual({ humor: true });
    expect(parsePreferences("x")).toEqual({ humor: true });
    expect(parsePreferences([])).toEqual({ humor: true });
    expect(parsePreferences({ humor: "nao" })).toEqual({ humor: true });
    expect(parsePreferences({ humor: false, outra: 1 })).toEqual({ humor: false });
    expect(JSON.parse(serializePreferences({ humor: false }))).toEqual({ humor: false });
  });
});
