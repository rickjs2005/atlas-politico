// O Escrivão, o guia fictício do jogo (src/lib/game/escrivao, D-127 e D-133):
// uma instrução curta e, no máximo, uma fala de humor; nenhum humor em
// contexto sensível; sem sorteio; e nenhuma fala repete fato, cita pessoa ou
// partido, nem traz juízo.

import { describe, expect, it } from "vitest";

import { readSources, resolvePaths } from "@/lib/content/sources";
import { PROFILES } from "@/lib/domain/profiles";
import { buildGameContent } from "@/lib/game/content";
import { CATALOGO, ESCRIVAO_EVENTS, ESCRIVAO_NOME, ESCRIVAO_ROTULO, INSTRUCAO_MAXIMA, MINIMO_DE_HUMOR, candidatas, daVez, falasVisiveis, selectLines, validateCatalog, type Fala } from "@/lib/game/escrivao";
import { ROOM_IDS } from "@/lib/game/rooms";
import { buildAtlasData } from "@/lib/publication/build";

const fala = (id: string, sala: Fala["sala"], evento: Fala["evento"], camada: Fala["camada"], texto: string): Fala => ({ id, sala, evento, camada, texto });

describe("catálogo do Escrivão", () => {
  it("passa na validação inteira", () => {
    expect(validateCatalog(CATALOGO)).toEqual([]);
  });

  it("só tem duas camadas: instrução e humor; a camada que repetia dados do registro não existe mais", () => {
    expect([...new Set(CATALOGO.map((item) => item.camada))].sort()).toEqual(["humor", "instrucao"]);
    for (const item of CATALOGO) {
      expect(item.texto, item.id).not.toMatch(/\{[a-zA-Z]+\}/);
      expect(item.texto, item.id).not.toMatch(/\b(?:1[89]|20)\d{2}\b/);
    }
  });

  it("toda sala tem instrução própria em todo momento, e humor suficiente para a rotação não repetir na hora", () => {
    for (const evento of ESCRIVAO_EVENTS) {
      for (const sala of ROOM_IDS) {
        expect(candidatas(CATALOGO, sala, evento, "instrucao").length, `${evento} ${sala}`).toBeGreaterThan(0);
        expect(candidatas(CATALOGO, sala, evento, "humor").length, `${evento} ${sala}`).toBeGreaterThanOrEqual(MINIMO_DE_HUMOR);
      }
    }
  });

  it("a instrução é curta, e o humor é igual para os dois personagens: o catálogo não tem fala por pessoa", () => {
    for (const item of CATALOGO.filter((outro) => outro.camada === "instrucao")) expect(item.texto.length, item.id).toBeLessThanOrEqual(INSTRUCAO_MAXIMA);
    for (const item of CATALOGO) {
      expect(Object.keys(item).sort(), item.id).toEqual(["camada", "evento", "id", "sala", "texto"]);
      expect(item.texto, item.id).not.toMatch(/\b(lula|bolsonaro|fl[aá]vio)\b/i);
    }
    expect(ESCRIVAO_NOME).toBe("Escrivão");
    expect(ESCRIVAO_ROTULO).toContain("fictício");
  });

  it("a validação acusa o que o jogo não promete: pessoa, partido, fala atribuída, juízo, data, campo a preencher e instrução longa", () => {
    const base = CATALOGO.filter((item) => item.sala === "todas");
    const com = (texto: string, camada: Fala["camada"] = "humor") => validateCatalog([...CATALOGO, fala("teste-1", "todas", "entrada", camada, texto)]).filter((linha) => linha.startsWith("fala teste-1"));
    expect(com("O PT deixou uma pasta aqui.")).toEqual(["fala teste-1: cita pessoa, partido ou lado; o Escrivão não fala das pessoas retratadas."]);
    expect(com("Ele disse que vinha buscar a pasta.")).toEqual(["fala teste-1: atribui fala a alguém."]);
    expect(com("Esta é a melhor pasta do arquivo.")).toEqual(["fala teste-1: traz juízo de valor."]);
    // Outra pessoa, mesmo inventada, fica fora do humor: conforme a fase, a piada viraria recado sobre uma das pessoas retratadas.
    expect(com("Foi a estagiária que nunca existiu.")).toEqual(["fala teste-1: piada com outra pessoa; o humor é sobre a papelada e sobre o próprio Escrivão."]);
    expect(com("O funcionário do mês é o carimbo.")).toEqual(["fala teste-1: piada com outra pessoa; o humor é sobre a papelada e sobre o próprio Escrivão."]);
    // As duas trilhas começam pelo nascimento, e em uma delas os documentos divergem sobre o dia: piada de aniversário, ali, vira comentário.
    expect(com("Eu já comemorei um aniversário no mês errado.")).toEqual(["fala teste-1: piada com nascimento ou aniversário; conforme a fase, vira comentário sobre a pessoa retratada."]);
    expect(com("Nasci para arquivar, e arquivo mal.")).toEqual(["fala teste-1: piada com nascimento ou aniversário; conforme a fase, vira comentário sobre a pessoa retratada."]);
    expect(com("O aniversariante do arquivo é o grampeador.")).toEqual(["fala teste-1: piada com nascimento ou aniversário; conforme a fase, vira comentário sobre a pessoa retratada."]);
    expect(com("Esta pasta é de 1989.")).toEqual(["fala teste-1: ano ou data; o Escrivão não escreve fato."]);
    expect(com("Abra {titulo}.")).toEqual(["fala teste-1: campo a preencher; o Escrivão não repete dado do registro."]);
    expect(com("Uma pasta — e um carimbo.")).toEqual(["fala teste-1: travessão ou meia-risca; o projeto não os usa."]);
    expect(com("x".repeat(INSTRUCAO_MAXIMA + 1), "instrucao")).toEqual([`fala teste-1: instrução longa demais (mais de ${INSTRUCAO_MAXIMA} caracteres).`]);
    expect(validateCatalog([...base, base[0]!])).toContain(`fala ${base[0]!.id}: identificador repetido.`);
    // Sem o reserva de um momento, a validação diz qual falta.
    expect(validateCatalog(CATALOGO.filter((item) => !(item.evento === "erro" && item.sala === "todas" && item.camada === "instrucao")))).toContain('evento erro: sem instrução de reserva (sala "todas").');
  });
});

