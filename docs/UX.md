# Experiência

Fases 4 a 7. Descreve a direção visual, as telas, como a composição muda com a largura da tela e como percorrer o atlas. A navegação temporal da exploração, com a consulta no endereço, está em [TIMELINE.md](TIMELINE.md); o mapa, em [MAP.md](MAP.md); a comparação, em [COMPARISON.md](COMPARISON.md); e os perfis, as páginas, as fontes e o compartilhamento, em [PAGES.md](PAGES.md). A base visual está em [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md); os comportamentos, os estados e o que ainda é demonstração, em [INTERACTIONS.md](INTERACTIONS.md).

## Como abrir a prévia

```bash
npm install
npm run dev
```

Endereço local: `http://localhost:3000/`. As quatro telas são as próprias rotas do atlas, com os dados gerados da edição 0.1.0:

| Tela | Endereço |
| --- | --- |
| Entrada | `/` |
| Exploração | `/politicos/flavio-bolsonaro/` e `/politicos/lula/` |
| Acontecimento | `/acontecimentos/<slug>/`, por exemplo `/acontecimentos/lula-2023-intervencao-federal-no-distrito-federal/` |
| Comparação | `/comparar/` |
| Metodologia | `/metodologia/` |
| Guia de estados (só em desenvolvimento) | `/dev/previa/` |

O guia de estados reúne os caminhos de entrada, os tokens e cada componente nos estados que a interface prevê, inclusive os que o conteúdo atual não produz (fonte indisponível, imagem de acontecimento, perfil sem retrato). Ele não entra no build de produção.

## Direção visual

Uma direção só: **atlas editorial contemporâneo, em tons de papel, com o grafite como tinta**.

| Escolha | Motivo |
| --- | --- |
| Superfícies de papel e texto em grafite | A hierarquia sai da tipografia, do alinhamento e de linhas finas. A cor fica livre para duas funções: marcar o que está selecionado e identificar categorias |
| Mapa na coluna central, do cabeçalho de filtros até a linha do tempo | O mapa tem presença sem virar fundo decorativo: ocupa a maior área da exploração e divide a coluna com a linha do tempo, que tem o mesmo recorte |
| Datas em destaque | O ano abre cada item da lista em números de mesma largura; no painel e na página, a data por extenso vem antes do título. O que não está documentado (dia, mês) não é escrito |
| Painel de leitura com ordem fixa | Categoria, data, título, pessoas, resumo, contexto, cargos na época, lugares, fontes e revisão, sempre nessa ordem |
| Serifada nos títulos e na leitura, sem serifa na interface e nos números | Newsreader dá voz editorial aos títulos e conforto ao texto longo; Libre Franklin mantém rótulos, filtros e números nítidos em tamanho pequeno |
| Um acento só, laranja queimado, usado para seleção | É a cor mais visível da interface. Vermelho vivo, azul vivo e o par verde e amarelo lembram identidades partidárias deste recorte. O acento não pertence a nenhuma pessoa e aparece igual nos dois perfis |
| Categorias com forma, cor e nome | Quadrado, círculo, losango, triângulo e cruz. Ninguém depende só da cor para saber a categoria |
| Retratos em tons de cinza, na mesma moldura | As duas fotos oficiais têm cores e fundos muito diferentes. Em cinza sobre o papel, ocupam a página com o mesmo peso |

### Tratamento equivalente dos dois perfis

- **Ordem alfabética** pelo nome exibido, em todo lugar: menu, entrada, comparação e página 404 (D-38).
- **O mesmo componente** para os dois: cartão de entrada, cabeçalho da exploração, painel de perfil e coluna da comparação. Um teste confere que os dois cartões da entrada e os dois retratos têm a mesma largura e a mesma altura.
- **Nenhuma cor por pessoa nem por partido.** As cores do atlas são de categoria e de seleção.
- **Fontes com o mesmo destaque:** a lista de fontes é o mesmo componente no painel, na página do acontecimento e no perfil, e não pode ser recolhida.
- **Retrato na mesma moldura 4:5**, com o mesmo tratamento e com o crédito escrito abaixo.
- **Quantidades ditas como "registros do atlas".** A comparação não soma, não ordena e não dá nota.

## Telas

### Entrada (`/`)

Responde quatro perguntas na primeira tela: o que é, para que serve, o que cobre e por onde começar.

- Nome do atlas e a frase de utilidade: a trajetória pública das duas pessoas, com a data, o lugar e o documento que sustenta cada registro.
- Recorte: data de corte da edição, quantidade de acontecimentos e de fontes, situação da revisão e o caminho para **Metodologia e fontes**.
- Dois cartões de pessoa, lado a lado em qualquer largura, com retrato, nome, período coberto e quantidade de registros. O cartão inteiro leva à exploração.
- Crédito de cada retrato logo abaixo do cartão.
- Faixa **As duas trajetórias na mesma escala**, com as marcas dos acontecimentos e os cargos, e o caminho para a comparação. Cada marca abre a página do acontecimento: é o acesso direto à exploração sem passar por um perfil.

