// Índices e consultas sobre os dados públicos. Usa as fixtures passadas pelo
// pipeline: sete acontecimentos revisados, de 1994 a 2024.

import { afterEach, describe, expect, it } from "vitest";

import { buildIndexes } from "@/lib/data/indexes";
import { lookup } from "@/lib/data/lookup";
import {
  compareTrajectories,
  filterEvents,
  findEventById,
  findEventBySlug,
  findPersonById,
  findPersonBySlug,
  getEventPlaces,
  getEventView,
  getSources,
  listAffiliations,
  listEventsAtPlace,
  listMandates,
  listProfiles,
  type EventFilter,
} from "@/lib/data/queries";
import { calcPeriodBounds, classifyOverlap, yearRangeInterval, type Periodo } from "@/lib/domain/dates";
import { compareByDate, compareByPeriod, compareText } from "@/lib/domain/order";

import { baseContent, createProject, loadAtlasData, removeProjects, slugs } from "./helpers";

afterEach(removeProjects);

const data = loadAtlasData();
const PESSOA_A = "sintetico-pessoa-a";
const PESSOA_B = "sintetico-pessoa-b";
const filter = (filtro?: EventFilter) => slugs(filterEvents(data, filtro));

describe("índices", () => {
  const { acontecimentos: indice } = data.indices;

  it("por pessoa, com o acontecimento compartilhado nas duas", () => {
    expect(slugs(indice.porPessoa[PESSOA_A]!.map((slug) => ({ slug })))).toEqual(["01", "02", "03", "07"]);
    expect(slugs(indice.porPessoa[PESSOA_B]!.map((slug) => ({ slug })))).toEqual(["03", "04", "05", "06"]);
  });

  it("por ano, só com os anos que têm acontecimento, e o intervalo do conjunto", () => {
    expect(Object.keys(indice.porAno)).toEqual(["1994", "2003", "2011", "2012", "2018", "2021", "2024"]);
    expect(indice.porAno["2003"]).toEqual(["sintetico-evento-02"]);
    expect(indice.anos).toEqual({ primeiro: 1994, ultimo: 2024 });
  });

  it("por categoria, com todas as categorias, mesmo as vazias", () => {
    expect(Object.fromEntries(Object.entries(indice.porCategoria).map(([k, v]) => [k, v.length]))).toEqual({
      "mandatos-e-funcoes": 1,
      eleicoes: 2,
      "partidos-e-aliancas": 1,
      "atuacao-institucional": 2,
      "marcos-historicos": 1,
    });
    const vazio = buildIndexes({ ...data.conjunto, acontecimentos: [] });
    expect(vazio.acontecimentos.porCategoria.eleicoes).toEqual([]);
    expect(vazio.acontecimentos.anos).toBeNull();
  });

  it("por lugar, e os sem ponto separados pelo motivo", () => {
    expect(indice.porLugar["sintetico-lugar-sul"]).toEqual(["sintetico-evento-03"]);
    expect(indice.porLugar["sintetico-lugar-sudeste"]).toEqual(["sintetico-evento-03"]);
    expect(indice.semPonto).toEqual({
      nacional: ["sintetico-evento-04"],
      desconhecida: ["sintetico-evento-06"],
    });
  });

  it("por id e por slug, apontando para o mesmo registro", () => {
    for (const [posicao, acontecimento] of data.conjunto.acontecimentos.entries()) {
      expect(indice.porId[acontecimento.id]).toBe(posicao);
      expect(indice.porSlug[acontecimento.slug]).toBe(acontecimento.id);
    }
    expect(Object.keys(indice.porId)).toHaveLength(7);
  });

  it("guardam só identificadores, em ordem cronológica", () => {
    const ordem = data.conjunto.acontecimentos.map((item) => item.id);
    for (const ids of Object.values(indice.porPessoa)) {
      expect(ids).toEqual(ordem.filter((id) => ids.includes(id)));
    }
  });
});

