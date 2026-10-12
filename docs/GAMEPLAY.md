# Jogo

O atlas tem um segundo caminho de leitura: um jogo em que o visitante escolhe Lula ou Flávio Bolsonaro e segue a vida dela ou dele em fases curtas. Cada fase tem um marco, uma explicação de 60 a 100 palavras e uma atividade. O ciclo é um só: **abrir o marco, ler a explicação, responder a atividade ou ler a explicação dela, continuar.** O objetivo é que quem conhece pouco de política saia sabendo de onde cada um veio, que cargos ocupou, o que esses cargos fazem e exemplos documentados do que fez neles. O jogo não dá nota, não aponta vencedor e não recomenda voto.

Esta é a **trilha simples**, pedida em 11 de outubro de 2026, que substituiu o jogo de exploração com tarefa e saída. O que mudou e por quê está em [GAME-TRAIL.md](GAME-TRAIL.md); as decisões, em [DECISIONS.md](DECISIONS.md), de D-133 a D-149; a matriz de cobertura, gerada dos dados, em [GAME-COVERAGE.md](GAME-COVERAGE.md). Os documentos [GAME-RELEASE.md](GAME-RELEASE.md) e [VOTOS-E-ESCRIVAO.md](VOTOS-E-ESCRIVAO.md) descrevem o jogo anterior e ficam como histórico.

Todo o texto que o jogo mostra vem do conteúdo publicado, pelo pipeline ([DATA-PIPELINE.md](DATA-PIPELINE.md)): as fases, os fatos biográficos, os termos explicados, os acontecimentos, as decisões e as propostas. A conferência desse conteúdo é assistida por IA, a revisão humana está pendente ([HUMAN-REVIEW.md](HUMAN-REVIEW.md)), e ninguém testou a compreensão com pessoas ([USER-VALIDATION.md](USER-VALIDATION.md)). O jogo diz a situação da revisão nas próprias telas.

## Como abrir

```
npm run build      # gera os dados e o site estático em out/
npm run preview    # serve out/ em http://localhost:4311
```

| Endereço | O que é |
| --- | --- |
| `http://localhost:4311/jogo/` | Entrada do jogo: as duas trajetórias, com a situação de cada uma neste navegador, e os aprofundamentos |
| `http://localhost:4311/jogo/lula/` e `/jogo/flavio-bolsonaro/` | A trajetória de cada um. Sem pedido no endereço, abre onde a pessoa parou; em visita nova, na origem |
| `…/jogo/lula/?fase=3` | A fase 3 da trajetória. É navegação: não conclui nem apaga nada |
| `…/jogo/lula/?fase=1&leitura=1` | A mesma fase em "Ler sem o cenário" |
| `…/jogo/lula/economia/`, `…/jogo/lula/seguranca-publica/` e os mesmos de `/jogo/flavio-bolsonaro/` | Os aprofundamentos de cada um |
| `http://localhost:4311/` | Entrada do atlas, com o acesso **Jogar com** abaixo de cada cartão |

Em desenvolvimento: `npm run dev` e `http://localhost:3000/jogo/`. A galeria da arte, que só existe em desenvolvimento, fica em `http://localhost:3000/dev/jogo-arte/` (com `?parado`, cada peça é desenhada uma vez; é assim que `node scripts/capture-art.mjs` a captura).

## Fluxo

```
entrada do jogo (/jogo/)
   │  Começar do início · Continuar de onde parei · Ver desde o início
   ▼
fase aberta (/jogo/<personagem>/?fase=N)
   │  cartão da fase: sala, "Fase X de Y", período, título e a instrução de agora
   │  toca na pasta em destaque, ou em "Abrir o marco"
   ▼
explicação: o marco, de dois a quatro blocos curtos, os termos explicados, "Ver fontes"
   │
   ▼
atividade: uma pergunta com três opções, ou uma ordenação de três registros
   │  acertou ........................ "Certo." e a explicação da resposta
   │  errou .......................... "Ainda não." e a explicação; tentar de novo ou seguir
   │  "Ver a explicação e continuar".. a explicação, sem responder
   ▼
"Continuar: fase N+1" ... na última fase, "Ver o resumo"
```

1. **Entrada.** As duas trajetórias aparecem com o mesmo cartão, em ordem alfabética. O nome, a situação e os caminhos vêm antes da prévia do cenário (D-145). Quem nunca abriu vê **Começar do início**, com o ano; quem já começou vê **Continuar de onde parei**, com a fase e o período, e **Ver desde o início**, com o ano; quem concluiu vê **Rever desde o início**. **Ler sem o cenário** fica no mesmo bloco. Rever o começo é navegação: não apaga nada.
2. **Cartão da fase.** Sobre a cena, sem abrir painel: a sala, "Fase X de Y", o período, o título e, em uma linha, o que fazer agora. Quem chegou sem pedir fase e caiu depois da primeira lê ali "Você continua de onde parou", ou "O jogo mudou desde a sua última visita: a trajetória agora começa pela origem", com o botão **Ver desde o início** e o ano (D-139).
3. **Marco.** O cenário mostra o boneco e uma pasta em destaque, com o rótulo "Abrir". Tocar nela, ou no botão **Abrir o marco**, faz o boneco andar até a pasta e abre a explicação. Com movimento reduzido ele não anda, e a explicação abre na hora (D-137).
4. **Explicação.** O objetivo da fase em uma frase, o marco com a data na precisão documentada, de dois a quatro blocos de texto, os termos explicados na primeira vez em que aparecem (cada um abre no lugar, com a definição, o aviso do que ela simplifica e o texto oficial que a sustenta) e **Ver fontes**, que lista os registros do atlas em que cada parte se apoia, com os documentos e a situação da revisão.
5. **Atividade.** Uma pergunta com três opções, ou uma ordenação de três registros quando as datas decidem a ordem. Ela usa só o que a explicação acabou de dizer. Errar não tira nada: aparece a explicação da resposta, sem a opção certa marcada, e a pessoa tenta de novo ou segue. **Ver a explicação e continuar** também conclui a fase.
6. **Continuar.** Atividade concluída libera **Continuar: fase N**. Na última fase, o botão é **Ver o resumo**.
7. **Resumo.** O que cada fase mostrou, o que a edição não pesquisou ("Uma lacuna da pesquisa não é uma afirmação sobre a pessoa") e para onde ir: a outra trajetória, a comparação, as propostas por área, os aprofundamentos e todos os registros no atlas. Não há troféu, nota nem elogio.

