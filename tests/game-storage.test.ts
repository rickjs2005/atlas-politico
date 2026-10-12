// Onde o progresso fica (src/lib/game/storage.ts): uma chave por personagem
// no armazenamento do navegador, com cópia na página quando ele recusa. Nada
// aqui apaga o armazenamento inteiro: apagar o progresso de um personagem não
// toca no do outro, nas preferências nem em chaves de outras páginas.

import { describe, expect, it } from "vitest";

import { DEFAULT_PREFERENCES, PREFERENCES_KEY, parsePreferences, serializePreferences } from "@/lib/game/preferences";
import { initialProgress, openPhase, type PhaseKey } from "@/lib/game/progress";
import { STORAGE_PREFIX, createProgressStore, storageKey } from "@/lib/game/storage";
import { PROGRESS_VERSION, type PlayerProgress } from "@/lib/game/types";

const FASES: PhaseKey[] = [
  { id: "t1", sala: "historico" },
  { id: "t2", sala: "historico" },
];
const ASSINATURAS = { t1: "t1:pergunta@00000001", t2: "t2:pergunta@00000002" };

/** Um armazenamento de teste, com a mesma interface do navegador e contagem do que foi apagado. */
function fakeStorage(inicial: Record<string, string> = {}) {
  const dados = new Map(Object.entries(inicial));
  const removidas: string[] = [];
  return {
    dados,
    removidas,
    getItem: (chave: string) => dados.get(chave) ?? null,
    setItem: (chave: string, valor: string) => void dados.set(chave, valor),
    removeItem: (chave: string) => {
      removidas.push(chave);
      dados.delete(chave);
    },
  };
}

const loja = (personagem: "lula" | "flavio-bolsonaro", storage: ReturnType<typeof fakeStorage> | null, memoria = new Map<string, PlayerProgress>()) =>
  createProgressStore(personagem, FASES, ASSINATURAS, storage, memoria);

describe("armazenamento do progresso", () => {
  it("cada personagem tem a própria chave", () => {
    expect(storageKey("lula")).toBe(`${STORAGE_PREFIX}:lula`);
    expect(storageKey("flavio-bolsonaro")).toBe(`${STORAGE_PREFIX}:flavio-bolsonaro`);
    expect(PREFERENCES_KEY.startsWith(STORAGE_PREFIX)).toBe(true);
    expect(PREFERENCES_KEY).not.toBe(storageKey("lula"));
  });

  it("sem nada salvo, não há progresso; o que é salvo volta em outra visita", () => {
    const storage = fakeStorage();
    expect(loja("lula", storage).load()).toBeNull();
    const progresso = openPhase(initialProgress("lula"), FASES[1]!);
    expect(loja("lula", storage).save(progresso)).toBe(true);
    // Outra visita: outra memória de página, o mesmo armazenamento.
    expect(loja("lula", storage).load()).toEqual(progresso);
    expect(loja("lula", storage).duravel).toBe(true);
    // O outro personagem não vê esse progresso.
    expect(loja("flavio-bolsonaro", storage).load()).toBeNull();
  });

  it("apagar o progresso de um personagem remove só a chave dele", () => {
    const storage = fakeStorage({ [PREFERENCES_KEY]: serializePreferences({ humor: false, cenario: true }), "outra-pagina:chave": "fica" });
    loja("lula", storage).save(openPhase(initialProgress("lula"), FASES[0]!));
    loja("flavio-bolsonaro", storage).save(openPhase(initialProgress("flavio-bolsonaro"), FASES[1]!));
    const daLula = loja("lula", storage);
    daLula.clear();
    expect(storage.removidas).toEqual([storageKey("lula")]);
    expect(daLula.load()).toBeNull();
    expect(loja("flavio-bolsonaro", storage).load()?.posicao).toEqual({ historico: "t2" });
    expect(storage.dados.get(PREFERENCES_KEY)).toBe(serializePreferences({ humor: false, cenario: true }));
    expect(storage.dados.get("outra-pagina:chave")).toBe("fica");
  });

  it("conteúdo salvo que não dá para ler vira começo, sem apagar o que estava lá", () => {
    const storage = fakeStorage({ [storageKey("lula")]: "{isto não é JSON" });
    expect(loja("lula", storage).load()).toBeNull();
    expect(storage.dados.get(storageKey("lula"))).toBe("{isto não é JSON");
    expect(storage.removidas).toEqual([]);
  });

  it("progresso de um formato anterior é lido sem ser apagado: só a gravação seguinte troca o formato, com o antigo dentro", () => {
    const antigo = JSON.stringify({ versao: 5, personagem: "lula", capitulos: { "lula-1-sindicato": { status: "concluido" } } });
    const storage = fakeStorage({ [storageKey("lula")]: antigo });
    const armazem = loja("lula", storage);
    const migrado = armazem.load()!;
    expect(migrado.versao).toBe(PROGRESS_VERSION);
    expect(migrado.legado).toEqual({ versao: 5, capitulos: { "lula-1-sindicato": { status: "concluido" } } });
    // Ler não grava nem apaga.
    expect(storage.dados.get(storageKey("lula"))).toBe(antigo);
    expect(storage.removidas).toEqual([]);
    armazem.save(migrado);
    expect(JSON.parse(storage.dados.get(storageKey("lula"))!).legado.capitulos).toEqual({ "lula-1-sindicato": { status: "concluido" } });
  });

  it("sem armazenamento, o jogo segue com a cópia da página e avisa que não é durável", () => {
    const memoria = new Map<string, PlayerProgress>();
    const armazem = loja("lula", null, memoria);
    expect(armazem.duravel).toBe(false);
    expect(armazem.load()).toBeNull();
    const progresso = openPhase(initialProgress("lula"), FASES[0]!);
    expect(armazem.save(progresso)).toBe(false);
    // Outra montagem do jogo na mesma página encontra o progresso.
    expect(loja("lula", null, memoria).load()).toBe(progresso);
    loja("lula", null, memoria).clear();
    expect(loja("lula", null, memoria).load()).toBeNull();
  });

  it("quando o armazenamento recusa a gravação, a cópia da página guarda o progresso da visita", () => {
    const storage = fakeStorage();
    storage.setItem = () => {
      throw new Error("cota excedida");
    };
    const memoria = new Map<string, PlayerProgress>();
    const armazem = loja("lula", storage, memoria);
    const progresso = openPhase(initialProgress("lula"), FASES[1]!);
    expect(armazem.save(progresso)).toBe(false);
    expect(armazem.load()).toBe(progresso);
  });
});

describe("preferências do jogo", () => {
  it("o padrão é com humor e com cenário, e qualquer coisa fora do formato vira o padrão", () => {
    expect(DEFAULT_PREFERENCES).toEqual({ humor: true, cenario: true });
    for (const invalido of [null, undefined, 3, "x", [], { humor: "sim" }]) expect(parsePreferences(invalido)).toEqual(DEFAULT_PREFERENCES);
    expect(parsePreferences({ humor: false })).toEqual({ humor: false, cenario: true });
    expect(parsePreferences({ cenario: false, outro: 1 })).toEqual({ humor: true, cenario: false });
  });

  it("o que é gravado volta igual, e não carrega progresso", () => {
    const texto = serializePreferences({ humor: false, cenario: false });
    expect(parsePreferences(JSON.parse(texto))).toEqual({ humor: false, cenario: false });
    expect(Object.keys(JSON.parse(texto)).sort()).toEqual(["cenario", "humor"]);
  });
});
