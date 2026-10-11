// Capturas brutas dos acervos oficiais (docs/DATA-PIPELINE.md, seção
// Importação de decisões). Uma captura é a resposta de uma requisição como
// chegou, com a URL, o instante, o status, o corpo original e o resumo
// SHA-256 dele. Fica em `research/capturas/`, fora das pastas que o pipeline
// lê; os registros importados apontam para ela por `capturaId`.
//
// O resumo permite conferir a integridade do que foi guardado; não prova,
// sozinho, a veracidade do documento. A conferência (`verificarCaptura`) só
// vale sobre o corpo original: uma captura gravada sem ele (formato anterior
// a 11 de outubro de 2026) é declarada não verificável, e não íntegra. Função
// pura: quem grava é o comando `importar:decisoes`; quem confere, o comando
// `capturas:verificar`.

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
  /** Tamanho do corpo original, em bytes UTF-8. */
  bytes: number;
  /** Resumo SHA-256 do corpo original, em hexadecimal. */
  sha256: string;
  /**
   * O corpo da resposta exatamente como chegou. É sobre ele que o resumo é
   * calculado e conferido. Ausente nas capturas gravadas antes de 11 de
   * outubro de 2026, que por isso não são verificáveis.
   */
  corpo?: string;
  /** A resposta interpretada como JSON, ou o texto quando não é JSON: uma leitura de conveniência do corpo. */
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
    corpo: texto,
    resposta,
  };
}

/** O resultado da conferência de uma captura gravada. */
export type VerificacaoDeCaptura =
  | { estado: "integra" }
  | { estado: "adulterada"; motivo: string }
  | { estado: "nao-verificavel"; motivo: string };

const SHA256 = /^[0-9a-f]{64}$/;

/**
 * Confere uma captura gravada: o resumo e o tamanho registrados batem com o
 * corpo original, e a resposta interpretada corresponde a ele. Alterar o
 * corpo, o resumo, o tamanho ou a resposta reprova. Sem o corpo original não
 * há o que conferir: a captura é declarada não verificável, nunca íntegra, e
 * o resumo não é recalculado sobre uma reserialização.
 */
export function verificarCaptura(captura: Captura): VerificacaoDeCaptura {
  if (!SHA256.test(captura.sha256)) return { estado: "adulterada", motivo: "o resumo registrado não é um SHA-256 em hexadecimal" };
  if (typeof captura.corpo !== "string") {
    // O formato anterior gravava só a resposta interpretada; um texto que não era JSON é o próprio corpo.
    if (typeof captura.resposta === "string") {
      return sha256Of(captura.resposta) === captura.sha256
        ? { estado: "integra" }
        : { estado: "adulterada", motivo: "o resumo registrado não bate com o texto da resposta" };
    }
    return { estado: "nao-verificavel", motivo: "captura gravada sem o corpo original (formato anterior a 11 de outubro de 2026); o resumo não pode ser conferido" };
  }
  if (sha256Of(captura.corpo) !== captura.sha256) return { estado: "adulterada", motivo: "o resumo registrado não bate com o corpo" };
  if (Buffer.byteLength(captura.corpo, "utf8") !== captura.bytes) return { estado: "adulterada", motivo: "o tamanho registrado não bate com o corpo" };
  // Texto que não é JSON: a resposta é o próprio corpo. Um corpo que é um texto JSON (com as aspas) cai na comparação abaixo.
  if (typeof captura.resposta === "string" && captura.resposta === captura.corpo) return { estado: "integra" };
  try {
    if (JSON.stringify(JSON.parse(captura.corpo)) !== JSON.stringify(captura.resposta)) {
      return { estado: "adulterada", motivo: "a resposta interpretada não corresponde ao corpo" };
    }
  } catch {
    return { estado: "adulterada", motivo: typeof captura.resposta === "string" ? "a resposta registrada não é o corpo" : "o corpo não é o JSON de que a resposta interpretada foi lida" };
  }
  return { estado: "integra" };
}

/** A captura está íntegra: verificável e sem alteração. Não verificável conta como não íntegra. */
export function capturaIntegra(captura: Captura): boolean {
  return verificarCaptura(captura).estado === "integra";
}
