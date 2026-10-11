// Os capítulos do jogo, por sala (D-125). Na sala Histórico, a trajetória:
// seis capítulos de Lula e cinco de Flávio Bolsonaro, montados sobre todos
// os acontecimentos publicados de cada um, e, em um capítulo de cada
// trajetória, a decisão documentada ligada a um desses acontecimentos. Nas
// salas Economia e Segurança pública, as decisões publicadas de cada tema,
// um capítulo por personagem (docs/GAMEPLAY.md explica cada agrupamento;
// docs/GAME-COVERAGE.md é a matriz gerada).
//
// Só identificadores: os textos, as datas e as fontes vêm dos dados gerados.
// Um teste confere que todo `eventId` e todo `decisaoId` existem na edição e
// pertencem ao personagem, que nenhum acontecimento aparece duas vezes na
// trajetória do mesmo personagem (o primeiro turno de 2026, compartilhado,
// aparece uma vez para cada um), que as datas das tarefas de ordem decidem a
// ordem sem ambiguidade e que, na trajetória, todo registro de um capítulo é
// anterior, sem ambiguidade, a todo registro do capítulo seguinte: passar de
// um capítulo ao outro nunca sugere uma ordem que as datas não sustentam.
//
// Título e motivo são inventários do que os registros dizem. Não contam uma
// história além deles, e os episódios judiciais aparecem como o atlas os
// documenta: acusação, defesa, decisão e desfecho, cada um com a própria data.

import type { ChapterSpec, PersonagemSlug } from "./types";

