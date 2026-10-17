// A missão de investigação "O documento diz o quê?" (D-151), com os dados
// reais: a conversa com o Escrivão e a ramificação, a gaveta, o dossiê, a
// relação de cada ficha com o documento (com erro explicado e nova
// tentativa), o campo apontado, o carimbo, o resumo, a recuperação depois de
// recarregar, a leitura sem o cenário só pelo teclado e o celular. As mesmas
// regras valem para as duas pessoas.

import { expect, test, type Locator, type Page } from "@playwright/test";

import { CAMPOS_DO_DOCUMENTO } from "@/lib/domain/game";
import { drawerDocuments } from "@/lib/game/dossier";
import type { PhaseSpec } from "@/lib/game/types";

import { PERSONAGENS, abrir, conteudoDe, dialogo, janela, jogo, progressoSalvo, pronto, refKey, rota, tabAte, vigiar, type Slug } from "./jogo-apoio";

function missaoDe(slug: Slug) {
  const content = conteudoDe(slug, "investigacao");
  const fase = content.fases[0]!;
  if (fase.atividade.tipo !== "dossie") throw new Error(`${fase.id} não é um dossiê.`);
  return { content, fase, atividade: fase.atividade, gaveta: drawerDocuments(fase).map(refKey) };
}

/** Abre a janela da fase pelo objeto da sala e espera ela aceitar o ponteiro. */
async function tocar(page: Page, objeto: string): Promise<Locator> {
  await page.locator(`[data-marcador="objeto:${objeto}"]`).click();
  return janela(page, "fase");
}

/** Guarda no dossiê, pela gaveta, os documentos dados. */
async function guardar(onde: Locator | Page, chaves: readonly string[]) {
  for (const chave of chaves) {
    await onde.locator(`[data-abrir-documento="${chave}"]`).click();
    await expect(onde.locator(`[data-documento-aberto="${chave}"] [data-campos]`)).toBeVisible();
    await onde.locator(`[data-guardar-no-dossie="${chave}"]`).click();
    await expect(onde.locator(`[data-documento="${chave}"]`)).toHaveAttribute("data-guardado", "sim");
    await onde.locator(`[data-abrir-documento="${chave}"]`).click();
  }
}

/** Relaciona a ficha ao documento certo e aponta o campo certo. */
async function conferir(onde: Locator | Page, ficha: { id: string; evidencia: { tipo: string; id: string }; destaque: { campo: string } }) {
  const chave = refKey(ficha.evidencia as PhaseSpec["marco"]);
  await onde.locator(`[data-relacionar="${ficha.id}:${chave}"]`).click();
  await expect(onde.locator(`[data-ficha="${ficha.id}"]`)).toHaveAttribute("data-ficha-situacao", "relacionada");
  await onde.locator(`[data-campo-botao="${ficha.id}:${ficha.destaque.campo}"]`).click();
  await expect(onde.locator(`[data-ficha="${ficha.id}"]`)).toHaveAttribute("data-ficha-situacao", "conferida");
}

