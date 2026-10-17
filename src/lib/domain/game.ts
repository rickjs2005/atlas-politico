// Taxonomias do conteúdo educativo do jogo (docs/GAME-TRAIL.md, D-134): as
// salas em que uma fase pode estar, os tipos de fato biográfico e os tipos de
// registro que uma fase pode apontar. Só constantes e rótulos, sem Zod: o
// navegador os importa para escrever as telas.

/**
 * As salas do jogo. `historico` é a trajetória, da origem à data de corte;
 * `economia` e `seguranca-publica` são aprofundamentos sobre decisões
 * documentadas de um assunto; `investigacao` é a missão de investigação
 * documental ("O documento diz o quê?", D-151). Os identificadores estão nos
 * endereços (`/jogo/<pessoa>/<sala>/`).
 */
export const SALAS_DO_JOGO = ["historico", "economia", "seguranca-publica", "investigacao"] as const;
export type SalaDoJogo = (typeof SALAS_DO_JOGO)[number];

/**
 * Os cinco campos de um documento que a missão de investigação pede para
 * ler (D-151): a data, a instituição, o cargo pelo qual a pessoa agiu, o
 * objeto (o que foi votado, o ato, a matéria) e a ação (a manifestação, o
 * tipo do ato, a autoria ou a relatoria). São os campos do cartão de decisão
 * do atlas, e não uma classificação nova.
 */
export const CAMPOS_DO_DOCUMENTO = ["data", "instituicao", "cargo", "objeto", "acao"] as const;
export type CampoDoDocumento = (typeof CAMPOS_DO_DOCUMENTO)[number];

export const CAMPO_LABELS: Record<CampoDoDocumento, string> = {
  data: "Data",
  instituicao: "Instituição",
  cargo: "Cargo",
  objeto: "Objeto",
  acao: "Ação",
};

/** O que um fato biográfico registra. Não é categoria da linha do tempo: esses fatos são anteriores à vida pública, ou paralelos a ela. */
export const TIPOS_DE_FATO_BIOGRAFICO = ["nascimento", "familia", "migracao", "formacao", "trabalho", "atuacao-sindical", "outro"] as const;
export type TipoDeFatoBiografico = (typeof TIPOS_DE_FATO_BIOGRAFICO)[number];

export const TIPO_DE_FATO_LABELS: Record<TipoDeFatoBiografico, string> = {
  nascimento: "Nascimento",
  familia: "Família",
  migracao: "Mudança de cidade",
  formacao: "Formação",
  trabalho: "Trabalho",
  "atuacao-sindical": "Atuação sindical",
  outro: "Outro registro biográfico",
};

/**
 * O que uma fase pode apontar. `decisao` é um voto, um ato do Executivo ou
 * uma atuação legislativa (autoria ou relatoria), pelo identificador;
 * `proposta` é uma frase do documento que a candidatura
 * registrou na Justiça Eleitoral, e não algo que a pessoa fez; `conceito` é
 * a definição de um termo, e não um fato sobre a pessoa.
 */
export const TIPOS_DE_REFERENCIA_DE_FASE = ["acontecimento", "decisao", "fato", "mandato", "filiacao", "proposta", "conceito"] as const;
export type TipoDeReferenciaDeFase = (typeof TIPOS_DE_REFERENCIA_DE_FASE)[number];

/** Limites de tamanho do texto de uma fase, conferidos no contrato: o jogo é para leitura curta. */
export const LIMITES_DA_FASE = {
  /** Blocos de explicação por fase. */
  blocos: 4,
  /** Palavras na explicação inteira: o teto da meta de redação, que é de 60 a 100. O piso é conferido no conteúdo publicado, por teste. */
  palavrasDaExplicacao: 100,
  /** O piso da meta de redação: abaixo disso, a explicação não dá o contexto. */
  palavrasMinimasDaExplicacao: 60,
  /** Palavras no enunciado da atividade. */
  palavrasDoEnunciado: 40,
  /** Palavras em cada opção. */
  palavrasDaOpcao: 24,
  /** Palavras na definição de um conceito. */
  palavrasDoConceito: 45,
  /** Palavras no texto de uma proposta eleitoral: uma frase, e não um parágrafo. */
  palavrasDaProposta: 45,
  /** Fichas de um dossiê, no mínimo e no máximo: a missão é curta (D-151). */
  fichasMinimasDoDossie: 2,
  fichasDoDossie: 4,
  /** Documentos na gaveta de um dossiê (evidências e distratores): cabem em uma tela de celular, um por linha. */
  documentosDoDossie: 8,
  /** Palavras em uma ficha: uma frase, que resume um documento. */
  palavrasDaFicha: 30,
} as const;

/** Como começa o texto de toda proposta eleitoral: quem propõe é o documento registrado, e proposta não é ato nem resultado. */
export const INICIO_DA_PROPOSTA = "O documento ";

/** Quantas palavras tem um texto, para os limites acima. */
export function countWords(texto: string): number {
  return texto.trim().split(/\s+/).filter((palavra) => palavra.length > 0).length;
}
