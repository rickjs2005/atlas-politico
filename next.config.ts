import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

// Duas extensões de página são condicionais (ver docs/DECISIONS.md, D-06 e D-07):
//
//   page.dev.tsx        só é rota no servidor de desenvolvimento. É como a tela
//                       de prova técnica e as fixtures sintéticas que ela
//                       importa ficam fora do grafo do build de produção.
//   page.published.tsx  só é rota quando o conjunto publicado tem ao menos um
//                       acontecimento. A exportação estática recusa rota
//                       dinâmica cujo generateStaticParams devolve lista vazia.
const BASE_PAGE_EXTENSIONS = ["tsx", "ts"];
const DEV_PAGE_EXTENSION = "dev.tsx";
const PUBLISHED_PAGE_EXTENSION = "published.tsx";

function hasPublishedEvents(): boolean {
  const arquivo = path.join(process.cwd(), "content", "published", "acontecimentos.json");
  if (!existsSync(arquivo)) return false;
  try {
    const lista: unknown = JSON.parse(readFileSync(arquivo, "utf8").replace(/^﻿/, ""));
    return Array.isArray(lista) && lista.length > 0;
  } catch {
    // JSON ilegível: a validação de conteúdo acusa o erro em qualquer página.
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
