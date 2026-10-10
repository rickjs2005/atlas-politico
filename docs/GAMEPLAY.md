# Jogo

O atlas tem um segundo caminho de leitura: um jogo em que o visitante escolhe Lula ou Flávio Bolsonaro, controla um personagem por cenários isométricos e percorre a trajetória pública inteira em capítulos. Em cada capítulo há registros do atlas espalhados pelo cenário e uma tarefa curta; com todos os registros recolhidos e a tarefa cumprida, a saída abre e leva ao capítulo seguinte.

A versão candidata a lançamento cobre **todos os 39 acontecimentos publicados da edição 0.1.1**: seis capítulos de Lula e cinco de Flávio Bolsonaro, com quatro tipos de tarefa, sete ambientes, uma figura de cada personagem por época, a ficha judicial dos episódios de processo, o progresso salvo por personagem (com migração do formato da etapa 1) e o caminho de ida e volta até as fichas e as fontes. A matriz acontecimento → personagem → capítulo é gerada dos dados em [GAME-COVERAGE.md](GAME-COVERAGE.md). O que está pronto, o que foi conferido e o que falta está em [STATUS.md](STATUS.md) e em [GAME-RELEASE.md](GAME-RELEASE.md).

O jogo não muda o que o atlas afirma. Ele não tem conteúdo editorial próprio: cada registro que aparece é um acontecimento publicado, com o título, a data, o resumo, o contexto, o lugar documentado e as fontes do conjunto. Toda a conferência desse conteúdo continua sendo assistida por IA, com a revisão humana pendente ([HUMAN-REVIEW.md](HUMAN-REVIEW.md)), e as sessões de validação com três pessoas continuam por fazer ([USER-VALIDATION.md](USER-VALIDATION.md)). O jogo diz isso nas próprias telas.

## Como abrir

```
npm run build      # gera os dados e o site estático em out/
npm run preview    # serve out/ em http://localhost:4311
```

| Endereço | O que é |
| --- | --- |
| `http://localhost:4311/jogo/` | Entrada do jogo: escolha do personagem, prévia do mundo, capítulos e onde cada um parou |
| `http://localhost:4311/jogo/lula/` e `/jogo/flavio-bolsonaro/` | O jogo de cada personagem, no capítulo em que parou |
| `http://localhost:4311/` | Entrada do atlas, com o acesso **Jogar com** abaixo de cada cartão |

Em desenvolvimento: `npm run dev` e `http://localhost:3000/jogo/`. A galeria da arte, que só existe em desenvolvimento, fica em `http://localhost:3000/dev/jogo-arte/` (com `?parado`, cada peça é desenhada uma vez; é assim que `node scripts/capture-art.mjs` a captura).

## Fluxo

```
entrada do jogo (/jogo/)
   │  escolhe o personagem
   ▼
capítulo aberto (/jogo/<personagem>/)        ┌─────────────────────────────┐
   │  objetivo e contagem no alto da cena    │ painel Capítulos e tarefas  │
   │  anda, encontra os registros            │ faz o mesmo por botões,     │
   │  E ou Ação: recolhe e lê o registro ───▶│ sem o cenário               │
   │  tarefa com resposta: ordem, documento  └─────────────────────────────┘
   │  ou lugar, com explicação e nova tentativa
   ▼
todos os registros recolhidos e a tarefa cumprida: a saída abre
   │  atravessa a saída
   ▼
transição: capítulo concluído; o próximo, com período, cenário, época e contexto
   ▼
capítulo seguinte ... até o fim da trajetória, que aponta para o atlas completo
```

1. **Entrada.** Os dois personagens aparecem com o mesmo cartão, em ordem alfabética: prévia do cenário do primeiro capítulo, retrato, capítulos com os períodos e a situação neste navegador: "Começar" para quem não jogou, "Continuar" para quem já recolheu algum registro, com o capítulo em que parou, e "Rever" para quem concluiu a trajetória. A página diz que os cenários são representações, que o guia é fictício e qual é a situação da revisão do conteúdo.
2. **Cena.** Ocupa a altura da janela abaixo do cabeçalho. O personagem aparece de corpo inteiro, na figura da época do capítulo, anda nas oito direções, para nas paredes e nos móveis, e a câmera o acompanha.
3. **Objetivo.** Fica escrito sobre a cena, com o capítulo, o período, o nome do cenário (apresentado como cenário) e a época da figura. Logo abaixo, a contagem: quantos registros já foram recolhidos, de quantos, e o que ainda segura a porta.
4. **Registros.** Cada acontecimento do capítulo é uma pasta de documentos que paira sobre uma marca no chão. Perto de uma delas, a pasta ganha destaque, aparece um anel no chão e a dica do que fazer; a tecla de interação recolhe e abre o registro: data na precisão documentada, título, categoria, lugar documentado, resumo, o contexto da ficha, a ficha judicial quando o registro é de processo, as fontes com o que cada uma sustenta, a situação da revisão e o caminho para a ficha completa.
5. **Saída.** É uma porta no vão da parede da frente. Fica fechada, com uma tranca e um cadeado, enquanto faltar a tarefa ou algum registro do capítulo, e diz o que falta. Com todos os registros recolhidos e a tarefa cumprida, o texto do objetivo muda, a tranca some, a folha gira para fora, a placa sobre a porta acende e o degrau ganha setas que apontam para fora. Atravessa quem anda para dentro da porta ou quem, ao lado dela, usa a tecla ou o botão de interação.
6. **Transição.** Ao atravessar, uma tela curta diz o capítulo concluído e apresenta o seguinte: título, período, cenário, época da figura e o contexto do capítulo (o motivo do agrupamento, que diz quais registros ele reúne).
7. **Fim da trajetória.** Depois do último capítulo, a tela diz quantos capítulos e quantos acontecimentos foram percorridos e leva à trajetória completa no atlas, à comparação e à escolha de personagem. Não há nota, vitória nem elogio.

