// Importação de decisões políticas dos acervos oficiais para os rascunhos
// (docs/DATA-PIPELINE.md, seção Importação de decisões). É o único comando do
// projeto que consulta a rede; o build normal nunca consulta.
//
//   npm run importar:decisoes -- senado --parlamentar 5894 --pessoa flavio-bolsonaro \
//       --mandato flavio-bolsonaro-senador-2019 [--de 2019-02-01] [--ate 2026-10-08]
//   npm run importar:decisoes -- camara --deputado 139289 --pessoa lula \
//       --mandato lula-deputado-federal-1987-1991 --de 1987-02-01 --ate 1991-01-31 [--orgao 180] [--limite 50]
//
// Opções comuns: --dry-run (não grava nada no projeto), --descricao "...",
// --root <pasta>.
//
// Fluxo: captura bruta (research/capturas/) → normalização (adaptador do
// provedor) → pacote (research/pacotes/) → importação para content/drafts/,
// pelo mesmo caminho de `npm run data:import`: tudo entra como rascunho, com
// as pendências do que a revisão precisa conferir. Importar não publica.

import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { parseArgs } from "node:util";

import { runImport } from "@/lib/content/pipeline";
import { resolvePaths } from "@/lib/content/sources";
import { coberturaCamara, mergePacotes, normalizeCamaraVotacao, type CamaraVotacaoDetalhe, type CamaraVoto } from "@/lib/import/camara";
import { buildCaptura, type Captura } from "@/lib/import/capturas";
import { fetchTexto } from "@/lib/import/http";
import { normalizeSenado, tiposComparecimentoDe, type PacoteDeImportacao, type SenadoSessaoVotacao } from "@/lib/import/senado";
import { renderImportReport } from "@/lib/publication/import";

const USAGE = `Uso: npm run importar:decisoes -- <senado|camara> [opções]

senado   --parlamentar <código> --pessoa <id> --mandato <id> [--de AAAA-MM-DD] [--ate AAAA-MM-DD]
camara   --deputado <id> --pessoa <id> --mandato <id> --de AAAA-MM-DD --ate AAAA-MM-DD [--orgao <id>] [--limite <n>]

Comuns   --dry-run (não grava nada no projeto)  --descricao "<texto>"  --root <pasta>`;

class UsageError extends Error {}

const SENADO = "https://legis.senado.leg.br/dadosabertos";
const CAMARA = "https://dadosabertos.camara.leg.br/api/v2";
const DATA = /^\d{4}-\d{2}-\d{2}$/;

interface Contexto {
  root: string;
  dryRun: boolean;
  descricao: string | undefined;
  agora: Date;
  capturas: Captura[];
}

/** As opções de linha de comando que os provedores leem. */
interface Valores {
  parlamentar?: string;
  deputado?: string;
  pessoa?: string;
  mandato?: string;
  de?: string;
  ate?: string;
  orgao?: string;
  limite?: string;
}

function exigir(valor: string | undefined, nome: string): string {
  if (valor === undefined || valor.trim().length === 0) throw new UsageError(`Falta a opção --${nome}.`);
  return valor.trim();
}

function exigirData(valor: string | undefined, nome: string): string {
  const data = exigir(valor, nome);
  if (!DATA.test(data)) throw new UsageError(`--${nome} deve ser uma data AAAA-MM-DD.`);
  return data;
}

async function capturar(ctx: Contexto, provedor: "senado" | "camara", nome: string, url: string): Promise<Captura> {
  const resultado = await fetchTexto(url, {
    aoResponder: (r) => console.log(`  ${r.status} ${r.url}${r.tentativas > 1 ? ` (tentativa ${r.tentativas})` : ""}`),
  });
  if (resultado.status !== 200) throw new Error(`O acervo respondeu ${resultado.status} em ${url}. Nada foi importado.`);
  const captura = buildCaptura(provedor, nome, url, resultado.status, resultado.texto, ctx.agora);
  ctx.capturas.push(captura);
  return captura;
}

function gravarCapturas(ctx: Contexto): string[] {
  if (ctx.dryRun) return [];
  const pasta = path.join(ctx.root, "research", "capturas");
  mkdirSync(pasta, { recursive: true });
  return ctx.capturas.map((captura) => {
    const destino = path.join(pasta, `${captura.id}.json`);
    writeFileSync(destino, `${JSON.stringify(captura, null, 2)}\n`, "utf8");
    return path.relative(ctx.root, destino);
  });
}

function gravarPacote(ctx: Contexto, nome: string, pacote: PacoteDeImportacao): string {
  const pasta = ctx.dryRun ? path.join(tmpdir(), "atlas-politico-importacao") : path.join(ctx.root, "research", "pacotes");
  mkdirSync(pasta, { recursive: true });
  const destino = path.join(pasta, `${nome}.json`);
  writeFileSync(destino, `${JSON.stringify(pacote, null, 2)}\n`, "utf8");
  return destino;
}

