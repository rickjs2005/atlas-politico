// O estado da exploração e da comparação visto a partir do endereço. Módulo
// puro: recebe a query string como texto e devolve estado, ou o contrário.
// Quem fala com o navegador é `AtlasUrlStateProvider.tsx`.
//
// O endereço é a fonte da verdade (docs/TIMELINE.md, seção Endereço): o estado
// é sempre derivado dele, e uma ação do usuário vira um endereço novo.

import type { YearSpan } from "@/lib/data/coverage";
import type { AtlasData } from "@/lib/data/types";
import type { Acontecimento } from "@/lib/domain/types";

import { INITIAL_STATE, fitPeriod, type AtlasAction, type AtlasState } from "./atlas-state";
import { settle, transition } from "./selectors";
import { mergeAtlasParams, parseAtlasParams, type UrlState } from "./url-params";

/** O que a rota informa: de quem é a página, com quais dados e qual cobertura. */
export interface UrlContext {
  /** Slug da pessoa, tirado da rota. `null` na comparação, que não tem pessoa em foco. */
  pessoa: string | null;
  /** A rota é a comparação: as duas trajetórias no mesmo recorte. */
  comparar?: boolean;
  data: AtlasData;
  /**
   * Anos que podem ser consultados: a cobertura da edição para a pessoa ou, na
   * comparação, a escala comum às duas. `null` sem cobertura conhecida.
   */
  cobertura: YearSpan | null;
}

/**
 * O que a rota impõe ao estado. Na comparação, o recorte vale para as duas
 * pessoas e não há acontecimento aberto: cada um tem a própria página.
 */
function fitRoute(state: AtlasState, contexto: UrlContext): AtlasState {
  if (!contexto.comparar) return state;
  return { ...state, pessoa: null, comparar: true, acontecimento: null };
}

/**
 * Estado restaurado do endereço. Cada parâmetro inválido cai sozinho; o
 * período é ajustado à cobertura; um acontecimento que não existe, que é de
 * outro perfil ou que fica fora do recorte pedido não é aberto.
 */
export function stateFromSearch(search: string, contexto: UrlContext): AtlasState {
  const lido = parseAtlasParams(new URLSearchParams(search));
  return settle(
    fitRoute({ ...INITIAL_STATE, pessoa: contexto.pessoa, ...lido }, contexto),
    contexto.data,
    contexto.cobertura,
  );
}

/** O estado depois de uma ação, a partir do endereço do momento. */
export function stateAfter(search: string, action: AtlasAction, contexto: UrlContext): AtlasState {
  const atual = stateFromSearch(search, contexto);
  return fitRoute(transition(atual, action, contexto.data, contexto.cobertura), contexto);
}

/** A query string, sem o `?`, que representa o estado; mantém parâmetros alheios. */
export function searchFromState(search: string, state: UrlState): string {
  return mergeAtlasParams(search, state);
}

/** Dois endereços dizem a mesma coisa para o atlas? */
export function sameSearch(a: string, b: string): boolean {
  return a.replace(/^\?/, "") === b.replace(/^\?/, "");
}

/**
 * O recorte que acompanha a troca de pessoa. Período e categorias seguem
 * juntos, com o período ajustado à cobertura do outro perfil. O acontecimento
 * aberto só segue quando também é da outra pessoa.
 */
export function carryToPerson(
  state: UrlState,
  selected: Acontecimento | null,
  alvo: { id: string; cobertura: YearSpan | null },
): UrlState {
  return {
    periodo: alvo.cobertura === null ? state.periodo : fitPeriod(state.periodo, alvo.cobertura),
    categorias: state.categorias,
    acontecimento:
      selected !== null && selected.pessoaIds.includes(alvo.id) ? selected.slug : null,
  };
}

// ---------------------------------------------------------------------------
// Histórico
// ---------------------------------------------------------------------------

export type HistoryMode = "push" | "replace";

/** Intervalo em que ajustes seguidos do mesmo controle contam como um só. */
export const COALESCE_WINDOW_MS = 1000;

/** A última escrita no histórico: de que controle veio e quando. */
export interface HistoryWrite {
  grupo: string | null;
  em: number;
}

/**
 * Controles de ajuste contínuo. Percorrer os anos de um campo com as setas do
 * teclado dispara uma mudança por ano: sem agrupar, seriam dezenas de entradas.
 */
export function historyGroupOf(action: AtlasAction): string | null {
  return action.type === "setPeriod" ? "periodo" : null;
}

/**
 * Nova entrada ou substituição da atual.
 *
 *   - escolha discreta (acontecimento, categoria, limpar filtros): nova
 *     entrada, para o botão voltar desfazer a última escolha;
 *   - ajuste contínuo: a primeira mudança cria a entrada, e as seguintes, em
 *     menos de um segundo, a substituem;
 *   - restauração a partir do endereço: substitui, porque só corrige a forma.
 */
export function chooseHistoryMode(
  action: AtlasAction,
  anterior: HistoryWrite | null,
  agora: number,
): HistoryMode {
  if (action.type === "restore") return "replace";
  const grupo = historyGroupOf(action);
  const continua =
    grupo !== null &&
    anterior !== null &&
    anterior.grupo === grupo &&
    agora - anterior.em < COALESCE_WINDOW_MS;
  return continua ? "replace" : "push";
}
