// Eixo de anos da linha do tempo: régua, um traço por ano e rótulos nos anos
// redondos. Só desenho, sem estado. É decorativo para leitores de tela: as
// datas estão escritas em cada acontecimento.

import { positionOfYear, yearLabels, type TimeDomain } from "./scale";

interface TimeAxisProps {
  domain: TimeDomain;
  className?: string;
}

function Labels({ domain, maximo, className }: { domain: TimeDomain; maximo: number; className: string }) {
  return (
    <div className={className}>
      {yearLabels(domain, maximo).map((ano) => {
        const x = positionOfYear(domain, ano);
        // Perto das pontas, o rótulo encosta na borda em vez de ser cortado.
        const alinhamento = x < 0.04 ? "" : x > 0.95 ? "-translate-x-full" : "-translate-x-1/2";
        return (
          <span key={ano} className="absolute top-0" style={{ left: `${x * 100}%` }}>
            <span className="absolute left-0 top-0 h-2.5 w-px bg-ink" />
            <span
              data-year-label
              className={`numerals absolute top-3 text-[0.6875rem] font-medium leading-none text-ink-soft ${alinhamento}`}
            >
              {ano}
            </span>
          </span>
        );
      })}
    </div>
  );
}

export function TimeAxis({ domain, className = "" }: TimeAxisProps) {
  const anos = Array.from({ length: domain.ate - domain.de + 1 }, (_, indice) => domain.de + indice);

  return (
    // O eixo mede a própria largura: a quantidade de rótulos depende do espaço
    // que ele tem, e não do tamanho da tela.
    <div aria-hidden="true" className={`@container relative h-7 border-t border-ink ${className}`}>
      {anos.map((ano) => (
        <span
          key={ano}
          className="absolute top-0 h-1.5 w-px bg-line-strong"
          style={{ left: `${positionOfYear(domain, ano) * 100}%` }}
        />
      ))}
      <Labels domain={domain} maximo={6} className="@[34rem]:hidden" />
      <Labels domain={domain} maximo={14} className="hidden @[34rem]:block" />
    </div>
  );
}
