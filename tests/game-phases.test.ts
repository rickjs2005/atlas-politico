// As fases publicadas da trilha, contra as regras do jogo simples
// (docs/GAME-TRAIL.md e docs/GAMEPLAY.md): a mesma forma para as duas
// pessoas, a origem primeiro, a ordem cronológica até a data de corte, a
// explicação curta, os termos definidos na primeira vez em que aparecem, e o
// texto de cada fase dizendo só o que os registros apontados dizem.

import { describe, expect, it } from "vitest";

import { readSources, resolvePaths } from "@/lib/content/sources";
import { findPersonBySlug } from "@/lib/data/queries";
import { yearOf } from "@/lib/domain/dates";
import { LIMITES_DA_FASE, countWords } from "@/lib/domain/game";
import { PROFILES } from "@/lib/domain/profiles";
import { buildGameContent, buildProgressKeys, countTrailPhases, roomSummaries } from "@/lib/game/content";
import { judicialOf } from "@/lib/game/judicial";
import { ROOM_IDS } from "@/lib/game/rooms";
import { activityRefs, activitySignature, correctOrder, displayOrder, isResolved, orderingDisplay, phaseRefs, refDate, refKey } from "@/lib/game/trail";
import type { GameContent, PersonagemSlug, PhaseRef, PhaseSpec } from "@/lib/game/types";
import { buildAtlasData } from "@/lib/publication/build";

const data = buildAtlasData(readSources(resolvePaths())).data!;
const SLUGS = PROFILES.map((perfil) => perfil.slug);
const CORTE = Number(data.conjunto.edicao!.dataDeCorte.slice(0, 4));

const conteudoDe = (slug: PersonagemSlug, sala: (typeof ROOM_IDS)[number]): GameContent => buildGameContent(data, slug, sala)!;
/** Toda fase publicada, com o conteúdo da sala dela. */
const TODAS: { fase: PhaseSpec; content: GameContent }[] = SLUGS.flatMap((slug) => ROOM_IDS.flatMap((sala) => conteudoDe(slug, sala).fases.map((fase) => ({ fase, content: conteudoDe(slug, sala) }))));
const trilhaDe = (slug: PersonagemSlug) => conteudoDe(slug, "historico").fases;

const textoDaExplicacao = (fase: PhaseSpec) => fase.explicacao.map((bloco) => bloco.texto).join(" ");
const refsDaAtividade = (fase: PhaseSpec): readonly PhaseRef[] => activityRefs(fase.atividade);
/** Os textos que a pessoa lê na atividade: o enunciado, as opções (ou as fichas) e a explicação da resposta. */
const textosDaAtividade = (fase: PhaseSpec): string[] => [
  fase.atividade.enunciado,
  ...(fase.atividade.tipo === "pergunta" ? fase.atividade.opcoes.map((opcao) => opcao.texto) : fase.atividade.tipo === "dossie" ? fase.atividade.fichas.map((ficha) => ficha.texto) : []),
  fase.atividade.explicacao,
];

/** O que um registro apontado diz, sem as fontes e sem a nota de revisão (que trazem datas de acesso e de conferência). */
function textoDoRegistro(referencia: PhaseRef, content: GameContent): string {
  const { tipo, id } = referencia;
  const registro =
    tipo === "acontecimento" ? content.registros[id] : tipo === "decisao" ? content.decisoes[id] : tipo === "fato" ? content.fatos[id] : tipo === "conceito" ? content.conceitos[id] : tipo === "proposta" ? content.propostas[id] : content.posicoes[id];
  if (registro === undefined) return "";
  return JSON.stringify(registro, (chave, valor: unknown) => (chave === "fontes" || chave === "editorial" || chave === "oficial" || chave === "textoReferencia" ? undefined : valor));
}

const anosDe = (texto: string) => [...new Set(texto.match(/\b(?:1[89]\d{2}|20\d{2})\b/g) ?? [])];

