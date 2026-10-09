# Pipeline de dados

Como o conteúdo pesquisado vira os dados que as páginas leem. Entregue na fase 3. Os motivos de cada escolha estão em [DECISIONS.md](DECISIONS.md), de D-27 a D-36.

O pipeline roda só na máquina de quem edita e no build. Não há servidor, banco nem serviço externo: são scripts locais que leem arquivos do projeto e gravam arquivos no projeto.

## Visão geral

```
content/published/   a edição: edicao.json e sete coleções      (editado à mão)
content/drafts/      pesquisa em andamento e importações        (editado à mão e por data:import)
public/media/        arquivos das imagens cadastradas
        │
        │  npm run data:build
        ▼
   ler ─▶ validar ─▶ selecionar o elegível ─▶ ordenar ─▶ índices e pontos ─▶ conferir a saída ─▶ gravar
        │                                                                        │
        │  com erro: para aqui, código de saída 1, nada é gravado                │
        ▼                                                                        ▼
generated/           dados públicos, manifesto e relatórios      (gerado; nunca editado à mão)
        │
        │  next build / next dev
        ▼
páginas e exploração: leem só generated/dados/
```

Três regras sustentam o resto:

1. **As páginas não leem `content/`.** Leem o que o gerador validou e gravou em `generated/dados/`.
2. **Erro no conteúdo interrompe tudo.** O gerador sai com código 1 e não grava. O build da aplicação não acontece, nem com dados antigos.
3. **A mesma entrada gera os mesmos bytes.** Os dados não guardam horário, e a ordem de tudo é fixa.

## Fontes de entrada

| Pasta | Conteúdo | Quem escreve |
| --- | --- | --- |
| `content/published/` | `edicao.json` e uma lista por coleção: `pessoas`, `mandatos`, `filiacoes`, `acontecimentos`, `lugares`, `fontes`, `imagens` | Edição manual |
| `content/drafts/` | As mesmas listas, parciais, e `importacoes.json` (registro das importações) | Edição manual e `data:import` |
| `public/media/` | Arquivo de cada imagem cadastrada em `imagens.json` | Edição manual |
| `docs/evidencias/` | Trechos conferidos na fase 2. Lido só pelo relatório, nunca pelo build | Não muda |

Regras de leitura:

- Coleção sem arquivo é lista vazia.
- Qualquer outro `.json` nas duas pastas de conteúdo é erro. Um nome digitado errado (`acontecimento.json`) não vira uma coleção vazia em silêncio.
- `edicao.json` só existe em `content/published/`.
- As duas pastas são lidas juntas. Um rascunho pode citar pessoa, lugar e fonte da edição. `id` e `slug` são únicos somando as duas.
- Arquivo salvo com BOM (comum no PowerShell) é aceito.

O contrato de cada registro está em [DATA_MODEL.md](DATA_MODEL.md).

## Pasta gerada

`generated/` é escrita só por `npm run data:build` e fica fora do Git (`.gitignore`). Nada ali é editado à mão: a leitura confere cada arquivo e recusa o que foi alterado.

```
generated/
  manifest.json                       o que foi gerado e de qual entrada
  dados/conjunto.json                 edição e registros elegíveis, em ordem estável
  dados/indices.json                  índices de consulta
  dados/geo/acontecimentos.geojson    todos os pontos do mapa
  dados/geo/pessoas/<slug>.geojson    os pontos de cada pessoa
  relatorio/execucao.json             relatório técnico: horário, duração, diagnósticos
  relatorio/cobertura.md              relatório de cobertura
```

| Parte | Reproduzível | Observação |
| --- | --- | --- |
| `manifest.json` e `dados/` | Sim | Sem horário. Chaves em ordem alfabética, listas em ordem estável |
| `relatorio/execucao.json` | Não | É onde ficam o horário e a duração da execução |
| `relatorio/cobertura.md` | Sim | Mesmo texto de `npm run data:report` |

`manifest.json` traz o identificador do gerador, a versão do formato, a edição, as contagens, a impressão digital da entrada e, para cada arquivo de dados, o tamanho e o resumo SHA-256.

**Impressão digital da entrada.** É um resumo de tudo o que o gerador lê: os JSON das duas pastas, já interpretados, e o resumo do arquivo de cada imagem cadastrada. Como é calculada sobre o JSON interpretado, formatação, fim de linha e ordem dos campos não a alteram. Mudar um valor, acrescentar ou reordenar registros altera.

