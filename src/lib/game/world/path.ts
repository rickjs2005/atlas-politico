// O caminho do boneco até uma pasta (D-137). Ninguém dirige o personagem: ao
// tocar em uma pasta, ele anda sozinho, por um caminho curto e conhecido de
// antemão, até a célula livre ao lado dela, e a explicação abre. A animação é
// decorativa: com movimento reduzido ele não anda, e o conteúdo abre do mesmo
// jeito. Regras puras sobre a grade da cena.

import type { PlayerState, SceneSpec } from "../types";

import { isBlocked, neighbours, type Cell } from "./grid";
import { facingOf } from "./iso";

/** Células por segundo. */
export const SPEED = 4.2;
/** Ciclos de caminhada por segundo. */
const STRIDES_PER_SECOND = 2.1;
/** A caminhada nunca passa disto, em segundos: um caminho mais longo é percorrido mais depressa. */
export const MAX_WALK_SECONDS = 1.6;

const chave = (cell: Cell) => `${cell.x},${cell.y}`;

export function initialPlayer(scene: SceneSpec): PlayerState {
  return { x: scene.spawn.x + 0.5, y: scene.spawn.y + 0.5, facing: "frente-direita", andando: false, fase: 0 };
}

/** A célula em que o personagem está. */
export function cellOf(player: Pick<PlayerState, "x" | "y">): Cell {
  return { x: Math.floor(player.x), y: Math.floor(player.y) };
}

/** A célula é chão por onde o boneco passa: não é parede, móvel, guia nem porta. */
function isWalkable(scene: SceneSpec, cell: Cell): boolean {
  return !isBlocked(scene, cell.x, cell.y);
}

/**
 * O caminho mais curto, de célula em célula (sem diagonal), de `origem` até
 * `destino`, as duas inclusas. `null` quando não há caminho. A busca visita os
 * vizinhos sempre na mesma ordem: o mesmo pedido dá o mesmo caminho.
 */
export function findPath(scene: SceneSpec, origem: Cell, destino: Cell): Cell[] | null {
  if (!isWalkable(scene, destino)) return null;
  const anterior = new Map<string, Cell | null>([[chave(origem), null]]);
  const fila: Cell[] = [origem];
  while (fila.length > 0) {
    const atual = fila.shift()!;
    if (atual.x === destino.x && atual.y === destino.y) {
      const caminho: Cell[] = [];
      for (let passo: Cell | null = atual; passo !== null; passo = anterior.get(chave(passo)) ?? null) caminho.unshift(passo);
      return caminho;
    }
    for (const proximo of neighbours(atual)) {
      if (anterior.has(chave(proximo)) || !isWalkable(scene, proximo)) continue;
      anterior.set(chave(proximo), atual);
      fila.push(proximo);
    }
  }
  return null;
}

/**
 * O caminho até uma pasta: até a célula livre ao lado dela que fica mais
 * perto, pelo chão. Se o boneco já está ao lado, o caminho tem só a célula em
 * que ele está. `null` quando nenhuma célula ao lado da pasta é alcançável.
 */
export function pathToMarker(scene: SceneSpec, origem: Cell, pasta: Cell): Cell[] | null {
  let melhor: Cell[] | null = null;
  for (const vizinha of neighbours(pasta)) {
    if (!isWalkable(scene, vizinha)) continue;
    const caminho = findPath(scene, origem, vizinha);
    if (caminho !== null && (melhor === null || caminho.length < melhor.length)) melhor = caminho;
  }
  return melhor;
}

/** Uma caminhada em curso: os pontos por onde passar (centros de célula) e para onde olhar ao chegar. */
export interface Walk {
  pontos: { x: number; y: number }[];
  /** A pasta: ao chegar, o boneco vira para ela. */
  alvo: { x: number; y: number };
  /** Células por segundo desta caminhada: a velocidade padrão, ou mais, para caber no tempo máximo. */
  velocidade: number;
}

/** Monta a caminhada de um caminho de células até a pasta. O primeiro ponto, onde o boneco já está, fica de fora. */
export function walkAlong(caminho: readonly Cell[], pasta: Cell): Walk {
  const pontos = caminho.slice(1).map((cell) => ({ x: cell.x + 0.5, y: cell.y + 0.5 }));
  return { pontos, alvo: { x: pasta.x + 0.5, y: pasta.y + 0.5 }, velocidade: Math.max(SPEED, pontos.length / MAX_WALK_SECONDS) };
}

/**
 * Um passo de simulação da caminhada. `dt` em segundos. Devolve o boneco e o
 * que resta do caminho; com o caminho vazio, ele chegou, parou e está virado
 * para a pasta. Não muda o que recebe.
 */
export function stepWalk(player: PlayerState, walk: Walk, dt: number): { player: PlayerState; walk: Walk; chegou: boolean } {
  let { x, y } = player;
  let facing = player.facing;
  let resto = walk.velocidade * dt;
  const pontos = [...walk.pontos];
  while (resto > 0 && pontos.length > 0) {
    const proximo = pontos[0]!;
    const dx = proximo.x - x;
    const dy = proximo.y - y;
    const distancia = Math.hypot(dx, dy);
    if (distancia > 0) facing = facingOf(dx, dy, facing);
    if (distancia <= resto) {
      x = proximo.x;
      y = proximo.y;
      resto -= distancia;
      pontos.shift();
    } else {
      x += (dx / distancia) * resto;
      y += (dy / distancia) * resto;
      resto = 0;
    }
  }
  const chegou = pontos.length === 0;
  if (chegou) facing = facingOf(walk.alvo.x - x, walk.alvo.y - y, facing);
  return {
    player: { x, y, facing, andando: !chegou, fase: chegou ? 0 : (player.fase + dt * STRIDES_PER_SECOND) % 1 },
    walk: { ...walk, pontos },
    chegou,
  };
}
