// Apoio dos testes de navegador do jogo: o conteúdo publicado, lido como o
// build o lê, e os gestos que se repetem (esperar o jogo, abrir o marco,
// responder). Os valores esperados saem dos dados, e não de texto copiado:
// uma correção no conteúdo não quebra o teste, e uma regressão na tela, sim.

import { expect, type Locator, type Page } from "@playwright/test";

import { readSources, resolvePaths } from "@/lib/content/sources";
import type { AtlasData } from "@/lib/data/types";
import { buildGameContent, buildProgressKeys, type ProgressKeys } from "@/lib/game/content";
import { selectLines, type EscrivaoEvent } from "@/lib/game/escrivao";
import { periodLabel, roomLabel, roomOf } from "@/lib/game/rooms";
import { storageKey } from "@/lib/game/storage";
import { correctOrder, refKey } from "@/lib/game/trail";
import { PROGRESS_VERSION, type GameContent, type PersonagemSlug, type PhaseSpec, type PlayerProgress, type RoomId } from "@/lib/game/types";
import { buildAtlasData } from "@/lib/publication/build";
import { canonicalJson } from "@/lib/publication/stable-json";

export const data = buildAtlasData(readSources(resolvePaths())).data!;

/**
 * As chaves do progresso de um personagem como a página as recebe. O build lê
 * os dados gerados, que são gravados com as chaves em ordem alfabética
 * (src/lib/publication/stable-json.ts), e a assinatura de uma ordenação resume
 * as datas dos registros como objetos: a ordem das chaves entra no resumo. Um
 * progresso montado pelo teste só é aceito pela página com as assinaturas
 * tiradas da mesma forma dos dados.
 */
export function chavesDoBuild(slug: Slug): ProgressKeys {
  return buildProgressKeys(JSON.parse(canonicalJson(data)) as AtlasData, slug);
}

/** Um progresso no formato atual, como o jogo o grava, com as fases dadas concluídas: é quem chega com carimbos de uma visita anterior. */
export function progressoCom(slug: Slug, ids: readonly string[], como: "resposta" | "explicacao" = "explicacao") {
  const { assinaturas } = chavesDoBuild(slug);
  return {
    versao: PROGRESS_VERSION,
    personagem: slug,
    fases: Object.fromEntries(ids.map((id) => [id, { vista: true, tentativas: como === "resposta" ? 1 : 0, concluida: como, assinatura: assinaturas[id] }])),
    posicao: {},
  };
}

/** Põe um progresso no navegador antes de a página ler o armazenamento, e só uma vez: depois, quem escreve é o jogo. */
export async function semear(page: Page, slug: Slug, progresso: unknown) {
  await page.addInitScript(
    ([chave, valor]) => {
      const marca = `semeado:${chave}`;
      if (window.sessionStorage.getItem(marca) !== null) return;
      window.localStorage.setItem(chave!, valor!);
      window.sessionStorage.setItem(marca, "1");
    },
    [storageKey(slug), JSON.stringify(progresso)],
  );
}

export const PERSONAGENS = ["flavio-bolsonaro", "lula"] as const satisfies readonly PersonagemSlug[];
export type Slug = (typeof PERSONAGENS)[number];

const conteudos = new Map<string, GameContent>();
/** O conteúdo de uma sala do personagem, como a página o recebe. */
export function conteudoDe(slug: Slug, sala: RoomId = "historico"): GameContent {
  const chave = `${slug}:${sala}`;
  if (!conteudos.has(chave)) conteudos.set(chave, buildGameContent(data, slug, sala)!);
  return conteudos.get(chave)!;
}
export const fasesDe = (slug: Slug, sala: RoomId = "historico"): readonly PhaseSpec[] => conteudoDe(slug, sala).fases;
export const nomeDe = (slug: Slug) => conteudoDe(slug).personagem.nome;
export const rota = (slug: Slug, sala: RoomId = "historico") => (sala === "historico" ? `/jogo/${slug}/` : `/jogo/${slug}/${sala}/`);

