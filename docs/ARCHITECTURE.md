# Arquitetura

Descreve o que está implementado até a fase 5 e o que cada espaço reservado vai receber. Os motivos de cada escolha estão em [DECISIONS.md](DECISIONS.md). O pipeline de dados tem documento próprio, [DATA-PIPELINE.md](DATA-PIPELINE.md), e a interface tem quatro: [UX.md](UX.md), [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md), [INTERACTIONS.md](INTERACTIONS.md) e [TIMELINE.md](TIMELINE.md).

## Visão geral

Uma única aplicação Next.js (App Router) que vira um site de arquivos estáticos. O conteúdo é JSON versionado dentro do projeto. Um gerador local valida o conteúdo, seleciona o que é elegível e grava os dados públicos. No build, as páginas leem só esses dados e geram HTML. No navegador, a exploração (lista, mapa, linha do tempo, painel) recebe os mesmos dados e trabalha sobre um estado único, guardado no endereço.

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
| Estado | `src/lib/state/` | Estado da exploração, seletores, parâmetros de URL, regras do endereço e do histórico, e os dois providers (memória e endereço) | Ler arquivos, importar Zod em tempo de execução |
| Funcionalidades | `src/features/` | Mapa, acontecimentos, linha do tempo, comparação | Ler arquivos, guardar seleção própria |
| Componentes | `src/components/` | Base visual compartilhada: cabeçalho, rodapé, retrato, cartão de pessoa, data, categoria, fontes, revisão, perfil e as peças da linha do tempo (`time/`) | Ler arquivos, guardar estado da exploração |
| Rotas | `src/app/` | Páginas. Único lugar que chama `getAtlasData()` e entrega os dados por props | |
| Comandos | `scripts/` | Linha de comando dos dados, conferência e pré-visualização da saída | |

As fronteiras são verificadas, e não só combinadas:

- `eslint.config.mjs` proíbe o domínio e o pipeline de importar `node:*`, React, Next e as camadas de interface, e proíbe dados públicos, estado, funcionalidades e componentes de importar `@/lib/content/*`, `@/lib/publication/*`, `node:*` ou os schemas Zod (tipos são permitidos).
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
| `getAtlasData`, pipeline, schemas Zod | Build | Nunca chegam ao navegador |
| Consultas de `src/lib/data/` | Build e navegador | Funções puras sobre os dados já gerados |
| `SiteHeader`, `SiteFooter`, `PersonCard`, `Portrait`, `SourceList`, `TrajectoryLanes` | Build | Sem estado |
| `EventPanel`, `ProfilePanel` | Build ou navegador | Apresentação pura. Servem à página e ao painel |
| `SiteNav` | Navegador | Só o abrir e fechar do menu em tela estreita |
| `Explorer` (exploração) e `Comparison` (comparação) | Navegador | Client Components. Recebem os dados por props, são pré-renderizados no HTML e hidratados |
| `AtlasUrlStateProvider`, `EventList`, `Timeline`, `MapView` | Navegador | Idem, dentro do `Explorer`. No HTML do build saem com o estado inicial; o endereço é lido depois da hidratação |
| `RouterWatcher` | Só navegador | Único uso de `useSearchParams`, isolado em um `Suspense` sem saída visual, para a exploração continuar inteira no HTML gerado |
| `AtlasStateProvider` | Navegador | Estado em memória, para as telas de prova e os testes |
| `MapCanvas` (MapLibre) | Só navegador | Carregado por `next/dynamic` com `ssr: false`. Não aparece no HTML do servidor |
| Worker do MapLibre | Só navegador | Arquivo próprio, publicado pelo bundler em `/_next/static/media/` |

O mapa é o único ponto que exige `window` e WebGL. Ele fica atrás do `MapView`, que cuida do carregamento, do estado "Carregando o mapa…" e da troca pela lista de lugares quando o mapa falha. Nenhuma página depende do mapa para ser lida.

## Fluxo do conteúdo

```
fonte → rascunho → revisão → validação → dados gerados → build
```

