# Status

Atualizado em 9 de outubro de 2026.

| Fase do plano | Situação |
| --- | --- |
| 1. Arquitetura e fundação | Concluída em 08/10/2026 |
| 2. Pesquisa e primeiro conjunto de conteúdo | Concluída em 08/10/2026, com revisão assistida por IA e pendências listadas abaixo |
| 3. Camada de dados e preparação do backend | Concluída em 08/10/2026 |
| 4. Experiência e direção visual | Concluída em 08/10/2026, com prévia navegável |
| 5. Aplicação e linha do tempo | Concluída em 09/10/2026, com pendências e itens não verificados listados abaixo |
| 6. Mapa sincronizado | Concluída em 09/10/2026, com pendências e itens não verificados listados abaixo |
| 7. Comparação, páginas e fontes | Concluída em 09/10/2026, com pendências e itens não verificados listados abaixo |
| 8. Acabamento visual e desempenho | Concluída em 09/10/2026, com medições de laboratório e pendências listadas abaixo |
| 9. Revisão editorial, testes e validação com pessoas | Parte editorial e técnica feita em 09/10/2026, com assistência de IA. **Validação com pessoas pendente** e revisão humana do conteúdo pendente |
| 10. Publicação e apresentação | Não iniciada |

## Fase 9 (revisão editorial, testes e validação com pessoas)

A fase tem duas partes, e elas estão em situações diferentes.

| Parte | Situação |
| --- | --- |
| Editorial e técnica | **Feita em 09/10/2026, com assistência de IA.** As 60 fontes foram abertas de novo, cada registro foi relido contra os documentos, as jornadas rodaram sobre a exportação estática e os problemas encontrados foram corrigidos |
| Validação com três pessoas | **Pendente.** O roteiro e as fichas estão prontos em [USER-VALIDATION.md](USER-VALIDATION.md). Nenhuma sessão foi feita |
| Revisão humana do conteúdo | **Pendente**, como desde a fase 2. O roteiro está em [EDITORIAL-REVIEW.md](EDITORIAL-REVIEW.md) |

Os três registros da fase: [EDITORIAL-REVIEW.md](EDITORIAL-REVIEW.md), com o conjunto revisado, a conferência fonte por fonte, as correções e as pendências; [QA.md](QA.md), com o ambiente, as jornadas, os checks e as evidências; e [USER-VALIDATION.md](USER-VALIDATION.md), com o roteiro e as fichas. As decisões novas vão de D-87 a D-90, em [DECISIONS.md](DECISIONS.md).

A fase 9 não tem commit: o trabalho está na pasta, junto com o da fase 8.

### Critério de conclusão do plano

"A jornada principal passa, não há informação publicada sem sustentação identificada e as pendências restantes não prejudicam leitura ou interpretação." O pedido da fase acrescentou: validação com pessoas registrada quando efetivamente realizada.

| Parte do critério | Situação | Como foi conferido |
| --- | --- | --- |
| Jornada principal funcionando | Atendido, em emulação | 184 testes de navegador sobre a exportação estática, 205 no servidor de desenvolvimento e a jornada principal percorrida no Chrome e no Edge instalados, com a placa de vídeo. Nenhum aparelho real |
| Informações publicadas com sustentação identificada | Atendido com assistência de IA | 60 de 60 fontes acessadas, e 398 de 398 trechos de evidência encontrados nos documentos de 9 de outubro. A leitura de cada registro contra os trechos foi feita por IA. Nenhuma pessoa a refez |
| Pendências sem prejuízo à leitura ou à interpretação | Atendido para o que a IA consegue julgar | As leituras enganosas encontradas foram corrigidas (cargos chamados só de "Presidente", nota dos cargos em data parcial, anos do eixo ilegíveis). O juízo final sobre interpretação é da revisão humana |
| Validação com pessoas registrada quando realizada | **Não realizada** | Roteiro pronto, fichas em branco. Nada foi inventado |

### Passos do plano e situação de cada um

| Passo | Situação |
| --- | --- |
| 1. Revisar a coleção final contra as fontes | Feito com assistência de IA: 39 acontecimentos, 15 cargos, 8 filiações, 2 perfis, 9 lugares, 60 fontes e 2 imagens. 14 correções |
| 2. Conferir todos os links de evidência e registrar a data | Feito em 9 de outubro de 2026. Oito endereços trocados, uma fonte acrescentada, nenhuma indisponível. Quadro fonte por fonte em EDITORIAL-REVIEW.md |
| 3. Testar regras de datas, períodos, filtros e integridade | Feito: 502 testes. Seis novos, para o fuso do aparelho, a igualdade entre as vistas do conteúdo real, o catálogo de fontes e o nome dos cargos |
| 4. Testar escolha de pessoa, seleção, sincronização do mapa e comparação | Feito sobre a exportação estática |
| 5. Testar acesso direto, recarregamento e voltar/avançar | Feito. Achou um defeito que só existia no build |
| 6. Conferir teclado, foco, contraste, movimento reduzido e leitura em celular | Feito em emulação, com um comando novo, `npm run audit:a11y`. Achou os anos do eixo ilegíveis sob a hachura. Leitor de tela e celular real não foram usados |
| 7. Testar falha do mapa e conteúdo sem coordenadas | Feito, com um teste novo para o navegador sem WebGL nas telas reais |
| 8. Três pessoas encontram um episódio e conferem a fonte | **Não feito.** Depende de pessoas. Roteiro pronto |

### O que foi entregue

- **Conteúdo na edição 0.1.1,** com a mesma data de corte, 8 de outubro de 2026. O registro de alterações traz a entrada de 9 de outubro, com 32 registros afetados.
- **Conferência das fontes com data real:** `acessadoEm` de 9 de outubro de 2026 nas 60 fontes; `docs/evidencias/provas-2026-10-09.json`, com 169 citações e 398 trechos; `docs/evidencias/conferencia-2026-10-09.json`, com o acesso a cada fonte.
- **Endereços do TSE que abrem a ficha.** Os sete cadastrados respondiam, mas mostravam uma página de erro.
- **Nome dos cargos que se explica sozinho,** e a nota dos cargos da página do acontecimento com a precisão da data.
- **Anos do eixo legíveis** com um período escolhido.
- **Link com consulta inválida sem a espera de 6 segundos** no build.
- **Jornadas sobre a exportação estática:** `npm run test:journeys`.
- **Passagem de acessibilidade:** `npm run audit:a11y`, com capturas e relatório.
- **Metodologia pública atualizada:** a regra da data do fato e da data da notícia, e o que foi feito na última conferência.
- **Roteiro da validação com três pessoas,** com tarefas, gabarito para quem aplica, perguntas e fichas.
- **Roteiro da revisão humana,** passo a passo.

### Arquivos

Comparação com o estado da fase 8: 76 arquivos, dos quais 35 são as capturas e o relatório de `docs/capturas/fase-9/`.

| Onde | O quê |
| --- | --- |
| `content/published/` | `fontes.json`, `acontecimentos.json`, `mandatos.json`, `filiacoes.json`, `pessoas.json`, `imagens.json` e `edicao.json`. Toda mudança passou pelo pipeline e está em `alteracoes` |
| `docs/` | Novos: EDITORIAL-REVIEW.md, QA.md, USER-VALIDATION.md, `evidencias/provas-2026-10-09.json`, `evidencias/conferencia-2026-10-09.json` e `capturas/fase-9/`. Atualizados: CONTENT-REVIEW.md, SOURCES.md, EDITORIAL.md, PAGES.md, TIMELINE.md, DECISIONS.md, DATA-REPORT.md, STATUS.md, `evidencias/README.md` e `capturas/README.md` |
| `src/` | `lib/state/AtlasUrlStateProvider.tsx` (ordem da revelação do link com consulta), `components/time/PeriodShade.tsx`, `components/time/TimeAxis.tsx` e `features/timeline/Timeline.tsx` (hachura acima dos anos), `app/acontecimentos/[slug]/page.published.tsx` (nota dos cargos) e `app/metodologia/page.tsx` |
| `tests/` | Novo: `e2e/map-package.ts`. Atualizados: `content.test.ts`, `dates.test.ts` e, em `e2e/`, `linha-do-tempo.spec.ts`, `mapa.spec.ts`, `paginas.spec.ts`, `acabamento.spec.ts` e `previa.spec.ts` |
| `scripts/` | Novo: `audit-a11y.mjs` |
| Raiz | `package.json` (dois comandos: `test:journeys` e `audit:a11y`), `playwright.export.config.ts` (projeto das jornadas), README.md e `.claude/project-state.md` |

Nenhuma dependência foi acrescentada. Nenhum acontecimento foi incluído ou retirado. Nenhuma cor, fonte ou tela foi criada.

### Problemas achados e corrigidos

Cada um com causa, mudança e verificação em [EDITORIAL-REVIEW.md](EDITORIAL-REVIEW.md), seção Correções, e em [QA.md](QA.md), seção Falhas encontradas e correções.

| Problema | Correção |
| --- | --- |
| Sete endereços de fichas do TSE abriam "Erro ao carregar a página" | Endereços no formato atual, abertos em navegador |
| Dois trechos sobre a candidatura de Geraldo Alckmin em 2006 eram atribuídos à ficha de Lula | A ficha de Alckmin entrou como fonte |
| O serviço de lideranças do Senado é anunciado como descontinuado | Endereço do substituto, com os mesmos registros |
| Título de uma reportagem, autoria de cinco notícias e data de uma ficha não conferiam com as páginas | Corrigidos como as páginas mostram |
| O registro de 2016 dava a data da notícia do STF como a da decisão | O texto diz que a data é a da publicação |
| O contexto da sentença de 2017 afirmava a confirmação em segunda instância sem citação | Citação acrescentada |
| Dois episódios judiciais de 2018 não traziam a manifestação da defesa, que as fontes trazem | Acrescentada ao contexto |
| O desfecho da denúncia de 2020 vinha de uma reportagem, sem atribuição | Atribuído ao veículo, com a data |
| O perfil de Lula não trazia o nascimento, que o de Flávio Bolsonaro traz | Mês e ano, em que os documentos concordam; a divergência no dia está registrada |
| O início de uma liderança tinha um dia que o registro do Senado não confirma | Precisão de mês, com os dois dias escritos no texto |
| Três cargos de Lula apareciam como "Presidente" na página do acontecimento e na linha do tempo | "Presidente do Sindicato dos Metalúrgicos" e "Presidente do PT" (D-89) |
| A nota dos cargos dizia "na data do acontecimento" mesmo com só o ano documentado | "Na data", "no mês" ou "no ano" |
| Com um período escolhido, os anos do eixo ficavam sob a hachura, com contraste de 1,6:1 | A hachura para acima dos anos (D-88). Contraste de 8:1 |
| No build, um link com consulta inválida deixava a tela encoberta por 6 segundos | Ordem dos efeitos corrigida (D-87) |
| Quatro testes de falha do mapa não testavam nada no build | Auxiliar que reconhece o pacote nos dois ambientes |

### Verificações executadas

Todas em 9 de outubro de 2026, depois da última mudança.