describe("a forma da trilha, igual para as duas pessoas", () => {
  it("cada trajetória tem de sete a nove fases, e cada aprofundamento e a missão, uma: a mesma contagem para as duas", () => {
    const contagens = SLUGS.map((slug) => ROOM_IDS.map((sala) => conteudoDe(slug, sala).fases.length));
    for (const [historico, economia, seguranca, investigacao] of contagens) {
      expect(historico).toBeGreaterThanOrEqual(7);
      expect(historico).toBeLessThanOrEqual(9);
      expect([economia, seguranca, investigacao]).toEqual([1, 1, 1]);
    }
    expect(contagens[0]).toEqual(contagens[1]);
    for (const slug of SLUGS) {
      expect(countTrailPhases(data, slug), slug).toBe(trilhaDe(slug).length);
      const pessoa = findPersonBySlug(data, slug)!;
      expect(roomSummaries(data, pessoa.id).map((sala) => [sala.id, sala.fases]), slug).toEqual([["historico", 9], ["economia", 1], ["seguranca-publica", 1], ["investigacao", 1]]);
      expect(buildProgressKeys(data, slug).fases).toHaveLength(12);
    }
  });

  it("as fases de cada sala são numeradas de 1 em sequência, e todo identificador é único e do personagem", () => {
    const ids = TODAS.map(({ fase }) => fase.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const slug of SLUGS) {
      for (const sala of ROOM_IDS) expect(conteudoDe(slug, sala).fases.map((fase) => fase.numero), `${slug} ${sala}`).toEqual(conteudoDe(slug, sala).fases.map((_, indice) => indice + 1));
      for (const fase of [...trilhaDe(slug), ...conteudoDe(slug, "economia").fases]) {
        expect(fase.personagem).toBe(slug);
        expect(fase.id.startsWith(`${slug}-`), fase.id).toBe(true);
      }
    }
  });

  it("começa pela origem: a primeira fase é a do nascimento, no ano em que os documentos o registram", () => {
    const anos: Record<string, number> = {};
    for (const slug of SLUGS) {
      const content = conteudoDe(slug, "historico");
      const [primeira] = content.fases;
      expect(primeira!.id, slug).toBe(`${slug}-origem`);
      expect(primeira!.marco.tipo, slug).toBe("fato");
      const nascimento = content.fatos[primeira!.marco.id]!;
      expect(nascimento.tipo, slug).toBe("nascimento");
      expect(primeira!.periodo.de, slug).toBe(yearOf(nascimento.data!));
      anos[slug] = primeira!.periodo.de;
      // A origem não tem cenário de infância, e nada do que ela diz vem de fora dos fatos biográficos.
      for (const referencia of phaseRefs(primeira!)) expect(referencia.tipo, `${slug} ${refKey(referencia)}`).toBe("fato");
    }
    expect(anos).toEqual({ lula: 1945, "flavio-bolsonaro": 1981 });
  });

  it("segue em ordem cronológica e termina na eleição do ano da data de corte, com o mesmo fecho para as duas", () => {
    const fechos = SLUGS.map((slug) => {
      const fases = trilhaDe(slug);
      for (let i = 1; i < fases.length; i += 1) {
        expect(fases[i]!.periodo.de, `${slug} fase ${i + 1}`).toBeGreaterThanOrEqual(fases[i - 1]!.periodo.de);
        expect(fases[i]!.periodo.ate, `${slug} fase ${i + 1}`).toBeGreaterThanOrEqual(fases[i - 1]!.periodo.ate);
      }
      for (const fase of fases) expect(fase.periodo.ate, fase.id).toBeGreaterThanOrEqual(fase.periodo.de);
      const ultima = fases.at(-1)!;
      expect(ultima.periodo.ate, slug).toBe(CORTE);
      expect(ultima.marco, slug).toEqual({ tipo: "acontecimento", id: "eleicao-2026-primeiro-turno" });
      return { titulo: ultima.titulo, objetivo: ultima.objetivo, blocos: ultima.explicacao.length, enunciado: ultima.atividade.enunciado, opcoes: ultima.atividade.tipo === "pergunta" ? ultima.atividade.opcoes : [], lacunas: ultima.lacunas };
    });
    // A última fase tem o mesmo título, o mesmo objetivo, a mesma pergunta e as mesmas lacunas para as duas pessoas.
    expect(fechos[0]).toEqual(fechos[1]);
    // O texto diz até onde o atlas vai, e não adianta o resultado do segundo turno.
    for (const slug of SLUGS) expect(textoDaExplicacao(trilhaDe(slug).at(-1)!), slug).toMatch(/O atlas vai até 8 de outubro de 2026 e não traz o resultado do segundo turno\./);
  });

  it("as duas trilhas passam pelas mesmas etapas: origem, cargos, exemplos documentados de atuação, processos e eleição", () => {
    for (const slug of SLUGS) {
      const fases = trilhaDe(slug);
      const marcos = fases.map((fase) => fase.marco.tipo);
      // Ao menos dois marcos são decisões documentadas (atos, votos ou atuação legislativa): o que a pessoa fez no cargo.
      expect(marcos.filter((tipo) => tipo === "decisao").length, slug).toBeGreaterThanOrEqual(2);
      // Uma, e só uma, fase de processos, com o marco na ficha judicial.
      expect(fases.filter((fase) => judicialOf(fase.marco.id) !== null).map((fase) => fase.id), slug).toEqual([`${slug}-processos`]);
      // Toda fase tem um marco só, que é um registro da pessoa, e ele aparece na explicação.
      for (const fase of fases) expect(fase.explicacao.some((bloco) => bloco.referencias.some((referencia) => refKey(referencia) === refKey(fase.marco))), fase.id).toBe(true);
    }
  });
});

