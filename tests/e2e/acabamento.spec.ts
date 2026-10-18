// Fase 8: acabamento visual e transições. Abertura, hierarquia da leitura,
// continuidade da seleção entre as partes, transições que não seguram o estado
// e movimento reduzido. Os valores esperados saem dos arquivos gerados.
//
// O que depende do build de produção (pacotes, pré-carregamento, imagens
// pedidas) fica em `tests/export/carregamento.spec.ts`.

import { readFileSync } from "node:fs";

import { expect, test, type Locator, type Page } from "@playwright/test";

import { MAP_PACKAGE } from "./map-package";

interface EventRecord {
  id: string;
  slug: string;
  titulo: string;
  categoria: string;
  pessoaIds: string[];
  data: { valor: string; precisao: "ano" | "mes" | "dia" };
  fontes: { fonteId: string }[];
  localizacao: { tipo: "lugares"; lugarIds: string[] } | { tipo: "nacional" | "desconhecida" };
}

const conjunto = JSON.parse(readFileSync("generated/dados/conjunto.json", "utf8")) as {
  acontecimentos: EventRecord[];
  pessoas: { id: string; slug: string; nome: string }[];
  fontes: { id: string; url: string }[];
};

const lula = conjunto.pessoas.find((pessoa) => pessoa.slug === "lula")!;
const yearOf = (item: EventRecord) => Number(item.data.valor.slice(0, 4));
const deLula = conjunto.acontecimentos.filter((item) => item.pessoaIds.includes(lula.id));
const primeiro = deLula[0]!;
const ultimo = deLula.at(-1)!;
/** Um acontecimento com lugar, para a seleção aparecer também no mapa. */
const comLugar = deLula.findLast((item) => item.localizacao.tipo === "lugares")!;

const LULA = "/politicos/lula/";
const TELAS = {
  computador: { width: 1440, height: 900 },
  tablet: { width: 768, height: 1024 },
  celular: { width: 390, height: 844 },
  "celular estreito": { width: 360, height: 800 },
} as const;

const lista = (page: Page) => page.getByRole("region", { name: "Acontecimentos", exact: true });
const item = (page: Page, slug: string) => page.locator(`#item-${slug}`);
const leitura = (page: Page) => page.getByRole("region", { name: "Leitura" });
const tempo = (page: Page) => page.getByRole("region", { name: "Linha do tempo" });
const recorte = (page: Page) => page.getByRole("region", { name: "Recorte" });
const vista = (page: Page, nome: string) =>
  page.getByRole("group", { name: "Vista" }).getByRole("button", { name: nome, exact: true });

const endereco = (page: Page) => {
  const url = new URL(page.url());
  return url.pathname + url.search;
};
const expectUrl = (page: Page, esperado: string) =>
  expect.poll(() => endereco(page), { message: "endereço" }).toBe(esperado);

const fontSize = (alvo: Locator) => alvo.evaluate((no) => Number.parseFloat(getComputedStyle(no).fontSize));

