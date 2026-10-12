// Os cenários das fases e o caminho do boneco (src/lib/game/scenes,
// world/grid.ts e world/path.ts, D-137): o mapa de cada cena bate com o que
// ela declara, há caminho a pé do início até cada pasta, e a caminhada é
// curta, previsível e só decorativa: ninguém dirige o personagem.

import { describe, expect, it } from "vitest";

import { readSources, resolvePaths } from "@/lib/content/sources";
import { PROFILES } from "@/lib/domain/profiles";
import { buildGameContent } from "@/lib/game/content";
import { PHASE_PRESENTATION, presentationOf } from "@/lib/game/presentation";
import { ROOM_IDS } from "@/lib/game/rooms";
import { SCENES, getScene } from "@/lib/game/scenes";
import type { PlayerState, SceneId, SceneSpec } from "@/lib/game/types";
import { DISTANCIA_ENTRE_PASTAS, LADO_LIVRE_MINIMO, NO_INSETS, ZOOM_MAXIMO, ZOOM_MINIMO, clampCenter, frameScene, freeArea, project, sceneBounds, spacedMarkers, zoomFor, zoomToFit } from "@/lib/game/world/camera";
import { CELL, cellAt, isBlocked, isMarkerCell, isPropCell, neighbours, reachable, readMarkers } from "@/lib/game/world/grid";
import { CHARACTER_HEIGHT, TILE_H, TILE_W, facingOf, isFront, isMirrored, toScreen, toWorld } from "@/lib/game/world/iso";
import { MAX_WALK_SECONDS, SPEED, cellOf, findPath, initialPlayer, pathToMarker, stepWalk, walkAlong } from "@/lib/game/world/path";
import { buildAtlasData } from "@/lib/publication/build";

const data = buildAtlasData(readSources(resolvePaths())).data!;
const FASES = PROFILES.flatMap((perfil) => ROOM_IDS.flatMap((sala) => buildGameContent(data, perfil.slug, sala)!.fases));

