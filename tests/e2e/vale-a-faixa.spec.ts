// Vale a Faixa (src/features/faixa, docs/VALE-A-FAIXA.md): a jornada no
// navegador. A abertura e a escolha; a partida com cada personagem, até o
// fim, com o computador buscando a faixa sozinho; o teclado (andar, pegar a
// escada, posicionar, subir e puxar com o comando segurado); a pausa por Esc,
// a revanche e a volta ao atlas; o toque no celular emulado, com teclado
// junto; o redimensionamento sem perder os controles; e nenhum erro de
// console. As regras em si estão em tests/faixa.test.ts.

import { expect, test, type Page } from "@playwright/test";

const raiz = (page: Page) => page.locator("[data-faixa]");
const estados = async (page: Page) => (await page.locator("canvas").getAttribute("data-estados"))!.split("|");

function vigiarErros(page: Page): string[] {
  const erros: string[] = [];
  page.on("pageerror", (erro) => erros.push(erro.message));
  page.on("console", (mensagem) => {
    if (mensagem.type() === "error") erros.push(mensagem.text());
  });
  return erros;
}

/** Entra, escolhe e fecha o tutorial: a contagem começa. */
async function comecar(page: Page, slug: "lula" | "flavio-bolsonaro", toque = false, semComputador = false) {
  await page.goto(semComputador ? "/jogo/vale-a-faixa/?computador=parado" : "/jogo/vale-a-faixa/");
  await expect(raiz(page)).toHaveAttribute("data-faixa", "inicio");
  const acionar = async (seletor: string) => (toque ? page.locator(seletor).tap() : page.locator(seletor).click());
  await acionar("[data-escolher-candidato]");
  await expect(raiz(page)).toHaveAttribute("data-faixa", "escolha");
  await acionar(`[data-escolha="${slug}"]`);
  await expect(raiz(page)).toHaveAttribute("data-faixa", "partida");
  await expect(raiz(page)).toHaveAttribute("data-pronto", "sim", { timeout: 30_000 });
  await expect(page.locator('[data-janela="tutorial"]')).toBeVisible();
  await acionar("[data-comecar-luta]");
  await expect(raiz(page)).toHaveAttribute("data-fase", "luta", { timeout: 15_000 });
}

/** Segura uma tecla até a condição valer, e solta sempre. */
async function segurarAte(page: Page, tecla: string, condicao: () => Promise<boolean>, limite = 15_000) {
  await page.keyboard.down(tecla);
  try {
    await expect.poll(condicao, { timeout: limite }).toBe(true);
  } finally {
    await page.keyboard.up(tecla);
  }
}

