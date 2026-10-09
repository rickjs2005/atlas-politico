# Interações

Fases 4, 5 e 6. Como a exploração se comporta: o estado que as partes compartilham, o que cada ação faz em cada largura, o teclado, os estados previstos, o movimento e o contrato do que ainda é demonstração. As telas estão em [UX.md](UX.md), os componentes em [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) a navegação temporal, com o endereço e o histórico, em [TIMELINE.md](TIMELINE.md), e o mapa, em [MAP.md](MAP.md).

## Estado compartilhado

A exploração tem um estado só (`src/lib/state/`), lido por todas as partes. Desde a fase 5 ele fica no endereço: é derivado da query string, e cada ação vira um endereço novo (TIMELINE.md, seção Endereço).

| Campo | O que guarda | Onde fica | Quem altera |
| --- | --- | --- | --- |
| `pessoa` | Slug do perfil | Rota | A rota e a troca de pessoa |
| `periodo` | Ano inicial e final do recorte; `null` deixa o lado aberto | `de` e `ate` | Campos de ano, clique e arraste no eixo |
| `categorias` | Categorias marcadas; lista vazia significa todas | `categorias` | Filtro de categorias |
| `acontecimento` | Slug do acontecimento selecionado | `acontecimento` | Lista, linha do tempo, mapa, painel |

Lista, mapa, linha do tempo e painel não guardam seleção própria. Eles leem `visible` (os acontecimentos do recorte) e `selected` do mesmo provider, e por isso não há como ficarem em desacordo.

Regras do estado que a interface herda:

- **Selecionar de novo o mesmo item desfaz a seleção** na lista e na linha do tempo.
- **Se o recorte muda e o acontecimento selecionado sai dele, a seleção é desfeita.** O painel volta ao perfil, e a lista avisa: "O acontecimento que estava aberto ficou fora deste recorte e foi fechado."
- **Período informado ao contrário é lido na ordem certa.** Os campos também se corrigem: escolher um "De" maior que o "Até" leva o "Até" junto.
- **O período fica dentro do que a edição cobre.** Um lado no limite da cobertura fica aberto, e um período inteiro fora dela é descartado.

Fora do estado compartilhado ficam quatro escolhas de apresentação, locais à tela de exploração e fora do endereço: a vista ativa (lista, mapa ou perfil), se a leitura está aberta, se os filtros estão à vista e se o bloco de cargos e partidos está aberto.

**Quem está selecionado está sendo lido.** Vale ao escolher um item, ao chegar por um endereço com `acontecimento` e ao voltar ou avançar no histórico. As duas exceções são de tela estreita ou média: o cartão sobre o mapa, e a leitura fechada ao trocar de vista com o acontecimento ainda marcado.

## Seleção

O que acontece ao escolher um acontecimento, por origem e por largura:

| Origem | Estreita | Média | Larga |
| --- | --- | --- | --- |
| Item da lista | A leitura substitui a lista; o foco vai para o título | A leitura substitui a lista na coluna esquerda; o foco vai para o título | O painel à direita mostra o acontecimento; o foco fica no item |
| Marca da linha do tempo, na vista de lista | O mesmo que o item da lista | O mesmo que o item da lista | O mesmo que o item da lista |
| Marca da linha do tempo, na vista do mapa | Cartão sobre o mapa, com **Ler** e **Fechar** | Não se aplica | Não se aplica |
| Marcador do mapa com um acontecimento | Cartão sobre o mapa, com **Ler** e **Fechar** | A leitura substitui a lista; o foco vai para o título | O painel mostra o acontecimento |
| Marcador do mapa com vários acontecimentos | Abre o seletor, uma folha na parte de baixo do mapa. Escolhido um item, o cartão toma o lugar da folha | Abre o seletor, um quadro no canto do mapa. Escolhido um item, vale a linha de cima | O mesmo, e o foco volta ao marcador |
| Botão **N sem ponto no mapa** | Abre o mesmo seletor, com os acontecimentos sem ponto agrupados pelo motivo | O mesmo | O mesmo |

Em qualquer caso, as quatro partes passam a mostrar o mesmo acontecimento:

- **Lista:** filete de acento à esquerda, fundo de acento suave e `aria-pressed="true"`.
- **Linha do tempo:** anel de acento em volta da marca, haste até o eixo e `aria-pressed="true"`. Em tela estreita, a faixa rola até a marca ficar à vista.
- **Mapa:** os marcadores de todos os lugares do acontecimento ganham um anel de acento, inclusive quando o lugar está agrupado com outros. A câmera só se move se algum desses lugares não estiver à vista: então vai ao lugar, ou enquadra todos. Com o cartão aberto em tela estreita, o enquadramento deixa os lugares acima dele. Acontecimento sem ponto não move a câmera, e o mapa diz o motivo.
- **Leitura:** o acontecimento, com título, data, resumo, contexto, lugares, fontes e revisão.

Uma região de anúncio (`aria-live="polite"`) diz "Aberto: título" a cada seleção.

### Fechar e voltar

| Ação | Efeito |
| --- | --- |
| **Fechar** no painel, ou Esc com o foco na leitura | Desfaz a seleção. O foco volta ao item da lista de onde se saiu; se a leitura veio do mapa em tela estreita, volta à aba **Mapa** |
| **Fechar** no cartão sobre o mapa | Desfaz a seleção e mantém o mapa onde está |
| **Fechar** no seletor do mapa, Esc com o foco nele, ou a escolha de um item | Fecha o seletor e devolve o foco ao marcador que o abriu |
| Clique fora do seletor, no mapa, ou mudança de filtro | Fecha o seletor e deixa o foco onde está |
| Arrastar, aproximar ou afastar o mapa | Não muda a seleção nem o endereço |
| **Ler** no cartão sobre o mapa | Abre a leitura, com o foco no título |
| Aba **Perfil** | Fecha o acontecimento aberto e mostra o perfil |
| Aba **Lista** ou **Mapa** com um acontecimento aberto | Fecha a leitura e mantém a seleção marcada na vista escolhida. Acionar o item marcado abre a leitura de novo |
| Botão voltar do navegador com a leitura aberta | Fecha a leitura e devolve a lista, ou o mapa. Avançar a reabre |
| **Abrir a página do acontecimento** | Vai a `/acontecimentos/<slug>/` |
| **Trajetória de (pessoa)** na página do acontecimento | Volta a `/politicos/<slug>/?acontecimento=<slug>`, com o acontecimento aberto |

## Recorte

- **Pessoa:** os perfis aparecem em ordem alfabética, com o que está aberto marcado. Em tela larga, sob o nome; nas demais, dentro de **Filtros**. O link para o outro perfil leva o recorte junto (TIMELINE.md, seção Estado inicial e troca de pessoa).
- **Período pelos campos:** dois campos de ano, "De" e "Até", com os anos da cobertura da pessoa. Escolher o próprio limite da cobertura equivale a deixar aquele lado aberto. **Todo o período** só aparece quando há recorte.
- **Período pelo eixo:** clicar em um ano escolhe só aquele ano, e clicar de novo desfaz. Arrastar escolhe o intervalo, em qualquer sentido; Esc desfaz o arraste. Sob o ponteiro, um rótulo diz o ano; durante o arraste, o intervalo. A lista e o endereço só mudam ao soltar. No toque, onde a faixa rola para o lado, arrastar rola a faixa e só o toque parado escolhe.
- **Categorias:** um botão de alternância por categoria (`aria-pressed`), com a quantidade de registros daquela categoria no período em vigor. Nenhuma marcada significa todas; várias marcadas somam. **Mostrar todas** só aparece quando alguma está marcada.
- **Limpar filtros:** desfaz período e categorias de uma vez e mantém o acontecimento aberto. Aparece só com filtro em vigor: no cabeçalho da lista, dentro de **Filtros** em tela estreita e média, e na mensagem de recorte vazio.
- O recorte vale ao mesmo tempo para a lista, os marcadores do mapa e as marcas da linha do tempo. A linha do tempo mantém o eixo e hachura o que ficou fora do período, para o eixo não "pular".
- O mapa não se recentra a cada filtro: a câmera só anda se algum lugar do recorte ficou fora da vista, e só enquanto a pessoa não tiver movido o mapa. **Enquadrar os lugares do recorte** devolve o enquadramento.
- O botão **N sem ponto no mapa** conta os acontecimentos do recorte de abrangência nacional ou sem lugar documentado, e some quando não há nenhum.
- Sobre a lista ficam o período, a quantidade ("N registros do atlas"), a cobertura e as categorias marcadas. A contagem "N acontecimentos · M com ponto no mapa" fica sobre a linha do tempo.
- **Cargos e partidos do período:** bloco recolhido acima da lista, com o resumo à vista. Aberto, separa o que as datas provam do que tem presença incerta.
- Em tela larga, os dois botões de desfazer ficam na linha do rótulo: a barra de filtros não muda de altura quando eles aparecem. Um teste confere.

