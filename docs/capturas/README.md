# Capturas

Capturas reais do atlas, tiradas do servidor de desenvolvimento com os dados gerados da edição 0.1.0, em um Chromium controlado pelo Playwright.

| Pasta | O que registra | Comando | Roteiro |
| --- | --- | --- | --- |
| `fase-4/` | A prévia das quatro telas | `npm run capture:preview` | `tests/e2e/previa.capture.ts` |
| `fase-5/` | A navegação temporal: linha do tempo, lista, painel e a consulta no endereço | `npm run capture:timeline` | `tests/e2e/linha-do-tempo.capture.ts` |
| `fase-6/` | O mapa sincronizado: marcadores, lista de um lugar, seleção, legenda e falhas | `npm run capture:map` | `tests/e2e/mapa.capture.ts` |
| `fase-7/` | A comparação, o perfil, a página do acontecimento com o retorno, a cópia do link e a metodologia | `npm run capture:pages` | `tests/e2e/paginas.capture.ts` |
| `fase-8/` | O acabamento: abertura, exploração, comparação e leitura, na saída estática. Em `fase-8/antes/`, as mesmas telas antes da fase | `npm run build` e `npm run capture:finish` | `tests/export/acabamento.capture.ts` |
| `jogo-etapa-1/` | O jogo na etapa 1, na saída estática: entrada do atlas com o acesso, escolha de personagem, os dois capítulos de cada personagem, registro, tarefa de ordem, painel, guia, fim da etapa, celular, rodapé e a volta da ficha. Guardadas como história; o roteiro passou a gravar em `jogo-lancamento/` | (roteiro da etapa 1) | |
| `jogo-lancamento/` | O jogo na versão de lançamento, na saída estática: os onze capítulos, as quatro tarefas, a ficha judicial, as figuras por época, o painel, o fim da trajetória, celular em pé e deitado, guia, saída fechada, rodapé e a volta da ficha | `npm run build` e `npm run capture:game` | `tests/export/jogo.capture.ts` |
| `fase-9/` | As oito telas da conferência final, nas quatro larguras, com a edição 0.1.1; o relatório da passagem de acessibilidade; e a linha do tempo antes e depois da correção da hachura | `npm run build` e `npm run audit:a11y -- --saida docs/capturas/fase-9` | `scripts/audit-a11y.mjs` |

Os comandos não conferem nada: os testes ficam em `tests/e2e/previa.spec.ts`, `tests/e2e/linha-do-tempo.spec.ts`, `tests/e2e/mapa.spec.ts`, `tests/e2e/comparacao.spec.ts`, `tests/e2e/paginas.spec.ts`, `tests/e2e/acabamento.spec.ts` e, sobre a saída estática, `tests/export/carregamento.spec.ts`. Cada comando refaz todos os arquivos da sua pasta. Para rodar um roteiro sem mexer nas imagens guardadas, aponte `CAPTURE_DIR` para outra pasta.

As imagens de `fase-4/` e de `fase-5/` são as de cada fase e não foram refeitas depois. A exploração mudou desde a fase 4: a lista ganhou o cabeçalho com o período, o bloco de cargos e partidos e as linhas de lacuna, e a barra ganhou a troca de pessoa. O mapa mudou na fase 6: nas imagens anteriores, cada ponto é um círculo, sem nome, sem controles e sem legenda. Para o mapa atual, valem as de `fase-6/`; para o resto da exploração, as de `fase-5/`. A comparação, o perfil e a página do acontecimento mudaram na fase 7, e a fase 8 mexeu na hierarquia e nos retratos de todas as telas, e a fase 9 corrigiu o eixo da linha do tempo e o nome de três cargos: para o estado atual, valem as de `fase-9/`, e as de `fase-8/` para os estados que a fase 9 não refez (filtros abertos, recorte vazio, mapa indisponível); as de `fase-7/` continuam valendo para o que elas detalham e a fase 8 não refez (fontes de um cargo, cópia do link, modelo de correção).

## Larguras

| Sufixo do arquivo | Tela |
| --- | --- |
| `--computador` | 1440×900 |
| `--computador-baixo` | 1280×720 |
| `--tablet` | 768×1024 |
| `--celular` | 390×844 |
| `--celular-estreito` | 360×800 |

## Jogo, versão de lançamento

Tiradas da saída estática, pelo roteiro `tests/export/jogo.capture.ts`, com o conteúdo da edição 0.1.1, em `jogo-lancamento/`. O celular é emulado (390×844 em pé e 844×390 deitado, com toque). Os capítulos avançados são abertos com um progresso salvo (os anteriores concluídos).

