// Fase 6: o mapa sincronizado com a lista, a linha do tempo, os filtros, o
// painel e o endereço. Os marcadores são elementos da página, e por isso os
// testes leem o que o mapa mostra direto do documento. Os valores esperados
// saem dos arquivos gerados, para o teste acompanhar o conteúdo.

import { readFileSync } from "node:fs";

import { expect, test, type Locator, type Page } from "@playwright/test";

import { MAP_PACKAGE } from "./map-package";

interface EventRecord {
  id: string;
  slug: string;
  titulo: string;
  categoria: string;
  pessoaIds: string[];
  data: { valor: string; precisao: "ano" | "mes" | "dia" };
  localizacao: { tipo: "lugares"; lugarIds: string[] } | { tipo: "nacional" | "desconhecida" };
}

const conjunto = JSON.parse(readFileSync("generated/dados/conjunto.json", "utf8")) as {
  acontecimentos: EventRecord[];
  pessoas: { id: string; slug: string; nome: string }[];
  lugares: { id: string; nome: string; precisaoGeografica: string }[];
};

const lula = conjunto.pessoas.find((pessoa) => pessoa.slug === "lula")!;
const flavio = conjunto.pessoas.find((pessoa) => pessoa.slug === "flavio-bolsonaro")!;
const yearOf = (item: EventRecord) => Number(item.data.valor.slice(0, 4));
const eventosDe = (pessoaId: string) =>
  conjunto.acontecimentos.filter((item) => item.pessoaIds.includes(pessoaId));
const deLula = eventosDe(lula.id);
const deFlavio = eventosDe(flavio.id);
const lugaresDe = (item: EventRecord) =>
  item.localizacao.tipo === "lugares" ? item.localizacao.lugarIds : [];
const comLugar = (itens: EventRecord[]) => itens.filter((item) => lugaresDe(item).length > 0);
const semLugar = (itens: EventRecord[]) => itens.filter((item) => lugaresDe(item).length === 0);
const nomeDoLugar = (id: string) => conjunto.lugares.find((lugar) => lugar.id === id)!.nome;
const noRecorte = (itens: EventRecord[], de: number, ate: number, categorias: string[] = []) =>
  itens.filter(
    (item) =>
      yearOf(item) >= de &&
      yearOf(item) <= ate &&
      (categorias.length === 0 || categorias.includes(item.categoria)),
  );

/** Lugar de Lula com mais acontecimentos, e um com um só: os dois tipos de marcador. */
function lugarComVarios(itens: EventRecord[]) {
  const porLugar = new Map<string, EventRecord[]>();
  for (const item of itens) {
    for (const lugar of lugaresDe(item)) porLugar.set(lugar, [...(porLugar.get(lugar) ?? []), item]);
  }
  const [id, eventos] = [...porLugar.entries()].sort((a, b) => b[1].length - a[1].length)[0]!;
  return { id, eventos };
}
const cheio = lugarComVarios(deLula);
/** Acontecimento com dois lugares, se o conteúdo tiver. */
const comDoisLugares = deLula.find((item) => lugaresDe(item).length > 1);
const nacional = deLula.find((item) => item.localizacao.tipo === "nacional")!;

const LULA = "/politicos/lula/";
const FLAVIO = "/politicos/flavio-bolsonaro/";
const CELULAR = { width: 390, height: 844 };

const lista = (page: Page) => page.getByRole("region", { name: "Acontecimentos", exact: true });
const item = (page: Page, slug: string) => page.locator(`#item-${slug}`);
const leitura = (page: Page) => page.getByRole("region", { name: "Leitura" });
const mapa = (page: Page) => page.getByRole("region", { name: "Mapa", exact: true });
const recorte = (page: Page) => page.getByRole("region", { name: "Recorte" });
const canvas = (page: Page) => page.locator(".maplibregl-canvas");
const marcadores = (page: Page) => mapa(page).locator("[data-marker]");
/** O marcador em que um acontecimento aparece (ou os marcadores, se tem mais de um lugar). */
const marcadoresDe = (page: Page, slug: string) => mapa(page).locator(`[data-marker][data-events~="${slug}"]`);
const marcadorDoLugar = (page: Page, lugarId: string) =>
  mapa(page).locator(`[data-marker="${lugarId}"], [data-marker^="${lugarId}+"], [data-marker*="+${lugarId}"]`);
const seletor = (page: Page) => mapa(page).locator("[data-chooser]");
const semPonto = (page: Page) => mapa(page).getByRole("button", { name: /sem ponto no mapa/ });
const marca = (page: Page, slug: string) => page.locator(`button[data-mark][data-slug="${slug}"]`);
const controle = (page: Page, nome: string) =>
  page.getByRole("group", { name: "Controles do mapa" }).getByRole("button", { name: nome });

const endereco = (page: Page) => {
  const url = new URL(page.url());
  return url.pathname + url.search;
};
const expectUrl = (page: Page, esperado: string) =>
  expect.poll(() => endereco(page), { message: "endereço" }).toBe(esperado);

async function waitForMap(page: Page) {
  await expect(canvas(page).first()).toBeVisible();
  await expect(page.getByText("Carregando o mapa…")).toBeHidden();
  await expect(marcadores(page).first()).toBeVisible();
}

/** Os acontecimentos que o mapa mostra agora, lidos dos marcadores. */
async function eventosNoMapa(page: Page): Promise<string[]> {
  const listas = await marcadores(page).evaluateAll((nos) =>
    nos.map((no) => (no.getAttribute("data-events") ?? "").split(" ").filter(Boolean)),
  );
  return [...new Set(listas.flat())].sort();
}

const zoomDoMapa = async (page: Page) =>
  Number(await mapa(page).locator("[data-map-zoom]").getAttribute("data-map-zoom"));

/** Quantos pixels diferem entre duas capturas do mesmo tamanho, dentro de um retângulo. */
async function pixelsDiferentes(
  page: Page,
  uma: Buffer,
  outra: Buffer,
  area: { x: number; y: number; width: number; height: number },
): Promise<number> {
  return page.evaluate(
    async ({ uma, outra, area }) => {
      const ler = async (base64: string) => {
        const resposta = await fetch(`data:image/png;base64,${base64}`);
        const imagem = await createImageBitmap(await resposta.blob());
        const tela = new OffscreenCanvas(imagem.width, imagem.height);
        const contexto = tela.getContext("2d")!;
        contexto.drawImage(imagem, 0, 0);
        return contexto.getImageData(area.x, area.y, area.width, area.height).data;
      };
      const [a, b] = [await ler(uma), await ler(outra)];
      let diferentes = 0;
      for (let i = 0; i < a.length; i += 4) {
        if (a[i] !== b[i] || a[i + 1] !== b[i + 1] || a[i + 2] !== b[i + 2]) diferentes += 1;
      }
      return diferentes;
    },
    { uma: uma.toString("base64"), outra: outra.toString("base64"), area },
  );
}