describe("leitura curta", () => {
  it("a explicação de toda fase tem de 60 a 100 palavras, em dois a quatro blocos", () => {
    expect([LIMITES_DA_FASE.palavrasMinimasDaExplicacao, LIMITES_DA_FASE.palavrasDaExplicacao]).toEqual([60, 100]);
    for (const { fase } of TODAS) {
      const palavras = fase.explicacao.reduce((soma, bloco) => soma + countWords(bloco.texto), 0);
      expect(palavras, fase.id).toBeGreaterThanOrEqual(LIMITES_DA_FASE.palavrasMinimasDaExplicacao);
      expect(palavras, fase.id).toBeLessThanOrEqual(LIMITES_DA_FASE.palavrasDaExplicacao);
      expect(fase.explicacao.length, fase.id).toBeGreaterThanOrEqual(2);
      expect(fase.explicacao.length, fase.id).toBeLessThanOrEqual(LIMITES_DA_FASE.blocos);
    }
  });

  it("as duas trilhas têm tamanho parecido: nenhuma pessoa recebe muito mais texto que a outra", () => {
    const [lula, flavio] = SLUGS.map((slug) => trilhaDe(slug).reduce((soma, fase) => soma + countWords(textoDaExplicacao(fase)), 0));
    expect(Math.abs(lula! - flavio!) / Math.max(lula!, flavio!)).toBeLessThan(0.1);
  });

  it("cada fase tem um objetivo em uma frase, um título curto e ao menos uma lacuna declarada", () => {
    for (const { fase } of TODAS) {
      expect(fase.objetivo, fase.id).toMatch(/^[a-zà-ú].*\.$/);
      expect(countWords(fase.objetivo), fase.id).toBeLessThanOrEqual(30);
      expect(fase.titulo.length, fase.id).toBeLessThanOrEqual(60);
      expect(fase.lacunas.length, fase.id).toBeGreaterThanOrEqual(1);
      for (const lacuna of fase.lacunas) expect(lacuna, fase.id).toMatch(/\.$/);
    }
  });

  it("a atividade é uma pergunta com três opções ou uma ordenação de três registros, e a ordenação só aparece quando as datas decidem", () => {
    for (const { fase, content } of TODAS) {
      const { atividade } = fase;
      expect(countWords(atividade.enunciado), fase.id).toBeLessThanOrEqual(LIMITES_DA_FASE.palavrasDoEnunciado);
      expect(atividade.explicacao.length, fase.id).toBeGreaterThan(0);
      if (atividade.tipo === "pergunta") {
        expect(atividade.opcoes, fase.id).toHaveLength(3);
        expect(atividade.opcoes.map((opcao) => opcao.id), fase.id).toContain(atividade.correta);
        for (const opcao of atividade.opcoes) expect(countWords(opcao.texto), `${fase.id} ${opcao.id}`).toBeLessThanOrEqual(LIMITES_DA_FASE.palavrasDaOpcao);
        expect(atividade.referencias.length, fase.id).toBeGreaterThan(0);
      } else if (atividade.tipo === "ordem") {
        expect(atividade.itens, fase.id).toHaveLength(3);
        const datas = atividade.itens.map((item) => refDate(item, content));
        for (const data of datas) expect(data, fase.id).not.toBeNull();
        // Os anos são diferentes: a ordem não depende de dia nem de mês.
        expect(new Set(datas.map((data) => yearOf(data!))).size, fase.id).toBe(3);
        expect(correctOrder(atividade, content), fase.id).toHaveLength(3);
      } else {
        // O dossiê (D-151): três fichas, cada uma com um documento próprio e um trecho destacado que está no texto, e três distratores da mesma pessoa.
        expect(atividade.fichas, fase.id).toHaveLength(3);
        expect(atividade.distratores, fase.id).toHaveLength(3);
        expect(new Set(atividade.fichas.map((ficha) => refKey(ficha.evidencia))).size, fase.id).toBe(3);
        for (const ficha of atividade.fichas) {
          expect(countWords(ficha.texto), `${fase.id} ${ficha.id}`).toBeLessThanOrEqual(LIMITES_DA_FASE.palavrasDaFicha);
          expect(ficha.texto.includes(ficha.destaque.trecho), `${fase.id} ${ficha.id}`).toBe(true);
          expect(content.decisoes[ficha.evidencia.id]?.pessoaId, `${fase.id} ${ficha.id}`).toBe(findPersonBySlug(data, fase.personagem)!.id);
        }
        for (const distrator of atividade.distratores) expect(content.decisoes[distrator.id]?.pessoaId, `${fase.id} ${distrator.id}`).toBe(findPersonBySlug(data, fase.personagem)!.id);
        // Os trechos destacados pedem campos diferentes: a missão ensina mais de um campo.
        expect(new Set(atividade.fichas.map((ficha) => ficha.destaque.campo)).size, fase.id).toBeGreaterThanOrEqual(2);
      }
    }
    // A ordenação é a exceção: a maioria das fases é pergunta. O dossiê é só a missão de investigação, uma por pessoa.
    expect(TODAS.filter(({ fase }) => fase.atividade.tipo === "ordem").length).toBeLessThanOrEqual(4);
    expect(TODAS.filter(({ fase }) => fase.atividade.tipo === "dossie").map(({ fase }) => fase.id).sort()).toEqual(["flavio-bolsonaro-investigacao", "lula-investigacao"]);
  });

  it("a opção certa não fica sempre na mesma posição da tela", () => {
    const posicoes = TODAS.flatMap(({ fase }) => {
      if (fase.atividade.tipo !== "pergunta") return [];
      const { correta, opcoes } = fase.atividade;
      return [displayOrder(fase.id, opcoes, (opcao) => opcao.id).findIndex((opcao) => opcao.id === correta)];
    });
    for (const posicao of [0, 1, 2]) expect(posicoes.filter((item) => item === posicao).length, `posição ${posicao + 1}`).toBeGreaterThanOrEqual(2);
  });

  it("nenhuma ordenação aparece na tela já na ordem certa, para nenhuma das duas pessoas", () => {
    const ordenacoes = TODAS.filter(({ fase }) => fase.atividade.tipo === "ordem");
    // As duas trilhas têm a fase de processos como ordenação: a atividade não pode vir resolvida em uma e embaralhada na outra.
    for (const slug of SLUGS) expect(ordenacoes.some(({ fase }) => fase.id === `${slug}-processos`), slug).toBe(true);
    for (const { fase, content } of ordenacoes) {
      if (fase.atividade.tipo !== "ordem") continue;
      const exibidos = orderingDisplay(fase, content).map(refKey);
      expect(exibidos, fase.id).not.toEqual(correctOrder(fase.atividade, content));
      expect([...exibidos].sort(), fase.id).toEqual(fase.atividade.itens.map(refKey).sort());
    }
  });

  it("todo conceito que a atividade aponta está entre os termos da própria fase: a pergunta não cobra o que a fase não explica", () => {
    for (const { fase } of TODAS) {
      for (const referencia of refsDaAtividade(fase)) {
        if (referencia.tipo === "conceito") expect(fase.conceitos, `${fase.id}: a atividade aponta o conceito ${referencia.id}`).toContain(referencia.id);
      }
    }
  });

  it("nenhum texto de fase usa travessão, e nenhum traz palavra de juízo sobre as pessoas", () => {
    for (const { fase } of TODAS) {
      const textos = [fase.titulo, fase.objetivo, ...fase.explicacao.map((bloco) => bloco.texto), ...textosDaAtividade(fase), ...fase.lacunas];
      for (const texto of textos) {
        expect(texto, fase.id).not.toMatch(/[—–]/);
        expect(texto, fase.id).not.toMatch(/\b(infelizmente|felizmente|polêmic[oa]s?|escândalos?|famos[oa]s?|her[oó]i|vítimas?|golpe|corrupt[oa]s?|bandid[oa]s?|brilhante|vergonh\w+|absurd[oa]s?)\b/i);
      }
    }
  });
});

