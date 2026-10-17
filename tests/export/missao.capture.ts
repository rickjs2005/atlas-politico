// Capturas da missão de investigação "O documento diz o quê?" (D-151) e da
// Cidade do Voto depois das correções de 17 de outubro de 2026, para
// docs/capturas/jogo-missao/. Tiradas da saída estática: `npm run build` e
// `npx playwright test -c playwright.export.config.ts --project=capturas missao.capture`.
// Não é teste: só registra as telas. Os testes ficam em
// `tests/e2e/investigacao.spec.ts` e `tests/e2e/mundo.spec.ts`.

import { expect, test, type Locator, type Page } from "@playwright/test";

import { CAMPOS_DO_DOCUMENTO } from "@/lib/domain/game";
import { drawerDocuments } from "@/lib/game/dossier";

import { abrir, conteudoDe, janela, refKey, rota, type Slug } from "../e2e/jogo-apoio";

const OUT = process.env.GAME_CAPTURE_DIR ?? "docs/capturas/jogo-missao";
const COMPUTADOR = { width: 1440, height: 900 };
const CELULAR = { width: 390, height: 844 };

const shot = async (page: Page, nome: string, inteira = false) => {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(350);
  await page.screenshot({ path: `${OUT}/${nome}.png`, fullPage: inteira });
};

/** Rola o corpo de uma janela até um trecho dela, sem rolar a página. */
async function mostrar(caixa: Locator, seletor: string) {
  await caixa.locator("[data-janela-corpo]").evaluate((corpo, alvo) => {
    const no = corpo.querySelector(alvo);
    if (no === null) return;
    corpo.scrollTop += no.getBoundingClientRect().top - corpo.getBoundingClientRect().top - 12;
  }, seletor);
}

function missaoDe(slug: Slug) {
  const content = conteudoDe(slug, "investigacao");
  const fase = content.fases[0]!;
  if (fase.atividade.tipo !== "dossie") throw new Error(`${fase.id} não é um dossiê.`);
  return { fase, atividade: fase.atividade, gaveta: drawerDocuments(fase).map(refKey) };
}

async function tocar(page: Page, objeto: string): Promise<Locator> {
  await page.locator(`[data-marcador="objeto:${objeto}"]`).click();
  return janela(page, "fase");
}

