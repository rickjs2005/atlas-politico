// Fase 8: o que cada página pede, e quando, na saída estática. São os
// comportamentos que só existem no build de produção: os pacotes têm o nome
// marcado pelo conteúdo, o mapa fica em um pacote à parte e o roteador
// pré-carrega as páginas dos links.
//
// Rode com `npm run build` e `npm run test:export`.

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { expect, test, type Page } from "@playwright/test";

const OUT = path.resolve(process.env.OUT_DIR ?? "out");
const CHUNKS = path.join(OUT, "_next", "static", "chunks");

// Os pacotes que carregam o MapLibre: reconhecidos pelo conteúdo, porque o nome muda a cada build.
const MAP_CHUNKS = readdirSync(CHUNKS)
  .filter((nome) => nome.endsWith(".js") && readFileSync(path.join(CHUNKS, nome), "utf8").includes("maplibregl-canvas"))
  .map((nome) => `/_next/static/chunks/${nome}`);

const manifesto = JSON.parse(readFileSync("src/lib/media/portraits.manifest.json", "utf8")) as {
  imagens: Record<string, { origem: string; arquivos: Record<string, number> }>;
};
const DERIVADOS = new Set(Object.values(manifesto.imagens).flatMap((imagem) => Object.keys(imagem.arquivos)));
const ORIGINAIS = Object.values(manifesto.imagens).map((imagem) => imagem.origem);

const conjunto = JSON.parse(readFileSync("generated/dados/conjunto.json", "utf8")) as {
  acontecimentos: { slug: string; titulo: string; fontes: unknown[]; localizacao: { tipo: string } }[];
};
const comLugar = conjunto.acontecimentos.find((item) => item.localizacao.tipo === "lugares")!;

const CELULAR = { width: 390, height: 844 };
/** O servidor de pré-visualização (playwright.export.config.ts). */
const ORIGEM = "http://localhost:4311";

interface Seen {
  caminho: string;
  tipo: string;
  status: number | null;
}

/** Registra tudo o que a página pede, com o status de cada resposta. */
function watch(page: Page) {
  const pedidos: Seen[] = [];
  const externos: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.protocol === "data:" || url.protocol === "blob:") return;
    if (url.origin !== ORIGEM) externos.push(request.url());
  });
  page.on("requestfinished", async (request) => {
    const url = new URL(request.url());
    if (url.protocol !== "http:") return;
    // Um pedido pode terminar com o teste já encerrado e a página fechada.
    const resposta = await request.response().catch(() => null);
    pedidos.push({ caminho: url.pathname, tipo: request.resourceType(), status: resposta?.status() ?? null });
  });
  const doMapa = () =>
    pedidos
      .map((pedido) => pedido.caminho)
      .filter((caminho) => MAP_CHUNKS.includes(caminho) || /maplibre-gl-worker|\.geojson$/.test(caminho));
  return { pedidos, externos, doMapa };
}

/** Espera a rede da página parar: o roteador pré-carrega os links depois de hidratar. */
async function settle(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(600);
}

test.describe("páginas que só apresentam conteúdo", () => {
  test("o build tem o código do mapa em pacotes à parte", () => {
    expect(MAP_CHUNKS.length, "pacotes com o MapLibre").toBeGreaterThan(0);
  });

  for (const rota of ["/", "/comparar/", "/metodologia/", "/404.html"]) {
    test(`${rota} não pede nada do mapa`, async ({ page }) => {
      const visto = watch(page);
      await page.goto(rota);
      await settle(page);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(visto.doMapa(), "pedidos do mapa").toEqual([]);
    });
  }
});

