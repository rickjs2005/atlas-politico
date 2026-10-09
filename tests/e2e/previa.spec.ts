// Prévia navegável da fase 4, com os dados gerados: as quatro telas, a seleção
// compartilhada entre lista, mapa, linha do tempo e painel, a composição por
// largura, o teclado e os estados de falha. Os textos esperados saem dos
// arquivos gerados, para o teste acompanhar o conteúdo.

import { readFileSync } from "node:fs";

import { expect, test, type Locator, type Page } from "@playwright/test";

interface EventRecord {
  id: string;
  slug: string;
  titulo: string;
  categoria: string;
  pessoaIds: string[];
  data: { valor: string };
  fontes: { fonteId: string }[];
  localizacao: { tipo: "lugares"; lugarIds: string[] } | { tipo: "nacional" | "desconhecida" };
}

const conjunto = JSON.parse(readFileSync("generated/dados/conjunto.json", "utf8")) as {
  acontecimentos: EventRecord[];
  pessoas: { id: string; slug: string; nome: string }[];
  fontes: { id: string; titulo: string; url: string }[];
};

const lula = conjunto.pessoas.find((pessoa) => pessoa.slug === "lula")!;
const flavio = conjunto.pessoas.find((pessoa) => pessoa.slug === "flavio-bolsonaro")!;
const eventosDe = (pessoaId: string) =>
  conjunto.acontecimentos.filter((item) => item.pessoaIds.includes(pessoaId));
const deLula = eventosDe(lula.id);
/** Acontecimento com ponto no mapa, para os testes de seleção. */
const comPonto = deLula.find((item) => item.localizacao.tipo === "lugares")!;
const semPonto = deLula.find((item) => item.localizacao.tipo !== "lugares")!;

const PERFIL = "/politicos/lula/";
const CELULAR = { width: 390, height: 844 };

// `exact`: o canvas do mapa também é uma região, chamada "Mapa dos acontecimentos".
const lista = (page: Page) => page.getByRole("region", { name: "Acontecimentos", exact: true });
const leitura = (page: Page) => page.getByRole("region", { name: "Leitura" });
const tempo = (page: Page) => page.getByRole("region", { name: "Linha do tempo" });
const mapa = (page: Page) => page.getByRole("region", { name: "Mapa", exact: true });
const canvas = (page: Page) => page.locator(".maplibregl-canvas");
const marca = (page: Page, slug: string) => page.locator(`button[data-mark][data-slug="${slug}"]`);
const vista = (page: Page, nome: string) =>
  page.getByRole("group", { name: "Vista" }).getByRole("button", { name: nome, exact: true });

async function waitForMap(page: Page) {
  await expect(canvas(page).first()).toBeVisible();
  await expect(page.getByText("Carregando o mapa…")).toBeHidden();
}

async function expectNoOverflow(page: Page) {
  const { conteudo, janela } = await page.evaluate(() => ({
    conteudo: document.documentElement.scrollWidth,
    janela: window.innerWidth,
  }));
  expect(conteudo, "largura do conteúdo").toBeLessThanOrEqual(janela);
}

const heightOf = async (alvo: Locator) => (await alvo.boundingBox())?.height ?? 0;

