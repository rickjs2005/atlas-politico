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
// lateral, resposta inesperada ou parada de foco que não dá para ver. Reprova
// também a tela que não parou de mudar antes da medição, a parada de teclado
// lida com o foco ainda em transição e, nas telas do jogo que declaram o que
// tem de estar na página (`presente`), a que não é a preparada. As telas com
// mapa não declaram: em tela estreita o mapa não é montado, e a espera por ele
// termina sem acusar.
//
// A passagem roda com movimento reduzido. Antes de medir, e depois de cada
// Tab, espera a tela assentar: em um link com consulta, a área que vai mudar
// fica encoberta até o endereço ser lido e, com movimento reduzido, aparece
// aos poucos; e o controle que cresce com o foco só chega ao tamanho final
// depois da transição (`untilStill`).
//
// As telas do jogo cobrem os dois personagens, a trajetória e os
// aprofundamentos, e os estados de uma fase: a cena, a ajuda com o humor
// desligado, a fase aberta, a resposta errada e a certa, a ordenação, a fase de
// processos, um registro, uma decisão, a lista de fases, o resumo, a leitura
// sem o cenário e a retomada; e o passaporte (D-150): a caderneta com três
// carimbos, o carimbo que traz um selo e o fim das duas trajetórias. As
// janelas são abertas pela interface, e a preferência é semeada no navegador,
// no formato que o jogo grava. O progresso de quem percorreu as duas
// trajetórias também é do jogo: a passagem percorre as duas uma vez, pela
// interface, guarda o que ficou no navegador e devolve esse registro nas
// vezes seguintes. Roda com o gancho de módulos do projeto (package.json),
// que resolve os módulos do jogo em TypeScript.
//
// O que a passagem não vê: uma camada posta por cima do texto, como uma
// hachura, não entra na conta do contraste. As capturas existem para isso, e
// precisam ser olhadas. Leitor de tela e aparelho real também ficam de fora.

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { chromium } from "@playwright/test";

import { DEFAULT_PREFERENCES, PREFERENCES_KEY, serializePreferences } from "@/lib/game/preferences";
import { storageKey } from "@/lib/game/storage";

const args = new Map();
for (let i = 2; i < process.argv.length; i += 2) args.set(process.argv[i], process.argv[i + 1]);

const OUT_DIR = path.resolve(args.get("--pasta") ?? "out");
const REPORT_DIR = path.resolve(args.get("--saida") ?? "test-results/a11y");
const PORT = 4318;
const BASE = `http://localhost:${PORT}`;
// Um arquivo de texto da mesma origem, sem o código do jogo: é nele que o armazenamento do navegador é limpo entre as telas.
const DOCUMENTO_SEM_JOGO = "/robots.txt";

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

// As fases do jogo que as telas abrem saem do conteúdo: a origem de Lula (uma
// pergunta, com a opção certa e uma errada), a primeira ordenação dele, a fase
// de processos de Flávio Bolsonaro (contexto sensível, com a ficha judicial),
// a fase em que o marco é uma atuação legislativa e a última, que leva ao
// resumo. O número da fase no endereço é a posição dela na trajetória.
const trajetoriaDe = (pessoaId) => conjunto.fasesDoJogo.filter((fase) => fase.pessoaId === pessoaId && fase.sala === "historico").sort((a, b) => a.ordem - b.ordem);
const TRAJETORIA = trajetoriaDe("lula");
const ORIGEM = TRAJETORIA[0];
const ORDENACAO = TRAJETORIA.find((fase) => fase.atividade.tipo === "ordem");
const ULTIMA = TRAJETORIA.at(-1);
const PROCESSOS = trajetoriaDe("flavio-bolsonaro").find((fase) => fase.id.endsWith("-processos"));
const COM_DECISAO = trajetoriaDe("flavio-bolsonaro").find((fase) => fase.marco.tipo === "decisao");
if (!ORIGEM || ORIGEM.atividade.tipo !== "pergunta" || !ORDENACAO || !ULTIMA || !PROCESSOS || !COM_DECISAO) {
  console.error("O conteúdo não tem as fases que a passagem abre: a origem de Lula com pergunta, uma ordenação, a fase de processos e uma fase com decisão no marco.");
  process.exit(1);
}
const CERTA = ORIGEM.atividade.correta;
const ERRADA = ORIGEM.atividade.opcoes.find((opcao) => opcao.id !== CERTA).id;

