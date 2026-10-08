import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";
import { z } from "zod";

import { InvalidContentError, loadContentSet, loadPublishedSet } from "@/lib/content/load";
import { checkIntegrity } from "@/lib/domain/integrity";
import { PROFILES } from "@/lib/domain/profiles";
import { acontecimentoSchema, conjuntoSchema } from "@/lib/domain/schemas";

import { DRAFTS_DIR, FIXTURES_DIR, PUBLIC_DIR, PUBLISHED_DIR } from "./helpers";

const temporarias: string[] = [];

/** Pasta de conteúdo descartável, com os arquivos informados. */
function contentDir(arquivos: Record<string, string>): string {
  const dir = mkdtempSync(path.join(tmpdir(), "atlas-conteudo-"));
  temporarias.push(dir);
  for (const [nome, conteudo] of Object.entries(arquivos)) {
    writeFileSync(path.join(dir, nome), conteudo, "utf8");
  }
  return dir;
}

const fixture = (nome: string) => readFileSync(path.join(FIXTURES_DIR, nome), "utf8");

afterEach(() => {
  for (const dir of temporarias.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("leitura de uma pasta de conteúdo", () => {
  it("lê o conjunto sintético inteiro", () => {
    const conjunto = loadContentSet(FIXTURES_DIR);
    expect(conjunto?.edicao.versao).toBe("0.0.1");
    expect(conjunto?.pessoas).toHaveLength(2);
    expect(conjunto?.acontecimentos).toHaveLength(8);
  });

  it("trata coleção sem arquivo como lista vazia", () => {
    expect(readdirSync(FIXTURES_DIR)).not.toContain("imagens.json");
    expect(loadContentSet(FIXTURES_DIR)?.imagens).toEqual([]);
  });

  it("devolve null quando ainda não há edição", () => {
    expect(loadContentSet(contentDir({}))).toBeNull();
    expect(loadContentSet(path.join(tmpdir(), "atlas-pasta-que-nao-existe"))).toBeNull();
  });

  it("aceita arquivo salvo com BOM", () => {
    const dir = contentDir({ "edicao.json": `﻿${fixture("edicao.json")}` });
    // A edição cita pessoas que não estão na pasta; o que importa aqui é o JSON ter sido lido.
    expect(() => loadContentSet(dir)).toThrow(/Referência a pessoa inexistente/);
  });

  it("recusa arquivo fora do contrato, como um nome digitado errado", () => {
    const dir = contentDir({ "edicao.json": fixture("edicao.json"), "acontecimento.json": "[]" });
    expect(() => loadContentSet(dir)).toThrow(/acontecimento\.json: Arquivo não faz parte do contrato/);
  });

  it("recusa coleções sem o arquivo da edição", () => {
    const dir = contentDir({ "fontes.json": fixture("fontes.json") });
    expect(() => loadContentSet(dir)).toThrow(/falta o arquivo da edição/);
  });

  it("recusa JSON ilegível dizendo qual arquivo", () => {
    const dir = contentDir({ "edicao.json": "{ isto não é json" });
    expect(() => loadContentSet(dir)).toThrow(/edicao\.json: JSON ilegível/);
  });

  it("aponta o registro e o campo com problema", () => {
    const lugares = JSON.parse(fixture("lugares.json")) as { latitude: number }[];
    lugares[2]!.latitude = 120;
    const dir = contentDir({
      "edicao.json": fixture("edicao.json"),
      "lugares.json": JSON.stringify(lugares),
    });

    let erro: unknown;
    try {
      loadContentSet(dir);
    } catch (capturado) {
      erro = capturado;
    }
    expect(erro).toBeInstanceOf(InvalidContentError);
    expect((erro as InvalidContentError).problemas[0]?.caminho).toBe(
      'lugares["sintetico-lugar-centro"].latitude',
    );
  });
});

describe("conjunto publicado", () => {
  it("sem edição, devolve o conjunto vazio", () => {
    const conjunto = loadPublishedSet(contentDir({}));
    expect(conjunto.edicao).toBeNull();
    expect(conjunto.acontecimentos).toEqual([]);
  });

  it("recusa o conjunto sintético: tem rascunho e tem dado de teste", () => {
    expect(() => loadPublishedSet(FIXTURES_DIR)).toThrow(InvalidContentError);
    expect(() => loadPublishedSet(FIXTURES_DIR)).toThrow(/"rascunho" não pode ser publicado/);
    expect(() => loadPublishedSet(FIXTURES_DIR)).toThrow(/Dado sintético de teste/);
  });
});

describe("content/published do repositório", () => {
  it("passa pelas regras de publicação", () => {
    expect(() => loadPublishedSet(PUBLISHED_DIR)).not.toThrow();
  });

  it("não contém nenhum marcador de dado sintético", () => {
    const arquivos = readdirSync(PUBLISHED_DIR).filter((nome) => nome.endsWith(".json"));
    for (const nome of arquivos) {
      const conteudo = readFileSync(path.join(PUBLISHED_DIR, nome), "utf8");
      expect(conteudo, nome).not.toMatch(/sint[eé]tico|exemplo\.invalid/i);
    }
  });

  it("tem os dois perfis da primeira edição, cada um com 15 a 20 acontecimentos", () => {
    const conjunto = loadPublishedSet(PUBLISHED_DIR);
    expect(conjunto.edicao).not.toBeNull();

    for (const perfil of PROFILES) {
      const pessoa = conjunto.pessoas.find((item) => item.slug === perfil.slug);
      expect(pessoa, perfil.slug).toBeDefined();

      const total = conjunto.acontecimentos.filter((item) =>
        item.pessoaIds.includes(pessoa!.id),
      ).length;
      expect(total, perfil.slug).toBeGreaterThanOrEqual(15);
      expect(total, perfil.slug).toBeLessThanOrEqual(20);
    }
  });

  it("não registra revisão humana que não aconteceu", () => {
    // Enquanto ninguém revisar o conjunto, toda revisão é assistida por IA.
    // Este teste deve ser ajustado quando a primeira revisão humana for registrada.
    const conjunto = loadPublishedSet(PUBLISHED_DIR);
    const registros = [
      ...conjunto.pessoas,
      ...conjunto.mandatos,
      ...conjunto.filiacoes,
      ...conjunto.acontecimentos,
    ];
    for (const registro of registros) {
      expect(registro.editorial.estado, registro.id).toBe("revisado");
      if (registro.editorial.estado === "revisado") {
        expect(registro.editorial.revisao.tipo, registro.id).toBe("assistida-por-ia");
      }
    }
    expect(conjunto.edicao?.revisao.tipo).toBe("assistida-por-ia");
  });

  it("toda imagem cadastrada tem o arquivo em public/", () => {
    for (const imagem of loadPublishedSet(PUBLISHED_DIR).imagens) {
      expect(existsSync(path.join(PUBLIC_DIR, imagem.arquivo)), imagem.arquivo).toBe(true);
    }
  });
});

describe("content/drafts do repositório", () => {
  // Os rascunhos são coleções parciais: citam pessoas, lugares e fontes do
  // conjunto publicado. Por isso são validados junto com ele.
  const readDrafts = () => {
    const arquivo = path.join(DRAFTS_DIR, "acontecimentos.json");
    return existsSync(arquivo) ? (JSON.parse(readFileSync(arquivo, "utf8")) as unknown[]) : [];
  };

  it("só aceita o arquivo de acontecimentos em rascunho", () => {
    const arquivos = readdirSync(DRAFTS_DIR).filter((nome) => nome.endsWith(".json"));
    expect(arquivos.filter((nome) => nome !== "acontecimentos.json")).toEqual([]);
  });

  it("os rascunhos são válidos e se encaixam no conjunto publicado", () => {
    const publicado = loadContentSet(PUBLISHED_DIR);
    expect(publicado).not.toBeNull();

    const combinado = conjuntoSchema.safeParse({
      ...publicado,
      acontecimentos: [...publicado!.acontecimentos, ...readDrafts()],
    });
    expect(combinado.error?.issues ?? []).toEqual([]);
    expect(checkIntegrity(combinado.data!)).toEqual([]);
  });

  it("nenhum rascunho está marcado como revisado, e todos dizem o que falta", () => {
    const rascunhos = z.array(acontecimentoSchema).parse(readDrafts());
    for (const rascunho of rascunhos) {
      expect(rascunho.editorial.estado, rascunho.id).not.toBe("revisado");
      if (rascunho.editorial.estado !== "revisado") {
        expect(rascunho.editorial.pendencias?.length ?? 0, rascunho.id).toBeGreaterThan(0);
      }
    }
  });
});
