# Conferência técnica

Registro dos testes da fase 9, feitos em 9 de outubro de 2026: ambiente, regras de dados, jornadas no navegador, acessibilidade, falhas encontradas e o que ficou sem verificar.

A conferência foi feita por uma IA (Claude, modelo da Anthropic), que rodou os comandos, escreveu os testes novos e olhou as capturas. Nenhuma pessoa usou o atlas nesta conferência. A validação com pessoas é outra etapa, e está pendente: [USER-VALIDATION.md](USER-VALIDATION.md).

Depois desta fase entrou o jogo, com testes próprios, em duas entregas: a etapa 1 e a versão de lançamento. Os números abaixo são os de 9 de outubro, sem o jogo. As jornadas do jogo, os checks de 10 de outubro e o que ficou sem verificar estão em [STATUS.md](STATUS.md), seções Jogo, versão de lançamento e Jogo, etapa 1, e em [GAMEPLAY.md](GAMEPLAY.md), seção Verificação. Desde 10 de outubro de 2026 o GitHub repete as verificações a cada push na `main` e a cada pull request (`.github/workflows/verificacao.yml`): `npm run check`, as suítes sobre a exportação, a passagem de acessibilidade, a conferência da matriz de cobertura e da lista de revisão, e, em trabalho separado, as jornadas no servidor de desenvolvimento. Os resultados dos testes ficam guardados como artefato quando algo falha.

## Resultado

| O que foi conferido | Resultado |
| --- | --- |
| Lint, tipos, dados, regras, build e saída (`npm run check`) | Passou |
| Regras de dados (`npm run test`) | 502 testes, em 24 arquivos, todos passando |
| Jornadas sobre a exportação estática (`npm run test:journeys`) | 184 testes, todos passando |
| Carregamento sobre a exportação (`npm run test:export`) | 16 testes, todos passando |
| Jornadas no servidor de desenvolvimento (`npm run test:e2e`) | 205 testes, todos passando |
| Jornada principal no Chrome e no Edge instalados, com a placa de vídeo | 25 de 25 passos em cada navegador |
| Contraste do texto desenhado, em 8 telas e 4 larguras | Nenhuma falha depois das correções |
| Falhas encontradas e corrigidas | 5 do produto e 1 da bancada de testes (abaixo) |
| Aparelho móvel real | **Não usado.** Só emulação |
| Firefox e Safari | **Não conferidos** |
| Leitor de tela | **Não conferido** |

## Ambiente

| Item | Valor |
| --- | --- |
| Sistema | Windows 11 |
| Node | 24.15 |
| O que foi testado | A exportação estática (`out/`), gerada por `npm run build` e servida por `npm run preview`, na porta 4311. É o que a pessoa recebe |
| Navegador dos testes | Chromium 153 do Playwright 1.63, sem interface. O WebGL roda por software |
| Navegadores instalados | Chrome 154 e Edge 154, sem interface, com a placa de vídeo da máquina (Intel UHD, Direct3D 11) |
| Celular | Emulação: janela de 390×844 e de 360×800, com toque. Nenhum aparelho real |
| Movimento | Reduzido, por padrão. Os testes "com movimento ligado" o religam |

## Dados e regras

Os testes já existentes cobriam quase toda a lista da fase. Dois riscos não tinham teste, e ganharam: o fuso do aparelho e a igualdade entre as várias vistas do conteúdo real. As fixtures ficam em `tests/` e usam identificadores que começam com `teste-`; `npm run verify:export` confere que nenhum deles chega à saída.