describe("perfis e acontecimentos por identificador", () => {
  it("lista os perfis em ordem estável", () => {
    expect(listProfiles(data).map((pessoa) => pessoa.id)).toEqual([PESSOA_A, PESSOA_B]);
  });

  it("busca perfil e acontecimento por id e por slug", () => {
    expect(findPersonById(data, PESSOA_B)?.nome).toBe("Pessoa Sintética B");
    expect(findPersonBySlug(data, PESSOA_B)?.id).toBe(PESSOA_B);
    expect(findEventById(data, "sintetico-evento-05")?.slug).toBe("sintetico-evento-05");
    expect(findEventBySlug(data, "sintetico-evento-05")?.id).toBe("sintetico-evento-05");
  });

  it("devolve null para o que não existe, inclusive rascunho", () => {
    expect(findPersonById(data, "pessoa-que-nao-existe")).toBeNull();
    expect(findPersonBySlug(data, "")).toBeNull();
    expect(findEventBySlug(data, "sintetico-evento-08")).toBeNull();
    expect(findEventById(data, "sintetico-evento-08")).toBeNull();
  });

  it("não confunde um identificador com o que todo objeto herda", () => {
    expect(findEventBySlug(data, "constructor")).toBeNull();
    expect(findPersonById(data, "toString")).toBeNull();
    expect(filterEvents(data, { pessoaIds: ["constructor"] })).toEqual([]);
    expect(lookup({ a: 1 }, "hasOwnProperty")).toBeUndefined();
  });

  it("um registro com id \"constructor\" continua encontrável", () => {
    const base = baseContent();
    base.acontecimentos[0]!.id = "constructor";
    base.acontecimentos[0]!.slug = "constructor";
    const { data: comId } = createProject({ published: base }).result();
    expect(findEventBySlug(comId!, "constructor")?.titulo).toContain("Acontecimento de teste 01");
  });
});

describe("filtro de acontecimentos", () => {
  it("sem filtro, traz todos em ordem cronológica", () => {
    expect(filter()).toEqual(["01", "02", "03", "04", "05", "06", "07"]);
    expect(filter({ pessoaIds: [], categorias: [], lugarIds: [], periodo: {} })).toHaveLength(7);
  });

  it("por pessoa; com duas pessoas, o acontecimento compartilhado aparece uma vez", () => {
    expect(filter({ pessoaIds: [PESSOA_A] })).toEqual(["01", "02", "03", "07"]);
    expect(filter({ pessoaIds: [PESSOA_A, PESSOA_B] })).toEqual(["01", "02", "03", "04", "05", "06", "07"]);
  });

  it("por categorias: qualquer uma das informadas", () => {
    expect(filter({ categorias: ["eleicoes"] })).toEqual(["01", "05"]);
    expect(filter({ categorias: ["eleicoes", "marcos-historicos"] })).toEqual(["01", "05", "06"]);
  });

  it("por período em anos, com as duas pontas inclusas", () => {
    expect(filter({ periodo: { de: 2011, ate: 2018 } })).toEqual(["03", "04", "05"]);
    expect(filter({ periodo: { de: 2012, ate: 2017 } })).toEqual(["04"]);
    expect(filter({ periodo: { de: 2018, ate: 2018 } })).toEqual(["05"]);
  });

  it("um único ano inclui as datas parciais daquele ano", () => {
    expect(filter({ periodo: { de: 2003, ate: 2003 } })).toEqual(["02"]); // março de 2003
    expect(filter({ periodo: { de: 1994, ate: 1994 } })).toEqual(["01"]); // só o ano
  });

  it("lado aberto do período e período informado ao contrário", () => {
    expect(filter({ periodo: { de: 2012 } })).toEqual(["04", "05", "06", "07"]);
    expect(filter({ periodo: { de: null, ate: 2003 } })).toEqual(["01", "02"]);
    expect(filter({ periodo: { de: 2018, ate: 2011 } })).toEqual(["03", "04", "05"]);
  });

  it("por lugar; o acontecimento que está em dois dos lugares aparece uma vez", () => {
    expect(filter({ lugarIds: ["sintetico-lugar-sudeste", "sintetico-lugar-sul"] })).toEqual(["03"]);
    expect(slugs(listEventsAtPlace(data, "sintetico-lugar-centro"))).toEqual(["02"]);
  });

  it("dimensões diferentes se somam", () => {
    expect(
      filter({ pessoaIds: [PESSOA_B], periodo: { de: 2015, ate: 2025 }, categorias: ["eleicoes"] }),
    ).toEqual(["05"]);
    expect(
      filter({ pessoaIds: [PESSOA_A], lugarIds: ["sintetico-lugar-sul"], periodo: { de: 2011 } }),
    ).toEqual(["03"]);
  });

  it("consulta sem resultado devolve lista vazia, sem erro", () => {
    expect(filter({ periodo: { de: 1800, ate: 1900 } })).toEqual([]);
    expect(filter({ pessoaIds: ["pessoa-que-nao-existe"] })).toEqual([]);
    expect(filter({ lugarIds: ["lugar-que-nao-existe"] })).toEqual([]);
    expect(filter({ pessoaIds: [PESSOA_A], categorias: ["partidos-e-aliancas"] })).toEqual([]);
  });

  it("devolve uma lista nova: quem consulta não altera o conjunto", () => {
    filterEvents(data).pop();
    expect(filterEvents(data)).toHaveLength(7);
  });
});