export const CHAPTERS: readonly ChapterSpec[] = [
  {
    id: "lula-1-sindicato",
    personagem: "lula",
    sala: "historico",
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
    sala: "historico",
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
    sala: "historico",
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
    sala: "historico",
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
    sala: "historico",
    numero: 5,
    titulo: "Anulação, terceira eleição e intervenção federal",
    periodo: { de: 2021, ate: 2023 },
    motivo:
      "Quatro registros de 2021 a 2023: a anulação pelo STF das condenações, a eleição para a Presidência pela terceira vez, o decreto de intervenção federal na segurança pública do Distrito Federal e, como decisão documentada, o próprio Decreto nº 11.377, de 8 de janeiro de 2023, com o texto oficial e a aprovação pelo Congresso.",
    objetivo: "Recolha o registro do decreto de intervenção federal, indique o documento que o sustenta e interprete o que ele documenta.",
    eventIds: ["lula-2021-stf-anula-condenacoes", "lula-2022-eleito-presidente-pela-terceira-vez", "lula-2023-intervencao-federal-no-distrito-federal"],
    decisaoIds: ["planalto-decreto-11377-2023-intervencao-df"],
    tarefa: { tipo: "decisao", decisaoId: "planalto-decreto-11377-2023-intervencao-df" },
    cena: "gabinete",
    epoca: "atual",
  },
  {
    id: "lula-6-eleicao-2026",
    personagem: "lula",
    sala: "historico",
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
    sala: "historico",
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
    sala: "historico",
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
    sala: "historico",
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
    sala: "historico",
    numero: 4,
    titulo: "Liderança da Minoria, relatoria e comissão",
    periodo: { de: 2023, ate: 2025 },
    motivo:
      "Quatro registros de 2023 a 2025: a liderança da Minoria no Congresso Nacional, a aprovação pelo Senado do projeto sobre saídas temporárias de presos que ele relatou, a presidência da Comissão de Segurança Pública do Senado e, como decisão documentada, o voto registrado na votação do texto desse projeto, em 20 de fevereiro de 2024.",
    objetivo: "Recolha o registro do voto na votação do projeto sobre saídas temporárias, indique o documento que o sustenta e interprete o que ele documenta.",
    eventIds: [
      "flavio-bolsonaro-2023-lider-da-minoria-no-congresso",
      "flavio-bolsonaro-2024-relatoria-das-saidas-temporarias",
      "flavio-bolsonaro-2025-presidente-da-comissao-de-seguranca-publica",
    ],
    decisaoIds: ["senado-voto-6818-5894"],
    tarefa: { tipo: "decisao", decisaoId: "senado-voto-6818-5894" },
    cena: "comissao",
    epoca: "atual",
  },
  {
    id: "flavio-bolsonaro-5-eleicao-2026",
    personagem: "flavio-bolsonaro",
    sala: "historico",
    numero: 5,
    titulo: "Indicação, convenção e primeiro turno",
    periodo: { de: 2025, ate: 2026 },
    motivo:
      "Três registros de 2025 e 2026: a indicação como candidato do PL à Presidência, a convenção que oficializou a candidatura, em 25 de julho de 2026, e o primeiro turno da eleição presidencial, em 4 de outubro de 2026, com a apuração parcial divulgada pelo TSE. O segundo turno é posterior à data de corte da edição.",
    objetivo: "Recolha o registro da convenção do PL e indique o lugar em que o atlas o documenta.",
    eventIds: ["flavio-bolsonaro-2025-indicacao-para-a-presidencia", "flavio-bolsonaro-2026-convencao-do-pl", "eleicao-2026-primeiro-turno"],
    // Era tarefa de ordem (convenção e primeiro turno) até a entrega P1; com a
    // tarefa de decisão no capítulo 4, a de lugar veio para cá, para a
    // trajetória continuar com os quatro tipos de antes (D-126).
    tarefa: { tipo: "lugar", eventId: "flavio-bolsonaro-2026-convencao-do-pl" },
    cena: "convencao-b",
    epoca: "atual",
  },

  // -------------------------------------------------------------------------
  // Salas temáticas (D-125): as decisões documentadas de cada tema, uma sala
  // por personagem. Os registros são votos e atos publicados; a amostra e os
  // critérios estão em research/selecao-decisoes-2026-10.md.
  // -------------------------------------------------------------------------
  {
    id: "lula-economia",
    personagem: "lula",
    sala: "economia",
    numero: 1,
    titulo: "Regime fiscal, reforma tributária e imposto de renda",
    periodo: { de: 2023, ate: 2025 },
    motivo:
      "Três registros de 2023 a 2025, todos atos do presidente da República documentados no Portal da Legislação: a sanção com veto parcial da Lei Complementar nº 200, de 30 de agosto de 2023, a sanção com veto parcial da Lei Complementar nº 214, de 16 de janeiro de 2025, e a sanção sem veto da Lei nº 15.270, de 26 de novembro de 2025. É uma amostra, e não o histórico completo.",
    objetivo: "Recolha o registro da Lei Complementar nº 200, indique o documento que o sustenta e interprete o tipo do ato.",
    eventIds: [],
    decisaoIds: ["planalto-lei-complementar-200-2023-regime-fiscal", "planalto-lei-complementar-214-2025-ibs-cbs", "planalto-lei-15270-2025-imposto-de-renda"],
    tarefa: { tipo: "decisao", decisaoId: "planalto-lei-complementar-200-2023-regime-fiscal" },
    cena: "arquivo-economia-a",
    epoca: "atual",
  },
  {
    id: "lula-seguranca-publica",
    personagem: "lula",
    sala: "seguranca-publica",
    numero: 1,
    titulo: "Intervenção federal, saídas temporárias e crime organizado",
    periodo: { de: 2023, ate: 2026 },
    motivo:
      "Três registros de 2023 a 2026, todos atos do presidente da República documentados no Portal da Legislação: o Decreto nº 11.377, de 8 de janeiro de 2023, a sanção com veto parcial da Lei nº 14.843, de 11 de abril de 2024, e a sanção com veto parcial da Lei nº 15.358, de 24 de março de 2026. É uma amostra, e não o histórico completo.",
    objetivo: "Recolha o registro da Lei nº 14.843, indique o documento que o sustenta e interprete o tipo do ato.",
    eventIds: [],
    decisaoIds: ["planalto-decreto-11377-2023-intervencao-df", "planalto-lei-14843-2024-saidas-temporarias", "planalto-lei-15358-2026-crime-organizado"],
    tarefa: { tipo: "decisao", decisaoId: "planalto-lei-14843-2024-saidas-temporarias" },
    cena: "arquivo-seguranca-a",
    epoca: "atual",
  },
  {
    id: "flavio-bolsonaro-economia",
    personagem: "flavio-bolsonaro",
    sala: "economia",
    numero: 1,
    titulo: "Regime fiscal, reforma tributária e sua regulamentação",
    periodo: { de: 2023, ate: 2024 },
    motivo:
      "Três registros de 2023 e 2024, todos votos nominais no Plenário do Senado documentados nos dados abertos: o voto no texto do projeto do regime fiscal, em 21 de junho de 2023, o voto no segundo turno da proposta de reforma tributária, em 8 de novembro de 2023, e o voto no substitutivo do projeto que institui o IBS, a CBS e o Imposto Seletivo, em 12 de dezembro de 2024. É uma amostra, e não o histórico completo.",
    objetivo: "Recolha o registro do voto no projeto do regime fiscal, indique o documento que o sustenta e interprete a manifestação registrada.",
    eventIds: [],
    decisaoIds: ["senado-voto-6714-5894", "senado-voto-6777-5894", "senado-voto-6899-5894"],
    tarefa: { tipo: "decisao", decisaoId: "senado-voto-6714-5894" },
    cena: "arquivo-economia-b",
    epoca: "atual",
  },
  {
    id: "flavio-bolsonaro-seguranca-publica",
    personagem: "flavio-bolsonaro",
    sala: "seguranca-publica",
    numero: 1,
    titulo: "Saídas temporárias, drogas na Constituição e crime organizado",
    periodo: { de: 2024, ate: 2025 },
    motivo:
      "Três registros de 2024 e 2025, todos votos nominais no Plenário do Senado documentados nos dados abertos: o voto no texto do projeto sobre saídas temporárias de presos, em 20 de fevereiro de 2024, o voto no segundo turno da proposta de emenda à Constituição sobre posse e porte de drogas, em 16 de abril de 2024, e o voto no substitutivo do projeto do marco legal do combate ao crime organizado, em 10 de dezembro de 2025. É uma amostra, e não o histórico completo.",
    objetivo: "Recolha o registro do voto na proposta de emenda à Constituição sobre drogas, indique o documento que o sustenta e interprete a manifestação registrada.",
    eventIds: [],
    decisaoIds: ["senado-voto-6818-5894", "senado-voto-6825-5894", "senado-voto-7037-5894"],
    tarefa: { tipo: "decisao", decisaoId: "senado-voto-6825-5894" },
    cena: "arquivo-seguranca-b",
    epoca: "atual",
  },
];

/** A ordem das salas na navegação: a investigação e depois os temas. */
const ORDEM_DAS_SALAS: readonly ChapterSpec["sala"][] = ["historico", "economia", "seguranca-publica"];

/** Os capítulos de um personagem, pela ordem das salas e, em cada sala, pelo número. */
export function chaptersOf(personagem: PersonagemSlug): ChapterSpec[] {
  return CHAPTERS.filter((capitulo) => capitulo.personagem === personagem).sort(
    (a, b) => ORDEM_DAS_SALAS.indexOf(a.sala) - ORDEM_DAS_SALAS.indexOf(b.sala) || a.numero - b.numero,
  );
}

export function findChapter(id: string): ChapterSpec | null {
  return CHAPTERS.find((capitulo) => capitulo.id === id) ?? null;
}
