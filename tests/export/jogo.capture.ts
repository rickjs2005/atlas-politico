// Capturas do jogo em fases curtas (a trilha), para docs/capturas/jogo-trilha/.
// Tiradas da saída estática: `npm run build` e `npm run capture:game`. Não é
// teste do jogo: só registra as telas. Os testes ficam em
// `tests/e2e/jogo.spec.ts` e `tests/export/jogo.spec.ts`.
//
// O celular é emulado, com toque: 390×844 em pé, 360×640 (a tela mais
// estreita e baixa que o projeto confere) e 844×390 deitado. As fases
// avançadas são abertas pelo endereço (`?fase=N`): nenhuma fase segura a
// seguinte, e por isso o roteiro não precisa de progresso salvo para chegar a
// elas. Só no passaporte há capturas que partem de um progresso posto no
// navegador, no formato que o jogo grava: as do fim das trajetórias e as do
// celular estreito.

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { expect, test, type Browser, type Locator, type Page } from "@playwright/test";

import {
  PERSONAGENS,
  abrir,
  abrirMarco,
  conteudoDe,
  fasesDe,
  janela,
  jogo,
  lerESeguir,
  opcoesDe,
  ordemDe,
  progressoCom,
  pronto,
  refKey,
  responder,
  rota,
  semear,
  type Slug,
} from "../e2e/jogo-apoio";

const OUT = process.env.GAME_CAPTURE_DIR ?? "docs/capturas/jogo-trilha";
const COMPUTADOR = { width: 1440, height: 900 };
const CELULAR = { width: 390, height: 844 };
const CELULAR_ESTREITO = { width: 360, height: 640 };
const CELULAR_DEITADO = { width: 844, height: 390 };
/** O servidor de pré-visualização (playwright.export.config.ts). */
const ORIGEM = "http://localhost:4311";

const shot = async (page: Page, nome: string, opcoes: { rolada?: boolean; inteira?: boolean } = {}) => {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(350);
  // A captura mostra a tela como a pessoa a encontra: fora as que rolam de propósito, nenhum passo do roteiro rola a página.
  if (!opcoes.rolada && !opcoes.inteira) expect(await page.evaluate(() => Math.round(window.scrollY)), `rolagem da página na captura ${nome}`).toBe(0);
  await page.screenshot({ path: `${OUT}/${nome}.png`, fullPage: opcoes.inteira === true });
};

/** Rola o corpo de uma janela até um trecho dela, sem rolar a página. */
async function mostrar(caixa: Locator, seletor: string) {
  await caixa.locator("[data-janela-corpo]").evaluate((corpo, alvo) => {
    const no = corpo.querySelector(alvo);
    if (no === null) return;
    corpo.scrollTop += no.getBoundingClientRect().top - corpo.getBoundingClientRect().top - 12;
  }, seletor);
}

/** Uma página de celular: janela estreita, com toque e movimento reduzido, como o resto do roteiro. */
async function celular(browser: Browser, viewport: { width: number; height: number }, extras: { javaScriptEnabled?: boolean } = {}) {
  const context = await browser.newContext({ baseURL: ORIGEM, viewport, isMobile: true, hasTouch: true, reducedMotion: "reduce", ...extras });
  return { context, page: await context.newPage() };
}

