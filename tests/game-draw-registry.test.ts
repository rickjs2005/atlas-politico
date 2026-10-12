// O registro da arte do jogo: toda arte apontada por uma cena existe, toda
// arte registrada é usada por uma cena, todo tipo de elemento de cenário tem
// desenho e aparece na galeria, e os dois personagens têm figura em cada
// época. Só o registro: o desenho em si é conferido nas capturas.

import { describe, expect, it } from "vitest";

import { ARTS } from "@/features/game/draw/arts";
import { CHARACTERS, EPOCAS, GUIDE } from "@/features/game/draw/characters";
import { DESENHOS, PROP_KINDS } from "@/features/game/draw/props";
import { PHASE_PRESENTATION } from "@/lib/game/presentation";
import { SCENES } from "@/lib/game/scenes";
import type { PropKind, SceneArtId, SceneId } from "@/lib/game/types";

describe("artes dos ambientes", () => {
  const artesUsadas = new Set(Object.values(SCENES).map((scene) => scene.arte));

  it("toda cena aponta uma arte registrada, e toda arte registrada desenha pelo menos uma cena", () => {
    for (const scene of Object.values(SCENES)) expect(ARTS[scene.arte], `${scene.id} usa ${scene.arte}`).toBeDefined();
    expect([...artesUsadas].sort()).toEqual((Object.keys(ARTS) as SceneArtId[]).sort());
  });

  it("cada arte tem nome, piso, parede e a receita das pastas", () => {
    for (const arte of Object.values(ARTS)) {
      expect(arte.id).toBeDefined();
      expect(arte.nome.length).toBeGreaterThan(0);
      expect(arte.parede.faixas.length).toBeGreaterThan(0);
      expect(typeof arte.piso).toBe("function");
      expect(arte.receita.lombadas.length).toBeGreaterThan(0);
    }
  });

  it("uma arte reaproveitada por duas cenas tem paletas diferentes, e as salas de arquivo de cada personagem não têm a mesma cor", () => {
    const porArte = new Map<SceneArtId, SceneId[]>();
    for (const scene of Object.values(SCENES)) porArte.set(scene.arte, [...(porArte.get(scene.arte) ?? []), scene.id]);
    for (const [arte, cenas] of porArte) {
      if (cenas.length < 2) continue;
      const paletas = cenas.map((id) => JSON.stringify(SCENES[id].paleta));
      expect(new Set(paletas).size, `${arte}: ${cenas.join(", ")}`).toBe(cenas.length);
    }
    for (const base of ["arquivo-origem", "arquivo-economia", "arquivo-seguranca", "tribunal", "convencao"] as const) {
      expect(SCENES[`${base}-a` as SceneId].paleta, base).not.toEqual(SCENES[`${base}-b` as SceneId].paleta);
    }
  });

  it("cada personagem passa por cenários próprios e por cenários comuns: nenhum cenário identifica pessoa ou partido pelo nome", () => {
    const cenasDe = (prefixo: string) => new Set(Object.entries(PHASE_PRESENTATION).filter(([id]) => id.startsWith(prefixo)).map(([, apresentacao]) => apresentacao.cena));
    expect(cenasDe("lula-").size).toBeGreaterThanOrEqual(6);
    expect(cenasDe("flavio-bolsonaro-").size).toBeGreaterThanOrEqual(6);
    for (const scene of Object.values(SCENES)) expect(scene.nome, scene.id).not.toMatch(/\b(lula|bolsonaro|fl[aá]vio|PT|PL)\b/);
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
    for (const tipo of ["tela", "balcao", "fileira", "sofa", "cartaz", "arquivo", "estante"] as PropKind[]) expect(PROP_KINDS).toContain(tipo);
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
    // O guia fictício é o Escrivão (D-127).
    expect(GUIDE.nome).toBe("Escrivão");
  });

  it("toda fase pede uma época que existe", () => {
    for (const [id, apresentacao] of Object.entries(PHASE_PRESENTATION)) expect(EPOCAS, id).toContain(apresentacao.epoca);
  });
});
