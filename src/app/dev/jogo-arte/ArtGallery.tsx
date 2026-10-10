"use client";

// Galeria da arte do jogo: cada personagem nas quatro direções, em repouso e
// andando; cada elemento de cenário em cada paleta; piso, paredes, saída,
// registro e efeito; e cada cena inteira, com o personagem no início. Serve
// para olhar o desenho sem jogar e para as capturas de conferência.

import { useEffect, useRef } from "react";

import { CHAPTERS } from "@/lib/game/chapters";
import { SCENES } from "@/lib/game/scenes";
import type { Facing, PropKind, SceneSpec } from "@/lib/game/types";
import { sceneBounds, zoomToFit } from "@/lib/game/world/camera";
import { initialPlayer } from "@/lib/game/world/movement";

import { CHARACTERS, GUIDE, RECORD_ART, SCENE_ART, type CellInfo, type CharacterArt, type DrawContext } from "@/features/game/draw";
import { renderScene } from "@/features/game/engine/render";

const FACINGS: Facing[] = ["frente-direita", "frente-esquerda", "costas-direita", "costas-esquerda"];
const PROPS: PropKind[] = [
  "mesa",
  "mesa-central",
  "cadeira",
  "bancada",
  "tribuna",
  "arquivo",
  "estante",
  "armario",
  "coluna",
  "urna",
  "bandeira",
  "planta",
  "maquina",
  "banco",
  "microfone",
  "caixote",
  "poltrona",
  "placa",
  "decoracao",
];

interface ArtCanvasProps {
  id: string;
  largura: number;
  altura: number;
  /** Desenha o quadro. `tempo` em segundos; com `animar`, é chamado a cada quadro. */
  draw(ctx: CanvasRenderingContext2D, tempo: number, dpr: number): void;
  animar?: boolean;
  legenda?: string;
}

function ArtCanvas({ id, largura, altura, draw, animar = false, legenda }: ArtCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (canvas === null) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = largura * dpr;
    canvas.height = altura * dpr;
    const ctx = canvas.getContext("2d");
    if (ctx === null) return;
    let pedido = 0;
    const inicio = performance.now();
    const quadro = (agora: number) => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      draw(ctx, (agora - inicio) / 1000, dpr);
      if (animar) pedido = requestAnimationFrame(quadro);
    };
    pedido = requestAnimationFrame(quadro);
    return () => cancelAnimationFrame(pedido);
  }, [largura, altura, draw, animar]);
  return (
    <figure className="space-y-1">
      <canvas ref={ref} data-galeria={id} style={{ width: largura, height: altura }} className="border border-line bg-raised" />
      {legenda && <figcaption className="text-xs text-ink-soft">{legenda}</figcaption>}
    </figure>
  );
}

function contexto(ctx: CanvasRenderingContext2D, tempo: number, movimento = true): DrawContext {
  return { ctx, tempo, movimento };
}

function CharacterRow({ id, arte }: { id: string; arte: CharacterArt }) {
  return (
    <section className="space-y-2">
      <h3 className="font-serif text-xl">{arte.nome}</h3>
      <div className="flex flex-wrap gap-3">
        {FACINGS.map((facing) => (
          <ArtCanvas
            key={`${facing}-parado`}
            id={`${id}-${facing}-parado`}
            largura={96}
            altura={112}
            legenda={`${facing}, parado`}
            draw={(ctx, tempo, dpr) => {
              ctx.scale(dpr, dpr);
              arte.draw(contexto(ctx, tempo), { facing, andando: false, fase: 0 }, 48, 100);
            }}
            animar
          />
        ))}
        {FACINGS.map((facing) => (
          <ArtCanvas
            key={`${facing}-andando`}
            id={`${id}-${facing}-andando`}
            largura={96}
            altura={112}
            legenda={`${facing}, andando`}
            draw={(ctx, tempo, dpr) => {
              ctx.scale(dpr, dpr);
              arte.draw(contexto(ctx, tempo), { facing, andando: true, fase: (tempo * 1.9) % 1 }, 48, 100);
            }}
            animar
          />
        ))}
        {[0, 0.25, 0.5, 0.75].map((fase) => (
          <ArtCanvas
            key={`fase-${fase}`}
            id={`${id}-fase-${fase}`}
            largura={96}
            altura={112}
            legenda={`passo ${fase}`}
            draw={(ctx, tempo, dpr) => {
              ctx.scale(dpr, dpr);
              arte.draw(contexto(ctx, tempo, false), { facing: "frente-direita", andando: true, fase }, 48, 100);
            }}
          />
        ))}
        <ArtCanvas
          id={`${id}-grande`}
          largura={240}
          altura={280}
          legenda="ampliado 2,5×"
          draw={(ctx, tempo, dpr) => {
            ctx.scale(dpr * 2.5, dpr * 2.5);
            arte.draw(contexto(ctx, tempo), { facing: "frente-direita", andando: false, fase: 0 }, 48, 104);
          }}
          animar
        />
      </div>
    </section>
  );
}

