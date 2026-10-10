"use client";

// Fronteira de erro do que o jogo carrega à parte (o palco e a prévia do
// mundo). Se o pacote não chega, por queda de rede ou por uma publicação nova
// com a página já aberta, o resto da tela continua funcionando: aparece o
// substituto, e não a página de erro do site.

import { Component, type ReactNode } from "react";

interface StageBoundaryProps {
  /** O que aparece no lugar, quando o conteúdo falha. */
  fallback: ReactNode;
  children: ReactNode;
}

export class StageBoundary extends Component<StageBoundaryProps, { failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
