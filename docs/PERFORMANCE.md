# Desempenho

Fase 8. O que foi medido e em que condições, o que mudou entre o build da fase 7 e o desta fase, e o que ficou pendente. Os motivos de cada escolha estão em [DECISIONS.md](DECISIONS.md), de D-74 a D-86.

Tudo aqui é **resultado de laboratório**: um navegador controlado por script, em uma máquina só, com rede e processador limitados por emulação. Não há dados de campo, porque o atlas não foi publicado. Também não havia aparelho móvel real disponível nesta fase: o perfil de celular é uma emulação.

Nas tabelas e no texto, 1 KB são 1.024 bytes.

## Resumo

| Meta do plano | Resultado medido, depois | Situação |
| --- | --- | --- |
| LCP até 2,5 segundos | De 320 a 556 ms no perfil de computador e de 1.144 a 1.612 ms no de celular | Dentro da meta nas cinco telas e nos dois perfis. Antes, a entrada em celular tinha 4.224 ms |
| CLS até 0,1 | No máximo 0,022, na página do acontecimento em celular | Dentro da meta. Não mudou |
| INP | Não medido: é uma métrica de visitas reais | Sem meta nesta fase. No lugar dele, a duração de interações feitas por script: até 120 ms em computador e até 224 ms no perfil de celular |

O que melhorou:

- **Entrada em celular:** LCP de 4.224 para 1.152 ms. O maior elemento da tela é um retrato, e as imagens da entrada foram de 505 para 47 KB.
- **Entrada em computador:** LCP de 776 para 332 ms.
- **Peso transferido** menor em todas as telas. No perfil de celular: entrada de 859 para 436 KB, exploração de 674 para 366 KB, comparação de 612 para 381 KB e página do acontecimento de 848 para 327 KB.
- **Carregamento completo** em celular: de 3,3 a 4,6 segundos para perto de 2,1 segundos, nas quatro telas que tinham retrato ou mapa.
- **Página do acontecimento em celular:** o mapa deixou de ser carregado ao abrir, e o bloqueio caiu de 1.135 para 546 ms.
- **Mapa pronto em computador:** de 1.582 para 1.356 ms na exploração e de 1.538 para 1.247 ms na página do acontecimento.
- **Nenhum pedido com 404,** e a saída estática foi de 14,5 para 10,3 MB.

O que não mudou:

- A resposta dos controles.
- O tempo para abrir a vista do mapa em celular: perto de 4 segundos.
- O bloqueio durante o carregamento no perfil de celular, fora a página do acontecimento: de 0,6 a 0,9 segundo.
- O primeiro desenho (FCP) em computador.

O que piorou:

- **Primeiro desenho da página do acontecimento em celular:** de 1.032 para 1.144 ms. Continua dentro da meta. A causa foi isolada só em parte (Leitura dos resultados).

## Como medir

```bash
npm run build
npm run measure -- --rotulo depois --webgl placa --execucoes 7
npm run measure:report -- antes depois
```

`npm run measure` sobe o servidor de pré-visualização em uma porta própria, abre cada rota em um Chromium sem interface, com o cache vazio, e grava `docs/desempenho/<rotulo>.json`, com a mediana e os tempos de cada execução. `npm run measure:report` lê dois desses arquivos e escreve as tabelas deste documento.

Para comparar dois builds, os dois são medidos na mesma rodada, com `--contra <nome>=<pasta>`. As tabelas daqui saíram de:

```bash
npm run measure -- --rotulo depois --contra antes=<pasta com o build da fase 7> --webgl placa --execucoes 7
```

O build "antes" é a saída de `npm run build` no commit `ce22a56`, o da fase 7, copiada para fora do repositório antes de qualquer mudança desta fase. Para repetir a comparação é preciso gerar esse build de novo, a partir daquele commit, em outra pasta.

### Condições

| Item | Valor |
| --- | --- |
| Tipo | Laboratório |
| Data | 9 de outubro de 2026 |
| Ferramenta | `scripts/measure.mjs`: o Playwright 1.63 controla o Chromium, aplica os limites de rede e de processador pelo protocolo do navegador e lê as entradas de desempenho de dentro da página (`PerformanceObserver`) |
| Navegador | Chromium 153.0.8010.12, sem interface |
| WebGL | Placa de vídeo da máquina (Intel UHD Graphics, pelo ANGLE com Direct3D 11), com `--webgl placa`. O padrão do script é o desenho por software, como nos testes |
| Servidor | `scripts/preview.mjs`, na própria máquina: gzip nos arquivos de texto, `ETag` e cache longo para `/_next/static/` |
| Cache | Vazio a cada execução: um contexto novo do navegador |
| Execuções | 7 por tela e por perfil, alternadas entre os dois builds, com a ordem trocada a cada vez. O resultado é a mediana |
| Máquina | Intel Core i5-10210U (8 núcleos lógicos), 8 GB de memória, Windows 11, Node 24.15.0 |

| Perfil | Tela | Rede | Processador |
| --- | --- | --- | --- |
| Computador | 1440×900, densidade 1 | 10 Mbit/s nos dois sentidos, 40 ms de latência | Sem limite |
| Celular | 390×844, densidade 2, toque | 1,6 Mbit/s de descida, 750 kbit/s de subida, 150 ms de latência | 4 vezes mais lento |