**Gravação.** O manifesto antigo sai primeiro, os arquivos entram um a um (por arquivo temporário e troca de nome) e o manifesto novo entra por último. Uma gravação interrompida deixa a pasta sem manifesto, e a leitura a recusa. Arquivo igual ao que já existe não é regravado.

**Limpeza.** Depois de gravar, o gerador apaga de `generated/` tudo o que a geração atual não produziu: o GeoJSON de uma pessoa que saiu da edição, por exemplo. Ele só apaga dentro da própria pasta, e só trata uma pasta como sua se ela não existir, estiver vazia ou já tiver um manifesto do gerador. Apontado para outra pasta, recusa e não apaga nada.

## Estados editoriais e elegibilidade

Os estados são os de [EDITORIAL.md](EDITORIAL.md): `rascunho`, `em-revisao` e `revisado`. Valem para pessoa, mandato, filiação e acontecimento. Lugar, fonte e imagem não têm estado: são cadastros de referência.

### Regra de elegibilidade

Um registro com estado editorial entra na publicação quando cumpre as quatro condições:

1. Está em `content/published/`.
2. Tem estado `revisado`, com a revisão identificada (tipo, quem e quando) e ao menos uma citação que diga a fonte, onde está o trecho e o que ele sustenta. É a evidência registrada na fase 2.
3. Respeita o contrato e as regras de datas.
4. Tudo o que ele cita também entra: as pessoas são elegíveis; lugares, fontes e imagens existem em `content/published/`; o arquivo da imagem existe, é do formato da extensão e tem as dimensões declaradas.

Um lugar, uma fonte ou uma imagem entra quando está em `content/published/` e é usado por ao menos um registro elegível.

| Situação | O que acontece |
| --- | --- |
| Falha na condição 1 ou 2 (rascunho, em revisão, ou revisado ainda em `content/drafts/`) | Fica fora. Aparece como pendência no relatório. Não impede nada |
| Cumpre 1 e 2 e falha em 3 ou 4 | **Erro.** A geração para |
| Lugar, fonte ou imagem que só um rascunho usa, ou que ninguém usa | Fica fora dos dados públicos. Sem uso nenhum, gera aviso |
| Identificador com o prefixo `sintetico-` nas pastas de conteúdo | **Erro.** Dado de teste nunca é publicado |

O terceiro caso da tabela é o que impede a pesquisa em andamento de vazar: uma fonte cadastrada para um rascunho não aparece nos dados públicos.

O segundo caso é proposital. Um registro dado como revisado que depende de algo que não pode ser publicado (uma pessoa em revisão, uma fonte ainda nos rascunhos) é uma incoerência a corrigir. Se ele apenas ficasse fora, mudar o estado de uma pessoa faria sumir do site, em silêncio, todos os acontecimentos dela.

A regra não distingue revisão `assistida-por-ia` de `humana`: as duas são `revisado`. Exigir revisão humana para publicar é decisão da fase 9 (D-22).

### Promover um rascunho

Não há comando: é uma edição consciente, em quatro passos.

1. Completar a pesquisa no registro, em `content/drafts/`, e conferir cada afirmação contra as fontes.
2. Trocar `editorial` para `revisado`, com `revisao` preenchida com o tipo real (`humana` só quando uma pessoa conferiu) e apagar `pendencias`.
3. Mover o registro para o arquivo de mesmo nome em `content/published/`. Mover junto os lugares, fontes e imagens que ele cita e que só existam em `content/drafts/`.
4. Registrar a mudança em `alteracoes` de `content/published/edicao.json`, subir a versão (regra em EDITORIAL.md, seção Correção) e rodar `npm run data:validate`.

Se o passo 3 for esquecido, o relatório avisa: "Marcado como revisado, mas está em content/drafts".

## Diagnósticos

Todo diagnóstico tem arquivo, entidade, `id`, campo e motivo, em português:

```
content/published/acontecimentos.json · acontecimento "lula-2002-eleito-presidente" · fontes[0].fonteId: Referência a fonte inexistente: "tse-resultado-2002".
```

| Severidade | Consequência |
| --- | --- |
| `erro` | Impede a geração. Código de saída 1 |
| `pendencia` | Pesquisa ou revisão em aberto. O registro fica fora da publicação. Não impede nada |
| `aviso` | Algo a conferir. Não tira nada da publicação |