Não há fase bloqueada. **Fases**, no alto da cena, abre a lista com a situação de cada uma ("ainda não aberta", "explicação lida", "concluída", "período visto na versão anterior", "resposta reaberta por correção"), e qualquer uma abre dali. O progresso guarda o que foi lido e respondido e serve para sugerir o próximo passo.

## Salas: a trajetória e os aprofundamentos

| Sala | Natureza | O que reúne | Rota |
| --- | --- | --- | --- |
| Trajetória (`historico`) | trajetória | Da origem à data de corte, em nove fases por pessoa | `/jogo/<personagem>/` |
| Economia | aprofundamento | Decisões documentadas no tema, em uma fase | `/jogo/<personagem>/economia/` |
| Segurança pública | aprofundamento | Decisões documentadas no tema, em uma fase | `/jogo/<personagem>/seguranca-publica/` |

A sala (`RoomId`, `src/lib/game/rooms.ts`) é o que agrupa as fases. Não é a cena (`SceneId`, o cenário de uma fase) nem uma categoria do atlas. A entrada começa pela trajetória; os aprofundamentos ficam abaixo, sob "Aprofundamento por assunto", com os anos e a frase "Para depois da trajetória. Não é o começo da vida de ninguém". Quem chega direto a um aprofundamento lê, no cartão da fase e em **Como funciona**, que é um aprofundamento sobre um assunto, e não o começo da trajetória, com o caminho **Ir para o início da vida**. As decisões de um aprofundamento são amostra da edição, e a tela diz.

## Fases

As fases vêm de `content/published/fasesDoJogo.json`. O cenário e a figura de cada uma ficam no código, por identificador (`src/lib/game/presentation.ts`). As tabelas abaixo são um resumo; a matriz completa, com os registros apontados por fase, as lacunas e a revisão, é gerada em [GAME-COVERAGE.md](GAME-COVERAGE.md) (`npm run game:coverage`).

### Lula, trajetória

| Fase | Período | Cenário | Figura | Marco | Atividade |
| --- | --- | --- | --- | --- | --- |
| 1. De Garanhuns a São Paulo | 1945 a 1956 | Sala de arquivo | primeiros anos | O nascimento (fato biográfico) | pergunta |
| 2. Da fábrica ao sindicato | 1956 a 1979 | Salão do sindicato | primeiros anos | A eleição para a presidência do sindicato, em 1975 | ordenação |
| 3. Um partido e uma Constituição | 1980 a 1988 | Plenário da Constituinte | anos intermediários | A eleição para deputado federal constituinte, em 1986 | pergunta |
| 4. Quatro disputas pela Presidência | 1989 a 2002 | Comitê de campanha | anos intermediários | A eleição para presidente, em 2002 | pergunta |
| 5. O primeiro governo | 2003 a 2006 | Gabinete | anos intermediários | A Medida Provisória nº 132, de 2003 | pergunta |
| 6. O segundo governo | 2007 a 2010 | Gabinete | anos intermediários | A Lei nº 11.738, de 2008 | pergunta |
| 7. Condenação, prisão e anulação | 2016 a 2021 | Sala de audiências | anos recentes | A anulação das condenações pelo STF, em 2021 | ordenação |
| 8. De volta à Presidência | 2022 a 2026 | Gabinete | anos recentes | A eleição de 2022 | pergunta |
| 9. A eleição de 2026 | 2026 | Auditório de convenção | anos recentes | O primeiro turno de 2026 | pergunta |

### Flávio Bolsonaro, trajetória

| Fase | Período | Cenário | Figura | Marco | Atividade |
| --- | --- | --- | --- | --- | --- |
| 1. Origem e formação | 1981 a 2001 | Sala de arquivo | primeiros anos | O nascimento (fato biográfico) | pergunta |
| 2. A primeira eleição | 2002 a 2003 | Salão da Assembleia | primeiros anos | A eleição para deputado estadual, em 2002 | pergunta |
| 3. Na Alerj: como um projeto vira lei | 2003 a 2010 | Salão da Assembleia | primeiros anos | A autoria da Lei estadual 4.250, de 2003 | pergunta |
| 4. Na Alerj: os últimos mandatos | 2011 a 2018 | Salão da Assembleia | anos intermediários | A autoria da Lei estadual 5.938, de 2011 | pergunta |
| 5. Do Rio de Janeiro para o Senado | 2018 a 2019 | Plenário do Senado | anos intermediários | A eleição para senador, em 2018 | pergunta |
| 6. Denúncia, anulação e rejeição | 2019 a 2025 | Sala de audiências | anos intermediários | A rejeição da denúncia pelo Tribunal de Justiça, em 2022 | ordenação |
| 7. Líder, relator e presidente de comissão | 2022 a 2025 | Sala de comissão | anos recentes | A relatoria do projeto das saídas temporárias, em 2024 | pergunta |
| 8. Como ler um voto no Senado | 2023 a 2025 | Plenário do Senado | anos recentes | O voto na PEC 45/2019, em 2023 | pergunta |
| 9. A eleição de 2026 | 2025 a 2026 | Auditório de convenção | anos recentes | O primeiro turno de 2026 | pergunta |

### Aprofundamentos

