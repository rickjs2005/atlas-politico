// O mundo do jogo: projeção isométrica, grade e colisão, movimento, alcance
// de interação e câmera. Tudo sobre uma cena sintética pequena.

import { describe, expect, it } from "vitest";

import type { ChapterSpec, Facing, InputState, PlayerState, SceneSpec } from "@/lib/game/types";
import { clampCenter, followCamera, project, sceneBounds, zoomFor, zoomToFit, type Camera } from "@/lib/game/world/camera";
import { CELL, cellAt, isBlocked, isPropCell, neighbours, reachable, readMarkers } from "@/lib/game/world/grid";
import { REACH, distance, listInteractables, nearestInteractable } from "@/lib/game/world/interact";
import { CHARACTER_HEIGHT, TILE_H, TILE_W, facingOf, inputToWorld, isFront, isMirrored, toScreen, toWorld } from "@/lib/game/world/iso";
import { CORNER, RADIUS, SPEED, initialPlayer, isOnExit, stepPlayer } from "@/lib/game/world/movement";
import { DEAD_ZONE, directionFor } from "@/lib/game/world/touch";

// Uma sala de 9 por 7: início no canto, guia na parede oeste, saída na leste,
// um elemento de cenário no meio e dois registros embaixo.
const CENA: SceneSpec = {
  id: "sindicato",
  nome: "Sala de teste",
  mapa: [
    "#########",
    "#S......#",
    "#...o...#",
    "#G......E",
    "#.1...2.#",
    "#.......#",
    "#########",
  ],
  largura: 9,
  altura: 7,
  paleta: { chao: "#ccc", chaoAlt: "#bbb", tapete: "#aaa", parede: "#999", paredeTopo: "#888", fundo: "#eee", acento: "#f00" },
  props: [
    { tipo: "mesa", x: 4, y: 2 },
    // Bloqueia sem estar no mapa: a lista de props também conta.
    { tipo: "cadeira", x: 6, y: 5 },
    // Decoração não bloqueia.
    { tipo: "decoracao", x: 6, y: 1 },
  ],
  tapetes: [],
  spawn: { x: 1, y: 1 },
  guia: { x: 1, y: 3 },
  saida: { x: 8, y: 3, lado: "leste" },
  registros: [
    { x: 2, y: 4 },
    { x: 6, y: 4 },
  ],
};

const CAPITULO: ChapterSpec = {
  id: "teste-1",
  personagem: "lula",
  numero: 1,
  titulo: "Capítulo de teste",
  periodo: { de: 1980, ate: 1986 },
  motivo: "Fixture dos testes.",
  objetivo: "Fixture dos testes.",
  eventIds: ["r1", "r2"],
  tarefa: { tipo: "ordem", eventIds: ["r1", "r2"] },
  cena: "sindicato",
};

const DT = 1 / 60;
const INV_SQRT2 = Math.SQRT1_2;

const jogador = (x: number, y: number, facing: Facing = "frente-direita"): PlayerState => ({ x, y, facing, andando: false, fase: 0 });
const entrada = (dx: number, dy: number): InputState => ({ dx, dy });
const PARADO = entrada(0, 0);

/** Anda `passos` quadros com a mesma entrada. */
function andar(player: PlayerState, input: InputState, passos: number, saidaAberta = false): PlayerState {
  let atual = player;
  for (let i = 0; i < passos; i += 1) atual = stepPlayer(atual, input, DT, CENA, saidaAberta);
  return atual;
}

