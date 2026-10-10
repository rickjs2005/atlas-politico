# Experiência

Fases 4 a 8. Descreve a direção visual, as telas, como a composição muda com a largura da tela e como percorrer o atlas. A navegação temporal da exploração, com a consulta no endereço, está em [TIMELINE.md](TIMELINE.md); o mapa, em [MAP.md](MAP.md); a comparação, em [COMPARISON.md](COMPARISON.md); os perfis, as páginas, as fontes e o compartilhamento, em [PAGES.md](PAGES.md); e o que cada tela carrega, com as medições, em [PERFORMANCE.md](PERFORMANCE.md). A base visual está em [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md); os comportamentos, os estados e o que ainda é demonstração, em [INTERACTIONS.md](INTERACTIONS.md).

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
| Jogo | `/jogo/` (escolha do personagem) e `/jogo/flavio-bolsonaro/` e `/jogo/lula/` (os capítulos) |
| Guia de estados (só em desenvolvimento) | `/dev/previa/` |
| Galeria da arte do jogo (só em desenvolvimento) | `/dev/jogo-arte/` |

O guia de estados reúne os caminhos de entrada, os tokens e cada componente nos estados que a interface prevê, inclusive os que o conteúdo atual não produz (fonte indisponível, imagem de acontecimento, perfil sem retrato). Ele não entra no build de produção.

## Direção visual

Uma direção só: **atlas editorial contemporâneo, em tons de papel, com o grafite como tinta**. O jogo, que entrou depois da fase 9, parte dela e ganha uma aparência própria de mundo: cenários isométricos desenhados por código, com o mesmo papel, o mesmo grafite no contorno e o mesmo acento ([GAMEPLAY.md](GAMEPLAY.md), seção Direção visual).

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
- Dois cartões de pessoa, lado a lado em qualquer largura, com retrato, nome, período coberto e quantidade de registros. O cartão inteiro leva à exploração. Os dois retratos têm o mesmo enquadramento: a linha dos olhos na mesma altura e o rosto do mesmo tamanho.
- Em tela estreita a ordem é nome, frase, os dois cartões e só então os números da edição: os dois acessos cabem inteiros na primeira tela, em 390×844 e em 360×800. Em tela larga, o texto e os números ficam à esquerda, centrados na altura dos cartões.
- Abaixo de cada cartão, o acesso **Jogar com** o personagem, com a quantidade de capítulos: o mesmo botão para os dois, do mesmo tamanho, na primeira tela nas quatro larguras. Uma linha explica o jogo e leva à entrada dele.
- Crédito de cada retrato logo abaixo.
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
- Categoria, data por extenso na precisão conhecida (com o aviso "Só o ano está documentado" ou "O dia não está documentado" quando for o caso), título e **Copiar link**. O título é a âncora da página; a data vem acima dele, forte e menor.
- Resumo e contexto, em seções com nome, no texto do conjunto revisado.
- Fontes numeradas: título com link para o documento, quem publicou, data do documento, data de acesso, onde está o trecho e o que ele sustenta.
- Revisão e edição: quem conferiu, quando, o aviso de revisão humana pendente, a versão e a data de corte, e os links **Como o atlas é feito** e **Sugerir uma correção**.
- Continuar no atlas: a exploração de cada pessoa ligada, a comparação e a metodologia.
- Ficha lateral: pessoas com os cargos que as datas provam para aquele dia, lugares com a precisão da coordenada, mapa de localização e créditos. O mapa só é carregado quando a rolagem chega perto dele: em celular, a leitura abre sem ele.

### Comparação (`/comparar/`)

- Um recorte, com período e categorias, que vale para as duas pessoas e fica no endereço. A barra do recorte fica presa ao topo e traz **Copiar link**.
- Uma faixa por pessoa sobre o mesmo eixo de anos, logo abaixo do recorte e na primeira tela, com a mesma altura mínima e as mesmas marcas. O que fica fora do recorte aparece apagado.
- O trecho anterior à cobertura de uma trajetória aparece hachurado e escrito como **fora da cobertura desta edição**. As lacunas dentro da cobertura ganham um colchete tracejado e o texto **sem registros**.
- **Como ler esta comparação,** depois das faixas e antes das colunas: quatro avisos escritos com os dados do recorte (mesmo recorte, cargos diferentes, cobertura diferente, acervo e não desempenho).
- Uma coluna por pessoa, com a mesma ordem: cobertura da edição, cargos e funções no período, partidos no período, acontecimentos no período e fontes do recorte. Cada cargo e cada filiação abre as próprias fontes.
- Um recorte sem acontecimentos diz que falta registro nesta edição, e não que faltou atividade.

