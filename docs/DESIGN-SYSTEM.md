# Sistema de design

Fases 4 a 7. A base visual do atlas: tokens, tipografia, formas e os componentes que as telas reutilizam. As fases 5, 6 e 7 não criaram token nem cor: acrescentaram componentes sobre a mesma base. O motivo de cada escolha de direção está em [UX.md](UX.md); o comportamento, em [INTERACTIONS.md](INTERACTIONS.md).

Regra geral: **os tokens de `src/app/globals.css` são a única origem das cores, das famílias e das medidas de movimento.** Os componentes usam as classes geradas a partir deles (`bg-paper`, `text-ink-soft`, `font-serif`). Cor escrita direto em um componente é erro.

## Cores

### Superfícies e tinta

| Token | Valor | Classe | Uso |
| --- | --- | --- | --- |
| `--atlas-paper` | `#f3efe6` | `bg-paper` | Fundo das páginas |
| `--atlas-paper-raised` | `#fbf9f4` | `bg-raised` | Painel de leitura, cartões, campos, linha do tempo |
| `--atlas-paper-sunken` | `#e8e3d6` | `bg-sunken` | Moldura de retrato, barras de período |
| `--atlas-ink` | `#1b1c1a` | `text-ink` | Texto principal, réguas fortes, botão invertido |
| `--atlas-ink-soft` | `#4a4c45` | `text-ink-soft` | Texto secundário, metadados, rótulos de seção |
| `--atlas-ink-faint` | `#62645b` | `text-ink-faint` | Créditos, numeração das fontes, contorno de campos |
| `--atlas-line` | `#d6d0c0` | `border-line` | Divisões entre itens |
| `--atlas-line-strong` | `#b7b09d` | `border-line-strong` | Contorno de botões secundários, sublinhado de links |

### Acento, aviso e categorias

| Token | Valor | Uso |
| --- | --- | --- |
| `--atlas-accent` | `#b24a00` | Só seleção: filete do item selecionado, anel da marca, anel do marcador selecionado no mapa, indicador de filtro ativo e o intervalo em andamento no arraste do eixo |
| `--atlas-accent-soft` | `#f8e4cf` | Fundo do item selecionado e da seleção de texto |
| `--atlas-notice` | `#f1e4bd` | Aviso de conteúdo provisório |
| `--atlas-cat-mandatos` | `#36567a` | Mandatos e funções |
| `--atlas-cat-eleicoes` | `#8f5d00` | Eleições |
| `--atlas-cat-partidos` | `#7b3d6c` | Partidos e alianças |
| `--atlas-cat-atuacao` | `#24695b` | Atuação institucional |
| `--atlas-cat-marcos` | `#3b3e40` | Marcos históricos |

O acento é a cor mais visível da interface, e é laranja queimado de propósito. Vermelho vivo, azul vivo e o par verde e amarelo lembram identidades partidárias deste recorte. O atlas não tem cor de pessoa nem de partido: o acento marca seleção nos dois perfis, e as cores de categoria são escuras, pouco saturadas e sempre acompanhadas de forma e de nome (D-39).

### Mapa

| Token | Valor | Uso |
| --- | --- | --- |
| `--atlas-map-sea` | `#dbe3e1` | Mar e fundo da moldura |
| `--atlas-map-land` | `#ebe6da` | Países vizinhos |
| `--atlas-map-land-focus` | `#f8f5ee` | Brasil |
| `--atlas-map-border` | `#8f958d` | Fronteiras e costa |
| `--atlas-map-state` | `#cfc9b9` | Divisas dos estados |
| `--atlas-map-grid` | `#c9d2cf` | Meridianos e paralelos |

A base do mapa é desenhada por WebGL, que não lê variáveis CSS. As seis cores dela repetem os tokens em `src/features/map/palette.ts`, e `tests/design.test.ts` falha se os dois lados deixarem de bater. Os marcadores são HTML e usam os tokens direto: cor de categoria, tinta e acento.

### Contraste

Medido pela fórmula da WCAG 2.x, sobre as três superfícies de papel (papel, elevado, rebaixado):

