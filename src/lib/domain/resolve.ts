// Monta a visão de leitura de um acontecimento a partir dos registros
// normalizados. Função pura: serve à página estática do acontecimento (build)
// e ao painel da exploração (navegador).

import type { Acontecimento, Citacao, Conjunto, Fonte, Lugar, Pessoa } from "./schemas";

export type EventContext = Pick<Conjunto, "pessoas" | "lugares" | "fontes">;

export interface AcontecimentoResolvido {
  acontecimento: Acontecimento;
  pessoas: Pessoa[];
  lugares: Lugar[];
  citacoes: { citacao: Citacao; fonte: Fonte }[];
}

function isDefined<T>(valor: T | undefined): valor is T {
  return valor !== undefined;
}

export function resolveEvent(
  acontecimento: Acontecimento,
  contexto: EventContext,
): AcontecimentoResolvido {
  const { localizacao } = acontecimento;
  const lugarIds = localizacao.tipo === "lugares" ? localizacao.lugarIds : [];

  return {
    acontecimento,
    pessoas: acontecimento.pessoaIds
      .map((id) => contexto.pessoas.find((pessoa) => pessoa.id === id))
      .filter(isDefined),
    lugares: lugarIds
      .map((id) => contexto.lugares.find((lugar) => lugar.id === id))
      .filter(isDefined),
    citacoes: acontecimento.fontes
      .map((citacao) => {
        const fonte = contexto.fontes.find((item) => item.id === citacao.fonteId);
        return fonte ? { citacao, fonte } : undefined;
      })
      .filter(isDefined),
  };
}
