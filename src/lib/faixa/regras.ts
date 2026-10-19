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
// Sete comandos. Atacar é contextual: um golpe na direção em que o lutador
// olha, em sequência curta de três (o terceiro é o forte); perto da escada
// em que o adversário está, a tentativa de derrubá-la. Interagir também:
// pega, posiciona ou larga a escada; no topo, segurado, puxa a faixa. Subir
// e descer são as setas, com o lutador alinhado à base.

import { ENTRADA_VAZIA, type Dica, type Entrada, type Escada, type Evento, type Indice, type Lutador, type LutadorSlug, type Partida } from "./tipos";

export interface Golpe {
  antecipacao: number;
  ativo: number;
  recuperacao: number;
  dano: number;
  recuo: number;
}

export const REGRAS = {
  /** Meia largura em que os lutadores andam; as cordas ficam logo além. */
  ringue: 400,
  cordas: 440,
  velocidade: 250,
  velocidadeCarregando: 165,
  /** Distância entre os centros para um golpe pegar: a mesma para os dois. */
  alcance: 78,
  /** Largura de um lutador: os dois não se sobrepõem. */
  corpo: 54,
  equilibrio: 100,
  /** Pontos de equilíbrio que voltam por segundo, fora de combate. */
  recuperacao: 11,
  /** Segundos sem recuperar depois de levar um golpe. */
  pausaDaRecuperacao: 0.9,
  /** A sequência: jab, direto e o forte, que afasta mais e dá proteção breve (sem sequência infinita). */
  golpes: [
    { antecipacao: 0.12, ativo: 0.08, recuperacao: 0.2, dano: 20, recuo: 120 },
    { antecipacao: 0.1, ativo: 0.08, recuperacao: 0.22, dano: 22, recuo: 140 },
    { antecipacao: 0.18, ativo: 0.1, recuperacao: 0.42, dano: 30, recuo: 430 },
  ] as readonly [Golpe, Golpe, Golpe],
  /** Quanto o lutador avança ao emendar o segundo e o terceiro golpes: a sequência alcança quem recuou. */
  passoDaSequencia: 12,
  danoBloqueado: 5,
  /** Segundos depois de um golpe em que o próximo continua a sequência; passada a janela, volta ao primeiro. */
  janelaDaSequencia: 0.45,
  protecaoDoForte: 0.6,
  recargaDoGolpe: 0.08,
  /** A derrubada da escada: mais lenta, com recarga. */
  derrubada: { antecipacao: 0.42, ativo: 0.1, recuperacao: 0.45, recarga: 0.9 },
  caido: 1.8,
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
    subir: 40,
    derrubar: 96,
    /** Velocidade de subida e de descida, em fração da escada por segundo. */
    subida: 0.8,
    descida: 1.4,
    amortecimento: 0.9,
    /** Segundos do tombo. */
    tombo: 0.55,
    /** Onde ficam os pés de quem está no topo, em fração da altura. */
    topo: 0.84,
  },
  faixa: { altura: 345, puxar: 1.8, perdaAoCair: 0.4, perdaSemPuxar: 0.08 },
  contagem: 2.6,
  atingido: 0.3,
  gravidade: 1100,
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
    vx: 0,
    vy: 0,
    estado: "parado",
    t: 0,
    equilibrio: REGRAS.equilibrio,
    semRecuperar: 0,
    altura: 0,
    invulneravel: 0,
    recargaGolpe: 0,
    recargaDerrubada: 0,
    golpeDaSequencia: 0,
    desdeOUltimoGolpe: 10,
    proximoGolpe: false,
    acertou: false,
    passo: 0,
    puxada: 0,
    puxando: false,
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
    escada: { estado: "caida", x: lado * 330, portador: null, balanco: 0, queda: 0, direcaoDaQueda: lado === 1 ? -1 : 1 },
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

/** Pode agir por conta própria: andar, atacar, defender, interagir. */
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
}