| Cor | Contraste | Exigência aplicada |
| --- | --- | --- |
| Tinta | 14,9 · 16,3 · 13,4 | 4,5:1 para texto |
| Tinta suave | 7,6 · 8,3 · 6,8 | 4,5:1 para texto |
| Tinta tênue | 5,2 · 5,7 · 4,7 | 4,5:1 para texto |
| Acento | 4,7 · 5,2 · 4,2 | 3:1 para marca gráfica |
| Categorias | de 4,4 a 10,2 | 3:1 para marca gráfica |
| Papel sobre tinta (botão invertido) | 14,9 | 4,5:1 para texto |
| Papel sobre acento (rótulo do arraste no eixo) | 4,7 | 4,5:1 para texto |

A tinta tênue estava em `#686a61` e dava 4,29:1 sobre o papel rebaixado. O teste de contraste acusou, e o valor foi escurecido. As cores de categoria e o acento nunca são cor de texto: colorem a forma, e o nome vem escrito em tinta ao lado.

`--atlas-line-strong` e `--atlas-map-border` ficam abaixo de 3:1 e por isso só desenham divisões e contornos decorativos. O contorno de campos e de controles usa a tinta ou a tinta tênue.

### Tema

Há um tema só, claro. Os retratos são mesclados ao papel por multiplicação, e os pares de contraste foram medidos só nesta combinação. Um tema escuro pede outro tratamento dos retratos e outra medição, e não faz parte desta edição (D-40).

## Tipografia

Duas famílias, em arquivos locais (`src/app/fonts/`, licença OFL 1.1), carregadas por `next/font/local`. Nenhum pedido vai a servidor de fontes.

| Família | Classe | Onde |
| --- | --- | --- |
| Newsreader (variável, 200 a 800, com itálico) | `font-serif` | Nome do atlas, títulos, nome das pessoas, resumo e contexto |
| Libre Franklin (variável, 100 a 900) | `font-sans` | Interface, rótulos, metadados e todos os números |

### Escala em uso

| Papel | Família | Tamanho | Entrelinha | Peso |
| --- | --- | --- | --- | --- |
| Nome do atlas na entrada | Serifada | 52 px; 72 px a partir de 768 px | 0,95 | 500 |
| Título de página (comparação, guia) | Serifada | 48 px; 60 px a partir de 768 px | 1 | 500 |
| Título de acontecimento na página | Serifada | 34 px; 52 px a partir de 768 px | 1,08 | 500 |
| Título de seção | Serifada | 24 a 30 px | 1,2 a 1,33 | 500 |
| Título no painel de leitura | Serifada | 24 px | 1,25 | 500 |
| Título de item da lista | Serifada | 17 px | 1,375 | 500 |
| Resumo na página do acontecimento | Serifada | 22 px | 1,45 | 400 |
| Texto de leitura (`reading`) | Serifada | 18 px | 1,65 | 400 |
| Data por extenso em destaque | Sem serifa | 28 px no painel; 30 a 40 px na página | 1 | 600 |
| Ano na lista (`DateMark`) | Sem serifa | 17 px | 1 | 600 |
| Texto de interface | Sem serifa | 14 px | 1,43 | 400 a 500 |
| Texto pequeno | Sem serifa | 12 px | 1,33 | 400 |
| Rótulo de seção (`eyebrow`) | Sem serifa | 11 px, caixa alta, espaçamento 0,09 em | 1,2 | 600 |

Utilitários próprios, definidos em `globals.css`:

| Classe | Efeito |
| --- | --- |
| `eyebrow` | Rótulo pequeno em caixa alta: nome de seção, legenda de campo |
| `numerals` | Números alinhados e de mesma largura, para anos e datas em coluna |
| `reading` | Texto de leitura longa, serifado, 18 px com entrelinha 1,65 |
| `page` | Largura útil das páginas (até 1312 px) com a margem lateral do projeto |

O texto de leitura não ocupa a largura da tela: na página do acontecimento o resumo fica em uma coluna de até 672 px e o contexto em até 608 px; no painel da exploração, a coluna tem cerca de 390 px.

## Espaço, linhas e forma

