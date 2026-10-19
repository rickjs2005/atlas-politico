// Efeitos do Vale a Faixa: partículas (estrelas de impacto, poeira da queda,
// brilhos da faixa, anéis de impacto) e o tremor de câmera, curto e
// discreto. Vivem em coordenadas do mundo e são desenhadas pela projeção.
// Com movimento reduzido, não há tremor nem partículas.

import type { Projecao } from "./camera";

const TAU = Math.PI * 2;

type TipoDeParticula = "estrela" | "poeira" | "brilho" | "anel" | "risco";

interface Particula {
  tipo: TipoDeParticula;
  x: number;
  y: number;
  vx: number;
  vy: number;
  t: number;
  duracao: number;
  tam: number;
  cor: string;
  giro: number;
}

export interface Efeitos {
  impacto(x: number, y: number, forte: boolean, direcao: 1 | -1): void;
  poeira(x: number, y: number, quantas?: number): void;
  brilho(x: number, y: number): void;
  anel(x: number, y: number, cor?: string): void;
  tremer(amplitude: number): void;
  atualizar(dt: number): void;
  desenhar(g: CanvasRenderingContext2D, pr: Projecao): void;
  /** O deslocamento de câmera deste quadro, em pixels. */
  deslocamento(): { x: number; y: number };
  limpar(): void;
}

export function criarEfeitos(movimento: boolean): Efeitos {
  const particulas: Particula[] = [];
  let tremor = 0;
  let relogio = 0;
  let semente = 7;
  const r = () => {
    semente = (semente * 1103515245 + 12345) & 0x7fffffff;
    return semente / 0x7fffffff;
  };
  const nova = (p: Omit<Particula, "t" | "giro">) => {
    if (!movimento) return;
    if (particulas.length > 220) particulas.shift();
    particulas.push({ ...p, t: 0, giro: r() * TAU });
  };

  return {
    impacto(x, y, forte, direcao) {
      const quantas = forte ? 9 : 5;
      for (let i = 0; i < quantas; i += 1) {
        const ang = (r() - 0.5) * 2.4 + (direcao === 1 ? 0 : Math.PI);
        const vel = 160 + r() * (forte ? 260 : 150);
        nova({ tipo: "estrela", x, y, vx: Math.cos(ang) * vel, vy: Math.sin(ang) * vel + 120, duracao: 0.4 + r() * 0.25, tam: forte ? 9 : 6, cor: i % 3 === 0 ? "#fff5d6" : "#f0c66b" });
      }
      for (let i = 0; i < 3; i += 1) {
        nova({ tipo: "risco", x, y, vx: direcao * (300 + r() * 200), vy: (r() - 0.5) * 200, duracao: 0.18, tam: forte ? 28 : 18, cor: "#fbf9f4" });
      }
    },
    poeira(x, y, quantas = 7) {
      for (let i = 0; i < quantas; i += 1) {
        nova({ tipo: "poeira", x: x + (r() - 0.5) * 60, y, vx: (r() - 0.5) * 160, vy: 40 + r() * 70, duracao: 0.5 + r() * 0.4, tam: 10 + r() * 14, cor: "rgba(214, 208, 192, 0.7)" });
      }
    },
    brilho(x, y) {
      nova({ tipo: "brilho", x: x + (r() - 0.5) * 50, y: y + (r() - 0.5) * 70, vx: 0, vy: 30, duracao: 0.5 + r() * 0.3, tam: 4 + r() * 5, cor: r() < 0.5 ? "#fff5d6" : "#f0c66b" });
    },
    anel(x, y, cor = "#f0c66b") {
      nova({ tipo: "anel", x, y, vx: 0, vy: 0, duracao: 0.32, tam: 18, cor });
    },
    tremer(amplitude) {
      if (!movimento) return;
      tremor = Math.max(tremor, amplitude);
    },
    atualizar(dt) {
      relogio += dt;
      tremor = Math.max(0, tremor - dt * 28);
      for (let i = particulas.length - 1; i >= 0; i -= 1) {
        const p = particulas[i]!;
        p.t += dt;
        if (p.t >= p.duracao) {
          particulas.splice(i, 1);
          continue;
        }
        if (p.tipo === "estrela" || p.tipo === "poeira") {
          p.vy -= (p.tipo === "estrela" ? 900 : 60) * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vx *= Math.exp(-2.5 * dt);
        } else if (p.tipo === "brilho") {
          p.y += p.vy * dt;
        } else if (p.tipo === "risco") {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
        }
        p.giro += dt * 6;
      }
    },
    desenhar(g, pr) {
      const s = pr.s;
      for (const p of particulas) {
        const u = p.t / p.duracao;
        const sx = pr.X(p.x);
        const sy = pr.Y(p.y);
        g.save();
        switch (p.tipo) {
          case "estrela": {
            g.translate(sx, sy);
            g.rotate(p.giro);
            g.globalAlpha = 1 - u * u;
            const raio = p.tam * s * (1 - u * 0.5);
            g.beginPath();
            for (let k = 0; k < 8; k += 1) {
              const ang = (k * Math.PI) / 4;
              const rr = k % 2 === 0 ? raio : raio * 0.42;
              if (k === 0) g.moveTo(Math.cos(ang) * rr, Math.sin(ang) * rr);
              else g.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr);
            }
            g.closePath();
            g.fillStyle = p.cor;
            g.fill();
            g.lineWidth = Math.max(1, 1.5 * s);
            g.strokeStyle = "#1b1c1a";
            g.stroke();
            break;
          }
          case "poeira": {
            g.globalAlpha = (1 - u) * 0.8;
            g.beginPath();
            g.arc(sx, sy, p.tam * s * (0.6 + u), 0, TAU);
            g.fillStyle = p.cor;
            g.fill();
            break;
          }
          case "brilho": {
            g.translate(sx, sy);
            g.globalAlpha = Math.sin(u * Math.PI);
            const raio = p.tam * s;
            g.beginPath();
            g.moveTo(0, -raio);
            g.quadraticCurveTo(0, 0, raio, 0);
            g.quadraticCurveTo(0, 0, 0, raio);
            g.quadraticCurveTo(0, 0, -raio, 0);
            g.quadraticCurveTo(0, 0, 0, -raio);
            g.fillStyle = p.cor;
            g.fill();
            break;
          }
          case "anel": {
            g.globalAlpha = 1 - u;
            g.beginPath();
            g.arc(sx, sy, p.tam * s * (0.4 + u * 2.2), 0, TAU);
            g.lineWidth = Math.max(1.5, (6 - u * 4) * s);
            g.strokeStyle = p.cor;
            g.stroke();
            break;
          }
          case "risco": {
            g.globalAlpha = 1 - u;
            g.beginPath();
            g.moveTo(sx, sy);
            g.lineTo(sx - (p.vx / 300) * p.tam * s, sy + (p.vy / 300) * p.tam * s * 0.4);
            g.lineWidth = Math.max(1, 2.5 * s);
            g.strokeStyle = p.cor;
            g.stroke();
            break;
          }
        }
        g.restore();
      }
    },
    deslocamento() {
      if (tremor <= 0) return { x: 0, y: 0 };
      return { x: Math.sin(relogio * 97) * tremor, y: Math.cos(relogio * 83) * tremor * 0.7 };
    },
    limpar() {
      particulas.length = 0;
      tremor = 0;
    },
  };
}
