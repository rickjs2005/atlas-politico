// Personagens: Lula, Flávio Bolsonaro e o guia (o Escrivão, personagem
// fictício). Desenho vetorial por código, em cartum editorial, com repouso e
// caminhada.
//
// Os três usam o mesmo esqueleto (character-pose.ts), o mesmo corpo
// (character-body.ts) e a mesma sequência de desenho da cabeça
// (character-head.ts); mudam as proporções, as tintas e os traços próprios
// (character-faces.ts). Os dois personagens jogáveis recebem o mesmo cuidado:
// mesma estrutura, mesmo traço, mesma animação.
//
// Cada personagem tem três figuras, uma por época dos capítulos (D-111):
// mudam o cabelo, a barba e a roupa, de forma estilizada e com a mesma
// escala para os dois. Não afirmam a aparência real da pessoa em cada data.

import type { Epoca, PersonagemSlug } from "@/lib/game/types";
import { isFront, isMirrored } from "@/lib/game/world/iso";

import { bodyPaints, drawBody, type BodySpec, type Outfit } from "./character-body";
import { ARCHIVIST_HEAD, FLAVIO_HEAD, LULA_HEAD } from "./character-faces";
import { drawHead, type HeadPaints, type HeadSpec } from "./character-head";
import { computePose, newPose, type Build } from "./character-pose";
import type { CharacterArt, CharacterArtSet, CharacterPose, DrawContext } from "./types";

/** As cores da roupa; a pele vem da cabeça. */
interface Outfits {
  cima: string;
  calca: string;
  camisa: string;
  gravata: string;
  sapato: string;
}

/** A figura de uma época: a cabeça (cabelo, barba) e a roupa. */
interface Look {
  cabeca: HeadSpec;
  roupa: Outfit;
  cores: Outfits;
}

interface CharacterSpec {
  nome: string;
  build: Build;
  /** Leva a pasta de documentos debaixo do braço. */
  pasta: boolean;
  /** Defasagem do respiro e do piscar, para os personagens não se moverem juntos. */
  ritmo: number;
  look: Look;
}

const TAU = Math.PI * 2;
/** Segundos de um respiro inteiro e intervalo entre duas piscadas. */
const RESPIRO = 3.4;
const PISCADA = 3.9;
const PISCADA_DURA = 0.16;

// Uma pose só, reaproveitada a cada desenho.
const pose = newPose();

function draw(spec: CharacterSpec, corpo: BodySpec, d: DrawContext, estado: CharacterPose, sx: number, sy: number): void {
  const g = d.ctx;
  const frente = isFront(estado.facing);
  const espelho = isMirrored(estado.facing);
  const t = d.tempo + spec.ritmo;
  const respiro = d.movimento && !estado.andando ? 0.5 - 0.5 * Math.cos((t * TAU) / RESPIRO) : 0;
  const instante = t % PISCADA;
  const piscar = d.movimento && instante < PISCADA_DURA ? 1 - Math.abs((instante / PISCADA_DURA) * 2 - 1) : 0;

  computePose(pose, spec.build, frente, estado.andando, estado.fase, respiro, spec.pasta);

  g.save();
  g.translate(sx, sy);
  if (espelho) g.scale(-1, 1);
  g.lineJoin = "round";
  g.lineCap = "round";
  // No desenho espelhado a direita da tela é a esquerda do desenho: a sombra muda de lado.
  const lado = espelho ? -1 : 1;
  drawBody(g, corpo, pose, lado, spec.pasta);
  g.translate(pose.cabecaX, pose.cabecaY);
  drawHead(g, spec.look.cabeca, frente, lado, piscar);
  g.restore();
}

function character(spec: CharacterSpec): CharacterArt {
  const corpo: BodySpec = {
    roupa: spec.look.roupa,
    build: spec.build,
    tintas: bodyPaints({ pele: spec.look.cabeca.tintas.pele, peleSombra: spec.look.cabeca.tintas.peleSombra, ...spec.look.cores }),
  };
  return { nome: spec.nome, altura: spec.build.altura, draw: (d, estado, sx, sy) => draw(spec, corpo, d, estado, sx, sy) };
}

