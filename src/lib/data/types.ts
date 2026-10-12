// Formato dos dados públicos: o que o gerador escreve em `generated/dados/` e
// o que a interface consome. Só tipos, para servir tanto ao build quanto ao
// navegador (docs/DATA-PIPELINE.md descreve cada campo).

import type { FeatureCollection, Point } from "geojson";

import type { Categoria } from "@/lib/domain/categories";
import type { Precisao } from "@/lib/domain/dates";
import type { Tema } from "@/lib/domain/decisions";
import type { PrecisaoGeografica } from "@/lib/domain/geo";
import type { Conjunto, Edicao } from "@/lib/domain/schemas";

/**
 * Conjunto publicado: só registros elegíveis, em ordem estável. `edicao` é
 * `null` enquanto nenhuma edição foi publicada, e as coleções ficam vazias.
 */
export type PublishedSet = Omit<Conjunto, "edicao"> & { edicao: Edicao | null };

/** Listas de `id` de acontecimento sempre em ordem cronológica. */
export interface Indexes {
  acontecimentos: {
    /** `id` para a posição em `conjunto.acontecimentos`. */
    porId: Record<string, number>;
    /** `slug` para `id`. */
    porSlug: Record<string, string>;
    porPessoa: Record<string, string[]>;
    /** Chave: ano com quatro dígitos. Só anos com algum acontecimento. */
    porAno: Record<string, string[]>;
    /** Todas as categorias aparecem, mesmo vazias. */
    porCategoria: Record<Categoria, string[]>;
    porLugar: Record<string, string[]>;
    /** Acontecimentos sem ponto no mapa, pelo motivo. */
    semPonto: { nacional: string[]; desconhecida: string[] };
    /** Primeiro e último ano com acontecimento; `null` no conjunto vazio. */
    anos: { primeiro: number; ultimo: number } | null;
  };
  pessoas: { porId: Record<string, number>; porSlug: Record<string, string> };
  mandatos: { porId: Record<string, number>; porPessoa: Record<string, string[]> };
  filiacoes: { porId: Record<string, number>; porPessoa: Record<string, string[]> };
  /** Decisões políticas (docs/DATA_MODEL.md, seção Decisões). Listas de votação em ordem cronológica. */
  proposicoes: {
    porId: Record<string, number>;
    /** Todos os temas aparecem, mesmo vazios. */
    porTema: Record<Tema, string[]>;
    porInstituicao: Record<string, string[]>;
  };
  votacoes: {
    porId: Record<string, number>;
    porProposicao: Record<string, string[]>;
    porInstituicao: Record<string, string[]>;
    porAno: Record<string, string[]>;
    /** Pelos temas da proposição votada. Todos os temas aparecem. */
    porTema: Record<Tema, string[]>;
  };
  votos: {
    porId: Record<string, number>;
    porVotacao: Record<string, string[]>;
    porPessoa: Record<string, string[]>;
    /** `votacaoId:pessoaId` para o `id` do voto vigente. */
    vigentePorVotacaoEPessoa: Record<string, string>;
  };
  atosExecutivos: {
    porId: Record<string, number>;
    porPessoa: Record<string, string[]>;
    porTema: Record<Tema, string[]>;
    porAno: Record<string, string[]>;
    porProposicao: Record<string, string[]>;
  };
  /** Autorias e relatorias. As listas vêm em ordem cronológica. */
  atuacoesLegislativas: {
    porId: Record<string, number>;
    porPessoa: Record<string, string[]>;
    porTema: Record<Tema, string[]>;
    porAno: Record<string, string[]>;
  };
  coberturaPolitica: { porId: Record<string, number>; porPessoa: Record<string, string[]> };
  identidadesInstitucionais: { porId: Record<string, number>; porPessoa: Record<string, string[]> };
  /** Propostas dos documentos registrados na Justiça Eleitoral. As listas vêm na ordem dos temas. */
  propostasEleitorais: { porId: Record<string, number>; porPessoa: Record<string, string[]> };
  /** Conteúdo educativo do jogo (docs/DATA_MODEL.md, seção Conteúdo educativo). */
  fatosBiograficos: { porId: Record<string, number>; porPessoa: Record<string, string[]> };
  conceitos: { porId: Record<string, number> };
  fasesDoJogo: {
    porId: Record<string, number>;
    /** Chave: `pessoaId:sala`. As fases na ordem em que são percorridas. */
    porPessoaESala: Record<string, string[]>;
  };
  lugares: { porId: Record<string, number> };
  fontes: { porId: Record<string, number> };
  imagens: { porId: Record<string, number> };
}

/**
 * Propriedades de um ponto do mapa. Um ponto é o encontro de um acontecimento
 * com um de seus lugares: `eventId` e `placeId` são os identificadores estáveis
 * dos dois, com os nomes pedidos no plano; as demais propriedades repetem
 * campos do conteúdo, com os nomes que têm lá.
 */
export interface EventPointProperties {
  eventId: string;
  placeId: string;
  acontecimentoSlug: string;
  titulo: string;
  categoria: Categoria;
  pessoaIds: string[];
  /** Ano da data, para o filtro de período. */
  ano: number;
  /** A data como está no conteúdo, com a precisão que a fonte sustenta. */
  dataValor: string;
  dataPrecisao: Precisao;
  lugarNome: string;
  /** `municipio`, `uf` e `pais` são aproximações e devem aparecer assim. */
  precisaoGeografica: PrecisaoGeografica;
}

export type EventPointCollection = FeatureCollection<Point, EventPointProperties>;

/** Tudo o que a interface recebe: conjunto, índices e pontos do mapa. */
export interface AtlasData {
  conjunto: PublishedSet;
  indices: Indexes;
  pontos: EventPointCollection;
}
