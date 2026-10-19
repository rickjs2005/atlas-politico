// A entrada do Vale a Faixa: teclado e toque somados em uma `Entrada`
// (tipos.ts), a mesma que o computador produz. O teclado é lido na janela; o
// toque chega dos botões na tela (Controles.tsx). Os dois valem ao mesmo
// tempo: dá para andar no toque e bater no teclado.
//
// Um esquema só: setas andam e sobem ou descem a escada; Espaço pula; Z
// ataca (no ar, a voadora); V é o golpe forte; X defende enquanto pressionado;
// Shift é a esquiva; C interage com a escada e com a faixa; Esc pausa e
// continua. As teclas do jogo não rolam a página enquanto a partida está
// ativa, voltam ao normal fora dela, e nada é capturado quando a pessoa está
// em um campo de texto.
//
// Um toque muito curto (tecla ou botão apertados e soltos entre dois passos
// da simulação) não se perde: fica guardado até a próxima leitura.

import { ENTRADA_VAZIA, type Entrada } from "@/lib/faixa/tipos";

export interface Entradas {
  ler(): Entrada;
  setToque(parte: Partial<Entrada>): void;
  /** Solta tudo: ao pausar, ao perder o foco, ao recomeçar, ao sair. */
  limpar(): void;
  /** A pessoa já usou o teclado nesta partida. */
  usouTeclado(): boolean;
  usouToque(): boolean;
  dispose(): void;
}

/** As teclas do jogo. Só estas: sem atalhos alternativos. */
export const TECLAS: Readonly<Record<string, keyof Entrada>> = {
  ArrowLeft: "esquerda",
  ArrowRight: "direita",
  ArrowUp: "cima",
  ArrowDown: "baixo",
  " ": "pulo",
  z: "golpe",
  Z: "golpe",
  v: "forte",
  V: "forte",
  x: "defesa",
  X: "defesa",
  Shift: "esquiva",
  c: "interagir",
  C: "interagir",
};

const TECLA_DE_PAUSA = "Escape";

interface Opcoes {
  /** A partida está recebendo comandos: fora disso, as teclas seguem para a página. */
  ativo(): boolean;
  /** Esc: pausar ou continuar. Quem decide é a interface. */
  aoPausar(): void;
}

export function criarEntradas(alvo: Window, opcoes: Opcoes): Entradas {
  const teclado: Entrada = { ...ENTRADA_VAZIA };
  const toque: Entrada = { ...ENTRADA_VAZIA };
  // Comandos apertados desde a última leitura, para um toque curto não se perder.
  const pendentes = new Set<keyof Entrada>();
  let teclouAlgo = false;
  let tocouAlgo = false;

  const emCampoDeTexto = (evento: KeyboardEvent): boolean => {
    const no = evento.target;
    if (!(no instanceof HTMLElement)) return false;
    return /^(INPUT|TEXTAREA|SELECT)$/.test(no.tagName) || no.isContentEditable;
  };

  const aoApertar = (evento: KeyboardEvent) => {
    if (emCampoDeTexto(evento)) return;
    if (evento.key === TECLA_DE_PAUSA) {
      evento.preventDefault();
      opcoes.aoPausar();
      return;
    }
    const comando = TECLAS[evento.key];
    if (comando === undefined) return;
    if (!opcoes.ativo()) return;
    evento.preventDefault();
    if (evento.repeat) return;
    teclado[comando] = true;
    pendentes.add(comando);
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

  const ler = (chave: keyof Entrada): boolean => teclado[chave] || toque[chave] || pendentes.has(chave);

  return {
    ler() {
      const lida: Entrada = {
        esquerda: ler("esquerda"),
        direita: ler("direita"),
        cima: ler("cima"),
        baixo: ler("baixo"),
        pulo: ler("pulo"),
        golpe: ler("golpe"),
        forte: ler("forte"),
        defesa: ler("defesa"),
        esquiva: ler("esquiva"),
        interagir: ler("interagir"),
      };
      pendentes.clear();
      return lida;
    },
    setToque(parte) {
      for (const [chave, valor] of Object.entries(parte) as [keyof Entrada, boolean][]) {
        toque[chave] = valor;
        if (valor) {
          pendentes.add(chave);
          tocouAlgo = true;
        }
      }
    },
    limpar() {
      soltarTudo();
      for (const chave of Object.keys(toque) as (keyof Entrada)[]) toque[chave] = false;
      pendentes.clear();
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
