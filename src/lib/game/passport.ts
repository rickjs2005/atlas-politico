// O Passaporte do Escrivão (docs/GAMEPLAY.md, D-150): a caderneta de carimbos
// do jogo. Uma fase concluída é um carimbo, com o título dela, e três selos
// reconhecem o caminho percorrido.
//
// Tudo aqui é derivado do progresso que o jogo já guarda
// (src/lib/game/progress.ts): não há dado novo no armazenamento nem segunda
// fonte de verdade. Abrir uma fase não dá carimbo; concluir, sim, e uma vez
// só, porque o carimbo é a própria conclusão. O carimbo é o mesmo para quem
// respondeu certo e para quem leu a explicação: reconhece o percurso, e não dá
// nota. As regras são as mesmas para as duas pessoas. Funções puras.

import { DEFAULT_ROOM } from "./rooms";
import { isPhaseDone } from "./trail";
import type { PersonagemSlug, PhaseProgress, PhaseSpec, PlayerProgress, RoomId } from "./types";

/** O que o passaporte precisa saber de uma fase: o bastante para escrever o carimbo e levar até ela. */
export interface PassportPhase {
  id: string;
  sala: RoomId;
  /** Posição na sala, a partir de 1. */
  numero: number;
  titulo: string;
  periodo: { de: number; ate: number };
}

/** A página de uma pessoa na caderneta: todas as fases dela, de todas as salas, na ordem das salas. */
export interface PassportPage {
  personagem: PersonagemSlug;
  nome: string;
  fases: readonly PassportPhase[];
}

/** O progresso de cada personagem, como o jogo o guarda. Quem nunca jogou com um deles não tem entrada. */
export type ProgressByCharacter = Readonly<Partial<Record<PersonagemSlug, PlayerProgress>>>;

// ---------------------------------------------------------------------------
// Carimbos
// ---------------------------------------------------------------------------

/** Um espaço da caderneta: a fase, se tem carimbo, e o que o progresso guarda dela. */
export interface StampSlot {
  fase: PassportPhase;
  carimbada: boolean;
  estado: PhaseProgress | undefined;
}

/** Os espaços das fases dadas, na ordem. O carimbo é a conclusão registrada, e nada mais. */
export function stampSlots(fases: readonly PassportPhase[], progresso: PlayerProgress | undefined): StampSlot[] {
  return fases.map((fase) => {
    const estado = progresso?.fases[fase.id];
    return { fase, carimbada: isPhaseDone(estado), estado };
  });
}

export interface StampCount {
  total: number;
  carimbadas: number;
  faltam: number;
}

/** Quantas das fases dadas têm carimbo, e quantas faltam. O total vem das fases publicadas. */
export function countStamps(fases: readonly Pick<PassportPhase, "id">[], progresso: PlayerProgress | undefined): StampCount {
  const carimbadas = fases.filter((fase) => isPhaseDone(progresso?.fases[fase.id])).length;
  return { total: fases.length, carimbadas, faltam: fases.length - carimbadas };
}

/** A contagem em uma linha: concluir e estar em uma fase são coisas diferentes, e a linha fala só do que foi concluído. */
export function countLabel({ total, carimbadas, faltam }: StampCount): string {
  return `Concluídas: ${carimbadas} de ${total} · ${faltam === 1 ? "falta 1" : `faltam ${faltam}`}`;
}

/** A mesma contagem para quem ouve a página: com vírgula no lugar do ponto mediano, que um leitor de tela pode ler pelo nome. */
export function countSpoken(contagem: StampCount): string {
  return countLabel(contagem).replace(" · ", ", ");
}

/** As fases de uma sala, entre as da página. */
export function pagePhases(pagina: PassportPage, sala: RoomId): PassportPhase[] {
  return pagina.fases.filter((fase) => fase.sala === sala);
}

/** Um aprofundamento de uma página: a sala e os anos que as fases dela cobrem. */
export interface DeepDive {
  personagem: PersonagemSlug;
  nome: string;
  sala: RoomId;
  periodo: { de: number; ate: number };
}

