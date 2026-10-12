// Fase 7: perfis, páginas de acontecimento, fontes e créditos, compartilhamento,
// retorno à exploração e metodologia. Os valores esperados saem dos arquivos
// gerados, para o teste acompanhar o conteúdo.

import { readFileSync } from "node:fs";

import { expect, test, type Page } from "@playwright/test";

import { listDecisionViews, type DecisionView } from "@/lib/data/decisions";
import { COLECOES_FACTUAIS_DO_CONJUNTO } from "@/lib/domain/integrity";

import { data } from "./jogo-apoio";
import { MAP_PACKAGE } from "./map-package";

interface Citacao {
  fonteId: string;
  localizacao: string;
  evidencia: string;
}
interface Periodo {
  inicio: { tipo: string; valor?: string };
  fim: { tipo: string; valor?: string };
}
interface EventRecord {
  id: string;
  slug: string;
  titulo: string;
  resumo: string;
  contexto: string;
  categoria: string;
  pessoaIds: string[];
  data: { valor: string; precisao: "ano" | "mes" | "dia" };
  fontes: Citacao[];
  localizacao: { tipo: "lugares"; lugarIds: string[] } | { tipo: "nacional" | "desconhecida" };
}

const conjunto = JSON.parse(readFileSync("generated/dados/conjunto.json", "utf8")) as {
  edicao: {
    versao: string;
    dataDeCorte: string;
    alteracoes: { data: string; descricao: string }[];
    cobertura: { pessoaId: string; observacao?: string }[];
  };
  acontecimentos: EventRecord[];
  pessoas: { id: string; slug: string; nome: string; resumo: string; retratoId: string | null; fontes: Citacao[] }[];
  mandatos: { id: string; pessoaId: string; cargo: string; periodo: Periodo; fontes: Citacao[] }[];
  filiacoes: { id: string; pessoaId: string; partido: { sigla: string }; periodo: Periodo; fontes: Citacao[] }[];
  lugares: { id: string; nome: string }[];
  fontes: { id: string; titulo: string; autoria: string; url: string }[];
  imagens: { id: string; credito: string; autoria: string; origem: string; condicoesDeUso: string }[];
  // As coleções de decisões: as citações de todas e, das votações, dos votos e dos atos, o que o cartão mostra.
  proposicoes: { fontes: Citacao[] }[];
  votacoes: { id: string; objeto: { divergenciaDocumentada: string | null; textoReferencia: { fonteId: string } | null }; fontes: Citacao[] }[];
  votos: { id: string; votacaoId: string; pessoaId: string; situacao: { tipo: string }; fontes: Citacao[] }[];
  atosExecutivos: { id: string; atribuicao: { pessoaId: string }; dispositivosAlvo?: string[]; fontes: Citacao[] }[];
  coberturaPolitica: { fontes: Citacao[] }[];
  identidadesInstitucionais: { fontes: Citacao[] }[];
  // O que a edição 0.3.0 trouxe: a atuação legislativa e o conteúdo do jogo.
  atuacoesLegislativas: { id: string; fontes: Citacao[] }[];
  propostasEleitorais: { id: string; fontes: Citacao[] }[];
  fatosBiograficos: { id: string; fontes: Citacao[] }[];
  conceitos: { id: string; fontes: Citacao[] }[];
  fasesDoJogo: { id: string }[];
};

const flavio = conjunto.pessoas.find((pessoa) => pessoa.slug === "flavio-bolsonaro")!;
const lula = conjunto.pessoas.find((pessoa) => pessoa.slug === "lula")!;
const PESSOAS = [flavio, lula];
const yearOf = (item: EventRecord) => Number(item.data.valor.slice(0, 4));
const eventosDe = (pessoaId: string) => conjunto.acontecimentos.filter((item) => item.pessoaIds.includes(pessoaId));
const urlDa = (fonteId: string) => conjunto.fontes.find((item) => item.id === fonteId)!.url;
const compartilhado = conjunto.acontecimentos.find((item) => item.pessoaIds.length > 1)!;
/** Um acontecimento de Lula com lugar e dia conhecidos, dentro de um recorte com mais de um registro. */
const RECORTE = { de: 2016, ate: 2019, categoria: "marcos-historicos" };
const noRecorte = eventosDe(lula.id).filter(
  (item) => yearOf(item) >= RECORTE.de && yearOf(item) <= RECORTE.ate && item.categoria === RECORTE.categoria,
);
const alvo = noRecorte.find((item) => item.localizacao.tipo === "lugares")!;
const CONSULTA = `de=${RECORTE.de}&ate=${RECORTE.ate}&categorias=${RECORTE.categoria}`;

const porExtenso = (data: string) =>
  new Date(`${data}T12:00:00Z`).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
const corte = porExtenso(conjunto.edicao.dataDeCorte);
const escapeHtml = (texto: string) =>
  texto.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const CELULAR = { width: 390, height: 844 };

const perfil = (page: Page, slug: string) => page.locator(`[data-perfil="${slug}"]`);
const lista = (page: Page) => page.getByRole("region", { name: "Acontecimentos", exact: true });
const leitura = (page: Page) => page.getByRole("region", { name: "Leitura" });
const retorno = (page: Page) => page.getByRole("navigation", { name: "Voltar à exploração" });
const pagina = (slug: string) => `/acontecimentos/${slug}/`;

const endereco = (page: Page) => {
  const url = new URL(page.url());
  return url.pathname + url.search + url.hash;
};
const expectUrl = (page: Page, esperado: string) =>
  expect.poll(() => endereco(page), { message: "endereço" }).toBe(esperado);

