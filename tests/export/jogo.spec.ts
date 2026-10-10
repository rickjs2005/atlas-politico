// Jogo, etapa 1: o que as páginas pedem, e quando, na saída estática. O palco
// (canvas, laço e entrada) fica em um pacote à parte, pedido só na página de
// um personagem; nenhuma página do jogo carrega o mapa, e nenhuma página do
// atlas carrega o palco (docs/GAMEPLAY.md, seção Carregamento).
//
// Rode com `npm run build` e `npm run test:export`. As jornadas do jogo sobre
// a saída rodam em `npm run test:journeys` (tests/e2e/jogo.spec.ts).

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { expect, test, type Page } from "@playwright/test";

const OUT = path.resolve(process.env.OUT_DIR ?? "out");
const CHUNKS = path.join(OUT, "_next", "static", "chunks");
const ORIGEM = "http://localhost:4311";

// Os pacotes são reconhecidos pelo conteúdo, porque o nome muda a cada build.
const chunksWith = (marca: string) =>
  readdirSync(CHUNKS)
    .filter((nome) => nome.endsWith(".js") && readFileSync(path.join(CHUNKS, nome), "utf8").includes(marca))
    .map((nome) => `/_next/static/chunks/${nome}`);

/** O palco: a marca está em src/features/game/GameStage.tsx. */
const STAGE_CHUNKS = chunksWith("atlas-jogo-palco");
const MAP_CHUNKS = chunksWith("maplibregl-canvas");
/** Os pacotes do palco que o teste de falha derruba. */
const bloqueados = new Set(STAGE_CHUNKS);

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

async function settle(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(600);
}

