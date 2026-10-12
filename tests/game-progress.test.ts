// O progresso do jogador na trilha (src/lib/game/progress.ts, D-135): o que
// foi lido e respondido em cada fase, onde a pessoa parou em cada sala, a
// leitura tolerante do que está salvo e a migração dos formatos anteriores,
// que não apaga nada e não dá por aprendido o que a pessoa não leu.

import { describe, expect, it } from "vitest";

import { readSources, resolvePaths } from "@/lib/content/sources";
import { PROFILES } from "@/lib/domain/profiles";
import { buildProgressKeys } from "@/lib/game/content";
import { LEGACY_CHAPTER_PHASES, LEGACY_VERSIONS, phasesOfLegacy, readLegacy } from "@/lib/game/legacy";
import {
  countDone,
  firstUnseen,
  hasNewStart,
  hasStarted,
  initialProgress,
  isTrailComplete,
  nextPhase,
  openPhase,
  parseProgress,
  phaseProgressOf,
  resumePhase,
  withPhase,
  withPosition,
  type PhaseKey,
} from "@/lib/game/progress";
import { initialPhaseProgress } from "@/lib/game/trail";
import { PROGRESS_VERSION, type PhaseProgress, type PlayerProgress } from "@/lib/game/types";
import { buildAtlasData } from "@/lib/publication/build";

const TRILHA: PhaseKey[] = [
  { id: "t1", sala: "historico" },
  { id: "t2", sala: "historico" },
  { id: "t3", sala: "historico" },
  { id: "t4", sala: "historico" },
];
const SALA: PhaseKey[] = [{ id: "e1", sala: "economia" }];
const TODAS = [...TRILHA, ...SALA];
const ASSINATURAS: Record<string, string> = Object.fromEntries(TODAS.map((fase) => [fase.id, `${fase.id}:pergunta@00000001`]));

const concluida = (id: string, como: "resposta" | "explicacao" = "resposta"): PhaseProgress => ({ vista: true, tentativas: 1, concluida: como, assinatura: ASSINATURAS[id]! });
const com = (fases: Record<string, PhaseProgress>, posicao: PlayerProgress["posicao"] = {}): PlayerProgress => ({ ...initialProgress("lula"), fases, posicao });

describe("progresso de uma trilha", () => {
  it("começa vazio, na versão atual do formato", () => {
    expect(initialProgress("lula")).toEqual({ versao: PROGRESS_VERSION, personagem: "lula", fases: {}, posicao: {} });
    expect(PROGRESS_VERSION).toBe(6);
    expect(phaseProgressOf(initialProgress("lula"), "t1")).toEqual(initialPhaseProgress());
  });

  it("abrir uma fase a marca como vista e leva a posição da sala para ela, sem concluir nada", () => {
    const aberto = openPhase(initialProgress("lula"), TRILHA[1]!);
    expect(aberto.fases).toEqual({ t2: { vista: true, tentativas: 0 } });
    expect(aberto.posicao).toEqual({ historico: "t2" });
    // A posição de uma sala não mexe na de outra.
    const naSala = openPhase(aberto, SALA[0]!);
    expect(naSala.posicao).toEqual({ historico: "t2", economia: "e1" });
    expect(countDone(naSala, TODAS)).toBe(0);
  });

  it("ir a uma fase é navegação: mudar a posição não muda o que foi lido ou respondido", () => {
    const antes = com({ t1: concluida("t1") }, { historico: "t1" });
    const depois = withPosition(antes, TRILHA[3]!);
    expect(depois.fases).toBe(antes.fases);
    expect(depois.posicao).toEqual({ historico: "t4" });
    expect(withPosition(depois, TRILHA[3]!)).toBe(depois);
    expect(withPhase(antes, "t1", antes.fases.t1!)).toBe(antes);
  });

  it("nenhuma fase segura a seguinte: a seguinte existe mesmo sem a atual concluída", () => {
    expect(nextPhase(TRILHA, "t1")).toEqual(TRILHA[1]);
    expect(nextPhase(TRILHA, "t4")).toBeNull();
    expect(nextPhase(TRILHA, "nao-existe")).toBeNull();
  });

  it("conta o que foi concluído, pela resposta ou pela leitura da explicação", () => {
    const progresso = com({ t1: concluida("t1"), t2: concluida("t2", "explicacao"), t3: { vista: true, tentativas: 2 } });
    expect(countDone(progresso, TRILHA)).toBe(2);
    expect(isTrailComplete(progresso, TRILHA)).toBe(false);
    expect(isTrailComplete(com(Object.fromEntries(TRILHA.map((fase) => [fase.id, concluida(fase.id, "explicacao")]))), TRILHA)).toBe(true);
    expect(isTrailComplete(initialProgress("lula"), [])).toBe(false);
  });

  it("sabe se a pessoa já fez algo nas fases dadas, sem confundir uma sala com outra", () => {
    expect(hasStarted(initialProgress("lula"), TODAS)).toBe(false);
    const soNaSala = com({ e1: { vista: true, tentativas: 0 } });
    expect(hasStarted(soNaSala, SALA)).toBe(true);
    expect(hasStarted(soNaSala, TRILHA)).toBe(false);
    expect(hasStarted(com({ t2: { vista: false, tentativas: 0, anterior: true } }), TRILHA)).toBe(true);
    expect(hasStarted(com({ t2: { vista: false, tentativas: 1 } }), TRILHA)).toBe(true);
  });
});

