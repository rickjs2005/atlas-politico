// A grade de uma cena: o que bloqueia a passagem, onde estão o início, o guia,
// os registros e a saída, e se tudo é alcançável.
//
// Legenda do mapa (`SceneSpec.mapa`), um caractere por célula:
//   .   chão livre
//   #   parede
//   o   elemento de cenário que bloqueia (a arte escolhe o que é)
//   S   início do personagem
//   G   guia (bloqueia; a interação é pela célula vizinha)
//   E   saída: só passa quando está aberta (a tarefa cumprida e todos os registros recolhidos)
//   1-9 registro, na ordem de `ChapterSpec.eventIds`

import type { SceneSpec } from "../types";

export interface Cell {
  x: number;
  y: number;
}

export const CELL = {
  chao: ".",
  parede: "#",
  prop: "o",
  spawn: "S",
  guia: "G",
  saida: "E",
} as const;

export function cellAt(scene: SceneSpec, x: number, y: number): string {
  if (x < 0 || y < 0 || x >= scene.largura || y >= scene.altura) return CELL.parede;
  return scene.mapa[y]?.[x] ?? CELL.parede;
}

/** Elementos de cenário que ocupam célula, pelo mapa e pela lista de props. */
export function isPropCell(scene: SceneSpec, x: number, y: number): boolean {
  if (cellAt(scene, x, y) === CELL.prop) return true;
  return scene.props.some((prop) => prop.x === x && prop.y === y && prop.tipo !== "decoracao");
}

/** A célula bloqueia o personagem? A saída bloqueia enquanto está fechada. */
export function isBlocked(scene: SceneSpec, x: number, y: number, saidaAberta: boolean): boolean {
  const celula = cellAt(scene, Math.floor(x), Math.floor(y));
  if (celula === CELL.parede || celula === CELL.guia) return true;
  if (celula === CELL.saida) return !saidaAberta;
  return isPropCell(scene, Math.floor(x), Math.floor(y));
}

/** Lê do mapa as posições marcadas, para conferir que batem com a cena. */
export function readMarkers(scene: SceneSpec): {
  spawn: Cell | null;
  guia: Cell | null;
  saida: Cell | null;
  registros: Cell[];
} {
  let spawn: Cell | null = null;
  let guia: Cell | null = null;
  let saida: Cell | null = null;
  const registros: (Cell | undefined)[] = [];
  scene.mapa.forEach((linha, y) => {
    for (let x = 0; x < linha.length; x += 1) {
      const c = linha[x]!;
      if (c === CELL.spawn) spawn = { x, y };
      else if (c === CELL.guia) guia = { x, y };
      else if (c === CELL.saida) saida = { x, y };
      else if (c >= "1" && c <= "9") registros[Number(c) - 1] = { x, y };
    }
  });
  return { spawn, guia, saida, registros: registros.filter((item): item is Cell => item !== undefined) };
}

/** Células alcançáveis a pé a partir de `origem`, sem passar pela saída fechada. */
export function reachable(scene: SceneSpec, origem: Cell, saidaAberta = false): Set<string> {
  const chave = (c: Cell) => `${c.x},${c.y}`;
  const vistos = new Set<string>([chave(origem)]);
  const fila: Cell[] = [origem];
  while (fila.length > 0) {
    const atual = fila.shift()!;
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const) {
      const proximo = { x: atual.x + dx, y: atual.y + dy };
      if (vistos.has(chave(proximo))) continue;
      if (isBlocked(scene, proximo.x, proximo.y, saidaAberta)) continue;
      vistos.add(chave(proximo));
      fila.push(proximo);
    }
  }
  return vistos;
}

/** As quatro células vizinhas (ortogonais) de uma célula. */
export function neighbours(cell: Cell): Cell[] {
  return [
    { x: cell.x + 1, y: cell.y },
    { x: cell.x - 1, y: cell.y },
    { x: cell.x, y: cell.y + 1 },
    { x: cell.x, y: cell.y - 1 },
  ];
}
