// A ficha judicial do jogo (src/lib/game/judicial.ts): a natureza de cada
// registro e as decisões relacionadas, por identificador. Nada inventado:
// todo identificador existe na edição e nas fases do mesmo personagem, os
// textos não atribuem fala a ninguém, e as decisões relacionadas saem em
// ordem cronológica. As fases de processos trazem juntas a acusação, a
// defesa, a decisão e o desfecho.

import { describe, expect, it } from "vitest";

import { readSources, resolvePaths } from "@/lib/content/sources";
import { findEventById } from "@/lib/data/queries";
import { PROFILES } from "@/lib/domain/profiles";
import { buildGameContent } from "@/lib/game/content";
import { JUDICIAL, JUDICIAL_KIND_LABEL, JUDICIAL_NOTICE, judicialOf, relatedRecords } from "@/lib/game/judicial";
import { ROOM_IDS } from "@/lib/game/rooms";
import { phaseRefs } from "@/lib/game/trail";
import { buildAtlasData } from "@/lib/publication/build";

const data = buildAtlasData(readSources(resolvePaths())).data!;

/** O personagem cujas fases apontam o acontecimento. */
const personagensDe = (eventId: string) =>
  PROFILES.filter((perfil) => ROOM_IDS.some((sala) => buildGameContent(data, perfil.slug, sala)!.fases.some((fase) => phaseRefs(fase).some((referencia) => referencia.tipo === "acontecimento" && referencia.id === eventId)))).map((perfil) => perfil.slug);

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
  it("todo episódio judicial das fases tem ficha, e não há ficha sem episódio", () => {
    expect(Object.keys(JUDICIAL).sort()).toEqual([...JUDICIAIS].sort());
    for (const id of JUDICIAIS) expect(judicialOf(id), id).not.toBeNull();
    expect(judicialOf("lula-1975-eleito-presidente-do-sindicato")).toBeNull();
  });

  it("todo identificador existe na edição e está em uma fase do mesmo personagem", () => {
    for (const [id, entrada] of Object.entries(JUDICIAL)) {
      expect(findEventById(data, id), id).not.toBeNull();
      const donos = personagensDe(id);
      expect(donos, `${id} em uma fase`).toHaveLength(1);
      for (const { id: outro } of entrada.relacionados) {
        expect(outro, `${id} relaciona a si mesmo`).not.toBe(id);
        expect(findEventById(data, outro), `${id} relaciona ${outro}`).not.toBeNull();
        expect(personagensDe(outro), `${id} relaciona ${outro}`).toEqual(donos);
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
    const lula = buildGameContent(data, "lula", "historico")!;
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
    const lula = buildGameContent(data, "lula", "historico")!;
    const daCondenacao = relatedRecords("lula-2017-condenacao-em-primeira-instancia", lula.registros);
    const anulacao = daCondenacao.find((item) => item.registro.id === "lula-2021-stf-anula-condenacoes");
    expect(anulacao).toBeDefined();
    expect(anulacao!.registro.data.valor).toBe("2021-03-08");
    const flavio = buildGameContent(data, "flavio-bolsonaro", "historico")!;
    const daDenuncia = relatedRecords("flavio-bolsonaro-2020-denuncia-do-ministerio-publico", flavio.registros);
    expect(daDenuncia.map((item) => item.registro.id)).toContain("flavio-bolsonaro-2022-tribunal-rejeita-denuncia");
  });
});

describe("as fases de processos, para os dois personagens", () => {
  const fasesDe = (slug: "lula" | "flavio-bolsonaro") => buildGameContent(data, slug, "historico")!.fases;
  const deProcessos = [fasesDe("lula").find((fase) => fase.id === "lula-processos")!, fasesDe("flavio-bolsonaro").find((fase) => fase.id === "flavio-bolsonaro-processos")!];

  it("cada trajetória tem uma fase de processos, de contexto sensível, na segunda metade da trilha e antes da eleição de 2026", () => {
    for (const fase of deProcessos) {
      expect(fase, "fase de processos").toBeDefined();
      expect(fase.sensivel, fase.id).toBe(true);
      expect(fase.numero, fase.id).toBeGreaterThan(4);
      expect(fase.numero, fase.id).toBeLessThan(9);
      expect(judicialOf(fase.marco.id), fase.id).not.toBeNull();
    }
  });

  it("a leitura curta traz juntas a acusação ou a condenação, a defesa, a decisão e o desfecho", () => {
    for (const fase of deProcessos) {
      const texto = fase.explicacao.map((bloco) => bloco.texto).join(" ");
      expect(texto, `${fase.id}: defesa`).toMatch(/A defesa (pediu|disse)/);
      expect(texto, `${fase.id}: acusação ou condenação`).toMatch(/denunciou|condenou/);
      expect(texto, `${fase.id}: decisão posterior`).toMatch(/anulou/);
      // O último bloco traz o que os registros têm de mais recente, e o marco da fase é o registro dele.
      const ultimo = fase.explicacao.at(-1)!;
      expect(ultimo.referencias.some((referencia) => referencia.id === fase.marco.id), fase.id).toBe(true);
      // O jogo diz o que a decisão é, e o que ela não é.
      const atividade = fase.atividade;
      expect(atividade.tipo, fase.id).toBe("ordem");
      expect(atividade.explicacao, fase.id).toMatch(/não é (absolver nem condenar|condenar nem absolver)/);
      expect(fase.conceitos, fase.id).toContain("anulacao");
    }
  });

  it("nenhuma das duas fases usa palavra de culpa ou de inocência, e o texto não adjetiva", () => {
    for (const fase of deProcessos) {
      const textos = [...fase.explicacao.map((bloco) => bloco.texto), fase.atividade.enunciado, fase.atividade.explicacao, fase.titulo, fase.objetivo];
      // Os nomes dos crimes da acusação (corrupção passiva, organização criminosa) são do registro; o que não entra é o juízo.
      for (const texto of textos) expect(texto, fase.id).not.toMatch(/\b(culpad[oa]s?|inocentes?|corrupt[oa]s?|bandid[oa]s?|perseguição|perseguid[oa]s?|injust[oa]s?|escândalo|absolvid[oa]s?|farsa|golpe)\b/i);
    }
  });

  it("o texto diz quem denunciou ou quem condenou, e não afirma o fato por conta própria", () => {
    const [lula, flavio] = deProcessos;
    const textoDe = (fase: (typeof deProcessos)[number]) => fase.explicacao.map((bloco) => bloco.texto).join(" ");
    expect(textoDe(lula!)).toMatch(/um juiz federal de Curitiba condenou Lula por/);
    expect(textoDe(lula!)).toMatch(/o STF anulou as condenações: entendeu que/);
    expect(textoDe(flavio!)).toMatch(/o Ministério Público do Rio denunciou Flávio Bolsonaro e outras pessoas por/);
    expect(textoDe(flavio!)).toContain("suposto esquema");
    // O que a decisão diz sobre novas investigações fica na explicação da atividade, com a origem; o que veio depois dela sai com o nome de quem noticiou.
    expect(flavio!.atividade.explicacao).toMatch(/segundo a decisão, isso não impede a retomada das investigações/);
    expect(textoDe(flavio!)).toContain("Segundo a CartaCapital, o Ministério Público recorreu, e um ministro do STF negou os recursos em fevereiro de 2025.");
  });
});
