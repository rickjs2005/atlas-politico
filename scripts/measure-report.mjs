// Compara duas medições gravadas por scripts/measure.mjs e escreve as tabelas
// em Markdown, como as de docs/PERFORMANCE.md.
//
// Uso: npm run measure:report -- antes depois
//      (lê docs/desempenho/antes.json e docs/desempenho/depois.json)

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const [a = "antes", b = "depois"] = process.argv.slice(2);

function load(rotulo) {
  const arquivo = path.resolve(`docs/desempenho/${rotulo}.json`);
  if (!existsSync(arquivo)) {
    console.error(`Falta ${path.relative(process.cwd(), arquivo)}. Rode \`npm run measure -- --rotulo ${rotulo}\`.`);
    process.exit(1);
  }
  return JSON.parse(readFileSync(arquivo, "utf8"));
}

const antes = load(a);
const depois = load(b);

const ROTAS = {
  entrada: "Entrada",
  exploracao: "Exploração",
  comparacao: "Comparação",
  acontecimento: "Acontecimento",
  metodologia: "Metodologia",
};
const PERFIS = { computador: "Computador", celular: "Celular" };
const INTERACOES = {
  abrirMapa: "Abrir a vista do mapa",
  categoria: "Marcar uma categoria",
  todasAsCategorias: "Desmarcar a categoria",
  selecao: "Abrir um acontecimento",
  fechar: "Fechar a leitura",
};
const PARTES = { lista: "lista", marcadores: "marcadores do mapa", leitura: "painel de leitura", colunas: "colunas", mapaPronto: "mapa pronto" };

const find = (medicao, perfil, rota) => medicao.resultados.find((item) => item.perfil === perfil && item.rota === rota);
const ms = (valor) => (valor === null || valor === undefined ? "–" : `${Math.round(valor).toLocaleString("pt-BR")} ms`);
const kb = (valor) => (valor === null || valor === undefined ? "–" : `${Math.round(valor / 1024).toLocaleString("pt-BR")} KB`);
const cls = (valor) => (valor === null || valor === undefined ? "–" : valor.toLocaleString("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 3 }));
const evento = (valor) => (valor === null || valor === undefined ? "abaixo de 16 ms" : ms(valor));
const pair = (x, y, formato) => `${formato(x)} → ${formato(y)}`;

const linhas = [];
const out = (texto = "") => linhas.push(texto);

for (const [perfil, nomeDoPerfil] of Object.entries(PERFIS)) {
  if (!find(depois, perfil, "entrada") && !find(antes, perfil, "entrada")) continue;
  out(`### ${nomeDoPerfil}`);
  out();
  out(`${depois.condicoes.perfis?.[perfil] ?? ""}. Antes → depois, mediana de ${depois.condicoes.execucoes} execuções.`);
  out();
  out("| Tela | LCP | FCP | Carregamento completo | Fontes prontas | CLS | Bloqueio em quadros longos | Transferido | Pedidos | Mapa pronto |");
  out("| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |");
  for (const [rota, nome] of Object.entries(ROTAS)) {
    const x = find(antes, perfil, rota)?.mediana;
    const y = find(depois, perfil, rota)?.mediana;
    if (!x || !y) continue;
    const mapa = x.mapaPronto === null && y.mapaPronto === null ? "não carrega" : `${x.mapaPronto === null ? "não carrega" : ms(x.mapaPronto)} → ${y.mapaPronto === null ? "não carrega" : ms(y.mapaPronto)}`;
    out(
      `| ${nome} | ${pair(x.lcp, y.lcp, ms)} | ${pair(x.fcp, y.fcp, ms)} | ${pair(x.load, y.load, ms)} | ${pair(x.fontes, y.fontes, ms)} | ${pair(x.cls, y.cls, cls)} | ${pair(x.bloqueioDosQuadros ?? null, y.bloqueioDosQuadros ?? null, ms)} | ${pair(x.transferidoTotal, y.transferidoTotal, kb)} | ${x.pedidos} → ${y.pedidos} | ${mapa} |`,
    );
  }
  out();

  out("Elemento do LCP:");
  out();
  out("| Tela | Antes | Depois |");
  out("| --- | --- | --- |");
  const descreve = (elemento) => {
    if (!elemento) return "–";
    if (elemento.tag === "img") return `imagem \`${String(elemento.url ?? "").split("/").pop()}\``;
    return `texto (\`${elemento.tag}\`): "${String(elemento.texto ?? "").slice(0, 40)}…"`;
  };
  for (const [rota, nome] of Object.entries(ROTAS)) {
    const x = find(antes, perfil, rota);
    const y = find(depois, perfil, rota);
    if (!x || !y) continue;
    out(`| ${nome} | ${descreve(x.lcpElemento)} | ${descreve(y.lcpElemento)} |`);
  }
  out();

  out("Peso por tipo de recurso, transferido (antes → depois):");
  out();
  const tipos = ["documento", "javascript", "css", "fonte", "imagem", "dados"];
  out(`| Tela | ${tipos.map((tipo) => tipo[0].toUpperCase() + tipo.slice(1)).join(" | ")} |`);
  out(`| --- | ${tipos.map(() => "---").join(" | ")} |`);
  for (const [rota, nome] of Object.entries(ROTAS)) {
    const x = find(antes, perfil, rota)?.recursos.total.porTipo;
    const y = find(depois, perfil, rota)?.recursos.total.porTipo;
    if (!x || !y) continue;
    out(`| ${nome} | ${tipos.map((tipo) => pair(x[tipo]?.transferido ?? 0, y[tipo]?.transferido ?? 0, kb)).join(" | ")} |`);
  }
  out();

  out("Interações, da entrada até a pintura seguinte (Event Timing) e até cada parte da tela mudar:");
  out();
  out("| Tela | Ação | Duração do evento | Até a tela mudar |");
  out("| --- | --- | --- | --- |");
  for (const rota of ["exploracao", "comparacao"]) {
    const x = find(antes, perfil, rota)?.mediana.interacoes;
    const y = find(depois, perfil, rota)?.mediana.interacoes;
    if (!x || !y) continue;
    for (const [chave, nome] of Object.entries(INTERACOES)) {
      if (!x[chave] || !y[chave]) continue;
      const partes = Object.keys({ ...x[chave].dom, ...y[chave].dom })
        .map((parte) => `${PARTES[parte] ?? parte}: ${pair(x[chave].dom[parte], y[chave].dom[parte], ms)}`)
        .join("; ");
      out(`| ${ROTAS[rota]} | ${nome} | ${evento(x[chave].evento)} → ${evento(y[chave].evento)} | ${partes || "–"} |`);
    }
  }
  out();
}

console.log(linhas.join("\n"));
