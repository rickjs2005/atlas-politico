// O modo às cegas da Cidade do Voto (docs/MUNDO.md). Em cada prédio, os dois
// programas aparecem como "Programa A" e "Programa B", sem nome. O lado de
// cada um é sorteado por visita e por tema, para a posição não entregar quem é
// quem nem favorecer ninguém. A pessoa marca o que combina mais com ela, ou
// "nenhum dos dois", e só no fim vê de quem era cada programa.
//
// O jogo não recomenda voto: o resumo diz só o que a própria pessoa escolheu,
// tema por tema, com o aviso de que três frases por área não são o programa
// inteiro. Funções puras.

import type { Tema } from "@/lib/domain/decisions";

import type { WorldTheme } from "./content";

export type Side = "A" | "B";

/** O que a pessoa escolheu em um tema: um dos lados, ou nenhum dos dois. */
export type Choice = Side | "nenhum";

/** Por tema, o `slug` de quem está em cada lado. */
export type SideMap = Partial<Record<Tema, Record<Side, string>>>;

/** Um gerador pseudoaleatório pequeno e determinístico (mulberry32): a mesma semente dá os mesmos lados. */
export function seededRandom(seed: number): () => number {
  let estado = seed >>> 0;
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Sorteia os lados de cada tema com a semente dada. Cada tema é sorteado à
 * parte: a mesma pessoa pode ser A em um prédio e B no outro. Tema que não tem
 * exatamente dois programas fica fora do mapa.
 */
export function assignSides(temas: readonly WorldTheme[], seed: number): SideMap {
  const sorteio = seededRandom(seed);
  const mapa: SideMap = {};
  for (const tema of temas) {
    if (tema.programas.length !== 2) continue;
    const [primeiro, segundo] = tema.programas as [WorldTheme["programas"][number], WorldTheme["programas"][number]];
    mapa[tema.tema] = sorteio() < 0.5 ? { A: primeiro.slug, B: segundo.slug } : { A: segundo.slug, B: primeiro.slug };
  }
  return mapa;
}

/** O programa que está em um lado do tema, ou `undefined` se o tema não tem lados. */
export function programOnSide(tema: WorldTheme, lados: SideMap, lado: Side) {
  const slug = lados[tema.tema]?.[lado];
  return tema.programas.find((programa) => programa.slug === slug);
}

export interface RevealRow {
  tema: Tema;
  rotulo: string;
  escolha: Choice | null;
  /** O nome de quem estava no lado escolhido; `null` para "nenhum" ou tema não visitado. */
  nome: string | null;
}

export interface Reveal {
  linhas: RevealRow[];
  /** Quantos temas cada pessoa teve escolhidos, por nome, na ordem dos programas. Inclui quem teve zero. */
  contagem: { nome: string; temas: number }[];
  nenhum: number;
  naoVisitados: number;
}

/** O resumo do fim: o que a pessoa escolheu em cada tema, agora com os nomes. Não soma pesos, não ordena por vencedor. */
export function reveal(temas: readonly WorldTheme[], lados: SideMap, escolhas: Partial<Record<Tema, Choice>>): Reveal {
  const nomes = temas[0]?.programas.map((programa) => programa.nome) ?? [];
  const contagem = new Map(nomes.map((nome) => [nome, 0]));
  let nenhum = 0;
  let naoVisitados = 0;
  const linhas = temas.map((tema): RevealRow => {
    const escolha = escolhas[tema.tema] ?? null;
    if (escolha === null) naoVisitados += 1;
    if (escolha === "nenhum") nenhum += 1;
    const programa = escolha === "A" || escolha === "B" ? programOnSide(tema, lados, escolha) : undefined;
    if (programa !== undefined) contagem.set(programa.nome, (contagem.get(programa.nome) ?? 0) + 1);
    return { tema: tema.tema, rotulo: tema.rotulo, escolha, nome: programa?.nome ?? null };
  });
  return { linhas, contagem: [...contagem].map(([nome, n]) => ({ nome, temas: n })), nenhum, naoVisitados };
}
