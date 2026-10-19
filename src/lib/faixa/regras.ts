// Vale a Faixa: as regras da partida (docs/VALE-A-FAIXA.md). Função pura
// sobre os dados de tipos.ts: a cada passo de tempo recebe a entrada dos
// dois lutadores e avança a luta, a escada e a faixa, registrando em
// `eventos` o que aconteceu. Não conhece canvas, teclado nem React.
//
// O objetivo é a faixa, e não o nocaute: derrubar o adversário abre uma
// janela para pegar a escada, posicionar sob a faixa, subir e puxar. Cada
// estado exclui os outros (ninguém ataca caído nem carrega a escada subindo
// nela), as durações são fixas e a escada nunca se teletransporta: é levada,
// posta em pé ou derrubada, sempre a partir de onde está.
//
// Os comandos: andar com aceleração curta; pular, com gravidade e uma só
// voadora por salto; atacar é contextual (a sequência soco, direto e chute no
// chão; a voadora no ar; a derrubada perto da escada em que o adversário
// está); o golpe forte, lento e arriscado; defender, segurado; a esquiva
// curta, com recarga; interagir pega, posiciona ou larga a escada e, no topo,
// segurado, puxa a faixa; subir e descer são as setas, alinhado à base.

import { ENTRADA_VAZIA, type ComandoGuardado, type Dica, type Entrada, type Escada, type Evento, type Indice, type Lutador, type LutadorSlug, type MotivoDoBloqueio, type Partida, type TipoDeGolpe } from "./tipos";

export interface Golpe {
  antecipacao: number;
  ativo: number;
  recuperacao: number;
  dano: number;
  recuo: number;
}

/**
 * Os números da partida. Os da faixa e da escada são o ponto de partida do
 * balanceamento: cerca de 8 s de puxada acumulada, subida que dá tempo de
 * reagir, perda de um quarto do progresso a cada interrupção.
 */
export const REGRAS = {
  /** Meia largura em que os lutadores andam; as cordas ficam logo além. */
  ringue: 400,
  cordas: 440,
  velocidade: 260,
  velocidadeCarregando: 165,
  /** Aceleração e frenagem da caminhada, em unidades por segundo ao quadrado: curtas, para responder sem deslizar. */
  aceleracao: 2600,
  frenagem: 3400,
  /** Quanto do controle de direção vale no ar. */
  controleNoAr: 0.35,
  /** Distância entre os centros para um golpe pegar: a mesma para os dois. */
  alcance: 78,
  /** Largura de um lutador: os dois não se sobrepõem no chão. */
  corpo: 54,
  equilibrio: 100,
  /** Pontos de equilíbrio que voltam por segundo, fora de combate. */
  recuperacao: 11,
  /** Segundos sem recuperar depois de levar um golpe. */
  pausaDaRecuperacao: 0.9,
  /** A sequência: o soco, o direto e o chute, que afasta mais e dá proteção breve (sem sequência infinita). */
  golpes: [
    { antecipacao: 0.12, ativo: 0.08, recuperacao: 0.2, dano: 18, recuo: 120 },
    { antecipacao: 0.1, ativo: 0.08, recuperacao: 0.22, dano: 20, recuo: 140 },
    { antecipacao: 0.18, ativo: 0.1, recuperacao: 0.42, dano: 28, recuo: 430 },
  ] as readonly [Golpe, Golpe, Golpe],
  danoBloqueado: 5,
  /** Quanto o lutador avança ao emendar o segundo e o terceiro golpes: a sequência alcança quem recuou. */
  passoDaSequencia: 12,
  /** Segundos depois de um golpe em que o próximo continua a sequência; passada a janela, volta ao primeiro. */
  janelaDaSequencia: 0.45,
  protecaoDoForte: 0.6,
  recargaDoGolpe: 0.08,
  /** O golpe forte: preparação visível, impacto maior, recuperação longa. Arriscado. */
  forte: { antecipacao: 0.34, ativo: 0.1, recuperacao: 0.52, dano: 36, recuo: 420, danoBloqueado: 12, recuoBloqueado: 200, recarga: 0.5, alcance: 86 },
  /** O pulo: impulso, gravidade, e a aterrissagem curta em que não se ataca. */
  pulo: { impulso: 560, gravidade: 1650, aterrissagem: 0.1 },
  /** A voadora: só no ar, uma por salto, ativa por um trecho da trajetória, com aterrissagem longa. */
  voadora: { ativoDe: 0.06, ativoAte: 0.32, dano: 26, recuo: 340, alcance: 98, aterrissagem: 0.42, danoBloqueado: 8 },
  /** A esquiva: um passo curto, invulnerável no começo, com recarga. */
  esquiva: { duracao: 0.28, invulneravel: 0.18, distancia: 120, recarga: 0.9 },
  /** Um comando apertado um instante antes de o lutador ficar livre sai assim que ele fica; uma queda apaga o que estava guardado. */
  tolerancia: 0.16,
  /**
   * A derrubada: um golpe na base da escada em que o adversário está. Cada um
   * chacoalha a escada (a puxada para enquanto ela balança) e tira equilíbrio
   * de quem está nela; a zero, a escada tomba com a pessoa. Perto de três
   * seguidos derrubam.
   */
  derrubada: { antecipacao: 0.42, ativo: 0.1, recuperacao: 0.45, recarga: 0.9, dano: 45, balanco: 0.85 },
  caido: 1.9,
  /** Depois do chute, do golpe forte ou da voadora, fica mais tempo no chão. */
  caidoLongo: 2.5,
  levantando: 0.55,
  /** Proteção ao levantar: cobre o levantar e um pouco depois. */
  protecaoAoLevantar: 0.9,
  equilibrioAoLevantar: 55,
  escada: {
    altura: 200,
    /** Até onde do centro do ringue a escada pode ficar em pé e alcançar a faixa. */
    zona: 64,
    /** Distância para pegar a escada caída, subir na escada em pé e tentar derrubá-la. */
    pegar: 90,
    subir: 44,
    derrubar: 96,
    /** Velocidade de subida e de descida, em fração da escada por segundo: subir leva perto de 1,7 s. */
    subida: 0.6,
    descida: 1.3,
    amortecimento: 0.9,
    /** Acima deste balanço, ninguém puxa a faixa e a subida fica mais lenta. */
    balancoMaximo: 0.4,
    /** Segundos do tombo. */
    tombo: 0.55,
    /** Onde ficam os pés de quem está no topo, em fração da altura. */
    topo: 0.84,
  },
  /** A faixa: 9 s de comando segurado no topo, com a escada parada; cair tira um quarto do progresso; sem puxar, escorre devagar. */
  faixa: { altura: 345, puxar: 9, perdaAoCair: 0.25, perdaSemPuxar: 0.03, aviso: 0.7 },
  contagem: 2.6,
  atingido: 0.3,
  /** Recuo acima do qual bater nas cordas devolve e tira equilíbrio. */
  cordasRecuo: 260,
} as const;

