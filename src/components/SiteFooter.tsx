import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="palco border-t border-stage-line">
      <div className="page flex flex-wrap justify-between gap-x-8 gap-y-2 py-6 text-sm text-stage-ink-soft">
        <p>Atlas Político (nome provisório) · um projeto MilWeb</p>
        <ul className="flex flex-wrap gap-x-6 gap-y-1">
          <li>
            <Link href="/metodologia" prefetch={false} className="text-stage-ink underline decoration-stage-line hover:decoration-stage-ink">
              Metodologia e fontes
            </Link>
          </li>
          <li>
            <Link href="/metodologia#creditos" prefetch={false} className="text-stage-ink underline decoration-stage-line hover:decoration-stage-ink">
              Créditos
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