A severidade segue uma regra só:

- Arquivo ou registro fora do contrato é erro, em qualquer pasta. Um rascunho pode estar incompleto de fontes; não pode ter data impossível nem campo desconhecido.
- Problema entre registros é erro quando atinge a publicação e pendência quando atinge só um rascunho. Um rascunho que cita uma fonte ainda não cadastrada gera pendência. Um revisado na mesma situação gera erro.

| Código | Severidade | Quando |
| --- | --- | --- |
| `json-ilegivel` | erro | O arquivo não é JSON válido |
| `arquivo-fora-do-contrato` | erro | Arquivo `.json` que não é da pasta |
| `formato-de-arquivo` | erro | O arquivo de uma coleção não é uma lista |
| `edicao-ausente` | erro | Há registros em `content/published/` e falta `edicao.json` |
| `estrutura` | erro | Campo ausente, desconhecido, de tipo errado, data impossível, período incoerente, coordenada fora dos limites, revisado sem citação |
| `id-duplicado`, `slug-duplicado` | erro | `id` repetido na coleção, ou `slug` repetido em pessoas ou em acontecimentos, somando as duas pastas |
| `referencia-repetida` | erro | A mesma pessoa ou o mesmo lugar duas vezes no acontecimento; a mesma pessoa duas vezes na cobertura |
| `dado-sintetico` | erro | Prefixo `sintetico-` nas pastas de conteúdo |
| `referencia-inexistente` | erro ou pendência | Cita pessoa, lugar, fonte ou imagem que não existe |
| `referencia-fora-da-publicacao` | erro | Revisado que cita algo que não entra na publicação |
| `data-apos-corte` | erro ou pendência | Data, ou limite de período, depois da data de corte da edição |
| `fonte-incoerente` | erro ou pendência | Documento datado depois do dia em que foi acessado |
| `midia-ausente`, `midia-invalida`, `midia-dimensoes` | erro ou pendência | Arquivo da imagem não existe, não é do formato da extensão, ou tem dimensões diferentes das declaradas |
| `saida-invalida` | erro | A saída montada não passou na conferência final. É defeito do gerador |
| `rascunho`, `nao-revisado`, `revisado-em-rascunhos` | pendência | O registro não cumpre as condições 1 ou 2 da elegibilidade |
| `rascunho-sem-pendencia` | aviso | Registro em pesquisa que não diz o que falta |
| `sem-uso` | aviso | Lugar, fonte ou imagem que nenhum registro usa |
| `filiacoes-sobrepostas` | aviso | Duas filiações da mesma pessoa com datas conhecidas que se sobrepõem |
| `sem-cobertura`, `fora-da-cobertura` | aviso | A edição não declara a cobertura de uma pessoa, ou um acontecimento cai fora dela |
| `alteracao-sem-registro` | aviso | O registro de alterações cita um registro que não existe |

"Erro ou pendência" segue a regra acima: erro no que vai para a publicação, pendência no rascunho.

Detalhes que evitam ruído:

- Com um arquivo ilegível, as relações entre registros não são conferidas naquela rodada. Primeiro se corrige a leitura.
- Referência a um registro recusado pelo contrato não é apontada como inexistente. O erro já está no próprio registro.
- Registro sem `id` legível é apontado pela posição na lista: `[2].id`.

### O que é conferido

| Pedido | Como |
| --- | --- |
| Estrutura dos arquivos e tipos dos campos | Schemas Zod, registro por registro, com objetos estritos |
| `id` e `slug` únicos | `id` por coleção; `slug` em pessoas e em acontecimentos; as duas pastas somadas |
| Referências entre entidades | Pessoa, lugar, fonte e imagem de cada registro; pessoas da cobertura; itens do registro de alterações |
| Campos e evidências do estado editorial | Revisado exige revisão identificada e ao menos uma citação completa |
| Datas reais e precisão | Formato tem de concordar com a precisão; dia e mês precisam existir; ano entre 1800 e 2100 |
| Coerência dos intervalos | Início não pode ser posterior ao fim; nada depois da data de corte; documento não pode ser posterior ao acesso |
| Longitude e latitude | Números finitos, dentro dos limites; lugar brasileiro dentro do território, o que pega a troca dos dois valores; nos pontos, a ordem `[longitude, latitude]` é conferida contra os campos nomeados do lugar |
| Arquivos de mídia | Arquivo existe, é do formato da extensão e tem as dimensões declaradas (lidas de JPEG, PNG e WebP) |

