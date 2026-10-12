// O Passaporte do Escrivão (src/lib/game/passport.ts, D-150): carimbos e selos
// derivados do progresso que o jogo já guarda. Os testes conferem o que o
// passaporte promete: abrir não dá carimbo e concluir dá, uma vez só; a
// leitura da explicação vale o mesmo que a resposta; cada pessoa tem a sua
// página, com as mesmas regras; os totais saem das fases publicadas; a frase
// que apresenta a fase seguinte é o objetivo que o conteúdo escreve; e o que
// a tela diz de um carimbo novo, para quem vê e para quem ouve, não elogia
// nem dá nota.

import { describe, expect, it } from "vitest";

import { stampStatusText, statusText } from "@/features/game/ui/status";
import { readSources, resolvePaths } from "@/lib/content/sources";
import { PROFILES } from "@/lib/domain/profiles";
import { buildGameContent, buildPassportPages, buildProgressKeys } from "@/lib/game/content";
import { selectLines } from "@/lib/game/escrivao";
import {
  PRIMEIROS_PASSOS,
  countLabel,
  countSpoken,
  countStamps,
  deepDivesOf,
  earnedBetween,
  isTrailStamped,
  nextPhaseSentence,
  pagePhases,
  sealsOf,
  stampAnnouncement,
  stampConfirmation,
  stampSlots,
  stampTurn,
  trailMarkers,
  trailOutcome,
  type PassportPage,
  type PassportPhase,
  type ProgressByCharacter,
} from "@/lib/game/passport";
import { initialProgress, openPhase, parseProgress, withPhase } from "@/lib/game/progress";
import { ROOM_IDS } from "@/lib/game/rooms";
import { answerQuestion, concludeByExplanation, initialPhaseProgress } from "@/lib/game/trail";
import type { PersonagemSlug, PhaseProgress, PlayerProgress } from "@/lib/game/types";
import { buildAtlasData } from "@/lib/publication/build";

const fase = (id: string, numero: number, sala: PassportPhase["sala"] = "historico"): PassportPhase => ({ id, sala, numero, titulo: `Fase ${id}`, periodo: { de: 2000 + numero, ate: 2001 + numero } });
const PAGINA_A: PassportPage = { personagem: "flavio-bolsonaro", nome: "Pessoa A", fases: [fase("a1", 1), fase("a2", 2), fase("a3", 3), fase("a-eco", 1, "economia")] };
const PAGINA_B: PassportPage = { personagem: "lula", nome: "Pessoa B", fases: [fase("b1", 1), fase("b2", 2), fase("b-seg", 1, "seguranca-publica")] };
const PAGINAS = [PAGINA_A, PAGINA_B];

const concluida = (como: "resposta" | "explicacao" = "resposta"): PhaseProgress => ({ vista: true, tentativas: como === "resposta" ? 1 : 0, concluida: como, assinatura: "x" });
const com = (personagem: PersonagemSlug, fases: Record<string, PhaseProgress>): PlayerProgress => ({ ...initialProgress(personagem), fases });