| Verificação | Resultado |
| --- | --- |
| `npm run data:validate` | 0 erros, 0 avisos, 5 pendências (os rascunhos) |
| `npm run check` | Passou: lint, tipos, 502 testes em 24 arquivos, build e conferência da saída (276 arquivos, 47 páginas) |
| `npm run test:journeys` | 184 passando, sobre a exportação estática |
| `npm run test:export` | 16 passando |
| `npm run test:e2e` | 205 passando |
| `npm run audit:a11y` | 32 telas e 8 passagens de teclado, sem problema |
| Conferência das fontes | 60 de 60 acessadas; 398 de 398 trechos encontrados |
| Jornada principal no Chrome 154 e no Edge 154 instalados | 25 de 25 passos em cada um |
| Capturas | 32 telas do build final, olhadas, mais o antes e o depois do eixo |

Dois testes novos foram provados ao contrário, o do fuso e o da hachura: com a regra quebrada de propósito, falharam. Os de endereço inválido falhavam no build antes da correção. O desempenho não foi medido de novo: as mudanças não tocam o que PERFORMANCE.md mede (QA.md, seção Desempenho).

### Implementado e não verificado

- **Aparelho móvel real.** Não havia um disponível. Todo o celular desta fase é emulado.
- **Firefox e Safari.** As versões instaladas com o Playwright são de outra versão da ferramenta e não abrem. Nada foi instalado.
- **Leitor de tela** e zoom do navegador a 200% e 400%.
- **Uso por pessoas.** É a parte pendente da fase.
- **Interpretação dos textos.** A IA procurou afirmação sem apoio e leitura enganosa. Se o atlas interpreta bem cada fonte, quem julga é a revisão humana.
- **Totalização final do primeiro turno de 2026.** O registro usa os números da apuração, e diz isso.
- **Hospedagem.** Tudo rodou no servidor local.

### Pendências reais

1. **Validação com três pessoas.** Aplicar o roteiro de USER-VALIDATION.md, com pelo menos uma sessão em celular de verdade, e registrar o que acontecer.
2. **Revisão humana do conteúdo.** A política do projeto é que a publicação depende dela. A decisão de publicar sem ela, se for o caso, é do responsável.
3. **Fim da filiação de Flávio Bolsonaro ao Republicanos:** o mês vem da combinação de dois documentos. Decisão para a revisão humana.
4. **Firefox e Safari,** antes de publicar: `npx playwright install firefox webkit` e as jornadas nesses navegadores, o que pede um projeto a mais na configuração do Playwright.
5. **Texto sob a hachura na comparação** (D-88): fica velado de propósito. Rever se a validação mostrar dificuldade.
6. **Alvos de toque de 24 pixels** nas marcas da linha do tempo, e o nome do atlas com 22 pixels de altura no cabeçalho (QA.md).
7. **Conferência das fontes como comando do projeto.** Hoje depende de ferramentas escritas na sessão.
8. **Os 5 rascunhos,** com as pendências de cada um.
9. **Herdadas das fases anteriores, sem mudança:** canal público de correção, domínio, nome definitivo, política de segurança de conteúdo, abertura da vista do mapa em rede lenta e as demais da lista da fase 8, abaixo.

### Preparação para a fase 10 (publicação e apresentação)

A fase 10 só começa com um pedido. Antes dela, o que depende de pessoas: a validação com três pessoas e a decisão sobre a revisão humana.

| Passo da fase 10 | O que já existe | O que falta |
| --- | --- | --- |
| 1. Confirmar a hospedagem estática | Exportação estática conferida, com servidor local que se comporta como uma hospedagem comum | Escolher a hospedagem e ler as condições vigentes |
| 2. Metadados, imagens de compartilhamento, sitemap e endereço canônico | Títulos e descrições por página | Domínio, `metadataBase`, sitemap e imagem de compartilhamento (D-69) |
| 3. Build final e conferência da saída | `npm run check`, `npm run test:journeys`, `npm run test:export` e `npm run audit:a11y` | Rodar de novo no dia |
| 4. Publicar | Nada: o projeto é local, sem repositório remoto | Só com pedido |
| 5. Conferir páginas e links no endereço público | As jornadas rodam contra o servidor local | Conferir no endereço público, à mão ou com a base das jornadas trocada na configuração; conferir o 404 e o cache da hospedagem |
| 6. Demonstração de 20 a 30 segundos | Roteiro de demonstração em UX.md | Gravar |
| 7. Case | Documentação por fase | Escrever, dizendo com clareza que a revisão foi assistida por IA e o que a validação com pessoas mostrou |
| 8. Textos para redes | Nada | Só com pedido |

Pontos de atenção para quem continuar:

- O case não pode dizer que o conteúdo teve revisão humana, nem que o atlas foi validado com pessoas, enquanto as duas coisas estiverem pendentes.
- Mexeu em efeito do React, rode `npm run test:journeys`: o servidor de desenvolvimento esconde defeito de ordem de efeitos.
- O servidor do TSE recusa pedidos sem cabeçalhos de navegador. Uma conferência automática de links, na hospedagem ou em uma integração contínua, vai acusar erro em fontes que abrem normalmente.
- Seis fontes são documentos vivos. Na próxima edição, a data do documento e o conteúdo podem ter mudado.

## Fase 8 (acabamento visual e desempenho)

Entrega: o acabamento da interface e o desempenho medido em build de produção. Retratos em versões preparadas, com o mesmo enquadramento nos dois perfis; a leitura com o título como âncora; a comparação com as faixas na primeira tela; transições curtas, que acompanham a seleção sem segurar o estado; o mapa carregado só quando vai ser usado; a saída estática corrigida; o link com consulta sem a tela errada; e as medições antes e depois. As condições e os resultados estão em [PERFORMANCE.md](PERFORMANCE.md); o movimento e os estados, em [INTERACTIONS.md](INTERACTIONS.md); a escala e os componentes, em [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md); as decisões, em [DECISIONS.md](DECISIONS.md), de D-74 a D-86; as capturas, em [capturas/fase-8/](capturas/README.md).

Para abrir a versão de produção: `npm run build`, `npm run preview` e `http://localhost:4311/`. Em desenvolvimento: `npm run dev` e `http://localhost:3000/`.

### Critério de conclusão do plano

"O fluxo principal permanece legível e responsivo; animações ajudam a acompanhar a seleção; a entrada e as páginas de leitura funcionam sem depender do carregamento do mapa." As metas do plano: "buscar LCP até 2,5 segundos e CLS até 0,1 em medições documentadas", com os resultados de laboratório identificados como tais e o INP deixado para a observação de uso e para os dados de campo.

O pedido da fase escreveu o critério com uma parte a mais: "fluxo principal legível e responsivo, transições que ajudam a acompanhar a seleção, conteúdo acessível sem esperar o mapa e desempenho documentado com medições reais". A tabela segue esta versão.

| Parte do critério | Situação | Como foi conferido |
| --- | --- | --- |
| Fluxo principal legível e responsivo | Atendido em emulação | A jornada inteira (abrir, escolher a pessoa, mudar o período, abrir um acontecimento, ver a fonte e ir à comparação) passa em teste, em 1440×900 e em 390×844. Nas quatro larguras pedidas, 1440×900, 768×1024, 390×844 e 360×800, nenhuma das sete telas rola para o lado e o título cabe na largura; em 360×800, os controles da jornada têm 44 pixels de altura ou mais. As 39 capturas do build foram olhadas uma a uma. Nenhum aparelho real foi usado |
| Transições que ajudam a acompanhar a seleção | Atendido | Com o movimento ligado, os testes conferem que o endereço e a tela mudam no clique, que seleções e filtros em sequência rápida deixam só o último estado, que a lista rola até o item escolhido em outra parte sem mover a página e que o foco vai para o título da leitura em celular. Quadros tirados no meio das transições, com a placa de vídeo, mostram a leitura já no lugar 50 ms depois do clique, a lista a caminho do item e o anel no marcador e na marca |
| Conteúdo acessível sem esperar o mapa | Atendido | Sobre o build, pelos pedidos reais: a entrada, a comparação, a metodologia e a página 404 não pedem nada do mapa; a exploração em celular só o pede quando a vista **Mapa** é aberta; a página do acontecimento mostra o texto antes, e em celular o mapa espera a rolagem chegar perto |
| Desempenho documentado com medições reais | Atendido, com resultados de laboratório | PERFORMANCE.md, com as condições, o que cada número é e o que ele não é, antes e depois medidos na mesma rodada. Nas cinco telas e nos dois perfis, o LCP ficou entre 320 e 1.612 ms, para uma meta de 2,5 segundos, e o CLS, em no máximo 0,022, para uma meta de 0,1. São resultados de laboratório, com celular emulado |

### Passos do plano e situação de cada um

| Passo | Situação |
| --- | --- |
| 1. Refinar abertura, tipografia, imagens e hierarquia dos detalhes | Feito: cartões da entrada antes dos números em tela estreita, retratos com o mesmo enquadramento, título maior que a data na leitura, cabeçalho do perfil com o retrato ao lado do nome, faixas da comparação na primeira tela (D-74, D-82) |
| 2. Ajustar transições de pessoa, período e acontecimento | Feito, só com CSS e sem dependência nova: vista, recorte, troca de pessoa, marcadores, marcas, hachura do período e entrada do mapa (D-80) |
| 3. Carregar o mapa quando necessário e reduzir seu peso na entrada | Feito. A entrada nunca pediu o mapa; a página do acontecimento deixou de carregá-lo abaixo da primeira tela, e o pacote passou a ser aquecido por intenção (D-76) |
| 4. Otimizar imagens localmente antes do build e manter dimensões definidas | Feito: `npm run images`, nove versões WebP por retrato, dimensões declaradas e conferência no build (D-74, D-75) |
| 5. Garantir funcionamento com movimento reduzido | Feito, com teste: transições, aviso de carregamento e rolagem ficam sem movimento, e os estados são os mesmos |
| 6. Medir carregamento, estabilidade visual e resposta dos controles | Feito: `npm run measure`, com os dois builds alternados (D-84) |
| 7. Conferir em computador e em um aparelho móvel real, quando disponível | Feito só em emulação. Não havia aparelho móvel disponível, e o navegador foi um Chromium sem interface. Fica para a fase 9 |

### O que foi entregue

