"use client";

// O arquivo: a conversa com o Escrivão e as gavetas, por pessoa e por ano.
// Cada documento se lê em cinco campos, e a cópia vai para o caderno. A
// gaveta trancada abre a janela do mesmo jeito, para dizer por que está
// trancada.

import { useState } from "react";

import { formatDate } from "@/lib/domain/dates";
import { conversaDe, devolverCopia, gavetaAberta, levarCopia } from "@/lib/praca/regras";
import type { Gaveta } from "@/lib/praca/tipos";

import { Conversa } from "./Conversa";
import { CamposDoDocumento } from "./Documento";
import { Janela } from "./Janela";
import { ABA, type JanelaDaPraca } from "./tipos";

export function Arquivo({ conteudo, progresso, onProgresso, onFechar }: JanelaDaPraca) {
  const [aba, setAba] = useState<"escrivao" | "gavetas">(() => (progresso.marcas.includes(`conversa:${conversaDe("escrivao", progresso, conteudo).chave}`) ? "gavetas" : "escrivao"));
  const [gavetaAbertaId, setGaveta] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [lendo, setLendo] = useState<string | null>(null);
  const gaveta = conteudo.gavetas.find((item) => item.id === gavetaAbertaId) ?? null;

  const abrirGaveta = (alvo: Gaveta) => {
    if (!gavetaAberta(alvo, progresso)) {
      setAviso(`A gaveta ${alvo.rotulo} está trancada. O Escrivão perdeu a chave de novo, e deixou um bilhete para quem a tem.`);
      return;
    }
    setAviso(null);
    setGaveta(alvo.id);
  };

  return (
    <Janela id="arquivo" titulo="Arquivo" sobre="Gavetas por pessoa e por ano" onFechar={onFechar}>
      <div className="mb-3 flex gap-2" role="tablist">
        {(["escrivao", "gavetas"] as const).map((id) => (
          <button key={id} type="button" role="tab" aria-selected={aba === id} onClick={() => setAba(id)} className={ABA(aba === id)} data-aba={id}>
            {id === "escrivao" ? "Escrivão" : "Gavetas"}
          </button>
        ))}
      </div>
      {aba === "escrivao" && <Conversa morador="escrivao" conteudo={conteudo} progresso={progresso} onProgresso={onProgresso} onEncerrar={() => setAba("gavetas")} rotuloDoFim="Abrir as gavetas" />}
      {aba === "gavetas" && gaveta === null && (
        <div className="space-y-4" data-gavetas>
          {aviso !== null && (
            <p className="rounded-md border border-line-strong bg-sunken px-3 py-2 text-sm" data-aviso-da-gaveta>
              {aviso}
            </p>
          )}
          {Object.entries(conteudo.pessoas).map(([slug, pessoa]) => (
            <section key={slug} aria-label={pessoa.nome}>
              <h3 className="font-serif text-xl">{pessoa.nome}</h3>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {conteudo.gavetas
                  .filter((item) => item.pessoa === slug)
                  .map((item) => {
                    const aberta = gavetaAberta(item, progresso);
                    const levadas = item.documentos.filter((id) => progresso.copias.includes(id)).length;
                    return (
                      <button key={item.id} type="button" onClick={() => abrirGaveta(item)} className={`min-h-11 rounded-md border-2 px-3 py-2 text-left text-sm ${aberta ? "border-line-strong bg-raised" : "border-dashed border-line text-ink-soft"}`} data-gaveta={item.id} data-trancada={!aberta}>
                        <span className="block font-medium">{item.rotulo}</span>
                        <span className="block text-xs text-ink-soft">{aberta ? `${item.documentos.length} ${item.documentos.length === 1 ? "documento" : "documentos"}${levadas > 0 ? ` · ${levadas} cópia${levadas > 1 ? "s" : ""}` : ""}` : "trancada"}</span>
                      </button>
                    );
                  })}
              </div>
            </section>
          ))}
        </div>
      )}
      {aba === "gavetas" && gaveta !== null && (
        <div className="space-y-3" data-gaveta-aberta={gaveta.id}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-serif text-xl">
              Gaveta {gaveta.rotulo} · {conteudo.pessoas[gaveta.pessoa].nome}
            </h3>
            <button type="button" onClick={() => setGaveta(null)} className="min-h-11 text-sm underline" data-voltar-as-gavetas>
              Voltar às gavetas
            </button>
          </div>
          <ul className="space-y-2">
            {gaveta.documentos.map((id) => {
              const documento = conteudo.documentos[id]!;
              const levada = progresso.copias.includes(id);
              const aberto = lendo === id;
              return (
                <li key={id} className="rounded-xl border border-line-strong bg-raised p-3" data-documento={id} data-copia={levada}>
                  <p className="font-medium leading-snug">{documento.titulo}</p>
                  <p className="text-sm text-ink-soft">{formatDate(documento.data)}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button type="button" onClick={() => setLendo(aberto ? null : id)} aria-expanded={aberto} className="min-h-11 rounded-md border border-line-strong px-3 py-1.5 text-sm" data-abrir-documento={id}>
                      {aberto ? "Fechar" : "Ler"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onProgresso((atual) => (levada ? devolverCopia(atual, id) : levarCopia(atual, id, conteudo.gavetas)))}
                      className={`min-h-11 rounded-md border px-3 py-1.5 text-sm font-medium ${levada ? "border-line" : "border-ink bg-ink text-paper"}`}
                      data-levar={levada ? undefined : id}
                      data-devolver={levada ? id : undefined}
                    >
                      {levada ? "Devolver a cópia" : "Levar uma cópia"}
                    </button>
                  </div>
                  {aberto && <CamposDoDocumento documento={documento} />}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Janela>
  );
}