/** Onde um marcador está na tela: muda se, e só se, a câmera se mexer. */
const posicao = async (alvo: Locator) => {
  const caixa = (await alvo.boundingBox())!;
  return { x: Math.round(caixa.x), y: Math.round(caixa.y) };
};

/**
 * A posição de um marcador depois que a câmera parou: duas leituras iguais,
 * separadas por um intervalo. O arraste termina com um salto de inércia, e o
 * marcador só o acompanha no desenho seguinte; uma leitura feita logo depois
 * de soltar o mouse pode vir antes dele (foi o que falhou no runner, por 5 px).
 */
async function posicaoEstavel(alvo: Locator) {
  // A afirmação de tipo evita que o compilador fixe `null`: a atribuição acontece dentro da função da espera.
  let anterior = null as { x: number; y: number } | null;
  await expect
    .poll(
      async () => {
        const atual = await posicao(alvo);
        const parou = anterior !== null && atual.x === anterior.x && atual.y === anterior.y;
        anterior = atual;
        return parou;
      },
      { intervals: [300, 300, 500, 1000] },
    )
    .toBe(true);
  return anterior!;
}

async function arrastarMapa(page: Page, dx: number, dy: number) {
  const caixa = (await canvas(page).boundingBox())!;
  // Um ponto do mar, longe dos marcadores e dos controles.
  const x = caixa.x + caixa.width * 0.82;
  const y = caixa.y + caixa.height * 0.72;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx / 2, y + dy / 2, { steps: 4 });
  await page.mouse.move(x + dx, y + dy, { steps: 4 });
  await page.mouse.up();
}

test.describe("recorte no mapa", () => {
  test("os filtros combinados mostram no mapa os mesmos acontecimentos da lista", async ({ page }) => {
    await page.goto(LULA);
    await waitForMap(page);

    const conferir = async (esperados: EventRecord[]) => {
      const slugs = comLugar(esperados).map((evento) => evento.slug).sort();
      await expect.poll(() => eventosNoMapa(page)).toEqual(slugs);
      await expect(lista(page).locator("li[data-acontecimento]")).toHaveCount(esperados.length);
      // O que não tem ponto continua contado, e acessível pelo próprio mapa.
      const fora = semLugar(esperados).length;
      if (fora > 0) await expect(semPonto(page)).toContainText(String(fora));
      else await expect(semPonto(page)).toHaveCount(0);
    };

    await conferir(deLula);

    await page.getByLabel("De", { exact: true }).selectOption("2016");
    await page.getByLabel("Até", { exact: true }).selectOption("2019");
    await conferir(noRecorte(deLula, 2016, 2019));

    await recorte(page).getByRole("button", { name: /^Marcos históricos/ }).click();
    await conferir(noRecorte(deLula, 2016, 2019, ["marcos-historicos"]));

    await recorte(page).getByRole("button", { name: /^Eleições/ }).click();
    await conferir(noRecorte(deLula, 2016, 2019, ["eleicoes", "marcos-historicos"]));

    await lista(page).getByRole("button", { name: "Limpar filtros" }).click();
    await conferir(deLula);
  });

  test("o número do marcador conta acontecimentos, e cada um aparece em todos os seus lugares", async ({ page }) => {
    await page.goto(LULA);
    await waitForMap(page);

    // Cada marcador diz quantos acontecimentos distintos tem.
    const contagens = await marcadores(page).evaluateAll((nos) =>
      nos.map((no) => ({
        eventos: (no.getAttribute("data-events") ?? "").split(" ").filter(Boolean).length,
        nome: no.getAttribute("aria-label") ?? "",
      })),
    );
    for (const { eventos, nome } of contagens) {
      if (eventos > 1) expect(nome).toContain(`${eventos} acontecimentos`);
    }

    test.skip(comDoisLugares === undefined, "Nenhum acontecimento tem mais de um lugar.");
    if (comDoisLugares === undefined) return;
    // Um acontecimento com dois lugares é um item na lista e aparece nos dois lugares do mapa.
    await expect(item(page, comDoisLugares.slug)).toHaveCount(1);
    for (const lugar of lugaresDe(comDoisLugares)) {
      await expect(marcadorDoLugar(page, lugar)).toHaveAttribute(
        "data-events",
        new RegExp(`(^| )${comDoisLugares.slug}( |$)`),
      );
    }
  });

  test("recorte sem ponto nenhum diz isso no mapa, e a lista continua", async ({ page }) => {
    const semNenhum = [...new Set(deFlavio.map(yearOf))].find(
      (ano) => noRecorte(deFlavio, ano, ano).length > 0 && comLugar(noRecorte(deFlavio, ano, ano)).length === 0,
    );
    test.skip(semNenhum === undefined, "Todo ano com registros tem algum ponto.");
    if (semNenhum === undefined) return;

    await page.goto(`${FLAVIO}?de=${semNenhum}&ate=${semNenhum}`);
    await expect(canvas(page).first()).toBeVisible();
    await expect(mapa(page)).toContainText("Nenhum acontecimento deste recorte tem ponto no mapa.");
    await expect(marcadores(page)).toHaveCount(0);
    const doAno = noRecorte(deFlavio, semNenhum, semNenhum);
    await expect(lista(page).locator("li[data-acontecimento]")).toHaveCount(doAno.length);
    await expect(semPonto(page)).toContainText(String(doAno.length));
  });

  test("mudar os filtros não recria o mapa", async ({ page }) => {
    await page.goto(LULA);
    await waitForMap(page);
    await canvas(page).evaluate((no) => {
      (window as unknown as { __canvas: Element }).__canvas = no;
    });

    await recorte(page).getByRole("button", { name: /^Eleições/ }).click();
    await page.getByLabel("De", { exact: true }).selectOption("2016");
    await item(page, noRecorte(deLula, 2016, 9999, ["eleicoes"])[0]!.slug).click();
    await lista(page).getByRole("button", { name: "Limpar filtros" }).click();
    await expect.poll(() => eventosNoMapa(page)).toEqual(comLugar(deLula).map((e) => e.slug).sort());

    const mesmo = await canvas(page).evaluate(
      (no) => (window as unknown as { __canvas: Element }).__canvas === no,
    );
    expect(mesmo).toBe(true);
    await expect(canvas(page)).toHaveCount(1);
  });
});

