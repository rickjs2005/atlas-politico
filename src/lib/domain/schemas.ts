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
} from "./decisions";
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
  "cobertura-politica",
  "identidade-institucional",
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
  coberturaPolitica: z.array(coberturaPoliticaSchema),
  identidadesInstitucionais: z.array(identidadeInstitucionalSchema),
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
export type CoberturaPolitica = z.infer<typeof coberturaPoliticaSchema>;
export type IdentidadeInstitucional = z.infer<typeof identidadeInstitucionalSchema>;
export type Edicao = z.infer<typeof edicaoSchema>;
export type Conjunto = z.infer<typeof conjuntoSchema>;