O perfil de computador tem um limite de rede de propósito. Com o servidor na própria máquina e sem latência, os arquivos chegam todos de uma vez, e a ordem entre desenhar e executar deixa de parecer com a de uma visita. O perfil de celular usa os números que as ferramentas de auditoria chamam de 4G lenta.

| Tela | Endereço medido |
| --- | --- |
| Entrada | `/` |
| Exploração | `/politicos/lula/` |
| Comparação | `/comparar/` |
| Acontecimento | `/acontecimentos/lula-2023-intervencao-federal-no-distrito-federal/` |
| Metodologia | `/metodologia/` |

Em cada execução, a página é aberta e observada até o evento `load`, depois até a rede ficar parada por 1,5 segundo, depois até o mapa ficar pronto, quando a tela o pede, e por mais 2 segundos. As interações vêm em seguida e não entram nos números de carregamento.

### O que cada número é

| Nome nas tabelas | Como é obtido | O que ele não é |
| --- | --- | --- |
| LCP | A última entrada `largest-contentful-paint` registrada pelo navegador antes de qualquer interação | Não é o LCP de visitas reais, que é um percentil de muitas visitas |
| FCP | A entrada `paint` de nome `first-contentful-paint` | |
| CLS | As entradas `layout-shift` sem ação recente da pessoa, somadas pela maior janela de sessão, como na definição da métrica | Cobre só o carregamento e os segundos seguintes, e não a visita inteira |
| Carregamento completo | `loadEventEnd` da navegação | Não é uma métrica de experiência: é quando o navegador terminou os recursos que a página pediu ao abrir |
| Fontes prontas | O fim da resposta do último arquivo de fonte | |
| Bloqueio em quadros longos | A soma do `blockingDuration` das entradas `long-animation-frame`, em toda a janela observada | Não é o TBT das ferramentas de auditoria, que soma tarefas longas entre o FCP e o momento em que a página fica interativa |
| Transferido | Os bytes de cabeçalho e de corpo de cada resposta, como passaram pela rede, com a compressão. Inclui o que chega depois do `load`, até o fim da janela | |
| Pedidos | Quantos pedidos a página fez na mesma janela | |
| Mapa pronto | Do começo da navegação até o canvas do mapa existir e o aviso "Carregando o mapa…" sair | Medida própria, sem equivalente padronizado. "Não carrega" quer dizer que a tela não pediu o mapa ao abrir |
| Duração do evento | A `duration` da entrada de Event Timing da interação: da ação da pessoa até a pintura seguinte. O navegador arredonda para 8 ms e não registra o que fica abaixo de 16 ms | Não é o INP, que resume todas as interações de visitas reais. Aqui é uma interação de cada tipo, feita por script |
| Até a tela mudar | Da ação da pessoa até o conteúdo de uma parte da tela ser outro, conferido de dentro da página a cada quadro | Não inclui a pintura, e só enxerga de quadro em quadro |

O bloqueio é somado pelos quadros longos, e não pelas tarefas longas (`longtask`), que também ficam gravadas no arquivo. O trabalho de desenhar um quadro nem sempre aparece como tarefa longa, e a soma por tarefas mudava muito entre rodadas do mesmo build.

### Por que os dois builds são medidos juntos

Medidos em momentos diferentes, os mesmos arquivos chegaram a dar resultados até 50% diferentes no perfil de celular: com o processador limitado em 4 vezes, o estado da máquina na hora pesa mais do que as mudanças. Por isso os dois builds são medidos na mesma rodada, com as execuções alternadas e a ordem trocada a cada vez. O que muda na máquina durante a medição pesa igual nos dois lados.

Mesmo assim, uma rodada não é igual à outra. O build da fase 7 foi medido em três rodadas completas, nas mesmas condições, e a mediana dele variou até 24 ms no perfil de computador e até 108 ms no de celular, tanto no FCP quanto no LCP. Dentro de uma rodada a comparação é mais firme do que isso, mas uma diferença de poucas dezenas de milissegundos entre antes e depois não deve ser lida como mudança. Os arquivos guardam os tempos de cada execução, para quem quiser ver a dispersão.

## Resultados

Antes: build da fase 7. Depois: build desta fase. Arquivos: [`desempenho/antes.json`](desempenho/antes.json) e [`desempenho/depois.json`](desempenho/depois.json).

### Computador

1440×900, rede a 10 Mbit/s com 40 ms de latência, CPU sem limite. Antes → depois, mediana de 7 execuções.

| Tela | LCP | FCP | Carregamento completo | Fontes prontas | CLS | Bloqueio em quadros longos | Transferido | Pedidos | Mapa pronto |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Entrada | 776 ms → 332 ms | 324 ms → 332 ms | 836 ms → 478 ms | 692 ms → 467 ms | 0,000 → 0,000 | 46 ms → 45 ms | 863 KB → 417 KB | 23 → 20 | não carrega |
| Exploração | 660 ms → 556 ms | 424 ms → 428 ms | 1.113 ms → 884 ms | 620 ms → 525 ms | 0,005 → 0,005 | 147 ms → 151 ms | 1.188 KB → 867 KB | 30 → 21 | 1.582 ms → 1.356 ms |
| Comparação | 420 ms → 420 ms | 420 ms → 420 ms | 983 ms → 547 ms | 681 ms → 541 ms | 0,005 → 0,001 | 136 ms → 135 ms | 918 KB → 380 KB | 25 → 14 | não carrega |
| Acontecimento | 308 ms → 324 ms | 308 ms → 324 ms | 1.056 ms → 769 ms | 671 ms → 473 ms | 0,000 → 0,000 | 46 ms → 56 ms | 1.150 KB → 825 KB | 30 → 19 | 1.538 ms → 1.247 ms |
| Metodologia | 316 ms → 320 ms | 316 ms → 320 ms | 421 ms → 414 ms | 415 ms → 407 ms | 0,000 → 0,000 | 27 ms → 29 ms | 371 KB → 338 KB | 22 → 11 | não carrega |

