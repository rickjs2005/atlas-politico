# Jogo, etapa 1

O atlas ganhou um segundo caminho de leitura: um jogo em que o visitante escolhe Lula ou Flávio Bolsonaro, controla um personagem por cenários isométricos e avança por capítulos da trajetória pública. Em cada capítulo há registros do atlas espalhados pelo cenário e uma tarefa curta; com todos os registros recolhidos e a tarefa cumprida, a saída abre e leva ao capítulo seguinte.

Esta etapa entrega **dois capítulos jogáveis de cada personagem**, com as duas mecânicas de tarefa, progresso salvo por personagem e o caminho de ida e volta até as fichas e as fontes. O que está pronto, o que foi conferido e o que falta está em [STATUS.md](STATUS.md), seção Jogo, etapa 1.

O jogo não muda o que o atlas afirma. Ele não tem conteúdo editorial próprio: cada registro que aparece é um acontecimento publicado, com o título, a data, o resumo e as fontes do conjunto. Toda a conferência desse conteúdo continua sendo assistida por IA, com a revisão humana pendente, e as sessões de validação com três pessoas continuam por fazer ([EDITORIAL-REVIEW.md](EDITORIAL-REVIEW.md), [USER-VALIDATION.md](USER-VALIDATION.md)). O jogo diz isso nas próprias telas.

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

Em desenvolvimento: `npm run dev` e `http://localhost:3000/jogo/`. A galeria da arte, que só existe em desenvolvimento, fica em `http://localhost:3000/dev/jogo-arte/`.

## Fluxo

```
entrada do jogo (/jogo/)
   │  escolhe o personagem
   ▼
capítulo aberto (/jogo/<personagem>/)        ┌─────────────────────────────┐
   │  objetivo e contagem no alto da cena    │ painel Capítulos e tarefas  │
   │  anda, encontra os registros            │ faz o mesmo por botões,     │
   │  E ou Ação: recolhe e lê o registro ───▶│ sem o cenário               │
   │  (tarefa de ordem: põe os dois em ordem)└─────────────────────────────┘
   ▼
todos os registros recolhidos e a tarefa cumprida: a saída abre
   │  atravessa a saída
   ▼
transição curta: capítulo concluído, próximo capítulo, próximo cenário
   ▼
capítulo seguinte ... até o fim desta etapa, que aponta para o atlas completo
```

1. **Entrada.** Os dois personagens aparecem com o mesmo cartão, em ordem alfabética: prévia do cenário do primeiro capítulo, retrato, capítulos com os períodos e a situação neste navegador: "Começar" para quem não jogou, "Continuar" para quem já recolheu algum registro, com o capítulo em que parou, e "Rever" para quem concluiu os capítulos. A página diz que os cenários são representações, que o guia é fictício e qual é a situação da revisão do conteúdo.
2. **Cena.** Ocupa a altura da janela abaixo do cabeçalho. O personagem aparece de corpo inteiro, anda nas oito direções, para nas paredes e nos móveis, e a câmera o acompanha.
3. **Objetivo.** Fica escrito sobre a cena, com o capítulo, o período e o nome do cenário, apresentado como cenário. Logo abaixo, a contagem: quantos registros já foram recolhidos, de quantos, e o que ainda segura a porta ("a saída abre com todos", "a saída abre com todos e a ordem certa", "falta a tarefa" ou "saída aberta").
4. **Registros.** Cada acontecimento do capítulo é uma pasta de documentos que paira sobre uma marca no chão. Perto de uma delas, a pasta ganha destaque, aparece um anel no chão e a dica do que fazer; a tecla de interação recolhe e abre o registro: data na precisão documentada, título, categoria, resumo, fontes com autoria, situação da revisão e o caminho para a ficha completa.
5. **Saída.** É uma porta no vão da parede da frente. Fica fechada, com uma tranca e um cadeado, enquanto faltar a tarefa ou algum registro do capítulo, e diz o que falta: quantos registros e se a tarefa está cumprida. Com todos os registros recolhidos e a tarefa cumprida, o texto do objetivo muda, a tranca some, a folha gira para fora, a placa sobre a porta acende e o degrau ganha setas que apontam para fora. Atravessa quem anda para dentro da porta ou quem, ao lado dela, usa a tecla ou o botão de interação.
6. **Transição.** Ao atravessar, uma tela curta diz o capítulo concluído e apresenta o seguinte: título, período e cenário. A cena seguinte tem outro cenário, outros objetos e outro objetivo.
7. **Fim da etapa.** Depois do último capítulo disponível, a tela diz que os demais acontecimentos ainda não têm capítulo e leva à trajetória completa no atlas, à comparação e à escolha de personagem.

