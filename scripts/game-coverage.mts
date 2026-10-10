// Gera docs/GAME-COVERAGE.md, a matriz acontecimento → personagem → capítulo
// do jogo, a partir dos dados publicados e de src/lib/game/chapters.ts.
//
//   npm run game:coverage            escreve o arquivo
//   npm run game:coverage -- --check confere se está em dia; não escreve
//
// Código de saída: 0 quando deu certo, 1 quando o arquivo está desatualizado
// (com --check) ou quando há acontecimento sem capítulo e sem justificativa.

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { readSources, resolvePaths } from "@/lib/content/sources";
import { PROFILES } from "@/lib/domain/profiles";
import { renderCoverage, uncovered } from "@/lib/game/coverage";
import { buildAtlasData } from "@/lib/publication/build";

const SAIDA = path.resolve("docs/GAME-COVERAGE.md");
const check = process.argv.includes("--check");

const construcao = buildAtlasData(readSources(resolvePaths()));
if (construcao.data === null) {
  console.error("Os dados publicados não validam; rode `npm run data:validate`.");
  process.exit(1);
}
const data = construcao.data;

let faltas = 0;
for (const perfil of PROFILES) {
  for (const linha of uncovered(data, perfil.slug)) {
    faltas += 1;
    console.error(`${perfil.slug}: ${linha.eventId} (${linha.data}) não está em capítulo nem em EXCLUSIONS.`);
  }
}

const texto = renderCoverage(data);
if (check) {
  let atual = "";
  try {
    atual = readFileSync(SAIDA, "utf8");
  } catch {
    // sem arquivo: desatualizado
  }
  if (atual !== texto) {
    console.error(`${path.relative(process.cwd(), SAIDA)} está desatualizado. Rode \`npm run game:coverage\`.`);
    process.exit(1);
  }
  console.log(`${path.relative(process.cwd(), SAIDA)} está em dia.`);
} else {
  writeFileSync(SAIDA, texto);
  console.log(`Gravado em ${path.relative(process.cwd(), SAIDA)}.`);
}
process.exit(faltas > 0 ? 1 : 0);
