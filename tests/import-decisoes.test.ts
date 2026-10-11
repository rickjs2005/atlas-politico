// Os adaptadores dos acervos oficiais (Senado e Câmara) sobre amostras reais
// das APIs, reduzidas a poucos votos (tests/fixtures/apis/): o que cada
// resposta vira no pacote de importação, como o voto individual, a ausência
// e o não voto são distinguidos pelo valor original, e que a falta de linha
// nunca vira ausência. Também as capturas e o ritmo das requisições.

import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { coberturaCamara, mergePacotes, normalizeCamaraVotacao, registroDoVotoCamara, type CamaraVotacaoDetalhe, type CamaraVoto } from "@/lib/import/camara";
import { buildCaptura, kebab } from "@/lib/import/capturas";
import { fetchTexto } from "@/lib/import/http";
import { inferEtapa, inferObjeto, normalizeSenado, registroDoVoto, tiposComparecimentoDe, type SenadoSessaoVotacao } from "@/lib/import/senado";
import { atoExecutivoSchema, coberturaPoliticaSchema, fonteSchema, proposicaoSchema, votacaoSchema, votoSchema } from "@/lib/domain/schemas";

const amostra = (nome: string): unknown => JSON.parse(readFileSync(`tests/fixtures/apis/${nome}.json`, "utf8"));
const senadoItens = amostra("senado-votacao-sessao-520516") as SenadoSessaoVotacao[];
const tipos = tiposComparecimentoDe(amostra("senado-tipos-comparecimento"));
const camaraDetalhe = (amostra("camara-votacao-2611313-31") as { dados: CamaraVotacaoDetalhe }).dados;
const camaraVotos = (amostra("camara-votos-2611313-31") as { dados: CamaraVoto[] }).dados;

const OPCOES_SENADO = {
  codigoParlamentar: "5672",
  pessoaId: "teste-pessoa",
  mandatoId: "teste-mandato",
  urlConsulta: "https://legis.senado.leg.br/dadosabertos/votacao?codigoParlamentar=5672",
  capturadoEm: "2026-10-10",
  capturaId: "senado-votacao-5672-2026-10-10-abc123",
  periodo: { de: "2019-02-01", ate: "2026-10-08" },
  tiposComparecimento: tipos,
  completa: true,
};