## Capítulos

Os capítulos são agrupamentos de acontecimentos publicados, pelo `id` do conjunto. A definição está em `src/lib/game/chapters.ts`; um teste confere cada capítulo contra o conteúdo da edição (`tests/game-chapters.test.ts`), e outro confere que todo acontecimento de cada personagem está em um capítulo dele (`tests/game-coverage.test.ts`). As datas de cada registro, por capítulo, estão em [GAME-COVERAGE.md](GAME-COVERAGE.md), gerado por `npm run game:coverage`.

### Lula

| Capítulo | Período | Cenário | Figura | Registros | Tarefa |
| --- | --- | --- | --- | --- | --- |
| 1. Sindicato, greves e partido | 1975–1980 | Salão do sindicato | primeiros anos | 4 | encontrar o registro da eleição de 1975 |
| 2. Constituinte e disputas presidenciais | 1986–1994 | Plenário da Constituinte | anos intermediários | 3 | ordem: a Constituinte e a primeira disputa presidencial |
| 3. Presidência: eleição e reeleição | 2002–2006 | Comitê de campanha | anos intermediários | 2 | documento que sustenta o registro da eleição de 2002 |
| 4. Nomeação suspensa, processos e prisão | 2016–2019 | Sala de audiências | anos recentes | 6 | ordem: a condenação em primeira instância e a confirmação pelo TRF4 |
| 5. Anulação, terceira eleição e intervenção federal | 2021–2023 | Gabinete | anos recentes | 3 | lugar documentado da anulação das condenações |
| 6. Convenção e primeiro turno de 2026 | 2026 | Auditório de convenção | anos recentes | 2 | documento que sustenta o registro do primeiro turno |

### Flávio Bolsonaro

| Capítulo | Período | Cenário | Figura | Registros | Tarefa |
| --- | --- | --- | --- | --- | --- |
| 1. Assembleia e disputa pela Prefeitura | 2002–2016 | Salão da Assembleia | primeiros anos | 5 | encontrar o registro da primeira eleição, de 2002 |
| 2. Senado: eleição, Mesa e partido | 2018–2019 | Plenário do Senado | anos intermediários | 3 | ordem: a eleição para o Senado e a 3ª Secretaria da Mesa |
| 3. Denúncia, partidos e decisões judiciais | 2020–2022 | Sala de audiências | anos intermediários | 6 | documento que sustenta a decisão do STJ |
| 4. Liderança da Minoria, relatoria e comissão | 2023–2025 | Sala de comissão | anos recentes | 3 | lugar documentado do projeto relatado |
| 5. Indicação, convenção e primeiro turno | 2025–2026 | Auditório de convenção | anos recentes | 3 | ordem: a convenção do PL e o primeiro turno |

São os 39 acontecimentos publicados: 20 de Lula e 20 de Flávio Bolsonaro, contando o primeiro turno de 2026, que é dos dois e aparece uma vez na trajetória de cada um. Nenhum ficou de fora; a lista de exclusões justificadas (`EXCLUSIONS`, em `src/lib/game/coverage.ts`) está vazia, e o teste exige justificativa escrita para qualquer acontecimento que não esteja em capítulo.

### Por que estes agrupamentos

- **Cada capítulo junta registros próximos no assunto e no tempo,** na ordem da trajetória, sem pular nenhum. As trajetórias têm períodos diferentes (1975 a 2026 e 2002 a 2026), e o jogo não as nivela: é a regra do atlas para carreiras de duração diferente. O número de capítulos e de registros por capítulo segue o que cada trajetória tem, e por isso não é igual (seis e cinco; de dois a seis registros).
- **Título e motivo são inventários, e não um enredo.** O título lista os assuntos dos registros, e o motivo, que aparece no painel e na transição, diz quantos são e quais são. Nenhum dos dois afirma uma causa, uma passagem ou um juízo: isso é o que os registros dizem, cada um na própria ficha. Um teste confere que os anos e as datas escritos nos textos são os dos registros do capítulo, que a contagem bate, que nenhum texto traz fala atribuída e que nenhum decide culpa.
- **Passar de um capítulo ao seguinte nunca sugere uma ordem que as datas não decidem.** Todo registro de um capítulo é anterior, sem ambiguidade, a todo registro do capítulo seguinte: pela data e pela precisão (`datesDecideOrder`), e não pelo ano. Por isso a fundação do PT (10 de fevereiro de 1980) e a prisão (1980, só o ano) ficam no mesmo capítulo; e por isso dois capítulos de Flávio Bolsonaro podem dividir o ano de 2025, porque a presidência da comissão (19 de fevereiro) e a indicação (5 de dezembro) têm dia. O teste dos capítulos confere a regra para todos os pares.
- **Dentro de um capítulo, a ordem em aberto é dita.** O registro da prisão de 1980 leva, no jogo, o mesmo aviso que leva na lista do atlas: "ordem dentro de 1980 não documentada". A regra é a mesma função (`findUndeterminedOrder`, no domínio).
- **Os episódios judiciais ficam juntos, com a ficha própria.** O capítulo 4 de Lula reúne a nomeação suspensa, a condenação, a confirmação, a prisão, o registro indeferido e a soltura; o 5 traz a anulação. O capítulo 3 de Flávio Bolsonaro reúne a denúncia, a anulação pelo STJ de decisões da investigação e a rejeição da denúncia, com as filiações e a liderança do mesmo período. Em todos, a ficha judicial (abaixo) mostra a natureza do registro e as decisões relacionadas, inclusive as de outro capítulo, com a própria data.
- **O primeiro turno de 2026 é apuração parcial.** O registro traz os números com 99,99% das urnas apuradas, como a notícia do TSE os publicou, e o motivo dos dois capítulos diz "apuração parcial". Trocar pelos números da totalização final é uma atualização de conteúdo, com nova entrada na edição e documento oficial lido; o jogo não renomeia nada. O segundo turno é posterior à data de corte e não existe no jogo.
- **Mesmo tratamento.** Os dois personagens passam pelas três épocas da figura, pelos quatro tipos de tarefa (cada trajetória tem pelo menos três, nunca dois iguais seguidos), por cenários próprios de cada período e pela mesma ficha judicial. Nenhuma cor identifica pessoa ou partido, e os cenários não trazem símbolo, sigla, foto nem bandeira reconhecível.