Elemento do LCP:

| Tela | Antes | Depois |
| --- | --- | --- |
| Entrada | imagem `flavio-bolsonaro.jpg` | imagem `retrato-flavio-bolsonaro-4x5-320.webp` |
| Exploração | texto (`p`): "Luiz Inácio Lula da Silva, nascido em Ga…" | texto (`p`): "Luiz Inácio Lula da Silva, nascido em Ga…" |
| Comparação | texto (`li`): "Acervo, e não desempenho. A quantidade d…" | texto (`p`): "As duas trajetórias lado a lado, no mesm…" |
| Acontecimento | texto (`h1`): "Lula decreta intervenção federal na segu…" | texto (`h1`): "Lula decreta intervenção federal na segu…" |
| Metodologia | texto (`p`): "O atlas registra a trajetória pública de…" | texto (`p`): "O atlas registra a trajetória pública de…" |

Peso por tipo de recurso, transferido (antes → depois):

| Tela | Documento | Javascript | Css | Fonte | Imagem | Dados |
| --- | --- | --- | --- | --- | --- | --- |
| Entrada | 19 KB → 20 KB | 143 KB → 166 KB | 10 KB → 10 KB | 158 KB → 158 KB | 505 KB → 27 KB | 27 KB → 34 KB |
| Exploração | 30 KB → 31 KB | 593 KB → 584 KB | 20 KB → 21 KB | 158 KB → 158 KB | 290 KB → 5 KB | 97 KB → 69 KB |
| Comparação | 52 KB → 53 KB | 166 KB → 156 KB | 10 KB → 10 KB | 158 KB → 158 KB | 505 KB → 2 KB | 27 KB → 0 KB |
| Acontecimento | 8 KB → 9 KB | 576 KB → 567 KB | 20 KB → 21 KB | 158 KB → 158 KB | 290 KB → 1 KB | 97 KB → 69 KB |
| Metodologia | 29 KB → 30 KB | 146 KB → 140 KB | 10 KB → 10 KB | 158 KB → 158 KB | 0 KB → 0 KB | 27 KB → 0 KB |

Interações, da entrada até a pintura seguinte (Event Timing) e até cada parte da tela mudar:

| Tela | Ação | Duração do evento | Até a tela mudar |
| --- | --- | --- | --- |
| Exploração | Marcar uma categoria | 96 ms → 104 ms | lista: 55 ms → 48 ms; marcadores do mapa: 55 ms → 49 ms |
| Exploração | Desmarcar a categoria | 64 ms → 88 ms | lista: 40 ms → 55 ms |
| Exploração | Abrir um acontecimento | 112 ms → 120 ms | painel de leitura: 74 ms → 81 ms |
| Exploração | Fechar a leitura | 96 ms → 88 ms | painel de leitura: 66 ms → 53 ms |
| Comparação | Marcar uma categoria | 104 ms → 112 ms | colunas: 79 ms → 79 ms |

### Celular

390×844, toque, rede a 1,6 Mbit/s com 150 ms de latência, CPU 4 vezes mais lenta. Antes → depois, mediana de 7 execuções.

| Tela | LCP | FCP | Carregamento completo | Fontes prontas | CLS | Bloqueio em quadros longos | Transferido | Pedidos | Mapa pronto |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Entrada | 4.224 ms → 1.152 ms | 1.112 ms → 1.152 ms | 4.587 ms → 2.178 ms | 3.717 ms → 2.158 ms | 0,002 → 0,002 | 545 ms → 579 ms | 859 KB → 436 KB | 21 → 20 | não carrega |
| Exploração | 1.244 ms → 1.244 ms | 1.244 ms → 1.244 ms | 3.602 ms → 2.088 ms | 2.704 ms → 2.071 ms | 0,000 → 0,000 | 661 ms → 671 ms | 674 KB → 366 KB | 17 → 14 | não carrega |
| Comparação | 1.552 ms → 1.612 ms | 1.552 ms → 1.612 ms | 3.266 ms → 2.201 ms | 2.473 ms → 2.185 ms | 0,000 → 0,000 | 895 ms → 940 ms | 612 KB → 381 KB | 16 → 13 | não carrega |
| Acontecimento | 1.032 ms → 1.144 ms | 1.032 ms → 1.144 ms | 3.987 ms → 2.007 ms | 2.188 ms → 1.986 ms | 0,021 → 0,022 | 1.135 ms → 546 ms | 848 KB → 327 KB | 23 → 13 | 5.782 ms → não carrega |
| Metodologia | 1.280 ms → 1.316 ms | 1.280 ms → 1.316 ms | 1.939 ms → 1.944 ms | 1.917 ms → 1.927 ms | 0,019 → 0,019 | 798 ms → 764 ms | 354 KB → 338 KB | 14 → 11 | não carrega |

