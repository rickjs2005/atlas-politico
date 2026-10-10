// Fase 5: a navegação temporal com os dados gerados. Escolha e troca de
// pessoa, ano, intervalo e categorias, datas parciais, cargos e partidos do
// período, seleção e painel, e a consulta inteira guardada no endereço: link
// direto, recarregar, voltar e avançar. Os valores esperados saem dos arquivos
// gerados, para o teste acompanhar o conteúdo.

import { readFileSync } from "node:fs";

import { expect, test, type Page } from "@playwright/test";

import { MAP_PACKAGE } from "./map-package";

interface Limit {
  tipo: "data" | "desconhecida" | "em-curso";
  valor?: string;
}
interface EventRecord {
  id: string;
  slug: string;
  titulo: string;
  categoria: string;
  pessoaIds: string[];
  data: { valor: string; precisao: "ano" | "mes" | "dia" };
  localizacao: { tipo: "lugares"; lugarIds: string[] } | { tipo: "nacional" | "desconhecida" };
}
interface PeriodRecord {
  id: string;
  pessoaId: string;
  periodo: { inicio: Limit; fim: Limit };
}

const conjunto = JSON.parse(readFileSync("generated/dados/conjunto.json", "utf8")) as {
  edicao: { dataDeCorte: string; cobertura: { pessoaId: string; periodo: { inicio: Limit } }[] };
  acontecimentos: EventRecord[];
  pessoas: { id: string; slug: string; nome: string }[];
  mandatos: (PeriodRecord & { cargo: string; instituicao: string })[];
  filiacoes: (PeriodRecord & { partido: { sigla: string } })[];
};

const lula = conjunto.pessoas.find((pessoa) => pessoa.slug === "lula")!;
const flavio = conjunto.pessoas.find((pessoa) => pessoa.slug === "flavio-bolsonaro")!;
const yearOf = (item: EventRecord) => Number(item.data.valor.slice(0, 4));
const eventosDe = (pessoaId: string) =>
  conjunto.acontecimentos.filter((item) => item.pessoaIds.includes(pessoaId));
const deLula = eventosDe(lula.id);
const deFlavio = eventosDe(flavio.id);
const CORTE = Number(conjunto.edicao.dataDeCorte.slice(0, 4));

/** Anos que a edição cobre para a pessoa: os limites do eixo e dos campos. */
function cobertura(pessoaId: string) {
  const declarada = conjunto.edicao.cobertura.find((item) => item.pessoaId === pessoaId);
  return { de: Number(declarada!.periodo.inicio.valor!.slice(0, 4)), ate: CORTE };
}

const noRecorte = (itens: EventRecord[], de: number, ate: number, categorias: string[] = []) =>
  itens.filter(
    (item) =>
      yearOf(item) >= de &&
      yearOf(item) <= ate &&
      (categorias.length === 0 || categorias.includes(item.categoria)),
  );

/** Períodos de quatro anos ou mais sem acontecimento, dentro da cobertura. */
function lacunas(itens: EventRecord[], { de, ate }: { de: number; ate: number }) {
  const anos = new Set(itens.map(yearOf));
  const achadas: { de: number; ate: number }[] = [];
  let inicio: number | null = null;
  for (let ano = de; ano <= ate + 1; ano += 1) {
    const vazio = ano <= ate && !anos.has(ano);
    if (vazio && inicio === null) inicio = ano;
    if (!vazio && inicio !== null) {
      if (ano - inicio >= 4) achadas.push({ de: inicio, ate: ano - 1 });
      inicio = null;
    }
  }
  return achadas;
}

const LULA = "/politicos/lula/";
const FLAVIO = "/politicos/flavio-bolsonaro/";
const CELULAR = { width: 390, height: 844 };

const lista = (page: Page) => page.getByRole("region", { name: "Acontecimentos", exact: true });
const itens = (page: Page) => lista(page).locator("li[data-acontecimento]");
const item = (page: Page, slug: string) => page.locator(`#item-${slug}`);
const leitura = (page: Page) => page.getByRole("region", { name: "Leitura" });
const tempo = (page: Page) => page.getByRole("region", { name: "Linha do tempo" });
const mapa = (page: Page) => page.getByRole("region", { name: "Mapa", exact: true });
const recorte = (page: Page) => page.getByRole("region", { name: "Recorte" });
const marcas = (page: Page) => tempo(page).locator("button[data-mark]");
const trajetorias = (page: Page) => page.getByRole("navigation", { name: "Trajetórias" });
const contexto = (page: Page) => lista(page).locator("details");

/** O endereço da exploração, sem o domínio: caminho e consulta. */
const endereco = (page: Page) => {
  const url = new URL(page.url());
  return url.pathname + url.search;
};
const expectUrl = (page: Page, esperado: string) =>
  expect.poll(() => endereco(page), { message: "endereço" }).toBe(esperado);
const historyLength = (page: Page) => page.evaluate(() => window.history.length);

/** Coordenada, na tela, do meio de um ano do eixo. */
async function pontoDoAno(page: Page, dominio: { de: number; ate: number }, ano: number) {
  const caixa = (await page.locator("[data-brush]").boundingBox())!;
  const fracao = (ano - dominio.de + 0.5) / (dominio.ate - dominio.de + 1);
  return { x: caixa.x + caixa.width * fracao, y: caixa.y + caixa.height / 2 };
}

async function arrastar(page: Page, dominio: { de: number; ate: number }, de: number, ate: number) {
  const inicio = await pontoDoAno(page, dominio, de);
  const fim = await pontoDoAno(page, dominio, ate);
  await page.mouse.move(inicio.x, inicio.y);
  await page.mouse.down();
  await page.mouse.move((inicio.x + fim.x) / 2, inicio.y, { steps: 4 });
  await page.mouse.move(fim.x, fim.y, { steps: 4 });
  await page.mouse.up();
}