/** O que o cabeçalho da fase diz: a sala, a posição e o período. */
export function posicaoDe(fase: PhaseSpec, total: number): string {
  return `${roomLabel(roomOf(fase.sala))} · Fase ${fase.numero} de ${total} · ${periodLabel(fase.periodo)}`;
}

/** A opção certa da pergunta de uma fase, e uma errada. */
export function opcoesDe(fase: PhaseSpec): { certa: string; errada: string } {
  if (fase.atividade.tipo !== "pergunta") throw new Error(`${fase.id} não é uma pergunta.`);
  const { correta, opcoes } = fase.atividade;
  return { certa: correta, errada: opcoes.find((opcao) => opcao.id !== correta)!.id };
}

/** A ordem certa da ordenação de uma fase, pelas chaves dos registros. */
export function ordemDe(fase: PhaseSpec, content: GameContent): string[] {
  if (fase.atividade.tipo !== "ordem") throw new Error(`${fase.id} não é uma ordenação.`);
  return correctOrder(fase.atividade, content);
}

/** A instrução que o Escrivão dá em um momento: a mesma que a tela escolhe, tirada do catálogo. */
export function instrucaoDe(evento: EscrivaoEvent, vez: number, sala: RoomId = "historico"): string {
  return selectLines({ sala, evento, humor: false, vez }).find((fala) => fala.camada === "instrucao")!.texto;
}

/** A fala de humor de um momento, fora de contexto sensível: a mesma que a tela escolhe, tirada do catálogo. */
export function humorDe(evento: EscrivaoEvent, vez: number, sala: RoomId = "historico"): string {
  return selectLines({ sala, evento, humor: true, vez, sensivel: false }).find((fala) => fala.camada === "humor")!.texto;
}

export { refKey, storageKey };

// ---------------------------------------------------------------------------
// A página
// ---------------------------------------------------------------------------

export const jogo = (page: Page): Locator => page.locator("[data-jogo]");
export const dialogo = (page: Page, nome: string): Locator => page.locator(`[data-dialogo="${nome}"]`);

/** Junta as exceções não tratadas da página: nenhuma jornada as aceita. */
export function vigiar(page: Page): string[] {
  const erros: string[] = [];
  page.on("pageerror", (erro) => erros.push(erro.message));
  return erros;
}

/** Espera o jogo ler o progresso e, com o cenário, a cena ficar pronta para o toque. */
export async function pronto(page: Page, cena = true) {
  await expect(jogo(page)).toHaveAttribute("data-carregado", "sim", { timeout: 30_000 });
  if (cena) await expect(page.locator('[data-palco="pronto"]')).toBeVisible({ timeout: 30_000 });
}

/** Abre uma fase pelo endereço e espera o jogo. */
export async function abrir(page: Page, slug: Slug, numero: number, sala: RoomId = "historico") {
  await page.goto(`${rota(slug, sala)}?fase=${numero}`);
  await pronto(page);
}

/** Espera uma janela aceitar toque e clique: ela ignora o ponteiro por um instante ao abrir, contra o toque dado por reflexo. */
export async function janela(page: Page, nome: string): Promise<Locator> {
  const caixa = dialogo(page, nome);
  await expect(caixa.getByRole("dialog")).toHaveAttribute("data-aceita-ponteiro", "sim");
  return caixa;
}

/** Abre o marco da fase pelo botão principal e devolve a janela da fase. */
export async function abrirMarco(page: Page): Promise<Locator> {
  await page.locator("[data-abrir-marco]").click();
  return janela(page, "fase");
}

/** Responde a pergunta da fase aberta com a opção dada. `onde` é a janela da fase ou a página, na leitura sem o cenário. */
export async function responder(onde: Locator | Page, opcaoId: string) {
  await onde.locator(`[data-opcao="${opcaoId}"]`).click();
  await onde.locator("[data-responder]").click();
}

