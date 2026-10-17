"use client";

// O palco: o canvas com o cenário, o boneco e as pastas da fase, e, por cima
// do desenho, um botão da página em cada pasta (D-137). Ninguém dirige o
// personagem: ativar uma pasta (pelo toque, pelo clique ou pelo teclado) faz o
// boneco andar um caminho curto até ela, e então a casca abre o conteúdo. A
// caminhada é enfeite: com movimento reduzido ela não acontece, e o conteúdo
// abre na hora. O palco não guarda progresso nem conhece os diálogos.
//
// A câmera não segue o boneco: enquadra a cena inteira na área que a
// interface deixa livre (`margens`), para a pasta do marco estar sempre à
// vista, inclusive em celular.
//
// Só existe no navegador: é carregado por `next/dynamic` em GameShell.

import { useEffect, useImperativeHandle, useRef, type RefObject } from "react";

import type { Epoca, PersonagemSlug, PlayerState, SceneMarker, SceneSpec } from "@/lib/game/types";
import { frameScene, project, spacedMarkers, type Camera, type StageInsets } from "@/lib/game/world/camera";
import { toScreen } from "@/lib/game/world/iso";
import { cellOf, initialPlayer, pathToMarker, stepWalk, walkAlong, type Walk } from "@/lib/game/world/path";

import { createLoop, type GameLoop } from "./engine/loop";
import { renderScene } from "./engine/render";

/** Marca que identifica o pacote do palco na saída estática (tests/export). */
export const STAGE_MARKER = "atlas-jogo-palco";

export interface GameStageHandle {
  /** Leva o boneco até a pasta e, ao chegar, avisa por `onOpen`. Com movimento reduzido, avisa na hora. */
  open(chave: string): void;
  /** Põe o foco no botão de uma pasta (a do marco, se nenhuma for dita). */
  focusMarker(chave?: string): void;
}

export interface GameStageProps {
  /** Recebe as ações que a interface manda para a cena. */
  handle: RefObject<GameStageHandle | null>;
  scene: SceneSpec;
  personagem: PersonagemSlug;
  epoca: Epoca;
  /** A fase aberta: quando muda, o boneco volta ao início da cena. */
  faseId: string;
  /** As pastas da fase: a do marco e as dos registros para explorar. */
  marcadores: readonly SceneMarker[];
  /** A fase terminou: a porta abre. */
  concluida: boolean;
  /** O que a interface cobre do palco, em cima e embaixo: a cena é enquadrada no que sobra. */
  margens: StageInsets;
  /** Para a animação: janela aberta sobre a cena, ou aba fora da vista. */
  pausado: boolean;
  movimento: boolean;
  /** O boneco chegou à pasta (ou não precisou andar): é hora de abrir o conteúdo dela. */
  onOpen(chave: string): void;
  /**
   * O navegador não deu o contexto 2D do canvas: a cena não pode ser
   * desenhada. A casca passa para a leitura sem o cenário.
   */
  onUnavailable(): void;
}

const DOOR_SECONDS = 0.6;
/** A altura, em pixels de mundo, do centro de uma pasta acima do chão da célula: é onde o botão dela fica. */
const FOLDER_LIFT = 12;

