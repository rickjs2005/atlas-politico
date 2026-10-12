import { describe, expect, it } from "vitest";

import { SYNTHETIC_PREFIX, checkIntegrity, checkPublication } from "@/lib/domain/integrity";
import { conjuntoSchema, type Conjunto } from "@/lib/domain/schemas";

import { loadFixtures } from "./helpers";

const messages = (conjunto: Conjunto) => checkIntegrity(conjunto).map((issue) => issue.mensagem);

/** O conjunto sintético com cara de publicável: sem prefixo e sem rascunho. */
function publishable(): Conjunto {
  const texto = JSON.stringify(loadFixtures()).replaceAll(SYNTHETIC_PREFIX, "verificacao-");
  const conjunto = conjuntoSchema.parse(JSON.parse(texto));
  conjunto.acontecimentos = conjunto.acontecimentos.filter(
    (item) => item.editorial.estado === "revisado",
  );
  return conjunto;
}

describe("integridade do conjunto", () => {
  it("o conjunto sintético é coerente", () => {
    expect(checkIntegrity(loadFixtures())).toEqual([]);
  });

  it("acusa identificador repetido", () => {
    const conjunto = loadFixtures();
    conjunto.lugares.push(structuredClone(conjunto.lugares[0]!));
    expect(messages(conjunto)).toContain('Identificador repetido: "sintetico-lugar-norte".');
  });

  it("acusa slug repetido", () => {
    const conjunto = loadFixtures();
    conjunto.acontecimentos[1]!.slug = conjunto.acontecimentos[0]!.slug;
    expect(messages(conjunto)).toContain('Slug repetido: "sintetico-evento-01".');
  });

  it.each([
    ["pessoa", (c: Conjunto) => c.acontecimentos[0]!.pessoaIds.push("pessoa-que-nao-existe")],
    ["pessoa", (c: Conjunto) => (c.mandatos[0]!.pessoaId = "pessoa-que-nao-existe")],
    ["fonte", (c: Conjunto) => (c.acontecimentos[0]!.fontes[0]!.fonteId = "fonte-que-nao-existe")],
    ["imagem", (c: Conjunto) => (c.pessoas[0]!.retratoId = "imagem-que-nao-existe")],
    [
      "lugar",
      (c: Conjunto) =>
        (c.acontecimentos[0]!.localizacao = { tipo: "lugares", lugarIds: ["lugar-que-nao-existe"] }),
    ],
  ])("acusa referência a %s inexistente", (alvo, quebrar) => {
    const conjunto = loadFixtures();
    quebrar(conjunto);
    const problemas = checkIntegrity(conjunto);
    expect(problemas).toHaveLength(1);
    expect(problemas[0]!.mensagem).toContain(`Referência a ${alvo} inexistente`);
  });

  it("acusa acontecimento posterior à data de corte", () => {
    const conjunto = loadFixtures();
    conjunto.acontecimentos[0]!.data = { valor: "2026-10-09", precisao: "dia" };
    const [problema] = checkIntegrity(conjunto);
    expect(problema?.caminho).toBe('acontecimentos["sintetico-evento-01"].data');
    expect(problema?.mensagem).toContain("data de corte");
  });

  it("aceita acontecimento no próprio dia de corte ou com ano parcial que o contém", () => {
    const conjunto = loadFixtures();
    conjunto.acontecimentos[0]!.data = { valor: "2026-10-08", precisao: "dia" };
    conjunto.acontecimentos[1]!.data = { valor: "2026", precisao: "ano" };
    expect(checkIntegrity(conjunto)).toEqual([]);
  });
});

describe("regras de publicação", () => {
  it("um conjunto todo revisado e sem dados de teste pode ser publicado", () => {
    const conjunto = publishable();
    expect(checkIntegrity(conjunto)).toEqual([]);
    expect(checkPublication(conjunto)).toEqual([]);
  });

  it("barra rascunho", () => {
    const conjunto = publishable();
    conjunto.acontecimentos[0]!.editorial = { estado: "rascunho" };
    const [problema, ...resto] = checkPublication(conjunto);
    expect(resto).toEqual([]);
    expect(problema?.mensagem).toContain('"rascunho" não pode ser publicado');
  });

  it("barra registro em revisão, inclusive de mandato", () => {
    const conjunto = publishable();
    conjunto.mandatos[0]!.editorial = { estado: "em-revisao" };
    expect(checkPublication(conjunto)).toHaveLength(1);
  });

  it("barra todo o conjunto sintético", () => {
    const conjunto = loadFixtures();
    const sinteticos = checkPublication(conjunto).filter((issue) =>
      issue.mensagem.includes("Dado sintético"),
    );
    const totalDeRegistros =
      conjunto.pessoas.length +
      conjunto.mandatos.length +
      conjunto.filiacoes.length +
      conjunto.acontecimentos.length +
      conjunto.proposicoes.length +
      conjunto.votacoes.length +
      conjunto.votos.length +
      conjunto.atosExecutivos.length +
      conjunto.atuacoesLegislativas.length +
      conjunto.coberturaPolitica.length +
      conjunto.identidadesInstitucionais.length +
      conjunto.propostasEleitorais.length +
      conjunto.fatosBiograficos.length +
      conjunto.conceitos.length +
      conjunto.fasesDoJogo.length +
      conjunto.lugares.length +
      conjunto.fontes.length +
      conjunto.imagens.length;
    expect(sinteticos).toHaveLength(totalDeRegistros);
  });
});
