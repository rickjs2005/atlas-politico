# Trilha simples do jogo: fluxo, cobertura e migração

Documento curto do redesenho pedido em 11 de outubro de 2026 (`Atlas-Politico-Analise-e-Prompt-Jogo-Simples-2026-10-11.md`, trazido pelo responsável pelo projeto). Diz o que muda, por quê, e o que fica como estava. As regras em vigor depois da mudança estão em [GAMEPLAY.md](GAMEPLAY.md); as decisões, em [DECISIONS.md](DECISIONS.md), de D-133 em diante.

## O problema que o redesenho resolve

O jogo anterior pedia que a pessoa aprendesse a andar, alcançar, recolher todas as pastas, cumprir uma tarefa sobre documentos e só então atravessar uma saída. A confirmação "Tarefa concluída" aparecia com a porta ainda fechada. A trajetória começava em 1975 (Lula) e em 2002 (Flávio Bolsonaro), sem a origem de nenhum dos dois, e a entrada oferecia seis caminhos de uma vez.

O objetivo passa a ser outro: quem conhece pouco de política sai sabendo de onde cada um veio, que cargos ocupou, o que esses cargos fazem, exemplos documentados do que fez neles e onde conferir. O jogo não calcula afinidade, nota nem vencedor.

## O ciclo único

**Tocar no marco, ler uma explicação curta, responder uma atividade ou ler a explicação dela, continuar.**

1. A pessoa escolhe uma trajetória. Quem nunca jogou começa pela origem; quem já jogou vê "Continuar de onde parei", com a fase e o período, e "Ver desde o início". Rever o início é navegação: não apaga nada.
2. Cada fase mostra "Fase X de Y", o período e um título curto, sem abrir painel.
3. O cenário mostra o boneco e um marco em destaque. Tocar no marco, ou no botão "Abrir o marco", faz o boneco andar um caminho curto até ele (com movimento reduzido, não anda) e abre a explicação. O marco é um botão da página, alcançável pelo teclado.
4. A explicação tem de 60 a 100 palavras, com as definições dos termos na primeira vez que aparecem e as fontes em "Ver fontes".
5. A atividade é uma pergunta com até três opções, ou uma ordenação curta quando as datas decidem a ordem. Ela só usa o que a explicação acabou de dizer. Errar explica e deixa tentar de novo. "Ver a explicação e continuar" também conclui a fase.
6. Atividade concluída libera "Continuar". Os outros registros do período ficam em "Explorar este período" e não seguram nada.
7. "Ler sem o cenário" fica à vista desde o início e traz as mesmas fases, com os mesmos textos, atividades e fontes. É também o caminho quando o navegador não desenha a cena, e o que a página entrega sem JavaScript.
8. No fim, um resumo do que foi visto, das lacunas, o caminho para a outra trajetória e para a comparação. Sem troféu e sem juízo.
9. Economia e Segurança pública continuam como aprofundamento, identificadas pelo assunto e pelos anos, com o caminho de volta ao início da vida.

Não há fase bloqueada: toda fase abre pela lista de fases. O progresso guarda o que foi lido e respondido, e serve para sugerir o próximo passo.

## O que sai, o que fica

| Sai do percurso principal | Fica |
| --- | --- |
| Andar livremente, colisão, alcance, direcional de toque e botão de ação | Os bonecos, os cenários e o desenho por código |
| Recolher todas as pastas para abrir a saída (D-109) | Todos os acontecimentos e decisões publicados, acessíveis no jogo |
| Tarefas de documento, de lugar e de decisão em duas etapas | A ficha judicial, o contexto sensível sem humor, o humor desligável |
| Capítulos bloqueados em sequência | Progresso por personagem no navegador, com versão e migração |
| Seis entradas com o mesmo peso | As rotas públicas `/jogo/`, `/jogo/<pessoa>/` e `/jogo/<pessoa>/<sala>/` |

## Onde o texto educativo mora

A explicação de uma fase é texto novo sobre fatos. Por isso não fica no código: entra pelo pipeline de conteúdo, com estado editorial, revisão identificada e a mesma barreira de publicação dos demais registros. Três coleções novas (D-134):