test.describe("pacotes do jogo", () => {
  test("o palco está em um pacote à parte do resto do site e do mapa", () => {
    expect(STAGE_CHUNKS.length, "pacotes com o palco").toBeGreaterThan(0);
    expect(MAP_CHUNKS.length, "pacotes com o mapa").toBeGreaterThan(0);
    expect(STAGE_CHUNKS.filter((pacote) => MAP_CHUNKS.includes(pacote)), "pacotes com os dois").toEqual([]);
  });

  for (const rota of ["/", "/politicos/lula/", "/comparar/", "/metodologia/", `/acontecimentos/${comLugar.slug}/`, "/404.html"]) {
    test(`${rota} não pede o palco do jogo`, async ({ page }) => {
      const visto = watch(page);
      await page.goto(rota);
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
  test("a escolha de personagem mostra a prévia do mundo sem o palco e sem o mapa", async ({ page }) => {
    const visto = watch(page);
    await page.goto("/jogo/");
    await settle(page);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
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

  for (const personagem of ["lula", "flavio-bolsonaro"]) {
    test(`/jogo/${personagem}/ pede o palco, não pede o mapa e não vai a outro domínio`, async ({ page }) => {
      const visto = watch(page);
      await page.goto(`/jogo/${personagem}/`);
      await expect(page.locator('[data-palco="pronto"]')).toBeVisible({ timeout: 30_000 });
      await settle(page);
      expect(visto.doPalco().length, "pacote do palco").toBeGreaterThan(0);
      expect(visto.doMapa(), "pedidos do mapa").toEqual([]);
      expect(visto.comErro(), "respostas com erro").toEqual([]);
      expect(visto.externos, "pedidos a outro domínio").toEqual([]);
      // Nenhuma imagem: a cena é desenhada por código.
      const imagens = visto.pedidos.map((pedido) => pedido.caminho).filter((caminho) => /\.(png|jpe?g|webp|avif|svg|gif)$/.test(caminho));
      expect(imagens, "imagens pedidas").toEqual([]);
    });
  }

  test("o HTML do build já traz o capítulo, o objetivo e o caminho sem o cenário", async ({ request }) => {
    const html = await (await request.get("/jogo/lula/")).text();
    // A cena é só do navegador; o que a explica está no documento.
    expect(html).toContain("Capítulos e tarefas");
    expect(html).toContain("Como jogar");
    expect(html).not.toContain("<canvas");
    expect(html).toContain("Escolher outro personagem");
    expect(html).toContain("O cenário é uma representação");
    expect(html).toContain("Revisão humana pendente");
  });

  test("sem JavaScript, o aviso fica dentro do palco, na primeira tela, com o caminho para o atlas", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, baseURL: ORIGEM, viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    await page.goto("/jogo/lula/");
    const aviso = page.locator("[data-jogo] [data-sem-javascript]");
    await expect(aviso).toBeVisible();
    await expect(aviso).toContainText("O jogo precisa de JavaScript");
    await expect(aviso.getByRole("link")).toHaveAttribute("href", "/politicos/lula/");
    const caixa = (await aviso.boundingBox())!;
    expect(caixa.y + caixa.height, "o aviso cabe na primeira tela").toBeLessThanOrEqual(800);
    await context.close();
  });

  test("se o pacote do palco não chega, a página continua de pé, e o painel cumpre a tarefa e abre a saída", async ({ page }) => {
    const erros: string[] = [];
    page.on("pageerror", (erro) => erros.push(erro.message));
    await page.route("**/_next/static/chunks/*.js", (rota) => {
      const caminho = new URL(rota.request().url()).pathname;
      return STAGE_CHUNKS.includes(caminho) && !MAP_CHUNKS.includes(caminho) && bloqueados.has(caminho) ? rota.abort() : rota.continue();
    });
    await page.goto("/jogo/lula/");
    const falha = page.locator('[data-palco="falhou"]');
    await expect(falha).toBeVisible({ timeout: 30_000 });
    await expect(falha).toContainText("A cena não carregou");
    await expect(falha.getByRole("button", { name: "Recarregar a página" })).toBeVisible();
    // O cabeçalho do site e o do jogo continuam no lugar, em português.
    await expect(page.getByRole("link", { name: "Atlas Político" })).toBeVisible();
    await expect(page.locator("[data-objetivo]")).toBeVisible();

    // O caminho sem o cenário funciona: recolher pelo painel conclui a tarefa.
    await page.getByRole("button", { name: "Capítulos e tarefas" }).click();
    const painel = page.locator('[data-dialogo="painel"]');
    await expect(painel).toBeVisible();
    await painel.locator("[data-registro]:has-text('pedido pela tarefa') [data-recolher]").click();
    await expect(page.locator('[data-dialogo="registro"]')).toBeVisible();
    await page.getByRole("button", { name: "Guardar e continuar" }).click();
    await expect(page.locator("[data-jogo]")).toHaveAttribute("data-tarefa", "concluida");
    // Sem a cena para receber o foco, ele vai para o botão do painel, que é o caminho que resta.
    await expect(page.locator("[data-abrir-painel]")).toBeFocused();
    // A tarefa cumprida não abre a saída: o painel ainda não a oferece, e é por ele que se recolhem os registros que faltam.
    await expect(page.locator("[data-jogo]")).toHaveAttribute("data-saida", "fechada");
    await page.getByRole("button", { name: "Capítulos e tarefas" }).click();
    await expect(painel.locator("[data-atravessar-saida]")).toHaveCount(0);
    const porRecolher = await painel.locator("[data-recolher]").count();
    expect(porRecolher, "registros por recolher depois da tarefa").toBeGreaterThan(0);
    await page.keyboard.press("Escape");
    for (let i = 0; i < porRecolher; i += 1) {
      await page.getByRole("button", { name: "Capítulos e tarefas" }).click();
      await painel.locator("[data-recolher]").first().click();
      await expect(page.locator('[data-dialogo="registro"]')).toBeVisible();
      await page.getByRole("button", { name: "Guardar e continuar" }).click();
    }
    await expect(page.locator("[data-jogo]")).toHaveAttribute("data-saida", "aberta");
    // E a saída se atravessa por ele.
    await page.getByRole("button", { name: "Capítulos e tarefas" }).click();
    await painel.locator("[data-atravessar-saida]").click();
    await expect(page.locator("[data-transicao]")).toBeVisible();
    expect(erros, "erros não tratados na página").toEqual([]);
  });

  test("se o pacote da prévia não chega, a escolha de personagem continua valendo", async ({ page }) => {
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
    await outra.route("**/_next/static/chunks/*.js", (rota) => (comDesenho.includes(new URL(rota.request().url()).pathname) ? rota.abort() : rota.continue()));
    await outra.goto("/jogo/");
    await outra.waitForLoadState("networkidle");
    await expect(outra.getByRole("heading", { level: 1 })).toContainText("Percorra a trajetória em capítulos");
    await expect(outra.locator("[data-escolha]")).toHaveCount(2);
    await expect(outra.locator('[data-jogar="lula"]')).toHaveAttribute("href", "/jogo/lula/");
    await expect(outra.locator("[data-previa-mundo]")).toHaveCount(0);
    await outra.close();
  });

  test("endereço de personagem que não existe responde 404 com a página do atlas", async ({ page }) => {
    const resposta = await page.goto("/jogo/ninguem/");
    expect(resposta!.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Este endereço não está no atlas");
  });
});
