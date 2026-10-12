// Classes de dois tipos de link que precisam de área de toque. Um link no
// meio de uma frase tem a altura da linha, e isso é aceito; estes dois não
// estão no meio de frase nenhuma: são o que a pessoa veio tocar.

/**
 * Um link que é um caminho: leva a outra tela, e fica sozinho na linha ou no
 * começo dela. Tem a altura de toque dos botões (44 pixels) em qualquer
 * largura.
 */
export const PATH_LINK = "inline-flex min-h-11 items-center font-medium underline decoration-line-strong hover:decoration-ink";

/**
 * O título de um documento em uma lista de fontes. Em tela de toque e em tela
 * estreita ou média, ganha os 44 pixels de altura; com mouse em tela larga,
 * fica na altura do texto, para a lista continuar compacta.
 */
export const SOURCE_LINK =
  "underline decoration-line-strong hover:decoration-ink max-lg:inline-flex max-lg:min-h-11 max-lg:items-center pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:items-center";