## Teclado

| Parte | Comportamento |
| --- | --- |
| Primeiro Tab da página | Link **Pular para o conteúdo** |
| Cabeçalho | Links em ordem; em tela estreita, o botão **Menu** abre o painel (`aria-expanded`) e Esc o fecha |
| Filtros | Campos nativos de seleção e botões; Tab na ordem de leitura. Em um campo de ano, as setas percorrem os anos e a consulta acompanha; a sequência inteira conta como um passo no histórico |
| Troca de pessoa | Links, na ordem do documento; o perfil aberto não é link e leva `aria-current="page"` |
| Cargos e partidos do período | Elemento nativo de abrir e fechar: Enter ou espaço no título |
| Eixo da linha do tempo | O clique e o arraste são atalhos de ponteiro e ficam fora da árvore de acessibilidade. O caminho de teclado para o mesmo recorte são os campos de ano |
| Lista | Cada item é um botão: Tab e Shift+Tab percorrem, Enter ou espaço selecionam |
| Linha do tempo | Barra de ferramentas com uma parada de Tab só. Setas esquerda e direita vão de marca em marca, Home e End vão às pontas, Enter ou espaço selecionam. Com seleção, o Tab entra pela marca selecionada |
| Mapa | O canvas recebe foco e responde ao teclado do MapLibre (setas movem, `+` e `-` aproximam e afastam). Depois dele, o Tab percorre os marcadores, de norte a sul: Enter ou espaço seleciona o acontecimento do marcador, ou abre o seletor quando há vários. Em seguida vêm os controles (**Aproximar**, **Afastar**, **Enquadrar os lugares do recorte**), o botão dos acontecimentos sem ponto e a legenda |
| Seletor do mapa | Ao abrir, recebe o foco. Tab percorre **Fechar** e os acontecimentos; Enter ou espaço escolhe; Esc fecha. O foco volta ao marcador |
| Leitura | Ao abrir em tela estreita ou média, o foco vai para o título. Esc fecha. Os links das fontes abrem em outra aba, e isso é dito a leitores de tela |
| Mapa indisponível | A lista que o substitui é agrupada por lugar; cada acontecimento é um botão, com `aria-pressed`, e o nome dele inclui o lugar. **Tentar de novo** ou **Recarregar a página**, quando há |

O foco é sempre visível: anel de tinta de 2 px, afastado 2 px do elemento. No canvas do mapa o anel é desenhado para dentro, porque a moldura corta o que passa da borda.

### Leitores de tela

