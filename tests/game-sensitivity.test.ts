// Contexto sensível (D-129): o humor do Escrivão fica de fora nos momentos
// sobre registros de processo judicial, prisão, acusação ou violência. A regra
// é uma sinalização por registro (a ficha judicial e uma lista curta), a mesma
// para os dois personagens; um tema inteiro não é sensível.

import { describe, expect, it } from "vitest";

import { chaptersOf } from "@/lib/game/chapters";
import { selectLines } from "@/lib/game/escrivao";
import { JUDICIAL } from "@/lib/game/judicial";
import { recordIds } from "@/lib/game/mission";
import { REGISTROS_SENSIVEIS, isSensitive, isSensitiveChapter } from "@/lib/game/sensitivity";
import type { ChapterSpec, TaskSpec } from "@/lib/game/types";

const TODOS = [...chaptersOf("lula"), ...chaptersOf("flavio-bolsonaro")];

const capitulo = (tarefa: TaskSpec, eventIds: string[], decisaoIds: string[] = []): Pick<ChapterSpec, "eventIds" | "decisaoIds" | "tarefa"> => ({ tarefa, eventIds, decisaoIds });

describe("registro de contexto sensível", () => {
  it("todo episódio da ficha judicial é sensível; os outros acontecimentos, não", () => {
    for (const id of Object.keys(JUDICIAL)) expect(isSensitive(id), id).toBe(true);
    expect(isSensitive("lula-1975-eleito-presidente-do-sindicato")).toBe(false);
    expect(isSensitive("flavio-bolsonaro-2002-eleito-deputado-estadual")).toBe(false);
    expect(isSensitive("registro-que-nao-existe")).toBe(false);
  });

  it("a lista de registros sensíveis fora da ficha existe nos capítulos, e cada um é sensível", () => {
    const nosCapitulos = new Set(TODOS.flatMap((item) => recordIds(item)));
    expect(REGISTROS_SENSIVEIS.length).toBeGreaterThan(0);
    for (const id of REGISTROS_SENSIVEIS) {
      expect(nosCapitulos.has(id), id).toBe(true);
      expect(isSensitive(id), id).toBe(true);
      // A lista é do que a ficha judicial não cobre: sem repetição entre as duas.
      expect(JUDICIAL[id], id).toBeUndefined();
    }
    expect(new Set(REGISTROS_SENSIVEIS).size).toBe(REGISTROS_SENSIVEIS.length);
  });

  it("um tema não é sensível: as leis e os votos de Segurança pública só entram quando listados", () => {
    const daSala = TODOS.filter((item) => item.sala === "seguranca-publica").flatMap((item) => recordIds(item));
    expect(daSala.length).toBeGreaterThan(0);
    const sensiveis = daSala.filter(isSensitive);
    // Só o decreto da intervenção federal, que está na lista; as demais decisões da sala mantêm o humor.
    expect([...new Set(sensiveis)]).toEqual(["planalto-decreto-11377-2023-intervencao-df"]);
    for (const item of TODOS.filter((outro) => outro.sala === "economia")) expect(recordIds(item).some(isSensitive), item.id).toBe(false);
  });
});

describe("capítulo de contexto sensível", () => {
  it("é sensível quando a tarefa pede um registro sensível, ou quando mais da metade dos registros é sensível", () => {
    const [judicial] = Object.keys(JUDICIAL) as [string];
    expect(isSensitiveChapter(capitulo({ tipo: "fonte", eventId: judicial }, [judicial, "a", "b", "c"]))).toBe(true);
    expect(isSensitiveChapter(capitulo({ tipo: "ordem", eventIds: ["a", judicial] }, ["a", judicial, "b", "c"]))).toBe(true);
    expect(isSensitiveChapter(capitulo({ tipo: "registro", eventId: "a" }, ["a", judicial, "b", "c"]))).toBe(false);
    // Metade não basta; mais da metade, sim.
    expect(isSensitiveChapter(capitulo({ tipo: "registro", eventId: "a" }, ["a", judicial]))).toBe(false);
    expect(isSensitiveChapter(capitulo({ tipo: "registro", eventId: "a" }, ["a", judicial], ["planalto-decreto-11377-2023-intervencao-df"]))).toBe(true);
    expect(isSensitiveChapter(capitulo({ tipo: "registro", eventId: "a" }, ["a"]))).toBe(false);
  });

  it("na edição, os capítulos sensíveis são os de processos e o da intervenção, com a mesma regra para os dois personagens", () => {
    const sensiveis = TODOS.filter((item) => isSensitiveChapter(item)).map((item) => item.id).sort();
    expect(sensiveis).toEqual(["flavio-bolsonaro-3-denuncia", "lula-4-processos", "lula-5-anulacao"]);
    // Nenhuma sala temática é sensível como capítulo: o humor da sala fica.
    for (const item of TODOS.filter((outro) => outro.sala !== "historico")) expect(isSensitiveChapter(item), item.id).toBe(false);
  });
});

describe("seleção das falas em contexto sensível", () => {
  it("o seletor não escolhe humor, mesmo com a preferência ligada; a instrução e a documental ficam as mesmas", () => {
    const dados = { titulo: "Registro", data: "2 de janeiro de 2024", fontes: "1 fonte" };
    const comHumor = selectLines({ sala: "historico", evento: "descoberta", humor: true, vistas: [], dados });
    expect(comHumor.map((fala) => fala.camada)).toEqual(["instrucao", "documental", "humor"]);
    const sensivel = selectLines({ sala: "historico", evento: "descoberta", humor: true, vistas: [], dados, sensivel: true });
    expect(sensivel.map((fala) => fala.camada)).toEqual(["instrucao", "documental"]);
    expect(sensivel).toEqual(comHumor.slice(0, 2));
    // O mesmo vale para as salas temáticas e para os outros eventos.
    for (const sala of ["economia", "seguranca-publica"] as const) {
      for (const evento of ["entrada", "ajuda", "fonte", "erro", "conclusao"] as const) {
        expect(selectLines({ sala, evento, humor: true, vistas: [], sensivel: true }).some((fala) => fala.camada === "humor"), `${sala} ${evento}`).toBe(false);
        expect(selectLines({ sala, evento, humor: true, vistas: [], sensivel: true }).some((fala) => fala.camada === "instrucao"), `${sala} ${evento}`).toBe(true);
      }
    }
  });
});