### Datas das tarefas de ordem

Uma tarefa de ordem só usa dois registros cujas datas decidem a ordem sozinhas: os intervalos de cálculo das duas não podem se cruzar (`datesDecideOrder`, em `src/lib/game/mission.ts`).

| Tarefa | Datas | Por que não há ambiguidade |
| --- | --- | --- |
| Lula, capítulo 2 | 1986 e 1989 | Qualquer dia de 1986 vem antes de qualquer dia de 1989 |
| Lula, capítulo 4 | 12 de julho de 2017 e 24 de janeiro de 2018 | Dias diferentes, anos diferentes |
| Flávio Bolsonaro, capítulo 2 | 2018 e 6 de fevereiro de 2019 | Qualquer dia de 2018 vem antes de um dia de 2019 |
| Flávio Bolsonaro, capítulo 5 | 25 de julho de 2026 e 4 de outubro de 2026 | Dias diferentes do mesmo ano, com o dia documentado nos dois |

O par "prisão de 1980" e "fundação do PT em 10 de fevereiro de 1980" não poderia virar tarefa: o ano inteiro contém o dia. O teste dos capítulos recusa uma tarefa assim.

## Tarefas

Cada tarefa tem objetivo, ação esperada e condição de conclusão escritos no código, em `TaskSpec` e nas regras de `src/lib/game/mission.ts`. Não há botão de concluir fase, e nenhuma tarefa exige conhecimento prévio: tudo o que ela pede está no registro recolhido.

| Tipo | Objetivo | Ação | A tarefa está cumprida quando |
| --- | --- | --- | --- |
| `registro` | Encontrar o registro pedido | Chegar perto da pasta e interagir. O registro abre com o resumo, as fontes e o caminho da ficha | O registro pedido foi recolhido |
| `ordem` | Recolher dois registros e pô-los em ordem cronológica | Recolher os dois; o jogo mostra os dois com as datas e pergunta qual veio primeiro | A ordem certa foi confirmada |
| `fonte` | Associar o registro pedido ao documento que o sustenta | Recolher o registro; o jogo mostra o registro e três documentos, e pergunta qual o sustenta | O documento certo foi confirmado |
| `lugar` | Relacionar o registro pedido ao lugar em que o atlas o documenta | Recolher o registro; o jogo mostra o registro e três lugares, e pergunta em qual o atlas o documenta | O lugar certo foi confirmado |

As opções das tarefas de documento e de lugar saem dos próprios registros, nunca de texto escrito no jogo: o documento certo é o primeiro que o registro cita (e qualquer documento citado por ele conta como certo), e as duas alternativas erradas são documentos citados por outros registros do capítulo e por nenhuma citação do registro pedido; o lugar certo é o documentado na ficha, e as alternativas são lugares documentados de outros registros da trajetória. A ordem das opções é fixa e não deixa a certa sempre em primeiro. Um teste confere, sobre o conteúdo real, que toda tarefa de documento e de lugar tem a opção certa e duas erradas.

Uma resposta errada explica e deixa tentar de novo. Na ordem, a explicação mostra os dois registros com as datas, o mais antigo primeiro. No documento, diz de qual registro do capítulo é o documento escolhido, com a data, e lembra que a lista de documentos está no registro recolhido; a resposta certa diz o que o documento sustenta. No lugar, diz de qual registro é o lugar escolhido, com a data. Não há penalidade: nada é perdido, a contagem de tentativas é só informação e a saída continua fechada até a resposta certa. Dá para fechar a pergunta e responder depois, pelo guia, pelo painel ou pela janela da saída fechada.

Os outros registros do cenário não são exigidos pela tarefa, mas são exigidos pela saída. As pastas são iguais por fora: quem procura o registro pedido abre e lê os outros no caminho.

### O que abre a saída

