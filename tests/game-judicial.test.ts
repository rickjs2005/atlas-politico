// A ficha judicial do jogo: a natureza de cada registro e as decisões
// relacionadas, por identificador. Nada inventado: todo identificador existe
// na edição e nos capítulos do mesmo personagem, os textos não atribuem fala
// a ninguém, e as decisões relacionadas saem em ordem cronológica.

import { describe, expect, it } from "vitest";

import { readSources, resolvePaths } from "@/lib/content/sources";
import { findEventById } from "@/lib/data/queries";
import { CHAPTERS } from "@/lib/game/chapters";
import { buildGameContent } from "@/lib/game/content";
import { JUDICIAL, JUDICIAL_KIND_LABEL, JUDICIAL_NOTICE, judicialOf, relatedRecords } from "@/lib/game/judicial";
import { buildAtlasData } from "@/lib/publication/build";

const data = buildAtlasData(readSources(resolvePaths())).data!;

const capituloDe = (eventId: string) => CHAPTERS.find((capitulo) => capitulo.eventIds.includes(eventId));

/** Os registros que o atlas descreve como denúncia, decisão, prisão ou soltura: todos têm ficha. */
const JUDICIAIS = [
  "lula-2016-nomeacao-para-a-casa-civil-suspensa",
  "lula-2017-condenacao-em-primeira-instancia",
  "lula-2018-tribunal-confirma-condenacao",
  "lula-2018-prisao-em-curitiba",
  "lula-2018-registro-de-candidatura-indeferido",
  "lula-2019-saida-da-prisao",
  "lula-2021-stf-anula-condenacoes",
  "flavio-bolsonaro-2020-denuncia-do-ministerio-publico",
  "flavio-bolsonaro-2021-stj-anula-decisoes-da-investigacao",
  "flavio-bolsonaro-2022-tribunal-rejeita-denuncia",
];

describe("ficha judicial", () => {
  it("todo episódio judicial dos capítulos tem ficha, e não há ficha sem episódio", () => {
    expect(Object.keys(JUDICIAL).sort()).toEqual([...JUDICIAIS].sort());
    for (const id of JUDICIAIS) expect(judicialOf(id), id).not.toBeNull();
    expect(judicialOf("lula-1975-eleito-presidente-do-sindicato")).toBeNull();
  });

  it("todo identificador existe na edição e está em um capítulo do mesmo personagem", () => {
    for (const [id, entrada] of Object.entries(JUDICIAL)) {
      const acontecimento = findEventById(data, id);
      expect(acontecimento, id).not.toBeNull();
      const capitulo = capituloDe(id);
      expect(capitulo, `${id} em um capítulo`).toBeDefined();
      for (const { id: outro } of entrada.relacionados) {
        expect(outro, `${id} relaciona a si mesmo`).not.toBe(id);
        expect(findEventById(data, outro), `${id} relaciona ${outro}`).not.toBeNull();
        expect(capituloDe(outro)?.personagem, `${id} relaciona ${outro}`).toBe(capitulo!.personagem);
      }
      // Sem repetição.
      const ids = entrada.relacionados.map((item) => item.id);
      expect(new Set(ids).size, id).toBe(ids.length);
    }
  });

  it("os textos não atribuem fala a ninguém e não equiparam decisões diferentes", () => {
    const textos = [JUDICIAL_NOTICE, ...Object.values(JUDICIAL_KIND_LABEL), ...Object.values(JUDICIAL).flatMap((entrada) => entrada.relacionados.map((item) => item.relacao))];
    for (const texto of textos) {
      expect(texto.trim().length).toBeGreaterThan(0);
      expect(texto).not.toMatch(/["“”«»]/);
      expect(texto).not.toMatch(/\b(disse|afirmou|declarou|falou)\b/i);
      expect(texto).toMatch(/\.$/);
    }
    expect(JUDICIAL_KIND_LABEL.denuncia).toContain("Não é condenação");
    expect(JUDICIAL_KIND_LABEL.anulacao).toContain("Não é absolvição nem condenação");
    expect(JUDICIAL_KIND_LABEL.rejeicao).toContain("Não é absolvição nem condenação");
    expect(JUDICIAL_NOTICE).toContain("não pede que você decida culpa");
  });

  it("as decisões relacionadas saem com a ficha do atlas, em ordem cronológica, e sem as que o conteúdo não tem", () => {
    const lula = buildGameContent(data, "lula")!;
    const relacionados = relatedRecords("lula-2018-tribunal-confirma-condenacao", lula.registros);
    expect(relacionados.map((item) => item.registro.id)).toEqual([
      "lula-2017-condenacao-em-primeira-instancia",
      "lula-2018-prisao-em-curitiba",
      "lula-2018-registro-de-candidatura-indeferido",
      "lula-2021-stf-anula-condenacoes",
    ]);
    for (const item of relacionados) expect(item.registro).toBe(lula.registros[item.registro.id]);
    const semUm = { ...lula.registros };
    delete semUm["lula-2021-stf-anula-condenacoes"];
    expect(relatedRecords("lula-2018-tribunal-confirma-condenacao", semUm)).toHaveLength(3);
    expect(relatedRecords("lula-1975-eleito-presidente-do-sindicato", lula.registros)).toEqual([]);
  });

  it("a decisão posterior que altera o quadro é consultável a partir do registro anterior, com a própria data", () => {
    const lula = buildGameContent(data, "lula")!;
    const daCondenacao = relatedRecords("lula-2017-condenacao-em-primeira-instancia", lula.registros);
    const anulacao = daCondenacao.find((item) => item.registro.id === "lula-2021-stf-anula-condenacoes");
    expect(anulacao).toBeDefined();
    expect(anulacao!.registro.data.valor).toBe("2021-03-08");
    const flavio = buildGameContent(data, "flavio-bolsonaro")!;
    const daDenuncia = relatedRecords("flavio-bolsonaro-2020-denuncia-do-ministerio-publico", flavio.registros);
    expect(daDenuncia.map((item) => item.registro.id)).toContain("flavio-bolsonaro-2022-tribunal-rejeita-denuncia");
  });
});
