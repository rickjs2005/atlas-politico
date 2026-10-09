// Capturas da prévia da fase 4, para docs/capturas/fase-4/. Rode com
// `npm run capture:preview`. Não é teste: não confere nada, só registra as
// telas nas quatro larguras de referência. As imagens guardadas são as da
// fase 4: rodar de novo as refaz com a interface atual. Para conferir o
// roteiro sem mexer nelas, aponte CAPTURE_DIR para outra pasta.

import { expect, test, type Page } from "@playwright/test";

const OUT = process.env.CAPTURE_DIR ?? "docs/capturas/fase-4";

const VIEWPORTS = {
  computador: { width: 1440, height: 900 },
  tablet: { width: 768, height: 1024 },
  celular: { width: 390, height: 844 },
  "celular-estreito": { width: 360, height: 800 },
} as const;
type Device = keyof typeof VIEWPORTS;

const PERFIL = "/politicos/lula/";
const TITULO = "Lula decreta intervenção federal na segurança pública do Distrito Federal";
const SLUG = "lula-2023-intervencao-federal-no-distrito-federal";
const ACONTECIMENTO = `/acontecimentos/${SLUG}/`;

async function prepare(page: Page, device: Device, url: string) {
  await page.setViewportSize(VIEWPORTS[device]);
  await page.goto(url);
  // O indicador do servidor de desenvolvimento não faz parte da tela.
  await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
  await page.evaluate(() => document.fonts.ready);
  // As imagens da primeira tela já chegaram: a captura não sai com moldura vazia.
  await page.waitForFunction(() =>
    Array.from(document.images)
      .filter((imagem) => imagem.loading !== "lazy")
      .every((imagem) => imagem.complete && imagem.naturalWidth > 0),
  );
}

async function waitForMap(page: Page) {
  await expect(page.locator(".maplibregl-canvas").first()).toBeVisible();
  await expect(page.getByText("Carregando o mapa…")).toBeHidden();
  // O mapa termina de desenhar a base um instante depois de carregar.
  await page.waitForTimeout(600);
}

/** Rola a página até o fim, para as imagens fora da primeira tela carregarem, e volta ao topo. */
async function loadWholePage(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForFunction(() => Array.from(document.images).every((imagem) => imagem.complete));
}

async function shot(page: Page, name: string, device: Device, fullPage = false) {
  if (fullPage) await loadWholePage(page);
  await page.screenshot({ path: `${OUT}/${name}--${device}.png`, fullPage });
}

for (const device of Object.keys(VIEWPORTS) as Device[]) {
  const largo = device === "computador";
  const estreito = device === "celular" || device === "celular-estreito";

  test.describe(device, () => {
    test("entrada", async ({ page }) => {
      await prepare(page, device, "/");
      await shot(page, "01-entrada", device);
      if (largo || device === "celular") await shot(page, "01-entrada-pagina-inteira", device, true);
    });

    test("exploração", async ({ page }) => {
      await prepare(page, device, PERFIL);
      if (!estreito) await waitForMap(page);
      await shot(page, "02-exploracao", device);

      // Seleção pela lista: o painel de leitura abre.
      await page.getByRole("region", { name: "Acontecimentos" }).getByRole("button", { name: TITULO }).click();
      await expect(page.getByRole("region", { name: "Leitura" }).getByRole("heading", { name: TITULO })).toBeVisible();
      await page.waitForTimeout(700);
      await shot(page, "03-exploracao-acontecimento-aberto", device);

      if (estreito) {
        await page.getByRole("button", { name: "Fechar" }).click();
        await page.getByRole("button", { name: "Mapa", exact: true }).click();
        await waitForMap(page);
        await shot(page, "04-exploracao-mapa", device);

        // Na vista do mapa, a seleção pela linha do tempo mostra o cartão sobre o mapa.
        await page.locator(`button[data-mark][data-slug="${SLUG}"]`).click();
        await expect(page.getByRole("button", { name: "Ler", exact: true })).toBeVisible();
        await page.waitForTimeout(1200);
        await shot(page, "04-exploracao-mapa-selecao", device);

        await page.getByRole("button", { name: "Perfil", exact: true }).click();
        await shot(page, "05-exploracao-perfil", device);
      }
    });

    test("acontecimento", async ({ page }) => {
      await prepare(page, device, ACONTECIMENTO);
      // Em tela larga o mapa de localização já está à vista.
      if (largo) await waitForMap(page);
      await shot(page, "06-acontecimento", device);
      await page.getByRole("heading", { name: /^Fontes/ }).scrollIntoViewIfNeeded();
      await shot(page, "07-acontecimento-fontes", device);
    });

    test("comparação", async ({ page }) => {
      await prepare(page, device, "/comparar/");
      await shot(page, "08-comparacao", device);
      if (largo || device === "celular") await shot(page, "08-comparacao-pagina-inteira", device, true);
    });
  });
}

test.describe("estados", () => {
  test("período sem registros", async ({ page }) => {
    await prepare(page, "computador", PERFIL);
    await waitForMap(page);
    await page.getByLabel("De", { exact: true }).selectOption("1996");
    await page.getByLabel("Até", { exact: true }).selectOption("2001");
    await page.waitForTimeout(300);
    await shot(page, "09-estado-periodo-sem-registros", "computador");
  });

  test("categoria marcada", async ({ page }) => {
    await prepare(page, "computador", PERFIL);
    await waitForMap(page);
    await page.getByRole("button", { name: /^Eleições/ }).click();
    await page.waitForTimeout(300);
    await shot(page, "09-estado-categoria-marcada", "computador");
  });

  test("mapa indisponível", async ({ page }) => {
    await page.route(/maplibre-gl.*\.js(\?|$)/, (route) => route.abort());
    for (const device of ["computador", "celular"] as const) {
      await prepare(page, device, PERFIL);
      if (device === "celular") await page.getByRole("button", { name: "Mapa", exact: true }).click();
      await expect(page.getByText("O mapa não pôde ser exibido neste navegador.")).toBeVisible();
      await shot(page, "10-estado-mapa-indisponivel", device);
    }
  });

  test("guia de estados", async ({ page }) => {
    await prepare(page, "computador", "/dev/previa/");
    await shot(page, "11-guia-de-estados", "computador", true);
  });

  test("página não encontrada", async ({ page }) => {
    await prepare(page, "celular", "/endereco-que-nao-existe/");
    await shot(page, "12-pagina-nao-encontrada", "celular");
  });
});
