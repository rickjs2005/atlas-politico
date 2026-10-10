// Jogo, etapa 1 (docs/GAMEPLAY.md): a entrada com a escolha de personagem, a
// cena que domina a tela, o movimento com colisão, a interação, a saída
// bloqueada até a tarefa estar cumprida e todos os registros do capítulo
// estarem recolhidos, a conclusão e o avanço, a tarefa de ordem com nova
// tentativa, o progresso separado por personagem e recuperado ao recarregar,
// o caminho pelo painel sem o cenário, o toque em celular, em pé e deitado, e
// a ida à ficha com volta ao capítulo. Também os avisos editoriais: o cenário
// como representação, a ordem não documentada e a situação da revisão.
//
// Os valores esperados saem dos dados gerados e das cenas. As duas jornadas
// pelo cenário rodam para os dois personagens. Além dos atributos do
// documento, que dizem o que a regra decidiu, os testes leem o canvas, que é
// o que a pessoa vê, e nenhum deles aceita erro não tratado na página.

import { readFileSync } from "node:fs";

import { expect, test, type Page } from "@playwright/test";

import { compareDates, formatDate, yearOf } from "@/lib/domain/dates";
import { findUndeterminedOrder } from "@/lib/domain/order";
import { chaptersOf } from "@/lib/game/chapters";
import { getScene } from "@/lib/game/scenes";
import { storageKey } from "@/lib/game/storage";
import { PROGRESS_VERSION, type ChapterSpec } from "@/lib/game/types";

import { clearProgress, clicar, frame, holdKeys, jogo, palco, position, waitForStage, walkTo } from "./jogo-caminho";

interface EventRecord {
  id: string;
  slug: string;
  titulo: string;
  data: { valor: string; precisao: "ano" | "mes" | "dia" };
  fontes: { fonteId: string }[];
}

const conjunto = JSON.parse(readFileSync("generated/dados/conjunto.json", "utf8")) as {
  acontecimentos: EventRecord[];
  pessoas: { id: string; slug: string; nome: string }[];
  fontes: { id: string; url: string }[];
};
const registro = (id: string) => conjunto.acontecimentos.find((item) => item.id === id)!;
const urlsDasFontes = (id: string) => registro(id).fontes.map((citacao) => conjunto.fontes.find((fonte) => fonte.id === citacao.fonteId)!.url);

const PERSONAGENS = ["flavio-bolsonaro", "lula"] as const;
type Slug = (typeof PERSONAGENS)[number];

/** Os dois capítulos de um personagem, com as cenas e o registro que a primeira tarefa pede. */
function trajetoria(slug: Slug) {
  const capitulos = chaptersOf(slug);
  const [c1, c2] = capitulos as [ChapterSpec, ChapterSpec];
  return {
    slug,
    rota: `/jogo/${slug}/`,
    nome: conjunto.pessoas.find((pessoa) => pessoa.slug === slug)!.nome,
    capitulos,
    c1,
    c2,
    cena1: getScene(c1.cena),
    cena2: getScene(c2.cena),
    exigido1: c1.tarefa.tipo === "registro" ? c1.tarefa.eventId : "",
  };
}

const LULA = trajetoria("lula");
const FLAVIO = trajetoria("flavio-bolsonaro");
const CELULAR = { width: 390, height: 844 };
const CELULAR_DEITADO = { width: 844, height: 390 };

const posicaoDe = (capitulo: ChapterSpec, eventId: string) => getScene(capitulo.cena).registros[capitulo.eventIds.indexOf(eventId)]!;
const inicioDe = (capitulo: ChapterSpec) => {
  const cena = getScene(capitulo.cena);
  return { x: cena.spawn.x + 0.5, y: cena.spawn.y + 0.5 };
};
/** Os dois registros de uma tarefa de ordem, o mais antigo primeiro. */
const emOrdem = (capitulo: ChapterSpec): [string, string] => {
  if (capitulo.tarefa.tipo !== "ordem") throw new Error(`${capitulo.id} não tem tarefa de ordem`);
  const [a, b] = capitulo.tarefa.eventIds;
  return compareDates(registro(a).data, registro(b).data) <= 0 ? [a, b] : [b, a];
};

const dialogo = (page: Page, nome: string) => page.locator(`[data-dialogo="${nome}"]`);

// Nenhum teste aceita erro não tratado: um desenho que lança exceção não para
// a simulação, e os atributos continuariam certos com o canvas quebrado.
const erros = new WeakMap<Page, string[]>();
test.beforeEach(({ page }) => {
  const lista: string[] = [];
  erros.set(page, lista);
  page.on("pageerror", (erro) => lista.push(erro.message));
});
test.afterEach(({ page }) => {
  expect(erros.get(page) ?? [], "erros não tratados na página").toEqual([]);
});

async function abrirLimpo(page: Page, rota: string) {
  await page.goto(rota);
  await clearProgress(page);
  await page.reload();
  await waitForStage(page);
}

/** Os registros que a tarefa do capítulo pede, e os que ela não pede: a saída exige todos. */
const pedidosPor = (capitulo: ChapterSpec) => (capitulo.tarefa.tipo === "registro" ? [capitulo.tarefa.eventId] : [...capitulo.tarefa.eventIds]);
const foraDaTarefa = (capitulo: ChapterSpec) => capitulo.eventIds.filter((id) => !pedidosPor(capitulo).includes(id));

/**
 * Recolhe um registro pelo painel e guarda. Devolve o modo em que o jogo
 * ficou: `ordem`, se a pergunta da tarefa abriu em seguida, ou `jogando`.
 */
async function recolherPeloPainel(page: Page, id: string) {
  await page.getByRole("button", { name: "Capítulos e tarefas" }).click();
  await clicar(page, page.locator(`[data-recolher="${id}"]`));
  await expect(dialogo(page, "registro")).toBeVisible();
  await clicar(page, page.getByRole("button", { name: /Guardar e/ }));
  await expect(jogo(page)).toHaveAttribute("data-modo", /^(jogando|ordem)$/);
  return (await jogo(page).getAttribute("data-modo"))!;
}

/** Responde certo à pergunta de ordem que está aberta e fecha a janela. */
async function responderAOrdemCerta(page: Page, capitulo: ChapterSpec) {
  const ordem = dialogo(page, "ordem");
  await expect(ordem).toBeVisible();
  await clicar(page, ordem.locator(`[data-escolher-primeiro="${emOrdem(capitulo)[0]}"]`));
  await clicar(page, ordem.locator("[data-confirmar-ordem]"));
  await clicar(page, ordem.locator("[data-ordem-concluida]"));
  await expect(ordem).toHaveCount(0);
}

/** Cumpre só a tarefa do capítulo aberto, pelo painel. A saída continua fechada se o capítulo tem outros registros. */
async function cumprirATarefaPeloPainel(page: Page, capitulo: ChapterSpec) {
  for (const id of pedidosPor(capitulo)) {
    if ((await recolherPeloPainel(page, id)) === "ordem") await responderAOrdemCerta(page, capitulo);
  }
  await expect(jogo(page)).toHaveAttribute("data-tarefa", "concluida");
}

/**
 * Abre a saída do capítulo aberto pelo painel, sem o cenário: recolhe o que
 * ainda falta (primeiro o que a tarefa pede) e responde a ordem quando ela é
 * pedida. O que o teste já recolheu antes fica como está.
 */
async function abrirASaidaPeloPainel(page: Page, capitulo: ChapterSpec) {
  await page.getByRole("button", { name: "Capítulos e tarefas" }).click();
  await expect(dialogo(page, "painel").locator("[data-registro]")).toHaveCount(capitulo.eventIds.length);
  const jaRecolhidos = await page.locator('[data-registro][data-recolhido="sim"]').evaluateAll((nos) => nos.map((no) => no.getAttribute("data-registro")));
  await page.keyboard.press("Escape");
  await expect(dialogo(page, "painel")).toHaveCount(0);
  for (const id of [...pedidosPor(capitulo), ...foraDaTarefa(capitulo)]) {
    if (jaRecolhidos.includes(id)) continue;
    if ((await recolherPeloPainel(page, id)) === "ordem") await responderAOrdemCerta(page, capitulo);
  }
  await expect(jogo(page)).toHaveAttribute("data-tarefa", "concluida");
  await expect(jogo(page)).toHaveAttribute("data-registros", `${capitulo.eventIds.length}/${capitulo.eventIds.length}`);
  await expect(jogo(page)).toHaveAttribute("data-saida", "aberta");
}

/** Atravessa a saída aberta pelo painel e segue para o que vier: o capítulo seguinte ou o fim. */
async function atravessarPeloPainel(page: Page) {
  await page.getByRole("button", { name: "Capítulos e tarefas" }).click();
  await clicar(page, page.locator("[data-atravessar-saida]"));
  await expect(page.locator("[data-transicao]")).toBeVisible();
  await clicar(page, page.getByRole("button", { name: "Continuar" }));
}

/** Conclui o capítulo 1 pelo painel e chega ao capítulo 2. */
async function concluirCapitulo1PeloPainel(page: Page, t: ReturnType<typeof trajetoria>) {
  await abrirASaidaPeloPainel(page, t.c1);
  await atravessarPeloPainel(page);
  await expect(jogo(page)).toHaveAttribute("data-capitulo", t.c2.id);
}

