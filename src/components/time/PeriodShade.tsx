// Sombra sobre o trecho do eixo que está fora do recorte de período. O que
// fica claro é o período escolhido. Só desenho: quem informa o período em
// texto é o controle de período.

import { spanOfYears, type TimeDomain } from "./scale";

interface PeriodShadeProps {
  domain: TimeDomain;
  periodo: { de: number | null; ate: number | null };
}

export function PeriodShade({ domain, periodo }: PeriodShadeProps) {
  const de = Math.max(domain.de, periodo.de ?? domain.de);
  const ate = Math.min(domain.ate, periodo.ate ?? domain.ate);
  if (de <= domain.de && ate >= domain.ate) return null;

  const recorte = spanOfYears(domain, de, Math.max(de, ate));
  const fim = recorte.inicio + recorte.largura;
  // Fica sobre o eixo e sob as marcas (`z-[2]` em `EventMarks`): a marca de um
  // acontecimento do recorte nunca aparece hachurada, mesmo colada ao limite.
  const sombra =
    "pointer-events-none absolute inset-y-0 z-[1] bg-paper/70 [background-image:repeating-linear-gradient(135deg,transparent_0_5px,var(--atlas-line)_5px_6px)]";

  return (
    <div aria-hidden="true">
      {recorte.inicio > 0 && (
        <span className={`${sombra} left-0 border-r border-ink-faint`} style={{ width: `${recorte.inicio * 100}%` }} />
      )}
      {fim < 1 && (
        <span className={`${sombra} right-0 border-l border-ink-faint`} style={{ width: `${(1 - fim) * 100}%` }} />
      )}
    </div>
  );
}