test.describe("abertura", () => {
  for (const [nome, tela] of Object.entries(TELAS)) {
    test(`convite, as duas ações e o começo da prévia cabem na primeira tela: ${nome}`, async ({ page }) => {
      await page.setViewportSize(tela);
      await page.goto("/");

      // D-155: a entrada abre no palco com o convite, as duas ações e a prévia da praça. As duas ações inteiras na primeira tela, em qualquer largura.
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Atlas Político");
      const comecar = page.locator("a[data-comecar-investigacao]");
      const comparar = page.locator("a[data-comparar-candidatos]");
      await expect(comecar).toHaveText("Começar investigação");
      await expect(comecar).toHaveAttribute("href", "/praca/");
      await expect(comparar).toHaveText("Comparar candidatos");
      await expect(comparar).toHaveAttribute("href", "/comparar/");
      for (const caixa of await Promise.all([comecar, comparar].map(async (botao) => (await botao.boundingBox())!))) {
        expect(caixa.y + caixa.height, "base da ação").toBeLessThanOrEqual(tela.height);
      }
      // A prévia começa na primeira tela: é leve (um SVG embutido), e não pede o mundo 3D.
      const previa = (await page.locator("[data-previa-da-praca]").boundingBox())!;
      expect(previa.y, "topo da prévia").toBeLessThan(tela.height);
      expect(await page.locator("canvas").count(), "a entrada não desenha cena").toBe(0);

      // Mais abaixo, na folha, os dois perfis com o mesmo tamanho, lado a lado, cada um com o acesso ao jogo.
      const acessos = page.getByRole("region", { name: "Escolha uma trajetória" });
      const cartoes = acessos.locator("a[data-cartao-perfil]");
      await expect(cartoes).toHaveCount(2);
      await expect(acessos.locator("a[data-jogar-entrada]")).toHaveCount(2);
      const caixas = await Promise.all((await cartoes.all()).map(async (cartao) => (await cartao.boundingBox())!));
      expect(Math.round(caixas[0]!.width)).toBe(Math.round(caixas[1]!.width));
      expect(Math.round(caixas[0]!.height)).toBe(Math.round(caixas[1]!.height));
      expect(Math.round(caixas[0]!.y)).toBe(Math.round(caixas[1]!.y));
    });
  }

  test("em tela estreita as duas ações vêm antes dos números da edição", async ({ page }) => {
    await page.setViewportSize(TELAS.celular);
    await page.goto("/");
    const acao = (await page.locator("a[data-comecar-investigacao]").boundingBox())!;
    const numeros = (await page.getByText("Recorte", { exact: true }).boundingBox())!;
    expect(acao.y).toBeLessThan(numeros.y);
  });

  test("os dois retratos usam a mesma moldura e versões da mesma largura", async ({ page }) => {
    await page.goto("/");
    const retratos = page.getByRole("region", { name: "Escolha uma trajetória" }).locator("img");
    await expect(retratos).toHaveCount(2);
    const medidas = await retratos.evaluateAll((nos: HTMLImageElement[]) =>
      nos.map((no) => {
        const quadro = no.getBoundingClientRect();
        return {
          largura: Math.round(quadro.width),
          altura: Math.round(quadro.height),
          atributos: `${no.getAttribute("width")}x${no.getAttribute("height")}`,
        };
      }),
    );
    expect(medidas[0]).toEqual(medidas[1]);
    // Moldura 4:5, com o espaço reservado antes de a imagem chegar.
    expect(medidas[0]!.atributos).toBe("320x400");
    expect(Math.abs(medidas[0]!.altura / medidas[0]!.largura - 1.25)).toBeLessThan(0.01);
  });
});

test.describe("hierarquia da leitura", () => {
  test("no painel, o título é maior que a data, e a data continua em destaque", async ({ page }) => {
    await page.goto(`${LULA}?acontecimento=${comLugar.slug}`);
    const painel = leitura(page);
    const titulo = painel.getByRole("heading", { name: comLugar.titulo });
    await expect(titulo).toBeVisible();
    const data = painel.locator("article time").first();
    expect(await fontSize(titulo)).toBeGreaterThan(await fontSize(data));
    expect(await fontSize(data)).toBeGreaterThanOrEqual(18);
    expect(await data.evaluate((no) => Number(getComputedStyle(no.parentElement!).fontWeight))).toBeGreaterThanOrEqual(600);
  });

  test("na página do acontecimento, o título é a âncora", async ({ page }) => {
    await page.goto(`/acontecimentos/${comLugar.slug}/`);
    const titulo = page.getByRole("heading", { level: 1 });
    const data = page.locator("article header time");
    expect(await fontSize(titulo)).toBeGreaterThan(2 * (await fontSize(data)));
  });

  test("na comparação, as faixas vêm antes das notas de leitura e aparecem na primeira tela", async ({ page }) => {
    await page.goto("/comparar/");
    const faixas = (await page.getByRole("region", { name: "Linha do tempo das trajetórias" }).boundingBox())!;
    const notas = (await page.getByRole("region", { name: "Como ler esta comparação" }).boundingBox())!;
    expect(faixas.y).toBeLessThan(notas.y);
    expect(faixas.y, "começo das faixas").toBeLessThan(TELAS.computador.height - 200);
    // As notas continuam antes das colunas de cada pessoa.
    const coluna = (await page.locator("[data-trajetoria]").first().boundingBox())!;
    expect(notas.y).toBeLessThan(coluna.y);
  });
});

