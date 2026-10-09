// Fase 7: a comparação das duas trajetórias no mesmo período, com as mesmas
// categorias e a consulta no endereço. Os valores esperados saem dos arquivos
// gerados, para o teste acompanhar o conteúdo.

import { readFileSync } from "node:fs";

import { expect, test, type Page } from "@playwright/test";

interface Periodo {
  inicio: { tipo: string; valor?: string };
  fim: { tipo: string; valor?: string };
}
interface Cited {
  fontes: { fonteId: string }[];
}
interface EventRecord extends Cited {
  id: string;
  slug: string;
  titulo: string;
  categoria: string;
  pessoaIds: string[];
  data: { valor: string; precisao: "ano" | "mes" | "dia" };
}

const conjunto = JSON.parse(readFileSync("generated/dados/conjunto.json", "utf8")) as {
  acontecimentos: EventRecord[];
  pessoas: { id: string; slug: string; nome: string }[];
  mandatos: (Cited & { id: string; pessoaId: string; cargo: string; periodo: Periodo })[];
  filiacoes: (Cited & { id: string; pessoaId: string; periodo: Periodo })[];
  fontes: { id: string; titulo: string; url: string }[];
};

// Ordem alfabética, a mesma da interface.
const flavio = conjunto.pessoas.find((pessoa) => pessoa.slug === "flavio-bolsonaro")!;
const lula = conjunto.pessoas.find((pessoa) => pessoa.slug === "lula")!;
const PESSOAS = [flavio, lula];
const yearOf = (item: EventRecord) => Number(item.data.valor.slice(0, 4));
const compartilhado = conjunto.acontecimentos.find((item) => item.pessoaIds.length > 1)!;

/** Os acontecimentos de uma pessoa no recorte, em ordem cronológica: a conta que a tela tem de repetir. */
function noRecorte(pessoaId: string, de = 0, ate = 9999, categorias: string[] = []): string[] {
  return conjunto.acontecimentos
    .filter(
      (item) =>
        item.pessoaIds.includes(pessoaId) &&
        yearOf(item) >= de &&
        yearOf(item) <= ate &&
        (categorias.length === 0 || categorias.includes(item.categoria)),
    )
    .map((item) => item.id);
}

const COMPARAR = "/comparar/";
const CELULAR = { width: 390, height: 844 };

const recorte = (page: Page) => page.getByRole("region", { name: "Recorte" });
const coluna = (page: Page, slug: string) => page.locator(`[data-trajetoria="${slug}"]`);
const secao = (page: Page, slug: string, nome: string) => coluna(page, slug).locator(`[data-secao="${nome}"]`);
const eventosDa = (page: Page, slug: string) =>
  secao(page, slug, "acontecimentos")
    .locator("li[data-acontecimento]")
    .evaluateAll((nos) => nos.map((no) => no.getAttribute("data-acontecimento")));

const endereco = (page: Page) => {
  const url = new URL(page.url());
  return url.pathname + url.search;
};
const expectUrl = (page: Page, esperado: string) =>
  expect.poll(() => endereco(page), { message: "endereço" }).toBe(esperado);

/** A tela mostra, para cada pessoa, exatamente os acontecimentos do recorte. */
async function expectRecorte(page: Page, de?: number, ate?: number, categorias: string[] = []) {
  for (const pessoa of PESSOAS) {
    await expect
      .poll(() => eventosDa(page, pessoa.slug), { message: `acontecimentos de ${pessoa.nome}` })
      .toEqual(noRecorte(pessoa.id, de, ate, categorias));
  }
}

async function choosePeriod(page: Page, de: string, ate: string) {
  await recorte(page).getByLabel("De", { exact: true }).selectOption(de);
  await recorte(page).getByLabel("Até", { exact: true }).selectOption(ate);
}

