// A Cidade do Voto (src/lib/world/): o conteúdo de cada prédio é simétrico e
// sai inteiro do conteúdo publicado, e o modo às cegas sorteia os lados sem
// favorecer ninguém nem recomendar voto.

import { describe, expect, it } from "vitest";

import { readSources, resolvePaths } from "@/lib/content/sources";
import { listProposals } from "@/lib/data/proposals";
import { assignSides, programOnSide, reveal, seededRandom } from "@/lib/world/blind";
import { buildWorldContent } from "@/lib/world/content";
import { buildAtlasData } from "@/lib/publication/build";

const data = buildAtlasData(readSources(resolvePaths())).data!;
const mundo = buildWorldContent(data);

describe("conteúdo do mundo sobre a edição publicada", () => {
  it("tem prédios, e cada um traz as duas candidaturas", () => {
    expect(mundo.temas.length).toBeGreaterThan(0);
    for (const tema of mundo.temas) {
      expect(tema.programas.map((programa) => programa.slug).sort()).toEqual(["flavio-bolsonaro", "lula"]);
    }
  });

  it("dá o mesmo número de frases aos dois em cada prédio", () => {
    for (const tema of mundo.temas) {
      const [a, b] = tema.programas;
      expect(a!.propostas.length, tema.tema).toBe(b!.propostas.length);
    }
  });

  it("não escreve texto: toda frase é a do conteúdo publicado, com fonte", () => {
    const publicadas = new Map(data.conjunto.pessoas.flatMap((pessoa) => listProposals(data, pessoa.id)).map((proposta) => [proposta.id, proposta.texto]));
    for (const tema of mundo.temas) {
      for (const programa of tema.programas) {
        for (const proposta of programa.propostas) {
          expect(publicadas.get(proposta.id)).toBe(proposta.texto);
          expect(proposta.fontes.length).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe("modo às cegas", () => {
  it("sorteia os mesmos lados com a mesma semente e lados diferentes com outras", () => {
    expect(assignSides(mundo.temas, 42)).toEqual(assignSides(mundo.temas, 42));
    const variam = new Set(Array.from({ length: 20 }, (_, semente) => JSON.stringify(assignSides(mundo.temas, semente))));
    expect(variam.size).toBeGreaterThan(1);
  });

  it("põe cada pessoa no lado A em cerca de metade dos sorteios", () => {
    const tema = mundo.temas[0]!;
    let lulaEmA = 0;
    const vezes = 2000;
    for (let semente = 0; semente < vezes; semente += 1) {
      if (assignSides([tema], semente)[tema.tema]?.A === "lula") lulaEmA += 1;
    }
    expect(lulaEmA / vezes).toBeGreaterThan(0.45);
    expect(lulaEmA / vezes).toBeLessThan(0.55);
  });

  it("gera números no intervalo [0, 1)", () => {
    const sorteio = seededRandom(7);
    for (let i = 0; i < 100; i += 1) {
      const n = sorteio();
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
    }
  });

  it("revela de quem era cada escolha e conta sem eleger ninguém", () => {
    const lados = assignSides(mundo.temas, 3);
    const [primeiro, segundo, terceiro] = mundo.temas;
    const escolhas = { [primeiro!.tema]: "A", [segundo!.tema]: "nenhum" } as const;
    const resumo = reveal(mundo.temas, lados, escolhas);
    expect(resumo.linhas[0]!.nome).toBe(programOnSide(primeiro!, lados, "A")!.nome);
    expect(resumo.linhas[1]!.nome).toBeNull();
    expect(resumo.nenhum).toBe(1);
    expect(resumo.naoVisitados).toBe(mundo.temas.length - 2);
    expect(terceiro === undefined || resumo.linhas[2]!.escolha === null).toBe(true);
    // As duas pessoas aparecem na contagem, inclusive com zero.
    expect(resumo.contagem.map((linha) => linha.nome).sort()).toEqual(primeiro!.programas.map((programa) => programa.nome).sort());
    expect(resumo.contagem.reduce((soma, linha) => soma + linha.temas, 0)).toBe(1);
  });
});
