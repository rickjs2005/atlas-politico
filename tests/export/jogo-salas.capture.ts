// Capturas da entrega P1 do jogo (salas, decisões e Escrivão), para
// docs/capturas/jogo-salas/. Tiradas da saída estática: `npm run build` e
// `npx playwright test -c playwright.export.config.ts --project=capturas jogo-salas.capture`.
// Não é teste do jogo: só registra as telas do percurso jogável. Os testes
// ficam em `tests/e2e/jogo.spec.ts` (seção "Escrivão e salas temáticas").

import { readFileSync } from "node:fs";

import { expect, test, type Page } from "@playwright/test";

import { chaptersOf } from "@/lib/game/chapters";
import { recordIds, requiredRecords, taskSignature } from "@/lib/game/mission";
import { chaptersInRoom } from "@/lib/game/rooms";
import { getScene } from "@/lib/game/scenes";
import { storageKey } from "@/lib/game/storage";
import { PROGRESS_VERSION, type ChapterSpec } from "@/lib/game/types";

import { clearProgress, clicar, jogo, palco, walkTo } from "../e2e/jogo-caminho";

const OUT = process.env.GAME_CAPTURE_DIR ?? "docs/capturas/jogo-salas";
const COMPUTADOR = { width: 1440, height: 900 };
const CELULAR = { width: 390, height: 844 };

const conjunto = JSON.parse(readFileSync("generated/dados/conjunto.json", "utf8")) as {
  votos: { id: string; votacaoId: string; registro: { tipo: string; posicao?: string }; fontes: { fonteId: string }[] }[];
  votacoes: { id: string; objeto: { tipo: string } }[];
  atosExecutivos: { id: string; tipo: string; fontes: { fonteId: string }[] }[];
};

/** O documento e a interpretação certos de uma decisão, pelo que o conjunto registra. */
function decisaoDe(id: string): { evidencia: string; interpretacao: string } {
  const voto = conjunto.votos.find((item) => item.id === id);
  if (voto !== undefined) {
    const votacao = conjunto.votacoes.find((item) => item.id === voto.votacaoId)!;
    return { evidencia: voto.fontes[0]!.fonteId, interpretacao: voto.registro.tipo === "voto-individual" ? `voto:${voto.registro.posicao}:${votacao.objeto.tipo}` : `registro:${voto.registro.tipo}` };
  }
  const ato = conjunto.atosExecutivos.find((item) => item.id === id)!;
  return { evidencia: ato.fontes[0]!.fonteId, interpretacao: `ato:${ato.tipo}` };
}

const shot = async (page: Page, nome: string, rolada = false) => {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(350);
  if (!rolada) expect(await page.evaluate(() => Math.round(window.scrollY)), `rolagem da página na captura ${nome}`).toBe(0);
  await page.screenshot({ path: `${OUT}/${nome}.png` });
};

const dialogo = (page: Page, nome: string) => page.locator(`[data-dialogo="${nome}"]`);
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

const LULA = chaptersInRoom(chaptersOf("lula"), "historico");
const MISSAO = LULA.find((capitulo) => capitulo.tarefa.tipo === "decisao")!;
const DECISAO = MISSAO.tarefa.tipo === "decisao" ? MISSAO.tarefa.decisaoId : "";
const ECONOMIA = chaptersInRoom(chaptersOf("lula"), "economia")[0]!;

/** Um progresso salvo com a trajetória concluída até antes da missão, e ela disponível. */
function progressoAteAMissao() {
  const entradas: Record<string, unknown> = {};
  LULA.forEach((capitulo) => {
    if (capitulo.numero < MISSAO.numero) {
      const comResposta = capitulo.tarefa.tipo !== "registro";
      entradas[capitulo.id] = {
        status: "concluido",
        tarefa: { recolhidos: recordIds(capitulo), confirmada: comResposta, tentativas: comResposta ? 1 : 0, ...(comResposta ? { assinatura: taskSignature(capitulo.tarefa) } : {}) },
      };
    } else entradas[capitulo.id] = { status: capitulo.id === MISSAO.id ? "disponivel" : "bloqueado", tarefa: { recolhidos: [], confirmada: false, tentativas: 0 } };
  });
  return { versao: PROGRESS_VERSION, personagem: "lula", capitulos: entradas };
}