test.describe("entrada do jogo", () => {
  test("escolha clara entre os dois personagens, com prévia do mundo e os capítulos de cada um", async ({ page }) => {
    await page.goto("/jogo/");
    await clearProgress(page);
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Percorra a trajetória em capítulos");

    const escolhas = page.locator("[data-escolha]");
    await expect(escolhas).toHaveCount(2);
    // Ordem alfabética, como no resto do atlas, e o mesmo cartão para os dois.
    await expect(escolhas.nth(0)).toHaveAttribute("data-escolha", "flavio-bolsonaro");
    await expect(escolhas.nth(1)).toHaveAttribute("data-escolha", "lula");
    for (const slug of PERSONAGENS) {
      const cartao = page.locator(`[data-escolha="${slug}"]`);
      const capitulos = chaptersOf(slug);
      expect(capitulos.length).toBeGreaterThanOrEqual(2);
      for (const capitulo of capitulos) await expect(cartao).toContainText(capitulo.titulo);
      await expect(cartao.locator("[data-previa-mundo]")).toBeVisible();
      await expect(cartao.locator(`[data-jogar="${slug}"]`)).toHaveAttribute("href", `/jogo/${slug}/`);
      await expect(cartao.locator(`[data-jogar="${slug}"]`)).toContainText("Começar");
      await expect(cartao).toHaveAttribute("data-situacao", "inicio");
    }
    const caixas = await Promise.all([escolhas.nth(0).boundingBox(), escolhas.nth(1).boundingBox()]);
    expect(Math.round(caixas[0]!.width)).toBe(Math.round(caixas[1]!.width));

    // O menu leva ao jogo, e o guia é apresentado como fictício.
    await expect(page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Jogo" })).toHaveAttribute("aria-current", "page");
    await expect(page.locator("main")).toContainText("personagem fictício");
    // A regra da saída é dita na abertura e na lista de como jogar: os registros de cada capítulo e a tarefa.
    await expect(page.locator("main")).toContainText("em cada capítulo, recolha todos os registros e cumpra a tarefa para abrir a passagem ao seguinte");
    await expect(page.locator("main")).toContainText("A saída de cada capítulo abre com todos os registros recolhidos e a tarefa cumprida.");
    // O cenário é dito como representação, a figura é a mesma em todos os capítulos, e a situação da revisão é a da entrada do atlas.
    await expect(page.locator("main")).toContainText("Os cenários são representações");
    await expect(page.locator("main")).toContainText("mesma figura em todos os capítulos");
    await expect(page.locator("main [data-revisao]")).toContainText("Revisão humana pendente");
    await expect(page.locator("main [data-revisao]").getByRole("link", { name: "Metodologia e fontes" })).toHaveAttribute("href", "/metodologia/");
  });

  test("a entrada do atlas oferece o jogo para os dois, com o mesmo destaque", async ({ page }) => {
    await page.goto("/");
    const acessos = page.locator("[data-jogar-entrada]");
    await expect(acessos).toHaveCount(2);
    await expect(acessos.nth(0)).toHaveAttribute("href", "/jogo/flavio-bolsonaro/");
    await expect(acessos.nth(1)).toHaveAttribute("href", "/jogo/lula/");
    const caixas = await acessos.evaluateAll((nos) =>
      nos.map((no) => {
        const caixa = no.getBoundingClientRect();
        return { largura: Math.round(caixa.width), altura: Math.round(caixa.height) };
      }),
    );
    expect(caixas[0]).toEqual(caixas[1]);
    expect(caixas[0]!.altura).toBeGreaterThanOrEqual(44);
    // A exploração do atlas continua a um clique, nos mesmos cartões.
    await expect(page.locator('main a[href="/politicos/lula/"]').first()).toBeVisible();

    await acessos.nth(1).click();
    await expect(page).toHaveURL(/\/jogo\/lula\/$/);
    await waitForStage(page);
  });

  test("quem já jogou vê onde parou, também no meio do primeiro capítulo", async ({ page }) => {
    await abrirLimpo(page, LULA.rota);
    // Um registro recolhido, sem capítulo concluído: já não é "ainda não jogado".
    const outro = LULA.c1.eventIds.find((id) => id !== LULA.exigido1)!;
    await page.getByRole("button", { name: "Capítulos e tarefas" }).click();
    await page.locator(`[data-recolher="${outro}"]`).click();
    await page.getByRole("button", { name: /Guardar e/ }).click();
    await page.goto("/jogo/");
    const cartao = page.locator('[data-escolha="lula"]');
    await expect(cartao).toHaveAttribute("data-situacao", "em-andamento");
    await expect(cartao.locator("[data-situacao-texto]")).toContainText(`capítulo 1: ${LULA.c1.titulo}`);
    await expect(cartao.locator('[data-jogar="lula"]')).toContainText("Continuar");
    await expect(page.locator('[data-escolha="flavio-bolsonaro"]')).toHaveAttribute("data-situacao", "inicio");

    // Com o capítulo 1 concluído, o cartão aponta o 2.
    await page.goto(LULA.rota);
    await waitForStage(page);
    await concluirCapitulo1PeloPainel(page, LULA);
    await page.goto("/jogo/");
    await expect(cartao).toHaveAttribute("data-situacao", "em-andamento");
    await expect(cartao.locator("[data-situacao-texto]")).toContainText(`capítulo 2: ${LULA.c2.titulo}`);
    await expect(cartao.locator('[data-jogar="lula"]')).toContainText("Continuar");
    await expect(page.locator('[data-escolha="flavio-bolsonaro"]')).toHaveAttribute("data-situacao", "inicio");
  });
});

test.describe("cena e movimento", () => {
  test("a cena domina a tela ao iniciar, em computador e em celular, sem rolagem lateral, e está desenhada", async ({ page }) => {
    await abrirLimpo(page, LULA.rota);
    const caixa = (await jogo(page).boundingBox())!;
    expect(caixa.height / 900, "altura do palco em computador").toBeGreaterThan(0.75);
    await expect(palco(page).locator("canvas")).toBeVisible();
    expect((await frame(page)).cores, "cores no canvas, em computador").toBeGreaterThan(60);
    // A página não rola nem um pixel para mostrar o palco inteiro.
    expect(Math.round(caixa.y + caixa.height)).toBeLessThanOrEqual(900);

    await page.setViewportSize(CELULAR);
    await page.reload();
    await waitForStage(page);
    const estreita = (await jogo(page).boundingBox())!;
    expect(estreita.height / CELULAR.height, "altura do palco em celular").toBeGreaterThan(0.75);
    const { conteudo, janela } = await page.evaluate(() => ({ conteudo: document.documentElement.scrollWidth, janela: window.innerWidth }));
    expect(conteudo).toBeLessThanOrEqual(janela);
    expect((await frame(page)).cores, "cores no canvas, em celular").toBeGreaterThan(60);
  });

  test("o cenário é apresentado como representação: na cena, no guia e no rodapé da página", async ({ page }) => {
    await abrirLimpo(page, FLAVIO.rota);
    // O nome do lugar vem com o rótulo de cenário, e não solto ao lado do período.
    await expect(page.locator("[data-cenario]")).toContainText(`cenário: ${FLAVIO.cena1.nome}`);
    const aviso = "O cenário é uma representação: não afirma que a pessoa esteve neste lugar nem que os fatos aconteceram nele.";
    await expect(page.locator("[data-rodape-do-jogo] [data-aviso-cenario]")).toContainText(aviso);
    await expect(page.locator("[data-rodape-do-jogo] [data-revisao]")).toContainText("Revisão humana pendente");
    await page.getByRole("button", { name: "Como jogar" }).click();
    await expect(dialogo(page, "guia").locator("[data-aviso-cenario]")).toContainText(aviso);
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Capítulos e tarefas" }).click();
    await expect(dialogo(page, "painel")).toContainText(`cenário: ${FLAVIO.cena1.nome}`);
  });

  test("as setas movem o personagem; a parede e os móveis o seguram", async ({ page }) => {
    await abrirLimpo(page, LULA.rota);
    const inicio = await position(page);
    expect(inicio).toEqual(inicioDe(LULA.c1));

    // Para a esquerda da tela (-x no mundo) até a parede: a célula x=0 bloqueia.
    for (const tecla of ["ArrowLeft", "ArrowUp"]) await page.keyboard.down(tecla);
    await page.waitForTimeout(900);
    // Encostado na parede, com as teclas ainda apertadas, o personagem não está andando.
    await expect(palco(page)).toHaveAttribute("data-andando", "nao");
    for (const tecla of ["ArrowLeft", "ArrowUp"]) await page.keyboard.up(tecla);
    const naParede = await position(page);
    expect(naParede.x).toBeGreaterThan(1.2);
    expect(naParede.x).toBeLessThan(1.45);
    // As duas teclas não descem nem sobem no mesmo instante: a linha é a mesma, com folga para essa deriva.
    expect(Math.abs(naParede.y - inicio.y)).toBeLessThan(0.3);

    // De volta, e o movimento para quando a tecla solta.
    await holdKeys(page, ["ArrowRight", "ArrowDown"], 300);
    const depois = await position(page);
    expect(depois.x).toBeGreaterThan(naParede.x + 0.5);
    await page.waitForTimeout(150);
    expect(await position(page)).toEqual(depois);
  });

  test("teclas fora da área do jogo e durante um diálogo não movem o personagem", async ({ page }) => {
    await abrirLimpo(page, LULA.rota);
    const inicio = await position(page);

    await page.getByRole("button", { name: "Como jogar" }).focus();
    await holdKeys(page, ["ArrowRight", "ArrowDown"], 300);
    expect(await position(page), "com o foco fora do palco").toEqual(inicio);

    await page.getByRole("button", { name: "Como jogar" }).click();
    await expect(dialogo(page, "guia")).toBeVisible();
    await expect(dialogo(page, "guia")).toContainText("personagem fictício");
    await expect(jogo(page)).toHaveAttribute("data-modo", "guia");
    await holdKeys(page, ["ArrowRight", "ArrowDown"], 300);
    expect(await position(page), "com um diálogo aberto").toEqual(inicio);

    // Esc fecha e devolve o foco à cena.
    await page.keyboard.press("Escape");
    await expect(dialogo(page, "guia")).toHaveCount(0);
    await expect(palco(page)).toBeFocused();
  });

  test("com o foco na cena pelo teclado, o contorno de foco aparece por cima do desenho", async ({ page }) => {
    await abrirLimpo(page, LULA.rota);
    // A cena vem antes dos botões na ordem de tabulação: Shift+Tab a partir do primeiro botão chega nela.
    await page.getByRole("button", { name: "Como jogar" }).focus();
    await page.keyboard.press("Shift+Tab");
    await expect(palco(page)).toBeFocused();
    const contorno = await palco(page).evaluate((no) => {
      const estilo = getComputedStyle(no);
      return { estilo: estilo.outlineStyle, largura: parseFloat(estilo.outlineWidth), recuo: parseFloat(estilo.outlineOffset), sombra: estilo.boxShadow };
    });
    // Um contorno é pintado por cima do canvas; uma sombra interna ficaria atrás dele.
    expect(contorno.estilo).toBe("solid");
    expect(contorno.largura).toBeGreaterThanOrEqual(2);
    expect(contorno.recuo, "o contorno fica para dentro do palco, que corta o que passa da borda").toBeLessThan(0);
  });

  test("uma tecla segurada não age na janela que acabou de abrir nem rola a página", async ({ page }) => {
    await abrirLimpo(page, LULA.rota);
    const alvo = posicaoDe(LULA.c1, LULA.exigido1);
    await walkTo(page, LULA.cena1, alvo);
    await expect(page.locator("[data-alcance]")).toHaveAttribute("data-alcance-id", LULA.exigido1);

    // Enter abre o registro. A repetição do teclado, com a tecla ainda apertada, cairia no botão que o fecha.
    await page.keyboard.down("Enter");
    const ficha = dialogo(page, "registro");
    await expect(ficha).toBeVisible();
    await expect(ficha.getByRole("button", { name: "Guardar e continuar" })).toBeFocused();
    for (let i = 0; i < 3; i += 1) await page.keyboard.down("Enter");
    await page.waitForTimeout(150);
    await expect(ficha, "a janela continua aberta com Enter segurado").toBeVisible();
    await page.keyboard.up("Enter");
    // Solta a tecla, um Enter novo age normalmente.
    await page.keyboard.press("Enter");
    await expect(ficha).toHaveCount(0);

    // A seta com que se entra na saída continua apertada durante a transição: a página não rola.
    await abrirASaidaPeloPainel(page, LULA.c1);
    await expect(jogo(page)).toHaveAttribute("data-saida", "aberta");
    await walkTo(page, LULA.cena1, { x: LULA.cena1.saida.x - 1, y: LULA.cena1.saida.y }, true);
    expect(await page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight), "a página tem para onde rolar").toBe(true);
    expect(await page.evaluate(() => window.scrollY), "a página está no alto antes de atravessar").toBe(0);
    for (const tecla of ["ArrowRight", "ArrowDown"]) await page.keyboard.down(tecla);
    await expect(page.locator("[data-transicao]")).toBeVisible();
    for (let i = 0; i < 4; i += 1) await page.keyboard.down("ArrowDown");
    await page.waitForTimeout(150);
    expect(await page.evaluate(() => window.scrollY), "rolagem da página durante a transição").toBe(0);
    for (const tecla of ["ArrowRight", "ArrowDown"]) await page.keyboard.up(tecla);
  });
});

