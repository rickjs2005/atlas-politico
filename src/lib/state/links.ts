// Endereços que levam a consulta de uma tela para outra: da exploração e da
// comparação para a página de um acontecimento, e de volta. Módulo puro.
//
// A página de um acontecimento é o endereço para compartilhar, e abre sozinha.
// Quando a pessoa chega a ela por dentro do atlas, o link leva junto o recorte
// de onde ela veio (`de`, `ate`, `categorias` e, vindo da comparação,
// `origem=comparar`). É esse contexto que permite voltar para a mesma
// consulta sem depender do histórico do navegador (docs/PAGES.md).

import type { YearSpan } from "@/lib/data/coverage";
import { CATEGORY_LABELS } from "@/lib/domain/categories";
import { formatYearRange, yearOf } from "@/lib/domain/dates";
import type { Acontecimento } from "@/lib/domain/types";

import { fitPeriod, type AtlasState } from "./atlas-state";
import { parseAtlasParams, serializeAtlasParams, type UrlState } from "./url-params";

/** Período e categorias: o que se leva de uma tela para outra. */
export type Recorte = Pick<AtlasState, "periodo" | "categorias">;

/** Parâmetro que diz de que tela a pessoa veio: a comparação ou o jogo. */
export const ORIGIN_PARAM = "origem";
export const ORIGIN_COMPARISON = "comparar";
export const ORIGIN_GAME = "jogo";
/** Com `origem=jogo`, o personagem cujo capítulo estava aberto. */
export const GAME_PERSON_PARAM = "personagem";

const PERSON_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * A entrada do jogo, o jogo de um personagem (a sala Histórico, a trajetória
 * em capítulos) ou uma sala temática dele.
 */
export function gameHref(personagem?: string, sala?: string): string {
  if (personagem === undefined) return "/jogo/";
  return sala === undefined || sala === "historico" ? `/jogo/${personagem}/` : `/jogo/${personagem}/${sala}/`;
}

/** A página de uma pessoa, aberta na decisão: o cartão dela na seção de decisões. */
export function decisionHref(pessoaSlug: string, decisaoId: string): string {
  return `/politicos/${pessoaSlug}/#decisao-${encodeURIComponent(decisaoId)}`;
}

/**
 * A página de um acontecimento aberta de dentro do jogo. O endereço diz de
 * onde a pessoa veio, para a página oferecer a volta ao capítulo. O progresso
 * do jogo não vai no endereço: fica guardado no navegador.
 */
export function eventHrefFromGame(slug: string, personagem: string): string {
  return `/acontecimentos/${slug}/?${ORIGIN_PARAM}=${ORIGIN_GAME}&${GAME_PERSON_PARAM}=${encodeURIComponent(personagem)}`;
}

/**
 * A volta ao jogo, para quem veio dele. Só existe com `origem=jogo` e um
 * personagem que seja uma das pessoas do acontecimento; qualquer outra coisa
 * é descartada, e a página não supõe um jogo.
 */
export function gameReturn(search: string, people: readonly { slug: string; nome: string }[]): { href: string; pessoa: { slug: string; nome: string } } | null {
  const params = new URLSearchParams(search);
  if (params.get(ORIGIN_PARAM) !== ORIGIN_GAME) return null;
  const personagem = params.get(GAME_PERSON_PARAM);
  if (personagem === null || !PERSON_SLUG.test(personagem)) return null;
  const pessoa = people.find((item) => item.slug === personagem);
  if (pessoa === undefined) return null;
  return { href: gameHref(pessoa.slug), pessoa };
}

const SEM_RECORTE: Recorte = { periodo: { de: null, ate: null }, categorias: [] };

const withQuery = (path: string, query: string) => (query === "" ? path : `${path}?${query}`);

export function hasRecorte(recorte: Recorte): boolean {
  return recorte.categorias.length > 0 || recorte.periodo.de !== null || recorte.periodo.ate !== null;
}

/**
 * O recorte por extenso, como `2016–2019 · marcos históricos`. `limites` são
 * os anos que a tela de destino cobre, para dizer o lado que ficou aberto.
 */
export function describeRecorte(recorte: Recorte, limites: YearSpan | null): string {
  const { de, ate } = recorte.periodo;
  const partes: string[] = [];
  if (de !== null || ate !== null) {
    if (limites !== null) partes.push(formatYearRange(de ?? limites.de, ate ?? limites.ate));
    else if (de !== null && ate !== null) partes.push(formatYearRange(de, ate));
    else partes.push(de !== null ? `desde ${de}` : `até ${ate}`);
  }
  if (recorte.categorias.length > 0) {
    partes.push(recorte.categorias.map((categoria) => CATEGORY_LABELS[categoria].toLowerCase()).join(", "));
  }
  return partes.join(" · ");
}

// ---------------------------------------------------------------------------
// Endereços das telas
// ---------------------------------------------------------------------------

/** A exploração de uma pessoa, com a consulta. */
export function explorationHref(slug: string, state: UrlState): string {
  return withQuery(`/politicos/${slug}/`, serializeAtlasParams(state));
}

