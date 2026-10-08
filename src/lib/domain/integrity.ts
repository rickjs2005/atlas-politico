// Verificações que dependem do conjunto inteiro. Os schemas garantem que cada
// registro é bem formado; aqui se confere que eles se encaixam.
//
// Fase 1: ids e slugs únicos, referências resolvidas, data de corte e as
// duas regras de publicação. Índices, relatório de campos incompletos e
// normalização ficam para o pipeline da fase 3.

import { calcInterval } from "./dates";
import type { Citacao, Conjunto } from "./schemas";

export interface IntegrityIssue {
  /** Onde está o problema, em formato legível: `acontecimentos["id"].fontes[0]`. */
  caminho: string;
  mensagem: string;
}

/** Todo identificador de fixture começa assim; nenhum registro publicado pode. */
export const SYNTHETIC_PREFIX = "sintetico-";

function findDuplicates(valores: string[]): string[] {
  const vistos = new Set<string>();
  const repetidos = new Set<string>();
  for (const valor of valores) {
    if (vistos.has(valor)) repetidos.add(valor);
    vistos.add(valor);
  }
  return [...repetidos];
}

export function checkIntegrity(conjunto: Conjunto): IntegrityIssue[] {
  const issues: IntegrityIssue[] = [];
  const report = (caminho: string, mensagem: string) => issues.push({ caminho, mensagem });

  const { edicao, pessoas, mandatos, filiacoes, acontecimentos, lugares, fontes, imagens } =
    conjunto;
  const colecoes = { pessoas, mandatos, filiacoes, acontecimentos, lugares, fontes, imagens };

  for (const [nome, registros] of Object.entries(colecoes)) {
    for (const id of findDuplicates(registros.map((registro) => registro.id))) {
      report(nome, `Identificador repetido: "${id}".`);
    }
  }
  // Slugs viram endereço público; dois registros não podem disputar a mesma rota.
  for (const slug of findDuplicates(pessoas.map((pessoa) => pessoa.slug))) {
    report("pessoas", `Slug repetido: "${slug}".`);
  }
  for (const slug of findDuplicates(acontecimentos.map((item) => item.slug))) {
    report("acontecimentos", `Slug repetido: "${slug}".`);
  }

  const pessoaIds = new Set(pessoas.map((pessoa) => pessoa.id));
  const lugarIds = new Set(lugares.map((lugar) => lugar.id));
  const fonteIds = new Set(fontes.map((fonte) => fonte.id));
  const imagemIds = new Set(imagens.map((imagem) => imagem.id));

  const requireReference = (ids: Set<string>, id: string, caminho: string, alvo: string) => {
    if (!ids.has(id)) report(caminho, `Referência a ${alvo} inexistente: "${id}".`);
  };
  const checkCitations = (caminho: string, citacoes: Citacao[]) => {
    citacoes.forEach((citacao, indice) => {
      requireReference(fonteIds, citacao.fonteId, `${caminho}.fontes[${indice}]`, "fonte");
    });
  };

  for (const pessoa of pessoas) {
    const caminho = `pessoas["${pessoa.id}"]`;
    if (pessoa.retratoId !== null) {
      requireReference(imagemIds, pessoa.retratoId, `${caminho}.retratoId`, "imagem");
    }
    checkCitations(caminho, pessoa.fontes);
  }

  for (const mandato of mandatos) {
    const caminho = `mandatos["${mandato.id}"]`;
    requireReference(pessoaIds, mandato.pessoaId, `${caminho}.pessoaId`, "pessoa");
    checkCitations(caminho, mandato.fontes);
  }

  for (const filiacao of filiacoes) {
    const caminho = `filiacoes["${filiacao.id}"]`;
    requireReference(pessoaIds, filiacao.pessoaId, `${caminho}.pessoaId`, "pessoa");
    checkCitations(caminho, filiacao.fontes);
  }

  const corte = calcInterval({ valor: edicao.dataDeCorte, precisao: "dia" }).fim;

  for (const acontecimento of acontecimentos) {
    const caminho = `acontecimentos["${acontecimento.id}"]`;
    for (const pessoaId of acontecimento.pessoaIds) {
      requireReference(pessoaIds, pessoaId, `${caminho}.pessoaIds`, "pessoa");
    }
    if (acontecimento.localizacao.tipo === "lugares") {
      for (const lugarId of acontecimento.localizacao.lugarIds) {
        requireReference(lugarIds, lugarId, `${caminho}.localizacao.lugarIds`, "lugar");
      }
    }
    if (acontecimento.imagemId !== null) {
      requireReference(imagemIds, acontecimento.imagemId, `${caminho}.imagemId`, "imagem");
    }
    checkCitations(caminho, acontecimento.fontes);

    if (calcInterval(acontecimento.data).inicio > corte) {
      report(
        `${caminho}.data`,
        `Data posterior à data de corte da edição (${edicao.dataDeCorte}).`,
      );
    }
  }

  edicao.cobertura.forEach((cobertura, indice) => {
    requireReference(pessoaIds, cobertura.pessoaId, `edicao.cobertura[${indice}].pessoaId`, "pessoa");
  });

  return issues;
}

/**
 * Regras extras para o conjunto que alimenta as páginas: só registros
 * revisados e nenhum dado sintético.
 */
export function checkPublication(conjunto: Conjunto): IntegrityIssue[] {
  const issues: IntegrityIssue[] = [];
  const { pessoas, mandatos, filiacoes, acontecimentos, lugares, fontes, imagens } = conjunto;

  const factuais = { pessoas, mandatos, filiacoes, acontecimentos };
  for (const [nome, registros] of Object.entries(factuais)) {
    for (const registro of registros) {
      if (registro.editorial.estado !== "revisado") {
        issues.push({
          caminho: `${nome}["${registro.id}"].editorial`,
          mensagem: `Registro em estado "${registro.editorial.estado}" não pode ser publicado.`,
        });
      }
    }
  }

  const todos = { ...factuais, lugares, fontes, imagens };
  for (const [nome, registros] of Object.entries(todos)) {
    for (const registro of registros) {
      const slug = "slug" in registro ? registro.slug : "";
      if (registro.id.startsWith(SYNTHETIC_PREFIX) || slug.startsWith(SYNTHETIC_PREFIX)) {
        issues.push({
          caminho: `${nome}["${registro.id}"]`,
          mensagem: "Dado sintético de teste não pode entrar no conjunto publicado.",
        });
      }
    }
  }

  return issues;
}
