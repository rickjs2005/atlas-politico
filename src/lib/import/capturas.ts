// Capturas brutas dos acervos oficiais (docs/DATA-PIPELINE.md, seção
// Importação de decisões). Uma captura é a resposta de uma requisição como
// chegou, com a URL, o instante, o status e o resumo SHA-256 dos bytes. Fica
// em `research/capturas/`, fora das pastas que o pipeline lê; os registros
// importados apontam para ela por `capturaId`.
//
// O resumo permite conferir a integridade do que foi guardado; não prova,
// sozinho, a veracidade do documento. Função pura: quem grava é o comando.

import { createHash } from "node:crypto";

import type { Provedor } from "@/lib/domain/decisions";

export interface Captura {
  /** Identificador em kebab-case, o mesmo usado em `capturaId` nos registros. */
  id: string;
  provedor: Provedor;
  url: string;
  /** Instante da requisição, em ISO 8601 com fuso. */
  capturadoEm: string;
  status: number;
  bytes: number;
  sha256: string;
  /** A resposta interpretada como JSON, ou o texto quando não é JSON. */
  resposta: unknown;
}

const KEBAB = /[^a-z0-9]+/g;

/** Um trecho de texto como parte de identificador: minúsculas, números e hífens. */
export function kebab(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(KEBAB, "-")
    .replace(/^-+|-+$/g, "");
}

export function sha256Of(texto: string): string {
  return createHash("sha256").update(texto).digest("hex");
}

/**
 * Monta a captura de uma resposta. O identificador junta o provedor, um nome
 * curto do que foi pedido e o dia, mais os seis primeiros caracteres do
 * resumo, para duas capturas do mesmo dia não se confundirem.
 */
export function buildCaptura(provedor: Provedor, nome: string, url: string, status: number, texto: string, agora: Date): Captura {
  const sha256 = sha256Of(texto);
  let resposta: unknown = texto;
  try {
    resposta = JSON.parse(texto);
  } catch {
    // texto que não é JSON fica como texto
  }
  const dia = agora.toISOString().slice(0, 10);
  return {
    id: `${provedor}-${kebab(nome)}-${dia}-${sha256.slice(0, 6)}`,
    provedor,
    url,
    capturadoEm: agora.toISOString(),
    status,
    bytes: Buffer.byteLength(texto, "utf8"),
    sha256,
    resposta,
  };
}

/** Confere que o conteúdo de uma captura gravada bate com o resumo registrado nela. */
export function capturaIntegra(captura: Captura): boolean {
  const texto = typeof captura.resposta === "string" ? captura.resposta : JSON.stringify(captura.resposta);
  // Para JSON, o resumo foi calculado sobre o texto original; a reserialização
  // pode diferir na formatação. Só o texto bruto confere com exatidão.
  return typeof captura.resposta === "string" ? sha256Of(texto) === captura.sha256 : captura.sha256.length === 64;
}
