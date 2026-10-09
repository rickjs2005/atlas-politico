// Recorte dos dados para a página de uma pessoa: só o que a trajetória dela
// usa. A página de um perfil não carrega os registros do outro.
//
// O resultado tem o mesmo formato (`AtlasData`), com os índices e os pontos
// refeitos sobre o recorte, e serve às mesmas consultas.

import { buildIndexes } from "./indexes";
import { filterPoints } from "./points";
import type { AtlasData } from "./types";

export function sliceForPerson(data: AtlasData, pessoaId: string): AtlasData {
  const { conjunto } = data;
  const acontecimentos = conjunto.acontecimentos.filter((item) => item.pessoaIds.includes(pessoaId));
  const mandatos = conjunto.mandatos.filter((item) => item.pessoaId === pessoaId);
  const filiacoes = conjunto.filiacoes.filter((item) => item.pessoaId === pessoaId);

  // Um acontecimento compartilhado cita a outra pessoa: o nome dela precisa
  // continuar disponível, sem os registros dela.
  const pessoaIds = new Set([pessoaId, ...acontecimentos.flatMap((item) => item.pessoaIds)]);
  const pessoas = conjunto.pessoas.filter((pessoa) => pessoaIds.has(pessoa.id));
  const principal = pessoas.filter((pessoa) => pessoa.id === pessoaId);

  const fonteIds = new Set(
    [...principal, ...mandatos, ...filiacoes, ...acontecimentos].flatMap((registro) =>
      registro.fontes.map((citacao) => citacao.fonteId),
    ),
  );
  const lugarIds = new Set(
    acontecimentos.flatMap((item) =>
      item.localizacao.tipo === "lugares" ? item.localizacao.lugarIds : [],
    ),
  );
  const imagemIds = new Set(
    [...pessoas.map((pessoa) => pessoa.retratoId), ...acontecimentos.map((item) => item.imagemId)].filter(
      (id): id is string => id !== null,
    ),
  );

  const recorte = {
    edicao:
      conjunto.edicao === null
        ? null
        : {
            ...conjunto.edicao,
            cobertura: conjunto.edicao.cobertura.filter((item) => item.pessoaId === pessoaId),
          },
    pessoas,
    mandatos,
    filiacoes,
    acontecimentos,
    lugares: conjunto.lugares.filter((lugar) => lugarIds.has(lugar.id)),
    fontes: conjunto.fontes.filter((fonte) => fonteIds.has(fonte.id)),
    imagens: conjunto.imagens.filter((imagem) => imagemIds.has(imagem.id)),
  };

  return {
    conjunto: recorte,
    indices: buildIndexes(recorte),
    pontos: filterPoints(data.pontos, acontecimentos),
  };
}
