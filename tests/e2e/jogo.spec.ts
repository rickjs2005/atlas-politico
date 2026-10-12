// Jogo (docs/GAMEPLAY.md e docs/GAME-TRAIL.md): a trilha simples. Um ciclo só:
// tocar no marco, ler uma explicação curta, responder uma atividade ou ler a
// explicação dela, continuar. Os testes cobrem o que o roteiro do jogo pede:
// o visitante novo começa na origem das duas pessoas; continuar e rever desde
// o início são caminhos diferentes, e nenhum apaga nada; uma resposta ou a
// leitura da explicação basta para avançar, e os registros opcionais não
// seguram a fase; o erro não tira acesso e vem com explicação; o progresso
// antigo migra sem virar aprendizado; o humor respeita o contexto e a
// preferência; e a leitura sem o cenário funciona pelo teclado e quando o
// canvas falha.
//
// Os valores esperados saem do conteúdo publicado (tests/e2e/jogo-apoio.ts).
// As jornadas rodam para as duas pessoas, e nenhuma aceita erro não tratado
// na página. Rodam contra o servidor de desenvolvimento (`npm run test:e2e`)
// e contra a saída estática (`npm run test:journeys`).

import { expect, test, type Locator, type Page } from "@playwright/test";

import { PROPOSAL_NOTICE } from "@/lib/data/proposals";
import { formatDate } from "@/lib/domain/dates";
import { TEMA_LABELS } from "@/lib/domain/decisions";
import { JUDICIAL_NOTICE } from "@/lib/game/judicial";
import { LEGACY_CHAPTER_PHASES } from "@/lib/game/legacy";
import { PREFERENCES_KEY } from "@/lib/game/preferences";
import { PROGRESS_VERSION } from "@/lib/game/types";

import {
  PERSONAGENS,
  abrir,
  abrirMarco,
  alvosPequenos,
  conteudoDe,
  dialogo,
  fasesDe,
  focoDentroDe,
  instrucaoDe,
  janela,
  jogo,
  lerESeguir,
  nomeDe,
  opcoesDe,
  ordemDe,
  posicaoDe,
  progressoSalvo,
  pronto,
  refKey,
  responder,
  rota,
  sobraHorizontal,
  storageKey,
  tabAte,
  vigiar,
  type Slug,
} from "./jogo-apoio";

let erros: string[] = [];
test.beforeEach(({ page }) => {
  erros = vigiar(page);
});
test.afterEach(() => {
  expect(erros, "erros não tratados na página").toEqual([]);
});

const cartaoDaFase = (page: Page) => page.locator("[data-fase-cartao]");
const marcoDe = (slug: Slug, numero: number) => {
  const content = conteudoDe(slug);
  const fase = content.fases[numero - 1]!;
  const { tipo, id } = fase.marco;
  const titulo = tipo === "fato" ? content.fatos[id]!.titulo : tipo === "decisao" ? content.decisoes[id]!.titulo : content.registros[id]!.titulo;
  return { fase, titulo };
};

test.describe("entrada do jogo", () => {
  test("uma frase simples e duas escolhas com os mesmos campos e o mesmo destaque", async ({ page }) => {
    await page.goto("/jogo/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Conheça as duas trajetórias");
    await expect(page.locator("[data-proposta]")).toContainText("um marco, uma explicação e uma pergunta por fase");
    await expect(page.locator("[data-escolha]")).toHaveCount(2);

    for (const slug of PERSONAGENS) {
      const fases = fasesDe(slug);
      const cartao = page.locator(`[data-escolha="${slug}"]`);
      await expect(cartao).toHaveAttribute("data-situacao", "inicio");
      await expect(cartao.getByRole("heading", { level: 3 })).toHaveText(nomeDe(slug));
      await expect(cartao.locator("[data-trilha-resumo]")).toHaveText(`${fases.length} fases · ${fases[0]!.periodo.de} a ${fases.at(-1)!.periodo.ate}`);
      await expect(cartao.locator("[data-situacao-texto]")).toHaveText("Ainda não aberta neste navegador.");
      // Quem nunca jogou só tem um começo: a origem, com o ano escrito.
      const comecar = cartao.locator(`[data-comecar="${slug}"]`);
      await expect(comecar).toContainText(`Começar do início: ${fases[0]!.periodo.de}`);
      await expect(comecar).toHaveAttribute("href", `/jogo/${slug}/?fase=1`);
      await expect(cartao.locator("[data-continuar], [data-ver-desde-o-inicio]")).toHaveCount(0);
      await expect(cartao.locator(`[data-ler-sem-cenario="${slug}"]`)).toHaveAttribute("href", `/jogo/${slug}/?fase=1&leitura=1`);
      // Os aprofundamentos ficam abaixo, pelo assunto e pelos anos, e dizem que não são o começo.
      const aprofundamentos = cartao.locator(`[data-aprofundamentos="${slug}"]`);
      await expect(aprofundamentos).toContainText("Não é o começo da vida de ninguém.");
      for (const sala of ["economia", "seguranca-publica"] as const) {
        const [fase] = fasesDe(slug, sala);
        const item = aprofundamentos.locator("li", { has: page.locator(`[data-abrir-sala="${slug}:${sala}"]`) });
        await expect(item.getByRole("link")).toHaveAttribute("href", rota(slug, sala));
        await expect(item).toContainText(`${fase!.periodo.de} a ${fase!.periodo.ate}`);
      }
      // A lista das fases está à mão, fechada, com o título e o período de cada uma.
      await cartao.locator("[data-fases-da-trilha] summary").click();
      await expect(cartao.locator("[data-fases-da-trilha] li")).toHaveCount(fases.length);
      await expect(cartao.locator("[data-fases-da-trilha] li").first()).toContainText(fases[0]!.titulo);
      await cartao.locator("[data-fases-da-trilha] summary").click();
    }

    // O mesmo tamanho, na mesma linha: nenhuma das duas escolhas tem mais destaque.
    const caixas = await Promise.all(PERSONAGENS.map(async (slug) => (await page.locator(`[data-escolha="${slug}"]`).boundingBox())!));
    expect(Math.round(caixas[0]!.width)).toBe(Math.round(caixas[1]!.width));
    expect(Math.round(caixas[0]!.y)).toBe(Math.round(caixas[1]!.y));
    expect(Math.round(caixas[0]!.height)).toBe(Math.round(caixas[1]!.height));
    const botoes = await Promise.all(PERSONAGENS.map(async (slug) => (await page.locator(`[data-comecar="${slug}"]`).boundingBox())!));
    expect(Math.round(botoes[0]!.height)).toBe(Math.round(botoes[1]!.height));

    // O que o jogo não é está escrito na entrada.
    await expect(page.locator("[data-avisos-do-jogo]")).toContainText("não dá nota, não aponta vencedor e não recomenda voto");
    await expect(page.locator("[data-avisos-do-jogo]")).toContainText("São marcos documentados de cada trajetória, e não a vida inteira");
    await expect(page.locator("[data-revisao]").first()).toContainText("Revisão humana pendente");
  });

  test("os caminhos de cada trajetória ficam na primeira tela, antes da prévia do cenário, em computador e em celular", async ({ browser, baseURL }) => {
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 1280, height: 720 },
      { width: 390, height: 844 },
      { width: 360, height: 640 },
    ]) {
      const tela = `${viewport.width}×${viewport.height}`;
      const context = await browser.newContext({ baseURL, viewport, reducedMotion: "reduce" });
      const page = await context.newPage();
      await page.goto("/jogo/");
      await expect(page.locator('[data-escolha="lula"]')).toHaveAttribute("data-situacao", "inicio");
      await expect(page.locator("[data-previa-mundo]")).toHaveCount(2);
      // Em tela larga, os dois começos estão à vista sem rolar; em celular, o da primeira trajetória (a outra vem logo abaixo).
      for (const slug of viewport.width >= 768 ? PERSONAGENS : PERSONAGENS.slice(0, 1)) {
        await expect(page.locator(`[data-comecar="${slug}"]`), tela).toBeInViewport({ ratio: 1 });
      }
      for (const slug of PERSONAGENS) {
        const caminhos = (await page.locator(`[data-escolha="${slug}"] [data-caminhos]`).boundingBox())!;
        const previa = (await page.locator(`[data-escolha="${slug}"] [data-previa-mundo]`).boundingBox())!;
        expect(caminhos.y + caminhos.height, `${tela}: a prévia vem depois dos caminhos`).toBeLessThanOrEqual(previa.y + 1);
      }
      expect(await sobraHorizontal(page), tela).toBeLessThanOrEqual(0);
      await context.close();
    }
  });

  test("com progresso em uma trajetória só, os dois cartões continuam alinhados, e continuar e ver desde o início ficam na primeira tela", async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, viewport: { width: 1280, height: 720 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    await abrir(page, "lula", 1);
    await lerESeguir(page);
    await page.goto("/jogo/");
    await expect(page.locator('[data-escolha="lula"]')).toHaveAttribute("data-situacao", "em-andamento");
    await expect(page.locator("[data-previa-mundo]")).toHaveCount(2);
    for (const caminho of ['[data-continuar="lula"]', '[data-ver-desde-o-inicio="lula"]', '[data-comecar="flavio-bolsonaro"]']) {
      await expect(page.locator(caminho), caminho).toBeInViewport({ ratio: 1 });
    }
    // Um cartão tem dois botões e o outro, um: as prévias e o fim dos cartões ficam na mesma altura.
    const previas = await Promise.all(PERSONAGENS.map(async (slug) => (await page.locator(`[data-escolha="${slug}"] [data-previa-mundo]`).boundingBox())!));
    expect(Math.round(previas[0]!.y)).toBe(Math.round(previas[1]!.y));
    const cartoes = await Promise.all(PERSONAGENS.map(async (slug) => (await page.locator(`[data-escolha="${slug}"]`).boundingBox())!));
    expect(Math.round(cartoes[0]!.y + cartoes[0]!.height)).toBe(Math.round(cartoes[1]!.y + cartoes[1]!.height));
    await context.close();
  });

  for (const slug of PERSONAGENS) {
    test(`${slug}: o visitante novo começa na origem, e a tela diz a pessoa, a fase, o período e o próximo passo`, async ({ page }) => {
      const fases = fasesDe(slug);
      const { fase: primeira, titulo } = marcoDe(slug, 1);
      await page.goto("/jogo/");
      await page.locator(`[data-comecar="${slug}"]`).click();
      await expect(page).toHaveURL(new RegExp(`/jogo/${slug}/\\?fase=1$`));
      await pronto(page);

      expect(primeira.id).toBe(`${slug}-origem`);
      await expect(jogo(page)).toHaveAttribute("data-fase-aberta", primeira.id);
      await expect(jogo(page)).toHaveAttribute("data-sala", "historico");
      await expect(jogo(page)).toHaveAttribute("data-modo", "cenario");
      await expect(jogo(page)).toHaveAttribute("data-fase-situacao", "nova");
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(`Jogo · ${nomeDe(slug)} · Trajetória`);
      // Sem abrir painel nenhum: a posição, o período e o título estão sobre a cena.
      await expect(cartaoDaFase(page).locator("[data-fase-posicao]")).toHaveText(posicaoDe(primeira, fases.length));
      await expect(cartaoDaFase(page).locator("[data-fase-titulo]")).toHaveText(primeira.titulo);
      await expect(cartaoDaFase(page).locator("[data-proximo-passo]")).toContainText("Toque na pasta em destaque, ou no botão Abrir o marco");
      // A pasta em destaque e o botão principal abrem a mesma coisa, e dizem o quê.
      await expect(page.locator('[data-marcador="marco"]')).toHaveAttribute("aria-label", `Abrir o marco: ${titulo}`);
      await expect(page.locator("[data-abrir-marco]")).toHaveAttribute("aria-label", `Abrir o marco: ${titulo}`);
      await expect(page.locator("[data-rodape-do-jogo] [data-aviso-cenario]")).toContainText("O cenário é uma representação");

      // Sem pedido no endereço, a trajetória também abre na origem, e visitar não grava nada.
      await page.goto(rota(slug));
      await pronto(page);
      await expect(jogo(page)).toHaveAttribute("data-fase-aberta", primeira.id);
      await expect(page).toHaveURL(new RegExp(`/jogo/${slug}/\\?fase=1$`));
      expect(await progressoSalvo(page, slug)).toBeNull();
    });
  }
});

