// A apresentação de cada fase: o cenário e a figura do personagem. É a única
// parte de uma fase que mora no código, e não no conteúdo: não afirma nada
// sobre as pessoas (docs/GAME-TRAIL.md). Os cenários são representações de
// cada período, e a tela diz isso; as fases de origem ficam em uma sala de
// arquivo, de propósito: o jogo não desenha a infância de ninguém.
//
// Um teste confere que toda fase publicada tem a linha dela aqui, e que
// nenhuma linha sobra.

import type { Epoca, PersonagemSlug, RoomId, SceneId } from "./types";

export interface PhasePresentation {
  cena: SceneId;
  epoca: Epoca;
}

export const PHASE_PRESENTATION: Readonly<Record<string, PhasePresentation>> = {
  // Lula, trajetória
  "lula-origem": { cena: "arquivo-origem-a", epoca: "inicio" },
  "lula-sindicato": { cena: "sindicato", epoca: "inicio" },
  "lula-partido-e-constituinte": { cena: "constituinte", epoca: "meio" },
  "lula-disputas-pela-presidencia": { cena: "comite", epoca: "meio" },
  "lula-primeiro-governo": { cena: "gabinete", epoca: "meio" },
  "lula-segundo-governo": { cena: "gabinete", epoca: "meio" },
  "lula-processos": { cena: "tribunal-a", epoca: "atual" },
  "lula-retorno": { cena: "gabinete", epoca: "atual" },
  "lula-eleicao-2026": { cena: "convencao-a", epoca: "atual" },
  // Flávio Bolsonaro, trajetória
  "flavio-bolsonaro-origem": { cena: "arquivo-origem-b", epoca: "inicio" },
  "flavio-bolsonaro-primeira-eleicao": { cena: "alerj", epoca: "inicio" },
  "flavio-bolsonaro-alerj-primeiros-mandatos": { cena: "alerj", epoca: "inicio" },
  "flavio-bolsonaro-alerj-ultimos-mandatos": { cena: "alerj", epoca: "meio" },
  "flavio-bolsonaro-senado": { cena: "senado", epoca: "meio" },
  "flavio-bolsonaro-processos": { cena: "tribunal-b", epoca: "meio" },
  "flavio-bolsonaro-funcoes-no-senado": { cena: "comissao", epoca: "atual" },
  "flavio-bolsonaro-decisoes-no-senado": { cena: "senado", epoca: "atual" },
  "flavio-bolsonaro-eleicao-2026": { cena: "convencao-b", epoca: "atual" },
  // Aprofundamentos
  "lula-economia": { cena: "arquivo-economia-a", epoca: "atual" },
  "lula-seguranca-publica": { cena: "arquivo-seguranca-a", epoca: "atual" },
  "flavio-bolsonaro-economia": { cena: "arquivo-economia-b", epoca: "atual" },
  "flavio-bolsonaro-seguranca-publica": { cena: "arquivo-seguranca-b", epoca: "atual" },
  // Missão de investigação (D-151): a sala de investigação de cada personagem.
  "lula-investigacao": { cena: "arquivo-investigacao-a", epoca: "atual" },
  "flavio-bolsonaro-investigacao": { cena: "arquivo-investigacao-b", epoca: "atual" },
};

/** A apresentação de reserva, para uma fase que o conteúdo publicou e o código ainda não conhece: a sala de arquivo do personagem. */
const RESERVA: Record<PersonagemSlug, Record<RoomId, SceneId>> = {
  lula: { historico: "arquivo-origem-a", economia: "arquivo-economia-a", "seguranca-publica": "arquivo-seguranca-a", investigacao: "arquivo-investigacao-a" },
  "flavio-bolsonaro": { historico: "arquivo-origem-b", economia: "arquivo-economia-b", "seguranca-publica": "arquivo-seguranca-b", investigacao: "arquivo-investigacao-b" },
};

/** O cenário e a figura de uma fase. Sem linha própria, a sala de arquivo do personagem, com a figura dos anos recentes. */
export function presentationOf(faseId: string, personagem: PersonagemSlug, sala: RoomId): PhasePresentation {
  return PHASE_PRESENTATION[faseId] ?? { cena: RESERVA[personagem][sala], epoca: "atual" };
}
