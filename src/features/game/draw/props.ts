// Elementos de cenário: um desenho por tipo (`PropKind`), com o material
// variando pela cena (madeira crua e aço gasto no sindicato, madeira
// envernizada na Constituinte, madeira escura e pedra na Assembleia, madeira
// polida e estofado sóbrio no Senado).
//
// Cada objeto é desenhado em eixos próprios, com a frente em +v
// (props-base.ts). `espelhado` troca o eixo do mundo para onde a frente
// aponta, e a luz continua vindo do mesmo lado. `variante` escolhe, conforme
// o tipo:
//   cadeira, bancada, poltrona, tribuna, microfone   par: de frente; ímpar: de costas para a câmera
//   mesa            0 papéis, 1 pasta fechada, 2 pasta aberta
//   mesa-central    par: Mesa diretora; ímpar: mesa de reunião
//   arquivo         0 fechado, 1 gaveta aberta, 2 caixa em cima
//   estante         três arrumações; ímpar: caixa em cima
//   armario         ímpar: caixa em cima
//   caixote         ímpar: dois empilhados
//   urna            ímpar: com a cabine de papelão
//   maquina         par: prensa; ímpar: torno
//   placa           par: quadro de avisos; ímpar: cavalete
//   bandeira        três tons de cinza
//   decoracao       0 faixa pintada, 1 folhas caídas, 2 luz de janela, 3 capacho

import type { PropKind } from "@/lib/game/types";

import { LIGHT } from "./kit";
import { arquivo, armario, caixote, estante, placa, urna } from "./props-arquivo";
import { materiais, type Quadro } from "./props-base";
import { decoracao } from "./props-chao";
import { bancada, banco, cadeira, mesa, mesaCentral, poltrona, tribuna } from "./props-moveis";
import { bandeira, coluna, maquina, microfone, planta } from "./props-salao";
import type { PropDrawer } from "./types";

const DESENHOS: Record<PropKind, (q: Quadro) => void> = {
  mesa,
  "mesa-central": mesaCentral,
  cadeira,
  bancada,
  tribuna,
  arquivo,
  estante,
  armario,
  coluna,
  urna,
  bandeira,
  planta,
  maquina,
  banco,
  microfone,
  caixote,
  poltrona,
  placa,
  decoracao,
};

export const drawProp: PropDrawer = (d, paleta, tipo, sx, sy, variante, espelhado, info) => {
  DESENHOS[tipo]({
    ctx: d.ctx,
    sx,
    sy,
    m: espelhado,
    lv: espelhado ? LIGHT.direita : LIGHT.esquerda,
    lu: espelhado ? LIGHT.esquerda : LIGHT.direita,
    mat: materiais(info.cena, paleta),
    paleta,
    info,
    variante: Math.max(0, Math.trunc(variante)),
    tempo: d.movimento ? d.tempo : 0,
    movimento: d.movimento,
  });
};
