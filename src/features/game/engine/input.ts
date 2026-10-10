// Entrada: teclado (setas, WASD, tecla de interação) e os controles de toque.
// As teclas só valem com o foco dentro da área do jogo: os ouvintes ficam no
// elemento da cena, e não na janela.
//
// As teclas são lidas pela posição no teclado (`code`), e não pelo caractere:
// soltar a tecla com Shift ou com a trava de maiúsculas no meio do caminho
// continua soltando a mesma tecla. Um atalho do navegador (com Ctrl, Alt ou a
// tecla de comando) não é do jogo e passa direto.

import type { InputState } from "@/lib/game/types";

const DIRECTIONS: Record<string, [number, number]> = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  KeyW: [0, -1],
  KeyS: [0, 1],
  KeyA: [-1, 0],
  KeyD: [1, 0],
};

/** E, Enter (o do teclado numérico também) e a barra de espaço. */
export const INTERACT_CODES = ["KeyE", "Enter", "NumpadEnter", "Space"];

const CONTROLS = "button, a, input, select, textarea";

/** O que o jogo lê de um evento de teclado. */
interface KeyInput {
  code: string;
  key: string;
  repeat: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  metaKey: boolean;
  target: EventTarget | null;
  preventDefault(): void;
}

/** O elemento em que os ouvintes ficam: a cena. Só o que a entrada usa dele. */
interface Listenable {
  addEventListener(tipo: string, ouvinte: EventListener): void;
  removeEventListener(tipo: string, ouvinte: EventListener): void;
}

export interface InputController {
  /** A intenção atual, em eixos de tela. */
  read(): InputState;
  /** Solta tudo: ao pausar, ao perder o foco, ao abrir um diálogo. */
  release(): void;
  /** Direção vinda dos controles de toque. */
  setTouch(dx: number, dy: number): void;
  /** Liga os ouvintes ao elemento. Devolve a função que os desliga. */
  attach(elemento: Listenable, callbacks: { onInteract(): void; onEscape(): void }): () => void;
}

export function createInput(): InputController {
  const teclas = new Set<string>();
  let toque: [number, number] = [0, 0];

  const sinal = (valor: number) => (valor > 0 ? 1 : valor < 0 ? -1 : 0);

  return {
    read() {
      let dx = toque[0];
      let dy = toque[1];
      for (const tecla of teclas) {
        const direcao = DIRECTIONS[tecla];
        if (direcao === undefined) continue;
        dx += direcao[0];
        dy += direcao[1];
      }
      return { dx: sinal(dx), dy: sinal(dy) };
    },
    release() {
      teclas.clear();
      toque = [0, 0];
    },
    setTouch(dx, dy) {
      toque = [sinal(dx), sinal(dy)];
    },
    attach(elemento, callbacks) {
      const onKeyDown = (evento: KeyInput) => {
        // Voltar, salvar, favoritar: o atalho é do navegador.
        if (evento.ctrlKey || evento.altKey || evento.metaKey) return;
        if (evento.code in DIRECTIONS) {
          // A seta move o personagem, e não a página.
          evento.preventDefault();
          teclas.add(evento.code);
          return;
        }
        if (INTERACT_CODES.includes(evento.code)) {
          // Enter e espaço em um botão da interface continuam sendo do botão.
          const alvo = evento.target as Partial<Element> | null;
          if (alvo !== elemento && typeof alvo?.closest === "function" && alvo.closest(CONTROLS) !== null) return;
          evento.preventDefault();
          if (!evento.repeat) callbacks.onInteract();
          return;
        }
        if (evento.key === "Escape") callbacks.onEscape();
      };
      const onKeyUp = (evento: KeyInput) => {
        // Com a tecla de comando apertada, o macOS não avisa quando as outras soltam.
        if (evento.code === "MetaLeft" || evento.code === "MetaRight") teclas.clear();
        else teclas.delete(evento.code);
      };
      const onBlur = () => teclas.clear();
      const aoApertar = onKeyDown as unknown as EventListener;
      const aoSoltar = onKeyUp as unknown as EventListener;
      elemento.addEventListener("keydown", aoApertar);
      elemento.addEventListener("keyup", aoSoltar);
      elemento.addEventListener("focusout", onBlur);
      return () => {
        elemento.removeEventListener("keydown", aoApertar);
        elemento.removeEventListener("keyup", aoSoltar);
        elemento.removeEventListener("focusout", onBlur);
        teclas.clear();
      };
    },
  };
}
