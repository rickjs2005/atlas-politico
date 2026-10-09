# Capturas

Capturas reais do atlas, tiradas do servidor de desenvolvimento com os dados gerados da edição 0.1.0, em um Chromium controlado pelo Playwright.

| Pasta | O que registra | Comando | Roteiro |
| --- | --- | --- | --- |
| `fase-4/` | A prévia das quatro telas | `npm run capture:preview` | `tests/e2e/previa.capture.ts` |
| `fase-5/` | A navegação temporal: linha do tempo, lista, painel e a consulta no endereço | `npm run capture:timeline` | `tests/e2e/linha-do-tempo.capture.ts` |

Os comandos não conferem nada: os testes ficam em `tests/e2e/previa.spec.ts` e `tests/e2e/linha-do-tempo.spec.ts`. Cada comando refaz todos os arquivos da sua pasta. Para rodar um roteiro sem mexer nas imagens guardadas, aponte `CAPTURE_DIR` para outra pasta.

As imagens de `fase-4/` são as da fase 4 e não foram refeitas na fase 5. A exploração mudou desde então: a lista ganhou o cabeçalho com o período, o bloco de cargos e partidos e as linhas de lacuna, e a barra ganhou a troca de pessoa. Para o estado atual da exploração, valem as de `fase-5/`.

## Larguras

| Sufixo do arquivo | Tela |
| --- | --- |
| `--computador` | 1440×900 |
| `--computador-baixo` | 1280×720 |
| `--tablet` | 768×1024 |
| `--celular` | 390×844 |
| `--celular-estreito` | 360×800 |

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
