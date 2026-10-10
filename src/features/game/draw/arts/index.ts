// O registro das artes de ambiente: uma por `SceneArtId`. A cena aponta a
// arte (`SceneSpec.arte`); o cenário (scene-walls.ts, scene-floor.ts,
// scene-exit.ts, props.ts) desenha com o que a arte diz.

import type { SceneArtId } from "@/lib/game/types";

import { alerj } from "./alerj";
import { comissao } from "./comissao";
import { comite } from "./comite";
import { constituinte } from "./constituinte";
import { convencao } from "./convencao";
import { gabinete } from "./gabinete";
import { senado } from "./senado";
import { sindicato } from "./sindicato";
import { tribunal } from "./tribunal";
import type { ArtSpec } from "./types";

export type { ArtSpec, WallArt } from "./types";

export const ARTS: Record<SceneArtId, ArtSpec> = { sindicato, constituinte, alerj, senado, comite, tribunal, gabinete, comissao, convencao };

export function artOf(id: SceneArtId): ArtSpec {
  return ARTS[id];
}