describe("onde continuar", () => {
  it("sem nada guardado, a trilha começa pela primeira fase: a origem", () => {
    expect(resumePhase(initialProgress("lula"), TRILHA)).toEqual(TRILHA[0]);
    expect(resumePhase(initialProgress("lula"), [])).toBeNull();
    // Progresso em outra sala não muda o começo da trajetória.
    expect(resumePhase(com({ e1: concluida("e1") }, { economia: "e1" }), TRILHA)).toEqual(TRILHA[0]);
  });

  it("volta à fase em que a pessoa parou, se ela não foi concluída", () => {
    expect(resumePhase(com({ t3: { vista: true, tentativas: 1 } }, { historico: "t3" }), TRILHA)).toEqual(TRILHA[2]);
  });

  it("com a fase em que parou já concluída, vai à primeira não concluída depois dela", () => {
    const progresso = com({ t1: concluida("t1"), t2: concluida("t2"), t3: concluida("t3") }, { historico: "t2" });
    expect(resumePhase(progresso, TRILHA)).toEqual(TRILHA[3]);
    // As fases anteriores que ficaram para trás não puxam a pessoa de volta.
    expect(resumePhase(com({ t3: concluida("t3") }, { historico: "t3" }), TRILHA)).toEqual(TRILHA[3]);
  });

  it("com tudo concluído, fica na última: é de onde se chega ao resumo", () => {
    const tudo = com(Object.fromEntries(TRILHA.map((fase) => [fase.id, concluida(fase.id)])), { historico: "t2" });
    expect(resumePhase(tudo, TRILHA)).toEqual(TRILHA[3]);
  });

  it("a primeira fase ainda não aberta é o que a entrada oferece em Ver desde o início", () => {
    expect(firstUnseen(initialProgress("lula"), TRILHA)).toEqual(TRILHA[0]);
    expect(firstUnseen(com({ t1: concluida("t1"), t2: { vista: true, tentativas: 0 } }), TRILHA)).toEqual(TRILHA[2]);
    // A marca de um formato anterior não é leitura: a fase continua por abrir.
    expect(firstUnseen(com({ t1: { vista: false, tentativas: 0, anterior: true } }), TRILHA)).toEqual(TRILHA[0]);
    expect(firstUnseen(com(Object.fromEntries(TRILHA.map((fase) => [fase.id, concluida(fase.id)]))), TRILHA)).toBeNull();
  });
});