test.describe("as duas trajetórias no mesmo recorte", () => {
  test("estado inicial: todo o período, as duas pessoas, as mesmas seções na mesma ordem", async ({ page }) => {
    await page.goto(COMPARAR);

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Comparar trajetórias");
    await expectUrl(page, COMPARAR);
    await expectRecorte(page);

    // Ordem alfabética, e a mesma estrutura para as duas.
    const ordem = await page.locator("[data-trajetoria]").evaluateAll((nos) =>
      nos.map((no) => no.getAttribute("data-trajetoria")),
    );
    expect(ordem).toEqual(PESSOAS.map((pessoa) => pessoa.slug));
    for (const pessoa of PESSOAS) {
      const secoes = await coluna(page, pessoa.slug)
        .locator("[data-secao]")
        .evaluateAll((nos) => nos.map((no) => no.getAttribute("data-secao")));
      expect(secoes).toEqual(["cobertura", "cargos", "partidos", "acontecimentos", "fontes"]);
      await expect(coluna(page, pessoa.slug).getByRole("heading", { level: 2 })).toHaveText(pessoa.nome);
    }
  });

  test("as duas faixas usam o mesmo eixo de anos, e as colunas se alinham para a leitura paralela", async ({ page }) => {
    await page.goto(COMPARAR);

    const faixas = await page.locator("ul[aria-label^='Acontecimentos de ']").evaluateAll((nos) =>
      nos.map((no) => {
        const { left, width } = no.getBoundingClientRect();
        return { left: Math.round(left), width: Math.round(width) };
      }),
    );
    expect(faixas).toHaveLength(2);
    expect(faixas[0]).toEqual(faixas[1]);

    // Em tela larga, cada seção começa na mesma altura nas duas colunas.
    for (const nome of ["cobertura", "cargos", "partidos", "acontecimentos", "fontes"]) {
      const topos = await Promise.all(
        PESSOAS.map(async (pessoa) => Math.round((await secao(page, pessoa.slug, nome).boundingBox())!.y)),
      );
      expect(topos[0], `seção ${nome}`).toBe(topos[1]);
    }
    const esquerdas = await Promise.all(
      PESSOAS.map(async (pessoa) => (await coluna(page, pessoa.slug).boundingBox())!.x),
    );
    expect(esquerdas[0]!).toBeLessThan(esquerdas[1]!);
  });

  test("o período vale para as duas trajetórias e vai para o endereço", async ({ page }) => {
    await page.goto(COMPARAR);
    await choosePeriod(page, "2019", "2022");

    await expectUrl(page, `${COMPARAR}?de=2019&ate=2022`);
    await expectRecorte(page, 2019, 2022);
    for (const pessoa of PESSOAS) {
      await expect(secao(page, pessoa.slug, "acontecimentos").getByRole("heading")).toContainText("2019–2022");
      await expect(secao(page, pessoa.slug, "cargos").getByRole("heading")).toContainText("2019–2022");
    }
    await expect(page.getByText("O período (2019–2022) e as categorias valem para as duas trajetórias")).toBeVisible();
  });

  test("as categorias valem para as duas e combinam com o período", async ({ page }) => {
    await page.goto(`${COMPARAR}?de=2016&ate=2022`);
    await recorte(page).getByRole("button", { name: /^Eleições/ }).click();
    await expectUrl(page, `${COMPARAR}?de=2016&ate=2022&categorias=eleicoes`);
    await expectRecorte(page, 2016, 2022, ["eleicoes"]);

    await recorte(page).getByRole("button", { name: /^Marcos históricos/ }).click();
    await expectUrl(page, `${COMPARAR}?de=2016&ate=2022&categorias=eleicoes,marcos-historicos`);
    await expectRecorte(page, 2016, 2022, ["eleicoes", "marcos-historicos"]);

    // A contagem de cada categoria é a dos acontecimentos do período, nas duas trajetórias.
    const eleicoes = conjunto.acontecimentos.filter(
      (item) => item.categoria === "eleicoes" && yearOf(item) >= 2016 && yearOf(item) <= 2022,
    ).length;
    await expect(recorte(page).getByRole("button", { name: /^Eleições/ })).toContainText(String(eleicoes));

    await recorte(page).getByRole("button", { name: "Limpar filtros" }).click();
    await expectUrl(page, COMPARAR);
    await expectRecorte(page);
  });

  test("o acontecimento das duas pessoas aparece nas duas trajetórias e é um registro só", async ({ page }) => {
    await page.goto(COMPARAR);

    const destinos: string[] = [];
    for (const pessoa of PESSOAS) {
      const item = secao(page, pessoa.slug, "acontecimentos").locator(`li[data-acontecimento="${compartilhado.id}"]`);
      await expect(item).toHaveCount(1);
      await expect(item).toContainText(compartilhado.titulo);
      await expect(item).toContainText("nas duas trajetórias");
      destinos.push(new URL((await item.getByRole("link").getAttribute("href"))!, page.url()).pathname);
    }
    expect(destinos[0]).toBe(`/acontecimentos/${compartilhado.slug}/`);
    expect(destinos[1]).toBe(destinos[0]);
  });

  test("datas parciais ficam com a precisão do registro", async ({ page }) => {
    await page.goto(COMPARAR);
    for (const pessoa of PESSOAS) {
      const soOAno = conjunto.acontecimentos.find(
        (item) => item.pessoaIds.includes(pessoa.id) && item.data.precisao === "ano",
      )!;
      const item = secao(page, pessoa.slug, "acontecimentos").locator(`li[data-acontecimento="${soOAno.id}"]`);
      await expect(item.locator("time")).toHaveAttribute("datetime", soOAno.data.valor);
      await expect(item).toContainText("só o ano");
    }
  });
});

