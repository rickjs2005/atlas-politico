// Passagem de acessibilidade sobre a saída estática (docs/QA.md).
//
// Sobe o servidor de pré-visualização em uma porta própria, abre cada tela em
// um Chromium sem interface, nas quatro larguras de referência, e registra:
// rolagem lateral, contraste do texto como foi desenhado, tamanho dos alvos e
// ordem de foco pela tecla Tab. Grava uma captura de cada tela e um relatório.
//
// Uso:
//   npm run build
//   npm run audit:a11y
//
// Opções:
//   --pasta <caminho>    pasta servida (out)
//   --saida <caminho>    pasta das capturas e do relatório (test-results/a11y)
//
// Sai com código 1 quando encontra texto abaixo do contraste mínimo, rolagem
// lateral, resposta inesperada ou parada de foco que não dá para ver.
//
// O que a passagem não vê: uma camada posta por cima do texto, como uma
// hachura, não entra na conta do contraste. As capturas existem para isso, e
// precisam ser olhadas. Leitor de tela e aparelho real também ficam de fora.

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { chromium } from "@playwright/test";

const args = new Map();
for (let i = 2; i < process.argv.length; i += 2) args.set(process.argv[i], process.argv[i + 1]);

const OUT_DIR = path.resolve(args.get("--pasta") ?? "out");
const REPORT_DIR = path.resolve(args.get("--saida") ?? "test-results/a11y");
const PORT = 4318;
const BASE = `http://localhost:${PORT}`;

if (!existsSync(OUT_DIR)) {
  console.error(`Pasta ${path.relative(process.cwd(), OUT_DIR) || OUT_DIR} não encontrada. Rode \`npm run build\` antes.`);
  process.exit(1);
}

// O acontecimento das telas de leitura sai do conteúdo: o primeiro de Lula,
// de 2016 a 2019, com dia e lugar conhecidos.
const conjunto = JSON.parse(readFileSync("generated/dados/conjunto.json", "utf8"));
const lula = conjunto.pessoas.find((pessoa) => pessoa.slug === "lula");
const alvo = conjunto.acontecimentos.find((item) => {
  const ano = Number(item.data.valor.slice(0, 4));
  return (
    item.pessoaIds.includes(lula.id) &&
    ano >= 2016 &&
    ano <= 2019 &&
    item.data.precisao === "dia" &&
    item.localizacao.tipo === "lugares"
  );
});
if (!alvo) {
  console.error("O conteúdo não tem um acontecimento de Lula entre 2016 e 2019 com dia e lugar.");
  process.exit(1);
}

const SCREENS = [
  { nome: "01-entrada", url: "/" },
  { nome: "02-exploracao-lula", url: "/politicos/lula/", mapa: true },
  { nome: "03-exploracao-flavio-bolsonaro", url: "/politicos/flavio-bolsonaro/", mapa: true },
  { nome: "04-leitura-com-periodo", url: `/politicos/lula/?de=2016&ate=2019&acontecimento=${alvo.slug}`, mapa: true },
  { nome: "05-comparacao-com-periodo", url: "/comparar/?de=2003&ate=2022" },
  { nome: "06-acontecimento", url: `/acontecimentos/${alvo.slug}/` },
  { nome: "07-metodologia", url: "/metodologia/" },
  { nome: "08-pagina-nao-encontrada", url: "/endereco-que-nao-existe/", status: 404 },
];
const VIEWPORTS = [
  { sufixo: "computador", width: 1440, height: 900 },
  { sufixo: "tablet", width: 768, height: 1024 },
  { sufixo: "celular", width: 390, height: 844, toque: true },
  { sufixo: "celular-estreito", width: 360, height: 800, toque: true },
];

