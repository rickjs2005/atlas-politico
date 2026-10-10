// Movimento do personagem com colisão simples contra a grade: o personagem é
// um círculo pequeno no chão, e cada eixo é resolvido separado, para
// deslizar ao longo das paredes.
//
// Quem anda reto por um corredor e roça a quina de um móvel não fica preso: o
// passo vira um desvio curto para o lado livre, até o corpo passar.

import type { InputState, PlayerState, SceneSpec } from "../types";

import { isBlocked } from "./grid";
import { facingOf, inputToWorld } from "./iso";

/** Células por segundo. */
export const SPEED = 3.4;
/** Raio do personagem, em células. */
export const RADIUS = 0.28;
/** Ciclos de caminhada por segundo. */
const STRIDES_PER_SECOND = 1.9;
/**
 * Quanto do corpo pode estar preso na quina de um obstáculo para o jogo
 * ajudar a contorná-la, em células. Mais que isso é um obstáculo de frente,
 * e o personagem para.
 */
export const CORNER = 0.24;

function circleBlocked(scene: SceneSpec, x: number, y: number, saidaAberta: boolean): boolean {
  // As quatro células que o círculo pode tocar.
  for (const [ox, oy] of [
    [-RADIUS, -RADIUS],
    [RADIUS, -RADIUS],
    [-RADIUS, RADIUS],
    [RADIUS, RADIUS],
  ] as const) {
    if (isBlocked(scene, x + ox, y + oy, saidaAberta)) return true;
  }
  return false;
}

/**
 * Para que lado desviar quando o passo em um eixo bate em uma quina: -1, 1 ou
 * 0, quando um desvio curto não resolve (parede, obstáculo de frente).
 */
function cornerSide(scene: SceneSpec, x: number, y: number, eixo: "x" | "y", alvo: number, saidaAberta: boolean): -1 | 0 | 1 {
  const livre = (lado: number) =>
    eixo === "x" ? !circleBlocked(scene, alvo, y + lado * CORNER, saidaAberta) : !circleBlocked(scene, x + lado * CORNER, alvo, saidaAberta);
  const menos = livre(-1);
  const mais = livre(1);
  if (menos === mais) return 0;
  return menos ? -1 : 1;
}

export function initialPlayer(scene: SceneSpec): PlayerState {
  return { x: scene.spawn.x + 0.5, y: scene.spawn.y + 0.5, facing: "frente-direita", andando: false, fase: 0 };
}

/** Um passo de simulação. `dt` em segundos. Não muda o estado recebido. */
export function stepPlayer(
  player: PlayerState,
  input: InputState,
  dt: number,
  scene: SceneSpec,
  saidaAberta: boolean,
): PlayerState {
  const direcao = inputToWorld(input);
  if (direcao.x === 0 && direcao.y === 0) {
    return player.andando || player.fase !== 0 ? { ...player, andando: false, fase: 0 } : player;
  }

  const passo = SPEED * dt;
  let x = player.x;
  let y = player.y;

  const alvoX = x + direcao.x * passo;
  const alvoY = y + direcao.y * passo;
  if (direcao.y === 0) {
    // Reto no eixo x: anda, ou contorna a quina pelo lado livre.
    if (!circleBlocked(scene, alvoX, y, saidaAberta)) x = alvoX;
    else {
      const desvio = y + cornerSide(scene, x, y, "x", alvoX, saidaAberta) * passo;
      if (desvio !== y && !circleBlocked(scene, x, desvio, saidaAberta)) y = desvio;
    }
  } else if (direcao.x === 0) {
    if (!circleBlocked(scene, x, alvoY, saidaAberta)) y = alvoY;
    else {
      const desvio = x + cornerSide(scene, x, y, "y", alvoY, saidaAberta) * passo;
      if (desvio !== x && !circleBlocked(scene, desvio, y, saidaAberta)) x = desvio;
    }
  } else {
    // Na diagonal, cada eixo é tentado em separado: o bloqueado para, o outro continua.
    if (!circleBlocked(scene, alvoX, y, saidaAberta)) x = alvoX;
    if (!circleBlocked(scene, x, alvoY, saidaAberta)) y = alvoY;
  }

  const moveu = x !== player.x || y !== player.y;
  return {
    x,
    y,
    facing: facingOf(direcao.x, direcao.y, player.facing),
    andando: moveu,
    fase: moveu ? (player.fase + dt * STRIDES_PER_SECOND) % 1 : player.fase,
  };
}

/** O personagem está sobre a célula da saída? */
export function isOnExit(player: PlayerState, scene: SceneSpec): boolean {
  return Math.floor(player.x) === scene.saida.x && Math.floor(player.y) === scene.saida.y;
}