for (const slug of PERSONAGENS) {
  test(`${slug}: a missão inteira, com a conversa ramificada, a gaveta, o erro explicado, o campo apontado, o carimbo e o resumo`, async ({ page }) => {
    const erros = vigiar(page);
    const { fase, atividade, gaveta } = missaoDe(slug);
    await abrir(page, slug, 1, "investigacao");
    await expect(jogo(page)).toHaveAttribute("data-sala", "investigacao");
    await expect(jogo(page)).toHaveAttribute("data-fase-aberta", fase.id);
    // Os quatro objetos da sala são botões com nome, e o botão principal leva ao Escrivão.
    for (const objeto of ["escrivao", "gaveta", "fichas", "quadro"]) await expect(page.locator(`[data-marcador="objeto:${objeto}"]`)).toHaveAttribute("data-natureza", "objeto");
    await expect(page.locator("[data-abrir-marco]")).toHaveText("Falar com o Escrivão");
    await expect(page.locator("[data-dossie-andamento]")).toHaveText(`Dossiê: 0 de ${gaveta.length} documentos · fichas conferidas: 0 de ${atividade.fichas.length}`);

    // 1. A conversa: perguntar como se lê um documento deixa a marca, e o fim da conversa muda por causa dela.
    await page.locator("[data-abrir-marco]").click();
    let fase1 = await janela(page, "fase");
    await expect(fase1.locator('[data-secao="escrivao"]')).toHaveAttribute("data-conversa", "fichas");
    await fase1.locator('[data-escolha="como-ler"]').click();
    await expect(fase1.locator('[data-secao="escrivao"]')).toHaveAttribute("data-conversa", "leitura");
    await fase1.locator('[data-escolha="onde-estao"]').click();
    await fase1.locator('[data-escolha="e-depois"]').click();
    await expect(fase1.locator('[data-secao="escrivao"]')).toHaveAttribute("data-conversa", "encerrada");
    await expect(fase1.locator("[data-conversa-fim]")).toContainText("Você já tem a chave de leitura");
    await expect(fase1.locator('[data-secao="escrivao"] li').last()).toContainText("um dos cinco que eu disse");
    // A chave de leitura abriu sozinha, por causa da marca.
    await expect(fase1.locator("[data-chave-de-leitura]")).toHaveAttribute("open", "");
    await fase1.locator("[data-fechar-fase]").click();
    await expect(dialogo(page, "fase")).toHaveCount(0);
    await expect(page.locator("[data-abrir-marco]")).toHaveText("Abrir o dossiê");

    // 2. A gaveta: cada documento abre com os cinco campos, e vai para o dossiê. Sobrar documento não é erro: todos vão.
    fase1 = await tocar(page, "gaveta");
    await expect(fase1.locator('[data-secao="gaveta"] [data-documento]')).toHaveCount(gaveta.length);
    await guardar(fase1, gaveta);
    await expect(fase1.locator("[data-dossie-item]")).toHaveCount(gaveta.length);
    await fase1.locator("[data-fechar-fase]").click();
    await expect(page.locator("[data-dossie-andamento]")).toContainText(`Dossiê: ${gaveta.length} de ${gaveta.length} documentos`);

    // 3. As fichas: o documento errado explica em que campos não bate, sem dizer o certo; o certo pede o campo; o campo errado explica e deixa tentar de novo.
    fase1 = await tocar(page, "fichas");
    const [primeira, segunda, terceira] = atividade.fichas;
    const certa = refKey(primeira!.evidencia);
    const errada = gaveta.find((chave) => chave !== certa)!;
    await fase1.locator(`[data-relacionar="${primeira!.id}:${errada}"]`).click();
    const aviso = fase1.locator(`[data-ficha="${primeira!.id}"] [data-ficha-aviso]`);
    await expect(aviso).toHaveAttribute("data-ficha-aviso", "errado");
    await expect(aviso).toContainText("Este documento não bate com a ficha em:");
    await expect(aviso.locator('[data-escrivao="erro"]')).toBeVisible();
    await expect(fase1.locator(`[data-ficha="${primeira!.id}"]`)).toHaveAttribute("data-ficha-situacao", "pendente");
    await fase1.locator(`[data-relacionar="${primeira!.id}:${certa}"]`).click();
    await expect(aviso).toHaveAttribute("data-ficha-aviso", "certo");
    await expect(fase1.locator(`[data-ficha="${primeira!.id}"]`)).toHaveAttribute("data-ficha-situacao", "relacionada");
    // O foco foi para o próximo passo: os campos do documento.
    expect(await page.evaluate(() => document.activeElement?.getAttribute("data-campo-botao"))).toContain(`${primeira!.id}:`);
    const campoErrado = CAMPOS_DO_DOCUMENTO.find((campo) => campo !== primeira!.destaque.campo)!;
    await fase1.locator(`[data-campo-botao="${primeira!.id}:${campoErrado}"]`).click();
    await expect(aviso).toHaveAttribute("data-ficha-aviso", "errado");
    await expect(aviso).toContainText("fala de outra coisa: tente outro campo");
    await fase1.locator(`[data-campo-botao="${primeira!.id}:${primeira!.destaque.campo}"]`).click();
    await expect(fase1.locator(`[data-ficha="${primeira!.id}"]`)).toHaveAttribute("data-ficha-situacao", "conferida");
    await expect(fase1.locator(`[data-ficha="${primeira!.id}"] [data-ficha-conferida]`)).toContainText("campo");
    await expect(fase1.locator("[data-resultado]")).toHaveCount(0);

    // As outras fichas, direto.
    await conferir(fase1, segunda!);
    await conferir(fase1, terceira!);

    // 4. Concluída pela resposta: a explicação, as fontes, o carimbo, uma vez, e o resumo.
    await expect(fase1.locator("[data-resultado]")).toHaveAttribute("data-resultado", "concluida");
    await expect(fase1.locator("[data-veredito]")).toHaveText("Dossiê conferido.");
    await expect(fase1.locator("[data-explicacao-da-resposta]")).toHaveText(atividade.explicacao);
    await expect(fase1.locator("[data-explicacao] [data-bloco]")).toHaveCount(fase.explicacao.length);
    await expect(fase1.locator('[data-carimbo="novo"]')).toBeVisible();
    await expect(fase1.locator("[data-carimbo-confirmacao]")).toHaveText("Missão concluída: dossiê registrado.");
    await expect(fase1.locator("[data-anuncio-do-carimbo]")).toContainText(`Carimbo no passaporte: ${fase.titulo}.`);
    await fase1.locator("[data-fontes-da-fase] summary").click();
    await expect(fase1.locator("[data-fontes-da-fase] [data-apoio]")).toHaveCount(gaveta.length);
    await expect(fase1.locator("[data-fontes-da-fase] [data-fonte]").first()).toBeVisible();
    await expect(fase1.locator("[data-proxima-missao]")).toBeVisible();
    const salvo = await progressoSalvo(page, slug);
    expect(salvo?.fases[fase.id]?.concluida).toBe("resposta");
    expect(salvo?.fases[fase.id]?.dossie?.conferidas.length).toBe(atividade.fichas.length);
    expect(salvo?.fases[fase.id]?.tentativas).toBe(atividade.fichas.length * 2 + 2);
    await fase1.locator('[data-continuar="resumo"]').click();
    const resumo = await janela(page, "resumo");
    await expect(resumo).toContainText("Esta missão tem uma fase");
    await expect(resumo.locator("[data-outra-missao]")).toBeVisible();
    await resumo.locator("[data-fechar-resumo]").click();
    await expect(page.locator("[data-abrir-marco]")).toHaveText("Rever o dossiê");
    await expect(page.locator("[data-dossie-andamento]")).toContainText(`fichas conferidas: ${atividade.fichas.length} de ${atividade.fichas.length}`);
    expect(erros).toEqual([]);
  });
}