- **Retratos preparados:** nove versões WebP de cada retrato, por moldura e por largura, de 1 a 53 KB, no lugar dos JPEG de 215 e de 290 KB. O enquadramento põe a linha dos olhos na mesma altura e o rosto no mesmo tamanho nos dois perfis. O original, a autoria e as condições de uso não mudaram.
- **Abertura:** em tela estreita, os dois cartões vêm antes dos números da edição e cabem na primeira tela nas quatro larguras.
- **Hierarquia da leitura:** no painel e na página do acontecimento, o título é o maior elemento, e a data continua acima dele, forte e em números de mesma largura. O perfil ganhou um cabeçalho com o retrato ao lado do nome.
- **Comparação:** as faixas vêm logo abaixo do recorte, e as notas de leitura, depois delas e antes das colunas. O cabeçalho ficou menor em celular.
- **Continuidade da seleção:** a lista rola até o item escolhido no mapa, na linha do tempo ou pelo endereço, por dentro dela; o perfil continua montado sob a leitura e volta como estava.
- **Transições:** vista que entra, recorte que muda, troca de pessoa, marcadores e marcas que entram no recorte, hachura do período e entrada do mapa. Só CSS, 120 e 180 ms, depois da primeira ação da pessoa.
- **Mapa sob demanda:** montagem a até 400 px da área visível, aquecimento por intenção no botão da vista **Mapa**, moldura com o tamanho final e aviso de carregamento com um traço que vai e volta.
- **Link com consulta:** a área que depende da consulta fica encoberta, com o aviso "Abrindo a consulta do endereço…", até o endereço ser lido. Vale para a exploração e para a comparação.
- **Saída estática ajustada** depois do build: arquivos de navegação no nome que o navegador pede, 4,5 MB de arquivos do MapLibre sem uso retirados, pré-carregamento da fonte nas páginas de acontecimento. A saída foi de 14,5 MB para 10,3 MB.
- **Navegação por intenção:** o roteador só adianta o destino dos cartões da entrada; menu, nome do atlas e **Comparar as trajetórias** adiantam quando a pessoa aponta (`IntentLink`).
- **Fontes:** o itálico serifado, sem uso, saiu. Duas estratégias de pré-carregamento foram medidas e descartadas.
- **Estado com identidade estável:** selecionar e fechar um acontecimento deixaram de refazer o que não mudou.
- **Medição:** `npm run measure` e `npm run measure:report`, com o resultado bruto em `docs/desempenho/`.
- **Testes sobre o build:** `npm run test:export`, que confere o que cada página pede e quando.
- **Capturas** do build, antes e depois, nas quatro larguras: `npm run capture:finish`.

### Arquivos

Comparação com o estado da fase 7: 61 arquivos de código e de documentação (14 novos, 46 alterados e 1 removido), mais 8 arquivos de medição, 18 versões de retrato e 78 capturas.

| Onde | O quê |
| --- | --- |
| `docs/` | Novos: PERFORMANCE.md, `desempenho/` (8 arquivos de medição) e `capturas/fase-8/` (39 imagens, mais as 39 de `antes/`). Atualizados: ARCHITECTURE.md, COMPARISON.md, DECISIONS.md, DESIGN-SYSTEM.md, INTERACTIONS.md, MAP.md, TIMELINE.md, UX.md, STATUS.md e `capturas/README.md` |
| `scripts/` | Novos: `images.mts`, `images.config.json`, `finalize-export.mjs`, `measure.mjs` e `measure-report.mjs`. Atualizados: `preview.mjs` (pasta e porta por variável, gzip, `ETag` e cache) e `check-export.mjs` |
| `public/media/derivados/` | Novo: 18 arquivos WebP, gerados por `npm run images` |
| `src/lib/media/` | Novos: `portraits.ts` (molduras, larguras e caminhos das versões) e `portraits.manifest.json` |
| `src/lib/state/` | `AtlasUrlStateProvider.tsx`: identidade estável do recorte e retirada da marca do link com consulta |
| `src/components/` | Novo: `IntentLink.tsx`. Atualizados: `Portrait.tsx`, `PersonCard.tsx`, `ProfilePanel.tsx`, `SiteNav.tsx`, `SiteHeader.tsx`, `SiteFooter.tsx` e `time/PeriodShade.tsx` |
| `src/features/` | `map/MapView.tsx`, `map/PlaceMarker.tsx`, `map/base/README.md`, `events/EventPanel.tsx`, `timeline/Timeline.tsx`, `timeline/EventMarks.tsx` e `timeline/PeriodContext.tsx` |
| `src/app/` | `layout.tsx`, `globals.css`, `page.tsx`, `not-found.tsx`, `politicos/[slug]/Explorer.tsx`, `comparar/Comparison.tsx`, `acontecimentos/[slug]/page.published.tsx`, `acontecimentos/[slug]/EventReturn.tsx`, `metodologia/page.tsx`, `dev/previa/page.dev.tsx` e `fonts/README.md`. Removido: `fonts/newsreader-latin-italic.woff2` |
| `tests/` | Novos: `portraits.test.ts`, `e2e/acabamento.spec.ts`, `export/carregamento.spec.ts` e `export/acabamento.capture.ts`. Atualizados: `e2e/previa.spec.ts` e `e2e/prova.spec.ts` |
| Raiz | `package.json` (seis comandos novos e o `sharp`), `package-lock.json`, `playwright.export.config.ts` (novo), `next.config.ts` (só comentário), README.md, `content/README.md` (nota sobre os retratos) e `.claude/project-state.md` |

Nenhum registro de `content/` foi alterado. Uma dependência foi declarada, de desenvolvimento: o `sharp`, que já estava instalado como parte do Next (D-85). Nenhuma cor e nenhuma família tipográfica foram criadas. As capturas das fases 4 a 7 não foram refeitas.

### Jornada implementada e o que segue em demonstração

Implementado, com dados reais e teste de navegador:

- A jornada principal, do começo ao fim, em computador e em celular.
- Abertura nas quatro larguras, com os dois cartões inteiros na primeira tela e do mesmo tamanho.
- Retratos na mesma moldura, com as dimensões declaradas e as versões certas para cada largura.
- Título como âncora no painel e na página; faixas da comparação na primeira tela.
- Seleção vinda da lista, da linha do tempo, do mapa e do endereço, com as partes no mesmo acontecimento.
- Transições com o movimento ligado e com movimento reduzido.
- Link com consulta na exploração e na comparação: encoberto, revelado, sem consulta, e a saída quando o código da página não chega.
- Mapa indisponível e página do acontecimento aberta direto, que já vinham das fases 6 e 7, conferidos de novo no build e nas capturas.
- Sobre o build: o que cada página pede, o mapa adiado, os retratos e a navegação.

Em demonstração, com o contrato de cada um em INTERACTIONS.md, sem mudança nesta fase: canal de correção, endereço público, fonte indisponível, imagem de acontecimento, rótulos da base e lugares fora da América do Sul.

### O que a fase 7 deixou para esta fase

| Ponto | Como ficou |
| --- | --- |
| Acabamento do perfil, da metodologia e da barra do recorte da comparação | O perfil ganhou cabeçalho e ritmo próprios. A comparação mostra as faixas primeiro e tem o cabeçalho menor em celular. A metodologia foi conferida nas quatro larguras e ficou como estava |
| Rever as transições com a comparação e com as páginas novas | Feito (D-80). A comparação e as páginas de leitura não ganharam transição de entrada: continuam com as de cor, de foco e da seta dos blocos que abrem |
| Medir o peso do pacote do mapa e tirar do build o worker de desenvolvimento do MapLibre | Feito: o peso está em PERFORMANCE.md, e os seis arquivos sem uso saem depois do build (D-77) |
| Conferir formato e peso das imagens | Feito (D-74) |
| Conferir o movimento reduzido no que a fase acrescentar | Feito, com teste |
| LCP, CLS e resposta dos controles, com o resultado identificado como de laboratório | Feito (PERFORMANCE.md) |
| Abrir em uma janela visível e em um celular | Não feito: não havia aparelho, e o navegador foi um Chromium sem interface. As medições e os quadros das transições usaram a placa de vídeo da máquina |
| Pendência 8 da fase 7: estado inicial por um instante | Resolvida para a exploração e a comparação (D-83). Nos links de retorno da página do acontecimento, a página não é encoberta: o contexto só muda os links |
| Pendência 11 da fase 7: pedidos de pré-carregamento com 404 na saída estática | Resolvida (D-77) |
| Ponto de atenção da fase 6: quadro opaco sobre o mapa parado, que não se sabia se acontecia com placa de vídeo | Conferido com a placa de vídeo: um quadro opaco aberto sobre o mapa não apaga a base. Por software, no mesmo roteiro, apaga. O defeito é do desenho por software, e o fundo a 98% continua porque é assim que os testes rodam (MAP.md) |

### Problemas achados na conferência e corrigidos

A conferência começou pelo build da fase 7: capturas das telas nas quatro larguras e uma medição completa, antes de qualquer mudança. Depois, cada mudança foi medida contra esse build.

| Problema | Correção |
| --- | --- |
| Na entrada em celular com rede lenta, o maior elemento da tela era um retrato JPEG de até 290 KB, que só terminava de chegar depois de 4 segundos | Versões WebP por moldura e por largura, com prioridade só nos dois cartões |
| As duas fotos oficiais têm cortes diferentes: na mesma moldura, um rosto ficava maior do que o outro | Enquadramento definido para cada retrato, com o mesmo critério |
| Toda página com link para a entrada baixava os retratos dos cartões sem mostrá-los | `Portrait` passou a ser componente de cliente (D-75), com teste sobre o build |
| No build feito no Windows, os arquivos de navegação saíam em pastas e o navegador os pedia com pontos: 404, e a troca de página recarregava o documento | Renomeados depois do build (D-77) |
| Corrigido o 404, cada página passou a baixar e a processar o destino de todos os links visíveis | Pré-carregamento por intenção (D-78) |
| O build publicava 4,5 MB de arquivos do MapLibre que nenhuma página pede | Retirados depois do build |
| As 39 páginas de acontecimento saíam sem o pré-carregamento da fonte da interface | Completado depois do build |
| A página do acontecimento carregava o mapa mesmo com ele abaixo da primeira tela | O mapa só é montado a até 400 px da área visível |
| O trecho de script do link com consulta, posto no começo do `<body>`, atrasava o primeiro desenho de todas as telas, de 40 a 140 ms no perfil de celular | Passou para o fim do `<body>` |
| Abrir um acontecimento refazia os pontos do mapa, os lugares, o agrupamento e as contagens, sem nada ter mudado; fechar reconstruía o perfil | Identidade estável do recorte e perfil montado sob a leitura (D-81) |
| Escolher um acontecimento no mapa ou na linha do tempo não levava a lista até o item | A lista rola até ele, por dentro, sem mover a página |
| Em celular, os cartões da entrada ficavam cortados no fim da primeira tela | Cartões antes dos números da edição |
| Na comparação, quatro parágrafos empurravam as faixas para fora da primeira tela, em qualquer largura | Faixas logo abaixo do recorte |
| Na leitura, a data era o maior elemento e disputava com o título | Título maior do que a data (D-82) |
| Quem abria um link com consulta via primeiro a lista inteira e o perfil, e só depois o que o link pedia | Área encoberta, com aviso, até o endereço ser lido (D-83) |
| O servidor de pré-visualização não mandava validadores de cache nem compressão, e as medições não pareciam com as de uma hospedagem | `scripts/preview.mjs` passou a responder com gzip, `ETag` e cache longo |
| O itálico da Newsreader, de 143 KB, era publicado sem que nenhuma página o usasse | Arquivo removido |
| Medidos em momentos diferentes, os mesmos arquivos davam resultados até 50% diferentes | Os dois builds são medidos na mesma rodada, com as execuções alternadas (D-84) |
| O medidor deixava o worker do mapa (141 KB) fora do peso transferido, porque o navegador informa corpo de tamanho zero para o script de um worker | O medidor passou a usar o tamanho declarado pelo servidor, e a medição final foi refeita |
| Com movimento reduzido, se o código da página não chegasse, o aviso "Abrindo a consulta do endereço…" continuava sobre a tela depois dos 6 segundos. A regra geral de movimento reduzido trocava a duração zero por 0,01 ms, e o aviso não chegava ao estado final | As duas regras do link com consulta ficaram fora da redução de movimento. O defeito foi achado quando o teste passou a esperar a tela aparecer de fato, em vez de conferir só a configuração |
| O teste que protegia a D-75 passava com a regra quebrada: desde o pré-carregamento por intenção, a metodologia não busca mais a entrada sozinha, e o teste não exercitava nada | O teste passou a levar o ponteiro ao nome do atlas e a conferir que o conteúdo da entrada chega sem imagem. Com a regra quebrada, ele falha |
| O servidor de desenvolvimento continuou servindo o CSS antigo depois de uma mudança em `globals.css`, mesmo reiniciado | O cache do Turbopack fica em `.next/dev` e sobrevive ao reinício: é preciso apagá-lo. Registrado nos pontos de atenção |
| A documentação dizia que, sem JavaScript, a área encoberta aparecia em 6 segundos. Com o JavaScript desligado, o trecho não roda e nada é encoberto; os 6 segundos valem quando o código da página não chega | Texto corrigido em três documentos, e o teste passou a esperar a área aparecer de fato |