describe("projeção isométrica", () => {
  it("a célula tem 64 por 32 pixels e o personagem cerca de 68", () => {
    expect([TILE_W, TILE_H]).toEqual([64, 32]);
    expect(CHARACTER_HEIGHT).toBe(68);
  });

  it("x do mundo desce para a direita na tela e y desce para a esquerda", () => {
    expect(toScreen(0, 0)).toEqual({ sx: 0, sy: 0 });
    expect(toScreen(1, 0)).toEqual({ sx: TILE_W / 2, sy: TILE_H / 2 });
    expect(toScreen(0, 1)).toEqual({ sx: -TILE_W / 2, sy: TILE_H / 2 });
    expect(toScreen(1, 1)).toEqual({ sx: 0, sy: TILE_H });
  });

  it("toScreen e toWorld são inversas, também em pontos contínuos", () => {
    for (const [x, y] of [
      [0, 0],
      [3, 1],
      [1, 5],
      [2.5, 4.5],
      [7.25, 0.75],
      [-1.5, 2],
    ] as const) {
      const { sx, sy } = toScreen(x, y);
      const volta = toWorld(sx, sy);
      expect(volta.x).toBeCloseTo(x, 10);
      expect(volta.y).toBeCloseTo(y, 10);
    }
    const ponto = toScreen(toWorld(100, 37).x, toWorld(100, 37).y);
    expect(ponto.sx).toBeCloseTo(100, 10);
    expect(ponto.sy).toBeCloseTo(37, 10);
  });

  it("sem intenção, não há direção", () => {
    expect(inputToWorld(PARADO)).toEqual({ x: 0, y: 0 });
  });

  it("as quatro setas e as quatro diagonais têm comprimento 1", () => {
    for (const dx of [-1, 0, 1]) {
      for (const dy of [-1, 0, 1]) {
        if (dx === 0 && dy === 0) continue;
        const { x, y } = inputToWorld(entrada(dx, dy));
        expect(Math.hypot(x, y), `dx=${dx} dy=${dy}`).toBeCloseTo(1, 10);
      }
    }
  });

  it("a seta para cima leva a (-1, -1)/√2 e as demais seguem a mesma base", () => {
    const cima = inputToWorld(entrada(0, -1));
    expect(cima.x).toBeCloseTo(-INV_SQRT2, 10);
    expect(cima.y).toBeCloseTo(-INV_SQRT2, 10);

    const direita = inputToWorld(entrada(1, 0));
    expect(direita.x).toBeCloseTo(INV_SQRT2, 10);
    expect(direita.y).toBeCloseTo(-INV_SQRT2, 10);

    const baixo = inputToWorld(entrada(0, 1));
    expect(baixo.x).toBeCloseTo(INV_SQRT2, 10);
    expect(baixo.y).toBeCloseTo(INV_SQRT2, 10);

    const esquerda = inputToWorld(entrada(-1, 0));
    expect(esquerda.x).toBeCloseTo(-INV_SQRT2, 10);
    expect(esquerda.y).toBeCloseTo(INV_SQRT2, 10);
  });

  it("as diagonais de tela são os eixos do mundo", () => {
    const cimaDireita = inputToWorld(entrada(1, -1));
    expect(cimaDireita.x).toBeCloseTo(0, 10);
    expect(cimaDireita.y).toBeCloseTo(-1, 10);
    const baixoDireita = inputToWorld(entrada(1, 1));
    expect(baixoDireita.x).toBeCloseTo(1, 10);
    expect(baixoDireita.y).toBeCloseTo(0, 10);
    const baixoEsquerda = inputToWorld(entrada(-1, 1));
    expect(baixoEsquerda.x).toBeCloseTo(0, 10);
    expect(baixoEsquerda.y).toBeCloseTo(1, 10);
    const cimaEsquerda = inputToWorld(entrada(-1, -1));
    expect(cimaEsquerda.x).toBeCloseTo(-1, 10);
    expect(cimaEsquerda.y).toBeCloseTo(0, 10);
  });

  it("a direção do olhar segue o eixo dominante do movimento, e parado mantém a atual", () => {
    expect(facingOf(0, 0, "costas-direita")).toBe("costas-direita");
    expect(facingOf(1, 0, "costas-direita")).toBe("frente-direita");
    expect(facingOf(-1, 0, "frente-direita")).toBe("costas-esquerda");
    expect(facingOf(0, 1, "frente-direita")).toBe("frente-esquerda");
    expect(facingOf(0, -1, "frente-direita")).toBe("costas-direita");
    // A componente maior decide.
    expect(facingOf(0.9, 0.3, "frente-direita")).toBe("frente-direita");
    expect(facingOf(0.3, -0.9, "frente-direita")).toBe("costas-direita");
  });

  it("frente e espelho são lidos do nome da direção", () => {
    expect(isFront("frente-direita")).toBe(true);
    expect(isFront("frente-esquerda")).toBe(true);
    expect(isFront("costas-direita")).toBe(false);
    expect(isMirrored("frente-esquerda")).toBe(true);
    expect(isMirrored("costas-esquerda")).toBe(true);
    expect(isMirrored("frente-direita")).toBe(false);
  });
});

