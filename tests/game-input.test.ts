// Entrada do jogo: o teclado lido pela posição da tecla, os atalhos do
// navegador que passam direto, a tecla de interação e os controles de toque.
// Os eventos são objetos simples: a entrada só lê o que usa deles.

import { describe, expect, it } from "vitest";

import { INTERACT_CODES, createInput } from "@/features/game/engine/input";

interface FakeKey {
  code: string;
  key: string;
  repeat: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  metaKey: boolean;
  target: unknown;
  prevenido: boolean;
  preventDefault(): void;
}

/** Um elemento que só guarda os ouvintes e deixa o teste dispará-los. */
function fakeScene() {
  const ouvintes = new Map<string, Set<EventListener>>();
  return {
    addEventListener(tipo: string, ouvinte: EventListener) {
      if (!ouvintes.has(tipo)) ouvintes.set(tipo, new Set());
      ouvintes.get(tipo)!.add(ouvinte);
    },
    removeEventListener(tipo: string, ouvinte: EventListener) {
      ouvintes.get(tipo)?.delete(ouvinte);
    },
    emit(tipo: string, evento: unknown) {
      for (const ouvinte of ouvintes.get(tipo) ?? []) ouvinte(evento as Event);
    },
    total: () => [...ouvintes.values()].reduce((soma, grupo) => soma + grupo.size, 0),
  };
}

function montar() {
  const cena = fakeScene();
  const input = createInput();
  const chamadas = { interagir: 0, esc: 0 };
  const soltar = input.attach(cena, {
    onInteract: () => {
      chamadas.interagir += 1;
    },
    onEscape: () => {
      chamadas.esc += 1;
    },
  });
  const tecla = (code: string, extra: Partial<FakeKey> = {}): FakeKey => ({
    code,
    key: code,
    repeat: false,
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    target: cena,
    prevenido: false,
    preventDefault() {
      this.prevenido = true;
    },
    ...extra,
  });
  const apertar = (code: string, extra: Partial<FakeKey> = {}) => {
    const evento = tecla(code, extra);
    cena.emit("keydown", evento);
    return evento;
  };
  const largar = (code: string, extra: Partial<FakeKey> = {}) => cena.emit("keyup", tecla(code, extra));
  return { cena, input, chamadas, soltar, apertar, largar };
}

describe("direção pelo teclado", () => {
  it("as setas e W, A, S e D movem nos eixos da tela, e soltar para", () => {
    const { input, apertar, largar } = montar();
    expect(input.read()).toEqual({ dx: 0, dy: 0 });
    for (const [code, dx, dy] of [
      ["ArrowRight", 1, 0],
      ["ArrowLeft", -1, 0],
      ["ArrowUp", 0, -1],
      ["ArrowDown", 0, 1],
      ["KeyD", 1, 0],
      ["KeyA", -1, 0],
      ["KeyW", 0, -1],
      ["KeyS", 0, 1],
    ] as const) {
      const evento = apertar(code);
      expect(input.read(), code).toEqual({ dx, dy });
      // A tecla de direção é do jogo: a página não rola.
      expect(evento.prevenido, code).toBe(true);
      largar(code);
      expect(input.read(), code).toEqual({ dx: 0, dy: 0 });
    }
  });

  it("duas teclas somam, e opostas se anulam", () => {
    const { input, apertar } = montar();
    apertar("ArrowRight");
    apertar("ArrowDown");
    expect(input.read()).toEqual({ dx: 1, dy: 1 });
    apertar("ArrowLeft");
    expect(input.read()).toEqual({ dx: 0, dy: 1 });
  });

  it("soltar com Shift ou com a trava de maiúsculas no meio solta a mesma tecla", () => {
    // O caractere muda de d para D, mas a tecla é a mesma.
    const { input, apertar, largar } = montar();
    apertar("KeyD", { key: "d" });
    largar("KeyD", { key: "D" });
    expect(input.read()).toEqual({ dx: 0, dy: 0 });
    apertar("KeyW", { key: "W" });
    largar("KeyW", { key: "w" });
    expect(input.read()).toEqual({ dx: 0, dy: 0 });
  });

  it("um atalho do navegador passa direto: não move o personagem nem é impedido", () => {
    const { input, chamadas, apertar } = montar();
    for (const [code, modificador] of [
      ["ArrowLeft", "altKey"],
      ["KeyS", "ctrlKey"],
      ["KeyD", "ctrlKey"],
      ["KeyD", "metaKey"],
      ["KeyA", "metaKey"],
      ["KeyE", "ctrlKey"],
    ] as const) {
      const evento = apertar(code, { [modificador]: true });
      expect(evento.prevenido, `${modificador} + ${code}`).toBe(false);
      expect(input.read(), `${modificador} + ${code}`).toEqual({ dx: 0, dy: 0 });
    }
    expect(chamadas.interagir).toBe(0);
  });

  it("soltar a tecla de comando solta tudo, porque as outras teclas não avisam", () => {
    const { input, apertar, largar } = montar();
    apertar("KeyD");
    apertar("ArrowDown");
    largar("MetaLeft");
    expect(input.read()).toEqual({ dx: 0, dy: 0 });
    apertar("KeyA");
    largar("MetaRight");
    expect(input.read()).toEqual({ dx: 0, dy: 0 });
  });

  it("perder o foco e pausar soltam as teclas", () => {
    const { cena, input, apertar } = montar();
    apertar("KeyD");
    cena.emit("focusout", {});
    expect(input.read()).toEqual({ dx: 0, dy: 0 });
    apertar("ArrowUp");
    input.release();
    expect(input.read()).toEqual({ dx: 0, dy: 0 });
  });
});