test("entradas: a do atlas e a do jogo, para quem chega e para quem volta", async ({ page, browser }) => {
  await page.setViewportSize(COMPUTADOR);
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await shot(page, "01-entrada-do-atlas--computador");
  await page.goto("/jogo/");
  await expect(page.locator("[data-previa-mundo]")).toHaveCount(2);
  await page.waitForLoadState("networkidle");
  await shot(page, "02-entrada-do-jogo--computador");
  await shot(page, "02-entrada-do-jogo-pagina-inteira--computador", { inteira: true });

  // Quem volta: uma trajetória em andamento e a outra por começar.
  await abrir(page, "lula", 1);
  await lerESeguir(page);
  await lerESeguir(page);
  await page.goto("/jogo/");
  await expect(page.locator('[data-escolha="lula"]')).toHaveAttribute("data-situacao", "em-andamento");
  await page.waitForLoadState("networkidle");
  await shot(page, "03-entrada-do-jogo-de-quem-volta--computador");
  // A lista das fases, aberta na entrada.
  await page.locator('[data-escolha="lula"] [data-fases-da-trilha] summary').click();
  await page.locator('[data-escolha="flavio-bolsonaro"] [data-fases-da-trilha] summary').click();
  await shot(page, "04-entrada-do-jogo-com-as-fases-abertas--computador", { inteira: true });

  const movel = await celular(browser, CELULAR);
  await movel.page.goto("/");
  await movel.page.waitForLoadState("networkidle");
  await shot(movel.page, "01-entrada-do-atlas--celular");
  await movel.page.goto("/jogo/");
  await expect(movel.page.locator("[data-previa-mundo]")).toHaveCount(2);
  await movel.page.waitForLoadState("networkidle");
  await shot(movel.page, "02-entrada-do-jogo--celular");
  await shot(movel.page, "02-entrada-do-jogo-pagina-inteira--celular", { inteira: true });
  await movel.context.close();
});

