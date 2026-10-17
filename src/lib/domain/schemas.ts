// Contratos de conteúdo. Cada schema valida um registro isolado; o que
// depende de outros registros (ids únicos, referências, data de corte) fica em
// `integrity.ts`.
//
// Este módulo importa o Zod e por isso só deve rodar no build, em scripts e em
// testes. Componentes do navegador importam os tipos por `./types`.

import { z } from "zod";

import { CATEGORIAS } from "./categories";
import {
  PRECISOES,
  YEAR_BOUNDS,
  analyzeDate,
  findPeriodProblem,
  type DataHistorica,
} from "./dates";
import {
  DESFECHOS_DE_ATUACAO,
  ESTADOS_DE_COBERTURA,
  INSTITUICOES,
  JURISDICOES,
  MODALIDADES_DE_VOTACAO,
  OBJETOS_VOTADOS,
  POSICOES_DE_VOTO,
  PROVEDORES,
  RESULTADOS_DE_VOTACAO,
  TEMAS,
  TEMAS_DE_COBERTURA,
  TIPOS_DE_ATUACAO,
} from "./decisions";
import { CAMPOS_DO_DOCUMENTO, INICIO_DA_PROPOSTA, LIMITES_DA_FASE, SALAS_DO_JOGO, TIPOS_DE_FATO_BIOGRAFICO, TIPOS_DE_REFERENCIA_DE_FASE, countWords } from "./game";
import { PRECISOES_GEOGRAFICAS, isInsideBrazilBox } from "./geo";

// Mensagens do próprio Zod em português, para quem lê o erro de validação.
z.config(z.locales.pt());

// Os casos mais comuns em conteúdo editado à mão ganham um motivo direto. O
// que não está aqui segue com a mensagem do idioma.
z.config({
  customError: (issue) => {
    const { code, input } = issue;
    if (code === "invalid_type") {
      if (input === undefined) return "Campo obrigatório ausente.";
      if (typeof input === "number" && !Number.isFinite(input)) {
        return "Número inválido: precisa ser um valor finito.";
      }
    }
    if (code === "unrecognized_keys") {
      return `Campo desconhecido: ${issue.keys.map((chave) => `"${chave}"`).join(", ")}. Confira o nome do campo.`;
    }
    if (code === "invalid_value") {
      return `Valor não aceito. Use um destes: ${issue.values.map(String).join(", ")}.`;
    }
    if (code === "invalid_union" && typeof issue.discriminator === "string") {
      return `Valor não aceito no campo "${issue.discriminator}".`;
    }
    if (code === "too_small" && issue.origin === "array") {
      return `A lista precisa de ao menos ${String(issue.minimum)} item.`;
    }
    if (code === "too_small" && issue.origin === "number") {
      return `Valor abaixo do mínimo (${String(issue.minimum)}).`;
    }
    if (code === "too_big" && issue.origin === "number") {
      return `Valor acima do máximo (${String(issue.maximum)}).`;
    }
    return undefined;
  },
});

const KEBAB_CASE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const texto = z.string().regex(/\S/, "O campo não pode ficar vazio.");
const idSchema = z
  .string()
  .regex(KEBAB_CASE, "Use minúsculas, números e hífens (ex.: posse-2003).");
const urlSchema = z.url({ protocol: /^https?$/ });

function reportInvalidDate(data: DataHistorica, ctx: z.RefinementCtx) {
  const analise = analyzeDate(data);
  if (!analise.ok) {
    ctx.addIssue({ code: "custom", message: analise.motivo, path: ["valor"] });
  }
}

// ---------------------------------------------------------------------------
// Datas e períodos
// ---------------------------------------------------------------------------

export const dataHistoricaSchema = z
  .strictObject({ valor: z.string(), precisao: z.enum(PRECISOES) })
  .superRefine(reportInvalidDate);

/** Data de calendário completa (`AAAA-MM-DD`), usada em acessos e revisões. */
const dataCompletaSchema = z.string().superRefine((valor, ctx) => {
  const analise = analyzeDate({ valor, precisao: "dia" });
  if (!analise.ok) ctx.addIssue({ code: "custom", message: analise.motivo });
});

const limiteDeDataSchema = z
  .strictObject({
    tipo: z.literal("data"),
    valor: z.string(),
    precisao: z.enum(PRECISOES),
  })
  .superRefine(reportInvalidDate);

// "Não sabemos" é um valor do modelo, diferente de campo ausente.
const limiteDesconhecidoSchema = z.strictObject({ tipo: z.literal("desconhecida") });
const limiteEmCursoSchema = z.strictObject({ tipo: z.literal("em-curso") });

const dataOuDesconhecidaSchema = z.discriminatedUnion("tipo", [
  limiteDeDataSchema,
  limiteDesconhecidoSchema,
]);

export const periodoSchema = z
  .strictObject({
    inicio: dataOuDesconhecidaSchema,
    fim: z.discriminatedUnion("tipo", [
      limiteDeDataSchema,
      limiteDesconhecidoSchema,
      limiteEmCursoSchema,
    ]),
  })
  .superRefine((periodo, ctx) => {
    const problema = findPeriodProblem(periodo);
    if (problema) ctx.addIssue({ code: "custom", message: problema, path: ["fim"] });
  });

// ---------------------------------------------------------------------------
// Evidência e estado editorial
// ---------------------------------------------------------------------------

/**
 * Liga um registro a uma fonte e diz onde, nela, está a evidência. A fonte é o
 * documento; a citação é o uso que um registro faz dele. O mesmo documento pode
 * sustentar vários registros com trechos diferentes.
 */
export const citacaoSchema = z.strictObject({
  fonteId: idSchema,
  /** Onde olhar no documento: seção, página, parágrafo, minuto. */
  localizacao: texto,
  /** O que esse trecho sustenta no registro. */
  evidencia: texto,
});