describe("carimbos", () => {
  it("abrir uma fase, ou tentar e errar, não dá carimbo; concluir dá, e é o mesmo pela resposta e pela explicação", () => {
    const progresso = com("flavio-bolsonaro", { a1: { vista: true, tentativas: 0 }, a2: { vista: true, tentativas: 3 }, a3: concluida("resposta"), "a-eco": concluida("explicacao") });
    const espacos = stampSlots(PAGINA_A.fases, progresso);
    expect(espacos.map((espaco) => [espaco.fase.id, espaco.carimbada])).toEqual([
      ["a1", false],
      ["a2", false],
      ["a3", true],
      ["a-eco", true],
    ]);
    expect(countStamps(PAGINA_A.fases, progresso)).toEqual({ total: 4, carimbadas: 2, faltam: 2 });
  });

  it("uma fase concluída é um carimbo só: concluir de novo, pela outra via, não acrescenta nada", () => {
    const umaFase = { id: "a1", atividade: { tipo: "pergunta" as const, enunciado: "?", opcoes: [{ id: "x", texto: "x" }, { id: "y", texto: "y" }], correta: "x", explicacao: "", referencias: [] } };
    const vazio = { registros: {}, decisoes: {}, fatos: {}, conceitos: {}, posicoes: {}, propostas: {} };
    const pelaExplicacao = concludeByExplanation(umaFase, initialPhaseProgress(), vazio);
    const depois = concludeByExplanation(umaFase, pelaExplicacao, vazio);
    expect(depois).toEqual(pelaExplicacao);
    const pelaResposta = answerQuestion(umaFase, initialPhaseProgress(), "x", vazio).estado;
    expect(concludeByExplanation(umaFase, pelaResposta, vazio)).toBe(pelaResposta);
    for (const estado of [pelaExplicacao, pelaResposta]) expect(countStamps([{ id: "a1" }], com("flavio-bolsonaro", { a1: estado })).carimbadas).toBe(1);
  });

  it("sem progresso lido, a caderneta está em branco, com o total das fases dadas", () => {
    expect(countStamps(PAGINA_B.fases, undefined)).toEqual({ total: 3, carimbadas: 0, faltam: 3 });
    expect(stampSlots(PAGINA_B.fases, undefined).every((espaco) => !espaco.carimbada && espaco.estado === undefined)).toBe(true);
  });

  it("a contagem fala do que foi concluído, e não da fase em que a pessoa está", () => {
    expect(countLabel({ total: 9, carimbadas: 0, faltam: 9 })).toBe("Concluídas: 0 de 9 · faltam 9");
    expect(countLabel({ total: 9, carimbadas: 8, faltam: 1 })).toBe("Concluídas: 8 de 9 · falta 1");
    expect(countLabel({ total: 9, carimbadas: 9, faltam: 0 })).toBe("Concluídas: 9 de 9 · faltam 0");
    // Para quem ouve a página, a mesma contagem, sem o ponto mediano.
    expect(countSpoken({ total: 9, carimbadas: 8, faltam: 1 })).toBe("Concluídas: 8 de 9, falta 1");
    // Estar na fase 3 com uma só concluída: o marcador da 3 é o aberto, e só o da 1 tem carimbo.
    const progresso = openPhase(com("flavio-bolsonaro", { a1: concluida() }), { id: "a3", sala: "historico" });
    expect(trailMarkers(pagePhases(PAGINA_A, "historico"), progresso, "a3")).toEqual([
      { id: "a1", numero: 1, carimbada: true, aberta: false },
      { id: "a2", numero: 2, carimbada: false, aberta: false },
      { id: "a3", numero: 3, carimbada: false, aberta: true },
    ]);
  });

  it("uma conclusão que deixou de valer por correção do conteúdo deixa de ser carimbo", () => {
    const fases = [{ id: "a1", sala: "historico" as const }];
    const salvo = { versao: 6, personagem: "flavio-bolsonaro", fases: { a1: { vista: true, tentativas: 1, concluida: "resposta", assinatura: "a1:pergunta@velha" } }, posicao: {} };
    const lido = parseProgress(salvo, "flavio-bolsonaro", fases, { a1: "a1:pergunta@nova" })!;
    expect(lido.fases.a1!.reaberta).toBe(true);
    expect(countStamps(fases, lido).carimbadas).toBe(0);
  });

  it("o progresso de um formato anterior migra sem carimbo: o período visto não é a fase nova concluída", () => {
    const fases = [{ id: "lula-sindicato", sala: "historico" as const }];
    const antigo = { versao: 5, personagem: "lula", capitulos: { "lula-1-sindicato": { status: "concluido", coletados: [], tarefa: { concluida: true, tentativas: 1 } } } };
    const lido = parseProgress(antigo, "lula", fases, { "lula-sindicato": "qualquer" })!;
    expect(lido.fases["lula-sindicato"]).toEqual({ vista: false, tentativas: 0, anterior: true });
    expect(countStamps(fases, lido)).toEqual({ total: 1, carimbadas: 0, faltam: 1 });
    expect(stampSlots([{ id: "lula-sindicato", sala: "historico", numero: 1, titulo: "t", periodo: { de: 1975, ate: 1980 } }], lido)[0]!.carimbada).toBe(false);
  });
});

