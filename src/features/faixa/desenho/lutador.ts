// Os lutadores do Vale a Faixa: Lula e Flávio Bolsonaro em cartum, vistos de
// lado, com o mesmo esqueleto, o mesmo traço e as mesmas animações. As
// cabeças são as do atlas (src/features/game/draw/character-faces.ts), em
// escala maior; o corpo é um boneco articulado de terno, desenhado por código.
//
// Coordenadas locais: origem nos pés, `x` para a frente (para onde olha) e
// `y` para baixo, como na tela. Quem olha para a esquerda é espelhado. A
// pose sai do estado do lutador (regras.ts) e do tempo nele: parado,
// caminhada, golpe, empurrão, defesa, atingido, caído e levantando, carregando
// a escada, subindo, no topo, puxando a faixa, caindo, vitória e derrota.

import { FLAVIO_HEAD, LULA_HEAD } from "@/features/game/draw/character-faces";
import { drawHead, type HeadSpec } from "@/features/game/draw/character-head";
import { INK } from "@/features/game/draw/kit";
import { REGRAS, faseDoAtaque } from "@/lib/faixa/regras";
import type { Lutador, LutadorSlug } from "@/lib/faixa/tipos";

export type Expressao = "neutra" | "raiva" | "dor" | "esforco" | "alegria" | "tonto" | "susto" | "triste";

interface Cores {
  paleto: string;
  paletoSombra: string;
  calca: string;
  camisa: string;
  gravata: string;
  sapato: string;
  pele: string;
}

export interface Figura {
  slug: LutadorSlug;
  nome: string;
  cabeca: HeadSpec;
  /** Escala do corpo: silhuetas diferentes, alcance igual (o alcance é regra, não desenho). */
  escala: number;
  /** Largura do tronco, em fração: largo ou esguio. */
  tronco: number;
  cores: Cores;
}

const FLAVIO_ATUAL: HeadSpec = {
  ...FLAVIO_HEAD,
  tintas: { ...FLAVIO_HEAD.tintas, cabelo: "#473a32", cabeloSombra: "#342a24", fio: "#7d6e63", barba: "#5c4d43", barbaSombra: "#473b33", sobrancelha: "#352a23" },
  barbaAlfa: 0.8,
};

export const FIGURAS: Record<LutadorSlug, Figura> = {
  lula: {
    slug: "lula",
    nome: "Lula",
    cabeca: LULA_HEAD,
    escala: 0.97,
    tronco: 1.14,
    cores: { paleto: "#4d5157", paletoSombra: "#3b3f45", calca: "#4a4e54", camisa: "#f2eee5", gravata: "#2b2d30", sapato: "#2a2927", pele: LULA_HEAD.tintas.pele },
  },
  "flavio-bolsonaro": {
    slug: "flavio-bolsonaro",
    nome: "Flávio Bolsonaro",
    cabeca: FLAVIO_ATUAL,
    escala: 1.04,
    tronco: 0.94,
    cores: { paleto: "#2f3640", paletoSombra: "#232930", calca: "#2d333c", camisa: "#f2eee5", gravata: "#2b2d30", sapato: "#2a2927", pele: FLAVIO_HEAD.tintas.pele },
  },
};

/** Medidas do esqueleto, na escala 1. */
const M = {
  quadril: 78,
  troncoAltura: 52,
  coxa: 40,
  canela: 38,
  braco: 30,
  antebraco: 28,
  cabeca: 158,
  cabecaEscala: 2.1,
  ombro: 16,
  quadris: 13,
};

export interface Pose {
  /** Deslocamento do corpo inteiro e giro em torno dos pés (para cair e levantar). */
  dx: number;
  dy: number;
  giro: number;
  quadrilY: number;
  /** Inclinação do tronco: positiva para a frente. */
  tronco: number;
  cabecaGiro: number;
  /** Ângulos de ombro e cotovelo: zero pendurado, positivo para a frente e para cima. */
  bracoF: [number, number];
  bracoT: [number, number];
  /** Ângulos de quadril e joelho: zero reto para baixo, positivo para a frente. */
  pernaF: [number, number];
  pernaT: [number, number];
  expressao: Expressao;
  piscar: number;
  suor: number;
  /** Transparência: a proteção ao levantar pisca. */
  alfa: number;
}

const TAU = Math.PI * 2;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
const easeOut = (t: number) => 1 - (1 - clamp01(t)) ** 2;
const easeIn = (t: number) => clamp01(t) ** 2;