/**
 * Quem conferiu o registro contra as fontes. `assistida-por-ia` é a
 * conferência feita por um modelo de IA; `humana` só é usada quando uma pessoa
 * de fato revisou. O tipo é obrigatório para as duas nunca se confundirem.
 */
export const TIPOS_DE_REVISAO = ["assistida-por-ia", "humana"] as const;

const revisaoSchema = z.strictObject({
  tipo: z.enum(TIPOS_DE_REVISAO),
  revisadoPor: texto,
  revisadoEm: dataCompletaSchema,
  observacoes: texto.optional(),
});

export const editorialSchema = z.discriminatedUnion("estado", [
  z.strictObject({
    estado: z.literal("rascunho"),
    pendencias: z.array(texto).optional(),
  }),
  z.strictObject({
    estado: z.literal("em-revisao"),
    pendencias: z.array(texto).optional(),
  }),
  z.strictObject({ estado: z.literal("revisado"), revisao: revisaoSchema }),
]);

type RegistroFactual = {
  editorial: z.infer<typeof editorialSchema>;
  fontes: z.infer<typeof citacaoSchema>[];
};

function requireEvidenceWhenReviewed(registro: RegistroFactual, ctx: z.RefinementCtx) {
  if (registro.editorial.estado === "revisado" && registro.fontes.length === 0) {
    ctx.addIssue({
      code: "custom",
      message: "Registro revisado precisa de ao menos uma fonte com evidência identificada.",
      path: ["fontes"],
    });
  }
}

// ---------------------------------------------------------------------------
// Registros de referência: fonte, lugar, imagem
// ---------------------------------------------------------------------------

export const fonteSchema = z.strictObject({
  id: idSchema,
  titulo: texto,
  /** Autor ou instituição responsável pelo documento. */
  autoria: texto,
  url: urlSchema,
  dataDocumento: dataOuDesconhecidaSchema,
  acessadoEm: dataCompletaSchema,
});

export const lugarSchema = z
  .strictObject({
    id: idSchema,
    nome: texto,
    /** Código ISO 3166-1 alfa-2, em maiúsculas (ex.: BR). */
    pais: z.string().regex(/^[A-Z]{2}$/, "Use o código ISO de duas letras (ex.: BR)."),
    municipio: z
      .strictObject({
        nome: texto,
        uf: z.string().regex(/^[A-Z]{2}$/).optional(),
        codigoIbge: z.string().regex(/^\d{7}$/).optional(),
      })
      .nullable(),
    longitude: z.number().min(-180).max(180),
    latitude: z.number().min(-90).max(90),
    precisaoGeografica: z.enum(PRECISOES_GEOGRAFICAS),
    /** De onde veio a coordenada (base, edição, critério). */
    origemCoordenadas: texto,
  })
  .superRefine((lugar, ctx) => {
    if (lugar.pais === "BR" && !isInsideBrazilBox(lugar)) {
      ctx.addIssue({
        code: "custom",
        message:
          "Coordenada fora do território brasileiro. Confira se longitude e latitude não estão trocadas.",
        path: ["longitude"],
      });
    }
  });

export const imagemSchema = z.strictObject({
  id: idSchema,
  /** Caminho público do arquivo, dentro de `public/media/`. */
  arquivo: z
    .string()
    .regex(
      /^\/media\/[a-z0-9/_-]+\.(avif|webp|jpe?g|png|svg)$/,
      "Use um caminho como /media/retratos/nome.webp.",
    ),
  autoria: texto,
  credito: texto,
  /** Página de onde o arquivo foi obtido. */
  origem: urlSchema,
  condicoesDeUso: texto,
  textoAlternativo: texto,
  dimensoes: z
    .strictObject({
      largura: z.number().int().positive(),
      altura: z.number().int().positive(),
    })
    .optional(),
});

// ---------------------------------------------------------------------------
// Registros factuais: pessoa, mandato, filiação, acontecimento
// ---------------------------------------------------------------------------

export const pessoaSchema = z
  .strictObject({
    id: idSchema,
    slug: idSchema,
    nome: texto,
    resumo: texto,
    retratoId: idSchema.nullable(),
    fontes: z.array(citacaoSchema),
    editorial: editorialSchema,
  })
  .superRefine(requireEvidenceWhenReviewed);

export const mandatoSchema = z
  .strictObject({
    id: idSchema,
    pessoaId: idSchema,
    cargo: texto,
    instituicao: texto,
    /**
     * A casa em que o mandato dá competência para votar, pela taxonomia das
     * decisões. Sem ela, a consulta comparativa responde "competência não
     * confirmada" para as votações dessa casa, em vez de deduzir pelo nome.
     */
    casa: z.enum(INSTITUICOES).optional(),
    periodo: periodoSchema,
    fontes: z.array(citacaoSchema),
    editorial: editorialSchema,
  })
  .superRefine(requireEvidenceWhenReviewed);

export const filiacaoSchema = z
  .strictObject({
    id: idSchema,
    pessoaId: idSchema,
    partido: z.strictObject({ sigla: texto, nome: texto }),
    periodo: periodoSchema,
    fontes: z.array(citacaoSchema),
    editorial: editorialSchema,
  })
  .superRefine(requireEvidenceWhenReviewed);

/**
 * Onde o acontecimento se situa. A falta de ponto no mapa é sempre uma
 * afirmação explícita: ou a abrangência é nacional, ou o lugar não está
 * documentado.
 */
export const localizacaoSchema = z.discriminatedUnion("tipo", [
  z.strictObject({ tipo: z.literal("lugares"), lugarIds: z.array(idSchema).min(1) }),
  z.strictObject({ tipo: z.literal("nacional") }),
  z.strictObject({ tipo: z.literal("desconhecida") }),
]);