describe("acontecimento sem coordenadas", () => {
  it("continua nas buscas, nos filtros e na linha do tempo, sem ponto no mapa", () => {
    for (const slug of ["sintetico-evento-04", "sintetico-evento-06"]) {
      const acontecimento = findEventBySlug(data, slug);
      expect(acontecimento, slug).not.toBeNull();
      expect(getEventPlaces(data, acontecimento!)).toEqual([]);
      expect(filterEvents(data).map((item) => item.slug)).toContain(slug);
      expect(data.pontos.features.some((ponto) => ponto.properties.eventId === acontecimento!.id)).toBe(false);
    }
    expect(filter({ pessoaIds: [PESSOA_B], periodo: { de: 2012, ate: 2012 } })).toEqual(["04"]);
  });
});

describe("fontes e lugares relacionados", () => {
  const acontecimento = findEventBySlug(data, "sintetico-evento-03")!;

  it("recupera os lugares na ordem do registro", () => {
    expect(getEventPlaces(data, acontecimento).map((lugar) => lugar.id)).toEqual([
      "sintetico-lugar-sudeste",
      "sintetico-lugar-sul",
    ]);
  });

  it("recupera as fontes de qualquer registro, com a citação de cada uma", () => {
    expect(getSources(data, acontecimento).map(({ citacao, fonte }) => [fonte.id, citacao.localizacao])).toEqual([
      ["sintetico-fonte-03", "Seção de teste 2"],
      ["sintetico-fonte-02", "Anexo de teste A"],
    ]);
    const mandato = data.conjunto.mandatos[0]!;
    expect(getSources(data, mandato).map(({ fonte }) => fonte.id)).toEqual(["sintetico-fonte-01"]);
  });

  it("monta a visão de leitura com pessoas, lugares e citações", () => {
    const visao = getEventView(data, acontecimento);
    expect(visao.pessoas.map((pessoa) => pessoa.id)).toEqual([PESSOA_A, PESSOA_B]);
    expect(visao.lugares).toHaveLength(2);
    expect(visao.citacoes).toHaveLength(2);
  });
});

describe("mandatos e filiações no período", () => {
  const mandates = (pessoaId: string, de?: number, ate?: number) =>
    listMandates(data, { pessoaId, periodo: { de, ate } }).map(
      ({ registro, situacao }) => `${registro.id.replace("sintetico-mandato-", "")}:${situacao}`,
    );

  it("sem período, traz todos os da pessoa", () => {
    expect(mandates(PESSOA_B)).toEqual(["b1:documentada", "b2:documentada"]);
    expect(listMandates(data, { pessoaId: "pessoa-que-nao-existe" })).toEqual([]);
  });

  it("com as duas datas conhecidas, o período é conferido com as pontas inclusas", () => {
    // a1: de 1º de fevereiro de 2003 a 2006.
    expect(mandates(PESSOA_A, 2002, 2002)).toEqual([]);
    expect(mandates(PESSOA_A, 2003, 2003)).toEqual(["a1:documentada"]);
    expect(mandates(PESSOA_A, 2006, 2010)).toEqual(["a1:documentada"]);
    expect(mandates(PESSOA_A, 2007, 2010)).toEqual([]);
  });

  it("limite desconhecido não vira data: o resultado sai como incerto", () => {
    // b1: início desconhecido, fim em março de 2015.
    expect(mandates(PESSOA_B, 2010, 2014)).toEqual(["b1:incerta"]);
    expect(mandates(PESSOA_B, 2015, 2015)).toEqual(["b1:documentada"]);
    expect(mandates(PESSOA_B, 2016, 2018)).toEqual([]);
  });

  it("em-curso vale até a data de corte, e nada é afirmado depois dela", () => {
    // b2: de 2019 em diante; a edição das fixtures tem corte em 8 de outubro de 2026.
    expect(mandates(PESSOA_B, 2019, 2019)).toEqual(["b2:documentada"]);
    expect(mandates(PESSOA_B, 2026, 2026)).toEqual(["b2:documentada"]);
    expect(mandates(PESSOA_B, 2027, 2030)).toEqual([]);
  });

  it("filiações seguem a mesma regra", () => {
    const affiliations = (de: number, ate: number) =>
      listAffiliations(data, { pessoaId: PESSOA_A, periodo: { de, ate } }).map(
        ({ situacao }) => situacao,
      );
    expect(affiliations(1990, 1991)).toEqual([]);
    expect(affiliations(1992, 1992)).toEqual(["documentada"]);
    expect(listAffiliations(data, { pessoaId: PESSOA_B })).toEqual([]);
  });

  it("classifica o período sem limites conhecidos como sempre incerto", () => {
    const semDatas: Periodo = { inicio: { tipo: "desconhecida" }, fim: { tipo: "desconhecida" } };
    const limites = calcPeriodBounds(semDatas, "2026-10-08");
    expect(limites).toEqual({ inicio: null, fim: null });
    expect(classifyOverlap(limites, yearRangeInterval(1900, 1900))).toBe("incerta");
    expect(classifyOverlap(limites, yearRangeInterval(2026, 2026))).toBe("incerta");
  });

  it("com início conhecido e fim desconhecido, só o ano do início é documentado", () => {
    const aberto: Periodo = {
      inicio: { tipo: "data", valor: "1975", precisao: "ano" },
      fim: { tipo: "desconhecida" },
    };
    const limites = calcPeriodBounds(aberto, "2026-10-08");
    expect(classifyOverlap(limites, yearRangeInterval(1974, 1974))).toBe("nenhuma");
    expect(classifyOverlap(limites, yearRangeInterval(1975, 1975))).toBe("documentada");
    expect(classifyOverlap(limites, yearRangeInterval(1980, 1980))).toBe("incerta");
  });
});

