// Os esquemas de teclas do Vale a Faixa: um para quem joga sozinho contra o
// computador (setas, Espaço, Z, V, X, Shift, C) e dois, sem tecla em comum,
// para duas pessoas no mesmo teclado (A D W S F G Q R E à esquerda; setas,
// K L J I O à direita). Daqui saem o mapa que a entrada lê (entrada.ts), as
// teclas desenhadas nas telas (ValeAFaixa.tsx), a dica perto do personagem
// e a legenda do HUD (desenho/hud.ts). Nada aqui toca o DOM.
//
// A dois, a tecla de subir também pula: as regras (`subirOuPular`) a
// transformam em pulo quando não há escada para subir. Esc pausa nos dois
// esquemas.

import type { Dica, Entrada } from "@/lib/faixa/tipos";

/** Sozinho contra o computador, ou duas pessoas no mesmo teclado. */
export type Modo = "solo" | "local";

export type Jogador = 0 | 1;

/** Uma tecla: como chega em `KeyboardEvent.key` (em minúsculas) e como é desenhada. */
export interface Tecla {
  chave: string;
  rotulo: string;
}

export interface Esquema {
  /** Quem usa: "Você" sozinho; "Jogador 1" e "Jogador 2" a dois. */
  nome: string;
  /** A tecla de cada comando. A dois, pular não tem tecla própria: é a de subir, fora da escada. */
  teclas: Readonly<Record<keyof Entrada, Tecla | null>>;
  /** De `KeyboardEvent.key` (em minúsculas) para o comando. */
  mapa: Readonly<Record<string, keyof Entrada>>;
  /** A linha discreta dos comandos, embaixo da cena. */
  legenda: string;
}

export const TECLA_DE_PAUSA = "Escape";

type Definicao = Readonly<Record<keyof Entrada, readonly [chave: string, rotulo: string] | null>>;

function esquema(nome: string, prefixoDaLegenda: string, definicao: Definicao): Esquema {
  const teclas = {} as Record<keyof Entrada, Tecla | null>;
  const mapa: Record<string, keyof Entrada> = {};
  for (const [comando, par] of Object.entries(definicao) as [keyof Entrada, Definicao[keyof Entrada]][]) {
    if (par === null) {
      teclas[comando] = null;
      continue;
    }
    teclas[comando] = { chave: par[0], rotulo: par[1] };
    mapa[par[0]] = comando;
  }
  const r = (comando: keyof Entrada) => teclas[comando]?.rotulo ?? "";
  const mover = teclas.esquerda?.chave === "arrowleft" ? "Setas" : `${r("esquerda")} ${r("direita")}`;
  const pular = teclas.pulo === null ? `${r("cima")}: pular ou subir • ${r("baixo")}: descer` : `${r("pulo")}: pular`;
  const legenda = `${prefixoDaLegenda}${mover}: mover • ${pular} • ${r("golpe")}: atacar • ${r("forte")}: forte (na guarda, agarrar) • ${r("defesa")}: defender • ${r("esquiva")}: esquiva • ${r("interagir")}: interagir`;
  return { nome, teclas, mapa, legenda };
}

/** Sozinho: um esquema só, sem atalhos alternativos. */
export const ESQUEMA_SOLO: Esquema = esquema("Você", "", {
  esquerda: ["arrowleft", "←"],
  direita: ["arrowright", "→"],
  cima: ["arrowup", "↑"],
  baixo: ["arrowdown", "↓"],
  pulo: [" ", "Espaço"],
  golpe: ["z", "Z"],
  forte: ["v", "V"],
  defesa: ["x", "X"],
  esquiva: ["shift", "Shift"],
  interagir: ["c", "C"],
});