const GUARDA: Pick<Pose, "bracoF" | "bracoT" | "pernaF" | "pernaT"> = {
  bracoF: [1.15, 1.5],
  bracoT: [0.95, 1.55],
  pernaF: [0.22, -0.18],
  pernaT: [-0.2, 0.14],
};

function neutra(): Pose {
  return { dx: 0, dy: 0, giro: 0, quadrilY: -M.quadril, tronco: 0.08, cabecaGiro: 0, ...GUARDA, expressao: "neutra", piscar: 0, suor: 0, alfa: 1 };
}

/** A pose do lutador pelo estado, o tempo no estado e o relógio da cena. */
export function poseDe(l: Lutador, tempo: number, ritmo: number, movimento: boolean, andando: boolean, puxandoAlguem: boolean): Pose {
  const pose = neutra();
  const t = l.t;
  const relogio = tempo + ritmo;
  const respiro = movimento ? Math.sin((relogio * TAU) / 3.2) : 0;
  const passo = l.passo * TAU;
  const andar = (amplitude: number) => {
    const s = Math.sin(passo);
    pose.pernaF = [0.5 * s * amplitude, -0.55 * Math.max(0, -s) * amplitude - 0.08];
    pose.pernaT = [-0.5 * s * amplitude, -0.55 * Math.max(0, s) * amplitude - 0.08];
    pose.quadrilY = -M.quadril + 2.2 * Math.abs(Math.cos(passo)) * amplitude - 1.5;
  };
  const piscada = movimento && relogio % 4.1 < 0.14 ? 1 : 0;

  switch (l.estado) {
    case "parado":
      pose.quadrilY = -M.quadril + respiro * 1.2;
      pose.bracoF = [1.15 + respiro * 0.04, 1.5];
      pose.bracoT = [0.95 - respiro * 0.04, 1.55];
      pose.piscar = piscada;
      break;
    case "andando":
      andar(1);
      pose.bracoF = [1.1 - 0.3 * Math.sin(passo), 1.45];
      pose.bracoT = [0.95 + 0.3 * Math.sin(passo), 1.5];
      pose.piscar = piscada;
      break;
    case "golpe": {
      const r = REGRAS.golpe;
      const fase = faseDoAtaque(l);
      pose.expressao = "raiva";
      if (fase === "antecipacao") {
        const u = easeOut(t / r.antecipacao);
        pose.tronco = lerp(0.08, -0.28, u);
        pose.bracoF = [lerp(1.15, 0.35, u), lerp(1.5, 1.9, u)];
        pose.bracoT = [1.2, 1.3];
        pose.pernaF = [0.3, -0.3];
        pose.pernaT = [-0.3, 0.2];
        pose.quadrilY = -M.quadril + 3 * u;
      } else if (fase === "ativo") {
        pose.tronco = 0.38;
        pose.dx = 8;
        pose.bracoF = [Math.PI / 2 + 0.12, -0.05];
        pose.bracoT = [0.5, 1.6];
        pose.pernaF = [0.55, -0.35];
        pose.pernaT = [-0.45, 0.1];
        pose.quadrilY = -M.quadril + 4;
      } else {
        const u = easeOut((t - r.antecipacao - r.ativo) / r.recuperacao);
        pose.tronco = lerp(0.38, 0.08, u);
        pose.dx = lerp(8, 0, u);
        pose.bracoF = [lerp(Math.PI / 2 + 0.12, 1.15, u), lerp(-0.05, 1.5, u)];
        pose.bracoT = [lerp(0.5, 0.95, u), lerp(1.6, 1.55, u)];
        pose.pernaF = [lerp(0.55, 0.22, u), lerp(-0.35, -0.18, u)];
        pose.pernaT = [lerp(-0.45, -0.2, u), lerp(0.1, 0.14, u)];
        pose.quadrilY = -M.quadril + lerp(4, 0, u);
        if (u > 0.6) pose.expressao = "neutra";
      }
      break;
    }
    case "empurrao": {
      const r = REGRAS.empurrao;
      const fase = faseDoAtaque(l);
      pose.expressao = "esforco";
      if (fase === "antecipacao") {
        const u = easeOut(t / r.antecipacao);
        pose.tronco = lerp(0.08, -0.22, u);
        pose.quadrilY = -M.quadril + 9 * u;
        pose.bracoF = [lerp(1.15, 0.3, u), lerp(1.5, 0.7, u)];
        pose.bracoT = [lerp(0.95, 0.2, u), lerp(1.55, 0.7, u)];
        pose.pernaF = [0.4, -0.6];
        pose.pernaT = [-0.35, 0.3];
        pose.suor = u;
      } else if (fase === "ativo") {
        pose.tronco = 0.42;
        pose.dx = 12;
        pose.quadrilY = -M.quadril + 6;
        pose.bracoF = [Math.PI / 2 + 0.05, 0];
        pose.bracoT = [Math.PI / 2 - 0.12, 0];
        pose.pernaF = [0.65, -0.3];
        pose.pernaT = [-0.5, 0.1];
        pose.suor = 1;
      } else {
        const u = easeOut((t - r.antecipacao - r.ativo) / r.recuperacao);
        pose.tronco = lerp(0.42, 0.08, u);
        pose.dx = lerp(12, 0, u);
        pose.quadrilY = -M.quadril + lerp(6, 0, u);
        pose.bracoF = [lerp(Math.PI / 2 + 0.05, 1.15, u), lerp(0, 1.5, u)];
        pose.bracoT = [lerp(Math.PI / 2 - 0.12, 0.95, u), lerp(0, 1.55, u)];
        pose.pernaF = [lerp(0.65, 0.22, u), lerp(-0.3, -0.18, u)];
        pose.pernaT = [lerp(-0.5, -0.2, u), lerp(0.1, 0.14, u)];
        pose.suor = 1 - u;
        if (u > 0.5) pose.expressao = "neutra";
      }
      break;
    }
    case "defesa": {
      const u = easeOut(t / 0.1);
      pose.tronco = lerp(0.08, -0.12, u);
      pose.quadrilY = -M.quadril + 6 * u;
      pose.bracoF = [lerp(1.15, 1.55, u), lerp(1.5, 2.0, u)];
      pose.bracoT = [lerp(0.95, 1.45, u), lerp(1.55, 2.05, u)];
      pose.pernaF = [0.35, -0.5];
      pose.pernaT = [-0.3, 0.3];
      pose.expressao = "esforco";
      pose.piscar = 0.5;
      break;
    }
    case "atingido": {
      const u = clamp01(t / REGRAS.atingido);
      pose.tronco = -0.5 * (1 - u);
      pose.cabecaGiro = -0.55 * (1 - u);
      pose.bracoF = [lerp(0.5, 1.15, u), lerp(0.4, 1.5, u)];
      pose.bracoT = [lerp(2.2, 0.95, u), lerp(0.5, 1.55, u)];
      pose.pernaF = [0.5, -0.4];
      pose.pernaT = [-0.1, 0.1];
      pose.quadrilY = -M.quadril + 4 * (1 - u);
      pose.expressao = "dor";
      pose.piscar = u < 0.6 ? 1 : 0;
      pose.suor = 1 - u;
      break;
    }
    case "caido": {
      const mexer = movimento ? Math.sin(t * 5) * 0.05 : 0;
      pose.giro = -Math.PI / 2 + 0.08 + mexer;
      pose.dy = -15;
      pose.tronco = 0.12;
      pose.cabecaGiro = 0.25;
      pose.bracoF = [1.2 + mexer * 3, 0.3];
      pose.bracoT = [-0.5, 0.2];
      pose.pernaF = [0.9, -1.3];
      pose.pernaT = [0.5, -0.9];
      pose.expressao = "tonto";
      pose.piscar = 1;
      pose.suor = 0.6;
      break;
    }
    case "levantando": {
      const u = easeOut(t / REGRAS.levantando);
      pose.giro = lerp(-Math.PI / 2 + 0.08, 0, u);
      pose.dy = lerp(-15, 0, u);
      pose.quadrilY = lerp(-M.quadril + 30, -M.quadril, easeIn(u));
      pose.tronco = lerp(0.12, 0.35, Math.min(1, u * 2)) * (1 - u) + 0.08 * u;
      pose.bracoF = [lerp(1.2, 1.15, u), lerp(0.3, 1.5, u)];
      pose.bracoT = [lerp(-0.5, 0.95, u), lerp(0.2, 1.55, u)];
      pose.pernaF = [lerp(0.9, 0.22, u), lerp(-1.3, -0.18, u)];
      pose.pernaT = [lerp(0.5, -0.2, u), lerp(-0.9, 0.14, u)];
      pose.expressao = "esforco";
      pose.suor = 1 - u;
      break;
    }
    case "carregando": {
      if (andando) andar(0.8);
      else pose.quadrilY = -M.quadril + 1 + respiro;
      pose.tronco = 0.14;
      pose.bracoF = [2.35, 0.55];
      pose.bracoT = [2.05, 0.75];
      pose.expressao = "esforco";
      pose.suor = 0.4;
      break;
    }
    case "subindo": {
      const c = l.altura * 7 * Math.PI;
      const s = Math.sin(c);
      pose.tronco = 0.16;
      pose.dx = 2;
      pose.bracoF = [2.45 + 0.25 * s, 0.45];
      pose.bracoT = [2.45 - 0.25 * s, 0.45];
      pose.pernaF = [0.95 + 0.3 * s, -1.15];
      pose.pernaT = [0.95 - 0.3 * s, -1.15];
      pose.expressao = "esforco";
      pose.suor = 0.5;
      break;
    }
    case "noTopo": {
      const tremor = movimento && l.puxando ? Math.sin(tempo * 40) * 0.05 : 0;
      pose.tronco = 0.02;
      pose.pernaF = [0.35, -0.45];
      pose.pernaT = [-0.05, -0.25];
      if (l.puxando) {
        pose.dy = -6;
        pose.bracoF = [Math.PI - 0.08 + tremor, 0.02];
        pose.bracoT = [Math.PI + 0.08 - tremor, -0.02];
        pose.expressao = "esforco";
        pose.piscar = 0.6;
        pose.suor = 1;
      } else {
        pose.bracoF = [2.95, 0.1];
        pose.bracoT = [2.0, 0.5];
        pose.expressao = "neutra";
        pose.suor = 0.5;
        pose.piscar = piscada;
      }
      break;
    }
    case "caindoDaEscada": {
      const w = movimento ? Math.sin(tempo * 30) * 0.3 : 0;
      pose.giro = -0.25 - Math.min(1.1, t * 1.6);
      pose.bracoF = [2.6 + w, 0.3];
      pose.bracoT = [0.4 - w, 0.2];
      pose.pernaF = [0.7 + w, -0.5];
      pose.pernaT = [-0.2 - w, 0.3];
      pose.expressao = "susto";
      pose.suor = 1;
      break;
    }
    case "vitoria": {
      const pulo = movimento ? Math.abs(Math.sin(tempo * 5.5)) : 0.5;
      pose.dy = -pulo * 14;
      pose.quadrilY = -M.quadril - pulo * 2;
      pose.bracoF = [2.95 - pulo * 0.1, 0.15];
      pose.bracoT = [2.8 + pulo * 0.1, 0.25];
      pose.pernaF = [0.3, -0.6 * pulo];
      pose.pernaT = [-0.2, -0.3 * pulo];
      pose.expressao = "alegria";
      pose.piscar = piscada;
      break;
    }
    case "derrota": {
      pose.quadrilY = -30;
      pose.tronco = 0.32;
      pose.cabecaGiro = 0.42;
      pose.bracoF = [0.95, 0.45];
      pose.bracoT = [0.8, 0.55];
      pose.pernaF = [1.2, 0.09];
      pose.pernaT = [1.08, 0.18];
      pose.expressao = "triste";
      pose.piscar = piscada;
      pose.suor = 0.3;
      break;
    }
  }

  if (l.invulneravel > 0 && (l.estado === "levantando" || l.estado === "parado" || l.estado === "andando" || l.estado === "atingido")) {
    pose.alfa = movimento ? 0.62 + 0.38 * (Math.sin(tempo * 36) > 0 ? 1 : 0) : 0.75;
  }
  if (puxandoAlguem && l.estado === "noTopo") pose.suor = 1;
  return pose;
}