/**
 * Uma variação de cabeça: outras tintas de cabelo e barba e, quando pedido,
 * sem barba (a pele em volta da boca aparece inteira) ou com o cabelo cheio
 * (sem a coroa rala). As formas do rosto são as mesmas: é a mesma pessoa.
 */
function headVariant(base: HeadSpec, mudancas: { tintas: Partial<HeadPaints>; semBarba?: boolean; cabeloCheio?: boolean; barbaAlfa?: number }): HeadSpec {
  const semBarba = mudancas.semBarba === true;
  return {
    ...base,
    tintas: { ...base.tintas, ...mudancas.tintas },
    barbaCheia: semBarba ? false : base.barbaCheia,
    barbaAlfa: mudancas.barbaAlfa ?? base.barbaAlfa,
    frente: {
      ...base.frente,
      barba: semBarba ? null : base.frente.barba,
      labios: semBarba ? null : base.frente.labios,
      bigode: semBarba ? null : base.frente.bigode,
    },
    costas: {
      ...base.costas,
      barba: semBarba ? null : base.costas.barba,
      coroa: mudancas.cabeloCheio === true ? null : base.costas.coroa,
    },
  };
}

// ---------------------------------------------------------------------------
// Lula: estatura mediana, tronco largo
// ---------------------------------------------------------------------------

const LULA_BUILD: Build = {
  altura: 65,
  tornozelo: 3.2,
  joelho: 12.2,
  quadril: 22,
  cintura: 26.5,
  barra: 19.6,
  ombro: 42.6,
  pescoco: 44,
  cabeca: 54.2,
  peito: 10.6,
  cinturaLargura: 10.3,
  barraLargura: 10.5,
  quadris: 3.8,
  pes: 4.8,
  coxa: 4.3,
  joelhoLargura: 3.7,
  bocaCalca: 3.3,
  manga: 3.5,
  cotovelo: 3.1,
  punho: 2.6,
  braco: 9.2,
  antebraco: 8.2,
  passo: 7.4,
};

const LULA_LOOKS: Record<Epoca, Look> = {
  // Anos 1970 e 1980: cabelo e barba escuros, cheios; camisa de mangas dobradas, sem paletó.
  inicio: {
    cabeca: headVariant(LULA_HEAD, {
      tintas: { cabelo: "#3b322c", cabeloSombra: "#2a231f", fio: "#5c514a", barba: "#4a3f38", barbaSombra: "#352d28", sobrancelha: "#3a312b" },
      cabeloCheio: true,
    }),
    roupa: "camisa",
    cores: { cima: "#5d6a72", calca: "#4a4f55", camisa: "#cfc8b4", gravata: "#3b3f46", sapato: "#3c3a36" },
  },
  // Anos 1980 a 2000: cabelo e barba grisalhos; terno escuro.
  meio: {
    cabeca: headVariant(LULA_HEAD, {
      tintas: { cabelo: "#8f8a82", cabeloSombra: "#6f6b64", fio: "#56524c", barba: "#a9a59d", barbaSombra: "#8a867f", sobrancelha: "#5e5a54" },
    }),
    roupa: "terno",
    cores: { cima: "#3f4a5a", calca: "#3c4654", camisa: "#f2eee5", gravata: "#3b3f46", sapato: "#34363a" },
  },
  // De 2016 em diante: cabelo grisalho claro, barba branca; terno cinza-chumbo.
  atual: {
    cabeca: LULA_HEAD,
    roupa: "terno",
    cores: { cima: "#4d5157", calca: "#4a4e54", camisa: "#f2eee5", gravata: "#2b2d30", sapato: "#34363a" },
  },
};

// ---------------------------------------------------------------------------
// Flávio Bolsonaro: um pouco mais alto e mais magro
// ---------------------------------------------------------------------------

const FLAVIO_BUILD: Build = {
  altura: 70,
  tornozelo: 3.2,
  joelho: 13.6,
  quadril: 24.6,
  cintura: 29.4,
  barra: 22,
  ombro: 46.6,
  pescoco: 48,
  cabeca: 58.4,
  peito: 9.5,
  cinturaLargura: 8.4,
  barraLargura: 8.9,
  quadris: 3.4,
  pes: 4.3,
  coxa: 3.7,
  joelhoLargura: 3.2,
  bocaCalca: 2.9,
  manga: 3.1,
  cotovelo: 2.8,
  punho: 2.4,
  braco: 10,
  antebraco: 9,
  passo: 8.2,
};

