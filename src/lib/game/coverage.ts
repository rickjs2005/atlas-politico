// A matriz de cobertura do jogo: acontecimento → personagem → capítulo,
// gerada dos dados publicados e dos capítulos declarados. É o que
// docs/GAME-COVERAGE.md mostra (`npm run game:coverage`), e um teste confere
// que o documento está em dia e que nenhum acontecimento ficou de fora sem
// justificativa escrita.
//
// Função pura sobre `AtlasData`: nada aqui escreve texto sobre as pessoas.

import { listDecisionViews, type DecisionView } from "@/lib/data/decisions";
import { findPersonBySlug } from "@/lib/data/queries";
import type { AtlasData } from "@/lib/data/types";
import { compareDates, formatDate } from "@/lib/domain/dates";
import { TEMA_LABELS } from "@/lib/domain/decisions";
import { PROFILES } from "@/lib/domain/profiles";

import { CHAPTERS, chaptersOf } from "./chapters";
import { ROOMS, chaptersInRoom, roomOf } from "./rooms";
import { SCENES } from "./scenes";
import { EPOCA_LABEL, type ChapterSpec, type PersonagemSlug, type TaskType } from "./types";

/**
 * Acontecimentos publicados que ficam fora do jogo de propósito, com o
 * motivo. Vazio nesta edição: todos os acontecimentos dos dois personagens
 * têm capítulo. Um acontecimento só pode faltar nos capítulos se estiver
 * aqui, com justificativa, e o teste confere isso.
 */
export const EXCLUSIONS: Record<string, string> = {};

/**
 * Decisões publicadas que ficam fora das salas temáticas de propósito, com o
 * motivo. Toda decisão publicada de um personagem, em um tema que tem sala,
 * precisa estar no capítulo da sala daquele tema ou aqui, e o teste confere.
 */
export const DECISION_EXCLUSIONS: Record<string, string> = {};

export interface CoverageRow {
  eventId: string;
  titulo: string;
  data: string;
  capitulo: ChapterSpec | null;
  /** Por que não está em capítulo, quando não está. */
  exclusao: string | null;
}

export interface DecisionCoverageRow {
  decisaoId: string;
  titulo: string;
  data: string;
  natureza: DecisionView["natureza"];
  temas: readonly string[];
  /** Os capítulos em que a decisão aparece: o da sala do tema e, quando é o caso, um da trajetória. */
  capitulos: ChapterSpec[];
  /** Por que não está na sala do tema, quando não está. */
  exclusao: string | null;
}

const TASK_LABEL: Record<TaskType, string> = {
  registro: "encontrar um registro",
  ordem: "ordem de dois registros",
  fonte: "documento que sustenta",
  lugar: "lugar documentado",
  decisao: "evidência e interpretação de uma decisão",
};

/** Os acontecimentos de um personagem, em ordem cronológica, com o capítulo de cada um. */
export function coverageOf(data: AtlasData, personagem: PersonagemSlug): CoverageRow[] {
  const pessoa = findPersonBySlug(data, personagem);
  if (pessoa === null) return [];
  const capitulos = chaptersOf(personagem);
  return data.conjunto.acontecimentos
    .filter((item) => item.pessoaIds.includes(pessoa.id))
    .sort((a, b) => compareDates(a.data, b.data))
    .map((item) => ({
      eventId: item.id,
      titulo: item.titulo,
      data: formatDate(item.data),
      capitulo: capitulos.find((capitulo) => capitulo.eventIds.includes(item.id)) ?? null,
      exclusao: EXCLUSIONS[item.id] ?? null,
    }));
}

/** Acontecimentos de um personagem sem capítulo e sem exclusão justificada. */
export function uncovered(data: AtlasData, personagem: PersonagemSlug): CoverageRow[] {
  return coverageOf(data, personagem).filter((linha) => linha.capitulo === null && linha.exclusao === null);
}

