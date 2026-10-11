// Onde o progresso fica: um armazenamento por personagem, com cópia em memória
// quando o `localStorage` não existe ou recusa. Nada aqui pode quebrar o jogo.
//
// A cópia em memória é da página. Cada teste passa a própria, para um não ver
// o progresso do outro.

import { describe, expect, it } from "vitest";

import type { TaskContent } from "@/lib/game/mission";
import { completeChapter, initialProgress, withTaskState } from "@/lib/game/progress";
import { STORAGE_PREFIX, createProgressStore, storageKey } from "@/lib/game/storage";
import { PROGRESS_VERSION, type ChapterSpec, type PlayerProgress } from "@/lib/game/types";

const capitulo = (numero: number, eventId: string): ChapterSpec => ({
  id: `teste-${numero}`,
  personagem: "lula",
  sala: "historico",
  numero,
  titulo: `Capítulo ${numero}`,
  periodo: { de: 1970 + numero, ate: 1970 + numero },
  motivo: "Fixture dos testes.",
  objetivo: "Fixture dos testes.",
  eventIds: [eventId],
  tarefa: { tipo: "registro", eventId },
  cena: "sindicato",
  epoca: "inicio",
});

const CAPITULOS: readonly ChapterSpec[] = [capitulo(1, "a"), capitulo(2, "b")];
/** Os capítulos de teste só pedem recolher: a leitura não precisa de registros nem de decisões. */
const SEM_CONTEUDO: TaskContent = { registros: {}, decisoes: {} };
const [UM] = CAPITULOS as [ChapterSpec, ChapterSpec];

/** Um progresso com história: o primeiro capítulo concluído. */
function progressoAvancado(): PlayerProgress {
  const inicial = initialProgress("lula", CAPITULOS);
  const comTarefa = withTaskState(inicial, UM.id, { recolhidos: ["a"], confirmada: false, tentativas: 0 });
  return completeChapter(comTarefa, CAPITULOS, UM.id);
}

/** Um `Storage` em memória, com os três métodos que o jogo usa. */
function fakeStorage(inicial: Record<string, string> = {}) {
  const itens = new Map(Object.entries(inicial));
  return {
    itens,
    getItem: (chave: string) => itens.get(chave) ?? null,
    setItem: (chave: string, valor: string) => {
      itens.set(chave, valor);
    },
    removeItem: (chave: string) => {
      itens.delete(chave);
    },
  };
}

const recusa = () => {
  throw new DOMException("cota excedida", "QuotaExceededError");
};

/** A memória de uma página nova. */
const pagina = () => new Map<string, PlayerProgress>();

describe("chave do armazenamento", () => {
  it("tem o prefixo do jogo e o personagem, para os progressos não se misturarem", () => {
    expect(storageKey("lula")).toBe(`${STORAGE_PREFIX}:lula`);
    expect(storageKey("flavio-bolsonaro")).toBe(`${STORAGE_PREFIX}:flavio-bolsonaro`);
    expect(storageKey("lula")).not.toBe(storageKey("flavio-bolsonaro"));
  });
});