| Coleção | O que guarda | Evidência |
| --- | --- | --- |
| `fatosBiograficos` | Origem, família, migração, formação e trabalho antes da vida pública | Citações, como um acontecimento |
| `conceitos` | A definição simples de um termo cívico (sindicato, veto, denúncia) | Citação do texto oficial que a sustenta |
| `fasesDoJogo` | A fase: pessoa, sala, ordem, período, objetivo, marco, blocos de explicação, atividade, o que explorar e as lacunas | Cada bloco aponta os registros que o sustentam; a fase não cita fonte por conta própria |

O cenário e a figura de cada fase são apresentação e ficam no código (`src/lib/game/presentation.ts`), por identificador da fase.

A edição 0.3.0 ganhou ainda duas coleções que a trilha usa e que não são do jogo: `atuacoesLegislativas`, a autoria e a relatoria de matérias (D-136), e `propostasEleitorais`, as frases do documento que cada candidatura registrou no TSE (D-138). As atuações aparecem também na página da pessoa e na comparação, entre as decisões; as propostas, na comparação, por área.

Regras conferidas por teste: todo bloco de explicação aponta ao menos um registro publicado da mesma pessoa (ou um conceito); todo ano escrito em um bloco aparece nos registros que ele aponta; a opção certa existe entre as opções; a ordenação só é pedida quando as datas decidem a ordem; todo acontecimento e toda decisão publicados aparecem em alguma fase, como marco ou em "Explorar este período".

## Progresso e migração

O formato salvo passa à versão 6 (D-135): por fase, se a explicação foi aberta, como a atividade foi concluída (resposta certa ou leitura da explicação) e a assinatura do que decide a resposta, mais a fase em que a pessoa parou em cada sala.

| Situação de quem volta | O que acontece |
| --- | --- |
| Progresso nas versões 1 a 5 | É lido pelas regras antigas e convertido. O que estava salvo fica guardado, inteiro, dentro do novo formato |
| Capítulo antigo concluído | As fases novas que cobrem os mesmos registros ficam marcadas como "vista na versão anterior". A atividade nova não é dada como respondida |
| Fases de origem, que não existiam | Aparecem como novas, com aviso. "Continuar de onde parei" leva à fase seguinte ao último capítulo concluído; "Ver desde o início" leva à origem |
| Correção de um fato que decide uma resposta | Só a resposta daquela fase deixa de valer, com aviso. O resto fica |
| Armazenamento indisponível ou dado inválido | O jogo funciona com o progresso da visita; dado inválido vira começo, e não erro |

Apagar o progresso é uma ação própria, com confirmação, na lista de fases. Começar do início nunca apaga.

### Capítulos antigos e fases novas

A tabela é congelada (`LEGACY_CHAPTER_PHASES`, em `src/lib/game/legacy.ts`): diz, para cada capítulo que existiu, quais fases da trilha cobrem os mesmos registros. Um capítulo que reunia dois períodos aponta duas fases. As fases que não tinham capítulo ficam sem marca e aparecem como novas: a origem das duas pessoas, o segundo governo de Lula e a leitura dos votos no Senado, que antes só existia nas salas temáticas.

| Capítulo antigo | Fases da trilha |
| --- | --- |
| Lula 1, sindicato, greves e partido | 2, Da fábrica ao sindicato |
| Lula 2, Constituinte e disputas presidenciais | 3, Um partido e uma Constituição; 4, Quatro disputas pela Presidência |
| Lula 3, Presidência: eleição e reeleição | 4, Quatro disputas pela Presidência; 5, O primeiro governo |
| Lula 4, nomeação suspensa, processos e prisão | 7, Condenação, prisão e anulação |
| Lula 5, anulação, terceira eleição e intervenção | 7, Condenação, prisão e anulação; 8, De volta à Presidência |
| Lula 6, convenção e primeiro turno de 2026 | 9, A eleição de 2026 |
| Flávio Bolsonaro 1, Assembleia e disputa pela Prefeitura | 2, A primeira eleição; 3 e 4, as duas fases da Alerj |
| Flávio Bolsonaro 2, Senado: eleição, Mesa e partido | 5, Do Rio de Janeiro para o Senado |
| Flávio Bolsonaro 3, denúncia, partidos e decisões judiciais | 6, Denúncia, anulação e rejeição |
| Flávio Bolsonaro 4, liderança da Minoria, relatoria e comissão | 7, Líder, relator e presidente de comissão |
| Flávio Bolsonaro 5, indicação, convenção e primeiro turno | 9, A eleição de 2026 |
| Economia e Segurança pública, de cada um | O aprofundamento do mesmo tema |