| Sala | Personagem | Fase | Período | Marco |
| --- | --- | --- | --- | --- |
| Economia | Lula | Economia: cinco atos de Lula na Presidência | 2007 a 2026 | A Lei Complementar nº 200, de 2023 |
| Economia | Flávio Bolsonaro | Economia: três votos de Flávio Bolsonaro no Senado | 2023 a 2026 | O voto no PLP 93/2023 |
| Segurança pública | Lula | Segurança pública: cinco atos de Lula na Presidência | 2003 a 2026 | A Lei nº 14.843, de 2024 |
| Segurança pública | Flávio Bolsonaro | Segurança pública: três votos de Flávio Bolsonaro no Senado | 2024 a 2026 | O voto no PL 2253/2022 |

Os quatro usam uma sala de arquivo como cenário. O período de cada um vai até 2026 porque a lista de "Explorar este período" traz as três propostas da área registradas no TSE.

### Por que estas fases

- **As duas trilhas têm a mesma forma.** Nove fases de trajetória e dois aprofundamentos para cada pessoa, com as mesmas etapas: origem, cargos, exemplos documentados de atuação, processos e a eleição de 2026. Um teste confere a contagem, a ordem cronológica e que nenhuma pessoa recebe muito mais texto que a outra.
- **Começa pela origem.** A primeira fase é a do nascimento, no ano em que os documentos o registram, e fica em uma sala de arquivo de propósito: o jogo não desenha a infância de ninguém.
- **Períodos diferentes não são nivelados.** As trajetórias vão de 1945 a 2026 e de 1981 a 2026, e os períodos das fases seguem o que cada uma tem. É a regra do atlas para carreiras de duração diferente.
- **O marco é algo que aconteceu.** Um acontecimento, uma decisão ou um fato biográfico da pessoa. Um termo explicado ou uma proposta eleitoral nunca é marco; o contrato recusa.
- **Cada tipo de registro é dito como o que é.** Voto, ato do Executivo, atuação legislativa, proposta e resultado de eleição são coisas diferentes, e as fases dizem. Nas fases de voto, o texto separa o voto da pessoa do resultado da votação; nas de leis estaduais, diz que a lei é de autoria dele e como virou lei, sem dizer o que ela produziu; na de 2026, diz que proposta é intenção.
- **Os episódios judiciais ficam juntos, com a ficha própria.** Cada trajetória tem uma fase de processos, na mesma posição relativa: depois dos cargos e antes da eleição de 2026. A leitura curta traz juntas a acusação ou a condenação, a defesa, a decisão e o desfecho.
- **O primeiro turno de 2026 é apuração parcial.** O registro traz os números com 99,99% das urnas apuradas, como a notícia do TSE os publicou. A totalização final só entra por uma edição nova de conteúdo. O segundo turno é posterior à data de corte e não existe no jogo.
- **Toda fase declara ao menos uma lacuna.** "Ainda não pesquisado nesta edição" aparece no fim de cada fase e no resumo.

## A atividade

As regras estão em `src/lib/game/trail.ts`, puras.

| Tipo | O que pede | A resposta certa vem de |
| --- | --- | --- |
| `pergunta` | Escolher uma entre três opções | A opção marcada como certa no conteúdo da fase |
| `ordem` | Tocar em três registros na ordem em que aconteceram | As datas dos registros apontados, e não a ordem em que a fase os escreveu |

- **A pergunta só usa o que a explicação acabou de dizer.** Um teste confere que todo ano citado no enunciado, na opção certa e na explicação da resposta está em um registro que a atividade aponta. Nenhuma pergunta pede opinião nem juízo sobre as pessoas.
- **A ordenação só existe quando as datas decidem a ordem.** Os intervalos de cálculo dos registros não podem se cruzar: um ano inteiro não vem antes nem depois de um dia do mesmo ano. O conjunto recusa uma ordenação assim.
- **A ordem das opções na tela é estável e não depende de como o conteúdo foi escrito.** Sai de um resumo da chave de cada opção com o identificador da fase: a mesma fase mostra sempre a mesma ordem, e a certa não fica sempre na mesma posição.
- **Errar explica e deixa tentar de novo.** A tentativa é contada, só como informação. A explicação da resposta aparece, sem a opção certa marcada: a nova tentativa continua sendo uma tentativa. A opção certa só é marcada depois de acertar, de pedir a explicação ou em fase já concluída.
- **Ler no lugar de responder vale.** "Ver a explicação e continuar", e também seguir adiante depois de um erro, concluem a fase pela leitura. O progresso guarda como a fase foi concluída, pela resposta ou pela explicação.

## Explorar este período

Os outros registros do atlas no período da fase ficam em uma lista, no fim dela, com o título "Explorar este período · opcional". Nenhum é necessário para continuar. No cenário, os que couberem aparecem como pastas com o sinal de mais; o que não couber fica só na lista. Cada um abre em uma janela por cima da fase, que continua como estava:

| Registro | O que a janela mostra |
| --- | --- |
| Acontecimento | A data na precisão documentada, o título, a categoria, o lugar documentado, o resumo, o contexto da ficha, a ficha judicial quando o registro é de processo, as fontes com o que cada uma sustenta, a situação da revisão e o caminho para a ficha completa no atlas |
| Decisão (voto, ato do Executivo ou atuação legislativa) | O mesmo cartão do atlas: cargo e instituição, data, objeto e manifestação com o valor original do acervo (ou o tipo do ato, ou a matéria e o desfecho), fontes, revisão e o caminho para a decisão na página da pessoa |
| Fato biográfico | A data, ou "Sem data documentada", o texto, a divergência entre documentos quando há, as fontes e a revisão |
| Cargo, função ou filiação | O período, com as pontas desconhecidas ditas como tais, e as fontes |
| Proposta eleitoral | A frase do documento registrado no TSE, a área, a ressalva quando o registro traz uma (nesta edição, nenhum traz), o aviso do que uma proposta é e a página do documento |

Na lista, cada registro traz a data, o título e o que ele é. Uma decisão traz também as áreas em que o atlas a classifica e, quando há, a ementa da proposição a que ela se refere, para a pessoa saber do que a lei trata antes de abrir: um nome como "Lei nº 10.826, de 22 de dezembro de 2003" não diz nada a quem está começando. A atuação legislativa já diz o assunto no título. Um decreto não tem proposição, e aparece com o nome e a área: o modelo de dados não guarda a ementa do próprio ato.

