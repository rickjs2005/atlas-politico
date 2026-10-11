// Regras de tarefa e de saída: o que cumpre a tarefa de um capítulo e o que
// abre a passagem para o seguinte. Funções puras sobre o estado da tarefa e
// os registros do capítulo.
//
// Objetivo, ação e conclusão são explícitos:
//   registro   recolher o registro pedido cumpre a tarefa;
//   ordem      recolher os dois registros e confirmar a ordem certa cumpre;
//   fonte      recolher o registro e indicar o documento que o sustenta cumpre;
//   lugar      recolher o registro e indicar o lugar documentado cumpre;
//   decisao    recolher o registro da decisão e, em duas etapas, indicar o
//              documento que a sustenta e interpretar o que ela documenta
//              cumpre. A segunda etapa só abre depois da primeira.
//              Errar explica e permite tentar de novo, sem punição.
//   saída      abre com a tarefa cumprida e TODOS os registros do capítulo
//              recolhidos (acontecimentos e decisões), e não só os que a
//              tarefa pede.
//
// As opções das tarefas de fonte, de lugar e de decisão vêm dos próprios
// registros: o documento certo é o que o registro cita, e os outros são
// documentos citados por outros registros do capítulo; o lugar certo é o que
// o atlas documenta, e os outros são lugares de outros registros da
// trajetória; a interpretação certa é o que o registro da decisão traz
// (manifestação e objeto votado, ou tipo do ato), e as outras trocam uma
// dessas coisas. Nada é inventado.

import { compareDates, formatDate, intervalsOverlap, calcInterval } from "@/lib/domain/dates";
import { OBJETO_LABELS, POSICAO_LABELS, TIPO_DE_ATO_LABELS, type ObjetoVotado, type PosicaoDeVoto, type TipoDeAto } from "@/lib/domain/decisions";
import type { DataHistorica } from "@/lib/domain/types";

import type { ChapterSpec, GameContent, GameDecision, GameDocument, GameRecord, GameSource, TaskSpec, TaskState } from "./types";

export function initialTaskState(): TaskState {
  return { recolhidos: [], confirmada: false, tentativas: 0 };
}

/** Os registros do capítulo, na ordem das posições na cena: os acontecimentos e depois as decisões. */
export function recordIds(capitulo: Pick<ChapterSpec, "eventIds" | "decisaoIds">): string[] {
  return [...capitulo.eventIds, ...(capitulo.decisaoIds ?? [])];
}

/** Os registros que a tarefa exige, na ordem em que a tarefa os cita. */
export function requiredRecords(tarefa: TaskSpec): readonly string[] {
  if (tarefa.tipo === "ordem") return tarefa.eventIds;
  if (tarefa.tipo === "decisao") return [tarefa.decisaoId];
  return [tarefa.eventId];
}

/** A tarefa pede uma resposta depois de recolher (ordem, fonte, lugar, decisão), e não só o recolhimento. */
export function hasAnswer(tarefa: TaskSpec): boolean {
  return tarefa.tipo !== "registro";
}

/**
 * A assinatura de uma tarefa no formato das versões 1 a 4 do progresso: o
 * tipo e os identificadores que ela pede. Serve à leitura dos progressos
 * salvos nessas versões e às tabelas congeladas `LEGACY_SIGNATURES`
 * (src/lib/game/progress.ts).
 */
export function legacyTaskSignature(tarefa: TaskSpec): string {
  return `${tarefa.tipo}:${requiredRecords(tarefa).join("+")}`;
}

/** O conteúdo de que as regras de tarefa precisam: os registros e as decisões do personagem. */
export type TaskContent = Pick<GameContent, "registros" | "decisoes">;

/** Os registros e as decisões como um só mapa de documentos, para as regras que servem aos dois. */
export function documentsFrom(conteudo: TaskContent): Record<string, GameDocument> {
  return { ...conteudo.registros, ...conteudo.decisoes };
}

/**
 * O que decide a resposta certa de uma tarefa, como o conteúdo o traz: as
 * datas dos dois registros (ordem), os documentos citados (fonte), o lugar
 * documentado (lugar), os documentos e a interpretação certa (decisão). O
 * texto dos registros (título, resumo, explicações) não entra: mudar o
 * estilo não reabre a resposta. Registro ausente entra como `null`.
 */