for (const slug of PERSONAGENS) {
  test(`${slug}: o ciclo de uma fase, do marco à fase seguinte`, async ({ page }) => {
    await page.setViewportSize(COMPUTADOR);
    const [primeira, segunda] = fasesDe(slug);
    const { certa, errada } = opcoesDe(primeira!);
    await abrir(page, slug, 1);
    await shot(page, `${slug}-05-fase-1-cena`);

    const fase = await abrirMarco(page);
    await shot(page, `${slug}-06-fase-1-explicacao`);
    await mostrar(fase, "[data-atividade]");
    await shot(page, `${slug}-07-fase-1-atividade`);
    await responder(fase, errada);
    await expect(fase.locator("[data-resultado]")).toHaveAttribute("data-resultado", "errado");
    await mostrar(fase, "[data-atividade]");
    await shot(page, `${slug}-08-fase-1-resposta-errada`);
    await fase.locator("[data-tentar-de-novo]").click();
    await responder(fase, certa);
    await expect(fase.locator("[data-resultado]")).toHaveAttribute("data-resultado", "certo");
    await mostrar(fase, "[data-atividade]");
    await shot(page, `${slug}-09-fase-1-resposta-certa`);
    await mostrar(fase, "[data-explorar]");
    await shot(page, `${slug}-10-fase-1-explorar-e-lacunas`);
    await page.keyboard.press("Escape");
    await expect(jogo(page)).toHaveAttribute("data-vista", "base");
    await shot(page, `${slug}-11-fase-1-concluida`);
    await page.locator(`[data-continuar="${segunda!.id}"]`).click();
    await expect(jogo(page)).toHaveAttribute("data-fase-aberta", segunda!.id);
    await page.waitForTimeout(400);
    await shot(page, `${slug}-12-fase-2-cena`);
  });

  test(`${slug}: os cenários das fases da trajetória`, async ({ page }) => {
    await page.setViewportSize(COMPUTADOR);
    for (const fase of fasesDe(slug).slice(2)) {
      await abrir(page, slug, fase.numero);
      await shot(page, `${slug}-13-cena-da-fase-${fase.numero}`);
    }
  });

  test(`${slug}: ordenação, fontes da fase, termos, registros e fase de processos`, async ({ page }) => {
    await page.setViewportSize(COMPUTADOR);
    const content = conteudoDe(slug);
    const processos = content.fases.find((item) => item.id === `${slug}-processos`)!;
    await abrir(page, slug, processos.numero);
    const fase = await abrirMarco(page);
    await shot(page, `${slug}-14-fase-de-processos-explicacao`);
    await mostrar(fase, "[data-ficha-judicial], [data-conceito]");
    await shot(page, `${slug}-15-fase-de-processos-ficha-e-termos`);
    // Um termo aberto, com a definição, o que ela simplifica e o texto oficial.
    await fase.locator("[data-conceito] summary").first().click();
    await mostrar(fase, "[data-conceito]");
    await shot(page, `${slug}-16-termo-explicado`);
    // As fontes de cada bloco.
    await fase.locator("[data-fontes-da-fase] summary").click();
    await mostrar(fase, "[data-fontes-da-fase]");
    await shot(page, `${slug}-17-fontes-da-fase`);
    // A ordenação: a pergunta, a ordem errada com a explicação e a ordem certa com as datas.
    const ordem = ordemDe(processos, content);
    await mostrar(fase, "[data-atividade]");
    await shot(page, `${slug}-18-ordenacao`);
    for (const chave of [...ordem].reverse()) await fase.locator(`[data-ordem-item="${chave}"]`).click();
    await fase.locator("[data-responder]").click();
    await expect(fase.locator("[data-resultado]")).toHaveAttribute("data-resultado", "errado");
    await mostrar(fase, "[data-atividade]");
    await shot(page, `${slug}-19-ordenacao-errada`);
    await fase.locator("[data-tentar-de-novo]").click();
    for (const chave of ordem) await fase.locator(`[data-ordem-item="${chave}"]`).click();
    await fase.locator("[data-responder]").click();
    await expect(fase.locator("[data-resultado]")).toHaveAttribute("data-resultado", "certo");
    await mostrar(fase, "[data-atividade]");
    await shot(page, `${slug}-20-ordenacao-certa`);
    // O registro do marco: um episódio de processo, com a natureza, os relacionados e o aviso.
    await fase.locator(`[data-apoio="${refKey(processos.marco)}"] [data-abrir-registro]`).click();
    const registro = await janela(page, "registro");
    await shot(page, `${slug}-21-registro-de-processo`);
    await mostrar(registro, "[data-relacionado], [data-aviso-judicial]");
    await shot(page, `${slug}-22-registro-de-processo-relacionados`);
  });

  test(`${slug}: a eleição de 2026, as propostas e o resumo`, async ({ page }) => {
    await page.setViewportSize(COMPUTADOR);
    const fases = fasesDe(slug);
    const ultima = fases.at(-1)!;
    await abrir(page, slug, ultima.numero);
    const fase = await abrirMarco(page);
    await shot(page, `${slug}-23-fase-de-2026-explicacao`);
    await mostrar(fase, "[data-explorar]");
    await shot(page, `${slug}-24-fase-de-2026-propostas`);
    await fase.locator('[data-explorar] [data-abrir-registro^="proposta:"]').first().click();
    await janela(page, "registro");
    await shot(page, `${slug}-25-proposta-registrada`);
    await page.keyboard.press("Escape");
    await expect(page.locator('[data-dialogo="registro"]')).toHaveCount(0);
    await fase.locator("[data-ver-explicacao]").click();
    await fase.locator('[data-continuar="resumo"]').click();
    const resumo = await janela(page, "resumo");
    await shot(page, `${slug}-26-resumo-da-trajetoria`);
    await mostrar(resumo, "[data-resumo-lacunas]");
    await shot(page, `${slug}-27-resumo-lacunas-e-caminhos`);
  });

  test(`${slug}: os aprofundamentos`, async ({ page }) => {
    await page.setViewportSize(COMPUTADOR);
    for (const sala of ["economia", "seguranca-publica"] as const) {
      const [fase] = fasesDe(slug, sala);
      await page.goto(rota(slug, sala));
      await pronto(page);
      await shot(page, `${slug}-28-aprofundamento-${sala}-cena`);
      const aberta = await abrirMarco(page);
      await shot(page, `${slug}-29-aprofundamento-${sala}-explicacao`);
      // O registro de decisão do marco, com o cartão do atlas.
      await aberta.locator("[data-fontes-da-fase] summary").click();
      await aberta.locator(`[data-apoio="${refKey(fase!.marco)}"] [data-abrir-registro]`).click();
      await janela(page, "registro");
      await shot(page, `${slug}-30-aprofundamento-${sala}-decisao`);
    }
  });
}