describe("leitura do que está salvo", () => {
  const ler = (valor: unknown) => parseProgress(valor, "lula", TODAS, ASSINATURAS);

  it("o que foi gravado volta igual", () => {
    const progresso = com({ t1: concluida("t1"), t2: { vista: true, tentativas: 3 }, e1: concluida("e1", "explicacao") }, { historico: "t2", economia: "e1" });
    expect(ler(JSON.parse(JSON.stringify(progresso)))).toEqual(progresso);
  });

  it("dado inválido vira começo, e não erro na tela", () => {
    for (const invalido of [null, undefined, 3, "texto", [], { versao: PROGRESS_VERSION }, { versao: 99, personagem: "lula", fases: {}, posicao: {} }]) expect(ler(invalido), JSON.stringify(invalido)).toBeNull();
    expect(ler({ versao: PROGRESS_VERSION, personagem: "flavio-bolsonaro", fases: {}, posicao: {} })).toBeNull();
    expect(ler({ versao: PROGRESS_VERSION, personagem: "lula", fases: { t1: { vista: "sim", tentativas: 0 } }, posicao: {} })).toBeNull();
    expect(ler({ versao: PROGRESS_VERSION, personagem: "lula", fases: { t1: { vista: true, tentativas: -1 } }, posicao: {} })).toBeNull();
    expect(ler({ versao: PROGRESS_VERSION, personagem: "lula", fases: { t1: { vista: true, tentativas: 0, concluida: "trofeu" } }, posicao: {} })).toBeNull();
    expect(ler({ versao: PROGRESS_VERSION, personagem: "lula", fases: {}, posicao: { historico: 3 } })).toBeNull();
  });

  it("fase que a edição não tem mais é descartada, e a posição só fica se a fase ainda é daquela sala", () => {
    const lido = ler({
      versao: PROGRESS_VERSION,
      personagem: "lula",
      fases: { t1: { vista: true, tentativas: 0 }, "fase-antiga": { vista: true, tentativas: 0 } },
      posicao: { historico: "e1", economia: "e1", "seguranca-publica": "fase-antiga" },
    });
    expect(lido).toEqual(com({ t1: { vista: true, tentativas: 0 } }, { economia: "e1" }));
  });

  it("se uma correção mudou o que decide a resposta, só aquela fase é reaberta; o que a pessoa leu e tentou fica", () => {
    const salvo = { versao: PROGRESS_VERSION, personagem: "lula", fases: { t1: { vista: true, tentativas: 2, concluida: "resposta", assinatura: "t1:pergunta@ffffffff" }, t2: concluida("t2") }, posicao: { historico: "t2" } };
    const lido = ler(salvo)!;
    expect(lido.fases.t1).toEqual({ vista: true, tentativas: 2, reaberta: true });
    expect(lido.fases.t2).toEqual(concluida("t2"));
    // A marca continua enquanto a fase não é concluída de novo.
    expect(ler(JSON.parse(JSON.stringify(lido)))!.fases.t1).toEqual({ vista: true, tentativas: 2, reaberta: true });
    // Conclusão sem assinatura (salvo adulterado ou incompleto) também não vale.
    expect(ler({ ...salvo, fases: { t1: { vista: true, tentativas: 0, concluida: "explicacao" } } })!.fases.t1).toEqual({ vista: true, tentativas: 0, reaberta: true });
  });
});