A saída de um capítulo abre com duas condições juntas: **a tarefa cumprida e todos os registros do capítulo recolhidos**, e não só os que a tarefa pede (`isExitOpen`, em `src/lib/game/mission.ts`). Cumprir a tarefa não abre a porta sozinho, e recolher tudo sem responder também não. A regra foi pedida pelo responsável pelo projeto em 10 de outubro de 2026 (D-109) e vale para as quatro tarefas.

| Situação | O que a cena diz | A saída |
| --- | --- | --- |
| Tarefa pendente, registros por recolher | O objetivo do capítulo, e "Registros: n de total · a saída abre com todos". Nas tarefas com resposta, em que recolher tudo não basta, "a saída abre com todos e a ordem certa" (ou "o documento certo", "o lugar certo") | Fechada |
| Tarefa cumprida, registros por recolher | "Tarefa concluída. Faltam N registros para a saída abrir." | Fechada |
| Registros da tarefa recolhidos, resposta por dar | "Os dois registros da tarefa estão com você. Para colocá-los em ordem, abra Como jogar ou Capítulos e tarefas." (ou a frase do documento ou do lugar). Se não falta mais nenhum registro, a contagem diz "falta a tarefa" | Fechada |
| Tarefa cumprida e todos os registros recolhidos | "Tarefa concluída e registros recolhidos. A saída abriu" | Aberta |

A ordem das duas condições é de quem joga. O registro recolhido diz, na própria janela, quantos já vieram e o que falta; a janela da saída fechada, o guia e o painel dizem o mesmo, item por item, e com a resposta pronta para dar levam à pergunta. O painel só oferece **Atravessar a saída** com ela aberta. Vale também para o que foi salvo: um capítulo só consta como concluído com a saída aberta.

## Ficha judicial

Dez registros são episódios de processo: a nomeação suspensa, a condenação, a confirmação, a prisão, o registro de candidatura indeferido, a soltura e a anulação, de Lula; a denúncia, a anulação pelo STJ e a rejeição da denúncia, de Flávio Bolsonaro. No jogo, o registro deles traz uma ficha judicial (`src/lib/game/judicial.ts`):

- **A natureza do registro,** dita sem equiparar o que é diferente: "Denúncia: uma acusação apresentada ao tribunal. Não é condenação."; "Anulação de decisões anteriores. Não é absolvição nem condenação."; "Rejeição da denúncia. Não é absolvição nem condenação."; e assim por diante.
- **Quem alegou, o que a defesa disse, quem decidiu, quando, com que efeito e qual o desfecho na data de corte:** é o contexto da ficha do atlas, mostrado inteiro no registro recolhido ("Contexto, como a ficha do atlas o traz"), sem reescrita.
- **As decisões relacionadas, por identificador, com a própria data,** em ordem cronológica, mesmo quando estão em outro capítulo: do registro da condenação de 2017 se lê que ela foi confirmada em 24 de janeiro de 2018 e anulada em 8 de março de 2021; da denúncia de 2020, que o STJ anulou decisões da investigação em 9 de novembro de 2021 e que o Tribunal de Justiça a rejeitou em 16 de maio de 2022. Cada relação repete o que o contexto do registro já diz; um teste confere que todo identificador existe na edição e nos capítulos do mesmo personagem.
- **O aviso:** "Denúncia, condenação, anulação, rejeição e absolvição são coisas diferentes. O jogo não pede que você decida culpa: mostra o que cada registro documenta e quando."

Nenhuma tarefa pede ao jogador que julgue: as tarefas dos capítulos judiciais são a ordem de duas decisões pelas datas e o documento que sustenta uma decisão.

## Regras editoriais do jogo

Valem as regras de [EDITORIAL.md](EDITORIAL.md), mais estas:

- **O jogo não escreve fatos.** Título, data, categoria, lugar, resumo, contexto e fontes de um registro vêm dos dados gerados. Os textos próprios do jogo (título, motivo e objetivo de cada capítulo, nome do cenário, natureza e relações da ficha judicial) só dizem o que os registros sustentam, e testes conferem que nenhum deles traz fala atribuída nem decide culpa.
- **A data aparece na precisão do registro.** Um acontecimento de que só se sabe o ano aparece com o ano e o aviso "Só o ano está documentado". Quando essa data não decide a posição do registro em relação a outro, ele leva também o aviso "ordem dentro de [ano] não documentada".
- **A situação da revisão aparece em toda leitura.** O registro recolhido traz a mesma nota das outras telas do atlas: conferido com as fontes, com assistência de IA, e revisão humana pendente. A entrada do jogo e o rodapé da página do jogo repetem a frase da edição.
- **Nenhuma fala é atribuída às pessoas retratadas.** Os personagens não falam. Quem orienta é o **Arquivista**, um guia identificado como personagem fictício.
- **O cenário é uma representação.** Não afirma que a pessoa esteve naquele lugar nem que os fatos aconteceram nele. O nome do lugar aparece sempre com o rótulo "cenário", e a frase está na entrada do jogo, no diálogo do guia e no rodapé da página do jogo.
- **A figura de cada época é estilizada.** Cada personagem tem três figuras, uma por época dos capítulos (primeiros anos, anos intermediários, anos recentes), que mudam cabelo, barba e roupa com a mesma escala para os dois. Não afirmam a aparência real da pessoa em cada data, e o cabeçalho da cena, a transição, o painel e o guia dizem qual figura é (D-111).
- **O progresso é de quem joga.** Concluir um capítulo não avalia a pessoa retratada: não há nota, vitória, derrota nem elogio.
- **Mesmo tratamento.** Os dois personagens têm o mesmo cartão, as mesmas mecânicas, os mesmos textos fixos, as mesmas três épocas e o mesmo cuidado de desenho; a ordem é alfabética. Nenhuma cor identifica pessoa ou partido, e os cenários não trazem símbolo, sigla, foto nem bandeira reconhecível.
- **Fatos e documentos fora do jogo.** Nada fica preso a uma missão: todo registro tem ficha em `/acontecimentos/<slug>/`, e a trajetória completa continua em `/politicos/<slug>/`, na comparação e na metodologia. O painel e a tela de fim levam a esses endereços.