| Risco | Onde está coberto | Situação |
| --- | --- | --- |
| Datas completas e parciais | `tests/dates.test.ts` (precisão, datas impossíveis, apresentação), `tests/chronology.test.ts` | Já coberto |
| Limites e interseção de períodos | `tests/dates.test.ts` (intervalo de cálculo, períodos), `tests/queries.test.ts` (mandatos e filiações no período), `tests/coverage.test.ts` | Já coberto |
| Datas civis sem deslocamento por fuso | `tests/dates.test.ts`, grupo "datas civis e fuso horário"; no navegador, `tests/e2e/paginas.spec.ts`, grupo "datas e fuso do aparelho" | **Novo.** Três fusos, entre eles os dois extremos do calendário |
| Filtros combinados | `tests/queries.test.ts`, `tests/state.test.ts`, `tests/url-state.test.ts`; no navegador, "os filtros combinados mostram no mapa os mesmos acontecimentos da lista" | Já coberto |
| Integridade dos dados | `tests/integrity.test.ts`, `tests/schemas.test.ts`, `tests/pipeline.test.ts` | Já coberto |
| Acontecimento com mais de uma pessoa ou lugar | `tests/queries.test.ts`, `tests/comparison.test.ts`, `tests/map-places.test.ts`; `tests/content.test.ts`, "o acontecimento compartilhado aparece nas duas trajetórias e uma vez na lista geral" | Já coberto |
| Acontecimento sem coordenadas | `tests/queries.test.ts`, `tests/map-places.test.ts`; no navegador, "acontecimento sem coordenadas: acessível pelo mapa, com o motivo, sem mover a câmera" | Já coberto |
| Rascunhos fora da publicação | `tests/pipeline.test.ts` (elegibilidade), `tests/content.test.ts`, `npm run verify:export` (5 rascunhos sem página) e, no navegador, o 404 para o endereço de um rascunho | Já coberto |
| Mesmo resultado em consulta, lista, comparação e GeoJSON | `tests/content.test.ts`: "consulta, índice e comparação trazem os mesmos acontecimentos de cada pessoa" e "os pontos do mapa fecham com os lugares documentados de cada acontecimento" | **Novo.** Sobre o conteúdo real da edição |
| Catálogo de fontes coerente | `tests/content.test.ts`: "toda fonte da edição foi acessada depois do documento e traz endereço seguro" | **Novo** |
| Nome de cargo que se explica sozinho | `tests/content.test.ts`: "o nome de cada cargo se explica sem a instituição" | **Novo**, depois da falha 4 |

O teste de fuso do navegador foi provado ao contrário: com o formatador trocado para ler a data pelo relógio local, ele falhou ("12 de julho de 2017" virou "11 de julho de 2017" em São Paulo). O formatador de verdade não usa o relógio: lê o texto da data.

## Jornadas no navegador

Todas rodaram sobre a exportação estática servida localmente (`npm run test:journeys`), com o conteúdo real. O esperado de cada teste sai dos arquivos gerados, e não de números escritos à mão. Os nomes entre aspas são os dos testes, para quem quiser abrir o arquivo.

