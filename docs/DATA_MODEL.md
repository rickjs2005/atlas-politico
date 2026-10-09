# Modelo de dados

Os contratos estão em `src/lib/domain/schemas.ts` (Zod), e os tipos TypeScript são inferidos deles. Um conjunto completo e válido, com todos os casos abaixo, está em `tests/fixtures/sintetico/`.

Este documento descreve os registros como são escritos em `content/`. O que o gerador faz com eles (o que entra na publicação, os índices e o GeoJSON) está em [DATA-PIPELINE.md](DATA-PIPELINE.md).

## Convenções

- Nomes de campos e valores em português, sem acento nos identificadores (`pessoaId`, `em-curso`).
- `id` e `slug` em kebab-case: minúsculas, números e hífens (`posse-2003`).
- Todo objeto é estrito: campo desconhecido é erro. Isso pega erro de digitação no nome de um campo.
- Texto obrigatório não pode ser vazio nem só espaços.
- "Não sabemos" é sempre um valor escrito, nunca um campo ausente.
- O prefixo `sintetico-` em um `id` é reservado aos dados de teste e proibido nas pastas de conteúdo.

## Relacionamentos

```
Edicao ── cobertura ──▶ Pessoa
                          ▲
        Mandato ──────────┤ pessoaId
        Filiacao ─────────┤ pessoaId
        Acontecimento ────┘ pessoaIds (uma ou mais)
              │
              ├── localizacao.lugarIds ──▶ Lugar (zero ou mais)
              ├── imagemId ──────────────▶ Imagem (opcional)
              └── fontes[] (Citacao) ────▶ Fonte

Pessoa, Mandato e Filiacao também têm fontes[] (Citacao) ──▶ Fonte
Pessoa.retratoId ──▶ Imagem (opcional)
```

Um acontecimento pode envolver várias pessoas e vários lugares. Uma fonte pode sustentar vários registros, com um trecho diferente em cada citação.

## Entidades

### Pessoa (`pessoas.json`)

| Campo | Tipo | Regra |
|---|---|---|
| `id` | id | Estável. Único entre pessoas |
| `slug` | slug | Único. Corresponde à rota `/politicos/<slug>` |
| `nome` | texto | |
| `resumo` | texto | |
| `retratoId` | id de imagem ou `null` | |
| `fontes` | lista de citações | Ao menos uma quando revisado |
| `editorial` | estado editorial | |

### Mandato ou função (`mandatos.json`)

| Campo | Tipo | Regra |
|---|---|---|
| `id` | id | |
| `pessoaId` | id de pessoa | Precisa existir |
| `cargo` | texto | |
| `instituicao` | texto | |
| `periodo` | período | Início e fim explícitos |
| `fontes`, `editorial` | | Como em Pessoa |

### Filiação partidária (`filiacoes.json`)

| Campo | Tipo | Regra |
|---|---|---|
| `id` | id | |
| `pessoaId` | id de pessoa | Precisa existir |
| `partido` | `{ sigla, nome }` | |
| `periodo` | período | |
| `fontes`, `editorial` | | Como em Pessoa |

### Acontecimento (`acontecimentos.json`)

| Campo | Tipo | Regra |
|---|---|---|
| `id` | id | |
| `slug` | slug | Único. Corresponde à rota `/acontecimentos/<slug>` |
| `pessoaIds` | lista de ids de pessoa | Ao menos uma. Todas precisam existir |
| `titulo` | texto | |
| `data` | data histórica | Valor e precisão. Não pode ser posterior à data de corte |
| `categoria` | categoria | Uma das cinco da lista |
| `resumo` | texto | |
| `contexto` | texto | |
| `localizacao` | localização | Lugares, abrangência nacional ou desconhecida |
| `imagemId` | id de imagem ou `null` | |
| `fontes` | lista de citações | Ao menos uma quando revisado |
| `editorial` | estado editorial | |

Categorias: `mandatos-e-funcoes`, `eleicoes`, `partidos-e-aliancas`, `atuacao-institucional`, `marcos-historicos`.

### Lugar (`lugares.json`)

