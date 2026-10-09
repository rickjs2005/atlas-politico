import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

// Duas extensões de página são condicionais (ver docs/DECISIONS.md, D-06 e D-07):
//
//   page.dev.tsx        só é rota no servidor de desenvolvimento. É como a tela
//                       de prova técnica e as fixtures sintéticas que ela
//                       importa ficam fora do grafo do build de produção.
//   page.published.tsx  só é rota quando os dados gerados têm ao menos um
//                       acontecimento. A exportação estática recusa rota
//                       dinâmica cujo generateStaticParams devolve lista vazia.
const BASE_PAGE_EXTENSIONS = ["tsx", "ts"];
const DEV_PAGE_EXTENSION = "dev.tsx";
const PUBLISHED_PAGE_EXTENSION = "published.tsx";

// Lê o manifesto que `npm run data:build` grava (docs/DATA-PIPELINE.md). Os
// comandos `dev` e `build` geram os dados antes de o Next ler esta
// configuração.
function hasPublishedEvents(): boolean {
  const manifesto = path.join(process.cwd(), "generated", "manifest.json");
  if (!existsSync(manifesto)) return false;
  try {
    const { contagens } = JSON.parse(readFileSync(manifesto, "utf8")) as {
      contagens?: { acontecimentos?: unknown };
    };
    return typeof contagens?.acontecimentos === "number" && contagens.acontecimentos > 0;
  } catch {
    // Manifesto ilegível: a leitura dos dados acusa o erro em qualquer página.
    return false;
  }
}

export default function nextConfig(phase: string): NextConfig {
  const pageExtensions = [...BASE_PAGE_EXTENSIONS];
  if (hasPublishedEvents()) pageExtensions.unshift(PUBLISHED_PAGE_EXTENSION);
  if (phase === PHASE_DEVELOPMENT_SERVER) pageExtensions.unshift(DEV_PAGE_EXTENSION);

  return {
    // Saída estática em `out/`. `cacheComponents` fica desligado: a
    // documentação do Next 16.4 marca `use cache` como não suportado em
    // exportação estática (ver docs/DECISIONS.md, D-02).
    output: "export",
    // `/rota` vira `out/rota/index.html`, formato que qualquer hospedagem de
    // arquivos serve sem regra de reescrita.
    trailingSlash: true,
    // Sem servidor não há otimização de imagem em tempo de execução; as
    // imagens serão preparadas localmente antes do build (fase 8).
    images: { unoptimized: true },
    reactStrictMode: true,
    pageExtensions,
    turbopack: {
      rules: {
        "*.css": {
          loaders: ["@tailwindcss/turbopack"],
          as: "*.css",
        },
      },
    },
  };
}