export const acontecimentoSchema = z
  .strictObject({
    id: idSchema,
    slug: idSchema,
    pessoaIds: z.array(idSchema).min(1),
    titulo: texto,
    data: dataHistoricaSchema,
    categoria: z.enum(CATEGORIAS),
    resumo: texto,
    contexto: texto,
    localizacao: localizacaoSchema,
    imagemId: idSchema.nullable(),
    fontes: z.array(citacaoSchema),
    editorial: editorialSchema,
  })
  .superRefine(requireEvidenceWhenReviewed);

// ---------------------------------------------------------------------------
// Decisões políticas: proposição, votação, voto, ato do Executivo, cobertura
// da pesquisa e identidade institucional (docs/DATA_MODEL.md, seção Decisões)
// ---------------------------------------------------------------------------

/** Identificador do registro em um acervo oficial. A pessoa, a matéria e a votação se resolvem por ele, nunca pelo nome. */
const identidadeExternaSchema = z.strictObject({
  provedor: z.enum(PROVEDORES),
  id: texto,
});

/**
 * Um documento de referência apontado sem citação de trecho: diz qual fonte e
 * onde olhar, e qual captura bruta (pasta de pesquisa, fora do conteúdo) guarda
 * a resposta usada. Diferente de `citacaoSchema`, que também diz o que o
 * trecho sustenta.
 */
const referenciaDocumentalSchema = z.strictObject({
  fonteId: idSchema,
  localizacao: texto,
  capturaId: idSchema.nullable(),
});

function requireDistinctThemes(registro: { temas: readonly string[] }, ctx: z.RefinementCtx) {
  if (new Set(registro.temas).size !== registro.temas.length) {
    ctx.addIssue({ code: "custom", message: "O mesmo tema aparece mais de uma vez.", path: ["temas"] });
  }
}

export const proposicaoSchema = z
  .strictObject({
    id: idSchema,
    instituicao: z.enum(INSTITUICOES),
    jurisdicao: z.enum(JURISDICOES),
    identidadeExterna: identidadeExternaSchema,
    /** A sigla do tipo, como a casa a usa: PL, PEC, PLP, MPV, PDL, REQ, PLV. */
    tipo: texto,
    numero: z.number().int().positive().nullable(),
    ano: z.number().int().min(YEAR_BOUNDS.min).max(YEAR_BOUNDS.max).nullable(),
    ementa: texto,
    /** Classificação temática: decisão editorial, a justificar na revisão. Pode ser mais de um tema. */
    temas: z.array(z.enum(TEMAS)),
    fontes: z.array(citacaoSchema),
    editorial: editorialSchema,
  })
  .superRefine(requireEvidenceWhenReviewed)
  .superRefine(requireDistinctThemes);

const orgaoSchema = z.discriminatedUnion("tipo", [
  z.strictObject({ tipo: z.literal("plenario") }),
  z.strictObject({ tipo: z.literal("comissao"), nome: texto }),
]);

/** O que foi posto em votação: "FAVOR" é favorável a isto, e não ao projeto inteiro. */
const objetoVotadoSchema = z.strictObject({
  tipo: z.enum(OBJETOS_VOTADOS),
  /** Número da emenda, do destaque ou do requerimento, ou a versão do texto, quando existe. */
  identificacao: texto.nullable(),
  descricao: texto,
  /** O documento que diz o que foi votado, quando é outro que o do resultado. */
  textoReferencia: referenciaDocumentalSchema.nullable(),
  /**
   * Uma divergência entre documentos sobre o objeto votado, escrita para quem
   * lê o cartão: o que cada documento diz e o que o atlas adotou. Não corrige
   * a fonte em silêncio nem expõe a observação interna da revisão. `null`
   * quando os documentos concordam.
   */
  divergenciaDocumentada: texto.nullable(),
});

const resultadoOficialSchema = z.strictObject({
  estado: z.enum(RESULTADOS_DE_VOTACAO),
  /** O resultado como o acervo o escreve. */
  valorOriginal: texto,
});

export const votacaoSchema = z
  .strictObject({
    id: idSchema,
    proposicaoId: idSchema,
    instituicao: z.enum(INSTITUICOES),
    orgao: orgaoSchema,
    identidadeExterna: identidadeExternaSchema,
    data: dataHistoricaSchema,
    /** A etapa da tramitação a que a decisão pertence, como a casa a nomeia: "1º turno", "turno único", "requerimento de urgência". */
    etapa: texto,
    objeto: objetoVotadoSchema,
    modalidade: z.enum(MODALIDADES_DE_VOTACAO),
    resultadoOficial: resultadoOficialSchema,
    fontes: z.array(citacaoSchema),
    editorial: editorialSchema,
  })
  .superRefine(requireEvidenceWhenReviewed);

/**
 * O registro individual, só com documento. A falta de uma linha no acervo não
 * produz ausência: "sem registro individual" e "não se aplica" pertencem à
 * consulta comparativa, não a este contrato.
 */
const registroIndividualSchema = z.discriminatedUnion("tipo", [
  z.strictObject({
    tipo: z.literal("voto-individual"),
    posicao: z.enum(POSICOES_DE_VOTO),
    /** O valor como o acervo o escreve (Sim, Não, Abstenção, Obstrução, P-NRV...). */
    valorOriginal: texto,
  }),
  z.strictObject({
    tipo: z.literal("ausencia-documentada"),
    valorOriginal: texto,
    /** Licença, missão oficial ou outro motivo que o documento registra. */
    motivoDocumentado: texto.optional(),
  }),
  z.strictObject({
    tipo: z.literal("nao-votou-documentado"),
    valorOriginal: texto,
    /** Impedimento regimental, presidência da sessão ou situação equivalente, como o documento diz. */
    motivoDocumentado: texto,
  }),
]);