// ---------------------------------------------------------------------------
// Desenho
// ---------------------------------------------------------------------------

interface Ponto {
  x: number;
  y: number;
}

/** Cinemática direta de um membro de dois segmentos. */
function membro(origem: Ponto, a1: number, a2: number, c1: number, c2: number): [Ponto, Ponto] {
  const joelho = { x: origem.x + Math.sin(a1) * c1, y: origem.y + Math.cos(a1) * c1 };
  const ponta = { x: joelho.x + Math.sin(a1 + a2) * c2, y: joelho.y + Math.cos(a1 + a2) * c2 };
  return [joelho, ponta];
}

function linha(g: CanvasRenderingContext2D, pontos: readonly Ponto[], largura: number, cor: string): void {
  g.beginPath();
  pontos.forEach((ponto, i) => (i === 0 ? g.moveTo(ponto.x, ponto.y) : g.lineTo(ponto.x, ponto.y)));
  g.lineWidth = largura;
  g.strokeStyle = cor;
  g.stroke();
}

/** Um membro: traço de tinta por baixo, cor por cima, com pontas redondas. */
function desenharMembro(g: CanvasRenderingContext2D, pontos: readonly Ponto[], largura: number, cor: string, contorno: number): void {
  linha(g, pontos, largura + contorno * 2, INK);
  linha(g, pontos, largura, cor);
}

