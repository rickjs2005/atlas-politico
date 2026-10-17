// A Praça do Mural (src/features/praca, docs/PRACA.md): a jornada inteira sem
// a cena (entrar, ler o mural, aceitar a pauta, ouvir a Zefa, abrir as
// gavetas, levar cópias, errar a nota e ser explicado por campo, acertar,
// achar o bilhete, pegar a chave, abrir o Senado, responder a segunda pauta,
// ver a Câmara abrir, retomar depois de recarregar e recomeçar); a segunda
// sessão (a Lourdes, a credencial com o Teodoro, a ata lado a lado com o erro
// explicado por lado, as quatro pautas novas e o fim da edição); e, com a
// cena, andar até o mural pelo teclado, agir com E, fechar com Esc, andar pelo
// joystick no celular emulado e o movimento reduzido.

import { expect, test, type Page } from "@playwright/test";

import { fieldOf } from "@/lib/game/dossier";
import { buildPracaContent } from "@/lib/praca/conteudo";
import { abrirPauta, fixarNota, levarCopia, notaCerta, pautasDaSessao, pegarItem, progressoInicial } from "@/lib/praca/regras";

import { data } from "./jogo-apoio";

const conteudo = buildPracaContent(data);
const [pauta1, pauta2] = conteudo.pautas as [(typeof conteudo.pautas)[number], (typeof conteudo.pautas)[number]];
const [sessao1, sessao2] = conteudo.sessoes as [(typeof conteudo.sessoes)[number], (typeof conteudo.sessoes)[number]];
const materia = conteudo.materias[0]!;
const praca = (page: Page) => page.locator("[data-praca]");
const janela = (page: Page, id: string) => page.locator(`[data-janela="${id}"]`);

/** O progresso com a primeira sessão concluída, como a página o grava: a Câmara aberta e a segunda sessão no mural. */
function primeiraSessaoConcluida() {
  let progresso = pegarItem(pegarItem(progressoInicial(), "bilhete"), "chave-senado");
  for (const pauta of pautasDaSessao(sessao1, conteudo)) {
    progresso = abrirPauta(progresso, pauta.id);
    for (const id of [pauta.resposta, ...pauta.comparar]) progresso = levarCopia(progresso, id, conteudo.gavetas);
    progresso = fixarNota(progresso, pauta, notaCerta(pauta, conteudo.documentos)!, conteudo.documentos).progresso;
  }
  return { ...progresso, marcas: ["conversa:zefa-boas-vindas", "conversa:teodoro-recortes", "conversa:escrivao-gavetas", "conversa:escrivao-com-chave", "leitura", "etapas"] };
}

/** Um navegador sem WebGL: o canvas recusa o contexto, e a praça cai na lista. */
async function semWebGL(page: Page) {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, tipo: string, ...resto: unknown[]) {
      if (typeof tipo === "string" && tipo.startsWith("webgl")) return null;
      return (original as (this: HTMLCanvasElement, tipo: string, ...resto: unknown[]) => unknown).call(this, tipo, ...resto);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
}

async function entrar(page: Page) {
  await page.goto("/praca/");
  await expect(page.getByRole("heading", { name: "Praça do Mural" })).toBeVisible();
  await page.locator("[data-entrar]").click();
  await expect(praca(page)).toBeVisible();
}

/** Escolhe as três partes da nota pelas chaves das opções e fixa. */
async function montar(page: Page, nota: { documento: string; quando: string; registro: string }) {
  const caixa = janela(page, "mural");
  for (const [campo, chave] of Object.entries(nota)) await caixa.locator(`input[data-opcao="${campo}:${chave}"]`).check();
  await caixa.locator("[data-fixar]").click();
}

/** As chaves das opções da nota, como src/lib/praca/regras.ts as monta: a data e a ação do documento. */
const dataDe = (id: string) => `data:${conteudo.documentos[id]!.data.valor}`;
const acaoDe = (id: string) => `acao:${fieldOf(conteudo.documentos[id]!, "acao").valor}`;