describe("grade", () => {
  it("fora do mapa é parede", () => {
    expect(cellAt(CENA, -1, 1)).toBe(CELL.parede);
    expect(cellAt(CENA, 1, -1)).toBe(CELL.parede);
    expect(cellAt(CENA, CENA.largura, 1)).toBe(CELL.parede);
    expect(cellAt(CENA, 1, CENA.altura)).toBe(CELL.parede);
  });

  it("dentro do mapa lê o caractere da célula", () => {
    expect(cellAt(CENA, 1, 1)).toBe(CELL.spawn);
    expect(cellAt(CENA, 1, 3)).toBe(CELL.guia);
    expect(cellAt(CENA, 8, 3)).toBe(CELL.saida);
    expect(cellAt(CENA, 4, 2)).toBe(CELL.prop);
    expect(cellAt(CENA, 2, 4)).toBe("1");
    expect(cellAt(CENA, 3, 3)).toBe(CELL.chao);
  });

  it("parede, guia e elementos de cenário bloqueiam; chão, início e registros não", () => {
    expect(isBlocked(CENA, 0, 0, false)).toBe(true);
    expect(isBlocked(CENA, 1, 3, false)).toBe(true);
    expect(isBlocked(CENA, 4, 2, false)).toBe(true);
    expect(isBlocked(CENA, 6, 5, false)).toBe(true);
    expect(isBlocked(CENA, 3, 3, false)).toBe(false);
    expect(isBlocked(CENA, 1, 1, false)).toBe(false);
    expect(isBlocked(CENA, 2, 4, false)).toBe(false);
    expect(isBlocked(CENA, 6, 4, false)).toBe(false);
  });

  it("decoração não bloqueia, e isPropCell distingue o que ocupa célula", () => {
    expect(isBlocked(CENA, 6, 1, false)).toBe(false);
    expect(isPropCell(CENA, 6, 1)).toBe(false);
    expect(isPropCell(CENA, 4, 2)).toBe(true);
    expect(isPropCell(CENA, 6, 5)).toBe(true);
    expect(isPropCell(CENA, 3, 3)).toBe(false);
  });

  it("a saída bloqueia fechada e libera aberta", () => {
    expect(isBlocked(CENA, 8, 3, false)).toBe(true);
    expect(isBlocked(CENA, 8, 3, true)).toBe(false);
  });

  it("coordenadas contínuas caem na célula do piso", () => {
    expect(isBlocked(CENA, 4.9, 2.1, false)).toBe(true);
    expect(isBlocked(CENA, 3.99, 2.5, false)).toBe(false);
    expect(isBlocked(CENA, 0.99, 1.5, false)).toBe(true);
  });

  it("lê os marcadores do mapa", () => {
    expect(readMarkers(CENA)).toEqual({
      spawn: { x: 1, y: 1 },
      guia: { x: 1, y: 3 },
      saida: { x: 8, y: 3 },
      registros: [
        { x: 2, y: 4 },
        { x: 6, y: 4 },
      ],
    });
  });

  it("sem marcadores, devolve nulos e lista vazia", () => {
    const vazia: SceneSpec = { ...CENA, mapa: ["###", "#.#", "###"], largura: 3, altura: 3 };
    expect(readMarkers(vazia)).toEqual({ spawn: null, guia: null, saida: null, registros: [] });
  });

  it("alcançáveis a pé: registros e vizinhança do guia sim; paredes, cenário, guia e saída fechada não", () => {
    const alcance = reachable(CENA, CENA.spawn);
    expect(alcance.has("2,4")).toBe(true);
    expect(alcance.has("6,4")).toBe(true);
    expect(alcance.has("2,3")).toBe(true);
    expect(alcance.has("1,3")).toBe(false);
    expect(alcance.has("4,2")).toBe(false);
    expect(alcance.has("6,5")).toBe(false);
    expect(alcance.has("0,1")).toBe(false);
    expect(alcance.has("8,3")).toBe(false);
    // O interior tem 7 por 5 células; guia, mesa e cadeira ficam de fora.
    expect(alcance.size).toBe(35 - 3);
  });

  it("com a saída aberta, a célula da saída entra no alcance e nada mais muda", () => {
    const aberta = reachable(CENA, CENA.spawn, true);
    expect(aberta.has("8,3")).toBe(true);
    expect(aberta.size).toBe(35 - 3 + 1);
  });

  it("as quatro vizinhas são as ortogonais", () => {
    expect(neighbours({ x: 3, y: 3 })).toEqual([
      { x: 4, y: 3 },
      { x: 2, y: 3 },
      { x: 3, y: 4 },
      { x: 3, y: 2 },
    ]);
  });
});

