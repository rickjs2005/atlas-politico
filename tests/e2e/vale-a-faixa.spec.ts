// Vale a Faixa (src/features/faixa, docs/VALE-A-FAIXA.md): a jornada no
// navegador, com o esquema de controles (setas, Espaço, Z, V, X, Shift, C,
// Esc). A abertura e a escolha; a partida com cada personagem, até o fim, com
// o computador buscando a faixa sozinho; o teclado (andar, pular, voadora,
// golpe forte, esquiva, C para pegar e posicionar, seta para cima para subir,
// C segurado para puxar); atacar perto da escada em que o computador sobe,
// que a chacoalha; Esc que pausa e continua, a revanche e a volta ao atlas;
// as teclas que não rolam a página e não entram em campos de texto; o toque
// no celular emulado, com teclado junto; o redimensionamento; e nenhum erro
// de console. As regras em si estão em tests/faixa.test.ts.

import { expect, test, type Page } from "@playwright/test";

const raiz = (page: Page) => page.locator("[data-faixa]");
/** Os estados que o canvas expõe: jogador, computador, escada, puxada, x do jogador, x da escada e y do jogador. */
const estados = async (page: Page) => (await page.locator("canvas").getAttribute("data-estados"))!.split("|");
const estadoDoJogador = async (page: Page) => (await estados(page))[0]!;

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

const TECLAS_DESENHADAS = ["←", "→", "Espaço", "Z", "V", "X", "Shift", "C", "↑", "↓", "Esc"];

