// Os capítulos do jogo: seis de Lula e cinco de Flávio Bolsonaro, montados
// sobre todos os acontecimentos publicados de cada um (docs/GAMEPLAY.md
// explica cada agrupamento; docs/GAME-COVERAGE.md é a matriz gerada).
//
// Só identificadores: os textos, as datas e as fontes vêm dos dados gerados.
// Um teste confere que todo `eventId` existe na edição e pertence ao
// personagem, que nenhum acontecimento aparece duas vezes na trajetória do
// mesmo personagem (o primeiro turno de 2026, compartilhado, aparece uma vez
// para cada um), que as datas das tarefas de ordem decidem a ordem sem
// ambiguidade e que todo registro de um capítulo é anterior, sem
// ambiguidade, a todo registro do capítulo seguinte: passar de um capítulo
// ao outro nunca sugere uma ordem que as datas não sustentam.
//
// Título e motivo são inventários do que os registros dizem. Não contam uma
// história além deles, e os episódios judiciais aparecem como o atlas os
// documenta: acusação, defesa, decisão e desfecho, cada um com a própria data.

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
    epoca: "inicio",
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
    epoca: "meio",
  },
  {
    id: "lula-3-presidencia",
    personagem: "lula",
    numero: 3,
    titulo: "Presidência: eleição e reeleição",
    periodo: { de: 2002, ate: 2006 },
    motivo:
      "Dois registros de eleições presidenciais, de 2002 e 2006: a eleição de 27 de outubro de 2002 e a reeleição de 29 de outubro de 2006, cada uma com os documentos que a sustentam.",
    objetivo: "Recolha o registro da eleição de 2002 e indique o documento que o sustenta.",
    eventIds: ["lula-2002-eleito-presidente", "lula-2006-reeleito-presidente"],
    tarefa: { tipo: "fonte", eventId: "lula-2002-eleito-presidente" },
    cena: "comite",
    epoca: "meio",
  },
  {
    id: "lula-4-processos",
    personagem: "lula",
    numero: 4,
    titulo: "Nomeação suspensa, processos e prisão",
    periodo: { de: 2016, ate: 2019 },
    motivo:
      "Seis registros de 2016 a 2019: a suspensão pelo STF da nomeação para a Casa Civil, a condenação em primeira instância, a confirmação da condenação pelo TRF4, a prisão em Curitiba, o indeferimento pelo TSE do registro da candidatura e a saída da prisão. Cada registro traz, como o atlas o documenta, a acusação, a defesa, a decisão e o desfecho; a anulação posterior das condenações pelo STF está no capítulo seguinte, com a própria data.",
    objetivo: "Recolha dois registros e coloque-os em ordem: a condenação em primeira instância e a confirmação pelo TRF4.",
    eventIds: [
      "lula-2016-nomeacao-para-a-casa-civil-suspensa",
      "lula-2017-condenacao-em-primeira-instancia",
      "lula-2018-tribunal-confirma-condenacao",
      "lula-2018-prisao-em-curitiba",
      "lula-2018-registro-de-candidatura-indeferido",
      "lula-2019-saida-da-prisao",
    ],
    tarefa: { tipo: "ordem", eventIds: ["lula-2017-condenacao-em-primeira-instancia", "lula-2018-tribunal-confirma-condenacao"] },
    cena: "tribunal-a",
    epoca: "atual",
  },
  {
    id: "lula-5-anulacao",
    personagem: "lula",
    numero: 5,
    titulo: "Anulação, terceira eleição e intervenção federal",
    periodo: { de: 2021, ate: 2023 },
    motivo:
      "Três registros de 2021 a 2023: a anulação pelo STF das condenações, a eleição para a Presidência pela terceira vez e o decreto de intervenção federal na segurança pública do Distrito Federal.",
    objetivo: "Recolha o registro da anulação das condenações e indique o lugar em que o atlas o documenta.",
    eventIds: ["lula-2021-stf-anula-condenacoes", "lula-2022-eleito-presidente-pela-terceira-vez", "lula-2023-intervencao-federal-no-distrito-federal"],
    tarefa: { tipo: "lugar", eventId: "lula-2021-stf-anula-condenacoes" },
    cena: "gabinete",
    epoca: "atual",
  },
  {
    id: "lula-6-eleicao-2026",
    personagem: "lula",
    numero: 6,
    titulo: "Convenção e primeiro turno de 2026",
    periodo: { de: 2026, ate: 2026 },
    motivo:
      "Dois registros de 2026: a convenção do PT que oficializou a candidatura à reeleição, em 2 de agosto de 2026, e o primeiro turno da eleição presidencial, em 4 de outubro de 2026, com a apuração parcial divulgada pelo TSE. O segundo turno é posterior à data de corte da edição.",
    objetivo: "Recolha o registro do primeiro turno e indique o documento que o sustenta.",
    eventIds: ["lula-2026-convencao-do-pt", "eleicao-2026-primeiro-turno"],
    tarefa: { tipo: "fonte", eventId: "eleicao-2026-primeiro-turno" },
    cena: "convencao-a",
    epoca: "atual",
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
    epoca: "inicio",
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
    epoca: "meio",
  },
  {
    id: "flavio-bolsonaro-3-denuncia",
    personagem: "flavio-bolsonaro",
    numero: 3,
    titulo: "Denúncia, partidos e decisões judiciais",
    periodo: { de: 2020, ate: 2022 },
    motivo:
      "Seis registros de 2020 a 2022: a denúncia do Ministério Público do Rio, a filiação ao Patriota, a anulação pelo STJ de decisões da primeira instância na investigação, a filiação ao PL, a rejeição da denúncia pelo Tribunal de Justiça do Rio e a liderança do PL no Senado. Cada registro judicial traz, como o atlas o documenta, a acusação, a defesa, a decisão e o desfecho, com a própria data.",
    objetivo: "Recolha o registro da decisão do STJ e indique o documento que o sustenta.",
    eventIds: [
      "flavio-bolsonaro-2020-denuncia-do-ministerio-publico",
      "flavio-bolsonaro-2021-filiacao-ao-patriota",
      "flavio-bolsonaro-2021-stj-anula-decisoes-da-investigacao",
      "flavio-bolsonaro-2021-filiacao-ao-pl",
      "flavio-bolsonaro-2022-tribunal-rejeita-denuncia",
      "flavio-bolsonaro-2022-lider-do-pl-no-senado",
    ],
    tarefa: { tipo: "fonte", eventId: "flavio-bolsonaro-2021-stj-anula-decisoes-da-investigacao" },
    cena: "tribunal-b",
    epoca: "meio",
  },
  {
    id: "flavio-bolsonaro-4-minoria",
    personagem: "flavio-bolsonaro",
    numero: 4,
    titulo: "Liderança da Minoria, relatoria e comissão",
    periodo: { de: 2023, ate: 2025 },
    motivo:
      "Três registros de 2023 a 2025: a liderança da Minoria no Congresso Nacional, a aprovação pelo Senado do projeto sobre saídas temporárias de presos que ele relatou e a presidência da Comissão de Segurança Pública do Senado.",
    objetivo: "Recolha o registro do projeto relatado e indique o lugar em que o atlas o documenta.",
    eventIds: [
      "flavio-bolsonaro-2023-lider-da-minoria-no-congresso",
      "flavio-bolsonaro-2024-relatoria-das-saidas-temporarias",
      "flavio-bolsonaro-2025-presidente-da-comissao-de-seguranca-publica",
    ],
    tarefa: { tipo: "lugar", eventId: "flavio-bolsonaro-2024-relatoria-das-saidas-temporarias" },
    cena: "comissao",
    epoca: "atual",
  },
  {
    id: "flavio-bolsonaro-5-eleicao-2026",
    personagem: "flavio-bolsonaro",
    numero: 5,
    titulo: "Indicação, convenção e primeiro turno",
    periodo: { de: 2025, ate: 2026 },
    motivo:
      "Três registros de 2025 e 2026: a indicação como candidato do PL à Presidência, a convenção que oficializou a candidatura, em 25 de julho de 2026, e o primeiro turno da eleição presidencial, em 4 de outubro de 2026, com a apuração parcial divulgada pelo TSE. O segundo turno é posterior à data de corte da edição.",
    objetivo: "Recolha dois registros e coloque-os em ordem: a convenção do PL e o primeiro turno da eleição.",
    eventIds: ["flavio-bolsonaro-2025-indicacao-para-a-presidencia", "flavio-bolsonaro-2026-convencao-do-pl", "eleicao-2026-primeiro-turno"],
    tarefa: { tipo: "ordem", eventIds: ["flavio-bolsonaro-2026-convencao-do-pl", "eleicao-2026-primeiro-turno"] },
    cena: "convencao-b",
    epoca: "atual",
  },
];

export function chaptersOf(personagem: PersonagemSlug): ChapterSpec[] {
  return CHAPTERS.filter((capitulo) => capitulo.personagem === personagem).sort((a, b) => a.numero - b.numero);
}

export function findChapter(id: string): ChapterSpec | null {
  return CHAPTERS.find((capitulo) => capitulo.id === id) ?? null;
}
