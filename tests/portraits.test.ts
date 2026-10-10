// Fase 8: as versões preparadas dos retratos. O que o componente pede tem de
// ser o que o comando `npm run images` gerou, a partir do arquivo que o
// conteúdo cadastra.

import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  DERIVED_DIR,
  PORTRAIT_SHAPES,
  derivedHeight,
  derivedPath,
  derivedQuality,
  derivedSources,
  type PortraitShape,
} from "@/lib/media/portraits";

interface Box {
  x: number;
  y: number;
  largura: number;
  altura: number;
}

const read = <T,>(arquivo: string) => JSON.parse(readFileSync(arquivo, "utf8")) as T;
const manifesto = read<{
  molduras: Record<PortraitShape, { codigo: string; larguras: number[] }>;
  imagens: Record<string, { origem: string; sha256: string; enquadramento: Record<PortraitShape, Box>; arquivos: Record<string, number> }>;
}>("src/lib/media/portraits.manifest.json");
const imagens = read<{ id: string; arquivo: string; dimensoes?: { largura: number; altura: number } }[]>(
  "content/published/imagens.json",
);
const pessoas = read<{ nome: string; retratoId: string | null }[]>("content/published/pessoas.json");
const SHAPES = Object.keys(PORTRAIT_SHAPES) as PortraitShape[];

describe("nomes e medidas das versões", () => {
  it("o caminho diz a imagem, a moldura e a largura", () => {
    expect(derivedPath("retrato-lula", "retrato", 320)).toBe("/media/derivados/retrato-lula-4x5-320.webp");
    expect(derivedPath("retrato-lula", "quadrado", 64)).toBe("/media/derivados/retrato-lula-1x1-64.webp");
  });

  it("a altura segue a proporção da moldura", () => {
    expect(derivedHeight("retrato", 320)).toBe(400);
    expect(derivedHeight("quadrado", 96)).toBe(96);
  });

  it("o que vai na imagem: uma versão por largura, e as dimensões da versão padrão", () => {
    for (const shape of SHAPES) {
      const { larguras, padrao } = PORTRAIT_SHAPES[shape];
      const fontes = derivedSources("retrato-lula", shape);
      const candidatos = fontes.srcSet.split(", ");

      expect(candidatos).toHaveLength(larguras.length);
      for (const [indice, largura] of larguras.entries()) {
        expect(candidatos[indice]).toBe(`${derivedPath("retrato-lula", shape, largura)} ${largura}w`);
      }
      // Larguras em ordem crescente: é como o navegador espera a lista.
      expect([...larguras].sort((a, b) => a - b)).toEqual([...larguras]);
      expect(larguras).toContain(padrao);
      expect(fontes.src).toBe(derivedPath("retrato-lula", shape, padrao));
      expect(fontes.height).toBe(derivedHeight(shape, fontes.width));
    }
  });

  it("as versões grandes, que só vão para telas de alta densidade, são mais comprimidas", () => {
    expect(derivedQuality(320)).toBeGreaterThan(derivedQuality(480));
    expect(derivedQuality(160)).toBe(derivedQuality(320));
  });
});

describe("versões geradas", () => {
  const retratos = pessoas.flatMap((pessoa) => (pessoa.retratoId === null ? [] : [pessoa.retratoId]));

  it("todo retrato de perfil da edição tem versões, e só eles", () => {
    expect(Object.keys(manifesto.imagens).sort()).toEqual([...retratos].sort());
  });

  it("o manifesto registra as mesmas molduras e larguras que o componente pede", () => {
    for (const shape of SHAPES) {
      expect(manifesto.molduras[shape].codigo).toBe(PORTRAIT_SHAPES[shape].codigo);
      expect(manifesto.molduras[shape].larguras).toEqual([...PORTRAIT_SHAPES[shape].larguras]);
    }
  });

  it("cada versão que a página pode pedir existe, com o tamanho registrado", () => {
    for (const id of retratos) {
      const esperados = SHAPES.flatMap((shape) => PORTRAIT_SHAPES[shape].larguras.map((largura) => derivedPath(id, shape, largura)));
      expect(Object.keys(manifesto.imagens[id]!.arquivos).sort()).toEqual([...esperados].sort());
      for (const caminho of esperados) {
        const arquivo = path.join("public", caminho);
        expect(existsSync(arquivo), caminho).toBe(true);
        expect(statSync(arquivo).size, caminho).toBe(manifesto.imagens[id]!.arquivos[caminho]);
      }
    }
  });

  it("a pasta das versões não guarda arquivo sem uso", () => {
    const registrados = new Set(
      Object.values(manifesto.imagens).flatMap((imagem) => Object.keys(imagem.arquivos).map((caminho) => path.basename(caminho))),
    );
    for (const nome of readdirSync(path.join("public", DERIVED_DIR))) {
      expect(registrados.has(nome), nome).toBe(true);
    }
  });

  it("as versões saíram do original que o conteúdo cadastra, e ele não mudou desde então", () => {
    for (const id of retratos) {
      const cadastro = imagens.find((imagem) => imagem.id === id)!;
      const entrada = manifesto.imagens[id]!;
      expect(entrada.origem).toBe(cadastro.arquivo);
      const original = readFileSync(path.join("public", cadastro.arquivo));
      expect(createHash("sha256").update(original).digest("hex"), id).toBe(entrada.sha256);
    }
  });

  it("o enquadramento cabe no original, está na proporção da moldura e não amplia a imagem", () => {
    for (const id of retratos) {
      const { dimensoes } = imagens.find((imagem) => imagem.id === id)!;
      expect(dimensoes, `dimensões de ${id}`).toBeDefined();
      for (const shape of SHAPES) {
        const box = manifesto.imagens[id]!.enquadramento[shape];
        const [w, h] = PORTRAIT_SHAPES[shape].proporcao;
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.y).toBeGreaterThanOrEqual(0);
        expect(box.x + box.largura).toBeLessThanOrEqual(dimensoes!.largura);
        expect(box.y + box.altura).toBeLessThanOrEqual(dimensoes!.altura);
        expect(Math.abs(box.largura / box.altura - w / h)).toBeLessThan(0.005);
        expect(box.largura).toBeGreaterThanOrEqual(Math.max(...PORTRAIT_SHAPES[shape].larguras));
      }
    }
  });

  it("os dois perfis têm o mesmo número de versões, nas mesmas larguras", () => {
    const contagens = retratos.map((id) => Object.keys(manifesto.imagens[id]!.arquivos).length);
    expect(new Set(contagens).size).toBe(1);
  });
});