describe("selos", () => {
  const selos = (progressos: ProgressByCharacter) => Object.fromEntries(sealsOf(PAGINAS, progressos).map((selo) => [selo.id, selo.obtido]));

  it("sem carimbos não há selo, e os três aparecem sempre, com o nome e a regra", () => {
    const lista = sealsOf(PAGINAS, {});
    expect(lista.map((selo) => selo.nome)).toEqual(["Primeiros passos", "Trajetória percorrida", "Duas trajetórias"]);
    expect(lista.every((selo) => !selo.obtido && selo.regra.length > 0)).toBe(true);
    expect(lista[0]!.regra).toContain(String(PRIMEIROS_PASSOS));
  });

  it("primeiros passos conta as fases concluídas das duas pessoas, e não as abertas", () => {
    expect(selos({ "flavio-bolsonaro": com("flavio-bolsonaro", { a1: concluida(), a2: { vista: true, tentativas: 0 } }), lula: com("lula", { b1: concluida() }) })["primeiros-passos"]).toBe(false);
    expect(selos({ "flavio-bolsonaro": com("flavio-bolsonaro", { a1: concluida(), "a-eco": concluida("explicacao") }), lula: com("lula", { b1: concluida() }) })["primeiros-passos"]).toBe(true);
  });

  it("trajetória percorrida pede todas as fases da trajetória de uma pessoa, e os aprofundamentos não contam", () => {
    const quase = com("lula", { b1: concluida(), "b-seg": concluida() });
    expect(isTrailStamped(PAGINA_B, quase)).toBe(false);
    expect(selos({ lula: quase })["trajetoria-percorrida"]).toBe(false);
    const inteira = com("lula", { b1: concluida(), b2: concluida("explicacao") });
    expect(isTrailStamped(PAGINA_B, inteira)).toBe(true);
    expect(selos({ lula: inteira })).toEqual({ "primeiros-passos": false, "trajetoria-percorrida": true, "duas-trajetorias": false });
  });

  it("duas trajetórias pede as duas, com a mesma regra para as duas pessoas", () => {
    const a = com("flavio-bolsonaro", { a1: concluida(), a2: concluida(), a3: concluida() });
    const b = com("lula", { b1: concluida(), b2: concluida() });
    expect(selos({ "flavio-bolsonaro": a })["duas-trajetorias"]).toBe(false);
    expect(selos({ lula: b })["duas-trajetorias"]).toBe(false);
    expect(selos({ "flavio-bolsonaro": a, lula: b })).toEqual({ "primeiros-passos": true, "trajetoria-percorrida": true, "duas-trajetorias": true });
    // Uma página sozinha nunca dá o selo das duas.
    expect(sealsOf([PAGINA_A], { "flavio-bolsonaro": a }).find((selo) => selo.id === "duas-trajetorias")!.obtido).toBe(false);
  });

  it("o selo novo é o que não havia antes do carimbo: é anunciado uma vez, com o carimbo que o trouxe", () => {
    const antes = sealsOf(PAGINAS, { lula: com("lula", { b1: concluida() }) });
    const depois = sealsOf(PAGINAS, { lula: com("lula", { b1: concluida(), b2: concluida() }) });
    expect(earnedBetween(antes, depois).map((selo) => selo.id)).toEqual(["trajetoria-percorrida"]);
    expect(earnedBetween(depois, depois)).toEqual([]);
  });
});

