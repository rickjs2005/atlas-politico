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

  // As decisões da pessoa: votos e atos dela, com as votações e as proposições
  // que eles citam, a cobertura da pesquisa e as identidades institucionais.
  const votos = conjunto.votos.filter((item) => item.pessoaId === pessoaId);
  const atosExecutivos = conjunto.atosExecutivos.filter((item) => item.atribuicao.pessoaId === pessoaId);
  const coberturaPolitica = conjunto.coberturaPolitica.filter((item) => item.pessoaId === pessoaId);
  const identidadesInstitucionais = conjunto.identidadesInstitucionais.filter((item) => item.pessoaId === pessoaId);
  const votacaoIds = new Set(votos.map((item) => item.votacaoId));
  const votacoes = conjunto.votacoes.filter((item) => votacaoIds.has(item.id));
  const proposicaoIds = new Set([...votacoes.map((item) => item.proposicaoId), ...atosExecutivos.flatMap((item) => item.proposicaoIds)]);
  const proposicoes = conjunto.proposicoes.filter((item) => proposicaoIds.has(item.id));

  // Um acontecimento compartilhado cita a outra pessoa: o nome dela precisa
  // continuar disponível, sem os registros dela.
  const pessoaIds = new Set([pessoaId, ...acontecimentos.flatMap((item) => item.pessoaIds)]);
  const pessoas = conjunto.pessoas.filter((pessoa) => pessoaIds.has(pessoa.id));
  const principal = pessoas.filter((pessoa) => pessoa.id === pessoaId);

  const fonteIds = new Set([
    ...[...principal, ...mandatos, ...filiacoes, ...acontecimentos, ...proposicoes, ...votacoes, ...votos, ...atosExecutivos, ...coberturaPolitica, ...identidadesInstitucionais].flatMap(
      (registro) => registro.fontes.map((citacao) => citacao.fonteId),
    ),
    ...votacoes.flatMap((item) => (item.objeto.textoReferencia === null ? [] : [item.objeto.textoReferencia.fonteId])),
    ...atosExecutivos.map((item) => item.atoOficial.fonteId),
  ]);
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
    proposicoes,
    votacoes,
    votos,
    atosExecutivos,
    coberturaPolitica,
    identidadesInstitucionais,
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
