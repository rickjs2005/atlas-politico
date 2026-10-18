"use client";

// A entrada da praça: uma frase e um botão (D-153), no palco. Quem já jogou
// vê "Continuar". As preferências de desenho (modo leve, lista) ficam aqui
// também, antes de a cena nascer; o que é ficção e o que é documento fica
// dobrado abaixo.

import { useMemo, useSyncExternalStore } from "react";

import { lerProgresso } from "@/lib/praca/regras";
import type { ConteudoDaPraca } from "@/lib/praca/tipos";

import { lerBruto, temHistoria, type PreferenciasDaPraca } from "./persistencia";

const semAssinatura = () => () => {};

interface EntradaProps {
  conteudo: ConteudoDaPraca;
  preferencias: PreferenciasDaPraca;
  onPreferencias: (preferencias: PreferenciasDaPraca) => void;
  onEntrar: () => void;
  onRecomecar: () => void;
}

export function Entrada({ conteudo, preferencias, onPreferencias, onEntrar, onRecomecar }: EntradaProps) {
  // O que está salvo no navegador, lido sem efeito: no servidor não há nada, e a tela diz "Entrar".
  const bruto = useSyncExternalStore(semAssinatura, lerBruto, () => null);
  const continua = useMemo(() => {
    if (bruto === null) return false;
    try {
      const salvo = lerProgresso(JSON.parse(bruto), conteudo);
      return salvo !== null && temHistoria(salvo);
    } catch {
      return false;
    }
  }, [bruto, conteudo]);
  return (
    <div className="palco flex flex-1 flex-col">
      <div className="page max-w-2xl space-y-5 py-10">
        <p className="eyebrow text-highlight">Aventura de investigação · protótipo</p>
        <h1 className="font-serif text-4xl font-medium tracking-tight sm:text-5xl">Praça do Mural</h1>
        <p className="font-serif text-lg leading-snug md:text-xl">
          Você chegou hoje à rádio comunitária. No mural da praça, os moradores pregam perguntas sobre o que os políticos decidiram, e ninguém responde. Quem responder precisa pregar o documento junto.
        </p>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={onEntrar} className="btn-acao text-base" data-entrar>
            {continua ? "Continuar de onde parou" : "Entrar na praça"}
          </button>
          {continua && (
            <button type="button" onClick={onRecomecar} className="btn-palco text-base" data-recomecar>
              Começar de novo
            </button>
          )}
        </div>
        <p className="text-sm text-stage-ink-soft">
          No computador: setas ou W A S D para andar, E para agir, Esc para fechar. No celular: o joystick no canto da tela. Sem a cena 3D, os lugares aparecem em lista, com o mesmo conteúdo.
        </p>
        <fieldset className="space-y-2 border-t border-stage-line pt-4 text-sm" data-preferencias-da-entrada>
          <legend className="eyebrow pb-2 text-highlight">Desenho</legend>
          <label className="flex min-h-11 items-center gap-2">
            <input type="checkbox" checked={preferencias.modoLeve} onChange={(evento) => onPreferencias({ ...preferencias, modoLeve: evento.target.checked })} data-modo-leve />
            Modo leve: sem sombras e sem as luzes dos postes, para aparelho mais fraco.
          </label>
          <label className="flex min-h-11 items-center gap-2">
            <input type="checkbox" checked={preferencias.lista} onChange={(evento) => onPreferencias({ ...preferencias, lista: evento.target.checked })} data-entrar-em-lista />
            Sem a cena 3D: os lugares em lista, com o mesmo conteúdo e as mesmas pautas.
          </label>
        </fieldset>
        <details className="rounded-md border border-stage-line bg-stage-raised p-4 text-sm text-stage-ink-soft">
          <summary className="cursor-pointer py-1 font-medium text-stage-ink">O que é ficção e o que é documento</summary>
          <p className="mt-2">
            A praça, a Zefa, o Teodoro, o Escrivão, a Lourdes, o bilhete e os moradores que perguntam são inventados. Os documentos das gavetas são os registros publicados neste atlas: votos, atos e atuações, com data,
            instituição, cargo, objeto, ação e fontes. Cada pergunta do mural só pergunta o que um documento responde. O jogo não dá nota, não soma pontos, não tem ranking e não recomenda voto.
          </p>
        </details>
      </div>
    </div>
  );
}