test.describe("Vale a Faixa", () => {
  test("a entrada diz que é sátira, a escolha tem os dois e o hub do jogo leva até aqui", async ({ page }) => {
    await page.goto("/jogo/");
    await expect(page.locator('[data-caminho="vale-a-faixa"]')).toContainText("Sátira interativa");
    await page.locator("[data-abrir-vale-a-faixa]").click();
    await expect(page).toHaveURL(/\/jogo\/vale-a-faixa\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Vale a Faixa");
    await expect(raiz(page)).toContainText("Sátira interativa");
    await expect(raiz(page)).toContainText("mesmas capacidades");
    await page.locator("[data-escolher-candidato]").click();
    await expect(page.locator("[data-escolha]")).toHaveCount(2);
    await expect(page.locator('[data-escolha="lula"]')).toContainText("Lula");
    await expect(page.locator('[data-escolha="flavio-bolsonaro"]')).toContainText("Flávio Bolsonaro");
  });

  for (const slug of ["lula", "flavio-bolsonaro"] as const) {
    test(`com ${slug}, parado, o computador busca a escada, posiciona, sobe, puxa e vence; a vitória aparece uma vez, e a revanche recomeça`, async ({ page }) => {
      const erros = vigiarErros(page);
      await comecar(page, slug);
      const vistos = new Set<string>();
      await expect
        .poll(
          async () => {
            const [, computador, escada] = await estados(page);
            vistos.add(`${computador}/${escada}`);
            return page.locator("[data-faixa]").getAttribute("data-fase");
          },
          { timeout: 90_000 },
        )
        .toBe("fim");
      const sequencia = [...vistos];
      expect(sequencia.some((v) => v.startsWith("carregando/carregada")), "carregou a escada").toBe(true);
      expect(sequencia.some((v) => v.startsWith("subindo/emPe")), "subiu").toBe(true);
      expect(sequencia.some((v) => v.startsWith("noTopo/emPe")), "chegou ao topo").toBe(true);
      await expect(raiz(page)).toHaveAttribute("data-vencedor", "1");
      await expect(page.locator('[data-janela="fim"]')).toHaveCount(1);
      await expect(page.locator('[data-resultado="derrota"]')).toBeVisible();
      // O fim não muda mais: o estado fica em derrota e vitória.
      await page.waitForTimeout(800);
      expect((await estados(page)).slice(0, 2)).toEqual(["derrota", "vitoria"]);

      await page.locator("[data-revanche]").click();
      await expect(raiz(page)).toHaveAttribute("data-fase", "contagem");
      await expect(page.locator('[data-janela="fim"]')).toHaveCount(0);
      // Na contagem, os dois estão em pé de novo, parados, e a escada voltou a uma lateral.
      expect((await estados(page)).slice(0, 3)).toEqual(["parado", "parado", "caida"]);
      await expect(raiz(page)).toHaveAttribute("data-fase", "luta", { timeout: 15_000 });
      expect(erros).toEqual([]);
    });
  }

  test("pelo teclado: andar, pegar a escada, levar à zona, posicionar, subir, puxar com E segurado e vencer", async ({ page }) => {
    test.setTimeout(120_000);
    const erros = vigiarErros(page);
    // Para a prova ser determinística, o computador fica parado: a pessoa joga sozinha, e a partida é lida pelo canvas.
    await comecar(page, "lula", false, true);
    // A escada começa em uma lateral; a dica diz quando dá para pegar.
    const estadoDaEscada = async () => (await estados(page))[2];
    const dica = () => raiz(page).getAttribute("data-dica");
    // Anda até a escada: primeiro para a esquerda; se a dica não vier, ela está à direita.
    await page.keyboard.down("a");
    const chegouEsquerda = await expect
      .poll(dica, { timeout: 4_000 })
      .toBe("pegarEscada")
      .then(() => true)
      .catch(() => false);
    await page.keyboard.up("a");
    if (!chegouEsquerda) await segurarAte(page, "d", async () => (await dica()) === "pegarEscada", 10_000);
    await page.keyboard.press("e");
    await expect.poll(estadoDaEscada).toBe("carregada");
    await expect.poll(dica).toMatch(/posicionarEscada|soltarEscada/);
    // Leva até a marca: a dica vira "posicionar".
    const paraOCentro = chegouEsquerda ? "d" : "a";
    await segurarAte(page, paraOCentro, async () => (await dica()) === "posicionarEscada", 15_000);
    await page.keyboard.press("e");
    await expect.poll(estadoDaEscada).toBe("emPe");
    await expect.poll(dica).toBe("subir");
    await page.keyboard.press("e");
    await expect.poll(async () => (await estados(page))[0]).toBe("subindo");
    await expect(raiz(page)).toHaveAttribute("data-na-escada", "sim");
    await segurarAte(page, "ArrowUp", async () => (await estados(page))[0] === "noTopo", 10_000);
    await expect.poll(dica).toMatch(/puxarFaixa|foraDoAlcance/);
    // Sem segurar, nada avança; com E segurado, a barra enche até a faixa soltar.
    await page.waitForTimeout(400);
    expect(Number((await estados(page))[3])).toBe(0);
    await segurarAte(page, "e", async () => (await raiz(page).getAttribute("data-fase")) === "fim", 20_000);
    await expect(raiz(page)).toHaveAttribute("data-vencedor", "0");
    await expect(page.locator('[data-resultado="vitoria"]')).toBeVisible();
    expect(erros).toEqual([]);
  });

  test("Esc abre a pausa e congela a partida; Continuar volta; Voltar ao Atlas leva ao hub e descarta a cena", async ({ page }) => {
    const erros = vigiarErros(page);
    await comecar(page, "lula");
    await page.keyboard.press("Escape");
    await expect(page.locator('[data-janela="pausa"]')).toBeVisible();
    await expect(raiz(page)).toHaveAttribute("data-pausado", "sim");
    const antes = await estados(page);
    await page.waitForTimeout(700);
    expect(await estados(page)).toEqual(antes);
    await page.locator("[data-ver-controles]").click();
    await expect(page.locator('[data-janela="controles"]')).toContainText("J ou Z");
    await page.getByRole("button", { name: "Voltar" }).click();
    await page.locator("[data-continuar]").click();
    await expect(raiz(page)).toHaveAttribute("data-pausado", "nao");
    await expect(page.locator('[data-janela="pausa"]')).toHaveCount(0);
    // Perder o foco também pausa.
    await page.evaluate(() => window.dispatchEvent(new Event("blur")));
    await expect(page.locator('[data-janela="pausa"]')).toBeVisible();
    await page.locator("[data-voltar-ao-atlas]").click();
    await expect(page).toHaveURL(/\/jogo\/$/);
    await expect(page.locator("canvas")).toHaveCount(0);
    expect(erros).toEqual([]);
  });

  test("no celular emulado: botões de toque sem sobreposição, toque e teclado ao mesmo tempo, e a página não rola", async ({ browser }) => {
    const contexto = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
    const page = await contexto.newPage();
    const erros = vigiarErros(page);
    // O computador fica parado: o teste é dos controles, e um empurrão do adversário mudaria a posição lida.
    await comecar(page, "flavio-bolsonaro", true, true);
    const controles = page.locator("[data-controles-de-toque]");
    await expect(controles).toBeVisible();
    const botoes = await page.locator("[data-controle]").all();
    const caixas = await Promise.all(botoes.map((botao) => botao.boundingBox()));
    for (const caixa of caixas) {
      expect(caixa).not.toBeNull();
      expect(caixa!.width).toBeGreaterThanOrEqual(44);
      expect(caixa!.height).toBeGreaterThanOrEqual(44);
      expect(caixa!.x + caixa!.width).toBeLessThanOrEqual(390.5);
    }
    for (let i = 0; i < caixas.length; i += 1) {
      for (let j = i + 1; j < caixas.length; j += 1) {
        const a = caixas[i]!;
        const b = caixas[j]!;
        const sobrepostos = a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
        expect(sobrepostos, `botões ${i} e ${j} sobrepostos`).toBe(false);
      }
    }
    // Um dedo segurando a seta anda; ao mesmo tempo, o teclado bate; soltar o dedo para.
    const x = async () => Number((await estados(page))[4]);
    const x0 = await x();
    const direita = page.locator('[data-controle="direita"]');
    const caixa = (await direita.boundingBox())!;
    const dedo = await contexto.newCDPSession(page);
    const ponto = { x: caixa.x + caixa.width / 2, y: caixa.y + caixa.height / 2 };
    await dedo.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [ponto] });
    try {
      await expect.poll(x, { timeout: 4_000 }).toBeGreaterThan(x0);
      await page.keyboard.press("j");
      await expect.poll(async () => (await estados(page))[0], { timeout: 3_000 }).toBe("golpe");
    } finally {
      await dedo.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    }
    await expect.poll(async () => (await estados(page))[0], { timeout: 3_000 }).toMatch(/parado|atingido|defesa/);
    const parou = await x();
    await page.waitForTimeout(400);
    expect(Math.abs((await x()) - parou)).toBeLessThanOrEqual(2);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    expect(await page.evaluate(() => getComputedStyle(document.querySelector("[data-faixa]")!).touchAction)).toBe("none");
    expect(erros).toEqual([]);
    await contexto.close();
  });

  test("redimensionar a janela mantém o canvas do tamanho da tela e os controles", async ({ page }) => {
    const erros = vigiarErros(page);
    await comecar(page, "lula");
    const medidas = () => page.locator("canvas").evaluate((el) => ({ largura: (el as HTMLCanvasElement).width, cliente: el.clientWidth, altura: (el as HTMLCanvasElement).height }));
    const antes = await medidas();
    expect(antes.largura).toBeGreaterThanOrEqual(antes.cliente);
    await page.setViewportSize({ width: 700, height: 600 });
    await expect.poll(async () => (await medidas()).cliente, { timeout: 5_000 }).toBeLessThan(antes.cliente);
    const depois = await medidas();
    expect(depois.largura).toBeGreaterThanOrEqual(depois.cliente);
    expect(depois.altura).toBeGreaterThan(150);
    await expect(page.locator("[data-pausar]")).toBeVisible();
    await page.keyboard.press("j");
    await expect.poll(async () => (await estados(page))[0], { timeout: 3_000 }).toMatch(/golpe|parado/);
    expect(erros).toEqual([]);
  });
});