function resumo(pacote: PacoteDeImportacao): string {
  return `${pacote.proposicoes.length} proposições, ${pacote.votacoes.length} votações, ${pacote.votos.length} votos, ${pacote.coberturaPolitica.length} cobertura(s), ${pacote.fontes.length} fonte(s)`;
}

async function senado(ctx: Contexto, valores: Valores): Promise<PacoteDeImportacao> {
  const parlamentar = exigir(valores.parlamentar, "parlamentar");
  const pessoaId = exigir(valores.pessoa, "pessoa");
  const mandatoId = exigir(valores.mandato, "mandato");
  const de = valores.de === undefined ? null : exigirData(valores.de, "de");
  const ate = valores.ate === undefined ? null : exigirData(valores.ate, "ate");

  const consulta = new URL(`${SENADO}/votacao`);
  consulta.searchParams.set("codigoParlamentar", parlamentar);
  if (de !== null) consulta.searchParams.set("dataInicio", de);
  if (ate !== null) consulta.searchParams.set("dataFim", ate);

  console.log("Senado Federal: votações nominais do Plenário");
  const tipos = await capturar(ctx, "senado", "tipos-comparecimento", `${SENADO}/plenario/lista/tiposComparecimento`);
  const captura = await capturar(ctx, "senado", `votacao-${parlamentar}`, consulta.toString());
  const itens = Array.isArray(captura.resposta) ? (captura.resposta as SenadoSessaoVotacao[]) : [];
  if (!Array.isArray(captura.resposta)) throw new Error("A resposta do Senado não é uma lista de votações; o contrato mudou. Nada foi importado.");
  const datas = itens.map((item) => item.dataSessao).filter((data) => typeof data === "string").sort();
  const hoje = ctx.agora.toISOString().slice(0, 10);

  return normalizeSenado(itens, {
    codigoParlamentar: parlamentar,
    pessoaId,
    mandatoId,
    urlConsulta: consulta.toString(),
    capturadoEm: hoje,
    capturaId: captura.id,
    periodo: { de: de ?? datas[0]?.slice(0, 10) ?? hoje, ate: ate ?? datas.at(-1)?.slice(0, 10) ?? hoje },
    tiposComparecimento: tiposComparecimentoDe(tipos.resposta),
    completa: true,
  });
}

/** Janelas de até três meses, como a API da Câmara exige. */
function janelas(de: string, ate: string): [string, string][] {
  const saida: [string, string][] = [];
  let inicio = new Date(`${de}T00:00:00Z`);
  const fim = new Date(`${ate}T00:00:00Z`);
  while (inicio <= fim) {
    const limite = new Date(inicio);
    limite.setUTCMonth(limite.getUTCMonth() + 3);
    limite.setUTCDate(limite.getUTCDate() - 1);
    const fimDaJanela = limite < fim ? limite : fim;
    saida.push([inicio.toISOString().slice(0, 10), fimDaJanela.toISOString().slice(0, 10)]);
    inicio = new Date(fimDaJanela);
    inicio.setUTCDate(inicio.getUTCDate() + 1);
  }
  return saida;
}

