// Medições de laboratório sobre a saída estática (docs/PERFORMANCE.md).
//
// Sobe o servidor de pré-visualização em uma porta própria, abre cada rota em
// um Chromium sem interface, com o cache vazio, e registra carregamento,
// estabilidade visual, peso dos recursos e resposta das interações.
//
// Uso:
//   npm run build
//   npm run measure -- --rotulo depois
//
// Opções:
//   --rotulo <nome>      nome da medição; vira o nome do arquivo (obrigatório)
//   --pasta <caminho>    pasta servida (out)
//   --execucoes <n>      execuções por rota e perfil (5); o resultado é a mediana
//   --perfis <a,b>       perfis a medir (computador,celular)
//   --rotas <a,b>        rotas a medir, pelo identificador (todas)
//   --saida <arquivo>    arquivo JSON de saída (docs/desempenho/<rotulo>.json)
//   --webgl <modo>       `software` (padrão, como nos testes) ou `placa`, que usa a
//                        placa de vídeo da máquina pelo ANGLE com Direct3D 11
//   --contra <nome>=<pasta>
//                        mede também outro build, alternando as execuções com
//                        as do primeiro; grava docs/desempenho/<nome>.json
//
// O que cada número é, e o que ele não é, está em docs/PERFORMANCE.md.

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { chromium } from "@playwright/test";

const args = new Map();
for (let i = 2; i < process.argv.length; i += 2) args.set(process.argv[i], process.argv[i + 1]);

const LABEL = args.get("--rotulo");
if (!LABEL) {
  console.error("Informe o nome da medição: npm run measure -- --rotulo <nome>");
  process.exit(1);
}
const RUNS = Number(args.get("--execucoes") ?? 5);