test.describe("continuidade da seleção", () => {
  test("seleção vinda da linha do tempo: a lista rola até o item, sem mover a página", async ({ page }) => {
    await page.goto(LULA);
    await expect(item(page, primeiro.slug)).toBeInViewport();
    await expect(item(page, ultimo.slug)).not.toBeInViewport();

    await tempo(page).locator(`button[data-slug="${ultimo.slug}"]`).click();
    await expectUrl(page, `${LULA}?acontecimento=${ultimo.slug}`);
    await expect(item(page, ultimo.slug)).toBeInViewport();
    await expect(item(page, ultimo.slug)).toHaveAttribute("aria-pressed", "true");
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    // O foco fica onde a pessoa está: na marca.
    await expect(tempo(page).locator(`button[data-slug="${ultimo.slug}"]`)).toBeFocused();
  });

  test("seleção vinda do endereço: a lista abre já no item", async ({ page }) => {
    await page.goto(`${LULA}?acontecimento=${ultimo.slug}`);
    await expect(leitura(page).getByRole("heading", { name: ultimo.titulo })).toBeVisible();
    await expect(item(page, ultimo.slug)).toBeInViewport();
  });

  test("clicar em um item que já está à vista não rola a lista", async ({ page }) => {
    await page.goto(LULA);
    const area = page.locator(".explorer-lista");
    await item(page, primeiro.slug).click();
    await expect(item(page, primeiro.slug)).toHaveAttribute("aria-pressed", "true");
    expect(await area.evaluate((no) => no.scrollTop)).toBe(0);
  });

  test("em celular, a marca selecionada fica à vista quando a linha do tempo volta à tela", async ({ page }) => {
    await page.setViewportSize(TELAS.celular);
    // Chega pela leitura, com a linha do tempo fora da tela.
    await page.goto(`${LULA}?acontecimento=${ultimo.slug}`);
    await expect(leitura(page).getByRole("heading", { name: ultimo.titulo })).toBeVisible();
    await expect(tempo(page)).toBeHidden();

    await vista(page, "Mapa").click();
    const marca = tempo(page).locator(`button[data-slug="${ultimo.slug}"]`);
    await expect(marca).toBeInViewport();
    await expect(marca).toHaveAttribute("aria-pressed", "true");
  });

  test("o perfil continua montado sob a leitura: o que estava aberto nele volta como estava", async ({ page }) => {
    await page.goto(LULA);
    const perfil = page.locator('[data-perfil="lula"]');
    const fontesDoCargo = perfil.locator('[data-secao="cargos"] details').first();
    await fontesDoCargo.locator("summary").click();
    await expect(fontesDoCargo).toHaveAttribute("open", "");

    await item(page, primeiro.slug).click();
    await expect(leitura(page).getByRole("heading", { name: primeiro.titulo })).toBeVisible();
    await expect(perfil).toBeHidden();
    await expect(perfil).toHaveCount(1);

    await leitura(page).getByRole("button", { name: "Fechar" }).click();
    await expect(perfil).toBeVisible();
    await expect(fontesDoCargo).toHaveAttribute("open", "");
  });
});

