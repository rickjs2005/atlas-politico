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

/**
 * O que a pessoa escolheu em um tema: um dos lados, nenhum dos dois, partes
 * dos dois, ou que ainda não sabe. As três últimas não entram na contagem de
 * nenhum lado: cada uma é contada à parte, e a revelação as escreve como são.
 */
export type Choice = Side | "nenhum" | "partes" | "nao-sei";

export const CHOICES: readonly Choice[] = ["A", "B", "nenhum", "partes", "nao-sei"];

/** Como cada escolha se escreve, no botão e na revelação. */
export const CHOICE_LABELS: Record<Choice, string> = {
  A: "Programa A",
  B: "Programa B",
  nenhum: "Nenhum dos dois",
  partes: "Concordo com partes dos dois",
  "nao-sei": "Ainda não sei",
};

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
  /** Temas em que a pessoa marcou "concordo com partes dos dois": não contam para ninguém. */
  partes: number;
  /** Temas em que a pessoa marcou "ainda não sei": não contam para ninguém. */
  naoSei: number;
  naoVisitados: number;
}

/** O resumo do fim: o que a pessoa escolheu em cada tema, agora com os nomes. Não soma pesos, não ordena por vencedor. */
export function reveal(temas: readonly WorldTheme[], lados: SideMap, escolhas: Partial<Record<Tema, Choice>>): Reveal {
  const nomes = temas[0]?.programas.map((programa) => programa.nome) ?? [];
  const contagem = new Map(nomes.map((nome) => [nome, 0]));
  let nenhum = 0;
  let partes = 0;
  let naoSei = 0;
  let naoVisitados = 0;
  const linhas = temas.map((tema): RevealRow => {
    const escolha = escolhas[tema.tema] ?? null;
    if (escolha === null) naoVisitados += 1;
    if (escolha === "nenhum") nenhum += 1;
    if (escolha === "partes") partes += 1;
    if (escolha === "nao-sei") naoSei += 1;
    const programa = escolha === "A" || escolha === "B" ? programOnSide(tema, lados, escolha) : undefined;
    if (programa !== undefined) contagem.set(programa.nome, (contagem.get(programa.nome) ?? 0) + 1);
    return { tema: tema.tema, rotulo: tema.rotulo, escolha, nome: programa?.nome ?? null };
  });
  return { linhas, contagem: [...contagem].map(([nome, n]) => ({ nome, temas: n })), nenhum, partes, naoSei, naoVisitados };
}

/** Como uma linha da revelação se escreve: o nome de quem estava no lado escolhido, ou a escolha que não aponta lado. */
export function rowLabel(linha: RevealRow): string {
  if (linha.escolha === null) return "não visitado";
  if (linha.escolha === "A" || linha.escolha === "B") return `${CHOICE_LABELS[linha.escolha]}: ${linha.nome ?? ""}`;
  return CHOICE_LABELS[linha.escolha].toLowerCase();
}

/** A frase do resumo: o que a pessoa marcou, tema por tema, sem somar nem ordenar. */
export function revealSentence(resumo: Reveal): string {
  const partes: string[] = resumo.contagem.map((linha) => `${linha.temas} ${linha.temas === 1 ? "tema" : "temas"} com o programa de ${linha.nome}`);
  if (resumo.nenhum > 0) partes.push(`${resumo.nenhum} sem nenhum dos dois`);
  if (resumo.partes > 0) partes.push(`${resumo.partes} com partes dos dois`);
  if (resumo.naoSei > 0) partes.push(`${resumo.naoSei} ainda sem decidir`);
  const lista = partes.length <= 1 ? (partes[0] ?? "") : `${partes.slice(0, -1).join(", ")} e ${partes.at(-1)}`;
  const faltam = resumo.naoVisitados > 0 ? ` Faltam ${resumo.naoVisitados} ${resumo.naoVisitados === 1 ? "prédio" : "prédios"}.` : "";
  return `Você marcou ${lista}.${faltam}`;
}