/** As decisões publicadas de um personagem, em ordem cronológica, com os capítulos em que cada uma aparece. */
export function decisionCoverageOf(data: AtlasData, personagem: PersonagemSlug): DecisionCoverageRow[] {
  const pessoa = findPersonBySlug(data, personagem);
  if (pessoa === null) return [];
  const capitulos = chaptersOf(personagem);
  return listDecisionViews(data, pessoa.id).map((decisao) => ({
    decisaoId: decisao.id,
    titulo: decisao.titulo,
    data: formatDate(decisao.data),
    natureza: decisao.natureza,
    temas: decisao.temas.map((tema) => TEMA_LABELS[tema]),
    capitulos: capitulos.filter((capitulo) => (capitulo.decisaoIds ?? []).includes(decisao.id)),
    exclusao: DECISION_EXCLUSIONS[decisao.id] ?? null,
  }));
}

/**
 * Decisões de um personagem que, em um tema com sala, não estão no capítulo
 * da sala daquele tema nem em exclusão justificada.
 */
export function uncoveredDecisions(data: AtlasData, personagem: PersonagemSlug): DecisionCoverageRow[] {
  const salasPorTema = new Map(ROOMS.filter((sala) => sala.tema !== null).map((sala) => [TEMA_LABELS[sala.tema!], sala.id]));
  return decisionCoverageOf(data, personagem).filter((linha) => {
    if (linha.exclusao !== null) return false;
    return linha.temas.some((tema) => {
      const sala = salasPorTema.get(tema);
      return sala !== undefined && !linha.capitulos.some((capitulo) => capitulo.sala === sala);
    });
  });
}

function taskDescription(capitulo: ChapterSpec): string {
  const { tarefa } = capitulo;
  if (tarefa.tipo === "ordem") return `${TASK_LABEL.ordem}: \`${tarefa.eventIds[0]}\` e \`${tarefa.eventIds[1]}\``;
  if (tarefa.tipo === "decisao") return `${TASK_LABEL.decisao}: \`${tarefa.decisaoId}\``;
  return `${TASK_LABEL[tarefa.tipo]}: \`${tarefa.eventId}\``;
}