// ---------------------------------------------------------------------------
// Criação
// ---------------------------------------------------------------------------

function novoLutador(slug: LutadorSlug, x: number, direcao: 1 | -1): Lutador {
  return {
    slug,
    x,
    y: 0,
    direcao,
    vel: 0,
    vx: 0,
    vy: 0,
    estado: "parado",
    t: 0,
    equilibrio: REGRAS.equilibrio,
    semRecuperar: 0,
    altura: 0,
    invulneravel: 0,
    recargaGolpe: 0,
    recargaForte: 0,
    recargaDerrubada: 0,
    recargaEsquiva: 0,
    golpeDaSequencia: 0,
    desdeOUltimoGolpe: 10,
    proximoGolpe: false,
    voadoraUsada: false,
    tempoCaido: REGRAS.caido,
    tempoDeAterrissagem: REGRAS.pulo.aterrissagem,
    guardado: null,
    guardadoT: 0,
    virando: 0,
    acertou: false,
    passo: 0,
    puxada: 0,
    puxando: false,
    avisouFaltaPouco: false,
    golpesRecebidos: 0,
    quedas: 0,
    anterior: { ...ENTRADA_VAZIA },
  };
}

/**
 * Uma partida nova: o jogador à esquerda, o computador à direita, a escada
 * caída em uma das laterais. `semente` decide a lateral (par: esquerda).
 */
export function criarPartida(jogador: LutadorSlug, computador: LutadorSlug, semente: number): Partida {
  const lado: 1 | -1 = semente % 2 === 0 ? -1 : 1;
  return {
    tempo: 0,
    fase: "contagem",
    contagem: REGRAS.contagem,
    lutadores: [novoLutador(jogador, -170, 1), novoLutador(computador, 170, -1)],
    escada: { estado: "caida", x: lado * 330, portador: null, balanco: 0, queda: 0, direcaoDaQueda: lado === 1 ? -1 : 1, desdeQueCaiu: 10 },
    faixaBalanco: 0,
    vencedor: null,
    torcida: 0.3,
    eventos: [],
  };
}

// ---------------------------------------------------------------------------
// Consultas
// ---------------------------------------------------------------------------

export const outro = (i: Indice): Indice => (i === 0 ? 1 : 0);

export const naEscada = (l: Lutador): boolean => l.estado === "subindo" || l.estado === "noTopo";

export const noChao = (l: Lutador): boolean => l.estado === "caido" || l.estado === "levantando" || l.estado === "caindoDaEscada";

export const noAr = (l: Lutador): boolean => l.estado === "pulando" || l.estado === "voadora";

/** Pode agir por conta própria: andar, atacar, defender, pular, interagir. */
export const livre = (l: Lutador): boolean => l.estado === "parado" || l.estado === "andando";

/** A posição é válida para a escada ficar em pé sob a faixa. */
export const naZona = (x: number): boolean => Math.abs(x) <= REGRAS.escada.zona;

/** A altura dos pés de quem está na escada, pela posição nela. */
export const alturaNaEscada = (altura: number): number => altura * REGRAS.escada.altura * REGRAS.escada.topo;

/** A escada em pé está na frente do lutador e ao alcance de ser derrubada. */
export function escadaAoAlcance(p: Partida, l: Lutador): boolean {
  const esc = p.escada;
  if (esc.estado !== "emPe") return false;
  const dx = esc.x - l.x;
  return Math.abs(dx) <= REGRAS.escada.derrubar && (Math.sign(dx) === l.direcao || Math.abs(dx) < 24);
}

/** O adversário está na escada em pé, ao alcance: atacar vira a tentativa de derrubá-la. */
export function podeDerrubar(p: Partida, i: Indice): boolean {
  return naEscada(p.lutadores[outro(i)]) && escadaAoAlcance(p, p.lutadores[i]);
}

/** Alinhado à base da escada em pé, com ela livre: a seta para cima começa a subir. */
export function podeSubir(p: Partida, i: Indice): boolean {
  const l = p.lutadores[i];
  return p.escada.estado === "emPe" && Math.abs(l.x - p.escada.x) <= REGRAS.escada.subir && !naEscada(p.lutadores[outro(i)]);
}