test.describe("entrada e troca de pessoa", () => {
  test("da entrada ao perfil, com o período inicial tirado da cobertura da edição", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("main").getByRole("link", { name: /Lula.*Explorar a trajetória/ }).click();
    await expectUrl(page, LULA);

    const { de, ate } = cobertura(lula.id);
    await expect(page.getByLabel("De", { exact: true })).toHaveValue(String(de));
    await expect(page.getByLabel("Até", { exact: true })).toHaveValue(String(ate));
    await expect(lista(page)).toContainText(`${de}–${ate} · ${deLula.length} registros do atlas`);
    await expect(lista(page)).toContainText("Todo o período que a edição cobre.");
    await expect(itens(page)).toHaveCount(deLula.length);

    // Quem está aberto fica marcado; os dois perfis aparecem em ordem alfabética.
    const opcoes = trajetorias(page).getByRole("listitem");
    await expect(opcoes).toHaveText([flavio.nome, lula.nome]);
    await expect(trajetorias(page).locator("[aria-current=page]")).toHaveText(lula.nome);
  });

  test("a troca leva período e categorias, e fecha o acontecimento que é só de uma pessoa", async ({ page }) => {
    const soDeLula = noRecorte(deLula, 2019, 2022, ["eleicoes"]).find(
      (evento) => evento.pessoaIds.length === 1,
    )!;
    await page.goto(`${LULA}?de=2019&ate=2022&categorias=eleicoes&acontecimento=${soDeLula.slug}`);
    await expect(leitura(page).getByRole("heading", { name: soDeLula.titulo })).toBeVisible();

    const troca = trajetorias(page).getByRole("link", { name: flavio.nome });
    await expect(troca).toHaveAttribute("href", `${FLAVIO}?de=2019&ate=2022&categorias=eleicoes`);
    await troca.click();

    await expectUrl(page, `${FLAVIO}?de=2019&ate=2022&categorias=eleicoes`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(`Trajetória de ${flavio.nome}`);
    await expect(itens(page)).toHaveCount(noRecorte(deFlavio, 2019, 2022, ["eleicoes"]).length);
    await expect(recorte(page).getByRole("button", { name: /^Eleições/ })).toHaveAttribute("aria-pressed", "true");
    await expect(leitura(page).getByRole("heading", { name: flavio.nome, exact: true })).toBeVisible();
    await expect(trajetorias(page).locator("[aria-current=page]")).toHaveText(flavio.nome);
  });

  test("o acontecimento que é dos dois perfis continua aberto na troca", async ({ page }) => {
    const compartilhado = conjunto.acontecimentos.find(
      (evento) => evento.pessoaIds.includes(lula.id) && evento.pessoaIds.includes(flavio.id),
    );
    test.skip(compartilhado === undefined, "Nenhum acontecimento é dos dois perfis.");
    if (compartilhado === undefined) return;

    await page.goto(`${LULA}?acontecimento=${compartilhado.slug}`);
    // O link da troca só leva o acontecimento depois que a página leu o endereço: o
    // HTML chega com o link limpo. Clicar antes disso (visto no runner da CI, com o
    // servidor de desenvolvimento lento) troca de pessoa sem o acontecimento.
    const troca = trajetorias(page).getByRole("link", { name: flavio.nome });
    await expect(troca).toHaveAttribute("href", `${FLAVIO}?acontecimento=${compartilhado.slug}`);
    await troca.click();

    await expectUrl(page, `${FLAVIO}?acontecimento=${compartilhado.slug}`);
    await expect(leitura(page).getByRole("heading", { name: compartilhado.titulo })).toBeVisible();
    await expect(item(page, compartilhado.slug)).toHaveAttribute("aria-pressed", "true");
  });

  test("um período que o outro perfil não cobre não segue na troca", async ({ page }) => {
    const outra = cobertura(flavio.id);
    test.skip(cobertura(lula.id).de >= outra.de, "As coberturas começam no mesmo ano.");

    // Dois anos antes do começo da cobertura do outro perfil.
    await page.goto(`${LULA}?de=${outra.de - 12}&ate=${outra.de - 2}`);
    await expect(trajetorias(page).getByRole("link", { name: flavio.nome })).toHaveAttribute("href", FLAVIO);

    // Um período que atravessa o começo é ajustado: o lado de fora fica aberto.
    await page.goto(`${LULA}?de=${outra.de - 5}&ate=${outra.de + 5}`);
    await expect(trajetorias(page).getByRole("link", { name: flavio.nome })).toHaveAttribute(
      "href",
      `${FLAVIO}?ate=${outra.de + 5}`,
    );
  });

  test("o menu leva ao perfil limpo, mesmo de dentro dele", async ({ page }) => {
    await page.goto(`${LULA}?de=2016&ate=2019&categorias=marcos-historicos`);
    await expect(itens(page)).toHaveCount(noRecorte(deLula, 2016, 2019, ["marcos-historicos"]).length);

    await page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: lula.nome }).click();
    await expectUrl(page, LULA);
    await expect(itens(page)).toHaveCount(deLula.length);
  });
});

