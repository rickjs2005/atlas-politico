// Confere a saída estática depois de `npm run build`:
//   1. as páginas previstas foram geradas;
//   2. nenhuma rota de desenvolvimento foi exportada;
//   3. nenhum dado sintético de teste aparece em arquivo algum de `out/`.
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

const arquivos = listFiles(OUT_DIR);
let conferidos = 0;

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
    `${conferidos} arquivos de texto sem dados sintéticos e sem rotas de desenvolvimento.`,
);