test.describe("seleção nos dois sentidos", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LULA);
    await waitForMap(page);
  });

  test("marcador de um acontecimento só: o clique seleciona e abre o painel", async ({ page }) => {
    const sozinho = marcadores(page).and(page.locator('[aria-pressed]')).first();
    const slug = (await sozinho.getAttribute("data-events"))!;
    const evento = deLula.find((e) => e.slug === slug)!;

    await sozinho.click();

    await expectUrl(page, `${LULA}?acontecimento=${slug}`);
    await expect(sozinho).toHaveAttribute("aria-pressed", "true");
    await expect(item(page, slug)).toHaveAttribute("aria-pressed", "true");
    await expect(marca(page, slug)).toHaveAttribute("aria-pressed", "true");
    await expect(leitura(page).getByRole("heading", { name: evento.titulo })).toBeVisible();
  });

  test("marcador com vários acontecimentos abre a lista deles, sem escolher nenhum", async ({ page }) => {
    const marcador = marcadorDoLugar(page, cheio.id);
    await marcador.click();

    // Nada foi selecionado em silêncio.
    expect(endereco(page)).toBe(LULA);
    await expect(leitura(page).getByRole("heading", { name: lula.nome, exact: true })).toBeVisible();
    await expect(marcador).toHaveAttribute("aria-expanded", "true");

    // A lista mostra o que distingue cada um: data, título e lugar.
    const painel = seletor(page);
    await expect(painel).toBeVisible();
    await expect(painel).toContainText(nomeDoLugar(cheio.id));
    await expect(painel).toContainText("aproximação");
    for (const evento of cheio.eventos) {
      const opcao = painel.locator(`button[data-slug="${evento.slug}"]`);
      await expect(opcao).toContainText(evento.titulo);
      await expect(opcao.locator("time")).toHaveAttribute("datetime", evento.data.valor);
    }

    // Escolher um deles seleciona, fecha a lista e marca o lugar.
    const escolhido = cheio.eventos[1]!;
    await painel.locator(`button[data-slug="${escolhido.slug}"]`).click();
    await expectUrl(page, `${LULA}?acontecimento=${escolhido.slug}`);
    await expect(painel).toBeHidden();
    await expect(marcador).toHaveAttribute("data-selected", "");
    await expect(marcador).toBeFocused();
    await expect(item(page, escolhido.slug)).toHaveAttribute("aria-pressed", "true");
    await expect(leitura(page).getByRole("heading", { name: escolhido.titulo })).toBeVisible();

    // Reaberta, a lista diz qual está aberto.
    await marcador.click();
    await expect(seletor(page).locator(`button[data-slug="${escolhido.slug}"]`)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("selecionar pela lista ou pela linha do tempo destaca todos os lugares do acontecimento", async ({ page }) => {
    const alvo = comDoisLugares ?? comLugar(deLula)[0]!;
    await item(page, alvo.slug).click();

    const destacados = mapa(page).locator("[data-marker][data-selected]");
    await expect(destacados).toHaveCount(await marcadoresDe(page, alvo.slug).count());
    for (const lugar of lugaresDe(alvo)) {
      await expect(marcadorDoLugar(page, lugar)).toHaveAttribute("data-selected", "");
    }
    // Só eles.
    await expect(mapa(page).locator(`[data-marker][data-selected]:not([data-events~="${alvo.slug}"])`)).toHaveCount(0);

    // Pela linha do tempo, o destaque acompanha.
    const outro = comLugar(deLula).find((evento) => lugaresDe(evento)[0] !== lugaresDe(alvo)[0])!;
    await marca(page, outro.slug).click();
    await expect(marcadoresDe(page, outro.slug).first()).toHaveAttribute("data-selected", "");
    await expect(mapa(page).locator("[data-marker][data-selected]")).toHaveCount(
      await marcadoresDe(page, outro.slug).count(),
    );
  });

  test("um filtro que tira o acontecimento do recorte limpa o destaque", async ({ page }) => {
    const alvo = comLugar(deLula).find((evento) => evento.categoria !== "eleicoes")!;
    await item(page, alvo.slug).click();
    await expect(marcadoresDe(page, alvo.slug).first()).toHaveAttribute("data-selected", "");

    await recorte(page).getByRole("button", { name: /^Eleições/ }).click();

    await expectUrl(page, `${LULA}?categorias=eleicoes`);
    await expect(mapa(page).locator("[data-marker][data-selected]")).toHaveCount(0);
    await expect(marcadoresDe(page, alvo.slug)).toHaveCount(0);
  });

  test("acontecimento sem coordenadas: acessível pelo mapa, com o motivo, sem mover a câmera", async ({ page }) => {
    const referencia = marcadores(page).first();
    const antes = await posicao(referencia);

    await semPonto(page).click();
    const painel = seletor(page);
    await expect(painel).toContainText("Sem ponto no mapa");
    await expect(painel).toContainText("Abrangência nacional");
    await expect(painel.locator("button[data-slug]")).toHaveCount(semLugar(deLula).length);

    await painel.locator(`button[data-slug="${nacional.slug}"]`).click();
    await expectUrl(page, `${LULA}?acontecimento=${nacional.slug}`);
    await expect(leitura(page).getByRole("heading", { name: nacional.titulo })).toBeVisible();
    await expect(item(page, nacional.slug)).toHaveAttribute("aria-pressed", "true");
    await expect(mapa(page)).toContainText("não tem ponto no mapa: abrangência nacional");
    await expect(mapa(page).locator("[data-marker][data-selected]")).toHaveCount(0);
    expect(await posicao(referencia)).toEqual(antes);
  });

  test("a seleção volta com o endereço: recarregar, voltar e avançar", async ({ page }) => {
    const alvo = comLugar(deLula)[2]!;
    await item(page, alvo.slug).click();
    await expect(marcadoresDe(page, alvo.slug).first()).toHaveAttribute("data-selected", "");

    await page.reload();
    await waitForMap(page);
    await expect(marcadoresDe(page, alvo.slug).first()).toHaveAttribute("data-selected", "");

    await page.goBack();
    await expectUrl(page, LULA);
    await expect(mapa(page).locator("[data-marker][data-selected]")).toHaveCount(0);

    await page.goForward();
    await expect(marcadoresDe(page, alvo.slug).first()).toHaveAttribute("data-selected", "");
  });
});

test.describe("câmera", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LULA);
    await waitForMap(page);
  });

  test("o enquadramento inicial mostra todos os lugares do recorte", async ({ page }) => {
    const quadro = (await canvas(page).boundingBox())!;
    for (const marcador of await marcadores(page).all()) {
      const caixa = (await marcador.boundingBox())!;
      const centro = { x: caixa.x + caixa.width / 2, y: caixa.y + caixa.height / 2 };
      expect(centro.x).toBeGreaterThan(quadro.x);
      expect(centro.x).toBeLessThan(quadro.x + quadro.width);
      expect(centro.y).toBeGreaterThan(quadro.y);
      expect(centro.y).toBeLessThan(quadro.y + quadro.height);
    }
  });

  test("selecionar um lugar que já está à vista não move o mapa", async ({ page }) => {
    const referencia = marcadores(page).first();
    const antes = await posicao(referencia);
    await item(page, comLugar(deLula)[0]!.slug).click();
    await expect(mapa(page).locator("[data-marker][data-selected]").first()).toBeVisible();
    expect(await posicao(referencia)).toEqual(antes);
  });

  test("mover o mapa não muda a seleção nem o endereço", async ({ page }) => {
    const alvo = comLugar(deLula)[0]!;
    await item(page, alvo.slug).click();
    const marcador = marcadoresDe(page, alvo.slug).first();
    const antes = await posicao(marcador);

    await arrastarMapa(page, -120, -60);
    await expect.poll(() => posicao(marcador)).not.toEqual(antes);
    await controle(page, "Aproximar").click();

    expect(endereco(page)).toBe(`${LULA}?acontecimento=${alvo.slug}`);
    await expect(item(page, alvo.slug)).toHaveAttribute("aria-pressed", "true");
    await expect(leitura(page).getByRole("heading", { name: alvo.titulo })).toBeVisible();
  });

  test("arrastar o mapa começando em cima de um marcador move o mapa e não seleciona nada", async ({ page }) => {
    for (const marcador of [marcadorDoLugar(page, cheio.id), mapa(page).locator("button[data-marker][aria-pressed]").first()]) {
      const antes = (await marcador.boundingBox())!;
      const x = antes.x + antes.width / 2;
      const y = antes.y + antes.height / 2;
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(x + 40, y + 20, { steps: 5 });
      await page.mouse.move(x + 90, y + 40, { steps: 5 });
      await page.mouse.up();

      await expect.poll(async () => Math.round((await marcador.boundingBox())!.x - antes.x)).toBeGreaterThan(60);
      await expect(seletor(page)).toHaveCount(0);
      expect(endereco(page)).toBe(LULA);
    }
  });

  test("selecionar um lugar fora da vista leva a câmera até ele", async ({ page }) => {
    // Aproxima duas vezes e empurra o mapa para um canto: algum lugar sai da vista.
    await controle(page, "Aproximar").click();
    await controle(page, "Aproximar").click();
    await expect.poll(() => zoomDoMapa(page)).toBeGreaterThan(5);
    await arrastarMapa(page, -300, -200);

    const quadro = (await canvas(page).boundingBox())!;
    const dentro = (caixa: { x: number; y: number; width: number; height: number } | null) =>
      caixa !== null &&
      caixa.x + caixa.width / 2 > quadro.x &&
      caixa.x + caixa.width / 2 < quadro.x + quadro.width &&
      caixa.y + caixa.height / 2 > quadro.y &&
      caixa.y + caixa.height / 2 < quadro.y + quadro.height;

    // O primeiro acontecimento cujo marcador ficou fora do quadro.
    let fora: EventRecord | undefined;
    for (const evento of comLugar(deLula)) {
      if (!dentro(await marcadoresDe(page, evento.slug).first().boundingBox())) {
        fora = evento;
        break;
      }
    }
    expect(fora, "algum lugar deveria ter saído da vista").toBeDefined();

    await item(page, fora!.slug).click();
    await expect
      .poll(async () => dentro(await marcadoresDe(page, fora!.slug).first().boundingBox()))
      .toBe(true);
    await expect(marcadoresDe(page, fora!.slug).first()).toHaveAttribute("data-selected", "");
  });

  test("depois que a pessoa move o mapa, mudar o recorte não o recentra; Enquadrar devolve", async ({ page }) => {
    await arrastarMapa(page, -90, 40);
    const referencia = marcadorDoLugar(page, cheio.id);
    // A referência é lida com a câmera parada: no runner, a inércia do arraste ainda corria quando o recorte mudava.
    const movido = await posicaoEstavel(referencia);

    await page.getByLabel("De", { exact: true }).selectOption("2016");
    await expect.poll(() => eventosNoMapa(page)).toEqual(
      comLugar(noRecorte(deLula, 2016, 9999)).map((e) => e.slug).sort(),
    );
    expect(await posicao(referencia)).toEqual(movido);

    await controle(page, "Enquadrar os lugares do recorte").click();
    await expect.poll(() => posicao(referencia)).not.toEqual(movido);
  });

  test("o zoom para no limite da base, e os botões dizem isso", async ({ page }) => {
    const aproximar = controle(page, "Aproximar");
    for (let passo = 0; passo < 4 && (await aproximar.isEnabled()); passo += 1) {
      await aproximar.click();
      await page.waitForTimeout(350);
    }
    await expect(aproximar).toBeDisabled();
    expect(await zoomDoMapa(page)).toBeLessThanOrEqual(6);

    const afastar = controle(page, "Afastar");
    for (let passo = 0; passo < 6 && (await afastar.isEnabled()); passo += 1) {
      await afastar.click();
      await page.waitForTimeout(350);
    }
    await expect(afastar).toBeDisabled();
    // Afastado ao máximo, o mapa ainda não mostra nada fora da área da base.
    expect(await zoomDoMapa(page)).toBeGreaterThanOrEqual(2);
  });

  test("lugares vizinhos continuam acessíveis no zoom máximo", async ({ page }) => {
    // O par de lugares mais próximo entre si, na trajetória.
    const vizinhos = await marcadores(page).evaluateAll((nos) =>
      nos.map((no) => no.getAttribute("data-marker") ?? "").filter((id) => id.includes("+")),
    );
    test.skip(vizinhos.length === 0, "Nenhum par de lugares divide um marcador.");

    const aproximar = controle(page, "Aproximar");
    for (let passo = 0; passo < 4 && (await aproximar.isEnabled()); passo += 1) {
      await aproximar.click();
      await page.waitForTimeout(350);
    }
    // Nenhum acontecimento sumiu com o reagrupamento.
    await expect.poll(() => eventosNoMapa(page)).toEqual(comLugar(deLula).map((e) => e.slug).sort());

    // Quem ainda divide um marcador abre a lista, com um trecho por lugar.
    const juntos = mapa(page).locator('[data-marker*="+"]').first();
    if ((await juntos.count()) === 0) return;
    const eventos = ((await juntos.getAttribute("data-events")) ?? "").split(" ");
    await item(page, eventos[0]!).click();
    await juntos.click();
    await expect(seletor(page).locator("button[data-slug]")).toHaveCount(eventos.length);
    await expect(seletor(page).getByRole("group")).toHaveCount(
      Number(await juntos.getAttribute("data-places")),
    );
  });
});

