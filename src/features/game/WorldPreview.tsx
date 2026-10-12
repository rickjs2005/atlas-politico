"use client";

// Prévia do cenário de uma fase: a cena inteira, com o personagem parado no
// início e a pasta do marco em destaque. Serve à entrada do jogo. Só no navegador.
//
// O desenho só anima enquanto a prévia está na tela; fora dela, ou com
// movimento reduzido, fica um quadro parado, refeito quando o tamanho muda.

import { useEffect, useRef } from "react";

import { getScene } from "@/lib/game/scenes";
import type { Epoca, PersonagemSlug, SceneId } from "@/lib/game/types";
import { sceneBounds, zoomToFit } from "@/lib/game/world/camera";
import { initialPlayer } from "@/lib/game/world/path";

import { renderScene } from "./engine/render";
import { useMotion } from "./hooks";

export function WorldPreview({ cena, epoca, personagem }: { cena: SceneId; epoca: Epoca; personagem: PersonagemSlug }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const movimento = useMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (canvas === null) return;
    const ctx = canvas.getContext("2d");
    if (ctx === null) return;
    const scene = getScene(cena);
    const marco = scene.registros[0];
    const player = initialPlayer(scene);
    const caixa = sceneBounds(scene);
    const inicio = performance.now();
    let pedido = 0;
    let naTela = true;

    const draw = (agora: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const largura = Math.max(1, Math.round(canvas.clientWidth));
      const altura = Math.max(1, Math.round(canvas.clientHeight));
      // O tamanho do canvas é inteiro: com densidade fracionária, comparar sem
      // arredondar refaria o canvas a cada quadro.
      const w = Math.round(largura * dpr);
      const h = Math.round(altura * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      const viewport = { largura, altura };
      renderScene(
        ctx,
        {
          scene,
          personagem,
          epoca,
          player,
          pastas: marco === undefined ? [] : [{ ...marco, destaque: true }],
          abertura: 0,
          camera: { cx: (caixa.minX + caixa.maxX) / 2, cy: (caixa.minY + caixa.maxY) / 2, zoom: zoomToFit(scene, viewport) },
          tempo: movimento ? (agora - inicio) / 1000 : 0,
          movimento,
        },
        viewport,
        dpr,
      );
    };
    const quadro = (agora: number) => {
      draw(agora);
      pedido = movimento && naTela ? requestAnimationFrame(quadro) : 0;
    };
    const retomar = () => {
      if (pedido === 0) pedido = requestAnimationFrame(quadro);
    };

    const tamanho = new ResizeObserver(retomar);
    tamanho.observe(canvas);
    const visivel = new IntersectionObserver(([entrada]) => {
      naTela = entrada?.isIntersecting ?? true;
      if (naTela) retomar();
    });
    visivel.observe(canvas);
    retomar();

    return () => {
      tamanho.disconnect();
      visivel.disconnect();
      cancelAnimationFrame(pedido);
    };
  }, [cena, epoca, personagem, movimento]);

  return <canvas ref={ref} aria-hidden="true" className="block h-full w-full" data-previa-mundo={cena} />;
}