### Exploração (`/politicos/<slug>/`)

Uma área de trabalho com cinco partes que leem o mesmo estado:

| Parte | O que mostra |
| --- | --- |
| Recorte | Quem (retrato, nome, troca de pessoa), quando (período) e o quê (categorias, com a quantidade de registros em cada uma) |
| Lista | O período consultado e a quantidade de registros; os cargos e partidos do período, em um bloco que abre e fecha; e os acontecimentos do recorte em ordem cronológica: ano em destaque, título, categoria, o que falta em uma data parcial, o aviso de quem não tem ponto no mapa e as lacunas do conjunto no lugar dos anos |
| Mapa | Um marcador por lugar documentado, com o nome ao lado: a forma da categoria, quando há um acontecimento, ou a quantidade, quando há vários. O Brasil em tom mais claro, com as divisas dos estados. Controles, legenda e acesso aos acontecimentos sem ponto |
| Linha do tempo | Uma marca por acontecimento, na forma da categoria, e as faixas de cargos e de partidos sobre o mesmo eixo. O eixo aceita clique (um ano) e arraste (um intervalo) |
| Painel de leitura | O perfil da pessoa, enquanto nada está aberto: apresentação, cargos e partidos com as fontes de cada um, cobertura, fontes do perfil, edição e crédito do retrato, mais os caminhos para a comparação e a metodologia. O acontecimento selecionado, quando há um |

A relação entre as partes é explícita: o mesmo acontecimento fica marcado na lista (fundo e filete de acento), no mapa (anel de acento nos marcadores dos lugares dele), na linha do tempo (anel e haste até o eixo) e aberto no painel. O recorte vale para as três vistas ao mesmo tempo, e a linha do tempo hachura o que ficou fora do período.

O período, as categorias e o acontecimento aberto ficam no endereço: o que está na tela pode ser recarregado, enviado por link e percorrido com voltar e avançar. **Copiar link desta consulta**, sobre a lista e no painel, copia esse endereço.

### Acontecimento (`/acontecimentos/<slug>/`)

A leitura completa, em endereço próprio:

- Retorno para a exploração de cada pessoa ligada, com o acontecimento já aberto. Quem veio de uma consulta volta com o mesmo período e as mesmas categorias, e o link diz qual era o recorte; quem veio da comparação tem também **Voltar à comparação**.
- Categoria, data por extenso na precisão conhecida (com o aviso "Só o ano está documentado" ou "O dia não está documentado" quando for o caso), título e **Copiar link**.
- Resumo e contexto, em seções com nome, no texto do conjunto revisado.
- Fontes numeradas: título com link para o documento, quem publicou, data do documento, data de acesso, onde está o trecho e o que ele sustenta.
- Revisão e edição: quem conferiu, quando, o aviso de revisão humana pendente, a versão e a data de corte, e os links **Como o atlas é feito** e **Sugerir uma correção**.
- Continuar no atlas: a exploração de cada pessoa ligada, a comparação e a metodologia.
- Ficha lateral: pessoas com os cargos que as datas provam para aquele dia, lugares com a precisão da coordenada, mapa de localização e créditos.

### Comparação (`/comparar/`)

- Um recorte, com período e categorias, que vale para as duas pessoas e fica no endereço. A barra do recorte fica presa ao topo e traz **Copiar link**.
- **Como ler esta comparação:** quatro avisos escritos com os dados do recorte (mesmo recorte, cargos diferentes, cobertura diferente, acervo e não desempenho).
- Uma faixa por pessoa sobre o mesmo eixo de anos, com a mesma altura mínima e as mesmas marcas. O que fica fora do recorte aparece apagado.
- O trecho anterior à cobertura de uma trajetória aparece hachurado e escrito como **fora da cobertura desta edição**. As lacunas dentro da cobertura ganham um colchete tracejado e o texto **sem registros**.
- Uma coluna por pessoa, com a mesma ordem: cobertura da edição, cargos e funções no período, partidos no período, acontecimentos no período e fontes do recorte. Cada cargo e cada filiação abre as próprias fontes.
- Um recorte sem acontecimentos diz que falta registro nesta edição, e não que faltou atividade.

O detalhe está em [COMPARISON.md](COMPARISON.md).

### Metodologia (`/metodologia/`)

A explicação pública do atlas, em uma página de leitura com índice: objetivo e escopo, seleção dos acontecimentos, fontes, a revisão que de fato aconteceu, datas, lugares, lacunas e limites da comparação, edição e atualização, como sugerir uma correção, créditos e o catálogo das fontes da edição. Os números e as datas vêm dos dados gerados. O detalhe está em [PAGES.md](PAGES.md), seção Metodologia.

