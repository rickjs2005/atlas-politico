// O recorte dos dados que a página do jogo entrega ao navegador: o
// personagem, os capítulos e só os registros que eles citam, já com título,
// data, resumo, fontes resolvidas e a situação da revisão. Função pura sobre
// `AtlasData`.

import { findEventById, findPersonBySlug } from "@/lib/data/queries";
import type { AtlasData } from "@/lib/data/types";
import { lookup } from "@/lib/data/lookup";
import { findUndeterminedOrder } from "@/lib/domain/order";
import type { Editorial } from "@/lib/domain/types";

import { chaptersOf } from "./chapters";
import type { GameContent, GameRecord, PersonagemSlug } from "./types";

/** A situação da revisão sem as observações internas, que a nota do registro não mostra. */
function reviewOf(editorial: Editorial): Editorial {
  if (editorial.estado !== "revisado") return { estado: editorial.estado };
  const { tipo, revisadoPor, revisadoEm } = editorial.revisao;
  return { estado: "revisado", revisao: { tipo, revisadoPor, revisadoEm } };
}

export function buildGameContent(data: AtlasData, personagem: PersonagemSlug): GameContent | null {
  const pessoa = findPersonBySlug(data, personagem);
  if (pessoa === null) return null;

  const capitulos = chaptersOf(personagem);
  const registros: Record<string, GameRecord> = {};
  for (const capitulo of capitulos) {
    for (const eventId of capitulo.eventIds) {
      if (registros[eventId] !== undefined) continue;
      const acontecimento = findEventById(data, eventId);
      if (acontecimento === null) continue;
      registros[eventId] = {
        id: acontecimento.id,
        slug: acontecimento.slug,
        titulo: acontecimento.titulo,
        data: acontecimento.data,
        categoria: acontecimento.categoria,
        resumo: acontecimento.resumo,
        fontes: acontecimento.fontes.flatMap((citacao) => {
          const posicao = lookup(data.indices.fontes.porId, citacao.fonteId);
          const fonte = posicao === undefined ? undefined : data.conjunto.fontes[posicao];
          return fonte === undefined ? [] : [{ titulo: fonte.titulo, autoria: fonte.autoria, url: fonte.url }];
        }),
        editorial: reviewOf(acontecimento.editorial),
        ordemEmAberto: false,
      };
    }
  }

  // O mesmo aviso da lista do atlas: quando a data de um registro não decide
  // a posição dele em relação a outro, o registro leva a marca.
  for (const id of findUndeterminedOrder(Object.values(registros))) {
    const registro = registros[id];
    if (registro !== undefined) registros[id] = { ...registro, ordemEmAberto: true };
  }

  return { personagem: { slug: personagem, nome: pessoa.nome }, capitulos, registros };
}

/** Os capítulos cujos registros existem todos no conteúdo. */
export function playableChapters(content: GameContent) {
  return content.capitulos.filter((capitulo) => capitulo.eventIds.every((id) => content.registros[id] !== undefined));
}

/** Quantos capítulos de um personagem os registros publicados já permitem jogar. */
export function countPlayableChapters(data: AtlasData, personagem: PersonagemSlug): number {
  const content = buildGameContent(data, personagem);
  return content === null ? 0 : playableChapters(content).length;
}
