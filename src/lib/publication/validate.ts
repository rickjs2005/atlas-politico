// Validação das fontes editoriais, com diagnósticos. Função pura: recebe os
// arquivos já lidos e devolve os registros válidos, quem é candidato à
// publicação e a lista de problemas.
//
// A severidade segue uma regra só (docs/DATA-PIPELINE.md, seção Diagnósticos):
//   - arquivo ou registro fora do contrato é erro em qualquer pasta;
//   - problema entre registros é erro quando atinge a publicação (registro
//     revisado em content/published, ou lugar, fonte e imagem dessa pasta) e
//     pendência quando atinge só um rascunho, que fica fora de qualquer jeito.

import type { z } from "zod";

import {
  calcInterval,
  calcPeriodBounds,
  formatDate,
  type Periodo,
} from "@/lib/domain/dates";
import { SYNTHETIC_PREFIX, competenceOf } from "@/lib/domain/integrity";
import {
  acontecimentoSchema,
  atoExecutivoSchema,
  coberturaPoliticaSchema,
  edicaoSchema,
  filiacaoSchema,
  fonteSchema,
  identidadeInstitucionalSchema,
  imagemSchema,
  lugarSchema,
  mandatoSchema,
  pessoaSchema,
  proposicaoSchema,
  votacaoSchema,
  votoSchema,
  type Acontecimento,
  type AtoExecutivo,
  type Citacao,
  type CoberturaPolitica,
  type Edicao,
  type Editorial,
  type Filiacao,
  type Fonte,
  type IdentidadeInstitucional,
  type Imagem,
  type Lugar,
  type Mandato,
  type Pessoa,
  type Proposicao,
  type Votacao,
  type Voto,
} from "@/lib/domain/schemas";
import type { DataHistorica } from "@/lib/domain/types";

import {
  formatFieldPath,
  hasErrors,
  type Diagnostic,
  type DiagnosticCode,
  type DiagnosticEntity,
  type Severidade,
} from "./diagnostics";
import { registroDeImportacoesSchema } from "./import";
import {
  COLECAO_DA_ENTIDADE,
  COLECOES,
  COLECOES_FACTUAIS,
  EDITION_FILE,
  ENTIDADE_DA_COLECAO,
  isFactual,
  isReference,
  type Colecao,
  type ColecaoDeReferencia,
  type ColecaoFactual,
  type FormatoDeMidia,
  type Pasta,
  type Sources,
} from "./sources";

export interface RecordByCollection {
  pessoas: Pessoa;
  mandatos: Mandato;
  filiacoes: Filiacao;
  acontecimentos: Acontecimento;
  proposicoes: Proposicao;
  votacoes: Votacao;
  votos: Voto;
  atosExecutivos: AtoExecutivo;
  coberturaPolitica: CoberturaPolitica;
  identidadesInstitucionais: IdentidadeInstitucional;
  lugares: Lugar;
  fontes: Fonte;
  imagens: Imagem;
}

/** Um registro válido e de onde ele veio. */
export interface Tracked<T> {
  dados: T;
  pasta: Pasta;
  arquivo: string;
}

export type TrackedCollections = { [K in Colecao]: Tracked<RecordByCollection[K]>[] };

export interface ValidationOptions {
  /**
   * Aceita identificadores com o prefixo `sintetico-`. Só para a tela de prova
   * e para os testes, que rodam o pipeline sobre as fixtures. Nenhum comando
   * de dados liga esta opção.
   */
  allowSynthetic?: boolean;
}

export interface Validation {
  pastas: Record<Pasta, string>;
  edicao: Edicao | null;
  /** Registros que passaram no contrato, das duas pastas. */
  registros: TrackedCollections;
  /** `id` dos registros revisados em content/published, por coleção. */
  candidatos: Record<ColecaoFactual, Set<string>>;
  diagnostics: Diagnostic[];
}

const SCHEMAS: { [K in Colecao]: z.ZodType<RecordByCollection[K]> } = {
  pessoas: pessoaSchema,
  mandatos: mandatoSchema,
  filiacoes: filiacaoSchema,
  acontecimentos: acontecimentoSchema,
  proposicoes: proposicaoSchema,
  votacoes: votacaoSchema,
  votos: votoSchema,
  atosExecutivos: atoExecutivoSchema,
  coberturaPolitica: coberturaPoliticaSchema,
  identidadesInstitucionais: identidadeInstitucionalSchema,
  lugares: lugarSchema,
  fontes: fonteSchema,
  imagens: imagemSchema,
};

