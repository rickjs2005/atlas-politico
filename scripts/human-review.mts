// Gera docs/HUMAN-REVIEW.md, a lista do que precisa de revisão humana,
// trecho a trecho, a partir dos dados publicados.
//
//   npm run review:human            escreve o arquivo
//   npm run review:human -- --check confere se está em dia; não escreve
//
// Código de saída: 0 quando deu certo, 1 quando o arquivo está desatualizado
// (com --check).

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { readSources, resolvePaths } from "@/lib/content/sources";
import { renderHumanReview } from "@/lib/editorial/human-review";
import { buildAtlasData } from "@/lib/publication/build";

const SAIDA = path.resolve("docs/HUMAN-REVIEW.md");
const check = process.argv.includes("--check");

const construcao = buildAtlasData(readSources(resolvePaths()));
if (construcao.data === null) {
  console.error("Os dados publicados não validam; rode `npm run data:validate`.");
  process.exit(1);
}
const texto = renderHumanReview(construcao.data);
if (check) {
  let atual = "";
  try {
    atual = readFileSync(SAIDA, "utf8");
  } catch {
    // sem arquivo: desatualizado
  }
  if (atual !== texto) {
    console.error(`${path.relative(process.cwd(), SAIDA)} está desatualizado. Rode \`npm run review:human\`.`);
    process.exit(1);
  }
  console.log(`${path.relative(process.cwd(), SAIDA)} está em dia.`);
} else {
  writeFileSync(SAIDA, texto);
  console.log(`Gravado em ${path.relative(process.cwd(), SAIDA)}.`);
}
