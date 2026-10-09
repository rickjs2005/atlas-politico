// A tela de prova com os dados reais gerados por `npm run data:build`, e as
// páginas estruturais lendo os mesmos dados. Os números esperados saem dos
// arquivos gerados, para o teste acompanhar o conteúdo.

import { existsSync, readFileSync, rmSync } from "node:fs";

import { expect, test, type Page } from "@playwright/test";

const DADOS = "/dev/dados/";
const MANIFEST = "generated/manifest.json";

interface EventRecord {
  id: string;
  slug: string;
  titulo: string;
  pessoaIds: string[];
  localizacao: { tipo: "lugares"; lugarIds: string[] } | { tipo: "nacional" | "desconhecida" };
}

const readJson = <T>(arquivo: string): T => JSON.parse(readFileSync(arquivo, "utf8")) as T;
const conjunto = () =>
  readJson<{
    acontecimentos: EventRecord[];
    pessoas: { id: string; slug: string; nome: string }[];
    lugares: { id: string; nome: string }[];
  }>("generated/dados/conjunto.json");
const pointsOf = (arquivo: string) =>
  readJson<{ features: unknown[] }>(`generated/dados/geo/${arquivo}.geojson`).features.length;
const drafts = () =>
  readJson<{ foraDaPublicacao: { entidade: string; id: string }[] }>(
    "generated/relatorio/execucao.json",
  ).foraDaPublicacao.filter((item) => item.entidade === "acontecimento");

const lista = (page: Page) => page.getByRole("region", { name: "Acontecimentos" });
const painel = (page: Page) => page.getByRole("region", { name: "Detalhes" });
const canvas = (page: Page) => page.locator(".maplibregl-canvas");

async function open(page: Page) {
  await page.goto(DADOS);
  await expect(canvas(page)).toBeVisible();
  await expect(page.getByText("Carregando o mapa…")).toBeHidden();
}

test("a prova mostra o conjunto gerado inteiro, sem erro e sem recurso externo", async ({ page }) => {
  const erros: string[] = [];
  const externos: string[] = [];
  page.on("pageerror", (erro) => erros.push(erro.message));
  page.on("console", (mensagem) => {
    if (mensagem.type() === "error") erros.push(mensagem.text());
  });
  page.on("request", (requisicao) => {
    const { hostname, protocol } = new URL(requisicao.url());
    if (protocol.startsWith("http") && hostname !== "localhost") externos.push(requisicao.url());
  });

  await open(page);
  const { acontecimentos } = conjunto();

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Prova técnica com os dados gerados");
  await expect(page.getByText("Dados reais da edição")).toBeVisible();
  await expect(
    page.getByText(
      `${acontecimentos.length} acontecimentos no recorte · ${pointsOf("acontecimentos")} pontos no mapa · ${drafts().length} em rascunho, fora da exibição`,
    ),
  ).toBeVisible();
  await expect(lista(page).getByRole("button")).toHaveCount(acontecimentos.length);
  await page.screenshot({ path: "test-results/screens/07-dados-gerados.png" });

  expect(erros).toEqual([]);
  expect(externos).toEqual([]);
});

test("trocar a pessoa recorta a lista e os pontos como nos arquivos gerados", async ({ page }) => {
  await open(page);
  const { acontecimentos, pessoas } = conjunto();

  for (const pessoa of pessoas) {
    const seus = acontecimentos.filter((item) => item.pessoaIds.includes(pessoa.id)).length;
    await page.getByRole("button", { name: pessoa.nome, exact: true }).click();
    await expect(lista(page).getByRole("button")).toHaveCount(seus);
    await expect(
      page.getByText(`${seus} acontecimentos no recorte · ${pointsOf(`pessoas/${pessoa.slug}`)} pontos no mapa`),
    ).toBeVisible();
  }
});