export function decisiveData(tarefa: TaskSpec, conteudo: TaskContent): unknown {
  switch (tarefa.tipo) {
    case "registro":
      return null;
    case "ordem":
      return tarefa.eventIds.map((id) => conteudo.registros[id]?.data ?? null);
    case "fonte":
      return conteudo.registros[tarefa.eventId]?.fontes.map((fonte) => fonte.id).sort() ?? null;
    case "lugar": {
      const registro = conteudo.registros[tarefa.eventId];
      return registro === undefined ? null : placeLabel(registro);
    }
    case "decisao": {
      const decisao = conteudo.decisoes[tarefa.decisaoId];
      return decisao === undefined ? null : { fontes: decisao.fontes.map((fonte) => fonte.id).sort(), interpretacao: correctInterpretation(decisao).id };
    }
  }
}

/**
 * Um resumo curto e determinístico de um valor (FNV-1a de 32 bits sobre o
 * JSON dele), em oito dígitos hexadecimais. Não é segurança: é detecção de
 * mudança, igual no navegador e no Node.
 */
export function digestOf(valor: unknown): string {
  const texto = JSON.stringify(valor) ?? "null";
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i += 1) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

/**
 * A assinatura de uma tarefa: o tipo, os identificadores que ela pede e o
 * resumo dos dados que decidem a resposta (`decisiveData`). Vai para o
 * progresso salvo junto com a resposta, para a leitura saber a qual tarefa
 * ela pertence (src/lib/game/progress.ts): trocar o tipo da tarefa, o que ela
 * pede, ou os dados que decidem a resposta, sob os mesmos identificadores de
 * capítulo, não deixa uma resposta antiga valer para a nova (D-119, D-130).
 */
export function taskSignature(tarefa: TaskSpec, conteudo: TaskContent): string {
  return `${legacyTaskSignature(tarefa)}@${digestOf(decisiveData(tarefa, conteudo))}`;
}

/** Recolher um registro. Recolher o mesmo duas vezes não muda nada. */
export function collect(estado: TaskState, id: string): TaskState {
  if (estado.recolhidos.includes(id)) return estado;
  return { ...estado, recolhidos: [...estado.recolhidos, id] };
}

/** Os registros exigidos já foram recolhidos? */
export function hasRequired(tarefa: TaskSpec, estado: TaskState): boolean {
  return requiredRecords(tarefa).every((id) => estado.recolhidos.includes(id));
}

export function isTaskDone(tarefa: TaskSpec, estado: TaskState): boolean {
  if (tarefa.tipo === "registro") return estado.recolhidos.includes(tarefa.eventId);
  return estado.confirmada;
}

/** A resposta da tarefa está pronta para ser dada (os registros recolhidos, resposta ainda não confirmada)? */
export function isAnswerPending(tarefa: TaskSpec, estado: TaskState): boolean {
  return hasAnswer(tarefa) && hasRequired(tarefa, estado) && !estado.confirmada;
}

/** Tarefa de decisão: a etapa da evidência (o documento) já foi confirmada? */
export function isEvidenceDone(estado: TaskState): boolean {
  return estado.evidencia === true;
}

/** Os registros do capítulo que ainda não foram recolhidos, na ordem do capítulo. */
export function missingRecords(capitulo: ChapterSpec, estado: TaskState): string[] {
  return recordIds(capitulo).filter((id) => !estado.recolhidos.includes(id));
}

/**
 * A saída do capítulo está aberta: a tarefa foi cumprida e não falta
 * recolher nenhum registro do capítulo. Cumprir só a tarefa não abre a
 * passagem, e recolher tudo sem responder também não.
 */
export function isExitOpen(capitulo: ChapterSpec, estado: TaskState): boolean {
  return isTaskDone(capitulo.tarefa, estado) && missingRecords(capitulo, estado).length === 0;
}

/**
 * As datas decidem a ordem sem ambiguidade: os intervalos de cálculo das
 * duas não se cruzam. `1980-02-10` e `1986` decidem; `1980` e `1980-02-10`
 * não, porque o ano inteiro contém o dia.
 */