Elemento do LCP:

| Tela | Antes | Depois |
| --- | --- | --- |
| Entrada | imagem `flavio-bolsonaro.jpg` | imagem `retrato-flavio-bolsonaro-4x5-480.webp` |
| Exploração | texto (`span`): "Lula é eleito presidente do Sindicato do…" | texto (`span`): "Lula é eleito presidente do Sindicato do…" |
| Comparação | texto (`p`): "As duas trajetórias lado a lado, no mesm…" | texto (`p`): "As duas trajetórias lado a lado, no mesm…" |
| Acontecimento | texto (`p`): "Em 8 de janeiro de 2023, Lula decretou i…" | texto (`p`): "Em 8 de janeiro de 2023, Lula decretou i…" |
| Metodologia | texto (`p`): "O que o atlas registra, como seleciona, …" | texto (`p`): "O que o atlas registra, como seleciona, …" |

Peso por tipo de recurso, transferido (antes → depois):

| Tela | Documento | Javascript | Css | Fonte | Imagem | Dados |
| --- | --- | --- | --- | --- | --- | --- |
| Entrada | 19 KB → 20 KB | 143 KB → 166 KB | 10 KB → 10 KB | 158 KB → 158 KB | 505 KB → 47 KB | 23 KB → 34 KB |
| Exploração | 30 KB → 31 KB | 175 KB → 165 KB | 10 KB → 10 KB | 158 KB → 158 KB | 290 KB → 2 KB | 11 KB → 0 KB |
| Comparação | 52 KB → 53 KB | 166 KB → 156 KB | 10 KB → 10 KB | 158 KB → 158 KB | 215 KB → 3 KB | 11 KB → 0 KB |
| Acontecimento | 8 KB → 9 KB | 576 KB → 148 KB | 20 KB → 10 KB | 158 KB → 158 KB | 0 KB → 2 KB | 85 KB → 0 KB |
| Metodologia | 29 KB → 30 KB | 146 KB → 140 KB | 10 KB → 10 KB | 158 KB → 158 KB | 0 KB → 0 KB | 11 KB → 0 KB |

Interações, da entrada até a pintura seguinte (Event Timing) e até cada parte da tela mudar:

| Tela | Ação | Duração do evento | Até a tela mudar |
| --- | --- | --- | --- |
| Exploração | Abrir a vista do mapa | 136 ms → 160 ms | mapa pronto: 4.169 ms → 4.069 ms |
| Exploração | Marcar uma categoria | 152 ms → 144 ms | lista: 128 ms → 120 ms |
| Exploração | Desmarcar a categoria | 160 ms → 152 ms | lista: 133 ms → 125 ms |
| Exploração | Abrir um acontecimento | 208 ms → 224 ms | painel de leitura: 187 ms → 197 ms |
| Exploração | Fechar a leitura | 192 ms → 184 ms | painel de leitura: 169 ms → 160 ms |
| Comparação | Marcar uma categoria | 216 ms → 208 ms | colunas: 178 ms → 168 ms |

### Leitura dos resultados

**Computador.** Duas telas mudaram de fato. Na entrada, o maior elemento é um retrato, e o LCP foi de 776 para 332 ms: passou a coincidir com o primeiro desenho. Na exploração, o maior elemento é um parágrafo do perfil, e o LCP, de 660 para 556 ms, acompanha a chegada da fonte serifada (525 ms), que agora divide a rede com menos imagem. Nas outras três telas o LCP ficou onde estava, com diferenças de 0 a 16 ms, menores do que a variação entre rodadas. O carregamento completo caiu em todas as telas que tinham retrato ou mapa, e o peso transferido, em todas.

**Celular.** A entrada é a mudança grande: o retrato de até 290 KB levava 4,2 segundos para chegar em uma rede de 1,6 Mbit/s, e a versão de 480 px, de 21 a 25 KB, chega com o primeiro desenho. Na exploração, na comparação e na metodologia o LCP é texto e coincide com o FCP: ficou igual ou até 60 ms mais tarde, dentro da dispersão das execuções.

**O primeiro desenho em celular não melhorou, e na página do acontecimento piorou.** No perfil de celular, o FCP ficou de 0 a 60 ms mais tarde em quatro telas e 112 ms mais tarde na página do acontecimento (de 1.032 para 1.144 ms). Nas quatro primeiras, a diferença cabe na dispersão, mas em nenhuma delas o depois ficou mais cedo, nas duas rodadas completas que foram feitas. Na página do acontecimento, as execuções dos dois builds não se sobrepõem: antes, de 1.008 a 1.080 ms; depois, de 1.116 a 1.220 ms. O que foi identificado:

- **O pré-carregamento da fonte da interface.** Por um defeito do build, as páginas de acontecimento eram as únicas sem ele, e passaram a ter (seção Build). Um teste à parte, com o build final com e sem esse pré-carregamento, atribui a ele 36 ms do primeiro desenho em celular e 16 ms em computador. Em troca, as fontes ficam prontas 100 ms antes nos dois perfis. Arquivos: [`acontecimento-com-pre-carregamento.json`](desempenho/acontecimento-com-pre-carregamento.json) e [`acontecimento-sem-pre-carregamento.json`](desempenho/acontecimento-sem-pre-carregamento.json).
- **O que bloqueia o primeiro desenho cresceu um pouco.** A folha de estilo foi de 9,7 para 10,2 KB comprimida, com as regras desta fase, e o HTML dessa página, de 7,7 para 8,4 KB. Em uma rede de 1,6 Mbit/s dividida com os scripts, cada KB a mais custa algumas dezenas de milissegundos. Esse efeito não foi medido em separado.

