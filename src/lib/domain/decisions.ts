// Taxonomias das decisões políticas (docs/DATA_MODEL.md, seção Decisões):
// temas, instituições, provedores de dados abertos, objetos votados, estados
// de voto e tipos de ato do Executivo. Só constantes e rótulos, sem Zod: o
// navegador os importa para escrever as telas. Os identificadores vão no
// conteúdo; os rótulos são texto de interface.
//
// Três naturezas que o modelo não confunde:
//   voto parlamentar   manifestação individual em uma votação identificada;
//   ato do Executivo   sanção, veto, medida provisória, decreto, iniciativa;
//   participação       autoria e relatoria, que não são votos (fora do modelo
//                      nesta entrega; entram como entidade própria se a
//                      experiência exigir).

/** Os temas da comparação por assunto. Classificar é decisão editorial, a justificar no registro. */
export const TEMAS = [
  "economia",
  "seguranca-publica",
  "saude",
  "educacao",
  "reforma-do-estado",
  "meio-ambiente",
  "direitos-das-mulheres",
] as const;
export type Tema = (typeof TEMAS)[number];

export const TEMA_LABELS: Record<Tema, string> = {
  economia: "Economia",
  "seguranca-publica": "Segurança pública",
  saude: "Saúde",
  educacao: "Educação",
  "reforma-do-estado": "Reforma do Estado",
  "meio-ambiente": "Meio ambiente",
  "direitos-das-mulheres": "Direitos das mulheres",
};

/** A cobertura da pesquisa também pode ser declarada para o conjunto dos temas. */
export const TEMAS_DE_COBERTURA = [...TEMAS, "geral"] as const;
export type TemaDeCobertura = (typeof TEMAS_DE_COBERTURA)[number];

/** As casas e órgãos em que uma decisão acontece. A Constituinte é separada da Câmara de propósito. */
export const INSTITUICOES = [
  "camara-dos-deputados",
  "senado-federal",
  "congresso-nacional",
  "assembleia-nacional-constituinte",
  "alerj",
  "presidencia-da-republica",
] as const;
export type Instituicao = (typeof INSTITUICOES)[number];

export const INSTITUICAO_LABELS: Record<Instituicao, string> = {
  "camara-dos-deputados": "Câmara dos Deputados",
  "senado-federal": "Senado Federal",
  "congresso-nacional": "Congresso Nacional",
  "assembleia-nacional-constituinte": "Assembleia Nacional Constituinte",
  alerj: "Assembleia Legislativa do Estado do Rio de Janeiro",
  "presidencia-da-republica": "Presidência da República",
};

export const JURISDICOES = ["federal", "estadual"] as const;
export type Jurisdicao = (typeof JURISDICOES)[number];

/** De onde vêm identificadores externos e capturas. */
export const PROVEDORES = ["camara", "senado", "congresso", "alerj", "planalto", "outro"] as const;
export type Provedor = (typeof PROVEDORES)[number];

export const PROVEDOR_LABELS: Record<Provedor, string> = {
  camara: "Dados Abertos da Câmara dos Deputados",
  senado: "Dados Abertos do Senado Federal",
  congresso: "Congresso Nacional",
  alerj: "Acervo legislativo da Alerj",
  planalto: "Portal da Legislação (Planalto)",
  outro: "Outro acervo",
};

export const MODALIDADES_DE_VOTACAO = ["nominal", "simbolica", "secreta"] as const;
export type ModalidadeDeVotacao = (typeof MODALIDADES_DE_VOTACAO)[number];

export const MODALIDADE_LABELS: Record<ModalidadeDeVotacao, string> = {
  nominal: "Votação nominal",
  simbolica: "Votação simbólica",
  secreta: "Votação secreta",
};

/** O que foi posto em votação. "FAVOR" é favorável a este objeto, e não ao projeto inteiro nem a um tema. */
export const OBJETOS_VOTADOS = ["texto-principal", "substitutivo", "emenda", "destaque", "requerimento", "outro"] as const;
export type ObjetoVotado = (typeof OBJETOS_VOTADOS)[number];

export const OBJETO_LABELS: Record<ObjetoVotado, string> = {
  "texto-principal": "Texto principal",
  substitutivo: "Substitutivo",
  emenda: "Emenda",
  destaque: "Destaque",
  requerimento: "Requerimento",
  outro: "Outro objeto",
};

export const RESULTADOS_DE_VOTACAO = ["aprovado", "rejeitado", "prejudicado", "retirado", "outro"] as const;
export type ResultadoDeVotacao = (typeof RESULTADOS_DE_VOTACAO)[number];

