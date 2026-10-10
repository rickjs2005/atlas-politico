// Captura peças da galeria da arte do jogo (`/dev/jogo-arte/`, só em
// desenvolvimento) como PNG, para olhar o desenho sem abrir o navegador.
//
// Uso, com `npm run dev` rodando:
//   node scripts/capture-art.mjs --saida <pasta> [--cenas a,b] [--personagens lula,flavio-bolsonaro] [--base http://localhost:3000]
//
// Para cada cena pedida grava `<pasta>/<cena>-folha.png` (piso, paredes,
// saída, registro e todos os elementos de cenário) e `<pasta>/<cena>-cena.png`
// (a cena inteira, com o personagem). Para cada personagem, uma imagem por
// época (`<pasta>/<personagem>-<epoca>.png`), com as quatro direções, a
// caminhada e a figura ampliada. Sem `--cenas` nem `--personagens`, captura
// tudo.

import { mkdirSync } from "node:fs";
import path from "node:path";

import { chromium } from "@playwright/test";

const args = new Map();
for (let i = 2; i < process.argv.length; i += 2) args.set(process.argv[i], process.argv[i + 1]);
const SAIDA = args.get("--saida");
if (!SAIDA) {
  console.error("Informe a pasta: node scripts/capture-art.mjs --saida <pasta>");
  process.exit(1);
}
const BASE = args.get("--base") ?? "http://localhost:3000";
// `--cenas nenhum` pula as cenas.
const cenas = args.has("--cenas") ? String(args.get("--cenas")).split(",").filter((id) => id !== "nenhum") : null;
// `--personagens nenhum` pula as figuras.
const personagens = args.has("--personagens") ? String(args.get("--personagens")).split(",").filter((id) => id !== "nenhum") : null;
const EPOCAS = ["inicio", "meio", "atual"];

mkdirSync(SAIDA, { recursive: true });
const browser = await chromium.launch({ args: ["--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
try {
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
  // Sem `networkidle`: o servidor de desenvolvimento mantém uma conexão aberta, e a rede nunca fica parada.
  // Com `?parado`, cada peça é desenhada uma vez: a página não fica animando dezenas de canvases.
  await page.goto(`${BASE}/dev/jogo-arte/?parado`, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.locator("[data-galeria]").first().waitFor({ timeout: 120_000 });
  // As peças são desenhadas no primeiro quadro; um instante para as fontes e os canvases assentarem.
  await page.waitForTimeout(2500);

  /** Captura um elemento pelo recorte da página, sem esperar estabilidade de animação. */
  async function capturar(alvo, arquivo) {
    await alvo.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const caixa = await alvo.boundingBox();
    if (caixa === null) throw new Error(`Sem caixa para ${arquivo}`);
    await page.screenshot({ path: arquivo, clip: caixa, timeout: 120_000 });
    console.log(arquivo);
  }

  const todas = await page.locator("[data-galeria]").evaluateAll((nos) => nos.map((no) => no.getAttribute("data-galeria")));
  const idsDasCenas = todas.filter((id) => id.startsWith("cena-")).map((id) => id.slice(5));
  for (const cena of cenas ?? idsDasCenas) {
    for (const parte of ["folha", "cena"]) {
      const alvo = page.locator(`[data-galeria="${parte}-${cena}"]`);
      if ((await alvo.count()) === 0) {
        console.error(`Sem ${parte} para a cena ${cena}.`);
        continue;
      }
      await capturar(alvo, path.join(SAIDA, `${cena}-${parte}.png`));
    }
  }

  const idsDosPersonagens = ["lula", "flavio-bolsonaro"];
  for (const personagem of personagens ?? idsDosPersonagens) {
    for (const epoca of EPOCAS) {
      // A fileira inteira do personagem na época: a seção mais interna que contém a figura ampliada.
      const secao = page.locator("section", { has: page.locator(`[data-galeria="${personagem}-${epoca}-grande"]`) }).last();
      if ((await secao.count()) === 0) {
        console.error(`Sem figura para ${personagem} na época ${epoca}.`);
        continue;
      }
      await capturar(secao, path.join(SAIDA, `${personagem}-${epoca}.png`));
    }
  }
  if (personagens === null || personagens.includes("guia")) {
    const secao = page.locator("section", { has: page.locator('[data-galeria="guia-grande"]') }).last();
    if ((await secao.count()) > 0) await capturar(secao, path.join(SAIDA, "guia.png"));
  }
} finally {
  await browser.close();
}
