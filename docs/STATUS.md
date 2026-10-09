# Status

Atualizado em 9 de outubro de 2026.

| Fase do plano | Situação |
| --- | --- |
| 1. Arquitetura e fundação | Concluída em 08/10/2026 |
| 2. Pesquisa e primeiro conjunto de conteúdo | Concluída em 08/10/2026, com revisão assistida por IA e pendências listadas abaixo |
| 3. Camada de dados e preparação do backend | Concluída em 08/10/2026 |
| 4. Experiência e direção visual | Concluída em 08/10/2026, com prévia navegável |
| 5. Aplicação e linha do tempo | Concluída em 09/10/2026, com pendências e itens não verificados listados abaixo |
| 6 a 10 | Não iniciadas |

## Fase 5 (aplicação e linha do tempo)

Entrega: a navegação temporal da exploração, com conteúdo real. Escolher a pessoa, consultar um ano ou um intervalo, filtrar categorias, selecionar um acontecimento e ler os detalhes, com a consulta inteira no endereço. A especificação está em [TIMELINE.md](TIMELINE.md); o comportamento de cada controle, em [INTERACTIONS.md](INTERACTIONS.md); as decisões, em [DECISIONS.md](DECISIONS.md), de D-49 a D-57; as capturas, em [capturas/fase-5/](capturas/README.md).

Para abrir: `npm run dev` e `http://localhost:3000/politicos/lula/`. Exemplos de endereço com consulta estão em TIMELINE.md e no README.

### Critério de conclusão do plano

"Filtros, seleção, lista e painel exibem o mesmo recorte; datas parciais são tratadas corretamente; anos com pouca informação são apresentados com clareza."

| Parte do critério | Situação | Como foi conferido |
| --- | --- | --- |
| Filtros, seleção, lista e painel exibem o mesmo recorte | Atendido | O estado é um só e fica no endereço; lista, marcas, mapa e painel são derivados dele. Os testes de navegador comparam, a cada filtro, a quantidade de itens da lista e de marcas com a conta feita sobre os dados gerados, e conferem que o acontecimento aberto é o mesmo nas quatro partes, inclusive depois de recarregar, voltar e avançar |
| Datas parciais são tratadas corretamente | Atendido | A lista diz "só o ano" ou "sem o dia"; a marca cobre o ano ou o mês inteiro; o registro cuja posição as datas não decidem diz que a ordem não está documentada; o filtro por ano nunca precisa de um dia. Testes de regra e de navegador |
| Anos com pouca informação são apresentados com clareza | Atendido | As lacunas do conjunto aparecem na lista, no lugar dos anos; o recorte vazio explica que falta registro, e não atividade; os cargos e partidos de presença incerta ficam à parte; o fim da lista diz o que a edição cobre |

### Passos do plano e situação de cada um

| Passo | Situação |
| --- | --- |
| 1. Entrada e seleção de pessoa | Feito. A entrada já levava aos perfis reais; a exploração ganhou a troca de pessoa, que leva o recorte |
| 2. Lista cronológica com o conjunto publicado | Feito, com as lacunas e os avisos de data parcial e de ordem em aberto |
| 3. Seleção de ano ou intervalo e categorias | Feito: campos de ano, clique e arraste no eixo, categorias e limpar filtros |
| 4. Cargos e filiações documentados para o período | Feito: bloco acima da lista, com a presença incerta à parte |
| 5. Painel de um acontecimento selecionado | Feito na fase 4; nesta, ligado ao endereço e ao histórico |
| 6. Endereços compartilháveis e voltar e avançar | Feito: o endereço é a fonte do estado |
| 7. Legibilidade em telas pequenas e datas muito próximas | Feito: fileiras medidas pela largura do eixo, faixa que rola até o período em celular e janela baixa tratada |

### O que foi entregue

- **Consulta no endereço.** Período, categorias e acontecimento aberto ficam na query string. Abrir um link, recarregar, voltar e avançar restauram a mesma consulta. Endereço com erro abre do mesmo jeito e é corrigido no lugar.
- **Troca de pessoa** dentro da exploração, com os perfis em ordem alfabética e o aberto marcado. Leva período e categorias; o acontecimento só segue quando é dos dois perfis.
- **Período por três caminhos:** campos de ano, clique em um ano do eixo e arraste sobre o eixo. O arraste mostra a prévia e só muda a consulta ao soltar.
- **Limpar filtros**, que volta ao recorte inicial de uma vez.
- **Lista cronológica** com o período e a quantidade no cabeçalho, as lacunas do conjunto como linhas, o aviso do que falta em cada data parcial e o aviso de ordem não documentada.
- **Cargos e partidos do período**, por extenso, com o que as datas provam separado do que tem presença incerta.
- **Linha do tempo** com as marcas distribuídas pela largura real do eixo, sem que uma cubra a outra, e com a hachura do período por baixo das marcas.
- **Aviso** quando um filtro tira do recorte o acontecimento que estava aberto.
- **Contrato com o mapa** escrito e exposto: filtros, `visible`, `visibleIds` e `selected` (TIMELINE.md).
- **Guia de estados** (`/dev/previa/`) com os estados novos.
- **Capturas** da fase e o comando que as refaz: `npm run capture:timeline`.

### Arquivos

Comparação com o estado da fase 4: 44 arquivos de código e de documentação, mais 20 capturas.

| Onde | O quê |
| --- | --- |
| `docs/` | Novo: TIMELINE.md e `capturas/fase-5/` (20 imagens). Atualizados: ARCHITECTURE.md, DECISIONS.md, DESIGN-SYSTEM.md, INTERACTIONS.md, UX.md, STATUS.md e `capturas/README.md` |
| `src/lib/state/` | Novos: `AtlasUrlStateProvider.tsx` e `url-state.ts`. Atualizados: `atlas-state.ts` (`clearFilters`, `fitPeriod`, `hasFilters`), `selectors.ts` (`settle`), `url-params.ts` (`mergeAtlasParams`) e `AtlasStateProvider.tsx` (`visibleIds`, contrato comum) |
| `src/features/timeline/` | Novos: `PeriodBrush.tsx` e `PeriodContext.tsx`. Atualizados: `Timeline.tsx`, `EventMarks.tsx` e o README |
| `src/features/events/` | Novo: `chronology.ts`. Atualizado: `EventList.tsx` |
| `src/components/` | Novos: `PersonSwitch.tsx` e `PeriodRecords.tsx`. Atualizados: `DateMark.tsx`, `time/scale.ts` (`yearAtPosition`, `yearsBetween`) e `time/PeriodShade.tsx` |
| `src/app/` | Atualizados: `politicos/[slug]/Explorer.tsx` e `page.tsx`, `comparar/Comparison.tsx` (usa as listas compartilhadas), `dev/previa/StatesGallery.tsx` e `globals.css` (uma regra da grade) |
| `src/features/map/`, `src/lib/domain/` | `MapView.tsx` (altura mínima em telas médias e largas) e `dates.ts` (`formatYearRange`) |
| `tests/` | Novos: `url-state.test.ts`, `chronology.test.ts`, `e2e/linha-do-tempo.spec.ts` e `e2e/linha-do-tempo.capture.ts`. Atualizados: `state.test.ts`, `url-params.test.ts`, `timeline.test.ts`, `dates.test.ts`, `e2e/previa.spec.ts`, `e2e/dados.spec.ts` e `e2e/previa.capture.ts` |
| Raiz | `package.json` (comandos de captura separados) e README.md |