- Cada parte da exploração é uma região com nome: Recorte, Linha do tempo, Acontecimentos, Mapa e Leitura.
- A página de exploração tem um título de nível 1 ("Trajetória de …") fora da tela; as regiões usam o nível 2 e o conteúdo do painel, o 3.
- As datas da lista são lidas por extenso ("8 de janeiro de 2023"), e não como "2023 8 jan". A data parcial vem com a frase do que falta ("1975. Só o ano está documentado.").
- A região de anúncio diz o acontecimento aberto ou, sem seleção, o recorte em vigor ("3 registros do atlas em 2018, todas as categorias."), e avisa quando um filtro fechou o acontecimento.
- Cada lacuna da lista é um item lido por extenso ("De 1981 a 1985: sem registros do atlas nesta edição").
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
| Período ou categoria sem registros | "Nenhum registro do atlas neste recorte. Isso indica falta de registro nesta edição, e não falta de atividade pública no período." e o botão **Limpar período e categorias**. Mapa sem pontos; linha do tempo sem marcas, com o período em claro | `/politicos/lula/?de=1996&ate=2001` |
| Lacuna dentro do recorte | Linha hachurada na lista, no lugar dos anos: "1981–1985 · sem registros do atlas nesta edição" | Qualquer exploração de Lula sem período |
| Ordem que as datas não decidem | "ordem dentro de 1980 não documentada", no registro menos preciso | Lula, 1980 |
| Acontecimento que saiu do recorte | Painel de volta ao perfil e o aviso sobre a lista | Abrir um acontecimento e marcar outra categoria |
| Cargo ou partido de presença incerta | Seção à parte no bloco do período, com borda tracejada | `/politicos/flavio-bolsonaro/?de=2021&ate=2021` |
| Acontecimento sem imagem | O painel e a página não reservam espaço vazio: o texto sobe | Todos os da edição atual |
| Acontecimento com imagem | Figura sob o cabeçalho, com crédito | Só no guia `/dev/previa/`, com área reservada |
| Acontecimento sem coordenadas | Aviso na lista ("sem ponto no mapa", com o motivo), frase no painel, câmera parada e aviso no canto do mapa. Acessível também pelo botão **N sem ponto no mapa**. Na página, a ficha diz o motivo e não desenha mapa | 13 dos 39 acontecimentos |
| Vários acontecimentos no mesmo lugar, ou em lugares próximos | Um marcador com a quantidade, que abre o seletor | Brasília, em qualquer exploração |
| Lugar conhecido só pelo estado | Marcador de contorno tracejado, no centro do estado; no seletor, "aproximação: unidade da federação" | Flávio Bolsonaro, com o mapa aproximado até o estado do Rio de Janeiro se separar da capital |
| Recorte sem nenhum ponto | "Nenhum acontecimento deste recorte tem ponto no mapa.", no canto do mapa | `/politicos/flavio-bolsonaro/?de=2021&ate=2021` |
| Lugar fora da área que a base cobre | Sem marcador; entra na lista **sem ponto no mapa**, com o nome do lugar | Só em `/dev/prova/`: nenhum lugar da edição está fora da área |
| Data parcial | Só o que se sabe, mais a frase de precisão. Na lista, "só o ano" ou "sem o dia" sob o ano | Lula, 1975 e 1979; guia `/dev/previa/` |
| Fonte indisponível | Título sem link, aviso "Fonte indisponível" e o endereço por extenso | Só no guia `/dev/previa/` |
| Perfil sem retrato | Iniciais do nome na mesma moldura | Só no guia `/dev/previa/` |
| Falha do mapa | Uma mensagem com o motivo, a saída quando há (**Tentar de novo** ou **Recarregar a página**) e a lista de lugares do recorte, com coordenada e precisão, selecionável | Guia `/dev/previa/`; `/dev/prova/`, com **Simular navegador sem WebGL** |
| Desenho do mapa interrompido | "O navegador interrompeu o desenho do mapa. Tentando retomar…", sobre o mapa. Se o navegador não devolver o contexto em 5 segundos, a lista de lugares assume | Só em teste, com a extensão `WEBGL_lose_context` |
| Endereço com parâmetro inválido | O parâmetro é descartado sozinho, a página abre com o resto e o endereço é corrigido no lugar | `/politicos/lula/?acontecimento=nao-existe&de=abcd` |
| Acontecimento de outro perfil ou fora do recorte pedido | Não abre: o painel fica no perfil e os filtros valem | `/politicos/lula/?de=2020&ate=2022&acontecimento=lula-2018-prisao-em-curitiba` |
| Janela baixa, em tela média ou larga | O mapa fica com pelo menos 40% da altura da área de trabalho; a linha do tempo rola por dentro | Janela de 1280×720 |
| Endereço inexistente | Página 404 com a identidade do atlas e cinco caminhos de volta | Qualquer endereço fora das rotas |