/** A comparação, com o recorte. */
export function comparisonHref(recorte: Recorte = SEM_RECORTE): string {
  return withQuery("/comparar/", serializeAtlasParams({ ...recorte, acontecimento: null }));
}

/**
 * A página de um acontecimento. Com `contexto`, o endereço leva o recorte de
 * onde a pessoa vem, para o retorno poder devolvê-lo.
 */
export function eventHref(
  slug: string,
  contexto?: { recorte: Recorte; origem?: typeof ORIGIN_COMPARISON },
): string {
  const path = `/acontecimentos/${slug}/`;
  if (!contexto) return path;
  const partes = [serializeAtlasParams({ ...contexto.recorte, acontecimento: null })];
  if (contexto.origem) partes.push(`${ORIGIN_PARAM}=${contexto.origem}`);
  return withQuery(path, partes.filter((parte) => parte !== "").join("&"));
}

// ---------------------------------------------------------------------------
// De uma tela para outra
// ---------------------------------------------------------------------------

/**
 * O recorte da exploração de uma pessoa levado à comparação. Um lado aberto na
 * exploração quer dizer "até o limite da cobertura desta pessoa"; na
 * comparação, o limite é o da escala comum. Para o período consultado
 * continuar o mesmo, o lado aberto recebe o limite da pessoa antes do ajuste.
 */
export function carryToComparison(
  recorte: Recorte,
  cobertura: YearSpan | null,
  escala: YearSpan | null,
): Recorte {
  const { de, ate } = recorte.periodo;
  if (cobertura === null || escala === null || (de === null && ate === null)) return recorte;
  return {
    categorias: recorte.categorias,
    periodo: fitPeriod({ de: de ?? cobertura.de, ate: ate ?? cobertura.ate }, escala),
  };
}

/** O recorte da comparação levado à exploração de uma pessoa: ajustado à cobertura dela. */
export function carryFromComparison(recorte: Recorte, cobertura: YearSpan | null): Recorte {
  if (cobertura === null) return recorte;
  return { categorias: recorte.categorias, periodo: fitPeriod(recorte.periodo, cobertura) };
}

// ---------------------------------------------------------------------------
// Retorno da página de um acontecimento
// ---------------------------------------------------------------------------

export interface ReturnContext {
  /** O recorte que veio no endereço, já sem o que era inválido. */
  recorte: Recorte;
  /** A pessoa veio da comparação. */
  comparar: boolean;
}

/** O contexto de onde a pessoa veio, lido da query string da página do acontecimento. */
export function readReturnContext(search: string): ReturnContext {
  const params = new URLSearchParams(search);
  const { periodo, categorias } = parseAtlasParams(params);
  return { recorte: { periodo, categorias }, comparar: params.get(ORIGIN_PARAM) === ORIGIN_COMPARISON };
}

/** O recorte contém o acontecimento? */
function holds(recorte: Recorte, acontecimento: Pick<Acontecimento, "data" | "categoria">): boolean {
  const ano = yearOf(acontecimento.data);
  const { de, ate } = recorte.periodo;
  if (de !== null && ano < de) return false;
  if (ate !== null && ano > ate) return false;
  return recorte.categorias.length === 0 || recorte.categorias.includes(acontecimento.categoria);
}

export interface ReturnLink {
  href: string;
  /** O recorte que o link devolve; `null` quando volta só com o acontecimento. */
  recorte: Recorte | null;
}

/**
 * Volta à exploração de uma pessoa, com o acontecimento aberto. O recorte de
 * antes segue junto, ajustado à cobertura da pessoa. Se ele não contiver o
 * acontecimento (endereço editado à mão, por exemplo), é descartado: o
 * retorno nunca deixa de abrir o acontecimento.
 */
export function profileReturn(
  search: string,
  acontecimento: Pick<Acontecimento, "slug" | "data" | "categoria">,
  alvo: { slug: string; cobertura: YearSpan | null },
): ReturnLink {
  const { recorte } = readReturnContext(search);
  const ajustado = carryFromComparison(recorte, alvo.cobertura);
  const leva = hasRecorte(ajustado) && holds(ajustado, acontecimento);
  return {
    href: explorationHref(alvo.slug, {
      ...(leva ? ajustado : SEM_RECORTE),
      acontecimento: acontecimento.slug,
    }),
    recorte: leva ? ajustado : null,
  };
}

/**
 * Volta à comparação, com o recorte de antes. Só existe para quem veio dela:
 * sem esse contexto, a página do acontecimento não supõe uma comparação.
 */
export function comparisonReturn(search: string, escala: YearSpan | null): ReturnLink | null {
  const { recorte, comparar } = readReturnContext(search);
  if (!comparar) return null;
  const ajustado = escala === null ? recorte : { ...recorte, periodo: fitPeriod(recorte.periodo, escala) };
  return { href: comparisonHref(ajustado), recorte: hasRecorte(ajustado) ? ajustado : null };
}
