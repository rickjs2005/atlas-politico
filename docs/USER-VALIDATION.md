# Validação com pessoas

**Situação: pendente.** Até 10 de outubro de 2026, nenhuma sessão foi feita. Este documento traz o roteiro pronto e as fichas em branco. Os resultados entram aqui só depois de sessões reais, com as palavras de quem participou. A versão de lançamento do jogo acrescentou a tarefa 5 e as perguntas 12 a 15; o lançamento depende destas sessões ([GAME-RELEASE.md](GAME-RELEASE.md)).

O que a validação responde: uma pessoa que nunca viu o atlas consegue, sem ajuda, encontrar um episódio, chegar à fonte, comparar as duas trajetórias, mandar o resultado para alguém e jogar um capítulo entendendo o que o jogo mostra? Os testes automáticos de [QA.md](QA.md) mostram que as telas funcionam. Eles não mostram se uma pessoa entende o que vê.

## Quem convidar

Três pessoas que não participaram do projeto. Se der para escolher, uma que acompanha política de perto, uma que não acompanha e uma que use mais o celular que o computador. Posição política não é critério de escolha, e não é perguntada.

## Preparação

1. Gere e sirva a versão de produção: `npm run build` e depois `npm run preview`. O atlas abre em `http://localhost:4311/`.
2. Faça pelo menos uma das três sessões em um celular de verdade, e nela faça a tarefa 5 (o jogo) em pé e deitado. Com o celular na mesma rede do computador, o endereço é `http://<IP do computador>:4311/`. O Windows pode pedir permissão para o servidor aceitar a conexão. Esse caminho não foi testado: anote se funcionou. O jogo em celular só foi conferido em emulação; a sessão real é a primeira vez que o toque, a cadência e o tamanho dos botões serão vistos em aparelho de verdade. Anote o modelo do celular e se a cena ficou fluida ou travou.
3. No celular aberto pelo IP, o navegador não libera a área de transferência para páginas sem conexão segura. O botão de copiar mostra o link em um campo já selecionado, para a pessoa copiar à mão. É o comportamento esperado, e vale observar se a pessoa entende.
4. Abra a página inicial e entregue o aparelho. Não mostre nada antes.
5. Tenha esta ficha à mão e anote na hora. Se a pessoa deixar, grave a tela.

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

### Tarefa 5: jogar um capítulo

Dizer: "O site tem um jogo. Jogue com a pessoa que você ainda não escolheu nas tarefas anteriores até passar para o segundo capítulo. Depois me diga: o que você precisou fazer para a porta abrir, e o que era aquele lugar?"

Se houver tempo, peça um segundo capítulo com tarefa de documento ou de lugar (capítulo 3 de Lula, capítulo 3 ou 5 de Flávio Bolsonaro; a tarefa de decisão está no capítulo 5 de Lula e no 4 de Flávio Bolsonaro). Pelo painel **Capítulos e tarefas** não dá para pular; se a pessoa já tem progresso, use o personagem em que ela está. As salas temáticas (Economia e Segurança pública) abrem da entrada do jogo sem depender da trajetória.

## Gabarito para quem aplica

Não leia para o participante. Os dados são os da edição 0.1.1.

| Tarefa | O que conta como concluído | O que observar |
| --- | --- | --- |
| 1, episódio A | Chegar ao registro "Flávio Bolsonaro é eleito senador pelo Rio de Janeiro", de 2018, localizado no Estado do Rio de Janeiro | O registro traz só o ano. A pessoa percebe o aviso "Só o ano está documentado"? Ela entende que o ponto no mapa é o centro do estado, e não um endereço? |
| 1, episódio B | Chegar ao registro "Lula é eleito presidente da República pela terceira vez", de 30 de outubro de 2022, de abrangência nacional | O registro não tem ponto no mapa. A pessoa encontra essa explicação, ou conclui que o mapa falhou? |
| 2 | Abrir um documento da lista de fontes do registro e dizer algo que esteja no campo "O que sustenta" daquela fonte | A pessoa acha as fontes sem ajuda? Lê "Onde" e "O que sustenta"? Volta ao atlas depois de abrir o documento? Nas fichas do TSE, a página demora e é de outro site: anote a reação |
| 3 | Chegar a uma tela com as duas pessoas no período de 2019 a 2022. Nesse recorte, o atlas tem 8 registros de Flávio Bolsonaro e 3 de Lula | A leitura esperada é que a quantidade mostra o que o atlas registrou, e não quem fez mais. Anote a frase exata que a pessoa usou para explicar a diferença |
| 4 | Produzir um link que, aberto em outro lugar, mostra o mesmo período e as mesmas duas pessoas | A pessoa usa o botão de copiar ou a barra de endereço? Os dois valem. Se o link aberto não mostrar o mesmo recorte, anote como defeito |
| 5 | Chegar ao capítulo 2 do personagem escolhido e dizer, com as próprias palavras, que a porta abriu com todos os registros recolhidos e a tarefa feita, e que o cenário é uma representação (não é onde os fatos aconteceram) | A pessoa acha os registros sozinha? Entende a contagem "Registros: n de total"? Lê o registro ou só fecha? Percebe que a figura e o cenário são representações? Em celular: o direcional e o botão de ação respondem? A cena ficou fluida? Anote a frase exata sobre o que o lugar era |