| Jornada | Esperado | Observado | Onde está a evidência |
| --- | --- | --- | --- |
| Entrada e escolha de pessoa | A entrada apresenta as duas pessoas do mesmo jeito e leva à exploração de cada uma e à comparação | Como esperado, nas quatro larguras | `previa.spec.ts`, "entrada"; `acabamento.spec.ts`, "abertura"; `linha-do-tempo.spec.ts`, "entrada e troca de pessoa" |
| Período e categorias | Ano, intervalo e categorias recortam lista, mapa e linha do tempo ao mesmo tempo, e vão para o endereço | Como esperado. Uma falha de legibilidade foi achada na conferência visual (falha 3) | `linha-do-tempo.spec.ts`, "ano, intervalo e categorias"; `comparacao.spec.ts`, "o período vale para as duas trajetórias e vai para o endereço" |
| Seleção pela lista, pela linha do tempo e pelo mapa | Os três caminhos abrem o mesmo acontecimento | Como esperado | `previa.spec.ts`, "exploração em tela larga"; `mapa.spec.ts`, "seleção nos dois sentidos" |
| Painel, destaques e endereço em sincronia | A seleção marca o item da lista, a marca da linha do tempo e todos os lugares do acontecimento, abre o painel e entra no endereço | Como esperado | `linha-do-tempo.spec.ts`, "seleção, painel e endereço"; `acabamento.spec.ts`, "continuidade da seleção" |
| Seleção removida pelo filtro | O painel fecha, o destaque sai do mapa e a tela diz por quê | Como esperado | "um filtro que tira o acontecimento do recorte fecha o painel e diz por quê"; "um filtro que tira o acontecimento do recorte limpa o destaque" |
| Pontos sobrepostos | Um marcador com vários acontecimentos abre a lista deles, sem escolher por conta própria; lugares vizinhos continuam acessíveis no zoom máximo | Como esperado | `mapa.spec.ts`, "marcador com vários acontecimentos abre a lista deles, sem escolher nenhum" e "lugares vizinhos continuam acessíveis no zoom máximo" |
| Vários lugares e sem coordenadas | O acontecimento aparece em todos os seus lugares; o que não tem ponto continua na lista, na linha do tempo e no painel, com o motivo | Como esperado | "o número do marcador conta acontecimentos, e cada um aparece em todos os seus lugares"; "acontecimento sem coordenadas: acessível pelo mapa, com o motivo, sem mover a câmera" |
| Comparação | As duas trajetórias no mesmo recorte e na mesma escala, sem ranking nem nota | Como esperado | `comparacao.spec.ts`, 23 testes |
| Acesso direto | Um endereço com consulta abre a tela já no recorte; um endereço inválido abre a página e é corrigido no lugar | **Falhava no build** em três casos (falha 1). Corrigido | `linha-do-tempo.spec.ts`, "endereços inválidos ou incompatíveis"; `paginas.spec.ts`, "abre por link direto" |
| Recarregar, voltar e avançar | A consulta e a seleção voltam como estavam | Como esperado | "recarregar, voltar e avançar restauram a consulta"; "voltar e avançar percorrem filtros e seleção, na ordem em que foram feitos" |
| Cópia de link, alternativa e retorno | O link copiado reproduz o recorte; sem área de transferência, o link aparece em um campo selecionado; da página do acontecimento, o retorno devolve a consulta | Como esperado | `paginas.spec.ts`, "retorno e compartilhamento"; `comparacao.spec.ts`, "copiar o link da comparação" |
| Fontes, créditos e metodologia | Cada registro mostra as próprias fontes, com onde olhar e o que o trecho sustenta; a metodologia traz o catálogo inteiro e os créditos | Como esperado. Duas leituras enganosas foram achadas lendo as telas com os dados reais (falhas 4 e 5) | `paginas.spec.ts`, "todo acontecimento publicado tem página, e os links de fonte são os do registro" e "metodologia" |

### Jornada principal em navegadores instalados

O mesmo caminho foi percorrido no Chrome 154 e no Edge 154 da máquina, com a placa de vídeo, em janela de computador e de celular: abrir, escolher uma pessoa, conferir a lista e o mapa, abrir um endereço com período, selecionar um acontecimento, recarregar, voltar, abrir a página do acontecimento com as fontes e a data, comparar no período de 2003 a 2022, abrir a metodologia e um endereço que não existe. Os 25 passos deram o esperado nos dois. O único erro de console foi o do próprio pedido da página 404.

Foi uma passagem de observação, feita com um roteiro escrito para a sessão, e não um teste do repositório.

## Acessibilidade, celular e falhas de ambiente

