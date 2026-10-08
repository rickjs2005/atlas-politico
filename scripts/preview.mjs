// Serve a pasta `out/` como uma hospedagem de arquivos estáticos serviria:
// `index.html` por pasta, `404.html` com status 404 e nenhuma regra extra.
// Uso: `npm run build` e depois `npm run preview` (porta 4311, ou PORT).

import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";

const OUT_DIR = path.resolve("out");
const PORT = Number(process.env.PORT ?? 4311);

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".geojson": "application/geo+json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

if (!existsSync(OUT_DIR)) {
  console.error("Pasta out/ não encontrada. Rode `npm run build` antes.");
  process.exit(1);
}

function resolveFile(pathname) {
  const destino = path.join(OUT_DIR, decodeURIComponent(pathname));
  // Nada fora de out/ é servido, mesmo com `..` no endereço.
  if (destino !== OUT_DIR && !destino.startsWith(OUT_DIR + path.sep)) return null;
  if (existsSync(destino) && statSync(destino).isFile()) return destino;
  const indice = path.join(destino, "index.html");
  return existsSync(indice) ? indice : null;
}

function send(response, status, arquivo) {
  response.writeHead(status, {
    "Content-Type": MIME_TYPES[path.extname(arquivo)] ?? "application/octet-stream",
  });
  createReadStream(arquivo).pipe(response);
}

createServer((request, response) => {
  const { pathname } = new URL(request.url ?? "/", "http://localhost");
  let arquivo = null;
  try {
    arquivo = resolveFile(pathname);
  } catch {
    // endereço malformado: cai no 404
  }

  if (arquivo) send(response, 200, arquivo);
  else send(response, 404, path.join(OUT_DIR, "404.html"));

  console.log(`${arquivo ? 200 : 404} ${pathname}`);
}).listen(PORT, () => {
  console.log(`Saída estática em http://localhost:${PORT}/ (Ctrl+C para encerrar)`);
});
