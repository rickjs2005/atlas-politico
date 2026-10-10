// A barreira de release (docs/DEPLOY.md): recusa a publicação enquanto a
// política editorial ou a configuração pública não estiverem atendidas.
//
//   npm run verify:release
//
// Código de saída: 0 quando nada bloqueia (avisos não bloqueiam), 1 quando
// alguma condição não está atendida, com o diagnóstico. Não mexe em nada: o
// build de desenvolvimento (`npm run check`) continua possível com o conteúdo
// ainda em conferência.

import { existsSync } from "node:fs";
import path from "node:path";

import { readSources, resolvePaths } from "@/lib/content/sources";
import { isReleasable, releaseIssues } from "@/lib/editorial/release";
import { buildAtlasData } from "@/lib/publication/build";
import { SITE } from "@/lib/site";

const construcao = buildAtlasData(readSources(resolvePaths()));
if (construcao.data === null) {
  console.error("Os dados publicados não validam; rode `npm run data:validate`.");
  process.exit(1);
}

const issues = releaseIssues(construcao.data.conjunto, SITE, { licenca: existsSync(path.resolve("LICENSE")) });
for (const issue of issues) {
  console.log(`${issue.nivel === "bloqueia" ? "BLOQUEIA" : "aviso   "}  ${issue.caminho}: ${issue.mensagem}`);
}

const bloqueios = issues.filter((issue) => issue.nivel === "bloqueia").length;
const avisos = issues.length - bloqueios;
if (!isReleasable(issues)) {
  console.error(`\nRelease recusada: ${bloqueios} ${bloqueios === 1 ? "condição não atendida" : "condições não atendidas"}${avisos > 0 ? ` e ${avisos} ${avisos === 1 ? "aviso" : "avisos"}` : ""}.`);
  process.exit(1);
}
console.log(`\nNada bloqueia a release pela régua da política.${avisos > 0 ? ` ${avisos === 1 ? "Há um aviso" : `Há ${avisos} avisos`} acima, que são decisões do responsável.` : ""}`);
