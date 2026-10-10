// Os capítulos do jogo contra o conteúdo real da edição: todo acontecimento
// citado existe e é do personagem, todo acontecimento do personagem está em
// um capítulo dele, as tarefas têm o que precisam (datas que decidem, opções
// que vêm dos registros), as cenas batem com os capítulos e tudo é alcançável
// a pé.

import { describe, expect, it } from "vitest";

import { readSources, resolvePaths } from "@/lib/content/sources";
import { lookup } from "@/lib/data/lookup";
import { findEventById, findPersonBySlug } from "@/lib/data/queries";
import { analyzeDate, compareDates, formatDate, yearOf } from "@/lib/domain/dates";
import { findUndeterminedOrder } from "@/lib/domain/order";
import { PROFILES } from "@/lib/domain/profiles";
import { CHAPTERS, chaptersOf, findChapter } from "@/lib/game/chapters";
import { buildGameContent, playableChapters } from "@/lib/game/content";
import { DISTRACTORS, correctOrder, datesDecideOrder, placeLabel, placeOptions, sourceOptions } from "@/lib/game/mission";
import { SCENES, getScene } from "@/lib/game/scenes";
import type { ChapterSpec, GameContent, SceneId, SceneSpec, TaskType } from "@/lib/game/types";
import { CELL, cellAt, isBlocked, neighbours, reachable, readMarkers } from "@/lib/game/world/grid";
import { initialPlayer } from "@/lib/game/world/movement";
import { buildAtlasData } from "@/lib/publication/build";

import { loadAtlasData } from "./helpers";

const data = buildAtlasData(readSources(resolvePaths())).data!;
const SLUGS = PROFILES.map((perfil) => perfil.slug);

const evento = (id: string) => {
  const acontecimento = findEventById(data, id);
  if (acontecimento === null) throw new Error(`Acontecimento ${id} não está na edição.`);
  return acontecimento;
};

const chave = (c: { x: number; y: number }) => `${c.x},${c.y}`;

/** Células de um caractere do mapa. */
function cellsOf(scene: SceneSpec, caractere: string): string[] {
  const celulas: string[] = [];
  scene.mapa.forEach((linha, y) => {
    for (let x = 0; x < linha.length; x += 1) if (linha[x] === caractere) celulas.push(chave({ x, y }));
  });
  return celulas.sort();
}

