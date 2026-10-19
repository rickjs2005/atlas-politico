// Vale a Faixa: os comentários ocasionais do narrador. Humor da situação
// absurda (um debate que virou luta de escadas), nunca atributo, acusação ou
// fato sobre as pessoas. Quem mostra decide quando cabe; aqui só se escolhe
// a frase para um evento, com um sorteio recebido de fora.

import type { Evento } from "./tipos";

const FALAS: Partial<Record<Evento["tipo"], readonly string[]>> = {
  inicio: ["Debate encerrado. Começou o corpo a corpo!", "Dois candidatos, uma escada, uma faixa. Vale a faixa!", "Sem réplica, sem tréplica: só a escada."],
  queda: ["A governabilidade ficou no chão!", "Caiu nas pesquisas… e no tapete!", "Tempo de resposta esgotado!", "Isso não estava no programa de governo!"],
  cordas: ["Nas cordas! Alguém chame a mesa diretora!", "As cordas também têm opinião!"],
  escadaPega: ["A escada entrou na pauta!", "Agora a escada também é candidata!"],
  escadaPosta: ["Escada em pé, debaixo da faixa. É agora!", "Posicionou! A faixa está a sete degraus!"],
  escadaCaiu: ["A escada tombou! Recontagem!", "Caiu a escada, caiu a proposta!"],
  derrubada: ["Derrubou a base! Como numa moção de censura!", "Chacoalhou a base e a escada foi ao chão!"],
  subida: ["Está subindo nas pesquisas… e na escada!", "Degrau por degrau, como numa coalizão!"],
  topo: ["No topo! A faixa está ao alcance!", "Chegou lá em cima. Segura o fôlego, plateia!"],
  puxando: ["A faixa está por um fio!", "Puxa, puxa! A posse está a um fio!"],
  interrompido: ["Interrompido! Como num aparte sem permissão!", "Derrubaram a subida! Vai ter que recomeçar quase do zero."],
  levantou: ["Recuperação em V: de volta pra luta!", "Levantou! Ninguém sai daqui sem réplica!"],
  vitoria: ["Vale a faixa! Posse no ringue!", "É do povo? Não: é da escada! Faixa conquistada!"],
};

/** Uma fala para o evento, ou `null` para os que não têm comentário. `sorteio` vai de 0 a 1. */
export function falaPara(tipo: Evento["tipo"], sorteio: number): string | null {
  const opcoes = FALAS[tipo];
  if (opcoes === undefined || opcoes.length === 0) return null;
  const indice = Math.min(opcoes.length - 1, Math.max(0, Math.floor(sorteio * opcoes.length)));
  return opcoes[indice] ?? null;
}

/** Os eventos que têm comentário, na ordem de prioridade: os de cima vencem quando acontecem juntos. */
export const PRIORIDADE_DAS_FALAS: readonly Evento["tipo"][] = ["vitoria", "interrompido", "topo", "puxando", "escadaCaiu", "derrubada", "queda", "escadaPosta", "subida", "escadaPega", "cordas", "levantou", "inicio"];
