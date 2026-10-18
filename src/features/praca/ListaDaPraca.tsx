"use client";

// Sem a cena (sem WebGL, ou por escolha): os lugares da praça como lista, com
// o mesmo conteúdo e as mesmas janelas. Nada do jogo depende da cena.

import type { lugaresDeAgora } from "@/lib/praca/regras";
import type { LugarId } from "@/lib/praca/tipos";

import type { PontoId } from "./scene";

export function ListaDaPraca({ lugares, bilheteNoChao, motivo, onAbrir }: { lugares: ReturnType<typeof lugaresDeAgora>; bilheteNoChao: boolean; motivo: "sem-webgl" | "escolha"; onAbrir: (id: PontoId) => void }) {
  return (
    <div className="page space-y-4 overflow-y-auto py-28">
      <p className="text-stage-ink-soft">{motivo === "sem-webgl" ? "Este navegador não mostrou a cena 3D. Os lugares da praça estão aqui como lista, com o mesmo conteúdo." : "Os lugares da praça em lista, como você pediu, com o mesmo conteúdo. A cena 3D volta pelo caderno."}</p>
      <ul className="grid gap-2 sm:grid-cols-2" data-lista-da-praca>
        {lugares.map((lugar) => (
          <li key={lugar.id}>
            <button type="button" onClick={() => onAbrir(lugar.id as LugarId)} className="folha w-full rounded-md border border-line-strong px-4 py-3 text-left" data-lugar={lugar.id}>
              <span className="block font-medium">
                {lugar.nome}
                {lugar.trancado ? " · fechada" : ""}
              </span>
              <span className="block text-sm text-ink-soft">{lugar.funcao}</span>
            </button>
          </li>
        ))}
        {bilheteNoChao && (
          <li>
            <button type="button" onClick={() => onAbrir("bilhete")} className="folha w-full rounded-md border border-dashed border-line-strong px-4 py-3 text-left" data-lugar="bilhete">
              <span className="block font-medium">Um papel no chão, perto do coreto</span>
              <span className="block text-sm text-ink-soft">Olhar o que é.</span>
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}
