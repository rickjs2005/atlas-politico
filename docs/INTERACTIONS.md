# Interações

Fase 4. Como a prévia se comporta: o estado que as partes compartilham, o que cada ação faz em cada largura, o teclado, os estados previstos, o movimento e o contrato do que ainda é demonstração. As telas estão em [UX.md](UX.md) e os componentes em [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md).

## Estado compartilhado

A exploração tem um estado só (`src/lib/state/`, da fase 1), lido por todas as partes:

| Campo | O que guarda | Quem altera |
| --- | --- | --- |
| `pessoa` | Slug do perfil. Vem da rota | A rota |
| `periodo` | Ano inicial e final do recorte; `null` deixa o lado aberto | Controle de período |
| `categorias` | Categorias marcadas; lista vazia significa todas | Filtro de categorias |
| `acontecimento` | Slug do acontecimento selecionado | Lista, linha do tempo, mapa, painel |

Lista, mapa, linha do tempo e painel não guardam seleção própria. Eles leem `visible` (os acontecimentos do recorte) e `selected` do mesmo provider, e por isso não há como ficarem em desacordo.

Regras do estado que a interface herda:

- **Selecionar de novo o mesmo item desfaz a seleção** na lista e na linha do tempo.
- **Se o recorte muda e o acontecimento selecionado sai dele, a seleção é desfeita.** O painel volta ao perfil.
- **Período informado ao contrário é lido na ordem certa.** Os campos também se corrigem: escolher um "De" maior que o "Até" leva o "Até" junto.

Fora do estado compartilhado ficam três escolhas de apresentação, locais à tela de exploração: a vista ativa (lista, mapa ou perfil), se a leitura está aberta e se os filtros estão à vista.

## Seleção

O que acontece ao escolher um acontecimento, por origem e por largura:

| Origem | Estreita | Média | Larga |
| --- | --- | --- | --- |
| Item da lista | A leitura substitui a lista; o foco vai para o título | A leitura substitui a lista na coluna esquerda; o foco vai para o título | O painel à direita mostra o acontecimento; o foco fica no item |
| Marca da linha do tempo, na vista de lista | O mesmo que o item da lista | O mesmo que o item da lista | O mesmo que o item da lista |
| Marca da linha do tempo, na vista do mapa | Cartão sobre o mapa, com **Ler** e **Fechar** | Não se aplica | Não se aplica |
| Ponto do mapa | Cartão sobre o mapa, com **Ler** e **Fechar** | A leitura substitui a lista; o foco vai para o título | O painel mostra o acontecimento |

Em qualquer caso, as quatro partes passam a mostrar o mesmo acontecimento:

- **Lista:** filete de acento à esquerda, fundo de acento suave e `aria-pressed="true"`.
- **Linha do tempo:** anel de acento em volta da marca, haste até o eixo e `aria-pressed="true"`. Em tela estreita, a faixa rola até a marca ficar à vista.
- **Mapa:** ponto maior na cor de acento, com um anel em volta. A câmera vai até o ponto; com mais de um lugar, enquadra todos. Com o cartão aberto em tela estreita, o enquadramento deixa os pontos acima dele. Acontecimento sem ponto não move a câmera.
- **Leitura:** o acontecimento, com título, data, resumo, contexto, lugares, fontes e revisão.

Uma região de anúncio (`aria-live="polite"`) diz "Aberto: título" a cada seleção.

### Fechar e voltar

| Ação | Efeito |
| --- | --- |
| **Fechar** no painel, ou Esc com o foco na leitura | Desfaz a seleção. O foco volta ao item da lista de onde se saiu; se a leitura veio do mapa em tela estreita, volta à aba **Mapa** |
| **Fechar** no cartão sobre o mapa | Desfaz a seleção e mantém o mapa onde está |
| **Ler** no cartão sobre o mapa | Abre a leitura, com o foco no título |
| Aba **Perfil** | Fecha o acontecimento aberto e mostra o perfil |
| Aba **Lista** ou **Mapa** com um acontecimento aberto | Fecha a leitura e mantém a seleção marcada na vista escolhida |
| **Abrir a página do acontecimento** | Vai a `/acontecimentos/<slug>/` |
| **Trajetória de (pessoa)** na página do acontecimento | Volta a `/politicos/<slug>/?acontecimento=<slug>`, com o acontecimento aberto |

## Recorte

- **Período:** dois campos de ano, "De" e "Até", com os anos da cobertura da pessoa. Escolher o próprio limite da cobertura equivale a deixar aquele lado aberto. **Todo o período** só aparece quando há recorte.
- **Categorias:** um botão de alternância por categoria (`aria-pressed`), com a quantidade de registros daquela categoria no período em vigor. **Mostrar todas** só aparece quando alguma está marcada.
- O recorte vale ao mesmo tempo para a lista, os pontos do mapa e as marcas da linha do tempo. A linha do tempo mantém as marcas nas mesmas fileiras e hachura o que ficou fora do período, para o eixo não "pular".
- A contagem "N acontecimentos · M com ponto no mapa" fica sobre a linha do tempo e acompanha o recorte.
- Em tela larga, os dois botões de desfazer ficam na linha do rótulo: a barra de filtros não muda de altura quando eles aparecem. Um teste confere.

