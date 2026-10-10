// Sombra sobre o trecho do eixo que está fora do recorte de período. O que
// fica claro é o período escolhido. Só desenho: quem informa o período em
// texto é o controle de período.

import { spanOfYears, type TimeDomain } from "./scale";

interface PeriodShadeProps {
  domain: TimeDomain;
  periodo: { de: number | null; ate: number | null };
  /** A hachura acompanha a mudança de período com uma transição curta. */
  animate?: boolean;
  /**
   * A altura que a sombra cobre, em classes de posição. Onde os anos do eixo
   * ficam na mesma área, ela para acima deles: a hachura não passa pelas
   * letras, e os anos fora do período continuam legíveis para escolher outro.
   */
  vertical?: string;
}

export function PeriodShade({ domain, periodo, animate = false, vertical = "inset-y-0" }: PeriodShadeProps) {
  const de = Math.max(domain.de, periodo.de ?? domain.de);
  const ate = Math.min(domain.ate, periodo.ate ?? domain.ate);
  // Sem período não há o que cobrir. Com a transição ligada, as duas partes
  // continuam no documento, com largura zero, para poderem crescer e encolher.
  if (de <= domain.de && ate >= domain.ate && !animate) return null;

  const recorte = spanOfYears(domain, de, Math.max(de, ate));
  const fim = recorte.inicio + recorte.largura;
  // Fica sobre o eixo e sob as marcas (`z-[2]` em `EventMarks`): a marca de um
  // acontecimento do recorte nunca aparece hachurada, mesmo colada ao limite.
  const sombra = `pointer-events-none absolute ${vertical} z-[1] bg-paper/70 [background-image:repeating-linear-gradient(135deg,transparent_0_5px,var(--atlas-line)_5px_6px)] ${
    animate ? "transition-[width] duration-[var(--atlas-base)] ease-atlas" : ""
  }`;

  return (
    <div aria-hidden="true" data-period-shade>
      {/* As duas partes ficam sempre no documento, com largura zero quando não
          há o que cobrir: é o que deixa a transição acontecer nos dois sentidos. */}
      <span
        className={`${sombra} left-0 ${recorte.inicio > 0 ? "border-r border-ink-faint" : ""}`}
        style={{ width: `${recorte.inicio * 100}%` }}
      />
      <span
        className={`${sombra} right-0 ${fim < 1 ? "border-l border-ink-faint" : ""}`}
        style={{ width: `${Math.max(0, 1 - fim) * 100}%` }}
      />
    </div>
  );
}