test.describe("teclado e legenda", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LULA);
    await waitForMap(page);
  });

  test("o seletor abre, percorre, escolhe e fecha pelo teclado, devolvendo o foco", async ({ page }) => {
    const marcador = marcadorDoLugar(page, cheio.id);
    await marcador.focus();
    await page.keyboard.press("Enter");

    const painel = seletor(page);
    await expect(painel).toBeFocused();
    // Esc fecha e devolve o foco a quem abriu.
    await page.keyboard.press("Escape");
    await expect(painel).toBeHidden();
    await expect(marcador).toBeFocused();
    await expect(marcador).toHaveAttribute("aria-expanded", "false");

    // De novo: Tab até o primeiro acontecimento, Enter escolhe.
    await page.keyboard.press("Enter");
    await expect(painel).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(painel.getByRole("button", { name: /Fechar/ })).toBeFocused();
    await page.keyboard.press("Tab");
    const primeiro = painel.locator("button[data-slug]").first();
    await expect(primeiro).toBeFocused();
    const slug = (await primeiro.getAttribute("data-slug"))!;
    await page.keyboard.press("Enter");

    await expectUrl(page, `${LULA}?acontecimento=${slug}`);
    await expect(painel).toBeHidden();
    await expect(marcador).toBeFocused();
  });

  test("os marcadores e os controles têm nome e foco visível", async ({ page }) => {
    for (const marcador of await marcadores(page).all()) {
      expect(await marcador.getAttribute("aria-label")).toMatch(/: /);
    }
    for (const nome of ["Aproximar", "Afastar", "Enquadrar os lugares do recorte"]) {
      await expect(controle(page, nome)).toBeVisible();
    }
    // Depois do canvas, o Tab entra nos marcadores, com o anel de foco à vista.
    await canvas(page).focus();
    await page.keyboard.press("Tab");
    const emFoco = page.locator(":focus");
    await expect(emFoco).toHaveAttribute("data-marker", /.+/);
    expect(await emFoco.evaluate((no) => getComputedStyle(no).outlineStyle)).not.toBe("none");

    // A ordem do teclado é a de leitura do mapa: de norte a sul. Vale também
    // depois de um reagrupamento, quando o MapLibre cria marcadores novos.
    const alturas = () =>
      marcadores(page).evaluateAll((nos) => nos.map((no) => Math.round(no.getBoundingClientRect().top)));
    expect(await alturas()).toEqual([...(await alturas())].sort((a, b) => a - b));
    await controle(page, "Aproximar").click();
    await controle(page, "Aproximar").click();
    await expect.poll(() => zoomDoMapa(page)).toBeGreaterThan(5);
    await expect.poll(async () => {
      const lidas = await alturas();
      return lidas.every((valor, indice) => indice === 0 || valor >= lidas[indice - 1]!);
    }).toBe(true);
  });

  test("clicar fora fecha o seletor sem levar o foco embora", async ({ page }) => {
    await marcadorDoLugar(page, cheio.id).click();
    await expect(seletor(page)).toBeVisible();
    const caixa = (await canvas(page).boundingBox())!;
    await page.mouse.click(caixa.x + caixa.width * 0.85, caixa.y + caixa.height * 0.8);
    await expect(seletor(page)).toBeHidden();
  });

  test("a legenda explica os símbolos em uso e diz que a base é simplificada", async ({ page }) => {
    const legenda = mapa(page).locator("details");
    await expect(legenda.locator("summary")).toContainText("pontos aproximados");
    await legenda.locator("summary").click();
    await expect(legenda).toContainText("O número conta acontecimentos");
    await expect(legenda).toContainText("Natural Earth, 1:50 milhões");
    await expect(legenda).toContainText("Pontos não formam um trajeto.");
    // Sem seleção, o símbolo de seleção não aparece na legenda.
    await expect(legenda).not.toContainText("Anel laranja");
    await item(page, comLugar(deLula)[0]!.slug).click();
    await expect(legenda).toContainText("Anel laranja");
  });

  test("abrir a legenda não apaga a base do mapa ao lado dela", async ({ page }) => {
    // Neste navegador, que desenha o mapa sem placa de vídeo, um quadro opaco
    // que aparecia sobre o canvas parado fazia sumir a base em volta dele: a
    // legenda aberta tem o fundo quase opaco por causa disso. O defeito só
    // aparece quando a captura inclui a legenda, e por isso a comparação é
    // feita sobre a captura do mapa inteiro, pixel a pixel.
    const alvo = comLugar(deLula).find((evento) => lugaresDe(evento).length > 1)!;
    await page.goto(`${LULA}?acontecimento=${alvo.slug}`);
    await waitForMap(page);
    const caixa = (await canvas(page).boundingBox())!;
    const quadro = {
      x: Math.round(caixa.x),
      y: Math.round(caixa.y),
      width: Math.round(caixa.width),
      height: Math.round(caixa.height),
    };

    // A base termina de ser desenhada um instante depois de o mapa carregar.
    await page.waitForTimeout(800);
    const antes = await page.screenshot({ clip: quadro });

    const legenda = mapa(page).locator("details");
    await legenda.locator("summary").click();
    await expect(legenda).toContainText("Natural Earth");
    const aberta = (await legenda.boundingBox())!;
    await page.waitForTimeout(600);
    const depois = await page.screenshot({ clip: quadro });

    // O mapa fora da legenda: a faixa acima dela e a coluna ao lado.
    const direita = Math.ceil(aberta.x + aberta.width) - quadro.x + 4;
    const topo = Math.floor(aberta.y) - quadro.y - 4;
    const acima = { x: 0, y: 0, width: quadro.width, height: topo };
    const aoLado = { x: direita, y: 0, width: quadro.width - direita, height: quadro.height };
    expect(await pixelsDiferentes(page, antes, depois, acima), "acima da legenda").toBe(0);
    expect(await pixelsDiferentes(page, antes, depois, aoLado), "ao lado da legenda").toBe(0);
  });

  test("abrir a lista dos acontecimentos sem ponto não apaga a base ao lado dela", async ({ page }) => {
    // O mesmo cuidado, para o outro quadro que aparece sobre o mapa parado.
    // Esta lista não move a câmera: o mapa ao lado dela tem de ficar igual.
    const caixa = (await canvas(page).boundingBox())!;
    const quadro = {
      x: Math.round(caixa.x),
      y: Math.round(caixa.y),
      width: Math.round(caixa.width),
      height: Math.round(caixa.height),
    };
    await page.waitForTimeout(800);
    const antes = await page.screenshot({ clip: quadro });

    await semPonto(page).click();
    await expect(seletor(page)).toBeVisible();
    // A entrada da lista dura 180 ms.
    await page.waitForTimeout(600);
    const aberta = (await seletor(page).boundingBox())!;
    const depois = await page.screenshot({ clip: quadro });

    // A sombra da lista passa um pouco da borda dela.
    const direita = Math.ceil(aberta.x + aberta.width) - quadro.x + 28;
    const aoLado = { x: direita, y: 0, width: quadro.width - direita, height: quadro.height };
    expect(await pixelsDiferentes(page, antes, depois, aoLado), "ao lado da lista").toBe(0);
  });
});

