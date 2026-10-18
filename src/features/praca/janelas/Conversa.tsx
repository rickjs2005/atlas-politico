"use client";

// Conversa com um morador: um grafo pequeno, uma fala de cada vez, escolhas
// como botões. O grafo é escolhido quando a conversa começa e não muda no
// meio dela; o item que um nó entrega vai para o progresso na hora.

import { useState } from "react";

import { nodeText, type DialogGraph, type DialogState } from "@/lib/game/escrivao";
import { ITENS, ITENS_POR_NO, MORADORES } from "@/lib/praca/praca";
import { conversaDe, conversar, currentNode, isDialogOver, pegarItem, startDialog } from "@/lib/praca/regras";
import type { ConteudoDaPraca, MoradorId, ProgressoDaPraca } from "@/lib/praca/tipos";

import { BOTAO_PRINCIPAL, type AtualizarProgresso } from "./tipos";

export function Conversa({
  morador,
  conteudo,
  progresso,
  onProgresso,
  onEncerrar,
  rotuloDoFim = "Encerrar",
}: {
  morador: MoradorId;
  conteudo: ConteudoDaPraca;
  progresso: ProgressoDaPraca;
  onProgresso: AtualizarProgresso;
  onEncerrar: () => void;
  rotuloDoFim?: string;
}) {
  const [{ chave, grafo }] = useState<{ chave: string; grafo: DialogGraph }>(() => conversaDe(morador, progresso, conteudo));
  const [estado, setEstado] = useState<DialogState>(() => startDialog(grafo));
  // A conversa fica marcada como vista quando a pessoa escolhe algo ou a encerra: na próxima visita, a janela abre direto no que interessa.
  const marcarVista = (atual: ProgressoDaPraca) => (atual.marcas.includes(`conversa:${chave}`) ? atual : { ...atual, marcas: [...atual.marcas, `conversa:${chave}`] });
  const no = currentNode(estado, grafo);
  const acabou = isDialogOver(estado, grafo);
  const itemRecebido = ITENS_POR_NO[estado.no];
  const pessoa = MORADORES[morador];
  const escolher = (escolhaId: string) => {
    const passo = conversar(progresso, grafo, estado, escolhaId);
    setEstado(passo.estado);
    onProgresso((atual) => {
      // O passo é refeito sobre o progresso mais novo: só as marcas e o item entram, nada mais é tocado.
      let proximo = marcarVista(atual);
      for (const marca of passo.estado.marcas) if (!proximo.marcas.includes(marca)) proximo = { ...proximo, marcas: [...proximo.marcas, marca] };
      const item = ITENS_POR_NO[passo.estado.no];
      return item === undefined ? proximo : pegarItem(proximo, item);
    });
  };
  return (
    <div className="space-y-3" data-conversa={chave}>
      <p className="text-sm text-ink-soft">
        <strong className="text-ink">{pessoa.nome}</strong>, {pessoa.papel}. Personagem fictício.
      </p>
      <ol className="space-y-2">
        {estado.visitados.map((id, i) => (
          <li key={`${id}-${i}`} className={`rounded-xl border px-4 py-3 leading-snug ${i === estado.visitados.length - 1 ? "border-ink bg-raised" : "border-line bg-raised/60 text-ink-soft"}`} data-fala={id}>
            {nodeText(grafo.nos[id]!, estado.marcas)}
          </li>
        ))}
      </ol>
      {itemRecebido !== undefined && (
        <p className="rounded-md border border-ink bg-sunken px-3 py-2 text-sm font-medium" data-item-recebido={itemRecebido}>
          Você guardou: {ITENS[itemRecebido].nome}.
        </p>
      )}
      {acabou ? (
        <button
          type="button"
          onClick={() => {
            onProgresso(marcarVista);
            onEncerrar();
          }}
          className={BOTAO_PRINCIPAL}
          data-encerrar
        >
          {rotuloDoFim}
        </button>
      ) : (
        <div className="grid gap-2">
          {no.escolhas.map((escolha) => (
            <button key={escolha.id} type="button" onClick={() => escolher(escolha.id)} className="min-h-11 rounded-md border-2 border-line-strong bg-raised px-4 py-2.5 text-left font-medium" data-escolha={escolha.id}>
              {escolha.texto}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