describe("capítulos da edição", () => {
  it("cada personagem tem pelo menos cinco capítulos, numerados de 1 em sequência", () => {
    for (const slug of SLUGS) {
      const capitulos = chaptersOf(slug);
      expect(capitulos.length, slug).toBeGreaterThanOrEqual(5);
      expect(capitulos.map((capitulo) => capitulo.numero), slug).toEqual(capitulos.map((_, indice) => indice + 1));
      for (const capitulo of capitulos) expect(capitulo.personagem).toBe(slug);
    }
  });

  it("os identificadores são únicos, cada um encontrado por findChapter, e todos são de um perfil da edição", () => {
    const ids = CHAPTERS.map((capitulo) => capitulo.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const capitulo of CHAPTERS) {
      expect(findChapter(capitulo.id)).toBe(capitulo);
      expect(SLUGS, capitulo.id).toContain(capitulo.personagem);
    }
    expect(findChapter("capitulo-que-nao-existe")).toBeNull();
    expect(SLUGS.flatMap((slug) => chaptersOf(slug)).length).toBe(CHAPTERS.length);
  });

  it("todo acontecimento citado existe no conjunto publicado e tem o personagem em pessoaIds", () => {
    for (const capitulo of CHAPTERS) {
      const pessoa = findPersonBySlug(data, capitulo.personagem);
      expect(pessoa, capitulo.id).not.toBeNull();
      expect(new Set(capitulo.eventIds).size, capitulo.id).toBe(capitulo.eventIds.length);
      for (const eventId of capitulo.eventIds) {
        const acontecimento = findEventById(data, eventId);
        expect(acontecimento, `${capitulo.id} cita ${eventId}`).not.toBeNull();
        expect(acontecimento!.pessoaIds, `${capitulo.id} cita ${eventId}`).toContain(pessoa!.id);
      }
    }
  });

  it("todo acontecimento publicado de cada personagem está em um capítulo dele: a cobertura é completa", () => {
    for (const slug of SLUGS) {
      const pessoa = findPersonBySlug(data, slug)!;
      const publicados = data.conjunto.acontecimentos.filter((item) => item.pessoaIds.includes(pessoa.id)).map((item) => item.id);
      const emCapitulos = chaptersOf(slug).flatMap((capitulo) => capitulo.eventIds);
      expect([...emCapitulos].sort(), slug).toEqual([...publicados].sort());
    }
  });

  it("o período do capítulo é o dos anos dos seus acontecimentos", () => {
    for (const capitulo of CHAPTERS) {
      const anos = capitulo.eventIds.map((id) => yearOf(evento(id).data));
      expect(capitulo.periodo.de, capitulo.id).toBe(Math.min(...anos));
      expect(capitulo.periodo.ate, capitulo.id).toBe(Math.max(...anos));
    }
  });

  it("passar de um capítulo ao seguinte nunca sugere uma ordem que as datas não decidem", () => {
    // Todo registro de um capítulo é anterior, sem ambiguidade, a todo registro
    // do capítulo seguinte: pela data e pela precisão, e não pelo ano. Dois
    // capítulos podem dividir um ano quando as datas, com dia, decidem; um par
    // de mesmo ano com um deles só no ano fica no mesmo capítulo.
    let fronteirasNoMesmoAno = 0;
    for (const slug of SLUGS) {
      const capitulos = chaptersOf(slug);
      for (let i = 1; i < capitulos.length; i += 1) {
        const anterior = capitulos[i - 1]!;
        const seguinte = capitulos[i]!;
        expect(seguinte.periodo.de, `${slug} capítulo ${i + 1}`).toBeGreaterThanOrEqual(anterior.periodo.ate);
        if (seguinte.periodo.de === anterior.periodo.ate) fronteirasNoMesmoAno += 1;
        for (const antes of anterior.eventIds) {
          for (const depois of seguinte.eventIds) {
            const onde = `${antes} (capítulo ${anterior.numero}) e ${depois} (capítulo ${seguinte.numero})`;
            expect(datesDecideOrder(evento(antes).data, evento(depois).data), onde).toBe(true);
            expect(compareDates(evento(antes).data, evento(depois).data), onde).toBeLessThan(0);
          }
        }
      }
    }
    // Na edição atual a fronteira dentro de um ano existe: a comissão de fevereiro de 2025 e a indicação de dezembro de 2025.
    expect(fronteirasNoMesmoAno).toBeGreaterThan(0);
  });

  it("nenhum acontecimento aparece em dois capítulos do mesmo personagem; o compartilhado aparece uma vez para cada", () => {
    for (const slug of SLUGS) {
      const todos = chaptersOf(slug).flatMap((capitulo) => capitulo.eventIds);
      expect(new Set(todos).size, slug).toBe(todos.length);
    }
    const compartilhados = data.conjunto.acontecimentos.filter((item) => item.pessoaIds.length > 1).map((item) => item.id);
    expect(compartilhados).toContain("eleicao-2026-primeiro-turno");
    for (const id of compartilhados) {
      const onde = CHAPTERS.filter((capitulo) => capitulo.eventIds.includes(id));
      expect(onde.map((capitulo) => capitulo.personagem).sort(), id).toEqual([...SLUGS].sort());
    }
  });

  it("a tarefa de registro cita um acontecimento do capítulo", () => {
    const deRegistro = CHAPTERS.filter((capitulo) => capitulo.tarefa.tipo === "registro");
    expect(deRegistro.length).toBeGreaterThan(0);
    for (const capitulo of deRegistro) {
      if (capitulo.tarefa.tipo !== "registro") continue;
      expect(capitulo.eventIds, capitulo.id).toContain(capitulo.tarefa.eventId);
    }
  });

  it("a tarefa de ordem cita dois acontecimentos do capítulo cujas datas decidem a ordem", () => {
    const deOrdem = CHAPTERS.filter((capitulo) => capitulo.tarefa.tipo === "ordem");
    expect(deOrdem.length).toBeGreaterThan(0);
    for (const capitulo of deOrdem) {
      if (capitulo.tarefa.tipo !== "ordem") continue;
      const [a, b] = capitulo.tarefa.eventIds;
      expect(a, capitulo.id).not.toBe(b);
      expect(capitulo.eventIds, capitulo.id).toContain(a);
      expect(capitulo.eventIds, capitulo.id).toContain(b);
      expect(datesDecideOrder(evento(a).data, evento(b).data), capitulo.id).toBe(true);
    }
  });

  it("as tarefas de documento e de lugar citam um acontecimento do capítulo", () => {
    for (const capitulo of CHAPTERS) {
      if (capitulo.tarefa.tipo !== "fonte" && capitulo.tarefa.tipo !== "lugar") continue;
      expect(capitulo.eventIds, capitulo.id).toContain(capitulo.tarefa.eventId);
    }
  });

  it("cada personagem tem pelo menos três tipos de tarefa, distribuídos, e os quatro tipos aparecem no jogo", () => {
    const todos = new Set<TaskType>();
    for (const slug of SLUGS) {
      const tipos = chaptersOf(slug).map((capitulo) => capitulo.tarefa.tipo);
      expect(new Set(tipos).size, slug).toBeGreaterThanOrEqual(3);
      // Distribuídos: nenhum tipo em dois capítulos seguidos.
      for (let i = 1; i < tipos.length; i += 1) expect(tipos[i], `${slug} capítulos ${i} e ${i + 1}`).not.toBe(tipos[i - 1]);
      tipos.forEach((tipo) => todos.add(tipo));
    }
    expect([...todos].sort()).toEqual(["fonte", "lugar", "ordem", "registro"]);
  });

  it("cada capítulo tem a época da figura, e as épocas seguem a ordem dos capítulos", () => {
    const ordem = { inicio: 0, meio: 1, atual: 2 };
    for (const slug of SLUGS) {
      const epocas = chaptersOf(slug).map((capitulo) => ordem[capitulo.epoca]);
      for (let i = 1; i < epocas.length; i += 1) expect(epocas[i]!, `${slug} capítulo ${i + 1}`).toBeGreaterThanOrEqual(epocas[i - 1]!);
    }
  });
});