test.describe("ano, intervalo e categorias", () => {
  const dominio = cobertura(lula.id);

  test.beforeEach(async ({ page }) => {
    await page.goto(LULA);
    await expect(itens(page)).toHaveCount(deLula.length);
  });

  test("clicar em um ano do eixo consulta só aquele ano; clicar de novo desfaz", async ({ page }) => {
    const cheio = [...new Set(deLula.map(yearOf))].find(
      (ano) => noRecorte(deLula, ano, ano).length >= 3 && ano > dominio.de && ano < dominio.ate,
    )!;
    const doAno = noRecorte(deLula, cheio, cheio);
    const antes = await historyLength(page);

    const ponto = await pontoDoAno(page, dominio, cheio);
    await page.mouse.click(ponto.x, ponto.y);

    await expectUrl(page, `${LULA}?de=${cheio}&ate=${cheio}`);
    await expect(itens(page)).toHaveCount(doAno.length);
    await expect(marcas(page)).toHaveCount(doAno.length);
    await expect(lista(page)).toContainText(`${cheio} · ${doAno.length} registros do atlas`);
    await expect(page.getByLabel("De", { exact: true })).toHaveValue(String(cheio));
    await expect(page.getByLabel("Até", { exact: true })).toHaveValue(String(cheio));
    expect(await historyLength(page)).toBe(antes + 1);

    await page.mouse.click(ponto.x, ponto.y);
    await expectUrl(page, LULA);
    await expect(itens(page)).toHaveCount(deLula.length);
  });

  test("arrastar no eixo escolhe o intervalo ao soltar, com uma entrada só no histórico", async ({ page }) => {
    const antes = await historyLength(page);
    const esperados = noRecorte(deLula, 2003, 2010);

    // Durante o arraste só o desenho acompanha: a lista e o endereço ficam como estão.
    const inicio = await pontoDoAno(page, dominio, 2003);
    const fim = await pontoDoAno(page, dominio, 2010);
    await page.mouse.move(inicio.x, inicio.y);
    await page.mouse.down();
    await page.mouse.move(fim.x, fim.y, { steps: 8 });
    await expect(page.locator("[data-brush-label]")).toHaveText("2003–2010");
    await expect(itens(page)).toHaveCount(deLula.length);
    expect(endereco(page)).toBe(LULA);
    await page.mouse.up();

    await expectUrl(page, `${LULA}?de=2003&ate=2010`);
    await expect(itens(page)).toHaveCount(esperados.length);
    expect(await historyLength(page)).toBe(antes + 1);

    // O arraste da direita para a esquerda dá o mesmo recorte.
    await page.getByRole("button", { name: "Todo o período" }).click();
    await arrastar(page, dominio, 2010, 2003);
    await expectUrl(page, `${LULA}?de=2003&ate=2010`);
  });

  test("Esc desfaz o arraste em andamento", async ({ page }) => {
    const inicio = await pontoDoAno(page, dominio, 2003);
    const fim = await pontoDoAno(page, dominio, 2010);
    await page.mouse.move(inicio.x, inicio.y);
    await page.mouse.down();
    await page.mouse.move(fim.x, fim.y, { steps: 4 });
    await page.keyboard.press("Escape");
    await page.mouse.up();

    expect(endereco(page)).toBe(LULA);
    await expect(itens(page)).toHaveCount(deLula.length);
  });

  test("os campos de ano e as categorias se combinam, e o endereço acompanha", async ({ page }) => {
    await page.getByLabel("De", { exact: true }).selectOption("2016");
    await page.getByLabel("Até", { exact: true }).selectOption("2019");
    await expectUrl(page, `${LULA}?de=2016&ate=2019`);
    await expect(itens(page)).toHaveCount(noRecorte(deLula, 2016, 2019).length);

    // Uma categoria restringe; duas somam.
    await recorte(page).getByRole("button", { name: /^Marcos históricos/ }).click();
    await expectUrl(page, `${LULA}?de=2016&ate=2019&categorias=marcos-historicos`);
    await expect(itens(page)).toHaveCount(noRecorte(deLula, 2016, 2019, ["marcos-historicos"]).length);

    await recorte(page).getByRole("button", { name: /^Eleições/ }).click();
    await expectUrl(page, `${LULA}?de=2016&ate=2019&categorias=eleicoes,marcos-historicos`);
    const duas = noRecorte(deLula, 2016, 2019, ["eleicoes", "marcos-historicos"]);
    await expect(itens(page)).toHaveCount(duas.length);
    await expect(marcas(page)).toHaveCount(duas.length);
    await expect(lista(page)).toContainText("Só eleições, marcos históricos.");

    // A contagem de cada categoria é a do período em vigor.
    const eleicoes = noRecorte(deLula, 2016, 2019, ["eleicoes"]).length;
    await expect(recorte(page).getByRole("button", { name: /^Eleições/ })).toContainText(String(eleicoes));

    // Limpar filtros volta ao recorte inicial de uma vez.
    await lista(page).getByRole("button", { name: "Limpar filtros" }).click();
    await expectUrl(page, LULA);
    await expect(itens(page)).toHaveCount(deLula.length);
    await expect(lista(page).getByRole("button", { name: "Limpar filtros" })).toHaveCount(0);
  });

  test("escolher o limite da cobertura deixa aquele lado aberto", async ({ page }) => {
    await page.getByLabel("De", { exact: true }).selectOption("2019");
    await expectUrl(page, `${LULA}?de=2019`);
    await page.getByLabel("De", { exact: true }).selectOption(String(dominio.de));
    await expectUrl(page, LULA);
  });

  test("percorrer os anos de um campo em sequência cria uma entrada só", async ({ page }) => {
    const antes = await historyLength(page);
    const campo = page.getByLabel("De", { exact: true });
    for (let ano = dominio.de + 1; ano <= dominio.de + 14; ano += 1) {
      await campo.selectOption(String(ano));
    }
    await expectUrl(page, `${LULA}?de=${dominio.de + 14}`);
    expect(await historyLength(page)).toBe(antes + 1);

    // Voltar desfaz o ajuste inteiro.
    await page.goBack();
    await expectUrl(page, LULA);
    await expect(campo).toHaveValue(String(dominio.de));
  });

  test("período sem registros explica a lacuna e tem saída", async ({ page }) => {
    const vazio = lacunas(deLula, dominio)[0]!;
    await page.goto(`${LULA}?de=${vazio.de}&ate=${vazio.ate}`);

    await expect(lista(page)).toContainText("Nenhum registro do atlas neste recorte.");
    await expect(lista(page)).toContainText("e não falta de atividade pública");
    await expect(lista(page)).toContainText(`${vazio.de}–${vazio.ate} · 0 registros do atlas`);
    await expect(marcas(page)).toHaveCount(0);

    await lista(page).getByRole("button", { name: "Limpar período e categorias" }).click();
    await expectUrl(page, LULA);
    await expect(itens(page)).toHaveCount(deLula.length);
  });

  for (const [nome, tela] of [
    ["computador", { width: 1440, height: 900 }],
    ["celular", CELULAR],
  ] as const) {
    test(`com um período escolhido, a hachura não passa pelos anos do eixo: ${nome}`, async ({ page }) => {
      await page.setViewportSize(tela);
      await page.goto(`${LULA}?de=2016&ate=2019`);
      await expect(itens(page)).toHaveCount(noRecorte(deLula, 2016, 2019).length);

      // Os anos fora do período são os que a pessoa lê para escolher outro: têm de ficar no claro.
      const medidas = await tempo(page).evaluate((regiao) => {
        const caixa = (no: Element) => no.getBoundingClientRect();
        const sombras = Array.from(regiao.querySelectorAll("[data-period-shade] > span"))
          .map(caixa)
          .filter((sombra) => sombra.width > 1 && sombra.height > 1);
        const anos = Array.from(regiao.querySelectorAll("[data-year-label]"))
          .filter((no) => (no as HTMLElement).checkVisibility())
          .map((no) => ({ ano: no.textContent ?? "", caixa: caixa(no) }));
        const cobre = (sombra: DOMRect, alvo: DOMRect) =>
          sombra.left < alvo.right && sombra.right > alvo.left && sombra.top < alvo.bottom && sombra.bottom > alvo.top;
        return {
          sombras: sombras.length,
          anos: anos.length,
          foraDoPeriodo: anos.filter(({ ano }) => Number(ano) < 2016 || Number(ano) > 2019).length,
          cobertos: anos.filter(({ caixa: alvo }) => sombras.some((sombra) => cobre(sombra, alvo))).map(({ ano }) => ano),
        };
      });
      expect(medidas.sombras, "partes da hachura na tela").toBe(2);
      expect(medidas.foraDoPeriodo, "anos escritos fora do período").toBeGreaterThan(2);
      expect(medidas.cobertos, "anos cobertos pela hachura").toEqual([]);
    });
  }
});

