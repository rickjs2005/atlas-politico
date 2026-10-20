// Vale a Faixa (src/lib/faixa, docs/VALE-A-FAIXA.md): as regras da partida
// e o adversário do computador, sem canvas. O ciclo inteiro em simulação:
// caminhada com aceleração, pulo e voadora, a sequência de golpes, o golpe
// forte, a guarda, a esquiva, a tolerância de entrada, queda e levantar, a
// escada (pegar, posicionar só na zona, largar, subir pela seta, derrubar
// com o ataque contextual), a faixa puxada com o comando segurado por perto
// de 8 s, a perda parcial na interrupção, a vitória que dispara uma vez só,
// e dois computadores que disputam a faixa até o fim, com vitórias dos dois
// lados.

import { describe, expect, it } from "vitest";

import { createLoop } from "@/features/game/engine/loop";
import { PRIORIDADE_DAS_FALAS, falaPara } from "@/lib/faixa/falas";
import { DIFICULDADES, criarMemoria, decidir, type Dificuldade, type EstadoDaIA, type MemoriaDaIA, type PerfilDaIA } from "@/lib/faixa/ia";
import { REGRAS, alturaNaEscada, avancar, criarPartida, dicaDe, golpeDe, naEscada } from "@/lib/faixa/regras";
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

/** Um toque: pressionado por um passo e solto no seguinte. Os eventos dos dois passos ficam em `p.eventos`. */
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

/** Os dois frente a frente, a `distancia` um do outro. */
function frenteAFrente(distancia = 60): Partida {
  const p = pronta();
  p.lutadores[0].x = -distancia / 2;
  p.lutadores[1].x = distancia / 2;
  return p;
}

/** A escada em pé no centro, com o jogador ao lado e o computador longe. */
function escadaEmPe(xDoComputador = 300): Partida {
  const p = pronta();
  p.escada.estado = "emPe";
  p.escada.x = 0;
  p.lutadores[0].x = -20;
  p.lutadores[1].x = xDoComputador;
  return p;
}

const tipos = (eventos: readonly Evento[]) => eventos.map((evento) => evento.tipo);
const SEGURANDO_CIMA: [Entrada, Entrada] = [e({ cima: true }), e()];

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
    const eventos = correr(p, 1, [e({ golpe: true, direita: true, pulo: true }), e()]);
    expect(p.fase).toBe("contagem");
    expect(p.lutadores[0].estado).toBe("parado");
    expect(p.lutadores[0].x).toBe(-170);
    expect(eventos).toEqual([]);
    const abertura = correr(p, 3);
    expect(p.fase).toBe("luta");
    expect(tipos(abertura).filter((tipo) => tipo === "inicio")).toHaveLength(1);
  });
});

describe("mobilidade", () => {
  it("andar acelera e freia em instantes curtos, chega à velocidade das regras, igual para os dois, e para nas cordas", () => {
    const p = pronta();
    p.lutadores[0].x = -100;
    p.lutadores[1].x = 100;
    correr(p, 0.04, [e({ esquerda: true }), e({ direita: true })]);
    expect(Math.abs(p.lutadores[0].vel)).toBeGreaterThan(40);
    expect(Math.abs(p.lutadores[0].vel)).toBeLessThan(REGRAS.velocidade);
    correr(p, 0.2, [e({ esquerda: true }), e({ direita: true })]);
    expect(p.lutadores[0].vel).toBeCloseTo(-REGRAS.velocidade, 0);
    expect(p.lutadores[1].vel).toBeCloseTo(REGRAS.velocidade, 0);
    expect(p.lutadores[0].estado).toBe("andando");
    const x = p.lutadores[0].x;
    correr(p, 0.12);
    expect(p.lutadores[0].vel).toBe(0);
    expect(p.lutadores[0].estado).toBe("parado");
    // Freou em menos de 15 unidades.
    expect(Math.abs(p.lutadores[0].x - x)).toBeLessThan(15);
    correr(p, 3, [e({ esquerda: true }), e({ direita: true })]);
    expect(p.lutadores[0].x).toBe(-REGRAS.ringue);
    expect(p.lutadores[1].x).toBe(REGRAS.ringue);
  });

  it("o pulo sobe com impulso, cai com gravidade, aterrissa no tapete e não repete no ar", () => {
    const p = frenteAFrente(300);
    toque(p, 0, "pulo");
    const l = p.lutadores[0];
    expect(l.estado).toBe("pulando");
    expect(tipos(p.eventos)).toContain("pulo");
    let maximo = 0;
    const eventos = ate(
      p,
      (x) => x.lutadores[0].estado === "aterrissando",
      1.5,
      (x) => {
        maximo = Math.max(maximo, x.lutadores[0].y);
        // No ar, outro Espaço não pula de novo.
        return [e({ pulo: x.lutadores[0].t > 0.2 && x.lutadores[0].t < 0.22 }), e()];
      },
    );
    expect(maximo).toBeGreaterThan(80);
    expect(maximo).toBeLessThan(110);
    expect(tipos(eventos)).toContain("aterrissagem");
    expect(tipos(eventos).filter((tipo) => tipo === "pulo")).toHaveLength(0);
    expect(eventos.some((evento) => evento.tipo === "acaoBloqueada" && evento.motivo === "noAr")).toBe(true);
    expect(l.y).toBe(0);
    ate(p, (x) => x.lutadores[0].estado === "parado", 0.3);
    // Pulando em movimento, leva a velocidade junto.
    correr(p, 0.3, [e({ direita: true }), e()]);
    const xAntes = l.x;
    avancar(p, DT, [e({ direita: true, pulo: true }), e()]);
    ate(p, (x) => x.lutadores[0].estado === "aterrissando", 1.5, [e({ direita: true }), e()]);
    expect(l.x - xAntes).toBeGreaterThan(120);
  });

  it("a esquiva dá um passo curto, protege no começo e tem recarga", () => {
    const p = frenteAFrente(70);
    const xAntes = p.lutadores[0].x;
    toque(p, 0, "esquiva");
    expect(p.lutadores[0].estado).toBe("esquiva");
    expect(tipos(p.eventos)).toContain("esquiva");
    // Um golpe do adversário no começo da esquiva não pega.
    toque(p, 1, "golpe");
    const eventos = ate(p, (x) => x.lutadores[0].estado === "parado" && x.lutadores[1].estado === "parado", 1.5);
    expect(tipos(eventos)).toContain("golpeNoVazio");
    expect(tipos(eventos)).not.toContain("golpe");
    expect(p.lutadores[0].equilibrio).toBe(REGRAS.equilibrio);
    expect(xAntes - p.lutadores[0].x).toBeGreaterThan(REGRAS.esquiva.distancia * 0.8);
    // Logo depois, outra esquiva não sai: recarga.
    toque(p, 0, "esquiva");
    expect(p.lutadores[0].estado).toBe("parado");
    expect(p.eventos.some((evento) => evento.tipo === "acaoBloqueada" && evento.motivo === "recarga")).toBe(true);
  });

  it("um comando apertado um instante antes de ficar livre sai em seguida; uma queda apaga o que estava guardado", () => {
    const p = frenteAFrente(300);
    toque(p, 0, "golpe");
    // Espaço na recuperação do golpe fica guardado e o pulo sai quando o golpe acaba.
    const eventos = ate(p, (x) => x.lutadores[0].estado === "pulando", 1, (x) => [e({ pulo: x.lutadores[0].estado === "golpe" && x.lutadores[0].t > 0.3 && x.lutadores[0].t < 0.32 }), e()]);
    expect(tipos(eventos)).toContain("pulo");
    // Agora, um aperto guardado e uma queda no meio: nada sai depois.
    const q = frenteAFrente();
    q.lutadores[0].equilibrio = 10;
    toque(q, 1, "golpe");
    const depois = ate(q, (x) => x.lutadores[0].quedas > 0 && x.lutadores[0].estado === "parado" && x.lutadores[0].t > 0.3, 5, (x) => [e({ pulo: x.lutadores[0].estado === "atingido" || x.lutadores[0].estado === "caido" }), e()]);
    expect(tipos(depois)).toContain("queda");
    expect(tipos(depois)).not.toContain("pulo");
  });
});

