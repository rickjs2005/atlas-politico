// Cenário: piso, paredes, saída, registro, anel de alcance e efeito de
// recolher. Cada parte tem o próprio arquivo (scene-*.ts); os elementos de
// cenário ficam em props.ts.

import { drawProp } from "./props";
import { drawExit, drawThreshold } from "./scene-exit";
import { drawFloor } from "./scene-floor";
import { drawCollectEffect, drawReachRing } from "./scene-record";
import { drawWall } from "./scene-walls";
import type { SceneArt } from "./types";

export { RECORD_ART } from "./scene-record";

export const SCENE_ART: SceneArt = {
  drawFloor,
  drawWall,
  drawThreshold,
  drawExit,
  drawProp,
  drawReachRing,
  drawCollectEffect,
};
