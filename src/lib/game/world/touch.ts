// O direcional de toque: de um ponto dentro da área para uma de oito direções,
// em eixos de tela. Regra pura.

/** Raio do centro em que nenhuma direção vale, em fração do meio lado. */
export const DEAD_ZONE = 0.22;
/** Seno de 22,5°: abaixo disso o eixo não conta, e a direção é reta. */
const AXIS_THRESHOLD = 0.38;

/**
 * A direção para um ponto (`x`, `y`) medido a partir do centro do direcional,
 * com `y` para baixo. Devolve -1, 0 ou 1 em cada eixo; no centro, parado.
 */
export function directionFor(x: number, y: number, meioLado: number): [number, number] {
  const distancia = Math.hypot(x, y);
  if (meioLado <= 0 || distancia < meioLado * DEAD_ZONE) return [0, 0];
  const nx = x / distancia;
  const ny = y / distancia;
  return [nx > AXIS_THRESHOLD ? 1 : nx < -AXIS_THRESHOLD ? -1 : 0, ny > AXIS_THRESHOLD ? 1 : ny < -AXIS_THRESHOLD ? -1 : 0];
}