function circulo(g: CanvasRenderingContext2D, x: number, y: number, r: number, cor: string, contorno: number): void {
  g.beginPath();
  g.arc(x, y, r, 0, TAU);
  g.fillStyle = cor;
  g.fill();
  if (contorno > 0) {
    g.lineWidth = contorno;
    g.strokeStyle = INK;
    g.stroke();
  }
}

/** O tronco de terno, do quadril aos ombros, inclinado. Devolve o ponto do pescoço e dos ombros. */
function desenharTronco(g: CanvasRenderingContext2D, figura: Figura, pose: Pose, quadril: Ponto, contorno: number, faixa: boolean): { pescoco: Ponto; ombro: Ponto } {
  const largura = figura.tronco;
  const wq = M.quadris * largura + 3;
  const wo = M.ombro * largura;
  const h = M.troncoAltura;
  g.save();
  g.translate(quadril.x, quadril.y);
  g.rotate(pose.tronco);
  // Paletó.
  g.beginPath();
  g.moveTo(-wq, 4);
  g.lineTo(wq + 2, 4);
  g.quadraticCurveTo(wo + 6, -h * 0.45, wo + 1, -h);
  g.quadraticCurveTo(0, -h - 6, -wo - 1, -h);
  g.quadraticCurveTo(-wo - 6, -h * 0.45, -wq, 4);
  g.closePath();
  g.fillStyle = figura.cores.paleto;
  g.fill();
  g.lineWidth = contorno;
  g.strokeStyle = INK;
  g.lineJoin = "round";
  g.stroke();
  // Sombra das costas.
  g.beginPath();
  g.moveTo(-wq, 3);
  g.quadraticCurveTo(-wo - 5, -h * 0.45, -wo, -h + 1);
  g.quadraticCurveTo(-wo + 5, -h * 0.5, -wq + 6, 3);
  g.closePath();
  g.fillStyle = figura.cores.paletoSombra;
  g.fill();
  // Camisa e gravata, na frente.
  g.beginPath();
  g.moveTo(wo * 0.15, -h + 2);
  g.lineTo(wo * 0.75, -h + 1);
  g.lineTo(wo * 0.45, -h * 0.4);
  g.closePath();
  g.fillStyle = figura.cores.camisa;
  g.fill();
  g.lineWidth = contorno * 0.7;
  g.stroke();
  g.beginPath();
  g.moveTo(wo * 0.42, -h + 1);
  g.lineTo(wo * 0.58, -h + 1);
  g.lineTo(wo * 0.52, -h * 0.42);
  g.lineTo(wo * 0.38, -h * 0.5);
  g.closePath();
  g.fillStyle = figura.cores.gravata;
  g.fill();
  // Lapela.
  linha(g, [{ x: wo * 0.15, y: -h + 2 }, { x: wo * 0.2, y: -h * 0.3 }], contorno * 0.7, INK);
  // A faixa presidencial, de quem venceu.
  if (faixa) {
    g.beginPath();
    g.moveTo(-wo * 0.55, -h + 2);
    g.lineTo(-wo * 0.1, -h + 1);
    g.lineTo(wq + 1, -2);
    g.lineTo(wq - 10, 3);
    g.closePath();
    g.fillStyle = "#1f8f4a";
    g.fill();
    g.lineWidth = contorno * 0.8;
    g.stroke();
    linha(g, [{ x: -wo * 0.33, y: -h + 2 }, { x: wq - 4, y: 1 }], 4, "#f0c66b");
  }
  g.restore();
  const cos = Math.cos(pose.tronco);
  const sin = Math.sin(pose.tronco);
  const pescoco = { x: quadril.x + sin * h, y: quadril.y - cos * h };
  return { pescoco, ombro: { x: pescoco.x - sin * 2, y: pescoco.y + cos * 4 } };
}