for (const slug of PERSONAGENS) {
  const t = trajetoria(slug);

  test.describe(`tarefa, saída e avanço: ${t.nome}`, () => {
    test("a saída fica fechada até a tarefa e todos os registros; o último registro abre a passagem; atravessar avança o capítulo", async ({ page }) => {
      // A jornada inteira pelo cenário, registro a registro: leva mais que o tempo padrão de um teste.
      test.slow();
      expect(t.c1.tarefa.tipo).toBe("registro");
      const total = t.c1.eventIds.length;
      const outros = foraDaTarefa(t.c1);
      expect(outros.length, "registros que a tarefa não pede").toBeGreaterThan(0);
      const contagem = page.locator("[data-objetivo-caixa] [data-registros]");
      const fechada = dialogo(page, "saida-fechada");

      await abrirLimpo(page, t.rota);
      await expect(jogo(page)).toHaveAttribute("data-capitulo", t.c1.id);
      await expect(jogo(page)).toHaveAttribute("data-saida", "fechada");
      await expect(page.locator("[data-objetivo]")).toHaveText(t.c1.objetivo);
      // A regra fica à vista desde o começo: quantos registros há e o que segura a porta.
      await expect(contagem).toHaveText(`Registros: 0 de ${total} · a saída abre com todos`);
      // Quem não vê a cena ouve a mesma regra nas instruções dela.
      const instrucoes = (await palco(page).getAttribute("aria-describedby"))!;
      await expect(page.locator(`[id="${instrucoes}"]`)).toContainText("A saída abre com todos os registros do capítulo recolhidos e a tarefa cumprida.");
      // O palco desenha a porta fechada.
      await expect(palco(page)).toHaveAttribute("data-porta", "fechada");

      // Ao lado da saída, a passagem não deixa entrar e explica o que falta.
      const antesDaSaida = t.cena1.saida.lado === "leste" ? { x: t.cena1.saida.x - 1, y: t.cena1.saida.y } : { x: t.cena1.saida.x, y: t.cena1.saida.y - 1 };
      const paraASaida = t.cena1.saida.lado === "leste" ? ["ArrowRight", "ArrowDown"] : ["ArrowDown", "ArrowLeft"];
      const barradoNaSaida = async () => {
        await walkTo(page, t.cena1, antesDaSaida);
        await holdKeys(page, paraASaida, 600);
        const barrado = await position(page);
        expect({ x: Math.floor(barrado.x), y: Math.floor(barrado.y) }).toEqual(antesDaSaida);
        await expect(jogo(page)).toHaveAttribute("data-capitulo", t.c1.id);
        await expect(page.locator("[data-alcance]")).toHaveAttribute("data-alcance", "saida");
        await expect(page.locator("[data-alcance]")).toContainText("Saída fechada");
        await page.keyboard.press("e");
        await expect(fechada).toBeVisible();
      };
      await barradoNaSaida();
      await expect(fechada.locator("[data-regra-da-saida]")).toHaveText("A saída abre com todos os registros do capítulo recolhidos e a tarefa cumprida.");
      await expect(fechada.locator("[data-falta-registros]")).toHaveAttribute("data-falta-registros", String(total));
      await expect(fechada.locator("[data-falta-tarefa]")).toHaveAttribute("data-falta-tarefa", "sim");
      await expect(fechada).toContainText(t.c1.objetivo);
      await page.getByRole("button", { name: "Entendi" }).click();

      // O registro pedido: perto dele, a dica aparece e o desenho muda; E recolhe e mostra a ficha curta.
      const alvo = posicaoDe(t.c1, t.exigido1);
      const esperado = registro(t.exigido1);
      await walkTo(page, t.cena1, alvo);
      await expect(page.locator("[data-alcance]")).toHaveAttribute("data-alcance-id", t.exigido1);
      await expect(page.locator("[data-alcance]")).toContainText("Recolher o registro");
      const aoAlcance = await frame(page);
      expect(aoAlcance.cores, "cores no canvas, com o registro ao alcance").toBeGreaterThan(60);
      await page.keyboard.press("e");
      const ficha = dialogo(page, "registro");
      await expect(ficha).toBeVisible();
      // Com a ficha aberta, a dica do que estava ao alcance não fica escrita atrás dela.
      await expect(page.locator("[data-alcance]")).toHaveAttribute("data-alcance", "");
      await expect(page.locator("[data-alcance]")).toHaveText("");
      await expect(ficha).toContainText(esperado.titulo);
      await expect(ficha.locator("time")).toHaveAttribute("datetime", esperado.data.valor);
      await expect(ficha).toContainText(formatDate(esperado.data));
      if (esperado.data.precisao === "ano") await expect(ficha).toContainText("Só o ano está documentado");
      // As fontes são as do registro, uma a uma e na ordem: qual documento sustenta o quê.
      const links = await ficha.locator("ol > li a").evaluateAll((nos) => nos.map((no) => no.getAttribute("href")));
      expect(links).toEqual(urlsDasFontes(t.exigido1));
      await expect(ficha.locator(`[data-ficha="${esperado.slug}"]`)).toHaveAttribute("href", `/acontecimentos/${esperado.slug}/?origem=jogo&personagem=${slug}`);
      // O retorno é dito na hora: este era o registro pedido. A saída, porém, espera os outros registros.
      await expect(ficha.locator("[data-tarefa-concluida]")).toHaveText("Tarefa concluída: este era o registro pedido.");
      const situacao = ficha.locator("[data-saida-situacao]");
      await expect(situacao).toHaveAttribute("data-saida-situacao", "fechada");
      await expect(situacao).toHaveText(`Registros recolhidos: 1 de ${total}. ${outros.length === 1 ? "Falta 1 registro" : `Faltam ${outros.length} registros`} para a saída abrir.`);
      // A situação da revisão aparece como em qualquer leitura do registro no atlas.
      await expect(ficha.locator("[data-revisao]")).toContainText("com assistência de IA");
      await expect(ficha.locator("[data-revisao]")).toContainText("Revisão humana pendente");
      await page.getByRole("button", { name: "Guardar e continuar" }).click();
      await expect(ficha).toHaveCount(0);
      await expect(palco(page)).toBeFocused();

      // A tarefa consta como concluída, mas a saída continua fechada: faltam os registros que a tarefa não pede.
      await expect(jogo(page)).toHaveAttribute("data-tarefa", "concluida");
      await expect(jogo(page)).toHaveAttribute("data-saida", "fechada");
      await expect(jogo(page)).toHaveAttribute("data-registros", `1/${total}`);
      await expect(page.locator("[data-objetivo]")).toHaveText(`Tarefa concluída. ${outros.length === 1 ? "Falta 1 registro" : `Faltam ${outros.length} registros`} para a saída abrir.`);
      await expect(contagem).toHaveText(`Registros: 1 de ${total} · a saída abre com todos`);
      const comATarefa = await frame(page);
      expect(comATarefa.assinatura, "a pasta saiu da cena").not.toBe(aoAlcance.assinatura);
      // Com a tarefa cumprida, o palco continua desenhando a porta fechada, e ela segura o personagem do mesmo jeito.
      await expect(palco(page)).toHaveAttribute("data-porta", "fechada");
      await barradoNaSaida();
      await expect(fechada.locator("[data-falta-registros]")).toHaveAttribute("data-falta-registros", String(outros.length));
      await expect(fechada.locator("[data-falta-tarefa]")).toHaveAttribute("data-falta-tarefa", "nao");
      await page.getByRole("button", { name: "Entendi" }).click();
      // O guia diz o mesmo.
      await page.getByRole("button", { name: "Como jogar" }).click();
      await expect(dialogo(page, "guia")).toContainText("A tarefa está cumprida.");
      await expect(dialogo(page, "guia").locator("[data-regra-da-saida]")).toContainText(`Registros recolhidos: 1 de ${total}.`);
      await page.keyboard.press("Escape");

      // Os outros registros, um a um, pelo cenário. A saída só abre no último.
      for (const [indice, id] of outros.entries()) {
        const ultimoRegistro = indice === outros.length - 1;
        await walkTo(page, t.cena1, posicaoDe(t.c1, id));
        await expect(page.locator("[data-alcance]")).toHaveAttribute("data-alcance-id", id);
        await page.keyboard.press("e");
        await expect(ficha).toContainText(registro(id).titulo);
        // Não era o registro pedido: a tarefa não é anunciada de novo.
        await expect(ficha.locator("[data-tarefa-concluida]")).toHaveCount(0);
        await expect(situacao).toHaveAttribute("data-saida-situacao", ultimoRegistro ? "aberta" : "fechada");
        await expect(situacao).toHaveAttribute("data-registros", `${indice + 2}/${total}`);
        if (ultimoRegistro) await expect(situacao).toHaveText(`Registros recolhidos: ${total} de ${total}. A saída do capítulo está aberta.`);
        await page.getByRole("button", { name: "Guardar e continuar" }).click();
        await expect(ficha).toHaveCount(0);
        await expect(jogo(page)).toHaveAttribute("data-saida", ultimoRegistro ? "aberta" : "fechada");
        // A porta desenhada acompanha: fechada até o último registro, aberta com ele.
        await expect(palco(page)).toHaveAttribute("data-porta", ultimoRegistro ? "aberta" : "fechada");
      }

      // Retorno claro: com o último registro, a saída abre e o objetivo muda.
      await expect(jogo(page)).toHaveAttribute("data-tarefa", "concluida");
      await expect(jogo(page)).toHaveAttribute("data-registros", `${total}/${total}`);
      await expect(page.locator("[data-objetivo]")).toContainText("Tarefa concluída e registros recolhidos. A saída abriu");
      await expect(contagem).toHaveText(`Registros: ${total} de ${total} · saída aberta`);
      const depoisDeRecolher = await frame(page);
      expect(depoisDeRecolher.cores, "cores no canvas, depois de recolher").toBeGreaterThan(60);
      // O quadro inteiro mudou (o personagem andou e as pastas saíram): a porta em si é conferida acima, por `data-porta`.
      expect(depoisDeRecolher.assinatura, "a cena é outra depois de todos os registros").not.toBe(comATarefa.assinatura);
      // Há capítulo seguinte: o guia fala dele.
      await page.getByRole("button", { name: "Como jogar" }).click();
      await expect(dialogo(page, "guia")).toContainText("seguir ao próximo capítulo");
      await page.keyboard.press("Escape");

      // Ao lado da saída aberta, a dica oferece atravessar, e a tecla atravessa.
      await walkTo(page, t.cena1, antesDaSaida, true);
      await expect(page.locator("[data-alcance]")).toHaveAttribute("data-alcance", "saida");
      await expect(page.locator("[data-alcance]")).toContainText("Atravessar a saída");
      await page.keyboard.press("e");
      const transicao = page.locator("[data-transicao]");
      await expect(transicao).toBeVisible();
      await expect(page.locator("[data-alcance]")).toHaveText("");
      await expect(transicao).toContainText(`Capítulo ${t.c1.numero} concluído`);
      await expect(transicao).toContainText(t.c2.titulo);
      await expect(transicao).toContainText(`${t.c2.periodo.de}–${t.c2.periodo.ate}`);
      await expect(transicao).toContainText(`cenário: ${t.cena2.nome}`);
      await expect(transicao.getByRole("button", { name: "Continuar" })).toBeFocused();
      await page.getByRole("button", { name: "Continuar" }).click();
      await expect(jogo(page)).toHaveAttribute("data-capitulo", t.c2.id);
      await expect(jogo(page)).toHaveAttribute("data-cena", t.cena2.id);
      await expect(jogo(page)).toHaveAttribute("data-tarefa", "pendente");
      await expect(page.locator("[data-objetivo]")).toHaveText(t.c2.objetivo);
      await expect.poll(() => position(page)).toEqual(inicioDe(t.c2));
      // Outro cenário, desenhado.
      const segundo = await frame(page);
      expect(segundo.cores, "cores no canvas, no capítulo 2").toBeGreaterThan(60);
      expect(segundo.assinatura).not.toBe(depoisDeRecolher.assinatura);

      // Recarregar devolve o mesmo capítulo, no início da cena.
      await page.reload();
      await waitForStage(page);
      await expect(jogo(page)).toHaveAttribute("data-capitulo", t.c2.id);
      await expect.poll(() => position(page)).toEqual(inicioDe(t.c2));
    });

    test("tarefa de ordem: errar explica e deixa tentar de novo; com todos os registros, acertar abre a saída e leva ao fim da etapa", async ({ page }) => {
      test.slow();
      expect(t.c2.tarefa.tipo).toBe("ordem");
      await abrirLimpo(page, t.rota);
      await concluirCapitulo1PeloPainel(page, t);
      const [antes, depois] = emOrdem(t.c2);
      const total = t.c2.eventIds.length;
      const terceiros = foraDaTarefa(t.c2);
      expect(terceiros.length, "registros que a tarefa de ordem não pede").toBeGreaterThan(0);
      const contagem = page.locator("[data-objetivo-caixa] [data-registros]");

      // Os dois registros da tarefa, pelo cenário.
      for (const id of [depois, antes]) {
        await walkTo(page, t.cena2, posicaoDe(t.c2, id));
        await expect(page.locator("[data-alcance]")).toHaveAttribute("data-alcance-id", id);
        await page.keyboard.press("e");
        await expect(dialogo(page, "registro")).toBeVisible();
        await page.getByRole("button", { name: /Guardar e/ }).click();
      }
      // Com os dois recolhidos, a ordem é pedida.
      const ordem = dialogo(page, "ordem");
      await expect(ordem).toBeVisible();
      await expect(jogo(page)).toHaveAttribute("data-tarefa", "pendente");
      await expect(ordem.locator("[data-ordem-item]")).toHaveCount(2);
      const focoNaJanela = () => page.evaluate(() => document.activeElement?.closest('[data-dialogo="ordem"]') !== null);

      // A ordem errada, pelo teclado: explicação com os dois registros e as datas, sem punição, nova tentativa.
      await ordem.locator(`[data-escolher-primeiro="${depois}"]`).click();
      await expect(ordem.locator(`[data-ordem-item="${depois}"] [data-ordem-posicao="1"]`)).toBeVisible();
      await ordem.locator("[data-confirmar-ordem]").focus();
      await page.keyboard.press("Enter");
      const resultado = ordem.locator("[data-ordem-resultado]");
      await expect(resultado).toHaveAttribute("data-ordem-resultado", "errado");
      await expect(resultado).toContainText(`${registro(antes).titulo} (${formatDate(registro(antes).data)})`);
      await expect(resultado).toContainText(`${registro(depois).titulo} (${formatDate(registro(depois).data)})`);
      await expect(resultado).toContainText("não há penalidade");
      await expect(jogo(page)).toHaveAttribute("data-saida", "fechada");
      // O botão que tinha o foco saiu do rodapé: o foco vai para o que entrou no lugar.
      await expect(ordem.locator("[data-tentar-de-novo]")).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(ordem.locator("[data-ordem-resultado]")).toHaveCount(0);
      expect(await focoNaJanela(), "foco dentro da janela depois de tentar de novo").toBe(true);
      // A tentativa errada ficou contada, e só isso: nada foi perdido.
      await expect(ordem).toContainText("Tentativas até agora: 1.");

      // Dá para fechar a pergunta e responder depois. A cena diz onde: no guia ou no painel.
      await page.keyboard.press("Escape");
      await expect(ordem).toHaveCount(0);
      const ondeOrdenar = "Os dois registros da tarefa estão com você. Para colocá-los em ordem, abra Como jogar ou Capítulos e tarefas.";
      await expect(page.locator("[data-objetivo]")).toHaveText(ondeOrdenar);
      // Recolher todos não basta neste capítulo: a contagem diz as duas coisas.
      await expect(contagem).toHaveText(`Registros: ${total - terceiros.length} de ${total} · a saída abre com todos e a ordem certa`);

      // Antes de responder, os registros que a tarefa não pede.
      for (const [indice, id] of terceiros.entries()) {
        await walkTo(page, t.cena2, posicaoDe(t.c2, id));
        await expect(page.locator("[data-alcance]")).toHaveAttribute("data-alcance-id", id);
        await page.keyboard.press("e");
        const ficha = dialogo(page, "registro");
        await expect(ficha).toContainText(registro(id).titulo);
        // A ficha diz que a ordem está pronta para responder e, no último registro, que só falta a tarefa.
        await expect(ficha.locator("[data-ordem-pronta]")).toBeVisible();
        if (indice === terceiros.length - 1) {
          await expect(ficha.locator("[data-saida-situacao]")).toHaveAttribute("data-saida-situacao", "fechada");
          await expect(ficha.locator("[data-saida-situacao]")).toHaveText(`Registros recolhidos: ${total} de ${total}. Falta a tarefa para a saída abrir.`);
        }
        // Com a ordem por responder, guardar o registro leva de volta à pergunta.
        await page.getByRole("button", { name: "Guardar e ordenar os registros" }).click();
        await expect(ordem).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(ordem).toHaveCount(0);
      }
      // Todos os registros recolhidos, e a saída continua fechada: falta a tarefa.
      await expect(jogo(page)).toHaveAttribute("data-registros", `${total}/${total}`);
      await expect(jogo(page)).toHaveAttribute("data-tarefa", "pendente");
      await expect(jogo(page)).toHaveAttribute("data-saida", "fechada");
      await expect(palco(page)).toHaveAttribute("data-porta", "fechada");
      await expect(page.locator("[data-objetivo]")).toHaveText(ondeOrdenar);
      await expect(contagem).toHaveText(`Registros: ${total} de ${total} · falta a tarefa`);
      // O painel não oferece a saída e oferece a pergunta.
      await page.getByRole("button", { name: "Capítulos e tarefas" }).click();
      const painelDaOrdem = dialogo(page, "painel");
      await expect(painelDaOrdem.locator("[data-tarefa-situacao]")).toHaveAttribute("data-tarefa-situacao", "pendente");
      await expect(painelDaOrdem.locator("[data-tarefa-situacao]")).toHaveAttribute("data-saida-situacao", "fechada");
      await expect(painelDaOrdem.locator("[data-atravessar-saida]")).toHaveCount(0);
      await expect(painelDaOrdem.locator("[data-responder-ordem]")).toBeVisible();
      await page.keyboard.press("Escape");
      // A porta segura o personagem, diz que não falta registro e leva à pergunta.
      const antesDaSaida2 = t.cena2.saida.lado === "sul" ? { x: t.cena2.saida.x, y: t.cena2.saida.y - 1 } : { x: t.cena2.saida.x - 1, y: t.cena2.saida.y };
      await walkTo(page, t.cena2, antesDaSaida2);
      await holdKeys(page, t.cena2.saida.lado === "sul" ? ["ArrowDown", "ArrowLeft"] : ["ArrowRight", "ArrowDown"], 600);
      const barrado = await position(page);
      expect({ x: Math.floor(barrado.x), y: Math.floor(barrado.y) }, "a porta fechada segura o personagem").toEqual(antesDaSaida2);
      await expect(page.locator("[data-alcance]")).toContainText("Saída fechada");
      await page.keyboard.press("e");
      const fechada = dialogo(page, "saida-fechada");
      await expect(fechada.locator("[data-falta-registros]")).toHaveAttribute("data-falta-registros", "0");
      await expect(fechada.locator("[data-falta-registros]")).toContainText("Não falta nenhum.");
      await expect(fechada.locator("[data-falta-tarefa]")).toHaveAttribute("data-falta-tarefa", "sim");
      await expect(fechada.locator("[data-falta-tarefa]")).toHaveText("Tarefa pendente: os dois registros pedidos já estão com você. Falta colocá-los em ordem.");
      await fechada.getByRole("button", { name: "Ordenar os registros" }).click();
      await expect(ordem).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(ordem).toHaveCount(0);
      // A pergunta volta também pelo guia, que diz o que falta.
      await page.getByRole("button", { name: "Como jogar" }).click();
      await expect(dialogo(page, "guia")).toContainText("Falta colocá-los em ordem cronológica.");
      await expect(dialogo(page, "guia").locator("[data-regra-da-saida]")).toContainText(`Registros recolhidos: ${total} de ${total}.`);
      await dialogo(page, "guia").getByRole("button", { name: "Ordenar os registros" }).click();
      await expect(ordem).toBeVisible();

      // A ordem certa conclui, e Esc continua valendo na janela.
      await ordem.locator(`[data-escolher-primeiro="${antes}"]`).click();
      await ordem.locator("[data-confirmar-ordem]").focus();
      await page.keyboard.press("Enter");
      await expect(resultado).toHaveAttribute("data-ordem-resultado", "certo");
      await expect(ordem).toContainText("Tarefa concluída. A saída do capítulo está aberta.");
      await expect(ordem.locator("[data-ordem-concluida]")).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(ordem).toHaveCount(0);
      await expect(palco(page)).toBeFocused();
      await expect(jogo(page)).toHaveAttribute("data-tarefa", "concluida");
      await expect(jogo(page)).toHaveAttribute("data-saida", "aberta");
      await expect(palco(page)).toHaveAttribute("data-porta", "aberta");
      // É o último capítulo: o objetivo e o guia falam em encerrar, e não em um capítulo que não existe.
      await expect(page.locator("[data-objetivo]")).toContainText("encerrar esta etapa");
      await page.getByRole("button", { name: "Como jogar" }).click();
      await expect(dialogo(page, "guia")).toContainText("encerrar esta etapa");
      await expect(dialogo(page, "guia")).not.toContainText("próximo");
      await page.keyboard.press("Escape");

      // O painel registra o estado.
      await page.getByRole("button", { name: "Capítulos e tarefas" }).click();
      await expect(page.locator("[data-tarefa-situacao]")).toHaveAttribute("data-tarefa-situacao", "concluida");
      await expect(page.locator("[data-tarefa-situacao]")).toHaveAttribute("data-saida-situacao", "aberta");
      for (const id of t.c2.eventIds) await expect(page.locator(`[data-registro="${id}"]`)).toHaveAttribute("data-recolhido", "sim");
      await expect(page.locator("[data-atravessar-saida]")).toBeVisible();
      await page.keyboard.press("Escape");

      // O último capítulo desta etapa leva ao fim, sem inventar o que não existe.
      await walkTo(page, t.cena2, { x: t.cena2.saida.x, y: t.cena2.saida.y }, true);
      await expect(page.locator("[data-transicao]")).toContainText("último capítulo desta etapa");
      await page.getByRole("button", { name: "Continuar" }).click();
      const fim = page.locator('[data-fim="sim"]');
      await expect(fim).toBeVisible();
      await expect(fim).toContainText(`${t.capitulos.length} capítulos`);
      await expect(fim.getByRole("link", { name: /Trajetória completa/ })).toHaveAttribute("href", `/politicos/${slug}/`);
      await expect(fim.getByRole("button", { name: "Rever os capítulos" })).toBeFocused();

      // Pedir o reinício e desistir volta à tela de fim, e não à cena.
      await fim.getByRole("button", { name: "Reiniciar a trajetória" }).click();
      await expect(dialogo(page, "reiniciar")).toBeVisible();
      await page.getByRole("button", { name: "Cancelar" }).click();
      await expect(fim).toBeVisible();

      // De volta à cena pelo painel, o personagem está no início, e a saída aberta funciona de novo.
      await fim.getByRole("button", { name: "Rever os capítulos" }).click();
      await expect(dialogo(page, "painel")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(jogo(page)).toHaveAttribute("data-modo", "jogando");
      await expect.poll(() => position(page)).toEqual(inicioDe(t.c2));
      await walkTo(page, t.cena2, { x: t.cena2.saida.x, y: t.cena2.saida.y }, true);
      await expect(page.locator("[data-transicao]")).toBeVisible();
    });
  });
}

test.describe("avisos do registro", () => {
  test("o registro cuja data não decide a ordem leva o aviso do atlas, no painel e na ficha", async ({ page }) => {
    // A mesma regra da lista do atlas, sobre os registros do capítulo.
    const emAberto = [...findUndeterminedOrder(LULA.c1.eventIds.map((id) => registro(id)))];
    expect(emAberto.length, "registros do capítulo 1 de Lula com a ordem em aberto").toBeGreaterThan(0);
    const id = emAberto[0]!;
    const aviso = `ordem dentro de ${yearOf(registro(id).data)} não documentada`;

    await abrirLimpo(page, LULA.rota);
    await page.getByRole("button", { name: "Capítulos e tarefas" }).click();
    const painel = dialogo(page, "painel");
    await expect(painel.locator("[data-ordem-em-aberto]")).toHaveCount(emAberto.length);
    await expect(painel.locator(`[data-registro="${id}"] [data-ordem-em-aberto]`)).toHaveText(aviso);
    // O motivo do capítulo explica por que os dois registros ficam juntos.
    await expect(painel).toContainText("o atlas não registra se ela veio antes ou depois");

    await painel.locator(`[data-recolher="${id}"]`).click();
    const ficha = dialogo(page, "registro");
    await expect(ficha.locator("[data-ordem-em-aberto]")).toHaveText(aviso);
    await expect(ficha).toContainText("Só o ano está documentado");
    // Um registro com a data completa não leva o aviso.
    await page.getByRole("button", { name: /Guardar e/ }).click();
    const comDia = LULA.c1.eventIds.find((item) => registro(item).data.precisao === "dia" && !emAberto.includes(item))!;
    await page.getByRole("button", { name: "Capítulos e tarefas" }).click();
    await painel.locator(`[data-recolher="${comDia}"]`).click();
    await expect(ficha).toContainText(registro(comDia).titulo);
    await expect(ficha.locator("[data-ordem-em-aberto]")).toHaveCount(0);
  });
});

test.describe("painel, progresso e armazenamento", () => {
  test("o painel cumpre a tarefa sem o cenário, com foco visível e áreas de toque", async ({ page }) => {
    await abrirLimpo(page, LULA.rota);
    await page.getByRole("button", { name: "Capítulos e tarefas" }).click();
    const painel = dialogo(page, "painel");
    // O foco entra na janela, no botão que a fecha.
    await expect(painel.getByRole("button", { name: "Voltar ao jogo" })).toBeFocused();
    await expect(painel).toContainText(LULA.c1.motivo);
    await expect(painel.locator("[data-capitulo-item]")).toHaveCount(LULA.capitulos.length);
    await expect(painel.locator(`[data-capitulo-item="${LULA.c1.id}"]`)).toHaveAttribute("data-status", "disponivel");
    await expect(painel.locator(`[data-capitulo-item="${LULA.c2.id}"]`)).toHaveAttribute("data-status", "bloqueado");
    await expect(painel.locator("[data-registro]")).toHaveCount(LULA.c1.eventIds.length);
    for (const botao of await painel.getByRole("button").all()) {
      expect((await botao.boundingBox())!.height, await botao.innerText()).toBeGreaterThanOrEqual(44);
    }

    // Tab percorre só o painel enquanto ele está aberto.
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => document.activeElement?.closest('[data-dialogo="painel"]') !== null)).toBe(true);
    // Esc fecha o painel e devolve o foco à cena.
    await page.keyboard.press("Escape");
    await expect(painel).toHaveCount(0);
    await expect(palco(page)).toBeFocused();

    // Pelo painel vale a mesma regra: com a tarefa cumprida e registros por recolher, a saída não é oferecida.
    const total = LULA.c1.eventIds.length;
    await cumprirATarefaPeloPainel(page, LULA.c1);
    await expect(jogo(page)).toHaveAttribute("data-saida", "fechada");
    await page.getByRole("button", { name: "Capítulos e tarefas" }).click();
    const situacao = painel.locator("[data-tarefa-situacao]");
    await expect(situacao).toHaveAttribute("data-tarefa-situacao", "concluida");
    await expect(situacao).toHaveAttribute("data-saida-situacao", "fechada");
    await expect(situacao).toHaveText(`Tarefa concluída. Faltam ${total - 1} registros para a saída abrir.`);
    await expect(painel.locator("[data-regra-da-saida]")).toHaveText(
      `Registros recolhidos: 1 de ${total}. A saída abre com todos os registros do capítulo recolhidos e a tarefa cumprida.`,
    );
    await expect(painel.locator("[data-atravessar-saida]")).toHaveCount(0);
    // O registro recolhido pode ser lido de novo, sem mudar o progresso, e a volta é para o painel.
    expect((await painel.locator(`[data-ler="${LULA.exigido1}"]`).boundingBox())!.height, "Ler de novo").toBeGreaterThanOrEqual(44);
    await painel.locator(`[data-ler="${LULA.exigido1}"]`).click();
    const releitura = dialogo(page, "registro");
    await expect(releitura).toContainText("Registro já recolhido");
    await expect(releitura).toContainText(registro(LULA.exigido1).titulo);
    await expect(releitura.locator("[data-tarefa-concluida]")).toHaveCount(0);
    await expect(releitura.locator("[data-saida-situacao]")).toHaveCount(0);
    await expect(releitura.getByRole("button", { name: "Voltar ao painel" })).toBeFocused();
    await releitura.getByRole("button", { name: "Voltar ao painel" }).click();
    await expect(painel).toBeVisible();
    // O foco volta ao botão do registro lido, que diz no nome qual registro é.
    await expect(painel.locator(`[data-ler="${LULA.exigido1}"]`)).toBeFocused();
    await expect(painel.getByRole("button", { name: `Ler de novo: ${registro(LULA.exigido1).titulo}` })).toBeFocused();
    await expect(jogo(page)).toHaveAttribute("data-registros", `1/${total}`);
    await page.keyboard.press("Escape");
    // Aberto de novo pelo botão da cena, o painel começa com o foco no rodapé, como sempre.
    await page.getByRole("button", { name: "Capítulos e tarefas" }).click();
    await expect(painel.getByRole("button", { name: "Voltar ao jogo" })).toBeFocused();
    await page.keyboard.press("Escape");

    await concluirCapitulo1PeloPainel(page, LULA);
    await page.getByRole("button", { name: "Capítulos e tarefas" }).click();
    await expect(painel.locator(`[data-capitulo-item="${LULA.c1.id}"]`)).toHaveAttribute("data-status", "concluido");
    await expect(painel.locator(`[data-capitulo-item="${LULA.c2.id}"]`)).toHaveAttribute("data-status", "disponivel");
    // Rever um capítulo concluído não muda o progresso.
    await painel.locator(`[data-abrir-capitulo="${LULA.c1.id}"]`).click();
    await expect(jogo(page)).toHaveAttribute("data-capitulo", LULA.c1.id);
    await expect(jogo(page)).toHaveAttribute("data-saida", "aberta");
    await page.reload();
    await waitForStage(page);
    await expect(jogo(page)).toHaveAttribute("data-capitulo", LULA.c2.id);
  });

  test("cada personagem tem o próprio progresso; reiniciar pede confirmação e vale só para ele", async ({ page }) => {
    // Três capítulos inteiros pelo painel: leva mais que o tempo padrão no servidor de desenvolvimento.
    test.slow();
    // Os dois com progresso guardado ao mesmo tempo.
    await abrirLimpo(page, LULA.rota);
    await concluirCapitulo1PeloPainel(page, LULA);
    await page.goto(FLAVIO.rota);
    await waitForStage(page);
    await expect(jogo(page)).toHaveAttribute("data-capitulo", FLAVIO.c1.id);
    await expect(jogo(page)).toHaveAttribute("data-tarefa", "pendente");
    await concluirCapitulo1PeloPainel(page, FLAVIO);

    await page.goto(LULA.rota);
    await waitForStage(page);
    await expect(jogo(page)).toHaveAttribute("data-capitulo", LULA.c2.id);
    await page.getByRole("button", { name: "Capítulos e tarefas" }).click();
    await page.locator("[data-reiniciar]").click();
    await expect(dialogo(page, "reiniciar")).toBeVisible();
    await page.getByRole("button", { name: "Cancelar" }).click();
    await expect(jogo(page)).toHaveAttribute("data-capitulo", LULA.c2.id);
    await page.getByRole("button", { name: "Capítulos e tarefas" }).click();
    await page.locator("[data-reiniciar]").click();
    await page.locator("[data-confirmar-reinicio]").click();
    await expect(jogo(page)).toHaveAttribute("data-capitulo", LULA.c1.id);
    await expect(jogo(page)).toHaveAttribute("data-tarefa", "pendente");
    await page.reload();
    await waitForStage(page);
    await expect(jogo(page)).toHaveAttribute("data-capitulo", LULA.c1.id);

    // Reiniciar sem trocar de capítulo: o personagem volta ao início e a saída fecha.
    const inicio = inicioDe(LULA.c1);
    await holdKeys(page, ["ArrowRight", "ArrowDown"], 400);
    expect((await position(page)).x).toBeGreaterThan(inicio.x + 0.5);
    await abrirASaidaPeloPainel(page, LULA.c1);
    await expect(jogo(page)).toHaveAttribute("data-saida", "aberta");
    await page.getByRole("button", { name: "Capítulos e tarefas" }).click();
    await page.locator("[data-reiniciar]").click();
    await page.locator("[data-confirmar-reinicio]").click();
    await expect(jogo(page)).toHaveAttribute("data-saida", "fechada");
    await expect(jogo(page)).toHaveAttribute("data-registros", `0/${LULA.c1.eventIds.length}`);
    await expect(palco(page)).toBeFocused();
    await expect.poll(() => position(page)).toEqual(inicio);

    // O outro personagem continua onde estava, também depois de recarregar.
    await page.goto(FLAVIO.rota);
    await waitForStage(page);
    await expect(jogo(page)).toHaveAttribute("data-capitulo", FLAVIO.c2.id);
    await page.goto("/jogo/");
    await expect(page.locator('[data-escolha="flavio-bolsonaro"]')).toHaveAttribute("data-situacao", "em-andamento");
    await expect(page.locator('[data-escolha="lula"]')).toHaveAttribute("data-situacao", "inicio");
  });

  test("sem armazenamento, o jogo continua e avisa que o progresso vale só enquanto a página estiver aberta", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, "localStorage", {
        get() {
          throw new Error("Armazenamento bloqueado");
        },
      });
    });
    await page.goto(LULA.rota);
    await waitForStage(page);
    await page.getByRole("button", { name: "Capítulos e tarefas" }).click();
    await expect(page.locator("[data-progresso-duravel]")).toHaveAttribute("data-progresso-duravel", "nao");
    await expect(page.locator("[data-progresso-duravel]")).toContainText("indisponível");
    await expect(page.locator("[data-progresso-duravel]")).toContainText("enquanto esta página estiver aberta");
    await page.locator(`[data-recolher="${LULA.exigido1}"]`).click();
    await expect(dialogo(page, "registro")).toBeVisible();
    await page.getByRole("button", { name: "Guardar e continuar" }).click();
    await expect(jogo(page)).toHaveAttribute("data-tarefa", "concluida");

    // Ir à ficha de um registro e voltar, pela navegação do site, não perde o progresso da visita.
    const outro = LULA.c1.eventIds.find((id) => id !== LULA.exigido1)!;
    await page.getByRole("button", { name: "Capítulos e tarefas" }).click();
    await page.locator(`[data-recolher="${outro}"]`).click();
    await dialogo(page, "registro").locator(`[data-ficha="${registro(outro).slug}"]`).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(registro(outro).titulo);
    await page.locator('[data-retorno="jogo"]').click();
    await expect(page).toHaveURL(/\/jogo\/lula\/$/);
    await waitForStage(page);
    await expect(jogo(page)).toHaveAttribute("data-tarefa", "concluida");
    await page.getByRole("button", { name: "Capítulos e tarefas" }).click();
    await expect(page.locator(`[data-registro="${outro}"]`)).toHaveAttribute("data-recolhido", "sim");
    // A entrada do jogo, na mesma visita, também sabe onde a pessoa está.
    await page.locator('[data-dialogo="painel"]').getByRole("link", { name: "Escolher outro personagem" }).click();
    await expect(page.locator('[data-escolha="lula"]')).toHaveAttribute("data-situacao", "em-andamento");
    await expect(page.locator('[data-escolha="lula"] [data-jogar="lula"]')).toContainText("Continuar");
    await expect(page.locator('[data-escolha="flavio-bolsonaro"]')).toHaveAttribute("data-situacao", "inicio");
  });

  test("da ficha de um registro, a página do acontecimento oferece a volta ao capítulo, com o progresso intacto", async ({ page }) => {
    await abrirLimpo(page, LULA.rota);
    await page.getByRole("button", { name: "Capítulos e tarefas" }).click();
    await page.locator(`[data-recolher="${LULA.exigido1}"]`).click();
    const esperado = registro(LULA.exigido1);
    await dialogo(page, "registro").locator(`[data-ficha="${esperado.slug}"]`).click();
    await expect(page).toHaveURL(/\/acontecimentos\/.+\?origem=jogo&personagem=lula$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(esperado.titulo);
    const volta = page.locator('[data-retorno="jogo"]');
    await expect(volta).toContainText("Voltar ao jogo");
    await expect(volta).toContainText("trajetória de Lula");
    await volta.click();
    await expect(page).toHaveURL(/\/jogo\/lula\/$/);
    await waitForStage(page);
    await expect(jogo(page)).toHaveAttribute("data-capitulo", LULA.c1.id);
    await expect(jogo(page)).toHaveAttribute("data-tarefa", "concluida");

    // Um link direto para o jogo de outro personagem não mexe em nada.
    await page.goto(FLAVIO.rota);
    await waitForStage(page);
    await expect(jogo(page)).toHaveAttribute("data-tarefa", "pendente");
    await page.goto(LULA.rota);
    await waitForStage(page);
    await expect(jogo(page)).toHaveAttribute("data-tarefa", "concluida");

    // Quem estava revendo um capítulo concluído volta da ficha ao capítulo que revia, e não ao corrente.
    await abrirASaidaPeloPainel(page, LULA.c1);
    await atravessarPeloPainel(page);
    await expect(jogo(page)).toHaveAttribute("data-capitulo", LULA.c2.id);
    await page.getByRole("button", { name: "Capítulos e tarefas" }).click();
    await page.locator(`[data-abrir-capitulo="${LULA.c1.id}"]`).click();
    await expect(jogo(page)).toHaveAttribute("data-capitulo", LULA.c1.id);
    // No capítulo concluído tudo já foi recolhido: a ficha se abre relendo um registro pelo painel.
    const outro = LULA.c1.eventIds.find((id) => id !== LULA.exigido1)!;
    await page.getByRole("button", { name: "Capítulos e tarefas" }).click();
    await expect(page.locator("[data-recolher]")).toHaveCount(0);
    await page.locator(`[data-ler="${outro}"]`).click();
    await dialogo(page, "registro").locator(`[data-ficha="${registro(outro).slug}"]`).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(registro(outro).titulo);
    await page.locator('[data-retorno="jogo"]').click();
    await waitForStage(page);
    await expect(jogo(page)).toHaveAttribute("data-capitulo", LULA.c1.id);
    // A lembrança vale para essa volta: recarregar abre o capítulo corrente, e o progresso não mudou.
    await page.reload();
    await waitForStage(page);
    await expect(jogo(page)).toHaveAttribute("data-capitulo", LULA.c2.id);
  });
});