## Dados públicos

### `dados/conjunto.json`

O mesmo formato do conteúdo ([DATA_MODEL.md](DATA_MODEL.md)): `edicao` e as sete coleções, só com o que é elegível. Sem edição publicada, `edicao` é `null` e as listas ficam vazias.

Ordem de cada lista:

| Lista | Ordem |
| --- | --- |
| `acontecimentos` | Cronológica: primeiro quem pode ter começado antes; no empate, a data mais precisa; no empate final, o `id` |
| `mandatos`, `filiacoes` | Por pessoa, depois pelo início do período (sem início conhecido, pelo fim), depois pelo `id` |
| `pessoas`, `lugares`, `fontes`, `imagens` | Pelo `id` |
| Dentro do registro (`pessoaIds`, `lugarIds`, `fontes`) | A do conteúdo: ali a ordem é editorial |

Texto é comparado pelo código dos caracteres, e não pelas regras de um idioma, para o resultado ser igual em qualquer máquina.

A ordem de `pessoas` é técnica. A ordem em que os perfis aparecem na interface é decisão de apresentação (`PROFILES`, D-14).

### `dados/indices.json`

Listas de `id`, nunca cópias de registros. Toda lista de acontecimentos está em ordem cronológica.

```json
{
  "acontecimentos": {
    "porId":        { "<id>": 0 },
    "porSlug":      { "<slug>": "<id>" },
    "porPessoa":    { "<pessoaId>": ["<id>", "..."] },
    "porAno":       { "2003": ["<id>"] },
    "porCategoria": { "eleicoes": ["<id>"], "marcos-historicos": [] },
    "porLugar":     { "<lugarId>": ["<id>"] },
    "semPonto":     { "nacional": ["<id>"], "desconhecida": ["<id>"] },
    "anos":         { "primeiro": 1975, "ultimo": 2026 }
  },
  "pessoas":   { "porId": { "<id>": 0 }, "porSlug": { "<slug>": "<id>" } },
  "mandatos":  { "porId": { "<id>": 0 }, "porPessoa": { "<pessoaId>": ["<id>"] } },
  "filiacoes": { "porId": { "<id>": 0 }, "porPessoa": { "<pessoaId>": ["<id>"] } },
  "lugares":   { "porId": { "<id>": 0 } },
  "fontes":    { "porId": { "<id>": 0 } },
  "imagens":   { "porId": { "<id>": 0 } }
}
```

- `porId` leva à posição do registro na lista correspondente de `conjunto.json`.
- `porAno` só tem os anos com algum acontecimento. `anos` é o intervalo do conjunto, ou `null` quando está vazio.
- `porCategoria` tem sempre as cinco categorias, mesmo vazias.
- Um acontecimento com duas pessoas aparece nas duas listas de `porPessoa`; com dois lugares, nas duas de `porLugar`.

O ano de um acontecimento é o ano da sua data. Toda data, de qualquer precisão, cai dentro de um único ano; por isso o índice por ano responde a um recorte sem inventar dia nem mês.

### GeoJSON

`dados/geo/acontecimentos.geojson` é uma `FeatureCollection` de pontos. Cada ponto é o encontro de um acontecimento com um de seus lugares documentados.

```json
{
  "type": "Feature",
  "id": "lula-2023-intervencao-federal-no-distrito-federal@brasilia",
  "geometry": { "type": "Point", "coordinates": [-47.7969, -15.7812] },
  "properties": {
    "eventId": "lula-2023-intervencao-federal-no-distrito-federal",
    "placeId": "brasilia",
    "acontecimentoSlug": "lula-2023-intervencao-federal-no-distrito-federal",
    "titulo": "Lula decreta intervenção federal na segurança pública do Distrito Federal",
    "categoria": "atuacao-institucional",
    "pessoaIds": ["lula"],
    "ano": 2023,
    "dataValor": "2023-01-08",
    "dataPrecisao": "dia",
    "lugarNome": "Brasília",
    "precisaoGeografica": "municipio"
  }
}
```

| Propriedade | Uso |
| --- | --- |
| `eventId`, `placeId` | Identificadores estáveis do acontecimento e do lugar. O `id` do ponto é `eventId@placeId` |
| `acontecimentoSlug` | Seleção e endereço do acontecimento |
| `pessoaIds`, `categoria`, `ano` | Filtros de pessoa, categoria e período |
| `dataValor`, `dataPrecisao` | A data como está no conteúdo, sem completar o que a fonte não dá |
| `lugarNome`, `precisaoGeografica` | Leitura e aviso de aproximação: `municipio`, `uf` e `pais` não são pontos exatos |