describe("migração dos formatos anteriores", () => {
  const data = buildAtlasData(readSources(resolvePaths())).data!;
  const chavesDe = (slug: "lula" | "flavio-bolsonaro") => buildProgressKeys(data, slug);

  const antigo = (versao: number, personagem: string, concluidos: string[], outros: Record<string, unknown> = {}) => ({
    versao,
    personagem,
    capitulos: { ...Object.fromEntries(concluidos.map((id) => [id, { status: "concluido", coletados: ["a", "b"], tarefa: { tentativas: 2, concluida: true } }])), ...outros },
  });

  it("a tabela de capítulos antigos só aponta fases que existem na edição, do mesmo personagem", () => {
    const fasesDe = Object.fromEntries(PROFILES.map((perfil) => [perfil.slug, new Set(chavesDe(perfil.slug).fases.map((fase) => fase.id))]));
    for (const [capitulo, fases] of Object.entries(LEGACY_CHAPTER_PHASES)) {
      const slug = capitulo.startsWith("lula-") ? "lula" : "flavio-bolsonaro";
      expect(fases.length, capitulo).toBeGreaterThan(0);
      for (const id of fases) expect(fasesDe[slug]!.has(id), `${capitulo} aponta ${id}`).toBe(true);
    }
    expect(LEGACY_VERSIONS).toEqual([1, 2, 3, 4, 5]);
  });

  it("um capítulo concluído vira a marca de período já visitado, e não leitura nem resposta", () => {
    const { fases, assinaturas } = chavesDe("lula");
    for (const versao of LEGACY_VERSIONS) {
      const migrado = parseProgress(antigo(versao, "lula", ["lula-1-sindicato", "lula-2-constituinte"], { "lula-3-presidencia": { status: "em-andamento", coletados: ["x"] } }), "lula", fases, assinaturas)!;
      expect(migrado.versao, `versão ${versao}`).toBe(PROGRESS_VERSION);
      expect(Object.keys(migrado.fases).sort()).toEqual(["lula-disputas-pela-presidencia", "lula-partido-e-constituinte", "lula-sindicato"]);
      for (const estado of Object.values(migrado.fases)) {
        // Nada de aprendizado atribuído: a explicação nova não foi lida e a atividade nova não foi respondida.
        expect(estado).toEqual({ vista: false, tentativas: 0, anterior: true });
      }
      expect(countDone(migrado, fases)).toBe(0);
      // O que estava salvo fica guardado, inteiro, dentro do formato novo.
      expect(migrado.legado).toEqual({ versao, capitulos: antigo(versao, "lula", ["lula-1-sindicato", "lula-2-constituinte"], { "lula-3-presidencia": { status: "em-andamento", coletados: ["x"] } }).capitulos });
      expect(migrado.posicao).toEqual({});
    }
  });

  it("as fases que não tinham capítulo, como a origem, ficam sem marca: continuam novas", () => {
    for (const perfil of PROFILES) {
      const { fases, assinaturas } = chavesDe(perfil.slug);
      const todos = Object.keys(LEGACY_CHAPTER_PHASES).filter((id) => id.startsWith(`${perfil.slug}-`));
      const migrado = parseProgress(antigo(5, perfil.slug, todos), perfil.slug, fases, assinaturas)!;
      const origem = fases[0]!;
      expect(origem.id, perfil.slug).toBe(`${perfil.slug}-origem`);
      expect(migrado.fases[origem.id], perfil.slug).toBeUndefined();
      expect(firstUnseen(migrado, fases.filter((fase) => fase.sala === "historico"))?.id, perfil.slug).toBe(origem.id);
    }
  });

  it("quem tinha a trajetória antiga concluída continua da última fase, com a origem oferecida à parte; quem não tinha nada começa na origem", () => {
    for (const perfil of PROFILES) {
      const { fases, assinaturas } = chavesDe(perfil.slug);
      const trilha = fases.filter((fase) => fase.sala === "historico");
      const todos = Object.keys(LEGACY_CHAPTER_PHASES).filter((id) => id.startsWith(`${perfil.slug}-`));
      const migrado = parseProgress(antigo(5, perfil.slug, todos), perfil.slug, fases, assinaturas)!;
      // É o caso relatado de "entrar em 2025": só acontece com progresso antigo, e a entrada diz a fase e o ano.
      expect(resumePhase(migrado, trilha)?.id, perfil.slug).toBe(`${perfil.slug}-eleicao-2026`);
      expect(resumePhase(initialProgress(perfil.slug), trilha)?.id, perfil.slug).toBe(`${perfil.slug}-origem`);
      // Com só o primeiro capítulo antigo concluído, continua logo depois do período que ele cobria.
      const [primeiro] = todos;
      const parcial = parseProgress(antigo(5, perfil.slug, [primeiro!]), perfil.slug, fases, assinaturas)!;
      const cobertas = LEGACY_CHAPTER_PHASES[primeiro!]!;
      const ultimaCoberta = Math.max(...cobertas.map((id) => trilha.findIndex((fase) => fase.id === id)));
      expect(resumePhase(parcial, trilha)?.id, perfil.slug).toBe(trilha[ultimaCoberta + 1]!.id);
    }
  });

  it("a tela só diz que o jogo mudou a quem tem progresso de um formato anterior e fases que ele não conhecia", () => {
    for (const perfil of PROFILES) {
      const { fases, assinaturas } = chavesDe(perfil.slug);
      const trilha = fases.filter((fase) => fase.sala === "historico");
      const todos = Object.keys(LEGACY_CHAPTER_PHASES).filter((id) => id.startsWith(`${perfil.slug}-`));
      const migrado = parseProgress(antigo(5, perfil.slug, todos), perfil.slug, fases, assinaturas)!;
      // A origem não existia no jogo antigo: é o que falta, e é o que o aviso oferece.
      expect(hasNewStart(migrado, trilha), perfil.slug).toBe(true);
      // Quem começou no formato de hoje não recebe o aviso, tenha feito pouco ou muito.
      expect(hasNewStart(initialProgress(perfil.slug), trilha), perfil.slug).toBe(false);
      expect(hasNewStart(openPhase(initialProgress(perfil.slug), trilha[3]!), trilha), perfil.slug).toBe(false);
      // Depois de a pessoa passar por todas as fases, o aviso deixa de ter o que dizer.
      const percorrido = trilha.reduce((atual, fase) => openPhase(atual, fase), migrado);
      expect(hasNewStart(percorrido, trilha), perfil.slug).toBe(false);
    }
  });

  it("progresso antigo de outro personagem, de versão desconhecida ou sem forma é recusado, sem apagar nada", () => {
    const { fases, assinaturas } = chavesDe("lula");
    expect(parseProgress(antigo(5, "flavio-bolsonaro", ["flavio-bolsonaro-1-alerj"]), "lula", fases, assinaturas)).toBeNull();
    expect(parseProgress(antigo(0, "lula", ["lula-1-sindicato"]), "lula", fases, assinaturas)).toBeNull();
    expect(parseProgress({ versao: 5, personagem: "lula", capitulos: [] }, "lula", fases, assinaturas)).toBeNull();
    expect(readLegacy({ versao: 3, personagem: "lula", capitulos: { "lula-1-sindicato": { status: "concluido" }, estranho: "texto" } }, "lula")).toEqual({
      versao: 3,
      capitulos: { "lula-1-sindicato": { status: "concluido" }, estranho: "texto" },
      concluidos: ["lula-1-sindicato"],
    });
    // Capítulo que nunca existiu não vira fase nenhuma.
    expect(phasesOfLegacy(["capitulo-inventado"])).toEqual([]);
    expect(phasesOfLegacy(["lula-4-processos", "lula-5-anulacao"])).toEqual(["lula-processos", "lula-retorno"]);
  });

  it("o progresso migrado, gravado no formato novo, volta com o salvo antigo dentro", () => {
    const { fases, assinaturas } = chavesDe("flavio-bolsonaro");
    const migrado = parseProgress(antigo(4, "flavio-bolsonaro", ["flavio-bolsonaro-2-senado"]), "flavio-bolsonaro", fases, assinaturas)!;
    const relido = parseProgress(JSON.parse(JSON.stringify(migrado)), "flavio-bolsonaro", fases, assinaturas)!;
    expect(relido).toEqual(migrado);
    expect(relido.legado?.versao).toBe(4);
    expect(relido.fases["flavio-bolsonaro-senado"]).toEqual({ vista: false, tentativas: 0, anterior: true });
  });
});
