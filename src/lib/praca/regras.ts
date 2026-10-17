// As regras da Praça do Mural (docs/PRACA.md, D-153 e D-154), puras.
//
// O ciclo: ler uma pergunta no mural, ouvir quem sabe onde procurar, abrir a
// gaveta certa no arquivo e levar cópias, montar a nota com os campos do
// documento (qual documento, quando, o que ele registra) e fixá-la no mural.
// Errar diz, por campo, o que o documento escolhido registra, sem entregar a
// resposta; a nota certa muda o mural e as conversas. As pautas vêm por
// sessão: concluir a primeira abre a Câmara, onde a segunda põe uma matéria na
// mesa, com dois documentos lado a lado, e cada sessão tem um item que abre um
// lugar (a chave, a credencial). Nada soma, nada dá nota, nada premia
// preferência.

import { formatDate, yearOf } from "@/lib/domain/dates";
import { RESULTADO_LABELS } from "@/lib/domain/decisions";
import { documentFields, fieldOf } from "@/lib/game/dossier";
import { chooseIn, currentNode, isDialogOver, startDialog, type DialogGraph, type DialogState } from "@/lib/game/escrivao";

import { CONVERSAS, ITENS_POR_NO, LUGARES, MATERIAS, PAUTAS, SESSOES } from "./praca";
import type { Ata, ConteudoDaPraca, Documento, Gaveta, ItemId, LugarId, Materia, MoradorId, Nota, Pauta, ProgressoDaPraca, Sessao, SituacaoDaPauta } from "./tipos";

/** As sessões, as pautas e as matérias de que as regras precisam; o conteúdo montado no build as filtra pelos documentos que existem. */
export type Roteiro = Pick<ConteudoDaPraca, "sessoes" | "pautas" | "materias">;

/** O roteiro escrito, sem filtro: serve de padrão a quem chama sem o conteúdo montado. */
export const ROTEIRO: Roteiro = { sessoes: SESSOES, pautas: PAUTAS, materias: MATERIAS };

// ---------------------------------------------------------------------------
// Progresso
// ---------------------------------------------------------------------------

export const PRACA_PROGRESS_VERSION = 1;

export function progressoInicial(): ProgressoDaPraca {
  return { versao: 1, pautas: {}, atas: {}, itens: [], copias: [], marcas: [] };
}

const isRecord = (valor: unknown): valor is Record<string, unknown> => typeof valor === "object" && valor !== null && !Array.isArray(valor);
const isStringList = (valor: unknown): valor is string[] => Array.isArray(valor) && valor.every((item) => typeof item === "string");
const SITUACOES: readonly SituacaoDaPauta[] = ["fechada", "aberta", "publicada"];
const ITENS_CONHECIDOS: readonly ItemId[] = ["bilhete", "chave-senado", "credencial"];

/** A situação e as tentativas de uma pauta ou de uma matéria gravadas; `null` quando o dado não tem a forma. */
function lerSituacao(entrada: unknown): { situacao: SituacaoDaPauta; tentativas: number } | null {
  if (!isRecord(entrada) || !SITUACOES.includes(entrada.situacao as SituacaoDaPauta) || typeof entrada.tentativas !== "number") return null;
  return { situacao: entrada.situacao as SituacaoDaPauta, tentativas: entrada.tentativas };
}

/**
 * Lê um progresso salvo. Dado inválido vira começo, e não erro. Pautas,
 * matérias e cópias que a praça não tem mais são descartadas. O campo `atas`
 * pode faltar: os progressos gravados antes da segunda sessão não o têm.
 */
