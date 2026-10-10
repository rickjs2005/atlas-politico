// Personagens: Lula, Flávio Bolsonaro e o guia (o Arquivista, personagem
// fictício). Desenho vetorial por código, em cartum editorial, com repouso e
// caminhada.
//
// Os três usam o mesmo esqueleto (character-pose.ts), o mesmo corpo
// (character-body.ts) e a mesma sequência de desenho da cabeça
// (character-head.ts); mudam as proporções, as tintas e os traços próprios
// (character-faces.ts). Os dois personagens jogáveis recebem o mesmo cuidado:
// mesma estrutura, mesmo traço, mesma animação.

import { isFront, isMirrored } from "@/lib/game/world/iso";

import { bodyPaints, drawBody, type BodySpec } from "./character-body";
import { ARCHIVIST_HEAD, FLAVIO_HEAD, LULA_HEAD } from "./character-faces";
import { drawHead, type HeadSpec } from "./character-head";
import { computePose, newPose } from "./character-pose";
import type { CharacterArt, CharacterArtSet, CharacterPose, DrawContext } from "./types";

interface CharacterSpec {
  nome: string;
  corpo: BodySpec;
  cabeca: HeadSpec;
  /** Leva a pasta de documentos debaixo do braço. */
  pasta: boolean;
  /** Defasagem do respiro e do piscar, para os personagens não se moverem juntos. */
  ritmo: number;
}

const TAU = Math.PI * 2;
/** Segundos de um respiro inteiro e intervalo entre duas piscadas. */
const RESPIRO = 3.4;
const PISCADA = 3.9;
const PISCADA_DURA = 0.16;

// Uma pose só, reaproveitada a cada desenho.
const pose = newPose();

function draw(spec: CharacterSpec, d: DrawContext, estado: CharacterPose, sx: number, sy: number): void {
  const g = d.ctx;
  const frente = isFront(estado.facing);
  const espelho = isMirrored(estado.facing);
  const t = d.tempo + spec.ritmo;
  const respiro = d.movimento && !estado.andando ? 0.5 - 0.5 * Math.cos((t * TAU) / RESPIRO) : 0;
  const instante = t % PISCADA;
  const piscar = d.movimento && instante < PISCADA_DURA ? 1 - Math.abs((instante / PISCADA_DURA) * 2 - 1) : 0;

  computePose(pose, spec.corpo.build, frente, estado.andando, estado.fase, respiro, spec.pasta);

  g.save();
  g.translate(sx, sy);
  if (espelho) g.scale(-1, 1);
  g.lineJoin = "round";
  g.lineCap = "round";
  // No desenho espelhado a direita da tela é a esquerda do desenho: a sombra muda de lado.
  const lado = espelho ? -1 : 1;
  drawBody(g, spec.corpo, pose, lado, spec.pasta);
  g.translate(pose.cabecaX, pose.cabecaY);
  drawHead(g, spec.cabeca, frente, lado, piscar);
  g.restore();
}

function character(spec: CharacterSpec): CharacterArt {
  return { nome: spec.nome, altura: spec.corpo.build.altura, draw: (d, estado, sx, sy) => draw(spec, d, estado, sx, sy) };
}

const LULA: CharacterSpec = {
  nome: "Lula",
  pasta: false,
  ritmo: 0,
  cabeca: LULA_HEAD,
  corpo: {
    roupa: "terno",
    // Estatura mediana, tronco largo.
    build: {
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
    },
    tintas: bodyPaints({
      pele: LULA_HEAD.tintas.pele,
      peleSombra: LULA_HEAD.tintas.peleSombra,
      // Terno cinza-chumbo, gravata escura neutra.
      cima: "#4d5157",
      calca: "#4a4e54",
      camisa: "#f2eee5",
      gravata: "#2b2d30",
      sapato: "#34363a",
    }),
  },
};

const FLAVIO: CharacterSpec = {
  nome: "Flávio Bolsonaro",
  pasta: false,
  ritmo: 1.7,
  cabeca: FLAVIO_HEAD,
  corpo: {
    roupa: "terno",
    // Um pouco mais alto e mais magro.
    build: {
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
    },
    tintas: bodyPaints({
      pele: FLAVIO_HEAD.tintas.pele,
      peleSombra: FLAVIO_HEAD.tintas.peleSombra,
      // Terno azul-marinho acinzentado, gravata escura neutra.
      cima: "#374051",
      calca: "#353d4d",
      camisa: "#f2eee5",
      gravata: "#2b2d30",
      sapato: "#34363a",
    }),
  },
};

const ARCHIVIST: CharacterSpec = {
  nome: "Arquivista",
  pasta: true,
  ritmo: 0.9,
  cabeca: ARCHIVIST_HEAD,
  corpo: {
    roupa: "colete",
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
    tintas: bodyPaints({
      pele: ARCHIVIST_HEAD.tintas.pele,
      peleSombra: ARCHIVIST_HEAD.tintas.peleSombra,
      // Colete cinza-oliva sobre camisa clara, calça escura.
      cima: "#7c7d66",
      calca: "#3e3f3b",
      camisa: "#f1ede3",
      gravata: "#3e3f3b",
      sapato: "#4b3b2f",
      pasta: "#c8b48e",
    }),
  },
};

export const CHARACTERS: CharacterArtSet = {
  lula: character(LULA),
  "flavio-bolsonaro": character(FLAVIO),
};

/** O Arquivista: guia fictício, identificado como tal na interface. */
export const GUIDE: CharacterArt = character(ARCHIVIST);
