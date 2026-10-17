// A missão de investigação "O documento diz o quê?" (src/lib/game/dossier.ts,
// D-151): a gaveta, o dossiê, a relação de cada ficha com o documento que a
// sustenta, o campo apontado, a explicação do erro e a conclusão. As regras
// são puras e rodam sobre as duas fases publicadas e sobre casos escritos aqui.

import { describe, expect, it } from "vitest";

import { readSources, resolvePaths } from "@/lib/content/sources";
import { CAMPOS_DO_DOCUMENTO } from "@/lib/domain/game";
import { PROFILES } from "@/lib/domain/profiles";
import { buildGameContent } from "@/lib/game/content";
import {
  collectDocument,
  documentFields,
  dossierLine,
  dossierOf,
  dossierSolution,
  dossierSummary,
  drawerDocuments,
  fichaStatus,
  inspectField,
  isCollected,
  isDossierComplete,
  matchFicha,
  mismatchSentence,
  mismatches,
  removeDocument,
  splitHighlight,
} from "@/lib/game/dossier";
import { parseProgress } from "@/lib/game/progress";
import { activitySignature, decisiveData, initialPhaseProgress, isPhaseDone, refKey } from "@/lib/game/trail";
import type { GameContent, PhaseProgress, PhaseSpec } from "@/lib/game/types";
import { buildAtlasData } from "@/lib/publication/build";

const data = buildAtlasData(readSources(resolvePaths())).data!;
const MISSOES = PROFILES.map((perfil) => {
  const content = buildGameContent(data, perfil.slug, "investigacao")!;
  return { slug: perfil.slug, content, fase: content.fases[0]! };
});

function dossie(fase: PhaseSpec) {
  if (fase.atividade.tipo !== "dossie") throw new Error(`${fase.id} não é um dossiê.`);
  return fase.atividade;
}

/** Recolhe todos os documentos da gaveta. */
function tudoRecolhido(fase: PhaseSpec, estado: PhaseProgress = initialPhaseProgress()): PhaseProgress {
  return drawerDocuments(fase).reduce((atual, referencia) => collectDocument(fase, atual, refKey(referencia)), estado);
}

/** Conclui a missão pelo caminho certo: relaciona e confere cada ficha. */
function concluir(fase: PhaseSpec, content: GameContent, estado: PhaseProgress): PhaseProgress {
  return dossie(fase).fichas.reduce((atual, ficha) => {
    const relacionada = matchFicha(fase, atual, ficha.id, refKey(ficha.evidencia), content);
    expect(relacionada.certo, ficha.id).toBe(true);
    const conferida = inspectField(fase, relacionada.estado, ficha.id, ficha.destaque.campo, content);
    expect(conferida.certo, ficha.id).toBe(true);
    return conferida.estado;
  }, estado);
}

