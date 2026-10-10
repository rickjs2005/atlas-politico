// Contratos do jogo (docs/GAMEPLAY.md). Só tipos: servem ao build, ao
// navegador e aos testes.
//
// O jogo não guarda conteúdo editorial. Um capítulo cita acontecimentos pelo
// identificador do conjunto publicado; os textos, as datas e as fontes chegam
// pelos dados gerados, como em qualquer outra tela do atlas.

import type { Categoria, DataHistorica, Editorial } from "@/lib/domain/types";
import type { ProfileSlug } from "@/lib/domain/profiles";

export type PersonagemSlug = ProfileSlug;

// ---------------------------------------------------------------------------
// Capítulos e tarefas
// ---------------------------------------------------------------------------

/**
 * A tarefa de um capítulo. Quatro tipos:
 *   `registro`  encontrar e recolher o registro de um acontecimento;
 *   `ordem`     recolher dois registros e pô-los em ordem cronológica. As
 *               datas dos dois têm de decidir a ordem sem ambiguidade (um
 *               teste confere isso contra o conteúdo);
 *   `fonte`     recolher um registro e indicar, entre documentos do capítulo,
 *               o que o sustenta;
 *   `lugar`     recolher um registro e indicar o lugar em que o atlas o
 *               documenta, entre lugares da trajetória.
 * As opções das tarefas de fonte e de lugar saem dos próprios registros
 * (src/lib/game/mission.ts): o jogo não escreve alternativa nenhuma.
 */
export type TaskSpec =
  | { tipo: "registro"; eventId: string }
  | { tipo: "ordem"; eventIds: readonly [string, string] }
  | { tipo: "fonte"; eventId: string }
  | { tipo: "lugar"; eventId: string };

export type TaskType = TaskSpec["tipo"];

/**
 * A arte de um cenário: piso, paredes, porta e materiais. Uma arte pode
 * servir a mais de uma cena, com paleta e disposição próprias; a cena é o
 * que o capítulo aponta (`SceneId`).
 */
export type SceneArtId = "sindicato" | "constituinte" | "alerj" | "senado" | "comite" | "tribunal" | "gabinete" | "comissao" | "convencao";

export type SceneId =
  | "sindicato"
  | "constituinte"
  | "alerj"
  | "senado"
  | "comite"
  | "tribunal-a"
  | "tribunal-b"
  | "gabinete"
  | "comissao"
  | "convencao-a"
  | "convencao-b";

/**
 * A época da figura do personagem no capítulo: variações estilizadas de
 * cabelo, barba e roupa, as mesmas para os dois personagens (D-111). Não
 * afirmam a aparência real em cada data.
 */
export type Epoca = "inicio" | "meio" | "atual";

/** Como cada época aparece na interface: a figura é uma representação, e o rótulo diz isso. */
export const EPOCA_LABEL: Record<Epoca, string> = {
  inicio: "figura dos primeiros anos",
  meio: "figura dos anos intermediários",
  atual: "figura dos anos recentes",
};

export interface ChapterSpec {
  /** Identificador estável, usado no progresso salvo. */
  id: string;
  personagem: PersonagemSlug;
  /** Posição na trajetória do personagem, a partir de 1. */
  numero: number;
  titulo: string;
  /** Anos que o capítulo cobre, pelas datas dos acontecimentos citados. */
  periodo: { de: number; ate: number };
  /** Por que estes acontecimentos formam um capítulo (docs/GAMEPLAY.md). */
  motivo: string;
  /** Objetivo curto, mostrado ao jogador. */
  objetivo: string;
  /**
   * Acontecimentos do capítulo, pelo `id` do conjunto publicado. A ordem é a
   * das posições na cena (`SceneSpec.registros`). Todos aparecem como
   * registros no cenário. A tarefa exige alguns deles; a saída, todos.
   */
  eventIds: readonly string[];
  tarefa: TaskSpec;
  cena: SceneId;
  epoca: Epoca;
}

export type ChapterStatus = "bloqueado" | "disponivel" | "concluido";

// ---------------------------------------------------------------------------
// Progresso do jogador (salvo localmente, por personagem)
// ---------------------------------------------------------------------------

/**
 * Versão do formato salvo. A 1 guardava a tarefa com `ordemConfirmada`; a 2
 * generalizou para `confirmada`, que vale para qualquer tarefa com resposta
 * (ordem, fonte, lugar). A leitura migra a versão 1 (src/lib/game/progress.ts).
 */
export const PROGRESS_VERSION = 2;

export interface TaskState {
  /** Registros recolhidos neste capítulo, na ordem em que foram recolhidos. */
  recolhidos: string[];
  /** Tarefa com resposta (ordem, fonte, lugar): a resposta certa foi confirmada. */
  confirmada: boolean;
  /** Tarefa com resposta: quantas tentativas foram feitas (só informação; não pune). */
  tentativas: number;
}

export interface ChapterProgress {
  status: ChapterStatus;
  tarefa: TaskState;
}

