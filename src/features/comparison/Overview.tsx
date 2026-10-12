// A comparação curta, para quem está começando: os cargos públicos de cada
// pessoa e o tipo de registro que o atlas tem de cada cargo e de cada área
// (src/lib/data/overview.ts). As duas pessoas têm os mesmos campos, na mesma
// ordem. A tela diz o tipo de registro, e não a quantidade; uma área sem
// decisão aparece como lacuna da pesquisa, e não como conclusão.
//
// Fica dentro da página da comparação, depois das faixas e das notas de
// leitura (D-82), e o cabeçalho da página tem o atalho para ela.

import { GAP_NOTICE, NO_DECISION, OFFICE_NOTICE, describeKinds, type PersonOverview } from "@/lib/data/overview";
import { PROPOSAL_PENDING } from "@/lib/data/proposals";
import { TEMAS, TEMA_LABELS } from "@/lib/domain/decisions";

export interface OverviewColumn {
  pessoa: { id: string; slug: string; nome: string };
  resumo: PersonOverview;
}

const link = "underline decoration-line-strong hover:decoration-ink";

/** O que o atlas tem de decisão: os tipos, ligados à seção das decisões, ou a frase da lacuna. */
function Kinds({ naturezas, href }: { naturezas: PersonOverview["semArea"]; href: string }) {
  const texto = describeKinds(naturezas);
  if (texto === null) {
    return (
      <span className="text-ink-soft" data-decisoes="nenhuma">
        {NO_DECISION}
      </span>
    );
  }
  return (
    <a href={href} className={link} data-decisoes={naturezas.join(" ")}>
      {texto.charAt(0).toUpperCase()}
      {texto.slice(1)}
    </a>
  );
}

export function ComparisonOverview({ colunas }: { colunas: readonly OverviewColumn[] }) {
  const haSemArea = colunas.some((coluna) => coluna.resumo.semArea.length > 0);
  return (
    <section id="resumo" aria-labelledby="titulo-resumo" className="scroll-mt-24 space-y-5 border-t border-ink pt-8" data-secao="resumo">
      <div className="max-w-3xl space-y-2">
        <p className="eyebrow text-ink-soft">Para começar</p>
        <h2 id="titulo-resumo" className="font-serif text-[1.75rem] font-medium leading-tight tracking-tight md:text-3xl">
          Resumo: os cargos de cada um e o que o atlas registra
        </h2>
        <p className="text-sm text-ink-soft" data-aviso-de-cargo>
          {OFFICE_NOTICE}
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="eyebrow text-ink-soft">Por cargo</h3>
        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          {colunas.map(({ pessoa, resumo }) => (
            <div key={pessoa.id} className="border border-line bg-raised p-3 md:p-4" data-resumo-cargos={pessoa.slug}>
              <h4 className="font-serif text-xl font-medium leading-tight">{pessoa.nome}</h4>
              {resumo.cargos.length === 0 ? (
                <p className="mt-2 text-sm text-ink-soft">Nenhum cargo público cadastrado nesta edição.</p>
              ) : (
                <ul className="mt-2 divide-y divide-line text-sm">
                  {resumo.cargos.map((cargo) => (
                    <li key={cargo.mandatoId} className="space-y-0.5 py-2" data-cargo={cargo.mandatoId}>
                      <p>
                        <span className="font-medium">{cargo.cargo}</span>
                        <span className="text-ink-soft">
                          , {cargo.instituicao} · <span className="numerals">{cargo.periodo}</span>
                        </span>
                      </p>
                      <p>
                        <Kinds naturezas={cargo.naturezas} href="#decisoes" />.
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="eyebrow text-ink-soft">Por área</h3>
        <ul className="divide-y divide-line border-y border-line text-sm" data-resumo-areas>
          {TEMAS.map((tema) => (
            <li key={tema} className="grid gap-x-6 gap-y-1 py-2 md:grid-cols-[11rem_1fr_1fr]" data-area={tema}>
              <h4 className="font-medium">{TEMA_LABELS[tema]}</h4>
              {colunas.map(({ pessoa, resumo }) => {
                const area = resumo.areas.find((item) => item.tema === tema)!;
                return (
                  <p key={pessoa.id} data-area-de={pessoa.slug}>
                    <span className="text-ink-soft">{pessoa.nome}: </span>
                    <Kinds naturezas={area.naturezas} href={`#tema-${tema}`} />.{" "}
                    {area.propostas ? (
                      <a href={`#propostas-${tema}`} className={link} data-propostas="registradas">
                        Propostas de 2026 registradas no TSE
                      </a>
                    ) : (
                      <span className="text-ink-soft" data-propostas="pendente">
                        Propostas: {PROPOSAL_PENDING.charAt(0).toLowerCase()}
                        {PROPOSAL_PENDING.slice(1).replace(/\.$/, "")}
                      </span>
                    )}
                    .
                  </p>
                );
              })}
            </li>
          ))}
          {haSemArea && (
            <li className="grid gap-x-6 gap-y-1 py-2 md:grid-cols-[11rem_1fr_1fr]" data-area="outros-assuntos">
              <h4 className="font-medium">Outros assuntos</h4>
              {colunas.map(({ pessoa, resumo }) => (
                <p key={pessoa.id} data-area-de={pessoa.slug}>
                  <span className="text-ink-soft">{pessoa.nome}: </span>
                  <Kinds naturezas={resumo.semArea} href="#tema-outros-assuntos" />.
                </p>
              ))}
            </li>
          )}
        </ul>
        <p className="max-w-3xl text-sm text-ink-soft" data-aviso-de-lacuna>
          {GAP_NOTICE} Os registros, com cargo, data e fontes, estão em{" "}
          <a href="#decisoes" className={link}>
            decisões por tema
          </a>{" "}
          e em{" "}
          <a href="#propostas" className={link}>
            propostas por área
          </a>
          , mais abaixo.
        </p>
      </div>
    </section>
  );
}