| Etapa | Onde | Situação |
|---|---|---|
| Fonte | Páginas institucionais e bases públicas | Catálogo feito na fase 2 (SOURCES.md) |
| Rascunho | `content/drafts/` | Coleções parciais, que citam registros da edição. Recebe também as importações (`npm run data:import`) |
| Revisão | Estado editorial de cada registro (`rascunho`, `em-revisao`, `revisado`) e tipo da revisão (`assistida-por-ia`, `humana`) | Modelado e validado. Na edição 0.1.0 toda revisão é assistida por IA |
| Edição | `content/published/` | Edição 0.1.0. A promoção de um rascunho é manual (DATA-PIPELINE.md) |
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
| `/politicos/flavio-bolsonaro`, `/politicos/lula` | `src/app/politicos/[slug]/page.tsx`, com `Explorer.tsx` | `generateStaticParams` a partir de `PROFILES`; consulta em `de`, `ate`, `categorias` e `acontecimento` | Exploração: recorte, lista, mapa, linha do tempo e painel, com a consulta no endereço (fase 5). A página recorta os dados da pessoa (`sliceForPerson`) antes de entregá-los |
| `/acontecimentos/[slug]` | `src/app/acontecimentos/[slug]/page.published.tsx`, com `EventLocator.tsx` | `generateStaticParams` a partir dos acontecimentos dos dados gerados | Leitura completa, com ficha lateral e mapa de localização (ver abaixo) |
| `/comparar` | `src/app/comparar/page.tsx`, com `Comparison.tsx` | | Comparação na mesma escala, com período local à tela |
| `/metodologia` | `src/app/metodologia/page.tsx` | | Regras de datas, lugares, fontes, revisão e cobertura, e os créditos |
| 404 | `src/app/not-found.tsx` | | Com a identidade do projeto. Vira `out/404.html` |
| `/dev/previa` | `src/app/dev/previa/page.dev.tsx` | | Só em desenvolvimento. Guia da prévia: caminhos, tokens e estados de cada componente |
| `/dev/prova` | `src/app/dev/prova/page.dev.tsx` | | Só em desenvolvimento. Dados sintéticos, passados pelo pipeline em memória |
| `/dev/dados` | `src/app/dev/dados/page.dev.tsx` | | Só em desenvolvimento. A mesma tela, com os dados gerados da edição |

Todas usam barra final (`trailingSlash`), e cada rota vira `out/<rota>/index.html`.

**Rotas condicionais.** O `next.config.ts` liga duas extensões de página conforme a situação:

- `page.dev.tsx` só é rota no servidor de desenvolvimento. É o que mantém as telas de prova e as fixtures sintéticas fora do build de produção.
- `page.published.tsx` só é rota quando `generated/manifest.json` registra ao menos um acontecimento. A exportação estática recusa rota dinâmica sem nenhum parâmetro gerado. Quando o primeiro acontecimento for publicado, a rota se liga sozinha no build seguinte. Com o servidor de desenvolvimento aberto é preciso reiniciá-lo, porque a configuração é lida na partida.

**Contrato de `/acontecimentos/[slug]`.** Um endereço por acontecimento dos dados gerados, com o `slug` do registro. Rascunhos não geram página. A página mostra data na precisão conhecida, título, categoria, pessoas com os cargos documentados para aquela data, resumo, contexto, lugares com a precisão da coordenada, fontes com a evidência de cada citação, créditos das imagens e quem revisou. O retorno leva à exploração de cada pessoa ligada, com `?acontecimento=<slug>`. Slug fora do conjunto resulta em 404.

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
- `settle(estado, dados, cobertura)`: ajusta o período à cobertura da edição (`fitPeriod`) e aplica a regra de consistência.
- `transition(estado, ação, dados, cobertura)`: aplica a ação e chama `settle`.

**Regra de consistência.** O acontecimento selecionado sempre pertence ao recorte visível. Se um filtro o esconde, a seleção é desfeita. Como lista, mapa e painel leem o mesmo `visible` e o mesmo `selected` do provider, eles não têm como mostrar recortes diferentes.

**Onde o estado fica.** Dois providers entregam o mesmo contrato (`useAtlas()`: `state`, `dispatch`, `data`, `visible`, `visibleIds` e `selected`):

| Provider | Onde o estado fica | Quem usa |
| --- | --- | --- |
| `AtlasUrlStateProvider` | No endereço. O estado é derivado da query string a cada renderização, e `dispatch` escreve um endereço novo | A exploração (`/politicos/<slug>`) |
| `AtlasStateProvider` | Em memória, com `useReducer` | As telas de prova (`/dev/prova`, `/dev/dados`) |

## Parâmetros de URL e restauração

