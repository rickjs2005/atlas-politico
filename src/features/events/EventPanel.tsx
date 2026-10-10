// Painel de leitura de um acontecimento: data na precisão conhecida, título,
// resumo, contexto, lugares e fontes com a evidência de cada uma. Componente
// de apresentação, sem estado: quem decide qual acontecimento mostrar, e o que
// acontece ao fechar, é quem o usa.

import Link from "next/link";

import { CategoryLabel } from "@/components/Category";
import { ReviewNote } from "@/components/ReviewNote";
import { SourceList } from "@/components/SourceList";
import type { PeriodMatch } from "@/lib/data/queries";
import { describePrecision, formatDate } from "@/lib/domain/dates";
import { GEO_PRECISION_LABELS } from "@/lib/domain/geo";
import type { AcontecimentoResolvido } from "@/lib/domain/resolve";
import type { Imagem, Mandato } from "@/lib/domain/types";

interface EventPanelProps {
  event: AcontecimentoResolvido | null;
  /** Nível do título dentro da página que hospeda o painel. */
  headingLevel?: 2 | 3;
  /** Cargos e funções das pessoas na data do acontecimento. */
  roles?: readonly PeriodMatch<Mandato>[];
  /** Imagem do acontecimento, quando o conjunto tem uma. */
  image?: Imagem | null;
  /** Endereço da página do acontecimento. */
  href?: string;
  /** O que mais se pode fazer a partir do painel, como copiar o link da consulta. */
  actions?: React.ReactNode;
  /** Com esta função, o painel mostra o botão de fechar. */
  onClose?: () => void;
  /** Texto do botão de fechar: muda conforme o lugar para onde se volta. */
  closeLabel?: string;
  /** Recebe o título do painel, para o foco ir a ele quando o painel abre. */
  titleRef?: React.Ref<HTMLHeadingElement>;
}

const SEM_LUGAR = {
  nacional: "Abrangência nacional: este acontecimento não tem um ponto municipal no mapa.",
  desconhecida: "O lugar deste acontecimento não está documentado nas fontes consultadas.",
};

const sectionTitle = "eyebrow text-ink-soft";

export function EventPanel({
  event,
  headingLevel = 3,
  roles = [],
  image = null,
  href,
  actions,
  onClose,
  closeLabel = "Fechar",
  titleRef,
}: EventPanelProps) {
  const Title = headingLevel === 2 ? "h2" : "h3";
  const SectionTitle = headingLevel === 2 ? "h3" : "h4";

  if (!event) {
    return (
      <p className="text-sm text-ink-soft">
        Escolha um acontecimento na lista ou no mapa para ler os detalhes.
      </p>
    );
  }

  const { acontecimento, pessoas, lugares, citacoes } = event;
  const { localizacao } = acontecimento;
  const precisao = describePrecision(acontecimento.data);

  return (
    // A chave troca a cada acontecimento: o conteúdo novo entra com um fade curto.
    <article key={acontecimento.id} className="animate-enter space-y-5">
      <header className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <p className="eyebrow text-ink-soft">
            <CategoryLabel categoria={acontecimento.categoria} />
          </p>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="-mr-2 -mt-2 flex h-11 shrink-0 items-center gap-1.5 px-2 text-sm font-medium text-ink-soft hover:text-ink"
            >
              <span aria-hidden="true">×</span>
              {closeLabel}
            </button>
          )}
        </div>

        {/* A data abre a leitura, em números de mesma largura; o título é o que se lê primeiro. */}
        <p className="numerals text-lg font-semibold leading-none tracking-tight">
          <time dateTime={acontecimento.data.valor}>{formatDate(acontecimento.data)}</time>
        </p>
        {precisao !== null && <p className="-mt-1.5 text-xs italic text-ink-soft">{precisao}</p>}

        <Title
          ref={titleRef}
          tabIndex={titleRef ? -1 : undefined}
          className="font-serif text-[1.75rem] font-medium leading-[1.15] tracking-tight outline-none"
        >
          {acontecimento.titulo}
        </Title>

        <p className="text-sm text-ink-soft">{pessoas.map((pessoa) => pessoa.nome).join(", ")}</p>
      </header>

      {image !== null && (
        <figure className="space-y-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element -- dimensões vêm do conteúdo */}
          <img
            src={image.arquivo}
            alt={image.textoAlternativo}
            width={image.dimensoes?.largura}
            height={image.dimensoes?.altura}
            loading="lazy"
            className="h-auto w-full bg-sunken"
          />
          <figcaption className="text-xs text-ink-faint">{image.credito}</figcaption>
        </figure>
      )}

      <div className="space-y-3 border-t border-line pt-4">
        <p className="reading">{acontecimento.resumo}</p>
        <p className="font-serif text-base leading-relaxed text-ink-soft">{acontecimento.contexto}</p>
      </div>

      {roles.length > 0 && (
        <section className="space-y-1.5">
          <SectionTitle className={sectionTitle}>Cargos na época</SectionTitle>
          <ul className="space-y-1 text-sm">
            {roles.map(({ registro, situacao }) => (
              <li key={registro.id}>
                {registro.cargo}, {registro.instituicao}
                {situacao === "incerta" && (
                  <span className="italic text-ink-soft"> (período não documentado por inteiro)</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-1.5">
        <SectionTitle className={sectionTitle}>Lugares</SectionTitle>
        {localizacao.tipo === "lugares" ? (
          <ul className="space-y-1 text-sm">
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
          <p className="text-sm">{SEM_LUGAR[localizacao.tipo]}</p>
        )}
      </section>

      <section className="space-y-2">
        <SectionTitle className={sectionTitle}>
          Fontes <span className="numerals font-medium">({citacoes.length})</span>
        </SectionTitle>
        <SourceList entries={citacoes} />
      </section>

      <footer className="space-y-4">
        <ReviewNote editorial={acontecimento.editorial} />
        {(href !== undefined || actions) && (
          <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
            {href !== undefined && (
              <Link
                href={href}
                // O endereço leva o recorte: sem isso, cada filtro buscaria a página de novo.
                prefetch={false}
                className="inline-flex min-h-11 items-center border border-ink px-4 text-sm font-medium no-underline hover:bg-ink hover:text-paper"
              >
                Abrir a página do acontecimento
              </Link>
            )}
            {actions}
          </div>
        )}
      </footer>
    </article>
  );
}