O restante da diferença não foi isolado. O número continua longe do limite da meta, e a mesma página deixou de gastar 0,6 segundo de processador e 520 KB de rede com um mapa que estava fora da tela.

**CLS.** O maior valor, 0,022, é o das páginas de texto em celular, antes e depois: o título muda de quebra de linha quando a Newsreader substitui a fonte provisória. Na comparação em computador caiu de 0,005 para 0,001.

**Bloqueio.** No perfil de celular, o carregamento de cada tela tem de 0,5 a 0,9 segundo de quadros longos. É a execução do código da página com o processador 4 vezes mais lento, e não mudou nesta fase, a não ser na página do acontecimento, que deixou de carregar o mapa.

## O que mudou

### Imagens

Na fase 7, os dois retratos eram servidos como estavam cadastrados: dois JPEG, de 215 e de 290 KB, para todas as molduras, do cartão da entrada à miniatura de 48 px. O `next/image` só repassava o arquivo, porque um site sem servidor não tem quem redimensione a imagem a cada pedido (`images.unoptimized`, D-03).

Agora as versões são preparadas antes do build (D-74, D-75):

- `npm run images` lê cada retrato de `public/media/retratos/` e grava nove arquivos WebP em `public/media/derivados/`: a moldura 4:5 em 160, 240, 320, 480 e 640 px de largura, e a quadrada em 64, 96, 128 e 192 px. Os arquivos têm de 1 a 53 KB.
- O recorte de cada moldura fica em `scripts/images.config.json`, em pixels do original. É o que põe a linha dos olhos na mesma altura e o rosto no mesmo tamanho nos dois perfis.
- O original não é alterado, continua publicado em `/media/retratos/` e continua sendo o que o conteúdo cadastra, com autoria, origem e condições de uso. Um manifesto (`src/lib/media/portraits.manifest.json`) liga cada versão ao original e ao enquadramento de que saiu.
- `npm run images:check` roda antes de `dev` e de `build`, sem carregar a biblioteca de imagens, e recusa versões desatualizadas.
- O componente `Portrait` escreve uma `<img>` com a lista das versões (`srcset` e `sizes`), a largura e a altura declaradas e o texto alternativo do cadastro. A moldura reserva o espaço: a imagem não desloca nada ao chegar.
- Só os dois cartões da entrada carregam com prioridade (`fetchpriority="high"`). A miniatura do cabeçalho da exploração carrega logo, sem prioridade. As demais ficam com `loading="lazy"`.

O efeito medido na entrada, onde o maior elemento da tela é um retrato:

| Perfil | Versão pedida | Imagens transferidas, antes → depois | LCP, antes → depois |
| --- | --- | --- | --- |
| Computador | 320 px, moldura 4:5 | 505 KB → 27 KB | 776 ms → 332 ms |
| Celular, densidade 2 | 480 px, moldura 4:5 | 505 KB → 47 KB | 4.224 ms → 1.152 ms |

Nas outras telas o retrato é uma miniatura. A exploração baixava o original de 290 KB e agora baixa de 2 a 5 KB; a comparação baixava os dois originais em computador e agora baixa 2 KB.

Um efeito colateral foi medido e corrigido. Uma imagem que carrega logo, quando renderizada em um Server Component, entra como dica de pré-carregamento no conteúdo que o roteador busca ao ver um link. Toda página com link para a entrada baixava os retratos dos cartões sem mostrá-los. `Portrait` passou a ser um componente de cliente, e a dica fica só no HTML da própria página.

### Mapa

O código do mapa já ficava em pacotes à parte desde a fase 6, carregados por `next/dynamic` sem renderização no servidor. O que uma tela baixa quando mostra o mapa:

| Parte | No disco | Transferido, com gzip |
| --- | --- | --- |
| Pacote do MapLibre | 1.014 KB | 276 KB |
| Folha de estilo do MapLibre | 81 KB | 10 KB |
| Worker do MapLibre | 496 KB | 141 KB |
| Contornos (países e estados) | 249 KB | 69 KB |
| Total | 1.840 KB | 496 KB |

O que mudou (D-76):

- **Montagem perto da área visível.** `MapView` só carrega o mapa quando a moldura está na tela ou a menos de 400 px dela. Na página de um acontecimento em celular, o mapa fica abaixo da primeira tela e espera a rolagem chegar perto. Na fase 7 ele era carregado ao abrir a página.
- **Aquecimento por intenção.** Levar o ponteiro, o dedo ou o foco ao botão da vista **Mapa** começa a baixar o pacote, sem criar o mapa nem pedir os contornos. Não há pré-carregamento em tempo ocioso: em celular, seriam perto de 500 KB de dados de quem nunca abre o mapa.
- **Espaço reservado e aviso.** A moldura já tem o tamanho final e a cor do mar. Enquanto o mapa não chega, mostra "Carregando o mapa…" (`role="status"`) com um traço que vai e volta. Pronto, o mapa entra com 180 ms de opacidade, sem deslocar o que está em volta.
- **O que não mudou.** A instância é criada uma vez e não é refeita por filtros nem por seleção. Ao sair da tela, os temporizadores são cancelados e `map.remove()` libera os ouvintes e o contexto gráfico. As cinco falhas tratadas na fase 6 continuam com a lista de lugares no lugar do mapa (MAP.md, seções Ciclo de vida e Falhas).