Regras:

- **Um ponto por lugar documentado.** Acontecimento com dois lugares gera dois pontos, com o mesmo `eventId`. Na lista de acontecimentos ele continua aparecendo uma vez.
- **Sem lugar, sem ponto.** Acontecimento de abrangência nacional ou sem lugar documentado não entra no GeoJSON. Continua em `conjunto.json`, nos índices (`semPonto`) e nas consultas.
- **Só o que está documentado.** Só existem pontos. A ordem cronológica dos acontecimentos não é um trajeto, e o gerador não produz nenhuma linha entre eles.
- **Coleção vazia é válida.** Sem pontos elegíveis, o arquivo é gravado com `features: []`.
- **Ordem.** Os pontos seguem a ordem dos acontecimentos e, dentro de cada um, a ordem dos lugares no registro.

`dados/geo/pessoas/<slug>.geojson` traz o recorte de cada pessoa, com as mesmas propriedades. Um acontecimento compartilhado aparece nos dois arquivos.

`pessoaIds` é uma lista. Serve para filtrar no JavaScript, que é como a interface filtra hoje (`filterPoints`). Expressões de estilo do MapLibre não leem listas dentro de propriedades; se a fase 6 quiser filtrar na camada, usa `eventId` contra o conjunto de acontecimentos visíveis.

## Consultas

Em `src/lib/data/queries.ts`. São funções puras, sem leitura de arquivo e sem Zod: rodam no build e no navegador. Todas recebem o `AtlasData` (`{ conjunto, indices, pontos }`).

| Função | Devolve |
| --- | --- |
| `listProfiles(data)` | As pessoas do conjunto |
| `findPersonById`, `findPersonBySlug` | A pessoa, ou `null` |
| `findEventById`, `findEventBySlug` | O acontecimento, ou `null` |
| `filterEvents(data, filtro)` | Acontecimentos do recorte, em ordem cronológica |
| `listEventsAtPlace(data, lugarId)` | Acontecimentos documentados em um lugar |
| `listMandates`, `listAffiliations` | Mandatos ou filiações de uma pessoa que tocam o período, com a situação |
| `getEventView(data, acontecimento)` | Visão de leitura: pessoas, lugares e citações com as fontes |
| `getEventPlaces(data, acontecimento)` | Lugares do acontecimento, na ordem do registro |
| `getSources(data, registro)` | Fontes de qualquer registro com citações |
| `compareTrajectories(data, filtro)` | Uma trajetória por pessoa no mesmo recorte, e os acontecimentos compartilhados |
| `filterPoints(pontos, acontecimentos)` | Os pontos de um conjunto de acontecimentos (em `points.ts`) |

### Filtros

`filterEvents` aceita `pessoaIds`, `periodo`, `categorias` e `lugarIds`.

- **Dimensões diferentes se somam (E).** Pessoa A, de 2003 a 2010, na categoria eleições: só o que cumpre as três.
- **Valores da mesma dimensão se alternam (OU).** Duas categorias: acontecimentos de qualquer uma delas. Duas pessoas: de qualquer uma delas.
- **Dimensão vazia ou ausente não restringe.** Lista vazia de categorias significa todas.
- **Sem repetição.** Um acontecimento ligado a duas pessoas pedidas, ou a dois lugares pedidos, aparece uma vez.
- **Ordem.** Sempre a cronológica do conjunto, com o `id` como desempate.

### Limites do período

- O período é em anos, com as duas pontas inclusas: `{ de: 2003, ate: 2010 }` inclui 2003 e 2010.
- Um único ano é `de` igual a `ate`, e inclui as datas parciais daquele ano: um acontecimento de "março de 2003" ou só de "2003" entra em 2003.
- Lado `null` ou ausente fica aberto. `{ de: 2012 }` vai de 2012 em diante.
- Informado ao contrário (`de: 2010, ate: 2003`), é lido na ordem certa.

### Mandatos e filiações no período

Cada resultado traz `situacao`:

| Situação | Significado |
| --- | --- |
| `documentada` | As datas conhecidas provam que o período do registro toca o recorte |
| `incerta` | A resposta depende de um limite que não está documentado |

