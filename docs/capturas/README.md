# Capturas

Capturas reais do atlas, tiradas do servidor de desenvolvimento com os dados gerados da edição 0.1.0, em um Chromium controlado pelo Playwright.

| Pasta | O que registra | Comando | Roteiro |
| --- | --- | --- | --- |
| `fase-4/` | A prévia das quatro telas | `npm run capture:preview` | `tests/e2e/previa.capture.ts` |
| `fase-5/` | A navegação temporal: linha do tempo, lista, painel e a consulta no endereço | `npm run capture:timeline` | `tests/e2e/linha-do-tempo.capture.ts` |
| `fase-6/` | O mapa sincronizado: marcadores, lista de um lugar, seleção, legenda e falhas | `npm run capture:map` | `tests/e2e/mapa.capture.ts` |
| `fase-7/` | A comparação, o perfil, a página do acontecimento com o retorno, a cópia do link e a metodologia | `npm run capture:pages` | `tests/e2e/paginas.capture.ts` |

Os comandos não conferem nada: os testes ficam em `tests/e2e/previa.spec.ts`, `tests/e2e/linha-do-tempo.spec.ts`, `tests/e2e/mapa.spec.ts`, `tests/e2e/comparacao.spec.ts` e `tests/e2e/paginas.spec.ts`. Cada comando refaz todos os arquivos da sua pasta. Para rodar um roteiro sem mexer nas imagens guardadas, aponte `CAPTURE_DIR` para outra pasta.

As imagens de `fase-4/` e de `fase-5/` são as de cada fase e não foram refeitas depois. A exploração mudou desde a fase 4: a lista ganhou o cabeçalho com o período, o bloco de cargos e partidos e as linhas de lacuna, e a barra ganhou a troca de pessoa. O mapa mudou na fase 6: nas imagens anteriores, cada ponto é um círculo, sem nome, sem controles e sem legenda. Para o mapa atual, valem as de `fase-6/`; para o resto da exploração, as de `fase-5/`. A comparação, o perfil e a página do acontecimento mudaram na fase 7: para essas três, valem as de `fase-7/`.

## Larguras

| Sufixo do arquivo | Tela |
| --- | --- |
| `--computador` | 1440×900 |
| `--computador-baixo` | 1280×720 |
| `--tablet` | 768×1024 |
| `--celular` | 390×844 |
| `--celular-estreito` | 360×800 |

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