describe("o texto da fase diz só o que os registros apontados dizem", () => {
  it("todo registro apontado por uma fase, e todo conceito dela, está no conteúdo da sala", () => {
    for (const { fase, content } of TODAS) {
      for (const referencia of phaseRefs(fase)) expect(isResolved(referencia, content), `${fase.id} aponta ${refKey(referencia)}`).toBe(true);
      for (const id of fase.conceitos) expect(content.conceitos[id], `${fase.id} define ${id}`).toBeDefined();
      // Cada assinatura de atividade é a que o progresso salvo usa.
      expect(buildProgressKeys(data, fase.personagem).assinaturas[fase.id], fase.id).toBe(activitySignature(fase, content));
    }
  });

  it("todo ano citado em um bloco da explicação está em um registro que o bloco aponta", () => {
    for (const { fase, content } of TODAS) {
      fase.explicacao.forEach((bloco, indice) => {
        const apoio = bloco.referencias.map((referencia) => textoDoRegistro(referencia, content)).join(" ");
        for (const ano of anosDe(bloco.texto)) expect(apoio.includes(ano), `${fase.id}, bloco ${indice + 1}: o ano ${ano} não está nos registros apontados`).toBe(true);
      });
    }
  });

  it("todo ano citado no enunciado, na opção certa e na explicação da resposta está em um registro que a atividade aponta", () => {
    for (const { fase, content } of TODAS) {
      const apoio = refsDaAtividade(fase).map((referencia) => textoDoRegistro(referencia, content)).join(" ");
      const certa = fase.atividade.tipo === "pergunta" ? fase.atividade.opcoes.find((opcao) => opcao.id === (fase.atividade as { correta: string }).correta)!.texto : "";
      for (const ano of anosDe([fase.atividade.enunciado, certa, fase.atividade.explicacao].join(" "))) expect(apoio.includes(ano), `${fase.id}: o ano ${ano} da atividade não está nos registros que ela aponta`).toBe(true);
    }
  });

  it("toda ficha de um dossiê diz só o que o próprio documento dela registra: os anos e os meses da ficha estão nele", () => {
    const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    for (const { fase, content } of TODAS) {
      if (fase.atividade.tipo !== "dossie") continue;
      for (const ficha of fase.atividade.fichas) {
        const documento = content.decisoes[ficha.evidencia.id]!;
        const texto = textoDoRegistro(ficha.evidencia, content);
        for (const ano of anosDe(ficha.texto)) expect(texto.includes(ano), `${fase.id} ${ficha.id}: o ano ${ano} não está no documento`).toBe(true);
        const mes = MESES.findIndex((nome) => ficha.texto.toLowerCase().includes(`${nome} de `));
        if (mes >= 0) expect(Number(documento.data.valor.slice(5, 7)), `${fase.id} ${ficha.id}: o mês da ficha não é o do documento`).toBe(mes + 1);
      }
    }
  });

  it("todo número com porcentagem ou com casa de milhar citado na explicação de uma fase está, igual, em um registro que ela aponta", () => {
    for (const { fase, content } of TODAS) {
      const apoio = [fase.marco, ...fase.explicacao.flatMap((bloco) => bloco.referencias), ...refsDaAtividade(fase)].map((referencia) => textoDoRegistro(referencia, content)).join(" ");
      const numeros = [...textoDaExplicacao(fase).matchAll(/\d+(?:,\d+)?%|\d{1,3}(?:\.\d{3})+/g)].map((item) => item[0]);
      for (const numero of new Set(numeros)) expect(apoio.includes(numero), `${fase.id}: o número ${numero} não está nos registros apontados`).toBe(true);
    }
  });

  it("os registros de Explorar são opcionais: nenhum é o marco, e nenhum é necessário para a atividade", () => {
    for (const { fase } of TODAS) {
      // Um registro que só apoia uma frase de resumo (as seis votações de uma fase, por exemplo) pode também estar em Explorar; o marco e o que a atividade usa, não.
      const necessarios = new Set([refKey(fase.marco), ...refsDaAtividade(fase).map(refKey)]);
      for (const referencia of fase.explorar) expect(necessarios.has(refKey(referencia)), `${fase.id}: ${refKey(referencia)} é necessário e está em Explorar`).toBe(false);
      expect(new Set(fase.explorar.map(refKey)).size, fase.id).toBe(fase.explorar.length);
    }
  });

  it("os registros de Explorar este período caem nos anos da fase: com data, pelo ano; cargo e filiação, pelo intervalo", () => {
    const anoDoLimite = (limite: { tipo: string; valor?: string }): number | null => (limite.tipo === "data" && typeof limite.valor === "string" ? Number(limite.valor.slice(0, 4)) : null);
    for (const { fase, content } of TODAS) {
      const { de, ate } = fase.periodo;
      for (const referencia of fase.explorar) {
        const onde = `${fase.id}: ${refKey(referencia)} fora de ${de} a ${ate}`;
        if (referencia.tipo === "mandato" || referencia.tipo === "filiacao") {
          const registro = (referencia.tipo === "mandato" ? data.conjunto.mandatos : data.conjunto.filiacoes).find((item) => item.id === referencia.id);
          expect(registro, onde).toBeDefined();
          const inicio = anoDoLimite(registro!.periodo.inicio);
          const fim = anoDoLimite(registro!.periodo.fim);
          // Limite desconhecido ou em curso não exclui: só uma data conhecida pode pôr o registro fora do período.
          if (inicio !== null) expect(inicio, onde).toBeLessThanOrEqual(ate);
          if (fim !== null) expect(fim, onde).toBeGreaterThanOrEqual(de);
          continue;
        }
        const dataDoRegistro = refDate(referencia, content);
        if (dataDoRegistro === null) continue;
        expect(yearOf(dataDoRegistro), onde).toBeGreaterThanOrEqual(de);
        expect(yearOf(dataDoRegistro), onde).toBeLessThanOrEqual(ate);
      }
    }
  });
});