test.describe("retratos", () => {
  test("a entrada pede as versões preparadas, na largura da tela, e nunca o original", async ({ page }) => {
    const visto = watch(page);
    await page.goto("/");
    await settle(page);

    const imagens = visto.pedidos.filter((pedido) => pedido.tipo === "image").map((pedido) => pedido.caminho);
    expect(imagens.length, "imagens pedidas").toBe(2);
    for (const caminho of imagens) {
      expect(DERIVADOS.has(caminho), `${caminho} é uma versão registrada`).toBe(true);
      // Cartão de 310 px em tela comum: a versão de 320 px.
      expect(caminho).toMatch(/-4x5-320\.webp$/);
    }
    for (const original of ORIGINAIS) expect(imagens).not.toContain(original);

    // A moldura reserva o espaço: a imagem tem as dimensões declaradas e carregou.
    const retratos = page.locator("main img");
    await expect(retratos).toHaveCount(2);
    for (const retrato of await retratos.all()) {
      await expect(retrato).toHaveAttribute("width", "320");
      await expect(retrato).toHaveAttribute("height", "400");
      await expect(retrato).toHaveAttribute("fetchpriority", "high");
      expect(await retrato.evaluate((no: HTMLImageElement) => no.complete && no.naturalWidth)).toBe(320);
    }
  });

  test("em celular a entrada pede versões menores", async ({ page }) => {
    await page.setViewportSize(CELULAR);
    const visto = watch(page);
    await page.goto("/");
    await settle(page);
    const imagens = visto.pedidos.filter((pedido) => pedido.tipo === "image").map((pedido) => pedido.caminho);
    expect(imagens.length).toBe(2);
    for (const caminho of imagens) expect(caminho).toMatch(/-4x5-240\.webp$/);
  });

  test("a miniatura da exploração pede a versão quadrada pequena", async ({ page }) => {
    const visto = watch(page);
    await page.goto("/politicos/lula/");
    await settle(page);
    const imagens = visto.pedidos.filter((pedido) => pedido.tipo === "image").map((pedido) => pedido.caminho);
    expect(imagens).toContain("/media/derivados/retrato-lula-1x1-64.webp");
    for (const caminho of imagens) expect(DERIVADOS.has(caminho), caminho).toBe(true);
  });

  test("adiantar a entrada a partir de outra página não baixa os retratos dos cartões", async ({ page }) => {
    const visto = watch(page);
    const imagens = () => visto.pedidos.filter((pedido) => pedido.tipo === "image").map((pedido) => pedido.caminho);
    await page.goto("/metodologia/");
    await settle(page);
    expect(imagens(), "imagens ao abrir a metodologia").toEqual([]);

    // O ponteiro no nome do atlas faz o roteador buscar o conteúdo da entrada.
    await page.getByRole("banner").getByRole("link", { name: "Atlas Político" }).hover();
    await expect
      .poll(() => visto.pedidos.map((pedido) => pedido.caminho), { message: "conteúdo da entrada adiantado" })
      .toContain("/__next.__PAGE__.txt");
    await settle(page);
    // O conteúdo chegou sem imagem nenhuma: a dica de pré-carregamento dos
    // retratos fica só no HTML da própria entrada (docs/DECISIONS.md, D-75).
    expect(imagens(), "imagens depois de adiantar a entrada").toEqual([]);
  });
});

test.describe("mapa só quando vai ser usado", () => {
  test("exploração em computador: o mapa está na tela e é carregado, com a lista já legível", async ({ page }) => {
    const visto = watch(page);
    await page.goto("/politicos/lula/");
    // A lista vem no HTML: não espera o mapa.
    await expect(page.locator(".explorer-lista li[data-acontecimento]").first()).toBeVisible();
    await expect(page.locator(".maplibregl-canvas")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("Carregando o mapa…")).toBeHidden({ timeout: 30_000 });
    await settle(page);
    const doMapa = visto.doMapa();
    expect(doMapa.some((caminho) => MAP_CHUNKS.includes(caminho)), "pacote do mapa").toBe(true);
    expect(doMapa.some((caminho) => /maplibre-gl-worker\.[^.]+\.mjs$/.test(caminho)), "worker").toBe(true);
    expect(doMapa.filter((caminho) => caminho.endsWith(".geojson")).length, "contornos").toBe(2);
    expect(visto.pedidos.filter((pedido) => (pedido.status ?? 0) >= 400), "respostas com erro").toEqual([]);
  });

  test("exploração em celular: nada do mapa até a vista ser pedida, e o aquecimento não cria o mapa", async ({ page }) => {
    await page.setViewportSize(CELULAR);
    const visto = watch(page);
    await page.goto("/politicos/lula/");
    await settle(page);
    expect(visto.doMapa(), "na lista").toEqual([]);

    // O foco no botão da vista é sinal de que ela vai ser aberta: o código começa a vir.
    const aba = page.getByRole("group", { name: "Vista" }).getByRole("button", { name: "Mapa", exact: true });
    await aba.focus();
    await expect.poll(() => visto.doMapa().some((caminho) => MAP_CHUNKS.includes(caminho)), { message: "pacote do mapa" }).toBe(true);
    await settle(page);
    expect(visto.doMapa().filter((caminho) => /worker|geojson/.test(caminho)), "worker e contornos antes de abrir").toEqual([]);
    await expect(page.locator(".maplibregl-canvas")).toHaveCount(0);

    await aba.click();
    await expect(page.getByRole("status").filter({ hasText: "Carregando o mapa" })).toBeHidden({ timeout: 30_000 });
    await expect(page.locator(".maplibregl-canvas")).toBeVisible();
    expect(visto.doMapa().filter((caminho) => caminho.endsWith(".geojson")).length).toBe(2);
  });

  test("página do acontecimento em celular: o mapa espera a rolagem chegar perto", async ({ page }) => {
    await page.setViewportSize(CELULAR);
    const visto = watch(page);
    await page.goto(`/acontecimentos/${comLugar.slug}/`);
    await settle(page);

    // A leitura está completa sem o mapa.
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(comLugar.titulo);
    await expect(page.locator('section[aria-labelledby="fontes"] [data-fonte]')).toHaveCount(comLugar.fontes.length);
    expect(visto.doMapa(), "antes de rolar").toEqual([]);
    await expect(page.locator(".maplibregl-canvas")).toHaveCount(0);

    await page.getByRole("complementary", { name: "Ficha do acontecimento" }).scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, 400);
    await expect(page.locator(".maplibregl-canvas")).toBeVisible({ timeout: 30_000 });
    expect(visto.doMapa().length).toBeGreaterThan(0);
  });

  test("página do acontecimento em computador: o texto chega antes, e o mapa entra sem deslocar nada", async ({ page }) => {
    // O pacote do mapa demora: o que a página mostra enquanto isso?
    for (const pacote of MAP_CHUNKS) {
      await page.route(`**${pacote}`, async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        await route.continue();
      });
    }
    await page.goto(`/acontecimentos/${comLugar.slug}/`);

    const ficha = page.getByRole("complementary", { name: "Ficha do acontecimento" });
    const aviso = ficha.getByRole("status").filter({ hasText: "Carregando o mapa" });
    await expect(aviso).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(comLugar.titulo);
    await expect(page.locator('section[aria-labelledby="fontes"] [data-fonte]')).toHaveCount(comLugar.fontes.length);

    // A moldura já tem o tamanho final: o que vem depois dela não se move.
    const creditos = ficha.locator('[data-secao="creditos"]');
    const antes = await creditos.boundingBox();
    await expect(aviso).toBeHidden({ timeout: 30_000 });
    await expect(ficha.locator(".maplibregl-canvas")).toBeVisible();
    const depois = await creditos.boundingBox();
    expect(Math.round(depois!.y)).toBe(Math.round(antes!.y));
  });
});

