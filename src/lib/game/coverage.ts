// A matriz de cobertura do jogo: acontecimento → personagem → capítulo,
// gerada dos dados publicados e dos capítulos declarados. É o que
// docs/GAME-COVERAGE.md mostra (`npm run game:coverage`), e um teste confere
// que o documento está em dia e que nenhum acontecimento ficou de fora sem
// justificativa escrita.
//
// Função pura sobre `AtlasData`: nada aqui escreve texto sobre as pessoas.

import { findPersonBySlug } from "@/lib/data/queries";
import type { AtlasData } from "@/lib/data/types";
import { compareDates, formatDate } from "@/lib/domain/dates";
import { PROFILES } from "@/lib/domain/profiles";

import { CHAPTERS, chaptersOf } from "./chapters";
import { SCENES } from "./scenes";
import { EPOCA_LABEL, type ChapterSpec, type PersonagemSlug, type TaskType } from "./types";

/**
 * Acontecimentos publicados que ficam fora do jogo de propósito, com o
 * motivo. Vazio nesta edição: todos os acontecimentos dos dois personagens
 * têm capítulo. Um acontecimento só pode faltar nos capítulos se estiver
 * aqui, com justificativa, e o teste confere isso.
 */
export const EXCLUSIONS: Record<string, string> = {};

export interface CoverageRow {
  eventId: string;
  titulo: string;
  data: string;
  capitulo: ChapterSpec | null;
  /** Por que não está em capítulo, quando não está. */
  exclusao: string | null;
}

const TASK_LABEL: Record<TaskType, string> = {
  registro: "encontrar um registro",
  ordem: "ordem de dois registros",
  fonte: "documento que sustenta",
  lugar: "lugar documentado",
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

function taskDescription(capitulo: ChapterSpec): string {
  const { tarefa } = capitulo;
  if (tarefa.tipo === "ordem") return `${TASK_LABEL.ordem}: \`${tarefa.eventIds[0]}\` e \`${tarefa.eventIds[1]}\``;
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
  linhas.push(`Acontecimentos publicados: ${total}. Em capítulos: ${cobertos}. O primeiro turno de 2026 pertence aos dois personagens e aparece uma vez na trajetória de cada um.`);
  linhas.push("");

  for (const perfil of PROFILES) {
    const pessoa = findPersonBySlug(data, perfil.slug);
    if (pessoa === null) continue;
    const capitulos = chaptersOf(perfil.slug);
    const cobertura = coverageOf(data, perfil.slug);
    linhas.push(`## ${pessoa.nome}`);
    linhas.push("");
    linhas.push(`${cobertura.length} acontecimentos, ${capitulos.length} capítulos, ${cobertura.filter((linha) => linha.capitulo !== null).length} em capítulo.`);
    linhas.push("");
    linhas.push("### Capítulos");
    linhas.push("");
    linhas.push("| Nº | Capítulo | Período | Cenário | Época da figura | Registros | Tarefa |");
    linhas.push("| --- | --- | --- | --- | --- | --- | --- |");
    for (const capitulo of capitulos) {
      const cena = SCENES[capitulo.cena];
      const periodo = capitulo.periodo.de === capitulo.periodo.ate ? `${capitulo.periodo.de}` : `${capitulo.periodo.de}–${capitulo.periodo.ate}`;
      linhas.push(`| ${capitulo.numero} | ${capitulo.titulo} (\`${capitulo.id}\`) | ${periodo} | ${cena.nome} (\`${cena.id}\`, arte \`${cena.arte}\`) | ${EPOCA_LABEL[capitulo.epoca]} | ${capitulo.eventIds.length} | ${taskDescription(capitulo)} |`);
    }
    linhas.push("");
    linhas.push("### Acontecimento → capítulo");
    linhas.push("");
    linhas.push("| Data | Acontecimento | Identificador | Capítulo |");
    linhas.push("| --- | --- | --- | --- |");
    for (const linha of cobertura) {
      const destino = linha.capitulo !== null ? `${linha.capitulo.numero}. ${linha.capitulo.titulo}` : linha.exclusao !== null ? `Fora do jogo: ${linha.exclusao}` : "**SEM CAPÍTULO**";
      linhas.push(`| ${linha.data} | ${linha.titulo} | \`${linha.eventId}\` | ${destino} |`);
    }
    linhas.push("");
  }

  linhas.push("## Exclusões justificadas");
  linhas.push("");
  const exclusoes = Object.entries(EXCLUSIONS);
  if (exclusoes.length === 0) linhas.push("Nenhuma: todos os acontecimentos publicados dos dois personagens estão em capítulos.");
  else for (const [id, motivo] of exclusoes) linhas.push(`- \`${id}\`: ${motivo}`);
  linhas.push("");
  return linhas.join("\n");
}
