// Capturas do mapa sincronizado (fase 6), para docs/capturas/fase-6/. Rode
// com `npm run capture:map`. Não é teste: não confere nada, só registra as
// telas. Os testes ficam em `tests/e2e/mapa.spec.ts`.

import { expect, test, type Page } from "@playwright/test";

const OUT = process.env.CAPTURE_DIR ?? "docs/capturas/fase-6";

const VIEWPORTS = {
  computador: { width: 1440, height: 900 },
  "computador-baixo": { width: 1280, height: 720 },
  tablet: { width: 768, height: 1024 },
  celular: { width: 390, height: 844 },
} as const;
type Device = keyof typeof VIEWPORTS;

const LULA = "/politicos/lula/";
const FLAVIO = "/politicos/flavio-bolsonaro/";
const DOIS_LUGARES = "lula-2023-intervencao-federal-no-distrito-federal";
const NACIONAL = "lula-2002-eleito-presidente";

const mapa = (page: Page) => page.getByRole("region", { name: "Mapa", exact: true });
const controle = (page: Page, nome: string) =>
  page.getByRole("group", { name: "Controles do mapa" }).getByRole("button", { name: nome });

async function prepare(page: Page, device: Device, url: string) {
  await page.setViewportSize(VIEWPORTS[device]);
  await page.goto(url);
  // O indicador do servidor de desenvolvimento não faz parte da tela.
  await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() =>
    Array.from(document.images)
      .filter((imagem) => imagem.loading !== "lazy")
      .every((imagem) => imagem.complete && imagem.naturalWidth > 0),
  );
  if (device === "celular" && url.startsWith("/politicos/")) {
    await page.getByRole("group", { name: "Vista" }).getByRole("button", { name: "Mapa", exact: true }).click();
  }
}

async function waitForMap(page: Page) {
  await expect(page.locator(".maplibregl-canvas").first()).toBeVisible();
  await expect(page.getByText("Carregando o mapa…")).toBeHidden();
  // O mapa termina de desenhar a base um instante depois de carregar.
  await page.waitForTimeout(800);
}