/** De onde o registro veio: provedor, identificador no acervo e a captura bruta usada. */
const provenienciaSchema = z.strictObject({
  provedor: z.enum(PROVEDORES),
  registroExternoId: texto,
  capturaId: idSchema.nullable(),
});

/** Uma linha vigente por pessoa e votação; a retificada fica, apontando a que a substituiu e por quê. */
const situacaoDoVotoSchema = z.discriminatedUnion("tipo", [
  z.strictObject({ tipo: z.literal("vigente") }),
  z.strictObject({ tipo: z.literal("retificado"), substituidoPor: idSchema, motivo: texto }),
]);

export const votoSchema = z
  .strictObject({
    id: idSchema,
    votacaoId: idSchema,
    pessoaId: idSchema,
    /** O mandato pelo qual a pessoa participou: é o que dá a competência. */
    mandatoId: idSchema,
    registro: registroIndividualSchema,
    proveniencia: provenienciaSchema,
    situacao: situacaoDoVotoSchema,
    fontes: z.array(citacaoSchema),
    editorial: editorialSchema,
  })
  .superRefine(requireEvidenceWhenReviewed);

/** Quem praticou o ato, pelo documento. Um ato ocorrido durante um governo pode ter outro signatário. */
const atribuicaoSchema = z.strictObject({
  tipo: z.literal("autor-documentado"),
  pessoaId: idSchema,
  mandatoId: idSchema,
});

const atoOficialSchema = z.strictObject({
  /** Como o ato é identificado: "Lei nº 14.000/2020", "Mensagem nº 123/2024", "Decreto nº 11.000/2022". */
  identificador: texto,
  fonteId: idSchema,
});

const numeroEAno = z.strictObject({
  numero: z.number().int().positive(),
  ano: z.number().int().min(YEAR_BOUNDS.min).max(YEAR_BOUNDS.max),
});

const atoBase = {
  id: idSchema,
  atribuicao: atribuicaoSchema,
  data: dataHistoricaSchema,
  atoOficial: atoOficialSchema,
  /** As proposições a que o ato se refere, quando documentadas. */
  proposicaoIds: z.array(idSchema),
  temas: z.array(z.enum(TEMAS)),
  fontes: z.array(citacaoSchema),
  editorial: editorialSchema,
};

/**
 * Atos do Executivo, cada tipo com os campos que o distinguem. Veto parcial
 * exige os dispositivos; sanção tácita, a evidência do procedimento; medida
 * provisória, a identificação e a versão. Não há objeto genérico.
 */
export const atoExecutivoSchema = z
  .discriminatedUnion("tipo", [
    z.strictObject({ ...atoBase, tipo: z.literal("sancao-expressa"), proposicaoIds: z.array(idSchema).min(1) }),
    z.strictObject({
      ...atoBase,
      tipo: z.literal("sancao-tacita"),
      proposicaoIds: z.array(idSchema).min(1),
      /** O que documenta o decurso do prazo sem manifestação: a sanção tácita é efeito do procedimento, e não declaração de apoio. */
      evidenciaDoProcedimento: texto,
    }),
    z.strictObject({ ...atoBase, tipo: z.literal("veto-total"), proposicaoIds: z.array(idSchema).min(1), mensagem: texto }),
    z.strictObject({
      ...atoBase,
      tipo: z.literal("veto-parcial"),
      proposicaoIds: z.array(idSchema).min(1),
      mensagem: texto,
      /** Os dispositivos vetados, como a mensagem os cita. O veto não atinge o projeto inteiro. */
      dispositivosAlvo: z.array(texto).min(1),
    }),
    z.strictObject({ ...atoBase, tipo: z.literal("medida-provisoria"), medida: numeroEAno, versao: texto }),
    z.strictObject({ ...atoBase, tipo: z.literal("decreto"), decreto: numeroEAno }),
    z.strictObject({ ...atoBase, tipo: z.literal("iniciativa"), proposicaoIds: z.array(idSchema).min(1) }),
  ])
  .superRefine(requireEvidenceWhenReviewed)
  .superRefine(requireDistinctThemes);

/**
 * A atuação legislativa: uma matéria de que o parlamentar é autor, ou de que
 * foi relator, com o destino documentado dela. Não é voto (não diz como ele
 * votou) nem ato do Executivo, e não entra na linha do tempo: é registro de
 * trabalho no cargo, como os atos de um presidente.
 */