test.describe("falhas do mapa", () => {
  test("se os contornos não carregam, a lista de lugares assume, e tentar de novo recupera", async ({ page }) => {
    await page.route(/terra.*\.geojson/, (route) => route.abort());
    await page.goto(`${LULA}?de=2016&ate=2019`);

    const falha = mapa(page).locator("[data-map-fallback]");
    await expect(falha).toHaveAttribute("data-map-fallback", "base");
    await expect(falha).toContainText("Os contornos do mapa não carregaram.");

    // A leitura continua: lugares em texto, com coordenada e precisão, e a mesma seleção.
    const esperados = comLugar(noRecorte(deLula, 2016, 2019));
    await expect(falha.locator("[data-ponto]")).toHaveCount(
      esperados.reduce((soma, evento) => soma + lugaresDe(evento).length, 0),
    );
    await expect(falha).toContainText("Aproximação: centro do município");
    await falha.locator("[data-ponto]").first().click();
    await expect(lista(page).locator('button[aria-pressed="true"]')).toHaveCount(1);
    await expect(leitura(page).getByRole("heading", { level: 3 }).first()).toBeVisible();
    expect(endereco(page)).toContain("acontecimento=");

    await page.unroute(/terra.*\.geojson/);
    await falha.getByRole("button", { name: "Tentar de novo" }).click();
    await waitForMap(page);
    await expect(mapa(page).locator("[data-marker][data-selected]").first()).toBeVisible();
  });

  test("perda do contexto gráfico: o mapa avisa, retoma sozinho e, se não retomar, cede o lugar à lista", async ({ page }) => {
    await page.goto(LULA);
    await waitForMap(page);
    const total = await marcadores(page).count();

    const perder = () =>
      canvas(page).evaluate((no) => {
        const tela = no as HTMLCanvasElement;
        const gl = tela.getContext("webgl2") ?? tela.getContext("webgl");
        const extensao = gl?.getExtension("WEBGL_lose_context") ?? null;
        (window as unknown as { __contexto: typeof extensao }).__contexto = extensao;
        extensao?.loseContext();
        return extensao !== null;
      });
    test.skip(!(await perder()), "Este navegador não permite simular a perda de contexto.");

    await expect(mapa(page).getByText("O navegador interrompeu o desenho do mapa.")).toBeVisible();
    // A lista e o painel seguem em uso enquanto isso.
    await item(page, deLula[0]!.slug).click();
    await expect(leitura(page).getByRole("heading", { name: deLula[0]!.titulo })).toBeVisible();

    await page.evaluate(() =>
      (window as unknown as { __contexto: WEBGL_lose_context }).__contexto.restoreContext(),
    );
    await expect(mapa(page).getByText("O navegador interrompeu o desenho do mapa.")).toBeHidden();
    await expect(marcadores(page)).toHaveCount(total);

    // Sem retomada, a lista de lugares assume, com a saída.
    await perder();
    const falha = mapa(page).locator("[data-map-fallback]");
    await expect(falha).toHaveAttribute("data-map-fallback", "contexto", { timeout: 10_000 });
    await expect(item(page, deLula[0]!.slug)).toHaveAttribute("aria-pressed", "true");
    await falha.getByRole("button", { name: "Tentar de novo" }).click();
    await waitForMap(page);
  });

  test("sem o pacote do mapa, a exploração textual fica inteira e oferece recarregar", async ({ page }) => {
    await page.route(MAP_PACKAGE, (route) => route.abort());
    await page.goto(LULA);

    const falha = mapa(page).locator("[data-map-fallback]");
    await expect(falha).toHaveAttribute("data-map-fallback", "pacote");
    await expect(falha.getByRole("button", { name: "Recarregar a página" })).toBeVisible();

    // Filtros, lista, linha do tempo, painel e endereço seguem funcionando.
    await recorte(page).getByRole("button", { name: /^Eleições/ }).click();
    const eleicoes = noRecorte(deLula, 0, 9999, ["eleicoes"]);
    await expect(lista(page).locator("li[data-acontecimento]")).toHaveCount(eleicoes.length);
    await marca(page, eleicoes[0]!.slug).click();
    await expectUrl(page, `${LULA}?categorias=eleicoes&acontecimento=${eleicoes[0]!.slug}`);
    await expect(leitura(page).getByRole("heading", { name: eleicoes[0]!.titulo })).toBeVisible();
  });

  test("navegador sem WebGL: os lugares viram lista na exploração e na página do acontecimento, sem oferecer nova tentativa", async ({ page }) => {
    // A simulação fica neste teste: o navegador passa a responder que não tem WebGL.
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, tipo: string, ...resto: unknown[]) {
        if (tipo.startsWith("webgl")) return null;
        return (original as (...args: unknown[]) => unknown).call(this, tipo, ...resto);
      } as typeof original;
    });
    await page.goto(`${LULA}?de=2016&ate=2019`);

    const falha = mapa(page).locator("[data-map-fallback]");
    await expect(falha).toHaveAttribute("data-map-fallback", "sem-webgl");
    await expect(falha).toContainText("O navegador ou o aparelho não oferece WebGL");
    // Tentar de novo não mudaria nada: a saída não é oferecida, e nenhum quadro de mapa fica na tela.
    await expect(falha.getByRole("button", { name: /Tentar de novo|Recarregar/ })).toHaveCount(0);
    await expect(canvas(page)).toHaveCount(0);

    // Um item por lugar de cada acontecimento do recorte, e a seleção continua.
    const esperados = comLugar(noRecorte(deLula, 2016, 2019));
    await expect(falha.locator("[data-ponto]")).toHaveCount(
      esperados.reduce((soma, evento) => soma + lugaresDe(evento).length, 0),
    );
    await falha.locator("[data-ponto]").first().click();
    await expect(lista(page).locator('button[aria-pressed="true"]')).toHaveCount(1);
    await expect(leitura(page).getByRole("heading", { level: 3 }).first()).toBeVisible();
    expect(endereco(page)).toContain("acontecimento=");

    // Os filtros continuam valendo para a lista de lugares.
    await recorte(page).getByRole("button", { name: /^Eleições/ }).click();
    const eleicoes = comLugar(noRecorte(deLula, 2016, 2019, ["eleicoes"]));
    await expect(falha.locator("[data-ponto]")).toHaveCount(
      eleicoes.reduce((soma, evento) => soma + lugaresDe(evento).length, 0),
    );

    // Na página do acontecimento, os lugares aparecem em texto.
    const alvo = comLugar(deLula)[0]!;
    await page.goto(`/acontecimentos/${alvo.slug}/`);
    const naPagina = page.locator("[data-map-fallback]");
    await naPagina.scrollIntoViewIfNeeded();
    await expect(naPagina).toHaveAttribute("data-map-fallback", "sem-webgl");
    await expect(naPagina).toContainText(nomeDoLugar(lugaresDe(alvo)[0]!));
  });
});

