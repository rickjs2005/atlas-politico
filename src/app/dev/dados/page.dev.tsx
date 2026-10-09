// A mesma tela de prova, com os dados reais gerados por `npm run data:build`.
// Confirma o caminho inteiro: conteúdo, gerador, leitor, estado, lista, mapa e
// painel. Existe só no servidor de desenvolvimento (extensão `.dev.tsx`).

import type { Metadata } from "next";

import { runValidate } from "@/lib/content/pipeline";
import { getAtlasData } from "@/lib/content/published";
import { resolvePaths } from "@/lib/content/sources";

import { ProofScreen } from "../prova/ProofScreen";

export const metadata: Metadata = { title: "Prova com os dados gerados" };

export default function GeneratedDataProofPage() {
  const data = getAtlasData();
  const { excluidos } = runValidate(resolvePaths()).resultado;

  return (
    <ProofScreen
      data={data}
      draftCount={excluidos.filter((item) => item.entidade === "acontecimento").length}
      variant="real"
    />
  );
}
