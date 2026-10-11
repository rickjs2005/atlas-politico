// A lista do que precisa de revisão humana: gerada dos dados publicados, para
// docs/HUMAN-REVIEW.md (`npm run review:human`). Toda a conferência do
// conteúdo foi assistida por IA; a política editorial condiciona a publicação
// à revisão por uma pessoa (docs/EDITORIAL.md). Este documento diz, trecho a
// trecho, o que conferir e contra qual documento.
//
// Função pura sobre `AtlasData`: nada aqui escreve texto novo sobre as
// pessoas; os trechos são os do conteúdo publicado, agrupados por tema e
// ordenados por prioridade: episódios judiciais, dados eleitorais,
// filiações, mandatos e os demais acontecimentos.

import { listDecisionViews, type DecisionView } from "@/lib/data/decisions";
import type { AtlasData } from "@/lib/data/types";
import { compareDates, formatDate, formatPeriod } from "@/lib/domain/dates";
import { INSTITUICAO_LABELS, OBJETO_LABELS, POSICAO_LABELS, REGISTRO_INDIVIDUAL_LABELS, TEMA_LABELS, TIPO_DE_ATO_LABELS } from "@/lib/domain/decisions";
import type { Acontecimento, Citacao, Editorial, Filiacao, Mandato } from "@/lib/domain/types";
import { JUDICIAL } from "@/lib/game/judicial";

type Tema = "judicial" | "eleitoral" | "filiacao" | "mandato" | "demais";

const DECISOES = {
  titulo: "Decisões políticas: votos e atos do Executivo",
  porque:
    "Cada decisão é uma amostra documentada, e não o histórico completo. Conferir, no voto: a votação (objeto votado, etapa, modalidade e resultado oficial) contra a ata ou o painel da sessão, e a manifestação registrada com o valor original do acervo. No ato do Executivo: o identificador, a data, o tipo (sanção, veto parcial com os dispositivos, decreto) contra a página oficial e a mensagem de veto. Um voto em requerimento ou em substitutivo não é voto no projeto inteiro, e a posição vale só para o objeto votado. Conferir também a cobertura declarada da pesquisa, com as lacunas, e a classificação de temas, que é decisão editorial.",
};

const TEMAS: Record<Tema, { titulo: string; porque: string }> = {
  judicial: {
    titulo: "Episódios judiciais",
    porque:
      "Denúncia, decisão liminar, condenação, confirmação, prisão, soltura, anulação e rejeição são coisas diferentes, cada uma com data, autor e efeito. Conferir, em cada registro: quem alegou, o que a defesa disse, quem decidiu, quando, com que placar ou pena, e o desfecho na data de corte. Nenhum registro pode sugerir culpa ou inocência além do que o documento diz.",
  },
  eleitoral: {
    titulo: "Dados eleitorais",
    porque:
      "Votos, percentuais, turnos, coligações e candidatos a vice. O registro do primeiro turno de 2026 traz a apuração parcial divulgada pelo TSE, com 99,99% das urnas, e não a totalização final: trocar os números é uma atualização de conteúdo, com nova entrada na edição e documento oficial lido, e não uma correção silenciosa.",
  },
  filiacao: {
    titulo: "Filiações partidárias",
    porque:
      "Datas de filiação e de saída e o partido de origem vêm de dados abertos e de notícias; onde o registro diz que uma informação foi inferida ou que duas fontes divergem, conferir as duas e decidir o que fica escrito.",
  },
  mandato: {
    titulo: "Mandatos e funções",
    porque: "Cargo, instituição e período, inclusive os em curso na data de corte.",
  },
  demais: {
    titulo: "Demais acontecimentos",
    porque: "Datas na precisão documentada, lugares e o que cada citação sustenta.",
  },
};

function temaOf(acontecimento: Acontecimento): Tema {
  if (acontecimento.id in JUDICIAL) return "judicial";
  if (acontecimento.categoria === "eleicoes") return "eleitoral";
  if (acontecimento.categoria === "partidos-e-aliancas") return "filiacao";
  if (acontecimento.categoria === "mandatos-e-funcoes") return "mandato";
  return "demais";
}

function reviewLine(editorial: Editorial): string {
  if (editorial.estado !== "revisado") return `estado: ${editorial.estado}${editorial.pendencias && editorial.pendencias.length > 0 ? `; pendências: ${editorial.pendencias.join("; ")}` : ""}`;
  const { tipo, revisadoPor, revisadoEm, observacoes } = editorial.revisao;
  return `conferência ${tipo === "humana" ? "humana" : "assistida por IA"}, por ${revisadoPor}, em ${revisadoEm}${observacoes ? `; observações: ${observacoes}` : ""}`;
}