export interface PlayerProgress {
  versao: typeof PROGRESS_VERSION;
  personagem: PersonagemSlug;
  /** Por `ChapterSpec.id`. Todo capítulo do personagem tem entrada. */
  capitulos: Record<string, ChapterProgress>;
}

// ---------------------------------------------------------------------------
// Conteúdo que o jogo recebe (recortado dos dados gerados no build)
// ---------------------------------------------------------------------------

export interface GameSource {
  /** O `id` da fonte no conjunto publicado. */
  id: string;
  titulo: string;
  autoria: string;
  url: string;
  /** O que o trecho citado sustenta no registro, como a citação diz. */
  evidencia: string;
}

/** Onde o atlas documenta o acontecimento, com os nomes dos lugares já resolvidos. */
export type GameLocation = { tipo: "lugares"; lugares: readonly string[] } | { tipo: "nacional" } | { tipo: "desconhecida" };

/** O que um registro mostra ao ser recolhido: o mesmo que a ficha, em resumo. */
export interface GameRecord {
  id: string;
  slug: string;
  titulo: string;
  data: DataHistorica;
  categoria: Categoria;
  resumo: string;
  /** O contexto da ficha: nos episódios judiciais, é onde o atlas traz a defesa, a decisão e o desfecho. */
  contexto: string;
  localizacao: GameLocation;
  fontes: readonly GameSource[];
  /** Quem conferiu o registro e quando: o jogo mostra a mesma nota do atlas. */
  editorial: Editorial;
  /**
   * A data deste registro não decide a posição dele em relação a outro
   * registro do personagem no jogo. É a regra da lista do atlas
   * (`findUndeterminedOrder`), e o registro leva o mesmo aviso.
   */
  ordemEmAberto: boolean;
}

export interface GameContent {
  personagem: { slug: PersonagemSlug; nome: string };
  capitulos: readonly ChapterSpec[];
  /** Por `id` de acontecimento. Só os citados pelos capítulos. */
  registros: Record<string, GameRecord>;
}

// ---------------------------------------------------------------------------
// Cena: o mundo de um capítulo
// ---------------------------------------------------------------------------

/**
 * Elementos de cenário desenhados pela arte (src/features/game/draw). Cada
 * tipo ocupa uma célula e bloqueia a passagem, salvo `decoracao`.
 */
export type PropKind =
  | "mesa"
  | "mesa-central"
  | "cadeira"
  | "bancada"
  | "tribuna"
  | "arquivo"
  | "estante"
  | "armario"
  | "coluna"
  | "urna"
  | "bandeira"
  | "planta"
  | "maquina"
  | "banco"
  | "microfone"
  | "caixote"
  | "poltrona"
  | "placa"
  | "decoracao"
  | "tela"
  | "balcao"
  | "fileira"
  | "sofa"
  | "cartaz";

export interface PropSpec {
  tipo: PropKind;
  x: number;
  y: number;
  /** Variação de desenho, quando a arte oferecer mais de uma. */
  variante?: number;
  /** Desenhado espelhado na horizontal. */
  espelhado?: boolean;
}

export interface ScenePalette {
  chao: string;
  chaoAlt: string;
  tapete: string;
  parede: string;
  paredeTopo: string;
  fundo: string;
  acento: string;
}

/** Direção de saída da cena, pela borda em que o portal está. */
export type ExitSide = "norte" | "sul" | "leste" | "oeste";

export interface SceneSpec {
  id: SceneId;
  /** A arte que desenha esta cena. */
  arte: SceneArtId;
  /** Nome do lugar, mostrado na transição e no painel. */
  nome: string;
  /** Uma linha por fileira, um caractere por célula (legenda em grid.ts). */
  mapa: readonly string[];
  largura: number;
  altura: number;
  paleta: ScenePalette;
  /** Elementos de cenário, além dos que o mapa marca com `o`. */
  props: readonly PropSpec[];
  /** Células com tapete ou piso diferente, só desenho. */
  tapetes: readonly { x: number; y: number }[];
  spawn: { x: number; y: number };
  guia: { x: number; y: number };
  saida: { x: number; y: number; lado: ExitSide };
  /** Posições dos registros, na ordem de `ChapterSpec.eventIds`. */
  registros: readonly { x: number; y: number }[];
}

// ---------------------------------------------------------------------------
// Mundo em movimento
// ---------------------------------------------------------------------------

/** Direção em que o personagem olha, em eixos do mundo (ver iso.ts). */
export type Facing = "frente-direita" | "frente-esquerda" | "costas-direita" | "costas-esquerda";

export interface InputState {
  /** Vetor de intenção em eixos de tela: -1, 0 ou 1 em cada eixo. */
  dx: number;
  dy: number;
}

export interface PlayerState {
  x: number;
  y: number;
  facing: Facing;
  andando: boolean;
  /** Fase do ciclo de caminhada, de 0 a 1. */
  fase: number;
}

export type InteractableKind = "registro" | "guia" | "saida";

export interface Interactable {
  tipo: InteractableKind;
  /** `eventId` para registros; `guia` ou `saida` para os demais. */
  id: string;
  x: number;
  y: number;
}
