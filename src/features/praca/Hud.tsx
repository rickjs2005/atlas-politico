"use client";

// O que fica sobre a cena (D-155): o cartão "Pauta de agora", com o objetivo
// e um passo por vez ("Passo 2 de 4"), o botão do caderno e, perto de um
// lugar, o botão de ação. Nada aqui muda a cada quadro: muda com o progresso
// e com a proximidade, que a cena avisa por evento.

import { forwardRef } from "react";

import { passoDeAgora } from "@/lib/praca/passos";
import { objetivoDeAgora } from "@/lib/praca/regras";
import type { ConteudoDaPraca, ProgressoDaPraca } from "@/lib/praca/tipos";

import type { PontoId } from "./scene";

const ROTULO_DA_ACAO: Record<PontoId, string> = {
  mural: "Ler o mural",
  padaria: "Falar com a Zefa",
  banca: "Ver a banca",
  arquivo: "Entrar no arquivo",
  camara: "Câmara",
  bilhete: "Pegar o bilhete",
};

export function rotuloDaAcao(ponto: PontoId, camaraAberta: boolean): string {
  if (ponto === "camara") return camaraAberta ? "Entrar na Câmara" : "Câmara (fechada)";
  return ROTULO_DA_ACAO[ponto];
}

interface HudProps {
  conteudo: ConteudoDaPraca;
  progresso: ProgressoDaPraca;
  semCena: boolean;
  publicadas: number;
  disponiveis: number;
  atas: number;
  onAbrirCaderno: () => void;
}

export function Hud({ conteudo, progresso, semCena, publicadas, disponiveis, atas, onAbrirCaderno }: HudProps) {
  const objetivo = objetivoDeAgora(progresso, conteudo);
  const passo = passoDeAgora(progresso, conteudo);
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
      <div className="pointer-events-auto max-w-[min(72vw,30rem)] rounded-md border border-stage-line bg-stage/85 px-3 py-2 text-sm text-stage-ink shadow-lg backdrop-blur-sm" data-cartao-da-pauta>
        <p className="eyebrow text-highlight">Pauta de agora</p>
        <p className="font-medium" data-objetivo>
          {objetivo}
        </p>
        {passo !== null && (
          <p className="mt-1 border-t border-stage-line pt-1 text-xs leading-snug" data-passo-de-agora={passo.passos[passo.indice]!.id}>
            <span className="numerals font-semibold text-action">
              Passo {passo.indice + 1} de {passo.passos.length}
            </span>{" "}
            · {passo.passos[passo.indice]!.texto}
          </p>
        )}
        <p className="mt-1 text-xs text-stage-ink-soft" data-instrucao-da-praca>
          {semCena ? "Toque em um lugar da lista." : `Notas no mural: ${publicadas} de ${disponiveis} · Cópias: ${progresso.copias.length}${atas > 0 ? " · Ata lavrada" : ""}`}
        </p>
      </div>
      <button type="button" onClick={onAbrirCaderno} className="pointer-events-auto inline-flex min-h-11 items-center rounded-md border border-action bg-action px-3 py-2 text-sm font-semibold text-action-ink" data-abrir="caderno">
        Caderno
      </button>
    </div>
  );
}

/** O botão de ação, perto de um lugar: E ou Enter também o acionam. */
export const BotaoDeAcao = forwardRef<HTMLButtonElement, { ponto: PontoId; rotulo: string; onClick: () => void }>(function BotaoDeAcao({ ponto, rotulo, onClick }, ref) {
  return (
    <div className="absolute inset-x-0 bottom-48 flex justify-center px-4 sm:bottom-10">
      <button ref={ref} type="button" onClick={onClick} className="inline-flex min-h-12 items-center rounded-full border-2 border-action bg-stage/90 px-6 py-3 text-base font-semibold text-stage-ink shadow-lg" data-acao={ponto}>
        {rotulo}
      </button>
    </div>
  );
});