describe("comparação das trajetórias", () => {
  it("devolve uma trajetória por pessoa, com o acontecimento compartilhado nas duas", () => {
    const { trajetorias, compartilhados } = compareTrajectories(data);
    expect(trajetorias.map((item) => item.pessoa.id)).toEqual([PESSOA_A, PESSOA_B]);
    expect(slugs(trajetorias[0]!.acontecimentos)).toEqual(["01", "02", "03", "07"]);
    expect(slugs(trajetorias[1]!.acontecimentos)).toEqual(["03", "04", "05", "06"]);
    expect(compartilhados).toEqual(["sintetico-evento-03"]);
  });

  it("aplica o mesmo recorte às duas e traz a cobertura declarada de cada uma", () => {
    const { trajetorias } = compareTrajectories(data, { periodo: { de: 2011, ate: 2018 } });
    expect(slugs(trajetorias[0]!.acontecimentos)).toEqual(["03"]);
    expect(slugs(trajetorias[1]!.acontecimentos)).toEqual(["03", "04", "05"]);
    expect(trajetorias[0]!.mandatos).toEqual([]);
    // O mandato b1 termina em março de 2015, dentro do recorte: a presença é documentada.
    expect(trajetorias[1]!.mandatos.map((item) => item.registro.id)).toEqual(["sintetico-mandato-b1"]);
    expect(trajetorias[1]!.mandatos.map((item) => item.situacao)).toEqual(["documentada"]);
    expect(trajetorias[0]!.cobertura?.periodo.inicio).toMatchObject({ valor: "1990" });
    expect(trajetorias[1]!.cobertura?.periodo.inicio).toMatchObject({ valor: "2010" });
  });

  it("recorte sem registros devolve as trajetórias vazias, e não erro", () => {
    const { trajetorias, compartilhados } = compareTrajectories(data, {
      periodo: { de: 1800, ate: 1850 },
    });
    expect(trajetorias.map((item) => item.acontecimentos)).toEqual([[], []]);
    expect(compartilhados).toEqual([]);
  });
});

describe("ordem estável", () => {
  it("texto é comparado pelo código dos caracteres, sem depender do idioma da máquina", () => {
    expect(["b", "a-b", "ab", "a", "B"].sort(compareText)).toEqual(["B", "a", "a-b", "ab", "b"]);
  });

  it("acontecimentos na mesma data são desempatados pelo id", () => {
    const mesmoDia = { valor: "2011-06-15", precisao: "dia" } as const;
    const lista = [
      { id: "c", data: mesmoDia },
      { id: "a", data: { valor: "2011", precisao: "ano" } as const },
      { id: "b", data: mesmoDia },
      { id: "d", data: { valor: "2011-06", precisao: "mes" } as const },
    ];
    // Primeiro quem pode ter começado antes; no empate, a data mais precisa.
    expect(lista.sort(compareByDate).map((item) => item.id)).toEqual(["a", "d", "b", "c"]);
  });

  it("o gerador ordena o conjunto, qualquer que seja a ordem dos arquivos", () => {
    const base = baseContent();
    base.acontecimentos[4]!.data = base.acontecimentos[2]!.data; // 05 no mesmo dia do 03
    const invertido = structuredClone(base);
    for (const colecao of ["acontecimentos", "lugares", "fontes", "pessoas", "mandatos"] as const) {
      invertido[colecao].reverse();
    }

    const direto = createProject({ published: base }).result().data!;
    const outro = createProject({ published: invertido }).result().data!;
    expect(outro).toEqual(direto);
    expect(slugs(direto.conjunto.acontecimentos)).toEqual(["01", "02", "03", "05", "04", "06", "07"]);
    expect(direto.conjunto.mandatos.map((item) => item.id)).toEqual(
      [...direto.conjunto.mandatos].sort(compareByPeriod).map((item) => item.id),
    );
  });
});