Onde o mapa é pedido ao abrir a página, conferido pelos pedidos reais do build (`npm run test:export`):

| Tela | Computador | Celular |
| --- | --- | --- |
| Entrada, comparação, metodologia e página 404 | Não | Não |
| Exploração | Sim: o mapa está na primeira tela | Não: só quando a vista **Mapa** é aberta |
| Página do acontecimento | Sim: o mapa está na primeira tela ou perto dela | Não: só quando a rolagem chega perto |

O custo medido:

| Medida | Antes | Depois |
| --- | --- | --- |
| Mapa pronto, na exploração em computador | 1.582 ms | 1.356 ms |
| Mapa pronto, na página do acontecimento em computador | 1.538 ms | 1.247 ms |
| Página do acontecimento em celular, ao abrir | O mapa era carregado e ficava pronto em 5.782 ms. 848 KB transferidos e 1.135 ms de bloqueio | O mapa não é carregado. 327 KB transferidos e 546 ms de bloqueio |
| Abrir a vista do mapa na exploração em celular, do toque até o mapa pronto | 4.169 ms | 4.069 ms |

Em computador o mapa fica pronto mais cedo porque divide a rede com menos coisa: os retratos originais e os pedidos que falhavam saíram do caminho.

**Abrir a vista do mapa em celular com rede lenta continua levando perto de 4 segundos.** É o gargalo que sobrou. Só a transferência do pacote, do worker e dos contornos ocupa cerca de 2,4 segundos de uma rede de 1,6 Mbit/s, e o resto é execução com o processador limitado. Durante a espera a moldura mostra o aviso de carregamento, e a lista e a leitura continuam em uso. O atlas não tem como reduzir o pacote do MapLibre (D-86).

### Build

`scripts/finalize-export.mjs` roda no fim de `npm run build` e corrige três defeitos da saída (D-77). `npm run verify:export` confere os três.

| Defeito observado | Correção | Efeito |
| --- | --- | --- |
| No Windows, a exportação do Next 16.4 grava os arquivos de navegação em pastas (`__next.politicos/$d$slug/__PAGE__.txt`), e o navegador os pede com pontos (`__next.politicos.$d$slug.__PAGE__.txt`). Os pedidos davam 404, e a troca de página caía no carregamento do documento inteiro | 44 arquivos são renomeados para o caminho que o navegador pede | Nenhum pedido com 404. A troca de página passa pelo roteador, sem recarregar o documento |
| O MapLibre procura o próprio worker com um endereço montado em tempo de execução, e o bundler publica a pasta `dist` inteira do pacote | 6 arquivos sem uso são removidos: 4,5 MB | A saída estática foi de 14,5 MB para 10,3 MB |
| A rota dos acontecimentos tem uma extensão condicional (D-06), e as páginas dela saíam sem o pré-carregamento da fonte que as outras têm | O pré-carregamento é copiado da entrada para as páginas que não o têm | As 39 páginas de acontecimento e a 404 pedem a fonte da interface cedo, como as demais. Medido na página de um acontecimento: as fontes ficam prontas 100 ms antes, e o primeiro desenho vem 16 ms depois em computador e 36 ms depois no perfil de celular |

Em um build feito no Linux ou no macOS o primeiro passo não deve ter o que renomear. Isso não foi conferido: todos os builds desta fase foram feitos no Windows.

### Navegação

Com os arquivos de navegação no lugar, o roteador do Next passou a fazer o que faz por padrão: baixar a página de destino de cada link que aparece na tela. Com o menu em todas as páginas, eram quatro páginas a mais a cada visita. A medição mostrou o trabalho depois do carregamento subindo nas telas de leitura.

O pré-carregamento ficou por intenção (D-78):

| Link | Quando o destino é adiantado |
| --- | --- |
| Os dois cartões da entrada | Ao aparecer na tela, que é o padrão do Next. É o caminho principal do atlas |
| Menu, nome do atlas, **Comparar as trajetórias** e os caminhos da página 404 (`IntentLink`) | Quando a pessoa leva o ponteiro, o dedo ou o foco ao link |
| Retorno e **Continuar no atlas** na página do acontecimento, links para a metodologia dentro do texto, rodapé, créditos e todo link com consulta no endereço | Só ao ser acionado |

Conferido no build: da entrada para a exploração, a troca usa o que já foi baixado e não recarrega o documento; o menu não pede nada até o ponteiro chegar a um link.

Adiantar as duas trajetórias tem um custo na entrada, que aparece na tabela de peso: 23 KB a mais de JavaScript e 7 KB a mais de dados. Em troca, o caminho principal do atlas não espera a rede.

### Fontes

Duas famílias, em dois arquivos locais: a Newsreader (serifada, 129 KB) e a Libre Franklin (sem serifa, 29 KB). As duas usam `font-display: swap`, com um substituto de medidas ajustadas enquanto o arquivo não chega. O itálico da Newsreader (143 KB) saiu do projeto: nenhum texto das páginas o usava, e ele não era baixado; só ocupava a saída.

