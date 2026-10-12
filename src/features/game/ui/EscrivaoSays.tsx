"use client";

// As falas do Escrivão em uma tela do jogo, com a camada de cada uma à vista:
// a instrução e, quando ligado, uma fala de humor, marcada como ficção. A
// preferência de humor é aplicada aqui, na exibição, lida do mesmo
// armazenamento que o botão de desligar escreve: desligar tira o humor de
// toda fala já escolhida, na hora, em todas as telas (D-127). Só a instrução
// é anunciada como estado para quem ouve a página; o humor fica como texto
// comum, para o leitor de tela não repetir tudo a cada atualização. Quem já
// anuncia o mesmo momento por outra linha (o carimbo, na fase) pede a
// instrução como texto comum, com `anunciar={false}`.

import { CAMADA_LABELS, ESCRIVAO_NOME, falasVisiveis, type FalaDita } from "@/lib/game/escrivao";

import { useGamePreferences } from "../hooks";

export function EscrivaoSays({ falas, evento, anunciar = true, className = "" }: { falas: readonly FalaDita[]; evento: string; anunciar?: boolean; className?: string }) {
  const { preferencias } = useGamePreferences();
  const visiveis = falasVisiveis(falas, preferencias.humor);
  if (visiveis.length === 0) return null;
  return (
    <section aria-label={`${ESCRIVAO_NOME}, personagem fictício`} className={`space-y-1.5 border-l-2 border-ink-faint pl-3 ${className}`} data-escrivao={evento}>
      <p className="eyebrow text-ink-soft">{ESCRIVAO_NOME} · personagem fictício</p>
      {visiveis.map((fala) => (
        <p
          key={fala.id}
          className={`text-sm ${fala.camada === "humor" ? "italic text-ink-soft" : "font-medium"}`}
          role={anunciar && fala.camada === "instrucao" ? "status" : undefined}
          data-fala={fala.id}
          data-camada={fala.camada}
        >
          <span className="sr-only">{CAMADA_LABELS[fala.camada]}: </span>
          {fala.texto}
        </p>
      ))}
    </section>
  );
}