test.describe("consulta no endereço", () => {
  test("recarregar, voltar e avançar restauram a consulta", async ({ page }) => {
    const consulta = `${COMPARAR}?de=2016&ate=2022&categorias=eleicoes`;
    await page.goto(consulta);
    await expectRecorte(page, 2016, 2022, ["eleicoes"]);

    await page.reload();
    await expectUrl(page, consulta);
    await expectRecorte(page, 2016, 2022, ["eleicoes"]);
    await expect(recorte(page).getByLabel("De", { exact: true })).toHaveValue("2016");
    await expect(recorte(page).getByRole("button", { name: /^Eleições/ })).toHaveAttribute("aria-pressed", "true");

    await recorte(page).getByRole("button", { name: /^Eleições/ }).click();
    await expectUrl(page, `${COMPARAR}?de=2016&ate=2022`);
    await expectRecorte(page, 2016, 2022);

    await page.goBack();
    await expectUrl(page, consulta);
    await expectRecorte(page, 2016, 2022, ["eleicoes"]);

    await page.goForward();
    await expectUrl(page, `${COMPARAR}?de=2016&ate=2022`);
    await expectRecorte(page, 2016, 2022);
  });

  test("parâmetros inválidos caem sozinhos, e o endereço é corrigido no lugar", async ({ page }) => {
    await page.goto(`${COMPARAR}?de=abcd&ate=2012&categorias=inventada,eleicoes&acontecimento=${compartilhado.slug}`);
    // Na comparação não há acontecimento aberto: o parâmetro sai.
    await expectUrl(page, `${COMPARAR}?ate=2012&categorias=eleicoes`);
    await expectRecorte(page, undefined, 2012, ["eleicoes"]);

    // Vale também para um acontecimento que está dentro do recorte.
    await page.goto(`${COMPARAR}?categorias=${compartilhado.categoria}&acontecimento=${compartilhado.slug}`);
    await expectUrl(page, `${COMPARAR}?categorias=${compartilhado.categoria}`);
    await expectRecorte(page, undefined, undefined, [compartilhado.categoria]);

    await page.goto(`${COMPARAR}?de=2012&ate=2003`);
    await expectUrl(page, `${COMPARAR}?de=2003&ate=2012`);

    // Fora da escala comum, o período é descartado; parâmetro alheio é mantido.
    await page.goto(`${COMPARAR}?de=1950&ate=1960&utm_source=rede`);
    await expectUrl(page, `${COMPARAR}?utm_source=rede`);
    await expectRecorte(page);
  });

  test("a correção do endereço não cria entrada no histórico, e ajustes seguidos do período contam como um", async ({ page }) => {
    await page.goto(COMPARAR);
    const inicio = await page.evaluate(() => history.length);

    await page.goto(`${COMPARAR}?de=2012&ate=2003`);
    await expectUrl(page, `${COMPARAR}?de=2003&ate=2012`);
    expect(await page.evaluate(() => history.length)).toBe(inicio + 1);

    // Percorrer vários anos no mesmo campo, em sequência.
    for (const ano of ["2004", "2005", "2006", "2007"]) {
      await recorte(page).getByLabel("De", { exact: true }).selectOption(ano);
    }
    await expectUrl(page, `${COMPARAR}?de=2007&ate=2012`);
    expect(await page.evaluate(() => history.length)).toBe(inicio + 2);

    await page.goBack();
    await expectUrl(page, `${COMPARAR}?de=2003&ate=2012`);
  });

  test("o HTML gerado já traz as duas trajetórias, antes de o endereço ser lido", async ({ request }) => {
    const html = await (await request.get(COMPARAR)).text();
    for (const pessoa of PESSOAS) {
      expect(html).toContain(`data-trajetoria="${pessoa.slug}"`);
      expect(html).toContain(conjunto.acontecimentos.find((item) => item.pessoaIds.includes(pessoa.id))!.titulo);
    }
  });
});

