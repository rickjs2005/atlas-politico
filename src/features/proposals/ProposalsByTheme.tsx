// As propostas registradas na Justiça Eleitoral, por área, com as duas
// candidaturas lado a lado e o mesmo formato para as duas: a frase, a
// ressalva, a página do documento e a situação da revisão.
//
// A tela não conta as propostas de cada lado, não as põe em ordem de valor e
// não conclui. Todas as áreas aparecem para todas as pessoas: onde a edição
// não tem proposta, a tela diz que ainda não foi pesquisado, e não que a
// candidatura não propõe.

import { RecordSources } from "@/components/RecordSources";
import { ReviewNote } from "@/components/ReviewNote";
import { PROPOSAL_PENDING, groupProposalsByTheme, type ProposalView } from "@/lib/data/proposals";
import { TEMAS, TEMA_LABELS } from "@/lib/domain/decisions";

export interface ProposalColumn {
  pessoa: { id: string; slug: string; nome: string };
  propostas: readonly ProposalView[];
}

export function ProposalsByTheme({ colunas, headingLevel = 3 }: { colunas: readonly ProposalColumn[]; headingLevel?: 2 | 3 }) {
  const porColuna = colunas.map((coluna) => groupProposalsByTheme(coluna.propostas));
  const Title = headingLevel === 2 ? "h2" : "h3";
  const Sub = headingLevel === 2 ? "h3" : "h4";
  // Quando a situação da revisão é a mesma para todas as propostas, ela vai uma vez, no fim; se divergir, vai em cada item.
  const todas = colunas.flatMap((coluna) => coluna.propostas);
  const revisaoUnica = new Set(todas.map((proposta) => JSON.stringify(proposta.editorial))).size === 1;
  const editorial = revisaoUnica ? (todas[0]?.editorial ?? null) : null;
  return (
    <div className="space-y-8" data-propostas-por-tema={TEMAS.length}>
      {TEMAS.map((tema) => (
        <section key={tema} aria-labelledby={`propostas-${tema}`} className="space-y-3" data-tema={tema}>
          <Title id={`propostas-${tema}`} className="scroll-mt-28 font-serif text-2xl font-medium leading-tight tracking-tight">
            {TEMA_LABELS[tema]}
          </Title>
          <div className={`grid gap-6 ${colunas.length > 1 ? "lg:grid-cols-2" : ""}`}>
            {colunas.map((coluna, indice) => {
              const doTema = porColuna[indice]![tema];
              return (
                <div key={coluna.pessoa.id} className="space-y-2" data-coluna-propostas={coluna.pessoa.slug}>
                  <Sub className="eyebrow text-ink-soft">{coluna.pessoa.nome}</Sub>
                  {doTema.length === 0 ? (
                    <p className="text-sm text-ink-soft" data-propostas="pendente">
                      {PROPOSAL_PENDING}
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {doTema.map((proposta) => (
                        <li key={proposta.id} className="border border-line bg-raised p-3 md:p-4" data-proposta={proposta.id}>
                          <p className="reading text-base leading-relaxed">{proposta.texto}</p>
                          {proposta.ressalva !== null && (
                            <p className="mt-2 border-l-2 border-ink-faint pl-2 text-sm text-ink-soft" data-ressalva>
                              {proposta.ressalva}
                            </p>
                          )}
                          <RecordSources entries={proposta.fontes} about={`proposta de ${coluna.pessoa.nome} em ${TEMA_LABELS[tema]}`} className="mt-1" />
                          {!revisaoUnica && (
                            <div data-revisao>
                              <ReviewNote editorial={proposta.editorial} />
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
      {editorial !== null && (
        <div data-revisao>
          <ReviewNote editorial={editorial} />
        </div>
      )}
    </div>
  );
}