async function camara(ctx: Contexto, valores: Valores): Promise<PacoteDeImportacao> {
  const deputado = exigir(valores.deputado, "deputado");
  const pessoaId = exigir(valores.pessoa, "pessoa");
  const mandatoId = exigir(valores.mandato, "mandato");
  const de = exigirData(valores.de, "de");
  const ate = exigirData(valores.ate, "ate");
  const limite = valores.limite === undefined ? Number.POSITIVE_INFINITY : Number(valores.limite);
  if (!Number.isFinite(limite) && valores.limite !== undefined) throw new UsageError("--limite deve ser um número.");
  const hoje = ctx.agora.toISOString().slice(0, 10);

  console.log("Câmara dos Deputados: votações por período, e o voto do deputado em cada uma");
  const ids: string[] = [];
  let listagemCompleta = true;
  for (const [inicio, fim] of janelas(de, ate)) {
    for (let pagina = 1; ; pagina += 1) {
      const url = new URL(`${CAMARA}/votacoes`);
      url.searchParams.set("dataInicio", inicio);
      url.searchParams.set("dataFim", fim);
      url.searchParams.set("itens", "100");
      url.searchParams.set("pagina", String(pagina));
      if (valores.orgao !== undefined) url.searchParams.set("idOrgao", valores.orgao);
      const captura = await capturar(ctx, "camara", `votacoes-${inicio}-p${pagina}`, url.toString());
      const dados = (captura.resposta as { dados?: { id: string }[] }).dados ?? [];
      ids.push(...dados.map((item) => item.id));
      if (dados.length < 100) break;
      if (ids.length >= limite) {
        listagemCompleta = false;
        break;
      }
    }
    if (ids.length >= limite) break;
  }

  const selecionadas = ids.slice(0, Number.isFinite(limite) ? limite : undefined);
  if (selecionadas.length < ids.length) listagemCompleta = false;
  console.log(`  ${ids.length} votações listadas, ${selecionadas.length} a consultar`);

  const pacotes: PacoteDeImportacao[] = [];
  let comVotos = 0;
  for (const id of selecionadas) {
    const urlDetalhe = `${CAMARA}/votacoes/${id}`;
    const urlVotos = `${CAMARA}/votacoes/${id}/votos`;
    const detalhe = await capturar(ctx, "camara", `votacao-${id}`, urlDetalhe);
    const votos = await capturar(ctx, "camara", `votos-${id}`, urlVotos);
    const dados = (detalhe.resposta as { dados?: CamaraVotacaoDetalhe }).dados;
    const lista = (votos.resposta as { dados?: CamaraVoto[] }).dados ?? [];
    if (dados === undefined) continue;
    if (lista.length > 0) comVotos += 1;
    pacotes.push(normalizeCamaraVotacao(dados, lista, { idDeputado: deputado, pessoaId, mandatoId, capturadoEm: hoje, capturaId: votos.id, urlDetalhe, urlVotos }));
  }

  const pacote = mergePacotes(pacotes);
  pacote.coberturaPolitica = [
    coberturaCamara({
      idDeputado: deputado,
      pessoaId,
      capturadoEm: hoje,
      periodo: { de, ate },
      urlBase: `${CAMARA}/votacoes`,
      votacoesVistas: selecionadas.length,
      votacoesComVotos: comVotos,
      completa: listagemCompleta,
      lacunas: listagemCompleta ? [] : [`A varredura parou no limite de ${limite} votações.`],
    }),
  ];
  return pacote;
}

async function main(): Promise<number> {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      root: { type: "string" },
      parlamentar: { type: "string" },
      deputado: { type: "string" },
      pessoa: { type: "string" },
      mandato: { type: "string" },
      de: { type: "string" },
      ate: { type: "string" },
      orgao: { type: "string" },
      limite: { type: "string" },
      descricao: { type: "string" },
      "dry-run": { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
  });
  const [provedor] = positionals;
  if (values.help || provedor === undefined) {
    console.log(USAGE);
    return provedor === undefined && !values.help ? 2 : 0;
  }
  if (provedor !== "senado" && provedor !== "camara") throw new UsageError(`Provedor desconhecido: ${provedor}. Os aceitos são senado e camara.`);

  const ctx: Contexto = { root: path.resolve(values.root ?? process.cwd()), dryRun: values["dry-run"], descricao: values.descricao, agora: new Date(), capturas: [] };
  const pacote = provedor === "senado" ? await senado(ctx, values) : await camara(ctx, values);
  const hoje = ctx.agora.toISOString().slice(0, 10);

  const capturasGravadas = gravarCapturas(ctx);
  const nome = `${provedor}-${values.parlamentar ?? values.deputado ?? "x"}-${hoje}`;
  const arquivoDoPacote = gravarPacote(ctx, nome, pacote);
  console.log(`\nPacote: ${resumo(pacote)}`);
  console.log(ctx.dryRun ? "Capturas: não gravadas (simulação)." : `Capturas gravadas: ${capturasGravadas.length} em research/capturas/.`);

  const paths = resolvePaths(ctx.root);
  const { plano, gravados } = runImport(paths, arquivoDoPacote, {
    descricao: ctx.descricao ?? `${provedor === "senado" ? "Dados Abertos do Senado" : "Dados Abertos da Câmara"}, importação automática de ${hoje}`,
    simular: ctx.dryRun,
    hoje,
  });
  console.log(`\n${renderImportReport(plano.registro, ctx.dryRun)}`);
  if (gravados.length > 0) console.log(`\nArquivos gravados: ${gravados.join(", ")}`);
  console.log("\nTudo o que entrou é rascunho: conferir cada voto contra a ata ou o painel, classificar os temas e só então promover (docs/DATA-PIPELINE.md).");
  return 0;
}

main()
  .then((codigo) => process.exit(codigo))
  .catch((erro: unknown) => {
    if (erro instanceof UsageError) {
      console.error(`${erro.message}\n\n${USAGE}`);
      process.exit(2);
    }
    console.error(erro instanceof Error ? erro.message : String(erro));
    process.exit(1);
  });
