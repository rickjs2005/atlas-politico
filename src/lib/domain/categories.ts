// Categorias iniciais de acontecimento (plano, seção 4). O identificador vai
// no conteúdo e nos parâmetros de URL; o rótulo é o texto de interface.

export const CATEGORIAS = [
  "mandatos-e-funcoes",
  "eleicoes",
  "partidos-e-aliancas",
  "atuacao-institucional",
  "marcos-historicos",
] as const;

export type Categoria = (typeof CATEGORIAS)[number];

export const CATEGORY_LABELS: Record<Categoria, string> = {
  "mandatos-e-funcoes": "Mandatos e funções",
  eleicoes: "Eleições",
  "partidos-e-aliancas": "Partidos e alianças",
  "atuacao-institucional": "Atuação institucional",
  "marcos-historicos": "Marcos históricos",
};

export function isCategoria(valor: string): valor is Categoria {
  return (CATEGORIAS as readonly string[]).includes(valor);
}