| Campo | Tipo | Regra |
|---|---|---|
| `id` | id | |
| `nome` | texto | |
| `pais` | código ISO de duas letras | Maiúsculas (`BR`) |
| `municipio` | `{ nome, uf?, codigoIbge? }` ou `null` | `null` quando não se aplica ou não é conhecido |
| `longitude` | número | De -180 a 180 |
| `latitude` | número | De -90 a 90 |
| `precisaoGeografica` | `local`, `municipio`, `uf` ou `pais` | O que a coordenada representa |
| `origemCoordenadas` | texto | Base, edição e critério de onde veio a coordenada |

### Fonte (`fontes.json`)

O documento consultado.

| Campo | Tipo | Regra |
|---|---|---|
| `id` | id | |
| `titulo` | texto | |
| `autoria` | texto | Autor ou instituição |
| `url` | URL | Só `http` ou `https` |
| `dataDocumento` | data ou desconhecida | Com precisão, ou `{ "tipo": "desconhecida" }` |
| `acessadoEm` | data completa | `AAAA-MM-DD` |

### Citação (dentro de `fontes` de cada registro)

O uso que um registro faz de uma fonte.

| Campo | Tipo | Regra |
|---|---|---|
| `fonteId` | id de fonte | Precisa existir |
| `localizacao` | texto | Onde olhar no documento: seção, página, parágrafo, minuto |
| `evidencia` | texto | O que esse trecho sustenta no registro |

### Imagem (`imagens.json`)

| Campo | Tipo | Regra |
|---|---|---|
| `id` | id | |
| `arquivo` | caminho | Dentro de `public/media/`, como `/media/retratos/nome.webp` |
| `autoria` | texto | |
| `credito` | texto | Texto de crédito a exibir |
| `origem` | URL | Página de onde o arquivo foi obtido |
| `condicoesDeUso` | texto | Licença ou autorização |
| `textoAlternativo` | texto | |
| `dimensoes` | `{ largura, altura }`, opcional | Em pixels, para reservar espaço na página |

### Edição (`edicao.json`)

| Campo | Tipo | Regra |
|---|---|---|
| `versao` | `1.0.0` | Versão do conteúdo |
| `dataDeCorte` | data completa | Nenhum acontecimento é posterior a ela |
| `revisao` | `{ tipo, revisadoPor, revisadoEm, observacoes? }` | Última revisão do conjunto |
| `cobertura` | lista de `{ pessoaId, periodo, observacao? }` | Período que o conjunto cobre para cada pessoa |
| `alteracoes` | lista de `{ data, descricao, itens }` | Registro de alterações. `itens` aponta os registros afetados (`{ entidade, id }`) |

## Regras temporais

### Data histórica

```json
{ "valor": "1989-11", "precisao": "mes" }
```

| Precisão | Formato | Exibição |
|---|---|---|
| `ano` | `AAAA` | `1989` |
| `mes` | `AAAA-MM` | `novembro de 1989` |
| `dia` | `AAAA-MM-DD` | `15 de novembro de 1989` |

1. **Formato e precisão têm de concordar.** `1989-11-15` declarado como `mes` é erro: o dia estaria afirmando algo que a precisão diz não ser conhecido.
2. **A data tem de existir.** Mês de 1 a 12, dia válido para o mês, com ano bissexto. `2023-02-29` é recusado com o motivo.
3. **Ano entre 1800 e 2100.** Pega erros de digitação como `0203`.
4. **A tela mostra só a precisão conhecida.** `formatDate` é a única função de apresentação e recebe a data histórica, nunca um intervalo.

### Intervalo de cálculo

Para ordenar e filtrar, cada data vira um intervalo: o primeiro e o último dia que ela pode representar. `1994` vira de 1º de janeiro a 31 de dezembro de 1994.

Esse intervalo é guardado como número de dias (tipo `DiaOrdinal`), e não como data. É uma regra de cálculo: não pode ser formatado nem exibido, e por isso um "1º de janeiro" que só existe para ordenar não chega à tela.

- **Ordem cronológica:** primeiro quem pode ter começado antes. No empate, a data mais precisa vem primeiro.
- **Filtro por anos:** um acontecimento entra no recorte quando seu intervalo toca o intervalo dos anos escolhidos, com as pontas inclusas.

### Período

Usado em mandatos, filiações e cobertura.

```json
{
  "inicio": { "tipo": "data", "valor": "2019", "precisao": "ano" },
  "fim": { "tipo": "em-curso" }
}
```

