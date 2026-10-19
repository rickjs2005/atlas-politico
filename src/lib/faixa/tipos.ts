// Vale a Faixa (docs/VALE-A-FAIXA.md): os dados de uma partida, como tipos
// puros. Dois lutadores, uma escada e uma faixa pendurada sobre o centro do
// ringue. Quem muda estes dados é regras.ts, a cada passo de tempo; a IA
// (ia.ts) e a interface (src/features/faixa) só produzem uma `Entrada`.
//
// Coordenadas do mundo: `x` horizontal, com o centro do ringue em zero e a
// faixa pendurada sobre ele; `y` para cima, com o tapete em zero. A unidade é
// o pixel na escala 1; quem desenha aplica a câmera.

import type { PersonagemSlug } from "@/lib/game/types";

export type LutadorSlug = PersonagemSlug;

/** Índice de um lutador na partida: o jogador é sempre o 0 e o computador, o 1. */
export type Indice = 0 | 1;

/**
 * Os comandos, iguais para a pessoa e para o computador. Tudo é "está
 * pressionado". Sete comandos: andar, subir e descer, atacar (contextual:
 * golpe ou derrubada da escada), defender e interagir (contextual: pegar,
 * posicionar ou largar a escada; no topo, puxar a faixa).
 */
export interface Entrada {
  esquerda: boolean;
  direita: boolean;
  cima: boolean;
  baixo: boolean;
  golpe: boolean;
  defesa: boolean;
  interagir: boolean;
}

export const ENTRADA_VAZIA: Entrada = {
  esquerda: false,
  direita: false,
  cima: false,
  baixo: false,
  golpe: false,
  defesa: false,
  interagir: false,
};

/**
 * Os estados de um lutador. Cada um exclui os outros: ninguém ataca caído,
 * carrega a escada subindo nela ou continua lutando depois do fim.
 */
export type EstadoDoLutador =
  | "parado"
  | "andando"
  | "golpe"
  | "derrubada"
  | "defesa"
  | "atingido"
  | "caido"
  | "levantando"
  | "carregando"
  | "subindo"
  | "noTopo"
  | "caindoDaEscada"
  | "vitoria"
  | "derrota";

/** As três partes de um ataque: antecipação (o aviso), ativo (acerta) e recuperação (vulnerável). */
export type FaseDoAtaque = "antecipacao" | "ativo" | "recuperacao";

export interface Lutador {
  slug: LutadorSlug;
  x: number;
  /** Altura acima do tapete: zero no chão; na escada e na queda dela, acima. */
  y: number;
  /** Para onde olha: 1 é a direita da tela. */
  direcao: 1 | -1;
  /** Velocidade horizontal de recuo, que decai sozinha. */
  vx: number;
  /** Velocidade vertical, só na queda da escada. */
  vy: number;
  estado: EstadoDoLutador;
  /** Segundos no estado de agora. */
  t: number;
  /** De 0 a 100: a zero, cai. Volta sozinho fora de combate. */
  equilibrio: number;
  /** Segundos sem o equilíbrio voltar, depois de um golpe. */
  semRecuperar: number;
  /** Posição na escada, de 0 (base) a 1 (o topo). */
  altura: number;
  /** Segundos de proteção: golpe nenhum pega. */
  invulneravel: number;
  recargaGolpe: number;
  recargaDerrubada: number;
  /** O golpe da sequência em andamento: 1, 2 ou 3 (o terceiro é o forte). Zero fora de ataque. */
  golpeDaSequencia: 0 | 1 | 2 | 3;
  /** Segundos desde o fim do último golpe: passada a janela, a sequência recomeça do 1. */
  desdeOUltimoGolpe: number;
  /** O comando de ataque foi apertado de novo durante o golpe: o próximo da sequência sai em seguida. */
  proximoGolpe: boolean;
  /** O ataque de agora já acertou: um ataque pega uma vez. */
  acertou: boolean;
  /** Fase do ciclo de caminhada, para o desenho. */
  passo: number;
  /** Quanto já puxou a faixa, de 0 a 1. Uma interrupção tira parte. */
  puxada: number;
  /** Está com o comando de puxar pressionado, no topo. */
  puxando: boolean;
  /** Golpes recebidos nesta partida, para o placar do fim. */
  golpesRecebidos: number;
  quedas: number;
  /** A entrada do passo anterior, para saber o que acabou de ser pressionado. */
  anterior: Entrada;
}

export type EstadoDaEscada = "caida" | "carregada" | "emPe" | "caindo";

export interface Escada {
  estado: EstadoDaEscada;
  /** Caída: o centro. Em pé e caindo: a base. Carregada: acompanha quem carrega. */
  x: number;
  portador: Indice | null;
  /** Oscilação de 0 a 1, que decai sozinha: ao ser posta em pé e enquanto alguém puxa a faixa. */
  balanco: number;
  /** Progresso do tombo, de 0 a 1, quando está caindo. */
  queda: number;
  /** Para que lado tomba, e para que lado fica deitada. */
  direcaoDaQueda: 1 | -1;
}

export type FaseDaPartida = "contagem" | "luta" | "fim";

export interface Partida {
  tempo: number;
  fase: FaseDaPartida;
  /** Segundos que faltam da contagem de abertura. */
  contagem: number;
  lutadores: [Lutador, Lutador];
  escada: Escada;
  /** Oscilação da faixa, de 0 a 1: cresce quando alguém puxa. */
  faixaBalanco: number;
  vencedor: Indice | null;
  /** Intensidade da torcida, de 0 a 1. */
  torcida: number;
  /** O que aconteceu no último passo. Quem lê, limpa. */
  eventos: Evento[];
}

export type Evento =
  | { tipo: "inicio" }
  | { tipo: "golpe"; quem: Indice; alvo: Indice; bloqueado: boolean; forte: boolean; x: number; y: number }
  | { tipo: "golpeNoVazio"; quem: Indice }
  | { tipo: "derrubada"; quem: Indice; x: number }
  | { tipo: "queda"; quem: Indice; x: number }
  | { tipo: "levantou"; quem: Indice }
  | { tipo: "cordas"; quem: Indice; x: number }
  | { tipo: "escadaPega"; quem: Indice }
  | { tipo: "escadaPosta"; quem: Indice; x: number }
  | { tipo: "escadaSolta"; quem: Indice; x: number }
  | { tipo: "escadaCaiu"; x: number }
  | { tipo: "subida"; quem: Indice }
  | { tipo: "topo"; quem: Indice }
  | { tipo: "puxando"; quem: Indice; puxada: number }
  | { tipo: "interrompido"; quem: Indice; puxada: number }
  | { tipo: "caiuDaEscada"; quem: Indice; x: number }
  | { tipo: "vitoria"; quem: Indice };

/**
 * A dica contextual, perto do personagem: o que dá para fazer agora. Pegar,
 * posicionar e largar são o comando de interação; subir é a seta para cima;
 * puxar é o comando de interação segurado no topo.
 */
export type Dica = "pegarEscada" | "posicionarEscada" | "soltarEscada" | "subir" | "puxarFaixa" | null;
