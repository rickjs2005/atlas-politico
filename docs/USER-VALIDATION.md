# Validação com pessoas

**Situação: pendente.** Até 12 de outubro de 2026, nenhuma sessão foi feita, com ninguém. Este documento traz o roteiro pronto e as fichas em branco. Os resultados entram aqui só depois de sessões reais, com as palavras de quem participou. A trilha simples do jogo ([GAME-TRAIL.md](GAME-TRAIL.md)) trocou a tarefa 5 e as perguntas do jogo, que agora são as de 12 a 19, e o roteiro de celular real do fim deste documento. O passaporte do Escrivão (D-150) acrescentou a pergunta 20 e o passo 16 desse roteiro.

O que a validação responde: uma pessoa que nunca viu o atlas consegue, sem ajuda, encontrar um episódio, chegar à fonte, comparar as duas trajetórias e mandar o resultado para alguém? E uma pessoa que conhece pouco de política consegue seguir o jogo sozinha e sair dele sabendo dizer de onde a pessoa veio, que cargos teve e o que um desses cargos faz? Os testes automáticos de [QA.md](QA.md) mostram que as telas funcionam. Eles não mostram se uma pessoa entende o que vê.

## Quem convidar

Três pessoas que não participaram do projeto. O jogo foi refeito para quem conhece pouco de política: ao menos duas das três devem ser pessoas que não acompanham o assunto, e ao menos uma, que use mais o celular que o computador. Se der, a terceira acompanha política de perto, para a comparação. Posição política não é critério de escolha, e não é perguntada.

## Preparação

1. Gere e sirva a versão de produção: `npm run build` e depois `npm run preview`. O atlas abre em `http://localhost:4311/`.
2. Faça pelo menos uma das três sessões em um celular de verdade, e nela faça a tarefa 5 (o jogo) em pé e deitado. Com o celular na mesma rede do computador, o endereço é `http://<IP do computador>:4311/`. O Windows pode pedir permissão para o servidor aceitar a conexão. Esse caminho não foi testado: anote se funcionou. O jogo em celular só foi conferido em emulação, a 360 e a 390 pixels de largura; a sessão real é a primeira vez que o toque, a cadência e o tamanho dos botões serão vistos em aparelho de verdade. Anote o modelo do celular e se a cena ficou fluida ou travou.
3. Abra o jogo em uma janela sem progresso guardado (janela anônima, ou depois de **Apagar o progresso**, na lista de fases): a tarefa 5 precisa começar como começa para quem nunca jogou. Marque a hora em que a pessoa começa e a hora em que termina a terceira fase.
4. No celular aberto pelo IP, o navegador não libera a área de transferência para páginas sem conexão segura. O botão de copiar mostra o link em um campo já selecionado, para a pessoa copiar à mão. É o comportamento esperado, e vale observar se a pessoa entende.
5. Abra a página inicial e entregue o aparelho. Não mostre nada antes.
6. Tenha esta ficha à mão e anote na hora. Se a pessoa deixar, grave a tela.

## O que dizer no começo

> Este é um site em desenvolvimento. Quem está sendo testado é o site, e não você. Vou pedir cinco coisas. Faça do jeito que achar natural e vá falando em voz alta o que está pensando. Eu não vou ajudar durante as tarefas, mas no fim respondo o que você quiser saber.

## Regras para quem aplica

- **Não ensine onde clicar.** Não aponte para a tela, não diga o nome de botão, de aba ou de área ("linha do tempo", "mapa", "filtro"). Leia a tarefa como está escrita.
- Se a pessoa perguntar "é aqui?", devolva: "o que você acha?".
- Se ela ficar parada por dois minutos, dê uma dica curta, anote qual foi e marque a tarefa como **com ajuda**.
- Se ela desistir, marque **não concluiu** e passe para a próxima. Não mostre a resposta antes do fim da sessão.
- Anote o que ela disse com as palavras dela. "Achei confuso" vale menos que "não sei se esse ponto é o lugar exato".
- Não discuta o conteúdo político durante a sessão. Se a pessoa comentar, anote.

## Tarefas

As tarefas 1 e 2 usam um episódio de cada pessoa do atlas, e a ordem alterna entre os participantes, para os dois perfis serem testados do mesmo jeito.

