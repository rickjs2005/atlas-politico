// Versões preparadas dos retratos (docs/PERFORMANCE.md, seção Imagens).
//
// O arquivo cadastrado no conteúdo é o original, com crédito e condições de
// uso. As páginas não o pedem: pedem versões menores, já recortadas na
// proporção de cada moldura, geradas por `npm run images` antes do build.
//
// Este módulo é a combinação entre quem gera os arquivos (scripts/images.mts)
// e quem os pede (src/components/Portrait.tsx): molduras, larguras e nomes.

export type PortraitShape = "retrato" | "quadrado";

interface ShapeSpec {
  /** Marca da moldura no nome do arquivo. */
  codigo: string;
  /** Largura e altura da proporção. */
  proporcao: readonly [number, number];
  /** Larguras geradas, em pixels do arquivo. */
  larguras: readonly number[];
  /** A largura usada onde o navegador não escolhe (atributo `src`). */
  padrao: number;
}

/**
 * As larguras cobrem o que cada moldura ocupa nas telas, de uma a três vezes a
 * densidade de pixels: o cartão da entrada chega a 310 px de largura, e as
 * miniaturas ficam entre 40 e 64 px.
 */
export const PORTRAIT_SHAPES: Record<PortraitShape, ShapeSpec> = {
  retrato: { codigo: "4x5", proporcao: [4, 5], larguras: [160, 240, 320, 480, 640], padrao: 320 },
  quadrado: { codigo: "1x1", proporcao: [1, 1], larguras: [64, 96, 128, 192], padrao: 96 },
};

export const PORTRAIT_FORMAT = "webp";
/**
 * Qualidade da compressão. As versões maiores só são escolhidas em telas de
 * alta densidade, em que a compressão aparece menos: elas levam uma qualidade
 * menor, para não pesar no celular.
 */
export const PORTRAIT_QUALITY = { padrao: 78, acimaDe: 320, grande: 66 } as const;

export function derivedQuality(largura: number): number {
  return largura > PORTRAIT_QUALITY.acimaDe ? PORTRAIT_QUALITY.grande : PORTRAIT_QUALITY.padrao;
}

/** Pasta pública das versões geradas. */
export const DERIVED_DIR = "/media/derivados";

/** Caminho público de uma versão: `/media/derivados/retrato-lula-4x5-320.webp`. */
export function derivedPath(imagemId: string, shape: PortraitShape, largura: number): string {
  return `${DERIVED_DIR}/${imagemId}-${PORTRAIT_SHAPES[shape].codigo}-${largura}.${PORTRAIT_FORMAT}`;
}

/** Altura de uma versão, pela proporção da moldura. */
export function derivedHeight(shape: PortraitShape, largura: number): number {
  const [w, h] = PORTRAIT_SHAPES[shape].proporcao;
  return Math.round((largura * h) / w);
}

/** O que vai nos atributos da imagem: o navegador escolhe a largura pelo `sizes`. */
export function derivedSources(imagemId: string, shape: PortraitShape) {
  const { larguras, padrao } = PORTRAIT_SHAPES[shape];
  return {
    src: derivedPath(imagemId, shape, padrao),
    srcSet: larguras.map((largura) => `${derivedPath(imagemId, shape, largura)} ${largura}w`).join(", "),
    width: padrao,
    height: derivedHeight(shape, padrao),
  };
}
