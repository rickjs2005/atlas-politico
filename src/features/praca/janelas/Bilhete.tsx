"use client";

// Um bilhete no chão, perto do coreto: ler e guardar. Ficção da praça.

import { BILHETE } from "@/lib/praca/praca";
import { pegarItem } from "@/lib/praca/regras";

import { Janela } from "./Janela";
import { BOTAO_PRINCIPAL, type JanelaDaPraca } from "./tipos";

export function Bilhete({ onProgresso, onFechar }: Pick<JanelaDaPraca, "onProgresso" | "onFechar">) {
  return (
    <Janela titulo="Um bilhete no chão" id="bilhete" onFechar={onFechar}>
      <p className="text-sm text-ink-soft">Perto do degrau do coreto, um papel amassado. A letra é de quem escreve muito.</p>
      <blockquote className="mt-3 rounded-md border border-line bg-sunken p-4 font-serif text-lg leading-snug" data-bilhete>
        {BILHETE}
      </blockquote>
      <button
        type="button"
        onClick={() => {
          onProgresso((atual) => pegarItem(atual, "bilhete"));
          onFechar();
        }}
        className={`mt-4 ${BOTAO_PRINCIPAL}`}
        data-guardar-bilhete
      >
        Guardar o bilhete
      </button>
    </Janela>
  );
}