test.describe("o ciclo de uma fase", () => {
  for (const slug of PERSONAGENS) {
    test(`${slug}: abrir o marco, ler, errar sem perder nada, tentar de novo, acertar e continuar`, async ({ page }) => {
      const fases = fasesDe(slug);
      const { fase: primeira, titulo } = marcoDe(slug, 1);
      const segunda = fases[1]!;
      const { certa, errada } = opcoesDe(primeira);
      await abrir(page, slug, 1);

      const fase = await abrirMarco(page);
      await expect(jogo(page)).toHaveAttribute("data-vista", "fase");
      await expect(jogo(page)).toHaveAttribute("data-fase-situacao", "vista");
      await expect(fase.locator("[data-fase-posicao]")).toHaveText(posicaoDe(primeira, fases.length));
      await expect(fase.locator("[data-fase-titulo]")).toHaveText(primeira.titulo);
      await expect(fase.locator("[data-fase-objetivo]")).toHaveText(`Nesta fase: ${primeira.objetivo}`);
      await expect(fase.locator("[data-marco]")).toContainText(titulo);
      await expect(fase.locator("[data-bloco]")).toHaveText(primeira.explicacao.map((bloco) => bloco.texto));
      await expect(fase.locator("[data-enunciado]")).toHaveText(primeira.atividade.enunciado);
      await expect(fase.locator("[data-opcao]")).toHaveCount(3);
      // Antes de responder, a explicação da resposta não aparece, e não há o que continuar.
      await expect(fase.locator("[data-resultado], [data-continuar]")).toHaveCount(0);
      await expect(fase.locator("[data-responder]")).toBeDisabled();

      // O erro: a explicação aparece, a fase continua aberta e os dois caminhos ficam à mão.
      await responder(fase, errada);
      await expect(fase.locator("[data-resultado]")).toHaveAttribute("data-resultado", "errado");
      await expect(fase.locator("[data-veredito]")).toHaveText("Ainda não.");
      await expect(fase.locator("[data-explicacao-da-resposta]")).toHaveText(primeira.atividade.explicacao);
      // A opção escolhida fica marcada como a escolha; nenhuma aparece como a certa antes da nova tentativa.
      await expect(fase.locator(`[data-opcao="${errada}"]`)).toHaveAttribute("aria-pressed", "true");
      await expect(fase.locator("[data-opcao][data-certa]")).toHaveCount(0);
      await expect(fase.getByText("resposta certa")).toHaveCount(0);
      // A instrução do primeiro erro, como está no catálogo do Escrivão: diz o que fazer, e não tira nada.
      await expect(fase.locator('[data-escrivao="erro"] [data-camada="instrucao"]')).toContainText(instrucaoDe("erro", 0));
      await expect(jogo(page)).toHaveAttribute("data-fase-situacao", "vista");
      await expect(fase.locator("[data-seguir-sem-responder]")).toHaveText(`Continuar: fase ${segunda.numero}`);
      expect((await progressoSalvo(page, slug))!.fases[primeira.id]).toEqual({ vista: true, tentativas: 1 });

      await fase.locator("[data-tentar-de-novo]").click();
      await expect(fase.locator("[data-resultado]")).toHaveCount(0);
      await responder(fase, certa);
      await expect(fase.locator("[data-resultado]")).toHaveAttribute("data-resultado", "certo");
      await expect(fase.locator("[data-veredito]")).toHaveText("Certo.");
      await expect(fase.locator(`[data-opcao="${certa}"]`)).toHaveAttribute("data-certa", "sim");
      await expect(jogo(page)).toHaveAttribute("data-fase-situacao", "concluida");
      await expect(fase.locator('[data-atividade]')).toHaveAttribute("data-atividade-situacao", "concluida");

      // Continuar leva à fase seguinte, com o foco na pasta dela.
      await fase.locator(`[data-continuar="${segunda.id}"]`).click();
      await expect(jogo(page)).toHaveAttribute("data-vista", "base");
      await expect(jogo(page)).toHaveAttribute("data-fase-aberta", segunda.id);
      await expect(page).toHaveURL(new RegExp(`/jogo/${slug}/\\?fase=2$`));
      await expect(cartaoDaFase(page).locator("[data-fase-posicao]")).toHaveText(posicaoDe(segunda, fases.length));
      await expect(page.locator('[data-marcador="marco"]')).toBeFocused();
      const salvo = (await progressoSalvo(page, slug))!;
      expect(salvo.versao).toBe(PROGRESS_VERSION);
      expect(salvo.fases[primeira.id]).toMatchObject({ vista: true, concluida: "resposta", tentativas: 2 });
      expect(Object.keys(salvo.fases)).toEqual([primeira.id]);
    });
  }

  test("ler a explicação no lugar de responder libera a fase seguinte, e nenhum registro opcional segura a fase", async ({ page }) => {
    const slug = "lula";
    const [primeira, segunda, terceira] = fasesDe(slug);
    expect(primeira!.explorar.length, "a fase tem registro opcional").toBeGreaterThan(0);
    await abrir(page, slug, 1);

    const fase = await abrirMarco(page);
    await expect(fase.locator("[data-explorar]")).toContainText("Nenhum é necessário para continuar.");
    await fase.locator("[data-ver-explicacao]").click();
    await expect(fase.locator("[data-resultado]")).toHaveAttribute("data-resultado", "explicacao");
    await expect(fase.locator("[data-veredito]")).toHaveText("A explicação:");
    await expect(fase.locator("[data-explicacao-da-resposta]")).toHaveText(primeira!.atividade.explicacao);
    // Quem leu a explicação vê qual era a resposta.
    await expect(fase.locator(`[data-opcao="${opcoesDe(primeira!).certa}"]`)).toHaveAttribute("data-certa", "sim");
    await expect(jogo(page)).toHaveAttribute("data-fase-situacao", "concluida");
    await fase.locator("[data-continuar]").click();
    await expect(jogo(page)).toHaveAttribute("data-fase-aberta", segunda!.id);

    // Na fase seguinte, errar e seguir adiante também conclui pela leitura: a explicação já estava à vista.
    const ordem = ordemDe(segunda!, conteudoDe(slug));
    const outra = await abrirMarco(page);
    for (const chave of [...ordem].reverse()) await outra.locator(`[data-ordem-item="${chave}"]`).click();
    await outra.locator("[data-responder]").click();
    await expect(outra.locator("[data-resultado]")).toHaveAttribute("data-resultado", "errado");
    await outra.locator("[data-seguir-sem-responder]").click();
    await expect(jogo(page)).toHaveAttribute("data-fase-aberta", terceira!.id);

    const salvo = (await progressoSalvo(page, slug))!;
    expect(salvo.fases[primeira!.id]).toMatchObject({ concluida: "explicacao", tentativas: 0 });
    expect(salvo.fases[segunda!.id]).toMatchObject({ concluida: "explicacao", tentativas: 1 });
    // Nenhum registro opcional foi aberto, e as duas fases estão concluídas.
    const lista = await (async () => {
      await page.locator("[data-abrir-fases]").click();
      return janela(page, "fases");
    })();
    await expect(lista.locator(`[data-fase-item="${primeira!.id}"]`)).toHaveAttribute("data-situacao", "concluida");
    await expect(lista.locator(`[data-fase-item="${segunda!.id}"]`)).toHaveAttribute("data-situacao", "concluida");
    await expect(lista.locator(`[data-fase-item="${terceira!.id}"]`)).toHaveAttribute("data-situacao", "nova");
  });

  test("a ordenação: tocar nos registros na ordem das datas, com a ordem certa mostrada depois", async ({ page }) => {
    const slug = "lula";
    const content = conteudoDe(slug);
    const segunda = content.fases[1]!;
    const ordem = ordemDe(segunda, content);
    await abrir(page, slug, 2);
    const fase = await abrirMarco(page);
    await expect(fase.locator("[data-atividade]")).toHaveAttribute("data-atividade", "ordem");
    await expect(fase.locator("[data-ordem-item]")).toHaveCount(3);
    await expect(fase.locator("[data-responder]")).toHaveText("Confirmar a ordem");
    await expect(fase.locator("[data-responder]")).toBeDisabled();

    // Tocar de novo em um registro o tira da ordem: dá para corrigir antes de confirmar.
    await fase.locator(`[data-ordem-item="${ordem[1]}"]`).click();
    await expect(fase.locator(`[data-ordem-item="${ordem[1]}"]`)).toHaveAttribute("data-ordem-posicao", "1");
    await fase.locator(`[data-ordem-item="${ordem[1]}"]`).click();
    await expect(fase.locator("[data-ordem-posicao]")).toHaveCount(0);

    for (const [indice, chave] of ordem.entries()) {
      await fase.locator(`[data-ordem-item="${chave}"]`).click();
      await expect(fase.locator(`[data-ordem-item="${chave}"]`)).toHaveAttribute("data-ordem-posicao", String(indice + 1));
    }
    await fase.locator("[data-responder]").click();
    await expect(fase.locator("[data-resultado]")).toHaveAttribute("data-resultado", "certo");
    // A explicação traz as datas dos registros, na ordem certa.
    const linhas = fase.locator("[data-ordem-certa] li");
    await expect(linhas).toHaveCount(3);
    for (const [indice, chave] of ordem.entries()) {
      const [tipo, id] = chave.split(":") as [string, string];
      const dataDoRegistro = tipo === "fato" ? content.fatos[id]!.data! : content.registros[id]!.data;
      await expect(linhas.nth(indice)).toContainText(formatDate(dataDoRegistro));
    }
    await expect(jogo(page)).toHaveAttribute("data-fase-situacao", "concluida");
  });
});