Quando as datas provam que não toca, o registro não entra.

- Limite `desconhecida` nunca vira data. Um mandato de início desconhecido e fim em março de 2015 é `documentada` em 2015, `incerta` em 2010 e ausente em 2016.
- Limite `em-curso` vale até a data de corte da edição. Uma consulta sobre anos posteriores não devolve o registro: o conjunto não afirma nada depois do corte.
- Sem período na consulta, entram todos os registros da pessoa.

A interface deve mostrar a diferença entre as duas situações. Os números usados para comparar períodos são regra de cálculo e nunca são devolvidos como datas.

### Consulta sem resultado

- Lista vazia para filtro sem resultado, pessoa que não existe ou lugar que não existe.
- `null` para busca por `id` ou `slug` que não existe, o que inclui todo rascunho.
- Nenhuma consulta lança erro por falta de resultado.
- `compareTrajectories` devolve sempre uma trajetória por pessoa, com listas vazias quando o recorte não tem registros. Lista vazia é falta de registro no atlas, e não falta de atividade.

### Onde roda o quê

| Camada | Pasta | Pode rodar no navegador |
| --- | --- | --- |
| Dados públicos: formato, índices, pontos, consultas | `src/lib/data/` | Sim. Sem `node:*`, sem Zod, sem React |
| Pipeline: validação, elegibilidade, relatório, importação | `src/lib/publication/` | Não é para lá. É puro (sem `node:*`), mas usa o Zod |
| Disco: leitura das pastas, gravação e leitura de `generated/` | `src/lib/content/` | Não. Usa `node:fs` |
| Comandos | `scripts/data.mts` | Não |

As fronteiras são regras de lint (`eslint.config.mjs`). `src/lib/content/published.ts`, que as páginas usam, importa `server-only`.

## Comandos

| Comando | O que faz | Grava |
| --- | --- | --- |
| `npm run data:validate` | Lê as duas pastas e mostra erros, pendências e avisos | Nada |
| `npm run data:build` | Valida e gera `generated/` | `generated/` |
| `npm run data:report` | Relatório de cobertura, pendências e erros, em Markdown | Nada, ou o arquivo de `--out` |
| `npm run data:import -- <arquivo.json>` | Importa um pacote para os rascunhos | `content/drafts/` |
| `npm run data:query -- [filtros]` | Consulta os dados gerados | Nada |

Código de saída: `0` quando deu certo; `1` quando o conteúdo tem erro; `2` quando o comando foi usado de forma errada, ou os dados gerados não existem ou são de outra versão do conteúdo.

`data:report` sai com `0` mesmo havendo erro no conteúdo: o trabalho dele é mostrar. Quem barra é `data:validate` e `data:build`.

Exemplos:

```bash
npm run data:report -- --out docs/DATA-REPORT.md
npm run data:import -- pesquisa/pacote.json --source "Planilha de outubro" --dry-run
npm run data:query -- --pessoa lula --de 2016 --ate 2019 --categorias marcos-historicos
npm run data:query -- --lugar curitiba
npm run data:query -- --acontecimento lula-2002-eleito-presidente
```

Os filtros de `data:query` têm os nomes dos parâmetros de URL do atlas: `--pessoa`, `--de`, `--ate`, `--categorias` e `--acontecimento`, mais `--lugar`.

### Integração com o desenvolvimento e o build

| Comando | O que acontece |
| --- | --- |
| `npm run build` | Roda `data:build` e, se passar, `next build` |
| `npm run dev` | Roda `data:build` e, se passar, `next dev` |
| `npm run check` | Lint, tipos, testes, build (que gera os dados) e conferência da saída |
| `npm run test:e2e` | Sobe o servidor com `npm run dev`, que gera os dados |

Duas garantias além da ordem dos comandos:

- **Build de produção.** Antes de usar os dados, o leitor das páginas recalcula a impressão digital do conteúdo e compara com a do manifesto. Se o conteúdo mudou depois da geração, ou se um arquivo gerado foi alterado, o build para. Chamar `next build` direto, sem gerar, não publica dados antigos.
- **Servidor de desenvolvimento.** Na mesma situação, o leitor regenera os dados na hora. Editar um arquivo de conteúdo e recarregar a página basta. Com erro no conteúdo, a página mostra os diagnósticos.

