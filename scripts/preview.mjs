// Serve a pasta `out/` como uma hospedagem de arquivos estáticos serviria:
// `index.html` por pasta, `404.html` com status 404, compressão gzip dos
// arquivos de texto, validadores de cache (`ETag`, com resposta 304) e cache
// longo para os arquivos de `/_next/static/`, que têm o nome marcado pelo
// conteúdo. Nenhuma regra de reescrita.
// Uso: `npm run build` e depois `npm run preview` (porta 4311, ou PORT).
//
// Variáveis de ambiente, usadas pelas medições e pelas capturas (docs/PERFORMANCE.md):
//   PORT      porta do servidor (4311)
//   OUT_DIR   pasta servida (out)
//   QUIET     com qualquer valor, não imprime uma linha por pedido

import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { gzipSync } from "node:zlib";

const OUT_DIR = path.resolve(process.env.OUT_DIR ?? "out");
const PORT = Number(process.env.PORT ?? 4311);
const QUIET = Boolean(process.env.QUIET);

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

// O que uma hospedagem comum comprime. Imagens e fontes já chegam comprimidas.
const COMPRESSIBLE = new Set([".html", ".js", ".mjs", ".css", ".json", ".geojson", ".txt", ".svg"]);

if (!existsSync(OUT_DIR)) {
  console.error(`Pasta ${path.relative(process.cwd(), OUT_DIR) || OUT_DIR} não encontrada. Rode \`npm run build\` antes.`);
  process.exit(1);
}

function resolveFile(pathname) {
  const destino = path.join(OUT_DIR, decodeURIComponent(pathname));
  // Nada fora da pasta é servido, mesmo com `..` no endereço.
  if (destino !== OUT_DIR && !destino.startsWith(OUT_DIR + path.sep)) return null;
  if (existsSync(destino) && statSync(destino).isFile()) return destino;
  const indice = path.join(destino, "index.html");
  return existsSync(indice) ? indice : null;
}

// A compressão e a marca de cada arquivo são calculadas uma vez e guardadas:
// a pasta não muda enquanto o servidor está de pé.
const compressed = new Map();
const etags = new Map();

function gzipped(arquivo, conteudo) {
  let pronto = compressed.get(arquivo);
  if (!pronto) {
    pronto = gzipSync(conteudo);
    compressed.set(arquivo, pronto);
  }
  return pronto;
}

/** Marca do arquivo, pelo conteúdo: o navegador reaproveita o que já tem. */
function etagOf(arquivo, conteudo) {
  let marca = etags.get(arquivo);
  if (!marca) {
    marca = `"${createHash("sha1").update(conteudo).digest("hex").slice(0, 20)}"`;
    etags.set(arquivo, marca);
  }
  return marca;
}

function send(request, response, status, arquivo, pathname) {
  const extensao = path.extname(arquivo);
  const conteudo = readFileSync(arquivo);
  const etag = etagOf(arquivo, conteudo);
  // Nome marcado pelo conteúdo: o arquivo nunca muda sob o mesmo endereço.
  const imutavel = status === 200 && pathname.startsWith("/_next/static/");
  const cache = {
    ETag: etag,
    "Cache-Control": imutavel ? "public, max-age=31536000, immutable" : "public, max-age=0, must-revalidate",
  };

  if (status === 200 && request.headers["if-none-match"] === etag) {
    response.writeHead(304, cache);
    response.end();
    return;
  }

  const aceita = String(request.headers["accept-encoding"] ?? "")
    .split(",")
    .some((codificacao) => codificacao.trim().startsWith("gzip"));
  const comprime = aceita && COMPRESSIBLE.has(extensao) && conteudo.length > 1024;
  const corpo = comprime ? gzipped(arquivo, conteudo) : conteudo;

  response.writeHead(status, {
    "Content-Type": MIME_TYPES[extensao] ?? "application/octet-stream",
    "Content-Length": corpo.length,
    ...cache,
    ...(comprime ? { "Content-Encoding": "gzip", Vary: "Accept-Encoding" } : {}),
  });
  response.end(request.method === "HEAD" ? undefined : corpo);
}

createServer((request, response) => {
  const { pathname } = new URL(request.url ?? "/", "http://localhost");
  let arquivo = null;
  try {
    arquivo = resolveFile(pathname);
  } catch {
    // endereço malformado: cai no 404
  }

  if (arquivo) send(request, response, 200, arquivo, pathname);
  else send(request, response, 404, path.join(OUT_DIR, "404.html"), pathname);

  if (!QUIET) console.log(`${arquivo ? 200 : 404} ${pathname}`);
}).listen(PORT, () => {
  console.log(`Saída estática em http://localhost:${PORT}/ (Ctrl+C para encerrar)`);
});