export function lerProgresso(valor: unknown, conteudo: Pick<ConteudoDaPraca, "pautas" | "materias" | "documentos">): ProgressoDaPraca | null {
  if (!isRecord(valor) || valor.versao !== PRACA_PROGRESS_VERSION) return null;
  if (!isRecord(valor.pautas) || !isStringList(valor.itens) || !isStringList(valor.copias) || !isStringList(valor.marcas)) return null;
  if (valor.atas !== undefined && !isRecord(valor.atas)) return null;
  const lido = progressoInicial();
  for (const [id, entrada] of Object.entries(valor.pautas)) {
    if (!conteudo.pautas.some((pauta) => pauta.id === id)) continue;
    const situacao = lerSituacao(entrada);
    if (situacao === null) return null;
    const nota = (entrada as Record<string, unknown>).nota;
    if (nota !== undefined && (!isRecord(nota) || typeof nota.documento !== "string" || typeof nota.quando !== "string" || typeof nota.registro !== "string")) return null;
    const notaLida: Nota | undefined = nota === undefined ? undefined : { documento: nota.documento as string, quando: nota.quando as string, registro: nota.registro as string };
    lido.pautas[id] = { ...situacao, ...(notaLida === undefined ? {} : { nota: notaLida }) };
  }
  for (const [id, entrada] of Object.entries(valor.atas ?? {})) {
    if (!conteudo.materias.some((materia) => materia.id === id)) continue;
    const situacao = lerSituacao(entrada);
    if (situacao === null) return null;
    const ata = (entrada as Record<string, unknown>).ata;
    if (ata !== undefined && (!isRecord(ata) || Object.values(ata).some((lado) => !isRecord(lado) || typeof lado.documento !== "string" || typeof lado.registro !== "string"))) return null;
    const ataLida: Ata | undefined =
      ata === undefined ? undefined : Object.fromEntries(Object.entries(ata).map(([lado, valores]) => [lado, { documento: (valores as Ata[string]).documento, registro: (valores as Ata[string]).registro }]));
    lido.atas[id] = { ...situacao, ...(ataLida === undefined ? {} : { ata: ataLida }) };
  }
  lido.itens = valor.itens.filter((item): item is ItemId => (ITENS_CONHECIDOS as readonly string[]).includes(item));
  lido.copias = valor.copias.filter((id) => conteudo.documentos[id] !== undefined);
  lido.marcas = [...valor.marcas];
  if (isRecord(valor.posicao) && typeof valor.posicao.x === "number" && typeof valor.posicao.z === "number") lido.posicao = { x: valor.posicao.x, z: valor.posicao.z };
  return lido;
}

// ---------------------------------------------------------------------------
// Pautas
// ---------------------------------------------------------------------------

export function situacaoDaPauta(progresso: ProgressoDaPraca, pautaId: string): SituacaoDaPauta {
  return progresso.pautas[pautaId]?.situacao ?? "fechada";
}

/** A pauta em andamento: a primeira aberta; sem nenhuma aberta, nenhuma. */
export function pautaAberta(progresso: ProgressoDaPraca, pautas: readonly Pauta[] = PAUTAS): Pauta | null {
  return pautas.find((pauta) => situacaoDaPauta(progresso, pauta.id) === "aberta") ?? null;
}

/** As pautas que ainda não foram publicadas, na ordem do mural. */
export function pautasPendentes(progresso: ProgressoDaPraca, pautas: readonly Pauta[] = PAUTAS): Pauta[] {
  return pautas.filter((pauta) => situacaoDaPauta(progresso, pauta.id) !== "publicada");
}

export function todasPublicadas(progresso: ProgressoDaPraca, pautas: readonly Pauta[] = PAUTAS): boolean {
  return pautas.length > 0 && pautas.every((pauta) => situacaoDaPauta(progresso, pauta.id) === "publicada");
}

/** Abrir uma pauta no mural: ela passa a ser o objetivo. Uma pauta publicada não reabre. */
export function abrirPauta(progresso: ProgressoDaPraca, pautaId: string): ProgressoDaPraca {
  const atual = progresso.pautas[pautaId];
  if (atual?.situacao === "publicada" || atual?.situacao === "aberta") return progresso;
  return {
    ...progresso,
    pautas: {
      ...progresso.pautas,
      [pautaId]: { situacao: "aberta", tentativas: atual?.tentativas ?? 0 },
    },
  };
}

// ---------------------------------------------------------------------------
// Sessões: o que está aberto, o que está concluído, o que abre
// ---------------------------------------------------------------------------

/** As pautas de uma sessão, na ordem escrita. */
export function pautasDaSessao(sessao: Sessao, roteiro: Roteiro = ROTEIRO): Pauta[] {
  return sessao.pautas.flatMap((id) => roteiro.pautas.filter((pauta) => pauta.id === id));
}

export function materiaDaSessao(sessao: Sessao, roteiro: Roteiro = ROTEIRO): Materia | null {
  return sessao.materia === null ? null : (roteiro.materias.find((materia) => materia.id === sessao.materia) ?? null);
}

