// Prova técnica da fase 1 no navegador: o mapa monta só no cliente, lista,
// mapa e painel compartilham a seleção, e a leitura sobrevive à falha do mapa.

import { expect, test, type Page } from "@playwright/test";

const PROVA = "/dev/prova/";
const SCREENS = "test-results/screens";

const lista = (page: Page) => page.getByRole("region", { name: "Acontecimentos" });
const mapa = (page: Page) => page.getByRole("region", { name: "Mapa", exact: true });
const painel = (page: Page) => page.getByRole("region", { name: "Detalhes" });
const item = (page: Page, numero: string) =>
  lista(page).getByRole("button", { name: new RegExp(`Acontecimento de teste ${numero}`) });
const canvas = (page: Page) => page.locator(".maplibregl-canvas");

async function openWithMap(page: Page) {
  await page.goto(PROVA);
  await expect(canvas(page)).toBeVisible();
  await expect(page.getByText("Carregando o mapa…")).toBeHidden();
}

/** Junta erros de console e exceções da página para o teste conferir no fim. */
function collectErrors(page: Page): string[] {
  const erros: string[] = [];
  page.on("pageerror", (erro) => erros.push(erro.message));
  page.on("console", (mensagem) => {
    if (mensagem.type() === "error") erros.push(mensagem.text());
  });
  return erros;
}

test("o mapa fica fora do HTML do servidor e monta no navegador", async ({ page, request }) => {
  const erros = collectErrors(page);

  const html = await (await request.get(PROVA)).text();
  expect(html).toContain("Carregando o mapa");
  expect(html).not.toContain("maplibregl");

  await openWithMap(page);
  await expect(canvas(page)).toHaveAttribute("aria-label", "Mapa dos acontecimentos");
  await page.screenshot({ path: `${SCREENS}/01-mapa-montado.png` });

  expect(erros).toEqual([]);
});

test("nenhum recurso do mapa vem de fora do projeto", async ({ page }) => {
  const externos: string[] = [];
  page.on("request", (requisicao) => {
    const { hostname } = new URL(requisicao.url());
    if (hostname !== "localhost" && requisicao.url().startsWith("http")) externos.push(requisicao.url());
  });

  await openWithMap(page);
  await item(page, "03").click();
  await expect(painel(page)).toContainText("15 de junho de 2011");

  expect(externos).toEqual([]);
});

test("selecionar na lista atualiza o painel", async ({ page }) => {
  const erros = collectErrors(page);
  await openWithMap(page);

  await expect(painel(page)).toContainText("Escolha um acontecimento");
  await item(page, "03").click();

  await expect(item(page, "03")).toHaveAttribute("aria-pressed", "true");
  await expect(painel(page).getByRole("heading", { name: /Acontecimento de teste 03/ })).toBeVisible();
  await expect(painel(page)).toContainText("15 de junho de 2011");
  await expect(painel(page)).toContainText("Pessoa Sintética A, Pessoa Sintética B");
  await expect(painel(page)).toContainText("Lugar de teste Sudeste");
  await expect(painel(page)).toContainText("Lugar de teste Sul");
  await expect(painel(page)).toContainText("O que sustenta:");
  await expect(painel(page)).toContainText("Revisado por Fixture sintética em 8 de outubro de 2026");
  await page.screenshot({ path: `${SCREENS}/02-selecao-pela-lista.png` });

  expect(erros).toEqual([]);
});

test("datas parciais e falta de lugar aparecem como são", async ({ page }) => {
  await openWithMap(page);

  await expect(item(page, "01")).toContainText("1994");
  await expect(item(page, "02")).toContainText("março de 2003");
  await expect(item(page, "04")).toContainText("sem ponto no mapa (abrangência nacional)");
  await expect(item(page, "06")).toContainText("sem ponto no mapa (lugar não documentado)");

  await item(page, "04").click();
  await expect(painel(page)).toContainText("Abrangência nacional");
  await item(page, "06").click();
  await expect(painel(page)).toContainText("não está documentado");
  await item(page, "07").click();
  await expect(painel(page)).toContainText("1º de março de 2024");
});

test("o painel distingue revisão humana de conferência assistida por IA", async ({ page }) => {
  await openWithMap(page);

  await item(page, "03").click();
  await expect(painel(page)).toContainText("Revisado por Fixture sintética");
  await expect(painel(page)).not.toContainText("Revisão humana pendente");

  await item(page, "07").click();
  await expect(painel(page)).toContainText("com assistência de IA (Fixture sintética)");
  await expect(painel(page)).toContainText("Revisão humana pendente");
});

test("clicar em um ponto do mapa seleciona o acontecimento", async ({ page }) => {
  await openWithMap(page);

  // Selecionar pela lista leva o ponto ao centro do mapa. Desfazer a seleção
  // deixa a câmera onde está, e o clique no centro tem de selecionar de novo.
  await item(page, "02").click();
  await expect(painel(page)).toContainText("março de 2003");
  await item(page, "02").click();
  await expect(painel(page)).toContainText("Escolha um acontecimento");

  const caixa = await canvas(page).boundingBox();
  if (!caixa) throw new Error("Canvas do mapa sem dimensões.");

  await expect(async () => {
    await page.mouse.click(caixa.x + caixa.width / 2, caixa.y + caixa.height / 2);
    await expect(item(page, "02")).toHaveAttribute("aria-pressed", "true", { timeout: 500 });
  }).toPass({ timeout: 10_000 });

  await expect(painel(page)).toContainText("março de 2003");
  await page.screenshot({ path: `${SCREENS}/03-selecao-pelo-mapa.png` });
});

