// Acesso das páginas ao conjunto publicado. `server-only` faz o build falhar
// se um componente do navegador importar este módulo: a leitura de arquivos e
// o Zod ficam do lado do build.

import "server-only";

import path from "node:path";

import { loadPublishedSet, type ConjuntoPublicado } from "./load";

const PUBLISHED_DIR = path.join(process.cwd(), "content", "published");

let memo: ConjuntoPublicado | undefined;

export function getPublishedSet(): ConjuntoPublicado {
  // No build todas as páginas leem o mesmo conjunto, então uma leitura basta.
  // Em desenvolvimento relê a cada chamada para refletir edições no conteúdo.
  if (process.env.NODE_ENV === "production" && memo) return memo;
  memo = loadPublishedSet(PUBLISHED_DIR);
  return memo;
}