describe("a gaveta e os campos de um documento", () => {
  it("as duas missões têm a mesma forma: uma fase, três fichas, seis documentos na gaveta, todos da própria pessoa e resolvidos", () => {
    for (const { slug, content, fase } of MISSOES) {
      expect(content.fases, slug).toHaveLength(1);
      expect(fase.sala, slug).toBe("investigacao");
      const gaveta = drawerDocuments(fase);
      expect(gaveta, slug).toHaveLength(6);
      expect(new Set(gaveta.map(refKey)).size, slug).toBe(6);
      for (const referencia of gaveta) {
        expect(referencia.tipo, `${slug} ${referencia.id}`).toBe("decisao");
        expect(content.decisoes[referencia.id], `${slug} ${referencia.id}`).toBeDefined();
      }
      // A ordem da gaveta é estável e não põe os documentos das fichas sempre na frente.
      expect(drawerDocuments(fase).map(refKey), slug).toEqual(gaveta.map(refKey));
      const dasFichas = new Set(dossie(fase).fichas.map((ficha) => refKey(ficha.evidencia)));
      expect(gaveta.slice(0, 3).every((referencia) => dasFichas.has(refKey(referencia))), slug).toBe(false);
    }
  });

  it("todo documento tem os cinco campos, na ordem da chave de leitura, com valor e resumo preenchidos", () => {
    for (const { slug, content, fase } of MISSOES) {
      for (const referencia of drawerDocuments(fase)) {
        const campos = documentFields(content.decisoes[referencia.id]!);
        expect(campos.map((campo) => campo.campo), `${slug} ${referencia.id}`).toEqual([...CAMPOS_DO_DOCUMENTO]);
        for (const campo of campos) {
          expect(campo.rotulo.length, `${slug} ${referencia.id} ${campo.campo}`).toBeGreaterThan(0);
          expect(campo.valor.length, `${slug} ${referencia.id} ${campo.campo}`).toBeGreaterThan(0);
          expect(campo.resumo.length, `${slug} ${referencia.id} ${campo.campo}`).toBeGreaterThan(0);
        }
      }
    }
  });

  it("dois documentos da mesma gaveta nunca são iguais nos cinco campos: há sempre o que ler para distingui-los", () => {
    for (const { slug, content, fase } of MISSOES) {
      const gaveta = drawerDocuments(fase).map((referencia) => content.decisoes[referencia.id]!);
      for (const a of gaveta) {
        for (const b of gaveta) {
          if (a.id === b.id) continue;
          expect(mismatches(a, b).length, `${slug}: ${a.id} e ${b.id}`).toBeGreaterThan(0);
        }
        expect(mismatches(a, a), `${slug} ${a.id}`).toEqual([]);
      }
    }
  });

  it("o trecho destacado de cada ficha é sustentado pelo campo dito: o valor do campo e o trecho falam da mesma coisa", () => {
    for (const { slug, content } of MISSOES) {
      for (const solucao of dossierSolution(MISSOES.find((item) => item.slug === slug)!.fase, content)) {
        expect(solucao.documento, `${slug} ${solucao.ficha.id}`).not.toBeNull();
        expect(solucao.campo, `${slug} ${solucao.ficha.id}`).not.toBeNull();
        const partes = splitHighlight(solucao.ficha);
        expect(`${partes.antes}${partes.trecho}${partes.depois}`).toBe(solucao.ficha.texto);
        expect(partes.trecho.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("recolher documentos", () => {
  const { fase } = MISSOES[0]!;
  const primeira = refKey(drawerDocuments(fase)[0]!);

  it("começa sem nada e guarda na ordem em que a pessoa guarda; guardar de novo não muda nada", () => {
    const inicial = initialPhaseProgress();
    expect(dossierOf(inicial)).toEqual({ recolhidos: [], relacionadas: {}, conferidas: [] });
    expect(isCollected(inicial, primeira)).toBe(false);
    const um = collectDocument(fase, inicial, primeira);
    expect(isCollected(um, primeira)).toBe(true);
    expect(um.vista).toBe(true);
    expect(collectDocument(fase, um, primeira)).toBe(um);
    const todos = tudoRecolhido(fase);
    expect(dossierOf(todos).recolhidos).toEqual(drawerDocuments(fase).map(refKey));
  });

  it("um documento que a gaveta não tem é ignorado, e tirar do dossiê não apaga o que foi conferido", () => {
    const inicial = initialPhaseProgress();
    expect(collectDocument(fase, inicial, "decisao:nao-existe")).toBe(inicial);
    const um = collectDocument(fase, inicial, primeira);
    const semEle = removeDocument(um, primeira);
    expect(isCollected(semEle, primeira)).toBe(false);
    expect(removeDocument(semEle, primeira)).toBe(semEle);
  });
});

describe("relacionar e conferir fichas", () => {
  it("o caminho certo conclui a fase pela resposta, uma ficha por vez, com a assinatura de hoje", () => {
    for (const { slug, content, fase } of MISSOES) {
      const estado = tudoRecolhido(fase);
      const fichas = dossie(fase).fichas;
      expect(isDossierComplete(fase, estado), slug).toBe(false);
      const final = concluir(fase, content, estado);
      expect(isDossierComplete(fase, final), slug).toBe(true);
      expect(isPhaseDone(final), slug).toBe(true);
      expect(final.concluida, slug).toBe("resposta");
      expect(final.assinatura, slug).toBe(activitySignature(fase, content));
      expect(final.tentativas, slug).toBe(fichas.length * 2);
      for (const ficha of fichas) expect(fichaStatus(final, ficha.id), `${slug} ${ficha.id}`).toBe("conferida");
      const resumo = dossierSummary(fase, final);
      expect(resumo, slug).toEqual({ documentos: 6, totalDocumentos: 6, relacionadas: 3, conferidas: 3, totalFichas: 3 });
      expect(dossierLine(resumo)).toBe("Dossiê: 6 de 6 documentos · fichas conferidas: 3 de 3");
    }
  });

  it("relacionar ao documento errado conta a tentativa, não guarda nada e diz em que campos o documento escolhido difere, sem dizer o certo", () => {
    for (const { slug, content, fase } of MISSOES) {
      const estado = tudoRecolhido(fase);
      const ficha = dossie(fase).fichas[0]!;
      const certa = refKey(ficha.evidencia);
      const errada = drawerDocuments(fase).map(refKey).find((chave) => chave !== certa)!;
      const resultado = matchFicha(fase, estado, ficha.id, errada, content);
      expect(resultado.certo, slug).toBe(false);
      expect(resultado.estado.tentativas, slug).toBe(1);
      expect(fichaStatus(resultado.estado, ficha.id), slug).toBe("pendente");
      expect(resultado.divergencias.length, slug).toBeGreaterThan(0);
      const frase = mismatchSentence(resultado.divergencias);
      expect(frase, slug).toMatch(/^Este documento não bate com a ficha em: /);
      // A frase fala só do documento escolhido: o valor de cada campo é o dele.
      const escolhido = content.decisoes[errada.replace("decisao:", "")]!;
      for (const divergencia of resultado.divergencias) expect(documentFields(escolhido).map((campo) => campo.campo), slug).toContain(divergencia.campo);
      // O certo, em seguida, continua valendo.
      const certo = matchFicha(fase, resultado.estado, ficha.id, certa, content);
      expect(certo.certo, slug).toBe(true);
      expect(fichaStatus(certo.estado, ficha.id), slug).toBe("relacionada");
      expect(certo.estado.tentativas, slug).toBe(2);
    }
  });

  it("um documento que não está no dossiê não pode ser relacionado, e uma ficha que a fase não tem é ignorada", () => {
    const { content, fase } = MISSOES[0]!;
    const ficha = dossie(fase).fichas[0]!;
    const semDossie = matchFicha(fase, initialPhaseProgress(), ficha.id, refKey(ficha.evidencia), content);
    expect(semDossie.certo).toBe(false);
    expect(semDossie.estado.tentativas).toBe(0);
    const estado = tudoRecolhido(fase);
    expect(matchFicha(fase, estado, "ficha-que-nao-existe", refKey(ficha.evidencia), content).estado).toBe(estado);
  });

  it("apontar o campo errado conta a tentativa, devolve o que o campo apontado registra e não confere a ficha; a ficha sem documento relacionado não aceita campo", () => {
    for (const { slug, content, fase } of MISSOES) {
      const ficha = dossie(fase).fichas[1]!;
      const semRelacao = inspectField(fase, tudoRecolhido(fase), ficha.id, ficha.destaque.campo, content);
      expect(semRelacao.certo, slug).toBe(false);
      expect(semRelacao.campo, slug).toBeNull();
      const relacionada = matchFicha(fase, tudoRecolhido(fase), ficha.id, refKey(ficha.evidencia), content).estado;
      const outro = CAMPOS_DO_DOCUMENTO.find((campo) => campo !== ficha.destaque.campo)!;
      const errado = inspectField(fase, relacionada, ficha.id, outro, content);
      expect(errado.certo, slug).toBe(false);
      expect(errado.concluiu, slug).toBe(false);
      expect(errado.campo?.campo, slug).toBe(outro);
      expect(fichaStatus(errado.estado, ficha.id), slug).toBe("relacionada");
      expect(errado.estado.tentativas, slug).toBe(2);
      const certo = inspectField(fase, errado.estado, ficha.id, ficha.destaque.campo, content);
      expect(certo.certo, slug).toBe(true);
      expect(certo.concluiu, slug).toBe(false);
      expect(fichaStatus(certo.estado, ficha.id), slug).toBe("conferida");
      // Conferir de novo não conta nada.
      expect(inspectField(fase, certo.estado, ficha.id, outro, content).estado).toBe(certo.estado);
    }
  });

  it("a última ficha conferida conclui a fase; concluir pela explicação continua valendo, e a solução lista cada ficha com o documento e o campo", () => {
    const { content, fase } = MISSOES[1]!;
    const fichas = dossie(fase).fichas;
    const quaseTudo = fichas.slice(0, -1).reduce((atual, ficha) => inspectField(fase, matchFicha(fase, atual, ficha.id, refKey(ficha.evidencia), content).estado, ficha.id, ficha.destaque.campo, content).estado, tudoRecolhido(fase));
    expect(isPhaseDone(quaseTudo)).toBe(false);
    const ultima = fichas.at(-1)!;
    const relacionada = matchFicha(fase, quaseTudo, ultima.id, refKey(ultima.evidencia), content).estado;
    const final = inspectField(fase, relacionada, ultima.id, ultima.destaque.campo, content);
    expect(final.concluiu).toBe(true);
    expect(isPhaseDone(final.estado)).toBe(true);
    const solucao = dossierSolution(fase, content);
    expect(solucao.map((item) => item.ficha.id)).toEqual(fichas.map((ficha) => ficha.id));
    for (const item of solucao) expect(item.campo?.campo).toBe(item.ficha.destaque.campo);
  });
});

describe("assinatura e progresso salvo", () => {
  it("o que decide o dossiê são as fichas, os documentos delas e os campos; a gaveta e os textos não entram", () => {
    const { content, fase } = MISSOES[0]!;
    const atividade = dossie(fase);
    const base = decisiveData(atividade, content);
    expect(decisiveData({ ...atividade, enunciado: "Outro enunciado.", explicacao: "Outra explicação.", distratores: [] }, content)).toEqual(base);
    expect(decisiveData({ ...atividade, fichas: [...atividade.fichas].reverse() }, content)).toEqual(base);
    const outroCampo = { ...atividade, fichas: atividade.fichas.map((ficha, indice) => (indice === 0 ? { ...ficha, destaque: { ...ficha.destaque, campo: ficha.destaque.campo === "data" ? ("acao" as const) : ("data" as const) } } : ficha)) };
    expect(decisiveData(outroCampo, content)).not.toEqual(base);
  });

  it("o andamento do dossiê é gravado e lido de volta no formato 6, e um salvo sem o campo continua valendo", () => {
    const { content, fase, slug } = MISSOES[0]!;
    const fichas = dossie(fase).fichas;
    const estado = matchFicha(fase, tudoRecolhido(fase), fichas[0]!.id, refKey(fichas[0]!.evidencia), content).estado;
    const chaves = { fases: [{ id: fase.id, sala: fase.sala }], assinaturas: { [fase.id]: activitySignature(fase, content) } };
    const salvo = JSON.parse(JSON.stringify({ versao: 6, personagem: slug, fases: { [fase.id]: estado }, posicao: {} })) as unknown;
    const lido = parseProgress(salvo, slug, chaves.fases, chaves.assinaturas)!;
    expect(lido.fases[fase.id]?.dossie).toEqual(estado.dossie);
    expect(fichaStatus(lido.fases[fase.id]!, fichas[0]!.id)).toBe("relacionada");
    const semDossie = parseProgress({ versao: 6, personagem: slug, fases: { [fase.id]: { vista: true, tentativas: 0 } }, posicao: {} }, slug, chaves.fases, chaves.assinaturas)!;
    expect(semDossie.fases[fase.id]?.dossie).toBeUndefined();
    // Um dossiê com forma errada invalida o salvo inteiro, como qualquer outro campo: dado inválido vira começo, e não erro.
    expect(parseProgress({ versao: 6, personagem: slug, fases: { [fase.id]: { vista: true, tentativas: 0, dossie: { recolhidos: "x" } } }, posicao: {} }, slug, chaves.fases, chaves.assinaturas)).toBeNull();
  });
});
