// Ordem estável dos registros. É a mesma no gerador de dados, nas consultas e
// nos seletores, para a mesma entrada produzir sempre a mesma lista.

import { calcInterval, compareDates, type DataHistorica, type Periodo } from "./dates";

/**
 * Compara textos pela ordem dos códigos de caractere. Não usa `localeCompare`,
 * cujo resultado depende do idioma e da versão do ICU instalada na máquina.
 */
export function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * `id` dos registros cuja posição em relação a algum outro da lista as datas
 * não decidem. Dois registros ficam assim quando os dias que as datas podem
 * representar se cruzam: o mesmo dia, ou uma data parcial que contém a outra.
 * Em um par de precisões diferentes, só o menos preciso é marcado: é a data
 * dele que deixa a ordem em aberto.
 *
 * Uma lista sempre põe um item antes do outro. Quando a data de um deles é só
 * o ano, essa posição é regra de ordenação, e não fato documentado.
 */
export function findUndeterminedOrder(items: readonly { id: string; data: DataHistorica }[]): Set<string> {
  const intervalos = items.map((item) => calcInterval(item.data));
  const marcados = new Set<string>();

  items.forEach((item, indice) => {
    const proprio = intervalos[indice]!;
    const duracao = proprio.fim - proprio.inicio;
    const emAberto = intervalos.some((outro, outroIndice) => {
      if (outroIndice === indice) return false;
      const cruzam = proprio.inicio <= outro.fim && outro.inicio <= proprio.fim;
      return cruzam && duracao >= outro.fim - outro.inicio;
    });
    if (emAberto) marcados.add(item.id);
  });

  return marcados;
}

/** Ordem cronológica, com o `id` como desempate: dois registros nunca empatam. */
export function compareByDate(
  a: { id: string; data: DataHistorica },
  b: { id: string; data: DataHistorica },
): number {
  return compareDates(a.data, b.data) || compareText(a.id, b.id);
}

/**
 * Posição de um período na ordem de cálculo: o primeiro dia possível do
 * início; sem início conhecido, o do fim; sem nenhum dos dois, o fim da fila.
 * É regra de ordenação, e não uma data atribuída ao período.
 */
function periodPosition(periodo: Periodo): number {
  if (periodo.inicio.tipo === "data") return calcInterval(periodo.inicio).inicio;
  if (periodo.fim.tipo === "data") return calcInterval(periodo.fim).inicio;
  return Number.POSITIVE_INFINITY;
}

/** Mandatos e filiações: por pessoa, depois pela posição do período, depois pelo `id`. */
export function compareByPeriod(
  a: { id: string; pessoaId: string; periodo: Periodo },
  b: { id: string; pessoaId: string; periodo: Periodo },
): number {
  const pa = periodPosition(a.periodo);
  const pb = periodPosition(b.periodo);
  return (
    compareText(a.pessoaId, b.pessoaId) ||
    (pa === pb ? 0 : pa < pb ? -1 : 1) ||
    compareText(a.id, b.id)
  );
}