export function datesDecideOrder(a: DataHistorica, b: DataHistorica): boolean {
  return !intervalsOverlap(calcInterval(a), calcInterval(b));
}

/** A avaliação de uma resposta, já aplicada ao estado da tarefa. */
export interface Attempt {
  estado: TaskState;
  certo: boolean;
  /** Explicação curta, com os registros, as datas ou os documentos envolvidos. */
  explicacao: string;
}

/**
 * Conta a tentativa e confirma a tarefa se a resposta estiver certa, gravando
 * a assinatura da tarefa respondida. Errar não desfaz nada.
 */
function attempt(tarefa: TaskSpec, estado: TaskState, certo: boolean, explicacao: string, conteudo: TaskContent): Attempt {
  const proximo: TaskState = { ...estado, tentativas: estado.tentativas + 1, confirmada: certo || estado.confirmada };
  if (certo) proximo.assinatura = taskSignature(tarefa, conteudo);
  return { estado: proximo, certo, explicacao };
}

// ---------------------------------------------------------------------------
// Ordem
// ---------------------------------------------------------------------------

/** A ordem cronológica correta dos dois registros de uma tarefa de ordem. */
export function correctOrder(tarefa: Extract<TaskSpec, { tipo: "ordem" }>, registros: Record<string, GameRecord>): [string, string] {
  const [a, b] = tarefa.eventIds;
  const ra = registros[a];
  const rb = registros[b];
  if (ra === undefined || rb === undefined) return [a, b];
  return compareDates(ra.data, rb.data) <= 0 ? [a, b] : [b, a];
}

/**
 * Responder a tarefa de ordem com `primeiro` antes de `segundo`. Com a ordem
 * errada, a explicação diz as datas e qual veio antes, e o estado continua
 * aberto para outra tentativa.
 */
export function submitOrder(
  tarefa: Extract<TaskSpec, { tipo: "ordem" }>,
  estado: TaskState,
  resposta: readonly [string, string],
  conteudo: TaskContent,
): Attempt {
  const { registros } = conteudo;
  const [antes, depois] = correctOrder(tarefa, registros);
  const certo = resposta[0] === antes && resposta[1] === depois;
  const ra = registros[antes];
  const rb = registros[depois];
  // Os títulos do atlas são orações: a data vai entre parênteses, e não em uma frase montada com eles.
  const datas = ra && rb ? `Datas dos registros: ${ra.titulo} (${formatDate(ra.data)}); ${rb.titulo} (${formatDate(rb.data)}).` : "";
  return attempt(tarefa, estado, certo, certo ? `Ordem certa. ${datas}` : `Ainda não. ${datas} A data mais antiga vem primeiro. Tente de novo: não há penalidade.`, conteudo);
}

// ---------------------------------------------------------------------------
// Fonte e lugar: escolher entre opções que vêm dos registros
// ---------------------------------------------------------------------------

/** Uma alternativa de uma tarefa de escolha, com o que a pessoa vê. */
export interface ChoiceOption {
  id: string;
  rotulo: string;
  /** Complemento: a autoria do documento, ou o que distingue a opção. */
  detalhe: string;
}

/** Quantas opções erradas acompanham a certa. */
export const DISTRACTORS = 2;

/** Ordem estável e sem a certa sempre na mesma posição: pelo código dos caracteres dos identificadores. */
function sortOptions(opcoes: ChoiceOption[]): ChoiceOption[] {
  return [...opcoes].sort((a, b) => {
    const ka = hashOf(a.id);
    const kb = hashOf(b.id);
    return ka === kb ? (a.id < b.id ? -1 : 1) : ka - kb;
  });
}

function hashOf(texto: string): number {
  let h = 7;
  for (let i = 0; i < texto.length; i += 1) h = (h * 31 + texto.charCodeAt(i)) % 1000003;
  return h;
}

/**
 * Os documentos entre os quais a pessoa escolhe: o primeiro citado pelo
 * registro pedido e, como alternativas erradas, documentos citados por
 * outros registros do capítulo (acontecimentos ou decisões) e por nenhuma
 * citação do registro pedido. Os registros entram na ordem do capítulo, para
 * o resultado ser o mesmo em toda visita. Vazio se o registro não existe ou
 * não tem fonte.
 */