for (const [slug, sufixo] of [
  ["lula", "computador"],
  ["flavio-bolsonaro", "celular"],
] as const) {
  test(`missão de ${slug} em ${sufixo}`, async ({ browser }) => {
    const contexto = await browser.newContext({ viewport: sufixo === "celular" ? CELULAR : COMPUTADOR, hasTouch: sufixo === "celular", isMobile: sufixo === "celular", reducedMotion: "reduce" });
    const page = await contexto.newPage();
    const { atividade, gaveta } = missaoDe(slug);
    const n = (passo: number, nome: string) => `${String(passo).padStart(2, "0")}-${nome}--${sufixo}`;

    await abrir(page, slug, 1, "investigacao");
    await shot(page, n(1, "sala-de-investigacao"));

    await page.locator("[data-abrir-marco]").click();
    let fase = await janela(page, "fase");
    await shot(page, n(2, "conversa-com-o-escrivao"));
    await fase.locator('[data-escolha="como-ler"]').click();
    await fase.locator('[data-escolha="onde-estao"]').click();
    await fase.locator('[data-escolha="e-depois"]').click();
    await shot(page, n(3, "conversa-encerrada-com-a-chave-de-leitura"));
    await fase.locator("[data-fechar-fase]").click();

    fase = await tocar(page, "gaveta");
    await fase.locator(`[data-abrir-documento="${gaveta[0]}"]`).click();
    await mostrar(fase, `[data-documento="${gaveta[0]}"]`);
    await shot(page, n(4, "gaveta-com-um-documento-aberto"));
    for (const chave of gaveta) {
      await fase.locator(`[data-abrir-documento="${chave}"]`).click();
      if ((await fase.locator(`[data-documento-aberto="${chave}"]`).count()) === 0) await fase.locator(`[data-abrir-documento="${chave}"]`).click();
      await fase.locator(`[data-guardar-no-dossie="${chave}"]`).click();
      await fase.locator(`[data-abrir-documento="${chave}"]`).click();
    }
    await fase.locator("[data-fechar-fase]").click();

    fase = await tocar(page, "fichas");
    const [primeira, ...outras] = atividade.fichas;
    const certa = refKey(primeira!.evidencia);
    const errada = gaveta.find((chave) => chave !== certa)!;
    await mostrar(fase, '[data-secao="fichas"]');
    await shot(page, n(5, "fichas-e-dossie"));
    await fase.locator(`[data-relacionar="${primeira!.id}:${errada}"]`).click();
    await expect(fase.locator(`[data-ficha="${primeira!.id}"] [data-ficha-aviso]`)).toHaveAttribute("data-ficha-aviso", "errado");
    await mostrar(fase, `[data-ficha="${primeira!.id}"]`);
    await shot(page, n(6, "documento-errado-explicado"));
    await fase.locator(`[data-relacionar="${primeira!.id}:${certa}"]`).click();
    await mostrar(fase, `[data-ficha="${primeira!.id}"]`);
    await shot(page, n(7, "apontar-o-campo"));
    const campoErrado = CAMPOS_DO_DOCUMENTO.find((campo) => campo !== primeira!.destaque.campo)!;
    await fase.locator(`[data-campo-botao="${primeira!.id}:${campoErrado}"]`).click();
    await mostrar(fase, `[data-ficha="${primeira!.id}"]`);
    await shot(page, n(8, "campo-errado-explicado"));
    await fase.locator(`[data-campo-botao="${primeira!.id}:${primeira!.destaque.campo}"]`).click();
    await mostrar(fase, `[data-ficha="${primeira!.id}"]`);
    await shot(page, n(9, "ficha-conferida"));
    for (const ficha of outras) {
      await fase.locator(`[data-relacionar="${ficha.id}:${refKey(ficha.evidencia)}"]`).click();
      await fase.locator(`[data-campo-botao="${ficha.id}:${ficha.destaque.campo}"]`).click();
    }
    await expect(fase.locator('[data-carimbo="novo"]')).toBeVisible();
    await mostrar(fase, "[data-resultado]");
    await shot(page, n(10, "missao-concluida-com-carimbo"));
    await fase.locator("[data-fontes-da-fase] summary").click();
    await mostrar(fase, "[data-fontes-da-fase]");
    await shot(page, n(11, "fontes-da-missao"));
    await fase.locator('[data-continuar="resumo"]').click();
    await janela(page, "resumo");
    await shot(page, n(12, "resumo-da-missao"));
    await contexto.close();
  });
}

test("leitura sem o cenário, em computador", async ({ browser }) => {
  const contexto = await browser.newContext({ viewport: COMPUTADOR, reducedMotion: "reduce" });
  const page = await contexto.newPage();
  await page.goto(`${rota("lula", "investigacao")}?fase=1&leitura=1`);
  await expect(page.locator("[data-jogo]")).toHaveAttribute("data-carregado", "sim", { timeout: 30_000 });
  await shot(page, "13-leitura-sem-o-cenario--computador", true);
  await contexto.close();
});

test("Cidade do Voto: a praça e a revelação", async ({ browser }) => {
  const contexto = await browser.newContext({ viewport: COMPUTADOR, reducedMotion: "reduce" });
  const page = await contexto.newPage();
  await page.goto("/mundo/");
  await page.getByRole("button", { name: "Entrar na cidade" }).click();
  await expect(page.locator("[data-mundo]")).toHaveAttribute("data-cena", "pronta", { timeout: 30_000 });
  await page.waitForTimeout(1500);
  await shot(page, "14-cidade-do-voto-praca--computador");
  await page.keyboard.down("w");
  await expect(page.getByRole("button", { name: /^Entrar: / })).toBeVisible({ timeout: 30_000 });
  await page.keyboard.up("w");
  await page.getByRole("button", { name: /^Entrar: / }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await shot(page, "15-cidade-do-voto-predio-com-cinco-escolhas--computador");
  await page.getByRole("dialog").locator('[data-escolha="partes"]').click();
  await page.getByRole("button", { name: "Revelar" }).click();
  await expect(page.getByRole("heading", { name: "De quem era cada programa" })).toBeVisible();
  await shot(page, "16-cidade-do-voto-revelacao--computador");
  await page.locator("[data-voltar-a-cidade]").click();
  await expect(page.locator("[data-mundo]")).toHaveAttribute("data-cena-instancias", "2", { timeout: 30_000 });
  await page.waitForTimeout(1500);
  await shot(page, "17-cidade-do-voto-de-volta-a-praca--computador");
  await contexto.close();
});