/** O documento inteiro, em Markdown. Determinístico: o mesmo conteúdo gera o mesmo texto. */
export function renderCoverage(data: AtlasData): string {
  const linhas: string[] = [];
  const total = data.conjunto.acontecimentos.length;
  const cobertos = new Set(CHAPTERS.flatMap((capitulo) => capitulo.eventIds)).size;
  linhas.push("# Jogo: matriz de cobertura");
  linhas.push("");
  const edicao = data.conjunto.edicao === null ? "sem edição declarada" : `edição ${data.conjunto.edicao.versao}, data de corte ${data.conjunto.edicao.dataDeCorte}`;
  linhas.push(
    `Gerado por \`npm run game:coverage\` a partir dos dados publicados (${edicao}) e de \`src/lib/game/chapters.ts\`. Não edite à mão: o teste \`tests/game-coverage.test.ts\` confere que este arquivo está em dia e que nenhum acontecimento ficou fora dos capítulos sem justificativa.`,
  );
  linhas.push("");
  const decisoesPublicadas = data.conjunto.votos.filter((item) => item.situacao.tipo === "vigente").length + data.conjunto.atosExecutivos.length;
  const decisoesEmCapitulos = new Set(CHAPTERS.flatMap((capitulo) => capitulo.decisaoIds ?? [])).size;
  linhas.push(`Acontecimentos publicados: ${total}. Em capítulos: ${cobertos}. O primeiro turno de 2026 pertence aos dois personagens e aparece uma vez na trajetória de cada um.`);
  linhas.push("");
  linhas.push(`Decisões publicadas (votos vigentes e atos do Executivo): ${decisoesPublicadas}. Em capítulos: ${decisoesEmCapitulos}. Uma decisão aparece na sala do seu tema e, quando está ligada a um acontecimento da trajetória, também no capítulo dele.`);
  linhas.push("");

  for (const perfil of PROFILES) {
    const pessoa = findPersonBySlug(data, perfil.slug);
    if (pessoa === null) continue;
    const capitulos = chaptersOf(perfil.slug);
    const cobertura = coverageOf(data, perfil.slug);
    const decisoes = decisionCoverageOf(data, perfil.slug);
    linhas.push(`## ${pessoa.nome}`);
    linhas.push("");
    linhas.push(
      `${cobertura.length} acontecimentos, ${capitulos.length} capítulos em ${new Set(capitulos.map((capitulo) => capitulo.sala)).size} salas, ${cobertura.filter((linha) => linha.capitulo !== null).length} acontecimentos em capítulo, ${decisoes.length} decisões publicadas, ${decisoes.filter((linha) => linha.capitulos.length > 0).length} em capítulo.`,
    );
    linhas.push("");
    for (const sala of ROOMS) {
      const daSala = chaptersInRoom(capitulos, sala.id);
      if (daSala.length === 0) continue;
      linhas.push(`### Sala ${sala.nome}`);
      linhas.push("");
      linhas.push("| Nº | Capítulo | Período | Cenário | Época da figura | Registros | Tarefa |");
      linhas.push("| --- | --- | --- | --- | --- | --- | --- |");
      for (const capitulo of daSala) {
        const cena = SCENES[capitulo.cena];
        const periodo = capitulo.periodo.de === capitulo.periodo.ate ? `${capitulo.periodo.de}` : `${capitulo.periodo.de}–${capitulo.periodo.ate}`;
        const quantos = capitulo.eventIds.length + (capitulo.decisaoIds?.length ?? 0);
        const composicao = (capitulo.decisaoIds?.length ?? 0) === 0 ? `${quantos}` : `${quantos} (${capitulo.eventIds.length} acontecimentos, ${capitulo.decisaoIds!.length} decisões)`;
        linhas.push(`| ${capitulo.numero} | ${capitulo.titulo} (\`${capitulo.id}\`) | ${periodo} | ${cena.nome} (\`${cena.id}\`, arte \`${cena.arte}\`) | ${EPOCA_LABEL[capitulo.epoca]} | ${composicao} | ${taskDescription(capitulo)} |`);
      }
      linhas.push("");
    }
    linhas.push("### Acontecimento → capítulo");
    linhas.push("");
    linhas.push("| Data | Acontecimento | Identificador | Capítulo |");
    linhas.push("| --- | --- | --- | --- |");
    for (const linha of cobertura) {
      const destino = linha.capitulo !== null ? `${linha.capitulo.numero}. ${linha.capitulo.titulo}` : linha.exclusao !== null ? `Fora do jogo: ${linha.exclusao}` : "**SEM CAPÍTULO**";
      linhas.push(`| ${linha.data} | ${linha.titulo} | \`${linha.eventId}\` | ${destino} |`);
    }
    linhas.push("");
    linhas.push("### Decisão → capítulos");
    linhas.push("");
    if (decisoes.length === 0) linhas.push("Nenhuma decisão publicada para este personagem nesta edição.");
    else {
      linhas.push("| Data | Decisão | Natureza | Temas | Identificador | Capítulos |");
      linhas.push("| --- | --- | --- | --- | --- | --- |");
      for (const linha of decisoes) {
        const destino =
          linha.capitulos.length > 0
            ? linha.capitulos.map((capitulo) => `${roomOf(capitulo.sala).nome}, ${capitulo.numero}. ${capitulo.titulo}`).join("; ")
            : linha.exclusao !== null
              ? `Fora do jogo: ${linha.exclusao}`
              : "**SEM CAPÍTULO**";
        linhas.push(`| ${linha.data} | ${linha.titulo} | ${linha.natureza === "voto" ? "voto" : "ato do Executivo"} | ${linha.temas.join(", ") || "sem tema"} | \`${linha.decisaoId}\` | ${destino} |`);
      }
    }
    linhas.push("");
  }

  linhas.push("## Exclusões justificadas");
  linhas.push("");
  const exclusoes = [...Object.entries(EXCLUSIONS), ...Object.entries(DECISION_EXCLUSIONS)];
  if (exclusoes.length === 0) linhas.push("Nenhuma: todos os acontecimentos e todas as decisões publicadas dos dois personagens estão em capítulos.");
  else for (const [id, motivo] of exclusoes) linhas.push(`- \`${id}\`: ${motivo}`);
  linhas.push("");
  return linhas.join("\n");
}