const FORMATO_DA_EXTENSAO: Record<string, FormatoDeMidia> = {
  jpg: "jpeg",
  jpeg: "jpeg",
  png: "png",
  webp: "webp",
  avif: "avif",
  svg: "svg",
};

function rawString(bruto: unknown, campo: string): string | null {
  if (typeof bruto !== "object" || bruto === null) return null;
  const valor = (bruto as Record<string, unknown>)[campo];
  return typeof valor === "string" ? valor : null;
}

function isSynthetic(...valores: (string | null)[]): boolean {
  return valores.some((valor) => valor?.startsWith(SYNTHETIC_PREFIX) ?? false);
}

export function indexById<T extends { id: string }>(
  registros: readonly Tracked<T>[],
): Map<string, Tracked<T>> {
  return new Map(registros.map((registro) => [registro.dados.id, registro] as const));
}

function describePending(editorial: Editorial): string {
  if (editorial.estado === "revisado") return "";
  const pendencias = editorial.pendencias ?? [];
  return pendencias.length > 0
    ? ` Pendências: ${pendencias.join(" ")}`
    : " Nenhuma pendência descrita.";
}

export function validateSources(sources: Sources, options: ValidationOptions = {}): Validation {
  const { pastas } = sources;
  const diagnostics: Diagnostic[] = [...sources.problemas];
  const edicaoArquivo = sources.edicao?.arquivo ?? `${pastas.published}/${EDITION_FILE}`;

  const registros: TrackedCollections = {
    pessoas: [],
    mandatos: [],
    filiacoes: [],
    acontecimentos: [],
    proposicoes: [],
    votacoes: [],
    votos: [],
    atosExecutivos: [],
    coberturaPolitica: [],
    identidadesInstitucionais: [],
    lugares: [],
    fontes: [],
    imagens: [],
  };
  const candidatos = Object.fromEntries(
    COLECOES_FACTUAIS.map((colecao) => [colecao, new Set<string>()]),
  ) as Validation["candidatos"];

  // -------------------------------------------------------------------------
  // 1. Edição
  // -------------------------------------------------------------------------

  let edicao: Edicao | null = null;
  if (sources.edicao !== null) {
    const resultado = edicaoSchema.safeParse(sources.edicao.dados);
    if (resultado.success) {
      edicao = resultado.data;
    } else {
      for (const issue of resultado.error.issues) {
        diagnostics.push({
          severidade: "erro",
          codigo: "estrutura",
          arquivo: edicaoArquivo,
          entidade: "edicao",
          id: null,
          campo: formatFieldPath(issue.path),
          mensagem: issue.message,
        });
      }
    }
  } else {
    const haRegistros = COLECOES.some((colecao) =>
      sources.colecoes[colecao].some(
        (arquivo) =>
          arquivo.pasta === "published" && Array.isArray(arquivo.dados) && arquivo.dados.length > 0,
      ),
    );
    if (haRegistros) {
      diagnostics.push({
        severidade: "erro",
        codigo: "edicao-ausente",
        arquivo: edicaoArquivo,
        entidade: "edicao",
        id: null,
        campo: null,
        mensagem: `Há registros em ${pastas.published}, mas falta o arquivo da edição.`,
      });
    }
  }

  if (sources.importacoes !== null) {
    const resultado = registroDeImportacoesSchema.safeParse(sources.importacoes.dados);
    for (const issue of resultado.error?.issues ?? []) {
      diagnostics.push({
        severidade: "erro",
        codigo: "estrutura",
        arquivo: sources.importacoes.arquivo,
        entidade: "importacao",
        id: null,
        campo: formatFieldPath(issue.path),
        mensagem: issue.message,
      });
    }
  }

  // -------------------------------------------------------------------------
  // 2. Cada registro contra o seu contrato; `id` e `slug` únicos
  // -------------------------------------------------------------------------

  // `id` dos registros recusados pelo contrato. Uma referência a um deles não é
  // "inexistente": o problema já foi apontado no próprio registro.
  const recusados = new Set<string>();

  const ingest = <K extends Colecao>(colecao: K) => {
    const entidade = ENTIDADE_DA_COLECAO[colecao];
    const temSlug = colecao === "pessoas" || colecao === "acontecimentos";
    // O `id` é único na coleção, e o `slug` também: as duas pastas contam juntas.
    const ids = new Map<string, string>();
    const slugs = new Map<string, string>();

    for (const arquivo of sources.colecoes[colecao]) {
      if (!Array.isArray(arquivo.dados)) {
        diagnostics.push({
          severidade: "erro",
          codigo: "formato-de-arquivo",
          arquivo: arquivo.arquivo,
          entidade,
          id: null,
          campo: null,
          mensagem: "O arquivo deve conter uma lista de registros.",
        });
        continue;
      }

      arquivo.dados.forEach((bruto: unknown, indice: number) => {
        const id = rawString(bruto, "id");
        const slug = temSlug ? rawString(bruto, "slug") : null;
        const problema = (
          codigo: DiagnosticCode,
          campo: string | null,
          mensagem: string,
        ): Diagnostic => ({
          severidade: "erro",
          codigo,
          arquivo: arquivo.arquivo,
          entidade,
          id,
          // Registro sem `id` legível é apontado pela posição na lista.
          campo: id === null ? `[${indice}]${campo === null ? "" : `.${campo}`}` : campo,
          mensagem,
        });

        if (!options.allowSynthetic && isSynthetic(id, slug)) {
          diagnostics.push(
            problema(
              "dado-sintetico",
              "id",
              "Dado sintético de teste não pode ficar nas pastas de conteúdo.",
            ),
          );
        }

        if (id !== null) {
          const anterior = ids.get(id);
          if (anterior !== undefined) {
            diagnostics.push(
              problema(
                "id-duplicado",
                "id",
                `Identificador repetido: "${id}" (já usado em ${anterior}).`,
              ),
            );
            return;
          }
          ids.set(id, arquivo.arquivo);
        }

        if (slug !== null) {
          const anterior = slugs.get(slug);
          if (anterior !== undefined) {
            diagnostics.push(
              problema("slug-duplicado", "slug", `Slug repetido: "${slug}" (já usado em ${anterior}).`),
            );
          } else {
            slugs.set(slug, arquivo.arquivo);
          }
        }

        const resultado = SCHEMAS[colecao].safeParse(bruto);
        if (!resultado.success) {
          for (const issue of resultado.error.issues) {
            diagnostics.push(problema("estrutura", formatFieldPath(issue.path), issue.message));
          }
          if (id !== null) recusados.add(`${colecao}:${id}`);
          return;
        }

        registros[colecao].push({
          dados: resultado.data,
          pasta: arquivo.pasta,
          arquivo: arquivo.arquivo,
        });
      });
    }
  };
  for (const colecao of COLECOES) ingest(colecao);

  // Com arquivo ilegível, as referências a ele falhariam em cascata. Primeiro
  // se corrige a leitura; as relações são conferidas na rodada seguinte.
  if (hasErrors(sources.problemas)) {
    return { pastas, edicao, registros, candidatos, diagnostics };
  }

  // -------------------------------------------------------------------------
  // 3. Estado editorial: quem é candidato à publicação
  // -------------------------------------------------------------------------

  for (const colecao of COLECOES_FACTUAIS) {
    const entidade = ENTIDADE_DA_COLECAO[colecao];
    for (const { dados, pasta, arquivo } of registros[colecao]) {
      const { editorial } = dados;
      const report = (severidade: Severidade, codigo: DiagnosticCode, mensagem: string) =>
        diagnostics.push({
          severidade,
          codigo,
          arquivo,
          entidade,
          id: dados.id,
          campo: "editorial.estado",
          mensagem,
        });

      if (editorial.estado === "revisado") {
        if (pasta === "published") {
          candidatos[colecao].add(dados.id);
        } else {
          report(
            "pendencia",
            "revisado-em-rascunhos",
            `Marcado como revisado, mas está em ${pastas.drafts}. Para entrar na publicação, mova o registro para ${pastas.published}.`,
          );
        }
        continue;
      }

      if (pasta === "published") {
        report(
          "pendencia",
          "nao-revisado",
          `Estado "${editorial.estado}" em ${pastas.published}: fica fora da publicação até ser revisado.${describePending(editorial)}`,
        );
      } else {
        report(
          "pendencia",
          "rascunho",
          `Fora da publicação (estado "${editorial.estado}").${describePending(editorial)}`,
        );
      }
      if ((editorial.pendencias ?? []).length === 0) {
        report(
          "aviso",
          "rascunho-sem-pendencia",
          "Registro em pesquisa sem dizer o que falta. Descreva a pendência em editorial.pendencias.",
        );
      }
    }
  }

  // -------------------------------------------------------------------------
  // 4. Relações entre registros
  // -------------------------------------------------------------------------

  const porId = {
    pessoas: indexById(registros.pessoas),
    mandatos: indexById(registros.mandatos),
    filiacoes: indexById(registros.filiacoes),
    acontecimentos: indexById(registros.acontecimentos),
    proposicoes: indexById(registros.proposicoes),
    votacoes: indexById(registros.votacoes),
    votos: indexById(registros.votos),
    atosExecutivos: indexById(registros.atosExecutivos),
    coberturaPolitica: indexById(registros.coberturaPolitica),
    identidadesInstitucionais: indexById(registros.identidadesInstitucionais),
    lugares: indexById(registros.lugares),
    fontes: indexById(registros.fontes),
    imagens: indexById(registros.imagens),
  };

  const usados: Record<ColecaoDeReferencia, Set<string>> = { lugares: new Set(), fontes: new Set(), imagens: new Set() };
  const corte = edicao === null ? null : calcInterval({ valor: edicao.dataDeCorte, precisao: "dia" });

  /** Por que o alvo de uma referência não entra na publicação; `null` se entra. */
  const whyNotPublishable = (colecao: Colecao, id: string): string | null => {
    const alvo = porId[colecao].get(id);
    if (alvo === undefined) return null;
    if (alvo.pasta === "drafts") return `está em ${pastas.drafts}`;
    if (isFactual(colecao) && !candidatos[colecao].has(id)) {
      const estado = (alvo.dados as { editorial: Editorial }).editorial.estado;
      return `estado "${estado}"`;
    }
    return null;
  };

  interface Context {
    entidade: DiagnosticEntity;
    id: string;
    arquivo: string;
    /** O problema atinge a publicação: vira erro. Caso contrário, pendência. */
    strict: boolean;
  }

  const relate = (ctx: Context, codigo: DiagnosticCode, campo: string, mensagem: string) =>
    diagnostics.push({
      severidade: ctx.strict ? "erro" : "pendencia",
      codigo,
      arquivo: ctx.arquivo,
      entidade: ctx.entidade,
      id: ctx.id,
      campo,
      mensagem,
    });

  const checkReference = (ctx: Context, colecao: Colecao, id: string, campo: string) => {
    const alvo = ENTIDADE_DA_COLECAO[colecao];
    if (isReference(colecao)) usados[colecao].add(id);

    if (!porId[colecao].has(id)) {
      if (!recusados.has(`${colecao}:${id}`)) {
        relate(ctx, "referencia-inexistente", campo, `Referência a ${alvo} inexistente: "${id}".`);
      }
      return;
    }
    const motivo = ctx.strict ? whyNotPublishable(colecao, id) : null;
    if (motivo !== null) {
      relate(
        ctx,
        "referencia-fora-da-publicacao",
        campo,
        `Depende de ${alvo} "${id}", que não entra na publicação (${motivo}).`,
      );
    }
  };

  const checkCitations = (ctx: Context, citacoes: readonly Citacao[]) => {
    citacoes.forEach((citacao, indice) => {
      checkReference(ctx, "fontes", citacao.fonteId, `fontes[${indice}].fonteId`);
    });
  };

  const checkRepeated = (ctx: Context, ids: readonly string[], campo: string, alvo: string) => {
    const repetidos = ids.filter((id, indice) => ids.indexOf(id) !== indice);
    for (const id of new Set(repetidos)) {
      diagnostics.push({
        severidade: "erro",
        codigo: "referencia-repetida",
        arquivo: ctx.arquivo,
        entidade: ctx.entidade,
        id: ctx.id,
        campo,
        mensagem: `O mesmo ${alvo} aparece mais de uma vez: "${id}".`,
      });
    }
  };

  const checkPeriodAgainstCut = (ctx: Context, periodo: Periodo, campo = "periodo") => {
    if (corte === null || edicao === null) return;
    for (const lado of ["inicio", "fim"] as const) {
      const limite = periodo[lado];
      if (limite.tipo !== "data" || calcInterval(limite).inicio <= corte.fim) continue;
      relate(
        ctx,
        "data-apos-corte",
        `${campo}.${lado}`,
        lado === "fim"
          ? `Fim (${formatDate(limite)}) posterior à data de corte da edição (${edicao.dataDeCorte}). Um período vigente na data de corte usa "em-curso".`
          : `Início (${formatDate(limite)}) posterior à data de corte da edição (${edicao.dataDeCorte}).`,
      );
    }
  };

  const checkDateAgainstCut = (ctx: Context, data: DataHistorica, campo: string) => {
    if (corte === null || edicao === null) return;
    if (calcInterval(data).inicio > corte.fim) {
      relate(ctx, "data-apos-corte", campo, `Data (${formatDate(data)}) posterior à data de corte da edição (${edicao.dataDeCorte}).`);
    }
  };

  /**
   * O mandato pelo qual a pessoa agiu: precisa ser dela, da casa da decisão e
   * tocar a data. Fora do período documentado é problema; período que não
   * basta para decidir é aviso, e a consulta responde "competência não
   * confirmada".
   */
  const checkMandate = (ctx: Context, pessoaId: string, mandatoId: string, data: DataHistorica, campo: string, casa?: string) => {
    const mandato = porId.mandatos.get(mandatoId)?.dados;
    if (mandato === undefined || edicao === null) return;
    if (mandato.pessoaId !== pessoaId) {
      // Com a pessoa do mandato inexistente, o problema já está apontado no mandato: sem cascata.
      if (porId.pessoas.has(mandato.pessoaId)) {
        relate(ctx, "mandato-de-outra-pessoa", campo, `O mandato "${mandatoId}" é de outra pessoa ("${mandato.pessoaId}").`);
      }
      return;
    }
    if (casa !== undefined && mandato.casa !== undefined && mandato.casa !== casa) {
      relate(ctx, "casa-diferente", campo, `O mandato é da casa "${mandato.casa}", e a decisão é de "${casa}".`);
    }
    const competencia = competenceOf(mandato, data, edicao.dataDeCorte);
    if (competencia === "fora") {
      relate(ctx, "fora-do-mandato", campo, `A data da decisão (${formatDate(data)}) fica fora do período documentado do mandato "${mandatoId}".`);
    } else if (competencia === "nao-confirmada" || (casa !== undefined && mandato.casa === undefined)) {
      diagnostics.push({
        severidade: "aviso",
        codigo: "competencia-nao-confirmada",
        arquivo: ctx.arquivo,
        entidade: ctx.entidade,
        id: ctx.id,
        campo,
        mensagem:
          mandato.casa === undefined && casa !== undefined
            ? `O mandato "${mandatoId}" não declara a casa (campo "casa"): a consulta comparativa responderá "competência não confirmada".`
            : `As datas documentadas do mandato "${mandatoId}" não bastam para confirmar que ele vigorava em ${formatDate(data)}.`,
      });
    }
  };

  for (const { dados, pasta, arquivo } of registros.pessoas) {
    const ctx: Context = {
      entidade: "pessoa",
      id: dados.id,
      arquivo,
      strict: pasta === "published" && candidatos.pessoas.has(dados.id),
    };
    if (dados.retratoId !== null) checkReference(ctx, "imagens", dados.retratoId, "retratoId");
    checkCitations(ctx, dados.fontes);
  }

  for (const colecao of ["mandatos", "filiacoes"] as const) {
    for (const { dados, arquivo } of registros[colecao]) {
      const ctx: Context = {
        entidade: ENTIDADE_DA_COLECAO[colecao],
        id: dados.id,
        arquivo,
        strict: candidatos[colecao].has(dados.id),
      };
      checkReference(ctx, "pessoas", dados.pessoaId, "pessoaId");
      checkCitations(ctx, dados.fontes);
      checkPeriodAgainstCut(ctx, dados.periodo);
    }
  }

  for (const { dados, arquivo } of registros.acontecimentos) {
    const ctx: Context = {
      entidade: "acontecimento",
      id: dados.id,
      arquivo,
      strict: candidatos.acontecimentos.has(dados.id),
    };

    checkRepeated(ctx, dados.pessoaIds, "pessoaIds", "identificador de pessoa");
    for (const pessoaId of new Set(dados.pessoaIds)) {
      checkReference(ctx, "pessoas", pessoaId, "pessoaIds");
    }

    if (dados.localizacao.tipo === "lugares") {
      const { lugarIds } = dados.localizacao;
      checkRepeated(ctx, lugarIds, "localizacao.lugarIds", "identificador de lugar");
      for (const lugarId of new Set(lugarIds)) {
        checkReference(ctx, "lugares", lugarId, "localizacao.lugarIds");
      }
    }

    if (dados.imagemId !== null) checkReference(ctx, "imagens", dados.imagemId, "imagemId");
    checkCitations(ctx, dados.fontes);
    checkDateAgainstCut(ctx, dados.data, "data");
  }

  // -------------------------------------------------------------------------
  // 4b. Decisões políticas: referências, competência, voto vigente, retificação
  // -------------------------------------------------------------------------

  const contexto = (colecao: ColecaoFactual, dados: { id: string }, arquivo: string): Context => ({
    entidade: ENTIDADE_DA_COLECAO[colecao],
    id: dados.id,
    arquivo,
    strict: candidatos[colecao].has(dados.id),
  });

  for (const { dados, arquivo } of registros.proposicoes) {
    checkCitations(contexto("proposicoes", dados, arquivo), dados.fontes);
  }

  for (const { dados, arquivo } of registros.votacoes) {
    const ctx = contexto("votacoes", dados, arquivo);
    checkReference(ctx, "proposicoes", dados.proposicaoId, "proposicaoId");
    if (dados.objeto.textoReferencia !== null) {
      checkReference(ctx, "fontes", dados.objeto.textoReferencia.fonteId, "objeto.textoReferencia.fonteId");
    }
    checkCitations(ctx, dados.fontes);
    checkDateAgainstCut(ctx, dados.data, "data");
  }

  // Uma linha vigente por pessoa e votação. Com um dos dois fora da publicação, é só pendência.
  const vigentes = new Map<string, { id: string; strict: boolean }>();
  for (const { dados, arquivo } of registros.votos) {
    const ctx = contexto("votos", dados, arquivo);
    checkReference(ctx, "pessoas", dados.pessoaId, "pessoaId");
    checkReference(ctx, "mandatos", dados.mandatoId, "mandatoId");
    checkReference(ctx, "votacoes", dados.votacaoId, "votacaoId");
    checkCitations(ctx, dados.fontes);
    const votacao = porId.votacoes.get(dados.votacaoId)?.dados;
    if (votacao !== undefined) checkMandate(ctx, dados.pessoaId, dados.mandatoId, votacao.data, "mandatoId", votacao.instituicao);

    if (dados.situacao.tipo === "vigente") {
      const chave = `${dados.votacaoId}:${dados.pessoaId}`;
      const outro = vigentes.get(chave);
      if (outro === undefined) {
        vigentes.set(chave, { id: dados.id, strict: ctx.strict });
      } else {
        relate(
          { ...ctx, strict: ctx.strict && outro.strict },
          "voto-repetido",
          "situacao",
          `Já há um voto vigente desta pessoa nesta votação: "${outro.id}". Retifique um dos dois (situacao.tipo "retificado", apontando o que vale).`,
        );
      }
      continue;
    }
    const substituto = porId.votos.get(dados.situacao.substituidoPor)?.dados;
    if (substituto === undefined) {
      checkReference(ctx, "votos", dados.situacao.substituidoPor, "situacao.substituidoPor");
    } else if (substituto.votacaoId !== dados.votacaoId || substituto.pessoaId !== dados.pessoaId) {
      relate(ctx, "retificacao-incoerente", "situacao.substituidoPor", `O voto "${substituto.id}" é de outra votação ou de outra pessoa: não pode substituir este.`);
    }
  }

  for (const { dados, arquivo } of registros.atosExecutivos) {
    const ctx = contexto("atosExecutivos", dados, arquivo);
    checkReference(ctx, "pessoas", dados.atribuicao.pessoaId, "atribuicao.pessoaId");
    checkReference(ctx, "mandatos", dados.atribuicao.mandatoId, "atribuicao.mandatoId");
    checkMandate(ctx, dados.atribuicao.pessoaId, dados.atribuicao.mandatoId, dados.data, "atribuicao.mandatoId");
    checkRepeated(ctx, dados.proposicaoIds, "proposicaoIds", "identificador de proposição");
    for (const id of new Set(dados.proposicaoIds)) checkReference(ctx, "proposicoes", id, "proposicaoIds");
    checkReference(ctx, "fontes", dados.atoOficial.fonteId, "atoOficial.fonteId");
    checkCitations(ctx, dados.fontes);
    checkDateAgainstCut(ctx, dados.data, "data");
  }

  for (const { dados, arquivo } of registros.coberturaPolitica) {
    const ctx = contexto("coberturaPolitica", dados, arquivo);
    checkReference(ctx, "pessoas", dados.pessoaId, "pessoaId");
    checkCitations(ctx, dados.fontes);
    checkPeriodAgainstCut(ctx, dados.periodo);
  }

  for (const { dados, arquivo } of registros.identidadesInstitucionais) {
    const ctx = contexto("identidadesInstitucionais", dados, arquivo);
    checkReference(ctx, "pessoas", dados.pessoaId, "pessoaId");
    checkCitations(ctx, dados.fontes);
    if (dados.validade !== null) checkPeriodAgainstCut(ctx, dados.validade, "validade");
  }

  // -------------------------------------------------------------------------
  // 5. Fontes e imagens em si
  // -------------------------------------------------------------------------

  for (const { dados, pasta, arquivo } of registros.fontes) {
    const { dataDocumento } = dados;
    if (dataDocumento.tipo !== "data") continue;
    const acesso = calcInterval({ valor: dados.acessadoEm, precisao: "dia" });
    if (calcInterval(dataDocumento).inicio > acesso.fim) {
      relate(
        { entidade: "fonte", id: dados.id, arquivo, strict: pasta === "published" },
        "fonte-incoerente",
        "dataDocumento",
        `Data do documento (${formatDate(dataDocumento)}) posterior à data de acesso (${formatDate({ valor: dados.acessadoEm, precisao: "dia" })}).`,
      );
    }
  }

  for (const { dados, pasta, arquivo } of registros.imagens) {
    const ctx: Context = { entidade: "imagem", id: dados.id, arquivo, strict: pasta === "published" };
    const sonda = Object.hasOwn(sources.midia, dados.arquivo) ? sources.midia[dados.arquivo] : undefined;

    if (sonda === undefined || !sonda.existe) {
      relate(ctx, "midia-ausente", "arquivo", `Arquivo não encontrado: public${dados.arquivo}.`);
      continue;
    }

    const extensao = dados.arquivo.slice(dados.arquivo.lastIndexOf(".") + 1);
    if (sonda.formato === null || sonda.formato !== FORMATO_DA_EXTENSAO[extensao]) {
      relate(
        ctx,
        "midia-invalida",
        "arquivo",
        `O conteúdo de public${dados.arquivo} não corresponde à extensão .${extensao}${sonda.formato === null ? "" : ` (o arquivo é ${sonda.formato})`}.`,
      );
      continue;
    }

    const { dimensoes } = dados;
    if (
      dimensoes !== undefined &&
      sonda.largura !== null &&
      sonda.altura !== null &&
      (dimensoes.largura !== sonda.largura || dimensoes.altura !== sonda.altura)
    ) {
      relate(
        ctx,
        "midia-dimensoes",
        "dimensoes",
        `Dimensões declaradas (${dimensoes.largura}×${dimensoes.altura}) diferentes das do arquivo (${sonda.largura}×${sonda.altura}).`,
      );
    }
  }

  // -------------------------------------------------------------------------
  // 6. Edição: cobertura e registro de alterações
  // -------------------------------------------------------------------------

  if (edicao !== null && corte !== null) {
    const ctx: Context = {
      entidade: "edicao",
      id: edicao.versao,
      arquivo: edicaoArquivo,
      strict: true,
    };
    const cobertos = new Set<string>();

    edicao.cobertura.forEach((cobertura, indice) => {
      const campo = `cobertura[${indice}].pessoaId`;
      if (cobertos.has(cobertura.pessoaId)) {
        diagnostics.push({
          severidade: "erro",
          codigo: "referencia-repetida",
          arquivo: edicaoArquivo,
          entidade: "edicao",
          id: edicao.versao,
          campo,
          mensagem: `A cobertura da pessoa "${cobertura.pessoaId}" aparece mais de uma vez.`,
        });
      }
      cobertos.add(cobertura.pessoaId);
      checkReference(ctx, "pessoas", cobertura.pessoaId, campo);
    });

    edicao.alteracoes.forEach((alteracao, indice) => {
      alteracao.itens.forEach((item, posicao) => {
        if (porId[COLECAO_DA_ENTIDADE[item.entidade]].has(item.id)) return;
        diagnostics.push({
          severidade: "aviso",
          codigo: "alteracao-sem-registro",
          arquivo: edicaoArquivo,
          entidade: "edicao",
          id: edicao.versao,
          campo: `alteracoes[${indice}].itens[${posicao}]`,
          mensagem: `O registro de alterações cita ${item.entidade} "${item.id}", que não existe no conteúdo.`,
        });
      });
    });

    // Cobertura declarada e registros precisam contar a mesma história.
    for (const { dados, arquivo } of registros.pessoas) {
      if (!candidatos.pessoas.has(dados.id) || cobertos.has(dados.id)) continue;
      diagnostics.push({
        severidade: "aviso",
        codigo: "sem-cobertura",
        arquivo,
        entidade: "pessoa",
        id: dados.id,
        campo: null,
        mensagem:
          "A edição não declara o período coberto para esta pessoa. Sem isso a comparação não distingue falta de registro de período não pesquisado.",
      });
    }

    for (const { dados, arquivo } of registros.acontecimentos) {
      if (!candidatos.acontecimentos.has(dados.id)) continue;
      const data = calcInterval(dados.data);
      for (const cobertura of edicao.cobertura) {
        if (!dados.pessoaIds.includes(cobertura.pessoaId)) continue;
        const limites = calcPeriodBounds(cobertura.periodo, edicao.dataDeCorte);
        const antes = limites.inicio !== null && data.fim < limites.inicio.inicio;
        const depois = limites.fim !== null && data.inicio > limites.fim.fim;
        if (!antes && !depois) continue;
        diagnostics.push({
          severidade: "aviso",
          codigo: "fora-da-cobertura",
          arquivo,
          entidade: "acontecimento",
          id: dados.id,
          campo: "data",
          mensagem: `Data (${formatDate(dados.data)}) fora do período que a edição declara cobrir para "${cobertura.pessoaId}". Ajuste a cobertura em ${EDITION_FILE} ou confira a data.`,
        });
      }
    }

    // Duas filiações da mesma pessoa não deveriam valer ao mesmo tempo.
    const filiacoes = registros.filiacoes.filter(({ dados }) => candidatos.filiacoes.has(dados.id));
    filiacoes.forEach((a, indice) => {
      for (const b of filiacoes.slice(indice + 1)) {
        if (a.dados.pessoaId !== b.dados.pessoaId) continue;
        const la = calcPeriodBounds(a.dados.periodo, edicao.dataDeCorte);
        const lb = calcPeriodBounds(b.dados.periodo, edicao.dataDeCorte);
        // Só com os quatro limites conhecidos dá para afirmar a sobreposição.
        if (la.inicio === null || la.fim === null || lb.inicio === null || lb.fim === null) continue;
        const inicio = Math.max(la.inicio.fim, lb.inicio.fim);
        const fim = Math.min(la.fim.inicio, lb.fim.inicio);
        if (inicio >= fim) continue;
        diagnostics.push({
          severidade: "aviso",
          codigo: "filiacoes-sobrepostas",
          arquivo: b.arquivo,
          entidade: "filiacao",
          id: b.dados.id,
          campo: "periodo",
          mensagem: `O período se sobrepõe ao da filiação "${a.dados.id}" (${a.dados.partido.sigla}). Confira as datas nas fontes.`,
        });
      }
    });
  }

  // -------------------------------------------------------------------------
  // 7. Registros de referência que ninguém usa
  // -------------------------------------------------------------------------

  for (const colecao of ["lugares", "fontes", "imagens"] as const) {
    for (const { dados, arquivo } of registros[colecao]) {
      if (usados[colecao].has(dados.id)) continue;
      diagnostics.push({
        severidade: "aviso",
        codigo: "sem-uso",
        arquivo,
        entidade: ENTIDADE_DA_COLECAO[colecao],
        id: dados.id,
        campo: null,
        mensagem: "Nenhum registro usa este item. Ele fica fora dos dados públicos.",
      });
    }
  }

  return { pastas, edicao, registros, candidatos, diagnostics };
}
