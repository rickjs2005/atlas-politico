// Jogo: o que as páginas pedem, e quando, na saída estática. O palco (canvas
// e laço) fica em um pacote à parte, pedido só na página de um personagem e
// só com o cenário: quem lê sem o cenário não o baixa. Nenhuma página do jogo
// carrega o mapa, e nenhuma página do atlas carrega o palco (docs/GAMEPLAY.md,
// seção Carregamento). Aqui também se confere o que o documento traz antes de
// qualquer script, e o que a página faz quando um pacote não chega.
//
// Rode com `npm run build` e `npm run test:export`. As jornadas do jogo sobre
// a saída rodam em `npm run test:journeys` (tests/e2e/jogo.spec.ts).

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { expect, test, type Page } from "@playwright/test";

import { PREFERENCES_KEY } from "@/lib/game/preferences";
import { periodLabel } from "@/lib/game/rooms";

import { PERSONAGENS, fasesDe, janela, jogo, nomeDe, opcoesDe, posicaoDe, pronto, responder, rota, vigiar } from "../e2e/jogo-apoio";

const OUT = path.resolve(process.env.OUT_DIR ?? "out");
const CHUNKS = path.join(OUT, "_next", "static", "chunks");
/** O servidor de pré-visualização (playwright.export.config.ts). */
const ORIGEM = "http://localhost:4311";

// Os pacotes são reconhecidos pelo conteúdo, porque o nome muda a cada build.
const chunksWith = (marca: string) =>
  readdirSync(CHUNKS)
    .filter((nome) => nome.endsWith(".js") && readFileSync(path.join(CHUNKS, nome), "utf8").includes(marca))
    .map((nome) => `/_next/static/chunks/${nome}`);

/** O palco: a marca está em src/features/game/GameStage.tsx. */
const STAGE_CHUNKS = chunksWith("atlas-jogo-palco");
const MAP_CHUNKS = chunksWith("maplibregl-canvas");

const conjunto = JSON.parse(readFileSync("generated/dados/conjunto.json", "utf8")) as {
  acontecimentos: { slug: string; localizacao: { tipo: string } }[];
};
const comLugar = conjunto.acontecimentos.find((item) => item.localizacao.tipo === "lugares")!;

function watch(page: Page) {
  const pedidos: { caminho: string; status: number | null }[] = [];
  const externos: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.protocol === "data:" || url.protocol === "blob:") return;
    if (url.origin !== ORIGEM) externos.push(request.url());
  });
  page.on("requestfinished", async (request) => {
    const url = new URL(request.url());
    if (url.protocol !== "http:") return;
    // Um pedido pode terminar com o teste já encerrado e a página fechada.
    const resposta = await request.response().catch(() => null);
    pedidos.push({ caminho: url.pathname, status: resposta?.status() ?? null });
  });
  const caminhos = () => pedidos.map((pedido) => pedido.caminho);
  return {
    pedidos,
    externos,
    doPalco: () => caminhos().filter((caminho) => STAGE_CHUNKS.includes(caminho)),
    doMapa: () => caminhos().filter((caminho) => MAP_CHUNKS.includes(caminho) || /maplibre-gl-worker|\.geojson$/.test(caminho)),
    comErro: () => pedidos.filter((pedido) => (pedido.status ?? 0) >= 400).map((pedido) => pedido.caminho),
  };
}

/** Espera a rede da página parar: o roteador pré-carrega os links depois de hidratar. */
async function settle(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(600);
}

/** O HTML de uma rota, sem as marcas que o React põe entre trechos de texto e com as entidades de aspas desfeitas, para comparar com o texto do conteúdo. */
async function htmlDe(request: { get(url: string): Promise<{ status(): number; text(): Promise<string> }> }, url: string) {
  const resposta = await request.get(url);
  const html = (await resposta.text()).replace(/<!-- -->/g, "").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, "&");
  return { status: resposta.status(), html };
}