test.describe("entrada", () => {
  test("apresenta o atlas, o recorte e as duas trajetórias com o mesmo tratamento", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Atlas Político");
    await expect(page.getByText(`${conjunto.acontecimentos.length} acontecimentos`).first()).toBeVisible();
    await expect(page.getByText("Revisão humana pendente").first()).toBeVisible();
    await expect(page.getByRole("main").getByRole("link", { name: "Metodologia e fontes" })).toBeVisible();

    // Mesma ordem em todo lugar: alfabética.
    const cartoes = page.getByRole("main").getByRole("link", { name: /Explorar a trajetória/ });
    await expect(cartoes).toHaveCount(2);
    await expect(cartoes.nth(0)).toContainText(flavio.nome);
    await expect(cartoes.nth(1)).toContainText(lula.nome);

    // Mesma área para os dois: cartão e retrato do mesmo tamanho.
    const [a, b] = await Promise.all([cartoes.nth(0).boundingBox(), cartoes.nth(1).boundingBox()]);
    expect(a?.width).toBeCloseTo(b?.width ?? 0, 0);
    expect(a?.height).toBeCloseTo(b?.height ?? 0, 0);
    const retratos = cartoes.locator("img");
    const [ra, rb] = await Promise.all([retratos.nth(0).boundingBox(), retratos.nth(1).boundingBox()]);
    expect(ra?.width).toBeCloseTo(rb?.width ?? 0, 0);
    expect(ra?.height).toBeCloseTo(rb?.height ?? 0, 0);

    // Cada retrato tem o crédito escrito.
    await expect(page.getByText(/^Foto: .+ Exibida em tons de cinza e recortada\.$/)).toHaveCount(2);
  });

  test("leva à exploração de uma pessoa e à comparação", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("main").getByRole("link", { name: /Lula.*Explorar a trajetória/ }).click();
    await expect(page).toHaveURL(/\/politicos\/lula\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Trajetória de Lula");

    await page.goto("/");
    await page.getByRole("link", { name: "Comparar as trajetórias" }).click();
    await expect(page).toHaveURL(/\/comparar\/$/);
  });
});

