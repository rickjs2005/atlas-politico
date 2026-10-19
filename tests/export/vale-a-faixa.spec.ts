// Vale a Faixa sobre a saída estática: a página de entrada do jogo e o hub
// não pedem o motor (regras, computador, desenho, som); ele só chega quando a
// pessoa escolhe o personagem. As páginas informativas continuam sem nada do
// jogo. Rode com `npm run build` e `npm run test:export`.

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { expect, test, type Page } from "@playwright/test";

const OUT = path.resolve(process.env.OUT_DIR ?? "out");
const CHUNKS = path.join(OUT, "_next", "static", "chunks");

// Os pacotes do motor: reconhecidos por uma fala do narrador, que só o motor importa.
const MOTOR_CHUNKS = readdirSync(CHUNKS)
  .filter((nome) => nome.endsWith(".js") && readFileSync(path.join(CHUNKS, nome), "utf8").includes("Chacoalhou a base"))
  .map((nome) => `/_next/static/chunks/${nome}`);

function vigiar(page: Page) {
  const pedidos: string[] = [];
  page.on("requestfinished", (request) => {
    const url = new URL(request.url());
    if (url.protocol === "http:") pedidos.push(url.pathname);
  });
  return { pedidos, doMotor: () => pedidos.filter((caminho) => MOTOR_CHUNKS.includes(caminho)) };
}

async function assentar(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(600);
}

test.describe("Vale a Faixa na exportação", () => {
  test("o build tem o motor em pacotes à parte", () => {
    expect(MOTOR_CHUNKS.length, "pacotes do motor").toBeGreaterThan(0);
  });

  for (const rota of ["/", "/jogo/", "/comparar/", "/metodologia/", "/jogo/vale-a-faixa/"]) {
    test(`${rota} não pede o motor do jogo`, async ({ page }) => {
      const visto = vigiar(page);
      await page.goto(rota);
      await assentar(page);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(visto.doMotor(), "pedidos do motor").toEqual([]);
    });
  }

  test("o motor chega quando a pessoa vai escolher o personagem, e a partida nasce no build", async ({ page }) => {
    const visto = vigiar(page);
    await page.goto("/jogo/vale-a-faixa/");
    await assentar(page);
    await page.locator("[data-escolher-candidato]").click();
    await expect.poll(() => visto.doMotor().length, { timeout: 10_000 }).toBeGreaterThan(0);
    await page.locator('[data-escolha="lula"]').click();
    await expect(page.locator("[data-faixa]")).toHaveAttribute("data-pronto", "sim", { timeout: 30_000 });
    await page.locator("[data-comecar-luta]").click();
    await expect(page.locator("[data-faixa]")).toHaveAttribute("data-fase", "luta", { timeout: 15_000 });
    const medidas = await page.locator("canvas").evaluate((el) => ({ largura: (el as HTMLCanvasElement).width, cliente: el.clientWidth }));
    expect(medidas.largura).toBeGreaterThanOrEqual(medidas.cliente);
  });
});
