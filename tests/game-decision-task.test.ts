// A tarefa de decisão (D-126): os registros do capítulo incluem as decisões, a
// etapa da evidência grava sem confirmar, a interpretação tem a certa única
// entre três e confirma com a assinatura, e tudo vem do cartão da decisão,
// sem texto inventado sobre a pessoa.

import { describe, expect, it } from "vitest";

import type { DataHistorica } from "@/lib/domain/types";
import {
  ATO_DEFINICOES,
  DISTRACTORS,
  collect,
  correctInterpretation,
  describeDecision,
  hasAnswer,
  initialTaskState,
  interpretationOptions,
  isAnswerPending,
  isEvidenceDone,
  isExitOpen,
  isTaskDone,
  manifestationLabel,
  missingRecords,
  recordIds,
  requiredRecords,
  sourceOptions,
  submitEvidence,
  submitInterpretation,
  taskSignature,
} from "@/lib/game/mission";
import type { ChapterSpec, GameDecision, GameRecord, GameSource, TaskSpec, TaskState } from "@/lib/game/types";

const data = (valor: string, precisao: DataHistorica["precisao"]): DataHistorica => ({ valor, precisao });

const fonte = (id: string, titulo: string, evidencia: string): GameSource => ({
  id,
  titulo,
  autoria: `Instituição ${id}`,
  url: `https://exemplo.gov.br/${id}`,
  dataDocumento: { tipo: "desconhecida" },
  acessadoEm: "2026-10-10",
  localizacao: `Trecho de ${titulo}`,
  evidencia,
});

const editorial = { estado: "revisado", revisao: { tipo: "assistida-por-ia", revisadoPor: "Fixture", revisadoEm: "2026-10-10" } } as const;

const registro = (id: string, titulo: string, quando: DataHistorica, fontes: GameSource[]): GameRecord => ({
  id,
  slug: id,
  titulo,
  data: quando,
  categoria: "eleicoes",
  resumo: `Resumo de ${titulo}.`,
  contexto: `Contexto de ${titulo}.`,
  localizacao: { tipo: "nacional" },
  fontes,
  editorial,
  ordemEmAberto: false,
});

const DOC_A = fonte("doc-a", "Documento A", "O que A sustenta.");
const DOC_B = fonte("doc-b", "Documento B", "O que B sustenta.");
const DOC_VOTACAO = fonte("doc-votacao", "Dados abertos: votação", "siglaVotoParlamentar: Não");
const DOC_ATO = fonte("doc-ato", "Página do ato", "Lei sancionada com veto parcial.");

const VOTO: GameDecision = {
  natureza: "voto",
  id: "voto-1",
  pessoaId: "lula",
  titulo: "Votação: PLP 1/2024, texto principal",
  data: data("2024-03-05", "dia"),
  temas: ["economia"],
  instituicao: "senado-federal",
  cargo: { mandatoId: "m1", cargo: "Senador", instituicao: "Senado Federal" },
  proposicoes: [{ id: "p1", identificacao: "PLP 1/2024", ementa: "Dispõe sobre algo.", instituicao: "senado-federal", temas: ["economia"] }],
  votacao: {
    id: "v1",
    etapa: "turno único",
    orgao: "Plenário",
    objeto: { tipo: "texto-principal", identificacao: null, descricao: "Votação nominal do projeto." },
    modalidade: "nominal",
    resultado: { estado: "aprovado", valorOriginal: "A" },
    textoReferencia: null,
  },
  registro: { tipo: "voto-individual", posicao: "CONTRA", valorOriginal: "Não" },
  fontes: [DOC_VOTACAO],
  editorial,
};

const ATO: GameDecision = {
  natureza: "ato",
  id: "ato-1",
  pessoaId: "lula",
  titulo: "Lei nº 1, de 2 de janeiro de 2024",
  data: data("2024-01-02", "dia"),
  temas: ["seguranca-publica"],
  instituicao: "presidencia-da-republica",
  cargo: { mandatoId: "m2", cargo: "Presidente da República", instituicao: "Presidência da República" },
  proposicoes: [{ id: "p2", identificacao: "PL 2/2023", ementa: "Altera algo.", instituicao: "senado-federal", temas: ["seguranca-publica"] }],
  ato: {
    tipo: "veto-parcial",
    identificador: "Lei nº 1, de 2 de janeiro de 2024",
    oficial: { titulo: "Página do ato", url: "https://exemplo.gov.br/doc-ato" },
    detalhes: [{ rotulo: "Mensagem de veto", valor: "Mensagem nº 9" }],
  },
  fontes: [DOC_ATO],
  editorial,
};

