// As cenas das fases: o layout de cada cenário (docs/GAMEPLAY.md).
//
// O mapa decide por onde o boneco passa e onde ficam o início, o guia, as
// pastas e a porta (legenda em world/grid.ts). Os elementos de cenário dizem o
// que a arte desenha em cada célula marcada com `o`; um teste confere que as
// duas listas batem e que há caminho a pé do início até cada pasta.
//
// Cada cena aponta a arte que a desenha (`arte`, em src/features/game/draw/arts)
// e traz a própria paleta: nenhuma cor identifica pessoa ou partido; são
// materiais (concreto, madeira, pedra, tecido) e o tom de cada época. O
// acento de cada cena é a cor dos seus objetos de destaque, e não a cor de
// seleção do atlas.
//
// Cada cena remete ao período da fase, ou a uma sala de arquivo (as fases de origem e os aprofundamentos):
// é uma representação narrativa, e não afirma que o personagem percorreu
// aquele caminho.

import type { SceneId, SceneSpec } from "../types";

import { alerj } from "./alerj";
import { arquivoOrigemA, arquivoOrigemB } from "./arquivo-origem";
import { arquivoEconomiaA, arquivoEconomiaB } from "./arquivo-economia";
import { arquivoSegurancaA, arquivoSegurancaB } from "./arquivo-seguranca";
import { comissao } from "./comissao";
import { comite } from "./comite";
import { constituinte } from "./constituinte";
import { convencaoA } from "./convencao-a";
import { convencaoB } from "./convencao-b";
import { gabinete } from "./gabinete";
import { senado } from "./senado";
import { sindicato } from "./sindicato";
import { tribunalA } from "./tribunal-a";
import { tribunalB } from "./tribunal-b";

export const SCENES: Record<SceneId, SceneSpec> = {
  "arquivo-origem-a": arquivoOrigemA,
  "arquivo-origem-b": arquivoOrigemB,
  sindicato,
  constituinte,
  alerj,
  senado,
  comite,
  "tribunal-a": tribunalA,
  "tribunal-b": tribunalB,
  gabinete,
  comissao,
  "convencao-a": convencaoA,
  "convencao-b": convencaoB,
  "arquivo-economia-a": arquivoEconomiaA,
  "arquivo-economia-b": arquivoEconomiaB,
  "arquivo-seguranca-a": arquivoSegurancaA,
  "arquivo-seguranca-b": arquivoSegurancaB,
};

export function getScene(id: SceneId): SceneSpec {
  return SCENES[id];
}
