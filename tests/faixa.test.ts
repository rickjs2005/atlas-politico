// Vale a Faixa (src/lib/faixa, docs/VALE-A-FAIXA.md): as regras da partida
// e o adversário do computador, sem canvas. O ciclo inteiro em simulação:
// golpes, guarda, sequência limitada, queda e levantar, a escada (pegar,
// posicionar só na zona, soltar, subir, chacoalhar, derrubar), a faixa
// puxada com o comando segurado, a vitória que dispara uma vez só, e dois
// computadores que disputam a faixa até o fim, com vitórias dos dois lados.

import { describe, expect, it } from "vitest";

import { PRIORIDADE_DAS_FALAS, falaPara } from "@/lib/faixa/falas";
import { criarMemoria, decidir, type EstadoDaIA, type MemoriaDaIA } from "@/lib/faixa/ia";
import { REGRAS, alturaNaEscada, avancar, criarPartida, dicaDe, naEscada } from "@/lib/faixa/regras";
import { ENTRADA_VAZIA, type Entrada, type Evento, type Partida } from "@/lib/faixa/tipos";

const DT = 1 / 120;
const e = (parte: Partial<Entrada> = {}): Entrada => ({ ...ENTRADA_VAZIA, ...parte });
const NADA: [Entrada, Entrada] = [e(), e()];

type Entradas = readonly [Entrada, Entrada] | ((p: Partida) => readonly [Entrada, Entrada]);

/** Avança a partida por `segundos` e devolve os eventos vistos. */
function correr(p: Partida, segundos: number, entradas: Entradas = NADA): Evento[] {
  const vistos: Evento[] = [];
  const passos = Math.round(segundos / DT);
  for (let n = 0; n < passos; n += 1) {
    avancar(p, DT, typeof entradas === "function" ? entradas(p) : entradas);
    vistos.push(...p.eventos);
  }
  return vistos;
}

/** Avança até a condição valer, ou falha depois de `limite` segundos. Devolve os eventos. */
function ate(p: Partida, condicao: (p: Partida) => boolean, limite: number, entradas: Entradas = NADA): Evento[] {
  const vistos: Evento[] = [];
  const passos = Math.round(limite / DT);
  for (let n = 0; n < passos; n += 1) {
    avancar(p, DT, typeof entradas === "function" ? entradas(p) : entradas);
    vistos.push(...p.eventos);
    if (condicao(p)) return vistos;
  }
  throw new Error(`A condição não valeu em ${limite} s. Estados: ${p.lutadores.map((l) => l.estado).join(" / ")}, escada ${p.escada.estado}.`);
}

/** Um toque: pressionado por um passo e solto no seguinte. Os eventos do passo pressionado ficam em `p.eventos`. */
function toque(p: Partida, quem: 0 | 1, tecla: keyof Entrada): void {
  const entradas: [Entrada, Entrada] = [e(), e()];
  entradas[quem] = e({ [tecla]: true });
  avancar(p, DT, entradas);
  const eventos = p.eventos;
  avancar(p, DT, NADA);
  p.eventos = [...eventos, ...p.eventos];
}

/** Uma partida com a contagem já encerrada. */
function pronta(semente = 0): Partida {
  const p = criarPartida("lula", "flavio-bolsonaro", semente);
  ate(p, (x) => x.fase === "luta", 4);
  return p;
}

const tipos = (eventos: readonly Evento[]) => eventos.map((evento) => evento.tipo);