### Verificações executadas

Todas em 09/10/2026, com Node 24.15.0 no Windows 11.

| Verificação | Resultado |
| --- | --- |
| `npm run lint` | Sem problemas |
| `npm run typecheck` | Sem erros |
| `npm run data:validate` | Nenhum erro; 5 pendências, que são os 5 rascunhos |
| `npm run test` | 496 testes passando, em 24 arquivos. Eram 485 em 23: entraram os 11 das versões dos retratos |
| `npm run build` | 47 páginas HTML, como antes. O ajuste da saída renomeou 44 arquivos de navegação, retirou 6 arquivos do MapLibre (4,5 MB) e completou o pré-carregamento da fonte em 42 páginas |
| `npm run verify:export` | 276 arquivos, 10,3 MB; 39 acontecimentos com página, 5 rascunhos sem página, nenhum dado sintético, nenhuma rota de desenvolvimento. Passou a conferir também as versões dos retratos, os arquivos de navegação, os arquivos do MapLibre e o pré-carregamento da fonte |
| `npm run test:e2e` | 201 testes passando: 14 da prova sintética, 7 dos dados reais, 26 da prévia, 40 da navegação temporal, 35 do mapa, 23 da comparação, 25 das páginas e 31 do acabamento, que são os desta fase. Eram 170 |
| `npm run test:export` | 16 testes passando, sobre a saída estática servida por `scripts/preview.mjs` |
| `npm run capture:finish` | 39 capturas do build final, mais as 39 do build da fase 7 em `antes/`, tiradas pelo mesmo roteiro. Conferidas uma a uma |
| `npm run measure` | 5 telas, 2 perfis, 7 execuções de cada build, alternadas, com a placa de vídeo. Resultado em `docs/desempenho/antes.json` e `depois.json`; tabelas em PERFORMANCE.md |
| Quadros no meio das transições | 15 quadros, com o movimento ligado e a placa de vídeo: seleção e filtro em computador, leitura e vista do mapa em celular, e o link com consulta antes e depois de o endereço ser lido. Olhados um a um; não ficam no repositório |
| Larguras | 1440×900, 768×1024, 390×844 e 360×800, por teste e pelas capturas |
| Movimento reduzido | É o modo padrão dos testes de navegador. Um teste confere que as transições e o traço do aviso de carregamento ficam sem movimento |
| Mapa indisponível | Capturas em computador e em celular, sem WebGL: a lista de lugares no lugar do mapa, com a leitura funcionando |
| Página de um acontecimento aberta direto | No build: o texto chega antes do mapa, nada se desloca, e em celular o mapa espera a rolagem |
| Nenhum pedido a outro domínio | Conferido no build, nas telas principais |

Dezenove regras foram quebradas de propósito, para confirmar que os testes falham. Onze no navegador: a lista sem rolar até o item, o perfil remontado a cada seleção, o título menor do que a data, os números da edição antes dos cartões, a marca do link com consulta nunca retirada, a área sem ser encoberta, a comparação fora da regra do link com consulta, a seleção esperando 400 ms, a redução de movimento desligada, um título mais largo do que a tela e a transição de vista desligada. Seis sobre o build: o mapa montado a 6.000 px da área visível, o retrato como componente de servidor, o menu adiantando todos os destinos, os cartões da entrada sem prioridade, os arquivos de navegação sem renomear e as páginas sem o pré-carregamento da fonte. Duas nas regras dos retratos: o nome do arquivo sem a moldura e um enquadramento alterado sem gerar as versões. Dezoito foram notadas na primeira passagem. Uma não foi, a do retrato como componente de servidor, e o teste foi refeito (tabela acima); repetida, foi notada. O código foi restaurado em todos os casos.

### Implementado e não verificado

- **Aparelho móvel real.** Não havia um disponível. Tela, toque, rede e processador foram emulados em um notebook. A rolagem com o dedo, a barra de endereço do navegador móvel e o tempo real para abrir a vista do mapa não foram vistos.
- **Navegador com janela visível, Firefox e Safari.** Tudo foi conferido em um Chromium sem interface. As medições e os quadros das transições usaram a placa de vídeo; os testes, o desenho por software.
- **Dados de campo e INP.** Não existem: o atlas não foi publicado.
- **Hospedagem real.** A compressão, o protocolo e o cache do servidor local não são os de uma hospedagem. O cache longo para `/_next/static/` e o `404.html` dependem dela.
- **Build no Linux ou no macOS.** Todos os builds foram feitos no Windows. O primeiro passo do ajuste da saída não deve ter o que fazer em outro sistema, e isso não foi visto.
- **Navegador sem WebP.** O retrato não aparece; o nome e o texto continuam. Não foi testado.
- **Leitor de tela.** Os dois avisos novos, "Abrindo a consulta do endereço…" e "Carregando o mapa…", têm `role="status"` e foram conferidos pela estrutura, não com um leitor de tela.
- **Segunda visita.** Todas as medições são com o cache vazio.
- **Leitura das telas por outra pessoa.** A hierarquia e o ritmo foram julgados por quem os fez, pelas capturas. A validação com pessoas é da fase 9.

### Pendências reais

1. **Revisão humana de todo o conteúdo.** Continua sendo a principal. É da fase 9.
2. **Aparelho móvel real e navegador com janela.** Nada desta fase foi visto fora de um Chromium sem interface, com celular emulado.
3. **Abrir a vista do mapa em celular com rede lenta leva perto de 4 segundos,** antes e depois. O gargalo é o pacote e o worker do MapLibre, e não há saída dentro do pacote (D-86).
4. **O primeiro desenho da página do acontecimento em celular ficou 112 ms mais tarde** (de 1.032 para 1.144 ms, no perfil emulado). Está dentro da meta. Um terço vem do pré-carregamento da fonte, medido; o resto não foi isolado (PERFORMANCE.md, Leitura dos resultados).
5. **Bloqueio de 0,5 a 0,9 segundo no carregamento, no perfil de celular.** Não mudou nesta fase.
6. **Dados de campo e INP:** só depois da publicação.
7. **Hospedagem** (fase 10): compressão, cache longo para `/_next/static/`, `404.html` e tipo de conteúdo dos arquivos `.mjs`. Medir de novo no endereço público.
8. **Política de segurança de conteúdo** (fase 10): precisa permitir o trecho de script do link com consulta, que é o único escrito dentro do HTML.
9. **Passos do ajuste da saída:** dependem das versões do Next e do MapLibre. Rever a cada atualização.
10. **Navegador sem WebP** não mostra o retrato. Não há versão em outro formato.
11. **A instância do mapa não é mantida na troca de pessoa** (D-86).
12. **Capturas das fases 4 a 7** mostram a interface de antes do acabamento. Não foram refeitas; `docs/capturas/README.md` avisa.
13. **Herdadas, sem mudança:** canal público de correção e domínio público, que são decisões do responsável; nome definitivo e retrato em cinza e recortado (D-42); a natureza de cada fonte, que não aparece nas páginas; 4 das 59 fontes sem data do documento; vídeo de demonstração não gravado; lacunas de conteúdo (lista na seção da fase 3).

### Preparação para a fase 9 (revisão editorial, testes e validação com pessoas)

O critério da fase 9, no plano: a jornada principal passa, não há informação publicada sem sustentação identificada, e as pendências restantes não prejudicam leitura ou interpretação. Situação de cada passo:

| Passo da fase 9 | O que já existe | O que falta |
| --- | --- | --- |
| 1. Revisar a coleção final contra as fontes | 39 acontecimentos conferidos com assistência de IA, com o roteiro de revisão no fim de CONTENT-REVIEW.md | A revisão humana, que é a pendência principal desde a fase 2, e a decisão de quem a assina |
| 2. Conferir todos os links de evidência e registrar a data | Os endereços conferem com os registros; nenhum foi aberto desde a pesquisa | Abrir as 59 fontes e registrar a data da conferência |
| 3. Testar regras de datas, períodos, filtros e integridade | Testes unitários das regras e validação do conteúdo no build | Rodar de novo depois de cada ajuste no conteúdo |
| 4. Testar escolha de pessoa, seleção, sincronização do mapa e comparação | Testes de navegador das fases 5 a 8, mais a jornada principal em computador e em celular | Repetir o que os ajustes da fase 9 afetarem |
| 5. Testar acesso direto, recarregamento e voltar/avançar | Testes de navegador, e os testes sobre o build | O mesmo |
| 6. Conferir teclado, foco, contraste, movimento reduzido e leitura em celular | Contraste medido em teste, foco e teclado por teste, movimento reduzido por teste | Leitor de tela, zoom de texto e um celular real |
| 7. Testar falha do mapa e conteúdo sem coordenadas | Cinco falhas tratadas e testadas; acontecimentos sem ponto acessíveis pelo mapa | Ver a falha em um aparelho real |
| 8. Três pessoas encontram um episódio e conferem a fonte | Nada | Recrutar, observar e registrar as dificuldades |

Pontos de atenção para quem continuar:

- Para ver o que a pessoa recebe, use o build: `npm run build` e `npm run preview`. O servidor de desenvolvimento não tem o ajuste da saída, e nele o pré-carregamento e os pacotes são outros.
- Ao trocar um retrato ou o enquadramento, rode `npm run images` e olhe o resultado. O build recusa versões desatualizadas.
- Os três passos de `scripts/finalize-export.mjs` corrigem defeitos de versões específicas do Next e do MapLibre. Ao atualizar qualquer um dos dois, confira se o defeito continua; se não, o passo sai.
- Um link novo entre páginas precisa de uma decisão sobre o pré-carregamento: padrão só para o caminho principal, `IntentLink` para a navegação, `prefetch={false}` para o resto (D-78).
- Em um teste que abre uma página com consulta, espere a marca `data-consulta` sair antes de agir.
- Se o servidor de desenvolvimento mostrar o CSS antigo depois de uma mudança em `globals.css`, reiniciar não basta: apague `.next/dev` antes de subir de novo.
- Para comparar o desempenho de uma mudança, meça os dois builds na mesma rodada (`--contra`). Números de rodadas diferentes não se comparam.
- A medição leva perto de uma hora com 7 execuções e trava a máquina para outras tarefas: rodar testes ou builds ao mesmo tempo estraga os números.

## Fase 7 (comparação, páginas e fontes)