- **Margem lateral** (`--atlas-gutter`): 16 px; 24 px a partir de 768 px; 32 px a partir de 1280 px.
- **Altura do cabeçalho** (`--atlas-header-h`): 56 px; 64 px a partir de 768 px. A área de trabalho da exploração calcula a própria altura a partir dela.
- **Cantos retos** em painéis, cartões, botões e campos. O redondo aparece só onde a forma é o sinal: a marca circular de categoria, o anel de seleção da linha do tempo e os marcadores do mapa.
- **Sem sombras de elevação.** A separação é por linha e por tom de papel. As duas exceções são elementos que flutuam sobre outro conteúdo: o painel do menu em tela estreita e o cartão sobre o mapa.
- **Linhas:** régua de tinta de 1 px para abrir e fechar blocos principais; linha clara para dividir itens; tracejado para o que não está documentado.
- **Hachura diagonal** para o que está fora ou falta: fora do período escolhido, na linha do tempo; fora da cobertura da edição, na comparação; e a linha de lacuna, na lista.
- **Área de toque mínima:** 44 px de altura para botões, abas, campos e itens de lista em telas estreitas e médias. Em tela larga, os filtros da barra usam 36 px.

## Categorias

Cada categoria tem uma forma, uma cor e um nome. As três coisas vêm de `src/components/Category.tsx`.

| Categoria | Forma | Cor |
| --- | --- | --- |
| Mandatos e funções | Quadrado | Azul acinzentado |
| Eleições | Círculo | Ocre |
| Partidos e alianças | Losango | Ameixa |
| Atuação institucional | Triângulo | Verde petróleo |
| Marcos históricos | Cruz | Grafite |

- `CategoryMark` desenha só a forma e é decorativa: quem a usa informa a categoria em texto ou em rótulo acessível.
- `CategoryLabel` junta a forma e o nome.
- No mapa, o marcador de um lugar com um acontecimento só leva a mesma forma e a mesma cor, sobre um disco de papel. Com vários acontecimentos, o marcador mostra a quantidade, e a categoria de cada um aparece na lista que ele abre.

## O que é incerto

O que as fontes não documentam tem desenho próprio, sempre o mesmo:

| Situação | Desenho | Texto |
| --- | --- | --- |
| Data de que só se sabe o ano ou o mês | Só o ano, ou mês e ano. Na linha do tempo, um traço sob a marca cobre o ano ou o mês inteiro | "Só o ano está documentado." ou "O dia não está documentado."; na lista, "só o ano" ou "sem o dia" sob o ano |
| Ordem entre dois registros que as datas não decidem | Aviso em itálico no registro menos preciso | "ordem dentro de 1980 não documentada" |
| Período com um limite desconhecido | Barra tracejada, que se apaga do lado sem data | "a partir de 1975; fim não documentado" |
| Período sem nenhuma data | Não vira barra | "Sem datas documentadas: PP, PPB, PSC." |
| Cargo cujo período talvez toque a data | Fica fora do painel do acontecimento; aparece no perfil e na comparação | "presença no período não documentada" |
| Cargo ou partido que talvez toque o período consultado | Seção à parte no bloco do período, com borda tracejada à esquerda | "Presença incerta no período" e as datas conhecidas de cada registro |
| Coordenada aproximada | Resumo da legenda, sempre à vista no canto do mapa | "Legenda · pontos aproximados"; aberta, "Todo ponto é o centro de um município ou de um estado, e não um endereço"; e a precisão ao lado de cada lugar |
| Lugar conhecido só pelo estado | Marcador de contorno tracejado, no centro do estado | "aproximação: unidade da federação" |
| Acontecimento sem lugar | Sem marcador; botão **N sem ponto no mapa** | "sem ponto no mapa (abrangência nacional)" ou "(lugar não documentado)" |
| Lugar fora da área que a base cobre | Sem marcador; entra na mesma lista | "fora da área que este mapa cobre" |
| Base simplificada | Zoom limitado a 6 e câmera presa à área da base | "A base é de contornos simplificados (Natural Earth, 1:50 milhões), sem cidades nem estradas" |
| Trecho sem pesquisa | Hachura | "fora da cobertura desta edição" |
| Lacuna dentro da cobertura | Colchete tracejado, na comparação; linha hachurada, na lista | "sem registros"; na lista, "sem registros do atlas nesta edição" |
| Revisão | Frase em toda leitura | "Revisão humana pendente." |