export const atuacaoLegislativaSchema = z
  .strictObject({
    id: idSchema,
    pessoaId: idSchema,
    /** O mandato pelo qual a pessoa atuou: é o que dá a competência. */
    mandatoId: idSchema,
    tipo: z.enum(TIPOS_DE_ATUACAO),
    /** A casa ou o órgão em que a atuação aconteceu. */
    instituicao: z.enum(INSTITUICOES),
    /** A data do que o documento registra: a da lei, na autoria que virou lei; a da designação, na relatoria. */
    data: dataHistoricaSchema,
    /** Como o cartão chama o registro, em uma linha: o tipo, a norma ou a matéria e o assunto. */
    titulo: texto,
    /** A matéria, como o acervo a identifica: de quem ela é, e o que diz a ementa. */
    materia: z.strictObject({
      identificador: texto,
      ementa: texto,
      /** Quem assina a matéria, como o acervo registra. Na relatoria, a matéria é de outro autor. */
      autoria: texto,
    }),
    /** O destino documentado da matéria. */
    desfecho: z.strictObject({
      tipo: z.enum(DESFECHOS_DE_ATUACAO),
      /** A norma em que a matéria se tornou, como o acervo a identifica; `null` quando o desfecho não está documentado. */
      norma: texto.nullable(),
      /** O que o documento diz do destino, e o que ele não diz. */
      descricao: texto,
    }),
    /** Uma divergência entre documentos, escrita para quem lê: o que cada um diz e o que o atlas adotou. `null` quando concordam. */
    divergenciaDocumentada: texto.nullable(),
    /** Classificação temática: decisão editorial, a justificar na revisão. Pode ficar vazia. */
    temas: z.array(z.enum(TEMAS)),
    fontes: z.array(citacaoSchema),
    editorial: editorialSchema,
  })
  .superRefine(requireEvidenceWhenReviewed)
  .superRefine(requireDistinctThemes)
  .superRefine((atuacao, ctx) => {
    const semNorma = atuacao.desfecho.tipo === "nao-documentado";
    if (semNorma && atuacao.desfecho.norma !== null) {
      ctx.addIssue({ code: "custom", message: "Desfecho não documentado não tem norma.", path: ["desfecho", "norma"] });
    }
    if (!semNorma && atuacao.desfecho.norma === null) {
      ctx.addIssue({ code: "custom", message: "Este desfecho exige a norma em que a matéria se tornou.", path: ["desfecho", "norma"] });
    }
  });

/**
 * O que foi pesquisado para uma pessoa, em um tema e um período, em quais
 * acervos e com que resultado. É o que separa "a fonte não individualiza" de
 * "a pesquisa ainda não encontrou". Não cita trechos: os acervos são a evidência.
 */
export const coberturaPoliticaSchema = z.strictObject({
  id: idSchema,
  pessoaId: idSchema,
  tema: z.enum(TEMAS_DE_COBERTURA),
  periodo: periodoSchema,
  acervos: z
    .array(
      z.strictObject({
        nome: texto,
        url: urlSchema,
        consultadoEm: dataCompletaSchema,
        /** O recorte consultado: filtros, datas, páginas percorridas. */
        recorte: texto,
        /** A consulta percorreu todo o recorte, ou parou (paginação, falha, limite do serviço). */
        completa: z.boolean(),
      }),
    )
    .min(1),
  criterios: texto,
  estado: z.enum(ESTADOS_DE_COBERTURA),
  lacunas: z.array(texto),
  fontes: z.array(citacaoSchema),
  editorial: editorialSchema,
});

/** A pessoa em cada acervo oficial, pelo identificador que o acervo usa. */
export const identidadeInstitucionalSchema = z
  .strictObject({
    id: idSchema,
    pessoaId: idSchema,
    provedor: z.enum(PROVEDORES),
    idExterno: texto,
    instituicao: z.enum(INSTITUICOES),
    /** Quando a identidade vale, se o acervo a limita a um período. */
    validade: periodoSchema.nullable(),
    fontes: z.array(citacaoSchema),
    editorial: editorialSchema,
  })
  .superRefine(requireEvidenceWhenReviewed);

// ---------------------------------------------------------------------------
// Proposta eleitoral (docs/DATA_MODEL.md, seção Propostas eleitorais)
// ---------------------------------------------------------------------------

/**
 * Uma frase do documento que a candidatura registrou na Justiça Eleitoral
 * como proposta de governo. Diz o que o documento propõe; não é ato, voto nem
 * resultado, e por isso não entra nas decisões nem na linha do tempo. A fonte
 * é o próprio documento, com a página; o texto resume a frase sem trocar o
 * sentido e começa sempre por "O documento".
 */
export const propostaEleitoralSchema = z
  .strictObject({
    id: idSchema,
    pessoaId: idSchema,
    /** O ano da eleição a que o documento registrado se refere. */
    eleicao: z.number().int().min(YEAR_BOUNDS.min).max(YEAR_BOUNDS.max),
    /** Classificação temática: decisão editorial, a justificar na revisão. */
    tema: z.enum(TEMAS),
    /** O que o documento propõe, em uma frase. */
    texto: texto,
    /** O que quem lê precisa saber para não ler a mais: uma condição, uma divergência dentro do documento, um número que é afirmação do próprio texto. `null` quando não há. */
    ressalva: texto.nullable(),
    fontes: z.array(citacaoSchema),
    editorial: editorialSchema,
  })
  .superRefine(requireEvidenceWhenReviewed)
  .superRefine((proposta, ctx) => {
    if (!proposta.texto.startsWith(INICIO_DA_PROPOSTA)) {
      ctx.addIssue({ code: "custom", message: `O texto de uma proposta começa por "${INICIO_DA_PROPOSTA.trim()}": quem propõe é o documento registrado, e proposta não é ato nem resultado.`, path: ["texto"] });
    }
    if (countWords(proposta.texto) > LIMITES_DA_FASE.palavrasDaProposta) {
      ctx.addIssue({ code: "custom", message: `O texto tem mais de ${LIMITES_DA_FASE.palavrasDaProposta} palavras.`, path: ["texto"] });
    }
  });

// ---------------------------------------------------------------------------
// Conteúdo educativo do jogo: fato biográfico, conceito e fase
// (docs/GAME-TRAIL.md e docs/DATA_MODEL.md, seção Conteúdo educativo)
// ---------------------------------------------------------------------------

/**
 * Um fato da vida da pessoa anterior à trajetória pública, ou paralelo a ela:
 * nascimento, família, mudança de cidade, formação, trabalho. Não é um
 * acontecimento da linha do tempo; tem as mesmas exigências de evidência.
 */
