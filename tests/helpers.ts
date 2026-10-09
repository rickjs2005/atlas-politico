import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { readSources, resolvePaths, type ProjectPaths } from "@/lib/content/sources";
import type { AtlasData } from "@/lib/data/types";
import { SYNTHETIC_PREFIX } from "@/lib/domain/integrity";
import { conjuntoSchema, type Conjunto } from "@/lib/domain/schemas";
import { buildAtlasData, type BuildResult } from "@/lib/publication/build";
import { COLECOES, type Colecao } from "@/lib/publication/sources";

export const FIXTURES_DIR = path.resolve("tests/fixtures/sintetico");
export const PUBLISHED_DIR = path.resolve("content/published");
export const DRAFTS_DIR = path.resolve("content/drafts");
export const PUBLIC_DIR = path.resolve("public");

function readFixture(nome: string): unknown {
  try {
    return JSON.parse(readFileSync(path.join(FIXTURES_DIR, nome), "utf8"));
  } catch {
    return []; // coleção sem arquivo é lista vazia
  }
}

/** Cópia nova do conjunto sintético a cada chamada, para o teste poder alterar. */
export function loadFixtures(): Conjunto {
  return conjuntoSchema.parse({
    edicao: readFixture("edicao.json"),
    ...Object.fromEntries(COLECOES.map((colecao) => [colecao, readFixture(`${colecao}.json`)])),
  });
}

/** As fixtures como projeto: uma pasta só, sem rascunhos à parte. */
export function fixturePaths(): ProjectPaths {
  return resolvePaths(process.cwd(), {
    publishedDir: FIXTURES_DIR,
    draftsDir: path.join(FIXTURES_DIR, "drafts"),
  });
}

/** O que a interface recebe: as fixtures passadas pelo pipeline, com índices e pontos. */
export function loadAtlasData(): AtlasData {
  const { data } = buildAtlasData(readSources(fixturePaths()), { allowSynthetic: true });
  if (data === null) throw new Error("As fixtures sintéticas não passaram pelo pipeline.");
  return data;
}

export function slugs(itens: { slug: string }[]): string[] {
  return itens.map((item) => item.slug.replace(/^.*-evento-/, ""));
}

// ---------------------------------------------------------------------------
// Projetos descartáveis, para testar o pipeline com disco
// ---------------------------------------------------------------------------

/** Prefixo dos registros de teste que podem passar pelas regras de publicação. */
export const TEST_PREFIX = "teste-";

export type ContentFiles = Partial<Record<Colecao | "edicao" | "importacoes", unknown>>;

/**
 * As fixtures com cara de conteúdo real: mesmo conteúdo, sem o prefixo
 * reservado. Sete acontecimentos revisados e um rascunho (o 08).
 */
export function baseContent(): Conjunto {
  const texto = JSON.stringify(loadFixtures()).replaceAll(SYNTHETIC_PREFIX, TEST_PREFIX);
  return JSON.parse(texto) as Conjunto;
}

/** Tira um campo de um registro, para os testes de conteúdo fora do contrato. */
export function omitField(registro: object, campo: string) {
  delete (registro as Record<string, unknown>)[campo];
}

const temporarias: string[] = [];

export interface TestProject {
  paths: ProjectPaths;
  write: (pasta: "published" | "drafts", arquivos: ContentFiles) => void;
  /** Grava um arquivo qualquer a partir da raiz do projeto. */
  writeFile: (relativo: string, conteudo: string | Buffer) => void;
  result: () => BuildResult;
}

/** Projeto em pasta temporária, com `content/`, `public/` e `generated/` próprios. */
export function createProject(
  conteudo: { published?: ContentFiles; drafts?: ContentFiles } = {},
): TestProject {
  const root = mkdtempSync(path.join(tmpdir(), "atlas-projeto-"));
  temporarias.push(root);
  const paths = resolvePaths(root);

  const writeFile = (relativo: string, texto: string | Buffer) => {
    const destino = path.join(root, relativo);
    mkdirSync(path.dirname(destino), { recursive: true });
    writeFileSync(destino, texto);
  };
  const write: TestProject["write"] = (pasta, arquivos) => {
    for (const [nome, dados] of Object.entries(arquivos)) {
      writeFile(`content/${pasta}/${nome}.json`, `${JSON.stringify(dados, null, 2)}\n`);
    }
  };

  write("published", conteudo.published ?? {});
  write("drafts", conteudo.drafts ?? {});
  return { paths, write, writeFile, result: () => buildAtlasData(readSources(paths)) };
}

export function removeProjects() {
  for (const dir of temporarias.splice(0)) rmSync(dir, { recursive: true, force: true });
}

/** Menor JPEG que a sonda de mídia reconhece, com as dimensões pedidas. */
export function fakeJpeg(largura: number, altura: number): Buffer {
  const quadro = Buffer.from([0xff, 0xc0, 0x00, 0x11, 0x08, 0, 0, 0, 0, 0x03]);
  quadro.writeUInt16BE(altura, 5);
  quadro.writeUInt16BE(largura, 7);
  return Buffer.concat([
    Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x04, 0x00, 0x00]),
    quadro,
    Buffer.alloc(16),
  ]);
}