export function sourceOptions(capitulo: ChapterSpec, documentos: Record<string, GameDocument>, id: string): ChoiceOption[] {
  const alvo = documentos[id];
  const certa = alvo?.fontes[0];
  if (alvo === undefined || certa === undefined) return [];
  const citadas = new Set(alvo.fontes.map((fonte) => fonte.id));
  const erradas = new Map<string, GameSource>();
  for (const outro of recordIds(capitulo)) {
    if (outro === id) continue;
    for (const fonte of documentos[outro]?.fontes ?? []) {
      if (citadas.has(fonte.id) || erradas.has(fonte.id)) continue;
      erradas.set(fonte.id, fonte);
      if (erradas.size === DISTRACTORS) break;
    }
    if (erradas.size === DISTRACTORS) break;
  }
  const opcoes = [certa, ...erradas.values()].map((fonte) => ({ id: fonte.id, rotulo: fonte.titulo, detalhe: fonte.autoria }));
  return sortOptions(opcoes);
}

/** Qual registro do capítulo cita este documento, para a explicação. */
function citedBy(capitulo: ChapterSpec, documentos: Record<string, GameDocument>, fonteId: string): GameDocument | undefined {
  for (const id of recordIds(capitulo)) {
    const registro = documentos[id];
    if (registro?.fontes.some((fonte) => fonte.id === fonteId)) return registro;
  }
  return undefined;
}

/** A explicação de um documento escolhido para um registro: certo, se o registro o cita; senão, de quem ele é. */
function explainSource(capitulo: ChapterSpec, documentos: Record<string, GameDocument>, alvo: GameDocument, fonteId: string): { certo: boolean; explicacao: string } {
  const citada = alvo.fontes.find((fonte) => fonte.id === fonteId);
  if (citada !== undefined) {
    return { certo: true, explicacao: `Certo. O registro cita ${citada.titulo} (${citada.autoria}). O que o trecho sustenta: ${citada.evidencia}` };
  }
  const outro = citedBy(capitulo, documentos, fonteId);
  const sustenta = outro === undefined ? "Esse documento não é citado por este registro." : `Esse documento é citado por outro registro do capítulo: ${outro.titulo} (${formatDate(outro.data)}).`;
  const dica = `O registro pedido cita ${alvo.fontes.length === 1 ? "um documento" : `${alvo.fontes.length} documentos`}; a lista está no próprio registro, ao recolhê-lo. Tente de novo: não há penalidade.`;
  return { certo: false, explicacao: `Ainda não. ${sustenta} ${dica}` };
}

/**
 * Responder a tarefa de fonte com o `id` de um documento. Qualquer documento
 * citado pelo registro conta como certo. Errar diz qual registro do capítulo
 * o documento escolhido sustenta e deixa tentar de novo.
 */
export function submitSource(
  tarefa: Extract<TaskSpec, { tipo: "fonte" }>,
  estado: TaskState,
  capitulo: ChapterSpec,
  conteudo: TaskContent,
  fonteId: string,
): Attempt {
  const { registros } = conteudo;
  const alvo = registros[tarefa.eventId];
  if (alvo === undefined) return attempt(tarefa, estado, false, "O registro desta tarefa não está no conteúdo.", conteudo);
  const { certo, explicacao } = explainSource(capitulo, registros, alvo, fonteId);
  return attempt(tarefa, estado, certo, explicacao, conteudo);
}

/** O rótulo de um lugar documentado, ou da abrangência, como a ficha diz. */
export function placeLabel(registro: GameRecord): string {
  if (registro.localizacao.tipo === "lugares") return registro.localizacao.lugares.join(" e ");
  return registro.localizacao.tipo === "nacional" ? "Abrangência nacional" : "Lugar não documentado";
}

/**
 * Os lugares entre os quais a pessoa escolhe: o documentado para o registro
 * pedido e, como alternativas erradas, lugares documentados para outros
 * registros da trajetória, diferentes do certo. Os registros entram na
 * ordem dos capítulos. Vazio se o registro pedido não tem lugar documentado.
 */
