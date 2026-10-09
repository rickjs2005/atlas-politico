// Dos pontos aos marcadores: lugares, agrupamento por proximidade na tela e
// as três contagens que não podem se misturar (pontos, lugares e
// acontecimentos). Os casos que os dados publicados não têm usam uma coleção
// montada aqui, isolada do conteúdo.

import { describe, expect, it } from "vitest";

import { MAP_LIMITS } from "@/features/map/camera";
import {
  buildPlaces,
  countEvents,
  countPlaced,
  distinctEvents,
  groupLabel,
  groupPlaces,
  groupTitle,
  groupsOfEvent,
  placesOfEvent,
  splitByArea,
  withoutMarker,
  type ScreenPoint,
} from "@/features/map/places";
import { filterPoints } from "@/lib/data/points";
import type { EventPointCollection, EventPointProperties } from "@/lib/data/types";
import type { Position } from "@/lib/domain/geo";

import { loadAtlasData } from "./helpers";

const data = loadAtlasData();

/** Um ponto de teste: o acontecimento `evento` no lugar `lugar`. */
function ponto(
  evento: string,
  lugar: string,
  position: Position,
  extras: Partial<EventPointProperties> = {},
): EventPointCollection["features"][number] {
  return {
    type: "Feature",
    id: `${evento}@${lugar}`,
    geometry: { type: "Point", coordinates: position },
    properties: {
      eventId: evento,
      placeId: lugar,
      acontecimentoSlug: `slug-${evento}`,
      titulo: `Acontecimento ${evento}`,
      categoria: "eleicoes",
      pessoaIds: ["pessoa"],
      ano: 2018,
      dataValor: "2018",
      dataPrecisao: "ano",
      lugarNome: `Lugar ${lugar}`,
      precisaoGeografica: "municipio",
      ...extras,
    },
  };
}
const colecao = (...features: EventPointCollection["features"]): EventPointCollection => ({
  type: "FeatureCollection",
  features,
});

// Projeção de teste: um grau vale `escala` pixels. Basta para medir distância na tela.
const projecao =
  (escala: number) =>
  ([longitude, latitude]: Position): ScreenPoint => ({ x: longitude * escala, y: -latitude * escala });

const CAPITAL: Position = [-47.8, -15.8];
const VIZINHA: Position = [-46.6, -23.6];
const COLADA: Position = [-46.5, -23.8];
const DISTANTE: Position = [-51.2, -30.1];

describe("lugares do recorte", () => {
  it("junta no mesmo lugar os acontecimentos que o citam, em ordem cronológica", () => {
    const lugares = buildPlaces(
      colecao(
        ponto("a", "capital", CAPITAL),
        ponto("b", "vizinha", VIZINHA),
        ponto("c", "capital", CAPITAL),
        ponto("d", "capital", CAPITAL),
      ),
    );
    expect(lugares.map((lugar) => lugar.placeId)).toEqual(["capital", "vizinha"]);
    expect(lugares[0]?.events.map((evento) => evento.eventId)).toEqual(["a", "c", "d"]);
    expect(lugares[0]?.position).toEqual(CAPITAL);
  });

  it("leva o que distingue um acontecimento do outro, com a data na precisão original", () => {
    const [lugar] = buildPlaces(
      colecao(
        ponto("a", "capital", CAPITAL, {
          titulo: "Título de teste",
          categoria: "marcos-historicos",
          dataValor: "2003-03",
          dataPrecisao: "mes",
          lugarNome: "Capital de teste",
          precisaoGeografica: "uf",
        }),
      ),
    );
    expect(lugar).toMatchObject({ nome: "Capital de teste", precisao: "uf" });
    expect(lugar?.events[0]).toEqual({
      eventId: "a",
      slug: "slug-a",
      titulo: "Título de teste",
      categoria: "marcos-historicos",
      data: { valor: "2003-03", precisao: "mes" },
      ordem: 0,
    });
  });

  it("o mesmo par de acontecimento e lugar repetido não vira dois itens", () => {
    const [lugar] = buildPlaces(colecao(ponto("a", "capital", CAPITAL), ponto("a", "capital", CAPITAL)));
    expect(lugar?.events).toHaveLength(1);
  });

  it("coleção vazia não tem lugar", () => {
    expect(buildPlaces(colecao())).toEqual([]);
  });

  it("com os dados de teste do projeto: um lugar por lugar documentado", () => {
    const lugares = buildPlaces(data.pontos);
    expect(lugares.map((lugar) => lugar.placeId).sort()).toEqual(
      [...new Set(data.pontos.features.map((item) => item.properties.placeId))].sort(),
    );
  });
});

