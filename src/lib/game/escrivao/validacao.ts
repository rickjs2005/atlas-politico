// A validação do catálogo do Escrivão: regras que um teste aplica ao catálogo
// inteiro, para a fala nunca sair do que o jogo promete. Função pura; devolve
// a lista de problemas, vazia quando o catálogo está certo.

import { ROOM_IDS } from "../rooms";

import { CAMADAS, ESCRIVAO_EVENTS, type Fala } from "./types";

/** Nomes, siglas e adjetivos das pessoas retratadas e dos partidos: fala nenhuma pode trazê-los. As mesmas regras para os dois. */
const PESSOAS_E_PARTIDOS = /\b(lula|bolsonaro|fl[aá]vio|luiz in[aá]cio|pt|pl|psl|patriota|petista|bolsonarista|esquerda|direita|governo|oposi[çc][aã]o)\b/i;
/** Verbos de fala e aspas de citação: o Escrivão não atribui fala a ninguém. */
const FALA_ATRIBUIDA = /["“”«»]|\b(disse|afirmou|declarou|falou|segundo ele|segundo ela)\b/i;
/** Palavras de juízo: o jogo não decide culpa nem valor. */
const JUIZO = /\b(culpad[oa]s?|inocentes?|absolvid[oa]s?|criminos[oa]s?|corrupt[oa]s?|mentir[oa]s?|ladr[aã]o|ladr[oõ]es|her[oó]i|heroína|melhor|pior)\b/i;
/**
 * Outras pessoas, mesmo inventadas: o humor é sobre a papelada e sobre o
 * próprio Escrivão. Uma piada com um funcionário imaginário pode ser lida como
 * recado sobre uma das pessoas retratadas, conforme a fase em que aparece.
 */
const TERCEIROS = /\b(estagi[áa]ri[oa]s?|assessor(a|es|as)?|funcion[áa]ri[oa]s?|colegas?|chefes?|secret[áa]ri[oa]s?)\b/i;
/**
 * Nascimento e aniversário: as duas trilhas começam pelo nascimento da pessoa, e em uma delas os documentos divergem
 * sobre o dia. Uma piada com data de aniversário, dita ali, vira comentário sobre a pessoa retratada.
 */
const NASCIMENTO = /\b(anivers\w*|nasc\w*|natal[íi]ci\w*)\b/i;
/** Um ano ou uma data: fala nenhuma os traz. Data é fato, e fato fica no conteúdo publicado. */
const ANO = /\b(?:1[89]|20)\d{2}\b/;

/** O tamanho máximo de uma instrução, em caracteres. */
export const INSTRUCAO_MAXIMA = 200;

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
    if (fala.camada === "humor" && TERCEIROS.test(fala.texto)) problemas.push(`${onde}: piada com outra pessoa; o humor é sobre a papelada e sobre o próprio Escrivão.`);
    if (fala.camada === "humor" && NASCIMENTO.test(fala.texto)) problemas.push(`${onde}: piada com nascimento ou aniversário; conforme a fase, vira comentário sobre a pessoa retratada.`);
    if (fala.texto.includes("—") || fala.texto.includes("–")) problemas.push(`${onde}: travessão ou meia-risca; o projeto não os usa.`);
    if (/\{[a-zA-Z]+\}/.test(fala.texto)) problemas.push(`${onde}: campo a preencher; o Escrivão não repete dado do registro.`);
    if (ANO.test(fala.texto)) problemas.push(`${onde}: ano ou data; o Escrivão não escreve fato.`);
    if (fala.camada === "humor" && /\?$/.test(fala.texto.trim()) === false && fala.texto.trim().length > 220) problemas.push(`${onde}: fala de humor longa demais (mais de 220 caracteres).`);
  }

  // A instrução é uma frase curta sobre a ação de agora: um bloco longo do guia tiraria a atenção do marco e do botão de avanço (D-133).
  for (const fala of catalogo) {
    if (fala.camada === "instrucao" && fala.texto.trim().length > INSTRUCAO_MAXIMA) problemas.push(`fala ${fala.id}: instrução longa demais (mais de ${INSTRUCAO_MAXIMA} caracteres).`);
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
