// Auxiliares dos testes do jogo: ler a posição do personagem, andar até uma
// célula pelo teclado (com um caminho calculado sobre a grade da cena) e
// limpar o progresso salvo. Servem ao servidor de desenvolvimento e ao build.

import { expect, type Locator, type Page } from "@playwright/test";

import { isBlocked } from "@/lib/game/world/grid";
import type { SceneSpec } from "@/lib/game/types";

export interface Cell {
  x: number;
  y: number;
}

export const palco = (page: Page) => page.locator("[data-palco]");
export const jogo = (page: Page) => page.locator("[data-jogo]");

export async function position(page: Page): Promise<{ x: number; y: number }> {
  return palco(page).evaluate((no: HTMLElement) => ({ x: Number(no.dataset.jogoX), y: Number(no.dataset.jogoY) }));
}

export async function waitForStage(page: Page) {
  await expect(palco(page)).toHaveAttribute("data-palco", "pronto", { timeout: 30_000 });
  // A posição só existe depois do primeiro desenho, um quadro depois de o palco montar.
  await expect(palco(page)).toHaveAttribute("data-jogo-x", /\d/);
  await palco(page).focus();
}

/** Espera o navegador desenhar: dois quadros, para o que mudou já estar no canvas. */
export async function nextFrame(page: Page) {
  await page.evaluate(() => new Promise((pronto) => requestAnimationFrame(() => requestAnimationFrame(() => pronto(null)))));
}

/**
 * O que está desenhado no canvas da cena: quantas cores diferentes há, e uma
 * assinatura do quadro inteiro. Os atributos do documento dizem o que a regra
 * decidiu; isto diz o que a pessoa vê.
 */
export async function frame(page: Page): Promise<{ cores: number; assinatura: string }> {
  await nextFrame(page);
  return palco(page)
    .locator("canvas")
    .evaluate((no: HTMLCanvasElement) => {
      const { data } = no.getContext("2d")!.getImageData(0, 0, no.width, no.height);
      const cores = new Set<number>();
      let soma = 0;
      for (let i = 0; i < data.length; i += 4) {
        const cor = (data[i]! << 16) | (data[i + 1]! << 8) | data[i + 2]!;
        if (i % 52 === 0) cores.add(cor);
        soma = (Math.imul(soma, 31) + cor) >>> 0;
      }
      return { cores: cores.size, assinatura: `${no.width}x${no.height}:${soma}` };
    });
}

/** Caminho em células, da origem ao destino, pela grade (sem diagonais). */
export function findPath(scene: SceneSpec, origem: Cell, destino: Cell, saidaAberta: boolean): Cell[] | null {
  const chave = (c: Cell) => `${c.x},${c.y}`;
  const anterior = new Map<string, Cell | null>([[chave(origem), null]]);
  const fila: Cell[] = [origem];
  while (fila.length > 0) {
    const atual = fila.shift()!;
    if (atual.x === destino.x && atual.y === destino.y) {
      const caminho: Cell[] = [];
      for (let c: Cell | null = atual; c !== null; c = anterior.get(chave(c)) ?? null) caminho.unshift(c);
      return caminho;
    }
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const) {
      const proximo = { x: atual.x + dx, y: atual.y + dy };
      if (anterior.has(chave(proximo)) || isBlocked(scene, proximo.x, proximo.y, saidaAberta)) continue;
      anterior.set(chave(proximo), atual);
      fila.push(proximo);
    }
  }
  return null;
}

/** As teclas que movem o personagem em cada eixo do mundo (iso.ts). */
const KEYS: Record<string, string[]> = {
  "1,0": ["ArrowRight", "ArrowDown"],
  "-1,0": ["ArrowLeft", "ArrowUp"],
  "0,1": ["ArrowDown", "ArrowLeft"],
  "0,-1": ["ArrowUp", "ArrowRight"],
};

/**
 * Segura as teclas até o personagem passar do ponto no eixo dado, ou até o
 * jogo sair do modo de jogo (um diálogo abriu, a saída foi atravessada). A
 * espera roda dentro da página, a cada quadro: conferir de fora, de tempos em
 * tempos, deixava o personagem passar do alvo entre uma leitura e outra.
 */
