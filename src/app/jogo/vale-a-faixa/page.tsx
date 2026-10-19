import type { Metadata } from "next";

import { ValeAFaixa } from "@/features/faixa/ValeAFaixa";

export const metadata: Metadata = {
  title: "Vale a Faixa",
  description:
    "Sátira interativa: uma luta de escadas entre Lula e Flávio Bolsonaro em caricatura, com a faixa presidencial pendurada sobre o ringue. Ficção sobre uma situação absurda, sem fatos, acusações ou recomendação de voto.",
};

// A página é estática e leve: o motor, o desenho e o som do jogo chegam por
// `import()` quando a pessoa escolhe o personagem (src/features/faixa).
export default function ValeAFaixaPage() {
  return <ValeAFaixa />;
}
