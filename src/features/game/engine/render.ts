// Desenho de um quadro da cena: piso, paredes, elementos de cenário, pastas,
// guia, personagem e porta, em ordem de profundidade. Puro sobre o estado que
// recebe; quem anima é o laço (loop.ts).
//
// O que não muda de um quadro para o outro é desenhado uma vez, em telas à
// parte, e copiado a cada quadro: as paredes de trás com o piso e os detalhes
// de chão; os parapeitos da frente; e cada elemento de cenário parado. A cada
// quadro, de novo, só o que se move: o personagem, o guia, as pastas, a
// porta, a bandeira e a planta, que balançam. Sem isso, os milhares de traços
// do cenário seriam refeitos sessenta vezes por segundo.

import type { Epoca, PersonagemSlug, PlayerState, PropKind, SceneSpec } from "@/lib/game/types";
import { sceneBounds, type Camera, type Viewport } from "@/lib/game/world/camera";
import { CELL, cellAt } from "@/lib/game/world/grid";
import { toScreen } from "@/lib/game/world/iso";

import { GUIDE, RECORD_ART, SCENE_ART, characterArt, type CellInfo, type DrawContext, type WallSide } from "../draw";

/** Uma pasta no cenário: a célula em que fica e se é o marco da fase, que vai em destaque. */
export interface SceneFolder {
  x: number;
  y: number;
  destaque: boolean;
}

export interface RenderState {
  scene: SceneSpec;
  personagem: PersonagemSlug;
  /** A figura do personagem nesta fase (D-111). */
  epoca: Epoca;
  player: PlayerState;
  /** As pastas da fase: a do marco e as dos registros para explorar. */
  pastas: readonly SceneFolder[];
  /** Abertura da porta, de 0 (fechada) a 1 (aberta): abre quando a fase termina. */
  abertura: number;
  camera: Camera;
  tempo: number;
  movimento: boolean;
  /** Sem o personagem: para a prévia do mundo. */
  semJogador?: boolean;
}

interface Drawable {
  /** Profundidade: cresce para o que está mais perto da câmera. */
  z: number;
  draw(): void;
}

/** A borda de uma célula de parede. Os cantos de trás contam como norte ou oeste. */
export function wallSide(scene: SceneSpec, x: number, y: number): WallSide {
  if (y === 0) return "norte";
  if (x === 0) return "oeste";
  if (x === scene.largura - 1) return "leste";
  return "sul";
}

const infoOf = (scene: SceneSpec, x: number, y: number): CellInfo => ({ cena: scene.id, arte: scene.arte, x, y, largura: scene.largura, altura: scene.altura });

// ---------------------------------------------------------------------------
// O que é fixo na cena
// ---------------------------------------------------------------------------

/** Elementos de cenário que balançam com o tempo: com movimento, são desenhados a cada quadro. */
const ANIMADOS: ReadonlySet<PropKind> = new Set<PropKind>(["bandeira", "planta"]);

/** As paredes de trás, o piso, a soleira da saída e os detalhes de chão. */
function drawBack(d: DrawContext, scene: SceneSpec): void {
  // As paredes de trás vêm antes do piso: o piso encosta nelas.
  for (let y = 0; y < scene.altura; y += 1) {
    for (let x = 0; x < scene.largura; x += 1) {
      if (cellAt(scene, x, y) !== CELL.parede) continue;
      const lado = wallSide(scene, x, y);
      if (lado !== "norte" && lado !== "oeste") continue;
      const { sx, sy } = toScreen(x + 0.5, y + 0.5);
      SCENE_ART.drawWall(d, scene.paleta, sx, sy, lado, infoOf(scene, x, y));
    }
  }

  const tapetes = new Set(scene.tapetes.map((c) => `${c.x},${c.y}`));
  for (let y = 0; y < scene.altura; y += 1) {
    for (let x = 0; x < scene.largura; x += 1) {
      const celula = cellAt(scene, x, y);
      if (celula === CELL.parede || celula === CELL.saida) continue;
      const { sx, sy } = toScreen(x + 0.5, y + 0.5);
      SCENE_ART.drawFloor(d, scene.paleta, sx, sy, ((x + y) % 2) as 0 | 1, tapetes.has(`${x},${y}`), infoOf(scene, x, y));
    }
  }

  // A soleira da saída faz parte do chão: o personagem pisa por cima dela.
  // Aqui vai fechada; as setas da saída aberta entram a cada quadro.
  {
    const { x, y, lado } = scene.saida;
    const { sx, sy } = toScreen(x + 0.5, y + 0.5);
    SCENE_ART.drawThreshold(d, scene.paleta, sx, sy, lado, 0, infoOf(scene, x, y));
  }

  // Detalhes de chão, que não bloqueiam: sobre o piso, sob tudo o que fica em pé.
  for (const prop of scene.props) {
    if (prop.tipo !== "decoracao") continue;
    const { sx, sy } = toScreen(prop.x + 0.5, prop.y + 0.5);
    SCENE_ART.drawProp(d, scene.paleta, prop.tipo, sx, sy, prop.variante ?? 0, prop.espelhado ?? false, infoOf(scene, prop.x, prop.y));
  }
}