test.describe("exploração em tela larga", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PERFIL);
    await waitForMap(page);
  });

  test("lista, mapa, linha do tempo e painel aparecem lado a lado, sem rolagem da página", async ({ page }) => {
    await expect(lista(page).getByRole("listitem")).toHaveCount(deLula.length);
    await expect(tempo(page).locator("button[data-mark]")).toHaveCount(deLula.length);
    await expect(leitura(page).getByRole("heading", { name: lula.nome, exact: true })).toBeVisible();
    await expect(mapa(page)).toBeVisible();
    await expect(page.getByRole("group", { name: "Vista" })).toBeHidden();

    const { pagina, janela } = await page.evaluate(() => ({
      pagina: document.documentElement.scrollHeight,
      janela: window.innerHeight,
    }));
    // A área de trabalho ocupa a altura da tela; o que passa dela é só o rodapé.
    expect(pagina - janela).toBeLessThan(200);
    await expectNoOverflow(page);
  });

  test("selecionar na lista marca o mesmo acontecimento na linha do tempo e abre o painel", async ({ page }) => {
    const item = lista(page).getByRole("button", { name: comPonto.titulo });
    await item.click();

    await expect(item).toHaveAttribute("aria-pressed", "true");
    await expect(marca(page, comPonto.slug)).toHaveAttribute("aria-pressed", "true");
    await expect(leitura(page).getByRole("heading", { name: comPonto.titulo })).toBeVisible();
    await expect(leitura(page).locator("time")).toHaveAttribute("datetime", comPonto.data.valor);
    await expect(leitura(page).getByRole("heading", { name: /^Fontes/ })).toContainText(
      `(${comPonto.fontes.length})`,
    );
    await expect(leitura(page)).toContainText("O que sustenta:");
    await expect(leitura(page)).toContainText("Revisão humana pendente");

    // Fechar devolve o perfil ao painel e o foco ao item da lista.
    await leitura(page).getByRole("button", { name: "Fechar" }).click();
    await expect(leitura(page).getByRole("heading", { name: lula.nome, exact: true })).toBeVisible();
    await expect(item).toHaveAttribute("aria-pressed", "false");
    await expect(item).toBeFocused();
  });

  test("selecionar na linha do tempo marca o item da lista", async ({ page }) => {
    await marca(page, comPonto.slug).click();
    await expect(lista(page).getByRole("button", { name: comPonto.titulo })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(leitura(page).getByRole("heading", { name: comPonto.titulo })).toBeVisible();
  });

  test("clicar em um ponto do mapa abre o acontecimento", async ({ page }) => {
    // Selecionar pela lista leva o ponto ao centro do mapa; depois de fechar,
    // a câmera fica onde está, e o clique no centro tem de selecionar de novo.
    const umLugar = deLula.find(
      (item) => item.localizacao.tipo === "lugares" && item.localizacao.lugarIds.length === 1,
    )!;
    await lista(page).getByRole("button", { name: umLugar.titulo }).click();
    await leitura(page).getByRole("button", { name: "Fechar" }).click();

    const caixa = await canvas(page).boundingBox();
    if (!caixa) throw new Error("Canvas do mapa sem dimensões.");
    await expect(async () => {
      await page.mouse.click(caixa.x + caixa.width / 2, caixa.y + caixa.height / 2);
      await expect(lista(page).locator('button[aria-pressed="true"]')).toHaveCount(1, { timeout: 500 });
    }).toPass({ timeout: 10_000 });

    // Pontos do mesmo lugar ou de municípios vizinhos se sobrepõem nesta escala:
    // o clique abre o de cima. Vale qualquer acontecimento com ponto, desde que
    // lista e painel mostrem o mesmo.
    const id = await lista(page).locator('button[aria-pressed="true"]').getAttribute("id");
    const aberto = deLula.find((item) => `item-${item.slug}` === id);
    expect(aberto?.localizacao.tipo).toBe("lugares");
    await expect(leitura(page).getByRole("heading", { name: aberto!.titulo })).toBeVisible();
  });

  test("acontecimento sem ponto no mapa continua na lista e no painel", async ({ page }) => {
    const item = lista(page).getByRole("button", { name: semPonto.titulo });
    await expect(item).toContainText("sem ponto no mapa");
    await item.click();
    await expect(leitura(page).getByRole("heading", { name: semPonto.titulo })).toBeVisible();
    await expect(leitura(page).getByRole("heading", { name: "Lugares" })).toBeVisible();
  });

  test("a linha do tempo funciona pelo teclado, com uma única parada de Tab", async ({ page }) => {
    const marcas = tempo(page).locator("button[data-mark]");
   await expect(tempo(page).locator('button[data-mark][tabindex="0"]')).toHaveCount(1);

    await marcas.first().focus();
    await page.keyboard.press("ArrowRight");
    await expect(marcas.nth(1)).toBeFocused();
    await page.keyboard.press("End");
    await expect(marcas.last()).toBeFocused();
    await page.keyboard.press("Home");
    await expect(marcas.first()).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(marcas.first()).toHaveAttribute("aria-pressed", "true");
    await expect(leitura(page).getByRole("heading", { level: 3 }).first()).toBeVisible();
  });

  test("período sem registros explica a lacuna e oferece a saída", async ({ page }) => {
    const anos = new Set(deLula.map((item) => Number(item.data.valor.slice(0, 4))));
    // Primeiro par de anos seguidos sem acontecimento, dentro da trajetória.
    const inicio = [...anos].sort((a, b) => a - b)[0]!;
    let vazio = inicio + 1;
    while (anos.has(vazio) || anos.has(vazio + 1)) vazio += 1;

    await page.getByLabel("De", { exact: true }).selectOption(String(vazio));
    await page.getByLabel("Até", { exact: true }).selectOption(String(vazio + 1));

    await expect(lista(page)).toContainText("Nenhum registro do atlas neste recorte.");
    await expect(lista(page)).toContainText("e não falta de atividade pública");
    await expect(tempo(page).locator("button[data-mark]")).toHaveCount(0);
    await expect(tempo(page)).toContainText("0 acontecimentos");

    await lista(page).getByRole("button", { name: "Limpar período e categorias" }).click();
    await expect(lista(page).getByRole("listitem")).toHaveCount(deLula.length);
  });

  test("filtrar por categoria recorta lista e linha do tempo, e a barra não muda de altura", async ({ page }) => {
    const recorte = page.getByRole("region", { name: "Recorte" });
    const antes = await heightOf(recorte);
    const eleicoes = deLula.filter((item) => item.categoria === "eleicoes");

    await recorte.getByRole("button", { name: /^Eleições/ }).click();
    await expect(lista(page).getByRole("listitem")).toHaveCount(eleicoes.length);
    await expect(tempo(page).locator("button[data-mark]")).toHaveCount(eleicoes.length);
    expect(await heightOf(recorte)).toBe(antes);

    await page.getByLabel("De", { exact: true }).selectOption({ index: 5 });
    expect(await heightOf(recorte)).toBe(antes);

    await recorte.getByRole("button", { name: "Mostrar todas" }).click();
    await recorte.getByRole("button", { name: "Todo o período" }).click();
    await expect(lista(page).getByRole("listitem")).toHaveCount(deLula.length);
  });

  test("do painel à página do acontecimento, à fonte e de volta com a seleção", async ({ page }) => {
    await lista(page).getByRole("button", { name: comPonto.titulo }).click();
    await leitura(page).getByRole("link", { name: "Abrir a página do acontecimento" }).click();

    await expect(page).toHaveURL(new RegExp(`/acontecimentos/${comPonto.slug}/$`));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(comPonto.titulo);
    await expect(page.locator("article time").first()).toHaveAttribute("datetime", comPonto.data.valor);

    // A fonte abre o documento original.
    const fonte = conjunto.fontes.find((item) => item.id === comPonto.fontes[0]!.fonteId)!;
    const link = page.getByRole("link", { name: fonte.titulo }).first();
    await expect(link).toHaveAttribute("href", fonte.url);
    await expect(page.getByText("O que sustenta:").first()).toBeVisible();
    await expect(page.getByText(/Revisão humana pendente/).first()).toBeVisible();

    // O retorno leva à exploração com o mesmo acontecimento aberto.
    await page.getByRole("link", { name: `Trajetória de ${lula.nome}` }).first().click();
    await expect(page).toHaveURL(new RegExp(`/politicos/lula/\\?acontecimento=${comPonto.slug}$`));
    await expect(leitura(page).getByRole("heading", { name: comPonto.titulo })).toBeVisible();
    await expect(lista(page).getByRole("button", { name: comPonto.titulo })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});

test.describe("exploração em tablet", () => {
  test("lista ou leitura à esquerda, mapa e linha do tempo à direita", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(PERFIL);
    await waitForMap(page);

    await expect(lista(page)).toBeVisible();
    await expect(mapa(page)).toBeVisible();
    await expect(tempo(page)).toBeVisible();
    await expect(leitura(page)).toBeHidden();
    // O mapa está sempre à vista: a alternância só troca lista e perfil.
    await expect(vista(page, "Mapa")).toBeHidden();

    await lista(page).getByRole("button", { name: comPonto.titulo }).click();
    await expect(leitura(page).getByRole("heading", { name: comPonto.titulo })).toBeFocused();
    await expect(lista(page)).toBeHidden();
    await expect(mapa(page)).toBeVisible();

    await leitura(page).getByRole("button", { name: "Fechar" }).click();
    await expect(lista(page).getByRole("button", { name: comPonto.titulo })).toBeFocused();
    await expectNoOverflow(page);

    // Esc, com o foco na leitura, fecha do mesmo jeito.
    await page.keyboard.press("Enter");
    await expect(leitura(page).getByRole("heading", { name: comPonto.titulo })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(lista(page).getByRole("button", { name: comPonto.titulo })).toBeFocused();

    // Os filtros ficam recolhidos, com o recorte em vigor escrito.
    const filtros = page.getByRole("button", { name: /^Filtros/ });
    await expect(filtros).toHaveAttribute("aria-expanded", "false");
    await filtros.click();
    await expect(page.getByLabel("De", { exact: true })).toBeVisible();
  });
});

test.describe("exploração em celular", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(CELULAR);
    await page.goto(PERFIL);
  });

  test("uma vista por vez: lista, mapa ou perfil", async ({ page }) => {
    await expect(vista(page, "Lista")).toHaveAttribute("aria-pressed", "true");
    await expect(lista(page)).toBeVisible();
    await expect(mapa(page)).toBeHidden();
    await expect(leitura(page)).toBeHidden();
    // A pessoa e o recorte ficam escritos no topo.
    await expect(page.getByRole("region", { name: "Recorte" })).toContainText(lula.nome);
    await expect(page.getByRole("region", { name: "Recorte" })).toContainText("todas as categorias");

    await vista(page, "Mapa").click();
    await waitForMap(page);
    await expect(lista(page)).toBeHidden();
    // O mapa cabe na tela: o toque nele não disputa com a rolagem da página.
    const caixa = await mapa(page).boundingBox();
    expect(caixa!.y + caixa!.height).toBeLessThanOrEqual(CELULAR.height + 1);

    await vista(page, "Perfil").click();
    await expect(leitura(page).getByRole("heading", { name: lula.nome, exact: true })).toBeVisible();
    await expect(mapa(page)).toBeHidden();
    await expectNoOverflow(page);
  });

  test("abrir um acontecimento troca a lista pela leitura, e fechar devolve o foco", async ({ page }) => {
    const item = lista(page).getByRole("button", { name: comPonto.titulo });
    await item.click();

    await expect(leitura(page).getByRole("heading", { name: comPonto.titulo })).toBeFocused();
    await expect(lista(page)).toBeHidden();
    await expectNoOverflow(page);

    const fechar = leitura(page).getByRole("button", { name: "Fechar" });
    expect(await heightOf(fechar)).toBeGreaterThanOrEqual(44);
    await fechar.click();
    await expect(lista(page)).toBeVisible();
    await expect(item).toBeFocused();
  });

  test("na vista do mapa, a seleção mostra um cartão e a leitura abre a pedido", async ({ page }) => {
    await vista(page, "Mapa").click();
    await waitForMap(page);

    await marca(page, comPonto.slug).click();
    const cartao = mapa(page).getByText(comPonto.titulo);
    await expect(cartao).toBeVisible();
    await expect(leitura(page)).toBeHidden();

    await mapa(page).getByRole("button", { name: "Ler", exact: true }).click();
    await expect(leitura(page).getByRole("heading", { name: comPonto.titulo })).toBeFocused();

    // Fechar a leitura devolve a vista do mapa.
    await leitura(page).getByRole("button", { name: "Fechar" }).click();
    await expect(mapa(page)).toBeVisible();
    await expect(vista(page, "Mapa")).toBeFocused();
  });

  test("os controles principais têm área de toque de 44 pixels", async ({ page }) => {
    for (const nome of ["Lista", "Mapa", "Perfil"]) {
      expect(await heightOf(vista(page, nome)), nome).toBeGreaterThanOrEqual(44);
    }
    const filtros = page.getByRole("button", { name: /^Filtros/ });
    expect(await heightOf(filtros)).toBeGreaterThanOrEqual(44);
    expect(await heightOf(page.getByRole("button", { name: "Menu" }))).toBeGreaterThanOrEqual(44);
    expect(await heightOf(lista(page).getByRole("button").first())).toBeGreaterThanOrEqual(44);

    await filtros.click();
    expect(await heightOf(page.getByLabel("De", { exact: true }))).toBeGreaterThanOrEqual(44);
    expect(await heightOf(page.getByRole("button", { name: /^Eleições/ }))).toBeGreaterThanOrEqual(44);
  });
});

