// As cenas dos capítulos: o layout de cada mundo (docs/GAMEPLAY.md).
//
// O mapa decide o que bloqueia e onde ficam o início, o guia, os registros e
// a saída (legenda em world/grid.ts). Os elementos de cenário dizem o que a
// arte desenha em cada célula marcada com `o`; um teste confere que as duas
// listas batem e que registros e saída são alcançáveis a pé.
//
// Cada cena remete ao período do capítulo: é uma representação narrativa da
// passagem do tempo, e não afirma que o personagem percorreu aquele caminho.

import type { SceneId, SceneSpec } from "../types";

import { alerj } from "./alerj";
import { constituinte } from "./constituinte";
import { senado } from "./senado";
import { sindicato } from "./sindicato";

export const SCENES: Record<SceneId, SceneSpec> = { sindicato, constituinte, alerj, senado };

export function getScene(id: SceneId): SceneSpec {
  return SCENES[id];
}