describe("Senado: a resposta vira proposição, votação, voto e cobertura, tudo rascunho", () => {
  const pacote = normalizeSenado(senadoItens, OPCOES_SENADO);

  it("a lista de tipos de comparecimento é lida como sigla → descrição", () => {
    expect(Object.keys(tipos).length).toBeGreaterThan(40);
    expect(tipos["P-NRV"]).toBe("Presente – Não registrou voto");
    expect(tipos.LS).toBe("Licença saúde");
  });

  it("cada registro passa pelo contrato, como rascunho e com pendências", () => {
    expect(pacote.fontes).toHaveLength(1);
    expect(fonteSchema.safeParse(pacote.fontes[0]).success).toBe(true);
    for (const item of pacote.proposicoes) expect(proposicaoSchema.safeParse(item), JSON.stringify(item)).toMatchObject({ success: true });
    for (const item of pacote.votacoes) expect(votacaoSchema.safeParse(item), JSON.stringify(item)).toMatchObject({ success: true });
    for (const item of pacote.votos) expect(votoSchema.safeParse(item), JSON.stringify(item)).toMatchObject({ success: true });
    for (const item of pacote.coberturaPolitica) expect(coberturaPoliticaSchema.safeParse(item), JSON.stringify(item)).toMatchObject({ success: true });
    for (const item of [...pacote.proposicoes, ...pacote.votacoes, ...pacote.votos, ...pacote.coberturaPolitica] as { editorial: { estado: string; pendencias: string[] } }[]) {
      expect(item.editorial.estado).toBe("rascunho");
      expect(item.editorial.pendencias.length).toBeGreaterThan(0);
    }
  });

  it("a proposição e a votação levam os identificadores do acervo, o objeto nas palavras dele e o resultado original", () => {
    const [proposicao] = pacote.proposicoes as { id: string; identidadeExterna: { provedor: string; id: string }; tipo: string; numero: number; ano: number; temas: string[] }[];
    expect(proposicao?.id).toBe("senado-plp-185-2024");
    expect(proposicao?.identidadeExterna.provedor).toBe("senado");
    expect(proposicao?.tipo).toBe("PLP");
    expect(proposicao?.numero).toBe(185);
    expect(proposicao?.ano).toBe(2024);
    // A classificação temática é decisão editorial: a importação não a inventa.
    expect(proposicao?.temas).toEqual([]);

    const [votacao] = pacote.votacoes as { id: string; proposicaoId: string; data: { valor: string }; modalidade: string; objeto: { tipo: string; descricao: string }; resultadoOficial: { estado: string; valorOriginal: string }; fontes: { localizacao: string; evidencia: string }[] }[];
    expect(votacao?.id).toBe("senado-votacao-7029");
    expect(votacao?.proposicaoId).toBe("senado-plp-185-2024");
    expect(votacao?.data.valor).toBe(senadoItens[0]!.dataSessao.slice(0, 10));
    expect(votacao?.modalidade).toBe("nominal");
    expect(votacao?.objeto.descricao).toBe(senadoItens[0]!.descricaoVotacao);
    expect(votacao?.resultadoOficial.valorOriginal).toBe("A");
    expect(votacao?.resultadoOficial.estado).toBe("aprovado");
    expect(votacao?.fontes[0]?.localizacao).toContain("codigoSessaoVotacao=7029");
  });

  it("o voto do parlamentar leva o valor original, a proveniência com a captura e a citação do item", () => {
    const [voto] = pacote.votos as { id: string; registro: unknown; proveniencia: { registroExternoId: string; capturaId: string }; fontes: { evidencia: string }[] }[];
    expect(pacote.votos).toHaveLength(1);
    expect(voto?.id).toBe("senado-voto-7029-5672");
    expect(voto?.registro).toEqual({ tipo: "voto-individual", posicao: "FAVOR", valorOriginal: "Sim" });
    expect(voto?.proveniencia).toEqual({ provedor: "senado", registroExternoId: "7029:5672", capturaId: OPCOES_SENADO.capturaId });
    expect(voto?.fontes[0]?.evidencia).toBe("siglaVotoParlamentar: Sim");
  });

  it("sem linha do parlamentar na votação, não há voto importado, e a cobertura anota a lacuna", () => {
    const semLinha = normalizeSenado(senadoItens, { ...OPCOES_SENADO, codigoParlamentar: "999999" });
    expect(semLinha.votos).toEqual([]);
    expect(semLinha.votacoes).toHaveLength(1);
    const [cobertura] = semLinha.coberturaPolitica as { estado: string; lacunas: string[]; tema: string }[];
    expect(cobertura?.estado).toBe("parcial");
    expect(cobertura?.tema).toBe("geral");
    expect(cobertura?.lacunas.some((linha) => linha.includes("1 votações da resposta não trazem linha"))).toBe(true);
  });

  it("as siglas do acervo viram os três tipos de registro, sem inventar ausência nem posição", () => {
    const voto = (sigla: string | null) => registroDoVoto({ codigoParlamentar: 1, siglaVotoParlamentar: sigla }, false, tipos);
    expect(voto("Sim").registro).toEqual({ tipo: "voto-individual", posicao: "FAVOR", valorOriginal: "Sim" });
    expect(voto("Não").registro).toEqual({ tipo: "voto-individual", posicao: "CONTRA", valorOriginal: "Não" });
    expect(voto("Abstenção").registro).toEqual({ tipo: "voto-individual", posicao: "ABSTENCAO", valorOriginal: "Abstenção" });
    expect(voto("OB").registro).toEqual({ tipo: "voto-individual", posicao: "OBSTRUCAO", valorOriginal: "OB" });
    expect(voto("LS").registro).toEqual({ tipo: "ausencia-documentada", valorOriginal: "LS", motivoDocumentado: "Licença saúde" });
    expect(voto("NCom").registro).toEqual({ tipo: "ausencia-documentada", valorOriginal: "NCom", motivoDocumentado: "Não Compareceu" });
    expect(voto("P-NRV").registro).toEqual({ tipo: "nao-votou-documentado", valorOriginal: "P-NRV", motivoDocumentado: "Presente – Não registrou voto" });
    expect(voto("Presidente (art. 51 RISF)").registro).toMatchObject({ tipo: "nao-votou-documentado", valorOriginal: "Presidente (art. 51 RISF)" });
    // Votação secreta registra participação, não posição.
    const secreto = registroDoVoto({ codigoParlamentar: 1, siglaVotoParlamentar: "Votou" }, true, tipos);
    expect(secreto.registro).toEqual({ tipo: "voto-individual", posicao: "OUTRO", valorOriginal: "Votou" });
    expect(secreto.pendencias[0]).toContain("secreta");
    // Sigla desconhecida fica como OUTRO, com pendência, e nunca some.
    const estranho = voto("XYZ");
    expect(estranho.registro).toEqual({ tipo: "voto-individual", posicao: "OUTRO", valorOriginal: "XYZ" });
    expect(estranho.pendencias[0]).toContain('"XYZ"');
    expect(voto(null).registro).toMatchObject({ posicao: "OUTRO" });
  });

  it("o objeto e a etapa são inferidos das palavras do acervo, como primeira leitura", () => {
    expect(inferObjeto("Emenda nº 13-Plen ao Projeto de Lei nº 1321, de 2019")).toBe("emenda");
    expect(inferObjeto("Substitutivo da Câmara ao PLS 123")).toBe("substitutivo");
    expect(inferObjeto("Requerimento de urgência para o PL 1")).toBe("requerimento");
    expect(inferObjeto("PEC nº 25, de 2017 (2º turno)")).toBe("texto-principal");
    expect(inferObjeto("Votação nominal do Projeto de Lei Complementar nº 185, de 2024, nos termos dos pareceres.")).toBe("texto-principal");
    expect(inferObjeto("Destaque para votação em separado")).toBe("destaque");
    expect(inferObjeto("Coisa nenhuma")).toBe("outro");
    // O que abre a descrição manda: o texto do projeto "ressalvados os destaques" não é destaque, a Proposta de Emenda à Constituição não é emenda, e a emenda substitutiva é substitutivo.
    expect(inferObjeto("Votação nominal do Projeto de Lei nº 2.253, de 2022, nos termos do parecer, ressalvados os destaques.")).toBe("texto-principal");
    expect(inferObjeto("Votação nominal da Proposta de Emenda à Constituição nº 45, de 2019, nos termos do Parecer, em segundo turno.")).toBe("texto-principal");
    expect(inferObjeto("Votação nominal da Emenda nº 2.171(Substitutivo) ao PLP 68/24 com Emendas e supressão, nos termos dos pareceres, ressalvados os destaques.")).toBe("substitutivo");
    expect(inferObjeto("Votação nominal da Emenda nº 5, de Plenário, ao PL 1, nos termos do parecer.")).toBe("emenda");
    expect(inferEtapa("PEC nº 25, de 2017 (2º turno)")).toBe("2º turno");
    expect(inferEtapa("Votação em primeiro turno")).toBe("1º turno");
    expect(inferEtapa("PL 1, turno único")).toBe("turno único");
    expect(inferEtapa("PL 1")).toBe("etapa não informada pelo acervo");
  });
});

