// Preferências do jogo, as mesmas para os dois personagens: se o Escrivão faz
// humor e se a trilha é percorrida com o cenário ou só com o texto. Ficam no
// navegador, em uma chave própria, fora do progresso. Leitura tolerante:
// qualquer coisa fora do formato vira o padrão.

export const PREFERENCES_KEY = "atlas-politico:jogo:preferencias";

export interface GamePreferences {
  /** O Escrivão faz as falas de humor. Desligado, só instrução e informação documental. */
  humor: boolean;
  /** A trilha é percorrida com o cenário. Desligado, é "Ler sem o cenário": as mesmas fases, só com o texto. */
  cenario: boolean;
}

export const DEFAULT_PREFERENCES: GamePreferences = { humor: true, cenario: true };

export function parsePreferences(valor: unknown): GamePreferences {
  if (typeof valor !== "object" || valor === null || Array.isArray(valor)) return DEFAULT_PREFERENCES;
  const { humor, cenario } = valor as Record<string, unknown>;
  return {
    humor: typeof humor === "boolean" ? humor : DEFAULT_PREFERENCES.humor,
    cenario: typeof cenario === "boolean" ? cenario : DEFAULT_PREFERENCES.cenario,
  };
}

export function serializePreferences(preferencias: GamePreferences): string {
  return JSON.stringify({ humor: preferencias.humor, cenario: preferencias.cenario });
}
