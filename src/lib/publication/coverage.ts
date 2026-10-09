// Relatório de cobertura: quanto do conteúdo é elegível, quanto ainda é
// rascunho, quantos pontos vão para o mapa e o que está pendente. Calculado a
// partir da validação, para existir mesmo quando há erro e a publicação está
// bloqueada. Não tem horário: a mesma entrada gera o mesmo relatório.

import { buildEventPoints } from "@/lib/data/points";
import { CATEGORIAS, CATEGORY_LABELS, type Categoria } from "@/lib/domain/categories";
import { formatDate, yearOf, type Precisao } from "@/lib/domain/dates";
import { GEO_PRECISION_LABELS } from "@/lib/domain/geo";
import { compareByDate, compareText } from "@/lib/domain/order";

import { MOTIVOS_DE_EXCLUSAO, type BuildResult, type Excluded } from "./build";
import { countBySeverity, formatDiagnostic, type Diagnostic, type Severidade } from "./diagnostics";
import { COLECOES_FACTUAIS, ENTIDADE_DA_COLECAO } from "./sources";

/** Anos seguidos sem acontecimento para a lacuna entrar no relatório. */
export const MIN_GAP_YEARS = 4;

/** Um item do registro de trechos conferidos (docs/evidencias). */
export interface EvidenceEntry {
  registro: string;
  fonteId: string;
}

export interface PersonCoverage {
  id: string;
  nome: string;
  elegiveis: number;
  rascunhos: number;
  mandatos: number;
  filiacoes: number;
  pontos: number;
  localizacao: { lugares: number; nacional: number; desconhecida: number };
  precisao: Record<Precisao, number>;
  porCategoria: Record<Categoria, number>;
  porDecada: Record<string, number>;
  primeiroAno: number | null;
  ultimoAno: number | null;
  /** Texto do período que a edição declara cobrir, ou `null` se não declara. */
  cobertura: string | null;
  lacunas: { de: number; ate: number }[];
}

export interface PlaceCoverage {
  id: string;
  nome: string;
  precisao: string;
  acontecimentos: number;
}

export interface CoverageReport {
  edicao: { versao: string; dataDeCorte: string; revisao: string } | null;
  bloqueado: boolean;
  diagnosticos: Record<Severidade, Diagnostic[]>;
  totais: {
    acontecimentos: number;
    compartilhados: number;
    foraDaPublicacao: number;
    mandatos: number;
    filiacoes: number;
    pontos: number;
    acontecimentosComPonto: number;
    lugares: number;
    fontes: number;
    imagens: number;
  };
  pessoas: PersonCoverage[];
  decadas: string[];
  lugares: PlaceCoverage[];
  excluidos: Excluded[];
  /** Citações de registros elegíveis com e sem trecho conferido registrado. */
  evidencias: { comTrecho: number; semTrecho: { registro: string; fonteId: string }[] } | null;
}

function describeLimit(limite: { tipo: string; valor?: string; precisao?: Precisao }): string {
  if (limite.tipo === "data" && limite.valor !== undefined && limite.precisao !== undefined) {
    return formatDate({ valor: limite.valor, precisao: limite.precisao });
  }
  return limite.tipo === "em-curso" ? "data de corte" : "data não documentada";
}

