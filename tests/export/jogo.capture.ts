// Capturas do jogo, versão de lançamento, para docs/capturas/jogo-lancamento/.
// Tiradas da saída estática: `npm run build` e `npm run capture:game`. Não é
// teste do jogo: só registra as telas. Os testes ficam em
// `tests/e2e/jogo.spec.ts` e `tests/export/jogo.spec.ts`.
//
// O celular é emulado: janela de 390×844, com toque, e de 844×390 deitado.
// Os capítulos avançados são abertos com um progresso salvo (os anteriores
// concluídos), para cada cenário aparecer sem jogar tudo antes.

import { expect, test, type Page } from "@playwright/test";

import { chaptersOf } from "@/lib/game/chapters";
import { requiredRecords, taskSignature } from "@/lib/game/mission";
import { getScene } from "@/lib/game/scenes";
import { storageKey } from "@/lib/game/storage";
import { PROGRESS_VERSION, type ChapterSpec, type PersonagemSlug } from "@/lib/game/types";

import { clearProgress, clicar, jogo, palco, walkTo } from "../e2e/jogo-caminho";

const OUT = process.env.GAME_CAPTURE_DIR ?? "docs/capturas/jogo-lancamento";
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
const dialogo = (page: Page, nome: string) => page.locator(`[data-dialogo="${nome}"]`);

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

/** Um progresso salvo com os capítulos anteriores ao de número `numero` concluídos e ele disponível. */
function progressoAte(slug: PersonagemSlug, numero: number) {
  const entradas: Record<string, unknown> = {};
  chaptersOf(slug).forEach((capitulo, indice) => {
    const comResposta = capitulo.tarefa.tipo !== "registro";
    if (indice < numero - 1) {
      entradas[capitulo.id] = {
        status: "concluido",
        tarefa: { recolhidos: [...capitulo.eventIds], confirmada: comResposta, tentativas: comResposta ? 1 : 0, ...(comResposta ? { assinatura: taskSignature(capitulo.tarefa) } : {}) },
      };
    }
    else entradas[capitulo.id] = { status: indice === numero - 1 ? "disponivel" : "bloqueado", tarefa: { recolhidos: [], confirmada: false, tentativas: 0 } };
  });
  return { versao: PROGRESS_VERSION, personagem: slug, capitulos: entradas };
}

/** Abre o jogo no capítulo de número `numero`, com os anteriores concluídos. */
async function openAtChapter(page: Page, slug: PersonagemSlug, numero: number) {
  await page.goto(`/jogo/${slug}/`);
  await page.evaluate(({ chave, salvo }) => window.localStorage.setItem(chave, JSON.stringify(salvo)), { chave: storageKey(slug), salvo: progressoAte(slug, numero) });
  await page.reload();
  await ready(page);
  await expect(jogo(page)).toHaveAttribute("data-capitulo", chaptersOf(slug)[numero - 1]!.id);
}

const posicaoDe = (capitulo: ChapterSpec, eventId: string) => getScene(capitulo.cena).registros[capitulo.eventIds.indexOf(eventId)]!;
const exigidos = (capitulo: ChapterSpec) => [...requiredRecords(capitulo.tarefa)];
const foraDaTarefa = (capitulo: ChapterSpec) => capitulo.eventIds.filter((id) => !exigidos(capitulo).includes(id));

