"use client";

// O caminho de volta da página de um acontecimento.
//
// A página abre sozinha, por link direto, e nesse caso oferece o que é
// previsível: a exploração de cada pessoa ligada, com o acontecimento aberto.
// Quem chega por dentro do atlas traz no endereço o recorte de onde veio
// (`de`, `ate`, `categorias` e, vindo da comparação, `origem=comparar`), e os
// mesmos links passam a devolver esse recorte. Nada aqui depende do histórico
// do navegador.
//
// O HTML do build sai com os links sem recorte; o endereço é lido depois da
// hidratação (docs/PAGES.md, seção Retorno).

import Link from "next/link";

import type { YearSpan } from "@/lib/data/coverage";
import type { Acontecimento } from "@/lib/domain/types";
import { comparisonReturn, describeRecorte, profileReturn } from "@/lib/state/links";
import { UrlWatcher, useOwnSearch } from "@/lib/state/location";

interface EventReturnProps {
  event: Pick<Acontecimento, "slug" | "data" | "categoria">;
  /** As pessoas ligadas ao acontecimento, na ordem do registro. */
  people: readonly { slug: string; nome: string; cobertura: YearSpan | null }[];
  /** A escala de anos da comparação. */
  escala: YearSpan | null;
}

const link =
  "inline-flex min-h-11 flex-wrap items-center gap-x-1.5 font-medium underline decoration-line-strong hover:decoration-ink md:min-h-0";
const carried = "text-xs font-normal text-ink-soft";

export function EventReturn({ event, people, escala }: EventReturnProps) {
  const search = useOwnSearch(`/acontecimentos/${event.slug}`);
  const comparacao = comparisonReturn(search, escala);

  return (
    <nav aria-label="Voltar à exploração" className="mb-8 md:mb-10">
      <UrlWatcher />
      <ul className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
        {comparacao !== null && (
          <li>
            <Link href={comparacao.href} className={link} data-retorno="comparacao">
              <span>
                <span aria-hidden="true">←&nbsp;</span>
                Voltar à comparação
              </span>
              {comparacao.recorte !== null && (
                <span className={carried}>
                  com o recorte de antes: {describeRecorte(comparacao.recorte, escala)}
                </span>
              )}
            </Link>
          </li>
        )}
        {people.map((pessoa) => {
          const volta = profileReturn(search, event, pessoa);
          return (
            <li key={pessoa.slug}>
              <Link href={volta.href} className={link} data-retorno={pessoa.slug}>
                <span>
                  <span aria-hidden="true">←&nbsp;</span>
                  Trajetória de {pessoa.nome}
                </span>
                {volta.recorte !== null && (
                  <span className={carried}>
                    com o recorte de antes: {describeRecorte(volta.recorte, pessoa.cobertura)}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