A rota `/acontecimentos/[slug]` só existe quando o manifesto registra ao menos um acontecimento (D-06). O Next lê isso ao iniciar: quando o primeiro acontecimento for publicado com o servidor aberto, é preciso reiniciá-lo.

Os scripts rodam o TypeScript do projeto direto no Node, sem compilar. Exigem Node 22.18 ou mais novo (D-27).

## Importação

`npm run data:import -- <arquivo.json>` recebe um pacote com listas por coleção, no mesmo formato dos arquivos de conteúdo:

```json
{
  "acontecimentos": [
    {
      "id": "lula-1983-fundacao-da-cut",
      "slug": "lula-1983-fundacao-da-cut",
      "pessoaIds": ["lula"],
      "titulo": "...",
      "data": { "valor": "1983-08", "precisao": "mes" },
      "categoria": "marcos-historicos",
      "resumo": "...",
      "contexto": "...",
      "localizacao": { "tipo": "desconhecida" },
      "imagemId": null,
      "fontes": [{ "fonteId": "nova-fonte", "localizacao": "...", "evidencia": "..." }]
    }
  ],
  "fontes": [{ "id": "nova-fonte", "titulo": "...", "autoria": "...", "url": "https://...", "dataDocumento": { "tipo": "desconhecida" }, "acessadoEm": "2026-10-09" }]
}
```

O campo `editorial` pode faltar. As coleções aceitas são as sete; `edicao` não é importável.

Regras:

- **Tudo entra como rascunho.** Pessoas, mandatos, filiações e acontecimentos são gravados com estado `rascunho`, seja qual for o estado declarado no pacote. Uma revisão feita na origem não é aceita, e o registro sai com a pendência de refazê-la. Lugares, fontes e imagens, que não têm estado, entram em `content/drafts/` e por isso ficam fora da publicação.
- **Nada existente é alterado.** A importação só acrescenta registros aos arquivos de `content/drafts/`. Nunca escreve em `content/published/` nem em `generated/`.
- **Conflito é recusa.** `id` já usado na coleção, em qualquer das duas pastas, ou `slug` já usado: o registro importado é recusado e o existente fica como está. Para atualizar um rascunho, edite o arquivo.
- **Cadastro repetido e igual não é conflito.** Um lugar, uma fonte ou uma imagem idêntico ao que já existe é listado como "já existente" e não é gravado de novo. Assim um pacote pode trazer junto as fontes que cita.
- **Dado sintético é recusado.**
- **Origem anotada.** Cada registro factual importado recebe em `pendencias` a nota "Importado de ... em ...".

Resultado de cada item:

| Grupo | Significado | Gravado |
| --- | --- | --- |
| Aceito | Respeita o contrato, tem ao menos uma citação e todas as referências existem | Sim, como rascunho |
| Pendente | Respeita o contrato, mas falta algo antes da revisão: sem fonte, referência a registro inexistente, data depois do corte, revisão declarada na origem | Sim, como rascunho, com as pendências escritas no registro |
| Rejeitado | Fora do contrato, conflito de `id` ou de `slug`, dado sintético, coleção desconhecida | Não |
| Já existente | Lugar, fonte ou imagem igual a um registro existente | Não |

O relatório sai no terminal. Origem e resultado ficam em `content/drafts/importacoes.json`, uma linha por importação: data, nome e resumo SHA-256 do arquivo, descrição dada em `--source` e os quatro grupos. Esse arquivo é versionado com o conteúdo.

`--dry-run` mostra o que aconteceria e não grava nada.

**Importar não publica.** Depois de importar, o registro segue o caminho de qualquer rascunho: pesquisa, revisão e promoção.

Coletores de sites e integrações recorrentes não foram feitos. Quando houver uma necessidade concreta, o coletor produz um pacote neste formato e usa o mesmo comando.

## Relatório de cobertura

`npm run data:report` mostra, a partir do conteúdo atual:

- situação: erros, pendências e avisos;
- totais de registros elegíveis, de acontecimentos fora da publicação e de pontos;
- por pessoa: elegíveis, rascunhos, mandatos, filiações e pontos;
- por período: década a década, e os intervalos de quatro anos ou mais sem acontecimentos dentro da cobertura declarada;
- por categoria;
- lugares, precisão das coordenadas e das datas;
- registros fora da publicação, com o motivo e as pendências de cada um;
- quantas citações de registros elegíveis têm trecho literal registrado em `docs/evidencias/`;
- a lista de erros, pendências e avisos.