## Controles

| Onde | Andar | Interagir | Painel |
| --- | --- | --- | --- |
| Teclado | Setas ou W, A, S e D. Duas teclas juntas andam na diagonal da tela, que é o sentido dos corredores | E, Enter ou espaço, com o que estiver ao alcance | Esc, ou o botão **Capítulos e tarefas** |
| Toque | Direcional de oito direções, no canto de baixo à esquerda. O dedo pode deslizar de uma direção a outra | Botão de ação, no canto de baixo à direita, com o nome da ação disponível | Botão **Capítulos e tarefas** |

- As teclas só valem com o foco na cena. Fora dela, as setas rolam a página e Enter aciona o botão em foco, como em qualquer página.
- As teclas são lidas pela posição no teclado: soltar uma tecla com Shift ou com a trava de maiúsculas no meio do caminho solta a mesma tecla. Um atalho do navegador (com Ctrl, Alt ou a tecla de comando) não é do jogo e passa direto.
- O movimento para, e as teclas presas são soltas, quando um diálogo ou o painel abre, quando a janela perde o foco e quando a aba fica oculta. A cena avisa: "Pausado: a janela perdeu o foco".
- Uma tecla segurada desde antes de uma janela abrir não age nela: o Enter que recolheu um registro não fecha o registro, e a seta com que se atravessou a saída não rola a página. Vale até a tecla soltar.
- O toque no botão de ação age ao encostar, e não ao levantar o dedo: dá para andar com um dedo e agir com outro. As janelas do jogo não aceitam toque nem clique por um terço de segundo ao abrir, porque em celular o botão que as fecha aparece onde estava o botão de ação.
- Quem anda reto por um corredor e roça a quina de um móvel não fica preso: o passo vira um desvio curto para o lado livre. De frente para o móvel, o personagem para.
- O dedo sobre a cena ainda rola a página na vertical; só o direcional e o botão de ação seguram o gesto.
- Com o celular deitado, o palco cabe na janela e o que fica sobre a cena encolhe, para o objetivo, o direcional e o botão de ação aparecerem juntos.

## Acessibilidade

- **Tudo pode ser feito sem o cenário.** O painel **Capítulos e tarefas** lista os capítulos com a situação, o tipo de tarefa e o período de cada um, e, para o capítulo aberto, o objetivo, o motivo, os registros e os botões para recolher, ler de novo um registro já recolhido, responder a tarefa (ordenar, indicar o documento, indicar o lugar) e atravessar a saída, que só é oferecida quando está aberta. Cada botão de recolher e de reler diz, no nome, qual é o registro; na volta de uma releitura, o foco fica no botão do registro lido. É o mesmo progresso da cena, com a mesma regra.
- **Foco.** Cada diálogo prende o foco enquanto está aberto, fecha com Esc e devolve o foco à cena. Quando os botões de um diálogo mudam (as tarefas trocam **Confirmar** por **Tentar de novo** ou **Continuar**), o foco vai para o botão que entrou. Com um diálogo aberto, a cena e os botões sobre ela saem da tabulação (`inert`). O foco é o contorno do atlas; na cena, ele é desenhado para dentro e por cima do canvas. Se a cena não carregou, o foco volta ao botão **Capítulos e tarefas**.
- **O menu do site continua por cima.** As janelas do jogo ficam em uma camada própria, abaixo do cabeçalho: em celular, o menu abre sobre elas.
- **Leitores de tela.** A cena é uma região com nome e instruções; a dica do que está ao alcance e os retornos da tarefa são anunciados (`role="status"`). O conteúdo de cada registro é texto comum. Nenhum leitor de tela foi usado na conferência.
- **Movimento reduzido.** Com `prefers-reduced-motion`, nada balança, pisca nem flutua, a câmera não desliza, a porta abre de uma vez e o registro recolhido some de uma vez. As regras e os estados são os mesmos.
- **Contraste.** Os textos do jogo usam os tokens do atlas e entram na passagem de acessibilidade (`npm run audit:a11y`).

## Progresso

