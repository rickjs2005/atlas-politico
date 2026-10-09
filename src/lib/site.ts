// O que a publicação do atlas ainda precisa definir. É decisão do responsável
// pelo projeto (docs/PAGES.md, seção Configuração pendente). Este arquivo é o
// único lugar em que ela entra: enquanto o valor é `null`, a interface diz que
// o canal está pendente, em vez de inventar um.
//
// O domínio público não é configurado aqui. Os links copiados usam o endereço
// em que a página está aberta, que na publicação já é o domínio do atlas. O
// endereço canônico e o sitemap entram na fase de publicação (fase 10).

export interface CorrectionChannel {
  /** Como o canal aparece na página, por exemplo um endereço de e-mail. */
  rotulo: string;
  /** Para onde o link leva: `mailto:`, formulário ou página. */
  href: string;
}

export const SITE: {
  /** Canal público para receber sugestões de correção. */
  correctionChannel: CorrectionChannel | null;
} = {
  correctionChannel: null,
};