describe("com armazenamento durável", () => {
  it("salva e lê o progresso na chave do personagem", () => {
    const storage = fakeStorage();
    const store = createProgressStore("lula", CAPITULOS, SEM_CONTEUDO, storage, pagina());
    const progresso = progressoAvancado();

    expect(store.duravel).toBe(true);
    expect(store.load()).toBeNull();
    expect(store.save(progresso)).toBe(true);
    expect([...storage.itens.keys()]).toEqual([storageKey("lula")]);
    expect(JSON.parse(storage.itens.get(storageKey("lula"))!)).toEqual(progresso);
    expect(store.load()).toEqual(progresso);
  });

  it("outro armazenamento sobre o mesmo Storage lê o que foi salvo, como depois de recarregar", () => {
    const storage = fakeStorage();
    createProgressStore("lula", CAPITULOS, SEM_CONTEUDO, storage, pagina()).save(progressoAvancado());
    expect(createProgressStore("lula", CAPITULOS, SEM_CONTEUDO, storage, pagina()).load()).toEqual(progressoAvancado());
  });

  it("o progresso de um personagem não aparece para o outro", () => {
    const storage = fakeStorage();
    const memoria = pagina();
    createProgressStore("lula", CAPITULOS, SEM_CONTEUDO, storage, memoria).save(progressoAvancado());
    expect(createProgressStore("flavio-bolsonaro", CAPITULOS, SEM_CONTEUDO, storage, memoria).load()).toBeNull();
  });

  it("lê só o que é válido: JSON ilegível, versão errada e personagem errado viram começo", () => {
    const chave = storageKey("lula");
    expect(createProgressStore("lula", CAPITULOS, SEM_CONTEUDO, fakeStorage({ [chave]: "{ isto não é json" }), pagina()).load()).toBeNull();
    const outraVersao = JSON.stringify({ ...progressoAvancado(), versao: PROGRESS_VERSION + 1 });
    expect(createProgressStore("lula", CAPITULOS, SEM_CONTEUDO, fakeStorage({ [chave]: outraVersao }), pagina()).load()).toBeNull();
    const outroPersonagem = JSON.stringify({ ...progressoAvancado(), personagem: "flavio-bolsonaro" });
    expect(createProgressStore("lula", CAPITULOS, SEM_CONTEUDO, fakeStorage({ [chave]: outroPersonagem }), pagina()).load()).toBeNull();
  });

  it("o que é lido passa pela leitura tolerante do progresso", () => {
    const chave = storageKey("lula");
    const salvo = progressoAvancado();
    // Um capítulo a mais no salvo é descartado; o resto volta igual.
    const comExtra = JSON.stringify({ ...salvo, capitulos: { ...salvo.capitulos, antigo: salvo.capitulos[UM.id] } });
    expect(createProgressStore("lula", CAPITULOS, SEM_CONTEUDO, fakeStorage({ [chave]: comExtra }), pagina()).load()).toEqual(salvo);
  });

  it("clear apaga só o progresso do personagem: o do outro continua guardado, igual", () => {
    const storage = fakeStorage();
    const memoria = pagina();
    const lula = createProgressStore("lula", CAPITULOS, SEM_CONTEUDO, storage, memoria);
    const outro = createProgressStore("flavio-bolsonaro", CAPITULOS, SEM_CONTEUDO, storage, memoria);
    const doOutro: PlayerProgress = { ...progressoAvancado(), personagem: "flavio-bolsonaro" };
    lula.save(progressoAvancado());
    outro.save(doOutro);
    const guardado = storage.itens.get(storageKey("flavio-bolsonaro"));
    expect(storage.itens.size).toBe(2);

    lula.clear();
    expect(storage.itens.has(storageKey("lula"))).toBe(false);
    expect(storage.itens.get(storageKey("flavio-bolsonaro"))).toBe(guardado);
    expect(lula.load()).toBeNull();
    // Em outra página, o progresso do outro personagem volta do armazenamento, inteiro.
    expect(createProgressStore("flavio-bolsonaro", CAPITULOS, SEM_CONTEUDO, storage, pagina()).load()).toEqual(doOutro);
  });

  it("clear apaga o que foi guardado", () => {
    const storage = fakeStorage();
    const store = createProgressStore("lula", CAPITULOS, SEM_CONTEUDO, storage, pagina());
    store.save(progressoAvancado());
    store.clear();
    expect(storage.itens.size).toBe(0);
    expect(store.load()).toBeNull();
  });
});