O detalhe está em [COMPARISON.md](COMPARISON.md).

### Metodologia (`/metodologia/`)

A explicação pública do atlas, em uma página de leitura com índice: objetivo e escopo, seleção dos acontecimentos, fontes, a revisão que de fato aconteceu, datas, lugares, lacunas e limites da comparação, edição e atualização, como sugerir uma correção, créditos e o catálogo das fontes da edição. Os números e as datas vêm dos dados gerados. O detalhe está em [PAGES.md](PAGES.md), seção Metodologia.

### Jogo (`/jogo/` e `/jogo/<personagem>/`)

Um segundo caminho pelo mesmo conteúdo: a trajetória em capítulos jogáveis. O detalhe está em [GAMEPLAY.md](GAMEPLAY.md).

- **Entrada do jogo.** No alto, o que o jogo é, o aviso de que os cenários são representações e de que o guia é fictício, e a situação da revisão do conteúdo, com o caminho para a metodologia. Depois, um cartão por personagem, iguais e em ordem alfabética: a prévia do cenário do primeiro capítulo, o retrato, os capítulos com os períodos, a situação neste navegador e o botão **Começar**, **Continuar** ou **Rever**. Abaixo, o crédito dos retratos, o aviso de que personagens e cenários são desenhos, com a mesma figura em todos os capítulos, e como se joga.
- **Cena.** Ocupa a altura da janela abaixo do cabeçalho. Sobre ela, no alto à esquerda, o capítulo, o período, o nome do cenário, dito como cenário, o objetivo e a contagem dos registros recolhidos, com o que ainda segura a saída; à direita, **Como jogar** e **Capítulos e tarefas**; embaixo, a dica do que está ao alcance. Em tela de toque, o direcional à esquerda e o botão de ação à direita, que leva o nome da ação. Abaixo do palco, o rodapé repete que o cenário é uma representação e a situação da revisão.
- **Objetos da cena.** Os registros são pastas de documentos que pairam sobre uma marca no chão; a que está ao alcance ganha contorno e um anel. A saída é uma porta no vão da parede da frente: fechada, tem uma tranca com cadeado; aberta, a folha gira para fora, a placa acende e o degrau mostra setas. Ela abre com todos os registros do capítulo recolhidos e a tarefa cumprida; fechada, diz o que falta.
- **Registro recolhido.** Uma janela com a data na precisão documentada, os avisos de data parcial e de ordem não documentada quando valem, o título, a categoria, o resumo, as fontes com autoria, a situação da revisão e o caminho para a ficha completa. É o mesmo conteúdo da página do acontecimento, em resumo. No alto, o que o registro mudou: quantos já foram recolhidos e o que falta para a saída abrir.
- **Tarefa de ordem.** Os dois registros lado a lado, com as datas, e a pergunta de qual veio primeiro. Errar mostra os dois com as datas, o mais antigo primeiro, e o botão de tentar de novo, que recebe o foco.
- **Capítulos e tarefas.** O painel que faz tudo por botões, sem o cenário: situação de cada capítulo, objetivo, motivo do agrupamento, situação da tarefa e da saída, registros (recolher, ou ler de novo o que já foi recolhido), ordem, saída quando aberta, reinício e os caminhos para o atlas.
- **Transição e fim.** Uma tela curta entre os capítulos, com o período e o cenário seguintes; depois do último capítulo disponível, a tela que leva à trajetória completa no atlas.
- **Quando algo falha.** Sem JavaScript, o aviso fica dentro do palco, com o caminho para a trajetória no atlas. Se a cena não carrega, aparece um aviso com o botão de recarregar, e o painel continua cumprindo as tarefas.
- **O que não muda.** As fichas, as fontes, a comparação e a metodologia continuam nos mesmos endereços. Nada do atlas depende de jogar.

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
| Entrada | Uma coluna: texto, os dois cartões lado a lado, números da edição e a faixa das trajetórias, com rolagem horizontal | O mesmo, com a faixa inteira à vista | Duas colunas (a partir de 1024 px): texto e números à esquerda, centrados na altura dos cartões, que ficam à direita |
| Acontecimento | Uma coluna: retorno, cabeçalho, texto, fontes, revisão e, depois, a ficha | O mesmo | Duas colunas (a partir de 1024 px): leitura com até 672 px e ficha de 352 px |
| Comparação | Recorte escrito e preso ao topo, com os controles atrás do botão **Filtros**. Faixas com rolagem horizontal, começando pelos anos recentes ou no período escolhido. As duas colunas de pessoa, uma abaixo da outra, com atalho para cada uma | Recorte como na estreita. Faixas inteiras à vista; colunas uma abaixo da outra | Controles do recorte em linha, a partir de 1280 px. Duas colunas de pessoa lado a lado (a partir de 1024 px), com as seções na mesma altura |
| Metodologia | Uma coluna: o índice e, depois, o texto. A tabela das categorias rola para o lado dentro da própria área | O mesmo, com o índice em duas colunas de links | Duas colunas (a partir de 1024 px): índice de 224 px, que acompanha a rolagem, e o texto |
| Jogo, entrada | Uma coluna: texto, os dois cartões um abaixo do outro, créditos e instruções | Os dois cartões lado a lado | O mesmo |
| Jogo, cena | A cena na altura da janela; o objetivo e os dois botões no alto; direcional e ação embaixo. A câmera acompanha o personagem, porque a sala não cabe inteira. Com o celular deitado, o palco cabe na janela e o cabeçalho da cena encolhe | A sala quase inteira à vista | A sala inteira à vista, ampliada até caber |
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
| 13 a 18 s | Clicar na marca de 2023 na linha do tempo | A lista rola até o item e o marca, o mapa enquadra Brasília e Araraquara, e o painel abre com o título em destaque |
| 18 a 23 s | Rolar o painel até **Fontes** e clicar em **Abrir a página do acontecimento** | Página com o texto, as três fontes numeradas e a ficha lateral |
| 23 a 28 s | Clicar no título da primeira fonte | O documento original abre em outra aba |
| 28 a 30 s | Voltar e clicar em **Trajetória de Lula** | A exploração volta com o mesmo acontecimento aberto |

