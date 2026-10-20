// A torcida do Vale a Faixa ouvida de verdade (src/features/faixa/audio.ts,
// torcida.ts, public/audio/torcida/manifesto.json): uma sonda instalada antes
// da página, no destino de todo AudioContext, mede o nível do sinal que chega
// à saída do navegador. Assim o teste não confere só o grafo de áudio nem só
// os atributos do canvas: confere que há som, quanto, e quando. Sozinho e a
// dois: o clique de começar destrava o contexto; o manifesto e as seis
// gravações respondem 200 e decodificam; a arena é ouvida na luta; cresce com
// a subida e a captura; reage à interrupção, ao golpe forte e explode na
// vitória; silenciar corta tudo; a pausa silencia e continuar devolve; o
// volume da torcida guardado vale na próxima visita. As regras do jogo e as
// outras jornadas estão em vale-a-faixa.spec.ts.

import { expect, test, type Page } from "@playwright/test";

const CAMADAS = ["ambiente", "expectativa", "golpe", "queda", "surpresa", "comemoracao"] as const;

const raiz = (page: Page) => page.locator("[data-faixa]");
/** Os estados que o canvas expõe: lado 1, lado 2, escada, puxada do lado 1, x do lado 1, x da escada, y do lado 1, x do lado 2, y do lado 2. */
const estados = async (page: Page) => (await page.locator("canvas").getAttribute("data-estados"))!.split("|");
const estadoDoJogador = async (page: Page) => (await estados(page))[0]!;
const dica = (page: Page) => raiz(page).getAttribute("data-dica");

function vigiarErros(page: Page): string[] {
  const erros: string[] = [];
  page.on("pageerror", (erro) => erros.push(erro.message));
  page.on("console", (mensagem) => {
    if (mensagem.type() === "error") erros.push(mensagem.text());
  });
  return erros;
}

/** O status de cada resposta de /audio/, pelo caminho. */
function vigiarAudio(page: Page): Map<string, number> {
  const respostas = new Map<string, number>();
  page.on("response", (resposta) => {
    const caminho = new URL(resposta.url()).pathname;
    if (caminho.startsWith("/audio/")) respostas.set(caminho, resposta.status());
  });
  return respostas;
}

/** Segura uma tecla até a condição valer, e solta sempre (confere a cada 50 ms). */
async function segurarAte(page: Page, tecla: string, condicao: () => Promise<boolean>, limite = 15_000) {
  await page.keyboard.down(tecla);
  try {
    await expect.poll(condicao, { timeout: limite, intervals: [50] }).toBe(true);
  } finally {
    await page.keyboard.up(tecla);
  }
}

interface Nivel {
  /** O pico e a média, em dBFS, das leituras no período. */
  max: number;
  media: number;
  leituras: number;
}

declare global {
  interface Window {
    __sondaDeAudio?: {
      quantos(): number;
      estados(): string[];
      nivel(ms: number): Promise<Nivel>;
    };
  }
}

/**
 * A sonda: antes de qualquer script da página, `destination` de todo
 * AudioContext passa a devolver um AnalyserNode ligado ao destino real. O
 * que o jogo conecta ao destino atravessa o analisador e chega à saída; o
 * teste lê a forma de onda e calcula o nível (RMS) do que está saindo.
 */
function instalarSonda(page: Page) {
  return page.addInitScript(() => {
    const proto = BaseAudioContext.prototype;
    const original = Object.getOwnPropertyDescriptor(proto, "destination");
    if (original?.get === undefined) return;
    const pegar = original.get;
    const sondas = new WeakMap<BaseAudioContext, AnalyserNode>();
    const contextos: { contexto: BaseAudioContext; sonda: AnalyserNode }[] = [];
    Object.defineProperty(proto, "destination", {
      configurable: true,
      get(this: BaseAudioContext) {
        let sonda = sondas.get(this);
        if (sonda === undefined) {
          const real = pegar.call(this) as AudioDestinationNode;
          sonda = this.createAnalyser();
          sonda.fftSize = 2048;
          sonda.smoothingTimeConstant = 0;
          sonda.connect(real);
          sondas.set(this, sonda);
          contextos.push({ contexto: this, sonda });
        }
        return sonda;
      },
    });
    const dB = (rms: number) => (rms <= 0 ? -100 : Math.max(-100, 20 * Math.log10(rms)));
    window.__sondaDeAudio = {
      quantos: () => contextos.length,
      estados: () => contextos.map((c) => c.contexto.state),
      nivel: (ms: number) =>
        new Promise((resolve) => {
          const amostras = new Float32Array(2048);
          const niveis: number[] = [];
          const inicio = performance.now();
          const ler = () => {
            for (const { sonda } of contextos) {
              sonda.getFloatTimeDomainData(amostras);
              let soma = 0;
              for (let i = 0; i < amostras.length; i += 1) soma += amostras[i]! * amostras[i]!;
              niveis.push(dB(Math.sqrt(soma / amostras.length)));
            }
            if (performance.now() - inicio < ms) {
              setTimeout(ler, 20);
              return;
            }
            const max = niveis.length === 0 ? -100 : Math.max(...niveis);
            // A média em potência, não em dB: um pico curto não some na conta.
            const media = niveis.length === 0 ? -100 : dB(Math.sqrt(niveis.reduce((s, n) => s + 10 ** (n / 10), 0) / niveis.length));
            resolve({ max, media, leituras: niveis.length });
          };
          ler();
        }),
    };
  });
}

