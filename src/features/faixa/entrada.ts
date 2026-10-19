// A entrada do Vale a Faixa: teclado e toque somados em uma `Entrada`
// (tipos.ts), a mesma que o computador produz. O teclado é lido na janela; o
// toque chega dos botões na tela (Controles.tsx). Os dois valem ao mesmo
// tempo: dá para andar no teclado e bater no toque. As teclas do jogo não
// rolam a página enquanto a partida está ativa.

import { ENTRADA_VAZIA, type Entrada } from "@/lib/faixa/tipos";

export interface Entradas {
  ler(): Entrada;
  setToque(parte: Partial<Entrada>): void;
  /** Solta tudo: ao pausar, ao perder o foco, ao recomeçar. */
  limpar(): void;
  /** A pessoa já usou o teclado nesta partida. */
  usouTeclado(): boolean;
  usouToque(): boolean;
  dispose(): void;
}

const TECLAS: Record<string, keyof Entrada> = {
  ArrowLeft: "esquerda",
  a: "esquerda",
  A: "esquerda",
  ArrowRight: "direita",
  d: "direita",
  D: "direita",
  ArrowUp: "cima",
  w: "cima",
  W: "cima",
  ArrowDown: "baixo",
  s: "baixo",
  S: "baixo",
  j: "golpe",
  J: "golpe",
  z: "golpe",
  Z: "golpe",
  k: "defesa",
  K: "defesa",
  x: "defesa",
  X: "defesa",
  l: "empurrao",
  L: "empurrao",
  c: "empurrao",
  C: "empurrao",
  e: "interagir",
  E: "interagir",
  Enter: "interagir",
  " ": "interagir",
};

const PAUSA = new Set(["Escape", "p", "P"]);

interface Opcoes {
  /** A partida está recebendo comandos: fora disso, as teclas seguem para a página. */
  ativo(): boolean;
  aoPausar(): void;
}

export function criarEntradas(alvo: Window, opcoes: Opcoes): Entradas {
  const teclado: Entrada = { ...ENTRADA_VAZIA };
  const toque: Entrada = { ...ENTRADA_VAZIA };
  let teclouAlgo = false;
  let tocouAlgo = false;

  const emCampo = (evento: KeyboardEvent): boolean => {
    const no = evento.target;
    return no instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(no.tagName);
  };

  const aoApertar = (evento: KeyboardEvent) => {
    if (emCampo(evento)) return;
    if (PAUSA.has(evento.key)) {
      if (opcoes.ativo()) {
        evento.preventDefault();
        opcoes.aoPausar();
      }
      return;
    }
    const comando = TECLAS[evento.key];
    if (comando === undefined) return;
    if (!opcoes.ativo()) return;
    evento.preventDefault();
    if (evento.repeat) return;
    teclado[comando] = true;
    teclouAlgo = true;
  };
  const aoSoltar = (evento: KeyboardEvent) => {
    const comando = TECLAS[evento.key];
    if (comando === undefined) return;
    teclado[comando] = false;
  };
  const soltarTudo = () => {
    for (const chave of Object.keys(teclado) as (keyof Entrada)[]) teclado[chave] = false;
  };

  alvo.addEventListener("keydown", aoApertar);
  alvo.addEventListener("keyup", aoSoltar);
  alvo.addEventListener("blur", soltarTudo);

  return {
    ler() {
      return {
        esquerda: teclado.esquerda || toque.esquerda,
        direita: teclado.direita || toque.direita,
        cima: teclado.cima || toque.cima,
        baixo: teclado.baixo || toque.baixo,
        golpe: teclado.golpe || toque.golpe,
        defesa: teclado.defesa || toque.defesa,
        empurrao: teclado.empurrao || toque.empurrao,
        interagir: teclado.interagir || toque.interagir,
      };
    },
    setToque(parte) {
      for (const [chave, valor] of Object.entries(parte) as [keyof Entrada, boolean][]) {
        toque[chave] = valor;
        if (valor) tocouAlgo = true;
      }
    },
    limpar() {
      soltarTudo();
      for (const chave of Object.keys(toque) as (keyof Entrada)[]) toque[chave] = false;
    },
    usouTeclado: () => teclouAlgo,
    usouToque: () => tocouAlgo,
    dispose() {
      alvo.removeEventListener("keydown", aoApertar);
      alvo.removeEventListener("keyup", aoSoltar);
      alvo.removeEventListener("blur", soltarTudo);
    },
  };
}
