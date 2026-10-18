"use client";

// As abas da comparação (D-155): links para as âncoras de cada parte, para o
// endereço continuar sendo a fonte do estado (voltar e avançar funcionam, e um
// link copiado abre na parte certa). Sem JavaScript, as três partes ficam na
// página, uma abaixo da outra, e os links só rolam.

import { useEffect, useState } from "react";

import { COMPARISON_SECTIONS, sectionOfHash, type ComparisonSection } from "./sections";

/** A parte aberta, lida do fragmento do endereço depois da hidratação; `null` antes dela (todas à vista). */
export function useComparisonSection(): ComparisonSection | null {
  const [secao, setSecao] = useState<ComparisonSection | null>(null);
  useEffect(() => {
    const aplicar = () => setSecao(sectionOfHash(window.location.hash));
    aplicar();
    window.addEventListener("hashchange", aplicar);
    return () => window.removeEventListener("hashchange", aplicar);
  }, []);
  // Quando a parte muda, a âncora pedida estava escondida enquanto o navegador tentava rolar até ela: rola agora.
  useEffect(() => {
    if (secao === null) return;
    const alvo = window.location.hash.slice(1);
    if (alvo === "") return;
    const elemento = document.getElementById(alvo);
    if (elemento !== null) elemento.scrollIntoView({ block: "start" });
  }, [secao]);
  return secao;
}

export function SectionTabs({ secao, haPropostas }: { secao: ComparisonSection | null; haPropostas: boolean }) {
  const abas = COMPARISON_SECTIONS.filter((aba) => aba.id !== "propostas" || haPropostas);
  return (
    <nav aria-label="O que comparar" data-abas-da-comparacao>
      <ul className="flex flex-wrap gap-1.5">
        {abas.map((aba) => {
          const ativa = secao === aba.id || (secao === null && aba.id === "trajetoria");
          return (
            <li key={aba.id}>
              <a
                href={`#${aba.id}`}
                aria-current={ativa ? "true" : undefined}
                data-aba={aba.id}
                title={aba.descricao}
                className={`inline-flex min-h-11 items-center border px-3 text-sm font-medium no-underline xl:min-h-9 ${ativa ? "border-ink bg-ink text-paper" : "border-line-strong bg-raised text-ink hover:border-ink"}`}
              >
                {aba.rotulo}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