Quando a lista tem propostas, a fase diz "As propostas vêm do documento que a candidatura registrou no TSE: dizem o que o documento propõe, e não o que foi feito", e leva às propostas que o atlas registra, por área, das duas candidaturas, na comparação.

## Ler sem o cenário

**Ler sem o cenário** traz as mesmas fases, com as mesmas explicações, atividades, fontes, registros opcionais, lista de fases e resumo, sem o palco (D-146). **Como funciona**, aberto nesse modo, diz que a fase já está aberta na página, e não manda tocar em pasta. A fase fica na página, com os botões de fase anterior e seguinte no fim. A escolha é uma preferência guardada no navegador e vale para as outras fases e salas; **Voltar ao cenário** a desfaz.

- É também o caminho quando o navegador não dá o canvas ou o pacote do palco não chega: o aviso no lugar da cena leva a ele, e nada se perde.
- O pacote do palco não é pedido em leitura.
- **Sem JavaScript,** a casca do cenário sai da página e as fases vão no HTML, em texto: a explicação, os termos, a atividade e a resposta explicada, com o caminho para a trajetória no atlas.

## Ficha judicial

Dez registros são episódios de processo: a nomeação suspensa, a condenação, a confirmação, a prisão, o registro de candidatura indeferido, a soltura e a anulação, de Lula; a denúncia, a anulação pelo STJ e a rejeição da denúncia, de Flávio Bolsonaro. No jogo, eles trazem uma ficha judicial (`src/lib/game/judicial.ts`):

- **A natureza do registro,** dita sem equiparar o que é diferente: "Denúncia: uma acusação apresentada ao tribunal. Não é condenação."; "Anulação de decisões anteriores. Não é absolvição nem condenação."; "Rejeição da denúncia. Não é absolvição nem condenação."; e assim por diante. Quando o marco da fase é um episódio de processo, a natureza aparece na própria explicação.
- **Quem alegou, o que a defesa disse, quem decidiu, quando, com que efeito e qual o desfecho na data de corte:** é o contexto da ficha do atlas, mostrado inteiro no registro aberto ("Contexto, como a ficha do atlas o traz"), sem reescrita.
- **As decisões relacionadas, por identificador, com a própria data,** em ordem cronológica: do registro da condenação de 2017 se lê que ela foi confirmada em 24 de janeiro de 2018 e anulada em 8 de março de 2021. Cada relação repete o que o contexto do registro já diz; um teste confere que todo identificador existe na edição e em uma fase do mesmo personagem.
- **O aviso:** "Denúncia, condenação, anulação, rejeição e absolvição são coisas diferentes. O jogo não pede que você decida culpa: mostra o que cada registro documenta e quando."

A atividade das duas fases de processos é uma ordenação de três decisões pelas datas. Nenhuma pede ao jogador que julgue.

## Regras editoriais do jogo

Valem as regras de [EDITORIAL.md](EDITORIAL.md), mais estas:

- **O texto da fase é conteúdo, e não código.** A explicação e a atividade entram pelo pipeline, com estado editorial, revisão identificada e a mesma barreira de publicação dos demais registros (D-134). A fase não cita documento por conta própria: cada bloco aponta os registros publicados que o sustentam, e testes conferem que todo ano escrito, e todo número com porcentagem ou com casa de milhar, está nesses registros; os outros números são conferidos na leitura.
- **A data aparece na precisão do registro.** Um acontecimento de que só se sabe o ano aparece com o ano e o aviso "Só o ano está documentado". Um fato biográfico sem data aparece como "Sem data documentada", e o texto não escreve ano nenhum. Quando os documentos divergem sobre um fato, a fase e o cartão dizem o que cada um diz.
- **A situação da revisão aparece em toda leitura.** A fase, em "Ver fontes", e cada registro aberto trazem a mesma nota das outras telas do atlas: conferido com as fontes, com assistência de IA, e revisão humana pendente. A entrada do jogo e o rodapé da página repetem a frase da edição.
- **Nenhuma fala é atribuída às pessoas retratadas.** Os personagens não falam. Quem orienta é o **Escrivão**, um guia identificado como personagem fictício (D-98, D-127).
- **O Escrivão fala em duas camadas, com no máximo uma fala de cada por momento.** A **instrução** diz o que fazer agora, em até 200 caracteres, e aparece sempre. O **humor** é ficção sobre papelada, carimbos, gavetas e o próprio Escrivão, marcado como ficção, igual para os dois personagens, e a pessoa pode desligar, pela lista de fases ou por **Como funciona**; a preferência fica no navegador, e desligar tira na hora o humor das falas que já estavam na tela. Ele não repete fato: data, título, cargo e fontes ficam na fase e no registro. Nenhuma fala cita pessoa, partido ou lado, atribui fala, traz juízo, ano ou campo a preencher, e o humor não fala de outra pessoa, de nascimento nem de aniversário (D-149): o catálogo (`src/lib/game/escrivao/`) é escrito à mão e validado por teste, e a seleção roda as falas pela vez de cada momento, sem sorteio e sem IA durante a partida.
- **Em contexto sensível, o Escrivão não faz humor.** A regra é uma lista por registro, a mesma para os dois personagens (`src/lib/game/sensitivity.ts`, D-129 e D-142): os dez episódios da ficha judicial, a prisão de 1980 com base na Lei de Segurança Nacional, e o acontecimento e o decreto da intervenção federal de 8 de janeiro de 2023. Uma fase é de contexto sensível quando o marco, a explicação ou a atividade apontam um desses registros; um registro sensível que só está em "Explorar este período" leva a própria marca quando é aberto. Na edição, são sensíveis as fases 3, 7 e 8 da trajetória de Lula, a fase 6 da de Flávio Bolsonaro e o aprofundamento de Segurança pública de Lula, cuja explicação aponta o decreto da intervenção. Um tema inteiro não é sensível. A lista e o tom são decisão editorial, e a aprovação é de uma pessoa: está pendente.
- **A proposta eleitoral é dita como proposta.** A frase começa por "O documento", o cartão diz que ela não é ato, voto nem resultado, e o Escrivão não a comenta (D-138).
- **As decisões aparecem como o cartão do atlas.** Cargo e instituição, data, objeto votado e manifestação com o valor original, ou tipo do ato e seus campos, ou a matéria e o desfecho, com as fontes e a revisão. O cartão do voto diz que a posição vale para o objeto votado.
- **O cenário é uma representação.** Não afirma que a pessoa esteve naquele lugar nem que os fatos aconteceram nele. A frase está na entrada do jogo, em **Como funciona** e no rodapé da página.
- **A figura de cada época é estilizada.** Cada personagem tem três figuras, que mudam cabelo, barba e roupa com a mesma escala para os dois. Não afirmam a aparência real da pessoa em cada data (D-111).
- **São marcos documentados, e não a vida inteira.** A entrada, o rodapé e o resumo dizem. Nunca "toda a vida" nem "todas as propostas".
- **Mesmo tratamento.** Os dois personagens têm o mesmo cartão, a mesma mecânica, os mesmos textos fixos, as mesmas três épocas e o mesmo cuidado de desenho; a ordem é alfabética. Nenhuma cor identifica pessoa ou partido, e os cenários não trazem símbolo, sigla, foto nem bandeira reconhecível.
- **Fatos e documentos fora do jogo.** Todo acontecimento tem ficha em `/acontecimentos/<slug>/`, toda decisão está na página da pessoa, e a trajetória completa continua em `/politicos/<slug>/`, na comparação e na metodologia. A lista de fases e o resumo levam a esses endereços.