// O Chromium sem interface desenha o WebGL por software, a menos que se peça a
// placa de vídeo. Com ela, o custo do mapa fica mais perto do de um navegador comum.
const WEBGL = args.get("--webgl") ?? "software";
const LAUNCH_ARGS = {
  software: ["--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
  placa: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"],
}[WEBGL];
if (!LAUNCH_ARGS) {
  console.error("Use --webgl software ou --webgl placa.");
  process.exit(1);
}
const FIRST_PORT = 4312;

// Os builds medidos. Com `--contra`, são dois: as execuções se alternam, para
// a comparação não depender do estado da máquina em cada momento.
const BUILDS = [
  {
    rotulo: LABEL,
    pasta: path.resolve(args.get("--pasta") ?? "out"),
    saida: path.resolve(args.get("--saida") ?? `docs/desempenho/${LABEL}.json`),
  },
];
if (args.has("--contra")) {
  const [rotulo, pasta] = String(args.get("--contra")).split("=");
  if (!rotulo || !pasta) {
    console.error("Use --contra <nome>=<pasta>.");
    process.exit(1);
  }
  BUILDS.push({ rotulo, pasta: path.resolve(pasta), saida: path.resolve(`docs/desempenho/${rotulo}.json`) });
}
BUILDS.forEach((build, indice) => {
  build.porta = FIRST_PORT + indice;
  build.base = `http://localhost:${build.porta}`;
  if (!existsSync(path.join(build.pasta, "index.html"))) {
    console.error(`Pasta ${build.pasta} sem index.html. Rode \`npm run build\` antes.`);
    process.exit(1);
  }
});

// Rede e CPU de cada perfil: valores fixos, aplicados pelo protocolo do
// navegador. O de computador imita uma conexão fixa comum, porque sem latência
// nenhuma (servidor na própria máquina) os pacotes chegam todos de uma vez e a
// ordem entre desenhar e executar deixa de parecer com a de uma visita real.
// O de celular usa os números de "4G lenta" das medições de laboratório.
const PROFILES = {
  computador: {
    descricao: "1440×900, rede a 10 Mbit/s com 40 ms de latência, CPU sem limite",
    context: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
    network: { latency: 40, downloadThroughput: (10 * 1024 * 1024) / 8, uploadThroughput: (10 * 1024 * 1024) / 8 },
    cpu: 1,
    touch: false,
  },
  celular: {
    descricao: "390×844, toque, rede a 1,6 Mbit/s com 150 ms de latência, CPU 4 vezes mais lenta",
    context: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
    network: { latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 },
    cpu: 4,
    touch: true,
  },
};

const ROUTES = [
  { id: "entrada", path: "/" },
  { id: "exploracao", path: "/politicos/lula/", interactions: "exploracao" },
  { id: "comparacao", path: "/comparar/", interactions: "comparacao" },
  { id: "acontecimento", path: "/acontecimentos/lula-2023-intervencao-federal-no-distrito-federal/" },
  { id: "metodologia", path: "/metodologia/" },
];

const pick = (lista, chave) => {
  const pedido = args.get(chave);
  if (!pedido) return lista;
  const nomes = new Set(pedido.split(","));
  return lista.filter((item) => nomes.has(item));
};
const profileNames = pick(Object.keys(PROFILES), "--perfis");
const routeIds = new Set(pick(ROUTES.map((rota) => rota.id), "--rotas"));

// --- o que roda dentro da página, antes de qualquer script dela ---------------

function instrument() {
  const m = (window.__atlas = { lcp: [], shifts: [], longtasks: [], frames: [], events: [], paints: {}, map: {}, watch: {} });

  const describe = (el) => {
    if (!el || !el.tagName) return null;
    const classes = typeof el.className === "string" ? el.className : "";
    return {
      tag: el.tagName.toLowerCase(),
      id: el.id || undefined,
      classes: classes.slice(0, 90) || undefined,
      texto: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 70) || undefined,
    };
  };
  const observe = (type, each, extra) => {
    try {
      new PerformanceObserver((list) => list.getEntries().forEach(each)).observe({ type, buffered: true, ...extra });
    } catch {
      // tipo de entrada que este navegador não registra
    }
  };

  observe("largest-contentful-paint", (e) =>
    m.lcp.push({ t: e.startTime, area: e.size, url: e.url || undefined, elemento: describe(e.element) }),
  );
  observe("layout-shift", (e) =>
    m.shifts.push({
      t: e.startTime,
      valor: e.value,
      aposEntrada: e.hadRecentInput,
      nos: (e.sources || []).slice(0, 3).map((fonte) => describe(fonte.node)),
    }),
  );
  observe("longtask", (e) => m.longtasks.push({ t: e.startTime, d: e.duration }));
  // Quadros que levaram mais de 50 ms para sair, com o tempo em que a página
  // ficou sem responder dentro de cada um, calculado pelo navegador.
  observe("long-animation-frame", (e) => m.frames.push({ t: e.startTime, d: e.duration, bloqueio: e.blockingDuration }));
  observe("paint", (e) => {
    m.paints[e.name] = e.startTime;
  });
  observe("event", (e) => m.events.push({ nome: e.name, t: e.startTime, d: e.duration, id: e.interactionId }), {
    durationThreshold: 16,
  });

  // O instante da última entrada da pessoa, na mesma régua de `performance.now()`.
  for (const type of ["click", "change"]) {
    addEventListener(
      type,
      (e) => {
        if (m.inputAt === undefined) m.inputAt = e.timeStamp;
      },
      true,
    );
  }

  // Quando a moldura do mapa aparece, quando o canvas é criado e quando o aviso
  // de carregamento some. Vale para qualquer versão da interface.
  const timer = setInterval(() => {
    if (!document.body) return;
    const canvas = document.querySelector(".maplibregl-canvas");
    const waiting = Array.from(document.querySelectorAll('[role="status"]')).some((no) =>
      /Carregando o mapa/.test(no.textContent || ""),
    );
    const now = performance.now();
    if (m.map.moldura === undefined && (canvas || waiting)) m.map.moldura = now;
    if (m.map.canvas === undefined && canvas) m.map.canvas = now;
    if (m.map.pronto === undefined && canvas && !waiting) {
      m.map.pronto = now;
      clearInterval(timer);
    }
  }, 50);
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

/** CLS como na definição: a maior janela de sessão (até 5 s, com menos de 1 s entre os deslocamentos). */
function cumulativeLayoutShift(shifts) {
  let maior = 0;
  let janela = 0;
  let inicio = 0;
  let anterior = 0;
  for (const shift of shifts.filter((item) => !item.aposEntrada).sort((a, b) => a.t - b.t)) {
    if (janela > 0 && shift.t - anterior < 1000 && shift.t - inicio < 5000) {
      janela += shift.valor;
    } else {
      janela = shift.valor;
      inicio = shift.t;
    }
    anterior = shift.t;
    maior = Math.max(maior, janela);
  }
  return maior;
}

const KINDS = [
  ["documento", /\.html$|\/$/],
  ["javascript", /\.m?js$/],
  ["css", /\.css$/],
  ["fonte", /\.woff2?$/],
  ["imagem", /\.(jpe?g|png|webp|avif|svg|ico)$/],
  ["dados", /\.(geojson|json|txt)$/],
];
const kindOf = (pathname) => KINDS.find(([, padrao]) => padrao.test(pathname))?.[0] ?? "outro";

function fileSize(build, pathname) {
  const direto = path.join(build.pasta, decodeURIComponent(pathname));
  for (const candidato of [direto, path.join(direto, "index.html")]) {
    if (existsSync(candidato) && statSync(candidato).isFile()) return statSync(candidato).size;
  }
  return null;
}

async function startServer(build) {
  const servidor = spawn(process.execPath, ["scripts/preview.mjs"], {
    env: { ...process.env, PORT: String(build.porta), OUT_DIR: build.pasta, QUIET: "1" },
    stdio: "ignore",
  });
  for (let tentativa = 0; tentativa < 50; tentativa += 1) {
    try {
      if ((await fetch(build.base)).ok) return servidor;
    } catch {
      // ainda subindo
    }
    await sleep(100);
  }
  servidor.kill();
  throw new Error("O servidor de pré-visualização não respondeu.");
}

/** Espera a rede ficar parada por um tempo, com um teto. */
async function waitForQuiet(page, idle = 1500, cap = 45_000) {
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

async function waitForMap(page, cap = 45_000) {
  const fim = Date.now() + cap;
  while (Date.now() < fim) {
    const estado = await page.evaluate(() => window.__atlas.map);
    if (estado.pronto !== undefined) return true;
    if (estado.moldura === undefined) return false;
    await sleep(100);
  }
  return false;
}

// --- interações ----------------------------------------------------------------

/**
 * Faz uma ação e mede a resposta de duas formas:
 * - `evento`: a duração que o navegador registrou para a interação (Event
 *   Timing), da entrada até a pintura seguinte. Entradas com menos de 16 ms
 *   não são registradas e saem como `null`.
 * - `dom`: o tempo da entrada até cada parte da tela mudar, visto de dentro da
 *   página a cada quadro.
 */
async function interact(page, action, watchers) {
  const desde = await page.evaluate(
    (lista) => {
      const m = window.__atlas;
      // O que identifica o conteúdo de uma parte da tela: muda quando ela muda.
      const sig = (seletor) =>
        Array.from(document.querySelectorAll(seletor))
          .map((no) => no.getAttribute("data-acontecimento") ?? no.getAttribute("data-marker") ?? (no.textContent ?? "").slice(0, 40))
          .join("|");
      m.watch = {};
      m.inputAt = undefined;
      const limite = performance.now() + 8000;
      for (const item of lista) {
        const antes = sig(item.seletor);
        const tick = () => {
          if (sig(item.seletor) !== antes) m.watch[item.nome] = performance.now();
          else if (performance.now() < limite) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
      return performance.now();
    },
    watchers,
  );
  await action();
  const fim = Date.now() + 8000;
  while (Date.now() < fim) {
    const vistos = await page.evaluate(() => Object.keys(window.__atlas.watch).length);
    if (vistos === watchers.length) break;
    await sleep(100);
  }
  // O registro do Event Timing chega depois da pintura.
  await sleep(600);
  return page.evaluate((inicio) => {
    const m = window.__atlas;
    const porInteracao = new Map();
    for (const entrada of m.events) {
      if (entrada.t < inicio || !entrada.id) continue;
      porInteracao.set(entrada.id, Math.max(porInteracao.get(entrada.id) ?? 0, entrada.d));
    }
    const dom = {};
    for (const [nome, instante] of Object.entries(m.watch)) {
      dom[nome] = m.inputAt === undefined ? null : instante - m.inputAt;
    }
    return { evento: porInteracao.size ? Math.max(...porInteracao.values()) : null, dom };
  }, desde);
}

const act = (locator, touch) => () => (touch ? locator.tap() : locator.click());

const LIST_ITEMS = ".explorer-lista li[data-acontecimento]";
const READING = ".explorer-painel h3";
const MARKERS = "[data-marker]";

const INTERACTIONS = {
  async exploracao(page, profile) {
    const resultado = {};
    const recorte = page.getByRole("region", { name: "Recorte" });
    const lista = page.getByRole("region", { name: "Acontecimentos", exact: true });
    const leitura = page.getByRole("region", { name: "Leitura" });
    const vista = page.getByRole("group", { name: "Vista" });

    if (profile.touch) {
      // No celular o mapa só é montado quando a vista Mapa é aberta.
      const antes = await page.evaluate(() => performance.now());
      resultado.abrirMapa = await interact(page, act(vista.getByRole("button", { name: "Mapa", exact: true }), true), []);
      const pronto = await waitForMap(page);
      const estado = await page.evaluate(() => window.__atlas.map);
      resultado.abrirMapa.dom.mapaPronto = pronto && estado.pronto !== undefined ? estado.pronto - antes : null;
      await sleep(500);
      await vista.getByRole("button", { name: "Lista", exact: true }).tap();
      await sleep(500);
      await recorte.getByRole("button", { name: /^Filtros/ }).tap();
      await sleep(300);
    }

    resultado.categoria = await interact(
      page,
      act(recorte.getByRole("button", { name: /^Eleições/ }), profile.touch),
      profile.touch ? [{ nome: "lista", seletor: LIST_ITEMS }] : [{ nome: "lista", seletor: LIST_ITEMS }, { nome: "marcadores", seletor: MARKERS }],
    );
    await sleep(400);
    resultado.todasAsCategorias = await interact(
      page,
      act(recorte.getByRole("button", { name: /^Eleições/ }), profile.touch),
      [{ nome: "lista", seletor: LIST_ITEMS }],
    );
    await sleep(400);
    if (profile.touch) {
      await recorte.getByRole("button", { name: /^Filtros/ }).tap();
      await sleep(300);
    }

    resultado.selecao = await interact(
      page,
      act(lista.locator("li[data-acontecimento] button").first(), profile.touch),
      [{ nome: "leitura", seletor: READING }],
    );
    await sleep(400);
    resultado.fechar = await interact(
      page,
      act(leitura.getByRole("button", { name: "Fechar" }).first(), profile.touch),
      [{ nome: "leitura", seletor: READING }],
    );
    return resultado;
  },

  async comparacao(page, profile) {
    const recorte = page.getByRole("region", { name: "Recorte" });
    if (profile.touch) {
      await recorte.getByRole("button", { name: /^Filtros/ }).tap();
      await sleep(300);
    }
    return {
      categoria: await interact(
        page,
        act(recorte.getByRole("button", { name: /^Eleições/ }), profile.touch),
        [{ nome: "colunas", seletor: "[data-trajetoria] li[data-acontecimento]" }],
      ),
    };
  },
};

// --- uma execução ----------------------------------------------------------------

async function runOnce(browser, profile, route, build) {
  const BASE = build.base;
  const context = await browser.newContext({ ...profile.context, reducedMotion: "no-preference" });
  const page = await context.newPage();
  await page.addInitScript(instrument);

  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  if (profile.network) await cdp.send("Network.emulateNetworkConditions", { offline: false, ...profile.network });
  if (profile.cpu > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: profile.cpu });

  const recursos = [];
  const pendentes = [];
  page.on("requestfinished", (request) => {
    pendentes.push(
      (async () => {
        const url = new URL(request.url());
        if (url.origin !== BASE) {
          recursos.push({ url: request.url(), externo: true });
          return;
        }
        const resposta = await request.response();
        const tamanhos = await request.sizes().catch(() => null);
        // Para o script de um worker, o navegador informa corpo de tamanho zero.
        // Nesse caso vale o que o servidor declarou no cabeçalho da resposta.
        const declarado = Number(resposta?.headers()["content-length"] ?? 0) || 0;
        const corpo = tamanhos?.responseBodySize || declarado;
        recursos.push({
          caminho: url.pathname,
          tipo: kindOf(url.pathname),
          status: resposta?.status() ?? null,
          transferido: tamanhos ? corpo + tamanhos.responseHeadersSize : declarado || null,
          arquivo: fileSize(build, url.pathname),
          inicio: request.timing().startTime,
        });
      })(),
    );
  });
  const falhas = [];
  page.on("requestfailed", (request) => falhas.push(request.url().replace(BASE, "")));

  await page.goto(BASE + route.path, { waitUntil: "load" });
  await waitForQuiet(page);
  const mapaNaAbertura = await waitForMap(page);
  await sleep(2000);
  await Promise.all(pendentes);

  const pagina = await page.evaluate(() => {
    const [nav] = performance.getEntriesByType("navigation");
    // Quando o último arquivo de fonte terminou de chegar. Depois do primeiro
    // desenho, significa que o texto apareceu na fonte substituta e foi trocado.
    const fontes = performance
      .getEntriesByType("resource")
      .filter((recurso) => recurso.name.endsWith(".woff2"))
      .map((recurso) => recurso.responseEnd);
    return {
      origem: performance.timeOrigin,
      fontes: fontes.length > 0 ? Math.max(...fontes) : null,
      ttfb: nav.responseStart,
      domContentLoaded: nav.domContentLoadedEventEnd,
      load: nav.loadEventEnd,
      atlas: window.__atlas,
    };
  });
  const { atlas } = pagina;
  const lcp = atlas.lcp.at(-1) ?? null;

  const somar = (lista) => {
    const porTipo = {};
    for (const recurso of lista) {
      if (recurso.externo) continue;
      const grupo = (porTipo[recurso.tipo] ??= { pedidos: 0, transferido: 0, arquivo: 0 });
      grupo.pedidos += 1;
      grupo.transferido += recurso.transferido ?? 0;
      grupo.arquivo += recurso.arquivo ?? 0;
    }
    const total = { pedidos: 0, transferido: 0, arquivo: 0 };
    for (const grupo of Object.values(porTipo)) {
      total.pedidos += grupo.pedidos;
      total.transferido += grupo.transferido;
      total.arquivo += grupo.arquivo;
    }
    return { total, porTipo };
  };
  const ateOLoad = recursos.filter((recurso) => !recurso.externo && recurso.inicio - pagina.origem <= pagina.load);

  const execucao = {
    ttfb: pagina.ttfb,
    fcp: atlas.paints["first-contentful-paint"] ?? null,
    lcp: lcp?.t ?? null,
    lcpElemento: lcp ? { ...lcp.elemento, area: lcp.area, url: lcp.url } : null,
    fontes: pagina.fontes,
    cls: cumulativeLayoutShift(atlas.shifts),
    deslocamentos: atlas.shifts.filter((item) => !item.aposEntrada && item.valor >= 0.001),
    domContentLoaded: pagina.domContentLoaded,
    load: pagina.load,
    tarefasLongas: atlas.longtasks.length,
    // Soma do que cada tarefa longa passa de 50 ms, em toda a janela medida.
    bloqueio: atlas.longtasks.reduce((soma, tarefa) => soma + Math.max(0, tarefa.d - 50), 0),
    // O mesmo tempo, somado pelos quadros longos. Pega também o trabalho de
    // desenho, que nem sempre aparece como tarefa longa, e varia menos.
    quadrosLongos: atlas.frames.length,
    bloqueioDosQuadros: atlas.frames.reduce((soma, quadro) => soma + (quadro.bloqueio ?? 0), 0),
    mapa: mapaNaAbertura
      ? { naAbertura: true, moldura: atlas.map.moldura, canvas: atlas.map.canvas, pronto: atlas.map.pronto }
      : { naAbertura: false },
    recursos: {
      ateOLoad: somar(ateOLoad),
      total: somar(recursos),
      maiores: recursos
        .filter((recurso) => !recurso.externo)
        .sort((a, b) => (b.transferido ?? 0) - (a.transferido ?? 0))
        .slice(0, 6)
        .map(({ caminho, tipo, transferido, arquivo }) => ({ caminho, tipo, transferido, arquivo })),
      externos: recursos.filter((recurso) => recurso.externo).map((recurso) => recurso.url),
      // Os pedidos de pré-carregamento de segmento do Next dão 404 em hospedagem simples (docs/STATUS.md).
      comErro: recursos.filter((recurso) => !recurso.externo && recurso.status >= 400).map((recurso) => recurso.caminho),
      falhas,
    },
  };

  if (route.interactions) {
    try {
      execucao.interacoes = await INTERACTIONS[route.interactions](page, profile);
    } catch (erro) {
      execucao.interacoes = { erro: String(erro.message ?? erro).split("\n")[0] };
    }
  }

  await context.close();
  return execucao;
}

function summarize(execucoes) {
  const de = (leitor) => median(execucoes.map(leitor));
  const resumo = {
    ttfb: round(de((e) => e.ttfb)),
    fcp: round(de((e) => e.fcp)),
    lcp: round(de((e) => e.lcp)),
    fontes: round(de((e) => e.fontes)),
    cls: round(de((e) => e.cls), 4),
    clsMaximo: round(Math.max(...execucoes.map((e) => e.cls)), 4),
    load: round(de((e) => e.load)),
    bloqueio: round(de((e) => e.bloqueio)),
    tarefasLongas: round(de((e) => e.tarefasLongas)),
    bloqueioDosQuadros: round(de((e) => e.bloqueioDosQuadros)),
    quadrosLongos: round(de((e) => e.quadrosLongos)),
    mapaPronto: round(de((e) => (e.mapa.naAbertura ? e.mapa.pronto : null))),
    transferidoAteOLoad: round(de((e) => e.recursos.ateOLoad.total.transferido)),
    transferidoTotal: round(de((e) => e.recursos.total.total.transferido)),
    arquivosTotal: round(de((e) => e.recursos.total.total.arquivo)),
    pedidos: round(de((e) => e.recursos.total.total.pedidos)),
  };
  const comInteracoes = execucoes.filter((e) => e.interacoes && !e.interacoes.erro);
  if (comInteracoes.length > 0) {
    resumo.interacoes = {};
    for (const nome of Object.keys(comInteracoes[0].interacoes)) {
      const partes = comInteracoes.map((e) => e.interacoes[nome]).filter(Boolean);
      const dom = {};
      for (const chave of Object.keys(partes[0]?.dom ?? {})) dom[chave] = round(median(partes.map((p) => p.dom[chave])));
      resumo.interacoes[nome] = {
        evento: round(median(partes.map((p) => p.evento))),
        eventoMaximo: round(Math.max(...partes.map((p) => p.evento ?? 0))),
        semRegistro: partes.filter((p) => p.evento === null).length,
        dom,
      };
    }
  }
  return resumo;
}

// --- principal -------------------------------------------------------------------

for (const build of BUILDS) {
  build.servidor = await startServer(build);
  build.resultados = [];
}
const browser = await chromium.launch({ args: LAUNCH_ARGS });
// Quem desenha o WebGL nesta execução, dito pelo próprio navegador.
const renderer = await (async () => {
  const page = await browser.newPage();
  const nome = await page.evaluate(() => {
    const gl = document.createElement("canvas").getContext("webgl2");
    if (!gl) return "sem WebGL 2";
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    return String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
  });
  await page.close();
  return nome;
})();
const margem = Math.max(...BUILDS.map((build) => build.rotulo.length));

try {
  for (const nome of profileNames) {
    const profile = PROFILES[nome];
    for (const route of ROUTES.filter((rota) => routeIds.has(rota.id))) {
      // Com dois builds, as execuções se alternam, e a ordem troca a cada
      // rodada: o que muda na máquina durante a medição pesa igual nos dois.
      const execucoes = new Map(BUILDS.map((build) => [build, []]));
      for (let i = 0; i < RUNS; i += 1) {
        const ordem = i % 2 === 0 ? BUILDS : [...BUILDS].reverse();
        for (const build of ordem) execucoes.get(build).push(await runOnce(browser, profile, route, build));
      }

      for (const build of BUILDS) {
        const feitas = execucoes.get(build);
        const resumo = summarize(feitas);
        // O elemento do LCP e os recursos saem da execução mais próxima da mediana.
        const tipica = [...feitas].sort((a, b) => Math.abs((a.lcp ?? 0) - (resumo.lcp ?? 0)) - Math.abs((b.lcp ?? 0) - (resumo.lcp ?? 0)))[0];
        build.resultados.push({
          perfil: nome,
          rota: route.id,
          caminho: route.path,
          mediana: resumo,
          lcpElemento: tipica.lcpElemento,
          deslocamentos: tipica.deslocamentos,
          recursos: tipica.recursos,
          // As execuções guardam os tempos; os recursos e os deslocamentos ficam só os da execução típica.
          execucoes: feitas.map((execucao) =>
            Object.fromEntries(Object.entries(execucao).filter(([chave]) => chave !== "recursos" && chave !== "deslocamentos")),
          ),
        });
        const linha = [
          build.rotulo.padEnd(margem),
          nome.padEnd(10),
          route.id.padEnd(14),
          `LCP ${String(resumo.lcp).padStart(5)} ms`,
          `FCP ${String(resumo.fcp).padStart(5)} ms`,
          `CLS ${String(resumo.cls).padStart(6)}`,
          `bloqueio ${String(resumo.bloqueioDosQuadros).padStart(5)} ms`,
          `rede ${String(Math.round((resumo.transferidoTotal ?? 0) / 1024)).padStart(5)} KB`,
          resumo.mapaPronto === null ? "mapa: não" : `mapa pronto ${resumo.mapaPronto} ms`,
        ];
        console.log(linha.join("  "));
        if (resumo.interacoes) {
          for (const [interacao, valores] of Object.entries(resumo.interacoes)) {
            const dom = Object.entries(valores.dom).map(([chave, valor]) => `${chave} ${valor} ms`).join(", ");
            console.log(`${" ".repeat(margem + 28)}${interacao}: evento ${valores.evento ?? "< 16"} ms${dom ? `; ${dom}` : ""}`);
          }
        }
        const erro = feitas.find((e) => e.interacoes?.erro);
        if (erro) console.log(`${" ".repeat(margem + 28)}interações com erro: ${erro.interacoes.erro}`);
      }
    }
  }
} finally {
  const versao = browser.version();
  await browser.close();

  for (const build of BUILDS) {
    build.servidor.kill();
    const outros = BUILDS.filter((item) => item !== build).map((item) => item.rotulo);
    mkdirSync(path.dirname(build.saida), { recursive: true });
    writeFileSync(
      build.saida,
      `${JSON.stringify(
        {
          rotulo: build.rotulo,
          medidoEm: new Date().toISOString(),
          condicoes: {
            tipo: "laboratório",
            pasta: path.relative(process.cwd(), build.pasta) || ".",
            servidor: "scripts/preview.mjs, local, com gzip nos arquivos de texto",
            navegador: `Chromium ${versao}, sem interface`,
            webgl: renderer,
            cache: "vazio a cada execução",
            execucoes: RUNS,
            resultado: "mediana das execuções",
            ordem: outros.length > 0 ? `execuções alternadas com as de ${outros.join(", ")}` : "em sequência",
            perfis: Object.fromEntries(profileNames.map((nome) => [nome, PROFILES[nome].descricao])),
            maquina: `${os.cpus()[0]?.model ?? "CPU desconhecida"}, ${os.cpus().length} núcleos, ${Math.round(os.totalmem() / 2 ** 30)} GB, ${os.platform()} ${os.release()}, Node ${process.version}`,
          },
          resultados: build.resultados,
        },
        null,
        2,
      )}\n`,
    );
    console.log(`Gravado em ${path.relative(process.cwd(), build.saida)}`);
  }
}
