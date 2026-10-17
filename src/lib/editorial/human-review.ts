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

import { listDecisionViews, proposicaoLabel, type DecisionView } from "@/lib/data/decisions";
import type { AtlasData } from "@/lib/data/types";
import { compareDates, formatDate, formatPeriod } from "@/lib/domain/dates";
import { DESFECHO_DE_ATUACAO_LABELS, INSTITUICAO_LABELS, OBJETO_LABELS, POSICAO_LABELS, REGISTRO_INDIVIDUAL_LABELS, TEMA_LABELS, TIPO_DE_ATO_LABELS, TIPO_DE_ATUACAO_LABELS } from "@/lib/domain/decisions";
import { TIPO_DE_FATO_LABELS, countWords } from "@/lib/domain/game";
import type { Acontecimento, Citacao, Conceito, Editorial, FaseDoJogo, FatoBiografico, Filiacao, Mandato, PropostaEleitoral, ReferenciaDeFase } from "@/lib/domain/types";
import { JUDICIAL } from "@/lib/game/judicial";

type Tema = "judicial" | "eleitoral" | "filiacao" | "mandato" | "demais";

const DECISOES = {
  titulo: "Decisões políticas: votos, atos do Executivo e atuação legislativa",
  porque:
    "Cada decisão é uma amostra documentada, e não o histórico completo. Conferir, no voto: a votação (objeto votado, etapa, modalidade e resultado oficial) contra a ata ou o painel da sessão, e a manifestação registrada com o valor original do acervo. No ato do Executivo: o identificador, a data, o tipo (sanção, veto parcial com os dispositivos, decreto) contra a página oficial e a mensagem de veto. Na atuação legislativa: a autoria ou a relatoria contra a página da lei ou da matéria, a ementa, quem mais assina e o destino documentado (lei sancionada, lei promulgada pelo Legislativo, norma gerada). Um voto em requerimento ou em substitutivo não é voto no projeto inteiro, e a posição vale só para o objeto votado; propor ou relatar uma matéria não diz como a pessoa votou nela. Conferir também a cobertura declarada da pesquisa, com as lacunas, e a classificação de temas, que é decisão editorial.",
};

const PROPOSTAS = {
  titulo: "Propostas eleitorais registradas no TSE",
  porque:
    "Cada texto resume um trecho do documento que a candidatura registrou no Tribunal Superior Eleitoral. Proposta é o que o documento diz que pretende fazer: não é ato, não é voto e não é resultado. Conferir, em cada uma: se o resumo diz só o que a página citada diz, sem verbo de promessa cumprida e sem adjetivo; se o resumo não acrescenta número, prazo ou valor que o trecho não traz, e se as marcas de distância ('o que chama de', 'descrita como') e a menção a um segundo trecho do documento seguem a mesma régua nas duas candidaturas; e se a escolha das três propostas por área, que é decisão editorial, deixou de fora algo que mude o sentido da área. As duas pessoas têm o mesmo número de propostas por área, de propósito.",
};

