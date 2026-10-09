// As operações do pipeline de dados, com disco: validar, gerar, relatar e
// importar. São as mesmas funções para os comandos (`scripts/data.mts`) e para
// o servidor de desenvolvimento, que regenera os dados quando o conteúdo muda.

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";

import { buildAtlasData, type BuildResult } from "@/lib/publication/build";
import {
  buildCoverageReport,
  renderCoverageMarkdown,
  type CoverageReport,
  type EvidenceEntry,
} from "@/lib/publication/coverage";
import {
  countBySeverity,
  formatDiagnostic,
  type Diagnostic,
} from "@/lib/publication/diagnostics";
import {
  planImport,
  registroDeImportacoesSchema,
  type ImportPlan,
  type Importacao,
} from "@/lib/publication/import";
import { COLECOES, IMPORT_LOG_FILE } from "@/lib/publication/sources";
import { validateSources } from "@/lib/publication/validate";

import {
  REPORT_FILES,
  serializeAtlasData,
  writeGenerated,
  type Manifest,
  type WriteSummary,
} from "./output";
import {
  displayPath,
  fingerprintSources,
  parseJsonFile,
  readSources,
  type ProjectPaths,
} from "./sources";

/** O conteúdo tem erro e não pode ser gerado. A mensagem traz os diagnósticos. */
export class InvalidContentError extends Error {
  readonly diagnostics: Diagnostic[];

  constructor(diagnostics: Diagnostic[]) {
    const erros = diagnostics.filter((item) => item.severidade === "erro");
    super(
      `Conteúdo inválido (${erros.length} erro${erros.length === 1 ? "" : "s"}):\n` +
        erros.map((erro) => `  - ${formatDiagnostic(erro)}`).join("\n"),
    );
    this.name = "InvalidContentError";
    this.diagnostics = diagnostics;
  }
}

export interface ValidateOutcome {
  resultado: BuildResult;
  /** Impressão digital das fontes lidas. */
  entrada: string;
}

/** Lê as fontes editoriais e roda o pipeline em memória. Não grava nada. */
export function runValidate(paths: ProjectPaths): ValidateOutcome {
  const sources = readSources(paths);
  return { resultado: buildAtlasData(sources), entrada: fingerprintSources(sources) };
}

/** Lê o registro de trechos conferidos, se existir. Serve só ao relatório. */
function readEvidence(paths: ProjectPaths): EvidenceEntry[] | null {
  if (!existsSync(paths.evidenceDir)) return null;
  const arquivos = readdirSync(paths.evidenceDir)
    .filter((nome) => nome.endsWith(".json"))
    .sort();
  if (arquivos.length === 0) return null;

  const itens: EvidenceEntry[] = [];
  for (const nome of arquivos) {
    try {
      const lista = parseJsonFile(path.join(paths.evidenceDir, nome));
      if (!Array.isArray(lista)) continue;
      for (const item of lista as Partial<EvidenceEntry>[]) {
        if (typeof item?.registro === "string" && typeof item.fonteId === "string") {
          itens.push({ registro: item.registro, fonteId: item.fonteId });
        }
      }
    } catch {
      // Arquivo ilegível em docs/ não é assunto do pipeline de dados.
    }
  }
  return itens;
}

export function runReport(paths: ProjectPaths): ValidateOutcome & { relatorio: CoverageReport } {
  const validacao = runValidate(paths);
  return { ...validacao, relatorio: buildCoverageReport(validacao.resultado, readEvidence(paths)) };
}

export interface BuildOutcome extends ValidateOutcome {
  /** `null` quando há erro: a pasta gerada ficou como estava. */
  gravacao: (WriteSummary & { manifest: Manifest }) | null;
}

/**
 * Valida e, sem erros, grava `generated/`. Com erro, não grava nada: a saída
 * anterior fica intacta, e como ela pertence a outra entrada, o build da
 * aplicação a recusa.
 */