test.describe("transições", () => {
  // O resto da suíte roda com movimento reduzido; aqui o movimento está ligado.
  test.use({ contextOptions: { reducedMotion: "no-preference" } });

  test("o estado e o endereço mudam na hora, sem esperar a transição", async ({ page }) => {
    await page.goto(LULA);
    await expect(item(page, primeiro.slug)).toBeVisible();
    await page.waitForTimeout(400);

    // Logo depois do clique, antes de o navegador desenhar qualquer quadro:
    // o endereço já mudou, e a tela já é a do acontecimento.
    const logo = await item(page, primeiro.slug).evaluate(async (botao: HTMLButtonElement) => {
      let quadros = 0;
      requestAnimationFrame(() => {
        quadros += 1;
      });
      botao.click();
      const busca = location.search;
      // O React conclui a atualização no fim da tarefa, sem esperar um quadro.
      await Promise.resolve();
      await Promise.resolve();
      return {
        busca,
        quadros,
        titulo: document.querySelector(".explorer-painel article:not([data-perfil]) h3")?.textContent ?? null,
        marcado: botao.getAttribute("aria-pressed"),
      };
    });
    expect(logo.busca).toBe(`?acontecimento=${primeiro.slug}`);
    expect(logo.quadros, "quadros desenhados antes da atualização").toBe(0);
    expect(logo.titulo).toBe(primeiro.titulo);
    expect(logo.marcado).toBe("true");

    // A transição existe, e é a curta do atlas.
    const duracao = await page
      .locator(".explorer-painel article:not([data-perfil])")
      .evaluate((no) => getComputedStyle(no).animationDuration);
    expect(duracao).toBe("0.18s");
  });

  test("seleções em sequência rápida não acumulam: fica só o último acontecimento", async ({ page }) => {
    await page.goto(LULA);
    await expect(item(page, primeiro.slug)).toBeVisible();
    await page.waitForTimeout(400);
    const alvos = deLula.slice(0, 5).map((evento) => evento.slug);

    const fim = await page.evaluate(async (slugs) => {
      for (const slug of slugs) (document.getElementById(`item-${slug}`) as HTMLButtonElement).click();
      await Promise.resolve();
      await Promise.resolve();
      const artigos = document.querySelectorAll(".explorer-painel article:not([data-perfil])");
      return {
        busca: location.search,
        artigos: artigos.length,
        titulo: artigos[0]?.querySelector("h3")?.textContent ?? null,
        marcados: document.querySelectorAll(".explorer-lista button[aria-pressed='true']").length,
      };
    }, alvos);

    const escolhido = deLula[4]!;
    expect(fim.busca).toBe(`?acontecimento=${escolhido.slug}`);
    expect(fim.artigos).toBe(1);
    expect(fim.titulo).toBe(escolhido.titulo);
    expect(fim.marcados).toBe(1);

    // Passada a transição, nada ficou animando no painel.
    await page.waitForTimeout(500);
    const animando = await page
      .locator(".explorer-painel")
      .evaluate((no) => no.getAnimations({ subtree: true }).filter((animacao) => animacao.playState === "running").length);
    expect(animando).toBe(0);
    await expectUrl(page, `${LULA}?acontecimento=${escolhido.slug}`);
  });

  test("filtros em sequência rápida deixam a lista no recorte final", async ({ page }) => {
    await page.goto(LULA);
    await expect(item(page, primeiro.slug)).toBeVisible();
    await page.waitForTimeout(400);
    const filtros = recorte(page);
    await filtros.getByRole("button", { name: /^Eleições/ }).click();
    await filtros.getByRole("button", { name: /^Marcos históricos/ }).click();
    await filtros.getByRole("button", { name: /^Eleições/ }).click();

    const esperados = deLula.filter((evento) => evento.categoria === "marcos-historicos").map((evento) => evento.id);
    await expectUrl(page, `${LULA}?categorias=marcos-historicos`);
    await expect(lista(page).locator("li[data-acontecimento]")).toHaveCount(esperados.length);
    // As marcas da linha do tempo acompanham, e as que voltam entram com a transição curta.
    await expect(tempo(page).locator("button[data-mark]")).toHaveCount(esperados.length);
  });

  test("em celular, a leitura entra com a transição e o foco vai para o título", async ({ page }) => {
    await page.setViewportSize(TELAS.celular);
    await page.goto(LULA);
    await expect(item(page, primeiro.slug)).toBeVisible();
    await page.waitForTimeout(400);
    await item(page, primeiro.slug).click();

    const titulo = leitura(page).getByRole("heading", { name: primeiro.titulo });
    await expect(titulo).toBeFocused();
    expect(await page.locator(".explorer-painel").evaluate((no) => getComputedStyle(no).animationName)).toBe("atlas-enter");

    await leitura(page).getByRole("button", { name: "Fechar" }).click();
    await expect(item(page, primeiro.slug)).toBeFocused();
    await expect(lista(page)).toBeVisible();
  });
});