export function buildCoverageReport(
  resultado: BuildResult,
  evidencias: readonly EvidenceEntry[] | null = null,
): CoverageReport {
  const { validacao, diagnostics } = resultado;
  const { registros, candidatos, edicao } = validacao;

  const elegiveis = <T extends { id: string }>(lista: readonly { dados: T }[], ids: Set<string>): T[] =>
    lista.filter(({ dados }) => ids.has(dados.id)).map(({ dados }) => dados);

  const pessoas = elegiveis(registros.pessoas, candidatos.pessoas).sort((a, b) =>
    compareText(a.id, b.id),
  );
  const mandatos = elegiveis(registros.mandatos, candidatos.mandatos);
  const filiacoes = elegiveis(registros.filiacoes, candidatos.filiacoes);
  const acontecimentos = elegiveis(registros.acontecimentos, candidatos.acontecimentos).sort(
    compareByDate,
  );
  const fora = registros.acontecimentos
    .filter(({ dados }) => !candidatos.acontecimentos.has(dados.id))
    .map(({ dados }) => dados);

  const lugaresPublicados = registros.lugares
    .filter(({ pasta }) => pasta === "published")
    .map(({ dados }) => dados);
  const pontos = buildEventPoints(acontecimentos, lugaresPublicados).features;
  const anoDeCorte = edicao === null ? null : Number(edicao.dataDeCorte.slice(0, 4));

  const porPessoa = pessoas.map((pessoa): PersonCoverage => {
    const seus = acontecimentos.filter((item) => item.pessoaIds.includes(pessoa.id));
    const anos = seus.map((item) => yearOf(item.data));
    const cobertura = edicao?.cobertura.find((item) => item.pessoaId === pessoa.id) ?? null;

    const porCategoria = Object.fromEntries(
      CATEGORIAS.map((categoria) => [
        categoria,
        seus.filter((item) => item.categoria === categoria).length,
      ]),
    ) as Record<Categoria, number>;

    const porDecada: Record<string, number> = {};
    for (const ano of anos) {
      const decada = String(Math.floor(ano / 10) * 10);
      porDecada[decada] = (porDecada[decada] ?? 0) + 1;
    }

    // Lacunas: do início da cobertura (ou do primeiro registro) até a data de corte.
    const inicio =
      cobertura?.periodo.inicio.tipo === "data"
        ? yearOf(cobertura.periodo.inicio)
        : (anos[0] ?? null);
    const marcos = [...new Set(anos)].sort((a, b) => a - b);
    const lacunas: PersonCoverage["lacunas"] = [];
    if (inicio !== null && anoDeCorte !== null) {
      let anterior = inicio - 1;
      for (const marco of [...marcos, anoDeCorte + 1]) {
        if (marco - anterior - 1 >= MIN_GAP_YEARS) lacunas.push({ de: anterior + 1, ate: marco - 1 });
        anterior = Math.max(anterior, marco);
      }
    }

    return {
      id: pessoa.id,
      nome: pessoa.nome,
      elegiveis: seus.length,
      rascunhos: fora.filter((item) => item.pessoaIds.includes(pessoa.id)).length,
      mandatos: mandatos.filter((item) => item.pessoaId === pessoa.id).length,
      filiacoes: filiacoes.filter((item) => item.pessoaId === pessoa.id).length,
      pontos: pontos.filter((ponto) => ponto.properties.pessoaIds.includes(pessoa.id)).length,
      localizacao: {
        lugares: seus.filter((item) => item.localizacao.tipo === "lugares").length,
        nacional: seus.filter((item) => item.localizacao.tipo === "nacional").length,
        desconhecida: seus.filter((item) => item.localizacao.tipo === "desconhecida").length,
      },
      precisao: {
        dia: seus.filter((item) => item.data.precisao === "dia").length,
        mes: seus.filter((item) => item.data.precisao === "mes").length,
        ano: seus.filter((item) => item.data.precisao === "ano").length,
      },
      porCategoria,
      porDecada,
      primeiroAno: anos.length > 0 ? Math.min(...anos) : null,
      ultimoAno: anos.length > 0 ? Math.max(...anos) : null,
      cobertura:
        cobertura === null
          ? null
          : `${describeLimit(cobertura.periodo.inicio)} a ${describeLimit(cobertura.periodo.fim)}`,
      lacunas,
    };
  });

  const lugaresComPonto = lugaresPublicados
    .map((lugar) => ({
      id: lugar.id,
      nome: lugar.nome,
      precisao: GEO_PRECISION_LABELS[lugar.precisaoGeografica],
      acontecimentos: pontos.filter((ponto) => ponto.properties.placeId === lugar.id).length,
    }))
    .filter((lugar) => lugar.acontecimentos > 0)
    .sort((a, b) => b.acontecimentos - a.acontecimentos || compareText(a.id, b.id));

  const usados = (colecao: "lugares" | "fontes" | "imagens") =>
    registros[colecao].filter(
      ({ dados, pasta }) =>
        pasta === "published" &&
        !resultado.excluidos.some(
          (item) => item.entidade === ENTIDADE_DA_COLECAO[colecao] && item.id === dados.id,
        ),
    ).length;

  let conferencia: CoverageReport["evidencias"] = null;
  if (evidencias !== null) {
    const registrados = new Set(evidencias.map((item) => `${item.registro}|${item.fonteId}`));
    const semTrecho: { registro: string; fonteId: string }[] = [];
    let comTrecho = 0;
    for (const colecao of COLECOES_FACTUAIS) {
      const entidade = ENTIDADE_DA_COLECAO[colecao];
      for (const { dados } of registros[colecao]) {
        if (!candidatos[colecao].has(dados.id)) continue;
        for (const citacao of dados.fontes) {
          const registro = `${entidade}:${dados.id}`;
          if (registrados.has(`${registro}|${citacao.fonteId}`)) comTrecho += 1;
          else semTrecho.push({ registro, fonteId: citacao.fonteId });
        }
      }
    }
    conferencia = { comTrecho, semTrecho };
  }

  const bySeverity = (severidade: Severidade) =>
    diagnostics.filter((diagnostico) => diagnostico.severidade === severidade);

  return {
    edicao:
      edicao === null
        ? null
        : {
            versao: edicao.versao,
            dataDeCorte: edicao.dataDeCorte,
            revisao: `${edicao.revisao.tipo} em ${edicao.revisao.revisadoEm}`,
          },
    bloqueado: !resultado.ok,
    diagnosticos: { erro: bySeverity("erro"), pendencia: bySeverity("pendencia"), aviso: bySeverity("aviso") },
    totais: {
      acontecimentos: acontecimentos.length,
      compartilhados: acontecimentos.filter((item) => item.pessoaIds.length > 1).length,
      foraDaPublicacao: fora.length,
      mandatos: mandatos.length,
      filiacoes: filiacoes.length,
      pontos: pontos.length,
      acontecimentosComPonto: new Set(pontos.map((ponto) => ponto.properties.eventId)).size,
      lugares: usados("lugares"),
      fontes: usados("fontes"),
      imagens: usados("imagens"),
    },
    pessoas: porPessoa,
    decadas: [...new Set(porPessoa.flatMap((pessoa) => Object.keys(pessoa.porDecada)))].sort(),
    lugares: lugaresComPonto,
    excluidos: resultado.ok
      ? resultado.excluidos
      : [],
    evidencias: conferencia,
  };
}

