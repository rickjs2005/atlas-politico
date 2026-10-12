// As fontes de um registro, como o jogo as mostra: o documento, de quem é, de
// quando é e quando foi lido, onde está o trecho e o que ele sustenta. É a
// mesma informação da lista de fontes do atlas; nada é escrito aqui.

import { SOURCE_LINK } from "@/components/touch";
import { formatDate } from "@/lib/domain/dates";
import type { GameSource } from "@/lib/game/types";

export function SourceList({ fontes }: { fontes: readonly GameSource[] }) {
  if (fontes.length === 0) return null;
  return (
    <ol className="space-y-1.5 text-sm">
      {fontes.map((fonte) => (
        <li key={`${fonte.id}:${fonte.localizacao}`} data-fonte={fonte.id}>
          <a href={fonte.url} target="_blank" rel="noreferrer" className={SOURCE_LINK}>
            {fonte.titulo}
            <span className="sr-only"> (abre em nova aba)</span>
          </a>
          <span className="block text-xs text-ink-soft" data-documento>
            {fonte.autoria} · {fonte.dataDocumento.tipo === "data" ? `documento de ${formatDate(fonte.dataDocumento)}` : "data do documento desconhecida"} · acesso em{" "}
            {formatDate({ valor: fonte.acessadoEm, precisao: "dia" })}
          </span>
          <span className="block text-xs text-ink-soft" data-onde>
            Onde: {fonte.localizacao}
          </span>
          <span className="block text-xs text-ink-soft" data-evidencia>
            Sustenta: {fonte.evidencia}
          </span>
        </li>
      ))}
    </ol>
  );
}

/** O título de uma lista de fontes: "1 fonte" ou "3 fontes". */
export function sourceCount(fontes: readonly GameSource[]): string {
  return fontes.length === 1 ? "1 fonte" : `${fontes.length} fontes`;
}
