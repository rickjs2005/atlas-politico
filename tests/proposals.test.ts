// As propostas eleitorais (src/lib/data/proposals.ts) e os fatos biográficos
// da edição: o mesmo tratamento para as duas pessoas, o texto que diz o que o
// documento propõe (e não o que foi feito), as divergências entre documentos
// à vista, e só fontes que a política editorial aceita.

import { describe, expect, it } from "vitest";

import { readSources, resolvePaths } from "@/lib/content/sources";
import { PROPOSAL_NOTICE, PROPOSAL_PENDING, PROPOSAL_SAMPLE_NOTICE, groupProposalsByTheme, listProposals } from "@/lib/data/proposals";
import { TEMAS } from "@/lib/domain/decisions";
import { INICIO_DA_PROPOSTA, LIMITES_DA_FASE, countWords } from "@/lib/domain/game";
import { propostaEleitoralSchema } from "@/lib/domain/schemas";
import { buildAtlasData } from "@/lib/publication/build";

import { loadAtlasData, loadFixtures } from "./helpers";

const data = buildAtlasData(readSources(resolvePaths())).data!;
const PESSOAS = data.conjunto.pessoas.map((pessoa) => pessoa.id);

describe("propostas eleitorais sobre as fixtures", () => {
  const sintetico = loadAtlasData();

  it("lista as propostas de uma pessoa na ordem das áreas, com as fontes resolvidas", () => {
    const deA = listProposals(sintetico, "sintetico-pessoa-a");
    expect(deA.map((proposta) => proposta.id)).toEqual(["sintetico-proposta-a-economia-1", "sintetico-proposta-a-saude-1"]);
    expect(deA[0]!.fontes[0]!.fonte.id).toBe("sintetico-fonte-01");
    expect(listProposals(sintetico, "sintetico-pessoa-b").map((proposta) => proposta.id)).toEqual(["sintetico-proposta-b-economia-1"]);
    expect(listProposals(sintetico, "pessoa-que-nao-existe")).toEqual([]);
  });

  it("agrupa por área com todas as áreas presentes: a área vazia existe para a tela dizer que não foi pesquisada", () => {
    const grupos = groupProposalsByTheme(listProposals(sintetico, "sintetico-pessoa-b"));
    expect(Object.keys(grupos).sort()).toEqual([...TEMAS].sort());
    expect(grupos.economia).toHaveLength(1);
    expect(grupos.saude).toEqual([]);
    expect(PROPOSAL_PENDING).toBe("Ainda não pesquisado nesta edição.");
  });

  it("o contrato recusa texto que não começa por quem propõe, texto longo e proposta revisada sem citação", () => {
    const base = loadFixtures().propostasEleitorais[0]!;
    expect(propostaEleitoralSchema.safeParse(base).success).toBe(true);
    expect(propostaEleitoralSchema.safeParse({ ...base, texto: "Vai criar um programa de teste." }).success).toBe(false);
    expect(propostaEleitoralSchema.safeParse({ ...base, texto: `${INICIO_DA_PROPOSTA}${Array.from({ length: LIMITES_DA_FASE.palavrasDaProposta }, () => "palavra").join(" ")}` }).success).toBe(false);
    expect(propostaEleitoralSchema.safeParse({ ...base, fontes: [] }).success).toBe(false);
    expect(propostaEleitoralSchema.safeParse({ ...base, tema: "tema-que-nao-existe" }).success).toBe(false);
  });
});

