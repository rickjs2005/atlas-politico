// O conteúdo da Praça do Mural, montado no build a partir de `AtlasData`
// (docs/PRACA.md, D-153): os documentos das gavetas são as decisões já
// publicadas das duas pessoas, por pessoa, instituição e ano; os recortes da
// banca são os acontecimentos. Nada é escrito aqui: os textos são os do
// conjunto, e as pautas e as conversas vêm de praca.ts, marcadas como ficção.

import { listDecisionViews } from "@/lib/data/decisions";
import { findPersonBySlug } from "@/lib/data/queries";
import type { AtlasData } from "@/lib/data/types";
import { yearOf } from "@/lib/domain/dates";
import { INSTITUICAO_LABELS } from "@/lib/domain/decisions";
import { PROFILES } from "@/lib/domain/profiles";
import type { PersonagemSlug } from "@/lib/game/types";

import { MATERIAS, PAUTAS, SESSOES } from "./praca";
import type { ConteudoDaPraca, Documento, Gaveta, Recorte } from "./tipos";

/** A instituição vira o rótulo curto da gaveta. */
const ROTULO: Record<string, string> = {
  "presidencia-da-republica": "Planalto",
  "senado-federal": "Senado",
  "congresso-nacional": "Congresso",
  alerj: "Alerj",
  "camara-dos-deputados": "Câmara",
  "assembleia-nacional-constituinte": "Constituinte",
};

/** As gavetas do Senado pedem a chave; as outras abrem direto. */
function precisaDe(instituicao: string): Gaveta["precisa"] {
  return instituicao === "senado-federal" ? "chave-senado" : null;
}

export function buildPracaContent(data: AtlasData): ConteudoDaPraca {
  const documentos: Record<string, Documento> = {};
  const gavetas: Gaveta[] = [];
  const pessoas = {} as ConteudoDaPraca["pessoas"];
  for (const perfil of PROFILES) {
    const pessoa = findPersonBySlug(data, perfil.slug);
    if (pessoa === null) continue;
    pessoas[perfil.slug] = { nome: pessoa.nome };
    const porGaveta = new Map<string, Documento[]>();
    for (const decisao of listDecisionViews(data, pessoa.id)) {
      documentos[decisao.id] = decisao;
      const chave = `${decisao.instituicao}:${yearOf(decisao.data)}`;
      porGaveta.set(chave, [...(porGaveta.get(chave) ?? []), decisao]);
    }
    for (const [chave, lista] of [...porGaveta.entries()].sort(([a], [b]) => (a < b ? -1 : 1))) {
      const [instituicao, ano] = chave.split(":") as [string, string];
      gavetas.push({
        id: `${ROTULO[instituicao]?.toLowerCase().replace("â", "a") ?? instituicao}-${ano}`.replace(/\s+/g, "-"),
        pessoa: perfil.slug,
        rotulo: `${ROTULO[instituicao] ?? INSTITUICAO_LABELS[instituicao as keyof typeof INSTITUICAO_LABELS]} · ${ano}`,
        ano: Number(ano),
        precisa: precisaDe(instituicao),
        documentos: lista.map((doc) => doc.id),
      });
    }
  }
  const recortes: Recorte[] = data.conjunto.acontecimentos
    .map((acontecimento): Recorte => {
      const slugs = acontecimento.pessoaIds.flatMap((id) => PROFILES.filter((perfil) => findPersonBySlug(data, perfil.slug)?.id === id).map((perfil) => perfil.slug));
      return {
        id: acontecimento.id,
        slug: acontecimento.slug,
        pessoa: slugs.length === 1 ? (slugs[0] as PersonagemSlug) : "ambas",
        titulo: acontecimento.titulo,
        data: acontecimento.data,
      };
    })
    .sort((a, b) => (a.data.valor < b.data.valor ? -1 : a.data.valor > b.data.valor ? 1 : 0));
  // As pautas e as matérias só entram com os documentos que apontam publicados; as sessões seguem o roteiro escrito.
  const pautas = PAUTAS.filter((pauta) => documentos[pauta.resposta] !== undefined);
  const materias = MATERIAS.filter((materia) => materia.lados.every((lado) => documentos[lado.documento] !== undefined));
  return {
    pessoas,
    documentos,
    gavetas,
    recortes,
    sessoes: SESSOES,
    pautas,
    materias,
  };
}
