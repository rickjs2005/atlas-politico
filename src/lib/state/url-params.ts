// Tradução entre o estado e a query string. Pessoa e modo de comparação vêm
// da rota (`/politicos/<slug>`, `/comparar`); o resto vem destes parâmetros:
//
//   de, ate         ano com quatro dígitos
//   categorias      identificadores separados por vírgula
//   acontecimento   slug do acontecimento aberto
//
// A leitura é tolerante: cada parâmetro inválido é descartado sozinho, porque
// um endereço editado à mão não deve derrubar a página. A escrita é canônica:
// ordem fixa e valores padrão omitidos, para o mesmo estado gerar sempre o
// mesmo endereço.

import { CATEGORIAS, isCategoria } from "@/lib/domain/categories";
import { YEAR_BOUNDS } from "@/lib/domain/dates";

import { normalizePeriod, type AtlasState } from "./atlas-state";

export type UrlState = Pick<AtlasState, "periodo" | "categorias" | "acontecimento">;

/** Parâmetros que o atlas lê e escreve, na ordem em que aparecem no endereço. */
export const ATLAS_PARAMS = ["de", "ate", "categorias", "acontecimento"] as const;

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function parseYear(valor: string | null): number | null {
  if (valor === null || !/^\d{4}$/.test(valor)) return null;
  const ano = Number(valor);
  return ano >= YEAR_BOUNDS.min && ano <= YEAR_BOUNDS.max ? ano : null;
}

export function parseAtlasParams(params: URLSearchParams): UrlState {
  const informadas = new Set((params.get("categorias") ?? "").split(",").filter(isCategoria));
  const acontecimento = params.get("acontecimento");

  return {
    periodo: normalizePeriod(parseYear(params.get("de")), parseYear(params.get("ate"))),
    categorias: CATEGORIAS.filter((categoria) => informadas.has(categoria)),
    acontecimento: acontecimento !== null && SLUG.test(acontecimento) ? acontecimento : null,
  };
}

/** Devolve a query string sem o `?`; vazia quando o estado é o padrão. */
export function serializeAtlasParams(state: UrlState): string {
  const partes: string[] = [];
  const { de, ate } = normalizePeriod(state.periodo.de, state.periodo.ate);

  if (de !== null) partes.push(`de=${de}`);
  if (ate !== null) partes.push(`ate=${ate}`);

  const categorias = CATEGORIAS.filter((categoria) => state.categorias.includes(categoria));
  if (categorias.length > 0) partes.push(`categorias=${categorias.join(",")}`);

  if (state.acontecimento !== null) {
    partes.push(`acontecimento=${encodeURIComponent(state.acontecimento)}`);
  }

  return partes.join("&");
}

/**
 * A query string que o endereço deve ter para o estado, sem o `?`. Os
 * parâmetros do atlas vêm primeiro, na forma canônica; os que o atlas não
 * conhece (como os de campanha, `utm_*`) são mantidos depois, na ordem em que
 * estavam. Aplicar de novo ao próprio resultado não muda nada.
 */
export function mergeAtlasParams(search: string, state: UrlState): string {
  const conhecidos: readonly string[] = ATLAS_PARAMS;
  const outros: string[] = [];
  for (const [chave, valor] of new URLSearchParams(search)) {
    if (conhecidos.includes(chave)) continue;
    outros.push(`${encodeURIComponent(chave)}=${encodeURIComponent(valor)}`);
  }
  return [serializeAtlasParams(state), ...outros].filter((parte) => parte !== "").join("&");
}