test("recarregar a página recupera o dossiê e a ficha relacionada; o carimbo de uma missão concluída não é comemorado de novo", async ({ page }) => {
  const slug: Slug = "flavio-bolsonaro";
  const { fase, atividade, gaveta } = missaoDe(slug);
  await abrir(page, slug, 1, "investigacao");
  let fase1 = await tocar(page, "gaveta");
  await guardar(fase1, gaveta.slice(0, 2));
  await fase1.locator("[data-fechar-fase]").click();
  await page.reload();
  await pronto(page);
  await expect(page.locator("[data-dossie-andamento]")).toContainText(`Dossiê: 2 de ${gaveta.length} documentos`);
  fase1 = await tocar(page, "fichas");
  await expect(fase1.locator("[data-dossie-item]")).toHaveCount(2);
  const comDocumentoNoDossie = atividade.fichas.find((ficha) => gaveta.slice(0, 2).includes(refKey(ficha.evidencia)));
  if (comDocumentoNoDossie !== undefined) {
    await fase1.locator(`[data-relacionar="${comDocumentoNoDossie.id}:${refKey(comDocumentoNoDossie.evidencia)}"]`).click();
    await expect(fase1.locator(`[data-ficha="${comDocumentoNoDossie.id}"]`)).toHaveAttribute("data-ficha-situacao", "relacionada");
    await page.reload();
    await pronto(page);
    fase1 = await tocar(page, "fichas");
    await expect(fase1.locator(`[data-ficha="${comDocumentoNoDossie.id}"]`)).toHaveAttribute("data-ficha-situacao", "relacionada");
  }
  // Conclui tudo, recarrega: a fase diz que já tem carimbo, sem bater de novo.
  await guardar(fase1, gaveta.slice(2));
  for (const ficha of atividade.fichas) {
    if (ficha.id === comDocumentoNoDossie?.id) await fase1.locator(`[data-campo-botao="${ficha.id}:${ficha.destaque.campo}"]`).click();
    else await conferir(fase1, ficha);
  }
  await expect(fase1.locator('[data-carimbo="novo"]')).toBeVisible();
  await page.reload();
  await pronto(page);
  await expect(jogo(page)).toHaveAttribute("data-fase-situacao", "concluida");
  fase1 = await tocar(page, "fichas");
  await expect(fase1.locator('[data-carimbo="registrado"]')).toBeVisible();
  await expect(fase1.locator('[data-carimbo="novo"]')).toHaveCount(0);
  await expect(fase1.locator("[data-veredito]")).toContainText("Você já concluiu esta missão");
  for (const ficha of atividade.fichas) await expect(fase1.locator(`[data-ficha="${ficha.id}"]`)).toHaveAttribute("data-ficha-situacao", "conferida");
  void fase;
});