/** O que dá para fazer agora com a escada ou a faixa, para a dica perto do personagem. */
export function dicaDe(p: Partida, i: Indice): Dica {
  if (p.fase !== "luta") return null;
  const l = p.lutadores[i];
  const esc = p.escada;
  if (l.estado === "carregando") return naZona(l.x) ? "posicionarEscada" : "soltarEscada";
  if (l.estado === "noTopo") return "puxarFaixa";
  if (!livre(l)) return null;
  if (esc.estado === "caida" && Math.abs(l.x - esc.x) <= REGRAS.escada.pegar) return "pegarEscada";
  if (podeSubir(p, i)) return "subir";
  if (podeDerrubar(p, i) && l.recargaDerrubada === 0) return "derrubarEscada";
  return null;
}

// ---------------------------------------------------------------------------
// Mudanças de estado
// ---------------------------------------------------------------------------

function entrar(l: Lutador, estado: Lutador["estado"]): void {
  l.estado = estado;
  l.t = 0;
  l.acertou = false;
  if (estado !== "noTopo") l.puxando = false;
  if (estado !== "golpe") {
    l.golpeDaSequencia = 0;
    l.proximoGolpe = false;
  }
  // Uma queda ou um golpe recebido apagam o que estava guardado: nada dispara depois.
  if (estado === "atingido" || estado === "caido" || estado === "caindoDaEscada" || estado === "vitoria" || estado === "derrota") {
    l.guardado = null;
  }
}

function derrubar(p: Partida, i: Indice, recuo: number, longa: boolean): void {
  const l = p.lutadores[i];
  if (p.fase === "fim" || l.estado === "caido") return;
  if (l.estado === "carregando") soltarEscada(p, i);
  entrar(l, "caido");
  l.equilibrio = 0;
  l.vx = recuo;
  l.vel = 0;
  l.y = 0;
  l.vy = 0;
  l.tempoCaido = longa ? REGRAS.caidoLongo : REGRAS.caido;
  l.quedas += 1;
  p.eventos.push({ tipo: "queda", quem: i, x: l.x, longa });
}

/** Quem está na escada cai dela: recuo para o lado dado, e parte do que puxou se perde. */
function cairDaEscada(p: Partida, i: Indice, direcao: 1 | -1): void {
  const l = p.lutadores[i];
  if (!naEscada(l)) return;
  l.y = alturaNaEscada(l.altura);
  entrar(l, "caindoDaEscada");
  l.vy = 150;
  l.vx = direcao * 150;
  l.vel = 0;
  l.equilibrio = 0;
  if (l.puxada > 0) {
    l.puxada = Math.max(0, l.puxada * (1 - REGRAS.faixa.perdaAoCair));
    p.eventos.push({ tipo: "interrompido", quem: i, puxada: l.puxada });
  }
  l.avisouFaltaPouco = false;
  p.eventos.push({ tipo: "caiuDaEscada", quem: i, x: l.x });
}

function soltarEscada(p: Partida, i: Indice): void {
  const l = p.lutadores[i];
  const esc = p.escada;
  if (esc.estado !== "carregada" || esc.portador !== i) return;
  esc.estado = "caida";
  esc.portador = null;
  esc.x = clampRingue(l.x + l.direcao * 50, REGRAS.cordas);
  esc.direcaoDaQueda = l.direcao;
  esc.balanco = 0;
  esc.desdeQueCaiu = 0;
  p.eventos.push({ tipo: "escadaSolta", quem: i, x: esc.x });
}

/** A escada em pé tomba para o lado dado. Quem estiver nela cai. */
function derrubarEscada(p: Partida, direcao: 1 | -1): void {
  const esc = p.escada;
  if (esc.estado !== "emPe") return;
  esc.estado = "caindo";
  esc.queda = 0;
  esc.direcaoDaQueda = direcao;
  esc.balanco = 0;
  for (const i of [0, 1] as const) cairDaEscada(p, i, direcao);
}

function vencer(p: Partida, i: Indice): void {
  if (p.fase === "fim") return;
  p.fase = "fim";
  p.vencedor = i;
  const vencedor = p.lutadores[i];
  const vencido = p.lutadores[outro(i)];
  entrar(vencedor, "vitoria");
  vencedor.puxada = 1;
  if (vencido.estado === "carregando") soltarEscada(p, outro(i));
  if (naEscada(vencido)) {
    vencido.y = 0;
    vencido.altura = 0;
  }
  entrar(vencido, "derrota");
  vencido.vx = 0;
  vencido.vel = 0;
  vencido.y = 0;
  p.torcida = 1;
  p.eventos.push({ tipo: "vitoria", quem: i });
}

const clampRingue = (x: number, limite: number): number => Math.max(-limite, Math.min(limite, x));

function bloquear(p: Partida, i: Indice, motivo: MotivoDoBloqueio): void {
  p.eventos.push({ tipo: "acaoBloqueada", quem: i, motivo });
}

// ---------------------------------------------------------------------------
// Ataques
// ---------------------------------------------------------------------------

/** O golpe de agora, pela posição na sequência. */
export function golpeDe(l: Lutador): Golpe {
  const indice = Math.max(0, Math.min(2, l.golpeDaSequencia - 1));
  return REGRAS.golpes[indice] ?? REGRAS.golpes[0];
}

const NOME_DO_GOLPE: readonly TipoDeGolpe[] = ["soco", "direto", "chute"];

/** Começa um golpe: o próximo da sequência se o anterior acabou há pouco; senão, o primeiro. */
function iniciarGolpe(l: Lutador): void {
  const continua = l.desdeOUltimoGolpe <= REGRAS.janelaDaSequencia && l.golpeDaSequencia > 0 && l.golpeDaSequencia < 3;
  const proximo = continua ? ((l.golpeDaSequencia + 1) as 2 | 3) : 1;
  entrar(l, "golpe");
  l.golpeDaSequencia = proximo;
  if (continua) l.x += l.direcao * REGRAS.passoDaSequencia;
}

