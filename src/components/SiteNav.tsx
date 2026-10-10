"use client";

// Menu principal. Em telas largas, os destinos ficam em linha. Em telas
// estreitas, viram um painel aberto por um botão, para o cabeçalho ocupar uma
// linha só e deixar a tela para o conteúdo.

import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";

import { IntentLink } from "./IntentLink";

interface NavItem {
  href: string;
  label: string;
}

export function SiteNav({ items }: { items: readonly NavItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const panelId = useId();

  // Trocar de página fecha o painel: o cabeçalho continua montado entre as rotas.
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const close = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);

  const isCurrent = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  const links = (onNavigate?: () => void) =>
    items.map((item) => (
      <li key={item.href}>
        {/* O destino só é adiantado quando a pessoa aponta ou foca o link. */}
        <IntentLink
          href={item.href}
          aria-current={isCurrent(item.href) ? "page" : undefined}
          onClick={onNavigate}
          className="block py-2 text-sm text-ink-soft underline-offset-[0.4em] hover:text-ink aria-[current=page]:font-semibold aria-[current=page]:text-ink aria-[current=page]:underline md:py-1"
        >
          {item.label}
        </IntentLink>
      </li>
    ));

  return (
    <nav aria-label="Principal" className="md:static">
      <ul className="hidden items-center gap-x-6 md:flex">{links()}</ul>

      <div className="md:hidden">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen(!open)}
          className="-mr-2 flex h-11 items-center gap-2 px-2 text-sm font-medium"
        >
          <span aria-hidden="true" className="flex w-4 flex-col gap-[3px]">
            <span className="h-px bg-ink" />
            <span className="h-px bg-ink" />
            <span className="h-px bg-ink" />
          </span>
          Menu
        </button>
        <ul
          id={panelId}
          hidden={!open}
          className="absolute inset-x-0 top-full z-40 border-b border-ink bg-raised px-[var(--atlas-gutter)] py-2 shadow-[0_12px_24px_-16px_rgb(0_0_0/0.35)]"
        >
          {links(() => setOpen(false))}
        </ul>
      </div>
    </nav>
  );
}