describe("movimento", () => {
  it("o personagem nasce no centro da célula de início, parado e de frente", () => {
    expect(initialPlayer(CENA)).toEqual({ x: 1.5, y: 1.5, facing: "frente-direita", andando: false, fase: 0 });
  });

  it("sem entrada não anda, para a caminhada e zera a fase", () => {
    const parado = jogador(3.5, 3.5);
    expect(stepPlayer(parado, PARADO, DT, CENA, false)).toBe(parado);

    const andando: PlayerState = { ...parado, andando: true, fase: 0.4 };
    expect(stepPlayer(andando, PARADO, DT, CENA, false)).toEqual({ ...parado, andando: false, fase: 0 });
  });

  it("anda na direção da entrada, com a velocidade da regra", () => {
    const origem = jogador(4.5, 4.5);
    for (const [dx, dy] of [
      [0, -1],
      [1, 0],
      [0, 1],
      [-1, 0],
      [1, 1],
      [-1, -1],
    ] as const) {
      const direcao = inputToWorld(entrada(dx, dy));
      const depois = stepPlayer(origem, entrada(dx, dy), DT, CENA, false);
      expect(depois.x, `dx=${dx} dy=${dy}`).toBeCloseTo(origem.x + direcao.x * SPEED * DT, 10);
      expect(depois.y, `dx=${dx} dy=${dy}`).toBeCloseTo(origem.y + direcao.y * SPEED * DT, 10);
      expect(depois.andando).toBe(true);
      expect(depois.fase).toBeGreaterThan(0);
      expect(depois.facing).toBe(facingOf(direcao.x, direcao.y, origem.facing));
    }
  });

  it("não altera o estado recebido", () => {
    const origem = jogador(4.5, 4.5);
    stepPlayer(origem, entrada(0, 1), DT, CENA, false);
    expect(origem).toEqual(jogador(4.5, 4.5));
  });

  it("a fase da caminhada avança e dá a volta entre 0 e 1", () => {
    const longe = andar(jogador(4.5, 4.5), entrada(0, 1), 1);
    expect(longe.fase).toBeGreaterThan(0);
    expect(longe.fase).toBeLessThan(1);
    const varias = andar(jogador(1.5, 1.5), entrada(1, 1), 90);
    expect(varias.fase).toBeGreaterThanOrEqual(0);
    expect(varias.fase).toBeLessThan(1);
  });

  it("desliza ao longo da parede: o eixo bloqueado para, o outro continua", () => {
    // Encostado na parede norte, indo para cima na tela (-x e -y no mundo).
    const encostado = jogador(3.5, 1 + RADIUS);
    const depois = stepPlayer(encostado, entrada(0, -1), DT, CENA, false);
    expect(depois.x).toBeLessThan(encostado.x);
    expect(depois.y).toBe(encostado.y);
    expect(depois.andando).toBe(true);
  });

  it("não atravessa a parede, por mais que insista", () => {
    const final = andar(jogador(3.5, 1.5), entrada(0, -1), 240);
    // Dois segundos para cima na tela levariam a (-4, -4): o canto segura.
    expect(final.x - RADIUS).toBeGreaterThanOrEqual(1);
    expect(final.y - RADIUS).toBeGreaterThanOrEqual(1);
    expect(isBlocked(CENA, final.x, final.y, false)).toBe(false);
    expect(final.x).toBeLessThan(1.5);
    expect(final.y).toBeLessThan(1.5);
  });

  it("para diante de um elemento de cenário sem entrar na célula", () => {
    // De frente para a mesa em (4, 2), andando em +y no mundo.
    const depois = andar(jogador(4.5, 1.5), entrada(-1, 1), 60);
    expect(depois.y + RADIUS).toBeLessThanOrEqual(2);
    expect(depois.x).toBe(4.5);
    expect(isBlocked(CENA, depois.x, depois.y + RADIUS, false)).toBe(false);
  });

  it("parado contra o obstáculo, deixa de andar", () => {
    const encostado = jogador(4.5, 2 - RADIUS);
    const depois = stepPlayer(encostado, entrada(-1, 1), DT, CENA, false);
    expect(depois.x).toBe(encostado.x);
    expect(depois.y).toBe(encostado.y);
    expect(depois.andando).toBe(false);
    expect(depois.fase).toBe(encostado.fase);
  });

  it("andando reto e roçando a quina de um móvel, contorna pelo lado livre e segue", () => {
    // Pelo corredor abaixo da mesa de (4, 2), em +x, com o corpo um pouco dentro da linha dela.
    const torto = jogador(3.4, 3.2);
    expect(torto.y - RADIUS).toBeLessThan(3);
    const depois = andar(torto, entrada(1, 1), 60);
    expect(depois.x, "passou da mesa").toBeGreaterThan(5);
    // Desviou só o necessário para o corpo sair da linha da mesa.
    expect(depois.y - RADIUS).toBeGreaterThanOrEqual(3 - 1e-9);
    expect(depois.y).toBeLessThan(torto.y + CORNER);
    expect(depois.andando).toBe(true);

    // O mesmo no outro eixo: descendo em +y ao lado da mesa, com o corpo um pouco dentro da coluna dela.
    const aoLado = jogador(5.2, 1.4);
    const desceu = andar(aoLado, entrada(-1, 1), 60);
    expect(desceu.y, "passou da mesa").toBeGreaterThan(3);
    expect(desceu.x - RADIUS).toBeGreaterThanOrEqual(5 - 1e-9);
    expect(desceu.x).toBeLessThan(aoLado.x + CORNER);
  });

  it("de frente para o móvel, não há desvio: o personagem para", () => {
    // No meio da linha da mesa, a quina está longe demais para contornar.
    const depois = andar(jogador(3.4, 2.5), entrada(1, 1), 60);
    expect(depois.x + RADIUS).toBeLessThanOrEqual(4);
    expect(depois.y).toBe(2.5);
    expect(depois.andando).toBe(false);
    // Preso por mais que a tolerância: também para.
    const dentro = andar(jogador(3.4, 3 + RADIUS - CORNER - 0.02), entrada(1, 1), 60);
    expect(dentro.x + RADIUS).toBeLessThanOrEqual(4);
  });

  it("o desvio só vale para quem anda reto: na diagonal, cada eixo segue a própria regra", () => {
    // Para a direita na tela (+x e -y no mundo), junto da mesma quina.
    const origem = jogador(3.4, 3.2);
    const depois = andar(origem, entrada(1, 0), 30);
    expect(depois.y).toBeLessThanOrEqual(origem.y);
    expect(depois.x + RADIUS).toBeLessThanOrEqual(4);
  });

  it("não entra na saída fechada e entra na aberta", () => {
    const diante = jogador(7.5, 3.5);
    const fechada = andar(diante, entrada(1, 1), 60, false);
    expect(Math.floor(fechada.x)).toBe(7);
    expect(isOnExit(fechada, CENA)).toBe(false);

    const aberta = andar(diante, entrada(1, 1), 60, true);
    expect(Math.floor(aberta.x)).toBe(8);
    expect(isOnExit(aberta, CENA)).toBe(true);
    // Mas não sai do mundo pela saída.
    expect(aberta.x + RADIUS).toBeLessThanOrEqual(CENA.largura);
  });

  it("isOnExit olha a célula sob o personagem", () => {
    expect(isOnExit(jogador(8.5, 3.5), CENA)).toBe(true);
    expect(isOnExit(jogador(8.1, 3.9), CENA)).toBe(true);
    expect(isOnExit(jogador(7.9, 3.5), CENA)).toBe(false);
    expect(isOnExit(initialPlayer(CENA), CENA)).toBe(false);
  });
});