/**
 * Um ataque encontra o adversário: ao alcance, na frente, não protegido, não
 * caído nem na escada. Devolve `false` sem efeito quando não encontra.
 */
function acertar(p: Partida, i: Indice, golpe: TipoDeGolpe, alcance: number, dano: number, recuo: number, danoBloqueado: number, recuoBloqueado: number, forte: boolean, longa: boolean): boolean {
  const l = p.lutadores[i];
  const j = outro(i);
  const alvo = p.lutadores[j];
  if (noChao(alvo) || naEscada(alvo) || alvo.estado === "vitoria" || alvo.estado === "derrota") return false;
  const dx = alvo.x - l.x;
  const naFrente = Math.sign(dx) === l.direcao || Math.abs(dx) < 20;
  // A voadora vem de cima: pega quem está no chão abaixo dela; os golpes do chão não pegam quem pulou alto.
  const alturaOk = golpe === "voadora" ? alvo.y < 60 : Math.abs(alvo.y - l.y) < 70;
  if (!naFrente || Math.abs(dx) > alcance || !alturaOk || alvo.invulneravel > 0) return false;

  if (alvo.estado === "defesa") {
    alvo.equilibrio = Math.max(0, alvo.equilibrio - danoBloqueado);
    alvo.semRecuperar = REGRAS.pausaDaRecuperacao / 2;
    alvo.vx = l.direcao * recuoBloqueado;
    // Bater na guarda deixa quem bateu um pouco mais lento: vantagem de quem defendeu.
    l.recargaGolpe = Math.max(l.recargaGolpe, REGRAS.recargaDoGolpe + 0.14);
    p.eventos.push({ tipo: "golpe", quem: i, alvo: j, golpe, bloqueado: true, forte, x: alvo.x - l.direcao * 18, y: 120 });
    return true;
  }
  alvo.equilibrio -= dano;
  alvo.semRecuperar = REGRAS.pausaDaRecuperacao;
  alvo.golpesRecebidos += 1;
  if (alvo.estado === "carregando") soltarEscada(p, j);
  if (forte) alvo.invulneravel = REGRAS.protecaoDoForte;
  p.eventos.push({ tipo: "golpe", quem: i, alvo: j, golpe, bloqueado: false, forte, x: alvo.x - l.direcao * 14, y: Math.max(80, alvo.y + 140) });
  if (alvo.equilibrio <= 0) {
    derrubar(p, j, l.direcao * recuo * 0.8, longa);
    return true;
  }
  // Quem é atingido no ar cai no tapete: o atordoamento é no chão.
  if (noAr(alvo)) {
    alvo.y = 0;
    alvo.vy = 0;
  }
  entrar(alvo, "atingido");
  alvo.vx = l.direcao * recuo;
  alvo.vel = 0;
  alvo.direcao = l.direcao === 1 ? -1 : 1;
  return true;
}

/** Avança o golpe pelas três fases; outro aperto durante ele emenda o próximo da sequência. */
function avancarGolpe(p: Partida, i: Indice, apertouDeNovo: boolean): void {
  const l = p.lutadores[i];
  const golpe = golpeDe(l);
  const inicioAtivo = golpe.antecipacao;
  const fimAtivo = golpe.antecipacao + golpe.ativo;
  if (apertouDeNovo && l.t >= inicioAtivo && l.golpeDaSequencia < 3) l.proximoGolpe = true;
  if (l.t >= inicioAtivo && l.t < fimAtivo && !l.acertou) {
    l.acertou = true;
    const chute = l.golpeDaSequencia === 3;
    const nome = NOME_DO_GOLPE[l.golpeDaSequencia - 1] ?? "soco";
    if (!acertar(p, i, nome, REGRAS.alcance, golpe.dano, golpe.recuo, REGRAS.danoBloqueado, golpe.recuo * 0.35, chute, chute)) {
      p.eventos.push({ tipo: "golpeNoVazio", quem: i, golpe: nome });
    }
  }
  if (l.t >= fimAtivo + golpe.recuperacao) {
    const sequencia = l.golpeDaSequencia;
    const emenda = l.proximoGolpe;
    entrar(l, "parado");
    l.desdeOUltimoGolpe = 0;
    l.golpeDaSequencia = sequencia;
    l.recargaGolpe = Math.max(l.recargaGolpe, REGRAS.recargaDoGolpe);
    if (emenda) {
      l.recargaGolpe = 0;
      iniciarGolpe(l);
    }
  }
}

/** O golpe forte: preparação longa, impacto grande, recuperação em que se leva o troco. */
function avancarForte(p: Partida, i: Indice): void {
  const l = p.lutadores[i];
  const r = REGRAS.forte;
  if (l.t >= r.antecipacao && l.t < r.antecipacao + r.ativo && !l.acertou) {
    l.acertou = true;
    if (!acertar(p, i, "forte", r.alcance, r.dano, r.recuo, r.danoBloqueado, r.recuoBloqueado, true, true)) {
      p.eventos.push({ tipo: "golpeNoVazio", quem: i, golpe: "forte" });
    }
  }
  if (l.t >= r.antecipacao + r.ativo + r.recuperacao) {
    entrar(l, "parado");
    l.recargaForte = r.recarga;
  }
}

/**
 * A derrubada: na fase ativa, chacoalha a escada em pé à frente e tira
 * equilíbrio de quem está nela; a zero, a escada tomba com a pessoa.
 */
