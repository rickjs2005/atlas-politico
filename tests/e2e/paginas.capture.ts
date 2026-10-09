// Capturas da fase 7 (comparação, perfis, páginas de acontecimento,
// compartilhamento e metodologia), para docs/capturas/fase-7/. Rode com
// `npm run capture:pages`. Não é teste: não confere nada, só registra as telas.
// Os testes ficam em `tests/e2e/comparacao.spec.ts` e `tests/e2e/paginas.spec.ts`.

import { expect, test, type Page } from "@playwright/test";

const OUT = process.env.CAPTURE_DIR ?? "docs/capturas/fase-7";

const VIEWPORTS = {
  computador: { width: 1440, height: 900 },
  tablet: { width: 768, height: 1024 },
  celular: { width: 390, height: 844 },
} as const;
type Device = keyof typeof VIEWPORTS;

const COMPARAR = "/comparar/";
const RECORTE = "de=2016&ate=2022&categorias=eleicoes";
const ACONTECIMENTO = "lula-2018-prisao-em-curitiba";
const CONTEXTO = "de=2016&ate=2019&categorias=marcos-historicos";
const COMPARTILHADO = "eleicao-2026-primeiro-turno";

const coluna = (page: Page, slug: string) => page.locator(`[data-trajetoria="${slug}"]`);

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
  // O endereço é lido depois da hidratação: a consulta entra um instante depois.
  await page.waitForTimeout(500);
}

/** Leva um elemento ao topo da tela, abaixo da barra de recorte presa. */
async function toTop(page: Page, seletor: string, folga = 0) {
  await page.locator(seletor).first().evaluate((no, margem) => {
    window.scrollTo(0, no.getBoundingClientRect().top + window.scrollY - margem);
  }, folga);
}