/**
 * Os parapeitos da frente, do fundo para a frente. Ficam na borda da sala, e
 * nada de dentro dela passa na frente deles: por isso podem ir todos depois
 * do que está dentro, em uma camada só.
 */
function drawFront(d: DrawContext, scene: SceneSpec): void {
  const celulas: { x: number; y: number; lado: WallSide }[] = [];
  for (let y = 0; y < scene.altura; y += 1) {
    for (let x = 0; x < scene.largura; x += 1) {
      if (cellAt(scene, x, y) !== CELL.parede) continue;
      const lado = wallSide(scene, x, y);
      if (lado === "leste" || lado === "sul") celulas.push({ x, y, lado });
    }
  }
  celulas.sort((a, b) => a.x + a.y - (b.x + b.y));
  for (const { x, y, lado } of celulas) {
    const { sx, sy } = toScreen(x + 0.5, y + 0.5);
    SCENE_ART.drawWall(d, scene.paleta, sx, sy, lado, infoOf(scene, x, y));
  }
}

// ---------------------------------------------------------------------------
// Telas prontas do que é fixo
// ---------------------------------------------------------------------------

/** Uma tela pronta e onde ela fica, em pixels do aparelho, a partir da origem do mundo. */
interface Sprite {
  canvas: HTMLCanvasElement;
  dx: number;
  dy: number;
}

interface SceneCache {
  fundo: Sprite;
  frente: Sprite;
  /** Um por item de `scene.props`; `null` nos detalhes de chão, que já estão no fundo. */
  props: (Sprite | null)[];
}

/** A caixa de um elemento de cenário em volta do ponto de apoio, em pixels de mundo, com folga. */
const PROP_BOX = { x0: -34, x1: 34, y0: -94, y1: 22 } as const;

/** Uma cena em uso e as prévias da entrada: poucas telas guardadas por vez. */
const MAX_CACHES = 3;
const caches = new Map<string, SceneCache | null>();

/** Desenha em uma tela à parte a região do mundo de (`x0`, `y0`) a (`x1`, `y1`), na escala do aparelho. */
function sprite(x0: number, y0: number, x1: number, y1: number, escala: number, desenhar: (d: DrawContext) => void): Sprite | null {
  const dx = Math.floor(x0 * escala);
  const dy = Math.floor(y0 * escala);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.ceil(x1 * escala) - dx);
  canvas.height = Math.max(1, Math.ceil(y1 * escala) - dy);
  const ctx = canvas.getContext("2d");
  if (ctx === null) return null;
  ctx.setTransform(escala, 0, 0, escala, -dx, -dy);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  // Parado: o que balança com o tempo não entra aqui com movimento ligado.
  desenhar({ ctx, tempo: 0, movimento: false });
  return { canvas, dx, dy };
}

function buildCache(scene: SceneSpec, escala: number): SceneCache | null {
  const caixa = sceneBounds(scene);
  const fundo = sprite(caixa.minX, caixa.minY, caixa.maxX, caixa.maxY, escala, (d) => drawBack(d, scene));
  const frente = sprite(caixa.minX, caixa.minY, caixa.maxX, caixa.maxY, escala, (d) => drawFront(d, scene));
  if (fundo === null || frente === null) return null;
  const props: (Sprite | null)[] = [];
  for (const prop of scene.props) {
    if (prop.tipo === "decoracao") {
      props.push(null);
      continue;
    }
    const { sx, sy } = toScreen(prop.x + 0.5, prop.y + 0.5);
    const pronto = sprite(sx + PROP_BOX.x0, sy + PROP_BOX.y0, sx + PROP_BOX.x1, sy + PROP_BOX.y1, escala, (d) =>
      SCENE_ART.drawProp(d, scene.paleta, prop.tipo, sx, sy, prop.variante ?? 0, prop.espelhado ?? false, infoOf(scene, prop.x, prop.y)),
    );
    if (pronto === null) return null;
    props.push(pronto);
  }
  return { fundo, frente, props };
}

/** As telas prontas da cena nesta escala. `null` quando o navegador não as dá: aí tudo é desenhado direto. */
function cacheOf(scene: SceneSpec, escala: number): SceneCache | null {
  const chave = `${scene.id}|${escala.toFixed(4)}`;
  if (caches.has(chave)) {
    // A mais usada por último fica no fim da fila.
    const pronto = caches.get(chave)!;
    caches.delete(chave);
    caches.set(chave, pronto);
    return pronto;
  }
  let novo: SceneCache | null = null;
  try {
    novo = buildCache(scene, escala);
  } catch {
    novo = null;
  }
  caches.set(chave, novo);
  while (caches.size > MAX_CACHES) {
    const antiga = caches.keys().next().value!;
    release(caches.get(antiga) ?? null);
    caches.delete(antiga);
  }
  return novo;
}

