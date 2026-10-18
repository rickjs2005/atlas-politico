// Capturas da Praça do Mural (D-153), para docs/capturas/praca/. Tiradas da
// saída estática: `npm run build` e
// `npx playwright test -c playwright.export.config.ts --project=capturas praca.capture`.
// Não é teste: só registra as telas. Os testes ficam em `tests/e2e/praca.spec.ts`.
//
// O personagem anda de verdade pela cena, pelo teclado, até cada lugar: as
// capturas da praça são o que a pessoa vê. Com o WebGL por software do
// Chromium sem interface, a cena anda devagar: cada andada espera a posição,
// e não um tempo fixo.

import { expect, test, type Locator, type Page } from "@playwright/test";

import { fieldOf } from "@/lib/game/dossier";
import { buildPracaContent } from "@/lib/praca/conteudo";
import { abrirMateria, abrirPauta, ataCerta, fixarNota, lavrarAta, levarCopia, notaCerta, pautasDaSessao, pegarItem, progressoInicial } from "@/lib/praca/regras";
import type { ProgressoDaPraca } from "@/lib/praca/tipos";

import { data } from "../e2e/jogo-apoio";

const OUT = process.env.CAPTURE_DIR ?? "docs/capturas/praca";
const COMPUTADOR = { width: 1440, height: 900 };
const CELULAR = { width: 390, height: 844 };
const conteudo = buildPracaContent(data);
// As pautas de três campos da primeira sessão, pelo id: as duas primeiras do mural são o tutorial (D-155).
const pauta1 = conteudo.pautas.find((pauta) => pauta.id === "veto-regime-fiscal")!;
const pauta2 = conteudo.pautas.find((pauta) => pauta.id === "duas-pecs")!;
const [sessao1, sessao2] = conteudo.sessoes as [(typeof conteudo.sessoes)[number], (typeof conteudo.sessoes)[number]];
const materia = conteudo.materias[0]!;
const janela = (page: Page, id: string) => page.locator(`[data-janela="${id}"]`);
const acaoDe = (id: string) => `acao:${fieldOf(conteudo.documentos[id]!, "acao").valor}`;