## Capítulos desta etapa

Os capítulos são agrupamentos de acontecimentos publicados, pelo `id` do conjunto. A definição está em `src/lib/game/chapters.ts`, e um teste confere cada capítulo contra o conteúdo da edição (`tests/game-chapters.test.ts`).

### Lula

| Capítulo | Período | Cenário | Registros no cenário | Tarefa |
| --- | --- | --- | --- | --- |
| 1. Sindicato, greves e partido | 1975–1980 | Salão do sindicato | A eleição para a presidência do sindicato (1975), a greve dos metalúrgicos (março de 1979), a fundação do PT (10 de fevereiro de 1980) e a prisão com base na Lei de Segurança Nacional, durante uma greve (1980) | **Encontrar um registro:** o da eleição de 1975 |
| 2. Constituinte e disputas presidenciais | 1986–1994 | Plenário da Constituinte | A eleição para deputado federal constituinte (1986), a primeira disputa pela Presidência (1989) e a derrota na eleição presidencial de 3 de outubro de 1994 | **Organizar dois acontecimentos:** a eleição para a Constituinte e a primeira disputa pela Presidência |

### Flávio Bolsonaro

| Capítulo | Período | Cenário | Registros no cenário | Tarefa |
| --- | --- | --- | --- | --- |
| 1. Assembleia e disputa pela Prefeitura | 2002–2016 | Salão da Assembleia | As quatro eleições para deputado estadual (6 de outubro de 2002, 2006, 2010 e 2014) e a disputa pela Prefeitura do Rio (2016) | **Encontrar um registro:** o da primeira eleição, de 2002 |
| 2. Senado: eleição, Mesa e partido | 2018–2019 | Plenário do Senado | A eleição para o Senado (2018), a 3ª Secretaria da Mesa do Senado (6 de fevereiro de 2019) e a saída do PSL (19 de novembro de 2019) | **Organizar dois acontecimentos:** a eleição para o Senado e a 3ª Secretaria da Mesa |

São 15 dos 39 acontecimentos publicados: 7 de Lula e 8 de Flávio Bolsonaro.

### Por que estes agrupamentos

