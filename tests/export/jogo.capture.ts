// Capturas do jogo, etapa 1, para docs/capturas/jogo-etapa-1/. Tiradas da saída
// estática: `npm run build` e `npm run capture:game`. Não é teste do jogo: só
// registra as telas. Os testes ficam em `tests/e2e/jogo.spec.ts` e
// `tests/export/jogo.spec.ts`.
//
// O celular é emulado: janela de 390×844, com toque, e de 844×390 deitado.

import { expect, test, type Page } from "@playwright/test";

import { chaptersOf } from "@/lib/game/chapters";
import { getScene } from "@/lib/game/scenes";
import type { ChapterSpec } from "@/lib/game/types";

import { clearProgress, clicar, jogo, palco, walkTo } from "../e2e/jogo-caminho";

const OUT = process.env.GAME_CAPTURE_DIR ?? "docs/capturas/jogo-etapa-1";
const COMPUTADOR = { width: 1440, height: 900 };
const CELULAR = { width: 390, height: 844 };
const CELULAR_DEITADO = { width: 844, height: 390 };

const PERSONAGENS = ["flavio-bolsonaro", "lula"] as const;

const shot = async (page: Page, nome: string, rolada = false) => {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(350);
  // A captura mostra a tela como a pessoa a encontra: fora a que rola de propósito, nenhum passo do roteiro rola a página.
  if (!rolada) expect(await page.evaluate(() => Math.round(window.scrollY)), `rolagem da página na captura ${nome}`).toBe(0);
  await page.screenshot({ path: `${OUT}/${nome}.png` });
};

// Os cliques dentro de uma janela passam por `clicar` (tests/e2e/jogo-caminho.ts),
// que espera a janela aceitar ponteiro: sem isso o robô rola a página, e as
// capturas seguintes sairiam com ela fora do lugar.

const guardar = (page: Page) => page.getByRole("button", { name: /Guardar e/ });
const abrirPainel = (page: Page) => page.getByRole("button", { name: "Capítulos e tarefas" }).click();

async function ready(page: Page) {
  await expect(palco(page)).toHaveAttribute("data-palco", "pronto", { timeout: 30_000 });
  await palco(page).focus();
  await page.waitForTimeout(500);
}

async function openFresh(page: Page, rota: string) {
  await page.goto(rota);
  await clearProgress(page);
  await page.reload();
  await ready(page);
}

const posicaoDe = (capitulo: ChapterSpec, eventId: string) => getScene(capitulo.cena).registros[capitulo.eventIds.indexOf(eventId)]!;
const exigidos = (capitulo: ChapterSpec) => (capitulo.tarefa.tipo === "registro" ? [capitulo.tarefa.eventId] : [...capitulo.tarefa.eventIds]);

const foraDaTarefa = (capitulo: ChapterSpec) => capitulo.eventIds.filter((id) => !exigidos(capitulo).includes(id));

/** Responde a pergunta de ordem que está aberta: tenta uma opção e, se errar, troca. */
async function answerOrder(page: Page, capitulo: ChapterSpec) {
  if (capitulo.tarefa.tipo !== "ordem") return;
  const ordem = page.locator('[data-dialogo="ordem"]');
  await expect(ordem).toBeVisible();
  const [a, b] = capitulo.tarefa.eventIds;
  await clicar(page, ordem.locator(`[data-escolher-primeiro="${a}"]`));
  await clicar(page, ordem.locator("[data-confirmar-ordem]"));
  if ((await ordem.locator("[data-ordem-resultado]").getAttribute("data-ordem-resultado")) === "errado") {
    await clicar(page, ordem.locator("[data-tentar-de-novo]"));
    await clicar(page, ordem.locator(`[data-escolher-primeiro="${b}"]`));
    await clicar(page, ordem.locator("[data-confirmar-ordem]"));
  }
  await clicar(page, ordem.locator("[data-ordem-concluida]"));
}

/** Recolhe um registro pelo painel e guarda; responde a ordem, se a pergunta abrir em seguida. */
async function collectByPanel(page: Page, capitulo: ChapterSpec, id: string) {
  await abrirPainel(page);
  await clicar(page, page.locator(`[data-recolher="${id}"]`));
  await clicar(page, guardar(page));
  await expect(jogo(page)).toHaveAttribute("data-modo", /^(jogando|ordem)$/);
  if ((await jogo(page).getAttribute("data-modo")) === "ordem") await answerOrder(page, capitulo);
}

/**
 * Abre a saída do capítulo aberto pelo painel, sem o cenário: recolhe o que
 * ainda falta, primeiro o que a tarefa pede, e responde a ordem. A saída só
 * abre com a tarefa cumprida e todos os registros recolhidos.
 */