test.describe("registros opcionais e fontes", () => {
  test("o registro de Explorar abre por cima da fase, que fica como estava: a escolha feita, o lugar na lista e o foco no botão que abriu; a pasta do cenário abre o mesmo registro", async ({ page }) => {
    const slug = "lula";
    const content = conteudoDe(slug);
    const primeira = content.fases[0]!;
    const opcional = primeira.explorar[0]!;
    await abrir(page, slug, 1);
    const fase = await abrirMarco(page);

    // A pessoa marca uma opção e, antes de responder, abre um registro opcional, no fim da janela.
    const { certa } = opcoesDe(primeira);
    await fase.locator(`[data-opcao="${certa}"]`).click();
    const abridor = fase.locator(`[data-explorar] [data-abrir-registro="${refKey(opcional)}"]`);
    await abridor.click();
    const registro = await janela(page, "registro");
    // A fase continua embaixo, fora do teclado e da leitura.
    await expect(fase).toHaveAttribute("data-encoberta", "sim");
    await expect(fase).toHaveJSProperty("inert", true);
    await expect(registro.getByRole("dialog")).toContainText("Registro do atlas · leitura opcional");
    await expect(registro.locator(`[data-fato-cartao="${opcional.id}"]`)).toContainText(content.fatos[opcional.id]!.texto);
    await expect(registro.locator('[data-escrivao="explorar"] [data-camada="instrucao"]')).toContainText("opcional");
    await expect(registro.locator("[data-fonte]").first().getByRole("link")).toHaveAttribute("href", /^https:\/\//);
    await expect(registro.locator("[data-revisao]")).toContainText("Revisão humana pendente");
    // O botão de volta diz para onde, e é ele que recebe o foco.
    await expect(registro.locator("[data-fechar-registro]")).toHaveText("Voltar à fase");
    await expect(registro.locator("[data-fechar-registro]")).toBeFocused();
    await registro.locator("[data-fechar-registro]").click();
    await expect(dialogo(page, "registro")).toHaveCount(0);
    await expect(dialogo(page, "fase")).toBeVisible();
    await expect(fase).not.toHaveAttribute("data-encoberta");
    // A fase volta como estava: a opção marcada, o botão que abriu o registro com o foco, e a lista à vista.
    await expect(fase.locator(`[data-opcao="${certa}"]`)).toHaveAttribute("aria-pressed", "true");
    await expect(abridor).toBeFocused();
    await expect(abridor).toBeInViewport();
    // Abrir o registro não concluiu nem mudou a fase.
    await expect(jogo(page)).toHaveAttribute("data-fase-situacao", "vista");

    // Esc fecha a janela da fase, e o foco volta ao botão que a abriu.
    await page.keyboard.press("Escape");
    await expect(jogo(page)).toHaveAttribute("data-vista", "base");
    await expect(page.locator("[data-abrir-marco]")).toBeFocused();

    // A pasta com o sinal de mais, no cenário, abre o mesmo registro, e fechar volta ao cenário.
    const pasta = page.locator(`[data-marcador="${refKey(opcional)}"]`);
    await expect(pasta).toHaveAttribute("aria-label", `Explorar: ${content.fatos[opcional.id]!.titulo}`);
    await pasta.click();
    const doCenario = await janela(page, "registro");
    await expect(doCenario.locator(`[data-fato-cartao="${opcional.id}"]`)).toBeVisible();
    await expect(doCenario.locator("[data-fechar-registro]")).toHaveText("Voltar ao cenário");
    await page.keyboard.press("Escape");
    await expect(jogo(page)).toHaveAttribute("data-vista", "base");
    // O foco volta à pasta que abriu o registro.
    await expect(pasta).toBeFocused();
  });

  test("na lista de Explorar, uma decisão vem com a área e a ementa da proposição, tiradas do registro; a atuação legislativa já diz o assunto no título", async ({ page }) => {
    // Uma lei sancionada, entre os registros opcionais de uma fase de governo: tem área e proposição.
    const lula = conteudoDe("lula");
    const reconhecivel = (id: string) => lula.decisoes[id]!.natureza !== "atuacao" && lula.decisoes[id]!.temas.length > 0 && lula.decisoes[id]!.proposicoes.length > 0;
    const fase = lula.fases.find((item) => item.explorar.some((ref) => ref.tipo === "decisao" && reconhecivel(ref.id)))!;
    const opcional = fase.explorar.find((ref) => ref.tipo === "decisao" && reconhecivel(ref.id))!;
    const decisao = lula.decisoes[opcional.id]!;
    await abrir(page, "lula", fase.numero);
    let aberta = await abrirMarco(page);
    let linha = aberta.locator("[data-explorar] li").filter({ has: page.locator(`[data-abrir-registro="${refKey(opcional)}"]`) });
    await expect(linha).toContainText(decisao.titulo);
    await expect(linha.locator("[data-areas]")).toContainText(decisao.temas.map((tema) => TEMA_LABELS[tema]).join(", "));
    await expect(linha.locator("[data-assunto]")).toHaveText(`${decisao.proposicoes[0]!.identificacao}: ${decisao.proposicoes[0]!.ementa}`);

    // Uma lei estadual de autoria: o título do registro já diz do que ela trata.
    const flavio = conteudoDe("flavio-bolsonaro");
    const comAtuacao = flavio.fases.find((item) => item.explorar.some((ref) => ref.tipo === "decisao" && flavio.decisoes[ref.id]!.natureza === "atuacao"))!;
    const atuacao = comAtuacao.explorar.find((ref) => ref.tipo === "decisao" && flavio.decisoes[ref.id]!.natureza === "atuacao")!;
    await abrir(page, "flavio-bolsonaro", comAtuacao.numero);
    aberta = await abrirMarco(page);
    linha = aberta.locator("[data-explorar] li").filter({ has: page.locator(`[data-abrir-registro="${refKey(atuacao)}"]`) });
    await expect(linha).toContainText(flavio.decisoes[atuacao.id]!.titulo);
    await expect(linha.locator("[data-assunto]")).toHaveCount(0);
  });

  test("só com o teclado: abrir o marco, errar, tentar de novo, acertar e continuar, sem o foco sair da janela", async ({ page }) => {
    const slug = "flavio-bolsonaro";
    const [primeira, segunda, terceira] = fasesDe(slug);
    const { certa, errada } = opcoesDe(primeira!);
    const naJanela = () => focoDentroDe(page, '[data-dialogo="fase"] [role="dialog"]');
    await abrir(page, slug, 1);
    const fase = dialogo(page, "fase");

    // Enter na pasta do marco abre a fase, com o foco na janela.
    await page.locator('[data-marcador="marco"]').focus();
    await page.keyboard.press("Enter");
    await janela(page, "fase");
    expect(await naJanela()).toBe(true);

    // Marcar a opção errada e responder: o foco vai para Tentar de novo, com a explicação à vista.
    await tabAte(page, `[data-opcao="${errada}"]`);
    await page.keyboard.press("Space");
    await expect(fase.locator(`[data-opcao="${errada}"]`)).toHaveAttribute("aria-pressed", "true");
    await tabAte(page, "[data-responder]");
    await page.keyboard.press("Enter");
    await expect(fase.locator("[data-resultado]")).toHaveAttribute("data-resultado", "errado");
    await expect(fase.locator("[data-tentar-de-novo]")).toBeFocused();
    await expect(fase.locator("[data-veredito]")).toBeInViewport();
    expect(await naJanela()).toBe(true);

    // Tentar de novo: o foco vai para a primeira opção, e a resposta certa conclui a fase com o foco em Continuar.
    await page.keyboard.press("Enter");
    await expect(fase.locator("[data-opcao]").first()).toBeFocused();
    await tabAte(page, `[data-opcao="${certa}"]`);
    await page.keyboard.press("Enter");
    await tabAte(page, "[data-responder]");
    await page.keyboard.press("Enter");
    await expect(fase.locator("[data-resultado]")).toHaveAttribute("data-resultado", "certo");
    await expect(fase.locator(`[data-continuar="${segunda!.id}"]`)).toBeFocused();
    await expect(fase.locator("[data-veredito]")).toBeInViewport();
    expect(await naJanela()).toBe(true);

    // Enter em Continuar leva à fase seguinte, com o foco na pasta do marco dela.
    await page.keyboard.press("Enter");
    await expect(jogo(page)).toHaveAttribute("data-fase-aberta", segunda!.id);
    await expect(page.locator('[data-marcador="marco"]')).toBeFocused();

    // Na fase seguinte, pedir a explicação também deixa o foco em Continuar; Esc fecha a janela e devolve o foco à pasta.
    await page.keyboard.press("Enter");
    await janela(page, "fase");
    await tabAte(page, "[data-ver-explicacao]");
    await page.keyboard.press("Enter");
    await expect(fase.locator("[data-resultado]")).toHaveAttribute("data-resultado", "explicacao");
    await expect(fase.locator(`[data-continuar="${terceira!.id}"]`)).toBeFocused();
    expect(await naJanela()).toBe(true);
    await page.keyboard.press("Escape");
    await expect(jogo(page)).toHaveAttribute("data-vista", "base");
    await expect(jogo(page)).toHaveAttribute("data-fase-aberta", segunda!.id);
    await expect(page.locator('[data-marcador="marco"]')).toBeFocused();
    // O Tab não sai da janela enquanto ela está aberta: do último controle volta ao primeiro, e Shift+Tab faz o caminho contrário.
    await page.keyboard.press("Enter");
    await janela(page, "fase");
    await page.keyboard.press("Shift+Tab");
    await expect(fase.locator("[data-fechar-fase]")).toBeFocused();
    const visitados = new Set<string>();
    for (let passo = 0; passo < 40; passo += 1) {
      await page.keyboard.press("Tab");
      expect(await naJanela(), `o foco saiu da janela no passo ${passo + 1}`).toBe(true);
      visitados.add(await page.evaluate(() => document.activeElement!.outerHTML.slice(0, 160)));
    }
    // Deu a volta: passou por vários controles, e não ficou parado no último.
    expect(visitados.size, "controles visitados com o Tab").toBeGreaterThan(4);
    await tabAte(page, "[data-fechar-fase]");
    await page.keyboard.press("Tab");
    expect(await naJanela()).toBe(true);
    await expect(fase.locator("[data-fechar-fase]")).not.toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(fase.locator("[data-fechar-fase]")).toBeFocused();
    // Os blocos de abrir e fechar (as fontes, os termos) entram no caminho do Tab e abrem pelo teclado.
    await tabAte(page, "[data-fontes-da-fase] summary");
    await page.keyboard.press("Enter");
    await expect(fase.locator("[data-fontes-da-fase] [data-apoio]").first()).toBeVisible();
    await tabAte(page, "[data-fontes-da-fase] [data-abrir-registro]");
    expect(await naJanela()).toBe(true);
  });

  test("fechar uma janela devolve o foco ao botão que a abriu, e a confirmação de apagar fica por cima da lista", async ({ page }) => {
    await abrir(page, "lula", 2);
    for (const [botao, nome] of [
      ["[data-abrir-fases]", "fases"],
      ["[data-abrir-ajuda]", "ajuda"],
    ] as const) {
      await page.locator(botao).click();
      await janela(page, nome);
      await page.keyboard.press("Escape");
      await expect(jogo(page)).toHaveAttribute("data-vista", "base");
      await expect(page.locator(botao)).toBeFocused();
    }
    // A confirmação abre por cima da lista; cancelar devolve o foco ao botão de apagar, e a lista continua onde estava.
    await page.locator("[data-abrir-fases]").click();
    const lista = await janela(page, "fases");
    await lista.locator("[data-apagar-progresso]").click();
    await janela(page, "apagar");
    await expect(lista).toHaveAttribute("data-encoberta", "sim");
    await page.keyboard.press("Escape");
    await expect(dialogo(page, "apagar")).toHaveCount(0);
    await expect(lista).not.toHaveAttribute("data-encoberta");
    await expect(lista.locator("[data-apagar-progresso]")).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.locator("[data-abrir-fases]")).toBeFocused();
  });

  test("na leitura sem o cenário, fechar um registro devolve o foco ao botão que o abriu, sem levar a leitura de volta ao começo", async ({ page }) => {
    const slug = "lula";
    await page.goto(`${rota(slug)}?fase=1&leitura=1`);
    await pronto(page, false);
    const abridor = page.locator("[data-leitura-da-fase] [data-explorar] [data-abrir-registro]").first();
    await abridor.scrollIntoViewIfNeeded();
    await abridor.click();
    const registro = await janela(page, "registro");
    await expect(registro.locator("[data-fechar-registro]")).toHaveText("Voltar à leitura");
    const antes = await page.evaluate(() => Math.round(window.scrollY));
    expect(antes, "a lista de registros fica abaixo da primeira tela").toBeGreaterThan(200);
    await registro.locator("[data-fechar-registro]").click();
    await expect(dialogo(page, "registro")).toHaveCount(0);
    await expect(abridor).toBeFocused();
    await expect(abridor).toBeInViewport();
    expect(Math.abs((await page.evaluate(() => Math.round(window.scrollY))) - antes), "a página não rolou").toBeLessThanOrEqual(2);

    // O mesmo com a lista de fases e com Como funciona.
    for (const [botao, nome] of [
      ["[data-abrir-fases]", "fases"],
      ["[data-abrir-ajuda]", "ajuda"],
    ] as const) {
      await page.locator(botao).click();
      await janela(page, nome);
      await page.keyboard.press("Escape");
      await expect(page.locator(botao)).toBeFocused();
    }
    // Só com o teclado, na página: responder deixa o foco em Continuar, e o Tab não recomeça do topo.
    const leitura = page.locator("[data-leitura-da-fase]");
    const [primeira, segunda] = fasesDe(slug);
    await tabAte(page, `[data-opcao="${opcoesDe(primeira!).certa}"]`, 80);
    await page.keyboard.press("Enter");
    await tabAte(page, "[data-responder]");
    await page.keyboard.press("Enter");
    await expect(leitura.locator(`[data-continuar="${segunda!.id}"]`)).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(jogo(page)).toHaveAttribute("data-fase-aberta", segunda!.id);
    await expect(leitura.locator("[data-fase-titulo]")).toBeFocused();
  });

  test("as fontes de cada bloco abrem na própria fase, e a ficha completa no atlas devolve a pessoa à trajetória, na fase da retomada", async ({ page }) => {
    const slug = "lula";
    const content = conteudoDe(slug);
    const segunda = content.fases[1]!;
    const evento = "lula-1975-eleito-presidente-do-sindicato";
    await abrir(page, slug, 2);
    const fase = await abrirMarco(page);

    // "Ver fontes" lista os registros que sustentam a explicação e a atividade, com os documentos de cada um.
    const fontes = fase.locator("[data-fontes-da-fase]");
    await fontes.locator("summary").click();
    const apoio = fontes.locator("[data-apoio]");
    await expect(apoio).not.toHaveCount(0);
    for (const item of await apoio.all()) {
      await expect(item.locator("[data-fonte]").first()).toBeVisible();
      await expect(item.locator("[data-onde]").first()).toContainText("Onde:");
      await expect(item.locator("[data-evidencia]").first()).toContainText("Sustenta:");
    }
    await expect(fontes.locator("[data-revisao]")).toContainText("Revisão humana pendente");

    await fontes.locator(`[data-apoio="acontecimento:${evento}"] [data-abrir-registro]`).click();
    const registro = await janela(page, "registro");
    await expect(registro.locator(`[data-registro-cartao="${evento}"]`)).toContainText(content.registros[evento]!.resumo);
    await registro.locator(`[data-ficha="${content.registros[evento]!.slug}"]`).click();
    await expect(page).toHaveURL(new RegExp(`/acontecimentos/${evento}/\\?origem=jogo&personagem=${slug}$`));
    const volta = page.locator('[data-retorno="jogo"]');
    await expect(volta).toContainText("Voltar ao jogo");
    await expect(volta).toContainText(`trajetória de ${nomeDe(slug)}`);
    await volta.click();
    await expect(page).toHaveURL(new RegExp(`/jogo/${slug}/(\\?fase=2)?$`));
    await pronto(page);
    await expect(jogo(page)).toHaveAttribute("data-fase-aberta", segunda.id);
  });

  test("a atuação legislativa abre com o cartão do atlas e leva à decisão na página da pessoa", async ({ page }) => {
    const slug = "flavio-bolsonaro";
    const content = conteudoDe(slug);
    const terceira = content.fases[2]!;
    expect(terceira.marco).toEqual({ tipo: "decisao", id: "alerj-lei-4250-2003-autoria" });
    const decisao = content.decisoes[terceira.marco.id]!;
    await abrir(page, slug, 3);
    const fase = await abrirMarco(page);
    await expect(fase.locator("[data-marco]")).toContainText(decisao.titulo);
    await expect(fase.locator("[data-marco]")).toContainText("decisão documentada");
    await fase.locator("[data-fontes-da-fase] summary").click();
    await fase.locator(`[data-apoio="decisao:${decisao.id}"] [data-abrir-registro]`).click();

    const registro = await janela(page, "registro");
    const cartao = registro.locator(`[data-decisao-cartao="${decisao.id}"]`);
    await expect(cartao).toHaveAttribute("data-natureza", "atuacao");
    await expect(cartao.locator("[data-natureza-rotulo]")).toContainText("Atuação legislativa · Assembleia Legislativa do Estado do Rio de Janeiro");
    await expect(cartao.locator('[data-tipo-de-atuacao="autoria"]')).toHaveText("Autoria de proposição");
    await expect(cartao.locator('[data-desfecho="lei-sancionada"]')).toContainText("Virou lei, sancionada pelo chefe do Executivo");
    // O cartão diz o que a autoria não diz: não é voto nem resultado.
    await expect(cartao.locator("[data-aviso-atuacao]")).toContainText("Ele não diz como a pessoa votou, nem o que a norma produziu na prática.");
    await expect(cartao.locator("[data-fonte] a").first()).toHaveAttribute("href", /^https:\/\/www3\.alerj\.rj\.gov\.br\//);

    const link = cartao.locator(`[data-ficha-decisao="${decisao.id}"]`);
    await expect(link).toHaveAttribute("href", `/politicos/${slug}/#decisao-${decisao.id}`);
    await link.click();
    await expect(page).toHaveURL(new RegExp(`/politicos/${slug}/#decisao-${decisao.id}$`));
    await expect(page.locator(`#decisao-${decisao.id}`)).toHaveAttribute("data-natureza", "atuacao");
  });
});

test.describe("fases, retomada e progresso", () => {
  test("a lista de fases abre qualquer fase, sem apagar nem concluir nada", async ({ page }) => {
    const slug = "lula";
    const fases = fasesDe(slug);
    const [primeira] = fases;
    const setima = fases[6]!;
    await abrir(page, slug, 1);
    await lerESeguir(page);

    await page.locator("[data-abrir-fases]").click();
    const lista = await janela(page, "fases");
    await expect(lista.getByRole("heading", { level: 3 }).first()).toHaveText(`As ${fases.length} fases · nenhuma segura a seguinte`);
    await expect(lista.locator("[data-fase-item]")).toHaveCount(fases.length);
    await expect(lista.locator(`[data-fase-item="${primeira!.id}"] [data-situacao-texto]`)).toHaveText("concluída");
    await expect(lista.locator(`[data-fase-item="${fases[1]!.id}"]`)).toHaveAttribute("aria-current", "step");
    await expect(lista.locator(`[data-fase-item="${fases[1]!.id}"] [data-situacao-texto]`)).toHaveText("ainda não aberta · você está aqui");
    await expect(lista.locator("[data-progresso-duravel]")).toHaveAttribute("data-progresso-duravel", "sim");
    // Nenhuma fase está trancada: todas têm o botão de abrir.
    await expect(lista.locator("[data-abrir-fase]")).toHaveCount(fases.length);

    await lista.locator(`[data-abrir-fase="${setima.id}"]`).click();
    await expect(jogo(page)).toHaveAttribute("data-vista", "base");
    await expect(jogo(page)).toHaveAttribute("data-fase-aberta", setima.id);
    await expect(jogo(page)).toHaveAttribute("data-fase-situacao", "nova");
    await expect(page).toHaveURL(new RegExp(`/jogo/${slug}/\\?fase=7$`));
    await expect(cartaoDaFase(page).locator("[data-fase-posicao]")).toHaveText(posicaoDe(setima, fases.length));
    // Ir a uma fase é navegação: o que está salvo é o que já estava.
    const salvo = (await progressoSalvo(page, slug))!;
    expect(Object.keys(salvo.fases)).toEqual([primeira!.id]);
    expect(salvo.fases[primeira!.id]!.concluida).toBe("explicacao");
  });

  test("continuar de onde parei e ver desde o início são caminhos diferentes, com a fase e o ano, e rever o início não apaga o progresso", async ({ page }) => {
    const slug = "lula";
    const outro = "flavio-bolsonaro";
    const fases = fasesDe(slug);
    const [primeira, segunda, terceira] = fases;
    await abrir(page, slug, 1);
    await lerESeguir(page);
    await lerESeguir(page);
    await expect(jogo(page)).toHaveAttribute("data-fase-aberta", terceira!.id);
    // A pessoa abre a terceira fase e sai sem responder.
    await abrirMarco(page);
    await page.keyboard.press("Escape");

    await page.goto("/jogo/");
    const cartao = page.locator(`[data-escolha="${slug}"]`);
    await expect(cartao).toHaveAttribute("data-situacao", "em-andamento");
    await expect(cartao.locator("[data-situacao-texto]")).toHaveText(`2 fases concluídas de ${fases.length}.`);
    const continuar = cartao.locator(`[data-continuar="${slug}"]`);
    await expect(continuar).toContainText(`Continuar de onde parei: fase 3, ${terceira!.periodo.de} a ${terceira!.periodo.ate}`);
    await expect(continuar).toHaveAttribute("data-destino", terceira!.id);
    await expect(continuar).toHaveAttribute("href", `/jogo/${slug}/?fase=3`);
    const inicio = cartao.locator(`[data-ver-desde-o-inicio="${slug}"]`);
    await expect(inicio).toContainText(`Ver desde o início: ${primeira!.periodo.de}`);
    await expect(inicio).toHaveAttribute("href", `/jogo/${slug}/?fase=1`);
    await expect(cartao.locator("[data-comecar]")).toHaveCount(0);
    await expect(cartao.locator(`[data-ler-sem-cenario="${slug}"]`)).toHaveAttribute("href", `/jogo/${slug}/?fase=3&leitura=1`);
    // O progresso é de cada personagem: a outra trajetória continua por começar.
    await expect(page.locator(`[data-escolha="${outro}"]`)).toHaveAttribute("data-situacao", "inicio");
    await expect(page.locator(`[data-escolha="${outro}"] [data-comecar]`)).toBeVisible();

    // Ver desde o início abre a origem, já concluída, e não mexe no que está salvo.
    const antes = await progressoSalvo(page, slug);
    await inicio.click();
    await pronto(page);
    await expect(jogo(page)).toHaveAttribute("data-fase-aberta", primeira!.id);
    await expect(jogo(page)).toHaveAttribute("data-fase-situacao", "concluida");
    await expect(cartaoDaFase(page)).toHaveAttribute("data-fase-cartao", "concluida");
    await expect(cartaoDaFase(page).locator("[data-proximo-passo]")).toHaveText(`Fase concluída. Use o botão para seguir à fase ${segunda!.numero}.`);
    await expect(page.locator("[data-abrir-marco]")).toHaveText("Reabrir o marco");
    expect(await progressoSalvo(page, slug)).toEqual(antes);

    // Reler a origem também não desfaz nada: a entrada continua oferecendo a terceira fase.
    const fase = await abrirMarco(page);
    await expect(fase.locator("[data-veredito]")).toHaveText("Você já concluiu esta fase. A explicação:");
    await page.keyboard.press("Escape");
    const depois = (await progressoSalvo(page, slug))!;
    expect(depois.fases).toEqual(antes!.fases);
    await page.goto("/jogo/");
    await expect(page.locator(`[data-continuar="${slug}"]`)).toHaveAttribute("data-destino", terceira!.id);
  });

  test("quem chega sem pedir fase e cai onde parou vê isso escrito, com o caminho para o início e o ano", async ({ page }) => {
    const slug = "lula";
    const fases = fasesDe(slug);
    const [primeira, , terceira] = fases;
    const aviso = cartaoDaFase(page).locator("[data-aviso-retomada]");
    // Sem progresso, a trajetória abre na origem: não há retomada a avisar.
    await page.goto(rota(slug));
    await pronto(page);
    await expect(jogo(page)).toHaveAttribute("data-fase-aberta", primeira!.id);
    await expect(aviso).toHaveCount(0);

    await lerESeguir(page);
    await lerESeguir(page);
    const antes = await progressoSalvo(page, slug);

    // Pela entrada do atlas, o acesso direto ao jogo cai onde a pessoa parou, e a tela diz isso.
    await page.goto("/");
    await page.locator(`[data-jogar-entrada="${slug}"]`).click();
    await pronto(page);
    await expect(jogo(page)).toHaveAttribute("data-fase-aberta", terceira!.id);
    await expect(cartaoDaFase(page).locator("[data-fase-posicao]")).toHaveText(posicaoDe(terceira!, fases.length));
    await expect(aviso).toHaveAttribute("data-aviso-retomada", "retomada");
    await expect(aviso).toContainText("Você continua de onde parou.");
    const inicio = aviso.locator("[data-ver-desde-o-inicio]");
    await expect(inicio).toHaveText(`Ver desde o início: ${primeira!.periodo.de}`);
    // O aviso fica no lugar do humor: o cartão tem a instrução e o aviso, e não mais uma fala.
    await expect(cartaoDaFase(page).locator('[data-camada="humor"]')).toHaveCount(0);
    await expect(cartaoDaFase(page).locator("[data-proximo-passo]")).toHaveCount(1);

    // O caminho para o início é navegação: abre a origem, o aviso sai, e nada do que foi feito muda.
    await inicio.click();
    await expect(jogo(page)).toHaveAttribute("data-fase-aberta", primeira!.id);
    await expect(jogo(page)).toHaveAttribute("data-fase-situacao", "concluida");
    await expect(page.locator('[data-marcador="marco"]')).toBeFocused();
    await expect(aviso).toHaveCount(0);
    expect(await progressoSalvo(page, slug)).toEqual(antes);

    // Quem pede a fase pelo endereço escolheu: não há o que avisar.
    await abrir(page, slug, 3);
    await expect(jogo(page)).toHaveAttribute("data-fase-aberta", terceira!.id);
    await expect(aviso).toHaveCount(0);
    // Na leitura sem o cenário, o mesmo aviso, com o mesmo caminho.
    await page.locator("[data-ler-sem-cenario]").click();
    await expect(jogo(page)).toHaveAttribute("data-modo", "leitura");
    await page.goto(rota(slug));
    await pronto(page, false);
    await expect(jogo(page)).toHaveAttribute("data-fase-aberta", terceira!.id);
    const naLeitura = page.locator("[data-aviso-retomada]");
    await expect(naLeitura).toContainText("Você continua de onde parou.");
    await naLeitura.locator("[data-ver-desde-o-inicio]").press("Enter");
    await expect(jogo(page)).toHaveAttribute("data-fase-aberta", primeira!.id);
    await expect(page.locator("[data-leitura-da-fase] [data-fase-titulo]")).toBeFocused();
    await expect(naLeitura).toHaveCount(0);
  });

  test("com a trajetória concluída, a entrada diz isso e oferece rever desde o início, que abre a origem e não apaga nada", async ({ page }) => {
    const slug = "flavio-bolsonaro";
    const fases = fasesDe(slug);
    const primeira = fases[0]!;
    const ultima = fases.at(-1)!;
    await abrir(page, slug, 1);
    for (let vez = 0; vez < fases.length; vez += 1) await lerESeguir(page);
    const resumo = await janela(page, "resumo");
    await expect(resumo.locator("[data-resumo-contagem]")).toContainText(`Você concluiu ${fases.length} de ${fases.length}.`);
    await expect(resumo.locator('[data-resumo-fase][data-situacao="concluida"]')).toHaveCount(fases.length);
    const antes = await progressoSalvo(page, slug);

    await page.goto("/jogo/");
    const cartao = page.locator(`[data-escolha="${slug}"]`);
    await expect(cartao).toHaveAttribute("data-situacao", "completa");
    await expect(cartao.locator("[data-situacao-texto]")).toHaveText(`Você concluiu as ${fases.length} fases neste navegador.`);
    await expect(cartao.locator("[data-continuar], [data-ver-desde-o-inicio]")).toHaveCount(0);
    const rever = cartao.locator(`[data-comecar="${slug}"]`);
    await expect(rever).toContainText(`Rever desde o início: ${primeira.periodo.de}`);
    await rever.click();
    await pronto(page);
    await expect(jogo(page)).toHaveAttribute("data-fase-aberta", primeira.id);
    await expect(jogo(page)).toHaveAttribute("data-fase-situacao", "concluida");
    await expect(page).toHaveURL(new RegExp(`/jogo/${slug}/\\?fase=1$`));
    expect(await progressoSalvo(page, slug)).toEqual(antes);

    // Sem pedido, a trajetória concluída abre na última fase, de onde se chega ao resumo, e a tela oferece o início.
    await page.goto(rota(slug));
    await pronto(page);
    await expect(jogo(page)).toHaveAttribute("data-fase-aberta", ultima.id);
    await expect(cartaoDaFase(page).locator("[data-aviso-retomada] [data-ver-desde-o-inicio]")).toHaveText(`Ver desde o início: ${primeira.periodo.de}`);
    await expect(page.locator('[data-continuar="resumo"]')).toHaveText(/Ver o resumo/);
    expect(await progressoSalvo(page, slug)).toEqual(antes);
  });

  test("Voltar do navegador sai do jogo sem deixar pedido no endereço da entrada, e Avançar reabre a fase em que a pessoa estava", async ({ page }) => {
    const slug = "lula";
    const [primeira, segunda] = fasesDe(slug);
    await abrir(page, slug, 1);
    await lerESeguir(page);
    await lerESeguir(page);
    await page.goto("/jogo/");
    await page.locator(`[data-ver-desde-o-inicio="${slug}"]`).click();
    await pronto(page);
    await expect(jogo(page)).toHaveAttribute("data-fase-aberta", primeira!.id);
    await expect(page).toHaveURL(new RegExp(`/jogo/${slug}/\\?fase=1$`));
    // Dentro do jogo, mudar de fase troca o endereço sem criar entrada no histórico.
    await page.locator(`[data-continuar="${segunda!.id}"]`).click();
    await expect(jogo(page)).toHaveAttribute("data-fase-aberta", segunda!.id);
    await expect(page).toHaveURL(new RegExp(`/jogo/${slug}/\\?fase=2$`));
    const antes = await progressoSalvo(page, slug);

    // Voltar sai do jogo de uma vez, e a entrada fica com o endereço dela, sem pedido de fase.
    await page.goBack();
    await expect(page).toHaveURL(/\/jogo\/$/);
    await expect(page.locator(`[data-escolha="${slug}"]`)).toHaveAttribute("data-situacao", "em-andamento");
    expect(await progressoSalvo(page, slug)).toEqual(antes);

    await page.goForward();
    await pronto(page);
    await expect(page).toHaveURL(new RegExp(`/jogo/${slug}/\\?fase=2$`));
    await expect(jogo(page)).toHaveAttribute("data-fase-aberta", segunda!.id);
    expect(await progressoSalvo(page, slug)).toEqual(antes);
  });

  test("pela entrada, ler sem o cenário abre a leitura, e ver desde o início não marca a fase da retomada como lida", async ({ page }) => {
    const slug = "lula";
    const outro = "flavio-bolsonaro";
    const [primeira, , terceira] = fasesDe(slug);
    await abrir(page, slug, 1);
    await lerESeguir(page);
    await lerESeguir(page);
    await expect(jogo(page)).toHaveAttribute("data-fase-aberta", terceira!.id);
    const antes = (await progressoSalvo(page, slug))!;
    expect(antes.fases[terceira!.id]).toBeUndefined();

    // A leitura sem o cenário, escolhida na entrada para a outra pessoa, abre sem a cena e vira a preferência.
    await page.goto("/jogo/");
    await page.locator(`[data-ler-sem-cenario="${outro}"]`).click();
    await pronto(page, false);
    await expect(jogo(page)).toHaveAttribute("data-modo", "leitura");
    await expect(jogo(page)).toHaveAttribute("data-fase-aberta", `${outro}-origem`);
    await expect(page.locator("canvas, [data-palco]")).toHaveCount(0);
    await expect(page).toHaveURL(new RegExp(`/jogo/${outro}/\\?fase=1$`));

    // De volta à entrada, por dentro do site: ver desde o início abre a origem, ainda na leitura.
    await page.locator("[data-rodape-do-jogo]").getByRole("link", { name: "Escolher a outra trajetória" }).click();
    await expect(page).toHaveURL(/\/jogo\/$/);
    await page.locator(`[data-ver-desde-o-inicio="${slug}"]`).click();
    await pronto(page, false);
    await expect(jogo(page)).toHaveAttribute("data-modo", "leitura");
    await expect(jogo(page)).toHaveAttribute("data-fase-aberta", primeira!.id);
    await expect(page.locator("[data-leitura-da-fase] [data-fase-titulo]")).toHaveText(primeira!.titulo);
    await expect(page).toHaveURL(new RegExp(`/jogo/${slug}/\\?fase=1$`));
    // A fase em que a pessoa continuaria não foi aberta: nada nela foi marcado como lido.
    const depois = (await progressoSalvo(page, slug))!;
    expect(depois.fases).toEqual(antes.fases);
    expect(depois.fases[terceira!.id]).toBeUndefined();
  });

  test("o progresso de um formato anterior migra sem ser apagado e sem virar aprendizado: a origem é oferecida, e nada aparece como lido ou respondido", async ({ page }) => {
    const slug = "lula";
    const fases = fasesDe(slug);
    const antigo = {
      versao: 5,
      personagem: slug,
      capitulos: {
        "lula-1-sindicato": { status: "concluido", coletados: ["lula-1975-eleito-presidente-do-sindicato"], tarefa: { concluida: true, tentativas: 1 } },
        "lula-2-constituinte": { status: "concluido", coletados: [], tarefa: { concluida: true, tentativas: 3 } },
        "lula-3-presidencia": { status: "em-andamento", coletados: ["lula-2002-eleito-presidente"] },
      },
    };
    const cobertas = [...new Set(["lula-1-sindicato", "lula-2-constituinte"].flatMap((id) => LEGACY_CHAPTER_PHASES[id]!))];
    // Depois da última fase que os capítulos concluídos cobriam.
    const ultimaCoberta = Math.max(...cobertas.map((id) => fases.findIndex((fase) => fase.id === id)));
    const destino = fases[ultimaCoberta + 1]!;
    // O salvo antigo entra antes de a página ler o armazenamento, e só uma vez: depois, quem escreve é o jogo.
    await page.addInitScript(
      ([chave, valor]) => {
        if (window.localStorage.getItem(chave!) === null && window.sessionStorage.getItem("semeado") === null) {
          window.localStorage.setItem(chave!, valor!);
          window.sessionStorage.setItem("semeado", "1");
        }
      },
      [storageKey(slug), JSON.stringify(antigo)],
    );

    await page.goto("/jogo/");
    const cartao = page.locator(`[data-escolha="${slug}"]`);
    await expect(cartao).toHaveAttribute("data-situacao", "em-andamento");
    await expect(cartao.locator("[data-situacao-texto]")).toHaveText(`Nenhuma fase concluída ainda de ${fases.length}. O jogo mudou desde a sua última visita: a trajetória agora começa pela origem.`);
    await expect(cartao.locator(`[data-continuar="${slug}"]`)).toContainText(`Continuar de onde parei: fase ${destino.numero}, ${destino.periodo.de} a ${destino.periodo.ate}`);
    await expect(cartao.locator(`[data-continuar="${slug}"]`)).toHaveAttribute("data-destino", destino.id);
    await expect(cartao.locator(`[data-ver-desde-o-inicio="${slug}"]`)).toContainText(`Ver desde o início: ${fases[0]!.periodo.de}`);
    // Ler não grava: o que estava salvo continua como estava.
    expect(await page.evaluate((chave) => JSON.parse(window.localStorage.getItem(chave)!), storageKey(slug))).toEqual(antigo);

    await cartao.locator(`[data-ver-desde-o-inicio="${slug}"]`).click();
    await pronto(page);
    await expect(jogo(page)).toHaveAttribute("data-fase-aberta", fases[0]!.id);
    await page.locator("[data-abrir-fases]").click();
    const lista = await janela(page, "fases");
    // A origem não existia: é nova. As fases dos capítulos concluídos dizem que o período já foi visto, e nenhuma está concluída.
    await expect(lista.locator(`[data-fase-item="${fases[0]!.id}"] [data-situacao-texto]`)).toHaveText("ainda não aberta · você está aqui");
    for (const id of cobertas) {
      await expect(lista.locator(`[data-fase-item="${id}"]`)).toHaveAttribute("data-situacao", "nova");
      await expect(lista.locator(`[data-fase-item="${id}"] [data-situacao-texto]`)).toHaveText("período visto na versão anterior");
    }
    await expect(lista.locator('[data-fase-item][data-situacao="concluida"]')).toHaveCount(0);

    // Quem chega direto ao jogo, sem passar pela entrada dele, cai na mesma fase da retomada, e a tela diz que o jogo mudou e oferece a origem.
    await page.keyboard.press("Escape");
    await page.goto(rota(slug));
    await pronto(page);
    await expect(jogo(page)).toHaveAttribute("data-fase-aberta", destino.id);
    const avisoDeMudanca = cartaoDaFase(page).locator("[data-aviso-retomada]");
    await expect(avisoDeMudanca).toHaveAttribute("data-aviso-retomada", "mudou");
    await expect(avisoDeMudanca).toContainText("O jogo mudou desde a sua última visita: a trajetória agora começa pela origem.");
    await expect(avisoDeMudanca.locator("[data-ver-desde-o-inicio]")).toHaveText(`Ver desde o início: ${fases[0]!.periodo.de}`);
    await avisoDeMudanca.locator("[data-ver-desde-o-inicio]").click();
    await expect(jogo(page)).toHaveAttribute("data-fase-aberta", fases[0]!.id);
    await expect(jogo(page)).toHaveAttribute("data-fase-situacao", "nova");
    await page.locator("[data-abrir-fases]").click();
    await janela(page, "fases");

    // A fase diz que o período já foi visto, e a atividade, que é nova, está por responder.
    await lista.locator(`[data-abrir-fase="${cobertas[0]}"]`).click();
    const fase = await abrirMarco(page);
    await expect(fase.locator("p[data-fase-anterior]")).toHaveText("Você já passou por este período em uma versão anterior do jogo. A explicação e a atividade desta fase são novas.");
    await expect(fase.locator("[data-atividade]")).toHaveAttribute("data-atividade-situacao", "pendente");
    await expect(fase.locator("[data-resultado]")).toHaveCount(0);

    // Agora o jogo gravou no formato novo, com o salvo antigo inteiro dentro e nenhuma conclusão.
    const salvo = (await progressoSalvo(page, slug))!;
    expect(salvo.versao).toBe(PROGRESS_VERSION);
    expect(salvo.legado).toEqual({ versao: 5, capitulos: antigo.capitulos });
    expect(salvo.fases[cobertas[0]!]).toEqual({ vista: true, tentativas: 0, anterior: true });
    expect(Object.values(salvo.fases).some((estado) => estado.concluida !== undefined)).toBe(false);
    // O armazenamento da outra pessoa e as preferências não foram tocados.
    expect(await progressoSalvo(page, "flavio-bolsonaro")).toBeNull();
  });

  test("o progresso volta ao recarregar, fica separado por personagem, e apagar é uma ação própria, com confirmação, que só apaga o do personagem", async ({ page }) => {
    const fasesDaLula = fasesDe("lula");
    const fasesDoFlavio = fasesDe("flavio-bolsonaro");
    await abrir(page, "flavio-bolsonaro", 1);
    await lerESeguir(page);
    await abrir(page, "lula", 1);
    await lerESeguir(page);

    await page.reload();
    await pronto(page);
    await expect(jogo(page)).toHaveAttribute("data-fase-aberta", fasesDaLula[1]!.id);
    await page.locator("[data-abrir-fases]").click();
    const lista = await janela(page, "fases");
    await expect(lista.locator(`[data-fase-item="${fasesDaLula[0]!.id}"]`)).toHaveAttribute("data-situacao", "concluida");

    // Apagar pede confirmação, com o foco em Cancelar; Esc volta à lista sem apagar.
    await lista.locator("[data-apagar-progresso]").click();
    const apagar = await janela(page, "apagar");
    await expect(apagar.getByRole("heading", { level: 2 })).toHaveText(`Apagar o progresso de ${nomeDe("lula")}?`);
    await expect(apagar.getByRole("dialog")).toContainText("Para rever as fases desde o começo não é preciso apagar nada");
    await expect(apagar.getByRole("button", { name: "Cancelar" })).toBeFocused();
    await page.keyboard.press("Escape");
    await janela(page, "fases");
    expect((await progressoSalvo(page, "lula"))!.fases[fasesDaLula[0]!.id]!.concluida).toBe("explicacao");

    await dialogo(page, "fases").locator("[data-apagar-progresso]").click();
    await (await janela(page, "apagar")).locator("[data-confirmar-apagar]").click();
    await expect(jogo(page)).toHaveAttribute("data-vista", "base");
    await expect(jogo(page)).toHaveAttribute("data-fase-aberta", fasesDaLula[0]!.id);
    await expect(jogo(page)).toHaveAttribute("data-fase-situacao", "nova");
    expect(await progressoSalvo(page, "lula")).toBeNull();
    // O da outra pessoa e as preferências continuam lá.
    expect((await progressoSalvo(page, "flavio-bolsonaro"))!.fases[fasesDoFlavio[0]!.id]!.concluida).toBe("explicacao");
  });

  test("o endereço abre uma fase sem concluir nem apagar, e pedido que não é fase cai na retomada", async ({ page }) => {
    const slug = "flavio-bolsonaro";
    const fases = fasesDe(slug);
    await abrir(page, slug, 5);
    await expect(jogo(page)).toHaveAttribute("data-fase-aberta", fases[4]!.id);
    await expect(jogo(page)).toHaveAttribute("data-fase-situacao", "nova");
    expect(await progressoSalvo(page, slug)).toBeNull();

    for (const pedido of ["99", "abc", "0"]) {
      await page.goto(`${rota(slug)}?fase=${pedido}`);
      await pronto(page);
      await expect(jogo(page), `?fase=${pedido}`).toHaveAttribute("data-fase-aberta", fases[0]!.id);
      await expect(page).toHaveURL(new RegExp(`/jogo/${slug}/\\?fase=1$`));
    }
  });
});

test.describe("aprofundamentos", () => {
  for (const slug of PERSONAGENS) {
    for (const sala of ["economia", "seguranca-publica"] as const) {
      test(`${slug}, ${sala}: entrar direto explica o recorte e leva ao início da vida`, async ({ page }) => {
        const [fase] = fasesDe(slug, sala);
        await page.goto(rota(slug, sala));
        await pronto(page);
        await expect(jogo(page)).toHaveAttribute("data-sala", sala);
        await expect(jogo(page)).toHaveAttribute("data-fase-aberta", fase!.id);
        // O cabeçalho diz que é aprofundamento, o assunto e os anos.
        await expect(cartaoDaFase(page).locator("[data-fase-posicao]")).toHaveText(posicaoDe(fase!, 1));
        await expect(cartaoDaFase(page).locator("[data-fase-posicao]")).toContainText(/^Aprofundamento: (Economia|Segurança pública) · Fase 1 de 1 · \d{4} a \d{4}$/);
        const aviso = cartaoDaFase(page).locator("[data-aviso-aprofundamento]");
        await expect(aviso).toContainText("Aprofundamento sobre um assunto, e não o começo da trajetória.");
        await expect(page.locator("[data-rodape-do-jogo] [data-aviso-amostra]")).toContainText("amostra documentada da edição");

        // "Como funciona" repete o aviso, e a lista de fases leva à trajetória.
        await page.locator("[data-abrir-ajuda]").click();
        const ajuda = await janela(page, "ajuda");
        await expect(ajuda.locator("[data-aviso-aprofundamento]")).toContainText("não o começo da trajetória");
        await page.keyboard.press("Escape");
        await page.locator("[data-abrir-fases]").click();
        const lista = await janela(page, "fases");
        await expect(lista.locator('[data-ir-para-sala="historico"]')).toHaveAttribute("href", rota(slug));
        await page.keyboard.press("Escape");

        // O caminho para o início da vida está no próprio cabeçalho.
        const inicio = aviso.locator("[data-ir-para-o-inicio]");
        await expect(inicio).toHaveText("Ir para o início da vida");
        await expect(inicio).toHaveAttribute("href", `/jogo/${slug}/?fase=1`);
        await inicio.click();
        await pronto(page);
        await expect(jogo(page)).toHaveAttribute("data-sala", "historico");
        await expect(jogo(page)).toHaveAttribute("data-fase-aberta", `${slug}-origem`);
      });
    }
  }

  test("com progresso na trajetória, o caminho do aprofundamento para o início da vida abre a origem, e não a fase da retomada", async ({ page }) => {
    const slug = "lula";
    const [primeira, , terceira] = fasesDe(slug);
    await abrir(page, slug, 1);
    await lerESeguir(page);
    await lerESeguir(page);
    await expect(jogo(page)).toHaveAttribute("data-fase-aberta", terceira!.id);

    await page.goto(rota(slug, "economia"));
    await pronto(page);
    await cartaoDaFase(page).locator("[data-ir-para-o-inicio]").click();
    await pronto(page);
    await expect(jogo(page)).toHaveAttribute("data-sala", "historico");
    await expect(jogo(page)).toHaveAttribute("data-fase-aberta", primeira!.id);
    await expect(jogo(page)).toHaveAttribute("data-fase-situacao", "concluida");
    await expect(page).toHaveURL(new RegExp(`/jogo/${slug}/\\?fase=1$`));
    // A trajetória sem pedido continua abrindo onde a pessoa parou.
    await page.goto(rota(slug));
    await pronto(page);
    await expect(jogo(page)).toHaveAttribute("data-fase-aberta", terceira!.id);
  });

  test("o aprofundamento termina no resumo dele, com o caminho para a trajetória desde a origem", async ({ page }) => {
    const slug = "lula";
    await page.goto(rota(slug, "economia"));
    await pronto(page);
    await lerESeguir(page);
    const resumo = await janela(page, "resumo");
    await expect(resumo.getByRole("heading", { level: 2 })).toHaveText("Resumo do aprofundamento");
    await expect(resumo.locator("[data-resumo-contagem]")).toContainText("Você concluiu 1 de 1.");
    await expect(resumo.locator('[data-ir-para-sala="historico"]')).toHaveText(`A trajetória de ${nomeDe(slug)}, desde a origem`);
    await expect(resumo.locator('[data-ir-para-sala="historico"]')).toHaveAttribute("href", rota(slug));
    // O progresso do aprofundamento não conta como fase da trajetória.
    const salvo = (await progressoSalvo(page, slug))!;
    expect(Object.keys(salvo.fases)).toEqual(["lula-economia"]);
    expect(salvo.posicao).toEqual({ economia: "lula-economia" });
  });
});

test.describe("ler sem o cenário", () => {
  test("as mesmas fases, pelo teclado: abrir, responder, continuar, com o foco no título da fase seguinte", async ({ page }) => {
    const slug = "flavio-bolsonaro";
    const fases = fasesDe(slug);
    const [primeira, segunda] = fases;
    await page.goto(`${rota(slug)}?fase=1&leitura=1`);
    await pronto(page, false);
    await expect(jogo(page)).toHaveAttribute("data-modo", "leitura");
    await expect(page.locator("[data-palco]")).toHaveCount(0);
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page.locator("[data-aviso-leitura]")).toContainText("Você está lendo sem o cenário: as mesmas fases, com a explicação, a atividade e as fontes.");

    // A fase está na página, com o mesmo conteúdo da janela; abrir a página já é ler a explicação.
    const leitura = page.locator("[data-leitura-da-fase]");
    await expect(leitura.locator("[data-fase-posicao]")).toHaveText(posicaoDe(primeira!, fases.length));
    await expect(leitura.locator("[data-fase-titulo]")).toHaveText(primeira!.titulo);
    await expect(leitura.locator("[data-bloco]")).toHaveText(primeira!.explicacao.map((bloco) => bloco.texto));
    await expect(jogo(page)).toHaveAttribute("data-fase-situacao", "vista");

    // Só com o teclado: escolher a opção, responder e continuar.
    await leitura.locator(`[data-opcao="${opcoesDe(primeira!).certa}"]`).press("Enter");
    await expect(leitura.locator(`[data-opcao="${opcoesDe(primeira!).certa}"]`)).toHaveAttribute("aria-pressed", "true");
    await leitura.locator("[data-responder]").press("Enter");
    await expect(leitura.locator("[data-resultado]")).toHaveAttribute("data-resultado", "certo");
    await leitura.locator(`[data-continuar="${segunda!.id}"]`).press("Enter");
    await expect(jogo(page)).toHaveAttribute("data-fase-aberta", segunda!.id);
    await expect(leitura.locator("[data-fase-posicao]")).toHaveText(posicaoDe(segunda!, fases.length));
    await expect(leitura.locator("[data-fase-titulo]")).toBeFocused();
    await expect(leitura.locator("[data-bloco]")).toHaveText(segunda!.explicacao.map((bloco) => bloco.texto));

    // Fase anterior e fase seguinte ficam no fim da página, e as janelas (fases, como funciona) continuam à mão.
    await page.locator(`button[data-fase-anterior="${primeira!.id}"]`).press("Enter");
    await expect(jogo(page)).toHaveAttribute("data-fase-aberta", primeira!.id);
    await expect(leitura.locator("[data-veredito]")).toHaveText("Você já concluiu esta fase. A explicação:");
    await page.locator("[data-abrir-fases]").press("Enter");
    const lista = await janela(page, "fases");
    await expect(lista.locator("[data-alternar-leitura]")).toHaveAttribute("data-alternar-leitura", "leitura");
    await page.keyboard.press("Escape");

    // A escolha fica guardada como preferência, e o pedido sai do endereço; voltar ao cenário desfaz.
    await expect(page).toHaveURL(new RegExp(`/jogo/${slug}/\\?fase=1$`));
    expect(await page.evaluate((chave) => JSON.parse(window.localStorage.getItem(chave)!), PREFERENCES_KEY)).toMatchObject({ cenario: false });
    await page.locator("[data-voltar-ao-cenario]").click();
    await expect(jogo(page)).toHaveAttribute("data-modo", "cenario");
    await pronto(page);
  });

  test("apagar o progresso com a fase aberta na leitura sem o cenário devolve a atividade: dá para responder de novo", async ({ page }) => {
    const slug = "lula";
    const [primeira] = fasesDe(slug);
    const { certa, errada } = opcoesDe(primeira!);
    await page.goto(`${rota(slug)}?fase=1&leitura=1`);
    await pronto(page, false);
    const leitura = page.locator("[data-leitura-da-fase]");
    await responder(leitura, certa);
    await expect(leitura.locator("[data-resultado]")).toHaveAttribute("data-resultado", "certo");
    await expect(leitura.locator("[data-responder]")).toHaveCount(0);
    expect((await progressoSalvo(page, slug))!.fases[primeira!.id]!.concluida).toBe("resposta");

    // A fase fica montada sob as janelas: apagar com ela aberta não pode deixar a resposta antiga na tela.
    await page.locator("[data-abrir-fases]").click();
    await (await janela(page, "fases")).locator("[data-apagar-progresso]").click();
    await (await janela(page, "apagar")).locator("[data-confirmar-apagar]").click();
    await expect(jogo(page)).toHaveAttribute("data-vista", "base");
    await expect(jogo(page)).toHaveAttribute("data-fase-aberta", primeira!.id);
    await expect(leitura.locator("[data-resultado]")).toHaveCount(0);
    await expect(leitura.locator("[data-responder]")).toBeDisabled();
    await expect(leitura.locator(`[data-opcao="${certa}"]`)).toHaveAttribute("aria-pressed", "false");
    // A página continua aberta na explicação: a fase volta a constar como lida, e não como concluída.
    await expect(jogo(page)).toHaveAttribute("data-fase-situacao", "vista");
    await expect.poll(async () => (await progressoSalvo(page, slug))?.fases[primeira!.id]).toEqual({ vista: true, tentativas: 0 });

    // A atividade responde de novo, do zero: um erro conta como a primeira tentativa.
    await responder(leitura, errada);
    await expect(leitura.locator("[data-resultado]")).toHaveAttribute("data-resultado", "errado");
    expect((await progressoSalvo(page, slug))!.fases[primeira!.id]).toMatchObject({ vista: true, tentativas: 1 });
    await leitura.locator("[data-tentar-de-novo]").click();
    await responder(leitura, certa);
    await expect(leitura.locator("[data-resultado]")).toHaveAttribute("data-resultado", "certo");
    expect((await progressoSalvo(page, slug))!.fases[primeira!.id]!.concluida).toBe("resposta");
  });

  test("na última fase, errar e ver o resumo deixa a fase com a explicação, e não com o aviso do erro; e a ajuda não fala em pasta", async ({ page }) => {
    const slug = "flavio-bolsonaro";
    const [fase] = fasesDe(slug, "economia");
    await page.goto(`${rota(slug, "economia")}?leitura=1`);
    await pronto(page, false);
    await expect(jogo(page)).toHaveAttribute("data-modo", "leitura");

    // "Como funciona", sem o cenário: não há pasta em destaque nem botão de abrir o marco.
    await page.locator("[data-abrir-ajuda]").click();
    const ajuda = await janela(page, "ajuda");
    await expect(ajuda.locator("[data-passo-de-abrir]")).toHaveText("Sem o cenário, a fase já está aberta na página.");
    await expect(ajuda.locator("[data-passo-de-continuar]")).toHaveText("Use Continuar para ir à próxima fase. Os outros registros são opcionais.");
    await page.keyboard.press("Escape");

    // O aprofundamento tem uma fase só: depois do erro, seguir abre o resumo, e a fase continua na página.
    const leitura = page.locator("[data-leitura-da-fase]");
    await responder(leitura, opcoesDe(fase!).errada);
    await expect(leitura.locator("[data-resultado]")).toHaveAttribute("data-resultado", "errado");
    await expect(leitura.locator("[data-seguir-sem-responder]")).toHaveText("Ver o resumo");
    await leitura.locator("[data-seguir-sem-responder]").click();
    const resumo = await janela(page, "resumo");
    await resumo.locator("[data-fechar-resumo]").click();
    await expect(dialogo(page, "resumo")).toHaveCount(0);

    // A fase foi concluída pela leitura: o veredito é o da explicação, sem a fala de tentar de novo.
    await expect(jogo(page)).toHaveAttribute("data-fase-situacao", "concluida");
    await expect(leitura.locator("[data-resultado]")).toHaveAttribute("data-resultado", "explicacao");
    await expect(leitura.locator("[data-veredito]")).toHaveText("A explicação:");
    await expect(leitura.locator("[data-tentar-de-novo]")).toHaveCount(0);
    await expect(leitura.locator('[data-continuar="resumo"]')).toBeVisible();
    // O botão que abriu o resumo saiu da tela: o foco vai para o de continuar, e não se perde no corpo da página.
    await expect(leitura.locator('[data-continuar="resumo"]')).toBeFocused();
    await expect(leitura.locator(`[data-opcao="${opcoesDe(fase!).certa}"]`)).toHaveAttribute("data-certa", "sim");
    expect((await progressoSalvo(page, slug))!.fases[fase!.id]).toMatchObject({ concluida: "explicacao", tentativas: 1 });
  });

  test("quando o navegador não dá o canvas, a cena sai e a leitura sem o cenário continua inteira", async ({ page }) => {
    const slug = "lula";
    const [primeira, segunda] = fasesDe(slug);
    await page.addInitScript(() => {
      HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext;
    });
    await page.goto(`${rota(slug)}?fase=1`);
    await pronto(page, false);
    const aviso = page.locator('[data-palco="sem-canvas"]');
    await expect(aviso).toContainText("O navegador não conseguiu desenhar a cena");
    await expect(aviso).toContainText("Nada se perde");
    // O cabeçalho da fase e o botão principal continuam lá, e o botão abre a explicação sem a cena.
    await expect(cartaoDaFase(page).locator("[data-fase-titulo]")).toHaveText(primeira!.titulo);

    await aviso.locator("[data-ler-sem-cenario-do-aviso]").click();
    await expect(jogo(page)).toHaveAttribute("data-modo", "leitura");
    await expect(page.locator("[data-aviso-leitura]")).toContainText("O navegador não conseguiu desenhar a cena.");
    await expect(page.locator("[data-voltar-ao-cenario]")).toHaveCount(0);
    const leitura = page.locator("[data-leitura-da-fase]");
    await expect(leitura.locator("[data-bloco]")).toHaveText(primeira!.explicacao.map((bloco) => bloco.texto));
    await responder(leitura, opcoesDe(primeira!).certa);
    await expect(leitura.locator("[data-resultado]")).toHaveAttribute("data-resultado", "certo");
    await leitura.locator("[data-continuar]").click();
    await expect(jogo(page)).toHaveAttribute("data-fase-aberta", segunda!.id);
    // A preferência guardada não muda por causa de uma falha: é só desta visita.
    expect(await page.evaluate((chave) => window.localStorage.getItem(chave), PREFERENCES_KEY)).toBeNull();
  });

  test("sem JavaScript, as fases estão no HTML, em texto, com a explicação e a resposta", async ({ request }) => {
    for (const slug of PERSONAGENS) {
      const fases = fasesDe(slug);
      const html = (await (await request.get(rota(slug))).text()).replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, "&");
      const semScript = html.slice(html.indexOf("<noscript>"), html.lastIndexOf("</noscript>"));
      expect(semScript, slug).toContain("O cenário do jogo precisa de JavaScript");
      expect(semScript, slug).toContain(`/politicos/${slug}/`);
      for (const fase of fases) {
        expect(semScript, fase.id).toContain(fase.titulo);
        expect(semScript, fase.id).toContain(fase.explicacao[0]!.texto);
        expect(semScript, fase.id).toContain(fase.atividade.enunciado);
        expect(semScript, fase.id).toContain(fase.atividade.explicacao);
      }
      // O que explica a página já vem no documento, antes de qualquer script: a primeira fase e os avisos.
      expect(html, slug).toContain(fases[0]!.titulo);
      expect(html, slug).toContain("O cenário é uma representação");
      expect(html, slug).toContain("Revisão humana pendente");
    }
  });
});

