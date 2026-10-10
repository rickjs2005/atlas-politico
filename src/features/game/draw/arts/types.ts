// O contrato de uma arte de ambiente (docs/GAMEPLAY.md, seção Direção
// visual). Uma arte é o conjunto piso, paredes, porta e materiais dos
// elementos de cenário; uma cena aponta a arte que a desenha (`SceneSpec.arte`)
// e traz a própria paleta e disposição. Duas cenas podem usar a mesma arte.
//
// Cada arte vive em um arquivo de draw/arts/ e é registrada em index.ts.

import type { SceneArtId, ScenePalette } from "@/lib/game/types";

import type { DoorStyle } from "../exit-kit";
import type { Receita } from "../props-base";
import type { CellInfo } from "../types";
import type { Estilo, Faixa, Linha } from "../wall-kit";

export interface WallArt {
  /** As cores da face, com a luz `k` já aplicada (ver `estiloBase` em wall-kit.ts). */
  estilo(p: ScenePalette, k: number): Estilo;
  /** Faixas horizontais que dão a volta na parede, inclusive no topo do pilar. */
  faixas: readonly Faixa[];
  /** Linhas de tinta, na altura e opacidade dadas. */
  linhas: readonly Linha[];
  /**
   * O caráter do ambiente na face de uma célula inteira da parede de trás,
   * no plano já fixado (wall-kit.ts): `i` é a posição ao longo da parede,
   * `norte` diz qual das duas é.
   */
  decorar(ctx: CanvasRenderingContext2D, e: Estilo, i: number, norte: boolean): void;
  /** Os traços do parapeito da frente, entre `u0` e `u1`, no plano já fixado. */
  parapeito(ctx: CanvasRenderingContext2D, e: Estilo, u0: number, u1: number): void;
  /** A cor do corpo do parapeito: o pano da parede ou a barra. */
  corpoDoParapeito: "face" | "barra";
}

export interface ArtSpec {
  id: SceneArtId;
  /** O ambiente, para a galeria e as capturas. */
  nome: string;
  parede: WallArt;
  /** O piso de uma célula comum, com `base` já escolhida pela variante. O tapete é o mesmo em todas as artes. */
  piso(ctx: CanvasRenderingContext2D, paleta: ScenePalette, base: string, sx: number, sy: number, variante: 0 | 1, info: CellInfo): void;
  /** A porta da saída, com as cores da paleta. */
  porta(p: ScenePalette): DoorStyle;
  /** Os materiais dos elementos de cenário. */
  receita: Receita;
}