test.describe("perfil, dentro da exploração", () => {
  for (const pessoa of PESSOAS) {
    test(`${pessoa.nome}: apresentação, cargos e partidos com fontes, cobertura, revisão, edição e crédito`, async ({ page }) => {
      await page.goto(`/politicos/${pessoa.slug}/`);
      const painel = perfil(page, pessoa.slug);

      await expect(painel.getByRole("heading", { name: pessoa.nome })).toBeVisible();
      await expect(painel).toContainText(pessoa.resumo);

      // Cargos e partidos: todos os registros da pessoa, cada um com as próprias fontes.
      const mandatos = conjunto.mandatos.filter((item) => item.pessoaId === pessoa.id);
      const filiacoes = conjunto.filiacoes.filter((item) => item.pessoaId === pessoa.id);
      await expect(painel.locator('[data-secao="cargos"] li[data-registro]')).toHaveCount(mandatos.length);
      await expect(painel.locator('[data-secao="partidos"] li[data-registro]')).toHaveCount(filiacoes.length);
      for (const registro of [...mandatos, ...filiacoes]) {
        const item = painel.locator(`li[data-registro="${registro.id}"]`);
        // O que está em curso na data de corte é marcado; o que tem fim documentado, não.
        await expect(item.getByText("em curso", { exact: true })).toHaveCount(registro.periodo.fim.tipo === "em-curso" ? 1 : 0);
        await expect(item.locator("summary")).toContainText(
          registro.fontes.length === 1 ? "1 fonte" : `${registro.fontes.length} fontes`,
        );
      }
      const primeiro = mandatos[0]!;
      const fontes = painel.locator(`li[data-registro="${primeiro.id}"] details`);
      await fontes.locator("summary").click();
      expect(await fontes.locator("ol a").evaluateAll((nos) => nos.map((no) => no.getAttribute("href")))).toEqual(
        primeiro.fontes.map((citacao) => urlDa(citacao.fonteId)),
      );
      await expect(fontes).toContainText(primeiro.fontes[0]!.evidencia);

      // Cobertura, fontes do texto de apresentação, revisão e edição.
      const cobertura = conjunto.edicao.cobertura.find((item) => item.pessoaId === pessoa.id)!;
      await expect(painel.locator('[data-secao="cobertura"]')).toContainText(cobertura.observacao!);
      const doPerfil = painel.locator('[data-secao="fontes"]');
      await expect(doPerfil.getByRole("heading")).toContainText(`(${pessoa.fontes.length})`);
      expect(await doPerfil.locator("ol a").evaluateAll((nos) => nos.map((no) => no.getAttribute("href")))).toEqual(
        pessoa.fontes.map((citacao) => urlDa(citacao.fonteId)),
      );
      await expect(painel).toContainText("Revisão humana pendente");
      await expect(painel).toContainText(`Edição ${conjunto.edicao.versao} · registros até ${corte}`);

      // Retrato com crédito, origem e caminho para as condições de uso.
      const imagem = conjunto.imagens.find((item) => item.id === pessoa.retratoId)!;
      const credito = painel.locator(`[data-credito="${imagem.id}"]`);
      await expect(credito).toContainText(imagem.credito);
      await expect(credito.getByRole("link", { name: /Origem/ })).toHaveAttribute("href", imagem.origem);
      await expect(credito.getByRole("link", { name: "Condições de uso" })).toHaveAttribute("href", "/metodologia/#creditos");

      // A página leva título e descrição do conteúdo revisado.
      await expect(page).toHaveTitle(new RegExp(`^${pessoa.nome} · `));
      await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", pessoa.resumo);
    });
  }

  test("os dois perfis têm as mesmas seções, na mesma ordem", async ({ page }) => {
    const secoes: (string | null)[][] = [];
    for (const pessoa of PESSOAS) {
      await page.goto(`/politicos/${pessoa.slug}/`);
      await expect(perfil(page, pessoa.slug)).toBeVisible();
      secoes.push(
        await perfil(page, pessoa.slug)
          .locator("[data-secao]")
          .evaluateAll((nos) => nos.map((no) => no.getAttribute("data-secao"))),
      );
    }
    expect(secoes[0]).toEqual(["cargos", "partidos", "cobertura", "fontes"]);
    expect(secoes[1]).toEqual(secoes[0]);
  });

  test("do perfil para a comparação, com o mesmo recorte", async ({ page }) => {
    const comparar = (slug: string) => perfil(page, slug).getByRole("link", { name: "Comparar no mesmo recorte" });

    await page.goto("/politicos/lula/");
    await expect(comparar("lula")).toHaveAttribute("href", "/comparar/");

    await page.goto("/politicos/lula/?ate=2015&categorias=eleicoes");
    await expect(comparar("lula")).toHaveAttribute("href", "/comparar/?ate=2015&categorias=eleicoes");

    // "Até 2015" de quem é coberto desde 2002 é de 2002 a 2015, e não desde o começo da escala.
    await page.goto("/politicos/flavio-bolsonaro/?ate=2015&categorias=eleicoes");
    await expect(comparar("flavio-bolsonaro")).toHaveAttribute("href", "/comparar/?de=2002&ate=2015&categorias=eleicoes");
    await comparar("flavio-bolsonaro").click();
    await expectUrl(page, "/comparar/?de=2002&ate=2015&categorias=eleicoes");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Comparar trajetórias");
  });

  test("copiar link reproduz o recorte e a seleção", async ({ page, context, baseURL }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const consulta = `/politicos/lula/?${CONSULTA}`;
    await page.goto(consulta);
    await expect(lista(page).locator("li[data-acontecimento]")).toHaveCount(noRecorte.length);

    // Sem seleção: o recorte.
    await lista(page).getByRole("button", { name: "Copiar link desta consulta" }).click();
    await expect(lista(page).getByRole("button", { name: "Link copiado" })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(`${baseURL}${consulta}`);

    // Com um acontecimento aberto: o recorte e a seleção.
    await lista(page).getByRole("button", { name: alvo.titulo }).click();
    await leitura(page).getByRole("button", { name: "Copiar link desta consulta" }).click();
    await expect(leitura(page).getByRole("button", { name: "Link copiado" })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      `${baseURL}${consulta}&acontecimento=${alvo.slug}`,
    );
  });
});

test.describe("perfil em celular", () => {
  test.use({ viewport: CELULAR, hasTouch: true });

  test("a aba Perfil mostra o perfil completo, com área de toque nas fontes e nos caminhos", async ({ page }) => {
    await page.goto("/politicos/flavio-bolsonaro/");
    await page.getByRole("group", { name: "Vista" }).getByRole("button", { name: "Perfil", exact: true }).click();
    const painel = perfil(page, "flavio-bolsonaro");
    await expect(painel.getByRole("heading", { name: flavio.nome })).toBeVisible();

    for (const controle of [
      painel.getByRole("link", { name: "Comparar no mesmo recorte" }),
      painel.getByRole("button", { name: "Copiar link desta consulta" }),
      painel.getByRole("link", { name: "Metodologia e fontes" }),
      painel.locator('[data-secao="cargos"] summary').first(),
    ]) {
      expect((await controle.boundingBox())!.height, "área de toque").toBeGreaterThanOrEqual(44);
    }
    const { conteudo, janela } = await page.evaluate(() => ({
      conteudo: document.documentElement.scrollWidth,
      janela: window.innerWidth,
    }));
    expect(conteudo).toBeLessThanOrEqual(janela);
  });
});

test.describe("página do acontecimento", () => {
  const soOAno = conjunto.acontecimentos.find((item) => item.data.precisao === "ano")!;

  for (const acontecimento of [alvo, soOAno, compartilhado]) {
    test(`abre por link direto, com o conteúdo do registro: ${acontecimento.slug}`, async ({ page }) => {
      await page.goto(pagina(acontecimento.slug));
      const artigo = page.locator("article");

      await expect(page.getByRole("heading", { level: 1 })).toHaveText(acontecimento.titulo);
      await expect(artigo.locator("header time")).toHaveAttribute("datetime", acontecimento.data.valor);
      // A data parcial diz o que falta; a completa não ganha aviso.
      const avisos = { ano: "Só o ano está documentado.", mes: "O dia não está documentado.", dia: null };
      const aviso = avisos[acontecimento.data.precisao];
      if (aviso === null) await expect(artigo.locator("header")).not.toContainText("documentado");
      else await expect(artigo.locator("header")).toContainText(aviso);

      // Resumo e contexto, no texto do registro.
      await expect(page.getByRole("region", { name: "Resumo" })).toContainText(acontecimento.resumo);
      await expect(page.getByRole("region", { name: "Contexto" })).toContainText(acontecimento.contexto);

      // Pessoas e lugares associados.
      const ficha = page.getByRole("complementary", { name: "Ficha do acontecimento" });
      for (const pessoaId of acontecimento.pessoaIds) {
        await expect(ficha.getByRole("link", { name: conjunto.pessoas.find((item) => item.id === pessoaId)!.nome })).toBeVisible();
      }
      if (acontecimento.localizacao.tipo === "lugares") {
        for (const lugarId of acontecimento.localizacao.lugarIds) {
          await expect(ficha).toContainText(conjunto.lugares.find((item) => item.id === lugarId)!.nome);
        }
      } else {
        await expect(ficha).toContainText(/Abrangência nacional|não está documentado/);
      }
      // A nota dos cargos acompanha a precisão da data: com só o ano documentado, ela não fala em data.
      const quando = { ano: "no ano", mes: "no mês", dia: "na data" }[acontecimento.data.precisao];
      await expect(ficha).toContainText(`Cargos e funções registrados no atlas ${quando} do acontecimento.`);

      // Fontes: os endereços, o trecho e o que ele sustenta são os do registro, na mesma ordem.
      const fontes = page.getByRole("region", { name: /^Fontes/ });
      await expect(fontes.getByRole("heading")).toContainText(`(${acontecimento.fontes.length})`);
      expect(await fontes.locator("ol a").evaluateAll((nos) => nos.map((no) => no.getAttribute("href")))).toEqual(
        acontecimento.fontes.map((citacao) => urlDa(citacao.fonteId)),
      );
      const itens = fontes.locator("ol > li");
      for (const [indice, citacao] of acontecimento.fontes.entries()) {
        const fonte = conjunto.fontes.find((item) => item.id === citacao.fonteId)!;
        await expect(itens.nth(indice)).toContainText(fonte.titulo);
        await expect(itens.nth(indice)).toContainText(fonte.autoria);
        await expect(itens.nth(indice)).toContainText(`Onde: ${citacao.localizacao}`);
        await expect(itens.nth(indice)).toContainText(`O que sustenta: ${citacao.evidencia}`);
      }

      // Revisão, edição, metodologia e correção.
      const revisao = page.getByRole("region", { name: "Revisão e edição" });
      await expect(revisao).toContainText("Revisão humana pendente");
      await expect(revisao).toContainText(`Edição ${conjunto.edicao.versao} · registros até ${corte}`);
      await expect(revisao.getByRole("link", { name: "Como o atlas é feito" })).toHaveAttribute("href", "/metodologia/");
      await expect(revisao.getByRole("link", { name: "Sugerir uma correção" })).toHaveAttribute(
        "href",
        `/metodologia/?acontecimento=${acontecimento.slug}#correcao`,
      );

      // Créditos dos materiais usados na página.
      const creditos = ficha.locator('[data-secao="creditos"]');
      for (const pessoaId of acontecimento.pessoaIds) {
        const pessoa = conjunto.pessoas.find((item) => item.id === pessoaId)!;
        const imagem = conjunto.imagens.find((item) => item.id === pessoa.retratoId)!;
        await expect(creditos).toContainText(imagem.credito);
        await expect(creditos.locator(`a[href="${imagem.origem}"]`)).toHaveCount(1);
      }
      await expect(creditos.getByText(/Mapa: contornos do Natural Earth/)).toHaveCount(
        acontecimento.localizacao.tipo === "lugares" ? 1 : 0,
      );

      // Caminhos previsíveis para seguir no atlas.
      const continuar = page.getByRole("navigation", { name: "Continuar no atlas" });
      for (const pessoaId of acontecimento.pessoaIds) {
        const pessoa = conjunto.pessoas.find((item) => item.id === pessoaId)!;
        await expect(continuar.getByRole("link", { name: `Ver na trajetória de ${pessoa.nome}` })).toHaveAttribute(
          "href",
          `/politicos/${pessoa.slug}/?acontecimento=${acontecimento.slug}`,
        );
      }
      await expect(continuar.getByRole("link", { name: "Comparar as duas trajetórias" })).toHaveAttribute("href", "/comparar/");
      await expect(continuar.getByRole("link", { name: "Metodologia e fontes" })).toHaveAttribute("href", "/metodologia/");

      // Título e descrição são o texto do registro.
      await expect(page).toHaveTitle(new RegExp(`^${acontecimento.titulo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} · `));
      await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", acontecimento.resumo);
    });
  }

  test("todo acontecimento publicado tem página, e os links de fonte são os do registro", async ({ request }) => {
    test.setTimeout(120_000);
    for (const acontecimento of conjunto.acontecimentos) {
      const resposta = await request.get(pagina(acontecimento.slug));
      expect(resposta.status(), acontecimento.slug).toBe(200);
      const html = await resposta.text();
      expect(html, acontecimento.slug).toContain(escapeHtml(acontecimento.titulo));
      for (const citacao of acontecimento.fontes) {
        expect(html, `${acontecimento.slug}: ${citacao.fonteId}`).toContain(`href="${escapeHtml(urlDa(citacao.fonteId))}"`);
      }
      // Nenhum link de fonte que não seja do registro.
      const externos = [...html.matchAll(/<a href="(https?:[^"]+)" target="_blank"/g)].map((achado) => achado[1]);
      const esperados = new Set([
        ...acontecimento.fontes.map((citacao) => escapeHtml(urlDa(citacao.fonteId))),
        ...conjunto.imagens.map((imagem) => escapeHtml(imagem.origem)),
      ]);
      for (const link of externos) expect(esperados.has(link!), `${acontecimento.slug}: ${link}`).toBe(true);
    }
  });

  test("a leitura não depende do mapa", async ({ page }) => {
    await page.route(MAP_PACKAGE, (route) => route.abort());
    await page.goto(pagina(alvo.slug));

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(alvo.titulo);
    await expect(page.getByRole("region", { name: "Resumo" })).toContainText(alvo.resumo);
    await expect(page.getByRole("region", { name: /^Fontes/ }).locator("ol > li")).toHaveCount(alvo.fontes.length);
    // No lugar do mapa, a lista de lugares.
    await expect(page.locator("[data-map-fallback]")).toBeVisible();
    await expect(page.locator(".maplibregl-canvas")).toHaveCount(0);
  });

  test("slug que não existe, ou que é de um rascunho, responde 404 com a página do atlas", async ({ page }) => {
    const rascunhos = JSON.parse(readFileSync("content/drafts/acontecimentos.json", "utf8")) as { slug: string }[];
    expect(rascunhos.length, "rascunhos no conteúdo").toBeGreaterThan(0);

    for (const slug of ["nao-existe", rascunhos[0]!.slug]) {
      const resposta = await page.goto(pagina(slug));
      expect(resposta!.status(), slug).toBe(404);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Este endereço não está no atlas");
    }
  });
});

test.describe("retorno e compartilhamento", () => {
  test("acesso direto, sem contexto: a exploração de cada pessoa, com o acontecimento aberto", async ({ page }) => {
    await page.goto(pagina(compartilhado.slug));

    await expect(retorno(page).getByRole("link")).toHaveCount(PESSOAS.length);
    for (const pessoa of PESSOAS) {
      const link = retorno(page).getByRole("link", { name: `Trajetória de ${pessoa.nome}` });
      await expect(link).toHaveAttribute("href", `/politicos/${pessoa.slug}/?acontecimento=${compartilhado.slug}`);
      await expect(link).not.toContainText("recorte de antes");
    }
    await expect(retorno(page).getByRole("link", { name: /Voltar à comparação/ })).toHaveCount(0);

    await retorno(page).getByRole("link", { name: `Trajetória de ${lula.nome}` }).click();
    await expectUrl(page, `/politicos/lula/?acontecimento=${compartilhado.slug}`);
    await expect(leitura(page).getByRole("heading", { name: compartilhado.titulo })).toBeVisible();
  });

  test("vindo da exploração, o retorno devolve pessoa, período, categorias e seleção", async ({ page }) => {
    const origem = `/politicos/lula/?${CONSULTA}&acontecimento=${alvo.slug}`;
    await page.goto(origem);
    await expect(leitura(page).getByRole("heading", { name: alvo.titulo })).toBeVisible();

    await leitura(page).getByRole("link", { name: "Abrir a página do acontecimento" }).click();
    await expectUrl(page, `${pagina(alvo.slug)}?${CONSULTA}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(alvo.titulo);

    const volta = retorno(page).getByRole("link", { name: `Trajetória de ${lula.nome}` });
    await expect(volta).toContainText("com o recorte de antes: 2016–2019 · marcos históricos");
    await expect(volta).toHaveAttribute("href", origem);
    await volta.click();

    await expectUrl(page, origem);
    await expect(lista(page).locator("li[data-acontecimento]")).toHaveCount(noRecorte.length);
    await expect(lista(page).getByRole("button", { name: alvo.titulo })).toHaveAttribute("aria-pressed", "true");
    await expect(leitura(page).getByRole("heading", { name: alvo.titulo })).toBeVisible();
  });

  test("o retorno com o recorte não depende do histórico: vale em uma aba nova", async ({ page }) => {
    // Primeira página da aba: não há para onde voltar no histórico.
    await page.goto(`${pagina(alvo.slug)}?${CONSULTA}`);

    await expect(retorno(page).getByRole("link", { name: `Trajetória de ${lula.nome}` })).toHaveAttribute(
      "href",
      `/politicos/lula/?${CONSULTA}&acontecimento=${alvo.slug}`,
    );
    // Recarregar mantém o contexto, que está no endereço.
    await page.reload();
    await expect(retorno(page).getByRole("link", { name: `Trajetória de ${lula.nome}` })).toContainText("recorte de antes");
  });

  test("contexto inválido ou que não contém o acontecimento é descartado, e o retorno continua abrindo o registro", async ({ page }) => {
    const simples = `/politicos/lula/?acontecimento=${alvo.slug}`;
    const link = () => retorno(page).getByRole("link", { name: `Trajetória de ${lula.nome}` });

    // Período que não contém o acontecimento.
    await page.goto(`${pagina(alvo.slug)}?de=2020&ate=2024`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(alvo.titulo);
    await expect(link()).toHaveAttribute("href", simples);
    // Categoria que não é a dele.
    await page.goto(`${pagina(alvo.slug)}?categorias=eleicoes`);
    await expect(link()).toHaveAttribute("href", simples);
    // Parâmetros inválidos.
    await page.goto(`${pagina(alvo.slug)}?de=abcd&categorias=inventada&origem=outra`);
    await expect(link()).toHaveAttribute("href", simples);
    await expect(retorno(page).getByRole("link", { name: /Voltar à comparação/ })).toHaveCount(0);
  });

  test("o acontecimento das duas pessoas devolve o recorte ajustado à cobertura de cada uma", async ({ page }) => {
    await page.goto(`${pagina(compartilhado.slug)}?de=1990&categorias=${compartilhado.categoria}&origem=comparar`);

    await expect(retorno(page).getByRole("link", { name: /Voltar à comparação/ })).toHaveAttribute(
      "href",
      `/comparar/?de=1990&categorias=${compartilhado.categoria}`,
    );
    await expect(retorno(page).getByRole("link", { name: `Trajetória de ${lula.nome}` })).toHaveAttribute(
      "href",
      `/politicos/lula/?de=1990&categorias=${compartilhado.categoria}&acontecimento=${compartilhado.slug}`,
    );
    // A cobertura de Flávio Bolsonaro começa em 2002: "desde 1990" é todo o período dele.
    await expect(retorno(page).getByRole("link", { name: `Trajetória de ${flavio.nome}` })).toHaveAttribute(
      "href",
      `/politicos/flavio-bolsonaro/?categorias=${compartilhado.categoria}&acontecimento=${compartilhado.slug}`,
    );
  });

  test("copiar link copia o endereço da página, sem o contexto de quem chegou", async ({ page, context, baseURL }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto(`${pagina(alvo.slug)}?${CONSULTA}`);

    const cabecalho = page.locator("article header");
    await expect(cabecalho.getByText("Link copiado")).toHaveCount(0);
    await cabecalho.getByRole("button", { name: "Copiar link" }).click();
    await expect(cabecalho.getByRole("button", { name: "Link copiado" })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(`${baseURL}${pagina(alvo.slug)}`);
  });

  test("sem conseguir copiar, a página oferece o link em um campo selecionado", async ({ page, baseURL }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText: () => Promise.reject(new Error("recusado")) },
      });
    });
    await page.goto(pagina(alvo.slug));

    const cabecalho = page.locator("article header");
    await cabecalho.getByRole("button", { name: "Copiar link" }).click();
    const campo = cabecalho.getByLabel(/Não foi possível copiar daqui/);
    await expect(campo).toHaveValue(`${baseURL}${pagina(alvo.slug)}`);
    await expect(campo).toBeFocused();
    await expect(cabecalho.getByText("Link copiado")).toHaveCount(0);
  });
});

test.describe("datas e fuso do aparelho", () => {
  // As datas do atlas são datas civis: valem como estão no registro, onde quer
  // que a pessoa esteja. Kiritimati (UTC+14) e Pago Pago (UTC-11) são os
  // extremos do calendário: o mesmo instante cai em dias diferentes nos dois.
  const FUSOS = ["Pacific/Kiritimati", "America/Sao_Paulo", "Pacific/Pago_Pago"];

  test("lista, acontecimento, comparação e metodologia mostram as mesmas datas em fusos extremos", async ({ browser, baseURL }) => {
    expect(alvo.data.precisao, "o acontecimento de referência tem dia conhecido").toBe("dia");
    expect(alvo.data.valor.endsWith("-01"), "e não cai no dia 1º, que a tela escreve com ordinal").toBe(false);

    const leituras: string[] = [];
    for (const fuso of FUSOS) {
      const contexto = await browser.newContext({
        baseURL,
        timezoneId: fuso,
        reducedMotion: "reduce",
        viewport: { width: 1440, height: 900 },
      });
      const page = await contexto.newPage();
      const partes: string[] = [];

      await page.goto("/politicos/lula/");
      expect(await page.evaluate(() => Intl.DateTimeFormat().resolvedOptions().timeZone), "fuso do navegador").toBe(fuso);
      await expect(lista(page).locator("li[data-acontecimento]")).toHaveCount(eventosDe(lula.id).length);
      partes.push(await lista(page).innerText());

      await page.goto(pagina(alvo.slug));
      const data = page.locator(`time[datetime="${alvo.data.valor}"]`).first();
      await expect(data).toHaveText(porExtenso(alvo.data.valor));
      partes.push(await page.locator("main").locator("time").allInnerTexts().then((textos) => textos.join(" | ")));

      await page.goto("/comparar/");
      await expect(page.locator(`[data-trajetoria="${lula.slug}"] li[data-acontecimento]`)).toHaveCount(
        eventosDe(lula.id).length,
      );
      partes.push(await page.locator("main").innerText());

      await page.goto("/metodologia/");
      await expect(page.locator(`[data-edicao="${conjunto.edicao.versao}"]`)).toContainText(corte);
      partes.push(await page.locator("main").innerText());

      leituras.push(partes.join("\n---\n"));
      await contexto.close();
    }

    expect(leituras[1], `${FUSOS[1]} e ${FUSOS[0]}`).toBe(leituras[0]);
    expect(leituras[2], `${FUSOS[2]} e ${FUSOS[0]}`).toBe(leituras[0]);
  });
});

test.describe("metodologia", () => {
  const METODOLOGIA = "/metodologia/";
  const modelo = (page: Page) => page.getByLabel(/^Modelo de sugestão/);

  test("explica objetivo, seleção, fontes, revisão, datas, lugares, lacunas, edição e correção", async ({ page }) => {
    await page.goto(METODOLOGIA);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Metodologia");

    const secoes = [
      ["objetivo", "Objetivo e escopo"],
      ["selecao", "Seleção dos acontecimentos"],
      ["registros", "Decisões, propostas e conteúdo do jogo"],
      ["fontes", "Fontes"],
      ["revisao", "Revisão"],
      ["datas", "Datas"],
      ["lugares", "Lugares"],
      ["comparacao", "Lacunas e limites da comparação"],
      ["edicao", "Edição e atualização"],
      ["correcao", "Como sugerir uma correção"],
      ["creditos", "Créditos"],
      ["catalogo", "Fontes desta edição"],
    ] as const;
    const indice = page.getByRole("navigation", { name: "Nesta página" });
    for (const [id, titulo] of secoes) {
      await expect(page.locator(`section#${id}`).getByRole("heading", { level: 2 })).toHaveText(titulo);
      await expect(indice.getByRole("link", { name: titulo, exact: true })).toHaveAttribute("href", `#${id}`);
    }

    // Os números são os da edição.
    await expect(page.locator("#objetivo [data-numeros]")).toContainText(
      `${conjunto.acontecimentos.length} acontecimentos, ${conjunto.mandatos.length} cargos e funções, ${conjunto.filiacoes.length} filiações partidárias e ${conjunto.fontes.length} fontes`,
    );
    // As citações são as de todas as coleções factuais da edição, pela lista do domínio: as das decisões, das propostas,
    // dos fatos biográficos e dos termos entram na conta. A fase do jogo não cita documento por conta própria.
    const colecoes = conjunto as unknown as Record<string, { fontes: Citacao[] }[]>;
    const citacoes = COLECOES_FACTUAIS_DO_CONJUNTO.filter((colecao) => colecao !== "fasesDoJogo").reduce(
      (total, colecao) => total + colecoes[colecao]!.reduce((soma, registro) => soma + registro.fontes.length, 0),
      0,
    );
    await expect(page.locator("#fontes")).toContainText(`${conjunto.fontes.length} documentos e ${citacoes} citações`);
    // Os outros tipos de registro, com o que cada um é, e os números deles.
    const decisoes = PESSOAS.reduce((total, pessoa) => total + listDecisionViews(data, pessoa.id).length, 0);
    await expect(page.locator("#objetivo [data-numeros-dos-registros]")).toContainText(
      `${decisoes} decisões documentadas, ${conjunto.propostasEleitorais.length} propostas eleitorais, ${conjunto.fatosBiograficos.length} fatos biográficos, ${conjunto.conceitos.length} termos explicados e ${conjunto.fasesDoJogo.length} fases do jogo`,
    );
    const tipos = page.locator("#registros [data-tipos-de-registro] > li");
    await expect(tipos).toHaveCount(7);
    await expect(tipos.nth(0)).toContainText("o voto nominal de um parlamentar, o ato do Executivo");
    await expect(tipos.nth(0)).toContainText("a atuação legislativa (autoria ou relatoria de uma matéria)");
    await expect(page.locator("#registros")).toContainText("Propor ou relatar não é votar.");
    await expect(page.locator("#registros")).toContainText("Dizem o que o documento propõe: não são ato, voto nem resultado.");
    await expect(page.locator("#registros")).toContainText("Material de campanha não é fonte.");
    await expect(page.locator("#registros")).toContainText("nenhuma pergunta pede opinião nem juízo sobre as pessoas");
    await expect(page.locator("#selecao tbody tr")).toHaveCount(5);

    // A revisão descrita é a que foi feita.
    const revisao = page.locator("#revisao");
    await expect(revisao.locator('[data-revisao="assistida-por-ia"]')).toBeVisible();
    await expect(revisao).toContainText("Toda a conferência foi assistida por IA");
    await expect(revisao).toContainText("Nenhuma pessoa revisou este conjunto.");
    await expect(revisao).toContainText("Não prova que o texto do atlas o interpreta bem");
    await expect(revisao.locator('[data-revisao="humana"]')).toHaveCount(0);

    // Versão, data de corte, alterações e cobertura de cada pessoa.
    const edicao = page.locator("#edicao");
    await expect(edicao.locator(`[data-edicao="${conjunto.edicao.versao}"]`)).toContainText(corte);
    await expect(edicao.locator("[data-alteracoes] > li")).toHaveCount(conjunto.edicao.alteracoes.length);
    await expect(edicao).toContainText(conjunto.edicao.alteracoes[0]!.descricao);
    for (const pessoa of PESSOAS) {
      const cobertura = conjunto.edicao.cobertura.find((item) => item.pessoaId === pessoa.id)!;
      await expect(page.locator("#comparacao [data-cobertura]")).toContainText(pessoa.nome);
      await expect(page.locator("#comparacao [data-cobertura]")).toContainText(cobertura.observacao!);
    }
    await expect(page.locator("#comparacao")).toContainText("Não mede atividade, produtividade nem desempenho");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /como sugerir uma correção/);
  });

  test("o catálogo traz todas as fontes da edição, com os endereços publicados", async ({ page }) => {
    await page.goto(METODOLOGIA);
    const catalogo = page.locator(`[data-catalogo="${conjunto.fontes.length}"]`);

    const listadas = await catalogo.locator("li[data-fonte]").evaluateAll((nos) =>
      nos.map((no) => ({ id: no.getAttribute("data-fonte"), href: no.querySelector("a")?.getAttribute("href") })),
    );
    expect(listadas).toHaveLength(conjunto.fontes.length);
    for (const fonte of conjunto.fontes) {
      expect(listadas.find((item) => item.id === fonte.id)?.href, fonte.id).toBe(fonte.url);
    }
    // Cada fonte diz quem publicou e quantos registros a citam.
    const exemplo = conjunto.fontes[0]!;
    const item = catalogo.locator(`li[data-fonte="${exemplo.id}"]`);
    await expect(item).toContainText(exemplo.autoria);
    await expect(item).toContainText(/Citada em \d+ registros?/);
  });

  test("créditos das imagens com autoria, condições de uso e origem", async ({ page }) => {
    await page.goto(`${METODOLOGIA}#creditos`);
    for (const imagem of conjunto.imagens) {
      const item = page.locator(`#creditos [data-imagem="${imagem.id}"]`);
      await expect(item).toContainText(imagem.credito);
      await expect(item).toContainText(`Autoria: ${imagem.autoria}`);
      await expect(item).toContainText(imagem.condicoesDeUso);
      await expect(item.getByRole("link", { name: /Página de origem/ })).toHaveAttribute("href", imagem.origem);
    }
    await expect(page.locator("#creditos")).toContainText("Natural Earth, domínio público");
  });

  test("sem canal configurado, a página diz que está pendente e oferece o modelo para copiar", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto(`${METODOLOGIA}#correcao`);
    const correcao = page.locator("#correcao");

    await expect(correcao.locator('[data-canal="pendente"]')).toContainText("Canal ainda não definido.");
    await expect(correcao.locator('[data-canal="definido"]')).toHaveCount(0);
    for (const campo of ["Link do acontecimento:", "Informação a corrigir:", "Fonte proposta:"]) {
      await expect(modelo(page)).toHaveValue(new RegExp(campo));
    }
    await expect(modelo(page)).toHaveValue(/\(cole aqui o link da página do acontecimento\)/);
    await expect(modelo(page)).toHaveValue(new RegExp(`Edição consultada: ${conjunto.edicao.versao.replace(/\./g, "\\.")}`));

    await expect(correcao.getByText("Copiado para a área de transferência.")).toHaveCount(0);
    await correcao.getByRole("button", { name: "Copiar o modelo" }).click();
    await expect(correcao.getByRole("button", { name: "Modelo copiado" })).toBeVisible();
    // A área de transferência do sistema pode trocar o fim de linha.
    const copiado = (await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, "\n");
    expect(copiado).toBe(await modelo(page).inputValue());
  });

  test("vindo de um acontecimento, o modelo já traz o link e o título do registro", async ({ page, baseURL }) => {
    await page.goto(pagina(alvo.slug));
    await page.getByRole("link", { name: "Sugerir uma correção" }).click();
    await expectUrl(page, `/metodologia/?acontecimento=${alvo.slug}#correcao`);

    await expect(modelo(page)).toHaveValue(new RegExp(`Link do acontecimento: ${baseURL}${pagina(alvo.slug)}`));
    await expect(modelo(page)).toHaveValue(new RegExp(`Registro: ${alvo.titulo}`));
    await expect(page.locator(`#correcao [data-modelo="${alvo.slug}"]`)).toBeVisible();
    await expect(page.locator("#correcao")).toBeInViewport();

    // Slug que não é de um acontecimento publicado não entra no modelo. A troca é feita com a
    // página já lendo o endereço: no HTML do build o modelo ainda não leu, e a conferência
    // passaria antes da hora.
    await page.evaluate(() => history.replaceState(null, "", "?acontecimento=nao-existe#correcao"));
    await expectUrl(page, `${METODOLOGIA}?acontecimento=nao-existe#correcao`);
    await expect(modelo(page)).toHaveValue(/\(cole aqui o link da página do acontecimento\)/);
    await expect(modelo(page)).not.toHaveValue(/nao-existe/);
    await expect(page.locator('#correcao [data-modelo=""]')).toBeVisible();
  });

  test("sem conseguir copiar, o modelo fica selecionado e nada é confirmado", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
    });
    await page.goto(`${METODOLOGIA}#correcao`);
    const correcao = page.locator("#correcao");

    await correcao.getByRole("button", { name: "Copiar o modelo" }).click();
    await expect(correcao.getByText("Não foi possível copiar daqui.")).toBeVisible();
    await expect(modelo(page)).toBeFocused();
    const selecionado = await modelo(page).evaluate(
      (no: HTMLTextAreaElement) => no.selectionEnd - no.selectionStart === no.value.length,
    );
    expect(selecionado).toBe(true);
    await expect(correcao.getByRole("button", { name: "Modelo copiado" })).toHaveCount(0);
  });
});