describe("interação", () => {
  it("lista os registros ainda no cenário, o guia e a saída, nos centros das células", () => {
    expect(listInteractables(CENA, CAPITULO, [])).toEqual([
      { tipo: "registro", id: "r1", x: 2.5, y: 4.5 },
      { tipo: "registro", id: "r2", x: 6.5, y: 4.5 },
      { tipo: "guia", id: "guia", x: 1.5, y: 3.5 },
      { tipo: "saida", id: "saida", x: 8.5, y: 3.5 },
    ]);
  });

  it("tira os registros recolhidos", () => {
    expect(listInteractables(CENA, CAPITULO, ["r1"]).map((item) => item.id)).toEqual(["r2", "guia", "saida"]);
    expect(listInteractables(CENA, CAPITULO, ["r1", "r2"]).map((item) => item.id)).toEqual(["guia", "saida"]);
  });

  it("registro sem posição na cena fica de fora", () => {
    const tresRegistros: ChapterSpec = { ...CAPITULO, eventIds: ["r1", "r2", "r3"] };
    expect(listInteractables(CENA, tresRegistros, []).filter((item) => item.tipo === "registro")).toHaveLength(2);
  });

  it("a distância é a euclidiana entre centros", () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });

  it("dentro do alcance devolve o mais próximo; fora, nada", () => {
    const itens = listInteractables(CENA, CAPITULO, []);
    expect(nearestInteractable(jogador(2.5, 4.5), itens)?.id).toBe("r1");
    expect(nearestInteractable(jogador(3.5, 4.5), itens)?.id).toBe("r1");
    expect(nearestInteractable(jogador(3.8, 4.5), itens)).toBeNull();
    expect(nearestInteractable(jogador(4.5, 1.5), itens)).toBeNull();
    expect(REACH).toBeGreaterThan(1);
    expect(REACH).toBeLessThan(1.5);
  });

  it("com dois ao alcance, escolhe o mais perto", () => {
    const itens = listInteractables(CENA, CAPITULO, []);
    // Entre o guia (1.5, 3.5) e o registro 1 (2.5, 4.5).
    expect(nearestInteractable(jogador(1.9, 3.8), itens)?.id).toBe("guia");
    expect(nearestInteractable(jogador(2.2, 4.3), itens)?.id).toBe("r1");
  });

  it("o guia e a saída também estão ao alcance a partir da célula vizinha", () => {
    const itens = listInteractables(CENA, CAPITULO, ["r1", "r2"]);
    expect(nearestInteractable(jogador(2.5, 3.5), itens)?.id).toBe("guia");
    expect(nearestInteractable(jogador(7.5, 3.5), itens)?.id).toBe("saida");
  });

  it("sem itens, nada ao alcance", () => {
    expect(nearestInteractable(jogador(2.5, 4.5), [])).toBeNull();
  });
});