/** Os aprofundamentos das páginas dadas, na ordem das páginas e das salas: é o que a tela oferece a quem percorreu as trajetórias. */
export function deepDivesOf(paginas: readonly PassportPage[]): DeepDive[] {
  return paginas.flatMap((pagina) => {
    const salas = [...new Set(pagina.fases.map((fase) => fase.sala))].filter((sala) => sala !== DEFAULT_ROOM);
    return salas.map((sala) => {
      const fases = pagePhases(pagina, sala);
      return { personagem: pagina.personagem, nome: pagina.nome, sala, periodo: { de: Math.min(...fases.map((fase) => fase.periodo.de)), ate: Math.max(...fases.map((fase) => fase.periodo.ate)) } };
    });
  });
}

/** A trajetória da página está percorrida: todas as fases dela têm carimbo. Página sem trajetória não está. */
export function isTrailStamped(pagina: PassportPage, progresso: PlayerProgress | undefined): boolean {
  const { total, faltam } = countStamps(pagePhases(pagina, DEFAULT_ROOM), progresso);
  return total > 0 && faltam === 0;
}

// ---------------------------------------------------------------------------
// A sequência de marcadores da sala aberta
// ---------------------------------------------------------------------------

/** Um marcador da sequência: a fase tem carimbo, e é a que está aberta agora. As duas coisas não se confundem. */
export interface TrailMarker {
  id: string;
  numero: number;
  carimbada: boolean;
  aberta: boolean;
}

export function trailMarkers(fases: readonly Pick<PassportPhase, "id" | "numero">[], progresso: PlayerProgress | undefined, abertaId: string): TrailMarker[] {
  return fases.map((fase) => ({ id: fase.id, numero: fase.numero, carimbada: isPhaseDone(progresso?.fases[fase.id]), aberta: fase.id === abertaId }));
}

// ---------------------------------------------------------------------------
// Selos
// ---------------------------------------------------------------------------

export type SealId = "primeiros-passos" | "trajetoria-percorrida" | "duas-trajetorias";

/** Quantos carimbos pede o primeiro selo. */
export const PRIMEIROS_PASSOS = 3;

export interface Seal {
  id: SealId;
  nome: string;
  /** O que o selo pede, em uma frase. */
  regra: string;
  obtido: boolean;
}

/**
 * Os selos da caderneta, na ordem em que costumam chegar. Saem da contagem dos
 * carimbos de todas as páginas: três fases concluídas, uma trajetória
 * percorrida e todas as trajetórias percorridas. Nenhum depende de acertar.
 */
export function sealsOf(paginas: readonly PassportPage[], progressos: ProgressByCharacter): Seal[] {
  const carimbos = paginas.reduce((soma, pagina) => soma + countStamps(pagina.fases, progressos[pagina.personagem]).carimbadas, 0);
  const percorridas = paginas.filter((pagina) => isTrailStamped(pagina, progressos[pagina.personagem])).length;
  const duas = paginas.length === 2;
  return [
    { id: "primeiros-passos", nome: "Primeiros passos", regra: `${PRIMEIROS_PASSOS} fases concluídas, em qualquer trajetória ou aprofundamento.`, obtido: carimbos >= PRIMEIROS_PASSOS },
    { id: "trajetoria-percorrida", nome: "Trajetória percorrida", regra: "Todas as fases de uma trajetória concluídas.", obtido: percorridas >= 1 },
    {
      id: "duas-trajetorias",
      nome: duas ? "Duas trajetórias" : "Todas as trajetórias",
      regra: duas ? "As duas trajetórias concluídas." : "Todas as trajetórias concluídas.",
      obtido: paginas.length >= 2 && percorridas === paginas.length,
    },
  ];
}

/** Os selos que não havia antes e há depois: é o que a tela anuncia, uma vez, junto do carimbo que os trouxe. */
export function earnedBetween(antes: readonly Seal[], depois: readonly Seal[]): Seal[] {
  return depois.filter((selo) => selo.obtido && antes.find((anterior) => anterior.id === selo.id)?.obtido !== true);
}

// ---------------------------------------------------------------------------
// O que a tela diz quando um carimbo entra
// ---------------------------------------------------------------------------

