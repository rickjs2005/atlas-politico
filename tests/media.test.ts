// Sonda de arquivos de imagem: formato reconhecido pelo conteúdo e dimensões
// lidas do cabeçalho, sem depender da extensão.

import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterAll, describe, expect, it } from "vitest";

import { probeMedia } from "@/lib/content/media";

import { PUBLIC_DIR, fakeJpeg } from "./helpers";

const dir = mkdtempSync(path.join(tmpdir(), "atlas-midia-"));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

function probe(nome: string, dados: Buffer | string) {
  const arquivo = path.join(dir, nome);
  writeFileSync(arquivo, dados);
  return probeMedia(arquivo);
}

function png(largura: number, altura: number): Buffer {
  const cabecalho = Buffer.alloc(24);
  Buffer.from("89504e470d0a1a0a", "hex").copy(cabecalho, 0);
  cabecalho.writeUInt32BE(13, 8);
  cabecalho.write("IHDR", 12, "ascii");
  cabecalho.writeUInt32BE(largura, 16);
  cabecalho.writeUInt32BE(altura, 20);
  return cabecalho;
}

/** WebP no formato estendido (VP8X): largura e altura menos um, em 24 bits. */
function webp(largura: number, altura: number): Buffer {
  const dados = Buffer.alloc(30);
  dados.write("RIFF", 0, "ascii");
  dados.write("WEBP", 8, "ascii");
  dados.write("VP8X", 12, "ascii");
  dados.writeUIntLE(largura - 1, 24, 3);
  dados.writeUIntLE(altura - 1, 27, 3);
  return dados;
}

describe("sonda de mídia", () => {
  it("arquivo ausente", () => {
    expect(probeMedia(path.join(dir, "nao-existe.jpg"))).toEqual({
      existe: false,
      bytes: 0,
      formato: null,
      largura: null,
      altura: null,
      sha256: null,
    });
  });

  it("lê formato e dimensões de JPEG, PNG e WebP", () => {
    expect(probe("a.jpg", fakeJpeg(960, 1280))).toMatchObject({ formato: "jpeg", largura: 960, altura: 1280 });
    expect(probe("a.png", png(640, 480))).toMatchObject({ formato: "png", largura: 640, altura: 480 });
    expect(probe("a.webp", webp(1200, 800))).toMatchObject({ formato: "webp", largura: 1200, altura: 800 });
  });

  it("reconhece AVIF e SVG, sem dimensões", () => {
    const avif = Buffer.concat([Buffer.from([0, 0, 0, 0x1c]), Buffer.from("ftypavif", "ascii"), Buffer.alloc(16)]);
    expect(probe("a.avif", avif)).toMatchObject({ formato: "avif", largura: null, altura: null });
    expect(probe("a.svg", '<?xml version="1.0"?>\n<svg xmlns="http://www.w3.org/2000/svg"></svg>')).toMatchObject({
      formato: "svg",
      largura: null,
    });
    expect(probe("b.svg", "﻿  <svg viewBox='0 0 1 1'/>").formato).toBe("svg");
  });

  it("o formato vem do conteúdo, e não do nome do arquivo", () => {
    expect(probe("disfarce.jpg", png(10, 10)).formato).toBe("png");
    expect(probe("texto.png", "não é imagem").formato).toBeNull();
    expect(probe("vazio.webp", Buffer.alloc(0))).toMatchObject({ existe: true, bytes: 0, formato: null });
    expect(probe("pagina.svg", "<html><body>svg</body></html>").formato).toBeNull();
  });

  it("o resumo acompanha o conteúdo", () => {
    const a = probe("um.jpg", fakeJpeg(10, 10));
    const b = probe("dois.jpg", fakeJpeg(10, 11));
    expect(a.sha256).toMatch(/^[0-9a-f]{64}$/);
    expect(a.sha256).not.toBe(b.sha256);
    expect(probe("um-de-novo.jpg", fakeJpeg(10, 10)).sha256).toBe(a.sha256);
  });

  it("lê as dimensões dos retratos reais do projeto", () => {
    expect(probeMedia(path.join(PUBLIC_DIR, "media/retratos/lula.jpg"))).toMatchObject({
      formato: "jpeg",
      largura: 960,
      altura: 1317,
    });
    expect(probeMedia(path.join(PUBLIC_DIR, "media/retratos/flavio-bolsonaro.jpg"))).toMatchObject({
      formato: "jpeg",
      largura: 960,
      altura: 1279,
    });
  });
});
