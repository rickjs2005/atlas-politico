// A Praça do Mural (src/lib/praca, D-153, D-154 e D-155): o conteúdo das
// gavetas sai só do conjunto publicado; as perguntas do mural e a matéria da
// mesa só escrevem anos que estão nos documentos apontados; os dois documentos
// da matéria citam a mesma proposição; as conversas passam pela validação do
// Escrivão; e as regras (sessões, gavetas, chave, credencial, cópias, os
// quatro jeitos de responder com o erro explicado por campo, ata lado a lado,
// Câmara, fim da edição, passos, selos, progresso salvo) são puras.

import { describe, expect, it } from "vitest";

import { readSources, resolvePaths } from "@/lib/content/sources";
import { PROFILES } from "@/lib/domain/profiles";
import { validateDialog } from "@/lib/game/escrivao";
import { buildPracaContent } from "@/lib/praca/conteudo";
import { passoDeAgora, passosDaMateria, passosDaPauta } from "@/lib/praca/passos";
import { BILHETE, CONVERSAS, ITENS, ITENS_POR_NO, LUGARES, MATERIAS, MORADORES, SESSOES } from "@/lib/praca/praca";
import {
  abrirMateria,
  abrirPauta,
  anosEm,
  ataCerta,
  ataLavrada,
  camaraAberta,
  camposDaPauta,
  conversaDe,
  conversar,
  currentNode,
  devolverCopia,
  documentosDaPauta,
  fimDaEdicao,
  fixarNota,
  gavetaAberta,
  isDialogOver,
  lavrarAta,
  lerProgresso,
  levarCopia,
  lugaresDeAgora,
  materiaDaSessao,
  notaCerta,
  notaFixada,
  objetivoDeAgora,
  opcoesDaNota,
  pautaAberta,
  pautasDaSessao,
  pautasDisponiveis,
  pegarItem,
  progressoInicial,
  sessaoConcluida,
  sessaoDeAgora,
  situacaoDaMateria,
  startDialog,
  tipoDaPauta,
  todasPublicadas,
  type Roteiro,
} from "@/lib/praca/regras";
import { descobertas, selos, selosNovos } from "@/lib/praca/selos";
import type { Pauta, ProgressoDaPraca } from "@/lib/praca/tipos";
import { buildAtlasData } from "@/lib/publication/build";

const data = buildAtlasData(readSources(resolvePaths())).data!;
const conteudo = buildPracaContent(data);
const [sessao1, sessao2] = conteudo.sessoes as [(typeof conteudo.sessoes)[number], (typeof conteudo.sessoes)[number]];
const materia = conteudo.materias[0]!;
const pautaDe = (id: string): Pauta => conteudo.pautas.find((pauta) => pauta.id === id)!;
const gavetaDe = (id: string) => conteudo.gavetas.find((gaveta) => gaveta.id === id)!;

/** Os anos escritos em um texto estão nos documentos apontados (sem as fontes e a situação editorial). */
function anosNosDocumentos(texto: string, ids: readonly string[], onde: string) {
  const docs = JSON.stringify(
    ids.map((id) => conteudo.documentos[id]),
    (chave, valor: unknown) => (chave === "fontes" || chave === "editorial" ? undefined : valor),
  );
  for (const ano of anosEm(texto)) expect(docs.includes(ano), `${onde}: o ano ${ano} não está nos documentos apontados`).toBe(true);
}

/** Responder uma pauta do jeito certo, com as cópias que ela pede. */
function responder(progresso: ProgressoDaPraca, pauta: Pauta): ProgressoDaPraca {
  let atual = abrirPauta(progresso, pauta.id);
  for (const id of documentosDaPauta(pauta)) atual = levarCopia(atual, id, conteudo.gavetas);
  return fixarNota(atual, pauta, notaCerta(pauta, conteudo.documentos)!, conteudo.documentos).progresso;
}

/** O progresso com a primeira sessão concluída: a Câmara aberta. */
function primeiraSessaoConcluida(): ProgressoDaPraca {
  let progresso = pegarItem(pegarItem(progressoInicial(), "bilhete"), "chave-senado");
  for (const pauta of pautasDaSessao(sessao1, conteudo)) progresso = responder(progresso, pauta);
  return progresso;
}

/** A ata lavrada sobre um progresso com a credencial e as duas cópias. */
function lavrar(progresso: ProgressoDaPraca): ProgressoDaPraca {
  let atual = pegarItem(progresso, "credencial");
  atual = abrirMateria(atual, materia.id);
  for (const lado of materia.lados) atual = levarCopia(atual, lado.documento, conteudo.gavetas);
  return lavrarAta(atual, materia, ataCerta(materia, conteudo.documentos)!, conteudo.documentos).progresso;
}