/** Devolve a memória das telas na hora: redimensionar a janela troca de escala muitas vezes seguidas. */
function release(cache: SceneCache | null): void {
  if (cache === null) return;
  for (const pronto of [cache.fundo, cache.frente, ...cache.props]) {
    if (pronto === null) continue;
    pronto.canvas.width = 0;
    pronto.canvas.height = 0;
  }
}

// ---------------------------------------------------------------------------
// Um quadro
// ---------------------------------------------------------------------------

/** Desenha a cena no contexto, com a câmera aplicada pela matriz. */
export function renderScene(ctx: CanvasRenderingContext2D, state: RenderState, viewport: Viewport, dpr: number): void {
  const { scene, camera } = state;
  const d: DrawContext = { ctx, tempo: state.tempo, movimento: state.movimento };

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.fillStyle = scene.paleta.fundo;
  ctx.fillRect(0, 0, viewport.largura * dpr, viewport.altura * dpr);

  // A origem do mundo cai em pixels inteiros do aparelho: as telas prontas são
  // copiadas sem borrar, e o que é desenhado na hora encaixa nelas.
  const escala = camera.zoom * dpr;
  const tx = Math.round(dpr * (viewport.largura / 2 - camera.cx * camera.zoom));
  const ty = Math.round(dpr * (viewport.altura / 2 - camera.cy * camera.zoom));
  const mundo = () => ctx.setTransform(escala, 0, 0, escala, tx, ty);
  const copiar = (pronto: Sprite) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(pronto.canvas, tx + pronto.dx, ty + pronto.dy);
    mundo();
  };
  const cache = cacheOf(scene, escala);

  mundo();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  if (cache !== null) copiar(cache.fundo);
  else drawBack(d, scene);

  // As setas da soleira, quando a saída abre.
  if (state.abertura > 0.01) {
    const { x, y, lado } = scene.saida;
    const { sx, sy } = toScreen(x + 0.5, y + 0.5);
    SCENE_ART.drawThreshold(d, scene.paleta, sx, sy, lado, state.abertura, infoOf(scene, x, y));
  }

  // Anel no chão, sob a pasta do marco: é para onde a fase aponta.
  for (const pasta of state.pastas) {
    if (!pasta.destaque) continue;
    const { sx, sy } = toScreen(pasta.x + 0.5, pasta.y + 0.5);
    SCENE_ART.drawReachRing(d, scene.paleta, sx, sy);
  }

  const drawables: Drawable[] = [];

  // Elementos de cenário: a tela pronta, ou o desenho na hora para o que balança.
  scene.props.forEach((prop, indice) => {
    if (prop.tipo === "decoracao") return;
    const pronto = cache?.props[indice] ?? null;
    const { sx, sy } = toScreen(prop.x + 0.5, prop.y + 0.5);
    drawables.push({
      z: prop.x + prop.y,
      draw:
        pronto !== null && !(state.movimento && ANIMADOS.has(prop.tipo))
          ? () => copiar(pronto)
          : () => SCENE_ART.drawProp(d, scene.paleta, prop.tipo, sx, sy, prop.variante ?? 0, prop.espelhado ?? false, infoOf(scene, prop.x, prop.y)),
    });
  });

  // As pastas da fase, nas posições da cena. Ficam no cenário: abrir uma não a tira dali.
  for (const pasta of state.pastas) {
    const { sx, sy } = toScreen(pasta.x + 0.5, pasta.y + 0.5);
    drawables.push({ z: pasta.x + pasta.y, draw: () => RECORD_ART.draw(d, sx, sy, pasta.destaque) });
  }

  // Guia.
  {
    const { sx, sy } = toScreen(scene.guia.x + 0.5, scene.guia.y + 0.5);
    drawables.push({ z: scene.guia.x + scene.guia.y, draw: () => GUIDE.draw(d, { facing: "frente-direita", andando: false, fase: 0 }, sx, sy) });
  }

  // Personagem. Um objeto em uma célula tem o centro em x + y + 1: o
  // personagem fica na frente dele quando a soma das próprias coordenadas é maior.
  if (!state.semJogador) {
    const { sx, sy } = toScreen(state.player.x, state.player.y);
    // A figura da época da fase (D-111): o mesmo personagem, com cabelo, barba e roupa do período.
    const arte = characterArt(state.personagem, state.epoca);
    drawables.push({
      z: state.player.x + state.player.y - 1,
      draw: () => arte.draw(d, { facing: state.player.facing, andando: state.player.andando, fase: state.player.fase }, sx, sy),
    });
  }

  drawables.sort((a, b) => a.z - b.z);
  for (const item of drawables) item.draw();

  // A borda da frente, por cima do que está dentro da sala: os parapeitos e o portal da saída.
  if (cache !== null) copiar(cache.frente);
  else drawFront(d, scene);
  {
    const { x, y, lado } = scene.saida;
    const { sx, sy } = toScreen(x + 0.5, y + 0.5);
    SCENE_ART.drawExit(d, scene.paleta, sx, sy, lado, state.abertura, infoOf(scene, x, y));
  }
}
