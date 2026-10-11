// A barreira de release: o que a política editorial e a publicação exigem
// antes de o site ir ao ar, conferido sobre o conjunto publicado e a
// configuração do site (docs/EDITORIAL.md, seção Publicação; docs/DEPLOY.md).
// Função pura; o comando `npm run verify:release` a roda e recusa a release
// com o diagnóstico.
//
// Não é a validação do build: o conjunto com revisão assistida por IA serve
// ao desenvolvimento e continua passando por `npm run check`
// (`checkPublication`, em src/lib/domain/integrity.ts, aceita `revisado` de
// qualquer tipo). Aqui a régua é a da publicação: só revisão humana.

import type { Conjunto } from "@/lib/domain/types";
import { COLECOES_FACTUAIS } from "@/lib/publication/sources";

export interface ReleaseIssue {
  /** `bloqueia` recusa a release; `aviso` só registra uma decisão em aberto. */
  nivel: "bloqueia" | "aviso";
  /** Onde a condição se resolve: coleção e campo, ou arquivo e campo. */
  caminho: string;
  mensagem: string;
}

/** O que a release lê de `src/lib/site.ts`. */
export interface ReleaseSite {
  publicUrl: string | null;
  indexar: boolean;
  correctionChannel: unknown;
}

export interface ReleaseContext {
  /** Há um arquivo LICENSE na raiz do repositório. */
  licenca: boolean;
}

/** As coleções com estado editorial, as mesmas do pipeline: toda afirmação factual passa pela mesma régua. */
const FACTUAIS = COLECOES_FACTUAIS;

/** O que a barreira lê do conjunto: só as coleções factuais, as do conjunto publicado ou as dos dados gerados. */
export type ReleaseCollections = Pick<Conjunto, (typeof FACTUAIS)[number]>;

/**
 * As condições de release que não estão atendidas. Uma por coleção com
 * registros sem revisão humana (com a contagem), uma por campo pendente da
 * configuração, e avisos para o que é decisão e não bloqueio.
 */
export function releaseIssues(conjunto: ReleaseCollections, site: ReleaseSite, contexto: ReleaseContext): ReleaseIssue[] {
  const issues: ReleaseIssue[] = [];

  for (const nome of FACTUAIS) {
    const registros = conjunto[nome];
    const semRevisaoHumana = registros.filter((registro) => registro.editorial.estado !== "revisado" || registro.editorial.revisao.tipo !== "humana");
    if (semRevisaoHumana.length === 0) continue;
    const quantos = `${semRevisaoHumana.length} de ${registros.length}`;
    issues.push({
      nivel: "bloqueia",
      caminho: `${nome}.editorial.revisao`,
      mensagem: `${quantos} ${registros.length === 1 ? "registro" : "registros"} sem revisão humana: a publicação exige que uma pessoa confira o conjunto final (docs/EDITORIAL.md, docs/HUMAN-REVIEW.md). O código nunca registra revisão como humana.`,
    });
  }

  if (site.publicUrl === null) {
    issues.push({
      nivel: "bloqueia",
      caminho: "src/lib/site.ts publicUrl",
      mensagem: "Sem domínio público não há endereço canônico, sitemap nem prévia de compartilhamento com endereço absoluto.",
    });
  }
  if (site.correctionChannel === null || site.correctionChannel === undefined) {
    issues.push({
      nivel: "bloqueia",
      caminho: "src/lib/site.ts correctionChannel",
      mensagem: "Sem canal público de correção, a metodologia diz que ele está pendente.",
    });
  }
  if (!site.indexar) {
    issues.push({
      nivel: "aviso",
      caminho: "src/lib/site.ts indexar",
      mensagem: "As páginas saem com noindex e o robots.txt bloqueia tudo. Vale se a decisão for publicar sem indexação.",
    });
  }
  if (!contexto.licenca) {
    issues.push({
      nivel: "aviso",
      caminho: "LICENSE",
      mensagem: "Sem arquivo de licença, o código fica com todos os direitos reservados. A licença do código e os créditos das mídias são decisões do responsável pelo projeto.",
    });
  }

  return issues;
}

/** Nada bloqueia a release (avisos não contam). */
export function isReleasable(issues: readonly ReleaseIssue[]): boolean {
  return issues.every((issue) => issue.nivel !== "bloqueia");
}