test.describe("navegação", () => {
  test("nenhum pedido das telas principais falha, e nada vai a outro domínio", async ({ page }) => {
    const visto = watch(page);
    for (const rota of ["/", "/politicos/flavio-bolsonaro/", "/comparar/", "/metodologia/", `/acontecimentos/${comLugar.slug}/`]) {
      await page.goto(rota);
      await settle(page);
    }
    expect(visto.pedidos.filter((pedido) => (pedido.status ?? 0) >= 400).map((pedido) => pedido.caminho), "respostas com erro").toEqual([]);
    expect(visto.externos, "pedidos a outro domínio").toEqual([]);
  });

  test("o menu só adianta o destino quando a pessoa aponta para o link", async ({ page }) => {
    const visto = watch(page);
    await page.goto("/metodologia/");
    await settle(page);
    // Nenhuma página vizinha foi baixada só por estar no menu.
    const trechos = () => visto.pedidos.filter((pedido) => pedido.caminho.endsWith(".txt")).map((pedido) => pedido.caminho);
    expect(trechos(), "pré-carregamentos ao abrir").toEqual([]);

    const link = page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Comparar" });
    await link.hover();
    await expect.poll(trechos, { message: "pré-carregamento ao apontar" }).toContain("/comparar/__next.comparar.__PAGE__.txt");
    await settle(page);
    expect(visto.pedidos.filter((pedido) => (pedido.status ?? 0) >= 400)).toEqual([]);

    const documentos = () => visto.pedidos.filter((pedido) => pedido.tipo === "document").length;
    const antes = documentos();
    await link.click();
    await expect(page).toHaveURL(/\/comparar\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Comparar trajetórias");
    expect(documentos(), "documentos carregados na navegação").toBe(antes);
  });

  test("da entrada para a exploração: o roteador usa o que já pré-carregou, sem recarregar a página", async ({ page }) => {
    const visto = watch(page);
    await page.goto("/");
    await settle(page);
    // O trecho da página de destino, pedido pelo nome que o navegador usa.
    const trecho = visto.pedidos.find((pedido) => pedido.caminho === "/politicos/lula/__next.politicos.$d$slug.__PAGE__.txt");
    expect(trecho?.status, "pré-carregamento da exploração").toBe(200);

    const documentos = () => visto.pedidos.filter((pedido) => pedido.tipo === "document").length;
    const antes = documentos();
    await page.getByRole("link", { name: /^Lula/ }).first().click();
    await expect(page).toHaveURL(/\/politicos\/lula\/$/);
    await expect(page.locator(".explorer-lista li[data-acontecimento]").first()).toBeVisible();
    expect(documentos(), "documentos carregados na navegação").toBe(antes);
  });
});