const AUSENCIA: GameDecision = { ...VOTO, id: "voto-2", registro: { tipo: "ausencia-documentada", valorOriginal: "LP", motivoDocumentado: "Licença particular" } };

const TAREFA: Extract<TaskSpec, { tipo: "decisao" }> = { tipo: "decisao", decisaoId: "voto-1" };
const CAPITULO: ChapterSpec = {
  id: "capitulo-de-teste",
  personagem: "lula",
  sala: "economia",
  numero: 1,
  titulo: "Capítulo de teste",
  periodo: { de: 2023, ate: 2024 },
  motivo: "Fixture dos testes.",
  objetivo: "Fixture dos testes.",
  eventIds: ["a", "b"],
  decisaoIds: ["voto-1", "ato-1"],
  tarefa: TAREFA,
  cena: "sindicato",
  epoca: "atual",
};
const DOCUMENTOS = {
  a: registro("a", "Acontecimento A", data("2023-01-02", "dia"), [DOC_A]),
  b: registro("b", "Acontecimento B", data("2023-06-02", "dia"), [DOC_B]),
  "voto-1": VOTO,
  "ato-1": ATO,
};

const recolhidos = (...ids: string[]): TaskState => ids.reduce(collect, initialTaskState());

describe("registros do capítulo com decisões", () => {
  it("recordIds põe os acontecimentos e depois as decisões; a tarefa de decisão exige a decisão e pede resposta", () => {
    expect(recordIds(CAPITULO)).toEqual(["a", "b", "voto-1", "ato-1"]);
    expect(recordIds({ eventIds: ["x"] })).toEqual(["x"]);
    expect(requiredRecords(TAREFA)).toEqual(["voto-1"]);
    expect(hasAnswer(TAREFA)).toBe(true);
    expect(taskSignature(TAREFA)).toBe("decisao:voto-1");
    expect(isAnswerPending(TAREFA, recolhidos("voto-1"))).toBe(true);
    expect(isAnswerPending(TAREFA, recolhidos("ato-1"))).toBe(false);
    expect(isEvidenceDone(initialTaskState())).toBe(false);
  });

  it("a saída exige as decisões recolhidas como qualquer registro", () => {
    expect(missingRecords(CAPITULO, recolhidos("a", "voto-1"))).toEqual(["b", "ato-1"]);
    const confirmada: TaskState = { ...recolhidos("a", "b", "voto-1"), confirmada: true, evidencia: true };
    expect(isExitOpen(CAPITULO, confirmada)).toBe(false);
    expect(isExitOpen(CAPITULO, collect(confirmada, "ato-1"))).toBe(true);
  });
});

describe("tarefa de decisão: a evidência", () => {
  const pronta = recolhidos("voto-1");

  it("as opções são o documento da decisão e dois documentos de outros registros do capítulo, acontecimentos ou decisões", () => {
    const opcoes = sourceOptions(CAPITULO, DOCUMENTOS, "voto-1");
    expect(opcoes).toHaveLength(1 + DISTRACTORS);
    expect(opcoes.map((opcao) => opcao.id)).toContain("doc-votacao");
    expect(opcoes.map((opcao) => opcao.id).sort()).toEqual(["doc-a", "doc-b", "doc-votacao"]);
    // Com só os documentos das decisões à mão, a alternativa errada vem da outra decisão.
    const soDecisoes: ChapterSpec = { ...CAPITULO, eventIds: [] };
    expect(sourceOptions(soDecisoes, DOCUMENTOS, "voto-1").map((opcao) => opcao.id).sort()).toEqual(["doc-ato", "doc-votacao"]);
  });

  it("o documento certo grava a etapa de evidência sem confirmar a tarefa; o errado explica e não grava", () => {
    const certa = submitEvidence(TAREFA, pronta, CAPITULO, DOCUMENTOS, "doc-votacao");
    expect(certa.certo).toBe(true);
    expect(isEvidenceDone(certa.estado)).toBe(true);
    expect(certa.estado.confirmada).toBe(false);
    expect(certa.estado.tentativas).toBe(1);
    expect(certa.explicacao).toContain("Agora, a interpretação");
    expect(isAnswerPending(TAREFA, certa.estado)).toBe(true);
    expect(isTaskDone(TAREFA, certa.estado)).toBe(false);
    const errada = submitEvidence(TAREFA, pronta, CAPITULO, DOCUMENTOS, "doc-a");
    expect(errada.certo).toBe(false);
    expect(isEvidenceDone(errada.estado)).toBe(false);
    expect(errada.estado.tentativas).toBe(1);
    expect(errada.explicacao).toContain("outro registro do capítulo");
    expect(errada.explicacao).toContain("Acontecimento A");
    expect(errada.explicacao).toContain("não há penalidade");
    expect(pronta).toEqual({ recolhidos: ["voto-1"], confirmada: false, tentativas: 0 });
  });

  it("sem a decisão no conteúdo, a resposta é recusada com explicação", () => {
    const { "voto-1": _voto, ...semVoto } = DOCUMENTOS;
    expect(_voto).toBeDefined();
    const resposta = submitEvidence(TAREFA, pronta, CAPITULO, semVoto, "doc-votacao");
    expect(resposta.certo).toBe(false);
    expect(resposta.explicacao).toContain("não está no conteúdo");
  });
});