Entrega: a comparação das duas trajetórias no mesmo período e com as mesmas categorias, com a consulta no endereço; o perfil completo dentro da exploração; a página de cada acontecimento com fontes, créditos, revisão e edição; **Copiar link** e o retorno com o recorte de antes; e a metodologia pública. A especificação está em [COMPARISON.md](COMPARISON.md) e em [PAGES.md](PAGES.md); o comportamento de cada controle, em [INTERACTIONS.md](INTERACTIONS.md); as decisões, em [DECISIONS.md](DECISIONS.md), de D-66 a D-73; as capturas, em [capturas/fase-7/](capturas/README.md).

Para abrir: `npm run dev` e `http://localhost:3000/comparar/`. Exemplos de endereço estão em COMPARISON.md, em PAGES.md e no README.

### Critério de conclusão do plano

"Links de acontecimentos abrem diretamente; recarregar preserva a consulta relevante; a comparação respeita cargos e períodos diferentes. Quantidade de registros não é apresentada como medida de desempenho."

O pedido da fase escreveu o critério com mais alcance: "comparação contextualizada, páginas estáticas acessíveis por link direto, fontes e créditos visíveis, compartilhamento preservando a consulta e metodologia pública dentro do projeto". A tabela segue esta versão.

| Parte do critério | Situação | Como foi conferido |
| --- | --- | --- |
| Comparação contextualizada | Atendido | As duas trajetórias saem da mesma consulta, com o mesmo período e as mesmas categorias, sobre um eixo só. Os testes de navegador comparam cada coluna com a conta feita sobre os dados gerados, conferem que as duas faixas têm a mesma posição e a mesma largura, que cargos e filiações trazem instituição e intervalo, que o recorte vazio diz falta de registro e não de atividade, e leem o texto da página atrás de palavras de ranking |
| Páginas estáticas acessíveis por link direto | Atendido | 39 páginas de acontecimento e 2 de perfil, geradas no build. Na saída estática, servida por `npm run preview`, as 44 rotas responderam 200 por pedido direto; um slug inventado e um slug de rascunho responderam 404, com a página 404 do atlas. O servidor de desenvolvimento responde do mesmo jeito, com teste |
| Fontes e créditos visíveis | Atendido | Cada acontecimento, cada cargo e cada filiação mostra as próprias fontes, com o trecho e o que ele sustenta. Um teste percorre as 39 páginas e confere que os links de fonte são os do registro, sem link a mais; outro confere as 59 fontes do catálogo da metodologia. Crédito do retrato com autoria, origem e condições de uso; crédito da base do mapa |
| Compartilhamento preservando a consulta | Atendido | **Copiar link** na exploração, na comparação e na página do acontecimento, conferido lendo a área de transferência. O link da exploração reproduz recorte e seleção; o da comparação, o recorte. Com a cópia recusada ou indisponível, o endereço aparece em um campo e nada é confirmado. O retorno da página devolve pessoa, período, categorias e seleção, inclusive em uma aba nova |
| Metodologia pública dentro do projeto | Atendido, com uma configuração pendente | `/metodologia/`, com onze seções e os números vindos dos dados. O canal público de correção não foi definido: a página diz isso e oferece um modelo para copiar |

### Passos do plano e situação de cada um

| Passo | Situação |
| --- | --- |
| 1. Comparação das duas trajetórias em um mesmo intervalo | Feito: período e categorias no estado compartilhado e no endereço, sem pessoa em foco (D-66) |
| 2. Cargos, filiações e acontecimentos de cada pessoa | Feito: uma coluna por pessoa, com as mesmas seções na mesma ordem, mais as fontes do recorte |
| 3. Mesma escala temporal e cobertura explicada | Feito: um eixo só, os mesmos limites, e o bloco **Como ler esta comparação**, escrito com os dados do recorte |
| 4. Páginas estáticas por perfil e por acontecimento | Feito. O perfil é a própria exploração, com o painel completo (D-67); a página do acontecimento ganhou retorno, cópia do link, edição e caminhos |
| 5. Fontes, créditos e data de revisão nas páginas | Feito: fontes por registro, catálogo sem repetição, crédito do retrato com origem, revisão e edição em todas as páginas de leitura (D-71) |
| 6. Cópia de link e retorno à exploração | Feito: endereço do ambiente em execução, confirmação só depois do sucesso, campo selecionável na falha e contexto de retorno no endereço da página (D-68, D-69) |
| 7. Metodologia e instruções para sugerir uma correção | Feito, com o canal pendente e um modelo copiável no lugar dele (D-70, D-72) |

### O que foi entregue

- **Comparação por período e categorias** em `/comparar/`, com o mesmo provider de estado da exploração. Recarregar, voltar e avançar restauram a consulta; parâmetro inválido cai sozinho e o endereço é corrigido no lugar.
- **Leitura paralela:** em tela larga, as seções das duas colunas começam na mesma altura. Em celular, o recorte fica escrito e preso ao topo, os controles ficam atrás de **Filtros**, e as faixas rolam até o período escolhido mantendo o eixo de anos.
- **Linguagem da comparação:** quantidade dita como acontecimentos cadastrados, cobertura de cada pessoa, trecho fora da cobertura e lacunas explicados. Nenhuma soma, ordem, média ou cor por pessoa.
- **Acontecimento das duas pessoas** nas duas trajetórias, com a nota "nas duas trajetórias" e uma página só.
- **Perfil** no painel da exploração: apresentação, cargos e partidos com intervalo, marca **em curso** e fontes de cada registro, cobertura, fontes do perfil, revisão, edição e crédito do retrato com origem.
- **Página do acontecimento:** retorno por pessoa e à comparação, **Copiar link**, resumo e contexto em seções com nome, revisão e edição, **Sugerir uma correção**, **Continuar no atlas** e créditos.
- **Fontes:** `RecordSources` para as fontes de um registro e `SourceCatalog` para os documentos de um conjunto, sobre a mesma identificação de documento da `SourceList`.
- **Copiar link** (`CopyLink`), com os três estados, e os endereços entre telas em um módulo puro (`src/lib/state/links.ts`).
- **Metodologia** reescrita: objetivo e escopo, seleção, fontes, a revisão que de fato aconteceu, datas, lugares, lacunas e limites da comparação, edição e atualização, correção, créditos e o catálogo das 59 fontes.
- **Modelo de sugestão de correção,** que já vem com o link e o título quando a pessoa chega pela página de um acontecimento.
- **Guia de estados** (`/dev/previa/`) com os cargos e partidos com fontes, o catálogo e a cópia do link.
- **Capturas** da fase e o comando que as refaz: `npm run capture:pages`.

### Arquivos

Comparação com o estado da fase 6: 51 arquivos de código e de documentação (14 novos e 37 alterados), mais 23 capturas.

| Onde | O quê |
| --- | --- |
| `docs/` | Novos: COMPARISON.md, PAGES.md e `capturas/fase-7/` (23 imagens). Atualizados: ARCHITECTURE.md, CONTENT-REVIEW.md, DECISIONS.md, DESIGN-SYSTEM.md, INTERACTIONS.md, SOURCES.md, TIMELINE.md, UX.md, STATUS.md e `capturas/README.md` |
| `src/lib/state/` | Novos: `links.ts` (endereços entre telas e retorno) e `location.tsx` (leitura do endereço no navegador). Atualizados: `url-state.ts` (rota sem pessoa e modo de comparação), `selectors.ts` (`selectComparison`) e `AtlasUrlStateProvider.tsx` |
| `src/lib/` | Novo: `site.ts` (configuração pendente). Atualizado: `data/queries.ts` (`listSourcesOf`) |
| `src/components/` | Novos: `CopyLink.tsx` e `RecordSources.tsx`. Atualizados: `ProfilePanel.tsx`, `PeriodRecords.tsx`, `SourceList.tsx`, `EditionStatus.tsx`, `Portrait.tsx` e `time/EventMarkLinks.tsx` |
| `src/features/` | `comparison/TrajectoryLanes.tsx` e o README da pasta, `events/EventPanel.tsx`, `events/EventLinkList.tsx` e `timeline/PeriodContext.tsx` |
| `src/app/` | Novos: `acontecimentos/[slug]/EventReturn.tsx` e `metodologia/CorrectionTemplate.tsx`. Reescritos: `comparar/Comparison.tsx` e `metodologia/page.tsx`. Atualizados: `comparar/page.tsx`, `acontecimentos/[slug]/page.published.tsx`, `politicos/[slug]/page.tsx`, `politicos/[slug]/Explorer.tsx` e `dev/previa/StatesGallery.tsx` |
| `tests/` | Novos: `links.test.ts`, `comparison.test.ts`, `e2e/comparacao.spec.ts`, `e2e/paginas.spec.ts` e `e2e/paginas.capture.ts`. Atualizados: `e2e/previa.spec.ts` e `e2e/linha-do-tempo.spec.ts` |
| Raiz | `package.json` (`capture:pages`), README.md e `.claude/project-state.md` |

`content/` não foi alterado, nenhuma dependência foi acrescentada, nenhum token de cor ou de tipografia foi criado, e as imagens de `docs/capturas/fase-4/`, `fase-5/` e `fase-6/` não foram refeitas.

### Jornada implementada e o que segue em demonstração

Implementado, com dados reais e teste de navegador:

- Comparação: estado inicial, período, categorias combinadas com o período, acontecimento compartilhado e datas parciais.
- Endereço da comparação: recarregar, voltar e avançar, parâmetros inválidos, correção sem entrada no histórico e ajustes seguidos contando como um.
- Cargos e partidos do período, com o que as datas não decidem; recorte sem registros; texto sem ranking; fontes de cada registro e do recorte.
- De uma tela para outra: comparação, página do acontecimento e exploração, nos dois sentidos, com o recorte.
- Perfil dos dois políticos, com as mesmas seções na mesma ordem; perfil em celular.
- Página do acontecimento por link direto, para um registro de cada tipo; as 39 páginas com os links de fonte do registro; leitura sem o mapa.
- Retorno sem contexto, com contexto, em aba nova, com contexto inválido e para o acontecimento das duas pessoas.
- Cópia do link com sucesso, recusada e indisponível, na comparação, na exploração e na página.
- Metodologia: seções, catálogo, créditos, canal pendente e modelo de correção.

Em demonstração, com o contrato de cada um em INTERACTIONS.md: canal de correção, endereço público, fonte indisponível, imagem de acontecimento, rótulos da base e lugares fora da América do Sul.

### O que a fase 6 deixou para esta fase

| Ponto | Como ficou |
| --- | --- |
| Ligar a comparação ao estado e ao endereço | Feito, com o provider da exploração (D-66) |
| Rever cargos e filiações com o recorte vindo do endereço | Feito: as listas saem da mesma consulta, com o título de cada seção dizendo o período |
| Conferir a mesma escala com período e categorias no endereço | Feito, com teste da posição e da largura das duas faixas |
| Rever o conteúdo das páginas de perfil e de acontecimento | Feito (PAGES.md) |
| Conferir o que faltava nos perfis | Faltavam as fontes de cada cargo e de cada filiação, a edição e a origem do retrato. Entraram |
| Botão de copiar e retorno com o recorte de antes | Feitos (D-68, D-69) |
| Revisar a metodologia e escrever o caminho de correção | Feito. O canal continua sendo decisão do responsável (D-70) |
| Pendência 10 da fase 6: página que voltava sem o recorte e comparação fora do endereço | Resolvida |

### Problemas achados na conferência e corrigidos

A conferência foi feita abrindo cada tela em um Chromium, em computador, tablet e celular, capturando e olhando cada captura, e depois quebrando regras de propósito.