test.describe("Escrivão", () => {
  test("uma instrução e, no máximo, uma fala de humor; desligar tira o humor na hora e mantém a instrução", async ({ page }) => {
    const slug = "lula";
    const [primeira] = fasesDe(slug);
    await abrir(page, slug, 1);
    await expect(jogo(page)).toHaveAttribute("data-humor", "ligado");
    await expect(cartaoDaFase(page).locator("[data-proximo-passo]")).toHaveCount(1);
    await expect(cartaoDaFase(page).locator('[data-camada="humor"]')).toHaveCount(1);
    await expect(cartaoDaFase(page).locator('[data-camada="humor"]')).toContainText("Humor do Escrivão, ficção:");

    // Como funciona: o guia é fictício, e o humor se desliga ali mesmo.
    await page.locator("[data-abrir-ajuda]").click();
    const ajuda = await janela(page, "ajuda");
    await expect(ajuda.getByRole("dialog")).toContainText("Escrivão · personagem fictício");
    await expect(ajuda.locator('[data-escrivao="ajuda"] [data-camada]')).toHaveCount(2);
    await ajuda.locator("[data-humor]").click();
    await expect(ajuda.locator("[data-humor]")).toHaveText("Ligar o humor");
    await expect(ajuda.locator("[data-humor]")).toHaveAttribute("aria-pressed", "false");
    // Na hora: a fala de humor some da janela aberta, e a instrução fica.
    await expect(ajuda.locator('[data-escrivao="ajuda"] [data-camada]')).toHaveCount(1);
    await expect(ajuda.locator('[data-escrivao="ajuda"] [data-camada="instrucao"]')).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(jogo(page)).toHaveAttribute("data-humor", "desligado");
    await expect(cartaoDaFase(page).locator('[data-camada="humor"]')).toHaveCount(0);
    await expect(cartaoDaFase(page).locator("[data-proximo-passo]")).toContainText("Toque na pasta em destaque");

    // O erro continua com a explicação e a instrução, sem humor; a preferência vale depois de recarregar.
    const fase = await abrirMarco(page);
    await responder(fase, opcoesDe(primeira!).errada);
    await expect(fase.locator('[data-escrivao="erro"] [data-camada]')).toHaveCount(1);
    await expect(fase.locator("[data-explicacao-da-resposta]")).toHaveText(primeira!.atividade.explicacao);
    await page.reload();
    await pronto(page);
    await expect(jogo(page)).toHaveAttribute("data-humor", "desligado");
    await expect(cartaoDaFase(page).locator('[data-camada="humor"]')).toHaveCount(0);
  });

  for (const slug of PERSONAGENS) {
    test(`${slug}: na fase de processos não há humor, mesmo com a preferência ligada`, async ({ page }) => {
      const content = conteudoDe(slug);
      const fase = content.fases.find((item) => item.id === `${slug}-processos`)!;
      expect(fase.sensivel).toBe(true);
      await abrir(page, slug, fase.numero);
      await expect(jogo(page)).toHaveAttribute("data-humor", "ligado");
      await expect(cartaoDaFase(page).locator("[data-proximo-passo]")).toContainText("Toque na pasta em destaque");
      await expect(cartaoDaFase(page).locator('[data-camada="humor"]')).toHaveCount(0);

      const aberta = await abrirMarco(page);
      const ordem = ordemDe(fase, content);
      for (const chave of [...ordem].reverse()) await aberta.locator(`[data-ordem-item="${chave}"]`).click();
      await aberta.locator("[data-responder]").click();
      await expect(aberta.locator("[data-resultado]")).toHaveAttribute("data-resultado", "errado");
      await expect(aberta.locator('[data-escrivao="erro"] [data-camada]')).toHaveCount(1);
      await expect(aberta.locator('[data-escrivao="erro"] [data-camada="instrucao"]')).toBeVisible();
      // A leitura inicial traz a ficha judicial, com o aviso do que o jogo não pede.
      await expect(aberta.locator("[data-ficha-judicial] [data-aviso-judicial]")).toHaveText(JUDICIAL_NOTICE);
      // Concluir também não traz humor.
      await aberta.locator("[data-tentar-de-novo]").click();
      for (const chave of ordem) await aberta.locator(`[data-ordem-item="${chave}"]`).click();
      await aberta.locator("[data-responder]").click();
      await expect(aberta.locator("[data-resultado]")).toHaveAttribute("data-resultado", "certo");
      await expect(aberta.locator('[data-escrivao="conclusao"] [data-camada="humor"]')).toHaveCount(0);
      await expect(aberta.locator('[data-escrivao="conclusao"] [data-camada="instrucao"]')).toBeVisible();
    });
  }
});

