# Arquitetura

Descreve o que está implementado até a fase 9 e na primeira etapa do jogo, e o que cada espaço reservado vai receber. Os motivos de cada escolha estão em [DECISIONS.md](DECISIONS.md). O jogo tem documento próprio, [GAMEPLAY.md](GAMEPLAY.md): fluxo, capítulos, regras, progresso e direção visual. O pipeline de dados tem documento próprio, [DATA-PIPELINE.md](DATA-PIPELINE.md), e a interface tem sete: [UX.md](UX.md), [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md), [INTERACTIONS.md](INTERACTIONS.md), [TIMELINE.md](TIMELINE.md), [MAP.md](MAP.md), [COMPARISON.md](COMPARISON.md) e [PAGES.md](PAGES.md). O que cada página carrega, e as medições, estão em [PERFORMANCE.md](PERFORMANCE.md).

## Visão geral

Uma única aplicação Next.js (App Router) que vira um site de arquivos estáticos. O conteúdo é JSON versionado dentro do projeto. Um gerador local valida o conteúdo, seleciona o que é elegível e grava os dados públicos. No build, as páginas leem só esses dados e geram HTML. No navegador, a exploração (lista, mapa, linha do tempo, painel) recebe os mesmos dados e trabalha sobre um estado único, guardado no endereço. O jogo é um segundo caminho sobre os mesmos dados: recebe, no build, só os registros que os capítulos citam, e guarda o progresso de quem joga no navegador.

```
content/published/  content/drafts/  public/media/
        │
        │  npm run data:build   (src/lib/content lê; src/lib/publication valida,
        │                        seleciona e monta; src/lib/content grava)
        ▼
generated/dados/   conjunto.json · indices.json · geo/*.geojson
        │
        │  getAtlasData()   (só no build; `server-only`; confere manifesto e conteúdo)
        ▼
┌───────────────────────────────────────┴─────────────────┐
▼                                                          ▼
páginas em src/app (Server Components)        props com AtlasData: conjunto, índices e pontos
HTML estático por rota em out/                             │
                                                           ▼
                                      exploração no navegador (Client Components)
                                      AtlasUrlStateProvider: endereço ⇄ estado + recorte visível
                                        ├─ EventList   lista
                                        ├─ Timeline    linha do tempo e recorte
                                        ├─ MapView ──▶ MapCanvas (MapLibre)
                                        └─ EventPanel  leitura
                                      consultas puras: src/lib/data/queries.ts
```

## Camadas

| Camada | Pasta | Responsabilidade | Não pode |
|---|---|---|---|
| Domínio | `src/lib/domain/` | Tipos, schemas, regras de datas e lugares, ordem estável, integridade, perfis previstos | Ler arquivos, usar React, importar outras camadas |
| Dados públicos | `src/lib/data/` | Formato do que as páginas consomem, índices, pontos do mapa e consultas | Ler arquivos, usar o Zod em tempo de execução, usar React |
| Pipeline | `src/lib/publication/` | Validação com diagnósticos, elegibilidade, montagem dos dados, relatório de cobertura, plano de importação | Ler arquivos, usar React |
| Disco | `src/lib/content/` | Ler `content/`, gravar e ler `generated/`, sondar arquivos de mídia, orquestrar os comandos | Ser importada por código do navegador |
| Estado | `src/lib/state/` | Estado da exploração e da comparação, seletores, parâmetros de URL, regras do endereço e do histórico, endereços entre telas com o contexto de retorno (`links.ts`), leitura do endereço no navegador (`location.tsx`) e os dois providers (memória e endereço) | Ler arquivos, importar Zod em tempo de execução |
| Jogo | `src/lib/game/` | Capítulos (identificadores de acontecimentos, tarefa e cenário), cenários, regras de missão, progresso e formato salvo, e o mundo: projeção isométrica, grade e colisão, movimento, alcance, câmera e direcional de toque | Ler arquivos, usar React, escrever conteúdo editorial |
| Mídia | `src/lib/media/` | Molduras, larguras e nomes das versões preparadas dos retratos, e o manifesto do que foi gerado | Ler arquivos: o manifesto só é lido pelos comandos e pelos testes |
| Configuração | `src/lib/site.ts` | O que depende de decisão do responsável pelo projeto: domínio público, indexação e canal público de correção, todos ainda sem valor | Guardar conteúdo editorial |
| Editorial | `src/lib/editorial/` | Funções puras sobre o conjunto publicado que servem à publicação, e não às telas: a lista de revisão humana (`human-review.ts`, para `npm run review:human`) e a barreira de release (`release.ts`, para `npm run verify:release`, que recusa a publicação sem revisão humana, domínio e canal) | Escrever conteúdo editorial, registrar revisão como humana, usar React |
| Funcionalidades | `src/features/` | Mapa, acontecimentos, linha do tempo, comparação e o jogo (casca, palco, desenho, motor e interface) | Ler arquivos, guardar seleção própria |
| Componentes | `src/components/` | Base visual compartilhada: cabeçalho, rodapé, retrato, cartão de pessoa, data, categoria, fontes, revisão, identificação da edição, perfil, cópia de link e as peças da linha do tempo (`time/`) | Ler arquivos, guardar estado da exploração |
| Rotas | `src/app/` | Páginas. Único lugar que chama `getAtlasData()` e entrega os dados por props | |
| Comandos | `scripts/` | Linha de comando dos dados, preparo dos retratos, ajuste e conferência da saída estática, pré-visualização e medições | |