/** A sessão está concluída: todas as pautas no mural e, se há matéria, a ata lavrada. */
export function sessaoConcluida(progresso: ProgressoDaPraca, sessao: Sessao, roteiro: Roteiro = ROTEIRO): boolean {
  const materia = materiaDaSessao(sessao, roteiro);
  return todasPublicadas(progresso, pautasDaSessao(sessao, roteiro)) && (materia === null || situacaoDaMateria(progresso, materia.id) === "publicada");
}

/** A sessão está aberta: é a primeira, ou a anterior está concluída. */
export function sessaoAberta(progresso: ProgressoDaPraca, sessao: Sessao, roteiro: Roteiro = ROTEIRO): boolean {
  if (sessao.abreCom === null) return true;
  const anterior = roteiro.sessoes.find((item) => item.id === sessao.abreCom);
  return anterior !== undefined && sessaoConcluida(progresso, anterior, roteiro);
}

/** As sessões abertas, na ordem. */
export function sessoesAbertas(progresso: ProgressoDaPraca, roteiro: Roteiro = ROTEIRO): Sessao[] {
  return roteiro.sessoes.filter((sessao) => sessaoAberta(progresso, sessao, roteiro));
}

/** A sessão de agora: a primeira aberta e não concluída; `null` quando a edição acabou. */
export function sessaoDeAgora(progresso: ProgressoDaPraca, roteiro: Roteiro = ROTEIRO): Sessao | null {
  return sessoesAbertas(progresso, roteiro).find((sessao) => !sessaoConcluida(progresso, sessao, roteiro)) ?? null;
}

/** As pautas pregadas no mural agora: as das sessões abertas. */
export function pautasDisponiveis(progresso: ProgressoDaPraca, roteiro: Roteiro = ROTEIRO): Pauta[] {
  return sessoesAbertas(progresso, roteiro).flatMap((sessao) => pautasDaSessao(sessao, roteiro));
}

/** Todas as sessões concluídas: a edição não tem mais pauta. */
export function fimDaEdicao(progresso: ProgressoDaPraca, roteiro: Roteiro = ROTEIRO): boolean {
  return roteiro.sessoes.length > 0 && roteiro.sessoes.every((sessao) => sessaoConcluida(progresso, sessao, roteiro));
}

/** A Câmara está aberta: a sessão que a abre está aberta. */
export function camaraAberta(progresso: ProgressoDaPraca, roteiro: Roteiro = ROTEIRO): boolean {
  const sessao = roteiro.sessoes.find((item) => item.abreLugar === "camara");
  return sessao === undefined ? true : sessaoAberta(progresso, sessao, roteiro);
}

/** O objetivo de agora, em uma linha, para o cartão da praça. */
export function objetivoDeAgora(progresso: ProgressoDaPraca, roteiro: Roteiro = ROTEIRO): string {
  if (fimDaEdicao(progresso, roteiro)) return "As pautas desta edição acabaram: o mural está respondido e a ata, lavrada. Compare as trajetórias no atlas.";
  const sessao = sessaoDeAgora(progresso, roteiro);
  if (sessao === null) return "Vá ao mural e leia a primeira pergunta dos moradores.";
  const pautas = pautasDaSessao(sessao, roteiro);
  const aberta = pautaAberta(progresso, pautas);
  if (aberta !== null) return aberta.objetivo;
  const materia = materiaDaSessao(sessao, roteiro);
  if (materia !== null && situacaoDaMateria(progresso, materia.id) === "aberta") return temItem(progresso, sessao.portao.item) ? materia.objetivo : `${materia.objetivo} A mesa pede a ${nomeDoPortao(sessao)}.`;
  const pendentes = pautasPendentes(progresso, pautas);
  if (sessao.abreCom === null) return pendentes.length === pautas.length ? "Vá ao mural e leia a primeira pergunta dos moradores." : "Volte ao mural e abra a próxima pergunta.";
  if (materia !== null && situacaoDaMateria(progresso, materia.id) !== "publicada") {
    return pendentes.length === pautas.length ? "A Câmara abriu, e o mural amanheceu com perguntas novas. Entre na Câmara, ou leia o mural." : "Entre na Câmara: a matéria da sessão está na mesa.";
  }
  return pendentes.length === pautas.length ? "Agora o mural: os moradores pregaram perguntas novas, e a ata já está lavrada." : "Volte ao mural e abra a próxima pergunta.";
}

