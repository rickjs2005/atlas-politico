// Cenário: piso, paredes, saída, pasta e o anel sob a pasta do marco. Cada
// parte tem o próprio arquivo (scene-*.ts); os elementos de cenário ficam em
// props.ts.

import { drawProp } from "./props";
import { drawExit, drawThreshold } from "./scene-exit";
import { drawFloor } from "./scene-floor";
import { drawReachRing } from "./scene-record";
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
};
