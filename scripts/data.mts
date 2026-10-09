// Comandos do pipeline de dados (docs/DATA-PIPELINE.md).
//
//   npm run data:validate              confere o conteúdo e mostra os diagnósticos
//   npm run data:build                 valida e gera generated/ (conjunto, índices, GeoJSON)
//   npm run data:report                cobertura, pendências e erros, em Markdown
//   npm run data:import -- <arquivo>   importa um pacote JSON para content/drafts/
//   npm run data:query -- [filtros]    consulta os dados gerados
//
// Código de saída: 0 quando deu certo, 1 quando o conteúdo tem erro, 2 quando o
// comando foi usado de forma errada ou falhou por outro motivo.

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

import { GeneratedDataError, readGenerated } from "@/lib/content/output";
import {
  InvalidContentError,
  runBuild,
  runImport,
  runReport,
  runValidate,
} from "@/lib/content/pipeline";
import { fingerprintSources, readSources, resolvePaths } from "@/lib/content/sources";
import {
  filterEvents,
  findEventById,
  findEventBySlug,
  findPersonById,
  findPersonBySlug,
  getEventView,
} from "@/lib/data/queries";
import { CATEGORIAS, CATEGORY_LABELS, isCategoria } from "@/lib/domain/categories";
import { formatDate } from "@/lib/domain/dates";
import type { BuildResult } from "@/lib/publication/build";
import { renderCoverageMarkdown } from "@/lib/publication/coverage";
import {
  countBySeverity,
  formatDiagnostic,
  type Diagnostic,
  type Severidade,
} from "@/lib/publication/diagnostics";
import { renderImportReport } from "@/lib/publication/import";
import { COLECOES } from "@/lib/publication/sources";

const USAGE = `Uso: node --import ./scripts/register.mjs scripts/data.mts <comando> [opções]

Comandos
  validate                 Confere o conteúdo e mostra erros, pendências e avisos.
  build                    Valida e gera a pasta generated/.
  report                   Mostra o relatório de cobertura em Markdown.
      --out <arquivo>      Grava o relatório no arquivo, em vez de imprimir.
  import <arquivo.json>    Importa um pacote para content/drafts/, como rascunho.
      --source <texto>     De onde veio o pacote (vai para o registro de importações).
      --dry-run            Mostra o que aconteceria, sem gravar.
  query                    Consulta os dados gerados.
      --pessoa <slug|id>   --de <ano>   --ate <ano>
      --categorias <a,b>   --lugar <id> --acontecimento <slug|id>

Opção comum
  --root <pasta>           Raiz do projeto (padrão: a pasta atual).`;

class UsageError extends Error {}

const SECTIONS: [Severidade, string][] = [
  ["erro", "ERROS: impedem a geração"],
  ["pendencia", "PENDÊNCIAS: ficam fora da publicação"],
  ["aviso", "AVISOS: a conferir, sem efeito na publicação"],
];

function printDiagnostics(diagnostics: readonly Diagnostic[], mostrar: readonly Severidade[]) {
  for (const [severidade, titulo] of SECTIONS) {
    if (!mostrar.includes(severidade)) continue;
    const lista = diagnostics.filter((item) => item.severidade === severidade);
    if (lista.length === 0) continue;
    console.log(`\n${titulo} (${lista.length})`);
    for (const diagnostico of lista) console.log(`  - ${formatDiagnostic(diagnostico)}`);
  }
}

function describeCounts(resultado: BuildResult): string {
  const { registros, candidatos } = resultado.validacao;
  const lidos = COLECOES.map((colecao) => `${registros[colecao].length} ${colecao}`).join(", ");
  const elegiveis = (["pessoas", "mandatos", "filiacoes", "acontecimentos"] as const)
    .map((colecao) => `${candidatos[colecao].size} ${colecao}`)
    .join(", ");
  return `Registros lidos: ${lidos}.\nRevisados em content/published: ${elegiveis}.`;
}

function summarize(resultado: BuildResult): string {
  const total = countBySeverity(resultado.diagnostics);
  return `${total.erro} erro(s), ${total.pendencia} pendência(s), ${total.aviso} aviso(s)`;
}