function SceneSheet({ scene }: { scene: SceneSpec }) {
  const p = scene.paleta;
  // Uma célula do meio da cena, para as peças avulsas.
  const info: CellInfo = { cena: scene.id, x: 4, y: 4, largura: scene.largura, altura: scene.altura };
  return (
    <section className="space-y-2">
      <h3 className="font-serif text-xl">{scene.nome}</h3>
      <ArtCanvas
        id={`folha-${scene.id}`}
        largura={1180}
        altura={400}
        legenda="piso (duas variantes e tapete), paredes (norte, oeste, leste, sul), saída fechada, meio aberta e aberta (leste e sul), registro (normal e em destaque), efeito de recolher, elementos de cenário"
        draw={(ctx, tempo, dpr) => {
          ctx.scale(dpr, dpr);
          const d = contexto(ctx, tempo);
          let x = 50;
          SCENE_ART.drawFloor(d, p, x, 60, 0, false, info);
          SCENE_ART.drawFloor(d, p, x + 70, 60, 1, false, { ...info, x: 5 });
          SCENE_ART.drawFloor(d, p, x + 140, 60, 0, true, info);
          x = 300;
          for (const lado of ["norte", "oeste", "leste", "sul"] as const) {
            SCENE_ART.drawFloor(d, p, x, 90, 0, false, info);
            SCENE_ART.drawWall(d, p, x, 90, lado, info);
            x += 80;
          }
          x = 650;
          for (const abertura of [0, 0.5, 1]) {
            SCENE_ART.drawThreshold(d, p, x, 90, "leste", abertura, info);
            SCENE_ART.drawExit(d, p, x, 90, "leste", abertura, info);
            x += 80;
          }
          for (const abertura of [0, 0.5, 1]) {
            SCENE_ART.drawThreshold(d, p, x, 90, "sul", abertura, info);
            SCENE_ART.drawExit(d, p, x, 90, "sul", abertura, info);
            x += 80;
          }
          SCENE_ART.drawFloor(d, p, 1120, 60, 0, false, info);
          RECORD_ART.draw(d, 1100, 60, false);
          RECORD_ART.draw(d, 1150, 60, true);
          SCENE_ART.drawFloor(d, p, 1120, 130, 0, false, info);
          SCENE_ART.drawReachRing(d, p, 1120, 130);
          SCENE_ART.drawCollectEffect(d, p, 1120, 130, (tempo % 1.2) / 1.2);
          x = 50;
          let y = 200;
          PROPS.forEach((tipo, indice) => {
            if (indice === 10) {
              x = 50;
              y = 330;
            }
            SCENE_ART.drawFloor(d, p, x, y, 0, false, info);
            SCENE_ART.drawProp(d, p, tipo, x, y, 0, false, info);
            ctx.fillStyle = "#4a4c45";
            ctx.font = "10px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(tipo, x, y + 26);
            x += 110;
          });
        }}
        animar
      />
      <ArtCanvas
        id={`cena-${scene.id}`}
        largura={760}
        altura={440}
        legenda="a cena inteira, com o personagem no início"
        draw={(ctx, tempo, dpr) => {
          const capitulo = CHAPTERS.find((item) => item.cena === scene.id)!;
          const viewport = { largura: 760, altura: 440 };
          const zoom = zoomToFit(scene, viewport);
          const caixa = sceneBounds(scene);
          const player = initialPlayer(scene);
          const registro = scene.registros[0]!;
          renderScene(
            ctx,
            {
              scene,
              chapter: capitulo,
              personagem: capitulo.personagem,
              player: { ...player, facing: "frente-direita", andando: true, fase: (tempo * 1.9) % 1 },
              recolhidos: [],
              abertura: (Math.sin(tempo * 0.8) + 1) / 2,
              alcance: { tipo: "registro", id: capitulo.eventIds[0]!, x: registro.x + 0.5, y: registro.y + 0.5 },
              efeitos: [{ x: registro.x + 0.5, y: registro.y + 0.5, t: (tempo % 1.5) / 1.5 }],
              camera: { cx: (caixa.minX + caixa.maxX) / 2, cy: (caixa.minY + caixa.maxY) / 2, zoom },
              tempo,
              movimento: true,
            },
            viewport,
            dpr,
          );
        }}
        animar
      />
    </section>
  );
}

export function ArtGallery() {
  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <h2 className="font-serif text-3xl">Personagens</h2>
        <CharacterRow id="lula" arte={CHARACTERS.lula} />
        <CharacterRow id="flavio-bolsonaro" arte={CHARACTERS["flavio-bolsonaro"]} />
        <CharacterRow id="guia" arte={GUIDE} />
      </section>
      <section className="space-y-6">
        <h2 className="font-serif text-3xl">Cenários</h2>
        {Object.values(SCENES).map((scene) => (
          <SceneSheet key={scene.id} scene={scene} />
        ))}
      </section>
    </div>
  );
}