test.describe("regra da saída", () => {
  test("no capítulo de ordem, a ordem certa não abre a saída enquanto falta um registro", async ({ page }) => {
    // Um capítulo inteiro pelo painel antes de começar: no servidor de desenvolvimento passa de metade do tempo padrão.
    test.slow();
    await abrirLimpo(page, LULA.rota);
    await concluirCapitulo1PeloPainel(page, LULA);
    const total = LULA.c2.eventIds.length;
    const terceiros = foraDaTarefa(LULA.c2);
    expect(terceiros.length, "registros que a tarefa de ordem não pede").toBeGreaterThan(0);

    // Os dois registros da tarefa, pelo painel, e a ordem certa.
    const [primeiro, segundo] = pedidosPor(LULA.c2) as [string, string];
    expect(await recolherPeloPainel(page, primeiro)).toBe("jogando");
    expect(await recolherPeloPainel(page, segundo)).toBe("ordem");
    const ordem = dialogo(page, "ordem");
    await ordem.locator(`[data-escolher-primeiro="${emOrdem(LULA.c2)[0]}"]`).click();
    await ordem.locator("[data-confirmar-ordem]").click();
    await expect(ordem.locator("[data-ordem-resultado]")).toHaveAttribute("data-ordem-resultado", "certo");
    // A tarefa está cumprida, e a janela diz o que ainda segura a porta.
    const faltam = terceiros.length === 1 ? "Falta 1 registro" : `Faltam ${terceiros.length} registros`;
    await expect(ordem.locator("[data-saida-situacao]")).toHaveAttribute("data-saida-situacao", "fechada");
    await expect(ordem.locator("[data-saida-situacao]")).toHaveText(`Tarefa concluída. ${faltam} para a saída abrir.`);
    await ordem.locator("[data-ordem-concluida]").click();
    await expect(jogo(page)).toHaveAttribute("data-tarefa", "concluida");
    await expect(jogo(page)).toHaveAttribute("data-saida", "fechada");
    await expect(page.locator("[data-objetivo]")).toHaveText(`Tarefa concluída. ${faltam} para a saída abrir.`);

    // O painel não oferece a saída, e a porta segura o personagem.
    await page.getByRole("button", { name: "Capítulos e tarefas" }).click();
    await expect(page.locator("[data-atravessar-saida]")).toHaveCount(0);
    await page.keyboard.press("Escape");
    const antesDaSaida = LULA.cena2.saida.lado === "sul" ? { x: LULA.cena2.saida.x, y: LULA.cena2.saida.y - 1 } : { x: LULA.cena2.saida.x - 1, y: LULA.cena2.saida.y };
    await walkTo(page, LULA.cena2, antesDaSaida);
    await holdKeys(page, LULA.cena2.saida.lado === "sul" ? ["ArrowDown", "ArrowLeft"] : ["ArrowRight", "ArrowDown"], 600);
    const barrado = await position(page);
    expect({ x: Math.floor(barrado.x), y: Math.floor(barrado.y) }, "a porta fechada segura o personagem").toEqual(antesDaSaida);
    await expect(palco(page)).toHaveAttribute("data-porta", "fechada");
    await expect(page.locator("[data-alcance]")).toContainText("Saída fechada");

    // Com o último registro, abre.
    for (const id of terceiros) expect(await recolherPeloPainel(page, id)).toBe("jogando");
    await expect(jogo(page)).toHaveAttribute("data-registros", `${total}/${total}`);
    await expect(jogo(page)).toHaveAttribute("data-saida", "aberta");
    await expect(palco(page)).toHaveAttribute("data-porta", "aberta");
    await page.getByRole("button", { name: "Capítulos e tarefas" }).click();
    await expect(page.locator("[data-atravessar-saida]")).toBeVisible();
  });

  test("um progresso guardado quando a saída abria só com a tarefa reabre o capítulo que ficou sem registros", async ({ page }) => {
    await page.goto(LULA.rota);
    await page.evaluate(
      ({ chave, salvo }) => window.localStorage.setItem(chave, JSON.stringify(salvo)),
      {
        chave: storageKey("lula"),
        salvo: {
          versao: PROGRESS_VERSION,
          personagem: "lula",
          capitulos: {
            [LULA.c1.id]: { status: "concluido", tarefa: { recolhidos: [LULA.exigido1], ordemConfirmada: false, tentativas: 0 } },
            [LULA.c2.id]: { status: "disponivel", tarefa: { recolhidos: [LULA.c2.eventIds[0]!], ordemConfirmada: false, tentativas: 0 } },
          },
        },
      },
    );
    await page.reload();
    await waitForStage(page);
    // O capítulo 1 reabre com o que já tinha: a tarefa cumprida, um registro, a saída fechada.
    const total = LULA.c1.eventIds.length;
    await expect(jogo(page)).toHaveAttribute("data-capitulo", LULA.c1.id);
    await expect(jogo(page)).toHaveAttribute("data-tarefa", "concluida");
    await expect(jogo(page)).toHaveAttribute("data-registros", `1/${total}`);
    await expect(jogo(page)).toHaveAttribute("data-saida", "fechada");
    await page.getByRole("button", { name: "Capítulos e tarefas" }).click();
    const painel = dialogo(page, "painel");
    await expect(painel.locator(`[data-capitulo-item="${LULA.c1.id}"]`)).toHaveAttribute("data-status", "disponivel");
    await expect(painel.locator(`[data-capitulo-item="${LULA.c2.id}"]`)).toHaveAttribute("data-status", "bloqueado");
    await page.keyboard.press("Escape");
    // A entrada do jogo aponta o capítulo 1 de novo.
    await page.goto("/jogo/");
    await expect(page.locator('[data-escolha="lula"] [data-situacao-texto]')).toContainText(`capítulo 1: ${LULA.c1.titulo}`);

    // Recolhido o que faltava, a saída abre, e o capítulo 2 começa do início.
    await page.goto(LULA.rota);
    await waitForStage(page);
    await abrirASaidaPeloPainel(page, LULA.c1);
    await atravessarPeloPainel(page);
    await expect(jogo(page)).toHaveAttribute("data-capitulo", LULA.c2.id);
    await expect(jogo(page)).toHaveAttribute("data-registros", `0/${LULA.c2.eventIds.length}`);
  });
});