describe("Câmara: o detalhe e a lista de votos viram o pacote de uma votação", () => {
  const opcoes = {
    idDeputado: "160561",
    pessoaId: "teste-pessoa",
    mandatoId: "teste-mandato",
    capturadoEm: "2026-10-10",
    capturaId: "camara-votos-2611313-31-2026-10-10-abc123",
    urlDetalhe: "https://dadosabertos.camara.leg.br/api/v2/votacoes/2611313-31",
    urlVotos: "https://dadosabertos.camara.leg.br/api/v2/votacoes/2611313-31/votos",
  };
  const pacote = normalizeCamaraVotacao(camaraDetalhe, camaraVotos, opcoes);

  it("cada registro passa pelo contrato, como rascunho", () => {
    expect(fonteSchema.safeParse(pacote.fontes[0]).success).toBe(true);
    expect(proposicaoSchema.safeParse(pacote.proposicoes[0]), JSON.stringify(pacote.proposicoes[0])).toMatchObject({ success: true });
    expect(votacaoSchema.safeParse(pacote.votacoes[0]), JSON.stringify(pacote.votacoes[0])).toMatchObject({ success: true });
    expect(votoSchema.safeParse(pacote.votos[0]), JSON.stringify(pacote.votos[0])).toMatchObject({ success: true });
  });

  it("a proposição vem de proposicoesAfetadas; a votação, do detalhe, com o órgão e o resultado original", () => {
    const [proposicao] = pacote.proposicoes as { id: string; identidadeExterna: { id: string }; tipo: string }[];
    expect(proposicao?.identidadeExterna.id).toBe(String(camaraDetalhe.proposicoesAfetadas![0]!.id));
    expect(proposicao?.tipo).toBe(camaraDetalhe.proposicoesAfetadas![0]!.siglaTipo);
    const [votacao] = pacote.votacoes as { id: string; orgao: { tipo: string }; data: { valor: string }; modalidade: string; resultadoOficial: { estado: string } }[];
    expect(votacao?.id).toBe("camara-votacao-2611313-31");
    expect(votacao?.orgao).toEqual({ tipo: "plenario" });
    expect(votacao?.data.valor).toBe("2026-09-03");
    expect(votacao?.modalidade).toBe("nominal");
    expect(votacao?.resultadoOficial.estado).toBe("aprovado");
  });

  it("o voto do deputado leva o valor original; sem a linha dele, nenhum voto é inventado", () => {
    const [voto] = pacote.votos as { id: string; registro: unknown }[];
    expect(voto?.id).toBe("camara-voto-2611313-31-160561");
    expect(voto?.registro).toEqual({ tipo: "voto-individual", posicao: "FAVOR", valorOriginal: "Sim" });
    const ausente = normalizeCamaraVotacao(camaraDetalhe, camaraVotos, { ...opcoes, idDeputado: "139289" });
    expect(ausente.votos).toEqual([]);
    expect(ausente.votacoes).toHaveLength(1);
  });

  it("sem lista de votos, a votação é importada como simbólica, com a pendência de conferir na ata", () => {
    const semVotos = normalizeCamaraVotacao(camaraDetalhe, [], opcoes);
    const [votacao] = semVotos.votacoes as { modalidade: string; editorial: { pendencias: string[] } }[];
    expect(votacao?.modalidade).toBe("simbolica");
    expect(votacao?.editorial.pendencias.some((linha) => linha.includes("lista de votos veio vazia"))).toBe(true);
    expect(semVotos.votos).toEqual([]);
  });

  it("os tipos de voto da Câmara viram registro, com 'Artigo 17' como não voto documentado", () => {
    const voto = (tipoVoto: string) => registroDoVotoCamara({ tipoVoto, deputado_: { id: 1 } });
    expect(voto("Não").registro).toEqual({ tipo: "voto-individual", posicao: "CONTRA", valorOriginal: "Não" });
    expect(voto("Obstrução").registro).toEqual({ tipo: "voto-individual", posicao: "OBSTRUCAO", valorOriginal: "Obstrução" });
    expect(voto("Artigo 17").registro).toMatchObject({ tipo: "nao-votou-documentado", valorOriginal: "Artigo 17" });
    expect(voto("Artigo 17").pendencias).toHaveLength(1);
    expect(voto("Branco").registro).toEqual({ tipo: "voto-individual", posicao: "OUTRO", valorOriginal: "Branco" });
  });

  it("juntar pacotes não repete fonte nem proposição, e a cobertura descreve a varredura", () => {
    const juntos = mergePacotes([pacote, normalizeCamaraVotacao(camaraDetalhe, camaraVotos, opcoes)]);
    expect(juntos.fontes).toHaveLength(1);
    expect(juntos.proposicoes).toHaveLength(1);
    expect(juntos.votacoes).toHaveLength(1);
    const cobertura = coberturaCamara({
      idDeputado: "139289",
      pessoaId: "lula",
      capturadoEm: "2026-10-10",
      periodo: { de: "1987-02-01", ate: "1991-01-31" },
      urlBase: "https://dadosabertos.camara.leg.br/api/v2/votacoes",
      votacoesVistas: 3,
      votacoesComVotos: 0,
      completa: true,
      lacunas: [],
    });
    expect(coberturaPoliticaSchema.safeParse(cobertura), JSON.stringify(cobertura)).toMatchObject({ success: true });
    expect((cobertura as { lacunas: string[] }).lacunas[0]).toContain("a partir de 2001");
    // Um ato do Executivo não sai de nenhum adaptador: é cadastro à mão, com a mensagem ou a lei lida.
    expect(atoExecutivoSchema.safeParse(cobertura).success).toBe(false);
  });
});

