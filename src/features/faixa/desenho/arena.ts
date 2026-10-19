// A arena do Vale a Faixa: um ringue de luta livre montado em um palco de
// debate eleitoral. Fundo escuro, painel de LED ao fundo, dois púlpitos,
// treliça com refletores, público estilizado com flashes, cordas, postes com
// protetores verdes e amarelos, o tapete com a zona da faixa marcada e o
// avental. Tudo desenhado por código, em coordenadas do mundo (regras.ts);
// a câmera dá a projeção. O que fica atrás dos lutadores vai em `fundo`; o
// que fica na frente, em `frente`.

import { INK } from "@/features/game/draw/kit";
import { REGRAS, naEscada } from "@/lib/faixa/regras";
import type { Partida } from "@/lib/faixa/tipos";

import type { Projecao } from "./camera";
import { AMARELO, VERDE, VERDE_ESCURO } from "./escada";

const TAU = Math.PI * 2;

/** A profundidade visual: o tapete sobe para trás e desce para a frente da linha dos lutadores. */
const FUNDO_DO_TAPETE = 70;
const FRENTE_DO_TAPETE = -62;
const AVENTAL = -132;
const LARGURA_DO_TAPETE_FUNDO = REGRAS.cordas + 40;
const LARGURA_DO_TAPETE_FRENTE = REGRAS.cordas + 84;
const CORDAS_FUNDO = [115, 160, 205] as const;
const CORDAS_FRENTE = [-48, -30, -12] as const;
const CORES_DAS_CORDAS = [VERDE, AMARELO, VERDE] as const;

interface Espectador {
  x: number;
  y: number;
  tam: number;
  corpo: string;
  pele: string;
  cabelo: string;
  fase: number;
  item: "nada" | "bandeira-verde" | "bandeira-amarela" | "cartaz" | "mao";
}

interface Flash {
  x: number;
  y: number;
  t: number;
}

const CORPOS = ["#3c4a42", "#4a4336", "#2f3a4a", "#5a4b3b", "#444a52", "#3d3d3d", "#4e5a4a", "#55483f"];
const PELES = ["#c9976f", "#8d5a3b", "#e8c5a7", "#5c3b26", "#d9a989", "#b07a55"];
const CABELOS = ["#1f1a16", "#3b2d24", "#6b5547", "#d9d4c8", "#2a2a2a"];