describe("interagir e sair", () => {
  it("E, Enter, o Enter do teclado numérico e o espaço interagem uma vez por toque", () => {
    const { chamadas, apertar } = montar();
    expect(INTERACT_CODES).toEqual(["KeyE", "Enter", "NumpadEnter", "Space"]);
    for (const code of INTERACT_CODES) {
      const antes = chamadas.interagir;
      const evento = apertar(code);
      expect(evento.prevenido, code).toBe(true);
      expect(chamadas.interagir, code).toBe(antes + 1);
      // Segurar a tecla repete o evento, e não a ação.
      apertar(code, { repeat: true });
      expect(chamadas.interagir, code).toBe(antes + 1);
    }
  });

  it("Enter e espaço em um botão da interface continuam sendo do botão", () => {
    const { chamadas, apertar } = montar();
    const botao = { closest: (seletor: string) => (seletor.includes("button") ? {} : null) };
    const evento = apertar("Enter", { target: botao });
    expect(evento.prevenido).toBe(false);
    expect(chamadas.interagir).toBe(0);
    // Em um elemento que não é controle, a tecla é do jogo.
    apertar("Space", { target: { closest: () => null } });
    expect(chamadas.interagir).toBe(1);
  });

  it("Esc avisa a casca, que abre o painel", () => {
    const { chamadas, apertar } = montar();
    apertar("Escape", { key: "Escape" });
    expect(chamadas.esc).toBe(1);
    expect(chamadas.interagir).toBe(0);
  });
});

describe("toque", () => {
  it("o direcional entra como direção, soma com o teclado e é solto na pausa", () => {
    const { input, apertar } = montar();
    input.setTouch(1, -1);
    expect(input.read()).toEqual({ dx: 1, dy: -1 });
    // Mesma direção pelos dois: continua 1, e não 2.
    apertar("ArrowRight");
    expect(input.read()).toEqual({ dx: 1, dy: -1 });
    input.setTouch(0.4, 0);
    expect(input.read()).toEqual({ dx: 1, dy: 0 });
    input.release();
    expect(input.read()).toEqual({ dx: 0, dy: 0 });
  });
});

describe("ouvintes", () => {
  it("ficam no elemento da cena e saem todos ao desligar", () => {
    const { cena, input, soltar, apertar } = montar();
    expect(cena.total()).toBe(3);
    apertar("KeyD");
    soltar();
    expect(cena.total()).toBe(0);
    expect(input.read()).toEqual({ dx: 0, dy: 0 });
    apertar("KeyD");
    expect(input.read()).toEqual({ dx: 0, dy: 0 });
  });
});
