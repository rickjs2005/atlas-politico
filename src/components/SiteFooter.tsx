import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="page flex flex-wrap justify-between gap-x-8 gap-y-2 py-6 text-sm text-ink-soft">
        <p>Atlas Político (nome provisório) · um projeto MilWeb</p>
        <ul className="flex flex-wrap gap-x-6 gap-y-1">
          <li>
            <Link href="/metodologia" className="underline decoration-line-strong hover:decoration-ink">
              Metodologia e fontes
            </Link>
          </li>
          <li>
            <Link href="/metodologia#creditos" className="underline decoration-line-strong hover:decoration-ink">
              Créditos
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