## Componentes

Todos em `src/components/` (base, sem estado) ou em `src/features/` (ligados a uma funcionalidade). O guia `/dev/previa/` mostra cada um nos seus estados.

### Seleção de pessoa

| Componente | Arquivo | Notas |
| --- | --- | --- |
| `PersonCard` | `src/components/PersonCard.tsx` | Cartão da entrada. Retrato 4:5, nome, período coberto, quantidade de registros e a chamada. O cartão inteiro é o link |
| `Portrait` | `src/components/Portrait.tsx` | Moldura 4:5 ou quadrada, foto em tons de cinza mesclada ao papel, recorte pelo topo. Sem arquivo, mostra as iniciais na mesma área |
| `PortraitCredit` | `src/components/Portrait.tsx` | Crédito e o tratamento aplicado: "Exibida em tons de cinza e recortada". Com `detail`, traz também o link para a página de origem e o caminho para as condições de uso, na metodologia |
| `ProfilePanel` | `src/components/ProfilePanel.tsx` | Perfil no painel: retrato, resumo, caminhos (`actions`), cargos e funções e partidos com as fontes de cada registro, cobertura da edição, fontes do perfil, revisão, edição e crédito do retrato |
| `SiteNav` | `src/components/SiteNav.tsx` | Destinos do cabeçalho, com os perfis em ordem alfabética |
| `PersonSwitch` | `src/components/PersonSwitch.tsx` | Troca de pessoa dentro da exploração. Todos os perfis, em ordem alfabética e com o mesmo desenho: o aberto em tinta, com `aria-current`, e os outros como links. Dois tamanhos: de toque (44 px) e compacto (24 px), para a barra em tela larga |

### Marcações temporais

| Componente | Arquivo | Notas |
| --- | --- | --- |
| `DateMark` | `src/components/DateMark.tsx` | Ano em destaque e, abaixo ou ao lado, só o que a precisão sustenta. Leitores de tela recebem a data por extenso. Com `showPrecision`, para listas cronológicas, diz o que falta na data parcial |
| `TimeAxis` | `src/components/time/TimeAxis.tsx` | Régua, um traço por ano e rótulos em anos redondos. A quantidade de rótulos depende da largura do próprio eixo |
| `EventMarks` | `src/features/timeline/EventMarks.tsx` | Marcas selecionáveis, em fileiras quando as datas se aproximam. Cada marca reserva 26 px do eixo |
| `PeriodBrush` | `src/features/timeline/PeriodBrush.tsx` | Camada sobre o eixo: rótulo de tinta com o ano sob o ponteiro e, no arraste, faixa e rótulo de acento com o intervalo |
| `PeriodContext` | `src/features/timeline/PeriodContext.tsx` | Bloco que abre e fecha, com os cargos e os partidos do período e a presença incerta à parte |
| `MandateList`, `AffiliationList` | `src/components/PeriodRecords.tsx` | Cargos e partidos por extenso, com as datas de cada um. Servem à exploração, ao perfil e à comparação. O que está em vigor na data de corte leva a marca **em curso**. Com `sourcesOf`, cada registro traz as próprias fontes |
| `EventMarkLinks` | `src/components/time/EventMarkLinks.tsx` | As mesmas marcas, como links para a página de cada acontecimento. Com `hrefOf`, quem usa decide o endereço, para levar o recorte |
| `PeriodLane` | `src/components/time/PeriodLane.tsx` | Cargos ou partidos como barras sobre o eixo |
| `PeriodShade` | `src/components/time/PeriodShade.tsx` | Hachura sobre o que está fora do período. Passa por cima do eixo e por baixo das marcas |
| `Timeline` | `src/features/timeline/Timeline.tsx` | Junta marcas, eixo, hachura, escolha de período e faixas; mede a própria largura; rola na horizontal em tela estreita |
| `PeriodControl` | `src/features/timeline/PeriodControl.tsx` | Dois campos de ano, "De" e "Até", e o botão de desfazer |
| `CategoryFilter` | `src/features/timeline/CategoryFilter.tsx` | Um botão de alternância por categoria, com forma, nome e quantidade |
| `TrajectoryLanes` | `src/features/comparison/TrajectoryLanes.tsx` | Uma faixa por pessoa sobre o mesmo eixo, com cobertura e lacunas |

