// Contexto sensível (src/lib/game/sensitivity.ts, D-129): o humor do Escrivão
// fica de fora nos momentos sobre registros de processo judicial, prisão,
// acusação ou violência. A regra é uma sinalização por registro (a ficha
// judicial e uma lista curta), a mesma para os dois personagens; um tema
// inteiro não é sensível.

import { describe, expect, it } from "vitest";

import { readSources, resolvePaths } from "@/lib/content/sources";
import { PROFILES } from "@/lib/domain/profiles";
import { buildGameContent } from "@/lib/game/content";
import { JUDICIAL } from "@/lib/game/judicial";
import { ROOM_IDS } from "@/lib/game/rooms";
import { REGISTROS_SENSIVEIS, isSensitive, isSensitivePhase } from "@/lib/game/sensitivity";
import { phaseRefs } from "@/lib/game/trail";
import type { PhaseRef, PhaseSpec } from "@/lib/game/types";
import { buildAtlasData } from "@/lib/publication/build";

const data = buildAtlasData(readSources(resolvePaths())).data!;
const FASES = PROFILES.flatMap((perfil) => ROOM_IDS.flatMap((sala) => buildGameContent(data, perfil.slug, sala)!.fases));

const A = (id: string): PhaseRef => ({ tipo: "acontecimento", id });
const D = (id: string): PhaseRef => ({ tipo: "decisao", id });
const [JUDICIAL_ID] = Object.keys(JUDICIAL) as [string];

/** Uma fase de teste: o marco, o que a explicação aponta, o que a atividade aponta e o que fica em Explorar. */
const fase = (marco: PhaseRef, explicacao: PhaseRef[], atividade: PhaseRef[], explorar: PhaseRef[] = []): Pick<PhaseSpec, "marco" | "explicacao" | "atividade" | "explorar"> => ({
  marco,
  explicacao: [{ texto: "Bloco de teste.", referencias: explicacao }],
  atividade: { tipo: "pergunta", enunciado: "Pergunta de teste?", opcoes: [{ id: "a", texto: "A" }, { id: "b", texto: "B" }], correta: "a", explicacao: "Explicação de teste.", referencias: atividade },
  explorar,
});

describe("registro de contexto sensível", () => {
  it("todo episódio da ficha judicial é sensível; os outros acontecimentos, não", () => {
    for (const id of Object.keys(JUDICIAL)) expect(isSensitive(id), id).toBe(true);
    expect(isSensitive("lula-1975-eleito-presidente-do-sindicato")).toBe(false);
    expect(isSensitive("flavio-bolsonaro-2002-eleito-deputado-estadual")).toBe(false);
    expect(isSensitive("registro-que-nao-existe")).toBe(false);
  });

  it("a lista de registros sensíveis fora da ficha existe nas fases, e cada um é sensível", () => {
    const nasFases = new Set(FASES.flatMap((item) => phaseRefs(item)).map((referencia) => referencia.id));
    expect(REGISTROS_SENSIVEIS.length).toBeGreaterThan(0);
    for (const id of REGISTROS_SENSIVEIS) {
      expect(nasFases.has(id), id).toBe(true);
      expect(isSensitive(id), id).toBe(true);
      // A lista é do que a ficha judicial não cobre: sem repetição entre as duas.
      expect(JUDICIAL[id], id).toBeUndefined();
    }
    expect(new Set(REGISTROS_SENSIVEIS).size).toBe(REGISTROS_SENSIVEIS.length);
  });

  it("um tema não é sensível: as leis e os votos de Economia e de Segurança pública só entram quando listados", () => {
    const daSala = (sala: string) => FASES.filter((item) => item.sala === sala).flatMap((item) => phaseRefs(item)).filter((referencia) => referencia.tipo === "decisao" || referencia.tipo === "acontecimento");
    const sensiveis = daSala("seguranca-publica").filter((referencia) => isSensitive(referencia.id)).map((referencia) => referencia.id);
    // Só o decreto da intervenção federal, que está na lista; as demais decisões da sala não são sensíveis.
    expect([...new Set(sensiveis)]).toEqual(["planalto-decreto-11377-2023-intervencao-df"]);
    expect(daSala("economia").some((referencia) => isSensitive(referencia.id))).toBe(false);
    // As atuações legislativas de Flávio Bolsonaro são decisões como as outras.
    for (const atuacao of data.conjunto.atuacoesLegislativas) expect(isSensitive(atuacao.id), atuacao.id).toBe(false);
  });
});

describe("fase de contexto sensível", () => {
  it("é sensível quando o marco, a explicação ou a atividade apontam um registro sensível", () => {
    expect(isSensitivePhase(fase(A(JUDICIAL_ID), [A(JUDICIAL_ID)], [A("a")]))).toBe(true);
    expect(isSensitivePhase(fase(A("a"), [A("a"), A(JUDICIAL_ID)], [A("a")]))).toBe(true);
    expect(isSensitivePhase(fase(A("a"), [A("a")], [D("planalto-decreto-11377-2023-intervencao-df")]))).toBe(true);
    expect(isSensitivePhase(fase(A("a"), [A("a"), D("b")], [A("a")]))).toBe(false);
  });

  it("um registro sensível que só está em Explorar não muda a fase: ele leva a própria marca quando é aberto", () => {
    expect(isSensitivePhase(fase(A("a"), [A("a")], [A("a")], [A(JUDICIAL_ID)]))).toBe(false);
  });

  it("só acontecimento e decisão contam: um fato, um cargo ou um conceito com o mesmo identificador não tornam a fase sensível", () => {
    expect(isSensitivePhase(fase({ tipo: "fato", id: JUDICIAL_ID }, [{ tipo: "conceito", id: JUDICIAL_ID }], [{ tipo: "mandato", id: JUDICIAL_ID }]))).toBe(false);
  });

  it("na edição, a marca da fase é a da regra, e as fases de processos dos dois personagens são sensíveis", () => {
    for (const item of FASES) expect(item.sensivel, item.id).toBe(isSensitivePhase(item));
    const sensiveis = FASES.filter((item) => item.sensivel).map((item) => item.id);
    expect(sensiveis).toContain("lula-processos");
    expect(sensiveis).toContain("flavio-bolsonaro-processos");
    // A fase que conta a prisão de 1980 e a que conta o 8 de janeiro de 2023 também.
    expect(sensiveis).toContain("lula-partido-e-constituinte");
    expect(sensiveis).toContain("lula-retorno");
    // As fases de origem, de eleição e de leis estaduais não são.
    for (const id of ["lula-origem", "flavio-bolsonaro-origem", "lula-eleicao-2026", "flavio-bolsonaro-eleicao-2026", "flavio-bolsonaro-alerj-primeiros-mandatos", "flavio-bolsonaro-economia"]) expect(sensiveis, id).not.toContain(id);
  });
});
