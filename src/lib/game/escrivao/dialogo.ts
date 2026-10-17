// O diálogo ramificado do Escrivão na missão de investigação (D-151): um
// grafo pequeno de nós e escolhas, em TypeScript, no molde dos "knots" do ink
// (The Intercept, inkle): cada nó tem um texto e escolhas que levam a outro
// nó; uma escolha pode deixar uma marca, e um nó pode ter um texto diferente
// quando a marca existe. O estado é só a posição, as marcas e os nós visitados;
// nada é guardado entre visitas. Sem IA na partida e sem sorteio.
//
// As falas seguem as regras do catálogo (validacao.ts): nenhuma cita pessoa,
// partido, ano ou juízo; o Escrivão fala da papelada e do método, não dos
// fatos, que ficam nos documentos. Um teste valida cada texto.

import { validateLine } from "./validacao";

export interface DialogChoice {
  id: string;
  /** O que a pessoa escolhe dizer ou perguntar. */
  texto: string;
  /** O nó para onde a escolha leva. */
  proximo: string;
  /** A marca que a escolha deixa: o nó seguinte pode falar diferente por causa dela. */
  marca?: string;
}

export interface DialogNode {
  id: string;
  /** O que o Escrivão diz. */
  texto: string;
  /** O mesmo nó, dito de outro jeito quando a pessoa já deixou a marca. */
  comMarca?: { marca: string; texto: string };
  /** As escolhas; sem nenhuma, o diálogo acabou. */
  escolhas: readonly DialogChoice[];
}

export interface DialogGraph {
  inicio: string;
  nos: Readonly<Record<string, DialogNode>>;
}

export interface DialogState {
  no: string;
  marcas: readonly string[];
  /** Os nós já visitados, na ordem: é o que a tela mostra como conversa. */
  visitados: readonly string[];
}

/**
 * A conversa que abre a missão. Quem pergunta como se lê um documento deixa a
 * marca `leitura`, e o Escrivão, no fim, lembra os cinco campos em vez de
 * mandar olhar o quadro: a ramificação muda a ajuda que a pessoa recebe.
 */
export const BRIEFING_INVESTIGACAO: DialogGraph = {
  inicio: "fichas",
  nos: {
    fichas: {
      id: "fichas",
      texto: "Chegaram fichas para arquivar. Cada uma resume um documento, mas veio sem o documento grampeado atrás. Sem documento, eu não carimbo.",
      escolhas: [
        { id: "o-que-e-ficha", texto: "O que é uma ficha?", proximo: "ficha" },
        { id: "como-ler", texto: "Como se lê um documento?", proximo: "leitura", marca: "leitura" },
        { id: "onde-estao", texto: "Onde estão os documentos?", proximo: "gaveta" },
      ],
    },
    ficha: {
      id: "ficha",
      texto: "Uma ficha é um resumo em uma frase: diz quando, onde e o que foi feito. O resumo pode estar certo e, mesmo assim, só vale com o documento atrás dele.",
      escolhas: [
        { id: "como-ler", texto: "Como se lê um documento?", proximo: "leitura", marca: "leitura" },
        { id: "onde-estao", texto: "Onde estão os documentos?", proximo: "gaveta" },
      ],
    },
    leitura: {
      id: "leitura",
      texto: "Olhe cinco campos: a data, a instituição, o cargo, o objeto e a ação. Dois documentos parecidos quase sempre diferem em um deles. O quadro na parede repete isso, para quem esquecer.",
      escolhas: [{ id: "onde-estao", texto: "Onde estão os documentos?", proximo: "gaveta" }],
    },
    gaveta: {
      id: "gaveta",
      texto: "Na gaveta do arquivo. Abra cada um, leia os campos e guarde no dossiê os que achar úteis. Sobrar documento não é erro: a gaveta tem mais papel do que ficha.",
      escolhas: [{ id: "e-depois", texto: "E depois?", proximo: "mesa" }],
    },
    mesa: {
      id: "mesa",
      texto: "Depois, as fichas ficam na mesa. Relacione cada uma ao documento que a sustenta e aponte, no documento, o campo que sustenta o trecho destacado. Se tiver dúvida sobre os campos, o quadro na parede explica. Com todas conferidas, eu carimbo.",
      comMarca: {
        marca: "leitura",
        texto: "Depois, as fichas ficam na mesa. Relacione cada uma ao documento que a sustenta e aponte, no documento, o campo que sustenta o trecho destacado: um dos cinco que eu disse. Com todas conferidas, eu carimbo.",
      },
      escolhas: [],
    },
  },
};

