// O que a publicação do atlas ainda precisa definir. É decisão do responsável
// pelo projeto (docs/DEPLOY.md e docs/PAGES.md, seção Configuração pendente).
// Este arquivo é o único lugar em que ela entra: enquanto um valor é `null`
// ou `false`, a interface diz que está pendente, em vez de inventar um.
//
// Mudar qualquer campo exige `npm run build` de novo: os valores entram no
// HTML gerado, no robots.txt e no sitemap.

export interface CorrectionChannel {
  /** Como o canal aparece na página, por exemplo um endereço de e-mail. */
  rotulo: string;
  /** Para onde o link leva: `mailto:`, formulário ou página. */
  href: string;
}

export const SITE: {
  /** Nome do atlas, nos títulos e na prévia de compartilhamento. */
  nome: string;
  /** Descrição curta, nos metadados e na prévia de compartilhamento. */
  descricao: string;
  /**
   * Endereço público, sem barra final (ex.: `https://atlas.exemplo.com.br`).
   * Com ele, as páginas ganham endereço canônico e a prévia de
   * compartilhamento ganha imagem com endereço absoluto. Sem ele, nada disso
   * é gerado.
   */
  publicUrl: string | null;
  /**
   * Liberar a indexação pelos buscadores. Só vale com `publicUrl`. Enquanto
   * `false`, todas as páginas levam `noindex` e o robots.txt bloqueia tudo:
   * a edição ainda não passou pela revisão humana.
   */
  indexar: boolean;
  /** Canal público para receber sugestões de correção. */
  correctionChannel: CorrectionChannel | null;
} = {
  nome: "Atlas Político",
  descricao: "Trajetórias públicas em linha do tempo, mapa, acontecimentos com fontes e um jogo por capítulos.",
  publicUrl: null,
  indexar: false,
  correctionChannel: null,
};

/** As páginas podem ser indexadas: há domínio decidido e a indexação foi liberada. */
export function isIndexable(): boolean {
  return SITE.publicUrl !== null && SITE.indexar;
}

/** O endereço absoluto de um caminho do site, ou `null` enquanto não há domínio. */
export function absoluteUrl(caminho: string): string | null {
  if (SITE.publicUrl === null) return null;
  return `${SITE.publicUrl}${caminho.startsWith("/") ? caminho : `/${caminho}`}`;
}
