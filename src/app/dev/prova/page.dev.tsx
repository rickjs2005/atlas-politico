// Tela de prova técnica com dados sintéticos. Existe só no servidor de
// desenvolvimento (extensão `.dev.tsx`, ver next.config.ts).
//
// Esta parte roda no servidor: passa as fixtures pelo mesmo pipeline que gera
// os dados públicos, em memória, e entrega ao navegador conjunto, índices e
// pontos já conferidos. Nada é gravado em `generated/`.

import path from "node:path";

import type { Metadata } from "next";

import { InvalidContentError } from "@/lib/content/pipeline";
import { readSources, resolvePaths } from "@/lib/content/sources";
import { buildAtlasData } from "@/lib/publication/build";

import { ProofScreen } from "./ProofScreen";

export const metadata: Metadata = { title: "Prova técnica" };

const FIXTURES_DIR = path.join(process.cwd(), "tests", "fixtures", "sintetico");

export default function ProofPage() {
  // As fixtures são uma pasta só, com revisados e um rascunho. Não há pasta de
  // rascunhos: o caminho abaixo não existe, e o leitor a trata como vazia.
  const paths = resolvePaths(process.cwd(), {
    publishedDir: FIXTURES_DIR,
    draftsDir: path.join(FIXTURES_DIR, "drafts"),
  });
  // Única chamada do projeto que aceita o prefixo `sintetico-`.
  const resultado = buildAtlasData(readSources(paths), { allowSynthetic: true });
  if (resultado.data === null) throw new InvalidContentError(resultado.diagnostics);

  return (
    <ProofScreen
      data={resultado.data}
      // Mesmo critério das páginas reais: rascunho não chega à interface.
      draftCount={resultado.excluidos.filter((item) => item.entidade === "acontecimento").length}
      variant="sintetico"
    />
  );
}