## Perguntas do fim

Faça depois das quatro tarefas. Anote a resposta como foi dita.

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

12. No jogo, o que você entendeu que o lugar do cenário era? Ele afirma que a pessoa esteve ali?
13. Se você leu um registro de processo (denúncia, condenação, anulação): o que a ficha dizia que aconteceu, e quando? Você sentiu que o jogo pedia para você julgar alguém?
14. A figura do personagem muda entre os capítulos. Você reparou? O que entendeu disso?
15. Em celular: os botões e o direcional foram fáceis de usar? A cena travou em algum momento?

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
| 5. Jogar um capítulo | | | | |

Respostas às perguntas do fim: (a preencher, numeradas de 1 a 15)

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
| 5. Jogar um capítulo | | | | |

Respostas às perguntas do fim: (a preencher, numeradas de 1 a 15)

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
| 5. Jogar um capítulo | | | | |

Respostas às perguntas do fim: (a preencher, numeradas de 1 a 15)

## Depois das sessões

1. Preencha o quadro abaixo com o que se repetiu. Um problema visto em duas das três pessoas é prioridade.
2. Separe o que é do produto (a pessoa não achou as fontes), do conteúdo (a pessoa entendeu errado um texto) e do acervo (a pessoa sentiu falta de um acontecimento).
3. Uma leitura errada de conteúdo, como entender a quantidade de registros como medida de atividade, pesa mais que uma dificuldade de navegação.
4. Troque a situação no topo deste documento e no [STATUS.md](STATUS.md) só quando as três fichas estiverem preenchidas.

| Problema observado | Em quantas pessoas | Tipo | O que fazer |
| --- | --- | --- | --- |
| (a preencher) | | | |

## Salas e decisões em celular real

Roteiro curto para o responsável pelo projeto executar em um celular de verdade (a entrega P1 só foi conferida em emulação). Leva uns quinze minutos. Anote o aparelho, o navegador e o que aconteceu em cada passo.

1. Abra `/jogo/` no celular. Confira: os dois cartões cabem na tela sem rolagem lateral; cada cartão mostra as duas salas temáticas com a quantidade de decisões e o botão **Começar**; o texto diz que o Escrivão é fictício e que o humor pode ser desligado.
2. Toque em **Começar** na sala Economia de qualquer um dos dois. Confira: a cena ocupa a tela; a caixa do Escrivão aparece sobre a cena com a instrução e uma fala de humor em itálico, e fecha pelo botão **Fechar**; o cabeçalho diz "Sala Economia · Capítulo 1".
3. Com o direcional, ande até uma pasta e toque no botão de ação. Confira: o cartão da decisão abre com cargo, instituição, data, o tipo do ato ou a manifestação registrada, as fontes e a nota de revisão; dá para rolar o cartão inteiro; o botão **Guardar e responder** (na decisão da tarefa) ou **Guardar e continuar** fica alcançável sem rolar a página.
4. Na pergunta da tarefa (duas etapas): erre de propósito uma vez em cada etapa e leia a explicação; confira que a fala de erro do Escrivão aparece e que **Tentar de novo** devolve a pergunta. Acerte as duas. Confira o aviso "Tarefa concluída" e o que falta para a saída.
5. Abra **Capítulos e tarefas**, desligue o humor em **Preferências** e feche. Toque em **Como jogar**: confira que não há mais fala em itálico, só a instrução e o que vem do registro. Recarregue a página: o humor continua desligado.
6. Recolha as outras pastas pelo painel ou pela cena até a saída abrir; confira a caixa de conclusão do Escrivão sobre a cena e atravesse a porta. Confira a tela "Fim da sala Economia", com o aviso de amostra e os links para a outra sala e para a trajetória.
7. Volte a `/jogo/`: a sala Economia do personagem deve estar "concluída" ("Rever") e a trajetória dele, "Ainda não jogado". Entre na trajetória e confira que o capítulo 1 começa do zero.
8. Deite o celular na sala Segurança pública: o palco inteiro, o direcional e o botão de ação devem caber na janela, e a caixa do Escrivão some para não cobrir a cena.
9. Abra `/politicos/lula/` e role até **Decisões documentadas**: os cartões aparecem por tema, com o aviso de amostra; toque em um link de fonte e confira que abre em nova aba. Repita em `/comparar/`, seção **Votos e atos no mesmo tema**: as duas colunas por tema e a marca "mesma proposição" onde os dois têm decisão.

Registre aqui o resultado:

| Passo | Aparelho e navegador | O que aconteceu | Correção necessária |
| --- | --- | --- | --- |
| (a preencher) | | | |

## O que este roteiro não cobre

- Leitor de tela e navegação só por teclado com pessoas que dependem deles. A conferência técnica está em [QA.md](QA.md); uma sessão com quem usa essas ferramentas no dia a dia fica como recomendação.
- Três pessoas mostram os problemas mais comuns. Não medem quantas pessoas teriam cada dificuldade.