async function openExitByPanel(page: Page, capitulo: ChapterSpec) {
  await abrirPainel(page);
  await expect(page.locator("[data-registro]")).toHaveCount(capitulo.eventIds.length);
  const recolhidos = await page.locator('[data-registro][data-recolhido="sim"]').evaluateAll((nos) => nos.map((no) => no.getAttribute("data-registro")));
  await page.keyboard.press("Escape");
  await expect(page.locator('[data-dialogo="painel"]')).toHaveCount(0);
  for (const id of [...exigidos(capitulo), ...foraDaTarefa(capitulo)]) {
    if (!recolhidos.includes(id)) await collectByPanel(page, capitulo, id);
  }
  await expect(jogo(page)).toHaveAttribute("data-saida", "aberta");
}

async function crossByPanel(page: Page) {
  await abrirPainel(page);
  await clicar(page, page.locator("[data-atravessar-saida]"));
}

test.describe("entrada", () => {
  test("entrada do atlas e escolha de personagem", async ({ page }) => {
    for (const [nome, tela] of [
      ["computador", COMPUTADOR],
      ["celular", CELULAR],
    ] as const) {
      await page.setViewportSize(tela);
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await shot(page, `01-entrada-do-atlas--${nome}`);
      await page.goto("/jogo/");
      await clearProgress(page);
      await page.reload();
      await page.waitForLoadState("networkidle");
      await expect(page.locator("[data-previa-mundo]").first()).toBeVisible();
      await shot(page, `02-escolha-de-personagem--${nome}`);
    }
  });
});

for (const personagem of PERSONAGENS) {
  const [primeiro, segundo] = chaptersOf(personagem) as [ChapterSpec, ChapterSpec];
  const cena1 = getScene(primeiro.cena);
  const cena2 = getScene(segundo.cena);

  test.describe(personagem, () => {
    test("capítulo 1: cena, registro ao alcance, registro recolhido, saída aberta e transição", async ({ page }) => {
      test.slow();
      await page.setViewportSize(COMPUTADOR);
      await openFresh(page, `/jogo/${personagem}/`);
      await shot(page, `${personagem}-03-capitulo-1`);

      const alvo = exigidos(primeiro)[0]!;
      await walkTo(page, cena1, posicaoDe(primeiro, alvo));
      await shot(page, `${personagem}-04-registro-ao-alcance`);
      await page.keyboard.press("e");
      await expect(page.locator('[data-dialogo="registro"]')).toBeVisible();
      await shot(page, `${personagem}-05-registro-recolhido`);
      await clicar(page, guardar(page));
      // A tarefa está cumprida; a porta abre com os registros que faltam, recolhidos aqui pelo painel.
      await openExitByPanel(page, primeiro);
      await palco(page).focus();
      await page.waitForTimeout(900);
      await shot(page, `${personagem}-06-saida-aberta`);

      await walkTo(page, cena1, { x: cena1.saida.x, y: cena1.saida.y }, true);
      await expect(page.locator("[data-transicao]")).toBeVisible();
      await shot(page, `${personagem}-07-transicao`);
      await clicar(page, page.getByRole("button", { name: "Continuar" }));
      await expect(jogo(page)).toHaveAttribute("data-capitulo", segundo.id);
      await ready(page);
      await shot(page, `${personagem}-08-capitulo-2`);
    });

    test("capítulo 2: tarefa de ordem, nova tentativa, painel e fim da etapa", async ({ page }) => {
      test.slow();
      await page.setViewportSize(COMPUTADOR);
      await openFresh(page, `/jogo/${personagem}/`);
      await openExitByPanel(page, primeiro);
      await crossByPanel(page);
      await clicar(page, page.getByRole("button", { name: "Continuar" }));
      await expect(jogo(page)).toHaveAttribute("data-capitulo", segundo.id);
      await ready(page);

      // Os dois registros pelo cenário, e a ordem errada primeiro.
      const [a, b] = exigidos(segundo) as [string, string];
      for (const id of [a, b]) {
        await walkTo(page, cena2, posicaoDe(segundo, id));
        await page.keyboard.press("e");
        await clicar(page, guardar(page));
      }
      const ordem = page.locator('[data-dialogo="ordem"]');
      await expect(ordem).toBeVisible();
      await shot(page, `${personagem}-09-tarefa-de-ordem`);
      await clicar(page, ordem.locator(`[data-escolher-primeiro="${b}"]`));
      await clicar(page, ordem.locator("[data-confirmar-ordem]"));
      const errou = (await ordem.locator("[data-ordem-resultado]").getAttribute("data-ordem-resultado")) === "errado";
      if (errou) {
        await shot(page, `${personagem}-10-ordem-errada-com-explicacao`);
        await clicar(page, ordem.locator("[data-tentar-de-novo]"));
        await clicar(page, ordem.locator(`[data-escolher-primeiro="${a}"]`));
        await clicar(page, ordem.locator("[data-confirmar-ordem]"));
      }
      await shot(page, `${personagem}-11-ordem-certa`);
      await clicar(page, ordem.locator("[data-ordem-concluida]"));

      // O registro que a tarefa não pede, pelo cenário: é ele que abre a saída.
      for (const id of foraDaTarefa(segundo)) {
        await walkTo(page, cena2, posicaoDe(segundo, id));
        await page.keyboard.press("e");
        await clicar(page, guardar(page));
      }
      await expect(jogo(page)).toHaveAttribute("data-saida", "aberta");

      await abrirPainel(page);
      await shot(page, `${personagem}-12-painel-de-capitulos`);
      await page.keyboard.press("Escape");

      await walkTo(page, cena2, { x: cena2.saida.x, y: cena2.saida.y }, true);
      await clicar(page, page.getByRole("button", { name: "Continuar" }));
      await expect(page.locator('[data-fim="sim"]')).toBeVisible();
      await shot(page, `${personagem}-13-fim-da-etapa`);
    });

    test("celular: cena com os controles de toque, registro e painel", async ({ browser }) => {
      const context = await browser.newContext({ viewport: CELULAR, hasTouch: true, isMobile: true, reducedMotion: "reduce", baseURL: "http://localhost:4311" });
      const page = await context.newPage();
      await openFresh(page, `/jogo/${personagem}/`);
      await shot(page, `${personagem}-14-celular-capitulo-1`);
      const alvo = exigidos(primeiro)[0]!;
      await walkTo(page, cena1, posicaoDe(primeiro, alvo));
      await shot(page, `${personagem}-15-celular-registro-ao-alcance`);
      // Um toque de verdade, com o dedo levantando em cima do botão que aparece.
      await page.locator("[data-acao-toque]").tap();
      await expect(page.locator('[data-dialogo="registro"]')).toBeVisible();
      await shot(page, `${personagem}-16-celular-registro`);
      await clicar(page, guardar(page));
      await abrirPainel(page);
      await shot(page, `${personagem}-17-celular-painel`);
      await context.close();
    });
  });
}