- Um progresso por personagem, em `localStorage`, na chave `atlas-politico:jogo:<personagem>`.
- Formato com versão (`versao: 3`): por capítulo, a situação (`bloqueado`, `disponivel` ou `concluido`) e o estado da tarefa (registros recolhidos, resposta confirmada, tentativas e, com a confirmação, a assinatura da tarefa respondida).
- **A confirmação pertence a uma tarefa.** A assinatura é o tipo e os identificadores que a tarefa pede (`taskSignature`, por exemplo `ordem:a+b`). Se a tarefa de um capítulo mudar sob os mesmos identificadores (a ordem de dois registros vira o documento de um deles, ou passa a pedir outro par), a resposta antiga deixa de valer na leitura: o capítulo reabre com o que foi recolhido e as tentativas, e só a pergunta é feita de novo. A versão do formato é do armazenamento; a assinatura é o que diz a qual tarefa a resposta pertence (D-119).
- **Migração explícita das versões 1 e 2.** A etapa 1 guardava a tarefa com `ordemConfirmada`; a versão 2 chamou o campo de `confirmada`, porque vale para a ordem, o documento e o lugar; nenhuma das duas guardava a assinatura. A leitura aceita as três versões e devolve sempre a atual; o nome antigo só vale na versão 1, e o novo nas seguintes. Uma confirmação das versões 1 e 2 migra pela tabela congelada do que cada capítulo pedia então (`LEGACY_SIGNATURES`, em `progress.ts`): se a tarefa continua a mesma, a confirmação ganha a assinatura; se mudou, cai (`parseProgress`, com testes em `tests/game-progress.test.ts` e no navegador). Quem terminou os dois capítulos da etapa 1 reabre o jogo com o capítulo 3 disponível e os dois primeiros concluídos: o progresso não se perde e os capítulos novos ficam liberados.
- Transições previsíveis: no início, só o primeiro capítulo está disponível; atravessar a saída aberta marca o capítulo como concluído e libera o seguinte; reiniciar volta ao início. Um capítulo concluído pode ser revisto sem mudar nada: nele tudo já foi recolhido, e os registros são relidos pelo painel (**Ler de novo**), de onde também se chega à ficha de cada um.
- **Dados inválidos viram começo, e não erro.** Versão desconhecida, outro personagem, forma errada ou capítulo que a edição não tem mais: o progresso é descartado ou acertado, e a progressão é reaplicada (nunca há dois capítulos disponíveis nem um concluído sem a saída aberta). Se um capítulo mudou entre uma edição e outra, os registros que ele não cita mais saem dos recolhidos, e uma resposta confirmada só vale com os registros da tarefa atual.
- **Sem armazenamento, o jogo continua.** Em modo privado ou com o armazenamento bloqueado, o progresso fica em uma cópia da página: vale enquanto ela estiver aberta, inclusive ao ir à ficha de um registro e voltar pelo site, e se perde ao recarregar ou fechar. O painel avisa.
- **Sem canvas, o jogo continua.** Se o navegador não oferece o desenho em canvas 2D (política, extensão, falta de memória), o lugar da cena mostra um aviso com o botão que abre o painel, e o capítulo é jogado por ele, como quando o pacote do palco não chega. Testado no navegador com o contexto 2D negado.
- **Reiniciar** pede confirmação em uma janela do próprio jogo, apaga só o progresso daquele personagem e devolve o personagem ao início da cena.
- **Abrir um link direto não altera o progresso.** O endereço não carrega progresso: a página de um acontecimento aberta pelo jogo leva só `origem=jogo` e o personagem, para oferecer **Voltar ao jogo**.
- Duas abas no mesmo personagem não se sincronizam: cada uma segue com o próprio progresso até recarregar, e fica guardado o que foi gravado por último.

## Arquitetura do jogo

Dados históricos, configuração dos capítulos, regras de missão, estado do jogador e desenho do mundo ficam em lugares separados, e as fronteiras são as do atlas ([ARCHITECTURE.md](ARCHITECTURE.md)).

| Parte | Onde | O que é | Não faz |
| --- | --- | --- | --- |
| Dados históricos | `generated/dados/`, pelo pipeline | Os acontecimentos, com datas, lugares, contexto e fontes | Não mudam por causa do jogo |
| Recorte para o jogo | `src/lib/game/content.ts` | Os registros citados pelos capítulos, com as fontes resolvidas (e o que cada uma sustenta), o lugar documentado, a situação da revisão e a marca de ordem em aberto. Montado no build | Não escreve texto |
| Capítulos | `src/lib/game/chapters.ts` | Identificadores dos acontecimentos, tarefa, cenário e época de cada capítulo | Não repete conteúdo editorial |
| Cobertura | `src/lib/game/coverage.ts` | A matriz acontecimento → personagem → capítulo e as exclusões justificadas; gera [GAME-COVERAGE.md](GAME-COVERAGE.md) | Não decide capítulos |
| Ficha judicial | `src/lib/game/judicial.ts` | A natureza de cada episódio de processo e as decisões relacionadas, por identificador | Não escreve fatos novos |
| Cenários | `src/lib/game/scenes/` | O mapa de cada cena, os objetos, a paleta e a arte que a desenha | Não conhece o desenho |
| Regras de missão | `src/lib/game/mission.ts` | Recolher, cumprir a tarefa, abrir a saída, decidir a ordem, montar as opções de documento e de lugar, avaliar uma resposta | Não guarda estado |
| Progresso | `src/lib/game/progress.ts`, `storage.ts` | Situação dos capítulos, transições, formato salvo com migração, armazenamento | Não conhece a interface |
| Mundo | `src/lib/game/world/` | Projeção isométrica, grade e colisão, movimento, alcance, câmera, direcional | Não desenha |
| Desenho | `src/features/game/draw/` | Personagens por época, as nove artes de ambiente (`arts/`), objetos, registro e efeitos, por código | Não conhece regras |
| Motor | `src/features/game/engine/` | Laço de animação, entrada, ordem de profundidade | Não conhece capítulos |
| Interface | `src/features/game/` | A casca (`GameShell`), o palco (`GameStage`), os diálogos (registro, ordem, escolha, guia, saída fechada, reinício, transição, fim), o painel, o HUD, o toque, a entrada | Não lê arquivos |
| Rotas | `src/app/jogo/` | `/jogo/` e `/jogo/[personagem]/`, geradas no build | |