test("a atuação legislativa, o fato biográfico, a lista de fases, o guia e a volta da ficha", async ({ page }) => {
  await page.setViewportSize(COMPUTADOR);
  // A atuação legislativa: o marco da terceira fase de Flávio Bolsonaro.
  const flavio = conteudoDe("flavio-bolsonaro");
  const terceira = flavio.fases[2]!;
  await abrir(page, "flavio-bolsonaro", 3);
  let fase = await abrirMarco(page);
  await fase.locator("[data-fontes-da-fase] summary").click();
  await fase.locator(`[data-apoio="${refKey(terceira.marco)}"] [data-abrir-registro]`).click();
  let registro = await janela(page, "registro");
  await shot(page, "31-atuacao-legislativa-cartao");
  await mostrar(registro, "[data-atuacao]");
  await shot(page, "32-atuacao-legislativa-materia-e-destino");

  // O fato biográfico: um registro opcional da primeira fase de Lula, aberto pela pasta do cenário.
  const lula = conteudoDe("lula");
  const opcional = lula.fases[0]!.explorar[0]!;
  await abrir(page, "lula", 1);
  await page.locator(`[data-marcador="${refKey(opcional)}"]`).click();
  await janela(page, "registro");
  await shot(page, "33-fato-biografico-aberto-pelo-cenario");
  await page.keyboard.press("Escape");

  // A lista de fases, com o que já foi feito, e o guia.
  await lerESeguir(page);
  await page.locator("[data-abrir-fases]").click();
  await janela(page, "fases");
  await shot(page, "34-lista-de-fases");
  await page.keyboard.press("Escape");
  await page.locator("[data-abrir-ajuda]").click();
  await janela(page, "ajuda");
  await shot(page, "35-como-funciona");
  await page.keyboard.press("Escape");

  // A ficha completa no atlas, aberta pelo jogo, com a volta.
  const evento = "lula-1975-eleito-presidente-do-sindicato";
  fase = await abrirMarco(page);
  await fase.locator("[data-fontes-da-fase] summary").click();
  await fase.locator(`[data-apoio="acontecimento:${evento}"] [data-abrir-registro]`).click();
  registro = await janela(page, "registro");
  await shot(page, "36-registro-de-acontecimento");
  await registro.locator(`[data-ficha="${lula.registros[evento]!.slug}"]`).click();
  await expect(page.locator('[data-retorno="jogo"]')).toBeVisible();
  await shot(page, "37-pagina-do-acontecimento-com-volta-ao-jogo");
});

test("retomada, leitura sem o cenário, cena indisponível e rodapé", async ({ page }) => {
  await page.setViewportSize(COMPUTADOR);
  const slug: Slug = "flavio-bolsonaro";
  await abrir(page, slug, 1);
  await lerESeguir(page);
  await lerESeguir(page);
  // Quem chega sem pedir fase cai onde parou, e a tela diz isso.
  await page.goto(rota(slug));
  await pronto(page);
  await shot(page, "38-retomada-com-o-aviso");
  // O rodapé da página do jogo, rolada de propósito.
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await shot(page, "39-rodape-da-pagina-do-jogo", { rolada: true });
  await page.evaluate(() => window.scrollTo(0, 0));

  // Ler sem o cenário: a fase na página, a atividade e a navegação entre fases.
  await page.locator("[data-ler-sem-cenario]").click();
  await expect(jogo(page)).toHaveAttribute("data-modo", "leitura");
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, "40-leitura-sem-o-cenario", { rolada: true });
  await shot(page, "41-leitura-sem-o-cenario-pagina-inteira", { inteira: true });
  await page.locator("[data-voltar-ao-cenario]").click();
  await pronto(page);
});