| Participante | Tarefas 1 e 2 com |
| --- | --- |
| 1 | Episódio A |
| 2 | Episódio B |
| 3 | Episódio A |

Se houver tempo, repita as tarefas 1 e 2 com o outro episódio e anote como segunda passagem.

### Tarefa 1: encontrar um episódio

- **Episódio A.** Dizer: "Encontre no atlas a eleição de Flávio Bolsonaro para o Senado. Quando foi, e onde o atlas a localiza?"
- **Episódio B.** Dizer: "Encontre no atlas a eleição de Lula para o terceiro mandato de presidente. Quando foi, e onde o atlas a localiza?"

### Tarefa 2: consultar a fonte

Dizer: "De onde o atlas tirou essa informação? Abra um dos documentos e me diga, com as suas palavras, o que ele confirma."

### Tarefa 3: comparar as duas pessoas em um período

Dizer: "Agora veja o que o atlas tem das duas pessoas entre 2019 e 2022. O que você encontra para cada uma? O que essa diferença quer dizer?"

### Tarefa 4: compartilhar

Dizer: "Imagine que você quer mandar para um amigo exatamente o que está vendo agora. Como faria?"

Depois, abra o link que a pessoa produziu em outra aba ou em outro aparelho e veja se a tela é a mesma.

### Tarefa 5: seguir três fases do jogo

Dizer: "O site tem um jogo. Escolha uma das duas pessoas e siga a história dela até terminar a terceira fase. Vá falando o que está entendendo."

Não explique como se joga. Quando a pessoa terminar a terceira fase, pergunte, sem deixar que ela olhe a tela:

1. "Com as suas palavras: de onde essa pessoa veio?"
2. "Que cargo ou que função ela teve nas fases que você viu?"
3. "Apareceu alguma palavra que você não conhecia? O que ela quer dizer?" Se a pessoa não citar nenhuma, pergunte por uma das que a fase explica (para Lula, sindicato; para Flávio Bolsonaro, deputado estadual).
4. "Em algum momento você não soube o que fazer? Quando?"

Se houver tempo, peça mais uma coisa: "Agora veja a fase sobre processos na Justiça" (a fase 7 de Lula ou a 6 de Flávio Bolsonaro, pela lista **Fases**). Depois: "O que a Justiça decidiu, e em que ordem? O jogo pediu que você dissesse se a pessoa é culpada?"

## Gabarito para quem aplica

Não leia para o participante. Os dados são os da edição 0.3.0; os acontecimentos das tarefas 1 a 4 são os mesmos desde a edição 0.1.1.

| Tarefa | O que conta como concluído | O que observar |
| --- | --- | --- |
| 1, episódio A | Chegar ao registro "Flávio Bolsonaro é eleito senador pelo Rio de Janeiro", de 2018, localizado no Estado do Rio de Janeiro | O registro traz só o ano. A pessoa percebe o aviso "Só o ano está documentado"? Ela entende que o ponto no mapa é o centro do estado, e não um endereço? |
| 1, episódio B | Chegar ao registro "Lula é eleito presidente da República pela terceira vez", de 30 de outubro de 2022, de abrangência nacional | O registro não tem ponto no mapa. A pessoa encontra essa explicação, ou conclui que o mapa falhou? |
| 2 | Abrir um documento da lista de fontes do registro e dizer algo que esteja no campo "O que sustenta" daquela fonte | A pessoa acha as fontes sem ajuda? Lê "Onde" e "O que sustenta"? Volta ao atlas depois de abrir o documento? Nas fichas do TSE, a página demora e é de outro site: anote a reação |
| 3 | Chegar a uma tela com as duas pessoas no período de 2019 a 2022. Nesse recorte, o atlas tem 8 registros de Flávio Bolsonaro e 3 de Lula | A leitura esperada é que a quantidade mostra o que o atlas registrou, e não quem fez mais. Anote a frase exata que a pessoa usou para explicar a diferença |
| 4 | Produzir um link que, aberto em outro lugar, mostra o mesmo período e as mesmas duas pessoas | A pessoa usa o botão de copiar ou a barra de endereço? Os dois valem. Se o link aberto não mostrar o mesmo recorte, anote como defeito |
| 5 | Terminar a terceira fase da trajetória escolhida sem ajuda e responder às perguntas 1 e 2 com o que as fases dizem (abaixo). Responder à pergunta 3 com algo próximo da definição que a fase traz | A pessoa descobre sozinha que é para tocar na pasta ou no botão **Abrir o marco**? Lê a explicação ou vai direto à pergunta? Abre algum termo explicado? Abre **Ver fontes**? Quando erra, lê a explicação e tenta de novo, ou usa **Ver a explicação e continuar**? Usa esse botão antes de responder? Abre alguma pasta opcional? Percebe o aviso "Ainda não pesquisado nesta edição"? Em celular: os botões respondem, a pasta do marco fica à vista, a cena ficou fluida? Anote o tempo das três fases e as frases exatas das respostas |