/** A dois: o jogador 1 na esquerda do teclado, o 2 nas setas e nas letras da direita. Nenhuma tecla em comum. */
export const ESQUEMAS_LOCAIS: readonly [Esquema, Esquema] = [
  esquema("Jogador 1", "J1 · ", {
    esquerda: ["a", "A"],
    direita: ["d", "D"],
    cima: ["w", "W"],
    baixo: ["s", "S"],
    pulo: null,
    golpe: ["f", "F"],
    forte: ["g", "G"],
    defesa: ["q", "Q"],
    esquiva: ["r", "R"],
    interagir: ["e", "E"],
  }),
  esquema("Jogador 2", "J2 · ", {
    esquerda: ["arrowleft", "←"],
    direita: ["arrowright", "→"],
    cima: ["arrowup", "↑"],
    baixo: ["arrowdown", "↓"],
    pulo: null,
    golpe: ["k", "K"],
    forte: ["l", "L"],
    defesa: ["j", "J"],
    esquiva: ["i", "I"],
    interagir: ["o", "O"],
  }),
];

/** Os esquemas de cada lado no modo: a dois, um por pessoa; sozinho, só o jogador (o computador não tem teclas). */
export function esquemasDe(modo: Modo): readonly [Esquema, Esquema | null] {
  return modo === "local" ? ESQUEMAS_LOCAIS : [ESQUEMA_SOLO, null];
}

/** As linhas da apresentação dos controles: as teclas desenhadas e uma descrição curta. */
export function linhasDe(esquema: Esquema): readonly { teclas: readonly string[]; acao: string }[] {
  const r = (comando: keyof Entrada) => esquema.teclas[comando]?.rotulo ?? "";
  const linhas: { teclas: readonly string[]; acao: string }[] = [{ teclas: [r("esquerda"), r("direita")], acao: "andar" }];
  if (esquema.teclas.pulo === null) {
    linhas.push({ teclas: [r("cima")], acao: "pular (alinhado à escada, subir)" }, { teclas: [r("baixo")], acao: "descer da escada" });
  } else {
    linhas.push({ teclas: [r("pulo")], acao: "pular" });
  }
  linhas.push(
    { teclas: [r("golpe")], acao: "atacar (no ar, voadora)" },
    { teclas: [r("forte")], acao: "golpe forte (colado em quem defende, agarrar)" },
    { teclas: [r("defesa")], acao: "defender (segurar)" },
    { teclas: [r("esquiva")], acao: "esquiva (agarrado, escapar)" },
    { teclas: [r("interagir")], acao: esquema.teclas.pulo === null ? "interagir (escada e faixa)" : "interagir" },
  );
  if (esquema.teclas.pulo !== null) linhas.push({ teclas: [r("cima"), r("baixo")], acao: "subir e descer a escada" });
  linhas.push({ teclas: ["Esc"], acao: "pausar" });
  return linhas;
}

/** O texto da dica perto do personagem: com a tecla do esquema, ou com o nome do botão no toque (`null`). */
export function rotuloDaDica(dica: NonNullable<Dica>, esquema: Esquema | null): string {
  if (esquema === null) {
    switch (dica) {
      case "pegarEscada":
        return "Pegar escada";
      case "posicionarEscada":
        return "Posicionar escada";
      case "soltarEscada":
        return "Largar escada";
      case "subir":
        return "▲ Subir";
      case "puxarFaixa":
        return "Segure — Puxar faixa";
      case "derrubarEscada":
        return "Atacar — Derrubar escada";
      case "agarrar":
        return "Forte — Agarrar";
      case "escapar":
        return "Esquiva — Escapar!";
    }
  }
  const r = (comando: keyof Entrada) => esquema.teclas[comando]?.rotulo ?? "";
  switch (dica) {
    case "pegarEscada":
      return `${r("interagir")} — Pegar escada`;
    case "posicionarEscada":
      return `${r("interagir")} — Posicionar escada`;
    case "soltarEscada":
      return `${r("interagir")} — Largar escada`;
    case "subir":
      return `${r("cima")} — Subir`;
    case "puxarFaixa":
      return `Segure ${r("interagir")} — Puxar faixa`;
    case "derrubarEscada":
      return `${r("golpe")} — Derrubar escada`;
    case "agarrar":
      return `${r("forte")} — Agarrar`;
    case "escapar":
      return `${r("esquiva")} — Escapar!`;
  }
}