- **Começam pelo começo de cada trajetória no atlas.** São os primeiros registros publicados de cada pessoa, sem pular nenhum. As trajetórias têm períodos diferentes (1975 a 1994 e 2002 a 2019), e o jogo não as nivela: é a regra do atlas para carreiras de duração diferente.
- **Título e motivo são inventários, e não um enredo.** O título de cada capítulo lista os assuntos dos registros, e o motivo, que aparece no painel, diz quantos são e quais são. Nenhum dos dois afirma um período de mandato, uma passagem ou uma causa: isso é o que os registros dizem, cada um na própria ficha. A forma é a mesma para os dois personagens.
- **Cada capítulo junta registros próximos no assunto e no tempo.** O sindicato, as greves e a fundação do partido; a Constituinte e as duas primeiras disputas presidenciais; as eleições para deputado estadual e a disputa pela Prefeitura; a eleição para o Senado e os dois registros de 2019.
- **Passar de um capítulo ao seguinte nunca sugere uma ordem que as datas não decidem.** Todo registro de um capítulo é anterior, sem ambiguidade, a todo registro do capítulo seguinte. É por isso que a fundação do PT (10 de fevereiro de 1980) e a prisão (1980, só o ano) ficam no mesmo capítulo: o atlas não registra qual veio antes, e uma fronteira de capítulo entre as duas sugeriria uma sequência. O teste dos capítulos confere a regra para todos os pares.
- **Dentro de um capítulo, a ordem em aberto é dita.** O registro da prisão leva, no jogo, o mesmo aviso que leva na lista do atlas: "ordem dentro de 1980 não documentada". A regra é a mesma função (`findUndeterminedOrder`, no domínio), e o motivo do capítulo explica o caso.
- **O mesmo desenho para os dois.** Dois capítulos, o primeiro com a tarefa de encontrar um registro e o segundo com a de ordenar. O número de registros por capítulo segue o que cada trajetória tem no período, e por isso não é igual: quatro e três em Lula, cinco e três em Flávio Bolsonaro.
- **Nada de episódio judicial dos processos recentes nesta etapa.** Os registros de denúncia, condenação e anulação pedem um cuidado de apresentação próprio (alegação, decisão e desfecho no mesmo lugar). Ficam para a etapa seguinte, com esse cuidado desenhado. A prisão de 1980 está no período do capítulo 1 de Lula e aparece com o resumo publicado, que traz a base legal e a duração.

### Datas das tarefas de ordem

Uma tarefa de ordem só usa dois registros cujas datas decidem a ordem sozinhas: os intervalos de cálculo das duas não podem se cruzar (`datesDecideOrder`, em `src/lib/game/mission.ts`).

| Tarefa | Datas | Por que não há ambiguidade |
| --- | --- | --- |
| Lula, capítulo 2 | 1986 e 1989 | Qualquer dia de 1986 vem antes de qualquer dia de 1989 |
| Flávio Bolsonaro, capítulo 2 | 2018 e 6 de fevereiro de 2019 | Qualquer dia de 2018 vem antes de um dia de 2019 |

O par "prisão de 1980" e "fundação do PT em 10 de fevereiro de 1980" não poderia virar tarefa: o ano inteiro contém o dia. O teste dos capítulos recusa uma tarefa assim.

## Tarefas

Cada tarefa tem objetivo, ação esperada e condição de conclusão escritos no código, em `TaskSpec` e nas regras de `src/lib/game/mission.ts`. Não há botão de concluir fase.

| Tipo | Objetivo | Ação | A tarefa está cumprida quando |
| --- | --- | --- | --- |
| `registro` | Encontrar o registro pedido | Chegar perto da pasta e interagir. O registro abre com o resumo, as fontes e o caminho da ficha | O registro pedido foi recolhido |
| `ordem` | Recolher dois registros e pô-los em ordem cronológica | Recolher os dois; o jogo mostra os dois com as datas e pergunta qual veio primeiro | A ordem certa foi confirmada |

Na tarefa de ordem, uma resposta errada mostra os dois registros com as datas, o mais antigo primeiro, diz que a data mais antiga vem primeiro e oferece **Tentar de novo**. Não há penalidade: nada é perdido, a contagem de tentativas é só informação e a saída continua fechada até a ordem certa. Dá para fechar a pergunta e responder depois, pelo guia ou pelo painel.

Os outros registros do cenário não são exigidos pela tarefa, mas são exigidos pela saída. As pastas são iguais por fora: quem procura o registro pedido abre e lê os outros no caminho.

### O que abre a saída

A saída de um capítulo abre com duas condições juntas: **a tarefa cumprida e todos os registros do capítulo recolhidos**, e não só os que a tarefa pede (`isExitOpen`, em `src/lib/game/mission.ts`). Cumprir a tarefa não abre a porta sozinho, e recolher tudo sem responder a ordem também não. A regra foi pedida pelo responsável pelo projeto em 10 de outubro de 2026, depois de ver a primeira entrega rodando, em que a porta abria só com a tarefa (D-109).

