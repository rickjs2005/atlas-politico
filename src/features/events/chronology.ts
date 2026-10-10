// Montagem da lista cronológica. Funções puras: recebem os acontecimentos já
// em ordem (a ordem é da camada de dados) e dizem duas coisas que a ordem
// sozinha não diz:
//
//   1. entre quais registros a posição não é sustentada pelas datas;
//   2. onde ficam os períodos em que o conjunto não tem registro nenhum.
//
// Uma lista sempre põe um item antes do outro. Quando a data de um deles é só
// o ano, essa posição é regra de ordenação, e não fato documentado. A regra do
// item 1 é do domínio (`findUndeterminedOrder`), porque o jogo usa a mesma.

import type { YearSpan } from "@/lib/data/coverage";
import { yearOf, type DataHistorica } from "@/lib/domain/dates";
import { findUndeterminedOrder } from "@/lib/domain/order";

export { findUndeterminedOrder };

interface Dated {
  id: string;
  data: DataHistorica;
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
