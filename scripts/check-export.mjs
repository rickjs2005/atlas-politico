// Confere a saída estática depois de `npm run build`:
//   1. as páginas previstas foram geradas;
//   2. nenhuma rota de desenvolvimento foi exportada;
//   3. as páginas de acontecimento são exatamente as do conjunto gerado;
//   4. nenhum dado sintético de teste aparece em arquivo algum de `out/`;
//   5. as versões dos retratos estão publicadas;
//   6. os arquivos de segmento têm o nome que o navegador pede, os arquivos do
//      MapLibre que ninguém pede não foram publicados, e toda página pede cedo
//      as mesmas fontes que a entrada (scripts/finalize-export.mjs).
// Sai com código 1 se algo estiver fora do esperado.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const OUT_DIR = path.resolve("out");

const EXPECTED_PAGES = [
  "index.html",
  "404.html",
  "politicos/lula/index.html",
  "politicos/flavio-bolsonaro/index.html",
  "comparar/index.html",
  "metodologia/index.html",
  "jogo/index.html",
  "jogo/lula/index.html",
  "jogo/flavio-bolsonaro/index.html",
];

// Pastas que só existem como rota de desenvolvimento.
const FORBIDDEN_PATHS = ["dev"];

// Marcas presentes em todo registro de tests/fixtures/sintetico.
const SYNTHETIC_MARKERS = ["sintetico-", "SINTÉTICO", "Sintética", "exemplo.invalid"];

const TEXT_EXTENSIONS = new Set([".html", ".js", ".mjs", ".css", ".txt", ".json", ".map", ".xml"]);

function listFiles(dir) {
  return readdirSync(dir).flatMap((nome) => {
    const caminho = path.join(dir, nome);
    return statSync(caminho).isDirectory() ? listFiles(caminho) : [caminho];
  });
}

const problemas = [];

if (!existsSync(OUT_DIR)) {
  console.error("Pasta out/ não encontrada. Rode `npm run build` antes.");
  process.exit(1);
}

for (const pagina of EXPECTED_PAGES) {
  if (!existsSync(path.join(OUT_DIR, pagina))) problemas.push(`Página ausente: ${pagina}`);
}

for (const proibido of FORBIDDEN_PATHS) {
  if (existsSync(path.join(OUT_DIR, proibido))) {
    problemas.push(`Rota de desenvolvimento exportada: ${proibido}/`);
  }
}

// A referência é o que o gerador de dados gravou (docs/DATA-PIPELINE.md): o
// conjunto público e a lista do que ficou fora dele.
const GENERATED_DIR = path.resolve("generated");
const readGenerated = (relativo) => {
  const arquivo = path.join(GENERATED_DIR, relativo);
  if (!existsSync(arquivo)) {
    console.error(`Falta generated/${relativo}. Rode \`npm run build\`, que gera os dados antes.`);
    process.exit(1);
  }
  return JSON.parse(readFileSync(arquivo, "utf8"));
};

// Todo acontecimento publicado tem a sua página.
const publicados = readGenerated("dados/conjunto.json").acontecimentos;
for (const publicado of publicados) {
  if (!existsSync(path.join(OUT_DIR, "acontecimentos", publicado.slug, "index.html"))) {
    problemas.push(`Acontecimento publicado sem página: acontecimentos/${publicado.slug}/`);
  }
}

// O que ficou fora da publicação (rascunho, não revisado) não vira página.
const rascunhos = readGenerated("relatorio/execucao.json").foraDaPublicacao.filter(
  (item) => item.entidade === "acontecimento",
);
for (const rascunho of rascunhos) {
  if (rascunho.slug && existsSync(path.join(OUT_DIR, "acontecimentos", rascunho.slug))) {
    problemas.push(`Rascunho exportado como página: acontecimentos/${rascunho.slug}/`);
  }
}

// Nada além dos publicados tem página de acontecimento.
const pastaDeAcontecimentos = path.join(OUT_DIR, "acontecimentos");
const slugsPublicados = new Set(publicados.map((item) => item.slug));
if (existsSync(pastaDeAcontecimentos)) {
  for (const nome of readdirSync(pastaDeAcontecimentos)) {
    const caminho = path.join(pastaDeAcontecimentos, nome);
    if (statSync(caminho).isDirectory() && !slugsPublicados.has(nome)) {
      problemas.push(`Página de acontecimento fora do conjunto publicado: acontecimentos/${nome}/`);
    }
  }
}

