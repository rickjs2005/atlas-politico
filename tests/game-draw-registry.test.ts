// O registro da arte do jogo: toda arte apontada por uma cena existe, toda
// arte registrada é usada por uma cena, todo tipo de elemento de cenário tem
// desenho e aparece na galeria, e os dois personagens têm figura em cada
// época. Só o registro: o desenho em si é conferido nas capturas.

import { describe, expect, it } from "vitest";

import { ARTS } from "@/features/game/draw/arts";
import { CHARACTERS, EPOCAS, GUIDE } from "@/features/game/draw/characters";
import { DESENHOS, PROP_KINDS } from "@/features/game/draw/props";
import { CHAPTERS } from "@/lib/game/chapters";
import { SCENES } from "@/lib/game/scenes";
import type { PropKind, SceneArtId } from "@/lib/game/types";

describe("artes dos ambientes", () => {
  const artesUsadas = new Set(Object.values(SCENES).map((scene) => scene.arte));

  it("toda cena aponta uma arte registrada, e toda arte registrada desenha pelo menos uma cena", () => {
    for (const scene of Object.values(SCENES)) expect(ARTS[scene.arte], `${scene.id} usa ${scene.arte}`).toBeDefined();
    expect([...artesUsadas].sort()).toEqual((Object.keys(ARTS) as SceneArtId[]).sort());
  });

  it("os quatro ambientes da etapa 1 não são a aparência de todos os períodos novos: há cinco artes a mais, e cada uma tem nome", () => {
    const novas = (Object.keys(ARTS) as SceneArtId[]).filter((id) => !["sindicato", "constituinte", "alerj", "senado"].includes(id));
    expect(novas.sort()).toEqual(["comissao", "comite", "convencao", "gabinete", "tribunal"]);
    for (const arte of Object.values(ARTS)) {
      expect(arte.id).toBeDefined();
      expect(arte.nome.length).toBeGreaterThan(0);
      expect(arte.parede.faixas.length).toBeGreaterThan(0);
      expect(typeof arte.piso).toBe("function");
      expect(arte.receita.lombadas.length).toBeGreaterThan(0);
    }
  });

  it("cada capítulo novo tem cenário próprio, e uma arte reaproveitada por duas cenas tem paletas diferentes", () => {
    const porArte = new Map<SceneArtId, string[]>();
    for (const scene of Object.values(SCENES)) porArte.set(scene.arte, [...(porArte.get(scene.arte) ?? []), scene.id]);
    for (const [arte, cenas] of porArte) {
      if (cenas.length < 2) continue;
      const paletas = cenas.map((id) => JSON.stringify(SCENES[id as keyof typeof SCENES].paleta));
      expect(new Set(paletas).size, `${arte}: ${cenas.join(", ")}`).toBe(cenas.length);
    }
    expect(new Set(CHAPTERS.map((capitulo) => capitulo.cena)).size).toBe(CHAPTERS.length);
  });
});

describe("elementos de cenário", () => {
  it("todo tipo usado pelas cenas tem desenho", () => {
    for (const scene of Object.values(SCENES)) {
      for (const prop of scene.props) expect(DESENHOS[prop.tipo], `${scene.id}: ${prop.tipo}`).toBeDefined();
    }
  });

  it("a lista da galeria é a dos desenhos, sem repetição", () => {
    expect(PROP_KINDS).toEqual(Object.keys(DESENHOS) as PropKind[]);
    expect(new Set(PROP_KINDS).size).toBe(PROP_KINDS.length);
    for (const novo of ["tela", "balcao", "fileira", "sofa", "cartaz"] as PropKind[]) expect(PROP_KINDS).toContain(novo);
  });
});

describe("figuras dos personagens", () => {
  it("os dois personagens têm uma figura por época, com o mesmo nome e a mesma altura entre as épocas", () => {
    expect(EPOCAS).toEqual(["inicio", "meio", "atual"]);
    for (const slug of ["lula", "flavio-bolsonaro"] as const) {
      const figuras = EPOCAS.map((epoca) => CHARACTERS[slug][epoca]);
      expect(new Set(figuras.map((figura) => figura.nome)).size, slug).toBe(1);
      expect(new Set(figuras.map((figura) => figura.altura)).size, slug).toBe(1);
      for (const figura of figuras) expect(typeof figura.draw).toBe("function");
    }
    expect(GUIDE.nome).toBe("Arquivista");
  });

  it("cada capítulo pede uma época que existe, e os dois personagens passam pelas três", () => {
    for (const capitulo of CHAPTERS) expect(EPOCAS, capitulo.id).toContain(capitulo.epoca);
    for (const slug of ["lula", "flavio-bolsonaro"] as const) {
      const epocas = new Set(CHAPTERS.filter((capitulo) => capitulo.personagem === slug).map((capitulo) => capitulo.epoca));
      expect([...epocas].sort(), slug).toEqual(["atual", "inicio", "meio"]);
    }
  });
});
