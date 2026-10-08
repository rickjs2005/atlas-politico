// Relatório de cobertura do conteúdo: quantos acontecimentos há por pessoa,
// período e categoria, onde estão as lacunas e o que ainda é rascunho.
// Lê os JSON direto, sem validar; a validação é do build e dos testes.
// Uso: npm run content:coverage (imprime Markdown)

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const read = (dir, name) => {
  const file = path.resolve("content", dir, name);
  return existsSync(file) ? JSON.parse(readFileSync(file, "utf8").replace(/^﻿/, "")) : [];
};

const edicao = read("published", "edicao.json");
const pessoas = read("published", "pessoas.json");
const publicados = read("published", "acontecimentos.json");
const rascunhos = read("drafts", "acontecimentos.json");
const mandatos = read("published", "mandatos.json");
const filiacoes = read("published", "filiacoes.json");
const fontes = read("published", "fontes.json");

const CATEGORIAS = ["mandatos-e-funcoes", "eleicoes", "partidos-e-aliancas", "atuacao-institucional", "marcos-historicos"];
const ROTULOS = { "mandatos-e-funcoes": "Mandatos e funções", eleicoes: "Eleições", "partidos-e-aliancas": "Partidos e alianças", "atuacao-institucional": "Atuação institucional", "marcos-historicos": "Marcos históricos" };
const LACUNA_MINIMA = 4; // anos sem nenhum acontecimento para a lacuna ser listada

const ano = (item) => Number(item.data.valor.slice(0, 4));
const decada = (item) => `${Math.floor(ano(item) / 10) * 10}`;
const count = (itens, chave) => itens.reduce((mapa, item) => mapa.set(chave(item), (mapa.get(chave(item)) ?? 0) + 1), new Map());
const row = (celulas) => `| ${celulas.join(" | ")} |`;
const table = (cabecalho, linhas) => [row(cabecalho), row(cabecalho.map(() => "---")), ...linhas.map(row)].join("\n");

const corte = Number(edicao.dataDeCorte.slice(0, 4));
const out = [];
out.push(`Edição ${edicao.versao} · data de corte ${edicao.dataDeCorte} · revisão ${edicao.revisao.tipo} em ${edicao.revisao.revisadoEm}`, "");

out.push("### Totais", "");
out.push(table(
  ["Pessoa", "Conferidos", "Rascunhos", "Mandatos e funções", "Filiações", "Primeiro ano", "Último ano"],
  pessoas.map((pessoa) => {
    const seus = publicados.filter((item) => item.pessoaIds.includes(pessoa.id));
    const anos = seus.map(ano);
    return [
      pessoa.nome,
      seus.length,
      rascunhos.filter((item) => item.pessoaIds.includes(pessoa.id)).length,
      mandatos.filter((item) => item.pessoaId === pessoa.id).length,
      filiacoes.filter((item) => item.pessoaId === pessoa.id).length,
      Math.min(...anos),
      Math.max(...anos),
    ];
  }),
), "");
const compartilhados = publicados.filter((item) => item.pessoaIds.length > 1).length;
out.push(`Acontecimentos conferidos no conjunto: ${publicados.length}, dos quais ${compartilhados} ligado(s) a mais de uma pessoa. Rascunhos: ${rascunhos.length}.`, "");

out.push("### Por categoria", "");
out.push(table(
  ["Categoria", ...pessoas.map((pessoa) => pessoa.nome)],
  CATEGORIAS.map((categoria) => [
    ROTULOS[categoria],
    ...pessoas.map((pessoa) => publicados.filter((item) => item.pessoaIds.includes(pessoa.id) && item.categoria === categoria).length),
  ]),
), "");

out.push("### Por década", "");
const decadas = [...new Set(publicados.map(decada))].sort();
out.push(table(
  ["Década", ...pessoas.map((pessoa) => pessoa.nome)],
  decadas.map((d) => [
    `${d}`,
    ...pessoas.map((pessoa) => count(publicados.filter((item) => item.pessoaIds.includes(pessoa.id)), decada).get(d) ?? 0),
  ]),
), "");

out.push("### Precisão das datas e localização", "");
out.push(table(
  ["Pessoa", "Dia", "Mês", "Ano", "Com lugar", "Abrangência nacional", "Lugar não documentado"],
  pessoas.map((pessoa) => {
    const seus = publicados.filter((item) => item.pessoaIds.includes(pessoa.id));
    const precisao = count(seus, (item) => item.data.precisao);
    const local = count(seus, (item) => item.localizacao.tipo);
    return [pessoa.nome, precisao.get("dia") ?? 0, precisao.get("mes") ?? 0, precisao.get("ano") ?? 0, local.get("lugares") ?? 0, local.get("nacional") ?? 0, local.get("desconhecida") ?? 0];
  }),
), "");

out.push(`### Lacunas de ${LACUNA_MINIMA} anos ou mais sem acontecimentos`, "");
for (const pessoa of pessoas) {
  const cobertura = edicao.cobertura.find((item) => item.pessoaId === pessoa.id);
  const inicio = cobertura?.periodo.inicio.tipo === "data" ? Number(cobertura.periodo.inicio.valor.slice(0, 4)) : null;
  const anos = [...new Set(publicados.filter((item) => item.pessoaIds.includes(pessoa.id)).map(ano))].sort((a, b) => a - b);
  const marcos = [...(inicio ? [inicio] : []), ...anos, corte];
  const lacunas = [];
  for (let i = 1; i < marcos.length; i += 1) {
    const livre = marcos[i] - marcos[i - 1] - 1;
    if (livre >= LACUNA_MINIMA) lacunas.push(`${marcos[i - 1] + 1} a ${marcos[i] - 1} (${livre} anos)`);
  }
  out.push(`- **${pessoa.nome}** (cobertura a partir de ${inicio ?? "início não informado"}): ${lacunas.length ? lacunas.join("; ") : "nenhuma"}.`);
}
out.push("");

out.push("### Rascunhos e pendências", "");
for (const item of rascunhos) {
  out.push(`- \`${item.id}\` (${item.data.valor}, ${item.editorial.estado}): ${(item.editorial.pendencias ?? []).join(" ")}`);
}
out.push("");

out.push("### Fontes por origem", "");
const dominio = (url) => new URL(url).hostname.replace(/^www\d*\./, "");
const porDominio = [...count(fontes, (fonte) => dominio(fonte.url))].sort((a, b) => b[1] - a[1]);
out.push(table(["Domínio", "Fontes"], porDominio));

console.log(out.join("\n"));
