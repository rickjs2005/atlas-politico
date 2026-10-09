"use client";

// Modelo de sugestão de correção, para copiar. Reúne o que uma sugestão
// precisa ter para ser conferida: o link do acontecimento, a informação a
// corrigir e a fonte proposta.
//
// Quem chega da página de um acontecimento traz `?acontecimento=<slug>` no
// endereço, e o modelo já vem com o link e o título daquele registro. O slug só
// é aceito se for de um acontecimento publicado.

import { useEffect, useId, useRef } from "react";

import { useCopy } from "@/components/CopyLink";
import { UrlWatcher, useOrigin, useOwnSearch } from "@/lib/state/location";

interface CorrectionTemplateProps {
  /** Os acontecimentos publicados: é o que o parâmetro do endereço pode nomear. */
  events: readonly { slug: string; titulo: string }[];
  /** Identificação da edição, como "0.1.0, com registros até 8 de outubro de 2026". */
  edition: string | null;
}

const PATH = "/metodologia";

function buildTemplate(link: string, titulo: string | null, edition: string | null): string {
  return [
    "Sugestão de correção ao Atlas Político",
    "",
    `Link do acontecimento: ${link}`,
    ...(titulo === null ? [] : [`Registro: ${titulo}`]),
    ...(edition === null ? [] : [`Edição consultada: ${edition}`]),
    "",
    "Informação a corrigir:",
    "(o trecho do atlas que está errado ou incompleto, e como ele deveria ficar)",
    "",
    "Fonte proposta:",
    "(link do documento, quem publicou, data, e em que parte dele está o trecho que sustenta a correção)",
    "",
  ].join("\n");
}

export function CorrectionTemplate({ events, edition }: CorrectionTemplateProps) {
  const id = useId();
  const search = useOwnSearch(PATH);
  const origin = useOrigin();
  const { status, copy } = useCopy();
  const field = useRef<HTMLTextAreaElement>(null);

  const slug = new URLSearchParams(search).get("acontecimento");
  const event = slug === null ? null : (events.find((item) => item.slug === slug) ?? null);
  const texto = buildTemplate(
    event === null ? "(cole aqui o link da página do acontecimento)" : `${origin}/acontecimentos/${event.slug}/`,
    event?.titulo ?? null,
    edition,
  );

  // Sem conseguir copiar, o texto fica selecionado para a pessoa copiar à mão.
  useEffect(() => {
    if (status !== "falhou") return;
    field.current?.focus();
    field.current?.select();
  }, [status]);

  return (
    <div className="space-y-2" data-modelo={event?.slug ?? ""}>
      <UrlWatcher />
      <label htmlFor={`${id}-modelo`} className="block text-sm font-medium">
        Modelo de sugestão
        {event !== null && <span className="font-normal text-ink-soft"> · já com o link do registro</span>}
      </label>
      <textarea
        ref={field}
        id={`${id}-modelo`}
        readOnly
        value={texto}
        rows={12}
        className="block w-full resize-y border border-ink-faint bg-raised p-3 font-sans text-sm leading-relaxed"
      />
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <button
          type="button"
          onClick={() => void copy(texto)}
          className="inline-flex min-h-11 items-center border border-ink px-4 text-sm font-medium hover:bg-ink hover:text-paper"
        >
          {status === "copiado" ? "Modelo copiado" : "Copiar o modelo"}
        </button>
        <p role="status" className="text-sm text-ink-soft">
          {status === "copiado" && "Copiado para a área de transferência."}
          {status === "falhou" && "Não foi possível copiar daqui. O texto está selecionado: copie à mão."}
        </p>
      </div>
    </div>
  );
}