const shot = async (page: Page, nome: string) => {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/${nome}.png` });
};

/** Rola o corpo de uma janela até um trecho dela. */
async function mostrar(caixa: Locator, seletor: string) {
  await caixa.locator("[data-janela-corpo]").evaluate((corpo, alvo) => {
    const no = corpo.querySelector(alvo);
    if (no === null) return;
    corpo.scrollTop += no.getBoundingClientRect().top - corpo.getBoundingClientRect().top - 12;
  }, seletor);
}

async function entrar(page: Page) {
  await page.goto("/praca/");
  await page.locator("[data-entrar]").click();
  await expect(page.locator("[data-praca]")).toHaveAttribute("data-cena", "pronta", { timeout: 60_000 });
  // O primeiro quadro desenhado deixa a posição no canvas: com o WebGL por software, ele pode demorar alguns segundos.
  await expect(page.locator("canvas")).toHaveAttribute("data-posicao", /./, { timeout: 60_000 });
}

/** Segura uma tecla até a coordenada passar do alvo. O eixo x cresce para a direita; o z, para a frente da tela. */
async function andar(page: Page, eixo: "x" | "z", alvo: number) {
  const canvas = page.locator("canvas");
  const ler = async () => {
    const [x, z] = (await canvas.getAttribute("data-posicao"))!.split(",").map(Number) as [number, number];
    return eixo === "x" ? x : z;
  };
  const atual = await ler();
  const tecla = eixo === "x" ? (alvo > atual ? "d" : "a") : alvo > atual ? "s" : "w";
  await page.keyboard.down(tecla);
  try {
    // Confere a posição a cada 40 ms: a tecla solta logo depois do alvo, e o personagem passa pouco dele.
    if (alvo > atual) await expect.poll(ler, { timeout: 90_000, intervals: [40] }).toBeGreaterThanOrEqual(alvo);
    else await expect.poll(ler, { timeout: 90_000, intervals: [40] }).toBeLessThanOrEqual(alvo);
  } finally {
    await page.keyboard.up(tecla);
  }
}

/** O progresso com as pautas da primeira sessão publicadas (o tutorial e as notas): a Câmara aberta, para as telas do fim dela e do começo da segunda. */
function primeiraSessaoConcluida(posicao: { x: number; z: number }): ProgressoDaPraca {
  let progresso = pegarItem(pegarItem(progressoInicial(), "bilhete"), "chave-senado");
  for (const pauta of pautasDaSessao(sessao1, conteudo)) {
    progresso = abrirPauta(progresso, pauta.id);
    for (const id of [pauta.resposta, ...pauta.comparar]) progresso = levarCopia(progresso, id, conteudo.gavetas);
    progresso = fixarNota(progresso, pauta, notaCerta(pauta, conteudo.documentos)!, conteudo.documentos).progresso;
  }
  return {
    ...progresso,
    marcas: ["conversa:zefa-boas-vindas", "conversa:teodoro-recortes", "conversa:escrivao-gavetas", "conversa:escrivao-com-chave", "leitura", "etapas"],
    posicao,
  };
}

/** O progresso com a edição inteira: a ata lavrada e as oito notas no mural. */
function edicaoConcluida(posicao: { x: number; z: number }): ProgressoDaPraca {
  let progresso = pegarItem(primeiraSessaoConcluida(posicao), "credencial");
  progresso = abrirMateria(progresso, materia.id);
  for (const lado of materia.lados) progresso = levarCopia(progresso, lado.documento, conteudo.gavetas);
  progresso = lavrarAta(progresso, materia, ataCerta(materia, conteudo.documentos)!, conteudo.documentos).progresso;
  for (const pauta of pautasDaSessao(sessao2, conteudo)) {
    progresso = abrirPauta(progresso, pauta.id);
    for (const id of [pauta.resposta, ...pauta.comparar]) progresso = levarCopia(progresso, id, conteudo.gavetas);
    progresso = fixarNota(progresso, pauta, notaCerta(pauta, conteudo.documentos)!, conteudo.documentos).progresso;
  }
  return { ...progresso, marcas: [...progresso.marcas, "conversa:lourdes-sessao", "conversa:lourdes-mesa", "conversa:escrivao-materia", "ata", "materia"] };
}

test("a praça em computador", async ({ browser }) => {
  test.setTimeout(600_000);
  const contexto = await browser.newContext({
    viewport: COMPUTADOR,
    reducedMotion: "reduce",
  });
  const page = await contexto.newPage();
  const n = (passo: number, nome: string) => `${String(passo).padStart(2, "0")}-${nome}--computador`;

  await page.goto("/praca/");
  await shot(page, n(1, "entrada"));
  await entrar(page);
  await shot(page, n(2, "praca-no-comeco"));

  // Ao mural: pela faixa do começo para a esquerda, e para o fundo pela coluna do mural.
  await andar(page, "x", -9.3);
  await andar(page, "z", -5.6);
  await expect(page.locator('[data-acao="mural"]')).toBeVisible();
  await shot(page, n(3, "perto-do-mural"));
  await page.keyboard.press("e");
  await expect(janela(page, "mural")).toBeVisible();
  await shot(page, n(4, "mural-com-as-perguntas"));
  await janela(page, "mural").locator(`[data-abrir-pauta="${pauta1.id}"]`).click();
  await janela(page, "mural").locator("[data-aceitar]").click();
  await shot(page, n(5, "pauta-aceita"));
  await page.keyboard.press("Escape");

  // À padaria: pela coluna do mural até a altura da porta.
  await andar(page, "z", 0.5);
  await expect(page.locator('[data-acao="padaria"]')).toBeVisible();
  await page.keyboard.press("e");
  const padaria = janela(page, "padaria");
  await padaria.locator('[data-escolha="mural"]').click();
  await padaria.locator('[data-escolha="quem"]').click();
  await shot(page, n(6, "zefa-diz-onde-procurar"));
  await page.keyboard.press("Escape");

  // Ao arquivo: pela faixa do começo até a coluna do arquivo, e para o fundo até a porta.
  await andar(page, "z", 6.5);
  await andar(page, "x", 9.3);
  await andar(page, "z", 0.5);
  await expect(page.locator('[data-acao="arquivo"]')).toBeVisible();
  await shot(page, n(7, "perto-do-arquivo"));
  await page.keyboard.press("e");
  const arquivo = janela(page, "arquivo");
  await arquivo.locator('[data-escolha="ler"]').click();
  await shot(page, n(8, "escrivao-chave-de-leitura"));
  await arquivo.locator('[data-escolha="abrir"]').click();
  await arquivo.locator("[data-encerrar]").click();
  await shot(page, n(9, "gavetas-por-pessoa-e-ano"));
  await arquivo.locator('[data-gaveta="senado-2023"]').click();
  await shot(page, n(10, "gaveta-trancada"));
  await arquivo.locator(`[data-gaveta="${pauta1.gaveta}"]`).click();
  const gaveta1 = conteudo.gavetas.find((gaveta) => gaveta.id === pauta1.gaveta)!;
  for (const id of gaveta1.documentos) {
    await arquivo.locator(`[data-abrir-documento="${id}"]`).click();
    await arquivo.locator(`[data-levar="${id}"]`).click();
  }
  await mostrar(arquivo, `[data-documento="${pauta1.resposta}"]`);
  await shot(page, n(11, "documento-aberto-com-copia"));
  await page.keyboard.press("Escape");

  // De volta ao mural, com as cópias: a nota errada, explicada, e a certa, fixada.
  await andar(page, "z", 6.5);
  await andar(page, "x", -9.3);
  await andar(page, "z", -5.6);
  await page.keyboard.press("e");
  await janela(page, "mural").locator(`[data-abrir-pauta="${pauta1.id}"]`).click();
  await janela(page, "mural").locator("[data-montar]").click();
  const errado = gaveta1.documentos.find((id) => id !== pauta1.resposta)!;
  const acaoDe = (id: string) => `acao:${fieldOf(conteudo.documentos[id]!, "acao").valor}`;
  const marcar = async (nota: Record<string, string>) => {
    for (const [campo, chave] of Object.entries(nota)) await janela(page, "mural").locator(`input[data-opcao="${campo}:${chave}"]`).check();
  };
  await marcar({
    documento: errado,
    quando: `data:${conteudo.documentos[errado]!.data.valor}`,
    registro: acaoDe(pauta1.resposta),
  });
  await shot(page, n(12, "montar-a-nota"));
  await janela(page, "mural").locator("[data-fixar]").click();
  await mostrar(janela(page, "mural"), '[data-campo-da-nota="documento"]');
  await shot(page, n(13, "nota-recusada-documento-explicado"));
  await marcar({
    documento: pauta1.resposta,
    quando: `data:${conteudo.documentos[pauta1.resposta]!.data.valor}`,
    registro: acaoDe(pauta1.resposta),
  });
  await janela(page, "mural").locator("[data-fixar]").click();
  await expect(janela(page, "mural").locator("[data-nota-fixada]")).toBeVisible();
  await shot(page, n(14, "nota-fixada-com-o-veto"));
  await mostrar(janela(page, "mural"), "[data-mudanca]");
  await shot(page, n(15, "o-que-mudou"));
  await page.keyboard.press("Escape");
  await shot(page, n(16, "mural-com-uma-nota"));

  // O bilhete, perto do coreto: pelo fundo até passar os bancos da direita, para a frente, e de volta para o meio.
  await andar(page, "x", 6.6);
  await andar(page, "z", 3.0);
  await andar(page, "x", 4.0);
  await expect(page.locator('[data-acao="bilhete"]')).toBeVisible();
  await shot(page, n(17, "bilhete-no-chao"));
  await page.keyboard.press("e");
  await shot(page, n(18, "o-bilhete"));
  await janela(page, "bilhete").locator("[data-guardar-bilhete]").click();

  // A Câmara fechada, de perto: pela coluna da direita até o fundo, e pelo fundo até a escadaria.
  await andar(page, "x", 6.6);
  await andar(page, "z", -7.4);
  await andar(page, "x", -0.5);
  await expect(page.locator('[data-acao="camara"]')).toBeVisible();
  await shot(page, n(19, "camara-fechada"));
  await page.keyboard.press("e");
  await shot(page, n(20, "camara-o-que-falta"));
  await page.keyboard.press("Escape");
  await page.locator('[data-abrir="caderno"]').click();
  await shot(page, n(21, "caderno"));
  await contexto.close();
});

test("o fim da primeira sessão em computador: as notas e a Câmara aberta", async ({ browser }) => {
  test.setTimeout(300_000);
  const contexto = await browser.newContext({
    viewport: COMPUTADOR,
    reducedMotion: "reduce",
  });
  const page = await contexto.newPage();
  await page.goto("/praca/");
  await page.evaluate((progresso) => window.localStorage.setItem("atlas-politico:praca", JSON.stringify(progresso)), primeiraSessaoConcluida({ x: -9.3, z: -5.6 }));
  await page.reload();
  await shot(page, "22-entrada-continuar--computador");
  await entrar(page);
  await expect(page.locator('[data-acao="mural"]')).toBeVisible({ timeout: 30_000 });
  await shot(page, "23-mural-com-as-duas-notas--computador");
  await page.keyboard.press("e");
  await janela(page, "mural").locator(`[data-abrir-pauta="${pauta2.id}"]`).click();
  await janela(page, "mural").locator("[data-ler-nota]").click();
  await shot(page, "24-nota-fixada-do-voto--computador");
  await page.keyboard.press("Escape");
  await andar(page, "z", -7.4);
  await andar(page, "x", -0.5);
  await expect(page.locator('[data-acao="camara"]')).toBeVisible();
  await shot(page, "25-camara-aberta-com-a-lourdes--computador");
  await page.keyboard.press("e");
  await shot(page, "26-camara-a-lourdes-anuncia-a-sessao--computador");
  await contexto.close();
});

test("a segunda sessão em computador: a Lourdes, a credencial, a ata lado a lado e o mural novo", async ({ browser }) => {
  test.setTimeout(600_000);
  const contexto = await browser.newContext({
    viewport: COMPUTADOR,
    reducedMotion: "reduce",
  });
  const page = await contexto.newPage();
  const n = (passo: number, nome: string) => `${String(passo).padStart(2, "0")}-${nome}--computador`;
  await page.goto("/praca/");
  await page.evaluate((progresso) => window.localStorage.setItem("atlas-politico:praca", JSON.stringify(progresso)), primeiraSessaoConcluida({ x: -0.5, z: -7.4 }));
  await page.reload();
  await entrar(page);
  await expect(page.locator('[data-acao="camara"]')).toBeVisible({ timeout: 30_000 });

  // A Câmara: a matéria na mesa, que pede a credencial.
  await page.keyboard.press("e");
  const camara = janela(page, "camara");
  await camara.locator('[data-escolha="materia"]').click();
  await camara.locator('[data-escolha="mesa"]').click();
  await camara.locator("[data-encerrar]").click();
  await camara.locator("[data-aceitar-materia]").click();
  await expect(camara.locator("[data-sem-credencial]")).toBeVisible();
  await shot(page, n(28, "a-mesa-pede-a-credencial"));
  await page.keyboard.press("Escape");

  // A banca, pelo fundo: o Teodoro entrega a credencial.
  await andar(page, "x", 8.0);
  await expect(page.locator('[data-acao="banca"]')).toBeVisible();
  await page.keyboard.press("e");
  const banca = janela(page, "banca");
  await banca.locator('[data-escolha="pegar"]').click();
  await expect(banca.locator('[data-item-recebido="credencial"]')).toBeVisible();
  await shot(page, n(29, "teodoro-entrega-a-credencial"));
  await page.keyboard.press("Escape");

  // O arquivo: o Escrivão explica a matéria; as cópias das duas gavetas.
  await andar(page, "z", 0.5);
  await andar(page, "x", 9.3);
  await expect(page.locator('[data-acao="arquivo"]')).toBeVisible();
  await page.keyboard.press("e");
  const arquivo = janela(page, "arquivo");
  await arquivo.locator('[data-escolha="como"]').click();
  await shot(page, n(30, "escrivao-explica-a-materia"));
  await arquivo.locator('[data-escolha="abrir"]').click();
  await arquivo.locator("[data-encerrar]").click();
  for (const lado of materia.lados) {
    await arquivo.locator(`[data-gaveta="${lado.gaveta}"]`).click();
    for (const id of conteudo.gavetas.find((gaveta) => gaveta.id === lado.gaveta)!.documentos) {
      if ((await arquivo.locator(`[data-documento="${id}"]`).getAttribute("data-copia")) !== "true") await arquivo.locator(`[data-levar="${id}"]`).click();
    }
    if (lado === materia.lados[materia.lados.length - 1]) await arquivo.locator(`[data-abrir-documento="${lado.documento}"]`).click();
    else await arquivo.locator("[data-voltar-as-gavetas]").click();
  }
  await shot(page, n(31, "copias-das-duas-gavetas-da-materia"));
  await page.keyboard.press("Escape");

  // De volta à Câmara: a ata errada, explicada por lado, e a certa, lado a lado.
  await andar(page, "z", -7.4);
  await andar(page, "x", -0.5);
  await expect(page.locator('[data-acao="camara"]')).toBeVisible();
  await page.keyboard.press("e");
  await camara.locator('[data-aba="mesa"]').click();
  const [senado, planalto] = materia.lados as [(typeof materia.lados)[number], (typeof materia.lados)[number]];
  const outroVoto = conteudo.gavetas.find((gaveta) => gaveta.id === senado.gaveta)!.documentos.find((id) => id !== senado.documento)!;
  const lavrar = async (ata: Record<string, { documento: string; registro: string }>) => {
    for (const [lado, escolha] of Object.entries(ata)) for (const [campo, chave] of Object.entries(escolha)) await camara.locator(`input[data-opcao="${lado}:${campo}:${chave}"]`).check();
    await camara.locator("[data-lavrar]").click();
  };
  await lavrar({ [senado.id]: { documento: outroVoto, registro: acaoDe(outroVoto) }, [planalto.id]: { documento: planalto.documento, registro: acaoDe(planalto.documento) } });
  await mostrar(camara, `[data-erro-da-ata="${senado.id}:documento"]`);
  await shot(page, n(32, "ata-recusada-lado-explicado"));
  await lavrar({ [senado.id]: { documento: senado.documento, registro: acaoDe(senado.documento) }, [planalto.id]: { documento: planalto.documento, registro: acaoDe(planalto.documento) } });
  await expect(camara.locator(`[data-ata-lavrada="${materia.id}"]`)).toBeVisible();
  await shot(page, n(33, "ata-lavrada-lado-a-lado"));
  await mostrar(camara, "[data-mudanca]");
  await shot(page, n(34, "ata-o-que-mudou"));
  await page.keyboard.press("Escape");
  await shot(page, n(35, "camara-com-a-ata-no-quadro"));

  // O mural, pelo fundo: as perguntas novas, em duas sessões.
  await andar(page, "x", -9.3);
  await expect(page.locator('[data-acao="mural"]')).toBeVisible();
  await page.keyboard.press("e");
  await shot(page, n(36, "mural-com-as-perguntas-novas"));
  await contexto.close();
});

test("o fim da edição em computador: as oito notas, a ata e o caderno", async ({ browser }) => {
  test.setTimeout(300_000);
  const contexto = await browser.newContext({
    viewport: COMPUTADOR,
    reducedMotion: "reduce",
  });
  const page = await contexto.newPage();
  await page.goto("/praca/");
  await page.evaluate((progresso) => window.localStorage.setItem("atlas-politico:praca", JSON.stringify(progresso)), edicaoConcluida({ x: -9.3, z: -5.6 }));
  await page.reload();
  await entrar(page);
  await expect(page.locator('[data-acao="mural"]')).toBeVisible({ timeout: 30_000 });
  await shot(page, "37-fim-da-edicao-mural-com-oito-notas--computador");
  await page.keyboard.press("e");
  await shot(page, "38-mural-respondido--computador");
  await page.keyboard.press("Escape");
  await page.locator('[data-abrir="caderno"]').click();
  await shot(page, "39-caderno-no-fim--computador");
  await page.keyboard.press("Escape");
  await andar(page, "z", -7.4);
  await andar(page, "x", -11.0);
  await andar(page, "z", 0.5);
  await expect(page.locator('[data-acao="padaria"]')).toBeVisible();
  await page.keyboard.press("e");
  await shot(page, "40-zefa-no-fim--computador");
  await contexto.close();
});

test("a praça em celular", async ({ browser }) => {
  test.setTimeout(300_000);
  const contexto = await browser.newContext({
    viewport: CELULAR,
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
  });
  const page = await contexto.newPage();
  const n = (passo: number, nome: string) => `${String(passo).padStart(2, "0")}-${nome}--celular`;
  await page.goto("/praca/");
  await shot(page, n(1, "entrada"));
  await entrar(page);
  await shot(page, n(2, "praca-no-comeco-com-joystick"));
  await andar(page, "x", -9.3);
  await andar(page, "z", -5.6);
  await expect(page.locator('[data-acao="mural"]')).toBeVisible();
  await shot(page, n(3, "perto-do-mural"));
  await page.locator('[data-acao="mural"]').tap();
  await shot(page, n(4, "mural"));
  await janela(page, "mural").locator(`[data-abrir-pauta="${pauta1.id}"]`).tap();
  await shot(page, n(5, "pergunta"));
  await janela(page, "mural").locator("[data-fechar]").tap();
  await andar(page, "z", 6.5);
  await andar(page, "x", 9.3);
  await andar(page, "z", 0.5);
  await page.locator('[data-acao="arquivo"]').tap();
  await janela(page, "arquivo").locator('[data-escolha="abrir"]').tap();
  await janela(page, "arquivo").locator("[data-encerrar]").tap();
  await shot(page, n(6, "gavetas"));
  await contexto.close();

  // A segunda sessão no celular: a mesa da Câmara com a ata lado a lado, que vira uma coluna só na tela estreita.
  const segunda = await browser.newContext({
    viewport: CELULAR,
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
  });
  const tela = await segunda.newPage();
  await tela.goto("/praca/");
  await tela.evaluate((progresso) => window.localStorage.setItem("atlas-politico:praca", JSON.stringify(progresso)), edicaoConcluida({ x: -0.5, z: -7.4 }));
  await tela.reload();
  await entrar(tela);
  await expect(tela.locator('[data-acao="camara"]')).toBeVisible({ timeout: 30_000 });
  await shot(tela, n(7, "camara-com-a-ata-no-quadro"));
  await tela.locator('[data-acao="camara"]').tap();
  await janela(tela, "camara").locator('[data-aba="mesa"]').tap();
  await shot(tela, n(8, "ata-lavrada"));
  await segunda.close();
});

test("sem a cena, em computador", async ({ browser }) => {
  const contexto = await browser.newContext({
    viewport: COMPUTADOR,
    reducedMotion: "reduce",
  });
  const page = await contexto.newPage();
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, tipo: string, ...resto: unknown[]) {
      if (typeof tipo === "string" && tipo.startsWith("webgl")) return null;
      return (original as (this: HTMLCanvasElement, tipo: string, ...resto: unknown[]) => unknown).call(this, tipo, ...resto);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
  await page.goto("/praca/");
  await page.locator("[data-entrar]").click();
  await expect(page.locator("[data-praca]")).toHaveAttribute("data-praca", "lista", { timeout: 60_000 });
  await shot(page, "27-sem-a-cena-lista--computador");
  await contexto.close();
});