test.describe("celular", () => {
  test.use({ viewport: CELULAR, hasTouch: true, isMobile: true });

  test("os controles de toque movem o personagem e interagem, e o registro continua aberto depois do toque", async ({ page }) => {
    await abrirLimpo(page, FLAVIO.rota);
    const controles = page.locator("[data-toque]");
    await expect(controles).toBeVisible();
    // Cada direção e o botão de ação têm área de toque confortável.
    for (const alvo of [...(await controles.locator("[data-direcao]").all()), controles.locator("[data-acao-toque]")]) {
      const caixa = (await alvo.boundingBox())!;
      expect(Math.min(caixa.width, caixa.height), "área de toque").toBeGreaterThanOrEqual(44);
    }

    // O direcional é uma área só: a posição do dedo escolhe a direção.
    const direcional = controles.locator("[data-direcional]");
    const area = (await direcional.boundingBox())!;
    const toque = (fx: number, fy: number) => ({
      pointerId: 1,
      pointerType: "touch",
      isPrimary: true,
      bubbles: true,
      clientX: area.x + area.width * fx,
      clientY: area.y + area.height * fy,
    });
    const segurar = async (fx: number, fy: number, ms: number) => {
      await direcional.dispatchEvent("pointerdown", toque(fx, fy));
      await page.waitForTimeout(ms);
      await direcional.dispatchEvent("pointerup", toque(fx, fy));
    };

    // Para baixo e para a direita na tela: o corredor que corre no eixo x da cena.
    const inicio = await position(page);
    await segurar(0.85, 0.85, 350);
    const depois = await position(page);
    expect(depois.x).toBeGreaterThan(inicio.x + 0.3);
    expect(Math.abs(depois.y - inicio.y)).toBeLessThan(0.05);
    // Soltou, parou.
    await page.waitForTimeout(150);
    expect(await position(page)).toEqual(depois);
    // No centro do direcional nada se move.
    await segurar(0.5, 0.5, 250);
    expect(await position(page)).toEqual(depois);

    // O botão de ação recolhe o registro ao alcance, com um toque de verdade: o
    // clique que o navegador gera ao levantar o dedo não pode cair no botão que
    // aparece embaixo dele e fechar a janela.
    await walkTo(page, FLAVIO.cena1, posicaoDe(FLAVIO.c1, FLAVIO.exigido1));
    const acao = controles.locator("[data-acao-toque]");
    await expect(acao).toHaveAttribute("aria-label", "Recolher o registro");
    const ondeTocou = (await acao.boundingBox())!;
    await acao.tap();
    const ficha = dialogo(page, "registro");
    await expect(ficha).toBeVisible();
    await expect(ficha).toContainText(registro(FLAVIO.exigido1).titulo);
    // O botão que fecha a janela fica exatamente onde o dedo estava.
    const fechar = (await ficha.getByRole("button", { name: "Guardar e continuar" }).boundingBox())!;
    const cx = ondeTocou.x + ondeTocou.width / 2;
    const cy = ondeTocou.y + ondeTocou.height / 2;
    expect(cx > fechar.x && cx < fechar.x + fechar.width && cy > fechar.y && cy < fechar.y + fechar.height, "o toque caiu sobre o botão da janela").toBe(true);
    await page.waitForTimeout(500);
    await expect(ficha, "a janela do registro continua aberta depois do toque").toBeVisible();
    // Um toque novo, agora no botão da janela, fecha.
    await ficha.getByRole("button", { name: "Guardar e continuar" }).tap();
    await expect(ficha).toHaveCount(0);
    await expect(jogo(page)).toHaveAttribute("data-tarefa", "concluida");
  });

  test("no painel, a volta de uma releitura deixa à vista e em foco o registro lido", async ({ page }) => {
    await abrirLimpo(page, FLAVIO.rota);
    await abrirASaidaPeloPainel(page, FLAVIO.c1);
    // O último registro da lista fica abaixo da dobra do painel em celular.
    const ultimo = FLAVIO.c1.eventIds.at(-1)!;
    await page.getByRole("button", { name: "Capítulos e tarefas" }).click();
    const painel = dialogo(page, "painel");
    const botao = painel.locator(`[data-ler="${ultimo}"]`);
    await clicar(page, botao);
    const releitura = dialogo(page, "registro");
    await expect(releitura).toContainText(registro(ultimo).titulo);
    await clicar(page, releitura.getByRole("button", { name: "Voltar ao painel" }));
    await expect(botao).toBeFocused();
    // O botão está dentro da área visível do painel: a pessoa não volta ao topo da lista.
    const { topo, base, alvo } = await botao.evaluate((no) => {
      const area = no.closest("[data-janela-corpo]")!.getBoundingClientRect();
      const caixa = no.getBoundingClientRect();
      return { topo: area.top, base: area.bottom, alvo: { topo: caixa.top, base: caixa.bottom } };
    });
    expect(alvo.topo, "topo do botão dentro da área do painel").toBeGreaterThanOrEqual(topo);
    expect(alvo.base, "base do botão dentro da área do painel").toBeLessThanOrEqual(base);
    // Nada disso rola a página.
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });

  test("o menu do site abre por cima das janelas do jogo", async ({ page }) => {
    await abrirLimpo(page, LULA.rota);
    await page.getByRole("button", { name: "Capítulos e tarefas" }).click();
    await expect(dialogo(page, "painel")).toBeVisible();
    await page.getByRole("button", { name: "Menu" }).click();
    const destino = page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Metodologia" });
    await expect(destino).toBeVisible();
    // O que está sob o dedo, no meio do link, é o link, e não a janela do jogo.
    const noTopo = await destino.evaluate((no) => {
      const caixa = no.getBoundingClientRect();
      const alvo = document.elementFromPoint(caixa.left + caixa.width / 2, caixa.top + caixa.height / 2);
      return alvo !== null && (alvo === no || no.contains(alvo));
    });
    expect(noTopo, "o link do menu recebe o toque").toBe(true);
    await destino.click();
    await expect(page).toHaveURL(/\/metodologia\/$/);
  });
});