// ---------------------------------------------------------------------------
// Apresentação em Markdown
// ---------------------------------------------------------------------------

function row(celulas: readonly (string | number)[]): string {
  return `| ${celulas.join(" | ")} |`;
}

function table(cabecalho: readonly string[], linhas: readonly (string | number)[][]): string[] {
  return [row(cabecalho), row(cabecalho.map(() => "---")), ...linhas.map(row), ""];
}

export function renderCoverageMarkdown(relatorio: CoverageReport): string {
  const { edicao, totais, pessoas, diagnosticos } = relatorio;
  const nomes = pessoas.map((pessoa) => pessoa.nome);
  const total = countBySeverity([
    ...diagnosticos.erro,
    ...diagnosticos.pendencia,
    ...diagnosticos.aviso,
  ]);
  const out: string[] = [];

  out.push("# Relatório de dados", "");
  out.push(
    edicao === null
      ? "Nenhuma edição publicada."
      : `Edição ${edicao.versao} · data de corte ${edicao.dataDeCorte} · revisão ${edicao.revisao}`,
    "",
  );

  out.push("## Situação", "");
  out.push(
    relatorio.bloqueado
      ? `**Publicação bloqueada: ${total.erro} erro(s).** Os números abaixo contam os registros revisados como estão no conteúdo; nada foi gerado.`
      : "Sem erros: o conjunto pode ser gerado.",
    "",
  );
  out.push(
    ...table(
      ["Erros", "Pendências", "Avisos"],
      [[total.erro, total.pendencia, total.aviso]],
    ),
  );

  out.push("## Totais", "");
  out.push(
    ...table(
      ["Item", "Quantidade"],
      [
        ["Acontecimentos elegíveis", totais.acontecimentos],
        ["Acontecimentos ligados a mais de uma pessoa", totais.compartilhados],
        ["Acontecimentos fora da publicação (rascunhos)", totais.foraDaPublicacao],
        ["Mandatos e funções elegíveis", totais.mandatos],
        ["Filiações elegíveis", totais.filiacoes],
        ["Pontos geográficos", totais.pontos],
        ["Acontecimentos com ao menos um ponto", totais.acontecimentosComPonto],
        ["Lugares nos dados públicos", totais.lugares],
        ["Fontes nos dados públicos", totais.fontes],
        ["Imagens nos dados públicos", totais.imagens],
      ],
    ),
  );

  out.push("## Por pessoa", "");
  out.push(
    ...table(
      [
        "Pessoa",
        "Elegíveis",
        "Rascunhos",
        "Mandatos e funções",
        "Filiações",
        "Pontos no mapa",
        "Primeiro ano",
        "Último ano",
      ],
      pessoas.map((pessoa) => [
        pessoa.nome,
        pessoa.elegiveis,
        pessoa.rascunhos,
        pessoa.mandatos,
        pessoa.filiacoes,
        pessoa.pontos,
        pessoa.primeiroAno ?? "sem registro",
        pessoa.ultimoAno ?? "sem registro",
      ]),
    ),
  );
  if (totais.compartilhados > 0) {
    out.push(
      `Um acontecimento ligado a duas pessoas conta para as duas. Por isso a soma das linhas (${pessoas.reduce((soma, pessoa) => soma + pessoa.elegiveis, 0)}) passa do total de acontecimentos (${totais.acontecimentos}).`,
      "",
    );
  }

  out.push("## Por período", "");
  out.push(
    ...table(
      ["Década", ...nomes],
      relatorio.decadas.map((decada) => [
        decada,
        ...pessoas.map((pessoa) => pessoa.porDecada[decada] ?? 0),
      ]),
    ),
  );
  out.push(`Períodos de ${MIN_GAP_YEARS} anos ou mais sem acontecimentos, dentro da cobertura declarada:`, "");
  for (const pessoa of pessoas) {
    const lacunas = pessoa.lacunas.map(
      ({ de, ate }) => `${de} a ${ate} (${ate - de + 1} anos)`,
    );
    out.push(
      `- **${pessoa.nome}** (cobertura: ${pessoa.cobertura ?? "não declarada"}): ${lacunas.length > 0 ? lacunas.join("; ") : "nenhum"}.`,
    );
  }
  out.push(
    "",
    "Um período sem acontecimentos é falta de registro no atlas, e não falta de atividade.",
    "",
  );

  out.push("## Por categoria", "");
  out.push(
    ...table(
      ["Categoria", ...nomes],
      CATEGORIAS.map((categoria) => [
        CATEGORY_LABELS[categoria],
        ...pessoas.map((pessoa) => pessoa.porCategoria[categoria]),
      ]),
    ),
  );

  out.push("## Lugares e precisão", "");
  out.push(
    ...table(
      [
        "Pessoa",
        "Com lugar",
        "Abrangência nacional",
        "Lugar não documentado",
        "Pontos no mapa",
        "Data com dia",
        "Com mês",
        "Só o ano",
      ],
      pessoas.map((pessoa) => [
        pessoa.nome,
        pessoa.localizacao.lugares,
        pessoa.localizacao.nacional,
        pessoa.localizacao.desconhecida,
        pessoa.pontos,
        pessoa.precisao.dia,
        pessoa.precisao.mes,
        pessoa.precisao.ano,
      ]),
    ),
  );
  if (relatorio.lugares.length > 0) {
    out.push(
      ...table(
        ["Lugar", "Precisão da coordenada", "Pontos"],
        relatorio.lugares.map((lugar) => [lugar.nome, lugar.precisao, lugar.acontecimentos]),
      ),
    );
  }

  out.push("## Fora da publicação", "");
  if (relatorio.bloqueado) {
    out.push("Não calculado: há erros. Veja a lista de pendências abaixo.", "");
  } else if (relatorio.excluidos.length === 0) {
    out.push("Nenhum registro.", "");
  } else {
    for (const item of relatorio.excluidos) {
      const pendencias = item.pendencias.length > 0 ? ` Pendências: ${item.pendencias.join(" ")}` : "";
      out.push(
        `- ${item.entidade} \`${item.id}\` (${item.arquivo}): ${MOTIVOS_DE_EXCLUSAO[item.motivo]}.${pendencias}`,
      );
    }
    out.push("");
  }

  if (relatorio.evidencias !== null) {
    const { comTrecho, semTrecho } = relatorio.evidencias;
    out.push("## Trechos conferidos", "");
    out.push(
      `Das ${comTrecho + semTrecho.length} citações de registros elegíveis, ${comTrecho} têm trecho literal registrado em docs/evidencias e ${semTrecho.length} não têm.`,
      "",
    );
    for (const item of semTrecho) out.push(`- \`${item.registro}\`, fonte \`${item.fonteId}\``);
    if (semTrecho.length > 0) out.push("");
  }

  // Sem erro, o estado de cada registro fora da publicação já está na seção
  // acima; aqui ficam só as outras pendências, como referência não resolvida.
  const deEstado = new Set<Diagnostic["codigo"]>(["rascunho", "nao-revisado", "revisado-em-rascunhos"]);
  const pendencias = relatorio.bloqueado
    ? diagnosticos.pendencia
    : diagnosticos.pendencia.filter((item) => !deEstado.has(item.codigo));

  const secoes: [string, Diagnostic[], string][] = [
    ["Erros", diagnosticos.erro, "Nenhum."],
    [
      "Outras pendências",
      pendencias,
      relatorio.bloqueado ? "Nenhuma." : "Nenhuma além das listadas em \"Fora da publicação\".",
    ],
    ["Avisos", diagnosticos.aviso, "Nenhum."],
  ];
  for (const [titulo, lista, vazio] of secoes) {
    out.push(`## ${titulo}`, "");
    if (lista.length === 0) out.push(vazio);
    for (const diagnostico of lista) out.push(`- ${formatDiagnostic(diagnostico)}`);
    out.push("");
  }

  out.push(
    "---",
    "",
    "Gerado por `npm run data:report` a partir do conteúdo. Não edite este texto: rode o comando de novo.",
  );

  return `${out.join("\n").trimEnd()}\n`;
}