export const fatoBiograficoSchema = z
  .strictObject({
    id: idSchema,
    pessoaId: idSchema,
    tipo: z.enum(TIPOS_DE_FATO_BIOGRAFICO),
    titulo: texto,
    /** Quando foi, na precisão que o documento sustenta; `desconhecida` quando o documento não data. */
    data: dataOuDesconhecidaSchema,
    /** O fato, em uma ou duas frases, só com o que as citações sustentam. */
    texto: texto,
    /** Uma divergência entre documentos, escrita para quem lê: o que cada um diz e o que o atlas adotou. `null` quando concordam. */
    divergenciaDocumentada: texto.nullable(),
    fontes: z.array(citacaoSchema),
    editorial: editorialSchema,
  })
  .superRefine(requireEvidenceWhenReviewed);

/**
 * A definição simples de um termo cívico, para quem nunca o viu. Não é fato
 * sobre nenhuma das pessoas: é o que o texto oficial citado diz do termo.
 */
export const conceitoSchema = z
  .strictObject({
    id: idSchema,
    termo: texto,
    /** A definição, em português simples. Diz só o que as citações sustentam. */
    definicao: texto,
    /** O que a definição simplifica: exceções e detalhes que ficaram de fora. `null` quando não há o que avisar. */
    simplificacao: texto.nullable(),
    fontes: z.array(citacaoSchema),
    editorial: editorialSchema,
  })
  .superRefine(requireEvidenceWhenReviewed)
  .superRefine((conceito, ctx) => {
    if (countWords(conceito.definicao) > LIMITES_DA_FASE.palavrasDoConceito) {
      ctx.addIssue({ code: "custom", message: `A definição tem mais de ${LIMITES_DA_FASE.palavrasDoConceito} palavras.`, path: ["definicao"] });
    }
  });

/** Um registro que a fase aponta, pelo tipo e pelo identificador. */
const referenciaDeFaseSchema = z.strictObject({
  tipo: z.enum(TIPOS_DE_REFERENCIA_DE_FASE),
  id: idSchema,
});

/** Um bloco da explicação: o texto e os registros que o sustentam. */
const blocoDeExplicacaoSchema = z.strictObject({
  texto: texto,
  referencias: z.array(referenciaDeFaseSchema).min(1),
});

const opcaoDeAtividadeSchema = z.strictObject({ id: idSchema, texto: texto });

/**
 * A atividade de uma fase: uma pergunta com duas ou três opções, ou uma
 * ordenação curta. A pergunta usa o que a explicação acabou de dizer; a
 * ordenação só existe quando as datas dos registros decidem a ordem (o
 * conjunto confere). `explicacao` é o que a pessoa lê depois de responder, ou
 * no lugar de responder.
 */
/**
 * Uma ficha do dossiê (D-151): uma afirmação em uma frase, escrita só com o
 * que o documento apontado registra, e o trecho dela que a pessoa tem de
 * localizar no documento, com o campo que o sustenta.
 */
const fichaDoDossieSchema = z.strictObject({
  id: idSchema,
  texto: texto,
  /** O registro que sustenta a ficha: uma decisão (voto, ato do Executivo ou atuação legislativa). */
  evidencia: referenciaDeFaseSchema,
  destaque: z.strictObject({ trecho: texto, campo: z.enum(CAMPOS_DO_DOCUMENTO) }),
});

const atividadeSchema = z.discriminatedUnion("tipo", [
  z.strictObject({
    tipo: z.literal("pergunta"),
    enunciado: texto,
    opcoes: z.array(opcaoDeAtividadeSchema).min(2).max(3),
    correta: idSchema,
    explicacao: texto,
    /** Os registros que sustentam a resposta. */
    referencias: z.array(referenciaDeFaseSchema).min(1),
  }),
  z.strictObject({
    tipo: z.literal("ordem"),
    enunciado: texto,
    /** Os registros a pôr em ordem cronológica: acontecimentos, decisões ou fatos com data. */
    itens: z.array(referenciaDeFaseSchema).min(2).max(3),
    explicacao: texto,
  }),
  /**
   * O dossiê (D-151): a pessoa abre os documentos da gaveta, guarda os que
   * achar úteis e relaciona cada ficha ao documento que a sustenta. Os
   * distratores são documentos da mesma pessoa que não sustentam ficha
   * nenhuma: estão na gaveta para a leitura decidir, e não para enganar.
   */
  z.strictObject({
    tipo: z.literal("dossie"),
    enunciado: texto,
    fichas: z.array(fichaDoDossieSchema).min(LIMITES_DA_FASE.fichasMinimasDoDossie).max(LIMITES_DA_FASE.fichasDoDossie),
    distratores: z.array(referenciaDeFaseSchema),
    explicacao: texto,
  }),
]);

const anoDaFase = z.number().int().min(YEAR_BOUNDS.min).max(YEAR_BOUNDS.max);

/**
 * Uma fase da trilha do jogo: um marco, uma explicação curta, uma atividade
 * e o que mais há para explorar no período. O texto é novo, mas não é fonte
 * de fato: cada bloco aponta os registros publicados que o sustentam, e a
 * fase não cita documento por conta própria.
 */
