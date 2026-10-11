// O que o pipeline recebe: os arquivos editoriais já lidos do disco, ainda sem
// validar. Só tipos e constantes; quem abre os arquivos é `src/lib/content`.
//
// As fontes editoriais são duas pastas:
//   content/published/  a edição: `edicao.json` e as treze coleções;
//   content/drafts/     a pesquisa em andamento e o que chega por importação:
//                       coleções parciais, que podem citar registros da edição.
// As duas são lidas juntas, e cada registro lembra de qual pasta veio.

import type { Diagnostic, Entidade } from "./diagnostics";

export const COLECOES = [
  "pessoas",
  "mandatos",
  "filiacoes",
  "acontecimentos",
  "proposicoes",
  "votacoes",
  "votos",
  "atosExecutivos",
  "coberturaPolitica",
  "identidadesInstitucionais",
  "lugares",
  "fontes",
  "imagens",
] as const;
export type Colecao = (typeof COLECOES)[number];

/** Coleções com estado editorial: fazem afirmações que dependem de revisão. */
export const COLECOES_FACTUAIS = [
  "pessoas",
  "mandatos",
  "filiacoes",
  "acontecimentos",
  "proposicoes",
  "votacoes",
  "votos",
  "atosExecutivos",
  "coberturaPolitica",
  "identidadesInstitucionais",
] as const;
export type ColecaoFactual = (typeof COLECOES_FACTUAIS)[number];

/** Coleções de referência, sem estado editorial: entram pelo uso. */
export const COLECOES_DE_REFERENCIA = ["lugares", "fontes", "imagens"] as const;
export type ColecaoDeReferencia = (typeof COLECOES_DE_REFERENCIA)[number];

/**
 * Coleções factuais que exigem ao menos uma citação quando revisadas. A
 * cobertura da pesquisa fica de fora: a evidência dela são os acervos
 * consultados, que o próprio registro descreve.
 */
export const COLECOES_COM_CITACAO = COLECOES_FACTUAIS.filter((colecao) => colecao !== "coberturaPolitica") as readonly Exclude<ColecaoFactual, "coberturaPolitica">[];

export const ENTIDADE_DA_COLECAO: Record<Colecao, Entidade> = {
  pessoas: "pessoa",
  mandatos: "mandato",
  filiacoes: "filiacao",
  acontecimentos: "acontecimento",
  proposicoes: "proposicao",
  votacoes: "votacao",
  votos: "voto",
  atosExecutivos: "ato-executivo",
  coberturaPolitica: "cobertura-politica",
  identidadesInstitucionais: "identidade-institucional",
  lugares: "lugar",
  fontes: "fonte",
  imagens: "imagem",
};

export const COLECAO_DA_ENTIDADE = Object.fromEntries(
  COLECOES.map((colecao) => [ENTIDADE_DA_COLECAO[colecao], colecao]),
) as Record<Entidade, Colecao>;

export const EDITION_FILE = "edicao.json";
export const IMPORT_LOG_FILE = "importacoes.json";

export const PASTAS = ["published", "drafts"] as const;
export type Pasta = (typeof PASTAS)[number];

export function isColecao(valor: string): valor is Colecao {
  return (COLECOES as readonly string[]).includes(valor);
}

export function isFactual(colecao: Colecao): colecao is ColecaoFactual {
  return (COLECOES_FACTUAIS as readonly string[]).includes(colecao);
}

export function isReference(colecao: Colecao): colecao is ColecaoDeReferencia {
  return (COLECOES_DE_REFERENCIA as readonly string[]).includes(colecao);
}

/** Um objeto com uma lista vazia por coleção, para iniciar acumuladores sem repetir a lista. */
export function emptyByCollection<T>(): Record<Colecao, T[]> {
  return Object.fromEntries(COLECOES.map((colecao) => [colecao, [] as T[]])) as Record<Colecao, T[]>;
}

/** Um arquivo editorial lido: de onde veio e o JSON como está. */
export interface SourceFile {
  /** Caminho de exibição, a partir da raiz do projeto. */
  arquivo: string;
  pasta: Pasta;
  dados: unknown;
}

export const FORMATOS_DE_MIDIA = ["jpeg", "png", "webp", "avif", "svg"] as const;
export type FormatoDeMidia = (typeof FORMATOS_DE_MIDIA)[number];

/** O que se sabe do arquivo de uma imagem cadastrada. */
export interface MediaProbe {
  existe: boolean;
  bytes: number;
  /** Formato reconhecido pelo conteúdo do arquivo; `null` se não for nenhum dos aceitos. */
  formato: FormatoDeMidia | null;
  /** Dimensões lidas do arquivo, quando o formato permite. */
  largura: number | null;
  altura: number | null;
  sha256: string | null;
}

export interface Sources {
  /** Caminho de exibição de cada pasta, como `content/published`. */
  pastas: Record<Pasta, string>;
  /** `content/published/edicao.json`, ou `null` se não existe. */
  edicao: SourceFile | null;
  /** Para cada coleção, os arquivos encontrados: o da edição, o dos rascunhos, ambos ou nenhum. */
  colecoes: Record<Colecao, SourceFile[]>;
  /** `content/drafts/importacoes.json`, ou `null` se nunca houve importação. */
  importacoes: SourceFile | null;
  /** Problemas de leitura: JSON ilegível, arquivo fora do contrato. */
  problemas: Diagnostic[];
  /** Arquivos das imagens cadastradas, pela chave do campo `arquivo` (`/media/...`). */
  midia: Record<string, MediaProbe>;
}

export function emptySources(
  pastas: Record<Pasta, string> = { published: "content/published", drafts: "content/drafts" },
): Sources {
  return {
    pastas,
    edicao: null,
    colecoes: emptyByCollection<SourceFile>(),
    importacoes: null,
    problemas: [],
    midia: {},
  };
}
