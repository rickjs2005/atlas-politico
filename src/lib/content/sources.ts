// Leitura das fontes editoriais. É o único ponto do projeto que abre os
// arquivos de `content/`: lê as duas pastas como estão, sem validar, e entrega
// ao pipeline (`src/lib/publication`), que decide o que é erro.
//
// Contrato das pastas:
//   content/published/  edicao.json e uma lista por coleção (pessoas, mandatos,
//                       filiacoes, acontecimentos, lugares, fontes, imagens);
//   content/drafts/     as mesmas listas, parciais, e importacoes.json.
// Arquivo ausente é lista vazia. Qualquer outro `.json` é erro, para um nome
// digitado errado não virar uma coleção vazia em silêncio.

import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import type { Diagnostic } from "@/lib/publication/diagnostics";
import {
  COLECOES,
  EDITION_FILE,
  IMPORT_LOG_FILE,
  ENTIDADE_DA_COLECAO,
  emptySources,
  isColecao,
  type Pasta,
  type SourceFile,
  type Sources,
} from "@/lib/publication/sources";
import { canonicalJson } from "@/lib/publication/stable-json";

import { probeMedia } from "./media";

/** Versão do formato dos dados gerados. Muda quando o formato da saída muda. */
export const FORMAT_VERSION = 1;

export interface ProjectPaths {
  /** Raiz do projeto: os caminhos dos diagnósticos são escritos a partir dela. */
  root: string;
  publishedDir: string;
  draftsDir: string;
  /** Pasta `public/`, onde ficam os arquivos das imagens cadastradas. */
  publicDir: string;
  /** Pasta controlada pelo gerador. */
  outDir: string;
  /** Registro dos trechos conferidos, lido só pelo relatório. */
  evidenceDir: string;
}

export function resolvePaths(
  root: string = process.cwd(),
  overrides: Partial<Omit<ProjectPaths, "root">> = {},
): ProjectPaths {
  const base = path.resolve(root);
  return {
    root: base,
    publishedDir: path.join(base, "content", "published"),
    draftsDir: path.join(base, "content", "drafts"),
    publicDir: path.join(base, "public"),
    outDir: path.join(base, "generated"),
    evidenceDir: path.join(base, "docs", "evidencias"),
    ...overrides,
  };
}

/** Caminho como aparece nos diagnósticos: a partir da raiz, com barras normais. */
export function displayPath(paths: Pick<ProjectPaths, "root">, alvo: string): string {
  return path.relative(paths.root, alvo).split(path.sep).join("/") || ".";
}

/** Lê um JSON aceitando o BOM que o PowerShell costuma gravar no começo do arquivo. */
export function parseJsonFile(arquivo: string): unknown {
  return JSON.parse(readFileSync(arquivo, "utf8").replace(/^﻿/, ""));
}

const MEDIA_PATH = /^\/media\/[a-z0-9/_-]+\.[a-z0-9]+$/;

export function readSources(paths: ProjectPaths): Sources {
  const sources = emptySources({
    published: displayPath(paths, paths.publishedDir),
    drafts: displayPath(paths, paths.draftsDir),
  });

  const readFolder = (pasta: Pasta, dir: string) => {
    if (!existsSync(dir)) return;
    const nomes = readdirSync(dir)
      .filter((nome) => nome.endsWith(".json"))
      .sort();

    for (const nome of nomes) {
      const arquivo = displayPath(paths, path.join(dir, nome));
      const problema = (codigo: Diagnostic["codigo"], mensagem: string) =>
        sources.problemas.push({
          severidade: "erro",
          codigo,
          arquivo,
          entidade: null,
          id: null,
          campo: null,
          mensagem,
        });

      const colecao = nome.slice(0, -".json".length);
      const esperado =
        isColecao(colecao) ||
        (pasta === "published" && nome === EDITION_FILE) ||
        (pasta === "drafts" && nome === IMPORT_LOG_FILE);
      if (!esperado) {
        problema(
          "arquivo-fora-do-contrato",
          nome === EDITION_FILE
            ? `A edição fica em ${sources.pastas.published}, e não na pasta de rascunhos.`
            : `Arquivo não faz parte do contrato de conteúdo. Os aceitos são ${EDITION_FILE} e uma lista por coleção: ${COLECOES.join(", ")}.`,
        );
        continue;
      }

      let dados: unknown;
      try {
        dados = parseJsonFile(path.join(dir, nome));
      } catch (erro) {
        problema("json-ilegivel", `JSON ilegível: ${erro instanceof Error ? erro.message : String(erro)}`);
        continue;
      }

      const lido: SourceFile = { arquivo, pasta, dados };
      if (isColecao(colecao)) sources.colecoes[colecao].push(lido);
      else if (nome === EDITION_FILE) sources.edicao = lido;
      else sources.importacoes = lido;
    }
  };

  readFolder("published", paths.publishedDir);
  readFolder("drafts", paths.draftsDir);

  // Sonda o arquivo de cada imagem cadastrada. O padrão do caminho não aceita
  // ponto fora da extensão, então não há como sair de `public/media/`.
  for (const arquivo of sources.colecoes.imagens) {
    if (!Array.isArray(arquivo.dados)) continue;
    for (const imagem of arquivo.dados as unknown[]) {
      const caminho =
        typeof imagem === "object" && imagem !== null
          ? (imagem as Record<string, unknown>).arquivo
          : undefined;
      if (typeof caminho !== "string" || !MEDIA_PATH.test(caminho)) continue;
      sources.midia[caminho] = probeMedia(path.join(paths.publicDir, caminho));
    }
  }

  return sources;
}

/**
 * Impressão digital da entrada: muda quando muda qualquer coisa que o gerador
 * lê. É calculada sobre o JSON já interpretado, e não sobre os bytes, para a
 * formatação do arquivo e o fim de linha do sistema não a alterarem.
 */
export function fingerprintSources(sources: Sources): string {
  const entrada = {
    formato: FORMAT_VERSION,
    edicao: sources.edicao?.dados ?? null,
    colecoes: Object.fromEntries(
      COLECOES.map((colecao) => [
        ENTIDADE_DA_COLECAO[colecao],
        sources.colecoes[colecao].map(({ arquivo, dados }) => ({ arquivo, dados })),
      ]),
    ),
    importacoes: sources.importacoes?.dados ?? null,
    problemas: sources.problemas.map(({ arquivo, codigo, mensagem }) => ({ arquivo, codigo, mensagem })),
    midia: Object.fromEntries(
      Object.entries(sources.midia).map(([arquivo, sonda]) => [arquivo, sonda.sha256]),
    ),
  };
  return createHash("sha256").update(canonicalJson(entrada)).digest("hex");
}