describe("a partida", () => {
  it("começa com os dois afastados, olhando um para o outro, a escada caída em uma lateral e a contagem", () => {
    const p = criarPartida("lula", "flavio-bolsonaro", 0);
    expect(p.fase).toBe("contagem");
    expect(p.lutadores[0].x).toBeLessThan(0);
    expect(p.lutadores[1].x).toBeGreaterThan(0);
    expect(p.lutadores[0].direcao).toBe(1);
    expect(p.lutadores[1].direcao).toBe(-1);
    expect(p.escada.estado).toBe("caida");
    expect(Math.abs(p.escada.x)).toBeGreaterThan(REGRAS.escada.zona);
    expect(criarPartida("lula", "flavio-bolsonaro", 0).escada.x).toBeLessThan(0);
    expect(criarPartida("lula", "flavio-bolsonaro", 1).escada.x).toBeGreaterThan(0);
  });

  it("a contagem termina uma vez e abre a luta; durante ela ninguém age", () => {
    const p = criarPartida("lula", "flavio-bolsonaro", 0);
    const eventos = correr(p, 1, [e({ golpe: true, direita: true }), e()]);
    expect(p.fase).toBe("contagem");
    expect(p.lutadores[0].estado).toBe("parado");
    expect(p.lutadores[0].x).toBe(-170);
    expect(eventos).toEqual([]);
    const abertura = correr(p, 3);
    expect(p.fase).toBe("luta");
    expect(tipos(abertura).filter((tipo) => tipo === "inicio")).toHaveLength(1);
  });

  it("andar move na velocidade das regras, igual para os dois, e para nas cordas", () => {
    const p = pronta();
    p.lutadores[0].x = -100;
    p.lutadores[1].x = 100;
    correr(p, 0.5, [e({ esquerda: true }), e({ direita: true })]);
    expect(p.lutadores[0].x).toBeCloseTo(-100 - REGRAS.velocidade * 0.5, 0);
    expect(p.lutadores[1].x).toBeCloseTo(100 + REGRAS.velocidade * 0.5, 0);
    correr(p, 3, [e({ esquerda: true }), e({ direita: true })]);
    expect(p.lutadores[0].x).toBe(-REGRAS.ringue);
    expect(p.lutadores[1].x).toBe(REGRAS.ringue);
  });
});

