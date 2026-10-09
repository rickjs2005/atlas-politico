// A pasta gerada (`generated/`): gravação e leitura. Ninguém mais escreve nela,
// e nada nela é editado à mão.
//
//   generated/
//     manifest.json                    o que foi gerado, a partir de qual entrada
//     dados/conjunto.json              registros elegíveis, em ordem estável
//     dados/indices.json               índices de consulta
//     dados/geo/acontecimentos.geojson todos os pontos
//     dados/geo/pessoas/<slug>.geojson os pontos de cada pessoa
//     relatorio/execucao.json          relatório técnico: horário, diagnósticos
//     relatorio/cobertura.md           relatório de cobertura
//
// `manifest.json` e `dados/` não têm horário: a mesma entrada gera os mesmos
// bytes. O que varia a cada execução fica em `relatorio/`.

import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  rmdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

import { filterPoints } from "@/lib/data/points";
import type { AtlasData, EventPointCollection, Indexes, PublishedSet } from "@/lib/data/types";
import { stableStringify } from "@/lib/publication/stable-json";

import { FORMAT_VERSION } from "./sources";

export const GENERATOR_ID = "atlas-politico/dados";

const MANIFEST_FILE = "manifest.json";
const DATA_FILES = {
  conjunto: "dados/conjunto.json",
  indices: "dados/indices.json",
  pontos: "dados/geo/acontecimentos.geojson",
} as const;
const personPointsFile = (slug: string) => `dados/geo/pessoas/${slug}.geojson`;

export const REPORT_FILES = {
  execucao: "relatorio/execucao.json",
  cobertura: "relatorio/cobertura.md",
} as const;

export interface Manifest {
  gerador: typeof GENERATOR_ID;
  formato: number;
  edicao: { versao: string; dataDeCorte: string } | null;
  /** Impressão digital das fontes editoriais que produziram esta saída. */
  entrada: string;
  contagens: {
    pessoas: number;
    mandatos: number;
    filiacoes: number;
    acontecimentos: number;
    lugares: number;
    fontes: number;
    imagens: number;
    pontos: number;
  };
  /** Arquivos de dados, com tamanho e resumo para conferência na leitura. */
  arquivos: { caminho: string; bytes: number; sha256: string }[];
}

/** A saída gerada não pode ser usada: falta, está incompleta ou é de outra entrada. */
export class GeneratedDataError extends Error {
  readonly motivo: "ausente" | "corrompida" | "desatualizada";

  constructor(motivo: GeneratedDataError["motivo"], mensagem: string) {
    super(mensagem);
    this.name = "GeneratedDataError";
    this.motivo = motivo;
  }
}

function sha256(texto: string | Buffer): string {
  return createHash("sha256").update(texto).digest("hex");
}

/** Os arquivos de dados e o manifesto, como texto. Sem tocar no disco. */
export function serializeAtlasData(
  data: AtlasData,
  entrada: string,
): { arquivos: Map<string, string>; manifest: Manifest } {
  const arquivos = new Map<string, string>();
  arquivos.set(DATA_FILES.conjunto, stableStringify(data.conjunto));
  arquivos.set(DATA_FILES.indices, stableStringify(data.indices));
  arquivos.set(DATA_FILES.pontos, stableStringify(data.pontos));
  for (const pessoa of data.conjunto.pessoas) {
    const seus = data.conjunto.acontecimentos.filter((item) => item.pessoaIds.includes(pessoa.id));
    arquivos.set(personPointsFile(pessoa.slug), stableStringify(filterPoints(data.pontos, seus)));
  }

  const { conjunto } = data;
  const manifest: Manifest = {
    gerador: GENERATOR_ID,
    formato: FORMAT_VERSION,
    edicao:
      conjunto.edicao === null
        ? null
        : { versao: conjunto.edicao.versao, dataDeCorte: conjunto.edicao.dataDeCorte },
    entrada,
    contagens: {
      pessoas: conjunto.pessoas.length,
      mandatos: conjunto.mandatos.length,
      filiacoes: conjunto.filiacoes.length,
      acontecimentos: conjunto.acontecimentos.length,
      lugares: conjunto.lugares.length,
      fontes: conjunto.fontes.length,
      imagens: conjunto.imagens.length,
      pontos: data.pontos.features.length,
    },
    arquivos: [...arquivos]
      .map(([caminho, texto]) => ({
        caminho,
        bytes: Buffer.byteLength(texto, "utf8"),
        sha256: sha256(texto),
      }))
      .sort((a, b) => (a.caminho < b.caminho ? -1 : 1)),
  };
  return { arquivos, manifest };
}

function listFiles(dir: string, base: string = dir): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((item) => {
    const caminho = path.join(dir, item.name);
    if (item.isDirectory()) return listFiles(caminho, base);
    return [path.relative(base, caminho).split(path.sep).join("/")];
  });
}

function pruneEmptyDirs(dir: string, raiz: string) {
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    if (item.isDirectory()) pruneEmptyDirs(path.join(dir, item.name), raiz);
  }
  if (dir !== raiz && readdirSync(dir).length === 0) rmdirSync(dir);
}

function readManifest(outDir: string): Manifest | null {
  const arquivo = path.join(outDir, MANIFEST_FILE);
  if (!existsSync(arquivo)) return null;
  try {
    const manifest = JSON.parse(readFileSync(arquivo, "utf8")) as Partial<Manifest>;
    return manifest.gerador === GENERATOR_ID && Array.isArray(manifest.arquivos)
      ? (manifest as Manifest)
      : null;
  } catch {
    return null;
  }
}

