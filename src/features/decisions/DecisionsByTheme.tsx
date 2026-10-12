// As decisões de uma ou duas pessoas agrupadas por tema, para a página da
// pessoa e para a comparação. A tela mostra o que o conjunto registra: não
// soma, não põe contagem ao lado de cada nome, não ordena por quantidade e
// não conclui. Uma decisão sem tema não some: fica no grupo "Outros
// assuntos", depois dos temas. Quando as duas pessoas têm decisão sobre a
// mesma proposição, a tela diz, com a diferença de instituição e de natureza
// à vista.

import { decisionsWithoutTheme, groupDecisionsByTheme, type DecisionView } from "@/lib/data/decisions";
import { TEMAS, TEMA_LABELS } from "@/lib/domain/decisions";

import { DecisionCard, NATUREZA_LABEL } from "./DecisionCard";

export interface DecisionColumn {
  pessoa: { id: string; slug: string; nome: string };
  decisoes: readonly DecisionView[];
}

/**
 * O aviso fixo de toda tela de decisões: amostra, não histórico completo;
 * cargos e naturezas diferentes não se equiparam. A amostra tem partes
 * escolhidas por regras diferentes (as decisões de 2023 em diante, os atos de
 * 2003 a 2010, as leis estaduais, a relatoria): o aviso não dá uma regra só, e
 * aponta onde cada uma está escrita.
 */
export const SAMPLE_NOTICE =
  "As decisões aqui são uma amostra documentada da edição, e não o histórico completo de nenhuma das pessoas. Cada parte da amostra tem a própria regra de escolha, escrita na metodologia, em O que esta edição cobre. Um voto no Senado, um ato da Presidência e a autoria de uma lei estadual são coisas diferentes: a tela mostra o cargo, a instituição e o objeto de cada decisão, e não os equipara.";

/** O grupo das decisões sem tema: a chave do grupo na tela e o que ele explica. */
export const OUTROS_ASSUNTOS = {
  chave: "outros-assuntos",
  titulo: "Outros assuntos",
  nota: "Decisões cujo assunto não cabe com clareza em nenhum dos temas acima. A classificação por tema é decisão editorial.",
} as const;

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

/** Um grupo da tela: um tema da taxonomia ou o grupo das decisões sem tema, com as decisões de cada coluna. */
export interface DecisionGroup {
  chave: string;
  titulo: string;
  /** A linha que explica o grupo; só o das decisões sem tema tem. */
  nota: string | null;
  /** Como a tela diz que uma coluna não tem decisão neste grupo. */
  vazio: (nome: string) => string;
  porColuna: DecisionView[][];
}

/** Os grupos com alguma decisão, na ordem das taxonomias, e por último o das decisões sem tema. */
export function decisionGroups(colunas: readonly DecisionColumn[]): DecisionGroup[] {
  const porTema = colunas.map((coluna) => groupDecisionsByTheme(coluna.decisoes));
  const grupos: DecisionGroup[] = TEMAS.filter((tema) => porTema.some((grupo) => grupo[tema].length > 0)).map((tema) => ({
    chave: tema,
    titulo: TEMA_LABELS[tema],
    nota: null,
    vazio: (nome) => `Nenhuma decisão de ${nome} publicada neste tema. É uma lacuna da pesquisa desta edição, e não uma conclusão sobre a pessoa.`,
    porColuna: porTema.map((grupo) => grupo[tema]),
  }));
  const semTema = colunas.map((coluna) => decisionsWithoutTheme(coluna.decisoes));
  if (semTema.some((lista) => lista.length > 0)) {
    grupos.push({
      chave: OUTROS_ASSUNTOS.chave,
      titulo: OUTROS_ASSUNTOS.titulo,
      nota: OUTROS_ASSUNTOS.nota,
      vazio: (nome) => `Nenhuma decisão de ${nome} publicada fora dos temas acima nesta edição.`,
      porColuna: semTema,
    });
  }
  return grupos;
}

interface DecisionsByThemeProps {
  colunas: readonly DecisionColumn[];
  headingLevel?: 2 | 3;
  /** O caminho de cada cartão para a página da pessoa, quando a tela não é ela mesma. */
  hrefOf?: (pessoaSlug: string, decisaoId: string) => string;
  /** O `id` da âncora de cada cartão, na página da pessoa. Uma decisão com dois temas aparece nos dois grupos: a âncora fica no primeiro. */
  anchorOf?: (decisaoId: string) => string;
}

export function DecisionsByTheme({ colunas, headingLevel = 2, hrefOf, anchorOf }: DecisionsByThemeProps) {
  const grupos = decisionGroups(colunas);
  const compartilhadas = sharedProposicoes(colunas);
  const Title = headingLevel === 2 ? "h2" : "h3";
  const Sub = headingLevel === 2 ? "h3" : "h4";
  // O título do cartão fica um nível abaixo do último título acima dele: o do tema, ou o da pessoa quando há mais de uma coluna.
  const nivelDoCartao = (headingLevel + (colunas.length > 1 ? 2 : 1)) as 3 | 4 | 5;
  if (grupos.length === 0) {
    return (
      <p className="text-sm text-ink-soft" data-decisoes="nenhuma">
        Nenhuma decisão publicada nesta edição. Isso indica o estágio da pesquisa, e não ausência de decisões.
      </p>
    );
  }
  // A âncora de um cartão só pode existir uma vez na página.
  const ancoradas = new Set<string>();
  return (
    <div className="space-y-8" data-decisoes-por-tema={grupos.length}>
      {grupos.map((grupo) => (
        <section key={grupo.chave} aria-labelledby={`tema-${grupo.chave}`} className="space-y-3" data-tema={grupo.chave}>
          {/* A margem de rolagem deixa o título abaixo da barra presa ao topo, para quem chega pelo link do tema. */}
          <Title id={`tema-${grupo.chave}`} className="scroll-mt-28 font-serif text-2xl font-medium leading-tight tracking-tight">
            {grupo.titulo}
          </Title>
          {grupo.nota !== null && (
            <p className="max-w-3xl text-sm text-ink-soft" data-nota-do-grupo>
              {grupo.nota}
            </p>
          )}
          <div className={`grid gap-6 ${colunas.length > 1 ? "lg:grid-cols-2" : ""}`}>
            {colunas.map((coluna, indice) => {
              const doGrupo = grupo.porColuna[indice] ?? [];
              return (
                <div key={coluna.pessoa.id} className="space-y-4" data-coluna-decisoes={coluna.pessoa.slug}>
                  {colunas.length > 1 && <Sub className="eyebrow text-ink-soft">{coluna.pessoa.nome}</Sub>}
                  {doGrupo.length === 0 ? (
                    <p className="text-sm text-ink-soft" data-decisoes="nenhuma">
                      {grupo.vazio(coluna.pessoa.nome)}
                    </p>
                  ) : (
                    <ol className="space-y-4">
                      {doGrupo.map((decisao) => {
                        const compartilhada = decisao.proposicoes.some((proposicao) => compartilhadas.has(proposicao.id));
                        const chaveDaAncora = `${coluna.pessoa.id}:${decisao.id}`;
                        const ancora = anchorOf === undefined || ancoradas.has(chaveDaAncora) ? undefined : anchorOf(decisao.id);
                        ancoradas.add(chaveDaAncora);
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
                              headingLevel={nivelDoCartao}
                              anchorId={ancora}
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
