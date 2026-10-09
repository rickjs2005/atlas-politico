// Resumo de um perfil: retrato, texto, cargos, partidos, cobertura e fontes.
// É o que o painel de leitura mostra enquanto nenhum acontecimento está
// aberto. O mesmo componente serve aos dois perfis, com as mesmas seções na
// mesma ordem.

import { Portrait, PortraitCredit } from "@/components/Portrait";
import { ReviewNote } from "@/components/ReviewNote";
import { SourceList, type SourceEntry } from "@/components/SourceList";
import type { Coverage } from "@/lib/data/coverage";
import { formatPeriod } from "@/lib/domain/dates";
import type { Filiacao, Imagem, Mandato, Pessoa } from "@/lib/domain/types";

interface ProfilePanelProps {
  pessoa: Pessoa;
  retrato: Imagem | null;
  mandatos: readonly Mandato[];
  filiacoes: readonly Filiacao[];
  cobertura: Coverage | null;
  fontes: readonly SourceEntry[];
  headingLevel?: 2 | 3;
}

const sectionTitle = "eyebrow text-ink-soft";

export function ProfilePanel({
  pessoa,
  retrato,
  mandatos,
  filiacoes,
  cobertura,
  fontes,
  headingLevel = 2,
}: ProfilePanelProps) {
  const Title = headingLevel === 2 ? "h2" : "h3";
  const SectionTitle = headingLevel === 2 ? "h3" : "h4";

  return (
    <article className="animate-enter space-y-6">
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

      <section className="space-y-2">
        <SectionTitle className={sectionTitle}>Cargos e funções</SectionTitle>
        {mandatos.length === 0 ? (
          <p className="text-sm text-ink-soft">Nenhum cargo registrado nesta edição.</p>
        ) : (
          <ul className="divide-y divide-line border-y border-line text-sm">
            {mandatos.map((mandato) => (
              <li key={mandato.id} className="py-2">
                <span className="block font-medium">{mandato.cargo}</span>
                <span className="block text-ink-soft">{mandato.instituicao}</span>
                <span className="numerals block text-xs text-ink-soft">{formatPeriod(mandato.periodo)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-2">
        <SectionTitle className={sectionTitle}>Partidos</SectionTitle>
        {filiacoes.length === 0 ? (
          <p className="text-sm text-ink-soft">Nenhuma filiação registrada nesta edição.</p>
        ) : (
          <ul className="divide-y divide-line border-y border-line text-sm">
            {filiacoes.map((filiacao) => (
              <li key={filiacao.id} className="flex flex-wrap items-baseline justify-between gap-x-4 py-2">
                <span>
                  <span className="font-medium">{filiacao.partido.sigla}</span>
                  {filiacao.partido.nome !== filiacao.partido.sigla && (
                    <span className="text-ink-soft"> · {filiacao.partido.nome}</span>
                  )}
                </span>
                <span className="numerals text-xs text-ink-soft">{formatPeriod(filiacao.periodo)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-2">
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

      <section className="space-y-2">
        <SectionTitle className={sectionTitle}>
          Fontes do perfil <span className="numerals font-medium">({fontes.length})</span>
        </SectionTitle>
        <SourceList entries={fontes} />
      </section>

      <footer className="space-y-2">
        <ReviewNote editorial={pessoa.editorial} />
        {retrato !== null && <PortraitCredit imagem={retrato} />}
      </footer>
    </article>
  );
}