`content/` não foi alterado, nenhuma dependência foi acrescentada, e as imagens de `docs/capturas/fase-4/` não foram refeitas.

### Jornada implementada e o que segue em demonstração

Implementado, com dados reais e teste de navegador:

- Entrada, perfil e troca entre os dois perfis, com o recorte.
- Ano, intervalo e categorias combinadas, com a lista, as marcas, os pontos e as contagens no mesmo recorte.
- Ordem cronológica, datas parciais, ordem em aberto e lacunas.
- Cargos e partidos do período, com mudança de cargo ou de partido dentro do intervalo.
- Seleção, abertura e fechamento do painel, com o foco devolvido.
- Limpeza da seleção quando o recorte muda, com o aviso.
- Recorte sem resultados e retorno por limpeza de filtros.
- Endereço direto, recarregamento, voltar e avançar.
- Parâmetros inválidos e acontecimento incompatível.
- Leitura sem o mapa.

Em demonstração, com o contrato de cada um em INTERACTIONS.md: zoom na linha do tempo (não feito, por decisão), pontos sobrepostos, formas e rótulos no mapa, pontos pelo teclado, comparação ligada ao estado e ao endereço, retorno da página do acontecimento com o recorte de antes, fonte indisponível e imagem de acontecimento.

### O que a fase 4 deixou para esta fase

| Ponto | Como ficou |
| --- | --- |
| Escrever o estado no endereço e responder a voltar e avançar | Feito, com o endereço como fonte do estado (D-49, D-50) |
| Período por arraste, disparando o mesmo `setPeriod` | Feito, com clique para um ano só (D-53) |
| Cargos e partidos do período na exploração, com documentado e incerto | Feito (D-55) |
| Zoom ou agrupamento para anos cheios | Decidido: nenhum dos dois. Fileiras medidas pela largura (D-53) |
| Rótulo das barras de cargo estreitas | O desenho continua sem o texto; o nome está por extenso no bloco do período, que serve ao toque |

### Problemas achados na conferência e corrigidos

A conferência foi feita abrindo a exploração em um Chromium, em computador, tablet e celular, capturando as telas e olhando cada captura, e medindo a área de trabalho em seis tamanhos de janela.

| Problema | Correção |
| --- | --- |
| Em uma janela de 1280×720, o mapa era desenhado por cima da linha do tempo | O mapa fica com pelo menos 40% da altura; a linha do tempo rola por dentro. Um teste confere (D-56) |
| A hachura do período passava por cima das marcas do ano escolhido | A hachura fica sob as marcas |
| Em celular, chegar por um endereço com período mostrava só hachura na faixa | A faixa rola até o período |
| O bloco de cargos e partidos, aberto por padrão, empurrava os acontecimentos para fora da tela | Começa recolhido, com o resumo à vista |
| O resumo do bloco somava os registros de presença incerta aos documentados | Contagens separadas |
| O aviso de acontecimento fechado continuava na tela depois de voltar no histórico | O aviso vale só para a consulta em que o fechamento aconteceu |
| As áreas de clique das marcas se cobriam em colunas estreitas | O espaço de cada marca é calculado com a largura real do eixo |
| Clicar no menu para o perfil que já estava aberto mudava o endereço e não a tela | Um componente avisa das navegações do roteador. Sem ele, o teste falha |
| A regra de histórico escrita na fase 1 apagaria a entrada anterior ao arraste | Regra reescrita em ARCHITECTURE.md (D-50) |

### Verificações executadas

Todas em 09/10/2026, com Node 24.15.0 no Windows 11.

| Verificação | Resultado |
| --- | --- |
| `npm run lint` | Sem problemas |
| `npm run typecheck` | Sem erros |
| `npm run test` | 382 testes passando, em 19 arquivos. Eram 314 em 17 |
| `npm run build` | 47 páginas HTML, como antes |
| `npm run verify:export` | 264 arquivos; 39 acontecimentos com página, 5 rascunhos sem página, nenhum dado sintético, nenhuma rota de desenvolvimento |
| `npm run test:e2e` | 88 testes passando: 13 da prova sintética, 7 dos dados reais, 28 da prévia e 40 da navegação temporal |
| `npm run capture:timeline` | 20 capturas, conferidas uma a uma |
| HTML gerado dos dois perfis | Cada arquivo traz os 20 acontecimentos, as marcas e as lacunas: a exploração não deixou de ser pré-renderizada |
| Saída estática, servida por `npm run preview` | Chegada por endereço com consulta, recarregamento, nova entrada, voltar, avançar, troca de pessoa com o recorte, correção de endereço inválido e menu para o mesmo perfil: todos como no servidor de desenvolvimento. Nenhum pedido a outro domínio |
| Janelas medidas | 1440×900, 1366×768, 1280×720, 1280×600, 1024×768 e 768×1024: o mapa não é coberto, e a linha do tempo rola por dentro quando não cabe |
| Larguras conferidas pelas capturas | 1440×900, 1280×720, 768×1024 e 390×844. Em 360×800, uma captura avulsa com o bloco de cargos aberto, e o teste da fase 4 que confere que nenhuma tela passa da largura |
| Teclado e foco | Bloco de cargos (Enter), linha do tempo com setas, Esc na leitura e no arraste, foco devolvido ao fechar. Campos de ano, categorias e troca de pessoa são controles nativos: campo de seleção, botão e link |
| Toque | Em 390×844, com toque emulado: o toque em um ano do eixo foi disparado como toque; leitura, cartão do mapa e botão voltar, como clique. Áreas de 44 px na troca de pessoa e em limpar filtros |
| Histórico | Uma entrada por escolha; uma por arraste; uma para 14 mudanças seguidas de um campo de ano; nenhuma na correção de endereço |