## Teclado

| Parte | Comportamento |
| --- | --- |
| Primeiro Tab da página | Link **Pular para o conteúdo** |
| Cabeçalho | Links em ordem; em tela estreita, o botão **Menu** abre o painel (`aria-expanded`) e Esc o fecha |
| Filtros | Campos nativos de seleção e botões; Tab na ordem de leitura |
| Lista | Cada item é um botão: Tab e Shift+Tab percorrem, Enter ou espaço selecionam |
| Linha do tempo | Barra de ferramentas com uma parada de Tab só. Setas esquerda e direita vão de marca em marca, Home e End vão às pontas, Enter ou espaço selecionam. Com seleção, o Tab entra pela marca selecionada |
| Mapa | O canvas recebe foco e responde ao teclado do MapLibre (setas movem, `+` e `-` aproximam e afastam). Os pontos não são alcançáveis pelo teclado: o caminho de teclado para qualquer acontecimento é a lista ou a linha do tempo |
| Leitura | Ao abrir em tela estreita ou média, o foco vai para o título. Esc fecha. Os links das fontes abrem em outra aba, e isso é dito a leitores de tela |
| Mapa indisponível | A lista de lugares que o substitui é feita de botões, com `aria-pressed` |

O foco é sempre visível: anel de tinta de 2 px, afastado 2 px do elemento. No canvas do mapa o anel é desenhado para dentro, porque a moldura corta o que passa da borda.

### Leitores de tela

- Cada parte da exploração é uma região com nome: Recorte, Linha do tempo, Acontecimentos, Mapa e Leitura.
- A página de exploração tem um título de nível 1 ("Trajetória de …") fora da tela; as regiões usam o nível 2 e o conteúdo do painel, o 3.
- As datas da lista são lidas por extenso ("8 de janeiro de 2023"), e não como "2023 8 jan".
- As formas de categoria, o eixo, as hachuras e os colchetes são decorativos (`aria-hidden`). O que eles dizem está sempre em texto: o nome da categoria, a data de cada acontecimento, os anos das lacunas.
- As faixas de cargos e de partidos são uma imagem com descrição por extenso ("Cargos e funções ao longo do tempo: …").
- Nenhuma informação depende só de cor: seleção tem filete, anel e `aria-pressed`; categoria tem forma e nome; período incerto tem tracejado e texto.

Não verificado nesta fase: leitura real com NVDA, VoiceOver ou TalkBack. A estrutura acima foi conferida pela árvore de acessibilidade usada nos testes, e não por um leitor de tela.

## Estados

| Estado | O que a interface mostra | Onde ver |
| --- | --- | --- |
| Mapa carregando | Moldura na cor do mar com "Carregando o mapa…" (`role="status"`). A lista e a linha do tempo já funcionam | Qualquer exploração, nos primeiros instantes |
| Nada selecionado | Painel com o perfil da pessoa (tela larga); lista inteira (demais) | `/politicos/lula/` |
| Acontecimento selecionado | Marcado nas quatro partes | Clicar em qualquer item |
| Período ou categoria sem registros | "Nenhum registro do atlas neste recorte. Isso indica falta de registro nesta edição, e não falta de atividade pública no período." e o botão **Limpar período e categorias**. Mapa sem pontos; linha do tempo sem marcas, com o período em claro | Lula, de 1996 a 2001 |
| Acontecimento sem imagem | O painel e a página não reservam espaço vazio: o texto sobe | Todos os da edição atual |
| Acontecimento com imagem | Figura sob o cabeçalho, com crédito | Só no guia `/dev/previa/`, com área reservada |
| Acontecimento sem coordenadas | Aviso na lista ("sem ponto no mapa", com o motivo), frase no painel, câmera parada. Na página, a ficha diz o motivo e não desenha mapa | 13 dos 39 acontecimentos |
| Data parcial | Só o que se sabe, mais a frase de precisão | Guia `/dev/previa/`, bloco de datas |
| Fonte indisponível | Título sem link, aviso "Fonte indisponível" e o endereço por extenso | Só no guia `/dev/previa/` |
| Perfil sem retrato | Iniciais do nome na mesma moldura | Só no guia `/dev/previa/` |
| Falha do mapa | "O mapa não pôde ser exibido neste navegador." e a lista de lugares do recorte, com coordenada e precisão, selecionável | Guia `/dev/previa/`; ou bloquear o pacote do mapa |
| Endereço com parâmetro inválido | O parâmetro é descartado sozinho, e a página abre com o resto | `/politicos/lula/?acontecimento=nao-existe` |
| Endereço inexistente | Página 404 com a identidade do atlas e cinco caminhos de volta | Qualquer endereço fora das rotas |

