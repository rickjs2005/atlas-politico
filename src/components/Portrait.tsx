"use client";

// Retrato de um perfil, sempre na mesma moldura e com o mesmo tratamento: tons
// de cinza sobre o papel. As duas fotos oficiais têm cores e fundos bem
// diferentes; em cinza elas ocupam a página com o mesmo peso.
//
// Sem arquivo de imagem, a moldura recebe as iniciais do nome, na mesma área.
//
// A página não pede o arquivo original: pede uma versão já recortada na
// proporção da moldura, na largura que a tela precisa (src/lib/media/portraits.ts).
// O enquadramento é o mesmo para os dois perfis: olhos na mesma altura e rosto
// do mesmo tamanho.
//
// Componente de cliente de propósito. Renderizada em um Server Component, uma
// imagem que carrega logo entra como dica de pré-carregamento no conteúdo que
// o roteador busca ao ver um link: toda página com link para a entrada
// baixaria os retratos dos cartões sem mostrá-los. Aqui a dica fica só no HTML
// da própria página.

import Link from "next/link";

import type { Imagem } from "@/lib/domain/types";
import { derivedSources } from "@/lib/media/portraits";

interface PortraitProps {
  nome: string;
  imagem: Imagem | null;
  /** Proporção da moldura. `retrato` é 4:5; `quadrado`, para miniaturas. */
  shape?: "retrato" | "quadrado";
  /** Largura esperada na tela, para o navegador escolher o que carregar. */
  sizes: string;
  /**
   * Quando carregar. `prioritaria`: é a imagem principal da primeira tela.
   * `imediata`: está na primeira tela, mas é pequena. `adiada`: só quando se
   * aproxima da área visível.
   */
  loading?: "prioritaria" | "imediata" | "adiada";
  /** O nome já está escrito ao lado: a imagem não precisa repeti-lo. */
  decorative?: boolean;
  className?: string;
}

function initials(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const letras = partes.length === 1 ? [partes[0]![0]] : [partes[0]![0], partes.at(-1)![0]];
  return letras.join("").toUpperCase();
}

export function Portrait({
  nome,
  imagem,
  shape = "retrato",
  sizes,
  loading = "adiada",
  decorative = false,
  className = "",
}: PortraitProps) {
  const proporcao = shape === "retrato" ? "aspect-[4/5]" : "aspect-square";
  const fontes = imagem === null ? null : derivedSources(imagem.id, shape);

  return (
    <div className={`@container relative overflow-hidden bg-sunken ${proporcao} ${className}`}>
      {imagem === null || fontes === null ? (
        // A letra acompanha a largura da moldura, do cartão à miniatura.
        <span
          role={decorative ? undefined : "img"}
          aria-label={decorative ? undefined : `${nome} (sem retrato disponível)`}
          aria-hidden={decorative ? true : undefined}
          className="absolute inset-0 grid place-items-center font-serif text-[40cqw] font-medium leading-none text-ink-faint"
        >
          {initials(nome)}
        </span>
      ) : (
        // As versões já vêm na proporção da moldura, que reserva o espaço:
        // a imagem não desloca nada ao chegar. O `next/image` não se aplica a
        // um site sem servidor de imagens.
        // eslint-disable-next-line @next/next/no-img-element -- versões locais, com srcset próprio
        <img
          src={fontes.src}
          srcSet={fontes.srcSet}
          sizes={sizes}
          width={fontes.width}
          height={fontes.height}
          alt={decorative ? "" : imagem.textoAlternativo}
          loading={loading === "adiada" ? "lazy" : "eager"}
          fetchPriority={loading === "prioritaria" ? "high" : undefined}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover mix-blend-multiply grayscale contrast-[1.06]"
        />
      )}
    </div>
  );
}

interface PortraitCreditProps {
  imagem: Imagem;
  /** Acrescenta a página de origem do arquivo e o caminho para as condições de uso. */
  detail?: boolean;
  className?: string;
}

const creditLink = "underline decoration-line-strong hover:decoration-ink";

/** Linha de crédito de uma imagem, com o tratamento aplicado. */
export function PortraitCredit({ imagem, detail = false, className = "" }: PortraitCreditProps) {
  return (
    <p className={`text-xs text-ink-faint ${className}`} data-credito={imagem.id}>
      {imagem.credito}. Exibida em tons de cinza e recortada.
      {detail && (
        <>
          {" "}
          <a href={imagem.origem} target="_blank" rel="noreferrer" className={creditLink}>
            Origem<span className="sr-only"> da imagem (abre em nova aba)</span>
          </a>
          {" · "}
          <Link href="/metodologia#creditos" prefetch={false} className={creditLink}>
            Condições de uso
          </Link>
        </>
      )}
    </p>
  );
}