Dez regras foram quebradas de propósito, uma por vez, para confirmar que os testes falham: histórico sempre criando entrada, período fora da cobertura aceito, troca de pessoa levando qualquer acontecimento, ordem em aberto marcando os dois registros, seleção fora do recorte mantida, voltar e avançar sem escuta, navegação do roteador sem aviso, endereço sem correção, arraste alterando a consulta a cada ano e marcas sem medir a largura. Em todos os casos algum teste falhou, e o código foi restaurado. Com a regra antiga da grade em vigor, o teste da janela baixa também falhou.

### Implementado e não verificado

- **Navegador com janela visível, Firefox e Safari.** Tudo foi conferido em um Chromium sem interface. A integração com a History API e o `touch-action` do eixo não foram vistos em outro motor.
- **Celular e tablet reais.** As larguras e o toque foram emulados. O botão voltar do aparelho, a barra de endereço que encolhe e o teclado virtual não foram exercitados.
- **Arraste por toque no eixo, em tablet.** Está implementado para as larguras em que a faixa não rola; o teste cobre só o toque parado.
- **Setas do teclado em um campo de ano.** O teste dispara mudanças seguidas do campo, e não a tecla física, cujo comportamento varia entre sistemas.
- **Leitor de tela.** Os avisos da região de anúncio e a leitura das lacunas foram conferidos pela estrutura, e não com NVDA, VoiceOver ou TalkBack.
- **Hospedagem real.** A saída estática foi servida só pelo servidor local de `npm run preview`.
- **Conexão lenta.** O intervalo em que quem chega por um link com consulta vê o estado inicial não foi medido.
- **Desempenho.** Nenhuma medição. É da fase 8.

### Pendências reais

1. **Revisão humana de todo o conteúdo.** Continua sendo a principal.
2. **Decisões do responsável pelo projeto, herdadas:** nome definitivo, retrato em cinza e recortado (D-42) e canal público de correção.
3. **Estado inicial por um instante.** Quem abre um link com consulta vê primeiro a exploração sem filtro, que é o que o HTML estático traz, e depois a consulta. É consequência da exportação estática (D-49). Fica para a fase 8.
4. **Fechar a leitura cria uma entrada no histórico.** Abrir e fechar vários acontecimentos alonga o caminho de volta. A regra é a da arquitetura; vale rever com pessoas usando, na fase 9.
5. **A página do acontecimento volta sem o recorte.** O link **Trajetória de (pessoa)** leva só o acontecimento. O botão voltar do navegador devolve a consulta inteira. É da fase 7.
6. **A comparação ainda não usa o endereço.** É da fase 7.
7. **Pontos sobrepostos no mapa.** Brasília reúne 9 pontos e o estado do Rio de Janeiro, 7. É da fase 6.
8. **Barras de cargo estreitas sem rótulo no desenho.** O nome agora está por extenso no bloco do período, mas a barra continua muda.
9. **Saída estática em hospedagem simples.** Os pedidos de pré-carregamento de segmento do Next continuam dando 404 no servidor de `npm run preview`, como na fase 4. A navegação funciona.
10. **Servidor de desenvolvimento e `globals.css`.** Em duas ocasiões desta fase o servidor continuou entregando o CSS anterior depois de uma mudança no arquivo; em uma delas, o arquivo tinha voltado a um conteúdo que já tivera. Reiniciar `npm run dev` resolveu. O build não é afetado.
11. **Vídeo de demonstração** não gravado, como na fase 4.
12. **Lacunas de conteúdo herdadas** (lista na seção da fase 3).

### Preparação para a fase 6 (mapa sincronizado)

O critério da fase 6 é ligar os acontecimentos aos lugares, com seleção nos dois sentidos, pontos sobrepostos tratados e os pontos acompanhando pessoa, período e categoria. Situação de cada passo do plano:

| Passo da fase 6 | O que já existe | O que falta |
| --- | --- | --- |
| 1. Base geográfica local e estilo do mapa | Contornos do Natural Earth 1:50m e estilo local, isolados em `buildBaseStyle` | Decidir a base definitiva, os rótulos e os glyphs (D-43) |
| 2. Plotar os acontecimentos com localização | 27 pontos de 26 acontecimentos, montados pelo gerador | Nada previsto |
| 3. Foco e seleção nos dois sentidos | O clique no ponto seleciona, e a seleção move a câmera. Desde esta fase, a seleção pelo mapa entra no endereço e no histórico como as outras | Rever com pontos sobrepostos |
| 4. Agrupar ou escolher pontos sobrepostos | Nada. O clique abre o de cima | Decidir entre agrupar e listar por lugar. `listEventsAtPlace(data, lugarId)` já devolve os acontecimentos de um lugar |
| 5. Pontos de acordo com pessoa, período e categoria | Feito: `filterPoints(data.pontos, visible)`; `visibleIds` para filtrar uma camada sem refazer a coleção | Nada previsto |
| 6. Limites de zoom | Zoom contido em 4,5 ao selecionar | Definir mínimo e máximo de navegação |
| 7. Câmera e gestos em computador e celular | Movimento de 500 ms; em celular, o mapa ocupa a tela e o cartão reserva a faixa de baixo | Conferir em aparelho real |

Pontos de atenção para quem continuar:

- O contrato está em TIMELINE.md, seção Contrato com o mapa. O mapa não precisa de estado próprio nem de parâmetro novo no endereço para o que o plano pede.
- Voltar e avançar mudam `selectedSlug` sem clique: a câmera já acompanha, porque reage à propriedade, e não ao gesto.
- `visible` muda uma vez por ação, inclusive no arraste de período: o mapa não recebe atualizações intermediárias.
- Em tela estreita, a seleção pelo mapa mostra o cartão e guarda que a leitura está fechada (`folded`, em `Explorer.tsx`). Um agrupamento de pontos precisa conviver com esse cartão.
- Os testes de `tests/e2e/linha-do-tempo.spec.ts` rodam com e sem o mapa e servem de rede para a troca da camada de pontos.

## Fase 4 (experiência e direção visual)