test.describe("com movimento ligado", () => {
  // O resto da suíte roda com movimento reduzido. Aqui as transições acontecem
  // de verdade, e o resultado tem de ser o mesmo.
  test.use({ contextOptions: { reducedMotion: "no-preference" } });

  test("a leitura entra com a transição curta e a câmera chega ao ponto", async ({ page }) => {
    await page.goto(PERFIL);
    await waitForMap(page);
    await lista(page).getByRole("button", { name: comPonto.titulo }).click();

    const artigo = leitura(page).locator("article");
    await expect(artigo).toBeVisible();
    const animacao = await artigo.evaluate((no) => {
      const estilo = getComputedStyle(no);
      return { nome: estilo.animationName, duracao: estilo.animationDuration };
    });
    expect(animacao).toEqual({ nome: "atlas-enter", duracao: "0.18s" });

    // Ao fim do movimento o conteúdo está inteiro e o mapa continua de pé.
    await expect(artigo).toHaveCSS("opacity", "1");
    await page.waitForTimeout(900);
    await expect(canvas(page)).toBeVisible();
    await expect(marca(page, comPonto.slug)).toHaveAttribute("aria-pressed", "true");
    await page.screenshot({ path: "test-results/screens/09-previa-com-movimento.png" });
  });
});

test.describe("falha do mapa", () => {
  test("sem o pacote do mapa, os lugares viram lista e a seleção continua", async ({ page }) => {
    await page.route(/maplibre-gl.*\.js(\?|$)/, (route) => route.abort());
    await page.goto(PERFIL);

    await expect(mapa(page).getByText("O mapa não pôde ser exibido neste navegador.")).toBeVisible();
    await mapa(page).getByRole("button").first().click();
    await expect(lista(page).locator('button[aria-pressed="true"]')).toHaveCount(1);
    await expect(leitura(page).getByRole("heading", { level: 3 }).first()).toBeVisible();
  });
});