Para a versão em celular (390×844): entrada, cartão, aba **Mapa**, toque em uma marca da linha do tempo, **Ler** no cartão, rolar até as fontes.

### Roteiro do jogo (cerca de 45 segundos)

Em 1440×900, com `npm run build` e `npm run preview` abertos em `http://localhost:4311/`.

| Tempo | Ação | O que aparece |
| --- | --- | --- |
| 0 a 4 s | Abrir a entrada e clicar em **Jogar com Lula** | A cena do primeiro capítulo, com o objetivo no alto |
| 4 a 10 s | Andar com as setas até a pasta pedida | A pasta em destaque, o anel no chão e a dica **Recolher o registro** |
| 10 a 15 s | Tecla E | O registro: data, título, resumo, fontes e situação da revisão, e o aviso de que a tarefa está concluída e faltam três registros para a saída abrir |
| 15 a 28 s | **Guardar e continuar** e recolher as outras três pastas | A contagem sobe a cada registro; no último, a tranca some e a porta abre |
| 28 a 33 s | Andar até a saída | A transição com o capítulo seguinte |
| 33 a 41 s | No capítulo 2, recolher os dois registros pedidos | A pergunta de ordem, com as duas datas |
| 41 a 45 s | Responder e abrir **Capítulos e tarefas** | A tarefa concluída, o registro que ainda falta para a saída abrir e os caminhos para o atlas |

## Capturas

As capturas reais ficam em [`docs/capturas/`](capturas/README.md): as da prévia, em `fase-4/`, as da navegação temporal, em `fase-5/`, as do mapa, em `fase-6/`, as da comparação, das páginas e da metodologia, em `fase-7/`, e as do acabamento, tiradas da saída estática, em `fase-8/`, com as de antes da fase em `fase-8/antes/`. As da conferência da fase 9 ficam em `fase-9/`, e as do jogo, em `jogo-etapa-1/`. O índice e os comandos que as refazem estão em [`docs/capturas/README.md`](capturas/README.md).
