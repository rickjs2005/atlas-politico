import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-x-8 gap-y-1 px-4 py-6 text-sm text-ink-soft">
        <p>Atlas Político (nome provisório) · um projeto MilWeb</p>
        <p>
          <Link href="/metodologia" className="underline">
            Como o atlas trata fontes, datas e lugares
          </Link>
        </p>
      </div>
    </footer>
  );
}
