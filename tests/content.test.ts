import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { readSources, resolvePaths } from "@/lib/content/sources";
import { compareTrajectories, filterEvents, findPersonBySlug } from "@/lib/data/queries";
import { PROFILES } from "@/lib/domain/profiles";
import { buildAtlasData } from "@/lib/publication/build";
import { formatDiagnostic } from "@/lib/publication/diagnostics";

import {
  DRAFTS_DIR,
  PUBLISHED_DIR,
  baseContent,
  createProject,
  omitField,
  removeProjects,
  type ContentFiles,
} from "./helpers";

afterEach(removeProjects);

const errors = (projeto: ReturnType<typeof createProject>) =>
  projeto
    .result()
    .diagnostics.filter((item) => item.severidade === "erro")
    .map(formatDiagnostic);

describe("leitura das pastas de conteúdo", () => {
  it("lê a edição e as coleções das duas pastas", () => {
    const base = baseContent();
    const rascunho = { ...base.acontecimentos[7], id: "teste-evento-09", slug: "teste-evento-09" };
    const projeto = createProject({ published: base, drafts: { acontecimentos: [rascunho] } });

    const { validacao, ok } = projeto.result();
    expect(ok).toBe(true);
    expect(validacao.edicao?.versao).toBe("0.0.1");
    expect(validacao.registros.pessoas).toHaveLength(2);
    expect(validacao.registros.acontecimentos).toHaveLength(9);
    expect(validacao.registros.acontecimentos.at(-1)).toMatchObject({
      pasta: "drafts",
      arquivo: "content/drafts/acontecimentos.json",
    });
  });

  it("trata coleção sem arquivo como lista vazia", () => {
    const semImagens: ContentFiles = baseContent();
    delete semImagens.imagens;
    const { ok, data } = createProject({ published: semImagens }).result();
    expect(ok).toBe(true);
    expect(data?.conjunto.imagens).toEqual([]);
  });

  it("sem nenhum arquivo, não há edição e o conjunto é vazio", () => {
    const { ok, data, diagnostics } = createProject().result();
    expect(ok).toBe(true);
    expect(diagnostics).toEqual([]);
    expect(data?.conjunto.edicao).toBeNull();
    expect(data?.conjunto.acontecimentos).toEqual([]);
    expect(data?.pontos).toEqual({ type: "FeatureCollection", features: [] });
  });

  it("aceita arquivo salvo com BOM", () => {
    const base = baseContent();
    const projeto = createProject({ published: base });
    projeto.writeFile("content/published/fontes.json", `﻿${JSON.stringify(base.fontes)}`);
    expect(errors(projeto)).toEqual([]);
  });

  it("recusa arquivo fora do contrato, como um nome digitado errado", () => {
    const projeto = createProject({ published: baseContent() });
    projeto.writeFile("content/published/acontecimento.json", "[]");
    expect(errors(projeto)).toEqual([
      expect.stringMatching(
        /^content\/published\/acontecimento\.json: Arquivo não faz parte do contrato de conteúdo/,
      ),
    ]);
  });

  it("recusa a edição na pasta de rascunhos", () => {
    const base = baseContent();
    const projeto = createProject({ published: base, drafts: { edicao: base.edicao } });
    expect(errors(projeto)).toEqual([
      "content/drafts/edicao.json: A edição fica em content/published, e não na pasta de rascunhos.",
    ]);
  });

  it("recusa coleções sem o arquivo da edição", () => {
    const semEdicao: ContentFiles = baseContent();
    delete semEdicao.edicao;
    expect(errors(createProject({ published: semEdicao }))).toContain(
      "content/published/edicao.json · edicao: Há registros em content/published, mas falta o arquivo da edição.",
    );
  });

  it("recusa JSON ilegível dizendo qual arquivo, sem cascata de erros de referência", () => {
    const projeto = createProject({ published: baseContent() });
    projeto.writeFile("content/published/fontes.json", "[ isto não é json");
    const encontrados = errors(projeto);
    expect(encontrados).toHaveLength(1);
    expect(encontrados[0]).toMatch(/^content\/published\/fontes\.json: JSON ilegível: /);
  });

  it("recusa arquivo que não é uma lista", () => {
    const projeto = createProject({ published: { ...baseContent(), lugares: { id: "x" } } });
    expect(errors(projeto)).toContain(
      "content/published/lugares.json · lugar: O arquivo deve conter uma lista de registros.",
    );
  });

  it("aponta arquivo, entidade, id, campo e motivo", () => {
    const base = baseContent();
    base.lugares[5]!.latitude = 120;
    const [problema, ...resto] = createProject({ published: base })
      .result()
      .diagnostics.filter((item) => item.severidade === "erro");

    expect(resto).toEqual([]);
    expect(problema).toEqual({
      severidade: "erro",
      codigo: "estrutura",
      arquivo: "content/published/lugares.json",
      entidade: "lugar",
      id: "teste-lugar-exterior",
      campo: "latitude",
      mensagem: "Valor acima do máximo (90).",
    });
    expect(formatDiagnostic(problema!)).toBe(
      'content/published/lugares.json · lugar "teste-lugar-exterior" · latitude: Valor acima do máximo (90).',
    );
  });

  it("registro sem id é apontado pela posição na lista", () => {
    const base = baseContent();
    omitField(base.fontes[1]!, "id");
    const [problema] = createProject({ published: base })
      .result()
      .diagnostics.filter((item) => item.codigo === "estrutura");
    expect(problema).toMatchObject({ arquivo: "content/published/fontes.json", id: null, campo: "[1].id" });
  });
});