A falha do mapa cobre cinco causas, todas testadas: navegador sem WebGL, pacote do mapa que não baixou, contornos que não carregaram, mapa que não termina de carregar em 15 segundos e contexto gráfico perdido sem retomada (MAP.md, seção Falhas). O contador de espera só corre com a aba visível, e o mapa só é montado quando a moldura aparece na tela: em celular, quem fica na lista não baixa o pacote do mapa.

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
| Câmera do mapa vai até o lugar, enquadra os lugares ou desloca o mínimo para tirar um marcador de baixo do seletor | 500 ms | Manter a noção de onde se estava |
| Aproximar e afastar pelos controles | 250 ms | Responder ao botão sem salto |
| Seletor do mapa entra com opacidade de 0 a 1 e sobe 4 px | 180 ms | Ligar a lista ao marcador |
| Marcador cresce 10% sob o ponteiro | 120 ms | Mostrar qual marcador será acionado |
| Linha do tempo rola até a marca selecionada, em tela estreita | Rolagem suave do navegador, cerca de 300 a 500 ms | Trazer a marca para a parte visível |
| Linha do tempo rola até o período escolhido, em tela estreita | A mesma rolagem | Mostrar o trecho em claro, e não só a hachura |
| Rótulo e faixa do ano sob o ponteiro, no eixo | Sem transição | Seguir o ponteiro sem atraso |
| Seta do bloco de cargos e partidos gira ao abrir | 120 ms | Dizer que o bloco abriu |

Não há animação de entrada de página, rolagem com efeito, paralaxe nem movimento contínuo.

**Movimento reduzido.** Com `prefers-reduced-motion: reduce`, as animações e transições de CSS caem para 0,01 ms, a rolagem da linha do tempo é imediata e o MapLibre troca o movimento de câmera por um salto. As mudanças de estado são as mesmas. Os testes de navegador rodam nesse modo.

## Em demonstração

O que funciona mas ainda não é a implementação final, e o contrato que a fase seguinte recebe. A fase 5 fechou quatro itens da lista da fase 4: o estado no endereço e o histórico, o período pelo eixo, a distribuição das marcas próximas e o acesso por extenso aos cargos de barra estreita. A fase 6 fechou os quatro do mapa: pontos sobrepostos, base, forma da categoria e acesso pelo teclado.

| Item | Como está | Contrato para a continuação |
| --- | --- | --- |
| Zoom na linha do tempo | Não existe, por decisão (D-53). O eixo é fixo, e as marcas próximas sobem de fileira conforme a largura | `placeMarks` e `packRows` (`src/components/time/scale.ts`) recebem o domínio de anos e devolvem posições de 0 a 1 |
| Rótulos das barras de cargo | Barra com menos de 48 px fica sem texto no desenho. O nome está por extenso no bloco de cargos e partidos do período e no perfil | `PeriodLane` recebe `rotulo` e `descricao` de cada item |
| Comparação | Período em estado local da tela; não vai ao endereço. Sem filtro de categoria. As marcas levam à página do acontecimento | `compareTrajectories(data, { periodo, categorias })` já aceita os dois recortes. A fase 7 liga a tela ao estado e ao endereço, com as regras de `src/lib/state/url-state.ts` |
| Retorno da página do acontecimento | O link **Trajetória de (pessoa)** leva só `?acontecimento=<slug>`: o período e as categorias de antes não seguem. O botão voltar do navegador devolve a consulta inteira | A fase 7 refina as páginas e o compartilhamento |
| Fonte indisponível | O componente tem o estado, mas nenhum dado o aciona | `SourceEntry.indisponivel`. A conferência de links é da fase 9 |
| Imagem de acontecimento | O painel e a página têm o lugar e o crédito; nenhum registro tem imagem | `Imagem`, com `arquivo`, `textoAlternativo`, `credito` e `dimensoes` |
| Rótulos da base do mapa | Não existem, por decisão (D-58). Os nomes no mapa são os dos lugares do conteúdo | Nomes de estados ou de países pedem glyphs locais ou marcadores de texto; `buildBaseStyle` isola a base |
| Lugares fora da América do Sul | Não são desenhados; entram na lista **sem ponto no mapa**, com o nome | Um contorno mundial e a caixa de `MAP_LIMITS` ampliada (`src/features/map/base/README.md`) |
| Guia de estados | `/dev/previa/`, só no servidor de desenvolvimento | Não entra no build |

O que não é demonstração: a seleção compartilhada, os filtros, a consulta no endereço com voltar e avançar, a troca de pessoa, a lista cronológica com lacunas, os cargos e partidos do período, o mapa sincronizado com o seletor de lugares, a composição por largura, o painel, a página do acontecimento, as fontes, a comparação na mesma escala, os estados de falha e a página 404 usam os dados gerados reais e têm teste de navegador (`tests/e2e/previa.spec.ts`, `tests/e2e/linha-do-tempo.spec.ts` e `tests/e2e/mapa.spec.ts`).