test.describe("layout", () => {
  const cabeNoQuadro = async (page: Page) => {
    const medidas = await mapa(page).evaluate((regiao) => {
      const tela = regiao.querySelector(".maplibregl-canvas")!.getBoundingClientRect();
      const quadro = regiao.querySelector(".maplibregl-map")!.getBoundingClientRect();
      return {
        tela: [Math.round(tela.width), Math.round(tela.height)],
        quadro: [Math.round(quadro.width), Math.round(quadro.height)],
      };
    });
    return medidas.tela[0] === medidas.quadro[0] && medidas.tela[1] === medidas.quadro[1] && medidas.tela[0]! > 0;
  };

  test("o mapa acompanha o tamanho do quadro ao redimensionar a janela", async ({ page }) => {
    await page.goto(LULA);
    await waitForMap(page);
    for (const tamanho of [
      { width: 1280, height: 720 },
      { width: 900, height: 1000 },
      { width: 1440, height: 900 },
    ]) {
      await page.setViewportSize(tamanho);
      await expect.poll(() => cabeNoQuadro(page), { message: `${tamanho.width}x${tamanho.height}` }).toBe(true);
      await expect(marcadores(page).first()).toBeVisible();
    }
  });

  test("em tablet, abrir e fechar a leitura não desalinha o mapa", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(LULA);
    await waitForMap(page);
    const alvo = comLugar(deLula)[0]!;
    await item(page, alvo.slug).click();
    await expect(leitura(page).getByRole("heading", { name: alvo.titulo })).toBeVisible();
    await expect.poll(() => cabeNoQuadro(page)).toBe(true);
    await expect(marcadoresDe(page, alvo.slug).first()).toHaveAttribute("data-selected", "");
    await leitura(page).getByRole("button", { name: "Fechar" }).click();
    await expect.poll(() => cabeNoQuadro(page)).toBe(true);
  });
});