describe("termos definidos na primeira vez em que aparecem", () => {
  /** O termo, como aparece no texto, e o conceito que o define. */
  const TERMOS: [RegExp, string][] = [
    [/\bsindicat/i, "sindicato"],
    [/\bgreves?\b/i, "greve"],
    [/\bdeputad[oa]s? federa(l|is)\b/i, "deputado-federal"],
    [/\bdeputad[oa]s? estadua(l|is)\b/i, "deputado-estadual"],
    [/\bsenador(es|a|as)?\b/i, "senador"],
    [/\bConstituinte\b/, "assembleia-constituinte"],
    [/\bPECs?\b/, "pec"],
    [/\bprojetos? de lei(?! complementar)\b/i, "projeto-de-lei"],
    [/\b(projetos? de )?leis? complementar(es)?\b/i, "lei-complementar"],
    [/\bsancion\w+|\bsanç(ão|ões)\b/i, "sancao"],
    [/\bvet(o|os|ou|ar|ada|adas|ado|ados)\b/i, "veto"],
    [/\bdenúncias?\b|\bdenunci(ou|ar|ado|ada)\b/i, "denuncia"],
    [/\banul(ou|ação|ar|adas|ados|ada|ado)\b/i, "anulacao"],
    [/\bmedidas? provisórias?\b/i, "medida-provisoria"],
    [/\bdecret(o|os|ou)\b/i, "decreto"],
    [/\brelator(a|es|ia|ias)?\b/i, "relator"],
    // O turno de uma eleição; o segundo turno de votação de uma PEC é outra coisa, e a definição de PEC o explica.
    [/\b(no|ao|do|o|um) (primeiro|segundo) turno\b/i, "turnos-da-eleicao"],
    [/\bintervenç(ão|ões) federa(l|is)\b/i, "intervencao-federal"],
    [/\bconvenç(ão|ões)\b/i, "convencao-e-registro-de-candidatura"],
    [/\bproposta de governo\b/i, "proposta-de-governo"],
  ];

  /** Os conceitos que o texto de uma fase usa, pela lista de termos. */
  const usadosEm = (fase: PhaseSpec) => {
    const texto = [textoDaExplicacao(fase), ...textosDaAtividade(fase)].join(" ");
    return TERMOS.filter(([padrao]) => padrao.test(texto)).map(([, conceito]) => conceito);
  };

  it("todo conceito da lista existe no conteúdo publicado, com definição curta e o texto oficial que a sustenta", () => {
    const publicados = new Map(data.conjunto.conceitos.map((conceito) => [conceito.id, conceito] as const));
    for (const [, id] of TERMOS) {
      const conceito = publicados.get(id);
      expect(conceito, id).toBeDefined();
      expect(countWords(conceito!.definicao), id).toBeLessThanOrEqual(LIMITES_DA_FASE.palavrasDoConceito);
      expect(conceito!.fontes.length, id).toBeGreaterThan(0);
    }
    // Os termos que o roteiro do jogo simples pede: sindicato, deputado, senador, Constituinte, PEC, projeto de lei, sanção, veto, denúncia e anulação.
    for (const pedido of ["sindicato", "deputado-federal", "deputado-estadual", "senador", "assembleia-constituinte", "pec", "projeto-de-lei", "sancao", "veto", "denuncia", "anulacao"]) expect(publicados.has(pedido), pedido).toBe(true);
  });

  it("na trajetória, o termo é definido na fase em que aparece pela primeira vez, ou em uma fase anterior", () => {
    for (const slug of SLUGS) {
      const definidos = new Set<string>();
      for (const fase of trilhaDe(slug)) {
        for (const id of fase.conceitos) definidos.add(id);
        for (const conceito of usadosEm(fase)) expect(definidos.has(conceito), `${fase.id} usa "${conceito}" sem defini-lo`).toBe(true);
      }
    }
  });

  it("no aprofundamento e na missão, que podem ser abertos direto, o termo é definido na própria fase", () => {
    for (const slug of SLUGS) {
      for (const sala of ["economia", "seguranca-publica", "investigacao"] as const) {
        for (const fase of conteudoDe(slug, sala).fases) {
          for (const conceito of usadosEm(fase)) expect(fase.conceitos, `${fase.id} usa "${conceito}" sem defini-lo`).toContain(conceito);
        }
      }
    }
  });

  it("uma fase define no máximo quatro termos, sem repetir nenhum", () => {
    for (const { fase } of TODAS) {
      expect(fase.conceitos.length, fase.id).toBeLessThanOrEqual(4);
      expect(new Set(fase.conceitos).size, fase.id).toBe(fase.conceitos.length);
    }
  });
});