test.describe("Praça do Mural sem a cena", () => {
  test("a jornada inteira: duas pautas, o erro explicado por campo, a chave, a Câmara, a retomada e o recomeço", async ({ page }) => {
    // A jornada passa por todos os lugares, mais de uma vez: cabe folgado em dois minutos.
    test.setTimeout(120_000);
    const erros: string[] = [];
    page.on("pageerror", (erro) => erros.push(erro.message));
    await semWebGL(page);
    await entrar(page);
    await expect(praca(page)).toHaveAttribute("data-praca", "lista", {
      timeout: 30_000,
    });
    await expect(page.locator("[data-objetivo]")).toContainText("Vá ao mural");
    await expect(page.locator("[data-lista-da-praca] [data-lugar]")).toHaveCount(6);

    // 1. O mural: a primeira pergunta vira a pauta; sem cópias, a nota não se monta.
    await page.locator('[data-lugar="mural"]').click();
    await expect(janela(page, "mural")).toBeVisible();
    await expect(janela(page, "mural").locator("[data-abrir-pauta]")).toHaveCount(2);
    await janela(page, "mural").locator(`[data-abrir-pauta="${pauta1.id}"]`).click();
    await expect(janela(page, "mural").locator(`[data-pauta="${pauta1.id}"]`)).toHaveAttribute("data-situacao", "fechada");
    await janela(page, "mural").locator("[data-aceitar]").click();
    await expect(janela(page, "mural").locator(`[data-pauta="${pauta1.id}"]`)).toHaveAttribute("data-situacao", "aberta");
    await janela(page, "mural").locator("[data-montar]").click();
    await expect(janela(page, "mural").locator("[data-sem-copias]")).toBeVisible();
    await janela(page, "mural").locator("[data-fechar]").click();
    await expect(janela(page, "mural")).toHaveCount(0);
    await expect(page.locator("[data-objetivo]")).toHaveText(pauta1.objetivo);

    // 2. A Zefa diz onde procurar.
    await page.locator('[data-lugar="padaria"]').click();
    const padaria = janela(page, "padaria");
    await expect(padaria.locator('[data-conversa="zefa-boas-vindas"]')).toBeVisible();
    await padaria.locator('[data-escolha="mural"]').click();
    await padaria.locator('[data-escolha="quem"]').click();
    await expect(padaria.locator("[data-fala]")).toHaveCount(3);
    await expect(padaria.locator("[data-fala]").last()).toContainText("Escrivão");
    await padaria.locator("[data-encerrar]").click();
    await expect(padaria).toHaveCount(0);

    // 3. O arquivo: o Escrivão, a gaveta do Senado trancada, a gaveta do Planalto de 2023 aberta, os cinco campos, duas cópias.
    await page.locator('[data-lugar="arquivo"]').click();
    const arquivo = janela(page, "arquivo");
    await expect(arquivo.locator('[data-conversa="escrivao-gavetas"]')).toBeVisible();
    await arquivo.locator('[data-escolha="ler"]').click();
    await expect(arquivo.locator("[data-fala]").last()).toContainText("Cinco campos");
    await arquivo.locator('[data-escolha="abrir"]').click();
    await arquivo.locator("[data-encerrar]").click();
    await expect(arquivo.locator("[data-gavetas]")).toBeVisible();
    await expect(arquivo.locator('[data-gaveta="senado-2023"]')).toHaveAttribute("data-trancada", "true");
    await arquivo.locator('[data-gaveta="senado-2023"]').click();
    await expect(arquivo.locator("[data-aviso-da-gaveta]")).toContainText("trancada");
    await expect(arquivo.locator("[data-gaveta-aberta]")).toHaveCount(0);
    await arquivo.locator(`[data-gaveta="${pauta1.gaveta}"]`).click();
    await expect(arquivo.locator(`[data-gaveta-aberta="${pauta1.gaveta}"]`)).toBeVisible();
    const gaveta1 = conteudo.gavetas.find((gaveta) => gaveta.id === pauta1.gaveta)!;
    expect(gaveta1.documentos.length).toBeGreaterThanOrEqual(2);
    for (const id of gaveta1.documentos) {
      await arquivo.locator(`[data-abrir-documento="${id}"]`).click();
      await expect(arquivo.locator(`[data-documento="${id}"] [data-campo]`)).toHaveCount(5);
      await arquivo.locator(`[data-levar="${id}"]`).click();
      await expect(arquivo.locator(`[data-documento="${id}"]`)).toHaveAttribute("data-copia", "true");
    }
    await arquivo.locator("[data-fechar]").click();
    await expect(page.locator("[data-instrucao-da-praca]")).toBeVisible();

    // 4. A nota: o documento errado é explicado pelo que ele registra; a data errada, pelo campo Data; e a certa muda o mural.
    const errado = gaveta1.documentos.find((id) => id !== pauta1.resposta)!;
    await page.locator('[data-lugar="mural"]').click();
    await janela(page, "mural").locator(`[data-abrir-pauta="${pauta1.id}"]`).click();
    await janela(page, "mural").locator("[data-montar]").click();
    const montarNota = janela(page, "mural").locator(`[data-montar-nota="${pauta1.id}"]`);
    await expect(montarNota).toBeVisible();
    await expect(montarNota.locator('[data-campo-da-nota="documento"] input')).toHaveCount(gaveta1.documentos.length);
    await expect(montarNota.locator("[data-fixar]")).toBeDisabled();
    // O documento errado, com a data dele e a ação do certo: só o documento e a ação são apontados, e a frase não entrega o título certo.
    await montar(page, {
      documento: errado,
      quando: dataDe(errado),
      registro: acaoDe(pauta1.resposta),
    });
    await expect(montarNota.locator("[data-nota-recusada]")).toBeVisible();
    await expect(montarNota.locator('[data-erro-campo="documento"]')).toContainText("Esse documento registra");
    await expect(montarNota.locator('[data-erro-campo="documento"]')).not.toContainText(conteudo.documentos[pauta1.resposta]!.titulo);
    await expect(montarNota.locator('[data-erro-campo="quando"]')).toHaveCount(0);
    await expect(montarNota.locator('[data-erro-campo="registro"]')).toHaveCount(acaoDe(errado) === acaoDe(pauta1.resposta) ? 0 : 1);
    // O documento certo com a data do outro: só a data é apontada, pelo campo Data.
    await montar(page, {
      documento: pauta1.resposta,
      quando: dataDe(errado),
      registro: acaoDe(pauta1.resposta),
    });
    await expect(montarNota.locator('[data-erro-campo="documento"]')).toHaveCount(0);
    await expect(montarNota.locator('[data-erro-campo="registro"]')).toHaveCount(0);
    await expect(montarNota.locator('[data-erro-campo="quando"]')).toContainText("O campo Data dele diz");
    await montar(page, {
      documento: pauta1.resposta,
      quando: dataDe(pauta1.resposta),
      registro: acaoDe(pauta1.resposta),
    });
    const fixada = janela(page, "mural").locator(`[data-nota-fixada="${pauta1.id}"]`);
    await expect(fixada).toBeVisible();
    await expect(fixada.locator("[data-dispositivos] li").first()).toBeVisible();
    await expect(fixada.locator("[data-mudanca]")).toContainText("ganhou resposta");
    await expect(fixada.locator("[data-fontes-da-nota]")).toBeVisible();
    await fixada.locator("[data-voltar-ao-mural]").click();
    await expect(janela(page, "mural").locator(`[data-abrir-pauta="${pauta1.id}"]`)).toHaveAttribute("data-situacao", "publicada");
    await janela(page, "mural").locator("[data-fechar]").click();
    await expect(praca(page)).toHaveAttribute("data-publicadas", "1");
    await expect(page.locator("[data-objetivo]")).toContainText("Volte ao mural");

    // 5. O bilhete no chão, a chave com a Zefa, as gavetas do Senado abertas.
    await page.locator('[data-lugar="bilhete"]').click();
    await expect(janela(page, "bilhete").locator("[data-bilhete]")).toContainText("chave das gavetas do Senado");
    await janela(page, "bilhete").locator("[data-guardar-bilhete]").click();
    await expect(page.locator('[data-lugar="bilhete"]')).toHaveCount(0);
    await page.locator('[data-abrir="caderno"]').click();
    await expect(janela(page, "caderno").locator('[data-caderno-item="bilhete"]')).toBeVisible();
    await expect(janela(page, "caderno").locator("[data-caderno-copia]")).toHaveCount(gaveta1.documentos.length);
    await janela(page, "caderno").locator("[data-fechar]").click();
    await page.locator('[data-lugar="padaria"]').click();
    await expect(padaria.locator('[data-conversa="zefa-chave"]')).toBeVisible();
    await padaria.locator('[data-escolha="bilhete"]').click();
    await expect(padaria.locator('[data-item-recebido="chave-senado"]')).toBeVisible();
    await padaria.locator("[data-encerrar]").click();

    // 6. A banca: o Teodoro explica os turnos, e os recortes vêm por data, com filtro por pessoa.
    await page.locator('[data-lugar="banca"]').click();
    const banca = janela(page, "banca");
    await expect(banca.locator('[data-conversa="teodoro-recortes"]')).toBeVisible();
    await banca.locator('[data-escolha="pec"]').click();
    await expect(banca.locator("[data-fala]").last()).toContainText("dois turnos");
    await banca.locator('[data-escolha="ok"]').click();
    await banca.locator("[data-encerrar]").click();
    await expect(banca.locator("[data-recortes]")).toBeVisible();
    await expect(banca.locator("[data-recorte]")).toHaveCount(conteudo.recortes.length);
    await banca.locator(`[data-filtro="${pauta2.pessoa}"]`).click();
    await expect(banca.locator("[data-recorte]")).toHaveCount(conteudo.recortes.filter((recorte) => recorte.pessoa === pauta2.pessoa || recorte.pessoa === "ambas").length);
    await banca.locator("[data-fechar]").click();

    // 7. O arquivo de novo: o Escrivão reconhece a chave; as duas gavetas do Senado abrem; duas cópias.
    await page.locator('[data-lugar="arquivo"]').click();
    await expect(arquivo.locator('[data-conversa="escrivao-com-chave"]')).toBeVisible();
    await arquivo.locator('[data-escolha="abrir"]').click();
    await arquivo.locator("[data-encerrar]").click();
    await expect(arquivo.locator('[data-gaveta="senado-2023"]')).toHaveAttribute("data-trancada", "false");
    const outra = conteudo.gavetas.find((gaveta) => gaveta.documentos.includes(pauta2.comparar[0]!))!;
    for (const [gavetaId, id] of [
      [pauta2.gaveta, pauta2.resposta],
      [outra.id, pauta2.comparar[0]!],
    ] as const) {
      await arquivo.locator(`[data-gaveta="${gavetaId}"]`).click();
      await expect(arquivo.locator(`[data-gaveta-aberta="${gavetaId}"]`)).toBeVisible();
      await arquivo.locator(`[data-levar="${id}"]`).click();
      await expect(arquivo.locator(`[data-documento="${id}"]`)).toHaveAttribute("data-copia", "true");
      await arquivo.locator("[data-voltar-as-gavetas]").click();
    }
    await arquivo.locator("[data-fechar]").click();

    // 8. A segunda pauta: o voto de 2024 é o documento errado; o de 2023, contra, é a resposta; e a Câmara abre.
    await page.locator('[data-lugar="mural"]').click();
    await janela(page, "mural").locator(`[data-abrir-pauta="${pauta2.id}"]`).click();
    await janela(page, "mural").locator("[data-aceitar]").click();
    await janela(page, "mural").locator("[data-montar]").click();
    const montar2 = janela(page, "mural").locator(`[data-montar-nota="${pauta2.id}"]`);
    const comparado = pauta2.comparar[0]!;
    await montar(page, {
      documento: comparado,
      quando: dataDe(comparado),
      registro: acaoDe(comparado),
    });
    await expect(montar2.locator('[data-erro-campo="documento"]')).toContainText("Esse documento registra voto");
    await expect(montar2.locator('[data-erro-campo="registro"]')).toHaveCount(0);
    await montar(page, {
      documento: pauta2.resposta,
      quando: dataDe(pauta2.resposta),
      registro: acaoDe(pauta2.resposta),
    });
    const fixada2 = janela(page, "mural").locator(`[data-nota-fixada="${pauta2.id}"]`);
    await expect(fixada2).toBeVisible();
    await expect(fixada2).toContainText("Resultado da votação");
    await expect(fixada2.locator("[data-mudanca]")).toContainText("Câmara");
    await janela(page, "mural").locator("[data-fechar]").click();
    await expect(praca(page)).toHaveAttribute("data-publicadas", "2");
    await expect(page.locator("[data-objetivo]")).toContainText("A Câmara abriu");
    await page.locator('[data-lugar="camara"]').click();
    await expect(janela(page, "camara").locator('[data-camara="aberta"]')).toBeVisible();
    await janela(page, "camara").locator("[data-fechar]").click();

    // 9. Recarregar retoma de onde parou; recomeçar apaga.
    await page.reload();
    await expect(page.locator("[data-entrar]")).toHaveText("Continuar de onde parou");
    await page.locator("[data-entrar]").click();
    await expect(praca(page)).toHaveAttribute("data-publicadas", "2", {
      timeout: 30_000,
    });
    await expect(page.locator("[data-objetivo]")).toContainText("A Câmara abriu");
    await page.locator('[data-abrir="caderno"]').click();
    await expect(janela(page, "caderno").locator('[data-caderno-item="chave-senado"]')).toBeVisible();
    await janela(page, "caderno").locator("[data-recomecar]").click();
    await janela(page, "caderno").locator("[data-apagar]").click();
    await expect(page.locator("[data-objetivo]")).toContainText("Vá ao mural");
    await page.reload();
    await expect(page.locator("[data-entrar]")).toHaveText("Entrar na praça");
    expect(erros).toEqual([]);
  });
});