`src/lib/game/` é puro: sem React, sem arquivos, sem o Zod. O ESLint confere, como nas outras camadas.

### Cena e arte

Uma **cena** (`SceneId`) é o layout de um capítulo: mapa, objetos, paleta, posições. Uma **arte** (`SceneArtId`, em `src/features/game/draw/arts/`) é o que desenha piso, paredes, porta e materiais. Cada cena aponta a arte que a desenha; duas cenas podem dividir uma arte com paleta e disposição próprias, como as duas salas de audiências e os dois auditórios. São onze cenas e nove artes: as quatro da etapa 1 (salão de sindicato, plenário de constituinte, salão de assembleia, plenário de senado) e as cinco novas (comitê de campanha, sala de audiências, gabinete, sala de comissão, auditório de convenção). Um teste confere que toda cena aponta uma arte registrada, que toda arte é usada e que duas cenas da mesma arte têm paletas diferentes (D-112).

### Por que canvas 2D, e não uma biblioteca de jogo

- A cena é pequena: uma sala de 12 por 9 células, uns vinte objetos e três personagens. O canvas 2D dá conta, com um cuidado: o que é fixo é desenhado uma vez (abaixo).
- A stack instalada não tem motor de jogo, e o projeto evita dependência nova sem necessidade.
- A arte é vetorial, desenhada por código: não há folha de sprites para carregar, o traço acompanha a densidade da tela e o zoom, e os recursos são todos do próprio projeto.
- O mapa do atlas já usa WebGL. O jogo não usa: as páginas do jogo não têm mapa, e as páginas com mapa não têm cena.

### Desenho por quadro

O cenário tem milhares de traços, e refazê-los a cada quadro custava caro. Por isso o que não muda de um quadro para o outro é desenhado uma vez, em telas à parte, e copiado: as paredes de trás com o piso e os detalhes de chão; os parapeitos da frente; e cada objeto parado. A cada quadro, de novo, só o que se move: o personagem, o guia, os registros, a porta, a bandeira e a planta, que balançam, e os efeitos. A cadência medida nesta máquina está em [STATUS.md](STATUS.md) (`npm run measure:game`); é medição de laboratório, e não prevê um aparelho real.

### Carregamento

- O palco (canvas, laço e entrada) e o desenho ficam em um pacote à parte, pedido só em `/jogo/<personagem>/`. A entrada do jogo pede só a prévia. Nenhuma outra página do atlas pede código do jogo.
- A entrada do atlas só adianta a página do jogo quando a pessoa aponta para o acesso.
- O HTML do build traz o capítulo, o objetivo e os botões; a cena e o progresso entram no navegador, depois da hidratação. Sem JavaScript, o aviso fica dentro do palco, na primeira tela, e aponta para a trajetória no atlas.
- **Se o pacote do palco não chega,** a página continua de pé: no lugar da cena aparece um aviso com o botão de recarregar, e o painel segue cumprindo as tarefas.
- Nenhuma imagem é pedida na cena, e nenhum pedido vai a outro domínio. `tests/export/jogo.spec.ts` confere tudo isso na saída estática.

### Ida e volta entre o jogo e as fichas

O registro recolhido tem o link **Abrir a ficha completa no atlas**, para `/acontecimentos/<slug>/?origem=jogo&personagem=<slug>`. A página do acontecimento lê esse contexto e mostra **Voltar ao jogo** antes dos outros retornos. Quem volta encontra o capítulo como deixou.

## Direção visual

- **2.5D isométrico, desenhado por código.** Célula de 64 por 32 pixels, personagens de corpo inteiro, paredes de fundo em pé e parapeito baixo na frente, para o interior ficar à vista.
- **A identidade do atlas como base.** Papel e grafite, contorno fino, luz do alto à esquerda, sombra elíptica no chão. O laranja queimado do atlas fica reservado ao que pede ação: a marca e a etiqueta do registro, o anel de alcance, a placa e as setas da saída aberta.
- **Personagens por época.** Os dois jogáveis têm três figuras cada, com o mesmo esqueleto, o mesmo traço e o mesmo ciclo de caminhada: Lula de camisa de mangas dobradas, cabelo e barba escuros (primeiros anos), de terno com cabelo e barba grisalhos (anos intermediários) e de terno com a barba branca (anos recentes); Flávio Bolsonaro sem barba, de terno cinza (primeiros anos), com a barba rente (anos intermediários) e com fios mais claros e terno escuro (anos recentes). O Arquivista, de colete, óculos e pasta, não muda. Nenhum tem cor, símbolo ou gesto de partido.
- **Um lugar por capítulo.** Cada cena tem piso, paredes, objetos e cores próprios, e os períodos novos têm ambientes novos, e não a aparência dos quatro da etapa 1: ladrilho vinílico, cortiça com papéis e cartazes sem texto no comitê de campanha; lambri alto, tábua corrida, bancada do juízo e fileiras de público nas salas de audiências; painéis de madeira, carpete de lã, sofás e mapa sem nomes no gabinete; painéis acústicos, placas de carpete e tela apagada na sala de comissão; cortinas de palco, treliça, telão apagado e cadeiras em fileiras nos auditórios de convenção. Objetos novos: balcão, cartaz, tela, fileira e sofá.
- **Objetos legíveis.** O registro é o único objeto com papel pardo e etiqueta em acento. A saída é um portal mais alto que o personagem, com a porta de cada ambiente.
- **Animações curtas com função.** O registro balança de leve; ao ser recolhido, a pasta sobe e some; a tranca some e a porta gira; as setas do degrau piscam em sequência; a transição apresenta o capítulo seguinte.
- **Sem som.** Fica para depois do lançamento.