A tradução entre estado e query string existe desde a fase 1 (`url-params.ts`). A fase 4 passou a ler o endereço na chegada, e a fase 5 fechou o ciclo: o endereço é a fonte do estado da exploração, com escrita, voltar e avançar. O funcionamento completo, com exemplos, está em [TIMELINE.md](TIMELINE.md), seção Endereço.

A rota define quem e como; a query string define o recorte:

| Origem | Informação |
|---|---|
| `/politicos/<slug>` | `pessoa` igual ao slug, `comparar` desligado |
| `/comparar` | `comparar` ligado (a tela ainda usa estado local; a ligação é da fase 7) |
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

## Limites entre as funcionalidades

| Funcionalidade | Recebe | Devolve | Não faz |
|---|---|---|---|
| `features/map` | Coleção GeoJSON do recorte (os pontos gerados, recortados por `filterPoints`) e o slug selecionado | `onSelect(slug)` ao clicar em um ponto | Não filtra, não guarda seleção, não lê conteúdo, não monta os pontos |
| `features/events` | Lista de acontecimentos e as lacunas do conjunto, ou um acontecimento resolvido | `onSelect(slug)` na lista | Não conhece o mapa, não calcula lacunas |
| `features/timeline` | Domínio de anos, acontecimentos do recorte, período e categorias em vigor, cargos e partidos do período | `onSelect(slug)` nas marcas; `onChange` e `onPeriodChange` do período; `onToggle` das categorias | Não fala com o mapa, não guarda recorte, não escreve no endereço |
| `features/comparison` | Uma faixa por pessoa: acontecimentos, mandatos, filiações, cobertura e lacunas | Apenas apresentação | Não calcula nota nem ranking |

As funcionalidades não se importam entre si. Quem as junta é a página, por meio do estado central: a lista despacha `selectEvent`, o provider escreve o endereço e recalcula o recorte, e o mapa recebe o novo slug selecionado. O clique no mapa percorre o mesmo caminho. O que o mapa pode assumir desse contrato está em [TIMELINE.md](TIMELINE.md), seção Contrato com o mapa.

Dentro de `features/map`:

- Os pontos não são montados aqui. Vêm de `generated/dados/geo/`, feitos pelo gerador com `src/lib/data/points.ts`: um ponto por lugar documentado; abrangência nacional e lugar desconhecido não geram ponto.
- `style.ts` monta o estilo local: mar, grade, terra, Brasil em foco, divisas dos estados, fronteiras, pontos na cor da categoria e duas camadas para a seleção. Sem tiles, sprites ou glyphs.
- `palette.ts` repete, para o WebGL, as cores que vêm dos tokens CSS. Um teste confere a sincronia.
- `base/` guarda os contornos do Natural Earth 1:50m, base provisória até a fase 6 (D-43).
- `graticule.ts` gera a grade de meridianos e paralelos.
- `MapCanvas.tsx` cria o mapa, sincroniza dados e seleção e move a câmera.
- `MapView.tsx` carrega o `MapCanvas` só no navegador, mostra o carregamento e a lista de lugares em caso de falha.

## Espaços reservados

| Pasta | Recebe | Fase |
|---|---|---|
| `content/drafts/` | Registros em pesquisa e importações | Em uso desde a fase 2 |
| `content/published/` | A edição revisada | Em uso desde a fase 2 |
| `scripts/` | Comandos de dados (`data.mts`, com `register.mjs`), conferência e pré-visualização da saída | Em uso desde a fase 3 |
| `public/geo/` | A base cartográfica definitiva e, se adotados, os glyphs do mapa. A base provisória da fase 4 fica em `src/features/map/base/` | 6 |
| `public/media/` | Retratos e imagens de acontecimentos | Em uso desde a fase 2 |
| `src/app/fonts/` | Fontes tipográficas locais | Em uso desde a fase 4 |
| `src/features/timeline/` | Linha do tempo, controles do recorte, escolha de período no eixo e cargos e partidos do período | Em uso desde a fase 4; completa na fase 5 |
| `src/features/comparison/` | Faixas das trajetórias na mesma escala. Ligação com o estado central e o endereço | Base na fase 4; completa na 7 |
| `tests/e2e/` | Jornada principal com conteúdo real. Hoje cobre as telas de prova, as quatro telas e a navegação temporal com o endereço, em três larguras | Em uso; cresce até a fase 9 |

`public/geo/` e `public/media/` têm um `.gitkeep` cada, que é copiado para `out/`. São arquivos vazios; saem quando os arquivos reais entrarem.

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