describe("sem armazenamento", () => {
  it("não é durável e responde pela memória", () => {
    const store = createProgressStore("lula", CAPITULOS, SEM_CONTEUDO, null, pagina());
    const progresso = progressoAvancado();

    expect(store.duravel).toBe(false);
    expect(store.load()).toBeNull();
    expect(store.save(progresso)).toBe(false);
    expect(store.load()).toBe(progresso);
  });

  it("clear esquece a memória", () => {
    const store = createProgressStore("lula", CAPITULOS, SEM_CONTEUDO, null, pagina());
    store.save(progressoAvancado());
    store.clear();
    expect(store.load()).toBeNull();
  });

  it("a memória é da página: outro armazenamento do mesmo personagem continua de onde o anterior parou", () => {
    // Ir do jogo à ficha de um registro e voltar monta o jogo de novo, na mesma página.
    const memoria = pagina();
    createProgressStore("lula", CAPITULOS, SEM_CONTEUDO, null, memoria).save(progressoAvancado());
    expect(createProgressStore("lula", CAPITULOS, SEM_CONTEUDO, null, memoria).load()).toEqual(progressoAvancado());
  });

  it("a memória da página é por personagem, e reiniciar um não apaga o outro", () => {
    const memoria = pagina();
    const lula = createProgressStore("lula", CAPITULOS, SEM_CONTEUDO, null, memoria);
    const outro = createProgressStore("flavio-bolsonaro", CAPITULOS, SEM_CONTEUDO, null, memoria);
    lula.save(progressoAvancado());
    expect(outro.load()).toBeNull();
    outro.save(initialProgress("flavio-bolsonaro", CAPITULOS));
    lula.clear();
    expect(lula.load()).toBeNull();
    expect(outro.load()).toEqual(initialProgress("flavio-bolsonaro", CAPITULOS));
  });

  it("em outra página (recarregar, fechar e abrir), a memória começa do zero", () => {
    createProgressStore("lula", CAPITULOS, SEM_CONTEUDO, null, pagina()).save(progressoAvancado());
    expect(createProgressStore("lula", CAPITULOS, SEM_CONTEUDO, null, pagina()).load()).toBeNull();
  });

  it("fora do navegador, o padrão é a memória da página", () => {
    // Nos testes não há `window`, e a detecção do localStorage devolve null.
    const store = createProgressStore("lula", CAPITULOS, SEM_CONTEUDO);
    expect(store.duravel).toBe(false);
    expect(store.save(progressoAvancado())).toBe(false);
    expect(createProgressStore("lula", CAPITULOS, SEM_CONTEUDO).load()).toEqual(progressoAvancado());
    // Limpa a memória padrão, para não vazar para outro teste.
    store.clear();
    expect(createProgressStore("lula", CAPITULOS, SEM_CONTEUDO).load()).toBeNull();
  });
});

describe("com armazenamento que falha", () => {
  it("quando a escrita é recusada, save avisa com false e o jogo continua pela memória", () => {
    const storage = { ...fakeStorage(), setItem: recusa };
    const store = createProgressStore("lula", CAPITULOS, SEM_CONTEUDO, storage, pagina());
    const progresso = progressoAvancado();

    expect(store.duravel).toBe(true);
    expect(() => store.save(progresso)).not.toThrow();
    expect(store.save(progresso)).toBe(false);
    expect(store.load()).toEqual(progresso);
  });

  it("a memória vale mais do que uma cópia antiga que ficou no Storage", () => {
    // A primeira gravação coube; a segunda estourou a cota.
    const storage = fakeStorage();
    const store = createProgressStore("lula", CAPITULOS, SEM_CONTEUDO, storage, pagina());
    const inicial = initialProgress("lula", CAPITULOS);
    expect(store.save(inicial)).toBe(true);

    storage.setItem = recusa;
    const avancado = progressoAvancado();
    expect(store.save(avancado)).toBe(false);
    expect(store.load()).toEqual(avancado);
  });

  it("quando a leitura falha, load não quebra", () => {
    const storage = {
      ...fakeStorage(),
      getItem: (): string | null => {
        throw new Error("sem acesso");
      },
    };
    const store = createProgressStore("lula", CAPITULOS, SEM_CONTEUDO, storage, pagina());
    expect(() => store.load()).not.toThrow();
    expect(store.load()).toBeNull();

    const progresso = progressoAvancado();
    store.save(progresso);
    expect(store.load()).toEqual(progresso);
  });

  it("com armazenamento só de leitura, reiniciar não quebra: clear esquece a memória e nada fica guardado", () => {
    const storage = { ...fakeStorage(), setItem: recusa, removeItem: recusa };
    const store = createProgressStore("lula", CAPITULOS, SEM_CONTEUDO, storage, pagina());
    expect(store.save(progressoAvancado())).toBe(false);
    expect(store.load()).toEqual(progressoAvancado());
    expect(() => store.clear()).not.toThrow();
    expect(store.load()).toBeNull();
    expect(storage.itens.size).toBe(0);
  });
});