test.describe("Praça do Mural, a segunda sessão sem a cena", () => {
  test("a Lourdes anuncia a sessão, o Teodoro entrega a credencial, a ata é recusada por lado e lavrada, as quatro pautas novas fecham a edição, e tudo volta depois de recarregar", async ({ page }) => {
    test.setTimeout(180_000);
    const erros: string[] = [];
    page.on("pageerror", (erro) => erros.push(erro.message));
    await semWebGL(page);
    await page.goto("/praca/");
    await page.evaluate((progresso) => window.localStorage.setItem("atlas-politico:praca", JSON.stringify(progresso)), primeiraSessaoConcluida());
    await page.reload();
    await expect(page.locator("[data-entrar]")).toHaveText("Continuar de onde parou");
    await page.locator("[data-entrar]").click();
    await expect(praca(page)).toHaveAttribute("data-praca", "lista", { timeout: 30_000 });
    await expect(praca(page)).toHaveAttribute("data-publicadas", "2");
    await expect(praca(page)).toHaveAttribute("data-atas", "0");
    await expect(page.locator("[data-objetivo]")).toContainText("A Câmara abriu");

    // 1. O mural amanheceu com as quatro perguntas novas, em duas sessões.
    await page.locator('[data-lugar="mural"]').click();
    await expect(janela(page, "mural").locator("[data-abrir-pauta]")).toHaveCount(6);
    await expect(janela(page, "mural").locator("[data-sessao-do-mural]")).toHaveCount(2);
    await expect(janela(page, "mural").locator("[data-sessao-do-mural]").first()).toHaveAttribute("data-sessao-do-mural", sessao2.id);
    await janela(page, "mural").locator("[data-fechar]").click();

    // 2. A Câmara: a Lourdes anuncia a matéria e diz onde está a credencial; a mesa a pede.
    await page.locator('[data-lugar="camara"]').click();
    const camara = janela(page, "camara");
    await expect(camara.locator('[data-camara="aberta"]')).toBeVisible();
    await expect(camara.locator('[data-conversa="lourdes-sessao"]')).toBeVisible();
    await camara.locator('[data-escolha="materia"]').click();
    await camara.locator('[data-escolha="mesa"]').click();
    await expect(camara.locator("[data-fala]").last()).toContainText("banca do Teodoro");
    await camara.locator("[data-encerrar]").click();
    const mesa = camara.locator(`[data-mesa="${materia.id}"]`);
    await expect(mesa).toHaveAttribute("data-situacao", "fechada");
    await camara.locator("[data-aceitar-materia]").click();
    await expect(mesa).toHaveAttribute("data-situacao", "aberta");
    await expect(camara.locator("[data-sem-credencial]")).toBeVisible();
    await camara.locator("[data-fechar]").click();
    await expect(page.locator("[data-objetivo]")).toContainText("A mesa pede a credencial");

    // 3. A banca: o Teodoro entrega a credencial.
    await page.locator('[data-lugar="banca"]').click();
    const banca = janela(page, "banca");
    await expect(banca.locator('[data-conversa="teodoro-credencial"]')).toBeVisible();
    await banca.locator('[data-escolha="pegar"]').click();
    await expect(banca.locator('[data-item-recebido="credencial"]')).toBeVisible();
    await banca.locator("[data-encerrar]").click();
    await banca.locator("[data-fechar]").click();
    await expect(page.locator("[data-objetivo]")).toHaveText(materia.objetivo);

    // 4. O arquivo: o Escrivão fala da matéria; as cópias das duas gavetas dela, com os outros votos de 2024 junto.
    await page.locator('[data-lugar="arquivo"]').click();
    const arquivo = janela(page, "arquivo");
    await expect(arquivo.locator('[data-conversa="escrivao-materia"]')).toBeVisible();
    await arquivo.locator('[data-escolha="como"]').click();
    await expect(arquivo.locator("[data-fala]").last()).toContainText("campo Objeto");
    await arquivo.locator('[data-escolha="abrir"]').click();
    await arquivo.locator("[data-encerrar]").click();
    for (const lado of materia.lados) {
      await arquivo.locator(`[data-gaveta="${lado.gaveta}"]`).click();
      await expect(arquivo.locator(`[data-gaveta-aberta="${lado.gaveta}"]`)).toBeVisible();
      // Um dos votos de 2024 já veio da primeira sessão, como cópia: só o que falta é levado.
      for (const id of conteudo.gavetas.find((gaveta) => gaveta.id === lado.gaveta)!.documentos) {
        if ((await arquivo.locator(`[data-documento="${id}"]`).getAttribute("data-copia")) !== "true") await arquivo.locator(`[data-levar="${id}"]`).click();
        await expect(arquivo.locator(`[data-documento="${id}"]`)).toHaveAttribute("data-copia", "true");
      }
      await arquivo.locator("[data-voltar-as-gavetas]").click();
    }
    await arquivo.locator("[data-fechar]").click();

    // 5. A mesa: o voto errado no lado do Senado é explicado por lado; a ata certa fica lado a lado.
    const [senado, planalto] = materia.lados as [(typeof materia.lados)[number], (typeof materia.lados)[number]];
    const outroVoto = conteudo.gavetas.find((gaveta) => gaveta.id === senado.gaveta)!.documentos.find((id) => id !== senado.documento)!;
    const lavrar = async (ata: Record<string, { documento: string; registro: string }>) => {
      for (const [lado, escolha] of Object.entries(ata)) for (const [campo, chave] of Object.entries(escolha)) await camara.locator(`input[data-opcao="${lado}:${campo}:${chave}"]`).check();
      await camara.locator("[data-lavrar]").click();
    };
    await page.locator('[data-lugar="camara"]').click();
    await expect(camara.locator('[data-conversa="lourdes-mesa"]')).toBeVisible();
    await camara.locator('[data-aba="mesa"]').click();
    await expect(camara.locator(`[data-lavrar-ata="${materia.id}"]`)).toBeVisible();
    await expect(camara.locator("[data-lavrar]")).toBeDisabled();
    await lavrar({
      [senado.id]: { documento: outroVoto, registro: acaoDe(outroVoto) },
      [planalto.id]: { documento: planalto.documento, registro: acaoDe(planalto.documento) },
    });
    await expect(camara.locator("[data-ata-recusada]")).toBeVisible();
    await expect(camara.locator(`[data-erro-da-ata="${senado.id}:documento"]`)).toContainText("Esse documento registra voto");
    await expect(camara.locator(`[data-erro-da-ata="${senado.id}:documento"]`)).not.toContainText(conteudo.documentos[senado.documento]!.titulo);
    await expect(camara.locator(`[data-erro-da-ata="${planalto.id}:documento"]`)).toHaveCount(0);
    await lavrar({
      [senado.id]: { documento: senado.documento, registro: acaoDe(senado.documento) },
      [planalto.id]: { documento: planalto.documento, registro: acaoDe(planalto.documento) },
    });
    const ata = camara.locator(`[data-ata-lavrada="${materia.id}"]`);
    await expect(ata).toBeVisible();
    await expect(ata.locator("[data-lado-da-ata]")).toHaveCount(2);
    await expect(ata.locator("[data-materia-proposicao]")).toContainText("PL 2253/2022");
    await expect(ata.locator(`[data-lado-da-ata="${planalto.id}"] [data-dispositivos] li`).first()).toBeVisible();
    await expect(ata.locator(`[data-lado-da-ata="${senado.id}"]`)).toContainText("Resultado da votação");
    await expect(ata.locator("[data-aviso-da-ata]")).toContainText("não compara posições");
    await expect(ata.locator("[data-mudanca]")).toContainText("mural");
    await camara.locator("[data-fechar]").click();
    await expect(praca(page)).toHaveAttribute("data-atas", "1");
    await expect(page.locator("[data-objetivo]")).toContainText("mural");

    // 6. As quatro pautas novas, cada uma com a cópia da gaveta dela; a última fecha a edição.
    const novas = pautasDaSessao(sessao2, conteudo);
    for (const [i, pauta] of novas.entries()) {
      await page.locator('[data-lugar="arquivo"]').click();
      await arquivo.locator(`[data-gaveta="${pauta.gaveta}"]`).click();
      await expect(arquivo.locator(`[data-gaveta-aberta="${pauta.gaveta}"]`)).toBeVisible();
      const documento = arquivo.locator(`[data-documento="${pauta.resposta}"]`);
      if ((await documento.getAttribute("data-copia")) !== "true") await arquivo.locator(`[data-levar="${pauta.resposta}"]`).click();
      await expect(documento).toHaveAttribute("data-copia", "true");
      await arquivo.locator("[data-fechar]").click();
      await page.locator('[data-lugar="mural"]').click();
      await janela(page, "mural").locator(`[data-abrir-pauta="${pauta.id}"]`).click();
      await janela(page, "mural").locator("[data-aceitar]").click();
      await expect(page.locator("[data-objetivo]")).toHaveText(pauta.objetivo);
      await janela(page, "mural").locator("[data-montar]").click();
      await montar(page, { documento: pauta.resposta, quando: dataDe(pauta.resposta), registro: acaoDe(pauta.resposta) });
      const fixada = janela(page, "mural").locator(`[data-nota-fixada="${pauta.id}"]`);
      await expect(fixada).toBeVisible();
      await expect(fixada.locator("[data-mudanca]")).toContainText(i === novas.length - 1 ? "última pergunta desta edição" : "ganhou resposta");
      await janela(page, "mural").locator("[data-fechar]").click();
      await expect(praca(page)).toHaveAttribute("data-publicadas", String(3 + i));
    }
    await expect(page.locator("[data-objetivo]")).toContainText("As pautas desta edição acabaram");
    await page.locator('[data-lugar="padaria"]').click();
    await expect(janela(page, "padaria").locator('[data-conversa="zefa-fim"]')).toBeVisible();
    await janela(page, "padaria").locator("[data-fechar]").click();
    await page.locator('[data-lugar="camara"]').click();
    await expect(camara.locator('[data-conversa="lourdes-fim"]')).toBeVisible();
    await camara.locator("[data-fechar]").click();

    // 7. Recarregar retoma com tudo: seis notas, a ata, a credencial no caderno.
    await page.reload();
    await page.locator("[data-entrar]").click();
    await expect(praca(page)).toHaveAttribute("data-publicadas", "6", { timeout: 30_000 });
    await expect(praca(page)).toHaveAttribute("data-atas", "1");
    await page.locator('[data-abrir="caderno"]').click();
    await expect(janela(page, "caderno").locator('[data-caderno-item="credencial"]')).toBeVisible();
    await expect(janela(page, "caderno").locator(`[data-caderno-materia="${materia.id}"]`)).toHaveAttribute("data-situacao", "publicada");
    expect(erros).toEqual([]);
  });
});

