// O traço dos personagens: o que falta ao kit para desenhar gente. O kit dá a
// tinta, as espessuras e a sombra do chão; aqui ficam o caminho curvo guardado
// como dado, a forma com luz e sombra e o membro articulado.

import { DETAIL, INK, OUTLINE } from "./kit";

/** Contorno das partes pequenas (mão, orelha, sapato): o de sempre pesaria demais. */
export const FINE = 1;

/**
 * Um caminho curvo, lido uma vez de um texto no formato do atributo `d` do
 * SVG (só `M`, `L`, `C`, `Q` e `Z`, em coordenadas absolutas). Fica no módulo:
 * desenhar não cria nada.
 */
export interface Shape {
  comandos: string;
  numeros: Float32Array;
}

const PARES: Record<string, number> = { M: 1, L: 1, C: 3, Q: 2, Z: 0 };

export function shape(d: string): Shape {
  const partes = d.match(/[MLCQZ]|-?\d*\.?\d+/g) ?? [];
  let comandos = "";
  const numeros: number[] = [];
  let i = 0;
  while (i < partes.length) {
    const comando = partes[i]!;
    const pares = PARES[comando];
    if (pares === undefined) throw new Error(`Caminho inválido perto de "${comando}" em "${d}".`);
    comandos += comando;
    i += 1;
    for (let n = 0; n < pares * 2; n += 1) {
      const valor = Number(partes[i]);
      if (Number.isNaN(valor)) throw new Error(`Faltam números depois de "${comando}" em "${d}".`);
      numeros.push(valor);
      i += 1;
    }
  }
  return { comandos, numeros: Float32Array.from(numeros) };
}

/** Traça o caminho no contexto. Quem chama preenche e contorna. */
export function trace(g: CanvasRenderingContext2D, s: Shape): void {
  const n = s.numeros;
  let i = 0;
  g.beginPath();
  for (let c = 0; c < s.comandos.length; c += 1) {
    switch (s.comandos[c]) {
      case "M":
        g.moveTo(n[i]!, n[i + 1]!);
        i += 2;
        break;
      case "L":
        g.lineTo(n[i]!, n[i + 1]!);
        i += 2;
        break;
      case "Q":
        g.quadraticCurveTo(n[i]!, n[i + 1]!, n[i + 2]!, n[i + 3]!);
        i += 4;
        break;
      case "C":
        g.bezierCurveTo(n[i]!, n[i + 1]!, n[i + 2]!, n[i + 3]!, n[i + 4]!, n[i + 5]!);
        i += 6;
        break;
      default:
        g.closePath();
    }
  }
}

/** Deslocamento da zona iluminada dentro da forma: a sombra sobra à direita e embaixo. */
const LUZ_X = 1.5;
const LUZ_Y = 0.9;

export type Tracer = (g: CanvasRenderingContext2D) => void;

/**
 * Forma com duas tintas: a de sombra por baixo e a de base por cima, deslocada
 * para o lado da luz e recortada pela própria forma. `lado` é +1 quando a
 * direita do desenho é a direita da tela e -1 no desenho espelhado, para a luz
 * continuar vindo da esquerda da tela. `tracar` é uma função do módulo, não
 * uma função criada na chamada.
 */
export function lit(
  g: CanvasRenderingContext2D,
  tracar: Tracer,
  base: string,
  sombra: string,
  lado: number,
  contorno: number = OUTLINE,
  dx: number = LUZ_X,
  dy: number = LUZ_Y,
): void {
  tracar(g);
  g.fillStyle = sombra;
  g.fill();
  g.save();
  g.clip();
  g.translate(-dx * lado, -dy);
  tracar(g);
  g.fillStyle = base;
  g.fill();
  g.restore();
  if (contorno > 0) {
    tracar(g);
    g.lineWidth = contorno;
    g.strokeStyle = INK;
    g.stroke();
  }
}

/** O mesmo que `lit`, para um caminho guardado. */
export function litShape(
  g: CanvasRenderingContext2D,
  s: Shape,
  base: string,
  sombra: string,
  lado: number,
  contorno: number = OUTLINE,
  dx: number = LUZ_X,
  dy: number = LUZ_Y,
): void {
  trace(g, s);
  g.fillStyle = sombra;
  g.fill();
  g.save();
  g.clip();
  g.translate(-dx * lado, -dy);
  trace(g, s);
  g.fillStyle = base;
  g.fill();
  g.restore();
  if (contorno > 0) {
    trace(g, s);
    g.lineWidth = contorno;
    g.strokeStyle = INK;
    g.stroke();
  }
}

/** Caminho guardado, com uma tinta só. */
export function flat(g: CanvasRenderingContext2D, s: Shape, cor: string, contorno: number = 0, tinta: string = INK): void {
  trace(g, s);
  g.fillStyle = cor;
  g.fill();
  if (contorno > 0) {
    g.lineWidth = contorno;
    g.strokeStyle = tinta;
    g.stroke();
  }
}

