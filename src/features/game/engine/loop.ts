// Laço de animação: simulação em passo fixo, desenho a cada quadro. Pausar
// congela a simulação e continua desenhando o estado parado.

const STEP = 1 / 120;
const MAX_FRAME = 0.1;

export interface GameLoop {
  start(): void;
  stop(): void;
  setPaused(pausado: boolean): void;
  isPaused(): boolean;
}

export function createLoop(callbacks: { update(dt: number): void; render(): void }): GameLoop {
  let pedido: number | null = null;
  let ultimo: number | null = null;
  let acumulado = 0;
  let pausado = false;

  const quadro = (agora: number) => {
    pedido = requestAnimationFrame(quadro);
    if (ultimo === null) ultimo = agora;
    const decorrido = Math.min((agora - ultimo) / 1000, MAX_FRAME);
    ultimo = agora;
    if (!pausado) {
      acumulado += decorrido;
      while (acumulado >= STEP) {
        callbacks.update(STEP);
        acumulado -= STEP;
      }
    }
    callbacks.render();
  };

  return {
    start() {
      if (pedido !== null) return;
      ultimo = null;
      pedido = requestAnimationFrame(quadro);
    },
    stop() {
      if (pedido !== null) cancelAnimationFrame(pedido);
      pedido = null;
    },
    setPaused(valor) {
      pausado = valor;
      if (!valor) ultimo = null;
    },
    isPaused() {
      return pausado;
    },
  };
}