describe("tarefa de decisão: a interpretação", () => {
  const comEvidencia: TaskState = { ...recolhidos("voto-1"), evidencia: true, tentativas: 1 };

  it("para um voto individual, a certa é a posição e o objeto do registro; as erradas trocam uma coisa só", () => {
    expect(correctInterpretation(VOTO).id).toBe("voto:CONTRA:texto-principal");
    const opcoes = interpretationOptions(VOTO);
    expect(opcoes).toHaveLength(1 + DISTRACTORS);
    expect(opcoes.map((opcao) => opcao.id).sort()).toEqual(["voto:CONTRA:requerimento", "voto:CONTRA:texto-principal", "voto:FAVOR:texto-principal"]);
    expect(interpretationOptions(VOTO)).toEqual(opcoes);
    for (const opcao of opcoes) {
      expect(opcao.rotulo.length).toBeGreaterThan(0);
      expect(opcao.detalhe).toContain("PLP 1/2024");
    }
    expect(manifestationLabel(VOTO)).toBe("Contra (valor original: Não)");
  });

  it("para ausência documentada, a certa é a ausência e as erradas são votos", () => {
    expect(correctInterpretation(AUSENCIA).id).toBe("registro:ausencia-documentada");
    expect(interpretationOptions(AUSENCIA).map((opcao) => opcao.id).sort()).toEqual(["registro:ausencia-documentada", "voto:CONTRA:texto-principal", "voto:FAVOR:texto-principal"]);
    expect(manifestationLabel(AUSENCIA)).toContain("Licença particular");
  });

  it("para um ato, a certa é o tipo do ato e as erradas são dois tipos com que ele se confunde", () => {
    expect(correctInterpretation(ATO).id).toBe("ato:veto-parcial");
    expect(interpretationOptions(ATO).map((opcao) => opcao.id).sort()).toEqual(["ato:sancao-expressa", "ato:veto-parcial", "ato:veto-total"]);
    for (const opcao of interpretationOptions(ATO)) expect(opcao.detalhe.length).toBeGreaterThan(0);
    expect(Object.keys(ATO_DEFINICOES)).toHaveLength(7);
    expect(describeDecision(ATO)).toContain("veto parcial");
    expect(describeDecision(VOTO)).toContain("Manifestação registrada: Contra (valor original: Não)");
  });

  it("a interpretação certa confirma a tarefa com a assinatura; a errada diz o que o registro documenta e deixa tentar de novo", () => {
    const certa = submitInterpretation(TAREFA, comEvidencia, VOTO, "voto:CONTRA:texto-principal");
    expect(certa.certo).toBe(true);
    expect(certa.estado.confirmada).toBe(true);
    expect(certa.estado.assinatura).toBe("decisao:voto-1");
    expect(certa.estado.evidencia).toBe(true);
    expect(certa.explicacao).toContain("Manifestação registrada: Contra (valor original: Não)");
    expect(isTaskDone(TAREFA, certa.estado)).toBe(true);
    const errada = submitInterpretation(TAREFA, comEvidencia, VOTO, "voto:FAVOR:texto-principal");
    expect(errada.certo).toBe(false);
    expect(errada.estado.confirmada).toBe(false);
    expect(errada.estado.tentativas).toBe(2);
    expect(errada.explicacao).toMatch(/^Ainda não\./);
    expect(errada.explicacao).toContain("não há penalidade");
    expect(comEvidencia.tentativas).toBe(1);
  });

  it("antes da evidência, a interpretação é recusada sem contar tentativa; a decisão errada também", () => {
    const semEvidencia = submitInterpretation(TAREFA, recolhidos("voto-1"), VOTO, "voto:CONTRA:texto-principal");
    expect(semEvidencia.certo).toBe(false);
    expect(semEvidencia.estado).toEqual(recolhidos("voto-1"));
    expect(semEvidencia.explicacao).toContain("indique o documento");
    expect(submitInterpretation(TAREFA, comEvidencia, ATO, "ato:veto-parcial").certo).toBe(false);
    expect(submitInterpretation(TAREFA, comEvidencia, undefined, "x").certo).toBe(false);
  });
});