function nomeDoPortao(sessao: Sessao): string {
  return sessao.portao.item === "chave-senado" ? "chave das gavetas do Senado" : sessao.portao.item === "credencial" ? "credencial de imprensa" : sessao.portao.item;
}

// ---------------------------------------------------------------------------
// Itens, cópias e lugares
// ---------------------------------------------------------------------------

export function temItem(progresso: ProgressoDaPraca, item: ItemId): boolean {
  return progresso.itens.includes(item);
}

export function pegarItem(progresso: ProgressoDaPraca, item: ItemId): ProgressoDaPraca {
  return temItem(progresso, item) ? progresso : { ...progresso, itens: [...progresso.itens, item] };
}

/** A gaveta abre? As do Senado pedem a chave. */
export function gavetaAberta(gaveta: Gaveta, progresso: ProgressoDaPraca): boolean {
  return gaveta.precisa === null || temItem(progresso, gaveta.precisa);
}

/** Levar uma cópia de um documento de uma gaveta aberta. Documento que não está em gaveta aberta não sai do arquivo. */
export function levarCopia(progresso: ProgressoDaPraca, documentoId: string, gavetas: readonly Gaveta[]): ProgressoDaPraca {
  const gaveta = gavetas.find((item) => item.documentos.includes(documentoId));
  if (gaveta === undefined || !gavetaAberta(gaveta, progresso) || progresso.copias.includes(documentoId)) return progresso;
  return { ...progresso, copias: [...progresso.copias, documentoId] };
}

export function devolverCopia(progresso: ProgressoDaPraca, documentoId: string): ProgressoDaPraca {
  return progresso.copias.includes(documentoId)
    ? {
        ...progresso,
        copias: progresso.copias.filter((id) => id !== documentoId),
      }
    : progresso;
}

/** Os lugares como estão agora: a Câmara abre com a primeira sessão concluída. */
export function lugaresDeAgora(progresso: ProgressoDaPraca, roteiro: Roteiro = ROTEIRO) {
  return LUGARES.map((lugar) => (lugar.id === "camara" ? { ...lugar, trancado: !camaraAberta(progresso, roteiro) } : lugar));
}

export function lugar(id: LugarId) {
  return LUGARES.find((item) => item.id === id)!;
}

// ---------------------------------------------------------------------------
// Conversas
// ---------------------------------------------------------------------------

/** O grafo que vale para um morador na situação de agora. */
export function conversaDe(morador: MoradorId, progresso: ProgressoDaPraca, roteiro: Roteiro = ROTEIRO): { chave: string; grafo: DialogGraph } {
  const escolher = (chave: string) => ({ chave, grafo: CONVERSAS[chave]! });
  const segunda = camaraAberta(progresso, roteiro);
  const fim = fimDaEdicao(progresso, roteiro);
  const materia = roteiro.materias[0] ?? null;
  const lavrada = materia !== null && situacaoDaMateria(progresso, materia.id) === "publicada";
  if (morador === "zefa") {
    if (fim) return escolher("zefa-fim");
    if (segunda) return escolher("zefa-sessao");
    if (temItem(progresso, "bilhete") && !temItem(progresso, "chave-senado")) return escolher("zefa-chave");
    return escolher("zefa-boas-vindas");
  }
  if (morador === "teodoro") return escolher(segunda && !temItem(progresso, "credencial") ? "teodoro-credencial" : "teodoro-recortes");
  if (morador === "lourdes") {
    if (fim) return escolher("lourdes-fim");
    if (lavrada) return escolher("lourdes-ata");
    return escolher(temItem(progresso, "credencial") ? "lourdes-mesa" : "lourdes-sessao");
  }
  if (segunda && !lavrada && temItem(progresso, "credencial")) return escolher("escrivao-materia");
  return escolher(temItem(progresso, "chave-senado") ? "escrivao-com-chave" : "escrivao-gavetas");
}

/** Um passo na conversa: a escolha, a marca que ela deixa e o item que o nó alcançado entrega. */
export function conversar(progresso: ProgressoDaPraca, grafo: DialogGraph, estado: DialogState, escolhaId: string): { estado: DialogState; progresso: ProgressoDaPraca } {
  const proximo = chooseIn(estado, escolhaId, grafo);
  let atualizado = progresso;
  for (const marca of proximo.marcas) if (!atualizado.marcas.includes(marca)) atualizado = { ...atualizado, marcas: [...atualizado.marcas, marca] };
  const item = ITENS_POR_NO[proximo.no];
  if (item !== undefined) atualizado = pegarItem(atualizado, item);
  return { estado: proximo, progresso: atualizado };
}