O que as três primeiras fases dizem, para conferir as respostas da tarefa 5:

| Trajetória | De onde veio | Cargo ou função nas três fases | Termos que as fases explicam |
| --- | --- | --- | --- |
| Lula | Nasceu em outubro de 1945, em Garanhuns, no interior de Pernambuco. Em dezembro de 1952 a mãe e os filhos foram para o litoral de São Paulo, de caminhão, em uma viagem de 13 dias; em 1956, para a cidade de São Paulo | Torneiro mecânico e metalúrgico; entrou na diretoria do sindicato dos metalúrgicos em 1969 e foi eleito presidente dele em 1975; um dos fundadores do PT, em 1980; deputado federal constituinte, eleito em 1986 | Sindicato, greve, partido político, deputado federal, Assembleia Constituinte |
| Flávio Bolsonaro | Nasceu em 30 de abril de 1981, em Resende, no estado do Rio de Janeiro. Estudou direito e fez dois estágios antes da primeira eleição | Deputado estadual pelo Rio de Janeiro, eleito em 2002 e reeleito em 2006 e em 2010; autor de leis estaduais | Partido político, deputado estadual, deputado federal, projeto de lei, sanção |

A resposta não precisa trazer as datas. O que conta é a pessoa dizer a origem, ao menos um cargo e o que esse cargo faz, sem trocar uma pessoa pela outra e sem afirmar o que a fase não diz. Se ela disser algo que não está nas fases, anote: pode ser conhecimento que ela já tinha, ou uma leitura errada do texto.

## Perguntas do fim

Faça depois das cinco tarefas. Anote a resposta como foi dita.

**Cobertura do acervo**

1. Você sentiu falta de algum acontecimento que esperava encontrar? Qual?
2. Em alguns trechos aparece "sem registros". O que você entendeu que isso quer dizer?
3. Uma das trajetórias começa bem antes da outra. O que você entendeu disso?

**Precisão das datas e dos lugares**

4. Algumas datas têm o dia, outras só o mês ou só o ano. Você reparou? O que entendeu?
5. O que um ponto no mapa representa para você: um endereço, uma cidade, outra coisa?
6. Alguns acontecimentos não aparecem no mapa. Você notou? Entendeu por quê?

**Confiança**

7. Você confiaria no que leu? O que fez você confiar ou desconfiar?
8. O atlas diz que a revisão foi feita com ajuda de inteligência artificial e que a revisão por uma pessoa está pendente. Você viu esse aviso? O que achou?
9. As duas pessoas pareceram tratadas do mesmo jeito? Por quê?

**Jogo**

12. O que você aprendeu no jogo que não sabia antes?
13. Ficou claro o que era para fazer em cada fase? O que você achou que a pasta em destaque era?
14. As perguntas no fim de cada fase: eram fáceis, difíceis, justas? Quando você errou, o que aconteceu? Você sentiu que perdeu alguma coisa?
15. Em várias fases aparece "Ainda não pesquisado nesta edição". O que você entendeu que isso quer dizer?
16. O que você entendeu que o lugar do cenário era? Ele afirma que a pessoa esteve ali? E o personagem de óculos que dá as instruções, quem é?
17. Se você viu a fase sobre processos na Justiça: o que aconteceu, e em que ordem? O jogo pediu para você julgar alguém?
18. Se você viu a fase da eleição de 2026: o que é uma proposta de governo? Ela é algo que a pessoa fez?
19. Em celular: os botões foram fáceis de tocar? A cena travou em algum momento? Você tentou "Ler sem o cenário"?
20. Ao terminar uma fase aparece um carimbo, e o cartão da fase tem **Meu passaporte**. O que você entendeu que o carimbo é? Ele deu vontade de seguir para a fase seguinte, atrapalhou ou passou despercebido? Pareceu uma nota?

