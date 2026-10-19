// Vale a Faixa: o adversário controlado pelo computador. Produz uma
// `Entrada`, como a pessoa, a partir do que vê na partida: entende que o
// objetivo é a faixa (busca a escada quando o adversário cai, interrompe a
// subida do outro), decide com atraso de reação, varia as escolhas e erra de
// propósito uma parte das vezes. Determinístico pela semente, para os testes.
//
// Usa os mesmos comandos da pessoa e obedece às mesmas regras: nada de ler
// a entrada do adversário, de defesa perfeita ou de alcance a mais. Alterna
// entre aproximar, atacar (a sequência, o golpe forte, a voadora), defender,
// esquivar, recuar, buscar e posicionar a escada, subir, disputar a faixa e
// interromper quem sobe.

import { REGRAS, livre, naEscada, naZona, noAr, noChao, outro, podeDerrubar } from "./regras";
import { ENTRADA_VAZIA, type Entrada, type Indice, type Partida } from "./tipos";

export type EstadoDaIA = "aproximar" | "atacar" | "defender" | "esquivar" | "recuar" | "recuperar" | "buscarEscada" | "posicionar" | "subir" | "disputarFaixa" | "interromper" | "hesitar";

type Pulso = "golpe" | "forte" | "pulo" | "esquiva" | "interagir";

export interface MemoriaDaIA {
  estado: EstadoDaIA;
  /** Segundos até a próxima decisão: o atraso de reação. */
  reacao: number;
  semente: number;
  /** O que fica pressionado até a próxima decisão. */
  segurar: Entrada;
  /** Um toque único, consumido no próximo passo. */
  pulso: Pulso | null;
  /** Um segundo toque, que sai alguns passos depois do primeiro (a voadora depois do pulo). */
  pulsoSeguinte: { comando: Pulso; em: number } | null;
  /** Chance de uma decisão ser um erro proposital, de 0 a 1. */
  descuido: number;
  /** Quantas decisões foram erros, para os testes. */
  erros: number;
  decisoes: number;
}

export function criarMemoria(semente: number, descuido = 0.14): MemoriaDaIA {
  return { estado: "hesitar", reacao: 0.4, semente: semente | 0, segurar: { ...ENTRADA_VAZIA }, pulso: null, pulsoSeguinte: null, descuido, erros: 0, decisoes: 0 };
}