async function abrirNaMissao(page: Page) {
  await page.goto("/jogo/lula/");
  await page.evaluate(({ chave, salvo }) => window.localStorage.setItem(chave, JSON.stringify(salvo)), { chave: storageKey("lula"), salvo: progressoAteAMissao() });
  await page.reload();
  await ready(page);
  await expect(jogo(page)).toHaveAttribute("data-capitulo", MISSAO.id);
}

const posicaoDe = (capitulo: ChapterSpec, id: string) => getScene(capitulo.cena).registros[recordIds(capitulo).indexOf(id)]!;

test.use({ viewport: COMPUTADOR });

test("entrada do jogo com as salas temáticas", async ({ page }) => {
  await page.goto("/jogo/");
  await clearProgress(page);
  await page.reload();
  await expect(page.locator("[data-sala-item]")).toHaveCount(4);
  await shot(page, "01-entrada-com-salas");
});

test("missão da sala Histórico: a decisão no cenário, o cartão, a evidência, a interpretação e a saída", async ({ page }) => {
  test.setTimeout(240_000);
  await abrirNaMissao(page);
  await expect(page.locator('[data-escrivao-caixa="entrada"]')).toBeVisible();
  await shot(page, "02-historico-entrada-com-o-escrivao");
  await clicar(page, page.locator('[data-escrivao-caixa="entrada"] [data-fechar-escrivao]'));
  await walkTo(page, getScene(MISSAO.cena), posicaoDe(MISSAO, DECISAO));
  await expect(page.locator("[data-alcance]")).toHaveAttribute("data-alcance-id", DECISAO);
  await shot(page, "03-historico-decisao-ao-alcance");
  await page.keyboard.press("Enter");
  await expect(dialogo(page, "registro")).toBeVisible();
  await shot(page, "04-decisao-recolhida-cartao");
  await clicar(page, page.getByRole("button", { name: "Guardar e responder" }));
  const janela = dialogo(page, "decisao");
  await expect(janela).toBeVisible();
  await shot(page, "05-decisao-etapa-1-evidencia");
  const { evidencia, interpretacao } = decisaoDe(DECISAO);
  const ids = await janela.locator("[data-escolher]").evaluateAll((nos) => nos.map((no) => no.getAttribute("data-escolher")!));
  const errada = ids.find((id) => id !== evidencia)!;
  await clicar(page, janela.locator(`[data-escolher="${errada}"]`));
  await clicar(page, janela.locator('[data-confirmar-decisao="evidencia"]'));
  await expect(janela.locator("[data-decisao-resultado]")).toHaveAttribute("data-decisao-resultado", "errado");
  await shot(page, "06-decisao-evidencia-errada-com-o-escrivao");
  await clicar(page, janela.locator("[data-tentar-de-novo]"));
  await clicar(page, janela.locator(`[data-escolher="${evidencia}"]`));
  await clicar(page, janela.locator('[data-confirmar-decisao="evidencia"]'));
  await expect(janela.locator("[data-decisao-resultado]")).toHaveAttribute("data-decisao-resultado", "certo");
  await clicar(page, janela.locator("[data-evidencia-concluida]"));
  await expect(janela).toContainText("etapa 2 de 2");
  await shot(page, "07-decisao-etapa-2-interpretacao");
  await clicar(page, janela.locator(`[data-escolher="${interpretacao}"]`));
  await clicar(page, janela.locator('[data-confirmar-decisao="interpretacao"]'));
  await expect(janela.locator("[data-decisao-resultado]")).toHaveAttribute("data-decisao-resultado", "certo");
  await shot(page, "08-decisao-interpretacao-certa");
  await clicar(page, janela.locator("[data-decisao-concluida]"));
  // Os outros registros pelo painel: a saída abre, e o Escrivão conclui sobre a cena.
  for (const id of recordIds(MISSAO).filter((item) => !requiredRecords(MISSAO.tarefa).includes(item))) {
    await abrirPainel(page);
    await clicar(page, page.locator(`[data-recolher="${id}"]`));
    await clicar(page, page.getByRole("button", { name: /Guardar e/ }));
  }
  await expect(jogo(page)).toHaveAttribute("data-saida", "aberta");
  await expect(page.locator('[data-escrivao-caixa="conclusao"]')).toBeVisible();
  await shot(page, "09-historico-saida-aberta-com-o-escrivao");
  await abrirPainel(page);
  await shot(page, "10-painel-com-decisao-e-preferencias");
});