test.describe("em celular", () => {
  test.use({ viewport: CELULAR, hasTouch: true });
  const vista = (page: Page, nome: string) =>
    page.getByRole("group", { name: "Vista" }).getByRole("button", { name: nome, exact: true });

  test.beforeEach(async ({ page }) => {
    await page.goto(FLAVIO);
    await vista(page, "Mapa").click();
    await waitForMap(page);
  });

  test("o seletor é uma folha embaixo, o marcador fica à vista, e a escolha mostra o cartão", async ({ page }) => {
    const varios = lugarComVarios(deFlavio);
    const marcador = marcadorDoLugar(page, varios.id);
    await marcador.click();

    const painel = seletor(page);
    await expect(painel).toBeVisible();
    const quadro = (await canvas(page).boundingBox())!;
    const folha = (await painel.boundingBox())!;
    // De lado a lado, na parte de baixo do mapa.
    expect(folha.width).toBeGreaterThan(quadro.width * 0.9);
    expect(folha.y + folha.height).toBeGreaterThan(quadro.y + quadro.height - 16);
    // O marcador que abriu a lista não fica debaixo dela.
    await expect
      .poll(async () => {
        const caixa = (await marcador.boundingBox())!;
        return caixa.y + caixa.height / 2 < (await painel.boundingBox())!.y;
      })
      .toBe(true);

    // Áreas de toque.
    const opcao = painel.locator("button[data-slug]").first();
    expect((await opcao.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    expect((await painel.getByRole("button", { name: /Fechar/ }).boundingBox())!.height).toBeGreaterThanOrEqual(44);

    const slug = (await opcao.getAttribute("data-slug"))!;
    const evento = deFlavio.find((e) => e.slug === slug)!;
    await opcao.click();
    await expect(painel).toBeHidden();
    // O cartão do acontecimento ocupa o lugar da folha, com Ler e Fechar.
    await expect(mapa(page).getByText(evento.titulo)).toBeVisible();
    await expect(mapa(page).getByRole("button", { name: "Ler", exact: true })).toBeVisible();
    await expect(leitura(page)).toBeHidden();
    await expect(marcador).toHaveAttribute("data-selected", "");
    // E o lugar selecionado continua acima do cartão.
    await expect
      .poll(async () => {
        const caixa = (await marcador.boundingBox())!;
        const cartao = (await mapa(page).getByRole("button", { name: "Ler", exact: true }).boundingBox())!;
        return caixa.y + caixa.height < cartao.y;
      })
      .toBe(true);
  });

  test("marcadores, controles e acesso aos sem ponto têm área de toque", async ({ page }) => {
    for (const marcador of await marcadores(page).all()) {
      const caixa = (await marcador.boundingBox())!;
      expect(caixa.width).toBeGreaterThanOrEqual(44);
      expect(caixa.height).toBeGreaterThanOrEqual(44);
    }
    for (const nome of ["Aproximar", "Afastar", "Enquadrar os lugares do recorte"]) {
      const caixa = (await controle(page, nome).boundingBox())!;
      expect(caixa.width, nome).toBeGreaterThanOrEqual(44);
      expect(caixa.height, nome).toBeGreaterThanOrEqual(44);
    }
    expect((await semPonto(page).boundingBox())!.height).toBeGreaterThanOrEqual(44);

    const { conteudo, janela } = await page.evaluate(() => ({
      conteudo: document.documentElement.scrollWidth,
      janela: window.innerWidth,
    }));
    expect(conteudo).toBeLessThanOrEqual(janela);
  });

  test("trocar de vista e voltar mantém o mapa no tamanho do quadro e a seleção", async ({ page }) => {
    const alvo = comLugar(deFlavio)[0]!;
    await vista(page, "Lista").click();
    await item(page, alvo.slug).click();
    await leitura(page).getByRole("button", { name: "Fechar" }).click();
    await item(page, alvo.slug).click();
    await vista(page, "Mapa").click();

    await expect(canvas(page)).toBeVisible();
    const medidas = await mapa(page).evaluate((regiao) => {
      const tela = regiao.querySelector(".maplibregl-canvas")!.getBoundingClientRect();
      const quadro = regiao.querySelector(".maplibregl-map")!.getBoundingClientRect();
      return { tela: Math.round(tela.width), quadro: Math.round(quadro.width), altura: Math.round(tela.height) };
    });
    expect(medidas.tela).toBe(medidas.quadro);
    expect(medidas.altura).toBeGreaterThan(200);
    await expect(marcadoresDe(page, alvo.slug).first()).toHaveAttribute("data-selected", "");
    await expect(canvas(page)).toHaveCount(1);
  });
});

test.describe("página do acontecimento", () => {
  const alvo = comDoisLugares ?? comLugar(deLula)[0]!;

  test("o mapa de localização mostra os lugares, sem nada para selecionar", async ({ page }) => {
    await page.goto(`/acontecimentos/${alvo.slug}/`);
    await expect(canvas(page).first()).toBeVisible();
    await expect(page.getByText("Carregando o mapa…")).toBeHidden();

    const marcas = page.locator("[data-marker]");
    await expect(marcas.first()).toBeVisible();
    // São imagens com nome, e não botões.
    await expect(page.locator("button[data-marker]")).toHaveCount(0);
    const nomes = (await marcas.evaluateAll((nos) => nos.map((no) => no.getAttribute("aria-label")))).join(" ");
    for (const lugar of lugaresDe(alvo)) expect(nomes).toContain(nomeDoLugar(lugar));
    await expect(page.getByRole("button", { name: /sem ponto no mapa/ })).toHaveCount(0);
  });

  test("a rolagem da página não fica presa no mapa", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 500 });
    await page.goto(`/acontecimentos/${alvo.slug}/`);
    await expect(canvas(page).first()).toBeVisible();
    await expect(page.locator("[data-marker]").first()).toBeVisible();

    await canvas(page).scrollIntoViewIfNeeded();
    const zoom = await page.locator("[data-map-zoom]").getAttribute("data-map-zoom");
    const caixa = (await canvas(page).boundingBox())!;
    const antes = await page.evaluate(() => window.scrollY);
    await page.mouse.move(caixa.x + caixa.width / 2, caixa.y + caixa.height / 2);
    await page.mouse.wheel(0, 240);

    // A roda rola a página, e o mapa fica como estava.
    await expect.poll(() => page.evaluate(() => window.scrollY)).not.toBe(antes);
    expect(await page.locator("[data-map-zoom]").getAttribute("data-map-zoom")).toBe(zoom);
  });
});