function mulberry(semente: number): () => number {
  let a = semente | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function criarPublico(): Espectador[] {
  const r = mulberry(4242);
  const pessoas: Espectador[] = [];
  const fileiras = [
    { y: 82, tam: 26, passo: 46 },
    { y: 118, tam: 23, passo: 42 },
    { y: 150, tam: 20, passo: 38 },
    { y: 178, tam: 17, passo: 34 },
  ];
  for (const fileira of fileiras) {
    for (let x = -820; x <= 820; x += fileira.passo) {
      if (r() < 0.08) continue;
      const sorteio = r();
      const item: Espectador["item"] = sorteio < 0.07 ? "bandeira-verde" : sorteio < 0.14 ? "bandeira-amarela" : sorteio < 0.19 ? "cartaz" : sorteio < 0.3 ? "mao" : "nada";
      pessoas.push({
        x: x + (r() - 0.5) * 16,
        y: fileira.y + (r() - 0.5) * 6,
        tam: fileira.tam * (0.9 + r() * 0.2),
        corpo: CORPOS[Math.floor(r() * CORPOS.length)]!,
        pele: PELES[Math.floor(r() * PELES.length)]!,
        cabelo: CABELOS[Math.floor(r() * CABELOS.length)]!,
        fase: r() * TAU,
        item,
      });
    }
  }
  // As fileiras de trás são desenhadas primeiro.
  return pessoas.sort((a, b) => b.y - a.y);
}

export interface Arena {
  fundo(g: CanvasRenderingContext2D, pr: Projecao, p: Partida, tempo: number, movimento: boolean, dt: number): void;
  frente(g: CanvasRenderingContext2D, pr: Projecao): void;
}

export function criarArena(): Arena {
  const publico = criarPublico();
  const flashes: Flash[] = [];
  let acumuladoDeFlashes = 0;
  let semente = 99;
  const aleatorio = () => {
    semente = (semente * 1103515245 + 12345) & 0x7fffffff;
    return semente / 0x7fffffff;
  };

  const desenharPublico = (g: CanvasRenderingContext2D, pr: Projecao, torcida: number, tempo: number, movimento: boolean) => {
    const s = pr.s;
    const esquerda = pr.X(-900);
    const direita = pr.X(900);
    if (direita < 0 || esquerda > pr.tela.largura) return;
    for (const pessoa of publico) {
      const sx = pr.X(pessoa.x);
      if (sx < -40 * s || sx > pr.tela.largura + 40 * s) continue;
      const pulo = movimento ? Math.max(0, Math.sin(tempo * (4 + torcida * 6) + pessoa.fase)) * torcida * 9 : 0;
      const sy = pr.Y(pessoa.y + pulo);
      const tam = pessoa.tam * s;
      // Ombros.
      g.beginPath();
      g.moveTo(sx - tam * 0.95, sy + tam * 1.1);
      g.quadraticCurveTo(sx - tam * 0.9, sy + tam * 0.1, sx - tam * 0.4, sy);
      g.lineTo(sx + tam * 0.4, sy);
      g.quadraticCurveTo(sx + tam * 0.9, sy + tam * 0.1, sx + tam * 0.95, sy + tam * 1.1);
      g.closePath();
      g.fillStyle = pessoa.corpo;
      g.fill();
      // Cabeça e cabelo.
      g.beginPath();
      g.arc(sx, sy - tam * 0.38, tam * 0.42, 0, TAU);
      g.fillStyle = pessoa.pele;
      g.fill();
      g.beginPath();
      g.arc(sx, sy - tam * 0.46, tam * 0.4, Math.PI * 1.05, Math.PI * 1.95);
      g.fillStyle = pessoa.cabelo;
      g.fill();
      // O que levanta.
      if (pessoa.item === "nada") continue;
      const ondula = movimento ? Math.sin(tempo * 3 + pessoa.fase) * 0.18 : 0;
      g.save();
      g.translate(sx + tam * 0.55, sy - tam * 0.5);
      g.rotate(-0.35 + ondula);
      g.lineWidth = Math.max(1, 2 * s);
      g.strokeStyle = "#8a8f88";
      g.beginPath();
      g.moveTo(0, 0);
      g.lineTo(0, -tam * 1.4);
      g.stroke();
      if (pessoa.item === "bandeira-verde" || pessoa.item === "bandeira-amarela") {
        g.beginPath();
        g.moveTo(0, -tam * 1.4);
        g.lineTo(tam * 0.9, -tam * 1.25);
        g.lineTo(0, -tam * 0.85);
        g.closePath();
        g.fillStyle = pessoa.item === "bandeira-verde" ? VERDE : AMARELO;
        g.fill();
      } else if (pessoa.item === "cartaz") {
        g.beginPath();
        g.rect(-tam * 0.55, -tam * 2.1, tam * 1.1, tam * 0.7);
        g.fillStyle = "#f4f0e7";
        g.fill();
        g.lineWidth = Math.max(1, 1.5 * s);
        g.strokeStyle = INK;
        g.stroke();
        g.fillStyle = INK;
        g.font = `700 ${Math.max(4, tam * 0.3)}px sans-serif`;
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.fillText("FAIXA!", 0, -tam * 1.75);
      } else {
        g.beginPath();
        g.ellipse(0, -tam * 1.5, tam * 0.3, tam * 0.4, 0, 0, TAU);
        g.fillStyle = AMARELO;
        g.fill();
      }
      g.restore();
    }
  };

  const atualizarFlashes = (pr: Projecao, torcida: number, dt: number, movimento: boolean) => {
    if (movimento) {
      acumuladoDeFlashes += dt * (2 + torcida * 14);
      while (acumuladoDeFlashes >= 1) {
        acumuladoDeFlashes -= 1;
        flashes.push({ x: -820 + aleatorio() * 1640, y: 70 + aleatorio() * 130, t: 0 });
      }
    }
    for (let i = flashes.length - 1; i >= 0; i -= 1) {
      const flash = flashes[i]!;
      flash.t += dt;
      if (flash.t > 0.28) flashes.splice(i, 1);
    }
    void pr;
  };

  const desenharFlashes = (g: CanvasRenderingContext2D, pr: Projecao) => {
    for (const flash of flashes) {
      const u = flash.t / 0.28;
      const r = (6 + u * 14) * pr.s;
      const alfa = (1 - u) * 0.9;
      const sx = pr.X(flash.x);
      const sy = pr.Y(flash.y);
      g.beginPath();
      for (let k = 0; k < 8; k += 1) {
        const ang = (k * Math.PI) / 4;
        const raio = k % 2 === 0 ? r : r * 0.35;
        const px = sx + Math.cos(ang) * raio;
        const py = sy + Math.sin(ang) * raio;
        if (k === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.closePath();
      g.fillStyle = `rgba(255, 252, 240, ${alfa.toFixed(3)})`;
      g.fill();
    }
  };

  const desenharCenario = (g: CanvasRenderingContext2D, pr: Projecao, p: Partida, tempo: number, movimento: boolean) => {
    const s = pr.s;
    const { largura, altura } = pr.tela;
    // O fundo do palco.
    const grad = g.createLinearGradient(0, 0, 0, altura);
    grad.addColorStop(0, "#070a08");
    grad.addColorStop(0.55, "#101712");
    grad.addColorStop(1, "#0a0d0b");
    g.fillStyle = grad;
    g.fillRect(0, 0, largura, altura);

    // O painel de LED do debate, atrás do público e da treliça. Vai alto,
    // para a tela em pé não ficar vazia acima do ringue.
    const pulso = movimento ? 0.6 + 0.4 * Math.sin(tempo * 2.2) : 0.8;
    const pX = pr.X(-760);
    const pY = pr.Y(1100);
    const pW = 1520 * s;
    const pH = 970 * s;
    g.fillStyle = "#121a15";
    g.fillRect(pX, pY, pW, pH);
    g.lineWidth = Math.max(1, 2 * s);
    g.strokeStyle = "#263129";
    g.strokeRect(pX, pY, pW, pH);
    // Painéis menores, em grade, na parte de cima.
    g.strokeStyle = "#1b2420";
    for (let y = 560; y < 1100; y += 135) {
      for (let x = -760; x < 760; x += 190) g.strokeRect(pr.X(x) + 3 * s, pr.Y(y + 135) + 3 * s, 184 * s, 129 * s);
    }
    g.fillStyle = `rgba(31, 143, 74, ${(0.16 * pulso).toFixed(3)})`;
    g.fillRect(pX, pr.Y(560), pW, 3 * s);
    g.fillStyle = `rgba(240, 198, 107, ${(0.14 * pulso).toFixed(3)})`;
    g.fillRect(pX, pr.Y(830), pW, 3 * s);
    // A linha de luz.
    g.fillStyle = `rgba(240, 198, 107, ${(0.35 * pulso).toFixed(3)})`;
    g.fillRect(pX, pr.Y(392), pW, 3 * s);
    g.fillStyle = `rgba(31, 143, 74, ${(0.3 * pulso).toFixed(3)})`;
    g.fillRect(pX, pr.Y(160), pW, 3 * s);
    g.save();
    g.font = `800 ${118 * s}px ${FONTE_SANS}`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillStyle = "rgba(197, 203, 194, 0.09)";
    g.fillText("DEBATE", pr.X(0), pr.Y(300));
    g.font = `700 ${30 * s}px ${FONTE_SANS}`;
    g.fillStyle = "rgba(240, 198, 107, 0.22)";
    g.fillText("VALE A FAIXA · AO VIVO", pr.X(0), pr.Y(208));
    g.restore();

    // A treliça com os refletores, no alto.
    const yTrelica = pr.Y(470);
    g.lineWidth = Math.max(1, 3 * s);
    g.strokeStyle = "#2a332d";
    g.beginPath();
    g.moveTo(pr.X(-900), yTrelica);
    g.lineTo(pr.X(900), yTrelica);
    g.moveTo(pr.X(-900), yTrelica - 16 * s);
    g.lineTo(pr.X(900), yTrelica - 16 * s);
    g.stroke();
    for (let x = -880; x <= 880; x += 40) {
      g.beginPath();
      g.moveTo(pr.X(x), yTrelica);
      g.lineTo(pr.X(x + 20), yTrelica - 16 * s);
      g.stroke();
    }
    // Refletores: os cones de luz sobre o ringue.
    for (const lado of [-1, 1] as const) {
      const origemX = pr.X(lado * 560);
      const origemY = yTrelica;
      const alvoX = pr.X(lado * 60);
      const alvoY = pr.Y(0);
      const cone = g.createLinearGradient(origemX, origemY, alvoX, alvoY);
      cone.addColorStop(0, "rgba(240, 220, 160, 0.22)");
      cone.addColorStop(1, "rgba(240, 220, 160, 0)");
      g.beginPath();
      g.moveTo(origemX - 10 * s, origemY);
      g.lineTo(origemX + 10 * s, origemY);
      g.lineTo(pr.X(lado * 60 + 330), alvoY + 10 * s);
      g.lineTo(pr.X(lado * 60 - 330), alvoY + 10 * s);
      g.closePath();
      g.fillStyle = cone;
      g.fill();
      g.beginPath();
      g.rect(origemX - 14 * s, origemY - 4 * s, 28 * s, 22 * s);
      g.fillStyle = "#30393a";
      g.fill();
      g.beginPath();
      g.arc(origemX, origemY + 18 * s, 9 * s, 0, TAU);
      g.fillStyle = "#fff5d6";
      g.fill();
    }

    // Os púlpitos do debate, nas laterais.
    for (const lado of [-1, 1] as const) {
      const x = lado * 640;
      g.beginPath();
      g.moveTo(pr.X(x - 46), pr.Y(FUNDO_DO_TAPETE + 10));
      g.lineTo(pr.X(x + 46), pr.Y(FUNDO_DO_TAPETE + 10));
      g.lineTo(pr.X(x + 34), pr.Y(FUNDO_DO_TAPETE + 120));
      g.lineTo(pr.X(x - 34), pr.Y(FUNDO_DO_TAPETE + 120));
      g.closePath();
      g.fillStyle = "#2a2f2b";
      g.fill();
      g.lineWidth = Math.max(1, 2 * s);
      g.strokeStyle = INK;
      g.stroke();
      g.fillStyle = "#3a403c";
      g.fillRect(pr.X(x - 40), pr.Y(FUNDO_DO_TAPETE + 128), 80 * s, 10 * s);
      g.beginPath();
      g.moveTo(pr.X(x + lado * 6), pr.Y(FUNDO_DO_TAPETE + 128));
      g.lineTo(pr.X(x - lado * 10), pr.Y(FUNDO_DO_TAPETE + 170));
      g.lineWidth = Math.max(1, 2.5 * s);
      g.strokeStyle = "#8a8f88";
      g.stroke();
      g.beginPath();
      g.arc(pr.X(x - lado * 12), pr.Y(FUNDO_DO_TAPETE + 174), 5 * s, 0, TAU);
      g.fillStyle = "#1b1c1a";
      g.fill();
    }

    desenharPublico(g, pr, p.torcida, tempo, movimento);
    desenharFlashes(g, pr);
  };

  const desenharPoste = (g: CanvasRenderingContext2D, pr: Projecao, x: number, base: number, alturaDoPoste: number, cordas: readonly number[]) => {
    const s = pr.s;
    g.beginPath();
    g.moveTo(pr.X(x), pr.Y(base));
    g.lineTo(pr.X(x), pr.Y(base + alturaDoPoste));
    g.lineWidth = Math.max(2, 12 * s);
    g.strokeStyle = INK;
    g.stroke();
    g.lineWidth = Math.max(1, 8 * s);
    g.strokeStyle = "#8a8f88";
    g.stroke();
    // Os protetores, um por corda, alternando verde e amarelo.
    cordas.forEach((y, i) => {
      g.beginPath();
      g.rect(pr.X(x) - 12 * s, pr.Y(y) - 10 * s, 24 * s, 20 * s);
      g.fillStyle = i % 2 === 0 ? VERDE : AMARELO;
      g.fill();
      g.lineWidth = Math.max(1, 2 * s);
      g.strokeStyle = INK;
      g.stroke();
    });
  };

  const desenharCordas = (g: CanvasRenderingContext2D, pr: Projecao, alturas: readonly number[], meiaLargura: number) => {
    const s = pr.s;
    alturas.forEach((y, i) => {
      g.beginPath();
      g.moveTo(pr.X(-meiaLargura), pr.Y(y));
      g.quadraticCurveTo(pr.X(0), pr.Y(y - 7), pr.X(meiaLargura), pr.Y(y));
      g.lineWidth = Math.max(2, 8 * s);
      g.strokeStyle = INK;
      g.stroke();
      g.lineWidth = Math.max(1, 5 * s);
      g.strokeStyle = CORES_DAS_CORDAS[i] ?? VERDE;
      g.stroke();
    });
  };

  const desenharTapete = (g: CanvasRenderingContext2D, pr: Projecao, p: Partida, tempo: number, movimento: boolean) => {
    const s = pr.s;
    // O chão do palco, fora do ringue.
    g.fillStyle = "#171c18";
    g.fillRect(0, pr.Y(FUNDO_DO_TAPETE + 2), pr.tela.largura, pr.tela.altura);
    // O tapete.
    const tapete = g.createLinearGradient(0, pr.Y(FUNDO_DO_TAPETE), 0, pr.Y(FRENTE_DO_TAPETE));
    tapete.addColorStop(0, "#d9d3c3");
    tapete.addColorStop(1, "#ece7d9");
    g.beginPath();
    g.moveTo(pr.X(-LARGURA_DO_TAPETE_FUNDO), pr.Y(FUNDO_DO_TAPETE));
    g.lineTo(pr.X(LARGURA_DO_TAPETE_FUNDO), pr.Y(FUNDO_DO_TAPETE));
    g.lineTo(pr.X(LARGURA_DO_TAPETE_FRENTE), pr.Y(FRENTE_DO_TAPETE));
    g.lineTo(pr.X(-LARGURA_DO_TAPETE_FRENTE), pr.Y(FRENTE_DO_TAPETE));
    g.closePath();
    g.fillStyle = tapete;
    g.fill();
    g.lineWidth = Math.max(1, 3 * s);
    g.strokeStyle = INK;
    g.stroke();
    // A luz dos refletores no centro.
    const luz = g.createRadialGradient(pr.X(0), pr.Y(4), 0, pr.X(0), pr.Y(4), 420 * s);
    luz.addColorStop(0, "rgba(255, 250, 230, 0.35)");
    luz.addColorStop(1, "rgba(255, 250, 230, 0)");
    g.fillStyle = luz;
    g.fillRect(pr.X(-LARGURA_DO_TAPETE_FRENTE), pr.Y(FUNDO_DO_TAPETE), 2 * LARGURA_DO_TAPETE_FRENTE * s, (FUNDO_DO_TAPETE - FRENTE_DO_TAPETE) * s);
    // O nome do jogo no tapete.
    g.save();
    g.translate(pr.X(0), pr.Y(-18));
    g.scale(s, s * 0.42);
    g.font = `800 92px ${FONTE_SANS}`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillStyle = "rgba(27, 28, 26, 0.08)";
    g.fillText("VALE A FAIXA", 0, 0);
    g.restore();
    // A zona da faixa: onde a escada pode ficar em pé. Pulsa quando alguém leva a escada.
    const carregando = p.escada.estado === "carregada";
    const pulso = movimento && carregando ? 0.6 + 0.4 * Math.sin(tempo * 6) : 0.55;
    const alfa = carregando ? 0.28 + 0.22 * pulso : p.escada.estado === "emPe" ? 0.12 : 0.18;
    g.beginPath();
    g.ellipse(pr.X(0), pr.Y(0), REGRAS.escada.zona * s, REGRAS.escada.zona * 0.42 * s, 0, 0, TAU);
    g.fillStyle = `rgba(240, 198, 107, ${alfa.toFixed(3)})`;
    g.fill();
    g.setLineDash([8 * s, 6 * s]);
    g.lineDashOffset = movimento ? -tempo * 30 * s : 0;
    g.lineWidth = Math.max(1, 2.5 * s);
    g.strokeStyle = carregando ? "#f0c66b" : "rgba(240, 198, 107, 0.7)";
    g.stroke();
    g.setLineDash([]);
    if (carregando) {
      g.font = `700 ${Math.max(10, 13 * s)}px ${FONTE_SANS}`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillStyle = "#6b4b00";
      g.fillText("AQUI", pr.X(0), pr.Y(42));
    }
    // A luz que desce sobre quem puxa a faixa.
    if (p.lutadores.some((l) => naEscada(l) && l.altura > 0.9)) {
      const foco = g.createRadialGradient(pr.X(p.escada.x), pr.Y(0), 0, pr.X(p.escada.x), pr.Y(0), 150 * s);
      foco.addColorStop(0, "rgba(255, 250, 230, 0.28)");
      foco.addColorStop(1, "rgba(255, 250, 230, 0)");
      g.fillStyle = foco;
      g.fillRect(pr.X(p.escada.x - 150), pr.Y(FUNDO_DO_TAPETE), 300 * s, (FUNDO_DO_TAPETE - FRENTE_DO_TAPETE) * s);
    }
  };

  return {
    fundo(g, pr, p, tempo, movimento, dt) {
      atualizarFlashes(pr, p.torcida, dt, movimento);
      desenharCenario(g, pr, p, tempo, movimento);
      // Postes e cordas de trás.
      for (const lado of [-1, 1] as const) desenharPoste(g, pr, lado * (REGRAS.cordas + 36), FUNDO_DO_TAPETE, 160, CORDAS_FUNDO);
      desenharCordas(g, pr, CORDAS_FUNDO, REGRAS.cordas + 36);
      desenharTapete(g, pr, p, tempo, movimento);
    },
    frente(g, pr) {
      const s = pr.s;
      // O avental, com o nome do jogo.
      g.beginPath();
      g.moveTo(pr.X(-LARGURA_DO_TAPETE_FRENTE), pr.Y(FRENTE_DO_TAPETE));
      g.lineTo(pr.X(LARGURA_DO_TAPETE_FRENTE), pr.Y(FRENTE_DO_TAPETE));
      g.lineTo(pr.X(LARGURA_DO_TAPETE_FRENTE + 10), pr.Y(AVENTAL));
      g.lineTo(pr.X(-LARGURA_DO_TAPETE_FRENTE - 10), pr.Y(AVENTAL));
      g.closePath();
      g.fillStyle = VERDE_ESCURO;
      g.fill();
      g.lineWidth = Math.max(1, 3 * s);
      g.strokeStyle = INK;
      g.stroke();
      g.fillStyle = AMARELO;
      g.fillRect(pr.X(-LARGURA_DO_TAPETE_FRENTE), pr.Y(FRENTE_DO_TAPETE - 10), 2 * LARGURA_DO_TAPETE_FRENTE * s, 4 * s);
      g.save();
      g.font = `800 ${34 * s}px ${FONTE_SANS}`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillStyle = "rgba(240, 198, 107, 0.9)";
      g.fillText("VALE A FAIXA", pr.X(0), pr.Y((FRENTE_DO_TAPETE + AVENTAL) / 2 - 6));
      g.restore();
      // Cordas e postes da frente, baixos, para não cobrir ninguém.
      desenharCordas(g, pr, CORDAS_FRENTE, REGRAS.cordas + 70);
      for (const lado of [-1, 1] as const) desenharPoste(g, pr, lado * (REGRAS.cordas + 70), FRENTE_DO_TAPETE, 62, CORDAS_FRENTE);
    },
  };
}

/** A família tipográfica do atlas, lida das variáveis de fonte quando há documento. */
export let FONTE_SANS = "ui-sans-serif, system-ui, sans-serif";
export let FONTE_SERIF = "ui-serif, Georgia, serif";

export function lerFontes(): void {
  if (typeof document === "undefined") return;
  const estilo = getComputedStyle(document.documentElement);
  const sans = estilo.getPropertyValue("--font-franklin").trim();
  const serif = estilo.getPropertyValue("--font-newsreader").trim();
  if (sans !== "") FONTE_SANS = `${sans}, ui-sans-serif, system-ui, sans-serif`;
  if (serif !== "") FONTE_SERIF = `${serif}, ui-serif, Georgia, serif`;
}