| Arquivo | O que mostra |
| --- | --- |
| `01-entrada-do-atlas--computador` e `--celular` | A entrada do atlas, com o acesso **Jogar com** e o número de capítulos abaixo de cada cartão |
| `02-escolha-de-personagem--computador` e `--celular` | A entrada do jogo: os dois personagens, a prévia do mundo e os capítulos |
| `<personagem>-03` a `-08` | O primeiro capítulo: a cena, o registro ao alcance, o registro recolhido, a saída aberta, a transição e a cena do capítulo 2 |
| `<personagem>-09` a `-11` | A tarefa de ordem: a pergunta, a ordem errada com a explicação e a ordem certa |
| `<personagem>-12-painel-de-capitulos` | O painel, com todos os capítulos, o tipo de tarefa de cada um e **Ler de novo** |
| `<personagem>-13-transicao-com-contexto` | A transição para o capítulo 3: título, período, cenário, época da figura e contexto |
| `<personagem>-14-capitulo-<n>` | A cena de cada capítulo a partir do 3, com a figura da época |
| `<personagem>-15` a `-17` | A tarefa de documento: a pergunta com as opções, a opção errada com a explicação e a certa |
| `<personagem>-18-tarefa-de-lugar` | A tarefa de lugar, com as opções |
| `<personagem>-19` e `-20-ficha-judicial...` | O registro de um episódio de processo: a natureza, o contexto, as decisões relacionadas com a própria data e o aviso |
| `<personagem>-21` e `-22` | A transição para o fim e a tela de fim da trajetória |
| `<personagem>-23` a `-28-celular-...` | A cena, o registro, o painel, um capítulo avançado e a tarefa de documento em celular, com os controles de toque |
| `29-celular-deitado` e `30-celular-deitado-capitulo-4` | A cena em celular deitado, em dois cenários |
| `31-guia-como-jogar` | A janela do guia: o Arquivista como personagem fictício, o objetivo, como se joga, o aviso do cenário e da figura |
| `32` e `33` | O painel com o aviso de ordem não documentada e o registro de data parcial |
| `34` a `36` | A tarefa cumprida com a saída fechada, a janela da saída fechada e o personagem diante da porta aberta |
| `37-rodape-da-pagina-do-jogo` | A página do jogo rolada até o fim, de propósito |
| `38-pagina-do-acontecimento-com-volta-ao-jogo` | A página do acontecimento aberta pelo jogo, com **Voltar ao jogo** |

`<personagem>` é `flavio-bolsonaro` ou `lula`: as mesmas capturas para os dois, fora as que dependem do tipo de tarefa de cada trajetória (Lula tem a tarefa de lugar no capítulo 5 e Flávio Bolsonaro, no 4; os dois têm a de documento). São 71 arquivos, tirados em 10 de outubro de 2026 e olhados um a um.

O roteiro confere uma coisa só: que a página não esteja rolada em nenhuma captura, fora a 37 (a mesma regra da etapa 1, abaixo).

## Jogo, etapa 1

Tiradas da saída estática em 10 de outubro de 2026, com o conteúdo da edição 0.1.1, pelo roteiro de então. O celular é emulado (390×844 em pé e 844×390 deitado, com toque). Ficam como registro da primeira entrega; para o estado atual valem as de `jogo-lancamento/`.