test("trocar a pessoa mantém lista, mapa e painel no mesmo recorte", async ({ page }) => {
  await openWithMap(page);

  await expect(page.getByText("7 acontecimentos no recorte · 6 pontos no mapa")).toBeVisible();
  await item(page, "05").click();
  await expect(painel(page)).toContainText("22 de agosto de 2018");

  // `exact`: os itens da lista também dizem de quem é cada acontecimento.
  await page.getByRole("button", { name: "Pessoa Sintética A", exact: true }).click();

  await expect(lista(page).getByRole("button")).toHaveCount(4);
  await expect(page.getByText("4 acontecimentos no recorte · 5 pontos no mapa")).toBeVisible();
  // O acontecimento 05 é só da pessoa B: saiu do recorte, e a seleção foi desfeita.
  await expect(painel(page)).toContainText("Escolha um acontecimento");
});

test("rascunho não chega à tela", async ({ page }) => {
  await openWithMap(page);
  await expect(page.getByText(/Acontecimento de teste 08/)).toHaveCount(0);
  await expect(page.getByText("1 em rascunho, fora da exibição")).toBeVisible();
});

test("a lista funciona só com o teclado", async ({ page }) => {
  await openWithMap(page);

  await item(page, "01").focus();
  await page.keyboard.press("Enter");
  await expect(item(page, "01")).toHaveAttribute("aria-pressed", "true");
  await expect(painel(page)).toContainText("1994");

  await page.keyboard.press("Tab");
  await expect(item(page, "02")).toBeFocused();
  await page.keyboard.press("Space");
  await expect(item(page, "02")).toHaveAttribute("aria-pressed", "true");
  await expect(item(page, "01")).toHaveAttribute("aria-pressed", "false");
});

test("sem WebGL, a lista de lugares assume e a seleção continua", async ({ page }) => {
  await openWithMap(page);
  const simular = page.getByRole("button", { name: "Simular navegador sem WebGL" });

  await simular.click();
  await expect(mapa(page).getByText("O mapa não pôde ser exibido neste navegador.")).toBeVisible();
  await expect(canvas(page)).toHaveCount(0);
  await expect(mapa(page).getByRole("button")).toHaveCount(6);

  await mapa(page).getByRole("button", { name: /Lugar de teste Nordeste/ }).click();
  await expect(item(page, "05")).toHaveAttribute("aria-pressed", "true");
  await expect(painel(page)).toContainText("22 de agosto de 2018");
  await expect(mapa(page)).toContainText("8,0000° S, 40,0000° O");
  await page.screenshot({ path: `${SCREENS}/04-sem-webgl.png` });

  // Com o WebGL de volta, o mapa monta outra vez com a seleção preservada.
  await simular.click();
  await expect(canvas(page)).toBeVisible();
  await expect(page.getByText("Carregando o mapa…")).toBeHidden();
  await expect(item(page, "05")).toHaveAttribute("aria-pressed", "true");
});

test("se o pacote do mapa não baixa, a lista de lugares assume", async ({ page }) => {
  await page.route(/maplibre-gl.*\.js(\?|$)/, (route) => route.abort());
  await page.goto(PROVA);

  await expect(mapa(page).getByText("O mapa não pôde ser exibido neste navegador.")).toBeVisible();
  await item(page, "01").click();
  await expect(painel(page)).toContainText("1994");
});

test("se o worker do mapa não carrega, a lista de lugares assume ao fim da espera", async ({ page }) => {
  test.setTimeout(45_000);
  await page.route(/maplibre-gl-worker/, (route) => route.abort());
  await page.goto(PROVA);

  await expect(page.getByText("Carregando o mapa…")).toBeVisible();
  await expect(mapa(page).getByText("O mapa não pôde ser exibido neste navegador.")).toBeVisible({
    timeout: 25_000,
  });
  await mapa(page).getByRole("button", { name: /Lugar de teste Norte/ }).click();
  await expect(painel(page)).toContainText("1994");
});

test("em tela de celular nada estoura a largura", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openWithMap(page);
  await item(page, "03").click();
  await expect(painel(page)).toContainText("15 de junho de 2011");

  const larguras = await page.evaluate(() => ({
    conteudo: document.documentElement.scrollWidth,
    janela: window.innerWidth,
  }));
  expect(larguras.conteudo).toBeLessThanOrEqual(larguras.janela);
  await page.screenshot({ path: `${SCREENS}/05-celular-topo.png` });

  // Captura só a janela: a de página inteira redimensiona o canvas no meio do desenho.
  await mapa(page).scrollIntoViewIfNeeded();
  await expect(canvas(page)).toBeInViewport();
  await page.screenshot({ path: `${SCREENS}/06-celular-mapa.png` });
});