test.describe("o que cada fase ensina", () => {
  for (const slug of PERSONAGENS) {
    test(`${slug}: a fase de processos traz a acusação, a defesa, a decisão e o desfecho, com os termos e os registros relacionados`, async ({ page }) => {
      const content = conteudoDe(slug);
      const fase = content.fases.find((item) => item.id === `${slug}-processos`)!;
      await abrir(page, slug, fase.numero);
      const aberta = await abrirMarco(page);
      await expect(aberta.locator("[data-bloco]")).toHaveText(fase.explicacao.map((bloco) => bloco.texto));
      await expect(aberta.getByRole("dialog")).toContainText(/A defesa (pediu|disse)/);

      // Os termos da fase abrem no próprio texto, com a definição, o que ela simplifica e o texto oficial.
      await expect(aberta.locator("[data-conceito]")).toHaveCount(fase.conceitos.length);
      const anulacao = aberta.locator('[data-conceito="anulacao"]');
      await anulacao.locator("summary").click();
      await expect(anulacao.locator("[data-definicao]")).toHaveText(content.conceitos.anulacao!.definicao);
      await expect(anulacao.locator("[data-simplificacao]")).toContainText(content.conceitos.anulacao!.simplificacao!);
      await expect(anulacao.locator("[data-fonte] a").first()).toHaveAttribute("href", /^https:\/\//);

      // O marco é um episódio judicial: o registro traz a natureza, os registros relacionados e o aviso.
      await aberta.locator("[data-fontes-da-fase] summary").click();
      await aberta.locator(`[data-apoio="${refKey(fase.marco)}"] [data-abrir-registro]`).click();
      const registro = await janela(page, "registro");
      await expect(registro.locator("[data-ficha-judicial] [data-natureza]")).toContainText(/Não é absolvição nem condenação/);
      await expect(registro.locator("[data-relacionado]")).not.toHaveCount(0);
      await expect(registro.locator("[data-aviso-judicial]")).toHaveText(JUDICIAL_NOTICE);
      await expect(registro.locator("[data-contexto]")).toContainText(content.registros[fase.marco.id]!.contexto.slice(0, 60));
      // Registro de contexto sensível: o Escrivão dá a instrução, sem humor.
      await expect(registro.locator('[data-escrivao="explorar"] [data-camada]')).toHaveCount(1);
    });

    test(`${slug}: a fase da eleição de 2026 mostra propostas como propostas, leva a todas e termina no resumo, sem troféu nem juízo`, async ({ page }) => {
      const content = conteudoDe(slug);
      const fases = content.fases;
      const ultima = fases.at(-1)!;
      const outro = PERSONAGENS.find((item) => item !== slug)!;
      await abrir(page, slug, ultima.numero);
      const fase = await abrirMarco(page);

      const propostas = fase.locator('[data-explorar] [data-abrir-registro^="proposta:"]');
      await expect(propostas).toHaveCount(7);
      await expect(fase.locator("[data-explorar] [data-aviso-de-proposta]")).toContainText("dizem o que o documento propõe, e não o que foi feito");
      await expect(fase.locator("[data-todas-as-propostas]")).toHaveAttribute("href", "/comparar/#propostas");
      const primeira = `proposta-${slug}-2026-economia-1`;
      await fase.locator(`[data-explorar] [data-abrir-registro="proposta:${primeira}"]`).click();
      const registro = await janela(page, "registro");
      await expect(registro.getByRole("heading", { level: 2 })).toHaveText("O que o documento registrado propõe");
      await expect(registro.locator("[data-proposta-texto]")).toHaveText(content.propostas[primeira]!.texto);
      await expect(registro.locator("[data-aviso-de-proposta]")).toHaveText(PROPOSAL_NOTICE);
      await expect(registro.locator("[data-fonte] a").first()).toHaveAttribute("href", /tse\.jus\.br/);
      // A proposta traz o próprio aviso: o Escrivão não comenta.
      await expect(registro.locator("[data-escrivao]")).toHaveCount(0);
      await registro.locator("[data-fechar-registro]").click();
      await expect(dialogo(page, "registro")).toHaveCount(0);

      await fase.locator("[data-ver-explicacao]").click();
      await expect(fase.locator("[data-explicacao-da-resposta]")).toContainText("Não é lei, voto nem resultado");
      await expect(fase.locator('[data-continuar="resumo"]')).toHaveText(/Ver o resumo/);
      await fase.locator('[data-continuar="resumo"]').click();

      const resumo = await janela(page, "resumo");
      await expect(resumo.getByRole("heading", { level: 2 })).toHaveText("Resumo da trajetória");
      await expect(resumo.locator("[data-resumo-contagem]")).toContainText(`tem ${fases.length} fases nesta edição, com marcos documentados de ${fases[0]!.periodo.de} a ${ultima.periodo.ate}. Você concluiu 1 de ${fases.length}.`);
      await expect(resumo.locator("[data-resumo-contagem]")).toContainText("São marcos documentados, e não a vida inteira nem tudo o que a pessoa fez.");
      await expect(resumo.locator("[data-resumo-fase]")).toHaveCount(fases.length);
      await expect(resumo.locator(`[data-resumo-fase="${fases[0]!.id}"]`)).toContainText(`Para ${fases[0]!.objetivo}`);
      // As lacunas, com o nome que a tela usa em todo lugar.
      const lacunas = fases.flatMap((item) => item.lacunas);
      await expect(resumo.locator("[data-resumo-lacunas]").getByRole("heading", { level: 3 })).toHaveText("Ainda não pesquisado nesta edição");
      await expect(resumo.locator("[data-resumo-lacunas] li")).toHaveCount(lacunas.length);
      // Os caminhos: a outra trajetória, a comparação, as propostas por área e os aprofundamentos.
      await expect(resumo.locator(`[data-outra-trajetoria="${outro}"]`)).toHaveAttribute("href", rota(outro));
      await expect(resumo.locator("[data-ir-para-comparar]")).toHaveAttribute("href", "/comparar/");
      await expect(resumo.locator("[data-ir-para-propostas]")).toHaveAttribute("href", "/comparar/#propostas");
      await expect(resumo.locator('[data-ir-para-sala="economia"]')).toHaveAttribute("href", rota(slug, "economia"));
      await expect(resumo.locator('[data-ir-para-sala="seguranca-publica"]')).toHaveAttribute("href", rota(slug, "seguranca-publica"));
      // Uma lista, e não um prêmio: nada de troféu, nota, pontos ou vencedor.
      const texto = ((await resumo.getByRole("dialog").textContent()) ?? "").toLowerCase();
      for (const palavra of ["parabéns", "troféu", "medalha", "pontos", "pontuação", "ranking", "vencedor", "venceu o jogo", "nota final", "melhor candidato"]) expect(texto, palavra).not.toContain(palavra);

      // Rever uma fase pelo resumo é navegação.
      await resumo.locator(`[data-resumo-fase="${fases[0]!.id}"] [data-abrir-fase]`).click();
      await expect(jogo(page)).toHaveAttribute("data-fase-aberta", fases[0]!.id);
      expect((await progressoSalvo(page, slug))!.fases[ultima.id]!.concluida).toBe("explicacao");
    });
  }

  test("as fases de voto separam o voto da pessoa do resultado da votação, e o cartão do voto diz que ele vale para o objeto votado", async ({ page }) => {
    const slug = "flavio-bolsonaro";
    const content = conteudoDe(slug);
    const fase = content.fases.find((item) => item.id === "flavio-bolsonaro-decisoes-no-senado")!;
    await abrir(page, slug, fase.numero);
    const aberta = await abrirMarco(page);
    await expect(aberta.locator("[data-bloco]").first()).toContainText("votou não; a proposta foi aprovada");
    const voto = fase.explorar[0]!;
    await aberta.locator(`[data-explorar] [data-abrir-registro="${refKey(voto)}"]`).click();
    const registro = await janela(page, "registro");
    const cartao = registro.locator(`[data-decisao-cartao="${voto.id}"]`);
    await expect(cartao).toHaveAttribute("data-natureza", "voto");
    await expect(cartao.locator("[data-aviso-objeto]")).toContainText("vale para o objeto votado, e não para o projeto inteiro nem para um tema");
    await expect(cartao.locator("[data-manifestacao]")).toBeVisible();
    await expect(cartao.locator("[data-resultado]")).toBeVisible();
  });
});

test.describe("celular", () => {
  for (const viewport of [
    { width: 360, height: 640 },
    { width: 390, height: 844 },
  ]) {
    test(`${viewport.width} por ${viewport.height}: nada passa da largura, os alvos de toque têm 44 pixels e a instrução não cobre o botão principal`, async ({ browser, baseURL }) => {
      const context = await browser.newContext({ baseURL, viewport, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
      const page = await context.newPage();
      const errosDoCelular = vigiar(page);
      const slug = "flavio-bolsonaro";
      const terceira = fasesDe(slug)[2]!;

      await page.goto("/jogo/");
      await expect(page.locator(`[data-escolha="${slug}"]`)).toHaveAttribute("data-situacao", "inicio");
      expect(await sobraHorizontal(page), "entrada").toBeLessThanOrEqual(0);
      for (const alvo of await page.locator("[data-comecar], [data-ler-sem-cenario], [data-fases-da-trilha] summary, [data-abrir-sala]").all()) {
        expect((await alvo.boundingBox())!.height, await alvo.textContent() ?? "").toBeGreaterThanOrEqual(44);
      }

      await page.goto(`${rota(slug)}?fase=3`);
      await pronto(page);
      expect(await sobraHorizontal(page), "fase, com o cenário").toBeLessThanOrEqual(0);
      const cartao = (await page.locator("[data-fase-cartao]").boundingBox())!;
      const principal = (await page.locator("[data-abrir-marco]").boundingBox())!;
      expect(principal.height).toBeGreaterThanOrEqual(44);
      expect(principal.width).toBeGreaterThanOrEqual(44);
      // O cartão da fase fica em cima, e o botão principal, embaixo: um não cobre o outro.
      expect(cartao.y + cartao.height).toBeLessThanOrEqual(principal.y);
      await expect(page.locator("[data-abrir-marco]")).toBeInViewport({ ratio: 1 });
      for (const alvo of await page.locator("[data-ler-sem-cenario], [data-abrir-fases], [data-abrir-ajuda], [data-marcador]").all()) {
        const caixa = (await alvo.boundingBox())!;
        expect(Math.min(caixa.width, caixa.height)).toBeGreaterThanOrEqual(44);
      }
      // Os três caminhos ficam em uma linha, acima do cartão da fase: nenhum botão solto sobre a cena.
      const caminhos = (await page.locator("[data-caminhos-do-jogo]").boundingBox())!;
      expect(caminhos.y + caminhos.height).toBeLessThanOrEqual(cartao.y);
      for (const botao of await page.locator("[data-caminhos-do-jogo] button").all()) {
        const caixa = (await botao.boundingBox())!;
        expect(Math.abs(caixa.y - caminhos.y), "os três na mesma linha").toBeLessThanOrEqual(1);
      }
      // A cena inteira fica no espaço livre: toda pasta está dentro da tela, entre o cartão e o botão principal,
      // e no ponto de cada uma o que recebe o toque é ela, e não um pedaço da interface.
      const pastas = page.locator("[data-marcador]:visible");
      await expect(page.locator('[data-marcador="marco"]')).toBeVisible();
      const centros: { x: number; y: number }[] = [];
      for (const pasta of await pastas.all()) {
        const nome = await pasta.getAttribute("data-marcador");
        const caixa = (await pasta.boundingBox())!;
        const centro = { x: caixa.x + caixa.width / 2, y: caixa.y + caixa.height / 2 };
        expect(centro.x, `${nome}: dentro da largura`).toBeGreaterThan(0);
        expect(centro.x, `${nome}: dentro da largura`).toBeLessThan(viewport.width);
        expect(centro.y, `${nome}: abaixo do cartão`).toBeGreaterThan(cartao.y + cartao.height);
        expect(centro.y, `${nome}: acima do botão principal`).toBeLessThan(principal.y);
        expect(await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.closest("[data-marcador]")?.getAttribute("data-marcador") ?? null, centro), `${nome}: recebe o toque`).toBe(nome);
        // Nenhuma pasta com botão fica tão perto de outra que as áreas de toque se confundam.
        for (const outro of centros) expect(Math.hypot(outro.x - centro.x, outro.y - centro.y), `${nome}: longe das outras`).toBeGreaterThanOrEqual(44);
        centros.push(centro);
      }
      // A pasta do marco, a que importa, fica inteira na faixa livre, com a área de toque toda.
      const marco = (await page.locator('[data-marcador="marco"]').boundingBox())!;
      expect(marco.y).toBeGreaterThanOrEqual(cartao.y + cartao.height - 1);
      expect(marco.y + marco.height).toBeLessThanOrEqual(principal.y + 1);
      expect(marco.x).toBeGreaterThanOrEqual(-1);
      expect(marco.x + marco.width).toBeLessThanOrEqual(viewport.width + 1);

      // O toque abre a explicação, e a janela cabe na tela, com o texto e os botões dentro dela.
      await page.locator("[data-abrir-marco]").tap();
      const fase = await janela(page, "fase");
      const caixa = (await fase.getByRole("dialog").boundingBox())!;
      expect(caixa.x).toBeGreaterThanOrEqual(0);
      expect(caixa.x + caixa.width).toBeLessThanOrEqual(viewport.width);
      expect(caixa.y + caixa.height).toBeLessThanOrEqual(viewport.height);
      expect(await sobraHorizontal(page), "janela da fase").toBeLessThanOrEqual(0);
      await expect(fase.locator("[data-fase-titulo]")).toHaveText(terceira.titulo);
      for (const alvo of await fase.locator("[data-opcao], [data-responder], [data-ver-explicacao], [data-conceito] summary, [data-fontes-da-fase] summary, [data-fechar-fase]").all()) {
        expect((await alvo.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      }
      await fase.locator(`[data-opcao="${opcoesDe(terceira).certa}"]`).tap();
      await fase.locator("[data-responder]").tap();
      await expect(fase.locator("[data-resultado]")).toHaveAttribute("data-resultado", "certo");
      expect((await fase.locator("[data-continuar]").boundingBox())!.height).toBeGreaterThanOrEqual(44);

      // Sem o cenário, a página de leitura também não passa da largura.
      await page.goto(`${rota(slug)}?fase=3&leitura=1`);
      await pronto(page, false);
      expect(await sobraHorizontal(page), "leitura sem o cenário").toBeLessThanOrEqual(0);
      expect(errosDoCelular, "erros não tratados na página").toEqual([]);
      await context.close();
    });
  }

  for (const viewport of [
    { width: 360, height: 640 },
    { width: 390, height: 844 },
  ]) {
    test(`${viewport.width} por ${viewport.height}: todo controle das telas do jogo tem 44 pixels, inclusive os links das fontes e os caminhos do resumo`, async ({ browser, baseURL }) => {
      test.slow();
      const context = await browser.newContext({ baseURL, viewport, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
      const page = await context.newPage();
      const errosDoCelular = vigiar(page);
      const slug = "lula";
      const fases = fasesDe(slug);
      // Uma fase com pergunta e uma decisão entre os registros opcionais, a de processos e a última, que traz as propostas.
      const comDecisao = fases.find((fase) => fase.atividade.tipo === "pergunta" && fase.explorar.some((item) => item.tipo === "decisao"))!;
      const deProcessos = fases.find((fase) => fase.sensivel && fase.atividade.tipo === "ordem")!;
      const ultima = fases.at(-1)!;
      expect(ultima.explorar.some((item) => item.tipo === "proposta"), "a última fase traz propostas").toBe(true);

      const conferir = async (raiz: Locator, onde: string) => expect(await alvosPequenos(raiz), onde).toEqual([]);
      // Abre os blocos fechados, um de cada vez: a lista muda a cada toque, e por isso é lida de novo.
      const abrirTudo = async (raiz: Locator) => {
        const fechados = raiz.locator("details:not([open]) > summary");
        for (let restam = await fechados.count(); restam > 0; restam = await fechados.count()) await fechados.first().tap();
      };
      const fecharRegistro = async () => {
        await dialogo(page, "registro").locator("[data-fechar-registro]").tap();
        await expect(dialogo(page, "registro")).toHaveCount(0);
      };

      // A entrada: os cartões das duas trajetórias, com as fases abertas, e o caminho para a metodologia.
      await page.goto("/jogo/");
      await expect(page.locator(`[data-escolha="${slug}"]`)).toHaveAttribute("data-situacao", "inicio");
      for (const cartao of await page.locator("[data-escolha]").all()) {
        await abrirTudo(cartao);
        await conferir(cartao, "entrada, cartão da trajetória");
      }
      await conferir(page.locator("[data-revisao]").first(), "entrada, caminho para a metodologia");

      // A cena, com o cartão da fase, os três caminhos, as pastas e o botão principal.
      await abrir(page, slug, comDecisao.numero);
      await conferir(page.locator("[data-cena-e-hud]"), "cena");

      // A fase aberta, com os termos e as fontes à vista.
      await page.locator("[data-abrir-marco]").tap();
      let fase = await janela(page, "fase");
      await abrirTudo(fase);
      await conferir(fase, "fase aberta, com termos e fontes");

      // Uma decisão aberta por cima da fase.
      await fase.locator('[data-explorar] [data-abrir-registro^="decisao:"]').first().tap();
      await conferir(await janela(page, "registro"), "registro: decisão");
      await fecharRegistro();

      // A resposta errada e a certa.
      fase = await janela(page, "fase");
      const { certa, errada } = opcoesDe(comDecisao);
      await fase.locator(`[data-opcao="${errada}"]`).tap();
      await fase.locator("[data-responder]").tap();
      await expect(fase.locator("[data-resultado]")).toHaveAttribute("data-resultado", "errado");
      await conferir(fase, "fase, resposta errada");
      await fase.locator("[data-tentar-de-novo]").tap();
      await fase.locator(`[data-opcao="${certa}"]`).tap();
      await fase.locator("[data-responder]").tap();
      await expect(fase.locator("[data-resultado]")).toHaveAttribute("data-resultado", "certo");
      await conferir(fase, "fase, resposta certa");
      await fase.locator("[data-fechar-fase]").tap();
      await expect(dialogo(page, "fase")).toHaveCount(0);

      // A lista de fases, a confirmação de apagar e a ajuda.
      await page.locator("[data-abrir-fases]").tap();
      await conferir(await janela(page, "fases"), "lista de fases");
      await dialogo(page, "fases").locator("[data-apagar-progresso]").tap();
      const apagar = await janela(page, "apagar");
      await conferir(apagar, "confirmação de apagar");
      await apagar.getByRole("button", { name: "Cancelar" }).tap();
      await expect(dialogo(page, "apagar")).toHaveCount(0);
      await (await janela(page, "fases")).getByRole("button", { name: "Fechar" }).tap();
      await expect(dialogo(page, "fases")).toHaveCount(0);
      await page.locator("[data-abrir-ajuda]").tap();
      const ajuda = await janela(page, "ajuda");
      await conferir(ajuda, "como funciona");
      await ajuda.getByRole("button", { name: "Entendi" }).tap();
      await expect(dialogo(page, "ajuda")).toHaveCount(0);

      // O registro de um episódio de processo, com a ficha judicial e as fontes.
      await abrir(page, slug, deProcessos.numero);
      await page.locator("[data-abrir-marco]").tap();
      fase = await janela(page, "fase");
      await abrirTudo(fase);
      await conferir(fase, "fase de processos, com termos e fontes");
      await fase.locator('[data-fontes-da-fase] [data-abrir-registro^="acontecimento:"]').first().tap();
      await conferir(await janela(page, "registro"), "registro: acontecimento de processo");
      await fecharRegistro();

      // A fase de 2026: uma proposta aberta e, pela leitura da explicação, o resumo.
      await abrir(page, slug, ultima.numero);
      await page.locator("[data-abrir-marco]").tap();
      fase = await janela(page, "fase");
      await abrirTudo(fase);
      await conferir(fase, "fase de 2026, com as propostas");
      await fase.locator('[data-explorar] [data-abrir-registro^="proposta:"]').first().tap();
      await conferir(await janela(page, "registro"), "registro: proposta");
      await fecharRegistro();
      fase = await janela(page, "fase");
      await fase.locator("[data-ver-explicacao]").tap();
      await fase.locator('[data-continuar="resumo"]').tap();
      await conferir(await janela(page, "resumo"), "resumo da trajetória");

      // O aprofundamento, com o caminho para o início da vida, na cena e na leitura sem o cenário.
      await page.goto(rota(slug, "economia"));
      await pronto(page);
      await conferir(page.locator("[data-cena-e-hud]"), "cena do aprofundamento");
      await page.goto(`${rota(slug, "economia")}?leitura=1`);
      await pronto(page, false);
      await expect(page.locator("[data-leitura-da-fase]")).toBeVisible();
      await abrirTudo(jogo(page));
      await conferir(jogo(page), "leitura sem o cenário, aprofundamento");
      const inicio = (await page.locator("[data-aviso-aprofundamento] [data-ir-para-o-inicio]").boundingBox())!;
      expect(inicio.height, "Ir para o início da vida, na leitura").toBeGreaterThanOrEqual(44);

      // A leitura sem o cenário de uma fase de processos, e o rodapé da página.
      await page.goto(`${rota(slug)}?fase=${deProcessos.numero}&leitura=1`);
      await pronto(page, false);
      await expect(page.locator("[data-leitura-da-fase]")).toBeVisible();
      await abrirTudo(jogo(page));
      await conferir(jogo(page), "leitura sem o cenário, fase de processos");
      await conferir(page.locator("[data-rodape-do-jogo]"), "rodapé da página do jogo");

      expect(errosDoCelular, "erros não tratados na página").toEqual([]);
      await context.close();
    });
  }

  test("360 por 640, na retomada: o aviso cabe no cartão sem cobrir o botão principal, e o caminho para o início tem 44 pixels", async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, viewport: { width: 360, height: 640 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
    const page = await context.newPage();
    const slug = "flavio-bolsonaro";
    const [primeira, , terceira] = fasesDe(slug);
    await page.goto(`${rota(slug)}?fase=1`);
    await pronto(page);
    for (let vez = 0; vez < 2; vez += 1) {
      await page.locator("[data-abrir-marco]").tap();
      const fase = await janela(page, "fase");
      await fase.locator("[data-ver-explicacao]").tap();
      await fase.locator("[data-continuar]").tap();
    }
    await page.goto(rota(slug));
    await pronto(page);
    await expect(jogo(page)).toHaveAttribute("data-fase-aberta", terceira!.id);
    const aviso = page.locator("[data-fase-cartao] [data-aviso-retomada]");
    await expect(aviso).toBeVisible();
    expect(await sobraHorizontal(page)).toBeLessThanOrEqual(0);
    const cartao = (await page.locator("[data-fase-cartao]").boundingBox())!;
    const principal = (await page.locator("[data-abrir-marco]").boundingBox())!;
    expect(cartao.y + cartao.height).toBeLessThanOrEqual(principal.y);
    await expect(page.locator("[data-abrir-marco]")).toBeInViewport({ ratio: 1 });
    const inicio = (await aviso.locator("[data-ver-desde-o-inicio]").boundingBox())!;
    expect(inicio.height).toBeGreaterThanOrEqual(44);
    expect(inicio.width).toBeGreaterThanOrEqual(44);
    await aviso.locator("[data-ver-desde-o-inicio]").tap();
    await expect(jogo(page)).toHaveAttribute("data-fase-aberta", primeira!.id);
    await context.close();
  });

  test("deitado, a tela baixa esconde o que é enfeite e mantém o cabeçalho da fase e o botão principal", async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, viewport: { width: 640, height: 360 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
    const page = await context.newPage();
    const slug = "lula";
    await page.goto(`${rota(slug)}?fase=1`);
    await pronto(page);
    expect(await sobraHorizontal(page)).toBeLessThanOrEqual(0);
    await expect(page.locator("[data-fase-cartao] [data-fase-posicao]")).toBeVisible();
    await expect(page.locator("[data-fase-cartao] [data-proximo-passo]")).toBeVisible();
    await expect(page.locator('[data-fase-cartao] [data-camada="humor"]')).toBeHidden();
    await expect(page.locator("[data-abrir-marco]")).toBeInViewport({ ratio: 1 });
    const cartao = (await page.locator("[data-fase-cartao]").boundingBox())!;
    const principal = (await page.locator("[data-abrir-marco]").boundingBox())!;
    expect(cartao.y + cartao.height).toBeLessThanOrEqual(principal.y);
    await page.locator("[data-abrir-marco]").tap();
    const fase = await janela(page, "fase");
    const caixa = (await fase.getByRole("dialog").boundingBox())!;
    expect(caixa.y + caixa.height).toBeLessThanOrEqual(360);
    await context.close();
  });
});

test.describe("o boneco", () => {
  test("com movimento, tocar na pasta faz o boneco andar até ela, e então a explicação abre; a caminhada não é necessária", async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, viewport: { width: 1280, height: 800 }, reducedMotion: "no-preference" });
    const page = await context.newPage();
    const errosComMovimento = vigiar(page);
    const slug = "lula";
    const fase = fasesDe(slug).find((item) => item.id === "lula-processos")!;
    await page.goto(`${rota(slug)}?fase=${fase.numero}`);
    await pronto(page);
    await expect(jogo(page)).toHaveAttribute("data-movimento", "ligado");
    const palco = page.locator("[data-palco]");
    await expect(palco).toHaveAttribute("data-andando", "nao");

    await page.locator('[data-marcador="marco"]').click();
    // Ele anda, e a janela só abre quando chega.
    await expect(palco).toHaveAttribute("data-andando", "sim");
    await expect(dialogo(page, "fase")).toHaveCount(0);
    const aberta = await janela(page, "fase");
    await expect(palco).toHaveAttribute("data-andando", "nao");
    await expect(aberta.locator("[data-fase-titulo]")).toHaveText(fase.titulo);
    // Com a janela aberta, a animação da cena para.
    await expect(palco).toHaveAttribute("data-pausado", "sim");
    await page.keyboard.press("Escape");
    await expect(palco).toHaveAttribute("data-pausado", "nao");

    // O teclado abre a mesma pasta, com Enter.
    await page.locator('[data-marcador="marco"]').press("Enter");
    await janela(page, "fase");
    expect(errosComMovimento, "erros não tratados na página").toEqual([]);
    await context.close();
  });

  test("com movimento reduzido, a explicação abre na hora, sem a caminhada", async ({ page }) => {
    await abrir(page, "lula", 7);
    await expect(jogo(page)).toHaveAttribute("data-movimento", "reduzido");
    await page.locator('[data-marcador="marco"]').click();
    await expect(dialogo(page, "fase")).toBeVisible();
    await expect(page.locator("[data-palco]")).toHaveAttribute("data-andando", "nao");
  });
});