| Arquivo | O que mostra |
| --- | --- |
| `01-entrada-do-atlas--computador` e `--celular` | A entrada do atlas, com o acesso **Jogar com** abaixo de cada cartão |
| `02-escolha-de-personagem--computador` e `--celular` | A entrada do jogo: os dois personagens, a prévia do mundo e os capítulos |
| `<personagem>-03-capitulo-1` | A cena do primeiro capítulo, ao abrir |
| `<personagem>-04-registro-ao-alcance` | O personagem ao lado do registro pedido, com a pasta em destaque, o anel e a dica |
| `<personagem>-05-registro-recolhido` | O registro pedido: o aviso da tarefa concluída, quantos registros já vieram e quantos faltam para a saída abrir, e depois a data, o título, o resumo, as fontes, a situação da revisão e o caminho da ficha |
| `<personagem>-06-saida-aberta` | Todos os registros recolhidos e a tarefa concluída: a contagem cheia e a porta aberta |
| `<personagem>-07-transicao` | A tela entre os capítulos |
| `<personagem>-08-capitulo-2` | A cena do segundo capítulo: outro lugar, outros objetos |
| `<personagem>-09-tarefa-de-ordem` | Os dois registros lado a lado, com as datas |
| `<personagem>-10-ordem-errada-com-explicacao` | A explicação e o botão de tentar de novo |
| `<personagem>-11-ordem-certa` | A ordem confirmada, com o aviso de que ainda falta um registro para a saída abrir |
| `<personagem>-12-painel-de-capitulos` | O painel **Capítulos e tarefas**, com a saída aberta e **Ler de novo** em cada registro recolhido |
| `<personagem>-13-fim-da-etapa` | A tela de fim desta etapa, com os caminhos para o atlas |
| `<personagem>-14` a `-17-celular-...` | A cena, o registro e o painel em celular, com os controles de toque |
| `18-pagina-do-acontecimento-com-volta-ao-jogo` | A página do acontecimento aberta pelo jogo, com **Voltar ao jogo** |
| `19-celular-deitado` | A cena em celular deitado: o palco inteiro na janela, com o direcional e o botão de ação |
| `20-painel-com-o-aviso-de-ordem` | O painel do capítulo 1 de Lula, com o motivo do agrupamento e o aviso de ordem não documentada |
| `21-registro-com-a-ordem-nao-documentada` | O registro de data parcial, com os dois avisos e a situação da revisão |
| `22-diante-da-porta-aberta` | O personagem diante da saída aberta: a folha girada, a placa acesa e as setas no degrau |
| `23-guia-como-jogar` | A janela do guia: o Arquivista identificado como personagem fictício, o objetivo, como se joga e o aviso de que o cenário é representação |
| `24-rodape-da-pagina-do-jogo` | A página do jogo rolada até o fim, de propósito: o que fica abaixo do palco (o aviso do cenário, a situação da revisão e o caminho para escolher outro personagem) |
| `25-tarefa-cumprida-e-saida-fechada` | A tarefa cumprida e registros por recolher: o objetivo diz quantos faltam, a contagem aparece sobre a cena e a porta continua trancada |
| `26-saida-fechada-o-que-falta` | A janela da saída fechada: a regra, os registros recolhidos e os que faltam, e a situação da tarefa |

`<personagem>` é `flavio-bolsonaro` ou `lula`: as mesmas capturas para os dois. São 43 arquivos.

O roteiro do jogo confere uma coisa só: que a página não esteja rolada em nenhuma captura, fora a 24. As janelas do jogo ignoram toque e clique por 350 ms ao abrir; quando o robô clica nesse instante, ele repete o clique rolando a página de outros jeitos, e a captura seguinte sairia com a página fora do lugar. Com o mouse de verdade e pelo teclado a página não rola (medido em 10 de outubro de 2026). Por isso o roteiro espera a janela aceitar o clique.

## Fase 9

Tiradas da saída estática em 9 de outubro de 2026, depois das correções da fase, pelo mesmo comando que faz a passagem de acessibilidade. São o estado atual das telas: edição 0.1.1, anos do eixo legíveis com um período escolhido e os cargos com o nome completo.

| Arquivo | O que mostra | Larguras |
| --- | --- | --- |
| `01-entrada` | Entrada | As quatro |
| `02-exploracao-lula` e `03-exploracao-flavio-bolsonaro` | Exploração de cada pessoa, sem seleção | As quatro |
| `04-leitura-com-periodo` | Exploração com o período de 2016 a 2019 e um acontecimento aberto | As quatro |
| `05-comparacao-com-periodo` | Comparação de 2003 a 2022 | As quatro |
| `06-acontecimento` | Página de um acontecimento | As quatro |
| `07-metodologia` | Metodologia | As quatro |
| `08-pagina-nao-encontrada` | Página 404 | As quatro |
| `eixo-do-periodo-antes` e `eixo-do-periodo-depois` | A linha do tempo com um período escolhido, antes e depois de a hachura parar acima dos anos (QA.md, falha 3) | Computador |
| `acessibilidade.json` | O relatório da passagem: contraste, rolagem lateral, alvos e ordem de foco de cada tela | |

As capturas são da primeira tela de cada página, e não da página inteira. O celular é emulado.

## Fase 8

Tiradas da saída estática (`npm run build` e `npm run capture:finish`), e não do servidor de desenvolvimento: é o que a pessoa recebe. As de `fase-8/antes/` são as mesmas telas no build da fase 7, tiradas pelo mesmo roteiro antes de qualquer mudança.