describe("propostas eleitorais da edição", () => {
  const porPessoa = Object.fromEntries(PESSOAS.map((id) => [id, listProposals(data, id)]));

  it("as duas pessoas têm três propostas em cada uma das sete áreas: nenhuma área e nenhuma pessoa tem mais espaço", () => {
    for (const id of PESSOAS) {
      const grupos = groupProposalsByTheme(porPessoa[id]!);
      for (const tema of TEMAS) expect(grupos[tema], `${id} ${tema}`).toHaveLength(3);
      expect(porPessoa[id], id).toHaveLength(21);
    }
  });

  it("todo texto diz o que o documento propõe, em uma frase curta, sem prometer resultado e sem primeira pessoa", () => {
    for (const proposta of data.conjunto.propostasEleitorais) {
      expect(proposta.texto.startsWith(INICIO_DA_PROPOSTA), proposta.id).toBe(true);
      expect(countWords(proposta.texto), proposta.id).toBeLessThanOrEqual(LIMITES_DA_FASE.palavrasDaProposta);
      expect(proposta.texto, proposta.id).toMatch(/\.$/);
      expect(proposta.texto, proposta.id).not.toMatch(/\b(vamos|iremos|faremos|garantiremos|nosso governo|vai (fazer|criar|acabar|garantir)|já (fez|criou|garantiu))\b/i);
      expect(proposta.texto, proposta.id).not.toMatch(/[—–]/);
      expect(proposta.eleicao, proposta.id).toBe(2026);
      if (proposta.ressalva !== null) expect(proposta.ressalva.length, proposta.id).toBeGreaterThan(0);
    }
  });

  it("toda proposta cita a página do documento registrado no TSE e a ficha da candidatura que o traz", () => {
    for (const proposta of data.conjunto.propostasEleitorais) {
      const fontes = proposta.fontes.map((citacao) => citacao.fonteId);
      expect(fontes, proposta.id).toHaveLength(2);
      expect(fontes[0], proposta.id).toBe(`tse-proposta-de-governo-${proposta.pessoaId}-2026`);
      expect(fontes[1], proposta.id).toMatch(/^tse-divulgacand-2026-/);
      expect(proposta.fontes[0]!.localizacao, proposta.id).toMatch(/^página \d+/);
    }
    // O documento é o que está no serviço oficial do TSE, e não material de campanha.
    for (const id of PESSOAS) {
      const fonte = data.conjunto.fontes.find((item) => item.id === `tse-proposta-de-governo-${id}-2026`)!;
      expect(new URL(fonte.url).host, id).toMatch(/\.tse\.jus\.br$/);
    }
  });

  it("a ressalva não avalia se a frase é precisa, e as duas candidaturas têm o mesmo número de ressalvas", () => {
    // Dizer que uma frase "não traz número" é um juízo de precisão: aplicado caso a caso, marcou um documento como vago e o outro não.
    // O aviso é um só, no texto fixo das telas, e vale igual para as duas.
    const VAGA = /\bn[ãa]o (traz|diz|descreve|nomeia|informa|define|detalha|especifica)\b/i;
    for (const proposta of data.conjunto.propostasEleitorais) {
      if (proposta.ressalva !== null) expect(proposta.ressalva, proposta.id).not.toMatch(VAGA);
    }
    const comRessalva = PESSOAS.map((id) => porPessoa[id]!.filter((proposta) => proposta.ressalva !== null).length);
    expect(new Set(comRessalva).size, `ressalvas por pessoa: ${comRessalva.join(" e ")}`).toBe(1);
    expect(PROPOSAL_NOTICE).toContain("sem acrescentar número, prazo ou valor que ela não traga");
  });

  it("a página citada no texto está na citação, as duas frases que usam um trecho de outra página trazem as duas localizações, e nenhuma usa futuro do indicativo nem fala em novo mandato", () => {
    // O futuro do indicativo ("terá", "será", "criará", "manterão", "faremos") e "no novo mandato" são a voz da candidatura, e não a do atlas.
    // As letras acentuadas pedem a marca u: sem ela, a fronteira de palavra não enxerga o "á".
    // Substantivos com a mesma terminação ficam de fora da conta.
    const NAO_E_VERBO = new Set(["padrão", "verão", "grão", "barão", "ladrão", "pará"]);
    const futuros = (texto: string) => [...texto.toLowerCase().matchAll(/(?<!\p{L})\p{L}+(?:rá|rão|remos)(?!\p{L})/gu)].map((achado) => achado[0]).filter((palavra) => !NAO_E_VERBO.has(palavra));
    const NOVO_MANDATO = /no (novo|próximo) mandato/i;
    expect(futuros("O documento diz que a medida terá prioridade.")).toEqual(["terá"]);
    expect(futuros("O programa será criado; o governo criará regras, manterão o padrão e faremos mais no verão.")).toEqual(["será", "criará", "manterão", "faremos"]);
    expect(futuros("O documento propõe manter o caráter gratuito, de forma miserável ou não, para o cidadão.")).toEqual([]);
    for (const proposta of data.conjunto.propostasEleitorais) {
      const onde = proposta.fontes[0]!.localizacao;
      // Página citada no texto: a citação diz onde ela fica.
      for (const [, primeira, segunda] of proposta.texto.matchAll(/páginas? (\d+)(?: e (\d+))?/g)) {
        for (const pagina of [primeira, segunda]) if (pagina !== undefined) expect(onde, proposta.id).toContain(`página ${pagina}`);
      }
      expect(futuros(proposta.texto), proposta.id).toEqual([]);
      expect(proposta.texto, proposta.id).not.toMatch(NOVO_MANDATO);
    }
    // As duas frases que usam um trecho de outra página, uma de cada documento: a citação diz as duas páginas.
    const localDe = (id: string) => data.conjunto.propostasEleitorais.find((proposta) => proposta.id === id)!.fontes[0]!.localizacao;
    expect(localDe("proposta-lula-2026-meio-ambiente-2")).toMatch(/^página 71,.*; .*página 69/);
    expect(localDe("proposta-flavio-bolsonaro-2026-direitos-das-mulheres-1")).toMatch(/^página 14,.*; .*página 19/);
  });

  it("os avisos fixos dizem o que uma proposta é, o que ela não é e que a seleção não é o documento inteiro", () => {
    expect(PROPOSAL_NOTICE).toContain("não é ato, não é voto e não é resultado");
    expect(PROPOSAL_SAMPLE_NOTICE).toContain("três frases por área");
    expect(PROPOSAL_SAMPLE_NOTICE).toContain("não quer dizer que a candidatura não a faz");
  });

  it("nenhuma proposta, fato, conceito, fase ou atuação legislativa registra revisão humana que não aconteceu", () => {
    const { propostasEleitorais, fatosBiograficos, conceitos, fasesDoJogo, atuacoesLegislativas, atosExecutivos, proposicoes, coberturaPolitica } = data.conjunto;
    for (const registro of [...propostasEleitorais, ...fatosBiograficos, ...conceitos, ...fasesDoJogo, ...atuacoesLegislativas, ...atosExecutivos, ...proposicoes, ...coberturaPolitica]) {
      expect(registro.editorial.estado, registro.id).toBe("revisado");
      if (registro.editorial.estado === "revisado") expect(registro.editorial.revisao.tipo, registro.id).toBe("assistida-por-ia");
    }
  });
});