export { currentNode, isDialogOver, startDialog };

// ---------------------------------------------------------------------------
// A nota: montar e fixar
// ---------------------------------------------------------------------------

/** Uma opção de um campo da nota, tirada de um documento levado. */
export interface Opcao {
  chave: string;
  texto: string;
  /** O documento de que a opção veio. */
  documento: string;
}

/** As opções de cada campo, tiradas só das cópias levadas, sem repetição de texto e em ordem estável. */
export function opcoesDaNota(progresso: ProgressoDaPraca, documentos: Record<string, Documento>): { documento: Opcao[]; quando: Opcao[]; registro: Opcao[] } {
  const copias = progresso.copias.flatMap((id) => (documentos[id] === undefined ? [] : [documentos[id]!]));
  const unicas = (lista: Opcao[]) => {
    const vistas = new Set<string>();
    return lista.filter((opcao) => (vistas.has(opcao.texto) ? false : (vistas.add(opcao.texto), true)));
  };
  return {
    documento: copias.map((doc) => ({
      chave: doc.id,
      texto: doc.titulo,
      documento: doc.id,
    })),
    quando: unicas(
      copias.map((doc) => ({
        chave: `data:${doc.data.valor}`,
        texto: formatDate(doc.data),
        documento: doc.id,
      })),
    ),
    registro: unicas(
      copias.map((doc) => ({
        chave: `acao:${fieldOf(doc, "acao").valor}`,
        texto: fieldOf(doc, "acao").valor,
        documento: doc.id,
      })),
    ),
  };
}

/** A nota certa de uma pauta, nas mesmas chaves das opções. */
export function notaCerta(pauta: Pauta, documentos: Record<string, Documento>): Nota | null {
  const doc = documentos[pauta.resposta];
  if (doc === undefined) return null;
  return {
    documento: doc.id,
    quando: `data:${doc.data.valor}`,
    registro: `acao:${fieldOf(doc, "acao").valor}`,
  };
}

export interface Fixacao {
  progresso: ProgressoDaPraca;
  certo: boolean;
  /** No erro, uma frase por campo errado, só com o que o documento escolhido registra. */
  erros: { campo: keyof Nota; mensagem: string }[];
}

/** A frase de um documento que não é o pedido: o que ele registra, quando e sobre o quê. Não diz o certo. */
function fraseDoDocumentoErrado(escolhido: Documento, releia: string): string {
  const campos = documentFields(escolhido);
  const campo = (nome: "acao" | "objeto") => campos.find((item) => item.campo === nome)!;
  return `Esse documento registra ${campo("acao").resumo}, em ${yearOf(escolhido.data)}, sobre ${campo("objeto").resumo}. ${releia}`;
}

/** "O voto no Senado" no meio de uma frase: só a primeira letra desce; o nome da casa fica como é. */
function minuscula(texto: string): string {
  return texto.charAt(0).toLowerCase() + texto.slice(1);
}

/** A frase de uma ação que não é a do documento escolhido. */
function fraseDaAcaoErrada(escolhido: Documento): string {
  return `O campo Ação do documento que você escolheu diz outra coisa: ${fieldOf(escolhido, "acao").valor}.`;
}

/**
 * Fixar a nota no mural. Tudo certo publica a pauta; errado conta a tentativa
 * e diz, campo a campo, o que não bate, sem dizer o certo. O documento vem
 * primeiro: com o documento errado, as frases falam dele; com o documento
 * certo, falam dos campos dele.
 */