export const faseDoJogoSchema = z
  .strictObject({
    id: idSchema,
    pessoaId: idSchema,
    sala: z.enum(SALAS_DO_JOGO),
    /** Posição na sala, a partir de 1. */
    ordem: z.number().int().min(1).max(20),
    titulo: texto,
    /** O que a pessoa sabe ao terminar a fase, em uma frase. */
    objetivo: texto,
    /** Os anos que a fase cobre, pelas datas dos registros que ela aponta. */
    periodo: z.strictObject({ de: anoDaFase, ate: anoDaFase }),
    /** O registro principal da fase: é o que o cenário destaca. */
    marco: referenciaDeFaseSchema,
    explicacao: z.array(blocoDeExplicacaoSchema).min(1).max(LIMITES_DA_FASE.blocos),
    /** Os conceitos definidos nesta fase, na primeira vez em que aparecem na trilha. */
    conceitos: z.array(idSchema),
    atividade: atividadeSchema,
    /** Os outros registros do período, opcionais: não seguram a fase seguinte. */
    explorar: z.array(referenciaDeFaseSchema),
    /** O que a edição não pesquisou neste período, dito a quem joga. */
    lacunas: z.array(texto),
    editorial: editorialSchema,
  })
  .superRefine((fase, ctx) => {
    if (fase.periodo.de > fase.periodo.ate) {
      ctx.addIssue({ code: "custom", message: "O período termina antes de começar.", path: ["periodo", "ate"] });
    }
    if (fase.marco.tipo === "conceito") {
      ctx.addIssue({ code: "custom", message: "O marco de uma fase é um registro da pessoa, e não um conceito.", path: ["marco", "tipo"] });
    }
    if (fase.marco.tipo === "proposta") {
      ctx.addIssue({ code: "custom", message: "O marco de uma fase é algo que aconteceu, e não uma proposta eleitoral.", path: ["marco", "tipo"] });
    }
    if (new Set(fase.conceitos).size !== fase.conceitos.length) {
      ctx.addIssue({ code: "custom", message: "O mesmo conceito aparece mais de uma vez.", path: ["conceitos"] });
    }
    const chaves = fase.explorar.map((item) => `${item.tipo}:${item.id}`);
    if (new Set(chaves).size !== chaves.length) {
      ctx.addIssue({ code: "custom", message: "O mesmo registro aparece mais de uma vez.", path: ["explorar"] });
    }
    fase.explorar.forEach((item, indice) => {
      if (item.tipo === "conceito") ctx.addIssue({ code: "custom", message: "Conceito não é registro para explorar: use o campo conceitos.", path: ["explorar", indice, "tipo"] });
    });
    const palavras = fase.explicacao.reduce((soma, bloco) => soma + countWords(bloco.texto), 0);
    if (palavras > LIMITES_DA_FASE.palavrasDaExplicacao) {
      ctx.addIssue({ code: "custom", message: `A explicação tem ${palavras} palavras; o limite é ${LIMITES_DA_FASE.palavrasDaExplicacao}.`, path: ["explicacao"] });
    }
    const { atividade } = fase;
    if (countWords(atividade.enunciado) > LIMITES_DA_FASE.palavrasDoEnunciado) {
      ctx.addIssue({ code: "custom", message: `O enunciado tem mais de ${LIMITES_DA_FASE.palavrasDoEnunciado} palavras.`, path: ["atividade", "enunciado"] });
    }
    if (atividade.tipo === "pergunta") {
      const ids = atividade.opcoes.map((opcao) => opcao.id);
      if (new Set(ids).size !== ids.length) {
        ctx.addIssue({ code: "custom", message: "Duas opções têm o mesmo identificador.", path: ["atividade", "opcoes"] });
      }
      if (!ids.includes(atividade.correta)) {
        ctx.addIssue({ code: "custom", message: `A opção certa ("${atividade.correta}") não está entre as opções.`, path: ["atividade", "correta"] });
      }
      atividade.opcoes.forEach((opcao, indice) => {
        if (countWords(opcao.texto) > LIMITES_DA_FASE.palavrasDaOpcao) {
          ctx.addIssue({ code: "custom", message: `A opção tem mais de ${LIMITES_DA_FASE.palavrasDaOpcao} palavras.`, path: ["atividade", "opcoes", indice, "texto"] });
        }
      });
    } else if (atividade.tipo === "dossie") {
      const ids = atividade.fichas.map((ficha) => ficha.id);
      if (new Set(ids).size !== ids.length) {
        ctx.addIssue({ code: "custom", message: "Duas fichas têm o mesmo identificador.", path: ["atividade", "fichas"] });
      }
      const evidencias = atividade.fichas.map((ficha) => `${ficha.evidencia.tipo}:${ficha.evidencia.id}`);
      if (new Set(evidencias).size !== evidencias.length) {
        ctx.addIssue({ code: "custom", message: "Duas fichas apontam o mesmo documento: cada ficha tem o seu.", path: ["atividade", "fichas"] });
      }
      atividade.fichas.forEach((ficha, indice) => {
        if (ficha.evidencia.tipo !== "decisao") {
          ctx.addIssue({ code: "custom", message: "O documento de uma ficha é uma decisão: um voto, um ato do Executivo ou uma atuação legislativa.", path: ["atividade", "fichas", indice, "evidencia", "tipo"] });
        }
        if (!ficha.texto.includes(ficha.destaque.trecho)) {
          ctx.addIssue({ code: "custom", message: "O trecho destacado tem de estar, igual, no texto da ficha.", path: ["atividade", "fichas", indice, "destaque", "trecho"] });
        }
        if (countWords(ficha.texto) > LIMITES_DA_FASE.palavrasDaFicha) {
          ctx.addIssue({ code: "custom", message: `A ficha tem mais de ${LIMITES_DA_FASE.palavrasDaFicha} palavras.`, path: ["atividade", "fichas", indice, "texto"] });
        }
      });
      const distratores = atividade.distratores.map((item) => `${item.tipo}:${item.id}`);
      if (new Set(distratores).size !== distratores.length) {
        ctx.addIssue({ code: "custom", message: "O mesmo documento aparece mais de uma vez entre os distratores.", path: ["atividade", "distratores"] });
      }
      atividade.distratores.forEach((item, indice) => {
        if (item.tipo !== "decisao") {
          ctx.addIssue({ code: "custom", message: "Um distrator é uma decisão, como os documentos das fichas.", path: ["atividade", "distratores", indice, "tipo"] });
        }
        if (evidencias.includes(`${item.tipo}:${item.id}`)) {
          ctx.addIssue({ code: "custom", message: `O documento "${item.id}" sustenta uma ficha e não pode ser distrator.`, path: ["atividade", "distratores", indice] });
        }
      });
      if (evidencias.length + distratores.length > LIMITES_DA_FASE.documentosDoDossie) {
        ctx.addIssue({ code: "custom", message: `A gaveta tem mais de ${LIMITES_DA_FASE.documentosDoDossie} documentos.`, path: ["atividade", "distratores"] });
      }
    } else {
      const itens = atividade.itens.map((item) => `${item.tipo}:${item.id}`);
      if (new Set(itens).size !== itens.length) {
        ctx.addIssue({ code: "custom", message: "O mesmo registro aparece mais de uma vez na ordenação.", path: ["atividade", "itens"] });
      }
      atividade.itens.forEach((item, indice) => {
        if (item.tipo !== "acontecimento" && item.tipo !== "decisao" && item.tipo !== "fato") {
          ctx.addIssue({ code: "custom", message: "Só acontecimentos, decisões e fatos com data entram em uma ordenação.", path: ["atividade", "itens", indice, "tipo"] });
        }
      });
    }
  });