| Situação | O que a cena diz | A saída |
| --- | --- | --- |
| Tarefa pendente, registros por recolher | O objetivo do capítulo, e "Registros: n de total · a saída abre com todos". Na tarefa de ordem, em que recolher tudo não basta, "a saída abre com todos e a ordem certa" | Fechada |
| Tarefa cumprida, registros por recolher | "Tarefa concluída. Faltam N registros para a saída abrir." | Fechada |
| Os dois registros da tarefa de ordem recolhidos, ordem por responder | "Os dois registros da tarefa estão com você. Para colocá-los em ordem, abra Como jogar ou Capítulos e tarefas." Se não falta mais nenhum registro, a contagem diz "falta a tarefa" | Fechada |
| Tarefa cumprida e todos os registros recolhidos | "Tarefa concluída e registros recolhidos. A saída abriu" | Aberta |

A ordem das duas condições é de quem joga. O registro recolhido diz, na própria janela, quantos já vieram e o que falta; a janela da saída fechada, o guia e o painel dizem o mesmo, item por item, e com a ordem pronta para responder a janela da saída fechada leva à pergunta. O painel só oferece **Atravessar a saída** com ela aberta. Vale também para o que foi salvo: um capítulo só consta como concluído com a saída aberta.

## Regras editoriais do jogo

Valem as regras de [EDITORIAL.md](EDITORIAL.md), mais estas:

- **O jogo não escreve fatos.** Título, data, categoria, resumo e fontes de um registro vêm dos dados gerados. Os textos próprios do jogo (título, motivo e objetivo de cada capítulo, nome do cenário) só dizem o que os registros sustentam, e um teste confere que nenhum deles traz fala atribuída.
- **A data aparece na precisão do registro.** Um acontecimento de que só se sabe o ano aparece com o ano e o aviso "Só o ano está documentado", no registro recolhido e na pergunta da tarefa de ordem. Quando essa data não decide a posição do registro em relação a outro, ele leva também o aviso "ordem dentro de [ano] não documentada", no registro e no painel.
- **A situação da revisão aparece em toda leitura.** O registro recolhido traz a mesma nota das outras telas do atlas: conferido com as fontes, com assistência de IA, e revisão humana pendente. A entrada do jogo e o rodapé da página do jogo repetem a frase da edição.
- **Nenhuma fala é atribuída às pessoas retratadas.** Os personagens não falam. Quem orienta é o **Arquivista**, um guia identificado como personagem fictício na entrada do jogo e no diálogo dele.
- **O cenário é uma representação.** Não afirma que a pessoa esteve naquele lugar nem que os fatos aconteceram nele. O nome do lugar aparece sempre com o rótulo "cenário", e a frase está na entrada do jogo, no diálogo do guia e no rodapé da página do jogo, que é onde chega quem entra direto pelo acesso **Jogar com**.
- **Cada personagem tem a mesma figura em todos os capítulos.** É a de hoje, a mais reconhecível, e não acompanha a idade de cada período: um capítulo de 1975 mostra o personagem como ele é desenhado para 2026. A entrada do jogo diz isso.
- **O progresso é de quem joga.** Concluir um capítulo não avalia a pessoa retratada: não há nota, vitória, derrota nem elogio.
- **Mesmo tratamento.** Os dois personagens têm o mesmo cartão, o mesmo número de capítulos, as mesmas mecânicas, os mesmos textos fixos e o mesmo cuidado de desenho; a ordem é alfabética. Nenhuma cor identifica pessoa ou partido, e os cenários não trazem símbolo, sigla nem bandeira reconhecível.
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

