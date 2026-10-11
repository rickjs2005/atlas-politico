"use client";

// O palco: o canvas, o laço de animação e a entrada do personagem. Recebe a
// cena e o que mudou (registros recolhidos, saída aberta, pausa) e avisa o
// que aconteceu no mundo: um objeto ao alcance, uma interação, a travessia da
// saída. Não guarda progresso nem conhece os diálogos.
//
// Só existe no navegador: é carregado por `next/dynamic` em GameShell.

import { useEffect, useImperativeHandle, useRef, type RefObject } from "react";

import { recordIds } from "@/lib/game/mission";
import type { ChapterSpec, Interactable, PersonagemSlug, PlayerState, SceneSpec } from "@/lib/game/types";
import { clampCenter, followCamera, zoomFor, type Camera } from "@/lib/game/world/camera";
import { listInteractables, nearestInteractable } from "@/lib/game/world/interact";
import { toScreen } from "@/lib/game/world/iso";
import { initialPlayer, isOnExit, stepPlayer } from "@/lib/game/world/movement";

import { createInput } from "./engine/input";
import { createLoop, type GameLoop } from "./engine/loop";
import { renderScene, type CollectEffect } from "./engine/render";

/** Marca que identifica o pacote do palco na saída estática (tests/export). */
export const STAGE_MARKER = "atlas-jogo-palco";

export interface GameStageHandle {
  /** Direção dos controles de toque, em eixos de tela. */
  setTouch(dx: number, dy: number): void;
  /** Interage com o que está ao alcance, como a tecla E. */
  interact(): void;
  focus(): void;
}

export interface GameStageProps {
  /** Recebe as ações que a interface manda para a cena (toque, interagir, foco). */
  handle: RefObject<GameStageHandle | null>;
  scene: SceneSpec;
  chapter: ChapterSpec;
  personagem: PersonagemSlug;
  /** Muda quando a cena tem de recomeçar sem trocar de capítulo (reinício, fim da etapa). */
  sessao: number;
  recolhidos: readonly string[];
  saidaAberta: boolean;
  /** Pausa a simulação: diálogo aberto, painel aberto, janela sem foco. */
  pausado: boolean;
  movimento: boolean;
  onInteract(alvo: Interactable): void;
  onExit(): void;
  onReach(alvo: Interactable | null): void;
  onEscape(): void;
  /**
   * O navegador não deu o contexto 2D do canvas: a cena não pode ser
   * desenhada. A casca avisa e aponta o painel, que cumpre tudo sem o cenário.
   */
  onUnavailable(): void;
  /** Elemento com as instruções, para o leitor de tela. */
  describedBy: string;
}

const EFFECT_SECONDS = 0.9;
const EXIT_OPEN_SECONDS = 0.6;