test.describe("pacotes do jogo", () => {
  test("o palco está em um pacote à parte do resto do site e do mapa", () => {
    expect(STAGE_CHUNKS.length, "pacotes com o palco").toBeGreaterThan(0);
    expect(MAP_CHUNKS.length, "pacotes com o mapa").toBeGreaterThan(0);
    expect(STAGE_CHUNKS.filter((pacote) => MAP_CHUNKS.includes(pacote)), "pacotes com os dois").toEqual([]);
  });

  for (const caminho of ["/", "/politicos/lula/", "/comparar/", "/metodologia/", `/acontecimentos/${comLugar.slug}/`, "/404.html"]) {
    test(`${caminho} não pede o palco do jogo`, async ({ page }) => {
      const visto = watch(page);
      await page.goto(caminho);
      await settle(page);
      expect(visto.doPalco(), "pedidos do palco").toEqual([]);
    });
  }

  test("a entrada do atlas só adianta o jogo quando a pessoa aponta para o acesso", async ({ page }) => {
    const visto = watch(page);
    await page.goto("/");
    await settle(page);
    const trechosDoJogo = () => visto.pedidos.map((pedido) => pedido.caminho).filter((caminho) => caminho.startsWith("/jogo/"));
    expect(trechosDoJogo(), "ao abrir").toEqual([]);
    await page.locator('[data-jogar-entrada="lula"]').hover();
    await expect.poll(trechosDoJogo, { message: "ao apontar" }).not.toEqual([]);
    await settle(page);
    expect(visto.doPalco(), "o palco só vem na página do jogo").toEqual([]);
    expect(visto.comErro(), "respostas com erro").toEqual([]);
  });
});

