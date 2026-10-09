// Montagem da lista cronológica. Funções puras: recebem os acontecimentos já
// em ordem (a ordem é da camada de dados) e dizem duas coisas que a ordem
// sozinha não diz:
//
//   1. entre quais registros a posição não é sustentada pelas datas;
//   2. onde ficam os períodos em que o conjunto não tem registro nenhum.
//
// Uma lista sempre põe um item antes do outro. Quando a data de um deles é só
// o ano, essa posição é regra de ordenação, e não fato documentado.

import type { YearSpan } from "@/lib/data/coverage";
import { calcInterval, yearOf, type DataHistorica } from "@/lib/domain/dates";

interface Dated {
  id: string;
  data: DataHistorica;
}

/**
 * `id` dos registros cuja posição em relação a algum outro da lista as datas
 * não decidem. Dois registros ficam assim quando os dias que as datas podem
 * representar se cruzam: o mesmo dia, ou uma data parcial que contém a outra.
 * Em um par de precisões diferentes, só o menos preciso é marcado: é a data
 * dele que deixa a ordem em aberto.
 */
export function findUndeterminedOrder(items: readonly Dated[]): Set<string> {
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

/** A parte de cada lacuna que cai dentro do recorte de anos. */
export function clipGaps(lacunas: readonly YearSpan[], recorte: YearSpan): YearSpan[] {
  return lacunas.flatMap((lacuna) => {
    const de = Math.max(lacuna.de, recorte.de);
    const ate = Math.min(lacuna.ate, recorte.ate);
    return de <= ate ? [{ de, ate }] : [];
  });
}

export type ChronologyRow<T> =
  | { tipo: "acontecimento"; item: T; ordemEmAberto: boolean }
  | { tipo: "lacuna"; de: number; ate: number };

/**
 * As linhas da lista: os acontecimentos, na ordem recebida, e cada lacuna no
 * lugar que os anos dela ocupam. Uma lacuna é um período em que o conjunto não
 * tem registro; não é afirmação sobre o que aconteceu.
 */
export function buildChronology<T extends Dated>(
  items: readonly T[],
  lacunas: readonly YearSpan[] = [],
): ChronologyRow<T>[] {
  const emAberto = findUndeterminedOrder(items);
  const pendentes = [...lacunas].sort((a, b) => a.de - b.de);
  const linhas: ChronologyRow<T>[] = [];

  for (const item of items) {
    const ano = yearOf(item.data);
    while (pendentes.length > 0 && pendentes[0]!.ate < ano) {
      linhas.push({ tipo: "lacuna", ...pendentes.shift()! });
    }
    linhas.push({ tipo: "acontecimento", item, ordemEmAberto: emAberto.has(item.id) });
  }
  for (const lacuna of pendentes) linhas.push({ tipo: "lacuna", ...lacuna });

  return linhas;
}