export function GameStage(props: GameStageProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // O laço lê as props pelo ref, atualizado depois de cada renderização.
  const propsRef = useRef(props);
  useEffect(() => {
    propsRef.current = props;
  });

  const playerRef = useRef<PlayerState>(initialPlayer(props.scene));
  const cameraRef = useRef<Camera>({ cx: 0, cy: 0, zoom: 1 });
  const tempoRef = useRef(0);
  const aberturaRef = useRef(props.saidaAberta ? 1 : 0);
  const efeitosRef = useRef<CollectEffect[]>([]);
  const alcanceRef = useRef<Interactable | null>(null);
  const saiuRef = useRef(false);
  const recolhidosVistosRef = useRef<ReadonlySet<string>>(new Set(props.recolhidos));
  const inputRef = useRef(createInput());
  const loopRef = useRef<GameLoop | null>(null);
  const tamanhoRef = useRef({ largura: 0, altura: 0, dpr: 1 });
  // Algo mudou desde o último desenho: em pausa, o quadro não é refeito à toa.
  const sujoRef = useRef(true);

  useImperativeHandle(props.handle, () => ({
    setTouch: (dx, dy) => inputRef.current.setTouch(dx, dy),
    interact: () => {
      const alvo = alcanceRef.current;
      if (alvo !== null) propsRef.current.onInteract(alvo);
    },
    focus: () => rootRef.current?.focus({ preventScroll: true }),
  }));

  // Nova cena: o personagem volta ao início, a câmera o enquadra, nada em curso.
  useEffect(() => {
    const { scene, saidaAberta } = propsRef.current;
    playerRef.current = initialPlayer(scene);
    const { sx, sy } = toScreen(playerRef.current.x, playerRef.current.y);
    const { largura, altura } = tamanhoRef.current;
    const zoom = zoomFor(scene, { largura: largura || 800, altura: altura || 600 });
    const centro = clampCenter(sx, sy, scene, { largura: largura || 800, altura: altura || 600 }, zoom);
    cameraRef.current = { ...centro, zoom };
    tempoRef.current = 0;
    aberturaRef.current = saidaAberta ? 1 : 0;
    efeitosRef.current = [];
    saiuRef.current = false;
    alcanceRef.current = null;
    sujoRef.current = true;
    propsRef.current.onReach(null);
    recolhidosVistosRef.current = new Set(propsRef.current.recolhidos);
  }, [props.scene.id, props.chapter.id, props.sessao]);

  // Registro recolhido: o efeito sai de onde ele estava. Com movimento
  // reduzido não há efeito: a pasta some de uma vez, como a porta abre de uma vez.
  useEffect(() => {
    const vistos = recolhidosVistosRef.current;
    const novos = props.recolhidos.filter((id) => !vistos.has(id));
    if (novos.length === 0) return;
    for (const id of novos) {
      const indice = recordIds(props.chapter).indexOf(id);
      const posicao = props.scene.registros[indice];
      if (posicao !== undefined && props.movimento) efeitosRef.current.push({ x: posicao.x + 0.5, y: posicao.y + 0.5, t: 0 });
    }
    recolhidosVistosRef.current = new Set(props.recolhidos);
    sujoRef.current = true;
  }, [props.recolhidos, props.chapter, props.scene.registros, props.movimento]);

  // Pausa: congela a simulação e solta as teclas, para o personagem não
  // continuar andando ao voltar.
  useEffect(() => {
    loopRef.current?.setPaused(props.pausado);
    if (props.pausado) inputRef.current.release();
    sujoRef.current = true;
  }, [props.pausado, props.saidaAberta, props.movimento]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (root === null || canvas === null) return;
    const ctx = canvas.getContext("2d");
    if (ctx === null) {
      // Sem canvas 2D não há cena: nada de laço, e a casca mostra o aviso.
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
      // A câmera já enquadra o personagem na medida nova, sem deslizar até ele.
      const cena = propsRef.current.scene;
      const zoom = zoomFor(cena, { largura, altura });
      const { sx, sy } = toScreen(playerRef.current.x, playerRef.current.y);
      cameraRef.current = { ...clampCenter(sx, sy, cena, { largura, altura }, zoom), zoom };
      sujoRef.current = true;
    };
    medir();
    const observer = new ResizeObserver(medir);
    observer.observe(root);

    const soltar = inputRef.current.attach(root, {
      onInteract: () => {
        const alvo = alcanceRef.current;
        if (alvo !== null && !propsRef.current.pausado) propsRef.current.onInteract(alvo);
      },
      onEscape: () => propsRef.current.onEscape(),
    });

    const loop = createLoop({
      update(dt) {
        const p = propsRef.current;
        const { largura, altura } = tamanhoRef.current;
        const viewport = { largura, altura };
        const input = inputRef.current.read();
        playerRef.current = stepPlayer(playerRef.current, input, dt, p.scene, p.saidaAberta);
        tempoRef.current += dt;

        const alvoAbertura = p.saidaAberta ? 1 : 0;
        if (!p.movimento) aberturaRef.current = alvoAbertura;
        else {
          const delta = alvoAbertura - aberturaRef.current;
          const passo = dt / EXIT_OPEN_SECONDS;
          aberturaRef.current += Math.abs(delta) <= passo ? delta : Math.sign(delta) * passo;
        }

        efeitosRef.current = efeitosRef.current
          .map((efeito) => ({ ...efeito, t: efeito.t + dt / EFFECT_SECONDS }))
          .filter((efeito) => efeito.t < 1);

        const alcance = nearestInteractable(playerRef.current, listInteractables(p.scene, p.chapter, p.recolhidos));
        const anterior = alcanceRef.current;
        if ((alcance?.tipo ?? null) !== (anterior?.tipo ?? null) || (alcance?.id ?? null) !== (anterior?.id ?? null)) {
          alcanceRef.current = alcance;
          p.onReach(alcance);
        }

        // Atravessar avisa uma vez por entrada na célula da saída: quem sai dela e volta atravessa de novo.
        if (!isOnExit(playerRef.current, p.scene)) saiuRef.current = false;
        else if (p.saidaAberta && !saiuRef.current) {
          saiuRef.current = true;
          inputRef.current.release();
          p.onExit();
        }

        const { sx, sy } = toScreen(playerRef.current.x, playerRef.current.y);
        const centro = clampCenter(sx, sy, p.scene, viewport, cameraRef.current.zoom);
        cameraRef.current = followCamera(cameraRef.current, centro, dt, p.movimento);

        sujoRef.current = true;
      },
      render() {
        medir();
        if (!sujoRef.current) return;
        sujoRef.current = false;
        const p = propsRef.current;
        // A posição fica no documento, para os testes e para quem depura.
        root.dataset.jogoX = playerRef.current.x.toFixed(2);
        root.dataset.jogoY = playerRef.current.y.toFixed(2);
        root.dataset.andando = playerRef.current.andando ? "sim" : "nao";
        // A porta como o palco a desenha neste quadro: é o que a pessoa vê, e não só o que a casca decidiu.
        root.dataset.porta = aberturaRef.current >= 1 ? "aberta" : aberturaRef.current <= 0 ? "fechada" : "abrindo";
        const { largura, altura, dpr } = tamanhoRef.current;
        renderScene(
          ctx,
          {
            scene: p.scene,
            chapter: p.chapter,
            personagem: p.personagem,
            player: playerRef.current,
            recolhidos: p.recolhidos,
            abertura: aberturaRef.current,
            alcance: alcanceRef.current,
            efeitos: efeitosRef.current,
            camera: cameraRef.current,
            tempo: tempoRef.current,
            movimento: p.movimento,
          },
          { largura, altura },
          dpr,
        );
      },
    });
    loop.setPaused(propsRef.current.pausado);
    loop.start();
    loopRef.current = loop;
    root.dataset.palco = "pronto";

    // O foco vai para a cena quando nada mais está em uso, para as setas já valerem.
    if (document.activeElement === null || document.activeElement === document.body) root.focus({ preventScroll: true });

    return () => {
      loopRef.current = null;
      observer.disconnect();
      loop.stop();
      soltar();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      role="application"
      aria-label="Cena do jogo"
      aria-describedby={props.describedBy}
      data-palco="carregando"
      data-pausado={props.pausado ? "sim" : "nao"}
      data-marca={STAGE_MARKER}
      // A cena não usa arraste: o dedo sobre ela ainda rola a página na vertical.
      // O foco é o contorno do atlas, virado para dentro: um contorno é pintado
      // por cima do canvas; uma sombra interna ficaria escondida atrás dele.
      className="absolute inset-0 touch-pan-y select-none focus-visible:-outline-offset-2"
    >
      <canvas ref={canvasRef} className="block h-full w-full" aria-hidden="true" />
    </div>
  );
}