describe("cenas dos capítulos", () => {
  const cenas = Object.values(SCENES);

  it("cada cena é usada por um capítulo, e cada capítulo tem a sua", () => {
    const usadas = new Set(CHAPTERS.map((capitulo) => capitulo.cena));
    expect([...usadas].sort()).toEqual((Object.keys(SCENES) as SceneId[]).sort());
    expect(usadas.size).toBe(CHAPTERS.length);
    for (const capitulo of CHAPTERS) expect(getScene(capitulo.cena).id).toBe(capitulo.cena);
  });

  it("o mapa tem as dimensões declaradas e é fechado por paredes, com a saída na borda do lado dito", () => {
    for (const scene of cenas) {
      expect(scene.mapa.length, scene.id).toBe(scene.altura);
      for (const linha of scene.mapa) expect(linha.length, scene.id).toBe(scene.largura);
      for (let y = 0; y < scene.altura; y += 1) {
        for (let x = 0; x < scene.largura; x += 1) {
          const borda = x === 0 || y === 0 || x === scene.largura - 1 || y === scene.altura - 1;
          const celula = cellAt(scene, x, y);
          if (borda) expect([CELL.parede, CELL.saida], `${scene.id} (${x},${y})`).toContain(celula);
          else expect(celula, `${scene.id} (${x},${y})`).not.toBe(CELL.parede);
        }
      }
      const { x, y, lado } = scene.saida;
      const esperado = { norte: y === 0, sul: y === scene.altura - 1, leste: x === scene.largura - 1, oeste: x === 0 }[lado];
      expect(esperado, `${scene.id} saída ${lado}`).toBe(true);
    }
  });

  it("a cena de cada capítulo tem tantas posições de registro quantos acontecimentos", () => {
    for (const capitulo of CHAPTERS) {
      expect(getScene(capitulo.cena).registros.length, capitulo.id).toBe(capitulo.eventIds.length);
    }
  });

  it("os marcadores do mapa batem com início, guia, saída e registros da cena", () => {
    for (const scene of cenas) {
      const marcadores = readMarkers(scene);
      expect(marcadores.spawn, scene.id).toEqual(scene.spawn);
      expect(marcadores.guia, scene.id).toEqual(scene.guia);
      expect(marcadores.saida, scene.id).toEqual({ x: scene.saida.x, y: scene.saida.y });
      expect(marcadores.registros, scene.id).toEqual(scene.registros);
      // Um registro por dígito, sem repetição.
      expect(cellsOf(scene, CELL.spawn), scene.id).toHaveLength(1);
      expect(cellsOf(scene, CELL.guia), scene.id).toHaveLength(1);
      expect(cellsOf(scene, CELL.saida), scene.id).toHaveLength(1);
      for (let n = 1; n <= scene.registros.length; n += 1) expect(cellsOf(scene, String(n)), `${scene.id} registro ${n}`).toHaveLength(1);
    }
  });

  it("toda célula 'o' tem um elemento que bloqueia, e todo elemento que bloqueia está numa célula 'o'", () => {
    for (const scene of cenas) {
      const bloqueiam = scene.props.filter((prop) => prop.tipo !== "decoracao").map(chave);
      expect(new Set(bloqueiam).size, scene.id).toBe(bloqueiam.length);
      expect(bloqueiam.sort(), scene.id).toEqual(cellsOf(scene, CELL.prop));
      for (const prop of scene.props.filter((item) => item.tipo === "decoracao")) {
        expect(cellAt(scene, prop.x, prop.y), `${scene.id} decoração (${prop.x},${prop.y})`).toBe(CELL.chao);
      }
    }
  });

  it("tapetes ficam em células que não bloqueiam", () => {
    for (const scene of cenas) {
      for (const tapete of scene.tapetes) {
        expect(isBlocked(scene, tapete.x, tapete.y, true), `${scene.id} tapete (${tapete.x},${tapete.y})`).toBe(false);
      }
    }
  });

  it("o personagem nasce em chão livre, com folga para o corpo", () => {
    for (const scene of cenas) {
      const { x, y } = initialPlayer(scene);
      for (const [ox, oy] of [
        [-0.28, -0.28],
        [0.28, -0.28],
        [-0.28, 0.28],
        [0.28, 0.28],
      ] as const) {
        expect(isBlocked(scene, x + ox, y + oy, false), scene.id).toBe(false);
      }
    }
  });

  it("a partir do início, com a saída fechada, todo registro e a vizinhança do guia são alcançáveis", () => {
    for (const scene of cenas) {
      const alcance = reachable(scene, scene.spawn);
      for (const registro of scene.registros) expect(alcance.has(chave(registro)), `${scene.id} registro ${chave(registro)}`).toBe(true);
      expect(neighbours(scene.guia).some((vizinha) => alcance.has(chave(vizinha))), `${scene.id} guia`).toBe(true);
      expect(alcance.has(chave(scene.saida)), `${scene.id} saída fechada`).toBe(false);
    }
  });

  it("com a saída aberta, a célula da saída é alcançável", () => {
    for (const scene of cenas) {
      expect(reachable(scene, scene.spawn, true).has(chave(scene.saida)), scene.id).toBe(true);
    }
  });

  it("nenhum registro fica na célula vizinha da saída, onde a porta o esconderia", () => {
    for (const scene of cenas) {
      for (const registro of scene.registros) {
        expect(Math.abs(registro.x - scene.saida.x) + Math.abs(registro.y - scene.saida.y), `${scene.id} registro ${chave(registro)}`).toBeGreaterThan(1);
      }
    }
  });
});