| Arquivo | O que mostra | Endereço | Larguras |
| --- | --- | --- | --- |
| `01-entrada` | A abertura: nome, frase, os dois cartões com o mesmo enquadramento e, em tela estreita, os cartões antes dos números da edição | `/` | As quatro |
| `01-entrada-pagina-inteira` | A entrada até o rodapé | `/` | Computador e celular |
| `02-exploracao` | Exploração sem seleção: lista, mapa, linha do tempo e perfil | `/politicos/lula/` | As quatro |
| `02-exploracao-flavio-bolsonaro` | O outro perfil, na mesma composição | `/politicos/flavio-bolsonaro/` | Computador |
| `03-acontecimento-aberto` | Acontecimento aberto pelo endereço: a lista rolada até o item, os marcadores e a marca com o anel, e o painel com o título acima da data em tamanho | `?de=2016&ate=2023&acontecimento=lula-2023-intervencao-federal-no-distrito-federal` | Computador, tablet e celular |
| `04-mapa` | Vista do mapa em tela estreita | Aba **Mapa** | Os dois celulares |
| `04-mapa-selecao` | Vista do mapa com um acontecimento marcado: a linha do tempo rolada até a marca | `?acontecimento=…`, aba **Mapa** | Celular |
| `05-perfil` | Vista do perfil | Aba **Perfil** | Celular |
| `06-filtros` | Filtros abertos em celular | `?de=2016&ate=2022`, botão **Filtros** | Celular |
| `07-recorte-sem-registros` | Recorte vazio, com a explicação e a saída | `?de=1996&ate=2001` | Computador e celular |
| `08-mapa-indisponivel` | Navegador sem WebGL: a lista de lugares no lugar do mapa | `?de=2016&ate=2023`, sem WebGL | Computador e celular |
| `09-comparacao` | Comparação com período: as faixas logo abaixo do recorte | `/comparar/?de=2003&ate=2022` | As quatro |
| `09-comparacao-colunas` | As colunas de cada pessoa, depois das notas de leitura | O mesmo endereço, rolado | Computador e celular |
| `10-pagina-do-acontecimento` | Página de um acontecimento: retorno, data, título e texto | `/acontecimentos/lula-2023-intervencao-federal-no-distrito-federal/` | As quatro |
| `10-pagina-do-acontecimento-fontes` | A mesma página, na altura das fontes | O mesmo endereço, rolado | Computador e celular |
| `11-metodologia` | O começo da metodologia | `/metodologia/` | Computador e celular |
| `12-pagina-nao-encontrada` | Página 404 | `/endereco-que-nao-existe/` | Computador e celular |

## Fase 7

| Arquivo | O que mostra | Endereço | Larguras |
| --- | --- | --- | --- |
| `01-comparacao` | Abertura, recorte, os quatro avisos de leitura e as duas faixas no mesmo eixo | `/comparar/` | Computador, tablet e celular |
| `02-periodo-e-categorias` | Um intervalo e uma categoria valendo para as duas trajetórias; em celular, o recorte escrito na barra presa ao topo | `/comparar/?de=2016&ate=2022&categorias=eleicoes` | Computador e celular |
| `03-colunas-no-mesmo-recorte` | As colunas das duas pessoas: cobertura, cargos, partidos, acontecimentos e fontes, com as seções na mesma altura em computador | `/comparar/?de=2003&ate=2010` | Computador e celular |
| `04-recorte-sem-registros` | Um período em que uma trajetória está fora da cobertura e a outra tem lacuna, sem dizer que faltou atividade | `/comparar/?de=1996&ate=2001` | Computador |
| `05-fontes-de-um-cargo` | As fontes de um cargo abertas, nas duas colunas | `/comparar/?de=2019&ate=2022` | Computador |
| `06-filtros` | Os controles do recorte abertos pelo botão **Filtros** | `/comparar/?de=2016&ate=2022&categorias=eleicoes` | Celular |
| `07-perfil` | O perfil dentro da exploração: cargos com as fontes de um deles abertas, em computador; a vista **Perfil**, em celular | `/politicos/flavio-bolsonaro/` e `/politicos/lula/` | Computador e celular |
| `08-acontecimento-com-retorno` | A página de um acontecimento vinda de uma consulta: o retorno diz o recorte de antes | `/acontecimentos/lula-2018-prisao-em-curitiba/?de=2016&ate=2019&categorias=marcos-historicos` | Computador e celular |
| `09-fontes-revisao-e-edicao` | A mesma página, na altura das fontes: citações, revisão, edição e caminhos | `/acontecimentos/lula-2018-prisao-em-curitiba/` | Computador |
| `10-retorno-a-comparacao` | Acontecimento das duas pessoas, vindo da comparação: **Voltar à comparação** e um retorno por pessoa | `/acontecimentos/eleicao-2026-primeiro-turno/?de=2019&categorias=eleicoes&origem=comparar` | Celular |
| `11-link-copiado` | A confirmação depois de copiar o link | Botão **Copiar link** | Computador |
| `12-link-em-campo` | A cópia indisponível: o endereço em um campo, selecionado | O mesmo botão, sem a área de transferência | Celular |
| `13-metodologia` | O começo da metodologia, com o índice | `/metodologia/` | Computador e celular |
| `14-fontes-e-revisao` | As seções de fontes e de revisão, com o que foi feito nesta edição | `/metodologia/#fontes` | Computador |
| `15-modelo-de-correcao` | O aviso de canal pendente e o modelo, já com o link e o título do registro | `/metodologia/?acontecimento=lula-2018-prisao-em-curitiba#correcao` | Computador |
| `16-fontes-desta-edicao` | O catálogo de fontes, agrupado por quem publicou | `/metodologia/#catalogo` | Computador |