/**
 * A confirmação curta de um carimbo novo. Fala do caminho, e não da resposta:
 * é a mesma para quem acertou e para quem leu a explicação. Em fase de
 * contexto sensível (D-129), é uma linha sóbria sobre o progresso.
 */
export function stampConfirmation(natureza: "trajetoria" | "aprofundamento" | "investigacao", contagem: StampCount, sensivel: boolean): string {
  const { carimbadas, total, faltam } = contagem;
  if (sensivel) return `Fase registrada no seu passaporte. Concluídas: ${carimbadas} de ${total}.`;
  if (faltam === 0) {
    if (natureza === "trajetoria") return "Trajetória percorrida: todos os marcos registrados.";
    return natureza === "investigacao" ? "Missão concluída: dossiê registrado." : "Aprofundamento percorrido: marco registrado.";
  }
  if (carimbadas === 1) return "Primeiro marco registrado.";
  return `Marco registrado: ${carimbadas} de ${total}.`;
}

/**
 * A vez da fala do Escrivão para um carimbo que acabou de entrar: a ordem dele
 * entre os carimbos da pessoa, em todas as salas, a partir de zero. Contar na
 * sala aberta faria todo aprofundamento de uma fase só repetir a primeira
 * fala, e daria a fala do primeiro carimbo a quem já tem outros.
 */
export function stampTurn(fasesDaPessoa: readonly Pick<PassportPhase, "id">[], depois: PlayerProgress | undefined): number {
  return Math.max(0, countStamps(fasesDaPessoa, depois).carimbadas - 1);
}

/**
 * O que quem ouve a página recebe quando um carimbo entra: a fase, a
 * confirmação e os selos que vieram com ele, em uma linha só. A tela a escreve
 * uma vez, em uma região de aviso que já existia vazia.
 */
export function stampAnnouncement(titulo: string, confirmacao: string, selos: readonly Pick<Seal, "nome">[]): string {
  return [`Carimbo no passaporte: ${titulo}.`, confirmacao, ...selos.map((selo) => `Selo novo no passaporte: ${selo.nome}.`)].join(" ");
}

/**
 * A frase que apresenta a fase seguinte. É o objetivo dela, como o conteúdo
 * publicado o escreve (`FaseDoJogo.objetivo`, que começa por um verbo no
 * infinitivo): nada é inventado aqui, e um teste confere, sobre o conteúdo
 * publicado, que todo objetivo começa por um dos verbos que a frase aceita.
 */
export function nextPhaseSentence(proxima: Pick<PhaseSpec, "objetivo">): string {
  return `Na próxima fase, você vai ${proxima.objetivo}`;
}

// ---------------------------------------------------------------------------
// O fim de uma trajetória
// ---------------------------------------------------------------------------

/** O que a tela precisa saber quando a pessoa chega ao fim de uma trajetória: o que falta nela e como estão as outras. */
export interface TrailOutcome {
  /** Todas as fases desta trajetória têm carimbo. */
  percorrida: boolean;
  faltam: number;
  /** As outras trajetórias do atlas, na ordem dos perfis. */
  outras: readonly { personagem: PersonagemSlug; nome: string; percorrida: boolean }[];
  /** Esta e todas as outras estão percorridas. */
  todasPercorridas: boolean;
}

export function trailOutcome(paginas: readonly PassportPage[], progressos: ProgressByCharacter, personagem: PersonagemSlug): TrailOutcome {
  const desta = paginas.find((pagina) => pagina.personagem === personagem);
  const contagem = desta === undefined ? { total: 0, carimbadas: 0, faltam: 0 } : countStamps(pagePhases(desta, DEFAULT_ROOM), progressos[personagem]);
  const percorrida = desta !== undefined && isTrailStamped(desta, progressos[personagem]);
  const outras = paginas
    .filter((pagina) => pagina.personagem !== personagem)
    .map((pagina) => ({ personagem: pagina.personagem, nome: pagina.nome, percorrida: isTrailStamped(pagina, progressos[pagina.personagem]) }));
  return { percorrida, faltam: contagem.faltam, outras, todasPercorridas: percorrida && outras.length > 0 && outras.every((outra) => outra.percorrida) };
}