| Item | Como foi conferido | Resultado |
| --- | --- | --- |
| Teclado e ordem de foco | `npm run audit:a11y`: passagem com a tecla Tab pelas 8 telas, anotando cada parada | 13 a 86 paradas por tela, em ordem coerente: pular para o conteúdo, menu, troca de pessoa, período e categorias, linha do tempo, lista, mapa, leitura ou perfil, rodapé. Toda parada é visível e tem contorno de 2 ou 3 pixels |
| Linha do tempo pelo teclado | "a linha do tempo funciona pelo teclado, com uma única parada de Tab" | Passou |
| Painéis e retorno de foco | "abrir um acontecimento troca a lista pela leitura, e fechar devolve o foco"; "o seletor abre, percorre, escolhe e fecha pelo teclado, devolvendo o foco"; "em celular, a leitura entra com a transição e o foco vai para o título" | Passou |
| Contraste | `npm run audit:a11y`: cálculo sobre o texto como foi desenhado, em 8 telas e 4 larguras, com a cor do texto e a do fundo de cada elemento; mais os pares de cor do sistema em `tests/design.test.ts` | Nenhum texto abaixo de 4,5:1 (3:1 para texto grande). O menor valor foi 5,24:1. O cálculo não enxerga camadas postas por cima do texto: a falha 3 foi achada olhando a captura |
| Movimento reduzido | "as transições e o aviso de carregamento ficam sem movimento" | Passou |
| Lista acessível sem o desenho do mapa | "sem o pacote do mapa, a exploração textual fica inteira e oferece recarregar"; "a leitura não depende do mapa" | Passou, agora também no build (falha da bancada) |
| Computador e larguras móveis | 1440×900, 768×1024, 390×844 e 360×800, nas 8 telas | Nenhuma rolagem lateral. Só emulação |
| Navegador sem WebGL | Teste novo: "navegador sem WebGL: os lugares viram lista na exploração e na página do acontecimento, sem oferecer nova tentativa" | Passou. A simulação fica dentro do teste |
| Falha no carregamento da base do mapa | "se os contornos não carregam, a lista de lugares assume, e tentar de novo recupera" | Passou |
| Perda do contexto gráfico | "perda do contexto gráfico: o mapa avisa, retoma sozinho e, se não retomar, cede o lugar à lista" | Passou |
| Recorte sem pontos | "recorte sem ponto nenhum diz isso no mapa, e a lista continua" | Passou |
| Fuso do aparelho | Teste novo, com três fusos | Passou |

O relatório da passagem e as 32 capturas das telas estão em [capturas/fase-9/](capturas/README.md). As capturas foram olhadas: é assim que a falha 3 apareceu, e é o que a passagem não faz sozinha.

Observações que não viraram correção:

- **Alvos de toque.** Nas telas de celular, os controles da jornada têm 44 pixels ou mais. Ficam abaixo disso o nome do atlas no cabeçalho (22 pixels de altura), as marcas da linha do tempo e os pontos das faixas da entrada e da comparação (24 por 24). Os 24 pixels são o mínimo do critério 2.5.8 das WCAG 2.2, e todo acontecimento também está na lista, com alvo grande. Em computador, o botão "Copiar link desta consulta" tem 16 pixels de altura; passa pela regra do espaçamento, e poderia ser mais alto.
- **O que fica fora do período, na comparação.** Com um período escolhido, a comparação cobre com a hachura tudo o que está fora dele, inclusive o nome dos cargos e as notas das faixas daquele trecho. O contraste desse texto cai de propósito: é o desenho documentado, o eixo de anos fica livre, e as colunas abaixo das faixas trazem a mesma informação em texto. Fica registrado para a revisão de design, caso se queira o texto legível sob a hachura.
- **Leitor de tela.** Nomes, papéis e estados são conferidos pelos testes, que encontram os elementos pelo papel e pelo nome acessível. Nenhum leitor de tela foi usado.

## Falhas encontradas e correções

