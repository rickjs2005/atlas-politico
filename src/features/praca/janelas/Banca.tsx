"use client";

// A banca do Teodoro: a conversa e os recortes de jornal, por data, com filtro
// por pessoa. Recorte diz o que aconteceu; o voto fica no arquivo.

import Link from "next/link";
import { useState } from "react";

import { formatDate } from "@/lib/domain/dates";
import { conversaDe } from "@/lib/praca/regras";

import { Conversa } from "./Conversa";
import { Janela } from "./Janela";
import { ABA, type JanelaDaPraca } from "./tipos";

export function Banca({ conteudo, progresso, onProgresso, onFechar }: JanelaDaPraca) {
  const [aba, setAba] = useState<"teodoro" | "recortes">(() => (progresso.marcas.includes(`conversa:${conversaDe("teodoro", progresso, conteudo).chave}`) ? "recortes" : "teodoro"));
  const [filtro, setFiltro] = useState<string>("todos");
  const recortes = conteudo.recortes.filter((recorte) => filtro === "todos" || recorte.pessoa === filtro || recorte.pessoa === "ambas");
  return (
    <Janela id="banca" titulo="Banca do Teodoro" sobre="Recortes de jornal, por data" onFechar={onFechar}>
      <div className="mb-3 flex gap-2" role="tablist">
        {(["teodoro", "recortes"] as const).map((id) => (
          <button key={id} type="button" role="tab" aria-selected={aba === id} onClick={() => setAba(id)} className={ABA(aba === id)} data-aba={id}>
            {id === "teodoro" ? "Teodoro" : "Recortes"}
          </button>
        ))}
      </div>
      {aba === "teodoro" ? (
        <Conversa morador="teodoro" conteudo={conteudo} progresso={progresso} onProgresso={onProgresso} onEncerrar={() => setAba("recortes")} rotuloDoFim="Ver os recortes" />
      ) : (
        <div className="space-y-3" data-recortes>
          <p className="text-sm text-ink-soft">Cada recorte é um acontecimento do atlas, com a data registrada. Recorte diz o que aconteceu; o voto fica no arquivo.</p>
          <div className="flex flex-wrap gap-2">
            {[{ id: "todos", nome: "Todos" }, ...Object.entries(conteudo.pessoas).map(([id, pessoa]) => ({ id, nome: pessoa.nome }))].map((opcao) => (
              <button key={opcao.id} type="button" onClick={() => setFiltro(opcao.id)} aria-pressed={filtro === opcao.id} className={`min-h-11 rounded-md border px-3 py-1 text-sm ${filtro === opcao.id ? "border-ink bg-sunken" : "border-line"}`} data-filtro={opcao.id}>
                {opcao.nome}
              </button>
            ))}
          </div>
          <ul className="divide-y divide-line">
            {recortes.map((recorte) => (
              <li key={recorte.id} className="flex flex-wrap items-baseline gap-x-3 py-2" data-recorte={recorte.id}>
                <span className="numerals text-sm text-ink-soft">{formatDate(recorte.data)}</span>
                <Link href={`/acontecimentos/${recorte.slug}/`} target="_blank" rel="noopener noreferrer" className="underline">
                  {recorte.titulo}
                </Link>
                {recorte.pessoa !== "ambas" && <span className="text-xs text-ink-soft">{conteudo.pessoas[recorte.pessoa].nome}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Janela>
  );
}