### Origem dos recursos

| Recurso | Origem | Licença |
| --- | --- | --- |
| Personagens, cenários, objetos e efeitos | Desenhados por código neste projeto (`src/features/game/draw/`), com assistência de IA | Autorais, do próprio projeto |
| Retratos da entrada do jogo | Os mesmos do atlas, com o crédito de cada um | As de cada imagem (metodologia, seção Créditos) |
| Fontes tipográficas | As do atlas | SIL Open Font License (`src/app/fonts/`) |

Nenhum serviço foi contratado, e o jogo não depende de API, login, banco de dados, ranking nem recurso pago ou externo. Nenhuma imagem, modelo ou folha de sprites de terceiros entrou no projeto.

## Verificação

| O quê | Onde |
| --- | --- |
| Regras de missão (quatro tarefas), progresso e migração, armazenamento, mundo, entrada, ficha judicial, registro da arte, capítulos e cobertura contra o conteúdo | `tests/game-*.test.ts` (Vitest) |
| Endereços do jogo e retorno da ficha | `tests/links.test.ts` |
| Movimento, colisão, interação, saída bloqueada até a tarefa e todos os registros, conclusão, avanço, nova tentativa nas três tarefas com resposta, a trajetória inteira dos dois personagens até o fim, a ficha judicial, a figura por época, progresso separado, recarga, migração da versão 1, painel com releitura, toque em pé e deitado, avisos editoriais e ida às fontes | `tests/e2e/jogo.spec.ts`, no servidor de desenvolvimento (`npm run test:e2e`) e sobre a saída estática (`npm run test:journeys`) |
| O que cada página pede, o palco em pacote à parte, a página sem mapa, a página sem JavaScript e a falha de um pacote | `tests/export/jogo.spec.ts` (`npm run test:export`) |
| Contraste, alvos e ordem de foco das duas telas do jogo | `npm run audit:a11y` |
| Carregamento e cadência de quadros das páginas do jogo, em laboratório | `npm run measure:game -- --rotulo <nome>` |
| Capturas da versão implementada | `docs/capturas/jogo-lancamento/` (`npm run capture:game`) |
| A galeria da arte, peça por peça | `node scripts/capture-art.mjs --saida <pasta>`, com `npm run dev` rodando |

O toque e o layout de celular foram conferidos em emulação. Nenhum aparelho real foi usado. Os resultados estão em [STATUS.md](STATUS.md). A cadência medida em 10 de outubro de 2026: 58 quadros por segundo em computador, e 19 a 24 no celular emulado, com a CPU 4 vezes mais lenta e o canvas desenhado por software ([PERFORMANCE.md](PERFORMANCE.md), seção Páginas do jogo); em aparelho real, por medir.

## Como acrescentar um capítulo

1. Escolha acontecimentos publicados próximos no assunto e no tempo, todos posteriores, sem ambiguidade de data, aos do capítulo anterior. Se a tarefa for de ordem, as datas dos dois têm de decidir a ordem; se for de documento ou de lugar, o registro pedido precisa de fonte ou de lugar documentado, e os outros registros, de documentos ou lugares diferentes.
2. Acrescente o capítulo em `src/lib/game/chapters.ts`, com os identificadores, a tarefa, o cenário e a época. O título e o motivo são inventários do que os registros dizem.
3. Crie a cena em `src/lib/game/scenes/`, apontando uma arte existente ou uma nova em `src/features/game/draw/arts/`: o mapa, os objetos, a paleta e as posições dos registros, na ordem dos identificadores. Nenhum registro ao lado da porta nem atrás de um objeto alto.
4. Se o registro for um episódio de processo, acrescente a ficha em `src/lib/game/judicial.ts`, só com o que o contexto do registro diz.
5. Rode `npx vitest run tests/game-chapters.test.ts tests/game-coverage.test.ts tests/game-judicial.test.ts tests/game-draw-registry.test.ts` e `npm run game:coverage`.
6. Olhe o cenário em `/dev/jogo-arte/` (ou capture com `scripts/capture-art.mjs`) e jogue o capítulo.

## O que falta

1. **Revisão humana do conteúdo** ([HUMAN-REVIEW.md](HUMAN-REVIEW.md)) e **validação com três pessoas, com celular real** ([USER-VALIDATION.md](USER-VALIDATION.md)): decidem a publicação.
2. **Aparelho real, leitor de tela e outros navegadores,** que não foram usados.
3. **Domínio, indexação e publicação,** preparados em [DEPLOY.md](DEPLOY.md) e só com autorização.
4. **Som,** deixado para depois.