As fronteiras são verificadas, e não só combinadas:

- `eslint.config.mjs` proíbe o domínio e o pipeline de importar `node:*`, React, Next e as camadas de interface, e proíbe dados públicos, estado, jogo, funcionalidades e componentes de importar `@/lib/content/*`, `@/lib/publication/*`, `node:*` ou os schemas Zod (tipos são permitidos). As regras do jogo (`src/lib/game/`), como os dados públicos, também não podem importar React nem a interface.
- `src/lib/content/published.ts` importa `server-only`: se um componente do navegador importá-lo, o build falha.
- Tipos para o navegador saem de `src/lib/domain/types.ts` e de `src/lib/data/types.ts`, que só têm tipos. O Zod não entra no bundle (conferido na saída: nenhum arquivo de `out/` contém o Zod).
- `tsconfig.json` tem `erasableSyntaxOnly`: os módulos que os comandos carregam direto no Node só usam sintaxe que some ao remover os tipos (D-27).

### Domínio em detalhe

| Arquivo | Conteúdo |
|---|---|
| `dates.ts` | Precisão de datas, validação de calendário, intervalo de cálculo, ordenação, apresentação, coerência de períodos, relação entre um período e um recorte |
| `order.ts` | Ordem estável: texto pelo código dos caracteres, acontecimentos por data, períodos por pessoa |
| `geo.ts` | Coordenadas nomeadas, conversão para a ordem GeoJSON, caixa do Brasil, precisão geográfica |
| `categories.ts` | Categorias de acontecimento e rótulos |
| `schemas.ts` | Schemas Zod de todas as entidades e do conjunto, e as mensagens de erro em português (único arquivo do domínio que importa o Zod) |
| `types.ts` | Reexportação só de tipos |
| `integrity.ts` | Regras entre registros e regras de publicação, aplicadas a um conjunto completo. O gerador as usa para conferir a saída |
| `resolve.ts` | Monta a visão de leitura de um acontecimento (pessoas, lugares, citações) |
| `profiles.ts` | Perfis previstos para a primeira edição |

### Dados públicos, pipeline e disco em detalhe

| Arquivo | Conteúdo |
|---|---|
| `data/types.ts` | `AtlasData` (conjunto, índices e pontos) e as propriedades de um ponto |
| `data/indexes.ts` | Monta os índices a partir do conjunto |
| `data/points.ts` | Monta a coleção GeoJSON e recorta os pontos de um conjunto de acontecimentos |
| `data/queries.ts` | Consultas: perfis, acontecimentos por filtro, mandatos e filiações no período ou em uma data, fontes, lugares, imagens e comparação |
| `data/coverage.ts` | Cobertura da edição por pessoa, lacunas de período e a escala comum da comparação. Serve à interface e ao relatório |
| `data/slice.ts` | Recorte dos dados para a página de uma pessoa, com índices e pontos refeitos |
| `publication/sources.ts` | Formato das fontes editoriais lidas, antes de validar |
| `publication/diagnostics.ts` | Diagnóstico: severidade, código, arquivo, entidade, `id`, campo e motivo |
| `publication/validate.ts` | Validação das duas pastas, registro por registro e entre registros |
| `publication/build.ts` | Regra de elegibilidade, seleção, ordenação, montagem e conferência da saída |
| `publication/coverage.ts` | Relatório de cobertura e sua forma em Markdown |
| `publication/import.ts` | Plano de importação e formato do registro de importações |
| `publication/stable-json.ts` | JSON com chaves em ordem alfabética |
| `content/sources.ts` | Leitura de `content/`, caminhos do projeto e impressão digital da entrada |
| `content/media.ts` | Sonda dos arquivos de imagem: formato e dimensões |
| `content/output.ts` | Gravação e leitura de `generated/`, com manifesto |
| `content/pipeline.ts` | As operações com disco: validar, gerar, relatar, importar |
| `content/published.ts` | `getAtlasData()`, o acesso das páginas aos dados |

## O que roda no build e o que roda no navegador