test.describe("lista cronológica e datas parciais", () => {
  test("mantém a ordem dos dados e diz o que falta em cada data parcial", async ({ page }) => {
    await page.goto(LULA);
    await expect(itens(page)).toHaveCount(deLula.length);
    for (const [indice, evento] of deLula.entries()) {
      await expect(itens(page).nth(indice)).toContainText(evento.titulo);
    }

    const soAno = deLula.find((evento) => evento.data.precisao === "ano")!;
    const soMes = deLula.find((evento) => evento.data.precisao === "mes");
    const comDia = deLula.find((evento) => evento.data.precisao === "dia")!;
    await expect(item(page, soAno.slug)).toContainText("só o ano");
    await expect(item(page, soAno.slug)).toContainText("Só o ano está documentado.");
    if (soMes) await expect(item(page, soMes.slug)).toContainText("sem o dia");
    await expect(item(page, comDia.slug)).not.toContainText(/só o ano|sem o dia/);

    // A marca da linha do tempo diz a data na precisão que ela tem.
    await expect(marcas(page).and(page.locator(`[data-slug="${soAno.slug}"]`))).toHaveAttribute(
      "aria-label",
      new RegExp(`^${yearOf(soAno)}: `),
    );
  });

  test("não sugere ordem entre registros que as datas não ordenam", async ({ page }) => {
    await page.goto(LULA);
    // Um registro só com o ano, em um ano que tem outro registro.
    const emAberto = deLula.find(
      (evento) =>
        evento.data.precisao === "ano" &&
        deLula.some((outro) => outro.id !== evento.id && yearOf(outro) === yearOf(evento)),
    );
    test.skip(emAberto === undefined, "Nenhum ano tem registro só com o ano ao lado de outro.");
    if (emAberto === undefined) return;

    const aviso = `ordem dentro de ${yearOf(emAberto)} não documentada`;
    await expect(item(page, emAberto.slug)).toContainText(aviso);

    // Sozinho no ano, o registro só com o ano não tem com quem disputar a ordem.
    const sozinho = deLula.find(
      (evento) =>
        evento.data.precisao === "ano" &&
        !deLula.some((outro) => outro.id !== evento.id && yearOf(outro) === yearOf(evento)),
    );
    if (sozinho) await expect(item(page, sozinho.slug)).not.toContainText("ordem dentro de");
  });

  test("os períodos sem registro aparecem na lista, como lacunas do conjunto", async ({ page }) => {
    const dominio = cobertura(lula.id);
    const esperadas = lacunas(deLula, dominio);
    await page.goto(LULA);

    const linhas = lista(page).locator("li[data-lacuna]");
    await expect(linhas).toHaveCount(esperadas.length);
    for (const [indice, lacuna] of esperadas.entries()) {
      await expect(linhas.nth(indice)).toContainText(`${lacuna.de}–${lacuna.ate}`);
      await expect(linhas.nth(indice)).toContainText("sem registros do atlas nesta edição");
    }
    await expect(lista(page)).toContainText("e não ausência de atividade");

    // Com um período, a lacuna aparece só no trecho consultado.
    const ultima = esperadas.at(-1)!;
    await page.goto(`${LULA}?de=${ultima.de - 1}&ate=${ultima.de + 1}`);
    await expect(linhas).toHaveCount(1);
    await expect(linhas).toContainText(`${ultima.de}–${ultima.de + 1}`);
  });

  test("marcas do mesmo ano não se cobrem", async ({ page }) => {
    await page.goto(LULA);
    await expect(marcas(page)).toHaveCount(deLula.length);
    await expect
      .poll(async () => {
        const caixas = await marcas(page).evaluateAll((nos) =>
          nos.map((no) => {
            const { left, top, right, bottom } = no.getBoundingClientRect();
            return { left, top, right, bottom };
          }),
        );
        return caixas.filter((a, indice) =>
          caixas.some(
            (b, outro) =>
              outro > indice && a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom,
          ),
        ).length;
      })
      .toBe(0);
  });
});

