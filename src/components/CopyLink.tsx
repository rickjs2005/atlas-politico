"use client";

// Copiar para a área de transferência, com duas regras:
//   - a confirmação só aparece depois que a cópia deu certo;
//   - se o navegador não deixa copiar (sem a API, sem permissão, página fora de
//     um contexto seguro), o texto aparece em um campo, já selecionado, para a
//     pessoa copiar à mão.

import { useEffect, useId, useRef, useState } from "react";

export type CopyStatus = "parado" | "copiado" | "falhou";

/** Quanto tempo a confirmação fica na tela. */
const CONFIRMATION_MS = 4000;

export function useCopy() {
  const [status, setStatus] = useState<CopyStatus>("parado");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async (texto: string) => {
    window.clearTimeout(timer.current);
    try {
      // Fora de um contexto seguro o navegador nem oferece a API.
      if (!navigator.clipboard?.writeText) throw new Error("Área de transferência indisponível.");
      await navigator.clipboard.writeText(texto);
      setStatus("copiado");
      timer.current = window.setTimeout(() => setStatus("parado"), CONFIRMATION_MS);
    } catch {
      setStatus("falhou");
    }
  };

  return { status, copy };
}

interface CopyLinkProps {
  /** Caminho do atlas, com a consulta: `/comparar/?de=2003`. O domínio vem do navegador. */
  path: string;
  label?: string;
  /** `botao` tem borda e área de toque; `texto` é um link sublinhado, para linhas de rótulo. */
  variant?: "botao" | "texto";
  className?: string;
}

const VARIANTS = {
  botao:
    "inline-flex min-h-11 items-center gap-2 border border-ink-faint bg-raised px-3 text-sm font-medium hover:border-ink xl:min-h-9",
  texto:
    "inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-ink-soft underline decoration-line-strong hover:text-ink xl:min-h-0",
};

export function CopyLink(props: CopyLinkProps) {
  // Outro endereço é outra cópia: a confirmação e o campo da anterior saem.
  return <CopyLinkControl key={props.path} {...props} />;
}

function CopyLinkControl({ path, label = "Copiar link", variant = "botao", className = "" }: CopyLinkProps) {
  const id = useId();
  const { status, copy } = useCopy();
  // O endereço completo só existe no navegador, e só é montado ao copiar.
  const [url, setUrl] = useState("");
  const field = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status !== "falhou") return;
    const campo = field.current;
    if (!campo) return;
    campo.focus();
    campo.select();
    // O campo mostra o começo do endereço, e não o fim.
    campo.scrollLeft = 0;
  }, [status]);

  const onCopy = () => {
    // O endereço real de onde a página está aberta: nenhum domínio é suposto.
    const completo = new URL(path, window.location.origin).href;
    setUrl(completo);
    void copy(completo);
  };

  return (
    <div className={`min-w-0 ${className}`} data-copy={status}>
      <button type="button" onClick={onCopy} className={VARIANTS[variant]}>
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" className="shrink-0 fill-none stroke-current stroke-[1.5]">
          {status === "copiado" ? (
            <path d="M3 8.5l3.2 3.2L13 5" />
          ) : (
            <path d="M6.5 9.5l3-3M7 4.6l1-1a2.6 2.6 0 013.7 3.7l-1 1M9 11.4l-1 1a2.6 2.6 0 01-3.7-3.7l1-1" />
          )}
        </svg>
        {status === "copiado" ? "Link copiado" : label}
      </button>
      <span role="status" className="sr-only">
        {status === "copiado" && "Link copiado para a área de transferência."}
        {status === "falhou" && "Não foi possível copiar. O link está em um campo, para selecionar."}
      </span>
      {status === "falhou" && (
        <div className="mt-2 max-w-md space-y-1">
          <label htmlFor={`${id}-link`} className="block text-xs text-ink-soft">
            Não foi possível copiar daqui. Selecione o link e copie:
          </label>
          <input
            ref={field}
            id={`${id}-link`}
            readOnly
            value={url}
            onFocus={(evento) => evento.currentTarget.select()}
            className="numerals h-11 w-full min-w-0 border border-ink-faint bg-raised px-2 text-sm"
          />
        </div>
      )}
    </div>
  );
}