Entrega: a direção visual do atlas, a base visual reutilizável e uma prévia navegável das quatro telas, com os dados gerados da edição 0.1.0, em computador, tablet e celular. A especificação está em [UX.md](UX.md), [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) e [INTERACTIONS.md](INTERACTIONS.md); as decisões, em [DECISIONS.md](DECISIONS.md), de D-37 a D-48; as capturas, em [capturas/](capturas/README.md).

Para abrir: `npm run dev` e `http://localhost:3000/`. O guia de estados fica em `http://localhost:3000/dev/previa/`.

### Critério de conclusão do plano

"O fluxo pode ser explicado pelas telas e funciona com o conteúdo real preparado."

| Parte do critério | Situação | Como foi conferido |
| --- | --- | --- |
| O fluxo pode ser explicado pelas telas | Atendido | 40 capturas reais, nas quatro larguras, e um roteiro de demonstração de 30 segundos em UX.md |
| Funciona com o conteúdo real preparado | Atendido | As quatro telas são as rotas do atlas e leem `generated/`. 28 testes de navegador percorrem entrada, exploração, acontecimento e comparação com os 39 acontecimentos reais, e tiram os textos esperados dos arquivos gerados |

### Passos do plano e situação de cada um

| Passo | Situação |
| --- | --- |
| 1. Esboçar entrada, exploração, detalhe e comparação | Feito, como telas navegáveis nas rotas reais |
| 2. Tipografia, cores, espaçamento e composição com os dois perfis | Feito: tokens, duas famílias locais e regras de equivalência (DESIGN-SYSTEM.md) |
| 3. Relação visual entre linha do tempo, mapa e painel | Feito: a mesma seleção marcada nas quatro partes, e o mesmo recorte nas três vistas |
| 4. Versões de computador e celular | Feito, com tablet e celular estreito: três composições a partir do mesmo HTML |
| 5. Estados de carregamento, período sem registros, fonte indisponível e falha do mapa | Feito. Fonte indisponível, imagem de acontecimento e perfil sem retrato só aparecem no guia, porque o conteúdo não os produz |
| 6. Teclado, foco, contraste e movimento reduzido | Feito, com testes de teclado, de foco e de contraste. Leitor de tela real não foi usado |
| 7. Sequência de 20 a 30 segundos | Feito: roteiro em UX.md. O vídeo não foi gravado |

### O que foi entregue

- **Direção visual única:** atlas editorial em tons de papel, com o grafite como tinta, um acento só para seleção e categorias com forma, cor e nome.
- **Base visual reutilizável:** tokens de cor, tipografia e movimento; seleção de pessoa (`PersonCard`, `Portrait`); marcações temporais (`DateMark`, `TimeAxis`, `EventMarks`, `PeriodLane`, `PeriodShade`); item de acontecimento (`EventList`); painel de leitura (`EventPanel`, `ProfilePanel`); apresentação de fontes (`SourceList`, `ReviewNote`).
- **Quatro telas** nas rotas reais: entrada, exploração de cada pessoa, página de cada acontecimento e comparação. Metodologia e página 404 redesenhadas na mesma identidade.
- **Mapa com referência geográfica:** contornos do Natural Earth, Brasil em foco, divisas dos estados, pontos na cor da categoria e seleção com anel.
- **Linha do tempo** com marcas por categoria, datas parciais como trecho, faixas de cargos e de partidos, recorte hachurado e teclado.
- **Composição por largura** documentada e testada em 1440, 768, 390 e 360 px.
- **Guia de estados** em `/dev/previa/`, só em desenvolvimento.
- **Capturas** e o comando que as refaz: `npm run capture:preview`.

### Arquivos

| Onde | O quê |
| --- | --- |
| `docs/` | Novos: UX.md, DESIGN-SYSTEM.md, INTERACTIONS.md e `capturas/` (índice e 40 imagens). Atualizados: ARCHITECTURE.md, DECISIONS.md, STATUS.md |
| `src/app/` | Reescritos: `globals.css`, `layout.tsx`, `page.tsx`, `politicos/[slug]/page.tsx`, `acontecimentos/[slug]/page.published.tsx`, `comparar/page.tsx`, `metodologia/page.tsx`, `not-found.tsx`. Novos: `politicos/[slug]/Explorer.tsx`, `acontecimentos/[slug]/EventLocator.tsx`, `comparar/Comparison.tsx`, `dev/previa/`, `fonts/` |
| `src/components/` | Novos: `Category`, `DateMark`, `PersonCard`, `Portrait`, `ProfilePanel`, `ReviewNote`, `SiteNav`, `SourceList` e a pasta `time/`. Atualizados: `SiteHeader`, `SiteFooter`, `EditionStatus` |
| `src/features/` | Novos: `timeline/` (quatro componentes), `comparison/TrajectoryLanes.tsx`, `events/EventLinkList.tsx`, `map/palette.ts`, `map/base/`. Atualizados: `events/EventList.tsx`, `events/EventPanel.tsx`, `map/MapView.tsx`, `map/MapCanvas.tsx`, `map/style.ts` |
| `src/lib/` | Novos: `data/coverage.ts`, `data/slice.ts`. Atualizados: `data/queries.ts` (`listMandatesAt`, `getImage`), `domain/dates.ts` (apresentação de datas e períodos), `domain/profiles.ts` (ordem), `publication/coverage.ts` |
| `tests/` | Novos: `design.test.ts`, `timeline.test.ts`, `coverage.test.ts`, `e2e/previa.spec.ts`, `e2e/previa.capture.ts`. Atualizados: `dates.test.ts`, `map.test.ts`, `e2e/dados.spec.ts`, `e2e/prova.spec.ts` |
| Raiz | `package.json` (comando `capture:preview`), `playwright.config.ts` (projeto de capturas), README.md |

`content/` não foi alterado, e nenhuma dependência foi acrescentada.

### Fluxos implementados e em demonstração

Implementados, com dados reais e teste de navegador:

- Entrada, com escolha de pessoa, recorte da edição, acesso à metodologia e à comparação.
- Exploração: seleção compartilhada entre lista, mapa, linha do tempo e painel; período e categorias; período sem registros; acontecimento sem ponto; abrir, fechar e voltar com o foco no lugar certo.
- Página do acontecimento, com fontes, ficha e retorno para a exploração com o acontecimento aberto.
- Comparação na mesma escala, com cobertura e lacunas escritas.
- Composição em três larguras, menu em tela estreita, falha do mapa e página 404.

