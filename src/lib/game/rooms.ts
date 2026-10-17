// As salas do jogo: a trajetória, que é a trilha da vida, e os
// aprofundamentos sobre decisões documentadas, um por tema (D-125, revista pela
// D-133). A sala é o que agrupa as fases; não é a cena (`SceneId`) nem uma
// categoria do atlas. Só constantes e funções puras.

import { TEMA_LABELS, type Tema } from "@/lib/domain/decisions";
import { SALAS_DO_JOGO } from "@/lib/domain/game";

import type { RoomId } from "./types";

export interface RoomSpec {
  id: RoomId;
  /** O nome visível. */
  nome: string;
  /**
   * `trajetoria`: a trilha da vida, da origem à data de corte;
   * `aprofundamento`: decisões documentadas de um tema, com os anos ditos;
   * `investigacao`: a missão documental, em que a pessoa monta um dossiê e
   * relaciona cada ficha ao documento que a sustenta (D-151).
   */
  natureza: "trajetoria" | "aprofundamento" | "investigacao";
  /** O tema das decisões, nos aprofundamentos. */
  tema: Tema | null;
  /** O que a sala reúne, para a entrada do jogo. Não afirma fato sobre as pessoas. */
  descricao: string;
}

export const ROOMS: readonly RoomSpec[] = [
  {
    id: "historico",
    nome: "Trajetória",
    natureza: "trajetoria",
    tema: null,
    descricao: "Da origem à data de corte, em fases curtas: de onde a pessoa veio, que cargos ocupou e o que está documentado do que fez neles.",
  },
  {
    id: "economia",
    nome: TEMA_LABELS.economia,
    natureza: "aprofundamento",
    tema: "economia",
    descricao: "Decisões documentadas no tema Economia: votos registrados e atos do Executivo, com o cargo e a instituição de cada uma.",
  },
  {
    id: "seguranca-publica",
    nome: TEMA_LABELS["seguranca-publica"],
    natureza: "aprofundamento",
    tema: "seguranca-publica",
    descricao: "Decisões documentadas no tema Segurança pública: votos registrados e atos do Executivo, com o cargo e a instituição de cada uma.",
  },
  {
    id: "investigacao",
    nome: "O documento diz o quê?",
    natureza: "investigacao",
    tema: null,
    descricao: "Uma missão de investigação: o Escrivão entrega fichas, a pessoa abre os documentos da gaveta, monta um dossiê e relaciona cada ficha ao documento que a sustenta.",
  },
];

export const DEFAULT_ROOM: RoomId = "historico";

export const ROOM_IDS: readonly RoomId[] = SALAS_DO_JOGO;

export function isRoomId(valor: string): valor is RoomId {
  return (ROOM_IDS as readonly string[]).includes(valor);
}

export function roomOf(id: RoomId): RoomSpec {
  return ROOMS.find((sala) => sala.id === id) ?? ROOMS[0]!;
}

/** As fases de uma sala, na ordem em que vêm. */
export function phasesInRoom<T extends { sala: RoomId }>(fases: readonly T[], sala: RoomId): T[] {
  return fases.filter((fase) => fase.sala === sala);
}

/** Como a sala se apresenta em uma frase curta: "Trajetória", "Aprofundamento: Economia" ou "Missão: O documento diz o quê?". */
export function roomLabel(sala: RoomSpec): string {
  if (sala.natureza === "trajetoria") return sala.nome;
  return sala.natureza === "investigacao" ? `Missão: ${sala.nome}` : `Aprofundamento: ${sala.nome}`;
}

/** O período de uma sala, por extenso: "1945 a 2026", ou o ano só. */
export function periodLabel(periodo: { de: number; ate: number }): string {
  return periodo.de === periodo.ate ? `${periodo.de}` : `${periodo.de} a ${periodo.ate}`;
}
