// A validação do catálogo do Escrivão: regras que um teste aplica ao catálogo
// inteiro, para a fala nunca sair do que o jogo promete. Função pura; devolve
// a lista de problemas, vazia quando o catálogo está certo.

import { ROOM_IDS } from "../rooms";

import { camposDe } from "./selecao";
import { CAMADAS, CAMPOS_DOCUMENTAIS, ESCRIVAO_EVENTS, type Fala } from "./types";

/** Nomes, siglas e adjetivos das pessoas retratadas e dos partidos: fala nenhuma pode trazê-los. As mesmas regras para os dois. */
const PESSOAS_E_PARTIDOS = /\b(lula|bolsonaro|fl[aá]vio|luiz in[aá]cio|pt|pl|psl|patriota|petista|bolsonarista|esquerda|direita|governo|oposi[çc][aã]o)\b/i;
/** Verbos de fala e aspas de citação: o Escrivão não atribui fala a ninguém. */
const FALA_ATRIBUIDA = /["“”«»]|\b(disse|afirmou|declarou|falou|segundo ele|segundo ela)\b/i;
/** Palavras de juízo: o jogo não decide culpa nem valor. */
const JUIZO = /\b(culpad[oa]s?|inocentes?|absolvid[oa]s?|criminos[oa]s?|corrupt[oa]s?|mentir[oa]s?|ladr[aã]o|ladr[oõ]es|her[oó]i|heroína|melhor|pior)\b/i;
/** Um ano ou uma data: só a camada documental, preenchida pelos dados, pode trazê-los. */
const ANO = /\b(?:1[89]|20)\d{2}\b/;

/** Quantas falas de humor, no mínimo, cada evento precisa ter no reserva para a rotação não repetir na hora. */
export const MINIMO_DE_HUMOR = 3;

export function validateCatalog(catalogo: readonly Fala[]): string[] {
  const problemas: string[] = [];
  const ids = new Set<string>();

  for (const fala of catalogo) {
    const onde = `fala ${fala.id}`;
    if (ids.has(fala.id)) problemas.push(`${onde}: identificador repetido.`);
    ids.add(fala.id);
    if (fala.texto.trim().length === 0) problemas.push(`${onde}: texto vazio.`);
    if (!ESCRIVAO_EVENTS.includes(fala.evento)) problemas.push(`${onde}: evento desconhecido (${fala.evento}).`);
    if (!CAMADAS.includes(fala.camada)) problemas.push(`${onde}: camada desconhecida (${fala.camada}).`);
    if (fala.sala !== "todas" && !ROOM_IDS.includes(fala.sala)) problemas.push(`${onde}: sala desconhecida (${fala.sala}).`);
    if (PESSOAS_E_PARTIDOS.test(fala.texto)) problemas.push(`${onde}: cita pessoa, partido ou lado; o Escrivão não fala das pessoas retratadas.`);
    if (FALA_ATRIBUIDA.test(fala.texto)) problemas.push(`${onde}: atribui fala a alguém.`);
    if (JUIZO.test(fala.texto)) problemas.push(`${onde}: traz juízo de valor.`);
    if (fala.texto.includes("—") || fala.texto.includes("–")) problemas.push(`${onde}: travessão ou meia-risca; o projeto não os usa.`);
    const campos = camposDe(fala.texto);
    if (fala.camada === "documental") {
      if (campos.length === 0) problemas.push(`${onde}: fala documental sem campo; o que ela afirma não viria do registro.`);
      for (const campo of campos) if (!(CAMPOS_DOCUMENTAIS as readonly string[]).includes(campo)) problemas.push(`${onde}: campo desconhecido {${campo}}.`);
    } else {
      if (campos.length > 0) problemas.push(`${onde}: só a camada documental pode ter campos.`);
      if (ANO.test(fala.texto)) problemas.push(`${onde}: ano ou data escrita à mão fora da camada documental.`);
    }
    if (fala.camada === "humor" && /\?$/.test(fala.texto.trim()) === false && fala.texto.trim().length > 220) problemas.push(`${onde}: fala de humor longa demais (mais de 220 caracteres).`);
  }

  // Cobertura: todo evento tem instrução de reserva e humor de reserva suficiente para rodar; toda sala tem a sua instrução e o seu humor em todo evento.
  for (const evento of ESCRIVAO_EVENTS) {
    const reserva = catalogo.filter((fala) => fala.evento === evento && fala.sala === "todas");
    if (!reserva.some((fala) => fala.camada === "instrucao")) problemas.push(`evento ${evento}: sem instrução de reserva (sala "todas").`);
    const humorDeReserva = reserva.filter((fala) => fala.camada === "humor").length;
    if (humorDeReserva < MINIMO_DE_HUMOR) problemas.push(`evento ${evento}: ${humorDeReserva} falas de humor no reserva; o mínimo é ${MINIMO_DE_HUMOR}.`);
    for (const sala of ROOM_IDS) {
      const daSala = catalogo.filter((fala) => fala.evento === evento && fala.sala === sala);
      if (!daSala.some((fala) => fala.camada === "instrucao")) problemas.push(`evento ${evento}, sala ${sala}: sem instrução própria.`);
      const humorDaSala = daSala.filter((fala) => fala.camada === "humor").length;
      if (humorDaSala > 0 && humorDaSala < MINIMO_DE_HUMOR) problemas.push(`evento ${evento}, sala ${sala}: ${humorDaSala} falas de humor; com humor próprio, o mínimo é ${MINIMO_DE_HUMOR}.`);
    }
  }
  return problemas;
}
