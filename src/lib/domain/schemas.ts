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
  analyzeDate,
  findPeriodProblem,
  type DataHistorica,
} from "./dates";
import { PRECISOES_GEOGRAFICAS, isInsideBrazilBox } from "./geo";

// Mensagens do próprio Zod em português, para quem lê o erro de validação.
z.config(z.locales.pt());

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

const revisaoSchema = z.strictObject({
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
// Edição e conjunto
// ---------------------------------------------------------------------------

export const ENTIDADES = [
  "pessoa",
  "mandato",
  "filiacao",
  "acontecimento",
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
export type Edicao = z.infer<typeof edicaoSchema>;
export type Conjunto = z.infer<typeof conjuntoSchema>;