/** Roda na página: contraste do texto desenhado, rolagem lateral e alvos. */
function measurePage() {
  const tela = document.createElement("canvas");
  tela.width = 1;
  tela.height = 1;
  const pincel = tela.getContext("2d", { willReadFrequently: true });
  const lidas = new Map();
  // O navegador resolve qualquer notação de cor ao pintar um pixel.
  const cor = (texto) => {
    if (lidas.has(texto)) return lidas.get(texto);
    pincel.clearRect(0, 0, 1, 1);
    pincel.fillStyle = "rgba(0,0,0,0)";
    pincel.fillStyle = texto;
    pincel.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = pincel.getImageData(0, 0, 1, 1).data;
    const valor = { r, g, b, a: a / 255 };
    lidas.set(texto, valor);
    return valor;
  };
  const sobre = (cima, baixo) => ({
    r: cima.r * cima.a + baixo.r * (1 - cima.a),
    g: cima.g * cima.a + baixo.g * (1 - cima.a),
    b: cima.b * cima.a + baixo.b * (1 - cima.a),
    a: 1,
  });
  // Luminância relativa e contraste, como na WCAG 2.x.
  const luminancia = ({ r, g, b }) => {
    const canal = (v) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
  };
  const razao = (a, b) => {
    const [maior, menor] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
    return (maior + 0.05) / (menor + 0.05);
  };
  const hex = ({ r, g, b }) => "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
  const caminho = (no) => {
    const partes = [];
    for (let atual = no; atual && atual !== document.body && partes.length < 4; atual = atual.parentElement) {
      const marca = atual.id
        ? `#${atual.id}`
        : Array.from(atual.attributes).find((atributo) => atributo.name.startsWith("data-"))?.name;
      partes.unshift(atual.tagName.toLowerCase() + (marca ? (marca.startsWith("#") ? marca : `[${marca}]`) : ""));
    }
    return partes.join(" > ");
  };
  const visivel = (no) => {
    if (!no.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return false;
    const caixa = no.getBoundingClientRect();
    return caixa.width > 1 && caixa.height > 1;
  };

  const falhas = [];
  let conferidos = 0;
  let sobreImagem = 0;
  let menor = Infinity;
  const vistos = new Set();
  const caminhante = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let no = caminhante.nextNode(); no; no = caminhante.nextNode()) {
    if (!no.nodeValue || no.nodeValue.trim() === "") continue;
    const el = no.parentElement;
    if (!el || vistos.has(el)) continue;
    vistos.add(el);
    if (["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "OPTION"].includes(el.tagName)) continue;
    if (!visivel(el)) continue;
    const estilo = getComputedStyle(el);
    // Texto só para leitor de tela, e controle desativado.
    if (estilo.clipPath !== "none" || (estilo.clip !== "auto" && estilo.position === "absolute")) continue;
    if (el.closest(":disabled, [aria-disabled='true']")) continue;

    let opacidade = 1;
    let imagem = false;
    const camadas = [];
    for (let atual = el; atual; atual = atual.parentElement) {
      const e = getComputedStyle(atual);
      opacidade *= Number(e.opacity);
      if (e.backgroundImage !== "none") imagem = true;
      const fundo = cor(e.backgroundColor);
      if (fundo.a > 0) {
        camadas.push(fundo);
        if (fundo.a === 1) break;
      }
    }
    let fundo = { r: 255, g: 255, b: 255, a: 1 };
    for (const camada of camadas.reverse()) fundo = sobre(camada, fundo);
    const tinta = cor(estilo.color);
    const desenhada = sobre({ ...tinta, a: tinta.a * opacidade }, fundo);
    const tamanho = parseFloat(estilo.fontSize);
    const grande = tamanho >= 24 || (tamanho >= 18.66 && Number(estilo.fontWeight) >= 700);
    const minimo = grande ? 3 : 4.5;
    const valor = razao(desenhada, fundo);
    // Sobre um fundo com imagem, o valor é o da cor de base, e não o do desenho.
    if (imagem) sobreImagem += 1;
    conferidos += 1;
    menor = Math.min(menor, valor);
    if (valor < minimo) {
      falhas.push({
        texto: no.nodeValue.trim().replace(/\s+/g, " ").slice(0, 60),
        onde: caminho(el),
        tinta: hex(desenhada),
        fundo: hex(fundo),
        razao: Math.round(valor * 100) / 100,
        minimo,
      });
    }
  }

  const alvos = [];
  const seletor = "a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex='-1'])";
  for (const el of document.querySelectorAll(seletor)) {
    if (!visivel(el) || el.closest(":disabled")) continue;
    // Link no meio de uma frase tem a altura da linha, e fica fora da conta.
    if (getComputedStyle(el).display === "inline") continue;
    const caixa = el.getBoundingClientRect();
    alvos.push({
      nome: (el.getAttribute("aria-label") || el.innerText || el.getAttribute("title") || "").trim().replace(/\s+/g, " ").slice(0, 50),
      onde: caminho(el),
      w: Math.round(caixa.width),
      h: Math.round(caixa.height),
    });
  }

  return {
    rolagemLateral: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    contraste: { conferidos, menor: Math.round(menor * 100) / 100, sobreImagem, falhas },
    alvos: {
      total: alvos.length,
      abaixoDe24: alvos.filter((item) => item.w < 24 || item.h < 24),
      abaixoDe44: alvos.filter((item) => item.w < 44 || item.h < 44),
    },
  };
}

/** Roda na página: quem está com o foco, e se dá para ver. */
function describeFocus() {
  const el = document.activeElement;
  if (!el || el === document.body || el === document.documentElement) return null;
  const caixa = el.getBoundingClientRect();
  const estilo = getComputedStyle(el);
  return {
    elemento: el.tagName.toLowerCase(),
    nome: (el.getAttribute("aria-label") || el.innerText || el.getAttribute("title") || el.value || "").trim().replace(/\s+/g, " ").slice(0, 70),
    w: Math.round(caixa.width),
    h: Math.round(caixa.height),
    visivel: el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) && caixa.width > 0 && caixa.height > 0,
    naTela: caixa.bottom > 0 && caixa.top < innerHeight && caixa.right > 0 && caixa.left < innerWidth,
    indicador: (estilo.outlineStyle !== "none" && parseFloat(estilo.outlineWidth) > 0) || estilo.boxShadow !== "none",
  };
}

async function waitForServer() {
  for (let tentativa = 0; tentativa < 100; tentativa += 1) {
    try {
      if ((await fetch(`${BASE}/`)).ok) return;
    } catch {
      // ainda subindo
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("O servidor de pré-visualização não respondeu.");
}

async function settle(page, screen) {
  await page.waitForLoadState("networkidle");
  if (screen.mapa) {
    // Em tela estreita o mapa fica em outra vista, e não é montado.
    await page.waitForSelector(".maplibregl-canvas, [data-map-fallback]", { timeout: 15_000 }).catch(() => {});
    await page.waitForTimeout(600);
  }
}

mkdirSync(REPORT_DIR, { recursive: true });
const server = spawn(process.execPath, ["scripts/preview.mjs"], {
  env: { ...process.env, PORT: String(PORT), OUT_DIR, QUIET: "1" },
  stdio: "ignore",
});
process.on("exit", () => server.kill());
await waitForServer();

// O Chromium sem interface não tem GPU: o WebGL roda por software, como nos testes.
const browser = await chromium.launch({ args: ["--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const report = {
  data: new Date().toISOString().slice(0, 10),
  navegador: `Chromium ${browser.version()}, sem interface, movimento reduzido`,
  pasta: path.relative(process.cwd(), OUT_DIR) || ".",
  acontecimento: alvo.slug,
  telas: [],
  teclado: [],
};

for (const viewport of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    reducedMotion: "reduce",
    hasTouch: Boolean(viewport.toque),
    isMobile: Boolean(viewport.toque),
  });
  const page = await context.newPage();
  const erros = [];
  page.on("pageerror", (erro) => erros.push(erro.message));
  page.on("console", (mensagem) => {
    if (mensagem.type() === "error") erros.push(mensagem.text());
  });
  for (const screen of SCREENS) {
    erros.length = 0;
    const resposta = await page.goto(BASE + screen.url);
    await settle(page, screen);
    const medidas = await page.evaluate(measurePage);
    await page.screenshot({ path: path.join(REPORT_DIR, `${screen.nome}--${viewport.sufixo}.png`) });
    report.telas.push({
      tela: screen.nome,
      url: screen.url,
      largura: `${viewport.width}×${viewport.height}`,
      status: resposta.status(),
      statusEsperado: screen.status ?? 200,
      // O pedido de uma página que não existe aparece no console como erro: é o esperado.
      erros: erros.filter((erro) => !(screen.status === 404 && erro.includes("404"))),
      ...medidas,
      alvos: viewport.toque
        ? medidas.alvos
        : { total: medidas.alvos.total, abaixoDe24: medidas.alvos.abaixoDe24 },
    });
  }
  await context.close();
}

// Ordem de foco pelo teclado, em computador.
for (const screen of SCREENS) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(BASE + screen.url);
  await settle(page, screen);
  const paradas = [];
  for (let passo = 0; passo < 300; passo += 1) {
    await page.keyboard.press("Tab");
    const atual = await page.evaluate(describeFocus);
    if (atual === null) break;
    paradas.push(atual);
  }
  report.teclado.push({ tela: screen.nome, url: screen.url, paradas });
  await context.close();
}

await browser.close();
server.kill();
writeFileSync(path.join(REPORT_DIR, "acessibilidade.json"), `${JSON.stringify(report, null, 2)}\n`);

let problemas = 0;
for (const item of report.telas) {
  const ruim =
    item.status !== item.statusEsperado ||
    item.rolagemLateral > 0 ||
    item.contraste.falhas.length > 0 ||
    item.erros.length > 0;
  if (ruim) problemas += 1;
  console.log(
    `${ruim ? "FALHA" : "ok   "} ${item.tela.padEnd(31)} ${item.largura.padEnd(9)} contraste: ${item.contraste.conferidos} textos, menor ${item.contraste.menor}, abaixo do mínimo ${item.contraste.falhas.length} | rolagem lateral ${item.rolagemLateral} | alvos abaixo de 24 px: ${item.alvos.abaixoDe24.length} | erros ${item.erros.length}`,
  );
}
for (const item of report.teclado) {
  const ruins = item.paradas.filter((parada) => !parada.visivel || !parada.naTela || !parada.indicador);
  if (ruins.length > 0 || item.paradas.length === 0) problemas += 1;
  console.log(
    `${ruins.length > 0 ? "FALHA" : "ok   "} ${item.tela.padEnd(31)} teclado: ${item.paradas.length} paradas, ${ruins.length} sem foco visível`,
  );
}
console.log(`Capturas e relatório em ${path.relative(process.cwd(), REPORT_DIR)}.`);
if (problemas > 0) {
  console.error(`${problemas} tela(s) com problema. Veja acessibilidade.json.`);
  process.exit(1);
}
