// Leitura de um acontecimento: data na precisão conhecida, contexto, lugares
// e fontes com a evidência de cada uma. Componente de apresentação puro, sem
// estado nem eventos, para servir tanto ao painel da exploração (navegador)
// quanto à página estática do acontecimento (build).

import { CATEGORY_LABELS } from "@/lib/domain/categories";
import { formatDate } from "@/lib/domain/dates";
import { GEO_PRECISION_LABELS } from "@/lib/domain/geo";
import type { AcontecimentoResolvido } from "@/lib/domain/resolve";

interface EventPanelProps {
  event: AcontecimentoResolvido | null;
  /** Nível do título: 1 na página própria do acontecimento, 3 dentro do painel. */
  headingLevel?: 1 | 3;
}

const SEM_LUGAR = {
  nacional: "Abrangência nacional: este acontecimento não tem um ponto municipal no mapa.",
  desconhecida: "O lugar deste acontecimento não está documentado nas fontes consultadas.",
};

export function EventPanel({ event, headingLevel = 3 }: EventPanelProps) {
  const Title = headingLevel === 1 ? "h1" : "h3";
  const SectionTitle = headingLevel === 1 ? "h2" : "h4";

  if (!event) {
    return (
      <p className="text-sm text-ink-soft">
        Escolha um acontecimento na lista ou no mapa para ler os detalhes.
      </p>
    );
  }

  const { acontecimento, pessoas, lugares, citacoes } = event;
  const { editorial, localizacao } = acontecimento;

  return (
    <article className="space-y-4">
      <header>
        <p className="text-sm text-ink-soft">{formatDate(acontecimento.data)}</p>
        <Title
          className={`font-serif leading-snug ${headingLevel === 1 ? "text-3xl" : "text-xl"}`}
        >
          {acontecimento.titulo}
        </Title>
        <p className="mt-1 text-sm text-ink-soft">
          {CATEGORY_LABELS[acontecimento.categoria]} · {pessoas.map((pessoa) => pessoa.nome).join(", ")}
        </p>
      </header>

      <p>{acontecimento.resumo}</p>
      <p className="text-ink-soft">{acontecimento.contexto}</p>

      <section>
        <SectionTitle className="text-sm font-semibold uppercase tracking-wide">Lugares</SectionTitle>
        {localizacao.tipo === "lugares" ? (
          <ul className="mt-1 space-y-1 text-sm">
            {lugares.map((lugar) => (
              <li key={lugar.id}>
                {lugar.nome}{" "}
                <span className="text-ink-soft">
                  ({GEO_PRECISION_LABELS[lugar.precisaoGeografica].toLowerCase()})
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-sm">{SEM_LUGAR[localizacao.tipo]}</p>
        )}
      </section>

      <section>
        <SectionTitle className="text-sm font-semibold uppercase tracking-wide">Fontes</SectionTitle>
        <ol className="mt-1 list-decimal space-y-3 pl-5 text-sm">
          {citacoes.map(({ citacao, fonte }) => (
            <li key={`${fonte.id}:${citacao.localizacao}`}>
              <a href={fonte.url} target="_blank" rel="noreferrer" className="font-medium underline">
                {fonte.titulo}
              </a>
              <span className="block text-ink-soft">
                {fonte.autoria} ·{" "}
                {fonte.dataDocumento.tipo === "data"
                  ? `documento de ${formatDate(fonte.dataDocumento)}`
                  : "data do documento desconhecida"}{" "}
                · acesso em {formatDate({ valor: fonte.acessadoEm, precisao: "dia" })}
              </span>
              <span className="block">
                <span className="text-ink-soft">Onde:</span> {citacao.localizacao}
              </span>
              <span className="block">
                <span className="text-ink-soft">O que sustenta:</span> {citacao.evidencia}
              </span>
            </li>
          ))}
        </ol>
      </section>

      {editorial.estado === "revisado" && (
        <p className="border-t border-line pt-3 text-sm text-ink-soft">
          {editorial.revisao.tipo === "humana"
            ? `Revisado por ${editorial.revisao.revisadoPor} em `
            : `Conferido com as fontes, com assistência de IA (${editorial.revisao.revisadoPor}), em `}
          {formatDate({ valor: editorial.revisao.revisadoEm, precisao: "dia" })}.
          {editorial.revisao.tipo === "assistida-por-ia" && " Revisão humana pendente."}
        </p>
      )}
    </article>
  );
}