| Parte | Onde roda | Observação |
|---|---|---|
| Páginas `/`, `/politicos/[slug]`, `/comparar`, `/metodologia`, 404 | Build | Server Components. Viram HTML em `out/` |
| Página `/acontecimentos/[slug]` | Build | Uma por acontecimento publicado |
| Gerador de dados (`npm run data:build`) | Antes do build | Node, fora do Next. Grava `generated/` |
| Preparo dos retratos (`npm run images`) | Quando um retrato ou o enquadramento muda | Node, com `sharp`. Grava `public/media/derivados/` e o manifesto. `images:check` roda antes de `dev` e de `build`, sem a biblioteca de imagem, e para o comando se as versões estiverem desatualizadas |
| Ajuste da saída (`scripts/finalize-export.mjs`) | Depois de `next build`, no mesmo `npm run build` | Devolve os arquivos de segmento ao nome que o navegador pede, retira os arquivos do MapLibre que ninguém pede e completa o pré-carregamento das fontes nas páginas de acontecimento (D-77) |
| `getAtlasData`, pipeline, schemas Zod | Build | Nunca chegam ao navegador |
| Consultas de `src/lib/data/` | Build e navegador | Funções puras sobre os dados já gerados |
| `SiteHeader`, `SiteFooter`, `PersonCard`, `SourceList`, `SourceCatalog`, `RecordSources`, `EditionTag`, `TrajectoryLanes` | Build | Sem estado |
| `EventPanel`, `ProfilePanel` | Build ou navegador | Apresentação pura. Servem à página e ao painel |
| `Portrait` | Build e navegador | Componente de cliente, sem estado. É o que mantém a dica de pré-carregamento da imagem só no HTML da página, fora do conteúdo que o roteador busca ao ver um link (D-75) |
| `SiteNav`, `IntentLink` | Navegador | O abrir e fechar do menu em tela estreita, e o sinal de intenção que deixa o roteador adiantar o destino de um link (D-78) |
| `Explorer` (exploração) e `Comparison` (comparação) | Navegador | Client Components. Recebem os dados por props, são pré-renderizados no HTML e hidratados |
| `AtlasUrlStateProvider`, `EventList`, `Timeline`, `MapView` | Navegador | Idem, dentro do `Explorer`. O provider também envolve a `Comparison`. No HTML do build saem com o estado inicial; o endereço é lido depois da hidratação |
| `EventReturn`, `CopyLink`, `CorrectionTemplate` | Navegador | Client Components pequenos dentro de páginas estáticas: o retorno da página do acontecimento, a cópia do link e o modelo de correção. No HTML do build saem sem contexto; o endereço e a origem são lidos depois da hidratação |
| `UrlWatcher` (`src/lib/state/location.tsx`) | Só navegador | Único uso de `useSearchParams`, isolado em um `Suspense` sem saída visual, para as telas continuarem inteiras no HTML gerado. Serve à exploração, à comparação, ao retorno e ao modelo de correção |
| `AtlasStateProvider` | Navegador | Estado em memória, para as telas de prova e os testes |
| Páginas `/jogo` e `/jogo/[personagem]` | Build | Server Components. Montam o recorte do jogo (`buildGameContent`) e o entregam por props. O HTML traz o capítulo, o objetivo e os botões; a cena e o progresso entram no navegador |
| `GameShell`, `CharacterSelect` e a interface do jogo (`ui/`) | Navegador | Client Components. Pré-renderizados com o estado inicial; o progresso salvo é lido depois da hidratação, com `useSyncExternalStore` |
| `GameStage` (palco) e `WorldPreview` (prévia) | Só navegador | Carregados por `next/dynamic` com `ssr: false`. O palco só é pedido em `/jogo/[personagem]`, e a prévia, em `/jogo`. Canvas 2D, sem WebGL |
| Progresso do jogo | Só navegador | `localStorage`, uma chave por personagem, com versão de formato. Nunca vai ao endereço |
| `MapCanvas` (MapLibre) | Só navegador | Carregado por `next/dynamic` com `ssr: false`, e só quando a moldura do mapa está na tela ou perto dela. Não aparece no HTML do servidor. A instância é criada uma vez; filtros e seleção não a recriam |
| Trecho de `layout.tsx` que marca o documento | Só navegador, antes do primeiro desenho | Em um link com consulta, encobre a área que vai mudar até o endereço ser lido (D-83). É o único script escrito dentro do HTML |
| Contornos da base (`terra.geojson`, `estados-br.geojson`) | Só navegador | Arquivos próprios, publicados pelo bundler em `/_next/static/media/` e pedidos ao próprio site |
| Worker do MapLibre | Só navegador | Arquivo próprio, publicado pelo bundler em `/_next/static/media/` |

O mapa é o único ponto que exige WebGL. O palco do jogo exige `window` e canvas 2D, e nunca divide a tela com o mapa: as páginas do jogo não têm mapa, e as páginas com mapa não têm cena. Ele fica atrás do `MapView`, que cuida do carregamento, do estado "Carregando o mapa…", da troca pela lista de lugares quando o mapa falha e da nova tentativa. Nenhuma página depende do mapa para ser lida.

## Fluxo do conteúdo

```
fonte → rascunho → revisão → validação → dados gerados → build
```