const FLAVIO_LOOKS: Record<Epoca, Look> = {
  // Anos 2000 e 2010: sem barba, cabelo escuro cheio; terno cinza claro.
  inicio: {
    cabeca: headVariant(FLAVIO_HEAD, { tintas: { cabelo: "#2e231c", cabeloSombra: "#1f1712", fio: "#5a4639" }, semBarba: true, cabeloCheio: true }),
    roupa: "terno",
    cores: { cima: "#5b6470", calca: "#565e6a", camisa: "#f2eee5", gravata: "#3b3f46", sapato: "#34363a" },
  },
  // Fim dos anos 2010 e começo dos 2020: barba curta e rente; terno azul-marinho acinzentado.
  meio: {
    cabeca: FLAVIO_HEAD,
    roupa: "terno",
    cores: { cima: "#374051", calca: "#353d4d", camisa: "#f2eee5", gravata: "#2b2d30", sapato: "#34363a" },
  },
  // De 2023 em diante: cabelo e barba com fios mais claros; terno escuro.
  atual: {
    cabeca: headVariant(FLAVIO_HEAD, {
      tintas: { cabelo: "#473a32", cabeloSombra: "#342a24", fio: "#7d6e63", barba: "#5c4d43", barbaSombra: "#473b33", sobrancelha: "#352a23" },
      barbaAlfa: 0.8,
    }),
    roupa: "terno",
    cores: { cima: "#2f3640", calca: "#2d333c", camisa: "#f2eee5", gravata: "#2b2d30", sapato: "#34363a" },
  },
};

// ---------------------------------------------------------------------------
// O Escrivão (chamado Arquivista até a versão de lançamento; D-127)
// ---------------------------------------------------------------------------

const ARCHIVIST: CharacterSpec = {
  nome: "Escrivão",
  pasta: true,
  ritmo: 0.9,
  build: {
    altura: 66,
    tornozelo: 3.2,
    joelho: 12.8,
    quadril: 23,
    cintura: 27.4,
    barra: 24.6,
    ombro: 43.2,
    pescoco: 44.8,
    cabeca: 54.4,
    peito: 8.8,
    cinturaLargura: 7.9,
    barraLargura: 8,
    quadris: 3.4,
    pes: 4.2,
    coxa: 3.6,
    joelhoLargura: 3.1,
    bocaCalca: 2.8,
    manga: 2.9,
    cotovelo: 2.6,
    punho: 2.2,
    braco: 9.2,
    antebraco: 8.2,
    passo: 7.6,
  },
  look: {
    cabeca: ARCHIVIST_HEAD,
    roupa: "colete",
    // Colete cinza-oliva sobre camisa clara, calça escura.
    cores: { cima: "#7c7d66", calca: "#3e3f3b", camisa: "#f1ede3", gravata: "#3e3f3b", sapato: "#4b3b2f" },
  },
};

export const EPOCAS: readonly Epoca[] = ["inicio", "meio", "atual"];

function figures(nome: string, build: Build, ritmo: number, looks: Record<Epoca, Look>): Record<Epoca, CharacterArt> {
  const feitas = {} as Record<Epoca, CharacterArt>;
  for (const epoca of EPOCAS) feitas[epoca] = character({ nome, build, pasta: false, ritmo, look: looks[epoca] });
  return feitas;
}

export const CHARACTERS: CharacterArtSet = {
  lula: figures("Lula", LULA_BUILD, 0, LULA_LOOKS),
  "flavio-bolsonaro": figures("Flávio Bolsonaro", FLAVIO_BUILD, 1.7, FLAVIO_LOOKS),
};

/** A figura de um personagem na época de um capítulo. */
export function characterArt(personagem: PersonagemSlug, epoca: Epoca): CharacterArt {
  return CHARACTERS[personagem][epoca];
}

/** O Escrivão: guia fictício, identificado como tal na interface. */
export const GUIDE: CharacterArt = character(ARCHIVIST);