export function placeOptions(capitulos: readonly ChapterSpec[], registros: Record<string, GameRecord>, eventId: string): ChoiceOption[] {
  const alvo = registros[eventId];
  if (alvo === undefined || alvo.localizacao.tipo !== "lugares") return [];
  const certo = placeLabel(alvo);
  const erradas: string[] = [];
  for (const capitulo of capitulos) {
    for (const id of capitulo.eventIds) {
      if (id === eventId) continue;
      const registro = registros[id];
      if (registro === undefined || registro.localizacao.tipo !== "lugares") continue;
      const rotulo = placeLabel(registro);
      if (rotulo === certo || erradas.includes(rotulo)) continue;
      erradas.push(rotulo);
      if (erradas.length === DISTRACTORS) break;
    }
    if (erradas.length === DISTRACTORS) break;
  }
  return sortOptions([certo, ...erradas].map((rotulo) => ({ id: rotulo, rotulo, detalhe: "" })));
}

/**
 * Responder a tarefa de lugar com o rótulo de um lugar. Errar diz qual
 * registro do capítulo o atlas documenta no lugar escolhido, quando há um,
 * e deixa tentar de novo.
 */
export function submitPlace(
  tarefa: Extract<TaskSpec, { tipo: "lugar" }>,
  estado: TaskState,
  capitulos: readonly ChapterSpec[],
  conteudo: TaskContent,
  lugar: string,
): Attempt {
  const { registros } = conteudo;
  const alvo = registros[tarefa.eventId];
  if (alvo === undefined) return attempt(tarefa, estado, false, "O registro desta tarefa não está no conteúdo.", conteudo);
  const certo = placeLabel(alvo);
  if (lugar === certo) return attempt(tarefa, estado, true, `Certo. O atlas documenta este acontecimento em ${certo}, como diz a ficha dele.`, conteudo);
  let outro: GameRecord | undefined;
  for (const capitulo of capitulos) {
    for (const id of capitulo.eventIds) {
      const registro = registros[id];
      if (registro !== undefined && registro.localizacao.tipo === "lugares" && placeLabel(registro) === lugar) {
        outro = registro;
        break;
      }
    }
    if (outro !== undefined) break;
  }
  const onde = outro === undefined ? "Esse lugar não é o deste registro." : `${lugar} é o lugar de outro registro: ${outro.titulo} (${formatDate(outro.data)}).`;
  return attempt(tarefa, estado, false, `Ainda não. ${onde} O lugar documentado aparece no registro, ao recolhê-lo. Tente de novo: não há penalidade.`, conteudo);
}

// ---------------------------------------------------------------------------
// Decisão: conferir a evidência e interpretar o que o registro documenta
// ---------------------------------------------------------------------------

/**
 * Primeira etapa da tarefa de decisão: o documento que sustenta o registro da
 * decisão, entre os documentos do capítulo (as opções são de
 * `sourceOptions`, sobre acontecimentos e decisões). Acertar grava a etapa
 * (`evidencia`) e não confirma a tarefa: falta a interpretação. Errar explica
 * de quem é o documento escolhido e deixa tentar de novo.
 */
export function submitEvidence(
  tarefa: Extract<TaskSpec, { tipo: "decisao" }>,
  estado: TaskState,
  capitulo: ChapterSpec,
  conteudo: TaskContent,
  fonteId: string,
): Attempt {
  const documentos = documentsFrom(conteudo);
  const alvo = documentos[tarefa.decisaoId];
  if (alvo === undefined) return { estado: { ...estado, tentativas: estado.tentativas + 1 }, certo: false, explicacao: "O registro desta tarefa não está no conteúdo." };
  const { certo, explicacao } = explainSource(capitulo, documentos, alvo, fonteId);
  const proximo: TaskState = { ...estado, tentativas: estado.tentativas + 1 };
  if (certo) {
    proximo.evidencia = true;
    // A etapa confirmada leva a assinatura, como a interpretação: uma correção nos dados que decidem a resposta reabre as duas (D-130).
    proximo.assinatura = taskSignature(tarefa, conteudo);
  }
  return { estado: proximo, certo, explicacao: certo ? `${explicacao} Agora, a interpretação: o que o registro documenta.` : explicacao };
}