function derrubar(p: Partida, i: Indice, recuo: number): void {
  const l = p.lutadores[i];
  if (p.fase === "fim" || l.estado === "caido") return;
  if (l.estado === "carregando") soltarEscada(p, i);
  entrar(l, "caido");
  l.equilibrio = 0;
  l.vx = recuo;
  l.quedas += 1;
  p.eventos.push({ tipo: "queda", quem: i, x: l.x });
}

/** Quem está na escada cai dela: recuo para o lado dado, e parte do que puxou se perde. */
function cairDaEscada(p: Partida, i: Indice, direcao: 1 | -1): void {
  const l = p.lutadores[i];
  if (!naEscada(l)) return;
  l.y = alturaNaEscada(l.altura);
  entrar(l, "caindoDaEscada");
  l.vy = 150;
  l.vx = direcao * 150;
  l.equilibrio = 0;
  if (l.puxada > 0) {
    l.puxada = Math.max(0, l.puxada * (1 - REGRAS.faixa.perdaAoCair));
    p.eventos.push({ tipo: "interrompido", quem: i, puxada: l.puxada });
  }
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
  p.torcida = 1;
  p.eventos.push({ tipo: "vitoria", quem: i });
}

const clampRingue = (x: number, limite: number): number => Math.max(-limite, Math.min(limite, x));

// ---------------------------------------------------------------------------
// Ataques
// ---------------------------------------------------------------------------

/** O golpe de agora, pela posição na sequência. */
export function golpeDe(l: Lutador): Golpe {
  const indice = Math.max(0, Math.min(2, l.golpeDaSequencia - 1));
  return REGRAS.golpes[indice] ?? REGRAS.golpes[0];
}

/** Começa um golpe: o próximo da sequência se o anterior acabou há pouco; senão, o primeiro. */
function iniciarGolpe(l: Lutador): void {
  const continua = l.desdeOUltimoGolpe <= REGRAS.janelaDaSequencia && l.golpeDaSequencia > 0 && l.golpeDaSequencia < 3;
  const proximo = continua ? ((l.golpeDaSequencia + 1) as 2 | 3) : 1;
  entrar(l, "golpe");
  l.golpeDaSequencia = proximo;
  if (continua) l.x += l.direcao * REGRAS.passoDaSequencia;
}

/** O instante ativo de um golpe: tenta acertar uma vez só. */
function acertarGolpe(p: Partida, i: Indice): void {
  const l = p.lutadores[i];
  const j = outro(i);
  const alvo = p.lutadores[j];
  const golpe = golpeDe(l);
  const forte = l.golpeDaSequencia === 3;
  l.acertou = true;

  if (noChao(alvo) || naEscada(alvo) || alvo.estado === "vitoria" || alvo.estado === "derrota") {
    p.eventos.push({ tipo: "golpeNoVazio", quem: i });
    return;
  }
  const dx = alvo.x - l.x;
  const naFrente = Math.sign(dx) === l.direcao || Math.abs(dx) < 20;
  if (!naFrente || Math.abs(dx) > REGRAS.alcance || alvo.invulneravel > 0) {
    p.eventos.push({ tipo: "golpeNoVazio", quem: i });
    return;
  }

  if (alvo.estado === "defesa") {
    alvo.equilibrio = Math.max(0, alvo.equilibrio - REGRAS.danoBloqueado);
    alvo.semRecuperar = REGRAS.pausaDaRecuperacao / 2;
    alvo.vx = l.direcao * golpe.recuo * 0.35;
    // Bater na guarda deixa quem bateu um pouco mais lento: vantagem de quem defendeu.
    l.recargaGolpe = REGRAS.recargaDoGolpe + 0.14;
    p.eventos.push({ tipo: "golpe", quem: i, alvo: j, bloqueado: true, forte, x: alvo.x - l.direcao * 18, y: 120 });
    return;
  }
  alvo.equilibrio -= golpe.dano;
  alvo.semRecuperar = REGRAS.pausaDaRecuperacao;
  alvo.golpesRecebidos += 1;
  if (alvo.estado === "carregando") soltarEscada(p, j);
  if (forte) alvo.invulneravel = REGRAS.protecaoDoForte;
  p.eventos.push({ tipo: "golpe", quem: i, alvo: j, bloqueado: false, forte, x: alvo.x - l.direcao * 14, y: 140 });
  if (alvo.equilibrio <= 0) {
    derrubar(p, j, l.direcao * golpe.recuo * 0.8);
    return;
  }
  entrar(alvo, "atingido");
  alvo.vx = l.direcao * golpe.recuo;
  alvo.direcao = l.direcao === 1 ? -1 : 1;
}