describe("conteúdo do repositório", () => {
  const paths = resolvePaths();
  const resultado = buildAtlasData(readSources(paths));
  const data = resultado.data!;

  it("passa pelo pipeline sem erros e sem avisos", () => {
    const problemas = resultado.diagnostics
      .filter((item) => item.severidade !== "pendencia")
      .map(formatDiagnostic);
    expect(problemas).toEqual([]);
    expect(resultado.ok).toBe(true);
  });

  it("não contém nenhum marcador de dado sintético", () => {
    for (const dir of [PUBLISHED_DIR, DRAFTS_DIR]) {
      for (const nome of readdirSync(dir).filter((item) => item.endsWith(".json"))) {
        const conteudo = readFileSync(path.join(dir, nome), "utf8");
        expect(conteudo, nome).not.toMatch(/sint[eé]tico|exemplo\.invalid/i);
      }
    }
  });

  it("tem os dois perfis da primeira edição, cada um com 15 a 20 acontecimentos", () => {
    expect(data.conjunto.edicao).not.toBeNull();

    for (const perfil of PROFILES) {
      const pessoa = findPersonBySlug(data, perfil.slug);
      expect(pessoa, perfil.slug).not.toBeNull();

      const total = filterEvents(data, { pessoaIds: [pessoa!.id] }).length;
      expect(total, perfil.slug).toBeGreaterThanOrEqual(15);
      expect(total, perfil.slug).toBeLessThanOrEqual(20);
    }
  });

  it("não registra revisão humana que não aconteceu", () => {
    // Enquanto ninguém revisar o conjunto, toda revisão é assistida por IA.
    // Este teste deve ser ajustado quando a primeira revisão humana for registrada.
    const { pessoas, mandatos, filiacoes, acontecimentos, edicao } = data.conjunto;
    for (const registro of [...pessoas, ...mandatos, ...filiacoes, ...acontecimentos]) {
      expect(registro.editorial.estado, registro.id).toBe("revisado");
      if (registro.editorial.estado === "revisado") {
        expect(registro.editorial.revisao.tipo, registro.id).toBe("assistida-por-ia");
      }
    }
    expect(edicao?.revisao.tipo).toBe("assistida-por-ia");
  });

  it("toda imagem publicada tem arquivo do formato e do tamanho declarados", () => {
    const sondas = readSources(paths).midia;
    expect(data.conjunto.imagens.length).toBeGreaterThan(0);
    for (const imagem of data.conjunto.imagens) {
      expect(sondas[imagem.arquivo], imagem.arquivo).toMatchObject({
        existe: true,
        formato: "jpeg",
        largura: imagem.dimensoes?.largura,
        altura: imagem.dimensoes?.altura,
      });
    }
  });

  it("todo registro fora da publicação é rascunho com a pendência escrita", () => {
    const fora = resultado.excluidos.filter((item) => item.entidade === "acontecimento");
    expect(fora.length).toBeGreaterThan(0);
    for (const item of fora) {
      expect(item.motivo, item.id).toBe("rascunho");
      expect(item.arquivo, item.id).toBe("content/drafts/acontecimentos.json");
      expect(item.pendencias.length, item.id).toBeGreaterThan(0);
    }
  });

  it("os dados públicos não trazem nada do que está fora da publicação", () => {
    const publico = JSON.stringify(data);
    for (const item of resultado.excluidos) expect(publico, item.id).not.toContain(`"${item.id}"`);
  });

  it("todo lugar e toda fonte dos dados públicos é usado por um registro publicado", () => {
    const { conjunto, indices } = data;
    for (const lugar of conjunto.lugares) {
      expect(indices.acontecimentos.porLugar[lugar.id]?.length ?? 0, lugar.id).toBeGreaterThan(0);
    }
    const citadas = new Set(
      [...conjunto.pessoas, ...conjunto.mandatos, ...conjunto.filiacoes, ...conjunto.acontecimentos]
        .flatMap((registro) => registro.fontes)
        .map((citacao) => citacao.fonteId),
    );
    expect(conjunto.fontes.map((fonte) => fonte.id).sort()).toEqual([...citadas].sort());
  });

  it("consulta, índice e comparação trazem os mesmos acontecimentos de cada pessoa", () => {
    const { trajetorias } = compareTrajectories(data);
    const todos = filterEvents(data).map((item) => item.id);
    const reunidos = new Set<string>();

    for (const perfil of PROFILES) {
      const pessoa = findPersonBySlug(data, perfil.slug)!;
      const daConsulta = filterEvents(data, { pessoaIds: [pessoa.id] }).map((item) => item.id);
      const doIndice = data.indices.acontecimentos.porPessoa[pessoa.id] ?? [];
      const daComparacao = trajetorias
        .find((item) => item.pessoa.id === pessoa.id)!
        .acontecimentos.map((item) => item.id);
      const doConteudo = data.conjunto.acontecimentos
        .filter((item) => item.pessoaIds.includes(pessoa.id))
        .map((item) => item.id);

      // A mesma lista, na mesma ordem, pelos quatro caminhos.
      expect(daConsulta, perfil.slug).toEqual(doConteudo);
      expect(doIndice, perfil.slug).toEqual(doConteudo);
      expect(daComparacao, perfil.slug).toEqual(doConteudo);
      for (const id of doConteudo) reunidos.add(id);
    }
    // Ninguém fica fora das trajetórias, e ninguém entra duas vezes na lista geral.
    expect([...reunidos].sort()).toEqual([...todos].sort());
  });

  it("os pontos do mapa fecham com os lugares documentados de cada acontecimento", () => {
    const { conjunto, indices, pontos } = data;
    const porAcontecimento = new Map<string, string[]>();
    for (const ponto of pontos.features) {
      const { eventId, placeId } = ponto.properties;
      porAcontecimento.set(eventId, [...(porAcontecimento.get(eventId) ?? []), placeId]);
    }

    let esperados = 0;
    for (const acontecimento of conjunto.acontecimentos) {
      const noMapa = (porAcontecimento.get(acontecimento.id) ?? []).sort();
      if (acontecimento.localizacao.tipo === "lugares") {
        const lugares = [...new Set(acontecimento.localizacao.lugarIds)].sort();
        expect(noMapa, acontecimento.id).toEqual(lugares);
        esperados += lugares.length;
      } else {
        // Abrangência nacional ou lugar não documentado: nenhum ponto, e o motivo no índice.
        expect(noMapa, acontecimento.id).toEqual([]);
        expect(indices.acontecimentos.semPonto[acontecimento.localizacao.tipo], acontecimento.id).toContain(
          acontecimento.id,
        );
      }
    }
    expect(pontos.features).toHaveLength(esperados);

    // Com ponto ou sem ponto, todo acontecimento está em um dos dois lados, uma vez.
    const semPonto = [...indices.acontecimentos.semPonto.nacional, ...indices.acontecimentos.semPonto.desconhecida];
    expect(new Set([...porAcontecimento.keys(), ...semPonto]).size).toBe(conjunto.acontecimentos.length);
    expect(porAcontecimento.size + semPonto.length).toBe(conjunto.acontecimentos.length);
  });

  it("toda fonte da edição foi acessada depois do documento e traz endereço seguro", () => {
    for (const fonte of data.conjunto.fontes) {
      expect(fonte.url, fonte.id).toMatch(/^https:\/\//);
      if (fonte.dataDocumento.tipo === "data" && fonte.dataDocumento.precisao === "dia") {
        expect(fonte.dataDocumento.valor <= fonte.acessadoEm, fonte.id).toBe(true);
      }
    }
    // Nenhum endereço repetido: cada documento entra uma vez no catálogo.
    const enderecos = data.conjunto.fontes.map((fonte) => fonte.url);
    expect(new Set(enderecos).size).toBe(enderecos.length);
  });

  it("o nome de cada cargo se explica sem a instituição", () => {
    // A página do acontecimento e a linha do tempo escrevem só o nome do cargo.
    // O mesmo nome em instituições diferentes ("Presidente" de um sindicato e
    // de um partido) deixaria a leitura por conta de quem lê.
    const instituicoes = new Map<string, Set<string>>();
    for (const mandato of data.conjunto.mandatos) {
      const chave = `${mandato.pessoaId} · ${mandato.cargo}`;
      instituicoes.set(chave, (instituicoes.get(chave) ?? new Set()).add(mandato.instituicao));
    }
    const ambiguos = [...instituicoes].filter(([, onde]) => onde.size > 1).map(([chave]) => chave);
    expect(ambiguos).toEqual([]);
  });

  it("o acontecimento compartilhado aparece nas duas trajetórias e uma vez na lista geral", () => {
    const { trajetorias, compartilhados } = compareTrajectories(data);
    expect(trajetorias.map((item) => item.pessoa.slug).sort()).toEqual(
      PROFILES.map((perfil) => perfil.slug).sort(),
    );
    expect(compartilhados.length).toBeGreaterThan(0);

    const todos = filterEvents(data).map((item) => item.id);
    expect(new Set(todos).size).toBe(todos.length);
    for (const id of compartilhados) {
      for (const { acontecimentos } of trajetorias) {
        expect(acontecimentos.filter((item) => item.id === id)).toHaveLength(1);
      }
    }
  });
});