export function fixarNota(progresso: ProgressoDaPraca, pauta: Pauta, nota: Nota, documentos: Record<string, Documento>): Fixacao {
  const certa = notaCerta(pauta, documentos);
  const escolhido = documentos[nota.documento];
  const atual = progresso.pautas[pauta.id] ?? {
    situacao: "aberta" as const,
    tentativas: 0,
  };
  if (certa === null || escolhido === undefined || !progresso.copias.includes(nota.documento)) {
    return {
      progresso,
      certo: false,
      erros: [
        {
          campo: "documento",
          mensagem: "Escolha um documento que você levou do arquivo.",
        },
      ],
    };
  }
  if (atual.situacao === "publicada") return { progresso, certo: true, erros: [] };
  const erros: Fixacao["erros"] = [];
  if (nota.documento !== certa.documento) erros.push({ campo: "documento", mensagem: fraseDoDocumentoErrado(escolhido, "Releia a pergunta: ela pede outra coisa.") });
  if (nota.quando !== `data:${escolhido.data.valor}`) {
    erros.push({
      campo: "quando",
      mensagem: `Essa data não é a do documento que você escolheu. O campo Data dele diz ${fieldOf(escolhido, "data").valor}.`,
    });
  }
  if (nota.registro !== `acao:${fieldOf(escolhido, "acao").valor}`) erros.push({ campo: "registro", mensagem: fraseDaAcaoErrada(escolhido) });
  const tentativas = atual.tentativas + 1;
  if (erros.length > 0)
    return {
      progresso: {
        ...progresso,
        pautas: {
          ...progresso.pautas,
          [pauta.id]: { situacao: "aberta", tentativas },
        },
      },
      certo: false,
      erros,
    };
  return {
    progresso: {
      ...progresso,
      pautas: {
        ...progresso.pautas,
        [pauta.id]: { situacao: "publicada", tentativas, nota },
      },
    },
    certo: true,
    erros: [],
  };
}

/** O que um documento mostra quando é pregado no mural ou lavrado na ata: os campos, o detalhe da natureza dele e as fontes. */
export interface DocumentoExposto {
  documento: Documento;
  linhas: { rotulo: string; valor: string }[];
  /** Os itens do detalhe (os dispositivos vetados), quando o documento os tem. */
  itens: string[];
  fontes: Documento["fontes"];
}

/**
 * Os campos de um documento como a nota e a ata os escrevem. Com o objeto
 * (que é longo) ou sem ele; mais o que a natureza acrescenta: a mensagem e os
 * dispositivos de um veto, a medida ou o decreto de um ato, o resultado de uma
 * votação, a norma em que uma atuação deu.
 */
export function exporDocumento(documento: Documento, comObjeto: boolean): DocumentoExposto {
  const campos = documentFields(documento);
  const linhas = campos.filter((campo) => campo.campo !== "objeto" || comObjeto).map((campo) => ({ rotulo: campo.rotulo, valor: campo.valor }));
  let itens: string[] = [];
  if (documento.natureza === "ato") {
    const detalhe = documento.ato.detalhes.find((item) => item.itens !== undefined);
    itens = detalhe?.itens === undefined ? [] : [...detalhe.itens];
    for (const outro of documento.ato.detalhes.filter((item) => item.itens === undefined)) linhas.push({ rotulo: outro.rotulo, valor: outro.valor });
  }
  if (documento.natureza === "voto") {
    linhas.push({
      rotulo: "Resultado da votação",
      valor: `${RESULTADO_LABELS[documento.votacao.resultado.estado]} (valor original: ${documento.votacao.resultado.valorOriginal})`,
    });
  }
  if (documento.natureza === "atuacao" && documento.atuacao.desfecho.norma !== null) linhas.push({ rotulo: "Norma", valor: documento.atuacao.desfecho.norma });
  return { documento, linhas, itens, fontes: documento.fontes };
}

/** O que a nota fixada mostra: os campos do documento e o detalhe que a pauta pede, com a fonte. */
export interface NotaFixada extends DocumentoExposto {
  pauta: Pauta;
}

export function notaFixada(pauta: Pauta, documentos: Record<string, Documento>): NotaFixada | null {
  const documento = documentos[pauta.resposta];
  if (documento === undefined) return null;
  return { pauta, ...exporDocumento(documento, pauta.detalhe === "objeto") };
}

// ---------------------------------------------------------------------------
// A mesa da Câmara: a matéria e a ata
// ---------------------------------------------------------------------------

export function situacaoDaMateria(progresso: ProgressoDaPraca, materiaId: string): SituacaoDaPauta {
  return progresso.atas[materiaId]?.situacao ?? "fechada";
}

