// Leitura de conteúdo local. É o único ponto do projeto que abre arquivos de
// conteúdo: recebe uma pasta, devolve um conjunto validado ou falha dizendo
// onde está o problema.
//
// Contrato da pasta (igual para `content/published/` e para as fixtures):
//   edicao.json          obrigatório; sem ele não existe conjunto
//   pessoas.json, mandatos.json, filiacoes.json, acontecimentos.json,
//   lugares.json, fontes.json, imagens.json
//                        cada um é uma lista; arquivo ausente = lista vazia
// Qualquer outro `.json` na pasta é erro, para um nome digitado errado não
// virar uma coleção vazia em silêncio.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import {
  checkIntegrity,
  checkPublication,
  type IntegrityIssue,
} from "@/lib/domain/integrity";
import { conjuntoSchema, type Conjunto, type Edicao } from "@/lib/domain/schemas";

const EDITION_FILE = "edicao.json";
const COLLECTIONS = [
  "pessoas",
  "mandatos",
  "filiacoes",
  "acontecimentos",
  "lugares",
  "fontes",
  "imagens",
] as const;

export type ConjuntoPublicado = Omit<Conjunto, "edicao"> & { edicao: Edicao | null };

export class InvalidContentError extends Error {
  constructor(
    readonly origem: string,
    readonly problemas: IntegrityIssue[],
  ) {
    const linhas = problemas.map((problema) => `  - ${problema.caminho}: ${problema.mensagem}`);
    super(`Conteúdo inválido em ${origem}:\n${linhas.join("\n")}`);
    this.name = "InvalidContentError";
  }
}

function readJson(arquivo: string): unknown {
  // Arquivos salvos pelo PowerShell costumam vir com BOM, que o JSON.parse recusa.
  const conteudo = readFileSync(arquivo, "utf8").replace(/^﻿/, "");
  try {
    return JSON.parse(conteudo);
  } catch (erro) {
    const detalhe = erro instanceof Error ? erro.message : String(erro);
    throw new InvalidContentError(path.dirname(arquivo), [
      { caminho: path.basename(arquivo), mensagem: `JSON ilegível: ${detalhe}` },
    ]);
  }
}

/** `["acontecimentos", 2, "data", "valor"]` vira `acontecimentos["id"].data.valor`. */
function describePath(caminho: PropertyKey[], bruto: Record<string, unknown>): string {
  const [colecao, indice, ...resto] = caminho;
  const partes: string[] = [];

  if (typeof colecao === "string") {
    partes.push(colecao);
    const registros = bruto[colecao];
    if (typeof indice === "number" && Array.isArray(registros)) {
      const id = (registros[indice] as { id?: unknown } | undefined)?.id;
      partes.push(typeof id === "string" ? `["${id}"]` : `[${indice}]`);
    } else if (indice !== undefined) {
      resto.unshift(indice);
    }
  }
  for (const parte of resto) {
    partes.push(typeof parte === "number" ? `[${parte}]` : `.${String(parte)}`);
  }
  return partes.join("") || "(raiz)";
}

/**
 * Lê e valida a pasta. Devolve `null` quando ainda não há edição (pasta vazia
 * ou inexistente). Lança `InvalidContentError` com todos os problemas
 * encontrados quando há conteúdo e ele não passa.
 */
export function loadContentSet(dir: string): Conjunto | null {
  const arquivos = existsSync(dir)
    ? readdirSync(dir).filter((nome) => nome.endsWith(".json"))
    : [];
  if (arquivos.length === 0) return null;

  const esperados = new Set<string>([EDITION_FILE, ...COLLECTIONS.map((nome) => `${nome}.json`)]);
  const estranhos = arquivos.filter((nome) => !esperados.has(nome));
  if (estranhos.length > 0) {
    throw new InvalidContentError(dir, [
      { caminho: estranhos.join(", "), mensagem: "Arquivo não faz parte do contrato de conteúdo." },
    ]);
  }
  if (!arquivos.includes(EDITION_FILE)) {
    throw new InvalidContentError(dir, [
      { caminho: EDITION_FILE, mensagem: "Há coleções na pasta, mas falta o arquivo da edição." },
    ]);
  }

  const bruto: Record<string, unknown> = { edicao: readJson(path.join(dir, EDITION_FILE)) };
  for (const nome of COLLECTIONS) {
    const arquivo = `${nome}.json`;
    bruto[nome] = arquivos.includes(arquivo) ? readJson(path.join(dir, arquivo)) : [];
  }

  const resultado = conjuntoSchema.safeParse(bruto);
  if (!resultado.success) {
    throw new InvalidContentError(
      dir,
      resultado.error.issues.map((issue) => ({
        caminho: describePath(issue.path, bruto),
        mensagem: issue.message,
      })),
    );
  }

  const problemas = checkIntegrity(resultado.data);
  if (problemas.length > 0) throw new InvalidContentError(dir, problemas);

  return resultado.data;
}

/**
 * Lê uma pasta como conjunto publicado: além de válido, o conteúdo precisa
 * estar todo revisado e sem dados sintéticos. Sem edição, devolve o conjunto
 * vazio, e as páginas mostram que nada foi publicado ainda.
 */
export function loadPublishedSet(dir: string): ConjuntoPublicado {
  const conjunto = loadContentSet(dir);
  if (conjunto === null) {
    return {
      edicao: null,
      pessoas: [],
      mandatos: [],
      filiacoes: [],
      acontecimentos: [],
      lugares: [],
      fontes: [],
      imagens: [],
    };
  }

  const problemas = checkPublication(conjunto);
  if (problemas.length > 0) throw new InvalidContentError(dir, problemas);

  return conjunto;
}