describe("combate", () => {
  it("um golpe ao alcance tira equilíbrio, atordoa e recua; o mesmo golpe na guarda tira pouco; soltar a guarda desfaz", () => {
    const p = frenteAFrente();
    toque(p, 0, "golpe");
    expect(p.lutadores[0].estado).toBe("golpe");
    expect(p.lutadores[0].golpeDaSequencia).toBe(1);
    const eventos = ate(p, (x) => x.lutadores[1].estado === "atingido", 0.5);
    const golpe = eventos.find((evento) => evento.tipo === "golpe");
    expect(golpe).toMatchObject({ golpe: "soco", bloqueado: false });
    expect(p.lutadores[1].equilibrio).toBeCloseTo(REGRAS.equilibrio - REGRAS.golpes[0].dano, 0);
    expect(p.lutadores[1].vx).toBeGreaterThan(0);
    ate(p, (x) => x.lutadores[0].estado === "parado" && x.lutadores[1].estado === "parado", 1);
    expect(p.lutadores[1].x).toBeGreaterThan(30);

    const q = frenteAFrente();
    correr(q, 0.1, [e(), e({ defesa: true })]);
    expect(q.lutadores[1].estado).toBe("defesa");
    avancar(q, DT, [e({ golpe: true }), e({ defesa: true })]);
    const bloqueio = correr(q, 0.5, [e(), e({ defesa: true })]);
    expect(bloqueio.find((evento) => evento.tipo === "golpe")).toMatchObject({ bloqueado: true });
    expect(q.lutadores[1].equilibrio).toBeGreaterThan(REGRAS.equilibrio - REGRAS.danoBloqueado - 0.01);
    expect(q.lutadores[1].equilibrio).toBeLessThan(REGRAS.equilibrio - REGRAS.danoBloqueado + 2);
    expect(q.lutadores[1].estado).toBe("defesa");
    correr(q, 0.05);
    expect(q.lutadores[1].estado).toBe("parado");
  });

  it("o golpe de costas e o golpe de longe não pegam, e um ataque só acerta uma vez", () => {
    const p = frenteAFrente();
    p.lutadores[1].x = p.lutadores[0].x + REGRAS.alcance + 30;
    toque(p, 0, "golpe");
    const longe = correr(p, 0.6);
    expect(tipos(longe)).toContain("golpeNoVazio");
    expect(tipos(longe)).not.toContain("golpe");
    expect(p.lutadores[1].equilibrio).toBe(REGRAS.equilibrio);
    const q = frenteAFrente();
    toque(q, 0, "golpe");
    const acertos = correr(q, 0.6).filter((evento) => evento.tipo === "golpe");
    expect(acertos).toHaveLength(1);
  });

  it("apertar de novo durante o golpe emenda soco, direto e chute; o chute afasta mais, derruba por mais tempo e dá proteção breve", () => {
    const p = frenteAFrente(REGRAS.corpo + 2);
    const recuos: number[] = [];
    toque(p, 0, "golpe");
    const eventos = ate(
      p,
      (x) => x.lutadores[0].estado === "parado" && x.lutadores[0].golpeDaSequencia === 3 && x.lutadores[0].t > 0.01,
      3,
      (x) => {
        const l = x.lutadores[0];
        for (const evento of x.eventos) if (evento.tipo === "golpe" && !evento.bloqueado) recuos.push(x.lutadores[1].vx);
        const emendar = l.estado === "golpe" && l.t >= golpeDe(l).antecipacao + golpeDe(l).ativo && !l.proximoGolpe && l.golpeDaSequencia < 3 && !l.anterior.golpe;
        return [e({ golpe: emendar }), e()];
      },
    );
    const acertos = eventos.filter((evento): evento is Extract<Evento, { tipo: "golpe" }> => evento.tipo === "golpe" && !evento.bloqueado);
    expect(acertos.map((evento) => evento.golpe)).toEqual(["soco", "direto", "chute"]);
    expect(acertos.map((evento) => evento.forte)).toEqual([false, false, true]);
    expect(recuos[2]!).toBeGreaterThan(recuos[0]! * 1.5);
    expect(p.lutadores[1].invulneravel).toBeGreaterThan(0);
    correr(p, REGRAS.janelaDaSequencia + 0.1);
    expect(p.lutadores[0].golpeDaSequencia).toBe(0);
    // Quem leva o chute com pouco equilíbrio fica mais tempo no chão.
    const q = frenteAFrente(REGRAS.corpo + 2);
    q.lutadores[1].equilibrio = 15;
    q.lutadores[0].golpeDaSequencia = 2;
    q.lutadores[0].desdeOUltimoGolpe = 0;
    toque(q, 0, "golpe");
    expect(q.lutadores[0].golpeDaSequencia).toBe(3);
    const queda = ate(q, (x) => x.lutadores[1].estado === "caido", 1);
    expect(queda.find((evento) => evento.tipo === "queda")).toMatchObject({ longa: true });
    expect(q.lutadores[1].tempoCaido).toBe(REGRAS.caidoLongo);
  });

  it("o golpe forte prepara devagar, bate forte, derruba por mais tempo e deixa quem bateu exposto", () => {
    const p = frenteAFrente();
    toque(p, 0, "forte");
    expect(p.lutadores[0].estado).toBe("forte");
    // Durante a preparação, o adversário acerta primeiro.
    correr(p, 0.1);
    expect(p.lutadores[1].estado).toBe("parado");
    const eventos = ate(p, (x) => x.lutadores[1].estado === "atingido" || x.lutadores[1].estado === "caido", 1);
    expect(eventos.find((evento) => evento.tipo === "golpe")).toMatchObject({ golpe: "forte", forte: true });
    expect(p.lutadores[1].equilibrio).toBeCloseTo(REGRAS.equilibrio - REGRAS.forte.dano, 0);
    expect(p.lutadores[0].estado).toBe("forte");
    // A recuperação é longa: o outro já voltou e o forte ainda não.
    ate(p, (x) => x.lutadores[1].estado === "parado", 1);
    expect(p.lutadores[0].estado).toBe("forte");
    ate(p, (x) => x.lutadores[0].estado === "parado", 1);
    expect(p.lutadores[0].recargaForte).toBeGreaterThan(0);
    // Na guarda, de uma distância em que o agarrão não alcança mas o forte sim, tira mais do que um soco e empurra.
    const q = frenteAFrente(REGRAS.agarrao.alcance + 12);
    correr(q, 0.1, [e(), e({ defesa: true })]);
    avancar(q, DT, [e({ forte: true }), e({ defesa: true })]);
    const bloqueio = correr(q, 0.6, [e(), e({ defesa: true })]);
    expect(bloqueio.find((evento) => evento.tipo === "golpe")).toMatchObject({ golpe: "forte", bloqueado: true });
    expect(q.lutadores[1].equilibrio).toBeLessThan(REGRAS.equilibrio - REGRAS.forte.danoBloqueado + 2);
  });

  it("a voadora sai uma vez por salto, acerta só no trecho ativo, empurra, pode ser defendida, e a aterrissagem é longa", () => {
    const p = frenteAFrente(150);
    avancar(p, DT, [e({ direita: true, pulo: true }), e()]);
    expect(p.lutadores[0].estado).toBe("pulando");
    correr(p, 0.05, [e({ direita: true }), e()]);
    avancar(p, DT, [e({ direita: true, golpe: true }), e()]);
    expect(p.lutadores[0].estado).toBe("voadora");
    expect(tipos(p.eventos)).toContain("voadora");
    let recuoDaVoadora = 0;
    const eventos = ate(
      p,
      (x) => x.lutadores[0].estado === "aterrissando",
      1.5,
      (x) => {
        if (x.eventos.some((evento) => evento.tipo === "golpe")) recuoDaVoadora = x.lutadores[1].vx;
        return [e({ direita: true, golpe: x.lutadores[0].t > 0.15 && x.lutadores[0].t < 0.17 }), e()];
      },
    );
    expect(eventos.find((evento) => evento.tipo === "golpe")).toMatchObject({ golpe: "voadora", forte: true, bloqueado: false });
    expect(eventos.filter((evento) => evento.tipo === "golpe")).toHaveLength(1);
    expect(eventos.some((evento) => evento.tipo === "acaoBloqueada" && evento.motivo === "noAr")).toBe(true);
    expect(eventos.find((evento) => evento.tipo === "aterrissagem")).toMatchObject({ pesada: true });
    expect(p.lutadores[0].tempoDeAterrissagem).toBe(REGRAS.voadora.aterrissagem);
    expect(p.lutadores[1].equilibrio).toBeLessThan(REGRAS.equilibrio);
    expect(recuoDaVoadora).toBeGreaterThan(200);
    // A aterrissagem longa deixa quem voou exposto a um golpe.
    expect(p.lutadores[0].estado).toBe("aterrissando");
    correr(p, 0.2);
    expect(p.lutadores[0].estado).toBe("aterrissando");

    // Defendida: tira pouco.
    const q = frenteAFrente(150);
    avancar(q, DT, [e({ direita: true, pulo: true }), e({ defesa: true })]);
    correr(q, 0.05, [e({ direita: true }), e({ defesa: true })]);
    avancar(q, DT, [e({ direita: true, golpe: true }), e({ defesa: true })]);
    const defendida = ate(q, (x) => x.lutadores[0].estado === "aterrissando", 1.5, [e({ direita: true }), e({ defesa: true })]);
    expect(defendida.find((evento) => evento.tipo === "golpe")).toMatchObject({ golpe: "voadora", bloqueado: true });
    expect(q.lutadores[1].equilibrio).toBeGreaterThan(REGRAS.equilibrio - REGRAS.voadora.danoBloqueado - 1);

    // Errada: no vazio, e a aterrissagem pesada do mesmo jeito.
    const s = frenteAFrente(400);
    avancar(s, DT, [e({ pulo: true }), e()]);
    correr(s, 0.05);
    avancar(s, DT, [e({ golpe: true }), e()]);
    const errada = ate(s, (x) => x.lutadores[0].estado === "aterrissando", 1.5);
    expect(errada.find((evento) => evento.tipo === "golpeNoVazio")).toMatchObject({ golpe: "voadora" });
    expect(errada.find((evento) => evento.tipo === "aterrissagem")).toMatchObject({ pesada: true });
  });

  it("ao zerar o equilíbrio o lutador cai, não leva golpe no chão, levanta protegido e volta", () => {
    const p = frenteAFrente();
    p.lutadores[1].equilibrio = 10;
    toque(p, 0, "golpe");
    const eventos = ate(p, (x) => x.lutadores[1].estado === "caido", 0.5);
    expect(tipos(eventos)).toContain("queda");
    expect(p.lutadores[1].quedas).toBe(1);
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

  it("soltar a guarda e apertar uma ação no mesmo instante: a ação sai no passo seguinte, em vez de se perder", () => {
    const p = frenteAFrente(300);
    correr(p, 0.1, [e({ defesa: true }), e()]);
    expect(p.lutadores[0].estado).toBe("defesa");
    avancar(p, DT, [e({ pulo: true }), e()]);
    expect(p.lutadores[0].estado).toBe("parado");
    avancar(p, DT, [e(), e()]);
    expect(p.lutadores[0].estado).toBe("pulando");
  });

  it("quem bate forte nas cordas volta e perde um pouco de equilíbrio; os dois em pé nunca ocupam o mesmo lugar", () => {
    const p = pronta();
    p.lutadores[0].x = REGRAS.ringue - 200;
    p.lutadores[1].x = REGRAS.ringue - 30;
    p.lutadores[1].vx = 700;
    const eventos = correr(p, 0.5);
    expect(tipos(eventos)).toContain("cordas");
    expect(p.lutadores[1].equilibrio).toBeLessThan(REGRAS.equilibrio);
    expect(p.lutadores[1].x).toBeLessThanOrEqual(REGRAS.ringue);
    const q = pronta();
    q.lutadores[0].x = 0;
    q.lutadores[1].x = 10;
    correr(q, 0.1);
    expect(q.lutadores[1].x - q.lutadores[0].x).toBeGreaterThanOrEqual(REGRAS.corpo - 0.01);
  });
});

describe("o agarrão", () => {
  const DEFENDENDO: [Entrada, Entrada] = [e(), e({ defesa: true })];

  /** Os dois colados, o computador defendendo, e o jogador começando o agarrão com V. */
  function agarrando(): Partida {
    const p = frenteAFrente(REGRAS.corpo + 2);
    correr(p, 0.1, DEFENDENDO);
    expect(p.lutadores[1].estado).toBe("defesa");
    expect(dicaDe(p, 0)).toBe("agarrar");
    avancar(p, DT, [e({ forte: true }), e({ defesa: true })]);
    expect(p.lutadores[0].estado).toBe("agarrando");
    return p;
  }

  it("V colado em quem defende agarra, e a guarda não segura: pega depois da preparação, segura um instante, arremessa e derruba por mais tempo", () => {
    const p = agarrando();
    const [agarrador, alvo] = p.lutadores;
    const xAntes = alvo.x;
    const pegou = ate(p, (x) => x.lutadores[1].estado === "agarrado", REGRAS.agarrao.antecipacao + 0.05, DEFENDENDO);
    expect(pegou.find((evento) => evento.tipo === "agarrou")).toMatchObject({ quem: 0, alvo: 1 });
    expect(agarrador.agarrou).toBe(true);
    expect(dicaDe(p, 1)).toBe("escapar");
    // Seguro: fica colado ao agarrador, de frente para ele, sem agir.
    const bloqueios = correr(p, 0.1, [e(), e({ golpe: true })]);
    expect(bloqueios.some((evento) => evento.tipo === "acaoBloqueada" && evento.motivo === "agarrado")).toBe(true);
    expect(alvo.estado).toBe("agarrado");
    expect(Math.abs(alvo.x - agarrador.x)).toBeLessThan(REGRAS.corpo);
    expect(alvo.direcao).toBe(-agarrador.direcao);
    const voou = ate(p, (x) => x.lutadores[1].estado === "arremessado", REGRAS.agarrao.seguro + 0.05, DEFENDENDO);
    expect(voou.find((evento) => evento.tipo === "arremesso")).toMatchObject({ quem: 0, alvo: 1 });
    let alturaMaxima = 0;
    const caiu = ate(
      p,
      (x) => x.lutadores[1].estado === "caido",
      1.5,
      (x) => {
        alturaMaxima = Math.max(alturaMaxima, x.lutadores[1].y);
        return DEFENDENDO;
      },
    );
    expect(alturaMaxima).toBeGreaterThan(20);
    expect(caiu.find((evento) => evento.tipo === "queda")).toMatchObject({ quem: 1, longa: true });
    expect(alvo.x - xAntes).toBeGreaterThan(80);
    expect(alvo.y).toBe(0);
    expect(alvo.equilibrio).toBe(0);
    // O agarrador volta à guarda e fica em recarga longa: não vira a resposta para tudo.
    ate(p, (x) => x.lutadores[0].estado === "parado", 1, DEFENDENDO);
    expect(agarrador.recargaAgarrao).toBeGreaterThan(1);
    expect(dicaDe(p, 0)).not.toBe("agarrar");
  });

  it("a esquiva escapa do agarrão durante o seguro e deixa o agarrador lento; em recarga, não escapa e vai ao chão", () => {
    const p = agarrando();
    ate(p, (x) => x.lutadores[1].estado === "agarrado", REGRAS.agarrao.antecipacao + 0.05, DEFENDENDO);
    const eventos = correr(p, 0.1, (x) => [e(), e({ esquiva: x.lutadores[1].t > 0.05 && !x.lutadores[1].anterior.esquiva })]);
    expect(tipos(eventos)).toEqual(expect.arrayContaining(["escapou", "esquiva"]));
    expect(tipos(eventos)).not.toContain("arremesso");
    expect(p.lutadores[1].estado).toBe("esquiva");
    expect(p.lutadores[1].invulneravel).toBeGreaterThan(0);
    expect(p.lutadores[0].estado).toBe("parado");
    expect(p.lutadores[0].recargaAgarrao).toBeGreaterThan(1);
    expect(p.lutadores[0].recargaGolpe).toBeGreaterThan(0);

    const q = agarrando();
    q.lutadores[1].recargaEsquiva = 2;
    ate(q, (x) => x.lutadores[1].estado === "agarrado", REGRAS.agarrao.antecipacao + 0.05, DEFENDENDO);
    expect(dicaDe(q, 1)).toBeNull();
    const presa = ate(q, (x) => x.lutadores[1].estado === "caido", 2.5, (x) => [e(), e({ esquiva: !x.lutadores[1].anterior.esquiva })]);
    expect(presa.some((evento) => evento.tipo === "acaoBloqueada" && evento.motivo === "recarga")).toBe(true);
    expect(tipos(presa)).toContain("arremesso");
    expect(tipos(presa)).not.toContain("escapou");
  });

  it("um golpe na preparação interrompe o agarrão; quem se afasta a tempo deixa o agarrão no vazio, exposto; de longe ou sem guarda, V é o golpe forte", () => {
    // O defensor solta a guarda e bate: o soco sai antes de o agarrão pegar.
    const p = agarrando();
    const eventos = correr(p, 0.5, [e(), e({ golpe: true })]);
    expect(eventos.find((evento) => evento.tipo === "golpe")).toMatchObject({ quem: 1, alvo: 0, bloqueado: false });
    expect(tipos(eventos)).not.toContain("agarrou");
    expect(p.lutadores[0].agarrou).toBe(false);
    expect(p.lutadores[0].estado).not.toBe("agarrando");

    // O defensor recua: o agarrão fecha no vazio e fica na recuperação.
    const q = agarrando();
    const vazio = correr(q, REGRAS.agarrao.antecipacao + 0.05, [e(), e({ esquerda: false, direita: true })]);
    expect(vazio.find((evento) => evento.tipo === "golpeNoVazio")).toMatchObject({ quem: 0, golpe: "agarrao" });
    expect(q.lutadores[0].estado).toBe("agarrando");
    expect(q.lutadores[1].estado).not.toBe("agarrado");
    ate(q, (x) => x.lutadores[0].estado === "parado", REGRAS.agarrao.recuperacao + 0.1);
    expect(q.lutadores[0].recargaAgarrao).toBeGreaterThan(0);

    // Sem a guarda do outro, ou longe dela, V é o golpe forte de sempre.
    const s = frenteAFrente(REGRAS.corpo + 2);
    toque(s, 0, "forte");
    expect(s.lutadores[0].estado).toBe("forte");
    const t = frenteAFrente(REGRAS.agarrao.alcance + 20);
    correr(t, 0.1, DEFENDENDO);
    expect(dicaDe(t, 0)).toBeNull();
    avancar(t, DT, [e({ forte: true }), e({ defesa: true })]);
    expect(t.lutadores[0].estado).toBe("forte");
  });
});

describe("a prorrogação", () => {
  it("avisa uma vez aos 150 s de luta; a partir dali a faixa afrouxa e, aos 240 s, puxar leva 60% do tempo", () => {
    const p = pronta();
    p.tempo = REGRAS.contagem + REGRAS.prorrogacao.aos - 0.1;
    const aviso = correr(p, 0.3);
    expect(tipos(aviso).filter((tipo) => tipo === "prorrogacao")).toHaveLength(1);
    expect(p.prorrogacao).toBe(true);
    expect(tipos(correr(p, 1))).not.toContain("prorrogacao");

    const q = escadaEmPe();
    ate(q, (x) => x.lutadores[0].estado === "noTopo", 3, SEGURANDO_CIMA);
    q.tempo = REGRAS.contagem + REGRAS.prorrogacao.ate;
    const inicio = q.tempo;
    ate(q, (x) => x.lutadores[0].puxada >= 0.5, 5, [e({ interagir: true }), e()]);
    const levou = q.tempo - inicio;
    expect(levou).toBeGreaterThan((REGRAS.faixa.puxar / 2) * REGRAS.prorrogacao.fator - 0.1);
    expect(levou).toBeLessThan((REGRAS.faixa.puxar / 2) * REGRAS.prorrogacao.fator + 0.1);
  });
});

describe("a escada e a faixa", () => {
  it("C pega a escada perto dela; carregando, C posiciona na zona sob a faixa e larga fora dela; atacar e pular ficam bloqueados", () => {
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

    const bloqueios = correr(p, 0.5, (x) => [e({ direita: true, golpe: x.lutadores[0].t < 0.02, pulo: x.lutadores[0].t > 0.1 && x.lutadores[0].t < 0.12 }), e()]);
    expect(p.lutadores[0].estado).toBe("carregando");
    expect(bloqueios.filter((evento) => evento.tipo === "acaoBloqueada" && evento.motivo === "carregando").length).toBeGreaterThanOrEqual(2);
    expect(Math.abs(p.lutadores[0].vel)).toBeCloseTo(REGRAS.velocidadeCarregando, 0);
    expect(esc.x).toBe(p.lutadores[0].x);

    p.lutadores[0].x = -200;
    expect(dicaDe(p, 0)).toBe("soltarEscada");
    toque(p, 0, "interagir");
    expect(esc.estado).toBe("caida");
    expect(p.lutadores[0].estado).not.toBe("carregando");
    expect(tipos(p.eventos)).toContain("escadaSolta");
    expect(Math.abs(esc.x - -200)).toBeLessThanOrEqual(REGRAS.escada.pegar);
    // Freia o que ainda andava e pega de novo.
    correr(p, 0.2);
    expect(p.lutadores[0].estado).toBe("parado");
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

  it("a seta para cima começa a subir, alinhado à base; C não sobe; na escada, atacar fica bloqueado; dá para desistir e descer", () => {
    const p = escadaEmPe();
    toque(p, 0, "interagir");
    expect(p.lutadores[0].estado).toBe("parado");
    p.lutadores[0].x = -REGRAS.escada.subir - 20;
    correr(p, 0.1, SEGURANDO_CIMA);
    expect(p.lutadores[0].estado).toBe("parado");
    p.lutadores[0].x = -20;
    expect(dicaDe(p, 0)).toBe("subir");
    const eventos = correr(p, 0.05, SEGURANDO_CIMA);
    expect(p.lutadores[0].estado).toBe("subindo");
    expect(tipos(eventos)).toContain("subida");
    correr(p, 0.5, SEGURANDO_CIMA);
    const bloqueio = correr(p, 0.05, [e({ cima: true, golpe: true }), e()]);
    expect(bloqueio.some((evento) => evento.tipo === "acaoBloqueada" && evento.motivo === "naEscada")).toBe(true);
    const desceu = ate(p, (x) => x.lutadores[0].estado === "parado", 2, [e({ baixo: true }), e()]);
    expect(tipos(desceu)).toContain("desceu");
    expect(p.lutadores[0].y).toBe(0);
  });

  it("subir leva perto de 1,7 s; puxar com C segurado leva o tempo das regras; avisa quando falta pouco; vence uma vez só, e nada mais muda depois", () => {
    const p = escadaEmPe();
    const subida = ate(p, (x) => x.lutadores[0].estado === "noTopo", 3, SEGURANDO_CIMA);
    expect(tipos(subida)).toContain("topo");
    expect(p.tempo - REGRAS.contagem).toBeGreaterThan(1.5);
    expect(p.tempo - REGRAS.contagem).toBeLessThan(2);
    expect(p.lutadores[0].y).toBeCloseTo(alturaNaEscada(1), 1);
    expect(dicaDe(p, 0)).toBe("puxarFaixa");
    correr(p, 0.3);
    expect(p.lutadores[0].puxada).toBe(0);
    const metade = correr(p, REGRAS.faixa.puxar / 2, [e({ interagir: true }), e()]);
    expect(tipos(metade)).toContain("puxando");
    expect(p.lutadores[0].puxada).toBeCloseTo(0.5, 1);
    // Sem segurar, escorre devagar.
    correr(p, 1);
    expect(p.lutadores[0].puxada).toBeGreaterThan(0.45);
    expect(p.lutadores[0].puxada).toBeLessThan(0.5);
    const eventos = correr(p, REGRAS.faixa.puxar / 2 + 0.5, [e({ interagir: true }), e()]);
    expect(tipos(eventos).filter((tipo) => tipo === "faltaPouco")).toHaveLength(1);
    expect(tipos(eventos).filter((tipo) => tipo === "vitoria")).toHaveLength(1);
    expect(p.fase).toBe("fim");
    expect(p.vencedor).toBe(0);
    const depois = correr(p, 2, [e({ interagir: true, golpe: true, direita: true, pulo: true }), e({ golpe: true, esquerda: true })]);
    expect(tipos(depois)).toEqual([]);
    expect(p.lutadores[0].estado).toBe("vitoria");
    expect(p.lutadores[1].estado).toBe("derrota");
    expect(p.lutadores[1].x).toBe(300);
  });

  it("atacar perto da escada em que o adversário está chacoalha a escada e pausa a puxada; no terceiro, a escada tomba, quem sobe cai e perde um quarto do que puxou", () => {
    const p = escadaEmPe(70);
    ate(p, (x) => x.lutadores[0].estado === "noTopo", 3, SEGURANDO_CIMA);
    p.lutadores[0].puxada = 0.6;
    expect(dicaDe(p, 1)).toBe("derrubarEscada");
    // O primeiro chacoalha: a escada fica, quem está nela perde equilíbrio, e a puxada não avança enquanto balança.
    const primeiro = ate(p, (x) => x.eventos.some((evento) => evento.tipo === "derrubada"), 1.5, (x) => [e({ interagir: true }), e({ golpe: x.lutadores[1].estado === "parado" && !x.lutadores[1].anterior.golpe })]);
    expect(primeiro.find((evento) => evento.tipo === "derrubada")).toMatchObject({ tombou: false });
    expect(p.escada.estado).toBe("emPe");
    expect(p.lutadores[0].estado).toBe("noTopo");
    expect(p.lutadores[0].equilibrio).toBeLessThan(REGRAS.equilibrio - REGRAS.derrubada.dano + 1);
    const puxadaAntes = p.lutadores[0].puxada;
    correr(p, 0.25, [e({ interagir: true }), e()]);
    expect(p.lutadores[0].puxada).toBe(puxadaAntes);
    // Mais dois: tomba.
    const eventos = ate(p, (x) => x.lutadores[0].estado === "caindoDaEscada", 4, (x) => [e(), e({ golpe: x.lutadores[1].estado === "parado" && x.lutadores[1].recargaDerrubada === 0 && !x.lutadores[1].anterior.golpe })]);
    expect(eventos.filter((evento) => evento.tipo === "derrubada")).toHaveLength(2);
    expect(eventos.find((evento) => evento.tipo === "derrubada" && evento.tombou)).toBeDefined();
    expect(tipos(eventos)).toEqual(expect.arrayContaining(["derrubada", "interrompido", "caiuDaEscada"]));
    expect(p.lutadores[0].puxada).toBeLessThanOrEqual(0.62 * (1 - REGRAS.faixa.perdaAoCair) + 1e-6);
    expect(p.lutadores[0].puxada).toBeGreaterThan(0.5 * (1 - REGRAS.faixa.perdaAoCair));
    expect(p.escada.estado).toBe("caindo");
    const chao = ate(p, (x) => x.escada.estado === "caida" && x.lutadores[0].estado === "caido", 2);
    expect(tipos(chao)).toContain("escadaCaiu");
    expect(tipos(chao)).toContain("queda");
    expect(p.escada.x).toBeLessThan(0);
    expect(p.lutadores[1].recargaDerrubada).toBeGreaterThan(0);
    ate(p, (x) => x.lutadores[0].estado === "parado", 3);
    // O progresso que ficou vale na próxima subida.
    expect(p.lutadores[0].puxada).toBeGreaterThan(0.4);
  });

  it("atacar perto da escada em pé vazia é um golpe comum: a escada fica; um golpe em quem carrega a derruba no lugar", () => {
    const p = escadaEmPe(70);
    p.lutadores[0].x = -300;
    toque(p, 1, "golpe");
    expect(p.lutadores[1].estado).toBe("golpe");
    correr(p, 1);
    expect(p.escada.estado).toBe("emPe");
    const q = pronta(0);
    q.lutadores[0].x = q.escada.x;
    toque(q, 0, "interagir");
    q.lutadores[1].x = q.lutadores[0].x + 50;
    const eventos = ate(q, (x) => x.lutadores[0].estado === "atingido", 1, (x) => [e(), e({ golpe: x.lutadores[1].estado === "parado" && !x.lutadores[1].anterior.golpe })]);
    expect(tipos(eventos)).toContain("escadaSolta");
    expect(q.escada.estado).toBe("caida");
  });
});

describe("o computador", () => {
  interface Resultado {
    semente: number;
    vencedor: 0 | 1 | null;
    tempo: number;
    estados: Set<EstadoDaIA>;
    erros: number;
    eventos: Set<Evento["tipo"]>;
  }

  type Perfil = Dificuldade | Partial<PerfilDaIA>;

  /** Dois computadores, um contra o outro, até o fim ou até `limite` segundos, conferindo os invariantes a cada passo. */
  function simular(semente: number, limite = 400, perfis: [Perfil, Perfil] = ["normal", "normal"]): Resultado {
    const p = criarPartida("lula", "flavio-bolsonaro", semente);
    const memorias: [MemoriaDaIA, MemoriaDaIA] = [criarMemoria(semente * 7919 + 1, perfis[0]), criarMemoria(semente * 104729 + 2, perfis[1])];
    const estados = new Set<EstadoDaIA>();
    const eventos = new Set<Evento["tipo"]>();
    const passos = Math.round(limite / DT);
    const limites: Partial<Record<Partida["lutadores"][0]["estado"], number>> = {
      caido: REGRAS.caidoLongo + 0.05,
      atingido: REGRAS.atingido + 0.05,
      levantando: REGRAS.levantando + 0.05,
      golpe: 0.8,
      forte: 1.05,
      derrubada: 1.05,
      agarrando: REGRAS.agarrao.antecipacao + REGRAS.agarrao.seguro + REGRAS.agarrao.arremesso + REGRAS.agarrao.recuperacao + 0.05,
      agarrado: REGRAS.agarrao.seguro + 0.05,
      arremessado: 1.5,
      pulando: 1.2,
      voadora: 1.2,
      aterrissando: 0.5,
      esquiva: 0.35,
      caindoDaEscada: 1.5,
    };
    // Os invariantes são conferidos a cada passo sem `expect`, que é caro demais para milhares de passos: a primeira violação derruba o teste.
    const violacoes: string[] = [];
    const conferir = (vale: boolean, mensagem: string) => {
      if (!vale && violacoes.length < 5) violacoes.push(`semente ${semente}, ${p.tempo.toFixed(2)} s: ${mensagem}`);
    };
    for (let n = 0; n < passos && p.fase !== "fim"; n += 1) {
      const entradas: [Entrada, Entrada] = [decidir(p, 0, memorias[0], DT), decidir(p, 1, memorias[1], DT)];
      avancar(p, DT, entradas);
      for (const m of memorias) estados.add(m.estado);
      for (const evento of p.eventos) eventos.add(evento.tipo);
      for (const l of p.lutadores) {
        if (l.estado === "carregando" || l.estado === "golpe" || l.estado === "forte" || l.estado === "derrubada" || l.estado === "defesa" || l.estado === "esquiva" || l.estado === "agarrando") conferir(l.y === 0, `${l.estado} fora do chão`);
        if (l.estado === "caido") conferir(!naEscada(l), "caído na escada");
        if (l.estado === "agarrado") conferir(p.lutadores[l === p.lutadores[0] ? 1 : 0].estado === "agarrando", "agarrado sem ninguém segurando");
        conferir(l.y >= 0, "abaixo do tapete");
        const maximo = limites[l.estado];
        if (maximo !== undefined) conferir(l.t <= maximo, `${l.estado} preso há ${l.t.toFixed(2)} s`);
        conferir(Math.abs(l.x) <= REGRAS.ringue + 0.01, "fora do ringue");
      }
      conferir((p.escada.portador !== null) === (p.escada.estado === "carregada"), "portador e estado da escada divergem");
      if (p.escada.estado === "caindo") conferir(p.escada.queda <= 1, "queda da escada passou de 1");
      conferir(p.eventos.filter((evento) => evento.tipo === "vitoria").length <= 1, "vitória dupla");
    }
    expect(violacoes).toEqual([]);
    return { semente, vencedor: p.vencedor, tempo: p.tempo, estados, erros: memorias[0].erros + memorias[1].erros, eventos };
  }

  // Doze partidas inteiras, passo a passo: em máquina ocupada leva mais do que o prazo padrão.
  it("dois computadores disputam a faixa até o fim, em partidas de minutos, com vitórias dos dois lados, erros propositais e todas as ações", { timeout: 120_000 }, () => {
    const resultados = Array.from({ length: 12 }, (_, semente) => simular(semente + 1));
    for (const resultado of resultados) {
      expect(resultado.vencedor, `semente ${resultado.semente} sem vencedor em ${resultado.tempo.toFixed(0)} s`).not.toBeNull();
      expect(resultado.erros).toBeGreaterThan(0);
    }
    const vencedores = new Set(resultados.map((resultado) => resultado.vencedor));
    expect(vencedores).toEqual(new Set([0, 1]));
    const estados = new Set(resultados.flatMap((resultado) => [...resultado.estados]));
    for (const estado of ["aproximar", "atacar", "defender", "esquivar", "recuperar", "buscarEscada", "posicionar", "subir", "disputarFaixa", "interromper"] as const) {
      expect(estados.has(estado), `estado ${estado} nunca aconteceu`).toBe(true);
    }
    const eventos = new Set(resultados.flatMap((resultado) => [...resultado.eventos]));
    for (const tipo of ["pulo", "voadora", "esquiva", "interrompido", "derrubada", "faltaPouco"] as const) {
      expect(eventos.has(tipo), `evento ${tipo} nunca aconteceu`).toBe(true);
    }
    const tempos = resultados.map((resultado) => resultado.tempo);
    const media = tempos.reduce((soma, tempo) => soma + tempo, 0) / tempos.length;
    console.log(`partidas IA×IA: ${tempos.map((tempo) => tempo.toFixed(0)).join(", ")} s; média ${media.toFixed(0)} s`);
    expect(media).toBeGreaterThan(45);
    expect(media).toBeLessThan(300);
  });

  it("contra quem não faz nada, o computador vence sozinho: busca a escada, posiciona, sobe e puxa", { timeout: 30_000 }, () => {
    const p = criarPartida("lula", "flavio-bolsonaro", 3);
    const m = criarMemoria(11);
    const estados = new Set<EstadoDaIA>();
    ate(
      p,
      (x) => x.fase === "fim",
      90,
      (x) => {
        const entrada = decidir(x, 1, m, DT);
        estados.add(m.estado);
        return [e(), entrada];
      },
    );
    expect(p.vencedor).toBe(1);
    expect([...estados]).toEqual(expect.arrayContaining(["buscarEscada", "posicionar", "subir", "disputarFaixa"]));
  });

  it("é determinístico pela semente", { timeout: 60_000 }, () => {
    const a = simular(5, 120);
    const b = simular(5, 120);
    expect(a.vencedor).toBe(b.vencedor);
    expect(a.tempo).toBe(b.tempo);
  });

  it("os níveis mudam só o perfil (reação, erros, cautela, ousadia, fuga), e o difícil vence o fácil na maioria das partidas", { timeout: 120_000 }, () => {
    expect(DIFICULDADES.facil.reacao).toBeGreaterThan(DIFICULDADES.normal.reacao);
    expect(DIFICULDADES.normal.reacao).toBeGreaterThan(DIFICULDADES.dificil.reacao);
    expect(DIFICULDADES.facil.descuido).toBeGreaterThan(DIFICULDADES.normal.descuido);
    expect(DIFICULDADES.normal.descuido).toBeGreaterThan(DIFICULDADES.dificil.descuido);
    expect(criarMemoria(1, "facil").perfil).toEqual(expect.objectContaining({ descuido: DIFICULDADES.facil.descuido, reacao: DIFICULDADES.facil.reacao }));
    // Com o mesmo perfil dos dois lados, a partida é a de sempre; o fácil e o difícil se alternam de lado para não contar a vantagem da posição.
    const resultados = Array.from({ length: 8 }, (_, n) => {
      const dificilNaDireita = n % 2 === 0;
      const resultado = simular(n + 21, 400, dificilNaDireita ? ["facil", "dificil"] : ["dificil", "facil"]);
      return { ...resultado, venceuODificil: resultado.vencedor === (dificilNaDireita ? 1 : 0) };
    });
    const vitorias = resultados.filter((resultado) => resultado.venceuODificil).length;
    console.log(`difícil × fácil: ${vitorias} vitórias do difícil em ${resultados.length}; tempos ${resultados.map((resultado) => resultado.tempo.toFixed(0)).join(", ")} s`);
    expect(vitorias).toBeGreaterThanOrEqual(6);
    expect(resultados.flatMap((resultado) => [...resultado.eventos])).toEqual(expect.arrayContaining(["agarrou", "arremesso"]));
  });
});

describe("o laço de passo fixo", () => {
  /** Roda o laço com quadros nos intervalos dados (ms) e devolve os passos de simulação e os `dt` recebidos. */
  function rodar(intervalos: readonly number[]): { passos: number; dts: Set<number> } {
    const fila: FrameRequestCallback[] = [];
    const anterior = { pedir: globalThis.requestAnimationFrame, cancelar: globalThis.cancelAnimationFrame };
    globalThis.requestAnimationFrame = (callback) => {
      fila.push(callback);
      return fila.length;
    };
    globalThis.cancelAnimationFrame = () => {};
    const dts = new Set<number>();
    let passos = 0;
    const laco = createLoop({
      update(dt) {
        passos += 1;
        dts.add(dt);
      },
      render() {},
    });
    laco.start();
    let agora = 0;
    fila.shift()!(agora);
    for (const intervalo of intervalos) {
      agora += intervalo;
      fila.shift()!(agora);
    }
    laco.stop();
    globalThis.requestAnimationFrame = anterior.pedir;
    globalThis.cancelAnimationFrame = anterior.cancelar;
    return { passos, dts };
  }

  it("a simulação anda os mesmos passos de 1/120 s a 60 e a 30 quadros por segundo, e um quadro travado não dispara uma avalanche", () => {
    const a60 = rodar(Array.from({ length: 60 }, () => 1000 / 60));
    const a30 = rodar(Array.from({ length: 30 }, () => 1000 / 30));
    // Um segundo de quadros dá 120 passos, a menos do resto de arredondamento que fica no acumulador.
    expect(Math.abs(a60.passos - 120)).toBeLessThanOrEqual(1);
    expect(Math.abs(a30.passos - 120)).toBeLessThanOrEqual(1);
    expect(Math.abs(a60.passos - a30.passos)).toBeLessThanOrEqual(1);
    expect([...a60.dts, ...a30.dts].every((dt) => Math.abs(dt - 1 / 120) < 1e-9)).toBe(true);
    // Um quadro de 400 ms conta como 100 ms: 12 passos, e não 48.
    const travado = rodar([400]);
    expect(travado.passos).toBe(12);
  });
});

describe("as falas", () => {
  it("há uma fala para os eventos marcantes, nenhuma para os de rotina, e a prioridade só lista eventos com fala", () => {
    expect(falaPara("queda", 0)).toBe("A governabilidade ficou no chão!");
    expect(falaPara("voadora", 0)).toBe("Veio de voadora!");
    expect(falaPara("faltaPouco", 0)).toBe("Falta pouco!");
    expect(falaPara("golpeNoVazio", 0.5)).toBeNull();
    expect(falaPara("golpe", 0.5)).toBeNull();
    for (const tipo of PRIORIDADE_DAS_FALAS) expect(falaPara(tipo, 0.99), tipo).not.toBeNull();
  });
});