## Composição por largura

Os pontos de mudança são 768 px (`md`) e 1280 px (`xl`). O HTML da exploração é um só: o que aparece em cada largura é decidido por CSS, a partir de dois atributos calculados (`data-pane` e `data-side`).

### Exploração

| | Estreita (até 767 px) | Média (768 a 1279 px) | Larga (1280 px ou mais) |
| --- | --- | --- | --- |
| Composição | Uma vista por vez | Duas colunas: 352 px e o restante | Três colunas: 352 px, o restante e 432 px |
| Recorte | Preso ao topo: retrato, nome e o recorte em vigor escrito. Atrás do botão **Filtros**: troca de pessoa, período, categorias e **Limpar filtros** | O mesmo, sem ficar preso | Barra inteira à vista: pessoa sobre a coluna da lista, com a troca de pessoa sob o nome; período e categorias em linha |
| Alternância | **Lista**, **Mapa**, **Perfil** | **Lista**, **Perfil** (o mapa está sempre à vista) | Não há |
| Lista | Vista própria, com a rolagem da página | Coluna esquerda, com rolagem própria | Coluna esquerda, com rolagem própria |
| Mapa | Vista própria, na altura que sobra da tela | Coluna direita, em cima | Coluna central, em cima |
| Linha do tempo | Acima da lista e do mapa, com rolagem horizontal; só marcas e eixo. Com um período, rola até o trecho escolhido | Coluna direita, embaixo, com cargos e partidos | Coluna central, embaixo, com cargos e partidos |
| Leitura | Substitui a vista, em tela inteira, com **Fechar** | Substitui a lista na coluna esquerda | Painel fixo à direita; mostra o perfil quando nada está aberto |
| Altura | A página rola; na vista do mapa, a área ocupa a tela abaixo do cabeçalho | A área ocupa a tela abaixo do cabeçalho; lista e leitura rolam por dentro | O mesmo |

Em telas médias e largas, a área de trabalho tem altura mínima de 640 px. Em uma janela mais baixa do que isso, a página volta a rolar em vez de espremer o mapa. Dentro da área, o mapa fica com pelo menos 40% da altura; se a linha do tempo não couber no restante, ela rola por dentro (conferido em 1280×720).

### Demais telas

| Tela | Estreita | Média | Larga |
| --- | --- | --- | --- |
| Entrada | Uma coluna: texto, recorte, os dois cartões lado a lado, faixa das trajetórias com rolagem horizontal | O mesmo, com a faixa inteira à vista | Duas colunas (a partir de 1024 px): texto e recorte à esquerda, cartões à direita |
| Acontecimento | Uma coluna: retorno, cabeçalho, texto, fontes, revisão e, depois, a ficha | O mesmo | Duas colunas (a partir de 1024 px): leitura com até 672 px e ficha de 352 px |
| Comparação | Recorte escrito e preso ao topo, com os controles atrás do botão **Filtros**. Faixas com rolagem horizontal, começando pelos anos recentes ou no período escolhido. As duas colunas de pessoa, uma abaixo da outra, com atalho para cada uma | Recorte como na estreita. Faixas inteiras à vista; colunas uma abaixo da outra | Controles do recorte em linha, a partir de 1280 px. Duas colunas de pessoa lado a lado (a partir de 1024 px), com as seções na mesma altura |
| Metodologia | Uma coluna: o índice e, depois, o texto. A tabela das categorias rola para o lado dentro da própria área | O mesmo, com o índice em duas colunas de links | Duas colunas (a partir de 1024 px): índice de 224 px, que acompanha a rolagem, e o texto |
| Cabeçalho | Nome do atlas e botão **Menu**, que abre o painel de destinos | Destinos em linha | Destinos em linha |

### Navegação no celular

