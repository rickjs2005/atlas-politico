// Medições de laboratório das páginas do jogo, sobre a saída estática
// (docs/PERFORMANCE.md e docs/GAMEPLAY.md, seção Verificação).
//
// Sobe o servidor de pré-visualização, abre a entrada do jogo, a primeira fase
// de cada personagem, uma fase pedida pelo endereço, um aprofundamento de cada
// um e a leitura sem o cenário,
// em um Chromium sem interface, com o cache vazio, e registra: carregamento
// (TTFB, primeira pintura, LCP, load), quando o palco fica pronto, o que a rede
// transferiu e a cadência de quadros da cena, em quadros por segundo e quadros
// longos: parada, durante a caminhada do boneco até a pasta do marco (ninguém
// o dirige: a caminhada começa no toque na pasta) e com a janela da fase
// aberta, quando o laço da cena para.
//
// Uso:
//   npm run build
//   npm run measure:game -- --rotulo <nome>
//
// Opções:
//   --rotulo <nome>      nome da medição; vira o nome do arquivo (obrigatório)
//   --pasta <caminho>    pasta servida (out)
//   --execucoes <n>      execuções por rota e perfil (3); o resultado é a mediana
//   --perfis <a,b>       perfis a medir (computador,celular)
//   --saida <arquivo>    arquivo JSON de saída (docs/desempenho/jogo-<rotulo>.json)
//
// Os números são de laboratório, nesta máquina, com a CPU e a rede limitadas
// pelo protocolo do navegador: servem para comparar versões, e não para prever
// um aparelho real. A emulação de celular não é um celular.

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { chromium } from "@playwright/test";

const args = new Map();
for (let i = 2; i < process.argv.length; i += 2) args.set(process.argv[i], process.argv[i + 1]);

const LABEL = args.get("--rotulo");
if (!LABEL) {
  console.error("Informe o nome da medição: npm run measure:game -- --rotulo <nome>");
  process.exit(1);
}
const RUNS = Number(args.get("--execucoes") ?? 3);
const PASTA = path.resolve(args.get("--pasta") ?? "out");
const SAIDA = path.resolve(args.get("--saida") ?? `docs/desempenho/jogo-${LABEL}.json`);
const PORTA = 4316;
const BASE = `http://localhost:${PORTA}`;
if (!existsSync(path.join(PASTA, "index.html"))) {
  console.error(`Pasta ${PASTA} sem index.html. Rode \`npm run build\` antes.`);
  process.exit(1);
}

// Os mesmos perfis de scripts/measure.mjs.
const PROFILES = {
  computador: {
    descricao: "1440×900, rede a 10 Mbit/s com 40 ms de latência, CPU sem limite",
    context: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
    network: { latency: 40, downloadThroughput: (10 * 1024 * 1024) / 8, uploadThroughput: (10 * 1024 * 1024) / 8 },
    cpu: 1,
  },
  celular: {
    descricao: "390×844, toque, rede a 1,6 Mbit/s com 150 ms de latência, CPU 4 vezes mais lenta",
    context: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
    network: { latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 },
    cpu: 4,
  },
};
// A entrada, a primeira fase da trajetória dos dois personagens, um
// aprofundamento de cada um (as cenas deles são outras artes) e a leitura sem
// o cenário, que não baixa o palco.
const ROUTES = [
  { id: "entrada-do-jogo", path: "/jogo/", cena: false },
  { id: "jogo-lula", path: "/jogo/lula/?fase=1", cena: true },
  { id: "jogo-flavio-bolsonaro", path: "/jogo/flavio-bolsonaro/?fase=1", cena: true },
  // Uma fase pedida pelo endereço, que não é a do HTML do build: é como chega quem continua de onde parou.
  { id: "jogo-lula-fase-5", path: "/jogo/lula/?fase=5", cena: true },
  { id: "jogo-lula-economia", path: "/jogo/lula/economia/", cena: true },
  { id: "jogo-flavio-bolsonaro-seguranca-publica", path: "/jogo/flavio-bolsonaro/seguranca-publica/", cena: true },
  { id: "jogo-lula-leitura-sem-cenario", path: "/jogo/lula/?fase=1&leitura=1", cena: false },
];
const profileNames = (args.get("--perfis") ?? Object.keys(PROFILES).join(",")).split(",");

// --- o que roda dentro da página, antes de qualquer script dela ---------------