describe("conteúdo do jogo", () => {
  const conteudos = SLUGS.map((slug) => [slug, buildGameContent(data, slug)] as const);

  it("buildGameContent devolve o personagem, os capítulos e um registro por acontecimento citado", () => {
    for (const [slug, content] of conteudos) {
      expect(content, slug).not.toBeNull();
      expect(content!.personagem).toEqual({ slug, nome: findPersonBySlug(data, slug)!.nome });
      expect(content!.capitulos).toEqual(chaptersOf(slug));
      const citados = new Set(content!.capitulos.flatMap((capitulo) => capitulo.eventIds));
      expect(Object.keys(content!.registros).sort()).toEqual([...citados].sort());
    }
  });

  it("todo registro tem título, data válida, resumo, contexto, lugar e fontes resolvidas, com endereço seguro e o que cada uma sustenta", () => {
    for (const [slug, content] of conteudos) {
      for (const registro of Object.values(content!.registros)) {
        const onde = `${slug} ${registro.id}`;
        expect(registro.slug.length, onde).toBeGreaterThan(0);
        expect(registro.titulo.length, onde).toBeGreaterThan(0);
        expect(registro.resumo.length, onde).toBeGreaterThan(0);
        expect(registro.contexto.length, onde).toBeGreaterThan(0);
        expect(analyzeDate(registro.data).ok, onde).toBe(true);
        expect(["lugares", "nacional", "desconhecida"], onde).toContain(registro.localizacao.tipo);
        if (registro.localizacao.tipo === "lugares") expect(registro.localizacao.lugares.length, onde).toBeGreaterThan(0);
        expect(placeLabel(registro).length, onde).toBeGreaterThan(0);
        expect(registro.fontes.length, onde).toBeGreaterThan(0);
        for (const fonte of registro.fontes) {
          expect(fonte.id.length, onde).toBeGreaterThan(0);
          expect(fonte.titulo.length, onde).toBeGreaterThan(0);
          expect(fonte.autoria.length, onde).toBeGreaterThan(0);
          expect(fonte.evidencia.length, onde).toBeGreaterThan(0);
          // Onde está o trecho e quando a fonte foi lida: o que permite conferir sem sair do jogo.
          expect(fonte.localizacao.length, onde).toBeGreaterThan(0);
          expect(fonte.acessadoEm, onde).toMatch(/^\d{4}-\d{2}-\d{2}$/);
          expect(["data", "desconhecida"], onde).toContain(fonte.dataDocumento.tipo);
          expect(fonte.url, onde).toMatch(/^https:\/\//);
        }
      }
    }
  });

  it("a ficha do registro é a mesma do atlas, sem texto editorial duplicado no jogo", () => {
    for (const [, content] of conteudos) {
      for (const registro of Object.values(content!.registros)) {
        const acontecimento = evento(registro.id);
        expect(registro).toMatchObject({
          slug: acontecimento.slug,
          titulo: acontecimento.titulo,
          data: acontecimento.data,
          categoria: acontecimento.categoria,
          resumo: acontecimento.resumo,
          contexto: acontecimento.contexto,
        });
        // As fontes são as do acontecimento, uma a uma e na ordem, com onde
        // está o trecho e o que cada citação sustenta: é o que diz qual
        // documento sustenta qual registro, e onde conferir.
        expect(registro.fontes).toEqual(
          acontecimento.fontes.map((citacao) => {
            const fonte = data.conjunto.fontes.find((item) => item.id === citacao.fonteId)!;
            return {
              id: fonte.id,
              titulo: fonte.titulo,
              autoria: fonte.autoria,
              url: fonte.url,
              dataDocumento: fonte.dataDocumento,
              acessadoEm: fonte.acessadoEm,
              localizacao: citacao.localizacao,
              evidencia: citacao.evidencia,
            };
          }),
        );
        // O lugar é o documentado, com os nomes da edição.
        if (acontecimento.localizacao.tipo === "lugares") {
          const nomes = acontecimento.localizacao.lugarIds.map((id) => data.conjunto.lugares[lookup(data.indices.lugares.porId, id)!]!.nome);
          expect(registro.localizacao).toEqual({ tipo: "lugares", lugares: nomes });
        } else expect(registro.localizacao).toEqual({ tipo: acontecimento.localizacao.tipo });
      }
    }
  });

  it("a ordem correta das tarefas de ordem é a cronológica dos registros", () => {
    for (const [, content] of conteudos) {
      for (const capitulo of content!.capitulos) {
        if (capitulo.tarefa.tipo !== "ordem") continue;
        const [antes, depois] = correctOrder(capitulo.tarefa, content!.registros);
        expect(compareDates(content!.registros[antes]!.data, content!.registros[depois]!.data), capitulo.id).toBeLessThan(0);
      }
    }
  });

  it("a tarefa de documento tem a opção certa e pelo menos duas erradas, todas documentos de registros do capítulo", () => {
    for (const [, content] of conteudos) {
      for (const capitulo of content!.capitulos) {
        if (capitulo.tarefa.tipo !== "fonte") continue;
        const pedido = content!.registros[capitulo.tarefa.eventId]!;
        const opcoes = sourceOptions(capitulo, content!.registros, capitulo.tarefa.eventId);
        expect(opcoes.length, capitulo.id).toBe(1 + DISTRACTORS);
        const citadas = new Set(pedido.fontes.map((fonte) => fonte.id));
        const certas = opcoes.filter((opcao) => citadas.has(opcao.id));
        expect(certas.length, capitulo.id).toBe(1);
        expect(certas[0]!.id, capitulo.id).toBe(pedido.fontes[0]!.id);
        const doCapitulo = new Set(capitulo.eventIds.flatMap((id) => content!.registros[id]!.fontes.map((fonte) => fonte.id)));
        for (const opcao of opcoes) {
          expect(doCapitulo.has(opcao.id), `${capitulo.id}: ${opcao.id}`).toBe(true);
          expect(opcao.rotulo.length, capitulo.id).toBeGreaterThan(0);
          expect(opcao.detalhe.length, capitulo.id).toBeGreaterThan(0);
        }
      }
    }
  });

  it("a tarefa de lugar tem a opção certa e pelo menos duas erradas, todas lugares documentados na trajetória", () => {
    for (const [, content] of conteudos) {
      for (const capitulo of content!.capitulos) {
        if (capitulo.tarefa.tipo !== "lugar") continue;
        const pedido = content!.registros[capitulo.tarefa.eventId]!;
        expect(pedido.localizacao.tipo, capitulo.id).toBe("lugares");
        const opcoes = placeOptions(content!.capitulos, content!.registros, capitulo.tarefa.eventId);
        expect(opcoes.length, capitulo.id).toBe(1 + DISTRACTORS);
        expect(opcoes.filter((opcao) => opcao.id === placeLabel(pedido)).length, capitulo.id).toBe(1);
        const daTrajetoria = new Set(Object.values(content!.registros).map(placeLabel));
        for (const opcao of opcoes) expect(daTrajetoria.has(opcao.id), `${capitulo.id}: ${opcao.id}`).toBe(true);
      }
    }
  });

  it("o registro cuja data não decide a ordem em relação a outro leva a marca, como na lista do atlas", () => {
    let marcados = 0;
    for (const [slug, content] of conteudos) {
      const registros = Object.values(content!.registros);
      const emAberto = findUndeterminedOrder(registros);
      for (const registro of registros) {
        expect(registro.ordemEmAberto, `${slug} ${registro.id}`).toBe(emAberto.has(registro.id));
        if (registro.ordemEmAberto) marcados += 1;
      }
      // Dentro de um capítulo, um par que as datas não decidem tem pelo menos um dos dois marcado.
      for (const capitulo of content!.capitulos) {
        for (const a of capitulo.eventIds) {
          for (const b of capitulo.eventIds) {
            if (a >= b) continue;
            const ra = content!.registros[a]!;
            const rb = content!.registros[b]!;
            if (!datesDecideOrder(ra.data, rb.data)) expect(ra.ordemEmAberto || rb.ordemEmAberto, `${a} e ${b}`).toBe(true);
          }
        }
      }
    }
    // Na edição atual o caso existe: a prisão de 1980, só com o ano, e a fundação do PT, de 10 de fevereiro de 1980.
    expect(marcados).toBeGreaterThan(0);
    const lula = conteudos.find(([slug]) => slug === "lula")![1]!;
    expect(lula.registros["lula-1980-prisao-pela-lei-de-seguranca-nacional"]?.ordemEmAberto).toBe(true);
    expect(lula.registros["lula-1980-fundacao-do-pt"]?.ordemEmAberto).toBe(false);
  });

  it("todo registro leva a situação da revisão, sem as observações internas e sem dizer que é humana", () => {
    for (const [slug, content] of conteudos) {
      for (const registro of Object.values(content!.registros)) {
        const onde = `${slug} ${registro.id}`;
        const original = evento(registro.id).editorial;
        expect(registro.editorial.estado, onde).toBe(original.estado);
        if (registro.editorial.estado !== "revisado" || original.estado !== "revisado") continue;
        expect(registro.editorial.revisao, onde).toEqual({
          tipo: original.revisao.tipo,
          revisadoPor: original.revisao.revisadoPor,
          revisadoEm: original.revisao.revisadoEm,
        });
        expect(registro.editorial.revisao.tipo, onde).toBe("assistida-por-ia");
      }
    }
  });

  it("o registro do primeiro turno de 2026 fala em apuração parcial, e nenhum texto do jogo o chama de resultado definitivo", () => {
    const registro = conteudos[0]![1]!.registros["eleicao-2026-primeiro-turno"] ?? conteudos[1]![1]!.registros["eleicao-2026-primeiro-turno"];
    expect(registro).toBeDefined();
    expect(registro!.resumo).toMatch(/99,99% das urnas apuradas/);
    for (const capitulo of CHAPTERS.filter((item) => item.eventIds.includes("eleicao-2026-primeiro-turno"))) {
      expect(capitulo.motivo).toContain("apuração parcial");
      expect(`${capitulo.titulo} ${capitulo.motivo} ${capitulo.objetivo}`).not.toMatch(/resultado (final|definitivo)|totalização final|segundo turno (venc|ganh)/i);
    }
  });

  it("playableChapters devolve todos os capítulos", () => {
    for (const [slug, content] of conteudos) expect(playableChapters(content!), slug).toEqual(content!.capitulos);
  });

  it("playableChapters tira o capítulo cujo registro falta", () => {
    const [, content] = conteudos[0]!;
    const [primeiro, ...resto] = content!.capitulos as [ChapterSpec, ...ChapterSpec[]];
    const registros = { ...content!.registros };
    delete registros[primeiro.eventIds[0]!];
    const semUm: GameContent = { ...content!, registros };
    expect(playableChapters(semUm)).toEqual(resto);
  });

  it("sem o personagem nos dados, não há conteúdo", () => {
    // As fixtures sintéticas não têm nenhum dos perfis da edição.
    for (const slug of SLUGS) expect(buildGameContent(loadAtlasData(), slug)).toBeNull();
  });
});

describe("textos dos capítulos", () => {
  const textos = CHAPTERS.flatMap((capitulo) =>
    (["titulo", "motivo", "objetivo"] as const).map((campo) => ({ onde: `${capitulo.id} ${campo}`, texto: capitulo[campo] })),
  );

  it("título, motivo e objetivo existem", () => {
    for (const { onde, texto } of textos) expect(texto.trim().length, onde).toBeGreaterThan(0);
  });

  it("nenhum texto atribui fala a alguém: sem aspas de citação e sem verbos de fala", () => {
    for (const { onde, texto } of textos) {
      expect(texto, onde).not.toMatch(/["“”«»]/);
      expect(texto, onde).not.toMatch(/\b(disse|afirmou|declarou|falou|segundo ele|segundo ela)\b/i);
    }
  });

  it("nenhum texto decide culpa nem equipara denúncia, condenação, anulação e absolvição", () => {
    for (const { onde, texto } of textos) {
      expect(texto, onde).not.toMatch(/\b(culpado|culpada|inocente|absolvido|absolvida|criminoso|criminosa|corrupto|corrupta)\b/i);
    }
  });

  it("os anos, as datas e as contagens escritos nos textos são os dos registros do capítulo", () => {
    // Os textos são escritos à mão. Se uma data do conteúdo for corrigida, o
    // texto do capítulo não pode continuar afirmando a antiga.
    const NUMERAIS: Record<string, number> = { Dois: 2, Três: 3, Quatro: 4, Cinco: 5, Seis: 6, Sete: 7, Oito: 8, Nove: 9 };
    const MES = "janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro";
    for (const capitulo of CHAPTERS) {
      const eventos = capitulo.eventIds.map(evento);
      const anos = new Set(eventos.map((item) => yearOf(item.data)));
      const datas = eventos.map((item) => formatDate(item.data));

      for (const campo of ["titulo", "motivo", "objetivo"] as const) {
        const texto = capitulo[campo];
        const onde = `${capitulo.id} ${campo}`;
        // Todo ano escrito é o ano de um registro do capítulo.
        for (const ano of texto.match(/\b(?:1[89]|20)\d{2}\b/g) ?? []) expect(anos.has(Number(ano)), `${onde}: ${ano}`).toBe(true);
        // Toda data com dia é, por extenso, a data de um registro.
        const comDia = texto.match(new RegExp(`\\b\\d{1,2}º? de (?:${MES}) de \\d{4}\\b`, "g")) ?? [];
        for (const escrita of comDia) expect(datas, `${onde}: ${escrita}`).toContain(escrita);
        // Todo mês com ano, fora das datas com dia, é o mês de um registro.
        const semDia = comDia.reduce((resto, escrita) => resto.replace(escrita, ""), texto);
        for (const escrita of semDia.match(new RegExp(`\\b(?:${MES}) de \\d{4}\\b`, "g")) ?? []) {
          expect(datas.some((item) => item === escrita || item.endsWith(` de ${escrita}`)), `${onde}: ${escrita}`).toBe(true);
        }
      }

      // O motivo abre com a quantidade de registros do capítulo.
      const numeral = capitulo.motivo.match(/^(\S+) registros\b/)?.[1];
      expect(numeral, `${capitulo.id}: o motivo começa pela quantidade de registros`).toBeDefined();
      expect(NUMERAIS[numeral!], `${capitulo.id}: ${numeral} registros`).toBe(capitulo.eventIds.length);
    }
  });

  it("o objetivo fala com o jogador, diz a tarefa e termina em ponto", () => {
    for (const capitulo of CHAPTERS) {
      expect(capitulo.objetivo, capitulo.id).toMatch(/^(Encontre|Recolha)\b/);
      expect(capitulo.objetivo, capitulo.id).toMatch(/\.$/);
      if (capitulo.tarefa.tipo === "ordem") expect(capitulo.objetivo, capitulo.id).toMatch(/em ordem/);
      if (capitulo.tarefa.tipo === "fonte") expect(capitulo.objetivo, capitulo.id).toMatch(/documento/);
      if (capitulo.tarefa.tipo === "lugar") expect(capitulo.objetivo, capitulo.id).toMatch(/lugar/);
    }
  });
});