function avancarDerrubada(p: Partida, i: Indice): void {
  const l = p.lutadores[i];
  const r = REGRAS.derrubada;
  if (l.t >= r.antecipacao && l.t < r.antecipacao + r.ativo && !l.acertou) {
    l.acertou = true;
    const alvo = p.lutadores[outro(i)];
    if (escadaAoAlcance(p, l) && naEscada(alvo)) {
      p.escada.balanco = Math.max(p.escada.balanco, r.balanco);
      alvo.equilibrio -= r.dano;
      alvo.semRecuperar = REGRAS.pausaDaRecuperacao;
      alvo.golpesRecebidos += 1;
      const tombou = alvo.equilibrio <= 0;
      p.eventos.push({ tipo: "derrubada", quem: i, x: p.escada.x, tombou });
      if (tombou) derrubarEscada(p, l.direcao);
    } else {
      p.eventos.push({ tipo: "golpeNoVazio", quem: i, golpe: "forte" });
    }
  }
  if (l.t >= r.antecipacao + r.ativo + r.recuperacao) {
    entrar(l, "parado");
    l.recargaDerrubada = r.recarga;
  }
}

/** A fase de um ataque em andamento (golpe, forte, derrubada ou voadora), para o desenho. */
export function faseDoAtaque(l: Lutador): "antecipacao" | "ativo" | "recuperacao" | null {
  let r: { antecipacao: number; ativo: number } | null = null;
  if (l.estado === "golpe") r = golpeDe(l);
  else if (l.estado === "forte") r = REGRAS.forte;
  else if (l.estado === "derrubada") r = REGRAS.derrubada;
  else if (l.estado === "voadora") {
    if (l.t < REGRAS.voadora.ativoDe) return "antecipacao";
    if (l.t < REGRAS.voadora.ativoAte) return "ativo";
    return "recuperacao";
  }
  if (r === null) return null;
  if (l.t < r.antecipacao) return "antecipacao";
  if (l.t < r.antecipacao + r.ativo) return "ativo";
  return "recuperacao";
}

// ---------------------------------------------------------------------------
// Pulo, voadora, esquiva
// ---------------------------------------------------------------------------

function pular(p: Partida, i: Indice): void {
  const l = p.lutadores[i];
  entrar(l, "pulando");
  l.vy = REGRAS.pulo.impulso;
  l.voadoraUsada = false;
  p.eventos.push({ tipo: "pulo", quem: i });
}

/** A física do ar: gravidade, o pouco de controle de direção, e a aterrissagem. */
function avancarNoAr(p: Partida, i: Indice, e: Entrada, dt: number): void {
  const l = p.lutadores[i];
  const dir = (e.direita ? 1 : 0) - (e.esquerda ? 1 : 0);
  const alvo = dir * REGRAS.velocidade;
  l.vel = aproximar(l.vel, alvo, REGRAS.aceleracao * REGRAS.controleNoAr * dt);
  l.vy -= REGRAS.pulo.gravidade * dt;
  l.y += l.vy * dt;
  l.x += l.vel * dt;
  if (l.estado === "voadora" && l.t >= REGRAS.voadora.ativoDe && l.t < REGRAS.voadora.ativoAte && !l.acertou) {
    const r = REGRAS.voadora;
    if (acertar(p, i, "voadora", r.alcance, r.dano, r.recuo, r.danoBloqueado, r.recuo * 0.4, true, true)) l.acertou = true;
  }
  if (l.y <= 0) {
    l.y = 0;
    l.vy = 0;
    const pesada = l.estado === "voadora";
    if (pesada && !l.acertou) p.eventos.push({ tipo: "golpeNoVazio", quem: i, golpe: "voadora" });
    entrar(l, "aterrissando");
    l.tempoDeAterrissagem = pesada ? REGRAS.voadora.aterrissagem : REGRAS.pulo.aterrissagem;
    p.eventos.push({ tipo: "aterrissagem", quem: i, x: l.x, pesada });
  }
}

function esquivar(p: Partida, i: Indice, e: Entrada): void {
  const l = p.lutadores[i];
  const dir = (e.direita ? 1 : 0) - (e.esquerda ? 1 : 0);
  // Para trás por padrão; para onde a seta aponta, quando há uma.
  const sentido = dir !== 0 ? dir : -l.direcao;
  entrar(l, "esquiva");
  l.vel = (sentido * REGRAS.esquiva.distancia) / REGRAS.esquiva.duracao;
  l.invulneravel = Math.max(l.invulneravel, REGRAS.esquiva.invulneravel);
  l.recargaEsquiva = REGRAS.esquiva.recarga;
  p.eventos.push({ tipo: "esquiva", quem: i });
}

const aproximar = (valor: number, alvo: number, passo: number): number => (valor < alvo ? Math.min(alvo, valor + passo) : Math.max(alvo, valor - passo));

// ---------------------------------------------------------------------------
// Interação com a escada
// ---------------------------------------------------------------------------

/** O comando de interação, no chão: pega a escada caída. */
function interagir(p: Partida, i: Indice): void {
  const l = p.lutadores[i];
  const esc = p.escada;
  if (esc.estado === "caida" && Math.abs(l.x - esc.x) <= REGRAS.escada.pegar) {
    esc.estado = "carregada";
    esc.portador = i;
    esc.x = l.x;
    entrar(l, "carregando");
    l.vel = 0;
    p.eventos.push({ tipo: "escadaPega", quem: i });
  }
}

/** A seta para cima, alinhado à base da escada em pé: começa a subir. */
function subir(p: Partida, i: Indice): void {
  const l = p.lutadores[i];
  const esc = p.escada;
  const direcao: 1 | -1 = esc.x >= l.x ? 1 : -1;
  l.direcao = direcao;
  l.x = esc.x - direcao * 10;
  l.altura = 0;
  l.vx = 0;
  l.vel = 0;
  l.avisouFaltaPouco = false;
  entrar(l, "subindo");
  p.eventos.push({ tipo: "subida", quem: i });
}