| Etapa | Onde | Situação |
|---|---|---|
| Fonte | Páginas institucionais e bases públicas | Catálogo feito na fase 2 (SOURCES.md) |
| Rascunho | `content/drafts/` | Coleções parciais, que citam registros da edição. Recebe também as importações (`npm run data:import`) |
| Revisão | Estado editorial de cada registro (`rascunho`, `em-revisao`, `revisado`) e tipo da revisão (`assistida-por-ia`, `humana`) | Modelado e validado. Na edição 0.1.1 toda revisão é assistida por IA |
| Edição | `content/published/` | Edição 0.1.1. A promoção de um rascunho é manual (DATA-PIPELINE.md) |
| Validação | `npm run data:validate` | Diagnósticos por arquivo, registro e campo, em três severidades |
| Dados gerados | `npm run data:build` grava `generated/` | Só o que é elegível, com índices e GeoJSON |
| Build | `npm run build` | Gera os dados e depois o site. Conteúdo com erro interrompe |

Regras que valem:

- As páginas leem apenas `generated/dados/`. Nenhuma página faz requisição externa, no build ou no navegador.
- Conteúdo com erro interrompe a geração com a lista de problemas, cada um apontando arquivo, registro e campo. O build não acontece, nem com dados de uma geração anterior.
- Rascunho, registro em revisão e dado de teste ficam fora dos dados gerados.
- Sem edição e sem registros, o conjunto é vazio e as páginas dizem que nada foi publicado.

## Rotas

| Rota | Arquivo | Parâmetros | Situação |
|---|---|---|---|
| `/` | `src/app/page.tsx` | | Entrada: propósito, recorte da edição, escolha de pessoa e as duas trajetórias na mesma escala |
| `/politicos/flavio-bolsonaro`, `/politicos/lula` | `src/app/politicos/[slug]/page.tsx`, com `Explorer.tsx` | `generateStaticParams` a partir de `PROFILES`; consulta em `de`, `ate`, `categorias` e `acontecimento` | Exploração: recorte, lista, mapa, linha do tempo e painel, com a consulta no endereço (fase 5). É também a página do perfil: o painel mostra apresentação, cargos, partidos, cobertura, fontes, edição e crédito do retrato (fase 7). A página recorta os dados da pessoa (`sliceForPerson`) antes de entregá-los |
| `/acontecimentos/[slug]` | `src/app/acontecimentos/[slug]/page.published.tsx`, com `EventReturn.tsx` e `EventLocator.tsx` | `generateStaticParams` a partir dos acontecimentos dos dados gerados; contexto de retorno opcional em `de`, `ate`, `categorias` e `origem` | Leitura completa, com retorno, cópia do link, ficha lateral e mapa de localização (ver abaixo) |
| `/comparar` | `src/app/comparar/page.tsx`, com `Comparison.tsx` | Consulta em `de`, `ate` e `categorias` | As duas trajetórias no mesmo período, com as mesmas categorias e na mesma escala, com a consulta no endereço (fase 7, [COMPARISON.md](COMPARISON.md)) |
| `/metodologia` | `src/app/metodologia/page.tsx`, com `CorrectionTemplate.tsx` | `acontecimento`, opcional, para o modelo de correção | Objetivo, seleção, fontes, revisão feita, datas, lugares, limites da comparação, edição, correção, créditos e o catálogo de fontes (fase 7, [PAGES.md](PAGES.md)) |
| `/jogo` | `src/app/jogo/page.tsx` | | Entrada do jogo: escolha do personagem, prévia do mundo, capítulos e onde cada um parou ([GAMEPLAY.md](GAMEPLAY.md)) |
| `/jogo/flavio-bolsonaro`, `/jogo/lula` | `src/app/jogo/[personagem]/page.tsx` | `generateStaticParams` a partir de `PROFILES`. Sem consulta: o progresso fica no navegador | O jogo do personagem, no capítulo em que parou |
| 404 | `src/app/not-found.tsx` | | Com a identidade do projeto. Vira `out/404.html` |
| `/dev/previa` | `src/app/dev/previa/page.dev.tsx` | | Só em desenvolvimento. Guia da prévia: caminhos, tokens e estados de cada componente |
| `/dev/prova` | `src/app/dev/prova/page.dev.tsx` | | Só em desenvolvimento. Dados sintéticos, passados pelo pipeline em memória |
| `/dev/dados` | `src/app/dev/dados/page.dev.tsx` | | Só em desenvolvimento. A mesma tela, com os dados gerados da edição |
| `/dev/jogo-arte` | `src/app/dev/jogo-arte/page.dev.tsx` | | Só em desenvolvimento. Galeria da arte do jogo: personagens, peças e cenas montadas |

Todas usam barra final (`trailingSlash`), e cada rota vira `out/<rota>/index.html`.

**Rotas condicionais.** O `next.config.ts` liga duas extensões de página conforme a situação:

- `page.dev.tsx` só é rota no servidor de desenvolvimento. É o que mantém as telas de prova e as fixtures sintéticas fora do build de produção.
- `page.published.tsx` só é rota quando `generated/manifest.json` registra ao menos um acontecimento. A exportação estática recusa rota dinâmica sem nenhum parâmetro gerado. Quando o primeiro acontecimento for publicado, a rota se liga sozinha no build seguinte. Com o servidor de desenvolvimento aberto é preciso reiniciá-lo, porque a configuração é lida na partida.

**Contrato de `/acontecimentos/[slug]`.** Um endereço por acontecimento dos dados gerados, com o `slug` do registro. Rascunhos não geram página. A página mostra data na precisão conhecida, título, categoria, pessoas com os cargos documentados para aquela data, resumo, contexto, lugares com a precisão da coordenada, fontes com a evidência de cada citação, créditos das imagens, quem revisou e a edição. O retorno leva à exploração de cada pessoa ligada, com `?acontecimento=<slug>`; quem chega por dentro do atlas traz no endereço o recorte de onde veio, e o retorno o devolve (PAGES.md, seção Retorno). Slug fora do conjunto resulta em 404.

## Estado compartilhado

Definido em `src/lib/state/atlas-state.ts`.

| Campo | Tipo | Significado |
|---|---|---|
| `pessoa` | slug ou `null` | Pessoa em foco |
| `periodo` | `{ de, ate }`, anos ou `null` | Recorte de tempo, pontas inclusas. `null` deixa o lado aberto. Um único ano é `de` igual a `ate` |
| `categorias` | lista | Categorias ativas. Vazia significa todas |
| `acontecimento` | slug ou `null` | Acontecimento aberto no painel |
| `comparar` | booleano | Modo de comparação: as duas trajetórias no mesmo recorte |

Ações: `selectPerson`, `setPeriod`, `toggleCategory`, `clearCategories`, `clearFilters`, `selectEvent`, `setComparison`, `restore`.

Seletores puros, em `selectors.ts`:

- `selectVisibleEvents(dados, estado)`: acontecimentos do recorte, em ordem cronológica. Traduz o estado em um filtro e chama `filterEvents`, das consultas; a regra de filtragem existe em um lugar só.
- `selectSelectedEvent(visiveis, estado)`: o acontecimento aberto.
- `selectComparison(dados, estado)`: uma trajetória por pessoa no recorte do estado. Entrega o período e as categorias a `compareTrajectories`, das consultas.
- `settle(estado, dados, cobertura)`: ajusta o período à cobertura da edição (`fitPeriod`) e aplica a regra de consistência.
- `transition(estado, ação, dados, cobertura)`: aplica a ação e chama `settle`.

**Regra de consistência.** O acontecimento selecionado sempre pertence ao recorte visível. Se um filtro o esconde, a seleção é desfeita. Como lista, mapa e painel leem o mesmo `visible` e o mesmo `selected` do provider, eles não têm como mostrar recortes diferentes.

**Identidade do recorte.** No provider do endereço, o período, as categorias e o recorte visível mantêm a mesma identidade enquanto não mudam. Abrir ou fechar um acontecimento muda o endereço, mas não refaz a lista, os pontos do mapa nem as contagens (D-81).

**Onde o estado fica.** Dois providers entregam o mesmo contrato (`useAtlas()`: `state`, `dispatch`, `data`, `visible`, `visibleIds` e `selected`):

| Provider | Onde o estado fica | Quem usa |
| --- | --- | --- |
| `AtlasUrlStateProvider` | No endereço. O estado é derivado da query string a cada renderização, e `dispatch` escreve um endereço novo | A exploração (`/politicos/<slug>`) e a comparação (`/comparar`, com `pessoa={null}` e `comparar`) |
| `AtlasStateProvider` | Em memória, com `useReducer` | As telas de prova (`/dev/prova`, `/dev/dados`) |

## Parâmetros de URL e restauração

A tradução entre estado e query string existe desde a fase 1 (`url-params.ts`). A fase 4 passou a ler o endereço na chegada, e a fase 5 fechou o ciclo: o endereço é a fonte do estado da exploração, com escrita, voltar e avançar. O funcionamento completo, com exemplos, está em [TIMELINE.md](TIMELINE.md), seção Endereço.

A rota define quem e como; a query string define o recorte:

| Origem | Informação |
|---|---|
| `/politicos/<slug>` | `pessoa` igual ao slug, `comparar` desligado |
| `/comparar` | `comparar` ligado, sem pessoa em foco e sem acontecimento aberto |
| `?de=AAAA&ate=AAAA` | Período. Um único ano usa o mesmo valor nos dois |
| `?categorias=a,b` | Categorias, separadas por vírgula |
| `?acontecimento=<slug>` | Acontecimento aberto |

Exemplo: `/politicos/lula/?de=2016&ate=2019&categorias=marcos-historicos&acontecimento=lula-2018-prisao-em-curitiba`.

Regras (ao carregar, recarregar, voltar ou avançar):