const nivel = (page: Page, ms: number) => page.evaluate((duracao) => window.__sondaDeAudio!.nivel(duracao), ms);
const estadosDoContexto = (page: Page) => page.evaluate(() => window.__sondaDeAudio!.estados());
const quantosContextos = (page: Page) => page.evaluate(() => window.__sondaDeAudio!.quantos());

/** O silêncio da sonda: o compressor e os ganhos em zero deixam um resíduo bem abaixo disto. */
const SILENCIO = -70;
/** A torcida presente: bem acima do resíduo, mesmo com o volume guardado no padrão. */
const AUDIVEL = -45;

/** Entra sozinho (adversário parado) e chega à luta, com a sonda instalada. */
async function lutarSozinho(page: Page) {
  await page.goto("/jogo/vale-a-faixa/?computador=parado");
  await expect(raiz(page)).toHaveAttribute("data-faixa", "inicio");
  // Antes de qualquer gesto, nenhum contexto de áudio existe.
  expect(await quantosContextos(page)).toBe(0);
  await page.locator('[data-modo="solo"]').click();
  await page.locator('[data-escolha="lula"]').click();
  await expect(raiz(page)).toHaveAttribute("data-pronto", "sim", { timeout: 30_000 });
  await page.locator("[data-comecar-luta]").click();
  await expect(raiz(page)).toHaveAttribute("data-fase", "luta", { timeout: 15_000 });
}

/** As seis camadas vindas de gravação, e o manifesto e os seis arquivos respondidos com 200. */
async function esperarGravacoes(page: Page, respostas: Map<string, number>) {
  await expect.poll(() => page.locator("canvas").getAttribute("data-gravacoes"), { timeout: 20_000 }).toBe(CAMADAS.join(","));
  expect(respostas.get("/audio/torcida/manifesto.json")).toBe(200);
  for (const camada of CAMADAS) expect(respostas.get(`/audio/torcida/${camada}.mp3`), camada).toBe(200);
  // A camada gravada entra em meio segundo; o ambiente sobe com constante de tempo de 0,4 s.
  await page.waitForTimeout(1_500);
}

/** Leva a escada até o centro e deixa o jogador pronto para subir (a dica "subir"). */
async function posicionarEscada(page: Page) {
  const xDoJogador = async () => Number((await estados(page))[4]);
  const xDaEscada = async () => Number((await estados(page))[5]);
  const lado = (await xDaEscada()) < (await xDoJogador()) ? "ArrowLeft" : "ArrowRight";
  await segurarAte(page, lado, async () => (await dica(page)) === "pegarEscada", 10_000);
  await page.keyboard.press("c");
  const paraOCentro = (await xDoJogador()) < 0 ? "ArrowRight" : "ArrowLeft";
  await segurarAte(page, paraOCentro, async () => (await dica(page)) === "posicionarEscada", 15_000);
  await page.keyboard.press("c");
  await expect.poll(() => dica(page)).toBe("subir");
}

/** Leva um controle deslizante da pausa ao mínimo (`Home`) ou ao máximo (`End`), e continua a partida. */
async function ajustarNaPausa(page: Page, seletor: string, para: "Home" | "End") {
  await page.keyboard.press("Escape");
  await expect(page.locator('[data-janela="pausa"]')).toBeVisible();
  const controle = page.locator(seletor);
  await controle.focus();
  await page.keyboard.press(para);
  await expect(controle).toHaveValue(para === "Home" ? "0" : "1");
  await page.locator("[data-continuar]").click();
  await expect(raiz(page)).toHaveAttribute("data-pausado", "nao");
}