describe("combate", () => {
  function frenteAFrente(): Partida {
    const p = pronta();
    p.lutadores[0].x = -30;
    p.lutadores[1].x = 30;
    return p;
  }

  it("um golpe ao alcance tira equilíbrio, atordoa e recua; o mesmo golpe na guarda tira pouco", () => {
    const p = frenteAFrente();
    toque(p, 0, "golpe");
    expect(p.lutadores[0].estado).toBe("golpe");
    const eventos = ate(p, (x) => x.lutadores[1].estado === "atingido", 0.5);
    expect(tipos(eventos)).toContain("golpe");
    expect(p.lutadores[1].equilibrio).toBeCloseTo(REGRAS.equilibrio - REGRAS.golpe.dano, 0);
    expect(p.lutadores[1].vx).toBeGreaterThan(0);
    ate(p, (x) => x.lutadores[0].estado === "parado" && x.lutadores[1].estado === "parado", 1);
    expect(p.lutadores[1].x).toBeGreaterThan(30);

    const q = frenteAFrente();
    correr(q, 0.1, [e(), e({ defesa: true })]);
    expect(q.lutadores[1].estado).toBe("defesa");
    const entradas: [Entrada, Entrada] = [e({ golpe: true }), e({ defesa: true })];
    avancar(q, DT, entradas);
    const bloqueio = correr(q, 0.5, [e(), e({ defesa: true })]);
    const golpe = bloqueio.find((evento) => evento.tipo === "golpe");
    expect(golpe).toMatchObject({ bloqueado: true });
    expect(q.lutadores[1].equilibrio).toBeGreaterThan(REGRAS.equilibrio - REGRAS.golpe.danoBloqueado - 0.01);
    expect(q.lutadores[1].equilibrio).toBeLessThan(REGRAS.equilibrio - REGRAS.golpe.danoBloqueado + 2);
    expect(q.lutadores[1].estado).toBe("defesa");
  });

  it("o golpe de costas e o golpe de longe não pegam", () => {
    const p = frenteAFrente();
    p.lutadores[1].x = p.lutadores[0].x + REGRAS.alcance + 30;
    toque(p, 0, "golpe");
    const longe = correr(p, 0.6);
    expect(tipos(longe)).toContain("golpeNoVazio");
    expect(tipos(longe)).not.toContain("golpe");
    expect(p.lutadores[1].equilibrio).toBe(REGRAS.equilibrio);
  });

  it("o terceiro golpe seguido afasta mais e dá proteção breve: sem sequência infinita", () => {
    const p = frenteAFrente();
    let afastamentos: number[] = [];
    for (let n = 1; n <= 3; n += 1) {
      p.lutadores[0].x = -30;
      p.lutadores[1].x = 30;
      p.lutadores[1].vx = 0;
      p.lutadores[1].equilibrio = 100;
      toque(p, 0, "golpe");
      ate(p, (x) => x.eventos.some((evento) => evento.tipo === "golpe"), 0.5);
      afastamentos = [...afastamentos, p.lutadores[1].vx];
      if (n < 3) expect(p.lutadores[1].invulneravel).toBe(0);
      ate(p, (x) => x.lutadores[0].estado === "parado" && x.lutadores[0].recargaGolpe === 0, 1);
    }
    expect(afastamentos[2]!).toBeGreaterThan(afastamentos[0]! * 1.5);
    expect(p.lutadores[1].invulneravel).toBeGreaterThan(0);
    expect(p.lutadores[0].sequencia).toBe(0);
  });

  it("ao zerar o equilíbrio o lutador cai, não leva golpe no chão, levanta protegido e volta", () => {
    const p = frenteAFrente();
    p.lutadores[1].equilibrio = 10;
    toque(p, 0, "golpe");
    const eventos = ate(p, (x) => x.lutadores[1].estado === "caido", 0.5);
    expect(tipos(eventos)).toContain("queda");
    expect(p.lutadores[1].quedas).toBe(1);

    // Golpe em quem está caído: no vazio.
    ate(p, (x) => x.lutadores[0].estado === "parado" && x.lutadores[0].recargaGolpe === 0, 1);
    p.lutadores[0].x = p.lutadores[1].x - 40;
    toque(p, 0, "golpe");
    const noChao = correr(p, 0.5);
    expect(tipos(noChao)).toContain("golpeNoVazio");
    expect(p.lutadores[1].estado).toBe("caido");

    ate(p, (x) => x.lutadores[1].estado === "levantando", REGRAS.caido + 0.1);
    expect(p.lutadores[1].invulneravel).toBeGreaterThan(0);
    expect(p.lutadores[1].equilibrio).toBeGreaterThanOrEqual(REGRAS.equilibrioAoLevantar);
    const volta = ate(p, (x) => x.lutadores[1].estado === "parado", REGRAS.levantando + 0.1);
    expect(tipos(volta)).toContain("levantou");
  });

  it("o empurrão não se bloqueia, afasta muito e tira pouco", () => {
    const p = frenteAFrente();
    const eventos = ate(p, (x) => x.eventos.some((evento) => evento.tipo === "empurrao"), 1, (x) => [e({ empurrao: x.lutadores[0].estado === "parado" }), e({ defesa: true })]);
    expect(tipos(eventos)).toContain("empurrao");
    expect(p.lutadores[1].equilibrio).toBeCloseTo(REGRAS.equilibrio - REGRAS.empurrao.dano / 2, 0);
    expect(p.lutadores[1].vx).toBeGreaterThan(REGRAS.golpe.recuo);
  });

  it("quem bate forte nas cordas volta e perde um pouco de equilíbrio", () => {
    const p = pronta();
    p.lutadores[0].x = REGRAS.ringue - 90;
    p.lutadores[1].x = REGRAS.ringue - 30;
    const eventos = ate(p, (x) => x.eventos.some((evento) => evento.tipo === "cordas"), 1.5, (x) => [e({ empurrao: x.lutadores[0].estado === "parado" }), e()]);
    expect(tipos(eventos)).toContain("empurrao");
    expect(p.lutadores[1].equilibrio).toBeLessThan(REGRAS.equilibrio - REGRAS.empurrao.dano);
    expect(p.lutadores[1].x).toBeLessThanOrEqual(REGRAS.ringue);
  });

  it("os dois em pé nunca ocupam o mesmo lugar", () => {
    const p = pronta();
    p.lutadores[0].x = 0;
    p.lutadores[1].x = 10;
    correr(p, 0.1);
    expect(p.lutadores[1].x - p.lutadores[0].x).toBeGreaterThanOrEqual(REGRAS.corpo - 0.01);
  });
});