test("ler sem o cenário, só com o teclado: a conversa, a gaveta e as fichas na página; Ver a explicação e continuar mostra a solução e dá o carimbo", async ({ page }) => {
  const slug: Slug = "lula";
  const { fase, atividade } = missaoDe(slug);
  await page.goto(`${rota(slug, "investigacao")}?fase=1&leitura=1`);
  await pronto(page, false);
  await expect(jogo(page)).toHaveAttribute("data-modo", "leitura");
  const pagina = page.locator('[data-missao="dossie"]');
  await expect(pagina).toBeVisible();
  await expect(pagina.locator("[data-fase-titulo]")).toHaveText(fase.titulo);
  for (const secao of ["escrivao", "quadro", "gaveta", "fichas"]) await expect(pagina.locator(`[data-secao="${secao}"]`)).toBeVisible();
  // A conversa pelo teclado: Tab até a primeira escolha, Enter.
  await tabAte(page, '[data-escolha="o-que-e-ficha"]');
  await page.keyboard.press("Enter");
  await expect(pagina.locator('[data-secao="escrivao"]')).toHaveAttribute("data-conversa", "ficha");
  await tabAte(page, '[data-escolha="onde-estao"]');
  await page.keyboard.press("Enter");
  await tabAte(page, '[data-escolha="e-depois"]');
  await page.keyboard.press("Enter");
  await expect(pagina.locator("[data-conversa-fim]")).toContainText("A chave de leitura está no quadro");
  // Sem a marca, a chave de leitura fica fechada, e abre pelo teclado.
  await expect(pagina.locator("[data-chave-de-leitura]")).not.toHaveAttribute("open", "");
  await tabAte(page, "[data-chave-de-leitura] summary");
  await page.keyboard.press("Enter");
  await expect(pagina.locator("[data-chave-de-leitura]")).toHaveAttribute("open", "");
  // A gaveta pelo teclado: abrir o primeiro documento e guardar.
  const primeiro = refKey(atividade.fichas[0]!.evidencia);
  await tabAte(page, `[data-abrir-documento="${primeiro}"]`, 80);
  await page.keyboard.press("Enter");
  await tabAte(page, `[data-guardar-no-dossie="${primeiro}"]`);
  await page.keyboard.press("Enter");
  await expect(pagina.locator("[data-dossie-item]")).toHaveCount(1);
  // Ver a explicação e continuar: a solução de cada ficha, o carimbo pela leitura e o botão de resumo.
  await tabAte(page, "[data-ver-explicacao]", 120);
  await page.keyboard.press("Enter");
  await expect(pagina.locator("[data-resultado]")).toHaveAttribute("data-resultado", "explicacao");
  for (const ficha of atividade.fichas) {
    const item = pagina.locator(`[data-ficha="${ficha.id}"]`);
    await expect(item).toHaveAttribute("data-ficha-situacao", "lida");
    await expect(item.locator("[data-ficha-conferida]")).toContainText("campo");
  }
  await expect(pagina.locator('[data-carimbo="novo"]')).toBeVisible();
  const salvo = await progressoSalvo(page, slug);
  expect(salvo?.fases[fase.id]?.concluida).toBe("explicacao");
  await expect(pagina.locator('[data-continuar="resumo"]')).toBeVisible();
  expect(await page.evaluate(() => document.activeElement !== document.body)).toBe(true);
});

test.describe("celular", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("em 390 por 844, os objetos da sala e o botão principal abrem a missão, e a ficha se relaciona pelo toque", async ({ page }) => {
    const slug: Slug = "lula";
    const { atividade, gaveta } = missaoDe(slug);
    await abrir(page, slug, 1, "investigacao");
    for (const objeto of ["escrivao", "gaveta", "fichas", "quadro"]) {
      const botao = page.locator(`[data-marcador="objeto:${objeto}"]`);
      await expect(botao).toBeVisible();
      const caixa = (await botao.boundingBox())!;
      expect(caixa.width, objeto).toBeGreaterThanOrEqual(44);
      expect(caixa.height, objeto).toBeGreaterThanOrEqual(44);
    }
    await page.locator("[data-abrir-marco]").tap();
    let fase1 = await janela(page, "fase");
    await fase1.locator('[data-escolha="onde-estao"]').tap();
    await fase1.locator('[data-escolha="e-depois"]').tap();
    await expect(fase1.locator('[data-secao="escrivao"]')).toHaveAttribute("data-conversa", "encerrada");
    await fase1.locator("[data-fechar-fase]").tap();
    fase1 = await tocar(page, "gaveta");
    const ficha = atividade.fichas[0]!;
    const chave = refKey(ficha.evidencia);
    await fase1.locator(`[data-abrir-documento="${chave}"]`).tap();
    await fase1.locator(`[data-guardar-no-dossie="${chave}"]`).tap();
    await fase1.locator(`[data-relacionar="${ficha.id}:${chave}"]`).tap();
    await expect(fase1.locator(`[data-ficha="${ficha.id}"]`)).toHaveAttribute("data-ficha-situacao", "relacionada");
    await fase1.locator(`[data-campo-botao="${ficha.id}:${ficha.destaque.campo}"]`).tap();
    await expect(fase1.locator(`[data-ficha="${ficha.id}"]`)).toHaveAttribute("data-ficha-situacao", "conferida");
    void gaveta;
  });
});
