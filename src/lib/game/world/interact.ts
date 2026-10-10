// O que está ao alcance do personagem: o registro, o guia ou a saída mais
// próximos, dentro de uma distância curta. Regras puras.

import type { ChapterSpec, Interactable, PlayerState, SceneSpec } from "../types";

/** Distância máxima, em células, entre o centro do personagem e o objeto. */
export const REACH = 1.15;

/** Os objetos com que se interage na cena de um capítulo. */
export function listInteractables(
  scene: SceneSpec,
  chapter: ChapterSpec,
  recolhidos: readonly string[],
): Interactable[] {
  const itens: Interactable[] = [];
  chapter.eventIds.forEach((eventId, indice) => {
    const posicao = scene.registros[indice];
    if (posicao === undefined || recolhidos.includes(eventId)) return;
    itens.push({ tipo: "registro", id: eventId, x: posicao.x + 0.5, y: posicao.y + 0.5 });
  });
  itens.push({ tipo: "guia", id: "guia", x: scene.guia.x + 0.5, y: scene.guia.y + 0.5 });
  itens.push({ tipo: "saida", id: "saida", x: scene.saida.x + 0.5, y: scene.saida.y + 0.5 });
  return itens;
}

export function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** O objeto mais próximo ao alcance, ou `null`. */
export function nearestInteractable(player: PlayerState, itens: readonly Interactable[]): Interactable | null {
  let melhor: Interactable | null = null;
  let menor = REACH;
  for (const item of itens) {
    const d = distance(player, item);
    if (d <= menor) {
      menor = d;
      melhor = item;
    }
  }
  return melhor;
}