describe("a escada e a faixa", () => {
  it("é pega perto dela, fica em pé só na zona sob a faixa e é solta fora dela", () => {
    const p = pronta(0);
    const esc = p.escada;
    expect(dicaDe(p, 0)).toBeNull();
    p.lutadores[0].x = esc.x + 40;
    expect(dicaDe(p, 0)).toBe("pegarEscada");
    toque(p, 0, "interagir");
    expect(p.lutadores[0].estado).toBe("carregando");
    expect(esc.estado).toBe("carregada");
    expect(esc.portador).toBe(0);
    expect(tipos(p.eventos)).toContain("escadaPega");

    // Carregando: a escada acompanha, mais devagar, e não dá para atacar.
    correr(p, 0.5, [e({ direita: true, golpe: true }), e()]);
    expect(p.lutadores[0].estado).toBe("carregando");
    expect(p.lutadores[0].x).toBeCloseTo(-290 + REGRAS.velocidadeCarregando * 0.5, 0);
    expect(esc.x).toBe(p.lutadores[0].x);

    // Fora da zona, o comando solta.
    p.lutadores[0].x = -200;
    expect(dicaDe(p, 0)).toBe("soltarEscada");
    toque(p, 0, "interagir");
    expect(esc.estado).toBe("caida");
    expect(p.lutadores[0].estado).toBe("parado");
    expect(tipos(p.eventos)).toContain("escadaSolta");
    expect(Math.abs(esc.x - -200)).toBeLessThanOrEqual(REGRAS.escada.pegar);

    // Pega de novo, leva até a zona e põe em pé exatamente onde está.
    toque(p, 0, "interagir");
    expect(esc.estado).toBe("carregada");
    p.lutadores[0].x = REGRAS.escada.zona - 5;
    expect(dicaDe(p, 0)).toBe("posicionarEscada");
    toque(p, 0, "interagir");
    expect(esc.estado).toBe("emPe");
    expect(esc.x).toBe(REGRAS.escada.zona - 5);
    expect(tipos(p.eventos)).toContain("escadaPosta");
    expect(dicaDe(p, 0)).toBe("subir");
  });

  it("subir até o topo, puxar com o comando segurado e vencer: uma vez só, e nada mais muda depois", () => {
    const p = pronta();
    p.escada.estado = "emPe";
    p.escada.x = 0;
    p.lutadores[0].x = -20;
    p.lutadores[1].x = 300;
    toque(p, 0, "interagir");
    expect(p.lutadores[0].estado).toBe("subindo");
    expect(tipos(p.eventos)).toContain("subida");

    const subida = ate(p, (x) => x.lutadores[0].estado === "noTopo", 2, [e({ cima: true }), e()]);
    expect(tipos(subida)).toContain("topo");
    expect(p.lutadores[0].y).toBeCloseTo(alturaNaEscada(1), 1);
    expect(dicaDe(p, 0)).toBe("puxarFaixa");

    // Sem segurar, nada avança.
    correr(p, 0.3);
    expect(p.lutadores[0].puxada).toBe(0);

    // Com a escada balançando, o comando é registrado, mas não avança.
    p.escada.balanco = 1;
    const tentativa = correr(p, 0.3, [e({ interagir: true }), e()]);
    expect(tipos(tentativa)).toContain("puxando");
    expect(p.lutadores[0].puxada).toBe(0);
    expect(dicaDe(p, 0)).toBe("foraDoAlcance");
    p.escada.balanco = 0;

    const eventos = correr(p, 2.5, [e({ interagir: true }), e()]);
    expect(tipos(eventos).filter((tipo) => tipo === "vitoria")).toHaveLength(1);
    expect(p.fase).toBe("fim");
    expect(p.vencedor).toBe(0);
    expect(p.lutadores[0].estado).toBe("vitoria");
    expect(p.lutadores[1].estado).toBe("derrota");

    const depois = correr(p, 2, [e({ interagir: true, golpe: true, direita: true }), e({ golpe: true, esquerda: true })]);
    expect(tipos(depois)).toEqual([]);
    expect(p.lutadores[0].estado).toBe("vitoria");
    expect(p.lutadores[1].estado).toBe("derrota");
    expect(p.lutadores[1].x).toBe(300);
  });

  it("descer leva de volta ao tapete, e ninguém sobe enquanto o outro está na escada", () => {
    const p = pronta();
    p.escada.estado = "emPe";
    p.escada.x = 0;
    p.lutadores[0].x = -20;
    p.lutadores[1].x = 20;
    toque(p, 0, "interagir");
    correr(p, 0.5, [e({ cima: true }), e()]);
    expect(p.lutadores[0].altura).toBeGreaterThan(0.3);
    expect(dicaDe(p, 1)).toBeNull();
    toque(p, 1, "interagir");
    expect(p.lutadores[1].estado).toBe("parado");
    ate(p, (x) => x.lutadores[0].estado === "parado", 1, [e({ baixo: true }), e()]);
    expect(p.lutadores[0].y).toBe(0);
    expect(dicaDe(p, 1)).toBe("subir");
  });

  it("um empurrão na base derruba a escada: quem sobe cai, perde parte do que puxou, e a escada acaba caída", () => {
    const p = pronta();
    p.escada.estado = "emPe";
    p.escada.x = 0;
    p.lutadores[0].x = -20;
    p.lutadores[1].x = 70;
    toque(p, 0, "interagir");
    ate(p, (x) => x.lutadores[0].estado === "noTopo", 2, [e({ cima: true }), e()]);
    p.lutadores[0].puxada = 0.5;

    const eventos = ate(p, (x) => x.lutadores[0].estado === "caindoDaEscada", 1, (x) => [e(), e({ empurrao: x.lutadores[1].estado === "parado" })]);
    expect(tipos(eventos)).toEqual(expect.arrayContaining(["empurrao", "interrompido", "caiuDaEscada"]));
    // Metade puxada, menos o que escorreu enquanto não puxava, menos a perda da queda.
    expect(p.lutadores[0].puxada).toBeLessThanOrEqual(0.5 * (1 - REGRAS.faixa.perdaAoCair) + 1e-6);
    expect(p.lutadores[0].puxada).toBeGreaterThan(0.45 * (1 - REGRAS.faixa.perdaAoCair));
    expect(p.escada.estado).toBe("caindo");

    const chao = ate(p, (x) => x.escada.estado === "caida" && x.lutadores[0].estado === "caido", 2);
    expect(tipos(chao)).toContain("escadaCaiu");
    expect(tipos(chao)).toContain("queda");
    expect(p.lutadores[0].y).toBe(0);
    // A escada tombou para longe de quem empurrou e ficou dentro do alcance de ser pega de novo.
    expect(p.escada.x).toBeLessThan(0);
    ate(p, (x) => x.lutadores[0].estado === "parado", 3);
  });

  it("três golpes na base chacoalham a escada e derrubam quem está subindo; o que puxou se perde em parte", () => {
    const p = pronta();
    p.escada.estado = "emPe";
    p.escada.x = 0;
    p.lutadores[0].x = -20;
    p.lutadores[1].x = 60;
    toque(p, 0, "interagir");
    correr(p, 0.6, [e({ cima: true }), e()]);
    expect(naEscada(p.lutadores[0])).toBe(true);
    p.lutadores[0].puxada = 0.2;

    let chacoalhadas = 0;
    const eventos = ate(
      p,
      (x) => x.lutadores[0].estado === "caindoDaEscada",
      4,
      (x) => [e(), e({ golpe: x.lutadores[1].estado === "parado" && x.lutadores[1].recargaGolpe === 0 })],
    );
    chacoalhadas = eventos.filter((evento) => evento.tipo === "escadaChacoalhada").length;
    expect(chacoalhadas).toBe(3);
    expect(tipos(eventos)).toContain("interrompido");
    expect(p.lutadores[0].puxada).toBeCloseTo(0.2 * (1 - REGRAS.faixa.perdaAoCair), 5);
    // A escada continua em pé: só o empurrão a derruba.
    expect(p.escada.estado).toBe("emPe");
  });

  it("um golpe em quem carrega a escada a derruba no lugar", () => {
    const p = pronta(0);
    p.lutadores[0].x = p.escada.x;
    toque(p, 0, "interagir");
    expect(p.lutadores[0].estado).toBe("carregando");
    p.lutadores[1].x = p.lutadores[0].x + 50;
    const eventos = ate(p, (x) => x.lutadores[0].estado === "atingido", 1, (x) => [e(), e({ golpe: x.lutadores[1].estado === "parado" })]);
    expect(tipos(eventos)).toContain("escadaSolta");
    expect(p.escada.estado).toBe("caida");
    expect(p.escada.portador).toBeNull();
  });
});