A falha do mapa cobre três causas, todas testadas: navegador sem WebGL, pacote do mapa que não baixou e mapa que não termina de carregar em 15 segundos. O contador de espera só corre com a aba visível, e o mapa só é montado quando a moldura aparece na tela: em celular, quem fica na lista não baixa o pacote do mapa.

## Movimento

Curto e com função. Duas durações e uma curva, em tokens:

| Token | Valor |
| --- | --- |
| `--atlas-fast` | 120 ms |
| `--atlas-base` | 180 ms |
| `--atlas-ease` | `cubic-bezier(0.2, 0, 0, 1)` |

| Transição | Duração aproximada | Intenção |
| --- | --- | --- |
| Cor de fundo e de borda de itens, botões e cartões, ao passar o ponteiro ou selecionar | 120 ms | Responder ao gesto sem atraso |
| Marca da linha do tempo cresce 25% sob o ponteiro e quando selecionada | 120 ms | Mostrar qual marca será aberta |
| Conteúdo do painel de leitura entra com opacidade de 0 a 1 e sobe 4 px | 180 ms | Avisar que o conteúdo trocou, sem deslocar a leitura |
| Cartão do acontecimento sobre o mapa entra do mesmo jeito | 180 ms | Ligar o cartão ao toque |
| Câmera do mapa vai até o ponto, ou enquadra os pontos | 500 ms | Manter a noção de onde se estava |
| Linha do tempo rola até a marca selecionada, em tela estreita | Rolagem suave do navegador, cerca de 300 a 500 ms | Trazer a marca para a parte visível |

Não há animação de entrada de página, rolagem com efeito, paralaxe nem movimento contínuo.

**Movimento reduzido.** Com `prefers-reduced-motion: reduce`, as animações e transições de CSS caem para 0,01 ms, a rolagem da linha do tempo é imediata e o MapLibre troca o movimento de câmera por um salto. As mudanças de estado são as mesmas. Os testes de navegador rodam nesse modo.

## Em demonstração nesta fase

O que funciona na prévia mas ainda não é a implementação final, e o contrato que a fase seguinte recebe:

| Item | Como está na prévia | Contrato para a continuação |
| --- | --- | --- |
| Estado no endereço | O endereço é lido uma vez, na chegada (`de`, `ate`, `categorias`, `acontecimento`), e o recorte é restaurado. Mexer nos filtros ou selecionar não altera o endereço | `serializeAtlasParams(state)` já devolve a forma canônica. A fase 5 passa a escrever no histórico e a responder a voltar e avançar, sem mudar os nomes dos parâmetros |
| Período por arraste na linha do tempo | Não existe. O período é escolhido pelos dois campos | O arraste deve disparar a mesma ação, `setPeriod(de, ate)`, e conviver com os campos, que seguem sendo o caminho de teclado e de toque |
| Linha do tempo | Marcas, eixo, faixas e recorte. Sem zoom, sem agrupamento de marcas muito próximas além das fileiras | `placeMarks` e `packRows` (`src/components/time/scale.ts`) recebem o domínio de anos e devolvem posições de 0 a 1 |
| Rótulos das barras de cargo | Barra com menos de 48 px fica sem texto; o nome aparece na dica do ponteiro e na lista de cargos do perfil | `PeriodLane` recebe `rotulo` e `descricao` de cada item |
| Pontos sobrepostos no mapa | Acontecimentos do mesmo município ou de municípios vizinhos caem no mesmo ponto; o clique abre o de cima. A lista dá acesso a todos | A fase 6 decide entre agrupar e listar por lugar. `MapView` recebe os pontos já recortados e devolve `onSelect(slug)` |
| Base e rótulos do mapa | Contornos do Natural Earth 1:50m, sem nomes de lugares | `buildBaseStyle(base)` isola a base; trocar os arquivos não muda quem usa o mapa |
| Forma da categoria no mapa | Só a cor; o ponto é sempre um círculo | `CATEGORY_COLORS` e `CATEGORY_VISUAL` já têm a mesma chave |
| Pontos pelo teclado | Não são focáveis | Ponto em aberto em DECISIONS.md (círculos ou marcadores focáveis), para a fase 6 |
| Comparação | Período em estado local da tela; não vai ao endereço. Sem filtro de categoria. As marcas levam à página do acontecimento | `compareTrajectories(data, { periodo, categorias })` já aceita os dois recortes. A fase 7 liga a tela ao estado e ao endereço |
| Fonte indisponível | O componente tem o estado, mas nenhum dado o aciona | `SourceEntry.indisponivel`. A conferência de links é da fase 9 |
| Imagem de acontecimento | O painel e a página têm o lugar e o crédito; nenhum registro tem imagem | `Imagem`, com `arquivo`, `textoAlternativo`, `credito` e `dimensoes` |
| Guia de estados | `/dev/previa/`, só no servidor de desenvolvimento | Não entra no build |

O que não é demonstração: a seleção compartilhada, os filtros, a composição por largura, o painel, a página do acontecimento, as fontes, a comparação na mesma escala, os estados de falha e a página 404 usam os dados gerados reais e têm teste de navegador (`tests/e2e/previa.spec.ts`).
