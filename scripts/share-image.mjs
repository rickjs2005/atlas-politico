// Gera a imagem da prévia de compartilhamento (public/share/atlas.png, 1200
// por 630), com a identidade do atlas: papel, grafite, o nome, a frase da
// edição e a divisão em linha do tempo, mapa, fontes e jogo. Sem retrato,
// sem rosto, sem cor de partido. Só entra nos metadados quando há domínio
// decidido (src/lib/site.ts, docs/DEPLOY.md).
//
//   node scripts/share-image.mjs
//
// Usa as fontes locais do projeto e um Chromium sem interface. Determinística:
// o mesmo texto gera a mesma imagem.

import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { chromium } from "@playwright/test";

const SAIDA = path.resolve("public/share/atlas.png");
const fonte = (arquivo) => `data:font/woff2;base64,${readFileSync(path.resolve("src/app/fonts", arquivo)).toString("base64")}`;

const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<style>
  @font-face { font-family: "Newsreader"; src: url("${fonte("newsreader-latin.woff2")}") format("woff2"); font-weight: 200 800; }
  @font-face { font-family: "Libre Franklin"; src: url("${fonte("libre-franklin-latin.woff2")}") format("woff2"); font-weight: 100 900; }
  html, body { margin: 0; }
  body { width: 1200px; height: 630px; background: #f6f2ea; color: #1b1c1a; font-family: "Libre Franklin", sans-serif; position: relative; overflow: hidden; }
  .moldura { position: absolute; inset: 28px; border: 1.5px solid #1b1c1a; }
  .conteudo { position: absolute; left: 84px; top: 92px; right: 84px; }
  .eyebrow { font-size: 22px; letter-spacing: 0.14em; text-transform: uppercase; color: #5e5a54; font-weight: 500; }
  h1 { font-family: "Newsreader", serif; font-weight: 500; font-size: 128px; line-height: 0.95; letter-spacing: -0.02em; margin: 18px 0 26px; }
  p { font-family: "Newsreader", serif; font-size: 36px; line-height: 1.25; margin: 0; max-width: 980px; }
  .linha { position: absolute; left: 84px; right: 84px; bottom: 84px; display: flex; justify-content: space-between; align-items: center; gap: 48px; }
  .marcas { display: flex; gap: 14px; align-items: center; flex: none; }
  .marca { width: 18px; height: 18px; border: 1.5px solid #1b1c1a; background: #f6f2ea; }
  .marca.acento { background: #b24a00; border-color: #b24a00; }
  .traco { width: 220px; height: 1.5px; background: #1b1c1a; }
  .nota { font-size: 22px; color: #5e5a54; max-width: 420px; text-align: right; line-height: 1.3; }
</style></head>
<body>
  <div class="moldura"></div>
  <div class="conteudo">
    <div class="eyebrow">Linha do tempo · Mapa · Fontes · Jogo</div>
    <h1>Atlas Político</h1>
    <p>Trajetórias públicas, acontecimento por acontecimento, com a data, o lugar e o documento que sustenta cada registro.</p>
  </div>
  <div class="linha">
    <div class="marcas"><span class="marca"></span><span class="traco"></span><span class="marca acento"></span><span class="traco"></span><span class="marca"></span></div>
    <div class="nota">Conteúdo conferido com as fontes, com assistência de IA</div>
  </div>
</body></html>`;

mkdirSync(path.dirname(SAIDA), { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: SAIDA, clip: { x: 0, y: 0, width: 1200, height: 630 } });
  console.log(`Gravado em ${path.relative(process.cwd(), SAIDA)}`);
} finally {
  await browser.close();
}