test.describe("cargos e partidos do período", () => {
  const year = (limite: Limit) => (limite.tipo === "data" ? Number(limite.valor!.slice(0, 4)) : null);
  const fimDe = (limite: Limit) => (limite.tipo === "em-curso" ? CORTE : year(limite));

  test("mostra os registros que tocam o período, com as datas de cada um", async ({ page }) => {
    await page.goto(`${LULA}?de=2003&ate=2010`);
    const bloco = contexto(page);
    await expect(bloco.locator("summary")).toContainText("Cargos e partidos em 2003–2010");
    await bloco.locator("summary").click();

    // Com as duas datas conhecidas, a conta por ano basta para saber quem toca o período.
    const datados = conjunto.mandatos.filter((mandato) => {
      const inicio = year(mandato.periodo.inicio);
      const fim = fimDe(mandato.periodo.fim);
      return mandato.pessoaId === lula.id && inicio !== null && fim !== null && inicio <= 2010 && fim >= 2003;
    });
    expect(datados.length).toBeGreaterThan(0);
    const cargos = bloco.locator("section").filter({ has: page.getByRole("heading", { name: "Cargos e funções" }) });
    for (const mandato of datados) await expect(cargos).toContainText(mandato.cargo);

    // Quem ficou fora do período não aparece.
    const fora = conjunto.mandatos.find((mandato) => {
      const fim = fimDe(mandato.periodo.fim);
      return mandato.pessoaId === lula.id && fim !== null && fim < 2003 && !datados.includes(mandato);
    });
    if (fora) await expect(cargos).not.toContainText(`${fora.cargo}, ${fora.instituicao}`);

    const filiado = conjunto.filiacoes.find((filiacao) => {
      const inicio = year(filiacao.periodo.inicio);
      const fim = fimDe(filiacao.periodo.fim);
      return filiacao.pessoaId === lula.id && inicio !== null && fim !== null && inicio <= 2010 && fim >= 2003;
    });
    if (filiado) {
      await expect(
        bloco.locator("section").filter({ has: page.getByRole("heading", { name: "Partidos" }) }),
      ).toContainText(filiado.partido.sigla);
    }
  });

  test("registro com limite desconhecido aparece como presença incerta, e não como data", async ({ page }) => {
    // Começou antes do período e não tem fim documentado: pode ou não tocá-lo.
    const incerto = conjunto.mandatos.find((mandato) => {
      const inicio = year(mandato.periodo.inicio);
      return (
        mandato.pessoaId === lula.id &&
        mandato.periodo.fim.tipo === "desconhecida" &&
        inicio !== null &&
        inicio < 2003
      );
    });
    test.skip(incerto === undefined, "Nenhum mandato tem o fim desconhecido.");
    if (incerto === undefined) return;

    await page.goto(`${LULA}?de=2003&ate=2010`);
    const bloco = contexto(page);
    await expect(bloco.locator("summary")).toContainText("com presença incerta");
    await bloco.locator("summary").click();

    const incertos = bloco
      .locator("section")
      .filter({ has: page.getByRole("heading", { name: "Presença incerta no período" }) });
    await expect(incertos).toContainText(incerto.cargo);
    await expect(incertos).toContainText("fim não documentado");
    await expect(bloco).toContainText("e não ausência de atividade");
  });

  test("o bloco abre e fecha pelo teclado, e acompanha o período", async ({ page }) => {
    await page.goto(FLAVIO);
    const bloco = contexto(page);
    await expect(bloco).not.toHaveAttribute("open", "");

    await bloco.locator("summary").focus();
    await page.keyboard.press("Enter");
    await expect(bloco).toHaveAttribute("open", "");

    // Um ano com mudança de partido: os dois períodos aparecem.
    const mudanca = conjunto.filiacoes.filter(
      (filiacao) =>
        filiacao.pessoaId === flavio.id &&
        (year(filiacao.periodo.inicio) === 2021 || year(filiacao.periodo.fim) === 2021),
    );
    test.skip(mudanca.length < 2, "Nenhuma mudança de partido em 2021.");
    await page.getByLabel("De", { exact: true }).selectOption("2021");
    await page.getByLabel("Até", { exact: true }).selectOption("2021");
    await expect(bloco.locator("summary")).toContainText("Cargos e partidos em 2021");
    for (const filiacao of mudanca) await expect(bloco).toContainText(filiacao.partido.sigla);
  });
});

