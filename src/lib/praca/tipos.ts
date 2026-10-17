// Contratos da Praça do Mural (docs/PRACA.md, D-153 e D-154): a aventura de
// investigação em uma praça brasileira compacta. Só tipos.
//
// Três camadas, separadas de propósito:
//   fato      os documentos: decisões já publicadas no atlas (votos, atos e
//             atuações), com data, instituição, cargo, objeto e ação, e os
//             acontecimentos, que a banca mostra como recortes;
//   ficção    a praça, as pessoas que nela vivem (Zefa, Teodoro, o Escrivão e
//             a Lourdes), o bilhete no chão, a credencial, as perguntas do
//             mural e a matéria da mesa da Câmara, que são de moradores
//             inventados e só perguntam o que um documento publicado responde;
//   regra     o que o jogo faz com isso: sessões, gavetas por pessoa e ano,
//             um item por sessão que abre um lugar (a chave, a credencial), a
//             nota montada com os campos do documento e fixada no mural, e a
//             ata lavrada com dois documentos lado a lado.

import type { DecisionView } from "@/lib/data/decisions";
import type { DataHistorica } from "@/lib/domain/types";
import type { PersonagemSlug } from "@/lib/game/types";

/** Os lugares da praça: cada um tem uma função, e nenhum é só caminho. */
export type LugarId = "mural" | "padaria" | "banca" | "arquivo" | "camara";

/** As pessoas da praça, fictícias. O Escrivão é o mesmo guia do jogo. */
export type MoradorId = "zefa" | "teodoro" | "escrivao" | "lourdes";

/** O que se acha e se guarda: o bilhete no chão, a chave das gavetas do Senado e a credencial de imprensa. */
export type ItemId = "bilhete" | "chave-senado" | "credencial";

export interface Lugar {
  id: LugarId;
  nome: string;
  /** O que a pessoa faz ali, em uma frase. */
  funcao: string;
  /** Quem atende, quando há alguém. */
  morador: MoradorId | null;
  /** Fica fechado até a sessão que o abre ser concluída: é o próximo objetivo, à vista. */
  trancado: boolean;
}

/** Uma gaveta do arquivo: as decisões de uma pessoa em um ano, em uma instituição. */
export interface Gaveta {
  id: string;
  pessoa: PersonagemSlug;
  rotulo: string;
  ano: number;
  /** A gaveta só abre com este item. */
  precisa: ItemId | null;
  /** Os documentos, pelo `id` da decisão. */
  documentos: readonly string[];
}

/** Um documento como a praça o leva: o cartão de decisão do atlas. */
export type Documento = DecisionView;

/** Um recorte da banca: um acontecimento do atlas, com data e título. */
export interface Recorte {
  id: string;
  slug: string;
  pessoa: PersonagemSlug | "ambas";
  titulo: string;
  data: DataHistorica;
}

/** O que a pessoa monta para responder uma pauta: o documento, quando e o que ele registra, pelas chaves das opções. */
export interface Nota {
  documento: string;
  quando: string;
  registro: string;
}

/**
 * Uma pauta do mural: a pergunta de um morador inventado, o documento que a
 * responde e o que a nota fixada mostra a mais. A pergunta só pergunta o que
 * o documento responde: todo ano escrito nela está no documento (teste).
 */
export interface Pauta {
  id: string;
  /** A sessão em que a pauta é pregada no mural. */
  sessao: string;
  pessoa: PersonagemSlug;
  /** Quem pergunta: morador fictício, com o que faz. */
  autor: string;
  pergunta: string;
  /** O objetivo, em uma linha, para o cartão da praça. */
  objetivo: string;
  /** O documento que responde a pauta. */
  resposta: string;
  /** Outros documentos que a pauta pede para comparar: a resposta se distingue deles. */
  comparar: readonly string[];
  /** O que a nota fixada mostra a mais: os dispositivos vetados de um ato (sem o objeto, que é longo), ou o objeto com a etapa e o resultado. */
  detalhe: "dispositivos" | "objeto";
  /** A gaveta em que o documento está. */
  gaveta: string;
}

/** Um lado da mesa da Câmara: o documento de uma das pessoas sobre a matéria da sessão. */
export interface LadoDaMateria {
  id: string;
  /** "O voto no Senado", "O ato no Planalto". */
  rotulo: string;
  pessoa: PersonagemSlug;
  documento: string;
  gaveta: string;
}

/**
 * A matéria da mesa da Câmara: uma proposição que passou pelas duas pessoas
 * (uma votou, a outra sancionou ou vetou), com os dois documentos lado a lado.
 * Os dois documentos citam a mesma proposição (teste). A ata não compara
 * posições: cada lado mostra o que o seu documento registra.
 */
export interface Materia {
  id: string;
  sessao: string;
  titulo: string;
  /** O que a mesa pede, em palavras de morador. */
  pergunta: string;
  objetivo: string;
  /** A proposição que os dois documentos citam, pelo `id`. */
  proposicao: string;
  lados: readonly LadoDaMateria[];
}

/** O que a pessoa lavra na mesa: por lado, o documento e o que ele registra, pelas chaves das opções. */
export type Ata = Record<string, { documento: string; registro: string }>;

/**
 * Uma sessão da praça: as pautas pregadas no mural, a matéria da mesa (quando
 * há) e o portão: o item que a sessão pede e o que ele abre. A sessão abre
 * quando a anterior é concluída; concluir uma sessão abre um lugar.
 */
export interface Sessao {
  id: string;
  titulo: string;
  /** A sessão anterior, que precisa estar concluída; `null` na primeira. */
  abreCom: string | null;
  /** O lugar que fica trancado até esta sessão abrir. */
  abreLugar: LugarId | null;
  pautas: readonly string[];
  materia: string | null;
  portao: { item: ItemId; abre: string };
}

/** A situação de uma pauta, ou de uma matéria, na visita. */
export type SituacaoDaPauta = "fechada" | "aberta" | "publicada";

export interface ProgressoDaPraca {
  versao: 1;
  /** Por pauta: publicada, com a nota montada, ou só aberta, com as tentativas. */
  pautas: Record<string, { situacao: SituacaoDaPauta; tentativas: number; nota?: Nota }>;
  /** Por matéria da mesa: lavrada, com a ata, ou só aberta, com as tentativas. Ausente nos progressos gravados antes da segunda sessão. */
  atas: Record<string, { situacao: SituacaoDaPauta; tentativas: number; ata?: Ata }>;
  itens: ItemId[];
  /** As cópias levadas do arquivo, pelo `id` da decisão. */
  copias: string[];
  /** Com quem a pessoa já falou, e o que cada conversa marcou. */
  marcas: string[];
  /** Onde o personagem parou. */
  posicao?: { x: number; z: number };
}

/** O conteúdo que a página entrega ao navegador, montado no build. */
export interface ConteudoDaPraca {
  pessoas: Record<PersonagemSlug, { nome: string }>;
  /** Todos os documentos das gavetas, por `id`. */
  documentos: Record<string, Documento>;
  gavetas: readonly Gaveta[];
  recortes: readonly Recorte[];
  sessoes: readonly Sessao[];
  pautas: readonly Pauta[];
  materias: readonly Materia[];
}