// Uma sala de 9 por 7: início no canto, guia na parede oeste, porta na leste,
// um móvel no meio e duas pastas embaixo.
const CENA: SceneSpec = {
  id: "sindicato",
  arte: "sindicato",
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

const chave = (c: { x: number; y: number }) => `${c.x},${c.y}`;
const DT = 1 / 60;

/** Células de um caractere do mapa. */
function cellsOf(scene: SceneSpec, caractere: string): string[] {
  const celulas: string[] = [];
  scene.mapa.forEach((linha, y) => {
    for (let x = 0; x < linha.length; x += 1) if (linha[x] === caractere) celulas.push(chave({ x, y }));
  });
  return celulas.sort();
}

describe("grade de uma cena", () => {
  it("fora do mapa é parede, e dentro vale o caractere da célula", () => {
    expect(cellAt(CENA, -1, 1)).toBe(CELL.parede);
    expect(cellAt(CENA, CENA.largura, 1)).toBe(CELL.parede);
    expect(cellAt(CENA, 1, CENA.altura)).toBe(CELL.parede);
    expect(cellAt(CENA, 1, 1)).toBe(CELL.spawn);
    expect(cellAt(CENA, 1, 3)).toBe(CELL.guia);
    expect(cellAt(CENA, 8, 3)).toBe(CELL.saida);
    expect(cellAt(CENA, 2, 4)).toBe("1");
  });

  it("parede, guia, porta, móvel e pasta bloqueiam; chão, início e decoração não", () => {
    expect(isBlocked(CENA, 0, 0)).toBe(true);
    expect(isBlocked(CENA, 1, 3)).toBe(true);
    // A porta é sinal, e não passagem: ninguém a atravessa.
    expect(isBlocked(CENA, 8, 3)).toBe(true);
    expect(isBlocked(CENA, 4, 2)).toBe(true);
    expect(isBlocked(CENA, 6, 5)).toBe(true);
    // O boneco para ao lado da pasta, e não em cima dela.
    expect(isBlocked(CENA, 2, 4)).toBe(true);
    expect(isMarkerCell(CENA, 2, 4)).toBe(true);
    expect(isMarkerCell(CENA, 3, 4)).toBe(false);
    expect(isBlocked(CENA, 3, 3)).toBe(false);
    expect(isBlocked(CENA, 1, 1)).toBe(false);
    expect(isBlocked(CENA, 6, 1)).toBe(false);
    expect(isPropCell(CENA, 6, 1)).toBe(false);
    expect(isPropCell(CENA, 6, 5)).toBe(true);
    // Coordenadas contínuas caem na célula do piso.
    expect(isBlocked(CENA, 4.9, 2.1)).toBe(true);
    expect(isBlocked(CENA, 3.99, 2.5)).toBe(false);
  });

  it("lê do mapa o início, o guia, a porta e as pastas, na ordem dos números", () => {
    expect(readMarkers(CENA)).toEqual({ spawn: { x: 1, y: 1 }, guia: { x: 1, y: 3 }, saida: { x: 8, y: 3 }, registros: [{ x: 2, y: 4 }, { x: 6, y: 4 }] });
    const vazia: SceneSpec = { ...CENA, mapa: ["###", "#.#", "###"], largura: 3, altura: 3 };
    expect(readMarkers(vazia)).toEqual({ spawn: null, guia: null, saida: null, registros: [] });
  });

  it("as quatro vizinhas são as ortogonais, sempre na mesma ordem", () => {
    expect(neighbours({ x: 3, y: 3 })).toEqual([{ x: 4, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 4 }, { x: 3, y: 2 }]);
  });

  it("a pé se chega ao lado de cada pasta e do guia, e nunca à porta, a um móvel ou a uma pasta", () => {
    const alcance = reachable(CENA, CENA.spawn);
    expect(alcance.has("3,4")).toBe(true);
    expect(alcance.has("2,3")).toBe(true);
    for (const bloqueada of ["2,4", "6,4", "1,3", "4,2", "6,5", "8,3", "0,1"]) expect(alcance.has(bloqueada), bloqueada).toBe(false);
    // O interior tem 7 por 5 células; o guia, a mesa, a cadeira e as duas pastas ficam de fora.
    expect(alcance.size).toBe(35 - 5);
  });
});

describe("caminho do boneco até uma pasta", () => {
  it("o boneco nasce no centro da célula de início, parado e de frente", () => {
    expect(initialPlayer(CENA)).toEqual({ x: 1.5, y: 1.5, facing: "frente-direita", andando: false, fase: 0 });
    expect(cellOf({ x: 1.5, y: 1.99 })).toEqual({ x: 1, y: 1 });
  });

  it("o caminho é o mais curto, de célula em célula, sem diagonal e sem atravessar o que bloqueia", () => {
    const caminho = findPath(CENA, CENA.spawn, { x: 3, y: 4 })!;
    expect(caminho[0]).toEqual(CENA.spawn);
    expect(caminho.at(-1)).toEqual({ x: 3, y: 4 });
    // Distância de Manhattan mais um: nenhum passo desperdiçado.
    expect(caminho).toHaveLength(Math.abs(3 - 1) + Math.abs(4 - 1) + 1);
    for (let i = 1; i < caminho.length; i += 1) {
      const passo = Math.abs(caminho[i]!.x - caminho[i - 1]!.x) + Math.abs(caminho[i]!.y - caminho[i - 1]!.y);
      expect(passo, `passo ${i}`).toBe(1);
      expect(isBlocked(CENA, caminho[i]!.x, caminho[i]!.y)).toBe(false);
    }
  });

  it("o mesmo pedido dá sempre o mesmo caminho: não há sorteio", () => {
    expect(findPath(CENA, CENA.spawn, { x: 7, y: 5 })).toEqual(findPath(CENA, CENA.spawn, { x: 7, y: 5 }));
  });

  it("não há caminho até uma célula bloqueada, nem até um lugar fechado", () => {
    expect(findPath(CENA, CENA.spawn, { x: 4, y: 2 })).toBeNull();
    expect(findPath(CENA, CENA.spawn, { x: 2, y: 4 })).toBeNull();
    const fechada: SceneSpec = { ...CENA, mapa: ["#####", "#S#.#", "#####"], largura: 5, altura: 3, props: [], registros: [] };
    expect(findPath(fechada, { x: 1, y: 1 }, { x: 3, y: 1 })).toBeNull();
  });

  it("o boneco vai até a célula livre ao lado da pasta que fica mais perto, e não até a pasta", () => {
    const [primeira, segunda] = CENA.registros as [{ x: number; y: number }, { x: number; y: number }];
    for (const pasta of [primeira, segunda]) {
      const caminho = pathToMarker(CENA, CENA.spawn, pasta)!;
      const fim = caminho.at(-1)!;
      expect(Math.abs(fim.x - pasta.x) + Math.abs(fim.y - pasta.y), chave(pasta)).toBe(1);
      expect(isBlocked(CENA, fim.x, fim.y), chave(pasta)).toBe(false);
      // Nenhuma outra célula ao lado da pasta está mais perto.
      for (const vizinha of neighbours(pasta)) {
        const outro = findPath(CENA, CENA.spawn, vizinha);
        if (outro !== null) expect(caminho.length, chave(pasta)).toBeLessThanOrEqual(outro.length);
      }
    }
    // Já ao lado da pasta, o caminho tem só a célula em que o boneco está.
    expect(pathToMarker(CENA, { x: 3, y: 4 }, primeira)).toEqual([{ x: 3, y: 4 }]);
    // Pasta cercada: sem célula livre ao lado, não há caminho, e a explicação abre sem a caminhada.
    const cercada: SceneSpec = { ...CENA, mapa: ["#####", "#S#1#", "#####"], largura: 5, altura: 3, props: [], registros: [{ x: 3, y: 1 }] };
    expect(pathToMarker(cercada, { x: 1, y: 1 }, { x: 3, y: 1 })).toBeNull();
  });

  it("a caminhada passa pelos centros das células, e o ponto em que o boneco já está fica de fora", () => {
    const caminho = pathToMarker(CENA, CENA.spawn, CENA.registros[0]!)!;
    const caminhada = walkAlong(caminho, CENA.registros[0]!);
    expect(caminhada.pontos).toEqual(caminho.slice(1).map((cell) => ({ x: cell.x + 0.5, y: cell.y + 0.5 })));
    expect(caminhada.alvo).toEqual({ x: 2.5, y: 4.5 });
    expect(caminhada.velocidade).toBe(SPEED);
  });

  it("a caminhada nunca passa do tempo máximo: um caminho longo é percorrido mais depressa", () => {
    const longo = Array.from({ length: 30 }, (_, x) => ({ x, y: 0 }));
    const caminhada = walkAlong(longo, { x: 30, y: 0 });
    expect(caminhada.velocidade).toBeGreaterThan(SPEED);
    expect(caminhada.pontos.length / caminhada.velocidade).toBeCloseTo(MAX_WALK_SECONDS, 10);
    // Em toda cena de verdade, a caminhada mais longa também cabe no tempo máximo.
    for (const scene of Object.values(SCENES)) {
      for (const pasta of scene.registros) {
        const caminho = pathToMarker(scene, scene.spawn, pasta)!;
        const andar = walkAlong(caminho, pasta);
        expect(andar.pontos.length / andar.velocidade, `${scene.id} ${chave(pasta)}`).toBeLessThanOrEqual(MAX_WALK_SECONDS + 1e-9);
      }
    }
  });

  it("passo a passo, o boneco chega, para e fica virado para a pasta, sem mudar o que recebeu", () => {
    const pasta = CENA.registros[1]!;
    const caminho = pathToMarker(CENA, CENA.spawn, pasta)!;
    let caminhada = walkAlong(caminho, pasta);
    let boneco: PlayerState = initialPlayer(CENA);
    const inicio = { ...boneco };
    let quadros = 0;
    let chegou = false;
    while (!chegou && quadros < 600) {
      const passo = stepWalk(boneco, caminhada, DT);
      // No meio do caminho ele anda, e nunca entra em célula bloqueada.
      if (!passo.chegou) expect(passo.player.andando).toBe(true);
      expect(isBlocked(CENA, passo.player.x, passo.player.y), `quadro ${quadros}`).toBe(false);
      boneco = passo.player;
      caminhada = passo.walk;
      chegou = passo.chegou;
      quadros += 1;
    }
    expect(chegou).toBe(true);
    expect(quadros * DT).toBeLessThanOrEqual(MAX_WALK_SECONDS + DT);
    const fim = caminho.at(-1)!;
    expect(boneco.x).toBeCloseTo(fim.x + 0.5, 10);
    expect(boneco.y).toBeCloseTo(fim.y + 0.5, 10);
    expect(boneco.andando).toBe(false);
    expect(boneco.fase).toBe(0);
    expect(boneco.facing).toBe(facingOf(pasta.x + 0.5 - boneco.x, pasta.y + 0.5 - boneco.y, boneco.facing));
    expect(inicio).toEqual(initialPlayer(CENA));
    // Com o caminho vazio (já ao lado da pasta), chega no primeiro passo.
    const parado = stepWalk(boneco, walkAlong([fim], pasta), DT);
    expect(parado.chegou).toBe(true);
    expect(parado.player.andando).toBe(false);
  });
});

describe("cenas das fases publicadas", () => {
  const cenas = Object.values(SCENES);

  it("toda fase publicada tem a linha de apresentação dela, e nenhuma linha sobra", () => {
    expect(Object.keys(PHASE_PRESENTATION).sort()).toEqual(FASES.map((fase) => fase.id).sort());
    for (const fase of FASES) {
      expect(presentationOf(fase.id, fase.personagem, fase.sala)).toEqual({ cena: fase.cena, epoca: fase.epoca });
      expect(getScene(fase.cena).id, fase.id).toBe(fase.cena);
    }
    // Uma fase que o conteúdo publicasse sem linha no código abriria na sala de arquivo do personagem, e não quebraria.
    expect(presentationOf("fase-nova", "lula", "historico")).toEqual({ cena: "arquivo-origem-a", epoca: "atual" });
    expect(presentationOf("fase-nova", "flavio-bolsonaro", "economia")).toEqual({ cena: "arquivo-economia-b", epoca: "atual" });
  });

  it("toda cena é usada por alguma fase, e as fases de origem ficam em uma sala de arquivo: o jogo não desenha a infância de ninguém", () => {
    expect([...new Set(FASES.map((fase) => fase.cena))].sort()).toEqual((Object.keys(SCENES) as SceneId[]).sort());
    for (const perfil of PROFILES) {
      const origem = FASES.find((fase) => fase.personagem === perfil.slug && fase.sala === "historico" && fase.numero === 1)!;
      expect(origem.cena, perfil.slug).toMatch(/^arquivo-origem-[ab]$/);
      expect(getScene(origem.cena).nome, perfil.slug).toMatch(/arquivo/i);
    }
  });

  it("na trajetória, a figura do personagem segue a ordem das fases, e os dois passam pelas três épocas", () => {
    const ordem = { inicio: 0, meio: 1, atual: 2 };
    for (const perfil of PROFILES) {
      const epocas = FASES.filter((fase) => fase.personagem === perfil.slug && fase.sala === "historico").map((fase) => fase.epoca);
      for (let i = 1; i < epocas.length; i += 1) expect(ordem[epocas[i]!], `${perfil.slug} fase ${i + 1}`).toBeGreaterThanOrEqual(ordem[epocas[i - 1]!]);
      expect([...new Set(epocas)].sort(), perfil.slug).toEqual(["atual", "inicio", "meio"]);
    }
  });

  it("o mapa tem as dimensões declaradas e é fechado por paredes, com a porta na borda do lado dito", () => {
    for (const scene of cenas) {
      expect(scene.mapa.length, scene.id).toBe(scene.altura);
      for (const linha of scene.mapa) expect(linha.length, scene.id).toBe(scene.largura);
      for (let y = 0; y < scene.altura; y += 1) {
        for (let x = 0; x < scene.largura; x += 1) {
          const borda = x === 0 || y === 0 || x === scene.largura - 1 || y === scene.altura - 1;
          const celula = cellAt(scene, x, y);
          if (borda) expect([CELL.parede, CELL.saida], `${scene.id} (${x},${y})`).toContain(celula);
          else expect(celula, `${scene.id} (${x},${y})`).not.toBe(CELL.parede);
        }
      }
      const { x, y, lado } = scene.saida;
      const esperado = { norte: y === 0, sul: y === scene.altura - 1, leste: x === scene.largura - 1, oeste: x === 0 }[lado];
      expect(esperado, `${scene.id} porta ${lado}`).toBe(true);
    }
  });

  it("os marcadores do mapa batem com o início, o guia, a porta e as pastas da cena", () => {
    for (const scene of cenas) {
      const marcadores = readMarkers(scene);
      expect(marcadores.spawn, scene.id).toEqual(scene.spawn);
      expect(marcadores.guia, scene.id).toEqual(scene.guia);
      expect(marcadores.saida, scene.id).toEqual({ x: scene.saida.x, y: scene.saida.y });
      expect(marcadores.registros, scene.id).toEqual(scene.registros);
      expect(cellsOf(scene, CELL.spawn), scene.id).toHaveLength(1);
      expect(cellsOf(scene, CELL.guia), scene.id).toHaveLength(1);
      expect(cellsOf(scene, CELL.saida), scene.id).toHaveLength(1);
      for (let n = 1; n <= scene.registros.length; n += 1) expect(cellsOf(scene, String(n)), `${scene.id} pasta ${n}`).toHaveLength(1);
    }
  });

  it("toda célula 'o' tem um elemento que bloqueia, e todo elemento que bloqueia está numa célula 'o'", () => {
    for (const scene of cenas) {
      const bloqueiam = scene.props.filter((prop) => prop.tipo !== "decoracao").map(chave);
      expect(new Set(bloqueiam).size, scene.id).toBe(bloqueiam.length);
      expect(bloqueiam.sort(), scene.id).toEqual(cellsOf(scene, CELL.prop));
      for (const prop of scene.props.filter((item) => item.tipo === "decoracao")) expect(cellAt(scene, prop.x, prop.y), `${scene.id} decoração (${prop.x},${prop.y})`).toBe(CELL.chao);
      // O tapete é desenho de chão: pode ter uma pasta em cima, mas não fica sob parede, móvel, guia ou porta.
      for (const tapete of scene.tapetes) {
        const onde = `${scene.id} tapete (${tapete.x},${tapete.y})`;
        expect([CELL.parede, CELL.prop, CELL.guia, CELL.saida], onde).not.toContain(cellAt(scene, tapete.x, tapete.y));
        expect(isPropCell(scene, tapete.x, tapete.y), onde).toBe(false);
      }
    }
  });

  it("toda cena tem a pasta do marco, e do início há caminho a pé até o lado de cada pasta", () => {
    for (const scene of cenas) {
      expect(scene.registros.length, scene.id).toBeGreaterThanOrEqual(1);
      expect(isBlocked(scene, scene.spawn.x, scene.spawn.y), `${scene.id} início`).toBe(false);
      for (const pasta of scene.registros) {
        const caminho = pathToMarker(scene, scene.spawn, pasta);
        expect(caminho, `${scene.id} pasta ${chave(pasta)}`).not.toBeNull();
        expect(caminho![0], scene.id).toEqual(scene.spawn);
        // Nenhuma pasta fica colada à porta, onde ela a esconderia.
        expect(Math.abs(pasta.x - scene.saida.x) + Math.abs(pasta.y - scene.saida.y), `${scene.id} pasta ${chave(pasta)}`).toBeGreaterThan(1);
        // Nem atrás dela. Na tela, a coluna de uma célula é x − y e a profundidade é x + y. O portal ocupa duas colunas
        // e passa da cabeça do personagem: uma pasta nessas colunas, a menos de seis passos para o fundo, fica atrás da verga.
        const coluna = scene.saida.x - scene.saida.y - (pasta.x - pasta.y);
        const fundo = scene.saida.x + scene.saida.y - (pasta.x + pasta.y);
        const noPortal = scene.saida.lado === "leste" || scene.saida.lado === "oeste" ? coluna === 0 || coluna === 1 : coluna === 0 || coluna === -1;
        expect(noPortal && fundo > 0 && fundo < 6, `${scene.id} pasta ${chave(pasta)} atrás da porta`).toBe(false);
      }
      // De onde o boneco para, ao lado de uma pasta, se chega a qualquer outra: abrir um registro opcional depois do marco não o prende.
      for (const origem of scene.registros) {
        const partida = pathToMarker(scene, scene.spawn, origem)!.at(-1)!;
        for (const destino of scene.registros) expect(pathToMarker(scene, partida, destino), `${scene.id} de ${chave(origem)} a ${chave(destino)}`).not.toBeNull();
      }
    }
  });

  it("a cena de toda fase tem ao menos a posição da pasta do marco", () => {
    for (const fase of FASES) {
      const posicoes = getScene(fase.cena).registros.length;
      // O cenário mostra o marco e os registros opcionais que couberem nas posições da cena; os outros ficam só na lista da fase.
      expect(posicoes, fase.id).toBeGreaterThanOrEqual(1);
    }
  });
});

describe("projeção e câmera", () => {
  it("a célula tem 64 por 32 pixels, e a projeção e a volta são inversas", () => {
    expect([TILE_W, TILE_H, CHARACTER_HEIGHT]).toEqual([64, 32, 68]);
    expect(toScreen(1, 0)).toEqual({ sx: TILE_W / 2, sy: TILE_H / 2 });
    expect(toScreen(0, 1)).toEqual({ sx: -TILE_W / 2, sy: TILE_H / 2 });
    for (const [x, y] of [[0, 0], [3, 1], [2.5, 4.5], [-1.5, 2]] as const) {
      const { sx, sy } = toScreen(x, y);
      expect(toWorld(sx, sy).x).toBeCloseTo(x, 10);
      expect(toWorld(sx, sy).y).toBeCloseTo(y, 10);
    }
  });

  it("o olhar segue o eixo dominante do movimento, e parado mantém a direção", () => {
    expect(facingOf(0, 0, "costas-direita")).toBe("costas-direita");
    expect(facingOf(1, 0, "costas-direita")).toBe("frente-direita");
    expect(facingOf(-1, 0, "frente-direita")).toBe("costas-esquerda");
    expect(facingOf(0, 1, "frente-direita")).toBe("frente-esquerda");
    expect(facingOf(0.3, -0.9, "frente-direita")).toBe("costas-direita");
    expect(isFront("frente-esquerda")).toBe(true);
    expect(isFront("costas-direita")).toBe(false);
    expect(isMirrored("costas-esquerda")).toBe(true);
    expect(isMirrored("frente-direita")).toBe(false);
  });

  it("o zoom da cena em jogo faz a cena inteira caber na área dada, com folga, entre o mínimo e o máximo", () => {
    const caixa = sceneBounds(CENA);
    const largura = caixa.maxX - caixa.minX;
    const altura = caixa.maxY - caixa.minY;
    for (const viewport of [{ largura: 390, altura: 460 }, { largura: 768, altura: 900 }, { largura: 1440, altura: 760 }, { largura: 1024, altura: 468 }]) {
      const zoom = zoomFor(CENA, viewport);
      expect(zoom, JSON.stringify(viewport)).toBeGreaterThan(ZOOM_MINIMO);
      // A cena inteira cabe: na largura, a sala de ponta a ponta (a caixa menos meio ladrilho de margem de cada lado); na altura, a caixa toda.
      expect((largura - TILE_W) * zoom).toBeLessThan(viewport.largura);
      expect(altura * zoom).toBeLessThan(viewport.altura);
    }
    // Área pequena demais: o zoom não desce do mínimo. Área enorme: não passa do máximo.
    expect(zoomFor(CENA, { largura: 200, altura: 120 })).toBe(ZOOM_MINIMO);
    expect(zoomFor(CENA, { largura: 10_000, altura: 10_000 })).toBe(ZOOM_MAXIMO);
    const larguras = [320, 480, 768, 1200, 1920];
    const zooms = larguras.map((item) => zoomFor(CENA, { largura: item, altura: 800 }));
    for (let i = 1; i < zooms.length; i += 1) expect(zooms[i]!, `${larguras[i]}px`).toBeGreaterThanOrEqual(zooms[i - 1]!);
    for (const viewport of [{ largura: 360, altura: 640 }, { largura: 1280, altura: 720 }]) {
      const zoom = zoomToFit(CENA, viewport);
      expect((caixa.maxX - caixa.minX) * zoom).toBeLessThanOrEqual(viewport.largura + 1e-9);
      expect((caixa.maxY - caixa.minY) * zoom).toBeLessThanOrEqual(viewport.altura + 1e-9);
    }
    expect(zoomToFit(CENA, { largura: 10_000, altura: 10_000 })).toBe(1.4);
  });

  it("a câmera não sai da cena e centra a cena que cabe na tela", () => {
    const caixa = sceneBounds(CENA);
    const viewport = { largura: 200, altura: 100 };
    expect(clampCenter(10_000, 10_000, CENA, viewport, 1)).toEqual({ cx: caixa.maxX - 100, cy: caixa.maxY - 50 });
    expect(clampCenter(-10_000, -10_000, CENA, viewport, 2)).toEqual({ cx: caixa.minX + 50, cy: caixa.minY + 25 });
    const centro = { cx: (caixa.minX + caixa.maxX) / 2, cy: (caixa.minY + caixa.maxY) / 2 };
    expect(clampCenter(10_000, -10_000, CENA, { largura: 4000, altura: 3000 }, 1)).toEqual(centro);
    expect(project({ cx: 100, cy: 50, zoom: 2 }, { largura: 800, altura: 600 }, 110, 70)).toEqual({ px: 420, py: 340 });
  });

  it("a área livre do palco desconta o cabeçalho da fase, o botão principal e, em janela baixa, o cartão ao lado", () => {
    expect(freeArea({ largura: 390, altura: 788 }, { topo: 260, base: 72 })).toEqual({ largura: 390, altura: 456, desvioX: 0, desvioY: 94 });
    expect(freeArea({ largura: 1440, altura: 836 }, { topo: 0, base: 80 })).toEqual({ largura: 1440, altura: 756, desvioX: 0, desvioY: -40 });
    expect(freeArea({ largura: 800, altura: 600 }, NO_INSETS)).toEqual({ largura: 800, altura: 600, desvioX: 0, desvioY: 0 });
    // Celular deitado: a cena fica à direita do cartão e abaixo dos botões.
    expect(freeArea({ largura: 844, altura: 326 }, { topo: 62, base: 80, esquerda: 440 })).toEqual({ largura: 404, altura: 184, desvioX: 220, desvioY: -9 });
    // A interface cobrindo quase tudo não dá área nula nem negativa.
    expect(freeArea({ largura: 320, altura: 504 }, { topo: 420, base: 72 })).toMatchObject({ largura: 320, altura: LADO_LIVRE_MINIMO });
    expect(freeArea({ largura: 300, altura: 300 }, { topo: 0, base: 0, esquerda: 290 }).largura).toBe(LADO_LIVRE_MINIMO);
  });

  it("em celular deitado, a cena inteira fica ao lado do cartão, abaixo dos botões e acima do botão principal", () => {
    const caixa = sceneBounds(CENA);
    const viewport = { largura: 844, altura: 326 };
    const margens = { topo: 62, base: 80, esquerda: 440 };
    const camera = frameScene(CENA, viewport, margens, null);
    const meio = project(camera, viewport, (caixa.minX + caixa.maxX) / 2, (caixa.minY + caixa.maxY) / 2);
    expect(meio.px).toBeCloseTo(440 + (844 - 440) / 2, 6);
    expect(meio.py).toBeCloseTo(62 + (326 - 62 - 80) / 2, 6);
    if (camera.zoom > ZOOM_MINIMO) {
      // A sala, de ponta a ponta, não entra embaixo do cartão.
      expect(project(camera, viewport, caixa.minX + TILE_W / 2, 0).px).toBeGreaterThanOrEqual(440 - 0.5);
      expect(project(camera, viewport, caixa.maxX - TILE_W / 2, 0).px).toBeLessThanOrEqual(844 + 0.5);
    }
  });

  it("o enquadramento põe a cena inteira no meio da área livre, em qualquer tela em que ela caiba", () => {
    const caixa = sceneBounds(CENA);
    const cantos = [
      [caixa.minX, caixa.minY],
      [caixa.maxX, caixa.minY],
      [caixa.minX, caixa.maxY],
      [caixa.maxX, caixa.maxY],
    ] as const;
    for (const [viewport, margens] of [
      [{ largura: 390, altura: 788 }, { topo: 260, base: 72 }],
      [{ largura: 360, altura: 584 }, { topo: 240, base: 72 }],
      [{ largura: 768, altura: 960 }, { topo: 0, base: 80 }],
      [{ largura: 1440, altura: 836 }, { topo: 0, base: 80 }],
      [{ largura: 1280, altura: 656 }, { topo: 0, base: 80 }],
    ] as const) {
      const camera = frameScene(CENA, viewport, margens, null);
      const rotulo = `${viewport.largura}×${viewport.altura}`;
      // Os quatro cantos da cena ficam dentro da faixa livre: abaixo do cabeçalho e acima do botão principal.
      // Na largura, a margem de meio ladrilho de cada lado da caixa pode passar da borda: a sala, não.
      for (const [sx, sy] of cantos) {
        const { px, py } = project(camera, viewport, sx, sy);
        expect(px, rotulo).toBeGreaterThanOrEqual((-TILE_W / 2) * camera.zoom);
        expect(px, rotulo).toBeLessThanOrEqual(viewport.largura + (TILE_W / 2) * camera.zoom);
        expect(py, rotulo).toBeGreaterThanOrEqual(margens.topo);
        expect(py, rotulo).toBeLessThanOrEqual(viewport.altura - margens.base);
      }
      // E o meio dela é o meio da faixa.
      const meio = project(camera, viewport, (caixa.minX + caixa.maxX) / 2, (caixa.minY + caixa.maxY) / 2);
      expect(meio.px, rotulo).toBeCloseTo(viewport.largura / 2, 6);
      expect(meio.py, rotulo).toBeCloseTo(margens.topo + (viewport.altura - margens.topo - margens.base) / 2, 6);
      // O alvo não muda nada quando a cena cabe.
      expect(frameScene(CENA, viewport, margens, { sx: caixa.maxX, sy: caixa.maxY })).toEqual(camera);
    }
  });

  it("em zoom pequeno, a pasta opcional que encostaria em outra sai da cena; a do marco fica sempre", () => {
    const viewport = { largura: 360, altura: 584 };
    const marcadores = [
      { chave: "a", natureza: "explorar", x: 4, y: 5 },
      { chave: "marco", natureza: "marco", x: 4, y: 4 },
      { chave: "b", natureza: "explorar", x: 5, y: 4 },
      { chave: "longe", natureza: "explorar", x: 10, y: 1 },
    ] as const;
    // De perto, cada pasta tem o seu lugar.
    expect([...spacedMarkers(marcadores, { cx: 0, cy: 0, zoom: 1.6 }, viewport, 12)].sort()).toEqual(["a", "b", "longe", "marco"]);
    // De longe, as vizinhas do marco ficariam dentro da área de toque dele: saem, e a distante fica.
    const deLonge = spacedMarkers(marcadores, { cx: 0, cy: 0, zoom: 0.4 }, viewport, 12);
    expect([...deLonge].sort()).toEqual(["longe", "marco"]);
    // Entre duas opcionais vizinhas, fica a primeira da ordem dada.
    const duas = [
      { chave: "primeira", natureza: "explorar", x: 2, y: 2 },
      { chave: "segunda", natureza: "explorar", x: 3, y: 2 },
    ] as const;
    expect([...spacedMarkers(duas, { cx: 0, cy: 0, zoom: 0.4 }, viewport, 12)]).toEqual(["primeira"]);
    // As que ficam guardam a distância mínima entre si.
    const camera = { cx: 0, cy: 0, zoom: 0.4 };
    const pontos = marcadores.filter((item) => deLonge.has(item.chave)).map((item) => project(camera, viewport, toScreen(item.x + 0.5, item.y + 0.5).sx, toScreen(item.x + 0.5, item.y + 0.5).sy - 12));
    expect(Math.hypot(pontos[0]!.px - pontos[1]!.px, pontos[0]!.py - pontos[1]!.py)).toBeGreaterThanOrEqual(DISTANCIA_ENTRE_PASTAS);
  });

  it("quando a cena não cabe nem no zoom mínimo, a pasta do marco fica à vista, e a câmera não sai da cena", () => {
    const caixa = sceneBounds(CENA);
    // Uma tela mais estreita do que a cena no zoom mínimo.
    const viewport = { largura: 150, altura: 420 };
    expect((caixa.maxX - caixa.minX - TILE_W) * ZOOM_MINIMO).toBeGreaterThan(viewport.largura);
    const margens = { topo: 180, base: 72 };
    for (const alvo of [
      { sx: caixa.minX + 40, sy: caixa.minY + 60 },
      { sx: caixa.maxX - 40, sy: caixa.maxY - 30 },
      { sx: (caixa.minX + caixa.maxX) / 2, sy: (caixa.minY + caixa.maxY) / 2 },
    ]) {
      const camera = frameScene(CENA, viewport, margens, alvo);
      expect(camera.zoom).toBe(ZOOM_MINIMO);
      const { px, py } = project(camera, viewport, alvo.sx, alvo.sy);
      expect(px).toBeGreaterThanOrEqual(0);
      expect(px).toBeLessThanOrEqual(viewport.largura);
      expect(py).toBeGreaterThanOrEqual(margens.topo);
      expect(py).toBeLessThanOrEqual(viewport.altura - margens.base);
      // Nenhuma faixa vazia de um lado com cena sobrando do outro.
      const esquerda = project(camera, viewport, caixa.minX, 0).px;
      const direita = project(camera, viewport, caixa.maxX, 0).px;
      expect(esquerda).toBeLessThanOrEqual(0.5);
      expect(direita).toBeGreaterThanOrEqual(viewport.largura - 0.5);
    }
  });
});
