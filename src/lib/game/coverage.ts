// A matriz de cobertura do jogo, gerada dos dados publicados: para cada
// pessoa, as fases da trilha (período, objetivo, marco, registros, lacunas e
// revisão) e, para cada acontecimento e cada decisão publicados, em que fase
// aparece e como. É o que docs/GAME-COVERAGE.md mostra (`npm run
// game:coverage`), e um teste confere que o documento está em dia e que
// nenhum registro publicado ficou fora do jogo sem justificativa escrita.
//
// A matriz separa duas coisas que o jogo anterior misturava (D-133):
//   acessível no jogo        todo registro publicado aparece em alguma fase;
//   obrigatório para avançar nada além de abrir a fase. Os registros de
//                            "Explorar este período" nunca seguram a seguinte.
//
// Função pura sobre `AtlasData`: nada aqui escreve texto sobre as pessoas.

import { listDecisionViews, type DecisionView } from "@/lib/data/decisions";
import { findPersonBySlug } from "@/lib/data/queries";
import type { AtlasData } from "@/lib/data/types";
import { compareDates, formatDate } from "@/lib/domain/dates";
import { TEMA_LABELS } from "@/lib/domain/decisions";
import { countWords } from "@/lib/domain/game";
import { PROFILES } from "@/lib/domain/profiles";
import type { FaseDoJogo } from "@/lib/domain/types";

import { publishedPhases } from "./content";
import { presentationOf } from "./presentation";
import { ROOMS, periodLabel, roomLabel } from "./rooms";
import { SCENES } from "./scenes";
import { refKey } from "./trail";
import { EPOCA_LABEL, type PersonagemSlug } from "./types";

/**
 * Acontecimentos publicados que ficam fora do jogo de propósito, com o
 * motivo. Vazio nesta edição. Um acontecimento só pode faltar nas fases se
 * estiver aqui, com justificativa, e o teste confere isso.
 */
export const EXCLUSIONS: Record<string, string> = {};

/** Decisões publicadas que ficam fora do jogo de propósito, com o motivo. Vazio nesta edição. */
export const DECISION_EXCLUSIONS: Record<string, string> = {};

/** Como um registro aparece em uma fase. */
export type Appearance = "marco" | "explicacao" | "atividade" | "explorar";

const APPEARANCE_LABEL: Record<Appearance, string> = {
  marco: "marco",
  explicacao: "na explicação",
  atividade: "na atividade",
  explorar: "em Explorar este período",
};

export interface PhaseAppearance {
  fase: FaseDoJogo;
  como: Appearance[];
}

/** As fases publicadas de uma pessoa, de todas as salas, na ordem das salas. */
export function phasesOfPerson(data: AtlasData, pessoaId: string): FaseDoJogo[] {
  return ROOMS.flatMap((sala) => publishedPhases(data, pessoaId, sala.id));
}

/** Em que fases, e como, o registro com esta chave (`tipo:id`) aparece. */
export function appearancesOf(fases: readonly FaseDoJogo[], chave: string): PhaseAppearance[] {
  return fases.flatMap((fase) => {
    const como: Appearance[] = [];
    if (refKey(fase.marco) === chave) como.push("marco");
    if (fase.explicacao.some((bloco) => bloco.referencias.some((referencia) => refKey(referencia) === chave))) como.push("explicacao");
    const daAtividade = fase.atividade.tipo === "pergunta" ? fase.atividade.referencias : fase.atividade.itens;
    if (daAtividade.some((referencia) => refKey(referencia) === chave)) como.push("atividade");
    if (fase.explorar.some((referencia) => refKey(referencia) === chave)) como.push("explorar");
    return como.length === 0 ? [] : [{ fase, como }];
  });
}

export interface CoverageRow {
  eventId: string;
  titulo: string;
  data: string;
  fases: PhaseAppearance[];
  /** Por que não está em fase, quando não está. */
  exclusao: string | null;
}

export interface DecisionCoverageRow {
  decisaoId: string;
  titulo: string;
  data: string;
  natureza: DecisionView["natureza"];
  temas: readonly string[];
  fases: PhaseAppearance[];
  exclusao: string | null;
}

