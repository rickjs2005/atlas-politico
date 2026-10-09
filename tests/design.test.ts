// Base visual: os tokens de `globals.css` são a única origem das cores. O que
// o WebGL do mapa repete tem de bater com eles, e as combinações de texto e
// de marca usadas na interface têm de passar no contraste mínimo.

import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { CATEGORY_VISUAL } from "@/components/Category";
import { CATEGORY_COLORS, PALETTE_TOKENS } from "@/features/map/palette";
import { CATEGORIAS } from "@/lib/domain/categories";
import { PROFILES } from "@/lib/domain/profiles";

const css = readFileSync("src/app/globals.css", "utf8");

/** Tokens declarados em `:root`, pelo nome. */
const tokens = Object.fromEntries(
  [...css.matchAll(/(--atlas-[a-z-]+):\s*(#[0-9a-f]{6})\s*;/g)].map(([, nome, valor]) => [nome!, valor!]),
);
const token = (nome: string): string => {
  const valor = tokens[nome];
  if (valor === undefined) throw new Error(`Token ${nome} não está em globals.css.`);
  return valor;
};

/** Luminância relativa e contraste, como na WCAG 2.x. */
function luminance(hex: string): number {
  const canais = [1, 3, 5].map((inicio) => parseInt(hex.slice(inicio, inicio + 2), 16) / 255);
  const [r, g, b] = canais.map((canal) =>
    canal <= 0.03928 ? canal / 12.92 : ((canal + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}
function contrast(a: string, b: string): number {
  const [claro, escuro] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (claro! + 0.05) / (escuro! + 0.05);
}

const SUPERFICIES = ["--atlas-paper", "--atlas-paper-raised", "--atlas-paper-sunken"];
const CATEGORY_TOKENS = [
  "--atlas-cat-mandatos",
  "--atlas-cat-eleicoes",
  "--atlas-cat-partidos",
  "--atlas-cat-atuacao",
  "--atlas-cat-marcos",
];

describe("tokens e mapa", () => {
  it("cada cor repetida no mapa é igual ao token de globals.css", () => {
    for (const [nome, valor] of Object.entries(PALETTE_TOKENS)) {
      expect(token(nome), nome).toBe(valor);
    }
  });

  it("toda categoria tem cor no mapa e forma própria na interface", () => {
    expect(Object.keys(CATEGORY_COLORS).sort()).toEqual([...CATEGORIAS].sort());
    const formas = CATEGORIAS.map((categoria) => CATEGORY_VISUAL[categoria].forma);
    // A categoria não depende da cor: nenhuma forma se repete.
    expect(new Set(formas).size).toBe(CATEGORIAS.length);
  });
});

describe("contraste", () => {
  it.each(["--atlas-ink", "--atlas-ink-soft", "--atlas-ink-faint"])(
    "%s passa de 4,5:1 sobre as três superfícies de papel",
    (tinta) => {
      for (const superficie of SUPERFICIES) {
        expect(contrast(token(tinta), token(superficie)), superficie).toBeGreaterThanOrEqual(4.5);
      }
    },
  );

  it("o texto sobre os fundos de seleção e de aviso passa de 4,5:1", () => {
    for (const fundo of ["--atlas-accent-soft", "--atlas-notice"]) {
      expect(contrast(token("--atlas-ink"), token(fundo)), fundo).toBeGreaterThanOrEqual(4.5);
      expect(contrast(token("--atlas-ink-soft"), token(fundo)), fundo).toBeGreaterThanOrEqual(4.5);
    }
    // Botão invertido: papel sobre tinta.
    expect(contrast(token("--atlas-paper"), token("--atlas-ink"))).toBeGreaterThanOrEqual(4.5);
  });

  it("o acento e as cores de categoria passam de 3:1 onde aparecem como marca", () => {
    const fundos = [...SUPERFICIES, "--atlas-accent-soft", "--atlas-map-land", "--atlas-map-land-focus"];
    for (const cor of ["--atlas-accent", ...CATEGORY_TOKENS]) {
      for (const fundo of fundos) {
        expect(contrast(token(cor), token(fundo)), `${cor} sobre ${fundo}`).toBeGreaterThanOrEqual(3);
      }
    }
  });
});

describe("equivalência dos perfis", () => {
  it("a ordem dos perfis é alfabética, e não escolha editorial", () => {
    const nomes = PROFILES.map((perfil) => perfil.nome);
    expect(nomes).toEqual([...nomes].sort((a, b) => a.localeCompare(b, "pt-BR")));
  });

  it("nenhum token de cor pertence a uma pessoa", () => {
    const nomes = Object.keys(tokens).join(" ");
    for (const perfil of PROFILES) {
      for (const parte of perfil.slug.split("-")) expect(nomes).not.toContain(parte);
    }
  });
});