test.describe("movimento reduzido", () => {
  // O padrão da suíte: `reducedMotion: "reduce"`.
  test("as transições e o aviso de carregamento ficam sem movimento", async ({ page }) => {
    // O pacote do mapa demora, para o aviso de carregamento ficar na tela.
    await page.route(MAP_PACKAGE, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await route.continue();
    });
    await page.goto(`${LULA}?acontecimento=${comLugar.slug}`);

    const aviso = page.getByRole("region", { name: "Mapa", exact: true }).getByRole("status").filter({ hasText: "Carregando o mapa" });
    await expect(aviso).toBeVisible();
    const traco = await aviso.locator("p").evaluate((no) => getComputedStyle(no, "::after").animationDuration);
    expect(Number.parseFloat(traco)).toBeLessThan(0.001);

    await expect(leitura(page).getByRole("heading", { name: comLugar.titulo })).toBeVisible();
    const painel = await page
      .locator(".explorer-painel article:not([data-perfil])")
      .evaluate((no) => getComputedStyle(no).animationDuration);
    expect(Number.parseFloat(painel)).toBeLessThan(0.001);

    // O mapa chega, o aviso sai, e a seleção está marcada nele.
    await expect(aviso).toBeHidden({ timeout: 30_000 });
    await expect(page.locator("[data-map-ready]")).toBeVisible();
    await expect(page.locator("[data-marker][data-selected]").first()).toBeVisible();
  });
});

test.describe("link com consulta", () => {
  const noPeriodo = deLula.filter((evento) => yearOf(evento) >= 2016 && yearOf(evento) <= 2019);
  const aberto = noPeriodo.find((evento) => evento.localizacao.tipo === "lugares")!;
  const CONSULTA = `?de=2016&ate=2019&acontecimento=${aberto.slug}`;
  // Sem os pacotes de JavaScript a página não chega a ler o endereço: é o
  // instante entre o HTML e a hidratação, parado.
  const semHidratar = (page: Page) => page.route(/\/_next\/static\/chunks\/.*\.js/, (route) => route.abort());

  test("antes de o endereço ser lido, a área que vai mudar fica encoberta, com um aviso", async ({ page }) => {
    await semHidratar(page);
    await page.goto(`${LULA}${CONSULTA}`);

    await expect(page.locator("html")).toHaveAttribute("data-consulta", "");
    await expect(page.getByText("Abrindo a consulta do endereço…")).toBeVisible();
    // O recorte padrão está no HTML, mas não aparece no lugar do que foi pedido.
    await expect(page.locator(".explorer-lista li[data-acontecimento]").first()).toBeHidden();
    await expect(page.locator('[data-perfil="lula"]')).toBeHidden();
    // Quem é a pessoa continua à vista.
    await expect(recorte(page).getByText("Lula", { exact: true }).first()).toBeVisible();

    // Se o JavaScript não chegar, a tela aparece assim mesmo depois de alguns segundos.
    const saida = await page.locator(".explorer-grid").evaluate((no) => {
      const estilo = getComputedStyle(no);
      return { nome: estilo.animationName, atraso: estilo.animationDelay };
    });
    expect(saida).toEqual({ nome: "atlas-reveal", atraso: "6s" });
    // E aparece mesmo: passado o prazo, o recorte padrão fica à vista e o aviso sai.
    await expect(page.locator(".explorer-lista li[data-acontecimento]").first()).toBeVisible({ timeout: 9_000 });
    await expect(page.getByText("Abrindo a consulta do endereço…")).toBeHidden();
  });

  test("lido o endereço, a marca sai e a tela já é a do recorte pedido", async ({ page }) => {
    await page.goto(`${LULA}${CONSULTA}`);
    await expect(leitura(page).getByRole("heading", { name: aberto.titulo })).toBeVisible();
    await expect(page.locator("html")).not.toHaveAttribute("data-consulta");
    await expect(page.getByText("Abrindo a consulta do endereço…")).toBeHidden();
    await expect(lista(page).locator("li[data-acontecimento]")).toHaveCount(noPeriodo.length);
  });

  test("sem consulta, nada é encoberto, nem antes da hidratação", async ({ page }) => {
    await semHidratar(page);
    await page.goto(LULA);
    await expect(page.locator("html")).not.toHaveAttribute("data-consulta");
    await expect(page.locator(".explorer-lista li[data-acontecimento]").first()).toBeVisible();
    await expect(page.locator('[data-perfil="lula"]')).toBeVisible();
  });

  test("na comparação, as trajetórias esperam o recorte do endereço", async ({ page }) => {
    await semHidratar(page);
    await page.goto("/comparar/?de=2003&ate=2010");
    await expect(page.locator("html")).toHaveAttribute("data-consulta", "");
    await expect(page.locator("[data-trajetoria]").first()).toBeHidden();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Comparar trajetórias");
    await expect(page.getByText("Abrindo a consulta do endereço…")).toBeVisible();
  });

  test("a página do acontecimento não é encoberta pelo contexto de retorno", async ({ page }) => {
    await semHidratar(page);
    await page.goto(`/acontecimentos/${comLugar.slug}/?de=2016&ate=2019&origem=comparar`);
    await expect(page.locator("html")).not.toHaveAttribute("data-consulta");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(comLugar.titulo);
  });
});

