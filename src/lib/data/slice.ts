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
  const atuacoesLegislativas = conjunto.atuacoesLegislativas.filter((item) => item.pessoaId === pessoaId);
  const coberturaPolitica = conjunto.coberturaPolitica.filter((item) => item.pessoaId === pessoaId);
  const identidadesInstitucionais = conjunto.identidadesInstitucionais.filter((item) => item.pessoaId === pessoaId);
  // As propostas do documento que a candidatura dela registrou.
  const propostasEleitorais = conjunto.propostasEleitorais.filter((item) => item.pessoaId === pessoaId);
  // O conteúdo educativo da pessoa: os fatos biográficos e as fases dela, com os conceitos que as fases definem.
  const fatosBiograficos = conjunto.fatosBiograficos.filter((item) => item.pessoaId === pessoaId);
  const fasesDoJogo = conjunto.fasesDoJogo.filter((item) => item.pessoaId === pessoaId);
  const conceitoIds = new Set(fasesDoJogo.flatMap((fase) => [...fase.conceitos, ...fase.explicacao.flatMap((bloco) => bloco.referencias.filter((ref) => ref.tipo === "conceito").map((ref) => ref.id))]));
  const conceitos = conjunto.conceitos.filter((item) => conceitoIds.has(item.id));
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
    ...[...principal, ...mandatos, ...filiacoes, ...acontecimentos, ...proposicoes, ...votacoes, ...votos, ...atosExecutivos, ...atuacoesLegislativas, ...coberturaPolitica, ...identidadesInstitucionais, ...propostasEleitorais, ...fatosBiograficos, ...conceitos].flatMap(
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
    atuacoesLegislativas,
    coberturaPolitica,
    identidadesInstitucionais,
    propostasEleitorais,
    fatosBiograficos,
    conceitos,
    fasesDoJogo,
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