/** Como a manifestação individual se lê, nas palavras da taxonomia. */
export function manifestationLabel(registro: GameDecision & { natureza: "voto" }): string {
  const { registro: individual } = registro;
  if (individual.tipo === "voto-individual") return `${POSICAO_LABELS[individual.posicao]} (valor original: ${individual.valorOriginal})`;
  if (individual.tipo === "ausencia-documentada") {
    return `Ausência documentada (valor original: ${individual.valorOriginal})${individual.motivoDocumentado === undefined ? "" : `: ${individual.motivoDocumentado}`}`;
  }
  return `Presente sem votar, com motivo documentado (valor original: ${individual.valorOriginal}): ${individual.motivoDocumentado}`;
}

/** O que cada tipo de ato é, em uma frase de definição; não é fato sobre a pessoa. */
export const ATO_DEFINICOES: Record<TipoDeAto, string> = {
  "sancao-expressa": "o Executivo sancionou o projeto aprovado pelo Congresso, sem vetar dispositivo",
  "sancao-tacita": "o prazo passou sem manifestação do Executivo, e o projeto virou lei por efeito do procedimento",
  "veto-total": "o Executivo recusou o projeto inteiro, por mensagem ao Congresso",
  "veto-parcial": "o Executivo vetou dispositivos do projeto, por mensagem, e sancionou o resto",
  "medida-provisoria": "o Executivo editou norma com força de lei imediata, a ser apreciada pelo Congresso",
  decreto: "o Executivo editou um decreto, sem votação no Congresso",
  iniciativa: "o Executivo apresentou a proposição ao Congresso",
};

/** Para cada tipo de ato, os dois tipos com que ele mais se confunde, como alternativas erradas. */
const ATO_ALTERNATIVAS: Record<TipoDeAto, readonly [TipoDeAto, TipoDeAto]> = {
  "sancao-expressa": ["veto-parcial", "medida-provisoria"],
  "sancao-tacita": ["sancao-expressa", "veto-parcial"],
  "veto-total": ["veto-parcial", "sancao-expressa"],
  "veto-parcial": ["sancao-expressa", "veto-total"],
  "medida-provisoria": ["decreto", "sancao-expressa"],
  decreto: ["medida-provisoria", "sancao-expressa"],
  iniciativa: ["sancao-expressa", "decreto"],
};

const POSICOES_ALTERNATIVAS: readonly PosicaoDeVoto[] = ["FAVOR", "CONTRA", "ABSTENCAO"];
const OBJETOS_ALTERNATIVOS: readonly ObjetoVotado[] = ["texto-principal", "requerimento", "emenda", "substitutivo", "destaque"];

const opcaoDeVoto = (posicao: PosicaoDeVoto, objeto: ObjetoVotado, proposicao: string): ChoiceOption => ({
  id: `voto:${posicao}:${objeto}`,
  rotulo: `${POSICAO_LABELS[posicao]}: ${OBJETO_LABELS[objeto].toLowerCase()}`,
  detalhe: `Voto registrado sobre ${OBJETO_LABELS[objeto].toLowerCase()} de ${proposicao}, com a posição "${POSICAO_LABELS[posicao].toLowerCase()}".`,
});

const opcaoDeRegistro = (tipo: "ausencia-documentada" | "nao-votou-documentado"): ChoiceOption =>
  tipo === "ausencia-documentada"
    ? { id: "registro:ausencia-documentada", rotulo: "Ausência documentada", detalhe: "O acervo registra a ausência, com o motivo, em vez de um voto." }
    : { id: "registro:nao-votou-documentado", rotulo: "Presente, sem votar", detalhe: "O acervo registra a presença sem voto, com o motivo (presidência da sessão, impedimento ou equivalente)." };

const opcaoDeAto = (tipo: TipoDeAto): ChoiceOption => ({ id: `ato:${tipo}`, rotulo: TIPO_DE_ATO_LABELS[tipo], detalhe: `${ATO_DEFINICOES[tipo][0]!.toUpperCase()}${ATO_DEFINICOES[tipo].slice(1)}.` });