const JOGO = {
  titulo: "Conteúdo educativo do jogo: fases, fatos biográficos e conceitos",
  porque:
    "O texto de cada fase é explicação nova, escrita para quem conhece pouco de política. Conferir, em cada bloco: se ele diz só o que os registros apontados sustentam, se a simplificação não muda o sentido e se nenhum adjetivo entrou. Na atividade: se a pergunta só usa o que a explicação acabou de dizer, se a opção certa está certa e se as erradas não são certas por outro caminho. Nos episódios judiciais, a leitura curta precisa trazer juntos a acusação, a defesa, a decisão e o desfecho na data de corte. Nos fatos biográficos: datas, lugares e nomes contra o documento, e as divergências entre documentos. Nos conceitos: se a definição simples é fiel ao texto oficial citado e se o aviso de simplificação basta.",
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

const NATUREZA: Record<DecisionView["natureza"], string> = { voto: "Voto parlamentar", ato: "Ato do Executivo", atuacao: "Atuação legislativa" };

/** O bloco de uma decisão: o que o cartão mostra, com cada fonte, e a votação, a proposição ou a matéria que ela cita. */
function decisionBlock(data: AtlasData, decisao: DecisionView): string[] {
  const linhas = [`### ${formatDate(decisao.data)}: ${decisao.titulo}`, ""];
  const pessoa = nomeDe(data, [decisao.pessoaId]);
  linhas.push(`- Identificador: \`${decisao.id}\` · Pessoa: ${pessoa} · ${NATUREZA[decisao.natureza]} · ${INSTITUICAO_LABELS[decisao.instituicao]} · Temas: ${decisao.temas.map((tema) => TEMA_LABELS[tema]).join(", ") || "nenhum"} · Revisão: ${reviewLine(decisao.editorial)}`);
  linhas.push(`- **Cargo a conferir:** ${decisao.cargo === null ? "mandato não publicado" : `${decisao.cargo.cargo}, ${decisao.cargo.instituicao} (\`${decisao.cargo.mandatoId}\`)`}`);
  if (decisao.natureza === "voto") {
    const { votacao, registro } = decisao;
    linhas.push(`- **Votação a conferir** (\`${votacao.id}\`): ${OBJETO_LABELS[votacao.objeto.tipo]}${votacao.objeto.identificacao === null ? "" : ` (${votacao.objeto.identificacao})`}; ${votacao.objeto.descricao}; etapa: ${votacao.etapa}; ${votacao.orgao}, ${votacao.modalidade}; resultado oficial: ${votacao.resultado.estado} (valor original "${votacao.resultado.valorOriginal}").`);
    const manifestacao = registro.tipo === "voto-individual" ? `${POSICAO_LABELS[registro.posicao]} (valor original "${registro.valorOriginal}")` : `${REGISTRO_INDIVIDUAL_LABELS[registro.tipo]} (valor original "${registro.valorOriginal}"${registro.motivoDocumentado === undefined ? "" : `; motivo: ${registro.motivoDocumentado}`})`;
    linhas.push(`- **Manifestação a conferir:** ${manifestacao}`);
  } else if (decisao.natureza === "ato") {
    linhas.push(`- **Ato a conferir:** ${TIPO_DE_ATO_LABELS[decisao.ato.tipo]}; ${decisao.ato.identificador}${decisao.ato.detalhes.map((detalhe) => `; ${detalhe.rotulo}: ${detalhe.valor}`).join("")}`);
  } else {
    const { tipo, materia, desfecho, divergencia } = decisao.atuacao;
    linhas.push(`- **Atuação a conferir:** ${TIPO_DE_ATUACAO_LABELS[tipo]}; matéria: ${materia.identificador}; ementa: ${materia.ementa}; autoria da matéria: ${materia.autoria}`);
    linhas.push(`- **Destino da matéria a conferir:** ${DESFECHO_DE_ATUACAO_LABELS[desfecho.tipo]}${desfecho.norma === null ? "" : ` (${desfecho.norma})`}. ${desfecho.descricao}`);
    if (divergencia !== null) linhas.push(`- **Divergência a conferir:** ${divergencia}`);
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

/** Os registros de apoio das decisões: as proposições, com as fontes próprias de cada uma, a cobertura da pesquisa e as identidades institucionais. */
function supportBlocks(data: AtlasData): string[] {
  const { conjunto } = data;
  const linhas: string[] = [];
  for (const proposicao of conjunto.proposicoes) {
    linhas.push(`### Proposição: ${proposicaoLabel(proposicao)}, ${INSTITUICAO_LABELS[proposicao.instituicao]}`, "");
    linhas.push(`- Identificador: \`${proposicao.id}\` · Temas: ${proposicao.temas.map((tema) => TEMA_LABELS[tema]).join(", ") || "nenhum"} · Revisão: ${reviewLine(proposicao.editorial)}`);
    linhas.push(`- **Ementa a conferir:** ${proposicao.ementa}`);
    linhas.push("- Fontes:", ...sourceLines(data, proposicao.fontes));
    linhas.push("- [ ] Conferido por: ______ em ____/____/______", "");
  }
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

const SALA_LABELS: Record<FaseDoJogo["sala"], string> = {
  historico: "Trajetória",
  economia: "Aprofundamento: Economia",
  "seguranca-publica": "Aprofundamento: Segurança pública",
  investigacao: "Missão: O documento diz o quê?",
};

const refLine = (referencias: readonly ReferenciaDeFase[]) => referencias.map((referencia) => `\`${referencia.tipo}:${referencia.id}\``).join(", ");

/** O bloco de uma fase: o objetivo, cada bloco da explicação com o que ele aponta, a atividade com a resposta e as lacunas. */
function phaseBlock(data: AtlasData, fase: FaseDoJogo): string[] {
  const palavras = fase.explicacao.reduce((soma, bloco) => soma + countWords(bloco.texto), 0);
  const linhas = [`### ${nomeDe(data, [fase.pessoaId])} · ${SALA_LABELS[fase.sala]} · Fase ${fase.ordem}: ${fase.titulo} (${fase.periodo.de === fase.periodo.ate ? fase.periodo.de : `${fase.periodo.de} a ${fase.periodo.ate}`})`, ""];
  linhas.push(`- Identificador: \`${fase.id}\` · Marco: ${refLine([fase.marco])} · Revisão: ${reviewLine(fase.editorial)}`);
  linhas.push(`- **Objetivo a conferir:** ${fase.objetivo}`);
  linhas.push(`- **Explicação a conferir** (${palavras} palavras):`);
  fase.explicacao.forEach((bloco, indice) => linhas.push(`  ${indice + 1}. ${bloco.texto} Aponta: ${refLine(bloco.referencias)}.`));
  if (fase.conceitos.length > 0) linhas.push(`- Conceitos definidos nesta fase: ${fase.conceitos.map((id) => `\`${id}\``).join(", ")}`);
  const { atividade } = fase;
  if (atividade.tipo === "pergunta") {
    linhas.push(`- **Pergunta a conferir:** ${atividade.enunciado}`);
    for (const opcao of atividade.opcoes) linhas.push(`  - ${opcao.id === atividade.correta ? "(certa) " : ""}${opcao.texto}`);
    linhas.push(`- **Explicação da resposta a conferir:** ${atividade.explicacao} Aponta: ${refLine(atividade.referencias)}.`);
  } else if (atividade.tipo === "ordem") {
    linhas.push(`- **Ordenação a conferir:** ${atividade.enunciado} Registros: ${refLine(atividade.itens)}. A ordem certa é a das datas dos registros.`);
    linhas.push(`- **Explicação da resposta a conferir:** ${atividade.explicacao}`);
  } else {
    linhas.push(`- **Dossiê a conferir:** ${atividade.enunciado} Cada ficha diz só o que o documento apontado registra; conferir o texto contra os campos do cartão (data, instituição, cargo, objeto e ação) e se o trecho destacado é sustentado pelo campo dito.`);
    for (const ficha of atividade.fichas) linhas.push(`  - Ficha \`${ficha.id}\`: ${ficha.texto} Documento: ${refLine([ficha.evidencia])}. Trecho destacado: "${ficha.destaque.trecho}" (campo: ${ficha.destaque.campo}).`);
    if (atividade.distratores.length > 0) linhas.push(`  - Documentos da gaveta que não sustentam ficha (distratores): ${refLine(atividade.distratores)}.`);
    linhas.push(`- **Explicação da resposta a conferir:** ${atividade.explicacao}`);
  }
  if (fase.explorar.length > 0) linhas.push(`- Para explorar no período (opcional no jogo): ${refLine(fase.explorar)}`);
  for (const lacuna of fase.lacunas) linhas.push(`- Lacuna declarada: ${lacuna}`);
  linhas.push("- [ ] Conferido por: ______ em ____/____/______", "");
  return linhas;
}

function factBlock(data: AtlasData, fato: FatoBiografico): string[] {
  const quando = fato.data.tipo === "data" ? formatDate(fato.data) : "sem data documentada";
  const linhas = [`### ${nomeDe(data, [fato.pessoaId])}: ${fato.titulo} (${quando})`, ""];
  linhas.push(`- Identificador: \`${fato.id}\` · Tipo: ${TIPO_DE_FATO_LABELS[fato.tipo]} · Revisão: ${reviewLine(fato.editorial)}`);
  linhas.push(`- **Texto a conferir:** ${fato.texto}`);
  if (fato.divergenciaDocumentada !== null) linhas.push(`- **Divergência a conferir:** ${fato.divergenciaDocumentada}`);
  linhas.push("- Fontes:", ...sourceLines(data, fato.fontes));
  linhas.push("- [ ] Conferido por: ______ em ____/____/______", "");
  return linhas;
}

function proposalBlock(data: AtlasData, proposta: PropostaEleitoral): string[] {
  const linhas = [`### ${nomeDe(data, [proposta.pessoaId])} · ${TEMA_LABELS[proposta.tema]} · eleição de ${proposta.eleicao}`, ""];
  linhas.push(`- Identificador: \`${proposta.id}\` · Revisão: ${reviewLine(proposta.editorial)}`);
  linhas.push(`- **Texto a conferir:** ${proposta.texto}`);
  if (proposta.ressalva !== null) linhas.push(`- **Ressalva a conferir:** ${proposta.ressalva}`);
  linhas.push("- Fontes:", ...sourceLines(data, proposta.fontes));
  linhas.push("- [ ] Conferido por: ______ em ____/____/______", "");
  return linhas;
}

function conceptBlock(data: AtlasData, conceito: Conceito): string[] {
  const linhas = [`### Conceito: ${conceito.termo}`, ""];
  linhas.push(`- Identificador: \`${conceito.id}\` · Revisão: ${reviewLine(conceito.editorial)}`);
  linhas.push(`- **Definição a conferir:** ${conceito.definicao}`);
  if (conceito.simplificacao !== null) linhas.push(`- **O que a definição simplifica:** ${conceito.simplificacao}`);
  linhas.push("- Fontes:", ...sourceLines(data, conceito.fontes));
  linhas.push("- [ ] Conferido por: ______ em ____/____/______", "");
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
    ...conjunto.atuacoesLegislativas.map((item) => item.editorial),
    ...conjunto.propostasEleitorais.map((item) => item.editorial),
    ...conjunto.coberturaPolitica.map((item) => item.editorial),
    ...conjunto.identidadesInstitucionais.map((item) => item.editorial),
    ...conjunto.fatosBiograficos.map((item) => item.editorial),
    ...conjunto.conceitos.map((item) => item.editorial),
    ...conjunto.fasesDoJogo.map((item) => item.editorial),
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
    `Resumo: ${conjunto.acontecimentos.length} acontecimentos (${porTema.get("judicial")?.length ?? 0} judiciais, ${porTema.get("eleitoral")?.length ?? 0} eleitorais, ${porTema.get("filiacao")?.length ?? 0} de partidos, ${porTema.get("mandato")?.length ?? 0} de mandatos e funções, ${porTema.get("demais")?.length ?? 0} demais), ${conjunto.filiacoes.length} filiações, ${conjunto.mandatos.length} mandatos, ${decisoes.length} decisões políticas (${conjunto.votos.length} votos, ${conjunto.atosExecutivos.length} atos do Executivo e ${conjunto.atuacoesLegislativas.length} atuações legislativas; ${conjunto.proposicoes.length} proposições), ${conjunto.coberturaPolitica.length} declarações de cobertura da pesquisa, ${conjunto.identidadesInstitucionais.length} identidades institucionais, ${conjunto.propostasEleitorais.length} propostas eleitorais, ${conjunto.fasesDoJogo.length} fases do jogo, ${conjunto.fatosBiograficos.length} fatos biográficos, ${conjunto.conceitos.length} conceitos, ${conjunto.fontes.length} fontes.`,
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
  if (decisoes.length > 0 || conjunto.proposicoes.length > 0 || conjunto.coberturaPolitica.length > 0 || conjunto.identidadesInstitucionais.length > 0) {
    linhas.push(`## ${numero}. ${DECISOES.titulo} (${decisoes.length} decisões, ${conjunto.proposicoes.length} proposições, ${conjunto.coberturaPolitica.length} coberturas da pesquisa e ${conjunto.identidadesInstitucionais.length} identidades institucionais)`);
    linhas.push("");
    linhas.push(DECISOES.porque);
    linhas.push("");
    for (const decisao of decisoes) linhas.push(...decisionBlock(data, decisao));
    linhas.push(...supportBlocks(data));
    numero += 1;
  }
  if (conjunto.propostasEleitorais.length > 0) {
    linhas.push(`## ${numero}. ${PROPOSTAS.titulo} (${conjunto.propostasEleitorais.length} propostas)`);
    linhas.push("");
    linhas.push(PROPOSTAS.porque);
    linhas.push("");
    for (const proposta of conjunto.propostasEleitorais) linhas.push(...proposalBlock(data, proposta));
    numero += 1;
  }
  if (conjunto.fasesDoJogo.length > 0 || conjunto.fatosBiograficos.length > 0 || conjunto.conceitos.length > 0) {
    linhas.push(`## ${numero}. ${JOGO.titulo} (${conjunto.fasesDoJogo.length} fases, ${conjunto.fatosBiograficos.length} fatos biográficos e ${conjunto.conceitos.length} conceitos)`);
    linhas.push("");
    linhas.push(JOGO.porque);
    linhas.push("");
    for (const fase of conjunto.fasesDoJogo) linhas.push(...phaseBlock(data, fase));
    for (const fato of conjunto.fatosBiograficos) linhas.push(...factBlock(data, fato));
    for (const conceito of conjunto.conceitos) linhas.push(...conceptBlock(data, conceito));
  }
  return linhas.join("\n");
}
