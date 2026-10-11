// Preferências do jogo, as mesmas para os dois personagens: por enquanto, só
// se o Escrivão faz humor. Ficam no navegador, em uma chave própria, fora do
// progresso. Leitura tolerante: qualquer coisa fora do formato vira o padrão.

export const PREFERENCES_KEY = "atlas-politico:jogo:preferencias";

export interface GamePreferences {
  /** O Escrivão faz as falas de humor. Desligado, só instrução e informação documental. */
  humor: boolean;
}

export const DEFAULT_PREFERENCES: GamePreferences = { humor: true };

export function parsePreferences(valor: unknown): GamePreferences {
  if (typeof valor !== "object" || valor === null || Array.isArray(valor)) return DEFAULT_PREFERENCES;
  const { humor } = valor as Record<string, unknown>;
  return { humor: typeof humor === "boolean" ? humor : DEFAULT_PREFERENCES.humor };
}

export function serializePreferences(preferencias: GamePreferences): string {
  return JSON.stringify({ humor: preferencias.humor });
}