## Controles

Ninguém dirige o boneco (D-137). Tudo o que se faz na cena é ativar um botão.

| Onde | Abrir o marco ou um registro | Seguir | Fechar uma janela |
| --- | --- | --- | --- |
| Toque ou mouse | Tocar na pasta, ou no botão **Abrir o marco** | **Continuar** | O botão da janela |
| Teclado | Tab até a pasta ou o botão, e Enter ou espaço | Tab até **Continuar**, e Enter | Esc, ou o botão da janela |

- As pastas do cenário são botões da página, postos sobre o desenho, com área de toque de 52 pixels. A do marco tem o rótulo "Abrir" e um anel no chão; as de explorar, um sinal de mais.
- Ativar uma pasta faz o boneco andar sozinho até o lado dela, por um caminho curto, em no máximo 1,6 segundo, e então o conteúdo abre. A caminhada é enfeite: não é necessária, e com movimento reduzido não acontece.
- A câmera mostra a sala inteira na área que o cartão da fase e o botão principal deixam livre. Em celular em pé, o cartão vai de um lado ao outro, com os três caminhos (**Ler sem o cenário**, **Fases**, **Como funciona**) em uma linha acima dele; deitado, a cena fica ao lado do cartão.
- Em zoom pequeno, a pasta opcional que encostaria em outra sai da cena e continua na lista da fase. A do marco fica sempre.
- A porta do cenário abre quando a fase termina. É sinal, e não passagem.
- As janelas do jogo não aceitam toque nem clique por um terço de segundo ao abrir, para um segundo toque dado por reflexo não fechar o que acabou de abrir. O teclado não espera.
- O dedo sobre a cena ainda rola a página na vertical.

## Acessibilidade

- **Tudo pode ser feito sem o cenário,** em **Ler sem o cenário**, com o mesmo conteúdo e o mesmo progresso.
- **Foco (D-140).** Cada janela prende o foco enquanto está aberta e fecha com Esc. Fechar devolve o foco ao controle que a abriu. Mudar de fase leva o foco ao começo dela: a pasta do marco, com o cenário, e o título da fase, na leitura. Responder leva o foco ao passo seguinte, com o resultado à vista. Com uma janela aberta, a cena e os botões sobre ela saem da tabulação (`inert`).
- **O menu do site continua por cima.** As janelas do jogo ficam em uma camada própria, abaixo do cabeçalho.
- **Leitores de tela.** A cena é um grupo com nome ("Cenário da fase: …. É uma representação."), e o desenho fica fora da árvore de acessibilidade; cada pasta é um botão com nome ("Abrir o marco: …", "Explorar: …"). A instrução do cartão e o resultado da atividade são anunciados (`role="status"`); o humor é texto comum, com a camada dita ("Humor do Escrivão, ficção"). **Nenhum leitor de tela foi usado na conferência.**
- **Movimento reduzido.** Com `prefers-reduced-motion`, o boneco não anda, nada balança nem pisca, a porta abre de uma vez, e o quadro só é refeito quando algo muda. As regras são as mesmas.
- **Alvos de toque (D-148).** Em celular, todo controle das telas do jogo tem ao menos 44 pixels de altura e de largura: os botões, as pastas, os caminhos (os links que levam a outra tela) e os títulos dos documentos nas listas de fontes. Uma jornada mede todos eles em 360×640 e em 390×844. Com mouse em tela larga, os títulos dos documentos ficam na altura do texto. Os links no meio de uma frase fora das telas do jogo, como os do crédito de cada retrato na entrada, têm a altura da linha.
- **Contraste.** Os textos usam os tokens do atlas e entram na passagem de acessibilidade (`npm run audit:a11y`).

## Progresso

