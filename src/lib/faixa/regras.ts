// Vale a Faixa: as regras da partida (docs/VALE-A-FAIXA.md). Função pura
// sobre os dados de tipos.ts: a cada passo de tempo recebe a entrada dos
// dois lutadores e avança a luta, a escada e a faixa, registrando em
// `eventos` o que aconteceu. Não conhece canvas, teclado nem React.
//
// O objetivo é a faixa, e não o nocaute: derrubar o adversário abre uma
// janela para pegar a escada, posicionar sob a faixa, subir e puxar. Cada
// estado exclui os outros (ninguém ataca caído nem carrega a escada subindo
// nela), as durações são fixas e a escada nunca se teletransporta: é levada,
// posta em pé, chacoalhada ou derrubada, sempre a partir de onde está.

import { ENTRADA_VAZIA, type Dica, type Entrada, type Escada, type Evento, type Indice, type Lutador, type LutadorSlug, type Partida } from "./tipos";

export const REGRAS = {
  /** Meia largura em que os lutadores andam; as cordas ficam logo além. */
  ringue: 400,
  cordas: 440,
  velocidade: 250,
  velocidadeCarregando: 165,
  /** Distância entre os centros para um golpe pegar: a mesma para os dois. */
  alcance: 78,
  alcanceEmpurrao: 86,
  /** Largura de um lutador: os dois não se sobrepõem. */
  corpo: 54,
  equilibrio: 100,
  /** Pontos de equilíbrio que voltam por segundo, fora de combate. */
  recuperacao: 11,
  /** Segundos sem recuperar depois de levar um golpe. */
  pausaDaRecuperacao: 0.9,
  golpe: { antecipacao: 0.13, ativo: 0.1, recuperacao: 0.24, dano: 24, danoBloqueado: 5, recuo: 190, recarga: 0.08, atordoa: 0.3 },
  empurrao: { antecipacao: 0.3, ativo: 0.12, recuperacao: 0.42, dano: 10, recuo: 540, recarga: 1.3, atordoa: 0.34 },
  /** O terceiro golpe seguido afasta mais e dá proteção breve: sem sequência infinita. */
  sequencia: { maxima: 3, janela: 1.6, recuo: 430, protecao: 0.6 },
  caido: 1.8,
  levantando: 0.55,
  /** Proteção ao levantar: cobre o levantar e um pouco depois. */
  protecaoAoLevantar: 0.9,
  equilibrioAoLevantar: 55,
  escada: {
    altura: 200,
    /** Até onde do centro do ringue a escada pode ficar em pé e alcançar a faixa. */
    zona: 64,
    /** Distância para pegar a escada caída, subir na escada em pé e chacoalhá-la. */
    pegar: 90,
    subir: 40,
    chacoalhar: 96,
    /** Velocidade de subida e de descida, em fração da escada por segundo. */
    subida: 0.8,
    descida: 1.4,
    /** Quanto um golpe na base balança a escada, e acima de quanto ninguém puxa a faixa. */
    balancoDoGolpe: 0.45,
    balancoMaximo: 0.4,
    amortecimento: 0.9,
    danoDoChacoalho: 34,
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
    recargaEmpurrao: 0,
    sequencia: 0,
    sequenciaT: 0,
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

/** O que o comando de interação faz agora para este lutador. */
export function dicaDe(p: Partida, i: Indice): Dica {
  if (p.fase !== "luta") return null;
  const l = p.lutadores[i];
  const esc = p.escada;
  if (l.estado === "carregando") return naZona(l.x) ? "posicionarEscada" : "soltarEscada";
  if (l.estado === "noTopo") return esc.balanco <= REGRAS.escada.balancoMaximo ? "puxarFaixa" : "foraDoAlcance";
  if (!livre(l)) return null;
  if (esc.estado === "caida" && Math.abs(l.x - esc.x) <= REGRAS.escada.pegar) return "pegarEscada";
  if (esc.estado === "emPe" && Math.abs(l.x - esc.x) <= REGRAS.escada.subir && !naEscada(p.lutadores[outro(i)])) return "subir";
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

function iniciarAtaque(l: Lutador, tipo: "golpe" | "empurrao"): void {
  entrar(l, tipo);
}

/** O instante ativo de um ataque: tenta acertar uma vez só. */
function acertar(p: Partida, i: Indice, tipo: "golpe" | "empurrao"): void {
  const l = p.lutadores[i];
  const j = outro(i);
  const alvo = p.lutadores[j];
  const esc = p.escada;
  l.acertou = true;

  // A escada em pé, na frente e ao alcance: um empurrão a derruba; um golpe
  // a chacoalha, se alguém estiver nela.
  const escadaNaFrente = esc.estado === "emPe" && Math.abs(esc.x - l.x) <= REGRAS.escada.chacoalhar && (Math.sign(esc.x - l.x) === l.direcao || Math.abs(esc.x - l.x) < 24);
  if (escadaNaFrente) {
    if (tipo === "empurrao") {
      p.eventos.push({ tipo: "empurrao", quem: i, alvo: j, x: esc.x, y: 60 });
      derrubarEscada(p, l.direcao);
      return;
    }
    if (naEscada(alvo)) {
      esc.balanco = Math.min(1, esc.balanco + REGRAS.escada.balancoDoGolpe);
      alvo.equilibrio -= REGRAS.escada.danoDoChacoalho;
      alvo.semRecuperar = REGRAS.pausaDaRecuperacao;
      alvo.golpesRecebidos += 1;
      p.eventos.push({ tipo: "escadaChacoalhada", quem: i, x: esc.x });
      if (alvo.equilibrio <= 0) cairDaEscada(p, j, l.direcao);
      return;
    }
  }

  if (noChao(alvo) || naEscada(alvo) || alvo.estado === "vitoria" || alvo.estado === "derrota") {
    p.eventos.push({ tipo: "golpeNoVazio", quem: i });
    return;
  }
  const dx = alvo.x - l.x;
  const naFrente = Math.sign(dx) === l.direcao || Math.abs(dx) < 20;
  const alcance = tipo === "golpe" ? REGRAS.alcance : REGRAS.alcanceEmpurrao;
  if (!naFrente || Math.abs(dx) > alcance || alvo.invulneravel > 0) {
    p.eventos.push({ tipo: "golpeNoVazio", quem: i });
    return;
  }

  const defendendo = alvo.estado === "defesa";
  if (tipo === "golpe") {
    if (defendendo) {
      alvo.equilibrio = Math.max(0, alvo.equilibrio - REGRAS.golpe.danoBloqueado);
      alvo.semRecuperar = REGRAS.pausaDaRecuperacao / 2;
      alvo.vx = l.direcao * REGRAS.golpe.recuo * 0.35;
      // Bater na guarda deixa quem bateu um pouco mais lento: vantagem de quem defendeu.
      l.recargaGolpe = REGRAS.golpe.recarga + 0.14;
      p.eventos.push({ tipo: "golpe", quem: i, alvo: j, bloqueado: true, x: alvo.x - l.direcao * 18, y: 120 });
      return;
    }
    alvo.equilibrio -= REGRAS.golpe.dano;
    alvo.semRecuperar = REGRAS.pausaDaRecuperacao;
    alvo.golpesRecebidos += 1;
    if (alvo.estado === "carregando") soltarEscada(p, j);
    l.sequencia += 1;
    l.sequenciaT = 0;
    let recuo: number = REGRAS.golpe.recuo;
    if (l.sequencia >= REGRAS.sequencia.maxima) {
      recuo = REGRAS.sequencia.recuo;
      alvo.invulneravel = REGRAS.sequencia.protecao;
      l.sequencia = 0;
    }
    p.eventos.push({ tipo: "golpe", quem: i, alvo: j, bloqueado: false, x: alvo.x - l.direcao * 14, y: 140 });
    if (alvo.equilibrio <= 0) {
      derrubar(p, j, l.direcao * recuo * 0.8);
      return;
    }
    entrar(alvo, "atingido");
    alvo.vx = l.direcao * recuo;
    alvo.direcao = l.direcao === 1 ? -1 : 1;
    return;
  }

  // Empurrão: não se bloqueia, afasta muito e tira pouco equilíbrio.
  alvo.equilibrio -= defendendo ? REGRAS.empurrao.dano / 2 : REGRAS.empurrao.dano;
  alvo.semRecuperar = REGRAS.pausaDaRecuperacao;
  if (alvo.estado === "carregando") soltarEscada(p, j);
  p.eventos.push({ tipo: "empurrao", quem: i, alvo: j, x: alvo.x - l.direcao * 16, y: 110 });
  if (alvo.equilibrio <= 0) {
    derrubar(p, j, l.direcao * REGRAS.empurrao.recuo * 0.6);
    return;
  }
  if (!defendendo) {
    entrar(alvo, "atingido");
    alvo.direcao = l.direcao === 1 ? -1 : 1;
  }
  alvo.vx = l.direcao * REGRAS.empurrao.recuo * (defendendo ? 0.5 : 1);
}

/** Avança um ataque pelas três fases. Devolve `true` enquanto o ataque dura. */
function avancarAtaque(p: Partida, i: Indice, tipo: "golpe" | "empurrao"): void {
  const l = p.lutadores[i];
  const r = REGRAS[tipo];
  const inicioAtivo = r.antecipacao;
  const fimAtivo = r.antecipacao + r.ativo;
  if (l.t >= inicioAtivo && l.t < fimAtivo && !l.acertou) acertar(p, i, tipo);
  if (l.t >= fimAtivo + r.recuperacao) {
    if (tipo === "golpe") l.recargaGolpe = Math.max(l.recargaGolpe, r.recarga);
    else l.recargaEmpurrao = r.recarga;
    entrar(l, "parado");
  }
}

/** A fase de um ataque em andamento, para o desenho. */
export function faseDoAtaque(l: Lutador): "antecipacao" | "ativo" | "recuperacao" | null {
  if (l.estado !== "golpe" && l.estado !== "empurrao") return null;
  const r = REGRAS[l.estado];
  if (l.t < r.antecipacao) return "antecipacao";
  if (l.t < r.antecipacao + r.ativo) return "ativo";
  return "recuperacao";
}

// ---------------------------------------------------------------------------
// Interação com a escada
// ---------------------------------------------------------------------------

function interagir(p: Partida, i: Indice): void {
  const l = p.lutadores[i];
  const esc = p.escada;
  if (esc.estado === "caida" && Math.abs(l.x - esc.x) <= REGRAS.escada.pegar) {
    esc.estado = "carregada";
    esc.portador = i;
    esc.x = l.x;
    entrar(l, "carregando");
    p.eventos.push({ tipo: "escadaPega", quem: i });
    return;
  }
  if (esc.estado === "emPe" && Math.abs(l.x - esc.x) <= REGRAS.escada.subir && !naEscada(p.lutadores[outro(i)])) {
    const direcao: 1 | -1 = esc.x >= l.x ? 1 : -1;
    l.direcao = direcao;
    l.x = esc.x - direcao * 10;
    l.altura = 0;
    l.vx = 0;
    entrar(l, "subindo");
    p.eventos.push({ tipo: "subida", quem: i });
  }
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
  l.recargaEmpurrao = Math.max(0, l.recargaEmpurrao - dt);
  l.semRecuperar = Math.max(0, l.semRecuperar - dt);
  l.sequenciaT += dt;
  if (l.sequenciaT > REGRAS.sequencia.janela) l.sequencia = 0;

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
      if (apertou("golpe") && l.recargaGolpe === 0) {
        olharParaOAdversario();
        iniciarAtaque(l, "golpe");
        break;
      }
      if (apertou("empurrao") && l.recargaEmpurrao === 0) {
        olharParaOAdversario();
        iniciarAtaque(l, "empurrao");
        break;
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
    case "empurrao":
      avancarAtaque(p, i, l.estado);
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
      if (l.puxando && p.escada.balanco <= REGRAS.escada.balancoMaximo) {
        l.puxada = Math.min(1, l.puxada + dt / REGRAS.faixa.puxar);
        p.faixaBalanco = Math.min(1, p.faixaBalanco + dt * 2);
        if (l.puxada >= 1) vencer(p, i);
      } else if (!l.puxando) {
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
    if (evento.tipo === "golpe" || evento.tipo === "empurrao" || evento.tipo === "queda" || evento.tipo === "escadaCaiu") p.torcida = Math.min(1, p.torcida + 0.12);
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