function sourceLines(data: AtlasData, fontes: readonly Citacao[]): string[] {
  return fontes.map((citacao) => {
    const fonte = data.conjunto.fontes.find((item) => item.id === citacao.fonteId);
    if (fonte === undefined) return `  - \`${citacao.fonteId}\` (fonte não encontrada no conjunto)`;
    return `  - [${fonte.titulo}](${fonte.url}), ${fonte.autoria}. Onde olhar: ${citacao.localizacao}. Sustenta: ${citacao.evidencia}`;
  });
}

function nomeDe(data: AtlasData, pessoaIds: readonly string[]): string {
  return pessoaIds.map((id) => data.conjunto.pessoas.find((pessoa) => pessoa.id === id)?.nome ?? id).join(" e ");
}

function eventBlock(data: AtlasData, acontecimento: Acontecimento): string[] {
  const linhas = [`### ${formatDate(acontecimento.data)}: ${acontecimento.titulo}`, ""];
  linhas.push(`- Identificador: \`${acontecimento.id}\` · Pessoa: ${nomeDe(data, acontecimento.pessoaIds)} · Revisão: ${reviewLine(acontecimento.editorial)}`);
  linhas.push(`- **Resumo a conferir:** ${acontecimento.resumo}`);
  if (acontecimento.contexto.length > 0) linhas.push(`- **Contexto a conferir:** ${acontecimento.contexto}`);
  linhas.push("- Fontes:");
  linhas.push(...sourceLines(data, acontecimento.fontes));
  linhas.push("- [ ] Conferido por: ______ em ____/____/______");
  linhas.push("");
  return linhas;
}

function filiacaoBlock(data: AtlasData, filiacao: Filiacao): string[] {
  const linhas = [`### ${nomeDe(data, [filiacao.pessoaId])}: ${filiacao.partido.sigla} (${filiacao.partido.nome}), ${formatPeriod(filiacao.periodo)}`, ""];
  linhas.push(`- Identificador: \`${filiacao.id}\` · Revisão: ${reviewLine(filiacao.editorial)}`);
  linhas.push("- Fontes:");
  linhas.push(...sourceLines(data, filiacao.fontes));
  linhas.push("- [ ] Conferido por: ______ em ____/____/______");
  linhas.push("");
  return linhas;
}

function mandatoBlock(data: AtlasData, mandato: Mandato): string[] {
  const linhas = [`### ${nomeDe(data, [mandato.pessoaId])}: ${mandato.cargo}, ${mandato.instituicao}, ${formatPeriod(mandato.periodo)}`, ""];
  linhas.push(`- Identificador: \`${mandato.id}\` · Revisão: ${reviewLine(mandato.editorial)}`);
  linhas.push("- Fontes:");
  linhas.push(...sourceLines(data, mandato.fontes));
  linhas.push("- [ ] Conferido por: ______ em ____/____/______");
  linhas.push("");
  return linhas;
}

/** O bloco de uma decisão: o que o cartão mostra, com cada fonte, e a votação ou a proposição que ela cita. */
function decisionBlock(data: AtlasData, decisao: DecisionView): string[] {
  const linhas = [`### ${formatDate(decisao.data)}: ${decisao.titulo}`, ""];
  const pessoa = nomeDe(data, [decisao.pessoaId]);
  linhas.push(`- Identificador: \`${decisao.id}\` · Pessoa: ${pessoa} · ${decisao.natureza === "voto" ? "Voto parlamentar" : "Ato do Executivo"} · ${INSTITUICAO_LABELS[decisao.instituicao]} · Temas: ${decisao.temas.map((tema) => TEMA_LABELS[tema]).join(", ") || "nenhum"} · Revisão: ${reviewLine(decisao.editorial)}`);
  linhas.push(`- **Cargo a conferir:** ${decisao.cargo === null ? "mandato não publicado" : `${decisao.cargo.cargo}, ${decisao.cargo.instituicao} (\`${decisao.cargo.mandatoId}\`)`}`);
  if (decisao.natureza === "voto") {
    const { votacao, registro } = decisao;
    linhas.push(`- **Votação a conferir** (\`${votacao.id}\`): ${OBJETO_LABELS[votacao.objeto.tipo]}${votacao.objeto.identificacao === null ? "" : ` (${votacao.objeto.identificacao})`}; ${votacao.objeto.descricao}; etapa: ${votacao.etapa}; ${votacao.orgao}, ${votacao.modalidade}; resultado oficial: ${votacao.resultado.estado} (valor original "${votacao.resultado.valorOriginal}").`);
    const manifestacao = registro.tipo === "voto-individual" ? `${POSICAO_LABELS[registro.posicao]} (valor original "${registro.valorOriginal}")` : `${REGISTRO_INDIVIDUAL_LABELS[registro.tipo]} (valor original "${registro.valorOriginal}"${registro.motivoDocumentado === undefined ? "" : `; motivo: ${registro.motivoDocumentado}`})`;
    linhas.push(`- **Manifestação a conferir:** ${manifestacao}`);
  } else {
    linhas.push(`- **Ato a conferir:** ${TIPO_DE_ATO_LABELS[decisao.ato.tipo]}; ${decisao.ato.identificador}${decisao.ato.detalhes.map((detalhe) => `; ${detalhe.rotulo}: ${detalhe.valor}`).join("")}`);
  }
  for (const proposicao of decisao.proposicoes) linhas.push(`- **Proposição a conferir** (\`${proposicao.id}\`): ${proposicao.identificacao}, ${INSTITUICAO_LABELS[proposicao.instituicao]}: ${proposicao.ementa}`);
  linhas.push("- Fontes:");
  linhas.push(...decisao.fontes.map((fonte) => `  - [${fonte.titulo}](${fonte.url}), ${fonte.autoria}. Onde olhar: ${fonte.localizacao}. Sustenta: ${fonte.evidencia}`));
  if (decisao.natureza === "ato" && decisao.ato.oficial !== null) linhas.push(`  - Documento oficial do ato: [${decisao.ato.oficial.titulo}](${decisao.ato.oficial.url})`);
  if (decisao.natureza === "voto" && decisao.votacao.textoReferencia !== null) linhas.push(`  - Texto de referência: [${decisao.votacao.textoReferencia.titulo}](${decisao.votacao.textoReferencia.url}), ${decisao.votacao.textoReferencia.localizacao}`);
  linhas.push("- [ ] Conferido por: ______ em ____/____/______");
  linhas.push("");
  return linhas;
}

