// Retrato de um perfil, sempre na mesma moldura e com o mesmo tratamento: tons
// de cinza sobre o papel. As duas fotos oficiais têm cores e fundos bem
// diferentes; em cinza elas ocupam a página com o mesmo peso.
//
// Sem arquivo de imagem, a moldura recebe as iniciais do nome, na mesma área.

import Image from "next/image";
import Link from "next/link";

import type { Imagem } from "@/lib/domain/types";

interface PortraitProps {
  nome: string;
  imagem: Imagem | null;
  /** Proporção da moldura. `retrato` é 4:5; `quadrado`, para miniaturas. */
  shape?: "retrato" | "quadrado";
  /** Largura esperada na tela, para o navegador escolher o que carregar. */
  sizes: string;
  /** A imagem é a principal da tela: carrega antes das outras. */
  priority?: boolean;
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
  priority = false,
  decorative = false,
  className = "",
}: PortraitProps) {
  const proporcao = shape === "retrato" ? "aspect-[4/5]" : "aspect-square";

  return (
    <div className={`@container relative overflow-hidden bg-sunken ${proporcao} ${className}`}>
      {imagem === null ? (
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
        <Image
          src={imagem.arquivo}
          alt={decorative ? "" : imagem.textoAlternativo}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover object-top mix-blend-multiply grayscale contrast-[1.06]"
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
          <Link href="/metodologia#creditos" className={creditLink}>
            Condições de uso
          </Link>
        </>
      )}
    </p>
  );
}