/** O rosto do atlas, com a expressão por cima. */
function desenharCabeca(g: CanvasRenderingContext2D, figura: Figura, pose: Pose, centro: Ponto, lado: number): void {
  const k = M.cabecaEscala;
  g.save();
  g.translate(centro.x, centro.y);
  g.rotate(pose.cabecaGiro);
  g.scale(k, k);
  g.lineJoin = "round";
  g.lineCap = "round";
  drawHead(g, figura.cabeca, true, lado, pose.piscar);
  desenharExpressao(g, figura, pose.expressao);
  g.restore();
}

/** Expressões em unidades da cabeça: boca e sobrancelhas por cima do rosto. */
function desenharExpressao(g: CanvasRenderingContext2D, figura: Figura, expressao: Expressao): void {
  if (expressao === "neutra") return;
  const t = figura.cabeca.tintas;
  const cobrirBoca = () => {
    g.beginPath();
    g.ellipse(5.1, 5.7, 2.7, 1.9, 0, 0, TAU);
    g.fillStyle = t.pele;
    g.fill();
    g.globalAlpha *= figura.cabeca.barbaAlfa;
    g.fillStyle = t.barba;
    g.fill();
    g.globalAlpha /= figura.cabeca.barbaAlfa;
  };
  const traco = (d: [number, number, number, number], largura: number) => {
    g.beginPath();
    g.moveTo(d[0], d[1]);
    g.lineTo(d[2], d[3]);
    g.lineWidth = largura;
    g.strokeStyle = INK;
    g.stroke();
  };
  switch (expressao) {
    case "raiva":
      traco([0.6, -4.5, 4.1, -3.0], 1.3);
      traco([7.9, -4.4, 5.2, -3.1], 1.2);
      cobrirBoca();
      g.beginPath();
      g.rect(3.3, 4.9, 3.6, 1.5);
      g.fillStyle = "#fbf9f4";
      g.fill();
      g.lineWidth = 0.6;
      g.strokeStyle = INK;
      g.stroke();
      traco([4.5, 4.9, 4.5, 6.4], 0.45);
      traco([5.7, 4.9, 5.7, 6.4], 0.45);
      break;
    case "dor":
    case "susto":
      traco([0.4, -3.2, 3.9, -4.2], 1.1);
      traco([5.3, -4.2, 7.8, -3.3], 1.0);
      cobrirBoca();
      g.beginPath();
      g.ellipse(5.3, 5.9, 1.4, expressao === "susto" ? 2.1 : 1.7, 0, 0, TAU);
      g.fillStyle = "#3a1d1d";
      g.fill();
      g.lineWidth = 0.6;
      g.strokeStyle = INK;
      g.stroke();
      if (expressao === "susto") {
        for (const [x, y] of [[2.3, -1.3], [6.2, -1.2]] as const) {
          g.beginPath();
          g.ellipse(x, y, 1.5, 1.6, 0, 0, TAU);
          g.fillStyle = "#fbf9f4";
          g.fill();
          g.lineWidth = 0.5;
          g.stroke();
          g.beginPath();
          g.ellipse(x + 0.2, y, 0.55, 0.65, 0, 0, TAU);
          g.fillStyle = INK;
          g.fill();
        }
      }
      break;
    case "esforco":
      traco([0.6, -3.8, 4.0, -3.3], 1.1);
      traco([7.8, -3.9, 5.3, -3.3], 1.0);
      cobrirBoca();
      g.beginPath();
      g.ellipse(5.2, 5.8, 1.0, 1.1, 0, 0, TAU);
      g.fillStyle = "#3a1d1d";
      g.fill();
      break;
    case "alegria":
      traco([0.5, -4.6, 4.0, -4.9], 1.0);
      traco([7.7, -4.8, 5.3, -4.9], 0.95);
      cobrirBoca();
      g.beginPath();
      g.moveTo(2.4, 4.6);
      g.quadraticCurveTo(5.3, 8.4, 8.2, 4.4);
      g.closePath();
      g.fillStyle = "#3a1d1d";
      g.fill();
      g.beginPath();
      g.moveTo(3.0, 4.9);
      g.quadraticCurveTo(5.3, 6.1, 7.7, 4.7);
      g.lineTo(7.4, 4.5);
      g.lineTo(3.2, 4.6);
      g.closePath();
      g.fillStyle = "#fbf9f4";
      g.fill();
      g.beginPath();
      g.moveTo(2.4, 4.6);
      g.quadraticCurveTo(5.3, 8.4, 8.2, 4.4);
      g.lineWidth = 0.7;
      g.strokeStyle = INK;
      g.stroke();
      break;
    case "tonto":
      cobrirBoca();
      g.beginPath();
      g.moveTo(3.2, 5.9);
      g.quadraticCurveTo(4.2, 4.8, 5.2, 5.9);
      g.quadraticCurveTo(6.2, 7.0, 7.2, 5.9);
      g.lineWidth = 0.8;
      g.strokeStyle = INK;
      g.stroke();
      break;
    case "triste":
      traco([0.6, -3.2, 3.9, -4.3], 1.0);
      traco([7.8, -3.1, 5.3, -4.2], 0.95);
      cobrirBoca();
      g.beginPath();
      g.moveTo(3.3, 6.6);
      g.quadraticCurveTo(5.2, 4.7, 7.2, 6.5);
      g.lineWidth = 0.8;
      g.strokeStyle = INK;
      g.stroke();
      break;
  }
}

