// As salas do jogo (D-125): a sala de investigação, com a trajetória em
// capítulos, e as salas temáticas, com as decisões políticas de cada tema. A
// sala é o que o jogador escolhe na entrada e o que agrupa a progressão; não é
// a cena (`SceneId`) nem uma categoria do atlas. Só constantes e funções
// puras.

import { TEMA_LABELS, type Tema } from "@/lib/domain/decisions";

import type { ChapterSpec, RoomId } from "./types";

export interface RoomSpec {
  id: RoomId;
  /** O nome visível. */
  nome: string;
  /** `investigacao`: a trajetória em capítulos; `tema`: as decisões de um tema. */
  natureza: "investigacao" | "tema";
  /** O tema das decisões, nas salas temáticas. */
  tema: Tema | null;
  /** O que a sala reúne, para a entrada do jogo. Não afirma fato sobre as pessoas. */
  descricao: string;
}

export const ROOMS: readonly RoomSpec[] = [
  {
    id: "historico",
    nome: "Histórico",
    natureza: "investigacao",
    tema: null,
    descricao: "A trajetória pública em capítulos, por período: os acontecimentos publicados no atlas, com data e fontes.",
  },
  {
    id: "economia",
    nome: TEMA_LABELS.economia,
    natureza: "tema",
    tema: "economia",
    descricao: "As decisões documentadas no tema Economia: votos registrados e atos do Executivo, com a instituição e o cargo de cada uma.",
  },
  {
    id: "seguranca-publica",
    nome: TEMA_LABELS["seguranca-publica"],
    natureza: "tema",
    tema: "seguranca-publica",
    descricao: "As decisões documentadas no tema Segurança pública: votos registrados e atos do Executivo, com a instituição e o cargo de cada uma.",
  },
];

export const DEFAULT_ROOM: RoomId = "historico";

export const ROOM_IDS: readonly RoomId[] = ROOMS.map((sala) => sala.id);

export function isRoomId(valor: string): valor is RoomId {
  return (ROOM_IDS as readonly string[]).includes(valor);
}

export function roomOf(id: RoomId): RoomSpec {
  return ROOMS.find((sala) => sala.id === id) ?? ROOMS[0]!;
}

/** As salas em que há capítulos, na ordem de `ROOMS`. */
export function roomsWithChapters(capitulos: readonly ChapterSpec[]): RoomSpec[] {
  return ROOMS.filter((sala) => capitulos.some((capitulo) => capitulo.sala === sala.id));
}

/** Os capítulos de uma sala, na ordem em que vêm. */
export function chaptersInRoom(capitulos: readonly ChapterSpec[], sala: RoomId): ChapterSpec[] {
  return capitulos.filter((capitulo) => capitulo.sala === sala);
}

/** Os capítulos agrupados por sala, na ordem de `ROOMS`; só as salas com capítulo. */
export function groupByRoom(capitulos: readonly ChapterSpec[]): [RoomId, ChapterSpec[]][] {
  return roomsWithChapters(capitulos).map((sala) => [sala.id, chaptersInRoom(capitulos, sala.id)]);
}
