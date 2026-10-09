// Deixa os scripts de dados carregarem o TypeScript do projeto direto no Node,
// sem compilar e sem dependência extra (docs/DECISIONS.md, D-27).
//
// O Node remove os tipos sozinho, mas não conhece duas convenções que o Next e
// o Vitest resolvem pelo bundler: o alias "@/" (pasta src) e o import relativo
// sem extensão. Este gancho resolve só esses dois casos, e só para arquivos do
// projeto; pacotes de node_modules seguem o caminho normal do Node.
//
// Uso: node --import ./scripts/register.mjs scripts/data.mts <comando>

import { existsSync, statSync } from "node:fs";
import { registerHooks } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SRC_DIR = fileURLToPath(new URL("../src/", import.meta.url));
const SUFFIXES = ["", ".ts", ".mts", "/index.ts"];
const NODE_MODULES = `${path.sep}node_modules${path.sep}`;

function findFile(base) {
  for (const sufixo of SUFFIXES) {
    const candidato = base + sufixo;
    if (existsSync(candidato) && statSync(candidato).isFile()) return candidato;
  }
  return null;
}

function localBase(specifier, parentURL) {
  if (specifier.startsWith("@/")) return path.join(SRC_DIR, specifier.slice(2));

  const relativo = specifier.startsWith("./") || specifier.startsWith("../");
  if (!relativo || !parentURL?.startsWith("file:")) return null;

  const origem = fileURLToPath(parentURL);
  if (origem.includes(NODE_MODULES)) return null;
  return path.resolve(path.dirname(origem), specifier);
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    const base = localBase(specifier, context.parentURL);
    const arquivo = base === null ? null : findFile(base);
    if (arquivo === null) return nextResolve(specifier, context);

    return {
      url: pathToFileURL(arquivo).href,
      shortCircuit: true,
      // Sem "type" no package.json, o Node tentaria ler `.ts` como CommonJS.
      format: arquivo.endsWith(".ts") ? "module-typescript" : undefined,
    };
  },
});