function desenharSuor(g: CanvasRenderingContext2D, centro: Ponto, suor: number, tempo: number, contorno: number): void {
  if (suor <= 0.05) return;
  const gotas = suor > 0.7 ? 3 : suor > 0.35 ? 2 : 1;
  for (let i = 0; i < gotas; i += 1) {
    const fase = (tempo * 1.6 + i * 0.37) % 1;
    const x = centro.x + 22 + i * 7 - fase * 4;
    const y = centro.y - 18 + i * 9 + fase * 14;
    g.beginPath();
    g.moveTo(x, y - 5);
    g.quadraticCurveTo(x + 3.2, y + 1, x, y + 3.2);
    g.quadraticCurveTo(x - 3.2, y + 1, x, y - 5);
    g.fillStyle = "rgba(186, 222, 240, 0.9)";
    g.fill();
    g.lineWidth = contorno * 0.6;
    g.strokeStyle = INK;
    g.stroke();
  }
}

export interface DesenhoDoLutador {
  /** Centro da cabeça, em coordenadas de tela, para efeitos. */
  cabeca: Ponto;
}

/**
 * Desenha o lutador com os pés em (`sx`, `sy`) na tela, na escala `s`, olhando
 * para `direcao`. `faixa` põe a faixa presidencial no peito (vitória).
 */