describe("o que a tela diz", () => {
  it("a confirmação fala do caminho: o primeiro marco, a contagem e a sala percorrida", () => {
    expect(stampConfirmation("trajetoria", { total: 9, carimbadas: 1, faltam: 8 }, false)).toBe("Primeiro marco registrado.");
    expect(stampConfirmation("trajetoria", { total: 9, carimbadas: 4, faltam: 5 }, false)).toBe("Marco registrado: 4 de 9.");
    expect(stampConfirmation("trajetoria", { total: 9, carimbadas: 9, faltam: 0 }, false)).toBe("Trajetória percorrida: todos os marcos registrados.");
    expect(stampConfirmation("aprofundamento", { total: 1, carimbadas: 1, faltam: 0 }, false)).toBe("Aprofundamento percorrido: marco registrado.");
  });

  it("em fase de contexto sensível a confirmação é sóbria, e nenhuma confirmação elogia, dá nota ou fala de acerto", () => {
    const sobria = stampConfirmation("trajetoria", { total: 9, carimbadas: 7, faltam: 2 }, true);
    expect(sobria).toBe("Fase registrada no seu passaporte. Concluídas: 7 de 9.");
    const todas = [
      sobria,
      stampConfirmation("trajetoria", { total: 9, carimbadas: 9, faltam: 0 }, true),
      stampConfirmation("trajetoria", { total: 9, carimbadas: 1, faltam: 8 }, false),
      stampConfirmation("trajetoria", { total: 9, carimbadas: 5, faltam: 4 }, false),
      stampConfirmation("trajetoria", { total: 9, carimbadas: 9, faltam: 0 }, false),
      stampConfirmation("aprofundamento", { total: 1, carimbadas: 1, faltam: 0 }, false),
      ...sealsOf(PAGINAS, {}).flatMap((selo) => [selo.nome, selo.regra]),
    ];
    for (const texto of todas) expect(texto, texto).not.toMatch(/parab[ée]ns|trof[ée]u|medalha|pontos|pontua|ranking|vencedor|nota|acert|melhor|pior|inteligen/i);
  });

  it("a linha de aviso de um carimbo novo diz a fase, a confirmação e os selos que vieram, uma vez cada", () => {
    expect(stampAnnouncement("Fase a1", "Primeiro marco registrado.", [])).toBe("Carimbo no passaporte: Fase a1. Primeiro marco registrado.");
    expect(stampAnnouncement("Fase a3", "Marco registrado: 3 de 9.", [{ nome: "Primeiros passos" }])).toBe(
      "Carimbo no passaporte: Fase a3. Marco registrado: 3 de 9. Selo novo no passaporte: Primeiros passos.",
    );
    const comDois = stampAnnouncement("Fase b2", "Trajetória percorrida: todos os marcos registrados.", [{ nome: "Trajetória percorrida" }, { nome: "Duas trajetórias" }]);
    expect(comDois.match(/Selo novo no passaporte/g)).toHaveLength(2);
    expect(comDois.endsWith("Selo novo no passaporte: Duas trajetórias.")).toBe(true);
  });

  it("no espaço vazio da caderneta, a fase aberta e não concluída não aparece como explicação lida", () => {
    // Na lista de fases, a situação de uma fase só aberta é "explicação lida". Na caderneta, ler a explicação é o nome de um caminho para o carimbo.
    const aberta: PhaseProgress = { vista: true, tentativas: 2 };
    expect(statusText(aberta)).toBe("explicação lida");
    expect(stampStatusText(aberta)).toBe("aberta, ainda não concluída");
    // As outras situações são as mesmas nas duas telas.
    for (const estado of [undefined, { vista: false, tentativas: 0 }, { vista: false, tentativas: 0, anterior: true }, { vista: true, tentativas: 1, reaberta: true }] as const) {
      expect(stampStatusText(estado)).toBe(statusText(estado));
    }
    expect(stampStatusText({ vista: false, tentativas: 0, anterior: true })).toBe("período visto na versão anterior");
  });

  it("o fim de uma trajetória sabe o que falta nela e como estão as outras", () => {
    const a = com("flavio-bolsonaro", { a1: concluida(), a2: concluida(), a3: concluida() });
    expect(trailOutcome(PAGINAS, { "flavio-bolsonaro": com("flavio-bolsonaro", { a3: concluida() }) }, "flavio-bolsonaro")).toEqual({
      percorrida: false,
      faltam: 2,
      outras: [{ personagem: "lula", nome: "Pessoa B", percorrida: false }],
      todasPercorridas: false,
    });
    expect(trailOutcome(PAGINAS, { "flavio-bolsonaro": a }, "flavio-bolsonaro")).toMatchObject({ percorrida: true, faltam: 0, todasPercorridas: false });
    expect(trailOutcome(PAGINAS, { "flavio-bolsonaro": a, lula: com("lula", { b1: concluida(), b2: concluida() }) }, "lula")).toEqual({
      percorrida: true,
      faltam: 0,
      outras: [{ personagem: "flavio-bolsonaro", nome: "Pessoa A", percorrida: true }],
      todasPercorridas: true,
    });
  });

  it("os aprofundamentos oferecidos no fim são os das duas pessoas, com os anos das fases deles", () => {
    expect(deepDivesOf(PAGINAS)).toEqual([
      { personagem: "flavio-bolsonaro", nome: "Pessoa A", sala: "economia", periodo: { de: 2001, ate: 2002 } },
      { personagem: "lula", nome: "Pessoa B", sala: "seguranca-publica", periodo: { de: 2001, ate: 2002 } },
    ]);
  });
});