/**
 * A pasta só é tratada como saída do gerador se não existir, estiver vazia ou
 * já tiver um manifesto do gerador. Isso impede que um caminho digitado errado
 * faça a limpeza apagar outra pasta do projeto.
 */
function assertControlled(outDir: string) {
  if (!existsSync(outDir)) return;
  if (!statSync(outDir).isDirectory()) {
    throw new Error(`A saída precisa ser uma pasta: ${outDir}`);
  }
  if (readdirSync(outDir).length === 0 || readManifest(outDir) !== null) return;
  // Uma geração interrompida deixa a pasta sem manifesto, só com o que o gerador cria.
  const conhecidas = new Set(["dados", "relatorio"]);
  if (readdirSync(outDir).every((nome) => conhecidas.has(nome))) return;
  throw new Error(
    `A pasta ${outDir} tem arquivos que não são do gerador de dados. Nada foi gravado nem apagado.`,
  );
}

export interface WriteSummary {
  gravados: string[];
  inalterados: string[];
  removidos: string[];
}

/**
 * Grava a saída. O manifesto antigo sai primeiro e o novo entra por último:
 * se a gravação for interrompida, a pasta fica sem manifesto e a leitura a
 * recusa, em vez de servir uma mistura de arquivos novos e antigos.
 */
export function writeGenerated(
  outDir: string,
  arquivos: ReadonlyMap<string, string>,
  manifest: Manifest,
  relatorios: ReadonlyMap<string, string>,
): WriteSummary {
  assertControlled(outDir);
  mkdirSync(outDir, { recursive: true });

  const resumo: WriteSummary = { gravados: [], inalterados: [], removidos: [] };
  const todos = new Map([...arquivos, ...relatorios]);
  const manifestoTexto = stableStringify(manifest);
  const manifestoAtual = path.join(outDir, MANIFEST_FILE);
  const mesmoManifesto =
    existsSync(manifestoAtual) && readFileSync(manifestoAtual, "utf8") === manifestoTexto;

  const write = (relativo: string, texto: string) => {
    const destino = path.join(outDir, relativo);
    if (existsSync(destino) && readFileSync(destino, "utf8") === texto) {
      resumo.inalterados.push(relativo);
      return;
    }
    mkdirSync(path.dirname(destino), { recursive: true });
    const temporario = `${destino}.tmp`;
    writeFileSync(temporario, texto, "utf8");
    renameSync(temporario, destino);
    resumo.gravados.push(relativo);
  };

  const dadosIguais = [...arquivos].every(([relativo, texto]) => {
    const destino = path.join(outDir, relativo);
    return existsSync(destino) && readFileSync(destino, "utf8") === texto;
  });
  if (!(mesmoManifesto && dadosIguais)) rmSync(manifestoAtual, { force: true });

  for (const [relativo, texto] of todos) write(relativo, texto);

  // Limpeza: só dentro da pasta do gerador, e só o que a geração atual não produz.
  for (const relativo of listFiles(outDir)) {
    if (relativo === MANIFEST_FILE || todos.has(relativo)) continue;
    rmSync(path.join(outDir, relativo), { force: true });
    resumo.removidos.push(relativo);
  }
  pruneEmptyDirs(outDir, outDir);

  write(MANIFEST_FILE, manifestoTexto);
  return resumo;
}

/**
 * Lê a saída gerada e confere cada arquivo contra o manifesto. Com
 * `entradaEsperada`, confere também se a saída é das fontes editoriais atuais.
 */
export function readGenerated(
  outDir: string,
  entradaEsperada?: string,
): { manifest: Manifest; data: AtlasData } {
  const manifest = readManifest(outDir);
  if (manifest === null) {
    throw new GeneratedDataError(
      "ausente",
      `Dados gerados não encontrados em ${outDir}. Rode \`npm run data:build\`.`,
    );
  }
  if (manifest.formato !== FORMAT_VERSION) {
    throw new GeneratedDataError(
      "desatualizada",
      `Os dados em ${outDir} são do formato ${manifest.formato}, e o projeto usa o ${FORMAT_VERSION}. Rode \`npm run data:build\`.`,
    );
  }
  if (entradaEsperada !== undefined && manifest.entrada !== entradaEsperada) {
    throw new GeneratedDataError(
      "desatualizada",
      `Os dados em ${outDir} foram gerados a partir de outra versão do conteúdo. Rode \`npm run data:build\`.`,
    );
  }

  const read = (relativo: string): unknown => {
    const registro = manifest.arquivos.find((item) => item.caminho === relativo);
    const arquivo = path.join(outDir, relativo);
    if (registro === undefined || !existsSync(arquivo)) {
      throw new GeneratedDataError(
        "corrompida",
        `Falta ${relativo} em ${outDir}. Rode \`npm run data:build\`.`,
      );
    }
    const texto = readFileSync(arquivo, "utf8");
    if (sha256(texto) !== registro.sha256) {
      throw new GeneratedDataError(
        "corrompida",
        `${relativo} foi alterado depois de gerado. A pasta ${outDir} não é editada à mão: rode \`npm run data:build\`.`,
      );
    }
    return JSON.parse(texto);
  };

  return {
    manifest,
    data: {
      conjunto: read(DATA_FILES.conjunto) as PublishedSet,
      indices: read(DATA_FILES.indices) as Indexes,
      pontos: read(DATA_FILES.pontos) as EventPointCollection,
    },
  };
}