test("sala temática Economia: a cena, o painel e o fim da sala", async ({ page }) => {
  test.setTimeout(240_000);
  await openFresh(page, "/jogo/lula/economia/");
  await expect(jogo(page)).toHaveAttribute("data-sala", "economia");
  await shot(page, "11-sala-economia-cena");
  await abrirPainel(page);
  await shot(page, "12-sala-economia-painel");
  await page.keyboard.press("Escape");
  await clicar(page, page.locator('[data-escrivao-caixa="entrada"] [data-fechar-escrivao]'));
  // A sala inteira pelo painel.
  for (const id of recordIds(ECONOMIA)) {
    await abrirPainel(page);
    await clicar(page, page.locator(`[data-recolher="${id}"]`));
    await clicar(page, page.getByRole("button", { name: /Guardar e/ }));
    if ((await jogo(page).getAttribute("data-modo")) === "decisao") {
      const janela = dialogo(page, "decisao");
      const { evidencia, interpretacao } = decisaoDe(id);
      await clicar(page, janela.locator(`[data-escolher="${evidencia}"]`));
      await clicar(page, janela.locator('[data-confirmar-decisao="evidencia"]'));
      await clicar(page, janela.locator("[data-evidencia-concluida]"));
      await clicar(page, janela.locator(`[data-escolher="${interpretacao}"]`));
      await clicar(page, janela.locator('[data-confirmar-decisao="interpretacao"]'));
      await clicar(page, janela.locator("[data-decisao-concluida]"));
    }
  }
  await expect(jogo(page)).toHaveAttribute("data-saida", "aberta");
  await abrirPainel(page);
  await clicar(page, page.locator("[data-atravessar-saida]"));
  await expect(page.locator("[data-transicao]")).toBeVisible();
  await clicar(page, page.getByRole("button", { name: "Continuar" }));
  await expect(page.locator('[data-fim="sim"]')).toBeVisible();
  await shot(page, "13-sala-economia-fim");
});

test("as decisões no atlas: a página da pessoa e a comparação por tema", async ({ page }) => {
  await page.goto("/politicos/lula/");
  await page.locator("#decisoes").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await shot(page, "14-atlas-decisoes-da-pessoa", true);
  await page.goto("/comparar/");
  await page.locator("#decisoes").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await shot(page, "15-atlas-comparacao-por-tema", true);
});

test("celular: a sala temática com o cartão da decisão", async ({ browser }) => {
  const context = await browser.newContext({ viewport: CELULAR, hasTouch: true, isMobile: true, baseURL: "http://localhost:4311" });
  const page = await context.newPage();
  await openFresh(page, "/jogo/flavio-bolsonaro/seguranca-publica/");
  await shot(page, "16-celular-sala-seguranca-cena");
  await abrirPainel(page);
  const primeira = recordIds(chaptersInRoom(chaptersOf("flavio-bolsonaro"), "seguranca-publica")[0]!)[0]!;
  await clicar(page, page.locator(`[data-recolher="${primeira}"]`));
  await expect(dialogo(page, "registro")).toBeVisible();
  await shot(page, "17-celular-decisao-recolhida");
  await context.close();
});
