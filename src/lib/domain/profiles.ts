// Perfis previstos para a primeira edição. Definem quais rotas de perfil
// existem; o conteúdo de cada perfil vem só do conjunto publicado. A ordem é a
// do plano de desenvolvimento.

export const PROFILES = [
  { slug: "lula", nome: "Lula" },
  { slug: "flavio-bolsonaro", nome: "Flávio Bolsonaro" },
] as const;

export type ProfileSlug = (typeof PROFILES)[number]["slug"];

export function findProfile(slug: string) {
  return PROFILES.find((perfil) => perfil.slug === slug);
}