As capturas desta fase são da área visível, e não da página inteira: com o mapa na tela, a captura de página inteira sai com a base deslocada no navegador dos testes.

## Fase 6

| Arquivo | O que mostra | Endereço | Larguras |
| --- | --- | --- | --- |
| `01-recorte-no-mapa` | Um marcador por lugar, com o nome ao lado; controles, botão dos acontecimentos sem ponto e resumo da legenda | `/politicos/lula/` | Computador, tablet e celular |
| `02-seletor-de-lugar` | A lista de um marcador com vários acontecimentos: quadro no canto em computador, folha embaixo em celular | Clique em Brasília (computador) e no marcador do estado do Rio de Janeiro, em `/politicos/flavio-bolsonaro/` (celular) | Computador e celular |
| `03-selecao-com-dois-lugares` | Um acontecimento com dois lugares, aberto pelo endereço: os dois marcadores com o anel | `?acontecimento=lula-2023-intervencao-federal-no-distrito-federal` | Computador |
| `04-selecao-pelo-mapa` | Seleção feita no mapa: painel aberto em computador; cartão com **Ler** e **Fechar** em celular | Clique em um marcador de um acontecimento (computador); escolha na folha (celular) | Computador e celular |
| `05-sem-ponto-no-mapa` | A lista dos acontecimentos sem ponto, agrupados pelo motivo | Botão **sem ponto no mapa** | Computador e celular |
| `06-aberto-sem-ponto` | Acontecimento de abrangência nacional aberto: nenhum marcador destacado e o aviso no mapa | `?acontecimento=lula-2002-eleito-presidente` | Computador |
| `07-lugares-vizinhos-no-zoom-maximo` | Dois municípios vizinhos que continuam em um marcador no zoom máximo, com a lista separada por lugar | `?acontecimento=lula-1975-eleito-presidente-do-sindicato`, aproximado até o limite | Computador |
| `08-legenda` | A legenda aberta, com os símbolos em uso e o aviso sobre a base | `?acontecimento=lula-2023-intervencao-federal-no-distrito-federal` | Computador e celular |
| `09-recorte-sem-pontos` | Recorte em que nenhum acontecimento tem ponto: o território e o aviso | `/politicos/flavio-bolsonaro/?de=2021&ate=2021` | Computador |
| `10-contornos-nao-carregaram` | Falha da base: mensagem, **Tentar de novo** e a lista de lugares | `?de=2016&ate=2019`, com os contornos bloqueados | Computador |
| `11-desenho-interrompido` | Contexto gráfico perdido: o aviso sobre o mapa, antes de a lista assumir | Perda de contexto simulada | Computador |
| `12-mapa-indisponivel` | Pacote do mapa bloqueado, na vista do mapa em celular | `/politicos/lula/`, com o pacote bloqueado | Celular |
| `13-janela-baixa` | Janela de 720 px de altura: marcadores, controles e legenda cabem na parte do mapa | `/politicos/flavio-bolsonaro/` | Computador baixo |
| `14-pagina-do-acontecimento` | O mapa de localização da página, com os dois lugares | `/acontecimentos/lula-2023-intervencao-federal-no-distrito-federal/` | Computador e celular |

## Fase 5