describe("pontos, lugares e acontecimentos são contas diferentes", () => {
  // O acontecimento `a` tem dois lugares; `b` e `c` dividem um lugar com ele.
  const comDoisLugares = colecao(
    ponto("a", "capital", CAPITAL),
    ponto("a", "distante", DISTANTE),
    ponto("b", "capital", CAPITAL),
    ponto("c", "capital", CAPITAL),
  );

  it("um acontecimento com dois lugares gera dois pontos e conta uma vez", () => {
    expect(countPlaced(comDoisLugares)).toEqual({ pontos: 4, lugares: 2, acontecimentos: 3 });
  });

  it("os acontecimentos distintos saem em ordem cronológica", () => {
    expect(distinctEvents(buildPlaces(comDoisLugares)).map((evento) => evento.eventId)).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("no marcador que reúne os dois lugares, o acontecimento repetido conta uma vez", () => {
    const [grupo] = groupPlaces(buildPlaces(comDoisLugares), projecao(0.1), 44);
    expect(grupo?.places).toHaveLength(2);
    // Quatro pontos, três acontecimentos: o número do marcador é três.
    expect(grupo?.events.map((evento) => evento.eventId)).toEqual(["a", "b", "c"]);
  });

  it("com os dados de teste: o acontecimento de dois lugares aparece em dois lugares", () => {
    const { pontos, acontecimentos } = countPlaced(data.pontos);
    expect(pontos).toBe(data.pontos.features.length);
    expect(acontecimentos).toBe(new Set(data.pontos.features.map((item) => item.properties.eventId)).size);
    expect(pontos).toBeGreaterThan(acontecimentos);
    expect(placesOfEvent(buildPlaces(data.pontos), "sintetico-evento-03")).toHaveLength(2);
  });
});

describe("agrupamento por proximidade na tela", () => {
  const lugares = buildPlaces(
    colecao(
      ponto("a", "capital", CAPITAL),
      ponto("b", "capital", CAPITAL),
      ponto("c", "vizinha", VIZINHA),
      ponto("d", "colada", COLADA),
      ponto("e", "distante", DISTANTE),
    ),
  );
  const ids = (escala: number, raio = 44) =>
    groupPlaces(lugares, projecao(escala), raio).map((grupo) => grupo.id);

  it("de longe, tudo cabe em um marcador só", () => {
    expect(ids(0.5)).toEqual(["capital+colada+distante+vizinha"]);
  });

  it("aproximando, os lugares se separam, e os colados continuam juntos", () => {
    // A 30 pixels por grau, "vizinha" e "colada" ficam a 7 pixels uma da outra.
    expect(ids(30)).toEqual(["capital", "colada+vizinha", "distante"]);
  });

  it("no zoom máximo, o que continua junto ainda é um marcador com todos dentro", () => {
    const grupos = groupPlaces(lugares, projecao(45), 44);
    const juntos = grupos.find((grupo) => grupo.id === "colada+vizinha");
    expect(juntos?.events.map((evento) => evento.eventId)).toEqual(["c", "d"]);
    // Nada some: todo acontecimento está em algum marcador.
    expect(grupos.flatMap((grupo) => grupo.events.map((evento) => evento.eventId)).sort()).toEqual([
      "a",
      "b",
      "c",
      "d",
      "e",
    ]);
  });

  it("lugares com as mesmas coordenadas nunca se separam", () => {
    const sobrepostos = buildPlaces(
      colecao(ponto("a", "um", CAPITAL), ponto("b", "outro", CAPITAL), ponto("c", "outro", CAPITAL)),
    );
    for (const escala of [1, 100, 10_000]) {
      const grupos = groupPlaces(sobrepostos, projecao(escala), 44);
      expect(grupos).toHaveLength(1);
      expect(grupos[0]?.events).toHaveLength(3);
    }
  });

  it("o marcador fica no lugar com mais acontecimentos, e dois marcadores nunca ficam mais perto que o raio", () => {
    const escala = 30;
    const grupos = groupPlaces(lugares, projecao(escala), 44);
    for (const grupo of grupos) {
      const maior = Math.max(...grupo.places.map((place) => place.events.length));
      expect(grupo.places[0]?.events.length).toBe(maior);
      expect(grupo.position).toEqual(grupo.places[0]?.position);
    }
    const telas = grupos.map((grupo) => projecao(escala)(grupo.position));
    for (const [indice, a] of telas.entries()) {
      for (const b of telas.slice(indice + 1)) {
        expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThanOrEqual(44);
      }
    }
  });

  it("os marcadores saem de norte a sul: é a ordem em que o teclado os percorre", () => {
    const latitudes = groupPlaces(lugares, projecao(30), 44).map((grupo) => grupo.position[1]);
    expect(latitudes).toEqual([...latitudes].sort((a, b) => b - a));
    expect(latitudes.length).toBeGreaterThan(1);
  });

  it("o identificador do grupo não depende da ordem em que os lugares chegam", () => {
    const invertidos = [...lugares].reverse();
    expect(groupPlaces(invertidos, projecao(30), 44).map((grupo) => grupo.id)).toEqual(ids(30));
  });

  it("sem lugares não há marcador", () => {
    expect(groupPlaces([], projecao(30), 44)).toEqual([]);
  });
});

describe("seleção no mapa", () => {
  const lugares = buildPlaces(
    colecao(
      ponto("a", "capital", CAPITAL),
      ponto("a", "distante", DISTANTE),
      ponto("b", "capital", CAPITAL),
      ponto("c", "vizinha", VIZINHA),
    ),
  );

  it("o acontecimento de dois lugares destaca os dois marcadores", () => {
    const grupos = groupPlaces(lugares, projecao(30), 44);
    expect(groupsOfEvent(grupos, "slug-a").map((grupo) => grupo.id)).toEqual(["capital", "distante"]);
    expect(placesOfEvent(lugares, "slug-a").map((lugar) => lugar.placeId)).toEqual([
      "capital",
      "distante",
    ]);
  });

  it("quando os lugares estão no mesmo marcador, o destaque é um só", () => {
    const grupos = groupPlaces(lugares, projecao(0.5), 44);
    expect(groupsOfEvent(grupos, "slug-a")).toHaveLength(1);
  });

  it("sem seleção, ou com acontecimento fora do recorte, nada é destacado", () => {
    const grupos = groupPlaces(lugares, projecao(30), 44);
    expect(groupsOfEvent(grupos, null)).toEqual([]);
    expect(groupsOfEvent(grupos, "slug-que-nao-esta-no-mapa")).toEqual([]);
    expect(placesOfEvent(lugares, null)).toEqual([]);
  });
});

describe("recorte e mapa mostram os mesmos acontecimentos", () => {
  it("os acontecimentos dos marcadores são os do recorte que têm lugar", () => {
    const recorte = data.conjunto.acontecimentos.filter((item) => item.categoria !== "eleicoes");
    const pontos = filterPoints(data.pontos, recorte);
    const noMapa = distinctEvents(buildPlaces(pontos)).map((evento) => evento.eventId);
    const comLugar = recorte
      .filter((item) => item.localizacao.tipo === "lugares")
      .map((item) => item.id);
    expect(noMapa).toEqual(comLugar);
  });
});

describe("lugares fora da área que a base cobre", () => {
  it("separa os que a câmera alcança dos que ficam fora, sem perder nenhum", () => {
    const lugares = buildPlaces(data.pontos);
    const { dentro, fora } = splitByArea(lugares, MAP_LIMITS.bounds);
    expect(fora.map((lugar) => lugar.placeId)).toEqual(["sintetico-lugar-exterior"]);
    expect(dentro.length + fora.length).toBe(lugares.length);
  });

  it("quem tem outro lugar dentro da área já está no mapa e não conta como sem ponto", () => {
    const EXTERIOR: Position = [2.3, 48.9];
    const lugares = buildPlaces(
      colecao(
        ponto("a", "capital", CAPITAL),
        ponto("a", "exterior", EXTERIOR),
        ponto("b", "exterior", EXTERIOR),
        ponto("c", "outro-exterior", [139.7, 35.7]),
        ponto("c", "capital", CAPITAL),
      ),
    );
    const { dentro, fora } = splitByArea(lugares, MAP_LIMITS.bounds);
    expect(fora.map((lugar) => lugar.placeId)).toEqual(["exterior", "outro-exterior"]);

    // Só `b` fica sem marcador nenhum. O lugar sem acontecimento a mostrar sai da lista.
    const semMarcador = withoutMarker(fora, dentro);
    expect(semMarcador.map((lugar) => lugar.placeId)).toEqual(["exterior"]);
    expect(distinctEvents(semMarcador).map((evento) => evento.eventId)).toEqual(["b"]);
    // Os lugares de origem não são alterados.
    expect(fora[0]!.events.map((evento) => evento.eventId)).toEqual(["a", "b"]);
  });

  it("sem nenhum lugar dentro da área, todos os de fora ficam sem marcador", () => {
    const lugares = buildPlaces(data.pontos);
    const { fora } = splitByArea(lugares, MAP_LIMITS.bounds);
    expect(withoutMarker(fora, [])).toEqual(fora);
  });

  it("a borda da área ainda é dentro", () => {
    const [oeste, sul] = MAP_LIMITS.bounds;
    const naBorda = buildPlaces(colecao(ponto("a", "borda", [oeste, sul])));
    expect(splitByArea(naBorda, MAP_LIMITS.bounds).dentro).toHaveLength(1);
  });
});

describe("textos do marcador", () => {
  const lugares = buildPlaces(
    colecao(
      ponto("a", "capital", CAPITAL, { lugarNome: "Capital" }),
      ponto("b", "vizinha", VIZINHA, { lugarNome: "Vizinha" }),
      ponto("c", "colada", COLADA, { lugarNome: "Colada" }),
    ),
  );

  it("um lugar leva o próprio nome; vários, a quantidade e os nomes", () => {
    const grupos = groupPlaces(lugares, projecao(30), 44);
    const capital = grupos.find((grupo) => grupo.id === "capital")!;
    const juntos = grupos.find((grupo) => grupo.id === "colada+vizinha")!;
    expect(groupLabel(capital)).toBe("Capital");
    expect(groupTitle(capital)).toBe("Capital");
    expect(groupLabel(juntos)).toBe("2 lugares");
    expect(groupTitle(juntos)).toBe("2 lugares próximos: Colada, Vizinha");
  });

  it("a quantidade é sempre dita em acontecimentos", () => {
    expect(countEvents(1)).toBe("1 acontecimento");
    expect(countEvents(4)).toBe("4 acontecimentos");
  });
});