/** Avança o golpe pelas três fases; outro aperto durante ele emenda o próximo da sequência. */
function avancarGolpe(p: Partida, i: Indice, apertouDeNovo: boolean): void {
  const l = p.lutadores[i];
  const golpe = golpeDe(l);
  const inicioAtivo = golpe.antecipacao;
  const fimAtivo = golpe.antecipacao + golpe.ativo;
  if (apertouDeNovo && l.t >= inicioAtivo && l.golpeDaSequencia < 3) l.proximoGolpe = true;
  if (l.t >= inicioAtivo && l.t < fimAtivo && !l.acertou) acertarGolpe(p, i);
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

/** A derrubada: na fase ativa, a escada em pé à frente tomba, e quem estava nela cai. */
function avancarDerrubada(p: Partida, i: Indice): void {
  const l = p.lutadores[i];
  const r = REGRAS.derrubada;
  if (l.t >= r.antecipacao && l.t < r.antecipacao + r.ativo && !l.acertou) {
    l.acertou = true;
    if (escadaAoAlcance(p, l)) {
      p.eventos.push({ tipo: "derrubada", quem: i, x: p.escada.x });
      derrubarEscada(p, l.direcao);
    } else {
      p.eventos.push({ tipo: "golpeNoVazio", quem: i });
    }
  }
  if (l.t >= r.antecipacao + r.ativo + r.recuperacao) {
    entrar(l, "parado");
    l.recargaDerrubada = r.recarga;
  }
}

/** A fase de um ataque em andamento (golpe ou derrubada), para o desenho. */
export function faseDoAtaque(l: Lutador): "antecipacao" | "ativo" | "recuperacao" | null {
  if (l.estado === "golpe") {
    const g = golpeDe(l);
    if (l.t < g.antecipacao) return "antecipacao";
    if (l.t < g.antecipacao + g.ativo) return "ativo";
    return "recuperacao";
  }
  if (l.estado === "derrubada") {
    const r = REGRAS.derrubada;
    if (l.t < r.antecipacao) return "antecipacao";
    if (l.t < r.antecipacao + r.ativo) return "ativo";
    return "recuperacao";
  }
  return null;
}

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

function atualizarLutador(p: Partida, i: Indice, e: Entrada, dt: number): void {
  const l = p.lutadores[i];
  const adversario = p.lutadores[outro(i)];
  const apertou = (tecla: keyof Entrada): boolean => e[tecla] && !l.anterior[tecla];

  l.t += dt;
  l.invulneravel = Math.max(0, l.invulneravel - dt);
  l.recargaGolpe = Math.max(0, l.recargaGolpe - dt);
  l.recargaDerrubada = Math.max(0, l.recargaDerrubada - dt);
  l.semRecuperar = Math.max(0, l.semRecuperar - dt);
  l.desdeOUltimoGolpe += dt;
  if (l.estado !== "golpe" && l.desdeOUltimoGolpe > REGRAS.janelaDaSequencia) l.golpeDaSequencia = 0;

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

  switch (l.estado) {
    case "parado":
    case "andando": {
      if (apertou("golpe")) {
        if (podeDerrubar(p, i)) {
          if (l.recargaDerrubada === 0) {
            l.direcao = p.escada.x >= l.x ? 1 : -1;
            entrar(l, "derrubada");
            break;
          }
        } else if (l.recargaGolpe === 0) {
          olharParaOAdversario();
          iniciarGolpe(l);
          break;
        }
      }
      if (e.defesa) {
        olharParaOAdversario();
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
      const dir = (e.direita ? 1 : 0) - (e.esquerda ? 1 : 0);
      if (dir !== 0) {
        l.x += dir * REGRAS.velocidade * dt;
        l.passo += dt * 2.4;
        if (l.estado !== "andando") entrar(l, "andando");
      } else if (l.estado !== "parado") {
        entrar(l, "parado");
      }
      olharParaOAdversario();
      break;
    }
    case "defesa": {
      olharParaOAdversario();
      if (!e.defesa) entrar(l, "parado");
      break;
    }
    case "golpe":
      avancarGolpe(p, i, apertou("golpe"));
      break;
    case "derrubada":
      avancarDerrubada(p, i);
      break;
    case "atingido":
      if (l.t >= REGRAS.atingido) entrar(l, "parado");
      break;
    case "caido":
      if (l.t >= REGRAS.caido) {
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
      const dir = (e.direita ? 1 : 0) - (e.esquerda ? 1 : 0);
      if (dir !== 0) {
        l.x += dir * REGRAS.velocidadeCarregando * dt;
        l.direcao = dir > 0 ? 1 : -1;
        l.passo += dt * 2;
      }
      p.escada.x = l.x;
      break;
    }
    case "subindo": {
      if (e.cima) {
        l.altura = Math.min(1, l.altura + REGRAS.escada.subida * dt);
        if (l.altura >= 1) {
          entrar(l, "noTopo");
          p.eventos.push({ tipo: "topo", quem: i });
        }
      } else if (e.baixo) {
        l.altura = Math.max(0, l.altura - REGRAS.escada.descida * dt);
        if (l.altura <= 0) {
          l.y = 0;
          entrar(l, "parado");
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
      if (e.baixo) {
        l.altura = 0.97;
        entrar(l, "subindo");
        break;
      }
      const puxava = l.puxando;
      l.puxando = e.interagir;
      if (l.puxando && !puxava) p.eventos.push({ tipo: "puxando", quem: i, puxada: l.puxada });
      if (l.puxando) {
        l.puxada = Math.min(1, l.puxada + dt / REGRAS.faixa.puxar);
        p.faixaBalanco = Math.min(1, p.faixaBalanco + dt * 2);
        p.escada.balanco = Math.min(0.35, p.escada.balanco + dt * 0.5);
        if (l.puxada >= 1) vencer(p, i);
      } else {
        l.puxada = Math.max(0, l.puxada - REGRAS.faixa.perdaSemPuxar * dt);
      }
      break;
    }
    case "caindoDaEscada":
      l.vy -= REGRAS.gravidade * dt;
      l.y += l.vy * dt;
      l.x += l.vx * dt;
      if (l.y <= 0) {
        l.y = 0;
        l.vy = 0;
        l.altura = 0;
        derrubar(p, i, l.vx * 0.5);
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
  if (esc.estado === "caindo") {
    esc.queda = Math.min(1, esc.queda + dt / REGRAS.escada.tombo);
    if (esc.queda >= 1) {
      esc.estado = "caida";
      esc.queda = 0;
      esc.x = clampRingue(esc.x + esc.direcaoDaQueda * (REGRAS.escada.altura / 2), REGRAS.cordas);
      p.eventos.push({ tipo: "escadaCaiu", x: esc.x });
    }
  }
  p.faixaBalanco = Math.max(0, p.faixaBalanco - dt * 0.8);
}

/** Dois lutadores em pé não ocupam o mesmo lugar; quem bate nas cordas volta. */
function resolverPosicoes(p: Partida): void {
  const [a, b] = p.lutadores;
  const separaveis = (l: Lutador) => !naEscada(l) && l.estado !== "caindoDaEscada";
  if (separaveis(a) && separaveis(b) && !noChao(a) && !noChao(b)) {
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
      if (forte) {
        l.vx = -l.vx * 0.45;
        if (!noChao(l) && p.fase === "luta") l.equilibrio = Math.max(0, l.equilibrio - 6);
        p.eventos.push({ tipo: "cordas", quem: i, x: l.x });
        if (l.equilibrio <= 0 && !noChao(l) && l.estado !== "vitoria" && l.estado !== "derrota") derrubar(p, i, l.vx);
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
    if (l.estado === "noTopo") alvo = Math.max(alvo, 0.75 + l.puxada * 0.25);
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