// As janelas do jogo ignoram ponteiro por 350 ms ao abrir (D-107): os passos esperam a janela aceitar o clique.
const GUARDA = 450;
// O erro de uma tela que não parou de mudar no prazo (`untilStill`).
const NAO_ASSENTOU = "A tela não assentou antes da medição: continuou encoberta à espera da consulta do endereço, ou com transição em andamento.";
const janela = (page, nome) => page.waitForSelector(`[data-dialogo="${nome}"] [role="dialog"][data-aceita-ponteiro="sim"]`);
async function abrirFase(page) {
  await page.locator("[data-abrir-marco]").click();
  await janela(page, "fase");
}
async function responder(page, opcao) {
  await abrirFase(page);
  await page.locator(`[data-dialogo="fase"] [data-opcao="${opcao}"]`).click();
  await page.locator('[data-dialogo="fase"] [data-responder]').click();
}
async function lerESeguir(page) {
  await abrirFase(page);
  await page.locator('[data-dialogo="fase"] [data-ver-explicacao]').click();
  await page.locator('[data-dialogo="fase"] [data-continuar]').click();
}

// O que o jogo gravou no navegador para quem percorreu as duas trajetórias: pares de chave e valor, como estavam no
// armazenamento. Fica vazio até a passagem percorrer as duas pela interface, na primeira vez que a tela é aberta.
const PERSONAGENS = ["flavio-bolsonaro", "lula"];
let duasTrajetorias = null;
async function percorrerAsDuas(page) {
  for (const slug of PERSONAGENS) {
    await page.goto(`${BASE}/jogo/${slug}/?fase=1`);
    await settle(page, { jogo: true });
    for (let fase = 0; fase < trajetoriaDe(slug).length; fase += 1) await lerESeguir(page);
    // Depois da última fase vem o resumo: é o sinal de que a trajetória foi até o fim.
    await janela(page, "resumo");
  }
  duasTrajetorias = await page.evaluate((chaves) => chaves.map((chave) => [chave, window.localStorage.getItem(chave)]), PERSONAGENS.map(storageKey));
  if (duasTrajetorias.some(([, valor]) => valor === null)) throw new Error("O jogo não gravou o progresso das duas trajetórias.");
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
  { nome: "09-jogo-entrada", url: "/jogo/" },
  { nome: "10-jogo-cena", url: "/jogo/lula/?fase=1", jogo: true, presente: '[data-palco="pronto"]' },
  { nome: "11-jogo-cena-flavio-bolsonaro", url: "/jogo/flavio-bolsonaro/?fase=1", jogo: true, presente: '[data-palco="pronto"]' },
  { nome: "12-jogo-aprofundamento-economia", url: "/jogo/lula/economia/", jogo: true, presente: '[data-palco="pronto"]' },
  { nome: "13-jogo-aprofundamento-seguranca", url: "/jogo/flavio-bolsonaro/seguranca-publica/", jogo: true, presente: '[data-palco="pronto"]' },
  {
    nome: "14-jogo-ajuda-sem-humor",
    url: "/jogo/lula/?fase=1",
    jogo: true,
    preferencias: { ...DEFAULT_PREFERENCES, humor: false },
    presente: '[data-dialogo="ajuda"]',
    preparar: async (page) => {
      await page.locator("[data-abrir-ajuda]").click();
      await janela(page, "ajuda");
    },
  },
  { nome: "15-jogo-fase-aberta", url: "/jogo/lula/?fase=1", jogo: true, presente: '[data-dialogo="fase"]', preparar: abrirFase },
  { nome: "16-jogo-resposta-errada", url: "/jogo/lula/?fase=1", jogo: true, presente: '[data-resultado="errado"]', preparar: (page) => responder(page, ERRADA) },
  { nome: "17-jogo-resposta-certa", url: "/jogo/lula/?fase=1", jogo: true, presente: '[data-resultado="certo"]', preparar: (page) => responder(page, CERTA) },
  { nome: "18-jogo-ordenacao", url: `/jogo/lula/?fase=${ORDENACAO.ordem}`, jogo: true, presente: '[data-atividade="ordem"]', preparar: abrirFase },
  { nome: "19-jogo-fase-de-processos", url: `/jogo/flavio-bolsonaro/?fase=${PROCESSOS.ordem}`, jogo: true, presente: "[data-ficha-judicial]", preparar: abrirFase },
  {
    nome: "20-jogo-registro",
    url: "/jogo/lula/?fase=1",
    jogo: true,
    presente: '[data-dialogo="registro"]',
    preparar: async (page) => {
      await abrirFase(page);
      await page.locator('[data-dialogo="fase"] [data-explorar] [data-abrir-registro]').first().click();
      await janela(page, "registro");
    },
  },
  {
    nome: "21-jogo-decisao",
    url: `/jogo/flavio-bolsonaro/?fase=${COM_DECISAO.ordem}`,
    jogo: true,
    presente: "[data-decisao-cartao]",
    preparar: async (page) => {
      await abrirFase(page);
      await page.locator('[data-dialogo="fase"] [data-fontes-da-fase] summary').click();
      await page.locator(`[data-dialogo="fase"] [data-apoio="${COM_DECISAO.marco.tipo}:${COM_DECISAO.marco.id}"] [data-abrir-registro]`).click();
      await janela(page, "registro");
    },
  },
  {
    nome: "22-jogo-lista-de-fases",
    url: "/jogo/lula/?fase=1",
    jogo: true,
    presente: '[data-dialogo="fases"]',
    preparar: async (page) => {
      await page.locator("[data-abrir-fases]").click();
      await janela(page, "fases");
    },
  },
  {
    nome: "23-jogo-resumo",
    url: `/jogo/lula/?fase=${ULTIMA.ordem}`,
    jogo: true,
    presente: '[data-dialogo="resumo"]',
    preparar: async (page) => {
      await lerESeguir(page);
      await janela(page, "resumo");
    },
  },
  { nome: "24-jogo-leitura-sem-cenario", url: "/jogo/lula/?fase=1&leitura=1", jogo: "leitura", presente: "[data-leitura-da-fase]" },
  {
    nome: "25-jogo-retomada",
    url: "/jogo/lula/?fase=1",
    jogo: true,
    presente: "[data-aviso-retomada]",
    // Duas fases concluídas pela leitura, e a trajetória aberta de novo sem pedido de fase: a tela diz onde a pessoa parou.
    preparar: async (page) => {
      await lerESeguir(page);
      await lerESeguir(page);
      await page.goto(`${BASE}/jogo/lula/`);
      await settle(page, { jogo: true });
    },
  },
  {
    nome: "26-jogo-passaporte",
    url: "/jogo/lula/?fase=1",
    jogo: true,
    presente: '[data-dialogo="passaporte"] [data-selo="primeiros-passos"][data-obtido="sim"]',
    // Três fases concluídas pela leitura, e a caderneta aberta pela faixa do cartão: carimbos, espaços vazios e o primeiro selo.
    preparar: async (page) => {
      for (let fase = 0; fase < 3; fase += 1) await lerESeguir(page);
      await page.locator("[data-abrir-passaporte]").click();
      await janela(page, "passaporte");
    },
  },
  {
    nome: "27-jogo-carimbo-com-selo",
    url: "/jogo/lula/?fase=1",
    jogo: true,
    presente: '[data-dialogo="fase"] [data-carimbo="novo"] [data-selo-novo]',
    // A terceira fase concluída, ainda aberta: o carimbo novo, o selo que ele trouxe e a apresentação da fase seguinte.
    preparar: async (page) => {
      await lerESeguir(page);
      await lerESeguir(page);
      await abrirFase(page);
      await page.locator('[data-dialogo="fase"] [data-ver-explicacao]').click();
    },
  },
  {
    nome: "28-jogo-fim-das-trajetorias",
    url: `/jogo/lula/?fase=${ULTIMA.ordem}`,
    jogo: true,
    presente: '[data-dialogo="resumo"] [data-fim-da-trajetoria="todas"]',
    // O registro das duas trajetórias percorridas, quando a passagem já o tem.
    progresso: () => duasTrajetorias ?? [],
    // Na primeira vez, as duas trajetórias são percorridas pela interface, e a tela é aberta de novo com o que o jogo
    // gravou. Daí em diante o caminho é o mesmo: a última fase, já concluída, e o resumo, com a comparação e os aprofundamentos.
    preparar: async (page) => {
      if (duasTrajetorias === null) {
        await percorrerAsDuas(page);
        await page.goto(`${BASE}/jogo/lula/?fase=${ULTIMA.ordem}`);
        await settle(page, { jogo: true });
      }
      await abrirFase(page);
      await page.locator('[data-dialogo="fase"] [data-continuar]').click();
      await janela(page, "resumo");
    },
  },
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

/** Roda na página: quem está com o foco, e se dá para ver. `repetido` diz que o foco voltou a um controle já visitado (o ciclo de uma janela aberta). */
function describeFocus() {
  const el = document.activeElement;
  if (!el || el === document.body || el === document.documentElement) return null;
  const visitados = (window.__focoVisitado ??= new WeakSet());
  const repetido = visitados.has(el);
  visitados.add(el);
  const caixa = el.getBoundingClientRect();
  const estilo = getComputedStyle(el);
  return {
    repetido,
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

/**
 * Abre uma tela: nas do jogo, limpa antes o que ficou no navegador da tela
 * anterior (o progresso e as preferências) e semeia a preferência pedida e,
 * na tela que pede, o progresso que o jogo gravou antes. Depois espera o mapa
 * ou a cena e roda o passo da tela.
 *
 * A limpeza é feita em um documento da mesma origem que não roda o jogo, e a
 * tela é aberta uma vez só. Limpar com a tela já aberta e recarregar apagava
 * também o que ela tinha acabado de gravar: o pedido de leitura que vem pelo
 * endereço vira a preferência guardada e sai do endereço e, sem a preferência,
 * o recarregamento abria a cena, conforme a página terminasse antes ou depois
 * da limpeza. Foi o que reprovou a tela da leitura na verificação contínua do
 * commit f2efc28.
 */
async function open(page, screen) {
  if (screen.jogo) {
    await page.goto(`${BASE}${DOCUMENTO_SEM_JOGO}`);
    await page.evaluate(
      ({ prefixo, chaveDasPreferencias, preferencias, progresso }) => {
        for (const chave of Object.keys(window.localStorage)) if (chave.startsWith(prefixo)) window.localStorage.removeItem(chave);
        if (preferencias) window.localStorage.setItem(chaveDasPreferencias, preferencias);
        for (const [chave, valor] of progresso) window.localStorage.setItem(chave, valor);
      },
      {
        prefixo: "atlas-politico:jogo",
        chaveDasPreferencias: PREFERENCES_KEY,
        // A preferência vai no formato que o jogo grava.
        preferencias: screen.preferencias ? serializePreferences(screen.preferencias) : null,
        // O progresso, quando a tela pede, é o que o próprio jogo gravou antes, nesta passagem.
        progresso: screen.progresso ? screen.progresso() : [],
      },
    );
  }
  const resposta = await page.goto(BASE + screen.url);
  await settle(page, screen);
  if (screen.preparar) {
    await screen.preparar(page);
    await page.waitForTimeout(GUARDA);
  }
  // Por último, a tela tem de parar de mudar sozinha: medir antes disso é medir parte dela.
  const { parou: assentou, ms: espera } = await page.evaluate(untilStill, { quadros: 5, prazo: 15_000 });
  return { resposta, assentou, espera };
}

/**
 * Roda na página: espera a tela parar de mudar por conta própria. Devolve se
 * ela parou dentro do prazo e quantos milissegundos a espera levou.
 *
 * Duas coisas mudam a tela depois de carregada. Em um link com consulta, a
 * área que vai mudar fica encoberta até o endereço ser lido (globals.css,
 * `data-consulta`). E a passagem roda com movimento reduzido: nesse modo a
 * regra do site põe uma transição de 0,01 ms em todo elemento, e uma
 * propriedade herdada que entra em transição, como `visibility`, chega aos
 * descendentes um nível por quadro. A comparação com período aparecia aos
 * poucos, em cerca de 15 quadros, e a medição feita logo depois do
 * carregamento pegava de 17 a 1.541 textos, conforme a largura e o instante.
 * O mesmo vale para o foco: o tamanho de um controle que cresce ao receber o
 * foco só é o final depois da transição.
 */
function untilStill({ quadros, prazo }) {
  return new Promise((resolve) => {
    const inicio = performance.now();
    let parados = 0;
    const responder = (parou) => {
      clearTimeout(reserva);
      resolve({ parou, ms: Math.round(performance.now() - inicio) });
    };
    // Se os quadros pararem de chegar, o prazo ainda vale: sem isto, a espera não terminaria nunca.
    const reserva = setTimeout(() => responder(false), prazo + 2_000);
    const passo = () => {
      const encoberta = document.documentElement.hasAttribute("data-consulta");
      // Transição ou animação com fim, ainda em andamento. `getAnimations` atualiza o estilo antes de responder, e por isso enxerga a do quadro.
      const mudando = document.getAnimations().some((animacao) => animacao.playState === "running" && animacao.effect?.getComputedTiming().endTime !== Infinity);
      parados = encoberta || mudando ? 0 : parados + 1;
      if (parados >= quadros) responder(true);
      else if (performance.now() - inicio > prazo) responder(false);
      else requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  });
}

async function settle(page, screen) {
  await page.waitForLoadState("networkidle");
  if (screen.mapa) {
    // Em tela estreita o mapa fica em outra vista, e não é montado.
    await page.waitForSelector(".maplibregl-canvas, [data-map-fallback]", { timeout: 15_000 }).catch(() => {});
    await page.waitForTimeout(600);
  }
  if (screen.jogo) {
    // A cena do jogo é carregada só no navegador; o progresso salvo entra depois da hidratação. Na leitura sem o cenário não há cena a esperar.
    if (screen.jogo !== "leitura") await page.waitForSelector('[data-palco="pronto"]', { timeout: 15_000 }).catch(() => {});
    await page.waitForSelector('[data-carregado="sim"]', { timeout: 15_000 }).catch(() => {});
    await page.waitForTimeout(400);
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
  jogo: { pergunta: ORIGEM.id, ordenacao: ORDENACAO.id, processos: PROCESSOS.id, decisao: COM_DECISAO.marco.id, ultima: ULTIMA.id },
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
    const { resposta, assentou, espera } = await open(page, screen);
    const medidas = await page.evaluate(measurePage);
    await page.screenshot({ path: path.join(REPORT_DIR, `${screen.nome}--${viewport.sufixo}.png`) });
    // A tela preparada tem de continuar na página até o fim da medição e da captura: medir a tela seguinte sem
    // perceber seria um resultado errado em silêncio.
    if (screen.presente && (await page.locator(screen.presente).count()) === 0) {
      erros.push(`A tela preparada saiu antes do fim da medição (${screen.presente}).`);
    }
    // Pelo mesmo motivo, uma tela que não assentou reprova: a medição seria a de parte dela.
    if (!assentou) erros.push(NAO_ASSENTOU);
    report.telas.push({
      tela: screen.nome,
      url: screen.url,
      largura: `${viewport.width}×${viewport.height}`,
      status: resposta.status(),
      statusEsperado: screen.status ?? 200,
      // Quanto a tela levou para parar de mudar, em milissegundos: uma demora nova aparece aqui antes de estourar o prazo.
      assentouEm: espera,
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

// Ordem de foco pelo teclado, em computador. Com uma janela aberta, o foco
// fica preso nela: a volta ao primeiro controle encerra a passagem.
for (const screen of SCREENS) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  const { assentou } = await open(page, screen);
  const paradas = [];
  // Paradas lidas com o foco ainda em transição: o tamanho anotado não seria o final.
  let inquietas = 0;
  for (let passo = 0; passo < 300; passo += 1) {
    await page.keyboard.press("Tab");
    // O controle que cresce ao receber o foco (o link de pular para o conteúdo) só tem o tamanho final depois da transição.
    if (!(await page.evaluate(untilStill, { quadros: 2, prazo: 2_000 })).parou) inquietas += 1;
    const atual = await page.evaluate(describeFocus);
    // Fim da página (o foco sai para o navegador) ou volta a um controle já visitado (uma janela aberta prende o foco).
    if (atual === null || atual.repetido) break;
    paradas.push(atual);
  }
  // A mesma conferência da medição: a passagem do teclado tem de ser a da tela preparada.
  const mudou = Boolean(screen.presente) && (await page.locator(screen.presente).count()) === 0;
  report.teclado.push({ tela: screen.nome, url: screen.url, paradas, mudou, assentou, inquietas });
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
  const ruim = ruins.length > 0 || item.paradas.length === 0 || item.mudou || !item.assentou || item.inquietas > 0;
  if (ruim) problemas += 1;
  console.log(
    `${ruim ? "FALHA" : "ok   "} ${item.tela.padEnd(31)} teclado: ${item.paradas.length} paradas, ${ruins.length} sem foco visível${item.mudou ? ", a tela preparada saiu durante a passagem" : ""}${item.assentou ? "" : ", a tela não assentou antes da passagem"}${item.inquietas > 0 ? `, ${item.inquietas} parada(s) lida(s) com o foco ainda em transição` : ""}`,
  );
}
console.log(`Capturas e relatório em ${path.relative(process.cwd(), REPORT_DIR)}.`);
if (problemas > 0) {
  console.error(`${problemas} tela(s) com problema. Veja acessibilidade.json.`);
  process.exit(1);
}