test.describe("quatro telas", () => {
  const ROTAS = [
    ["entrada", "/"],
    ["exploração", LULA],
    ["acontecimento aberto", `${LULA}?acontecimento=${comLugar.slug}`],
    ["comparação", "/comparar/?de=2003&ate=2022"],
    ["página do acontecimento", `/acontecimentos/${comLugar.slug}/`],
    ["metodologia", "/metodologia/"],
    ["página não encontrada", "/endereco-que-nao-existe/"],
  ] as const;

  for (const [nome, tela] of Object.entries(TELAS)) {
    test(`nenhuma tela rola para o lado, e o título cabe na largura: ${nome}`, async ({ page }) => {
      await page.setViewportSize(tela);
      for (const [rota, caminho] of ROTAS) {
        await page.goto(caminho);
        await expect(page.locator("main h1").first()).toBeAttached();
        await expect(page.locator("html[data-consulta]")).toHaveCount(0);

        const medidas = await page.evaluate(() => {
          const titulo = Array.from(document.querySelectorAll("main h1")).find((no) => !no.classList.contains("sr-only"));
          const quadro = titulo?.getBoundingClientRect();
          return {
            conteudo: document.documentElement.scrollWidth,
            janela: window.innerWidth,
            titulo: quadro ? { esquerda: quadro.left, direita: quadro.right } : null,
          };
        });
        expect(medidas.conteudo, `largura do conteúdo: ${rota}`).toBeLessThanOrEqual(medidas.janela);
        if (medidas.titulo) {
          expect(medidas.titulo.esquerda, `título à esquerda: ${rota}`).toBeGreaterThanOrEqual(0);
          expect(medidas.titulo.direita, `título à direita: ${rota}`).toBeLessThanOrEqual(medidas.janela);
        }
      }
    });
  }

  test("no celular mais estreito, os controles da jornada têm área de toque de 44 pixels", async ({ page }) => {
    await page.setViewportSize(TELAS["celular estreito"]);
    const altura = async (alvo: Locator) => (await alvo.boundingBox())?.height ?? 0;

    await page.goto("/");
    for (const cartao of await page.getByRole("region", { name: "Escolha uma trajetória" }).getByRole("link").all()) {
      expect(await altura(cartao), `acesso da entrada: ${(await cartao.getAttribute("href")) ?? ""}`).toBeGreaterThanOrEqual(44);
    }
    expect(await altura(page.getByRole("link", { name: "Comparar as trajetórias" })), "comparar").toBeGreaterThanOrEqual(44);
    expect(await altura(page.getByRole("button", { name: "Menu" })), "menu").toBeGreaterThanOrEqual(44);

    await page.goto(LULA);
    for (const aba of ["Lista", "Mapa", "Perfil"]) {
      expect(await altura(vista(page, aba)), aba).toBeGreaterThanOrEqual(44);
    }
    const filtros = recorte(page).getByRole("button", { name: /^Filtros/ });
    expect(await altura(filtros), "filtros").toBeGreaterThanOrEqual(44);
    expect(await altura(item(page, primeiro.slug)), "item da lista").toBeGreaterThanOrEqual(44);

    await filtros.click();
    expect(await altura(page.getByLabel("De", { exact: true })), "de").toBeGreaterThanOrEqual(44);
    expect(await altura(page.getByLabel("Até", { exact: true })), "até").toBeGreaterThanOrEqual(44);
    expect(await altura(recorte(page).getByRole("button", { name: /^Eleições/ })), "categoria").toBeGreaterThanOrEqual(44);
    await filtros.click();

    await item(page, primeiro.slug).click();
    const painel = leitura(page);
    await expect(painel.getByRole("heading", { name: primeiro.titulo })).toBeVisible();
    expect(await altura(painel.getByRole("button", { name: "Fechar" }).first()), "fechar").toBeGreaterThanOrEqual(44);
    // O painel de leitura ocupa a tela sem passar da largura dela.
    const quadro = (await painel.boundingBox())!;
    expect(quadro.x).toBeGreaterThanOrEqual(0);
    expect(quadro.x + quadro.width).toBeLessThanOrEqual(TELAS["celular estreito"].width);
  });
});

