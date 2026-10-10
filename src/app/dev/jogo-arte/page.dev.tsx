// Galeria da arte do jogo. Existe só no servidor de desenvolvimento
// (extensão `.dev.tsx`, ver next.config.ts): `http://localhost:3000/dev/jogo-arte/`.

import type { Metadata } from "next";

import { ArtGallery } from "./ArtGallery";

export const metadata: Metadata = { title: "Arte do jogo" };

export default function GameArtPage() {
  return (
    <div className="page space-y-6 py-8">
      <header className="space-y-2">
        <p className="eyebrow text-ink-soft">Desenvolvimento</p>
        <h1 className="font-serif text-4xl font-medium tracking-tight">Arte do jogo</h1>
        <p className="max-w-2xl text-ink-soft">
          Cada peça desenhada por código, nas condições em que aparece no jogo. Os canvases animados mostram
          o repouso e a caminhada; os parados, as fases do passo.
        </p>
      </header>
      <ArtGallery />
    </div>
  );
}