Em demonstração, com o contrato de cada um em INTERACTIONS.md: escrita do estado no endereço e histórico, período por arraste, zoom e agrupamento na linha do tempo, pontos sobrepostos, formas e rótulos no mapa, pontos pelo teclado, ligação da comparação com o estado e o endereço, fonte indisponível e imagem de acontecimento.

### O que a fase 3 deixou para esta fase

| Ponto | Como ficou |
| --- | --- |
| Ordem dos dois perfis na interface | Alfabética, em todo lugar (D-38) |
| Paleta e tipografia | Tokens em `globals.css`; Newsreader e Libre Franklin locais (D-37, D-39, D-41) |
| Como mostrar o que é incerto | Tabela "O que é incerto" em DESIGN-SYSTEM.md: tracejado, hachura e texto, sempre os mesmos |
| Vários pontos no mesmo lugar | Não resolvido: o clique abre o de cima, e a lista dá acesso a todos. É da fase 6 |
| Trajetórias de tamanhos diferentes | A comparação não nivela: 27 anos aparecem como "fora da cobertura desta edição" (D-47) |

### Problemas achados na conferência e corrigidos

A conferência foi feita abrindo a prévia em um Chromium, capturando as telas nas quatro larguras e olhando cada captura. O que apareceu e foi corrigido antes da entrega:

| Problema | Correção |
| --- | --- |
| Os dois cartões da entrada saíam com larguras diferentes | Cartão com largura total da coluna; um teste compara as medidas |
| A área de trabalho não respeitava a altura da tela | Cálculo de altura corrigido; em tela larga a página não rola além do rodapé |
| A barra de filtros mudava de altura ao aparecer "Todo o período" ou "Mostrar todas" | Os dois botões passaram para a linha do rótulo; um teste confere a altura |
| Em celular, o mapa passava da tela e disputava o toque com a rolagem | A vista do mapa ocupa a tela abaixo do cabeçalho |
| Em celular, selecionar pela linha do tempo tirava a pessoa do mapa | Na vista do mapa, a seleção mostra um cartão; a leitura abre a pedido |
| O ponto selecionado ficava atrás do cartão | O enquadramento reserva a faixa do cartão |
| O rótulo "sem registros" saía riscado pela linha do colchete e cortado em trechos curtos | Texto abaixo do colchete, só quando cabe inteiro |
| A faixa da comparação abria, em celular, no trecho sem cobertura | Começa pelos anos recentes, com o aviso escrito |
| O painel mostrava cargo de período incerto como cargo da época | Só entram os cargos que as datas provam |
| Texto só para leitor de tela esticava a página: 2.259 px de altura em uma tela de 900 | Áreas com rolagem própria passaram a conter esse texto. Achado por um teste |
| A tinta mais clara dava 4,29:1 sobre o papel rebaixado | Token escurecido. Achado pelo teste de contraste |
| O acento de seleção era um vermelho terroso | Trocado por laranja queimado, pelo motivo de D-39 |
| O zoom ao selecionar deixava o mapa sem referência | Zoom contido em 4,5 e movimento de câmera direto, de 500 ms |

### Verificações executadas

Todas em 08/10/2026, com Node 24.15.0 no Windows 11.

| Verificação | Resultado |
| --- | --- |
| `npm run lint` | Sem problemas |
| `npm run typecheck` | Sem erros |
| `npm run test` | 314 testes passando, em 17 arquivos. Eram 266 em 14 |
| `npm run build` | 47 páginas HTML, como antes |
| `npm run verify:export` | 39 acontecimentos com página, 5 rascunhos sem página, nenhum dado sintético, nenhuma rota de desenvolvimento |
| `npm run test:e2e` | 48 testes passando: 13 da prova sintética, 7 dos dados reais e 28 da prévia |
| `npm run capture:preview` | 40 capturas, conferidas uma a uma |
| Larguras | 1440×900, 768×1024, 390×844 e 360×800. Nenhuma rota passa da largura da tela em 360, 390 e 768 px |
| Seleção | Lista, linha do tempo e mapa levam ao mesmo acontecimento, em tela larga, média e estreita |
| Teclado e foco | Pular para o conteúdo, lista, linha do tempo com setas, Esc na leitura, foco devolvido ao fechar, anel de foco visível |
| Áreas de toque | 44 px ou mais em abas, filtros, itens de lista, menu e fechar, em 390 px |
| Contraste | Todos os pares de texto em 4,5:1 ou mais; marcas de categoria e acento em 3:1 ou mais |
| Movimento | Um teste com movimento ligado confere a transição do painel e a chegada da câmera; os demais rodam com movimento reduzido |
| Falha do mapa | Pacote bloqueado: a lista de lugares assume e a seleção continua |
| Saída estática | Servida por `npm run preview`: fontes locais carregadas, mapa montado, retorno com seleção funcionando, nenhum pedido a outro domínio, `/dev/previa/` ausente |

### Implementado e não verificado

- **Navegador com janela visível, Firefox e Safari.** Tudo foi conferido em um Chromium sem interface, com WebGL por software. Vale também para o ponto aberto desde a fase 1.
- **Celular e tablet reais.** As larguras foram emuladas. Toque, gesto de pinça no mapa, teclado virtual e barra de endereço que encolhe não foram exercitados.
- **Leitor de tela.** A estrutura foi conferida pela árvore de acessibilidade dos testes, e não com NVDA, VoiceOver ou TalkBack.
- **Zoom de texto em 200% e modo de alto contraste do sistema.**
- **Transições vistas em movimento por uma pessoa.** As capturas são estáticas e rodam com movimento reduzido.
- **Acontecimento com imagem.** O lugar existe no painel e na página, mas nenhum registro tem imagem.
- **Desempenho.** Nenhuma medição de carregamento foi feita. É da fase 8.

### Pendências reais

