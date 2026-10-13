// O conteúdo da Cidade do Voto (docs/MUNDO.md): um prédio por tema, e em cada
// prédio as propostas que as duas candidaturas registraram no TSE. Função pura
// sobre `AtlasData`, rodada no build.
//
// Só entram propostas: elas são o único conjunto em que a edição traz o mesmo
// número de frases, por tema, para as duas pessoas. As decisões (votos, atos e
// atuações) dependem dos cargos de cada um e não ficam lado a lado; o prédio
// leva à página do tema no atlas para quem quiser vê-las.
//
// Nenhum texto sobre as pessoas é escrito aqui: as frases, as ressalvas e as
// fontes são as do conteúdo publicado.

import { listProposals } from "@/lib/data/proposals";
import type { AtlasData } from "@/lib/data/types";
import { findPersonBySlug } from "@/lib/data/queries";
import { TEMA_LABELS, TEMAS, type Tema } from "@/lib/domain/decisions";
import { PROFILES } from "@/lib/domain/profiles";

export interface WorldSource {
  titulo: string;
  autoria: string;
  url: string;
  localizacao: string;
}

export interface WorldProposal {
  id: string;
  texto: string;
  ressalva: string | null;
  fontes: WorldSource[];
}

/** O programa de uma pessoa em um tema: as frases do documento, na ordem do conjunto. */
export interface WorldProgram {
  slug: string;
  nome: string;
  propostas: WorldProposal[];
}

export interface WorldTheme {
  tema: Tema;
  rotulo: string;
  /** Os programas, na ordem dos perfis. A tela decide o lado de cada um (src/lib/world/blind.ts). */
  programas: WorldProgram[];
}

export interface WorldContent {
  temas: WorldTheme[];
  /** A eleição das propostas, quando todas são da mesma. */
  eleicao: number | null;
}

/**
 * Os temas em que as duas pessoas têm ao menos uma proposta publicada. Um tema
 * em que só uma delas tem proposta fica de fora: o prédio mostraria um lado
 * vazio, e o modo às cegas entregaria quem é quem.
 */
export function buildWorldContent(data: AtlasData): WorldContent {
  const pessoas = PROFILES.flatMap((perfil) => {
    const pessoa = findPersonBySlug(data, perfil.slug);
    return pessoa === null ? [] : [{ slug: perfil.slug, nome: pessoa.nome, propostas: listProposals(data, pessoa.id) }];
  });

  const eleicoes = new Set(pessoas.flatMap((pessoa) => pessoa.propostas.map((proposta) => proposta.eleicao)));

  const temas = TEMAS.flatMap((tema): WorldTheme[] => {
    const programas = pessoas.map((pessoa) => ({
      slug: pessoa.slug,
      nome: pessoa.nome,
      propostas: pessoa.propostas
        .filter((proposta) => proposta.tema === tema)
        .map((proposta) => ({
          id: proposta.id,
          texto: proposta.texto,
          ressalva: proposta.ressalva,
          fontes: proposta.fontes.map(({ citacao, fonte }) => ({
            titulo: fonte.titulo,
            autoria: fonte.autoria,
            url: fonte.url,
            localizacao: citacao.localizacao,
          })),
        })),
    }));
    if (programas.length < 2 || programas.some((programa) => programa.propostas.length === 0)) return [];
    return [{ tema, rotulo: TEMA_LABELS[tema], programas }];
  });

  return { temas, eleicao: eleicoes.size === 1 ? [...eleicoes][0]! : null };
}