describe("capturas e requisições", () => {
  it("a captura guarda a URL, o instante, o status, os bytes e o resumo, com um identificador em kebab-case", () => {
    const captura = buildCaptura("senado", "Votação 5894", "https://x/y", 200, '{"a":1}', new Date("2026-10-10T12:00:00Z"));
    expect(captura.id).toMatch(/^senado-votacao-5894-2026-10-10-[0-9a-f]{6}$/);
    expect(captura.resposta).toEqual({ a: 1 });
    expect(captura.bytes).toBe(7);
    expect(captura.sha256).toHaveLength(64);
    expect(buildCaptura("camara", "x", "https://x", 200, "não é json", new Date()).resposta).toBe("não é json");
    expect(kebab("Ação — Teste/1")).toBe("acao-teste-1");
  });

  it("tenta de novo em 429 e 503, com a espera do Retry-After, e devolve o texto como chegou", async () => {
    const respostas: { status: number; body: string; headers: Record<string, string> }[] = [
      { status: 503, body: "fora", headers: {} },
      { status: 429, body: "calma", headers: { "retry-after": "2" } },
      { status: 200, body: '{"ok":true}', headers: {} },
    ];
    const esperas: number[] = [];
    const fetchImpl = (async () => {
      const proxima = respostas.shift()!;
      return new Response(proxima.body, { status: proxima.status, headers: proxima.headers });
    }) as typeof fetch;
    const resultado = await fetchTexto("https://exemplo/x", { fetchImpl, esperar: async (ms) => void esperas.push(ms), intervaloMs: 0 });
    expect(resultado.status).toBe(200);
    expect(resultado.texto).toBe('{"ok":true}');
    expect(resultado.tentativas).toBe(3);
    // 1 s depois do 503; 2 s (Retry-After) depois do 429.
    expect(esperas.filter((ms) => ms >= 1000)).toEqual([1000, 2000]);
  });

  it("não insiste além das tentativas e não repete 4xx que não é limite", async () => {
    let chamadas = 0;
    const fetchImpl = (async () => {
      chamadas += 1;
      return new Response("não", { status: 404 });
    }) as typeof fetch;
    const resultado = await fetchTexto("https://exemplo/x", { fetchImpl, esperar: async () => {}, intervaloMs: 0 });
    expect(resultado.status).toBe(404);
    expect(chamadas).toBe(1);
  });
});