// As decisões de uma pessoa, como as telas as listam: os votos vigentes dela, os atos atribuídos a ela e a atuação legislativa dela.
const votosDe = (pessoaId: string) => conjunto.votos.filter((item) => item.pessoaId === pessoaId && item.situacao.tipo === "vigente");
const atosDe = (pessoaId: string) => conjunto.atosExecutivos.filter((item) => item.atribuicao.pessoaId === pessoaId);
const decisoesDe = (pessoaId: string) => listDecisionViews(data, pessoaId);
/** Quantos cartões uma decisão ocupa na tela: um por tema dela, ou um só no grupo "Outros assuntos". */
const cartoesDe = (decisao: DecisionView) => Math.max(1, decisao.temas.length);
const cartoesDeTodas = (decisoes: readonly DecisionView[]) => decisoes.reduce((soma, decisao) => soma + cartoesDe(decisao), 0);
/** A divergência entre documentos que o cartão mostra: a do objeto votado, ou a da atuação legislativa. */
const divergenciaDe = (decisao: DecisionView) => (decisao.natureza === "voto" ? decisao.votacao.objeto.divergencia : decisao.natureza === "atuacao" ? decisao.atuacao.divergencia : null);
const objetoDe = (votacaoId: string) => conjunto.votacoes.find((item) => item.id === votacaoId)!.objeto;
/** Quantos itens uma lista do cartão mostra aberta: o mesmo limite do componente do cartão (`ITENS_ABERTOS`). */
const ITENS_ABERTOS = 6;