describe("seleção das falas", () => {
  it("cada momento tem uma instrução e, no máximo, uma fala de humor, nessa ordem", () => {
    for (const sala of ROOM_IDS) {
      for (const evento of ESCRIVAO_EVENTS) {
        for (let vez = 0; vez < 12; vez += 1) {
          const ditas = selectLines({ sala, evento, humor: true, vez });
          expect(ditas.map((item) => item.camada), `${sala} ${evento} ${vez}`).toEqual(["instrucao", "humor"]);
          expect(selectLines({ sala, evento, humor: false, vez }).map((item) => item.camada)).toEqual(["instrucao"]);
        }
      }
    }
  });

  it("não há sorteio: o mesmo momento dá sempre as mesmas falas", () => {
    const momento = { sala: "historico", evento: "entrada", humor: true, vez: 4 } as const;
    expect(selectLines(momento)).toEqual(selectLines({ ...momento }));
    expect(selectLines(momento)).toEqual(selectLines(momento, CATALOGO));
  });

  it("o humor roda pela vez: fases seguidas não repetem a mesma fala, e a rotação volta ao começo", () => {
    const humorDa = (vez: number) => selectLines({ sala: "historico", evento: "entrada", humor: true, vez })[1]!.id;
    const quantas = candidatas(CATALOGO, "historico", "entrada", "humor").length;
    expect(humorDa(0)).not.toBe(humorDa(1));
    expect(humorDa(1)).not.toBe(humorDa(2));
    expect(humorDa(quantas)).toBe(humorDa(0));
    expect(daVez([], 3)).toBeNull();
    // Vez negativa ou quebrada não sai da lista.
    const opcoes = candidatas(CATALOGO, "historico", "erro", "humor");
    expect(opcoes).toContain(daVez(opcoes, -1));
    expect(opcoes).toContain(daVez(opcoes, 2.7));
  });

  it("em contexto sensível não há humor, mesmo com a preferência ligada, e a instrução é a mesma", () => {
    for (const sala of ROOM_IDS) {
      for (const evento of ESCRIVAO_EVENTS) {
        const comum = selectLines({ sala, evento, humor: true, vez: 2 });
        const sensivel = selectLines({ sala, evento, humor: true, vez: 2, sensivel: true });
        expect(sensivel.map((item) => item.camada), `${sala} ${evento}`).toEqual(["instrucao"]);
        expect(sensivel[0]).toEqual(comum[0]);
      }
    }
  });

  it("a sala usa as falas dela; sem falas próprias, vale o reserva de todas as salas", () => {
    const catalogo = [
      fala("a", "todas", "entrada", "instrucao", "Instrução de reserva."),
      fala("b", "todas", "entrada", "humor", "Humor de reserva."),
      fala("c", "economia", "entrada", "instrucao", "Instrução da sala."),
    ];
    expect(selectLines({ sala: "economia", evento: "entrada", humor: true, vez: 0 }, catalogo).map((item) => item.id)).toEqual(["c", "b"]);
    expect(selectLines({ sala: "historico", evento: "entrada", humor: true, vez: 0 }, catalogo).map((item) => item.id)).toEqual(["a", "b"]);
    expect(selectLines({ sala: "historico", evento: "erro", humor: true, vez: 0 }, catalogo)).toEqual([]);
  });

  it("desligar o humor tira a fala de humor na hora, inclusive de falas já escolhidas", () => {
    const ditas = selectLines({ sala: "economia", evento: "conclusao", humor: true, vez: 1 });
    expect(falasVisiveis(ditas, true)).toEqual(ditas);
    expect(falasVisiveis(ditas, false).map((item) => item.camada)).toEqual(["instrucao"]);
  });
});

describe("o Escrivão nas fases publicadas", () => {
  const data = buildAtlasData(readSources(resolvePaths())).data!;

  it("as fases de processo judicial, prisão e violência são de contexto sensível para os dois personagens, e nelas não sai humor", () => {
    const sensiveis: string[] = [];
    for (const perfil of PROFILES) {
      for (const sala of ROOM_IDS) {
        for (const fase of buildGameContent(data, perfil.slug, sala)!.fases) {
          if (!fase.sensivel) continue;
          sensiveis.push(fase.id);
          for (const evento of ["entrada", "erro", "conclusao", "carimbo"] as const) {
            expect(selectLines({ sala, evento, humor: true, vez: fase.numero - 1, sensivel: fase.sensivel }).some((item) => item.camada === "humor"), `${fase.id} ${evento}`).toBe(false);
          }
        }
      }
    }
    expect(sensiveis.sort()).toEqual(["flavio-bolsonaro-processos", "lula-partido-e-constituinte", "lula-processos", "lula-retorno", "lula-seguranca-publica"]);
  });
});