| Problema | Correção |
| --- | --- |
| Em tela larga, a barra do recorte da comparação mudava de altura quando **Limpar filtros** aparecia | O botão passou para a linha dos rótulos |
| Em celular, a barra do recorte da comparação quebrava em duas linhas | O texto encolhe e o botão **Filtros** mantém a largura |
| A metodologia passava da largura da tela em celular, por causa da tabela das categorias | A coluna do texto deixou de crescer com a tabela, que rola por dentro |
| A lista "ordem de preferência" das fontes saía com marcadores, e não com números | Classes de lista separadas |
| "Presidente" não identifica um cargo: há mais de um registro com o mesmo nome | Os itens de cargo e de filiação levam o identificador do registro, e os testes usam o identificador |
| O teste de parâmetros inválidos da comparação passava mesmo com a comparação abrindo acontecimento, porque o acontecimento do teste ficava fora do período | O teste ganhou um acontecimento dentro do recorte |
| O teste do modelo de correção passava antes de a página ler o endereço | A troca do endereço é feita com a página já lendo o endereço |
| Um teste da fase 5 esperava que o link da página do acontecimento não levasse o recorte | Atualizado para o contrato novo |
| Dois testes da prévia cobriam a comparação da fase 4, com o período local | Substituídos pelos de `e2e/comparacao.spec.ts` |
| SOURCES.md e CONTENT-REVIEW.md falam em 166 citações, e as páginas mostram 160 | As 6 restantes são dos 5 rascunhos. Os dois documentos passaram a dizer isso; nenhum registro foi alterado |

### Verificações executadas

Todas em 09/10/2026, com Node 24.15.0 no Windows 11.

| Verificação | Resultado |
| --- | --- |
| `npm run lint` | Sem problemas |
| `npm run typecheck` | Sem erros |
| `npm run data:validate` | Nenhum erro; 5 pendências, que são os 5 rascunhos |
| `npm run test` | 485 testes passando, em 23 arquivos. Eram 435 em 21 |
| `npm run build` | 47 páginas HTML, como antes |
| `npm run verify:export` | 264 arquivos; 39 acontecimentos com página, 5 rascunhos sem página, nenhum dado sintético, nenhuma rota de desenvolvimento |
| `npm run test:e2e` | 170 testes passando: 14 da prova sintética, 7 dos dados reais, 26 da prévia, 40 da navegação temporal, 35 do mapa, 23 da comparação e 25 das páginas. Eram 124. Dois testes da prévia, sobre a comparação antiga, deram lugar aos novos |
| `npm run capture:pages` | 23 capturas, conferidas uma a uma |
| Saída estática, servida por `npm run preview` | As 44 rotas respondem 200 por pedido direto. Comparação aberta com consulta, recarregada, com voltar e avançar e com endereço corrigido; perfil; página do acontecimento com e sem contexto; retorno à exploração e à comparação; link copiado com o endereço do servidor local; link em campo sem a área de transferência; metodologia com as onze seções, as 59 fontes e o modelo de correção: tudo como no servidor de desenvolvimento. Slug inexistente e slug de rascunho respondem 404, com a página 404 do atlas. Nenhum pedido a outro domínio |
| Conferência dos links | Nenhuma citação sem fonte, nenhuma fonte sem citação, nenhum endereço repetido ou sem `https` nos dados gerados (PAGES.md, seção Conferência dos links) |
| Larguras conferidas pelas capturas | 1440×900, 768×1024 e 390×844 |
| Teclado e foco | Na falha da cópia, o foco vai para o campo com o endereço selecionado, e no modelo de correção o texto fica selecionado (testes). Os blocos de fontes são elementos nativos de abrir e fechar |
| Toque | Em 390×844: 44 pixels ou mais de altura nas fontes de cada registro e nos caminhos do perfil, e nos controles do recorte da comparação |

Vinte e uma regras foram quebradas de propósito, uma por vez, para confirmar que os testes falham. Oito nas regras puras: comparação abrindo acontecimento, categorias valendo para um lado só, retorno com um recorte que não contém o acontecimento, retorno sem ajuste à cobertura, **Voltar à comparação** para quem não veio dela, lado aberto do período virando a escala inteira, página levando o acontecimento como aberto e fonte contada por citação. Treze no navegador: cópia confirmada sem sucesso, links da comparação sem contexto, comparação tratada como exploração, retorno ignorando o contexto, exploração abrindo a página sem o recorte, perfil sem as fontes dos cargos, perfil sem a edição, catálogo só com acontecimentos, modelo aceitando qualquer slug, colunas desalinhadas, recorte solto em celular, página sem a edição e fonte com o endereço trocado. Dezenove foram notadas na primeira passagem. Duas não foram, e os dois testes foram reforçados (tabela acima); repetidas, as duas foram notadas. O código foi restaurado em todos os casos.

### Implementado e não verificado

- **Navegador com janela visível, Firefox e Safari.** Tudo foi conferido em um Chromium sem interface.
- **Celular e tablet reais.** As larguras e o toque foram emulados. A rolagem das faixas com o dedo e a barra do recorte presa ao topo com a barra de endereço do navegador móvel não foram vistas.
- **Área de transferência fora do Chromium.** A recusa e a ausência foram simuladas. O comportamento em uma página servida por `http` em outro aparelho da rede, e no Safari, não foi visto.
- **Leitor de tela.** Os nomes, os estados e os avisos foram conferidos pela estrutura, e não com NVDA, VoiceOver ou TalkBack.
- **Links das fontes no ar.** Os endereços conferem com os registros. Nenhum foi aberto nesta fase para saber se ainda responde: é da fase 9.
- **Hospedagem real.** A saída estática foi servida só pelo servidor local. O status 404 para um slug inexistente depende de a hospedagem servir `404.html`.
- **Canal de correção configurado.** O caminho em que a página troca o aviso pelo link não tem teste de navegador, porque não há valor para configurar.
- **Leitura da metodologia por outra pessoa.** O texto segue os documentos editoriais do projeto e não foi lido por ninguém além de quem o escreveu.
- **Desempenho.** Nada foi medido. É da fase 8.

### Pendências reais

1. **Revisão humana de todo o conteúdo.** Continua sendo a principal. A metodologia diz que ela não aconteceu.
2. **Canal público de correção.** Decisão do responsável pelo projeto. Para configurar: `SITE.correctionChannel`, em `src/lib/site.ts`.
3. **Domínio público.** Sem ele não há endereço canônico, `metadataBase`, sitemap nem imagem de compartilhamento. Os links copiados usam o endereço em que o atlas estiver aberto. Fase 10.
4. **Decisões herdadas do responsável:** nome definitivo e retrato em cinza e recortado (D-42).
5. **A página do acontecimento responde com e sem contexto no endereço.** O conteúdo é o mesmo; o endereço canônico, sem contexto, só pode ser declarado com o domínio definido.
6. **A natureza de cada fonte não aparece nas páginas.** O conteúdo não tem esse campo; a página mostra a autoria (D-71).
7. **4 das 59 fontes não têm data do documento.** Aparecem como "data do documento desconhecida".
8. **Estado inicial por um instante,** herdado da fase 5 (D-49). Vale agora também para a comparação e para os links de retorno, que aparecem sem o recorte até o JavaScript carregar. Fica para a fase 8.
9. **A comparação não tem mapa, e a câmera do mapa não vai para o endereço.** Fora do pedido da fase.
10. **As capturas das fases 4 a 6 mostram a comparação e a página do acontecimento antigas.** Não foram refeitas; `docs/capturas/README.md` avisa.
11. **Saída estática em hospedagem simples.** Os pedidos de pré-carregamento de segmento do Next continuam dando 404 no servidor de `npm run preview`. A navegação funciona.
12. **Vídeo de demonstração** não gravado, como nas fases anteriores.
13. **Lacunas de conteúdo herdadas** (lista na seção da fase 3).

### Preparação para a fase 8 (acabamento visual e desempenho)

O critério da fase 8, no plano: o fluxo principal permanece legível e responsivo, as animações ajudam a acompanhar a seleção, e a entrada e as páginas de leitura funcionam sem depender do carregamento do mapa. Situação de cada passo:

| Passo da fase 8 | O que já existe | O que falta |
| --- | --- | --- |
| 1. Refinar abertura, tipografia, imagens e hierarquia dos detalhes | Direção visual e tokens da fase 4; páginas de leitura completas | O acabamento: a hierarquia do perfil, que ficou longo, a metodologia e a barra do recorte da comparação |
| 2. Transições de pessoa, período e acontecimento | Duas durações e uma curva em tokens; movimento curto e com função | Rever com a comparação e com as páginas novas |
| 3. Carregar o mapa quando necessário | O mapa só é montado quando a moldura aparece na tela, e a página do acontecimento não depende dele | Medir o peso do pacote e tirar do build o worker de desenvolvimento do MapLibre |
| 4. Otimizar imagens e manter dimensões definidas | Dois retratos, com dimensões no conteúdo | Conferir formato e peso |
| 5. Movimento reduzido | Respeitado em todas as telas; os testes rodam nesse modo | Conferir o que a fase acrescentar |
| 6. Medir carregamento, estabilidade visual e resposta | Nada medido | LCP, CLS e a resposta dos controles, com o resultado identificado como de laboratório |
| 7. Computador e aparelho móvel real | Só Chromium sem interface, com larguras e toque emulados | Abrir em uma janela visível e em um celular |

Pontos de atenção para quem continuar:

- O instante de estado inicial (D-49) agora aparece em três lugares: a exploração, a comparação e os links de retorno da página do acontecimento. Uma solução vale para os três, porque todos leem o endereço por `useOwnSearch`.
- As capturas de página inteira saem com a base do mapa deslocada no Chromium sem interface. As da fase 7 são da área visível.
- O perfil da exploração e as colunas da comparação usam os mesmos componentes de cargos, partidos e fontes. Mexer em um muda os dois.
- Os testes de `tests/e2e/comparacao.spec.ts` e `tests/e2e/paginas.spec.ts` montam as expectativas a partir dos dados gerados. O roteiro de capturas cita acontecimentos pelo slug.
- Em um teste que abre uma página com consulta, é preciso esperar o endereço ser lido antes de agir: o HTML do build chega com o estado inicial.

## Fase 6 (mapa sincronizado)

Entrega: o mapa ligado ao recorte e à seleção da exploração, com conteúdo real. Um marcador por lugar documentado, seleção nos dois sentidos, uma lista para os acontecimentos que dividem um lugar, acesso aos que não têm ponto e a leitura preservada quando o mapa falha. A especificação está em [MAP.md](MAP.md); o comportamento de cada controle, em [INTERACTIONS.md](INTERACTIONS.md); as decisões, em [DECISIONS.md](DECISIONS.md), de D-58 a D-65; as capturas, em [capturas/fase-6/](capturas/README.md).

Para abrir: `npm run dev` e `http://localhost:3000/politicos/lula/`. Em tela estreita, o mapa fica na vista **Mapa**. Exemplos de endereço estão em MAP.md e no README.

### Critério de conclusão do plano

"Mapa, lista e painel permanecem sincronizados; acontecimentos sem lugar municipal continuam acessíveis; falha de WebGL preserva a leitura do conteúdo."