function instrument() {
  const m = (window.__jogo = { lcp: [], paints: {}, longtasks: [], palco: {} });
  const observe = (type, each) => {
    try {
      new PerformanceObserver((list) => list.getEntries().forEach(each)).observe({ type, buffered: true });
    } catch {
      // tipo de entrada que este navegador não registra
    }
  };
  observe("largest-contentful-paint", (e) => m.lcp.push(e.startTime));
  observe("paint", (e) => {
    m.paints[e.name] = e.startTime;
  });
  observe("longtask", (e) => m.longtasks.push({ t: e.startTime, d: e.duration }));
  const timer = setInterval(() => {
    if (!document.body) return;
    const now = performance.now();
    const palco = document.querySelector("[data-palco]");
    if (m.palco.canvas === undefined && document.querySelector("[data-palco] canvas")) m.palco.canvas = now;
    if (m.palco.pronto === undefined && palco && palco.getAttribute("data-palco") === "pronto") {
      m.palco.pronto = now;
      clearInterval(timer);
    }
  }, 50);
}

/** Amostra a cadência de quadros por `ms` milissegundos e devolve o resumo. */
function sampleFrames(ms) {
  return new Promise((resolve) => {
    const tempos = [];
    let ultimo = performance.now();
    const fim = ultimo + ms;
    const tick = (agora) => {
      tempos.push(agora - ultimo);
      ultimo = agora;
      if (agora < fim) requestAnimationFrame(tick);
      else {
        const ordenados = [...tempos].sort((a, b) => a - b);
        const total = tempos.reduce((soma, t) => soma + t, 0);
        resolve({
          quadros: tempos.length,
          fps: Math.round((tempos.length / total) * 1000 * 10) / 10,
          intervaloMediano: Math.round(ordenados[Math.floor(ordenados.length / 2)] * 10) / 10,
          intervaloP95: Math.round(ordenados[Math.floor(ordenados.length * 0.95)] * 10) / 10,
          intervaloMaximo: Math.round(ordenados[ordenados.length - 1] * 10) / 10,
          quadrosLongos: tempos.filter((t) => t > 50).length,
        });
      }
    };
    requestAnimationFrame(tick);
  });
}

/**
 * Amostra a cadência só enquanto o boneco anda: espera o palco dizer que a
 * caminhada começou (`data-andando="sim"`), conta os quadros até ela acabar e
 * devolve o resumo, com a duração. Devolve `null` se a caminhada não começar
 * dentro do limite ou tiver menos de três quadros. É instalada antes do toque
 * na pasta, para o começo da caminhada entrar na conta.
 */