A marca diz só que a pessoa já passou por aquele período. Quem tinha a trajetória antiga de Lula concluída, por exemplo, encontra as fases 2, 3, 4, 5, 7, 8 e 9 com "período visto na versão anterior" e as fases 1 e 6 como novas, e continua na fase 9, com a origem oferecida à parte.

## O relato de "entrar em 2025"

A análise não reproduziu um início em 2025 em partida nova. O que o código anterior permitia, conferido em 11 de outubro de 2026:

| Caminho | Primeiro período na tela |
| --- | --- |
| `/jogo/lula/`, sem progresso salvo | 1975 a 1980 |
| `/jogo/flavio-bolsonaro/`, sem progresso salvo | 2002 a 2016 |
| Botão de uma sala temática na entrada (quatro botões "Começar") | 2023 a 2025, 2023 a 2026, 2023 a 2024 ou 2024 a 2025 |
| Voltar com progresso salvo | O primeiro capítulo ainda aberto; para Flávio Bolsonaro, os dois últimos eram 2023 a 2025 e 2025 a 2026 |

Não há registro de qual desses caminhos a pessoa usou. Os dois últimos explicam um início em 2025 sem defeito de código.

Durante a construção da trilha apareceu um terceiro caminho, este um defeito, e da trilha nova: em uma navegação interna do site, a página do jogo é desenhada um instante antes de o endereço dela entrar no navegador. O jogo lia o pedido `?fase=1` cedo demais, não o encontrava e abria a fase em que a pessoa tinha parado. Para quem já tinha progresso, "Ver desde o início" e "Ir para o início da vida" levavam ao fim da trajetória. O defeito foi corrigido antes de qualquer versão com ele ser publicada (D-139) e não explica o relato original, que é sobre o jogo anterior.

O que a trilha faz com os três caminhos:

- **As salas temáticas** se apresentam como aprofundamento, na entrada e no cartão da fase, com o caminho para o início da vida.
- **A volta** diz a fase e o período no botão, antes de abrir ("Continuar de onde parei: fase 9, 2026"), e oferece "Ver desde o início", com o ano.
- **Quem chega sem pedir fase,** por um link direto ou pelo menu, e cai depois da primeira, lê no cartão "Você continua de onde parou", ou "O jogo mudou desde a sua última visita: a trajetória agora começa pela origem", com o botão "Ver desde o início" e o ano.
- **O jogo só lê e só escreve o endereço da própria página,** e só abre uma fase depois de ler o progresso guardado e esse endereço. As jornadas cobrem a entrada por navegação interna, com e sem progresso.

## Matriz

A matriz por pessoa (período, objetivo, marco, registros apontados, atividade, lacunas e revisão de cada fase, e onde aparece cada acontecimento, decisão, fato biográfico e proposta) é gerada dos dados em [GAME-COVERAGE.md](GAME-COVERAGE.md) (`npm run game:coverage`). A pesquisa do conteúdo novo, com o que foi conferido, o que entrou, o que ficou de fora e o que o registro não comprova, está em [../research/trilha-2026-10.md](../research/trilha-2026-10.md). Ela não registra o motivo da escolha de cada marco: os marcos foram escolhidos na redação das fases, com assistência de IA, e a escolha fica para a revisão humana.

## Limites

- Meta de desenho: de sete a nove fases por trajetória, perto de dez a quinze minutos. Ninguém mediu esse tempo com pessoas.
- "Marcos documentados da trajetória", nunca "toda a vida" nem "todas as propostas".
- Toda a conferência é assistida por IA. A revisão humana continua pendente. O site está no ar em endereço provisório, sem indexação, por decisão do responsável pelo projeto (D-147); a barreira de publicação continua recusando.
- Nenhuma pessoa testou a compreensão das fases, nenhum aparelho real foi usado e nenhum leitor de tela.
