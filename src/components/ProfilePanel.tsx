// O perfil de uma pessoa: apresentação, cargos e partidos documentados, cada
// um com as próprias fontes, cobertura da edição, fontes do texto de
// apresentação, revisão e crédito do retrato.
//
// É o que o painel de leitura da exploração mostra enquanto nenhum
// acontecimento está aberto: a página do perfil e a exploração são a mesma
// rota (docs/PAGES.md). O mesmo componente serve aos dois perfis, com as
// mesmas seções na mesma ordem.

import { EditionTag } from "@/components/EditionStatus";
import { AffiliationList, MandateList } from "@/components/PeriodRecords";
import { Portrait, PortraitCredit } from "@/components/Portrait";
import { ReviewNote } from "@/components/ReviewNote";
import { SourceList, type SourceEntry } from "@/components/SourceList";
import type { Coverage } from "@/lib/data/coverage";
import { formatPeriod } from "@/lib/domain/dates";
import type { Citacao, Edicao, Filiacao, Imagem, Mandato, Pessoa } from "@/lib/domain/types";

interface ProfilePanelProps {
  pessoa: Pessoa;
  retrato: Imagem | null;
  mandatos: readonly Mandato[];
  filiacoes: readonly Filiacao[];
  cobertura: Coverage | null;
  /** Fontes do texto de apresentação. */
  fontes: readonly SourceEntry[];
  /** A edição do conteúdo, para dizer versão e data de corte. */
  edicao?: Edicao | null;
  /** As fontes de um cargo ou de uma filiação. Sem a função, elas não aparecem. */
  sourcesOf?: (registro: { fontes: readonly Citacao[] }) => readonly SourceEntry[];
  /** Caminhos a partir do perfil: comparar, copiar o link, metodologia. */
  actions?: React.ReactNode;
  headingLevel?: 2 | 3;
}

const sectionTitle = "eyebrow text-ink-soft";

/** Sem período consultado, todo registro da pessoa entra como documentado. */
const all = <T,>(registros: readonly T[]) =>
  registros.map((registro) => ({ registro, situacao: "documentada" as const }));

export function ProfilePanel({
  pessoa,
  retrato,
  mandatos,
  filiacoes,
  cobertura,
  fontes,
  edicao,
  sourcesOf,
  actions,
  headingLevel = 2,
}: ProfilePanelProps) {
  const Title = headingLevel === 2 ? "h2" : "h3";
  const SectionTitle = headingLevel === 2 ? "h3" : "h4";

  return (
    <article className="animate-enter space-y-6" data-perfil={pessoa.slug}>
      <header className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-end gap-4">
        <Portrait nome={pessoa.nome} imagem={retrato} sizes="104px" decorative />
        <div className="space-y-1 pb-1">
          <p className="eyebrow text-ink-soft">Perfil</p>
          <Title className="font-serif text-3xl font-medium leading-none tracking-tight">
            {pessoa.nome}
          </Title>
        </div>
      </header>

      <p className="reading">{pessoa.resumo}</p>

      {actions}

      <section className="space-y-2" data-secao="cargos">
        <SectionTitle className={sectionTitle}>
          Cargos e funções <span className="numerals font-medium">({mandatos.length})</span>
        </SectionTitle>
        <MandateList
          itens={all(mandatos)}
          emptyText="Nenhum cargo registrado nesta edição."
          sourcesOf={sourcesOf}
        />
      </section>

      <section className="space-y-2" data-secao="partidos">
        <SectionTitle className={sectionTitle}>
          Partidos <span className="numerals font-medium">({filiacoes.length})</span>
        </SectionTitle>
        <AffiliationList
          itens={all(filiacoes)}
          emptyText="Nenhuma filiação registrada nesta edição."
          sourcesOf={sourcesOf}
        />
      </section>

      <section className="space-y-2" data-secao="cobertura">
        <SectionTitle className={sectionTitle}>Cobertura desta edição</SectionTitle>
        {cobertura === null ? (
          <p className="text-sm text-ink-soft">A edição não declara o período coberto para este perfil.</p>
        ) : (
          <div className="space-y-1.5 text-sm">
            <p className="numerals">{formatPeriod(cobertura.periodo)}</p>
            {cobertura.observacao !== undefined && <p className="text-ink-soft">{cobertura.observacao}</p>}
          </div>
        )}
      </section>

      <section className="space-y-2" data-secao="fontes">
        <SectionTitle className={sectionTitle}>
          Fontes do perfil <span className="numerals font-medium">({fontes.length})</span>
        </SectionTitle>
        <SourceList entries={fontes} />
      </section>

      <footer className="space-y-2">
        <ReviewNote editorial={pessoa.editorial} />
        {edicao != null && <EditionTag edicao={edicao} />}
        {retrato !== null && <PortraitCredit imagem={retrato} detail />}
      </footer>
    </article>
  );
}