/** Um número de 0 a 1, determinístico pela semente (mulberry32). */
export function sortear(m: MemoriaDaIA): number {
  m.semente = (m.semente + 0x6d2b79f5) | 0;
  let t = m.semente;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function irPara(m: MemoriaDaIA, alvoX: number, euX: number, tolerancia: number): void {
  const dx = alvoX - euX;
  if (Math.abs(dx) <= tolerancia) return;
  if (dx > 0) m.segurar.direita = true;
  else m.segurar.esquerda = true;
}

function afastarDe(m: MemoriaDaIA, alvoX: number, euX: number): void {
  if (alvoX > euX) m.segurar.esquerda = true;
  else m.segurar.direita = true;
}

function decidirAgora(p: Partida, eu: Indice, m: MemoriaDaIA): void {
  const l = p.lutadores[eu];
  const o = p.lutadores[outro(eu)];
  const esc = p.escada;
  const dx = o.x - l.x;
  const dist = Math.abs(dx);
  const r = () => sortear(m);
  m.segurar = { ...ENTRADA_VAZIA };
  m.pulso = null;
  m.decisoes += 1;

  if (p.fase !== "luta") {
    m.estado = "recuperar";
    m.reacao = 0.2;
    return;
  }

  switch (l.estado) {
    case "caido":
    case "levantando":
    case "atingido":
    case "caindoDaEscada":
    case "aterrissando":
    case "esquiva":
    case "vitoria":
    case "derrota":
      m.estado = "recuperar";
      m.reacao = 0.15;
      return;
    case "pulando":
      // No ar, indo para o adversário: a voadora, quando ele está à frente e perto.
      m.estado = "atacar";
      if (!l.voadoraUsada && dist < 190 && Math.sign(dx) === l.direcao && !noChao(o) && r() < 0.85) m.pulso = "golpe";
      if (dx > 0) m.segurar.direita = true;
      else m.segurar.esquerda = true;
      m.reacao = 0.12;
      return;
    case "voadora":
      m.estado = "atacar";
      m.reacao = 0.1;
      return;
    case "subindo": {
      const ameaca = !noChao(o) && !naEscada(o) && Math.abs(o.x - esc.x) < 130 && l.altura < 0.5 && l.equilibrio < 60;
      if (ameaca && r() < 0.6) {
        m.segurar.baixo = true;
        m.estado = "defender";
        m.reacao = 0.25;
      } else {
        m.segurar.cima = true;
        m.estado = "subir";
        m.reacao = 0.2;
      }
      return;
    }
    case "noTopo": {
      // Chacoalhado e perto de cair, com pouco puxado, desce para disputar; senão, segura e puxa.
      const ameaca = !noChao(o) && !naEscada(o) && Math.abs(o.x - esc.x) < 150 && l.equilibrio < 50 && l.puxada < 0.7;
      if (ameaca && r() < 0.55) {
        m.segurar.baixo = true;
        m.estado = "defender";
        m.reacao = 0.3;
      } else {
        m.segurar.interagir = true;
        m.estado = "disputarFaixa";
        m.reacao = 0.3;
      }
      return;
    }
    case "carregando":
      m.estado = "posicionar";
      if (naZona(l.x) && Math.abs(l.x) <= REGRAS.escada.zona - 8) {
        m.pulso = "interagir";
        m.reacao = 0.2;
        return;
      }
      irPara(m, 0, l.x, 10);
      m.reacao = 0.15;
      return;
    case "golpe":
      // No meio da sequência: emenda o próximo golpe algumas vezes.
      m.estado = "atacar";
      if (l.golpeDaSequencia < 3 && r() < 0.6) m.pulso = "golpe";
      m.reacao = 0.12;
      return;
    case "forte":
    case "derrubada":
      m.estado = l.estado === "forte" ? "atacar" : "interromper";
      m.reacao = 0.1;
      return;
    case "parado":
    case "andando":
    case "defesa":
      break;
  }

  // Um erro proposital: hesitar parado, bater no vazio ou pular sem motivo.
  if (r() < m.descuido) {
    m.erros += 1;
    const sorte = r();
    if (sorte < 0.45) {
      m.estado = "hesitar";
      m.reacao = 0.3 + r() * 0.3;
    } else if (sorte < 0.8) {
      m.estado = "atacar";
      m.pulso = "golpe";
      m.reacao = 0.45;
    } else {
      m.estado = "atacar";
      m.pulso = "pulo";
      m.reacao = 0.5;
    }
    return;
  }

  const oNoChao = noChao(o);
  const dEscada = Math.abs(esc.x - l.x);
  const dEscadaDele = Math.abs(esc.x - o.x);

  // O adversário está subindo: interromper, na base da escada, com a derrubada.
  if (naEscada(o)) {
    m.estado = "interromper";
    if (podeDerrubar(p, eu)) {
      if (l.recargaDerrubada === 0) m.pulso = "golpe";
      m.reacao = 0.2 + r() * 0.2;
    } else {
      irPara(m, esc.x, l.x, REGRAS.escada.derrubar - 24);
      m.reacao = 0.12;
    }
    return;
  }

  // A escada está em pé: subir quando há vantagem.
  if (esc.estado === "emPe") {
    const vantagem = oNoChao || dist > 240 || (dEscada + 60 < dEscadaDele && o.estado !== "golpe" && o.estado !== "forte");
    if (vantagem && livre(l)) {
      m.estado = "subir";
      if (dEscada <= REGRAS.escada.subir - 8) {
        m.segurar.cima = true;
        m.reacao = 0.2;
      } else {
        irPara(m, esc.x, l.x, REGRAS.escada.subir - 14);
        m.reacao = 0.12;
      }
      return;
    }
  }

  // A escada está caída: buscá-la quando dá tempo.
  if (esc.estado === "caida") {
    const vantagem = oNoChao || dist > 260 || dEscada + 80 < dEscadaDele;
    if (vantagem && livre(l)) {
      m.estado = "buscarEscada";
      if (dEscada <= REGRAS.escada.pegar - 10) {
        m.pulso = "interagir";
        m.reacao = 0.2;
      } else {
        irPara(m, esc.x, l.x, REGRAS.escada.pegar - 18);
        m.reacao = 0.12;
      }
      return;
    }
  }

  // Combate.
  if (oNoChao) {
    m.estado = "aproximar";
    irPara(m, o.x, l.x, REGRAS.alcance - 10);
    m.reacao = 0.2;
    return;
  }
  const oAtacando = (o.estado === "golpe" || o.estado === "forte") && o.t < 0.2;
  const oVulneravel = o.estado === "aterrissando" || (o.estado === "forte" && o.t > REGRAS.forte.antecipacao) || o.estado === "esquiva";
  if (l.equilibrio < 30 && dist < 140) {
    const sorte = r();
    if (sorte < 0.35 && l.recargaEsquiva === 0) {
      m.estado = "esquivar";
      m.pulso = "esquiva";
      m.reacao = 0.4;
    } else if (sorte < 0.7) {
      m.estado = "defender";
      m.segurar.defesa = true;
      m.reacao = 0.4 + r() * 0.4;
    } else {
      m.estado = "recuar";
      afastarDe(m, o.x, l.x);
      m.reacao = 0.35;
    }
    return;
  }
  // De média distância, às vezes vem de voadora.
  if (dist > 130 && dist < 230 && !noAr(o) && r() < 0.22) {
    m.estado = "atacar";
    m.pulso = "pulo";
    m.pulsoSeguinte = { comando: "golpe", em: 0.22 + r() * 0.1 };
    if (dx > 0) m.segurar.direita = true;
    else m.segurar.esquerda = true;
    m.reacao = 0.5;
    return;
  }
  if (dist > REGRAS.alcance - 6) {
    m.estado = "aproximar";
    irPara(m, o.x, l.x, REGRAS.alcance - 16);
    m.reacao = 0.1 + r() * 0.1;
    return;
  }
  // Ao alcance: reage à preparação do outro, pune a recuperação, ou bate.
  if (oAtacando) {
    const sorte = r();
    if (sorte < 0.35) {
      m.estado = "defender";
      m.segurar.defesa = true;
      m.reacao = 0.35;
      return;
    }
    if (sorte < 0.55 && l.recargaEsquiva === 0) {
      m.estado = "esquivar";
      m.pulso = "esquiva";
      m.reacao = 0.4;
      return;
    }
  }
  if (oVulneravel && l.recargaForte === 0 && r() < 0.7) {
    m.estado = "atacar";
    m.pulso = "forte";
    m.reacao = 0.6;
    return;
  }
  // Contra a guarda, esperar um pouco rende mais do que bater nela; às vezes, o forte.
  if (o.estado === "defesa") {
    if (l.recargaForte === 0 && r() < 0.3) {
      m.estado = "atacar";
      m.pulso = "forte";
      m.reacao = 0.6;
    } else {
      m.estado = "hesitar";
      m.reacao = 0.25 + r() * 0.2;
    }
    return;
  }
  if (l.recargaGolpe === 0) {
    m.estado = "atacar";
    m.pulso = r() < 0.15 && l.recargaForte === 0 ? "forte" : "golpe";
    m.reacao = 0.3 + r() * 0.25;
    return;
  }
  m.estado = "hesitar";
  m.reacao = 0.1;
}

/** A entrada do computador neste passo. */
export function decidir(p: Partida, eu: Indice, m: MemoriaDaIA, dt: number): Entrada {
  m.reacao -= dt;
  if (m.reacao <= 0) decidirAgora(p, eu, m);
  if (m.pulsoSeguinte !== null) {
    m.pulsoSeguinte.em -= dt;
    if (m.pulsoSeguinte.em <= 0) {
      m.pulso = m.pulsoSeguinte.comando;
      m.pulsoSeguinte = null;
    }
  }
  const saida: Entrada = {
    ...m.segurar,
    pulo: m.pulso === "pulo",
    golpe: m.pulso === "golpe",
    forte: m.pulso === "forte",
    esquiva: m.pulso === "esquiva",
    interagir: m.segurar.interagir || m.pulso === "interagir",
  };
  m.pulso = null;
  return saida;
}