| Limite | Onde vale | Significado |
|---|---|---|
| `{ "tipo": "data", valor, precisao }` | Início e fim | Data conhecida, com a precisão que a fonte sustenta |
| `{ "tipo": "desconhecida" }` | Início e fim | Existe, mas não está documentada |
| `{ "tipo": "em-curso" }` | Só fim | Vigente na data de corte da edição |

1. Os dois limites são obrigatórios. Omitir um limite é erro: desconhecido tem de ser declarado.
2. Início posterior ao fim é erro. Entre datas parciais, o período só é recusado quando nenhuma leitura é coerente: início `2003` e fim `2003-06` é aceito, início `2003-07` e fim `2003-06` não.
3. Limites desconhecidos ou em curso não são comparados.

## Regras geográficas

1. **Coordenadas nomeadas no conteúdo.** `longitude` e `latitude` são campos separados, para ninguém depender de lembrar a ordem.
2. **Ordem GeoJSON em um único ponto.** `toPosition` devolve `[longitude, latitude]`. O mapa só recebe coordenadas por ela.
3. **Inversão detectada.** Para lugares com `pais: "BR"`, a coordenada precisa cair na caixa do território brasileiro. Uma coordenada do continente com os dois valores trocados sempre cai fora, e o erro sugere a troca.
4. **Precisão declarada.** `municipio`, `uf` e `pais` são aproximações e aparecem assim na interface. Só `local` indica um ponto específico.
5. **Origem registrada.** Toda coordenada diz de onde veio.
6. **Falta de lugar é explícita.** A localização de um acontecimento é uma de três:

| `localizacao` | Significado | No mapa |
|---|---|---|
| `{ "tipo": "lugares", "lugarIds": [...] }` | Um ou mais lugares documentados | Um ponto por lugar |
| `{ "tipo": "nacional" }` | Abrangência nacional, sem ponto municipal | Nenhum ponto. A lista e o painel dizem o motivo |
| `{ "tipo": "desconhecida" }` | O lugar não consta nas fontes | Nenhum ponto. A lista e o painel dizem o motivo |

Uma lista de lugares vazia não é aceita. Acontecimentos sem ponto continuam na linha do tempo, na lista e no painel.

## Regras editoriais

### Estado editorial

```json
{
  "estado": "revisado",
  "revisao": { "tipo": "assistida-por-ia", "revisadoPor": "Nome", "revisadoEm": "2026-10-08" }
}
```

| Estado | Campos | Vai para as páginas |
|---|---|---|
| `rascunho` | `pendencias` opcional | Não |
| `em-revisao` | `pendencias` opcional | Não |
| `revisado` | `revisao` obrigatória: tipo, quem e quando | Sim, se estiver em `content/published/` e tudo o que cita também entrar |

Vale para os registros factuais: pessoa, mandato, filiação e acontecimento.

`revisao.tipo` é obrigatório e tem dois valores:

| Tipo | Significado |
|---|---|
| `assistida-por-ia` | A conferência contra as fontes foi feita por um modelo de IA. O site mostra "Revisão humana pendente" |
| `humana` | Uma pessoa conferiu as fontes e aprovou o texto. Só se registra quando aconteceu |

A revisão da edição (`edicao.revisao`) usa o mesmo formato.

1. **Revisado exige evidência.** Um registro revisado precisa de ao menos uma citação, e toda citação diz onde está o trecho e o que ele sustenta.
2. **Rascunho pode estar incompleto de fontes.** É o estado de quem ainda está pesquisando. Pode também citar um registro que ainda não foi cadastrado: vira pendência no relatório. O resto do contrato vale igual: data impossível ou campo desconhecido é erro também em rascunho.
3. **Só o revisado é publicado.** O gerador deixa fora qualquer registro em outro estado e o lista como pendência. A regra completa está em DATA-PIPELINE.md, seção Elegibilidade.
4. **Dado sintético nunca é publicado.** Um `id` ou `slug` com o prefixo `sintetico-` nas pastas de conteúdo é erro e interrompe a geração.

### Comparação e cobertura

A comparação entre as duas trajetórias depende de três garantias do modelo:

- Cargos são registros próprios (mandatos), com instituição e período. Não há campo que equipare cargos diferentes.
- `Edicao.cobertura` diz de quando a quando o conjunto cobre cada pessoa. Um ano dentro da cobertura e sem registros é "sem registros no atlas". Um ano fora da cobertura é "período não coberto". Nenhum dos dois é "sem atividade".
- Não existe nenhum campo de nota, peso ou pontuação.

## Onde cada regra é verificada