export function GameStage(props: GameStageProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const botoesRef = useRef(new Map<string, HTMLButtonElement>());
  // O laço lê as props pelo ref, atualizado depois de cada renderização.
  const propsRef = useRef(props);
  useEffect(() => {
    propsRef.current = props;
  });

  const playerRef = useRef<PlayerState>(initialPlayer(props.scene));
  const cameraRef = useRef<Camera>({ cx: 0, cy: 0, zoom: 1 });
  const tempoRef = useRef(0);
  const aberturaRef = useRef(props.concluida ? 1 : 0);
  // A caminhada em curso e a pasta a que ela leva.
  const caminhadaRef = useRef<{ walk: Walk; chave: string } | null>(null);
  const loopRef = useRef<GameLoop | null>(null);
  const tamanhoRef = useRef({ largura: 0, altura: 0, dpr: 1 });
  // Algo mudou desde o último desenho: parado, o quadro não é refeito à toa.
  const sujoRef = useRef(true);

  // As pastas que têm botão sobre a cena neste enquadramento: em zoom pequeno, a opcional que encostaria em outra fica só na lista da fase.
  const visiveisRef = useRef<Set<string>>(new Set());

  /** A câmera para a cena, o tamanho do palco e as margens de agora, e as pastas que cabem nela. */
  const enquadrar = () => {
    const p = propsRef.current;
    const { largura, altura } = tamanhoRef.current;
    const viewport = { largura: largura || 800, altura: altura || 600 };
    const marco = p.marcadores.find((item) => item.natureza === "marco");
    const alvo = marco === undefined ? null : toScreen(marco.x + 0.5, marco.y + 0.5);
    cameraRef.current = frameScene(p.scene, viewport, p.margens, alvo);
    visiveisRef.current = spacedMarkers(p.marcadores, cameraRef.current, viewport, FOLDER_LIFT);
    sujoRef.current = true;
  };

  useImperativeHandle(props.handle, () => ({
    open: (chave) => {
      const p = propsRef.current;
      const marcador = p.marcadores.find((item) => item.chave === chave);
      if (marcador === undefined || caminhadaRef.current !== null) return;
      const caminho = p.movimento ? pathToMarker(p.scene, cellOf(playerRef.current), marcador) : null;
      // Sem movimento, sem caminho ou já ao lado da pasta: abre na hora.
      if (caminho === null || caminho.length <= 1) {
        p.onOpen(chave);
        return;
      }
      caminhadaRef.current = { walk: walkAlong(caminho, marcador), chave };
      rootRef.current?.setAttribute("data-andando", "sim");
      sujoRef.current = true;
    },
    focusMarker: (chave = "marco") => botoesRef.current.get(chave)?.focus({ preventScroll: true }),
  }));

  // Nova fase: o boneco volta ao início, a câmera enquadra a cena, nada em curso.
  // O mesmo enquadramento vale quando as margens mudam (o cartão da fase muda de altura).
  useEffect(() => {
    const { scene, concluida } = propsRef.current;
    playerRef.current = initialPlayer(scene);
    tempoRef.current = 0;
    aberturaRef.current = concluida ? 1 : 0;
    caminhadaRef.current = null;
    rootRef.current?.setAttribute("data-andando", "nao");
    enquadrar();
  }, [props.scene.id, props.faseId]);
  useEffect(() => {
    // As margens e as pastas chegam por `propsRef`, que o primeiro efeito deste componente atualiza a cada passada, antes deste.
    enquadrar();
  }, [props.margens.topo, props.margens.base, props.margens.esquerda, props.marcadores]);

  // Pausa, porta e pastas: o quadro parado é refeito quando algo disso muda.
  useEffect(() => {
    loopRef.current?.setPaused(props.pausado);
    sujoRef.current = true;
  }, [props.pausado, props.concluida, props.movimento, props.marcadores]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (root === null || canvas === null) return;
    const ctx = canvas.getContext("2d");
    if (ctx === null) {
      // Sem canvas 2D não há cena: nada de laço, e a casca passa para a leitura.
      root.dataset.palco = "sem-canvas";
      propsRef.current.onUnavailable();
      return;
    }

    const medir = () => {
      const caixa = root.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const largura = Math.max(1, Math.round(caixa.width));
      const altura = Math.max(1, Math.round(caixa.height));
      const atual = tamanhoRef.current;
      if (atual.largura === largura && atual.altura === altura && atual.dpr === dpr) return;
      tamanhoRef.current = { largura, altura, dpr };
      canvas.width = largura * dpr;
      canvas.height = altura * dpr;
      // A câmera enquadra a cena na medida nova.
      enquadrar();
    };
    medir();
    const observer = new ResizeObserver(medir);
    observer.observe(root);

    /** Põe cada botão em cima da pasta dele, pelo que a câmera mostra agora. */
    const posicionar = () => {
      const { largura, altura } = tamanhoRef.current;
      for (const marcador of propsRef.current.marcadores) {
        const botao = botoesRef.current.get(marcador.chave);
        if (botao === undefined) continue;
        botao.hidden = !visiveisRef.current.has(marcador.chave);
        const { sx, sy } = toScreen(marcador.x + 0.5, marcador.y + 0.5);
        const { px, py } = project(cameraRef.current, { largura, altura }, sx, sy - FOLDER_LIFT);
        botao.style.transform = `translate(${Math.round(px)}px, ${Math.round(py)}px)`;
      }
    };

    const loop = createLoop({
      update(dt) {
        const p = propsRef.current;
        tempoRef.current += dt;

        const caminhada = caminhadaRef.current;
        if (caminhada !== null) {
          const passo = stepWalk(playerRef.current, caminhada.walk, dt);
          playerRef.current = passo.player;
          if (passo.chegou) {
            caminhadaRef.current = null;
            root.dataset.andando = "nao";
            p.onOpen(caminhada.chave);
          } else {
            caminhadaRef.current = { walk: passo.walk, chave: caminhada.chave };
          }
        }

        const aberturaAntes = aberturaRef.current;
        const alvoDaPorta = p.concluida ? 1 : 0;
        if (!p.movimento) aberturaRef.current = alvoDaPorta;
        else {
          const delta = alvoDaPorta - aberturaRef.current;
          const passo = dt / DOOR_SECONDS;
          aberturaRef.current += Math.abs(delta) <= passo ? delta : Math.sign(delta) * passo;
        }

        // Com movimento, a cena tem o que balança com o tempo e é refeita a cada quadro. Com movimento reduzido ela
        // fica parada: o quadro só é refeito quando o boneco anda ou a porta muda.
        if (p.movimento || caminhada !== null || aberturaRef.current !== aberturaAntes) sujoRef.current = true;
      },
      render() {
        medir();
        if (!sujoRef.current) return;
        sujoRef.current = false;
        const p = propsRef.current;
        // A posição fica no documento, para os testes e para quem depura.
        root.dataset.jogoX = playerRef.current.x.toFixed(2);
        root.dataset.jogoY = playerRef.current.y.toFixed(2);
        // A porta como o palco a desenha neste quadro: é o que a pessoa vê, e não só o que a casca decidiu.
        root.dataset.porta = aberturaRef.current >= 1 ? "aberta" : aberturaRef.current <= 0 ? "fechada" : "abrindo";
        const { largura, altura, dpr } = tamanhoRef.current;
        renderScene(
          ctx,
          {
            scene: p.scene,
            personagem: p.personagem,
            epoca: p.epoca,
            player: playerRef.current,
            // A pasta sem botão também não é desenhada: o que aparece na cena é o que responde ao toque. Os objetos da missão de investigação não são pastas: o móvel da cena já está desenhado, e o botão fica sobre ele.
            pastas: p.marcadores.filter((marcador) => marcador.natureza !== "objeto" && visiveisRef.current.has(marcador.chave)).map((marcador) => ({ x: marcador.x, y: marcador.y, destaque: marcador.natureza === "marco" })),
            abertura: aberturaRef.current,
            camera: cameraRef.current,
            tempo: tempoRef.current,
            movimento: p.movimento,
          },
          { largura, altura },
          dpr,
        );
        posicionar();
      },
    });
    loop.setPaused(propsRef.current.pausado);
    loop.start();
    loopRef.current = loop;
    root.dataset.palco = "pronto";

    return () => {
      loopRef.current = null;
      observer.disconnect();
      loop.stop();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      role="group"
      aria-label={`Cenário da fase: ${props.scene.nome}. É uma representação.`}
      data-palco="carregando"
      data-pausado={props.pausado ? "sim" : "nao"}
      data-andando="nao"
      data-marca={STAGE_MARKER}
      // A cena não usa arraste: o dedo sobre ela ainda rola a página na vertical.
      className="absolute inset-0 touch-pan-y select-none overflow-hidden"
    >
      <canvas ref={canvasRef} className="block h-full w-full" aria-hidden="true" />
      {props.marcadores.map((marcador) => (
        <button
          key={marcador.chave}
          type="button"
          ref={(elemento) => {
            if (elemento === null) botoesRef.current.delete(marcador.chave);
            else botoesRef.current.set(marcador.chave, elemento);
          }}
          className={`jogo-marcador jogo-marcador-${marcador.natureza}`}
          aria-label={marcador.natureza === "marco" ? `Abrir o marco: ${marcador.rotulo}` : marcador.natureza === "objeto" ? `Investigar: ${marcador.rotulo}` : `Explorar: ${marcador.rotulo}`}
          data-marcador={marcador.chave}
          data-natureza={marcador.natureza}
          onClick={() => props.handle.current?.open(marcador.chave)}
        >
          <span className="jogo-marcador-rotulo" aria-hidden="true">
            {marcador.natureza === "marco" ? "Abrir" : marcador.natureza === "objeto" ? marcador.rotulo : "+"}
          </span>
        </button>
      ))}
    </div>
  );
}