test.describe("celular deitado", () => {
  test.use({ viewport: CELULAR_DEITADO, hasTouch: true, isMobile: true });

  test("o palco cabe na janela, com o direcional, o botão de ação e os botões do topo à vista", async ({ page }) => {
    await abrirLimpo(page, LULA.rota);
    const caixaDoPalco = (await jogo(page).boundingBox())!;
    expect(Math.round(caixaDoPalco.y + caixaDoPalco.height), "base do palco").toBeLessThanOrEqual(CELULAR_DEITADO.height);
    const naJanela = async (seletor: string) => {
      const caixa = (await page.locator(seletor).boundingBox())!;
      expect(caixa.y, `${seletor}: topo`).toBeGreaterThanOrEqual(0);
      expect(Math.round(caixa.y + caixa.height), `${seletor}: base`).toBeLessThanOrEqual(CELULAR_DEITADO.height);
      expect(Math.round(caixa.x + caixa.width), `${seletor}: lado`).toBeLessThanOrEqual(CELULAR_DEITADO.width);
      return caixa;
    };
    const direcional = await naJanela("[data-direcional]");
    const acao = await naJanela("[data-acao-toque]");
    const objetivo = await naJanela("[data-objetivo-caixa]");
    await naJanela("[data-abrir-painel]");
    await naJanela("[data-abrir-guia]");
    expect(Math.min(acao.width, acao.height), "botão de ação").toBeGreaterThanOrEqual(44);
    // O objetivo, no alto, não cobre o direcional, embaixo.
    expect(objetivo.y + objetivo.height, "o objetivo acaba antes do direcional").toBeLessThanOrEqual(direcional.y);
    // Nada pede rolagem para jogar.
    expect(await page.evaluate(() => window.scrollY)).toBe(0);

    // O direcional move o personagem como em pé.
    const inicio = await position(page);
    const ponto = { pointerId: 1, pointerType: "touch", isPrimary: true, bubbles: true, clientX: direcional.x + direcional.width * 0.85, clientY: direcional.y + direcional.height * 0.85 };
    await page.locator("[data-direcional]").dispatchEvent("pointerdown", ponto);
    await page.waitForTimeout(350);
    await page.locator("[data-direcional]").dispatchEvent("pointerup", ponto);
    expect((await position(page)).x).toBeGreaterThan(inicio.x + 0.3);
  });

  test("a tela de fim não corta o começo: o que não cabe rola inteiro", async ({ page }) => {
    // Os dois capítulos inteiros pelo painel.
    test.slow();
    await abrirLimpo(page, LULA.rota);
    await concluirCapitulo1PeloPainel(page, LULA);
    await abrirASaidaPeloPainel(page, LULA.c2);
    await atravessarPeloPainel(page);
    const fim = page.locator('[data-fim="sim"]');
    await expect(fim).toBeVisible();
    // No alto da rolagem, a primeira linha da tela de fim está dentro dela, e não acima.
    const medida = await fim.evaluate((no) => {
      no.scrollTop = 0;
      const primeiro = no.querySelector("p")!.getBoundingClientRect();
      const caixa = no.getBoundingClientRect();
      return { topoDoTexto: primeiro.top, topoDaTela: caixa.top };
    });
    expect(medida.topoDoTexto, "o rótulo Fim desta etapa começa dentro da tela de fim").toBeGreaterThanOrEqual(medida.topoDaTela);
    await expect(fim.locator("p").first()).toHaveText("Fim desta etapa");
  });
});