/** Os registros de apoio das decisões: proposições sem decisão própria, cobertura da pesquisa e identidades institucionais. */
function supportBlocks(data: AtlasData): string[] {
  const { conjunto } = data;
  const linhas: string[] = [];
  for (const cobertura of conjunto.coberturaPolitica) {
    linhas.push(`### Cobertura da pesquisa: ${nomeDe(data, [cobertura.pessoaId])}, ${cobertura.tema === "geral" ? "todos os temas" : TEMA_LABELS[cobertura.tema]}, ${formatPeriod(cobertura.periodo)}`, "");
    linhas.push(`- Identificador: \`${cobertura.id}\` · Estado: ${cobertura.estado} · Revisão: ${reviewLine(cobertura.editorial)}`);
    linhas.push(`- **Critérios a conferir:** ${cobertura.criterios}`);
    for (const acervo of cobertura.acervos) linhas.push(`- Acervo: [${acervo.nome}](${acervo.url}), consultado em ${acervo.consultadoEm}; recorte: ${acervo.recorte}; ${acervo.completa ? "consulta completa" : "consulta incompleta"}.`);
    for (const lacuna of cobertura.lacunas) linhas.push(`- Lacuna declarada: ${lacuna}`);
    if (cobertura.fontes.length > 0) linhas.push("- Fontes:", ...sourceLines(data, cobertura.fontes));
    linhas.push("- [ ] Conferido por: ______ em ____/____/______", "");
  }
  for (const identidade of conjunto.identidadesInstitucionais) {
    linhas.push(`### Identidade institucional: ${nomeDe(data, [identidade.pessoaId])} em ${INSTITUICAO_LABELS[identidade.instituicao]}`, "");
    linhas.push(`- Identificador: \`${identidade.id}\` · Provedor: ${identidade.provedor} · Identificador externo: ${identidade.idExterno} · Revisão: ${reviewLine(identidade.editorial)}`);
    linhas.push("- Fontes:", ...sourceLines(data, identidade.fontes));
    linhas.push("- [ ] Conferido por: ______ em ____/____/______", "");
  }
  return linhas;
}