describe("o computador", () => {
  interface Resultado {
    semente: number;
    vencedor: 0 | 1 | null;
    tempo: number;
    estados: Set<EstadoDaIA>;
    erros: number;
  }

  /** Dois computadores, um contra o outro, até o fim ou até `limite` segundos, conferindo os invariantes a cada passo. */
  function simular(semente: number, limite = 150, descuido = 0.14): Resultado {
    const p = criarPartida("lula", "flavio-bolsonaro", semente);
    const memorias: [MemoriaDaIA, MemoriaDaIA] = [criarMemoria(semente * 7919 + 1, descuido), criarMemoria(semente * 104729 + 2, descuido)];
    const estados = new Set<EstadoDaIA>();
    const passos = Math.round(limite / DT);
    const limites: Partial<Record<Partida["lutadores"][0]["estado"], number>> = { caido: REGRAS.caido + 0.05, atingido: REGRAS.atingido + 0.05, levantando: REGRAS.levantando + 0.05, golpe: 0.5, empurrao: 0.9, caindoDaEscada: 1.5 };
    // Os invariantes são conferidos a cada passo sem `expect`, que é caro demais para milhares de passos: a primeira violação derruba o teste.
    const violacoes: string[] = [];
    const conferir = (vale: boolean, mensagem: string) => {
      if (!vale && violacoes.length < 5) violacoes.push(`semente ${semente}, ${p.tempo.toFixed(2)} s: ${mensagem}`);
    };
    for (let n = 0; n < passos && p.fase !== "fim"; n += 1) {
      const entradas: [Entrada, Entrada] = [decidir(p, 0, memorias[0], DT), decidir(p, 1, memorias[1], DT)];
      avancar(p, DT, entradas);
      for (const m of memorias) estados.add(m.estado);
      for (const l of p.lutadores) {
        // Combinações impossíveis.
        if (l.estado === "carregando" || l.estado === "golpe" || l.estado === "empurrao" || l.estado === "defesa") conferir(l.y === 0, `${l.estado} fora do chão`);
        if (l.estado === "caido") conferir(!naEscada(l), "caído na escada");
        const maximo = limites[l.estado];
        if (maximo !== undefined) conferir(l.t <= maximo, `${l.estado} preso há ${l.t.toFixed(2)} s`);
        conferir(Math.abs(l.x) <= REGRAS.ringue + 0.01, "fora do ringue");
      }
      conferir((p.escada.portador !== null) === (p.escada.estado === "carregada"), "portador e estado da escada divergem");
      if (p.escada.estado === "caindo") conferir(p.escada.queda <= 1, "queda da escada passou de 1");
      conferir(p.eventos.filter((evento) => evento.tipo === "vitoria").length <= 1, "vitória dupla");
    }
    expect(violacoes).toEqual([]);
    return { semente, vencedor: p.vencedor, tempo: p.tempo, estados, erros: memorias[0].erros + memorias[1].erros };
  }

  // Dez partidas inteiras, passo a passo: em máquina ocupada leva mais do que o prazo padrão.
  it("dois computadores disputam a faixa até o fim, com vitórias dos dois lados, erros propositais e todos os estados da IA", { timeout: 60_000 }, () => {
    const resultados = Array.from({ length: 10 }, (_, semente) => simular(semente + 1));
    for (const resultado of resultados) {
      expect(resultado.vencedor, `semente ${resultado.semente} sem vencedor em ${resultado.tempo.toFixed(0)} s`).not.toBeNull();
      expect(resultado.erros).toBeGreaterThan(0);
    }
    const vencedores = new Set(resultados.map((resultado) => resultado.vencedor));
    expect(vencedores).toEqual(new Set([0, 1]));
    const estados = new Set(resultados.flatMap((resultado) => [...resultado.estados]));
    for (const estado of ["aproximar", "atacar", "defender", "recuperar", "buscarEscada", "posicionar", "subir", "disputarFaixa", "interromper"] as const) {
      expect(estados.has(estado), `estado ${estado} nunca aconteceu`).toBe(true);
    }
    const media = resultados.reduce((soma, resultado) => soma + resultado.tempo, 0) / resultados.length;
    expect(media).toBeGreaterThan(10);
    expect(media).toBeLessThan(120);
  });

  it("contra quem não faz nada, o computador vence sozinho: busca a escada, posiciona, sobe e puxa", { timeout: 30_000 }, () => {
    const p = criarPartida("lula", "flavio-bolsonaro", 3);
    const m = criarMemoria(11, 0.14);
    const estados = new Set<EstadoDaIA>();
    ate(
      p,
      (x) => x.fase === "fim",
      60,
      (x) => {
        const entrada = decidir(x, 1, m, DT);
        estados.add(m.estado);
        return [e(), entrada];
      },
    );
    expect(p.vencedor).toBe(1);
    expect([...estados]).toEqual(expect.arrayContaining(["buscarEscada", "posicionar", "subir", "disputarFaixa"]));
  });

  it("é determinístico pela semente", { timeout: 30_000 }, () => {
    const a = simular(5, 60);
    const b = simular(5, 60);
    expect(a.vencedor).toBe(b.vencedor);
    expect(a.tempo).toBe(b.tempo);
  });
});

describe("as falas", () => {
  it("há uma fala para os eventos marcantes, nenhuma para os de rotina, e a prioridade só lista eventos com fala", () => {
    expect(falaPara("queda", 0)).toBe("A governabilidade ficou no chão!");
    expect(falaPara("subida", 0)).toBe("Está subindo nas pesquisas… e na escada!");
    expect(falaPara("puxando", 0)).toBe("A faixa está por um fio!");
    expect(falaPara("golpeNoVazio", 0.5)).toBeNull();
    expect(falaPara("golpe", 0.5)).toBeNull();
    for (const tipo of PRIORIDADE_DAS_FALAS) expect(falaPara(tipo, 0.99), tipo).not.toBeNull();
  });
});
