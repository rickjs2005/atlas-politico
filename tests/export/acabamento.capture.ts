// Capturas da fase 8 (acabamento visual e desempenho), para docs/capturas/fase-8/.
// Tiradas da saída estática: `npm run build` e `npm run capture:finish`.
// Não é teste: não confere nada, só registra as telas. Os testes sobre a saída
// estática ficam em `tests/export/carregamento.spec.ts`.

import { expect, test, type Page } from "@playwright/test";

const OUT = process.env.CAPTURE_DIR ?? "docs/capturas/fase-8";

const VIEWPORTS = {
  computador: { width: 1440, height: 900 },
  tablet: { width: 768, height: 1024 },
  celular: { width: 390, height: 844 },
  "celular-estreito": { width: 360, height: 800 },
} as const;
type Device = keyof typeof VIEWPORTS;
const TODOS = Object.keys(VIEWPORTS) as Device[];

const LULA = "/politicos/lula/";
const ACONTECIMENTO = "lula-2023-intervencao-federal-no-distrito-federal";

async function prepare(page: Page, device: Device, url: string) {
  await page.setViewportSize(VIEWPORTS[device]);
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() =>
    Array.from(document.images)
      .filter((imagem) => imagem.loading !== "lazy")
      .every((imagem) => imagem.complete && imagem.naturalWidth > 0),
  );
  // O endereço é lido depois da hidratação: a consulta entra um instante depois.
  await page.waitForTimeout(600);
}

/** Espera o mapa que estiver na tela terminar de carregar. */
async function mapReady(page: Page) {
  await expect(page.locator(".maplibregl-canvas").first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText("Carregando o mapa…")).toBeHidden({ timeout: 30_000 });
  await page.waitForTimeout(900);
}

async function toTop(page: Page, seletor: string, folga = 0) {
  await page.locator(seletor).first().evaluate((no, margem) => {
    window.scrollTo(0, no.getBoundingClientRect().top + window.scrollY - margem);
  }, folga);
}

const shot = async (page: Page, name: string, device: Device, fullPage = false) => {
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/${name}--${device}.png`, fullPage });
};

const vista = (page: Page, nome: string) =>
  page.getByRole("group", { name: "Vista" }).getByRole("button", { name: nome, exact: true });

test.describe("entrada", () => {
  for (const device of TODOS) {
    test(`entrada, ${device}`, async ({ page }) => {
      await prepare(page, device, "/");
      await shot(page, "01-entrada", device);
    });
  }

  for (const device of ["computador", "celular"] as const) {
    test(`entrada até o rodapé, ${device}`, async ({ page }) => {
      await prepare(page, device, "/");
      await shot(page, "01-entrada-pagina-inteira", device, true);
    });
  }
});

test.describe("exploração", () => {
  for (const device of TODOS) {
    test(`exploração sem seleção, ${device}`, async ({ page }) => {
      await prepare(page, device, LULA);
      if (device === "computador" || device === "tablet") await mapReady(page);
      await shot(page, "02-exploracao", device);
    });
  }

  test("o outro perfil, na mesma composição", async ({ page }) => {
    await prepare(page, "computador", "/politicos/flavio-bolsonaro/");
    await mapReady(page);
    await shot(page, "02-exploracao-flavio-bolsonaro", "computador");
  });

  for (const device of ["computador", "tablet", "celular"] as const) {
    test(`acontecimento aberto, ${device}`, async ({ page }) => {
      await prepare(page, device, `${LULA}?de=2016&ate=2023&acontecimento=${ACONTECIMENTO}`);
      if (device !== "celular") await mapReady(page);
      await shot(page, "03-acontecimento-aberto", device);
    });
  }

  for (const device of ["celular", "celular-estreito"] as const) {
    test(`vista do mapa, ${device}`, async ({ page }) => {
      await prepare(page, device, LULA);
      await vista(page, "Mapa").click();
      await mapReady(page);
      await shot(page, "04-mapa", device);
    });
  }

  test("vista do mapa com o acontecimento marcado", async ({ page }) => {
    await prepare(page, "celular", `${LULA}?acontecimento=${ACONTECIMENTO}`);
    await vista(page, "Mapa").click();
    await mapReady(page);
    await shot(page, "04-mapa-selecao", "celular");
  });

  test("vista do perfil", async ({ page }) => {
    await prepare(page, "celular", LULA);
    await vista(page, "Perfil").click();
    await shot(page, "05-perfil", "celular");
  });

  test("filtros abertos em celular", async ({ page }) => {
    await prepare(page, "celular", `${LULA}?de=2016&ate=2022`);
    await page.getByRole("region", { name: "Recorte" }).getByRole("button", { name: /^Filtros/ }).click();
    await shot(page, "06-filtros", "celular");
  });

  for (const device of ["computador", "celular"] as const) {
    test(`recorte sem registros, ${device}`, async ({ page }) => {
      await prepare(page, device, `${LULA}?de=1996&ate=2001`);
      if (device === "computador") await mapReady(page);
      await shot(page, "07-recorte-sem-registros", device);
    });

    test(`mapa indisponível, ${device}`, async ({ page }) => {
      // Um navegador sem WebGL: a lista de lugares assume a área do mapa.
      await page.addInitScript(() => {
        const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, tipo: string, ...resto: unknown[]) {
          if (tipo.startsWith("webgl")) return null;
          return (original as (...args: unknown[]) => unknown).call(this, tipo, ...resto);
        } as typeof original;
      });
      await prepare(page, device, `${LULA}?de=2016&ate=2023`);
      if (device === "celular") await vista(page, "Mapa").click();
      await expect(page.locator("[data-map-fallback]").first()).toBeVisible({ timeout: 30_000 });
      await shot(page, "08-mapa-indisponivel", device);
    });
  }
});

test.describe("comparação", () => {
  for (const device of TODOS) {
    test(`comparação com período, ${device}`, async ({ page }) => {
      await prepare(page, device, "/comparar/?de=2003&ate=2022");
      await shot(page, "09-comparacao", device);
    });
  }

  for (const device of ["computador", "celular"] as const) {
    test(`colunas da comparação, ${device}`, async ({ page }) => {
      await prepare(page, device, "/comparar/?de=2003&ate=2022");
      await toTop(page, "[data-trajetoria]", device === "celular" ? 70 : 90);
      await shot(page, "09-comparacao-colunas", device);
    });
  }
});

test.describe("leitura", () => {
  for (const device of TODOS) {
    test(`página do acontecimento, ${device}`, async ({ page }) => {
      await prepare(page, device, `/acontecimentos/${ACONTECIMENTO}/`);
      if (device === "computador") await mapReady(page);
      await shot(page, "10-pagina-do-acontecimento", device);
    });
  }

  for (const device of ["computador", "celular"] as const) {
    test(`fontes na página do acontecimento, ${device}`, async ({ page }) => {
      await prepare(page, device, `/acontecimentos/${ACONTECIMENTO}/`);
      await toTop(page, "#fontes", 24);
      await page.waitForTimeout(600);
      await shot(page, "10-pagina-do-acontecimento-fontes", device);
    });

    test(`metodologia, ${device}`, async ({ page }) => {
      await prepare(page, device, "/metodologia/");
      await shot(page, "11-metodologia", device);
    });

    test(`página não encontrada, ${device}`, async ({ page }) => {
      await prepare(page, device, "/endereco-que-nao-existe/");
      await shot(page, "12-pagina-nao-encontrada", device);
    });
  }
});