Duas estratégias de pré-carregamento foram construídas e medidas contra o build sem elas, com as execuções alternadas (5 por tela e por perfil). Ficou o que já era o padrão do Next: a Libre Franklin pré-carregada, a Newsreader não (D-79).

**Pré-carregar também a Newsreader.** Não adianta a chegada da fonte e atrasa o primeiro desenho das páginas de texto em computador. Arquivos: [`fonte-sem-pre-carregamento.json`](desempenho/fonte-sem-pre-carregamento.json) e [`fonte-com-pre-carregamento.json`](desempenho/fonte-com-pre-carregamento.json).

| Perfil | Tela | FCP sem → com | Fontes prontas sem → com | CLS sem → com |
| --- | --- | --- | --- | --- |
| Computador | Entrada | 344 → 340 ms | 453 → 433 ms | 0,000 → 0,000 |
| Computador | Acontecimento | 284 → 328 ms | 457 → 404 ms | 0,000 → 0,000 |
| Computador | Metodologia | 312 → 408 ms | 404 → 394 ms | 0,000 → 0,000 |
| Celular | Entrada | 1.124 → 1.156 ms | 2.157 → 2.164 ms | 0,002 → 0,002 |
| Celular | Acontecimento | 1.248 → 1.236 ms | 1.988 → 1.993 ms | 0,022 → 0,022 |
| Celular | Metodologia | 1.360 → 1.364 ms | 1.934 → 1.924 ms | 0,019 → 0,019 |

**Não pré-carregar nenhuma.** Adianta o primeiro desenho em celular em algumas dezenas de milissegundos, mas a entrada passa a se deslocar quando a fonte da interface chega, e em computador o resultado é misto. Arquivos: [`sem-serifa-sem-pre-carregamento.json`](desempenho/sem-serifa-sem-pre-carregamento.json) e [`sem-serifa-com-pre-carregamento.json`](desempenho/sem-serifa-com-pre-carregamento.json).

| Perfil | Tela | FCP sem → com | Fontes prontas sem → com | CLS sem → com |
| --- | --- | --- | --- | --- |
| Computador | Entrada | 396 → 308 ms | 535 → 430 ms | 0,001 → 0,000 |
| Computador | Exploração | 416 → 428 ms | 617 → 523 ms | 0,005 → 0,004 |
| Computador | Acontecimento | 300 → 332 ms | 546 → 465 ms | 0,000 → 0,000 |
| Computador | Metodologia | 336 → 316 ms | 506 → 411 ms | 0,001 → 0,000 |
| Celular | Entrada | 1.088 → 1.160 ms | 2.152 → 2.172 ms | 0,020 → 0,002 |
| Celular | Exploração | 1.228 → 1.292 ms | 2.174 → 2.067 ms | 0,000 → 0,000 |
| Celular | Acontecimento | 1.148 → 1.156 ms | 2.087 → 1.998 ms | 0,022 → 0,022 |
| Celular | Metodologia | 1.268 → 1.348 ms | 2.210 → 1.925 ms | 0,019 → 0,019 |

Nos dois testes, "com" é o estado que ficou no segundo e o que foi descartado no primeiro. O deslocamento de 0,02 que aparece nas páginas de texto em celular é a troca do substituto pela Newsreader: um título pode mudar de quebra de linha quando a fonte chega. Está dentro da meta e não mudou com nenhuma das duas estratégias.

Esses quatro arquivos foram gravados antes de uma correção no medidor (seção Limitações). Deles só foram usados os tempos e o CLS.

### Resposta dos controles

Abrir um acontecimento muda o endereço, e o estado era lido de novo por inteiro. A lista do recorte ganhava outra identidade, e com ela os pontos do mapa, os lugares, o agrupamento e as contagens eram refeitos sem que nada tivesse mudado. Fechar a leitura reconstruía o perfil, com as fontes de cada cargo.

Agora o período, as categorias e o recorte visível são os mesmos objetos enquanto não mudam, o perfil continua montado e escondido sob a leitura, e os blocos de cargos e partidos só são refeitos quando o período ou os registros mudam (D-81).

A medição não mostrou diferença na resposta. Em todas as interações, antes e depois ficam a um ou dois quadros um do outro, ora para um lado, ora para o outro, e isso é a resolução da própria medida. No perfil de computador, as cinco interações levam de 88 a 120 ms; no de celular, com o processador 4 vezes mais lento, de 144 a 224 ms. Com 39 acontecimentos, refazer o recorte já era barato. A mudança fica como proteção para quando o conteúdo crescer, e não como ganho medido.

As transições são só de CSS, com 120 e 180 ms, e nenhuma segura o estado: o endereço muda no clique, e uma sequência rápida deixa na tela só o último estado (D-80). Isso é conferido por teste, com o movimento ligado (`tests/e2e/acabamento.spec.ts`).

### Link com consulta

O HTML do build traz o recorte padrão: a consulta do endereço só é lida no navegador. Quem abria um link copiado via primeiro a lista inteira e o perfil, e só depois o período e o acontecimento do link.