/** Responde certo a atividade da fase aberta, seja pergunta ou ordenação. `onde` é a janela da fase ou a página, na leitura sem o cenário. */
export async function responderCerto(onde: Locator | Page, fase: PhaseSpec, content: GameContent) {
  if (fase.atividade.tipo === "pergunta") {
    await responder(onde, fase.atividade.correta);
    return;
  }
  for (const chave of correctOrder(fase.atividade, content)) await onde.locator(`[data-ordem-item="${chave}"]`).click();
  await onde.locator("[data-responder]").click();
}

/** Conclui a fase aberta lendo a explicação no lugar de responder, e segue para a seguinte (ou para o resumo). */
export async function lerESeguir(page: Page) {
  const fase = await abrirMarco(page);
  await fase.locator("[data-ver-explicacao]").click();
  await fase.locator("[data-continuar]").click();
}

/**
 * Anda com Tab até o foco chegar ao controle pedido. Serve às jornadas só de
 * teclado: nada aqui põe o foco por conta própria, e por isso um foco perdido
 * (que recomeça do topo da página) ou preso fora da janela aparece como falha.
 */
export async function tabAte(page: Page, seletor: string, limite = 40) {
  const chegou = () => page.evaluate((alvo) => document.activeElement?.matches(alvo) === true, seletor);
  for (let passo = 0; passo < limite; passo += 1) {
    if (await chegou()) return;
    await page.keyboard.press("Tab");
  }
  if (await chegou()) return;
  const onde = await page.evaluate(() => {
    const ativo = document.activeElement;
    return ativo === null ? "nada" : `${ativo.tagName.toLowerCase()} ${[...ativo.attributes].map((atributo) => `${atributo.name}="${atributo.value.slice(0, 40)}"`).join(" ")}`;
  });
  throw new Error(`O Tab não chegou a ${seletor} em ${limite} passos. O foco está em: ${onde}`);
}

/** O foco está dentro do elemento dado? O foco no corpo da página, que é onde ele cai quando se perde, responde não. */
export function focoDentroDe(page: Page, seletor: string): Promise<boolean> {
  return page.evaluate((alvo) => document.activeElement !== null && document.activeElement !== document.body && document.activeElement.closest(alvo) !== null, seletor);
}

/** O progresso guardado do personagem neste navegador, ou `null`. */
export function progressoSalvo(page: Page, slug: Slug): Promise<PlayerProgress | null> {
  return page.evaluate((chave) => JSON.parse(window.localStorage.getItem(chave) ?? "null") as PlayerProgress | null, storageKey(slug));
}

/**
 * Os controles visíveis dentro de `raiz` com menos de 44 pixels de largura ou
 * de altura, cada um com o tamanho e o nome: é a lista do que o dedo erra.
 * Conta todo link, inclusive os de texto. O que está dentro de um bloco
 * fechado, ou de uma janela encoberta por outra, não recebe toque e não conta.
 */
export function alvosPequenos(raiz: Locator): Promise<string[]> {
  return raiz.evaluate((no) => {
    const seletor = "a[href], button, summary, input, select, textarea, [tabindex]:not([tabindex='-1'])";
    const pequenos: string[] = [];
    for (const el of no.querySelectorAll<HTMLElement>(seletor)) {
      if (el.closest("[inert]") !== null || el.matches(":disabled")) continue;
      if (!el.checkVisibility({ visibilityProperty: true })) continue;
      const caixa = el.getBoundingClientRect();
      if (caixa.width === 0 || caixa.height === 0) continue;
      if (caixa.width >= 44 && caixa.height >= 44) continue;
      const nome = (el.getAttribute("aria-label") ?? el.innerText).trim().replace(/\s+/g, " ").slice(0, 60);
      pequenos.push(`${Math.round(caixa.width)}×${Math.round(caixa.height)} ${nome}`);
    }
    return pequenos;
  });
}

/** O que a página tem de mais largo do que a janela: zero quando nada passa da largura. */
export function sobraHorizontal(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
}