test.describe("Praça do Mural na entrada", () => {
  test("passar pela entrada e ir embora sem entrar não apaga o progresso salvo", async ({ page }) => {
    await page.goto("/praca/");
    await page.evaluate(() => window.localStorage.setItem("atlas-politico:praca", JSON.stringify({ versao: 1, pautas: {}, itens: ["bilhete"], copias: [], marcas: [], posicao: { x: 1, z: 2 } })));
    await page.reload();
    await expect(page.locator("[data-entrar]")).toHaveText("Continuar de onde parou");
    await page.goto("/jogo/");
    await page.goto("/praca/");
    await expect(page.locator("[data-entrar]")).toHaveText("Continuar de onde parou");
    expect(await page.evaluate(() => JSON.parse(window.localStorage.getItem("atlas-politico:praca")!).itens)).toEqual(["bilhete"]);
  });
});

test.describe("Praça do Mural com a cena", () => {
  test("andar até o mural pelo teclado, agir com E, fechar com Esc e voltar o foco; o movimento reduzido vale na cena", async ({ page }) => {
    // Com o WebGL por software e as sombras ligadas (computador), a caminhada até o mural leva perto de meio minuto: o prazo da jornada é maior que o padrão, e a espera continua sendo pela posição.
    test.setTimeout(120_000);
    const erros: string[] = [];
    page.on("pageerror", (erro) => erros.push(erro.message));
    await entrar(page);
    await expect(praca(page)).toHaveAttribute("data-cena", "pronta", {
      timeout: 30_000,
    });
    await expect(praca(page)).toHaveAttribute("data-movimento", "reduzido");
    await expect(page.locator("[data-joystick]")).toBeVisible();
    const canvas = page.locator("canvas");
    await expect(canvas).toHaveAttribute("data-posicao", /^0\.0,6\.5$/);
    // Para a esquerda até a coluna do mural, depois para o fundo até o tapete dele: segura a tecla até o sinal, nunca por tempo fixo (WebGL por software anda devagar).
    await page.keyboard.down("a");
    try {
      await expect.poll(async () => Number((await canvas.getAttribute("data-posicao"))!.split(",")[0]), { timeout: 30_000 }).toBeLessThanOrEqual(-8.7);
    } finally {
      await page.keyboard.up("a");
    }
    await page.keyboard.down("w");
    try {
      await expect(page.locator('[data-acao="mural"]')).toBeVisible({
        timeout: 30_000,
      });
    } finally {
      await page.keyboard.up("w");
    }
    await page.keyboard.press("e");
    await expect(janela(page, "mural")).toBeVisible();
    await expect(janela(page, "mural").getByRole("heading", { name: "Mural da praça" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(janela(page, "mural")).toHaveCount(0);
    await expect(page.locator('[data-acao="mural"]')).toBeFocused();
    expect(erros).toEqual([]);
  });

  test("sem preferência de movimento reduzido, a cena anima", async ({ browser }) => {
    const contexto = await browser.newContext({
      reducedMotion: "no-preference",
      viewport: { width: 1280, height: 720 },
    });
    const page = await contexto.newPage();
    await entrar(page);
    await expect(praca(page)).toHaveAttribute("data-cena", "pronta", {
      timeout: 30_000,
    });
    await expect(praca(page)).toHaveAttribute("data-movimento", "normal");
    await contexto.close();
  });

  test("no celular emulado, o joystick leva ao bilhete e o toque o guarda", async ({ browser }) => {
    const contexto = await browser.newContext({
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
      reducedMotion: "reduce",
    });
    const page = await contexto.newPage();
    const erros: string[] = [];
    page.on("pageerror", (erro) => erros.push(erro.message));
    await entrar(page);
    await expect(praca(page)).toHaveAttribute("data-cena", "pronta", {
      timeout: 30_000,
    });
    const joystick = page.locator("[data-joystick]");
    const caixa = (await joystick.boundingBox())!;
    const centro = {
      x: caixa.x + caixa.width / 2,
      y: caixa.y + caixa.height / 2,
    };
    // O bilhete fica à direita e ao fundo de quem começa: o manche vai para cima e para a direita, e fica lá até o botão aparecer.
    await page.mouse.move(centro.x, centro.y);
    await page.mouse.down();
    await page.mouse.move(centro.x + 34, centro.y - 40, { steps: 4 });
    try {
      await expect(page.locator('[data-acao="bilhete"]')).toBeVisible({
        timeout: 30_000,
      });
    } finally {
      await page.mouse.up();
    }
    await page.locator('[data-acao="bilhete"]').tap();
    await expect(janela(page, "bilhete")).toBeVisible();
    await janela(page, "bilhete").locator("[data-guardar-bilhete]").tap();
    await expect(janela(page, "bilhete")).toHaveCount(0);
    await expect(page.locator('[data-acao="bilhete"]')).toHaveCount(0);
    await page.locator('[data-abrir="caderno"]').tap();
    await expect(janela(page, "caderno").locator('[data-caderno-item="bilhete"]')).toBeVisible();
    expect(erros).toEqual([]);
    await contexto.close();
  });
});