/** Os acontecimentos de um personagem, em ordem cronológica, com as fases em que cada um aparece. */
export function coverageOf(data: AtlasData, personagem: PersonagemSlug): CoverageRow[] {
  const pessoa = findPersonBySlug(data, personagem);
  if (pessoa === null) return [];
  const fases = phasesOfPerson(data, pessoa.id);
  return data.conjunto.acontecimentos
    .filter((item) => item.pessoaIds.includes(pessoa.id))
    .sort((a, b) => compareDates(a.data, b.data))
    .map((item) => ({
      eventId: item.id,
      titulo: item.titulo,
      data: formatDate(item.data),
      fases: appearancesOf(fases, `acontecimento:${item.id}`),
      exclusao: EXCLUSIONS[item.id] ?? null,
    }));
}

/** Acontecimentos de um personagem sem fase e sem exclusão justificada. */
export function uncovered(data: AtlasData, personagem: PersonagemSlug): CoverageRow[] {
  return coverageOf(data, personagem).filter((linha) => linha.fases.length === 0 && linha.exclusao === null);
}

/** As decisões publicadas de um personagem, em ordem cronológica, com as fases em que cada uma aparece. */
export function decisionCoverageOf(data: AtlasData, personagem: PersonagemSlug): DecisionCoverageRow[] {
  const pessoa = findPersonBySlug(data, personagem);
  if (pessoa === null) return [];
  const fases = phasesOfPerson(data, pessoa.id);
  return listDecisionViews(data, pessoa.id).map((decisao) => ({
    decisaoId: decisao.id,
    titulo: decisao.titulo,
    data: formatDate(decisao.data),
    natureza: decisao.natureza,
    temas: decisao.temas.map((tema) => TEMA_LABELS[tema]),
    fases: appearancesOf(fases, `decisao:${decisao.id}`),
    exclusao: DECISION_EXCLUSIONS[decisao.id] ?? null,
  }));
}

/** Decisões de um personagem sem fase e sem exclusão justificada. */
export function uncoveredDecisions(data: AtlasData, personagem: PersonagemSlug): DecisionCoverageRow[] {
  return decisionCoverageOf(data, personagem).filter((linha) => linha.fases.length === 0 && linha.exclusao === null);
}

/**
 * As propostas eleitorais no jogo: a fase da eleição mostra uma por área, e os
 * aprofundamentos, as três da área deles. As demais ficam na comparação por
 * área, a um toque da fase ("Ver as propostas que o atlas registra"): a lista da
 * fase precisa caber no celular. O teste confere que toda área de toda pessoa
 * tem ao menos uma proposta em fase.
 */
export const PROPOSALS_OUTSIDE_GAME = "Na comparação por área (`/comparar/#propostas`), a um toque da fase da eleição";

export interface ProposalCoverageRow {
  propostaId: string;
  /** A área, pelo identificador da taxonomia. */
  area: string;
  /** A área, por extenso. */
  tema: string;
  texto: string;
  fases: PhaseAppearance[];
}

/** As propostas eleitorais publicadas de um personagem, na ordem do conjunto, com as fases em que cada uma aparece. */
export function proposalCoverageOf(data: AtlasData, personagem: PersonagemSlug): ProposalCoverageRow[] {
  const pessoa = findPersonBySlug(data, personagem);
  if (pessoa === null) return [];
  const fases = phasesOfPerson(data, pessoa.id);
  return data.conjunto.propostasEleitorais
    .filter((proposta) => proposta.pessoaId === pessoa.id)
    .map((proposta) => ({
      propostaId: proposta.id,
      area: proposta.tema,
      tema: TEMA_LABELS[proposta.tema],
      texto: proposta.texto,
      fases: appearancesOf(fases, `proposta:${proposta.id}`),
    }));
}

/** As áreas em que um personagem tem proposta publicada e nenhuma delas aparece em fase: isso, sim, seria um buraco. */
export function uncoveredProposalAreas(data: AtlasData, personagem: PersonagemSlug): string[] {
  const linhas = proposalCoverageOf(data, personagem);
  const comFase = new Set(linhas.filter((linha) => linha.fases.length > 0).map((linha) => linha.area));
  return [...new Set(linhas.map((linha) => linha.area))].filter((area) => !comFase.has(area));
}

const reviewLabel = (fase: FaseDoJogo) => (fase.editorial.estado !== "revisado" ? fase.editorial.estado : fase.editorial.revisao.tipo === "humana" ? "humana" : "assistida por IA; humana pendente");

const whereLabel = (aparicoes: readonly PhaseAppearance[]) =>
  aparicoes.map(({ fase, como }) => `${roomLabel(ROOMS.find((sala) => sala.id === fase.sala)!)}, fase ${fase.ordem} (${como.map((item) => APPEARANCE_LABEL[item]).join(", ")})`).join("; ");