/** Caminho guardado, só o traço (aberto ou fechado). */
export function stroke(g: CanvasRenderingContext2D, s: Shape, largura: number = DETAIL, cor: string = INK, alfa = 1): void {
  trace(g, s);
  if (alfa < 1) {
    const antes = g.globalAlpha;
    g.globalAlpha = antes * alfa;
    g.lineWidth = largura;
    g.strokeStyle = cor;
    g.stroke();
    g.globalAlpha = antes;
    return;
  }
  g.lineWidth = largura;
  g.strokeStyle = cor;
  g.stroke();
}

/**
 * Traça um membro de três pontos (ombro, cotovelo e punho, ou quadril, joelho
 * e tornozelo) com a meia espessura de cada um. A junta do meio é curva; a
 * ponta final é reta com `plano` (boca de calça, punho de manga) e redonda sem.
 */
export function traceLimb(
  g: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  r0: number,
  x1: number,
  y1: number,
  r1: number,
  x2: number,
  y2: number,
  r2: number,
  plano: boolean,
): void {
  let ax = x1 - x0;
  let ay = y1 - y0;
  const la = Math.hypot(ax, ay) || 1;
  ax /= la;
  ay /= la;
  let bx = x2 - x1;
  let by = y2 - y1;
  const lb = Math.hypot(bx, by) || 1;
  bx /= lb;
  by /= lb;
  // Na junta, a bissetriz das normais dos dois trechos, alongada para a
  // espessura não afinar na dobra (com teto, para a dobra fechada não espetar).
  let mx = -ay - by;
  let my = ax + bx;
  const lm = Math.hypot(mx, my) || 1;
  mx /= lm;
  my /= lm;
  const rj = r1 / Math.max(0.6, mx * -ay + my * ax);
  const ra = (r0 + r1) / 2;
  const rb = (r1 + r2) / 2;
  const mxa = (x0 + x1) / 2;
  const mya = (y0 + y1) / 2;
  const mxb = (x1 + x2) / 2;
  const myb = (y1 + y2) / 2;
  const angA = Math.atan2(ay, ax);
  g.beginPath();
  g.moveTo(x0 - ay * r0, y0 + ax * r0);
  g.lineTo(mxa - ay * ra, mya + ax * ra);
  g.quadraticCurveTo(x1 + mx * rj, y1 + my * rj, mxb - by * rb, myb + bx * rb);
  g.lineTo(x2 - by * r2, y2 + bx * r2);
  if (plano) {
    g.lineTo(x2 + by * r2, y2 - bx * r2);
  } else {
    const angB = Math.atan2(by, bx);
    g.arc(x2, y2, r2, angB + Math.PI / 2, angB - Math.PI / 2, true);
  }
  g.lineTo(mxb + by * rb, myb - bx * rb);
  g.quadraticCurveTo(x1 - mx * rj, y1 - my * rj, mxa + ay * ra, mya - ax * ra);
  g.lineTo(x0 + ay * r0, y0 - ax * r0);
  g.arc(x0, y0, r0, angA - Math.PI / 2, angA - (3 * Math.PI) / 2, true);
  g.closePath();
}

/** Membro com luz e sombra, como `lit`. */
export function litLimb(
  g: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  r0: number,
  x1: number,
  y1: number,
  r1: number,
  x2: number,
  y2: number,
  r2: number,
  plano: boolean,
  base: string,
  sombra: string,
  lado: number,
  contorno: number = OUTLINE,
): void {
  traceLimb(g, x0, y0, r0, x1, y1, r1, x2, y2, r2, plano);
  g.fillStyle = sombra;
  g.fill();
  g.save();
  g.clip();
  g.translate(-1.3 * lado, -0.5);
  traceLimb(g, x0, y0, r0, x1, y1, r1, x2, y2, r2, plano);
  g.fillStyle = base;
  g.fill();
  g.restore();
  traceLimb(g, x0, y0, r0, x1, y1, r1, x2, y2, r2, plano);
  g.lineWidth = contorno;
  g.strokeStyle = INK;
  g.stroke();
}

/** Curva de detalhe, de um ponto a outro, com um ponto de controle. */
export function curve(
  g: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  cx: number,
  cy: number,
  x1: number,
  y1: number,
  largura: number = DETAIL,
  cor: string = INK,
  alfa = 1,
): void {
  const antes = g.globalAlpha;
  g.globalAlpha = antes * alfa;
  g.beginPath();
  g.moveTo(x0, y0);
  g.quadraticCurveTo(cx, cy, x1, y1);
  g.lineWidth = largura;
  g.strokeStyle = cor;
  g.stroke();
  g.globalAlpha = antes;
}

/** Ponto cheio: botão, pupila. */
export function dot(g: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, cor: string): void {
  g.fillStyle = cor;
  g.beginPath();
  g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  g.fill();
}