/** Responde a pergunta de ordem que está aberta: tenta uma opção e, se errar, troca. */
async function answerOrder(page: Page, capitulo: ChapterSpec) {
  if (capitulo.tarefa.tipo !== "ordem") return;
  const ordem = dialogo(page, "ordem");
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

/** Responde a pergunta de documento ou de lugar que está aberta: tenta as opções até acertar. */
async function answerChoice(page: Page) {
  const escolha = dialogo(page, "escolha");
  await expect(escolha).toBeVisible();
  const ids = await escolha.locator("[data-escolher]").evaluateAll((nos) => nos.map((no) => no.getAttribute("data-escolher")!));
  for (const id of ids) {
    await clicar(page, escolha.locator(`[data-escolher="${id}"]`));
    await clicar(page, escolha.locator("[data-confirmar-escolha]"));
    if ((await escolha.locator("[data-escolha-resultado]").getAttribute("data-escolha-resultado")) === "certo") break;
    await clicar(page, escolha.locator("[data-tentar-de-novo]"));
  }
  await clicar(page, escolha.locator("[data-escolha-concluida]"));
}

/** Recolhe um registro pelo painel e guarda; responde a pergunta, se ela abrir em seguida. */
async function collectByPanel(page: Page, capitulo: ChapterSpec, id: string) {
  await abrirPainel(page);
  await clicar(page, page.locator(`[data-recolher="${id}"]`));
  await clicar(page, guardar(page));
  await expect(jogo(page)).toHaveAttribute("data-modo", /^(jogando|ordem|escolha)$/);
  const modo = await jogo(page).getAttribute("data-modo");
  if (modo === "ordem") await answerOrder(page, capitulo);
  else if (modo === "escolha") await answerChoice(page);
}

/**
 * Abre a saída do capítulo aberto pelo painel, sem o cenário: recolhe o que
 * ainda falta, primeiro o que a tarefa pede, e responde a pergunta. A saída só
 * abre com a tarefa cumprida e todos os registros recolhidos.
 */
async function openExitByPanel(page: Page, capitulo: ChapterSpec) {
  await abrirPainel(page);
  await expect(page.locator("[data-registro]")).toHaveCount(capitulo.eventIds.length);
  const recolhidos = await page.locator('[data-registro][data-recolhido="sim"]').evaluateAll((nos) => nos.map((no) => no.getAttribute("data-registro")));
  await page.keyboard.press("Escape");
  await expect(dialogo(page, "painel")).toHaveCount(0);
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
  const capitulos = chaptersOf(personagem);
  const [primeiro, segundo, terceiro] = capitulos as [ChapterSpec, ChapterSpec, ChapterSpec];
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
      await expect(dialogo(page, "registro")).toBeVisible();
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

    test("capítulo 2: tarefa de ordem, nova tentativa, painel e a transição para o capítulo 3", async ({ page }) => {
      test.slow();
      await page.setViewportSize(COMPUTADOR);
      await openAtChapter(page, personagem, 2);

      // Os dois registros pelo cenário, e a ordem errada primeiro.
      const [a, b] = exigidos(segundo) as [string, string];
      for (const id of [a, b]) {
        await walkTo(page, cena2, posicaoDe(segundo, id));
        await page.keyboard.press("e");
        await clicar(page, guardar(page));
      }
      const ordem = dialogo(page, "ordem");
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

      // A transição apresenta o capítulo 3 com o período, o cenário, a época e o contexto.
      await walkTo(page, cena2, { x: cena2.saida.x, y: cena2.saida.y }, true);
      await expect(page.locator("[data-transicao]")).toHaveAttribute("data-transicao", terceiro.id);
      await shot(page, `${personagem}-13-transicao-com-contexto`);
      await clicar(page, page.getByRole("button", { name: "Continuar" }));
      await expect(jogo(page)).toHaveAttribute("data-capitulo", terceiro.id);
    });

    test("os cenários dos capítulos seguintes, com o personagem no início", async ({ page }) => {
      test.slow();
      await page.setViewportSize(COMPUTADOR);
      for (const capitulo of capitulos.slice(2)) {
        await openAtChapter(page, personagem, capitulo.numero);
        await shot(page, `${personagem}-14-capitulo-${capitulo.numero}`);
      }
    });

    test("tarefa de documento: a pergunta, a opção errada com explicação e a certa", async ({ page }) => {
      test.slow();
      await page.setViewportSize(COMPUTADOR);
      const capitulo = capitulos.find((item) => item.tarefa.tipo === "fonte");
      if (capitulo === undefined) return;
      await openAtChapter(page, personagem, capitulo.numero);
      const pedido = exigidos(capitulo)[0]!;
      await abrirPainel(page);
      await clicar(page, page.locator(`[data-recolher="${pedido}"]`));
      await clicar(page, guardar(page));
      const escolha = dialogo(page, "escolha");
      await expect(escolha).toBeVisible();
      await shot(page, `${personagem}-15-tarefa-de-documento`);
      const ids = await escolha.locator("[data-escolher]").evaluateAll((nos) => nos.map((no) => no.getAttribute("data-escolher")!));
      for (const [indice, id] of ids.entries()) {
        await clicar(page, escolha.locator(`[data-escolher="${id}"]`));
        await clicar(page, escolha.locator("[data-confirmar-escolha]"));
        const certo = (await escolha.locator("[data-escolha-resultado]").getAttribute("data-escolha-resultado")) === "certo";
        if (certo) {
          await shot(page, `${personagem}-17-documento-certo`);
          break;
        }
        if (indice === 0) await shot(page, `${personagem}-16-documento-errado-com-explicacao`);
        await clicar(page, escolha.locator("[data-tentar-de-novo]"));
      }
    });

    test("tarefa de lugar: a pergunta e a resposta certa", async ({ page }) => {
      test.slow();
      await page.setViewportSize(COMPUTADOR);
      const capitulo = capitulos.find((item) => item.tarefa.tipo === "lugar");
      if (capitulo === undefined) return;
      await openAtChapter(page, personagem, capitulo.numero);
      const pedido = exigidos(capitulo)[0]!;
      await abrirPainel(page);
      await clicar(page, page.locator(`[data-recolher="${pedido}"]`));
      await clicar(page, guardar(page));
      const escolha = dialogo(page, "escolha");
      await expect(escolha).toBeVisible();
      await shot(page, `${personagem}-18-tarefa-de-lugar`);
      await answerChoice(page);
    });

    test("ficha judicial: natureza, decisões relacionadas com data e o aviso", async ({ page }) => {
      await page.setViewportSize(COMPUTADOR);
      const judicial = personagem === "lula" ? "lula-2017-condenacao-em-primeira-instancia" : "flavio-bolsonaro-2020-denuncia-do-ministerio-publico";
      const capitulo = capitulos.find((item) => item.eventIds.includes(judicial))!;
      await openAtChapter(page, personagem, capitulo.numero);
      await abrirPainel(page);
      await clicar(page, page.locator(`[data-recolher="${judicial}"]`));
      const ficha = dialogo(page, "registro");
      await expect(ficha.locator("[data-ficha-judicial]")).toBeVisible();
      await shot(page, `${personagem}-19-ficha-judicial`);
      // A ficha rola até as decisões relacionadas e as fontes, com o que cada uma sustenta.
      await ficha.locator("[data-aviso-judicial]").scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await shot(page, `${personagem}-20-ficha-judicial-decisoes-relacionadas`);
    });

    test("fim da trajetória", async ({ page }) => {
      test.slow();
      await page.setViewportSize(COMPUTADOR);
      const ultimo = capitulos.at(-1)!;
      await openAtChapter(page, personagem, capitulos.length);
      await openExitByPanel(page, ultimo);
      await crossByPanel(page);
      await expect(page.locator("[data-transicao]")).toHaveAttribute("data-transicao", "fim");
      await shot(page, `${personagem}-21-transicao-para-o-fim`);
      await clicar(page, page.getByRole("button", { name: "Continuar" }));
      await expect(page.locator('[data-fim="sim"]')).toBeVisible();
      await shot(page, `${personagem}-22-fim-da-trajetoria`);
    });

    test("celular: cena com os controles de toque, registro, painel e a tarefa de documento", async ({ browser }) => {
      test.slow();
      const context = await browser.newContext({ viewport: CELULAR, hasTouch: true, isMobile: true, reducedMotion: "reduce", baseURL: "http://localhost:4311" });
      const page = await context.newPage();
      await openFresh(page, `/jogo/${personagem}/`);
      await shot(page, `${personagem}-23-celular-capitulo-1`);
      const alvo = exigidos(primeiro)[0]!;
      await walkTo(page, cena1, posicaoDe(primeiro, alvo));
      await shot(page, `${personagem}-24-celular-registro-ao-alcance`);
      // Um toque de verdade, com o dedo levantando em cima do botão que aparece.
      await page.locator("[data-acao-toque]").tap();
      await expect(dialogo(page, "registro")).toBeVisible();
      await shot(page, `${personagem}-25-celular-registro`);
      await clicar(page, guardar(page));
      await abrirPainel(page);
      await shot(page, `${personagem}-26-celular-painel`);
      await page.keyboard.press("Escape");
      const deDocumento = capitulos.find((item) => item.tarefa.tipo === "fonte");
      if (deDocumento !== undefined) {
        await openAtChapter(page, personagem, deDocumento.numero);
        await shot(page, `${personagem}-27-celular-capitulo-${deDocumento.numero}`);
        await abrirPainel(page);
        await clicar(page, page.locator(`[data-recolher="${exigidos(deDocumento)[0]}"]`));
        await clicar(page, guardar(page));
        await expect(dialogo(page, "escolha")).toBeVisible();
        await shot(page, `${personagem}-28-celular-tarefa-de-documento`);
      }
      await context.close();
    });
  });
}