function validate(root: string): number {
  const { resultado } = runValidate(resolvePaths(root));
  const edicao = resultado.validacao.edicao;
  console.log(
    edicao === null
      ? "Nenhuma edição em content/published."
      : `Edição ${edicao.versao}, data de corte ${edicao.dataDeCorte}.`,
  );
  console.log(describeCounts(resultado));
  printDiagnostics(resultado.diagnostics, ["erro", "pendencia", "aviso"]);
  console.log(
    resultado.ok
      ? `\nConteúdo válido: ${summarize(resultado)}.`
      : `\nConteúdo com erro: ${summarize(resultado)}. Nada pode ser gerado até a correção.`,
  );
  return resultado.ok ? 0 : 1;
}

function build(root: string): number {
  const paths = resolvePaths(root);
  const { resultado, gravacao } = runBuild(paths);

  if (gravacao === null) {
    printDiagnostics(resultado.diagnostics, ["erro"]);
    console.error(
      `\nGeração interrompida: ${summarize(resultado)}. A pasta generated/ não foi alterada, e o build da aplicação não usa dados de outra versão do conteúdo.`,
    );
    return 1;
  }

  const { contagens, edicao } = gravacao.manifest;
  console.log(
    `Dados gerados em ${path.relative(paths.root, paths.outDir) || "."}${edicao === null ? " (nenhuma edição publicada)" : `: edição ${edicao.versao}, data de corte ${edicao.dataDeCorte}`}.`,
  );
  console.log(
    `  ${contagens.acontecimentos} acontecimentos, ${contagens.pessoas} pessoas, ${contagens.mandatos} mandatos e funções, ${contagens.filiacoes} filiações,`,
  );
  console.log(
    `  ${contagens.lugares} lugares, ${contagens.fontes} fontes, ${contagens.imagens} imagens, ${contagens.pontos} pontos no mapa.`,
  );
  console.log(
    `  Arquivos: ${gravacao.gravados.length} gravados, ${gravacao.inalterados.length} sem mudança, ${gravacao.removidos.length} removidos.`,
  );
  const total = countBySeverity(resultado.diagnostics);
  if (total.pendencia + total.aviso > 0) {
    console.log(
      `  ${total.pendencia} pendência(s) e ${total.aviso} aviso(s): veja \`npm run data:report\`.`,
    );
  }
  return 0;
}

function report(root: string, out: string | undefined): number {
  const { relatorio } = runReport(resolvePaths(root));
  const markdown = renderCoverageMarkdown(relatorio);
  if (out === undefined) {
    process.stdout.write(markdown);
  } else {
    const destino = path.resolve(out);
    mkdirSync(path.dirname(destino), { recursive: true });
    writeFileSync(destino, markdown, "utf8");
    console.log(`Relatório gravado em ${destino}.`);
  }
  return 0;
}

function importPackage(
  root: string,
  arquivo: string | undefined,
  opcoes: { source?: string; dryRun: boolean },
): number {
  if (arquivo === undefined) throw new UsageError("Informe o arquivo JSON a importar.");
  const { plano, gravados } = runImport(resolvePaths(root), path.resolve(arquivo), {
    descricao: opcoes.source,
    simular: opcoes.dryRun,
  });
  console.log(renderImportReport(plano.registro, opcoes.dryRun));
  if (gravados.length > 0) console.log(`\nArquivos alterados: ${gravados.join(", ")}.`);
  return 0;
}

function parseYear(valor: string | undefined, opcao: string): number | null {
  if (valor === undefined) return null;
  if (!/^\d{4}$/.test(valor)) throw new UsageError(`${opcao} espera um ano com quatro dígitos.`);
  return Number(valor);
}

