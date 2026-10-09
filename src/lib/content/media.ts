// Sonda dos arquivos de imagem cadastrados: existe, é do formato que a
// extensão diz e tem as dimensões declaradas? Lê só o cabeçalho, sem
// biblioteca. Dimensões saem para JPEG, PNG e WebP; AVIF e SVG são apenas
// reconhecidos.

import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";

import type { FormatoDeMidia, MediaProbe } from "@/lib/publication/sources";

interface Size {
  largura: number;
  altura: number;
}

function jpegSize(dados: Buffer): Size | null {
  let posicao = 2;
  while (posicao + 9 < dados.length) {
    if (dados[posicao] !== 0xff) return null;
    const marcador = dados[posicao + 1] ?? 0;
    // Bytes de preenchimento e marcadores sem conteúdo.
    if (marcador === 0xff) {
      posicao += 1;
      continue;
    }
    if (marcador === 0x01 || (marcador >= 0xd0 && marcador <= 0xd9)) {
      posicao += 2;
      continue;
    }
    // Quadro de imagem (SOF), exceto tabelas que usam a mesma faixa de códigos.
    const quadro = marcador >= 0xc0 && marcador <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marcador);
    if (quadro) {
      return { altura: dados.readUInt16BE(posicao + 5), largura: dados.readUInt16BE(posicao + 7) };
    }
    posicao += 2 + dados.readUInt16BE(posicao + 2);
  }
  return null;
}

function webpSize(dados: Buffer): Size | null {
  if (dados.length < 30) return null;
  const bloco = dados.toString("ascii", 12, 16);
  if (bloco === "VP8X") {
    return { largura: 1 + dados.readUIntLE(24, 3), altura: 1 + dados.readUIntLE(27, 3) };
  }
  if (bloco === "VP8 ") {
    return { largura: dados.readUInt16LE(26) & 0x3fff, altura: dados.readUInt16LE(28) & 0x3fff };
  }
  if (bloco === "VP8L") {
    const bits = dados.readUInt32LE(21);
    return { largura: 1 + (bits & 0x3fff), altura: 1 + ((bits >> 14) & 0x3fff) };
  }
  return null;
}

function identify(dados: Buffer): { formato: FormatoDeMidia; tamanho: Size | null } | null {
  if (dados.length >= 3 && dados[0] === 0xff && dados[1] === 0xd8 && dados[2] === 0xff) {
    return { formato: "jpeg", tamanho: jpegSize(dados) };
  }
  if (dados.length >= 24 && dados.subarray(0, 8).equals(Buffer.from("89504e470d0a1a0a", "hex"))) {
    return {
      formato: "png",
      tamanho: { largura: dados.readUInt32BE(16), altura: dados.readUInt32BE(20) },
    };
  }
  if (
    dados.length >= 12 &&
    dados.toString("ascii", 0, 4) === "RIFF" &&
    dados.toString("ascii", 8, 12) === "WEBP"
  ) {
    return { formato: "webp", tamanho: webpSize(dados) };
  }
  if (
    dados.length >= 12 &&
    dados.toString("ascii", 4, 8) === "ftyp" &&
    ["avif", "avis"].includes(dados.toString("ascii", 8, 12))
  ) {
    return { formato: "avif", tamanho: null };
  }
  const inicio = dados.toString("utf8", 0, 512).replace(/^﻿/, "").trimStart();
  if (/^(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*(<!DOCTYPE svg[^>]*>\s*)?<svg[\s>]/i.test(inicio)) {
    return { formato: "svg", tamanho: null };
  }
  return null;
}

export function probeMedia(arquivo: string): MediaProbe {
  if (!existsSync(arquivo) || !statSync(arquivo).isFile()) {
    return { existe: false, bytes: 0, formato: null, largura: null, altura: null, sha256: null };
  }

  const dados = readFileSync(arquivo);
  const identificado = identify(dados);
  return {
    existe: true,
    bytes: dados.length,
    formato: identificado?.formato ?? null,
    largura: identificado?.tamanho?.largura ?? null,
    altura: identificado?.tamanho?.altura ?? null,
    sha256: createHash("sha256").update(dados).digest("hex"),
  };
}
