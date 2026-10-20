// Vale a Faixa: os comentários escritos do narrador, no cartão sobre a cena,
// com humor sobre a partida. Nunca atributo, acusação, fato sobre as pessoas
// nem previsão eleitoral: a faixa é do ringue. Quem mostra decide quando
// cabe; aqui só se escolhe a frase para um evento, com um sorteio recebido
// de fora. Não há narração por voz: a emoção sonora vem da torcida.

import type { Evento } from "./tipos";

/** As falas escritas, no cartão do narrador. */
const FALAS: Partial<Record<Evento["tipo"], readonly string[]>> = {
  inicio: ["Tá valendo a faixa!", "Debate encerrado. Começou o corpo a corpo!", "Dois candidatos, uma escada, uma faixa. Vale a faixa!"],
  voadora: ["Veio de voadora!", "Voou! Isso é aparte ou é voadora?"],
  queda: ["A governabilidade ficou no chão!", "Caiu nas pesquisas… e no tapete!", "Tempo de resposta esgotado!", "Isso não estava no programa de governo!"],
  cordas: ["Nas cordas! Alguém chame a mesa diretora!", "As cordas também têm opinião!"],
  esquiva: ["Escapou!", "Desviou como de pergunta difícil!"],
  agarrou: ["Agarrou pelo paletó!", "Abraço de coalizão! Vai sair voando?"],
  arremesso: ["Arremessado! Saiu da base aliada!", "Voou sem passagem de volta!"],
  escapou: ["Soltou-se do abraço!", "Escapou do agarrão como de uma CPI!"],
  prorrogacao: ["Prorrogação! A faixa afrouxou: puxar leva menos!", "Ninguém levou ainda? A torcida pressiona e a faixa afrouxa!"],
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
  "prorrogacao",
  "faltaPouco",
  "interrompido",
  "topo",
  "puxando",
  "escadaCaiu",
  "derrubada",
  "arremesso",
  "voadora",
  "queda",
  "escapou",
  "agarrou",
  "escadaPosta",
  "subida",
  "escadaPega",
  "esquiva",
  "cordas",
  "levantou",
  "inicio",
];