test.describe("com movimento ligado", () => {
  test.use({ contextOptions: { reducedMotion: "no-preference" } });

  test("a câmera chega ao lugar selecionado ao fim do movimento", async ({ page }) => {
    await page.goto(LULA);
    await waitForMap(page);
    // Com movimento ligado, cada aproximação anima por meio segundo a partir do
    // zoom do instante: um segundo clique dado no meio da animação parte do
    // valor intermediário e fica abaixo do esperado (4,97 no runner da CI, que
    // desenha por software). Cada passo espera o anterior chegar.
    const inicial = await zoomDoMapa(page);
    await controle(page, "Aproximar").click();
    await expect.poll(() => zoomDoMapa(page)).toBeGreaterThan(inicial + 0.9);
    await controle(page, "Aproximar").click();
    await expect.poll(() => zoomDoMapa(page)).toBeGreaterThan(Math.max(5, inicial + 1.9));
    await arrastarMapa(page, -320, -220);

    const quadro = (await canvas(page).boundingBox())!;
    const dentro = (caixa: { x: number; y: number; width: number; height: number } | null) =>
      caixa !== null &&
      caixa.x + caixa.width / 2 > quadro.x &&
      caixa.x + caixa.width / 2 < quadro.x + quadro.width &&
      caixa.y + caixa.height / 2 > quadro.y &&
      caixa.y + caixa.height / 2 < quadro.y + quadro.height;
    let fora: EventRecord | undefined;
    for (const evento of comLugar(deLula)) {
      if (!dentro(await marcadoresDe(page, evento.slug).first().boundingBox())) {
        fora = evento;
        break;
      }
    }
    expect(fora).toBeDefined();

    await item(page, fora!.slug).click();
    await expect
      .poll(async () => dentro(await marcadoresDe(page, fora!.slug).first().boundingBox()), { timeout: 4000 })
      .toBe(true);
  });
});