test.describe("jornada principal", () => {
  for (const nome of ["computador", "celular"] as const) {
    test(`abrir, escolher pessoa, mudar o período, abrir um acontecimento, ver a fonte e comparar: ${nome}`, async ({ page }) => {
      const estreita = nome === "celular";
      await page.setViewportSize(TELAS[nome]);
      await page.goto("/");

      // Escolher a pessoa.
      await page.getByRole("region", { name: "Escolha uma trajetória" }).getByRole("link", { name: /^Lula/ }).click();
      await expectUrl(page, LULA);
      await expect(lista(page).locator("li[data-acontecimento]")).toHaveCount(deLula.length);

      // Mudar o período.
      if (estreita) await recorte(page).getByRole("button", { name: /^Filtros/ }).click();
      await page.getByLabel("De", { exact: true }).selectOption("2016");
      await page.getByLabel("Até", { exact: true }).selectOption("2019");
      if (estreita) await recorte(page).getByRole("button", { name: /^Filtros/ }).click();
      await expectUrl(page, `${LULA}?de=2016&ate=2019`);
      const noPeriodo = deLula.filter((evento) => yearOf(evento) >= 2016 && yearOf(evento) <= 2019);
      await expect(lista(page).locator("li[data-acontecimento]")).toHaveCount(noPeriodo.length);

      // Abrir um acontecimento e ler.
      const escolhido = noPeriodo[1]!;
      await item(page, escolhido.slug).click();
      await expectUrl(page, `${LULA}?de=2016&ate=2019&acontecimento=${escolhido.slug}`);
      const painel = leitura(page);
      await expect(painel.getByRole("heading", { name: escolhido.titulo })).toBeVisible();

      // Consultar a fonte: o link leva ao documento registrado, em outra aba.
      const fontes = painel.locator("article:not([data-perfil]) [data-fonte] a[target='_blank']");
      await expect(fontes).toHaveCount(escolhido.fontes.length);
      const url = conjunto.fontes.find((fonte) => fonte.id === escolhido.fontes[0]!.fonteId)!.url;
      await expect(fontes.first()).toHaveAttribute("href", url);

      // Ir à comparação, no mesmo recorte.
      await painel.getByRole("button", { name: "Fechar" }).click();
      if (estreita) await vista(page, "Perfil").click();
      await page.getByRole("link", { name: "Comparar no mesmo recorte" }).click();
      await expectUrl(page, "/comparar/?de=2016&ate=2019");
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Comparar trajetórias");
      await expect(page.locator('[data-trajetoria="lula"] [data-secao="acontecimentos"] li[data-acontecimento]')).toHaveCount(
        noPeriodo.length,
      );
    });
  }
});