async function holdUntil(page: Page, teclas: string[], eixo: "x" | "y", sentido: number, alvo: number, limiteMs: number): Promise<boolean> {
  for (const tecla of teclas) await page.keyboard.down(tecla);
  try {
    await page.waitForFunction(
      ({ eixo, sentido, alvo }) => {
        const cena = document.querySelector<HTMLElement>("[data-palco]");
        const casca = document.querySelector<HTMLElement>("[data-jogo]");
        if (cena === null || casca === null) return false;
        if (casca.dataset.modo !== "jogando") return true;
        const valor = Number(eixo === "x" ? cena.dataset.jogoX : cena.dataset.jogoY);
        return sentido > 0 ? valor >= alvo : valor <= alvo;
      },
      { eixo, sentido, alvo },
      { polling: "raf", timeout: limiteMs },
    );
    return true;
  } catch {
    return false;
  } finally {
    for (const tecla of teclas) await page.keyboard.up(tecla);
  }
}

/** Soltar a tecla leva um instante: o alvo fica um pouco antes do centro da célula. */
const EARLY = 0.08;
/** Desvio do meio da célula, no eixo que não é o do passo, a partir do qual o teste corrige. */
const DRIFT = 0.12;

/**
 * Leva o personagem de volta ao meio da célula em um eixo. As duas teclas de
 * um passo não descem nem sobem no mesmo instante, e a cada passo o
 * personagem deriva um pouco no outro eixo; sem corrigir, ele acaba roçando
 * a quina de um móvel no corredor.
 */
async function center(page: Page, eixo: "x" | "y", celula: number) {
  const atual = await position(page);
  const desvio = (eixo === "x" ? atual.x : atual.y) - (celula + 0.5);
  if (Math.abs(desvio) <= DRIFT) return;
  const sentido = desvio > 0 ? -1 : 1;
  await holdUntil(page, KEYS[eixo === "x" ? `${sentido},0` : `0,${sentido}`]!, eixo, sentido, celula + 0.5 - sentido * 0.04, 1500);
}

/**
 * Anda pelo teclado até a célula de destino, por um caminho calculado sobre a
 * grade. Para antes se o jogo sair do modo de jogo. Falha se não houver
 * caminho ou se o personagem ficar preso.
 */
export async function walkTo(page: Page, scene: SceneSpec, destino: Cell, saidaAberta = false) {
  await palco(page).focus();
  const atual = await position(page);
  const origem = { x: Math.floor(atual.x), y: Math.floor(atual.y) };
  const caminho = findPath(scene, origem, destino, saidaAberta);
  expect(caminho, `caminho de ${origem.x},${origem.y} até ${destino.x},${destino.y}`).not.toBeNull();
  for (let i = 1; i < caminho!.length; i += 1) {
    const de = caminho![i - 1]!;
    const para = caminho![i]!;
    const eixo = para.x !== de.x ? "x" : "y";
    const sentido = eixo === "x" ? para.x - de.x : para.y - de.y;
    const centro = (eixo === "x" ? para.x : para.y) + 0.5;
    await center(page, eixo === "x" ? "y" : "x", eixo === "x" ? de.y : de.x);
    const chegou = await holdUntil(page, KEYS[`${para.x - de.x},${para.y - de.y}`]!, eixo, sentido, centro - sentido * EARLY, 4000);
    if (!chegou) {
      const onde = await position(page);
      const modo = await jogo(page).getAttribute("data-modo");
      expect.soft(null, `preso a caminho de ${para.x},${para.y}: personagem em ${onde.x},${onde.y}, modo ${modo}`).not.toBeNull();
    }
    expect(chegou, `chegar à célula ${para.x},${para.y}`).toBe(true);
    if ((await jogo(page).getAttribute("data-modo")) !== "jogando") return;
  }
}

/** Segura as teclas por um tempo, sem destino: para testar paredes e pausas. */
export async function holdKeys(page: Page, teclas: string[], ms: number) {
  for (const tecla of teclas) await page.keyboard.down(tecla);
  await page.waitForTimeout(ms);
  for (const tecla of teclas) await page.keyboard.up(tecla);
}

/**
 * Clica depois que a janela aberta, se houver, passou a aceitar ponteiro. As
 * janelas do jogo ignoram toque e clique por um instante ao abrir (Dialog.tsx).
 * O clique do Playwright dado nesse instante é repetido com a página rolada de
 * outros jeitos, e a página termina fora do lugar, como ninguém a vê: com o
 * mouse de verdade ela não rola. Os passos de preparação dos testes e o
 * roteiro de capturas clicam por aqui.
 */
export async function clicar(page: Page, alvo: Locator) {
  await expect(alvo).toBeVisible();
  await expect(page.locator('[data-aceita-ponteiro="nao"]')).toHaveCount(0);
  await alvo.click();
}

export async function clearProgress(page: Page) {
  await page.evaluate(() => {
    try {
      window.localStorage.clear();
    } catch {
      // sem armazenamento, nada a limpar
    }
  });
}