test.describe("acontecimento", () => {
  test("mostra data, pessoas, lugares, fontes, revisão e o retorno", async ({ page }) => {
    await page.goto(`/acontecimentos/${semPonto.slug}/`);

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(semPonto.titulo);
    await expect(page.getByRole("heading", { name: "Pessoa", exact: true }).or(page.getByRole("heading", { name: "Pessoas", exact: true }))).toBeVisible();
    await expect(page.getByRole("heading", { name: "Lugares" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /^Fontes/ })).toContainText(`(${semPonto.fontes.length})`);
    await expect(page.getByText(/Revisão humana pendente/).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /^Trajetória de / }).first()).toHaveAttribute(
      "href",
      new RegExp(`\\?acontecimento=${semPonto.slug}$`),
    );
    // Sem ponto, a página diz o motivo em vez de mostrar um mapa vazio.
    await expect(canvas(page)).toHaveCount(0);
  });
});

test.describe("comparação", () => {
  test("mesma escala para as duas pessoas, com as lacunas de cobertura escritas", async ({ page }) => {
    await page.goto("/comparar/");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Comparar trajetórias");
    await expect(page.getByText("Quantidade de registros não mede desempenho")).toBeVisible();
    for (const pessoa of [flavio, lula]) {
      await expect(page.getByRole("region", { name: `Trajetória de ${pessoa.nome}` })).toBeVisible();
      const coluna = page.getByRole("region", { name: pessoa.nome, exact: true });
      await expect(coluna.getByRole("heading", { name: "Cobertura desta edição" })).toBeVisible();
      await expect(coluna).toContainText(`${eventosDe(pessoa.id).length} registros do atlas`);
    }
    // A cobertura de uma trajetória começa depois: o trecho anterior é dito como fora da cobertura.
    await expect(page.getByText("fora da cobertura desta edição").first()).toBeVisible();
    await expect(page.getByText(/o atlas não cobre esta\s+trajetória/).first()).toBeVisible();
    await expect(page.getByText(/São lacunas da pesquisa, e não ausência de atividade/).first()).toBeVisible();

    // As duas faixas usam o mesmo eixo: mesma largura e mesma posição.
    const caixas = await page.locator("ul[aria-label^='Acontecimentos de ']").evaluateAll((nos) =>
      nos.map((no) => {
        const { left, width } = no.getBoundingClientRect();
        return { left: Math.round(left), width: Math.round(width) };
      }),
    );
    expect(caixas).toHaveLength(2);
    expect(caixas[0]).toEqual(caixas[1]);
  });

  test("o período vale para as duas colunas, e a tela não dá nota nem total comparado", async ({ page }) => {
    await page.goto("/comparar/");
    await page.getByLabel("De", { exact: true }).selectOption("2019");
    await page.getByLabel("Até", { exact: true }).selectOption("2022");

    for (const pessoa of [flavio, lula]) {
      const esperado = eventosDe(pessoa.id).filter((item) => {
        const ano = Number(item.data.valor.slice(0, 4));
        return ano >= 2019 && ano <= 2022;
      }).length;
      const coluna = page.getByRole("region", { name: pessoa.nome, exact: true });
      await expect(coluna).toContainText(
        `${esperado} ${esperado === 1 ? "registro do atlas" : "registros do atlas"}`,
      );
    }
    await expect(page.getByRole("main")).not.toContainText(/ranking|nota|placar|vence|melhor|pior/i);
  });
});