function posicionarOuSoltar(p: Partida, i: Indice): void {
  const l = p.lutadores[i];
  const esc = p.escada;
  if (esc.estado !== "carregada" || esc.portador !== i) return;
  if (naZona(l.x)) {
    esc.estado = "emPe";
    esc.portador = null;
    esc.x = clampRingue(l.x, REGRAS.escada.zona);
    esc.balanco = 0.15;
    entrar(l, "parado");
    p.eventos.push({ tipo: "escadaPosta", quem: i, x: esc.x });
    return;
  }
  entrar(l, "parado");
  soltarEscada(p, i);
}

// ---------------------------------------------------------------------------
// Um lutador, um passo
// ---------------------------------------------------------------------------

/** A caminhada no chão, com aceleração e frenagem; devolve se está andando. */
function andar(l: Lutador, e: Entrada, dt: number, maxima: number, virarParaOnde: boolean): boolean {
  const dir = (e.direita ? 1 : 0) - (e.esquerda ? 1 : 0);
  const alvo = dir * maxima;
  const freando = dir === 0 || Math.sign(alvo) !== Math.sign(l.vel);
  l.vel = aproximar(l.vel, alvo, (freando ? REGRAS.frenagem : REGRAS.aceleracao) * dt);
  l.x += l.vel * dt;
  if (dir !== 0) {
    const nova: 1 | -1 = dir > 0 ? 1 : -1;
    if (virarParaOnde && nova !== l.direcao) {
      l.direcao = nova;
      l.virando = 0.14;
    }
    l.passo += dt * (2.4 * Math.abs(l.vel)) / REGRAS.velocidade;
  }
  return Math.abs(l.vel) > 12;
}

/** Os comandos de ação, quando o lutador está livre no chão. Devolve `true` quando algum saiu. */
function agir(p: Partida, i: Indice, e: Entrada, comando: ComandoGuardado | null): boolean {
  const l = p.lutadores[i];
  const adversario = p.lutadores[outro(i)];
  const olharParaOAdversario = () => {
    if (Math.abs(adversario.x - l.x) > 6) l.direcao = adversario.x > l.x ? 1 : -1;
  };
  if (comando === "golpe") {
    if (podeDerrubar(p, i)) {
      if (l.recargaDerrubada === 0) {
        l.direcao = p.escada.x >= l.x ? 1 : -1;
        l.vel = 0;
        entrar(l, "derrubada");
        return true;
      }
      bloquear(p, i, "recarga");
      return false;
    }
    if (l.recargaGolpe === 0) {
      olharParaOAdversario();
      l.vel *= 0.3;
      iniciarGolpe(l);
      return true;
    }
    return false;
  }
  if (comando === "forte") {
    if (l.recargaForte > 0) {
      bloquear(p, i, "recarga");
      return false;
    }
    olharParaOAdversario();
    l.vel = 0;
    entrar(l, "forte");
    return true;
  }
  if (comando === "pulo") {
    pular(p, i);
    return true;
  }
  if (comando === "esquiva") {
    if (l.recargaEsquiva > 0) {
      bloquear(p, i, "recarga");
      return false;
    }
    esquivar(p, i, e);
    return true;
  }
  return false;
}