const shot = async (page: Page, name: string, device: Device) => {
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/${name}--${device}.png` });
};

test.describe("recorte e seleção", () => {
  for (const device of ["computador", "tablet", "celular"] as const) {
    test(`o recorte no mapa, ${device}`, async ({ page }) => {
      await prepare(page, device, LULA);
      await waitForMap(page);
      await shot(page, "01-recorte-no-mapa", device);
    });
  }

  for (const device of ["computador", "celular"] as const) {
    test(`seletor de um lugar com vários acontecimentos, ${device}`, async ({ page }) => {
      await prepare(page, device, device === "celular" ? FLAVIO : LULA);
      await waitForMap(page);
      await mapa(page)
        .locator(device === "celular" ? '[data-marker^="estado-do-rio-de-janeiro"]' : '[data-marker="brasilia"]')
        .click();
      await expect(mapa(page).locator("[data-chooser]")).toBeVisible();
      await page.waitForTimeout(700);
      await shot(page, "02-seletor-de-lugar", device);

      if (device === "celular") {
        // Escolhido um acontecimento, o cartão toma o lugar da folha.
        await mapa(page).locator("[data-chooser] button[data-slug]").first().click();
        await expect(mapa(page).getByRole("button", { name: "Ler", exact: true })).toBeVisible();
        await page.waitForTimeout(700);
        await shot(page, "04-selecao-pelo-mapa", device);
      }
    });

    test(`acontecimentos sem ponto, ${device}`, async ({ page }) => {
      await prepare(page, device, LULA);
      await waitForMap(page);
      await mapa(page).getByRole("button", { name: /sem ponto no mapa/ }).click();
      await expect(mapa(page).locator("[data-chooser]")).toBeVisible();
      await shot(page, "05-sem-ponto-no-mapa", device);
    });

    test(`legenda, ${device}`, async ({ page }) => {
      await prepare(page, device, `${LULA}?acontecimento=${DOIS_LUGARES}`);
      await waitForMap(page);
      if (device === "celular") await mapa(page).getByRole("button", { name: "Fechar" }).click();
      await mapa(page).locator("details summary").click();
      await shot(page, "08-legenda", device);
    });
  }

  test("seleção pela lista: os dois lugares do acontecimento", async ({ page }) => {
    await prepare(page, "computador", `${LULA}?acontecimento=${DOIS_LUGARES}`);
    await waitForMap(page);
    await shot(page, "03-selecao-com-dois-lugares", "computador");
  });

  test("seleção pelo mapa, em computador", async ({ page }) => {
    await prepare(page, "computador", LULA);
    await waitForMap(page);
    await mapa(page).locator("button[data-marker][aria-pressed]").first().click();
    await page.waitForTimeout(700);
    await shot(page, "04-selecao-pelo-mapa", "computador");
  });

  test("acontecimento aberto sem ponto", async ({ page }) => {
    await prepare(page, "computador", `${LULA}?acontecimento=${NACIONAL}`);
    await waitForMap(page);
    await shot(page, "06-aberto-sem-ponto", "computador");
  });

  test("lugares vizinhos no zoom máximo", async ({ page }) => {
    await prepare(page, "computador", `${LULA}?acontecimento=lula-1975-eleito-presidente-do-sindicato`);
    await waitForMap(page);
    for (let passo = 0; passo < 3; passo += 1) {
      await controle(page, "Aproximar").click();
      await page.waitForTimeout(400);
    }
    await mapa(page).locator('[data-marker*="+"][data-selected]').click();
    await expect(mapa(page).locator("[data-chooser]")).toBeVisible();
    // A lista rola por dentro: desce até o segundo lugar aparecer.
    await mapa(page).locator('[data-chooser] [role="group"]').last().scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);
    await shot(page, "07-lugares-vizinhos-no-zoom-maximo", "computador");
  });

  test("recorte sem nenhum ponto", async ({ page }) => {
    await prepare(page, "computador", `${FLAVIO}?de=2021&ate=2021`);
    await waitForMap(page);
    await shot(page, "09-recorte-sem-pontos", "computador");
  });

  test("janela baixa", async ({ page }) => {
    await prepare(page, "computador-baixo", FLAVIO);
    await waitForMap(page);
    await shot(page, "13-janela-baixa", "computador-baixo");
  });
});

test.describe("falhas", () => {
  test("contornos que não carregaram", async ({ page }) => {
    await page.route(/terra.*\.geojson/, (route) => route.abort());
    await prepare(page, "computador", `${LULA}?de=2016&ate=2019`);
    await expect(mapa(page).locator("[data-map-fallback]")).toBeVisible();
    await shot(page, "10-contornos-nao-carregaram", "computador");
  });

  test("desenho interrompido pelo navegador", async ({ page }) => {
    await prepare(page, "computador", LULA);
    await waitForMap(page);
    await page.locator(".maplibregl-canvas").evaluate((no) => {
      const tela = no as HTMLCanvasElement;
      (tela.getContext("webgl2") ?? tela.getContext("webgl"))?.getExtension("WEBGL_lose_context")?.loseContext();
    });
    await expect(mapa(page).getByText("O navegador interrompeu o desenho do mapa.")).toBeVisible();
    await shot(page, "11-desenho-interrompido", "computador");
  });

  test("mapa indisponível em celular", async ({ page }) => {
    await page.route(/maplibre-gl.*\.js(\?|$)/, (route) => route.abort());
    await prepare(page, "celular", LULA);
    await expect(mapa(page).locator("[data-map-fallback]")).toBeVisible();
    await shot(page, "12-mapa-indisponivel", "celular");
  });
});

test.describe("página do acontecimento", () => {
  for (const device of ["computador", "celular"] as const) {
    test(`mapa de localização, ${device}`, async ({ page }) => {
      await prepare(page, device, `/acontecimentos/${DOIS_LUGARES}/`);
      const quadro = page.locator(".maplibregl-map");
      await quadro.scrollIntoViewIfNeeded();
      await waitForMap(page);
      await shot(page, "14-pagina-do-acontecimento", device);
    });
  }
});
