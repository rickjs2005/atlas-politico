// As decisões de uma ou duas pessoas agrupadas por tema, para a página da
// pessoa e para a comparação. A tela mostra o que o conjunto registra: não
// soma, não ordena por quantidade e não conclui. Quando as duas pessoas têm
// decisão sobre a mesma proposição, a tela diz, com a diferença de
// instituição e de natureza à vista.

import { groupDecisionsByTheme, type DecisionView } from "@/lib/data/decisions";
import { TEMAS, TEMA_LABELS, type Tema } from "@/lib/domain/decisions";

import { DecisionCard, NATUREZA_LABEL } from "./DecisionCard";

export interface DecisionColumn {
  pessoa: { id: string; slug: string; nome: string };
  decisoes: readonly DecisionView[];
}

/** O aviso fixo de toda tela de decisões: amostra, não histórico completo; cargos diferentes não se equiparam. */
export const SAMPLE_NOTICE =
  "As decisões aqui são uma amostra documentada da edição, escolhida por abrangência, efeito institucional e qualidade da evidência, e não o histórico completo de nenhuma das pessoas. Um voto no Senado e um ato da Presidência são coisas diferentes: a tela mostra o cargo, a instituição e o objeto de cada decisão, e não os equipara.";

const temasPresentes = (colunas: readonly DecisionColumn[]): Tema[] => TEMAS.filter((tema) => colunas.some((coluna) => groupDecisionsByTheme(coluna.decisoes)[tema].length > 0));

/** As proposições com decisão de mais de uma pessoa, pelo `id` da proposição. */
export function sharedProposicoes(colunas: readonly DecisionColumn[]): Set<string> {
  const porProposicao = new Map<string, Set<string>>();
  for (const coluna of colunas) {
    for (const decisao of coluna.decisoes) {
      for (const proposicao of decisao.proposicoes) {
        const pessoas = porProposicao.get(proposicao.id) ?? new Set<string>();
        pessoas.add(coluna.pessoa.id);
        porProposicao.set(proposicao.id, pessoas);
      }
    }
  }
  return new Set([...porProposicao.entries()].filter(([, pessoas]) => pessoas.size > 1).map(([id]) => id));
}

interface DecisionsByThemeProps {
  colunas: readonly DecisionColumn[];
  headingLevel?: 2 | 3;
  /** O caminho de cada cartão para a página da pessoa, quando a tela não é ela mesma. */
  hrefOf?: (pessoaSlug: string, decisaoId: string) => string;
  /** O `id` da âncora de cada cartão, na página da pessoa. */
  anchorOf?: (decisaoId: string) => string;
}

export function DecisionsByTheme({ colunas, headingLevel = 2, hrefOf, anchorOf }: DecisionsByThemeProps) {
  const temas = temasPresentes(colunas);
  const compartilhadas = sharedProposicoes(colunas);
  const Title = headingLevel === 2 ? "h2" : "h3";
  const Sub = headingLevel === 2 ? "h3" : "h4";
  if (temas.length === 0) {
    return (
      <p className="text-sm text-ink-soft" data-decisoes="nenhuma">
        Nenhuma decisão publicada nesta edição. Isso indica o estágio da pesquisa, e não ausência de decisões.
      </p>
    );
  }
  return (
    <div className="space-y-8" data-decisoes-por-tema={temas.length}>
      {temas.map((tema) => (
        <section key={tema} aria-labelledby={`tema-${tema}`} className="space-y-3" data-tema={tema}>
          <Title id={`tema-${tema}`} className="font-serif text-2xl font-medium leading-tight tracking-tight">
            {TEMA_LABELS[tema]}
          </Title>
          <div className={`grid gap-6 ${colunas.length > 1 ? "lg:grid-cols-2" : ""}`}>
            {colunas.map((coluna) => {
              const doTema = groupDecisionsByTheme(coluna.decisoes)[tema];
              return (
                <div key={coluna.pessoa.id} className="space-y-4" data-coluna-decisoes={coluna.pessoa.slug}>
                  {colunas.length > 1 && (
                    <Sub className="eyebrow text-ink-soft">
                      {coluna.pessoa.nome} <span className="numerals font-medium normal-case tracking-normal">· {doTema.length} {doTema.length === 1 ? "decisão" : "decisões"}</span>
                    </Sub>
                  )}
                  {doTema.length === 0 ? (
                    <p className="text-sm text-ink-soft" data-decisoes="nenhuma">
                      Nenhuma decisão de {coluna.pessoa.nome} publicada neste tema. É uma lacuna da pesquisa desta edição, e não uma conclusão sobre a pessoa.
                    </p>
                  ) : (
                    <ol className="space-y-4">
                      {doTema.map((decisao) => {
                        const compartilhada = decisao.proposicoes.some((proposicao) => compartilhadas.has(proposicao.id));
                        return (
                          <li key={decisao.id} className="border border-line bg-raised p-3 md:p-4" data-decisao={decisao.id} data-mesma-proposicao={compartilhada ? "sim" : "nao"}>
                            {compartilhada && (
                              <p className="mb-2 border-l-2 border-accent pl-2 text-xs text-ink-soft" data-aviso-mesma-proposicao>
                                As duas pessoas têm decisão documentada sobre esta proposição, em instituições e naturezas diferentes ({NATUREZA_LABEL[decisao.natureza].toLowerCase()} aqui).
                              </p>
                            )}
                            <DecisionCard
                              decisao={decisao}
                              detalhe="completo"
                              headingLevel={headingLevel === 2 ? 4 : 4}
                              anchorId={anchorOf?.(decisao.id)}
                              link={hrefOf === undefined ? undefined : { href: hrefOf(coluna.pessoa.slug, decisao.id), rotulo: `Ver na trajetória de ${coluna.pessoa.nome}` }}
                            />
                          </li>
                        );
                      })}
                    </ol>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