test("cena indisponível: sem o canvas e sem o pacote do palco", async ({ browser }) => {
  // O navegador não dá o canvas.
  const semCanvas = await browser.newContext({ baseURL: ORIGEM, viewport: COMPUTADOR, reducedMotion: "reduce" });
  const pagina = await semCanvas.newPage();
  await pagina.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext;
  });
  await pagina.goto(`${rota("lula")}?fase=1`);
  await pronto(pagina, false);
  await expect(pagina.locator('[data-palco="sem-canvas"]')).toBeVisible();
  await shot(pagina, "42-cena-indisponivel-sem-canvas");
  await semCanvas.close();

  // O pacote do palco não chega.
  const chunks = path.join(path.resolve(process.env.OUT_DIR ?? "out"), "_next", "static", "chunks");
  const doPalco = readdirSync(chunks)
    .filter((nome) => nome.endsWith(".js") && readFileSync(path.join(chunks, nome), "utf8").includes("atlas-jogo-palco"))
    .map((nome) => `/_next/static/chunks/${nome}`);
  const semPacote = await browser.newContext({ baseURL: ORIGEM, viewport: COMPUTADOR, reducedMotion: "reduce" });
  const outra = await semPacote.newPage();
  await outra.route("**/_next/static/chunks/*.js", (pedido) => (doPalco.includes(new URL(pedido.request().url()).pathname) ? pedido.abort() : pedido.continue()));
  await outra.goto(`${rota("lula")}?fase=1`);
  await expect(outra.locator('[data-palco="falhou"]')).toBeVisible({ timeout: 30_000 });
  await shot(outra, "43-cena-nao-carregou");
  await semPacote.close();

  // Sem JavaScript: a casca sai, e a página começa pelo texto das fases.
  for (const [nome, viewport] of [
    ["computador", COMPUTADOR],
    ["celular", CELULAR],
  ] as const) {
    const semScript = await browser.newContext({ baseURL: ORIGEM, viewport, javaScriptEnabled: false });
    const texto = await semScript.newPage();
    await texto.goto(rota("lula"));
    await texto.waitForTimeout(350);
    await texto.screenshot({ path: `${OUT}/44-sem-javascript--${nome}.png` });
    await semScript.close();
  }
});

test("celular: em pé, estreito e deitado", async ({ browser }) => {
  const slug: Slug = "lula";
  const emPe = await celular(browser, CELULAR);
  let page = emPe.page;
  await page.goto(`${rota(slug)}?fase=1`);
  await pronto(page);
  await shot(page, "45-celular-fase-1-cena");
  await page.locator("[data-abrir-marco]").tap();
  let fase = await janela(page, "fase");
  await shot(page, "46-celular-fase-1-explicacao");
  await mostrar(fase, "[data-atividade]");
  await shot(page, "47-celular-fase-1-atividade");
  await fase.locator(`[data-opcao="${opcoesDe(fasesDe(slug)[0]!).certa}"]`).tap();
  await fase.locator("[data-responder]").tap();
  await mostrar(fase, "[data-atividade]");
  await shot(page, "48-celular-fase-1-resposta-certa");
  await fase.locator("[data-continuar]").tap();
  await page.waitForTimeout(400);
  await shot(page, "49-celular-fase-2-cena");
  await page.locator("[data-abrir-fases]").tap();
  await janela(page, "fases");
  await shot(page, "50-celular-lista-de-fases");
  await page.keyboard.press("Escape");
  // As fases de processos e de 2026, em celular.
  const processos = fasesDe(slug).find((item) => item.id === `${slug}-processos`)!;
  await page.goto(`${rota(slug)}?fase=${processos.numero}`);
  await pronto(page);
  await shot(page, "51-celular-fase-de-processos-cena");
  await page.locator("[data-abrir-marco]").tap();
  await janela(page, "fase");
  await shot(page, "52-celular-fase-de-processos-explicacao");
  // A leitura sem o cenário, em celular.
  await page.goto(`${rota(slug)}?fase=2&leitura=1`);
  await pronto(page, false);
  await shot(page, "53-celular-leitura-sem-o-cenario");
  await emPe.context.close();

  // A tela mais estreita e baixa: a cena, o aviso de retomada e a janela.
  const estreito = await celular(browser, CELULAR_ESTREITO);
  page = estreito.page;
  await page.goto(`${rota("flavio-bolsonaro")}?fase=1`);
  await pronto(page);
  await shot(page, "54-celular-estreito-fase-1-cena");
  for (let vez = 0; vez < 2; vez += 1) {
    await page.locator("[data-abrir-marco]").tap();
    fase = await janela(page, "fase");
    if (vez === 0) await shot(page, "55-celular-estreito-explicacao");
    await fase.locator("[data-ver-explicacao]").tap();
    await fase.locator("[data-continuar]").tap();
  }
  await page.goto(rota("flavio-bolsonaro"));
  await pronto(page);
  await shot(page, "56-celular-estreito-retomada");
  await page.goto(rota("flavio-bolsonaro", "seguranca-publica"));
  await pronto(page);
  await shot(page, "57-celular-estreito-aprofundamento");
  await estreito.context.close();

  const deitado = await celular(browser, CELULAR_DEITADO);
  page = deitado.page;
  await page.goto(`${rota(slug)}?fase=5`);
  await pronto(page);
  await shot(page, "58-celular-deitado-cena");
  await page.locator("[data-abrir-marco]").tap();
  await janela(page, "fase");
  await shot(page, "59-celular-deitado-explicacao");
  await deitado.context.close();
});