test.describe("com movimento ligado", () => {
  test.use({ contextOptions: { reducedMotion: "no-preference" } });

  test("a jornada pelo cenário funciona igual: recolher, a porta abrir, atravessar andando e chegar ao capítulo seguinte", async ({ page }) => {
    test.slow();
    await abrirLimpo(page, LULA.rota);
    await expect(jogo(page)).toHaveAttribute("data-movimento", "ligado");
    // Com movimento, a câmera segue com atraso, o registro balança e a porta abre aos poucos.
    await walkTo(page, LULA.cena1, posicaoDe(LULA.c1, LULA.exigido1));
    await expect(page.locator("[data-alcance]")).toHaveAttribute("data-alcance-id", LULA.exigido1);
    const antes = await frame(page);
    await page.keyboard.press("e");
    await expect(dialogo(page, "registro")).toBeVisible();
    await page.getByRole("button", { name: "Guardar e continuar" }).click();
    // A tarefa está cumprida, e a porta espera os outros registros.
    await expect(jogo(page)).toHaveAttribute("data-saida", "fechada");
    await abrirASaidaPeloPainel(page, LULA.c1);
    await expect(jogo(page)).toHaveAttribute("data-saida", "aberta");
    // A cena se mexe sozinha: dois quadros separados no tempo não são iguais.
    const um = await frame(page);
    await page.waitForTimeout(400);
    const dois = await frame(page);
    expect(um.cores).toBeGreaterThan(60);
    expect(dois.assinatura, "a cena anima").not.toBe(um.assinatura);
    expect(um.assinatura).not.toBe(antes.assinatura);

    // Andando para dentro da porta aberta, sem tecla de interação.
    await walkTo(page, LULA.cena1, { x: LULA.cena1.saida.x, y: LULA.cena1.saida.y }, true);
    const transicao = page.locator("[data-transicao]");
    await expect(transicao).toBeVisible();
    await expect(transicao).toContainText(LULA.c2.titulo);
    // A transição segue sozinha depois de um instante.
    await expect(jogo(page)).toHaveAttribute("data-capitulo", LULA.c2.id, { timeout: 6000 });
    await expect(jogo(page)).toHaveAttribute("data-modo", "jogando");
    await expect.poll(() => position(page)).toEqual(inicioDe(LULA.c2));
    expect((await frame(page)).cores).toBeGreaterThan(60);
  });
});
