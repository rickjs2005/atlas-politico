// As falas do Escrivão em uma tela do jogo, com a camada de cada uma à vista:
// a instrução, o que vem do registro e, quando ligado, o humor, marcado como
// ficção. É texto comum, anunciado como estado para quem ouve a página.

import { CAMADA_LABELS, ESCRIVAO_NOME, type FalaDita } from "@/lib/game/escrivao";

export function EscrivaoSays({ falas, evento, className = "" }: { falas: readonly FalaDita[]; evento: string; className?: string }) {
  if (falas.length === 0) return null;
  return (
    <section aria-label={`${ESCRIVAO_NOME}, personagem fictício`} className={`space-y-1.5 border-l-2 border-ink-faint pl-3 ${className}`} data-escrivao={evento} role="status">
      <p className="eyebrow text-ink-soft">{ESCRIVAO_NOME} · personagem fictício</p>
      {falas.map((fala) => (
        <p key={fala.id} className={`text-sm ${fala.camada === "humor" ? "italic text-ink-soft" : fala.camada === "documental" ? "text-ink" : "font-medium"}`} data-fala={fala.id} data-camada={fala.camada}>
          <span className="sr-only">{CAMADA_LABELS[fala.camada]}: </span>
          {fala.texto}
        </p>
      ))}
    </section>
  );
}