1. **Revisão humana de todo o conteúdo.** Continua sendo a principal, e a prévia a anuncia em quatro lugares.
2. **Decisões do responsável pelo projeto:** o nome definitivo (o rodapé diz "nome provisório"); se o retrato com condição "uso livre com crédito" pode ser exibido em cinza e recortado (D-42); o canal público de correção.
3. **Pontos sobrepostos no mapa.** Brasília reúne 9 pontos e o estado do Rio de Janeiro, 7. O clique abre só o de cima.
4. **Barras de cargo estreitas ficam sem rótulo** na linha do tempo. O nome aparece na dica do ponteiro e na lista do perfil, o que não serve ao toque.
5. **O texto alternativo dos retratos descreve cores** que a exibição em cinza não mostra. O conteúdo não foi alterado nesta fase.
6. **Saída estática em hospedagem simples.** O Next 16.4 grava os arquivos de pré-carregamento de segmento em pastas (`__next.politicos/$d$slug/__PAGE__.txt`) e o navegador os pede com pontos (`__next.politicos.$d$slug.__PAGE__.txt`). No servidor de `npm run preview` esses pedidos dão 404; a navegação funciona, porque o Next busca a página inteira em seguida. Precisa ser resolvido na hospedagem ou no build, na fase 8 ou na 10.
7. **Vídeo de demonstração.** O roteiro está escrito; a gravação não foi feita.
8. **Lacunas de conteúdo herdadas** (lista na seção da fase 3): cobertura desigual, lugares aproximados, nenhuma imagem de acontecimento.

### Preparação para a fase 5 (aplicação e linha do tempo)

*Registro da fase 4. O que a fase 5 fez com cada ponto está na seção dela, acima.*

O critério da fase 5 é "filtros, seleção, lista e painel exibem o mesmo recorte; datas parciais são tratadas corretamente; anos com pouca informação são apresentados com clareza". Situação de cada passo do plano:

| Passo da fase 5 | O que já existe | O que falta |
| --- | --- | --- |
| 1. Entrada e seleção de pessoa | Pronto, nas rotas reais | Revisão de acabamento |
| 2. Lista cronológica com o conjunto publicado | Pronto | Nada previsto |
| 3. Seleção de ano ou intervalo e categorias | Dois campos de ano e botões de categoria, ligados ao estado | Arraste sobre o eixo e atalho para um ano só, disparando o mesmo `setPeriod` |
| 4. Cargos e filiações documentados para o período escolhido | `listMandates` e `listAffiliations` por período, já usados na comparação; o painel mostra os cargos na data do acontecimento | Mostrar, na exploração, os cargos e os partidos do período em vigor, com a diferença entre documentado e incerto |
| 5. Painel de um acontecimento selecionado | Pronto, nas três larguras | Nada previsto |
| 6. Endereços compartilháveis e voltar e avançar | Leitura do endereço na chegada; `serializeAtlasParams` com a forma canônica | Escrever no histórico e responder a voltar e avançar (regras em ARCHITECTURE.md) |
| 7. Legibilidade em telas pequenas e datas muito próximas | Fileiras para marcas próximas; rolagem horizontal em celular; datas parciais como trecho | Decidir zoom ou agrupamento para anos cheios (2018, na trajetória de Lula, e 2021, na de Flávio Bolsonaro, têm três registros cada), e o rótulo das barras estreitas |

Pontos de atenção para quem continuar:

- `src/app/politicos/[slug]/Explorer.tsx` concentra a composição da exploração. Ao ligar o endereço, o estado de apresentação (vista ativa, leitura aberta) continua local; só o recorte e a seleção vão para o endereço.
- Os 28 testes de `tests/e2e/previa.spec.ts` descrevem o comportamento atual e servem de rede para a refatoração.
- O guia `/dev/previa/` mostra cada componente isolado e é o lugar para ver um estado novo antes de ele existir no conteúdo.
- "Anos com pouca informação", no critério, já tem texto e desenho: "sem registros", hachura de cobertura e a mensagem de recorte vazio.

## Fase 3 (camada de dados e preparação do backend)

Entrega: um pipeline local que valida o conteúdo, seleciona o que foi revisado e gera dados, índices e GeoJSON para as páginas. O funcionamento está em [DATA-PIPELINE.md](DATA-PIPELINE.md) e as decisões em [DECISIONS.md](DECISIONS.md), de D-27 a D-36.

### Critério de conclusão do plano

"Conteúdo inválido bloqueia sua publicação com mensagem útil; rascunhos não aparecem nas páginas; o conjunto aprovado pode ser gerado de forma reproduzível."

| Parte do critério | Situação | Como foi conferido |
| --- | --- | --- |
| Conteúdo inválido bloqueia a publicação, com mensagem útil | Atendido | O conteúdo real foi quebrado de propósito (referência a fonte inexistente e data de 30 de fevereiro). `npm run build` parou em `data:build`, com código 1 e os dois diagnósticos apontando arquivo, registro e campo. `next build` chamado direto também parou, por os dados gerados serem de outra versão do conteúdo. O conteúdo foi restaurado e conferido byte a byte |
| Rascunhos não aparecem nas páginas | Atendido | Os 5 rascunhos não estão em `generated/dados/`, não têm página em `out/` e nenhum arquivo de `out/` cita o slug ou o título de algum deles. `verify:export` confere isso a cada build |
| O conjunto aprovado é gerado de forma reproduzível | Atendido | Gerar duas vezes regrava só o relatório técnico, que guarda o horário. Um teste compara os bytes de todos os arquivos de dados entre duas gerações, e outro mostra que formatação, BOM, fim de linha e ordem dos campos não mudam a entrada nem a saída |

### O que foi entregue

- **Leitura e validação** das duas pastas de conteúdo, com diagnósticos em português que dizem arquivo, entidade, `id`, campo e motivo, em três severidades: erro, pendência e aviso.
- **Regra de elegibilidade** explícita, escrita no código e na documentação.
- **Gerador**: `generated/dados/conjunto.json`, `indices.json`, um GeoJSON geral e um por pessoa, mais o manifesto e dois relatórios.
- **Índices** por pessoa, ano, categoria, lugar, `id` e `slug`.
- **Consultas tipadas**, puras, que rodam no build e no navegador.
- **Importação** de pacotes JSON para os rascunhos, com registro de origem e resultado.
- **Cinco comandos**: `data:validate`, `data:build`, `data:report`, `data:import` e `data:query`.
- **Integração**: `npm run dev` e `npm run build` geram os dados antes; as páginas leem só os dados gerados; o build recusa dados de outra versão do conteúdo; o servidor de desenvolvimento regenera ao recarregar a página.
- **Tela de prova com os dados reais**, em `/dev/dados/`, só em desenvolvimento.
- **Relatório de cobertura** da edição 0.1.0, em [DATA-REPORT.md](DATA-REPORT.md).

Passos do plano e situação de cada um:

| Passo | Situação |
| --- | --- |
| 1. Leitura e validação dos arquivos de conteúdo | Feito |
| 2. Identificadores únicos, referências e datas coerentes | Feito |
| 3. Comando que seleciona só os revisados | Feito: `npm run data:build` |
| 4. Índices por pessoa, ano, categoria e lugar | Feito, mais `id` e `slug` |
| 5. Coleções GeoJSON dos acontecimentos com localização | Feito: 27 pontos de 26 acontecimentos |
| 6. Relatório de campos incompletos e referências inválidas | Feito: `npm run data:validate` e `npm run data:report` |
| 7. Importação separada da publicação, chegando como rascunho | Feito: `npm run data:import` |
| 8. Procedimento de atualização e correção | Feito: DATA-PIPELINE.md e content/README.md |

### Números da edição 0.1.0 nos dados gerados

| Item | Quantidade |
| --- | --- |
| Acontecimentos elegíveis | 39 (20 de cada pessoa, 1 compartilhado) |
| Acontecimentos fora da publicação | 5, todos rascunhos com pendência escrita |
| Mandatos e funções, filiações | 15 e 8 |
| Lugares, fontes, imagens | 9, 59 e 2 |
| Pontos no mapa | 27, de 26 acontecimentos. Um acontecimento tem dois lugares |
| Acontecimentos sem ponto | 13: 6 de abrangência nacional e 7 sem lugar documentado |
| Erros, pendências, avisos | 0, 5 e 0 |

### Casos essenciais verificados

| Caso | Onde está o teste |
| --- | --- |
| Revisado válido entra; rascunho e fixture sintética ficam fora | `tests/pipeline.test.ts`, bloco "elegibilidade" |
| Referência inexistente e `id` ou `slug` duplicado geram diagnóstico útil | `tests/pipeline.test.ts`, bloco "referências e identificadores" |
| Datas parciais, datas impossíveis e intervalos incoerentes | `tests/pipeline.test.ts`, bloco "datas" |
| Acontecimento sem coordenadas continua consultável | `tests/queries.test.ts`, bloco "acontecimento sem coordenadas" |
| Vários lugares geram pontos ligados, e o acontecimento aparece uma vez | `tests/map.test.ts` e `tests/queries.test.ts` |
| Filtros combinados e limites de período | `tests/queries.test.ts`, blocos "filtro de acontecimentos" e "mandatos e filiações no período" |
| Repetir a geração preserva a saída | `tests/generate.test.ts`, bloco "reprodução" |
| Falha de validação impede o build e preserva os arquivos editoriais | `tests/generate.test.ts`, bloco "falha de validação", e `tests/reader.test.ts` |

Sete regras foram quebradas de propósito no código, uma por vez, para confirmar que os testes falham: aceitar revisado em `content/drafts/`, tirar a ordenação das chaves, deixar o leitor aceitar dados de outra versão, aceitar o estado declarado na importação, tornar exclusiva a ponta final do período, deixar de tratar dependência quebrada como erro e deixar de apagar arquivo obsoleto. Em todos os casos algum teste falhou. O código foi restaurado.

### Lacunas encontradas na base e como foram resolvidas

Todas pontuais, necessárias para integrar o pipeline:

| Lacuna | Resolução |
| --- | --- |
| Os scripts não tinham como usar os schemas TypeScript (ponto em aberto desde a fase 1) | Node com remoção de tipos e um gancho de resolução, sem dependência nova (D-27) |
| Mensagens de erro do Zod pouco claras em casos comuns, como "esperava um número, recebeu um número" para um valor infinito | Mensagens próprias para campo ausente, campo desconhecido, valor não aceito, lista vazia e número fora do limite |
| Ordenação com `localeCompare`, que depende do idioma da máquina | Comparação pelo código dos caracteres, em um lugar só (`order.ts`) |
| `id` como `constructor` é válido no contrato e confundiria uma busca em objeto comum | Buscas nos índices com `Object.hasOwn` |
| Rascunhos só podiam ser acontecimentos, e a importação precisa guardar também fontes e lugares | `content/drafts/` aceita as sete coleções (D-31) |
| Referência a um registro inválido gerava um segundo erro, de "inexistente" | O segundo erro é suprimido: o problema já está apontado no registro |
| O exemplo de DATA_MODEL.md não tinha o campo `tipo` da revisão | Corrigido |

### Ajustes no que veio das fases anteriores

- `src/lib/content/load.ts` deu lugar a `sources.ts`, `output.ts`, `pipeline.ts` e `published.ts`. As páginas chamam `getAtlasData()`.
- `src/features/map/features.ts` deu lugar a `src/lib/data/points.ts`: os pontos são montados pelo gerador, e o navegador só os recorta.
- `npm run content:coverage` deu lugar a `npm run data:report`.
- Um registro não revisado em `content/published/` deixou de interromper o build: fica fora e aparece como pendência (D-29).
- `engines` passou a exigir Node 22.18, e `tsconfig.json` ganhou `erasableSyntaxOnly`.
- O conteúdo de `content/` não foi alterado.

### Verificações executadas

Todas em 08/10/2026, com Node 24.15.0 no Windows 11.

| Verificação | Resultado |
| --- | --- |
| `npm run data:validate` no conteúdo real | 0 erros, 5 pendências, 0 avisos |
| `npm run data:build`, duas vezes seguidas | 39 acontecimentos e 27 pontos; na segunda vez só o relatório técnico foi regravado |
| `npm run lint` | Sem problemas. As regras de fronteira foram testadas com dois arquivos temporários que as violavam |
| `npm run typecheck` | Sem erros |
| `npm run test` | 266 testes passando, em 14 arquivos |
| `npm run build` | 47 páginas HTML, como na fase 2: início, 2 perfis, 39 acontecimentos, comparar, metodologia e 404 |
| `npm run verify:export` | 39 acontecimentos com página, 5 rascunhos sem página, nenhum dado sintético, nenhuma rota de desenvolvimento |
| `npm run test:e2e` | 20 testes passando: 13 da prova com dados sintéticos e 7 novos com os dados reais |
| Páginas estáticas contra os dados gerados | Cada perfil lista seus 20 acontecimentos em ordem cronológica; as 39 páginas trazem todas as fontes e o aviso de revisão pendente; nenhum rascunho é citado; o Zod e a pasta `generated/` não estão na saída |
| Bloqueio do build com conteúdo quebrado | Descrito no critério de conclusão, acima |
| `npm run data:import` em simulação, no projeto real | 1 pendente e 2 rejeitados, com os motivos; nada gravado |
| `npm run data:query` no projeto real | Recortes por pessoa, período, categoria e lugar, e a leitura de um acontecimento |