- **Pessoa e período sempre escritos.** O bloco de recorte fica preso ao topo e diz quem, de que ano a que ano e quais categorias, mesmo com os filtros recolhidos. Um ponto no botão **Filtros** avisa que há recorte ativo.
- **Mapa, lista e detalhes têm vistas próprias.** A alternância tem três botões de 44 px de altura. Abrir um acontecimento pela lista troca a lista pela leitura; **Fechar** devolve a lista e o foco ao item de onde se saiu.
- **No mapa, a seleção não tira a pessoa do mapa.** Tocar em um marcador de um acontecimento, ou em uma marca da linha do tempo, mostra um cartão sobre a parte de baixo do mapa, com a data, o título e dois botões: **Ler** e **Fechar**. O enquadramento deixa os lugares selecionados acima do cartão.
- **Marcador com vários acontecimentos abre uma folha** na parte de baixo do mapa, com a lista deles. O mapa desloca o mínimo para o marcador continuar à vista acima da folha. Escolhido um, o cartão toma o lugar dela.
- **O mapa cabe na tela.** Na vista do mapa não há rolagem vertical da página sob o dedo: arrastar move o mapa. A linha do tempo fica acima dele.
- **Áreas de toque:** botões, abas, itens de lista, campos, categorias, a troca de pessoa, os marcadores do mapa, os controles dele e os itens do seletor têm 44 px ou mais de altura. As exceções são as marcas da linha do tempo, com 24 px, e o eixo, com 28 px: são atalhos. Todo acontecimento também está na lista, com área inteira, e todo período pode ser escolhido pelos campos.
- **O botão voltar do aparelho fecha a leitura** e devolve a lista ou o mapa, porque abrir um acontecimento cria uma entrada no histórico.
- **Leitura sem mapa:** a lista e a leitura não dependem do mapa. Com o mapa indisponível, a vista do mapa vira uma lista de lugares que seleciona do mesmo jeito.
- **Faixas largas rolam para o lado,** com a rolagem contida na própria faixa: a página não anda junto. A da comparação começa nos anos recentes e traz o aviso escrito.

Larguras conferidas: 1440×900, 1280×720, 768×1024, 390×844 e 360×800. Um teste percorre as cinco rotas em 360, 390 e 768 px e falha se o conteúdo passar da largura da tela.

## Lacunas de conteúdo que afetam a prévia

Nada foi alterado em `content/`. O que o conjunto atual não tem aparece na prévia como está:

| Lacuna | Efeito na prévia |
| --- | --- |
| Nenhum acontecimento tem imagem | O painel e a página não mostram figura. O estado com imagem está desenhado no guia de estados, com uma área reservada, e não foi visto com uma foto real |
| Todas as coordenadas são aproximações (centro de município ou de estado) | A legenda do mapa diz "pontos aproximados", e cada lugar diz a precisão. Os acontecimentos de um mesmo lugar dividem um marcador, que abre a lista deles |
| 13 dos 39 acontecimentos não têm ponto | Aparecem na lista com o aviso e o motivo, o painel diz por quê, e o mapa dá acesso a eles pelo botão **sem ponto no mapa** |
| Toda a revisão é assistida por IA | Entrada, painel, página e metodologia repetem "Revisão humana pendente" |
| Cobertura de Flávio Bolsonaro começa em 2002 e a de Lula em 1975 | A comparação mostra 27 anos como "fora da cobertura desta edição" |
| Lacunas de período de Lula (1981 a 1985, 1990 a 1993, 1995 a 2001, 2007 a 2015) | Aparecem como "sem registros" na linha do tempo da comparação e por extenso na coluna da pessoa |
| Cinco das oito filiações têm algum limite desconhecido | Barra tracejada e esmaecida do lado sem data; três partidos sem nenhuma data viram texto ("Sem datas documentadas") |
| O conteúdo não registra fonte fora do ar | O estado "fonte indisponível" existe só no guia de estados |

## Roteiro de demonstração (20 a 30 segundos)

Em 1440×900, com `npm run dev` aberto em `http://localhost:3000/`.

| Tempo | Ação | O que aparece |
| --- | --- | --- |
| 0 a 4 s | Abrir a entrada | Nome, frase de utilidade, recorte da edição e os dois cartões com o mesmo tamanho |
| 4 a 8 s | Clicar no cartão **Lula** | Exploração: lista, mapa do Brasil com os pontos, linha do tempo e perfil |
| 8 a 13 s | Clicar na categoria **Eleições** e, depois, em **Mostrar todas** | Lista, pontos e marcas se recortam juntos; a barra não muda de altura |
| 13 a 18 s | Clicar na marca de 2023 na linha do tempo | O item fica marcado na lista, o mapa enquadra Brasília e Araraquara, e o painel abre com a data em destaque |
| 18 a 23 s | Rolar o painel até **Fontes** e clicar em **Abrir a página do acontecimento** | Página com o texto, as três fontes numeradas e a ficha lateral |
| 23 a 28 s | Clicar no título da primeira fonte | O documento original abre em outra aba |
| 28 a 30 s | Voltar e clicar em **Trajetória de Lula** | A exploração volta com o mesmo acontecimento aberto |

Para a versão em celular (390×844): entrada, cartão, aba **Mapa**, toque em uma marca da linha do tempo, **Ler** no cartão, rolar até as fontes.

## Capturas

As capturas reais ficam em [`docs/capturas/`](capturas/README.md): as da prévia, em `fase-4/`, as da navegação temporal, em `fase-5/`, as do mapa, em `fase-6/`, e as da comparação, das páginas e da metodologia, em `fase-7/`. O índice e os comandos que as refazem estão em [`docs/capturas/README.md`](capturas/README.md).