/** O documento inteiro, em Markdown. Determinístico. */
export function renderHumanReview(data: AtlasData): string {
  const { conjunto } = data;
  const acontecimentos = [...conjunto.acontecimentos].sort((a, b) => compareDates(a.data, b.data));
  const porTema = new Map<Tema, Acontecimento[]>();
  for (const acontecimento of acontecimentos) {
    const tema = temaOf(acontecimento);
    porTema.set(tema, [...(porTema.get(tema) ?? []), acontecimento]);
  }
  const decisoes = conjunto.pessoas.flatMap((pessoa) => listDecisionViews(data, pessoa.id)).sort((a, b) => compareDates(a.data, b.data) || (a.id < b.id ? -1 : 1));
  const humanas = [
    ...conjunto.acontecimentos.map((item) => item.editorial),
    ...conjunto.filiacoes.map((item) => item.editorial),
    ...conjunto.mandatos.map((item) => item.editorial),
    ...conjunto.pessoas.map((item) => item.editorial),
    ...conjunto.proposicoes.map((item) => item.editorial),
    ...conjunto.votacoes.map((item) => item.editorial),
    ...conjunto.votos.map((item) => item.editorial),
    ...conjunto.atosExecutivos.map((item) => item.editorial),
    ...conjunto.coberturaPolitica.map((item) => item.editorial),
    ...conjunto.identidadesInstitucionais.map((item) => item.editorial),
  ].filter((editorial) => editorial.estado === "revisado" && editorial.revisao.tipo === "humana").length;
  const edicao = conjunto.edicao === null ? "sem edição declarada" : `edição ${conjunto.edicao.versao}, data de corte ${conjunto.edicao.dataDeCorte}`;

  const linhas: string[] = [];
  linhas.push("# Revisão humana: o que conferir, trecho a trecho");
  linhas.push("");
  linhas.push(
    `Gerado por \`npm run review:human\` a partir dos dados publicados (${edicao}). Não edite à mão: o teste \`tests/human-review.test.ts\` confere que este arquivo está em dia. A conferência registrada no conteúdo é toda assistida por IA (${humanas} registros com revisão humana); a política editorial ([EDITORIAL.md](EDITORIAL.md)) condiciona a publicação à revisão por uma pessoa, e a lista abaixo é o roteiro dela.`,
  );
  linhas.push("");
  linhas.push("## Como usar");
  linhas.push("");
  linhas.push("1. Para cada item, abra as fontes listadas e leia o trecho indicado em **Onde olhar**. Confira o resumo e o contexto palavra a palavra: datas, números, nomes, cargos, placares, penas e o que cada citação diz sustentar.");
  linhas.push("2. O que estiver errado ou sem apoio no documento vira correção de conteúdo pelo pipeline ([DATA-PIPELINE.md](DATA-PIPELINE.md)): nova entrada em `alteracoes` da edição, com a descrição. Nunca edite `generated/` à mão.");
  linhas.push("3. Só depois da leitura real, a pessoa que conferiu registra a revisão como humana no conteúdo (`revisao.tipo: \"humana\"`, com nome e data). O código e os scripts nunca fazem isso sozinhos.");
  linhas.push("4. Marque a caixa de cada item com o nome e a data. O arquivo gerado é regravado pelo comando; guarde as marcações em cópia própria ou no controle de versão da edição.");
  linhas.push("");
  linhas.push(
    `Resumo: ${conjunto.acontecimentos.length} acontecimentos (${porTema.get("judicial")?.length ?? 0} judiciais, ${porTema.get("eleitoral")?.length ?? 0} eleitorais, ${porTema.get("filiacao")?.length ?? 0} de partidos, ${porTema.get("mandato")?.length ?? 0} de mandatos e funções, ${porTema.get("demais")?.length ?? 0} demais), ${conjunto.filiacoes.length} filiações, ${conjunto.mandatos.length} mandatos, ${decisoes.length} decisões políticas (${conjunto.votos.length} votos e ${conjunto.atosExecutivos.length} atos do Executivo, sobre ${conjunto.proposicoes.length} proposições), ${conjunto.coberturaPolitica.length} declarações de cobertura da pesquisa, ${conjunto.identidadesInstitucionais.length} identidades institucionais, ${conjunto.fontes.length} fontes.`,
  );
  linhas.push("");

  let numero = 1;
  for (const tema of ["judicial", "eleitoral", "filiacao", "mandato", "demais"] as Tema[]) {
    const itens = porTema.get(tema) ?? [];
    linhas.push(`## ${numero}. ${TEMAS[tema].titulo} (${itens.length} acontecimentos${tema === "filiacao" ? ` e ${conjunto.filiacoes.length} filiações` : tema === "mandato" ? ` e ${conjunto.mandatos.length} mandatos` : ""})`);
    linhas.push("");
    linhas.push(TEMAS[tema].porque);
    linhas.push("");
    for (const acontecimento of itens) linhas.push(...eventBlock(data, acontecimento));
    if (tema === "filiacao") for (const filiacao of conjunto.filiacoes) linhas.push(...filiacaoBlock(data, filiacao));
    if (tema === "mandato") for (const mandato of conjunto.mandatos) linhas.push(...mandatoBlock(data, mandato));
    numero += 1;
  }
  if (decisoes.length > 0 || conjunto.coberturaPolitica.length > 0 || conjunto.identidadesInstitucionais.length > 0) {
    linhas.push(`## ${numero}. ${DECISOES.titulo} (${decisoes.length} decisões, ${conjunto.coberturaPolitica.length} coberturas da pesquisa e ${conjunto.identidadesInstitucionais.length} identidades institucionais)`);
    linhas.push("");
    linhas.push(DECISOES.porque);
    linhas.push("");
    for (const decisao of decisoes) linhas.push(...decisionBlock(data, decisao));
    linhas.push(...supportBlocks(data));
  }
  return linhas.join("\n");
}