function query(
  root: string,
  filtros: {
    pessoa?: string;
    de?: string;
    ate?: string;
    categorias?: string;
    lugar?: string;
    acontecimento?: string;
  },
): number {
  const paths = resolvePaths(root);
  const { data } = readGenerated(paths.outDir, fingerprintSources(readSources(paths)));

  if (filtros.acontecimento !== undefined) {
    const acontecimento =
      findEventBySlug(data, filtros.acontecimento) ?? findEventById(data, filtros.acontecimento);
    if (acontecimento === null) {
      console.log(`Nenhum acontecimento publicado com o slug ou id "${filtros.acontecimento}".`);
      return 0;
    }
    const visao = getEventView(data, acontecimento);
    console.log(`${formatDate(acontecimento.data)} · ${acontecimento.titulo}`);
    console.log(
      `${CATEGORY_LABELS[acontecimento.categoria]} · ${visao.pessoas.map((pessoa) => pessoa.nome).join(", ")}`,
    );
    console.log(
      `Lugares: ${visao.lugares.length > 0 ? visao.lugares.map((lugar) => lugar.nome).join(", ") : `sem ponto no mapa (${acontecimento.localizacao.tipo})`}`,
    );
    console.log(`\n${acontecimento.resumo}`);
    console.log("\nFontes:");
    for (const { citacao, fonte } of visao.citacoes) {
      console.log(`  - ${fonte.titulo} (${fonte.url})\n    ${citacao.localizacao}: ${citacao.evidencia}`);
    }
    return 0;
  }

  let pessoaIds: string[] | undefined;
  if (filtros.pessoa !== undefined) {
    const pessoa = findPersonBySlug(data, filtros.pessoa) ?? findPersonById(data, filtros.pessoa);
    if (pessoa === null) {
      console.log(`Nenhuma pessoa publicada com o slug ou id "${filtros.pessoa}".`);
      return 0;
    }
    pessoaIds = [pessoa.id];
  }

  const categorias = filtros.categorias?.split(",").map((item) => item.trim());
  const desconhecidas = categorias?.filter((item) => !isCategoria(item)) ?? [];
  if (desconhecidas.length > 0) {
    throw new UsageError(
      `Categoria desconhecida: ${desconhecidas.join(", ")}. As aceitas são ${CATEGORIAS.join(", ")}.`,
    );
  }

  const acontecimentos = filterEvents(data, {
    pessoaIds,
    periodo: { de: parseYear(filtros.de, "--de"), ate: parseYear(filtros.ate, "--ate") },
    categorias: categorias?.filter(isCategoria),
    lugarIds: filtros.lugar === undefined ? undefined : [filtros.lugar],
  });

  for (const acontecimento of acontecimentos) {
    console.log(`${formatDate(acontecimento.data).padEnd(26)} ${acontecimento.slug}`);
  }
  console.log(
    acontecimentos.length === 0
      ? "Nenhum acontecimento neste recorte."
      : `\n${acontecimentos.length} acontecimento(s), em ordem cronológica.`,
  );
  return 0;
}

function main(): number {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      root: { type: "string" },
      out: { type: "string" },
      source: { type: "string" },
      "dry-run": { type: "boolean", default: false },
      pessoa: { type: "string" },
      de: { type: "string" },
      ate: { type: "string" },
      categorias: { type: "string" },
      lugar: { type: "string" },
      acontecimento: { type: "string" },
      help: { type: "boolean", short: "h", default: false },
    },
  });
  const [comando, argumento] = positionals;
  const root = values.root ?? process.cwd();

  if (values.help || comando === undefined) {
    console.log(USAGE);
    return comando === undefined && !values.help ? 2 : 0;
  }

  switch (comando) {
    case "validate":
      return validate(root);
    case "build":
      return build(root);
    case "report":
      return report(root, values.out);
    case "import":
      return importPackage(root, argumento, { source: values.source, dryRun: values["dry-run"] });
    case "query":
      return query(root, values);
    default:
      throw new UsageError(`Comando desconhecido: ${comando}.`);
  }
}

try {
  process.exitCode = main();
} catch (erro) {
  if (erro instanceof InvalidContentError) {
    console.error(erro.message);
    process.exitCode = 1;
  } else if (erro instanceof UsageError) {
    console.error(`${erro.message}\n\n${USAGE}`);
    process.exitCode = 2;
  } else if (erro instanceof GeneratedDataError) {
    console.error(erro.message);
    process.exitCode = 2;
  } else {
    console.error(erro instanceof Error ? erro.message : String(erro));
    process.exitCode = 2;
  }
}