export function runBuild(paths: ProjectPaths, agora: Date = new Date()): BuildOutcome {
  const inicio = performance.now();
  const sources = readSources(paths);
  const entrada = fingerprintSources(sources);
  const resultado = buildAtlasData(sources);
  if (!resultado.ok || resultado.data === null) return { resultado, entrada, gravacao: null };

  const { arquivos, manifest } = serializeAtlasData(resultado.data, entrada);
  const relatorio = buildCoverageReport(resultado, readEvidence(paths));
  const total = countBySeverity(resultado.diagnostics);

  // Só aqui entram horário e duração: fora dos dados, que precisam ser reproduzíveis.
  const execucao = {
    geradoEm: agora.toISOString(),
    duracaoMs: Math.round(performance.now() - inicio),
    node: process.version,
    entrada,
    resumo: { ...manifest.contagens, pendencias: total.pendencia, avisos: total.aviso },
    diagnosticos: resultado.diagnostics,
    foraDaPublicacao: resultado.excluidos,
  };
  const relatorios = new Map([
    [REPORT_FILES.execucao, `${JSON.stringify(execucao, null, 2)}\n`],
    [REPORT_FILES.cobertura, renderCoverageMarkdown(relatorio)],
  ]);

  const gravacao = writeGenerated(paths.outDir, arquivos, manifest, relatorios);
  return { resultado, entrada, gravacao: { ...gravacao, manifest } };
}

// ---------------------------------------------------------------------------
// Importação
// ---------------------------------------------------------------------------

export interface ImportOutcome {
  plano: ImportPlan;
  /** Arquivos de content/drafts/ alterados; vazio em simulação. */
  gravados: string[];
}

function writeJson(arquivo: string, dados: unknown) {
  mkdirSync(path.dirname(arquivo), { recursive: true });
  const temporario = `${arquivo}.tmp`;
  writeFileSync(temporario, `${JSON.stringify(dados, null, 2)}\n`, "utf8");
  renameSync(temporario, arquivo);
}

/**
 * Importa um pacote JSON para content/drafts/. Nunca toca em
 * content/published/ nem em generated/: importar e publicar são operações
 * separadas.
 */
export function runImport(
  paths: ProjectPaths,
  arquivo: string,
  opcoes: { descricao?: string; simular?: boolean; hoje?: string } = {},
): ImportOutcome {
  const bytes = readFileSync(arquivo);
  const pacote: unknown = JSON.parse(bytes.toString("utf8").replace(/^﻿/, ""));

  const sources = readSources(paths);
  const leitura = sources.problemas.filter((item) => item.severidade === "erro");
  if (leitura.length > 0) throw new InvalidContentError(leitura);

  // O registro de importações precisa estar legível antes de receber mais uma linha.
  const anteriores = registroDeImportacoesSchema.safeParse(sources.importacoes?.dados ?? []);
  if (!anteriores.success) {
    throw new Error(
      `${sources.pastas.drafts}/${IMPORT_LOG_FILE} não segue o formato do registro de importações. Corrija o arquivo antes de importar.`,
    );
  }

  const hoje = opcoes.hoje ?? new Date().toISOString().slice(0, 10);
  const plano = planImport(
    pacote,
    validateSources(sources),
    {
      arquivo: path.basename(arquivo),
      sha256: createHash("sha256").update(bytes).digest("hex"),
      ...(opcoes.descricao === undefined ? {} : { descricao: opcoes.descricao }),
    },
    hoje,
  );
  if (opcoes.simular) return { plano, gravados: [] };

  const gravados: string[] = [];
  for (const colecao of COLECOES) {
    const novos = plano.gravar[colecao];
    if (novos.length === 0) continue;
    const destino = path.join(paths.draftsDir, `${colecao}.json`);
    const atuais = sources.colecoes[colecao].find((item) => item.pasta === "drafts")?.dados;
    writeJson(destino, [...(Array.isArray(atuais) ? (atuais as unknown[]) : []), ...novos]);
    gravados.push(displayPath(paths, destino));
  }

  const registro: Importacao[] = [...anteriores.data, plano.registro];
  const destino = path.join(paths.draftsDir, IMPORT_LOG_FILE);
  writeJson(destino, registro);
  gravados.push(displayPath(paths, destino));

  return { plano, gravados };
}
