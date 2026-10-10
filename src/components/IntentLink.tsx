"use client";

// Link que só deixa o roteador adiantar o destino quando a pessoa dá sinal de
// que vai para lá: o ponteiro, o dedo ou o foco no link.
//
// Por padrão, o Next baixa a página inteira de cada link que aparece na tela.
// Para os dois cartões da entrada isso vale a pena. Para o menu, que está em
// todas as páginas, significaria baixar e processar quatro páginas a cada
// visita, mesmo de quem só veio ler um acontecimento. Com o sinal de intenção,
// a navegação continua sem espera para quem usa o menu, e quem não usa não
// paga por ele (docs/PERFORMANCE.md, seção Navegação).
//
// É o padrão que a documentação do Next descreve como "hover-triggered
// prefetch", com o toque e o foco somados ao ponteiro.

import Link from "next/link";
import { useState, type ComponentProps } from "react";

type IntentLinkProps = Omit<ComponentProps<typeof Link>, "prefetch">;

export function IntentLink({ onPointerEnter, onFocus, onTouchStart, ...props }: IntentLinkProps) {
  const [intent, setIntent] = useState(false);

  return (
    <Link
      {...props}
      // `null` devolve o comportamento padrão: o destino é pré-carregado na hora.
      prefetch={intent ? null : false}
      onPointerEnter={(evento) => {
        setIntent(true);
        onPointerEnter?.(evento);
      }}
      onFocus={(evento) => {
        setIntent(true);
        onFocus?.(evento);
      }}
      onTouchStart={(evento) => {
        setIntent(true);
        onTouchStart?.(evento);
      }}
    />
  );
}