export function startDialog(grafo: DialogGraph = BRIEFING_INVESTIGACAO): DialogState {
  return { no: grafo.inicio, marcas: [], visitados: [grafo.inicio] };
}

export function currentNode(estado: DialogState, grafo: DialogGraph = BRIEFING_INVESTIGACAO): DialogNode {
  return grafo.nos[estado.no] ?? grafo.nos[grafo.inicio]!;
}

/** O texto de um nó, com a variante da marca quando a pessoa a deixou. */
export function nodeText(no: DialogNode, marcas: readonly string[]): string {
  return no.comMarca !== undefined && marcas.includes(no.comMarca.marca) ? no.comMarca.texto : no.texto;
}

/** Escolher uma fala. Escolha que o nó não tem não muda nada. */
export function chooseIn(estado: DialogState, escolhaId: string, grafo: DialogGraph = BRIEFING_INVESTIGACAO): DialogState {
  const escolha = currentNode(estado, grafo).escolhas.find((item) => item.id === escolhaId);
  if (escolha === undefined || grafo.nos[escolha.proximo] === undefined) return estado;
  const marcas = escolha.marca !== undefined && !estado.marcas.includes(escolha.marca) ? [...estado.marcas, escolha.marca] : estado.marcas;
  return { no: escolha.proximo, marcas, visitados: [...estado.visitados, escolha.proximo] };
}

export function isDialogOver(estado: DialogState, grafo: DialogGraph = BRIEFING_INVESTIGACAO): boolean {
  return currentNode(estado, grafo).escolhas.length === 0;
}

/** Os problemas de um grafo: nós sem saída alcançável, escolhas para nós que não existem, textos fora das regras do Escrivão. */
export function validateDialog(grafo: DialogGraph): string[] {
  const problemas: string[] = [];
  if (grafo.nos[grafo.inicio] === undefined) problemas.push(`o início "${grafo.inicio}" não é um nó.`);
  for (const no of Object.values(grafo.nos)) {
    for (const problema of validateLine(no.texto, "instrucao")) problemas.push(`nó ${no.id}: ${problema}`);
    if (no.comMarca !== undefined) for (const problema of validateLine(no.comMarca.texto, "instrucao")) problemas.push(`nó ${no.id}, com marca: ${problema}`);
    const ids = no.escolhas.map((escolha) => escolha.id);
    if (new Set(ids).size !== ids.length) problemas.push(`nó ${no.id}: escolha repetida.`);
    for (const escolha of no.escolhas) {
      for (const problema of validateLine(escolha.texto, "instrucao")) problemas.push(`nó ${no.id}, escolha ${escolha.id}: ${problema}`);
      if (grafo.nos[escolha.proximo] === undefined) problemas.push(`nó ${no.id}, escolha ${escolha.id}: leva a "${escolha.proximo}", que não existe.`);
    }
  }
  // Todo nó alcança um fim, e o fim é alcançável do início: a conversa nunca prende a pessoa.
  const alcanca = new Set<string>();
  const fila = [grafo.inicio];
  while (fila.length > 0) {
    const atual = fila.shift()!;
    if (alcanca.has(atual)) continue;
    alcanca.add(atual);
    for (const escolha of grafo.nos[atual]?.escolhas ?? []) fila.push(escolha.proximo);
  }
  for (const id of Object.keys(grafo.nos)) if (!alcanca.has(id)) problemas.push(`nó ${id}: não se chega a ele a partir do início.`);
  const fins = [...alcanca].filter((id) => grafo.nos[id]?.escolhas.length === 0);
  if (fins.length === 0) problemas.push("nenhum nó alcançável termina a conversa.");
  return problemas;
}
