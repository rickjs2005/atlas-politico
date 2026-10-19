// Vale a Faixa: o adversário controlado pelo computador. Produz uma
// `Entrada`, como a pessoa, a partir do que vê na partida: entende que o
// objetivo é a faixa (busca a escada quando o adversário cai, interrompe a
// subida do outro), decide com atraso de reação, varia as escolhas e erra de
// propósito uma parte das vezes. Determinístico pela semente, para os testes.
//
// Usa os mesmos sete comandos da pessoa: atacar é contextual (golpe, ou a
// derrubada da escada em que o outro está), interagir pega, posiciona e
// larga a escada e puxa a faixa, e subir é a seta para cima na base.

import { REGRAS, livre, naEscada, naZona, noChao, outro, podeDerrubar } from "./regras";
import { ENTRADA_VAZIA, type Entrada, type Indice, type Partida } from "./tipos";

export type EstadoDaIA = "aproximar" | "atacar" | "defender" | "recuperar" | "buscarEscada" | "posicionar" | "subir" | "disputarFaixa" | "interromper" | "hesitar";

export interface MemoriaDaIA {
  estado: EstadoDaIA;
  /** Segundos até a próxima decisão: o atraso de reação. */
  reacao: number;
  semente: number;
  /** O que fica pressionado até a próxima decisão. */
  segurar: Entrada;
  /** Um toque único, consumido no próximo passo. */
  pulso: "golpe" | "interagir" | null;
  /** Chance de uma decisão ser um erro proposital, de 0 a 1. */
  descuido: number;
  /** Quantas decisões foram erros, para os testes. */
  erros: number;
  decisoes: number;
}

export function criarMemoria(semente: number, descuido = 0.14): MemoriaDaIA {
  return { estado: "hesitar", reacao: 0.4, semente: semente | 0, segurar: { ...ENTRADA_VAZIA }, pulso: null, descuido, erros: 0, decisoes: 0 };
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
    case "vitoria":
    case "derrota":
      m.estado = "recuperar";
      m.reacao = 0.15;
      return;
    case "subindo": {
      const ameaca = !noChao(o) && !naEscada(o) && Math.abs(o.x - esc.x) < 120 && l.altura < 0.45;
      if (ameaca && r() < 0.65) {
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
    case "noTopo":
      m.segurar.interagir = true;
      m.estado = "disputarFaixa";
      m.reacao = 0.3;
      return;
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
    case "derrubada":
      m.estado = "interromper";
      m.reacao = 0.1;
      return;
    case "parado":
    case "andando":
    case "defesa":
      break;
  }

  // Um erro proposital: hesitar parado ou bater no vazio.
  if (r() < m.descuido) {
    m.erros += 1;
    if (r() < 0.5) {
      m.estado = "hesitar";
      m.reacao = 0.3 + r() * 0.3;
    } else {
      m.estado = "atacar";
      m.pulso = "golpe";
      m.reacao = 0.45;
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
    const vantagem = oNoChao || dist > 240 || (dEscada + 60 < dEscadaDele && o.estado !== "golpe" && o.estado !== "derrubada");
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
  if (l.equilibrio < 30 && dist < 140 && r() < 0.6) {
    m.estado = "defender";
    m.segurar.defesa = true;
    m.reacao = 0.4 + r() * 0.4;
    return;
  }
  if (dist > REGRAS.alcance - 6) {
    m.estado = "aproximar";
    irPara(m, o.x, l.x, REGRAS.alcance - 16);
    m.reacao = 0.1 + r() * 0.1;
    return;
  }
  if (o.estado === "golpe" && o.t < 0.2 && r() < 0.5) {
    m.estado = "defender";
    m.segurar.defesa = true;
    m.reacao = 0.35;
    return;
  }
  // Contra a guarda, esperar um pouco rende mais do que bater nela.
  if (o.estado === "defesa" && r() < 0.5) {
    m.estado = "hesitar";
    m.reacao = 0.25 + r() * 0.2;
    return;
  }
  if (l.recargaGolpe === 0) {
    m.estado = "atacar";
    m.pulso = "golpe";
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
  const saida: Entrada = {
    ...m.segurar,
    golpe: m.pulso === "golpe",
    interagir: m.segurar.interagir || m.pulso === "interagir",
  };
  m.pulso = null;
  return saida;
}