describe("o que cada tipo de registro é", () => {
  it("as fases distinguem voto, ato, atuação legislativa, proposta e resultado: uma proposta nunca é marco, e a fase de 2026 diz que proposta é intenção", () => {
    for (const { fase } of TODAS) expect(["acontecimento", "decisao", "fato"], fase.id).toContain(fase.marco.tipo);
    for (const slug of SLUGS) {
      const ultima = trilhaDe(slug).at(-1)!;
      expect(ultima.conceitos, slug).toContain("proposta-de-governo");
      expect(ultima.atividade.explicacao, slug).toContain("Não é lei, voto nem resultado");
      // Uma proposta por área, na mesma ordem das áreas para as duas pessoas.
      expect(ultima.explorar.filter((referencia) => referencia.tipo === "proposta").map((referencia) => referencia.id.replace(`proposta-${slug}-`, "")), slug).toEqual([
        "2026-economia-1",
        "2026-seguranca-publica-1",
        "2026-saude-1",
        "2026-educacao-1",
        "2026-reforma-do-estado-1",
        "2026-meio-ambiente-1",
        "2026-direitos-das-mulheres-1",
      ]);
    }
  });

  it("os aprofundamentos dizem o assunto e os anos, e declaram que são amostra", () => {
    for (const slug of SLUGS) {
      for (const sala of ["economia", "seguranca-publica"] as const) {
        const [fase] = conteudoDe(slug, sala).fases;
        expect(fase!.titulo, fase!.id).toMatch(sala === "economia" ? /^Economia: / : /^Segurança pública: /);
        expect(fase!.lacunas.some((lacuna) => /amostra/.test(lacuna)), fase!.id).toBe(true);
        expect(fase!.marco.tipo, fase!.id).toBe("decisao");
        // As três propostas da área, para as duas pessoas.
        expect(fase!.explorar.map((referencia) => referencia.id), fase!.id).toEqual([1, 2, 3].map((n) => `proposta-${slug}-2026-${sala}-${n}`));
      }
    }
  });

  it("nas fases de voto, o texto separa o voto da pessoa do resultado da votação", () => {
    const deVotos = TODAS.filter(({ fase, content }) => content.decisoes[fase.marco.id]?.natureza === "voto").map(({ fase }) => fase);
    expect(deVotos.map((fase) => fase.id).sort()).toEqual(["flavio-bolsonaro-decisoes-no-senado", "flavio-bolsonaro-economia", "flavio-bolsonaro-investigacao", "flavio-bolsonaro-seguranca-publica"]);
    for (const fase of deVotos) expect(textoDaExplicacao(fase), fase.id).toMatch(/votou (não|sim)[^.]*[;,.] (o projeto|a proposta|as duas propostas|as seis propostas)?[^.]*aprovad/i);
  });

  it("nas fases de leis estaduais, o texto diz que a lei é de autoria dele e como ela virou lei, sem dizer o que ela produziu", () => {
    const fases = trilhaDe("flavio-bolsonaro").filter((fase) => fase.id.includes("-alerj-"));
    expect(fases).toHaveLength(2);
    const content = conteudoDe("flavio-bolsonaro", "historico");
    for (const fase of fases) {
      const decisao = content.decisoes[fase.marco.id]!;
      expect(decisao.natureza, fase.id).toBe("atuacao");
      expect(textoDaExplicacao(fase), fase.id).toMatch(/de autoria (dele|de Flávio Bolsonaro)|projeto dele/);
      expect(textoDaExplicacao(fase), fase.id).not.toMatch(/\b(melhorou|reduziu|aumentou|garantiu|beneficiou|resolveu)\b/i);
      expect(fase.lacunas.join(" "), fase.id).toMatch(/oito leis|promulgada/);
    }
  });
});