test.describe("Vale a Faixa: a torcida ouvida", () => {
  test("sozinho: o clique de começar destrava o áudio, as seis gravações carregam, a arena é ouvida, cresce com a subida e a captura, reage à interrupção e explode na vitória", async ({ page }) => {
    test.setTimeout(150_000);
    const erros = vigiarErros(page);
    const respostas = vigiarAudio(page);
    await instalarSonda(page);
    await lutarSozinho(page);
    // Um contexto só, destravado pelos cliques (o modo, e o botão de lutar).
    expect(await quantosContextos(page)).toBe(1);
    expect(await estadosDoContexto(page)).toEqual(["running"]);
    await esperarGravacoes(page, respostas);

    // Só os efeitos da torcida tocam agora (ninguém se mexe): o que a sonda ouve é a arena.
    // Com a torcida no máximo, para as diferenças entre os momentos ficarem claras.
    await ajustarNaPausa(page, "[data-volume-torcida]", "End");
    await page.waitForTimeout(800);
    const base = await nivel(page, 1_500);
    expect(base.leituras).toBeGreaterThan(30);
    expect(base.media).toBeGreaterThan(AUDIVEL);
    // Com a torcida em zero, o silêncio: prova que o que se ouvia era a torcida, não outra coisa.
    await ajustarNaPausa(page, "[data-volume-torcida]", "Home");
    await page.waitForTimeout(600);
    const semTorcida = await nivel(page, 800);
    expect(semTorcida.max).toBeLessThan(SILENCIO);
    await ajustarNaPausa(page, "[data-volume-torcida]", "End");
    await page.waitForTimeout(800);

    // A subida e a captura: a expectativa gravada entra e cresce com o progresso real.
    await posicionarEscada(page);
    await segurarAte(page, "ArrowUp", async () => (await estadoDoJogador(page)) === "noTopo", 10_000);
    await page.keyboard.down("c");
    await expect.poll(async () => Number((await estados(page))[3]), { timeout: 8_000 }).toBeGreaterThan(0.4);
    const puxando = await nivel(page, 1_200);
    expect(puxando.media).toBeGreaterThan(base.media + 2);

    // Soltar e descer interrompe a captura: o suspiro gravado, um pico acima da arena (medido desde a soltura).
    const medicao = nivel(page, 2_000);
    await page.keyboard.up("c");
    await segurarAte(page, "ArrowDown", async () => (await estadoDoJogador(page)) === "parado", 8_000);
    const interrupcao = await medicao;
    expect(interrupcao.max).toBeGreaterThan(base.media + 4);

    // Sobe de novo até o fim: na vitória, a comemoração gravada, o máximo de tudo.
    await segurarAte(page, "ArrowUp", async () => (await estadoDoJogador(page)) === "noTopo", 10_000);
    await segurarAte(page, "c", async () => (await raiz(page).getAttribute("data-fase")) === "fim", 30_000);
    const vitoria = await nivel(page, 2_000);
    expect(vitoria.media).toBeGreaterThan(puxando.media);
    expect(vitoria.max).toBeGreaterThan(base.media + 8);
    expect(erros).toEqual([]);
  });

  test("sozinho: silenciar corta tudo e devolve; a pausa silencia e continuar devolve a arena; o volume da torcida guardado vale na próxima visita", async ({ page }) => {
    test.setTimeout(120_000);
    const erros = vigiarErros(page);
    const respostas = vigiarAudio(page);
    await instalarSonda(page);
    await lutarSozinho(page);
    await esperarGravacoes(page, respostas);
    const base = await nivel(page, 1_000);
    expect(base.media).toBeGreaterThan(AUDIVEL);

    // Silenciar pelo botão sobre a cena: silêncio; de novo: a arena volta.
    await page.locator("[data-silenciar]").click();
    await expect(page.locator("[data-silenciar]")).toHaveText("Som: desligado");
    await page.waitForTimeout(400);
    expect((await nivel(page, 600)).max).toBeLessThan(SILENCIO);
    await page.locator("[data-silenciar]").click();
    await expect(page.locator("[data-silenciar]")).toHaveText("Som: ligado");
    await page.waitForTimeout(600);
    expect((await nivel(page, 800)).media).toBeGreaterThan(AUDIVEL);

    // A pausa: os laços param e os ganhos descem; continuar retoma o contexto e os laços.
    await page.keyboard.press("Escape");
    await expect(page.locator('[data-janela="pausa"]')).toBeVisible();
    await page.waitForTimeout(800);
    expect((await nivel(page, 600)).max).toBeLessThan(SILENCIO);
    await page.keyboard.press("Escape");
    await expect(raiz(page)).toHaveAttribute("data-pausado", "nao");
    expect(await estadosDoContexto(page)).toEqual(["running"]);
    await page.waitForTimeout(1_200);
    expect((await nivel(page, 800)).media).toBeGreaterThan(AUDIVEL);

    // O volume da torcida vai a zero e fica guardado: na próxima visita, o controle mostra zero e a arena não toca.
    await ajustarNaPausa(page, "[data-volume-torcida]", "Home");
    const guardado = await page.evaluate(() => JSON.parse(localStorage.getItem("atlas-politico:faixa:preferencias") ?? "{}") as { volumeTorcida?: number });
    expect(guardado.volumeTorcida).toBe(0);
    await page.waitForTimeout(600);
    expect((await nivel(page, 600)).max).toBeLessThan(SILENCIO);
    const respostasDaVolta = vigiarAudio(page);
    await lutarSozinho(page);
    await esperarGravacoes(page, respostasDaVolta);
    await page.keyboard.press("Escape");
    await expect(page.locator("[data-volume-torcida]")).toHaveValue("0");
    await page.keyboard.press("Escape");
    expect((await nivel(page, 600)).max).toBeLessThan(SILENCIO);
    // E de volta ao máximo, também guardado.
    await ajustarNaPausa(page, "[data-volume-torcida]", "End");
    await page.waitForTimeout(800);
    expect((await nivel(page, 800)).media).toBeGreaterThan(AUDIVEL);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("atlas-politico:faixa:preferencias") ?? "{}") as { volumeTorcida?: number })).toMatchObject({ volumeTorcida: 1 });
    expect(erros).toEqual([]);
  });

  test("a dois no mesmo teclado: o clique de lutar destrava o áudio, as gravações carregam, a arena é ouvida e um golpe forte do jogador 1 faz a arena reagir", async ({ page }) => {
    test.setTimeout(120_000);
    const erros = vigiarErros(page);
    const respostas = vigiarAudio(page);
    await instalarSonda(page);
    await page.goto("/jogo/vale-a-faixa/");
    expect(await quantosContextos(page)).toBe(0);
    await page.locator('[data-modo="local"]').click();
    await page.locator('[data-escolha="flavio-bolsonaro"]').click();
    await page.locator("[data-lutar]").click();
    await expect(raiz(page)).toHaveAttribute("data-pronto", "sim", { timeout: 30_000 });
    await page.locator("[data-comecar-luta]").click();
    await expect(raiz(page)).toHaveAttribute("data-fase", "luta", { timeout: 15_000 });
    expect(await quantosContextos(page)).toBe(1);
    expect(await estadosDoContexto(page)).toEqual(["running"]);
    await esperarGravacoes(page, respostas);

    // Os efeitos em zero e a torcida no máximo: o que a sonda ouve no golpe é a reação da arena, não o impacto.
    await ajustarNaPausa(page, "[data-volume-efeitos]", "Home");
    await ajustarNaPausa(page, "[data-volume-torcida]", "End");
    await page.waitForTimeout(800);
    const base = await nivel(page, 1_200);
    expect(base.media).toBeGreaterThan(AUDIVEL);

    // O jogador 1 vai até o jogador 2 (parado: ninguém aperta as teclas dele) e dá o golpe forte.
    const xs = async () => {
      const partes = await estados(page);
      return [Number(partes[4]), Number(partes[7])] as const;
    };
    const [x1, x2] = await xs();
    const lado = x2 > x1 ? "d" : "a";
    await segurarAte(page, lado, async () => Math.abs((await xs())[0] - (await xs())[1]) <= 70, 15_000);
    await page.keyboard.press("g");
    const [golpe] = await Promise.all([nivel(page, 1_500), expect.poll(async () => (await estados(page))[1], { timeout: 3_000 }).toMatch(/atingido|caido|arremessado|caindo|derrubado|levantando/)]);
    expect(golpe.max).toBeGreaterThan(base.media + 4);
    expect(erros).toEqual([]);
  });
});