describe("fatos biográficos da edição", () => {
  const fato = (id: string) => data.conjunto.fatosBiograficos.find((item) => item.id === id)!;

  it("as duas pessoas têm o nascimento, a formação e o trabalho antes da vida pública, cada fato com documento", () => {
    for (const id of PESSOAS) {
      const tipos = new Set(data.conjunto.fatosBiograficos.filter((item) => item.pessoaId === id).map((item) => item.tipo));
      for (const tipo of ["nascimento", "formacao", "trabalho"] as const) expect(tipos.has(tipo), `${id} ${tipo}`).toBe(true);
    }
    for (const item of data.conjunto.fatosBiograficos) expect(item.fontes.length, item.id).toBeGreaterThan(0);
  });

  it("o nascimento de Lula fica no mês e no ano, em que os documentos concordam, com a divergência do dia e do lugar à vista", () => {
    const nascimento = fato("lula-nascimento");
    expect(nascimento.data).toEqual({ tipo: "data", valor: "1945-10", precisao: "mes" });
    expect(nascimento.texto).toContain("outubro de 1945");
    expect(nascimento.texto).not.toMatch(/\b(6|27) de outubro\b/);
    expect(nascimento.divergenciaDocumentada).toContain("27 de outubro de 1945");
    expect(nascimento.divergenciaDocumentada).toContain("6 de outubro de 1945");
    expect(nascimento.divergenciaDocumentada).toContain("Caetés");
  });

  it("o nascimento de Flávio Bolsonaro tem a data em que os documentos concordam, com a divergência do lugar à vista", () => {
    const nascimento = fato("flavio-bolsonaro-nascimento");
    expect(nascimento.data).toEqual({ tipo: "data", valor: "1981-04-30", precisao: "dia" });
    expect(nascimento.divergenciaDocumentada).toContain("Resende");
    expect(nascimento.divergenciaDocumentada).toContain("Rio de Janeiro");
  });

  it("fato sem data documentada fica sem data: o texto não escreve ano nenhum, e diz que os documentos não o trazem ou dá a idade que eles dão", () => {
    const semData = data.conjunto.fatosBiograficos.filter((item) => item.data.tipo === "desconhecida");
    expect(semData.length).toBeGreaterThan(0);
    for (const item of semData) {
      expect(item.texto, item.id).not.toMatch(/\b(?:1[89]\d{2}|20\d{2})\b/);
      expect(item.texto, item.id).toMatch(/não dizem em que anos?|aos \d+ anos/);
    }
  });

  it("nenhum fato traz cena de infância, adjetivo sobre a pessoa ou fala atribuída", () => {
    for (const item of data.conjunto.fatosBiograficos) {
      for (const texto of [item.titulo, item.texto]) {
        expect(texto, item.id).not.toMatch(/["“”]/);
        expect(texto, item.id).not.toMatch(/\b(humilde|pobre|sofrid[oa]|brilhante|talentos[oa]|privilegiad[oa]|esforçad[oa]|determinad[oa]|sonh\w+)\b/i);
        expect(texto, item.id).not.toMatch(/[—–]/);
      }
    }
  });
});

describe("fontes da edição", () => {
  it("nenhuma fonte é material de campanha, verbete do DHBB, cópia de arquivo de terceiro ou enciclopédia aberta", () => {
    for (const fonte of data.conjunto.fontes) {
      const host = new URL(fonte.url).host;
      expect(host, fonte.id).not.toMatch(/flaviobolsonaro\.com\.br|lula\.com\.br|pt\.org\.br|pl22\.org\.br|partidoliberal\.org\.br|fgv\.br|archive\.org|wikipedia\.org|wikimedia\.org/);
      expect(fonte.url, fonte.id).toMatch(/^https:\/\//);
    }
  });

  it("as leis estaduais são citadas pelo portal oficial da Alerj, em endereço seguro", () => {
    const leis = data.conjunto.fontes.filter((fonte) => /^alerj-lei-\d+-\d{4}$/.test(fonte.id));
    expect(leis).toHaveLength(8);
    for (const fonte of leis) expect(fonte.url, fonte.id).toMatch(/^https:\/\/www3\.alerj\.rj\.gov\.br\/lotus_notes\/default\.asp\?id=53&url=[A-Za-z0-9+/]+=*$/);
  });
});