test.describe("páginas do jogo", () => {
  test("a escolha de trajetória mostra a prévia do cenário sem o palco e sem o mapa", async ({ page }) => {
    const visto = watch(page);
    await page.goto("/jogo/");
    await settle(page);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Conheça as duas trajetórias");
    await expect(page.locator("[data-previa-mundo]")).toHaveCount(2);
    // A prévia desenha de verdade: o canvas não fica vazio.
    for (const canvas of await page.locator("[data-previa-mundo]").all()) {
      const pintados = await canvas.evaluate((no: HTMLCanvasElement) => {
        const ctx = no.getContext("2d")!;
        const { data } = ctx.getImageData(0, 0, no.width, no.height);
        const cores = new Set<string>();
        for (let i = 0; i < data.length; i += 4 * 997) cores.add(`${data[i]},${data[i + 1]},${data[i + 2]}`);
        return cores.size;
      });
      expect(pintados, "cores diferentes na prévia").toBeGreaterThan(4);
    }
    expect(visto.doPalco(), "pedidos do palco").toEqual([]);
    expect(visto.doMapa(), "pedidos do mapa").toEqual([]);
    expect(visto.comErro(), "respostas com erro").toEqual([]);
    expect(visto.externos, "pedidos a outro domínio").toEqual([]);
  });

  for (const caminho of ["/jogo/lula/", "/jogo/flavio-bolsonaro/", "/jogo/lula/economia/", "/jogo/flavio-bolsonaro/seguranca-publica/"]) {
    test(`${caminho} pede o palco, não pede o mapa e não vai a outro domínio`, async ({ page }) => {
      const visto = watch(page);
      await page.goto(caminho);
      await expect(page.locator('[data-palco="pronto"]')).toBeVisible({ timeout: 30_000 });
      await settle(page);
      expect(visto.doPalco().length, "pacote do palco").toBeGreaterThan(0);
      expect(visto.doMapa(), "pedidos do mapa").toEqual([]);
      expect(visto.comErro(), "respostas com erro").toEqual([]);
      expect(visto.externos, "pedidos a outro domínio").toEqual([]);
      // Nenhuma imagem: a cena é desenhada por código.
      const imagens = visto.pedidos.map((pedido) => pedido.caminho).filter((item) => /\.(png|jpe?g|webp|avif|svg|gif)$/.test(item));
      expect(imagens, "imagens pedidas").toEqual([]);
    });
  }

  test("quem lê sem o cenário não baixa o palco: pelo endereço, pela preferência guardada e pela entrada do jogo", async ({ page }) => {
    const erros = vigiar(page);
    const visto = watch(page);
    const slug = "lula";
    const [primeira] = fasesDe(slug);
    // Pelo endereço.
    await page.goto(`${rota(slug)}?fase=1&leitura=1`);
    await pronto(page, false);
    await expect(jogo(page)).toHaveAttribute("data-modo", "leitura");
    await expect(page.locator("[data-leitura-da-fase] [data-fase-titulo]")).toHaveText(primeira!.titulo);
    await settle(page);
    // O pedido virou a preferência: a trajetória aberta sem pedido continua na leitura.
    await page.goto(rota(slug));
    await pronto(page, false);
    await expect(jogo(page)).toHaveAttribute("data-modo", "leitura");
    await settle(page);
    // Pela entrada do jogo, em uma navegação interna, para a outra pessoa.
    await page.goto("/jogo/");
    await page.locator('[data-ler-sem-cenario="flavio-bolsonaro"]').click();
    await pronto(page, false);
    await expect(jogo(page)).toHaveAttribute("data-modo", "leitura");
    await settle(page);
    await expect(page.locator("canvas")).toHaveCount(0);
    expect(visto.doPalco(), "pedidos do palco").toEqual([]);
    expect(visto.comErro(), "respostas com erro").toEqual([]);
    expect(erros, "erros não tratados na página").toEqual([]);
  });

  test("o HTML do build já traz a primeira fase, o próximo passo, os caminhos e os avisos, sem a cena", async ({ request }) => {
    for (const slug of PERSONAGENS) {
      const fases = fasesDe(slug);
      const { status, html } = await htmlDe(request, rota(slug));
      expect(status, slug).toBe(200);
      // A cena é só do navegador; o que a explica está no documento.
      expect(html, slug).not.toContain("<canvas");
      expect(html, slug).toContain(`Jogo · ${nomeDe(slug)} · Trajetória`);
      expect(html, slug).toContain(fases[0]!.titulo);
      expect(html, slug).toContain(periodLabel(fases[0]!.periodo));
      expect(html, slug).toContain("Abrir o marco");
      // A faixa do passaporte já ocupa o lugar dela no cartão; a contagem entra quando o navegador lê o progresso.
      expect(html, slug).toContain("Meu passaporte");
      expect(html, slug).not.toContain("Concluídas:");
      expect(html, slug).toContain("Os carimbos do passaporte reconhecem as fases concluídas: não são nota.");
      expect(html, slug).toContain("Ler sem o cenário");
      expect(html, slug).toContain("Como funciona");
      expect(html, slug).toContain("Escolher a outra trajetória");
      expect(html, slug).toContain("O cenário é uma representação");
      expect(html, slug).toContain("não dá nota, não aponta vencedor e não recomenda voto");
      expect(html, slug).toContain("Revisão humana pendente");
      // Nada do jogo antigo.
      for (const antigo of ["Capítulos e tarefas", "Arquivista", "Guardar e continuar"]) expect(html, `${slug}: ${antigo}`).not.toContain(antigo);
    }
  });

  test("a página de um aprofundamento existe na saída, com o assunto, os anos, o aviso de amostra e o caminho para o início da vida no HTML", async ({ request }) => {
    for (const slug of PERSONAGENS) {
      for (const sala of ["economia", "seguranca-publica"] as const) {
        const [fase] = fasesDe(slug, sala);
        const { status, html } = await htmlDe(request, rota(slug, sala));
        expect(status, `${slug}/${sala}`).toBe(200);
        expect(html, `${slug}/${sala}`).toContain(sala === "economia" ? "Aprofundamento: Economia" : "Aprofundamento: Segurança pública");
        expect(html, `${slug}/${sala}`).toContain(periodLabel(fase!.periodo));
        expect(html, `${slug}/${sala}`).toContain("Aprofundamento sobre um assunto, e não o começo da trajetória.");
        expect(html, `${slug}/${sala}`).toContain(`href="/jogo/${slug}/?fase=1"`);
        expect(html, `${slug}/${sala}`).toContain("amostra documentada");
        expect(html, `${slug}/${sala}`).not.toContain("<canvas");
      }
    }
  });

  test("sem JavaScript, a casca do cenário sai e o texto das fases começa na primeira tela, com o caminho para o atlas", async ({ browser }) => {
    for (const viewport of [
      { width: 1280, height: 800 },
      { width: 360, height: 640 },
    ]) {
      const context = await browser.newContext({ javaScriptEnabled: false, baseURL: ORIGEM, viewport });
      const page = await context.newPage();
      const slug = "lula";
      const fases = fasesDe(slug);
      await page.goto(rota(slug));
      // A casca só diria "Carregando o jogo…", com botões que não respondem: ela não aparece.
      await expect(page.locator("[data-jogo]")).toBeHidden();
      await expect(page.getByText("Carregando o jogo…")).toBeHidden();
      const aviso = page.locator("[data-fases-em-texto] [data-sem-javascript]");
      await expect(aviso).toBeVisible();
      await expect(aviso).toContainText("O cenário do jogo precisa de JavaScript");
      await expect(aviso.getByRole("link")).toHaveAttribute("href", `/politicos/${slug}/`);
      const caixa = (await aviso.boundingBox())!;
      expect(caixa.y + caixa.height, `${viewport.width}: o aviso cabe na primeira tela`).toBeLessThanOrEqual(viewport.height);
      // As fases, em texto, na ordem, com a posição, a explicação e a resposta.
      const secoes = page.locator("[data-fases-em-texto] section");
      await expect(secoes).toHaveCount(fases.length);
      await expect(secoes.first().getByRole("heading", { level: 2 })).toHaveText(fases[0]!.titulo);
      await expect(secoes.first()).toContainText(posicaoDe(fases[0]!, fases.length));
      await expect(secoes.first()).toContainText(fases[0]!.explicacao[0]!.texto);
      await expect(secoes.first()).toContainText(fases[0]!.atividade.explicacao);
      await expect(secoes.last().getByRole("heading", { level: 2 })).toHaveText(fases.at(-1)!.titulo);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), `${viewport.width}: sobra na largura`).toBeLessThanOrEqual(0);

      // A entrada do jogo, sem JavaScript, já tem os dois começos, como links comuns.
      await page.goto("/jogo/");
      for (const pessoa of PERSONAGENS) {
        const comecar = page.locator(`[data-comecar="${pessoa}"]`);
        await expect(comecar).toBeVisible();
        await expect(comecar).toHaveAttribute("href", `/jogo/${pessoa}/?fase=1`);
        await expect(comecar).toContainText(`Começar do início: ${fasesDe(pessoa)[0]!.periodo.de}`);
      }
      await context.close();
    }
  });

  test("se o pacote do palco não chega, a página continua de pé, e a leitura sem o cenário cumpre o ciclo inteiro", async ({ page }) => {
    const erros = vigiar(page);
    const slug = "lula";
    const [primeira, segunda] = fasesDe(slug);
    await page.route("**/_next/static/chunks/*.js", (pedido) => (STAGE_CHUNKS.includes(new URL(pedido.request().url()).pathname) ? pedido.abort() : pedido.continue()));
    await page.goto(`${rota(slug)}?fase=1`);
    const falha = page.locator('[data-palco="falhou"]');
    await expect(falha).toBeVisible({ timeout: 30_000 });
    await expect(falha).toContainText("A cena não carregou");
    await expect(falha).toContainText("Nada se perde");
    await expect(falha.getByRole("button", { name: "Recarregar a página" })).toBeVisible();
    // O cabeçalho do site e o da fase continuam no lugar.
    await expect(page.getByRole("link", { name: "Atlas Político" })).toBeVisible();
    await expect(page.locator("[data-fase-cartao] [data-fase-titulo]")).toHaveText(primeira!.titulo);

    // Sem a cena, o botão principal abre a explicação direto: o ciclo não depende dela.
    await page.locator("[data-abrir-marco]").click();
    const fase = await janela(page, "fase");
    await expect(fase.locator("[data-fase-titulo]")).toHaveText(primeira!.titulo);
    await page.keyboard.press("Escape");
    // Sem a pasta do cenário para receber o foco, ele vai para o botão principal.
    await expect(page.locator("[data-abrir-marco]")).toBeFocused();

    // E a leitura sem o cenário, oferecida no aviso, vale para esta visita, sem mexer na preferência guardada.
    await falha.locator("[data-ler-sem-cenario-do-aviso]").click();
    await expect(jogo(page)).toHaveAttribute("data-modo", "leitura");
    const leitura = page.locator("[data-leitura-da-fase]");
    await responder(leitura, opcoesDe(primeira!).certa);
    await expect(leitura.locator("[data-resultado]")).toHaveAttribute("data-resultado", "certo");
    await leitura.locator(`[data-continuar="${segunda!.id}"]`).click();
    await expect(jogo(page)).toHaveAttribute("data-fase-aberta", segunda!.id);
    expect(await page.evaluate((chave) => window.localStorage.getItem(chave), PREFERENCES_KEY)).toBeNull();
    expect(erros, "erros não tratados na página").toEqual([]);
  });

  test("se o pacote da prévia não chega, a escolha de trajetória continua valendo", async ({ page }) => {
    // A prévia usa o mesmo desenho da cena, em pacote próprio: aborta os pacotes que só a entrada do jogo pede.
    const daEntrada = new Set<string>();
    page.on("request", (pedido) => {
      const caminho = new URL(pedido.url()).pathname;
      if (caminho.startsWith("/_next/static/chunks/") && caminho.endsWith(".js")) daEntrada.add(caminho);
    });
    await page.goto("/jogo/");
    await settle(page);
    const comDesenho = chunksWith("data-previa-mundo");
    expect(comDesenho.length, "pacotes com a prévia").toBeGreaterThan(0);
    expect(comDesenho.filter((caminho) => daEntrada.has(caminho)).length, "a entrada pediu a prévia").toBeGreaterThan(0);

    const outra = await page.context().newPage();
    const erros = vigiar(outra);
    await outra.route("**/_next/static/chunks/*.js", (pedido) => (comDesenho.includes(new URL(pedido.request().url()).pathname) ? pedido.abort() : pedido.continue()));
    await outra.goto("/jogo/");
    await outra.waitForLoadState("networkidle");
    await expect(outra.getByRole("heading", { level: 1 })).toHaveText("Conheça as duas trajetórias");
    await expect(outra.locator("[data-escolha]")).toHaveCount(2);
    await expect(outra.locator('[data-escolha="lula"]')).toHaveAttribute("data-situacao", "inicio");
    await expect(outra.locator('[data-comecar="lula"]')).toHaveAttribute("href", "/jogo/lula/?fase=1");
    await expect(outra.locator("[data-previa-mundo]")).toHaveCount(0);
    expect(erros, "erros não tratados na página").toEqual([]);
    await outra.close();
  });

  for (const caminho of ["/jogo/ninguem/", "/jogo/lula/saude/", "/jogo/ninguem/economia/"]) {
    test(`${caminho}: endereço que não existe responde 404 com a página do atlas`, async ({ page }) => {
      const resposta = await page.goto(caminho);
      expect(resposta!.status()).toBe(404);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Este endereço não está no atlas");
    });
  }
});