1. O endereço é a fonte da verdade. O estado é derivado dele por `stateFromSearch`, uma função pura; não há uma segunda cópia para sincronizar.
2. A leitura é tolerante. Cada parâmetro inválido é descartado sozinho, sem derrubar os demais: ano fora do formato, categoria desconhecida, slug malformado.
3. Um período informado ao contrário (`de=2010&ate=2003`) é lido na ordem certa.
4. O período fica dentro do que a edição cobre para a pessoa. Um lado no limite da cobertura, ou além dele, fica aberto; um período inteiro fora dela é descartado.
5. Se o `acontecimento` não existe no conjunto, é de outro perfil ou fica fora do recorte pedido, a seleção é descartada e os filtros são mantidos.
6. A escrita é canônica: ordem fixa (`de`, `ate`, `categorias`, `acontecimento`) e valores padrão omitidos. O mesmo estado gera sempre o mesmo endereço. Um endereço fora dessa forma é reescrito no lugar, com `replaceState`. Parâmetros que o atlas não conhece são mantidos.
7. Escolhas discretas (acontecimento, categoria, limpar filtros) criam uma entrada no histórico, para o botão voltar desfazer a última escolha. O arraste no eixo não altera o endereço enquanto dura e cria uma entrada ao soltar. Mudanças seguidas do período, com menos de um segundo entre elas, substituem a entrada (`chooseHistoryMode`).
8. Em exportação estática a query string só existe no navegador. O HTML gerado no build mostra o estado padrão, e o provider lê o endereço depois da hidratação, com `useSyncExternalStore`. A escrita usa `window.history.pushState` e `replaceState`, que o Next integra ao roteador.
9. A página de um acontecimento (`/acontecimentos/<slug>`) é o endereço para compartilhar. O link de volta à exploração leva `?acontecimento=<slug>` para a página do perfil.
10. Os links da exploração e da comparação para a página de um acontecimento levam o recorte (`de`, `ate`, `categorias`) e, vindos da comparação, `origem=comparar`. A página lê esse contexto com o mesmo `parseAtlasParams` e monta o retorno. Um contexto que não contém o acontecimento é descartado. As regras são funções puras em `src/lib/state/links.ts`.
11. Na comparação valem as regras de 1 a 8, com duas diferenças: o período é ajustado à escala comum das duas coberturas, e `acontecimento` é sempre descartado.
12. O jogo não usa a query string. A página de um acontecimento aberta de dentro dele leva `origem=jogo` e `personagem=<slug>`, e com isso oferece **Voltar ao jogo**; um personagem que não é do acontecimento é descartado. O progresso não vai no endereço: abrir um link direto não o altera (`eventHrefFromGame` e `gameReturn`, em `src/lib/state/links.ts`).

## Limites entre as funcionalidades

| Funcionalidade | Recebe | Devolve | Não faz |
|---|---|---|---|
| `features/map` | Coleção GeoJSON do recorte (os pontos gerados, recortados por `filterPoints`), os acontecimentos do recorte sem ponto (`listUnplaced`) e o slug selecionado | `onSelect(slug)` ao escolher um acontecimento, pelo marcador ou pelo seletor | Não filtra, não guarda seleção, não lê conteúdo, não monta os pontos, não escreve no endereço |
| `features/events` | Lista de acontecimentos e as lacunas do conjunto, ou um acontecimento resolvido | `onSelect(slug)` na lista | Não conhece o mapa, não calcula lacunas |
| `features/timeline` | Domínio de anos, acontecimentos do recorte, período e categorias em vigor, cargos e partidos do período | `onSelect(slug)` nas marcas; `onChange` e `onPeriodChange` do período; `onToggle` das categorias | Não fala com o mapa, não guarda recorte, não escreve no endereço |
| `features/game` | O recorte do jogo de um personagem (capítulos e registros já resolvidos) | Apenas apresentação e o progresso, que ela mesma guarda no navegador | Não lê conteúdo, não escreve texto editorial, não usa o estado nem o endereço da exploração, não carrega o mapa |
| `features/comparison` | Uma faixa por pessoa: acontecimentos, mandatos, filiações, cobertura e lacunas; o recorte em vigor e a função que dá o endereço de cada acontecimento | Apenas apresentação | Não filtra, não escreve no endereço, não calcula nota nem ranking |

As funcionalidades não se importam entre si. Quem as junta é a página, por meio do estado central: a lista despacha `selectEvent`, o provider escreve o endereço e recalcula o recorte, e o mapa recebe o novo slug selecionado. O clique no mapa percorre o mesmo caminho. O contrato está em [TIMELINE.md](TIMELINE.md), seção Contrato com o mapa, e o que o mapa faz com ele, em [MAP.md](MAP.md).

Dentro de `features/map`:

- Os pontos não são montados aqui. Vêm de `generated/dados/geo/`, feitos pelo gerador com `src/lib/data/points.ts`: um ponto por lugar documentado; abrangência nacional e lugar desconhecido não geram ponto.
- `places.ts` (puro) transforma os pontos em lugares e os lugares em marcadores, juntando os que se cobririam na escala em vigor.
- `camera.ts` (puro) guarda os limites da base, os tetos de zoom por precisão e as regras de enquadramento.
- `style.ts` monta o estilo local, só da base: mar, grade, terra, Brasil em foco, divisas dos estados e fronteiras. Sem tiles, sprites ou glyphs.
- `palette.ts` repete, para o WebGL, as seis cores da base que vêm dos tokens CSS. Um teste confere a sincronia.
- `base/` guarda os contornos do Natural Earth 1:50m, a base do mapa (D-58).
- `graticule.ts` gera a grade de meridianos e paralelos.
- `MapCanvas.tsx` cria a instância do MapLibre, põe os marcadores sobre o canvas, aplica as regras de câmera e trata a perda de contexto.
- `PlaceMarker.tsx`, `PlaceChooser.tsx`, `MapControls.tsx` e `MapLegend.tsx` são apresentação, sem MapLibre: o marcador, o seletor de acontecimentos de um marcador, os controles e a legenda.
- `MapFallback.tsx` é a lista de lugares que assume quando o mapa falha.
- `MapView.tsx` é a fronteira: carrega o `MapCanvas` só no navegador, mostra o carregamento e decide entre o mapa e a lista de lugares.

## Jogo

Um segundo caminho de leitura sobre os mesmos dados ([GAMEPLAY.md](GAMEPLAY.md)). Cinco coisas ficam separadas:

| O quê | Onde | Regra |
| --- | --- | --- |
| Dados históricos | `generated/dados/`, pelo pipeline | O jogo não tem conteúdo editorial. `buildGameContent` recorta, no build, os registros que os capítulos citam, com as fontes resolvidas, a situação da revisão e a marca de ordem em aberto (`findUndeterminedOrder`, a mesma regra da lista do atlas, em `src/lib/domain/order.ts`) |
| Configuração dos capítulos | `src/lib/game/chapters.ts`, `scenes/`, `coverage.ts` e `judicial.ts` | Um capítulo cita acontecimentos pelo `id`, define a tarefa, aponta um cenário e a época da figura. Todo registro de um capítulo é anterior, sem ambiguidade de data e precisão, a todo registro do seguinte; todo acontecimento publicado de cada personagem está em um capítulo dele, ou em uma exclusão justificada (`coverage.ts` gera a matriz de [GAME-COVERAGE.md](GAME-COVERAGE.md)). A ficha judicial relaciona os episódios de processo por identificador. Testes conferem tudo contra a edição |
| Regras de missão | `src/lib/game/mission.ts` | Funções puras: recolher, cumprir a tarefa, abrir a saída (a tarefa cumprida e todos os registros do capítulo recolhidos), decidir se duas datas dão ordem, montar as opções de documento e de lugar a partir dos registros, avaliar uma resposta |
| Estado do jogador | `src/lib/game/progress.ts` e `storage.ts` | Capítulos bloqueados, disponíveis e concluídos, com transições previsíveis; um capítulo só conclui com a saída aberta; formato com versão (2) e migração explícita da versão 1; dado inválido vira começo; sem armazenamento, vale uma cópia em memória, que é da página e atravessa a navegação entre o jogo e a ficha |
| Desenho do mundo | `src/features/game/draw/` e `engine/` | Canvas 2D, por código. Recebe a cena e o estado e desenha; não conhece regras. A cena aponta a arte que a desenha (`arts/`), e o personagem é desenhado na figura da época do capítulo |

```
getAtlasData()  ──▶  buildGameContent(dados, personagem)        (build)
                              │ props
                              ▼
                        GameShell                                (navegador)
            progresso ◀── useGameProgress ──▶ localStorage
                │
                ├─ GameStage  ── laço, entrada, câmera ──▶ renderScene ──▶ draw/
                ├─ Hud, TouchControls
                └─ diálogos e painel  ── regras de mission.ts e progress.ts
```

A casca decide o que acontece com uma interação e quando um capítulo termina. O palco só anda e desenha: avisa o que está ao alcance, a interação e a travessia da saída. As teclas são ouvidas no elemento da cena, e não na janela, lidas pela posição no teclado, e a simulação para quando um diálogo abre, quando a janela perde o foco e quando a aba fica oculta.

O palco e a prévia do mundo são pacotes carregados à parte, e ficam atrás de uma fronteira de erro (`ui/StageBoundary.tsx`): se um deles não chega, aparece o substituto, e o cabeçalho, o objetivo e o painel continuam funcionando. As janelas do jogo ficam em um contexto de empilhamento próprio (`.jogo-palco`, em `globals.css`), abaixo do cabeçalho do site.

O que é fixo na cena (paredes, piso, parapeitos e objetos parados) é desenhado uma vez, em telas à parte, e copiado a cada quadro; `engine/render.ts` redesenha só o que se move (D-106).