Quase todos os estados são abertos pelo próprio endereço, que é como a consulta se restaura.

| Arquivo | O que mostra | Endereço | Larguras |
| --- | --- | --- | --- |
| `01-linha-do-tempo` | Todo o período: lista com datas parciais e lacunas, marcas em fileiras, faixas de cargos e partidos e a troca de pessoa | `/politicos/lula/` | Computador, tablet e celular |
| `02-um-ano` | Um ano consultado, com a hachura no resto do eixo | `?de=2018&ate=2018` | Computador e celular |
| `03-arraste-em-andamento` | O arraste sobre o eixo antes de soltar: rótulo com o intervalo e a lista ainda inteira | Arraste de 2003 a 2010 | Computador |
| `04-intervalo-e-categorias` | Intervalo e duas categorias combinados | `?de=2016&ate=2022&categorias=eleicoes,marcos-historicos` | Computador e celular |
| `05-cargos-e-partidos-do-periodo` | O bloco aberto, com mudança de partido no ano e a presença incerta à parte | `/politicos/flavio-bolsonaro/?de=2021&ate=2021` | Computador e celular |
| `06-painel-do-acontecimento` | Acontecimento aberto pelo endereço: marcado na lista, no mapa e na linha do tempo, e lido no painel | `?de=2016&ate=2019&acontecimento=lula-2018-prisao-em-curitiba` | Computador, tablet e celular |
| `07-acontecimento-fora-do-recorte` | Um filtro tirou o acontecimento do recorte: painel no perfil e o aviso sobre a lista | O endereço anterior, mais a categoria Eleições | Computador |
| `08-periodo-sem-registros` | Recorte vazio, com a explicação e a saída | `?de=1996&ate=2001` | Computador e celular |
| `09-lacunas-e-datas-parciais` | Trecho da lista com "só o ano", ordem em aberto e três lacunas | `/politicos/lula/` | Celular |
| `10-troca-de-pessoa` | Filtros abertos em tela estreita: troca de pessoa, período, categorias e limpar filtros | `?de=2019&ate=2022` | Celular |
| `11-leitura-sem-o-mapa` | Mapa indisponível: a consulta, a linha do tempo e o painel continuam | `?de=2016&ate=2019&acontecimento=lula-2018-prisao-em-curitiba` | Computador |
| `12-janela-baixa` | Janela de 720 px de altura: o mapa mantém a sua parte e a linha do tempo rola por dentro | `/politicos/flavio-bolsonaro/` | Computador baixo |

## Fase 4

| Arquivo | O que mostra | Larguras |
| --- | --- | --- |
| `01-entrada` | Entrada: nome, frase de utilidade, recorte e os dois cartões | As quatro |
| `01-entrada-pagina-inteira` | A entrada até o rodapé, com a faixa das duas trajetórias | Computador e celular |
| `02-exploracao` | Exploração de Lula sem seleção | As quatro |
| `03-exploracao-acontecimento-aberto` | O mesmo acontecimento marcado na lista, no mapa e na linha do tempo, e aberto na leitura | As quatro |
| `04-exploracao-mapa` | Vista do mapa em tela estreita | Os dois celulares |
| `04-exploracao-mapa-selecao` | Vista do mapa com o cartão do acontecimento selecionado | Os dois celulares |
| `05-exploracao-perfil` | Vista do perfil em tela estreita | Os dois celulares |
| `06-acontecimento` | Página do acontecimento: retorno, data, título e texto | As quatro |
| `07-acontecimento-fontes` | A mesma página, na altura das fontes | As quatro |
| `08-comparacao` | Comparação: período e faixas na mesma escala | As quatro |
| `08-comparacao-pagina-inteira` | A comparação até o rodapé, com as colunas de cada pessoa | Computador e celular |
| `09-estado-categoria-marcada` | Filtro de categoria ativo | Computador |
| `09-estado-periodo-sem-registros` | Período sem registros, com a explicação e a saída | Computador |
| `10-estado-mapa-indisponivel` | Lista de lugares no lugar do mapa | Computador e celular |
| `11-guia-de-estados` | O guia `/dev/previa/` inteiro: tokens, componentes e estados | Computador |
| `12-pagina-nao-encontrada` | Página 404 | Celular |

Em computador e em tablet, `06` e `07` saem iguais quando as fontes já cabem na primeira tela.

As capturas escondem o indicador do servidor de desenvolvimento do Next, que não faz parte da tela, e rodam com movimento reduzido, como os testes.