test("acontecimento com dois lugares mostra os dois, e o painel avisa da revisão pendente", async ({ page }) => {
  await open(page);
  const { acontecimentos, lugares } = conjunto();
  const comDois = acontecimentos.find(
    (item) => item.localizacao.tipo === "lugares" && item.localizacao.lugarIds.length > 1,
  );
  test.skip(comDois === undefined, "Nenhum acontecimento publicado tem mais de um lugar.");
  if (comDois === undefined || comDois.localizacao.tipo !== "lugares") return;

  await lista(page).getByRole("button", { name: comDois.titulo }).click();
  await expect(painel(page).getByRole("heading", { name: comDois.titulo })).toBeVisible();
  for (const lugarId of comDois.localizacao.lugarIds) {
    const nome = lugares.find((lugar) => lugar.id === lugarId)?.nome ?? lugarId;
    await expect(painel(page)).toContainText(nome);
  }
  await expect(painel(page)).toContainText("Revisão humana pendente");
  await expect(painel(page)).toContainText("O que sustenta:");
  await page.screenshot({ path: "test-results/screens/08-dados-dois-lugares.png" });
});

test("acontecimento sem ponto continua na lista e no painel", async ({ page }) => {
  await open(page);
  const nacional = conjunto().acontecimentos.find((item) => item.localizacao.tipo === "nacional");
  test.skip(nacional === undefined, "Nenhum acontecimento publicado tem abrangência nacional.");
  if (nacional === undefined) return;

  const item = lista(page).getByRole("button", { name: nacional.titulo });
  await expect(item).toContainText("sem ponto no mapa (abrangência nacional)");
  await item.click();
  await expect(painel(page)).toContainText("Abrangência nacional");
});

test("rascunho não chega à tela nem ganha página", async ({ page, request }) => {
  await open(page);
  const rascunhos = readJson<{ slug: string; titulo: string }[]>("content/drafts/acontecimentos.json");
  expect(rascunhos.length).toBe(drafts().length);

  for (const rascunho of rascunhos) {
    await expect(page.getByText(rascunho.titulo, { exact: true })).toHaveCount(0);
    // Em desenvolvimento o Next recusa o endereço com erro, porque o slug não
    // está entre os gerados. Na saída estática a página simplesmente não
    // existe, e quem confere isso é `npm run verify:export`.
    const resposta = await request.get(`/acontecimentos/${rascunho.slug}/`);
    expect(resposta.ok(), rascunho.slug).toBe(false);
    expect(await resposta.text(), rascunho.slug).not.toContain(rascunho.titulo);
  }
});

test("as páginas de perfil e de acontecimento leem os dados gerados", async ({ page }) => {
  const { acontecimentos, pessoas } = conjunto();
  const pessoa = pessoas[0]!;
  const seus = acontecimentos.filter((item) => item.pessoaIds.includes(pessoa.id));

  await page.goto(`/politicos/${pessoa.slug}/`);
  const links = page.getByRole("list").filter({ has: page.getByRole("link", { name: seus[0]!.titulo }) });
  await expect(links.getByRole("listitem")).toHaveCount(seus.length);
  // A ordem da página é a do conjunto gerado: cronológica.
  await expect(links.getByRole("link")).toHaveText(seus.map((item) => item.titulo));

  await page.getByRole("link", { name: seus[0]!.titulo }).click();
  await expect(page).toHaveURL(new RegExp(`/acontecimentos/${seus[0]!.slug}/$`));
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(seus[0]!.titulo);
  await expect(page.getByText("Revisão humana pendente")).toBeVisible();
});

test("o servidor de desenvolvimento regenera os dados quando a saída some", async ({ page }) => {
  await open(page);
  const antes = readFileSync(MANIFEST, "utf8");

  rmSync(MANIFEST);
  await open(page);

  await expect(lista(page).getByRole("button")).toHaveCount(conjunto().acontecimentos.length);
  expect(existsSync(MANIFEST)).toBe(true);
  // Mesma entrada, mesmo manifesto.
  expect(readFileSync(MANIFEST, "utf8")).toBe(antes);
});