/** A opção certa da interpretação, pelo que o registro da decisão traz. */
export function correctInterpretation(decisao: GameDecision): ChoiceOption {
  if (decisao.natureza === "ato") return opcaoDeAto(decisao.ato.tipo);
  const proposicao = decisao.proposicoes[0]?.identificacao ?? "a proposição";
  if (decisao.registro.tipo === "voto-individual") return opcaoDeVoto(decisao.registro.posicao, decisao.votacao.objeto.tipo, proposicao);
  return opcaoDeRegistro(decisao.registro.tipo);
}

/**
 * As opções da interpretação: a certa, que é o que o registro documenta, e
 * duas que trocam uma coisa só. Em um voto individual, uma troca a posição e
 * a outra troca o objeto votado; em ausência ou presença sem voto, as duas
 * erradas são votos; em um ato, dois outros tipos de ato. A ordem é estável e
 * não deixa a certa sempre em primeiro.
 */
export function interpretationOptions(decisao: GameDecision): ChoiceOption[] {
  const certa = correctInterpretation(decisao);
  const erradas: ChoiceOption[] = [];
  if (decisao.natureza === "ato") {
    for (const tipo of ATO_ALTERNATIVAS[decisao.ato.tipo]) erradas.push(opcaoDeAto(tipo));
  } else {
    const proposicao = decisao.proposicoes[0]?.identificacao ?? "a proposição";
    const objeto = decisao.votacao.objeto.tipo;
    if (decisao.registro.tipo === "voto-individual") {
      const posicao = decisao.registro.posicao;
      const outraPosicao = POSICOES_ALTERNATIVAS.find((item) => item !== posicao) ?? "CONTRA";
      const outroObjeto = OBJETOS_ALTERNATIVOS.find((item) => item !== objeto) ?? "requerimento";
      erradas.push(opcaoDeVoto(outraPosicao, objeto, proposicao), opcaoDeVoto(posicao, outroObjeto, proposicao));
    } else {
      erradas.push(opcaoDeVoto("FAVOR", objeto, proposicao), opcaoDeVoto("CONTRA", objeto, proposicao));
    }
  }
  return sortOptions([certa, ...erradas.filter((opcao) => opcao.id !== certa.id)]);
}

/** O que o registro documenta, por extenso, para a explicação. */
export function describeDecision(decisao: GameDecision): string {
  if (decisao.natureza === "ato") return `${decisao.ato.identificador}: ${TIPO_DE_ATO_LABELS[decisao.ato.tipo].toLowerCase()}. Nas palavras da taxonomia, ${ATO_DEFINICOES[decisao.ato.tipo]}.`;
  const proposicao = decisao.proposicoes[0]?.identificacao ?? "a proposição";
  return `Objeto votado: ${OBJETO_LABELS[decisao.votacao.objeto.tipo].toLowerCase()} de ${proposicao} (${decisao.votacao.objeto.descricao}). Manifestação registrada: ${manifestationLabel(decisao)}.`;
}

/**
 * Segunda etapa da tarefa de decisão: interpretar o registro. A opção certa é
 * a de `correctInterpretation`. Acertar confirma a tarefa, com a assinatura.
 * Errar diz o que o registro documenta de fato e deixa tentar de novo. A
 * etapa só vale depois da evidência; antes dela, a resposta é recusada sem
 * contar tentativa.
 */
export function submitInterpretation(tarefa: Extract<TaskSpec, { tipo: "decisao" }>, estado: TaskState, conteudo: TaskContent, opcaoId: string): Attempt {
  const decisao = conteudo.decisoes[tarefa.decisaoId];
  if (decisao === undefined) return { estado, certo: false, explicacao: "O registro desta tarefa não está no conteúdo." };
  if (!isEvidenceDone(estado)) return { estado, certo: false, explicacao: "Antes da interpretação, indique o documento que sustenta o registro." };
  const certa = correctInterpretation(decisao);
  const certo = opcaoId === certa.id;
  const documenta = describeDecision(decisao);
  return attempt(
    tarefa,
    estado,
    certo,
    certo
      ? `Certo. ${documenta}`
      : `Ainda não. ${documenta} A manifestação, o objeto votado e o tipo do ato estão escritos no registro recolhido. Tente de novo: não há penalidade.`,
    conteudo,
  );
}
