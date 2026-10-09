// Troca de pessoa dentro da exploração. Os perfis aparecem sempre todos, na
// ordem alfabética do atlas, com o mesmo desenho: o que está aberto fica
// marcado, e os outros são links que levam junto o recorte em vigor.

import Link from "next/link";

export interface PersonOption {
  slug: string;
  nome: string;
  /** Endereço da exploração da pessoa; `null` para o perfil que já está aberto. */
  href: string | null;
}

interface PersonSwitchProps {
  options: readonly PersonOption[];
  /** `compacto`: para a barra da exploração em tela larga. */
  size?: "toque" | "compacto";
  className?: string;
}

export function PersonSwitch({ options, size = "toque", className = "" }: PersonSwitchProps) {
  const item =
    size === "toque"
      ? "flex min-h-11 items-center border px-3 text-sm"
      : "flex min-h-6 items-center border px-2 text-xs";

  return (
    <nav aria-label="Trajetórias" className={className}>
      <ul className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <li key={option.slug}>
            {option.href === null ? (
              <span aria-current="page" className={`${item} border-ink bg-ink font-medium text-paper`}>
                {option.nome}
              </span>
            ) : (
              <Link
                href={option.href}
                // O endereço muda a cada filtro: sem isso, cada mudança
                // buscaria de novo a página do outro perfil.
                prefetch={false}
                className={`${item} border-line-strong bg-raised no-underline transition-colors duration-[var(--atlas-fast)] hover:border-ink`}
              >
                {option.nome}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