test("celular deitado: o palco inteiro na janela, com o direcional e o botão de ação, em dois cenários", async ({ browser }) => {
  const context = await browser.newContext({ viewport: CELULAR_DEITADO, hasTouch: true, isMobile: true, reducedMotion: "reduce", baseURL: "http://localhost:4311" });
  const page = await context.newPage();
  await openFresh(page, "/jogo/lula/");
  await shot(page, "29-celular-deitado");
  await openAtChapter(page, "lula", 4);
  await shot(page, "30-celular-deitado-capitulo-4");
  await context.close();
});

test("guia, registro com a ordem não documentada, saída fechada, porta aberta de perto e rodapé da página", async ({ page }) => {
  await page.setViewportSize(COMPUTADOR);
  const [primeiro] = chaptersOf("lula") as [ChapterSpec];
  const cena = getScene(primeiro.cena);
  await openFresh(page, "/jogo/lula/");

  // O guia, com a tarefa pendente: quem ele é, o que o cenário representa e como se joga.
  await page.getByRole("button", { name: "Como jogar" }).click();
  await expect(dialogo(page, "guia")).toBeVisible();
  await shot(page, "31-guia-como-jogar");
  await page.keyboard.press("Escape");

  await abrirPainel(page);
  await shot(page, "32-painel-com-o-aviso-de-ordem");
  await clicar(page, page.locator("[data-registro]:has([data-ordem-em-aberto]) [data-recolher]").first());
  await expect(page.locator('[data-dialogo="registro"] [data-ordem-em-aberto]')).toBeVisible();
  await shot(page, "33-registro-com-a-ordem-nao-documentada");
  await clicar(page, guardar(page));

  // A tarefa cumprida não abre a porta: faltam registros. O personagem diante da saída fechada.
  await collectByPanel(page, primeiro, exigidos(primeiro)[0]!);
  await expect(jogo(page)).toHaveAttribute("data-tarefa", "concluida");
  await expect(jogo(page)).toHaveAttribute("data-saida", "fechada");
  await walkTo(page, cena, { x: cena.saida.x - 1, y: cena.saida.y });
  await page.waitForTimeout(400);
  await shot(page, "34-tarefa-cumprida-e-saida-fechada");
  await page.keyboard.press("e");
  await expect(dialogo(page, "saida-fechada")).toBeVisible();
  await shot(page, "35-saida-fechada-o-que-falta");
  await clicar(page, page.getByRole("button", { name: "Entendi" }));

  // Os registros que faltavam, pelo painel, e o personagem diante da porta aberta.
  await openExitByPanel(page, primeiro);
  await walkTo(page, cena, { x: cena.saida.x - 1, y: cena.saida.y }, true);
  await page.waitForTimeout(900);
  await shot(page, "36-diante-da-porta-aberta");

  // O que fica abaixo do palco: a página rolada até o fim, de propósito.
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await shot(page, "37-rodape-da-pagina-do-jogo", true);
});

test("da ficha do registro à página do acontecimento, com a volta ao jogo", async ({ page }) => {
  await page.setViewportSize(COMPUTADOR);
  const [primeiro] = chaptersOf("lula") as [ChapterSpec];
  await openFresh(page, "/jogo/lula/");
  await abrirPainel(page);
  await clicar(page, page.locator(`[data-recolher="${exigidos(primeiro)[0]}"]`));
  await clicar(page, page.locator("[data-ficha]"));
  await expect(page.locator('[data-retorno="jogo"]')).toBeVisible();
  await shot(page, "38-pagina-do-acontecimento-com-volta-ao-jogo");
});