test("o passaporte do Escrivão: o carimbo, a faixa, a caderneta, os selos e o fim das trajetórias", async ({ page, browser }) => {
  await page.setViewportSize(COMPUTADOR);
  const slug: Slug = "lula";
  const outro: Slug = "flavio-bolsonaro";
  const fases = fasesDe(slug);
  const ultima = fases.at(-1)!;
  const ids = (lista: readonly { id: string }[]) => lista.map((item) => item.id);

  // A primeira fase concluída: o carimbo novo, a confirmação e, logo abaixo, a fase seguinte e o botão de continuar.
  await abrir(page, slug, 1);
  let fase = await abrirMarco(page);
  await fase.locator("[data-ver-explicacao]").click();
  await expect(fase.locator('[data-carimbo="novo"]')).toBeVisible();
  await mostrar(fase, "[data-resultado]");
  await shot(page, "64-passaporte-carimbo-novo-e-fase-seguinte");
  await fase.locator("[data-continuar]").click();
  await expect(jogo(page)).toHaveAttribute("data-fase-aberta", fases[1]!.id);
  await page.waitForTimeout(400);
  // A faixa do cartão da fase: o que foi concluído, o que falta e a fase aberta.
  await shot(page, "65-passaporte-faixa-no-cartao-da-fase");

  // A terceira fase concluída traz o primeiro selo.
  await lerESeguir(page);
  fase = await abrirMarco(page);
  await fase.locator("[data-ver-explicacao]").click();
  await expect(fase.locator("[data-selo-novo]")).toBeVisible();
  await mostrar(fase, "[data-resultado]");
  await shot(page, "66-passaporte-selo-novo");
  // A caderneta, aberta de dentro da fase: uma página por pessoa, e os selos.
  await fase.locator("[data-ver-passaporte]").click();
  let passaporte = await janela(page, "passaporte");
  await shot(page, "67-passaporte-caderneta");
  await mostrar(passaporte, "[data-selos]");
  await shot(page, "68-passaporte-selos");
  await passaporte.locator("[data-fechar-passaporte]").click();
  await expect(page.locator('[data-dialogo="passaporte"]')).toHaveCount(0);
  // Uma fase já concluída, aberta de novo: a linha do carimbo, sem comemorar outra vez.
  await page.keyboard.press("Escape");
  await expect(jogo(page)).toHaveAttribute("data-vista", "base");
  await abrir(page, slug, 1);
  fase = await abrirMarco(page);
  await mostrar(fase, "[data-resultado]");
  await shot(page, "69-passaporte-fase-ja-carimbada");

  // Uma trajetória percorrida, com a outra por fazer: o convite, na fase e no resumo.
  const umaPercorrida = await browser.newContext({ baseURL: ORIGEM, viewport: COMPUTADOR, reducedMotion: "reduce" });
  let pagina = await umaPercorrida.newPage();
  await semear(pagina, slug, progressoCom(slug, ids(fases.slice(0, -1))));
  await pagina.goto(`${rota(slug)}?fase=${ultima.numero}`);
  await pronto(pagina);
  fase = await abrirMarco(pagina);
  await fase.locator("[data-ver-explicacao]").click();
  await expect(fase.locator('[data-fim-da-trajetoria="percorrida"]')).toBeVisible();
  await mostrar(fase, "[data-resultado]");
  await shot(pagina, "70-passaporte-trajetoria-percorrida");
  await fase.locator("[data-continuar]").click();
  await janela(pagina, "resumo");
  await shot(pagina, "71-passaporte-resumo-com-o-convite");
  await umaPercorrida.close();

  // As duas percorridas: a comparação e os aprofundamentos, e a caderneta completa.
  const asDuas = await browser.newContext({ baseURL: ORIGEM, viewport: COMPUTADOR, reducedMotion: "reduce" });
  pagina = await asDuas.newPage();
  await semear(pagina, outro, progressoCom(outro, ids(fasesDe(outro)), "resposta"));
  await semear(pagina, slug, progressoCom(slug, ids(fases.slice(0, -1))));
  await pagina.goto(`${rota(slug)}?fase=${ultima.numero}`);
  await pronto(pagina);
  fase = await abrirMarco(pagina);
  await fase.locator("[data-ver-explicacao]").click();
  await expect(fase.locator('[data-fim-da-trajetoria="todas"]')).toBeVisible();
  await mostrar(fase, "[data-resultado]");
  await shot(pagina, "72-passaporte-duas-trajetorias-percorridas");
  await fase.locator("[data-ver-passaporte]").click();
  passaporte = await janela(pagina, "passaporte");
  await shot(pagina, "73-passaporte-caderneta-completa");
  await mostrar(passaporte, "[data-selos]");
  await shot(pagina, "74-passaporte-selos-completos");
  await asDuas.close();

  // Em celular: o carimbo novo, a caderneta e os selos.
  const movel = await celular(browser, CELULAR);
  pagina = movel.page;
  await pagina.goto(`${rota(slug)}?fase=1`);
  await pronto(pagina);
  await pagina.locator("[data-abrir-marco]").tap();
  fase = await janela(pagina, "fase");
  await fase.locator("[data-ver-explicacao]").tap();
  await expect(fase.locator('[data-carimbo="novo"]')).toBeVisible();
  await mostrar(fase, "[data-resultado]");
  await shot(pagina, "75-celular-passaporte-carimbo-novo");
  await mostrar(fase, "[data-proxima-fase]");
  await shot(pagina, "76-celular-passaporte-fase-seguinte");
  await fase.locator("[data-ver-passaporte]").tap();
  passaporte = await janela(pagina, "passaporte");
  await shot(pagina, "77-celular-passaporte-caderneta");
  await movel.context.close();

  // A tela mais estreita e baixa, com três carimbos de uma visita anterior: a faixa no cartão, a caderneta e os selos.
  const estreito = await celular(browser, CELULAR_ESTREITO);
  pagina = estreito.page;
  await semear(pagina, slug, progressoCom(slug, ids(fases.slice(0, 3))));
  await pagina.goto(`${rota(slug)}?fase=4`);
  await pronto(pagina);
  await shot(pagina, "78-celular-estreito-passaporte-faixa");
  await pagina.locator("[data-abrir-passaporte]").tap();
  passaporte = await janela(pagina, "passaporte");
  await shot(pagina, "79-celular-estreito-passaporte-caderneta");
  await mostrar(passaporte, "[data-selos]");
  await shot(pagina, "80-celular-estreito-passaporte-selos");
  await estreito.context.close();
});

test("a comparação curta e as propostas por área", async ({ page, browser }) => {
  await page.setViewportSize(COMPUTADOR);
  await page.goto("/comparar/");
  await page.waitForLoadState("networkidle");
  await shot(page, "60-comparacao-primeira-tela--computador");
  await page.locator("#resumo").screenshot({ path: `${OUT}/61-comparacao-resumo--computador.png` });
  await page.locator("#propostas").screenshot({ path: `${OUT}/62-comparacao-propostas--computador.png` });
  await page.locator('#decisoes [data-tema="outros-assuntos"]').screenshot({ path: `${OUT}/63-comparacao-outros-assuntos--computador.png` });
  const movel = await celular(browser, CELULAR);
  await movel.page.goto("/comparar/");
  await movel.page.waitForLoadState("networkidle");
  await shot(movel.page, "60-comparacao-primeira-tela--celular");
  await movel.page.locator("#resumo").screenshot({ path: `${OUT}/61-comparacao-resumo--celular.png` });
  await movel.context.close();
});