Agora um trecho de script marca o documento antes do primeiro desenho, o CSS encobre a área que depende da consulta e mostra "Abrindo a consulta do endereço…", e a tela aparece já no recorte pedido (D-83). Vale para a exploração e para a comparação. Se o código da página não chegar, a área aparece sozinha em 6 segundos.

A posição desse trecho foi decidida por medição. No começo do `<body>`, ele esperava a folha de estilo, e enquanto esperava o navegador parava de ler o HTML: o primeiro desenho de todas as telas atrasava de 40 a 140 ms no perfil de celular. No fim do `<body>`, o HTML já foi lido quando ele roda.

### Base geográfica

Não mudou. Os contornos têm 249 KB no disco e 69 KB transferidos, com as coordenadas em duas casas decimais, e só são pedidos junto com o mapa. O pacote e o worker do MapLibre somam seis vezes isso: a base não é o gargalo.

## Verificações sobre o build

`npm run test:export` roda sobre a saída estática, servida por `scripts/preview.mjs`, e confere pelos pedidos reais:

- O código do mapa está em pacotes à parte, e a entrada, a comparação, a metodologia e a página 404 não pedem nada dele.
- A entrada pede as versões preparadas dos retratos, na largura da tela, e nunca o original. Em celular, pede versões menores. A miniatura da exploração pede a versão quadrada pequena.
- Adiantar a entrada a partir de outra página, com o ponteiro no nome do atlas, traz o conteúdo dela sem baixar os retratos dos cartões.
- Exploração em computador: o mapa é carregado, com a lista já legível. Em celular: nada do mapa até a vista ser pedida, e o aquecimento não cria o mapa.
- Página do acontecimento em celular: o mapa espera a rolagem chegar perto. Em computador: o texto chega antes, e o mapa entra sem deslocar nada.
- Nenhum pedido das telas principais falha, e nada vai a outro domínio.
- O menu só adianta o destino quando a pessoa aponta para o link, e da entrada para a exploração o roteador usa o que já baixou.

## Limitações

- **Laboratório, em uma máquina.** Os números servem para comparar builds nas mesmas condições. Não preveem a experiência de quem visita.
- **Celular emulado.** Tela, densidade, toque, rede e processador são emulados em um notebook. Um aparelho real tem outro processador, outra placa de vídeo, outra memória e outro navegador. Não havia aparelho disponível nesta fase.
- **Um navegador.** Chromium sem interface. Firefox, Safari e um Chrome com janela não foram medidos.
- **Servidor local.** Gzip, HTTP/1.1 e nenhuma distância além da latência emulada. Uma hospedagem real tem outra compressão, outro protocolo e outra política de cache.
- **Cache sempre vazio.** A segunda visita não foi medida.
- **INP não medido.** É uma métrica de visitas reais. As interações daqui são uma de cada tipo por execução, e os valores ficam perto da resolução do próprio registro, que é de 8 ms.
- **CLS só do carregamento.** Deslocamentos durante o uso não entram.
- **Sete execuções.** O resultado é a mediana, sem intervalo de confiança.
- **Uma página de cada tipo.** Um perfil e um acontecimento, dos 2 e dos 39 que existem.
- **Os arquivos dos testes de fontes** foram gravados antes de uma correção no medidor. Para o script de um worker, o navegador informa corpo de tamanho zero, e o worker do mapa (141 KB) ficava fora do peso transferido das telas com mapa. O medidor passou a usar o tamanho que o servidor declara. `antes.json`, `depois.json` e os dois arquivos da página do acontecimento já foram medidos com a correção.
- **Uma regra de CSS entrou depois da medição.** A conferência final achou um defeito no aviso do link com consulta, com movimento reduzido, e a correção acrescentou uma regra de três linhas à folha de estilo (118 bytes). O build não foi medido de novo por causa dela.

## Pendências

1. **Aparelho móvel real.** Conferir a jornada e, principalmente, o tempo para abrir a vista do mapa. Fase 9.
2. **Abrir a vista do mapa em celular com rede lenta leva perto de 4 segundos,** antes e depois. O gargalo é o pacote e o worker do MapLibre. Não há saída dentro do pacote; reavaliar se a base do mapa mudar (D-86).
3. **Primeiro desenho da página do acontecimento em celular 112 ms mais tarde.** Dentro da meta. Cerca de um terço vem do pré-carregamento da fonte; o resto não foi isolado. Conferir em aparelho real antes de mexer.
4. **Bloqueio de 0,5 a 0,9 segundo no carregamento, no perfil de celular.** Não mudou nesta fase. Reduzir pede menos código de cliente na abertura de cada tela, que é um trabalho de outra ordem.
5. **Dados de campo e INP,** depois da publicação.
6. **Hospedagem** (fase 10): compressão, cache longo para `/_next/static/`, `404.html` e tipo de conteúdo dos arquivos `.mjs`. Medir de novo no endereço público.
7. **Passos do ajuste da saída:** rever a cada atualização do Next ou do MapLibre. Se o defeito sumir, o passo sai.
8. **Fontes.** A Newsreader, com 129 KB, é o maior arquivo das páginas de leitura, e em celular com rede lenta o texto só assume a forma final perto de 2 segundos. Um subconjunto menor pede uma ferramenta que o projeto não tem instalada.
9. **Navegador sem WebP** não mostra o retrato. Não há versão em outro formato.
10. **Segunda visita e troca de página** não foram medidas: todas as execuções abrem a tela direto, com o cache vazio.
