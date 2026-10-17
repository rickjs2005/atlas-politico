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

Voto ─────────────── votacaoId ──▶ Votacao ── proposicaoId ──▶ Proposicao
Voto, AtoExecutivo, AtuacaoLegislativa ── pessoaId, mandatoId ──▶ Pessoa, Mandato
PropostaEleitoral, FatoBiografico ─────── pessoaId ───────────▶ Pessoa
Conceito ── não pertence a pessoa nenhuma

FaseDoJogo ── pessoaId ──▶ Pessoa
     └── marco, explicacao[].referencias, atividade, explorar
              │  cada referência é { tipo, id }
              ▼
         Acontecimento · decisão (Voto, AtoExecutivo ou AtuacaoLegislativa) ·
         FatoBiografico · Mandato · Filiacao · PropostaEleitoral · Conceito
```

Um acontecimento pode envolver várias pessoas e vários lugares. Uma fonte pode sustentar vários registros, com um trecho diferente em cada citação. Uma fase do jogo não cita fonte: aponta registros, e as fontes chegam por eles.

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

## Decisões políticas

Entraram em 10 de outubro de 2026 (D-122), para o histórico de votos e de atos do Executivo. Três naturezas que o modelo não confunde: o **voto parlamentar** (manifestação individual em uma votação identificada), o **ato do Executivo** (sanção, veto, medida provisória, decreto, iniciativa) e a **atuação legislativa**, que é a autoria ou a relatoria de uma matéria e não é voto. A terceira ficou de fora da primeira entrega e entrou na edição 0.3.0, em 11 de outubro de 2026 (D-136). Os contratos estão em `src/lib/domain/schemas.ts`, seção Decisões políticas; as taxonomias, em `src/lib/domain/decisions.ts`.

Os sete temas da comparação por assunto: `economia`, `seguranca-publica`, `saude`, `educacao`, `reforma-do-estado`, `meio-ambiente`, `direitos-das-mulheres`. São separados das categorias dos acontecimentos: um registro pode ter mais de um tema, e classificar é decisão editorial, a justificar na revisão. "Não localizado em Saúde" não significa "nunca atuou em Saúde".

As instituições: `camara-dos-deputados`, `senado-federal`, `congresso-nacional`, `assembleia-nacional-constituinte` (separada da Câmara de propósito), `alerj` e `presidencia-da-republica`. O **mandato** ganhou o campo opcional `casa`, com uma dessas; é ele que dá competência para votar, e sem ele a consulta responde "competência não confirmada".

### Proposição (`proposicoes.json`)

A matéria votada ou referida: `instituicao`, `jurisdicao` (`federal` ou `estadual`), `identidadeExterna` (`provedor` e `id` no acervo oficial, nunca o nome), `tipo` (a sigla da casa: PL, PEC, PLP, MPV, PDL, REQ, PLV), `numero` e `ano` (ou `null`), `ementa`, `temas`, `fontes` e `editorial`. Temas repetidos são recusados.

### Votação (`votacoes.json`)

Uma decisão sobre um objeto: `proposicaoId`, `instituicao`, `orgao` (`plenario`, ou `comissao` com o nome), `identidadeExterna`, `data`, `etapa` (como a casa a nomeia: "1º turno", "turno único"), `objeto` (`tipo`: `texto-principal`, `substitutivo`, `emenda`, `destaque`, `requerimento` ou `outro`; `identificacao`; `descricao`; `textoReferencia`, um documento apontado com `fonteId`, `localizacao` e `capturaId`, ou `null` enquanto o texto submetido à votação não está ligado; `divergenciaDocumentada`, um texto para quem lê o cartão quando dois documentos divergem sobre o objeto, dizendo o que cada um diz e o que o atlas adotou, ou `null`), `modalidade` (`nominal`, `simbolica`, `secreta`), `resultadoOficial` (`estado` e o `valorOriginal` como o acervo escreve), `fontes` e `editorial`. "FAVOR" em uma votação é favorável a **este objeto**: um requerimento de urgência não é o mérito, e uma emenda não é o projeto inteiro.

### Voto (`votos.json`)

A manifestação ou situação individual **comprovada**: `votacaoId`, `pessoaId`, `mandatoId` (o mandato pelo qual a pessoa participou), `registro`, `proveniencia` (`provedor`, `registroExternoId`, `capturaId`), `situacao`, `fontes` e `editorial`. O `registro` é um de três tipos, sempre com o `valorOriginal` do acervo:

| Tipo | Campos | Quando |
| --- | --- | --- |
| `voto-individual` | `posicao` (`FAVOR`, `CONTRA`, `ABSTENCAO`, `OBSTRUCAO`, `OUTRO`), `valorOriginal` | Manifestação registrada. `OUTRO` guarda o valor sem correspondência segura e vai à revisão |
| `ausencia-documentada` | `valorOriginal`, `motivoDocumentado` (opcional) | O documento registra a ausência (licença, missão, comunicação) |
| `nao-votou-documentado` | `valorOriginal`, `motivoDocumentado` (obrigatório) | Presente sem votar, presidência da sessão, impedimento regimental |

A falta de uma linha no acervo **não produz ausência**: sem documento, não há voto. "Sem registro individual" e "não se aplica" pertencem à consulta comparativa, não a este contrato. A `situacao` é `vigente` ou `retificado` (com `substituidoPor` e `motivo`): há uma linha vigente por pessoa e votação, e a retificada fica, apontando a que a substituiu.

### Ato do Executivo (`atosExecutivos.json`)

Discriminado por `tipo`, cada um com os campos que o distinguem: `sancao-expressa`; `sancao-tacita` (com `evidenciaDoProcedimento`: a sanção tácita é efeito do procedimento, não declaração de apoio); `veto-total` (com `mensagem`); `veto-parcial` (com `mensagem` e `dispositivosAlvo`, ao menos um: o veto não atinge o projeto inteiro); `medida-provisoria` (com `medida` número e ano, e `versao`); `decreto` (com `decreto` número e ano); `iniciativa` (proposição apresentada). Comuns: `atribuicao` (`autor-documentado`, com `pessoaId` e `mandatoId`: quem praticou o ato, pelo documento), `data`, `atoOficial` (`identificador` e `fonteId`), `proposicaoIds`, `temas`, `fontes`, `editorial`. Não existe "voto presidencial" nem "sanção de PEC": emendas constitucionais são promulgadas pelas Mesas.

### Atuação legislativa (`atuacoesLegislativas.json`)

Uma matéria de que o parlamentar é autor, ou de que foi relator, com o destino documentado dela. Não é voto: não diz como ele votou. Não é ato do Executivo. E não entra na linha do tempo: é registro de trabalho no cargo, como os atos de um presidente.

| Campo | Tipo | Regra |
| --- | --- | --- |
| `id`, `pessoaId` | ids | A pessoa precisa existir |
| `mandatoId` | id de mandato | O mandato pelo qual a pessoa atuou: é o que dá a competência. O mandato tem de ser da pessoa, e a data, ficar dentro do período documentado dele. A casa do mandato tem de ser a instituição da atuação, salvo no Congresso Nacional: em uma comissão mista, a pessoa atua pelo mandato da casa dela |
| `tipo` | `autoria` ou `relatoria` | |
| `instituicao` | uma das instituições | A casa ou o órgão em que a atuação aconteceu |
| `data` | data histórica | A da lei, na autoria que virou lei; a da designação, na relatoria |
| `titulo` | texto | Como o cartão chama o registro, em uma linha |
| `materia` | `{ identificador, ementa, autoria }` | Como o acervo a identifica. Na relatoria, a matéria é de outro autor |
| `desfecho` | `{ tipo, norma, descricao }` | `tipo`: `lei-sancionada`, `lei-promulgada-pelo-legislativo`, `norma-gerada` ou `nao-documentado`. `norma` é obrigatória, salvo em `nao-documentado`, em que é `null` |
| `divergenciaDocumentada` | texto ou `null` | O que cada documento diz e o que o atlas adotou |
| `temas` | lista de temas | Pode ficar vazia; temas repetidos são recusados |
| `fontes`, `editorial` | | Ao menos uma citação quando revisado |

A `descricao` do desfecho diz o que o documento diz do destino e o que ele não diz: se o parecer foi aprovado, por que a promulgação coube à Assembleia, o que a norma produziu.

### Cobertura da pesquisa (`coberturaPolitica.json`)

O que foi pesquisado para uma pessoa, em um tema (ou `geral`) e um período, em quais acervos (`nome`, `url`, `consultadoEm`, `recorte`, `completa`), com `criterios`, `estado` (`completa`, `parcial`, `pendente`) e `lacunas`. É o que separa "a fonte não individualiza" de "a pesquisa ainda não encontrou". Não exige citação: os acervos são a evidência. Tem estado editorial, como os demais.

### Identidade institucional (`identidadesInstitucionais.json`)

A pessoa em cada acervo oficial: `provedor`, `idExterno`, `instituicao`, `validade` (período ou `null`), `fontes`, `editorial`. A pessoa, a matéria e a votação se resolvem por identificadores, nunca por comparação de nome.

### Competência e consulta comparativa

A competência de um mandato para uma decisão segue a regra dos períodos (`competenceOf`, em `src/lib/domain/integrity.ts`): as datas documentadas tocam a data da decisão (`dentro`), provam que não tocam (`fora`) ou não bastam (`nao-confirmada`). Um limite desconhecido nunca vira data. Voto ou ato fora do período documentado do mandato é erro; casa do mandato diferente da casa da decisão é erro; mandato sem `casa` é aviso.

A consulta (`resolveParticipation`, em `src/lib/data/participation.ts`) responde uma de cinco coisas para uma pessoa em uma votação, e nunca um booleano nem `null` com vários sentidos:

| Resposta | Quando |
| --- | --- |
| `registro` | Há voto vigente, com o mandato pelo qual a pessoa participou |
| `nao-se-aplica` | As datas documentadas dos mandatos provam que a pessoa não ocupava cargo com competência naquela casa e data |
| `competencia-nao-confirmada` | Há mandato na casa cujas datas não decidem, ou algum mandato sem a casa declarada |
| `sem-registro-individual` | A pessoa podia votar, e o material não individualiza: votação simbólica ou secreta, ou acervo consultado por inteiro (cobertura `completa`) sem linha da pessoa |
| `pesquisa-pendente` | A pessoa podia votar e a pesquisa do recorte está `parcial`, `pendente` ou não declarada |

Dois modos de comparação, pela política editorial: **mesma votação** (os registros de participação, com "não se aplica" onde não havia competência; nunca promete um voto por linha para os dois) e **mesmo tema** (registros das duas trajetórias por tema, cada um com cargo, instituição, data, tipo e fonte, com a diferença institucional explícita). Sem pontuação, vencedor ou percentual.

## Propostas eleitorais

Entraram na edição 0.3.0 (D-138). Uma proposta eleitoral (`propostasEleitorais.json`) é uma frase do documento que a candidatura registrou na Justiça Eleitoral como proposta de governo. Diz o que o documento propõe. Não é ato, voto nem resultado, e por isso não entra entre as decisões nem na linha do tempo.

| Campo | Tipo | Regra |
| --- | --- | --- |
| `id`, `pessoaId` | ids | A pessoa precisa existir |
| `eleicao` | ano | O ano da eleição a que o documento se refere |
| `tema` | um dos sete temas | Classificação editorial, a justificar na revisão |
| `texto` | texto | Começa por "O documento" e tem até 45 palavras: quem propõe é o documento registrado |
| `ressalva` | texto ou `null` | Sem uso nesta edição: `null` nos 42 registros. Condição e segunda formulação do documento vão no texto da frase. Se voltar a ser usado, não avalia se a frase é precisa, e as duas candidaturas têm o mesmo número (D-149) |
| `fontes`, `editorial` | | Ao menos uma citação quando revisado: a página do documento e a ficha da candidatura que o traz |

A leitura para as telas está em `src/lib/data/proposals.ts`, com os avisos fixos do que uma proposta é e de que três frases por área não são o documento inteiro. Nenhuma tela soma propostas nem as põe em ordem de valor.

## Conteúdo educativo

Entrou na edição 0.3.0, para a trilha do jogo (D-134, [GAME-TRAIL.md](GAME-TRAIL.md)). São três coleções, com estado editorial e a mesma barreira de publicação das demais. As taxonomias e os limites de tamanho estão em `src/lib/domain/game.ts`.

### Fato biográfico (`fatosBiograficos.json`)

Um fato da vida da pessoa anterior à trajetória pública, ou paralelo a ela. Não é acontecimento da linha do tempo; tem as mesmas exigências de evidência.

| Campo | Tipo | Regra |
| --- | --- | --- |
| `id`, `pessoaId` | ids | A pessoa precisa existir |
| `tipo` | `nascimento`, `familia`, `migracao`, `formacao`, `trabalho`, `atuacao-sindical` ou `outro` | |
| `titulo` | texto | |
| `data` | data histórica ou `{ "tipo": "desconhecida" }` | Na precisão que o documento sustenta. Não pode ser posterior à data de corte |
| `texto` | texto | O fato, em uma ou duas frases, só com o que as citações sustentam |
| `divergenciaDocumentada` | texto ou `null` | O que cada documento diz e o que o atlas adotou |
| `fontes`, `editorial` | | Ao menos uma citação quando revisado |

### Conceito (`conceitos.json`)

A definição simples de um termo cívico. Não é fato sobre nenhuma das pessoas, e por isso não tem `pessoaId`: é o que o texto oficial citado diz do termo.

| Campo | Tipo | Regra |
| --- | --- | --- |
| `id` | id | |
| `termo` | texto | |
| `definicao` | texto | Até 45 palavras. Diz só o que as citações sustentam |
| `simplificacao` | texto ou `null` | O que a definição deixa de fora |
| `fontes`, `editorial` | | Ao menos uma citação quando revisado |

### Fase do jogo (`fasesDoJogo.json`)

Um marco, uma explicação curta, uma atividade e o que mais há para explorar no período. O texto é novo, mas não é fonte de fato: a fase não tem `fontes`, e cada bloco aponta os registros publicados que o sustentam.

| Campo | Tipo | Regra |
| --- | --- | --- |
| `id`, `pessoaId` | ids | A pessoa precisa existir |
| `sala` | `historico`, `economia`, `seguranca-publica` ou `investigacao` | A trajetória, um aprofundamento ou a missão de investigação (D-151) |
| `ordem` | inteiro a partir de 1 | A posição na sala. Em cada sala de cada pessoa, as posições vão de 1 em sequência, sem repetição |
| `titulo`, `objetivo` | textos | O objetivo é o que a pessoa sabe ao terminar a fase, em uma frase |
| `periodo` | `{ de, ate }`, em anos | `de` não pode ser maior que `ate` |
| `marco` | referência | O registro principal. Não pode ser conceito nem proposta, e a data dele fica dentro do período |
| `explicacao` | de um a quatro blocos `{ texto, referencias }` | Até 100 palavras no total. Cada bloco aponta ao menos um registro |
| `conceitos` | lista de ids de conceito | Os termos definidos nesta fase, sem repetição |
| `atividade` | pergunta ou ordenação | Abaixo |
| `explorar` | lista de referências | Os outros registros do período, opcionais. Sem repetição e sem conceito |
| `lacunas` | lista de textos | O que a edição não pesquisou neste período |
| `editorial` | estado editorial | |

Uma **referência** é `{ tipo, id }`, com `tipo` em `acontecimento`, `decisao` (um voto, um ato do Executivo ou uma atuação legislativa), `fato`, `mandato`, `filiacao`, `proposta` ou `conceito`. O registro apontado precisa existir e ser da mesma pessoa; um acontecimento compartilhado serve às duas. Fase revisada só aponta o que entra na publicação.

A **atividade** é uma de três:

| Tipo | Campos | Regra |
| --- | --- | --- |
| `pergunta` | `enunciado`, `opcoes` (duas ou três, `{ id, texto }`), `correta`, `explicacao`, `referencias` | Enunciado com até 40 palavras e opção com até 24. `correta` é o `id` de uma das opções |
| `ordem` | `enunciado`, `itens` (duas ou três referências), `explicacao` | Só acontecimento, decisão e fato com data. As datas têm de decidir a ordem: os intervalos de cálculo não se cruzam |
| `dossie` (D-151) | `enunciado`, `fichas` (de duas a quatro, `{ id, texto, evidencia, destaque: { trecho, campo } }`), `distratores` (referências), `explicacao` | Cada ficha tem até 30 palavras e aponta uma decisão (`evidencia.tipo` é `decisao`), distinta das outras fichas; `destaque.trecho` está, igual, em `texto`, e `destaque.campo` é um de `data`, `instituicao`, `cargo`, `objeto` ou `acao`. Os distratores são decisões, sem repetição, e nenhum sustenta ficha. A gaveta (fichas mais distratores) tem até oito documentos |

O piso de 60 palavras da explicação e as regras de redação (todo ano escrito em um bloco está em um registro que ele aponta; cada termo é definido na primeira fase em que aparece) são conferidos por teste sobre o conteúdo publicado, em `tests/game-phases.test.ts`. O cenário e a figura de cada fase não são conteúdo: ficam em `src/lib/game/presentation.ts`, por `id` da fase.

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

Vale para todas as coleções factuais do conjunto (`COLECOES_FACTUAIS_DO_CONJUNTO`, em `src/lib/domain/integrity.ts`): pessoas, mandatos, filiações, acontecimentos, proposições, votações, votos, atos do Executivo, atuações legislativas, cobertura da pesquisa, identidades institucionais, propostas eleitorais, fatos biográficos, conceitos e fases do jogo.

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
| Decisões: mandato da pessoa, data dentro do período do mandato, casa igual à instituição, um voto vigente por pessoa e votação | `validate.ts`, com `competenceOf` | Erro; mandato sem `casa` é aviso |
| Fases do jogo: referência a registro que existe e é da mesma pessoa, marco dentro do período, ordenação que as datas decidem, uma fase por posição em cada sala | `validate.ts` (`referencia-de-outra-pessoa`, `marco-fora-do-periodo`, `ordem-indeterminada`, `posicao-repetida`) | Erro no revisado, pendência no rascunho |
| Tamanho dos textos de fase, de conceito e de proposta, e o começo do texto de uma proposta | `schemas.ts` | Erro |
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
