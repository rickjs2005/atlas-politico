// Onde o progresso fica: `localStorage`, uma chave por personagem. Quando o
// armazenamento não existe ou recusa (modo privado, cota, bloqueio), o jogo
// continua com uma cópia em memória, e a pessoa é avisada de que o progresso
// não será guardado.
//
// A cópia em memória é da página, e não de cada montagem do jogo: ir do jogo
// à ficha de um registro e voltar, pela navegação do site, não perde o
// progresso da visita. Recarregar ou fechar a página perde.

import { parseProgress } from "./progress";
import type { ChapterSpec, PersonagemSlug, PlayerProgress } from "./types";

export const STORAGE_PREFIX = "atlas-politico:jogo";

export function storageKey(personagem: PersonagemSlug): string {
  return `${STORAGE_PREFIX}:${personagem}`;
}

export interface ProgressStore {
  /** O armazenamento durável está disponível? */
  duravel: boolean;
  load(): PlayerProgress | null;
  save(progresso: PlayerProgress): boolean;
  clear(): void;
}

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/** O último progresso de cada chave nesta página. */
const PAGE_MEMORY = new Map<string, PlayerProgress>();

function detectStorage(): StorageLike | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const sonda = `${STORAGE_PREFIX}:sonda`;
    window.localStorage.setItem(sonda, "1");
    window.localStorage.removeItem(sonda);
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Um armazenamento para o personagem. `storage` e `memoria` servem aos testes. */
export function createProgressStore(
  personagem: PersonagemSlug,
  capitulos: readonly ChapterSpec[],
  storage: StorageLike | null = detectStorage(),
  memoria: Map<string, PlayerProgress> = PAGE_MEMORY,
): ProgressStore {
  const chave = storageKey(personagem);

  return {
    duravel: storage !== null,
    load() {
      // O último progresso salvo nesta página vale mesmo quando a gravação foi
      // recusada (cota, bloqueio): o jogo continua pela memória.
      const naPagina = memoria.get(chave);
      if (naPagina !== undefined) return naPagina;
      if (storage === null) return null;
      try {
        const bruto = storage.getItem(chave);
        if (bruto === null) return null;
        return parseProgress(JSON.parse(bruto), personagem, capitulos);
      } catch {
        return null;
      }
    },
    save(progresso) {
      memoria.set(chave, progresso);
      if (storage === null) return false;
      try {
        storage.setItem(chave, JSON.stringify(progresso));
        return true;
      } catch {
        return false;
      }
    },
    clear() {
      memoria.delete(chave);
      if (storage === null) return;
      try {
        storage.removeItem(chave);
      } catch {
        // sem armazenamento, não há o que apagar
      }
    },
  };
}