function sampleWalk(limite) {
  return new Promise((resolve) => {
    const palco = document.querySelector("[data-palco]");
    const tempos = [];
    const inicio = performance.now();
    let ultimo = inicio;
    let andou = false;
    const terminar = () => {
      if (tempos.length < 3) {
        resolve(null);
        return;
      }
      const ordenados = [...tempos].sort((a, b) => a - b);
      const total = tempos.reduce((soma, t) => soma + t, 0);
      resolve({
        quadros: tempos.length,
        duracao: Math.round(total),
        fps: Math.round((tempos.length / total) * 1000 * 10) / 10,
        intervaloMediano: Math.round(ordenados[Math.floor(ordenados.length / 2)] * 10) / 10,
        intervaloP95: Math.round(ordenados[Math.floor(ordenados.length * 0.95)] * 10) / 10,
        intervaloMaximo: Math.round(ordenados[ordenados.length - 1] * 10) / 10,
        quadrosLongos: tempos.filter((t) => t > 50).length,
      });
    };
    const tick = (agora) => {
      const andando = palco !== null && palco.getAttribute("data-andando") === "sim";
      if (andando) {
        // O primeiro quadro da caminhada só marca o começo: o intervalo dele ainda é o da cena parada.
        if (andou) tempos.push(agora - ultimo);
        andou = true;
      } else if (andou) {
        terminar();
        return;
      }
      ultimo = agora;
      if (agora - inicio > limite) terminar();
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

// --- auxiliares ----------------------------------------------------------------

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const round = (valor, casas = 0) => (valor === null || valor === undefined ? null : Number(valor.toFixed(casas)));
function median(valores) {
  const validos = valores.filter((valor) => typeof valor === "number" && Number.isFinite(valor)).sort((a, b) => a - b);
  if (validos.length === 0) return null;
  const meio = Math.floor(validos.length / 2);
  return validos.length % 2 ? validos[meio] : (validos[meio - 1] + validos[meio]) / 2;
}

async function startServer() {
  const servidor = spawn(process.execPath, ["scripts/preview.mjs"], {
    env: { ...process.env, PORT: String(PORTA), OUT_DIR: PASTA, QUIET: "1" },
    stdio: "ignore",
  });
  for (let tentativa = 0; tentativa < 50; tentativa += 1) {
    try {
      if ((await fetch(BASE)).ok) return servidor;
    } catch {
      // ainda subindo
    }
    await sleep(100);
  }
  servidor.kill();
  throw new Error("O servidor de pré-visualização não respondeu.");
}

async function waitForQuiet(page, idle = 1200, cap = 30_000) {
  let pending = 0;
  let last = Date.now();
  const touch = () => {
    last = Date.now();
  };
  const onRequest = () => {
    pending += 1;
    touch();
  };
  const onDone = () => {
    pending = Math.max(0, pending - 1);
    touch();
  };
  page.on("request", onRequest);
  page.on("requestfinished", onDone);
  page.on("requestfailed", onDone);
  const fim = Date.now() + cap;
  while (Date.now() < fim && !(pending === 0 && Date.now() - last >= idle)) await sleep(100);
  page.off("request", onRequest);
  page.off("requestfinished", onDone);
  page.off("requestfailed", onDone);
}

// --- uma execução ----------------------------------------------------------------

async function runOnce(browser, profile, route) {
  const context = await browser.newContext({ ...profile.context, reducedMotion: "no-preference" });
  const page = await context.newPage();
  await page.addInitScript(instrument);
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", { offline: false, ...profile.network });
  if (profile.cpu > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: profile.cpu });

  let transferido = 0;
  let pedidos = 0;
  const externos = [];
  page.on("requestfinished", async (request) => {
    const url = new URL(request.url());
    if (url.origin !== BASE) {
      externos.push(request.url());
      return;
    }
    pedidos += 1;
    const tamanhos = await request.sizes().catch(() => null);
    const resposta = await request.response();
    const declarado = Number(resposta?.headers()["content-length"] ?? 0) || 0;
    transferido += tamanhos ? (tamanhos.responseBodySize || declarado) + tamanhos.responseHeadersSize : declarado;
  });
  const erros = [];
  page.on("pageerror", (erro) => erros.push(erro.message));

  await page.goto(BASE + route.path, { waitUntil: "load" });
  await waitForQuiet(page);
  if (route.cena) {
    const fim = Date.now() + 30_000;
    while (Date.now() < fim && (await page.evaluate(() => window.__jogo.palco.pronto)) === undefined) await sleep(100);
  }
  await sleep(800);

  const pagina = await page.evaluate(() => {
    const [nav] = performance.getEntriesByType("navigation");
    const m = window.__jogo;
    return {
      ttfb: nav.responseStart,
      domContentLoaded: nav.domContentLoadedEventEnd,
      load: nav.loadEventEnd,
      fcp: m.paints["first-contentful-paint"] ?? null,
      lcp: m.lcp.at(-1) ?? null,
      palcoCanvas: m.palco.canvas ?? null,
      palcoPronto: m.palco.pronto ?? null,
      tarefasLongas: m.longtasks.length,
      bloqueio: m.longtasks.reduce((soma, tarefa) => soma + Math.max(0, tarefa.d - 50), 0),
    };
  });

  const execucao = { ...pagina, transferido, pedidos, externos, erros };

  if (route.cena && pagina.palcoPronto !== null) {
    // Cadência da cena parada.
    execucao.cadenciaParada = await page.evaluate(sampleFrames, 3000);
    // O toque na pasta do marco faz o boneco andar até ela. A amostra é instalada antes do toque e vale só enquanto
    // o palco diz que o boneco anda: a caminhada dura no máximo 1,6 segundo e pode ser bem mais curta.
    const caminhada = page.evaluate(sampleWalk, 5000);
    await page.locator('[data-marcador="marco"]').click();
    execucao.cadenciaAndando = await caminhada;
    // Ao chegar, a janela da fase abre e o laço da cena para: a cadência medida é a da página, e não da cena.
    await page.waitForSelector('[data-dialogo="fase"]', { timeout: 15_000 }).catch(() => {});
    await sleep(400);
    execucao.cadenciaComJanela = await page.evaluate(sampleFrames, 1500);
  }

  await context.close();
  return execucao;
}

function summarize(execucoes) {
  const de = (leitor) => median(execucoes.map(leitor));
  const cadencia = (campo) =>
    execucoes.some((e) => e[campo])
      ? {
          quadros: round(de((e) => e[campo]?.quadros)),
          duracao: round(de((e) => e[campo]?.duracao)),
          fps: round(de((e) => e[campo]?.fps), 1),
          intervaloMediano: round(de((e) => e[campo]?.intervaloMediano), 1),
          intervaloP95: round(de((e) => e[campo]?.intervaloP95), 1),
          intervaloMaximo: round(de((e) => e[campo]?.intervaloMaximo), 1),
          quadrosLongos: round(de((e) => e[campo]?.quadrosLongos)),
        }
      : null;
  return {
    ttfb: round(de((e) => e.ttfb)),
    fcp: round(de((e) => e.fcp)),
    lcp: round(de((e) => e.lcp)),
    load: round(de((e) => e.load)),
    palcoCanvas: round(de((e) => e.palcoCanvas)),
    palcoPronto: round(de((e) => e.palcoPronto)),
    tarefasLongas: round(de((e) => e.tarefasLongas)),
    bloqueio: round(de((e) => e.bloqueio)),
    transferido: round(de((e) => e.transferido)),
    pedidos: round(de((e) => e.pedidos)),
    externos: execucoes.flatMap((e) => e.externos).length,
    erros: execucoes.flatMap((e) => e.erros),
    cadenciaParada: cadencia("cadenciaParada"),
    cadenciaAndando: cadencia("cadenciaAndando"),
    cadenciaComJanela: cadencia("cadenciaComJanela"),
  };
}

// --- principal -------------------------------------------------------------------

const servidor = await startServer();
const browser = await chromium.launch({ args: ["--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const resultados = [];
try {
  for (const nome of profileNames) {
    const profile = PROFILES[nome];
    if (!profile) {
      console.error(`Perfil desconhecido: ${nome}`);
      continue;
    }
    for (const route of ROUTES) {
      const execucoes = [];
      for (let i = 0; i < RUNS; i += 1) execucoes.push(await runOnce(browser, profile, route));
      const resumo = summarize(execucoes);
      resultados.push({ perfil: nome, rota: route.id, caminho: route.path, mediana: resumo, execucoes });
      const cad = resumo.cadenciaAndando ? `  na caminhada ${resumo.cadenciaAndando.fps} fps em ${resumo.cadenciaAndando.quadros} quadros e ${resumo.cadenciaAndando.duracao} ms (p95 ${resumo.cadenciaAndando.intervaloP95} ms, longos ${resumo.cadenciaAndando.quadrosLongos})` : "";
      const parada = resumo.cadenciaParada ? `  parada ${resumo.cadenciaParada.fps} fps` : "";
      console.log(
        `${nome.padEnd(10)} ${route.id.padEnd(40)} LCP ${String(resumo.lcp).padStart(5)} ms  load ${String(resumo.load).padStart(5)} ms  palco pronto ${String(resumo.palcoPronto ?? "-").padStart(5)} ms  rede ${String(Math.round((resumo.transferido ?? 0) / 1024)).padStart(4)} KB${parada}${cad}`,
      );
      if (resumo.erros.length > 0) console.log(`  erros na página: ${[...new Set(resumo.erros)].join(" | ")}`);
    }
  }
} finally {
  const versao = browser.version();
  await browser.close();
  servidor.kill();
  mkdirSync(path.dirname(SAIDA), { recursive: true });
  writeFileSync(
    SAIDA,
    `${JSON.stringify(
      {
        rotulo: LABEL,
        medidoEm: new Date().toISOString(),
        condicoes: {
          tipo: "laboratório",
          pasta: path.relative(process.cwd(), PASTA) || ".",
          servidor: "scripts/preview.mjs, local, com gzip nos arquivos de texto",
          navegador: `Chromium ${versao}, sem interface, canvas 2D por software`,
          cache: "vazio a cada execução",
          execucoes: RUNS,
          resultado: "mediana das execuções",
          perfis: Object.fromEntries(profileNames.filter((nome) => PROFILES[nome]).map((nome) => [nome, PROFILES[nome].descricao])),
          maquina: `${os.cpus()[0]?.model ?? "CPU desconhecida"}, ${os.cpus().length} núcleos, ${Math.round(os.totalmem() / 2 ** 30)} GB, ${os.platform()} ${os.release()}, Node ${process.version}`,
          aviso: "Emulação de celular não é um celular: a cadência e o carregamento em aparelho real continuam por medir.",
        },
        resultados,
      },
      null,
      2,
    )}\n`,
  );
  console.log(`Gravado em ${path.relative(process.cwd(), SAIDA)}`);
}