test("celular deitado: o palco inteiro na janela, com o direcional e o botão de ação", async ({ browser }) => {
  const context = await browser.newContext({ viewport: CELULAR_DEITADO, hasTouch: true, isMobile: true, reducedMotion: "reduce", baseURL: "http://localhost:4311" });
  const page = await context.newPage();
  await openFresh(page, "/jogo/lula/");
  await shot(page, "19-celular-deitado");
  await context.close();
});

test("guia, registro com a ordem não documentada, saída fechada, porta aberta de perto e rodapé da página", async ({ page }) => {
  await page.setViewportSize(COMPUTADOR);
  const [primeiro] = chaptersOf("lula") as [ChapterSpec];
  const cena = getScene(primeiro.cena);
  await openFresh(page, "/jogo/lula/");

  // O guia, com a tarefa pendente: quem ele é, o que o cenário representa e como se joga.
  await page.getByRole("button", { name: "Como jogar" }).click();
  await expect(page.locator('[data-dialogo="guia"]')).toBeVisible();
  await shot(page, "23-guia-como-jogar");
  await page.keyboard.press("Escape");

  await abrirPainel(page);
  await shot(page, "20-painel-com-o-aviso-de-ordem");
  await clicar(page, page.locator("[data-registro]:has([data-ordem-em-aberto]) [data-recolher]").first());
  await expect(page.locator('[data-dialogo="registro"] [data-ordem-em-aberto]')).toBeVisible();
  await shot(page, "21-registro-com-a-ordem-nao-documentada");
  await clicar(page, guardar(page));

  // A tarefa cumprida não abre a porta: faltam registros. O personagem diante da saída fechada.
  await collectByPanel(page, primeiro, exigidos(primeiro)[0]!);
  await expect(jogo(page)).toHaveAttribute("data-tarefa", "concluida");
  await expect(jogo(page)).toHaveAttribute("data-saida", "fechada");
  await walkTo(page, cena, { x: cena.saida.x - 1, y: cena.saida.y });
  await page.waitForTimeout(400);
  await shot(page, "25-tarefa-cumprida-e-saida-fechada");
  await page.keyboard.press("e");
  await expect(page.locator('[data-dialogo="saida-fechada"]')).toBeVisible();
  await shot(page, "26-saida-fechada-o-que-falta");
  await clicar(page, page.getByRole("button", { name: "Entendi" }));

  // Os registros que faltavam, pelo painel, e o personagem diante da porta aberta.
  await openExitByPanel(page, primeiro);
  await walkTo(page, cena, { x: cena.saida.x - 1, y: cena.saida.y }, true);
  await page.waitForTimeout(900);
  await shot(page, "22-diante-da-porta-aberta");

  // O que fica abaixo do palco: a página rolada até o fim, de propósito.
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await shot(page, "24-rodape-da-pagina-do-jogo", true);
});

test("da ficha do registro à página do acontecimento, com a volta ao jogo", async ({ page }) => {
  await page.setViewportSize(COMPUTADOR);
  const [primeiro] = chaptersOf("lula") as [ChapterSpec];
  await openFresh(page, "/jogo/lula/");
  await abrirPainel(page);
  await clicar(page, page.locator(`[data-recolher="${exigidos(primeiro)[0]}"]`));
  await clicar(page, page.locator("[data-ficha]"));
  await expect(page.locator('[data-retorno="jogo"]')).toBeVisible();
  await shot(page, "18-pagina-do-acontecimento-com-volta-ao-jogo");
});