O desenho tem um arquivo por parte, todos em `src/features/game/draw/`: `kit.ts` (tinta, luz e primitivas isométricas), `characters.ts` e `character-*.ts` (os três personagens, os dois jogáveis em três épocas), `scene.ts` (a montagem), `scene-floor.ts`, `scene-walls.ts`, `scene-exit.ts` (o portal, a porta e a soleira), `scene-record.ts` (o registro, o anel de alcance e o efeito de recolher), `props.ts` e `props-*.ts` (os objetos de cenário). As artes de ambiente ficam em `arts/`, uma por arquivo, registradas em `arts/index.ts` (`ARTS`, por `SceneArtId`): cada uma diz o estilo e o caráter da parede, o piso, a porta e a receita de materiais, com os kits compartilhados `wall-kit.ts`, `floor-kit.ts`, `floors.ts`, `exit-kit.ts` e `door-leaves.ts`. Uma cena (`SceneId`) aponta a arte que a desenha; duas cenas podem dividir uma arte com paleta própria (D-112). O contrato está em `draw/types.ts` e em `arts/types.ts`.

## Espaços reservados

| Pasta | Recebe | Fase |
|---|---|---|
| `content/drafts/` | Registros em pesquisa e importações | Em uso desde a fase 2 |
| `content/published/` | A edição revisada | Em uso desde a fase 2 |
| `scripts/` | Comandos de dados (`data.mts`, com `register.mjs`), conferência e pré-visualização da saída | Em uso desde a fase 3 |
| `public/media/` | Retratos e imagens de acontecimentos, como cadastrados. Em `derivados/`, as versões dos retratos que as páginas pedem | Em uso desde a fase 2; versões preparadas na fase 8 |
| `src/app/fonts/` | Fontes tipográficas locais | Em uso desde a fase 4 |
| `src/features/timeline/` | Linha do tempo, controles do recorte, escolha de período no eixo e cargos e partidos do período | Em uso desde a fase 4; completa na fase 5 |
| `src/features/map/` | Mapa, base de contornos, marcadores, seletor, câmera e falhas | Em uso desde a fase 1; completo na fase 6 |
| `src/features/comparison/` | Faixas das trajetórias na mesma escala | Em uso desde a fase 4; a tela foi ligada ao estado e ao endereço na fase 7 |
| `src/lib/game/` | Regras e configuração do jogo, sem interface | Em uso desde a etapa 1 do jogo |
| `src/features/game/` | Casca, palco, desenho (`draw/`), motor (`engine/`) e interface (`ui/`) do jogo | Em uso desde a etapa 1 do jogo |
| `tests/e2e/` | Jornada principal com conteúdo real. Hoje cobre as telas de prova, as quatro telas, a navegação temporal com o endereço, o mapa sincronizado, a comparação, as páginas de perfil, de acontecimento e de metodologia, e o acabamento (transições, continuidade da seleção, link com consulta), em quatro larguras | Em uso; cresce até a fase 9 |
| `tests/export/` | O que só existe no build de produção: o que cada página pede e quando, o carregamento adiado do mapa, as versões dos retratos e a navegação pré-carregada. Roda sobre `out/`, servida por `npm run preview` | Em uso desde a fase 8 |
| `docs/desempenho/` | Resultado bruto das medições, em JSON, um arquivo por build medido | Em uso desde a fase 8 |

A pasta `public/geo/`, reservada na fase 1 para a base do mapa, deixou de existir na fase 6: os contornos ficam em `src/features/map/base/` e são publicados pelo bundler (D-58).

## Evolução para banco e painel editorial

O conteúdo local foi modelado como um banco relacional em arquivos, para a passagem ser uma troca de leitor e não uma remodelagem:

- Cada coleção é uma tabela. Cada registro tem `id` estável, e os relacionamentos são por id (`pessoaId`, `lugarIds`, `fonteId`).
- A citação (registro, fonte, trecho) já é a tabela de ligação entre registros e fontes.
- O estado editorial e a revisão identificada já são colunas do registro. O registro de alterações da edição é o início de um histórico.
- As páginas conhecem uma única função: `getAtlasData()`. Ela devolve os dados gerados, e nenhum componente sabe de onde o gerador os tirou.
- O pipeline (`buildAtlasData`) recebe os registros em memória. Quem lê os arquivos é uma função à parte, `readSources`.

Quando a edição frequente por mais de uma pessoa justificar um backend (plano, seção 10):

1. As coleções viram tabelas, com os mesmos ids e campos.
2. Os schemas Zod continuam valendo como validação de entrada do painel e de saída da consulta.
3. `readSources` dá lugar a um leitor que consulta o banco e devolve o mesmo formato. Validação, elegibilidade, índices, GeoJSON, consultas e páginas não mudam. O site segue estático.
4. `content/drafts/` e a promoção manual dão lugar aos estados de rascunho, revisão e publicação no painel, com acesso protegido.

A tabela do que troca e do que fica está em [DATA-PIPELINE.md](DATA-PIPELINE.md), seção "Evolução para banco e painel editorial".