O pedido da fase escreveu o mesmo critério com mais alcance: "mapa, lista, linha do tempo e painel mostram o mesmo recorte e seleção; todos os acontecimentos continuam consultáveis; uma falha do mapa preserva a leitura do conteúdo". A tabela segue esta versão.

| Parte do critério | Situação | Como foi conferido |
| --- | --- | --- |
| Mapa, lista, linha do tempo e painel mostram o mesmo recorte e seleção | Atendido | O mapa não filtra nem guarda seleção: recebe os pontos que a exploração já recortou e o acontecimento aberto. Os testes de navegador comparam, com filtros combinados, os acontecimentos dos marcadores com os da lista e com a conta feita sobre os dados gerados. Conferem a seleção vinda do marcador, da lista do marcador, da lista de acontecimentos, da linha do tempo e do endereço, inclusive depois de recarregar, voltar e avançar. Conferem também que mover a câmera não muda a seleção nem o endereço |
| Todos os acontecimentos continuam consultáveis | Atendido | O lugar com vários acontecimentos abre uma lista com todos, em qualquer zoom. Os 13 sem ponto ficam no botão **sem ponto no mapa** e continuam na lista e na linha do tempo. Um teste percorre cada marcador e confere que o número é o de acontecimentos distintos e que cada acontecimento aparece em todos os seus lugares |
| Uma falha do mapa preserva a leitura do conteúdo | Atendido | Cinco falhas tratadas e testadas em navegador: sem WebGL, pacote que não chega, mapa que não termina de carregar, contornos que não carregam e perda do contexto gráfico. Em todas, filtros, endereço, lista, linha do tempo e painel continuam, e a lista de lugares assume a área do mapa |

### Passos do plano e situação de cada um

| Passo | Situação |
| --- | --- |
| 1. Base geográfica local e estilo do mapa | Feito. A base da fase 4 foi adotada, com origem, licença e transformações registradas, e o estilo ficou só com a base (D-58) |
| 2. Plotar os acontecimentos com localização documentada | Feito: um marcador por lugar, com o nome ao lado. Na edição, 26 acontecimentos em 9 lugares |
| 3. Foco e seleção nos dois sentidos | Feito: o marcador e a lista dele selecionam; a lista de acontecimentos, a linha do tempo e o endereço destacam todos os lugares do acontecimento |
| 4. Agrupar ou permitir escolher pontos sobrepostos | Feito: um marcador por lugar, lugares próximos juntos e uma lista para escolher (D-60) |
| 5. Pontos de acordo com pessoa, período e categoria | O recorte já vinha da fase 5. Nesta, os marcadores, os números e o botão dos sem ponto o acompanham, com teste de filtros combinados |
| 6. Limites de zoom | Feito: de 2 a 6, câmera presa à área da base e teto pela precisão do lugar na aproximação automática (D-58, D-61) |
| 7. Câmera e gestos em computador e celular | Feito: a câmera só anda quando precisa; gestos livres na exploração e cooperativos na página do acontecimento. Conferido com toque emulado; falta aparelho real |
| 8. Lista e detalhes utilizáveis quando o mapa falhar | Feito: cinco falhas, com mensagem, saída e a lista de lugares (D-64) |

### O que foi entregue

- **Marcadores por lugar,** em HTML sobre a base: a forma e a cor da categoria quando o lugar tem um acontecimento, a quantidade quando tem vários, contorno tracejado quando só o estado é conhecido, e o nome do lugar ao lado.
- **Lista de um marcador,** para lugares com vários acontecimentos e para lugares próximos: data na precisão do registro, título, categoria e lugar. Folha embaixo em celular, quadro no canto nas demais larguras.
- **Seleção nos dois sentidos,** pelo mesmo estado e pelo mesmo endereço da fase 5. O acontecimento com dois lugares destaca os dois.
- **Sem ponto no mapa:** botão com a quantidade, que abre a lista dos acontecimentos de abrangência nacional, sem lugar documentado ou fora da área da base, com o motivo. O mapa avisa quando o acontecimento aberto não tem ponto e quando o recorte não tem nenhum.
- **Câmera** que enquadra o recorte ao abrir, só se move quando a seleção ou o recorte ficam fora da vista, respeita quem moveu o mapa e não se aproxima sozinha além do que a precisão do lugar sustenta.
- **Controles** de aproximar, afastar e enquadrar, e **legenda** com os símbolos em uso e o aviso de base simplificada.
- **Limites da base:** zoom de 2 a 6 e câmera dentro da área que os contornos cobrem.
- **Página do acontecimento** com o mesmo mapa, só para leitura: marcadores com nome e gestos cooperativos, para a página continuar rolando.
- **Falhas** com mensagem por causa, **Tentar de novo** ou **Recarregar a página**, e a lista de lugares agrupada por lugar.
- **Base documentada:** origem, licença, resolução e transformações em `src/features/map/base/README.md`. A pasta `public/geo/` foi removida.
- **Guia de estados** (`/dev/previa/`) com os marcadores e a falha da base.
- **Capturas** da fase e o comando que as refaz: `npm run capture:map`.

### Arquivos

Comparação com o estado da fase 5: 43 arquivos de código e de documentação (12 novos, 30 alterados e 1 removido), mais 21 capturas.

| Onde | O quê |
| --- | --- |
| `docs/` | Novo: MAP.md e `capturas/fase-6/` (21 imagens). Atualizados: ARCHITECTURE.md, DATA-PIPELINE.md, DECISIONS.md, DESIGN-SYSTEM.md, INTERACTIONS.md, TIMELINE.md, UX.md, STATUS.md e `capturas/README.md` |
| `src/features/map/` | Novos: `places.ts`, `camera.ts`, `PlaceMarker.tsx`, `PlaceChooser.tsx`, `MapControls.tsx`, `MapLegend.tsx` e `MapFallback.tsx`. Reescritos: `MapCanvas.tsx` e `MapView.tsx`. Atualizados: `style.ts` e `palette.ts` (só a base) e `base/README.md` |
| `src/lib/data/` | `points.ts`: `listUnplaced` |
| `src/app/` | `politicos/[slug]/Explorer.tsx` (entrega ao mapa os sem ponto e o cartão), `acontecimentos/[slug]/EventLocator.tsx` (gestos cooperativos), `dev/prova/ProofScreen.tsx`, `dev/previa/StatesGallery.tsx` e `globals.css` (saiu o estilo dos controles do MapLibre) |
| `tests/` | Novos: `map-places.test.ts`, `map-camera.test.ts`, `e2e/mapa.spec.ts` e `e2e/mapa.capture.ts`. Atualizados: `map.test.ts`, `design.test.ts`, `e2e/previa.spec.ts`, `e2e/linha-do-tempo.spec.ts`, `e2e/prova.spec.ts` e os dois roteiros de captura anteriores |
| Raiz | `package.json` (`capture:map`), README.md, `.claude/project-state.md` e a remoção de `public/geo/.gitkeep` |

`content/` não foi alterado, nenhuma dependência foi acrescentada, e as imagens de `docs/capturas/fase-4/` e `fase-5/` não foram refeitas.

### Jornada implementada e o que segue em demonstração

Implementado, com dados reais e teste de navegador:

- Marcadores do recorte, com filtros de período e de categoria combinados.
- Seleção pelo marcador, pela lista do marcador, pela lista de acontecimentos, pela linha do tempo e pelo endereço.
- Lugar com vários acontecimentos e lugares vizinhos no zoom máximo, com todos os itens acessíveis.
- Acontecimento com dois lugares, com os dois destacados.
- Acontecimento sem ponto, aberto pelo mapa, e recorte sem nenhum ponto.
- Câmera: enquadramento inicial, seleção à vista e fora da vista, mapa movido pela pessoa e retorno pelo botão de enquadrar.
- Limites de zoom, com os botões desativados no limite.
- Teclado: marcadores, lista do marcador, controles e legenda.
- Falhas: contornos, contexto gráfico, pacote, tempo de espera e navegador sem WebGL.
- Celular: folha embaixo, cartão, áreas de toque e troca de vista.
- Página do acontecimento: mapa de leitura e rolagem da página.

Com dados sintéticos, em `/dev/prova/`: lugar fora da área que a base cobre.

Em demonstração, com o contrato de cada um em INTERACTIONS.md: comparação ligada ao estado e ao endereço, retorno da página do acontecimento com o recorte de antes, rótulos da base, lugares fora da América do Sul, fonte indisponível e imagem de acontecimento.

### O que a fase 5 deixou para esta fase

| Ponto | Como ficou |
| --- | --- |
| Base definitiva, rótulos e glyphs (D-43) | Base adotada, sem rótulos próprios. Os nomes no mapa são os dos lugares do conteúdo, em HTML (D-58) |
| Agrupar ou listar os pontos sobrepostos | Os dois: um marcador por lugar, lugares próximos juntos e uma lista para escolher (D-60) |
| Rever foco e seleção com pontos sobrepostos | O clique em um lugar com vários acontecimentos não escolhe nenhum: abre a lista |
| Limites de navegação | Zoom de 2 a 6 e câmera presa à área da base |
| Conviver com o cartão do mapa em celular | A lista do marcador toma o lugar do cartão enquanto está aberta, e a câmera conta o que cada um cobre |
| Forma da categoria no mapa e pontos pelo teclado | Feitos, com os marcadores em HTML (D-59) |
| Buscar o GeoJSON por endereço (D-28) | Não foi preciso: o mapa continua recebendo os pontos pela página |

### Problemas achados na conferência e corrigidos

A conferência foi feita abrindo a exploração em um Chromium, em computador, tablet e celular, capturando as telas e olhando cada captura.

| Problema | Correção |
| --- | --- |
| O mapa aparecia em branco: o MapLibre impõe `position: relative` ao próprio contêiner, e a altura dele virava zero | O contêiner passou a ter altura e largura explícitas |
| O enquadramento sem pontos passava da área que a base cobre | Caixa corrigida; um teste confere que ela cabe na área |
| Um lugar fora da América do Sul não teria como ser desenhado com a câmera presa à base | Fica fora do mapa e entra na lista **sem ponto no mapa**, com o nome |
| Depois de um zoom, a ordem do Tab deixava de seguir a dos lugares. Aparecia no servidor de desenvolvimento, com os marcadores do MapLibre | Marcadores como elementos do React, em um portal dentro do contêiner do canvas (D-59) |
| O contorno tracejado, no disco com número, parecia uma engrenagem | O tracejado fica por fora do disco, e a legenda só o mostra quando algum marcador o usa |
| Abrir a lista de um marcador recentrava o mapa | A câmera desloca só o que falta para o marcador sair de baixo da lista |
| Quando um filtro fechava a lista do marcador, o foco saltava para o marcador | O foco só volta quando a lista é fechada por dentro: Esc, **Fechar** ou a escolha de um item |
| Em celular, com o mapa escondido em outra vista, a câmera enquadrava um quadro sem tamanho | As regras de câmera esperam o mapa voltar à tela |
| Em tablet, os controles tinham 36 pixels | 44 pixels em telas estreitas e médias, 36 em tela larga |
| O aviso de acontecimento sem ponto cobria o marcador mais ao norte, e em tablet o botão dos sem ponto encostava nele | Os avisos ficam ao lado do botão, e o enquadramento deixa a faixa de cima livre quando o quadro tem altura para isso |
| Em celular, o nome de um lugar à direita passava por baixo dos controles | O enquadramento deixa mais espaço à direita |
| Em computador, a lista do marcador cobria o resumo da legenda e deixava à mostra a borda do botão dos sem ponto | O quadro cobre o botão e para antes da legenda |
| O anel de seleção encostava no nome do lugar | O nome ficou 4 pixels mais afastado do marcador |
| Com o fundo da legenda aberta opaco, a base do mapa sumia ao lado dela no navegador dos testes | O fundo é quase opaco, e dois testes comparam o mapa pixel a pixel (MAP.md, seção Falhas) |
| A tela de prova não entregava ao mapa os acontecimentos sem ponto | Passou a entregar |
| O número do botão **sem ponto no mapa** contaria um acontecimento que tem marcador, quando ele tivesse um lugar dentro da área e outro fora | A conta passou a ser dos acontecimentos sem nenhum marcador; um teste confere. O caso não existe na edição |
| O estilo dos controles do MapLibre ficou sem uso em `globals.css` | Removido |
| Seis testes das fases anteriores dependiam do mapa antigo: clique no centro do canvas, contagem de botões e texto da falha | Reescritos para o mapa novo |