- **Tudo pode ser feito sem o cenário.** O painel **Capítulos e tarefas** lista os capítulos com a situação de cada um, o objetivo e os registros do capítulo aberto, e traz os botões para recolher um registro, ler de novo um registro já recolhido, responder a ordem e atravessar a saída, que só é oferecida quando está aberta. Cada botão de recolher e de reler diz, no nome, qual é o registro; na volta de uma releitura, o foco fica no botão do registro lido, à vista na lista. É o mesmo progresso da cena, com a mesma regra.
- **Foco.** Cada diálogo prende o foco enquanto está aberto, fecha com Esc e devolve o foco à cena. Quando os botões de um diálogo mudam (a tarefa de ordem troca **Confirmar** por **Tentar de novo** ou **Continuar**), o foco vai para o botão que entrou. Com um diálogo aberto, a cena e os botões sobre ela saem da tabulação (`inert`). O foco é o contorno do atlas; na cena, ele é desenhado para dentro e por cima do canvas. Se a cena não carregou, o foco volta ao botão **Capítulos e tarefas**.
- **O menu do site continua por cima.** As janelas do jogo ficam em uma camada própria, abaixo do cabeçalho: em celular, o menu abre sobre elas.
- **Leitores de tela.** A cena é uma região com nome e instruções; a dica do que está ao alcance e os retornos da tarefa são anunciados (`role="status"`). O conteúdo de cada registro é texto comum. Nenhum leitor de tela foi usado na conferência.
- **Movimento reduzido.** Com `prefers-reduced-motion`, nada balança, pisca nem flutua, a câmera não desliza, a porta abre de uma vez e o registro recolhido some de uma vez, sem a pasta subindo. As regras e os estados são os mesmos.
- **Contraste.** Os textos do jogo usam os tokens do atlas e entram na passagem de acessibilidade (`npm run audit:a11y`).

## Progresso

- Um progresso por personagem, em `localStorage`, na chave `atlas-politico:jogo:<personagem>`.
- Formato com versão (`versao: 1`): por capítulo, a situação (`bloqueado`, `disponivel` ou `concluido`) e o estado da tarefa (registros recolhidos, ordem confirmada, tentativas).
- Transições previsíveis: no início, só o primeiro capítulo está disponível; atravessar a saída aberta marca o capítulo como concluído e libera o seguinte; reiniciar volta ao início. Um capítulo concluído pode ser revisto sem mudar nada: nele tudo já foi recolhido, e os registros são relidos pelo painel (**Ler de novo**), de onde também se chega à ficha de cada um.
- **Dados inválidos viram começo, e não erro.** Outra versão, outro personagem, forma errada ou capítulo que a edição não tem mais: o progresso é descartado ou acertado, e a progressão é reaplicada (nunca há dois capítulos disponíveis nem um concluído sem a saída aberta, isto é, sem a tarefa feita ou sem todos os registros). Se um capítulo mudou entre uma edição e outra, os registros que ele não cita mais saem dos recolhidos, e uma ordem confirmada só vale com os dois registros da tarefa atual. Um progresso guardado quando a saída abria só com a tarefa é acertado do mesmo jeito: o capítulo que ficou sem registros volta a disponível, com o que já foi recolhido, e os seguintes recomeçam.
- **Sem armazenamento, o jogo continua.** Em modo privado ou com o armazenamento bloqueado, o progresso fica em uma cópia da página: vale enquanto ela estiver aberta, inclusive ao ir à ficha de um registro e voltar pelo site, e se perde ao recarregar ou fechar. O painel avisa.
- **Reiniciar** pede confirmação em uma janela do próprio jogo, apaga só o progresso daquele personagem e devolve o personagem ao início da cena.
- **Abrir um link direto não altera o progresso.** O endereço não carrega progresso: a página de um acontecimento aberta pelo jogo leva só `origem=jogo` e o personagem, para oferecer **Voltar ao jogo**. Quem estava revendo um capítulo concluído e foi à ficha de um registro volta ao capítulo que revia: a página lembra dele para essa volta, sem guardar nada.
- Duas abas no mesmo personagem não se sincronizam: cada uma segue com o próprio progresso até recarregar, e fica guardado o que foi gravado por último.

## Arquitetura do jogo

Dados históricos, configuração dos capítulos, regras de missão, estado do jogador e desenho do mundo ficam em lugares separados, e as fronteiras são as do atlas ([ARCHITECTURE.md](ARCHITECTURE.md)).