test.describe("contexto e limites da comparação", () => {
  test("cargos e partidos do período, com os intervalos e o que as datas não decidem", async ({ page }) => {
    await page.goto(`${COMPARAR}?de=2003&ate=2010`);

    // Só entram os cargos cujas datas tocam o período.
    const tocam = (periodo: Periodo) => {
      const inicio = periodo.inicio.valor === undefined ? null : Number(periodo.inicio.valor.slice(0, 4));
      const fim = periodo.fim.tipo === "em-curso" ? 9999 : periodo.fim.valor === undefined ? null : Number(periodo.fim.valor.slice(0, 4));
      if (inicio === null || fim === null) return null;
      return inicio <= 2010 && fim >= 2003;
    };
    for (const pessoa of PESSOAS) {
      const cargos = secao(page, pessoa.slug, "cargos");
      for (const mandato of conjunto.mandatos.filter((item) => item.pessoaId === pessoa.id)) {
        const esperado = tocam(mandato.periodo);
        if (esperado === null) continue; // limite desconhecido: conferido abaixo
        const item = cargos.locator(`li[data-registro="${mandato.id}"]`);
        await expect(item, mandato.id).toHaveCount(esperado ? 1 : 0);
        if (esperado) await expect(item).toContainText(mandato.cargo);
      }
    }
    // Cada cargo traz o próprio intervalo, na precisão do registro.
    await expect(secao(page, lula.slug, "cargos")).toContainText("1º de janeiro de 2003 a 1º de janeiro de 2007");
    // Limite desconhecido não vira data: a presença no período é dita como incerta.
    await expect(secao(page, lula.slug, "cargos")).toContainText("fim não documentado");
    await expect(secao(page, lula.slug, "cargos")).toContainText("presença no período não documentada");
    await expect(secao(page, flavio.slug, "partidos")).toContainText("incerta no período");
    // O que está em curso na data de corte é marcado.
    await expect(secao(page, lula.slug, "partidos")).toContainText("em curso");
  });

  test("recorte sem registros diz que falta registro, e não que faltou atividade", async ({ page }) => {
    await page.goto(`${COMPARAR}?de=1996&ate=2001`);
    await expectRecorte(page, 1996, 2001);

    for (const pessoa of PESSOAS) {
      const vazio = secao(page, pessoa.slug, "acontecimentos");
      await expect(vazio).toContainText("Nenhum acontecimento cadastrado neste recorte.");
      await expect(vazio).toContainText("e não falta de atividade pública");
      await expect(vazio.getByRole("heading")).toContainText("0 cadastrados");
    }
    // Uma das trajetórias está fora da cobertura neste período; a outra tem lacuna.
    await expect(secao(page, flavio.slug, "cobertura")).toContainText(/o atlas não cobre esta\s+trajetória/);
    await expect(secao(page, lula.slug, "cobertura")).toContainText("São lacunas da pesquisa, e não ausência de atividade");
    await expect(page.getByText("fora da cobertura desta edição").first()).toBeVisible();
    await expect(page.locator("main")).not.toContainText(/inativ|sem atividade|não atuou|parad[oa]/i);
  });

  test("a tela explica cobertura e acervo, e não faz ranking nem dá nota", async ({ page }) => {
    await page.goto(COMPARAR);

    const leitura = page.getByRole("region", { name: "Como ler esta comparação" });
    await expect(leitura).toContainText("A tela não equipara um cargo a outro");
    await expect(leitura).toContainText("A edição cobre Flávio Bolsonaro desde 2002 e Lula desde 1975");
    await expect(leitura).toContainText("a trajetória de Flávio Bolsonaro está fora da cobertura");
    await expect(leitura).toContainText("A quantidade de acontecimentos é a do acervo desta edição");
    // A cobertura de cada pessoa vem com a observação da edição.
    for (const pessoa of PESSOAS) {
      await expect(secao(page, pessoa.slug, "cobertura")).toContainText(/^Cobertura desta edição\s*desde \d{4}/);
    }

    const texto = (await page.locator("main").innerText()).toLowerCase();
    for (const palavra of ["ranking", "placar", "venc", "melhor", "pior", "produtiv", "pontua", "mais ativo"]) {
      expect(texto, palavra).not.toContain(palavra);
    }
    // "nota" e "desempenho" só aparecem para dizer o que a tela não faz.
    expect(texto.match(/\bnota\b/g)).toHaveLength(1);
    expect(texto).toContain("não dá nota");
    expect(texto.match(/desempenho/g)).toHaveLength(1);
    expect(texto).toContain("acervo, e não desempenho");
  });

  test("cada cargo e cada filiação abre as próprias fontes, e o recorte lista os documentos sem repetição", async ({ page }) => {
    await page.goto(COMPARAR);

    for (const pessoa of PESSOAS) {
      // As fontes de um cargo: os mesmos endereços do registro publicado.
      const mandato = conjunto.mandatos.find((item) => item.pessoaId === pessoa.id)!;
      const fontes = secao(page, pessoa.slug, "cargos").locator("details").first();
      await expect(fontes.locator("ol")).toBeHidden();
      await fontes.locator("summary").click();
      const enderecos = await fontes.locator("ol a").evaluateAll((nos) => nos.map((no) => no.getAttribute("href")));
      expect(enderecos).toEqual(
        mandato.fontes.map((citacao) => conjunto.fontes.find((item) => item.id === citacao.fonteId)!.url),
      );
      await expect(fontes).toContainText("O que sustenta:");

      // Os documentos do recorte: cada um uma vez.
      const registros = [
        ...conjunto.acontecimentos.filter((item) => item.pessoaIds.includes(pessoa.id)),
        ...conjunto.mandatos.filter((item) => item.pessoaId === pessoa.id),
        ...conjunto.filiacoes.filter((item) => item.pessoaId === pessoa.id),
      ];
      const documentos = new Set(registros.flatMap((item) => item.fontes.map((citacao) => citacao.fonteId)));
      const catalogo = secao(page, pessoa.slug, "fontes");
      await expect(catalogo).toContainText(`${documentos.size} documentos sustentam`);
      await catalogo.locator("summary").click();
      const listados = await catalogo.locator("li[data-fonte]").evaluateAll((nos) => nos.map((no) => no.getAttribute("data-fonte")));
      expect(listados).toHaveLength(documentos.size);
      expect(new Set(listados)).toEqual(documentos);
    }
  });
});