| Nº | Falha | Causa | Mudança | Verificação |
| --- | --- | --- | --- | --- |
| 1 | No build, um link com consulta inválida deixava a área principal encoberta por 6 segundos, com o aviso "Abrindo a consulta do endereço…". Acontecia quando o endereço corrigido ficava sem consulta: parâmetro fora do formato, acontecimento de outro perfil, período fora da cobertura | A tela é descoberta quando o endereço lido é igual ao da barra. A correção do endereço era feita depois dessa conferência, na mesma passagem, e nenhuma outra acontecia. No servidor de desenvolvimento o React repete os efeitos e escondia o defeito | A conferência passou para depois da correção do endereço, em `src/lib/state/AtlasUrlStateProvider.tsx` | Os três testes de "endereços inválidos ou incompatíveis" falhavam no build e passaram a passar. As jornadas agora rodam também sobre o build |
| 2 (bancada) | Quatro testes que simulam a falta do pacote do mapa não simulavam nada no build | Eles bloqueavam o arquivo pelo nome que ele tem no servidor de desenvolvimento. No build o nome é um código | `tests/e2e/map-package.ts` reconhece o pacote também pelo conteúdo, nos dois ambientes | Os quatro testes passam no build, e o do movimento reduzido usa o mesmo auxiliar |
| 3 | Com um período escolhido, os anos do eixo da linha do tempo ficavam cobertos pela hachura, com contraste de cerca de 1,6:1. São os anos que a pessoa lê para escolher outro período | A hachura cobria a altura inteira do eixo, incluindo a linha dos anos. O guia de design já dizia, para a lista, que a hachura não passa pelas letras | Na exploração, a hachura para acima dos anos (`PeriodShade`, `Timeline`). O desenho das marcas e da régua não mudou | Contraste medido na captura: de 1,6:1 para 8:1. Teste novo, "com um período escolhido, a hachura não passa pelos anos do eixo", em computador e em celular; ele falha com 11 anos cobertos quando a mudança é desfeita. Capturas em `docs/capturas/fase-9/` |
| 4 | Nas páginas dos acontecimentos de 1975, 1980 e 1986, a ficha dizia "Lula: Presidente". Na linha do tempo, a faixa de cargos trazia uma barra "Presidente" nos anos 1980 | Três cargos de Lula tinham o nome "Presidente", e a instituição (o sindicato, o PT) ficava em outro campo, que essas duas telas não mostram | Conteúdo: os cargos passaram a "Presidente do Sindicato dos Metalúrgicos" e "Presidente do PT". Está no registro de alterações da edição 0.1.1 e em [EDITORIAL-REVIEW.md](EDITORIAL-REVIEW.md), correção 13 | As três páginas foram relidas no build. Teste novo recusa nome de cargo repetido entre instituições da mesma pessoa |
| 5 | A ficha da página do acontecimento dizia "Cargos e funções registrados no atlas na data do acontecimento" também quando só o ano está documentado | Para data parcial, a regra lista os cargos de qualquer momento do ano ou do mês. A nota não acompanhava a precisão | A nota diz "na data", "no mês" ou "no ano" | O teste "abre por link direto, com o conteúdo do registro" confere a nota nas páginas que ele abre, de dia e de ano |
| 6 | Sete endereços de fichas do TSE abriam uma página de erro | Formato antigo do endereço | Conteúdo: endereços no formato atual. [EDITORIAL-REVIEW.md](EDITORIAL-REVIEW.md), correção 1 | Abertos em um navegador comum |

Evidência da falha 1, do registro da primeira execução sobre o build: 7 falhas em 180 testes, entre elas "parâmetros fora do formato: a página abre, e o endereço é corrigido no lugar", com a lista com 0 itens visíveis. Depois das correções 1 e 2: 180 de 180. Com os testes novos: 184 de 184.

Evidência da falha 3: [antes](capturas/fase-9/eixo-do-periodo-antes.png) e [depois](capturas/fase-9/eixo-do-periodo-depois.png).

## Comandos e resultados finais

Rodados em 9 de outubro de 2026, depois da última mudança de código e de conteúdo.

| Comando | Resultado |
| --- | --- |
| `npm run data:validate` | 0 erros, 0 avisos, 5 pendências (os 5 rascunhos, fora da publicação) |
| `npm run check` | Passou: lint, tipos, 502 testes de regras, build e conferência da saída (276 arquivos, 47 páginas, 39 acontecimentos com página, 5 rascunhos sem página) |
| `npm run test:journeys` | 184 passando |
| `npm run test:export` | 16 passando |
| `npm run test:e2e` | 205 passando |
| `npm run audit:a11y` | 32 telas e 8 passagens de teclado sem problema |

### Desempenho

As medições de [PERFORMANCE.md](PERFORMANCE.md) não foram refeitas. As mudanças da fase não tocam o que elas medem: nenhum arquivo novo é carregado, o JavaScript da saída continua com 18 arquivos, e as mudanças de código são a ordem de dois efeitos, uma classe de posição e um texto. A saída tem 10,4 MB, contra os 10,3 MB documentados; a diferença é texto de conteúdo.

## O que não foi verificado