| Parte | Onde | O que é | Não faz |
| --- | --- | --- | --- |
| Dados históricos | `generated/dados/`, pelo pipeline | Os acontecimentos, com datas e fontes | Não mudam por causa do jogo |
| Recorte para o jogo | `src/lib/game/content.ts` | Os registros citados pelos capítulos, com as fontes resolvidas, a situação da revisão e a marca de ordem em aberto. Montado no build | Não escreve texto |
| Capítulos | `src/lib/game/chapters.ts` | Identificadores dos acontecimentos, tarefa e cenário de cada capítulo | Não repete conteúdo editorial |
| Cenários | `src/lib/game/scenes/` | O mapa de cada cena, os objetos e as cores | Não conhece o desenho |
| Regras de missão | `src/lib/game/mission.ts` | Recolher, cumprir a tarefa, abrir a saída, decidir a ordem, avaliar uma resposta | Não guarda estado |
| Progresso | `src/lib/game/progress.ts`, `storage.ts` | Situação dos capítulos, transições, formato salvo, armazenamento | Não conhece a interface |
| Mundo | `src/lib/game/world/` | Projeção isométrica, grade e colisão, movimento, alcance, câmera, direcional | Não desenha |
| Desenho | `src/features/game/draw/` | Personagens, piso, paredes, saída, objetos, registro e efeitos, por código | Não conhece regras |
| Motor | `src/features/game/engine/` | Laço de animação, entrada, ordem de profundidade | Não conhece capítulos |
| Interface | `src/features/game/` | A casca (`GameShell`), o palco (`GameStage`), os diálogos, o painel, o HUD, o toque, a entrada | Não lê arquivos |
| Rotas | `src/app/jogo/` | `/jogo/` e `/jogo/[personagem]/`, geradas no build | |

`src/lib/game/` é puro: sem React, sem arquivos, sem o Zod. O ESLint confere, como nas outras camadas. A regra da ordem em aberto (`findUndeterminedOrder`) fica no domínio (`src/lib/domain/order.ts`), porque a lista do atlas e o jogo usam a mesma.

### Por que canvas 2D, e não uma biblioteca de jogo

- A cena é pequena: uma sala de 12 por 9 células, uns vinte objetos e três personagens. O canvas 2D dá conta, com um cuidado: o que é fixo é desenhado uma vez (abaixo).
- A stack instalada não tem motor de jogo, e o projeto evita dependência nova sem necessidade. Um motor traria centenas de quilobytes para resolver o que cabe em poucos arquivos.
- A arte é vetorial, desenhada por código: não há folha de sprites para carregar, o traço acompanha a densidade da tela e o zoom, e os recursos são todos do próprio projeto.
- O mapa do atlas já usa WebGL. O jogo não usa: as páginas do jogo não têm mapa, e as páginas com mapa não têm cena. Nunca há dois renderizadores pesados na mesma tela.

### Desenho por quadro

O cenário tem milhares de traços, e refazê-los a cada quadro custava caro: em bancada, a cena ia a cerca de 18 quadros por segundo no Chromium com a placa de vídeo, em 1440×835. Por isso o que não muda de um quadro para o outro é desenhado uma vez, em telas à parte, e copiado: as paredes de trás com o piso e os detalhes de chão; os parapeitos da frente; e cada objeto parado. A cada quadro, de novo, só o que se move: o personagem, o guia, os registros, a porta, a bandeira e a planta, que balançam, e os efeitos. Com isso a mesma cena ficou entre 55 e 60 quadros por segundo, com cerca de 1 ms de desenho por quadro, e o resultado é igual ao do desenho direto (comparado pixel a pixel: diferença de até 4 níveis em 255, em menos de 0,2% dos pixels).

As telas prontas são refeitas quando a escala muda (ao redimensionar a janela) e liberadas quando saem de uso. Se o navegador não as fornece, a cena é desenhada direto, como antes. A medição foi de bancada, com um arnês fora do projeto, nesta máquina: serve para comparar os dois modos, e não para prever um aparelho real.

