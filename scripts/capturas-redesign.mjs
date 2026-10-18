// Capturas do redesign (D-155) sobre a saída estática: as telas principais em
// quatro larguras, acima da dobra e a página inteira, e a praça jogada (a cena
// no começo, o mural com o tutorial, a nota montada e o caderno). Serve para
// olhar o resultado e para registrar o que foi conferido em
// docs/capturas/redesign/. Além das imagens, o roteiro anota erro de página,
// erro de console e rolagem lateral em cada tela.
// Uso: npm run build && npm run preview   (em outro terminal, porta 4311)
//      node scripts/capturas-redesign.mjs [--saida pasta] [--largura 390,1440] [--sem-praca]
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const argumentos = process.argv.slice(2);
const opcao = (nome, padrao) => {
  const indice = argumentos.indexOf(`--${nome}`);
  return indice === -1 ? padrao : argumentos[indice + 1];
};
const BASE = process.env.URL ?? "http://localhost:4311";
const SAIDA = opcao("saida", "docs/capturas/redesign");
const LARGURAS = opcao("largura", "360,390,768,1440").split(",").map(Number);
const COM_PRACA = !argumentos.includes("--sem-praca");
const TELAS = [
  { nome: "01-entrada", url: "/", inteira: true },
  { nome: "02-explorar", url: "/explorar/" },
  { nome: "03-jogar-hub", url: "/jogo/", inteira: true },
  { nome: "04-jogar-trajetorias", url: "/jogo/trajetorias/" },
  { nome: "05-comparar", url: "/comparar/", inteira: true },
  { nome: "06-comparar-decisoes", url: "/comparar/#decisoes" },
  { nome: "07-comparar-propostas", url: "/comparar/#propostas" },
  { nome: "08-praca-entrada", url: "/praca/" },
  { nome: "09-trajetoria-lula", url: "/politicos/lula/" },
  { nome: "10-metodologia", url: "/metodologia/" },
  { nome: "11-nao-encontrada", url: "/endereco-que-nao-existe/" },
];

const browser = await chromium.launch({ args: ["--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
await mkdir(SAIDA, { recursive: true });
const problemas = [];
const feitas = [];

const vigiar = (page, largura) => {
  page.on("pageerror", (erro) => problemas.push(`[${largura}] pageerror: ${erro.message}`));
  page.on("console", (m) => {
    if (m.type() === "error" && !/favicon|404/.test(m.text())) problemas.push(`[${largura}] console: ${m.text()}`);
  });
};

const conferirLargura = async (page, largura, nome) => {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (overflow > 1) problemas.push(`[${largura}] ${nome}: rolagem horizontal de ${overflow}px`);
};

const capturar = async (page, largura, nome, opcoes = {}) => {
  await conferirLargura(page, largura, nome);
  const arquivo = path.join(SAIDA, `${nome}--${largura}.png`);
  await page.screenshot({ path: arquivo, ...opcoes });
  feitas.push(arquivo);
};

for (const largura of LARGURAS) {
  const altura = largura < 500 ? 844 : largura < 1000 ? 1024 : 900;
  const celular = largura < 500;
  const contexto = await browser.newContext({ viewport: { width: largura, height: altura }, isMobile: celular, hasTouch: celular, reducedMotion: "reduce" });
  const page = await contexto.newPage();
  vigiar(page, largura);
  for (const tela of TELAS) {
    await page.goto(`${BASE}${tela.url}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    await capturar(page, largura, tela.nome);
    if (tela.inteira) await capturar(page, largura, `${tela.nome}--inteira`, { fullPage: true });
  }

  if (COM_PRACA) {
    // A praça jogada, do começo: a cena pronta (WebGL por software), o mural
    // com a primeira pergunta, a nota montada e o caderno com os passos.
    await page.goto(`${BASE}/praca/`, { waitUntil: "networkidle" });
    await page.evaluate(() => window.localStorage.clear());
    await page.reload({ waitUntil: "networkidle" });
    await page.locator("[data-entrar]").click();
    await page.locator("[data-praca]").waitFor();
    const cena = await page.locator("[data-praca]").getAttribute("data-praca");
    if (cena === "cena") {
      await page.locator('[data-cena="pronta"]').waitFor({ timeout: 90_000 });
      await page.waitForTimeout(1500);
    } else {
      problemas.push(`[${largura}] praça abriu em lista, sem a cena`);
    }
    await capturar(page, largura, "12-praca-no-comeco");
    await page.locator("[data-abrir='caderno']").click();
    await page.locator("[data-janela='caderno'] [data-descobertas]").waitFor();
    await capturar(page, largura, "13-praca-caderno");
    await page.keyboard.press("Escape");

    // O mural e a nota, pela lista: não depende da caminhada.
    await page.goto(`${BASE}/praca/`, { waitUntil: "networkidle" });
    await page.locator("[data-entrar-em-lista]").check();
    await page.locator("[data-entrar]").click();
    await page.locator("[data-lista-da-praca]").waitFor();
    await capturar(page, largura, "14-praca-em-lista");
    await page.locator("[data-lugar='mural']").click();
    await page.locator("[data-abrir-pauta]").first().waitFor();
    await capturar(page, largura, "15-praca-mural-perguntas");
    await page.locator("[data-abrir-pauta]").first().click();
    await page.locator("[data-aceitar]").waitFor();
    await capturar(page, largura, "16-praca-pauta-tutorial");
    await page.locator("[data-aceitar]").click();
    await page.keyboard.press("Escape");
    await page.locator("[data-passo-de-agora]").waitFor();
    await capturar(page, largura, "17-praca-hud-com-passo");
    await page.locator("[data-abrir='caderno']").click();
    await page.locator("[data-janela='caderno'] [data-passos]").waitFor();
    await capturar(page, largura, "18-praca-caderno-com-passos");
  }
  await contexto.close();
}
await browser.close();
console.log(`${feitas.length} capturas em ${SAIDA}`);
console.log(problemas.length ? problemas.join("\n") : "Sem problemas detectados: nenhum erro de página, nenhum erro de console, nenhuma rolagem lateral.");
process.exitCode = problemas.length ? 1 : 0;