export function desenharLutador(g: CanvasRenderingContext2D, figura: Figura, pose: Pose, sx: number, sy: number, s: number, direcao: 1 | -1, tempo: number, faixa: boolean): DesenhoDoLutador {
  const k = s * figura.escala;
  const contorno = 2.2;
  g.save();
  g.globalAlpha *= pose.alfa;
  g.translate(sx, sy);
  g.scale(k * direcao, k);
  g.lineCap = "round";
  g.lineJoin = "round";
  g.translate(pose.dx, pose.dy);
  g.rotate(pose.giro);

  const quadril = { x: 0, y: pose.quadrilY };
  const quadrilF = { x: 5, y: pose.quadrilY + 2 };
  const quadrilT = { x: -5, y: pose.quadrilY + 2 };
  const [joelhoF, peF] = membro(quadrilF, pose.pernaF[0], pose.pernaF[1], M.coxa, M.canela);
  const [joelhoT, peT] = membro(quadrilT, pose.pernaT[0], pose.pernaT[1], M.coxa, M.canela);
  const larguraDaPerna = 13 * figura.tronco;
  const larguraDoBraco = 10.5 * figura.tronco;

  // Membros de trás, por baixo de tudo.
  const topo = { x: Math.sin(pose.tronco) * (M.troncoAltura - 6), y: quadril.y - Math.cos(pose.tronco) * (M.troncoAltura - 6) };
  const ombroT = { x: topo.x - 4, y: topo.y + 2 };
  const ombroF = { x: topo.x + 4, y: topo.y + 1 };
  const [cotoveloT, maoT] = membro(ombroT, pose.bracoT[0], pose.bracoT[1], M.braco, M.antebraco);
  const [cotoveloF, maoF] = membro(ombroF, pose.bracoF[0], pose.bracoF[1], M.braco, M.antebraco);

  desenharMembro(g, [ombroT, cotoveloT, maoT], larguraDoBraco, figura.cores.paletoSombra, contorno);
  circulo(g, maoT.x, maoT.y, 6.5, figura.cores.pele, contorno * 0.8);
  desenharMembro(g, [quadrilT, joelhoT, peT], larguraDaPerna, figura.cores.calca, contorno);
  desenharSapato(g, peT, pose.pernaT[0] + pose.pernaT[1], figura.cores.sapato, contorno);

  const { pescoco } = desenharTronco(g, figura, pose, quadril, contorno, faixa);

  desenharMembro(g, [quadrilF, joelhoF, peF], larguraDaPerna, figura.cores.calca, contorno);
  desenharSapato(g, peF, pose.pernaF[0] + pose.pernaF[1], figura.cores.sapato, contorno);

  // Pescoço e cabeça.
  const cabeca = { x: pescoco.x + Math.sin(pose.tronco) * 20 + 2, y: pescoco.y - Math.cos(pose.tronco) * 20 - 2 };
  desenharMembro(g, [pescoco, { x: cabeca.x - 1, y: cabeca.y + 10 }], 9, figura.cores.pele, contorno * 0.8);
  desenharCabeca(g, figura, pose, cabeca, direcao);

  // Braço da frente, por cima do rosto quando sobe na guarda.
  desenharMembro(g, [ombroF, cotoveloF, maoF], larguraDoBraco, figura.cores.paleto, contorno);
  circulo(g, maoF.x, maoF.y, 7, figura.cores.pele, contorno * 0.8);
  // Punhos da camisa.
  circulo(g, cotoveloF.x + (maoF.x - cotoveloF.x) * 0.78, cotoveloF.y + (maoF.y - cotoveloF.y) * 0.78, larguraDoBraco * 0.55, figura.cores.camisa, 0);

  desenharSuor(g, cabeca, pose.suor, tempo, contorno);

  g.restore();

  const cosG = Math.cos(pose.giro);
  const sinG = Math.sin(pose.giro);
  const cx = (cabeca.x * cosG - cabeca.y * sinG + pose.dx) * k * direcao + sx;
  const cy = (cabeca.x * sinG + cabeca.y * cosG + pose.dy) * k + sy;
  return { cabeca: { x: cx, y: cy } };
}

