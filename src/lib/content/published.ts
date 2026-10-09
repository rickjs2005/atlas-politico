// Acesso das páginas aos dados públicos. As páginas não leem `content/`: leem
// só o que o gerador validou e gravou em `generated/`.
//
// `server-only` faz o build falhar se um componente do navegador importar este
// módulo: a leitura de arquivos e o Zod ficam do lado do build.

import "server-only";

import type { AtlasData } from "@/lib/data/types";

import { GeneratedDataError, readGenerated } from "./output";
import { InvalidContentError, runBuild } from "./pipeline";
import { fingerprintSources, readSources, resolvePaths } from "./sources";

let memo: AtlasData | undefined;

/**
 * Os dados gerados, conferidos contra o manifesto e contra o conteúdo atual.
 *
 * No build de produção, saída ausente, alterada ou gerada a partir de outra
 * versão do conteúdo interrompe o build: nunca se publica com dados antigos.
 * Quem gera é `npm run data:build`, que o `npm run build` chama antes.
 *
 * No servidor de desenvolvimento, a mesma situação regenera os dados na hora,
 * para uma edição no conteúdo aparecer ao recarregar a página. Com erro no
 * conteúdo, a página mostra os diagnósticos.
 */
export function getAtlasData(): AtlasData {
  const producao = process.env.NODE_ENV === "production";
  // No build todas as páginas leem o mesmo conjunto, então uma leitura basta.
  if (producao && memo) return memo;

  const paths = resolvePaths();
  const entrada = fingerprintSources(readSources(paths));

  try {
    memo = readGenerated(paths.outDir, entrada).data;
  } catch (erro) {
    if (producao || !(erro instanceof GeneratedDataError)) throw erro;

    const { resultado } = runBuild(paths);
    if (!resultado.ok) throw new InvalidContentError(resultado.diagnostics);
    memo = readGenerated(paths.outDir, entrada).data;
  }
  return memo;
}
