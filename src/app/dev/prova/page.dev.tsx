// Tela de prova técnica da fase 1. Existe só no servidor de desenvolvimento
// (extensão `.dev.tsx`, ver next.config.ts).
//
// Esta parte roda no servidor: lê as fixtures pelo mesmo leitor do conteúdo
// publicado, valida e entrega ao navegador apenas dados já conferidos.

import path from "node:path";

import type { Metadata } from "next";

import { loadContentSet } from "@/lib/content/load";

import { ProofScreen } from "./ProofScreen";

export const metadata: Metadata = { title: "Prova técnica" };

const FIXTURES_DIR = path.join(process.cwd(), "tests", "fixtures", "sintetico");

export default function ProofPage() {
  const conjunto = loadContentSet(FIXTURES_DIR);
  if (conjunto === null) {
    throw new Error(`Fixtures sintéticas não encontradas em ${FIXTURES_DIR}.`);
  }

  // Mesmo critério das páginas reais: rascunho não chega à interface.
  const revisados = conjunto.acontecimentos.filter(
    (acontecimento) => acontecimento.editorial.estado === "revisado",
  );

  return (
    <ProofScreen
      data={{
        pessoas: conjunto.pessoas,
        acontecimentos: revisados,
        lugares: conjunto.lugares,
        fontes: conjunto.fontes,
      }}
      draftCount={conjunto.acontecimentos.length - revisados.length}
    />
  );
}