// Os dados gerados não são copiados para a saída: chegam às páginas pelo build.
if (existsSync(path.join(OUT_DIR, "generated"))) {
  problemas.push("A pasta generated/ foi exportada para out/.");
}

// As versões dos retratos que as páginas pedem (docs/PERFORMANCE.md, seção Imagens).
const manifestoDeRetratos = path.resolve("src/lib/media/portraits.manifest.json");
if (!existsSync(manifestoDeRetratos)) {
  problemas.push("Falta o manifesto dos retratos. Rode `npm run images`.");
} else {
  const { imagens } = JSON.parse(readFileSync(manifestoDeRetratos, "utf8"));
  for (const entrada of Object.values(imagens)) {
    for (const [caminho, tamanho] of Object.entries(entrada.arquivos)) {
      const publicado = path.join(OUT_DIR, caminho);
      if (!existsSync(publicado)) problemas.push(`Versão de retrato ausente: ${caminho}`);
      else if (statSync(publicado).size !== tamanho) problemas.push(`Versão de retrato diferente da registrada: ${caminho}`);
    }
  }
}

const arquivos = listFiles(OUT_DIR);
let conferidos = 0;

// Um arquivo de segmento dentro de uma pasta `__next.*` não é encontrado pelo
// navegador, que o pede pelo nome com pontos.
const emPasta = arquivos.filter((arquivo) =>
  path.relative(OUT_DIR, path.dirname(arquivo)).split(path.sep).some((parte) => parte.startsWith("__next.")),
);
if (emPasta.length > 0) {
  problemas.push(
    `${emPasta.length} arquivos de segmento gravados em pastas, como ${path.relative(OUT_DIR, emPasta[0])}. ` +
      "Rode `npm run build`, que termina com scripts/finalize-export.mjs.",
  );
}

// Só o worker do MapLibre é pedido pelo navegador; o resto do pacote não deve ser publicado.
const semUso = arquivos
  .map((arquivo) => path.basename(arquivo))
  .filter((nome) => /^maplibre-gl(-dev|-worker-dev|-shared|-shared-dev)?\.[^.]+\.mjs$/.test(nome));
if (semUso.length > 0) problemas.push(`Arquivos do MapLibre sem uso na saída: ${semUso.join(", ")}`);

// Toda página pede cedo as mesmas fontes que a entrada. As de acontecimento
// saem do Next sem essa ligação, e o ajuste da saída a completa.
const daEntrada = existsSync(path.join(OUT_DIR, "index.html"))
  ? (readFileSync(path.join(OUT_DIR, "index.html"), "utf8").match(/<link rel="preload"[^>]*\bas="font"[^>]*>/g) ?? [])
  : [];
if (daEntrada.length > 0) {
  const semFonte = arquivos.filter((arquivo) => {
    if (!arquivo.endsWith(".html")) return false;
    const html = readFileSync(arquivo, "utf8");
    return !daEntrada.every((ligacao) => html.includes(ligacao));
  });
  if (semFonte.length > 0) {
    problemas.push(
      `${semFonte.length} páginas sem o pré-carregamento das fontes, como ${path.relative(OUT_DIR, semFonte[0])}. ` +
        "Rode `npm run build`, que termina com scripts/finalize-export.mjs.",
    );
  }
}

for (const arquivo of arquivos) {
  if (!TEXT_EXTENSIONS.has(path.extname(arquivo))) continue;
  conferidos += 1;
  const conteudo = readFileSync(arquivo, "utf8");
  for (const marca of SYNTHETIC_MARKERS) {
    if (conteudo.includes(marca)) {
      problemas.push(`Dado sintético ("${marca}") em ${path.relative(OUT_DIR, arquivo)}`);
    }
  }
}

if (problemas.length > 0) {
  console.error(`Saída estática com ${problemas.length} problema(s):`);
  for (const problema of problemas) console.error(`  - ${problema}`);
  process.exit(1);
}

const paginas = arquivos.filter((arquivo) => arquivo.endsWith(".html")).length;
console.log(
  `Saída estática conferida: ${arquivos.length} arquivos, ${paginas} páginas HTML, ` +
    `${conferidos} arquivos de texto sem dados sintéticos e sem rotas de desenvolvimento. ` +
    `${publicados.length} acontecimentos publicados com página, ${rascunhos.length} rascunhos sem página.`,
);