A geometria (posição de datas e períodos, fileiras, rótulos de ano) é de funções puras em `src/components/time/scale.ts`, testadas em `tests/timeline.test.ts`.

### Item de acontecimento

| Componente | Arquivo | Notas |
| --- | --- | --- |
| `EventList` | `src/features/events/EventList.tsx` | Lista selecionável. Item: `DateMark` com o aviso de data parcial, título, `CategoryLabel`, nomes (quando há mais de uma trajetória), o aviso de ordem em aberto e o de quem não tem ponto. Entre os itens, as linhas de lacuna |
| `EventLinkList` | `src/features/events/EventLinkList.tsx` | A mesma composição, como links, para a comparação. Aceita `hrefOf` e a mensagem de lista vazia; com `showPrecision`, diz o que falta na data parcial |

Estados do item: normal, sob o ponteiro (fundo elevado), em foco (anel de tinta) e selecionado (filete de acento à esquerda e fundo de acento suave, mais `aria-pressed`).

A linha de lacuna não é selecionável: fundo rebaixado com a hachura, os anos em números e o texto em itálico sobre uma tarja de papel, para a hachura não passar pelas letras.

### Painel de leitura

| Componente | Arquivo | Notas |
| --- | --- | --- |
| `EventPanel` | `src/features/events/EventPanel.tsx` | Categoria, data, título, pessoas, imagem quando houver, resumo, contexto, cargos na época, lugares, fontes, revisão e o link para a página |
| `ReviewNote` | `src/components/ReviewNote.tsx` | Quem conferiu e quando. Conferência assistida por IA e revisão humana nunca usam as mesmas palavras |

### Apresentação de fontes

`SourceList` (`src/components/SourceList.tsx`) é a única forma de mostrar fontes. Cada item traz: número, título com link para o documento (abre em outra aba, avisado a leitores de tela), quem publicou, domínio, data do documento ou "data do documento desconhecida", data de acesso, onde está o trecho e o que ele sustenta. A densidade `compacta` omite o último campo, para a lista longa do perfil. O estado `indisponivel` troca o link por texto e explica como achar o documento por outro caminho.

Duas peças usam a mesma identificação do documento, e nenhuma delas é outra forma de citar:

| Componente | Arquivo | Notas |
| --- | --- | --- |
| `RecordSources` | `src/components/RecordSources.tsx` | "N fontes" de um cargo ou de uma filiação: bloco nativo de abrir e fechar, com a `SourceList` daquele registro dentro. O nome lido inclui o registro |
| `SourceCatalog` | `src/components/SourceList.tsx` | Cada documento uma vez, com "Citada em N registros". Para o recorte da comparação e para o catálogo da metodologia. Não mostra o trecho: ele está no registro |

### Compartilhamento, retorno e edição

| Componente | Arquivo | Notas |
| --- | --- | --- |
| `CopyLink` | `src/components/CopyLink.tsx` | Botão de copiar um endereço do atlas, em duas variantes: `botao`, com borda, 44 px de altura em telas estreitas e médias e 36 em tela larga, e `texto`, sublinhado, para cabeçalhos de lista. Três estados: parado, copiado ("Link copiado", por 4 segundos, depois do sucesso) e falhou (campo com o endereço, selecionado, e o aviso). O hook `useCopy` serve também ao modelo de correção |
| `EventReturn` | `src/app/acontecimentos/[slug]/EventReturn.tsx` | Links de volta no topo da página do acontecimento, com seta e, quando há contexto, "com o recorte de antes: …" em texto menor |
| `EditionTag` | `src/components/EditionStatus.tsx` | Uma linha: "Edição 0.1.0 · registros até 8 de outubro de 2026". No perfil e na página do acontecimento |
| `CorrectionTemplate` | `src/app/metodologia/CorrectionTemplate.tsx` | Modelo de sugestão em um campo só de leitura, com **Copiar o modelo** |

A marca **em curso** e o aviso de canal pendente usam os tokens que já existiam: texto pequeno em tinta suave e o fundo de aviso (`bg-notice`).

