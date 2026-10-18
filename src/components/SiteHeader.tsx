import { IntentLink } from "./IntentLink";
import { SiteNav } from "./SiteNav";

// Quatro destinos (D-155): explorar as trajetórias, comparar, jogar e a
// metodologia. As pessoas ficam dentro de Explorar, na mesma ordem alfabética
// de sempre; a praça, a trilha e a Cidade do Voto ficam dentro de Jogar.
const NAV_ITEMS = [
  { href: "/explorar", label: "Explorar", inclui: ["/politicos", "/acontecimentos"] },
  { href: "/comparar", label: "Comparar" },
  { href: "/jogo", label: "Jogar", inclui: ["/praca", "/mundo"] },
  { href: "/metodologia", label: "Metodologia" },
];

export function SiteHeader() {
  return (
    <header className="palco relative z-30 border-b border-stage-line">
      <div className="page flex h-[var(--atlas-header-h)] items-center justify-between gap-6">
        {/* A área de toque tem a altura mínima de 44 pixels; o desenho do nome não muda. */}
        <IntentLink href="/" className="inline-flex min-h-11 items-center gap-2 font-serif text-[1.375rem] font-medium leading-none tracking-tight text-stage-ink no-underline">
          <span aria-hidden="true" className="inline-block size-2.5 rounded-full bg-action" />
          Atlas Político
        </IntentLink>
        <SiteNav items={NAV_ITEMS} />
      </div>
    </header>
  );
}