function atualizarLutador(p: Partida, i: Indice, e: Entrada, dt: number): void {
  const l = p.lutadores[i];
  const adversario = p.lutadores[outro(i)];
  const apertou = (tecla: keyof Entrada): boolean => e[tecla] && !l.anterior[tecla];

  l.t += dt;
  l.invulneravel = Math.max(0, l.invulneravel - dt);
  l.recargaGolpe = Math.max(0, l.recargaGolpe - dt);
  l.recargaForte = Math.max(0, l.recargaForte - dt);
  l.recargaDerrubada = Math.max(0, l.recargaDerrubada - dt);
  l.recargaEsquiva = Math.max(0, l.recargaEsquiva - dt);
  l.semRecuperar = Math.max(0, l.semRecuperar - dt);
  l.virando = Math.max(0, l.virando - dt);
  l.desdeOUltimoGolpe += dt;
  if (l.estado !== "golpe" && l.desdeOUltimoGolpe > REGRAS.janelaDaSequencia) l.golpeDaSequencia = 0;
  if (l.guardado !== null) {
    l.guardadoT += dt;
    if (l.guardadoT > REGRAS.tolerancia) l.guardado = null;
  }

  if (l.semRecuperar === 0 && !noChao(l) && l.estado !== "atingido" && l.estado !== "vitoria" && l.estado !== "derrota") {
    l.equilibrio = Math.min(REGRAS.equilibrio, l.equilibrio + REGRAS.recuperacao * dt);
  }

  // O recuo é horizontal e decai sozinho; na escada não há recuo.
  if (!naEscada(l)) {
    l.x += l.vx * dt;
    l.vx *= Math.exp(-7 * dt);
    if (Math.abs(l.vx) < 4) l.vx = 0;
  }

  const olharParaOAdversario = () => {
    if (Math.abs(adversario.x - l.x) > 6) l.direcao = adversario.x > l.x ? 1 : -1;
  };

  // O comando de ação apertado agora, ou o guardado de um instante atrás.
  const apertado: ComandoGuardado | null = apertou("golpe") ? "golpe" : apertou("forte") ? "forte" : apertou("pulo") ? "pulo" : apertou("esquiva") ? "esquiva" : null;
  const guardar = (comando: ComandoGuardado | null) => {
    if (comando === null) return;
    l.guardado = comando;
    l.guardadoT = 0;
  };

  switch (l.estado) {
    case "parado":
    case "andando": {
      const comando = apertado ?? l.guardado;
      if (comando !== null) {
        l.guardado = null;
        if (agir(p, i, e, comando)) break;
      }
      if (e.defesa) {
        olharParaOAdversario();
        l.vel = 0;
        entrar(l, "defesa");
        break;
      }
      if (apertou("interagir")) {
        interagir(p, i);
        if (l.estado !== "parado" && l.estado !== "andando") break;
      }
      if (e.cima && podeSubir(p, i)) {
        subir(p, i);
        break;
      }
      const andando = andar(l, e, dt, REGRAS.velocidade, false);
      if (andando && l.estado !== "andando") entrar(l, "andando");
      else if (!andando && l.estado !== "parado") entrar(l, "parado");
      const antes = l.direcao;
      olharParaOAdversario();
      if (antes !== l.direcao) l.virando = 0.14;
      break;
    }
    case "defesa": {
      olharParaOAdversario();
      if (!e.defesa) entrar(l, "parado");
      else if (apertado !== null) bloquear(p, i, "noChao");
      break;
    }
    case "golpe":
      guardar(apertado === "golpe" ? null : apertado);
      avancarGolpe(p, i, apertou("golpe"));
      break;
    case "forte":
      guardar(apertado);
      avancarForte(p, i);
      break;
    case "derrubada":
      avancarDerrubada(p, i);
      break;
    case "pulando": {
      if (apertou("golpe")) {
        if (!l.voadoraUsada) {
          l.voadoraUsada = true;
          const direcaoDoAr = (e.direita ? 1 : 0) - (e.esquerda ? 1 : 0);
          if (direcaoDoAr !== 0) l.direcao = direcaoDoAr > 0 ? 1 : -1;
          entrar(l, "voadora");
          l.vel = l.direcao * Math.max(Math.abs(l.vel), REGRAS.velocidade * 0.9);
          p.eventos.push({ tipo: "voadora", quem: i });
        } else {
          bloquear(p, i, "noAr");
        }
      } else if (apertado === "pulo" || apertado === "forte" || apertado === "esquiva") {
        bloquear(p, i, "noAr");
      }
      avancarNoAr(p, i, e, dt);
      break;
    }
    case "voadora":
      if (apertado !== null) bloquear(p, i, "noAr");
      avancarNoAr(p, i, e, dt);
      break;
    case "aterrissando":
      guardar(apertado);
      l.vel = aproximar(l.vel, 0, REGRAS.frenagem * dt);
      l.x += l.vel * dt;
      if (l.t >= l.tempoDeAterrissagem) {
        entrar(l, "parado");
        olharParaOAdversario();
      }
      break;
    case "esquiva":
      guardar(apertado);
      l.x += l.vel * dt;
      if (l.t >= REGRAS.esquiva.duracao) {
        l.vel = 0;
        entrar(l, "parado");
        olharParaOAdversario();
      }
      break;
    case "atingido":
      if (l.t >= REGRAS.atingido) entrar(l, "parado");
      break;
    case "caido":
      if (l.t >= l.tempoCaido) {
        entrar(l, "levantando");
        l.invulneravel = REGRAS.protecaoAoLevantar;
        l.equilibrio = Math.max(l.equilibrio, REGRAS.equilibrioAoLevantar);
        l.semRecuperar = 0;
      }
      break;
    case "levantando":
      if (l.t >= REGRAS.levantando) {
        entrar(l, "parado");
        olharParaOAdversario();
        p.eventos.push({ tipo: "levantou", quem: i });
      }
      break;
    case "carregando": {
      if (apertou("interagir")) {
        posicionarOuSoltar(p, i);
        break;
      }
      if (apertado !== null) bloquear(p, i, "carregando");
      andar(l, e, dt, REGRAS.velocidadeCarregando, true);
      p.escada.x = l.x;
      break;
    }
    case "subindo": {
      if (apertado !== null) bloquear(p, i, "naEscada");
      if (e.cima) {
        l.altura = Math.min(1, l.altura + REGRAS.escada.subida * dt * (1 - 0.5 * p.escada.balanco));
        if (l.altura >= 1) {
          entrar(l, "noTopo");
          p.eventos.push({ tipo: "topo", quem: i });
        }
      } else if (e.baixo) {
        l.altura = Math.max(0, l.altura - REGRAS.escada.descida * dt);
        if (l.altura <= 0) {
          l.y = 0;
          entrar(l, "parado");
          p.eventos.push({ tipo: "desceu", quem: i });
          break;
        }
      }
      l.x = p.escada.x - l.direcao * 10;
      l.y = alturaNaEscada(l.altura);
      break;
    }
    case "noTopo": {
      l.x = p.escada.x - l.direcao * 10;
      l.y = alturaNaEscada(1);
      if (apertado !== null) bloquear(p, i, "naEscada");
      if (e.baixo) {
        l.altura = 0.97;
        entrar(l, "subindo");
        break;
      }
      const puxava = l.puxando;
      l.puxando = e.interagir;
      if (l.puxando && !puxava) p.eventos.push({ tipo: "puxando", quem: i, puxada: l.puxada });
      if (l.puxando && p.escada.balanco <= REGRAS.escada.balancoMaximo) {
        l.puxada = Math.min(1, l.puxada + dt / REGRAS.faixa.puxar);
        p.faixaBalanco = Math.min(1, p.faixaBalanco + dt * 2);
        p.escada.balanco = Math.min(0.35, p.escada.balanco + dt * 0.5);
        if (l.puxada >= REGRAS.faixa.aviso && !l.avisouFaltaPouco) {
          l.avisouFaltaPouco = true;
          p.eventos.push({ tipo: "faltaPouco", quem: i });
        }
        if (l.puxada >= 1) vencer(p, i);
      } else if (!l.puxando) {
        l.puxada = Math.max(0, l.puxada - REGRAS.faixa.perdaSemPuxar * dt);
      }
      break;
    }
    case "caindoDaEscada":
      l.vy -= REGRAS.pulo.gravidade * dt;
      l.y += l.vy * dt;
      l.x += l.vx * dt;
      if (l.y <= 0) {
        l.y = 0;
        l.vy = 0;
        l.altura = 0;
        derrubar(p, i, l.vx * 0.5, false);
      }
      break;
    case "vitoria":
    case "derrota":
      break;
  }

  l.anterior = { ...e };
}