describe("conteúdo da praça", () => {
  it("as gavetas trazem toda decisão publicada das duas pessoas, por pessoa, instituição e ano, e só as do Senado pedem a chave", () => {
    const todas = conteudo.gavetas.flatMap((gaveta) => gaveta.documentos);
    expect(new Set(todas).size).toBe(todas.length);
    expect(todas.length).toBe(Object.keys(conteudo.documentos).length);
    expect(todas.length).toBe(data.conjunto.votos.length + data.conjunto.atosExecutivos.length + data.conjunto.atuacoesLegislativas.length);
    for (const gaveta of conteudo.gavetas) {
      for (const id of gaveta.documentos) {
        const doc = conteudo.documentos[id]!;
        expect(doc.data.valor.startsWith(String(gaveta.ano)), `${gaveta.id} ${id}`).toBe(true);
        expect(gaveta.precisa, gaveta.id).toBe(doc.instituicao === "senado-federal" ? "chave-senado" : null);
      }
    }
    for (const perfil of PROFILES)
      expect(
        conteudo.gavetas.some((gaveta) => gaveta.pessoa === perfil.slug),
        perfil.slug,
      ).toBe(true);
    expect(conteudo.gavetas.map((gaveta) => gaveta.id)).toContain("planalto-2023");
    expect(conteudo.gavetas.map((gaveta) => gaveta.id)).toContain("senado-2023");
  });

  it("os recortes da banca são os acontecimentos, em ordem de data, com a pessoa de cada um", () => {
    expect(conteudo.recortes).toHaveLength(data.conjunto.acontecimentos.length);
    for (let i = 1; i < conteudo.recortes.length; i += 1) expect(conteudo.recortes[i]!.data.valor >= conteudo.recortes[i - 1]!.data.valor).toBe(true);
    expect(conteudo.recortes.filter((recorte) => recorte.pessoa === "ambas").map((recorte) => recorte.id)).toEqual(["eleicao-2026-primeiro-turno"]);
  });

  it("as sessões: a primeira com o tutorial e a nota, uma de cada por pessoa; a segunda com a natureza e a ordem, uma de cada por pessoa, e a matéria da mesa", () => {
    expect(conteudo.sessoes.map((sessao) => sessao.id)).toEqual(SESSOES.map((sessao) => sessao.id));
    expect(sessao1.abreCom).toBeNull();
    expect(sessao2.abreCom).toBe(sessao1.id);
    expect(sessao2.abreLugar).toBe("camara");
    for (const perfil of PROFILES) {
      expect(pautasDaSessao(sessao1, conteudo).filter((pauta) => pauta.pessoa === perfil.slug).map(tipoDaPauta).sort(), perfil.slug).toEqual(["campo", "nota"]);
      expect(pautasDaSessao(sessao2, conteudo).filter((pauta) => pauta.pessoa === perfil.slug).map(tipoDaPauta).sort(), perfil.slug).toEqual(["natureza", "ordem"]);
    }
    // O tutorial vem antes de qualquer pauta de leitura: as duas primeiras do mural só pedem a data.
    expect(pautasDaSessao(sessao1, conteudo).slice(0, 2).map(tipoDaPauta)).toEqual(["campo", "campo"]);
    expect(conteudo.pautas).toHaveLength(8);
    expect(conteudo.pautas.map((pauta) => pauta.sessao)).toEqual(["mural", "mural", "mural", "mural", "camara", "camara", "camara", "camara"]);
    expect(materiaDaSessao(sessao2, conteudo)?.id).toBe(MATERIAS[0]!.id);
    expect(conteudo.materias).toHaveLength(MATERIAS.length);
    // Cada sessão pede um item diferente, e o item existe.
    expect(new Set(conteudo.sessoes.map((sessao) => sessao.portao.item)).size).toBe(conteudo.sessoes.length);
    for (const sessao of conteudo.sessoes) expect(ITENS[sessao.portao.item], sessao.id).toBeDefined();
    // Toda pauta pertence a uma sessão, e as gavetas da segunda sessão não são as da primeira.
    for (const pauta of conteudo.pautas) expect(conteudo.sessoes.some((sessao) => sessao.pautas.includes(pauta.id)), pauta.id).toBe(true);
    const gavetas1 = pautasDaSessao(sessao1, conteudo).map((pauta) => pauta.gaveta);
    for (const pauta of pautasDaSessao(sessao2, conteudo)) expect(gavetas1, pauta.id).not.toContain(pauta.gaveta);
    // O tutorial não depende de chave: as gavetas dele abrem direto.
    for (const pauta of conteudo.pautas.filter((item) => tipoDaPauta(item) === "campo")) expect(gavetaDe(pauta.gaveta).precisa, pauta.id).toBeNull();
  });

  it("cada pauta aponta um documento na gaveta da pessoa certa, os anos da pergunta estão nos documentos, a pergunta não cita nome nem partido, e cada uma tem reação de quem perguntou", () => {
    for (const pauta of conteudo.pautas) {
      const doc = conteudo.documentos[pauta.resposta]!;
      expect(doc, pauta.id).toBeDefined();
      const gaveta = gavetaDe(pauta.gaveta);
      expect(gaveta.documentos, pauta.id).toContain(pauta.resposta);
      expect(gaveta.pessoa, pauta.id).toBe(pauta.pessoa);
      anosNosDocumentos(`${pauta.pergunta} ${pauta.objetivo}`, [pauta.resposta, ...pauta.comparar], pauta.id);
      for (const id of pauta.comparar) expect(conteudo.documentos[id]?.pessoaId, `${pauta.id} compara ${id}`).toBe(doc.pessoaId);
      if (tipoDaPauta(pauta) !== "campo") expect(pauta.comparar.length, pauta.id).toBeGreaterThan(0);
      // A pergunta e a reação não citam pessoa, partido nem lado: falam do cargo e do papel.
      expect(`${pauta.pergunta} ${pauta.reacao}`).not.toMatch(/\b(lula|bolsonaro|fl[aá]vio|pt|pl)\b/i);
      expect(`${pauta.pergunta} ${pauta.objetivo} ${pauta.reacao}`).not.toMatch(/[—–]/);
      expect(pauta.reacao.length, pauta.id).toBeGreaterThan(20);
      if (pauta.detalhe === "dispositivos") expect(doc.natureza, pauta.id).toBe("ato");
      // A resposta tem como errar e como acertar: a resposta se distingue dos comparados pelo campo Ação ou pela data.
      const certa = notaCerta(pauta, conteudo.documentos)!;
      expect(certa, pauta.id).not.toBeNull();
      if (tipoDaPauta(pauta) === "ordem") {
        const [primeiro, segundo] = [conteudo.documentos[certa.primeiro!]!, conteudo.documentos[certa.segundo!]!];
        expect(primeiro.data.valor < segundo.data.valor, pauta.id).toBe(true);
        expect(new Set([primeiro.id, segundo.id])).toEqual(new Set([pauta.resposta, ...pauta.comparar]));
      } else if (tipoDaPauta(pauta) !== "campo") {
        expect(certa.documento).toBe(pauta.resposta);
        for (const id of pauta.comparar) {
          const outro = conteudo.documentos[id]!;
          expect(doc.data.valor !== outro.data.valor || certa.registro !== `acao:${outro.titulo}`, `${pauta.id} x ${id}`).toBe(true);
        }
      }
    }
  });

  it("a matéria da mesa: dois documentos de pessoas diferentes, nas gavetas ditas, que citam a mesma proposição com a mesma ementa; os anos do texto estão neles", () => {
    expect(materia.sessao).toBe(sessao2.id);
    expect(materia.lados).toHaveLength(2);
    expect(new Set(materia.lados.map((lado) => lado.pessoa)).size).toBe(2);
    const docs = materia.lados.map((lado) => conteudo.documentos[lado.documento]!);
    for (const [i, lado] of materia.lados.entries()) {
      const doc = docs[i]!;
      expect(doc, lado.id).toBeDefined();
      const gaveta = gavetaDe(lado.gaveta);
      expect(gaveta.documentos, lado.id).toContain(lado.documento);
      expect(gaveta.pessoa, lado.id).toBe(lado.pessoa);
      expect(doc.proposicoes.map((proposicao) => proposicao.id), lado.id).toContain(materia.proposicao);
    }
    expect(docs[0]!.proposicoes[0]!.ementa).toBe(docs[1]!.proposicoes[0]!.ementa);
    expect(docs.map((doc) => doc.natureza).sort()).toEqual(["ato", "voto"]);
    anosNosDocumentos(`${materia.pergunta} ${materia.objetivo} ${materia.titulo}`, materia.lados.map((lado) => lado.documento), materia.id);
    expect(materia.pergunta).not.toMatch(/\b(lula|bolsonaro|fl[aá]vio|pt|pl)\b/i);
    expect(`${materia.pergunta} ${materia.titulo}`).not.toMatch(/[—–]/);
  });

  it("as conversas da praça passam na validação do Escrivão, e cada nó que entrega um item existe em um grafo só", () => {
    for (const [chave, grafo] of Object.entries(CONVERSAS)) expect(validateDialog(grafo), chave).toEqual([]);
    for (const [no, item] of Object.entries(ITENS_POR_NO)) {
      expect(Object.values(CONVERSAS).filter((grafo) => grafo.nos[no] !== undefined), no).toHaveLength(1);
      expect(ITENS[item], item).toBeDefined();
    }
    expect(BILHETE).not.toMatch(/\b(?:1[89]|20)\d{2}\b/);
    expect(Object.keys(MORADORES).sort()).toEqual(["escrivao", "lourdes", "teodoro", "zefa"]);
    expect(LUGARES.map((lugar) => lugar.id)).toEqual(["mural", "padaria", "banca", "arquivo", "camara"]);
    expect(LUGARES.find((lugar) => lugar.id === "camara")?.morador).toBe("lourdes");
  });
});

