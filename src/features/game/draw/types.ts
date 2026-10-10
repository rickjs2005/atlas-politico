// Contrato da arte do jogo (docs/GAMEPLAY.md, seção Direção visual).
//
// Tudo é desenhado por código em um canvas 2D, na escala 1: uma célula tem
// 64 por 32 pixels (world/iso.ts) e o personagem tem cerca de 68 pixels de
// altura. O renderizador aplica o zoom e a densidade de pixels pela matriz do
// contexto; as funções de desenho recebem o ponto de apoio (`sx`, `sy`) em
// pixels de mundo e não precisam saber de câmera.
//
// Com `movimento` desligado, nada balança nem pisca: os desenhos ficam no
// estado de repouso.

import type { Epoca, ExitSide, Facing, PersonagemSlug, PropKind, SceneArtId, SceneId, ScenePalette } from "@/lib/game/types";

export interface DrawContext {
  ctx: CanvasRenderingContext2D;
  /** Segundos desde o início da cena, para animações de repouso. */
  tempo: number;
  /** `false` com movimento reduzido. */
  movimento: boolean;
}

export interface CharacterPose {
  facing: Facing;
  andando: boolean;
  /** Fase do ciclo de caminhada, de 0 a 1. */
  fase: number;
}

export interface CharacterArt {
  /** Nome curto, para a galeria e os testes. */
  nome: string;
  /** Altura do desenho em pixels, na escala 1. */
  altura: number;
  /** Desenha com os pés centrados em (`sx`, `sy`). */
  draw(d: DrawContext, pose: CharacterPose, sx: number, sy: number): void;
}

/** Os dois personagens jogáveis, em cada época, com o mesmo cuidado de desenho. */
export type CharacterArtSet = Record<PersonagemSlug, Record<Epoca, CharacterArt>>;

/** O tipo de parede por borda: as duas de trás ficam em pé; as da frente são baixas. */
export type WallSide = ExitSide;

/**
 * Onde a peça está: a cena, a arte que a desenha, a célula e o tamanho da
 * grade. Serve para a arte variar por ambiente (material, janela, quadro) e
 * por posição (canto, textura), sempre do mesmo jeito para a mesma célula.
 * A cena identifica o layout (tapetes, saída); a arte, o desenho.
 */
export interface CellInfo {
  cena: SceneId;
  arte: SceneArtId;
  x: number;
  y: number;
  largura: number;
  altura: number;
}

export interface RecordArt {
  /** O registro recolhível: uma pasta de documentos. `destaque` quando ao alcance. */
  draw(d: DrawContext, sx: number, sy: number, destaque: boolean): void;
}

export interface SceneArt {
  /** Piso de uma célula. `variante` alterna 0 e 1 em xadrez; `tapete` usa a cor do tapete. */
  drawFloor(d: DrawContext, paleta: ScenePalette, sx: number, sy: number, variante: 0 | 1, tapete: boolean, info: CellInfo): void;
  /** Parede de uma célula de borda. */
  drawWall(d: DrawContext, paleta: ScenePalette, sx: number, sy: number, lado: WallSide, info: CellInfo): void;
  /** A soleira da saída, no chão: desenhada com o piso, antes de tudo o que fica em pé. */
  drawThreshold(d: DrawContext, paleta: ScenePalette, sx: number, sy: number, lado: WallSide, abertura: number, info: CellInfo): void;
  /** O portal e a porta da saída, na parede do lado dado. `abertura` vai de 0 (fechada) a 1 (aberta). */
  drawExit(d: DrawContext, paleta: ScenePalette, sx: number, sy: number, lado: WallSide, abertura: number, info: CellInfo): void;
  /** Elemento de cenário, pelo tipo. */
  drawProp(d: DrawContext, paleta: ScenePalette, tipo: PropKind, sx: number, sy: number, variante: number, espelhado: boolean, info: CellInfo): void;
  /** Anel discreto no chão sob o objeto ao alcance. */
  drawReachRing(d: DrawContext, paleta: ScenePalette, sx: number, sy: number): void;
  /** Efeito de recolher, de `t` 0 a 1. */
  drawCollectEffect(d: DrawContext, paleta: ScenePalette, sx: number, sy: number, t: number): void;
}

/** A função que desenha um elemento de cenário (draw/props.ts). */
export type PropDrawer = SceneArt["drawProp"];
