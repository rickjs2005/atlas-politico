// O pedido do pacote do MapLibre, para os testes que o bloqueiam ou atrasam.
//
// No servidor de desenvolvimento o arquivo leva o nome da biblioteca. Na saída
// estática o nome é um código que muda a cada build: ali os pacotes são
// reconhecidos pelo conteúdo. O mesmo teste serve aos dois ambientes
// (`npm run test:e2e` e `npm run test:journeys`).

import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const DEV_NAME = "maplibre-gl.*\\.js(\\?|$)";

function builtChunks(): string[] {
  const dir = path.resolve(process.env.OUT_DIR ?? "out", "_next", "static", "chunks");
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(
    (nome) => nome.endsWith(".js") && readFileSync(path.join(dir, nome), "utf8").includes("maplibregl-canvas"),
  );
}

const escape = (texto: string) => texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Casa com o pacote do mapa nos dois ambientes. Use em `page.route`. */
export const MAP_PACKAGE = new RegExp(
  [DEV_NAME, ...builtChunks().map((nome) => `/_next/static/chunks/${escape(nome)}(\\?|$)`)].join("|"),
);