### Implementado e não verificado

- **Node 22.** Os comandos foram rodados só no Node 24.15.0. O mínimo declarado, 22.18, vem da documentação do Node.
- **Linux e macOS.** Tudo foi rodado no Windows. Os caminhos usam `node:path` e são gravados com barra normal, mas isso não foi exercitado em outro sistema.
- **WebP simples e sem perdas, AVIF e SVG reais.** A sonda de mídia foi testada com os dois JPEG do projeto e com cabeçalhos montados no teste para PNG, WebP estendido, AVIF e SVG. Os outros dois tipos de WebP estão implementados e não têm teste.
- **Ambiente de hospedagem.** O build com geração de dados não foi rodado em nenhum serviço. É item da fase 10.

### Lacunas herdadas da pesquisa

Não mudaram nesta fase. O pipeline as mostra, e não as resolve.

1. **Revisão humana de todo o conjunto.** Continua sendo a principal. Os 39 acontecimentos, os 15 mandatos, as 8 filiações e os 2 perfis têm revisão `assistida-por-ia`.
2. **Os 5 rascunhos,** com as pendências de cada um (DATA-REPORT.md).
3. **Lacunas de período de Lula:** 1981 a 1985, 1990 a 1993, 1995 a 2001 e 2007 a 2015.
4. **Atuação de Flávio Bolsonaro na Alerj:** de 2003 a 2018 só há eleições.
5. **Cinco das oito filiações com algum limite desconhecido.** As consultas por período as devolvem como incertas.
6. **Todos os lugares são aproximações:** centro de município ou de estado. Sete acontecimentos não têm lugar documentado.
7. **Nenhum acontecimento tem imagem.** Só os dois retratos.
8. **Trechos de evidência:** as 160 citações dos registros publicados têm trecho registrado em `docs/evidencias/`, mas a conferência é a fotografia de 8 de outubro de 2026. Não há comando que a repita.
9. **Conteúdo no meio de uma eleição:** o segundo turno é em 25 de outubro de 2026, depois da data de corte.
10. **Decisões do responsável pelo projeto:** quem assina a revisão humana, canal público de correção e as divergências entre documentos (CONTENT-REVIEW.md).

### Limitações desta entrega

- **Promover um rascunho é manual:** editar o estado e mover o registro entre dois arquivos. A validação pega o erro, mas não faz a movimentação (D-36).
- **A importação não atualiza registro existente.** Conflito de `id` é recusa.
- **Não há coletor de sites nem integração recorrente.**
- **Os dados não têm endereço próprio no site.** Chegam ao navegador pelas páginas. Se a fase 6 quiser que o mapa busque o GeoJSON por endereço, é preciso copiá-lo para `public/` no build (D-28).
- **A interface continuava estrutural** ao fim da fase 3. A fase 4 a substituiu.
- **O site continua com `noindex`** e não foi publicado.

## Fase 2 (pesquisa e primeiro conjunto de conteúdo)

Concluída em 08/10/2026. O critério do plano era "cada item publicado tem evidência para suas afirmações, data com precisão definida e revisão registrada", e foi atendido com uma ressalva: toda revisão é assistida por IA, e nenhuma revisão humana foi feita nem registrada. O plano coloca a revisão humana da coleção final na fase 9.

O que foi entregue:

- **39 acontecimentos conferidos** em `content/published/acontecimentos.json`: 20 de Lula (1975 a 2026) e 20 de Flávio Bolsonaro (2002 a 2026), sendo um compartilhado.
- **5 rascunhos** em `content/drafts/acontecimentos.json`, cada um com a pendência escrita.
- **15 mandatos e funções**, **8 filiações partidárias**, **9 lugares**, **59 fontes** e **2 imagens**.
- **Edição 0.1.0**, com data de corte em 08/10/2026.
- Documentação: [SOURCES.md](SOURCES.md), [EDITORIAL.md](EDITORIAL.md), [CONTENT-REVIEW.md](CONTENT-REVIEW.md) e a lista de trechos em `docs/evidencias/`.

Bloqueios de acesso, detalhados em SOURCES.md: a Assembleia Legislativa do Rio de Janeiro não expõe legislaturas antigas; a biografia atual do presidente no Planalto estava bloqueada; o TSE não tem arquivos de candidaturas anteriores a 1994.

O que a fase 2 pediu à fase 3, e o que foi feito:

| Pedido | Situação |
| --- | --- |
| Promoção de rascunho para publicado | Continua manual, agora com procedimento escrito e validação que acusa o passo esquecido (D-36) |
| Validar os rascunhos junto com o conjunto publicado | Feito: as duas pastas são lidas e validadas juntas |
| Verificador de evidências como comando | Não feito (D-36). O relatório informa quantas citações têm trecho registrado |
| Índices por pessoa, ano, categoria e lugar, e GeoJSON | Feito |
| Relatório de campos incompletos e de referências sem uso | Feito: avisos de fonte, lugar e imagem sem uso |
| Como os scripts importam os schemas TypeScript | Resolvido (D-27) |
| Conferência dos itens do registro de alterações | Feito, como aviso |

## Fase 1 (arquitetura e fundação)

Concluída em 08/10/2026 e registrada no commit `9be1013`. O que ela entregou está em ARCHITECTURE.md, DATA_MODEL.md e DECISIONS.md. Pontos da fase 1 que seguem abertos:

- O mapa só foi verificado em Chromium sem interface, inclusive na fase 4. Falta abrir a exploração em uma janela visível do Chrome.
- Firefox, Safari, celular real e leitor de tela não foram testados.
- Hospedagem real, incluindo o tipo MIME de `.mjs`, fica para a fase 10.
- `npm audit`, conferido de novo em 08/10/2026: nenhuma vulnerabilidade em produção; 5 altas na cadeia do lint, que não vai para o site.
- A próxima versão maior do Next deve ligar Cache Components para todos (DECISIONS.md, D-02).
- O plano de desenvolvimento continua fora do repositório, em `Downloads/`.

## Próximo passo

Fase 6: mapa sincronizado. A fase 5 termina aqui; a fase 6 só começa com o próximo comando. Nada foi publicado, e o site continua com `noindex`.