/** O documento inteiro, em Markdown. Determinístico: o mesmo conteúdo gera o mesmo texto. */
export function renderCoverage(data: AtlasData): string {
  const linhas: string[] = [];
  const { conjunto } = data;
  linhas.push("# Jogo: matriz de cobertura");
  linhas.push("");
  const edicao = conjunto.edicao === null ? "sem edição declarada" : `edição ${conjunto.edicao.versao}, data de corte ${conjunto.edicao.dataDeCorte}`;
  linhas.push(
    `Gerado por \`npm run game:coverage\` a partir dos dados publicados (${edicao}): as fases vêm de \`content/published/fasesDoJogo.json\`, e o cenário de cada uma, de \`src/lib/game/presentation.ts\`. Não edite à mão: o teste \`tests/game-coverage.test.ts\` confere que este arquivo está em dia e que nenhum acontecimento e nenhuma decisão publicados ficaram fora das fases sem justificativa.`,
  );
  linhas.push("");
  linhas.push(
    "Duas coisas diferentes: **acessível no jogo** quer dizer que o registro aparece em alguma fase, como marco, na explicação, na atividade ou em Explorar este período; **obrigatório para avançar** não existe: nenhuma fase segura a seguinte, e a atividade pode ser respondida ou lida. A pesquisa do conteúdo, com o que foi conferido, o que entrou e o que ficou de fora, está em `research/trilha-2026-10.md`. O motivo da escolha de cada marco não foi registrado: os marcos foram escolhidos na redação das fases.",
  );
  linhas.push("");
  const decisoesPublicadas = conjunto.votos.filter((item) => item.situacao.tipo === "vigente").length + conjunto.atosExecutivos.length + conjunto.atuacoesLegislativas.length;
  linhas.push(
    `Na edição: ${conjunto.fasesDoJogo.length} fases, ${conjunto.fatosBiograficos.length} fatos biográficos, ${conjunto.conceitos.length} conceitos, ${conjunto.acontecimentos.length} acontecimentos, ${decisoesPublicadas} decisões (votos vigentes, atos do Executivo e atuações legislativas) e ${conjunto.propostasEleitorais.length} propostas eleitorais. O primeiro turno de 2026 pertence às duas pessoas e aparece na trilha de cada uma.`,
  );
  linhas.push("");

  for (const perfil of PROFILES) {
    const pessoa = findPersonBySlug(data, perfil.slug);
    if (pessoa === null) continue;
    const fases = phasesOfPerson(data, pessoa.id);
    const cobertura = coverageOf(data, perfil.slug);
    const decisoes = decisionCoverageOf(data, perfil.slug);
    linhas.push(`## ${pessoa.nome}`);
    linhas.push("");
    linhas.push(
      `${fases.length} fases, ${cobertura.length} acontecimentos publicados (${cobertura.filter((linha) => linha.fases.length > 0).length} acessíveis no jogo), ${decisoes.length} decisões publicadas (${decisoes.filter((linha) => linha.fases.length > 0).length} acessíveis no jogo).`,
    );
    linhas.push("");
    for (const sala of ROOMS) {
      const daSala = fases.filter((fase) => fase.sala === sala.id);
      if (daSala.length === 0) continue;
      linhas.push(`### ${roomLabel(sala)}`);
      linhas.push("");
      linhas.push("| Nº | Fase | Período | Objetivo | Marco | Registros apontados | Atividade | Palavras | Cenário e figura | Revisão |");
      linhas.push("| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |");
      for (const fase of daSala) {
        const { cena, epoca } = presentationOf(fase.id, perfil.slug, fase.sala);
        const scene = SCENES[cena];
        const apontados = new Set([refKey(fase.marco), ...fase.explicacao.flatMap((bloco) => bloco.referencias.map(refKey)), ...fase.explorar.map(refKey)]);
        const palavras = fase.explicacao.reduce((soma, bloco) => soma + countWords(bloco.texto), 0);
        const atividade = fase.atividade.tipo === "pergunta" ? `pergunta, ${fase.atividade.opcoes.length} opções` : `ordenação, ${fase.atividade.itens.length} registros`;
        linhas.push(
          `| ${fase.ordem} | ${fase.titulo} (\`${fase.id}\`) | ${periodLabel(fase.periodo)} | ${fase.objetivo} | \`${refKey(fase.marco)}\` | ${apontados.size} (${fase.explorar.length} em Explorar) | ${atividade} | ${palavras} | ${scene.nome} (\`${scene.id}\`); ${EPOCA_LABEL[epoca]} | ${reviewLabel(fase)} |`,
        );
      }
      linhas.push("");
      const comLacuna = daSala.filter((fase) => fase.lacunas.length > 0);
      if (comLacuna.length > 0) {
        linhas.push("Lacunas declaradas, por fase:");
        linhas.push("");
        for (const fase of comLacuna) for (const lacuna of fase.lacunas) linhas.push(`- Fase ${fase.ordem}: ${lacuna}`);
        linhas.push("");
      }
    }
    linhas.push("### Acontecimento → fases");
    linhas.push("");
    linhas.push("| Data | Acontecimento | Identificador | Onde aparece |");
    linhas.push("| --- | --- | --- | --- |");
    for (const linha of cobertura) {
      const destino = linha.fases.length > 0 ? whereLabel(linha.fases) : linha.exclusao !== null ? `Fora do jogo: ${linha.exclusao}` : "**SEM FASE**";
      linhas.push(`| ${linha.data} | ${linha.titulo} | \`${linha.eventId}\` | ${destino} |`);
    }
    linhas.push("");
    linhas.push("### Decisão → fases");
    linhas.push("");
    if (decisoes.length === 0) linhas.push("Nenhuma decisão publicada para este personagem nesta edição.");
    else {
      linhas.push("| Data | Decisão | Natureza | Temas | Identificador | Onde aparece |");
      linhas.push("| --- | --- | --- | --- | --- | --- |");
      for (const linha of decisoes) {
        const destino = linha.fases.length > 0 ? whereLabel(linha.fases) : linha.exclusao !== null ? `Fora do jogo: ${linha.exclusao}` : "**SEM FASE**";
        linhas.push(`| ${linha.data} | ${linha.titulo} | ${linha.natureza === "voto" ? "voto" : linha.natureza === "ato" ? "ato do Executivo" : "atuação legislativa"} | ${linha.temas.join(", ") || "sem tema"} | \`${linha.decisaoId}\` | ${destino} |`);
      }
    }
    linhas.push("");
    const fatos = conjunto.fatosBiograficos.filter((fato) => fato.pessoaId === pessoa.id);
    linhas.push("### Fato biográfico → fases");
    linhas.push("");
    if (fatos.length === 0) linhas.push("Nenhum fato biográfico publicado para este personagem nesta edição.");
    else {
      linhas.push("| Data | Fato | Identificador | Fontes | Onde aparece |");
      linhas.push("| --- | --- | --- | --- | --- |");
      for (const fato of fatos) {
        const aparicoes = appearancesOf(fases, `fato:${fato.id}`);
        linhas.push(`| ${fato.data.tipo === "data" ? formatDate(fato.data) : "sem data documentada"} | ${fato.titulo} | \`${fato.id}\` | ${fato.fontes.length} | ${aparicoes.length > 0 ? whereLabel(aparicoes) : "**SEM FASE**"} |`);
      }
    }
    linhas.push("");
    const propostas = proposalCoverageOf(data, perfil.slug);
    linhas.push("### Proposta eleitoral → fases");
    linhas.push("");
    if (propostas.length > 0) {
      linhas.push(
        `${propostas.filter((linha) => linha.fases.length > 0).length} das ${propostas.length} propostas publicadas aparecem em fase: uma por área na fase da eleição e as três da área em cada aprofundamento. As demais ficam na comparação por área, e a fase da eleição leva até lá.`,
      );
      linhas.push("");
    }
    if (propostas.length === 0) linhas.push("Nenhuma proposta eleitoral publicada para este personagem nesta edição.");
    else {
      linhas.push("| Área | Proposta | Identificador | Onde aparece |");
      linhas.push("| --- | --- | --- | --- |");
      for (const linha of propostas) linhas.push(`| ${linha.tema} | ${linha.texto} | \`${linha.propostaId}\` | ${linha.fases.length > 0 ? whereLabel(linha.fases) : PROPOSALS_OUTSIDE_GAME} |`);
    }
    linhas.push("");
  }

  linhas.push("## Exclusões justificadas");
  linhas.push("");
  const exclusoes = [...Object.entries(EXCLUSIONS), ...Object.entries(DECISION_EXCLUSIONS)];
  if (exclusoes.length === 0) linhas.push("Nenhuma: todos os acontecimentos e todas as decisões publicados das duas pessoas aparecem em alguma fase.");
  else for (const [id, motivo] of exclusoes) linhas.push(`- \`${id}\`: ${motivo}`);
  linhas.push("");
  return linhas.join("\n");
}