test.describe("seleção, painel e endereço", () => {
  const escolhido = noRecorte(deLula, 2016, 2019, ["marcos-historicos"])[1]!;

  test("selecionar entra no endereço; fechar sai; voltar e avançar restauram", async ({ page }) => {
    await page.goto(LULA);
    await item(page, escolhido.slug).click();

    await expectUrl(page, `${LULA}?acontecimento=${escolhido.slug}`);
    await expect(leitura(page).getByRole("heading", { name: escolhido.titulo })).toBeVisible();
    await expect(marcas(page).and(page.locator(`[data-slug="${escolhido.slug}"]`))).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await leitura(page).getByRole("button", { name: "Fechar" }).click();
    await expectUrl(page, LULA);
    await expect(item(page, escolhido.slug)).toBeFocused();

    await page.goBack();
    await expectUrl(page, `${LULA}?acontecimento=${escolhido.slug}`);
    await expect(leitura(page).getByRole("heading", { name: escolhido.titulo })).toBeVisible();
    await expect(item(page, escolhido.slug)).toHaveAttribute("aria-pressed", "true");

    await page.goBack();
    await expectUrl(page, LULA);
    await expect(leitura(page).getByRole("heading", { name: lula.nome, exact: true })).toBeVisible();

    await page.goForward();
    await expect(leitura(page).getByRole("heading", { name: escolhido.titulo })).toBeVisible();
  });

  test("um endereço direto restaura a consulta inteira, e recarregar a mantém", async ({ page }) => {
    const consulta = `${LULA}?de=2016&ate=2019&categorias=marcos-historicos&acontecimento=${escolhido.slug}`;
    const esperados = noRecorte(deLula, 2016, 2019, ["marcos-historicos"]);

    for (const passo of ["abrir", "recarregar"]) {
      if (passo === "abrir") await page.goto(consulta);
      else await page.reload();

      await expect(itens(page), passo).toHaveCount(esperados.length);
      await expect(page.getByLabel("De", { exact: true }), passo).toHaveValue("2016");
      await expect(page.getByLabel("Até", { exact: true }), passo).toHaveValue("2019");
      await expect(recorte(page).getByRole("button", { name: /^Marcos históricos/ }), passo).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      await expect(leitura(page).getByRole("heading", { name: escolhido.titulo }), passo).toBeVisible();
      await expect(item(page, escolhido.slug), passo).toHaveAttribute("aria-pressed", "true");
      expect(endereco(page), passo).toBe(consulta);
    }
  });

  test("voltar e avançar percorrem filtros e seleção, na ordem em que foram feitos", async ({ page }) => {
    await page.goto(LULA);
    await page.getByLabel("De", { exact: true }).selectOption("2016");
    await expectUrl(page, `${LULA}?de=2016`);
    await recorte(page).getByRole("button", { name: /^Marcos históricos/ }).click();
    await item(page, escolhido.slug).click();
    const cheio = `${LULA}?de=2016&categorias=marcos-historicos&acontecimento=${escolhido.slug}`;
    await expectUrl(page, cheio);

    await page.goBack();
    await expectUrl(page, `${LULA}?de=2016&categorias=marcos-historicos`);
    await expect(leitura(page).getByRole("heading", { name: lula.nome, exact: true })).toBeVisible();
    await expect(itens(page)).toHaveCount(noRecorte(deLula, 2016, CORTE, ["marcos-historicos"]).length);

    await page.goBack();
    await expectUrl(page, `${LULA}?de=2016`);
    await expect(recorte(page).getByRole("button", { name: /^Marcos históricos/ })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await expect(itens(page)).toHaveCount(noRecorte(deLula, 2016, CORTE).length);

    await page.goBack();
    await expectUrl(page, LULA);
    await expect(itens(page)).toHaveCount(deLula.length);

    await page.goForward();
    await page.goForward();
    await page.goForward();
    await expectUrl(page, cheio);
    await expect(leitura(page).getByRole("heading", { name: escolhido.titulo })).toBeVisible();
  });

  test("um filtro que tira o acontecimento do recorte fecha o painel e diz por quê", async ({ page }) => {
    await page.goto(`${LULA}?acontecimento=${escolhido.slug}`);
    await expect(leitura(page).getByRole("heading", { name: escolhido.titulo })).toBeVisible();

    await recorte(page).getByRole("button", { name: /^Eleições/ }).click();

    await expectUrl(page, `${LULA}?categorias=eleicoes`);
    await expect(leitura(page).getByRole("heading", { name: lula.nome, exact: true })).toBeVisible();
    await expect(lista(page).locator('button[aria-pressed="true"]')).toHaveCount(0);
    await expect(marcas(page).and(page.locator('[aria-pressed="true"]'))).toHaveCount(0);
    await expect(lista(page)).toContainText("ficou fora deste recorte e foi fechado");

    // Voltar devolve o acontecimento aberto, sem o filtro.
    await page.goBack();
    await expectUrl(page, `${LULA}?acontecimento=${escolhido.slug}`);
    await expect(leitura(page).getByRole("heading", { name: escolhido.titulo })).toBeVisible();
  });

  test("um filtro que mantém o acontecimento no recorte mantém o painel", async ({ page }) => {
    await page.goto(`${LULA}?acontecimento=${escolhido.slug}`);
    await recorte(page).getByRole("button", { name: /^Marcos históricos/ }).click();

    await expectUrl(page, `${LULA}?categorias=marcos-historicos&acontecimento=${escolhido.slug}`);
    await expect(leitura(page).getByRole("heading", { name: escolhido.titulo })).toBeVisible();
    await expect(lista(page)).not.toContainText("ficou fora deste recorte");
  });

  test("da página do acontecimento, o botão voltar devolve a consulta", async ({ page }) => {
    const consulta = `${LULA}?de=2016&ate=2019&acontecimento=${escolhido.slug}`;
    await page.goto(consulta);
    await leitura(page).getByRole("link", { name: "Abrir a página do acontecimento" }).click();
    // Desde a fase 7 o link leva o recorte, para a página poder devolvê-lo (docs/PAGES.md).
    await expectUrl(page, `/acontecimentos/${escolhido.slug}/?de=2016&ate=2019`);

    await page.goBack();
    await expectUrl(page, consulta);
    await expect(itens(page)).toHaveCount(noRecorte(deLula, 2016, 2019).length);
    await expect(leitura(page).getByRole("heading", { name: escolhido.titulo })).toBeVisible();
  });
});

test.describe("endereços inválidos ou incompatíveis", () => {
  const soDeFlavio = deFlavio.find((evento) => evento.pessoaIds.length === 1)!;
  const de2018 = noRecorte(deLula, 2018, 2018)[0]!;

  const casos: { nome: string; consulta: string; canonico: string; itens: number }[] = [
    {
      nome: "parâmetros fora do formato",
      consulta: "?de=abcd&ate=20199&categorias=inventada&acontecimento=N%C3%A3o+Vale",
      canonico: "",
      itens: deLula.length,
    },
    {
      nome: "acontecimento que não existe",
      consulta: "?categorias=eleicoes&acontecimento=nao-existe",
      canonico: "?categorias=eleicoes",
      itens: noRecorte(deLula, 0, 9999, ["eleicoes"]).length,
    },
    {
      nome: "acontecimento de outro perfil",
      consulta: `?acontecimento=${soDeFlavio.slug}`,
      canonico: "",
      itens: deLula.length,
    },
    {
      nome: "acontecimento fora do período pedido",
      consulta: `?de=2020&ate=2022&acontecimento=${de2018.slug}`,
      canonico: "?de=2020&ate=2022",
      itens: noRecorte(deLula, 2020, 2022).length,
    },
    {
      nome: "acontecimento fora das categorias pedidas",
      consulta: `?categorias=partidos-e-aliancas&acontecimento=${de2018.slug}`,
      canonico: "?categorias=partidos-e-aliancas",
      itens: noRecorte(deLula, 0, 9999, ["partidos-e-aliancas"]).length,
    },
    {
      nome: "período inteiro fora da cobertura",
      consulta: "?de=1900&ate=1950",
      canonico: "",
      itens: deLula.length,
    },
    {
      nome: "período informado ao contrário e além da cobertura",
      consulta: "?de=2090&ate=2016",
      canonico: "?de=2016",
      itens: noRecorte(deLula, 2016, CORTE).length,
    },
    {
      nome: "parâmetro que o atlas não conhece",
      consulta: "?utm_source=rede&de=abcd",
      canonico: "?utm_source=rede",
      itens: deLula.length,
    },
  ];

  for (const caso of casos) {
    test(`${caso.nome}: a página abre, e o endereço é corrigido no lugar`, async ({ page }) => {
      const erros: string[] = [];
      page.on("pageerror", (erro) => erros.push(erro.message));

      await page.goto(LULA + caso.consulta);
      const antes = await historyLength(page);

      await expectUrl(page, LULA + caso.canonico);
      await expect(itens(page)).toHaveCount(caso.itens);
      // Nenhum painel incompatível: sem acontecimento válido, fica o perfil.
      await expect(leitura(page).getByRole("heading", { name: lula.nome, exact: true })).toBeVisible();
      // A correção substitui a entrada: não há um passo a mais para voltar.
      expect(await historyLength(page)).toBe(antes);
      expect(erros).toEqual([]);
    });
  }
});

test.describe("leitura independente do mapa", () => {
  test("sem o pacote do mapa, a consulta, a linha do tempo e o painel continuam", async ({ page }) => {
    await page.route(MAP_PACKAGE, (route) => route.abort());
    const esperados = noRecorte(deLula, 2016, 2019);
    await page.goto(`${LULA}?de=2016&ate=2019`);

    await expect(mapa(page).getByText("O mapa não pôde ser exibido agora.")).toBeVisible();
    await expect(itens(page)).toHaveCount(esperados.length);
    await expect(marcas(page)).toHaveCount(esperados.length);

    // O que o mapa recebe é o recorte: a lista de lugares tem só os pontos dele.
    const pontos = esperados.reduce(
      (soma, evento) => soma + (evento.localizacao.tipo === "lugares" ? evento.localizacao.lugarIds.length : 0),
      0,
    );
    await expect(mapa(page).locator("[data-ponto]")).toHaveCount(pontos);

    const alvo = esperados[0]!;
    await marcas(page).and(page.locator(`[data-slug="${alvo.slug}"]`)).click();
    await expectUrl(page, `${LULA}?de=2016&ate=2019&acontecimento=${alvo.slug}`);
    await expect(leitura(page).getByRole("heading", { name: alvo.titulo })).toBeVisible();
    await expect(leitura(page).getByRole("heading", { name: /^Fontes/ })).toBeVisible();

    await page.goBack();
    await expectUrl(page, `${LULA}?de=2016&ate=2019`);
    await expect(leitura(page).getByRole("heading", { name: lula.nome, exact: true })).toBeVisible();
  });
});

test.describe("em celular", () => {
  test.use({ viewport: CELULAR, hasTouch: true });

  test("chegar com um período mostra o trecho na faixa, e a troca de pessoa está nos filtros", async ({ page }) => {
    const esperados = noRecorte(deLula, 2016, 2019);
    await page.goto(`${LULA}?de=2016&ate=2019`);
    await expect(itens(page)).toHaveCount(esperados.length);
    await expect(recorte(page)).toContainText("2016–2019 · todas as categorias");

    // A faixa rola até o período: as marcas dele estão na parte visível.
    await expect
      .poll(() =>
        marcas(page).evaluateAll((nos) =>
          nos.every((no) => {
            const { left, right } = no.getBoundingClientRect();
            return left >= 0 && right <= window.innerWidth;
          }),
        ),
      )
      .toBe(true);

    await page.getByRole("button", { name: /^Filtros/ }).click();
    const troca = trajetorias(page).getByRole("link", { name: flavio.nome });
    await expect(troca).toHaveAttribute("href", `${FLAVIO}?de=2016&ate=2019`);
    expect((await troca.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    expect((await page.getByRole("button", { name: "Limpar filtros" }).first().boundingBox())!.height).toBeGreaterThanOrEqual(44);

    const { conteudo, janela } = await page.evaluate(() => ({
      conteudo: document.documentElement.scrollWidth,
      janela: window.innerWidth,
    }));
    expect(conteudo).toBeLessThanOrEqual(janela);
  });

  test("o botão voltar do navegador fecha a leitura e devolve a lista", async ({ page }) => {
    const alvo = deLula.at(-3)!;
    await page.goto(LULA);
    await item(page, alvo.slug).click();
    await expect(leitura(page).getByRole("heading", { name: alvo.titulo })).toBeFocused();
    await expect(lista(page)).toBeHidden();

    await page.goBack();
    await expectUrl(page, LULA);
    await expect(lista(page)).toBeVisible();
    await expect(leitura(page)).toBeHidden();

    // Avançar reabre a leitura, como estava.
    await page.goForward();
    await expect(leitura(page).getByRole("heading", { name: alvo.titulo })).toBeVisible();
    await expect(lista(page)).toBeHidden();
  });

  test("tocar em um ano do eixo consulta aquele ano", async ({ page }) => {
    const dominio = cobertura(lula.id);
    await page.goto(LULA);
    await expect(itens(page)).toHaveCount(deLula.length);

    // O começo da faixa está à vista: toca em um ano dela.
    const ano = dominio.de + 4;
    const ponto = await pontoDoAno(page, dominio, ano);
    await page.touchscreen.tap(ponto.x, ponto.y);

    await expectUrl(page, `${LULA}?de=${ano}&ate=${ano}`);
    await expect(itens(page)).toHaveCount(noRecorte(deLula, ano, ano).length);
    await expect(recorte(page)).toContainText(`${ano} · todas as categorias`);
  });

  test("no mapa, o cartão volta com o botão voltar do navegador", async ({ page }) => {
    const alvo = deLula.find((evento) => evento.localizacao.tipo === "lugares")!;
    await page.goto(LULA);
    await page.getByRole("group", { name: "Vista" }).getByRole("button", { name: "Mapa", exact: true }).click();
    await marcas(page).and(page.locator(`[data-slug="${alvo.slug}"]`)).click();
    await expect(mapa(page).getByText(alvo.titulo)).toBeVisible();
    await expectUrl(page, `${LULA}?acontecimento=${alvo.slug}`);

    await mapa(page).getByRole("button", { name: "Fechar" }).click();
    await expectUrl(page, LULA);
    await expect(mapa(page).getByText(alvo.titulo)).toBeHidden();

    await page.goBack();
    await expect(mapa(page).getByText(alvo.titulo)).toBeVisible();
    await expect(leitura(page)).toBeHidden();
  });
});

test.describe("em tablet", () => {
  test("a linha do tempo cabe sem rolar, e as marcas não se cobrem", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(FLAVIO);
    await expect(marcas(page)).toHaveCount(deFlavio.length);

    const faixa = tempo(page).locator("div.overflow-x-auto");
    const { rola } = await faixa.evaluate((no) => ({ rola: no.scrollWidth > no.clientWidth }));
    expect(rola).toBe(false);

    await expect
      .poll(async () => {
        const caixas = await marcas(page).evaluateAll((nos) =>
          nos.map((no) => {
            const { left, top, right, bottom } = no.getBoundingClientRect();
            return { left, top, right, bottom };
          }),
        );
        return caixas.filter((a, indice) =>
          caixas.some(
            (b, outro) =>
              outro > indice && a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom,
          ),
        ).length;
      })
      .toBe(0);
  });
});

test.describe("em janela baixa", () => {
  test("o mapa mantém a sua parte, e a linha do tempo rola por dentro sem cobri-lo", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(FLAVIO);
    await expect(marcas(page)).toHaveCount(deFlavio.length);
    await expect(page.locator(".maplibregl-canvas").first()).toBeVisible();

    const medida = await page.evaluate(() => {
      const caixa = (seletor: string) => document.querySelector(seletor)!.getBoundingClientRect();
      const area = caixa(".explorer-grid");
      const secaoDoMapa = caixa(".explorer-mapa");
      // O quadro do mapa é o que aparece: ele não pode passar da própria seção.
      const quadro = caixa(".explorer-mapa .maplibregl-map");
      const tempo = caixa(".explorer-tempo");
      return {
        area: area.height,
        mapa: secaoDoMapa.height,
        fimDoQuadro: quadro.bottom,
        comecoDoTempo: tempo.top,
        fimDoTempo: tempo.bottom,
        fimDaArea: area.bottom,
      };
    });

    expect(medida.mapa).toBeGreaterThanOrEqual(medida.area * 0.4 - 1);
    expect(medida.fimDoQuadro).toBeLessThanOrEqual(medida.comecoDoTempo + 1);
    expect(medida.fimDoTempo).toBeLessThanOrEqual(medida.fimDaArea + 1);
    // As marcas continuam à vista, acima da dobra da linha do tempo.
    await expect(marcas(page).first()).toBeInViewport();
  });
});
