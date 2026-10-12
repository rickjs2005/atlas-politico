// Fase 7: a comparação das duas trajetórias no mesmo período, com as mesmas
// categorias e a consulta no endereço. Os valores esperados saem dos arquivos
// gerados, para o teste acompanhar o conteúdo.

import { readFileSync } from "node:fs";

import { expect, test, type Locator, type Page } from "@playwright/test";

import { GAP_NOTICE, NO_DECISION, OFFICE_NOTICE, buildOverview } from "@/lib/data/overview";
import { PROPOSAL_NOTICE, PROPOSAL_PENDING, listProposals } from "@/lib/data/proposals";
import { TEMAS, TEMA_LABELS } from "@/lib/domain/decisions";

import { data } from "./jogo-apoio";

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

    // O texto que a tela escreve por conta própria: tudo o que está na página, menos o conteúdo documental, que a tela
    // só mostra (títulos de acontecimentos, cargos e filiações, documentos e citações e, nos cartões de decisão, o
    // título, os valores, a proposição e a divergência). O que sobra é a explicação de leitura, os avisos, os títulos,
    // os rótulos, as notas de cobertura e as contagens: é ali que um ranking ou uma nota apareceria. Por subtração, um
    // texto novo da tela entra na conferência sem ninguém lembrar de listá-lo.
    const proprio = (
      await page.locator("main").evaluate((main) => {
        const copia = main.cloneNode(true) as HTMLElement;
        const documental = [
          "[data-acontecimento]",
          "li[data-registro]",
          "[data-fonte]",
          "[data-decisao-cartao] > div:first-child > :is(h3, h4, h5)",
          "[data-decisao-cartao] dd",
          "[data-decisao-cartao] [data-cargo]",
          "[data-proposicoes] li",
          "[data-divergencia]",
          // As frases dos documentos registrados no TSE, com a ressalva e as fontes de cada uma.
          "[data-proposta]",
        ];
        for (const no of copia.querySelectorAll(documental.join(", "))) no.remove();
        return copia.textContent ?? "";
      })
    ).toLowerCase();
    // A subtração tirou o conteúdo, e deixou o texto da tela.
    expect(proprio).not.toContain(compartilhado.titulo.toLowerCase());
    expect(proprio).toContain("texto de referência: o texto submetido à votação não está ligado");
    expect(proprio).toContain("decisões");
    expect(proprio).toContain("como ler esta comparação");
    expect(proprio).toContain("votos, atos e atuação legislativa no mesmo tema");
    // A comparação curta e a seção das propostas são texto da tela: entram na conferência.
    expect(proprio).toContain("resumo: os cargos de cada um e o que o atlas registra");
    expect(proprio).toContain("e não uma quantidade");
    expect(proprio).toContain("o que cada documento propõe");
    for (const palavra of ["ranking", "placar", "venc", "melhor", "pior", "produtiv", "pontua", "mais ativo"]) {
      expect(proprio, palavra).not.toContain(palavra);
    }
    // "nota" e "desempenho" só aparecem para dizer o que a tela não faz.
    expect(proprio.match(/\bnota\b/g)).toHaveLength(1);
    expect(proprio).toContain("não dá nota");
    expect(proprio.match(/desempenho/g)).toHaveLength(1);
    expect(proprio).toContain("acervo, e não desempenho");
    // O aviso da amostra de decisões diz o limite, antes dos cartões.
    const avisoDaAmostra = page.locator("#decisoes [data-aviso-amostra]");
    await expect(avisoDaAmostra).toContainText("não o histórico completo");
    await expect(avisoDaAmostra).toContainText("não os equipara");
    await expect(avisoDaAmostra).toContainText("não segue o recorte de anos");
    // Nenhum mecanismo de pontuação na tela: sem medidor nem barra de progresso.
    await expect(page.locator("main").locator('meter, progress, [role="meter"], [role="progressbar"]')).toHaveCount(0);
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