O relatório não tem horário e é reproduzível. Uma cópia da edição 0.1.0 está em [DATA-REPORT.md](DATA-REPORT.md).

## Procedimento de atualização

### Corrigir um registro publicado

1. Editar o registro em `content/published/<colecao>.json`.
2. Se a correção muda uma afirmação, conferir de novo contra a fonte e atualizar `editorial.revisao` com quem conferiu e quando.
3. Registrar em `alteracoes` de `content/published/edicao.json`: data, descrição e os registros afetados (`{ "entidade": "acontecimento", "id": "..." }`). Subir a versão: terceiro número para correção, segundo para inclusão (EDITORIAL.md, seção Correção).
4. `npm run data:validate`. Corrigir o que aparecer como erro. A mensagem aponta o arquivo, o registro e o campo.
5. `npm run data:build`, ou simplesmente `npm run dev` ou `npm run build`, que já geram.
6. Conferir a página do registro e, antes de entregar, `npm run check`.

### Tirar um registro do ar

Trocar o estado para `em-revisao`, com a pendência escrita, ou mover o registro para `content/drafts/`. Na geração seguinte ele sai dos dados e a página deixa de existir. Se outro registro revisado depender dele, a validação acusa erro e diz qual.

### Incluir um acontecimento novo

Escrever o registro em `content/drafts/acontecimentos.json`, ou importar um pacote. Cadastrar as fontes. Pesquisar, revisar e promover (seção "Promover um rascunho").

### Atualizar a edição

Mudar `dataDeCorte`, `versao`, `revisao` e `cobertura` em `content/published/edicao.json`. A validação recusa acontecimento ou período posterior à nova data de corte e avisa quando um acontecimento cai fora da cobertura declarada.

### Quando algo dá errado

| Mensagem | Causa | O que fazer |
| --- | --- | --- |
| `Geração interrompida: N erro(s)` | Erro no conteúdo | Ler os erros listados acima da mensagem, corrigir e gerar de novo |
| `Dados gerados não encontrados em ...` | `generated/` não existe ou ficou sem manifesto | `npm run data:build` |
| `... foram gerados a partir de outra versão do conteúdo` | O conteúdo mudou depois da geração | `npm run data:build` |
| `... foi alterado depois de gerado` | Um arquivo de `generated/` foi editado | `npm run data:build`. Nunca editar essa pasta |
| `A pasta ... tem arquivos que não são do gerador de dados` | A saída foi apontada para outra pasta | Conferir o caminho. Nada foi apagado |
| `Conteúdo inválido (N erros)` na página, em desenvolvimento | Erro no conteúdo, visto pelo leitor | Corrigir o arquivo e recarregar |

## Evolução para banco e painel editorial

O pipeline foi desenhado para que essa passagem troque as pontas e mantenha o meio.

O que fica igual:

- **Os contratos.** Os schemas Zod de `src/lib/domain/schemas.ts` validam a entrada de um painel do mesmo jeito que validam os arquivos.
- **A regra de elegibilidade e os diagnósticos.** `buildAtlasData` recebe os registros em memória, sem saber de onde vieram. Ele não lê arquivo.
- **O formato dos dados públicos.** `conjunto.json`, `indices.json` e os GeoJSON, e portanto as consultas e as páginas.
- **A separação entre importar e publicar,** e a recusa de sobrescrever registro existente.

O que troca:

| Hoje | Com banco e painel |
| --- | --- |
| `readSources` lê duas pastas | Um leitor que consulta as tabelas e devolve o mesmo formato (`Sources`) |
| A pasta diz se o registro é da edição ou rascunho | Uma coluna de situação, ou a própria tabela de edições |
| `id` como chave em arquivos | Os mesmos `id` como chave primária; as referências já são por `id` |
| A citação dentro do registro | Tabela de ligação entre registro e fonte, com trecho e evidência |
| `editorial` dentro do registro | Colunas de estado, tipo de revisão, quem e quando; o histórico vira trilha de auditoria |
| `importacoes.json` | Tabela de importações |
| Promoção manual entre arquivos | Ação do painel, com permissão própria |
| `data:build` chamado no build | O mesmo comando, lendo do banco, chamado no build ou ao publicar pelo painel |

O site continua estático: o banco alimenta o gerador, e não as páginas. Esse passo só se justifica com edição frequente por mais de uma pessoa (plano, seção 10).
