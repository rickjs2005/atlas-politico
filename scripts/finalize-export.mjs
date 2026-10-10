// Acerta a saída estática depois de `next build` (docs/PERFORMANCE.md, seção Build).
// Roda como último passo de `npm run build`.
//
// 1. Arquivos de segmento. O Next grava, para cada página, os trechos que o
//    roteador pré-carrega ao ver um link, e o navegador os pede com o caminho
//    do segmento escrito com pontos: `__next.politicos.$d$slug.__PAGE__.txt`.
//    No Windows, a exportação do Next 16.4 grava esse mesmo caminho com as
//    barras do sistema, e o arquivo vai parar em pastas
//    (`__next.politicos/$d$slug/__PAGE__.txt`). O pedido dá 404 em qualquer
//    hospedagem de arquivos, e a navegação cai no carregamento da página
//    inteira. Aqui os arquivos voltam ao nome que o navegador pede. Em um
//    build feito no Linux ou no macOS não há o que mover.
//
// 2. Arquivos do MapLibre que ninguém pede. O pacote procura o próprio worker
//    com um endereço montado em tempo de execução, e por isso o bundler publica
//    a pasta `dist` inteira: as versões de desenvolvimento, a cópia do pacote
//    principal e a folha de estilo, que já estão nos pacotes do site. O atlas
//    informa o endereço do worker (`setWorkerUrl`), e esse é o único arquivo
//    de lá que o navegador busca.
//
// 3. Pré-carregamento das fontes nas páginas de acontecimento, que o Next
//    deixa de fora por causa da extensão condicional da rota (ver abaixo).

import { existsSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const OUT_DIR = path.resolve(process.env.OUT_DIR ?? "out");
const MEDIA_DIR = path.join(OUT_DIR, "_next", "static", "media");

if (!existsSync(OUT_DIR)) {
  console.error("Pasta out/ não encontrada. Este passo roda depois de `next build`.");
  process.exit(1);
}

function walk(dir, visit) {
  for (const nome of readdirSync(dir)) {
    const caminho = path.join(dir, nome);
    if (statSync(caminho).isDirectory()) {
      // `visit` devolve `false` para não descer na pasta.
      if (visit(caminho, true) !== false) walk(caminho, visit);
    } else {
      visit(caminho, false);
    }
  }
}

function listFiles(dir) {
  const arquivos = [];
  walk(dir, (caminho, pasta) => {
    if (!pasta) arquivos.push(caminho);
  });
  return arquivos;
}

// --- 1. arquivos de segmento -------------------------------------------------

const pastasDeSegmento = [];
walk(OUT_DIR, (caminho, pasta) => {
  if (pasta && path.basename(caminho).startsWith("__next.")) {
    pastasDeSegmento.push(caminho);
    return false;
  }
  return undefined;
});

let movidos = 0;
for (const pasta of pastasDeSegmento) {
  for (const arquivo of listFiles(pasta)) {
    const partes = path.relative(pasta, arquivo).split(path.sep);
    const destino = path.join(path.dirname(pasta), [path.basename(pasta), ...partes].join("."));
    if (existsSync(destino)) {
      console.error(`Já existe um arquivo em ${path.relative(OUT_DIR, destino)}: nada foi movido para lá.`);
      process.exit(1);
    }
    renameSync(arquivo, destino);
    movidos += 1;
  }
  rmSync(pasta, { recursive: true });
}

// --- 2. arquivos do MapLibre sem uso -----------------------------------------

// O worker que o atlas informa ao MapLibre (src/features/map/MapCanvas.tsx).
const WORKER = /^maplibre-gl-worker\.[^.]+\.mjs$/;
// O resto da pasta `dist` do pacote.
const UNUSED = [
  /^maplibre-gl-dev\.[^.]+\.mjs$/,
  /^maplibre-gl-worker-dev\.[^.]+\.mjs$/,
  /^maplibre-gl-shared(-dev)?\.[^.]+\.mjs$/,
  /^maplibre-gl\.[^.]+\.mjs$/,
  /^maplibre-gl\.css\.[^.]+\.css$/,
];

let removidos = 0;
let bytes = 0;
if (existsSync(MEDIA_DIR)) {
  const nomes = readdirSync(MEDIA_DIR);
  const semUso = nomes.filter((nome) => UNUSED.some((padrao) => padrao.test(nome)));

  if (semUso.length > 0) {
    if (!nomes.some((nome) => WORKER.test(nome))) {
      console.error("O worker do MapLibre não está na saída: os arquivos vizinhos não foram removidos.");
      process.exit(1);
    }
    // Um pacote JavaScript cita esses nomes na tabela que o bundler monta para
    // o endereço dinâmico. Página, estilo ou dado que cite um deles é sinal de
    // que ele passou a ser usado: nesse caso, nada é removido.
    const textos = listFiles(OUT_DIR).filter((arquivo) => /\.(html|css|txt|json)$/.test(arquivo));
    const citado = semUso.find((nome) => textos.some((arquivo) => readFileSync(arquivo, "utf8").includes(nome)));
    if (citado) {
      console.error(`O arquivo ${citado} é citado por uma página: revise scripts/finalize-export.mjs.`);
      process.exit(1);
    }
    for (const nome of semUso) {
      const arquivo = path.join(MEDIA_DIR, nome);
      bytes += statSync(arquivo).size;
      rmSync(arquivo);
      removidos += 1;
    }
  }
}

// --- 3. pré-carregamento das fontes nas páginas de acontecimento --------------

// O Next põe no `<head>` de cada página o pré-carregamento das fontes que ela
// usa, pelo nome do arquivo da rota. A rota dos acontecimentos tem uma
// extensão condicional (`page.published.tsx`, docs/DECISIONS.md, D-06), o nome
// não bate com o do registro de fontes, e as páginas saem sem a ligação: a
// fonte só é descoberta depois da folha de estilo. Aqui elas recebem as mesmas
// ligações das outras páginas.
const FONT_PRELOAD = /<link rel="preload"[^>]*\bas="font"[^>]*>/g;
const referencia = path.join(OUT_DIR, "index.html");
const ligacoes = existsSync(referencia) ? (readFileSync(referencia, "utf8").match(FONT_PRELOAD) ?? []) : [];

let comFontes = 0;
if (ligacoes.length > 0) {
  for (const pagina of listFiles(OUT_DIR).filter((arquivo) => arquivo.endsWith(".html"))) {
    const html = readFileSync(pagina, "utf8");
    if (FONT_PRELOAD.test(html)) {
      FONT_PRELOAD.lastIndex = 0;
      continue;
    }
    FONT_PRELOAD.lastIndex = 0;
    // Antes da folha de estilo, como nas outras páginas.
    const ponto = html.indexOf('<link rel="stylesheet"');
    if (ponto === -1) continue;
    writeFileSync(pagina, html.slice(0, ponto) + ligacoes.join("") + html.slice(ponto));
    comFontes += 1;
  }
}

const partes = [];
if (comFontes > 0) partes.push(`${comFontes} páginas receberam o pré-carregamento das fontes`);
partes.push(
  movidos > 0
    ? `${movidos} arquivos de segmento renomeados para o caminho que o navegador pede`
    : "arquivos de segmento já no lugar",
);
partes.push(
  removidos > 0
    ? `${removidos} arquivos do MapLibre sem uso removidos (${(bytes / 1024 / 1024).toFixed(1)} MB)`
    : "nenhum arquivo do MapLibre a remover",
);
console.log(`Saída estática ajustada: ${partes.join("; ")}.`);