describe("câmera", () => {
  const caixa = sceneBounds(CENA);

  const larguraDaCena = caixa.maxX - caixa.minX;
  const alturaDaCena = caixa.maxY - caixa.minY;

  it("em tela estreita vale o piso por largura: a cena não cabe e a câmera segue o personagem", () => {
    // Celular em pé, celular deitado e tablet estreito: o piso mantém o personagem legível.
    expect(zoomFor(CENA, { largura: 320, altura: 568 })).toBe(0.85);
    expect(zoomFor(CENA, { largura: 479, altura: 320 })).toBe(0.85);
    expect(zoomFor(CENA, { largura: 600, altura: 400 })).toBe(0.95);
    expect(zoomFor(CENA, { largura: 767, altura: 320 })).toBe(0.95);
    expect(zoomFor(CENA, { largura: 800, altura: 300 })).toBe(1);
    // Nesses zooms a cena é maior que a tela em pelo menos um eixo: na
    // largura, no celular em pé; na altura, na janela baixa.
    expect(larguraDaCena * 0.85).toBeGreaterThan(479);
    expect(alturaDaCena * 0.95).toBeGreaterThan(320);
  });

  it("quando a cena cabe, ocupa quase toda a tela, sem passar do teto", () => {
    const viewport = { largura: 1280, altura: 720 };
    const zoom = zoomFor(CENA, viewport);
    expect(zoom).toBeGreaterThanOrEqual(1);
    expect(larguraDaCena * zoom).toBeLessThanOrEqual(viewport.largura);
    expect(alturaDaCena * zoom).toBeLessThanOrEqual(viewport.altura);
    expect(alturaDaCena * zoom).toBeGreaterThan(viewport.altura * 0.8);
    // Uma tela enorme não amplia sem limite.
    expect(zoomFor(CENA, { largura: 10_000, altura: 10_000 })).toBe(1.9);
  });

  it("o zoom não diminui quando a tela alarga", () => {
    const larguras = [320, 480, 768, 1200, 1920, 3840];
    const zooms = larguras.map((largura) => zoomFor(CENA, { largura, altura: 800 }));
    for (let i = 1; i < zooms.length; i += 1) expect(zooms[i]!, `${larguras[i]}px`).toBeGreaterThanOrEqual(zooms[i - 1]!);
    expect(zooms[0]).toBeLessThan(zooms.at(-1)!);
  });

  it("a caixa da cena envolve os quatro cantos, com margem para paredes e personagens", () => {
    expect(caixa.minX).toBeLessThan(toScreen(0, CENA.altura).sx);
    expect(caixa.maxX).toBeGreaterThan(toScreen(CENA.largura, 0).sx);
    expect(caixa.minY).toBeLessThan(toScreen(0, 0).sy);
    expect(caixa.maxY).toBeGreaterThan(toScreen(CENA.largura, CENA.altura).sy);
    // Margem de cima maior, para as paredes de trás e a cabeça do personagem.
    expect(toScreen(0, 0).sy - caixa.minY).toBeGreaterThan(caixa.maxY - toScreen(CENA.largura, CENA.altura).sy);
  });

  it("zoomToFit faz a cena inteira caber na tela, e não passa de 1,4", () => {
    const largura = caixa.maxX - caixa.minX;
    const altura = caixa.maxY - caixa.minY;
    for (const viewport of [
      { largura: 360, altura: 640 },
      { largura: 1024, altura: 400 },
      { largura: 1280, altura: 720 },
    ]) {
      const zoom = zoomToFit(CENA, viewport);
      expect(largura * zoom).toBeLessThanOrEqual(viewport.largura + 1e-9);
      expect(altura * zoom).toBeLessThanOrEqual(viewport.altura + 1e-9);
    }
    expect(zoomToFit(CENA, { largura: 10_000, altura: 10_000 })).toBe(1.4);
  });

  it("clampCenter mantém a tela dentro da cena quando a cena é maior que a tela", () => {
    const viewport = { largura: 200, altura: 100 };
    const zoom = 1;
    const meiaLargura = viewport.largura / zoom / 2;
    const meiaAltura = viewport.altura / zoom / 2;

    const direita = clampCenter(10_000, 10_000, CENA, viewport, zoom);
    expect(direita).toEqual({ cx: caixa.maxX - meiaLargura, cy: caixa.maxY - meiaAltura });
    const esquerda = clampCenter(-10_000, -10_000, CENA, viewport, zoom);
    expect(esquerda).toEqual({ cx: caixa.minX + meiaLargura, cy: caixa.minY + meiaAltura });

    const dentro = { cx: (caixa.minX + caixa.maxX) / 2, cy: (caixa.minY + caixa.maxY) / 2 };
    expect(clampCenter(dentro.cx, dentro.cy, CENA, viewport, zoom)).toEqual(dentro);
  });

  it("o zoom entra na conta do que a tela mostra", () => {
    const viewport = { largura: 200, altura: 100 };
    const comZoom = clampCenter(10_000, 10_000, CENA, viewport, 2);
    expect(comZoom).toEqual({ cx: caixa.maxX - 50, cy: caixa.maxY - 25 });
  });

  it("quando a tela é maior que a cena, a cena fica centrada", () => {
    const viewport = { largura: 4000, altura: 3000 };
    const centro = { cx: (caixa.minX + caixa.maxX) / 2, cy: (caixa.minY + caixa.maxY) / 2 };
    expect(clampCenter(10_000, -10_000, CENA, viewport, 1)).toEqual(centro);
    expect(clampCenter(0, 0, CENA, viewport, 1)).toEqual(centro);
  });

  it("com movimento reduzido, a câmera vai direto ao alvo", () => {
    const camera: Camera = { cx: 0, cy: 0, zoom: 1.15 };
    expect(followCamera(camera, { cx: 300, cy: -120 }, DT, false)).toEqual({ cx: 300, cy: -120, zoom: 1.15 });
  });

  it("com movimento, se aproxima aos poucos e acaba encostando", () => {
    const camera: Camera = { cx: 0, cy: 0, zoom: 1 };
    const alvo = { cx: 300, cy: -120 };
    const umQuadro = followCamera(camera, alvo, DT, true);
    expect(umQuadro.cx).toBeGreaterThan(0);
    expect(umQuadro.cx).toBeLessThan(alvo.cx);
    expect(umQuadro.cy).toBeLessThan(0);
    expect(umQuadro.cy).toBeGreaterThan(alvo.cy);
    expect(umQuadro.zoom).toBe(1);

    // Mais tempo, mais perto: a aproximação é monótona.
    const doisQuadros = followCamera(umQuadro, alvo, DT, true);
    expect(doisQuadros.cx).toBeGreaterThan(umQuadro.cx);

    let atual = camera;
    for (let i = 0; i < 180; i += 1) atual = followCamera(atual, alvo, DT, true);
    expect(atual.cx).toBe(alvo.cx);
    expect(atual.cy).toBe(alvo.cy);
  });

  it("já no alvo, fica no alvo", () => {
    const camera: Camera = { cx: 40, cy: 20, zoom: 1 };
    expect(followCamera(camera, { cx: 40, cy: 20 }, DT, true)).toEqual(camera);
  });

  it("project leva o centro da câmera ao centro da tela e aplica o zoom", () => {
    const camera: Camera = { cx: 100, cy: 50, zoom: 2 };
    const viewport = { largura: 800, altura: 600 };
    expect(project(camera, viewport, 100, 50)).toEqual({ px: 400, py: 300 });
    expect(project(camera, viewport, 110, 70)).toEqual({ px: 420, py: 340 });
    expect(project({ ...camera, zoom: 1 }, viewport, 110, 70)).toEqual({ px: 410, py: 320 });
  });
});