### Mapa

| Parte | Arquivo | Notas |
| --- | --- | --- |
| `MapView` | `src/features/map/MapView.tsx` | Moldura, carregamento e a troca pela lista de lugares na falha, com nova tentativa |
| `MapCanvas` | `src/features/map/MapCanvas.tsx` | O MapLibre em si, carregado só no navegador, com os marcadores por cima |
| `PlaceMarker`, `MarkerSymbol` | `src/features/map/PlaceMarker.tsx` | O marcador de um lugar, ou de lugares próximos, e o símbolo dele sozinho |
| `PlaceChooser` | `src/features/map/PlaceChooser.tsx` | Lista dos acontecimentos de um marcador, ou dos que não têm ponto |
| `MapControls` | `src/features/map/MapControls.tsx` | Aproximar, afastar e enquadrar os lugares do recorte |
| `MapLegend` | `src/features/map/MapLegend.tsx` | Os símbolos em uso e o aviso de base simplificada |
| `MapFallback` | `src/features/map/MapFallback.tsx` | A lista de lugares que substitui o mapa |
| Estilo | `src/features/map/style.ts` | Mar, grade, terra, Brasil em foco, estados e fronteiras |
| Base | `src/features/map/base/` | Contornos do Natural Earth 1:50m, em domínio público |

**Marcador.** Área de toque de 44 px, redonda, com o símbolo no centro e o nome do lugar ao lado, em 11 px, com um halo de papel.

| Estado | Desenho |
| --- | --- |
| Um acontecimento | Disco de papel de 24 px, com borda de tinta, e a forma da categoria na cor dela |
| Vários acontecimentos | Disco de tinta de 28 px, com borda de papel, e a quantidade em números de mesma largura |
| Só o estado é conhecido | Contorno tracejado: a borda do disco de papel, ou um contorno por fora do disco de tinta |
| Selecionado | Anel de acento de 3 px, afastado do símbolo por 2 px de papel |
| Seletor aberto | Anel de tinta de 2 px, com o mesmo afastamento |
| Sob o ponteiro | Cresce 10% |
| Em foco | Anel de foco do atlas, em volta da área de toque |

Lugares próximos dividem um marcador, e o texto ao lado passa a dizer quantos são: "2 lugares".

**Seletor.** Quadro de papel elevado com borda de tinta, e uma das duas sombras do atlas, porque flutua sobre o mapa. Cabeçalho com o rótulo "No mapa", o nome do lugar em serifada e a quantidade. Um trecho por lugar, com o nome em negrito e a precisão da coordenada. Cada acontecimento é um botão de 44 px ou mais: data, título em serifada e categoria com a forma. O selecionado usa o mesmo filete e o mesmo fundo de acento da lista de acontecimentos. Em tela estreita é uma folha de lado a lado, na parte de baixo do mapa; nas demais, um quadro de 320 px no canto esquerdo.

**Controles.** Três botões empilhados, de papel elevado com borda, 44 px em telas estreitas e médias e 36 px em tela larga. Desativado: traço na cor de linha.

**Legenda.** Resumo de uma linha, sempre à vista ("Legenda · pontos aproximados"). Aberta, mostra só os símbolos que o recorte em vigor usa, cada um com o próprio `MarkerSymbol`, e o texto sobre a base. O fundo é papel elevado a 95%, e a 98% com a legenda aberta: nunca opaco, pelo motivo descrito em MAP.md.

## Equivalência

Regras que valem para qualquer tela nova:

1. Os dois perfis usam o mesmo componente, com as mesmas propriedades. O que muda vem dos dados.
2. A ordem é a de `PROFILES`, alfabética.
3. Nenhuma cor, ícone ou tratamento é exclusivo de uma pessoa ou de um partido.
4. Retrato sempre na mesma moldura e com o mesmo tratamento; sem retrato, as iniciais.
5. Toda quantidade é dita como "registros do atlas". Não há barra de quantidade, total comparado, nota nem ordenação por volume.
6. Vazio nunca é dito como falta de atividade: é "sem registros" ou "fora da cobertura".

`tests/design.test.ts` confere a ordem alfabética, que nenhum token leva nome de pessoa e que as formas das categorias não se repetem.