### Carregamento

- O palco (canvas, laço e entrada) e o desenho ficam em um pacote à parte, pedido só em `/jogo/<personagem>/`. A entrada do jogo pede só a prévia. Nenhuma outra página do atlas pede código do jogo.
- A entrada do atlas só adianta a página do jogo quando a pessoa aponta para o acesso.
- O HTML do build traz o capítulo, o objetivo e os botões; a cena e o progresso entram no navegador, depois da hidratação. Sem JavaScript, o aviso fica dentro do palco, na primeira tela, e aponta para a trajetória no atlas.
- **Se o pacote do palco não chega,** por queda de rede ou por uma publicação nova com a página já aberta, a página continua de pé: no lugar da cena aparece um aviso com o botão de recarregar, e o painel **Capítulos e tarefas** segue cumprindo as tarefas. Se o pacote da prévia não chega, a entrada do jogo fica com o fundo do cartão, e a escolha continua valendo.
- Nenhuma imagem é pedida na cena, e nenhum pedido vai a outro domínio. `tests/export/jogo.spec.ts` confere tudo isso na saída estática.

### Ida e volta entre o jogo e as fichas

O registro recolhido tem o link **Abrir a ficha completa no atlas**, para `/acontecimentos/<slug>/?origem=jogo&personagem=<slug>`. A página do acontecimento lê esse contexto e mostra **Voltar ao jogo** antes dos outros retornos. Quem volta encontra o capítulo como deixou: o progresso está no navegador, ou na cópia da página quando não há armazenamento. As regras são funções puras em `src/lib/state/links.ts` (`eventHrefFromGame`, `gameReturn`), com teste.

## Direção visual

- **2.5D isométrico, desenhado por código.** Célula de 64 por 32 pixels, personagens de corpo inteiro, paredes de fundo em pé e parapeito baixo na frente, para o interior ficar à vista.
- **A identidade do atlas como base.** Papel e grafite, contorno fino, luz do alto à esquerda, sombra elíptica no chão. O laranja queimado do atlas fica reservado ao que pede ação: a marca e a etiqueta do registro, o anel de alcance, a placa e as setas da saída aberta.
- **Personagens.** Três figuras de corpo inteiro, com o mesmo esqueleto, o mesmo traço e o mesmo ciclo de caminhada nas quatro direções: os dois jogáveis, de terno, e o Arquivista, de colete, óculos e pasta. Cabelo, barba e rosto diferenciam cada um. Nenhum tem cor, símbolo ou gesto de partido.
- **Um lugar por capítulo.** Cada cenário tem piso, paredes, objetos e cores próprios: concreto com juntas, blocos pintados, janelas de fábrica, torno, prensa e armários de aço no salão do sindicato; taco, lambri, janelas altas e bancadas de madeira no plenário dos anos 1980; pedra clara com tozetos, pilastras, colunas e urnas no salão da Assembleia; pedra polida, ripas, painéis de madeira com rasgo de luz, bancadas e poltronas no plenário do Senado.
- **Objetos legíveis.** O registro é o único objeto com papel pardo e etiqueta em acento, para não se confundir com os papéis que enfeitam as mesas e o piso. A saída é um portal mais alto que o personagem, com a porta de cada cenário (aço, madeira almofadada, madeira com vidro, folha lisa com rasgo de luz).
- **Animações curtas com função.** O registro balança de leve; ao ser recolhido, a pasta sobe e some, e um anel se abre na marca; a tranca some e a porta gira; as setas do degrau piscam em sequência; a transição apresenta o capítulo seguinte.
- **Sem som nesta etapa.**

### Origem dos recursos

| Recurso | Origem | Licença |
| --- | --- | --- |
| Personagens, cenários, objetos e efeitos | Desenhados por código neste projeto (`src/features/game/draw/`), com assistência de IA | Autorais, do próprio projeto |
| Retratos da entrada do jogo | Os mesmos do atlas, com o crédito de cada um | As de cada imagem (metodologia, seção Créditos) |
| Fontes tipográficas | As do atlas | SIL Open Font License (`src/app/fonts/`) |

