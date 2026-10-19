// Vale a Faixa: os comentários do narrador, um locutor de luta livre com
// humor sobre a partida. Nunca atributo, acusação, fato sobre as pessoas nem
// previsão eleitoral: a faixa é do ringue. Quem mostra (e quem fala, por
// síntese de voz) decide quando cabe; aqui só se escolhe a frase para um
// evento, com um sorteio recebido de fora.

import type { Evento } from "./tipos";

/** As falas escritas, no cartão do narrador. */
const FALAS: Partial<Record<Evento["tipo"], readonly string[]>> = {
  inicio: ["Tá valendo a faixa!", "Debate encerrado. Começou o corpo a corpo!", "Dois candidatos, uma escada, uma faixa. Vale a faixa!"],
  voadora: ["Veio de voadora!", "Voou! Isso é aparte ou é voadora?"],
  queda: ["A governabilidade ficou no chão!", "Caiu nas pesquisas… e no tapete!", "Tempo de resposta esgotado!", "Isso não estava no programa de governo!"],
  cordas: ["Nas cordas! Alguém chame a mesa diretora!", "As cordas também têm opinião!"],
  esquiva: ["Escapou!", "Desviou como de pergunta difícil!"],
  escadaPega: ["A escada entrou na pauta!", "Agora a escada também é candidata!"],
  escadaPosta: ["A escada tá no centro!", "Escada em pé, debaixo da faixa. É agora!"],
  escadaCaiu: ["Derrubaram a escada!", "A escada tombou! Recontagem!"],
  derrubada: ["Derrubou a base! Como numa moção de censura!", "Chacoalhou a base e a escada foi ao chão!"],
  subida: ["Está subindo nas pesquisas… e na escada!", "Degrau por degrau, como numa coalizão!"],
  topo: ["Subiu! Agora segura!", "No topo! A faixa está ao alcance!"],
  puxando: ["A faixa está por um fio!", "Puxa, puxa! A posse está a um fio!"],
  faltaPouco: ["Falta pouco!", "A faixa balança! Falta pouco!"],
  interrompido: ["Interrompido! Como num aparte sem permissão!", "Derrubaram a subida! Perdeu parte do caminho."],
  levantou: ["Recuperação em V: de volta pra luta!", "Levantou! Ninguém sai daqui sem réplica!"],
  vitoria: ["Pegou a faixa!", "Vale a faixa! Posse no ringue!"],
};

/** Uma fala para o evento, ou `null` para os que não têm comentário. `sorteio` vai de 0 a 1. */
export function falaPara(tipo: Evento["tipo"], sorteio: number): string | null {
  const opcoes = FALAS[tipo];
  if (opcoes === undefined || opcoes.length === 0) return null;
  const indice = Math.min(opcoes.length - 1, Math.max(0, Math.floor(sorteio * opcoes.length)));
  return opcoes[indice] ?? null;
}

/** Os eventos que têm comentário, na ordem de prioridade: os de cima vencem quando acontecem juntos. */
export const PRIORIDADE_DAS_FALAS: readonly Evento["tipo"][] = [
  "vitoria",
  "faltaPouco",
  "interrompido",
  "topo",
  "puxando",
  "escadaCaiu",
  "derrubada",
  "voadora",
  "queda",
  "escadaPosta",
  "subida",
  "escadaPega",
  "esquiva",
  "cordas",
  "levantou",
  "inicio",
];

/**
 * As falas da narração por voz, curtas, com a prioridade de cada uma: a
 * fila descarta as menos importantes quando chegam muitas de uma vez.
 */
export const NARRACAO: Partial<Record<Evento["tipo"], { prioridade: number; frases: readonly string[] }>> = {
  inicio: { prioridade: 3, frases: ["Tá valendo a faixa!"] },
  vitoria: { prioridade: 5, frases: ["Pegou a faixa!", "É dele! Pegou a faixa!"] },
  faltaPouco: { prioridade: 4, frases: ["Falta pouco!"] },
  topo: { prioridade: 4, frases: ["Subiu! Agora segura!"] },
  interrompido: { prioridade: 4, frases: ["Interrompeu!", "Caiu da escada!"] },
  escadaCaiu: { prioridade: 3, frases: ["Derrubaram a escada!"] },
  escadaPosta: { prioridade: 3, frases: ["A escada tá no centro!"] },
  voadora: { prioridade: 2, frases: ["Veio de voadora!"] },
  queda: { prioridade: 2, frases: ["Foi ao chão!", "Caiu!"] },
  escadaPega: { prioridade: 1, frases: ["Pegou a escada!"] },
  subida: { prioridade: 1, frases: ["Tá subindo!"] },
  levantou: { prioridade: 1, frases: ["Levantou!"] },
};