- **Aparelho móvel real.** Não havia um disponível para a sessão. O roteiro de validação com pessoas pede pelo menos uma sessão em celular de verdade.
- **Firefox e Safari.** As versões desses navegadores instaladas com o Playwright são de outra versão da ferramenta e não abrem. Nada foi instalado para contornar. Para conferir depois: `npx playwright install firefox webkit`.
- **Leitor de tela**, com NVDA, VoiceOver ou TalkBack.
- **Zoom do navegador a 200% e 400%.** As larguras estreitas dão uma aproximação, e não substituem o teste.
- **Conexão lenta e uso real.** As medições de laboratório estão em PERFORMANCE.md; não há dados de campo.
- **Hospedagem.** Tudo foi conferido com o servidor local do projeto. O comportamento na hospedagem escolhida é da fase 10.

Uma observação de bancada: o teste de linha de comando "query: consulta os dados gerados e recusa dados de outra versão do conteúdo" leva 2 segundos sozinho e passou do limite de 5 segundos uma vez, quando foi rodado junto com a suíte de navegador. Sozinho e dentro de `npm run check`, passou. Rode os comandos um de cada vez.

## Auditoria de QA de 11 de outubro de 2026

O que está acima é o registro da fase 9, de 9 de outubro de 2026, e fica como foi. Em 11 de outubro uma auditoria externa de prontidão para produção pediu correções; o que foi feito, os resultados e as pendências estão em [STATUS.md](STATUS.md), seção Auditoria de QA de produção. O que mudou no modo de verificar:

- **A passagem de acessibilidade** (`npm run audit:a11y`) cobre 20 telas em 4 larguras: as 8 do atlas e 12 do jogo, com as salas temáticas e os passos da missão de decisão (a ajuda com o humor desligado, a decisão recolhida, as duas etapas da resposta, o erro, a conclusão e a transição). O progresso e a preferência são semeados no navegador, e cada tela preparada declara o que tem de continuar na página até o fim da medição: se a tela mudar antes, a passagem falha em vez de medir a tela seguinte. Na passagem de teclado, uma janela aberta prende o foco, e a volta a um controle já visitado encerra a contagem.
- **As capturas dos acervos** têm conferência própria (`npm run capturas:verificar`), que roda na verificação contínua.
- **A régua de publicação** tem um comando: `npm run release:check`.
- **Afirmação de ausência em tela que some sozinha.** A transição entre capítulos segue depois de 2,6 segundos. Uma afirmação com espera de que algo não está nela passa quando a própria transição sai. A jornada que confere a transição lê o conteúdo dela de uma vez, enquanto está na tela. Foi a mutação à mão que mostrou o engano.
- **O teste de linha de comando que passava do tempo** quando a suíte inteira rodava em paralelo (a observação de bancada acima) ganhou limite de 20 segundos: ele abre vários processos do Node, e leva perto de 2 segundos sozinho.

## Trilha simples do jogo, 11 de outubro de 2026

No mesmo dia o jogo foi refeito como uma trilha de fases curtas, e os testes dele foram reescritos junto. Os resultados estão em [STATUS.md](STATUS.md), seção Trilha simples do jogo e edição 0.3.0. O que mudou no modo de verificar:

- **As jornadas do jogo são outras** (`tests/e2e/jogo.spec.ts`). Cobrem o que o pedido da trilha listou: o visitante novo começa na origem das duas pessoas; entrar direto em um aprofundamento explica o recorte e deixa voltar ao início da vida; continuar e rever desde o início não se confundem nem apagam nada; uma resposta ou a leitura da explicação basta para avançar, e os registros opcionais não seguram a fase; o erro não tira acesso e vem com explicação; um progresso do jogo anterior migra sem virar aprendizado novo; o humor respeita o contexto e a preferência; a leitura sem o cenário funciona pelo teclado e quando o canvas falha; e a navegação, o foco, a volta de um documento e o progresso funcionam sobre a exportação.
- **Os valores esperados saem do conteúdo publicado** (`tests/e2e/jogo-apoio.ts`), e não de texto copiado no teste: uma correção de redação não quebra a jornada, e uma regressão na tela, sim. A fala do Escrivão esperada vem do catálogo, pela mesma função que a tela usa.
- **Uma jornada mede todo controle das telas do jogo em celular** (D-148), em 360×640 e em 390×844, e reprova qualquer um com menos de 44 pixels de altura ou de largura, inclusive os links de texto. A passagem de acessibilidade continua deixando de fora os links no meio de uma frase; por isso esta jornada existe. Sem a altura de toque dos caminhos, ela reprova (conferido por mutação).
- **O conteúdo das fases tem testes próprios** (`tests/game-phases.test.ts`): tamanho da explicação, anos, porcentagens e números com casa de milhar escritos contra os registros apontados, termos definidos antes de usados, a opção certa que não fica sempre na mesma posição e o mesmo formato para as duas pessoas. Esses testes conferem a estrutura e as referências. Não conferem se a explicação é fiel nem se uma pessoa a entende: isso é da revisão humana e da validação com pessoas.
- **A passagem de acessibilidade** (`npm run audit:a11y`) cobre 25 telas em 4 larguras: as 8 do atlas e 17 do jogo (a entrada, a cena dos dois personagens, os dois aprofundamentos, a ajuda com o humor desligado, a fase aberta, a resposta errada e a certa, a ordenação, a fase de processos, um registro, uma decisão, a lista de fases, o resumo, a leitura sem o cenário e a retomada). O relatório vai para `test-results/a11y/`, que a suíte de navegador apaga ao começar: rode a passagem por último, ou guarde o relatório.
- **A suíte sobre a exportação** (`tests/export/jogo.spec.ts`) confere que a leitura sem o cenário não baixa o palco, por nenhum caminho, que sem JavaScript a casca do cenário sai e as fases estão no HTML, e o que acontece quando o pacote do palco ou o da prévia não chega.
- **O teste das cenas** (`tests/game-scenes.test.ts`) passou a recusar pasta atrás da porta, e não só colada a ela: o portal passa da cabeça do personagem, e uma pasta na coluna dele, poucos passos para o fundo, saía cortada pela verga. Foi o que aconteceu na sala de audiências da fase 6 de Flávio Bolsonaro, e só apareceu olhando a captura. Com a pasta de volta ao lugar antigo, o teste reprova (conferido por mutação).
- **O medidor do jogo** (`npm run measure:game`) amostra a caminhada só enquanto o boneco anda, e mede também uma fase pedida pelo endereço, que não é a do HTML do build.
- **O servidor de pré-visualização guarda os arquivos em memória.** Depois de um build novo, pare e suba de novo qualquer `npm run preview` que estivesse aberto; as suítes sobre a exportação sobem o próprio servidor, mas reaproveitam um que já esteja na porta 4311.
- **A revisão independente antes do envio acrescentou guardas** (D-149). Nos testes de regra: nenhuma ordenação aparece na tela já na ordem certa; a pergunta só aponta termo que a própria fase explica; os registros de "Explorar este período" caem nos anos da fase; as duas candidaturas têm o mesmo número de ressalvas, e nenhuma avalia a frase; a frase de proposta que cita uma página tem essa página na citação e não fala em futuro certo; e o humor não fala de outra pessoa, de nascimento nem de aniversário. Nas jornadas, duas novas na leitura sem o cenário: apagar o progresso com a fase aberta, e errar na última fase e ver o resumo. A revisão também mostrou o que os testes não pegam: regra editorial aplicada de modo desigual às duas pessoas, afirmação que o registro não sustenta e documento desatualizado só aparecem na leitura.

O que continua sem verificação: leitor de tela, aparelho real, Firefox e Safari, e qualquer pessoa usando o jogo.

## Como repetir

```
npm run check            # lint, tipos, regras, build e conferência da saída
npm run test:journeys    # jornadas sobre a exportação estática
npm run test:export      # carregamento sobre a exportação estática
npm run test:e2e         # as mesmas jornadas e as telas de prova, no servidor de desenvolvimento
npm run audit:a11y       # contraste, rolagem lateral, alvos e ordem de foco, com capturas
npm run capturas:verificar   # as capturas brutas dos acervos contra o corpo original
npm run verify:release   # a barreira de publicação: recusa sem revisão humana, domínio e canal
```

`npm run test:journeys`, `npm run test:export` e `npm run audit:a11y` precisam de um build pronto (`npm run build`). Rode as jornadas sobre o build sempre que mexer em efeitos do React: o servidor de desenvolvimento repete os efeitos e pode esconder um defeito de ordem, como o da falha 1.
