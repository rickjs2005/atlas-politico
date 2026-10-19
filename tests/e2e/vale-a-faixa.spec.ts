// Vale a Faixa (src/features/faixa, docs/VALE-A-FAIXA.md): a jornada no
// navegador, com o esquema de controles único (setas, Z, X, C, Esc). A
// abertura e a escolha; a partida com cada personagem, até o fim, com o
// computador buscando a faixa sozinho; o teclado (andar, C para pegar e
// posicionar, seta para cima para subir, C segurado para puxar); atacar perto
// da escada em que o computador sobe, que a derruba; Esc que pausa e
// continua, a revanche e a volta ao atlas; o toque no celular emulado, com
// teclado junto; o redimensionamento sem perder os controles; e nenhum erro
// de console. As regras em si estão em tests/faixa.test.ts.

import { expect, test, type Page } from "@playwright/test";

const raiz = (page: Page) => page.locator("[data-faixa]");
/** Os estados que o canvas expõe: jogador, computador, escada, puxada, x do jogador e x da escada. */
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
  test("a entrada diz que é sátira e mostra o esquema único de teclas; a escolha tem os dois; o hub do jogo leva até aqui", async ({ page }) => {
    await page.goto("/jogo/");
    await expect(page.locator('[data-caminho="vale-a-faixa"]')).toContainText("Sátira interativa");
    await page.locator("[data-abrir-vale-a-faixa]").click();
    await expect(page).toHaveURL(/\/jogo\/vale-a-faixa\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Vale a Faixa");
    await expect(raiz(page)).toContainText("Sátira interativa");
    await expect(raiz(page)).toContainText("mesmas capacidades");
    const teclas = page.locator("[data-teclas] kbd");
    await expect(teclas).toHaveText(["←", "→", "↑", "↓", "Z", "X", "C", "Esc"]);
    await expect(raiz(page)).not.toContainText(/\bJ\b|\bK\b|\bL\b|Espaço|Enter|W A S D/);
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

  test("pelo teclado: setas andam, C pega e posiciona a escada, a seta para cima sobe, C segurado puxa a faixa e vence", async ({ page }) => {
    test.setTimeout(120_000);
    const erros = vigiarErros(page);
    // Para a prova ser determinística, o computador fica parado: a pessoa joga sozinha, e a partida é lida pelo canvas.
    await comecar(page, "lula", false, true);
    const estadoDaEscada = async () => (await estados(page))[2];
    const dica = () => raiz(page).getAttribute("data-dica");
    const xDoJogador = async () => Number((await estados(page))[4]);
    const xDaEscada = async () => Number((await estados(page))[5]);
    // Anda até a escada, para o lado em que ela está; a dica diz quando dá para pegar.
    const lado = (await xDaEscada()) < (await xDoJogador()) ? "ArrowLeft" : "ArrowRight";
    await segurarAte(page, lado, async () => (await dica()) === "pegarEscada", 10_000);
    // Z não pega a escada; C pega.
    await page.keyboard.press("z");
    await page.waitForTimeout(500);
    expect(await estadoDaEscada()).toBe("caida");
    await page.keyboard.press("c");
    await expect.poll(estadoDaEscada).toBe("carregada");
    await expect.poll(dica).toMatch(/posicionarEscada|soltarEscada/);
    // Leva até a marca: a dica vira "posicionar".
    const paraOCentro = (await xDoJogador()) < 0 ? "ArrowRight" : "ArrowLeft";
    await segurarAte(page, paraOCentro, async () => (await dica()) === "posicionarEscada", 15_000);
    await page.keyboard.press("c");
    await expect.poll(estadoDaEscada).toBe("emPe");
    await expect.poll(dica).toBe("subir");
    // C não sobe: a seta para cima sobe.
    await page.keyboard.press("c");
    await page.waitForTimeout(400);
    expect((await estados(page))[0]).toBe("parado");
    await segurarAte(page, "ArrowUp", async () => (await estados(page))[0] === "noTopo", 10_000);
    await expect(raiz(page)).toHaveAttribute("data-na-escada", "sim");
    await expect.poll(dica).toBe("puxarFaixa");
    // Sem segurar, nada avança; com C segurado, a barra enche até a faixa soltar.
    await page.waitForTimeout(400);
    expect(Number((await estados(page))[3])).toBe(0);
    await segurarAte(page, "c", async () => (await raiz(page).getAttribute("data-fase")) === "fim", 20_000);
    await expect(raiz(page)).toHaveAttribute("data-vencedor", "0");
    await expect(page.locator('[data-resultado="vitoria"]')).toBeVisible();
    expect(erros).toEqual([]);
  });

  test("atacar perto da escada em que o computador sobe derruba a escada e interrompe a subida", async ({ page }) => {
    test.setTimeout(120_000);
    const erros = vigiarErros(page);
    await comecar(page, "lula");
    // Espera o computador pôr a escada em pé e começar a subir, com o jogador parado.
    await expect.poll(async () => (await estados(page))[1], { timeout: 60_000 }).toMatch(/subindo|noTopo/);
    const xDaEscada = Number((await estados(page))[5]);
    const xDoJogador = async () => Number((await estados(page))[4]);
    const lado = xDaEscada < (await xDoJogador()) ? "ArrowLeft" : "ArrowRight";
    await segurarAte(page, lado, async () => Math.abs((await xDoJogador()) - xDaEscada) <= 60, 10_000);
    await page.keyboard.press("z");
    await expect.poll(async () => (await estados(page))[0], { timeout: 3_000 }).toBe("derrubada");
    await expect.poll(async () => (await estados(page))[2], { timeout: 3_000 }).toMatch(/caindo|caida/);
    await expect.poll(async () => (await estados(page))[1], { timeout: 3_000 }).toMatch(/caindoDaEscada|caido/);
    expect(erros).toEqual([]);
  });

  test("Esc abre a pausa e congela a partida; Esc de novo continua; Voltar ao Atlas leva ao hub e descarta a cena", async ({ page }) => {
    const erros = vigiarErros(page);
    await comecar(page, "lula");
    await page.keyboard.press("Escape");
    await expect(page.locator('[data-janela="pausa"]')).toBeVisible();
    await expect(raiz(page)).toHaveAttribute("data-pausado", "sim");
    const antes = await estados(page);
    await page.waitForTimeout(700);
    expect(await estados(page)).toEqual(antes);
    await page.locator("[data-ver-controles]").click();
    const controles = page.locator('[data-janela="controles"]');
    await expect(controles.locator("[data-teclas] kbd")).toHaveText(["←", "→", "↑", "↓", "Z", "X", "C", "Esc"]);
    await page.getByRole("button", { name: "Voltar" }).click();
    await expect(page.locator('[data-janela="pausa"]')).toBeVisible();
    // Esc continua.
    await page.keyboard.press("Escape");
    await expect(raiz(page)).toHaveAttribute("data-pausado", "nao");
    await expect(page.locator('[data-janela="pausa"]')).toHaveCount(0);
    // Perder o foco também pausa; Continuar volta.
    await page.evaluate(() => window.dispatchEvent(new Event("blur")));
    await expect(page.locator('[data-janela="pausa"]')).toBeVisible();
    await page.locator("[data-continuar]").click();
    await expect(raiz(page)).toHaveAttribute("data-pausado", "nao");
    await page.keyboard.press("Escape");
    await expect(page.locator('[data-janela="pausa"]')).toBeVisible();
    await page.locator("[data-voltar-ao-atlas]").click();
    await expect(page).toHaveURL(/\/jogo\/$/);
    await expect(page.locator("canvas")).toHaveCount(0);
    expect(erros).toEqual([]);
  });

  test("as teclas do jogo não rolam a página durante a partida e não são capturadas em um campo de texto", async ({ page }) => {
    await comecar(page, "lula", false, true);
    // A página tem o rodapé abaixo do ringue: sem o jogo, a seta para baixo rolaria.
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    // Em um campo de texto, as teclas vão para o campo, e não para o jogo.
    await page.evaluate(() => {
      const campo = document.createElement("input");
      campo.id = "campo-de-prova";
      document.querySelector("[data-faixa]")!.appendChild(campo);
      campo.focus();
    });
    const x0 = Number((await estados(page))[4]);
    await page.keyboard.type("zc");
    await page.keyboard.down("ArrowRight");
    await page.waitForTimeout(400);
    await page.keyboard.up("ArrowRight");
    expect(await page.locator("#campo-de-prova").inputValue()).toBe("zc");
    expect(Number((await estados(page))[4])).toBe(x0);
    expect((await estados(page))[0]).toBe("parado");
  });

  test("no celular emulado: direcional e três botões sem sobreposição, toque e teclado ao mesmo tempo, e a página não rola", async ({ browser }) => {
    const contexto = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
    const page = await contexto.newPage();
    const erros = vigiarErros(page);
    // O computador fica parado: o teste é dos controles, e um empurrão do adversário mudaria a posição lida.
    await comecar(page, "flavio-bolsonaro", true, true);
    const controles = page.locator("[data-controles-de-toque]");
    await expect(controles).toBeVisible();
    const botoes = await page.locator("[data-controle]").all();
    expect(botoes).toHaveLength(7);
    expect(await Promise.all(botoes.map((botao) => botao.getAttribute("data-controle")))).toEqual(["cima", "esquerda", "direita", "baixo", "interagir", "defesa", "golpe"]);
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
    // Um dedo segurando a seta anda e o botão acusa o aperto; ao mesmo tempo, o teclado bate; soltar o dedo para.
    const x = async () => Number((await estados(page))[4]);
    const x0 = await x();
    const direita = page.locator('[data-controle="direita"]');
    const caixa = (await direita.boundingBox())!;
    const dedo = await contexto.newCDPSession(page);
    const ponto = { x: caixa.x + caixa.width / 2, y: caixa.y + caixa.height / 2 };
    await dedo.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [ponto] });
    try {
      await expect(direita).toHaveAttribute("data-pressionado", "sim");
      await expect.poll(x, { timeout: 4_000 }).toBeGreaterThan(x0);
      await page.keyboard.press("z");
      await expect.poll(async () => (await estados(page))[0], { timeout: 3_000 }).toBe("golpe");
    } finally {
      await dedo.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    }
    await expect(direita).toHaveAttribute("data-pressionado", "nao");
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
    await page.keyboard.press("z");
    await expect.poll(async () => (await estados(page))[0], { timeout: 3_000 }).toMatch(/golpe|parado/);
    expect(erros).toEqual([]);
  });
});