- Um progresso por personagem, em `localStorage`, na chave `atlas-politico:jogo:<personagem>`, com as fases de todas as salas. As preferências do jogo (o humor do Escrivão e a leitura sem o cenário) ficam em outra chave, `atlas-politico:jogo:preferencias`, iguais para os dois personagens.
- **Formato 6** (D-135): por fase, se a explicação foi aberta, como a atividade foi concluída (pela resposta ou pela explicação), quantas respostas foram dadas e a assinatura do que decide a resposta; por sala, a fase em que a pessoa parou. Não há situação de bloqueio.
- **Onde se continua.** Na fase em que a pessoa parou, se ela não foi concluída; senão, na primeira não concluída depois dela; com tudo concluído, na última, de onde se chega ao resumo.
- **A resposta pertence aos dados que a decidem.** A assinatura é o identificador da fase, o tipo da atividade e um resumo do que decide a resposta: na pergunta, as opções e a certa; na ordenação, os registros e as datas. Corrigir a redação não reabre nada. Corrigir o que decide a resposta reabre só aquela fase, com o aviso "O conteúdo desta fase foi corrigido depois da sua resposta, e ela deixou de valer"; o que a pessoa leu e tentou fica (D-130).
- **Migração dos formatos 1 a 5.** O salvo do jogo anterior é lido pelas regras antigas e convertido. As fases que cobrem os registros de um capítulo concluído ganham a marca "período visto na versão anterior"; a atividade nova não é dada como respondida, nem a explicação como lida. As fases que não tinham capítulo, como a origem, continuam novas. O que estava salvo fica guardado, inteiro, dentro do formato novo. A correspondência entre capítulos e fases está em [GAME-TRAIL.md](GAME-TRAIL.md).
- **Dados inválidos viram começo, e não erro.** Versão desconhecida, outro personagem ou forma errada: o jogo começa do início, e a leitura não apaga o que estava guardado. Fase que a edição não tem mais é descartada.
- **Sem armazenamento, o jogo continua.** Em modo privado ou com o armazenamento bloqueado, o progresso fica em uma cópia da página: vale enquanto ela estiver aberta, inclusive ao ir à ficha de um registro e voltar pelo site, e se perde ao recarregar ou fechar. A lista de fases avisa.
- **Apagar o progresso** é uma ação própria, na lista de fases, com confirmação em uma janela do jogo. Apaga o que foi lido e respondido com aquele personagem, na trajetória e nos aprofundamentos; o do outro personagem não muda. Para rever as fases desde o começo não é preciso apagar nada.
- **O endereço não carrega progresso.** `?fase=N` é só a posição da fase. A página de um acontecimento aberta pelo jogo leva `origem=jogo` e o personagem, para oferecer **Voltar ao jogo**.
- Duas abas no mesmo personagem não se sincronizam: cada uma segue com o próprio progresso até recarregar, e fica guardado o que foi gravado por último.

## Arquitetura do jogo

Conteúdo, regras da trilha, estado do jogador, apresentação e desenho ficam em lugares separados, e as fronteiras são as do atlas ([ARCHITECTURE.md](ARCHITECTURE.md)).

| Parte | Onde | O que é | Não faz |
| --- | --- | --- | --- |
| Conteúdo | `content/published/`, pelo pipeline, e `generated/dados/` | As fases, os fatos biográficos, os conceitos, os acontecimentos, as decisões e as propostas, com datas e fontes | Não muda por causa do código do jogo |
| Recorte para o jogo | `src/lib/game/content.ts` | O personagem, as fases da sala aberta e só os registros que elas apontam, com as fontes resolvidas e a situação da revisão; das outras salas, só os identificadores e as assinaturas. Montado no build | Não escreve texto |
| Regras da trilha | `src/lib/game/trail.ts` | Abrir, responder, concluir pela explicação, a ordem certa pelas datas, a assinatura da atividade e a ordem das opções na tela | Não guarda estado |
| Progresso | `src/lib/game/progress.ts`, `legacy.ts`, `storage.ts`, `preferences.ts` | O que foi lido e respondido por fase, onde continuar, o formato salvo com a migração, o armazenamento e as preferências | Não conhece a interface |
| Endereço | `src/lib/game/query.ts` | O que `?fase=N` e `?leitura=1` pedem, e se o endereço é o desta página | Não leva progresso |
| Salas | `src/lib/game/rooms.ts` | A trajetória e os aprofundamentos, com nome e descrição | Não é cena nem categoria |
| Apresentação | `src/lib/game/presentation.ts` | O cenário e a figura de cada fase, por identificador | Não afirma nada sobre as pessoas |
| Cartão de decisão | `src/lib/data/decisions.ts` | A visão de leitura de um voto, de um ato ou de uma atuação legislativa, a mesma do atlas | Não escreve fato |
| Escrivão | `src/lib/game/escrivao/` | O catálogo de falas em duas camadas, o seletor puro e a validação | Não cita pessoa nem partido; não usa IA |
| Contexto sensível | `src/lib/game/sensitivity.ts` | A lista de registros sensíveis e a regra da fase | Não avalia texto: olha identificadores |
| Ficha judicial | `src/lib/game/judicial.ts` | A natureza de cada episódio de processo e as decisões relacionadas, por identificador | Não escreve fatos novos |
| Cobertura | `src/lib/game/coverage.ts` | A matriz que gera [GAME-COVERAGE.md](GAME-COVERAGE.md) e as exclusões justificadas, hoje vazias | Não decide fases |
| Cenários | `src/lib/game/scenes/` | O mapa de cada cena, os objetos, a paleta e as posições das pastas | Não conhece o desenho |
| Mundo | `src/lib/game/world/` | A projeção isométrica, a grade, o caminho do boneco e a câmera | Não desenha |
| Desenho | `src/features/game/draw/` | Personagens por época, as nove artes de ambiente (`arts/`), objetos e a pasta, por código | Não conhece regras |
| Motor | `src/features/game/engine/` | O laço de animação e a ordem de profundidade | Não conhece fases |
| Interface | `src/features/game/` | A casca (`GameShell`), o palco (`GameStage`), o que fica sobre a cena (`ui/Hud`), a fase (`ui/PhaseContent`), as janelas (`ui/dialogs`), os cartões (`ui/RecordCard`) e a entrada (`CharacterSelect`) | Não lê arquivos |
| Rotas | `src/app/jogo/` | `/jogo/`, `/jogo/[personagem]/` (a trajetória) e `/jogo/[personagem]/[sala]/` (os aprofundamentos), geradas no build | |

