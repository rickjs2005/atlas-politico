// Os capítulos desta etapa: dois por personagem, montados sobre acontecimentos
// publicados (docs/GAMEPLAY.md explica cada agrupamento).
//
// Só identificadores: os textos, as datas e as fontes vêm dos dados gerados.
// Um teste confere que todo `eventId` existe na edição e pertence ao
// personagem, que as datas das tarefas de ordem decidem a ordem sem
// ambiguidade e que todo registro de um capítulo é anterior, sem ambiguidade,
// a todo registro do capítulo seguinte: passar de um capítulo ao outro nunca
// sugere uma ordem que as datas não sustentam.
//
// Título e motivo são inventários do que os registros dizem. Não contam uma
// história além deles.

import type { ChapterSpec, PersonagemSlug } from "./types";

export const CHAPTERS: readonly ChapterSpec[] = [
  {
    id: "lula-1-sindicato",
    personagem: "lula",
    numero: 1,
    titulo: "Sindicato, greves e partido",
    periodo: { de: 1975, ate: 1980 },
    motivo:
      "Quatro registros de 1975 a 1980: a eleição para a presidência do sindicato, a greve de março de 1979, a fundação do PT e a prisão durante uma greve. A prisão tem só o ano documentado: o atlas não registra se ela veio antes ou depois da fundação do partido, de 10 de fevereiro de 1980. Por isso as duas ficam no mesmo capítulo.",
    objetivo: "Encontre o registro da eleição de 1975 para a presidência do sindicato.",
    eventIds: [
      "lula-1975-eleito-presidente-do-sindicato",
      "lula-1979-greve-dos-metalurgicos-do-abc",
      "lula-1980-fundacao-do-pt",
      "lula-1980-prisao-pela-lei-de-seguranca-nacional",
    ],
    tarefa: { tipo: "registro", eventId: "lula-1975-eleito-presidente-do-sindicato" },
    cena: "sindicato",
  },
  {
    id: "lula-2-constituinte",
    personagem: "lula",
    numero: 2,
    titulo: "Constituinte e disputas presidenciais",
    periodo: { de: 1986, ate: 1994 },
    motivo:
      "Três registros de eleições, de 1986 a 1994: a eleição para deputado federal constituinte e as disputas presidenciais de 1989 e de 1994.",
    objetivo: "Recolha dois registros e coloque-os em ordem: a eleição para a Constituinte e a primeira disputa pela Presidência.",
    eventIds: [
      "lula-1986-eleito-deputado-federal-constituinte",
      "lula-1989-primeira-candidatura-a-presidencia",
      "lula-1994-derrota-na-eleicao-presidencial",
    ],
    tarefa: {
      tipo: "ordem",
      eventIds: ["lula-1986-eleito-deputado-federal-constituinte", "lula-1989-primeira-candidatura-a-presidencia"],
    },
    cena: "constituinte",
  },
  {
    id: "flavio-bolsonaro-1-alerj",
    personagem: "flavio-bolsonaro",
    numero: 1,
    titulo: "Assembleia e disputa pela Prefeitura",
    periodo: { de: 2002, ate: 2016 },
    motivo:
      "Cinco registros de eleições, de 2002 a 2016: as quatro eleições para deputado estadual no Rio de Janeiro e a disputa pela Prefeitura do Rio.",
    objetivo: "Encontre o registro da primeira eleição para deputado estadual, de 2002.",
    eventIds: [
      "flavio-bolsonaro-2002-eleito-deputado-estadual",
      "flavio-bolsonaro-2006-reeleito-deputado-estadual",
      "flavio-bolsonaro-2010-reeleito-deputado-estadual",
      "flavio-bolsonaro-2014-reeleito-deputado-estadual",
      "flavio-bolsonaro-2016-candidatura-a-prefeitura-do-rio",
    ],
    tarefa: { tipo: "registro", eventId: "flavio-bolsonaro-2002-eleito-deputado-estadual" },
    cena: "alerj",
  },
  {
    id: "flavio-bolsonaro-2-senado",
    personagem: "flavio-bolsonaro",
    numero: 2,
    titulo: "Senado: eleição, Mesa e partido",
    periodo: { de: 2018, ate: 2019 },
    motivo: "Três registros de 2018 e 2019: a eleição para o Senado, a 3ª Secretaria da Mesa do Senado e a saída do PSL.",
    objetivo: "Recolha dois registros e coloque-os em ordem: a eleição para o Senado e a 3ª Secretaria da Mesa do Senado.",
    eventIds: [
      "flavio-bolsonaro-2018-eleito-senador",
      "flavio-bolsonaro-2019-terceiro-secretario-do-senado",
      "flavio-bolsonaro-2019-saida-do-psl",
    ],
    tarefa: {
      tipo: "ordem",
      eventIds: ["flavio-bolsonaro-2018-eleito-senador", "flavio-bolsonaro-2019-terceiro-secretario-do-senado"],
    },
    cena: "senado",
  },
];

export function chaptersOf(personagem: PersonagemSlug): ChapterSpec[] {
  return CHAPTERS.filter((capitulo) => capitulo.personagem === personagem).sort((a, b) => a.numero - b.numero);
}

export function findChapter(id: string): ChapterSpec | null {
  return CHAPTERS.find((capitulo) => capitulo.id === id) ?? null;
}