test.describe("de uma tela para outra", () => {
  test("o acontecimento aberto pela comparação devolve a comparação com o recorte", async ({ page }) => {
    const consulta = "de=2016&ate=2022&categorias=eleicoes";
    await page.goto(`${COMPARAR}?${consulta}`);
    // O HTML chega com o estado inicial: o recorte entra quando o endereço é lido.
    await expectRecorte(page, 2016, 2022, ["eleicoes"]);
    const [primeiro] = noRecorte(lula.id, 2016, 2022, ["eleicoes"]);
    const alvo = conjunto.acontecimentos.find((item) => item.id === primeiro)!;

    await secao(page, lula.slug, "acontecimentos").getByRole("link", { name: new RegExp(alvo.titulo) }).click();
    await expectUrl(page, `/acontecimentos/${alvo.slug}/?${consulta}&origem=comparar`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(alvo.titulo);

    const volta = page.getByRole("link", { name: /Voltar à comparação/ });
    await expect(volta).toContainText("com o recorte de antes: 2016–2022 · eleições");
    await volta.click();
    await expectUrl(page, `${COMPARAR}?${consulta}`);
    await expectRecorte(page, 2016, 2022, ["eleicoes"]);
  });

  test("as marcas da faixa levam o mesmo contexto", async ({ page }) => {
    await page.goto(`${COMPARAR}?de=2016&ate=2022`);
    await expectRecorte(page, 2016, 2022);
    const [primeiro] = noRecorte(lula.id, 2016, 2022);
    const alvo = conjunto.acontecimentos.find((item) => item.id === primeiro)!;
    const marca = page.getByRole("region", { name: `Trajetória de ${lula.nome}` }).locator(`a[href*="/acontecimentos/${alvo.slug}/"]`);
    await expect(marca).toHaveAttribute("href", `/acontecimentos/${alvo.slug}/?de=2016&ate=2022&origem=comparar`);
  });

  test("explorar a trajetória leva o recorte, ajustado à cobertura de cada pessoa", async ({ page }) => {
    await page.goto(`${COMPARAR}?de=1990&ate=2010&categorias=eleicoes`);

    const link = (slug: string) => coluna(page, slug).getByRole("link", { name: "Explorar esta trajetória no mesmo recorte" });
    await expect(link(lula.slug)).toHaveAttribute("href", "/politicos/lula/?de=1990&ate=2010&categorias=eleicoes");
    // A cobertura de Flávio Bolsonaro começa em 2002: o lado de fora fica aberto.
    await expect(link(flavio.slug)).toHaveAttribute("href", "/politicos/flavio-bolsonaro/?ate=2010&categorias=eleicoes");

    await link(flavio.slug).click();
    await expectUrl(page, "/politicos/flavio-bolsonaro/?ate=2010&categorias=eleicoes");
    await expect(page.getByRole("region", { name: "Acontecimentos", exact: true }).locator("li[data-acontecimento]")).toHaveCount(
      noRecorte(flavio.id, 0, 2010, ["eleicoes"]).length,
    );
  });
});

test.describe("copiar o link da comparação", () => {
  test("copia o endereço com o recorte e só então confirma", async ({ page, context, baseURL }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto(`${COMPARAR}?de=2016&ate=2022&categorias=eleicoes`);
    await expectRecorte(page, 2016, 2022, ["eleicoes"]);

    const botao = recorte(page).getByRole("button", { name: "Copiar link" });
    await expect(recorte(page).getByText("Link copiado")).toHaveCount(0);
    await botao.click();
    await expect(recorte(page).getByRole("button", { name: "Link copiado" })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      `${baseURL}${COMPARAR}?de=2016&ate=2022&categorias=eleicoes`,
    );

    // Outro recorte é outra cópia: a confirmação da anterior sai.
    await recorte(page).getByRole("button", { name: /^Eleições/ }).click();
    await expect(recorte(page).getByRole("button", { name: "Copiar link" })).toBeVisible();
  });

  for (const [nome, preparar] of [
    [
      "a cópia é recusada",
      () => {
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          value: { writeText: () => Promise.reject(new Error("recusado")) },
        });
      },
    ],
    [
      "o navegador não oferece a área de transferência",
      () => {
        Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
      },
    ],
  ] as const) {
    test(`quando ${nome}, o link aparece em um campo selecionado e nada é confirmado`, async ({ page, baseURL }) => {
      await page.addInitScript(preparar);
      await page.goto(`${COMPARAR}?de=2016&ate=2022`);
      await expectRecorte(page, 2016, 2022);

      await recorte(page).getByRole("button", { name: "Copiar link" }).click();
      const campo = recorte(page).getByLabel(/Não foi possível copiar daqui/);
      await expect(campo).toHaveValue(`${baseURL}${COMPARAR}?de=2016&ate=2022`);
      await expect(campo).toBeFocused();
      const selecionado = await campo.evaluate((no: HTMLInputElement) => no.value.slice(no.selectionStart ?? 0, no.selectionEnd ?? 0));
      expect(selecionado).toBe(`${baseURL}${COMPARAR}?de=2016&ate=2022`);
      await expect(recorte(page).getByText("Link copiado")).toHaveCount(0);
      await expect(recorte(page).getByRole("button", { name: "Copiar link" })).toBeVisible();
    });
  }
});