// ---------------------------------------------------------------------------
// Edição e conjunto
// ---------------------------------------------------------------------------

export const ENTIDADES = [
  "pessoa",
  "mandato",
  "filiacao",
  "acontecimento",
  "proposicao",
  "votacao",
  "voto",
  "ato-executivo",
  "atuacao-legislativa",
  "cobertura-politica",
  "identidade-institucional",
  "proposta-eleitoral",
  "fato-biografico",
  "conceito",
  "fase-do-jogo",
  "lugar",
  "fonte",
  "imagem",
] as const;

export const edicaoSchema = z.strictObject({
  versao: z.string().regex(/^\d+\.\d+\.\d+$/, "Use o formato 1.0.0."),
  /** Nenhum acontecimento do conjunto é posterior a esta data. */
  dataDeCorte: dataCompletaSchema,
  revisao: revisaoSchema,
  /**
   * Período que o conjunto cobre para cada pessoa. É o que permite à
   * comparação distinguir "sem registro no conjunto" de "sem atividade".
   */
  cobertura: z.array(
    z.strictObject({
      pessoaId: idSchema,
      periodo: periodoSchema,
      observacao: texto.optional(),
    }),
  ),
  alteracoes: z.array(
    z.strictObject({
      data: dataCompletaSchema,
      descricao: texto,
      itens: z.array(z.strictObject({ entidade: z.enum(ENTIDADES), id: idSchema })),
    }),
  ),
});

export const conjuntoSchema = z.strictObject({
  edicao: edicaoSchema,
  pessoas: z.array(pessoaSchema),
  mandatos: z.array(mandatoSchema),
  filiacoes: z.array(filiacaoSchema),
  acontecimentos: z.array(acontecimentoSchema),
  proposicoes: z.array(proposicaoSchema),
  votacoes: z.array(votacaoSchema),
  votos: z.array(votoSchema),
  atosExecutivos: z.array(atoExecutivoSchema),
  atuacoesLegislativas: z.array(atuacaoLegislativaSchema),
  coberturaPolitica: z.array(coberturaPoliticaSchema),
  identidadesInstitucionais: z.array(identidadeInstitucionalSchema),
  propostasEleitorais: z.array(propostaEleitoralSchema),
  fatosBiograficos: z.array(fatoBiograficoSchema),
  conceitos: z.array(conceitoSchema),
  fasesDoJogo: z.array(faseDoJogoSchema),
  lugares: z.array(lugarSchema),
  fontes: z.array(fonteSchema),
  imagens: z.array(imagemSchema),
});

export type Citacao = z.infer<typeof citacaoSchema>;
export type Editorial = z.infer<typeof editorialSchema>;
export type Fonte = z.infer<typeof fonteSchema>;
export type Lugar = z.infer<typeof lugarSchema>;
export type Imagem = z.infer<typeof imagemSchema>;
export type Pessoa = z.infer<typeof pessoaSchema>;
export type Mandato = z.infer<typeof mandatoSchema>;
export type Filiacao = z.infer<typeof filiacaoSchema>;
export type Localizacao = z.infer<typeof localizacaoSchema>;
export type Acontecimento = z.infer<typeof acontecimentoSchema>;
export type Proposicao = z.infer<typeof proposicaoSchema>;
export type Votacao = z.infer<typeof votacaoSchema>;
export type ObjetoVotadoRegistro = z.infer<typeof objetoVotadoSchema>;
export type Voto = z.infer<typeof votoSchema>;
export type RegistroIndividual = z.infer<typeof registroIndividualSchema>;
export type AtoExecutivo = z.infer<typeof atoExecutivoSchema>;
export type AtuacaoLegislativa = z.infer<typeof atuacaoLegislativaSchema>;
export type CoberturaPolitica = z.infer<typeof coberturaPoliticaSchema>;
export type IdentidadeInstitucional = z.infer<typeof identidadeInstitucionalSchema>;
export type PropostaEleitoral = z.infer<typeof propostaEleitoralSchema>;
export type FatoBiografico = z.infer<typeof fatoBiograficoSchema>;
export type Conceito = z.infer<typeof conceitoSchema>;
export type FaseDoJogo = z.infer<typeof faseDoJogoSchema>;
export type ReferenciaDeFase = z.infer<typeof referenciaDeFaseSchema>;
export type AtividadeDeFase = z.infer<typeof atividadeSchema>;
export type Edicao = z.infer<typeof edicaoSchema>;
export type Conjunto = z.infer<typeof conjuntoSchema>;
