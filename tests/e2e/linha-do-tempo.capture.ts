// Capturas da navegação temporal (fase 5), para docs/capturas/fase-5/. Rode
// com `npm run capture:timeline`. Não é teste: não confere nada, só registra
// as telas. Quase todos os estados são abertos pelo próprio endereço, que é
// como a consulta se restaura.

import { expect, test, type Page } from "@playwright/test";

const OUT = process.env.CAPTURE_DIR ?? "docs/capturas/fase-5";

const VIEWPORTS = {
  computador: { width: 1440, height: 900 },
  "computador-baixo": { width: 1280, height: 720 },
  tablet: { width: 768, height: 1024 },
  celular: { width: 390, height: 844 },
} as const;
type Device = keyof typeof VIEWPORTS;

const LULA = "/politicos/lula/";
const FLAVIO = "/politicos/flavio-bolsonaro/";
const ABERTO = "lula-2018-prisao-em-curitiba";

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
  // A lista já está no HTML; a consulta do endereço é aplicada logo depois.
  await expect(page.getByRole("region", { name: "Acontecimentos", exact: true })).toBeAttached();
  await page.waitForTimeout(400);
}

async function waitForMap(page: Page) {
  await expect(page.locator(".maplibregl-canvas").first()).toBeVisible();
  await expect(page.getByText("Carregando o mapa…")).toBeHidden();
  // O mapa termina de desenhar a base um instante depois de carregar.
  await page.waitForTimeout(700);
}

const shot = (page: Page, name: string, device: Device) =>
  page.screenshot({ path: `${OUT}/${name}--${device}.png` });

const comMapa = (device: Device) => device !== "celular";

test.describe("linha do tempo e lista", () => {
  for (const device of ["computador", "tablet", "celular"] as const) {
    test(`todo o período, ${device}`, async ({ page }) => {
      await prepare(page, device, LULA);
      if (comMapa(device)) await waitForMap(page);
      await shot(page, "01-linha-do-tempo", device);
    });
  }

  for (const device of ["computador", "celular"] as const) {
    test(`um ano, ${device}`, async ({ page }) => {
      await prepare(page, device, `${LULA}?de=2018&ate=2018`);
      if (comMapa(device)) await waitForMap(page);
      await shot(page, "02-um-ano", device);
    });

    test(`intervalo e categorias, ${device}`, async ({ page }) => {
      await prepare(page, device, `${LULA}?de=2016&ate=2022&categorias=eleicoes,marcos-historicos`);
      if (comMapa(device)) await waitForMap(page);
      await shot(page, "04-intervalo-e-categorias", device);
    });

    test(`cargos e partidos do período, ${device}`, async ({ page }) => {
      await prepare(page, device, `${FLAVIO}?de=2021&ate=2021`);
      if (comMapa(device)) await waitForMap(page);
      await page.getByText("Cargos e partidos em 2021").click();
      await page.waitForTimeout(200);
      await shot(page, "05-cargos-e-partidos-do-periodo", device);
    });

    test(`período sem registros, ${device}`, async ({ page }) => {
      await prepare(page, device, `${LULA}?de=1996&ate=2001`);
      if (comMapa(device)) await waitForMap(page);
      await shot(page, "08-periodo-sem-registros", device);
    });
  }

  test("arraste em andamento no eixo", async ({ page }) => {
    await prepare(page, "computador", LULA);
    await waitForMap(page);
    const caixa = (await page.locator("[data-brush]").boundingBox())!;
    const y = caixa.y + caixa.height / 2;
    // De 2003 a 2010, em um eixo que vai de 1975 a 2026.
    const x = (ano: number) => caixa.x + (caixa.width * (ano - 1975 + 0.5)) / 52;
    await page.mouse.move(x(2003), y);
    await page.mouse.down();
    await page.mouse.move(x(2010), y, { steps: 8 });
    await page.waitForTimeout(200);
    await shot(page, "03-arraste-em-andamento", "computador");
    await page.mouse.up();
  });

  test("lacunas e datas parciais na lista", async ({ page }) => {
    await prepare(page, "celular", LULA);
    // O trecho da lista com data só de ano, ordem em aberto e a primeira lacuna.
    await page.locator("li[data-lacuna]").first().scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, 120);
    await page.waitForTimeout(300);
    await shot(page, "09-lacunas-e-datas-parciais", "celular");
  });
});

test.describe("painel e seleção", () => {
  for (const device of ["computador", "tablet", "celular"] as const) {
    test(`acontecimento aberto pelo endereço, ${device}`, async ({ page }) => {
      await prepare(page, device, `${LULA}?de=2016&ate=2019&acontecimento=${ABERTO}`);
      if (comMapa(device)) await waitForMap(page);
      await page.waitForTimeout(600);
      await shot(page, "06-painel-do-acontecimento", device);
    });
  }

  test("acontecimento que sai do recorte", async ({ page }) => {
    await prepare(page, "computador", `${LULA}?de=2016&ate=2019&acontecimento=${ABERTO}`);
    await waitForMap(page);
    await page.getByRole("region", { name: "Recorte" }).getByRole("button", { name: /^Eleições/ }).click();
    await page.waitForTimeout(400);
    await shot(page, "07-acontecimento-fora-do-recorte", "computador");
  });

  test("troca de pessoa nos filtros, em celular", async ({ page }) => {
    await prepare(page, "celular", `${LULA}?de=2019&ate=2022`);
    await page.getByRole("button", { name: /^Filtros/ }).click();
    await page.waitForTimeout(200);
    await shot(page, "10-troca-de-pessoa", "celular");
  });

  test("leitura sem o mapa", async ({ page }) => {
    await page.route(/maplibre-gl.*\.js(\?|$)/, (route) => route.abort());
    await prepare(page, "computador", `${LULA}?de=2016&ate=2019&acontecimento=${ABERTO}`);
    await expect(page.getByText("O mapa não pôde ser exibido neste navegador.")).toBeVisible();
    await shot(page, "11-leitura-sem-o-mapa", "computador");
  });

  test("janela baixa", async ({ page }) => {
    await prepare(page, "computador-baixo", FLAVIO);
    await waitForMap(page);
    await shot(page, "12-janela-baixa", "computador-baixo");
  });
});