describe("direcional de toque", () => {
  const MEIO = 72;

  it("no centro, e dentro da zona morta, o personagem fica parado", () => {
    expect(directionFor(0, 0, MEIO)).toEqual([0, 0]);
    expect(directionFor(MEIO * DEAD_ZONE * 0.9, 0, MEIO)).toEqual([0, 0]);
    expect(directionFor(0, -MEIO * DEAD_ZONE * 0.9, MEIO)).toEqual([0, 0]);
  });

  it("as quatro direções retas", () => {
    expect(directionFor(MEIO * 0.8, 0, MEIO)).toEqual([1, 0]);
    expect(directionFor(-MEIO * 0.8, 0, MEIO)).toEqual([-1, 0]);
    expect(directionFor(0, MEIO * 0.8, MEIO)).toEqual([0, 1]);
    expect(directionFor(0, -MEIO * 0.8, MEIO)).toEqual([0, -1]);
  });

  it("as quatro diagonais, que são os corredores do cenário", () => {
    expect(directionFor(MEIO * 0.6, MEIO * 0.6, MEIO)).toEqual([1, 1]);
    expect(directionFor(-MEIO * 0.6, MEIO * 0.6, MEIO)).toEqual([-1, 1]);
    expect(directionFor(MEIO * 0.6, -MEIO * 0.6, MEIO)).toEqual([1, -1]);
    expect(directionFor(-MEIO * 0.6, -MEIO * 0.6, MEIO)).toEqual([-1, -1]);
  });

  it("perto de um eixo a direção é reta: um dedo um pouco torto não vira diagonal", () => {
    // 15 graus acima da horizontal ainda é "direita".
    expect(directionFor(Math.cos(Math.PI / 12) * 50, -Math.sin(Math.PI / 12) * 50, MEIO)).toEqual([1, 0]);
    // 30 graus já é diagonal.
    expect(directionFor(Math.cos(Math.PI / 6) * 50, -Math.sin(Math.PI / 6) * 50, MEIO)).toEqual([1, -1]);
  });

  it("a direção do toque vira o mesmo movimento das teclas", () => {
    const [dx, dy] = directionFor(MEIO * 0.6, MEIO * 0.6, MEIO);
    const mundo = inputToWorld({ dx, dy });
    // Direita e para baixo na tela: só o eixo x do mundo.
    expect(mundo.x).toBeCloseTo(1, 10);
    expect(mundo.y).toBeCloseTo(0, 10);
  });

  it("um direcional sem tamanho não inventa direção", () => {
    expect(directionFor(10, 10, 0)).toEqual([0, 0]);
  });
});