test.describe("Vale a Faixa", () => {
  test("a entrada diz que é sátira e mostra o esquema único de teclas; a escolha tem os dois; o hub do jogo leva até aqui", async ({ page }) => {
    await page.goto("/jogo/");
    await expect(page.locator('[data-caminho="vale-a-faixa"]')).toContainText("Sátira interativa");
    await page.locator("[data-abrir-vale-a-faixa]").click();
    await expect(page).toHaveURL(/\/jogo\/vale-a-faixa\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Vale a Faixa");
    await expect(raiz(page)).toContainText("Sátira interativa");
    await expect(raiz(page)).toContainText("mesmas capacidades");
    await expect(page.locator("[data-teclas] kbd")).toHaveText(TECLAS_DESENHADAS);
    await expect(raiz(page)).not.toContainText(/\bJ\b|\bK\b|\bL\b|Enter|W A S D/);
    await page.locator("[data-escolher-candidato]").click();
    await expect(page.locator("[data-escolha]")).toHaveCount(2);
    await expect(page.locator('[data-escolha="lula"]')).toContainText("Lula");
    await expect(page.locator('[data-escolha="flavio-bolsonaro"]')).toContainText("Flávio Bolsonaro");
  });

  for (const slug of ["lula", "flavio-bolsonaro"] as const) {
    test(`com ${slug}, parado, o computador busca a escada, posiciona, sobe, puxa e vence; a vitória aparece uma vez, e a revanche recomeça`, async ({ page }) => {
      test.setTimeout(150_000);
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
          { timeout: 120_000 },
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

  test("pelo teclado: pular parado e em movimento, voadora, golpe forte, esquiva e a sequência de golpes, com os estados certos", async ({ page }) => {
    const erros = vigiarErros(page);
    await comecar(page, "lula", false, true);
    const y = async () => Number((await estados(page))[6]);
    // Pulo parado: sobe, cai, aterrissa e volta a parado.
    await page.keyboard.press(" ");
    await expect.poll(() => estadoDoJogador(page), { timeout: 3_000 }).toBe("pulando");
    await expect.poll(y, { timeout: 2_000 }).toBeGreaterThan(40);
    await expect.poll(() => estadoDoJogador(page), { timeout: 3_000 }).toBe("parado");
    expect(await y()).toBe(0);
    // Pulo em movimento, com a voadora no ar: uma por salto.
    await page.keyboard.down("ArrowRight");
    await page.keyboard.press(" ");
    await expect.poll(() => estadoDoJogador(page), { timeout: 3_000 }).toBe("pulando");
    await page.keyboard.press("z");
    await expect.poll(() => estadoDoJogador(page), { timeout: 3_000 }).toBe("voadora");
    await page.keyboard.up("ArrowRight");
    await expect.poll(() => estadoDoJogador(page), { timeout: 3_000 }).toBe("aterrissando");
    await expect.poll(() => estadoDoJogador(page), { timeout: 3_000 }).toBe("parado");
    // O golpe forte e a esquiva, e a sequência Z Z Z.
    await page.keyboard.press("v");
    await expect.poll(() => estadoDoJogador(page), { timeout: 3_000 }).toBe("forte");
    await expect.poll(() => estadoDoJogador(page), { timeout: 3_000 }).toBe("parado");
    await page.keyboard.press("Shift");
    await expect.poll(() => estadoDoJogador(page), { timeout: 3_000 }).toBe("esquiva");
    await expect.poll(() => estadoDoJogador(page), { timeout: 3_000 }).toBe("parado");
    await page.keyboard.press("z");
    await expect.poll(() => estadoDoJogador(page), { timeout: 3_000 }).toBe("golpe");
    expect(erros).toEqual([]);
  });

  test("pelo teclado: C pega e posiciona a escada, a seta para cima sobe, C segurado puxa a faixa por alguns segundos e vence", async ({ page }) => {
    test.setTimeout(120_000);
    const erros = vigiarErros(page);
    // Para a prova ser determinística, o computador fica parado: a pessoa joga sozinha, e a partida é lida pelo canvas.
    await comecar(page, "lula", false, true);
    const estadoDaEscada = async () => (await estados(page))[2];
    const dica = () => raiz(page).getAttribute("data-dica");
    const xDoJogador = async () => Number((await estados(page))[4]);
    const xDaEscada = async () => Number((await estados(page))[5]);
    const lado = (await xDaEscada()) < (await xDoJogador()) ? "ArrowLeft" : "ArrowRight";
    await segurarAte(page, lado, async () => (await dica()) === "pegarEscada", 10_000);
    // Z não pega a escada; C pega.
    await page.keyboard.press("z");
    await page.waitForTimeout(500);
    expect(await estadoDaEscada()).toBe("caida");
    await page.keyboard.press("c");
    await expect.poll(estadoDaEscada).toBe("carregada");
    await expect.poll(dica).toMatch(/posicionarEscada|soltarEscada/);
    const paraOCentro = (await xDoJogador()) < 0 ? "ArrowRight" : "ArrowLeft";
    await segurarAte(page, paraOCentro, async () => (await dica()) === "posicionarEscada", 15_000);
    await page.keyboard.press("c");
    await expect.poll(estadoDaEscada).toBe("emPe");
    await expect.poll(dica).toBe("subir");
    // C não sobe: a seta para cima sobe.
    await page.keyboard.press("c");
    await page.waitForTimeout(400);
    expect(await estadoDoJogador(page)).toBe("parado");
    await segurarAte(page, "ArrowUp", async () => (await estadoDoJogador(page)) === "noTopo", 10_000);
    await expect(raiz(page)).toHaveAttribute("data-na-escada", "sim");
    await expect.poll(dica).toBe("puxarFaixa");
    // Sem segurar, nada avança; com C segurado, a barra enche em alguns segundos, com o aviso de que falta pouco.
    await page.waitForTimeout(400);
    expect(Number((await estados(page))[3])).toBe(0);
    const inicio = Date.now();
    await segurarAte(page, "c", async () => (await raiz(page).getAttribute("data-fase")) === "fim", 30_000);
    expect(Date.now() - inicio).toBeGreaterThan(7_000);
    await expect(raiz(page)).toHaveAttribute("data-vencedor", "0");
    await expect(page.locator('[data-resultado="vitoria"]')).toBeVisible();
    expect(erros).toEqual([]);
  });

  test("a torcida acompanha o estado real: sobe com a subida, só cresce com a captura de verdade, cai na interrupção e explode na vitória", async ({ page }) => {
    test.setTimeout(150_000);
    const erros = vigiarErros(page);
    await comecar(page, "lula", false, true);
    const torcida = async () => (await page.locator("canvas").getAttribute("data-torcida"))!.split("|").map(Number) as [number, number];
    const dica = () => raiz(page).getAttribute("data-dica");
    const xDoJogador = async () => Number((await estados(page))[4]);
    const xDaEscada = async () => Number((await estados(page))[5]);
    // Na luta normal, o ambiente é presente e sem captura.
    const [base, capturaBase] = await torcida();
    expect(base).toBeGreaterThanOrEqual(0.3);
    expect(base).toBeLessThan(0.45);
    expect(capturaBase).toBe(0);
    // Pega e posiciona a escada.
    const lado = (await xDaEscada()) < (await xDoJogador()) ? "ArrowLeft" : "ArrowRight";
    await segurarAte(page, lado, async () => (await dica()) === "pegarEscada", 10_000);
    await page.keyboard.press("c");
    const paraOCentro = (await xDoJogador()) < 0 ? "ArrowRight" : "ArrowLeft";
    await segurarAte(page, paraOCentro, async () => (await dica()) === "posicionarEscada", 15_000);
    await page.keyboard.press("c");
    await expect.poll(dica).toBe("subir");
    // Subindo, a agitação cresce; no topo sem puxar, cresce mais, mas a captura segue em zero.
    await page.keyboard.down("ArrowUp");
    await expect.poll(async () => (await torcida())[0], { timeout: 3_000 }).toBeGreaterThan(0.42);
    await expect.poll(() => estadoDoJogador(page), { timeout: 5_000 }).toBe("noTopo");
    await page.keyboard.up("ArrowUp");
    await page.waitForTimeout(300);
    const [noTopo, capturaNoTopo] = await torcida();
    expect(noTopo).toBeGreaterThan(0.55);
    expect(noTopo).toBeLessThan(0.62);
    expect(capturaNoTopo).toBe(0);
    // Puxando, o crescendo segue o progresso real.
    await page.keyboard.down("c");
    await expect.poll(async () => (await torcida())[1], { timeout: 5_000 }).toBeGreaterThan(0.2);
    const [puxando, capturaPuxando] = await torcida();
    expect(puxando).toBeGreaterThan(0.62);
    expect(puxando).toBeLessThan(1);
    // Descer interrompe a captura: a captura volta a zero e a intensidade cai.
    await page.keyboard.up("c");
    await page.keyboard.down("ArrowDown");
    await expect.poll(() => estadoDoJogador(page), { timeout: 5_000 }).toBe("parado");
    await page.keyboard.up("ArrowDown");
    await page.waitForTimeout(200);
    const [depois, capturaDepois] = await torcida();
    expect(capturaDepois).toBe(0);
    expect(depois).toBeLessThan(puxando);
    expect(capturaPuxando).toBeGreaterThan(0);
    // Sobe de novo e vai até o fim: na vitória, o máximo.
    await segurarAte(page, "ArrowUp", async () => (await estadoDoJogador(page)) === "noTopo", 10_000);
    await segurarAte(page, "c", async () => (await raiz(page).getAttribute("data-fase")) === "fim", 30_000);
    await expect.poll(async () => (await torcida())[0], { timeout: 3_000 }).toBe(1);
    expect(erros).toEqual([]);
  });

  test("atacar perto da escada em que o computador sobe chacoalha a escada e pausa a subida dele", async ({ page }) => {
    test.setTimeout(120_000);
    const erros = vigiarErros(page);
    await comecar(page, "lula");
    await expect.poll(async () => (await estados(page))[1], { timeout: 90_000 }).toMatch(/subindo|noTopo/);
    const xDaEscada = Number((await estados(page))[5]);
    const xDoJogador = async () => Number((await estados(page))[4]);
    const lado = xDaEscada < (await xDoJogador()) ? "ArrowLeft" : "ArrowRight";
    await segurarAte(page, lado, async () => Math.abs((await xDoJogador()) - xDaEscada) <= 60, 10_000);
    await expect.poll(() => raiz(page).getAttribute("data-dica"), { timeout: 3_000 }).toBe("derrubarEscada");
    await page.keyboard.press("z");
    await expect.poll(() => estadoDoJogador(page), { timeout: 3_000 }).toBe("derrubada");
    await expect.poll(() => estadoDoJogador(page), { timeout: 3_000 }).toBe("parado");
    expect(erros).toEqual([]);
  });

  test("Esc abre a pausa e congela a partida; Esc de novo continua; o painel de som tem efeitos e torcida, sem narração; Voltar ao Atlas leva ao hub e descarta a cena", async ({ page }) => {
    const erros = vigiarErros(page);
    await comecar(page, "lula");
    await page.keyboard.press("Escape");
    await expect(page.locator('[data-janela="pausa"]')).toBeVisible();
    await expect(raiz(page)).toHaveAttribute("data-pausado", "sim");
    const antes = await estados(page);
    await page.waitForTimeout(700);
    expect(await estados(page)).toEqual(antes);
    await expect(page.locator("[data-volume-efeitos]")).toBeVisible();
    await expect(page.locator("[data-volume-torcida]")).toBeVisible();
    await expect(page.locator("[data-volume-narracao]")).toHaveCount(0);
    await page.locator("[data-ver-controles]").click();
    await expect(page.locator('[data-janela="controles"] [data-teclas] kbd')).toHaveText(TECLAS_DESENHADAS);
    await page.getByRole("button", { name: "Voltar" }).click();
    await expect(page.locator('[data-janela="pausa"]')).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(raiz(page)).toHaveAttribute("data-pausado", "nao");
    await expect(page.locator('[data-janela="pausa"]')).toHaveCount(0);
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
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press(" ");
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    await page.evaluate(() => {
      const campo = document.createElement("input");
      campo.id = "campo-de-prova";
      document.querySelector("[data-faixa]")!.appendChild(campo);
      campo.focus();
    });
    const x0 = Number((await estados(page))[4]);
    await page.keyboard.type("zc v");
    await page.keyboard.down("ArrowRight");
    await page.waitForTimeout(400);
    await page.keyboard.up("ArrowRight");
    expect(await page.locator("#campo-de-prova").inputValue()).toBe("zc v");
    expect(Number((await estados(page))[4])).toBe(x0);
    // O pulo do Espaço de antes termina sozinho; as teclas no campo não disparam nada.
    await expect.poll(() => estadoDoJogador(page), { timeout: 3_000 }).toBe("parado");
  });

  test("no celular emulado: direcional e seis ações sem sobreposição, resposta ao apertar e ao soltar, toque e teclado ao mesmo tempo, e a página não rola", async ({ browser }) => {
    const contexto = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
    const page = await contexto.newPage();
    const erros = vigiarErros(page);
    await comecar(page, "flavio-bolsonaro", true, true);
    const controles = page.locator("[data-controles-de-toque]");
    await expect(controles).toBeVisible();
    const botoes = await page.locator("[data-controle]").all();
    expect(await Promise.all(botoes.map((botao) => botao.getAttribute("data-controle")))).toEqual(["cima", "esquerda", "direita", "baixo", "interagir", "esquiva", "defesa", "forte", "pulo", "golpe"]);
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
      await expect.poll(() => estadoDoJogador(page), { timeout: 3_000 }).toBe("golpe");
    } finally {
      await dedo.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    }
    await expect(direita).toHaveAttribute("data-pressionado", "nao");
    await expect.poll(() => estadoDoJogador(page), { timeout: 3_000 }).toMatch(/parado|atingido|defesa/);
    const parou = await x();
    await page.waitForTimeout(400);
    expect(Math.abs((await x()) - parou)).toBeLessThanOrEqual(2);
    // O botão de pular pula.
    const pular = page.locator('[data-controle="pulo"]');
    const caixaDoPulo = (await pular.boundingBox())!;
    await dedo.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: caixaDoPulo.x + caixaDoPulo.width / 2, y: caixaDoPulo.y + caixaDoPulo.height / 2 }] });
    await dedo.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect.poll(() => estadoDoJogador(page), { timeout: 3_000 }).toBe("pulando");
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
    await expect.poll(() => estadoDoJogador(page), { timeout: 3_000 }).toMatch(/golpe|parado/);
    expect(erros).toEqual([]);
  });
});
