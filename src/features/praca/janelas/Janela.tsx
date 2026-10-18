"use client";

// O quadro comum de toda interação da praça: uma folha de papel sobre a cena
// escurecida, com o título focado ao abrir, Esc para fechar e o foco devolvido
// por quem a abriu. Uma janela tem uma função só.

import { useEffect, useRef } from "react";

export function Janela({ id, titulo, sobre, onFechar, children }: { id: string; titulo: string; sobre?: string; onFechar: () => void; children: React.ReactNode }) {
  const cabecalho = useRef<HTMLHeadingElement>(null);
  useEffect(() => cabecalho.current?.focus(), []);
  useEffect(() => {
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") onFechar();
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [onFechar]);
  return (
    <div role="dialog" aria-modal="true" aria-labelledby={`janela-${id}-titulo`} className="absolute inset-0 z-20 flex items-end justify-center bg-stage/60 sm:items-center sm:p-6" data-janela={id}>
      <div className="folha flex max-h-[92%] w-full max-w-3xl flex-col rounded-t-2xl shadow-2xl sm:rounded-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 pt-5 pb-3">
          <div>
            {sobre !== undefined && <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase">{sobre}</p>}
            <h2 id={`janela-${id}-titulo`} ref={cabecalho} tabIndex={-1} className="font-serif text-2xl font-medium outline-none sm:text-3xl">
              {titulo}
            </h2>
          </div>
          <button type="button" onClick={onFechar} className="inline-flex min-h-11 items-center rounded-md border border-line px-3 py-1.5 text-sm" data-fechar>
            Sair
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4" data-janela-corpo>
          {children}
        </div>
      </div>
    </div>
  );
}