test.describe("em celular", () => {
  test.use({ viewport: CELULAR, hasTouch: true });

  test("o recorte fica escrito e preso ao topo, com os filtros atrás de um botão", async ({ page }) => {
    await page.goto(`${COMPARAR}?de=2016&ate=2022&categorias=eleicoes`);
    await expectRecorte(page, 2016, 2022, ["eleicoes"]);

    const barra = recorte(page);
    await expect(barra).toContainText("2016–2022");
    await expect(barra).toContainText("eleições");
    const filtros = barra.getByRole("button", { name: /^Filtros/ });
    await expect(filtros).toHaveAttribute("aria-expanded", "false");
    await expect(barra.getByLabel("De", { exact: true })).toBeHidden();

    // Rolando a página, a barra continua à vista.
    await coluna(page, lula.slug).scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, 600);
    await expect.poll(async () => Math.round((await barra.boundingBox())!.y)).toBe(0);

    await filtros.click();
    await expect(barra.getByLabel("De", { exact: true })).toBeVisible();
    for (const controle of [
      barra.getByLabel("De", { exact: true }),
      barra.getByRole("button", { name: /^Marcos históricos/ }),
      barra.getByRole("button", { name: "Limpar filtros" }),
      barra.getByRole("button", { name: "Copiar link" }),
      filtros,
    ]) {
      expect((await controle.boundingBox())!.height, "área de toque").toBeGreaterThanOrEqual(44);
    }

    await barra.getByRole("button", { name: "Limpar filtros" }).click();
    await expectUrl(page, COMPARAR);
    await expectRecorte(page);
  });

  test("as colunas ficam uma abaixo da outra, com atalho para cada uma, e nada passa da largura", async ({ page }) => {
    await page.goto(COMPARAR);
    await expectRecorte(page);

    const [primeira, segunda] = await Promise.all(
      PESSOAS.map(async (pessoa) => (await coluna(page, pessoa.slug).boundingBox())!),
    );
    expect(primeira!.x).toBe(segunda!.x);
    expect(segunda!.y).toBeGreaterThan(primeira!.y + primeira!.height - 1);

    const atalhos = page.getByRole("navigation", { name: "Trajetórias nesta página" });
    await atalhos.getByRole("link", { name: lula.nome }).click();
    await expect(coluna(page, lula.slug).getByRole("heading", { level: 2 })).toBeInViewport();

    const { conteudo, janela } = await page.evaluate(() => ({
      conteudo: document.documentElement.scrollWidth,
      janela: window.innerWidth,
    }));
    expect(conteudo).toBeLessThanOrEqual(janela);
  });

  test("com um período escolhido, as faixas rolam até ele e mantêm o eixo de anos", async ({ page }) => {
    await page.goto(`${COMPARAR}?de=1980&ate=1990`);
    await expectRecorte(page, 1980, 1990);

    const area = page.locator("[data-lanes-scroll]");
    await area.scrollIntoViewIfNeeded();
    // O meio do período fica dentro da parte visível da faixa.
    await expect
      .poll(async () => {
        const quadro = (await area.boundingBox())!;
        const foco = (await area.locator("[data-period-focus]").boundingBox())!;
        return foco.x > quadro.x + 120 && foco.x < quadro.x + quadro.width;
      })
      .toBe(true);
    // As duas faixas rolam juntas: o mesmo eixo para as duas.
    const faixas = await page.locator("ul[aria-label^='Acontecimentos de ']").evaluateAll((nos) =>
      nos.map((no) => Math.round(no.getBoundingClientRect().left)),
    );
    expect(faixas[0]).toBe(faixas[1]);
  });
});