test.describe("largura e páginas de apoio", () => {
  for (const largura of [360, 390, 768]) {
    test(`nenhuma tela estoura a largura em ${largura} px`, async ({ page }) => {
      await page.setViewportSize({ width: largura, height: 800 });
      for (const rota of ["/", PERFIL, `/acontecimentos/${comPonto.slug}/`, "/comparar/", "/metodologia/"]) {
        await page.goto(rota);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        await expectNoOverflow(page);
      }
    });
  }

  test("o menu em celular abre, leva às telas e fecha", async ({ page }) => {
    await page.setViewportSize(CELULAR);
    await page.goto("/");
    const menu = page.getByRole("button", { name: "Menu" });
    await expect(menu).toHaveAttribute("aria-expanded", "false");
    await menu.click();
    await expect(menu).toHaveAttribute("aria-expanded", "true");
    await page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Comparar", exact: true }).click();
    await expect(page).toHaveURL(/\/comparar\/$/);
    await expect(page.getByRole("button", { name: "Menu" })).toHaveAttribute("aria-expanded", "false");
  });

  test("parâmetro inválido no endereço é descartado, e a exploração abre com o resto", async ({ page }) => {
    await page.goto(`${PERFIL}?acontecimento=nao-existe&de=abcd&categorias=eleicoes,inventada`);

    const eleicoes = deLula.filter((item) => item.categoria === "eleicoes");
    await expect(lista(page).getByRole("listitem")).toHaveCount(eleicoes.length);
    await expect(page.getByRole("button", { name: /^Eleições/ })).toHaveAttribute("aria-pressed", "true");
    // Sem acontecimento válido, o painel fica no perfil.
    await expect(leitura(page).getByRole("heading", { name: lula.nome, exact: true })).toBeVisible();
  });

  test("endereço inexistente mostra a página 404 do atlas, com caminhos de volta", async ({ page }) => {
    const resposta = await page.goto("/endereco-que-nao-existe/");
    expect(resposta?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Este endereço não está no atlas");
    await expect(page.getByRole("main").getByRole("link", { name: /Voltar ao início/ })).toHaveAttribute("href", "/");
  });

  test("o foco é visível e o primeiro Tab oferece pular para o conteúdo", async ({ page }) => {
    await page.goto(PERFIL);
    await page.keyboard.press("Tab");
    const foco = page.locator(":focus");
    await expect(foco).toHaveText(/Pular para o conteúdo/);
    await page.keyboard.press("Tab");
    const contorno = await page.locator(":focus").evaluate((no) => getComputedStyle(no).outlineStyle);
    expect(contorno).not.toBe("none");
  });
});
