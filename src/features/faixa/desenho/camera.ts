// A câmera do Vale a Faixa: enquadra os dois lutadores, a escada em pé e,
// quando alguém sobe, a faixa, e aproxima de leve no momento da subida sem
// esconder o adversário. Tudo em unidades do mundo (regras.ts): `x` com o
// centro do ringue em zero e `y` para cima, com o tapete em zero.

import { REGRAS, alturaNaEscada, naEscada } from "@/lib/faixa/regras";
import type { Partida } from "@/lib/faixa/tipos";

export interface Camera {
  /** O ponto do mundo que fica no centro da tela. */
  x: number;
  y: number;
  /** Pixels de tela por unidade do mundo. */
  zoom: number;
}

export interface Tela {
  largura: number;
  altura: number;
  /** Pixels de baixo ocupados pelos controles de toque: a cena se enquadra acima deles. */
  margemInferior?: number;
}

/** A largura e a altura mínimas do mundo que a tela mostra: a câmera nunca aproxima mais do que isso. */
const VISIVEL_MINIMO = { largura: 620, altura: 400 };
const ZOOM_MAXIMO = 1.6;
/** Até onde, abaixo do tapete, a tela mostra: o avental e um pouco de chão. */
const FUNDO_VISIVEL = -170;
const ZOOM_MINIMO = 0.38;
const ALTURA_DO_LUTADOR = 185;

/** Onde a câmera quer estar, pela partida e pelo tamanho da tela. */
export function alvoDaCamera(p: Partida, tela: Tela): Camera {
  const [a, b] = p.lutadores;
  let esquerda = Math.min(a.x, b.x) - 100;
  let direita = Math.max(a.x, b.x) + 100;
  let topo = Math.max(a.y, b.y) + ALTURA_DO_LUTADOR;
  const alguemSubindo = p.lutadores.some((l) => (naEscada(l) && l.altura > 0.25) || l.estado === "caindoDaEscada" || l.estado === "vitoria");
  if (p.escada.estado === "emPe" || p.escada.estado === "caindo") {
    topo = Math.max(topo, REGRAS.escada.altura + 40);
    esquerda = Math.min(esquerda, p.escada.x - 80);
    direita = Math.max(direita, p.escada.x + 80);
  }
  if (alguemSubindo || p.fase === "fim") topo = Math.max(topo, REGRAS.faixa.altura + 70);
  if (p.fase === "contagem") {
    esquerda = Math.min(esquerda, -330);
    direita = Math.max(direita, 330);
    topo = Math.max(topo, alturaNaEscada(1) + 150);
  }
  const margem = tela.margemInferior ?? 0;
  const alturaUtil = Math.max(120, tela.altura - margem);
  const larguraDoMundo = Math.max(VISIVEL_MINIMO.largura, direita - esquerda);
  const alturaDoMundo = Math.max(VISIVEL_MINIMO.altura, topo + 50 + 110);
  let zoom = Math.min(tela.largura / larguraDoMundo, alturaUtil / alturaDoMundo);
  // No momento da subida, um pouco mais perto, sem deixar ninguém de fora.
  const aproximacao = alguemSubindo && p.fase === "luta" ? 1.08 : 1;
  zoom = Math.max(ZOOM_MINIMO, Math.min(ZOOM_MAXIMO, zoom * aproximacao));
  zoom = Math.min(zoom, tela.largura / (direita - esquerda), alturaUtil / (topo + 60));

  const meiaLargura = tela.largura / zoom / 2;
  const x = Math.max(-REGRAS.cordas - 160 + meiaLargura, Math.min(REGRAS.cordas + 160 - meiaLargura, (esquerda + direita) / 2));
  // O tapete fica no terço de baixo da tela; se o que interessa está alto, a
  // câmera sobe só o necessário; e nunca mostra mais do que o avental embaixo.
  const alturaVisivel = alturaUtil / zoom;
  const yDoChao = alturaVisivel * (0.5 - 0.74);
  const yParaOTopo = topo + 50 - alturaVisivel / 2;
  const yDoAvental = FUNDO_VISIVEL + alturaVisivel / 2;
  // O centro da area util fica acima do centro da tela: a camera compensa.
  const y = Math.max(yDoChao, yParaOTopo, yDoAvental) - margem / 2 / zoom;
  return { x, y, zoom };
}

/** Aproxima a câmera do alvo, com suavidade proporcional ao tempo. */
export function seguir(camera: Camera, alvo: Camera, dt: number, imediato: boolean): void {
  if (imediato) {
    camera.x = alvo.x;
    camera.y = alvo.y;
    camera.zoom = alvo.zoom;
    return;
  }
  const k = 1 - Math.exp(-dt * 4.5);
  camera.x += (alvo.x - camera.x) * k;
  camera.y += (alvo.y - camera.y) * k;
  camera.zoom += (alvo.zoom - camera.zoom) * k;
}

/** Converte um ponto do mundo em pixels de tela. */
export interface Projecao {
  X(x: number): number;
  Y(y: number): number;
  s: number;
  tela: Tela;
}

export function projecao(camera: Camera, tela: Tela, tremorX = 0, tremorY = 0): Projecao {
  const cx = tela.largura / 2 + tremorX;
  const cy = tela.altura / 2 + tremorY;
  const s = camera.zoom;
  return {
    X: (x) => cx + (x - camera.x) * s,
    Y: (y) => cy - (y - camera.y) * s,
    s,
    tela,
  };
}