/** Pôr a matéria na pauta: ela passa a ser o objetivo. Uma matéria lavrada não reabre. */
export function abrirMateria(progresso: ProgressoDaPraca, materiaId: string): ProgressoDaPraca {
  const atual = progresso.atas[materiaId];
  if (atual?.situacao === "publicada" || atual?.situacao === "aberta") return progresso;
  return { ...progresso, atas: { ...progresso.atas, [materiaId]: { situacao: "aberta", tentativas: atual?.tentativas ?? 0 } } };
}

/** A ata certa de uma matéria, nas mesmas chaves das opções da nota. */
export function ataCerta(materia: Materia, documentos: Record<string, Documento>): Ata | null {
  const ata: Ata = {};
  for (const lado of materia.lados) {
    const doc = documentos[lado.documento];
    if (doc === undefined) return null;
    ata[lado.id] = { documento: doc.id, registro: `acao:${fieldOf(doc, "acao").valor}` };
  }
  return ata;
}

export interface Lavratura {
  progresso: ProgressoDaPraca;
  certo: boolean;
  /** No erro, uma frase por lado e campo errados, só com o que o documento escolhido registra. */
  erros: { lado: string; campo: "documento" | "registro"; mensagem: string }[];
}

/**
 * Lavrar a ata na mesa. Cada lado pede um documento levado do arquivo e o que
 * ele registra. Tudo certo lavra a ata; errado conta a tentativa e diz, por
 * lado, o que o documento escolhido registra, sem dizer o certo.
 */
export function lavrarAta(progresso: ProgressoDaPraca, materia: Materia, ata: Ata, documentos: Record<string, Documento>): Lavratura {
  const certa = ataCerta(materia, documentos);
  const atual = progresso.atas[materia.id] ?? { situacao: "aberta" as const, tentativas: 0 };
  if (certa === null) return { progresso, certo: false, erros: [] };
  if (atual.situacao === "publicada") return { progresso, certo: true, erros: [] };
  const erros: Lavratura["erros"] = [];
  for (const lado of materia.lados) {
    const escolha = ata[lado.id];
    const escolhido = escolha === undefined ? undefined : documentos[escolha.documento];
    if (escolha === undefined || escolhido === undefined || !progresso.copias.includes(escolha.documento)) {
      erros.push({ lado: lado.id, campo: "documento", mensagem: "Escolha um documento que você levou do arquivo." });
      continue;
    }
    if (escolha.documento !== certa[lado.id]!.documento) erros.push({ lado: lado.id, campo: "documento", mensagem: fraseDoDocumentoErrado(escolhido, `A mesa pede ${minuscula(lado.rotulo)} sobre a matéria da sessão.`) });
    if (escolha.registro !== `acao:${fieldOf(escolhido, "acao").valor}`) erros.push({ lado: lado.id, campo: "registro", mensagem: fraseDaAcaoErrada(escolhido) });
  }
  const tentativas = atual.tentativas + 1;
  if (erros.length > 0) return { progresso: { ...progresso, atas: { ...progresso.atas, [materia.id]: { situacao: "aberta", tentativas } } }, certo: false, erros };
  return { progresso: { ...progresso, atas: { ...progresso.atas, [materia.id]: { situacao: "publicada", tentativas, ata } } }, certo: true, erros: [] };
}

/** O que a ata lavrada mostra: a matéria, e cada lado com o seu documento inteiro, lado a lado. */
export interface AtaLavrada {
  materia: Materia;
  /** A proposição que os dois documentos citam, como o primeiro documento a identifica. */
  proposicao: { identificacao: string; ementa: string } | null;
  lados: (DocumentoExposto & { lado: Materia["lados"][number] })[];
}

export function ataLavrada(materia: Materia, documentos: Record<string, Documento>): AtaLavrada | null {
  const lados: AtaLavrada["lados"] = [];
  for (const lado of materia.lados) {
    const documento = documentos[lado.documento];
    if (documento === undefined) return null;
    lados.push({ lado, ...exporDocumento(documento, true) });
  }
  const proposicao = lados.flatMap((item) => item.documento.proposicoes).find((item) => item.id === materia.proposicao);
  return { materia, proposicao: proposicao === undefined ? null : { identificacao: proposicao.identificacao, ementa: proposicao.ementa }, lados };
}

/** Os anos escritos em um texto: para o teste que confere as perguntas contra os documentos. */
export function anosEm(texto: string): string[] {
  return [...new Set(texto.match(/\b(?:1[89]\d{2}|20\d{2})\b/g) ?? [])];
}