`src/lib/game/` é puro: sem React, sem arquivos, sem o Zod. O ESLint confere, como nas outras camadas.

### Cena e arte

Uma **cena** (`SceneId`) é o cenário de uma fase: mapa, objetos, paleta e posições das pastas, a primeira delas a do marco. Uma **arte** (`SceneArtId`, em `src/features/game/draw/arts/`) é o que desenha piso, paredes, porta e materiais. Cada cena aponta a arte que a desenha, e duas cenas podem dividir uma arte com paleta e disposição próprias. São dezessete cenas e nove artes: salão de sindicato, plenário de constituinte, salão de assembleia, plenário de senado, comitê de campanha, sala de audiências (duas cenas), gabinete, sala de comissão, auditório de convenção (duas cenas) e seis salas de arquivo, que reaproveitam as artes do gabinete e da sala de comissão com paletas próprias: duas para as fases de origem e quatro para os aprofundamentos. Testes conferem que toda cena é usada por alguma fase, que toda fase tem a linha de apresentação dela, que há caminho a pé do início até o lado de cada pasta e que duas cenas da mesma arte têm paletas diferentes (D-112).

### Por que canvas 2D, e não uma biblioteca de jogo

- A cena é pequena: uma sala de 12 por 9 células e uns vinte objetos. O canvas 2D dá conta, com um cuidado: o que é fixo é desenhado uma vez (abaixo).
- A stack instalada não tem motor de jogo, e o projeto evita dependência nova sem necessidade.
- A arte é vetorial, desenhada por código: não há folha de sprites para carregar, o traço acompanha a densidade da tela e o zoom, e os recursos são todos do próprio projeto.
- O mapa do atlas já usa WebGL. O jogo não usa: as páginas do jogo não têm mapa, e as páginas com mapa não têm cena.

### Desenho por quadro

O cenário tem milhares de traços, e refazê-los a cada quadro custava caro. Por isso o que não muda de um quadro para o outro é desenhado uma vez, em telas à parte, e copiado: as paredes de trás com o piso e os detalhes de chão, os parapeitos da frente e cada objeto parado (D-106). A cada quadro, de novo, só o que se move: o personagem, o guia, as pastas, a porta, a bandeira e a planta. Com movimento reduzido, nada disso se move, e o quadro só é refeito quando o boneco anda ou a porta muda. A cadência medida está em [PERFORMANCE.md](PERFORMANCE.md), seção Páginas do jogo (`npm run measure:game`); é medição de laboratório, e não prevê um aparelho real.

### Carregamento

- O palco (canvas e laço) e o desenho ficam em um pacote à parte, pedido só nas páginas do jogo com o cenário. A entrada do jogo pede só a prévia. Nenhuma outra página do atlas pede código do jogo, e a leitura sem o cenário não pede o palco.
- A entrada do atlas só adianta a página do jogo quando a pessoa aponta para o acesso.
- O HTML do build traz a primeira fase da sala: o cartão, com a posição, o período, o título e a instrução, e os botões. A cena, a fase pedida pelo endereço e o progresso entram no navegador, depois da hidratação.
- **Se o pacote do palco não chega,** ou o navegador não dá o canvas, a página continua de pé: no lugar da cena aparece um aviso com **Ler sem o cenário** (e **Recarregar a página**, quando foi o pacote).
- Nenhuma imagem é pedida na cena, e nenhum pedido vai a outro domínio. `tests/export/jogo.spec.ts` confere tudo isso na saída estática.

### Ida e volta entre o jogo e as fichas

O acontecimento aberto no jogo tem o link **Abrir a ficha completa no atlas**, para `/acontecimentos/<slug>/?origem=jogo&personagem=<slug>`. A página do acontecimento lê esse contexto e mostra **Voltar ao jogo** antes dos outros retornos. Quem volta chega à trajetória da pessoa, na fase da retomada: a primeira ainda não concluída a partir de onde estava. Quem abriu a ficha de dentro de um aprofundamento também volta à trajetória, e não a ele. A decisão aberta no jogo leva ao cartão dela na página da pessoa.

## Direção visual

