// Descobertas e selos da praça (D-155), puros e derivados do progresso: nada
// é gravado a mais. Um selo reconhece um caminho percorrido (a primeira nota,
// a chave, a ata); não soma, não ordena pessoas e não existe ranking. As
// descobertas são o que a pessoa já leu e com quem já falou.

import { camaraAberta, fimDaEdicao, pautasDaSessao, sessaoConcluida, situacaoDaMateria, situacaoDaPauta, temItem, type Roteiro } from "./regras";
import type { ConteudoDaPraca, ProgressoDaPraca } from "./tipos";

export interface Selo {
  id: string;
  nome: string;
  /** O que o selo reconhece, em uma frase. */
  descricao: string;
  ganho: boolean;
}

export interface Descobertas {
  /** Documentos de que a pessoa levou cópia. */
  documentos: number;
  /** Quantos documentos existem nas gavetas. */
  documentosNoArquivo: number;
  /** Moradores com quem já falou. */
  conversas: number;
  /** Pautas respondidas no mural. */
  notas: number;
  /** Itens guardados. */
  itens: number;
}

export function descobertas(progresso: ProgressoDaPraca, conteudo: Pick<ConteudoDaPraca, "documentos" | "pautas">): Descobertas {
  const moradores = new Set(progresso.marcas.filter((marca) => marca.startsWith("conversa:")).map((marca) => marca.slice("conversa:".length).split("-")[0]));
  return {
    documentos: progresso.copias.length,
    documentosNoArquivo: Object.keys(conteudo.documentos).length,
    conversas: moradores.size,
    notas: conteudo.pautas.filter((pauta) => situacaoDaPauta(progresso, pauta.id) === "publicada").length,
    itens: progresso.itens.length,
  };
}

/** Os selos, na ordem em que costumam vir, com o que já foi ganho. */
export function selos(progresso: ProgressoDaPraca, conteudo: Roteiro): Selo[] {
  const primeira = conteudo.sessoes[0];
  const notas = conteudo.pautas.filter((pauta) => situacaoDaPauta(progresso, pauta.id) === "publicada").length;
  const camaraOuNao = conteudo.sessoes.some((sessao) => sessao.abreLugar === "camara");
  return [
    { id: "primeira-nota", nome: "Primeira nota", descricao: "Uma pergunta do mural respondida com o documento pregado junto.", ganho: notas > 0 },
    { id: "chave-de-leitura", nome: "Chave de leitura", descricao: "O Escrivão ensinou os cinco campos de um documento.", ganho: progresso.marcas.includes("leitura") },
    { id: "chave-do-senado", nome: "Chave do Senado", descricao: "As gavetas do Senado abertas, com a chave que o bilhete apontou.", ganho: temItem(progresso, "chave-senado") },
    { id: "mural-da-primeira-sessao", nome: "Mural da primeira sessão", descricao: "Todas as pautas da primeira sessão no mural.", ganho: primeira !== undefined && sessaoConcluida(progresso, primeira, conteudo) },
    { id: "porta-da-camara", nome: "Porta da Câmara", descricao: "A corrente caiu e a Câmara abriu.", ganho: camaraOuNao && camaraAberta(progresso, conteudo) && primeira !== undefined && sessaoConcluida(progresso, primeira, conteudo) },
    { id: "credencial", nome: "Credencial de imprensa", descricao: "A mesa da Câmara liberada para a rádio.", ganho: temItem(progresso, "credencial") },
    { id: "ata-lavrada", nome: "Ata lavrada", descricao: "Dois documentos lado a lado no quadro da Câmara, cada um com o que registra.", ganho: conteudo.materias.some((materia) => situacaoDaMateria(progresso, materia.id) === "publicada") },
    { id: "edicao-respondida", nome: "Edição respondida", descricao: `As ${conteudo.sessoes.flatMap((sessao) => pautasDaSessao(sessao, conteudo)).length} perguntas desta edição no mural, com os documentos.`, ganho: fimDaEdicao(progresso, conteudo) },
  ];
}

/** Os selos que a última mudança trouxe: a diferença entre dois progressos, para a tela anunciar na hora. */
export function selosNovos(antes: ProgressoDaPraca, depois: ProgressoDaPraca, conteudo: Roteiro): Selo[] {
  const ganhosAntes = new Set(selos(antes, conteudo).filter((selo) => selo.ganho).map((selo) => selo.id));
  return selos(depois, conteudo).filter((selo) => selo.ganho && !ganhosAntes.has(selo.id));
}
