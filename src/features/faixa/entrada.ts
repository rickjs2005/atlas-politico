// A entrada do Vale a Faixa: teclado e toque somados em uma `Entrada`
// (tipos.ts) por jogador, a mesma que o computador produz. O teclado é lido
// na janela, com o esquema de cada lado (esquemas.ts): sozinho, um esquema;
// a dois, um por pessoa, sem tecla em comum, e os dois lidos ao mesmo tempo.
// O toque chega dos botões na tela (Controles.tsx) e vale só para o jogador
// 1. Teclado e toque somam: dá para andar no toque e bater no teclado.
//
// Tudo é "está pressionado": o estado de cada tecla, e não a repetição do
// `keydown`, é o que vale, para várias teclas e várias pessoas ao mesmo
// tempo. As teclas do jogo não rolam a página enquanto a partida está ativa,
// voltam ao normal fora dela, e nada é capturado em um campo de texto nem
// com Ctrl, Alt ou a tecla do sistema (os atalhos do navegador continuam).
// Soltar uma tecla sempre solta, ativa ou não; perder o foco solta tudo.
//
// Um toque muito curto (tecla ou botão apertados e soltos entre dois passos
// da simulação) não se perde: fica guardado até a próxima leitura.

import { ENTRADA_VAZIA, type Entrada } from "@/lib/faixa/tipos";

import { TECLA_DE_PAUSA, type Esquema, type Jogador } from "./esquemas";

export interface Entradas {
  ler(jogador: Jogador): Entrada;
  /** Os botões de toque, só do jogador 1. */
  setToque(parte: Partial<Entrada>): void;
  /** Solta tudo: ao pausar, ao perder o foco, ao recomeçar, ao sair. */
  limpar(): void;
  /** Alguém já usou o teclado nesta partida. */
  usouTeclado(): boolean;
  usouToque(): boolean;
  dispose(): void;
}

interface Opcoes {
  /** O esquema de cada lado; `null` para o computador. */
  esquemas: readonly [Esquema, Esquema | null];
  /** A partida está recebendo comandos: fora disso, as teclas seguem para a página. */
  ativo(): boolean;
  /** Esc: pausar ou continuar. Quem decide é a interface. */
  aoPausar(): void;
}

/** O alvo dos eventos: a janela, ou qualquer coisa que os emita (nos testes). */
export type AlvoDeTeclado = Pick<Window, "addEventListener" | "removeEventListener">;

const COMANDOS = Object.keys(ENTRADA_VAZIA) as (keyof Entrada)[];

export function criarEntradas(alvo: AlvoDeTeclado, opcoes: Opcoes): Entradas {
  const teclado: [Entrada, Entrada] = [{ ...ENTRADA_VAZIA }, { ...ENTRADA_VAZIA }];
  const toque: Entrada = { ...ENTRADA_VAZIA };
  // Comandos apertados desde a última leitura, para um toque curto não se perder.
  const pendentes: [Set<keyof Entrada>, Set<keyof Entrada>] = [new Set(), new Set()];
  let teclouAlgo = false;
  let tocouAlgo = false;

  const emCampoDeTexto = (evento: KeyboardEvent): boolean => {
    const no = evento.target;
    if (typeof HTMLElement === "undefined" || !(no instanceof HTMLElement)) return false;
    return /^(INPUT|TEXTAREA|SELECT)$/.test(no.tagName) || no.isContentEditable;
  };

  /** A tecla como chave do mapa: `key` em minúsculas, para Shift e Caps Lock não mudarem a letra. */
  const chaveDe = (evento: KeyboardEvent): string => evento.key.toLowerCase();

  const aoApertar = (evento: KeyboardEvent) => {
    if (emCampoDeTexto(evento) || evento.ctrlKey || evento.metaKey || evento.altKey) return;
    if (evento.key === TECLA_DE_PAUSA) {
      evento.preventDefault();
      opcoes.aoPausar();
      return;
    }
    const chave = chaveDe(evento);
    let capturada = false;
    for (const i of [0, 1] as const) {
      const comando = opcoes.esquemas[i]?.mapa[chave];
      if (comando === undefined) continue;
      if (!opcoes.ativo()) return;
      capturada = true;
      if (evento.repeat) continue;
      teclado[i][comando] = true;
      pendentes[i].add(comando);
      teclouAlgo = true;
    }
    if (capturada) evento.preventDefault();
  };
  const aoSoltar = (evento: KeyboardEvent) => {
    const chave = chaveDe(evento);
    for (const i of [0, 1] as const) {
      const comando = opcoes.esquemas[i]?.mapa[chave];
      if (comando !== undefined) teclado[i][comando] = false;
    }
  };
  const soltarTudo = () => {
    for (const lado of teclado) for (const chave of COMANDOS) lado[chave] = false;
  };

  alvo.addEventListener("keydown", aoApertar);
  alvo.addEventListener("keyup", aoSoltar);
  alvo.addEventListener("blur", soltarTudo);

  return {
    ler(jogador) {
      const lado = teclado[jogador];
      const guardados = pendentes[jogador];
      const lida = { ...ENTRADA_VAZIA };
      for (const chave of COMANDOS) lida[chave] = lado[chave] || (jogador === 0 && toque[chave]) || guardados.has(chave);
      guardados.clear();
      return lida;
    },
    setToque(parte) {
      for (const [chave, valor] of Object.entries(parte) as [keyof Entrada, boolean][]) {
        toque[chave] = valor;
        if (valor) {
          pendentes[0].add(chave);
          tocouAlgo = true;
        }
      }
    },
    limpar() {
      soltarTudo();
      for (const chave of COMANDOS) toque[chave] = false;
      for (const guardados of pendentes) guardados.clear();
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
