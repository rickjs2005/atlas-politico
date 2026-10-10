// Como cada tipo de tarefa aparece na interface: o botão que leva à resposta,
// a frase do que falta quando os registros pedidos já estão com a pessoa, e
// o nome do tipo para o painel. Funções puras; os testes de regra as leem.

import type { TaskType } from "@/lib/game/types";

/** O nome do tipo de tarefa, para o painel e a entrada. */
export const TASK_TYPE_LABEL: Record<TaskType, string> = {
  registro: "encontrar um registro",
  ordem: "colocar dois registros em ordem",
  fonte: "associar um registro ao documento que o sustenta",
  lugar: "relacionar um registro ao lugar documentado",
};

/** O botão que abre a resposta da tarefa, quando os registros pedidos já foram recolhidos. */
export function answerLabel(tipo: TaskType): string {
  if (tipo === "ordem") return "Ordenar os registros";
  if (tipo === "fonte") return "Indicar o documento";
  if (tipo === "lugar") return "Indicar o lugar";
  return "";
}

/** O que falta, com os registros pedidos recolhidos e a resposta por dar. */
export function pendingSentence(tipo: TaskType): string {
  if (tipo === "ordem") return "Os dois registros da tarefa estão com você. Falta colocá-los em ordem.";
  if (tipo === "fonte") return "O registro da tarefa está com você. Falta indicar o documento que o sustenta.";
  if (tipo === "lugar") return "O registro da tarefa está com você. Falta indicar o lugar em que o atlas o documenta.";
  return "";
}

/** A mesma coisa na linha do objetivo da cena, que diz onde responder. */
export function hudPendingSentence(tipo: TaskType): string {
  if (tipo === "ordem") return "Os dois registros da tarefa estão com você. Para colocá-los em ordem, abra Como jogar ou Capítulos e tarefas.";
  if (tipo === "fonte") return "O registro da tarefa está com você. Para indicar o documento que o sustenta, abra Como jogar ou Capítulos e tarefas.";
  if (tipo === "lugar") return "O registro da tarefa está com você. Para indicar o lugar documentado, abra Como jogar ou Capítulos e tarefas.";
  return "";
}

/** A contagem do cabeçalho enquanto falta a resposta: o que ainda segura a saída além dos registros. */
export function countingSentence(tipo: TaskType): string {
  if (tipo === "ordem") return "a saída abre com todos e a ordem certa";
  if (tipo === "fonte") return "a saída abre com todos e o documento certo";
  if (tipo === "lugar") return "a saída abre com todos e o lugar certo";
  return "a saída abre com todos";
}