- **2.5D isométrico, desenhado por código.** Célula de 64 por 32 pixels, personagens de corpo inteiro, paredes de fundo em pé e parapeito baixo na frente, para o interior ficar à vista.
- **A identidade do atlas como base.** Papel e grafite, contorno fino, luz do alto à esquerda, sombra elíptica no chão. O laranja queimado do atlas fica reservado ao que pede ação: a marca e a etiqueta da pasta, o anel sob a pasta do marco, a placa e as setas da porta aberta.
- **Personagens por época.** Os dois têm três figuras cada, com o mesmo esqueleto, o mesmo traço e o mesmo ciclo de caminhada: Lula de camisa de mangas dobradas, cabelo e barba escuros (primeiros anos), de terno com cabelo e barba grisalhos (anos intermediários) e de terno com a barba branca (anos recentes); Flávio Bolsonaro sem barba, de terno cinza (primeiros anos), com a barba rente (anos intermediários) e com fios mais claros e terno escuro (anos recentes). O Escrivão, de colete, óculos e pasta, não muda. Nenhum tem cor, símbolo ou gesto de partido.
- **Um lugar por período.** Cada cena tem piso, paredes, objetos e cores próprios: ladrilho vinílico, cortiça com papéis e cartazes sem texto no comitê de campanha; lambri alto, tábua corrida, bancada do juízo e fileiras de público nas salas de audiências; painéis de madeira, carpete de lã, sofás e mapa sem nomes no gabinete; painéis acústicos, placas de carpete e tela apagada na sala de comissão; cortinas de palco, treliça, telão apagado e cadeiras em fileiras nos auditórios de convenção. As fases de origem e os aprofundamentos ficam em salas de arquivo.
- **Objetos legíveis.** A pasta é o único objeto com papel pardo e etiqueta em acento. A porta é um portal mais alto que o personagem, com a folha de cada ambiente.
- **Animações curtas com função.** A pasta balança de leve; o boneco anda até ela; a porta gira e a placa sobre ela acende quando a fase termina.
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
| Regras da trilha, progresso e migração dos formatos 1 a 5, armazenamento e preferências, endereço, cenas, caminho do boneco e câmera, ficha judicial, contexto sensível, o catálogo e a seleção do Escrivão, o registro da arte, a matriz de cobertura | `tests/game-*.test.ts` (Vitest) |
| O contrato e a integridade das fases, dos fatos biográficos e dos conceitos; o conteúdo publicado contra as regras de leitura curta, de anos e números, de termos e de tipos de registro; as propostas e os fatos da edição | `tests/game-content.test.ts`, `tests/game-phases.test.ts`, `tests/proposals.test.ts` |
| A entrada, o ciclo de uma fase com erro e nova tentativa, a leitura no lugar da resposta, a ordenação, os registros opcionais e as fontes, o ciclo só com o teclado e a volta do foco, a lista de fases, continuar e começar do início, o aviso de retomada, a migração de um salvo anterior, o endereço, Voltar e Avançar, os aprofundamentos, a leitura sem o cenário, a falta do canvas, o HTML sem JavaScript, o Escrivão e o contexto sensível, as fases de processos e de 2026, o celular a 360 e a 390 pixels e deitado, com a área de toque de todo controle medida, e a caminhada do boneco com e sem movimento | `tests/e2e/jogo.spec.ts`, no servidor de desenvolvimento (`npm run test:e2e`) e sobre a saída estática (`npm run test:journeys`) |
| O que cada página pede, o palco em pacote à parte, a leitura que não baixa o palco, a página sem mapa, a página sem JavaScript e a falha de um pacote | `tests/export/jogo.spec.ts` (`npm run test:export`) |
| Contraste, alvos e ordem de foco de dezessete telas do jogo (a entrada, a cena dos dois personagens, os aprofundamentos, a ajuda com o humor desligado, a fase aberta, a resposta errada e a certa, a ordenação, a fase de processos, um registro, uma decisão, a lista de fases, o resumo, a leitura sem o cenário e a retomada), em quatro larguras | `npm run audit:a11y` |
| Carregamento e cadência de quadros das páginas do jogo, em laboratório | `npm run measure:game -- --rotulo <nome>` |
| Capturas da trilha | `docs/capturas/jogo-trilha/` (`npm run capture:game`) |
| A galeria da arte, peça por peça | `node scripts/capture-art.mjs --saida <pasta>`, com `npm run dev` rodando |

O toque e o layout de celular foram conferidos em emulação. **Nenhum aparelho real foi usado, nenhum leitor de tela, e nenhuma pessoa jogou em sessão de validação.** Os resultados de cada passagem estão em [STATUS.md](STATUS.md).

## Como acrescentar uma fase

1. Escreva a fase no conteúdo, em rascunho: pessoa, sala, posição, período, objetivo, marco, de dois a quatro blocos de explicação (de 60 a 100 palavras no total), os conceitos que ela define, a atividade, os registros para explorar e as lacunas. Cada bloco aponta os registros publicados que o sustentam; se o fato não está em registro nenhum, ele entra antes, como registro, com documento lido.
2. Se a atividade for de ordem, as datas dos registros têm de decidir a ordem. Se for pergunta, a resposta tem de estar na explicação.
3. Rode `npm run data:validate`: o contrato e a integridade acusam referência inexistente ou de outra pessoa, texto longo, marco fora do período e ordenação que as datas não decidem. Promova a fase com a revisão registrada e a entrada em `alteracoes` ([DATA-PIPELINE.md](DATA-PIPELINE.md)). A revisão é assistida por IA até uma pessoa conferir.
4. Acrescente a linha da fase em `src/lib/game/presentation.ts`: o cenário e a época. Se precisar de cena nova, crie-a em `src/lib/game/scenes/`, apontando uma arte existente ou uma nova em `src/features/game/draw/arts/`: o mapa, os objetos, a paleta e as posições das pastas, a do marco primeiro. Nenhuma pasta fica colada à porta nem atrás dela (o portal é mais alto que o personagem e encobre o que fica na coluna dele, poucos passos para o fundo), nem atrás de um objeto alto. O teste das cenas recusa as duas primeiras; a terceira só se vê olhando o cenário.
5. Se um registro apontado for episódio de processo, acrescente a ficha em `src/lib/game/judicial.ts`, só com o que o contexto do registro diz. Se for de prisão ou de violência e não for episódio de processo, acrescente o identificador em `REGISTROS_SENSIVEIS` (`src/lib/game/sensitivity.ts`); pôr ou não na lista é decisão editorial.
6. Rode `npx vitest run tests/game-phases.test.ts tests/game-content.test.ts tests/game-coverage.test.ts tests/game-scenes.test.ts tests/game-judicial.test.ts tests/game-sensitivity.test.ts`, `npm run game:coverage` e `npm run review:human`.
7. Olhe o cenário em `/dev/jogo-arte/` e percorra a fase com o cenário, sem ele e só com o teclado.

## O que falta

1. **Revisão humana do conteúdo,** inclusive dos textos das fases, das perguntas e das definições ([HUMAN-REVIEW.md](HUMAN-REVIEW.md)), e **validação com pessoas que conhecem pouco de política, com celular real** ([USER-VALIDATION.md](USER-VALIDATION.md)). Ninguém mediu se o ciclo é entendido sem ajuda nem quanto tempo uma trajetória leva.
2. **Aparelho real, leitor de tela e outros navegadores,** que não foram usados.
3. **As decisões editoriais do responsável pelo projeto:** as amostras e as regras de escolha (D-143), o limite de vinte acontecimentos (D-144), a escolha das frases das propostas (D-138), o tom do Escrivão e a lista de registros de contexto sensível (D-142).
4. **Domínio, canal de correção e indexação** ([DEPLOY.md](DEPLOY.md)).
5. **Som,** deixado para depois.
