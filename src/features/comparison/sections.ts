// As três partes da comparação (D-155): a trajetória (linha do tempo, cargos,
// partidos e acontecimentos, que seguem o recorte do endereço), as decisões
// documentadas por tema e as propostas registradas no TSE por área (as duas
// sem recorte de anos: a amostra inteira da edição). A parte aberta vem do
// fragmento do endereço, que já era o contrato das âncoras: `#decisoes`,
// `#tema-economia`, `#propostas-saude` e os demais continuam valendo, e
// escolhem a parte certa. Módulo puro.

export type ComparisonSection = "trajetoria" | "decisoes" | "propostas";

export const COMPARISON_SECTIONS: readonly { id: ComparisonSection; rotulo: string; descricao: string }[] = [
  { id: "trajetoria", rotulo: "Trajetória", descricao: "linha do tempo, cargos, partidos e acontecimentos, no período escolhido" },
  { id: "decisoes", rotulo: "Decisões", descricao: "votos, atos e atuação legislativa documentados, por tema" },
  { id: "propostas", rotulo: "Propostas", descricao: "o que cada documento registrado no TSE propõe, por área" },
];

/** A parte da comparação que um fragmento do endereço pede. Sem fragmento, ou com um da trajetória, é a trajetória. */
export function sectionOfHash(hash: string): ComparisonSection {
  const alvo = hash.replace(/^#/, "");
  if (alvo === "decisoes" || alvo.startsWith("tema-")) return "decisoes";
  if (alvo === "propostas" || alvo.startsWith("propostas-")) return "propostas";
  return "trajetoria";
}

/** O que o recorte do endereço (período e categorias) alcança em cada parte, dito em uma linha. */
export function filterScope(secao: ComparisonSection): string {
  return secao === "trajetoria"
    ? "O período e as categorias valem para a linha do tempo e para as colunas desta parte."
    : "O período e as categorias não se aplicam a esta parte: ela mostra a amostra inteira da edição. Eles continuam guardados no endereço para a trajetória.";
}