describe("o passaporte sobre o conteúdo publicado", () => {
  const data = buildAtlasData(readSources(resolvePaths())).data!;
  const paginas = buildPassportPages(data);

  it("há uma página por pessoa, na ordem dos perfis, com todas as fases publicadas dela e nenhuma a mais", () => {
    expect(paginas.map((pagina) => pagina.personagem)).toEqual(PROFILES.map((perfil) => perfil.slug));
    for (const pagina of paginas) {
      const publicadas = ROOM_IDS.flatMap((sala) => buildGameContent(data, pagina.personagem, sala)!.fases);
      expect(pagina.fases.map((item) => item.id)).toEqual(publicadas.map((item) => item.id));
      expect(pagina.fases.map((item) => [item.sala, item.numero, item.titulo, item.periodo])).toEqual(publicadas.map((item) => [item.sala, item.numero, item.titulo, item.periodo]));
      // O progresso guardado conhece as mesmas fases: um carimbo nunca aponta fase que o salvo não lê.
      expect(buildProgressKeys(data, pagina.personagem).fases.map((item) => item.id)).toEqual(pagina.fases.map((item) => item.id));
    }
  });

  it("as duas páginas têm a mesma forma: uma trajetória e os mesmos aprofundamentos", () => {
    const forma = paginas.map((pagina) => ROOM_IDS.map((sala) => (pagePhases(pagina, sala).length > 0 ? sala : null)));
    expect(new Set(forma.map((item) => JSON.stringify(item))).size).toBe(1);
    expect(deepDivesOf(paginas).map((item) => `${item.personagem}:${item.sala}`)).toEqual(paginas.flatMap((pagina) => ROOM_IDS.filter((sala) => sala !== "historico" && pagePhases(pagina, sala).length > 0).map((sala) => `${pagina.personagem}:${sala}`)));
  });

  it("com todas as fases concluídas, cada página fica com todos os carimbos e os três selos saem", () => {
    const tudo: Record<string, PlayerProgress> = {};
    for (const pagina of paginas) {
      let progresso = initialProgress(pagina.personagem);
      for (const item of pagina.fases) progresso = withPhase(progresso, item.id, concluida("explicacao"));
      tudo[pagina.personagem] = progresso;
      expect(countStamps(pagina.fases, progresso)).toEqual({ total: pagina.fases.length, carimbadas: pagina.fases.length, faltam: 0 });
    }
    expect(sealsOf(paginas, tudo).every((selo) => selo.obtido)).toBe(true);
  });

  it("a frase da fase seguinte é o objetivo publicado, que começa por um dos verbos que a frase aceita e termina em ponto", () => {
    // A tela escreve "Na próxima fase, você vai" e, em seguida, o objetivo. Só um verbo no infinitivo cabe ali, e a lista é
    // fechada de propósito: um objetivo que comece por outra palavra reprova até alguém ler a frase inteira e pôr o verbo aqui.
    const VERBOS = ["acompanhar", "entender", "ler", "saber", "ver"];
    for (const perfil of PROFILES) {
      for (const sala of ROOM_IDS) {
        for (const item of buildGameContent(data, perfil.slug, sala)!.fases) {
          expect(VERBOS, item.id).toContain(item.objetivo.split(/[\s,]/)[0]);
          expect(item.objetivo.trim().endsWith("."), item.id).toBe(true);
          expect(nextPhaseSentence(item)).toBe(`Na próxima fase, você vai ${item.objetivo}`);
        }
      }
    }
  });

  it("o Escrivão tem fala para o carimbo em toda sala, sem humor nas fases de contexto sensível", () => {
    for (const perfil of PROFILES) {
      for (const sala of ROOM_IDS) {
        for (const item of buildGameContent(data, perfil.slug, sala)!.fases) {
          const ditas = selectLines({ sala, evento: "carimbo", humor: true, vez: item.numero - 1, sensivel: item.sensivel });
          expect(ditas[0]?.camada, item.id).toBe("instrucao");
          expect(ditas.some((fala) => fala.camada === "humor"), item.id).toBe(!item.sensivel);
        }
      }
    }
  });

  it("no catálogo, a primeira fala de humor do carimbo não diz que é mais um, e três vezes seguidas trazem três falas", () => {
    for (const sala of ROOM_IDS) {
      const humorDaVez = (vez: number) => selectLines({ sala, evento: "carimbo", humor: true, vez, sensivel: false }).find((fala) => fala.camada === "humor")!.texto;
      // A vez zero é a do primeiro carimbo da pessoa: a confirmação diz "Primeiro marco registrado", e a fala ao lado não pode contar carimbos.
      expect(humorDaVez(0).toLowerCase(), sala).not.toContain("mais um");
      expect(new Set([humorDaVez(0), humorDaVez(1), humorDaVez(2)]).size, sala).toBe(3);
    }
  });

  it("a vez da fala do carimbo é a ordem dele entre os carimbos da pessoa, em todas as salas, e não a posição da fase", () => {
    // A página A tem três fases de trajetória e um aprofundamento de fase única.
    const daPessoa = PAGINA_A.fases;
    // O primeiro carimbo, dado na terceira fase: a vez é zero, e não dois.
    expect(stampTurn(daPessoa, com("flavio-bolsonaro", { a3: concluida() }))).toBe(0);
    // O aprofundamento de fase única, depois de duas fases da trajetória: a vez é dois, e não zero.
    expect(stampTurn(daPessoa, com("flavio-bolsonaro", { a1: concluida(), a2: concluida("resposta"), "a-eco": concluida() }))).toBe(2);
    // Fase só aberta não conta, e sem carimbo nenhum a vez não fica negativa.
    expect(stampTurn(daPessoa, com("flavio-bolsonaro", { a1: { vista: true, tentativas: 1 }, a2: concluida() }))).toBe(0);
    expect(stampTurn(daPessoa, undefined)).toBe(0);
    // Dois carimbos seguidos nunca têm a mesma vez: dois aprofundamentos de fase única não repetem a fala.
    const umAprofundamento = com("lula", { "b-seg": concluida() });
    const maisUmaFase = com("lula", { "b-seg": concluida(), b1: concluida() });
    expect(stampTurn(PAGINA_B.fases, maisUmaFase)).toBe(stampTurn(PAGINA_B.fases, umAprofundamento) + 1);
  });
});