export const RESULTADO_LABELS: Record<ResultadoDeVotacao, string> = {
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
  prejudicado: "Prejudicado",
  retirado: "Retirado",
  outro: "Outro resultado",
};

/** A manifestação individual registrada. `OUTRO` guarda o valor original e vai à revisão. */
export const POSICOES_DE_VOTO = ["FAVOR", "CONTRA", "ABSTENCAO", "OBSTRUCAO", "OUTRO"] as const;
export type PosicaoDeVoto = (typeof POSICOES_DE_VOTO)[number];

export const POSICAO_LABELS: Record<PosicaoDeVoto, string> = {
  FAVOR: "A favor",
  CONTRA: "Contra",
  ABSTENCAO: "Abstenção",
  OBSTRUCAO: "Obstrução",
  OUTRO: "Outro registro",
};

/** Os tipos de registro individual: só com documento. A falta de uma linha no acervo não vira ausência. */
export const TIPOS_DE_REGISTRO_INDIVIDUAL = ["voto-individual", "ausencia-documentada", "nao-votou-documentado"] as const;
export type TipoDeRegistroIndividual = (typeof TIPOS_DE_REGISTRO_INDIVIDUAL)[number];

export const REGISTRO_INDIVIDUAL_LABELS: Record<TipoDeRegistroIndividual, string> = {
  "voto-individual": "Voto individual",
  "ausencia-documentada": "Ausência documentada",
  "nao-votou-documentado": "Não votou, com motivo documentado",
};

/** Cada tipo de ato tem campos próprios no contrato. Não existe "voto presidencial" nem "sanção de PEC". */
export const TIPOS_DE_ATO = [
  "sancao-expressa",
  "sancao-tacita",
  "veto-total",
  "veto-parcial",
  "medida-provisoria",
  "decreto",
  "iniciativa",
] as const;
export type TipoDeAto = (typeof TIPOS_DE_ATO)[number];

export const TIPO_DE_ATO_LABELS: Record<TipoDeAto, string> = {
  "sancao-expressa": "Sanção expressa",
  "sancao-tacita": "Sanção tácita",
  "veto-total": "Veto total",
  "veto-parcial": "Veto parcial",
  "medida-provisoria": "Edição de medida provisória",
  decreto: "Decreto",
  iniciativa: "Iniciativa de proposição",
};

export const ESTADOS_DE_COBERTURA = ["completa", "parcial", "pendente"] as const;
export type EstadoDeCobertura = (typeof ESTADOS_DE_COBERTURA)[number];

export const ESTADO_DE_COBERTURA_LABELS: Record<EstadoDeCobertura, string> = {
  completa: "Pesquisa completa no recorte declarado",
  parcial: "Pesquisa parcial",
  pendente: "Pesquisa pendente",
};

/**
 * O resultado da consulta comparativa para uma pessoa em uma votação
 * (src/lib/data/participation.ts). É discriminado de propósito: nem booleano
 * nem `null` com vários sentidos.
 */
export const PARTICIPACOES = [
  "registro",
  "nao-se-aplica",
  "sem-registro-individual",
  "competencia-nao-confirmada",
  "pesquisa-pendente",
] as const;
export type TipoDeParticipacao = (typeof PARTICIPACOES)[number];

export const PARTICIPACAO_LABELS: Record<TipoDeParticipacao, string> = {
  registro: "Registro individual",
  "nao-se-aplica": "Não se aplica",
  "sem-registro-individual": "Sem registro individual",
  "competencia-nao-confirmada": "Competência não confirmada",
  "pesquisa-pendente": "Pesquisa pendente",
};

/** O que cada situação sem voto significa, nas palavras que a interface usa. Nenhuma delas é juízo sobre a pessoa. */
export const PARTICIPACAO_EXPLICACOES: Record<Exclude<TipoDeParticipacao, "registro">, string> = {
  "nao-se-aplica": "Nesta decisão, a pessoa não ocupava o cargo que participava da votação.",
  "sem-registro-individual": "Não há voto individual confirmado no material deste recorte. Isso não prova ausência.",
  "competencia-nao-confirmada": "As datas documentadas do mandato não bastam para dizer se a pessoa podia participar desta decisão.",
  "pesquisa-pendente": "A pesquisa deste recorte ainda não foi concluída: a falta de registro é uma limitação do conjunto, e não uma conclusão sobre a pessoa.",
};

export function isTema(valor: string): valor is Tema {
  return (TEMAS as readonly string[]).includes(valor);
}

export function isInstituicao(valor: string): valor is Instituicao {
  return (INSTITUICOES as readonly string[]).includes(valor);
}