// ---------------------------------------------------------------------------
// A partida, um passo
// ---------------------------------------------------------------------------

function atualizarEscada(p: Partida, dt: number): void {
  const esc = p.escada;
  esc.balanco = Math.max(0, esc.balanco - REGRAS.escada.amortecimento * dt);
  esc.desdeQueCaiu += dt;
  if (esc.estado === "caindo") {
    esc.queda = Math.min(1, esc.queda + dt / REGRAS.escada.tombo);
    if (esc.queda >= 1) {
      esc.estado = "caida";
      esc.queda = 0;
      esc.desdeQueCaiu = 0;
      esc.x = clampRingue(esc.x + esc.direcaoDaQueda * (REGRAS.escada.altura / 2), REGRAS.cordas);
      p.eventos.push({ tipo: "escadaCaiu", x: esc.x });
    }
  }
  p.faixaBalanco = Math.max(0, p.faixaBalanco - dt * 0.8);
}

/** Dois lutadores em pé no chão não ocupam o mesmo lugar; quem bate nas cordas volta. */
function resolverPosicoes(p: Partida): void {
  const [a, b] = p.lutadores;
  const separaveis = (l: Lutador) => !naEscada(l) && !noAr(l) && l.estado !== "caindoDaEscada" && !noChao(l);
  if (separaveis(a) && separaveis(b)) {
    const dx = b.x - a.x;
    const sobra = REGRAS.corpo - Math.abs(dx);
    if (sobra > 0) {
      const sinal = dx >= 0 ? 1 : -1;
      a.x -= (sinal * sobra) / 2;
      b.x += (sinal * sobra) / 2;
    }
  }
  for (const i of [0, 1] as const) {
    const l = p.lutadores[i];
    if (naEscada(l)) continue;
    if (Math.abs(l.x) > REGRAS.ringue) {
      const forte = Math.abs(l.vx) >= REGRAS.cordasRecuo;
      l.x = clampRingue(l.x, REGRAS.ringue);
      if (l.vel !== 0 && Math.sign(l.vel) === Math.sign(l.x)) l.vel = 0;
      if (forte) {
        l.vx = -l.vx * 0.45;
        if (!noChao(l) && p.fase === "luta") l.equilibrio = Math.max(0, l.equilibrio - 6);
        p.eventos.push({ tipo: "cordas", quem: i, x: l.x });
        if (l.equilibrio <= 0 && !noChao(l) && l.estado !== "vitoria" && l.estado !== "derrota") derrubar(p, i, l.vx, false);
      } else {
        l.vx = 0;
      }
    }
  }
}

function atualizarTorcida(p: Partida, dt: number): void {
  let alvo = 0.3;
  for (const l of p.lutadores) {
    if (l.estado === "subindo") alvo = Math.max(alvo, 0.5 + l.altura * 0.2);
    if (l.estado === "noTopo") alvo = Math.max(alvo, 0.7 + l.puxada * 0.3);
    if (l.estado === "caido") alvo = Math.max(alvo, 0.45);
  }
  if (p.fase === "fim") alvo = 1;
  for (const evento of p.eventos) {
    if (evento.tipo === "golpe" || evento.tipo === "derrubada" || evento.tipo === "queda" || evento.tipo === "escadaCaiu") p.torcida = Math.min(1, p.torcida + 0.12);
  }
  p.torcida += (alvo - p.torcida) * Math.min(1, dt * 1.6);
}

/**
 * Avança a partida em `dt` segundos com a entrada de cada lutador. Os eventos
 * do passo ficam em `p.eventos`, substituindo os do passo anterior.
 */
export function avancar(p: Partida, dt: number, entradas: readonly [Entrada, Entrada]): void {
  p.eventos = [];
  p.tempo += dt;

  if (p.fase === "contagem") {
    p.contagem -= dt;
    for (const i of [0, 1] as const) {
      const l = p.lutadores[i];
      l.t += dt;
      l.anterior = { ...entradas[i] };
    }
    if (p.contagem <= 0) {
      p.contagem = 0;
      p.fase = "luta";
      p.eventos.push({ tipo: "inicio" });
    }
    atualizarTorcida(p, dt);
    return;
  }

  if (p.fase === "fim") {
    for (const l of p.lutadores) l.t += dt;
    atualizarEscada(p, dt);
    atualizarTorcida(p, dt);
    return;
  }

  for (const i of [0, 1] as const) atualizarLutador(p, i, entradas[i], dt);
  atualizarEscada(p, dt);
  resolverPosicoes(p);
  atualizarTorcida(p, dt);
}

/** Os eventos de um tipo, para quem lê a partida. */
export function eventosDe<T extends Evento["tipo"]>(p: Partida, tipo: T): Extract<Evento, { tipo: T }>[] {
  return p.eventos.filter((evento): evento is Extract<Evento, { tipo: T }> => evento.tipo === tipo);
}

/** A escada, para o desenho: a base, a inclinação do tombo e a oscilação. */
export function poseDaEscada(esc: Escada): { x: number; tombo: number; balanco: number } {
  return { x: esc.x, tombo: esc.estado === "caindo" ? esc.queda : 0, balanco: esc.balanco };
}
