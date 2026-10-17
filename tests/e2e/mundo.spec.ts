// A Cidade do Voto (src/features/world, docs/MUNDO.md): entrar, chegar a um
// prédio, escolher, revelar e voltar, mais de uma vez, sem tela vazia e sem
// cena duplicada; e, sem a cena 3D, a lista com a instrução certa e as cinco
// escolhas contadas à parte na revelação.

import { expect, test, type Page } from "@playwright/test";

const praca = (page: Page) => page.locator("[data-mundo]");

/** Um navegador sem WebGL: o canvas recusa o contexto, o three.js não cria a cena, e a cidade cai na lista. */
async function semWebGL(page: Page) {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, tipo: string, ...resto: unknown[]) {
      if (typeof tipo === "string" && tipo.startsWith("webgl")) return null;
      return (original as (this: HTMLCanvasElement, tipo: string, ...resto: unknown[]) => unknown).call(this, tipo, ...resto);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
}

async function entrar(page: Page) {
  await page.goto("/mundo/");
  await page.getByRole("button", { name: "Entrar na cidade" }).click();
  await expect(praca(page)).toBeVisible();
}

/**
 * Anda para a frente até a porta do primeiro prédio, que fica logo à frente de
 * quem começa no centro da praça: segura a tecla até o botão de entrar
 * aparecer, e não por um tempo fixo, porque com o WebGL por software a cena
 * anda devagar. O personagem para na parede do prédio, dentro do raio da porta.
 */
async function andarAteAPorta(page: Page) {
  await page.keyboard.down("w");
  try {
    await expect(page.getByRole("button", { name: /^Entrar: / })).toBeVisible({ timeout: 30_000 });
  } finally {
    await page.keyboard.up("w");
  }
}

test.describe("Cidade do Voto com a cena", () => {
  test("entrar, escolher, revelar e voltar duas vezes: a cena é recriada no canvas novo, no mesmo lugar, sem canvas vazio nem cena duplicada", async ({ page }) => {
    const erros: string[] = [];
    page.on("pageerror", (erro) => erros.push(erro.message));
    await entrar(page);
    await expect(praca(page)).toHaveAttribute("data-cena", "pronta", { timeout: 30_000 });
    await expect(praca(page)).toHaveAttribute("data-cena-instancias", "1");
    await expect(page.locator("[data-instrucao-da-praca]")).toHaveText("Ande até a porta de um prédio.");

    await andarAteAPorta(page);
    await page.getByRole("button", { name: /^Entrar: / }).click();
    const predio = page.getByRole("dialog");
    await expect(predio).toBeVisible();
    await predio.locator('[data-escolha="A"]').click();
    await expect(page.getByText("Temas visitados: 1 de")).toBeVisible();

    for (const volta of [2, 3]) {
      await page.getByRole("button", { name: "Revelar" }).click();
      await expect(page.getByRole("heading", { name: "De quem era cada programa" })).toBeVisible();
      await expect(page.locator("[data-revelacao-resumo]")).toContainText("1 tema com o programa de");
      // A cena antiga foi descartada com a praça: nada desenha em um canvas que saiu da tela.
      await expect(page.locator("canvas")).toHaveCount(0);
      await page.locator("[data-voltar-a-cidade]").click();
      await expect(praca(page)).toHaveAttribute("data-cena", "pronta", { timeout: 30_000 });
      await expect(praca(page)).toHaveAttribute("data-cena-instancias", String(volta));
      await expect(page.locator("canvas")).toHaveCount(1);
      // O canvas novo recebeu a cena: o tamanho do desenho é o da tela, e não o padrão de um canvas sem desenho (300 por 150).
      const medidas = await page.locator("canvas").evaluate((el) => ({ largura: (el as HTMLCanvasElement).width, altura: (el as HTMLCanvasElement).height, cliente: el.clientWidth }));
      expect(medidas.largura).toBeGreaterThanOrEqual(medidas.cliente);
      expect(medidas.altura).toBeGreaterThan(150);
      // O personagem continua na porta em que estava: a escolha e a posição não se perdem com a revelação.
      await expect(page.getByRole("button", { name: /^Entrar: .* \(visitado\)$/ })).toBeVisible({ timeout: 5_000 });
      await expect(page.getByText("Temas visitados: 1 de")).toBeVisible();
    }
    expect(erros).toEqual([]);
  });
});

test.describe("Cidade do Voto sem a cena", () => {
  test("sem WebGL, a lista diz o que fazer, e as cinco escolhas aparecem separadas na revelação", async ({ page }) => {
    await semWebGL(page);
    await entrar(page);
    await expect(praca(page)).toHaveAttribute("data-mundo", "lista", { timeout: 30_000 });
    await expect(page.locator("[data-instrucao-da-praca]")).toHaveText("Toque em um prédio da lista para abrir os dois programas.");
    await expect(page.getByText("Ande até a porta de um prédio.")).toHaveCount(0);
    await expect(page.locator("canvas")).toHaveCount(0);

    const predios = praca(page).getByRole("list").first().getByRole("button");
    const total = await predios.count();
    expect(total).toBeGreaterThanOrEqual(3);

    const escolher = async (indice: number, escolha: string) => {
      await predios.nth(indice).click();
      const predio = page.getByRole("dialog");
      await expect(predio).toBeVisible();
      // As cinco escolhas estão na janela, com o aviso de que as frases são resumos editoriais.
      await expect(predio.locator("[data-escolha]")).toHaveCount(5);
      await expect(predio).toContainText("resumo editorial");
      await expect(predio).not.toContainText("sem edição");
      await predio.locator(`[data-escolha="${escolha}"]`).click();
      await expect(predio).toHaveCount(0);
    };
    await escolher(0, "nao-sei");
    await escolher(1, "partes");
    await escolher(2, "nenhum");
    await expect(page.getByText("Temas visitados: 3 de")).toBeVisible();
    await expect(predios.nth(0)).toContainText("visitado");

    await page.getByRole("button", { name: "Revelar" }).click();
    await expect(page.getByRole("heading", { name: "De quem era cada programa" })).toBeVisible();
    await expect(page.locator('[data-revelacao-escolha="nao-sei"]')).toContainText("ainda não sei");
    await expect(page.locator('[data-revelacao-escolha="partes"]')).toContainText("concordo com partes dos dois");
    await expect(page.locator('[data-revelacao-escolha="nenhum"]')).toContainText("nenhum dos dois");
    const resumo = page.locator("[data-revelacao-resumo]");
    await expect(resumo).toContainText("0 temas com o programa de");
    await expect(resumo).toContainText("1 sem nenhum dos dois");
    await expect(resumo).toContainText("1 com partes dos dois");
    await expect(resumo).toContainText("1 ainda sem decidir");
    await expect(resumo).not.toContainText(/vence|ganh|maioria/);

    await page.locator("[data-voltar-a-cidade]").click();
    await expect(praca(page)).toHaveAttribute("data-mundo", "lista");
    await expect(page.getByText("Temas visitados: 3 de")).toBeVisible();
  });
});