Nenhum serviço foi contratado, e o jogo não depende de API nem de recurso pago ou externo. Nenhuma imagem, modelo ou folha de sprites de terceiros entrou no projeto.

## Verificação

| O quê | Onde |
| --- | --- |
| Regras de missão, progresso, armazenamento, mundo, entrada e capítulos contra o conteúdo | `tests/game-*.test.ts` (Vitest) |
| Endereços do jogo e retorno da ficha | `tests/links.test.ts` |
| Movimento, colisão, interação, saída bloqueada até a tarefa e todos os registros, conclusão, avanço, nova tentativa, progresso separado, recarga, progresso guardado pela regra anterior, painel com releitura, toque em pé e deitado, avisos editoriais e ida às fontes | `tests/e2e/jogo.spec.ts`, no servidor de desenvolvimento (`npm run test:e2e`) e sobre a saída estática (`npm run test:journeys`) |
| O que cada página pede, o palco em pacote à parte, a página sem mapa, a página sem JavaScript e a falha de um pacote | `tests/export/jogo.spec.ts` (`npm run test:export`) |
| Contraste, alvos e ordem de foco das duas telas do jogo | `npm run audit:a11y` |
| Capturas da versão implementada | `docs/capturas/jogo-etapa-1/` (`npm run capture:game`) |

O toque e o layout de celular foram conferidos em emulação. Nenhum aparelho real foi usado. Os resultados estão em [STATUS.md](STATUS.md).

## Como acrescentar um capítulo

1. Escolha acontecimentos publicados próximos no assunto e no tempo, todos posteriores, sem ambiguidade de data, aos do capítulo anterior. Se a tarefa for de ordem, as datas dos dois têm de decidir a ordem.
2. Acrescente o capítulo em `src/lib/game/chapters.ts`, com os identificadores, a tarefa e o cenário. O título e o motivo são inventários do que os registros dizem.
3. Use um cenário existente ou crie outro em `src/lib/game/scenes/`: o mapa, os objetos e as posições dos registros, na ordem dos identificadores. Nenhum registro fica na diagonal atrás da porta nem atrás de um objeto alto, que o esconderiam: a saída exige todos, e um registro que não se vê trava o capítulo.
4. Rode `npx vitest run tests/game-chapters.test.ts`: ele confere os identificadores, as datas da tarefa, a fronteira com o capítulo anterior, os marcadores do mapa e se tudo é alcançável a pé.
5. Olhe o cenário em `/dev/jogo-arte/` e jogue o capítulo.

## O que falta para chegar aos demais acontecimentos

1. **Capítulos para os 24 acontecimentos restantes.** Dos 39 publicados, 15 estão nos capítulos desta etapa. Lula tem 13 sem capítulo, de 2002 a 2026, e Flávio Bolsonaro tem 12, de 2020 a 2026; um deles, o primeiro turno de 2026, é dos dois e pede um capítulo que sirva aos dois.
2. **Apresentação dos episódios judiciais.** Uma ficha de registro que mostre, no próprio jogo, quem alegou, quem decidiu e qual foi o desfecho, antes de esses acontecimentos virarem capítulo.
3. **Mais cenários.** Um por período novo: Presidência, tribunais, campanha. O contrato de cena e de arte já aceita.
4. **A figura de cada época.** Hoje cada personagem tem uma figura só. Capítulos de décadas diferentes pedem variações de cabelo, barba e roupa, com o mesmo cuidado para os dois.
5. **Mais um ou dois tipos de tarefa,** como ligar um registro à sua fonte ou ao seu lugar, sempre sem exigir conhecimento prévio.
6. **Validação com pessoas e revisão humana do conteúdo,** que continuam pendentes e decidem a publicação.
7. **Aparelho real, leitor de tela e outros navegadores,** que não foram usados nesta etapa.
8. **Som,** deixado para depois.