Desde a fase 3, quem confere é o pipeline de dados, em `npm run data:validate` e em `npm run data:build` (que `npm run dev` e `npm run build` chamam).

| Regra | Onde | Severidade |
|---|---|---|
| Arquivo fora do contrato, JSON ilegível, arquivo que não é lista | `src/lib/content/sources.ts` e `validate.ts` | Erro |
| Formato de cada registro, datas, períodos, coordenadas, evidência do revisado | `schemas.ts`, aplicado registro por registro | Erro |
| `id` único por coleção e `slug` único em pessoas e em acontecimentos, somando as duas pastas | `validate.ts` | Erro |
| Pessoa ou lugar repetido no mesmo acontecimento | `validate.ts` | Erro |
| Referências: `pessoaId`, `pessoaIds`, `lugarIds`, `fonteId`, `retratoId`, `imagemId`, cobertura | `validate.ts` | Erro no revisado, pendência no rascunho |
| Revisado só cita o que entra na publicação | `validate.ts` | Erro |
| Acontecimento e limites de período até a data de corte | `validate.ts` | Erro no revisado, pendência no rascunho |
| Documento não é posterior ao acesso | `validate.ts` | Erro na edição, pendência nos rascunhos |
| Arquivo de cada imagem existe, é do formato da extensão e tem as dimensões declaradas | `validate.ts`, com a sonda de `src/lib/content/media.ts` | Erro na edição, pendência nos rascunhos |
| Nenhum dado sintético nas pastas de conteúdo | `validate.ts` | Erro |
| Rascunho com pendência escrita, cadastro sem uso, filiações sobrepostas, cobertura, itens do registro de alterações | `validate.ts` | Aviso |
| A saída montada passa de novo pelo contrato, por `checkIntegrity` e `checkPublication`, e bate com os índices e os pontos | `verifyAtlasData`, em `build.ts` | Erro |
| Rascunho sem página e publicado com página; nenhum dado sintético na saída | `scripts/check-export.mjs` | Depois do build |

Todo diagnóstico aponta arquivo, entidade, `id`, campo e motivo:

```
content/published/lugares.json · lugar "brasilia" · latitude: Valor acima do máximo (90).
```

A lista de códigos e o significado de erro, pendência e aviso estão em DATA-PIPELINE.md, seção Diagnósticos.

## Como o primeiro conjunto usa o modelo

Notas da fase 2, para quem for editar o conteúdo:

- **Rascunhos:** `content/drafts/` guarda coleções parciais, com os mesmos nomes de arquivo. Os rascunhos podem citar pessoas, lugares e fontes de `content/published/`. `id` e `slug` são únicos somando as duas pastas.
- **Filiação sem data documentada:** quando só se sabe que a pessoa concorreu por um partido em certos anos, o período fica com início e fim `desconhecida`, e a citação diz em que eleições o partido aparece.
- **Cargo com vários mandatos seguidos e datas de posse não documentadas:** um único registro, com o período total e a observação no nome do cargo. É o caso dos quatro mandatos de deputado estadual.
- **Lugar de decisão judicial:** o município-sede do tribunal, quando aparece no documento lido.
- **Eleição estadual:** o lugar é a unidade da federação, com precisão `uf`.
- **Acontecimento compartilhado:** `pessoaIds` em ordem alfabética.

## Exemplo

Um acontecimento revisado, com data de mês e dois lugares:

```json
{
  "id": "exemplo-de-acontecimento",
  "slug": "exemplo-de-acontecimento",
  "pessoaIds": ["pessoa-a"],
  "titulo": "Título descritivo do acontecimento",
  "data": { "valor": "2003-03", "precisao": "mes" },
  "categoria": "atuacao-institucional",
  "resumo": "Resumo curto, com os fatos.",
  "contexto": "Contexto que liga o acontecimento à trajetória.",
  "localizacao": { "tipo": "lugares", "lugarIds": ["lugar-a", "lugar-b"] },
  "imagemId": null,
  "fontes": [
    {
      "fonteId": "documento-a",
      "localizacao": "Seção 2, terceiro parágrafo",
      "evidencia": "Informa o mês e os dois lugares."
    }
  ],
  "editorial": {
    "estado": "revisado",
    "revisao": { "tipo": "humana", "revisadoPor": "Nome de quem revisou", "revisadoEm": "2026-10-08" }
  }
}
```
