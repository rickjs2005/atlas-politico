// Perfis previstos para a primeira edição. Definem quais rotas de perfil
// existem; o conteúdo de cada perfil vem só dos dados gerados.
//
// A ordem é alfabética pelo nome exibido, e vale em toda a interface: menu,
// entrada e comparação. É a mesma regra dos textos (docs/EDITORIAL.md) e não
// depende de cargo, partido nem de quantos registros cada pessoa tem
// (docs/DECISIONS.md, D-38).

export const PROFILES = [
  { slug: "flavio-bolsonaro", nome: "Flávio Bolsonaro" },
  { slug: "lula", nome: "Lula" },
] as const;

export type ProfileSlug = (typeof PROFILES)[number]["slug"];

export function findProfile(slug: string) {
  return PROFILES.find((perfil) => perfil.slug === slug);
}