**Geral**

10. O que foi mais difícil?
11. O que você mudaria primeiro?

## Fichas

Uma por participante. Não registre nome completo, contato nem posição política.

### Participante 1

| Campo | Registro |
| --- | --- |
| Data da sessão | (a preencher) |
| Aparelho e navegador | (a preencher) |
| Aparelho real ou emulação | (a preencher) |
| Familiaridade com o assunto | (a preencher: acompanha de perto, acompanha pouco, não acompanha) |
| Episódio das tarefas 1 e 2 | A |

| Tarefa | Resultado | Precisou de ajuda? Qual dica? | Dificuldades observadas | Comentários da pessoa |
| --- | --- | --- | --- | --- |
| 1. Encontrar o episódio | (a preencher: concluiu, com ajuda, não concluiu) | | | |
| 2. Consultar a fonte | | | | |
| 3. Comparar em 2019 a 2022 | | | | |
| 4. Compartilhar | | | | |
| 5. Seguir três fases do jogo, com o tempo gasto | | | | |

Respostas às perguntas do fim: (a preencher, numeradas de 1 a 20)

### Participante 2

| Campo | Registro |
| --- | --- |
| Data da sessão | (a preencher) |
| Aparelho e navegador | (a preencher) |
| Aparelho real ou emulação | (a preencher) |
| Familiaridade com o assunto | (a preencher) |
| Episódio das tarefas 1 e 2 | B |

| Tarefa | Resultado | Precisou de ajuda? Qual dica? | Dificuldades observadas | Comentários da pessoa |
| --- | --- | --- | --- | --- |
| 1. Encontrar o episódio | | | | |
| 2. Consultar a fonte | | | | |
| 3. Comparar em 2019 a 2022 | | | | |
| 4. Compartilhar | | | | |
| 5. Seguir três fases do jogo, com o tempo gasto | | | | |

Respostas às perguntas do fim: (a preencher, numeradas de 1 a 20)

### Participante 3

| Campo | Registro |
| --- | --- |
| Data da sessão | (a preencher) |
| Aparelho e navegador | (a preencher) |
| Aparelho real ou emulação | (a preencher) |
| Familiaridade com o assunto | (a preencher) |
| Episódio das tarefas 1 e 2 | A |

| Tarefa | Resultado | Precisou de ajuda? Qual dica? | Dificuldades observadas | Comentários da pessoa |
| --- | --- | --- | --- | --- |
| 1. Encontrar o episódio | | | | |
| 2. Consultar a fonte | | | | |
| 3. Comparar em 2019 a 2022 | | | | |
| 4. Compartilhar | | | | |
| 5. Seguir três fases do jogo, com o tempo gasto | | | | |

Respostas às perguntas do fim: (a preencher, numeradas de 1 a 20)

## Depois das sessões

1. Preencha o quadro abaixo com o que se repetiu. Um problema visto em duas das três pessoas é prioridade.
2. Separe o que é do produto (a pessoa não achou as fontes, não soube o que tocar), do conteúdo (a pessoa entendeu errado um texto, uma pergunta ou uma definição) e do acervo (a pessoa sentiu falta de um acontecimento).
3. Uma leitura errada de conteúdo, como entender a quantidade de registros como medida de atividade, uma proposta como coisa feita ou uma denúncia como condenação, pesa mais que uma dificuldade de navegação.
4. Anote o tempo das três fases de cada pessoa. A meta de desenho é de dez a quinze minutos por trajetória de nove fases, e ninguém a mediu.
5. Troque a situação no topo deste documento e no [STATUS.md](STATUS.md) só quando as três fichas estiverem preenchidas.

| Problema observado | Em quantas pessoas | Tipo | O que fazer |
| --- | --- | --- | --- |
| (a preencher) | | | |

## A trilha em celular real

Roteiro curto para o responsável pelo projeto executar em um celular de verdade. A trilha só foi conferida em emulação. Leva de quinze a vinte minutos. Anote o aparelho, o navegador e o que aconteceu em cada passo.

