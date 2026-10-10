"use client";

// Janela modal do jogo: título, conteúdo e botões, com o foco preso dentro
// dela enquanto está aberta. Esc fecha. Quem a abre devolve o foco à cena ao
// fechar. É DOM comum, e não o `confirm` do navegador, para ser legível por
// leitor de tela e testável.

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

interface DialogProps {
  titulo: ReactNode;
  /** Rótulo pequeno acima do título. */
  eyebrow?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  /** Os botões, no rodapé. */
  acoes?: ReactNode;
  /** Largura máxima. */
  tamanho?: "medio" | "largo";
  /** Identificador para os testes. */
  nome: string;
  /**
   * Quando muda, o foco volta ao botão principal. Serve à janela que troca os
   * botões do rodapé sem fechar: o botão que tinha o foco deixou de existir.
   */
  focoChave?: string | number;
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Por quanto tempo, ao abrir, a janela não aceita toque nem clique. Em
 * celular, a janela abre embaixo, e o botão que a fecha aparece onde estava o
 * botão de ação: um segundo toque dado por reflexo fecharia o registro antes
 * de ele ser lido. O teclado não espera.
 */
const TAP_GUARD_MS = 350;

export function Dialog({ titulo, eyebrow, onClose, children, acoes, tamanho = "medio", nome, focoChave }: DialogProps) {
  const ref = useRef<HTMLDivElement>(null);
  const tituloId = useId();
  const [aceitaPonteiro, setAceitaPonteiro] = useState(false);
  useEffect(() => {
    const espera = window.setTimeout(() => setAceitaPonteiro(true), TAP_GUARD_MS);
    return () => window.clearTimeout(espera);
  }, []);

  // O foco entra na janela ao abrir, e volta ao botão principal quando os
  // botões mudam.
  useEffect(() => {
    const caixa = ref.current;
    if (caixa === null) return;
    // O botão marcado, o primeiro controle ou a própria janela.
    const preferido = caixa.querySelector<HTMLElement>("[data-foco-inicial]");
    const primeiro = preferido ?? caixa.querySelector<HTMLElement>(FOCUSABLE) ?? caixa;
    primeiro.focus({ preventScroll: true });
    // O foco pode cair em um controle no meio de uma lista longa (o painel, na
    // volta de uma releitura). A área de rolagem da própria janela o traz à
    // vista; a página não rola.
    const area = caixa.querySelector<HTMLElement>("[data-janela-corpo]");
    if (area !== null && area.contains(primeiro)) {
      const limite = area.getBoundingClientRect();
      const alvo = primeiro.getBoundingClientRect();
      if (alvo.top < limite.top) area.scrollTop -= limite.top - alvo.top + 8;
      else if (alvo.bottom > limite.bottom) area.scrollTop += alvo.bottom - limite.bottom + 8;
    }
  }, [focoChave]);

  useEffect(() => {
    const caixa = ref.current;
    if (caixa === null) return;

    const onKeyDown = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") {
        evento.preventDefault();
        evento.stopPropagation();
        onClose();
        return;
      }
      if (evento.key !== "Tab") return;
      const focaveis = Array.from(caixa.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focaveis.length === 0) {
        evento.preventDefault();
        return;
      }
      const inicio = focaveis[0]!;
      const fim = focaveis[focaveis.length - 1]!;
      if (evento.shiftKey && document.activeElement === inicio) {
        evento.preventDefault();
        fim.focus();
      } else if (!evento.shiftKey && document.activeElement === fim) {
        evento.preventDefault();
        inicio.focus();
      }
    };
    caixa.addEventListener("keydown", onKeyDown);
    return () => caixa.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="absolute inset-0 z-30 flex items-end justify-center bg-ink/45 p-3 md:items-center md:p-6"
      data-dialogo={nome}
      // Clicar no fundo não tira o foco de dentro da janela.
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) evento.preventDefault();
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        tabIndex={-1}
        data-aceita-ponteiro={aceitaPonteiro ? "sim" : "nao"}
        className={`animate-enter flex max-h-full w-full flex-col border border-ink bg-raised shadow-[0_24px_48px_-24px_rgb(0_0_0/0.5)] outline-none ${
          tamanho === "largo" ? "max-w-2xl" : "max-w-lg"
        } ${aceitaPonteiro ? "" : "pointer-events-none"}`}
      >
        <header className="space-y-1 border-b border-line px-4 pb-3 pt-4 md:px-6">
          {eyebrow !== undefined && <p className="eyebrow text-ink-soft">{eyebrow}</p>}
          <h2 id={tituloId} className="font-serif text-2xl font-medium leading-tight tracking-tight">
            {titulo}
          </h2>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-6" data-janela-corpo>
          {children}
        </div>
        {acoes !== undefined && (
          <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-line px-4 py-3 md:px-6">{acoes}</footer>
        )}
      </div>
    </div>
  );
}

export const primaryButton =
  "inline-flex min-h-11 items-center justify-center border border-ink bg-ink px-4 text-sm font-medium text-paper no-underline hover:bg-ink-soft";
export const secondaryButton =
  "inline-flex min-h-11 items-center justify-center border border-ink bg-raised px-4 text-sm font-medium no-underline hover:bg-paper";
export const quietButton =
  "inline-flex min-h-11 items-center justify-center px-2 text-sm font-medium underline decoration-line-strong hover:decoration-ink";