const shot = async (page: Page, name: string, device: Device) => {
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/${name}--${device}.png` });
};

test.describe("comparação", () => {
  for (const device of ["computador", "tablet", "celular"] as const) {
    test(`comparação, todo o período, ${device}`, async ({ page }) => {
      await prepare(page, device, COMPARAR);
      await shot(page, "01-comparacao", device);
    });
  }

  for (const device of ["computador", "celular"] as const) {
    test(`mesmo período e mesmas categorias, ${device}`, async ({ page }) => {
      await prepare(page, device, `${COMPARAR}?${RECORTE}`);
      await toTop(page, '[aria-label="Recorte"]');
      await shot(page, "02-periodo-e-categorias", device);
    });

    test(`colunas das duas pessoas, ${device}`, async ({ page }) => {
      await prepare(page, device, `${COMPARAR}?de=2003&ate=2010`);
      await toTop(page, "[data-trajetoria]", device === "celular" ? 70 : 90);
      await shot(page, "03-colunas-no-mesmo-recorte", device);
    });
  }

  test("recorte sem registros", async ({ page }) => {
    await prepare(page, "computador", `${COMPARAR}?de=1996&ate=2001`);
    await toTop(page, "[data-trajetoria]", 90);
    await shot(page, "04-recorte-sem-registros", "computador");
  });

  test("fontes de um cargo e documentos do recorte", async ({ page }) => {
    await prepare(page, "computador", `${COMPARAR}?de=2019&ate=2022`);
    await coluna(page, "lula").locator('[data-secao="cargos"] summary').first().click();
    await coluna(page, "flavio-bolsonaro").locator('[data-secao="cargos"] summary').first().click();
    await toTop(page, '[data-secao="cargos"]', 90);
    await shot(page, "05-fontes-de-um-cargo", "computador");
  });

  test("filtros em celular", async ({ page }) => {
    await prepare(page, "celular", `${COMPARAR}?${RECORTE}`);
    await toTop(page, '[aria-label="Recorte"]');
    await page.getByRole("region", { name: "Recorte" }).getByRole("button", { name: /^Filtros/ }).click();
    await shot(page, "06-filtros", "celular");
  });
});

test.describe("perfil", () => {
  test("perfil na exploração, com as fontes de um cargo abertas", async ({ page }) => {
    await prepare(page, "computador", "/politicos/flavio-bolsonaro/");
    await expect(page.locator(".maplibregl-canvas").first()).toBeVisible();
    await expect(page.getByText("Carregando o mapa…")).toBeHidden();
    const painel = page.locator('[data-perfil="flavio-bolsonaro"]');
    await painel.locator('[data-secao="cargos"] summary').nth(1).click();
    // Rola só o painel, e não a página: o cabeçalho e o mapa ficam onde estão.
    await painel.locator('[data-secao="cargos"]').evaluate((no) => {
      const area = no.closest(".explorer-painel");
      if (area) area.scrollTop = (no as HTMLElement).offsetTop - 16;
    });
    await page.waitForTimeout(800);
    await shot(page, "07-perfil", "computador");
  });

  test("perfil em celular", async ({ page }) => {
    await prepare(page, "celular", "/politicos/lula/");
    await page.getByRole("group", { name: "Vista" }).getByRole("button", { name: "Perfil", exact: true }).click();
    await shot(page, "07-perfil", "celular");
  });
});

test.describe("acontecimento", () => {
  for (const device of ["computador", "celular"] as const) {
    test(`página do acontecimento, vindo de uma consulta, ${device}`, async ({ page }) => {
      await prepare(page, device, `/acontecimentos/${ACONTECIMENTO}/?${CONTEXTO}`);
      await shot(page, "08-acontecimento-com-retorno", device);
    });
  }

  test("fontes, revisão, edição e caminhos", async ({ page }) => {
    await prepare(page, "computador", `/acontecimentos/${ACONTECIMENTO}/`);
    await toTop(page, "#fontes", 24);
    await shot(page, "09-fontes-revisao-e-edicao", "computador");
  });

  test("acontecimento das duas pessoas, vindo da comparação", async ({ page }) => {
    await prepare(page, "celular", `/acontecimentos/${COMPARTILHADO}/?de=2019&categorias=eleicoes&origem=comparar`);
    await shot(page, "10-retorno-a-comparacao", "celular");
  });

  test("link copiado", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await prepare(page, "computador", `/acontecimentos/${ACONTECIMENTO}/`);
    await page.locator("article header").getByRole("button", { name: "Copiar link" }).click();
    await expect(page.locator("article header").getByRole("button", { name: "Link copiado" })).toBeVisible();
    await shot(page, "11-link-copiado", "computador");
  });

  test("sem conseguir copiar, o link em um campo", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
    });
    await prepare(page, "celular", `/acontecimentos/${ACONTECIMENTO}/`);
    await page.locator("article header").getByRole("button", { name: "Copiar link" }).click();
    await expect(page.locator("article header").getByLabel(/Não foi possível copiar daqui/)).toBeVisible();
    await shot(page, "12-link-em-campo", "celular");
  });
});

test.describe("metodologia", () => {
  for (const device of ["computador", "celular"] as const) {
    test(`metodologia, ${device}`, async ({ page }) => {
      await prepare(page, device, "/metodologia/");
      await shot(page, "13-metodologia", device);
    });
  }

  test("revisão efetivamente feita", async ({ page }) => {
    await prepare(page, "computador", "/metodologia/");
    await toTop(page, "#fontes", 16);
    await shot(page, "14-fontes-e-revisao", "computador");
  });

  test("modelo de correção com o link do acontecimento", async ({ page }) => {
    await prepare(page, "computador", `/metodologia/?acontecimento=${ACONTECIMENTO}`);
    await toTop(page, "#correcao", 16);
    await shot(page, "15-modelo-de-correcao", "computador");
  });

  test("fontes desta edição", async ({ page }) => {
    await prepare(page, "computador", "/metodologia/");
    await toTop(page, "#catalogo", 16);
    await shot(page, "16-fontes-desta-edicao", "computador");
  });
});