// A comparação curta (os cargos de cada pessoa e o tipo de registro por cargo
// e por área) e as propostas registradas no TSE, por área. O esperado sai das
// mesmas funções que a tela usa, sobre o conteúdo publicado.
test.describe("a comparação curta e as propostas por área", () => {
  const resumoDe = (pessoaId: string) => buildOverview(data, pessoaId);
  const topo = async (alvo: Locator) => (await alvo.boundingBox())!.y;
  /** A barra do recorte, presa ao topo: o que chega por âncora tem de ficar abaixo dela. */
  const fimDaBarra = async (page: Page) => {
    const barra = (await recorte(page).boundingBox())!;
    return barra.y + barra.height;
  };

  test("o resumo vem depois das faixas e das notas, com atalho no cabeçalho, e diz o tipo de registro por cargo e por área, sem quantidade", async ({ page }) => {
    await page.goto(COMPARAR);
    const resumo = page.locator('#resumo[data-secao="resumo"]');
    await expect(resumo.getByRole("heading", { level: 2 })).toHaveText("Resumo: os cargos de cada um e o que o atlas registra");
    await expect(resumo.locator("[data-aviso-de-cargo]")).toHaveText(OFFICE_NOTICE);

    // A ordem da página: as faixas, as notas de leitura, o resumo e só então as colunas (D-82).
    const notas = await topo(page.getByRole("region", { name: "Como ler esta comparação" }));
    expect(await topo(page.getByRole("region", { name: "Linha do tempo das trajetórias" }))).toBeLessThan(notas);
    expect(notas).toBeLessThan(await topo(resumo));
    expect(await topo(resumo)).toBeLessThan(await topo(page.locator("[data-trajetoria]").first()));

    // O atalho do cabeçalho leva ao resumo, e o título dele fica abaixo da barra do recorte.
    const atalho = page.locator("[data-ir-para-o-resumo]");
    await expect(atalho).toHaveText("Para começar: resumo por cargo e por área");
    await atalho.click();
    const titulo = resumo.getByRole("heading", { level: 2 });
    await expect(titulo).toBeInViewport();
    await expect.poll(async () => (await topo(titulo)) >= (await fimDaBarra(page)), { message: "o título do resumo fica abaixo da barra" }).toBe(true);

    for (const pessoa of PESSOAS) {
      const esperado = resumoDe(pessoa.id);
      const cargos = resumo.locator(`[data-resumo-cargos="${pessoa.slug}"]`);
      await expect(cargos.getByRole("heading", { level: 4 })).toHaveText(pessoa.nome);
      await expect(cargos.locator("[data-cargo]")).toHaveCount(esperado.cargos.length);
      for (const cargo of esperado.cargos) {
        const linha = cargos.locator(`[data-cargo="${cargo.mandatoId}"]`);
        await expect(linha).toContainText(cargo.cargo);
        await expect(linha).toContainText(cargo.instituicao);
        await expect(linha).toContainText(cargo.periodo);
        await expect(linha.locator("[data-decisoes]")).toHaveAttribute("data-decisoes", cargo.naturezas.length === 0 ? "nenhuma" : cargo.naturezas.join(" "));
        // O cargo sem decisão aparece, com a frase da lacuna: não some do resumo.
        if (cargo.naturezas.length === 0) await expect(linha).toContainText(NO_DECISION);
      }
    }

    // As mesmas sete áreas para as duas pessoas, na ordem da taxonomia, e o grupo dos outros assuntos por último.
    const haSemArea = PESSOAS.some((pessoa) => resumoDe(pessoa.id).semArea.length > 0);
    const areas = await resumo.locator("[data-resumo-areas] > li").evaluateAll((nos) => nos.map((no) => no.getAttribute("data-area")));
    expect(areas).toEqual([...TEMAS, ...(haSemArea ? ["outros-assuntos"] : [])]);
    for (const tema of TEMAS) {
      await expect(resumo.locator(`[data-area="${tema}"]`).getByRole("heading", { level: 4 })).toHaveText(TEMA_LABELS[tema]);
      for (const pessoa of PESSOAS) {
        const area = resumoDe(pessoa.id).areas.find((item) => item.tema === tema)!;
        const linha = resumo.locator(`[data-area="${tema}"] [data-area-de="${pessoa.slug}"]`);
        await expect(linha).toContainText(`${pessoa.nome}: `);
        await expect(linha.locator("[data-decisoes]")).toHaveAttribute("data-decisoes", area.naturezas.length === 0 ? "nenhuma" : area.naturezas.join(" "));
        if (area.naturezas.length === 0) await expect(linha).toContainText(NO_DECISION);
        else await expect(linha.locator("a[data-decisoes]")).toHaveAttribute("href", `#tema-${tema}`);
        await expect(linha.locator("[data-propostas]")).toHaveAttribute("data-propostas", area.propostas ? "registradas" : "pendente");
        if (area.propostas) await expect(linha.locator('a[data-propostas="registradas"]')).toHaveAttribute("href", `#propostas-${tema}`);
      }
    }
    await expect(resumo.locator("[data-aviso-de-lacuna]")).toContainText(GAP_NOTICE);

    // Nenhuma quantidade: os únicos números do resumo são anos (os dos cargos e o das propostas).
    const numeros = (((await resumo.textContent()) ?? "").match(/\d+/g) ?? []).filter((numero) => !/^(19|20)\d{2}$/.test(numero));
    expect(numeros, "números que não são anos").toEqual([]);

    // Os links do resumo chegam ao tema das decisões e à área das propostas, com o título abaixo da barra.
    await resumo.locator(`[data-area="economia"] [data-area-de="${lula.slug}"] a[data-decisoes]`).click();
    await expect(page.locator("#tema-economia")).toBeInViewport();
    await expect.poll(async () => (await topo(page.locator("#tema-economia"))) >= (await fimDaBarra(page)), { message: "o título do tema fica abaixo da barra" }).toBe(true);
    await page.goto(`${COMPARAR}#propostas-economia`);
    await expect(page.locator("#propostas-economia")).toBeInViewport();
    await expect.poll(async () => (await topo(page.locator("#propostas-economia"))) >= (await fimDaBarra(page)), { message: "o título da área fica abaixo da barra" }).toBe(true);
  });

  test("as propostas por área: as mesmas sete áreas para as duas candidaturas, com a frase, a ressalva, a página do documento e nenhuma contagem", async ({ page }) => {
    await page.goto(`${COMPARAR}#propostas`);
    const propostas = page.locator('#propostas[data-secao="propostas"]');
    await expect(propostas.getByRole("heading", { level: 2 })).toHaveText("O que cada documento propõe");
    await expect.poll(async () => (await topo(propostas.getByRole("heading", { level: 2 }))) >= (await fimDaBarra(page)), { message: "o título da seção fica abaixo da barra" }).toBe(true);
    const aviso = propostas.locator("[data-aviso-de-proposta]");
    await expect(aviso).toContainText(PROPOSAL_NOTICE);
    await expect(aviso).toContainText("Não é o documento inteiro");
    await expect(aviso).toContainText("não segue o recorte de anos");

    const temas = await propostas.locator("[data-tema]").evaluateAll((nos) => nos.map((no) => no.getAttribute("data-tema")));
    expect(temas).toEqual([...TEMAS]);
    for (const pessoa of PESSOAS) {
      const dela = listProposals(data, pessoa.id);
      expect(dela.length, `propostas de ${pessoa.nome}`).toBeGreaterThan(0);
      for (const tema of TEMAS) {
        const colunaDoTema = propostas.locator(`[data-tema="${tema}"] [data-coluna-propostas="${pessoa.slug}"]`);
        const doTema = dela.filter((proposta) => proposta.tema === tema);
        // O título da coluna é só o nome: nenhuma contagem ao lado.
        await expect(colunaDoTema.getByRole("heading", { level: 4 })).toHaveText(pessoa.nome);
        await expect(colunaDoTema.locator("[data-proposta]")).toHaveCount(doTema.length);
        if (doTema.length === 0) await expect(colunaDoTema.locator('[data-propostas="pendente"]')).toHaveText(PROPOSAL_PENDING);
        for (const proposta of doTema) {
          const item = colunaDoTema.locator(`[data-proposta="${proposta.id}"]`);
          await expect(item).toContainText(proposta.texto);
          if (proposta.ressalva === null) await expect(item.locator("[data-ressalva]")).toHaveCount(0);
          else await expect(item.locator("[data-ressalva]")).toHaveText(proposta.ressalva);
        }
      }
    }
    // As duas candidaturas têm o mesmo número de frases em cada área: nenhuma coluna fica maior do que a outra.
    for (const tema of TEMAS) {
      const [a, b] = PESSOAS.map((pessoa) => listProposals(data, pessoa.id).filter((proposta) => proposta.tema === tema).length);
      expect(a, tema).toBe(b);
    }

    // A fonte de uma proposta abre no próprio cartão: o documento registrado no TSE, com a página.
    const exemplo = listProposals(data, lula.id)[0]!;
    const cartao = propostas.locator(`[data-proposta="${exemplo.id}"]`);
    await cartao.locator("summary").click();
    await expect(cartao.locator("[data-fonte] a").first()).toHaveAttribute("href", exemplo.fontes[0]!.fonte.url);
    await expect(cartao.locator("[data-fonte]").first()).toContainText(exemplo.fontes[0]!.citacao.localizacao);
    expect(exemplo.fontes[0]!.fonte.url).toMatch(/^https:\/\/[a-z.]*tse\.jus\.br\//);
    // A situação da revisão vem uma vez, no fim da seção, e é a que foi feita.
    await expect(propostas.locator("[data-revisao]")).toHaveCount(1);
    await expect(propostas.locator("[data-revisao]")).toContainText("Revisão humana pendente");
  });
});