1. Abra `/jogo/` no celular, em pé. Confira: os dois cartões cabem na tela sem rolagem lateral; em cada um, o nome e o botão **Começar do início**, com o ano, aparecem antes da prévia do cenário; **Ler sem o cenário** está logo abaixo.
2. Toque em **Começar do início** em uma das trajetórias. Confira: o cartão da fase vai de um lado ao outro e diz "Trajetória · Fase 1 de 9", o período e o título; a sala aparece inteira entre o cartão e o botão **Abrir o marco**; a pasta do marco está à vista, com o rótulo "Abrir".
3. Toque na pasta. Confira: o boneco anda até ela e a explicação abre; a janela não fecha sozinha com um segundo toque dado por reflexo; dá para rolar o texto inteiro dentro da janela.
4. Abra um termo explicado e **Ver fontes**. Confira: abrem no lugar, sem trocar de tela, e o link de um documento abre em outra aba.
5. Erre a pergunta de propósito. Confira: aparece "Ainda não." com a explicação, sem a resposta certa marcada, e os botões **Tentar de novo** e **Ver a explicação e continuar** ficam à vista. Tente de novo e acerte: aparece "Certo." e o botão **Continuar: fase 2**.
6. Na fase 2 de Lula, ou na 6 de Flávio Bolsonaro, faça a ordenação: toque nos três registros na ordem. Confira que o número de cada um aparece e que dá para desfazer um toque.
7. Em uma fase que tenha pasta com o sinal de mais (a fase 1 de Lula tem uma; na trajetória de Flávio Bolsonaro, a partir da fase 2), toque nela. Confira: o registro abre em uma janela; **Voltar ao cenário** devolve a cena como estava.
8. Abra **Fases**. Confira: a lista mostra a situação de cada fase; abra a última e volte à primeira, sem que nada apareça como perdido. Desligue o humor ali e confira que, em uma fase ainda não concluída, a fala em itálico do cartão da fase some na hora.
9. Feche o navegador, abra `/jogo/` de novo. Confira: o cartão da trajetória mostra **Continuar de onde parei**, com a fase e o período, e **Ver desde o início**, com o ano. Toque em **Ver desde o início** e confira que abre a fase 1, e que a lista de fases continua com o que você já fez.
10. Abra um aprofundamento pela entrada. Confira: o cartão diz que é um aprofundamento, e **Ir para o início da vida** abre a fase 1 da trajetória.
11. Deite o celular em uma fase com cenário. Confira: a cena fica ao lado do cartão, com a pasta do marco e o botão principal à vista.
12. Toque em **Ler sem o cenário**. Confira: a mesma fase aparece na página, com a pergunta e os botões de fase anterior e seguinte; **Voltar ao cenário** desfaz.
13. Abra a fase 9 pela lista, conclua a atividade e use **Ver o resumo**. Diga se o resumo se entende sem ajuda e se os caminhos do fim fazem sentido.
14. Nas fases de processos (a 7 de Lula e a 6 de Flávio Bolsonaro), o Escrivão não faz humor, mesmo com o humor ligado. Diga se o tom está certo, e se alguma outra fase deveria ficar sem humor.
15. Abra `/comparar/` e toque em **Para começar: resumo por cargo e por área**. Diga se o resumo se entende sem ajuda. Role até **O que cada documento propõe** e confira que as três frases de cada área cabem na largura da tela.
16. Conclua uma fase e olhe o carimbo. Confira: ele aparece com o título da fase e uma confirmação curta; logo abaixo vêm **A seguir**, com a fase seguinte, e o botão **Continuar**, sem precisar fechar nada. De volta à cena, toque em **Meu passaporte**, no cartão da fase. Confira: a linha "Concluídas" mudou; a caderneta cabe na tela, os espaços são fáceis de tocar, e fechar volta à cena. Diga se o carimbo cobre algum texto ou botão, e se o tom está certo.

Registre aqui o resultado:

| Passo | Aparelho e navegador | O que aconteceu | Correção necessária |
| --- | --- | --- | --- |
| (a preencher) | | | |

## O que este roteiro não cobre

- Leitor de tela e navegação só por teclado com pessoas que dependem deles. A conferência técnica está em [QA.md](QA.md), e nenhum leitor de tela foi usado nela; uma sessão com quem usa essas ferramentas no dia a dia fica como recomendação.
- Se o que a pessoa aprendeu fica com ela depois de alguns dias. O roteiro pergunta logo depois das fases.
- Três pessoas mostram os problemas mais comuns. Não medem quantas pessoas teriam cada dificuldade.
