// Gera docs/GAME-COVERAGE.md, a matriz de cobertura do jogo: as fases de cada
// pessoa e, para cada acontecimento, decisão, fato biográfico e proposta
// publicados, em que fase aparece. Parte dos dados publicados (as fases vêm de
// content/published/fasesDoJogo.json) e de src/lib/game/presentation.ts.
//
//   npm run game:coverage            escreve o arquivo
//   npm run game:coverage -- --check confere se está em dia; não escreve
//
// Código de saída: 0 quando deu certo, 1 quando o arquivo está desatualizado
// (com --check) ou quando há acontecimento ou decisão sem fase e sem
// justificativa, ou área com proposta publicada e nenhuma em fase.

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { readSources, resolvePaths } from "@/lib/content/sources";
import { PROFILES } from "@/lib/domain/profiles";
import { renderCoverage, uncovered, uncoveredDecisions, uncoveredProposalAreas } from "@/lib/game/coverage";
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
    console.error(`${perfil.slug}: ${linha.eventId} (${linha.data}) não está em fase nenhuma nem em EXCLUSIONS.`);
  }
  for (const linha of uncoveredDecisions(data, perfil.slug)) {
    faltas += 1;
    console.error(`${perfil.slug}: a decisão ${linha.decisaoId} (${linha.data}) não está em fase nenhuma nem em DECISION_EXCLUSIONS.`);
  }
  for (const area of uncoveredProposalAreas(data, perfil.slug)) {
    faltas += 1;
    console.error(`${perfil.slug}: a área ${area} tem proposta publicada e nenhuma em fase.`);
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