describe("regras da praça", () => {
  const tutorial = pautaDe("primeira-data-planalto");
  const pauta1 = pautaDe("veto-regime-fiscal");
  const pauta2 = pautaDe("duas-pecs");
  const natureza = pautaDe("duas-leis-de-2025");
  const ordem = pautaDe("bolsa-familia-medida");

  it("começa sem pauta aberta, com o objetivo de ler o mural; abrir uma pauta a torna o objetivo", () => {
    const inicio = progressoInicial();
    expect(pautaAberta(inicio, conteudo.pautas)).toBeNull();
    expect(objetivoDeAgora(inicio, conteudo)).toMatch(/^Vá ao mural/);
    const aberta = abrirPauta(inicio, pauta1.id);
    expect(pautaAberta(aberta, conteudo.pautas)?.id).toBe(pauta1.id);
    expect(objetivoDeAgora(aberta, conteudo)).toBe(pauta1.objetivo);
    expect(abrirPauta(aberta, pauta1.id)).toBe(aberta);
  });

  it("a gaveta do Senado só abre com a chave; a cópia só sai de gaveta aberta, e sem repetição", () => {
    const inicio = progressoInicial();
    expect(gavetaAberta(gavetaDe("planalto-2023"), inicio)).toBe(true);
    expect(gavetaAberta(gavetaDe("senado-2023"), inicio)).toBe(false);
    expect(levarCopia(inicio, pauta2.resposta, conteudo.gavetas)).toBe(inicio);
    const comChave = pegarItem(inicio, "chave-senado");
    expect(gavetaAberta(gavetaDe("senado-2023"), comChave)).toBe(true);
    const copia = levarCopia(comChave, pauta2.resposta, conteudo.gavetas);
    expect(copia.copias).toEqual([pauta2.resposta]);
    expect(levarCopia(copia, pauta2.resposta, conteudo.gavetas)).toBe(copia);
    expect(devolverCopia(copia, pauta2.resposta).copias).toEqual([]);
    expect(levarCopia(inicio, "nao-existe", conteudo.gavetas)).toBe(inicio);
  });

  it("a conversa muda com a situação: a Zefa entrega a chave só a quem achou o bilhete, e o Escrivão reconhece a chave", () => {
    const inicio = progressoInicial();
    expect(conversaDe("zefa", inicio, conteudo).chave).toBe("zefa-boas-vindas");
    const comBilhete = pegarItem(inicio, "bilhete");
    const { chave, grafo } = conversaDe("zefa", comBilhete, conteudo);
    expect(chave).toBe("zefa-chave");
    const passo = conversar(comBilhete, grafo, startDialog(grafo), "bilhete");
    expect(passo.progresso.itens).toContain("chave-senado");
    expect(isDialogOver(passo.estado, grafo)).toBe(true);
    expect(currentNode(passo.estado, grafo).id).toBe("zefa-chave");
    expect(conversaDe("zefa", passo.progresso, conteudo).chave).toBe("zefa-boas-vindas");
    expect(conversaDe("escrivao", inicio, conteudo).chave).toBe("escrivao-gavetas");
    expect(conversaDe("escrivao", passo.progresso, conteudo).chave).toBe("escrivao-com-chave");
    expect(conversaDe("teodoro", inicio, conteudo).chave).toBe("teodoro-recortes");
    // A marca de uma escolha fica no progresso.
    const escrivao = conversaDe("escrivao", inicio, conteudo);
    const comLeitura = conversar(inicio, escrivao.grafo, startDialog(escrivao.grafo), "ler");
    expect(comLeitura.progresso.marcas).toContain("leitura");
  });

  it("o tutorial: um campo só, a data; sem a cópia não há o que conferir; a data de outra cópia é explicada pelo documento de onde veio", () => {
    expect(tipoDaPauta(tutorial)).toBe("campo");
    expect(documentosDaPauta(tutorial)).toEqual([tutorial.resposta]);
    let progresso = abrirPauta(progressoInicial(), tutorial.id);
    expect(camposDaPauta(tutorial, progresso, conteudo.documentos).map((campo) => campo.chave)).toEqual(["data"]);
    // Sem a cópia: o erro manda ao arquivo, com a gaveta.
    const semCopia = fixarNota(progresso, tutorial, { data: "data:2006-08-07" }, conteudo.documentos);
    expect(semCopia.certo).toBe(false);
    expect(semCopia.erros[0]!.mensagem).toContain("Leve do arquivo");
    expect(semCopia.progresso).toBe(progresso);
    // Com a cópia do pedido e a de outro documento, a data do outro é explicada pelo título dele.
    progresso = levarCopia(progresso, tutorial.resposta, conteudo.gavetas);
    progresso = levarCopia(progresso, pauta1.resposta, conteudo.gavetas);
    const certa = notaCerta(tutorial, conteudo.documentos)!;
    expect(camposDaPauta(tutorial, progresso, conteudo.documentos)[0]!.opcoes).toHaveLength(2);
    const errada = fixarNota(progresso, tutorial, { data: `data:${conteudo.documentos[pauta1.resposta]!.data.valor}` }, conteudo.documentos);
    expect(errada.certo).toBe(false);
    expect(errada.erros).toHaveLength(1);
    expect(errada.erros[0]!.campo).toBe("data");
    expect(errada.erros[0]!.mensagem).toContain(conteudo.documentos[pauta1.resposta]!.titulo);
    expect(errada.erros[0]!.mensagem).not.toContain(certa.data!.slice(5));
    const publicada = fixarNota(errada.progresso, tutorial, certa, conteudo.documentos);
    expect(publicada.certo).toBe(true);
    expect(publicada.progresso.pautas[tutorial.id]).toEqual({ situacao: "publicada", tentativas: 2, nota: certa });
  });

  it("a nota certa publica a pauta; a errada conta a tentativa e explica, campo a campo, só com o documento escolhido", () => {
    let progresso = abrirPauta(progressoInicial(), pauta1.id);
    for (const id of gavetaDe("planalto-2023").documentos) progresso = levarCopia(progresso, id, conteudo.gavetas);
    expect(progresso.copias.length).toBeGreaterThanOrEqual(2);
    const opcoes = opcoesDaNota(progresso, conteudo.documentos);
    expect(opcoes.documento.length).toBe(progresso.copias.length);
    const certa = notaCerta(pauta1, conteudo.documentos)!;
    expect(opcoes.quando.map((opcao) => opcao.chave)).toContain(certa.quando!);
    expect(opcoes.registro.map((opcao) => opcao.chave)).toContain(certa.registro!);
    expect(camposDaPauta(pauta1, progresso, conteudo.documentos).map((campo) => campo.chave)).toEqual(["documento", "quando", "registro"]);
    // O documento errado, com os campos dele: as frases falam dele e não dizem o certo.
    const errado = progresso.copias.find((id) => id !== certa.documento)!;
    const outra = fixarNota(
      progresso,
      pauta1,
      {
        documento: errado,
        quando: `data:${conteudo.documentos[errado]!.data.valor}`,
        registro: certa.registro!,
      },
      conteudo.documentos,
    );
    expect(outra.certo).toBe(false);
    expect(outra.erros.map((erro) => erro.campo)).toEqual(["documento", "registro"]);
    expect(outra.erros[0]!.mensagem).not.toContain(conteudo.documentos[certa.documento!]!.titulo);
    expect(outra.progresso.pautas[pauta1.id]?.tentativas).toBe(1);
    expect(outra.progresso.pautas[pauta1.id]?.situacao).toBe("aberta");
    // O documento certo com a data errada.
    const dataErrada = fixarNota(outra.progresso, pauta1, { ...certa, quando: `data:${conteudo.documentos[errado]!.data.valor}` }, conteudo.documentos);
    expect(dataErrada.certo).toBe(false);
    expect(dataErrada.erros.map((erro) => erro.campo)).toEqual(["quando"]);
    expect(dataErrada.erros[0]!.mensagem).toContain("O campo Data dele diz");
    // Tudo certo publica, uma vez, e fixar de novo não muda nada.
    const publicada = fixarNota(dataErrada.progresso, pauta1, certa, conteudo.documentos);
    expect(publicada.certo).toBe(true);
    expect(publicada.progresso.pautas[pauta1.id]).toEqual({
      situacao: "publicada",
      tentativas: 3,
      nota: certa,
    });
    expect(fixarNota(publicada.progresso, pauta1, certa, conteudo.documentos).progresso).toBe(publicada.progresso);
    // Sem a cópia do documento, a nota não é aceita.
    expect(fixarNota(progressoInicial(), pauta1, certa, conteudo.documentos).erros[0]!.campo).toBe("documento");
  });

  it("a pauta de natureza pede o documento e a ação: o documento parecido é explicado pelo que registra, e a ação errada pelo campo Ação do escolhido", () => {
    let progresso = abrirPauta(primeiraSessaoConcluida(), natureza.id);
    for (const id of [natureza.resposta, ...natureza.comparar]) progresso = levarCopia(progresso, id, conteudo.gavetas);
    expect(camposDaPauta(natureza, progresso, conteudo.documentos).map((campo) => campo.chave)).toEqual(["documento", "registro"]);
    const certa = notaCerta(natureza, conteudo.documentos)!;
    expect(Object.keys(certa).sort()).toEqual(["documento", "registro"]);
    const outro = natureza.comparar[0]!;
    const errada = fixarNota(progresso, natureza, { documento: outro, registro: certa.registro! }, conteudo.documentos);
    expect(errada.certo).toBe(false);
    expect(errada.erros.map((erro) => erro.campo)).toEqual(["documento", "registro"]);
    expect(errada.erros[0]!.mensagem).toContain("veto parcial");
    expect(errada.erros[1]!.mensagem).toContain("O campo Ação do documento que você escolheu");
    const publicada = fixarNota(errada.progresso, natureza, certa, conteudo.documentos);
    expect(publicada.certo).toBe(true);
    expect(notaFixada(natureza, conteudo.documentos)!.linhas.find((linha) => linha.rotulo === "Ação")?.valor).toBe("Sanção expressa");
  });

  it("a pauta de ordem pede os dois documentos pela data: trocados, cada lugar é explicado pelo campo Data do escolhido; o mesmo documento duas vezes não vale", () => {
    let progresso = abrirPauta(primeiraSessaoConcluida(), ordem.id);
    expect(documentosDaPauta(ordem)).toEqual([ordem.resposta, ...ordem.comparar]);
    // Só uma das duas cópias: a fixação pede as duas.
    progresso = levarCopia(progresso, ordem.resposta, conteudo.gavetas);
    expect(fixarNota(progresso, ordem, { primeiro: ordem.resposta, segundo: ordem.resposta }, conteudo.documentos).erros[0]!.mensagem).toContain("cópias dos dois documentos");
    progresso = levarCopia(progresso, ordem.comparar[0]!, conteudo.gavetas);
    expect(camposDaPauta(ordem, progresso, conteudo.documentos).map((campo) => campo.chave)).toEqual(["primeiro", "segundo"]);
    const certa = notaCerta(ordem, conteudo.documentos)!;
    expect(certa).toEqual({ primeiro: "planalto-mpv-132-2003-bolsa-familia", segundo: "planalto-lei-10836-2004-bolsa-familia" });
    const trocada = fixarNota(progresso, ordem, { primeiro: certa.segundo!, segundo: certa.primeiro! }, conteudo.documentos);
    expect(trocada.certo).toBe(false);
    expect(trocada.erros.map((erro) => erro.campo)).toEqual(["primeiro", "segundo"]);
    expect(trocada.erros[0]!.mensagem).toContain("O campo Data do documento que você pôs em primeiro lugar diz");
    const repetida = fixarNota(trocada.progresso, ordem, { primeiro: certa.primeiro!, segundo: certa.primeiro! }, conteudo.documentos);
    expect(repetida.erros.map((erro) => erro.campo)).toEqual(["segundo"]);
    expect(repetida.erros[0]!.mensagem).toContain("mesmo documento");
    const publicada = fixarNota(repetida.progresso, ordem, certa, conteudo.documentos);
    expect(publicada.certo).toBe(true);
    expect(publicada.progresso.pautas[ordem.id]?.tentativas).toBe(3);
    const fixada = notaFixada(ordem, conteudo.documentos)!;
    expect(fixada.documento.id).toBe(certa.primeiro);
    expect(fixada.segundo?.documento.id).toBe(certa.segundo);
  });

  it("a nota fixada mostra os campos do documento, o detalhe da natureza dele e as fontes", () => {
    const veto = notaFixada(pauta1, conteudo.documentos)!;
    expect(veto.itens.length).toBeGreaterThan(0);
    expect(veto.linhas.map((linha) => linha.rotulo)).toContain("Ação");
    expect(veto.linhas.map((linha) => linha.rotulo)).not.toContain("Objeto");
    expect(veto.fontes.length).toBeGreaterThan(0);
    expect(veto.segundo).toBeNull();
    const voto = notaFixada(pauta2, conteudo.documentos)!;
    expect(voto.itens).toEqual([]);
    expect(voto.linhas.map((linha) => linha.rotulo)).toContain("Objeto");
    expect(voto.linhas.map((linha) => linha.rotulo)).toContain("Resultado da votação");
    // Na segunda sessão: um ato com o objeto (a lei sancionada sem veto), e uma atuação com a norma em que deu.
    const sancao = notaFixada(natureza, conteudo.documentos)!;
    expect(sancao.linhas.map((linha) => linha.rotulo)).toContain("Objeto");
    expect(sancao.itens).toEqual([]);
    const autoria = notaFixada(pautaDe("lei-promulgada"), conteudo.documentos)!;
    expect(autoria.linhas.find((linha) => linha.rotulo === "Norma")?.valor).toMatch(/^Lei estadual/);
    expect(autoria.segundo?.linhas.find((linha) => linha.rotulo === "Ação")?.valor).toContain("promulgada pelo Legislativo");
  });

  it("os passos de uma pauta: aceitar, a chave quando a gaveta é trancada, as cópias e a resposta no mural; o passo de agora é o primeiro por fazer", () => {
    const inicio = progressoInicial();
    expect(passoDeAgora(inicio, conteudo)).toBeNull();
    expect(passosDaPauta(inicio, tutorial, conteudo).map((passo) => [passo.id, passo.feito])).toEqual([
      ["aceitar", false],
      ["copiar", false],
      ["montar", false],
    ]);
    expect(passosDaPauta(inicio, tutorial, conteudo)[1]!.texto).toContain("Planalto · 2006");
    // A pauta do Senado tem o passo da chave até a chave chegar.
    const aberta = abrirPauta(inicio, pauta2.id);
    expect(passosDaPauta(aberta, pauta2, conteudo).map((passo) => passo.id)).toEqual(["aceitar", "chave", "copiar", "montar"]);
    expect(passoDeAgora(aberta, conteudo)).toMatchObject({ indice: 1, de: pauta2.autor });
    const comChave = pegarItem(aberta, "chave-senado");
    expect(passosDaPauta(comChave, pauta2, conteudo).map((passo) => passo.feito)).toEqual([true, true, false, false]);
    expect(passoDeAgora(comChave, conteudo)?.passos[2]!.texto).toContain("Senado · 2023");
    // A pauta de ordem pede as duas gavetas.
    const ordemAberta = abrirPauta(primeiraSessaoConcluida(), ordem.id);
    expect(passosDaPauta(ordemAberta, ordem, conteudo)[1]!.texto).toContain("Planalto · 2003 e Planalto · 2004");
    expect(passosDaPauta(ordemAberta, ordem, conteudo)[2]!.texto).toContain("ordem do campo Data");
    // Respondida, todos os passos estão feitos e o passo de agora passa a ser da matéria, quando ela está na pauta.
    const respondida = responder(primeiraSessaoConcluida(), ordem);
    expect(passosDaPauta(respondida, ordem, conteudo).every((passo) => passo.feito)).toBe(true);
    expect(passoDeAgora(respondida, conteudo)).toBeNull();
    const naMesa = abrirMateria(respondida, materia.id);
    expect(passoDeAgora(naMesa, conteudo)?.passos.map((passo) => passo.id)).toEqual(["materia", "credencial", "copiar", "lavrar"]);
    expect(passoDeAgora(naMesa, conteudo)?.indice).toBe(1);
    expect(passosDaMateria(lavrar(naMesa), materia, conteudo).every((passo) => passo.feito)).toBe(true);
  });

  it("os selos reconhecem o caminho e nada mais: começam vazios, a primeira nota ganha o primeiro, a edição respondida ganha o último", () => {
    const inicio = progressoInicial();
    expect(selos(inicio, conteudo).every((selo) => !selo.ganho)).toBe(true);
    expect(selos(inicio, conteudo).map((selo) => selo.id)).toEqual(["primeira-nota", "chave-de-leitura", "chave-do-senado", "mural-da-primeira-sessao", "porta-da-camara", "credencial", "ata-lavrada", "edicao-respondida"]);
    const primeira = responder(inicio, tutorial);
    expect(selosNovos(inicio, primeira, conteudo).map((selo) => selo.id)).toEqual(["primeira-nota"]);
    const sessaoFeita = primeiraSessaoConcluida();
    expect(selos(sessaoFeita, conteudo).filter((selo) => selo.ganho).map((selo) => selo.id)).toEqual(["primeira-nota", "chave-do-senado", "mural-da-primeira-sessao", "porta-da-camara"]);
    let fim = lavrar(sessaoFeita);
    expect(selosNovos(sessaoFeita, fim, conteudo).map((selo) => selo.id)).toEqual(["credencial", "ata-lavrada"]);
    for (const pauta of pautasDaSessao(sessao2, conteudo)) fim = responder(fim, pauta);
    expect(selos(fim, conteudo).filter((selo) => !selo.ganho).map((selo) => selo.id)).toEqual(["chave-de-leitura"]);
    expect(selos(fim, conteudo).at(-1)?.descricao).toContain("8 perguntas");
    // As descobertas contam o que a pessoa leu, com quem falou e o que guardou.
    expect(descobertas(inicio, conteudo)).toEqual({ documentos: 0, documentosNoArquivo: Object.keys(conteudo.documentos).length, conversas: 0, notas: 0, itens: 0 });
    const comConversa = { ...fim, marcas: [...fim.marcas, "conversa:zefa-boas-vindas", "conversa:zefa-chave", "conversa:teodoro-recortes"] };
    expect(descobertas(comConversa, conteudo)).toMatchObject({ conversas: 2, notas: 8, itens: 3 });
  });

  it("a primeira sessão concluída abre a Câmara e a segunda sessão: o mural ganha as quatro pautas, e as conversas mudam", () => {
    const inicio = progressoInicial();
    expect(camaraAberta(inicio, conteudo)).toBe(false);
    expect(lugaresDeAgora(inicio, conteudo).find((lugar) => lugar.id === "camara")?.trancado).toBe(true);
    expect(pautasDisponiveis(inicio, conteudo).map((pauta) => pauta.id)).toEqual(sessao1.pautas);
    expect(sessaoDeAgora(inicio, conteudo)?.id).toBe(sessao1.id);
    const progresso = primeiraSessaoConcluida();
    expect(todasPublicadas(progresso, pautasDaSessao(sessao1, conteudo))).toBe(true);
    expect(sessaoConcluida(progresso, sessao1, conteudo)).toBe(true);
    expect(sessaoConcluida(progresso, sessao2, conteudo)).toBe(false);
    expect(sessaoDeAgora(progresso, conteudo)?.id).toBe(sessao2.id);
    expect(camaraAberta(progresso, conteudo)).toBe(true);
    expect(lugaresDeAgora(progresso, conteudo).find((lugar) => lugar.id === "camara")?.trancado).toBe(false);
    expect(pautasDisponiveis(progresso, conteudo)).toHaveLength(8);
    expect(objetivoDeAgora(progresso, conteudo)).toContain("A Câmara abriu");
    expect(fimDaEdicao(progresso, conteudo)).toBe(false);
    expect(conversaDe("zefa", progresso, conteudo).chave).toBe("zefa-sessao");
    expect(conversaDe("teodoro", progresso, conteudo).chave).toBe("teodoro-credencial");
    expect(conversaDe("lourdes", progresso, conteudo).chave).toBe("lourdes-sessao");
    expect(conversaDe("escrivao", progresso, conteudo).chave).toBe("escrivao-com-chave");
  });

  it("a credencial vem do Teodoro, só na segunda sessão; com ela, a Lourdes libera a mesa e o Escrivão fala da matéria", () => {
    const progresso = primeiraSessaoConcluida();
    const { grafo } = conversaDe("teodoro", progresso, conteudo);
    const passo = conversar(progresso, grafo, startDialog(grafo), "pegar");
    expect(passo.progresso.itens).toContain("credencial");
    expect(isDialogOver(passo.estado, grafo)).toBe(true);
    expect(conversaDe("teodoro", passo.progresso, conteudo).chave).toBe("teodoro-recortes");
    expect(conversaDe("lourdes", passo.progresso, conteudo).chave).toBe("lourdes-mesa");
    expect(conversaDe("escrivao", passo.progresso, conteudo).chave).toBe("escrivao-materia");
    // Quem recusa o envelope continua sem a credencial, e o Teodoro oferece de novo.
    const depois = conversar(progresso, grafo, startDialog(grafo), "depois");
    expect(depois.progresso.itens).not.toContain("credencial");
    expect(conversaDe("teodoro", depois.progresso, conteudo).chave).toBe("teodoro-credencial");
    // O objetivo diz que a mesa pede a credencial enquanto ela falta.
    const naPauta = abrirMateria(progresso, materia.id);
    expect(situacaoDaMateria(naPauta, materia.id)).toBe("aberta");
    expect(objetivoDeAgora(naPauta, conteudo)).toContain("A mesa pede a credencial de imprensa");
    expect(objetivoDeAgora(pegarItem(naPauta, "credencial"), conteudo)).toBe(materia.objetivo);
  });

  it("a ata certa lavra a matéria; a errada conta a tentativa e explica, por lado, só com o documento escolhido", () => {
    let progresso = abrirMateria(pegarItem(primeiraSessaoConcluida(), "credencial"), materia.id);
    // Todas as cópias das duas gavetas da matéria: há documento errado em uma delas.
    for (const lado of materia.lados) for (const id of gavetaDe(lado.gaveta).documentos) progresso = levarCopia(progresso, id, conteudo.gavetas);
    const certa = ataCerta(materia, conteudo.documentos)!;
    const [senado, planalto] = materia.lados as [(typeof materia.lados)[number], (typeof materia.lados)[number]];
    const outroVoto = gavetaDe(senado.gaveta).documentos.find((id) => id !== senado.documento)!;
    // O voto errado no lado do Senado, com a ação dele: só o documento desse lado é apontado, sem dizer o certo.
    const errada = lavrarAta(progresso, materia, { ...certa, [senado.id]: { documento: outroVoto, registro: `acao:${conteudo.documentos[outroVoto]!.titulo}` } }, conteudo.documentos);
    expect(errada.certo).toBe(false);
    expect(errada.erros.map((erro) => `${erro.lado}:${erro.campo}`)).toEqual([`${senado.id}:documento`, `${senado.id}:registro`]);
    expect(errada.erros[0]!.mensagem).toContain("Esse documento registra voto");
    expect(errada.erros[0]!.mensagem).toContain("A mesa pede o voto no Senado");
    expect(errada.erros[0]!.mensagem).not.toContain(conteudo.documentos[senado.documento]!.titulo);
    expect(errada.progresso.atas[materia.id]).toEqual({ situacao: "aberta", tentativas: 1 });
    // O ato do Planalto posto no lado do Senado: o erro fala dele.
    const trocada = lavrarAta(errada.progresso, materia, { ...certa, [senado.id]: certa[planalto.id]! }, conteudo.documentos);
    expect(trocada.erros.map((erro) => `${erro.lado}:${erro.campo}`)).toEqual([`${senado.id}:documento`]);
    expect(trocada.erros[0]!.mensagem).toContain("veto parcial");
    // Um lado sem cópia não é aceito.
    const semCopia = lavrarAta(devolverCopia(trocada.progresso, planalto.documento), materia, certa, conteudo.documentos);
    expect(semCopia.erros).toEqual([{ lado: planalto.id, campo: "documento", mensagem: "Escolha um documento que você levou do arquivo." }]);
    // Tudo certo lavra, uma vez.
    const lavrada = lavrarAta(trocada.progresso, materia, certa, conteudo.documentos);
    expect(lavrada.certo).toBe(true);
    expect(lavrada.progresso.atas[materia.id]).toEqual({ situacao: "publicada", tentativas: 3, ata: certa });
    expect(lavrarAta(lavrada.progresso, materia, certa, conteudo.documentos).progresso).toBe(lavrada.progresso);
    expect(conversaDe("lourdes", lavrada.progresso, conteudo).chave).toBe("lourdes-ata");
    expect(objetivoDeAgora(lavrada.progresso, conteudo)).toContain("Agora o mural");
  });

  it("a ata lavrada mostra a matéria e os dois documentos inteiros, lado a lado, sem frase que os compare", () => {
    const ata = ataLavrada(materia, conteudo.documentos)!;
    expect(ata.proposicao?.identificacao).toBe("PL 2253/2022");
    expect(ata.lados.map((lado) => lado.lado.id)).toEqual(materia.lados.map((lado) => lado.id));
    const voto = ata.lados.find((lado) => lado.documento.natureza === "voto")!;
    const ato = ata.lados.find((lado) => lado.documento.natureza === "ato")!;
    expect(voto.linhas.map((linha) => linha.rotulo)).toEqual(["Data", "Instituição", "Cargo", "Objeto", "Ação", "Resultado da votação"]);
    expect(ato.linhas.map((linha) => linha.rotulo)).toEqual(["Data", "Instituição", "Cargo", "Objeto", "Ação", "Mensagem de veto"]);
    expect(ato.itens.length).toBeGreaterThan(0);
    for (const lado of ata.lados) expect(lado.fontes.length).toBeGreaterThan(0);
  });

  it("a edição acaba com a ata lavrada e as oito notas no mural: o objetivo e as conversas dizem isso", () => {
    let progresso = lavrar(primeiraSessaoConcluida());
    expect(fimDaEdicao(progresso, conteudo)).toBe(false);
    for (const pauta of pautasDaSessao(sessao2, conteudo)) {
      expect(objetivoDeAgora(progresso, conteudo)).toMatch(/mural/);
      progresso = abrirPauta(progresso, pauta.id);
      expect(objetivoDeAgora(progresso, conteudo)).toBe(pauta.objetivo);
      progresso = responder(progresso, pauta);
    }
    expect(sessaoConcluida(progresso, sessao2, conteudo)).toBe(true);
    expect(fimDaEdicao(progresso, conteudo)).toBe(true);
    expect(sessaoDeAgora(progresso, conteudo)).toBeNull();
    expect(objetivoDeAgora(progresso, conteudo)).toMatch(/^As pautas desta edição acabaram/);
    expect(conversaDe("zefa", progresso, conteudo).chave).toBe("zefa-fim");
    expect(conversaDe("lourdes", progresso, conteudo).chave).toBe("lourdes-fim");
    expect(conversaDe("teodoro", progresso, conteudo).chave).toBe("teodoro-recortes");
  });

  it("o roteiro sem a matéria: a segunda sessão se conclui só com as pautas", () => {
    const roteiro: Roteiro = { ...conteudo, materias: [] };
    let progresso = primeiraSessaoConcluida();
    expect(sessaoConcluida(progresso, sessao2, roteiro)).toBe(false);
    for (const pauta of pautasDaSessao(sessao2, roteiro)) progresso = responder(progresso, pauta);
    expect(fimDaEdicao(progresso, roteiro)).toBe(true);
  });

  it("o progresso salvo é lido de volta, com ou sem atas; dado inválido vira começo; pauta, matéria e cópia desconhecidas são descartadas", () => {
    let progresso = abrirPauta(progressoInicial(), pauta1.id);
    progresso = pegarItem(progresso, "bilhete");
    progresso = levarCopia(progresso, pauta1.resposta, conteudo.gavetas);
    progresso = {
      ...progresso,
      posicao: { x: 1.5, z: -2 },
      marcas: ["leitura"],
    };
    expect(lerProgresso(JSON.parse(JSON.stringify(progresso)), conteudo)).toEqual(progresso);
    const comAta = lavrar(primeiraSessaoConcluida());
    expect(lerProgresso(JSON.parse(JSON.stringify(comAta)), conteudo)).toEqual(comAta);
    // Gravado antes da segunda sessão: sem o campo `atas`.
    const antigo = JSON.parse(JSON.stringify(progresso)) as Record<string, unknown>;
    delete antigo.atas;
    expect(lerProgresso(antigo, conteudo)).toEqual(progresso);
    expect(lerProgresso({ versao: 2 }, conteudo)).toBeNull();
    expect(lerProgresso({ versao: 1, pautas: {}, itens: "x", copias: [], marcas: [] }, conteudo)).toBeNull();
    expect(lerProgresso({ versao: 1, pautas: {}, atas: [], itens: [], copias: [], marcas: [] }, conteudo)).toBeNull();
    expect(lerProgresso({ versao: 1, pautas: { [pauta1.id]: { situacao: "publicada", tentativas: 1, nota: { documento: 7 } } }, atas: {}, itens: [], copias: [], marcas: [] }, conteudo)).toBeNull();
    expect(lerProgresso({ versao: 1, pautas: {}, atas: { [materia.id]: { situacao: "publicada", tentativas: 1, ata: { x: 1 } } }, itens: [], copias: [], marcas: [] }, conteudo)).toBeNull();
    const sujo = lerProgresso(
      {
        versao: 1,
        pautas: { "nao-existe": { situacao: "aberta", tentativas: 0 } },
        atas: { "nao-existe": { situacao: "aberta", tentativas: 0 } },
        itens: ["bilhete", "outra"],
        copias: ["nao-existe", pauta1.resposta],
        marcas: [],
      },
      conteudo,
    )!;
    expect(sujo.pautas).toEqual({});
    expect(sujo.atas).toEqual({});
    expect(sujo.itens).toEqual(["bilhete"]);
    expect(sujo.copias).toEqual([pauta1.resposta]);
  });
});