function desenharSapato(g: CanvasRenderingContext2D, pe: Ponto, angulo: number, cor: string, contorno: number): void {
  g.save();
  g.translate(pe.x, pe.y);
  g.rotate(Math.max(-0.6, Math.min(0.6, angulo * 0.5)));
  g.beginPath();
  g.moveTo(-8, -4);
  g.lineTo(13, -4);
  g.quadraticCurveTo(17, -2, 16, 2);
  g.lineTo(-8, 2);
  g.closePath();
  g.fillStyle = cor;
  g.fill();
  g.lineWidth = contorno * 0.9;
  g.strokeStyle = INK;
  g.lineJoin = "round";
  g.stroke();
  g.restore();
}

/** A sombra no tapete: elipse sob os pés, menor quando o lutador está no alto. */
export function desenharSombra(g: CanvasRenderingContext2D, sx: number, sy: number, s: number, alturaDoMundo: number, deitado: boolean): void {
  const fator = Math.max(0.35, 1 - alturaDoMundo / 500);
  g.beginPath();
  g.ellipse(sx, sy + 2 * s, (deitado ? 70 : 34) * s * fator, 9 * s * fator, 0, 0, TAU);
  g.fillStyle = "rgba(20, 24, 20, 0.28)";
  g.fill();
}

/** O retrato de escolha: o lutador parado, de frente para a direita, em um canvas pequeno. */
export function desenharRetrato(canvas: HTMLCanvasElement, slug: LutadorSlug, tempo: number): void {
  const g = canvas.getContext("2d");
  if (g === null) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const largura = canvas.clientWidth;
  const altura = canvas.clientHeight;
  if (canvas.width !== Math.round(largura * dpr) || canvas.height !== Math.round(altura * dpr)) {
    canvas.width = Math.round(largura * dpr);
    canvas.height = Math.round(altura * dpr);
  }
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, largura, altura);
  const figura = FIGURAS[slug];
  const s = (altura / 215) * 0.98;
  const lutador: Lutador = {
    slug,
    x: 0,
    y: 0,
    direcao: 1,
    vx: 0,
    vy: 0,
    estado: "parado",
    t: tempo,
    equilibrio: 100,
    semRecuperar: 0,
    altura: 0,
    invulneravel: 0,
    recargaGolpe: 0,
    recargaEmpurrao: 0,
    sequencia: 0,
    sequenciaT: 0,
    acertou: false,
    passo: 0,
    puxada: 0,
    puxando: false,
    golpesRecebidos: 0,
    quedas: 0,
    anterior: { esquerda: false, direita: false, cima: false, baixo: false, golpe: false, defesa: false, empurrao: false, interagir: false },
  };
  const pose = poseDe(lutador, tempo, slug === "lula" ? 0 : 1.7, true, false, false);
  desenharSombra(g, largura / 2, altura - 10, s, 0, false);
  desenharLutador(g, figura, pose, largura / 2 - 4 * s, altura - 10, s, 1, tempo, false);
}