test.describe("decisões documentadas nas páginas do atlas", () => {
  for (const pessoa of PESSOAS) {
    test(`a página de ${pessoa.nome} lista as decisões por tema: texto de referência declarado, divergência à vista, dispositivos por extenso`, async ({ page }) => {
      await page.goto(`/politicos/${pessoa.slug}/`);
      const secao = page.locator('#decisoes[data-secao="decisoes"]');
      const votos = votosDe(pessoa.id);
      const atos = atosDe(pessoa.id);
      const decisoes = decisoesDe(pessoa.id);
      const atuacoes = decisoes.filter((decisao) => decisao.natureza === "atuacao");
      // As três naturezas somam as decisões da pessoa: nenhuma fica fora da tela.
      expect(decisoes.length, "a pessoa deveria ter decisões publicadas").toBeGreaterThan(0);
      expect(decisoes.length).toBe(votos.length + atos.length + atuacoes.length);
      const cartoes = cartoesDeTodas(decisoes);
      await expect(secao.getByRole("heading", { level: 2 })).toContainText(`Votos, atos e atuação legislativa de ${pessoa.nome}, por tema`);
      // A seção conta as decisões; a decisão com dois temas aparece nos dois, e a sem tema, no grupo à parte.
      await expect(secao).toHaveAttribute("data-quantas", String(decisoes.length));
      await expect(secao.locator("[data-decisao-cartao]")).toHaveCount(cartoes);

      // Hierarquia dos títulos, sem salto: a seção (h2), o tema (h3) e o cartão (h4).
      const temas = await secao.locator("[data-tema]").count();
      expect(temas).toBeGreaterThan(0);
      await expect(secao.locator("[data-tema] > h3")).toHaveCount(temas);
      await expect(secao.locator("[data-decisao-cartao] > div > h4")).toHaveCount(cartoes);

      // A decisão sem tema não some: fica em "Outros assuntos", depois dos temas, com a nota que explica o grupo.
      const semTema = decisoes.filter((decisao) => decisao.temas.length === 0);
      const outros = secao.locator('[data-tema="outros-assuntos"]');
      if (semTema.length === 0) {
        await expect(outros).toHaveCount(0);
      } else {
        await expect(outros.getByRole("heading", { level: 3 })).toHaveText("Outros assuntos");
        await expect(outros.locator("[data-nota-do-grupo]")).toContainText("A classificação por tema é decisão editorial.");
        await expect(outros.locator("[data-decisao-cartao]")).toHaveCount(semTema.length);
        await expect(secao.locator("[data-tema]").last()).toHaveAttribute("data-tema", "outros-assuntos");
      }
      // A âncora de cada decisão existe uma vez só na página, ainda que o cartão apareça em dois temas.
      for (const decisao of decisoes) {
        await expect(page.locator(`[id="decisao-${decisao.id}"]`), decisao.id).toHaveCount(1);
        await expect(secao.locator(`[data-decisao-cartao="${decisao.id}"]`), decisao.id).toHaveCount(cartoesDe(decisao));
        await expect(secao.locator(`[data-decisao-cartao="${decisao.id}"]`).first()).toHaveAttribute("data-natureza", decisao.natureza);
      }
      // A atuação legislativa diz o tipo, a matéria, de quem ela é e o destino dela, e avisa o que isso não diz.
      for (const decisao of atuacoes) {
        if (decisao.natureza !== "atuacao") continue;
        const cartao = secao.locator(`[data-decisao-cartao="${decisao.id}"]`).first();
        await expect(cartao.locator("[data-natureza-rotulo]")).toContainText("Atuação legislativa");
        await expect(cartao.locator(`[data-tipo-de-atuacao="${decisao.atuacao.tipo}"]`)).toBeVisible();
        await expect(cartao.locator("[data-materia]")).toContainText(decisao.atuacao.materia.identificador);
        await expect(cartao.locator("[data-materia]")).toContainText(decisao.atuacao.materia.ementa);
        await expect(cartao.locator("[data-autoria-da-materia]")).toHaveText(decisao.atuacao.materia.autoria);
        await expect(cartao.locator(`[data-desfecho="${decisao.atuacao.desfecho.tipo}"]`)).toContainText(decisao.atuacao.desfecho.descricao);
        if (decisao.atuacao.desfecho.norma !== null) await expect(cartao.locator("[data-desfecho]")).toContainText(decisao.atuacao.desfecho.norma);
        await expect(cartao.locator("[data-aviso-atuacao]")).toHaveText("O registro documenta que a pessoa propôs ou relatou a matéria e o que aconteceu com ela depois. Ele não diz como a pessoa votou, nem o que a norma produziu na prática.");
        if (decisao.atuacao.divergencia === null) await expect(cartao.locator("[data-divergencia]")).toHaveCount(0);
        else await expect(cartao.locator("[data-divergencia]")).toContainText(decisao.atuacao.divergencia);
        // As fontes de cada cartão abrem no endereço seguro do órgão.
        await expect(cartao.locator("[data-fonte] a").first()).toHaveAttribute("href", /^https:\/\//);
      }

      for (const voto of votos) {
        const cartao = secao.locator(`[data-decisao-cartao="${voto.id}"]`).first();
        const objeto = objetoDe(voto.votacaoId);
        // O texto submetido à votação: ligado, com o documento, ou a tela diz que não está ligado, em vez de calar.
        if (objeto.textoReferencia === null) {
          await expect(cartao.locator('[data-texto-referencia="nao-ligado"]')).toContainText("não está ligado a este registro nesta edição");
        } else {
          await expect(cartao.locator('[data-texto-referencia="ligado"] a')).toHaveAttribute("href", urlDa(objeto.textoReferencia.fonteId));
        }
        // A divergência entre documentos é pública, junto do objeto, e só onde existe.
        if (objeto.divergenciaDocumentada === null) await expect(cartao.locator("[data-divergencia]")).toHaveCount(0);
        else await expect(cartao.locator("[data-divergencia]")).toContainText(objeto.divergenciaDocumentada);
      }

      for (const ato of atos) {
        const cartao = secao.locator(`[data-decisao-cartao="${ato.id}"]`).first();
        const itens = ato.dispositivosAlvo ?? [];
        if (itens.length === 0) {
          await expect(cartao.locator("[data-itens]")).toHaveCount(0);
          continue;
        }
        // Os dispositivos vetados, um por linha, como o registro os traz: a lista longa vem dobrada e abre a pedido.
        const lista = cartao.locator(`[data-itens="${itens.length}"]`);
        await expect(lista.locator("li")).toHaveText(itens);
        if (itens.length > ITENS_ABERTOS) {
          const dobrada = cartao.locator(`[data-lista-dobrada="${itens.length}"]`);
          await expect(dobrada.locator("summary")).toContainText(`Ver os ${itens.length} itens`);
          await expect(lista.locator("li").first()).toBeHidden();
          await dobrada.locator("summary").click();
          await expect(lista.locator("li").first()).toBeVisible();
          await expect(lista.locator("li").last()).toBeVisible();
        } else {
          await expect(cartao.locator("[data-lista-dobrada]")).toHaveCount(0);
          await expect(lista.locator("li").first()).toBeVisible();
        }
      }
    });
  }

  test("a edição dá matéria a estes testes: há divergência documentada, votação sem texto ligado, lista curta e lista longa, atuação legislativa, decisão sem tema e decisão com dois temas", () => {
    const votos = PESSOAS.flatMap((pessoa) => votosDe(pessoa.id));
    const atos = PESSOAS.flatMap((pessoa) => atosDe(pessoa.id));
    const decisoes = PESSOAS.flatMap((pessoa) => decisoesDe(pessoa.id));
    expect(decisoes.filter((decisao) => decisao.natureza === "atuacao").length).toBe(conjunto.atuacoesLegislativas.length);
    expect(conjunto.atuacoesLegislativas.length).toBeGreaterThan(0);
    expect(decisoes.some((decisao) => decisao.natureza === "atuacao" && decisao.atuacao.divergencia !== null)).toBe(true);
    expect(decisoes.some((decisao) => decisao.temas.length === 0)).toBe(true);
    expect(decisoes.some((decisao) => decisao.temas.length > 1)).toBe(true);
    expect(votos.filter((voto) => objetoDe(voto.votacaoId).divergenciaDocumentada !== null).length).toBeGreaterThan(0);
    expect(votos.filter((voto) => objetoDe(voto.votacaoId).textoReferencia === null).length).toBeGreaterThan(0);
    const tamanhos = atos.map((ato) => ato.dispositivosAlvo?.length ?? 0);
    expect(tamanhos.some((n) => n > ITENS_ABERTOS)).toBe(true);
    expect(tamanhos.some((n) => n > 0 && n <= ITENS_ABERTOS)).toBe(true);
  });

  test("na comparação, os cartões ficam um nível abaixo do título da pessoa, com as mesmas notas", async ({ page }) => {
    await page.goto("/comparar/");
    const secao = page.locator('#decisoes[data-secao="decisoes"]');
    const decisoes = PESSOAS.flatMap((pessoa) => decisoesDe(pessoa.id));
    const cartoes = cartoesDeTodas(decisoes);
    await expect(secao.getByRole("heading", { level: 2 })).toHaveText("Votos, atos e atuação legislativa no mesmo tema");
    await expect(secao).toHaveAttribute("data-quantas", String(decisoes.length));
    await expect(secao.locator("[data-decisao-cartao]")).toHaveCount(cartoes);

    // A seção (h2), o tema (h3), a pessoa (h4) e o cartão (h5).
    const temas = await secao.locator("[data-tema]").count();
    await expect(secao.locator("[data-tema] > h3")).toHaveCount(temas);
    await expect(secao.locator("[data-coluna-decisoes] > h4")).toHaveCount(temas * PESSOAS.length);
    await expect(secao.locator("[data-decisao-cartao] > div > h5")).toHaveCount(cartoes);
    // O título de cada coluna é só o nome da pessoa: nenhuma contagem ao lado, e a tela não ordena por quantidade.
    const titulosDasColunas = await secao.locator("[data-coluna-decisoes] > h4").allTextContents();
    expect([...new Set(titulosDasColunas)].sort()).toEqual(PESSOAS.map((pessoa) => pessoa.nome).sort());
    // O grupo das decisões sem tema fica por último, com as duas colunas, como os temas.
    await expect(secao.locator("[data-tema]").last()).toHaveAttribute("data-tema", "outros-assuntos");
    await expect(secao.locator('[data-tema="outros-assuntos"] [data-coluna-decisoes]')).toHaveCount(PESSOAS.length);

    // Cada cartão mostra a divergência e a falta do texto ligado da decisão dele, em todos os temas em que aparece.
    const comDivergencia = decisoes.filter((decisao) => divergenciaDe(decisao) !== null);
    await expect(secao.locator("[data-divergencia]")).toHaveCount(cartoesDeTodas(comDivergencia));
    const semTexto = decisoes.filter((decisao) => decisao.natureza === "voto" && decisao.votacao.textoReferencia === null);
    await expect(secao.locator('[data-texto-referencia="nao-ligado"]')).toHaveCount(cartoesDeTodas(semTexto));
    // O aviso da amostra diz que as três naturezas não se equiparam.
    await expect(secao).toContainText("Um voto no Senado, um ato da Presidência e a autoria de uma lei estadual são coisas diferentes");
  });
});