### Verificações executadas

Todas em 09/10/2026, com Node 24.15.0 no Windows 11.

| Verificação | Resultado |
| --- | --- |
| `npm run lint` | Sem problemas |
| `npm run typecheck` | Sem erros |
| `npm run test` | 435 testes passando, em 21 arquivos. Eram 382 em 19 |
| `npm run build` | 47 páginas HTML, como antes |
| `npm run verify:export` | 264 arquivos; 39 acontecimentos com página, 5 rascunhos sem página, nenhum dado sintético, nenhuma rota de desenvolvimento |
| `npm run test:e2e` | 124 testes passando: 14 da prova sintética, 7 dos dados reais, 28 da prévia, 40 da navegação temporal e 35 do mapa. Eram 88 |
| `npm run capture:map` | 21 capturas, conferidas uma a uma |
| Saída estática, servida por `npm run preview` | Marcadores do recorte, seleção pelo marcador e pela lista do marcador, seleção restaurada ao recarregar, acontecimento sem ponto aberto pelo mapa e mapa da página do acontecimento: todos como no servidor de desenvolvimento. Os contornos e o worker saem de `/_next/static/media/`, com os tipos `application/geo+json` e `text/javascript`. Nenhum pedido a outro domínio |
| Larguras conferidas pelas capturas | 1440×900, 1280×720, 768×1024 e 390×844 |
| Teclado e foco | Tab pelos marcadores, de norte a sul; Enter abre a lista; Tab, Enter e Esc dentro dela; foco devolvido ao marcador; controles e legenda com nome e foco visível |
| Toque | Em 390×844, com toque emulado: áreas de 44 pixels nos marcadores, nos controles e no botão dos sem ponto; folha, cartão e troca de vista |
| Movimento | Os testes rodam com movimento reduzido, como nas fases anteriores. Um teste roda com o movimento ligado e confere que a câmera chega ao lugar selecionado |
| Instância do mapa | Um teste confere que o canvas é o mesmo elemento depois de várias mudanças de filtro e de seleção |
| Perda de contexto | Simulada com a extensão `WEBGL_lose_context`: o aviso aparece, o mapa retoma quando o contexto volta e, sem retomada, a lista assume em 5 segundos |

Dezenove regras foram quebradas de propósito, uma por vez, para confirmar que os testes falham. Sete nas regras puras: número do marcador contando pontos, lugares vizinhos sem agrupar, destaque só no primeiro lugar, sem ponto contando quem tem marcador, teto de zoom pelo lugar mais preciso, "à vista" ignorando o que cobre o mapa e acontecimento sem lugar documentado fora da lista dos sem ponto. Doze no navegador: clique escolhendo o primeiro acontecimento, recorte sempre recentrando, seleção sempre movendo a câmera, seleção nunca movendo, filtro recriando o mapa, falha dos contornos ignorada, contexto perdido sem saída, foco sem voltar ao marcador, zoom sem limite, sem ponto fora do mapa, página do acontecimento com gestos livres e legenda aberta com fundo opaco. Em todos os casos algum teste falhou, e o código foi restaurado.

### Implementado e não verificado

- **Navegador com janela visível, Firefox e Safari.** Tudo foi conferido em um Chromium sem interface, com WebGL por software. O desenho com placa de vídeo real e o comportamento em outro motor não foram vistos.
- **Celular e tablet reais.** As larguras e o toque foram emulados. A pinça, o arraste com o dedo e os dois dedos dos gestos cooperativos não foram exercitados.
- **Roda do mouse e pinça na exploração.** São do MapLibre. Os testes cobrem os botões, o arraste com o ponteiro e a roda na página do acontecimento.
- **Teclado do canvas.** As setas e as teclas `+` e `-` com o foco no mapa são do MapLibre e não têm teste próprio.
- **Perda real do contexto gráfico.** Só a simulada pela extensão do navegador.
- **Quadros opacos sobre o mapa, com placa de vídeo.** O defeito da base que some ao lado de um quadro opaco só foi visto no Chromium sem interface. Não se sabe se existe em um navegador comum.
- **Leitor de tela.** Os nomes dos marcadores, os estados dos botões e os avisos foram conferidos pela estrutura, e não com NVDA, VoiceOver ou TalkBack.
- **Aviso de lugar fora da área para quem também tem marcador.** A conta tem teste de regra; a frase no mapa não foi vista no navegador, porque nem a edição nem os dados sintéticos têm esse caso.
- **Hospedagem real.** A saída estática foi servida só pelo servidor local. O tipo MIME do worker (`.mjs`) e dos contornos (`.geojson`) em outro servidor fica para a fase 10.
- **Desempenho.** O peso do pacote do mapa e o tempo até o primeiro desenho não foram medidos. É da fase 8.

### Pendências reais

1. **Revisão humana de todo o conteúdo.** Continua sendo a principal.
2. **Decisões do responsável pelo projeto, herdadas:** nome definitivo, retrato em cinza e recortado (D-42) e canal público de correção.
3. **Conferência em aparelho e em navegador reais,** como listado acima. É o que mais importa conferir antes de mostrar o mapa a alguém.
4. **Lugares vizinhos seguem juntos no zoom máximo.** São Paulo e São Bernardo do Campo dividem um marcador em qualquer escala que a base sustenta. A lista os separa por lugar; o mapa, não.
5. **A base não tem rótulos.** Quem não conhece o mapa do Brasil se orienta pelos nomes dos lugares do recorte e pelas divisas dos estados (D-58).
6. **Lugares fora da América do Sul não são desenhados.** Nenhum existe na edição. O caminho está em `src/features/map/base/README.md`.
7. **A câmera não vai para o endereço.** Um link compartilhado abre com o enquadramento do recorte, e não com a posição de quem o copiou.
8. **Em janela baixa, um aviso pode cobrir um marcador.** Com o quadro do mapa abaixo de 320 pixels de altura, o enquadramento não reserva a faixa de cima, para não encolher o mapa (MAP.md, seção Câmera).
9. **Estado inicial por um instante,** herdado da fase 5 (D-49). Quem chega por um link com um acontecimento vê primeiro o mapa sem destaque. Fica para a fase 8.
10. **A página do acontecimento volta sem o recorte, e a comparação não usa o endereço.** São da fase 7.
11. **As capturas das fases 4 e 5 mostram o mapa antigo.** Não foram refeitas; `docs/capturas/README.md` avisa.
12. **Saída estática em hospedagem simples.** Os pedidos de pré-carregamento de segmento do Next continuam dando 404 no servidor de `npm run preview`. A navegação funciona. O build publica também o worker de desenvolvimento do MapLibre, de 1,1 MB, que nenhuma página pede; tirar esse arquivo é da fase 8.
13. **Vídeo de demonstração** não gravado, como nas fases anteriores.
14. **Lacunas de conteúdo herdadas** (lista na seção da fase 3).

### Preparação para a fase 7 (comparação, páginas e fontes)

O critério da fase 7, no plano: links de acontecimentos abrem direto, recarregar preserva a consulta relevante, e a comparação respeita cargos e períodos diferentes, sem apresentar a quantidade de registros como medida de desempenho. Situação de cada passo:

| Passo da fase 7 | O que já existe | O que falta |
| --- | --- | --- |
| 1. Comparação das duas trajetórias em um mesmo intervalo | A tela `/comparar/`, da fase 4, com o período em estado local | Ligar ao estado e ao endereço |
| 2. Cargos, filiações e acontecimentos de cada pessoa | As colunas por pessoa e as listas de cargos e partidos, que a fase 5 passou a compartilhar com a exploração | Rever com o recorte vindo do endereço |
| 3. Mesma escala temporal e cobertura explicada | Feito na fase 4 (D-47) | Conferir com período e categorias no endereço |
| 4. Páginas estáticas por perfil e por acontecimento | 2 perfis e 39 acontecimentos, gerados no build | Rever o conteúdo de cada página |
| 5. Fontes, créditos e data de revisão nas páginas | A página do acontecimento lista as fontes, a nota de revisão e os créditos das imagens | Conferir o que falta nos perfis |
| 6. Cópia de link e retorno à exploração | O endereço já é a consulta. O retorno leva só o acontecimento | Botão de copiar e retorno com o recorte de antes |
| 7. Metodologia e instruções para sugerir uma correção | A página `/metodologia/` existe, com os créditos da base do mapa | Revisar o texto e escrever o caminho de correção, que depende de decisão do responsável |

Pontos de atenção para quem continuar:

- O mapa da página do acontecimento é o mesmo componente, com `gestures="cooperativos"` e sem `onSelect`. Se a comparação ganhar um mapa, o contrato é o mesmo: pontos já recortados e, se houver seleção, o slug.
- `MapView` aceita o que está no recorte e nada mais. Um recorte com as duas pessoas não precisa de mudança no mapa: os pontos de um acontecimento compartilhado já são um só por lugar.
- O retorno da página do acontecimento com o recorte pede que a exploração entregue a consulta ao link da página, ou que a página a leia do histórico. As regras do endereço estão em `src/lib/state/url-state.ts`.
- Os testes de `tests/e2e/mapa.spec.ts` montam as expectativas a partir dos dados gerados, e por isso acompanham uma edição nova. O roteiro de capturas, não: ele cita acontecimentos e lugares pelo identificador.

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
7. **Pontos sobrepostos no mapa.** Brasília reúne 9 pontos e o estado do Rio de Janeiro, 7. Resolvido na fase 6 (D-60).
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

- O mapa só foi verificado em Chromium sem interface, inclusive nas fases 4 e 6. Falta abrir a exploração em uma janela visível do Chrome.
- Firefox, Safari, celular real e leitor de tela não foram testados.
- Hospedagem real, incluindo o tipo MIME de `.mjs`, fica para a fase 10.
- `npm audit`, conferido de novo em 08/10/2026: nenhuma vulnerabilidade em produção; 5 altas na cadeia do lint, que não vai para o site.
- A próxima versão maior do Next deve ligar Cache Components para todos (DECISIONS.md, D-02).
- O plano de desenvolvimento continua fora do repositório, em `Downloads/`.

## Próximo passo

Fase 9: revisão editorial, testes e validação com pessoas. A fase 8 termina aqui; a fase 9 só começa com o próximo comando. Nada foi publicado, e o site continua com `noindex`.
